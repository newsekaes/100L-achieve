function inherit (Child, Parent) {
  // 1. 实例-原型链的继承
  // 方法a: Object.create
  const _prototype = Child.prototype
  Child.prototype = Object.create(Parent)
  // 方法b: 构造工具函数
  Child.prototype = (function () {
    function F () {}
    F.prototype = Parent.prototype
    F.prototype.constructor = Parent
    return new F()
  })()
  Object.assign(Child.prototype, _prototype)
  Child.prototype.constructor = Child

  // 2. 实例属性的继承，在构造函数中手动调用super
  Child.super = Parent

  // 3. 构造函数-原型链的继承（构造函数上的静态属性）
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(Child, Parent)
  } else if (Child.__proto__) {
    Child.__proto__ = Parent
  } else {
    for (const key in Parent) {
      if (Parent.hasOwnProperty(key) && !(key in Child)) {
        Child[key] = Parent[key]
      }
    }
  }
}

exports.inherit = inherit
