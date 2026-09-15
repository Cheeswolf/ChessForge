/**
 * Character-map pixel art shared by HomePage and MatchSetupPage.
 * '.' or ' ' is transparent; every other character maps to a palette
 * color at render time. All art is hand-authored on an integer grid —
 * no curves, no antialiasing.
 */

/* ---- Home hero: golden king (22 x 26) ---- */

export const KING_ART = [
  '..........hh..........',
  '..........hh..........',
  '..........hh..........',
  '.......hhhhhhhh.......',
  '.......hhhhhhhh.......',
  '..........hh..........',
  '..........mm..........',
  '.........lmms.........',
  '........lmmmms........',
  '.......lmmmmmms.......',
  '......lmmmmmmmms......',
  '......lmmmmmmmms......',
  '.......lmmmmmms.......',
  '........lmmmms........',
  '.........lmms.........',
  '........lmmmms........',
  '.......lmmmmmms.......',
  '......lmmmmmmmms......',
  '.....lmmmmmmmmms......',
  '....lmmmmmmmmmmms.....',
  '....lmmmmmmmmmmms.....',
  '...lmmmmmmmmmmmmms....',
  '..lmmmmmmmmmmmmmmms...',
  '..lmmmmmmmmmmmmmmms...',
  '.lmmmmmmmmmmmmmmmmms..',
  '.lmmmmmmmmmmmmmmmmms..',
] as const

export const KING_PALETTE = {
  h: '#fff3c4',
  l: '#f2d789',
  m: '#d9ad45',
  s: '#8a6e2f',
}

export const KING_OUTLINE = '#6b4a16'

/* ---- Home scene: black cat (24 x 15) ---- */

export const CAT_ART = [
  '......kk........kk......',
  '......kkk......kkk......',
  '......kkkk....kkkk......',
  '......kkkkkkkkkkkk......',
  '......kkkkkkkkkkkk......',
  '......kkeekkkkeekk......',
  '......kkkkkkkkkkkk......',
  '.......kkkkkkkkkk.......',
  '.....kkkkkkkkkkkkkk.....',
  '....kkkkkkkkkkkkkkkk....',
  '...kkkkkkkkkkkkkkkkkk...',
  '..kkkkkkkkkkkkkkkkkkkk..',
  '..kkkkkkkkkkkkkkkkkkkk..',
  '..kkkkkkkkkkkkkkkkkk..kk',
  '..kkkkkkkkkkkkkkkkkk..kk',
] as const

export const CAT_PALETTE = {
  k: '#0b0d12',
  e: '#ffd761',
}

/* ---- Sky: clouds & moon ---- */

export const CLOUD_A_ART = [
  '......bbbbbb......',
  '....bbbbbbbbbb....',
  '..aaaaaaaaaaaaaa..',
  '.aaaaaaaaaaaaaaaa.',
  'aaaaaaaaaaaaaaaaaa',
] as const

export const CLOUD_B_ART = [
  '....bbbb....',
  '..bbbbbbbb..',
  '.aaaaaaaaaa.',
  'aaaaaaaaaaaa',
] as const

export const CLOUD_PALETTE = {
  b: '#34446a',
  a: '#232f4d',
}

export const MOON_ART = [
  '...mmmm...',
  '..mmmmmm..',
  '.mmcmmmmm.',
  '.mmmmmmmm.',
  'mmmmmmmmmm',
  'mmmcmmmmmm',
  '.mmmmmmmc.',
  '.mmmmmmmm.',
  '..mmmmmm..',
  '...mmmm...',
] as const

export const MOON_PALETTE = {
  m: '#f2e7c9',
  c: '#d8c39a',
}

/* ---- Banner crown (11 x 7) ---- */

export const CROWN_ART = [
  'h...h...h..',
  'hh..hhh..hh',
  'hhhhhhhhhhh',
  'hhhhhhhhhhh',
  '.hhhhhhhhh.',
  '.hhhhhhhhh.',
  '..hhhhhhh..',
] as const

export const CROWN_PALETTE = {
  h: '#d9ad45',
}

/* ---- Candle flame (5 x 6) ---- */

export const FLAME_ART = [
  '..h..',
  '.hhh.',
  '.hoh.',
  '.hoh.',
  '.hhh.',
  '..h..',
] as const

export const FLAME_PALETTE = {
  h: '#ffae34',
  o: '#ff6b1a',
}

/* ---- CTA chevron (3 x 5) ---- */

export const CHEVRON_ART = [
  'm..',
  '.mm',
  '..m',
  '.mm',
  'm..',
] as const

/* ---- Mini board pieces (8 x 8 silhouettes) ---- */

export const MINI_PIECE_ART = {
  king: [
    '...pp...',
    '...pp...',
    '..pppp..',
    '.pppppp.',
    '.pppppp.',
    '..pppp..',
    '.pppppp.',
    'pppppppp',
  ],
  queen: [
    'p.p..p.p',
    'pp.p.p.p',
    '.pppppp.',
    '.pppppp.',
    '..pppp..',
    '..pppp..',
    '.pppppp.',
    'pppppppp',
  ],
  rook: [
    'pp.pp.pp',
    'pppppppp',
    '.pppppp.',
    '..pppp..',
    '..pppp..',
    '..pppp..',
    '.pppppp.',
    'pppppppp',
  ],
  bishop: [
    '...pp...',
    '..pppp..',
    '..p.pp..',
    '..pppp..',
    '...pp...',
    '..pppp..',
    '.pppppp.',
    'pppppppp',
  ],
  knight: [
    '....pp..',
    '..ppppp.',
    '.pppppp.',
    'pp.pppp.',
    '..pppp..',
    '...pp...',
    '..pppp..',
    '.pppppp.',
  ],
  pawn: [
    '...pp...',
    '..pppp..',
    '..pppp..',
    '...pp...',
    '..pppp..',
    '.pppppp.',
    '.pppppp.',
    'pppppppp',
  ],
} as const

export type MiniPieceType = keyof typeof MINI_PIECE_ART

export const MINI_WHITE_PIECE = { p: '#f2e7c9' }
export const MINI_WHITE_OUTLINE = '#6b4a16'
export const MINI_BLACK_PIECE = { p: '#1d2c42' }
export const MINI_BLACK_OUTLINE = '#0b0d12'

/* ---- Match setup icons ---- */

/** Book / rule scroll (16 x 11). */
export const ICON_RULE_ART = [
  '..mmmmmmmmmm....',
  '..mmmmmmmmmm....',
  '..mm......mm....',
  '..mm.mmmm.mm....',
  '..mm......mm....',
  '..mm.mmmm.mm....',
  '..mm......mm....',
  '..mm.mmm..mm....',
  '..mm......mm....',
  '..mmmmmmmmmm....',
  '..mmmmmmmmmm....',
] as const

/** Person bust (16 x 12). Color supplied per side. */
export const ICON_PLAYER_ART = [
  '.....mmmmmm.....',
  '....mmmmmmmm....',
  '....mmmmmmmm....',
  '....mmmmmmmm....',
  '.....mmmmmm.....',
  '......mmmm......',
  '....mmmmmmmm....',
  '...mmmmmmmmmm...',
  '..mmmmmmmmmmmm..',
  '..mmmmmmmmmmmm..',
  '.mmmmmmmmmmmmmm.',
  '.mmmmmmmmmmmmmm.',
] as const

/** Checker board (14 x 14). */
export const ICON_BOARD_ART = [
  'mmmmmmmmmmmmmm',
  'm...mmm...mmmm',
  'm...mmm...mmmm',
  'm...mmm...mmmm',
  'mmmm...mmm...m',
  'mmmm...mmm...m',
  'mmmm...mmm...m',
  'm...mmm...mmmm',
  'm...mmm...mmmm',
  'm...mmm...mmmm',
  'mmmm...mmm...m',
  'mmmm...mmm...m',
  'mmmm...mmm...m',
  'mmmmmmmmmmmmmm',
] as const

/** Artist palette with colored dabs (16 x 11). */
export const ICON_THEME_ART = [
  '.....mmmmmm.....',
  '...mmmmmmmmmm...',
  '..mmmrrmm.m.mm..',
  '.mmmm..mmm.mmm..',
  '.mmmggmmmmmm.m..',
  '.mmmmmmmmmmm.m..',
  '.mmbbmmmmmm.mm..',
  '.mmm.mmmmmmmm...',
  '..mmmmmmmmmmmm..',
  '...mmmmmmmmmm...',
  '.....mmmmmm.....',
] as const

export const ICON_THEME_PALETTE = {
  m: '#d9ad45',
  r: '#a8433c',
  g: '#4e8f78',
  b: '#3e5c8f',
}

/** Floppy disk (14 x 14). */
export const ICON_STORAGE_ART = [
  'mmmmmmmmmmm.m.',
  'm.........m.mm',
  'm.mmmmm.m.m.mm',
  'm.mmmmm.m...m.',
  'm.mmmmm.m...m.',
  'm.mmmmm.m...m.',
  'm.mmmmm.m...m.',
  'm.........m...',
  'm.mmmmmmm.m...',
  'm.m.....m.m...',
  'm.m..m..m.m...',
  'm.m.....m.m...',
  'm.mmmmmmm.m...',
  'mmmmmmmmmmmm..',
] as const

/** Back arrow (14 x 9). */
export const ICON_BACK_ART = [
  '......mm......',
  '.....mmmm.....',
  '....mmmmmm....',
  '..mmmmmmmmmm..',
  '.mmmmmmmmmmmm.',
  '..mmmmmmmmmm..',
  '....mmmmmm....',
  '.....mmmm.....',
  '......mm......',
] as const

/** Crossed swords (14 x 12). */
export const ICON_SWORDS_ART = [
  'm............m',
  'mm..........mm',
  '.mm........mm.',
  '..mm......mm..',
  '...mm....mm...',
  '....mm..mm....',
  '.....mmmm.....',
  '....mm..mm....',
  '...mm....mm...',
  '..mmm....mmm..',
  '.mmm......mmm.',
  '.mm........mm.',
] as const

/** Gear (14 x 14). */
export const ICON_GEAR_ART = [
  '.....mmmm.....',
  '.....mmmm.....',
  '.mm.mmmm.mm...',
  '.mmmmmmmmmm...',
  'mmmmmmmmmmmmmm',
  'mm.mmmmmmmm.mm',
  'mm.mm....mm.mm',
  'mm.mm....mm.mm',
  'mm.mmmmmmmm.mm',
  'mmmmmmmmmmmmmm',
  '.mmmmmmmmmm...',
  '.mm.mmmm.mm...',
  '.....mmmm.....',
  '.....mmmm.....',
] as const
