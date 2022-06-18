const State = {
  initial: 1,
  tagOpen: 2,
  tagName: 3,
  text: 4,
  tagEnd: 5,
  tagEndName: 6
}

function isAlpha (char) {
  return /[a-z|A-Z]/.test(char)
}

export function tokenize (str) {
  let currentState = State.initial
  const chars = []
  const tokens = []
  const consume = (num = 1) => { str = str.slice(num) }
  while (str) {
    const char = str[0]
    switch (currentState) {
      case State.initial:
        if (char === '<') {
          currentState = State.tagOpen
          consume()
        } else if (isAlpha(char)) {
          currentState = State.text
          chars.push(char)
          consume()
        }
        break
      case State.tagOpen:
        if (isAlpha(char)) {
          currentState = State.tagName
          chars.push(char)
          consume()
        } else if (char === '/') {
          currentState = State.tagEnd
          consume()
        }
        break
      case State.tagName:
        if (isAlpha(char)) {
          chars.push(char)
          consume()
        } else if (char === '>') {
          currentState = State.initial
          tokens.push({
            type: 'tag',
            name: chars.join('')
          })
          chars.length = 0
          consume()
        }
        break
      case State.text:
        if (isAlpha(char)) {
          chars.push(char)
          consume()
        } else if (char === '<') {
          currentState = State.tagOpen
          tokens.push({
            type: 'text',
            content: chars.join('')
          })
          chars.length = 0
          consume()
        }
        break
      case State.tagEnd:
        if (isAlpha(char)) {
          currentState = State.tagEndName
          chars.push(char)
          consume()
        }
        break
      case State.tagEndName:
        if (isAlpha(char)) {
          chars.push(char)
          consume()
        } else if (char === '>') {
          currentState = State.initial
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          })
          chars.length = 0
          consume()
        }
        break
    }
  }
  return tokens
}

export function parse (str) {
  const tokens = tokenize(str)
  const root = {
    type: 'Root',
    children: []
  }
  const elementStack = [root]
  while (tokens.length) {
    const parent = elementStack[elementStack.length - 1]
    const t = tokens[0]
    switch (t.type) {
      case 'tag':
        const elementNode = {
          type: 'Element',
          tag: t.name,
          children: [],
          attrs: []
        }
        parent.children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'attr':
        elementStack[elementStack.length - 1].attrs.push({
          name: t.name,
          value: t.value
        })
        break
      case 'text':
        const textNode = {
          type: 'Text',
          content: t.content
        }
        parent.children.push(textNode)
        break
      case 'tagEnd':
        elementStack.pop()
        break
    }
    tokens.shift()
  }
  return root
}

function dump (node, indent = 0) {
  const type = node.type
  const desc = ({
    Root: () => '',
    Element: () => `${node.tag} ${node.attrs.map(({ name, value }) => name + '=' + value)}`,
    Text: () => node.content
  })[type]()
  console.log(`${'-'.repeat(indent)}${type}: ${desc}`)
  if (node.children) {
    node.children.forEach((child) => dump(child, indent + 2))
  }
}

function travelNode (ast, context) {
  context.currentNode = ast
  const exitFns = []
  const { childIndex, parent, nodeTransforms } = context
  for (let i = 0; i < nodeTransforms.length; i++) {
    exitFns.push(nodeTransforms[i](context.currentNode, context))
    if (!context.currentNode) return
  }
  const children = context.currentNode.children
  const currentNode = context.currentNode
  if (children) {
    children.forEach((child, index) => {
      context.parent = context.currentNode
      context.childIndex = index
      travelNode(child, context)
    })
    context.parent = parent
    context.childIndex = childIndex
  }
  let i = exitFns.length
  while (i--) {
    exitFns[i] && exitFns[i](currentNode)
  }
}

function transform (ast) {
  const context = {
    currentNode: null,
    parent: null,
    childIndex: null,
    replaceNode (node) {
      context.currentNode = node
      this.parent.children[context.childIndex] = node
    },
    removeNode () {
      context.currentNode = null
      this.parent.children.splice(this.childIndex, 1)
    },
    nodeTransforms: [
      transformRoot,
      transformElement,
      transformText
      // transformTextRemove,
      // transformElementPtoH1
    ]
  }
  travelNode(ast, context)
  // console.log(JSON.stringify(ast, null, 2))
  // dump(ast)
}

// ================== AST工具函数 =================

function transformRoot () {
  return (node) => {
    if (node.type !== 'Root') {
      return
    }
    node.jsNode = {
      type: 'FunctionDecl',
      id: createIdentifier('render'),
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: node.children[0].jsNode
        }
      ]
    }
  }
}

/* 转换标签 */
function transformElement (node) {
  return () => {
    if (node.type !== 'Element') {
      return
    }
    const callExp = createCallExpression('h', [createStringLiteral(node.tag)])
    node.children.length === 1
      ? callExp.arguments.push(node.children[0].jsNode)
      : callExp.arguments.push(createArrayExpression(node.children.map(child => child.jsNode)))
    node.jsNode = callExp
  }
}

/* 处理 text 节点的 jsNode */
function transformText (node, context) {
  if (node.type !== 'Text') {
    return
  }
  node.jsNode = createStringLiteral(node.content)
}

function createStringLiteral (value) {
  return {
    type: 'StringLiteral',
    value
  }
}

function createIdentifier (name) {
  return {
    type: 'Identifier',
    name
  }
}

function createArrayExpression (elements) {
  return {
    type: 'ArrayExpression',
    elements
  }
}

function createCallExpression (callee, args) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments: args
  }
}

// ===================== generate 工具函数 ========================

function generate (node) {
  const context = {
    code: '',
    push (code) {
      context.code += code
    },
    currentIndent: 0,
    newLine () {
      context.code += '\n' + '  '.repeat(context.currentIndent)
    },
    indent () {
      context.currentIndent++
      context.newLine()
    },
    deIndent () {
      context.currentIndent--
      context.newLine()
    }
  }
  genNode(node, context)
  return context.code
}

function genNode (node, context) {
  switch (node.type) {
    case 'FunctionDecl':
      genFunctionDecl(node, context)
      break
    case 'ReturnStatement':
      genReturnStatement(node, context)
      break
    case 'CallExpression':
      genCallExpression(node, context)
      break
    case 'StringLiteral':
      genStringLiteral(node, context)
      break
    case 'ArrayExpression':
      genArrayExpression(node, context)
      break
  }
}

function genFunctionDecl (node, context) {
  const { push, indent, deIndent } = context
  push(`function ${node.id.name} (`)
  genNodeList(node.params, context)
  push(') {')
  indent()
  node.body.forEach(n => genNode(n, context))
  deIndent()
  push('}')
}

function genNodeList (nodes, context) {
  const { push } = context
  nodes.forEach((n, index) => {
    genNode(n, context)
    if (index !== nodes.length - 1) {
      push(', ')
    }
  })
}

function genArrayExpression (nodes, context) {
  const { push } = context
  push('[')
  genNodeList(nodes.elements, context)
  push(']')
}

function genReturnStatement (node, context) {
  const { push } = context
  push('return ')
  genNode(node.return, context)
}

function genStringLiteral (node, context) {
  const { push } = context
  push(`'${node.value}'`)
}

function genCallExpression (node, context) {
  const { push } = context
  push(`${node.callee.name}`)
  push('(')
  genNodeList(node.arguments, context)
  push(')')
}

// =============================================

export function compiler (template) {
  const ast = parse(template)
  transform(ast)
  return generate(ast.jsNode)
}

// =============================================

const FunctionDeclNode = {
  type: 'FunctionDecl',
  id: {
    type: 'Identifier',
    name: 'render'
  },
  params: [],
  body: [
    {
      type: 'ReturnStatement',
      return: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'h' },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'h' },
            arguments: [
              { type: 'StringLiteral', value: 'p' },
              { type: 'StringLiteral', value: 'Vue' }
            ]
          },
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'h' },
            arguments: [
              { type: 'StringLiteral', value: 'p' },
              { type: 'StringLiteral', value: 'Template' }
            ]
          }
        ]
      }
    }
  ]
}
