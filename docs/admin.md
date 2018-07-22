# Admin routes

## Create an admin user :lock:

Creates an admin user. Can only be done by an admin or if no admins have been created yet.

### `POST /admin`

### Request Body

| name     | type   | required | requirements                        |
| -------- | ------ | -------- | ----------------------------------- |
| username | string | yes      | none                                |
| password | string | yes      | length >= 8                         |
| email    | string | yes      | _something_@_something_._something_ |

### Responses

| code | description                | content                                |
| ---- | -------------------------- | -------------------------------------- |
| 201  | successfully created admin | none                                   |
| 409  | username or email conflict | `{message: "username_email_conflict"}` |
| 403  | action forbidden           | {message: "action_forbidden"}          |

## Get a list of admins

Gets a list of all admins.

### `GET /admin`

### Responses

| code | description         | content                             |
| ---- | ------------------- | ----------------------------------- |
| 200  | list of admin users | list of [users](index.md#User List) |

## Give authentication token

Creates and sends authentication token to user if they are an admin.

### `POST /admin/auth`

### Request Body

| name     | type   | required | requirements |
| -------- | ------ | -------- | ------------ |
| username | string | yes      | none         |
| password | string | yes      | none         |

### Responses

| code | description                                 | content              |
| ---- | ------------------------------------------- | -------------------- |
| 200  | return token and set token cookie           | `{"token": <token>}` |
| 401  | invalid credentials or user is not an admin | none                 |

