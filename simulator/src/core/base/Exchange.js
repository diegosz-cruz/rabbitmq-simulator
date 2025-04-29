import { randomUUID } from 'node:crypto'

export class Exchange {
  id
  name 
  bindings = []
  // producers = []

  constructor (name) {
    this.id = randomUUID()
    this.name = name
  }
  
  sendMessageQueue () {
    throw new Error('Method not implemented!')
  }

  createBinding () {
    throw new Error('Method not implemented!')
  }

  // addProducer (producer) {
  //   this.producers.push(producer)
  // }

  // removeProducer (producerId) {
  //   this.producers = this.producers.filter(prod => prod.id !== producerId)
  // }
}