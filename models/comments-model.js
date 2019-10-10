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

exports.selectComments = (
  article_id,
  sort_by = 'created_at',
  order,
  limit,
  p
) => {
  if (isNaN(parseInt(limit))) limit = 10;
  if (isNaN(parseInt(p))) p = 1;
  if (order !== 'asc') order = 'desc';

  const limitedComments = connection
    .select('*')
    .from('comments')
    .where({ article_id })
    .orderBy(sort_by, order)
    .limit(limit)
    .offset(limit * (p - 1));

  const allComments = connection
    .select('*')
    .from('comments')
    .where({ article_id });

  return Promise.all([limitedComments, allComments]);
};

exports.updateComment = (comment_id, inc_votes) => {
  return connection('comments')
    .where({ comment_id })
    .increment({ votes: inc_votes })
    .returning('*')
    .then(comment => {
      if (!comment.length)
        return Promise.reject({
          status: 404,
          msg: `no comment with comment_id: ${comment_id} to patch found`
        });
      return comment;
    });
};

exports.removeComment = comment_id => {
  return connection('comments')
    .where({ comment_id })
    .del()
    .then(deleteCount => {
      if (!deleteCount)
        return Promise.reject({
          status: 404,
          msg: `no comment with comment_id: ${comment_id} to delete found`
        });
      else return;
    });
};
