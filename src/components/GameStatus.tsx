import type { GameStatus as GameStatusModel } from '../core/types'

export interface GameStatusProps {
  status: GameStatusModel
}

/**
 * Maps a GameStatus to its exact display string.
 */
export function gameStatusLabel(status: GameStatusModel): string {
  if (status.phase === 'checkmate') {
    return status.winner === 'white' ? '白方获胜：将死' : '黑方获胜：将死'
  }

  if (status.phase === 'draw') {
    return '和棋'
  }

  if (status.inCheck) {
    return status.turn === 'white' ? '白方被将军' : '黑方被将军'
  }

  return status.turn === 'white' ? '轮到白方' : '轮到黑方'
}

/**
 * Presentational: renders the current turn / check / result string.
 */
export default function GameStatus({ status }: GameStatusProps) {
  return (
    <div className="game-status">
      {gameStatusLabel(status)}
    </div>
  )
}
