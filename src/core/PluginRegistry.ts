import type { ThemePlugin } from '../plugins/themes/ThemePlugin'
import type { BoardPlugin } from '../plugins/board/BoardPlugin'

/**
 * Central place to register and resolve UI plugins (theme + board).
 * Keeps plugin instances from being created ad-hoc inside React files;
 * the app registers its configured plugins here and resolves them back
 * by id so the wiring is explicit rather than decorative.
 */
export class PluginRegistry {
  private readonly themes = new Map<string, ThemePlugin>()
  private readonly boards = new Map<string, BoardPlugin>()

  registerTheme(plugin: ThemePlugin): void {
    this.themes.set(plugin.id, plugin)
  }

  registerBoard(plugin: BoardPlugin): void {
    this.boards.set(plugin.id, plugin)
  }

  getTheme(id: string): ThemePlugin {
    const theme = this.themes.get(id)
    if (!theme) {
      throw new Error(`Theme not registered: ${id}`)
    }
    return theme
  }

  getBoard(id: string): BoardPlugin {
    const board = this.boards.get(id)
    if (!board) {
      throw new Error(`Board not registered: ${id}`)
    }
    return board
  }
}
