const compose1 = (...fns) =>
  (...args) => {
    const initFn = fns.pop()
    return fns.reverse().reduce(
      (preFnReturn, fn) => fn(preFnReturn),
      initFn.apply(null, args)
    )
  }

const compose2 = (...fns) =>
  fns.reverse().reduce(
    (preComposed, fn) =>
      (...arg) => fn(preComposed.apply(null, arg)),
    fns.shift()
  )

const compose3 = (...fns) => {
  const initFn = fns.pop()
  return (...args) =>
    fns.reverse().reduce(
      (res, fn) => res.then(result => fn.call(null, result)),
      Promise.resolve(initFn.apply(null, args))
    )
}

const compose4 = (...fns) => {
  if (fns.length === 0) {
    return arg => arg
  }
  if (fns.length === 1) {
    return fns[0]
  }
  return fns.reduce((preComposedFn, fn) => (...arg) => preComposedFn(fn.apply(null, arg)))
}

module.exports = {
  compose1,
  compose2,
  compose3,
  compose4
}
