var mongoose = require('mongoose')
var autoIncrement = require('mongoose-plugin-autoinc')
var passportLocalMongoose = require('passport-local-mongoose')

var schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  eligible: {
    type: Boolean,
    required: true
  },
  team: {
    type: Number,
    ref: 'Team'
  },
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
schema.plugin(autoIncrement.plugin, { model: 'User', startAt: 1 })
schema.plugin(passportLocalMongoose, { usernameCaseInsensitive: true })

schema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'user'
})

module.exports = mongoose.model('User', schema)
