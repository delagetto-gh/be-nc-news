const {
  selectUser,
  insertUser,
  selectUsers
} = require('../models/users-models');

exports.getUser = (req, res, next) => {
  const { username } = req.params;
  selectUser(username)
    .then(([user]) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.postUser = (req, res, next) => {
  insertUser(req.body)
    .then(([user]) => {
      res.status(201).send({ user });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  selectUsers(req.query)
    .then(([selectedUsers, allUsers]) => {
      res
        .status(200)
        .send({ users: selectedUsers, total_count: allUsers.length });
    })
    .catch(next);
};
