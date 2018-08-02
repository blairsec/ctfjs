var { db } = require('../db')
var Model = require('./model')

class Submission extends Model {
  static get tableName () {
    return 'submissions'
  }

  static get properties () {
    return super.properties.concat([
      {
        name: 'challenge',
        valid: challenge => typeof challenge === 'number',
        required: true
      }, {
        name: 'user',
        valid: user => typeof user === 'number'
      }, {
        name: 'team',
        valid: team => typeof team === 'number',
        required: true
      }, {
        name: 'competition',
        valid: competition => typeof competition === 'number',
        required: true
      }, {
        name: 'content',
        valid: content => typeof content === 'string',
        required: true
      }
    ])
  }

  static async findSerialized (properties, options) {
    for (var prop in properties) {
      properties['submissions.' + prop] = properties[prop]
      delete properties[prop]
    }

    if (options === undefined) options = { team: true, user: true, challenge: true }
    var query = db.select('submissions.id', 'submissions.created as time').from('submissions').where(properties)
    if (options.challenge) query = query.select('challenges.id as _challenge__id', 'challenges.title as _challenge__title', 'challenges.category as _challenge__category', 'challenges.value as _challenge__value', 'challenges.author as _challenge__author')
    query = query.join('challenges', function () {
      var on = this.on('challenges.id', 'submissions.challenge')
      if (options.solved) on.andOn('challenges.flag', 'submissions.content')
    })
    if (options.user) query = query.select('users.id as _user__id', 'users.username as _user__username').leftJoin('users', 'users.id', 'submissions.user')
    if (options.team) query = query.select('teams.id as _team__id', 'teams.name as _team__name', 'teams.affiliation as _team__affiliation').leftJoin('teams', 'teams.id', 'submissions.team')
    var submissions = await query

    // convert properties to objects (for users, teams, etc.)
    for (var s = 0; s < submissions.length; s++) {
      var sub = submissions[s]
      for (var p in sub) {
        if (p.indexOf('_') === 0 && p.indexOf('__') !== -1) {
          p = p.slice(1).split('__')
          if (sub[p[0]] === undefined) sub[p[0]] = {}
          sub[p[0]][p[1]] = sub['_' + p[0] + '__' + p[1]]
          delete sub['_' + p[0] + '__' + p[1]]
        }
      }
    }

    return submissions
  }
}

module.exports = Submission
