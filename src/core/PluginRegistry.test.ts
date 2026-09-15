import { PluginRegistry } from './PluginRegistry'
import { chessComTheme } from '../plugins/themes/ChessComTheme'
import { defaultBoardPlugin } from '../plugins/board/DefaultBoardPlugin'
import type { RulePlugin } from '../plugins/rules/RulePlugin'
import type {
  PlayerPluginDefinition,
  StoragePluginDefinition,
} from '../app/MatchConfig'

const rule: RulePlugin = {
  id: 'rule-a',
  name: 'Rule A',
  createSession: () => ({
    getState: () => {
      throw new Error('not used')
    },
    getLegalMoves: () => [],
    makeMove: () => {
      throw new Error('not used')
    },
    undo: () => {
      throw new Error('not used')
    },
    reset: () => {
      throw new Error('not used')
    },
  }),
}

const player: PlayerPluginDefinition = {
  id: 'human-player',
  name: 'Human',
  create: (color) => ({
    id: `human-${color}`,
    name: color === 'white' ? 'White' : 'Black',
    color,
    requestMove: async () => new Promise(() => undefined),
  }),
}

const storage: StoragePluginDefinition = {
  id: 'memory-storage',
  name: 'Memory Session',
  create: () => ({
    id: 'memory-instance',
    name: 'Memory Session',
    save: async () => undefined,
    load: async () => null,
    clear: async () => undefined,
  }),
}

test('registers and resolves a theme by id', () => {
  const registry = new PluginRegistry()

  registry.registerTheme(chessComTheme)

  expect(registry.getTheme('chesscom-theme')).toBe(chessComTheme)
})

test('registers and resolves a board by id', () => {
  const registry = new PluginRegistry()

  registry.registerBoard(defaultBoardPlugin)

  expect(registry.getBoard('default-board')).toBe(defaultBoardPlugin)
})

test('getTheme throws for an unknown id', () => {
  const registry = new PluginRegistry()

  expect(() => registry.getTheme('missing-theme')).toThrow()
})

test('getBoard throws for an unknown id', () => {
  const registry = new PluginRegistry()

  expect(() => registry.getBoard('missing-board')).toThrow()
})

test('enumerates registered plugin definitions by category', () => {
  const registry = new PluginRegistry()
  registry.registerRule(rule)
  registry.registerPlayer(player)
  registry.registerStorage(storage)

  expect(registry.getRulePlugins()).toEqual([rule])
  expect(registry.getPlayerPlugins()).toEqual([player])
  expect(registry.getStoragePlugins()).toEqual([storage])
})

test('throws when a requested rule, player or storage id is missing', () => {
  const registry = new PluginRegistry()
  expect(() => registry.getRule('missing')).toThrow(
    'Rule not registered: missing',
  )
  expect(() => registry.getPlayer('missing')).toThrow(
    'Player not registered: missing',
  )
  expect(() => registry.getStorage('missing')).toThrow(
    'Storage not registered: missing',
  )
})
