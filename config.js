var crypto = require('crypto')

module.exports = {
  jwt_secret: process.env.SECRET_KEY || crypto.randomBytes(64).toString('hex'),
  db_uri: process.env.DATABASE_URI || 'mongodb://localhost/ctfjs',
  port: process.env.PORT || 3000
}