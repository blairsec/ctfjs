var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')

var schema = new mongoose.Schema({
  challenge: {
    type: Number,
    ref: 'Challenge'
  },
  user: {
    type: Number,
    ref: 'User'
  },
  team: {
    type: Number,
    ref: 'Team'
  },
  content: String
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})

schema.methods.isValid = async function () {
  var submission = await this.populate()
  if (submission.content === submission.challenge.flag) {
    return true
  }
  return false
}
schema.virtual('correct').get(function () {
  return (this.content === this.challenge.flag)
})

schema.plugin(autoIncrement.plugin, { model: 'Submission', startAt: 1 })
module.exports = mongoose.model('Submission', schema)