# 插件化国际象棋 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: 使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按 Task 逐项执行。本计划所有步骤使用 checkbox 跟踪。

**目标：** 构建一个可完整进行本地双人国际象棋对局的 React Web 应用，并将规则、玩家、棋盘、主题和存储隔离为五类可替换插件。

**架构：** `GameCore` 负责协调状态与插件，但不实现国际象棋规则和 UI。`chess.js` 只存在于 `ChessJsRulePlugin` 内；React UI 通过 Core 和插件契约工作。插件之间不直接形成业务依赖。

**技术栈：** React、Vite、TypeScript、chess.js、Vitest、React Testing Library。

**设计文档：** `docs/superpowers/specs/2026-09-11-plugin-chess-design.md`

## Global Constraints

- MVP 只实现本地双人对战。
- 不实现 AI、Stockfish、联网、账号、计时器、云存档。
- 必须同时支持点击走子与拖拽走子。
- 必须支持标准国际象棋完整规则。
- `chess.js` 不允许被 GameCore、Board 或 React 页面直接调用。
- GameCore 不依赖 React。
- 默认采用 Chess.com 风格主题，但不得写死主题值。
- 五类插件固定为 Rule、Player、Board、Theme、Storage。
- 普通按钮、弹窗等 UI 不插件化。
- 使用 TDD：测试失败 → 最小实现 → 测试通过 → 提交。

---

# 文件结构

```text
plugin-chess/
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-09-11-plugin-chess-design.md
│       └── plans/
│           └── 2026-09-11-plugin-chess-implementation.md
│
├── src/
│   ├── core/
│   │   ├── GameCore.ts
│   │   ├── EventBus.ts
│   │   ├── PluginRegistry.ts
│   │   ├── types.ts
│   │   └── GameCore.test.ts
│   │
│   ├── plugins/
│   │   ├── rules/
│   │   │   ├── RulePlugin.ts
│   │   │   ├── ChessJsRulePlugin.ts
│   │   │   └── ChessJsRulePlugin.test.ts
│   │   │
│   │   ├── players/
│   │   │   ├── PlayerPlugin.ts
│   │   │   ├── HumanPlayerPlugin.ts
│   │   │   └── HumanPlayerPlugin.test.ts
│   │   │
│   │   ├── storage/
│   │   │   ├── StoragePlugin.ts
│   │   │   ├── MemoryStoragePlugin.ts
│   │   │   └── MemoryStoragePlugin.test.ts
│   │   │
│   │   ├── themes/
│   │   │   ├── ThemePlugin.ts
│   │   │   ├── ChessComTheme.ts
│   │   │   └── ChessComTheme.test.ts
│   │   │
│   │   └── board/
│   │       ├── BoardPlugin.ts
│   │       └── DefaultBoard/
│   │           ├── DefaultBoardPlugin.tsx
│   │           ├── DefaultBoard.tsx
│   │           ├── DefaultBoard.css
│   │           └── DefaultBoard.test.tsx
│   │
│   ├── components/
│   │   ├── GameLayout.tsx
│   │   ├── GameStatus.tsx
│   │   ├── MoveHistory.tsx
│   │   ├── GameControls.tsx
│   │   ├── PromotionDialog.tsx
│   │   ├── GameResultDialog.tsx
│   │   ├── GameErrorBoundary.tsx
│   │   └── components.test.tsx
│   │
│   ├── hooks/
│   │   └── useGameCore.ts
│   │
│   ├── config/
│   │   └── defaultGameConfig.ts
│   │
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

# Task 1：建立 React + TypeScript + 测试环境

**Files**

Create through Vite:

```text
package.json
vite.config.ts
src/App.tsx
src/main.tsx
src/index.css
```

Modify:

```text
package.json
vite.config.ts
```

Test:

```text
src/App.test.tsx
```

**Produces**

一个能够运行：

```bash
npm run dev
npm test
npm run build
```

的空项目。

- [ ] **Step 1：创建项目**

```bash
npm create vite@latest plugin-chess -- --template react-ts
cd plugin-chess
npm install
```

- [ ] **Step 2：安装业务依赖**

```bash
npm install chess.js
```

- [ ] **Step 3：安装测试依赖**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4：加入测试脚本**

`package.json`：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 5：先写失败测试**

`src/App.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

test('renders application title', () => {
  render(<App />)
  expect(screen.getByText('Plugin Chess')).toBeInTheDocument()
})
```

- [ ] **Step 6：运行测试**

```bash
npm test
```

预期：

```text
FAIL
```

因为 App 尚未显示 `Plugin Chess`。

- [ ] **Step 7：最小实现**

`src/App.tsx`：

```tsx
export default function App() {
  return <h1>Plugin Chess</h1>
}
```

- [ ] **Step 8：验证**

```bash
npm test
npm run build
```

预期全部通过。

- [ ] **Step 9：提交**

```bash
git add .
git commit -m "chore: scaffold plugin chess app"
```

---

# Task 2：建立领域类型、插件基础契约和 EventBus

**Files**

Create:

```text
src/core/types.ts
src/core/EventBus.ts
src/core/EventBus.test.ts
src/plugins/rules/RulePlugin.ts
src/plugins/players/PlayerPlugin.ts
src/plugins/storage/StoragePlugin.ts
src/plugins/themes/ThemePlugin.ts
src/plugins/board/BoardPlugin.ts
```

**Produces**

统一的插件协议，后续代码不能绕过这些协议直接耦合第三方实现。

## 核心领域类型

`src/core/types.ts`：

```ts
export type Color = 'white' | 'black'

export type PieceType =
  | 'pawn'
  | 'knight'
  | 'bishop'
  | 'rook'
  | 'queen'
  | 'king'

export type PromotionPiece =
  | 'queen'
  | 'rook'
  | 'bishop'
  | 'knight'

export type FileLetter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'

export type RankNumber =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'

export type Square = `${FileLetter}${RankNumber}`

export interface Piece {
  color: Color
  type: PieceType
}

export type BoardPosition = Partial<Record<Square, Piece>>

export interface Move {
  from: Square
  to: Square
  promotion?: PromotionPiece
}

export interface MoveRecord extends Move {
  san: string
  color: Color
}

export type GamePhase =
  | 'playing'
  | 'checkmate'
  | 'draw'

export interface GameStatus {
  phase: GamePhase
  turn: Color
  inCheck: boolean
  winner?: Color
  reason?: string
}

export interface GameState {
  fen: string
  board: BoardPosition
  history: MoveRecord[]
  status: GameStatus
}
```

## 插件基础协议

```ts
export interface Plugin {
  id: string
  name: string
}
```

## RulePlugin

```ts
import type {
  GameState,
  Move,
  Square,
} from '../../core/types'

export interface RuleSession {
  getState(): GameState
  getLegalMoves(square: Square): Move[]
  makeMove(move: Move): GameState
  undo(): GameState
  reset(): GameState
}

export interface RulePlugin {
  id: string
  name: string
  createSession(): RuleSession
}
```

这里使用 `RuleSession` 而不是每次从 FEN 重新创建 `chess.js`。

原因：

> 三次重复局面等规则依赖完整对局历史。

---

## PlayerPlugin

```ts
import type {
  Color,
  GameState,
  Move,
} from '../../core/types'

export interface PlayerContext {
  state: GameState
}

export interface PlayerPlugin {
  id: string
  name: string
  color: Color

  requestMove(
    context: PlayerContext,
    signal: AbortSignal,
  ): Promise<Move>

  pushExternalMove?(move: Move): void
}
```

真人玩家通过 `pushExternalMove()` 接收棋盘输入。

未来 Stockfish 可以直接在 `requestMove()` 内计算。

---

## StoragePlugin

```ts
import type { GameState } from '../../core/types'

export interface SavedGame {
  id: string
  state: GameState
}

export interface StoragePlugin {
  id: string
  name: string

  save(game: SavedGame): Promise<void>

  load(id: string): Promise<SavedGame | null>

  clear(id: string): Promise<void>
}
```

---

## ThemePlugin

```ts
export interface ThemeTokens {
  pageBackground: string
  panelBackground: string
  textPrimary: string
  textMuted: string

  lightSquare: string
  darkSquare: string

  selectedSquare: string
  previousMove: string
  legalMove: string
  checkSquare: string

  borderRadius: string
  shadow: string
}

export interface ThemePlugin {
  id: string
  name: string
  tokens: ThemeTokens
}
```

---

## BoardPlugin

```tsx
import type { ComponentType } from 'react'
import type {
  BoardPosition,
  GameStatus,
  Move,
  Square,
} from '../../core/types'

export interface BoardPluginProps {
  position: BoardPosition
  status: GameStatus
  selectedSquare?: Square
  legalMoves: Move[]
  lastMove?: Move
  onSquareSelect(square: Square): void
  onMove(move: Move): void
}

export interface BoardPlugin {
  id: string
  name: string
  Component: ComponentType<BoardPluginProps>
}
```

注意：

> `BoardPlugin` 可以依赖 React，但 GameCore 不能依赖 BoardPlugin 的 React 实现。

---

## EventBus

事件类型：

```ts
export interface GameEvents {
  gameStarted: GameState
  moveMade: GameState
  moveRejected: Move
  turnChanged: Color
  check: Color
  gameEnded: GameState
  gameReset: GameState
  moveUndone: GameState
  error: Error
}
```

API：

```ts
export class EventBus<Events extends object> {
  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void,
  ): () => void

  emit<K extends keyof Events>(
    event: K,
    payload: Events[K],
  ): void
}
```

- [ ] **Step 1：写 EventBus 失败测试**

```ts
test('emits typed event to subscriber', () => {
  const bus = new EventBus<{ value: number }>()
  const received: number[] = []

  bus.on('value', value => received.push(value))
  bus.emit('value', 42)

  expect(received).toEqual([42])
})
```

- [ ] **Step 2：运行**

```bash
npm test -- EventBus
```

预期 FAIL。

- [ ] **Step 3：最小实现 EventBus**

内部使用：

```ts
Map<keyof Events, Set<Function>>
```

并确保 `on()` 返回 unsubscribe 函数。

- [ ] **Step 4：增加 unsubscribe 测试**

```ts
test('unsubscribe removes handler', () => {
  const bus = new EventBus<{ value: number }>()
  const received: number[] = []

  const off = bus.on(
    'value',
    value => received.push(value),
  )

  off()
  bus.emit('value', 1)

  expect(received).toEqual([])
})
```

- [ ] **Step 5：验证**

```bash
npm test
npm run build
```

- [ ] **Step 6：提交**

```bash
git add src/core src/plugins
git commit -m "feat: define plugin contracts and event bus"
```

---

# Task 3：实现 ChessJsRulePlugin

**Files**

Create:

```text
src/plugins/rules/ChessJsRulePlugin.ts
src/plugins/rules/ChessJsRulePlugin.test.ts
```

**Consumes**

```ts
RulePlugin
RuleSession
GameState
Move
Square
```

**Produces**

```ts
export const chessJsRulePlugin: RulePlugin
```

规则实现中唯一允许：

```ts
import { Chess } from 'chess.js'
```

的位置就是这个插件。

---

## 必须建立转换层

`chess.js` 使用：

```text
p n b r q k
w b
```

项目内部使用：

```text
pawn knight bishop rook queen king
white black
```

需要在 RulePlugin 内部转换。

---

- [ ] **Step 1：测试标准开局**

```ts
test('creates standard initial chess state', () => {
  const session =
    chessJsRulePlugin.createSession()

  const state = session.getState()

  expect(state.status.turn).toBe('white')
  expect(state.board.e2).toEqual({
    color: 'white',
    type: 'pawn',
  })

  expect(state.board.e7).toEqual({
    color: 'black',
    type: 'pawn',
  })
})
```

- [ ] **Step 2：验证失败**

```bash
npm test -- ChessJsRulePlugin
```

- [ ] **Step 3：实现 `createSession()` + `getState()`**

内部持有：

```ts
const chess = new Chess()
```

并通过：

```ts
chess.fen()
chess.board()
chess.history({ verbose: true })
```

生成领域 `GameState`。

---

- [ ] **Step 4：测试合法落点**

```ts
test('returns e3 and e4 for pawn on e2', () => {
  const session =
    chessJsRulePlugin.createSession()

  const moves =
    session.getLegalMoves('e2')

  expect(moves).toEqual(
    expect.arrayContaining([
      { from: 'e2', to: 'e3' },
      { from: 'e2', to: 'e4' },
    ]),
  )
})
```

- [ ] **Step 5：实现 `getLegalMoves()`**

使用：

```ts
chess.moves({
  square,
  verbose: true,
})
```

但返回项目自己的 `Move[]`。

---

- [ ] **Step 6：测试非法移动**

```ts
test('rejects illegal move', () => {
  const session =
    chessJsRulePlugin.createSession()

  expect(() =>
    session.makeMove({
      from: 'e2',
      to: 'e5',
    }),
  ).toThrow()
})
```

---

- [ ] **Step 7：实现 `makeMove()`**

使用：

```ts
chess.move({
  from,
  to,
  promotion,
})
```

非法时抛出领域错误，不留下半修改状态。

---

- [ ] **Step 8：测试并实现特殊规则**

分别加入测试：

```text
王车易位
吃过路兵
兵升变
将军
将死
和棋
```

将死测试可以使用 Fool's Mate：

```text
f2-f3
e7-e5
g2-g4
d8-h4
```

断言：

```ts
expect(state.status.phase)
  .toBe('checkmate')

expect(state.status.winner)
  .toBe('black')
```

---

- [ ] **Step 9：测试 undo**

```ts
test('undo restores previous position', () => {
  const session =
    chessJsRulePlugin.createSession()

  session.makeMove({
    from: 'e2',
    to: 'e4',
  })

  session.undo()

  expect(session.getState().board.e2)
    .toEqual({
      color: 'white',
      type: 'pawn',
    })
})
```

---

- [ ] **Step 10：验证**

```bash
npm test -- ChessJsRulePlugin
npm test
npm run build
```

- [ ] **Step 11：提交**

```bash
git add src/plugins/rules
git commit -m "feat: add chess.js rule plugin"
```

---

# Task 4：实现 HumanPlayerPlugin 与 MemoryStoragePlugin

**Files**

Create:

```text
src/plugins/players/HumanPlayerPlugin.ts
src/plugins/players/HumanPlayerPlugin.test.ts
src/plugins/storage/MemoryStoragePlugin.ts
src/plugins/storage/MemoryStoragePlugin.test.ts
```

## HumanPlayerPlugin

行为：

```text
GameCore 调用 requestMove()
↓
HumanPlayer 等待
↓
UI 提交走子
↓
pushExternalMove()
↓
Promise resolve
```

- [ ] **Step 1：写失败测试**

```ts
test('resolves requested move when external move arrives', async () => {
  const player =
    new HumanPlayerPlugin(
      'white-player',
      'White',
      'white',
    )

  const controller = new AbortController()

  const promise = player.requestMove(
    { state: fakeState },
    controller.signal,
  )

  player.pushExternalMove({
    from: 'e2',
    to: 'e4',
  })

  await expect(promise).resolves.toEqual({
    from: 'e2',
    to: 'e4',
  })
})
```

- [ ] **Step 2：实现等待 Promise**

HumanPlayerPlugin 内只允许一个 pending move request。

如果请求被 AbortController 取消：

```ts
promise rejects with AbortError
```

这样 restart、undo 时能够取消旧回合。

---

## MemoryStoragePlugin

- [ ] **Step 3：写失败测试**

```ts
test('saves and loads a game', async () => {
  const storage =
    new MemoryStoragePlugin()

  await storage.save({
    id: 'current',
    state: fakeState,
  })

  await expect(
    storage.load('current'),
  ).resolves.toEqual({
    id: 'current',
    state: fakeState,
  })
})
```

- [ ] **Step 4：实现**

内部：

```ts
private games =
  new Map<string, SavedGame>()
```

保存时需要创建副本，避免外部对象修改污染存储。

---

- [ ] **Step 5：测试 clear**

```ts
await storage.clear('current')

expect(
  await storage.load('current'),
).toBeNull()
```

- [ ] **Step 6：验证**

```bash
npm test
npm run build
```

- [ ] **Step 7：提交**

```bash
git add src/plugins/players src/plugins/storage
git commit -m "feat: add human player and memory storage plugins"
```

---

# Task 5：实现 PluginRegistry 与 GameCore

这是整个项目最关键的一步。

**Files**

Create:

```text
src/core/PluginRegistry.ts
src/core/GameCore.ts
src/core/GameCore.test.ts
```

**Consumes**

```text
RulePlugin
PlayerPlugin
StoragePlugin
EventBus
```

**Produces**

```ts
GameCore.start()
GameCore.getState()
GameCore.getLegalMoves()
GameCore.submitMove()
GameCore.undo()
GameCore.reset()
GameCore.subscribe()
```

---

## 配置接口

```ts
export interface GameConfig {
  rules: RulePlugin

  players: {
    white: PlayerPlugin
    black: PlayerPlugin
  }

  storage: StoragePlugin
}
```

Board 和 Theme 属于 React/UI 配置，不进入纯逻辑 GameCore。

---

## GameCore 公共 API

```ts
class GameCore {
  start(): void

  stop(): void

  getState(): GameState

  getLegalMoves(
    square: Square,
  ): Move[]

  submitMove(
    move: Move,
  ): void

  undo(): Promise<void>

  reset(): Promise<void>

  on<K extends keyof GameEvents>(
    event: K,
    handler: (
      payload: GameEvents[K]
    ) => void,
  ): () => void
}
```

---

- [ ] **Step 1：用 FakeRulePlugin 写失败测试**

测试：

```ts
test('accepts a legal player move and changes turn', async () => {
  core.start()

  core.submitMove({
    from: 'e2',
    to: 'e4',
  })

  await waitForMicrotasks()

  expect(core.getState().status.turn)
    .toBe('black')
})
```

Fake 插件避免 GameCore 测试依赖 chess.js。

---

- [ ] **Step 2：实现启动回合**

```text
start()
↓
创建 RuleSession
↓
emit gameStarted
↓
requestCurrentPlayerMove()
```

`requestCurrentPlayerMove()`：

```text
读取 state.status.turn
↓
找对应 PlayerPlugin
↓
await player.requestMove(...)
↓
交给 RuleSession.makeMove()
```

---

- [ ] **Step 3：实现 `submitMove()`**

```ts
submitMove(move: Move) {
  const player =
    this.getCurrentPlayer()

  if (!player.pushExternalMove) {
    throw new Error(
      'Current player does not accept external moves',
    )
  }

  player.pushExternalMove(move)
}
```

这样 Board 永远不直接知道 HumanPlayerPlugin。

---

- [ ] **Step 4：测试非法走子**

断言：

```text
moveRejected 被触发
state 不改变
仍然是同一个玩家回合
```

---

- [ ] **Step 5：测试事件**

至少：

```text
gameStarted
moveMade
moveRejected
turnChanged
check
gameEnded
```

---

- [ ] **Step 6：测试 Storage 保存**

合法走子之后：

```ts
expect(storage.savedState)
  .toEqual(core.getState())
```

Storage 出错：

```text
emit error
但游戏仍能继续
```

---

- [ ] **Step 7：测试 undo**

```text
e2-e4
↓
undo
↓
白兵回 e2
↓
重新轮到白方
↓
emit moveUndone
```

undo 前必须：

```text
abort 当前 pending turn
```

然后重新开启正确玩家回合。

---

- [ ] **Step 8：测试 reset**

```text
发生若干走子
↓
reset
↓
恢复初始盘面
↓
历史为空
↓
白方回合
↓
emit gameReset
```

---

- [ ] **Step 9：验证 Core 不依赖 React**

检查：

```bash
grep -R "from 'react'" src/core
```

预期：

```text
无结果
```

---

- [ ] **Step 10：验证**

```bash
npm test -- GameCore
npm test
npm run build
```

- [ ] **Step 11：提交**

```bash
git add src/core
git commit -m "feat: implement plugin driven game core"
```

---

# Task 6：实现 ChessComThemePlugin 与页面骨架

**Files**

Create:

```text
src/plugins/themes/ChessComTheme.ts
src/plugins/themes/ChessComTheme.test.ts
src/components/GameLayout.tsx
src/components/GameStatus.tsx
src/components/MoveHistory.tsx
src/components/GameControls.tsx
src/index.css
```

---

- [ ] **Step 1：主题 Contract Test**

```ts
test('provides all required theme tokens', () => {
  expect(
    chessComTheme.tokens.lightSquare,
  ).toBeTruthy()

  expect(
    chessComTheme.tokens.darkSquare,
  ).toBeTruthy()

  expect(
    chessComTheme.tokens.legalMove,
  ).toBeTruthy()
})
```

---

- [ ] **Step 2：实现 ChessComTheme**

禁止 UI 组件直接写：

```css
background: #xxxxxx
```

关键颜色必须来自主题 tokens。

可通过 CSS Variables 注入：

```ts
function themeToCssVariables(
  theme: ThemePlugin,
) {
  return {
    '--page-background':
      theme.tokens.pageBackground,

    '--light-square':
      theme.tokens.lightSquare,

    '--dark-square':
      theme.tokens.darkSquare,
  }
}
```

---

- [ ] **Step 3：实现桌面布局**

结构：

```text
Header
Main
├── Board area
└── Side panel
    ├── GameStatus
    ├── MoveHistory
    └── GameControls
```

---

- [ ] **Step 4：实现移动端媒体查询**

目标：

```text
desktop → 左棋盘右面板
mobile  → 上棋盘下面板
```

---

- [ ] **Step 5：组件测试**

确认：

```text
当前回合可显示
棋谱可显示
悔棋按钮存在
重新开始按钮存在
```

---

- [ ] **Step 6：验证**

```bash
npm test
npm run build
```

- [ ] **Step 7：提交**

```bash
git add src/plugins/themes src/components src/index.css
git commit -m "feat: add default theme and game layout"
```

---

# Task 7：实现 DefaultBoardPlugin

**Files**

Create:

```text
src/plugins/board/DefaultBoardPlugin.tsx
src/plugins/board/DefaultBoard/DefaultBoard.tsx
src/plugins/board/DefaultBoard/DefaultBoard.css
src/plugins/board/DefaultBoard/DefaultBoard.test.tsx
```

**目标**

同时支持：

```text
点击走子
拖拽走子
合法落点提示
选中格提示
上一步提示
将军提示
```

---

## 第一阶段：只做点击

- [ ] **Step 1：测试选中棋子**

```tsx
await user.click(
  screen.getByTestId('square-e2'),
)

expect(
  onSquareSelect,
).toHaveBeenCalledWith('e2')
```

---

- [ ] **Step 2：测试合法落点**

传入：

```ts
legalMoves={[
  { from: 'e2', to: 'e3' },
  { from: 'e2', to: 'e4' },
]}
```

断言：

```text
e3 有 legal marker
e4 有 legal marker
```

---

- [ ] **Step 3：实现棋盘**

固定生成：

```text
a8 ... h8
...
a1 ... h1
```

每格带：

```tsx
data-testid={`square-${square}`}
```

---

## 第二阶段：实现 Board Controller

React hook 维护：

```ts
selectedSquare
legalMoves
```

流程：

```text
点击己方棋子
↓
core.getLegalMoves(square)
↓
保存 selectedSquare
↓
显示落点
```

点击合法目标：

```text
core.submitMove(move)
```

---

## 第三阶段：拖拽

- [ ] **Step 4：先写拖拽失败测试**

验证：

```text
e2 拖到 e4
→ onMove({from:'e2',to:'e4'})
```

---

- [ ] **Step 5：使用 Pointer Events**

优先采用：

```text
pointerdown
pointermove
pointerup
```

而不是只使用 HTML5 Drag API。

原因：

> 同一实现可以兼容桌面鼠标和移动端触控。

BoardPlugin 根据 pointerup 位置计算目标 square。

---

- [ ] **Step 6：非法拖拽**

Board 不先修改 canonical state。

因此非法拖拽时：

```text
GameCore state 不变
↓
React 自动重新渲染原始位置
```

不需要手工“把棋子移动回去”。

---

- [ ] **Step 7：验证**

```bash
npm test -- DefaultBoard
npm test
npm run build
```

- [ ] **Step 8：提交**

```bash
git add src/plugins/board
git commit -m "feat: add interactive default chess board"
```

---

# Task 8：实现 Promotion、棋谱、状态、悔棋与结束对局

**Files**

Create/Modify:

```text
src/components/PromotionDialog.tsx
src/components/GameResultDialog.tsx
src/components/GameStatus.tsx
src/components/MoveHistory.tsx
src/components/GameControls.tsx
src/hooks/useGameCore.ts
```

---

## useGameCore

职责：

```text
订阅 GameCore 事件
↓
同步 React state
↓
向组件暴露 actions
```

返回：

```ts
{
  state,
  legalMoves,
  selectedSquare,
  selectSquare,
  move,
  undo,
  reset,
}
```

---

## 兵升变

- [ ] **Step 1：测试 PromotionDialog**

```tsx
render(
  <PromotionDialog
    color="white"
    onSelect={onSelect}
  />,
)

await user.click(
  screen.getByRole(
    'button',
    { name: '升变为后' },
  ),
)

expect(onSelect)
  .toHaveBeenCalledWith('queen')
```

---

- [ ] **Step 2：实现 pending promotion**

如果目标 move 需要 promotion：

```text
不要立即 submitMove
↓
保存 pending move
↓
显示 PromotionDialog
↓
用户选择
↓
添加 promotion
↓
submitMove
```

---

## 棋谱

显示：

```text
1. e4 e5
2. Nf3 Nc6
```

数据必须来自：

```ts
GameState.history
```

UI 不自己重新计算 SAN。

---

## GameStatus

根据 `GameState.status` 显示：

```text
轮到白方
轮到黑方
白方被将军
黑方被将军
白方获胜：将死
黑方获胜：将死
和棋
```

---

## GameResultDialog

仅：

```text
phase !== playing
```

时显示。

包含：

```text
再来一局
查看棋谱
```

最终棋盘保持可见。

---

## GameControls

悔棋：

```ts
await core.undo()
```

重新开始：

```ts
await core.reset()
```

重新开始可以加简单确认框，但不新增复杂状态机。

---

- [ ] **Step 3：完整组件测试**

覆盖：

```text
升变
悔棋
重新开始
棋谱更新
将军提示
将死结果
和棋结果
```

---

- [ ] **Step 4：验证**

```bash
npm test
npm run build
```

- [ ] **Step 5：提交**

```bash
git add src/components src/hooks
git commit -m "feat: add game controls status and promotion flow"
```

---

# Task 9：组装 PluginRegistry 与默认应用配置

**Files**

Create:

```text
src/core/PluginRegistry.ts
src/config/defaultGameConfig.ts
```

Modify:

```text
src/App.tsx
```

---

## PluginRegistry

职责：

> 统一注册和读取 UI 插件。

API：

```ts
class PluginRegistry {
  registerTheme(
    plugin: ThemePlugin,
  ): void

  registerBoard(
    plugin: BoardPlugin,
  ): void

  getTheme(id: string): ThemePlugin

  getBoard(id: string): BoardPlugin
}
```

---

## 默认配置

```ts
export const defaultGameConfig = {
  rule: chessJsRulePlugin,

  players: {
    white:
      new HumanPlayerPlugin(
        'white',
        'White',
        'white',
      ),

    black:
      new HumanPlayerPlugin(
        'black',
        'Black',
        'black',
      ),
  },

  storage:
    new MemoryStoragePlugin(),

  theme:
    chessComTheme,

  board:
    defaultBoardPlugin,
}
```

---

- [ ] **Step 1：App 集成测试**

```tsx
render(<App />)

expect(
  screen.getByTestId('square-e2'),
).toBeInTheDocument()

expect(
  screen.getByText('轮到白方'),
).toBeInTheDocument()
```

---

- [ ] **Step 2：完整点击走子测试**

```text
点击 e2
点击 e4
```

断言：

```text
e4 出现白兵
e2 为空
显示轮到黑方
棋谱出现 e4
```

---

- [ ] **Step 3：主题替换测试**

注册一个 TestTheme：

```ts
const testTheme = {
  ...
  tokens: {
    ...
    lightSquare: 'rgb(1, 2, 3)',
  },
}
```

切换配置以后验证 UI 使用新 token。

这证明 ThemePlugin 不只是“名义上的接口”。

---

- [ ] **Step 4：验证**

```bash
npm test
npm run build
```

- [ ] **Step 5：提交**

```bash
git add src/core src/config src/App.tsx
git commit -m "feat: compose plugin chess application"
```

---

# Task 10：错误隔离

**Files**

Create:

```text
src/components/GameErrorBoundary.tsx
```

Modify:

```text
src/App.tsx
src/core/GameCore.ts
```

---

## ThemePlugin 失败

主题不存在：

```text
fallback → chessComTheme
```

---

## StoragePlugin 失败

测试：

```ts
const storage = new ThrowingStorage()

core.start()
core.submitMove(...)

expect(core.getState())
  .toEqual(validMovedState)

expect(errorHandler)
  .toHaveBeenCalled()
```

说明：

> 保存失败不得回滚合法走子。

---

## PlayerPlugin 失败

如果 `requestMove()` 非 AbortError 地 reject：

```text
emit error
暂停该回合
不自动切换玩家
```

---

## RulePlugin 失败

如果规则插件抛 unexpected error：

```text
abort current turn
emit error
停止接受新的走子
```

GameCore 增加：

```ts
isFaulted(): boolean
```

faulted 状态下：

```ts
submitMove()
```

直接拒绝。

---

## BoardPlugin 失败

使用：

```tsx
<GameErrorBoundary>
  <Board />
</GameErrorBoundary>
```

fallback：

```text
棋盘加载失败
请重新开始游戏
```

---

- [ ] **Step 1：逐项写失败测试**
- [ ] **Step 2：实现对应最小行为**
- [ ] **Step 3：运行**

```bash
npm test
npm run build
```

- [ ] **Step 4：提交**

```bash
git add src/core src/components src/App.tsx
git commit -m "feat: isolate plugin runtime failures"
```

---

# Task 11：完整 MVP 验收测试

这一阶段不再增加新功能。

只验证设计文档要求已经真正实现。

**Files**

Modify/Create:

```text
src/App.test.tsx
src/plugins/rules/ChessJsRulePlugin.test.ts
```

---

## 用户主流程

自动化完成：

```text
1. e4 e5
2. Nf3 Nc6
3. Bb5
```

验证：

```text
棋盘正确
棋谱正确
当前轮到黑方
```

---

## Fool's Mate

执行：

```text
1. f3 e5
2. g4 Qh4#
```

验证：

```text
GameStatus = 黑方获胜
phase = checkmate
winner = black
结果弹窗出现
```

---

## 悔棋流程

```text
e4
e5
undo
```

验证：

```text
黑兵重新在 e7
轮到黑方
历史只有 e4
```

---

## Restart

发生若干走子以后：

```text
reset
```

验证：

```text
标准初始局面
历史为空
白方回合
```

---

## Plugin Contract 验证

必须证明：

```text
ChessJsRulePlugin
HumanPlayerPlugin
MemoryStoragePlugin
ChessComThemePlugin
DefaultBoardPlugin
```

都可以独立加载。

---

## 架构泄漏检查

运行：

```bash
grep -R "from 'chess.js'" src
```

唯一允许结果：

```text
src/plugins/rules/ChessJsRulePlugin.ts
```

然后：

```bash
grep -R "from 'react'" src/core
```

预期：

```text
无结果
```

---

## 最终验证

```bash
npm test
npm run build
```

要求：

```text
全部测试通过
TypeScript 无错误
生产构建成功
```

然后人工检查：

```text
桌面端
移动端
点击走子
拖拽走子
升变
将军
将死
和棋
悔棋
重开
主题样式
```

---

# Task 12：README 与项目说明

**Files**

Create/Modify:

```text
README.md
```

README 至少说明：

```text
项目是什么
为什么做插件化
五类插件分别是什么
整体架构
如何启动
如何测试
如何增加新 ThemePlugin
如何增加新 PlayerPlugin
MVP 当前支持什么
后续计划
```

增加架构图：

```text
Board / UI
     │
     ▼
 Game Core
     │
 ┌───┼───────────┐
 ▼   ▼           ▼
Rule Player    Storage

Theme → UI
```

并明确：

```text
AI / Stockfish 尚未实现
在线联机尚未实现
```

避免 README 描述超出当前实际能力。

---

- [ ] **Step 1：写 README**
- [ ] **Step 2：重新运行**

```bash
npm test
npm run build
```

- [ ] **Step 3：最终提交**

```bash
git add .
git commit -m "docs: document plugin chess architecture"
```

---

# 最终 Definition of Done

只有以下条件全部满足，MVP 才算完成：

```text
✓ 本地双人可以完整下一盘棋

✓ 点击走子可用

✓ 拖拽走子可用

✓ 王车易位正确

✓ 吃过路兵正确

✓ 兵升变正确

✓ 将军正确

✓ 将死正确

✓ 和棋正确

✓ 棋谱正确

✓ 悔棋正确

✓ 重开正确

✓ Chess.com 风格默认主题正常

✓ 手机端可正常使用

✓ RulePlugin 可替换

✓ PlayerPlugin 可替换

✓ BoardPlugin 可替换

✓ ThemePlugin 可替换

✓ StoragePlugin 可替换

✓ GameCore 不依赖 React

✓ chess.js 只存在于 RulePlugin

✓ 插件错误具有隔离策略

✓ Contract Tests 通过

✓ GameCore Tests 通过

✓ UI Tests 通过

✓ npm test 通过

✓ npm run build 通过
```

---

# 推荐开发顺序

```text
项目骨架
   ↓
领域类型和插件契约
   ↓
RulePlugin
   ↓
Player + Storage
   ↓
GameCore
   ↓
Theme + Layout
   ↓
Board
   ↓
Promotion / Status / History
   ↓
完整组装
   ↓
错误隔离
   ↓
MVP 验收
   ↓
README
```

不要先做漂亮棋盘，再回头补 Core。

这个项目最重要的价值首先是：

> **插件边界成立。**

其次才是：

> **界面好看。**