# Challenge routes

## Get a list of challenges
Gets a list of challenges.
### `GET /challenges`
### Responses
|code|description|content|
|----|-----------|-------|
|200|a list of challenges|array of [challenges](index.md#challenge)|

## Submit a flag :lock:
Submits a flag for a challenge. Requires the user to be on a team.
### `POST /challenges/{id}/submissions`
### Request Body
|name|type|required|requirements|
|----|----|--------|------------|
|flag|string|yes|none|
### Responses
|code|description|content|
|----|-----------|-------|
|200|submission result|`{"correct": true/false}`|
|400|challenge already solved|`{"message": "challenge_already_solved"}`|
|404|challenge not found|`{"message": "challenge_not_found"}`|
|403|user not on team|`{"message": "user_not_on_team"}`|
|401|authentication failed|none|