const usersRouter = require('express').Router();
const { handleInvalidMethods } = require('../error-handlers');

const {
  getUser,
  postUser,
  getUsers
} = require('../controllers/users-controller');

usersRouter
  .route('/:username')
  .get(getUser)
  .all(handleInvalidMethods);

usersRouter
  .route('/')
  .get(getUsers)
  .post(postUser)
  .all(handleInvalidMethods);

module.exports = usersRouter;
