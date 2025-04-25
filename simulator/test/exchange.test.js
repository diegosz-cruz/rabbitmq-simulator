import { it, expect, describe, beforeAll, jest } from '@jest/globals'
import { Message } from '../src/core/Message'
import { ExchangeDirect } from '../src/core/ExchangeDirect'
import { Exchange } from '../src/core/base/Exchange'
import { Queue } from '../src/core/Queue'

describe('Exchange Direct Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  it('should create a exchange', () => {
    const exchange = new Exchange('ex1')

    expect(exchange).toBeInstanceOf(Exchange) 
    expect(exchange.id).toEqual(expect.any(String))
    expect(exchange.name).toBe('ex1')
    expect(exchange.bindings.length).toBe(0)
  })

  it('should throw an error when sendMessageQueue method is not implemented', () => {
    const exchange = new Exchange('ex1')

    expect(() => exchange.sendMessageQueue())
      .toThrow('Method not implemented!')
  })

})