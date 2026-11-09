import "./styles/main.css";
import "./styles/authentic.css";
import { professions, people } from "./data/professions.js";
import { defaultStrategy, presetStrategy } from "./data/parameters.js";
import { createScenario, environmentLabels } from "./data/environments.js";
import {
  simulateRegular,
  continueAfterOvertime,
  mergeSegments,
} from "./sim/engine.js";
import { validateRunInput } from "./sim/schema.js";
import { progress } from "./sim/strategies.js";
import { Player } from "./playback/controller.js";
import { Storage } from "./meta/storage.js";
import { validateSession } from "./meta/session.js";
import { addHistory, historyRecord } from "./meta/history.js";
import { WindowManager } from "./desktop/window-manager.js";
import {
  renderShell,
  renderStartMenu,
  renderFinder,
  appMenus,
} from "./desktop/shell.js";
import { renderVSCode } from "./apps/vscode.js";
import { renderExcel } from "./apps/excel.js";
import { renderWord } from "./apps/word.js";
import { renderPhotoshop } from "./apps/photoshop.js";
import { renderWeChat } from "./apps/wechat.js";
import { renderSetup } from "./ui/setup.js";
import { renderOvertime, renderReport, renderHistory } from "./ui/report.js";
import { icon, appIcon, escapeHtml as e } from "./ui/icons.js";
import { renderAvatar } from "./ui/avatars.js";

const pendingStorageMessages = [];
const storage = new Storage(undefined, (message) => {
  if (document.querySelector("#toast")) toast(message);
  else pendingStorageMessages.push(message);
});
const preferenceValue = storage.read("preferences", {});
const preferences =
  preferenceValue && typeof preferenceValue === "object" ? preferenceValue : {};
let config = {
  professionId: "programmer",
  seed: 2026,
  strategy: defaultStrategy(),
  presetId: "balanced",
  osTheme: preferences.osTheme ?? "macos",
  pacing: "standard",
};
let scenario = createScenario(config.seed, config.professionId),
  regular,
  continuation,
  run,
  player,
  runId;
let modal = "setup",
  activeGroup = 0,
  selectedConversation = "boss",
  selectedFile = null,
  inspectUntil = 0,
  selectedIds = [],
  historyFilter = "all",
  drawerOpen = false,
  saveTimer;
const presetValue = storage.read("presets", []),
  historyValue = storage.read("history", []);
let customPresets = Array.isArray(presetValue)
    ? presetValue.filter((p) => p?.strategy && professions[p.professionId])
    : [],
  histories = Array.isArray(historyValue)
    ? historyValue.filter(
        (r) =>
          r?.input?.professionId &&
          professions[r.input.professionId] &&
          Array.isArray(r.performance?.dimensions),
      )
    : [],
  saved = storage.read("session");
let currentState = simulateRegular({ ...config, ...scenario }).initialState;
let simulatedAction = null,
  selectedSheet = null,
  activeWindowId = "work";
document.querySelector("#app").innerHTML = renderShell(professions.programmer);
document
  .querySelector(".desktop")
  .insertAdjacentHTML("beforeend", renderStartMenu(professions.programmer));
const $ = (selector) => document.querySelector(selector);
const openedWindows = new Set(["work", "wechat"]);
const wm = new WindowManager(
  $("#window-space"),
  () => {
    inspectUntil = performance.now() + 8000;
  },
  () => {
    syncDockState();
    saveSession();
  },
  (id) => {
    activeWindowId = id;
    openedWindows.add(id);
    $("#app-menus").innerHTML = appMenus(
      professions[regular?.input.professionId ?? config.professionId],
      id,
    );
    syncDockState();
  },
);
function syncDockState() {
  document.querySelectorAll(".dock .dock-icon[data-open]").forEach((button) => {
    const id = button.dataset.open;
    const active = id === activeWindowId && !wm.windows.get(id)?.hidden;
    button.classList.toggle("is-running", openedWindows.has(id));
    button.classList.toggle("is-active", active);
  });
}
const W = $("#window-space").clientWidth,
  H = $("#window-space").clientHeight;
const workContent = wm.create(
  "work",
  "refund.ts — refund-service — Visual Studio Code",
  "",
  {
    x: Math.max(35, W * 0.055),
    y: 40,
    w: W * 0.7,
    h: H - 64,
  },
);
const chatContent = wm.create("wechat", "微信", "", {
  x: W * 0.61,
  y: 88,
  w: Math.max(380, W * 0.35),
  h: Math.min(530, H - 100),
});
const briefContent = wm.create("brief", "今日任务 — 备忘录", "", {
  x: W * 0.18,
  y: 65,
  w: 390,
  h: Math.min(460, H - 80),
});
const finderContent = wm.create("finder", "文稿", "", {
  x: W * 0.15,
  y: 66,
  w: Math.max(500, W * 0.55),
  h: Math.min(440, H - 90),
});
wm.hide("finder");
wm.hide("brief");
wm.focus("work");
wm.focus("wechat");
function toast(message) {
  const node = document.querySelector("#toast");
  if (!node) return;
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (node.hidden = true), 5500);
}
function setTheme(os) {
  config.osTheme = os;
  document.body.dataset.os = os;
  $(".dock-start").innerHTML =
    os === "windows"
      ? '<span class="windows-start-symbol"><i></i><i></i><i></i><i></i></span>'
      : appIcon("finder", 51);
  if (os === "windows") {
    $(".dock-start").dataset.action = "start-menu";
    delete $(".dock-start").dataset.open;
  } else {
    $(".dock-start").dataset.open = "finder";
    delete $(".dock-start").dataset.action;
  }
  $(".dock-start").title = os === "windows" ? "开始" : "访达";
  $(".settings-dock").title = os === "windows" ? "设置" : "系统设置";
  $("#start-menu").hidden = true;
  $(".system-switch").innerHTML =
    `${icon(os === "macos" ? "windows" : "apple", 13)}<span>${os === "macos" ? "Windows 11" : "macOS Sonoma"}</span>`;
  $(".system-switch").setAttribute(
    "aria-label",
    `切换为 ${os === "macos" ? "Windows 11" : "macOS Sonoma"}`,
  );
  $("#app-menus").innerHTML = appMenus(
    professions[regular?.input.professionId ?? config.professionId],
    activeWindowId,
  );
  $("#apple-menu").hidden = true;
  storage.write("preferences", { osTheme: os });
  wm.resize();
  renderScene();
}
function renderWork() {
  const renderers = {
    code: () => renderVSCode(currentState, selectedFile),
    sheet: () => renderExcel(currentState, selectedSheet),
    document: () => renderWord(currentState),
    design: () => renderPhotoshop(currentState),
  };
  workContent.innerHTML = renderers[currentState.artifact.kind]();
  const profession =
    professions[regular?.input.professionId ?? config.professionId];
  const title =
    currentState.artifact.kind === "code"
      ? `${selectedFile ?? currentState.artifact.activeFile} — refund-service — Visual Studio Code`
      : currentState.artifact.kind === "sheet"
        ? "季度经营报表.xlsx - Excel"
        : currentState.artifact.kind === "document"
          ? "退款自助化 PRD.docx - Word"
          : "活动主视觉.psd @ 33.3% (RGB/8)";
  const titlebar = wm.windows.get("work").node;
  wm.setTitle("work", title);
  titlebar.dataset.app = profession.app;
  titlebar.querySelector(".window-app-icon").innerHTML = appIcon(
    profession.app,
    16,
  );
  $("#work-dock-icon").innerHTML = appIcon(profession.app, 51);
  $(".dock [data-open=work]").title = profession.appName;
  const startApp = $("#start-menu [data-open=work]");
  startApp.innerHTML = `${appIcon(profession.app, 40)}<span>${e(profession.appName)}</span>`;
  wm.windows.get("wechat").node.querySelector(".window-app-icon").innerHTML =
    appIcon("wechat", 16);
}
function renderBrief() {
  const input = regular?.input ?? { ...config, ...scenario },
    p = professions[input.professionId];
  briefContent.innerHTML = `<div class="brief-content"><div class="eyebrow">TODAY'S MISSION</div><h2>${e(input.taskBrief.title)}</h2><p>${e(input.taskBrief.background)}</p>${currentState.tasks.map((t, i) => `<div class="brief-task"><span class="task-check ${t.completed ? "done" : ""}">${t.completed ? icon("check", 13) : i + 1}</span><div><b>${e(t.title)}</b><small>${e(t.stage)} · ${Math.min(100, Math.round((t.doneWork / t.requiredWork) * 100))}%${t.dependsOn.length ? " · 有前置依赖" : ""}</small></div></div>`).join("")}<div class="brief-risk"><b>注意这些风险</b><p>${input.taskBrief.riskNotes.map(e).join("<br>")}</p><span>${p.riskName}：${Math.round(currentState.professionState.risk)}</span></div></div>`;
  wm.setTitle(
    "brief",
    config.osTheme === "windows"
      ? "今日任务.txt - 记事本"
      : "今日任务 — 备忘录",
  );
  wm.windows.get("brief").node.querySelector(".window-app-icon").innerHTML =
    appIcon("notes", 16);
  $(".dock [data-open=brief]").title =
    config.osTheme === "windows" ? "记事本" : "备忘录";
}
function renderScene(action) {
  renderWork();
  syncDockState();
  wm.setTitle("wechat", "微信");
  chatContent.innerHTML = renderWeChat(currentState, selectedConversation);
  renderBrief();
  finderContent.innerHTML = renderFinder(
    currentState,
    professions[regular?.input.professionId ?? config.professionId],
    config.osTheme,
  );
  wm.setTitle(
    "finder",
    config.osTheme === "windows" ? "文档 - 文件资源管理器" : "文稿",
  );
  wm.windows.get("finder").node.querySelector(".window-app-icon").innerHTML =
    appIcon(config.osTheme === "windows" ? "folder" : "finder", 16);
  const scroll = chatContent.querySelector(".chat-messages");
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
  const round = currentState.round;
  $("#round-label").textContent = round
    ? `ROUND ${String(round).padStart(2, "0")} / 12`
    : "第 0 / 12 轮";
  document.querySelectorAll("[data-round]").forEach((node) => {
    node.classList.toggle("done", +node.dataset.round < round);
    node.classList.toggle("current", +node.dataset.round === round);
  });
  const unread = currentState.messages.filter(
    (m) => m.status === "unread",
  ).length;
  $("#dock-unread").hidden = !unread;
  $("#dock-unread").textContent = unread > 99 ? "99+" : unread;
  $("#dock-unread").setAttribute("aria-label", `${unread} 条未读微信消息`);
  if (drawerOpen) renderDrawer();
  if (action && performance.now() > inspectUntil) {
    if (action.kind.startsWith("chat.") && action.kind !== "chat.defer") {
      const msg = currentState.messages.find(
        (m) => m.eventId === action.eventId && m.sender !== "self",
      );
      if (msg) selectedConversation = msg.source;
      chatContent.innerHTML = renderWeChat(currentState, selectedConversation);
      chatContent.querySelector(".chat-messages").scrollTop = 99999;
    }
    if (action.kind === "chat.reply" || action.kind === "work.advance") {
      const id = action.kind === "chat.reply" ? "wechat" : "work";
      if (!wm.windows.get(id).hidden) wm.focus(id);
    }
  }
  if (action?.kind === "chat.receive") {
    const message = currentState.messages.find(
      (m) => m.eventId === action.eventId,
    );
    if (message) {
      const node = $("#notification");
      node.innerHTML = `<span class="notification-icon">${renderAvatar(message.source, { className: "notification-avatar" })}<span class="notification-brand">${appIcon("wechat", 14)}</span></span><div><b>${people[message.source].name}<small>微信 · 现在</small></b><p>${e(message.text)}</p></div>`;
      node.hidden = false;
      clearTimeout(renderScene.notice);
      renderScene.notice = setTimeout(() => (node.hidden = true), 4200);
    }
  }
}
function renderControls() {
  const status = player?.status;
  $("#playback-title").textContent = !player
    ? "尚未开始"
    : status === "awaiting_choice"
      ? "一个关于下班的小决定"
      : status === "finished"
        ? "今日工作已完成"
        : status === "playing"
          ? "正在自动运行"
          : "已暂停";
  $("#playback-subtitle").textContent = !player
    ? "请先选择职业和工作策略"
    : `任务进度 ${Math.round(progress(currentState))}% · 体力 ${Math.round(currentState.energy)} · ${professions[regular.input.professionId].name}`;
  $("#pause-button").innerHTML = icon(
    status === "playing" ? "pause" : "play",
    19,
  );
  $(".speed-button").textContent = `${player?.speed ?? 1}×`;
  $(".live-dot").classList.toggle("idle", status !== "playing");
}
function renderModal() {
  const root = $("#modal-root");
  root.className = modal ? "modal-overlay" : "";
  if (modal) {
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute(
      "aria-label",
      {
        setup: "开局策略配置",
        overtime: "加班选择",
        report: "绩效报告",
        history: "历史对比",
      }[modal],
    );
  } else {
    ["role", "aria-modal", "aria-label"].forEach((name) =>
      root.removeAttribute(name),
    );
  }
  for (const node of document.querySelectorAll(
    ".system-bar, .desktop-game-menu, #apple-menu, #window-space, .dock, .playback-bar, .desktop-shortcuts",
  ))
    node.inert = !!modal;
  root.innerHTML =
    modal === "setup"
      ? renderSetup(config, scenario, {
          activeGroup,
          customPresets: customPresets.filter(
            (p) => p.professionId === config.professionId,
          ),
          hasSaved: !!saved && !player,
        })
      : modal === "overtime"
        ? renderOvertime(currentState)
        : modal === "report" && run
          ? renderReport(run)
          : modal === "history"
            ? renderHistory(histories, selectedIds, historyFilter)
            : "";
}
function renderDrawer() {
  const node = $("#drawer");
  node.hidden = !drawerOpen;
  if (!drawerOpen) return;
  const logs = [...(regular?.logs ?? []), ...(continuation?.logs ?? [])].filter(
    (l) => l.actionIds.some((id) => +id.slice(1) < (player?.index ?? 0)),
  );
  node.innerHTML = `<header><div><span class="eyebrow">BEHIND THE SCREEN</span><h2>这一天，为什么这样发生</h2></div><button data-action="status" class="icon-button" aria-label="关闭状态与日志">${icon("close")}</button></header><div class="drawer-metrics"><span>任务进度<b>${Math.round(progress(currentState))}%</b></span><span>剩余体力<b>${Math.round(currentState.energy)}</b></span><span>${professions[regular?.input.professionId ?? config.professionId].riskName}<b>${Math.round(currentState.professionState.risk)}</b></span><span>返工量<b>${currentState.rework}</b></span></div><div class="drawer-relations">老板 ${Math.round(currentState.relationships.boss)} · 客户 ${Math.round(currentState.relationships.client)} · 同事 ${Math.round(currentState.relationships.colleague)}</div><h3>因果日志 <small>${logs.length} 条</small></h3><div class="causal-logs">${
    logs
      .slice(-60)
      .reverse()
      .map(
        (log) =>
          `<details><summary><span>R${String(log.round).padStart(2, "0")}</span><p>${e(log.consequence)}</p></summary><div>规则：${e(log.triggeredRule)}<br>事件：${e(log.eventId)}${log.parentEventId ? " ← " + e(log.parentEventId) : ""}<br>任务：${e(log.relatedTaskId)}${log.stateDelta
            .filter(
              (p) =>
                typeof p.after === "number" && typeof p.before === "number",
            )
            .slice(0, 6)
            .map((p) => `<br>${e(p.path.join("."))}：${p.before} → ${p.after}`)
            .join("")}</div></details>`,
      )
      .join("") ||
    '<p class="muted">开始工作后，事件与决策会在这里留下记录。</p>'
  }</div>`;
}
function saveSession() {
  if (!player || !regular) return;
  clearTimeout(saveTimer);
  const data = {
    storageVersion: 1,
    runId,
    regular,
    continuation: continuation ?? null,
    overtimeChoice: continuation?.overtimeChoice ?? null,
    playback: player.getSaveState(),
    views: { osTheme: config.osTheme, layouts: wm.layouts() },
    savedAt: new Date().toISOString(),
  };
  storage.write("session", data);
  saved = data;
}
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveSession, 180);
}
function onFrame(action, fraction) {
  if (
    modal ||
    performance.now() < inspectUntil ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    $("#sim-cursor").hidden = true;
    $("#auto-typing").hidden = true;
    return;
  }
  const isChat = action.kind.startsWith("chat."),
    w = wm.windows.get(isChat ? "wechat" : "work");
  if (w.hidden) {
    $("#sim-cursor").hidden = true;
    $("#auto-typing").hidden = true;
    return;
  }
  const rect = w.node.getBoundingClientRect(),
    cursor = $("#sim-cursor");
  const targetX = isChat
    ? rect.left + rect.width * 0.62
    : rect.left + Math.min(360, rect.width * 0.6);
  const targetY =
    rect.top + (isChat ? rect.height * 0.67 : Math.min(170, rect.height * 0.5));
  if (simulatedAction !== action.actionId) {
    simulatedAction = action.actionId;
    cursor.style.left = `${targetX}px`;
    cursor.style.top = `${targetY}px`;
  }
  cursor.hidden = false;
  cursor.classList.toggle("clicking", fraction > 0.2 && fraction < 0.35);
  const typing = $("#auto-typing");
  typing.hidden = !(
    fraction > 0.35 &&
    fraction < 0.9 &&
    ["chat.reply", "work.advance", "work.change"].includes(action.kind)
  );
  if (!typing.hidden) {
    typing.textContent = action.payload.text.slice(
      0,
      Math.max(
        1,
        Math.floor(((fraction - 0.35) / 0.55) * action.payload.text.length),
      ),
    );
    typing.style.left = `${Math.min(innerWidth - 340, rect.left + 70)}px`;
    typing.style.top = `${rect.bottom - 75}px`;
  }
}
function loadPlayer(cursor = 0, speed = 1, autoPlay = true) {
  player?.destroy();
  player = new Player({
    initialState: regular.initialState,
    actions: [...regular.actions, ...(continuation?.actions ?? [])],
    cursor,
    speed,
    preset: config.pacing,
    onUpdate(p, action) {
      currentState = p.view;
      if (action) {
        $("#auto-typing").hidden = true;
        if (performance.now() > inspectUntil) {
          selectedFile = null;
          selectedSheet = null;
        }
        renderScene(action);
      }
      renderControls();
      scheduleSave();
    },
    onBoundary(p) {
      $("#sim-cursor").hidden = true;
      $("#auto-typing").hidden = true;
      modal = p.status === "finished" ? "report" : "overtime";
      if (p.status === "finished") {
        run = mergeSegments(regular, continuation);
        histories = addHistory(
          histories,
          historyRecord(runId, run, new Date().toISOString()),
        );
        storage.write("history", histories);
      }
      saveSession();
      renderModal();
    },
    onFrame,
  });
  currentState = player.view;
  renderScene();
  renderControls();
  if (autoPlay) player.play();
}
function start() {
  try {
    const input = validateRunInput({ ...config, ...scenario });
    const next = simulateRegular(input);
    regular = next;
    continuation = null;
    run = null;
    runId = crypto.randomUUID();
    modal = null;
    selectedFile = null;
    selectedSheet = null;
    selectedConversation = "boss";
    renderModal();
    loadPlayer();
    saveSession();
  } catch (err) {
    toast(err.message);
  }
}
function resume() {
  try {
    const data = validateSession(saved);
    regular = data.regular;
    continuation = data.continuation ?? null;
    runId = data.runId;
    config = {
      ...config,
      ...regular.input,
      pacing: data.playback.pacingPreset,
      osTheme: data.views?.osTheme ?? config.osTheme,
    };
    scenario = {
      taskBrief: regular.input.taskBrief,
      environment: regular.input.environment,
    };
    modal = null;
    setTheme(config.osTheme);
    loadPlayer(data.playback.nextActionIndex, data.playback.speed, false);
    wm.restore(data.views?.layouts);
    renderModal();
    if (player.index === player.actions.length) player.boundary();
    else toast("已恢复上次工作。点击播放继续。");
  } catch (err) {
    toast(err.message);
  }
}
function configure() {
  player?.pause();
  if (regular) {
    config = {
      ...config,
      professionId: regular.input.professionId,
      seed: regular.input.seed,
      strategy: structuredClone(regular.input.strategy),
    };
    scenario = createScenario(config.seed, config.professionId);
  }
  modal = "setup";
  renderModal();
}
function moveRule(id, offset) {
  const list = config.strategy.priorityRules,
    index = list.indexOf(id),
    target = index + offset;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  renderModal();
}
document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action !== "start-menu") $("#start-menu").hidden = true;
  if (button.dataset.action !== "apple-menu") $("#apple-menu").hidden = true;
  if (button.dataset.open) {
    wm.show(button.dataset.open);
    inspectUntil = performance.now() + 8000;
    return;
  }
  if (button.dataset.file) {
    wm.show("work");
    selectedFile = button.dataset.file;
    inspectUntil = performance.now() + 8000;
    renderWork();
    return;
  }
  if (button.dataset.sheet) {
    selectedSheet = +button.dataset.sheet;
    inspectUntil = performance.now() + 8000;
    renderWork();
    return;
  }
  if (button.dataset.conversation) {
    selectedConversation = button.dataset.conversation;
    inspectUntil = performance.now() + 8000;
    chatContent.innerHTML = renderWeChat(currentState, selectedConversation);
    return;
  }
  if (button.dataset.profession) {
    config.professionId = button.dataset.profession;
    config.strategy = presetStrategy(config.professionId, config.presetId);
    scenario = createScenario(config.seed, config.professionId);
    renderModal();
    return;
  }
  if (button.dataset.os) {
    setTheme(button.dataset.os);
    renderModal();
    return;
  }
  if (button.dataset.preset) {
    config.presetId = button.dataset.preset;
    config.strategy = presetStrategy(config.professionId, config.presetId);
    renderModal();
    return;
  }
  if (button.dataset.group) {
    activeGroup = +button.dataset.group;
    renderModal();
    return;
  }
  if (button.dataset.ruleUp) return moveRule(button.dataset.ruleUp, -1);
  if (button.dataset.ruleDown) return moveRule(button.dataset.ruleDown, 1);
  if (button.dataset.ruleRemove) {
    config.strategy.priorityRules = config.strategy.priorityRules.filter(
      (id) => id !== button.dataset.ruleRemove,
    );
    renderModal();
    return;
  }
  if (button.dataset.overtime !== undefined) {
    if (!player || player.status !== "awaiting_choice" || continuation) return;
    continuation = continueAfterOvertime(
      regular.checkpoint,
      button.dataset.overtime === "true",
    );
    player.append(continuation.actions);
    modal = null;
    saveSession();
    renderModal();
    player.play();
    return;
  }
  if (button.dataset.retry) {
    const record = histories.find((r) => r.runId === button.dataset.retry);
    if (record) {
      player?.pause();
      config = {
        ...config,
        ...record.input,
        strategy: structuredClone(record.input.strategy),
        presetId: "",
      };
      scenario = {
        taskBrief: record.input.taskBrief,
        environment: record.input.environment,
      };
      modal = "setup";
      renderModal();
    }
    return;
  }
  switch (button.dataset.action) {
    case "start":
      start();
      break;
    case "resume":
      resume();
      break;
    case "configure":
    case "reconfigure":
      configure();
      break;
    case "close-modal":
      modal = null;
      renderModal();
      break;
    case "history":
      player?.pause();
      modal = "history";
      renderModal();
      break;
    case "default-strategy":
      config.strategy = defaultStrategy(config.professionId);
      config.presetId = "balanced";
      renderModal();
      break;
    case "new-seed":
      config.seed = crypto.getRandomValues(new Uint32Array(1))[0];
      scenario = createScenario(config.seed, config.professionId);
      renderModal();
      break;
    case "save-preset":
      customPresets.push({
        professionId: config.professionId,
        strategy: structuredClone(config.strategy),
      });
      storage.write("presets", customPresets);
      toast("策略已保存，可在配置页再次选用。");
      renderModal();
      break;
    case "switch-os":
      setTheme(config.osTheme === "macos" ? "windows" : "macos");
      saveSession();
      break;
    case "fullscreen":
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch {
        toast("当前浏览器未开放全屏，已继续使用窗口模式。");
      }
      break;
    case "pause":
      if (!player) configure();
      else if (player.status === "playing") player.pause();
      else if (player.status === "finished") {
        modal = "report";
        renderModal();
      } else if (player.status === "awaiting_choice") {
        modal = "overtime";
        renderModal();
      } else player.play();
      break;
    case "next-key":
      player?.skipToNextKey();
      break;
    case "boundary":
      player?.skipToBoundary();
      break;
    case "speed":
      player?.setSpeed([1, 4, 12][([1, 4, 12].indexOf(player.speed) + 1) % 3]);
      break;
    case "status":
      drawerOpen = !drawerOpen;
      inspectUntil = drawerOpen ? Infinity : performance.now() + 3000;
      renderDrawer();
      break;
    case "start-menu":
      $("#start-menu").hidden = !$("#start-menu").hidden;
      inspectUntil = performance.now() + 8000;
      break;
    case "apple-menu":
      $("#apple-menu").hidden = !$("#apple-menu").hidden;
      inspectUntil = performance.now() + 8000;
      break;
  }
});
document.addEventListener("input", (event) => {
  const input = event.target,
    name = input.name;
  if (!name || modal !== "setup") return;
  if (input.type === "range") {
    const value = +input.value;
    input.style.setProperty(
      "--fill",
      `${((value - +input.min) / (+input.max - +input.min)) * 100}%`,
    );
    input.nextElementSibling.textContent = `${value}${+input.max === 100 ? "%" : ""}`;
    if (name.startsWith("special."))
      config.strategy.special[name.slice(8)] = value;
    else config.strategy[name] = value;
    config.presetId = "";
  }
});
document.addEventListener("change", (event) => {
  const input = event.target,
    name = input.name;
  if (input.dataset.compare) {
    selectedIds = input.checked
      ? [...selectedIds, input.dataset.compare]
      : selectedIds.filter((id) => id !== input.dataset.compare);
    renderModal();
    return;
  }
  if (name === "historyFilter") {
    historyFilter = input.value;
    renderModal();
    return;
  }
  if (modal !== "setup" || !name) return;
  if (name === "seed") {
    const seed = +input.value;
    if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
      toast("种子需要是 0～4294967295 的整数");
      return;
    }
    config.seed = seed;
    scenario = createScenario(seed, config.professionId);
    renderModal();
  } else if (name === "pacing") config.pacing = input.value;
  else if (name === "customPreset") {
    const p = customPresets.filter(
      (p) => p.professionId === config.professionId,
    )[+input.value];
    if (p) {
      config.strategy = structuredClone(p.strategy);
      config.presetId = "";
      renderModal();
    }
  } else if (name === "addRule") {
    const id = input.value,
      list = config.strategy.priorityRules;
    if (!id) return;
    if (list.length >= 4) toast("最多启用 4 条规则，请先移除一条。");
    else if (
      (id === "help_colleague" && list.includes("defer_colleague")) ||
      (id === "defer_colleague" && list.includes("help_colleague"))
    )
      toast("同事求助响应与推迟互斥，请先移除冲突规则。");
    else list.push(id);
    renderModal();
  } else if (name.startsWith("special."))
    config.strategy.special[name.slice(8)] =
      input.type === "checkbox"
        ? input.checked
        : input.type === "range"
          ? +input.value
          : input.value;
  else if (Object.hasOwn(config.strategy, name)) {
    config.strategy[name] = input.type === "range" ? +input.value : input.value;
    config.presetId = "";
  }
});
let draggedRule;
document.addEventListener("dragstart", (event) => {
  const node = event.target.closest("[data-rule]");
  if (node) {
    draggedRule = node.dataset.rule;
    event.dataTransfer.setData("text/plain", draggedRule);
  }
});
document.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-rule]")) event.preventDefault();
});
document.addEventListener("drop", (event) => {
  const node = event.target.closest("[data-rule]");
  if (!node || !draggedRule) return;
  event.preventDefault();
  const list = config.strategy.priorityRules,
    from = list.indexOf(draggedRule),
    to = list.indexOf(node.dataset.rule);
  if (from >= 0 && to >= 0) list.splice(to, 0, list.splice(from, 1)[0]);
  renderModal();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && player) {
    player.pause();
    saveSession();
  }
});
window.addEventListener("pagehide", saveSession);
window.addEventListener("resize", () => wm.resize());
function tickClock() {
  const time = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  $("#system-clock").textContent =
    `${new Date().getMonth() + 1}月${new Date().getDate()}日 周${"日一二三四五六"[new Date().getDay()]} ${time}`;
  $("#tray-clock").textContent = time;
  $("#tray-date").textContent = new Date().toLocaleDateString("zh-CN");
}
setTheme(config.osTheme);
tickClock();
setInterval(tickClock, 30000);
renderScene();
renderControls();
renderModal();
if (pendingStorageMessages.length) toast(pendingStorageMessages.at(-1));
