import { professions } from "../data/professions.js";
import {
  parameterGroups,
  specialParameters,
  priorityRules,
} from "../data/parameters.js";
export const VERSION = "1.0.0";
export function validateRunInput(input) {
  if (!input || !professions[input.professionId]) throw new Error("职业无效");
  if (
    !Number.isInteger(input.seed) ||
    input.seed < 0 ||
    input.seed > 4294967295
  )
    throw new Error("种子须为 0～4294967295 的整数");
  const s = input.strategy;
  if (!s || !s.special) throw new Error("策略不完整");
  for (const p of [
    ...parameterGroups.flatMap((g) => g.parameters),
    ...specialParameters[input.professionId],
  ]) {
    const value = Object.hasOwn(s, p.id) ? s[p.id] : s.special[p.id];
    if (
      p.type === "range" &&
      (!Number.isFinite(value) || value < p.min || value > p.max)
    )
      throw new Error(`${p.label}超出范围`);
    if (p.type === "select" && !p.options.some(([v]) => v === value))
      throw new Error(`${p.label}选项无效`);
    if (p.type === "toggle" && typeof value !== "boolean")
      throw new Error(`${p.label}须为开关值`);
  }
  if (
    !Array.isArray(s.priorityRules) ||
    s.priorityRules.length > 4 ||
    new Set(s.priorityRules).size !== s.priorityRules.length ||
    s.priorityRules.some((id) => !priorityRules.some((r) => r.id === id))
  )
    throw new Error("优先级规则无效，最多选择 4 条");
  if (
    s.priorityRules.includes("help_colleague") &&
    s.priorityRules.includes("defer_colleague")
  )
    throw new Error("同事求助响应与推迟不能同时启用");
  if (s.redlineTolerance === "zero" && s.special.bypassApproval)
    throw new Error("零容忍不能绕过审批链");
  const tasks = input.taskBrief?.subtasks;
  if (
    !tasks ||
    tasks.length < 2 ||
    tasks.length > 5 ||
    !tasks.some((t) => t.isCritical)
  )
    throw new Error("任务书不完整");
  const ids = new Set(tasks.map((t) => t.id));
  if (ids.size !== tasks.length) throw new Error("任务 ID 重复");
  const visited = new Set(),
    visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error("任务依赖存在循环");
    if (visited.has(id)) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || !Number.isFinite(task.requiredWork) || task.requiredWork <= 0)
      throw new Error("任务工作量或依赖无效");
    visiting.add(id);
    task.dependsOn.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  tasks.forEach((t) => visit(t.id));
  if (
    !input.environment ||
    !["normal", "urgent"].includes(input.environment.urgency)
  )
    throw new Error("环境无效");
  return {
    schemaVersion: 1,
    engineVersion: VERSION,
    contentVersion: 1,
    seed: input.seed,
    professionId: input.professionId,
    taskBrief: structuredClone(input.taskBrief),
    environment: structuredClone(input.environment),
    strategy: structuredClone(s),
  };
}
