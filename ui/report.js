import { professions } from "../data/professions.js";
import { comparisonType } from "../meta/history.js";
import { icon, escapeHtml as e } from "./icons.js";
export function renderOvertime(state) {
  const left = Math.round(
    state.tasks.reduce(
      (n, t) => n + Math.max(0, t.requiredWork - t.doneWork),
      0,
    ),
  );
  return `<section class="overtime-modal modal-card"><div class="eyebrow">加班选择</div><div class="overtime-illustration">${icon("sun", 42)}</div><h1>今天，要再多做一点吗？</h1><p>常规阶段结束了。没有倒计时，等你回来再决定。</p><div class="overtime-metrics"><span>剩余工作量<b>${left}</b></span><span>当前体力<b>${Math.round(state.energy)}<small> / 100</small></b></span><span>未读消息<b>${state.unreadPressure}</b></span></div><div class="overtime-options"><button data-overtime="false"><span>${icon("sun", 22)}</span><b>照常收尾</b><p>后两轮保持正常产能与消耗。留一点体力给明天。</p><em>正常节奏 ${icon("arrow", 16)}</em></button><button data-overtime="true"><span>${icon("energy", 22)}</span><b>再努力一会儿</b><p>后两轮产能上限约提高 35%，体力消耗与过劳风险上升。${state.energy < 40 ? "当前体力偏低，额外收益可能被错误抵消。" : "实际收益取决于剩余任务和风险。"}</p><em>选择加班 ${icon("arrow", 16)}</em></button></div><small>选择通过工作状态影响结果，不直接加减绩效分。</small></section>`;
}
export function renderReport(run) {
  const p = run.performance,
    s = run.finalState;
  return `<section class="report-modal modal-card"><div class="report-top"><div><div class="eyebrow">绩效报告</div><h1>工作日绩效报告</h1><p>${professions[run.input.professionId].name} · 种子 ${run.input.seed} · ${run.overtimeChoice ? "选择了加班" : "按正常节奏收尾"}</p></div><div class="grade-mark">${p.grade}<small>综合评级</small></div></div><div class="report-summary"><div class="report-score"><span>综合绩效</span><strong>${p.totalScore}<small>/100</small></strong><p>每个选择，都留下了痕迹。</p></div><div class="dimension-grid">${p.dimensions.map((d) => `<div class="dimension"><span>${d.label}<small>${Math.round(d.weight * 100)}%</small></span><b>${Math.round(d.rawScore)}</b><div><i style="width:${d.rawScore}%"></i></div></div>`).join("")}</div></div><div class="report-aux"><span>任务进度 <b>${p.completion}%</b></span><span>最终体力 <b>${Math.round(s.energy)}</b></span><span>累计体力消耗 <b>${Math.round(s.accumulatedEnergyCost)}</b></span><span>每百投入绩效 <b>${p.efficiency}</b></span></div><div class="report-columns"><div><h3>下次，可以试试</h3>${p.bottlenecks.map((d) => `<div class="bottleneck"><b>${d.label}</b><p>${d.reason}</p></div>`).join("")}<p class="report-note">${e(run.input.taskBrief.title)}<br>工作强度 ${run.input.strategy.intensity}% · 返工量 ${s.rework} · 未解决问题 ${s.errors.filter((err) => !err.resolved).length}</p></div><div><h3>改变这一天的关键事件</h3><div class="key-events">${p.keyEvents
    .map(
      (log) =>
        `<details class="key-event"><summary><span>R${String(log.round).padStart(2, "0")}</span><p>${e(log.consequence)}</p>${icon("chevron", 12)}</summary><div class="causal-detail">来源：${e(log.source)}<br>规则：${e(log.triggeredRule)}<br>事件：${e(log.eventId)}${log.parentEventId ? " ← " + e(log.parentEventId) : ""}<br>关联：${e(log.relatedTaskId)}${log.stateDelta
          .filter(
            (d) => typeof d.before === "number" && typeof d.after === "number",
          )
          .slice(0, 5)
          .map((d) => `<br>${e(d.path.join("."))}：${d.before} → ${d.after}`)
          .join("")}</div></details>`,
    )
    .join(
      "",
    )}</div></div></div><footer class="report-footer"><button class="secondary-button" data-action="close-modal">回到桌面</button><div><button class="secondary-button" data-action="history">${icon("history", 16)} 历史对比</button><button class="primary-button" data-action="reconfigure">调整策略，再来一天 ${icon("arrow", 16)}</button></div></footer></section>`;
}
export function renderHistory(records, selectedIds = [], filter = "all") {
  const selected = records.filter((r) => selectedIds.includes(r.runId));
  return `<section class="history-modal modal-card"><div class="modal-heading"><div><div class="eyebrow">工作记录</div><h1>工作记录与比较</h1></div><button class="icon-button" data-action="close-modal" aria-label="关闭历史">${icon("close")}</button></div><div class="history-toolbar"><span>最近 ${records.length} / 50 局 · 勾选两局及以上进行比较</span><select name="historyFilter" aria-label="筛选历史职业"><option value="all">全部职业</option>${Object.values(
    professions,
  )
    .map(
      (p) =>
        `<option value="${p.id}" ${filter === p.id ? "selected" : ""}>${p.name}</option>`,
    )
    .join("")}</select></div><div class="history-list">${
    records
      .filter((r) => filter === "all" || r.input.professionId === filter)
      .map(
        (r) =>
          `<label class="history-row"><input type="checkbox" data-compare="${e(r.runId)}" ${selectedIds.includes(r.runId) ? "checked" : ""}><span class="history-grade">${r.performance.grade}</span><div><b>${professions[r.input.professionId].name} · 种子 ${r.input.seed}</b><small>${new Date(r.createdAt).toLocaleString("zh-CN")} · 强度 ${r.input.strategy.intensity}% · ${r.overtimeChoice ? "加班" : "正常收尾"}</small></div><strong>${r.performance.totalScore}<small>分</small></strong><button data-retry="${e(r.runId)}" class="text-button">重新配置 ↗</button></label>`,
      )
      .join("") ||
    '<div class="history-empty">每一次下班，都会在这里留下一份记录。<br>先完成你的第一个工作日吧。</div>'
  }</div><div class="comparison"><h3>${comparisonType(selected)}</h3>${selected.length >= 2 ? `<div class="comparison-scroll"><table><thead><tr><th>指标</th>${selected.map((r) => `<th>${professions[r.input.professionId].name}<small>种子 ${r.input.seed}</small></th>`).join("")}</tr></thead><tbody>${[["综合绩效", (r) => r.performance.totalScore], ...selected[0].performance.dimensions.map((d) => [d.label, (r) => r.performance.dimensions.find((x) => x.id === d.id)?.rawScore ?? "—"]), ["工作强度", (r) => r.input.strategy.intensity + "%"], ["主任务投入", (r) => r.input.strategy.mainTaskShare + "%"], ["需求接受度", (r) => r.input.strategy.changeAcceptance + "%"], ["微信响应", (r) => ({ instant: "秒回", delayed: "延迟回复", batch: "批量处理" })[r.input.strategy.wechatMode]], ["加班", (r) => (r.overtimeChoice ? "是" : "否")], ["最终体力", (r) => r.performance.effortSummary.finalEnergy]].map(([label, value]) => `<tr><td>${label}</td>${selected.map((r) => `<td>${e(value(r))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}</div></section>`;
}
