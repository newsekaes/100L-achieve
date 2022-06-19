const path = require('path')
const fs = require('fs')
const vm = require('vm')

function MyModule (id = '') {
  this.id = id
  this.path = path.dirname(id)
  this.exports = {}
  this.filename = null
  this.loaded = false
}

MyModule._dirname = ''

MyModule._cache = Object.create(null)

MyModule._wrapper = ['(function (exports, require, module, __filename, __dirname) {', '\n})']

MyModule._extensions = {}
MyModule._extensions['.js'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8')
  module._compile(content, filename)
}
MyModule._extensions['.json'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8')
  module.exports = JSON.parse(content)
}

MyModule._wrap = function (script) {
  return MyModule._wrapper[0] + script + MyModule._wrapper[1]
}

MyModule._resolveFilename = function (request) {
  const filename = path.resolve(MyModule._dirname, request) // 获取绝对路径
  const extname = path.extname(request) // 获取后缀名

  /* 没有后缀名， 自动按照相关顺序优先级添加后缀 */
  if (!extname) {
    const exts = Object.keys(MyModule._extensions)

    for (let i = 0; i < exts.length; i++) {
      const currentPath = `${filename}${exts[i]}`

      if (fs.existsSync(currentPath)) {
        return currentPath
      }
    }
  }

  return filename
}

MyModule._load = function (request) {
  const filename = MyModule._resolveFilename(request)

  const cacheModule = MyModule._cache[filename]
  if (cacheModule !== undefined) {
    return cacheModule
  }

  const module = new MyModule(filename)

  MyModule._cache[filename] = module.exports

  module.read(filename)

  return module.exports
}

MyModule.prototype.require = function (id) {
  return MyModule._load(id)
}

MyModule.prototype.read = function (filename) {
  const extname = path.extname(filename)

  MyModule._extensions[extname](this, filename)

  this.loaded = true
}

MyModule.prototype._compile = function (content, filename) {
  const wrapper = MyModule._wrap(content)

  const compiledWrapper = vm.runInThisContext(wrapper, filename)

  const dirname = path.dirname(filename)

  /* 注入模块中需要的变量；定义在 _wrapper 中 */
  compiledWrapper.call(this.exports, this.exports, this.require, this, filename, dirname)
}

exports.MyModule = MyModule
