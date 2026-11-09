import test from "node:test";
import assert from "node:assert/strict";
import { professionList } from "../data/professions.js";
import { inputFor, complete } from "./helpers.js";
test("640 个策略、职业、种子及加班样本：状态合法且策略存在可解释差异", () => {
  const summaries = {};
  for (const profession of professionList) {
    summaries[profession.id] = {};
    for (const preset of ["balanced", "efficiency", "quality", "social"]) {
      const scores = [];
      for (let seed = 1; seed <= 20; seed++)
        for (const choice of [false, true]) {
          const run = complete(inputFor(profession.id, seed, preset), choice),
            s = run.finalState;
          assert.equal(run.snapshots.length, 12);
          assert.ok(
            run.performance.totalScore >= 0 &&
              run.performance.totalScore <= 100,
          );
          assert.ok(s.energy >= 0 && s.energy <= 100);
          assert.ok(s.overwork >= 0 && s.overwork <= 100);
          assert.ok(s.tasks.every((t) => t.doneWork <= t.requiredWork + 0.01));
          assert.ok(
            s.tasks
              .filter((t) => t.completed)
              .every((t) =>
                t.dependsOn.every(
                  (id) => s.tasks.find((x) => x.id === id).completed,
                ),
              ),
            `${profession.id}/${seed} 依赖交付不一致`,
          );
          scores.push(run.performance.totalScore);
        }
      summaries[profession.id][preset] = {
        average: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(
          2,
        ),
        min: Math.min(...scores),
        max: Math.max(...scores),
      };
    }
    assert.ok(
      new Set(Object.values(summaries[profession.id]).map((x) => x.average))
        .size > 1,
      "不同策略必须产生工作后果差异",
    );
  }
  console.log("策略样本统计", JSON.stringify(summaries));
});
