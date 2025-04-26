import { Exchange } from "./base/Exchange.js";
import { Binding } from "./Binding.js";

export class ExchangeTopic extends Exchange {

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

  matchesAsterisk(bindingParts, routingParts) {
    if (bindingParts.length !== routingParts.length) return false
    return !!(bindingParts.every((part, i) => part === '*' || part === routingParts[i]))
  }

  joinAndCompareArrays(a, b) {
    return a.join('.') === b.join('.')
  }

  matchBindingAndRoutingKey(bindingKey, routingKey) {
    if ((bindingKey.match(/#/g) || []).length >= 2) throw new Error('Invalid binding key!')

    const bindingParts = bindingKey.split('.')
    const routingParts = routingKey.split('.')
 
    if (bindingKey.includes('#')) {
      if (bindingParts.length === 1) return true
      const hashSignIndex = bindingParts.indexOf('#')

      const beforeHash = bindingParts.slice(0, hashSignIndex)
      const afterHash = bindingParts.slice(hashSignIndex + 1, bindingParts.length)

      if (hashSignIndex === 0) {
        const nextMatchAfterHash = routingParts.indexOf(bindingParts[hashSignIndex + 1])
        const afterMatch = routingParts.slice(nextMatchAfterHash, routingParts.length)

        if (afterHash.includes('*')) return this.matchesAsterisk(afterHash, afterMatch)

        return afterHash.join('.') === afterMatch.join('.')
      }

      if (hashSignIndex === bindingParts.length - 1) {
        const afterMatch = routingParts.slice(0, hashSignIndex)
        if (beforeHash.includes('*')) return this.matchesAsterisk(beforeHash, afterMatch)

        return beforeHash.join('.') === afterMatch.join('.')
      }

      const nextMatchAfterHash = routingParts.indexOf(bindingParts[hashSignIndex + 1])
      if (
        bindingParts.includes('*') &&
          bindingParts.length > routingParts.length
        ) return false

      const afterHashRouting = routingParts.slice(nextMatchAfterHash, routingParts.length)

      const beforeHashRouting = routingParts.slice(0, hashSignIndex)
      
      if(beforeHash.includes('*')) {
        if (1 === 2) return false
        if (!this.matchesAsterisk(beforeHash, beforeHashRouting)) return false 
      } else if (beforeHash.join('.') !== beforeHashRouting.join('.')) {
        return false
      }
     
      if(afterHash.includes('*')) {
        if (!this.matchesAsterisk(afterHash, afterHashRouting)) return false 
      } else if (afterHash.join('.') !== afterHashRouting.join('.')) {
        return false
      }

      return true 

    } 
    if (bindingKey.includes('*')) {
      return this.matchesAsterisk(bindingParts, routingParts)
    }
  }

  static create({ name }) {
    return new ExchangeTopic(name)
  }
}
