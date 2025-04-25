export class Binding {
  exchange
  queue
  routingKey

  constructor(exchange, queue, routingKey) {
    this.exchange = exchange
    this.queue = queue
    this.routingKey = routingKey
  }

  static create ({ exchange, queue, routingKey = undefined }) {
    return new Binding(exchange, queue, routingKey)
  }
}
