import { useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type {
  BoardPosition,
  Color,
  Piece,
  PieceType,
  Square,
} from '../../../core/types'
import type { BoardPluginProps } from '../BoardPlugin'
import './DefaultBoard.css'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const

const GLYPHS: Record<Color, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙',
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
  },
}

function pieceGlyph(piece: Piece): string {
  return GLYPHS[piece.color][piece.type]
}

const ALL_SQUARES: Square[] = (() => {
  const result: Square[] = []
  for (const rank of RANKS) {
    for (const file of FILES) {
      result.push(`${file}${rank}` as Square)
    }
  }
  return result
})()

function isLightSquare(square: Square): boolean {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = Number(square[1])
  return (file + rank) % 2 === 0
}

function findKing(
  position: BoardPosition,
  color: Color,
): Square | undefined {
  for (const [square, piece] of Object.entries(position)) {
    if (piece && piece.color === color && piece.type === 'king') {
      return square as Square
    }
  }
  return undefined
}

interface DragState {
  from: Square
  glyph: string
  x: number
  y: number
}

function squareFromEvent(e: ReactPointerEvent): Square | undefined {
  const target = e.target as HTMLElement | null
  const squareEl = target?.closest?.('[data-square]') as
    | HTMLElement
    | null
  return squareEl?.getAttribute('data-square') as Square | undefined
}

/**
 * Presentational board. Receives position/selection/highlight state as
 * props and emits `onSquareSelect`/`onMove`. It never mutates the
 * canonical position: drags only track a local visual state, and an
 * illegal drop is "undone" by React re-rendering from unchanged props.
 */
export default function DefaultBoard(props: BoardPluginProps) {
  const {
    position,
    status,
    selectedSquare,
    legalMoves,
    lastMove,
    onSquareSelect,
    onMove,
  } = props

  const [drag, setDrag] = useState<DragState | null>(null)

  const legalTargets = new Set(
    legalMoves
      .filter((move) => move.from === selectedSquare)
      .map((move) => move.to),
  )

  const checkedSquare = status.inCheck
    ? findKing(position, status.turn)
    : undefined

  function handleSquareClick(square: Square) {
    if (selectedSquare && legalTargets.has(square)) {
      onMove({ from: selectedSquare, to: square })
    } else {
      onSquareSelect(square)
    }
  }

  function handlePointerDown(
    e: ReactPointerEvent<HTMLDivElement>,
    square: Square,
  ) {
    const piece = position[square]
    if (!piece) return
    setDrag({
      from: square,
      glyph: pieceGlyph(piece),
      x: e.clientX,
      y: e.clientY,
    })
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag) return
    setDrag({ ...drag, x: e.clientX, y: e.clientY })
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag) return
    const target = squareFromEvent(e)
    setDrag(null)
    if (target && target !== drag.from) {
      onMove({ from: drag.from, to: target })
    }
  }

  function handlePointerCancel() {
    setDrag(null)
  }

  return (
    <div
      className="board"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
    >
      {ALL_SQUARES.map((square) => {
        const piece = position[square]
        const isLegalTarget = legalTargets.has(square)
        const isChecked = square === checkedSquare

        const classes = [
          'square',
          isLightSquare(square) ? 'square--light' : 'square--dark',
        ]
        if (square === selectedSquare) classes.push('square--selected')
        if (
          lastMove &&
          (square === lastMove.from || square === lastMove.to)
        ) {
          classes.push('square--previous')
        }
        if (drag && drag.from === square) {
          classes.push('square--drag-source')
        }

        return (
          <div
            key={square}
            data-square={square}
            data-testid={`square-${square}`}
            className={classes.join(' ')}
            onClick={() => handleSquareClick(square)}
            onPointerDown={(e) => handlePointerDown(e, square)}
          >
            {isLegalTarget && (
              <span className="legal-marker" aria-hidden="true" />
            )}
            {isChecked && (
              <span className="check-marker" aria-hidden="true" />
            )}
            {piece && (
              <span className="board-piece">{pieceGlyph(piece)}</span>
            )}
          </div>
        )
      })}

      {drag && (
        <span
          className="dragging-piece"
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        >
          {drag.glyph}
        </span>
      )}
    </div>
  )
}
