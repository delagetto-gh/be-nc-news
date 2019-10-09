const commentsRouter = require('express').Router();
const { handleInvalidMethods } = require('../error-handlers');
const {
  patchComment,
  deleteComment
} = require('../controllers/comments-controllers');

commentsRouter
  .route('/:comment_id')
  .patch(patchComment)
  .delete(deleteComment).all(handleInvalidMethods);;

module.exports = commentsRouter;
