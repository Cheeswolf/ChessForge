export interface GameControlsProps {
  onUndo(): void
  onReset(): void
}

/**
 * Presentational: undo (悔棋) and restart (重新开始) buttons.
 */
export default function GameControls({
  onUndo,
  onReset,
}: GameControlsProps) {
  return (
    <div className="game-controls">
      <button type="button" onClick={onUndo}>
        悔棋
      </button>
      <button type="button" onClick={onReset}>
        重新开始
      </button>
    </div>
  )
}
