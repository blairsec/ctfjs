var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')
var passportLocalMongoose = require('passport-local-mongoose')

var schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  eligible: {
    type: Boolean,
    required: true
  },
  team: {
    type: Number,
    ref: 'Team'
  },
  competition: Number,
  admin: Boolean
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})
schema.index({ email: 1, competition: 1 }, { unique: true })
schema.plugin(autoIncrement.plugin, { model: 'User', startAt: 1 })
schema.plugin(passportLocalMongoose, { usernameCaseInsensitive: true, usernameField: "usernameUnique" })

schema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'user'
})

module.exports = mongoose.model('User', schema)
