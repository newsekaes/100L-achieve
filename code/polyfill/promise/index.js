function isPromise (val) {
  return typeof val.then === 'function'
}

function MyPromise (callback) {
  const self = this
  // const state = {
  //   pending: 'pending',
  //   resolved: 'resolved',
  //   rejected: 'rejected'
  // }
  this.status = 'pending'
  this.value = undefined
  this.reason = undefined
  this.resolvedCallbacks = []
  this.rejectedCallbacks = []
  function resolve (value) {
    if (self.status === 'pending') {
      self.value = value
      self.status = 'resolved'
      self.resolvedCallbacks.forEach(({ onFullfilled, resolve, reject }) => {
        try {
          const callReturn = onFullfilled(value)
          if (isPromise(callReturn)) {
            callReturn.then(resolve, reject)
          } else {
            resolve(callReturn)
          }
        } catch (err) {
          reject(err)
        }
      }) // 还未支持 .then 返回 promise
    }
  }
  function reject (reason) {
    if (self.status === 'pending') {
      self.reason = reason
      self.status = 'rejected'
      self.rejectedCallbacks.forEach(({ onRejected, resolve, reject }) => {
        try {
          const callReturn = onRejected(reason)
          if (isPromise(callReturn)) {
            callReturn.then(resolve, reject)
          } else {
            resolve(callReturn)
          }
        } catch (err) {
          reject(err)
        }
      })
    }
  }
  try {
    callback(resolve, reject)
  } catch (err) {
    reject(err)
  }
}

MyPromise.prototype.then = function (onFullfilled, onRejected) {
  const self = this
  // 返回一个 Promise
  /* onFullfilled 和 onRejected 是 function， 可能返回一个 Promise 或 非Promise */
  /* 如果是 Promise， 需要把 Promise 的 resolve结果 或 reject原因 返回出去 */
  /* 如果 onRejected 缺失，为了将未处理的 error 传递下去，需要设置其默认值 */

  if (typeof onRejected === 'undefined') {
    onRejected = err => { throw err }
  }

  return new MyPromise((resolve, reject) => {
    if (this.status === 'pending') {
      onFullfilled && this.resolvedCallbacks.push({ onFullfilled, resolve, reject })
      this.rejectedCallbacks.push({ onRejected, resolve, reject })
    }

    if (this.status === 'resolved') {
      onFullfilled && resolve(onFullfilled(self.value))
    }

    if (this.status === 'rejected') {
      reject(onRejected(self.reason))
    }
  })
}

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
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

module.exports = {
  MyPromise
}
