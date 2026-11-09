import { clamp, round } from "./prng.js";
import { progress } from "./strategies.js";
export const scoreDefinitions = [
  { id: "delivery", label: "任务交付", weight: 0.32 },
  { id: "boss", label: "老板满意", weight: 0.16 },
  { id: "client", label: "客户满意", weight: 0.14 },
  { id: "colleague", label: "同事好感", weight: 0.12 },
  { id: "health", label: "体力与过劳", weight: 0.14 },
  { id: "risk", label: "职业代价", weight: 0.12 },
];
export function scoreRun(run) {
  if (run.snapshots.length !== 12 || run.finalState.phase !== "completed")
    throw new Error("只对完整 12 轮结算");
  const s = run.finalState;
  const critical = s.tasks.filter((t) => t.isCritical);
  // 权重总计 1；加班只经由工作、关系、疲劳和风险影响结果，不读取选择直接计分。
  const values = {
    delivery:
      0.55 * progress(s) +
      0.3 * s.quality +
      ((0.15 * critical.filter((t) => t.completed && t.accepted).length) /
        critical.length) *
        100,
    ...s.relationships,
    health: 0.7 * s.energy + 0.3 * (100 - s.overwork),
    risk: 100 - s.professionState.risk,
  };
  const dimensions = scoreDefinitions.map((d) => ({
    ...d,
    rawScore: round(clamp(values[d.id])),
    weightedScore: round(clamp(values[d.id]) * d.weight),
  }));
  const totalScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.rawScore * d.weight, 0),
  );
  const grade =
    totalScore >= 90
      ? "S"
      : totalScore >= 80
        ? "A"
        : totalScore >= 65
          ? "B"
          : totalScore >= 50
            ? "C"
            : "D";
  const keyEvents = [...run.logs]
    .filter((l) => l.importance === "key")
    .sort((a, b) => b.impact - a.impact || a.sequence - b.sequence)
    .slice(0, 8)
    .sort((a, b) => a.sequence - b.sequence);
  const bottlenecks = [...dimensions]
    .sort(
      (a, b) => (100 - b.rawScore) * b.weight - (100 - a.rawScore) * a.weight,
    )
    .slice(0, 2)
    .map((d) => ({
      ...d,
      reason: {
        delivery: "剩余工作、未验收交付与错误降低了交付得分。",
        boss: "进展反馈、截止条件与响应期待影响了老板评价。",
        client: "变更处理和实际交付影响了客户满意度。",
        colleague: "求助回应和沟通延期改变了同事评价。",
        health: "强度和中断消耗体力，过劳压低了健康维度。",
        risk: "职业风险累积，后续工作和交付付出了代价。",
      }[d.id],
    }));
  return {
    scoringVersion: 1,
    totalScore,
    grade,
    dimensions,
    bottlenecks,
    keyEvents,
    completion: progress(s),
    efficiency: round((totalScore * 100) / Math.max(1, s.metrics.effort)),
    effortSummary: {
      intensity: run.input.strategy.intensity,
      effort: s.metrics.effort,
      energyCost: s.accumulatedEnergyCost,
      finalEnergy: s.energy,
      overtime: run.overtimeChoice,
    },
  };
}
