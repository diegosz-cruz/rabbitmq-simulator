import { randomUUID } from "node:crypto"

export class Binding {
  id
  exchange
  queue
  bindingKey

  constructor(exchange, queue, bindingKey) {
    this.id = randomUUID() 
    this.exchange = exchange
    this.queue = queue
    this.bindingKey = bindingKey
  }

  static create ({ exchange, queue, bindingKey = undefined }) {
    return new Binding(exchange, queue, bindingKey)
  }
}
