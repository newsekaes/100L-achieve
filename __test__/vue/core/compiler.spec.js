const { compiler, parse, tokenize } = require('code/vue/core/compiler.js')

describe('Test compiler', () => {
  const template = '<div><p>hello</p><p>World</p></div>'

  describe('1. Tokenize', () => {
    it('tokenize pass', function () {
      expect(tokenize(template)).toEqual([
        { type: 'tag', name: 'div' },
        { type: 'tag', name: 'p' },
        { type: 'text', content: 'hello' },
        { type: 'tagEnd', name: 'p' },
        { type: 'tag', name: 'p' },
        { type: 'text', content: 'World' },
        { type: 'tagEnd', name: 'p' },
        { type: 'tagEnd', name: 'div' }])
    })

    describe('2. Parse', () => {
      it('parse pass', function () {
        expect(parse(template)).toEqual(
          {
            type: 'Root',
            children: [{
              type: 'Element',
              tag: 'div',
              children: [
                {
                  type: 'Element',
                  tag: 'p',
                  children: [{ type: 'Text', content: 'hello' }],
                  attrs: []
                }, {
                  type: 'Element',
                  tag: 'p',
                  children: [{ type: 'Text', content: 'World' }],
                  attrs: []
                }
              ],
              attrs: []
            }]
          }
        )
      })
    })
  })

  it('Whole Pass', function () {
    // console.log(compiler(template))
    expect(compiler(template)).toEqual(
      'function render () {\n  return h(\'div\', [h(\'p\', \'hello\'), h(\'p\', \'World\')])\n}'
    )
  })
})
