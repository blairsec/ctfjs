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

module.exports = {
  user,
  team
}