var { db } = require('../db')
var Model = require('./model')

var crypto = require('crypto')

var Team = require('./team')

class User extends Model {
  static get tableName () {
    return 'users'
  }

  static get properties () {
    return super.properties.concat([
      {
        name: 'username',
        valid: username => typeof username === 'string' && username.length >= 1,
        required: true
      }, {
        name: 'email',
        valid: email => typeof email === 'string' && email.length >= 1,
        required: true
      }, {
        name: 'eligible',
        valid: eligible => typeof eligible === 'boolean',
        required: true
      }, {
        name: 'team',
        valid: team => typeof team === 'number' && team >= 0
      }, {
        name: 'competition',
        valid: competition => typeof competition === 'number' && competition >= 0
      }, {
        name: 'admin',
        valid: admin => typeof admin === 'boolean'
      }, {
        name: 'hash',
        valid: hash => typeof hash === 'string',
        private: true
      }, {
        name: 'salt',
        valid: salt => typeof salt === 'string',
        private: true
      }, {
        name: 'iterations',
        valid: iterations => typeof iterations === 'number' && iterations > 0,
        private: true
      }
    ])
  }

  set password (password) {
    this.salt = crypto.randomBytes(32).toString('hex')
    this.hash = crypto.pbkdf2Sync(password, this.salt, this.iterations !== undefined ? this.iterations : 100000, 32, 'sha256').toString('hex')
  }

  authenticate (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, this.iterations, 32, 'sha256')
    return crypto.timingSafeEqual(hash, Buffer.from(this.hash, 'hex'))
  }

  static async findOneSerialized (properties, options) {
    if (options === undefined) {
      options = {
        team: true,
        email: false
      }
    }

    var user = await this.findOne(properties)

    if (!user) return false

    var serialized = {
      id: user.id,
      username: user.username,
      eligible: user.eligible,
      created: user.created
    }

    if (user.admin === true) serialized.admin = true
    if (options.email === true) serialized.email = user.email
    if (options.team === true && user.team) serialized.team = await Team.findOneSerialized({id: user.team})

    return serialized
  }

  static async findSerialized (properties, options) {
    if (options === undefined) {
      options = {
        teams: true
      }
    }

    for (var prop in properties) {
      properties['users.' + prop] = properties[prop]
      delete properties[prop]
    }

    if (options === undefined) options = {}

    var query = db.select('users.id', 'username', 'eligible', 'users.created')
    if (options.teams === true) query = query.select('teams.id as _team__id', 'teams.name as _team__name')
    if (options.emails === true) query = query.select('email')
    query = query.from('users').leftJoin('teams', 'teams.id', 'users.team').where(properties)

    var users = await query

    // convert properties to objects (for users, teams, etc.)
    for (var s = 0; s < users.length; s++) {
      var sub = users[s]
      for (var p in sub) {
        if (p.indexOf('_') === 0 && p.indexOf('__') !== -1) {
          p = p.slice(1).split('__')
          if (sub[p[0]] === undefined) sub[p[0]] = {}
          sub[p[0]][p[1]] = sub['_' + p[0] + '__' + p[1]]
          delete sub['_' + p[0] + '__' + p[1]]
        }
      }
    }

    // remove null teams
    if (options.teams) {
      for (var u = 0; u < users.length; u++) {
        if (users[u].team.id === null) delete users[u].team
      }
    }

    return users
  }

  constructor (given) {
    var password = given.password
    delete given.password

    super(given)

    if (typeof password === 'string' && password.length > 0) {
      this.password = password
    }
  }
}

module.exports = User
