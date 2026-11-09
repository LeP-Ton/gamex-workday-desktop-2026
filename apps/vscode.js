import { icon, escapeHtml as e } from "../ui/icons.js";
function highlight(line) {
  const pattern =
    /\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:import|from|export|async|await|function|const|let|return|if|throw|new|interface|describe|it|expect)\b|\b(?:string|number|boolean|RefundRequest)\b|\b\d+\b/g;
  let html = "",
    end = 0;
  for (const match of line.matchAll(pattern)) {
    html += e(line.slice(end, match.index));
    const token = match[0],
      type = token.startsWith("//")
        ? "comment"
        : /^["']/.test(token)
          ? "string"
          : /^(string|number|boolean|RefundRequest)$/.test(token)
            ? "type"
            : /^\d/.test(token)
              ? "number"
              : "keyword";
    html += `<span class="syntax-${type}">${e(token)}</span>`;
    end = match.index + token.length;
  }
  return html + e(line.slice(end));
}
export function renderVSCode(state, selectedFile) {
  const a = state.artifact;
  const file =
    selectedFile && a.files[selectedFile] !== undefined
      ? selectedFile
      : a.activeFile;
  const lines = (a.files[file] ?? "")
    .replace("// GameX 工作区 · 自动生成的仿真代码", "// refund-service / src")
    .split("\n");
  const symbol = (name) =>
    `<span class="file-symbol ${name.endsWith(".md") ? "md" : "ts"}">${name.endsWith(".md") ? "M↓" : "TS"}</span>`;
  const symbols = [
    ...(a.files[file] ?? "").matchAll(/(?:function|interface)\s+(\w+)/g),
  ].map((match) => match[1]);
  return `<div class="vscode-app"><div class="vscode-menubar"><span>文件(F)</span><span>编辑(E)</span><span>选择(S)</span><span>查看(V)</span><span>转到(G)</span><span>运行(R)</span><span>终端(T)</span><span>帮助(H)</span></div>
  <div class="editor-app"><aside class="activity-bar">${["files", "search", "git", "debug", "extensions"].map((name, i) => `<span class="${i === 0 ? "active" : ""}" title="${["资源管理器", "搜索", "源代码管理", "运行和调试", "扩展"][i]}">${icon(name, 24)}</span>`).join("")}<div class="activity-bottom"><span>${icon("account", 24)}</span><span>${icon("settings", 24)}</span></div></aside>
  <aside class="file-explorer"><div class="explorer-heading">资源管理器 <span>···</span></div><div class="project-label">⌄ &nbsp; REFUND-SERVICE</div><div class="explorer-folder">⌄ ${icon("folder", 13)} src</div>${Object.keys(
    a.files,
  )
    .map(
      (name) =>
        `<button class="file-entry ${name === file ? "selected" : ""}" data-file="${e(name)}">${symbol(name)}${e(name)}${a.diagnostics.some((d) => d.file === name) ? '<b class="error-dot">1</b>' : ""}</button>`,
    )
    .join(
      "",
    )}<div class="explorer-section">⌄ &nbsp; 大纲</div>${symbols.map((name) => `<div class="outline-item"><span>ƒ</span> ${e(name)}</div>`).join("")}<div class="explorer-timeline">› &nbsp; 时间线</div></aside>
  <div class="editor-main"><div class="editor-tabs">${[...new Set([file, "refund.test.ts"])].map((name) => `<button data-file="${e(name)}" class="editor-tab ${file === name ? "active" : ""}">${symbol(name)}${e(name)}<span>×</span></button>`).join("")}<span class="editor-more">${icon("debug", 14)} &nbsp; ${icon("grid", 13)} &nbsp; ···</span></div><div class="breadcrumbs">src <span>›</span> ${symbol(file)}${e(file)}</div>
  <div class="code-area" id="work-content"><div class="code-lines">${lines.map((line, i) => `<div class="code-line ${i === 4 ? "current-line" : ""}"><span class="line-number">${i + 1}</span><code>${highlight(line)}${i === 4 ? '<span class="text-caret"></span>' : ""}</code></div>`).join("")}</div><div class="code-minimap">${lines.map((line) => `<i class="${line.trim().startsWith("//") ? "comment-map" : ""}" style="width:${Math.max(3, Math.min(100, line.length * 1.4))}%"></i>`).join("")}</div></div>
  <div class="terminal-panel"><div class="terminal-tabs"><span>问题 ${a.diagnostics.length ? `<em>${a.diagnostics.length}</em>` : ""}</span><span>输出</span><span>调试控制台</span><b>终端</b><span>端口</span><small>⌘ zsh &nbsp; + &nbsp; ˅ &nbsp; ${icon("trash", 12)} &nbsp; ⌃ &nbsp; ×</small></div><div class="terminal-lines"><span class="terminal-path">➜ &nbsp; refund-service <i>git:(main)</i></span>${a.terminal
    .slice(-7)
    .map(
      (line) =>
        `<div class="${line.startsWith("✓") ? "terminal-success" : line.startsWith("✕") ? "terminal-error" : ""}">${e(line)}</div>`,
    )
    .join(
      "",
    )}<div><span class="terminal-prompt">❯</span><span class="terminal-caret"></span></div></div></div></div>
  <div class="editor-status"><span class="remote-status">${icon("chevron", 13)}</span><span>${icon("git", 12)} main &nbsp; ↻ &nbsp; ⓧ ${a.diagnostics.length} &nbsp; ⚠ 0</span><span>行 5，列 1 &nbsp; 空格: 2 &nbsp; UTF-8 &nbsp; LF &nbsp; { } TypeScript &nbsp; ${icon("bell", 12)}</span></div></div></div>`;
}
