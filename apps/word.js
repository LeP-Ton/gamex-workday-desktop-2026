import { icon, escapeHtml as e } from "../ui/icons.js";
import { officeRibbon } from "./office.js";
export function renderWord(state) {
  const a = state.artifact;
  const comments = a.comments
    .slice(-3)
    .map((text) =>
      text.replace(/^第 \d+ 轮核对[：:]/, "").replace(/^第 \d+ 轮/, "本次"),
    );
  return `<div class="office-app word-app">${officeRibbon("word")}<div class="word-ruler"><span>1 &nbsp; · &nbsp; 2 &nbsp; · &nbsp; 3 &nbsp; · &nbsp; 4 &nbsp; · &nbsp; 5 &nbsp; · &nbsp; 6 &nbsp; · &nbsp; 7 &nbsp; · &nbsp; 8 &nbsp; · &nbsp; 9 &nbsp; · &nbsp; 10 &nbsp; · &nbsp; 11 &nbsp; · &nbsp; 12 &nbsp; · &nbsp; 13 &nbsp; · &nbsp; 14</span></div><div class="document-scroll" id="work-content"><article class="document-page"><h1>${e(a.title)}</h1><p class="document-meta">版本 v${a.version}　${a.baseline ? "已确认" : "草稿"}<br>产品需求文档 · 业务与研发联合评审</p>${a.sections
    .map(
      (section) =>
        `<section class="${a.revisions.some((r) => r.taskId === section.id) ? "revision-mark" : ""}"><h2>${e(section.title)}${section.confirmed ? "" : '<sup class="word-comment-marker">批注</sup>'}</h2><p>${e(section.text).replaceAll("\n", "<br>")}</p>${a.revisions
          .filter((r) => r.taskId === section.id)
          .slice(-1)
          .map(
            (r) =>
              `<div class="word-tracked-change"><span>林悦</span><ins>${e(r.summary ?? r.after.slice(-65))}</ins></div>`,
          )
          .join("")}</section>`,
    )
    .join(
      "",
    )}</article>${comments.length ? `<aside class="word-comments">${comments.map((text) => `<div class="word-comment-card"><header><span>我</span><div><b>我</b><small>作者</small></div><i>···</i></header><p>${e(text)}</p><div>回复或添加其他人</div></div>`).join("")}</aside>` : ""}</div><footer class="office-status"><span>第 1 页，共 1 页</span><span>${a.sections.reduce((n, s) => n + s.text.length, 0)} 个字</span><span>中文(中国)</span><span class="office-view-controls">${icon("document", 12)} &nbsp; ${icon("grid", 12)} &nbsp; − ━━━●━━ ＋ &nbsp; 100%</span></footer></div>`;
}
