# 真实界面素材来源

采集日期：2026-11-09，时区 `Asia/Shanghai`。本机系统为 macOS Sonoma 14.2（23C64）。下列素材已保存到项目内，运行时不访问外部图床。

## 应用与系统图标

所有 PNG 均保留透明背景；本机导出的普通应用图标为 256×256，`vscode-windows.png` 为官网提供的 1024×1024 平面图标，`notepad.png` 为微软商店提供的 100×100 原图。

| 文件 | 原始资源及版本 | 用途 |
| --- | --- | --- |
| `icons/vscode.png` | `/Applications/Visual Studio Code.app/Contents/Resources/Code.icns`；Visual Studio Code 1.135.0 | macOS 中的 VS Code 应用图标 |
| `icons/vscode-windows.png` | [VS Code 官方品牌资源](https://code.visualstudio.com/brand)；[PNG 原文件](https://code.visualstudio.com/assets/branding/code-stable.png) | Windows 中无 macOS 底板的 VS Code 图标 |
| `icons/excel.png` | `/Applications/Microsoft Excel.app/Contents/Resources/Excel_macOS.icns`；Excel 16.114.4 | Excel 应用图标 |
| `icons/word.png` | `/Applications/Microsoft Word.app/Contents/Resources/Word_macOS.icns`；Word 16.114.4 | Word 应用图标 |
| `icons/photoshop.svg` | [Adobe 官方 Photoshop SVG](https://www.adobe.com/cc-shared/assets/img/product-icons/svg/photoshop.svg)；文件自身标识 `photoshop-2025` | Photoshop 官方产品图标，保留 SVG |
| `icons/wechat.png` | `/Applications/WeChat.app/Contents/Resources/AppIcon.icns`；微信 3.8.7 | 微信应用图标 |
| `icons/finder.png` | `/System/Library/CoreServices/Finder.app/Contents/Resources/Finder.icns` | 访达 |
| `icons/folder.png` | `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericFolderIcon.icns` | macOS 系统文件夹 |
| `icons/settings.png` | `/System/Applications/System Settings.app/Contents/Resources/Assets.car`，资源名 `PrefApp` | 系统设置 |
| `icons/terminal.png` | `/System/Applications/Utilities/Terminal.app/Contents/Resources/Terminal.icns` | 终端 |
| `icons/safari.png` | `/Applications/Safari.app/Contents/Resources/AppIcon.icns`；Safari 17.2 | Safari 浏览器 |
| `icons/trash.png` | `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/TrashIcon.icns` | 废纸篓 |
| `icons/notes.png` | `/System/Applications/Notes.app/Contents/Resources/AppIcon.icns` | 备忘录 |
| `icons/notepad.png` | [Microsoft Store 的 Windows Notepad](https://apps.microsoft.com/detail/9msmlrh6lzf3)，公开目录产品 ID `9MSMLRH6LZF3`、发布者 `Microsoft Corporation`；[100×100 官方 Logo 原图](https://store-images.s-microsoft.com/image/apps.10047.13825011251621706.e8a531ea-e643-41b9-8969-8a0182f70030.a3e757b8-b4d7-449c-9001-20798f9f0481) | Windows 记事本蓝色图标，保留原图，不放大重绘 |
| `icons/windows-settings.svg` | [微软 Fluent UI System Icons 原文件](https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Settings/SVG/ic_fluent_settings_48_regular.svg) | 微软原版设置符号；属于 Fluent 符号，并非 Windows 设置应用完整立体图标 |
| `icons/explorer.svg` | [微软 Fluent Emoji 原文件](https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/File%20folder/Color/file_folder_color.svg) | 微软原版彩色文件夹；属于 Fluent 文件夹素材，并非资源管理器程序二进制内的应用图标 |
| `icons/computer.svg` | [微软 Fluent Emoji 的 Desktop computer 原文件](https://github.com/microsoft/fluentui-emoji/blob/main/assets/Desktop%20computer/Color/desktop_computer_color.svg)，原始下载链接两次超时后通过 [jsDelivr 仓库镜像](https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Desktop%20computer/Color/desktop_computer_color.svg)取得 | 微软 Fluent 彩色桌面电脑素材，用作“此电脑”入口；不是从 Windows 二进制提取的“此电脑”原图标 |

本机 ICNS 图标通过 `sips` 做格式转换与尺寸缩放；系统设置通过 AppKit 从应用资源包读取 `PrefApp` 后导出 PNG。没有使用 AI 生成或重新绘制品牌图标。

Fluent 图标对应的原仓库许可文件分别保存在 [System Icons 许可](LICENSE-fluentui-system-icons.txt) 和 [Emoji 许可](LICENSE-fluentui-emoji.txt)。其他品牌图标与系统图片的权利仍属于其原厂商，本文件记录来源，不将其标记为本项目原创素材。

## 系统壁纸

| 文件 | 来源与处理 | 实际尺寸 |
| --- | --- | --- |
| `wallpapers/macos.jpg` | 本机 `/System/Library/Desktop Pictures/Sonoma.heic` 的明亮帧；使用 libheif 解码后缩小为 JPEG | 2560×2560 |
| `wallpapers/windows.jpg` | [Six N. Five 的 Windows 11 原壁纸项目页](https://sixnfive.com/projects/windows-11/)公开展示的 Bloom 明亮版；[原图](https://sixnfive.com/wp-content/uploads/2021/07/hero_light_02.jpg)原样保存 | 2500×1667 |
| `wallpapers/windows-surface-hub.jpg` | [Microsoft Learn 的 Surface Hub 壁纸说明](https://learn.microsoft.com/en-us/surface-hub/install-wallpaper-surface-hub)中提供的[官方 Bloom 图片](https://learn.microsoft.com/en-us/surface-hub/images/oembackgroundimage.png)，缩小为 JPEG | 2560×720 |

Windows 主壁纸来自原作者项目页，并不是超宽版的拉伸；超宽版仅作为微软官方来源的备用素材。桌面采用 `background-size: cover` 时会随视口裁切，原文件不做合成。素材均已目视核验，其中 macOS HEIC 的系统默认解码曾输出黑帧，已改为软件解码并替换为正确的 Sonoma 明亮帧。

## 验证

- 项目浏览器标签图标 `public/favicon.svg` 为自行绘制的窗口符号，用于 GitHub Pages 入口，不属于上述第三方系统或软件素材。
- 图标和壁纸的格式、尺寸与文件头经本地工具检查。
- Photoshop 与三份 Fluent SVG 均已检查，不包含脚本、外部资源引用或事件处理器。
- 实际在页面中的展示、主题切换、窗口及软件交互由主需求的界面阶段统一验收。

## Windows 任务栏返修素材

采集日期：2026-11-09。以下素材替代 Windows 主题中的 macOS 底板或通用符号，旧文件保留历史来源记录。

| 文件 | 来源与处理 | 用途 |
| --- | --- | --- |
| `icons/wechat-windows.png` | [微信 Windows 官网](https://pc.weixin.qq.com/)直接引用的[官网图标](https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico)；实际文件为 32×32 透明 PNG，仅按真实格式命名，无重新绘制 | Windows 微信入口的透明绿色微信标识，区别于 macOS 圆角底板；来自官网，不宣称从 Windows EXE 提取 |
| `icons/settings-windows.png` | [Windows Settings app icon (2).png](https://commons.wikimedia.org/wiki/File:Windows_Settings_app_icon_(2).png)，文件页记录作者为 Microsoft、2023-02-13 从 `ImmersiveControlPanel` 提取的 Windows 11 图标；[256×256 原图](https://upload.wikimedia.org/wikipedia/commons/0/0f/Windows_Settings_app_icon_%282%29.png) | 使用灰色立体齿轮和蓝色内圈，替代原线框设置符号 |
| `icons/file-explorer-windows.png` | [Microsoft PowerToys 官方仓库图标](https://github.com/microsoft/PowerToys/blob/main/doc/images/icons/File%20Explorer%20Preview.png)，192×192 透明 PNG，原样保存；原仓库许可保存在 [PowerToys 许可](LICENSE-powertoys.txt) | 黄色文件夹与蓝色夹扣的 Windows 风格文档入口，替代通用 Emoji 文件夹；不宣称从本机 Windows 提取 |
| `icons/excel-windows.svg` | [微软 Office 官方 CDN](https://res.cdn.office.net/files/fabric-cdn-prod_20221201.001/assets/brand-icons/product/svg/excel_48x1.svg)，`fabric-cdn-prod_20221201.001` 版产品图标 | Windows Excel 平面产品图标，与本机 macOS 图标分别使用 |
| `icons/word-windows.svg` | [微软 Office 官方 CDN](https://res.cdn.office.net/files/fabric-cdn-prod_20221201.001/assets/brand-icons/product/svg/word_48x1.svg)，`fabric-cdn-prod_20221201.001` 版产品图标 | Windows Word 平面产品图标，与本机 macOS 图标分别使用 |

设置图标的 curl 下载两次遇到 SSL 连接超时，改用独立 Chrome 后取得原图。微软支持页提供的 16×16 图标仅作来源核对，未用其放大替代原图。品牌权利仍归原厂商；记录来源不代表项目统一授予这些素材开源许可。新增 Office SVG 经检查不含脚本、外部引用或事件处理器。

## 微信照片式头像

`avatars/boss.jpg`、`client.jpg`、`colleague.jpg` 与 `self.jpg` 为 imagegen 内置工具生成的虚构联系人生活照及宠物照，项目导出为 256×256 JPEG。它们不属于真实软件原厂素材，也不对应真实个人。完整提示词、身份映射与原始文件记录见[头像素材说明](avatars/README.md)。
