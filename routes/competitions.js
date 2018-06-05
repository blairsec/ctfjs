var express = require('express')
var passport = require('passport')
var Competition = require('../models/competition')
var responses = require('../responses')
var router = express.Router()

var { body, validationResult } = require('express-validator/check')

// get a list of competitions
router.get('/', async function (req, res) {
  var competitions = await Competition.find({})
  res.json(competitions.map(competition => responses.competition(competition)))
})

// get a competition by id
router.get('/:competition', async function (req, res) {
  var competition = await Competition.findOne({ _id: req.params.competition })
  if (competition) { req.json(responses.competition(competition)) }
  else { req.status(404).json({ message: 'competition_not_found' }) }
})

// create a competition
router.post('/', passport.authenticate('jwt', { session: false }), [
  body('start').isISO8601(),
  body('end').isISO8601(),
  body('about').isString(),
  body('name').isString().isLength({ min: 1 })
], async function (req, res) {
  if (req.user.admin) {
    // check if data was valid
    var errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'invalid_values'})
    }

    var competition = await new Competition({
      start: req.body.start,
      end: req.body.end,
      about: req.body.about,
      name: req.body.name
    })
    var competition = await competition.save()

    res.sendStatus(201)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

// modify a competition HAVNE"T IEMTSPALTHJIESTU
router.patch('/:competition', passport.authenticate('jwt', { session: false }), [
  body('start').isISO8601(),
  body('end').isISO8601(),
  body('about').isString(),
  body('name').isString().isLength({ min: 1 })
], async function (req, res) {
  if (req.user.admin) {
    var competition = await Competition.findOne({ _id: req.params.competition })
    if (!competition) { return req.status(404).json({ message: 'competition_not_found' }) }
    // check if data was valid
    var errors = validationResult(req)
    errors = errors.array().map(e => e.param)

    if (req.body.start && errors.indexOf('start') === -1) competition.start = req.body.start
    if (req.body.end && errors.indexOf('end') === -1) competition.end = req.body.end
    if (req.body.about && errors.indexOf('about') === -1) competition.about = req.body.about
    if (req.body.name && errors.indexOf('name') === -1) competition.name = req.body.name
    competition = await competition.save()

    res.sendStatus(204)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

router.delete('/:competition', passport.authenticate('jwt', { session: false }), async function (req, res) {
  if (req.user.admin) {
    await Competition.deleteOne({ _id: req.params.competition })
    res.sendStatus(204)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

module.exports = router