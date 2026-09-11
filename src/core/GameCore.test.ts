import { GameCore } from './GameCore'
import type {
  Color,
  GameState,
  Move,
  Square,
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

function clone<T>(value: T): T {
  return structuredClone(value)
}

function opposite(color: Color): Color {
  return color === 'white' ? 'black' : 'white'
}

function makeInitialState(): GameState {
  return {
    fen: 'start',
    board: {
      e2: { color: 'white', type: 'pawn' },
      e7: { color: 'black', type: 'pawn' },
    },
    history: [],
    status: {
      phase: 'playing',
      turn: 'white',
      inCheck: false,
    },
  }
}

function defaultApplyMove(
  move: Move,
  state: GameState,
): GameState {
  const turn = state.status.turn
  return {
    ...clone(state),
    fen: `${move.from}-${move.to}`,
    history: [
      ...state.history,
      {
        from: move.from,
        to: move.to,
        san: `${move.from}-${move.to}`,
        color: turn,
      },
    ],
    status: { ...state.status, turn: opposite(turn) },
  }
}

interface FakeRuleOptions {
  initial?: GameState
  applyMove?: (
    move: Move,
    state: GameState,
  ) => GameState | Error
  legalMoves?: (square: Square) => Move[]
}

class FakeRuleSession implements RuleSession {
  private state: GameState
  private stack: GameState[] = []

  constructor(private options: FakeRuleOptions) {
    this.state = clone(
      options.initial ?? makeInitialState(),
    )
  }

  getState(): GameState {
    return clone(this.state)
  }

  getLegalMoves(square: Square): Move[] {
    return this.options.legalMoves?.(square) ?? []
  }

  makeMove(move: Move): GameState {
    const apply =
      this.options.applyMove ?? defaultApplyMove
    const result = apply(move, this.state)
    if (result instanceof Error) throw result
    this.stack.push(clone(this.state))
    this.state = result
    return this.getState()
  }

  undo(): GameState {
    const previous = this.stack.pop()
    if (previous) this.state = previous
    return this.getState()
  }

  reset(): GameState {
    this.stack = []
    this.state = clone(
      this.options.initial ?? makeInitialState(),
    )
    return this.getState()
  }
}

class FakeRulePlugin implements RulePlugin {
  readonly id = 'fake-rule'
  readonly name = 'Fake Rule Plugin'

  constructor(private options: FakeRuleOptions = {}) {}

  createSession(): RuleSession {
    return new FakeRuleSession(this.options)
  }
}

class FakePlayer implements PlayerPlugin {
  readonly id: string
  readonly name: string
  readonly color: Color

  private script: Move[]
  private resolveFn: ((move: Move) => void) | null =
    null

  constructor(color: Color, script: Move[] = []) {
    this.id = `fake-${color}`
    this.name = `Fake ${color}`
    this.color = color
    this.script = [...script]
  }

  requestMove(
    _context: PlayerContext,
    signal: AbortSignal,
  ): Promise<Move> {
    return new Promise<Move>((resolve, reject) => {
      const onAbort = (): void => {
        this.resolveFn = null
        reject(
          new DOMException(
            'The operation was aborted',
            'AbortError',
          ),
        )
      }

      if (signal.aborted) {
        onAbort()
        return
      }

      signal.addEventListener('abort', onAbort, {
        once: true,
      })

      const scripted = this.script.shift()
      if (scripted) {
        signal.removeEventListener('abort', onAbort)
        resolve(scripted)
        return
      }

      this.resolveFn = (move: Move): void => {
        signal.removeEventListener('abort', onAbort)
        this.resolveFn = null
        resolve(move)
      }
    })
  }

  pushExternalMove(move: Move): void {
    this.resolveFn?.(move)
  }
}

class FakeStorage implements StoragePlugin {
  readonly id = 'fake-storage'
  readonly name = 'Fake Storage Plugin'

  savedState: GameState | null = null
  saveCalls = 0
  throwOnSave = false

  async save(game: SavedGame): Promise<void> {
    this.saveCalls++
    if (this.throwOnSave) {
      throw new Error('storage failure')
    }
    this.savedState = clone(game.state)
  }

  async load(_id: string): Promise<SavedGame | null> {
    return null
  }

  async clear(_id: string): Promise<void> {}
}

interface MakeCoreOptions {
  rule?: FakeRuleOptions
  white?: PlayerPlugin
  black?: PlayerPlugin
  storage?: FakeStorage
}

function makeCore(
  options: MakeCoreOptions = {},
): { core: GameCore; storage: FakeStorage } {
  const storage = options.storage ?? new FakeStorage()
  const core = new GameCore({
    rules: new FakeRulePlugin(options.rule),
    players: {
      white:
        options.white ?? new FakePlayer('white'),
      black:
        options.black ?? new FakePlayer('black'),
    },
    storage,
  })
  return { core, storage }
}

async function flushAsync(rounds = 3): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await new Promise((resolve) =>
      setTimeout(resolve, 0),
    )
  }
}

// --- tests ---------------------------------------------------------------

test('accepts a legal player move and changes turn', async () => {
  const { core } = makeCore()

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(core.getState().status.turn).toBe('black')
})

test('rejects an illegal move, keeps state and turn', async () => {
  const rejected: Move[] = []
  const { core } = makeCore({
    rule: {
      applyMove: (move) =>
        new Error(`illegal ${move.from}-${move.to}`),
    },
  })

  core.on('moveRejected', (move) => rejected.push(move))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(rejected).toEqual([{ from: 'e2', to: 'e4' }])
  expect(core.getState().status.turn).toBe('white')
  expect(core.getState().history).toEqual([])
})

test('emits gameStarted on start', () => {
  const { core } = makeCore()
  const states: GameState[] = []

  core.on('gameStarted', (state) => states.push(state))

  core.start()

  expect(states).toHaveLength(1)
  expect(states[0].status.turn).toBe('white')

  core.stop()
})

test('emits moveMade and turnChanged after a legal move', async () => {
  const { core } = makeCore()
  const made: GameState[] = []
  const turns: Color[] = []

  core.on('moveMade', (state) => made.push(state))
  core.on('turnChanged', (turn) => turns.push(turn))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(made).toHaveLength(1)
  expect(made[0].status.turn).toBe('black')
  expect(turns).toEqual(['black'])
})

test('emits check when the resulting position is in check', async () => {
  const { core } = makeCore({
    rule: {
      applyMove: (move, state) => ({
        ...clone(state),
        history: [
          ...state.history,
          {
            from: move.from,
            to: move.to,
            san: `${move.from}-${move.to}`,
            color: state.status.turn,
          },
        ],
        status: {
          phase: 'playing',
          turn: opposite(state.status.turn),
          inCheck: true,
        },
      }),
    },
  })
  const checks: Color[] = []

  core.on('check', (turn) => checks.push(turn))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(checks).toEqual(['black'])
})

test('emits gameEnded on a terminal position', async () => {
  const { core } = makeCore({
    rule: {
      applyMove: (move, state) => ({
        ...clone(state),
        history: [
          ...state.history,
          {
            from: move.from,
            to: move.to,
            san: `${move.from}-${move.to}`,
            color: state.status.turn,
          },
        ],
        status: {
          phase: 'checkmate',
          turn: opposite(state.status.turn),
          inCheck: true,
          winner: state.status.turn,
        },
      }),
    },
  })
  const ended: GameState[] = []

  core.on('gameEnded', (state) => ended.push(state))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(ended).toHaveLength(1)
  expect(ended[0].status.phase).toBe('checkmate')
  expect(ended[0].status.winner).toBe('white')
})

test('persists state after a legal move', async () => {
  const { core, storage } = makeCore()

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(storage.savedState).toEqual(core.getState())
})

test('a failing storage emits error but the game continues', async () => {
  const storage = new FakeStorage()
  storage.throwOnSave = true
  const { core } = makeCore({ storage })
  const errors: Error[] = []

  core.on('error', (error) => errors.push(error))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()

  expect(errors).toHaveLength(1)
  expect(errors[0].message).toBe('storage failure')
  expect(core.getState().status.turn).toBe('black')
})

test('undo restores position, turn, and emits moveUndone', async () => {
  const { core } = makeCore()
  const undone: GameState[] = []

  core.on('moveUndone', (state) => undone.push(state))

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()
  expect(core.getState().status.turn).toBe('black')

  await core.undo()

  expect(core.getState().status.turn).toBe('white')
  expect(core.getState().history).toEqual([])
  expect(undone).toHaveLength(1)
  expect(undone[0].status.turn).toBe('white')
})

test('reset restores the initial state and emits gameReset', async () => {
  const { core } = makeCore({
    white: new FakePlayer('white', [
      { from: 'e2', to: 'e4' },
      { from: 'g1', to: 'f3' },
    ]),
    black: new FakePlayer('black', [
      { from: 'e7', to: 'e5' },
    ]),
  })
  const resets: GameState[] = []

  core.on('gameReset', (state) => resets.push(state))

  core.start()
  await flushAsync()
  expect(core.getState().history.length).toBe(3)

  await core.reset()

  expect(core.getState().history).toEqual([])
  expect(core.getState().status.turn).toBe('white')
  expect(resets).toHaveLength(1)
  expect(resets[0].status.turn).toBe('white')
})

test('getLegalMoves delegates to the rule session', () => {
  const { core } = makeCore({
    rule: {
      legalMoves: (square) =>
        square === 'e2'
          ? [{ from: 'e2', to: 'e4' }]
          : [],
    },
  })

  core.start()

  expect(core.getLegalMoves('e2')).toEqual([
    { from: 'e2', to: 'e4' },
  ])
  expect(core.getLegalMoves('d2')).toEqual([])

  core.stop()
})

test('submitMove throws when the player rejects external moves', () => {
  const white: PlayerPlugin = {
    id: 'no-external',
    name: 'No External Player',
    color: 'white',
    requestMove: () => new Promise<Move>(() => {}),
  }
  const core = new GameCore({
    rules: new FakeRulePlugin(),
    players: { white, black: new FakePlayer('black') },
    storage: new FakeStorage(),
  })

  core.start()

  expect(() =>
    core.submitMove({ from: 'e2', to: 'e4' }),
  ).toThrow('Current player does not accept external moves')

  core.stop()
})

test('stop aborts the in-flight turn and applies no further moves', async () => {
  const { core } = makeCore({
    black: new FakePlayer('black', [
      { from: 'e7', to: 'e5' },
    ]),
  })

  core.start()
  core.submitMove({ from: 'e2', to: 'e4' })
  await flushAsync()
  expect(core.getState().history.length).toBe(2)

  core.stop()

  core.submitMove({ from: 'g1', to: 'f3' })
  await flushAsync()

  expect(core.getState().history.length).toBe(2)
})
