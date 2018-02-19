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
  },
  submissions: [{
    team: Number,
    user: Number,
    flag: String,
    time: Date
  }],
  solves: [{
    team: {
      _id: Number,
      name: String
    },
    time: Date,
    user: {
      _id: Number,
      username: String
    }
  }]
}, {
  timestamps: {
    createdAt: 'createdAt'
  }
})

schema.plugin(autoIncrement.plugin, { model: 'Challenge', startAt: 1 })
module.exports = mongoose.model('Challenge', schema)