# 渲染笔记

实测记录，用来避免重复踩坑。日期：2026-10-24。

> 文中第 1 条提到的 p5.brush 已于最终整理时**彻底移除**（依赖、vendor 副本、所有调用），
> 整套笔法改为 `src/kit/stroke.js` 的自写实现。这里保留原始记录，是因为"为什么不能用它"本身是结论。

## 1. p5.brush 2.2.3 强制 WEBGL

2D 画布下直接抛错：

```
p5.brush could not resolve an active WEBGL sketch. Call brush.instance(p) and brush.load() after createCanvas(..., WEBGL).
```

**结论**：`createCanvas(W, H, WEBGL)`，没有第二选择。

## 2. `brush.load(framebuffer)` 不可靠 —— 放弃 Framebuffer 分层

想把两个版块分别画进 `p5.Framebuffer` 再合成（"画框里是下一版"），失败：
`fb.begin()/end()` 里普通 p5 图形能正确落盘，但 **p5.brush 的笔触会漏到主画布**，
表现为两个 fb 的内容互相串味、移位。试过在 `draw()` 内重置矩阵后再 `brush.load(fb)`，仍然漏。

**结论**：不用 Framebuffer 做双场景合成。

## 3. 采用的方案：WEBGL 画一次 + 2D 覆盖层遮罩

两层画布：

- `#gl` —— p5 WEBGL，1920×1080，只负责画。
- `#ui2d` —— 2D canvas，1920×1080，负责字、标题卡、画框边、以及转场的遮罩。

转场做法（`src/main/stage.js`）：

1. 正常渲染当前版块 A。
2. `snapCtx.drawImage(drawingContext.canvas)` 抓一张 A 的快照 —— **实测 0.2 ms**，几乎免费。
3. 把下一版块 B 按画框尺寸缩放进画面（`resetMatrix → translate(框中心) → scale(sf) → 还原相机`）。
4. 覆盖层：先贴 A 的快照，再 `clearRect(画框矩形)` 掏空，B 就从洞里露出来；最后描画框边。

这样同一时刻只有一版是"活"的，成本可控，且不需要任何裁剪 API。

WEBGL 画布默认 `preserveDrawingBuffer: true`（p5 内置），所以 `drawImage` 抓得到帧。

## 4. 中文不能画在 WEBGL 里

p5 WEBGL 的 `text()` 只认带字形数据的 TTF/OTF：

```
WEBGL: only Opentype (.otf) and Truetype (.ttf) fonts with glyph data are supported.
```

**结论**：所有文字走 2D 覆盖层（`src/kit/type.js`），用系统字体栈，不打包字体文件。
好处是 1080p 下字更锐、可做字距、可做遮罩。

## 5. `strokeWeight` 会随变换矩阵缩放

实测：同一 `strokeWeight(8)`，在 `scale(3)` 里画出来的线是 3 倍粗。
**所以线宽要用世界单位思考**，不要当成像素。满幅时 1 世界单位 = 1.92 px。

## 6. WEBGL 里 `bezierVertex` 会炸

`beginShape(); vertex(); bezierVertex(); endShape();` 抛 `Cannot read properties of undefined (reading 'map')`，
且抛错后整帧只画到出错处就停（画面只剩背景色）。

**结论**：曲线一律自己采样成折线（`kit/core.js` 的 `bez()`），只用 `vertex()`。

## 7. fps 对比实测

同一段（t = 5–8 s，版块 1 中段，横向位移明显）各渲一遍：

| fps | 帧数 | 单帧耗时 | 说明 |
|---|---|---|---|
| 30 | 90 | 116.9 ms | |
| 60 | 180 | 116.4 ms | |

单帧耗时几乎相同 —— 瓶颈是 **Puppeteer 截图**，不是绘制本身（绘制约 15–25 ms）。
所以 60fps 的代价约等于帧数翻倍（总时长 ×2），而不是每帧更贵。

**决定**：正片 60fps（横向推移与穿框推近更顺）；日常迭代用 30fps 省时间。
两者画面逻辑完全相同，只改 `--fps`。

## 8. 吞吐

6 个 worker（每个独立浏览器进程）：约 **28 帧/秒**。
30fps 全片 4110 帧 ≈ 2.5 分钟；60fps 全片 8220 帧 ≈ 5 分钟。

## 9. 穿框的生长曲线

画框从画面里长到撑满，若用双曲线 `sf = 0.12/(1-0.88q)`，末段导数发散，
最后 4 帧比例暴涨 37%，会闪。改成：

```
sf = 0.12 * exp(ln(1/0.12) * q^2.4)
```

末值正好 1，末段每帧变化约 6%，读作"加速逼近"而不是"抽搐"。

## 10. 待办

- 14 → 15 的"通电"转场（影子上色成荧光绿）尚未实现，当前走通用穿框。
- 20 → Outro 目前是硬切，考虑做成"画框拉远成展墙"的匹配剪辑。
