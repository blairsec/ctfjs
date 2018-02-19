var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var Challenge = require('../models/challenge')
var responses = require('../responses')
var router = express.Router()

router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  Challenge.find({}, function (err, challenges) {
    res.json(challenges.map(challenge => responses.challenge(challenge)))
  })
})

module.exports = router