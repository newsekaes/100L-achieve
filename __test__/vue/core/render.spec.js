const renderer = require('code/vue/core/render')

describe('Test render', function () {
  it('render OK', function () {
    const root = document.createElement('div')
    const vnode = {
      type: 'div',
      children: 'text'
    }
    renderer.render(vnode, root)
    expect(root.innerHTML).toEqual('<div>text</div>')
  })
})
