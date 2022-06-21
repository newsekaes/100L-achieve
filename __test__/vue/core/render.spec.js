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
    describe('Children Patch', () => {
      const nullVnodeFn = () => ({
        type: 'div',
        props: {},
        children: null
      })
      const stringVnodeFn = () => ({
        type: 'div',
        props: {},
        children: 'hello world'
      })
      const arrayVnodeFn = () => ({
        type: 'div',
        props: {},
        children: [
          { type: 'span', children: 'hello' },
          { type: 'span', children: 'world' }
        ]
      })
      describe('Case old is null', () => {
        beforeEach(() => {
          const vnode = nullVnodeFn()
          renderer.render(vnode, root)
        })
        it('Test old initial', function () {
          expect(root.innerHTML).toEqual('<div></div>')
        })
        it('Case new is string', function () {
          const vnode = stringVnodeFn()
          renderer.render(vnode, root)
          expect(root.innerHTML).toEqual('<div>hello world</div>')
        })
        it('Case new is array', function () {
          const vnode = arrayVnodeFn()
          renderer.render(vnode, root)
          expect(root.innerHTML).toEqual('<div><span>hello</span><span>world</span></div>')
        })
      })
      describe('Case old is string', () => {
        beforeEach(() => {
          const vnode = stringVnodeFn()
          renderer.render(vnode, root)
        })
        it('Test old initial', function () {
          expect(root.innerHTML).toEqual('<div>hello world</div>')
        })
        it('Case new is null', function () {
          const vnode = nullVnodeFn()
          renderer.render(vnode, root)
          expect(root.innerHTML).toEqual('<div></div>')
        })
        it('Case new is array', function () {
          const vnode = arrayVnodeFn()
          renderer.render(vnode, root)
          expect(root.innerHTML).toEqual('<div><span>hello</span><span>world</span></div>')
        })
      })
      describe('Case old is array', () => {
        beforeEach(() => {
          const vnode = arrayVnodeFn()
          renderer.render(vnode, root)
        })
        it('Test old initial', function () {
          expect(root.innerHTML).toEqual('<div><span>hello</span><span>world</span></div>')
        })
        it('Case new is null', function () {
          const vnode = nullVnodeFn()
          renderer.render(vnode, root)
          expect(root.innerHTML).toEqual('<div></div>')
        })
        it('Case new is string', function () {
          const vnode = stringVnodeFn()
          renderer.render(vnode, root)
          expect(root.innerHTML).toEqual('<div>hello world</div>')
        })
        it('Case new is array', function () {
          const vnode = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'good' },
              { type: 'span', children: 'nights' }
            ]
          }
          renderer.render(vnode, root)
          expect(root.innerHTML).toEqual('<div><span>good</span><span>nights</span></div>')
        })
      })
      describe('Use key Diff', () => {
        it('Positive sequence', function () {
          const n1 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'b', key: 'b' },
              { type: 'span', children: 'c', key: 'c' }
            ]
          }

          renderer.render(n1, root)

          const n2 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'b', key: 'b' },
              { type: 'span', children: 'c', key: 'c' }
            ]
          }

          renderer.render(n2, root)

          expect(root.innerHTML).toEqual('<div><span>a</span><span>b</span><span>c</span></div>')
        })
        it('Negative sequence', function () {
          const n1 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'b', key: 'b' },
              { type: 'span', children: 'c', key: 'c' }
            ]
          }

          renderer.render(n1, root)

          const n2 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'c', key: 'c' },
              { type: 'span', children: 'b', key: 'b' },
              { type: 'span', children: 'a', key: 'a' }
            ]
          }

          renderer.render(n2, root)

          expect(root.innerHTML).toEqual('<div><span>c</span><span>b</span><span>a</span></div>')
        })
        it('New need add', function () {
          const n1 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'b', key: 'b' }
            ]
          }

          renderer.render(n1, root)

          const n2 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'c', key: 'c' },
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'b', key: 'b' },
              { type: 'span', children: 'd', key: 'd' }
            ]
          }

          renderer.render(n2, root)

          expect(root.innerHTML).toEqual('<div><span>c</span><span>a</span><span>b</span><span>d</span></div>')
        })
        it('Old need remove', function () {
          const n1 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'c', key: 'c' },
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'b', key: 'b' },
              { type: 'span', children: 'd', key: 'd' }
            ]
          }

          renderer.render(n1, root)

          const n2 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'b', key: 'b' }
            ]
          }

          renderer.render(n2, root)

          expect(root.innerHTML).toEqual('<div><span>a</span><span>b</span></div>')
        })
        it('Random Sequence case', function () {
          const n1 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'b', key: 'b' },
              { type: 'span', children: 'c', key: 'c' },
              { type: 'span', children: 'd', key: 'd' },
              { type: 'span', children: 'e', key: 'e' }
            ]
          }

          renderer.render(n1, root)

          const n2 = {
            type: 'div',
            props: {},
            children: [
              { type: 'span', children: 'd', key: 'd' },
              { type: 'span', children: 'e', key: 'e' },
              { type: 'span', children: 'f', key: 'f' },
              { type: 'span', children: 'c', key: 'c' },
              { type: 'span', children: 'a', key: 'a' },
              { type: 'span', children: 'g', key: 'g' }
            ]
          }

          renderer.render(n2, root)

          expect(root.innerHTML).toEqual('<div><span>d</span><span>e</span><span>f</span><span>c</span><span>a</span><span>g</span></div>')
        })
      })
    })
  })
})
