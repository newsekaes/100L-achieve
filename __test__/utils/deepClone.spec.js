const deepClone = require('code/utils/deepClone.js')
describe('Test deep clone', () => {
  describe('Primitive value case', () => {
    it('String ', function () {
      expect(deepClone('a')).toEqual('a')
    })

    it('Number ', function () {
      expect(deepClone(1)).toEqual(1)
    })

    it('Boolean ', function () {
      expect(deepClone(false)).toEqual(false)
    })

    it('Undefined ', function () {
      expect(deepClone(undefined)).toEqual(undefined)
    })

    it('Null', function () {
      expect(deepClone(null)).toEqual(null)
    })

    it('Symbol ', function () {
      const s = Symbol('symbol')
      expect(deepClone(s)).toEqual(s)
    })
  })
  describe('Object case', function () {
    it('Has different keys', function () {
      const obj1 = {
        a: 'a',
        b: 'b',
        c: 'c'
      }
      expect(deepClone(obj1)).toEqual(obj1)
    })

    describe('Multi level deep object', () => {
      it('Equal', function () {
        const s = Symbol('symbol')
        const obj = {
          a: 'a',
          b: 1,
          c: true,
          d: s,
          e: null,
          f: undefined,
          g: {
            foo: 'bar',
            des: ['1', 2, true, {
              final: null
            }]
          }
        }
        expect(deepClone(obj)).toEqual(obj)
      })
    })
  })
})
