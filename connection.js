const knex = require('knex');
const dbConfig = require('./knexfile');
exports.connection = knex(dbConfig);