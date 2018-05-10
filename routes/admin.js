var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
var responses = require('../responses')
var jwt = require('jsonwebtoken')
var router = express.Router()

var { body, validationResult } = require('express-validator/check')

// create an admin
router.post('/', [
  body('username').isString().isLength({ min: 1 }),
  body('password').isLength({ min: 8 }),
  body('email').isEmail()
], async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async function (err, user) {
    var admins = await User.find({ admin: true })
    if (req.user && req.user.admin === true || admins.length == 0) {
      User.register(new User({
        username: req.body.username,
        usernameUnique: req.body.username,
        email: req.body.email,
        eligible: false,
        admin: true
      }), req.body.password, (err, user) => {
        if (err) {
          res.status(409).json({message: 'username_email_conflict'})
        } else {
          res.sendStatus(201)
        }
      })
    }
  })(req, res, next)
})

// view admins
router.get('/', async (req, res) => {
  var admins = await User.find({ admin: true })
  res.json(admins.map(user => responses.user(user)))
})

// view self
router.get('/self', passport.authenticate('jwt', { session: false }), async (req, res) => {
  responses.populate(User.find({}), "User")
  if (req.user.admin === true) res.json(responses.user(req.user))
  else res.sendStatus(401)
})

// give authentication token
router.post('/auth', passport.authenticate('local'), async (req, res) => {
  var token = jwt.sign({id: req.user._id, admin: true}, req.jwt_secret)
  res.cookie('token', token).json({ token: token })
})

module.exports = router