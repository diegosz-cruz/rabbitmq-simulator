import { Exchange } from "./base/Exchange.js";
import { Binding } from "./Binding.js";

export class ExchangeDirect extends Exchange {

  constructor(name) {
    super(name)
  }

  createBinding(queue, bindingKey) {
    const existsBindingWithRoutingAndQueue =
      this
        .bindings
        .find(bd => bd.bindingKey === bindingKey && bd.queue.id === queue.id)

    if (existsBindingWithRoutingAndQueue) return

    this.bindings.push(Binding.create({
      exchange: this,
      queue,
      bindingKey
    }))
  }

  removeBinding(bindingId) {
    this.bindings = this.bindings.filter(bd => bd.id !== bindingId)
  }

  sendMessageQueue(message) {
    for (const { bindingKey, queue } of this.bindings) {
      if (bindingKey === message.routingKey) { 
        queue.addMessageInQueue(message)
      }
    }
  }

  static create({ name }) {
    return new ExchangeDirect(name)
  }
}
