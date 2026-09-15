import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import PromotionDialog from './PromotionDialog'

describe('PromotionDialog', () => {
  test('renders the PROMOTE PAWN dialog with pixel piece options', () => {
    render(<PromotionDialog color="white" onSelect={() => {}} />)

    expect(
      screen.getByRole('dialog', { name: 'PROMOTE PAWN' }),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Promote to queen').querySelector('[data-piece="white-queen"]'),
    ).not.toBeNull()
    expect(
      screen.getByLabelText('Promote to rook').querySelector('[data-piece="white-rook"]'),
    ).not.toBeNull()
    expect(
      screen.getByLabelText('Promote to bishop').querySelector('[data-piece="white-bishop"]'),
    ).not.toBeNull()
    expect(
      screen.getByLabelText('Promote to knight').querySelector('[data-piece="white-knight"]'),
    ).not.toBeNull()
  })

  test('black promotions use the black piece palette', () => {
    render(<PromotionDialog color="black" onSelect={() => {}} />)

    expect(
      screen.getByLabelText('Promote to queen').querySelector('[data-piece="black-queen"]'),
    ).not.toBeNull()
  })

  test('clicking an option selects its piece', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<PromotionDialog color="white" onSelect={onSelect} />)

    await user.click(screen.getByLabelText('Promote to queen'))
    await user.click(screen.getByLabelText('Promote to rook'))
    await user.click(screen.getByLabelText('Promote to bishop'))
    await user.click(screen.getByLabelText('Promote to knight'))

    expect(onSelect).toHaveBeenNthCalledWith(1, 'queen')
    expect(onSelect).toHaveBeenNthCalledWith(2, 'rook')
    expect(onSelect).toHaveBeenNthCalledWith(3, 'bishop')
    expect(onSelect).toHaveBeenNthCalledWith(4, 'knight')
  })

  test('calls onCancel via CANCEL when provided', async () => {
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

    await user.click(screen.getByRole('button', { name: 'CANCEL' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
