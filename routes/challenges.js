var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var Challenge = require('../models/challenge')
var responses = require('../responses')
var Submission = require('../models/submission')
var router = express.Router()

var cache = require('apicache').middleware

var { body, validationResult } = require('express-validator/check')


// get a list of challenges
router.get('/', cache('30 seconds'), async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async function (err, user) {
    var challenges = await responses.populate(Challenge.find({ competition: req.competition })).exec()
    res.json(challenges.map(challenge => responses.challenge(challenge, user && user.team ? challenge.solved(user.team._id) : null, user ? user.admin : false)))
  })(req, res, next)
})

// create a challenge
router.post('/', [
  body('title').isString().isLength({ min: 1 }),
  body('description').isString().isLength({ min: 1 }),
  body('value').isNumeric(),
  body('author').isString().isLength({ min: 1 }),
  body('flag').isString().isLength({ min: 1 }),
  body('category').isString().isLength({ min: 1 })
], passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.admin) {
    // check if data was valid
    var errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'invalid_values'})
    }
    var challenge = new Challenge({
      title: req.body.title,
      description: req.body.description,
      value: req.body.value,
      author: req.body.author,
      flag: req.body.flag,
      category: req.body.category,
      competition: req.competition
    })
    await challenge.save()
    res.sendStatus(201)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

// submit flag
router.post('/:id/submissions', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.team) {
    try {
      var challenge = await responses.populate(Challenge.findOne({ competition: req.competition, _id: req.params.id })).exec()
      var team = await responses.populate(Team.findOne({ competition: req.competition, _id: req.user.team._id })).exec()
      if (team.solves.map(solve => solve.challenge._id).indexOf(challenge._id) === -1) {
        var submission = new Submission({
          team: team._id,
          user: req.user._id,
          challenge: challenge._id,
          content: req.body.flag,
          competition: req.competition
        })
        await submission.save()
        submission = await responses.populate(Submission.findOne({ competition: req.competition, _id: submission._id })).exec()
        res.json({ correct: submission.correct })
      } else {
        res.status(400).json({ message: 'challenge_already_solved' })
      }
    } catch (err) {
      console.log(err)
      res.status(404).json({ message: 'challenge_not_found' })
    }
  } else {
    res.status(403).json({message: 'user_not_on_team'})
  }
})

// modify a challenge
router.patch('/:id', [
  body('title').isString().isLength({ min: 1 }),
  body('description').isString().isLength({ min: 1 }),
  body('value').isNumeric(),
  body('author').isString().isLength({ min: 1 }),
  body('flag').isString().isLength({ min: 1 }),
  body('category').isString().isLength({ min: 1 })
], passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.admin) {
    var challenge = await Challenge.findOne({ competition: req.competition, _id: req.params.id })
    if (!challenge) return res.status(404).json({message: 'challenge_not_found'})

    var errors = validationResult(req)
    errors = errors.array().map(e => e.param)

    if (req.body.title && errors.indexOf('title') === -1) challenge.title = req.body.title
    if (req.body.description && errors.indexOf('description') === -1) challenge.description = req.body.description
    if (req.body.value && errors.indexOf('value') === -1) challenge.value = req.body.value
    if (req.body.author && errors.indexOf('author') === -1) challenge.author = req.body.author
    if (req.body.flag && errors.indexOf('flag') === -1) challenge.flag = req.body.flag
    if (req.body.category && errors.indexOf('category') === -1) challenge.category = req.body.category


    challenge = await challenge.save()

    res.sendStatus(204)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }})

// delete a challenge
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.admin) {
    await Challenge.deleteOne({ _id: req.params.id })
    res.sendStatus(204)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

module.exports = router