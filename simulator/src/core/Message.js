import { randomUUID } from 'node:crypto'

export class Message {
  id
  payload
  routingKey
  seconds

  constructor(payload, routingKey, seconds) {
    this.id = randomUUID()
    this.payload = payload
    this.routingKey = routingKey
    this.seconds = Math.abs(seconds)
  }

  static create ({ payload, routingKey = undefined, seconds = 0 }) {
    return new Message(payload, routingKey, seconds)
  }
}
