const { MyPromise } = require('code/polyfill/promise/index')
const { resolve } = require('eslint-plugin-promise/rules/lib/promise-statics')

describe('Test Promise polyfill', () => {
  describe('Test single', function () {
    it('Test resolve async', async function () {
      const result = await new MyPromise((resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 0)
      })
      expect(result).toEqual(true)
    })
    it('Test resolve sync', async function () {
      const result = await new MyPromise((resolve) => {
        resolve('hello')
      })
      expect(result).toEqual('hello')
    })
    it('Test reject', async function () {
      try {
        await new MyPromise((resolve, reject) => {
          setTimeout(() => {
            reject('error')
          }, 0)
        })
      } catch (err) {
        expect(err).toEqual('error')
      }
    })
    it('Test catch', async function () {
      const onRejected = jest.fn().mockImplementation(() => Promise.resolve())
      await new Promise(resolve => {
        const p = new MyPromise((resolve, reject) => {
          setTimeout(() => {
            reject(false)
          }, 0)
        })
        p.catch(reason => {
          onRejected(reason)
          resolve()
        })
      })
      expect(onRejected).toBeCalledWith(false)
    })
  })

  describe('Test chain', function () {
    it('Test then', async function () {
      const onFullfilledA = jest.fn()
      const onFullfilledB = jest.fn()
      const onFullfilledC = jest.fn()
      const onFullfilledD = jest.fn()

      await new Promise(resolve => {
        new MyPromise((resolve) => {
          setTimeout(() => {
            resolve('result a')
          }, 0)
        }).then(result => {
          onFullfilledA(result)
          return new MyPromise(resolve => {
            setTimeout(() => {
              resolve('result b')
            }, 0)
          })
        }).then(result => {
          onFullfilledB(result)
          return new MyPromise(resolve => {
            resolve('result c')
          })
        }).then(result => {
          onFullfilledC(result)
          return 'result d'
        }).then(result => {
          onFullfilledD(result)
          resolve()
        })
      })

      expect(onFullfilledA).toBeCalledWith('result a')
      expect(onFullfilledB).toBeCalledWith('result b')
      expect(onFullfilledC).toBeCalledWith('result c')
      expect(onFullfilledD).toBeCalledWith('result d')
    })

    // it('Test catch-then', async function () {
    //   const onFullfilled = jest.fn()
    //   const onRejected = jest.fn()
    //   const err = new Error('error a')
    //
    //   await new Promise(resolve => {
    //     new MyPromise((resolve, reject) => {
    //       reject(err)
    //     }).catch(e => {
    //       onRejected(e)
    //       return new MyPromise(resolve => {
    //         resolve('result a')
    //       })
    //     }).then(result => {
    //       onFullfilled(result)
    //       resolve()
    //     })
    //   })
    //
    //   expect(onFullfilled).toBeCalledWith('result a')
    //   expect(onRejected).toBeCalledWith(err)
    // })

    it('Test skip then but catch', async function () {
      const onFullfilled = jest.fn()
      const onRejected = jest.fn()
      const err = new Error('error a')

      await new Promise(resolve => {
        new MyPromise((resolve) => {
          throw err
        }).then(result => {
          onFullfilled(result)
        }).catch(reason => {
          onRejected(reason)
          resolve()
        })
      })

      expect(onFullfilled).toBeCalledTimes(0)
      expect(onRejected).toBeCalledWith(err)
    })

    it('Test skip first then but catch by second then', async function () {
      const onFullfilled = jest.fn()
      const onRejected = jest.fn()
      const err = new Error('error a')

      await new Promise(resolve => {
        new MyPromise((resolve) => {
          throw err
        }).then(result => {
          onFullfilled(result)
        }).then(null, reason => {
          onRejected(reason)
          resolve()
        })
      })

      expect(onFullfilled).toBeCalledTimes(0)
      expect(onRejected).toBeCalledWith(err)
    })
  })

  describe('Test Promise.all', () => {
    it('Case fullfilled', async function () {
      const promises = [
        'a',
        new MyPromise(resolve => resolve('b')),
        new MyPromise(resolve => { setTimeout(() => resolve('c'), 0) })
      ]
      const result = await Promise.all(promises)
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('Case rejected', async function () {
      const err = new Error('error')
      const promises = [
        'a',
        new MyPromise(resolve => { throw err }),
        new MyPromise(resolve => { setTimeout(() => resolve('c'), 0) })
      ]
      try {
        await MyPromise.all(promises)
      } catch (e) {
        expect(err === e).toBeTruthy()
      }
    })
  })
})
