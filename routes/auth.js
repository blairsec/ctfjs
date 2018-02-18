var config = require('../config')

var express = require('express')
var passport = require('passport')
var jwt = require('jsonwebtoken')
var User = require('../models/user')
var router = express.Router()

// give jwt
router.post('/', passport.authenticate('local'), function (req, res) {
  var token = jwt.sign({id: req.user._id}, config.jwt_secret)
  res.cookie('token', token).sendStatus(200)
})

module.exports = router