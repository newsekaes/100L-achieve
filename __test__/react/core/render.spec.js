const { MyReactDOM, MyReact } = require('code/react/core/index')

describe('Test MyReactDOM render feature', () => {
  let root
  beforeEach(() => {
    root = document.createElement('div')
  })
  it('Simple render', function () {
    const vnode = MyReact.createElement('p',
      { className: 'foo' },
      'hello',
      MyReact.createElement('span', {}, 'world'),
      '!!!'
    )
    MyReactDOM.render(vnode, root)
    expect(root.innerHTML).toEqual('<p class="foo">hello<span>world</span>!!!</p>')
  })
})
