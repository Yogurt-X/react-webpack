// http请求工具
const axios = require('axios')
const path = require('path')
// dev:server开发时template不在硬盘上 无法直接读取
const webpack = require('webpack')
// 在内存中读写文件，为了加快速度，api与nodejs中的fs一样
const MemoryFs = require('memory-fs')
// 代理
const proxy = require('http-proxy-middleware')
const ReactDomServer = require('react-dom/server')

const serverConfig = require('../../build/webpack.config.server')

const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/index.html')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

// 使用module的构造方法创建一个新的module->Module
const Module = module.constructor

const mfs = new MemoryFs()

// webpack中一切皆模块
// webpack启动是以一个在nodejs中作为模块调用的方式，不是仅仅作为一个命令行工具
const serverCompiler = webpack(serverConfig)
// webpack启动的配置项，以前使用fs读写的文件现在都用mfs来读写，速度快
serverCompiler.outputFileSystem = mfs

let serverBundle
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
  const m = new Module()
  // 需要指定module名字，因为require时是通过文件名找到的
  m._compile(bundle, 'server-entry.js')
  // 模块是通过exports来挂载我们想要获得的东西
  serverBundle = m.exports.default
})

module.exports = function (app) {
  // 执行public下的请求就代理到8888端口
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  app.get('*', function (req, res) {
    getTemplate().then(template => {
      const content = ReactDomServer.renderToString(serverBundle)
      res.send(template.replace('<!-- app -->', content))
    })
  })
}
