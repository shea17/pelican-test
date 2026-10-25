# Third-party notices

本项目的**代码**（`src/`、`tools/`、`public/` 下除 vendor 外的自有部分）以 MIT 许可发布，见 `LICENSE`。
**影片、封面、渲染帧与音轨**为自有作品，保留所有权利。

## 运行时依赖（随仓库提供 vendor 副本）

| 组件 | 版本 | 协议 | 版权 | 位置 |
|---|---|---|---|---|
| p5.js | 2.3.4 | LGPL-2.1 | p5.js contributors / Processing Foundation | `public/vendor/p5.min.js` |
| puppeteer-core | 25.x | Apache-2.0 | Google / Puppeteer contributors | `node_modules/`（不随仓库分发） |

> 早期版本曾把 [p5.brush](https://github.com/acamposuribe/p5.brush)（MIT，© 2023–2026 Alejandro Campos Uribe）用作笔刷引擎。
> 实测它在 2D 画布下直接抛错、只能跑 WEBGL，而 framebuffer 分层又不可靠，最终整套笔法改为自写的
> "分段收细折线"（`src/kit/stroke.js`），比 brush 快两个数量级。**该依赖已彻底移除**，仓库内不留副本。

p5.js 以 LGPL-2.1 发布；本仓库以未修改的 vendor 副本形式引用，未做任何改动。

## 构建期工具（不随作品分发）

| 组件 | 版本 | 协议 | 说明 |
|---|---|---|---|
| ffmpeg | 9.0.2 full build (Gyan) | GPL-3.0-or-later | 仅用于把 PNG 序列编码成 MP4，不参与创作，不随片分发 |
| Chromium (Microsoft Edge) | 本机安装 | BSD-3-Clause 等 | Puppeteer 的渲染执行体，仅构建期使用 |

## 字体

标题与字幕使用操作系统自带字体（Noto Serif SC / Noto Sans SC / 宋体 / 楷体等），**不随仓库分发字体文件**。
Noto 系列为 SIL Open Font License 1.1；实际渲染依赖本机安装情况，见 `README.md`。

## 参考与致敬

本项目在**组织方式**上参考了 `Tunai-0511/meme67-art-history` 公开说明的"共用绘图工具包 + 节拍模块 + 每版块一个场景文件"做法。
该项目的代码为 MIT，但其**影片、封面、渲染帧、音轨与配音取样保留所有权利**——本项目**未使用、未改编、未复制**其中任何一项，
也未复制其源代码、美术简报文字、场景构图或笑点。相关声明见 `NOTICE.md`。

若未来复用该项目任何代码片段，必须在此处逐段保留其 MIT 版权声明并注明来源文件。

## 公有领域作品

片中致敬的历史作品均已进入公有领域：

- 《溪山行旅图》（范宽，约 1000）、《清明上河图》（张择端，约 1100）
- 《星月夜》（Vincent van Gogh，1889）、《呐喊》（Edvard Munch，1893）
- 《诺斯费拉图》（Nosferatu, 1922，F. W. Murnau）
- 撒哈拉塔西里岩画、埃及墓室壁画、汉画像石、唐代白描、玛雅抄本、莫卧儿细密画、八大山人写意、爪哇皮影、广重东海道系列、早期示波器显示

上述均为**风格致敬与程序化重构**，不复刻任何具体作品的画面构图。

## 虚构界面

片中的聊天软件、短视频平台、游戏画面、新闻发布会席位均为**虚构界面**，名称、图标、吉祥物、提示音全部自绘自拟，
不使用任何真实产品、品牌、媒体机构的标志或素材。
