const { connection } = require('../connection');

exports.selectArticle = article_id => {
  return connection
    .select('articles.*')
    .from('articles')
    .count('comments.article_id as comment_count')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .where({ 'articles.article_id': article_id })
    .then(article => {
      if (!article.length)
        return Promise.reject({ status: 404, msg: 'article not found' });
      else return article;
    });
};

exports.amendArticle = (article_id, inc_votes) => {
  return connection('articles')
    .where('article_id', '=', article_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then(article => {
      if (!article.length)
        return Promise.reject({
          status: 404,
          msg: `article ${article_id} not found`
        });
      else return article;
    });
};

exports.selectArticles = ({
  sort_by = 'created_at',
  order = 'desc',
  author,
  topic
}) => {
  if (order !== 'asc') order = 'desc';
  return connection
    .select('articles.*')
    .from('articles')
    .count('comments.article_id as comment_count')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .orderBy(sort_by, order)
    .modify(chain => {
      if (author) chain.where('articles.author', author);
      if (topic) chain.where('articles.topic', topic);
    })
    .then(articles => {
      if (!articles.length)
        return Promise.reject({
          status: 404,
          msg: 'no articles to return for query'
        });
      else return articles;
    });
};
