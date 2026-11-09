import { icon, escapeHtml as e } from "../ui/icons.js";
import { officeRibbon } from "./office.js";
export function renderExcel(state, selectedSheet) {
  const a = state.artifact,
    index = selectedSheet ?? a.activeSheet,
    sheet = a.sheets[index] ?? a.sheets[0];
  const columns = Math.max(8, ...sheet.rows.map((row) => row.length));
  const cell = a.selectedCell.match(/^([A-Z])(\d+)$/),
    col = cell[1].charCodeAt(0) - 65,
    row = +cell[2] - 1;
  const formula =
    index === 1 && a.selectedCell === "B2"
      ? a.formula
      : (sheet.rows[row]?.[col] ?? "");
  return `<div class="office-app excel-app">${officeRibbon("excel")}<div class="formula-bar"><b>${e(a.selectedCell)}<small>⌄</small></b><span>× &nbsp; ✓ &nbsp; <i>ƒx</i></span><code>${e(formula)}</code></div><div class="sheet-scroll" id="work-content"><table class="spreadsheet"><thead><tr><th>◢</th>${Array.from({ length: columns }, (_, i) => `<th class="${i === col ? "column-active" : ""}">${String.fromCharCode(65 + i)}</th>`).join("")}</tr></thead><tbody>${Array.from(
    { length: 24 },
    (_, r) =>
      `<tr><th class="${r === row ? "column-active" : ""}">${r + 1}</th>${Array.from(
        { length: columns },
        (_, c) => {
          const value = sheet.rows[r]?.[c] ?? "";
          return `<td class="${r === row && c === col ? "selected-cell" : ""} ${typeof value === "number" ? "number-cell" : ""} ${a.anomalies.length && ((index === 0 && r === 3 && c === 2) || (index === 1 && c === 1 && r > 0)) ? "cell-error" : ""}">${e(typeof value === "number" ? value.toLocaleString("zh-CN") : value)}</td>`;
        },
      ).join("")}</tr>`,
  ).join(
    "",
  )}</tbody></table></div><div class="sheet-tabs"><span class="sheet-navigation">‹ &nbsp; › &nbsp; ${icon("align", 12)}</span>${a.sheets.map((s, i) => `<button data-sheet="${i}" class="${i === index ? "selected" : ""}">${e(s.name)}</button>`).join("")}<span class="new-sheet">＋</span></div><footer class="office-status"><span>${a.anomalies.length ? "存在错误" : "就绪"}</span><span>辅助功能: ${a.anomalies.length ? "需要调查" : "一切正常"}</span><span class="office-view-controls">${icon("grid", 13)} &nbsp; ${icon("document", 13)} &nbsp; − ━━━●━━ ＋ &nbsp; 100%</span></footer></div>`;
}
