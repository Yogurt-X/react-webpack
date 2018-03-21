const path = require('path')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.base')

module.exports = webpackMerge(baseConfig, {
  target: 'node',
  entry: {
    app: path.join(__dirname, '../client/server-entry.js')
  },
  // 指定某些包不打包到我们最终输出的js中
  // dependencies包含的是已经安装在node modules中的模块，可以用require的方式在js中调用，不需要打包
  externals: Object.keys(require('../package.json').dependencies),
  output: {
    filename: 'server-entry.js',
    // 打包js使用的模块方案，commonjs2默认使用export.default来export模块
    libraryTarget: 'commonjs2'
  }
})
