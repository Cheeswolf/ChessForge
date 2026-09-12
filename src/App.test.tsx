import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from './App'
import { defaultGameConfig } from './config/defaultGameConfig'
import { chessComTheme } from './plugins/themes/ChessComTheme'
import type {
  ThemePlugin,
  ThemeTokens,
} from './plugins/themes/ThemePlugin'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

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
