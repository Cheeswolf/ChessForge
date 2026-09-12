import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import PromotionDialog from './PromotionDialog'

describe('PromotionDialog', () => {
  test('clicking 升变为后 selects a queen', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<PromotionDialog color="white" onSelect={onSelect} />)

    await user.click(
      screen.getByRole('button', { name: '升变为后' }),
    )

    expect(onSelect).toHaveBeenCalledWith('queen')
  })

  test('each option reports its own piece', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<PromotionDialog color="black" onSelect={onSelect} />)

    await user.click(
      screen.getByRole('button', { name: '升变为车' }),
    )
    await user.click(
      screen.getByRole('button', { name: '升变为象' }),
    )
    await user.click(
      screen.getByRole('button', { name: '升变为马' }),
    )

    expect(onSelect).toHaveBeenNthCalledWith(1, 'rook')
    expect(onSelect).toHaveBeenNthCalledWith(2, 'bishop')
    expect(onSelect).toHaveBeenNthCalledWith(3, 'knight')
  })

  test('calls onCancel when provided', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onCancel = vi.fn()

    render(
      <PromotionDialog
        color="white"
        onSelect={onSelect}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: '取消' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
