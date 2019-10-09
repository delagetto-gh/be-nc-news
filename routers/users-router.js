const usersRouter = require('express').Router();
const { handleInvalidMethods } = require('../error-handlers');

const { getUsers } = require('../controllers/users-controller');

usersRouter
  .route('/:username')
  .get(getUsers)
  .all(handleInvalidMethods);

module.exports = usersRouter;
