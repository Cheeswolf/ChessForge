import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import type { GameStatus } from '../core/types'
import GameResultDialog from './GameResultDialog'

function playing(): GameStatus {
  return { phase: 'playing', turn: 'white', inCheck: false }
}

function renderResult(overrides: Partial<Parameters<typeof GameResultDialog>[0]> = {}) {
  const props = {
    status: playing(),
    onPlayAgain: () => {},
    onViewHistory: () => {},
    onMainMenu: () => {},
    ...overrides,
  }
  render(<GameResultDialog {...props} />)
  return props
}

describe('GameResultDialog', () => {
  test('renders nothing while playing', () => {
    renderResult()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('shows the GAME OVER dialog with the checkmate result and all three actions', async () => {
    const user = userEvent.setup()
    const onPlayAgain = vi.fn()
    const onViewHistory = vi.fn()
    const onMainMenu = vi.fn()

    renderResult({
      status: {
        phase: 'checkmate',
        turn: 'white',
        inCheck: true,
        winner: 'black',
      },
      onPlayAgain,
      onViewHistory,
      onMainMenu,
    })

    expect(
      screen.getByRole('dialog', { name: 'GAME OVER' }),
    ).toBeInTheDocument()
    expect(screen.getByText('黑方获胜：将死')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'PLAY AGAIN' }))
    await user.click(screen.getByRole('button', { name: 'VIEW MOVES' }))
    await user.click(screen.getByRole('button', { name: 'MAIN MENU' }))

    expect(onPlayAgain).toHaveBeenCalledTimes(1)
    expect(onViewHistory).toHaveBeenCalledTimes(1)
    expect(onMainMenu).toHaveBeenCalledTimes(1)
  })

  test('shows the draw result', () => {
    renderResult({
      status: { phase: 'draw', turn: 'white', inCheck: false },
    })

    expect(screen.getByText('和棋')).toBeInTheDocument()
  })
})
