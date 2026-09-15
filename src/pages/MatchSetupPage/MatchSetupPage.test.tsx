import { fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { createDefaultPluginRegistry } from '../../config/defaultPluginRegistry'
import { defaultMatchConfig } from '../../config/defaultGameConfig'
import { pixelForgeTheme } from '../../plugins/themes/PixelForgeTheme'
import { chessJsRulePlugin } from '../../plugins/rules/ChessJsRulePlugin'
import MatchSetupPage from './MatchSetupPage'

const registry = createDefaultPluginRegistry()

test('renders six plugin selectors populated from the registry', () => {
  render(
    <MatchSetupPage
      config={defaultMatchConfig}
      registry={registry}
      onChange={() => undefined}
      onStart={() => undefined}
      onBack={() => undefined}
    />,
  )

  expect(screen.getByLabelText('Rule Plugin')).toHaveValue('chessjs-rule')
  expect(screen.getByLabelText('White Player')).toHaveValue('human-player')
  expect(screen.getByLabelText('Black Player')).toHaveValue('human-player')
  expect(screen.getByLabelText('Board Plugin')).toHaveValue('default-board')
  expect(screen.getByLabelText('Theme Plugin')).toHaveValue('pixel-forge-theme')
  expect(screen.getByLabelText('Storage Plugin')).toHaveValue('memory-storage')
})

test('selector options come from the registry, not hardcoded values', () => {
  const testRegistry = createDefaultPluginRegistry()
  testRegistry.registerTheme({
    id: 'test-theme',
    name: 'Test Theme',
    tokens: pixelForgeTheme.tokens,
  })

  render(
    <MatchSetupPage
      config={defaultMatchConfig}
      registry={testRegistry}
      onChange={() => undefined}
      onStart={() => undefined}
      onBack={() => undefined}
    />,
  )

  expect(screen.getByRole('option', { name: 'Test Theme' })).toBeInTheDocument()
})

test('changing a selector calls onChange with the updated config', () => {
  const onChange = vi.fn()
  const testRegistry = createDefaultPluginRegistry()
  testRegistry.registerRule({
    id: 'test-rule',
    name: 'Test Rule',
    createSession: () => chessJsRulePlugin.createSession(),
  })

  render(
    <MatchSetupPage
      config={defaultMatchConfig}
      registry={testRegistry}
      onChange={onChange}
      onStart={() => undefined}
      onBack={() => undefined}
    />,
  )

  fireEvent.change(screen.getByLabelText('Rule Plugin'), {
    target: { value: 'test-rule' },
  })

  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({ ruleId: 'test-rule' }),
  )
})

test('displays the current loadout with selected plugin names', () => {
  render(
    <MatchSetupPage
      config={defaultMatchConfig}
      registry={registry}
      onChange={() => undefined}
      onStart={() => undefined}
      onBack={() => undefined}
    />,
  )

  const loadout = screen.getByRole('region', { name: 'Current loadout' })
  expect(within(loadout).getByRole('heading', { name: 'CURRENT LOADOUT' })).toBeInTheDocument()
  expect(within(loadout).getByText('Standard Chess')).toBeInTheDocument()
  expect(within(loadout).getAllByText('Human')).toHaveLength(2)
  expect(within(loadout).getByText('Pixel Board')).toBeInTheDocument()
  expect(within(loadout).getByText('Pixel Forge')).toBeInTheDocument()
  expect(within(loadout).getByText('Memory Session')).toBeInTheDocument()
})

test('START MATCH is disabled when the config is invalid', () => {
  const onStart = vi.fn()

  render(
    <MatchSetupPage
      config={{ ...defaultMatchConfig, ruleId: 'missing-rule' }}
      registry={registry}
      onChange={() => undefined}
      onStart={onStart}
      onBack={() => undefined}
    />,
  )

  expect(screen.getByRole('button', { name: 'START MATCH' })).toBeDisabled()

  fireEvent.click(screen.getByRole('button', { name: 'START MATCH' }))

  expect(onStart).not.toHaveBeenCalled()
})

test('clicking START MATCH calls onStart with the current config', () => {
  const onStart = vi.fn()

  render(
    <MatchSetupPage
      config={defaultMatchConfig}
      registry={registry}
      onChange={() => undefined}
      onStart={onStart}
      onBack={() => undefined}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: 'START MATCH' }))

  expect(onStart).toHaveBeenCalledWith(defaultMatchConfig)
})

test('clicking back calls onBack', () => {
  const onBack = vi.fn()

  render(
    <MatchSetupPage
      config={defaultMatchConfig}
      registry={registry}
      onChange={() => undefined}
      onStart={() => undefined}
      onBack={onBack}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: '返回' }))

  expect(onBack).toHaveBeenCalled()
})
