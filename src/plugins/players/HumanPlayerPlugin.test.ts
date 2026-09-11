import type { GameState } from '../../core/types'
import { HumanPlayerPlugin } from './HumanPlayerPlugin'

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

test('resolves requested move when external move arrives', async () => {
  const player = new HumanPlayerPlugin(
    'white-player',
    'White',
    'white',
  )

  const controller = new AbortController()

  const promise = player.requestMove(
    { state: makeState() },
    controller.signal,
  )

  player.pushExternalMove({ from: 'e2', to: 'e4' })

  await expect(promise).resolves.toEqual({
    from: 'e2',
    to: 'e4',
  })
})

test('exposes id, name and color', () => {
  const player = new HumanPlayerPlugin(
    'black-player',
    'Black',
    'black',
  )

  expect(player.id).toBe('black-player')
  expect(player.name).toBe('Black')
  expect(player.color).toBe('black')
})

test('rejects a second requestMove while one is pending', async () => {
  const player = new HumanPlayerPlugin(
    'white-player',
    'White',
    'white',
  )

  const controller = new AbortController()

  const first = player.requestMove(
    { state: makeState() },
    controller.signal,
  )

  await expect(
    player.requestMove(
      { state: makeState() },
      controller.signal,
    ),
  ).rejects.toThrow(/pending/)

  // The first pending request must not be dropped.
  player.pushExternalMove({ from: 'e2', to: 'e4' })
  await expect(first).resolves.toEqual({
    from: 'e2',
    to: 'e4',
  })
})

test('rejects with AbortError when the signal is aborted', async () => {
  const player = new HumanPlayerPlugin(
    'white-player',
    'White',
    'white',
  )

  const controller = new AbortController()

  const promise = player.requestMove(
    { state: makeState() },
    controller.signal,
  )

  controller.abort()

  await expect(promise).rejects.toMatchObject({
    name: 'AbortError',
  })
})

test('clears pending request on abort so a later request succeeds', async () => {
  const player = new HumanPlayerPlugin(
    'white-player',
    'White',
    'white',
  )

  const firstController = new AbortController()
  const first = player.requestMove(
    { state: makeState() },
    firstController.signal,
  )

  firstController.abort()
  await expect(first).rejects.toMatchObject({
    name: 'AbortError',
  })

  const secondController = new AbortController()
  const second = player.requestMove(
    { state: makeState() },
    secondController.signal,
  )

  player.pushExternalMove({ from: 'd2', to: 'd4' })
  await expect(second).resolves.toEqual({
    from: 'd2',
    to: 'd4',
  })
})
