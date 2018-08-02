module.exports = function (ctf) {
  var express = require('express')
  var passport = require('passport')
  var router = express.Router()

  var Competition = require('../models/competition')
  var User = require('../models/user')

  // get current authentication state
  router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await ctf.emitBefore('getSelf', req)
    var competition = req.user.competition ? await Competition.findOneSerialized({id: req.user.competition}) : false
    var user = await User.findOneSerialized({id: req.user.id}, { team: true, email: true })
    await ctf.emitAfter('getSelf', req, { user: user, competition: competition })
    res.json({ user: user, competition: competition })
  })

  return router
}
