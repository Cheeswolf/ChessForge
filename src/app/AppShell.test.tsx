import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import AppShell from './AppShell'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

test('starts on the home page and does not auto-start a match', () => {
  render(<AppShell />)

  expect(screen.getByRole('heading', { name: 'CHESSFORGE' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '开始游戏' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '快速开始' })).toBeInTheDocument()
  expect(screen.queryByTestId('square-e2')).not.toBeInTheDocument()
})

test('clicking "开始游戏" navigates to the match setup page', () => {
  render(<AppShell />)

  fireEvent.click(screen.getByRole('button', { name: '开始游戏' }))

  expect(screen.getByRole('heading', { name: 'MATCH SETUP' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: '配置本局插件' })).toBeInTheDocument()
})

test('match setup flow: start setup and launch a match', () => {
  render(<AppShell />)

  fireEvent.click(screen.getByRole('button', { name: '开始游戏' }))
  expect(screen.getByRole('heading', { name: '配置本局插件' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'START MATCH' }))
  expect(screen.getByTestId('game-page-placeholder')).toBeInTheDocument()
})

test('clicking "快速开始" jumps straight to the game placeholder', () => {
  render(<AppShell />)

  fireEvent.click(screen.getByRole('button', { name: '快速开始' }))

  expect(screen.getByTestId('game-page-placeholder')).toHaveTextContent('GAME')
})
