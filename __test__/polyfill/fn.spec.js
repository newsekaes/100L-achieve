require('code/polyfill/fn')

describe('Test function', function () {
  describe('Test bind', () => {
    it('bind context', function () {
      const data = { foo: 'hello' }
      function getFoo () {
        return this.foo
      }
      expect(getFoo.myBind(data)()).toBe(data.foo)
    })

    it('bind context, exec with param', function () {
      const data = { foo: 'hello' }
      function getFoo (name) {
        return `${this.foo} ${name}`
      }
      expect(getFoo.myBind(data)('world')).toBe('hello world')
    })

    it('bind context and param', function () {
      const data = { foo: 'hello' }
      function getFoo (name) {
        return `${this.foo} ${name}`
      }
      const fnBind = getFoo.myBind(data, 'world')
      expect(fnBind()).toBe('hello world')
      expect(fnBind('universe')).toBe('hello world')
    })

    it('bind context and param, exec with rest param', function () {
      const data = { foo: 'hello' }
      function getFoo (name, symbol) {
        return `${this.foo} ${name} ${symbol}`
      }
      const fnBind = getFoo.myBind(data, 'world')
      expect(fnBind()).toBe('hello world undefined')
      expect(fnBind('!')).toBe('hello world !')
    })

    it('bind context, but use with new', function () {
      function Foo (name) {
        this.foo = name
      }
      // const o = { foo: 'unknown' }
      const o = function () {}
      o.foo = 'unknown'
      const Bar = Foo.myBind(o, 'Sam')
      const foo = new Bar('Tom')
      expect(o.foo).toBe('unknown')
      expect(foo.foo).toBe('Sam')
      expect(foo instanceof Foo).toBeTruthy()
    })
  })

  describe('Test call', function () {
    it('call context', function () {
      const data = { foo: 'hello' }
      function getFoo () {
        return this.foo
      }
      expect(getFoo.myCall(data)).toBe(data.foo)
    })

    it('call context and param', function () {
      const data = { foo: 'hello' }
      function getFoo (name) {
        return `${this.foo} ${name}`
      }
      expect(getFoo.myCall(data, 'world')).toBe('hello world')
    })
  })

  describe('Test apply', function () {
    it('apply context', function () {
      const data = { foo: 'hello' }
      function getFoo () {
        return this.foo
      }
      expect(getFoo.myApply(data)).toBe(data.foo)
    })

    it('call context and param', function () {
      const data = { foo: 'hello' }
      function getFoo (name) {
        return `${this.foo} ${name}`
      }
      expect(getFoo.myApply(data, ['world'])).toBe('hello world')
    })
  })
})
