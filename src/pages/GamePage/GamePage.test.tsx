import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { createDefaultPluginRegistry } from '../../config/defaultPluginRegistry'
import { defaultMatchConfig } from '../../config/defaultGameConfig'
import { pixelForgeTheme } from '../../plugins/themes/PixelForgeTheme'
import type { PluginRegistry } from '../../core/PluginRegistry'
import type { MatchConfig } from '../../app/MatchConfig'
import type {
  ThemePlugin,
  ThemeTokens,
} from '../../plugins/themes/ThemePlugin'
import GamePage from './GamePage'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

interface RenderOptions {
  matchConfig?: Readonly<MatchConfig>
  registry?: PluginRegistry
  onExit?: () => void
}

function renderGamePage({
  matchConfig = Object.freeze({ ...defaultMatchConfig }),
  registry = createDefaultPluginRegistry(),
  onExit = () => undefined,
}: RenderOptions = {}) {
  return render(
    <GamePage matchConfig={matchConfig} registry={registry} onExit={onExit} />,
  )
}

test('creates a live game from the frozen match config', () => {
  renderGamePage()

  expect(screen.getByTestId('square-e2')).toBeInTheDocument()
  expect(screen.getByText('轮到白方')).toBeInTheDocument()
})

test('shows the active plugin loadout on demand', () => {
  renderGamePage()

  fireEvent.click(screen.getByRole('button', { name: '本局插件' }))

  expect(screen.getByText('Standard Chess')).toBeInTheDocument()
  expect(screen.getAllByText('Human')).toHaveLength(2)
  expect(screen.getByText('Pixel Board')).toBeInTheDocument()
  expect(screen.getByText('Pixel Forge')).toBeInTheDocument()
  expect(screen.getByText('Memory Session')).toBeInTheDocument()
})

test('exit button hands control back via onExit', () => {
  const onExit = vi.fn()
  renderGamePage({ onExit })

  fireEvent.click(screen.getByRole('button', { name: '退出对局' }))

  expect(onExit).toHaveBeenCalledTimes(1)
})

test('injects the configured theme as CSS variables', () => {
  const registry = createDefaultPluginRegistry()
  const testTheme: ThemePlugin = {
    id: 'test-theme',
    name: 'Test Theme',
    tokens: {
      ...pixelForgeTheme.tokens,
      lightSquare: 'rgb(1, 2, 3)',
    },
  }
  registry.registerTheme(testTheme)

  renderGamePage({
    registry,
    matchConfig: Object.freeze({ ...defaultMatchConfig, themeId: 'test-theme' }),
  })

  expect(
    document.documentElement.style.getPropertyValue('--light-square'),
  ).toBe('rgb(1, 2, 3)')
})

test('falls back to the Pixel Forge theme when the configured theme is broken', () => {
  const registry = createDefaultPluginRegistry()
  const brokenTheme: ThemePlugin = {
    id: 'broken-theme',
    name: 'Broken Theme',
    tokens: undefined as unknown as ThemeTokens,
  }
  registry.registerTheme(brokenTheme)

  renderGamePage({
    registry,
    matchConfig: Object.freeze({
      ...defaultMatchConfig,
      themeId: 'broken-theme',
    }),
  })

  expect(screen.getByTestId('square-e2')).toBeInTheDocument()
  expect(
    document.documentElement.style.getPropertyValue('--light-square'),
  ).toBe(pixelForgeTheme.tokens.lightSquare)
})
