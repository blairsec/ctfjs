# ctf.js
ctf.js is a CTF (capture the flag) backend written in node.js.

## Authentication
A JWT given by the server is used for authentication for all routes that require it.
It is sent and received with the cookie `token`.

## Requests
All request bodies and responses should be content-type `application/json`.
Error responses are either empty or of the form `{"message": <string>}`.

## Routes
### [/users](users.md)
Creating, modifying, and viewing users.
### [/teams](teams.md)
Creating, joining, modifying, and viewing teams.
### [/auth](auth.md)
Generating authentication tokens.
### [/challenges](challenges.md)
Creating, modifying, and viewing challenges, and submitting flags.

## Responses
### User
Note: The team is not returned if the user is being sent as part of a team object.

No authentication:

|name|type|description|
|----|----|-----------|
|id|number|user id|
|username|string|username|
|eligible|boolean|eligibility|
|created|string|ISO timestamp of user creation|
|team|[team](#team)|user's team (if they have one)|

### Team
No authentication:

|name|type|description|
|----|----|-----------|
|id|number|team id|
|name|string|team name|
|members|array of [users](#user)|a list of the team's members|
|eligible|boolean|whether all members on the team are eligible|
|affiliation|string|team affiliation (can be blank)|
|created|string|ISO timestamp of team creation|
|score|number|team's current score|
|solves|array of [submissions](#submission)|a list of correct submissions|

Current user's own team (only returned in `/teams/{id}`):

|name|type|description|
|----|----|-----------|
|passcode|string|the team's passcode|

### Submission
Note: team, user, and challenge are not returned if the parent is of the same type

|name|type|description|
|----|----|-----------|
|time|string|ISO timestamp of submission time|
|team|[team](#team)|team that submitted|
|user|[user](#user)|user that submitted|
|challenge|[challenge](#challenge)|challenge that submission is for|

### Challenge

|name|type|description|
|----|----|-----------|
|id|number|challenge id|
|title|string|challenge title|
|description|string|challenge description|
|value|number|point value|
|author|string|challenge author|
|category|string|challenege category|
|solved|boolean|current user has solved (false if not logged in)|


