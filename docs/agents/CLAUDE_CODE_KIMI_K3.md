# Claude Code + Kimi K3 执行说明

## 1. 执行环境

本项目 UI V2 的指定执行端：

- Claude Code
- Kimi K3 backend
- Kimi K3 必须以多模态方式接收批准设计图

本轮 UI V2 的执行说明仅针对上述 Claude Code + Kimi K3 环境。

## 2. 开始前必须读取

按顺序：

1. `docs/design/pixel-forge/pixel-forge-reference-approved.png`
2. `docs/superpowers/specs/2026-09-14-default-ui-v2-pixel-art-design.md`
3. `docs/superpowers/plans/2026-09-14-default-ui-v2-pixel-art.md`
4. `docs/reviews/PIXEL-FORGE-VISUAL-GATES.md`

批准图 SHA-256：

`0e4e13d01d8421e3ce91abb5b9dbdd76c3f222c49a79c05b71f90defacc1eaf6`

## 3. Visual Reference Readback

在任何视觉实现之前，先输出：

```markdown
## Visual Reference Readback
- Home:
- Match Setup:
- Game:
- Color/material:
- Panel/button:
- Board:
- White/black pieces:
- HUD hierarchy:
```

每项必须描述从图中实际看到的具体内容，不接受“暗色像素风”这种泛化词。

如果图片未成功进入模型上下文：

> STOP.

明确告诉用户“当前会话没有视觉参考图输入”，不要继续设计，不要根据文字猜。

## 4. 工作方式

使用现有 Superpowers 流程：

- implementation 前按计划逐 Task 执行
- TDD：先红测试，再最小实现，再绿测试
- 每个 Task 独立 review / commit
- 不改 spec scope
- 不因为多模态而跳过测试

## 5. 视觉任务特别规则

Kimi K3 可以看图，但不能获得“重新设计权”。

允许：

- 根据批准图理解布局和氛围
- 根据批准图绘制 crisp-edge SVG pieces
- 根据批准图调整 spacing / border / hierarchy
- 对运行截图进行差异分析

禁止：

- 把 Pixel Forge 改成赛博朋克、玻璃拟态、极简 SaaS
- 继续使用 Unicode chess pieces
- 看到图片后擅自增加未批准功能
- 为了视觉方便破坏 GameCore / plugin boundaries

## 6. Screenshot Gate

完成 Gate A / B / C 对应阶段后：

1. 运行应用。
2. 获取当前 UI 截图（可由可用浏览器工具获取，或由用户上传；不要为了截图给生产 app 增加依赖）。
3. 同时查看批准参考图。
4. 输出：
   - Match
   - Differences
   - Required fixes
5. 修正 P0/P1 差异。
6. 重新截图。
7. Gate 通过后再继续。

## 7. 验证纪律

在声称任务完成前必须实际运行：

```bash
npm test
npm run build
git diff --check
```

若只运行了局部测试，只能声称“目标测试通过”，不能声称整个项目通过。

## 8. Git

建议在独立 feature branch / worktree 执行。

每个计划任务有自己的 commit message。

不要把 `.obsidian/workspace.json`、临时截图、模型缓存或 API key 提交进仓库。
