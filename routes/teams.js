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
      passcode: req.body.passcode,
      members: [
        {
          username: req.user.username,
          _id: req.user._id,
          eligible: req.user.eligible
        }
      ],
      school: (req.body.school ? req.body.school : null)
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
            res.sendStatus(201)
          }
        })
      }
    })
  } else {
    res.sendStatus(403)
  }
})

// view list of teams
router.get('/', function (req, res) {
  Team.find({}, function(err, teams) {
    res.json(teams.map(team => ({
      name: team.name,
      eligible: team.members.reduce((teamEligible, member) => teamEligible && member.eligible, true),
      members: team.members,
      score: team.score,
      school: team.school
    })))
  })
})

// view own team
router.get('/self', passport.authenticate('jwt', { session: false }), function (req, res) {
  if (req.user.team) {
    Team.findOne({_id: req.user.team}, function (err, team) {
      if (err) {
        console.log(err)
        res.sendStatus(500)
      } else if (team) {
        res.json({
          name: team.name,
          eligible: team.members.reduce((teamEligible, member) => teamEligible && member.eligible, true),
          members: team.members,
          score: team.score,
          school: team.school,
          _id: team._id,
          passcode: team.passcode
        })
      } else {
        res.sendStatus(404)
      }
    })
  } else {
    res.sendStatus(404)
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
        eligible: team.members.reduce((teamEligible, member) => teamEligible && member.eligible, true),
        members: team.members,
        score: team.score,
        school: team.school
      })
    } else {
      res.sendStatus(404)
    }
  })
})

// join team
router.patch('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  Team.findOne({name: req.body.name}, function (err, team) {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else if (team) {
      if (team.members.filter(member => member._id == req.user._id).length > 0 || req.body.passcode != team.passcode) {
        res.sendStatus(403)
      } else {
        team.members.push({
          username: req.user.username,
          _id: req.user._id,
          eligible: req.user.eligible
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
                res.sendStatus(201)
              }
            })
          }
        })
      }
    } else {
      res.sendStatus(404)
    }
  })
})

module.exports = router