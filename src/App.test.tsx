import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'
import {
  defaultGameConfig,
  type AppGameConfig,
} from './config/defaultGameConfig'
import { HumanPlayerPlugin } from './plugins/players/HumanPlayerPlugin'
import { chessComTheme } from './plugins/themes/ChessComTheme'
import type {
  ThemePlugin,
  ThemeTokens,
} from './plugins/themes/ThemePlugin'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

/**
 * Fresh players per test keep the multi-move flows isolated: the module
 * level `defaultGameConfig` players are singletons, and a stale pending
 * request could otherwise leak across renders.
 */
function freshConfig(): AppGameConfig {
  return {
    ...defaultGameConfig,
    players: {
      white: new HumanPlayerPlugin('white', 'White', 'white'),
      black: new HumanPlayerPlugin('black', 'Black', 'black'),
    },
  }
}

test('renders application title', () => {
  render(<App />)
  expect(screen.getByText('Plugin Chess')).toBeInTheDocument()
})

test('renders the board and the initial turn status', () => {
  render(<App />)

  expect(screen.getByTestId('square-e2')).toBeInTheDocument()
  expect(screen.getByText('轮到白方')).toBeInTheDocument()
})

test('clicking e2 then e4 moves the white pawn', async () => {
  render(<App />)

  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))

  expect(await screen.findByText('轮到黑方')).toBeInTheDocument()
  expect(screen.getByTestId('square-e4')).toHaveTextContent('♙')
  expect(
    screen.getByTestId('square-e2').querySelector('.board-piece'),
  ).toBeNull()
  expect(screen.getByText('e4')).toBeInTheDocument()
})

test('injects a custom theme as CSS variables', () => {
  const testTheme: ThemePlugin = {
    id: 'test-theme',
    name: 'Test Theme',
    tokens: {
      ...chessComTheme.tokens,
      lightSquare: 'rgb(1, 2, 3)',
    },
  }

  render(<App config={{ ...defaultGameConfig, theme: testTheme }} />)

  expect(
    document.documentElement.style.getPropertyValue('--light-square'),
  ).toBe('rgb(1, 2, 3)')
})

test('falls back to the default theme when the configured theme is broken', () => {
  const brokenTheme: ThemePlugin = {
    id: 'broken-theme',
    name: 'Broken Theme',
    tokens: undefined as unknown as ThemeTokens,
  }

  render(<App config={{ ...defaultGameConfig, theme: brokenTheme }} />)

  expect(screen.getByTestId('square-e2')).toBeInTheDocument()
  expect(
    document.documentElement.style.getPropertyValue('--light-square'),
  ).toBe('#ebecd0')
})

test('main opening: 1. e4 e5 2. Nf3 Nc6 3. Bb5', async () => {
  render(<App config={freshConfig()} />)

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

  expect(screen.getByTestId('square-b5')).toHaveTextContent('♗')
  expect(screen.getByTestId('square-f3')).toHaveTextContent('♘')
  expect(screen.getByTestId('square-c6')).toHaveTextContent('♞')
  expect(screen.getByTestId('square-e4')).toHaveTextContent('♙')
  expect(screen.getByTestId('square-e5')).toHaveTextContent('♟')

  expect(screen.getByText('Bb5')).toBeInTheDocument()
  expect(screen.getByText('Nf3')).toBeInTheDocument()
  expect(screen.getByText('Nc6')).toBeInTheDocument()
  expect(screen.getByText('3.')).toBeInTheDocument()
})

test("fool's mate ends in checkmate with the result dialog", async () => {
  render(<App config={freshConfig()} />)

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
  render(<App config={freshConfig()} />)

  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))
  await screen.findByText('轮到黑方')

  fireEvent.click(screen.getByTestId('square-e7'))
  fireEvent.click(screen.getByTestId('square-e5'))
  await screen.findByText('轮到白方')

  fireEvent.click(screen.getByText('悔棋'))

  await screen.findByText('轮到黑方')

  expect(screen.getByTestId('square-e7')).toHaveTextContent('♟')
  expect(
    screen.getByTestId('square-e5').querySelector('.board-piece'),
  ).toBeNull()
  expect(screen.getByText('e4')).toBeInTheDocument()
  expect(screen.queryByText('e5')).toBeNull()
})

test('restart resets to the initial position', async () => {
  render(<App config={freshConfig()} />)

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
  expect(screen.getByTestId('square-e2')).toHaveTextContent('♙')
  expect(
    screen.getByTestId('square-e4').querySelector('.board-piece'),
  ).toBeNull()
})
