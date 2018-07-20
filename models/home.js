var { db } = require('../db')
var Model = require('./model')

class Home extends Model {

	static get tableName () {
		return 'home'
	}

	static get properties () {
		return super.properties.concat([
			{
				name: 'title',
				valid: title => typeof title === 'string'
			},
			{
				name: 'content',
				valid: content => typeof content === 'string'
			}
		])
	}

	constructor (given) {
		super(given)
	}

}

module.exports = Home