const { connection } = require('../connection');

exports.insertComment = (article_id, comment) => {
  const formattedComment = { ...comment, article_id };
  const username = formattedComment.username;
  formattedComment.author = username;
  delete formattedComment.username;
  return connection
    .insert(formattedComment)
    .into('comments')
    .returning('*')
    .then(insertedComment => {
      return insertedComment[0];
    });
};
