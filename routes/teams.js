module.exports = function (ctf) {
  var express = require('express')
  var passport = require('passport')
  var User = require('../models/user')
  var Team = require('../models/team')
  var Competition = require('../models/competition')
  var router = express.Router()

  var { body, validationResult } = require('express-validator/check')

  // create + join team
  router.post('/', [
    body('name').isString().trim().isLength({ min: 1 }),
    body('passcode').isString().isLength({ min: 1 }),
    body('affiliation').isString().trim().isLength({ min: 1 }).optional()
  ], passport.authenticate('jwt', { session: false }), async (req, res) => {
    // check if data was valid
    var errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'invalid_values'})
    }
    await ctf.emitBefore('createTeam', req)
    var user = req.user
    if (!user.team || new Date((await Competition.findOne({ id: req.competition })).start) > new Date()) {
      var team = new Team({
        name: req.body.name,
        passcode: req.body.passcode,
        affiliation: (req.body.affiliation ? req.body.affiliation : null),
        competition: parseInt(req.competition)
      })
      try {
        await team.save()
        req.user.team = team.id
        try {
          await req.user.save()
          await ctf.emitAfter('createTeam', req, { team: team, user: user })
          res.sendStatus(201)
        } catch (err) {
          console.log(err)
          res.sendStatus(500)
        }
      } catch (err) {
        res.status(409).json({message: 'team_name_conflict'})
      }
    } else {
      res.status(403).json({message: 'user_already_has_team'})
    }
  })

  // get list of teams
  router.get('/', async (req, res) => {
    await ctf.emitBefore('getTeams', req)
    var team = await Team.findSerialized({competition: req.competition})
    await ctf.emitAfter('getTeams', req)
    res.json(team)
  })

  // get a team
  router.get('/:team', async (req, res, next) => {
    try {
      await ctf.emitBefore('getTeam', req)
      var team = await Team.findOneSerialized({ competition: req.competition, id: req.params.team })
      await ctf.emitAfter('getTeam', req, { team: team })
      var teamNotFoundError = 'team_not_found'
      if (team) res.json(team)
      else throw teamNotFoundError
    } catch (err) {
      if (err === 'team_not_found') res.status(404).json({message: 'team_not_found'})
      else throw err
    }
  })

  // join a team
  router.patch('/', [
    body('name').isString().trim().isLength({ min: 1 }),
    body('passcode').isString().isLength({ min: 1 })
  ], passport.authenticate('jwt', { session: false }), async (req, res) => {
    // check if data was valid
    var errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'invalid_values'})
    }
    await ctf.emitBefore('joinTeam', req)
    var team = await Team.findOneSerialized({ competition: req.competition, name: req.body.name }, { passcode: true })
    if (team) {
      if (team.members.filter(member => member.id === req.user.id).length > 0) {
        return res.status(403).json({message: 'already_in_team'})
      }
      if (new Date((await Competition.findOne({ id: req.competition })).start) <= new Date() && req.user.team) return res.status(403).json({message: 'user_already_has_team'})
      if (req.body.passcode !== team.passcode) {
        return res.status(403).json({message: 'incorrect_passcode'})
      }
      var competition = await Competition.findOne({id: req.competition})
      if (competition.teamSize && team.members.length >= competition.teamSize) return res.status(403).json({message: 'team_is_full'})
      var user = await User.findOne({ competition: req.competition, id: req.user.id })
      user.team = team.id
      await user.save()
      await ctf.emitAfter('joinTeam', req, { user: user, team: team, competition: competition })
      res.sendStatus(204)
    } else {
      res.status(404).json({message: 'team_not_found'})
    }
  })

  // modify a team
  router.patch('/:team', [
    body('name').isString().trim().isLength({ min: 1 }).optional(),
    body('affiliation').isString().isLength({ min: 1 }).optional()
  ], passport.authenticate('jwt', { session: false }), async (req, res) => {
    await ctf.emitBefore('modifyTeam', req)
    req.params.team = parseInt(req.params.team)
    req.user = await User.findOneSerialized({id: req.user.id})
    if (req.user.admin === true || req.user.team.id === req.params.team) {
      var team = await Team.findOne({ competition: req.competition, id: req.params.team })
      if (team) {
        var errors = validationResult(req)
        errors = errors.array().map(e => e.param)
        if (errors.length > 0) return res.status(400).json({ message: 'invalid_values' })
        if (req.body.name) team.name = req.body.name
        if (req.body.affiliation) team.affiliation = req.body.affiliation
        try {
          await team.save()
          await ctf.emitAfter('modifyTeam', req, { team: team })
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

  return router
}
