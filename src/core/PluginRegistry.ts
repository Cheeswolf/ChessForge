import type { ThemePlugin } from '../plugins/themes/ThemePlugin'
import type { BoardPlugin } from '../plugins/board/BoardPlugin'
import type { RulePlugin } from '../plugins/rules/RulePlugin'
import type {
  PlayerPluginDefinition,
  StoragePluginDefinition,
} from '../app/MatchConfig'

/**
 * Central place to register and resolve plugins across all five categories
 * (rule, player, board, theme, storage). Keeps plugin instances from being
 * created ad-hoc inside React files; the app registers its configured
 * plugins here and resolves them back by id so the wiring is explicit
 * rather than decorative.
 */
export class PluginRegistry {
  private readonly rules = new Map<string, RulePlugin>()
  private readonly players = new Map<string, PlayerPluginDefinition>()
  private readonly boards = new Map<string, BoardPlugin>()
  private readonly themes = new Map<string, ThemePlugin>()
  private readonly storages = new Map<string, StoragePluginDefinition>()

  registerRule(plugin: RulePlugin): void {
    this.rules.set(plugin.id, plugin)
  }

  registerPlayer(plugin: PlayerPluginDefinition): void {
    this.players.set(plugin.id, plugin)
  }

  registerBoard(plugin: BoardPlugin): void {
    this.boards.set(plugin.id, plugin)
  }

  registerTheme(plugin: ThemePlugin): void {
    this.themes.set(plugin.id, plugin)
  }

  registerStorage(plugin: StoragePluginDefinition): void {
    this.storages.set(plugin.id, plugin)
  }

  getRule(id: string): RulePlugin {
    const rule = this.rules.get(id)
    if (!rule) {
      throw new Error(`Rule not registered: ${id}`)
    }
    return rule
  }

  getPlayer(id: string): PlayerPluginDefinition {
    const player = this.players.get(id)
    if (!player) {
      throw new Error(`Player not registered: ${id}`)
    }
    return player
  }

  getBoard(id: string): BoardPlugin {
    const board = this.boards.get(id)
    if (!board) {
      throw new Error(`Board not registered: ${id}`)
    }
    return board
  }

  getTheme(id: string): ThemePlugin {
    const theme = this.themes.get(id)
    if (!theme) {
      throw new Error(`Theme not registered: ${id}`)
    }
    return theme
  }

  getStorage(id: string): StoragePluginDefinition {
    const storage = this.storages.get(id)
    if (!storage) {
      throw new Error(`Storage not registered: ${id}`)
    }
    return storage
  }

  getRulePlugins(): RulePlugin[] {
    return [...this.rules.values()]
  }

  getPlayerPlugins(): PlayerPluginDefinition[] {
    return [...this.players.values()]
  }

  getBoardPlugins(): BoardPlugin[] {
    return [...this.boards.values()]
  }

  getThemePlugins(): ThemePlugin[] {
    return [...this.themes.values()]
  }

  getStoragePlugins(): StoragePluginDefinition[] {
    return [...this.storages.values()]
  }
}
