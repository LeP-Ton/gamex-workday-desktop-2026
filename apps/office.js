import { icon } from "../ui/icons.js";
export function officeRibbon(type) {
  const excel = type === "excel";
  const tabs = excel
    ? [
        "文件",
        "开始",
        "插入",
        "页面布局",
        "公式",
        "数据",
        "审阅",
        "视图",
        "帮助",
      ]
    : [
        "文件",
        "开始",
        "插入",
        "绘图",
        "设计",
        "布局",
        "引用",
        "邮件",
        "审阅",
        "视图",
        "帮助",
      ];
  return `<div class="office-ribbon"><div class="ribbon-tabs">${tabs.map((t, i) => (i === 1 ? `<b>${t}</b>` : `<span>${t}</span>`)).join("")}<span class="office-share">共享</span></div><div class="ribbon-groups"><div class="ribbon-group ribbon-clipboard"><div class="ribbon-group-tools"><span class="ribbon-paste">${icon("paste", 30)}<small>粘贴 ˅</small></span><div class="ribbon-stack"><span>${icon("cut", 13)} 剪切</span><span>${icon("copy", 13)} 复制</span><span>${icon("brush", 13)} 格式刷</span></div></div><small>剪贴板</small></div><div class="ribbon-group ribbon-font"><div class="office-selectors"><span>${excel ? "等线" : "宋体 (正文)"}<i>⌄</i></span><span>${excel ? "11" : "五号"}<i>⌄</i></span></div><div class="office-font-tools"><b>B</b><i>I</i><u>U</u><span>▦</span><span class="text-highlight">A</span><span class="text-color">A</span></div><small>字体</small></div><div class="ribbon-group ribbon-alignment"><div class="office-align-tools"><span>${icon("align", 17)}</span><span>${icon("align", 17)}</span><span>${icon("align", 17)}</span><span>↕</span></div><div class="office-align-tools"><span>${icon("align", 17)}</span><span>${icon("align", 17)}</span><span>${excel ? "合并后居中" : "行和段落间距"} ˅</span></div><small>${excel ? "对齐方式" : "段落"}</small></div><div class="ribbon-group ribbon-number"><div class="office-selectors"><span>${excel ? "常规" : "正文"}<i>⌄</i></span></div><div class="office-font-tools">${excel ? "<span>¥</span><span>%</span><span>，</span><span>.00</span>" : "<b>AaBbCc</b><span>标题 1</span>"}</div><small>${excel ? "数字" : "样式"}</small></div><div class="ribbon-group ribbon-editing"><div class="ribbon-stack"><span>${icon("search", 13)} 查找</span><span>${icon("undo", 13)} 替换</span><span>${icon("grid", 13)} 选择 ˅</span></div><small>编辑</small></div></div></div>`;
}
