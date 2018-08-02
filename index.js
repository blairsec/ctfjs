var CTF = require('./ctf')
var process = require('process')

var ctf = new CTF({
  db_uri: process.env.DATABASE_URI,
  jwt_secret: process.env.SECRET_KEY
})

var express = require('express')
var app = express()
app.use(ctf.router)

app.listen(process.env.PORT)

module.exports = app
