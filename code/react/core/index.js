module.exports = function () {
  const elementType = {
    TEXT: Symbol('TEXT')
  }

  const requestIdleCallback = (callback) => {
    setTimeout(() => {
      // eslint-disable-next-line n/no-callback-literal
      callback({
        timeRemaining () {
          return Infinity
        }
      })
    }, 0)
  }

  function createElement (type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === 'string'
            ? createTextElement(child)
            : child
        )
      }
    }
  }

  function createTextElement (text) {
    return {
      type: elementType.TEXT,
      props: {
        nodeValue: text,
        children: []
      }
    }
  }

  const isEvent = key => /^on/.test(key)
  const isProperty = key => key !== 'children' && !isEvent(key)
  const isNew = (prev, next) => key => prev[key] !== next[key]
  const isGone = (prev, next) => key => !(key in next)

  function createDom (fiber) {
    const dom =
      fiber.type === elementType.TEXT
        ? document.createTextNode('')
        : document.createElement(fiber.type)

    updateDom(dom, {}, fiber.props)

    return dom
    // element.props.children.forEach(child => render(child, dom))
    // container.appendChild(dom)
  }

  function updateDom (dom, preProps, nextProps) {
    // old
    Object.keys(preProps)
      .filter(isEvent)
      .filter(key => isGone(preProps, nextProps)(key) || isNew(preProps, nextProps)(key))
      .forEach(name => {
        const eventType = name.toLowerCase().slice(2)
        dom.removeEventListener(eventType, preProps[name])
      })
    Object.keys(preProps)
      .filter(isProperty)
      .filter(isGone(preProps, nextProps))
      .forEach(name => {
        dom[name] = ''
      })

    // new
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(preProps, nextProps))// 还是需要isNew 过滤，万一这个值没变呢
      .forEach(name => {
        const eventType = name.toLowerCase().slice(2)
        dom.addEventListener(eventType, nextProps[name])
      })
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(preProps, nextProps))
      .forEach(name => {
        dom[name] = nextProps[name]
      })
  }

  /* 类似于“事件循环”系统的 “工作循环” */
  let nextUnitOfWork = null
  let wipRoot = null // work in progress tree
  let currentRoot = null
  let deletions = null

  function workLoop (deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
      shouldYield = deadline.timeRemaining() < 1
    }
    // 当 reconcile 结束时，wipRoot代表的树构建完成，可以开始commit
    if (!nextUnitOfWork && wipRoot) {
      commitRoot()
    }

    requestIdleCallback(workLoop)
  }

  requestIdleCallback(workLoop)

  function performUnitOfWork (fiber) {
    // 工作1：新建一个真实DOM
    if (!fiber.dom) {
      fiber.dom = createDom(fiber)
    }

    // 工作2：生成children的Fiber，并返回下一个unitOfWork
    const elements = fiber.props.children
    reconcileChildren(fiber, elements)

    if (fiber.child) {
      return fiber.child
    }
    let nextFiber = fiber

    // 先找 sibling, 没有的话再找 parent 的 sibling，再找 parent.parent 的 sibling，层层上浮
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
    // 默认返回 return undefined
  }

  function reconcileChildren (wipFiber, elements) {
    let index = 0

    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let preSibling = null

    // 做 Fiber树 和 单向链表
    while (index < elements.length || !!oldFiber) {
      const element = elements[index]
      let newFiber = null

      const sameType = oldFiber && element && element.type === oldFiber.type

      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: 'UPDATE'
        }
      }

      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          parent: wipFiber,
          dom: null,
          alternate: null,
          effectTag: 'PLACEMENT'
        }
      }

      if (oldFiber && !sameType) {
        oldFiber.effectTag = 'DELETION'
        deletions.push(oldFiber)
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling
      }

      if (index === 0) {
        wipFiber.child = newFiber
      } else {
        preSibling.sibling = newFiber
      }

      preSibling = newFiber
      index++
    }
  }

  function commitRoot () {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
  }

  function commitWork (fiber) {
    if (!fiber) {
      return
    }
    const domParent = fiber.parent.dom
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
      domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === 'DELETION') {
      domParent.removeChild(fiber.dom)
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
      updateDom(
        fiber.dom,
        fiber.alternate.props,
        fiber.props
      )
    }
    // domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
  }

  function render (element, container) {
    /* Fiber type */
    wipRoot = {
      dom: container,
      props: {
        children: [element]
      },
      alternate: currentRoot
    }
    deletions = []
    nextUnitOfWork = wipRoot
  }
  return {
    render,
    createElement
  }
}
