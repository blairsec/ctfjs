module.exports = function (ctf) {
  var express = require('express')
  var passport = require('passport')
  var User = require('../models/user')
  var Team = require('../models/team')
  var jwt = require('jsonwebtoken')
  var router = express.Router()

  var { body, validationResult } = require('express-validator/check')

  // create an admin
  router.post('/', [
    body('username').isString().trim().isLength({ min: 1 }),
    body('password').isString().isLength({ min: 8 }),
    body('email').isString().trim().matches(/^\S+@\S+\.\S+$/)
  ], async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async function (err, user) {
      var admins = await User.findSerialized({ admin: true })
      if (user && user.admin === true || admins.length === 0) {
        await ctf.emitBefore('createAdmin', req, { currentUser: user })
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
          await ctf.emitAfter('createAdmin', req)
          res.sendStatus(201)
        } catch (error) {
          res.status(409).json({message: 'username_email_conflict'})
        }
      } else {
        res.status(403).json({message: 'action_forbidden'})
      }
    })(req, res, next)
  })

  // view admins
  router.get('/', async (req, res) => {
    ctf.emitBefore()
    var admins = await User.findSerialized({ admin: true }, { team: false })
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

  return router
}