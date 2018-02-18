var mongoose = require('mongoose')
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
  admin: Boolean
}, {
  timestamps: {
    createdAt: 'createdAt'
  }
})

schema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', schema)