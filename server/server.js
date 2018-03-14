const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const session = require('express-session')
const ReactSSR = require('react-dom/server')
const fs = require('fs')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'
const app = express()

// 对于不同数据格式的处理
// 把json请求格式的数据转换成req.body上的数据
app.use(bodyParser.json())
// 把对应表单请求的数据转换成req.body上的数据
app.use(bodyParser.urlencoded({extended: false}))

// 真正上线时session要存在数据库中
app.use(session({
  maxAge: 10 * 60 * 1000,
  name: 'tid', // cookie id放到浏览器端
  resave: false, // 每次请求是否重新生成新的cookie id
  saveUninitialized: false, // 指无论有没有session cookie，每次请求都设置个session cookie
  secret: 'react cnode class'// 加密

}))

app.use(favicon(path.join(__dirname, '../favicon.ico')))

app.use('/api/user', require('./util/handle-login'))
app.use('/api', require('./util/proxy'))

if (!isDev) {
  const serverEntry = require('../dist/server-entry').default
  const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8')
  // 使用express来处理静态文件，硬盘没有静态文件夹生成，在内存中。
  app.use('/public', express.static(path.join(__dirname, '../dist')))
  app.get('*', function (req, res) {
    const appString = ReactSSR.renderToString(serverEntry)
    res.send(template.replace('<!-- app -->', appString))
  })
} else {
  const devStatic = require('./util/dev-static')
  devStatic(app)
}

app.listen(3333, function () {
  console.log('server is listening on 3333')
})
