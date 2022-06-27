const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null

const canTravel = {
  '[object Map]': true,
  '[object Set]': true,
  '[object Array]': true,
  '[object Object]': true
}

const typeToStringMap = {
  Map: '[object Map]',
  Set: '[object Set]',
  Array: '[object Array]',
  Object: '[object Object]',
  Boolean: '[object Boolean]',
  Number: '[object Number]',
  String: '[object String]',
  Date: '[object Date]',
  Error: '[object Error]',
  RegExp: '[object RegExp]',
  Function: '[object Function]',
  Symbol: '[object Symbol]'
}

function handleRegExp (target) {
  const { source, flags } = target
  return new target.constructor(source, flags)
}

function handleFunc (func) {
  /* 箭头函数没有Prototype */
  if (!func.prototype) {
    return func
  }
  const bodyReg = /(?<=\{)(.|\n)+(?=\})/m
  const paramReg = /(?<=\().+(?=\)\s+\{)/
  const funcString = func.toString()
  const param = paramReg.exec(funcString)
  const body = bodyReg.exec(funcString)
  if (!body) return null
  if (param) {
    const paramArr = param[0].split(',')
    return new Function(...paramArr, body[0])
  } else {
    return new Function(body[0])
  }
}

function handleNotTravel (target, tag) {
  const TargetConstructor = target.constructor
  switch (tag) {
    // 针对一些被 Object Wrapper 包装过的基本类型
    case typeToStringMap.Boolean:
      return new Object(Boolean.prototype.valueOf.call(target))
    case typeToStringMap.Number:
      return new Object(Number.prototype.valueOf.call(target))
    case typeToStringMap.String:
      return new Object(String.prototype.valueOf.call(target))
    case typeToStringMap.Symbol:
      return new Object(Symbol.prototype.valueOf.call(target))
    case typeToStringMap.Date:
    case typeToStringMap.Error:
      return new TargetConstructor(target)
    case typeToStringMap.RegExp:
      return handleRegExp(target)
    case typeToStringMap.Function:
      return handleFunc(target)
    default:
      return new TargetConstructor(target)
  }
}

function getObjectToStringName (obj) {
  return Object.prototype.toString.call(obj)
}

function deepClone (target, context = { map: new WeakMap() }) {
  const { map } = context
  if (map.get(target)) {
    return target
  }
  if (isObject(target)) {
    map.set(target, true)
    let cloneTarget
    const objToStringName = getObjectToStringName(target)

    if (!canTravel[objToStringName]) {
      handleNotTravel(target, objToStringName)
    } else {
      const TargetConstructor = target.constructor
      cloneTarget = new TargetConstructor()
    }

    /* 处理 Set */
    if (objToStringName === typeToStringMap.Set) {
      target.forEach(t => {
        cloneTarget.add(deepClone(t, context))
      })
    } /* 处理 Map */ else if (objToStringName === typeToStringMap.Map) {
      target.forEach((item, key) => {
        cloneTarget.set(deepClone(key, context), deepClone(item, context))
      })
    } /* 处理 Array 和 Object */ else {
      cloneTarget = Array.isArray(target) ? [] : {}
      for (const key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          cloneTarget[key] = deepClone(target[key], context)
        }
      }
    }

    return cloneTarget
  } else {
    return target
  }
}

module.exports = deepClone
