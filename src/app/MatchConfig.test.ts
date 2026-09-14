import { createDefaultPluginRegistry } from '../config/defaultPluginRegistry'
import { defaultMatchConfig } from '../config/defaultGameConfig'
import { resolveMatchConfig, validateMatchConfig } from './MatchConfig'

test('default match config resolves every required plugin', () => {
  const registry = createDefaultPluginRegistry()
  expect(validateMatchConfig(defaultMatchConfig, registry)).toEqual([])

  const resolved = resolveMatchConfig(defaultMatchConfig, registry)
  expect(resolved.rules.id).toBe('chessjs-rule')
  expect(resolved.players.white.color).toBe('white')
  expect(resolved.players.black.color).toBe('black')
  expect(resolved.board.id).toBe('default-board')
  expect(resolved.theme.id).toBe('pixel-forge-theme')
  expect(resolved.storage.id).toBe('memory-storage')
})

test('reports missing plugin ids without constructing a game', () => {
  const registry = createDefaultPluginRegistry()
  const errors = validateMatchConfig(
    { ...defaultMatchConfig, blackPlayerId: 'missing-player' },
    registry,
  )
  expect(errors).toEqual(['Black player plugin is unavailable: missing-player'])
})
