/* eslint-disable */

console.log('main 开始')
const a = require('./a.js')
const b = require('./b.js')
console.log(`在 main 中，a.done=${a.done}，b.done=${b.done}`)
module.exports = [a.done, b.done]
