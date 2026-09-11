import type {
  GameState,
  Move,
  Plugin,
  Square,
} from '../../core/types'

export interface RuleSession {
  getState(): GameState
  getLegalMoves(square: Square): Move[]
  makeMove(move: Move): GameState
  undo(): GameState
  reset(): GameState
}

export interface RulePlugin extends Plugin {
  createSession(): RuleSession
}
