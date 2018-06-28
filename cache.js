var Challenge = require('./models/challenge')
var Team = require('./models/team')
var Competition = require('./models/competition')
var responses = require('./responses')

teamCache = {}
challengeCache = {}

async function teams (competition) {
  var teams = await responses.populate(Team.find({competition: competition._id}), 'Scoreboard').exec()
  return teams.map(team => responses.team(team))
}

async function challenges (competition) {
  var challenges = await responses.populate(Challenge.find({ competition: competition._id })).exec()
  return challenges.map(challenge => responses.challenge(challenge))
}

async function updateTeams (competition) {
  teamCache = await teams(competition)
}

async function updateChallenges (competition) {
  challengeCache = await challenges(competition)
}

async function setChallengeUpdate (competition) {
  setInterval(function () { updateChallenges(competition) }, 30000)
}

async function setTeamUpdate (competition) {
  setInterval(function () { updateTeams(competition) }, 30000)
}

function getTeamCache (competition) {
  return teamCache
}

function getChallengeCache (competition) {
  return challengeCache
}

Competition.find({}).then(function (competitions) {
  for (var c = 0; c < competitions.length; c++) {
    console.log(competitions[c])
    updateTeams(competitions[c])
    updateChallenges(competitions[c])
    setChallengeUpdate(competitions[c])
    setTeamUpdate(competitions[c])
  }
})

module.exports = { getTeamCache, getChallengeCache }