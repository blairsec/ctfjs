var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var responses = require('../responses')
var router = express.Router()

var { body, validationResult } = require('express-validator/check')

// register a user
router.post('/', [
  body('username').exists(),
  body('password').isLength({ min: 8 }),
  body('email').isEmail(),
  body('eligible').isBoolean()
], async (req, res) => {
  // check if data was valid
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({message: 'invalid_values'})
  }
  User.register(new User({
    username: req.body.username,
    usernameUnique: req.body.username + '_' + req.competition.toString(),
    email: req.body.email,
    eligible: req.body.eligible,
    competition: req.competition
  }), req.body.password, (err, user) => {
    if (err) {
      res.status(409).json({message: 'username_email_conflict'})
    } else {
      res.sendStatus(201)
    }
  })
})

// get a list of users
router.get('/', async (req, res) => {
  var users = await User.find({competition: req.competition}).populate({ path: 'team', populate: { path: 'members submissions', populate: { path: 'challenge', populate: { path: 'submissions' } } }, model: Team }).populate('submissions').exec()
  res.json(users.map(user => responses.user(user)))
})

// get info about a user
router.get('/:user', async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async function (err, user) {
    try {
      if (req.params.user !== 'self') user = await User.findOne({ _id: req.params.user }).populate({ path: 'team', populate: { path: 'members submissions', populate: { path: 'challenge', populate: { path: 'submissions' } } }, model: Team }).populate('submissions').exec()
      if (user) res.json(responses.user(user))
      else throw "user_not_found"
    } catch (err) {
      console.log(err)
      res.status(404).json({message: 'user_not_found'})
    }
  })(req, res, next)
})

// modify a user
router.patch('/:user', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.params.user === 'self') req.params.user = req.user._id
  req.params.user = parseInt(req.params.user)
  if (req.user.admin === true || req.user._id === req.params.user) {
    var user = await User.findOne({competition: req.competition, _id: req.params.user})
    if (user) {
      if (req.body.email) {
        if (/\S+@\S+\.\S+/.test(req.body.email)) user.email = req.body.email
        else res.status(400).json({message: 'invalid_values'})
      }
      if (req.body.username) user.username = req.body.username
      if (req.body.eligible) user.eligible = req.body.eligible
      try {
        await user.save()
        res.sendStatus(204)
      } catch (err) {
        res.status(409).json({message: 'username_email_conflict'})
      }
    } else {
      req.status(404).json({message: 'user_not_found'})
    }
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

module.exports = router