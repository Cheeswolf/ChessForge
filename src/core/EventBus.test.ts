import { EventBus } from './EventBus'

test('emits typed event to subscriber', () => {
  const bus = new EventBus<{ value: number }>()
  const received: number[] = []

  bus.on('value', value => received.push(value))
  bus.emit('value', 42)

  expect(received).toEqual([42])
})

test('unsubscribe removes handler', () => {
  const bus = new EventBus<{ value: number }>()
  const received: number[] = []

  const off = bus.on(
    'value',
    value => received.push(value),
  )

  off()
  bus.emit('value', 1)

  expect(received).toEqual([])
})
