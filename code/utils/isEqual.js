function isObject (target) {
  return typeof target === 'object' && target !== null
}

function isEqual (obj1, obj2) {
  // 基本类型
  if (!isObject(obj1) && !isObject(obj2)) {
    return obj1 === obj2
  }
  // 如果是 同一个 引用类型
  if (obj1 === obj2) {
    return true
  }
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) {
    return false
  } else if (!keys1.every(key => keys2.includes(key))) { /* 提前判断一下 key 是否有差异，避免浪费额外的深度遍历 */
    return false
  }
  return keys1.every(key => isEqual(obj1[key], obj2[key]))
}

module.exports = { isEqual }
