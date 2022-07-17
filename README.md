# 100L-achieve
100行代码实现核心功能

## 1. Polyfill
ECMAScript 新特性的向后兼容语法糖

### reduce
代码实现：[code/polyfill/reduce.js](./code/polyfill/reduce.js)

### bind, call 和 apply
代码实现：[code/polyfill/fn.js](./code/polyfill/fn.js)

### module
Webpack 的模块定义与模块引用系统

### Promise
Promise API，以及`Promise.all`, `Promise.race` 等  
代码实现：[code/polyfill/promise/index.js](./code/polyfill/promise/index.js)

runPromiseByLimit: 同一时间只允许有限个promise运行  
代码实现：[code/polyfill/promise/runPromiseByLimit.js](./code/polyfill/promise/runPromiseByLimit.js)

### Prototype
原型链-继承：[code/polyfill/prototype.js](./code/polyfill/prototype.js)

### 装饰器

### Event
事件监听与订阅分发
[mitt](https://github.com/developit/mitt/blob/main/src/index.ts)

## 2. Utils
`lodash.js`等 工具库内的经典方法

### compose
代码实现：[code/utils/compose.js](./code/utils/compose.js)


### isEqual
判断严格相当
代码实现：[code/utils/isEqual.js](./code/utils/isEqual.js)

### deepClone
深拷贝
代码实现：[code/utils/deepClone.js](./code/utils/deepClone.js)

### offset
代码实现：[code/utils/deepClone.js](./code/utils/jqueryOffset.js)

## 3. React
### Core[核心模块]
代码实现：[code/react/core/index.js](./code/react/core/index.js)

### Router

### Redux
代码实现：[code/react/redux/index.js](./code/react/redux/index.js)

## 4. Vue

### Vue
#### 响应式 和 副作用函数
代码实现： [code/vue/core/reactive.js](./code/vue/core/reactive.js)  
使用例子：[example/vue/core/reactive.js](./example/vue/core/reactive.html)

#### 模板编译
代码实现：[code/vue/core/compiler.js](./code/vue/core/compiler.js)

### 挂在和更新
代码实现：[code/vue/core/render.js](./code/vue/core/render.js)

### vue-router


### vuex

## 5. Node

### Koa

## 6. 编译原理
### 小型编译器

### 字符串模板
