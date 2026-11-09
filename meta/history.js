export function addHistory(records, record) {
  return [record, ...records.filter((r) => r.runId !== record.runId)].slice(
    0,
    50,
  );
}
export function historyRecord(runId, run, createdAt) {
  return {
    storageVersion: 1,
    runId,
    createdAt,
    versions: {
      engine: run.input.engineVersion,
      content: run.input.contentVersion,
      scoring: run.performance.scoringVersion,
    },
    input: run.input,
    overtimeChoice: run.overtimeChoice,
    // 历史保留因果摘要，完整消息数组和交付物补丁只留在当前会话，避免 50 局挤占存储。
    performance: {
      ...run.performance,
      keyEvents: run.performance.keyEvents.map((log) => ({
        ...log,
        stateDelta: log.stateDelta.filter((patch) =>
          [patch.before, patch.after].every(
            (value) =>
              typeof value === "number" ||
              typeof value === "boolean" ||
              (typeof value === "string" && value.length <= 140),
          ),
        ),
      })),
    },
  };
}
export function comparisonType(records) {
  if (records.length < 2) return "选择至少两局，查看策略差异";
  if (new Set(records.map((r) => JSON.stringify(r.versions))).size > 1)
    return "引擎或评分版本不同，分数无法直接归因";
  const sameScenario =
    new Set(
      records.map((r) =>
        JSON.stringify({
          seed: r.input.seed,
          professionId: r.input.professionId,
          task: r.input.taskBrief,
          environment: r.input.environment,
        }),
      ),
    ).size === 1;
  const sameStrategy =
    new Set(
      records.map((r) =>
        JSON.stringify({
          profession: r.input.professionId,
          strategy: r.input.strategy,
        }),
      ),
    ).size === 1;
  return sameScenario
    ? "同一场景 · 比较策略与加班选择"
    : sameStrategy
      ? "同一策略 · 种子与环境有所不同"
      : "不同场景与策略 · 仅作描述性比较";
}
