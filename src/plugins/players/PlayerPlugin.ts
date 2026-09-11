import type {
  Color,
  GameState,
  Move,
  Plugin,
} from '../../core/types'

export interface PlayerContext {
  state: GameState
}

export interface PlayerPlugin extends Plugin {
  color: Color

  requestMove(
    context: PlayerContext,
    signal: AbortSignal,
  ): Promise<Move>

  pushExternalMove?(move: Move): void
}
