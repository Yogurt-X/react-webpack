const path = require('path')
const webpack = require('webpack')
const HTMLPlugin = require('html-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const config = {
  entry: {
    app: path.join(__dirname, '../client/app.js')
  },
  output: {
    filename: '[name].[hash].js',
    path: path.join(__dirname, '../dist'),
    // 默认app.hash.js，public加在其之前，帮助区分是否是静态资源
    publicPath: '/public/'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      },
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, '../node_modules')
        ]
      }
    ]
  },
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname, '../client/template.html')
    })
  ]
}
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
    host: '0.0.0.0',
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
    overlay: {
      errors: true
    },
    publicPath: '/public/',
    historyApiFallback: {
      index: '/public/index.html'
    }
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}
module.exports = config
