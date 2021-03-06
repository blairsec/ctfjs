var CTF = require('./ctf')
var process = require('process')

var ctf = new CTF({
  db_uri: process.env.DATABASE_URI,
  jwt_secret: process.env.SECRET_KEY,
  cors_origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : process.env.CORS_ORIGIN,
  disable_cache: !!process.env.DISABLE_CACHE
})

var express = require('express')
var app = express()
app.use(ctf.router)

if (process.env.PLUGIN_FOLDER) {
  var glob = require('glob')
  var path = require('path')

  glob.sync(process.env.PLUGIN_FOLDER + '/*/index.js').forEach(function (file) {
    require(path.resolve(file))(ctf)
  })
}

app.listen(process.env.PORT)

module.exports = app
