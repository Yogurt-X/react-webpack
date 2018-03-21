// http请求工具
const axios = require('axios')
const path = require('path')
// dev:server开发时template不在硬盘上 无法直接读取
const webpack = require('webpack')
// 在内存中读写文件，为了加快速度，api与nodejs中的fs一样
const MemoryFs = require('memory-fs')
// 代理
const proxy = require('http-proxy-middleware')
const serialize = require('serialize-javascript')
const ejs = require('ejs')
const asyncBootstrap = require('react-async-bootstrapper').default
const ReactDomServer = require('react-dom/server')
const Helmet = require('react-helmet').default
const serverConfig = require('../../build/webpack.config.server')

const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/server.ejs')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

// 使用module的构造方法创建一个新的module->Module
// const Module = module.constructor
// 修改
const NativeModule = require('module')
const vm = require('vm')
const getModuleFromString = (bundle, filename) => {
  const m = {exports: {}}
  // wrap会进行文件的包裹，包装成类似于这样的代码
  // '(function (exports, require, module, __filename, __dirname) {
  // '...bundle code'});`
  const wrapper = NativeModule.wrap(bundle)
  // 创建一个 vm.Script 实例, 编译要执行的代码
  const script = new vm.Script(wrapper, {
    filename: filename,
    displayErrors: true
  })
  const result = script.runInThisContext()
  // 第一个参数 m.exports去调用result代码
  // require 是当前环境的require，解决了不能require的问题
  result.call(m.exports, m.exports, require, m)
  return m
}

const mfs = new MemoryFs()

// webpack中一切皆模块
// webpack启动是以一个在nodejs中作为模块调用的方式，不是仅仅作为一个命令行工具
const serverCompiler = webpack(serverConfig)
// webpack启动的配置项，以前使用fs读写的文件现在都用mfs来读写，速度快
serverCompiler.outputFileSystem = mfs

let serverBundle, createStoreMap

serverCompiler.watch({}, (err, stats) => {
  if (err) throw err
  // webpack打包过程中输出的信息
  stats = stats.toJson()
  stats.errors.forEach(err => console.error(err))
  stats.warnings.forEach(warn => console.warn(warn))

  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )
  // webpack输出的内容的是一个string的内容 并不是可以在js中可以使用的模块的内容 使用module转换
  const bundle = mfs.readFileSync(bundlePath, 'utf-8')
  // 解析string内容 生成新的模块
  // const m = new Module()
  // // 需要指定module名字，因为require时是通过文件名找到的
  // m._compile(bundle, 'server-entry.js')
  const m = getModuleFromString(bundle, 'server-entry.js')
  // 模块是通过exports来挂载我们想要获得的东西
  serverBundle = m.exports.default
  // 将createStoreMap方法拿进来（server-entry.js export）
  createStoreMap = m.exports.createStoreMap
})

const getStoreState = (stores) => {
  return Object.keys(stores).reduce((result, storeName) => {
    result[storeName] = stores[storeName].toJson()
    return result
  }, {})
}

module.exports = function (app) {
  // 执行public下的请求就代理到8888端口
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  app.get('*', function (req, res) {
    getTemplate().then(template => {
      const routerContext = {}

      const stores = createStoreMap()

      // serverBundle现在不是一个可以直接渲染的内容，而是一个方法
      const app = serverBundle(stores, routerContext, req.url)

      asyncBootstrap(app).then(() => {
        const helmet = Helmet.rewind()
        const state = getStoreState(stores)
        const content = ReactDomServer.renderToString(app)
        // 需要在renderToString之后才能拿到Redirect的上下文
        if (routerContext.url) {
          res.status(302).setHeader('Location', routerContext.url)
          res.end()
          return
        }

        // res.send(template.replace('<!-- app -->', content))
        // serialize 序列化对象 state转化为字符串
        const html = ejs.render(template, {
          appString: content,
          initialState: serialize(state),
          meta: helmet.meta.toString(),
          title: helmet.title.toString(),
          style: helmet.style.toString(),
          link: helmet.link.toString()
        })
        res.send(html)
      })
    })
  })
}
