import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import HomePage from './HomePage'

const UNICODE_CHESS_GLYPHS = /[♔♕♖♗♘♙♚♛♜♝♞♟]/

function renderHome() {
  const onStartSetup = vi.fn()
  const onQuickStart = vi.fn()
  render(<HomePage onStartSetup={onStartSetup} onQuickStart={onQuickStart} />)
  return { onStartSetup, onQuickStart }
}

describe('HomePage', () => {
  test('renders the brand and the two main actions', () => {
    renderHome()

    expect(
      screen.getByRole('heading', { name: 'CHESSFORGE' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '开始游戏' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '快速开始' }),
    ).toBeInTheDocument()
  })

  test('contains no unicode chess glyphs, not even in decoration', () => {
    const { container } = render(
      <HomePage onStartSetup={() => undefined} onQuickStart={() => undefined} />,
    )

    expect(container.textContent ?? '').not.toMatch(UNICODE_CHESS_GLYPHS)
  })

  test('menu buttons invoke the navigation callbacks', () => {
    const { onStartSetup, onQuickStart } = renderHome()

    fireEvent.click(screen.getByRole('button', { name: '开始游戏' }))
    expect(onStartSetup).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: '快速开始' }))
    expect(onQuickStart).toHaveBeenCalledTimes(1)
  })
})
