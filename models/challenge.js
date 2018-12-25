var { db } = require('../db')
var Model = require('./model')

class Challenge extends Model {
  static get tableName () {
    return 'challenges'
  }

  static get properties () {
    return super.properties.concat([
      {
        name: 'title',
        valid: title => typeof title === 'string',
        required: true
      }, {
        name: 'description',
        valid: description => typeof description === 'string',
        required: true
      }, {
        name: 'value',
        valid: value => typeof value === 'number',
        required: true
      }, {
        name: 'author',
        valid: author => typeof author === 'string'
      }, {
        name: 'category',
        valid: category => typeof category === 'string'
      }, {
        name: 'hint',
        valid: hint => typeof hint === 'string'
      }, {
        name: 'enabled',
        valid: enabled => typeof enabled === 'boolean',
        required: true
      }, {
        name: 'flag',
        valid: flag => typeof flag === 'string',
        required: true,
        private: true
      }, {
        name: 'competition',
        valid: competition => typeof competition === 'number' && competition >= 0,
        required: true,
        private: true
      }
    ])
  }

  static async findSerialized (query, options) {
    if (options === undefined) options = { showDisabled: false, includeFlag: false }

    if (options.showDisabled === true) ;
    else query['enabled'] = true

    // add challenges. to where fields
    for (var prop in query) {
      query['challenges.' + prop] = query[prop]
      delete query[prop]
    }

    // get challenges and number of correct submissions for each
    var challenges = await db.select('challenges.id', 'title', 'description', 'value', 'author', 'category', 'hint', 'enabled', 'flag').count('submissions.id as solves').from('challenges').where(query).leftJoin('submissions', function () {
      this.on('challenges.id', 'submissions.challenge').andOn('challenges.flag', 'submissions.content')
    }).groupBy('challenges.id')

    // convert submissions to numbers
    for (var c = 0; c < challenges.length; c++) {
      challenges[c].solves = parseInt(challenges[c].solves)
      if (challenges[c].hint === null) delete challenges[c].hint
      if (options.showDisabled !== true) delete challenges[c].enabled
      if (options.includeFlag !== true) delete challenges[c].flag
    }

    return challenges
  }

  static async findOneSerialized (query, options) {
    if (options === undefined) options = { showDisabled: false, includeFlag: false }

    if (options.showDisabled === true) ;
    else query['enabled'] = true

    var includePrivate = []
    if (options.includeFlag === true) includePrivate = ['flag']

    var Submission = require('./submission')
    var challenge = await super.findOneSerialized(query, includePrivate)

    if (!options.showDisabled) delete challenge.enabled

    if (!challenge) return false

    challenge.solves = await Submission.findSerialized({challenge: challenge.id}, {team: true, user: true, challenge: false, solved: true})

    return challenge
  }
}

module.exports = Challenge
