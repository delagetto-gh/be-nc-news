const { selectArticle, amendArticle } = require('../models/articles-models');

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectArticle(article_id)
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  if (Object.keys(req.body).some(item => item !== 'inc_votes')) {
    next({
      status: 400,
      msg: 'bad request: patch request must be for inc_votes only'
    });
  } else {
    const { inc_votes } = req.body;
    const { article_id } = req.params;
    amendArticle(article_id, inc_votes)
      .then(([article]) => {
        res.status(201).send({ article });
      })
      .catch(next);
  }
};
