var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var router = express.Router()

// register user
router.post('/', function (req, res) {
  User.register(new User({
    username: req.body.username,
    email: req.body.email,
    eligible: req.body.eligible
  }), req.body.password, function(err, user) {
    if (err) {
      // TODO: implement error codes
      console.log(err)
      res.sendStatus(500)
    } else {
      res.sendStatus(200)
    }
  })
})

// get list of users
// requires admin
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  if (req.user.admin) {
    User.find({}, function(err, users) {
      res.send(users)
    })
  } else {
    res.sendStatus(403)
  }
})

module.exports = router