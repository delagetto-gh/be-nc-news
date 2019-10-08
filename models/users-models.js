const { connection } = require('../connection');

exports.selectUser = username => {
  return connection
    .select('*')
    .from('users')
    .where({ username })
    .then(user => {
      if (!user.length)
        return Promise.reject({
          status: 404,
          msg: `user ${username} not found`
        });
      else return user;
    });
};
