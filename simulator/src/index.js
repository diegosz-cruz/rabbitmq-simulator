import { Consumer } from "./consumers/Consumer.js";
import { Broker } from "./core/Broker.js";
import { Producer } from "./producers/Producer.js";

const broker = Broker.create()

const p1 = Producer.create({ name: 'p1' })

const ex1 = broker.createExchange({ type: 'topic', name: 'ex1' })
const q1 = broker.createQueue({ name: 'q1' })
const q2 = broker.createQueue({ name: 'q2' })
const q3 = broker.createQueue({ name: 'q3' }) 

const c1 = Consumer.create({ name: 'c1' })
const c2 = Consumer.create({ name: 'c2' })
const c3 = Consumer.create({ name: 'c3' })

p1.addExchange(ex1)

broker.createBindingExchangeWithQueue({
  exchangeId: ex1.id,
  queueId: q1.id,
  bindingKey: 'compras'
})
broker.createBindingExchangeWithQueue({
  exchangeId: ex1.id,
  queueId: q2.id,
  bindingKey: 'compras.#'
})
broker.createBindingExchangeWithQueue({
  exchangeId: ex1.id,
  queueId: q3.id,
  bindingKey: 'venda.*'
})

p1.sendMessage({
  payload: 'data1', 
  routingKey: 'compras'
})
p1.sendMessage({
  payload: 'data2',
  routingKey: 'compras'
})
p1.sendMessage({
  payload: 'data3',
  routingKey: 'venda.abc'
}) 

broker.addConsumerInQueue(c1, q1.id)
broker.addConsumerInQueue(c2, q1.id) 
broker.addConsumerInQueue(c2, q2.id)
broker.addConsumerInQueue(c3, q3.id)

