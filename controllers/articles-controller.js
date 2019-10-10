const {
  selectArticle,
  amendArticle,
  selectArticles
} = require('../models/articles-models');

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  if (isNaN(parseInt(article_id))) {
    next({ status: 400, msg: 'bad request: article_id must be a number' });
  } else {
    selectArticle(article_id)
      .then(([article]) => {
        res.status(200).send({ article });
      })
      .catch(next);
  }
};

exports.patchArticle = (req, res, next) => {
  if (JSON.stringify(Object.keys(req.body)) !== '["inc_votes"]') {
    next({
      status: 400,
      msg: 'bad request: patch request must be for inc_votes only'
    });
  } else {
    const { inc_votes } = req.body;
    if (isNaN(parseInt(inc_votes))) {
      next({ status: 400, msg: `bad request: "${inc_votes}" is not a number` });
    } else {
      const { article_id } = req.params;
      amendArticle(article_id, inc_votes)
        .then(([article]) => {
          res.status(200).send({ article });
        })
        .catch(next);
    }
  }
};

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then(articles => {
      res.status(200).send({ articles });
    })
    .catch(next);
};
