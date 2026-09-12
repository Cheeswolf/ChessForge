import type { GameConfig } from '../core/GameCore'
import { chessJsRulePlugin } from '../plugins/rules/ChessJsRulePlugin'
import { HumanPlayerPlugin } from '../plugins/players/HumanPlayerPlugin'
import { MemoryStoragePlugin } from '../plugins/storage/MemoryStoragePlugin'
import { chessComTheme } from '../plugins/themes/ChessComTheme'
import { defaultBoardPlugin } from '../plugins/board/DefaultBoardPlugin'
import type { ThemePlugin } from '../plugins/themes/ThemePlugin'
import type { BoardPlugin } from '../plugins/board/BoardPlugin'

/**
 * App-level config: a superset of GameConfig that additionally carries
 * the UI-only plugins (theme + board). `rules`, `players` and `storage`
 * are what GameCore consumes; the rest is resolved by PluginRegistry.
 */
export interface AppGameConfig extends GameConfig {
  theme: ThemePlugin
  board: BoardPlugin
}

export const defaultGameConfig: AppGameConfig = {
  rules: chessJsRulePlugin,

  players: {
    white: new HumanPlayerPlugin('white', 'White', 'white'),
    black: new HumanPlayerPlugin('black', 'Black', 'black'),
  },

  storage: new MemoryStoragePlugin(),

  theme: chessComTheme,

  board: defaultBoardPlugin,
}
