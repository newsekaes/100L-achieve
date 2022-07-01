function isPromise (val) {
  return typeof val.then === 'function'
}

function isThenable (target) {
  return typeof target === 'object' && typeof target.then === 'function'
}

function MyPromise (callback) {
  const self = this
  this.status = 'pending' // 'pending' 'fulfilled' 'rejected'
  this.value = undefined
  this.reason = undefined
  this.onFulfilledArray = []
  this.onRejectedArray = []

  function resolve (value) {
    if (value instanceof MyPromise) {
      value.then(resolve, reject)
    } else if (isThenable(value)) {
      try {
        value.then(resolve, reject)
      } catch (err) {
        reject(err)
      }
    } else {
      setTimeout(() => {
        if (self.status === 'pending') {
          self.value = value
          self.status = 'fulfilled'
          self.onFulfilledArray.forEach(fn => fn(value))
        }
      })
    }
  }

  function reject (reason) {
    setTimeout(() => {
      if (self.status === 'pending') {
        self.reason = reason
        self.status = 'rejected'
        self.onRejectedArray.forEach(fn => fn())
      }
    })
  }

  try {
    callback(resolve, reject)
  } catch (err) {
    reject(err)
  }
}

MyPromise.prototype.then = function (onFulfilled = res => res, onRejected = err => { throw err }) {
  // 返回一个 Promise
  /* onFulfilled 和 onRejected 是 function， 可能返回一个 Promise 或 非Promise */
  /* 如果是 Promise， 需要把 Promise 的 resolve结果 或 reject原因 返回出去 */
  /* 如果 onRejected 缺失，为了将未处理的 error 传递下去，需要设置其默认值 */

  return new MyPromise((resolve, reject) => {
    const onFulfilledFunc = () => {
      try {
        const result = onFulfilled(this.value)
        resolve(result)
      } catch (e) {
        reject(e)
      }
    }

    const onRejectedFunc = () => {
      try {
        const result = onRejected(this.reason)
        resolve(result)
      } catch (e) {
        reject(e)
      }
    }

    if (this.status === 'pending') {
      this.onFulfilledArray.push(onFulfilledFunc)
      this.onRejectedArray.push(onRejectedFunc)
    }

    if (this.status === 'resolved') {
      setTimeout(onFulfilledFunc)
    }

    if (this.status === 'rejected') {
      setTimeout(onRejectedFunc)
    }
  })
}

MyPromise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected)
}

MyPromise.resolve = function (value) {
  return new MyPromise(resolve => resolve(value))
}

MyPromise.reject = function (value) {
  return new MyPromise((resolve, reject) => reject(value))
}

MyPromise.race = function (promises) {
  return new Promise((resolve, reject) => {
    try {
      promises.forEach(promise => {
        isPromise(promise)
          ? promise.then(resolve, reject)
          : resolve(promise)
      })
    } catch (e) {
      reject(e)
    }
  })
}

MyPromise.all = function (promises) {
  return new Promise((resolve, reject) => {
    const arr = []
    let index = 0
    const processData = (key, data) => {
      arr[key] = data
      if (++index === promises.length) {
        return resolve(arr)
      }
    }
    for (let i = 0; i < promises.length; i++) {
      const result = promises[i]
      if (isPromise(result)) {
        result.then(data => {
          processData(data)
        }, reject)
      } else {
        processData(i, result)
      }
    }
  })
}

function runPromiseInSequence (array, value) {
  return array.reduce((prePromise, promiseFactory) =>
    prePromise.then(promiseFactory)
  , Promise.resolve(value))
}

module.exports = {
  MyPromise,
  runPromiseInSequence
}
