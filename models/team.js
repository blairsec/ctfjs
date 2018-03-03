var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameLower: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passcode: {
    type: String,
    required: true
  },
  affiliation: String
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})
schema.plugin(autoIncrement.plugin, { model: 'Team', startAt: 1 })


schema.virtual('members', {
  ref: 'User',
  localField: '_id',
  foreignField: 'team'
})
schema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'team'
})

schema.virtual('score').get(function () {
  return this.submissions.filter(submission => submission.correct).reduce((current, submission) => submission.challenge.value+current, 0)
})
schema.virtual('solves').get(function () {
  return this.submissions.filter(submission => submission.correct)
})

module.exports = mongoose.model('Team', schema)