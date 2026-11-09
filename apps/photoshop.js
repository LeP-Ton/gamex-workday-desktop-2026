import { icon, escapeHtml as e } from "../ui/icons.js";
export function renderPhotoshop(state) {
  const a = state.artifact,
    visible = (id) => a.layers.find((l) => l.id === id)?.visible;
  const tools = [
    ["move", "移动工具"],
    ["marquee", "矩形选框工具"],
    ["lasso", "套索工具"],
    ["crop", "裁剪工具"],
    ["eyedropper", "吸管工具"],
    ["brush", "画笔工具"],
    ["stamp", "仿制图章工具"],
    ["eraser", "橡皮擦工具"],
    ["pen", "钢笔工具"],
    ["document", "横排文字工具"],
    ["hand", "抓手工具"],
    ["search", "缩放工具"],
  ];
  return `<div class="design-app"><div class="photoshop-menubar"><b>Ps</b>${["文件", "编辑", "图像", "图层", "文字", "选择", "滤镜", "视图", "窗口", "帮助"].map((t) => `<span>${t}</span>`).join("")}</div><div class="design-options">${icon("move", 17)}<span class="option-checkbox">☑ 自动选择</span><span class="ps-select">图层 ⌄</span><span>☐ 显示变换控件</span><span class="ps-options-align">${icon("align", 16)} &nbsp; ${icon("align", 16)} &nbsp; ⋮</span></div><div class="ps-document-tab">活动主视觉.psd @ 33.3% (RGB/8) ${a.version ? "*" : ""}<span>×</span></div><div class="design-body"><aside class="design-toolbar">${tools.map(([tool, label]) => `<span title="${label}" class="${tool === "move" ? "active" : ""}">${tool === "document" ? '<b class="ps-type-tool">T</b>' : icon(tool, 18)}</span>`).join("")}<div class="ps-color-swatches"><i></i><i></i></div><span>···</span></aside><div class="design-stage" id="work-content"><div class="ps-ruler-h">${Array.from({ length: 10 }, (_, i) => `<span>${i * 100}</span>`).join("")}</div><div class="ps-ruler-v">0<br><br>100<br><br>200<br><br>300<br><br>400<br><br>500</div><div class="design-canvas" style="--canvas-bg:${a.palette.bg};--canvas-ink:${a.palette.ink};--canvas-orb:${a.palette.orb}"><span class="poster-kicker">GAMEX · ANNUAL CAMPAIGN</span>${visible("title") ? `<h1 style="transform:scale(${a.titleScale ?? 1});transform-origin:top left">Another<br>year.<br>New you.</h1>` : '<h1 style="opacity:.17">A new<br>chapter.</h1>'}${visible("subtitle") ? '<p class="poster-cn">给自己，新一页。</p>' : ""}${visible("orb") ? `<div class="poster-orb" style="right:-${a.orbOffset ?? 45}px"></div>` : ""}${visible("brand") ? '<div class="poster-meta">2026 / 11 — 12　A LITTLE BETTER, EVERY DAY</div>' : ""}</div></div><aside class="design-panels"><div class="design-panel-title"><b>颜色</b>　色板</div><div class="ps-colors"><div></div><aside></aside></div><div class="design-panel-title"><b>属性</b>　调整</div><div class="property-row">画布</div><div class="property-row">宽度 <span>${a.width} 像素</span></div><div class="property-row">高度 <span>${a.height} 像素</span></div><div class="property-row">分辨率 <span>72 像素/英寸</span></div><div class="design-panel-title"><b>图层</b>　通道　路径</div><div class="ps-layer-options"><span>正常 ⌄</span><span>不透明度: 100%</span></div>${[
    ...a.layers,
  ]
    .reverse()
    .map(
      (l) =>
        `<div class="layer-row ${a.activeLayer === l.id ? "active" : ""}"><span class="layer-eye">${l.visible ? icon("eye", 13) : ""}</span><span class="layer-thumbnail ${l.id === "title" || l.id === "subtitle" ? "text-layer" : ""}">${l.id === "title" || l.id === "subtitle" ? "T" : ""}</span><span>${e(l.name.split(" / ")[0])}</span></div>`,
    )
    .join(
      "",
    )}<div class="ps-layer-footer">${icon("layers", 12)}<b>fx</b>${icon("folder", 12)}<span>⊞</span>${icon("trash", 12)}</div></aside></div><footer class="design-status"><span>33.33%　文档: 4.17M/20.8M</span><span>1080 像素 × 1350 像素 (72 ppi)</span></footer></div>`;
}
