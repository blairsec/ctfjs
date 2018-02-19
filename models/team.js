var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')
var passportLocalMongoose = require('passport-local-mongoose')

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
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