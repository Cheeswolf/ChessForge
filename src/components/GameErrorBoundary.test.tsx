import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import GameErrorBoundary from './GameErrorBoundary'

function Exploding(): never {
  throw new Error('boom')
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('renders children when nothing throws', () => {
  render(
    <GameErrorBoundary>
      <span>board ok</span>
    </GameErrorBoundary>,
  )

  expect(screen.getByText('board ok')).toBeInTheDocument()
})

test('catches a crashing child and renders the fallback while the rest of the tree survives', () => {
  render(
    <div>
      <GameErrorBoundary>
        <Exploding />
      </GameErrorBoundary>
      <span>outside survives</span>
    </div>,
  )

  expect(screen.getByRole('alert')).toHaveClass('pixel-error-panel')
  expect(screen.getByText('BOARD MODULE ERROR')).toBeInTheDocument()
  expect(screen.getByText('棋盘加载失败，请重新开始游戏')).toBeInTheDocument()
  expect(screen.getByText('outside survives')).toBeInTheDocument()
})
