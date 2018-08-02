module.exports = function (ctf) {
  var express = require('express')
  var passport = require('passport')
  var jwt = require('jsonwebtoken')
  var router = express.Router()

  // give authentication token and set cookie (requires username and password in request body)
  router.post('/', passport.authenticate('local', { session: false }), async (req, res) => {
    await ctf.emitBefore('createAuth', req)
    var token = jwt.sign({id: req.user.id, competition: req.competition}, req.jwt_secret)
    await ctf.emitAfter('createAuth', req, { token: token })
    res.cookie('token', token).json({ token: token })
  })

  return router
}
