import { VERSION, validateRunInput } from "../sim/schema.js";
export function validateSession(saved) {
  if (
    !saved ||
    saved.storageVersion !== 1 ||
    saved.regular?.input.engineVersion !== VERSION
  )
    throw new Error("存档版本不兼容，原记录已保留");
  validateRunInput(saved.regular.input);
  const regular = saved.regular;
  if (
    regular.snapshots?.length !== 10 ||
    regular.checkpoint?.completedRound !== 10 ||
    regular.checkpoint?.state?.round !== 10 ||
    regular.checkpoint.phase !== "awaiting_overtime_choice" ||
    !Number.isInteger(regular.checkpoint.rngState) ||
    regular.checkpoint.counters?.actions !== regular.actions?.length ||
    regular.checkpoint.counters?.logs !== regular.logs?.length ||
    !Number.isInteger(regular.checkpoint.counters?.events) ||
    !Array.isArray(regular.initialState?.tasks) ||
    !Array.isArray(regular.initialState?.messages)
  )
    throw new Error("存档检查点不完整");
  const actions = [...regular.actions, ...(saved.continuation?.actions ?? [])];
  if (
    actions.some(
      (a, i) =>
        a.sequence !== i ||
        !Array.isArray(a.stateDelta) ||
        !Array.isArray(a.artifactPatches) ||
        [...a.stateDelta, ...a.artifactPatches].some(
          (p) =>
            !Array.isArray(p.path) ||
            !p.path.length ||
            p.path.some((key) =>
              ["__proto__", "prototype", "constructor"].includes(key),
            ),
        ),
    )
  )
    throw new Error("动作序列损坏");
  const index = saved.playback?.nextActionIndex;
  if (!Number.isInteger(index) || index < 0 || index > actions.length)
    throw new Error("观看位置无效");
  if (
    saved.continuation &&
    (typeof saved.overtimeChoice !== "boolean" ||
      saved.continuation.snapshots?.length !== 2 ||
      saved.continuation.overtimeChoice !== saved.overtimeChoice)
  )
    throw new Error("加班恢复数据不完整");
  return saved;
}
