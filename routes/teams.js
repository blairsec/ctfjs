var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var responses = require('../responses')
var router = express.Router()

// create team
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  if (!req.user.team) {
    var team = new Team({
      name: req.body.name,
      nameLower: req.body.name.toLowerCase(),
      passcode: req.body.passcode,
      members: [
        responses.user(req.user)
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
    res.json(teams.map(team => responses.team(team)))
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
        res.json(responses.team(team, true))
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
      res.json(responses.team(team))
    } else {
      res.sendStatus(404)
    }
  })
})

// join team
router.patch('/', passport.authenticate('jwt', { session: false }), function (req, res) {
  Team.findOne({nameLower: req.body.name.toLowerCase()}, function (err, team) {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    } else if (team) {
      if (team.members.filter(member => member.id == req.user._id).length > 0 || req.body.passcode != team.passcode) {
        res.sendStatus(403)
      } else {
        team.members.push(responses.user(req.user))
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