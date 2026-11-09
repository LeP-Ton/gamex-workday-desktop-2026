import test from "node:test";
import assert from "node:assert/strict";
import { createScenario } from "../data/environments.js";
import { presetStrategy } from "../data/parameters.js";
import {
  simulateRegular,
  continueAfterOvertime,
  mergeSegments,
} from "../sim/engine.js";
import { project } from "../playback/projection.js";
export function makeInput(
  professionId = "programmer",
  seed = 2026,
  preset = "balanced",
) {
  return {
    seed,
    professionId,
    ...createScenario(seed, professionId),
    strategy: presetStrategy(professionId, preset),
  };
}
test("程序员完整输入的事件、动作、快照和绩效严格确定", () => {
  const play = () => {
    const regular = simulateRegular(makeInput());
    return mergeSegments(
      regular,
      continueAfterOvertime(regular.checkpoint, false),
    );
  };
  const a = play();
  assert.deepEqual(a, play());
  assert.equal(a.snapshots.length, 12);
  assert.equal(a.finalState.phase, "completed");
});
test("第 10 轮无限等待，检查点 JSON 恢复与连续执行相同", () => {
  const segment = simulateRegular(makeInput());
  assert.equal(segment.snapshots.length, 10);
  assert.equal(segment.checkpoint.phase, "awaiting_overtime_choice");
  assert.throws(() => continueAfterOvertime(segment.checkpoint), /选择/);
  const saved = JSON.stringify(segment);
  const restored = JSON.parse(saved);
  assert.deepEqual(
    continueAfterOvertime(restored.checkpoint, true),
    continueAfterOvertime(segment.checkpoint, true),
  );
  assert.equal(JSON.stringify(segment), saved, "续算不能修改原检查点");
});
test("动作投影在每一轮都与引擎快照一致", () => {
  const regular = simulateRegular(makeInput());
  const run = mergeSegments(
    regular,
    continueAfterOvertime(regular.checkpoint, true),
  );
  for (const snapshot of run.snapshots)
    assert.deepEqual(
      project(run.initialState, run.actions, snapshot.actionEndSequence),
      snapshot.state,
    );
  assert.deepEqual(project(run.initialState, run.actions), run.finalState);
});
test("程序员微信事件确实产生工作动作、变更和代码内容", () => {
  const input = makeInput();
  input.strategy.changeAcceptance = 100;
  const run = simulateRegular(input);
  assert.ok(run.actions.some((a) => a.kind === "chat.reply"));
  assert.ok(run.actions.some((a) => a.kind === "work.change"));
  assert.ok(
    run.actions.some(
      (a) => a.kind === "work.advance" && a.artifactPatches.length,
    ),
  );
  assert.ok(
    run.logs.every((l) =>
      [
        "round",
        "eventId",
        "source",
        "action",
        "triggeredRule",
        "stateDelta",
        "consequence",
        "relatedTaskId",
      ].every((k) => Object.hasOwn(l, k)),
    ),
  );
  assert.ok(
    run.snapshots
      .at(-1)
      .state.artifact.files["refund.ts"].includes("refundOrder"),
  );
});
test("主题、窗口和播放速度不会进入规范化模拟输入", () => {
  const input = makeInput();
  const a = simulateRegular(input);
  assert.deepEqual(
    a,
    simulateRegular({ ...input, osTheme: "windows", speed: 12, windowX: 345 }),
  );
});
test("工作反馈不止回复：产生有父事件的交付物修订", () => {
  for (const professionId of ["programmer", "finance", "product", "designer"]) {
    const regular = simulateRegular(makeInput(professionId));
    const actions = regular.actions.filter((a) => a.kind === "work.feedback");
    assert.ok(actions.length > 0, `${professionId} 未落实反馈`);
    assert.ok(
      actions.every((a) => a.parentEventId && a.artifactPatches.length > 0),
    );
  }
});
