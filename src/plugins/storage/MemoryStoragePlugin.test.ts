import type { GameState } from '../../core/types'
import type { SavedGame } from './StoragePlugin'
import { MemoryStoragePlugin } from './MemoryStoragePlugin'

function makeState(): GameState {
  return {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    board: {
      e2: { color: 'white', type: 'pawn' },
      e7: { color: 'black', type: 'pawn' },
    },
    history: [],
    status: {
      phase: 'playing',
      turn: 'white',
      inCheck: false,
    },
  }
}

test('saves and loads a game', async () => {
  const storage = new MemoryStoragePlugin()
  const state = makeState()

  await storage.save({ id: 'current', state })

  await expect(storage.load('current')).resolves.toEqual({
    id: 'current',
    state,
  })
})

test('returns null for an unknown id', async () => {
  const storage = new MemoryStoragePlugin()

  await expect(storage.load('missing')).resolves.toBeNull()
})

test('clears a saved game', async () => {
  const storage = new MemoryStoragePlugin()

  await storage.save({
    id: 'current',
    state: makeState(),
  })

  await storage.clear('current')

  await expect(storage.load('current')).resolves.toBeNull()
})

test('stores a copy so caller mutation does not corrupt storage', async () => {
  const storage = new MemoryStoragePlugin()
  const state = makeState()
  const game: SavedGame = { id: 'current', state }

  await storage.save(game)

  // Mutate the caller's objects after saving.
  state.board.e2 = { color: 'black', type: 'queen' }
  state.status.turn = 'black'
  state.status.inCheck = true
  state.history.push({
    from: 'e2',
    to: 'e4',
    san: 'e4',
    color: 'white',
  })

  const loaded = await storage.load('current')

  expect(loaded).not.toBeNull()
  expect(loaded!.state.board.e2).toEqual({
    color: 'white',
    type: 'pawn',
  })
  expect(loaded!.state.status.turn).toBe('white')
  expect(loaded!.state.status.inCheck).toBe(false)
  expect(loaded!.state.history).toEqual([])
})
