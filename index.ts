/*
 * @Description: 入口文件
 * @Author: MADAO
 * @Date: 2020-11-23 15:57:35
 * @LastEditors: MADAO
 * @LastEditTime: 2020-11-24 11:11:53
 */
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import { join, extname } from 'path'
import { readFile } from 'fs'

const publicPath = join(__dirname, 'public')
const server = createServer()

const errorHandler = (error: NodeJS.ErrnoException, response: ServerResponse) => {
  switch(error.code) {
    case 'ENOENT': // 文件不存在
      response.statusCode = 404
      break
    case 'EISDIR': // 请求资源是一个目录
      response.statusCode = 403
      break
    default:
      response.statusCode = 500
      break
  }
  response.end()
}

const setContentType = (filename: string): string => {
  const extensionName = extname(filename).replace(/^\./, '')
  const contentTypeMap = {
    js: 'text/javascript',
    css: 'text/css',
    html: 'text/html'
  }
  return contentTypeMap[extensionName] || ''
}

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
  const { pathname } = parse(request.url)
  readFile(join(publicPath, pathname), (error, data) => {
    if (error) {
      errorHandler(error, response)
      return
    }
    let chunks = []
    request.on('data', (chunk) => {
      chunks.push(chunk)
    })
    request.on('end', () => {
      console.log('请求参数是：', Buffer.concat(chunks).toString())
    })
    response.writeHead(200, {
      'Content-type': setContentType(pathname),
      'Cache-Control': 'public, max-age=31536000'
    })
    response.end(data.toString())
  })
})

server.listen(1234)
