# Gate A Review — Round 1

Result: FAIL

Date: 2026-09-14 (reviewed) / 2026-09-15 (documented by Kimi K3 handoff)

Reviewed against canonical reference:
`docs/design/pixel-forge/pixel-forge-reference-approved.png`

> 说明：Round 1 评审在上一执行会话（Kimi K2.7 Code HighSpeed）中判定，
> 本文件由接手 Agent（Kimi K3）在 2026-09-15 补录落盘，
> 判定结论与差异清单以交接记录 + 接手时代码/参考图对照复核为准。

## Matches

- Home 不自动开局，CHESSFORGE 品牌标题与主 CTA（开始游戏 / 快速开始）存在。
- Setup 六类插件选择位齐全，全部从 PluginRegistry 枚举，无硬编码假数据。
- CURRENT LOADOUT 面板存在并与选择器联动。
- START MATCH 为主 CTA，配置非法时禁用，`role="alert"` 错误区存在。
- 基础 Pixel Forge 色板（深海军蓝底、暗金边框、硬阴影）方向正确。
- 无横向滚动，窄屏下 Setup 选择器可单列堆叠。

## P0

- HomePage 装饰小棋盘使用 Unicode chess glyph（`♜♞♝♛♚♟♙♖♘♗♕♔`，见 `src/pages/HomePage/HomePage.tsx` 的 `MiniChessBoard`）。spec §12 与最终验收要求生产代码 Unicode 棋子清零，首页装饰同样属于生产代码。

## P1

- Home 视觉完成度不足：参考图为完整夜间中世纪像素场景（夜空渐变、城堡/建筑剪影、云与星光、暖色灯光、底部工坊布景），当前实现为大面积纯色深蓝 + 孤立色块（书、蜡烛、箱子、猫各自为政），氛围与参考图明显不符。
- 金色 King 主视觉不合格：当前 SVG 为单色平涂 + `circle` 眼睛，无硬边像素轮廓、无多级明暗、无体积感，无法与 CHESSFORGE 形成品牌焦点。
- 图标语言错误：Home（King/Crown/Cat）与 MatchSetup（六个选择器图标、返回箭头、交叉剑、齿轮）均为 Feather/现代线性 SVG 风格，含 `circle`、圆角 linecap、平滑曲线，与像素硬边语言冲突。
- 字体策略未落实：两页 `Courier New` 通排。spec §9 要求双字体策略——品牌/标题/Button/英文 label 用像素展示字体，中文正文/插件名用清晰正文字体。
- Setup 面板层次感不足：外框、plugin card、icon container、selector 边框、LOADOUT 呈现整体接近普通 settings form，缺少游戏配置界面的硬边框 + 阶梯阴影层级。

## P2

- Home 菜单 disabled 按钮（插件说明/设置/关于）样式与可用按钮区分度弱。
- Setup 页脚 quote 字号过小，对比度偏低。
- PixelPanel 默认边框色 `#2f3d52` 偏冷灰蓝，与参考图旧铜/暗金边框语言有轻微偏差。

## Required fixes before next gate

1. HomePage 场景重建：夜空层次、建筑剪影、星光/云、暖色灯光、底部布景（书堆/蜡烛/黑猫/木箱/小棋盘）组成完整场景。
2. 重做金色 King：硬边像素轮廓、多级明暗、体积感。
3. 删除 Home 装饰棋盘全部 Unicode glyph，改用像素 silhouette/块状装饰（不提前实现 Task 6 正式棋子系统）。
4. Home 与 MatchSetup 全部图标改为整数坐标、crispEdges 的像素 SVG。
5. 落实双字体策略（像素展示字体 + 清晰正文字体），移除 Courier New 通排；字体资源本地化，不引入运行时外部 CDN。
6. MatchSetup 视觉强化：外层 frame、plugin card 层次、pixel icon container、selector 硬边框、阶梯阴影、标题层级、CURRENT LOADOUT 呈现、START MATCH 主 CTA。
7. 保持移动端：无横向滚动、无截断、CTA 可点、层级清晰。

## Environment note（观察项，不在本轮修复范围）

接手基线验证时，首次 `npm test` 曾出现一次 33 failed / 89 passed；
之后连续 3 次运行均 122/122 passed，`npm run build` exit 0。
目前仅作为环境抖动观察项记录，不在 Gate A visual fix 中扩大范围调查。
若后续复现，单独按 flake 排查。
