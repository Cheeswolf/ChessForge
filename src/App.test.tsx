import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

/**
 * Product flow entry: the app opens on Home; every game-flow test enters
 * a live match through Quick Start (default plugin loadout).
 */
function startQuickGame() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: '快速开始' }))
}

test('renders the app shell starting on the home page', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'CHESSFORGE' })).toBeInTheDocument()
  expect(screen.queryByTestId('square-e2')).not.toBeInTheDocument()
})

test('quick start renders the board and the initial turn status', () => {
  startQuickGame()

  expect(screen.getByTestId('square-e2')).toBeInTheDocument()
  expect(screen.getByText('轮到白方')).toBeInTheDocument()
})

test('clicking e2 then e4 moves the white pawn', async () => {
  startQuickGame()

  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))

  expect(await screen.findByText('轮到黑方')).toBeInTheDocument()
  expect(
    screen.getByTestId('square-e4').querySelector('.board-piece'),
  ).not.toBeNull()
  expect(
    screen.getByTestId('square-e2').querySelector('.board-piece'),
  ).toBeNull()
  expect(screen.getByText('e4')).toBeInTheDocument()
})

test('main opening: 1. e4 e5 2. Nf3 Nc6 3. Bb5', async () => {
  startQuickGame()

  // 1. e4 e5
  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))
  await screen.findByText('轮到黑方')

  fireEvent.click(screen.getByTestId('square-e7'))
  fireEvent.click(screen.getByTestId('square-e5'))
  await screen.findByText('轮到白方')

  // 2. Nf3 Nc6
  fireEvent.click(screen.getByTestId('square-g1'))
  fireEvent.click(screen.getByTestId('square-f3'))
  await screen.findByText('轮到黑方')

  fireEvent.click(screen.getByTestId('square-b8'))
  fireEvent.click(screen.getByTestId('square-c6'))
  await screen.findByText('轮到白方')

  // 3. Bb5
  fireEvent.click(screen.getByTestId('square-f1'))
  fireEvent.click(screen.getByTestId('square-b5'))
  await screen.findByText('轮到黑方')

  for (const square of ['b5', 'f3', 'c6', 'e4', 'e5']) {
    expect(
      screen.getByTestId(`square-${square}`).querySelector('.board-piece'),
    ).not.toBeNull()
  }

  expect(screen.getByText('Bb5')).toBeInTheDocument()
  expect(screen.getByText('Nf3')).toBeInTheDocument()
  expect(screen.getByText('Nc6')).toBeInTheDocument()
  expect(screen.getByText('3.')).toBeInTheDocument()
})

test("fool's mate ends in checkmate with the result dialog", async () => {
  startQuickGame()

  // 1. f3 e5
  fireEvent.click(screen.getByTestId('square-f2'))
  fireEvent.click(screen.getByTestId('square-f3'))
  await screen.findByText('轮到黑方')

  fireEvent.click(screen.getByTestId('square-e7'))
  fireEvent.click(screen.getByTestId('square-e5'))
  await screen.findByText('轮到白方')

  // 2. g4 Qh4#
  fireEvent.click(screen.getByTestId('square-g2'))
  fireEvent.click(screen.getByTestId('square-g4'))
  await screen.findByText('轮到黑方')

  fireEvent.click(screen.getByTestId('square-d8'))
  fireEvent.click(screen.getByTestId('square-h4'))

  const dialog = await screen.findByRole('dialog', {
    name: '对局结束',
  })
  expect(dialog).toHaveTextContent('黑方获胜：将死')
  expect(screen.getByText('再来一局')).toBeInTheDocument()
  expect(screen.getByText('查看棋谱')).toBeInTheDocument()

  const resultLabels = await screen.findAllByText('黑方获胜：将死')
  expect(resultLabels).toHaveLength(2)
})

test('undo reverts the last move', async () => {
  startQuickGame()

  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))
  await screen.findByText('轮到黑方')

  fireEvent.click(screen.getByTestId('square-e7'))
  fireEvent.click(screen.getByTestId('square-e5'))
  await screen.findByText('轮到白方')

  fireEvent.click(screen.getByText('悔棋'))

  await screen.findByText('轮到黑方')

  expect(
    screen.getByTestId('square-e7').querySelector('.board-piece'),
  ).not.toBeNull()
  expect(
    screen.getByTestId('square-e5').querySelector('.board-piece'),
  ).toBeNull()
  expect(screen.getByText('e4')).toBeInTheDocument()
  expect(screen.queryByText('e5')).toBeNull()
})

test('restart resets to the initial position', async () => {
  startQuickGame()

  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))
  await screen.findByText('轮到黑方')

  fireEvent.click(screen.getByTestId('square-e7'))
  fireEvent.click(screen.getByTestId('square-e5'))
  await screen.findByText('轮到白方')

  fireEvent.click(screen.getByText('重新开始'))

  // `No moves yet` only appears once the reset has settled; the turn
  // text is already "轮到白方" before reset, so it cannot anchor the wait.
  await screen.findByText('No moves yet')

  expect(screen.getByText('轮到白方')).toBeInTheDocument()
  expect(
    screen.getByTestId('square-e2').querySelector('.board-piece'),
  ).not.toBeNull()
  expect(
    screen.getByTestId('square-e4').querySelector('.board-piece'),
  ).toBeNull()
})
