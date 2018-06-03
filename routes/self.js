var express = require('express')
var passport = require('passport')
var jwt = require('jsonwebtoken')
var responses = require('../responses')
var router = express.Router()

// get current authentication state
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  res.json({user: responses.user(req.user, true, req.user.admin), competition: req.user.competition ? responses.competition(req.user.competition) : false})
})

module.exports = router