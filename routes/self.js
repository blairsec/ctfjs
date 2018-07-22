var express = require('express')
var passport = require('passport')
var jwt = require('jsonwebtoken')
var router = express.Router()

var Competition = require('../models/competition')
var User = require('../models/user')

// get current authentication state
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  res.json({user: await User.findOneSerialized({id: req.user.id}, { team: true, email: true }), competition: req.user.competition ? await Competition.findOneSerialized({id: req.user.competition}) : false})
})

module.exports = router