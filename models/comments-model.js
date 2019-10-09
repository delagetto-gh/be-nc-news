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

exports.selectComments = (article_id, sort_by = 'created_at', order) => {
  if (order !== 'asc') order = 'desc';
  return connection
    .select('*')
    .from('comments')
    .where({ article_id })
    .orderBy(sort_by, order)
    .then(comments => {
      if (!comments.length)
        return Promise.reject({ status: 404, msg: 'no comments found' });
      else {
        return comments;
      }
    });
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
    .returning('*')
    .then(deletedComment => {
      if (!deletedComment.length)
        return Promise.reject({
          status: 404,
          msg: `no comment with comment_id: ${comment_id} to delete found`
        });
      else return;
    });
};
