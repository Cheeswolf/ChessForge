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
 * Presentational: the HUD turn panel. Heading + big side label + the
 * Chinese detail line (turn / check / result).
 */
export default function GameStatus({ status }: GameStatusProps) {
  const gameOver = status.phase !== 'playing'
  const side = status.phase === 'checkmate' ? status.winner : status.turn

  return (
    <section className="game-status" aria-label="当前回合">
      <h2 className="game-status__heading">
        {gameOver ? 'GAME OVER' : 'CURRENT TURN'}
      </h2>
      <div className="game-status__side">
        <span
          className={`game-status__gem game-status__gem--${side ?? 'white'}`}
          aria-hidden="true"
        />
        <span className="game-status__side-label">
          {(side ?? 'white') === 'white' ? 'WHITE' : 'BLACK'}
        </span>
      </div>
      <p className="game-status__detail">{gameStatusLabel(status)}</p>
    </section>
  )
}
