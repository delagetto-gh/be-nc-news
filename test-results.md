## Test Output

Read through all errors. Note that any failing test could be caused by a problem uncovered in a previous test on the same endpoint.

### GET `/api/articles?author=lurker`

Assertion: expected 404 to deeply equal 200

Hints:
- give a 200 status and an empty array when articles for a topic that does exist, but has no articles is requested
- use a separate model to check whether the user exists


### GET `/api/articles?topic=paper`

Assertion: expected 404 to deeply equal 200

Hints:
- give a 200 status and an empty array when articles for a topic that does exist, but has no articles is requested
- use a separate model to check whether the topic exists


### PATCH `/api/articles/1`

Assertion: expected 201 to equal 200

Hints:
- use a 200: OK status code for successful `patch` requests


### PATCH `/api/articles/1`

Assertion: expected 400 to equal 200

Hints:
- ignore a `patch` request with no information in the request body, and send the unchanged article to the client
- provide a default argument of `0` to the `increment` method, otherwise it will automatically increment by 1


### GET `/api/articles/2/comments`

Assertion: expected 404 to equal 200

Hints:
- return 200: OK when the article exists
- serve an empty array when the article exists but has no comments


### POST `/api/articles/1/comments`

Assertion: expected { Object (postedComment) } to contain key 'comment'

Hints:
- send the new comment back to the client in an object, with a key of comment: `{ comment: {} }`
- ensure all columns in the comments table match the README


### POST `/api/articles/1/comments`

Assertion: Cannot read property 'votes' of undefined

Hints:
- default `votes` to `0` in the migrations
- default `created_at` to the current time in the migrations


### PATCH `/api/comments/1`

Assertion: expected 201 to equal 200

Hints:
- use a 200: OK status code for successful `patch` requests


### PATCH `/api/comments/1`

Assertion: expected { Object (patchedComment) } to contain key 'comment'

Hints:
- send the updated comment back to the client in an object, with a key of comment: `{ comment: {} }`


### PATCH `/api/comments/1`

Assertion: Cannot read property 'votes' of undefined

Hints:
- increment / decrement the `votes` of the specified article with the knex method **`increment`**


### PATCH `/api/comments/1`

Assertion: expected 400 to equal 200

Hints:
- use 200: OK status code when sent a body with no `inc_votes` property
- send an unchanged comment when no `inc_votes` is provided in the request body


error: invalid input syntax for integer: "not-a-valid-id"
    at Connection.parseE (/Users/suneet/Documents/block-reviews/team-be-review-runner/evaluations/eamon-sharifi/node_modules/pg/lib/connection.js:604:11)
    at Connection.parseMessage (/Users/suneet/Documents/block-reviews/team-be-review-runner/evaluations/eamon-sharifi/node_modules/pg/lib/connection.js:401:19)
    at Socket.<anonymous> (/Users/suneet/Documents/block-reviews/team-be-review-runner/evaluations/eamon-sharifi/node_modules/pg/lib/connection.js:121:22)
    at Socket.emit (events.js:209:13)
    at addChunk (_stream_readable.js:305:12)
    at readableAddChunk (_stream_readable.js:286:11)
    at Socket.Readable.push (_stream_readable.js:220:10)
    at TCP.onStreamRead (internal/stream_base_commons.js:182:23) {
  name: 'error',
  length: 103,
  severity: 'ERROR',
  code: '22P02',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'numutils.c',
  line: '62',
  routine: 'pg_atoi'
}
### PATCH `/api/comments/not-a-valid-id`

Assertion: **ERROR WITH NO CATCH: CHECK YOUR CONTROLLERS!**



error: invalid input syntax for integer: "not-a-number"
    at Connection.parseE (/Users/suneet/Documents/block-reviews/team-be-review-runner/evaluations/eamon-sharifi/node_modules/pg/lib/connection.js:604:11)
    at Connection.parseMessage (/Users/suneet/Documents/block-reviews/team-be-review-runner/evaluations/eamon-sharifi/node_modules/pg/lib/connection.js:401:19)
    at Socket.<anonymous> (/Users/suneet/Documents/block-reviews/team-be-review-runner/evaluations/eamon-sharifi/node_modules/pg/lib/connection.js:121:22)
    at Socket.emit (events.js:209:13)
    at addChunk (_stream_readable.js:305:12)
    at readableAddChunk (_stream_readable.js:286:11)
    at Socket.Readable.push (_stream_readable.js:220:10)
    at TCP.onStreamRead (internal/stream_base_commons.js:182:23) {
  name: 'error',
  length: 101,
  severity: 'ERROR',
  code: '22P02',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'numutils.c',
  line: '62',
  routine: 'pg_atoi'
}
### DELETE `/api/comments/not-a-number`

Assertion: **ERROR WITH NO CATCH: CHECK YOUR CONTROLLERS!**



### DELETE `/api`

Assertion: expected 404 to equal 405

Hints:
- use `.all()` on each route, to serve a 405: Method Not Found status code


