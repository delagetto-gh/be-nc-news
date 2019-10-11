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

exports.insertUser = user => {
  return connection
    .insert(user)
    .into('users')
    .returning('*');
};

exports.selectUsers = ({ limit = 5, p = 1 }) => {
  if (isNaN(parseInt(limit)))
    return Promise.reject({
      status: 400,
      msg: 'bad request: limit must be a number'
    });
  if (isNaN(parseInt(p)))
    return Promise.reject({
      status: 400,
      msg: 'bad request: p must be a number'
    });

  const selectedUsers = connection
    .select('*')
    .from('users')
    .limit(limit)
    .offset(limit * (p - 1));

  const allUsers = connection.select('*').from('users');

  return Promise.all([selectedUsers, allUsers]);
};
