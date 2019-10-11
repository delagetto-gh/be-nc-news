const articlesRouter = require('express').Router();
const {
  getArticle,
  patchArticle,
  getArticles,
  postArticle, deleteArticle
} = require('../controllers/articles-controller');
const { handleInvalidMethods } = require('../error-handlers');
const {
  postComment,
  getComments
} = require('../controllers/comments-controllers');

articlesRouter
  .route('/')
  .get(getArticles)
  .post(postArticle)
  .all(handleInvalidMethods);

articlesRouter
  .route('/:article_id')
  .get(getArticle)
  .patch(patchArticle).delete(deleteArticle)
  .all(handleInvalidMethods);

articlesRouter
  .route('/:article_id/comments')
  .post(postComment)
  .get(getComments)
  .all(handleInvalidMethods);

module.exports = articlesRouter;
