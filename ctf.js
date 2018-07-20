var passport = require('passport')
var responses = require('./responses')
var url = require('url')

module.exports = class CTF {

  constructor (config) {
    // db config
    require('./db').init(config.db_uri)
    var User = require('./models/user')
    var Team = require('./models/team')
    var Competition = require('./models/competition')
    var Submission = require('./models/submission')

    // passport config
    var LocalStrategy = require('passport-local').Strategy
    var JwtStrategy = require('passport-jwt').Strategy
    var User = require('./models/user')
    this.jwt_secret = config.jwt_secret

    passport.use(new LocalStrategy({ passReqToCallback: true }, function (req, username, password, done) {
      User.findOne({ username: username, competition: req.competition }).then(function (user) {
        if (user && user.authenticate(password)) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      })
    }))

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
      var query = { id: payload.id }
      if (payload.admin === true) query.admin = true
      if (payload.competition) query.competition = payload.competition
      User.findOne(query).then(function (user) {
        console.log(user)
        if (user) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      }).catch(function (err) {
        console.log(err)
        return done(err, false)
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
    var adminRouter = require('./routes/admin')
    var selfRouter = require('./routes/self')
    var homeRouter = require('./routes/home')

    router.use(function (req, res, next) {
      req.jwt_secret = this.jwt_secret
      next()
    }.bind({jwt_secret: this.jwt_secret}))

    router.use(passport.initialize())
    router.use(bodyParser.json())
    router.use(cookieParser())
    router.use(function (req, res, next) {
      if (req.headers.referer && req.headers.host === url.parse(req.headers.referer).host && (req.method === "GET" || req.method === "HEAD" ||
        (req.cookies && req.cookies._csrf && ((req.body && req.body._csrf && req.cookies._csrf === req.body._csrf) ||
        (req.query && req.query._csrf && req.cookies._csrf === req.query._csrf))))) {
        next()
      } else {
        res.status(400).json({message: "invalid_csrf"})
      }
    })
    var assignCompetition = async function (req, res, next) {
      req.competition = req.params.competition
      if (!isNaN(req.competition)) {
        var competition = await Competition.findOne({ id: req.competition })
      } else { var competition = undefined }
      if (competition) { req.competition = parseInt(req.competition); next() }
      else { res.status(404).json({ message: 'competition_not_found' }) }
    }
    router.use('/competitions/:competition/auth', assignCompetition, authRouter)
    router.use('/competitions/:competition/users', assignCompetition, usersRouter)
    router.use('/competitions/:competition/teams', assignCompetition, teamsRouter)
    router.use('/competitions/:competition/challenges', assignCompetition, challengesRouter)
    router.use('/competitions', competitionsRouter)
    router.use('/admin', function (req, res, next) { /* admin uses competition 0 */ req.competition = 0; next() }, adminRouter)
    router.use('/self', selfRouter)
    router.use('/home', homeRouter)

    router.use(function (err, req, res, next) {
      console.error(err.stack)
      res.status(500).json({message: 'internal_server_error'})
    })

    this.router = router
  }

}