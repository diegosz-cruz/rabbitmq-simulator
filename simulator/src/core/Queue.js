import { Message } from "./Message.js"
import { randomUUID } from 'node:crypto'

export class Queue {
  id
  name
  messages = []
  consumers = []
  consumerIndex = 0
  isDelivering = false

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
    this.deliver()
  }

  removeConsumer(consumerId) {
    this.consumers = this.consumers.filter(consumer => consumer.id !== consumerId)
  }

  addMessageInQueue(message) {
    if (!(message instanceof Message)) throw new Error('Invalid type Message')
    this.messages.push(message)

    this.deliver()
  }

  deliver() {
    if (this.isDelivering) {
      return // Já está entregando, deixa continuar
    }
    this.isDelivering = true

    const deliverNext = () => {
      if (!this.hasMessages() || !this.hasConsumers()) {
        this.isDelivering = false
        return
      }
      const message = this.firstMessageFromQueue()
      const consumer = this.consumers[this.consumerIndex % this.consumers.length]

      consumer.readMsg(message)
      this.consumerIndex++

      setTimeout(deliverNext, 0) // Deixar o event loop rodar e depois entregar a próxima
    }
    
    setTimeout(deliverNext, 0) 
  }



  static create({ name }) {
  return new Queue(name)
}

}