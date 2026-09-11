import type { GameState, Plugin } from '../../core/types'

export interface SavedGame {
  id: string
  state: GameState
}

export interface StoragePlugin extends Plugin {
  save(game: SavedGame): Promise<void>

  load(id: string): Promise<SavedGame | null>

  clear(id: string): Promise<void>
}
