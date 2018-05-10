var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  start: Date,
  end: Date
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})
schema.plugin(autoIncrement.plugin, { model: 'Competition', startAt: 1 })

schema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'competition'
})
schema.virtual('teams', {
  ref: 'Team',
  localField: '_id',
  foreignField: 'competition'
})

module.exports = mongoose.model('Competition', schema)