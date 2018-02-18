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
      res.sendStatus(201)
    }
  })
})

// get info about self
router.get('/self', passport.authenticate('jwt', { session: false }), function (req, res) {
  res.json({
    username: req.user.username,
    _id: req.user._id,
    eligible: req.user.eligible,
    team: req.user.team
  })
})

// get info about user
router.get('/:user', function (req, res) {
  User.findOne({_id: req.params.user}, function (err, user) {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else if (user) {
      res.json({
        username: user.username,
        eligible: user.eligible,
        team: user.team
      })
    } else {
      res.sendStatus(404)
    }
  })
})

// get list of users
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  User.find({}, function(err, users) {
    res.json(users.map(user => ({
      username: user.username,
      _id: user._id,
      eligible: user.eligible,
      team: user.team
    })))
  })
})

module.exports = router