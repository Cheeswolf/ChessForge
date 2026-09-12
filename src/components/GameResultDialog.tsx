import type { GameStatus as GameStatusModel } from '../core/types'
import { gameStatusLabel } from './GameStatus'

export interface GameResultDialogProps {
  status: GameStatusModel
  onReset(): void
  onViewHistory(): void
}

/**
 * Presentational: shown only when the game is no longer playing. Renders
 * the result text plus 再来一局 (reset) and 查看棋谱 (jump to history)
 * actions. The final board remains visible underneath.
 */
export default function GameResultDialog({
  status,
  onReset,
  onViewHistory,
}: GameResultDialogProps) {
  if (status.phase === 'playing') return null

  return (
    <div className="game-result-dialog" role="dialog" aria-label="对局结束">
      <p className="game-result-text">{gameStatusLabel(status)}</p>
      <div className="game-result-actions">
        <button type="button" onClick={onReset}>
          再来一局
        </button>
        <button type="button" onClick={onViewHistory}>
          查看棋谱
        </button>
      </div>
    </div>
  )
}
