#!/usr/bin/env node

var program = require('commander')
var pm2 = require('pm2')
var crypto = require('crypto')
var path = require('path')

var config = {
  jwt_secret: crypto.randomBytes(64).toString('hex'),
  db_uri: 'postgresql://ctf@localhost:5432/ctf',
  port: 3000,
  env: {}
}

function start (callback) {
  var env = { PORT: config.port, DATABASE_URI: config.db_uri, SECRET_KEY: config.jwt_secret, CORS_ORIGIN: config.cors_origin }
  Object.assign(env, config.env)
  if (config.plugin_folder) env.PLUGIN_FOLDER = config.plugin_folder
  pm2.start(path.join(__dirname, 'index.js'), { env: env, name: 'ctf' }, function (err, proc) {
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
  .option('-d, --database <database_uri>', 'database URI')
  .option('-p, --port <port>', 'port to listen on')
  .option('-o, --cors-origin <cors_origin>', 'comma separated list of origins for CORS header')
  .option('-f, --plugin-folder <plugin_folder>', 'plugins folder')
  .option('-e, --environment <environment_var>s', 'environment variables in the form <key>=<val> separated by semicolons')
  .action(function (command) {
    if (command.secretKey) config.jwt_secret = command.secretKey
    if (command.database) config.db_uri = command.database
    if (command.port) config.port = command.port
    if (command.pluginFolder) config.plugin_folder = path.resolve(command.pluginFolder)
    if (command.corsOrigin) config.cors_origin = command.corsOrigin
    if (command.environment) {
      command.environment = command.environment.split(";")
      for (var i = 0; i < command.environment.length; i++) {
        var env = command.environment[i].split(/^([^=]+)=/)
        env.splice(0, 1)
        config.env[env[0]] = env[1]
      }
    }
    if (command.restart) stop(function () { start(function () { process.exit(0) }) })
    else start(function () { process.exit(0) })
  })

program
  .command('stop')
  .action(function (command) {
    stop(function () { process.exit(0) })
  })

program.parse(process.argv)
