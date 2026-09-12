import { PluginRegistry } from './PluginRegistry'
import { chessComTheme } from '../plugins/themes/ChessComTheme'
import { defaultBoardPlugin } from '../plugins/board/DefaultBoardPlugin'

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
