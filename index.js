var config = require('./config')

// db config
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/ctfjs')


// server config
var passport = require('passport')
var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var app = express()

var usersRouter = require('./routes/users')
var authRouter = require('./routes/auth')
var teamsRouter = require('./routes/teams')

app.use(passport.initialize())
app.use(bodyParser.json())
app.use(cookieParser())
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/teams', teamsRouter)

// passport config
var LocalStrategy = require('passport-local').Strategy
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt
var User = require('./models/user')

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
}, function(payload, done) {
  User.findOne({_id: payload.id}, function(err, user) {
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


app.listen(3000)