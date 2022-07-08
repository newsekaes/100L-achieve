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

  describe('Test functional component', () => {
    it('functional component render', async function () {
      function App (props) {
        return MyReact.createElement('input', {
          id: props.id
        })
      }
      const vnode = MyReact.createElement(
        'div',
        {},
        MyReact.createElement(App, { id: 'input' })
      )
      MyReact.render(vnode, root)
      await nextTick()
      expect(root.innerHTML).toEqual('<div><input id="input"></div>')
    })

    it('functional component with children', async function () {
      function App (props) {
        return MyReact.createElement('p', {
          id: props.id
        }, ...props.children)
      }
      const vnode = MyReact.createElement(
        'div',
        {},
        MyReact.createElement(
          App,
          { id: 'p' },
          MyReact.createElement(
            'span',
            {}
          )
        )
      )
      MyReact.render(vnode, root)
      await nextTick()
      expect(root.innerHTML).toEqual('<div><p id="p"><span></span></p></div>')
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

    describe('Functional component patch', () => {
      describe('Basic function', () => {
        function App (props) {
          return MyReact.createElement('input', {
            id: props.id
          })
        }
        beforeEach(async () => {
          const vnode = MyReact.createElement(
            'div',
            {},
            MyReact.createElement(App, { id: 'input' })
          )
          MyReact.render(vnode, root)
          await nextTick()
        })
        it('Update functional component', async function () {
          const vnode = MyReact.createElement(
            'div',
            {},
            MyReact.createElement(App, { id: 'nextInput' })
          )
          MyReact.render(vnode, root)
          await nextTick()
          expect(root.innerHTML).toEqual('<div><input id="nextInput"></div>')
        })
        it('Unmount functional component', async function () {
          await nextTick()
          const vnode = MyReact.createElement(
            'div',
            {}
          )
          MyReact.render(vnode, root)
          await nextTick()
          expect(root.innerHTML).toEqual('<div></div>')
        })
      })

      describe('With hook', () => {
        beforeEach(() => {
        })
        it('UseState ok', async function () {
          const App = () => {
            const [state, setState] = MyReact.useState(1)
            return MyReact.createElement('div', { onClick: () => { setState(s => s + 1) } }, `${state}`)
          }
          const vnode = MyReact.createElement(App, {})
          MyReact.render(vnode, root)
          await nextTick()
          expect(root.innerHTML).toEqual('<div>1</div>')
          root.firstChild.click()
          await nextTick()
          expect(root.innerHTML).toEqual('<div>2</div>')
        })
        it('UseEffect ok', async function () {
          const fnIn = jest.fn()
          const fnOut = jest.fn()
          const App = () => {
            MyReact.useEffect(() => {
              fnIn()
              return fnOut
            })
            return MyReact.createElement('div', {}, '')
          }
          const vnode1 = MyReact.createElement(App, {})
          MyReact.render(vnode1, root)
          await nextTick()
          expect(fnIn).toBeCalledTimes(1)
          expect(fnOut).toBeCalledTimes(0)
          const vnode2 = MyReact.createElement('div', {})
          MyReact.render(vnode2, root)
          await nextTick()
          expect(fnIn).toBeCalledTimes(1)
          expect(fnOut).toBeCalledTimes(1)
        })
      })
    })
  })
})
