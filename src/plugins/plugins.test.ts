import { chessJsRulePlugin } from './rules/ChessJsRulePlugin'
import { HumanPlayerPlugin } from './players/HumanPlayerPlugin'
import { MemoryStoragePlugin } from './storage/MemoryStoragePlugin'
import { chessComTheme } from './themes/ChessComTheme'
import { defaultBoardPlugin } from './board/DefaultBoardPlugin'

describe('plugin contract', () => {
  test('chess.js rule plugin loads and creates a full session', () => {
    expect(chessJsRulePlugin.id).toBeTruthy()
    expect(chessJsRulePlugin.name).toBeTruthy()

    const session = chessJsRulePlugin.createSession()
    expect(typeof session.getState).toBe('function')
    expect(typeof session.getLegalMoves).toBe('function')
    expect(typeof session.makeMove).toBe('function')
    expect(typeof session.undo).toBe('function')
    expect(typeof session.reset).toBe('function')
  })

  test('human player plugin loads with id, name and color', () => {
    const player = new HumanPlayerPlugin('white', 'White', 'white')
    expect(player.id).toBe('white')
    expect(player.name).toBe('White')
    expect(player.color).toBe('white')
  })

  test('memory storage plugin loads with save/load/clear', () => {
    const storage = new MemoryStoragePlugin()
    expect(storage.id).toBeTruthy()
    expect(storage.name).toBeTruthy()
    expect(typeof storage.save).toBe('function')
    expect(typeof storage.load).toBe('function')
    expect(typeof storage.clear).toBe('function')
  })

  test('chess.com theme plugin loads with all 12 tokens', () => {
    expect(chessComTheme.id).toBeTruthy()
    expect(chessComTheme.name).toBeTruthy()

    const keys = [
      'pageBackground',
      'panelBackground',
      'textPrimary',
      'textMuted',
      'lightSquare',
      'darkSquare',
      'selectedSquare',
      'previousMove',
      'legalMove',
      'checkSquare',
      'borderRadius',
      'shadow',
    ] as const

    for (const key of keys) {
      expect(chessComTheme.tokens).toHaveProperty(key)
    }
    expect(Object.keys(chessComTheme.tokens)).toHaveLength(keys.length)
  })

  test('default board plugin loads with a renderable component', () => {
    expect(defaultBoardPlugin.id).toBeTruthy()
    expect(defaultBoardPlugin.name).toBeTruthy()
    expect(typeof defaultBoardPlugin.Component).toBe('function')
  })
})
