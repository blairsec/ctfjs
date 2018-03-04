function challenge(challengeObject, solved, admin) {
  var response = {
    id: challengeObject._id,
    title: challengeObject.title,
    description: challengeObject.description,
    value: challengeObject.value,
    author: challengeObject.author,
    category: challengeObject.category,
    solved: solved ? solved : false
  }
  if (admin) response.flag = challengeObject.flag
  return response
}

function submission(solveObject, admin) {
  var response = {
    time: solveObject.createdAt
  }
  if (solveObject.team && typeof solveObject.team === "object") response.team = team(solveObject.team)
  if (solveObject.user && typeof solveObject.user === "object") response.user = user(solveObject.user)
  if (solveObject.challenge && typeof solveObject.challenge === "object") response.challenge = challenge(solveObject.challenge)
  if (admin) response.content = solveObject.content
  return response
}

function team(teamObject, self) {
  var response = {
    id: teamObject._id,
    name: teamObject.name,
    members: teamObject.members.map(member => user(member)),
    eligible: teamObject.members.reduce((teamEligible, member) => teamEligible && member.eligible, true),
    affiliation: teamObject.affiliation,
    created: teamObject.createdAt,
    score: teamObject.score,
    solves: teamObject.solves.map(solveObject => submission(solveObject))
  }
  if (self === true) response.passcode = teamObject.passcode
  return response
}

function user(userObject) {
  var response = {
    id: userObject._id,
    username: userObject.username,
    eligible: userObject.eligible,
    created: userObject.createdAt
  }
  if (userObject.team && typeof userObject.team === "object") response['team'] = team(userObject.team)
  return response
}

module.exports = { user, team, submission, challenge }