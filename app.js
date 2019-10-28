const express = require('express');
const app = express();
const apiRouter = require('./routers/api-router');
const {
  handleCustomErrors,
  handlePSQLErrors,
  handleServerErrors,
  badPath
} = require('./error-handlers');
const cors = require('cors');
App.use(cors());

app.use(express.json());

app.use('/api', apiRouter);

app.use('/*', badPath);

app.use(handleCustomErrors, handlePSQLErrors, handleServerErrors);

module.exports = app;
