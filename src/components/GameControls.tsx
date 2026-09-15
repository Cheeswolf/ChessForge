import PixelButton from './PixelButton'

export interface GameControlsProps {
  onUndo(): void
  onReset(): void
  disabled?: boolean
}

/**
 * Presentational: UNDO / RESTART pixel buttons. Pure props in, events
 * out — it never touches the GameCore.
 */
export default function GameControls({
  onUndo,
  onReset,
  disabled = false,
}: GameControlsProps) {
  return (
    <div className="game-controls">
      <PixelButton variant="secondary" onClick={onUndo} disabled={disabled}>
        UNDO
      </PixelButton>
      <PixelButton variant="primary" onClick={onReset} disabled={disabled}>
        RESTART
      </PixelButton>
    </div>
  )
}
