var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var Challenge = require('../models/challenge')
var responses = require('../responses')
var Submission = require('../models/submission')
var router = express.Router()

var { body, validationResult } = require('express-validator/check')


// get a list of challenges
router.get('/', async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async function (err, user) {
    var challenges = await Challenge.find({ competition: req.competition }).populate({path: 'submissions', populate: {path: 'user team', populate: { path: 'members submissions', populate: 'challenge user team' }}}).exec()
    res.json(challenges.map(challenge => responses.challenge(challenge, user && user.team ? challenge.solved(user.team._id) : null)))
  })(req, res, next)
})

// create a challenge
router.post('/', [
  body('title').exists(),
  body('description').exists(),
  body('value').isNumeric(),
  body('author').exists(),
  body('flag').exists(),
  body('category').exists()
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
      var challenge = await Challenge.findOne({ competition: req.competition, _id: req.params.id }).populate('submissions').exec()
      var team = await Team.findOne({ competition: req.competition, _id: req.user.team }).populate('members').populate({ path: 'submissions', populate: { path: 'challenge', populate: { path: 'submissions' } } }).exec()
      if (team.solves.map(solve => solve.challenge._id).indexOf(challenge._id) === -1) {
        var submission = new Submission({
          team: team._id,
          user: req.user._id,
          challenge: challenge._id,
          content: req.body.flag,
          competition: req.competition
        })
        await submission.save()
        submission = await Submission.findOne({ competition: req.competition, _id: submission._id }).populate('challenge').exec()
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