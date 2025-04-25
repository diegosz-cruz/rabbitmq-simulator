import { it, expect, describe, beforeAll, jest } from '@jest/globals'
import { Message } from '../src/core/Message'

describe('Message Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })
  it ('should create a Message', () => {
    const message = Message.create({
      payload: 'message1',
      routingKey: 'route'
    })

    expect(message).toBeInstanceOf(Message)
    expect(message.id).toEqual(expect.any(String))
    expect(message.payload).toBe('message1')
    expect(message.routingKey).toBe('route')
    expect(message.seconds).toBe(0)
  })

})