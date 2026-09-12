import type { Move } from './types'

/**
 * A move the rule engine explicitly rejected as illegal (as opposed to a
 * rule engine that crashed). GameCore maps this to a recoverable
 * `moveRejected` event instead of entering the fatal `faulted` state.
 */
export class IllegalMoveError extends Error {
  readonly move: Move

  constructor(move: Move) {
    super(`Illegal move: ${move.from} to ${move.to}`)
    this.name = 'IllegalMoveError'
    this.move = move
  }
}
