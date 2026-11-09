import test from "node:test";
import assert from "node:assert/strict";
import { professionList } from "../data/professions.js";
import { eventPools } from "../data/events.js";
import {
  adapters,
  simulateRegular,
  continueAfterOvertime,
} from "../sim/engine.js";
import { project } from "../playback/projection.js";
import { inputFor, complete } from "./helpers.js";
for (const { id, name } of professionList) {
  test(`${name}：候选事件、确定性、职业交付物和 12 轮投影完整`, () => {
    assert.ok(eventPools[id].length >= 12);
    const input = inputFor(id, 37);
    const run = complete(input, true);
    assert.deepEqual(run, complete(input, true));
    assert.equal(run.snapshots.length, 12);
    for (const snapshot of run.snapshots)
      assert.deepEqual(
        project(run.initialState, run.actions, snapshot.actionEndSequence),
        snapshot.state,
      );
    for (const d of run.performance.dimensions)
      assert.ok(d.rawScore >= 0 && d.rawScore <= 100);
    assert.ok(
      run.actions.some(
        (a) => a.kind === "work.advance" && a.artifactPatches.length,
      ),
    );
    assert.equal(
      run.finalState.artifact.kind,
      {
        programmer: "code",
        finance: "sheet",
        product: "document",
        designer: "design",
      }[id],
    );
  });
  test(`${name}：恢复后续算不会重复动作或改变输入`, () => {
    const regular = simulateRegular(inputFor(id));
    const original = JSON.stringify(regular);
    const continuation = continueAfterOvertime(
      JSON.parse(original).checkpoint,
      false,
    );
    assert.deepEqual(
      continuation,
      continueAfterOvertime(regular.checkpoint, false),
    );
    assert.equal(JSON.stringify(regular), original);
    assert.equal(continuation.snapshots.length, 2);
  });
}
test("技术债由容忍度累积并增加后续错误概率", () => {
  const low = inputFor();
  low.strategy.special.debtTolerance = 0;
  low.strategy.selfCheck = "never";
  low.strategy.special.refactorOnChange = false;
  const high = structuredClone(low);
  high.strategy.special.debtTolerance = 100;
  assert.ok(
    complete(high).finalState.professionState.risk >
      complete(low).finalState.professionState.risk,
  );
});
test("财务原始错误传播到关联表，核查修正后重新计算", () => {
  const input = inputFor("finance");
  const a = adapters.finance;
  const state = simulateRegular(input).initialState;
  a.work(
    state,
    { ...state.tasks[0], doneWork: 55, requiredWork: 55, completed: true },
    input.strategy,
  );
  const original = state.artifact.sheets[1].rows[1][1];
  a.fail(state);
  assert.notEqual(state.artifact.sheets[1].rows[1][1], original);
  assert.ok(state.artifact.anomalies[0].affected.length > 1);
  a.check(state, input.strategy);
  assert.equal(state.artifact.sheets[1].rows[1][1], original);
  assert.equal(state.artifact.anomalies.length, 0);
});
test("绕过审批不能获得已审批交付", () => {
  const input = inputFor("finance");
  input.strategy.redlineTolerance = "risky";
  input.strategy.special.bypassApproval = true;
  const state = simulateRegular(input).initialState;
  const task = state.tasks.at(-1);
  task.completed = true;
  adapters.finance.work(state, task, input.strategy);
  assert.equal(task.accepted, false);
  assert.equal(task.completed, false);
  assert.equal(task.blocked, true);
  assert.equal(state.artifact.approval, "bypassed");
});
test("产品变更留下修订、增加范围并撤销确认", () => {
  const input = inputFor("product");
  const state = simulateRegular(input).initialState;
  state.artifact.sections[0].confirmed = true;
  state.artifact.baseline = true;
  adapters.product.change(state, input.strategy, state.tasks[0]);
  assert.equal(state.artifact.sections[0].confirmed, false);
  assert.equal(state.artifact.baseline, false);
  assert.ok(state.artifact.revisions.length);
  assert.notEqual(
    state.artifact.revisions[0].before,
    state.artifact.revisions[0].after,
  );
});
test("设计改稿达到上限仍未获认可，不能伪造验收", () => {
  const input = inputFor("designer");
  input.environment.preference = "warm";
  input.strategy.special = {
    revisionLimit: 1,
    multiProposal: false,
    intentStrategy: "intuition",
  };
  const state = simulateRegular(input).initialState;
  const task = state.tasks.at(-1);
  task.completed = true;
  adapters.designer.work(state, task, input.strategy);
  assert.equal(task.accepted, false);
  assert.equal(task.completed, false);
  assert.equal(task.blocked, true);
  assert.equal(state.artifact.approved, false);
});
