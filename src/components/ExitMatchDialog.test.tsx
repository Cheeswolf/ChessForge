import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import ExitMatchDialog from './ExitMatchDialog'

describe('ExitMatchDialog', () => {
  test('renders nothing when closed', () => {
    render(
      <ExitMatchDialog open={false} onContinue={() => {}} onExit={() => {}} />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('asks 退出当前对局？ and wires continue / exit', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    const onExit = vi.fn()

    render(
      <ExitMatchDialog open={true} onContinue={onContinue} onExit={onExit} />,
    )

    expect(
      screen.getByRole('dialog', { name: '退出当前对局？' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '继续对局' }))
    expect(onContinue).toHaveBeenCalledTimes(1)
    expect(onExit).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '确认退出' }))
    expect(onExit).toHaveBeenCalledTimes(1)
  })
})
