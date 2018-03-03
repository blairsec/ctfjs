# Team routes

## Create and join a team :lock:
Creates and joins a team.
### `POST /teams`
### Request Body

|name|type|required|requirements|
|----|----|--------|------------|
|name|string|yes|none|
|affiliation|string|no|none|
|passcode|string|yes|none|

### Responses

|code|description|content|
|----|-----------|-------|
|400|data validation failed|`{"message": "invalid_values"}`|
|201|successfully created team|none|
|409|team name conflict|`{"message": "team_already_exists"}`|
|403|user already on team|`{"message": "user_already_has_team"}`|
|401|authentication failed|none|

## Get a list of teams
Gets a list of teams.
### `GET /teams`
### Responses

|code|description|content|
|----|-----------|-------|
|200|a list of teams|array of [teams](index.md#team)|

## Get a team
Gets a single team.
### `GET /teams/{id}`
Note: `id` can be `self` to get the current user's team
### Responses

|code|description|content|
|----|-----------|-------|
|200|a list of teams|array of [teams](index.md#team)|
|401|user requested self, but isn't authenticated|none|
|404|team not found|`{"message": "team_not_found"}`|

## Join a team :lock:
Joins a team.
### `PATCH /teams`
### Request body

|name|type|required|requirements|
|----|----|--------|------------|
|name|string|yes|none|
|passcode|string|yes|none|

### Responses

|code|description|content|
|----|-----------|-------|
|403|user already in team|`{"message": "already_in_team"}`|
|403|incorrect passcode|`{"message": "incorrect_passcode"}`|
|204|successfully joined team|none|
|401|authentication failed|none|

## Modify a team :lock:
Modifies a team. Requires authentication.
### `PATCH /teams/{id}`
Note: `id` can be `self` to modify the current user's team.

User must either be an admin or modifying their own team.
### Request Body

|name|type|required|requirements|
|----|----|--------|------------|
|name|string|no|none|
|affiliation|string|no|none|

### Responses

|code|description|content|
|----|-----------|-------|
|204|successfully modified team|none|
|409|team name already in use|`{"message": "team_name_conflict"}`|
|404|team not found|`{"message": "team_not_found"}`|
|403|user not permitted to modify team|`{"message": "action_forbidden"}`|
|401|authentication failed|none|