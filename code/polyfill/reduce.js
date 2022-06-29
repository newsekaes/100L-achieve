function reduce (callback/* , initialValue */) {
  'use strict'
  if (this === null || this === undefined) {
    throw new TypeError('Not array-like')
  }

  if (typeof callback !== 'function') {
    throw new TypeError('Not function')
  }

  const o = Object(this)

  const len = o.length >>> 0 // 当 length 为 falsy 时，结果为0；当 length 可以被转为 Number 型时，转为 Number

  let k = 0
  let value

  if (arguments.length >= 2) {
    value = arguments[1]
  } else {
    /* 跳过空值，例如：const arr = []; arr[3] = 3; 那么前面的几个索引不存在 */
    while (k < len && !(k in o)) {
      k++
    }

    if (k >= len) {
      throw new TypeError('Not iterable')
    }

    value = o[k++]
  }

  while (k < len) {
    /* 跳过 空 */
    if (k in o) {
      value = callback(value, o[k], k, o)
    }
    k++
  }

  return value
}

function reduce2 (callback, initialValue) {
  const arr = this
  let value = typeof initialValue === 'undefined' ? arr[0] : initialValue
  const startPoint = typeof initialValue === 'undefined' ? 1 : 0
  arr.slice(startPoint).forEach((item, index) => {
    value = callback(value, item, index, arr)
  })
  return value
}

module.exports = { reduce, reduce2 }
