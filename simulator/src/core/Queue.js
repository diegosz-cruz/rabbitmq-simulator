import { Message } from "./Message.js"
import { randomUUID } from 'node:crypto'

export class Queue {
  id
  name
  messages = [] 
  consumers = [] 
  consumerIndex = 0

  constructor(name) {
    this.id = randomUUID()
    this.name = name
  }

  hasMessages() {
    return this.messages.length > 0
  }

  hasConsumers() {
    return this.consumers.length > 0
  }

  firstMessageFromQueue() {
    return this.messages.shift()
  }

  addConsumer(consumer) {
    this.consumers.push(consumer)
  }

  removeConsumer(consumerId) {
    this.consumers = this.consumers.filter(consumer => consumer.id !== consumerId)
  }

  addMessageInQueue(message) {
    if (!(message instanceof Message)) throw new Error('Invalid type Message')
    this.messages.push(message)

    this.sendMessage()
  }

  sendMessage() {
    while (this.hasMessages() && this.hasConsumers()) {
      const message = this.firstMessageFromQueue()
      const consumer = this.consumers[this.consumerIndex % this.consumers.length]

      consumer.readMsg(message)
      this.consumerIndex++
    }
  }

  static create({ name }) {
    return new Queue(name)
  }

}
