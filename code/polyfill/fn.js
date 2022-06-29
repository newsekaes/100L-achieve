// eslint-disable-next-line no-extend-native
Function.prototype.myBind = function (context) {
  const self = this
  if (typeof context === 'undefined') {
    throw new TypeError('need context')
  }
  const outerArgs = Array.prototype.slice.call(arguments, 1)
  function BindFn () {
    let args = Array.prototype.slice.call(arguments)
    args = outerArgs.concat(args)
    const _self = this instanceof BindFn ? this : context || this
    return self.apply(_self, args)
  }
  BindFn.prototype = this.prototype
  return BindFn
}

// eslint-disable-next-line no-extend-native
Function.prototype.myCall = function (context) {
  if (typeof context === 'undefined') {
    throw new TypeError('need context')
  }
  const calledFnKey = Symbol('calledFnKey')
  const args = Array.prototype.slice.call(arguments, 1)
  context = new Object(context)
  context[calledFnKey] = this
  const result = context[calledFnKey](...args)
  delete context[calledFnKey]
  return result
}

// eslint-disable-next-line no-extend-native
Function.prototype.myApply = function (context, args = []) {
  if (typeof context === 'undefined') {
    throw new TypeError('need context')
  }
  const appliedFnKey = Symbol('appliedFnKey')
  context = new Object(context)
  context[appliedFnKey] = this
  const result = context[appliedFnKey](args)
  delete context[appliedFnKey]
  return result
}

module.exports = Function
