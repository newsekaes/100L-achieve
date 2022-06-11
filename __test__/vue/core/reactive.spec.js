import { createReactive, effect } from 'code/vue/core/reactive.js'
import { jest } from '@jest/globals'

describe('test vue core', () => {
  describe('first: make a reactive', () => {
    let proxyData
    const data = {
      foo: 'bar'
    }
    beforeEach(() => {
      // console.log('first: beforeEach')
      proxyData = createReactive(data)
    })
    it('reactive getter is work', () => {
      expect(proxyData.foo).toEqual(data.foo)
    })
    it('reactive setter is work', () => {
      proxyData.foo = 'bar2'
      expect(data.foo).toEqual('bar2')
    })
    describe('then: regist an effect', () => {
      let print = ''
      let fn
      beforeEach(() => {
        // console.log('second: beforeEach')
        fn = jest.fn().mockImplementation(() => {
          print = proxyData.foo
        })
        effect(fn)
      })
      it('effect is work', () => {
        expect(print).toEqual(proxyData.foo)
      })
      it('trigger is work', () => {
        expect(fn).toBeCalledTimes(1)
        proxyData.foo = 'bar2'
        expect(print).toEqual('bar2')
        expect(fn).toBeCalledTimes(2)
      })
    })
  })
})
