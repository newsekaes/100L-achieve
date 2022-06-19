let currentEffect = null
const buckets = new WeakMap()

function createReactive (data) {
  return new Proxy(data, {
    get (target, property, receiver) {
      track(target, property)
      return Reflect.get(target, property, receiver)
    },
    set (target, property, value, receiver) {
      Reflect.set(target, property, value, receiver)
      trigger(target, property) // 注意 trigger 要放到 Reflect.set 下方
      return true
    }
  })
}

function track (target, property) {
  const bucket = buckets.get(target) || (buckets.set(target, new Map()), buckets.get(target))
  const effects = bucket.get(property) || (bucket.set(property, new Set()), bucket.get(property))
  currentEffect && effects.add(currentEffect)
}

function trigger (target, property) {
  const effects = buckets.get(target).get(property)
  effects && effects.forEach(fn => fn())
}

function effect (fn) {
  currentEffect = fn
  fn()
  currentEffect = null
}

module.exports = {
  createReactive,
  effect
}
