const { connection } = require('../connection');
const { selectUser } = require('../models/users-models');
const { selectTopics } = require('../models/topics-models');

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
  topic,
  limit,
  p
}) => {
  if (order !== 'asc') order = 'desc';
  if (isNaN(parseInt(limit))) limit = 10;
  if (isNaN(parseInt(p))) p = 1;

  let authorExistence;
  if (author !== undefined) authorExistence = selectUser(author);

  let topicExistence;
  if (topic !== undefined) topicExistence = selectTopics(topic);

  const selectedArticles = connection
    .select('articles.*')
    .from('articles')
    .count('comments.article_id as comment_count')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .orderBy(sort_by, order)
    .limit(limit)
    .offset(limit * (p - 1))
    .modify(chain => {
      if (author) chain.where('articles.author', author);
      if (topic) chain.where('articles.topic', topic);
    });

  const allArticles = connection
    .select('articles.*')
    .from('articles')
    .count('comments.article_id as comment_count')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id')
    .orderBy(sort_by, order)
    .modify(query => {
      if (author) query.where('articles.author', author);
      if (topic) query.where('articles.topic', topic);
    });

  return Promise.all([
    selectedArticles,
    allArticles,
    authorExistence,
    topicExistence
  ]);
};
