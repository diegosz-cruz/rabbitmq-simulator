import { it, expect, describe, beforeAll, jest } from '@jest/globals'
import { ExchangeTopic } from '../src/core/ExchangeTopic.js'
import { Queue } from '../src/core/Queue.js'
import { Message } from '../src/core/Message.js'

describe('Exchange Topic Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  it('should return a valids matches when hash(#) is start', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.b', 'b.x.y.a.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('#.b.c', 'a.b.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('#.b.c', 'b.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('#.b.c', 'b.x.c')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.b', 'b.x.y.a.b.c')).toBe(false)
  })

  it('should return a valids matches when hash(#) is end', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('a.x.#', 'a.x.y.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.#', 'a.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.#', 'a.b.c.d')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#', 'aa.b')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.#', 'a.x.b')).toBe(false)
  })

  it('should return a valids matches when hash(#) is middle', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.b', 'a.x.y.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.b', 'a.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.b', 'a.b.x')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.b', 'x.a.b')).toBe(false)
  })

  it('should return a valids matches when asteristic(*) is present', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.*', 'a.b.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.*', 'a.b.c.d')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.c', 'a.x.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.c', 'a.x.d')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.*', 'a.b.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.*', 'a.b')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('*.log', 'a.log')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('*.log', 'a.log.b')).toBe(false)
  })

  it('should return a valids matches when asteristic(*) ans hash(#) is present', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.*', 'x.y.a.z')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.#', 'a.b.c.d')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.*.c', 'x.a.y.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.*.#', 'a.b.c.d.e')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('#', 'a.b.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('*.#.b', 'x.y.z.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.*', 'a.b.c.z')).toBe(true)

    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.*', 'x.y.b.z')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.#', 'a')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.*', 'a.b')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('*.#.b', 'x.b')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.*.c', 'x.b.y.c')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.*.#', 'a.b')).toBe(false)

    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.*.b', 'a.x.y.z.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.*.b', 'a.x.z.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('*.a.#.b', 'a.x.z.b')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.*.b', 'a.x.z.b.h')).toBe(false)

  })

  it('should throw a error when bindingKey have 2 or + hash sign(#)', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(() => exchangeTopic.matchBindingAndRoutingKey('#.a.*.#', 'a.b.c'))
      .toThrow('Invalid binding key!')

    expect(() => exchangeTopic.matchBindingAndRoutingKey('##', 'a.b.c'))
      .toThrow('Invalid binding key!')
  })

  it('should create a binding', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    const queue = Queue.create({
      name: 'q1'
    })
    const bindingKey = 'a.b.#'

    exchangeTopic.createBinding(queue, bindingKey)

    expect(exchangeTopic.bindings.length).toBe(1)
    expect(exchangeTopic.bindings[0].id).toEqual(expect.any(String))
    expect(exchangeTopic.bindings[0].exchange).toBe(exchangeTopic)
    expect(exchangeTopic.bindings[0].queue).toBe(queue)
    expect(exchangeTopic.bindings[0].bindingKey).toBe(bindingKey)

  })

  it('should not create a binding when already exists', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    const queue = Queue.create({
      name: 'q1'
    })
    const bindingKey = 'a.b.#'

    exchangeTopic.createBinding(queue, bindingKey)
    exchangeTopic.createBinding(queue, bindingKey)

    expect(exchangeTopic.bindings.length).toBe(1)
    expect(exchangeTopic.bindings[0].id).toEqual(expect.any(String))
    expect(exchangeTopic.bindings[0].exchange).toBe(exchangeTopic)
    expect(exchangeTopic.bindings[0].queue).toBe(queue)
    expect(exchangeTopic.bindings[0].bindingKey).toBe(bindingKey)
  })

  it('should remove a binding', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    const queue1 = Queue.create({
      name: 'q1'
    })
    const queue2 = Queue.create({
      name: 'q2'
    })
    const bindingKey = 'a.b.#'

    exchangeTopic.createBinding(queue1, bindingKey)
    exchangeTopic.createBinding(queue2, bindingKey)
    exchangeTopic.removeBinding(exchangeTopic.bindings[0].id)

    console.log(exchangeTopic.bindings)

    expect(exchangeTopic.bindings.length).toBe(1)
    expect(exchangeTopic.bindings[0].id).toEqual(expect.any(String))
    expect(exchangeTopic.bindings[0].exchange).toBe(exchangeTopic)
    expect(exchangeTopic.bindings[0].bindingKey).toBe(bindingKey)
    expect(exchangeTopic.bindings[0].queue).toBe(queue2)
  })

  it('should send message a queue with respective routingKey', () => {
    const queue1 = Queue.create({
      name: 'q1'
    })
    const queue2 = Queue.create({
      name: 'q2'
    })
    const queue3 = Queue.create({
      name: 'q3'
    })

    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    const bindingKey = '#.a.*.c'
    exchangeTopic.createBinding(queue1, bindingKey)
    exchangeTopic.createBinding(queue2, 'bindingKey2')

    const message = Message.create({
      payload: 'any_payload',
      routingKey: 'x.a.y.c'
    })

    exchangeTopic.sendMessageQueue(message)

    expect(queue1.messages.length).toBe(1)
    expect(queue1.messages[0]).toEqual(message)
    expect(queue2.messages.length).toBe(0)
    expect(queue3.messages.length).toBe(0)
  })

  it('should not create a duplicated binding', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    exchangeTopic.createBinding(queue, '#.a.*.c')
    exchangeTopic.createBinding(queue, '#.a.*.c')

    expect(exchangeTopic.bindings.length).toBe(1)
    expect(exchangeTopic.bindings[0].exchange).toBe(exchangeTopic)
    expect(exchangeTopic.bindings[0].queue).toBe(queue)
    expect(exchangeTopic.bindings[0].bindingKey).toBe('#.a.*.c')
    expect(exchangeTopic.bindings[1]).toBe(undefined)

  })

  it('should send message a queues with same routingKey', () => {
    const queue1 = Queue.create({
      name: 'q1'
    })
    const queue2 = Queue.create({
      name: 'q2'
    })
    const queue3 = Queue.create({
      name: 'q3'
    })

    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    const bindingKey = '#.a.*.c'
    exchangeTopic.createBinding(queue1, bindingKey)
    exchangeTopic.createBinding(queue2, bindingKey)

    const message = Message.create({
      payload: 'any_payload',
      routingKey: bindingKey
    })

    exchangeTopic.sendMessageQueue(message)

    expect(queue1.messages.length).toBe(1)
    expect(queue1.messages[0]).toEqual(message)
    expect(queue2.messages.length).toBe(1)
    expect(queue2.messages[0]).toEqual(message)
    expect(queue3.messages.length).toBe(0)

  })

})





// Hash middle

