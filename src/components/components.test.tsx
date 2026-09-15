import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import type { GameStatus as GameStatusModel, MoveRecord } from '../core/types'
import GameStatus from './GameStatus'
import MoveHistory from './MoveHistory'
import GameControls from './GameControls'

const history: MoveRecord[] = [
  { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
  { from: 'e7', to: 'e5', san: 'e5', color: 'black' },
  { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
  { from: 'b8', to: 'c6', san: 'Nc6', color: 'black' },
  { from: 'f1', to: 'b5', san: 'Bb5', color: 'white' },
]

function makeStatus(
  turn: GameStatusModel['turn'],
  inCheck = false,
): GameStatusModel {
  return { phase: 'playing', turn, inCheck }
}

describe('GameStatus', () => {
  test('shows the current turn hierarchy for white', () => {
    render(<GameStatus status={makeStatus('white')} />)
    expect(screen.getByText('CURRENT TURN')).toBeInTheDocument()
    expect(screen.getByText('WHITE')).toBeInTheDocument()
    expect(screen.getByText('轮到白方')).toBeInTheDocument()
  })

  test('shows the black turn', () => {
    render(<GameStatus status={makeStatus('black')} />)
    expect(screen.getByText('BLACK')).toBeInTheDocument()
    expect(screen.getByText('轮到黑方')).toBeInTheDocument()
  })

  test('shows white in check', () => {
    render(<GameStatus status={makeStatus('white', true)} />)
    expect(screen.getByText('白方被将军')).toBeInTheDocument()
  })

  test('shows black in check', () => {
    render(<GameStatus status={makeStatus('black', true)} />)
    expect(screen.getByText('黑方被将军')).toBeInTheDocument()
  })

  test('shows a white checkmate win', () => {
    render(
      <GameStatus
        status={{
          phase: 'checkmate',
          turn: 'black',
          inCheck: true,
          winner: 'white',
        }}
      />,
    )
    expect(screen.getByText('GAME OVER')).toBeInTheDocument()
    expect(screen.getByText('白方获胜：将死')).toBeInTheDocument()
  })

  test('shows a black checkmate win', () => {
    render(
      <GameStatus
        status={{
          phase: 'checkmate',
          turn: 'white',
          inCheck: true,
          winner: 'black',
        }}
      />,
    )
    expect(screen.getByText('黑方获胜：将死')).toBeInTheDocument()
  })

  test('shows a draw', () => {
    render(
      <GameStatus
        status={{ phase: 'draw', turn: 'white', inCheck: false }}
      />,
    )
    expect(screen.getByText('和棋')).toBeInTheDocument()
  })
})

describe('MoveHistory', () => {
  test('renders the MOVE LOG with zero-padded numbered SAN rows', () => {
    render(<MoveHistory history={history} />)

    expect(screen.getByText('MOVE LOG')).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText('e4')).toBeInTheDocument()
    expect(screen.getByText('e5')).toBeInTheDocument()
    expect(screen.getByText('Nf3')).toBeInTheDocument()
    expect(screen.getByText('Nc6')).toBeInTheDocument()
    expect(screen.getByText('Bb5')).toBeInTheDocument()
    // Odd row: missing black move renders as an em dash placeholder.
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  test('shows an empty state when there are no moves', () => {
    render(<MoveHistory history={[]} />)
    expect(screen.getByText('NO MOVES YET')).toBeInTheDocument()
  })
})

describe('GameControls', () => {
  test('renders UNDO and RESTART buttons', () => {
    render(<GameControls onUndo={() => {}} onReset={() => {}} />)
    expect(screen.getByRole('button', { name: 'UNDO' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'RESTART' })).toBeInTheDocument()
  })

  test('undo and restart buttons invoke their handlers', () => {
    const onUndo = vi.fn()
    const onReset = vi.fn()

    render(<GameControls onUndo={onUndo} onReset={onReset} />)

    fireEvent.click(screen.getByRole('button', { name: 'UNDO' }))
    fireEvent.click(screen.getByRole('button', { name: 'RESTART' }))

    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  test('supports the optional disabled state', () => {
    render(<GameControls onUndo={() => {}} onReset={() => {}} disabled />)
    expect(screen.getByRole('button', { name: 'UNDO' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'RESTART' })).toBeDisabled()
  })
})
