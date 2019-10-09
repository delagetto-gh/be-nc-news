const { insertComment, selectComments } = require('../models/comments-model');

exports.postComment = (req, res, next) => {
  if (!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('body'))
    return next({
      status: 400,
      msg: 'bad request - comment must have username & body'
    });
  else {
    const { article_id } = req.params;
    if (isNaN(parseInt(article_id))) {
      return next({
        status: 400,
        msg: 'bad request - article_id must be a number'
      });
    } else {
      insertComment(article_id, req.body)
        .then(postedComment => {
          res.status(201).send({ postedComment });
        })
        .catch(next);
    }
  }
};

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  if (isNaN(parseInt(article_id))) {
    return next({
      status: 400,
      msg: 'bad request - article_id must be a number'
    });
  } else {
    selectComments(article_id, req.queries)
      .then(comments => {
        res.status(200).send({ comments });
      })
      .catch(next);
  }
};
