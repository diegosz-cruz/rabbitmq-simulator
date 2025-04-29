import { randomUUID } from 'node:crypto'

export class ExampleConsumer {
  id
  name

  constructor(name) {
    this.id = randomUUID()
    this.name = name
  }

  readMsg (message) {
    console.log(`message: ${message.payload}`) 
  }

  static create({ name }) {
    return new ExampleConsumer(name)
  }
}