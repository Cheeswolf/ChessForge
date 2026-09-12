import { IllegalMoveError } from './errors'
import type { Move } from './types'

test('IllegalMoveError carries the move and a descriptive message', () => {
  const move: Move = { from: 'e2', to: 'e5' }

  const error = new IllegalMoveError(move)

  expect(error).toBeInstanceOf(Error)
  expect(error.name).toBe('IllegalMoveError')
  expect(error.move).toBe(move)
  expect(error.message).toBe('Illegal move: e2 to e5')
})
