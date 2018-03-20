/**
 * 客户端渲染
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
// react-hot-loader的热更新是依赖于webpack-dev-server(打包文件改变时reload刷新整个页面)
// react-hot-loader会根据stateNode节点的更新对比，只更新改变的reactDom节点
// 从而保留了未改变的state值，更适用于react的开发更新模式
// 更新1：使用AppContainer去包裹我们的根节点想要渲染的实际HTML内容
import { AppContainer } from 'react-hot-loader' // eslint-disable-line
import App from './views/App'

// 引入class 每次渲染生成一个新的实例
import AppState from './store/app-state'

const initialState = window.__INITIAL__STATE__ || {} // eslint-disable-line
// ReactDOM.hydrate(<App />, document.getElementById('root'))
// 更新2：封装成可传递参数的方法
// 将App挂载在document.body中，因为此时并没有模板，只有body可以使用
// 官方推荐在body中创建一个默认节点作为主dom
const root = document.getElementById('root')

// new AppState()拿到一个实例
const render = (Component) => {
  ReactDOM.hydrate(
    <AppContainer>
      <Provider appState={new AppState(initialState.appState)}>
        <BrowserRouter>
          <Component />
        </BrowserRouter>
      </Provider>
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
