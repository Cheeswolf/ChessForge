export type Color = 'white' | 'black'

export type PieceType =
  | 'pawn'
  | 'knight'
  | 'bishop'
  | 'rook'
  | 'queen'
  | 'king'

export type PromotionPiece =
  | 'queen'
  | 'rook'
  | 'bishop'
  | 'knight'

export type FileLetter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'

export type RankNumber =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'

export type Square = `${FileLetter}${RankNumber}`

export interface Piece {
  color: Color
  type: PieceType
}

export type BoardPosition = Partial<Record<Square, Piece>>

export interface Move {
  from: Square
  to: Square
  promotion?: PromotionPiece
}

export interface MoveRecord extends Move {
  san: string
  color: Color
}

export type GamePhase =
  | 'playing'
  | 'checkmate'
  | 'draw'

export interface GameStatus {
  phase: GamePhase
  turn: Color
  inCheck: boolean
  winner?: Color
  reason?: string
}

export interface GameState {
  fen: string
  board: BoardPosition
  history: MoveRecord[]
  status: GameStatus
}

export interface Plugin {
  id: string
  name: string
}
