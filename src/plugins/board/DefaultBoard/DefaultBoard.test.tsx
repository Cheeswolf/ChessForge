import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import type { BoardPluginProps } from '../BoardPlugin'
import { defaultBoardPlugin } from '../DefaultBoardPlugin'
import DefaultBoard from './DefaultBoard'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

function renderBoard(overrides: Partial<BoardPluginProps> = {}) {
  const onSquareSelect = vi.fn()
  const onMove = vi.fn()

  const props: BoardPluginProps = {
    position: {},
    status: { phase: 'playing', turn: 'white', inCheck: false },
    selectedSquare: undefined,
    legalMoves: [],
    lastMove: undefined,
    onSquareSelect,
    onMove,
    ...overrides,
  }

  render(<DefaultBoard {...props} />)

  return { onSquareSelect, onMove }
}

describe('DefaultBoard', () => {
  test('renders all 64 squares with a data-testid', () => {
    renderBoard()

    for (const rank of RANKS) {
      for (const file of FILES) {
        expect(
          screen.getByTestId(`square-${file}${rank}`),
        ).toBeInTheDocument()
      }
    }
  })

  test('renders pixel pieces from the position', () => {
    renderBoard({
      position: {
        e1: { color: 'white', type: 'king' },
        e2: { color: 'white', type: 'pawn' },
        e7: { color: 'black', type: 'pawn' },
      },
    })

    expect(
      screen.getByTestId('square-e1').querySelector('[data-piece="white-king"]'),
    ).not.toBeNull()
    expect(
      screen.getByTestId('square-e2').querySelector('[data-piece="white-pawn"]'),
    ).not.toBeNull()
    expect(
      screen.getByTestId('square-e7').querySelector('[data-piece="black-pawn"]'),
    ).not.toBeNull()
  })

  test('calls onSquareSelect when clicking a square', async () => {
    const user = userEvent.setup()
    const { onSquareSelect } = renderBoard({
      position: { e2: { color: 'white', type: 'pawn' } },
    })

    await user.click(screen.getByTestId('square-e2'))

    expect(onSquareSelect).toHaveBeenCalledWith('e2')
  })

  test('shows file and rank coordinates on the outer frame only', () => {
    renderBoard()

    expect(screen.getByTestId('file-label-a')).toHaveTextContent('a')
    expect(screen.getByTestId('file-label-h')).toHaveTextContent('h')
    expect(screen.getByTestId('rank-label-8')).toHaveTextContent('8')
    expect(screen.getByTestId('rank-label-1')).toHaveTextContent('1')
    // Squares themselves never carry algebraic coordinate text.
    expect(screen.getByTestId('square-e4')).not.toHaveTextContent('e4')
  })

  test('uses distinct markers for quiet moves and captures', () => {
    renderBoard({
      position: {
        e2: { color: 'white', type: 'pawn' },
        d5: { color: 'black', type: 'pawn' },
      },
      selectedSquare: 'e2',
      legalMoves: [
        { from: 'e2', to: 'e4' },
        { from: 'e2', to: 'd5' },
      ],
    })

    expect(
      screen.getByTestId('square-e4').querySelector('.legal-marker--move'),
    ).not.toBeNull()
    expect(
      screen.getByTestId('square-e4').querySelector('.legal-marker--capture'),
    ).toBeNull()
    expect(
      screen.getByTestId('square-d5').querySelector('.legal-marker--capture'),
    ).not.toBeNull()
    expect(
      screen.getByTestId('square-d5').querySelector('.legal-marker--move'),
    ).toBeNull()
  })

  test('shows a legal marker on each legal target', () => {
    renderBoard({
      position: { e2: { color: 'white', type: 'pawn' } },
      selectedSquare: 'e2',
      legalMoves: [
        { from: 'e2', to: 'e3' },
        { from: 'e2', to: 'e4' },
      ],
    })

    expect(
      screen.getByTestId('square-e3').querySelector('.legal-marker'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('square-e4').querySelector('.legal-marker'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('square-e5').querySelector('.legal-marker'),
    ).toBeNull()
  })

  test('marks the selected square', () => {
    renderBoard({
      position: { e2: { color: 'white', type: 'pawn' } },
      selectedSquare: 'e2',
    })

    expect(
      screen.getByTestId('square-e2'),
    ).toHaveClass('square--selected')
  })

  test('clicking a legal target emits onMove', async () => {
    const user = userEvent.setup()
    const { onMove, onSquareSelect } = renderBoard({
      position: { e2: { color: 'white', type: 'pawn' } },
      selectedSquare: 'e2',
      legalMoves: [
        { from: 'e2', to: 'e3' },
        { from: 'e2', to: 'e4' },
      ],
    })

    await user.click(screen.getByTestId('square-e4'))

    expect(onMove).toHaveBeenCalledWith({ from: 'e2', to: 'e4' })
    expect(onSquareSelect).not.toHaveBeenCalled()
  })

  test('clicking a non-legal square while selected emits onSquareSelect', async () => {
    const user = userEvent.setup()
    const { onMove, onSquareSelect } = renderBoard({
      position: { e2: { color: 'white', type: 'pawn' } },
      selectedSquare: 'e2',
      legalMoves: [{ from: 'e2', to: 'e4' }],
    })

    await user.click(screen.getByTestId('square-e5'))

    expect(onSquareSelect).toHaveBeenCalledWith('e5')
    expect(onMove).not.toHaveBeenCalled()
  })

  test('drags a piece from e2 to e4 via pointer events', () => {
    const { onMove } = renderBoard({
      position: { e2: { color: 'white', type: 'pawn' } },
    })

    fireEvent.pointerDown(screen.getByTestId('square-e2'))
    fireEvent.pointerMove(screen.getByTestId('square-e4'))
    fireEvent.pointerUp(screen.getByTestId('square-e4'))

    expect(onMove).toHaveBeenCalledWith({ from: 'e2', to: 'e4' })
  })

  test('illegal drag does not mutate position (piece snaps back)', () => {
    const { onMove } = renderBoard({
      position: { e2: { color: 'white', type: 'pawn' } },
    })

    fireEvent.pointerDown(screen.getByTestId('square-e2'))
    fireEvent.pointerUp(screen.getByTestId('square-e5'))

    expect(onMove).toHaveBeenCalledWith({ from: 'e2', to: 'e5' })
    // The canonical position prop is unchanged, so the pawn is still
    // rendered on e2 and not on e5.
    expect(
      screen.getByTestId('square-e2').querySelector('[data-piece="white-pawn"]'),
    ).not.toBeNull()
    expect(
      screen.getByTestId('square-e5').querySelector('[data-piece]'),
    ).toBeNull()
  })

  test('highlights the from and to squares of the last move', () => {
    renderBoard({
      position: { e4: { color: 'white', type: 'pawn' } },
      lastMove: { from: 'e2', to: 'e4' },
    })

    expect(screen.getByTestId('square-e2')).toHaveClass(
      'square--previous',
    )
    expect(screen.getByTestId('square-e4')).toHaveClass(
      'square--previous',
    )
  })

  test('highlights the checked king square', () => {
    renderBoard({
      position: { e1: { color: 'white', type: 'king' } },
      status: { phase: 'playing', turn: 'white', inCheck: true },
    })

    expect(
      screen.getByTestId('square-e1').querySelector('.check-marker'),
    ).toBeInTheDocument()
  })
})

describe('defaultBoardPlugin', () => {
  test('keeps the stable id and exposes the Pixel Board name', () => {
    expect(defaultBoardPlugin.id).toBe('default-board')
    expect(defaultBoardPlugin.name).toBe('Pixel Board')
    expect(defaultBoardPlugin.Component).toBeTruthy()
  })
})
