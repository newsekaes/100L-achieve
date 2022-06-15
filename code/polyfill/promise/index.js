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
      self.resolvedCallbacks.map(cb => cb(value)) // 还未支持 .then 返回 promise
    }
  }
  function reject (reason) {
    if (self.status === 'pending') {
      self.reason = reason
      self.status = 'rejected'
      self.rejectedCallbacks.map(cb => cb(reason))
    }
  }
  try {
    callback(resolve, reject)
  } catch (err) {
    reject(err)
  }
}

MyPromise.prototype.then = function (onFullfilled, onRejected) {
  if (this.status === 'pending') {
    this.resolvedCallbacks.push(onFullfilled)
    this.rejectedCallbacks.push(onRejected)
  }

  if (this.status === 'resolved') {
    onFullfilled(this.value)
  }

  if (this.status === 'rejected') {
    onRejected(this.reason)
  }
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
