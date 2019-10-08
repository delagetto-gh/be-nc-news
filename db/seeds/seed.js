const {
  topicData,
  articleData,
  commentData,
  userData
} = require('../data/index.js');

const { formatDates, formatComments, makeRefObj } = require('../utils/utils');

exports.seed = function(knex) {
  return knex.migrate
    .rollback()
    .then(() => knex.migrate.latest())
    .then(() => {
      const topicsInsertions = knex('topics')
        .insert(topicData)
        .returning('*');
      const usersInsertions = knex('users')
        .insert(userData)
        .returning('*');
      return Promise.all([topicsInsertions, usersInsertions]);
    })
    .then(() => {
      return knex('articles')
        .insert(formatDates(articleData))
        .returning('*');
    })
    .then(articleTable => {
      const articleRefObj = makeRefObj(articleTable, 'title', 'article_id');
      let formattedComments = formatComments(commentData, articleRefObj);
      formattedComments = formatDates(formattedComments);
      return knex('comments')
        .insert(formattedComments)
        .returning('*');
    });
};
