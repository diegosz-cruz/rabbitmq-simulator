import { it, expect, describe, beforeAll, jest, beforeEach, afterEach } from '@jest/globals'
import { Broker } from '../../src/core/Broker'
import { ExampleProducer } from '../../src/producers/exampleProducer'
import { ExampleConsumer } from '../../src/consumers/exampleConsumer'

function createInstances(numberQueues, numberProducers, numberConsumers, typeExchange) {
  const broker = Broker.create()
  let exchange = broker.createExchange({ name: 'ex1', type: typeExchange })
  let queues = Object.fromEntries(
    Array.from({ length: numberQueues + 1 }).map((_, i) => {
      const name = `q${i}`
      const queue = broker.createQueue({ name })
      return [name, queue]
    })
  )
  let producers = Object.fromEntries(
    Array.from({ length: numberProducers + 1 }).map((_, i) => {
      const name = `p${i}`
      const producer = ExampleProducer.create({ name })
      return [name, producer]
    })
  )
  let consumers = Object.fromEntries(
    Array.from({ length: numberConsumers + 1 }).map((_, i) => {
      const name = `c${i}`
      const consumer = ExampleConsumer.create({ name })
      return [name, consumer]
    })
  )

  return {
    broker,
    exchange,
    queues,
    producers,
    consumers,
  }
}

describe('Queue Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should testing a flow operations with exchange fanout', async () => {
    const { broker, exchange, queues, consumers, producers } = createInstances(4, 1, 4, 'fanout')
    const { q1, q2, q3, q4 } = queues
    const { c1, c2, c3, c4 } = consumers
    const { p1 } = producers

    const spyC1 = jest.spyOn(c1, 'readMsg')
    const spyC2 = jest.spyOn(c2, 'readMsg')
    const spyC3 = jest.spyOn(c3, 'readMsg')
    const spyC4 = jest.spyOn(c4, 'readMsg')

    broker.addConsumerInQueue(c1, q1.id)
    broker.addConsumerInQueue(c2, q2.id)
    broker.addConsumerInQueue(c3, q3.id)
    broker.addConsumerInQueue(c4, q1.id)

    expect(q1.consumers[0]).toEqual(c1)
    expect(q1.messages.length).toEqual(0)
    expect(q2.consumers[0]).toEqual(c2)
    expect(q2.messages.length).toEqual(0)
    expect(q3.consumers[0]).toEqual(c3)
    expect(q3.messages.length).toEqual(0)
    expect(q4.consumers.length).toEqual(0)

    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q1.id
    })
    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q2.id
    })
    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q3.id
    })

    p1.addExchange(exchange)
    for (let i = 0; i < 10; i++) {
      p1.sendMessage({
        payload: `payload_message-${i}`,
        routingKey: undefined
      })
    }
    expect(q1.messages.length).toEqual(10)
    expect(q2.messages.length).toEqual(10)
    expect(q3.messages.length).toEqual(10) 
    expect(q4.messages.length).toEqual(0)

    jest.runAllTimers()

    expect(spyC1).toHaveBeenCalledTimes(5)
    expect(spyC4).toHaveBeenCalledTimes(5)
    expect(spyC2).toHaveBeenCalledTimes(10)
    expect(spyC3).toHaveBeenCalledTimes(10)
    expect(q1.messages.length).toEqual(0)
    expect(q2.messages.length).toEqual(0)
    expect(q3.messages.length).toEqual(0)
  })

  it('should testing a flow operations with exchange topic', async () => {
    const { broker, exchange, queues, consumers, producers } = createInstances(4, 1, 4, 'topic')
    const { q1, q2, q3, q4 } = queues
    const { c1, c2, c3, c4 } = consumers
    const { p1 } = producers

    const spyC1 = jest.spyOn(c1, 'readMsg')
    const spyC2 = jest.spyOn(c2, 'readMsg')
    const spyC3 = jest.spyOn(c3, 'readMsg')
    const spyC4 = jest.spyOn(c4, 'readMsg')

    expect(q1.messages.length).toEqual(0)
    expect(q2.messages.length).toEqual(0)
    expect(q3.messages.length).toEqual(0)
    expect(q4.consumers.length).toEqual(0)
    
    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q1.id,
      bindingKey: 'a.#.*.b'
    })
    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q2.id,
      bindingKey: 'a.*.*.#'
    })
    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q3.id,
      bindingKey: '#.a.*.c'
    })

    p1.addExchange(exchange)
    p1.sendMessage({
      payload: `payload_message-1`,
      routingKey: 'a.x.y.z.b'
    })
    p1.sendMessage({
      payload: `payload_message-2`,
      routingKey: 'a.x.y.z.b'
    })
    p1.sendMessage({
      payload: `payload_message-3`,
      routingKey: 'a.x.z.b'
    })
    for(let i = 4; i < 9; i++) {
      p1.sendMessage({
        payload: `payload_message-${i}`,
        routingKey: 'x.a.y.c'
      })
    }
    expect(q1.messages.length).toEqual(3)
    expect(q2.messages.length).toEqual(3)
    expect(q3.messages.length).toEqual(5)
    expect(q4.messages.length).toEqual(0)

    broker.addConsumerInQueue(c1, q1.id)
    broker.addConsumerInQueue(c2, q2.id)
    broker.addConsumerInQueue(c3, q3.id)
    broker.addConsumerInQueue(c4, q3.id)

    jest.runAllTimers() 

    expect(spyC1).toHaveBeenCalledTimes(3)
    expect(spyC2).toHaveBeenCalledTimes(3)
    expect(spyC3).toHaveBeenCalledTimes(3)
    expect(spyC4).toHaveBeenCalledTimes(2) 
    expect(q1.messages.length).toEqual(0)
    expect(q2.messages.length).toEqual(0)
    expect(q3.messages.length).toEqual(0)
    expect(q4.messages.length).toEqual(0)
  })

  it('should testing a flow operations with exchange direct', async () => {
    const { broker, exchange, queues, consumers, producers } = createInstances(4, 1, 4, 'direct')
    const { q1, q2, q3, q4 } = queues
    const { c1, c2, c3, c4 } = consumers
    const { p1 } = producers

    const spyC1 = jest.spyOn(c1, 'readMsg')
    const spyC2 = jest.spyOn(c2, 'readMsg')
    const spyC3 = jest.spyOn(c3, 'readMsg')
    const spyC4 = jest.spyOn(c4, 'readMsg')

    expect(q1.messages.length).toEqual(0)
    expect(q2.messages.length).toEqual(0)
    expect(q3.messages.length).toEqual(0)
    
    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q1.id,
      bindingKey: 'abcd'
    })
    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q2.id,
      bindingKey: 'abcd'
    })
    broker.createBindingExchangeWithQueue({
      exchangeId: exchange.id,
      queueId: q3.id,
      bindingKey: 'dcba'
    })

    p1.addExchange(exchange)
    for(let i = 0; i < 4; i++) {
      p1.sendMessage({
        payload: `payload_message-${i}`,
        routingKey: 'abcd'
      })
    }
    for(let i = 4; i < 12; i++) {
      p1.sendMessage({
        payload: `payload_message-${i}`,
        routingKey: 'dcba'
      })
    }
    expect(q1.messages.length).toEqual(4)
    expect(q2.messages.length).toEqual(4)
    expect(q3.messages.length).toEqual(8)
    expect(q4.messages.length).toEqual(0)

    broker.addConsumerInQueue(c1, q1.id)
    broker.addConsumerInQueue(c2, q2.id)
    broker.addConsumerInQueue(c3, q3.id)
    broker.addConsumerInQueue(c4, q3.id)

    jest.runAllTimers() 

    expect(spyC1).toHaveBeenCalledTimes(4)
    expect(spyC2).toHaveBeenCalledTimes(4)
    expect(spyC3).toHaveBeenCalledTimes(4)
    expect(spyC4).toHaveBeenCalledTimes(4) 
    expect(q1.messages.length).toEqual(0)
    expect(q2.messages.length).toEqual(0)
    expect(q3.messages.length).toEqual(0)
    expect(q4.messages.length).toEqual(0)
  })
})
