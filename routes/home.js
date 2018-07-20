var express = require('express')
var passport = require('passport')
var jwt = require('jsonwebtoken')
var Home = require('../models/home')
var router = express.Router()

var { body, validationResult } = require('express-validator/check')

// get home page text
router.get('/', async (req, res) => {
  var home = await Home.findOneSerialized({})
  if (home) return res.json(home)
  res.json({title: '', content: ''})
})

router.put('/', [
  body('title').isString(),
  body('content').isString()
], passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.admin) {
    // check if data was valid
    var errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'invalid_values'})
    }
    var home = await Home.findOne({})
    if (!home) home = await new Home()
    home.title = req.body.title
    home.content = req.body.content
    home = await home.save()
    res.sendStatus(204)
  } else {
    res.status(403).json({message: 'action_forbidden'})
  }
})

module.exports = router