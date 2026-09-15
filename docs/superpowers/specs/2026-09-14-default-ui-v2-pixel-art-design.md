# ChessForge Default UI V2 — Pixel Art Redesign 设计规格

**状态：已批准**

**日期：2026-09-14**

**执行环境：Claude Code + Kimi K3**

**Canonical Visual Reference：** `docs/design/pixel-forge/pixel-forge-reference-approved.png`

**Reference SHA-256：** `0e4e13d01d8421e3ce91abb5b9dbdd76c3f222c49a79c05b71f90defacc1eaf6`

> 本文定义功能、架构和无法仅由静态图片表达的约束。视觉外观必须结合批准图理解，不能只读本文后自行设计。

---

## 1. 产品目标

将当前“打开即进入棋局”的 ChessForge 开发 Demo，升级为真正具有产品流程和品牌身份的插件驱动国际象棋游戏 MVP。

默认视觉身份：

> **Pixel Forge — 深色中世纪奇幻像素艺术 + 现代信息布局**

本次改版必须同时完成：

- HomePage
- MatchSetupPage
- GamePage
- 用户可见的插件配置
- Pixel Forge 棋盘
- 真正的像素棋子
- 像素 HUD / Dialog / Button / Panel
- 响应式布局
- 视觉验收流程

本次不重写规则引擎。

---

## 2. Canonical Visual Reference 使用规则

批准图不是“灵感素材”，而是本次 V2 的视觉目标。

### 2.1 Kimi K3 视觉任务前置条件

任何涉及页面布局、棋盘、棋子、按钮、面板、色彩、背景、HUD、Dialog 的任务开始前，Agent 必须先直接读取批准图。

读取后必须输出 `Visual Reference Readback`，至少包含：

1. 首页总体构图
2. 配置页总体构图
3. 对局页总体构图
4. 主色调与材质感
5. 面板/按钮边框语言
6. 棋盘配色
7. 白棋与黑棋的像素表现差异
8. HUD 的信息层级

如果模型不能确认自己看到了图，必须停止视觉实现并要求重新附加图片，不允许根据文本猜测。

### 2.2 冲突规则

- 行为和架构冲突：本文优先。
- 视觉构图和质感冲突：批准图优先。
- 移动端、无障碍、错误态：本文优先。
- 图中不存在的细节：遵守本文和现有组件契约，不自由扩 scope。

---

## 3. 三屏产品流程

```text
HOME
 ├─ QUICK START ─────────────→ GAME
 │
 └─ START GAME → SETUP → GAME
```

应用启动必须进入 HomePage，不创建 GameCore。

### HomePage

负责：

- ChessForge 品牌
- Pixel Forge 氛围
- 开始游戏
- 快速开始

首页的氛围最强，可以使用批准图中的夜间城堡 / 锻造工坊 / 战棋感背景语言。

### MatchSetupPage

负责让插件架构从“代码结构”变成“用户可感知能力”。

必须展示：

- Rule Plugin
- White Player Plugin
- Black Player Plugin
- Board Plugin
- Theme Plugin
- Storage Plugin

当前默认：

```text
Rule      Standard Chess
White     Human
Black     Human
Board     Pixel Board
Theme     Pixel Forge
Storage   Memory Session
```

当前不存在的插件可以显示 `Coming Soon`，但不可伪装成可用功能。

### GamePage

只有开始棋局后出现。

桌面主要结构：

```text
┌──────────────────────────────────────────────────┐
│ CHESSFORGE                    [本局插件] [退出]  │
├──────────────────────────────────────────────────┤
│                  │                               │
│    PIXEL BOARD   │  STATUS                       │
│                  │  MOVE LOG                     │
│                  │  CONTROLS                     │
│                  │                               │
└──────────────────────────────────────────────────┘
```

棋盘是绝对主视觉。

---

## 4. App 状态

```ts
type AppScreen = 'home' | 'setup' | 'game'
```

App 层维护：

```text
screen
draftConfig
activeMatchConfig
```

开局后 `activeMatchConfig` 必须冻结。

`GameCore` 不得知道 HomePage / MatchSetupPage 的存在。

---

## 5. MatchConfig

使用可序列化插件 ID，而不是把 React 页面状态直接绑定到插件实例：

```ts
interface MatchConfig {
  ruleId: string
  whitePlayerId: string
  blackPlayerId: string
  boardId: string
  themeId: string
  storageId: string
}
```

开始棋局时通过 `PluginRegistry` 解析并创建 fresh player / storage instances。

对局进行中插件信息只读，不支持热切换。

---

## 6. 插件架构边界

五类核心插件保持：

```text
RulePlugin
PlayerPlugin
BoardPlugin
ThemePlugin
StoragePlugin
```

原则：

> 插件与 GameCore 协作，不直接彼此依赖。

### 本次不改

- `GameCore` 的规则职责
- `RulePlugin` 契约
- `ChessJsRulePlugin` 规则行为
- `PlayerPlugin` 的基本请求模型
- `StoragePlugin` 的基本职责
- `BoardPluginProps` 契约

### PluginRegistry

从当前主要管理 Board/Theme，扩展为可注册并枚举五类插件。

配置页不能硬编码插件列表。

---

## 7. DefaultBoard 边界

`BoardPluginProps` 保持原样：

```ts
interface BoardPluginProps {
  position: BoardPosition
  status: GameStatus
  selectedSquare?: Square
  legalMoves: Move[]
  lastMove?: Move
  onSquareSelect(square: Square): void
  onMove(move: Move): void
}
```

DefaultBoard 内部可以彻底重做视觉，但不得向 GameCore 泄漏视觉逻辑。

---

## 8. Pixel Forge 视觉语言

批准图定义总体气质：

- 深海军蓝 / 炭黑背景
- 暗金 / 旧铜边框
- 木质 / 羊皮纸棋盘
- 暖色高光
- 中世纪工坊 / 战棋氛围
- 像素硬边，不做玻璃拟态
- 游戏 UI，而非普通 React Dashboard

### 色彩 token 基线

```text
Page background     #111827
Panel background    #182235
Primary text        #f2e7c9
Muted text          #a9a184
Light square        #d8c39a
Dark square         #75533b
Selected            #d9ad45
Previous move       #9a7938
Legal move          #4e8f78
Check               #8b3434
```

这些色值是工程基线。Kimi K3 可以根据批准图在小范围内微调，但不得改变“深色中世纪像素奇幻”的整体视觉身份。

---

## 9. 字体

采用双字体策略：

- 品牌 / 标题 / HUD / Button：像素展示字体风格
- 正文 / 插件名 / 棋谱：清晰的现代字体或等宽字体

禁止整个 UI 都使用低可读性的像素字体。

---

## 10. UI 组件语言

主要面板：

- 2–3px 硬边框
- 旧铜 / 暗金
- 阶梯式硬阴影
- 主要组件不使用大圆角
- 不使用 blur glassmorphism

按钮：

- Primary：开始游戏 / START MATCH / PLAY AGAIN
- Secondary：Quick Start / Back / Undo / Plugins
- Danger：真正的退出 / 清除行为

按钮按下可 `translate(2px, 2px)`。

---

## 11. Pixel Forge 棋盘

浅格：羊皮纸暖米色。

深格：旧木棕。

坐标位于棋盘外框，不允许每格显示 `e4` / `f3`。

交互状态：

- selected：金色像素四角
- legal move：中心像素块/菱形
- legal capture：四角括号
- previous move：低层级暗金
- check：暗红 + 一次短闪

---

## 12. Pixel Forge Piece Set

禁止生产代码继续使用：

```text
♔ ♕ ♖ ♗ ♘ ♙
♚ ♛ ♜ ♝ ♞ ♟
```

必须为真实像素图形。

逻辑坐标系：

> **32 × 32**

实现可使用 crisp-edge SVG：

```html
<svg viewBox="0 0 32 32" shape-rendering="crispEdges">
```

规则：

- 几何坐标以整数为主
- 不使用字体 glyph
- 不依赖抗锯齿曲线来形成轮廓
- 白棋与黑棋共用视觉家族，但 palette 区分明显
- King / Queen / Rook / Bishop / Knight / Pawn 缩小后仍一眼可分

具体 silhouette 和整体质感以批准图底部 piece showcase 为视觉参考。

---

## 13. 动效

原则：

> 短、硬、脆。

- button: 60–100ms
- move: 100–160ms
- panel: ~150ms
- check: 一次短闪

支持：

```css
@media (prefers-reduced-motion: reduce)
```

不做长时间 glow / spring / blur / particle。

---

## 14. Dialog

PromotionDialog：

- 使用 Pixel Piece
- Q/R/B/N 明确可辨
- 不自动升后

GameResultDialog：

```text
PLAY AGAIN
VIEW MOVES
MAIN MENU
```

ExitMatchDialog：

- 未走棋：可直接退出
- 已走棋：必须确认

PLAY AGAIN 保留同一个 activeMatchConfig。

---

## 15. 错误处理

- Invalid MatchConfig：禁止创建 GameCore
- Storage error：非阻塞
- Player error：暂停当前回合
- Rule error：沿用 faulted
- Board error：Pixel Forge Error Boundary
- Theme error：回退 Pixel Forge 安全 token
- 页面退出：停止 GameCore 并清理 pending player request

---

## 16. 响应式

桌面：棋盘 + HUD 双列。

移动端：

- 棋盘先出现
- HUD 下移
- Setup 选择器单列
- Button 在窄屏可全宽
- 不产生横向滚动

概念图主要定义桌面视觉，移动端按本文约束延伸。

---

## 17. Visual Gates

实现不能只看测试通过。

### Gate A — Home + Setup

提交：

- Home desktop screenshot
- Setup desktop screenshot
- 至少一个窄屏截图

对照批准图检查品牌、比例、边框、色调、氛围。

### Gate B — Board + Pieces

提交：

- 完整初始棋盘
- 至少展示 white/black 六种棋子
- selected / move / capture / previous / check 状态截图

必须确认无 Unicode 棋子。

### Gate C — Full Game

提交：

- GamePage desktop
- GamePage mobile
- PromotionDialog
- ResultDialog
- Active Plugins panel

只有 Gate C 通过，UI V2 才算视觉完成。

具体清单见：

`docs/reviews/PIXEL-FORGE-VISUAL-GATES.md`

---

## 18. 明确不做

- Stockfish
- Online
- Account
- Elo
- Timer
- Cloud save
- Plugin marketplace
- Dynamic third-party plugin installation
- Chess960
- ThemePlugin V2
- SoundPlugin
- 3D Board

---

## 19. 最终验收

1. 首屏是 HomePage。
2. Quick Start 可进入游戏。
3. Setup 可真实枚举五类插件。
4. activeMatchConfig 开局后冻结。
5. GameCore 不被 UI 状态污染。
6. 默认视觉符合批准 Pixel Forge 参考图。
7. Unicode 棋子在生产代码中清零。
8. 像素棋盘具有完整 interaction markers。
9. 首页、配置页、GamePage 视觉统一。
10. 桌面和移动端可用。
11. 原点击/拖拽/升变/将死/和棋/悔棋/重开功能不回归。
12. `npm test` 全部通过。
13. `npm run build` 成功。
14. Gate A / B / C 均通过人工或多模态视觉审查。

最终目标不是“网页套像素皮肤”，而是：

> **一个具有品牌入口、插件配置、正式游戏流程和 Pixel Forge 美术身份的 ChessForge 产品 MVP。**
