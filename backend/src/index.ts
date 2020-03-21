import bodyParser from 'body-parser'
import express from 'express'
import serveStatic from 'serve-static'
import { resolve } from 'path';

const app = express()

app.use(serveStatic(resolve("./client")))
app.use(bodyParser.json())

app.on('ready', () => {
  const port = "8080";
  app.listen(port, () => {
    console.log(`🚀 Server is ready at port ${port}`)
  })
})

app.emit('ready');
