import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
// react-hot-loader的热更新是依赖于webpack-dev-server(打包文件改变时reload刷新整个页面)
// react-hot-loader会根据stateNode节点的更新对比，只更新改变的reactDom节点
// 从而保留了未改变的state值，更适用于react的开发更新模式
// 更新1：使用AppContainer去包裹我们的根节点想要渲染的实际HTML内容
import { AppContainer } from 'react-hot-loader' // eslint-disable-line
import App from './views/App'

// ReactDOM.hydrate(<App />, document.getElementById('root'))
// 更新2：封装成可传递参数的方法
// 将App挂载在document.body中，因为此时并没有模板，只有body可以使用
// 官方推荐在body中创建一个默认节点作为主dom
const root = document.getElementById('root')

const render = (Component) => {
  ReactDOM.hydrate(
    <AppContainer>
      <BrowserRouter>
        <Component />
      </BrowserRouter>
    </AppContainer>,
    root,
  )
}

render(App);

if (module.hot) {
  module.hot.accept('./views/App', () => {
    const NextApp = require('./views/App').default //eslint-disable-line
    // ReactDOM.hydrate(<NextApp />, document.getElementById('root'))
    render(NextApp)
  })
}
