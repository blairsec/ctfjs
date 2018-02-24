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
    Team.findOne({_id: req.user.team}, function (err, team) {
      Challenge.find({}, function (err, challenges) {
        res.json(challenges.map(challenge => responses.challenge(challenge, team.solves.map(solve => solve.challenge).indexOf(challenge._id) !== -1)))
      })
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
        Team.findOne({_id: req.user.team}, function (err, team) {
          if (team.solves.map(solve => solve.challenge).indexOf(challenge._id) === -1) {
            challenge.submissions.push({
              team: req.user.team,
              user: req.user._id,
              flag: req.body.flag,
              time: new Date
            })
            if (crypto.createHash('sha512').update(req.body.flag).digest('hex') === challenge.flag) {
              res.json({correct: true})
              team.solves.push({
                user: req.user._id,
                challenge: challenge._id,
                time: new Date
              })
              team.score += challenge.value
              team.save()
            } else {
              res.json({correct: false})
            }
            challenge.save()
          } else {
            res.sendStatus(400)
          }
        })
      }
    })
  }
})

module.exports = router