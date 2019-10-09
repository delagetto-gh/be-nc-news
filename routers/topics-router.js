const topicsRouter = require('express').Router();
const { getTopics } = require('../controllers/topics-controllers');
const { handleInvalidMethods } = require('../error-handlers');

topicsRouter
  .route('/')
  .get(getTopics)
  .all(handleInvalidMethods);

module.exports = topicsRouter;
