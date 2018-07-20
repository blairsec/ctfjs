var { db } = require('../db')
var Model = require('./model')

class Competition extends Model {

  static get tableName () {
    return 'competitions'
  }

  static get properties () {
    return super.properties.concat([
      {
        name: 'name',
        valid: name => typeof name === 'string',
        required: true
      }, {
        name: 'about',
        valid: about => typeof about === 'string'
      }, {
        name: 'start',
        valid: start => start instanceof Date
      }, {
        name: 'end',
        valid: end => end instanceof Date
      }, {
        name: 'teamSize',
        valid: teamSize => typeof teamSize === 'number'
      }
    ])
  }

  constructor (given) {
    super(given)
  }

}

module.exports = Competition