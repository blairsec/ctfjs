# Home routes

## Get home text

Get the title and text for the home page.

### `GET /home`

### Responses

| code | description                     | content                                    |
| ---- | ------------------------------- | ------------------------------------------ |
| 200  | title and content for home page | `{"title": <string>, "content": <string>}` |

## Modify home text :lock:

Modify the text and title of the home page. Requires admin.

### `PUT /home`

### Request Body

| name    | type   | required | requirements |
| ------- | ------ | -------- | ------------ |
| title   | string | yes      | none         |
| content | string | yes      | none         |

### Responses

| code | description           | content                           |
| ---- | --------------------- | --------------------------------- |
| 204  | successfully modified | none                              |
| 400  | invalid values        | `{"message": "invalid_values"}`   |
| 403  | action forbidden      | `{"message": "action_forbidden"}` |
| 401  | authentication failed | none                              |

