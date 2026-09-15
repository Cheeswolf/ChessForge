import PixelPanel from './PixelPanel'
import PixelButton from './PixelButton'

export interface ExitMatchDialogProps {
  open: boolean
  onContinue(): void
  onExit(): void
}

/**
 * Presentational: the exit confirmation for a match in progress. Never a
 * browser `confirm()` — a real Pixel Forge dialog.
 */
export default function ExitMatchDialog({
  open,
  onContinue,
  onExit,
}: ExitMatchDialogProps) {
  if (!open) return null

  return (
    <div className="dialog-overlay">
      <PixelPanel
        className="exit-match-dialog"
        role="dialog"
        aria-label="退出当前对局？"
      >
        <h2 className="exit-match-dialog__title">退出当前对局？</h2>
        <p className="exit-match-dialog__hint">
          对局尚未结束，退出后将返回主页。
        </p>
        <div className="exit-match-dialog__actions">
          <PixelButton variant="secondary" onClick={onContinue}>
            继续对局
          </PixelButton>
          <PixelButton variant="danger" onClick={onExit}>
            确认退出
          </PixelButton>
        </div>
      </PixelPanel>
    </div>
  )
}
