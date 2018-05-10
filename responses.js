function _populate (type, parents, paths) {
  if (type === "Challenge" && parents.indexOf("Challenge") === -1) {
    paths.push({path: 'Submission', populate: _populate("Submission", parents, [])})
  } else if (type === "Submission" && parents.indexOf("Submission") === -1) {
  } else if (type === 'Team' && parents.indexOf('Team') === -1) {
    paths.push({ path: 'members', populate: _populate('User', parents, []) })
    paths.push({ path: 'submissions', populate: _populate('Submission', parents, []) })
  } else if (type === 'User' && parents.indexOf('User') === -1) {
    paths.push({ path: 'submissions', populate: _populate('Submission', parents, []) })
  }
  return paths
}

function populate (object, type, parent) {
  console.log(_populate("Challenge", [parent], []))
  return object
}

function challenge (challengeObject, solved, admin) {
  var response = {
    id: challengeObject._id,
    title: challengeObject.title,
    description: challengeObject.description,
    value: challengeObject.value,
    author: challengeObject.author,
    category: challengeObject.category,
    solved: solved ? solved : false
  }
  if (challengeObject.submissions) response.solves = challengeObject.submissions.map(submissionObject => submission(submissionObject))
  if (admin) response.flag = challengeObject.flag
  return response
}

function competition (competitionObject) {
  var response = {
    id: competitionObject._id,
    name: competitionObject.name,
    start: competitionObject.start,
    end: competitionObject.end
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

function user (userObject) {
  var response = {
    id: userObject._id,
    username: userObject.username,
    eligible: userObject.eligible,
    created: userObject.createdAt
  }
  if (userObject.admin === true) response.admin = true
  if (userObject.team && typeof userObject.team === "object") response['team'] = team(userObject.team)
  return response
}

module.exports = { user, team, submission, challenge, competition, populate }

