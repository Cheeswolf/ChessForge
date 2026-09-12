import type { Color, PromotionPiece } from '../core/types'

export interface PromotionDialogProps {
  color: Color
  onSelect(piece: PromotionPiece): void
  onCancel?(): void
}

const OPTIONS: ReadonlyArray<{
  piece: PromotionPiece
  label: string
}> = [
  { piece: 'queen', label: '后' },
  { piece: 'rook', label: '车' },
  { piece: 'bishop', label: '象' },
  { piece: 'knight', label: '马' },
]

/**
 * Presentational: offers the four promotion choices. Visible labels are
 * the piece glyphs (后/车/象/马); accessible names spell out the action
 * (升变为后, ...) so screen readers and tests can target them.
 */
export default function PromotionDialog({
  onSelect,
  onCancel,
}: PromotionDialogProps) {
  return (
    <div className="promotion-dialog" role="dialog" aria-label="升变">
      <p className="promotion-title">选择升变棋子</p>
      <div className="promotion-options">
        {OPTIONS.map(({ piece, label }) => (
          <button
            key={piece}
            type="button"
            aria-label={`升变为${label}`}
            onClick={() => onSelect(piece)}
          >
            {label}
          </button>
        ))}
      </div>
      {onCancel && (
        <button
          type="button"
          className="promotion-cancel"
          onClick={onCancel}
        >
          取消
        </button>
      )}
    </div>
  )
}
