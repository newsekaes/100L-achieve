const { MyPromise, runPromiseInSequence } = require('code/polyfill/promise/index')
const { runPromiseByLimit, runPromiseByLimit2 } = require('code/polyfill/promise/runPromiseByLimit')

describe('Test Promise polyfill', () => {
  describe('Test single', function () {
    it('Test resolve async', async function () {
      const fn = jest.fn()
      await new MyPromise((resolve) => {
        setTimeout(() => {
          resolve('hello')
        }, 0)
      }).then(fn)
      expect(fn).toBeCalledWith('hello')
    })
    it('Test resolve sync', async function () {
      const fn = jest.fn()
      await new MyPromise((resolve) => {
        resolve('hello')
      }).then(fn)
      expect(fn).toBeCalledWith('hello')
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
      const onFulfilledA = jest.fn()
      const onFulfilledB = jest.fn()
      const onFulfilledC = jest.fn()
      const onFulfilledD = jest.fn()

      await new Promise(resolve => {
        new MyPromise((resolve) => {
          setTimeout(() => {
            resolve('result a')
          }, 0)
        }).then(result => {
          onFulfilledA(result)
          return new MyPromise(resolve => {
            setTimeout(() => {
              resolve('result b')
            }, 0)
          })
        }).then(result => {
          onFulfilledB(result)
          return new MyPromise(resolve => {
            resolve('result c')
          })
        }).then(result => {
          onFulfilledC(result)
          return 'result d'
        }).then(result => {
          onFulfilledD(result)
          resolve()
        })
      })

      expect(onFulfilledA).toBeCalledWith('result a')
      expect(onFulfilledB).toBeCalledWith('result b')
      expect(onFulfilledC).toBeCalledWith('result c')
      expect(onFulfilledD).toBeCalledWith('result d')
    })

    it('Test catch-then', async function () {
      const onFulfilled = jest.fn()
      const onRejected = jest.fn()
      const err = new Error('error a')

      await new Promise(resolve => {
        new MyPromise((resolve, reject) => {
          reject(err)
        }).catch(e => {
          onRejected(e)
          return new MyPromise(resolve => {
            resolve('result a')
          })
        }).then(result => {
          onFulfilled(result)
          resolve()
        })
      })

      expect(onFulfilled).toBeCalledWith('result a')
      expect(onRejected).toBeCalledWith(err)
    })

    it('Test skip then but catch', async function () {
      const onFulfilled = jest.fn()
      const onRejected = jest.fn()
      const err = new Error('error a')

      await new Promise(resolve => {
        new MyPromise((resolve) => {
          throw err
        }).then(result => {
          onFulfilled(result)
        }).then(result => {
          onFulfilled(result)
        }).catch(reason => {
          onRejected(reason)
          resolve()
        })
      })

      expect(onFulfilled).toBeCalledTimes(0)
      expect(onRejected).toBeCalledWith(err)
    })

    it('Test skip first then but catch by second then', async function () {
      const onFulfilled = jest.fn()
      const onRejected = jest.fn()
      const err = new Error('error a')

      await new Promise(resolve => {
        new MyPromise((resolve) => {
          throw err
        }).then(result => {
          onFulfilled(result)
        }).then(null, reason => {
          onRejected(reason)
          resolve()
        })
      })

      expect(onFulfilled).toBeCalledTimes(0)
      expect(onRejected).toBeCalledWith(err)
    })

    it('Test then return promise A, and A has chain', async function () {
      const fn1Layer2 = jest.fn()
      const fn2Layer2 = jest.fn()
      const fn1Layer1 = jest.fn()

      await new Promise(resolve => {
        new MyPromise((resolve) => {
          setTimeout(() => {
            resolve('layer1-1')
          }, 5)
        }).then(result => {
          fn1Layer2(result)
          return new MyPromise(resolve => {
            setTimeout(() => {
              resolve('layer2-1')
            }, 5)
          }).then(result => {
            fn2Layer2(result)
            return new MyPromise(resolve => {
              setTimeout(() => {
                resolve('layer2-2')
              }, 5)
            })
          })
        }).then(result => {
          fn1Layer1(result)
          resolve()
        })
      })
      expect(fn1Layer2).toBeCalledWith('layer1-1')
      expect(fn2Layer2).toBeCalledWith('layer2-1')
      expect(fn1Layer1).toBeCalledWith('layer2-2')
    })

    it('Test finally', async function () {
      const finally1 = jest.fn()
      const finally2 = jest.fn()
      const finallyThen = jest.fn()
      const finallyCatch = jest.fn()

      await new Promise(resolve => {
        MyPromise.resolve(1).finally(finally1).then(finallyThen).then(resolve)
      })
      await new Promise(resolve => {
        MyPromise.reject(2).finally(finally2).catch(finallyCatch).then(resolve)
      })
      expect(finally1).toBeCalledTimes(1)
      expect(finally2).toBeCalledTimes(1)
      expect(finallyThen).toBeCalledWith(1)
      expect(finallyCatch).toBeCalledWith(2)
    })
  })

  describe('Test Promise.all', () => {
    it('Case fulfilled', async function () {
      const promises = [
        'a',
        new MyPromise(resolve => resolve('b')),
        new MyPromise(resolve => {
          setTimeout(() => resolve('c'), 0)
        })
      ]
      const result = await Promise.all(promises)
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('Case rejected', async function () {
      const err = new Error('error')
      const promises = [
        'a',
        new MyPromise(resolve => {
          throw err
        }),
        new MyPromise(resolve => {
          setTimeout(() => resolve('c'), 0)
        })
      ]
      try {
        await MyPromise.all(promises)
      } catch (e) {
        expect(err === e).toBeTruthy()
      }
    })
  })

  describe('Test Promise.race', () => {
    it('Case fulfilled', async function () {
      const promises = [
        'a',
        new MyPromise(resolve => resolve('b')),
        new MyPromise(resolve => {
          setTimeout(() => resolve('c'), 0)
        })
      ]
      const result = await Promise.race(promises)
      expect(result).toEqual('a')
    })

    it('Case rejected', async function () {
      const err = new Error('error')
      const promises = [
        'a',
        new MyPromise(resolve => {
          throw err
        }),
        new MyPromise(resolve => {
          setTimeout(() => resolve('c'), 0)
        })
      ]
      try {
        await MyPromise.race(promises)
      } catch (e) {
        expect(err === e).toBeTruthy()
      }
    })
  })

  describe('Test Promise.resolve', () => {
    it('Case fulfilled', async function () {
      const result = await MyPromise.resolve('hello')
      expect(result).toEqual('hello')
    })
  })

  describe('Test Promise.reject', () => {
    it('Case fulfilled', async function () {
      let result = null
      try {
        result = await MyPromise.reject('hello')
      } catch (err) {
        expect(err).toEqual('hello')
      }
      expect(result).toBe(null)
    })
  })
})

describe('Test runPromiseInSequence', () => {
  it('every pass', async function () {
    const fn1 = jest.fn().mockResolvedValue('a')
    const fn2 = jest.fn().mockResolvedValue('b')
    const fn3 = jest.fn()
    await new Promise(resolve => {
      fn3.mockImplementation(() => resolve())
      expect(runPromiseInSequence([fn1, fn2, fn3], 'init'))
    })
    expect(fn1).toBeCalledWith('init')
    expect(fn2).toBeCalledWith('a')
    expect(fn3).toBeCalledWith('b')
  })
})

describe('Test runPromiseByLimit', () => {
  describe('Test type 1', () => {
    it('Run by sync', async function () {
      const fnA = jest.fn().mockResolvedValue('a')
      const fnB = jest.fn().mockResolvedValue('b')
      const fnC = jest.fn().mockResolvedValue('c')
      const fnD = jest.fn().mockResolvedValue('d')
      const fnE = jest.fn().mockResolvedValue('e')

      const result = await runPromiseByLimit([fnA, fnB, fnC, fnD, fnE], 3)

      expect(result).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('Run by async', async function () {
      const promiseFactory = (time, value) => () => new Promise(resolve => {
        setTimeout(() => { resolve(value) }, time)
      })

      const fnA = promiseFactory(100, 'a')
      const fnB = promiseFactory(40, 'b')
      const fnC = promiseFactory(80, 'c')
      const fnD = promiseFactory(60, 'd')
      const fnE = promiseFactory(50, 'e')

      const result = await runPromiseByLimit([fnA, fnB, fnC, fnD, fnE], 3)

      expect(result).toEqual(['a', 'b', 'c', 'd', 'e'])
    })
  })

  describe('Test type 2', () => {
    it('Run by sync', async function () {
      const fnA = jest.fn().mockResolvedValue('a')
      const fnB = jest.fn().mockResolvedValue('b')
      const fnC = jest.fn().mockResolvedValue('c')
      const fnD = jest.fn().mockResolvedValue('d')
      const fnE = jest.fn().mockResolvedValue('e')

      const result = await runPromiseByLimit2([fnA, fnB, fnC, fnD, fnE], 3)

      expect(result).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('Run by async', async function () {
      const promiseFactory = (time, value) => () => new Promise(resolve => {
        setTimeout(() => { resolve(value) }, time)
      })

      const fnA = promiseFactory(100, 'a')
      const fnB = promiseFactory(40, 'b')
      const fnC = promiseFactory(80, 'c')
      const fnD = promiseFactory(60, 'd')
      const fnE = promiseFactory(50, 'e')

      const result = await runPromiseByLimit2([fnA, fnB, fnC, fnD, fnE], 3)

      expect(result).toEqual(['a', 'b', 'c', 'd', 'e'])
    })
  })
})
