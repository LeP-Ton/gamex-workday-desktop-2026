import { professionList, professions } from "../data/professions.js";
import {
  parameterGroups,
  specialParameters,
  presets,
  priorityRules,
} from "../data/parameters.js";
import { environmentLabels } from "../data/environments.js";
import { icon, appIcon, escapeHtml as e } from "./icons.js";
function control(p, value, special = false) {
  const name = special ? `special.${p.id}` : p.id;
  const input =
    p.type === "range"
      ? `<div class="range-control"><input type="range" id="param-${p.id}" name="${name}" min="${p.min}" max="${p.max}" value="${value}" style="--fill:${((value - p.min) / (p.max - p.min)) * 100}%" aria-label="${p.label}"><output>${value}${p.max === 100 ? "%" : ""}</output></div>`
      : p.type === "toggle"
        ? `<label class="toggle"><input type="checkbox" name="${name}" ${value ? "checked" : ""} aria-label="${p.label}"><span></span></label>`
        : `<select name="${name}" aria-label="${p.label}">${p.options.map(([v, label]) => `<option value="${v}" ${v === value ? "selected" : ""}>${label}</option>`).join("")}</select>`;
  return `<div class="parameter-row"><div><label for="param-${p.id}">${p.label}</label><p>${p.hint}</p></div>${input}</div>`;
}
export function renderSetup(
  config,
  scenario,
  { activeGroup = 0, customPresets = [], hasSaved = false } = {},
) {
  const group =
    activeGroup === 3
      ? {
          title: "职业专属",
          parameters: specialParameters[config.professionId],
        }
      : parameterGroups[activeGroup];
  const p = professions[config.professionId];
  return `<div class="setup-modal modal-card"><div class="setup-top"><div class="eyebrow">GameX <span>2026</span></div><button class="icon-button" data-action="close-modal" aria-label="关闭配置">${icon("close")}</button></div><div class="setup-intro"><div><h1>工作日设置</h1><p>选择职业、工作环境和策略，然后开始自动运行。</p></div><span class="edition-label">打工人桌面模拟器<br>工作策略与环境配置</span></div><div class="profession-grid">${professionList.map((item) => `<button class="profession-card ${item.id === config.professionId ? "selected" : ""}" data-profession="${item.id}" style="--profession-color:${item.color}"><span class="profession-icon">${appIcon(item.app, 35)}</span><span><b>${item.name}</b><small>${e(item.appName)}</small></span><i>${item.id === config.professionId ? icon("check", 14) : ""}</i></button>`).join("")}</div><div class="setup-body"><div class="strategy-settings"><div class="section-heading"><h2>你的工作方式</h2><button data-action="default-strategy">恢复默认</button></div><div class="preset-list">${presets.map((preset) => `<button data-preset="${preset.id}" class="preset ${config.presetId === preset.id ? "selected" : ""}" title="${preset.description}">${preset.name}</button>`).join("")}</div><div class="strategy-tabs">${["工作强度", "时间沟通", "质量风险", "职业专属"].map((label, i) => `<button data-group="${i}" class="${activeGroup === i ? "selected" : ""}"><span>${String.fromCharCode(65 + i)}</span>${label}</button>`).join("")}</div><div class="parameter-panel">${group.parameters.map((param) => control(param, activeGroup === 3 ? config.strategy.special[param.id] : config.strategy[param.id], activeGroup === 3)).join("")}${
    activeGroup === 1
      ? `<div class="priority-section"><div class="priority-heading"><b>事件优先级</b><span>最多 4 条 · 拖动或用箭头排序</span></div><div class="priority-selected">${config.strategy.priorityRules.map((id, i) => `<div class="priority-rule" draggable="true" data-rule="${id}"><span class="grip">⠿</span><b>${String(i + 1).padStart(2, "0")}</b><span>${priorityRules.find((r) => r.id === id)?.label}</span><button data-rule-up="${id}" aria-label="上移规则">↑</button><button data-rule-down="${id}" aria-label="下移规则">↓</button><button data-rule-remove="${id}" aria-label="移除规则">×</button></div>`).join("")}</div><select name="addRule" aria-label="添加优先级规则"><option value="">＋ 添加优先级规则</option>${priorityRules
          .filter((r) => !config.strategy.priorityRules.includes(r.id))
          .map((r) => `<option value="${r.id}">${r.label}</option>`)
          .join("")}</select></div>`
      : ""
  }</div><div class="save-strategy-row"><button data-action="save-preset">${icon("folder", 14)} 保存这套策略</button>${customPresets.length ? `<select name="customPreset" aria-label="已保存策略"><option value="">选择已保存策略</option>${customPresets.map((_, i) => `<option value="${i}">我的策略 ${i + 1}</option>`).join("")}</select>` : "<span>参数只在开局前生效</span>"}</div></div><aside class="setup-context"><div class="task-context"><div class="context-label"><span>今日任务</span><span>难度 ${scenario.taskBrief.difficulty}/5</span></div><h3>${e(scenario.taskBrief.title)}</h3><div class="task-mini-list">${scenario.taskBrief.subtasks.map((t, i) => `<div><span>${String(i + 1).padStart(2, "0")}</span><p>${e(t.title)}<small>${t.dependsOn.length ? "依赖任务 " + t.dependsOn.map((id) => id.split("-")[1]).join("、") : "可直接开始"}</small></p>${t.isCritical ? "<i>关键</i>" : ""}</div>`).join("")}</div><div class="environment-tags">${[scenario.environment.bossStyle, scenario.environment.clientChangeFrequency, scenario.environment.urgency].map((key) => `<span>${environmentLabels[key]}</span>`).join("")}</div><p class="risk-note">${scenario.taskBrief.riskNotes.map(e).join(" · ")}</p></div><div class="system-choice"><div class="context-label">系统外观</div><div class="segmented">${["macos", "windows"].map((os) => `<button data-os="${os}" class="${config.osTheme === os ? "selected" : ""}">${icon(os === "macos" ? "apple" : "windows", 15)}${os === "macos" ? "macOS Sonoma" : "Windows 11"}</button>`).join("")}</div></div><div class="setup-small-grid"><label>场景种子<div class="seed-field"><input name="seed" type="number" min="0" max="4294967295" value="${config.seed}" aria-label="场景种子"><button data-action="new-seed" title="生成新场景" aria-label="生成新场景">↻</button></div></label><label>观看节奏<select name="pacing" aria-label="观看节奏"><option value="quick" ${config.pacing === "quick" ? "selected" : ""}>快速 · 约 90 秒</option><option value="standard" ${config.pacing === "standard" ? "selected" : ""}>标准 · 约 12 分钟</option><option value="immersive" ${config.pacing === "immersive" ? "selected" : ""}>沉浸 · 约 45 分钟</option></select></label></div></aside></div><footer class="setup-footer"><span>${icon("clock", 15)} 12 轮工作 · 第 10 轮决定是否加班</span><div>${hasSaved ? '<button class="secondary-button" data-action="resume">继续上次工作</button>' : ""}<button class="primary-button" data-action="start">开始今天的工作 ${icon("arrow", 18)}</button></div></footer></div>`;
}
