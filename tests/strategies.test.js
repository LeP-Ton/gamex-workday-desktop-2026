import test from "node:test";
import assert from "node:assert/strict";
import { inputFor, complete } from "./helpers.js";
import { validateRunInput } from "../sim/schema.js";
import { simulateRegular } from "../sim/engine.js";
import { responseDecision } from "../sim/strategies.js";
test("首个匹配规则决定动作，互斥与规则上限都被校验", () => {
  const input = inputFor(),
    state = simulateRegular(input).initialState;
  state.tasks.forEach((t) => (t.doneWork = t.requiredWork * 0.9));
  const m = { source: "boss", intent: "help", urgency: "normal", round: 1 };
  input.strategy.priorityRules = ["finish_first", "boss_first"];
  assert.equal(responseDecision(m, state, input.strategy).rule, "finish_first");
  input.strategy.priorityRules.reverse();
  assert.equal(responseDecision(m, state, input.strategy).rule, "boss_first");
  input.strategy.priorityRules = ["help_colleague", "defer_colleague"];
  assert.throws(() => validateRunInput(input), /不能/);
  input.strategy.priorityRules = [
    "boss_first",
    "client_first",
    "finish_first",
    "unread_batch",
    "help_colleague",
  ];
  assert.throws(() => validateRunInput(input), /最多/);
});
test("未读超过 5 条的阈值、紧急消息不被交付优先忽略", () => {
  const input = inputFor(),
    state = simulateRegular(input).initialState;
  input.strategy.priorityRules = ["unread_batch"];
  state.messages = Array.from({ length: 5 }, () => ({
    sender: "boss",
    status: "unread",
  }));
  const m = { source: "colleague", round: 0, urgency: "normal" };
  assert.notEqual(
    responseDecision(m, state, input.strategy).rule,
    "unread_batch",
  );
  state.messages.push({ sender: "boss", status: "unread" });
  assert.equal(responseDecision(m, state, input.strategy).rule, "unread_batch");
  input.strategy.priorityRules = ["finish_first"];
  state.tasks.forEach((t) => (t.doneWork = t.requiredWork * 0.95));
  assert.notEqual(
    responseDecision({ ...m, urgency: "urgent" }, state, input.strategy).rule,
    "finish_first",
  );
});
test("拒绝变更不会生成新增工作动作，100% 接受会产生返工", () => {
  const no = inputFor();
  no.strategy.changeAcceptance = 0;
  const yes = structuredClone(no);
  yes.strategy.changeAcceptance = 100;
  assert.equal(
    complete(no).actions.filter((a) => a.kind === "work.change").length,
    0,
  );
  assert.ok(complete(yes).finalState.metrics.acceptedChanges > 0);
  assert.deepEqual(
    complete(no).input.environment,
    complete(yes).input.environment,
  );
});
test("强度为零不凭空产出，极端输入和依赖循环会被拒绝", () => {
  const input = inputFor();
  input.strategy.intensity = 0;
  assert.ok(complete(input).finalState.tasks.every((t) => t.doneWork === 0));
  input.strategy.intensity = 101;
  assert.throws(() => validateRunInput(input));
  input.strategy.intensity = 50;
  input.taskBrief.subtasks[0].dependsOn = ["task-4"];
  assert.throws(() => validateRunInput(input), /循环/);
});
test("预设只填参数，不给名称隐藏加成", () => {
  const input = inputFor();
  assert.deepEqual(
    simulateRegular(input),
    simulateRegular({
      ...input,
      presetId: "efficiency",
      presetName: "超级高手",
    }),
  );
});
