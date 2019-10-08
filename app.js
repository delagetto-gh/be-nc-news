const express = require('express');
const app = express();
const apiRouter = require('./routers/api-router');
const {
  handleCustomErrors,
  handleRejectionErrors
} = require('./error-handlers');

app.use(express.json());

app.use('/api', apiRouter);

app.use('/*', (req, res, next) => {
  res.status(404).send({ msg: 'bad path' });
});

app.use(handleCustomErrors, handleRejectionErrors);

module.exports = app;
