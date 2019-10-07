exports.up = function(knex) {
  console.log('creating topics table...');
  return knex.schema.createTable('topics', topicsTable => {
    topicsTable
      .string('slug')
      .primary()
      .unique();
    topicsTable.string('description');
  });
};

exports.down = function(knex) {
  console.log('destroying topics table...');
  return knex.schema.dropTable('topics');
};
