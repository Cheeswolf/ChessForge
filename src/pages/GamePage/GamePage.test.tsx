import { fireEvent, render, screen, within } from '@testing-library/react'
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

test('shows the Pixel Forge top bar with plugin chips', () => {
  renderGamePage()

  expect(screen.getByText('MATCH · PIXEL FORGE LOADOUT')).toBeInTheDocument()

  const chips = screen.getByTestId('plugin-chips')
  expect(within(chips).getByText('Standard Chess')).toBeInTheDocument()
  expect(within(chips).getByText('Pixel Board')).toBeInTheDocument()
  expect(within(chips).getByText('Pixel Forge')).toBeInTheDocument()
  expect(within(chips).getByText('Memory Session')).toBeInTheDocument()
})

test('player bars frame the board and mark the side to move', async () => {
  renderGamePage()

  expect(screen.getByTestId('player-bar-white')).toHaveClass(
    'player-bar--active',
  )
  expect(screen.getByTestId('player-bar-black')).not.toHaveClass(
    'player-bar--active',
  )

  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))
  await screen.findByText('轮到黑方')

  expect(screen.getByTestId('player-bar-black')).toHaveClass(
    'player-bar--active',
  )
  expect(screen.getByTestId('player-bar-white')).not.toHaveClass(
    'player-bar--active',
  )
})

test('shows the match info panel in the HUD', () => {
  renderGamePage()

  const info = screen.getByTestId('match-info')
  expect(within(info).getByText('对局信息')).toBeInTheDocument()
  expect(within(info).getByText('Standard Chess')).toBeInTheDocument()
  expect(within(info).getAllByText('Human')).toHaveLength(2)
  expect(within(info).getByText('Pixel Board')).toBeInTheDocument()
  expect(within(info).getByText('Pixel Forge')).toBeInTheDocument()
  expect(within(info).getByText('Memory Session')).toBeInTheDocument()
})

test('wizard NPC greets the player at game start', () => {
  renderGamePage()

  expect(screen.getByTestId('wizard-guide')).toBeInTheDocument()
  expect(screen.getByText(/让我们开始吧/)).toBeInTheDocument()
})

test('shows the active plugin loadout on demand', () => {
  renderGamePage()

  fireEvent.click(screen.getByRole('button', { name: '本局插件' }))

  const panel = screen.getByTestId('loadout-panel')
  expect(within(panel).getByText('CURRENT LOADOUT')).toBeInTheDocument()
  expect(within(panel).getByText('Standard Chess')).toBeInTheDocument()
  expect(within(panel).getAllByText('Human')).toHaveLength(2)
  expect(within(panel).getByText('Pixel Board')).toBeInTheDocument()
  expect(within(panel).getByText('Pixel Forge')).toBeInTheDocument()
  expect(within(panel).getByText('Memory Session')).toBeInTheDocument()
})

test('exit button hands control back via onExit when no moves were played', () => {
  const onExit = vi.fn()
  renderGamePage({ onExit })

  fireEvent.click(screen.getByRole('button', { name: '退出对局' }))

  expect(onExit).toHaveBeenCalledTimes(1)
})

test('exit after a move asks for confirmation before leaving', async () => {
  const onExit = vi.fn()
  renderGamePage({ onExit })

  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))
  await screen.findAllByText('BLACK')

  fireEvent.click(screen.getByRole('button', { name: '退出对局' }))

  expect(
    screen.getByRole('dialog', { name: '退出当前对局？' }),
  ).toBeInTheDocument()
  expect(onExit).not.toHaveBeenCalled()

  fireEvent.click(screen.getByRole('button', { name: '确认退出' }))

  expect(onExit).toHaveBeenCalledTimes(1)
})

test('continuing the match closes the exit confirmation', async () => {
  const onExit = vi.fn()
  renderGamePage({ onExit })

  fireEvent.click(screen.getByTestId('square-e2'))
  fireEvent.click(screen.getByTestId('square-e4'))
  await screen.findAllByText('BLACK')

  fireEvent.click(screen.getByRole('button', { name: '退出对局' }))
  fireEvent.click(screen.getByRole('button', { name: '继续对局' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(onExit).not.toHaveBeenCalled()
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
