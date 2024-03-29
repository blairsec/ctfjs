ctfjs is a CTF (capture the flag) competition backend written in Node.js.

## Authentication

A JWT given by the server is used for authentication for all routes that require it.
It is sent and received with an authorization header. Ex: `Authorization: Token <token>`

## Requests

All request bodies and responses should be content-type `application/json`.
Error responses are either empty or of the form `{"message": <string>}`.

Required request parameters that are strings must be at least 1 character long.

## Routes

### [Users](users.md)

Creating, modifying, and viewing users.

### [Teams](teams.md)

Creating, joining, modifying, and viewing teams.

### [Admin](admin.md)

Creating, modifying, and viewing admin users.

### [Auth](auth.md)

Generating authentication tokens.

### [Self](self.md)

Getting information about currently logged in user.

### [Challenges](challenges.md)

Creating, modifying, and viewing challenges, and submitting flags.

### [Competitions](competitions.md)

Creating, modifying, and viewing competitions.

## Responses

Required properties are (almost) always returned with an object. Exceptions are noted when they occur.

Optional properties are returned as specified in the description or the route. If it is unspecified whether an optional property is returned, check the default.

### User

#### Required Properties

| name     | type     | description   |
| -------- | -------- | ------------- |
| id       | number   | user id       |
| username | string   | username      |
| eligible | boolean  | eligibility   |
| created  | ISO 8601 | creation time |

#### Optional Properties

| name  | type          | description                                        | default         |
| ----- | ------------- | -------------------------------------------------- | --------------- |
| team  | [team](#team) | user's team (if they have one)                     | if exists       |
| admin | boolean       | `true` if the user is an admin, otherwise not sent | see description |
| email | string        | user's email address                               | no              |

### User List

#### Required Properties

| name     | type     | description   |
| -------- | -------- | ------------- |
| id       | number   | user id       |
| username | string   | username      |
| eligible | boolean  | eligibility   |
| created  | ISO 8601 | creation time |

#### Optional Properties

| name  | type                                | description          | default |
| ----- | ----------------------------------- | -------------------- | ------- |
| team  | [team](#team) with only id and name | user's team          | yes     |
| email | string                              | user's email address | no      |

### Team

#### Required Properties

| name        | type                                                             | description                           |
| ----------- | ---------------------------------------------------------------- | ------------------------------------- |
| id          | string                                                           | team id                               |
| name        | string                                                           | team name                             |
| affiliation | string                                                           | team affiliation                      |
| eligible    | boolean                                                          | whether all team members are eligible |
| created     | ISO 8601                                                         | creation date                         |
| solves      | [submission list](#submission-list) including user and challenge | correct submissions by team           |
| members     | [user](#user) without team                                       | users on team                         |

#### Optional Properties

| name     | type   | description   | default |
| -------- | ------ | ------------- | ------- |
| passcode | string | team passcode | no      |

### Team List

#### Required Properties

| name        | type    | description                               |
| ----------- | ------- | ----------------------------------------- |
| id          | string  | team id                                   |
| name        | string  | team name                                 |
| affiliation | string  | team affiliation                          |
| eligible    | boolean | whether all team members are eligible     |
| score       | number  | score of team prior to end of competition |
| created     | ISO8601 | team creation date                        |

| name      | type     | description        | default   |
| --------- | -------- | ------------------ | --------- |
| lastSolve | ISO 8601 | date of last solve | if exists |

### Submission List

#### Required Properties

| name | type     | description        |
| ---- | -------- | ------------------ |
| id   | number   | submission id      |
| time | ISO 8601 | time of submission |

#### Optional Properties

| name      | type                    | description                      | default |
| --------- | ----------------------- | -------------------------------- | ------- |
| team      | [team](#team)           | team that submitted              | yes     |
| user      | [user](#user)           | user that submitted              | yes     |
| challenge | [challenge](#challenge) | challenge that submission is for | yes     |

### Challenge

#### Required Properties

| name        | type                                                      | description                |
| ----------- | --------------------------------------------------------- | -------------------------- |
| id          | number                                                    | challenge id               |
| title       | string                                                    | challenge title            |
| description | string                                                    | challenge description      |
| value       | number                                                    | point value                |
| author      | string                                                    | challenge author           |
| category    | string                                                    | challenge category         |
| created     | ISO 8601                                                  | time of challenge creation |
| solves      | list of [submissions](#submission-list) without challenge | challenge solves           |

#### Optional Properties

| name    | type    | description                  | default   |
| ------- | ------- | ---------------------------- | --------- |
| hint    | string  | challenge hint               | if exists |
| enabled | boolean | whether challenge is enabled | if admin  |
| flag    | string  | the flag                     | if admin  |

### Challenge List

#### Required Properties

| name        | type   | description           |
| ----------- | ------ | --------------------- |
| id          | number | challenge id          |
| title       | string | challenge title       |
| description | string | challenge description |
| value       | number | point value           |
| author      | string | challenge author      |
| category    | string | challenge category    |
| solves      | number | number of solves      |

#### Optional Properties

| name    | type    | description                  | default   |
| ------- | ------- | ---------------------------- | --------- |
| hint    | string  | challenge hint               | if exists |
| enabled | boolean | whether challenge is enabled | if admin  |
| flag    | string  | the flag                     | if admin  |

### Competition

#### Required Properties

| name    | type     | description           |
| ------- | -------- | --------------------- |
| id      | number   | competition id        |
| created | ISO 8601 | creation date         |
| name    | string   | competition name      |
| about   | string   | about the competition |
| start   | ISO 8601 | start date            |
| end     | ISO 8601 | end date              |

#### Optional Properties

| name     | type   | description     | default   |
| -------- | ------ | --------------- | --------- |
| teamSize | number | team size limit | if exists |

### Competition List

#### Required Properties

| name    | type     | description           |
| ------- | -------- | --------------------- |
| id      | number   | competition id        |
| created | ISO 8601 | creation date         |
| name    | string   | competition name      |
| about   | string   | about the competition |
| start   | ISO 8601 | start date            |
| end     | ISO 8601 | end date              |

#### Optional Properties

| name     | type   | description     | default   |
| -------- | ------ | --------------- | --------- |
| teamSize | number | team size limit | if exists |
