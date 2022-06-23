const MyReact = {
  createElement
}

const MyReactDOM = {
  render
}

const elementType = {
  TEXT: Symbol('TEXT')
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

function render (element, container) {
  const dom =
    element.type === elementType.TEXT
      ? document.createTextNode('')
      : document.createElement(element.type)

  const isProperty = key => key !== 'children'
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(propName => {
      dom[propName] = element.props[propName]
    })

  element.props.children.forEach(child => render(child, dom))
  container.appendChild(dom)
}

exports.MyReact = MyReact
exports.MyReactDOM = MyReactDOM
