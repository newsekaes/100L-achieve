const { MyModule } = require('code/node/myModule')
const path = require('path')

describe('Test Nodejs module', () => {
  it('test', () => {
    MyModule._dirname = path.resolve(__dirname, './mock/')
    expect(MyModule._load('./main.js')).toEqual(
      [true, true]
    )
  })
})
