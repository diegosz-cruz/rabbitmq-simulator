import { it, expect, describe, beforeAll, jest } from '@jest/globals'
import { Message } from '../src/core/Message'
import { ExchangeFanout } from '../src/core/ExchangeFanout'
import { Exchange } from '../src/core/base/Exchange'
import { Queue } from '../src/core/Queue'

describe('Exchange Fanout Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  it('should create a exchange Fanout', () => {
    const exchangeFanout = ExchangeFanout.create({
      name: 'ex1'
    })

    expect(exchangeFanout).toBeInstanceOf(Exchange)
    expect(exchangeFanout.id).toEqual(expect.any(String))
    expect(exchangeFanout.name).toBe('ex1')
    expect(exchangeFanout.bindings.length).toBe(0)
  })

  it('should create a binding with exchange and queue', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const exchangeFanout = ExchangeFanout.create({
      name: 'ex1'
    })

    exchangeFanout.createBinding(queue)

    expect(exchangeFanout.bindings.length).toBe(1)
    expect(exchangeFanout.bindings[0].exchange).toBe(exchangeFanout)
    expect(exchangeFanout.bindings[0].queue).toBe(queue)
    expect(exchangeFanout.bindings[0].routingKey).toBe(undefined)

  })

  it('should not create a duplicated binding', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const exchangeFanout = ExchangeFanout.create({
      name: 'ex1'
    })

    exchangeFanout.createBinding(queue)
    exchangeFanout.createBinding(queue)

    expect(exchangeFanout.bindings.length).toBe(1)
    expect(exchangeFanout.bindings[0].exchange).toBe(exchangeFanout) 
    expect(exchangeFanout.bindings[0].queue).toBe(queue)
    expect(exchangeFanout.bindings[0].routingKey).toBe(undefined)
    expect(exchangeFanout.bindings[1]).toBe(undefined)

  })

  it('should remove a binding', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const exchangeFanout = ExchangeFanout.create({
      name: 'ex1'
    })

    exchangeFanout.createBinding(queue)
    exchangeFanout.removeBinding(exchangeFanout.bindings[0].id)

    expect(exchangeFanout.bindings.length).toBe(0)

  })

  it('should send message for all queues binding', () => {
    const queue1 = Queue.create({
      name: 'q1'
    })
    const queue2 = Queue.create({
      name: 'q2'
    })
    const queue3 = Queue.create({
      name: 'q3'
    })

    const exchangeFanout = ExchangeFanout.create({
      name: 'ex1'
    })

    exchangeFanout.createBinding(queue1)
    exchangeFanout.createBinding(queue2)

    const message = Message.create({
      payload: 'any_payload',
    })

    exchangeFanout.sendMessageQueue(message)

    expect(queue1.messages.length).toBe(1)
    expect(queue1.messages[0]).toEqual(message)
    expect(queue2.messages.length).toBe(1)
    expect(queue2.messages[0]).toBe(message)
    expect(queue3.messages.length).toBe(0) 
  })


}) 