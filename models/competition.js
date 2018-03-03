var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  challenges: [{
    type: Number,
    ref: 'Challenge'
  }],
  teams: [{
    type: Number,
    ref: 'Team'
  }],
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

module.exports = mongoose.model('Competition', schema)