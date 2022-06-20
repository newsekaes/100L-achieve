const renderer = require('code/vue/core/render')

function nextTick () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 0)
  })
}

describe('Test renderer', function () {
  let root
  beforeEach(() => {
    root = document.createElement('div')
  })
  describe('Simple render', () => {
    it('Render simple pass', function () {
      const vnode = {
        type: 'div',
        children: 'text'
      }
      renderer.render(vnode, root)
      expect(root.innerHTML).toEqual('<div>text</div>')
    })
    it('Render children pass', function () {
      const vnode = {
        type: 'div',
        children: [
          { type: 'p', children: 'hello' },
          { type: 'p', children: 'world' }
        ]
      }
      renderer.render(vnode, root)
      expect(root.innerHTML).toEqual('<div><p>hello</p><p>world</p></div>')
    })
  })

  describe('Test attributes and property', () => {
    it('Attributes set pass', function () {
      const vnode = {
        type: 'div',
        props: {
          class: 'foo'
        },
        children: ''
      }
      renderer.render(vnode, root)
      expect(root.innerHTML).toEqual('<div class="foo"></div>')
    })
    it('Should set as props, not attributes', function () {
      const vnode = {
        type: 'div',
        props: {
          className: 'foo'
        },
        children: ''
      }
      renderer.render(vnode, root)
      expect(root.innerHTML).toEqual('<div class="foo"></div>')
    })
    it('Set boolean type property correctly', () => {
      const vnode = {
        type: 'input',
        props: {
          disabled: ''
        },
        children: ''
      }
      renderer.render(vnode, root)
      expect(root.innerHTML).toEqual('<input disabled="">')
    })
  })

  describe('Test event handle', () => {
    it('Single click handle', async function () {
      const eventHandle = jest.fn()
      const vnode = {
        type: 'div',
        props: {
          onClick: eventHandle
        },
        children: ''
      }
      renderer.render(vnode, root)
      root.firstChild.click()
      await nextTick()
      expect(eventHandle).toBeCalledTimes(1)
    })

    it('Multi click handle', async function () {
      const eventHandle1 = jest.fn()
      const evnetHandle2 = jest.fn()
      const vnode = {
        type: 'div',
        props: {
          onClick: [eventHandle1, evnetHandle2]
        },
        children: ''
      }
      renderer.render(vnode, root)
      root.firstChild.click()
      await nextTick()
      expect(eventHandle1).toBeCalledTimes(1)
      expect(evnetHandle2).toBeCalledTimes(1)
    })
  })

  describe('Test patch', function () {
    describe('Basic patch', () => {
      beforeEach(() => {
        const vnode = {
          type: 'input',
          props: {
            disabled: true
          },
          children: ''
        }
        renderer.render(vnode, root)
      })
      it('Patch props', () => {
        const vnode = {
          type: 'input',
          props: {
            disabled: false
          },
          children: ''
        }
        renderer.render(vnode, root)
        expect(root.innerHTML).toEqual('<input>')
      })
      it('Patch element', function () {
        const vnode = {
          type: 'p',
          props: {
            id: 'foo'
          },
          children: ''
        }
        renderer.render(vnode, root)
        expect(root.innerHTML).toEqual('<p id="foo"></p>')
      })
      it('Unmount', function () {
        renderer.render(null, root)
        expect(root.innerHTML).toEqual('')
      })
    })
    describe('Event handle patch', () => {
      const oldClickHandle = jest.fn()
      beforeEach(() => {
        oldClickHandle.mockClear()
        const vnode = {
          type: 'div',
          props: {
            onClick: [oldClickHandle]
          },
          children: ''
        }
        renderer.render(vnode, root)
      })
      it('Unmount event', async function () {
        root.firstChild.click()
        await nextTick()
        expect(oldClickHandle).toBeCalledTimes(1)

        oldClickHandle.mockClear()

        const vnode = {
          type: 'div',
          props: {},
          children: ''
        }
        renderer.render(vnode, root)
        root.firstChild.click()
        await nextTick()
        expect(oldClickHandle).toBeCalledTimes(0)
      })
      it('Update event', async function () {
        const newClickHandle = jest.fn()
        const vnode = {
          type: 'div',
          props: {
            onClick: newClickHandle
          },
          children: ''
        }
        renderer.render(vnode, root)
        root.firstChild.click()
        await nextTick()
        expect(oldClickHandle).toBeCalledTimes(0)
        expect(newClickHandle).toBeCalledTimes(1)
      })
    })
  })
})
