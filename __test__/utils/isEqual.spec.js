import { isEqual } from 'code/utils/isEqual.js'
describe('Test deep isEqual', () => {
  describe('Primitive value case', () => {
    it('String ', function () {
      expect(isEqual('a', 'b')).toBeFalsy()
      expect(isEqual('a', 'a')).toBeTruthy()
    })

    it('Number ', function () {
      expect(isEqual(1, 2)).toBeFalsy()
      expect(isEqual(2, 2)).toBeTruthy()
      expect(isEqual(NaN, NaN)).toBeFalsy()
    })

    it('Boolean ', function () {
      expect(isEqual(true, false)).toBeFalsy()
      expect(isEqual(false, false)).toBeTruthy()
    })

    it('Undefined ', function () {
      expect(isEqual(undefined, undefined)).toBeTruthy()
      expect(isEqual(undefined, 1)).toBeFalsy()
      expect(isEqual(undefined, 'a')).toBeFalsy()
      expect(isEqual(undefined, true)).toBeFalsy()
      expect(isEqual(undefined, false)).toBeFalsy()
      expect(isEqual(undefined, Symbol('symbol'))).toBeFalsy()
    })

    it('Null ', function () {
      expect(isEqual(null, null)).toBeTruthy()
      expect(isEqual(null, 1)).toBeFalsy()
      expect(isEqual(null, 'a')).toBeFalsy()
      expect(isEqual(null, true)).toBeFalsy()
      expect(isEqual(null, false)).toBeFalsy()
      expect(isEqual(null, Symbol('symbol'))).toBeFalsy()
    })

    it('Symbol ', function () {
      const s = Symbol('symbol')
      expect(isEqual(s, s)).toBeTruthy()
      expect(isEqual(s, Symbol('symbol'))).toBeFalsy()
    })
  })
  describe('Object case', function () {
    it('Has different keys', function () {
      const obj1 = {
        a: 'a',
        b: 'b',
        c: 'c'
      }
      const obj2 = {
        a: 'a'
      }
      expect(isEqual(obj1, obj2)).toBeFalsy()
      expect(isEqual(obj2, obj1)).toBeFalsy()
    })

    it('Same key but different value', function () {
      const obj1 = {
        a: 'c',
        b: 'b',
        c: 'c'
      }
      const obj2 = {
        a: 'a',
        b: 'b',
        c: 'c'
      }
      expect(isEqual(obj1, obj2)).toBeFalsy()
    })

    describe('Multi level deep object', () => {
      let obj1 = {}
      let obj2 = {}
      beforeEach(() => {
        const s = Symbol('s')
        obj1 = {
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
        obj2 = {
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
      })
      it('Equal', function () {
        expect(isEqual(obj1, obj2)).toBeTruthy()
      })
    })
  })
})
