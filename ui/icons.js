const paths = {
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/>',
  sheet:
    '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 9v12"/>',
  document: '<path d="M14 3H5v18h14V8zm0 0v5h5M8 12h8M8 16h6"/>',
  design:
    '<path d="m12 3 9 9-9 9-9-9z"/><path d="m12 3 3 9-3 9-3-9zM3 12h18"/>',
  chat: '<path d="M21 11c0 4-4 7-9 7l-5 3v-4c-3-1-5-3-5-6 0-4 4-7 10-7s9 3 9 7Z"/><path d="M8 11h.01M15 11h.01"/>',
  play: '<path d="m9 5 11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  next: '<path d="m5 5 9 7-9 7zM18 5v14"/>',
  skip: '<path d="m3 5 8 7-8 7zm9 0 8 7-8 7z"/>',
  settings:
    '<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.5 5.5 8 8m8 8 2.5 2.5m0-13L16 8M8 16l-2.5 2.5"/><circle cx="12" cy="12" r="5"/>',
  history: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6m3-3v6l4 2"/>',
  chart: '<path d="M4 3v18h17M8 16v-5m5 5V6m5 10V9"/>',
  folder: '<path d="M3 6h6l2 3h10v11H3z"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  energy: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  expand: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  minus: '<path d="M5 12h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  apple:
    '<path d="M13 6c0-3 2-4 4-4 0 2-1 4-4 4Zm-1 2C6 3 1 10 5 17c2 5 4 5 7 3 3 2 5 2 8-4-4-2-4-6-1-8-2-2-5-2-7 0Z"/>',
  windows:
    '<path d="M3 5l8-1v8H3zm10-1 8-1v9h-8zM3 14h8v7l-8-1zm10 0h8v9l-8-1z"/>',
  wifi: '<path d="M2 8a17 17 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a5 5 0 0 1 8 0m-4 4h.01"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  files: '<path d="M8 3H3v14h5M8 7h9l4 4v10H8zM16 7v5h5"/>',
  git: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10m0-5c8 0 12-1 12-4"/>',
  debug:
    '<path d="m7 3 3 4m7-4-3 4M8 7h8v12l-4 3-4-3zm-5 3h5m8 0h5M3 16h5m8 0h5M12 7v14"/>',
  extensions: '<path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"/>',
  account:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="9" r="3"/><path d="M5 19c1-6 13-6 14 0"/>',
  bell: '<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zm5 3h4"/>',
  copy: '<path d="M8 7H3V3h13v4M8 7h13v14H8z"/>',
  paste: '<path d="M8 5H4v16h16V5h-4M8 3h8v4H8z"/>',
  cut: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8 8 13 13M8 16 21 3"/>',
  undo: '<path d="m8 3-5 5 5 5M3 8h10a7 7 0 0 1 0 14"/>',
  redo: '<path d="m16 3 5 5-5 5m5-5H11a7 7 0 0 0 0 14"/>',
  save: '<path d="M3 3h16l2 2v16H3zm4 0v7h10V3M7 21v-7h10v7"/>',
  align: '<path d="M3 5h18M3 10h12M3 15h18M3 20h12"/>',
  grid: '<rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M3 15h18M9 3v18m6-18v18"/>',
  smile:
    '<circle cx="12" cy="12" r="9"/><path d="M8 9h.01M16 9h.01M7 14c3 5 7 5 10 0"/>',
  contacts:
    '<rect x="5" y="3" width="14" height="18" rx="1"/><circle cx="12" cy="9" r="2.5"/><path d="M8 17c0-5 8-5 8 0M3 7h3M3 12h3M3 17h3"/>',
  screenshot: '<path d="M3 10V3h7m4 0h7v7M3 14v7h7m4 0h7v-7M7 7h10v10H7z"/>',
  phone: '<path d="M5 3h4l2 5-3 2c2 4 3 5 7 7l2-3 5 2v4c-1 7-22-7-17-17Z"/>',
  video:
    '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 6-4v12l-6-4"/>',
  move: '<path d="M12 2v20M2 12h20M9 5l3-3 3 3M9 19l3 3 3-3M5 9l-3 3 3 3m14-6 3 3-3 3"/>',
  marquee: '<rect x="3" y="4" width="18" height="16" stroke-dasharray="2 2"/>',
  lasso:
    '<path d="M17 17c-5 5-19 0-13-9 6-8 24-2 15 6-3 3-9 3-9 7 0 3 7 2 8-1"/>',
  crop: '<path d="M6 2v16h16M2 6h16v16M9 6h9M6 9v9"/>',
  eyedropper: '<path d="m16 3 5 5-4 4-5-5zM4 16l8-9 5 5-9 8H3zM3 21l2-2"/>',
  brush:
    '<path d="m10 14 9-12 3 3-12 10M10 14c-1-3-6-2-6 2s-2 4-2 4c5 2 11-1 8-6Z"/>',
  stamp: '<path d="M4 17h16v4H4zM8 17v-4h8v4M10 13V8c-4-7 8-7 4 0v5"/>',
  eraser: '<path d="m3 14 10-11 9 8-10 11H9zM7 10l9 8M12 22h10"/>',
  pen: '<path d="m3 21 5-16 13-3-3 13zM3 21l10-10"/><circle cx="14" cy="9" r="2"/>',
  hand: '<path d="M5 11V7c0-3 3-3 3 0v5-8c0-3 3-3 3 0v8-9c0-3 3-3 3 0v9-7c0-3 3-3 3 0v7l2-2c2-2 4 0 2 3l-5 8H8L2 13c-1-3 2-4 3-2Z"/>',
  eye: '<path d="M2 12c5-9 15-9 20 0-5 9-15 9-20 0Z"/><circle cx="12" cy="12" r="3"/>',
  layers: '<path d="m12 2 10 6-10 6L2 8zm-10 11 10 6 10-6M2 18l10 6 10-6"/>',
  trash: '<path d="M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  power: '<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>',
  control:
    '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="17" r="3" fill="currentColor"/>',
  volume:
    '<path d="M3 9h4l5-5v16l-5-5H3zm13-2c4 3 4 7 0 10m3-13c6 5 6 11 0 16"/>',
};
const appAssets = {
  vscode: "vscode.png",
  excel: "excel.png",
  word: "word.png",
  photoshop: "photoshop.svg",
  wechat: "wechat.png",
  finder: "finder.png",
  folder: "folder.png",
  settings: "settings.png",
  terminal: "terminal.png",
  safari: "safari.png",
  trash: "trash.png",
  notes: "notes.png",
  "vscode-windows": "vscode-windows.png",
  explorer: "explorer.svg",
  "windows-settings": "windows-settings.svg",
  notepad: "notepad.png",
  computer: "computer.svg",
  "wechat-windows": "wechat-windows.png",
  "settings-windows": "settings-windows.png",
  "file-explorer-windows": "file-explorer-windows.png",
  "excel-windows": "excel-windows.svg",
  "word-windows": "word-windows.svg",
};
export const appIcon = (name, size = 32, className = "") => {
  const source = (key) =>
    new URL(
      `../assets/icons/${appAssets[key] ?? appAssets.folder}`,
      import.meta.url,
    ).href;
  const img = (key, extra = "") =>
    `<img class="app-icon ${className} ${extra}" src="${source(key)}" width="${size}" height="${size}" alt="" aria-hidden="true" draggable="false">`;
  const windows = {
    vscode: "vscode-windows",
    excel: "excel-windows",
    word: "word-windows",
    wechat: "wechat-windows",
    folder: "file-explorer-windows",
    settings: "settings-windows",
    notes: "notepad",
  }[name];
  return windows
    ? `<span class="platform-icon" style="--app-icon-size:${size}px">${img(name, "mac-asset")}${img(windows, "windows-asset")}</span>`
    : img(name);
};
export const icon = (name, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.document}</svg>`;
export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
