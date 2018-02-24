function user(userObject) {
  return {
    username: userObject.username,
    id: userObject._id,
    eligible: userObject.eligible,
    team: userObject.team
  }
}

function team(teamObject, member) {
  var response = {
    name: teamObject.name,
    eligible: teamObject.members.reduce((teamEligible, member) => teamEligible && member.eligible, true),
    members: teamObject.members.map(member => user(member)),
    score: teamObject.score,
    affiliation: teamObject.affiliation,
    id: teamObject._id
  }
  if (member) {
    response.passcode = teamObject.passcode
  }
  return response
}

function solve(solveObject) {
  var response = {
    team: {
      id: solveObject.team._id,
      name: solveObject.team.name
    },
    user: {
      id: solveObject.user._id,
      username: solveObject.user.username
    },
    time: solveObject.time
  }
  return response
}

function challenge(challengeObject, solved) {
  var response = {
    id: challengeObject._id,
    title: challengeObject.title,
    description: challengeObject.description,
    value: challengeObject.value,
    author: challengeObject.author,
    category: challengeObject.category,
    solves: challengeObject.solves.map(solveObject => solve(solveObject)),
    solved: solved === true ? true : false
  }
  return response
}

module.exports = {
  user,
  team,
  solve,
  challenge
}