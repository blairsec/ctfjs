var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var Challenge = require('../models/challenge')
var responses = require('../responses')
var crypto = require('crypto')
var router = express.Router()

// get list of challenges
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  if (req.user.team) {
    Challenge.find({}, function (err, challenges) {
      res.json(challenges.map(challenge => responses.challenge(challenge)))
    })
  }
})

// submit flag
router.post('/:id/submissions', passport.authenticate('jwt', { session: false }), function (req, res) {
  if (req.user.team) {
    Challenge.findOne({_id: req.params.id}, function (err, challenge) {
      if (err) {
        res.sendStatus(404)
      } else {
        if (crypto.createHash('sha512').update(req.body.flag).digest('hex') === challenge.flag) {
          res.json({correct: true})
        } else {
          res.json({correct: false})
        }
      }
    })
  }
})

module.exports = router