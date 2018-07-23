var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var router = express.Router()

var { body, validationResult } = require('express-validator/check')

// register a user
router.post('/', [
  body('username').isString().isLength({ min: 1 }),
  body('password').isLength({ min: 8 }),
  body('email').isEmail(),
  body('eligible').isBoolean()
], async (req, res) => {
  // check if data was valid
  var errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({message: 'invalid_values'})
  }
  try {
    var user = new User({
      username: req.body.username,
      email: req.body.email,
      eligible: req.body.eligible,
      competition: req.competition,
      password: req.body.password
    })
    await user.save()
    res.sendStatus(201)
  } catch (error) {
    res.status(409).json({message: 'username_email_conflict'})
  }
})

// get a list of users
router.get('/', async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async function (err, self) {
    var users = await User.findSerialized({competition: req.competition}, {emails: self.admin, teams: true})
    res.json(users)
  })(req, res, next)
})

// get info about a user
router.get('/:user', async (req, res, next) => {
    try {
      user = await User.findOneSerialized({ id: req.params.user, competition: req.competition })
      if (user) res.json(user)
      else throw "user_not_found"
    } catch (err) {
      res.status(404).json({message: 'user_not_found'})
    }
})

// modify a user
router.patch('/:user', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.params.user === 'self') req.params.user = req.user.id
  req.params.user = parseInt(req.params.user)
  if (req.user.admin === true || req.user.id === req.params.user) {
    var user = await User.findOne({competition: req.competition, id: req.params.user})
    if (user) {
      if (req.body.email) {
        if (/\S+@\S+\.\S+/.test(req.body.email)) user.email = req.body.email
        else res.status(400).json({message: 'invalid_values'})
      }
      if (req.body.username) user.username = req.body.username
      if (typeof req.body.eligible === 'boolean') user.eligible = req.body.eligible
      try {
        await user.save()
        res.sendStatus(204)
      } catch (err) {
        res.status(409).json({message: 'username_email_conflict'})
      }
    } else {
      res.status(404).json({message: 'user_not_found'})
    }
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

module.exports = router