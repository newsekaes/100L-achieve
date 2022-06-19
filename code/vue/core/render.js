function createRenderer (options) {
  const {
    createElement,
    insert,
    setElementText,
    clearInnerHTML
  } = options

  function mountElement (vnode, container) {
    const el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    }
    insert(el, container)
  }

  function patch (oldVnode, newVnode, container) {
    if (!oldVnode) {
      mountElement(newVnode, container)
    } else {
      //
    }
  }

  function render (vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        clearInnerHTML(container)
      }
    }
    container._vnode = vnode
  }

  return {
    render
  }
}

const renderer = createRenderer({
  createElement (tag) {
    return document.createElement(tag)
  },
  setElementText (el, text) {
    el.textContent = text
  },
  insert (el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  clearInnerHTML (container) {
    container.innerHTML = ''
  }
})

module.exports = renderer
