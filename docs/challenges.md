# Challenge routes

## Get a list of challenges
Gets a list of challenges.
### `GET /competitions/{id}/challenges`
### Responses

|code|description|content|
|----|-----------|-------|
|200|a list of challenges|array of [challenges](index.md#challenge)|

## Create a challenge :lock:
Creates a challenge. Requires admin.
### `POST /competitions/{id}/challenges`
### Request Body

|name|type|required|requirements|
|----|----|--------|------------|
|title|string|yes|none|
|description|string|yes|none|
|value|number|yes|none|
|author|string|yes|none|
|flag|string|yes|none|
|category|string|yes|none|

### Responses

|code|description|content|
|----|-----------|-------|
|201|successfully created challenge|none|
|400|invalid data provided|`{"message": "invalid_values"}`|
|403|user is not an admin|`{"message": "action_forbidden"}`|
|401|authentication failed|none|

## Submit a flag :lock:
Submits a flag for a challenge. Requires the user to be on a team.
### `POST /competitions/{id}/challenges/{id}/submissions`
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

## Modify a challenge :lock:

Modify a challenge. Requires admin.

### `PATCH /competitions/{id}/challenges/{id}`

### Request Body

| name        | type   | required | requirements |
| ----------- | ------ | -------- | ------------ |
| title       | string | no       | none         |
| description | string | no       | none         |
| value       | number | no       | none         |
| author      | string | no       | none         |
| flag        | string | no       | none         |
| category    | string | no       | none         |

### Responses

| code | description           | content                         |
| ---- | --------------------- | ------------------------------- |
| 204  | successfully modified | none                            |
| 403  | action forbidden      | `{message: "action_forbidden"}` |
| 401  | authentication failed | none                            |

## Delete a challenge :lock:

Delete a challenge. Requires admin.

### `DELETE /competitions/{id}/challenges/{id}`

### Responses

| code | description           | content                         |
| ---- | --------------------- | ------------------------------- |
| 204  | successfully deleted  | none                            |
| 403  | action forbidden      | `{message: "action_forbidden"}` |
| 401  | authentication failed | none                            |