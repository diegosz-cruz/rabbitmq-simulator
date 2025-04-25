import { it, expect, describe, beforeAll, jest } from '@jest/globals'
import { Message } from '../src/core/Message'
import { Queue } from '../src/core/Queue'
import { randomUUID } from 'node:crypto'

describe('Queue Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })
  it('should adding message in queue', async () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const message = Message.create({
      payload: 'payload',
      routingKey: '',
    })
    queue.addMessageInQueue(message)

    expect(queue.messages.length).toBe(1)
    expect(queue.messages[0]).toBeInstanceOf(Message)
    expect(queue.consumers.length).toBe(0)

  })

  it('should throw an error when message is instance incorrect', async () => {
    const queue = Queue.create({
      name: 'q1'
    })

    expect(() => queue.addMessageInQueue({ text: 'text' }))
      .toThrow('Invalid type Message')
    expect(queue.messages.length).toBe(0)

  })

  it('should adding consumer in queue', async () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const consumer = {
      id: randomUUID(),
      name: 'c1',
      readMsg(message) { }
    }
    queue.addConsumer(consumer)

    expect(queue.consumers.length).toBe(1)
    expect(queue.messages.length).toBe(0)

  })

  it('should removing a consumer in queue', async () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const consumers = [{ id: randomUUID() }, { id: randomUUID() }]

    queue.addConsumer(consumers[0])
    queue.addConsumer(consumers[1])

    queue.removeConsumer(consumers[1].id)

    expect(queue.consumers.length).toBe(1)
    expect(queue.consumers[0].id).toBe(consumers[0].id)

    queue.removeConsumer(consumers[0].id)
    expect(queue.consumers.length).toBe(0)

  })

  it('should send messages to available consumers in a round robin format', async () => {
    const queue = Queue.create({
      name: 'q1'
    })
    for (let i = 0; i < 5; i++) {
      const message = Message.create({
        payload: `message-${i}`,
        routingKey: ''
      })
      queue.addMessageInQueue(message)
    }

    const consumer1 = {
      id: randomUUID(),
      name: 'c1',
      readMsg(message) { }
    }
    const consumer2 = {
      id: randomUUID(),
      name: 'c2',
      readMsg(message) { }
    }

    const spyConsumer1 = jest.spyOn(consumer1, 'readMsg')
    const spyConsumer2 = jest.spyOn(consumer2, 'readMsg')

    queue.addConsumer(consumer1)
    queue.addConsumer(consumer2)

    queue.sendMessage()

    expect(queue.messages.length).toBe(0)
    expect(spyConsumer1).toHaveBeenCalledTimes(3)
    expect(spyConsumer2).toHaveBeenCalledTimes(2)

    expect(spyConsumer1).toHaveBeenNthCalledWith(1, expect.objectContaining({
      payload: 'message-0'
    }))
    expect(spyConsumer2).toHaveBeenNthCalledWith(1, expect.objectContaining({
      payload: 'message-1'
    }))
    expect(spyConsumer1).toHaveBeenNthCalledWith(2, expect.objectContaining({
      payload: 'message-2'
    }))
    expect(spyConsumer2).toHaveBeenNthCalledWith(2, expect.objectContaining({
      payload: 'message-3'
    }))
    expect(spyConsumer1).toHaveBeenNthCalledWith(3, expect.objectContaining({
      payload: 'message-4'
    }))
  })

  it('should do nothing if there are no consumers', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const message = Message.create({
      payload: 'payload',
      routingKey: '',
    })
    queue.addMessageInQueue(message)

    queue.sendMessage()
    expect(queue.messages.length).toBe(1)
  })

  it('should send message when consumer already exists', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const consumer1 = {
      id: randomUUID(),
      name: 'c1',
      readMsg(message) { }
    }
    const spyConsumer1 = jest.spyOn(consumer1, 'readMsg')

    queue.addConsumer(consumer1)

    const message = Message.create({
      payload: 'payload',
      routingKey: '',
    })
    queue.addMessageInQueue(message)

    expect(queue.messages.length).toBe(0)
    expect(spyConsumer1).toHaveBeenCalledTimes(1)
    expect(spyConsumer1).toHaveBeenNthCalledWith(1, expect.objectContaining({
      payload: 'payload'
    }))
  })

  it('should consume message with consumer was created', () => {
    const queue = Queue.create({
      name: 'q1'
    })
    const message = Message.create({
      payload: 'payload',
      routingKey: '',
    })
    queue.addMessageInQueue(message)

    const consumer = {
      id: randomUUID(),
      name: 'c1',
      readMsg(message) { }
    }
    const spyConsumer = jest.spyOn(consumer, 'readMsg')

    queue.addConsumer(consumer)
    queue.sendMessage()

    expect(queue.messages.length).toBe(0)
    expect(spyConsumer).toHaveBeenCalledTimes(1)
    expect(spyConsumer).toHaveBeenNthCalledWith(1, expect.objectContaining({
      payload: 'payload'
    }))
  })

})