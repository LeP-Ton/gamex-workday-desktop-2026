import { defineConfig } from "vite";

export default defineConfig({
  // 资源地址相对构建文件解析，兼容 GitHub Pages 的仓库子目录和本地预览。
  base: "./",
});
