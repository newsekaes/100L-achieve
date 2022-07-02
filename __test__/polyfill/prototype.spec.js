const { inherit } = require('code/polyfill/prototype')

describe('Test prototype', () => {
  describe('Test inherit', () => {
    const testSay = jest.fn()
    const testToSay = jest.fn()
    function Parent (name) {
      this.name = name
    }
    Parent.prototype.say = function () {
      testSay(this.name)
    }
    Parent.toSay = function (parent) {
      testToSay(parent.name)
    }

    const testOld = jest.fn()
    const testToOld = jest.fn()

    function Child (year, name) {
      this.year = year
      Child.super.call(this, name)
    }
    Child.prototype.howOLd = function () {
      testOld(this.year)
    }
    Child.toHowOld = function (child) {
      testToOld(child.year)
    }

    inherit(Child, Parent)

    let child

    beforeEach(() => {
      child = new Child(14, 'Tom')
    })

    it('Check instance property', function () {
      expect(child.name).toBe('Tom')
      expect(child.year).toBe(14)
    })

    it('Check instance prototype property', function () {
      child.say()
      child.howOLd()
      expect(testSay).toBeCalledWith('Tom')
      expect(testOld).toBeCalledWith(14)
    })

    it('Check constructor static property', function () {
      Child.toSay(child)
      Child.toHowOld(child)
      expect(testToSay).toBeCalledWith('Tom')
      expect(testToOld).toBeCalledWith(14)
    })
  })
})
