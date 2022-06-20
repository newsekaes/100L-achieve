const renderer = require('code/vue/core/render')

describe('Test render', function () {
  describe('Simple render', () => {
    it('Render simple pass', function () {
      const root = document.createElement('div')
      const vnode = {
        type: 'div',
        children: 'text'
      }
      renderer.render(vnode, root)
      expect(root.innerHTML).toEqual('<div>text</div>')
    })
    it('Render children pass', function () {
      const root = document.createElement('div')
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
      const root = document.createElement('div')
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
      const root = document.createElement('div')
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
      const root = document.createElement('div')
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

  describe('Test patch', function () {
    describe('Basic patch', () => {
      let root
      beforeEach(() => {
        const vnode = {
          type: 'input',
          props: {
            disabled: true
          },
          children: ''
        }
        root = document.createElement('div')
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
  })
})
