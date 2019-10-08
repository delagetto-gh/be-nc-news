const commentsRouter = require('express').Router();
const { postComment } = require('../controllers/comments-controllers');

commentsRouter.route('/').post(postComment);

module.exports = commentsRouter;
