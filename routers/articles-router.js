const articlesRouter = require('express').Router();
const {
  getArticle,
  patchArticle,
  getArticles
} = require('../controllers/articles-controller');
const { handleInvalidMethods } = require('../error-handlers');

articlesRouter
  .route('/')
  .get(getArticles)
  .all(handleInvalidMethods);

articlesRouter
  .route('/:article_id')
  .get(getArticle)
  .patch(patchArticle);

module.exports = articlesRouter;
