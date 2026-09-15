import { memo } from 'react'
import type { Color, Piece, PieceType } from '../../../core/types'
import PixelSprite from '../../../components/pixel/PixelSprite'

export interface PixelPieceProps {
  piece: Piece
  className?: string
  title?: string
}

/**
 * Pixel Forge piece palettes. White is warm gold/cream, black is cool
 * blue-gray; both share the same silhouettes and differ only in color.
 */
const PALETTES: Record<
  Color,
  { outline: string; shadow: string; mid: string; light: string }
> = {
  white: {
    outline: '#493521',
    shadow: '#9d7844',
    mid: '#d8bd7c',
    light: '#f2e7c9',
  },
  black: {
    outline: '#101827',
    shadow: '#26364c',
    mid: '#56677c',
    light: '#9eacb7',
  },
}

/*
 * 32x32 character maps. 'l' = light, 'm' = mid, 's' = shadow, '.' = empty.
 * The dark 1px outline is generated automatically by PixelSprite.
 * Column ruler:          01234567890123456789012345678901
 * All pieces share the same stepped base on rows 25..29.
 */

const EMPTY = '................................'

const BASE_ROWS = [
  '..........lmmmmmmmmmms..........', // y25
  '.........lmmmmmmmmmmmms.........', // y26
  '.........lmmmmmmmmmmmms.........', // y27
  '........mmmmmmmmmmmmmmss........', // y28
  '........mmmmmmmmmmmmmmss........', // y29
  EMPTY, // y30
  EMPTY, // y31
] as const

const PAWN_ART = [
  EMPTY, // y00
  EMPTY,
  EMPTY,
  EMPTY,
  '..............llmm..............', // y04 ball head
  '............llmmmmms............',
  '...........llmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '............lmmmmmms............',
  '.............mmmmms.............', // y10 head bottom
  '..............mmmm..............', // neck
  '...........mmmmmmmmmm...........', // y12 collar
  '...........mmmmmmmmms...........',
  '.............lmmmms.............', // y14 body
  '.............lmmmms.............',
  '.............lmmmms.............',
  '............lmmmmmms............', // y17 step out
  '............lmmmmmms............',
  '............lmmmmmms............',
  '...........lmmmmmmmms...........', // y20
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '..........lmmmmmmmmmms..........', // y23
  '..........lmmmmmmmmmms..........',
  ...BASE_ROWS,
] as const

const ROOK_ART = [
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  '..........mmm.mmm.mmm...........', // y04 battlements
  '..........mmm.mmm.mmm...........',
  '..........mmm.mmm.mmm...........',
  '..........mmmmmmmmmmm...........', // y07 band
  '..........mmmmmmmmmmm...........',
  '...........mmmmmmmmm...........', // y09 neck
  '...........lmmmmmmms............', // y10 column
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '...........lmmmmmmms............',
  '..........lmmmmmmmms...........', // y23 step out
  '..........lmmmmmmmms...........',
  ...BASE_ROWS,
] as const

const KNIGHT_ART = [
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  '.................mm..............', // y04 ear
  '................mmmm............',
  '...............mmmmmmms.........', // y06 poll + mane
  '.............mmmmmmmms..........',
  '...........lsmmmmmmmss..........', // y08 eye (s at x12)
  '..........lmmmmmmmmmss..........',
  '.........lmmmmmmmmms...........', // y10
  '........mmmmmmmmmmms...........', // y11 muzzle
  '........mmmmmmmmmss..............',
  '........mmmmmm..mmmm............', // y13 jaw gap
  '........mmmmm...mmmmmm..........',
  '.........mmmm..mmmmmmms..........',
  '..........mmmmmmmmmmms..........', // y16 neck merges
  '...........mmmmmmmmmms..........',
  '...........mmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........', // y19 chest
  '..........lmmmmmmmmmms..........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '..........lmmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........',
  ...BASE_ROWS,
] as const

const BISHOP_ART = [
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  '...............lm...............', // y04 ball
  '..............llms..............',
  '.............lmmmms.............', // y06 mitre
  '............lmmmmmms............',
  '...........lmmmmmmmss...........', // y08 diagonal slit
  '...........lmmmmmssmm...........',
  '............lmmmssmm............',
  '............lmmmmmms............',
  '.............mmmmms.............', // y12 head bottom
  '..............mmmm..............', // neck
  '............mmmmmmmm............', // y14 collar
  '............mmmmmmms............',
  '.............lmmmms.............', // y16 body
  '.............lmmmms.............',
  '............lmmmmmms............',
  '............lmmmmmms............',
  '............lmmmmmms............',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '..........lmmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........',
  ...BASE_ROWS,
] as const

const QUEEN_ART = [
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  '.........mm.mm.mm.mm.mm.........', // y04 crown balls
  '.........mm.mm.mm.mm.mm.........',
  '.........lm.lm.lm.lm.ls.........', // y06 shaded balls
  '.........lmmmmmmmmmmmms.........', // y07 crown band
  '.........lmmmmmmmmmmmms.........',
  '.........lmmmmmmmmmmmms.........',
  '..........lmmmmmmmmmms..........', // y10 step in
  '..........lmmmmmmmmmms..........',
  '............lmmmmmms............', // y12 waist
  '...........lmmmmmmmms...........', // y13 collar
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........', // y15 body
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '..........lmmmmmmmmmms..........', // y20
  '..........lmmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........',
  ...BASE_ROWS,
] as const

const KING_ART = [
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  '...............lm...............', // y04 cross
  '...............lm...............',
  '............llmmmmms............', // y06 crossbar
  '...............lm...............',
  '...............lm...............',
  '...........lmmmmmmmms...........', // y09 crown band
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........', // y12 body
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '...........lmmmmmmmms...........',
  '..........lmmmmmmmmmms..........', // y20
  '..........lmmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........',
  '..........lmmmmmmmmmms..........',
  ...BASE_ROWS,
] as const

const PIECE_ART: Record<PieceType, readonly string[]> = {
  king: KING_ART,
  queen: QUEEN_ART,
  rook: ROOK_ART,
  bishop: BISHOP_ART,
  knight: KNIGHT_ART,
  pawn: PAWN_ART,
}

/**
 * A true 32x32 crisp-edge pixel chess piece: integer rects only, no
 * curves, no text glyphs. Silhouettes are shared between colors; only the
 * palette changes (warm gold/cream for white, cool blue-gray for black).
 *
 * Memoized by piece value: each sprite is ~100 SVG rects, so skipping
 * re-renders of unmoved pieces keeps the 64-square board responsive.
 */
function PixelPiece({ piece, className, title }: PixelPieceProps) {
  const palette = PALETTES[piece.color]

  return (
    <PixelSprite
      art={PIECE_ART[piece.type]}
      palette={{
        l: palette.light,
        m: palette.mid,
        s: palette.shadow,
      }}
      outline={palette.outline}
      className={className}
      title={title}
      svgProps={{ 'data-piece': `${piece.color}-${piece.type}` }}
    />
  )
}

export default memo(
  PixelPiece,
  (prev, next) =>
    prev.piece.color === next.piece.color &&
    prev.piece.type === next.piece.type &&
    prev.className === next.className &&
    prev.title === next.title,
)
