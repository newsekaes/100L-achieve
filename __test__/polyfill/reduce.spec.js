const { reduce, reduce2 } = require('code/polyfill/reduce')

describe('Test simple reduce', function () {
  it('Has initial', function () {
    expect(reduce2.call([1, 2, 3, 4, 5], (sum, num) => sum + num, 0)).toEqual(15)
  })

  it('No initial', function () {
    expect(reduce2.call([1, 2, 3, 4, 5], (sum, num) => sum + num)).toEqual(15)
  })
})

describe('Test complex reduce', function () {
  it('Has initial', function () {
    expect(reduce.call([1, 2, 3, 4, 5], (sum, num) => sum + num, 0)).toEqual(15)
  })

  it('No initial', function () {
    expect(reduce.call([1, 2, 3, 4, 5], (sum, num) => sum + num)).toEqual(15)
  })

  it('Not array-like', function () {
    expect(() => {
      'use strict'
      reduce((sum, num) => sum + num)
    }).toThrowError('Not array-like')
  })

  it('Not function', function () {
    expect(() => {
      reduce.call([], 'any')
    }).toThrowError('Not function')
  })

  it('Not iterable', function () {
    expect(() => {
      const arr = new Array(6)
      reduce.call(arr, (sum, num) => sum + num)
    }).toThrowError('Not iterable')
  })

  it('Has empty', function () {
    const arr = []
    arr[3] = 3
    arr[8] = 8
    expect(reduce.call(arr, (sum, num) => sum + num)).toEqual(11)
  })
})
