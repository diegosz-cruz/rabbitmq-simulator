import { Message } from '../core/Message.js'

export class ExampleProducer {
  name 
  exchange

  constructor (name) {
    this.name = name
    this.exchange = null
  }

  addExchange (exchange) {
    this.exchange = exchange
  }

  sendMessage ({ payload, routingKey }) {
    const message = Message.create({
      payload,
      routingKey
    })
    this.exchange.sendMessageQueue(message)
  }

  static create ({ name }) {
    return new ExampleProducer(name)
  }
}
