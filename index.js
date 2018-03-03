#!/usr/bin/env node

var program = require('commander')
var pm2 = require('pm2')
var crypto = require('crypto')
var path = require('path')

var config = {
  jwt_secret: crypto.randomBytes(64).toString('hex'),
  db_uri: 'mongodb://localhost/ctfjs',
  port: 3000,
}

function start (callback) {
  pm2.start(path.join(__dirname, 'ctf.js'), { env: { PORT: config.port, DATABASE_URI: config.db_uri, SECRET_KEY: config.jwt_secret } }, function (err, proc) {
    if (err && err.message === 'Script already launched') console.log('Error: ctfjs already running')
    else if (err) throw err
    pm2.disconnect(callback)
  })
}

function stop (callback) {
  pm2.delete('ctf', function (err, proc) {
    if (err) throw err
    pm2.disconnect(callback)
  })
}

program
  .command('start')
  .option('-r, --restart', 'restart if already running')
  .option('-s, --secret-key <secret_key>', 'secret key')
  .option('-d --database <database_uri>', 'database URI')
  .option('-p --port <port>', 'port to listen on')
  .action(function (command) {
    if (command.secret) config.jwt_secret = command.secret
    if (command.uri) config.db_uri = command.uri
    if (command.port) config.port = command.port
    if (command.restart) stop(function () { start(function () { process.exit(0) }) })
    else start(function () { process.exit(0) })
  })

program
  .command('stop')
  .action(function (command) {
    stop(function () { process.exit(0) })
  })

program.parse(process.argv)