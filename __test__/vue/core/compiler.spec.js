import { parse } from 'code/vue/core/compiler.js'

describe('test parse template', () => {
  const template = '<div :id="id">{{text}}</div>'
  it('text vnode', () => {
    expect(parse(template)).toEqual({
      tagName: 'div',
      attrs: [{
        name: 'id',
        value: 'id',
        isDynamic: true
      }],
      children: [{
        content: 'text',
        isExp: true
      }]
    })
  })
})
