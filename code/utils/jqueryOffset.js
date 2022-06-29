const offset = elem => {
  const result = {
    top: 0,
    left: 0
  }

  let position

  const getOffset = (node, init) => {
    /* 首先需要是 Element 节点, 比方说当遍历到 document 时，为 9 */
    if (node.nodeType !== 1) {
      return
    }

    position = window.getComputedStyle(node).position

    if (typeof init === 'undefined' && position === 'static') {
      /* static 时，offsetTop 和 offsetLeft 必为0，因为默认static不会有偏移，不需要计算 */
      node = node.offsetParent
    }

    result.top = node.offsetTop + result.top - node.scrollTop
    result.left = node.offsetLeft + result.left - node.scrollLeft
    if (position !== 'fixed') {
      getOffset(node.parentNode)
    }
  }

  getOffset(elem, true)

  return result
}

module.exports = offset
