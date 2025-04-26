import { it, expect, describe, beforeAll, jest } from '@jest/globals'
import { Message } from '../src/core/Message'
import { ExchangeDirect } from '../src/core/ExchangeDirect'
import { Exchange } from '../src/core/base/Exchange'
import { Queue } from '../src/core/Queue'

describe('Exchange Direct Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  it('should create a exchange direct', () => {
    const exchangeDirect = ExchangeDirect.create({
      name: 'ex1'
    })

    expect(exchangeDirect).toBeInstanceOf(Exchange)
    expect(exchangeDirect.id).toEqual(expect.any(String))
    expect(exchangeDirect.name).toBe('ex1')
    expect(exchangeDirect.bindings.length).toBe(0)
  })

  it('should create a binding with exchange and queue containing routingKey', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const exchangeDirect = ExchangeDirect.create({
      name: 'ex1'
    })

    exchangeDirect.createBinding(queue, 'bindingKey1')

    expect(exchangeDirect.bindings.length).toBe(1)
    expect(exchangeDirect.bindings[0].exchange).toBe(exchangeDirect)
    expect(exchangeDirect.bindings[0].queue).toBe(queue)
    expect(exchangeDirect.bindings[0].bindingKey).toBe('bindingKey1') 

  })

  it('should not create a duplicated binding', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const exchangeDirect = ExchangeDirect.create({
      name: 'ex1'
    })

    exchangeDirect.createBinding(queue, 'bindingKey1')
    exchangeDirect.createBinding(queue, 'bindingKey1')

    expect(exchangeDirect.bindings.length).toBe(1)
    expect(exchangeDirect.bindings[0].exchange).toBe(exchangeDirect) 
    expect(exchangeDirect.bindings[0].queue).toBe(queue)
    expect(exchangeDirect.bindings[0].bindingKey).toBe('bindingKey1')
    expect(exchangeDirect.bindings[1]).toBe(undefined)

  })

  it('should remove a binding', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const exchangeDirect = ExchangeDirect.create({
      name: 'ex1'
    })

    exchangeDirect.createBinding(queue, 'bindingKey1')
    exchangeDirect.createBinding(queue, 'bindingKey1')

    exchangeDirect.removeBinding(exchangeDirect.bindings[0].id)

    expect(exchangeDirect.bindings.length).toBe(0)

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

    const exchangeDirect = ExchangeDirect.create({
      name: 'ex1'
    })

    const bindingKey = 'rk1'
    exchangeDirect.createBinding(queue1, bindingKey)
    exchangeDirect.createBinding(queue2, 'bindingKey2')

    const message = Message.create({
      payload: 'any_payload',
      routingKey: bindingKey
    })
 
    exchangeDirect.sendMessageQueue(message)

    expect(queue1.messages.length).toBe(1)
    expect(queue1.messages[0]).toEqual(message)
    expect(queue2.messages.length).toBe(0)
    expect(queue3.messages.length).toBe(0)
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

    const exchangeDirect = ExchangeDirect.create({
      name: 'ex1'
    })

    const bindingKey = 'rk'
    exchangeDirect.createBinding(queue1, bindingKey)
    exchangeDirect.createBinding(queue2, bindingKey)

    const message = Message.create({
      payload: 'any_payload',
      routingKey: bindingKey
    })

    exchangeDirect.sendMessageQueue(message)

    expect(queue1.messages.length).toBe(1)
    expect(queue1.messages[0]).toEqual(message)
    expect(queue2.messages.length).toBe(1)
    expect(queue2.messages[0]).toEqual(message)
    expect(queue3.messages.length).toBe(0) 

  })

})