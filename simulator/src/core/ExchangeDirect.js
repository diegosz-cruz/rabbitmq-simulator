import { Exchange } from "./base/Exchange.js";
import { Binding } from "./Binding.js";

export class ExchangeDirect extends Exchange {

  constructor(name) {
    super(name)
  }

  createBinding(queue, routingKey) {
    const existsBindingWithRoutingAndQueue =
      this
        .bindings
        .find(bd => bd.routingKey === routingKey && bd.queue.id === queue.id)

    if (existsBindingWithRoutingAndQueue) return

    this.bindings.push(Binding.create({
      exchange: this,
      queue,
      routingKey
    }))
  }

  removeBinding(bindingId) {
    this.bindings = this.bindings.filter(bd => bd.id !== bindingId)
  }

  sendMessageQueue(message) {
    for (const { routingKey, queue } of this.bindings) {
      if (routingKey === message.routingKey) { 
        queue.addMessageInQueue(message)
      }
    }
  }

  static create({ name }) {
    return new ExchangeDirect(name)
  }
}
