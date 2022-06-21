function createRenderer (options) {
  const {
    createElement,
    insert,
    setElementText,
    patchProps,
    removeElement
  } = options

  function mountElement (vnode, container, anchor) {
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

    insert(el, container, anchor)
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

    patchChildren(oldVnode, newVnode, el)
  }

  function simpleDiff (oldVnode, newVnode, container) {
    // oldVnode.children.forEach(vnode => unmount(vnode))
    // newVnode.children.forEach(vnode => patch(null, vnode, container))
    const oldChildren = oldVnode.children
    const newChildren = newVnode.children

    let lastIndex = 0
    for (let i = 0; i < newChildren.length; i++) {
      const n2 = newChildren[i]
      let find = false
      for (let j = 0; j < oldChildren.length; j++) {
        const n1 = oldChildren[j]
        /* 找到 key, 只需要 update */
        if (n1.key && n2.key && n2.key === n1.key) {
          patch(n1, n2, container)
          if (j < lastIndex) {
            const preVNode = newChildren[i - 1]
            /* 疑问：preNode 可能不存在吗？ */
            /* 1. 假设 preNode 不存在的情况是 i = 0, 但此时 lastIndex 一定为0，不存在 j < lastIndex, 故此情况不会发生 */
            /* 2. 考虑 newChildren 中可能有空值：[null, vnode1, vnode2, null, ...] */
            if (preVNode) {
              insert(n2.el, container, preVNode.el.nextSibling)
            }
          } else {
            lastIndex = j
          }
          find = true
          break
        }
      }
      /* newChildren 中没找到，说明是新加的 */
      if (!find) {
        const preVNode = newChildren[i - 1]
        let anchor = null
        if (preVNode) {
          anchor = preVNode.el.nextSibling
        } else {
          anchor = container.firstChild
        }
        patch(null, n2, container, anchor)
      }
    }
    for (let i = 0; i < oldChildren.length; i++) {
      const oldVNode = oldChildren[i]
      const has = newChildren.find(n => n.key && oldVNode.key && n.key === oldVNode.key)
      if (!has) {
        unmount(oldVNode)
      }
    }
  }

  function endsDiff (n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    let oldStart = 0; let oldEnd = oldChildren.length - 1; let newStart = 0; let newEnd = newChildren.length - 1
    while (oldStart <= oldEnd && newStart <= newEnd) {
      const n1s = oldChildren[oldStart]
      const n1e = oldChildren[oldEnd]
      const n2s = newChildren[newStart]
      const n2e = newChildren[newEnd]
      if (!n1s) {
        oldStart++
      } else if (!n1e) {
        oldEnd--
      } else if (n1s.key && n2s.key && n1s.key === n2s.key) {
        patch(n1s, n2s, container)
        oldStart++
        newStart++
      } else if (n1s.key && n2e.key && n1s.key === n2e.key) {
        patch(n1s, n2e, container)
        const anchor = n1e.el.nextSibling
        insert(n1s.el, container, anchor)
        oldStart++
        newEnd--
      } else if (n1e.key && n2s.key && n1e.key === n2s.key) {
        patch(n1e, n2s, container)
        const anchor = n1s.el
        insert(n1e.el, container, anchor)
        oldEnd--
        newStart++
      } else if (n1e.key && n2e.key && n1e.key === n2e.key) {
        patch(n1e, n2e)
        oldEnd--
        newEnd--
      } else {
        const indexInOld = oldChildren.findIndex(node => node && node.key && n2s.key && n2s.key === node.key)
        if (indexInOld >= 0) {
          patch(oldChildren[indexInOld], n2s)
          const preVNode = newChildren[newStart - 1]
          let anchor
          if (preVNode) {
            anchor = preVNode.el.nextSibling
          } else {
            anchor = container.firstChild
          }
          insert(oldChildren[indexInOld].el, container, anchor)
          oldChildren[indexInOld] = undefined
        } else {
          // 新节点
          patch(null, n2s, container, n1s.el)
        }
        newStart++
      }
    }
    // 额外处理新添加的
    if (oldEnd < oldStart && newStart <= newEnd) {
      for (let i = newStart; i <= newEnd; i++) {
        patch(null, newChildren[i], container, oldChildren[oldStart] && oldChildren[oldStart].el)
      }
    } else if (oldEnd >= oldStart && newStart > newEnd) {
      for (let i = oldStart; i <= oldEnd; i++) {
        oldChildren[i] && unmount(oldChildren[i])
      }
    }
  }

  function patchChildren (oldVnode, newVnode, container) {
    /* 新节点的子节点是文本节点 */
    if (typeof newVnode.children === 'string') {
      /* 旧节点如果是一组，则先逐个卸载 */
      if (Array.isArray(oldVnode.children)) {
        oldVnode.children.forEach(vnode => unmount(vnode))
      }
      setElementText(container, newVnode.children)
    } /* 新节点的子节点是一组 */ else if (Array.isArray(newVnode.children)) {
      /* 新旧子节点都是数组，需要 diff */
      if (Array.isArray(oldVnode.children)) {
        /* 简单 Diff */
        // simpleDiff(oldVnode, newVnode, container)

        /* 双端 Diff */
        endsDiff(oldVnode, newVnode, container)
      } else {
        setElementText(container, '')
        newVnode.children.forEach(vnode => patch(null, vnode, container))
      }
    } /* 没有新的子节点 */ else {
      /* 旧节点如果是一组，则先逐个卸载 */
      if (Array.isArray(oldVnode.children)) {
        oldVnode.children.forEach(vnode => unmount(vnode))
      } else if (typeof oldVnode.children === 'string') {
        setElementText(container, '')
      }
    }
  }

  function patch (oldVnode, newVnode, container, anchor) {
    if (oldVnode && oldVnode.type !== newVnode.type) {
      unmount(oldVnode)
      oldVnode = null
    }
    const type = newVnode.type
    if (typeof type === 'string') {
      if (!oldVnode) {
        mountElement(newVnode, container, anchor)
      } else {
        patchElement(oldVnode, newVnode)
      }
    } else if (typeof type === 'object') {
      // 组件处理
    } else {
      // 其他处理
    }
  }

  function unmount (vnode) {
    removeElement(vnode.el)
  }

  function render (vnode, container) {
    if (vnode) {
      // if (vnode.key === undefined) vnode.key = Symbol('key')
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
    if (/^on/.test(key)) {
      // 处理事件
      const name = key.slice(2).toLowerCase()
      const invokers = el._vei || (el._vei = {})
      let invoker = invokers[key]
      if (nextValue) {
        if (!invoker) {
          invoker = invokers[key] = (e) => {
            if (e.timestamp < invoker.attached) {
              return
            }
            if (Array.isArray(invoker.value)) {
              nextValue.forEach(f => f(e))
            } else {
              invoker.value(e)
            }
          }
          invoker.value = nextValue
          invoker.attached = new Date().getTime()
          el.addEventListener(name, invoker)
        } else {
          invoker.value = nextValue
        }
      } else if (invoker) {
        delete invokers[key]
        el.removeEventListener(name, invoker)
      }
    } else if (key === 'class') {
      // 特殊处理 class, 因为 el.className 的方式设置 class 最高效
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
