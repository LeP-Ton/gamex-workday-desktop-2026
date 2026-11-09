import { people } from "../data/professions.js";
import { icon, escapeHtml as e } from "./icons.js";

const sources = {
  boss: new URL("../assets/avatars/boss.jpg", import.meta.url).href,
  client: new URL("../assets/avatars/client.jpg", import.meta.url).href,
  colleague: new URL("../assets/avatars/colleague.jpg", import.meta.url).href,
  self: new URL("../assets/avatars/self.jpg", import.meta.url).href,
};

// 同一身份在列表、气泡和通知中复用同一资源，避免回放时头像发生变化。
export function renderAvatar(id, { className = "", unread = 0 } = {}) {
  const name = id === "self" ? "我" : (people[id]?.name ?? "工作助手");
  const count = Math.max(0, Math.trunc(Number(unread)) || 0);
  return `<span class="avatar wechat-avatar ${e(className)}" data-avatar="${e(id)}">${
    sources[id]
      ? `<img src="${sources[id]}" width="256" height="256" alt="${e(name)}的头像" draggable="false">`
      : icon("chart", 21)
  }${count ? `<b class="unread-badge" aria-label="${count} 条未读消息">${count > 99 ? "99+" : count}</b>` : ""}</span>`;
}
