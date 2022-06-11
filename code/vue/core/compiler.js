function parse (temp = '', i = 0) {
  const node = { tagName: '', attrs: [], children: [] }
  parseTag()
  parseAttrs()
  parseText()
  function parseTag () {
    const tpl = temp.substring(i)
    const regTagName = /^<(\w+\d?)/
    const regResult = regTagName.exec(tpl)
    const tagName = regResult[1]
    i += regResult[0].length
    node.tagName = tagName
  }
  function parseAttrs () {
    const attrs = []; const regAttribute = /^\s*(:?[\w\d]+)=['"](\w+)['"]/
    let tpl, regResult
    while ((tpl = temp.substring(i), regResult = regAttribute.exec(tpl), regResult && regResult[0])) {
      attrs.push({ name: regResult[1].startsWith(':') ? regResult[1].substring(1) : regResult[1], value: regResult[2], isDynamic: regResult[1].startsWith(':') })
      i += regResult[0].length
    }
    node.attrs = attrs
  }
  function parseText () {
    const tpl = temp.substring(i); const regText = /^[^<]+/
    const regDynamicVar = /(?<=\{\{\s*)[^\s]*(?=\s*\}\})/g
    const text = regText.exec(tpl)[0]
    const exp = regDynamicVar.exec(text)[0]
    node.children.push({
      content: exp,
      isExp: true
    })
    i += text.length
  }
  console.log(node)
  return node
}

export {
  parse
}
