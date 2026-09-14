# ChessForge Pixel Forge UI V2 — Claude Code Start Prompt

你正在实现 ChessForge Default UI V2。

执行环境是 Claude Code + Kimi K3。你具有视觉输入能力，但必须遵守已批准设计，而不是自行重新设计。

首先做以下事情，不要立刻修改代码：

1. 读取并视觉检查：
   `docs/design/pixel-forge/pixel-forge-reference-approved.png`

2. 读取：
   `docs/superpowers/specs/2026-09-14-default-ui-v2-pixel-art-design.md`

3. 读取：
   `docs/superpowers/plans/2026-09-14-default-ui-v2-pixel-art.md`

4. 读取：
   `docs/reviews/PIXEL-FORGE-VISUAL-GATES.md`

5. 输出 `Visual Reference Readback`，必须具体描述：
   - HomePage 构图
   - MatchSetupPage 构图
   - GamePage 构图
   - 色彩/材质
   - Panel/Button
   - 棋盘
   - 白棋/黑棋
   - HUD 信息层级

如果你无法实际看到参考图片，停止，不要猜。

然后检查当前 git 状态和项目基线。按照 implementation plan 的 Task 0 开始，使用 TDD。每完成一个 Task 做一次验证和 commit。到 Gate A / B / C 时暂停后续视觉任务，先用当前运行截图与批准图做多模态对比，修完 P0/P1 差异再继续。

特别约束：

- 不重写 GameCore / ChessJsRulePlugin。
- BoardPluginProps 保持稳定。
- 不扩 ThemePlugin V2。
- 不使用 Unicode 国际象棋棋子。
- 不新增 Stockfish / Online / Account / Elo / Timer / Cloud。
- 不允许仅凭测试通过就宣布视觉完成。
