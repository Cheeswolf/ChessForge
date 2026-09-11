import { Chess } from 'chess.js'
import type {
  BoardPosition,
  Color,
  GameState,
  Move,
  MoveRecord,
  PieceType,
  PromotionPiece,
  Square,
} from '../../core/types'
import type { RulePlugin, RuleSession } from './RulePlugin'

type ChessColor = 'w' | 'b'
type ChessPieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
type ChessPromotionSymbol = 'q' | 'r' | 'b' | 'n'

const SYMBOL_TO_PIECE_TYPE: Record<ChessPieceSymbol, PieceType> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

const CHESS_TO_COLOR: Record<ChessColor, Color> = {
  w: 'white',
  b: 'black',
}

const PROMOTION_TO_SYMBOL: Record<
  PromotionPiece,
  ChessPromotionSymbol
> = {
  queen: 'q',
  rook: 'r',
  bishop: 'b',
  knight: 'n',
}

const SYMBOL_TO_PROMOTION: Record<
  ChessPromotionSymbol,
  PromotionPiece
> = {
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
}

function toPromotion(
  symbol: string | undefined,
): PromotionPiece | undefined {
  if (
    symbol === 'q' ||
    symbol === 'r' ||
    symbol === 'b' ||
    symbol === 'n'
  ) {
    return SYMBOL_TO_PROMOTION[symbol]
  }
  return undefined
}

function opposite(color: Color): Color {
  return color === 'white' ? 'black' : 'white'
}

function buildBoard(chess: Chess): BoardPosition {
  const board: BoardPosition = {}

  for (const rank of chess.board()) {
    for (const cell of rank) {
      if (!cell) continue
      board[cell.square] = {
        color: CHESS_TO_COLOR[cell.color],
        type: SYMBOL_TO_PIECE_TYPE[cell.type],
      }
    }
  }

  return board
}

function buildHistory(chess: Chess): MoveRecord[] {
  return chess.history({ verbose: true }).map((move) => {
    const record: MoveRecord = {
      from: move.from,
      to: move.to,
      san: move.san,
      color: CHESS_TO_COLOR[move.color],
    }

    if (move.promotion) {
      record.promotion = toPromotion(move.promotion)
    }

    return record
  })
}

function drawReason(chess: Chess): string {
  if (chess.isStalemate()) return 'stalemate'
  if (chess.isThreefoldRepetition()) return 'threefold repetition'
  if (chess.isInsufficientMaterial()) return 'insufficient material'
  if (chess.isDrawByFiftyMoves()) return 'fifty-move rule'
  return 'draw'
}

function buildStatus(
  chess: Chess,
): GameState['status'] {
  const turn = CHESS_TO_COLOR[chess.turn()]
  const inCheck = chess.inCheck()

  if (chess.isCheckmate()) {
    return {
      phase: 'checkmate',
      turn,
      inCheck,
      winner: opposite(turn),
      reason: 'checkmate',
    }
  }

  if (chess.isDraw()) {
    return {
      phase: 'draw',
      turn,
      inCheck,
      reason: drawReason(chess),
    }
  }

  return {
    phase: 'playing',
    turn,
    inCheck,
  }
}

function buildState(chess: Chess): GameState {
  return {
    fen: chess.fen(),
    board: buildBoard(chess),
    history: buildHistory(chess),
    status: buildStatus(chess),
  }
}

class ChessJsRuleSession implements RuleSession {
  private chess = new Chess()

  getState(): GameState {
    return buildState(this.chess)
  }

  getLegalMoves(square: Square): Move[] {
    return this.chess
      .moves({ square, verbose: true })
      .map((move) => {
        const result: Move = {
          from: move.from,
          to: move.to,
        }

        if (move.promotion) {
          result.promotion = toPromotion(move.promotion)
        }

        return result
      })
  }

  makeMove(move: Move): GameState {
    try {
      this.chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion
          ? PROMOTION_TO_SYMBOL[move.promotion]
          : undefined,
      })
    } catch {
      throw new Error(
        `Illegal move: ${move.from} to ${move.to}`,
      )
    }

    return this.getState()
  }

  undo(): GameState {
    this.chess.undo()
    return this.getState()
  }

  reset(): GameState {
    this.chess.reset()
    return this.getState()
  }
}

export const chessJsRulePlugin: RulePlugin = {
  id: 'chessjs-rule',
  name: 'Chess.js Rule Plugin',
  createSession: () => new ChessJsRuleSession(),
}
