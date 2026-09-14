import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { createDefaultPluginRegistry } from '../../config/defaultPluginRegistry'
import { defaultMatchConfig } from '../../config/defaultGameConfig'
import { pixelForgeTheme } from '../../plugins/themes/PixelForgeTheme'
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

  render(
    <MatchSetupPage
      config={defaultMatchConfig}
      registry={registry}
      onChange={onChange}
      onStart={() => undefined}
      onBack={() => undefined}
    />,
  )

  fireEvent.change(screen.getByLabelText('Rule Plugin'), {
    target: { value: 'chessjs-rule' },
  })

  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({ ruleId: 'chessjs-rule' }),
  )
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
