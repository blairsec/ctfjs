var passport = require('passport')
var url = require('url')

module.exports = class CTF {

  constructor (config) {
    // db config
    var User = require('./models/user')
    var Team = require('./models/team')
    var Competition = require('./models/competition')
    var Submission = require('./models/submission')

    var mongoose = require('mongoose')
    mongoose.connect(config.db_uri)

    // passport config
    var LocalStrategy = require('passport-local').Strategy
    var JwtStrategy = require('passport-jwt').Strategy
    var User = require('./models/user')
    this.jwt_secret = config.jwt_secret

    passport.use(new LocalStrategy(User.authenticate()))
    passport.serializeUser(User.serializeUser())
    passport.deserializeUser(User.deserializeUser())

    passport.use(new JwtStrategy({
      jwtFromRequest: function (req) {
        var token = null
        if (req && req.cookies) {
          token = req.cookies.token
        }
        return token
      },
      secretOrKey: config.jwt_secret
    }, function (payload, done) {
      User.findOne({_id: payload.id, competition: payload.competition}).populate({
        path: 'team',
        populate: {path: 'members submissions', populate: {path: 'challenge', populate: {path: 'submissions'}}},
        model: Team
      }).populate('submissions').exec(function (err, user) {
        if (err) {
          return done(err, false)
        }
        if (user) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      })
    }))

    // server config
    var express = require('express')
    var bodyParser = require('body-parser')
    var cookieParser = require('cookie-parser')
    var router = express.Router()

    var usersRouter = require('./routes/users')
    var authRouter = require('./routes/auth')
    var teamsRouter = require('./routes/teams')
    var challengesRouter = require('./routes/challenges')
    var competitionsRouter = require('./routes/competitions')

    router.use(function (req, res, next) {
      req.jwt_secret = this.jwt_secret
      next()
    }.bind({jwt_secret: this.jwt_secret}))

    router.use(passport.initialize())
    router.use(bodyParser.json())
    router.use(cookieParser())
    router.use(function (req, res, next) {
      if (req.headers.referer && req.headers.host === url.parse(req.headers.referer).host && (req.method === "GET" || req.method === "HEAD" ||
        (req.cookies && req.cookies._csrf && req.body && req.body._csrf && req.cookies._csrf === req.body._csrf))) {
        next()
      } else {
        res.status(400).json({message: "invalid_csrf"})
      }
    })
    var assignCompetition = async function (req, res, next) {
      req.competition = req.params.competition
      var competition = await Competition.findOne({ _id: req.competition })
      if (competition) { next() }
      else { res.status(404).json({ message: 'competition_not_found' }) }
    }
    router.use('/competitions/:competition/auth', assignCompetition, authRouter)
    router.use('/competitions/:competition/users', assignCompetition, usersRouter)
    router.use('/competitions/:competition/teams', assignCompetition, teamsRouter)
    router.use('/competitions/:competition/challenges', assignCompetition, challengesRouter)
    router.use('/competitions', competitionsRouter)

    router.use(function (err, req, res, next) {
      console.error(err.stack)
      res.status(500).json({message: 'internal_server_error'})
    })

    this.router = router
  }

}