exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handlePSQLErrors = (err, req, res, next) => {
  console.log(err);
  if (err.code === '23503') {
    res.status(404).send({ msg: 'Username, topic or article not found' });
  } else if (err.code === '42703') {
    res.status(400).send({ msg: 'Bad request: one or more fields not valid' });
  } else if (err.code === '23502') {
    res.status(400).send({ msg: 'Bad request: mandatory information missing' });
  } else if (err.code === '22P02') {
    res.status(400).send({ msg: 'Syntax error for requested value' });
  } else if (err.code === '23505') {
    res.status(400).send({ msg: 'Primary key already exists' });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: 'Server error - try again later' });
};

exports.handleInvalidMethods = (req, res, next) => {
  res.status(405).send({ msg: 'Naughty - This method is not allowed' });
};

exports.badPath = (req, res, next) => {
  res.status(404).send({ msg: 'Bad path - soz' });
};
