# Self

## Get information about currently logged in user :lock:

If authenticated, get information about the current user, team, and competition.

### `GET /self`

### Responses

| code | description                                                                                 | content                                                        |
| ---- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 200  | current [user](index.md#user) (with team and email) and [competition](index.md#competition) | `{"user": <user object>, "competition": <competition object>}` |
| 401  | not authenticated                                                                           | none                                                           |
