function createRenderer (options) {
  const {
    createElement,
    insert,
    setElementText,
    patchProps,
    removeElement
  } = options

  function mountElement (vnode, container) {
    const el = vnode.el = createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach(child => {
        patch(null, child, el)
      })
    }

    // attr
    if (vnode.props) {
      for (const key in vnode.props) {
        const value = vnode.props[key]
        patchProps(el, key, null, value)
      }
    }

    insert(el, container)
  }

  function patchElement (oldVnode, newVnode) {
    const el = newVnode.el = oldVnode.el // 顺手将 newVnode.el 继承 oldVnode.el
    const oldProps = oldVnode.props
    const newProps = newVnode.props

    // 更新 和 新加
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }

    // 删除
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null)
      }
    }
  }

  function patch (oldVnode, newVnode, container) {
    if (!oldVnode) {
      mountElement(newVnode, container)
    } else {
      if (oldVnode.type !== newVnode.type) {
        unmount(oldVnode)
        mountElement(newVnode, container)
      } else {
        patchElement(oldVnode, newVnode)
      }
    }
  }

  function unmount (vnode) {
    removeElement(vnode.el)
  }

  function render (vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      // 判断是否需要卸载
      if (container._vnode) {
        unmount(container._vnode)
      }
    }
    container._vnode = vnode
  }

  return {
    render
  }
}

function shouldSetAsProps (el, key, value) {
  if (key === 'form' && el.tagName === 'INPUT') return false
  return key in el
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
  removeElement (el) {
    const parent = el.parentNode
    if (parent) {
      parent.removeChild(el)
    }
  },
  patchProps (el, key, preValue, nextValue) {
    // 特殊处理 class, 因为 el.className 的方式设置 class 最高效
    if (key === 'class') {
      el.className = nextValue || ''
    } else if (shouldSetAsProps(el, key, nextValue)) {
      const type = typeof el[key]
      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  }
})

module.exports = renderer
