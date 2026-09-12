import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import type { GameStatus } from '../core/types'
import GameResultDialog from './GameResultDialog'

function playing(): GameStatus {
  return { phase: 'playing', turn: 'white', inCheck: false }
}

describe('GameResultDialog', () => {
  test('renders nothing while playing', () => {
    render(
      <GameResultDialog
        status={playing()}
        onReset={() => {}}
        onViewHistory={() => {}}
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('shows the checkmate result and wires both actions', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    const onViewHistory = vi.fn()

    render(
      <GameResultDialog
        status={{
          phase: 'checkmate',
          turn: 'white',
          inCheck: true,
          winner: 'black',
        }}
        onReset={onReset}
        onViewHistory={onViewHistory}
      />,
    )

    expect(screen.getByText('黑方获胜：将死')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '再来一局' }))
    await user.click(screen.getByRole('button', { name: '查看棋谱' }))

    expect(onReset).toHaveBeenCalledTimes(1)
    expect(onViewHistory).toHaveBeenCalledTimes(1)
  })

  test('shows the draw result', () => {
    render(
      <GameResultDialog
        status={{ phase: 'draw', turn: 'white', inCheck: false }}
        onReset={() => {}}
        onViewHistory={() => {}}
      />,
    )

    expect(screen.getByText('和棋')).toBeInTheDocument()
  })
})
