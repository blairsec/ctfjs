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
  body('name').isString().isLength({ min: 1 })
], async function (req, res) {
  if (req.user.admin) {
    // check if data was valid
    var errors = validationResult(req)
    console.log(errors.mapped())
    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'invalid_values'})
    }

    var competition = await new Competition({
      start: req.body.start,
      end: req.body.end,
      name: req.body.name
    })
    competition = await competition.save()

    res.sendStatus(201)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

// modify a competition
router.patch('/:competition', passport.authenticate('jwt', { session: false }), [
  body('start').isISO8601(),
  body('end').isISO8601(),
  body('name').isString().isLength({ min: 1 })
], async function (req, res) {
  if (req.user.admin) {
    // check if data was valid
    var errors = validationResult(req)
    console.log(errors)

    res.sendStatus(201)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

module.exports = router