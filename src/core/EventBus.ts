import type { Color, GameState, Move } from './types'

export interface GameEvents {
  gameStarted: GameState
  moveMade: GameState
  moveRejected: Move
  turnChanged: Color
  check: Color
  gameEnded: GameState
  gameReset: GameState
  moveUndone: GameState
  error: Error
}

export class EventBus<Events extends object> {
  private handlers = new Map<keyof Events, Set<Function>>()

  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void,
  ): () => void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set<Function>()
      this.handlers.set(event, set)
    }
    set.add(handler)
    return () => {
      set.delete(handler)
    }
  }

  emit<K extends keyof Events>(
    event: K,
    payload: Events[K],
  ): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of set) {
      handler(payload)
    }
  }
}
