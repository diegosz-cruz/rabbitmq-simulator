import { it, expect, describe, beforeAll, jest } from '@jest/globals'
import { Message } from '../src/core/Message'
import { ExchangeDirect } from '../src/core/ExchangeDirect'
import { Exchange } from '../src/core/base/Exchange'
import { Queue } from '../src/core/Queue'
import { Broker } from '../src/core/Broker'
import { ExchangeTopic } from '../src/core/ExchangeTopic'
import { ExchangeFanout } from '../src/core/ExchangeFanout'

describe('Exchange Direct Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })
 
  it('should create a exchange direct for default', () => {
    const broker = Broker.create()
    const exchangeDirect = broker.createExchange({ name: 'ex1' })

    expect(exchangeDirect).toBeInstanceOf(ExchangeDirect)
    expect(exchangeDirect.id).toEqual(expect.any(String))
    expect(exchangeDirect.name).toBe('ex1')
    expect(exchangeDirect.bindings.length).toBe(0)
    expect(broker.exchanges.length).toBe(1)
  })

  it('should create a exchange topic', () => {
    const broker = Broker.create()
    const exchangeTopic = broker.createExchange({ name: 'ex1', type: 'topic' })

    expect(exchangeTopic).toBeInstanceOf(ExchangeTopic)
    expect(exchangeTopic.id).toEqual(expect.any(String))
    expect(exchangeTopic.name).toBe('ex1')
    expect(exchangeTopic.bindings.length).toBe(0)
    expect(broker.exchanges.length).toBe(1)

  })

  it('should create a exchange fanout', () => {
    const broker = Broker.create()
    const exchangeFanout = broker.createExchange({ name: 'ex1', type: 'fanout' })

    expect(exchangeFanout).toBeInstanceOf(ExchangeFanout)
    expect(exchangeFanout.id).toEqual(expect.any(String))
    expect(exchangeFanout.name).toBe('ex1')
    expect(exchangeFanout.bindings.length).toBe(0)
    expect(broker.exchanges.length).toBe(1)

  })

  it('should create a exchange with random name when property is not provided', () => {
    const broker = Broker.create()
    const exchangeFanout = broker.createExchange({ type: 'fanout' })

    expect(exchangeFanout).toBeInstanceOf(ExchangeFanout)
    expect(exchangeFanout.id).toEqual(expect.any(String))
    expect(exchangeFanout.name).toEqual(expect.any(String))
    expect(exchangeFanout.bindings.length).toBe(0)
    expect(broker.exchanges.length).toBe(1)

  })

  it('should create a exchange direct with is other value', () => {
    const broker = Broker.create()
    const exchange = broker.createExchange({ type: 'any_text' })

    expect(exchange).toBeInstanceOf(ExchangeDirect)
    expect(exchange.id).toEqual(expect.any(String))
    expect(exchange.name).toEqual(expect.any(String))
    expect(exchange.bindings.length).toBe(0)
    expect(broker.exchanges.length).toBe(1)

  })

  it('should create a queue', () => {
    const broker = Broker.create()
    const queue = broker.createQueue({ name: 'q1' })

    expect(queue).toBeInstanceOf(Queue)
    expect(queue.id).toEqual(expect.any(String))
    expect(queue.name).toEqual('q1')
    expect(queue.messages.length).toBe(0)
  })

  it('should create a queue with random name when property is not provided', () => {
    const broker = Broker.create()
    const queue = broker.createQueue({})

    expect(queue).toBeInstanceOf(Queue)
    expect(queue.id).toEqual(expect.any(String))
    expect(queue.messages.length).toBe(0)
    expect(queue.name).toEqual(expect.any(String))
    expect(broker.queues.length).toBe(1)
  })

  it('should return a exchange with id', () => {
    const broker = Broker.create()
    const exchange = broker.createExchange({})

    const findExchange = broker.findExchangeById(exchange.id)
    expect(findExchange).toEqual(exchange)
  })

  it('should return null when exchange not found', () => {
    const broker = Broker.create()

    const findExchange = broker.findExchangeById('any_id')
    expect(findExchange).toEqual(null)
  })

  it('should return a queue with id', () => {
    const broker = Broker.create()
    const queue = broker.createQueue({})

    const findQueue = broker.findQueueById(queue.id)
    expect(findQueue).toEqual(queue)
  })

  it('should return a exchange with id', () => {
    const broker = Broker.create()

    const findQueue = broker.findQueueById('any_id')
    expect(findQueue).toEqual(null)
  })

  it('should create binding for exchange with queue', () => {
    const broker = Broker.create()
    const exchange = broker.createExchange({})
    const queue = broker.createQueue({})

    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: queue.id,
      bindingKey: 'bindingKey1'
    })

    expect(broker.exchanges.length).toBe(1)
    expect(broker.queues.length).toBe(1)
    expect(exchange.bindings[0].exchange).toEqual(exchange) 
    expect(exchange.bindings[0].queue).toEqual(queue) 
    expect(exchange.bindings[0].bindingKey).toEqual('bindingKey1') 
   
  })

  it('should return an error message when creating a binding with a non-existent exchange', () => {
    const broker = Broker.create()
    const queue = broker.createQueue({})

    const expected = { message: 'Exchange not found!' }

    const result = broker.createBindingExchangeWithQueue({
      exchangeId: 'any_id',
      queueId: queue.id,
      bindingKey: 'bindingKey1'
    })

    expect(result).toEqual(expected)  
  })

  it('should return an error message when creating a binding with a non-existent queue', () => {
    const broker = Broker.create()
    const exchange = broker.createExchange({})

    const expected = { message: 'Queue not found!' }

    const result = broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: 'any_id',
      bindingKey: 'bindingKey1'
    })

    expect(result).toEqual(expected)  
  }) 

  it('should adding consumer in queue', () => {
    const broker = Broker.create()
    const queue = broker.createQueue({}) 
    const consumer1 = {
      id: 'id_consumer_1',
      name: 'c1',
      readMsg(message) { }
    }
    const consumer2 = {
      id: 'id_consumer_2',
      name: 'c2',
      readMsg(message) { }
    }

    broker.addConsumerInQueue(consumer1, queue.id)
    broker.addConsumerInQueue(consumer2, queue.id)

    expect(queue.consumers.length).toBe(2)
    expect(queue.consumers[0].id).toBe('id_consumer_1')
    expect(queue.consumers[1].id).toBe('id_consumer_2')
  }) 

  it('should return an error message when adding a consumer with a non-existent queue', () => {
    const broker = Broker.create()
    const consumer = {
      id: 'id_consumer_1',
      name: 'c1',
      readMsg(message) { }
    }

    const expected = { message: 'Queue not found!' }
    const result = broker.addConsumerInQueue(consumer, 'any_id_queue')

    expect(result).toEqual(expected)  
  })
})