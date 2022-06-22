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

  function quickDiff (n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children

    let j = 0 // 用来记录 oldChildren 中的插值index, 以供 newChildren 需要新添加的插入

    let oldStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newStartIndex = 0
    let newEndIndex = newChildren.length - 1

    let oldStartVNode = oldChildren[oldStartIndex]
    let oldEndVNode = oldChildren[oldEndIndex]
    let newStartVNode = newChildren[newStartIndex]
    let newEndVNode = newChildren[newEndIndex]

    while (hasSameKey(oldStartVNode, newStartVNode)) {
      patch(oldStartVNode, newStartVNode)
      oldStartVNode = oldChildren[++oldStartIndex]
      newStartVNode = newChildren[++newStartIndex]
      j++
    }

    while (hasSameKey(oldEndVNode, newEndVNode) && oldEndIndex >= j && newEndIndex >= j) {
      patch(oldEndVNode, newEndVNode)
      oldEndVNode = oldChildren[--oldEndIndex]
      newEndVNode = newChildren[--newEndIndex]
    }

    /* 一方遍历完，另一方有剩余 */
    /* 新节点需要新增 */
    if (j <= newEndIndex && j > oldEndIndex) {
      const anchorVNode = newChildren[newEndIndex + 1]
      const anchor = anchorVNode && anchorVNode.el
      while (j <= newEndIndex) {
        patch(null, newChildren[j++], container, anchor)
      }
    } /* 旧节点需要卸载 */ else if (j <= oldEndIndex && j > newEndIndex) {
      while (j <= oldEndIndex) {
        unmount(oldChildren[j++])
      }
    } /* 快速 Diff 的核心部分 */ else {
      // 构建一个 新节点对应旧节点中索引值（index）的source表
      // 先遍历旧节点，生成一个 Map 表
      const count = newEndIndex - j + 1
      let patched = 0
      let move = false
      let pos = 0
      const source = new Array(count).fill(-1)

      /* 注意，为什么不先遍历 old, 再遍历 new 呢？ */
      /* 1. 因为 source 是基于 newVNodes 的长度来的，-1 时表示新加，一切新节点的 mount 操作，都应该利用 -1 来进行 */
      /* 2. 如果先遍历 old, 再遍历 new，无法得知 old 中哪些需要 unmount，而只能知道 new 中哪些需要 mount, 而这和 -1 值的关注点冲突 */
      /* 待验证：如果先 遍历 old，再遍历 new，那么 source 表应该基于 oldVNodes 的长度进行，-1 表示哪些需要旧节点需要 unmount */

      const map = new Map()

      for (let i = j; i <= newEndIndex; i++) {
        if (newChildren[i].key) {
          map.set(newChildren[i].key, i)
        }
      }

      // 生成 source 表
      for (let oldIdx = j; oldIdx <= oldEndIndex; oldIdx++) {
        const oldVNode = oldChildren[oldIdx]
        /* 优化策略：当已经 patch 的旧节点数量已经和新节点数量一致，可以推定剩下的旧节点全部可以 unmount */
        if (patched < count) {
          if (oldVNode.key && map.has(oldVNode.key)) {
            const newIdx = map.get(oldVNode.key)
            patch(oldVNode, newChildren[newIdx], container)
            patched++
            source[newIdx - j] = oldIdx
            if (newIdx < pos) {
              move = true
            } else {
              pos = newIdx
            }
          } else {
            unmount(oldVNode)
          }
        } else {
          unmount(oldVNode)
        }
      }

      // 进行移动
      if (move || source.includes(-1)) {
        const seq = lis(source)
        let seqEndIndex = seq.length - 1
        let sourceEndIndex = count - 1 // source.length - 1
        while (sourceEndIndex >= 0) {
          if (source[sourceEndIndex] === -1) {
            // 新加
            const curIndex = sourceEndIndex + j
            const nextIndex = curIndex + 1
            const anchor = nextIndex < newChildren.length ? newChildren[nextIndex].el : null
            patch(null, newChildren[sourceEndIndex + j], container, anchor)
          } else if (sourceEndIndex !== seq[seqEndIndex]) {
            // 需要移动
            const curIndex = sourceEndIndex + j
            const nextIndex = curIndex + 1
            const anchor = nextIndex < newChildren.length ? newChildren[nextIndex].el : null
            insert(newChildren[sourceEndIndex + j].el, container, anchor)
          } else {
            // 不需要移动，seqEndIndex 左移
            seqEndIndex--
          }
          sourceEndIndex--
        }
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
        // endsDiff(oldVnode, newVnode, container)

        /* 快速 Diff */
        quickDiff(oldVnode, newVnode, container)
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

function hasSameKey (n1, n2) {
  return n1 && n1.key && n2 && n2.key && n1.key === n2.key
}

function lis (arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
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
