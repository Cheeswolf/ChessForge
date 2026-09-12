import { act, renderHook, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import type { GameState, Move } from '../core/types'
import { GameCore } from '../core/GameCore'
import { chessJsRulePlugin } from '../plugins/rules/ChessJsRulePlugin'
import { HumanPlayerPlugin } from '../plugins/players/HumanPlayerPlugin'
import { MemoryStoragePlugin } from '../plugins/storage/MemoryStoragePlugin'
import {
  needsPromotion,
  useGameCore,
  type UseGameCoreResult,
} from './useGameCore'

function makeCore(): GameCore {
  return new GameCore({
    rules: chessJsRulePlugin,
    players: {
      white: new HumanPlayerPlugin('human-white', 'Human White', 'white'),
      black: new HumanPlayerPlugin('human-black', 'Human Black', 'black'),
    },
    storage: new MemoryStoragePlugin(),
  })
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    fen: 'start',
    board: {},
    history: [],
    status: { phase: 'playing', turn: 'white', inCheck: false },
    ...overrides,
  }
}

async function play(
  result: { current: UseGameCoreResult },
  moves: Move[],
): Promise<void> {
  for (let i = 0; i < moves.length; i++) {
    act(() => result.current.move(moves[i]))
    await waitFor(() =>
      expect(result.current.state.history.length).toBe(i + 1),
    )
  }
}

describe('needsPromotion', () => {
  test('returns true when a pawn reaches the 8th rank', () => {
    expect(
      needsPromotion(
        { from: 'e7', to: 'e8' },
        makeState({ board: { e7: { color: 'white', type: 'pawn' } } }),
      ),
    ).toBe(true)
  })

  test('returns true when a pawn reaches the 1st rank', () => {
    expect(
      needsPromotion(
        { from: 'e2', to: 'e1' },
        makeState({ board: { e2: { color: 'black', type: 'pawn' } } }),
      ),
    ).toBe(true)
  })

  test('returns false for a pawn moving short of the last rank', () => {
    expect(
      needsPromotion(
        { from: 'e2', to: 'e3' },
        makeState({ board: { e2: { color: 'white', type: 'pawn' } } }),
      ),
    ).toBe(false)
  })

  test('returns false for a non-pawn piece', () => {
    expect(
      needsPromotion(
        { from: 'e7', to: 'e8' },
        makeState({ board: { e7: { color: 'white', type: 'knight' } } }),
      ),
    ).toBe(false)
  })

  test('returns false when the from square is empty', () => {
    expect(needsPromotion({ from: 'e7', to: 'e8' }, makeState())).toBe(
      false,
    )
  })
})

describe('useGameCore', () => {
  test('starts from the initial position', () => {
    const core = makeCore()
    const { result } = renderHook(() => useGameCore(core))

    expect(result.current.state.status.turn).toBe('white')
    expect(result.current.state.history).toEqual([])
    expect(result.current.pendingPromotion).toBeNull()
  })

  test('a legal move updates state, history and turn', async () => {
    const core = makeCore()
    const { result } = renderHook(() => useGameCore(core))

    act(() => result.current.move({ from: 'e2', to: 'e4' }))

    await waitFor(() =>
      expect(result.current.state.status.turn).toBe('black'),
    )
    expect(result.current.state.history).toHaveLength(1)
    expect(result.current.state.history[0].san).toBe('e4')
  })

  test('selectSquare exposes legal moves for the current side', () => {
    const core = makeCore()
    const { result } = renderHook(() => useGameCore(core))

    act(() => result.current.selectSquare('e2'))

    expect(result.current.selectedSquare).toBe('e2')
    expect(
      result.current.legalMoves.map((m) => m.to).sort(),
    ).toEqual(['e3', 'e4'])

    act(() => result.current.selectSquare('e7'))
    expect(result.current.selectedSquare).toBeUndefined()
    expect(result.current.legalMoves).toEqual([])
  })

  test('undo restores the previous position', async () => {
    const core = makeCore()
    const { result } = renderHook(() => useGameCore(core))

    act(() => result.current.move({ from: 'e2', to: 'e4' }))
    await waitFor(() =>
      expect(result.current.state.history).toHaveLength(1),
    )

    await act(async () => {
      await result.current.undo()
    })

    expect(result.current.state.history).toEqual([])
    expect(result.current.state.status.turn).toBe('white')
  })

  test('reset restores the initial position after several moves', async () => {
    const core = makeCore()
    const { result } = renderHook(() => useGameCore(core))

    await play(result, [
      { from: 'e2', to: 'e4' },
      { from: 'e7', to: 'e5' },
    ])
    expect(result.current.state.history).toHaveLength(2)

    await act(async () => {
      await result.current.reset()
    })

    expect(result.current.state.history).toEqual([])
    expect(result.current.state.status.turn).toBe('white')
    expect(result.current.pendingPromotion).toBeNull()
  })

  test('a checking move drives the check status', async () => {
    const core = makeCore()
    const { result } = renderHook(() => useGameCore(core))

    await play(result, [
      { from: 'e2', to: 'e4' },
      { from: 'e7', to: 'e5' },
      { from: 'd1', to: 'h5' },
      { from: 'g8', to: 'f6' },
      { from: 'h5', to: 'e5' }, // Qxe5+
    ])

    expect(result.current.state.status.inCheck).toBe(true)
    expect(result.current.state.status.turn).toBe('black')
    expect(result.current.state.status.phase).toBe('playing')
  })

  test("Fool's mate drives checkmate and the game end", async () => {
    const core = makeCore()
    const { result } = renderHook(() => useGameCore(core))

    await play(result, [
      { from: 'f2', to: 'f3' },
      { from: 'e7', to: 'e5' },
      { from: 'g2', to: 'g4' },
      { from: 'd8', to: 'h4' }, // Qh4#
    ])

    expect(result.current.state.status.phase).toBe('checkmate')
    expect(result.current.state.status.winner).toBe('black')
  })

  test('promotion flow: stashes the pending move until a piece is chosen', async () => {
    const core = makeCore()
    const { result } = renderHook(() => useGameCore(core))

    await play(result, [
      { from: 'f2', to: 'f4' },
      { from: 'a7', to: 'a6' },
      { from: 'f4', to: 'f5' },
      { from: 'a6', to: 'a5' },
      { from: 'f5', to: 'f6' },
      { from: 'a5', to: 'a4' },
      { from: 'f6', to: 'e7' }, // fxe7 — white pawn lands on e7
      { from: 'a4', to: 'a3' },
    ])

    expect(result.current.state.board.e7).toEqual({
      color: 'white',
      type: 'pawn',
    })

    act(() => result.current.move({ from: 'e7', to: 'd8' }))

    // Not submitted yet: the pending promotion is exposed instead.
    expect(result.current.pendingPromotion).toEqual({
      move: { from: 'e7', to: 'd8' },
      color: 'white',
    })
    expect(result.current.state.board.e7).toEqual({
      color: 'white',
      type: 'pawn',
    })

    act(() => result.current.selectPromotion('queen'))

    await waitFor(() =>
      expect(result.current.state.board.d8).toEqual({
        color: 'white',
        type: 'queen',
      }),
    )
    expect(result.current.state.board.e7).toBeUndefined()
    expect(result.current.pendingPromotion).toBeNull()
    expect(
      result.current.state.history[
        result.current.state.history.length - 1
      ].san,
    ).toMatch(/d8=Q/)
  })
})
