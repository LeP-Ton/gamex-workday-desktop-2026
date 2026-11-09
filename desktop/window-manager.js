import { icon, escapeHtml as e } from "../ui/icons.js";
export class WindowManager {
  constructor(
    container,
    onInteraction = () => {},
    onChange = () => {},
    onFocus = () => {},
  ) {
    this.container = container;
    this.windows = new Map();
    this.z = 10;
    this.onInteraction = onInteraction;
    this.onChange = onChange;
    this.onFocus = onFocus;
  }
  create(id, title, content, layout) {
    const node = document.createElement("section");
    node.className = `app-window ${id}-window`;
    node.dataset.window = id;
    node.setAttribute("aria-label", title);
    node.innerHTML = `<header class="window-titlebar"><div class="traffic"><button data-window-command="close" aria-label="关闭${e(title)}">${icon("close", 10)}</button><button data-window-command="minimize" aria-label="最小化${e(title)}">${icon("minus", 10)}</button><button data-window-command="maximize" aria-label="最大化${e(title)}"><span class="maximize-glyph"></span></button></div><span class="window-app-icon"></span><div class="window-title">${e(title)}</div></header><div class="window-content">${content}</div><div class="resize-handle" aria-label="调整窗口大小"></div>`;
    this.container.append(node);
    this.windows.set(id, {
      node,
      layout: { ...layout },
      hidden: false,
      maximized: false,
    });
    this.apply(id);
    node.addEventListener("pointerdown", (event) => {
      this.focus(id);
      this.onInteraction();
      if (event.target.closest("[data-window-command]")) {
        const command = event.target.closest("[data-window-command]").dataset
          .windowCommand;
        command === "maximize" ? this.maximize(id) : this.hide(id);
        return;
      }
      if (event.target.closest("button, input, select, a")) return;
      if (event.target.closest(".resize-handle")) this.drag(event, id, true);
      else if (event.target.closest(".window-titlebar"))
        this.drag(event, id, false);
    });
    node
      .querySelector(".window-titlebar")
      .addEventListener("dblclick", (event) => {
        if (!event.target.closest("button")) this.maximize(id);
      });
    return node.querySelector(".window-content");
  }
  apply(id) {
    const item = this.windows.get(id),
      l = item.layout,
      width = this.container.clientWidth,
      height = this.container.clientHeight;
    if (item.maximized)
      Object.assign(item.node.style, {
        left: "10px",
        top: "8px",
        width: `${width - 20}px`,
        height: `${height - 16}px`,
      });
    else {
      l.w = Math.min(Math.max(300, l.w), width - 16);
      l.h = Math.min(Math.max(240, l.h), height - 16);
      l.x = Math.max(8, Math.min(l.x, width - l.w - 8));
      l.y = Math.max(8, Math.min(l.y, height - l.h - 8));
      Object.assign(item.node.style, {
        left: `${l.x}px`,
        top: `${l.y}px`,
        width: `${l.w}px`,
        height: `${l.h}px`,
      });
    }
    item.node.hidden = item.hidden;
  }
  focus(id) {
    const item = this.windows.get(id);
    if (!item) return;
    item.node.style.zIndex = ++this.z;
    this.windows.forEach((w, key) =>
      w.node.classList.toggle("focused", key === id),
    );
    this.onFocus(id);
  }
  setTitle(id, title) {
    const window = this.windows.get(id)?.node;
    if (!window) return;
    window.setAttribute("aria-label", title);
    window.querySelector(".window-title").textContent = title;
    for (const [command, label] of [
      ["close", "关闭"],
      ["minimize", "最小化"],
      ["maximize", document.body.dataset.os === "macos" ? "缩放" : "最大化"],
    ])
      window
        .querySelector(`[data-window-command=${command}]`)
        .setAttribute("aria-label", `${label}${title}`);
  }
  hide(id) {
    this.windows.get(id).hidden = true;
    this.apply(id);
    this.onChange();
  }
  show(id) {
    if (!this.windows.has(id)) return;
    this.windows.get(id).hidden = false;
    this.apply(id);
    this.focus(id);
    this.onChange();
  }
  maximize(id) {
    const w = this.windows.get(id);
    w.maximized = !w.maximized;
    this.apply(id);
    this.onChange();
  }
  drag(event, id, resize) {
    const w = this.windows.get(id);
    if (w.maximized) return;
    const start = { x: event.clientX, y: event.clientY, ...w.layout };
    const move = (evt) => {
      this.onInteraction();
      const dx = evt.clientX - event.clientX,
        dy = evt.clientY - event.clientY;
      if (resize) {
        w.layout.w = start.w + dx;
        w.layout.h = start.h + dy;
      } else {
        w.layout.x = start.x + dx;
        w.layout.y = start.y + dy;
      }
      this.apply(id);
    };
    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      this.onChange();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end, { once: true });
    event.preventDefault();
  }
  layouts() {
    return Object.fromEntries(
      [...this.windows].map(([id, w]) => [
        id,
        { ...w.layout, hidden: w.hidden, maximized: w.maximized },
      ]),
    );
  }
  restore(layouts) {
    for (const [id, layout] of Object.entries(layouts ?? {}))
      if (this.windows.has(id)) {
        const w = this.windows.get(id);
        w.layout = { x: layout.x, y: layout.y, w: layout.w, h: layout.h };
        w.hidden = Boolean(layout.hidden);
        w.maximized = Boolean(layout.maximized);
        this.apply(id);
      }
  }
  resize() {
    this.windows.forEach((_, id) => this.apply(id));
  }
}
