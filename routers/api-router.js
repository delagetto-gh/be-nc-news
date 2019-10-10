const apiRouter = require('express').Router();
const topicsRouter = require('./topics-router');
const usersRouter = require('./users-router');
const articlesRouter = require('./articles-router');
const commentsRouter = require('./comments-router');
const apiJSON = require('../endpoints.json');
const { handleInvalidMethods } = require('../error-handlers');

apiRouter
  .route('/')
  .get((req, res, next) => {
    res.json(apiJSON);
  })
  .all(handleInvalidMethods);

apiRouter.use('/topics', topicsRouter);

apiRouter.use('/users', usersRouter);

apiRouter.use('/articles', articlesRouter);

apiRouter.use('/comments', commentsRouter);

module.exports = apiRouter;
