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
]

function makeStatus(
  turn: GameStatusModel['turn'],
): GameStatusModel {
  return { phase: 'playing', turn, inCheck: false }
}

test('displays the current turn', () => {
  render(<GameStatus status={makeStatus('white')} />)
  expect(screen.getByText('White to move')).toBeInTheDocument()
})

test('displays the black turn', () => {
  render(<GameStatus status={makeStatus('black')} />)
  expect(screen.getByText('Black to move')).toBeInTheDocument()
})

test('displays move history in "1. e4 e5" style', () => {
  render(<MoveHistory history={history} />)

  expect(screen.getByText('1.')).toBeInTheDocument()
  expect(screen.getByText('2.')).toBeInTheDocument()
  expect(screen.getByText('e4')).toBeInTheDocument()
  expect(screen.getByText('e5')).toBeInTheDocument()
  expect(screen.getByText('Nf3')).toBeInTheDocument()
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
  expect(screen.getByText('White to move')).toBeInTheDocument()
  expect(screen.getByText('e4')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: '悔棋' }),
  ).toBeInTheDocument()
})
