import { people } from "../data/professions.js";
import { icon, escapeHtml as e } from "../ui/icons.js";
const conversationTime = new Date().toLocaleTimeString("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
});
export function renderWeChat(state, selected = "boss") {
  const person = people[selected] ?? people.boss;
  const thread = state.messages.filter((m) => m.conversationId === selected);
  return `<div class="wechat-app"><div class="wechat-rail"><span class="self-avatar">我</span><span class="wechat-active" title="聊天">${icon("chat", 25)}</span><span title="通讯录">${icon("contacts", 24)}</span><span title="收藏">${icon("folder", 23)}</span><span class="rail-bottom">☰</span></div>
  <div class="chat-list"><div class="chat-search">${icon("search", 13)}<span>搜索</span><b>＋</b></div>${[
    "boss",
    "client",
    "colleague",
  ]
    .map((id) => {
      const p = people[id],
        msgs = state.messages.filter((m) => m.conversationId === id),
        last = msgs.at(-1),
        unread = msgs.filter((m) => m.status === "unread").length;
      return `<button data-conversation="${id}" class="conversation ${id === selected ? "selected" : ""}"><span class="avatar" style="--avatar:${p.color}">${p.initials}${unread ? `<b class="unread-badge">${unread}</b>` : ""}</span><span class="conversation-text"><strong>${p.name}<time>${last ? conversationTime : ""}</time></strong><small>${last ? e(last.text) : p.role}</small></span></button>`;
    })
    .join("")}</div>
  <section class="chat-thread"><header><strong>${person.name}</strong><span>···</span></header><div class="chat-messages" id="chat-content"><div class="chat-day">${conversationTime}</div>${thread.map((m) => `<div class="message ${m.sender === "self" ? "outgoing" : "incoming"}"><span class="avatar" style="--avatar:${m.sender === "self" ? "#8695b4" : person.color}">${m.sender === "self" ? "我" : person.initials}</span><div><div class="message-bubble">${e(m.text)}</div></div></div>`).join("")}</div>
  <footer class="chat-compose"><div class="compose-tools"><span>${icon("smile", 20)}</span><span>${icon("folder", 20)}</span><span>${icon("screenshot", 20)}</span><span class="compose-call">${icon("phone", 19)} &nbsp; ${icon("video", 21)}</span></div><div class="compose-draft" aria-label="消息输入框，由工作策略自动处理" aria-readonly="true"></div><div class="compose-bottom"><span>按 Enter 键发送，Ctrl + Enter 键换行</span><button disabled><span class="send-macos">发送</span><span class="send-windows">发送(S)</span></button></div></footer></section></div>`;
}
