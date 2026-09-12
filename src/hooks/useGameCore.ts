import { useCallback, useEffect, useState } from 'react'
import type { GameCore } from '../core/GameCore'
import type {
  Color,
  GameState,
  Move,
  PromotionPiece,
  Square,
} from '../core/types'

export interface PendingPromotion {
  move: Move
  color: Color
}

/**
 * Pure helper: a move needs a promotion choice when the piece on its
 * origin square is a pawn and the destination square is on rank 1 or 8.
 */
export function needsPromotion(move: Move, state: GameState): boolean {
  const piece = state.board[move.from]
  if (!piece || piece.type !== 'pawn') return false

  const rank = move.to[1]
  return rank === '1' || rank === '8'
}

export interface UseGameCoreResult {
  state: GameState
  legalMoves: Move[]
  selectedSquare: Square | undefined
  pendingPromotion: PendingPromotion | null
  selectSquare(square: Square): void
  move(move: Move): void
  selectPromotion(piece: PromotionPiece): void
  cancelPromotion(): void
  undo(): Promise<void>
  reset(): Promise<void>
}

/**
 * Wires a GameCore instance to React state. Starts the core on mount,
 * subscribes to its events to keep `state` in sync, and exposes the
 * actions the UI needs (selection, moves with promotion handling, undo
 * and reset).
 */
export function useGameCore(core: GameCore): UseGameCoreResult {
  const [state, setState] = useState<GameState>(() => {
    core.start()
    return core.getState()
  })
  const [legalMoves, setLegalMoves] = useState<Move[]>([])
  const [selectedSquare, setSelectedSquare] = useState<Square | undefined>(
    undefined,
  )
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null)

  useEffect(() => {
    // Re-start in case a StrictMode teardown stopped the loop; start()
    // is idempotent while running.
    core.start()

    const offs = [
      core.on('moveMade', setState),
      core.on('gameEnded', setState),
      core.on('gameReset', setState),
      core.on('moveUndone', setState),
    ]

    return () => {
      for (const off of offs) off()
      core.stop()
    }
  }, [core])

  const clearSelection = useCallback(() => {
    setSelectedSquare(undefined)
    setLegalMoves([])
  }, [])

  const selectSquare = useCallback(
    (square: Square) => {
      const piece = state.board[square]
      if (piece && piece.color === state.status.turn) {
        setSelectedSquare(square)
        setLegalMoves(core.getLegalMoves(square))
      } else {
        clearSelection()
      }
    },
    [core, state, clearSelection],
  )

  const move = useCallback(
    (move: Move) => {
      if (needsPromotion(move, state)) {
        setPendingPromotion({ move, color: state.status.turn })
        return
      }

      core.submitMove(move)
      clearSelection()
    },
    [core, state, clearSelection],
  )

  const selectPromotion = useCallback(
    (piece: PromotionPiece) => {
      if (!pendingPromotion) return

      core.submitMove({ ...pendingPromotion.move, promotion: piece })
      setPendingPromotion(null)
      clearSelection()
    },
    [core, pendingPromotion, clearSelection],
  )

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null)
    clearSelection()
  }, [clearSelection])

  const undo = useCallback(async () => {
    setPendingPromotion(null)
    clearSelection()
    await core.undo()
    setState(core.getState())
  }, [core, clearSelection])

  const reset = useCallback(async () => {
    setPendingPromotion(null)
    clearSelection()
    await core.reset()
    setState(core.getState())
  }, [core, clearSelection])

  return {
    state,
    legalMoves,
    selectedSquare,
    pendingPromotion,
    selectSquare,
    move,
    selectPromotion,
    cancelPromotion,
    undo,
    reset,
  }
}
