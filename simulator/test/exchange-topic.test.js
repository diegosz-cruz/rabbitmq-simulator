import { it, expect, describe, beforeAll, jest } from '@jest/globals'
import { ExchangeTopic } from '../src/core/ExchangeTopic.js'

describe('Exchange Topic Test Suite', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })

  it('should return a valids matches when hash(#) is start', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.b', 'b.x.y.a.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('#.b.c', 'a.b.c')).toBe(true)  
    expect(exchangeTopic.matchBindingAndRoutingKey('#.b.c', 'b.c')).toBe(true)  
    expect(exchangeTopic.matchBindingAndRoutingKey('#.b.c', 'b.x.c')).toBe(false)  
    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.b', 'b.x.y.a.b.c')).toBe(false)
  })

  it('should return a valids matches when hash(#) is end', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('a.x.#', 'a.x.y.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.#', 'a.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.#', 'a.b.c.d')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#', 'aa.b')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.#', 'a.x.b')).toBe(false)
  })

  it('should return a valids matches when hash(#) is middle', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.b', 'a.x.y.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.b', 'a.b')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.b', 'a.b.x')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.b', 'x.a.b')).toBe(false)
  })

  it('should return a valids matches when asteristic(*) is present', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })

    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.*', 'a.b.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.b.*', 'a.b.c.d')).toBe(false)  
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.c', 'a.x.c')).toBe(true)  
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.c', 'a.x.d')).toBe(false)  
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.*', 'a.b.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.*', 'a.b')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('*.log', 'a.log')).toBe(true) 
    expect(exchangeTopic.matchBindingAndRoutingKey('*.log', 'a.log.b')).toBe(false)
  })

  it('should return a valids matches when asteristic(*) ans hash(#) is present', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })
    
    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.*', 'x.y.a.z')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.#', 'a.b.c.d')).toBe(true)  
    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.*.c', 'x.a.y.c')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.*.#', 'a.b.c.d.e')).toBe(true)
    expect(exchangeTopic.matchBindingAndRoutingKey('#', 'a.b.c')).toBe(true) 
    expect(exchangeTopic.matchBindingAndRoutingKey('*.#.b', 'x.y.z.b')).toBe(true)  
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.*', 'a.b.c.z')).toBe(true)  
    
    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.*', 'x.y.b.z')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.#', 'a')).toBe(false)  
    expect(exchangeTopic.matchBindingAndRoutingKey('a.#.*', 'a.b')).toBe(false)  
    expect(exchangeTopic.matchBindingAndRoutingKey('*.#.b', 'x.b')).toBe(false)  
    expect(exchangeTopic.matchBindingAndRoutingKey('#.a.*.c', 'x.b.y.c')).toBe(false)
    expect(exchangeTopic.matchBindingAndRoutingKey('a.*.*.#', 'a.b')).toBe(false)
  })
  
  it('should throw a error when bindingKey have 2 or + hash sign(#)', () => {
    const exchangeTopic = ExchangeTopic.create({
      name: 'ex1'
    })
    
    expect(() => exchangeTopic.matchBindingAndRoutingKey('#.a.*.#', 'a.b.c'))
      .toThrow('Invalid binding key!')

    expect(() => exchangeTopic.matchBindingAndRoutingKey('##', 'a.b.c'))
      .toThrow('Invalid binding key!')
  }) 

}) 
 



// Hash middle

