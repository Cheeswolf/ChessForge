# 插件化国际象棋 MVP 设计文档

**日期：** 2026-09-11  
**状态：** 设计阶段基本完成，等待最终审阅  
**建议保存路径：** `docs/superpowers/specs/2026-09-11-plugin-chess-design.md`

---

# 1. 项目目标

我们要做的不是一个普通的“能下棋的网页”，而是一个：

> **基于插件化架构构建的国际象棋 Web 应用。**

MVP 第一版只提供：

- 本地双人对战
- 完整国际象棋规则
- 一个默认棋盘
- 一个默认主题
- 基础棋谱与操作功能

但整个系统从一开始就为未来扩展做好接口。

后续可以在不重写整个项目的情况下增加：

- Stockfish AI
- 在线玩家
- 不同棋盘
- 不同主题
- 不同存储方式
- Chess960 等国际象棋变体

因此，这个项目真正的价值不仅是“能下棋”，还包括它的**架构设计和扩展能力**。

---

# 2. 技术栈

前端：

- React
- Vite
- TypeScript

国际象棋规则：

- `chess.js`

测试：

- Vitest
- React Testing Library
- 必要的浏览器交互测试

MVP 阶段：

> **不需要后端服务器。**

整个游戏可以直接在浏览器运行。

---

# 3. MVP 功能范围

## 第一版需要实现

### 基础对局

- 本地双人对战
- 白方与黑方轮流操作
- 完整标准国际象棋规则

规则由 `chess.js` 提供，包括：

- 普通走子
- 吃子
- 将军
- 将死
- 和棋
- 王车易位
- 吃过路兵
- 兵升变

---

### 棋盘交互

同时支持两种操作方式：

**点击走子**

```text
点击棋子
↓
显示合法落点
↓
点击目标位置
↓
完成走子
```

以及：

**拖拽走子**

```text
拖动棋子
↓
拖到目标格
↓
合法：完成走子
非法：棋子回到原位置
```

---

### 棋盘提示

支持：

- 当前选中棋子高亮
- 合法落点提示
- 上一步棋起点和终点高亮
- 被将军的王高亮

---

### 对局信息

显示：

- 当前轮到白方还是黑方
- 是否正在被将军
- 是否将死
- 是否和棋
- 对局是否结束

例如：

```text
轮到白方

轮到黑方

黑方被将军

白方获胜：将死

和棋
```

---

### 基础功能

支持：

- 棋谱
- 悔棋
- 重新开始
- 兵升变选择
- 对局结束弹窗

---

### UI

默认采用：

> **Chess.com 风格作为视觉参考**

但不是像素级复制 Chess.com。

我们只借鉴：

- 棋盘为视觉中心
- 右侧信息面板
- 游戏状态
- 棋谱
- 控制按钮

同时保留 ThemePlugin，以后可以替换其他主题。

---

# 4. MVP 明确不做什么

第一版暂时不做：

- AI 对战
- Stockfish
- 在线联机
- 用户账号
- Elo
- 排行榜
- 好友系统
- 云存档
- 游戏计时器
- 3D 棋盘
- AI 棋局分析
- 开局库
- 残局训练
- 国际象棋题目
- 社交系统

这些能力都留到后续版本。

这样可以避免 MVP 无限膨胀。

---

# 5. 核心架构原则

整个系统最重要的一条规则是：

> **插件之间尽量不直接相互依赖，而是通过 Game Core 协作。**

整体关系：

```text
                    Game Core
                    游戏核心
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    RulePlugin      PlayerPlugin     ThemePlugin
    规则插件          玩家插件          主题插件

        │
        ├───────────────┐
        ▼               ▼
    BoardPlugin     StoragePlugin
    棋盘插件          存储插件
```

可以把 Game Core 理解成：

> **比赛组织者。**

它负责协调所有组件，但自己不承担具体功能。

---

# 6. 五类插件

MVP 定义五种核心插件。

它们分别可以理解为：

```text
RulePlugin    = 裁判
PlayerPlugin  = 棋手
BoardPlugin   = 棋盘
ThemePlugin   = 皮肤
StoragePlugin = 存档
```

---

# 7. RulePlugin —— 规则插件

RulePlugin 相当于：

> **裁判。**

它负责回答：

> “这一步到底能不能走？”

主要职责：

- 创建初始棋局
- 判断合法走法
- 执行合法走法
- 判断当前轮到谁
- 判断将军
- 判断将死
- 判断和棋
- 判断游戏是否结束
- 提供当前棋盘状态

MVP 默认实现：

```text
ChessJsRulePlugin
        ↓
     chess.js
```

这里有一个非常重要的设计原则：

> **项目其他部分不能直接调用 chess.js。**

只有：

```text
ChessJsRulePlugin
```

知道 `chess.js` 的存在。

因此以后如果替换规则，例如：

```text
ChessJsRulePlugin

Chess960RulePlugin

CustomRulePlugin
```

其他代码不用跟着重写。

---

# 8. PlayerPlugin —— 玩家插件

PlayerPlugin 可以理解为：

> **棋手。**

它负责解决：

> “这一方下一步棋从哪里来？”

MVP 只有：

```text
HumanPlayerPlugin
```

也就是：

> 等待真人操作棋盘。

以后可以增加：

```text
HumanPlayerPlugin

StockfishPlayerPlugin

OnlinePlayerPlugin

RandomBotPlugin
```

分别代表：

- 真人
- Stockfish AI
- 网络玩家
- 随机 Bot

Game Core 不应该关心这一步到底来自真人还是 AI。

它只需要收到：

```text
我要从 e2 走到 e4
```

这样的统一走子请求。

---

# 9. BoardPlugin —— 棋盘插件

BoardPlugin 可以理解为：

> **棋盘 + 棋盘操作方式。**

它负责：

- 绘制 8×8 棋盘
- 显示棋子
- 接收点击
- 接收拖拽
- 显示合法落点
- 显示选中格子
- 显示上一步棋
- 显示将军提示

但它有一个重要限制：

> **BoardPlugin 不负责判断国际象棋规则。**

例如用户：

```text
把马从 g1 拖到 f3
```

BoardPlugin 只负责告诉系统：

```text
用户想执行：

g1 → f3
```

至于是否合法，由 RulePlugin 判断。

MVP：

```text
DefaultBoardPlugin
```

未来可以扩展：

```text
2DBoardPlugin

3DBoardPlugin

MobileBoardPlugin

AccessibleBoardPlugin
```

---

# 10. ThemePlugin —— 主题插件

ThemePlugin 就是：

> **整个游戏的皮肤。**

它负责：

- 棋盘浅色格
- 棋盘深色格
- 页面背景
- 面板颜色
- 字体
- 按钮
- 圆角
- 阴影
- 合法落点颜色
- 选中格颜色
- 上一步棋颜色
- 将军提示颜色
- 棋子资源

MVP 默认：

```text
ChessComThemePlugin
```

未来可以增加：

```text
ChessComTheme

LichessTheme

MinimalTheme

CyberpunkTheme

AnimeTheme

CustomTheme
```

也就是说：

> 游戏逻辑完全一样，但外观可以整体替换。

---

# 11. StoragePlugin —— 存储插件

StoragePlugin 可以理解为：

> **存档系统。**

负责存储：

- 棋盘局面
- 棋谱
- 当前回合
- 游戏结果
- 游戏设置
- 相关元数据

MVP 使用：

```text
MemoryStoragePlugin
```

意思是：

> 数据暂时只存在浏览器内存。

刷新页面以后，本局数据会消失。

未来可以替换为：

```text
LocalStoragePlugin

IndexedDBPlugin

CloudStoragePlugin
```

从而实现：

- 刷新页面不丢失
- 多盘棋记录
- 云端同步

---

# 12. Game Core

Game Core 是整个项目的中心。

但它必须保持尽量简单。

它只负责：

1. 管理当前对局状态
2. 知道轮到哪一方
3. 接收玩家走子请求
4. 把请求交给 RulePlugin
5. 接受合法走子结果
6. 更新当前游戏状态
7. 触发系统事件
8. 协调不同插件

---

## Game Core 不应该负责什么

Game Core 绝对不能自己写：

```text
马走日

王车易位规则

将死判断

Stockfish

拖拽逻辑

棋盘颜色

数据库代码

React UI
```

这些都应该由相应模块处理。

Game Core 应该只负责：

> **协调。**

---

# 13. 一步棋是怎么完成的

正常流程：

```text
用户操作
↓
BoardPlugin
↓
HumanPlayerPlugin
↓
Game Core
↓
RulePlugin
↓
判断是否合法
↓
如果合法
↓
执行走子
↓
Game Core 更新局面
↓
触发 moveMade
↓
棋盘更新
↓
棋谱更新
↓
StoragePlugin 保存
↓
轮到另一方
```

---

## 如果走子非法

例如：

```text
用户试图让象穿过棋子
```

流程：

```text
走子请求
↓
RulePlugin
↓
判断非法
↓
Game Core 拒绝
↓
棋盘恢复
```

最重要的是：

> **非法操作永远不能破坏真实游戏状态。**

---

# 14. 事件系统

为了避免模块互相直接调用，我们增加一个轻量事件系统。

Game Core 可以发布：

```text
gameStarted

moveRequested

moveMade

moveRejected

turnChanged

check

gameEnded

gameReset

moveUndone

pluginChanged

themeChanged

error
```

例如：

```text
moveMade
```

发生以后，未来很多东西都可以监听它：

```text
棋盘动画

StoragePlugin

音效

统计系统

AI 分析

日志系统
```

而 Game Core 不需要知道这些系统存在。

---

# 15. 插件接口

所有插件都遵守统一 TypeScript 接口。

例如最基础的插件：

```ts
interface Plugin {
  id: string
  name: string
}
```

---

## RulePlugin

概念上类似：

```ts
interface RulePlugin extends Plugin {
  createGame(): GameState

  getLegalMoves(
    state: GameState,
    square?: Square
  ): Move[]

  applyMove(
    state: GameState,
    move: Move
  ): MoveResult

  getStatus(
    state: GameState
  ): GameStatus
}
```

---

## PlayerPlugin

```ts
interface PlayerPlugin extends Plugin {
  color: 'white' | 'black'

  getMove(
    context: PlayerContext
  ): Promise<Move>
}
```

---

## StoragePlugin

```ts
interface StoragePlugin extends Plugin {
  save(
    game: SavedGame
  ): Promise<void>

  load(
    id: string
  ): Promise<SavedGame | null>
}
```

这些接口在真正实现过程中可以微调。

但：

> **插件边界不能被破坏。**

---

# 16. Plugin Registry

插件不能在各种 React 文件里随便创建。

应该由一个统一配置管理。

例如：

```ts
const gameConfig = {
  rules: chessJsRulePlugin,

  board: defaultBoardPlugin,

  theme: chessComThemePlugin,

  storage: memoryStoragePlugin,

  players: {
    white: humanWhite,
    black: humanBlack,
  },
}
```

Game Core 读取这个配置启动游戏。

---

## 未来加入 AI

以后只需要修改：

```ts
players: {
  white: humanPlayer,
  black: stockfishPlayer,
}
```

而 Game Core 不需要重新设计。

这就是插件化的意义。

---

# 17. 桌面端 UI

页面布局采用类似 Chess.com 的结构：

```text
┌───────────────────────────────────────┐
│ 顶部栏                                │
│ 游戏名称                 主题 / 设置  │
├───────────────────────────────────────┤
│                                       │
│ ┌──────────────────┐ ┌──────────────┐ │
│ │                  │ │ 对局状态     │ │
│ │                  │ ├──────────────┤ │
│ │      棋盘        │ │ 棋谱         │ │
│ │                  │ │              │ │
│ │                  │ ├──────────────┤ │
│ └──────────────────┘ │ 悔棋 / 重开  │ │
│                      └──────────────┘ │
└───────────────────────────────────────┘
```

棋盘始终是视觉中心。

右边显示：

- 当前状态
- 棋谱
- 操作按钮

以后增加：

- AI
- 计时器
- 分析

也有地方放。

---

# 18. 手机端 UI

手机端改成纵向结构：

```text
┌───────────────────┐
│ 顶部栏            │
├───────────────────┤
│                   │
│      棋盘         │
│                   │
├───────────────────┤
│ 当前状态          │
├───────────────────┤
│ 悔棋   重新开始   │
├───────────────────┤
│ 棋谱              │
└───────────────────┘
```

不需要重新制作一个手机游戏。

同一套组件响应式适配即可。

---

# 19. 点击走子

操作流程：

```text
点击棋子
↓
棋子被选中
↓
显示合法落点
↓
点击目标格
↓
发出走子请求
```

如果点击另一枚己方棋子：

> 切换选择。

如果点击非法位置：

> 不走棋。

---

# 20. 拖拽走子

流程：

```text
拖起棋子
↓
移动到目标位置
↓
松开
↓
提交走子请求
```

合法：

```text
棋子移动成功
```

非法：

```text
棋子自动回到原来的格子
```

---

# 21. 走子成功以后

系统需要同时完成：

```text
更新棋盘

高亮起点

高亮终点

更新棋谱

更新当前玩家

更新将军状态

保存当前游戏

触发 moveMade
```

---

# 22. 兵升变

兵到达最后一排时不能简单自动变后。

应该出现选择：

```text
       请选择升变棋子

    ♕    ♖    ♗    ♘

    后    车    象    马
```

用户选择以后，才正式完成这一步。

---

# 23. 对局状态提示

界面始终明确告诉玩家当前发生了什么。

例如：

```text
轮到白方

轮到黑方

白方被将军

黑方被将军

白方获胜：将死

黑方获胜：将死

和棋
```

设计原则：

> **不要要求玩家仅靠观察棋盘来判断重要状态。**

---

# 24. 对局结束

游戏结束以后不要跳转到新页面。

保留最终棋盘。

在棋盘上显示轻量结果层：

```text
        白方获胜

          将死

 [ 再来一局 ] [ 查看棋谱 ]
```

---

# 25. 悔棋

MVP 支持悔棋。

因为当前只有本地双人：

> 一次悔棋撤销最近的一步。

系统同步：

- 棋盘局面
- 棋谱
- 当前回合
- 将军状态
- 游戏结果
- StoragePlugin

以后 AI 或在线模式可以重新定义悔棋规则。

---

# 26. 重新开始

点击重新开始以后：

```text
恢复标准初始局面

清空棋谱

清除选中棋子

清除升变状态

清除游戏结果

恢复白方先走
```

同时触发：

```text
gameReset
```

---

# 27. 错误处理

插件化以后必须考虑：

> 某个插件坏了怎么办？

不同插件采用不同策略。

---

## ThemePlugin 出错

```text
主题加载失败
↓
自动回退 ChessComTheme
```

不影响游戏。

---

## StoragePlugin 出错

```text
保存失败
↓
给用户一个非阻塞提示
↓
继续下棋
```

不能因为保存失败就终止游戏。

---

## PlayerPlugin 出错

```text
玩家插件异常
↓
暂停当前回合
↓
提示错误
↓
允许恢复
```

---

## BoardPlugin 出错

使用 React Error Boundary：

```text
棋盘组件崩溃
↓
显示备用错误界面
```

避免整个网页白屏。

---

## RulePlugin 出错

这是最严重的。

```text
规则引擎异常
↓
停止当前对局
↓
不再继续修改状态
↓
提示规则引擎错误
```

因为如果规则已经不可信：

> 继续下棋已经没有意义。

---

# 28. 测试策略

这个项目不能用：

> “页面能打开”

作为完成标准。

我们至少需要三层测试。

---

# 29. 插件 Contract Test

Contract Test 可以理解为：

> **插件资格考试。**

任何 RulePlugin 都必须证明：

> “我确实符合 RulePlugin 的要求。”

例如 `ChessJsRulePlugin` 要测试：

- e2 → e4 合法
- 非法移动被拒绝
- 将军
- 将死
- 王车易位
- 吃过路兵
- 兵升变
- 和棋

以后换另一个 RulePlugin：

> 也跑同一套资格考试。

---

# 30. Game Core 测试

Game Core 不依赖 React。

例如测试：

```text
HumanPlayer
提交：

e2 → e4

↓

Fake RulePlugin
返回合法

↓

Game Core 更新状态

↓

触发：
moveMade

↓

触发：
turnChanged

↓

StoragePlugin 收到新状态
```

只测试：

> **系统协作逻辑是不是正确。**

---

# 31. UI 测试

测试真实用户操作。

例如：

```text
点击 e2

↓

e3、e4 显示合法落点

↓

点击 e4

↓

白兵移动到 e4

↓

棋谱显示 e4

↓

状态显示：
轮到黑方
```

还要测试：

- 点击走子
- 拖拽走子
- 非法拖拽
- 悔棋
- 重新开始
- 兵升变
- 将军
- 将死
- 结束弹窗

---

# 32. 推荐项目结构

建议：

```text
src/
│
├── core/
│   ├── GameCore.ts
│   ├── EventBus.ts
│   ├── PluginRegistry.ts
│   └── types.ts
│
├── plugins/
│
│   ├── rules/
│   │   ├── RulePlugin.ts
│   │   └── ChessJsRulePlugin.ts
│   │
│   ├── players/
│   │   ├── PlayerPlugin.ts
│   │   └── HumanPlayerPlugin.ts
│   │
│   ├── board/
│   │   ├── BoardPlugin.ts
│   │   └── DefaultBoardPlugin/
│   │
│   ├── themes/
│   │   ├── ThemePlugin.ts
│   │   └── ChessComTheme.ts
│   │
│   └── storage/
│       ├── StoragePlugin.ts
│       └── MemoryStoragePlugin.ts
│
├── components/
│   ├── GameLayout/
│   ├── MoveHistory/
│   ├── GameStatus/
│   ├── PromotionDialog/
│   └── GameControls/
│
├── hooks/
│   └── useGameCore.ts
│
├── App.tsx
└── main.tsx
```

---

# 33. 依赖关系限制

整个项目只允许类似：

```text
React UI
   ↓
Game Core

Game Core
   ↓
Plugin Interface

具体插件
   ↓
自己的第三方库
```

例如：

```text
ChessJsRulePlugin
↓
chess.js
```

允许。

但：

```text
GameCore
↓
chess.js
```

不允许。

同样：

```text
ChessBoard
↓
chess.js
```

也不允许。

这是整个项目非常关键的工程约束。

---

# 34. 未来增加 Stockfish

未来只需要新增：

```text
StockfishPlayerPlugin
```

然后：

```text
白方：

HumanPlayerPlugin


黑方：

StockfishPlayerPlugin
```

Game Core 不需要重新设计。

---

# 35. 未来增加本地存档

现在：

```text
MemoryStoragePlugin
```

以后替换：

```text
LocalStoragePlugin
```

即可。

规则系统和棋盘不需要修改。

---

# 36. 未来增加主题

新增：

```text
AnimeThemePlugin
```

或者：

```text
MinimalThemePlugin
```

然后注册到主题系统。

棋盘逻辑不需要修改。

---

# 37. 未来增加在线对战

可以新增：

```text
OnlinePlayerPlugin
```

它内部通过：

```text
WebSocket
```

等待另一位玩家下棋。

但对于 Game Core 来说，它和：

```text
HumanPlayerPlugin
```

本质上一样：

> 都只是提供下一步棋。

---

# 38. 为什么不是所有东西都做成插件

我们不走：

> “万物皆插件”

路线。

否则可能出现：

```text
ButtonPlugin

DialogPlugin

MoveAnimationPlugin

HeaderPlugin
```

这会让项目变得非常难维护。

只有真正具有：

> **替换价值**

的能力才做插件。

目前确定五类：

```text
Rule

Player

Board

Theme

Storage
```

其他普通页面组件还是普通 React Component。

---

# 39. MVP 成功标准

第一版完成时，需要满足以下条件：

1. 两个人可以完整下一盘国际象棋。
2. 点击走子正常。
3. 拖拽走子正常。
4. 所有标准国际象棋规则正确。
5. 王车易位正确。
6. 吃过路兵正确。
7. 兵升变正确。
8. 将军正确。
9. 将死正确。
10. 和棋正确。
11. 棋谱正常。
12. 悔棋正常。
13. 重新开始正常。
14. 桌面端界面可用。
15. 手机端界面可用。
16. 默认 Chess.com 风格主题正常。
17. ThemePlugin 可以被替换。
18. `chess.js` 只存在于 RulePlugin 内。
19. PlayerPlugin 可以被替换。
20. BoardPlugin 可以被替换。
21. StoragePlugin 可以被替换。
22. Game Core 不依赖 React。
23. Game Core 可以单独测试。
24. 插件具有 Contract Test。
25. 核心用户流程具有自动化测试。
26. 更换一个插件时，不需要修改大量无关代码。

---

# 40. 项目最终定义

MVP 可以用一句话定义：

> **一个基于 TypeScript 和 React 构建的插件化国际象棋 Web 应用，第一版支持完整本地双人对战，同时将规则、玩家、棋盘、主题和存储拆分为可替换插件。**

这个项目第一阶段追求的不是：

> 功能特别多。

而是：

> **核心功能完整，而且架构是真的可以继续长大的。**

未来：

```text
Stockfish

在线对战

Chess960

云存档

二次元主题

3D 棋盘
```

都应该是在这个基础上：

> **继续增加插件，而不是推倒重写。**