import type { Color, PromotionPiece } from '../core/types'
import PixelPiece from '../plugins/board/DefaultBoard/PixelPiece'
import PixelPanel from './PixelPanel'
import PixelButton from './PixelButton'

export interface PromotionDialogProps {
  color: Color
  onSelect(piece: PromotionPiece): void
  onCancel?(): void
}

const OPTIONS: readonly PromotionPiece[] = ['queen', 'rook', 'bishop', 'knight']

/**
 * Presentational: the PROMOTE PAWN dialog. Each option renders the real
 * Pixel Forge piece sprite in the promoting side's palette; accessible
 * names spell out the action ("Promote to queen", ...).
 */
export default function PromotionDialog({
  color,
  onSelect,
  onCancel,
}: PromotionDialogProps) {
  return (
    <div className="dialog-overlay">
      <PixelPanel
        className="promotion-dialog"
        role="dialog"
        aria-label="PROMOTE PAWN"
      >
        <h2 className="promotion-dialog__title">PROMOTE PAWN</h2>
        <div className="promotion-options">
          {OPTIONS.map((piece) => (
            <button
              key={piece}
              type="button"
              className="promotion-option"
              aria-label={`Promote to ${piece}`}
              onClick={() => onSelect(piece)}
            >
              <PixelPiece
                piece={{ color, type: piece }}
                className="promotion-option__sprite"
              />
            </button>
          ))}
        </div>
        {onCancel && (
          <PixelButton
            variant="secondary"
            className="promotion-cancel"
            onClick={onCancel}
          >
            CANCEL
          </PixelButton>
        )}
      </PixelPanel>
    </div>
  )
}
