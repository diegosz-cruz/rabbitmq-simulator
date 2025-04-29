import { randomUUID } from 'node:crypto'
import { ExchangeFanout } from './ExchangeFanout.js'
import { ExchangeTopic } from './ExchangeTopic.js'
import { ExchangeDirect } from './ExchangeDirect.js'
import { Queue } from './Queue.js'
import { appendFileSync } from 'node:fs'

export class Broker {
  _exchanges = new Map()
  _queues = new Map()

  get exchanges () {
    return Array.from(this._exchanges.values())
  } 

  get queues () {
    return Array.from(this._queues.values())
  }

  findExchangeById (exchangeId) {
    return this._exchanges.get(exchangeId) ?? null
  }

  findQueueById (queueId) {
    return this._queues.get(queueId) ?? null
  }

  createExchange ({ name = '', type = 'direct' }) {
    const datas = {
      name: name ? name : `sim.gen-${randomUUID()}`,
    }
    const formattedType = type.toLocaleLowerCase()

    const newExchange = {
      fanout: () => ExchangeFanout.create(datas),
      topic: () => ExchangeTopic.create(datas),
      direct: () => ExchangeDirect.create(datas),
    }[formattedType]?.() ?? ExchangeDirect.create(datas)

    this._exchanges.set(newExchange.id, newExchange)
    return newExchange
  }

  createQueue ({ name = '' }) {
    const datas = {
      name: name ? name : `sim.gen-${randomUUID()}`,
    }
    const queue = Queue.create(datas)
    this._queues.set(queue.id, queue)
    return queue
  }

  createBindingExchangeWithQueue ({ exchangeId, queueId, bindingKey = undefined }) {
    const exchange = this.findExchangeById(exchangeId)
    if (!exchange) return { message: 'Exchange not found!' }

    const queue = this.findQueueById(queueId)
    if (!queue) return { message: 'Queue not found!' } 

    exchange.createBinding(queue, bindingKey)
  }

  addConsumerInQueue (consumer, queueId) {
    const queue = this.findQueueById(queueId)
    if (!queue) return { message: 'Queue not found!' }

    queue.addConsumer(consumer)
  }

  static create () { 
    const broker = new Broker()
    return new Proxy(broker, {
      get (target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver)

        if (typeof value === 'function') {
          return (...args) => {
            const data = `[Broker log] ${prop}(${args.map(a => JSON.stringify(a)).join(', ')})`
            console.log(data)
            appendFileSync('./broker.log', JSON.stringify(data)) 
            return value.apply(target, args) 
          } 
        } 

        return value
      }
    })
  }
}
