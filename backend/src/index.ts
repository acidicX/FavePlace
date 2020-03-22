import bodyParser from 'body-parser'
import express from 'express'
import serveStatic from 'serve-static'
import favicon from 'serve-favicon'
import { resolve, join } from 'path';

const app = express()

app.use(bodyParser.json())
app.use(favicon(join(__dirname, '..', 'client', 'build', 'favicon.ico')))
app.use(serveStatic(resolve("./client")))

app.get('*', function (req, res) {
  res.sendFile(join(__dirname, '..', 'client', 'build', 'index.html'));
});

app.on('ready', () => {
  const port = "8080";
  app.listen(port, () => {
    console.log(`🚀 Server is ready at port ${port}`)
  })
})

app.emit('ready');
