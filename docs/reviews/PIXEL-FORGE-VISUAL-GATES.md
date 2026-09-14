# Pixel Forge Visual Acceptance Gates

这份文件用来防止“代码和测试都过了，但最终 UI 与批准设计完全不像”。

Canonical reference:

`docs/design/pixel-forge/pixel-forge-reference-approved.png`

---

## 差异等级

### P0 — 必须阻断

- 不是像素艺术
- 使用 Unicode 棋子
- 页面结构不是 Home → Setup → Game
- 棋盘不再是 GamePage 主视觉
- 视觉方向变成赛博 / SaaS / 玻璃拟态
- 插件配置不可见或只是假的静态文案

任何 P0：Gate FAIL。

### P1 — Gate 前必须修

- 页面比例与参考图明显不同
- 颜色层级、边框、材质完全偏离
- 棋子 silhouette 难以辨认
- HUD 抢夺棋盘注意力
- Home / Setup / Game 三页看起来像三套产品
- 移动端产生横向滚动或主要功能不可用

任何 P1：Gate FAIL。

### P2 — 可记录后进入下一阶段

- 小范围 spacing
- 局部字体大小
- 次要 icon 细节
- 轻微色值偏差
- 非关键微动效

---

# Gate A — HomePage + MatchSetupPage

## 必须提交的截图

- HomePage desktop
- MatchSetupPage desktop
- Home 或 Setup narrow/mobile

## Home 检查

- CHESSFORGE 是最强品牌焦点
- Pixel Forge 中世纪夜间/工坊氛围明确
- 主 CTA 明显
- 不像普通后台 Dashboard
- 不自动出现棋盘
- 暗色背景 + 暖金边框语言与参考一致

## Setup 检查

- 六类插件选择位一眼可识别
- CURRENT LOADOUT 清楚
- START MATCH 是主 CTA
- 信息密度比 Home 高，但仍有游戏气质
- Coming Soon 不伪装成可用插件

## Gate A 输出格式

```markdown
# Gate A Review
Result: PASS | FAIL

## Matches
- ...

## P0
- none | ...

## P1
- none | ...

## P2
- ...

## Required fixes before next gate
- ...
```

---

# Gate B — Pixel Board + Pixel Piece Set

## 必须提交的截图

- 初始完整棋盘
- 白棋六种棋子
- 黑棋六种棋子
- selected
- legal move
- legal capture
- previous move
- check

## 检查

- 无 Unicode
- 32×32 逻辑像素感明确
- King / Queen / Rook / Bishop / Knight / Pawn 可辨
- 白黑棋 palette 差异清楚
- 棋盘浅格羊皮纸、深格旧木棕
- 坐标只在棋盘边框
- selected 比 previous 更突出
- move 与 capture marker 明显不同
- check 不做刺眼持续闪烁
- drag 状态仍然保持像素棋子

Gate B 有任何棋子辨识 P1 时必须修。

---

# Gate C — Full GamePage

## 必须提交的截图

- GamePage desktop
- GamePage narrow/mobile
- Active Plugins panel
- Promotion dialog
- Result dialog
- Exit dialog

## 检查

- 棋盘始终是主视觉
- HUD 紧凑，不像普通网页 sidebar
- Current turn / move log / controls 层级清楚
- Dialog 属于同一 Pixel Forge 视觉语言
- Active Plugins 只读
- GamePage 背景比 Home 克制
- 所有主要 button 有一致硬边和按压反馈
- 无横向滚动
- reduced-motion 不破坏交互
- 错误态仍有 Pixel Forge presentation

---

# Final Visual Acceptance

只有以下均成立才允许声称 Default UI V2 视觉完成：

- Gate A PASS
- Gate B PASS
- Gate C PASS
- `npm test` PASS
- `npm run build` PASS
- 生产代码 Unicode chess glyph scan = 0
