import type { ComponentType } from 'react'
import type {
  BoardPosition,
  GameStatus,
  Move,
  Plugin,
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

export interface BoardPlugin extends Plugin {
  Component: ComponentType<BoardPluginProps>
}
