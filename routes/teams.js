var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var responses = require('../responses')
var router = express.Router()

var { body, validationResult } = require('express-validator/check')

// create + join team
router.post('/', [
  body('name').isString().isLength({ min: 1 }),
  body('passcode').isString().isLength({ min: 1 })
], passport.authenticate('jwt', { session: false }), async (req, res) => {
  // check if data was valid
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({message: 'invalid_values'})
  }
  var user = req.user
  if (!user.team) {
    var team = new Team({
      name: req.body.name,
      nameLower: req.body.name.toLowerCase(),
      passcode: req.body.passcode,
      affiliation: (req.body.affiliation ? req.body.affiliation : null),
      competition: req.competition
    })
    try {
      var team = await team.save()
      req.user.team = team._id
      try {
        var user = await req.user.save()
        res.sendStatus(201)
      } catch (err) {
        console.log(err)
        res.sendStatus(500)
      }
    } catch (err) {
      console.log(err)
      res.status(409).json({message: 'team_already_exists'})
    }
  } else {
    res.status(403).json({message: 'user_already_has_team'})
  }
})

// get list of teams
router.get('/', async (req, res, next) => {
  var teams = await responses.populate(Team.find({competition: req.competition})).exec()
  res.json(teams.map(team => responses.team(team)))
})

// get a team
router.get('/:team', async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async function (err, user) {
    try {
      if (req.params.team !== 'self') team = await responses.populate(Team.findOne({ competition: req.competition, _id: req.params.team })).exec()
      else {
        if (user === false) return res.sendStatus(401)
        team = await responses.populate(Team.findOne({ competition: req.competition, _id: user.team._id })).exec()
      }
      if (team) res.json(responses.team(team, user.team && user.team._id === team._id))
      else throw "team_not_found"
    } catch (err) {
      console.log(err)
      res.status(404).json({message: 'team_not_found'})
    }
  })(req, res, next)
})

// join a team
router.patch('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  var team = await responses.populate(Team.findOne({ competition: req.competition, nameLower: req.body.name.toLowerCase() })).exec()
  if (team) {
    if (team.members.filter(member => member.id == req.user._id).length > 0) {
      return res.status(403).json({message: "already_in_team"})
    }
    if (req.body.passcode != team.passcode) {
      return res.status(403).json({message: "incorrect_passcode"})
    }
    var user = await User.findOne({ competition: req.competition, _id: req.user._id })
    user.team = team._id
    await user.save()
    res.sendStatus(204)
  }
})

// modify a team
router.patch('/:team', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.params.team === 'self') req.params.team = req.user.team
  req.params.team = parseInt(req.params.team)
  if (req.user.admin === true || req.user.team._id === req.params.team) {
    var team = await responses.populate(Team.findOne({ competition: req.competition, _id: req.params.team })).exec()
    if (team) {
      if (req.body.name) team.name = req.body.name
      if (req.body.affiliation) team.affiliation = req.body.affiliation
      try {
        await team.save()
        res.sendStatus(204)
      } catch (err) {
        res.status(409).json({message: 'team_name_conflict'})
      }
    } else {
      res.status(404).json({message: 'team_not_found'})
    }
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

module.exports = router