// 用到了JSX就需要import 'react'
import React from 'react'
// react-router用于服务端渲染的一个组件
import { StaticRouter } from 'react-router-dom'
import { Provider, useStaticRendering } from 'mobx-react';

// 'APP'会到node_modules目录下面找
import App from './views/App'

import { createStoreMap } from './store/store'

// 由于observable监听，让mobx在服务端渲染的时候不会重复数据变换
useStaticRendering(true)
// 将需要服务端渲染的内容export出去
// 多个store，使用解构
export default (stores, routerContext, url) => (
  <Provider {...stores}>
    <StaticRouter context={routerContext} location={url}>
      <App />
    </StaticRouter>
  </Provider>
)

export { createStoreMap }
