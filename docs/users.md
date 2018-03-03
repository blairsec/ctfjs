# User routes

## Create a new user
Creates a new user.
### `POST /users`
### Request Body
|name|type|required|requirements|
|----|----|--------|------------|
|username|string |yes|none|
|password|string|yes|length >= 8|
|email|string|yes|_something_@_something_._something_|
|eligible|boolean|yes|none|
### Responses
|code|description|content|
|----|-----------|-------|
|400 |data validation failed|`{"message": "invalid_values"}`|
|409 |username or email conflict|`{"message": "username_email_conflict"}`|
|201 |successfully created|none|

## Get a list of users
Gets a list of users.
### `GET /users`
### Responses
|code|description|content|
|----|-----------|-------|
|200|a list of users|array of [users](index.md#user)|

## Get a user
Gets a single user.
### `GET /users/{id}`
Note: `id` can be `self` to get the currently authenticated user
### Responses
|code|description|content|
|----|-----------|-------|
|200|successfully found user|a [user](index.md#user)|
|404|user not found|`{"message": "user_not_found"}`|

## Modify a user :lock:
Modifies a user. Requires authentication.
### `PATCH /users/{id}`
Note: `id` can be `self` to modify the currently authenticated user.

The user must be either an admin or the user they are trying to modify.
### Request Body
|name|type|required|requirements|
|----|----|--------|------------|
|username|string |no|none|
|email|string|no|_something_@_something_._something_|
|eligible|boolean|no|none|

### Responses
|code|description|content|
|----|-----------|-------|
|204 |successfully modified|none|
|409 |username or email conflict|`{"message": "username_email_conflict"}`|
|404 |user not found|`{"message": "user_not_found"}`|
|403 |user not permitted to modify|`{"message": "action_forbidden"}`|
|400 |validation failed|`{"message": "invalid_values"}`|
|401 |authentication failed|none|