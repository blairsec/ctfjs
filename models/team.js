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
  score: {
    type: Number,
    default: 0
  },
  school: String,
  members: [{
    username: String,
    _id: Number,
    eligible: Boolean
  }]
}, {
  timestamps: {
    createdAt: 'createdAt'
  }
})

schema.plugin(autoIncrement.plugin, { model: 'Team', startAt: 1 })
module.exports = mongoose.model('Team', schema)