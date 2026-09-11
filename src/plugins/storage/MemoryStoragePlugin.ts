import type {
  SavedGame,
  StoragePlugin,
} from './StoragePlugin'

export class MemoryStoragePlugin implements StoragePlugin {
  readonly id = 'memory-storage'
  readonly name = 'Memory Storage Plugin'

  private games = new Map<string, SavedGame>()

  async save(game: SavedGame): Promise<void> {
    this.games.set(game.id, structuredClone(game))
  }

  async load(id: string): Promise<SavedGame | null> {
    return this.games.get(id) ?? null
  }

  async clear(id: string): Promise<void> {
    this.games.delete(id)
  }
}
