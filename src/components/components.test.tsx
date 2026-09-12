import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import type { GameStatus as GameStatusModel, MoveRecord } from '../core/types'
import GameStatus from './GameStatus'
import MoveHistory from './MoveHistory'
import GameControls from './GameControls'
import GameLayout from './GameLayout'

const history: MoveRecord[] = [
  { from: 'e2', to: 'e4', san: 'e4', color: 'white' },
  { from: 'e7', to: 'e5', san: 'e5', color: 'black' },
  { from: 'g1', to: 'f3', san: 'Nf3', color: 'white' },
  { from: 'b8', to: 'c6', san: 'Nc6', color: 'black' },
]

function makeStatus(
  turn: GameStatusModel['turn'],
  inCheck = false,
): GameStatusModel {
  return { phase: 'playing', turn, inCheck }
}

test('displays the white turn', () => {
  render(<GameStatus status={makeStatus('white')} />)
  expect(screen.getByText('轮到白方')).toBeInTheDocument()
})

test('displays the black turn', () => {
  render(<GameStatus status={makeStatus('black')} />)
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

test('displays move history in "1. e4 e5" style', () => {
  render(<MoveHistory history={history} />)

  expect(screen.getByText('1.')).toBeInTheDocument()
  expect(screen.getByText('2.')).toBeInTheDocument()
  expect(screen.getByText('e4')).toBeInTheDocument()
  expect(screen.getByText('e5')).toBeInTheDocument()
  expect(screen.getByText('Nf3')).toBeInTheDocument()
  expect(screen.getByText('Nc6')).toBeInTheDocument()
})

test('shows an empty state when there are no moves', () => {
  render(<MoveHistory history={[]} />)
  expect(screen.getByText('No moves yet')).toBeInTheDocument()
})

test('renders an undo button', () => {
  render(<GameControls onUndo={() => {}} onReset={() => {}} />)
  expect(
    screen.getByRole('button', { name: '悔棋' }),
  ).toBeInTheDocument()
})

test('renders a restart button', () => {
  render(<GameControls onUndo={() => {}} onReset={() => {}} />)
  expect(
    screen.getByRole('button', { name: '重新开始' }),
  ).toBeInTheDocument()
})

test('undo and restart buttons invoke their handlers', () => {
  const onUndo = vi.fn()
  const onReset = vi.fn()

  render(<GameControls onUndo={onUndo} onReset={onReset} />)

  fireEvent.click(screen.getByRole('button', { name: '悔棋' }))
  fireEvent.click(screen.getByRole('button', { name: '重新开始' }))

  expect(onUndo).toHaveBeenCalledTimes(1)
  expect(onReset).toHaveBeenCalledTimes(1)
})

test('composes header, board and side panel', () => {
  render(
    <GameLayout
      header={<span>Test Header</span>}
      board={<div>Board</div>}
      status={makeStatus('white')}
      history={history}
      onUndo={() => {}}
      onReset={() => {}}
    />,
  )

  expect(screen.getByText('Test Header')).toBeInTheDocument()
  expect(screen.getByText('Board')).toBeInTheDocument()
  expect(screen.getByText('轮到白方')).toBeInTheDocument()
  expect(screen.getByText('e4')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: '悔棋' }),
  ).toBeInTheDocument()
})
