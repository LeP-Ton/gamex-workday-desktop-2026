import { createRng, deriveSeed } from "../sim/prng.js";
import { taskTemplates } from "./tasks.js";
export function createScenario(seed, professionId) {
  if (!taskTemplates[professionId]) throw new Error("请选择有效职业");
  const rng = createRng(deriveSeed(seed, "environment"));
  const pick = (items) => items[Math.floor(rng.next() * items.length)];
  const environment = {
    id: `env-${seed}`,
    seed,
    templateVersion: 1,
    bossStyle: pick(["result", "process", "responsive"]),
    clientChangeFrequency: pick(["stable", "moderate", "frequent"]),
    urgency: pick(["normal", "urgent"]),
    collaborationClimate: pick(["supportive", "busy"]),
    preference: pick(["minimal", "bold", "warm"]),
    initialRisk: Math.floor(rng.next() * 12) + 5,
  };
  const taskBrief = structuredClone(taskTemplates[professionId]);
  taskBrief.difficulty = environment.urgency === "urgent" ? 4 : 3;
  return { taskBrief, environment };
}
export const environmentLabels = {
  result: "老板重结果",
  process: "老板重过程",
  responsive: "老板期待及时响应",
  stable: "需求相对稳定",
  moderate: "偶有需求变更",
  frequent: "需求变更频繁",
  normal: "截止时间适中",
  urgent: "交付时间紧张",
  supportive: "团队愿意协助",
  busy: "同事也很忙",
  minimal: "客户偏好简洁",
  bold: "客户偏好醒目",
  warm: "客户偏好温暖",
};
