var { db } = require('../db')
var Model = require('./model')

var Submission = require('./submission')

class Team extends Model {
  static get tableName () {
    return 'teams'
  }

  static get properties () {
    return super.properties.concat([
      {
        name: 'name',
        valid: name => typeof name === 'string',
        required: true
      }, {
        name: 'passcode',
        valid: passcode => typeof passcode === 'string',
        required: true,
        private: true
      }, {
        name: 'competition',
        valid: competition => typeof competition === 'number',
        required: true,
        private: true
      }, {
        name: 'affiliation',
        valid: affiliation => typeof affiliation === 'string'
      }
    ])
  }

  static async findSerialized (properties) {
    // specify table name in properties
    for (var prop in properties) {
      properties['teams.' + prop] = properties[prop]
      delete properties[prop]
    }

    var teams = db.select('teams.id', 'teams.name', 'affiliation', 'teams.created', db.raw('bool_and(users.eligible) as eligible'), db.raw('sum(challenges.value) / count(DISTINCT users.id) as score')).max('submissions.created as lastSolve').from('teams').where(properties).leftJoin('submissions', 'teams.id', 'submissions.team').leftJoin('competitions', 'competitions.id', 'teams.competition').leftJoin('challenges', function () {
      this.on('submissions.challenge', 'challenges.id').andOn('submissions.content', 'challenges.flag').andOn('submissions.created', '<', 'competitions.end')
    }).leftJoin('users', 'users.team', 'teams.id').groupBy('teams.id')
    teams = await teams

    for (var t = 0; t < teams.length; t++) {
      if (teams[t].score === null) teams[t].score = 0
      if (teams[t].lastSolve === null) delete teams[t].lastSolve
      if (teams[t].eligible === null) teams[t].eligible = false
      teams[t].score = parseInt(teams[t].score)
    }

    return teams
  }

  static async findOneSerialized (properties, options) {
    var User = require('./user')

    var team = await super.findOneSerialized(properties)

    if (!team) return false

    team.solves = await Submission.findSerialized({ team: team.id }, { user: true, challenge: true, solved: true })

    team.members = await User.findSerialized({ team: team.id }, { teams: false })

    team.eligible = team.members.map(m => m.eligible).reduce((a, b) => a && b, true)

    if (options && options.passcode) team.passcode = (await this.findOne(properties)).passcode

    return team
  }
}

module.exports = Team
