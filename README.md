# ChessForge

![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)
![chess.js](https://img.shields.io/badge/chess.js-1.4-222222)

> 应用内品牌:**CHESSFORGE** · 默认视觉:**Pixel Forge**(深色中世纪奇幻像素艺术)

一个基于插件化架构构建的本地双人国际象棋 Web 应用。支持完整的标准国际象棋规则(王车易位、吃过路兵、兵升变、将军、将死、和棋),并将规则、玩家、棋盘、主题、存储五部分拆分为可替换插件——插件系统不只是内部架构,而是用户在开局前可以直接配置的产品能力。

两条核心架构保证:

- **`GameCore` 不依赖 React**(`src/core/GameCore.ts` 可独立测试)
- **`chess.js` 只存在于 RulePlugin**(仅 `src/plugins/rules/ChessJsRulePlugin.ts` 引用)

---

## 产品流程

应用打开后进入 Home 页,不会自动创建棋局:

```text
Home
 ├─ Quick Start ─────────→ Game(直接使用默认插件组合)
 └─ Start Game → Setup → Game(先配置本局插件,再 START MATCH)
```

- **Home**:品牌首页,提供「快速开始」与「开始游戏」两个入口。
- **Setup(Match Setup)**:六个插件选择位(Rule / White Player / Black Player / Board / Theme / Storage),选项全部来自 `PluginRegistry` 枚举,并实时显示 CURRENT LOADOUT;配置校验通过才能 `START MATCH`。
- **Game**:开局后 `activeMatchConfig` 被冻结,对局中插件面板只读,**核心插件不热切换**;退出需确认(未走子直接返回主页)。

默认插件组合:

```text
Standard Chess   (Rule · chess.js)
Human vs Human   (White / Black Player)
Pixel Board      (Board · 32×32 像素棋子 + 硬边框棋盘)
Pixel Forge      (Theme · 默认像素奇幻视觉)
Memory Session   (Storage · 会话内存存档)
```

---

## 技术栈

- React 19 + Vite 8 + TypeScript 7(strict)
- 规则引擎:`chess.js` 1.4.0
- 测试:Vitest 5 + React Testing Library
- 包管理器:npm
- 无需后端服务器,全部在浏览器内运行

---

## 为什么做插件化

本项目追求的不是「功能特别多」,而是**插件边界成立**——核心功能完整,且架构真的可以继续长大。插件之间不直接相互依赖,而是通过 Game Core 协作;只有具备真正「替换价值」的能力才做成插件(否则容易陷入「万物皆插件」的维护困境)。

未来增加 Stockfish、在线对战、Chess960、云存档等能力时,只需**新增插件并在 Setup 页选择**,而无需推倒重写。

---

## 五类插件

| 类型 | 契约文件 | 内置实现 |
|---|---|---|
| Rule(裁判) | `src/plugins/rules/RulePlugin.ts` | `chessJsRulePlugin`(`ChessJsRulePlugin.ts`,封装 chess.js,显示名 Standard Chess) |
| Player(棋手) | `src/plugins/players/PlayerPlugin.ts` | `HumanPlayerPlugin`(类,经 `PlayerPluginDefinition.create(color)` 实例化) |
| Board(棋盘) | `src/plugins/board/BoardPlugin.ts` | `defaultBoardPlugin`(Pixel Board:`DefaultBoard/` + `PixelPiece`) |
| Theme(皮肤) | `src/plugins/themes/ThemePlugin.ts` | `pixelForgeTheme`(默认)、`chessComTheme`(旧主题保留) |
| Storage(存档) | `src/plugins/storage/StoragePlugin.ts` | `MemoryStoragePlugin`(类,经 `StoragePluginDefinition.create()` 实例化) |

Board 与 Theme 是 **UI 插件**;`GameCore` 只接收 `{ rules, players, storage }`。

---

## 整体架构

```text
        AppShell(HOME | SETUP | GAME 三屏状态)
            │
            ├─ HomePage
            ├─ MatchSetupPage ── PluginRegistry(枚举五类插件)
            └─ GamePage ── MatchConfig(冻结) ── resolveMatchConfig
                            │
                            ▼
                 Board / UI(像素棋盘与 HUD)
                            │
                            ▼
                 Game Core(游戏核心,协调者)
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
              Rule       Player      Storage
             (规则)     (玩家)      (存储)

              Theme(主题 tokens → CSS variables)→ UI
```

- `GameCore` 只做协调:管理对局状态、接收走子请求、交给 RulePlugin 判定、更新局面、发布事件。
- `MatchConfig`(`src/app/MatchConfig.ts`)是可序列化的六字段插件 ID 配置;`resolveMatchConfig` 在开局时经 `PluginRegistry` 解析为具体插件实例(players/storage 每次新鲜创建)。
- 配置来源:`src/config/defaultPluginRegistry.ts` 注册全部内置插件,`src/config/defaultGameConfig.ts` 导出默认 `MatchConfig`。
- 事件:`src/core/EventBus.ts` 提供类型化事件总线;领域类型(`GameState`、`Move`、`Square`、`GameStatus`、`Plugin` 等)在 `src/core/types.ts`。

---

## Pixel Forge 视觉

- 默认主题为 **Pixel Forge**:深色中世纪奇幻像素艺术,暖金/木质硬边框面板、阶梯阴影、零圆角、无模糊玻璃拟态。
- 棋子为真正的 **32×32 crisp-edge 像素精灵**(`PixelSprite` 字符画 → SVG 整数 rect,`shape-rendering="crispEdges"`,自动 1px 描边),白棋暖金/米色、黑棋冷蓝灰,不使用 Unicode chess glyph。
- 棋盘坐标只显示在外框;selected(金色四角)、legal move(绿块)、legal capture(红色四角)、previous move(暗金底洗)、check(暗红短闪)五种 marker 层级分明。
- 双字体策略:英文/标题使用 vendored Press Start 2P(`public/fonts/`,OFL 1.1),中文正文使用系统字体。
- 响应式:≤760px 对局 HUD 单列堆叠,≤520px 配置页选择器单列、按钮全宽;全局支持 `prefers-reduced-motion`。

---

## 如何启动

```bash
npm install        # 安装依赖
npm run dev        # 启动 Vite 开发服务器
npm run build      # 构建(tsc -b && vite build)
npm run preview    # 预览生产构建
```

---

## 如何测试

```bash
npm test           # 运行 Vitest(单次)
```

测试分为三层:插件 Contract Test(`*Plugin.test.ts` / `plugins.test.ts`)、GameCore 测试(`GameCore.test.ts`,不依赖 React)、UI 与产品流程测试(`App.test.tsx` 覆盖 Home → Setup、Quick Start → Game、Setup → Start Match → Game、Game → Exit → Home、Game End → Play Again、Undo、Restart、Promotion、Check/Checkmate 全链路)。

---

## 如何增加新 ThemePlugin

实现 `tokens`(12 个键),然后在 `src/config/defaultPluginRegistry.ts` 中注册——它会立即出现在 Setup 页的 Theme 选择器中,无需改动任何页面代码。

```ts
// src/plugins/themes/MinimalTheme.ts
import type { ThemePlugin } from './ThemePlugin'

export const minimalTheme: ThemePlugin = {
  id: 'minimal-theme',
  name: 'Minimal Theme',
  tokens: {
    pageBackground: '#1a1a1a',
    panelBackground: '#262626',
    textPrimary: '#ffffff',
    textMuted: '#9a9a9a',

    lightSquare: '#ebecd0',
    darkSquare: '#779556',

    selectedSquare: '#f6f669',
    previousMove: '#cdd26a',
    legalMove: 'rgba(20, 85, 30, 0.5)',
    checkSquare: 'rgba(255, 0, 0, 0.5)',

    borderRadius: '4px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
  },
}
```

主题 token 经 `themeToCssVariables()`(`src/plugins/themes/themeCss.ts`)映射为 CSS 变量;token 残缺的主题会在 GamePage 启动时自动回退到 Pixel Forge。

---

## 如何增加新 PlayerPlugin

`PlayerPlugin` 只负责「这一方下一步棋从哪里来」:`HumanPlayerPlugin` 通过 `requestMove` 等待 UI、再由 UI 调用 `pushExternalMove` 提交走子;AI 类插件则自行在 `requestMove` 中计算并返回结果。

```ts
// src/plugins/players/RandomBotPlayer.ts
import type { Color, Move } from '../../core/types'
import type { PlayerContext, PlayerPlugin } from './PlayerPlugin'

export class RandomBotPlayer implements PlayerPlugin {
  readonly id = 'random-bot'
  readonly name = 'Random Bot'
  readonly color: Color

  constructor(color: Color) {
    this.color = color
  }

  async requestMove(
    _context: PlayerContext,
    _signal: AbortSignal,
  ): Promise<Move> {
    // 自行计算并返回一步棋(与 HumanPlayerPlugin 不同,不等待 UI)。
    return { from: 'e2', to: 'e4' }
  }
}
```

随后用一个 `PlayerPluginDefinition`(`{ id, name, create(color) }`)注册进 `PluginRegistry`,即可在 Setup 页选择执白或执黑。

> 说明:以上仅演示 PlayerPlugin 的接入方式;**Stockfish / AI 对手尚未实现**。

---

## MVP 当前支持什么

- Home / Setup / Game 三屏产品流程,打开应用不自动开局
- 开局前用户可见的六槽位插件配置(CURRENT LOADOUT 实时预览)
- 完整的本地双人对局
- 点击走子 与 拖拽走子
- 完整标准规则(经由 chess.js):王车易位、吃过路兵、兵升变(像素棋子选择弹窗)、将军、将死、和棋
- 悔棋(悔一步)、重新开始、结束后再来一局/查看棋谱/回主菜单
- 已走子退出对局时的确认弹窗
- SAN 棋谱(MOVE LOG 零填充编号)
- Pixel Forge 默认像素视觉 + 向导 NPC(状态感知提示)
- 移动端响应式布局与 `prefers-reduced-motion`
- 五类插件均可替换
- 插件故障隔离:主题失败自动回退、存储错误非阻塞、玩家异常暂停回合、规则引擎故障进入停止状态、棋盘错误由 Error Boundary 兜底

---

## 后续计划(尚未实现)

- **AI / Stockfish 对手**——尚未实现
- **在线联机**——尚未实现

未来通过新增 `StockfishPlayerPlugin`、`OnlinePlayerPlugin` 等插件接入,GameCore 无需重新设计。此外还可扩展本地存档(`LocalStoragePlugin`)、Chess960、更多主题与棋盘等。

---

## 项目结构

```text
src/
├── core/
│   ├── GameCore.ts          # 游戏核心(不依赖 React)
│   ├── EventBus.ts          # 类型化事件总线
│   ├── PluginRegistry.ts    # 五类插件的注册/读取/枚举
│   ├── errors.ts            # IllegalMoveError 等
│   └── types.ts             # 领域类型(GameState / Move / Square / Plugin …)
├── app/
│   ├── AppScreen.ts         # 'home' | 'setup' | 'game'
│   ├── AppShell.tsx         # 三屏状态与 draft/active 配置
│   └── MatchConfig.ts       # 可序列化插件配置、校验与解析
├── pages/
│   ├── HomePage/            # 品牌首页
│   ├── MatchSetupPage/      # 插件配置页(PluginSelector)
│   └── GamePage/            # 对局页(Pixel Forge HUD)
├── plugins/
│   ├── rules/
│   │   ├── RulePlugin.ts
│   │   └── ChessJsRulePlugin.ts   # 唯一引用 chess.js 的文件
│   ├── players/
│   │   ├── PlayerPlugin.ts
│   │   └── HumanPlayerPlugin.ts
│   ├── board/
│   │   ├── BoardPlugin.ts
│   │   ├── DefaultBoardPlugin.tsx
│   │   └── DefaultBoard/          # 像素棋盘 + PixelPiece 32×32 棋子
│   ├── themes/
│   │   ├── ThemePlugin.ts
│   │   ├── PixelForgeTheme.ts     # 默认主题
│   │   ├── ChessComTheme.ts       # 旧主题(保留)
│   │   └── themeCss.ts            # theme tokens → CSS variables
│   └── storage/
│       ├── StoragePlugin.ts
│       └── MemoryStoragePlugin.ts
├── config/
│   ├── defaultPluginRegistry.ts   # 注册全部内置插件
│   └── defaultGameConfig.ts       # 默认 MatchConfig
├── components/
│   ├── PixelButton.tsx / PixelPanel.tsx / pixel/PixelSprite.tsx
│   ├── GameStatus.tsx             # CURRENT TURN 面板
│   ├── MoveHistory.tsx            # MOVE LOG
│   ├── GameControls.tsx           # UNDO / RESTART
│   ├── PlayerBar.tsx              # 棋盘上下玩家条
│   ├── WizardGuide.tsx            # 向导 NPC
│   ├── PromotionDialog.tsx
│   ├── GameResultDialog.tsx
│   ├── ExitMatchDialog.tsx
│   └── GameErrorBoundary.tsx
├── hooks/
│   └── useGameCore.ts        # 连接 GameCore 与 React state
├── App.tsx                 # AppShell 入口
├── main.tsx
└── index.css               # Pixel Forge 全局基础、响应式、reduced-motion
```
