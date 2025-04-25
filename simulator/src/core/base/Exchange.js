import { randomUUID } from 'node:crypto'

export class Exchange {
  id
  name 
  bindings = []

  constructor (name) {
    this.id = randomUUID()
    this.name = name
  }
  
  sendMessageQueue () {
    throw new Error('Method not implemented!')
  }
}