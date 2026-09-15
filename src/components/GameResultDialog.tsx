import type { GameStatus as GameStatusModel } from '../core/types'
import { gameStatusLabel } from './GameStatus'
import PixelPanel from './PixelPanel'
import PixelButton from './PixelButton'

export interface GameResultDialogProps {
  status: GameStatusModel
  onPlayAgain(): void
  onViewHistory(): void
  onMainMenu(): void
}

/**
 * Presentational: the GAME OVER dialog, shown only when the game is no
 * longer playing. Result text plus PLAY AGAIN / VIEW MOVES / MAIN MENU
 * actions; the final board remains visible underneath.
 */
export default function GameResultDialog({
  status,
  onPlayAgain,
  onViewHistory,
  onMainMenu,
}: GameResultDialogProps) {
  if (status.phase === 'playing') return null

  return (
    <div className="dialog-overlay">
      <PixelPanel
        className="game-result-dialog"
        role="dialog"
        aria-label="GAME OVER"
      >
        <h2 className="game-result-dialog__title">GAME OVER</h2>
        <p className="game-result-text">{gameStatusLabel(status)}</p>
        <div className="game-result-actions">
          <PixelButton variant="primary" onClick={onPlayAgain}>
            PLAY AGAIN
          </PixelButton>
          <PixelButton variant="secondary" onClick={onViewHistory}>
            VIEW MOVES
          </PixelButton>
          <PixelButton variant="secondary" onClick={onMainMenu}>
            MAIN MENU
          </PixelButton>
        </div>
      </PixelPanel>
    </div>
  )
}
