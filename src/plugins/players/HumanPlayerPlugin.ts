import type { Color, Move } from '../../core/types'
import type {
  PlayerContext,
  PlayerPlugin,
} from './PlayerPlugin'

function abortError(): DOMException {
  return new DOMException(
    'The operation was aborted',
    'AbortError',
  )
}

export class HumanPlayerPlugin implements PlayerPlugin {
  readonly id: string
  readonly name: string
  readonly color: Color

  private pending:
    | { resolve: (move: Move) => void }
    | null = null

  constructor(id: string, name: string, color: Color) {
    this.id = id
    this.name = name
    this.color = color
  }

  requestMove(
    _context: PlayerContext,
    signal: AbortSignal,
  ): Promise<Move> {
    if (this.pending) {
      return Promise.reject(
        new Error('A move request is already pending'),
      )
    }

    return new Promise<Move>((resolve, reject) => {
      const onAbort = (): void => {
        this.pending = null
        reject(abortError())
      }

      if (signal.aborted) {
        reject(abortError())
        return
      }

      signal.addEventListener('abort', onAbort, {
        once: true,
      })

      this.pending = {
        resolve: (move: Move): void => {
          signal.removeEventListener('abort', onAbort)
          this.pending = null
          resolve(move)
        },
      }
    })
  }

  pushExternalMove(move: Move): void {
    const pending = this.pending
    if (!pending) return

    pending.resolve(move)
  }
}
