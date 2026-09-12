import { GameCore } from './GameCore'
import { IllegalMoveError } from './errors'
import { chessJsRulePlugin } from '../plugins/rules/ChessJsRulePlugin'
import { HumanPlayerPlugin } from '../plugins/players/HumanPlayerPlugin'
import type {
  Color,
  GameState,
  Move,
} from './types'
import type {
  PlayerContext,
  PlayerPlugin,
} from '../plugins/players/PlayerPlugin'
import type {
  RulePlugin,
  RuleSession,
} from '../plugins/rules/RulePlugin'
import type {
  SavedGame,
  StoragePlugin,
} from '../plugins/storage/StoragePlugin'

// --- helpers -------------------------------------------------------------

async function flushAsync(rounds = 3): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

function initialState(): GameState {
  return {
    fen: 'start',
    board: {},
    history: [],
    status: {
      phase: 'playing',
      turn: 'white',
      inCheck: false,
    },
  }
}

class NoopStorage implements StoragePlugin {
  readonly id = 'noop-storage'
  readonly name = 'Noop Storage'

  async save(_game: SavedGame): Promise<void> {}

  async load(_id: string): Promise<SavedGame | null> {
    return null
  }

  async clear(_id: string): Promise<void> {}
}

class SyncThrowingStorage implements StoragePlugin {
  readonly id = 'sync-throwing-storage'
  readonly name = 'Sync Throwing Storage'

  save(_game: SavedGame): Promise<void> {
    throw new Error('sync save failure')
  }

  async load(_id: string): Promise<SavedGame | null> {
    return null
  }

  async clear(_id: string): Promise<void> {}
}

class RejectingStorage implements StoragePlugin {
  readonly id = 'rejecting-storage'
  readonly name = 'Rejecting Storage'

  save(_game: SavedGame): Promise<void> {
    return Promise.reject(new Error('async save failure'))
  }

  async load(_id: string): Promise<SavedGame | null> {
    return null
  }

  async clear(_id: string): Promise<void> {}
}

class ThrowingPlayerPlugin implements PlayerPlugin {
  readonly id: string
  readonly name: string
  readonly color: Color
  calls = 0

  constructor(color: Color) {
    this.id = `throwing-${color}`
    this.name = `Throwing ${color}`
    this.color = color
  }

  requestMove(
    _context: PlayerContext,
    _signal: AbortSignal,
  ): Promise<Move> {
    this.calls++
    return Promise.reject(new Error('player failure'))
  }
}

class FlakyPlayer implements PlayerPlugin {
  readonly id: string
  readonly name: string
  readonly color: Color
  calls = 0

  constructor(
    color: Color,
    private readonly failTimes = 1,
  ) {
    this.id = `flaky-${color}`
    this.name = `Flaky ${color}`
    this.color = color
  }

  requestMove(): Promise<Move> {
    this.calls++
    if (this.calls <= this.failTimes) {
      return Promise.reject(new Error('player failure'))
    }
    return Promise.resolve({ from: 'e2', to: 'e4' })
  }
}

class WaitingPlayer implements PlayerPlugin {
  readonly id: string
  readonly name: string
  readonly color: Color

  constructor(color: Color) {
    this.id = `waiting-${color}`
    this.name = `Waiting ${color}`
    this.color = color
  }

  requestMove(): Promise<Move> {
    return new Promise<Move>(() => {})
  }
}

interface StubRuleBehavior {
  getState?: () => GameState
  makeMove?: (move: Move) => GameState
}

class StubRuleSession implements RuleSession {
  private state = initialState()

  constructor(private readonly behavior: StubRuleBehavior) {}

  getState(): GameState {
    if (this.behavior.getState) return this.behavior.getState()
    return this.state
  }

  getLegalMoves(): Move[] {
    return []
  }

  makeMove(move: Move): GameState {
    if (this.behavior.makeMove) return this.behavior.makeMove(move)
    this.state = {
      ...this.state,
      status: { ...this.state.status, turn: 'black' },
    }
    return this.state
  }

  undo(): GameState {
    this.state = initialState()
    return this.state
  }

  reset(): GameState {
    this.state = initialState()
    return this.state
  }
}

function stubRule(behavior: StubRuleBehavior = {}): RulePlugin {
  return {
    id: 'stub-rule',
    name: 'Stub Rule',
    createSession: () => new StubRuleSession(behavior),
  }
}

interface MakeCoreOptions {
  rule?: RulePlugin
  white?: PlayerPlugin
  black?: PlayerPlugin
  storage?: StoragePlugin
}

function makeCore(
  options: MakeCoreOptions = {},
): GameCore {
  return new GameCore({
    rules: options.rule ?? stubRule(),
    players: {
      white:
        options.white ??
        new HumanPlayerPlugin('white', 'White', 'white'),
      black:
        options.black ??
        new HumanPlayerPlugin('black', 'Black', 'black'),
    },
    storage: options.storage ?? new NoopStorage(),
  })
}

// --- storage failure -----------------------------------------------------

test('a synchronous storage save failure emits error and does not roll back the move', async () => {
  const errors: Error[] = []
  const core = new GameCore({
    rules: chessJsRulePlugin,
    players: {
      white: new HumanPlayerPlugin('white', 'White', 'white'),
      black: new HumanPlayerPlugin('black', 'Black', 'black'),
    },
    storage: new SyncThrowingStorage(),
  })
  core.on('error', (error) => errors.push(error))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(core.getState().status.turn).toBe('black')
  expect(core.getState().history).toHaveLength(1)
  expect(core.getState().board.e4).toEqual({
    color: 'white',
    type: 'pawn',
  })
  expect(core.getState().board.e2).toBeUndefined()
  expect(errors).toHaveLength(1)
  expect(errors[0].message).toBe('sync save failure')
})

test('an async storage save rejection emits error and does not roll back the move', async () => {
  const errors: Error[] = []
  const core = new GameCore({
    rules: chessJsRulePlugin,
    players: {
      white: new HumanPlayerPlugin('white', 'White', 'white'),
      black: new HumanPlayerPlugin('black', 'Black', 'black'),
    },
    storage: new RejectingStorage(),
  })
  core.on('error', (error) => errors.push(error))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(core.getState().status.turn).toBe('black')
  expect(core.getState().history).toHaveLength(1)
  expect(errors).toHaveLength(1)
  expect(errors[0].message).toBe('async save failure')
})

// --- player failure ------------------------------------------------------

test('a failing player emits error once and pauses the loop without faulting', async () => {
  const white = new ThrowingPlayerPlugin('white')
  const core = makeCore({
    white,
    black: new WaitingPlayer('black'),
  })
  const errors: Error[] = []
  core.on('error', (error) => errors.push(error))

  core.start()
  await flushAsync()

  expect(white.calls).toBe(1)
  expect(errors).toHaveLength(1)
  expect(errors[0].message).toBe('player failure')
  expect(core.isFaulted()).toBe(false)
})

test('a paused game can be recovered via reset', async () => {
  const white = new FlakyPlayer('white', 1)
  const core = makeCore({
    white,
    black: new WaitingPlayer('black'),
  })
  const resets: GameState[] = []
  core.on('gameReset', (state) => resets.push(state))

  core.start()
  await flushAsync()
  expect(white.calls).toBe(1)
  expect(core.isFaulted()).toBe(false)

  await core.reset()
  await flushAsync()

  expect(resets).toHaveLength(1)
  expect(white.calls).toBe(2)
  expect(core.getState().status.turn).toBe('black')
})

// --- rule failure --------------------------------------------------------

test('a rule makeMove throwing a non-IllegalMoveError faults the core', async () => {
  const core = makeCore({
    rule: stubRule({
      makeMove: () => {
        throw new Error('rule broken')
      },
    }),
  })
  const errors: Error[] = []
  core.on('error', (error) => errors.push(error))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(core.isFaulted()).toBe(true)
  expect(errors).toHaveLength(1)
  expect(errors[0].message).toBe('rule broken')
  expect(() =>
    core.submitMove({ from: 'g1', to: 'f3' }),
  ).toThrow(/faulted/)
})

test('a rule getState that throws faults the core', async () => {
  let reads = 0
  const brokenRule: RulePlugin = {
    id: 'broken-state-rule',
    name: 'Broken State Rule',
    createSession: (): RuleSession => ({
      getState: () => {
        reads++
        if (reads > 1) throw new Error('rule state broken')
        return initialState()
      },
      getLegalMoves: () => [],
      makeMove: () => initialState(),
      undo: () => initialState(),
      reset: () => initialState(),
    }),
  }
  const core = makeCore({ rule: brokenRule })
  const errors: Error[] = []
  core.on('error', (error) => errors.push(error))

  core.start()
  await flushAsync()

  expect(core.isFaulted()).toBe(true)
  expect(errors).toHaveLength(1)
  expect(errors[0].message).toBe('rule state broken')
})

test('an IllegalMoveError from makeMove is a normal rejection, not a fault', async () => {
  const core = makeCore({
    rule: stubRule({
      makeMove: (move) => {
        throw new IllegalMoveError(move)
      },
    }),
  })
  const rejected: Move[] = []
  const errors: Error[] = []
  core.on('moveRejected', (move) => rejected.push(move))
  core.on('error', (error) => errors.push(error))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(rejected).toEqual([{ from: 'e2', to: 'e4' }])
  expect(errors).toHaveLength(0)
  expect(core.isFaulted()).toBe(false)
})
