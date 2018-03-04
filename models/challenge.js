var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')

var schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  flag: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})
schema.plugin(autoIncrement.plugin, { model: 'Challenge', startAt: 1 })

schema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'challenge'
})

schema.methods.solved = function (teamId) {
  console.log(this.submissions.filter(submission => submission.content === this.flag))
  return this.submissions.filter(submission => submission.content === this.flag && (submission.team === teamId || submission.team._id === teamId)).length > 0
}

module.exports = mongoose.model('Challenge', schema)