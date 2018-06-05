function _populate (type, parents, paths) {
  parents = parents.slice(0)
  parents.push(type)
  if (type === "Challenge") {
    if (parents.indexOf('Submission') === -1) { paths.push({path: 'submissions', populate: _populate("Submission", parents, [])}) }
  } else if (type === "Submission") {
    if (parents.indexOf('User') === -1) { paths.push({ path: 'user', populate: _populate('User', parents, []) }) }
    if (parents.indexOf('Team') === -1) { paths.push({ path: 'team', populate: _populate('Team', parents, []) }) }
    if (parents.indexOf('Challenge') === -1) { paths.push({ path: 'challenge', populate: _populate('Challenge', parents, []) }) }
  } else if (type === 'Team') {
    if (true) { paths.push({ path: 'members', populate: _populate('User', parents, []) }) }
    if (true) { paths.push({ path: 'submissions', populate: _populate('Submission', parents, []) }) }
    if (parents.indexOf('Competition') === -1) { paths.push({ path: 'competition', populate: _populate('Competition', parents, []) }) }
  } else if (type === 'User') {
    if (parents.indexOf('Submission') === -1) { paths.push({ path: 'submissions', populate: _populate('Submission', parents, []) }) }
    if (parents.indexOf('Team') === -1) { paths.push({ path: 'team', populate: _populate('Team', parents, []) }) }
    if (parents.indexOf('Competition') === -1) { paths.push({ path: 'competition', populate: _populate('Competition', parents, []) }) }
  }
  return paths
}

function populate (object, type, parent) {
  var paths = _populate(object.model.modelName, [parent], [])
  for (var i = 0; i < paths.length; i++) {
    object.populate(paths[i])
  }
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
    end: competitionObject.end,
    about: competitionObject.about
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

function user (userObject, self, admin) {
  var response = {
    id: userObject._id,
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

module.exports = { home, user, team, submission, challenge, competition, populate }

