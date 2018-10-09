var passport = require('passport')

var Competition = require('./models/competition')

module.exports = class CTF {
  constructor (config) {
    this._before = {}
    this._after = {}

    // db config
    require('./db').init(config.db_uri).then(function () { this.db = require('./db').db }.bind(this))
    this.models = {}
    this.models.User = require('./models/user')
    this.models.Team = require('./models/team')
    this.models.Competition = require('./models/competition')
    this.models.Submission = require('./models/submission')
    this.models.Challenge = require('./models/challenge')
    this.models.Model = require('./models/model')

    // passport config
    this.passport = passport
    var LocalStrategy = require('passport-local').Strategy
    var JwtStrategy = require('passport-jwt').Strategy
    var User = this.models.User
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
        if (req && req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' && req.headers.authorization.split(' ')[1]) {
          token = req.headers.authorization.split(' ')[1]
        }
        return token
      },
      secretOrKey: config.jwt_secret
    }, function (payload, done) {
      var query = { id: payload.id }
      if (payload.admin === true) query.admin = true
      if (payload.competition) query.competition = payload.competition
      User.findOne(query).then(function (user) {
        if (user) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      }).catch(function (err) {
        return done(err, false)
      })
    }))

    // server config
    var express = require('express')
    var bodyParser = require('body-parser')
    var cors = require('cors')
    var router = express.Router()

    var corsMiddleware
    if (config.cors_origin) corsMiddleware = cors({ origin: config.cors_origin, allowedHeaders: ['Authorization', 'Content-Type'] })

    if (corsMiddleware) {
      router.use(corsMiddleware)
      router.options(corsMiddleware)
    }

    var usersRouter = require('./routes/users')(this)
    var authRouter = require('./routes/auth')(this)
    var teamsRouter = require('./routes/teams')(this)
    var challengesRouter = require('./routes/challenges')(this)
    var competitionsRouter = require('./routes/competitions')(this)
    var adminRouter = require('./routes/admin')(this)
    var selfRouter = require('./routes/self')(this)

    router.use(function (req, res, next) {
      req.jwt_secret = this.jwt_secret
      next()
    }.bind({jwt_secret: this.jwt_secret}))

    router.use(passport.initialize())
    router.use(bodyParser.json())
    router.use('/competitions/:competition/auth', this._assignCompetition, authRouter)
    router.use('/competitions/:competition/users', this._assignCompetition, usersRouter)
    router.use('/competitions/:competition/teams', this._assignCompetition, teamsRouter)
    router.use('/competitions/:competition/challenges', this._assignCompetition, challengesRouter)
    router.use('/competitions', competitionsRouter)
    router.use('/admin', function (req, res, next) { req.competition = null; next() }, adminRouter)
    router.use('/self', selfRouter)

    router.use(function (err, req, res, next) {
      console.error(err.stack)
      res.status(500).json({message: 'internal_server_error'})
    })

    this.router = router
  }

  async competitionStarted (req, res, next) {
    if (req.competition) {
      var competition = await Competition.findOne({ id: req.competition })
      if (+new Date(competition.start) > +new Date()) res.status(403).json({message: 'competition_not_started'})
      else next()
    } else {
      res.status(403).json({message: 'competition_not_started'})
    }
  }

  async _assignCompetition (req, res, next) {
    var competition
    req.competition = req.params.competition
    if (!isNaN(req.competition)) {
      competition = await Competition.findOne({ id: req.competition })
    } else { competition = undefined }
    if (competition) { req.competition = parseInt(req.competition); next() } else { res.status(404).json({ message: 'competition_not_found' }) }
  }

  addCompetitionRoute (path, ...middleware) {
    this.router.use('/competitons/:competition' + path, this._assignCompetition, ...middleware)
  }

  addGlobalRoute (path, ...middleware) {
    this.router.use(path, ...middleware)
  }

  before (event, func) {
    if (this._before[event] === undefined) this._before[event] = []
    this._before[event].push(func)
  }

  after (event, func) {
    if (this._after[event] === undefined) this._after[event] = []
    this._after[event].push(func)
  }

  unbindBefore (event, func) {
    if (this._before[event] && this._before[event].indexOf(func) !== -1) {
      this._before[event].splice(this._before[event].indexOf(func), 1)
    }
  }

  unbindAfter (event, func) {
    if (this._after[event] && this._after[event].indexOf(func) !== -1) {
      this._after[event].splice(this._after[event].indexOf(func), 1)
    }
  }

  async emitBefore (event, req, additionalProperties) {
    if (this._before[event] === undefined) return
    for (var i = 0; i < this._before[event].length; i++) {
      await this._before[event][i](req, additionalProperties)
    }
  }

  async emitAfter (event, req, additionalProperties) {
    if (this._after[event] === undefined) return
    for (var i = 0; i < this._after[event].length; i++) {
      await this._after[event][i](req, additionalProperties)
    }
  }
}
