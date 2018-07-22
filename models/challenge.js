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

  static async findSerialized (query) {

    // add challenges. to where fields
    for (var prop in query) {
      query['challenges.'+prop] = query[prop]
      delete query[prop]
    }

    // get challenges and number of correct submissions for each
    var challenges = await db.select('challenges.id', 'title', 'description', 'value', 'author', 'category').count('submissions.id as solves').from('challenges').where(query).leftJoin('submissions', function () {
      this.on('challenges.id', 'submissions.challenge').andOn('challenges.flag', 'submissions.content')
    }).groupBy('challenges.id')

    // convert submissions to numbers
    for (var c = 0; c < challenges.length; c++) {
      challenges[c].solves = parseInt(challenges[c].solves)
    }
    
    return challenges

  }

  static async findOneSerialized (query) {

    var challenge = await super.findOneSerialized(query)

    challenge.solves = await Submission.findSerialized({challenge: challenge.id}, {team: true, user: true, challenge: false})

    return challenge

  }

  constructor (given) {
    super(given)
  }

}
 
module.exports = Challenge