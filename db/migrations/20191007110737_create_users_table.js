exports.up = function(knex) {
  console.log('creating users table...');
  return knex.schema.createTable('users', userTable => {
    userTable
      .string('username')
      .primary()
      .unique();
    userTable.string('avatar_url');
    userTable.string('name');
  });
};

exports.down = function(knex) {
  console.log('destroying users table...');
  return knex.schema.dropTable('users');
};
