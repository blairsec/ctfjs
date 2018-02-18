var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var router = express.Router()

// create team
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  if (!req.user.team) {
    var team = new Team({
      name: req.body.name,
      members: [
        {
          username: req.user.username,
          _id: req.user._id,
          eligible: req.user.eligible
        }
      ]
    })
    team.save(function (err) {
      if (err) {
        console.log(err)
        res.sendStatus(500)
      } else {
        req.user.team = team._id
        req.user.save(function (err) {
          if (err) {
            console.log(err)
            res.sendStatus(500)
          } else {
            res.sendStatus(200)
          }
        })
      }
    })
  } else {
    res.sendStatus(403)
  }
})

// view team
router.get('/:id', function (req, res) {
  Team.findOne({_id: req.params.id}, function (err, team) {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else if (team) {
      res.json({
        name: team.name,
        eligible: team.members.reduce((teamEligible, member) => teamEligible && member.eligible, true)
      })
    } else {
      res.sendStatus(404)
    }
  })
})

module.exports = router