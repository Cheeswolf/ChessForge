import type { GameStatus as GameStatusModel } from '../core/types'

export interface GameStatusProps {
  status: GameStatusModel
}

function turnLabel(turn: GameStatusModel['turn']): string {
  return turn === 'white' ? 'White to move' : 'Black to move'
}

/**
 * Presentational: renders the current turn from props. Full
 * check/checkmate/draw mapping arrives in a later task.
 */
export default function GameStatus({ status }: GameStatusProps) {
  return (
    <div className="game-status">
      {turnLabel(status.turn)}
    </div>
  )
}
