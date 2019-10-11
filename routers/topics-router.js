const topicsRouter = require('express').Router();
const { getTopics, postTopic } = require('../controllers/topics-controllers');
const { handleInvalidMethods } = require('../error-handlers');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopic)
  .all(handleInvalidMethods);

module.exports = topicsRouter;
