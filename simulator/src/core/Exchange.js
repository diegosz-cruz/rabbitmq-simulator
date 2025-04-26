export class Exchange {
  name 
  type 
  binding

  constructor(name, type) {
    this.name = name
    this.type = type
  }

  create ({ name, type }) {
    return new Exchange(name, type)
  }
}