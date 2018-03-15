const axios = require('axios')
const querystring = require('query-string')

const baseUrl = 'http://cnodejs.org/api/v1'

module.exports = function (req, res, next) {
  const path = req.path
  const user = req.session.user || {}
  const needAccessToken = req.query.needAccessToken

  if (needAccessToken && !user.accessToken) {
    res.status(401).send({
      success: false,
      msg: 'need login'
    })
  }

  // (needAccessToken && req.method === 'get/post') ? user.accessToken : ''
  // 确保在不同的请求方式需要时都有accessToken
  const query = Object.assign({}, req.query, {
    accesstoken: (needAccessToken && req.method === 'GET') ? user.accessToken : ''
  })
  if (query.needAccessToken) delete query.needAccessToken

  axios(`${baseUrl}${path}`, {
    method: req.method,
    params: query,
    // 转化前：{'accesstoken':'xxx'}  转化后 'accesstoken=xxx'
    //
    data: querystring.stringify(Object.assign({}, req.body, {
      accesstoken: (needAccessToken && req.method === 'POST') ? user.accessToken : ''
    })),
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    }
  }).then(resp => {
    if (resp.status === 200) {
      res.send(resp.data)
    } else {
      res.status(resp.status).send(resp.data)
    }
  }).catch(err => {
    if (err.response) {
      res.status(500).send(err.response.data)
    } else {
      res.status(500).send({
        success: false,
        msg: '未知错误'
      })
    }
  })
}
