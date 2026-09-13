# ChessForge

![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)
![chess.js](https://img.shields.io/badge/chess.js-1.4-222222)

> 应用内标题：**Plugin Chess**

一个基于插件化架构构建的本地双人国际象棋 Web 应用。MVP 第一版支持完整的标准国际象棋规则（王车易位、吃过路兵、兵升变、将军、将死、和棋），并将规则、玩家、棋盘、主题、存储五部分拆分为可替换插件。

两条核心架构保证：

- **`GameCore` 不依赖 React**（`src/core/GameCore.ts` 可独立测试）
- **`chess.js` 只存在于 RulePlugin**（仅 `src/plugins/rules/ChessJsRulePlugin.ts` 引用）

---

## 技术栈

- React 19 + Vite 8 + TypeScript 7（strict）
- 规则引擎：`chess.js` 1.4.0
- 测试：Vitest 5 + React Testing Library
- 包管理器：npm
- 无需后端服务器，全部在浏览器内运行

---

## 为什么做插件化

本项目追求的不是「功能特别多」，而是**插件边界成立**——核心功能完整，且架构真的可以继续长大。插件之间不直接相互依赖，而是通过 Game Core 协作；只有具备真正「替换价值」的能力才做成插件（否则容易陷入「万物皆插件」的维护困境）。

未来增加 Stockfish、在线对战、Chess960、云存档等能力时，只需**新增插件并替换配置**，而无需推倒重写。

---

## 五类插件

| 类型 | 契约文件 | 内置实现 |
|---|---|---|
| Rule（裁判） | `src/plugins/rules/RulePlugin.ts` | `chessJsRulePlugin`（`ChessJsRulePlugin.ts`，封装 chess.js） |
| Player（棋手） | `src/plugins/players/PlayerPlugin.ts` | `HumanPlayerPlugin`（类） |
| Board（棋盘） | `src/plugins/board/BoardPlugin.ts` | `defaultBoardPlugin`（`DefaultBoardPlugin.tsx` + `DefaultBoard/`） |
| Theme（皮肤） | `src/plugins/themes/ThemePlugin.ts` | `chessComTheme`（`ChessComTheme.ts`） |
| Storage（存档） | `src/plugins/storage/StoragePlugin.ts` | `MemoryStoragePlugin`（类） |

---

## 整体架构

```
            Board / UI（棋盘与界面）
                 │
                 ▼
            Game Core（游戏核心，协调者）
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
   Rule       Player      Storage
  （规则）    （玩家）      （存储）

   Theme（主题） → UI
```

- `GameCore` 只做协调：管理对局状态、接收走子请求、交给 RulePlugin 判定、更新局面、发布事件。
- `RulePlugin` 判定「这一步能不能走」，`PlayerPlugin` 回答「下一步棋从哪里来」，`StoragePlugin` 负责存档，`Theme` 与 `Board` 属于 UI 侧。
- 配置来源：`src/config/defaultGameConfig.ts` 组装 `{ rules, players: { white, black }, storage, theme, board }`；`GameCore` 只接收 `{ rules, players, storage }`（theme/board 仅 UI 使用）。
- 事件：`src/core/EventBus.ts` 提供类型化事件总线；领域类型（`GameState`、`Move`、`Square`、`GameStatus`、`Plugin` 等）在 `src/core/types.ts`。

---

## 如何启动

```bash
npm install        # 安装依赖
npm run dev        # 启动 Vite 开发服务器
npm run build      # 构建（tsc -b && vite build）
npm run preview    # 预览生产构建
```

---

## 如何测试

```bash
npm test           # 运行 Vitest（单次）
```

测试分为三层：插件 Contract Test（`*Plugin.test.ts` / `plugins.test.ts`）、GameCore 测试（`GameCore.test.ts`，不依赖 React）、UI 测试（`App.test.tsx`、`components.test.tsx` 等）。

---

## 如何增加新 ThemePlugin

实现 `tokens`（12 个键），然后替换配置中的 `theme` 或通过 `PluginRegistry.registerTheme()` 注册。

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

在 `src/config/defaultGameConfig.ts` 中把 `theme` 指向新主题，或调用 `PluginRegistry.registerTheme(minimalTheme)`。

---

## 如何增加新 PlayerPlugin

`PlayerPlugin` 只负责「这一方下一步棋从哪里来」：`HumanPlayerPlugin` 通过 `requestMove` 等待 UI、再由 UI 调用 `pushExternalMove` 提交走子；AI 类插件则自行在 `requestMove` 中计算并返回结果。

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
    // 自行计算并返回一步棋（与 HumanPlayerPlugin 不同，不等待 UI）。
    return { from: 'e2', to: 'e4' }
  }
}
```

随后在 `src/config/defaultGameConfig.ts` 中替换 `players.black`（或 `players.white`）。

> 说明：以上仅演示 PlayerPlugin 的接入方式；**Stockfish / AI 对手尚未实现**。

---

## MVP 当前支持什么

- 完整的本地双人对局
- 点击走子 与 拖拽走子
- 完整标准规则（经由 chess.js）：王车易位、吃过路兵、兵升变（带选择弹窗）、将军、将死、和棋
- 悔棋（悔一步）、重新开始
- SAN 棋谱
- Chess.com 风格默认主题
- 移动端响应式布局
- 五类插件均可替换
- 插件故障隔离：主题失败自动回退、存储错误非阻塞、玩家异常暂停回合、规则引擎故障进入停止状态、棋盘错误由 Error Boundary 兜底

---

## 后续计划（尚未实现）

- **AI / Stockfish 对手**——尚未实现
- **在线联机**——尚未实现

未来通过新增 `StockfishPlayerPlugin`、`OnlinePlayerPlugin` 等插件接入，GameCore 无需重新设计。此外还可扩展本地存档（`LocalStoragePlugin`）、Chess960、更多主题与棋盘等。

---

## 项目结构

```
src/
├── core/
│   ├── GameCore.ts          # 游戏核心（不依赖 React）
│   ├── EventBus.ts          # 类型化事件总线
│   ├── PluginRegistry.ts    # 注册/读取 theme + board 插件
│   ├── errors.ts            # IllegalMoveError 等
│   └── types.ts             # 领域类型（GameState / Move / Square / Plugin …）
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
│   │   └── DefaultBoard/
│   ├── themes/
│   │   ├── ThemePlugin.ts
│   │   └── ChessComTheme.ts
│   └── storage/
│       ├── StoragePlugin.ts
│       └── MemoryStoragePlugin.ts
├── config/
│   └── defaultGameConfig.ts  # 默认应用配置
├── components/
│   ├── GameLayout.tsx
│   ├── GameStatus.tsx
│   ├── MoveHistory.tsx
│   ├── GameControls.tsx
│   ├── PromotionDialog.tsx
│   ├── GameResultDialog.tsx
│   └── GameErrorBoundary.tsx
├── hooks/
│   └── useGameCore.ts        # 连接 GameCore 与 React state
├── App.tsx
├── main.tsx
└── index.css
```
