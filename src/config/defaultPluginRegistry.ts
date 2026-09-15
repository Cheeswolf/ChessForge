import { PluginRegistry } from '../core/PluginRegistry'
import { chessJsRulePlugin } from '../plugins/rules/ChessJsRulePlugin'
import { HumanPlayerPlugin } from '../plugins/players/HumanPlayerPlugin'
import { MemoryStoragePlugin } from '../plugins/storage/MemoryStoragePlugin'
import { defaultBoardPlugin } from '../plugins/board/DefaultBoardPlugin'
import { pixelForgeTheme } from '../plugins/themes/PixelForgeTheme'
import type { PlayerPluginDefinition, StoragePluginDefinition } from '../app/MatchConfig'
import type { RulePlugin } from '../plugins/rules/RulePlugin'
import type { BoardPlugin } from '../plugins/board/BoardPlugin'

const standardChessRulePlugin: RulePlugin = {
  id: 'chessjs-rule',
  name: 'Standard Chess',
  createSession: () => chessJsRulePlugin.createSession(),
}

const humanPlayerDefinition: PlayerPluginDefinition = {
  id: 'human-player',
  name: 'Human',
  create: (color) => new HumanPlayerPlugin(
    `human-${color}`,
    color === 'white' ? 'White' : 'Black',
    color,
  ),
}

const memoryStorageDefinition: StoragePluginDefinition = {
  id: 'memory-storage',
  name: 'Memory Session',
  create: () => new MemoryStoragePlugin(),
}

const pixelBoardPlugin: BoardPlugin = {
  id: 'default-board',
  name: 'Pixel Board',
  Component: defaultBoardPlugin.Component,
}

export function createDefaultPluginRegistry(): PluginRegistry {
  const registry = new PluginRegistry()
  registry.registerRule(standardChessRulePlugin)
  registry.registerPlayer(humanPlayerDefinition)
  registry.registerStorage(memoryStorageDefinition)
  registry.registerBoard(pixelBoardPlugin)
  registry.registerTheme(pixelForgeTheme)
  return registry
}
