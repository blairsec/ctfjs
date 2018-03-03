#Auth routes
## Create an auth token
Creates and sends an authentication token.
### `POST /auth`
### Request Body
|name|type|required|requirements|
|----|----|--------|------------|
|username|string|yes|none|
|password|string|yes|none|
### Responses
|code|description|content|
|----|-----------|-------|
|200|return token and set token cookie|`{"token": <token>}`
|401|authentication failed|none