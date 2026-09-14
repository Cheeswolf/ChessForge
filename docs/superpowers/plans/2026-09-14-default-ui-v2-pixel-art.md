# ChessForge Default UI V2 — Pixel Art Redesign Implementation Plan (Claude Code + Kimi K3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ChessForge 从“打开即进入棋局的开发 Demo”升级为具有 Home → Match Setup → Game 三屏流程、用户可感知插件配置和 Pixel Forge 默认像素艺术视觉的可展示产品 MVP，同时保持现有 GameCore/RulePlugin 棋局核心稳定。

**Architecture:** 在现有插件核心外增加轻量 `AppShell` 产品层，使用序列化 `MatchConfig` 保存插件 ID，并通过扩展后的 `PluginRegistry` 在开局时解析为具体插件实例。`GamePage` 接管当前 `App.tsx` 的棋局装配逻辑；`DefaultBoard` 保持 `BoardPluginProps` 契约不变，只重做像素棋盘、像素棋子和交互标记。核心规则、棋局事件循环、现有 Rule/Player/Storage 插件契约不重构。

**Tech Stack:** React 19.3, TypeScript 7, Vite 8, Vitest 5, Testing Library, chess.js 1.4, CSS custom properties, inline crisp-edge SVG pixel sprites.

**Execution Environment:** Claude Code + Kimi K3 multimodal backend. Visual tasks MUST directly inspect the approved reference image; no text-only visual inference is allowed.

**Spec:** `docs/superpowers/specs/2026-09-14-default-ui-v2-pixel-art-design.md`（已由用户批准；与 canonical visual reference 联合构成设计输入。）

**Canonical Visual Reference:** `docs/design/pixel-forge/pixel-forge-reference-approved.png`

**Visual Gate Checklist:** `docs/reviews/PIXEL-FORGE-VISUAL-GATES.md`

## Global Constraints

- 指定 coding agent 为 **Claude Code + Kimi K3**；所有执行说明都以该环境为准。
- Canonical visual reference 固定为 `docs/design/pixel-forge/pixel-forge-reference-approved.png`（SHA-256 `0e4e13d01d8421e3ce91abb5b9dbdd76c3f222c49a79c05b71f90defacc1eaf6`）。
- 任何视觉任务开始前，Kimi K3 必须直接读取该图片并输出具体 `Visual Reference Readback`；若图片没有进入模型上下文，必须停止视觉任务，不得凭文字猜。
- 批准图是视觉外观权威；design spec / plan 是行为、架构、响应式和错误态权威。
- Home/Setup 完成后必须过 Gate A；Board/Pieces 完成后必须过 Gate B；完整 GamePage/Dialog 完成后必须过 Gate C。
- Gate 中出现 P0/P1 视觉差异时，先修复再继续；不得用“测试已通过”替代视觉验收。
- 默认视觉必须是 **Pixel Forge — 深色中世纪奇幻像素艺术 + 现代信息布局**。
- 打开应用首先进入 `HomePage`，不得自动创建/启动棋局。
- 产品流程固定为 `HOME | SETUP | GAME`；不引入 React Router。
- `Quick Start` 直接使用默认插件组合进入 `GamePage`。
- `MatchSetupPage` 必须展示 Rule / White Player / Black Player / Board / Theme / Storage 六个选择位，并从 `PluginRegistry` 枚举可用项，禁止在 JSX 中写死插件列表。
- `activeMatchConfig` 在开局后冻结；对局中插件面板只读，不支持核心插件热切换。
- `GameCore.ts`、`RulePlugin.ts`、`ChessJsRulePlugin.ts` 的职责与公共行为保持不变；UI 代码不得进入规则层。
- `BoardPluginProps` 契约保持不变。
- `ThemePlugin` 本轮只承担 token，不扩展 `pieceSet/iconSet/soundSet/animationSet`。
- 默认棋子不得使用 Unicode `♔♕♖♗♘♙/♚♛♜♝♞♟`；必须使用真正的 crisp-edge 像素精灵。
- 像素棋子逻辑坐标系固定为 `32×32`，所有几何坐标使用整数，不使用 Bézier 曲线；SVG 使用 `shape-rendering="crispEdges"`。
- 棋盘坐标只显示在外框，不在每个格子重复显示代数坐标。
- 合法空格移动与合法吃子必须使用不同视觉 marker。
- 动画遵循“短、硬、脆”：按钮 60–100ms、棋子 100–160ms、面板约 150ms；支持 `prefers-reduced-motion`。
- 不新增 Stockfish、在线对战、用户系统、Elo、计时器、云存档、插件市场、Chess960、SoundPlugin、3D Board。
- 每个实现任务必须先写失败测试，再写最小实现，再运行目标测试，最后提交。
- 每个任务结束后不得留下未完成标记或最终不可用的临时实现。
- 最终必须通过 `npm test` 和 `npm run build`。

---

## File Map

### 新增

- `docs/design/pixel-forge/pixel-forge-reference-approved.png` — 用户批准的 canonical visual reference；Kimi K3 视觉任务必须直接读取。
- `docs/agents/CLAUDE_CODE_KIMI_K3.md` — Claude Code + Kimi K3 执行协议。
- `docs/reviews/PIXEL-FORGE-VISUAL-GATES.md` — Gate A/B/C 视觉验收清单。
- `src/app/AppScreen.ts` — `AppScreen` 类型，仅表示 `home | setup | game`。
- `src/app/MatchConfig.ts` — `MatchConfig`、插件 factory definition 类型、配置校验与解析函数。
- `src/app/MatchConfig.test.ts` — 配置校验/解析单元测试。
- `src/app/AppShell.tsx` — 三屏状态、draft/active config、页面切换。
- `src/app/AppShell.test.tsx` — Home/Setup/Game 主流程测试。
- `src/config/defaultPluginRegistry.ts` — 注册默认 Rule/Player/Board/Theme/Storage 插件定义。
- `src/pages/HomePage/HomePage.tsx` / `.css` — 品牌首页。
- `src/pages/MatchSetupPage/MatchSetupPage.tsx` / `.css` — 插件配置页。
- `src/pages/MatchSetupPage/PluginSelector.tsx` — 单个插件选择控件。
- `src/pages/MatchSetupPage/MatchSetupPage.test.tsx` — 配置页测试。
- `src/pages/GamePage/GamePage.tsx` / `.css` — 当前棋局页面。
- `src/pages/GamePage/GamePage.test.tsx` — 当前局配置、退出、插件面板测试。
- `src/components/PixelButton.tsx` — Primary/Secondary/Danger 三类像素按钮。
- `src/components/PixelPanel.tsx` — 通用像素硬边框面板。
- `src/components/ExitMatchDialog.tsx` / `.test.tsx` — 已走棋时退出确认。
- `src/plugins/themes/PixelForgeTheme.ts` — 默认 Pixel Forge tokens。
- `src/plugins/themes/themeCss.ts` / `.test.ts` — theme token → CSS variable 映射与校验。
- `src/plugins/board/DefaultBoard/PixelPiece.tsx` / `.test.tsx` — 32×32 crisp-edge 像素棋子。

### 修改

- `src/core/PluginRegistry.ts` / `.test.ts` — 扩展到五类插件和可枚举注册表。
- `src/config/defaultGameConfig.ts` — 从具体实例默认配置转为默认 `MatchConfig` 常量；保留必要兼容导出仅到迁移完成。
- `src/App.tsx` — 瘦身为 `AppShell` 入口。
- `src/App.test.tsx` — 改为产品流程端到端验收，不再假设打开即出现棋盘。
- `src/plugins/board/DefaultBoard/DefaultBoard.tsx` / `.css` / `.test.tsx` — 像素棋盘、坐标、marker、PixelPiece。
- `src/plugins/board/DefaultBoardPlugin.tsx` — 显示名改为 `Pixel Board`，插件 id 保持稳定或通过迁移测试验证。
- `src/plugins/themes/ChessComTheme.ts` — 仅保留旧主题；`themeToCssVariables` 移入独立模块。
- `src/components/GameLayout.tsx` — 若迁移后无引用则删除；若保留，仅作为 GamePage 内布局壳。
- `src/components/GameStatus.tsx`
- `src/components/MoveHistory.tsx`
- `src/components/GameControls.tsx`
- `src/components/PromotionDialog.tsx` / `.test.tsx`
- `src/components/GameResultDialog.tsx` / `.test.tsx`
- `src/components/GameErrorBoundary.tsx` / `.test.tsx`
- `src/index.css` — Pixel Forge 全局基础、响应式与 reduced-motion。
- `src/main.tsx` — 保持 StrictMode；仅在 import 需要时调整。
- `index.html` — `<title>ChessForge</title>`。
- `README.md` — 更新启动流程、默认 Pixel Forge UI 和插件配置说明。

---

### Task 0: 多模态视觉预检与项目基线

**Files:**
- Read: `docs/design/pixel-forge/pixel-forge-reference-approved.png`
- Read: `docs/superpowers/specs/2026-09-14-default-ui-v2-pixel-art-design.md`
- Read: `docs/reviews/PIXEL-FORGE-VISUAL-GATES.md`
- Read: `src/App.tsx`
- Read: `src/core/PluginRegistry.ts`
- Read: `src/plugins/board/DefaultBoard/DefaultBoard.tsx`
- Read: `src/index.css`

**Purpose:** 在任何 UI 修改之前，证明 Kimi K3 已经真正收到并理解批准图，同时建立可验证的测试/build 基线。

- [ ] **Step 1: 视觉读取批准图**

直接向 Kimi K3 提供：

`docs/design/pixel-forge/pixel-forge-reference-approved.png`

不得只告诉模型图片路径而没有实际图像输入。

- [ ] **Step 2: 输出 Visual Reference Readback**

必须输出至少：

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

每一项必须包含从图片中看到的具体视觉事实。

Expected: Readback 能明确区分三个页面，并描述暗色中世纪像素、暖金/木质面板、像素棋子和棋盘/HUD关系。

如果做不到：STOP，不进入 Task 1。

- [ ] **Step 3: 检查工作区**

```bash
git status --short
```

记录已有用户改动，不覆盖无关文件。

- [ ] **Step 4: 运行基线测试**

```bash
npm test
```

记录测试数量和失败数量。

- [ ] **Step 5: 运行基线 build**

```bash
npm run build
```

记录 exit code。

- [ ] **Step 6: 不提交生产改动**

Task 0 只确认视觉输入和工程基线；除非批准的 spec/plan/reference 尚未加入仓库，否则不修改生产代码。

---

### Task 1: 扩展 PluginRegistry，使配置页可以枚举五类插件

**Files:**
- Modify: `src/core/PluginRegistry.ts`
- Modify: `src/core/PluginRegistry.test.ts`
- Create: `src/app/MatchConfig.ts`（只先放 factory definition 类型；解析函数在 Task 2 完成）

**Interfaces:**
- Consumes: `Plugin { id: string; name: string }`, `RulePlugin`, `PlayerPlugin`, `BoardPlugin`, `ThemePlugin`, `StoragePlugin`, `Color`。
- Produces:
  ```ts
  export interface PlayerPluginDefinition extends Plugin {
    create(color: Color): PlayerPlugin
  }

  export interface StoragePluginDefinition extends Plugin {
    create(): StoragePlugin
  }
  ```
- Produces `PluginRegistry` API:
  ```ts
  registerRule(plugin: RulePlugin): void
  registerPlayer(plugin: PlayerPluginDefinition): void
  registerBoard(plugin: BoardPlugin): void
  registerTheme(plugin: ThemePlugin): void
  registerStorage(plugin: StoragePluginDefinition): void

  getRule(id: string): RulePlugin
  getPlayer(id: string): PlayerPluginDefinition
  getBoard(id: string): BoardPlugin
  getTheme(id: string): ThemePlugin
  getStorage(id: string): StoragePluginDefinition

  getRulePlugins(): RulePlugin[]
  getPlayerPlugins(): PlayerPluginDefinition[]
  getBoardPlugins(): BoardPlugin[]
  getThemePlugins(): ThemePlugin[]
  getStoragePlugins(): StoragePluginDefinition[]
  ```

- [ ] **Step 1: 写失败测试，覆盖注册、解析和枚举**

在 `src/core/PluginRegistry.test.ts` 增加：

```ts
import type { RulePlugin } from '../plugins/rules/RulePlugin'
import type { PlayerPluginDefinition, StoragePluginDefinition } from '../app/MatchConfig'

const rule: RulePlugin = {
  id: 'rule-a',
  name: 'Rule A',
  createSession: () => ({
    getState: () => { throw new Error('not used') },
    getLegalMoves: () => [],
    makeMove: () => { throw new Error('not used') },
    undo: () => { throw new Error('not used') },
    reset: () => { throw new Error('not used') },
  }),
}

const player: PlayerPluginDefinition = {
  id: 'human-player',
  name: 'Human',
  create: (color) => ({
    id: `human-${color}`,
    name: color === 'white' ? 'White' : 'Black',
    color,
    requestMove: async () => new Promise(() => undefined),
  }),
}

const storage: StoragePluginDefinition = {
  id: 'memory-storage',
  name: 'Memory Session',
  create: () => ({
    id: 'memory-instance',
    name: 'Memory Session',
    save: async () => undefined,
    load: async () => null,
    clear: async () => undefined,
  }),
}

test('enumerates registered plugin definitions by category', () => {
  const registry = new PluginRegistry()
  registry.registerRule(rule)
  registry.registerPlayer(player)
  registry.registerStorage(storage)

  expect(registry.getRulePlugins()).toEqual([rule])
  expect(registry.getPlayerPlugins()).toEqual([player])
  expect(registry.getStoragePlugins()).toEqual([storage])
})

test('throws when a requested rule, player or storage id is missing', () => {
  const registry = new PluginRegistry()
  expect(() => registry.getRule('missing')).toThrow('Rule not registered: missing')
  expect(() => registry.getPlayer('missing')).toThrow('Player not registered: missing')
  expect(() => registry.getStorage('missing')).toThrow('Storage not registered: missing')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm test -- src/core/PluginRegistry.test.ts
```

Expected: FAIL，缺少 `registerRule/registerPlayer/registerStorage/get*Plugins`。

- [ ] **Step 3: 最小实现 Registry**

`PluginRegistry.ts` 使用五个 `Map<string, ...>`；枚举函数统一 `return [...map.values()]`。未知 id 的错误消息固定为：

```ts
throw new Error(`Rule not registered: ${id}`)
throw new Error(`Player not registered: ${id}`)
throw new Error(`Board not registered: ${id}`)
throw new Error(`Theme not registered: ${id}`)
throw new Error(`Storage not registered: ${id}`)
```

不得修改现有 `BoardPlugin` / `ThemePlugin` 接口。

- [ ] **Step 4: 运行 Registry 测试**

```bash
npm test -- src/core/PluginRegistry.test.ts
```

Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/core/PluginRegistry.ts src/core/PluginRegistry.test.ts src/app/MatchConfig.ts
git commit -m "feat: extend plugin registry for match setup"
```

---

### Task 2: 建立 MatchConfig、默认插件目录和配置解析

**Files:**
- Modify: `src/app/MatchConfig.ts`
- Create: `src/app/MatchConfig.test.ts`
- Create: `src/config/defaultPluginRegistry.ts`
- Modify: `src/config/defaultGameConfig.ts`
- Create: `src/plugins/themes/PixelForgeTheme.ts`
- Create: `src/plugins/themes/themeCss.ts`
- Create: `src/plugins/themes/themeCss.test.ts`
- Modify: `src/plugins/themes/ChessComTheme.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface MatchConfig {
    ruleId: string
    whitePlayerId: string
    blackPlayerId: string
    boardId: string
    themeId: string
    storageId: string
  }

  export interface ResolvedMatchConfig extends GameConfig {
    board: BoardPlugin
    theme: ThemePlugin
  }

  export function validateMatchConfig(config: MatchConfig, registry: PluginRegistry): string[]
  export function resolveMatchConfig(config: MatchConfig, registry: PluginRegistry): ResolvedMatchConfig
  ```
- Produces:
  ```ts
  export const defaultMatchConfig: MatchConfig
  export function createDefaultPluginRegistry(): PluginRegistry
  ```

- [ ] **Step 1: 写 MatchConfig 失败测试**

`src/app/MatchConfig.test.ts`：

```ts
import { createDefaultPluginRegistry } from '../config/defaultPluginRegistry'
import { defaultMatchConfig } from '../config/defaultGameConfig'
import { resolveMatchConfig, validateMatchConfig } from './MatchConfig'

test('default match config resolves every required plugin', () => {
  const registry = createDefaultPluginRegistry()
  expect(validateMatchConfig(defaultMatchConfig, registry)).toEqual([])

  const resolved = resolveMatchConfig(defaultMatchConfig, registry)
  expect(resolved.rules.id).toBe('chessjs-rule')
  expect(resolved.players.white.color).toBe('white')
  expect(resolved.players.black.color).toBe('black')
  expect(resolved.board.id).toBe('default-board')
  expect(resolved.theme.id).toBe('pixel-forge-theme')
  expect(resolved.storage.id).toBe('memory-storage')
})

test('reports missing plugin ids without constructing a game', () => {
  const registry = createDefaultPluginRegistry()
  const errors = validateMatchConfig(
    { ...defaultMatchConfig, blackPlayerId: 'missing-player' },
    registry,
  )
  expect(errors).toEqual(['Black player plugin is unavailable: missing-player'])
})
```

- [ ] **Step 2: 写 theme CSS 映射失败测试**

`themeCss.test.ts`：

```ts
import { pixelForgeTheme } from './PixelForgeTheme'
import { themeToCssVariables } from './themeCss'

test('maps Pixel Forge theme to stable css variables', () => {
  const variables = themeToCssVariables(pixelForgeTheme)
  expect(variables['--page-background']).toBe('#111827')
  expect(variables['--light-square']).toBe('#d8c39a')
  expect(variables['--dark-square']).toBe('#75533b')
  expect(variables['--border-radius']).toBe('0px')
})
```

- [ ] **Step 3: 运行目标测试确认失败**

```bash
npm test -- src/app/MatchConfig.test.ts src/plugins/themes/themeCss.test.ts
```

Expected: FAIL，目标模块尚不存在。

- [ ] **Step 4: 创建 Pixel Forge token**

`PixelForgeTheme.ts` 使用固定 token：

```ts
export const pixelForgeTheme: ThemePlugin = {
  id: 'pixel-forge-theme',
  name: 'Pixel Forge',
  tokens: {
    pageBackground: '#111827',
    panelBackground: '#182235',
    textPrimary: '#f2e7c9',
    textMuted: '#a9a184',
    lightSquare: '#d8c39a',
    darkSquare: '#75533b',
    selectedSquare: '#d9ad45',
    previousMove: '#9a7938',
    legalMove: '#4e8f78',
    checkSquare: '#8b3434',
    borderRadius: '0px',
    shadow: '4px 4px 0 rgba(0, 0, 0, 0.42)',
  },
}
```

把 `themeToCssVariables` 从 `ChessComTheme.ts` 移到 `themeCss.ts`，保持 CSS variable 名称兼容；`ChessComTheme.ts` 只导出旧主题本身。

- [ ] **Step 5: 实现默认 Registry factory**

`createDefaultPluginRegistry()` 每次返回新 Registry，并注册：

```ts
chessJsRulePlugin
humanPlayerDefinition
memoryStorageDefinition
defaultBoardPlugin
pixelForgeTheme
```

定义：

```ts
const humanPlayerDefinition: PlayerPluginDefinition = {
  id: 'human-player',
  name: 'Human',
  create: (color) => new HumanPlayerPlugin(
    `human-${color}`,
    color === 'white' ? 'White' : 'Black',
    color,
  ),
}

const memoryStorageDefinition: StoragePluginDefinition = {
  id: 'memory-storage',
  name: 'Memory Session',
  create: () => new MemoryStoragePlugin(),
}
```

`defaultMatchConfig` 固定：

```ts
export const defaultMatchConfig: MatchConfig = {
  ruleId: 'chessjs-rule',
  whitePlayerId: 'human-player',
  blackPlayerId: 'human-player',
  boardId: 'default-board',
  themeId: 'pixel-forge-theme',
  storageId: 'memory-storage',
}
```

- [ ] **Step 6: 实现校验与解析**

`validateMatchConfig` 不抛异常，按字段顺序返回错误；`resolveMatchConfig` 先校验，若有错误抛：

```ts
throw new Error(`Invalid match config: ${errors.join('; ')}`)
```

然后构造 fresh players 和 fresh storage：

```ts
return {
  rules: registry.getRule(config.ruleId),
  players: {
    white: registry.getPlayer(config.whitePlayerId).create('white'),
    black: registry.getPlayer(config.blackPlayerId).create('black'),
  },
  board: registry.getBoard(config.boardId),
  theme: registry.getTheme(config.themeId),
  storage: registry.getStorage(config.storageId).create(),
}
```

- [ ] **Step 7: 运行测试**

```bash
npm test -- src/app/MatchConfig.test.ts src/plugins/themes/themeCss.test.ts src/core/PluginRegistry.test.ts
```

Expected: PASS。

- [ ] **Step 8: 提交**

```bash
git add src/app src/config src/plugins/themes src/core/PluginRegistry.ts src/core/PluginRegistry.test.ts
git commit -m "feat: add serializable match configuration"
```

---

### Task 3: 建立 AppShell 与 HomePage，确保应用不再自动开局

**Files:**
- Create: `src/app/AppScreen.ts`
- Create: `src/app/AppShell.tsx`
- Create: `src/app/AppShell.test.tsx`
- Create: `src/pages/HomePage/HomePage.tsx`
- Create: `src/pages/HomePage/HomePage.css`
- Create: `src/components/PixelButton.tsx`
- Create: `src/components/PixelPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `index.html`

**Interfaces:**
- Produces `type AppScreen = 'home' | 'setup' | 'game'`。
- `HomePage` props:
  ```ts
  interface HomePageProps {
    onStartSetup(): void
    onQuickStart(): void
  }
  ```
- `AppShell` owns `draftConfig` / `activeMatchConfig`; Task 3 only renders Home and quick-start path, Setup stub must be a real internal branch returning a heading `MATCH SETUP` until Task 4 replaces it。

- [ ] **Step 1: 写失败测试：初始只能看到首页**

`AppShell.test.tsx`：

```ts
render(<AppShell />)
expect(screen.getByRole('heading', { name: 'CHESSFORGE' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: '开始游戏' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: '快速开始' })).toBeInTheDocument()
expect(screen.queryByTestId('square-e2')).not.toBeInTheDocument()
```

再测：

```ts
fireEvent.click(screen.getByRole('button', { name: '开始游戏' }))
expect(screen.getByRole('heading', { name: 'MATCH SETUP' })).toBeInTheDocument()
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/app/AppShell.test.tsx
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现 AppShell 最小三屏状态**

核心状态：

```ts
const [screen, setScreen] = useState<AppScreen>('home')
const [draftConfig, setDraftConfig] = useState<MatchConfig>(() => ({ ...defaultMatchConfig }))
const [activeMatchConfig, setActiveMatchConfig] = useState<Readonly<MatchConfig> | null>(null)
```

`startMatch(config)` 必须复制并冻结：

```ts
const frozen = Object.freeze({ ...config })
setActiveMatchConfig(frozen)
setScreen('game')
```

`Quick Start` 调用 `startMatch(defaultMatchConfig)`。

Task 3 的 `game` 分支先渲染一个短生命周期的迁移标记：

```tsx
<div data-testid="game-page-placeholder">GAME</div>
```

这是临时迁移支点，只存在于本任务提交；Task 5 必须删除，不得留到最终版本。

- [ ] **Step 4: App.tsx 瘦身**

最终 Task 3 后：

```tsx
import AppShell from './app/AppShell'

export default function App() {
  return <AppShell />
}
```

- [ ] **Step 5: 更新浏览器标题**

`index.html`：

```html
<title>ChessForge</title>
```

- [ ] **Step 6: 运行测试**

```bash
npm test -- src/app/AppShell.test.tsx
```

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add src/app src/pages/HomePage src/components/PixelButton.tsx src/components/PixelPanel.tsx src/App.tsx index.html
git commit -m "feat: add ChessForge home shell"
```

---

### Task 4: 实现 MatchSetupPage 和真实插件配置

**Files:**
- Create: `src/pages/MatchSetupPage/PluginSelector.tsx`
- Create: `src/pages/MatchSetupPage/MatchSetupPage.tsx`
- Create: `src/pages/MatchSetupPage/MatchSetupPage.css`
- Create: `src/pages/MatchSetupPage/MatchSetupPage.test.tsx`
- Modify: `src/app/AppShell.tsx`
- Modify: `src/app/AppShell.test.tsx`

**Interfaces:**

```ts
interface PluginOption {
  id: string
  name: string
}

interface PluginSelectorProps {
  label: string
  value: string
  options: PluginOption[]
  onChange(id: string): void
}

interface MatchSetupPageProps {
  config: MatchConfig
  registry: PluginRegistry
  onChange(config: MatchConfig): void
  onStart(config: MatchConfig): void
  onBack(): void
}
```

- [ ] **Step 1: 写配置页失败测试**

```ts
const registry = createDefaultPluginRegistry()
const onStart = vi.fn()
render(
  <MatchSetupPage
    config={defaultMatchConfig}
    registry={registry}
    onChange={() => undefined}
    onStart={onStart}
    onBack={() => undefined}
  />,
)

expect(screen.getByLabelText('Rule Plugin')).toHaveValue('chessjs-rule')
expect(screen.getByLabelText('White Player')).toHaveValue('human-player')
expect(screen.getByLabelText('Black Player')).toHaveValue('human-player')
expect(screen.getByLabelText('Board Plugin')).toHaveValue('default-board')
expect(screen.getByLabelText('Theme Plugin')).toHaveValue('pixel-forge-theme')
expect(screen.getByLabelText('Storage Plugin')).toHaveValue('memory-storage')
```

添加 Registry fake 第二主题，验证 select options 来自 Registry 而非写死：

```ts
registry.registerTheme({
  id: 'test-theme',
  name: 'Test Theme',
  tokens: pixelForgeTheme.tokens,
})
render(/* ... */)
expect(screen.getByRole('option', { name: 'Test Theme' })).toBeInTheDocument()
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/pages/MatchSetupPage/MatchSetupPage.test.tsx
```

- [ ] **Step 3: 实现六个选择器和 CURRENT LOADOUT**

选择器必须由：

```ts
registry.getRulePlugins()
registry.getPlayerPlugins()
registry.getBoardPlugins()
registry.getThemePlugins()
registry.getStoragePlugins()
```

生成。

`START MATCH` disabled 条件：

```ts
const errors = validateMatchConfig(config, registry)
const canStart = errors.length === 0
```

错误区域使用 `role="alert"`，逐条显示校验错误。

- [ ] **Step 4: AppShell 接入配置页**

`开始游戏`：

```ts
setDraftConfig({ ...defaultMatchConfig })
setScreen('setup')
```

`START MATCH`：

```ts
startMatch(draftConfig)
```

`返回首页`：`setScreen('home')`。

- [ ] **Step 5: 添加主流程测试**

```ts
render(<AppShell />)
fireEvent.click(screen.getByRole('button', { name: '开始游戏' }))
expect(screen.getByRole('heading', { name: '配置本局插件' })).toBeInTheDocument()
fireEvent.click(screen.getByRole('button', { name: 'START MATCH' }))
expect(screen.getByTestId('game-page-placeholder')).toBeInTheDocument()
```

- [ ] **Step 6: 运行测试**

```bash
npm test -- src/pages/MatchSetupPage/MatchSetupPage.test.tsx src/app/AppShell.test.tsx
```

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add src/pages/MatchSetupPage src/app/AppShell.tsx src/app/AppShell.test.tsx
git commit -m "feat: add plugin-driven match setup"
```

---

## Visual Gate A — HomePage + MatchSetupPage

在进入 GamePage 视觉实现前暂停。

必须：
1. 运行当前应用。
2. 获取 HomePage desktop、MatchSetupPage desktop、至少一个窄屏截图。
3. Kimi K3 同时查看运行截图与批准 reference。
4. 按 `docs/reviews/PIXEL-FORGE-VISUAL-GATES.md` 输出 Gate A Review。
5. 修复全部 P0/P1。
6. Gate A PASS 后才能进入 Task 5。

不要为了截图向生产依赖中添加 Playwright；使用当前可用浏览器/截图能力或由用户提供截图。

---

### Task 5: 提取 GamePage，并让 activeMatchConfig 真正创建当前棋局

**Files:**
- Create: `src/pages/GamePage/GamePage.tsx`
- Create: `src/pages/GamePage/GamePage.css`
- Create: `src/pages/GamePage/GamePage.test.tsx`
- Modify: `src/app/AppShell.tsx`
- Modify: `src/app/AppShell.test.tsx`
- Modify: `src/App.test.tsx`
- Reuse: `src/hooks/useGameCore.ts`

**Interfaces:**

```ts
interface GamePageProps {
  matchConfig: Readonly<MatchConfig>
  registry: PluginRegistry
  onExit(): void
}
```

`GamePage` 在 `useMemo` 中调用：

```ts
const resolved = useMemo(
  () => resolveMatchConfig(matchConfig, registry),
  [matchConfig, registry],
)

const core = useMemo(
  () => new GameCore({
    rules: resolved.rules,
    players: resolved.players,
    storage: resolved.storage,
  }),
  [resolved],
)
```

- [ ] **Step 1: 写 GamePage 失败测试**

```ts
render(
  <GamePage
    matchConfig={Object.freeze({ ...defaultMatchConfig })}
    registry={createDefaultPluginRegistry()}
    onExit={() => undefined}
  />,
)
expect(screen.getByTestId('square-e2')).toBeInTheDocument()
expect(screen.getByText('轮到白方')).toBeInTheDocument()
```

再验证插件面板显示 active config 名称：

```ts
fireEvent.click(screen.getByRole('button', { name: '本局插件' }))
expect(screen.getByText('Standard Chess')).toBeInTheDocument()
expect(screen.getAllByText('Human')).toHaveLength(2)
expect(screen.getByText('Pixel Board')).toBeInTheDocument()
expect(screen.getByText('Pixel Forge')).toBeInTheDocument()
expect(screen.getByText('Memory Session')).toBeInTheDocument()
```

为实现稳定显示名，默认 Rule definition name 统一为 `Standard Chess`；不要直接展示技术名 `Chess.js Rule Plugin`。可通过 Registry 注册一个 app-facing rule wrapper：

```ts
const standardChessRule: RulePlugin = {
  ...chessJsRulePlugin,
  name: 'Standard Chess',
}
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/pages/GamePage/GamePage.test.tsx
```

- [ ] **Step 3: 将旧 App.tsx 装配逻辑迁入 GamePage**

迁移：

- `resolveTheme` 防御性 fallback；fallback 改为 `pixelForgeTheme`。
- theme CSS variables 注入/cleanup。
- `useGameCore(core)`。
- `GameErrorBoundary`。
- `PromotionDialog`。
- `GameResultDialog`。
- `errorMessage` banner。

不得把 Home/Setup 状态放进 GamePage。

- [ ] **Step 4: AppShell 删除 placeholder，渲染真实 GamePage**

```tsx
if (screen === 'game' && activeMatchConfig) {
  return (
    <GamePage
      matchConfig={activeMatchConfig}
      registry={registry}
      onExit={() => {
        setActiveMatchConfig(null)
        setScreen('home')
      }}
    />
  )
}
```

- [ ] **Step 5: 改写原 App 主流程测试**

所有原来 `render(<App />)` 后直接走子的测试，先统一：

```ts
render(<App />)
fireEvent.click(screen.getByRole('button', { name: '快速开始' }))
```

然后继续原有开局、悔棋、重开、将死验收。

- [ ] **Step 6: 运行测试**

```bash
npm test -- src/pages/GamePage/GamePage.test.tsx src/app/AppShell.test.tsx src/App.test.tsx
```

Expected: PASS；旧棋局行为仍可用。

- [ ] **Step 7: 提交**

```bash
git add src/pages/GamePage src/app/AppShell.tsx src/app/AppShell.test.tsx src/App.test.tsx
git commit -m "refactor: move live match wiring into GamePage"
```

---

### Task 6: 实现真正的 32×32 Pixel Forge 棋子，不再依赖 Unicode

**Files:**
- Create: `src/plugins/board/DefaultBoard/PixelPiece.tsx`
- Create: `src/plugins/board/DefaultBoard/PixelPiece.test.tsx`
- Modify: `src/plugins/board/DefaultBoard/DefaultBoard.tsx`
- Modify: `src/plugins/board/DefaultBoard/DefaultBoard.test.tsx`

**Interfaces:**

```ts
interface PixelPieceProps {
  piece: Piece
  className?: string
  title?: string
}
```

`PixelPiece` 输出：

```tsx
<svg
  viewBox="0 0 32 32"
  shapeRendering="crispEdges"
  data-piece={`${piece.color}-${piece.type}`}
  aria-label={title}
>
  ...
</svg>
```

六种棋子使用整数 `rect`/`polygon`，白黑共用轮廓，仅 palette 不同。禁止 `<path d="...C...">`、圆形抗锯齿和文本 glyph。

- [ ] **Step 1: 写失败测试，禁止 Unicode**

```ts
render(<PixelPiece piece={{ color: 'white', type: 'king' }} title="white king" />)
const king = screen.getByLabelText('white king')
expect(king).toHaveAttribute('viewBox', '0 0 32 32')
expect(king).toHaveAttribute('shape-rendering', 'crispEdges')
expect(king).toHaveAttribute('data-piece', 'white-king')
expect(king.textContent).toBe('')
```

增加全部 12 组合 smoke test：

```ts
for (const color of ['white', 'black'] as const) {
  for (const type of ['king','queen','rook','bishop','knight','pawn'] as const) {
    const { container, unmount } = render(<PixelPiece piece={{ color, type }} />)
    expect(container.querySelector(`[data-piece="${color}-${type}"]`)).not.toBeNull()
    unmount()
  }
}
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/plugins/board/DefaultBoard/PixelPiece.test.tsx
```

- [ ] **Step 3: 实现固定 palette**

```ts
const PALETTES = {
  white: {
    outline: '#493521',
    shadow: '#9d7844',
    mid: '#d8bd7c',
    light: '#f2e7c9',
  },
  black: {
    outline: '#101827',
    shadow: '#26364c',
    mid: '#56677c',
    light: '#9eacb7',
  },
} as const
```

每个 piece renderer 必须由整数坐标块组成，并统一底座区域 `y=25..29`。具体 silhouette 先直接观察批准图底部 Pixel Forge piece showcase，再实现：King 顶部十字、Queen 多冠尖、Rook 城垛、Bishop 斜切冠、Knight 马首轮廓、Pawn 圆头方块化。使用 `rect` 和 `polygon` 组合，所有坐标值为整数。若实现后的 silhouette 与批准图明显不同，Gate B 必须返工。

- [ ] **Step 4: DefaultBoard 替换 glyph**

删除 `GLYPHS` / `pieceGlyph()`。

`DragState` 改成：

```ts
interface DragState {
  from: Square
  piece: Piece
  x: number
  y: number
}
```

格内：

```tsx
{piece && <PixelPiece piece={piece} className="board-piece" />}
```

拖拽浮层：

```tsx
<PixelPiece piece={drag.piece} className="dragging-piece__sprite" />
```

- [ ] **Step 5: 更新旧 board 测试断言**

把 `toHaveTextContent('♙')` 改成：

```ts
expect(
  screen.getByTestId('square-e2').querySelector('[data-piece="white-pawn"]'),
).not.toBeNull()
```

- [ ] **Step 6: 运行测试**

```bash
npm test -- src/plugins/board/DefaultBoard/PixelPiece.test.tsx src/plugins/board/DefaultBoard/DefaultBoard.test.tsx
```

Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add src/plugins/board/DefaultBoard
git commit -m "feat: replace unicode pieces with Pixel Forge sprites"
```

---

### Task 7: 把 DefaultBoard 重做为 Pixel Forge 棋盘，同时保持 BoardPluginProps 不变

**Files:**
- Modify: `src/plugins/board/DefaultBoard/DefaultBoard.tsx`
- Modify: `src/plugins/board/DefaultBoard/DefaultBoard.css`
- Modify: `src/plugins/board/DefaultBoard/DefaultBoard.test.tsx`
- Modify: `src/plugins/board/DefaultBoardPlugin.tsx`

**Interfaces:**
- `BoardPluginProps` 不修改。
- `defaultBoardPlugin.id` 保持 `'default-board'`，避免旧配置迁移；`name` 改为 `'Pixel Board'`。

- [ ] **Step 1: 写失败测试：外框坐标和 marker 类型**

```ts
expect(screen.getByTestId('file-label-a')).toHaveTextContent('a')
expect(screen.getByTestId('file-label-h')).toHaveTextContent('h')
expect(screen.getByTestId('rank-label-8')).toHaveTextContent('8')
expect(screen.getByTestId('rank-label-1')).toHaveTextContent('1')
```

空目标：

```ts
expect(screen.getByTestId('square-e4').querySelector('.legal-marker--move')).not.toBeNull()
```

有敌子目标：

```ts
expect(screen.getByTestId('square-e4').querySelector('.legal-marker--capture')).not.toBeNull()
```

确保格内不出现坐标文本：

```ts
expect(screen.getByTestId('square-e4')).not.toHaveTextContent('e4')
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/plugins/board/DefaultBoard/DefaultBoard.test.tsx
```

- [ ] **Step 3: 实现 board frame**

DOM 结构固定：

```tsx
<div className="pixel-board-frame">
  <div className="board-file-coordinates" aria-hidden="true">...</div>
  <div className="board-rank-coordinates" aria-hidden="true">...</div>
  <div className="board">...</div>
</div>
```

坐标测试 id 只用于测试/可视定位，不将 64 个代数坐标重复写进格子。

- [ ] **Step 4: 区分 move/capture markers**

```ts
const legalMove = legalMoves.find(
  (move) => move.from === selectedSquare && move.to === square,
)
const isCaptureTarget = Boolean(legalMove && position[square])
```

DOM：

```tsx
{legalMove && (
  <span
    className={isCaptureTarget ? 'legal-marker legal-marker--capture' : 'legal-marker legal-marker--move'}
    aria-hidden="true"
  />
)}
```

- [ ] **Step 5: CSS 实现硬边框像素语言**

要求：

```css
.pixel-board-frame { image-rendering: pixelated; }
.board-piece, .dragging-piece__sprite { image-rendering: pixelated; }
.square { border-radius: 0; }
```

选中格使用金色四角；previous move 暗金；capture marker 四角括号；check 暗红一次短闪。不得使用 `filter: blur()`。

- [ ] **Step 6: 运行 board 测试**

```bash
npm test -- src/plugins/board/DefaultBoard/DefaultBoard.test.tsx src/plugins/board/DefaultBoard/PixelPiece.test.tsx
```

- [ ] **Step 7: 提交**

```bash
git add src/plugins/board
git commit -m "feat: redesign default board as Pixel Forge board"
```

---

## Visual Gate B — Pixel Board + Pixel Piece Set

在进入完整 HUD 视觉整合前暂停。

必须提交并对比：
- 初始完整棋盘
- white/black 六类棋子
- selected
- legal move
- legal capture
- previous move
- check

Kimi K3 必须同时读取批准图与当前截图。任何 Unicode、piece silhouette 难辨、棋盘材质明显偏离、move/capture marker 混淆均为 P0/P1。

Gate B PASS 后才能进入 Task 8。

---

### Task 8: 重做 GamePage HUD、状态、棋谱与控制栏

**Files:**
- Modify: `src/pages/GamePage/GamePage.tsx`
- Modify: `src/pages/GamePage/GamePage.css`
- Modify: `src/components/GameStatus.tsx`
- Modify: `src/components/MoveHistory.tsx`
- Modify: `src/components/GameControls.tsx`
- Modify: `src/components/components.test.tsx`
- Modify or Remove: `src/components/GameLayout.tsx`

**Interfaces:**
- `GameStatus`, `MoveHistory`, `GameControls` 现有数据来源不变。
- `GameControls` props 保持 `onUndo` / `onReset`，只允许增加可选 `disabled?: boolean`；不把 `GameCore` 传入组件。

- [ ] **Step 1: 写 HUD 失败测试**

在 `components.test.tsx` 更新预期文案：

```ts
expect(screen.getByText('CURRENT TURN')).toBeInTheDocument()
expect(screen.getByText('WHITE')).toBeInTheDocument()
expect(screen.getByText('MOVE LOG')).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'UNDO' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'RESTART' })).toBeInTheDocument()
```

棋谱仍必须渲染 SAN，不重新推导：

```ts
expect(screen.getByText('Nf3')).toBeInTheDocument()
expect(screen.getByText('Nc6')).toBeInTheDocument()
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/components/components.test.tsx
```

- [ ] **Step 3: 实现 GamePage 两栏 HUD**

桌面：棋盘主列 + 280–320px HUD；移动端：棋盘在上，HUD 单列堆叠。

顶部：

```text
CHESSFORGE
MATCH · PIXEL FORGE LOADOUT
[本局插件] [退出对局]
```

棋盘上下分别显示 Black/White player 名称；当前回合玩家条增加 active class。

- [ ] **Step 4: 组件只改 presentation**

`MoveHistory` 继续按 `history` 成对排列：

```text
01  e4   e5
02  Nf3  Nc6
03  Bb5  —
```

无棋谱时显示 `NO MOVES YET`。

- [ ] **Step 5: 运行组件与 GamePage 测试**

```bash
npm test -- src/components/components.test.tsx src/pages/GamePage/GamePage.test.tsx
```

- [ ] **Step 6: 提交**

```bash
git add src/pages/GamePage src/components
git commit -m "feat: add Pixel Forge game HUD"
```

---

### Task 9: 重做 Promotion / Result / Exit 对话框并完成退出与再来一局流程

**Files:**
- Modify: `src/components/PromotionDialog.tsx`
- Modify: `src/components/PromotionDialog.test.tsx`
- Modify: `src/components/GameResultDialog.tsx`
- Modify: `src/components/GameResultDialog.test.tsx`
- Create: `src/components/ExitMatchDialog.tsx`
- Create: `src/components/ExitMatchDialog.test.tsx`
- Modify: `src/pages/GamePage/GamePage.tsx`
- Modify: `src/pages/GamePage/GamePage.test.tsx`

**Interfaces:**

`GameResultDialog` 改为：

```ts
interface GameResultDialogProps {
  status: GameStatus
  onPlayAgain(): void
  onViewHistory(): void
  onMainMenu(): void
}
```

`ExitMatchDialog`：

```ts
interface ExitMatchDialogProps {
  open: boolean
  onContinue(): void
  onExit(): void
}
```

- [ ] **Step 1: 写失败测试：兵升变必须渲染 PixelPiece**

```ts
render(<PromotionDialog color="white" onSelect={onSelect} onCancel={onCancel} />)
expect(screen.getByRole('dialog', { name: 'PROMOTE PAWN' })).toBeInTheDocument()
expect(screen.getByLabelText('Promote to queen').querySelector('[data-piece="white-queen"]')).not.toBeNull()
```

- [ ] **Step 2: 写结果对话框失败测试**

```ts
expect(screen.getByRole('button', { name: 'PLAY AGAIN' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'VIEW MOVES' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'MAIN MENU' })).toBeInTheDocument()
```

- [ ] **Step 3: 写退出行为失败测试**

GamePage 初始未走棋时：

```ts
fireEvent.click(screen.getByRole('button', { name: '退出对局' }))
expect(onExit).toHaveBeenCalledTimes(1)
```

走一步后：

```ts
fireEvent.click(screen.getByTestId('square-e2'))
fireEvent.click(screen.getByTestId('square-e4'))
await screen.findByText('BLACK')
fireEvent.click(screen.getByRole('button', { name: '退出对局' }))
expect(screen.getByRole('dialog', { name: '退出当前对局？' })).toBeInTheDocument()
expect(onExit).not.toHaveBeenCalled()
```

- [ ] **Step 4: 运行测试确认失败**

```bash
npm test -- src/components/PromotionDialog.test.tsx src/components/GameResultDialog.test.tsx src/components/ExitMatchDialog.test.tsx src/pages/GamePage/GamePage.test.tsx
```

- [ ] **Step 5: 实现三个 Pixel Forge dialogs**

所有 dialog 使用 `PixelPanel`，禁止默认浏览器 confirm。

`PLAY AGAIN` 调用现有 `reset()`，不改变 `matchConfig`。

`MAIN MENU` 调用 `onExit()`。

`VIEW MOVES` 保留滚动到 move history 的行为，但 `behavior` 在 reduced-motion 下使用 `'auto'`。

- [ ] **Step 6: 运行测试**

```bash
npm test -- src/components/PromotionDialog.test.tsx src/components/GameResultDialog.test.tsx src/components/ExitMatchDialog.test.tsx src/pages/GamePage/GamePage.test.tsx
```

- [ ] **Step 7: 提交**

```bash
git add src/components src/pages/GamePage
git commit -m "feat: add Pixel Forge match dialogs and exit flow"
```

---

### Task 10: 完成 Home/Setup/Game Pixel Forge 视觉系统、响应式与 reduced-motion

**Files:**
- Modify: `src/index.css`
- Modify: `src/pages/HomePage/HomePage.css`
- Modify: `src/pages/MatchSetupPage/MatchSetupPage.css`
- Modify: `src/pages/GamePage/GamePage.css`
- Modify: `src/plugins/board/DefaultBoard/DefaultBoard.css`
- Modify: `src/components/GameErrorBoundary.tsx`
- Modify: `src/components/GameErrorBoundary.test.tsx`

**Interfaces:**
- CSS variables继续来自 ThemePlugin。
- CSS 中新增 app-level tokens 可直接定义在 `:root`，但颜色必须以 Pixel Forge theme variables 为主，不把完整 art asset model 塞回 ThemePlugin。

- [ ] **Step 1: 写 ErrorBoundary 失败测试**

```ts
expect(screen.getByRole('alert')).toHaveClass('pixel-error-panel')
expect(screen.getByText('BOARD MODULE ERROR')).toBeInTheDocument()
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test -- src/components/GameErrorBoundary.test.tsx
```

- [ ] **Step 3: 重写全局 Pixel Forge 基础**

`src/index.css` 至少包含：

```css
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: var(--page-background); color: var(--text-primary); }
button, select { font: inherit; }
.pixel-button { border-radius: 0; transition: transform 80ms steps(2, end); }
.pixel-button:active { transform: translate(2px, 2px); }
```

建立硬边框、旧铜描边、阶梯阴影，不使用大圆角 glassmorphism。

- [ ] **Step 4: 响应式要求**

必须至少覆盖：

```css
@media (max-width: 760px) { /* game HUD 单列 */ }
@media (max-width: 520px) { /* setup selectors 单列、按钮全宽 */ }
```

棋盘：

```css
width: min(100%, 680px);
aspect-ratio: 1;
```

不得产生横向页面滚动。

- [ ] **Step 5: reduced-motion**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Error Boundary Pixel 化**

保留错误隔离行为，仅把 fallback 改成 Pixel Forge panel，并保留 `role="alert"`。

- [ ] **Step 7: 运行组件测试与 build**

```bash
npm test -- src/components/GameErrorBoundary.test.tsx
npm run build
```

Expected: PASS / build success。

- [ ] **Step 8: 提交**

```bash
git add src/index.css src/pages src/plugins/board/DefaultBoard/DefaultBoard.css src/components/GameErrorBoundary.tsx src/components/GameErrorBoundary.test.tsx
git commit -m "style: finish responsive Pixel Forge visual system"
```

---

## Visual Gate C — Full GamePage

在最终回归前暂停。

必须提交并对比：
- GamePage desktop
- GamePage narrow/mobile
- Active Plugins panel
- PromotionDialog
- GameResultDialog
- ExitMatchDialog

Kimi K3 输出 Gate C Review；修完全部 P0/P1 后才能进入 Task 11。

Gate C 不是“让模型重新设计”，而是验证实现是否忠实于批准图与 spec。

---

### Task 11: 全流程回归测试并清理旧 App/GameLayout 假设

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/app/AppShell.test.tsx`
- Modify: `src/pages/GamePage/GamePage.test.tsx`
- Modify/Delete: `src/components/GameLayout.tsx`
- Search/Modify: all tests containing Unicode piece glyph assertions or `Plugin Chess` title。

**Interfaces:**
- 不新增生产接口；本任务只收口行为。

- [ ] **Step 1: App 验收测试覆盖 5 条主链**

必须有独立测试：

```text
Home → Setup
Home → Quick Start → Game
Setup → Start Match → Game
Game → Exit → Home
Game End → Play Again（MatchConfig 不变）
```

其中 Quick Start 测试：

```ts
render(<App />)
fireEvent.click(screen.getByRole('button', { name: '快速开始' }))
expect(screen.getByTestId('square-e2')).toBeInTheDocument()
```

退出：

```ts
fireEvent.click(screen.getByRole('button', { name: '退出对局' }))
expect(screen.getByRole('heading', { name: 'CHESSFORGE' })).toBeInTheDocument()
expect(screen.queryByTestId('square-e2')).not.toBeInTheDocument()
```

- [ ] **Step 2: 保留原棋局回归**

已有 Opening / Fool's Mate / Undo / Restart 测试继续存在，只把进入游戏步骤和像素棋子断言适配新 UI。

禁止删掉测试来“通过重构”。

- [ ] **Step 3: 全仓扫描旧文字/Unicode**

Run:

```bash
grep -R "Plugin Chess" -n src index.html README.md || true
grep -R "♔\|♕\|♖\|♗\|♘\|♙\|♚\|♛\|♜\|♝\|♞\|♟" -n src || true
```

Expected: 第一条仅允许 README 的历史说明（若存在且明确标为旧版）；第二条生产代码 0 结果。

- [ ] **Step 4: 清理 GameLayout**

如果 `GamePage` 已完全取代 `GameLayout`，删除文件并清理 import；如果保留，则它只能是 presentation shell，不得持有 GameCore/config/plugin registry。

- [ ] **Step 5: 运行全测试**

```bash
npm test
```

Expected: 全部 PASS。

- [ ] **Step 6: 运行生产构建**

```bash
npm run build
```

Expected: TypeScript build + Vite build 成功。

- [ ] **Step 7: 提交**

```bash
git add src index.html
git commit -m "test: cover ChessForge V2 product flows"
```

---

### Task 12: 更新 README 和最终验收

**Files:**
- Modify: `README.md`
- Add if missing: `docs/superpowers/specs/2026-09-14-default-ui-v2-pixel-art-design.md`
- Add: `docs/superpowers/plans/2026-09-14-default-ui-v2-pixel-art.md`

**Interfaces:** None.

- [ ] **Step 1: README 更新产品流程**

必须写明：

```text
Home
 ├─ Quick Start ─────────→ Game
 └─ Start Game → Setup → Game
```

并说明默认插件组合：

```text
Standard Chess
Human vs Human
Pixel Board
Pixel Forge
Memory Session
```

明确 `Pixel Forge` 是默认视觉，且插件系统现在是用户可见配置，不再只是内部架构。

- [ ] **Step 2: README 架构边界保持准确**

必须继续说明：

- `GameCore` 不依赖 React。
- `chess.js` 只应由 RulePlugin 实现使用。
- Board/Theme 是 UI 插件。
- 对局中核心插件不热切换。

- [ ] **Step 3: 运行最终验证**

```bash
npm test
npm run build
```

Expected: 两条均成功。

- [ ] **Step 4: 检查 git diff**

```bash
git status --short
git diff --check
```

Expected: `git diff --check` 无 whitespace errors；无未说明的临时文件。

- [ ] **Step 5: 提交文档**

```bash
git add README.md docs/superpowers/specs/2026-09-14-default-ui-v2-pixel-art-design.md docs/superpowers/plans/2026-09-14-default-ui-v2-pixel-art.md
git commit -m "docs: document ChessForge Pixel Forge UI V2"
```

---

## Self-Review Results

### 1. Spec coverage

- 三屏流程 Home / Setup / Game：Tasks 3–5、11。
- Quick Start：Tasks 3、5、11。
- 六个插件配置位和 Registry 枚举：Tasks 1、2、4。
- 冻结 `activeMatchConfig`：Task 3；只读插件面板：Task 5。
- GameCore/Rule 核心不污染：全局约束 + Task 5 明确只装配，不改规则层。
- Pixel Forge 色板/theme tokens：Task 2。
- 真像素棋子、32×32、无 Unicode：Task 6。
- 棋盘外框坐标、move/capture/selected/previous/check marker：Task 7。
- HUD / Move History / Controls：Task 8。
- Promotion / Result / Exit / Play Again：Task 9。
- 响应式、短促动画、reduced-motion、ErrorBoundary：Task 10。
- 原有点击、拖拽、升变、将死、悔棋、重开等能力回归：Tasks 6–11，规则行为由原核心测试继续兜底。
- 不做 Stockfish/online/theme V2 等：Global Constraints，任何任务均未引入。
- README/品牌清理：Tasks 11–12。

未发现 spec 无任务覆盖项。

### 2. Placeholder scan

计划没有未定义步骤、模糊的后续实现要求或需要执行者自行补全的关键工程步骤。Task 3 的 Game 迁移标记有明确生命周期，并要求 Task 5 删除；它是可测试的中间状态，不进入最终版本。

### 3. Type consistency

- `MatchConfig` 六个字段在 Tasks 2–5、9、11 中名称一致。
- Registry 方法统一使用 `getRulePlugins/getPlayerPlugins/getBoardPlugins/getThemePlugins/getStoragePlugins`。
- `PlayerPluginDefinition.create(color)` 在 Registry、resolve、Setup 中一致。
- `StoragePluginDefinition.create()` 在 Registry 与 resolve 中一致。
- `ResolvedMatchConfig` 延续 `GameConfig.rules/players/storage` 命名，并增加 `board/theme`。
- `BoardPluginProps` 不变；Pixel Board 改造不需要上层接口变化。
- `GameResultDialog` 最终接口统一为 `onPlayAgain/onViewHistory/onMainMenu`。

未发现跨任务签名冲突。

## Execution Handoff

指定执行方式：

**Claude Code + Kimi K3 + Superpowers plan execution**

推荐在独立 feature branch / worktree 中执行，按 Task 0 → 12 顺序进行。

- 若 Claude Code 环境已安装 Superpowers：使用 `subagent-driven-development`（可用时优先）或 `executing-plans`。
- 若没有可用子代理：仍按同一计划逐 Task 执行，不得跳过 TDD / Gate。
- 视觉任务必须保持批准 reference 在 Kimi K3 的多模态上下文中。
- Gate A / B / C 需要停下来做截图对比，不允许连续冲完所有 Task 后再看 UI。
- 每次准备声称“完成 / 通过”前，都必须重新运行对应验证命令并读取结果。

开始执行时，优先使用：

`docs/agents/START-PIXEL-FORGE-V2.md`
