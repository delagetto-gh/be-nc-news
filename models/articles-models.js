const { connection } = require('../connection');

exports.selectArticle = article_id => {
  return connection
    .select('*')
    .from('articles')
    .where({ article_id })
    .then(article => {
      if (!article.length)
        return Promise.reject({ status: 404, msg: 'article not found' });
      else return article;
    });
};

/*

- an article object, which should have the following properties:

  - `comment_count` which is the total count of all the comments with this article_id - you should make use of knex queries in order to achieve this

*/
