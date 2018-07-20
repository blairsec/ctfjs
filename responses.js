function challenge (challengeObject, solved, admin) {
  var response = {
    id: challengeObject.id,
    title: challengeObject.title,
    description: challengeObject.description,
    value: challengeObject.value,
    author: challengeObject.author,
    category: challengeObject.category,
    solves: []
  }
  if (challengeObject.submissions) response.solves = challengeObject.submissions.map(submissionObject => submission(submissionObject))
  if (admin) response.flag = challengeObject.flag
  return response
}

function competition (competitionObject) {
  var response = {
    id: competitionObject.id,
    name: competitionObject.name,
    start: competitionObject.start,
    end: competitionObject.end,
    about: competitionObject.about,
    teamSize: competitionObject.teamSize
  }
  return response
}

function submission (solveObject, admin) {
  var response = {
    time: solveObject.createdAt
  }
  if (solveObject.team && typeof solveObject.team === "object") response.team = team(solveObject.team)
  if (solveObject.user && typeof solveObject.user === "object") response.user = user(solveObject.user)
  if (solveObject.challenge && typeof solveObject.challenge === "object") response.challenge = challenge(solveObject.challenge)
  if (admin) response.content = solveObject.content
  return response
}

function team (teamObject, self) {
  var response = {
    id: teamObject.id,
    name: teamObject.name,
    affiliation: teamObject.affiliation,
    created: teamObject.createdAt,
  }
  try { response.score = teamObject.score } catch (e) {}
  if (teamObject.members) response.eligible = teamObject.members.reduce((teamEligible, member) => teamEligible && member.eligible, true)
  if (teamObject.members) response.members = teamObject.members.map(member => user(member))
  try { response.solves = teamObject.solves.map(solveObject => submission(solveObject)) } catch (e) {console.log(e)}
  if (self === true) response.passcode = teamObject.passcode
  return response
}

function user (userObject, self, admin) {
  var response = {
    id: userObject.id,
    username: userObject.username,
    eligible: userObject.eligible,
    created: userObject.createdAt
  }
  if (self === true || admin === true) response.email = userObject.email
  if (userObject.admin === true) response.admin = true
  if (userObject.team && typeof userObject.team === "object") response['team'] = team(userObject.team)
  return response
}

function home (homeObject) {
  return {
    title: homeObject.title,
    content: homeObject.content
  }
}

module.exports = { home, user, team, submission, challenge, competition }

