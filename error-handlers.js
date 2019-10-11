exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handlePSQLErrors = (err, req, res, next) => {
  if (err.code === '23503') {
    res.status(404).send({ msg: 'username or article not found' });
  } else if (err.code === '42703') {
    res.status(400).send({ msg: 'bad request: query column is not valid' });
  } else if (err.code === '22P02') {
    res.status(400).send({ msg: 'syntax error for requested value' });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err);
};

exports.handleInvalidMethods = (req, res, next) => {
  res.status(405).send({ msg: 'method not allowed' });
};

exports.badPath = (req, res, next) => {
  res.status(404).send({ msg: 'bad path' });
};
