var express = require('express')
var passport = require('passport')
var jwt = require('jsonwebtoken')
var router = express.Router()

// give authentication token and set cookie (requires username and password in request body)
router.post('/', passport.authenticate('local', { session: false }), async (req, res) => {
  var token = jwt.sign({id: req.user.id, competition: req.competition}, req.jwt_secret)
  res.cookie('token', token).json({ token: token })
})

module.exports = router