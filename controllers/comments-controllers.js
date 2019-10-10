const {
  insertComment,
  selectComments,
  updateComment,
  removeComment
} = require('../models/comments-model');

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
        .then(comment => {
          res.status(201).send({ comment });
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
    const { sort_by } = req.query;
    const { order } = req.query;
    selectComments(article_id, sort_by, order)
      .then(comments => {
        res.status(200).send({ comments });
      })
      .catch(next);
  }
};

exports.patchComment = (req, res, next) => {
  if (JSON.stringify(Object.keys(req.body)) !== '["inc_votes"]') {
    return next({
      status: 400,
      msg: 'bad request: request must be for inc_votes and inc_votes only'
    });
  } else if (isNaN(parseInt(req.body.inc_votes))) {
    return next({
      status: 400,
      msg: `bad request: inc_votes value must be a number`
    });
  } else {
    updateComment(req.params.comment_id, req.body.inc_votes)
      .then(([comment]) => {
        res.status(200).send({ comment });
      })
      .catch(next);
  }
};

exports.deleteComment = (req, res, next) => {
  removeComment(req.params.comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
