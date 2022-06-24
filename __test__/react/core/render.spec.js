const MyReactFn = require('code/react/core/index')

function nextTick () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 0)
  })
}

describe('Test MyReactDOM render feature', () => {
  let root
  let MyReact
  beforeEach(() => {
    root = document.createElement('div')
    MyReact = MyReactFn()
  })
  it('Simple render', async function () {
    const vnode = MyReact.createElement('p',
      { className: 'foo' },
      'hello',
      MyReact.createElement('span', {}, 'world'),
      '!!!'
    )
    MyReact.render(vnode, root)
    await nextTick()
    expect(root.innerHTML).toEqual('<p class="foo">hello<span>world</span>!!!</p>')
  })

  describe('Test event handle', () => {
    it('Single click handle', async function () {
      const eventHandle = jest.fn()
      const vnode = MyReact.createElement(
        'div',
        { onClick: eventHandle },
        ''
      )
      MyReact.render(vnode, root)
      await nextTick()
      root.firstChild.click()
      await nextTick()
      expect(eventHandle).toBeCalledTimes(1)
    })
  })

  describe('Test patch', () => {
    describe('Basic patch', () => {
      beforeEach(async () => {
        const vnode = MyReact.createElement(
          'input',
          { disabled: true },
          ''
        )
        MyReact.render(vnode, root)
        await nextTick()
      })
      it('Patch props update', async () => {
        const vnode = MyReact.createElement(
          'input',
          { disabled: false },
          ''
        )
        MyReact.render(vnode, root)
        await nextTick()
        expect(root.innerHTML).toEqual('<input>')
      })
      it('Patch props remove', async () => {
        const vnode = MyReact.createElement(
          'input',
          {},
          ''
        )
        MyReact.render(vnode, root)
        await nextTick()
        expect(root.innerHTML).toEqual('<input>')
      })
      it('Patch element', async function () {
        const vnode = MyReact.createElement(
          'p',
          {
            id: 'foo'
          },
          ''
        )
        MyReact.render(vnode, root)
        await nextTick()
        expect(root.innerHTML).toEqual('<p id="foo"></p>')
      })
      it('Unmount', async function () {
        MyReact.render(null, root)
        await nextTick()
        expect(root.innerHTML).toEqual('')
      })
    })

    describe('Event handle patch', () => {
      const oldClickHandle = jest.fn()
      beforeEach(async () => {
        oldClickHandle.mockClear()
        const vnode = MyReact.createElement(
          'div',
          { onClick: oldClickHandle },
          ''
        )
        MyReact.render(vnode, root)
        await nextTick()
      })
      it('Unmount event', async function () {
        root.firstChild.click()
        await nextTick()
        expect(oldClickHandle).toBeCalledTimes(1)

        oldClickHandle.mockClear()

        const vnode = MyReact.createElement(
          'div',
          {},
          ''
        )
        MyReact.render(vnode, root)
        await nextTick()
        root.firstChild.click()
        await nextTick()
        expect(oldClickHandle).toBeCalledTimes(0)
      })
      it('Update event', async function () {
        const newClickHandle = jest.fn()
        const vnode = MyReact.createElement(
          'div',
          { onClick: newClickHandle },
          ''
        )
        MyReact.render(vnode, root)
        await nextTick()
        root.firstChild.click()
        await nextTick()
        expect(oldClickHandle).toBeCalledTimes(0)
        expect(newClickHandle).toBeCalledTimes(1)
      })
    })
  })
})
