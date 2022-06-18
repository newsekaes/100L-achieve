# 100L-achieve
100行代码实现核心功能

## 1. Polyfill
ECMAScript 新特性的向后兼容语法糖

### module
Webpack 的模块定义与模块引用系统

### Promise
Promise API，以及`Promise.all`, `Promise.race` 等
代码实现：[code/polyfill/promise/index.js](./code/polyfill/promise/index.js)

### Event
事件监听与订阅分发
[mitt]https://github.com/developit/mitt/blob/main/src/index.ts

## 2. Utils
`lodash.js`等 工具库内的经典方法

### isEqual
判断严格相当
代码实现：[code/utils/isEqual.js](./code/utils/isEqual.js)

### deepClone
深拷贝
代码实现：[code/utils/deepClone.js](./code/utils/deepClone.js)

## 3. React

### Router

### Redux

## 4. Vue

### Vue
#### 响应式 和 副作用函数
代码实现： [code/vue/core/reactive.js](./code/vue/core/reactive.js)  
使用例子：[example/vue/core/reactive.js](./example/vue/core/reactive.html)

#### 模板编译
代码实现：[code/vue/core/compiler.js](./code/vue/core/compiler.js)

### vue-router


### vuex

## 5. Node

### Koa

## 6. 编译原理
### 小型编译器

### 字符串模板
