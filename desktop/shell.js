import { icon, appIcon, escapeHtml as e } from "../ui/icons.js";

export function appMenus(profession, windowId = "work") {
  const app =
    windowId === "wechat"
      ? "wechat"
      : windowId === "finder"
        ? "finder"
        : windowId === "brief"
          ? "notes"
          : profession.app;
  const menus = {
    vscode: [
      "Code",
      "文件",
      "编辑",
      "选择",
      "查看",
      "转到",
      "运行",
      "终端",
      "窗口",
      "帮助",
    ],
    excel: [
      "Excel",
      "文件",
      "编辑",
      "视图",
      "插入",
      "格式",
      "工具",
      "数据",
      "窗口",
      "帮助",
    ],
    word: [
      "Word",
      "文件",
      "编辑",
      "视图",
      "插入",
      "格式",
      "工具",
      "表格",
      "窗口",
      "帮助",
    ],
    photoshop: [
      "Photoshop",
      "文件",
      "编辑",
      "图像",
      "图层",
      "文字",
      "选择",
      "滤镜",
      "视图",
      "窗口",
      "帮助",
    ],
    wechat: ["微信", "文件", "编辑", "显示", "窗口", "帮助"],
    finder: ["访达", "文件", "编辑", "显示", "前往", "窗口", "帮助"],
    notes: ["备忘录", "文件", "编辑", "格式", "显示", "窗口", "帮助"],
  };
  return menus[app]
    .map((label, i) =>
      i === 0 ? `<strong>${label}</strong>` : `<span>${label}</span>`,
    )
    .join("");
}

export function renderStartMenu(profession) {
  return `<aside class="start-menu" id="start-menu" hidden>
    <div class="start-menu-search">${icon("search", 17)}<span>搜索应用、设置和文档</span></div>
    <div class="start-menu-heading">已固定 <span>所有应用 ${icon("chevron", 11)}</span></div>
    <div class="start-menu-apps">
      <button data-open="work">${appIcon(profession.app, 40)}<span>${e(profession.appName)}</span></button>
      <button data-open="wechat">${appIcon("wechat", 40)}<span>微信</span></button>
      <button data-open="finder">${appIcon("folder", 40)}<span>文件资源管理器</span></button>
      <button data-open="brief">${appIcon("notes", 40)}<span>记事本</span></button>
      <button data-action="configure">${appIcon("settings", 40)}<span>设置</span></button>
      <button data-action="history">${icon("chart", 34)}<span>工作记录</span></button>
    </div>
    <div class="start-menu-heading">推荐的项目 <span>更多 ${icon("chevron", 11)}</span></div>
    <button class="start-recommended" data-open="brief">${appIcon("notes", 30)}<span><b>今日任务</b><small>最近打开</small></span></button>
    <footer><span class="windows-user">${icon("account", 29)}</span> 员工 <button title="电源" aria-label="关闭开始菜单" data-action="start-menu">${icon("power", 19)}</button></footer>
  </aside>`;
}

export function renderFinder(state, profession, osTheme) {
  const windows = osTheme === "windows";
  const files =
    state.artifact.kind === "code"
      ? Object.keys(state.artifact.files)
      : [
          state.artifact.kind === "sheet"
            ? "季度经营报表.xlsx"
            : state.artifact.kind === "document"
              ? "退款自助化 PRD.docx"
              : "活动主视觉.psd",
          "任务说明.txt",
        ];
  const locations = windows
    ? ["快速访问", "桌面", "下载", "文档", "图片", "此电脑"]
    : ["隔空投送", "最近使用", "应用程序", "桌面", "文稿", "下载"];
  return `<div class="finder-app"><aside><h5>${windows ? "主页" : "个人收藏"}</h5>${locations.map((label, i) => `<div class="${i === (windows ? 3 : 4) ? "selected" : ""}">${icon(i === 2 ? "folder" : "document", 16)}${label}</div>`).join("")}<h5>${windows ? "设备和驱动器" : "位置"}</h5><div>${icon("folder", 16)}${windows ? "本地磁盘 (C:)" : "Macintosh HD"}</div></aside><section><div class="finder-toolbar"><span>‹ &nbsp; ›</span><b>${windows ? "文档" : "文稿"}</b><span>${icon("grid", 16)} &nbsp; ${icon("search", 16)}</span></div><div class="finder-project-title">${e(profession.app === "vscode" ? "refund-service" : "工作文档")}</div><div class="finder-file-header"><span>名称</span><span>修改日期</span><span>种类</span></div>${files.map((file) => `<button class="finder-file" ${state.artifact.kind === "code" ? `data-file="${e(file)}"` : 'data-open="work"'}>${appIcon(profession.app, 23)}<span>${e(file)}</span><small>今天</small><em>${e(file.split(".").at(-1).toUpperCase())} 文件</em></button>`).join("")}<button class="finder-file" data-open="brief">${appIcon("notes", 23)}<span>今日任务.txt</span><small>今天</small><em>文本文稿</em></button><footer>${files.length + 1} 个项目</footer></section></div>`;
}

export function renderShell(profession) {
  return `<main class="desktop" aria-label="模拟工作桌面">
    <div class="wallpaper"></div>
    <header class="system-bar"><div class="system-left"><button class="system-logo" data-action="apple-menu" aria-label="苹果菜单"></button><div id="app-menus" class="native-app-menus">${appMenus(profession)}</div></div><div class="system-right"><span class="menu-battery">${icon("energy", 12)}<i></i></span>${icon("wifi", 16)}<span class="menu-search">${icon("search", 14)}</span>${icon("control", 16)}<time id="system-clock"></time></div></header>
    <aside class="apple-menu native-menu" id="apple-menu" hidden><div>关于本机</div><button data-action="configure">系统设置…</button><hr><div>最近使用的项目 <span>›</span></div><hr><div>强制退出…</div><hr><div>睡眠</div><div>重新启动…</div><div>关机…</div></aside>
    <div class="desktop-game-menu"><button data-action="configure" title="工作日设置">${icon("settings", 15)}</button><button data-action="history" title="工作记录">${icon("history", 15)}</button><span></span><button data-action="switch-os" class="system-switch" title="切换系统外观">${icon("windows", 14)}<span>Windows 11</span></button><button data-action="fullscreen" title="进入全屏" aria-label="进入全屏">${icon("expand", 15)}</button></div>
    <nav class="desktop-shortcuts"><button data-open="finder" class="windows-this-pc"><span class="pc-icon">${appIcon("computer", 47)}</span><label>此电脑</label></button><button data-open="finder"><span class="desktop-folder">${appIcon("folder", 58)}</span><label>工作文档</label></button><button data-open="brief"><span class="desktop-file">${appIcon("notes", 53)}</span><label>今日任务</label></button></nav>
    <div id="window-space"></div>
    <div class="simulation-cursor" id="sim-cursor" hidden><svg width="24" height="29" viewBox="0 0 24 29"><path d="M3 2v22l6-6 5 9 4-2-5-8h9Z" fill="#151515" stroke="white" stroke-width="1.3"/></svg></div>
    <div class="auto-typing" id="auto-typing" hidden></div><div class="notification" id="notification" role="status" hidden></div>
    <section class="playback-bar" aria-label="观看控制"><div class="playback-identity"><span class="live-dot idle"></span><div><strong id="playback-title">尚未开始</strong><span id="playback-subtitle">请先选择职业和工作策略</span></div></div><div class="round-indicator"><div id="round-dots">${Array.from({ length: 12 }, (_, i) => `<i data-round="${i + 1}" class="${i >= 10 ? "overtime-dot" : ""}"></i>`).join("")}</div><span id="round-label">第 0 / 12 轮</span></div><div class="playback-controls"><button data-action="pause" id="pause-button" title="播放 / 暂停" aria-label="播放或暂停">${icon("play", 18)}</button><button data-action="next-key" title="下一关键节点" aria-label="下一关键节点">${icon("next", 18)}</button><button data-action="boundary" title="跳至加班选择或结算" aria-label="跳至决策或结算">${icon("skip", 18)}</button><button data-action="speed" class="speed-button" aria-label="切换播放速度">1×</button><span class="control-divider"></span><button data-action="status" title="状态与因果日志" aria-label="查看状态与日志">${icon("chart", 18)}</button></div></section>
    <nav class="dock" aria-label="应用栏"><button class="dock-start" data-open="finder" title="访达">${appIcon("finder", 51)}</button><span class="dock-separator windows-separator"></span><button data-open="work" title="${e(profession.appName)}" class="dock-icon code-dock"><span id="work-dock-icon">${appIcon(profession.app, 51)}</span><i></i></button><button data-open="wechat" title="微信" class="dock-icon chat-dock">${appIcon("wechat", 51)}<b id="dock-unread" hidden></b><i></i></button><button data-open="brief" title="备忘录" class="dock-icon document-dock">${appIcon("notes", 51)}<i></i></button><button data-action="configure" title="系统设置" class="dock-icon settings-dock">${appIcon("settings", 51)}</button><span class="dock-separator"></span><button data-action="history" title="工作记录" class="dock-icon history-dock">${appIcon("folder", 51)}</button><button class="dock-trash" data-open="finder" title="废纸篓">${appIcon("trash", 51)}</button><span class="windows-tray"><span>⌃</span>${icon("wifi", 16)}${icon("volume", 16)}<span class="tray-datetime"><time id="tray-clock"></time><time id="tray-date"></time></span><span class="tray-notification">${icon("bell", 15)}</span></span></nav>
    <div id="drawer" class="status-drawer" hidden></div><div id="modal-root"></div><div id="toast" role="status" hidden></div>
  </main>`;
}
