import { EventBus } from './EventBus'
import type { GameEvents } from './EventBus'
import { IllegalMoveError } from './errors'
import type {
  GameState,
  Move,
  Square,
} from './types'
import type {
  PlayerPlugin,
} from '../plugins/players/PlayerPlugin'
import type {
  RulePlugin,
  RuleSession,
} from '../plugins/rules/RulePlugin'
import type {
  StoragePlugin,
} from '../plugins/storage/StoragePlugin'

export interface GameConfig {
  rules: RulePlugin

  players: {
    white: PlayerPlugin
    black: PlayerPlugin
  }

  storage: StoragePlugin
}

const GAME_ID = 'game'

function toError(err: unknown): Error {
  return err instanceof Error
    ? err
    : new Error(String(err))
}

export class GameCore {
  private readonly bus = new EventBus<GameEvents>()
  private readonly config: GameConfig

  private running = false
  private faulted = false
  private session: RuleSession | null = null
  private loopAbort: AbortController | null = null
  private loopPromise: Promise<void> | null = null

  constructor(config: GameConfig) {
    this.config = config
  }

  start(): void {
    if (this.running) return

    this.running = true
    const session = this.config.rules.createSession()
    this.session = session
    this.bus.emit('gameStarted', session.getState())
    this.loopPromise = this.runTurnLoop()
  }

  stop(): void {
    this.running = false
    this.loopAbort?.abort()
  }

  getState(): GameState {
    return this.requireSession().getState()
  }

  getLegalMoves(square: Square): Move[] {
    return this.requireSession().getLegalMoves(square)
  }

  submitMove(move: Move): void {
    if (this.faulted) {
      throw new Error(
        'Game is faulted and no longer accepts moves',
      )
    }

    const player = this.getCurrentPlayer()

    if (!player.pushExternalMove) {
      throw new Error(
        'Current player does not accept external moves',
      )
    }

    player.pushExternalMove(move)
  }

  async undo(): Promise<void> {
    await this.settleLoop()

    if (!this.session) return

    const state = this.session.undo()
    this.bus.emit('moveUndone', state)
    this.restartLoop()
  }

  async reset(): Promise<void> {
    await this.settleLoop()

    if (!this.session) return

    const state = this.session.reset()
    this.bus.emit('gameReset', state)
    this.restartLoop()
  }

  on<K extends keyof GameEvents>(
    event: K,
    handler: (payload: GameEvents[K]) => void,
  ): () => void {
    return this.bus.on(event, handler)
  }

  isFaulted(): boolean {
    return this.faulted
  }

  private enterFault(err: unknown): void {
    this.faulted = true
    this.bus.emit('error', toError(err))
    this.loopAbort?.abort()
  }

  private requireSession(): RuleSession {
    if (!this.session) {
      throw new Error('Game has not been started')
    }
    return this.session
  }

  private getCurrentPlayer(): PlayerPlugin {
    const state = this.getState()
    return this.config.players[state.status.turn]
  }

  private async runTurnLoop(): Promise<void> {
    const session = this.session
    if (!session) return

    const controller = new AbortController()
    this.loopAbort = controller

    try {
      while (this.running && !controller.signal.aborted) {
        let state: GameState
        try {
          state = session.getState()
        } catch (err) {
          this.enterFault(err)
          return
        }

        if (state.status.phase !== 'playing') return

        const player = this.config.players[state.status.turn]

        let move: Move
        try {
          move = await player.requestMove(
            { state },
            controller.signal,
          )
        } catch (err) {
          if (controller.signal.aborted) return
          // A failed player pauses the turn: emit the error and stop
          // looping rather than busy-retrying. undo/reset can resume.
          this.bus.emit('error', toError(err))
          return
        }

        let newState: GameState
        try {
          newState = session.makeMove(move)
        } catch (err) {
          if (controller.signal.aborted) return
          if (err instanceof IllegalMoveError) {
            this.bus.emit('moveRejected', move)
            continue
          }
          // Anything that is not a normal illegal move means the rule
          // engine itself is broken; the position can no longer be
          // trusted, so stop the game.
          this.enterFault(err)
          return
        }

        this.bus.emit('moveMade', newState)
        this.bus.emit('turnChanged', newState.status.turn)

        if (newState.status.inCheck) {
          this.bus.emit('check', newState.status.turn)
        }

        if (newState.status.phase !== 'playing') {
          this.bus.emit('gameEnded', newState)
        }

        // Fire-and-forget: storage must never gate the turn loop. A
        // hanging save would otherwise block abort (undo/reset/stop).
        // `makeMove` returns a fresh state object each turn, so the
        // closure safely captures the post-move snapshot. Isolate both
        // a synchronous throw and an async rejection so the move is
        // never rolled back and the loop keeps running.
        try {
          this.config.storage
            .save({ id: GAME_ID, state: newState })
            .catch((err) =>
              this.bus.emit('error', toError(err)),
            )
        } catch (err) {
          this.bus.emit('error', toError(err))
        }
      }
    } finally {
      if (this.loopAbort === controller) {
        this.loopAbort = null
      }
    }
  }

  private async settleLoop(): Promise<void> {
    this.loopAbort?.abort()

    const pending = this.loopPromise
    if (!pending) return

    try {
      await pending
    } catch {
      // The loop swallows its own aborts; ignore any stray
      // rejection so undo/reset callers are not disturbed.
    }
  }

  private restartLoop(): void {
    if (!this.running || !this.session) return
    this.loopPromise = this.runTurnLoop()
  }
}
