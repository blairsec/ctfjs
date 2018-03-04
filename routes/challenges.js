var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var Challenge = require('../models/challenge')
var responses = require('../responses')
var Submission = require('../models/submission')
var router = express.Router()

var { check, validationResult } = require('express-validator/check')


// get a list of challenges
router.get('/', async (req, res) => {
  var challenges = await Challenge.find({}).populate({ path: 'submissions', populate: { path: 'user team' } }).exec()
  res.json(challenges.map(challenge => responses.challenge(challenge)))
})

// create a challenge
router.post('/', [
  check('title').exists(),
  check('description').exists(),
  check('value').isNumeric(),
  check('author').exists(),
  check('flag').exists(),
  check('category').exists()
], passport.authenticate('jwt', { session: false }), async (req, res) => {
  console.log(req.user)
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
      category: req.body.category
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
      var challenge = await Challenge.findOne({_id: req.params.id}).populate('submissions').exec()
      var team = await Team.findOne({_id: req.user.team}).populate('members').populate({ path: 'submissions', populate: { path: 'challenge', populate: { path: 'submissions' } } }).exec()
      if (team.solves.map(solve => solve.challenge._id).indexOf(challenge._id) === -1) {
        var submission = new Submission({
          team: team._id,
          user: req.user._id,
          challenge: challenge._id,
          content: req.body.flag
        })
        await submission.save()
        submission = await Submission.findOne({ _id: submission._id }).populate('challenge').exec()
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

module.exports = router