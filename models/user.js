var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')
var passportLocalMongoose = require('passport-local-mongoose')

var schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  eligible: {
    type: Boolean,
    required: true
  },
  team: Number,
  admin: Boolean
}, {
  timestamps: {
    createdAt: 'createdAt'
  }
})

schema.plugin(autoIncrement.plugin, { model: 'User', startAt: 1 })
schema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', schema)