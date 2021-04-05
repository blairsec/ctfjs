# Competition routes

## Get a list of competitions

Gets a list of competitions.

### `GET /competitions`

### Responses

| code | description          | content                                       |
| ---- | -------------------- | --------------------------------------------- |
| 200  | list of competitions | [competition list](index.md#competition-list) |

## Get a competition

Gets a competition by id.

### `GET /competitions/{id}`

### Responses

| code | description                   | content                                |
| ---- | ----------------------------- | -------------------------------------- |
| 200  | competition with specified id | [competition](index.md#competition)    |
| 404  | competition not found         | `{"message": "competition_not_found"}` |

## Create a competition :lock:

Creates a competition. Requires admin.

### `POST /competitions`

### Request Body

| name     | type     | required | requirements |
| -------- | -------- | -------- | ------------ |
| start    | ISO 8601 | yes      | none         |
| end      | ISO 8601 | yes      | none         |
| about    | string   | yes      | none         |
| name     | string   | yes      | none         |
| teamSize | number   | no       | none         |

### Responses

| code | description           | content                           |
| ---- | --------------------- | --------------------------------- |
| 201  | successfully created  | none                              |
| 403  | action forbidden      | `{"message": "action_forbidden"}` |
| 401  | authentication failed | none                              |
| 400  | invalid values        | `{"message": "invalid_values"}`   |

## Modify a competition :lock:

Modifies a competition. Requires admin.

### `PATCH /competitions/{id}`

### Request Body

| name     | type     | required | requirements |
| -------- | -------- | -------- | ------------ |
| start    | ISO 8601 | no       | none         |
| end      | ISO 8601 | no       | none         |
| about    | string   | no       | none         |
| name     | string   | no       | none         |
| teamSize | number   | no       | none         |

### Responses

| code | description           | content                           |
| ---- | --------------------- | --------------------------------- |
| 204  | successfully modified | none                              |
| 403  | action forbidden      | `{"message": "action_forbidden"}` |
| 401  | authentication failed | none                              |
| 400  | invalid values        | `{"message": "invalid_values"}`   |

## Delete a competition :lock:

Delete a competitions. Requires admin.

### `DELETE /competitions/{id}`

### Responses

| code | description           | content                           |
| ---- | --------------------- | --------------------------------- |
| 204  | successfully deleted  | none                              |
| 403  | action forbidden      | `{"message": "action_forbidden"}` |
| 401  | authentication failed | none                              |
