const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.base')
const HTMLPlugin = require('html-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const config = webpackMerge(baseConfig, {
  entry: {
    app: path.join(__dirname, '../client/app.js')
  },
  output: {
    filename: '[name].[hash].js'
  },
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname, '../client/template.html')
    }),
    new HTMLPlugin({
      template: '!!ejs-compiled-loader!' + path.join(__dirname, '../client/server.template.ejs'),
      filename: 'server.ejs'
    })
  ]
})
// webpack dev server
// webpack官方插件,通过webpack配置去启动一个微型服务器
// 便于开发者在开发过程中避免不必要的build以及start
// 并且该服务器编译出来的内容保存于内存中，一旦内容有更新，都会自动执行build，而不用手动build
// devServer会检测硬盘是否有目录，有时会以硬盘为准而非内存中编译文本的内容为准。
if (isDev) {
  config.entry = {
    /// webpack的entry可以是个数组，代表着该entry中引用的文件
    // webpack在打包时会将所有的文件打包在一个文件中
    app: [
      // 客户端热更新代码时需要用到的补丁包
      'react-hot-loader/patch',
      // 要打包的内容
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    // 兼容localhost，0.0.0.0，以及IP三种方式访问
    host: '0.0.0.0',
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
    // 网页什么时候出现遮罩警告层，这里配置为error时
    overlay: {
      errors: true
    },
    publicPath: '/public/',
    historyApiFallback: {
      // 为我们自动配置了很多映射关系，
      // 单页应用的所有url都会返回404，而该配置将所有前端返回的404请求都返回成historyApiFallback的index
      index: '/public/index.html'
    },
    proxy: {
      '/api': 'http://localhost:3333'
    }
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}
module.exports = config
