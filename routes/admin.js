var express = require('express')
var passport = require('passport')
var User = require('../models/user')
var Team = require('../models/team')
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
    var admins = await User.findSerialized({ admin: true })
    if (req.user && req.user.admin === true || admins.length === 0) {
      var user = new User({
        username: req.body.username,
        email: req.body.email,
        eligible: false,
        admin: true,
        password: req.body.password,
        competition: 0
      })
      try {
        await user.save()
        res.sendStatus(201)
      } catch (error) {
        console.log(error)
        res.status(409).json({message: 'username_email_conflict'})
      }
    } else {
      res.status(403).json({message: 'action_forbidden'})
    }
  })(req, res, next)
})

// view admins
router.get('/', async (req, res) => {
  var admins = await User.findSerialized({ admin: true })
  res.json(admins)
})

// give authentication token
router.post('/auth', passport.authenticate('local', { session: false }), async (req, res) => {
  if (req.user.admin === true) {
    var token = jwt.sign({id: req.user.id, admin: true}, req.jwt_secret)
    res.cookie('token', token).json({ token: token })
  } else {
    res.sendStatus(401)
  }
})

module.exports = router