import test from "node:test";
import assert from "node:assert/strict";
import { inputFor, complete } from "./helpers.js";
import { scoreRun, scoreDefinitions } from "../sim/scoring.js";
test("六维权重为 1，加班布尔值、主题和效率展示均不直接加减分", () => {
  const run = complete(inputFor());
  assert.equal(
    scoreDefinitions.reduce((n, d) => n + d.weight, 0),
    1,
  );
  const changed = {
    ...run,
    overtimeChoice: !run.overtimeChoice,
    osTheme: "windows",
  };
  assert.equal(scoreRun(changed).totalScore, run.performance.totalScore);
  assert.equal(scoreRun(changed).grade, run.performance.grade);
  assert.ok(
    run.performance.keyEvents.length >= 5 &&
      run.performance.keyEvents.length <= 8,
  );
  assert.throws(() =>
    scoreRun({ ...run, snapshots: run.snapshots.slice(0, 10) }),
  );
});
test("加班效果取决于剩余任务：存在产能收益，也存在体力代价", () => {
  const input = inputFor("designer", 8, "quality");
  const regular = complete(input, false),
    overtime = complete(input, true);
  assert.ok(overtime.finalState.energy < regular.finalState.energy);
  assert.ok(
    overtime.finalState.accumulatedEnergyCost >
      regular.finalState.accumulatedEnergyCost,
  );
  assert.ok(overtime.performance.completion >= regular.performance.completion);
});
