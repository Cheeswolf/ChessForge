import type { Move } from '../../core/types'
import type { RuleSession } from './RulePlugin'
import { chessJsRulePlugin } from './ChessJsRulePlugin'

function play(session: RuleSession, moves: Move[]): void {
  for (const move of moves) {
    session.makeMove(move)
  }
}

test('creates standard initial chess state', () => {
  const session =
    chessJsRulePlugin.createSession()

  const state = session.getState()

  expect(state.status.turn).toBe('white')
  expect(state.board.e2).toEqual({
    color: 'white',
    type: 'pawn',
  })

  expect(state.board.e7).toEqual({
    color: 'black',
    type: 'pawn',
  })
})

test('returns e3 and e4 for pawn on e2', () => {
  const session =
    chessJsRulePlugin.createSession()

  const moves =
    session.getLegalMoves('e2')

  expect(moves).toEqual(
    expect.arrayContaining([
      { from: 'e2', to: 'e3' },
      { from: 'e2', to: 'e4' },
    ]),
  )
})

test('rejects illegal move', () => {
  const session =
    chessJsRulePlugin.createSession()

  expect(() =>
    session.makeMove({
      from: 'e2',
      to: 'e5',
    }),
  ).toThrow()
})

test('supports kingside castling', () => {
  const session =
    chessJsRulePlugin.createSession()

  play(session, [
    { from: 'g1', to: 'f3' },
    { from: 'a7', to: 'a6' },
    { from: 'e2', to: 'e4' },
    { from: 'a6', to: 'a5' },
    { from: 'f1', to: 'c4' },
    { from: 'a5', to: 'a4' },
    { from: 'e1', to: 'g1' },
  ])

  const state = session.getState()

  expect(state.board.g1).toEqual({
    color: 'white',
    type: 'king',
  })
  expect(state.board.f1).toEqual({
    color: 'white',
    type: 'rook',
  })
})

test('supports en passant capture', () => {
  const session =
    chessJsRulePlugin.createSession()

  play(session, [
    { from: 'e2', to: 'e4' },
    { from: 'a7', to: 'a6' },
    { from: 'e4', to: 'e5' },
    { from: 'd7', to: 'd5' },
    { from: 'e5', to: 'd6' },
  ])

  const state = session.getState()

  expect(state.board.d6).toEqual({
    color: 'white',
    type: 'pawn',
  })
  expect(state.board.d5).toBeUndefined()
})

test('supports pawn promotion', () => {
  const session =
    chessJsRulePlugin.createSession()

  play(session, [
    { from: 'h2', to: 'h4' },
    { from: 'g8', to: 'f6' },
    { from: 'h4', to: 'h5' },
    { from: 'f6', to: 'g8' },
    { from: 'h5', to: 'h6' },
    { from: 'g8', to: 'f6' },
    { from: 'h6', to: 'g7' },
    { from: 'f6', to: 'g8' },
  ])

  const legal = session.getLegalMoves('g7')
  expect(legal).toEqual(
    expect.arrayContaining([
      { from: 'g7', to: 'h8', promotion: 'queen' },
    ]),
  )

  session.makeMove({
    from: 'g7',
    to: 'h8',
    promotion: 'queen',
  })

  const state = session.getState()

  expect(state.board.h8).toEqual({
    color: 'white',
    type: 'queen',
  })
  expect(state.board.g7).toBeUndefined()
})

test('detects check', () => {
  const session =
    chessJsRulePlugin.createSession()

  play(session, [
    { from: 'e2', to: 'e4' },
    { from: 'd7', to: 'd5' },
    { from: 'f1', to: 'b5' },
  ])

  const state = session.getState()

  expect(state.status.inCheck).toBe(true)
  expect(state.status.phase).toBe('playing')
})

test('detects checkmate (Fools Mate)', () => {
  const session =
    chessJsRulePlugin.createSession()

  play(session, [
    { from: 'f2', to: 'f3' },
    { from: 'e7', to: 'e5' },
    { from: 'g2', to: 'g4' },
    { from: 'd8', to: 'h4' },
  ])

  const state = session.getState()

  expect(state.status.phase).toBe('checkmate')
  expect(state.status.winner).toBe('black')
  expect(state.status.turn).toBe('white')
  expect(state.status.inCheck).toBe(true)
})

test('detects draw by threefold repetition', () => {
  const session =
    chessJsRulePlugin.createSession()

  const cycle: Move[] = [
    { from: 'g1', to: 'f3' },
    { from: 'g8', to: 'f6' },
    { from: 'f3', to: 'g1' },
    { from: 'f6', to: 'g8' },
  ]

  for (let i = 0; i < 3; i++) {
    play(session, cycle)
  }

  const state = session.getState()

  expect(state.status.phase).toBe('draw')
  expect(state.status.reason).toBe('threefold repetition')
})

test('undo restores previous position', () => {
  const session =
    chessJsRulePlugin.createSession()

  session.makeMove({
    from: 'e2',
    to: 'e4',
  })

  session.undo()

  expect(session.getState().board.e2).toEqual({
    color: 'white',
    type: 'pawn',
  })
})

test('reset restores initial position', () => {
  const session =
    chessJsRulePlugin.createSession()

  play(session, [
    { from: 'e2', to: 'e4' },
    { from: 'd7', to: 'd5' },
  ])

  session.reset()

  const state = session.getState()

  expect(state.board.e2).toEqual({
    color: 'white',
    type: 'pawn',
  })
  expect(state.board.e4).toBeUndefined()
  expect(state.status.turn).toBe('white')
})
