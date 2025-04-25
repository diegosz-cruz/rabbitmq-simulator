import { Exchange } from "./base/Exchange.js";
import { Binding } from "./Binding.js";

export class ExchangeFanout extends Exchange {

  constructor(name) {
    super(name)
  }

  createBinding(queue) {
    const existsBindingWithQueue =
      this
        .bindings
        .find(bd => bd.queue.id === queue.id)

    if (existsBindingWithQueue) return

    this.bindings.push(Binding.create({
      exchange: this,
      queue,
    }))
  }

  removeBinding(bindingId) {
    this.bindings = this.bindings.filter(bd => bd.id !== bindingId)
  }

  sendMessageQueue(message) {
    for (const { queue } of this.bindings) {
      queue.addMessageInQueue(message)
    }
  }

  static create({ name }) {
    return new ExchangeFanout(name)
  }
}