var config = require('../config')

var express = require('express')
var passport = require('passport')
var jwt = require('jsonwebtoken')
var router = express.Router()

// give authentication token and set cookie (requires username and password in request body)
router.post('/', passport.authenticate('local'), async (req, res) => {
  var token = jwt.sign({id: req.user._id}, config.jwt_secret)
  res.cookie('token', token).json({ token: token })
})

module.exports = router