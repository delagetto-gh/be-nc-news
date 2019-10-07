# Migrations and Seeding

## Prior Knowledge

- understanding of `knex` / `express` project set up

## Learning Objectives

- the potential problems that could emerge when maintaining a large database over a long period of time
- Know that the state of the database is altered after a POST / PATCH / PUT / DELETE requests and so there is a need for re-seeding before every test
- Use knex CLI to create migration and seed scripts
- Understand how to implement `up` and `down` function in each migration file
- Know how to use knex Schema Builder methods to design the structure of your db tables using knex methods
- Learn how to set up appropriate scripts in the `package.json` for the execution of key `knex` commands:
  e.g. `knex migrate:latest`

## Migrations

Suppose we are working on a big project. We may have to implement some changes to the database in order to facilitate changes to the the back-end code. This may involve updating a table by adding a column for example. Then suppose further that there are several people involved with the maintenance of the database - very quickly problems begin to emerge!

- It is difficult to know what state each database is currently in
- It is hard to figure which changes have been applied to the database schemas
- Once there are multiple databases (`test` / `development` / `production`), it becomes tricky to keep them all up to date at once.
- With lots of developers, there is no easy way to find out who has applied the latest changes.

Database migrations allow us to address this problem:
We can manage our database with incremental changes and store these updates or new tables in a migration file. Think of this being as like **version control for databases**. Any time we want to create a new table or perhaps update a table with a new column, for example, then we can create a migration in order to perform a change to the state of our database.

As well as being able to make incremental changes to a production database we can also use migrations when testing. Database migrations allow us to easily rollback our database, destroying all the tables and then building them back up again. In a testing environment, it is highly desirable to be able to tear down our tables and then re-build the schemas before every test.

## Setting up a project

- We can create a `knexfile.js` file at the top level of our repo. The `knexfile.js` contains our database configuration - including the configuration for our migration directory.
- In the `knexfile.js` we need to specify which client adapter we need to use (as knex itself is client agnostic).
- The connection object tells knex which database we are connecting to.

```js
const dbConfig = {
  client: 'pg',
  connection: { database: 'harry_potter' },
};

module.exports = dbConfig;
```

^ This setup would be ok for one database but we will need several dbs for different environments (test, development and production).

We also need to point `knex` in the direction of our `seed` and `migration` files, so we could end up with something like this:

```js
const ENV = process.env.NODE_ENV || 'development';

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './db/migrations',
  },
  seeds: {
    directory: './db/seeds',
  },
};

const customConfigs = {
  development: { connection: { database: 'db_name' } },
  test: { connection: { database: 'db_name_test' } },
};

module.exports = { ...baseConfig, ...customConfigs[ENV] };
```

- Note how **critically** we check the current `NODE_ENV` in order to export either the development or the test object. This ensures that is say process.env.NODE_ENV is "test" then we will be pointing to our test database 'harry_potter_test'

- Any migration files we create will be written into `./db/migrations` directory inside our project.

### Creating the database(s)

Unfortunately, `knex` doesn't have the capability of creating / dropping the whole database so we have to do this in `sql`.
We have a file `./db/setup.sql` that will create the local databases for us:

```sql
DROP DATABASE IF EXISTS db_name;
CREATE DATABASE db_name;

DROP DATABASE IF EXISTS db_name_test;
CREATE DATABASE db_name_test;
```

We could just run this file with the `psql -f db/setup.sql` command.
However, any other developers working on the same project will have to go through the same process, so lets make a script to do that:

```json
{
  "scripts": {
    "setup-dbs": "psql -f db/setup.sql"
  }
}
```

### Creating migration files

We can add the following to our `package.json`:

```json
{
  "scripts": {
    "migrate-make": "knex migrate:make"
  }
}
```

We can then run the following command:

```bash
npm run migrate-make create_table_name_table
```

The file-structure should then look something like this:

```raw
project
├── knexfile.js
├── db/
    ├── migrations/
        ├── 20181108103136_create_table_name_table.js
```

The new migration file is created and added to the migrations folder with a timestamp prepended to the filename. We'll see why we need this later on!

### Migration file structure

By default, our migration file template should look like this:

```js
exports.up = function(knex) {};

exports.down = function(knex) {};
```

The `up` function should contain all the commands we need in order to update the database - this could be creating or updating a table.

The purpose of the `down` function is to do the opposite of the `up` function. For example, if `up` creates a particular table then `down` must use commands to drop the same table. The `down` function allows us to quickly undo a migration if need be.

### Implementing the up function

Suppose want to create a new table for the actors data: then we can refer to the [Schema Builder](https://knexjs.org/#Schema-Building) section of the knex documentation. In order to create a new table we can write in our `up` function.

```js
exports.up = function(knex) {
  console.log('creating houses table...');
  return knex.schema.createTable('houses', (housesTable) => {
    housesTable.increments('house_id').primary();
    housesTable.string('house_name').notNullable();
    housesTable.string('founder').notNullable();
    housesTable.string('animal');
  });
};
```

**NOTE**: It is essential that the `up` function returns a promise so the `return` statement in this function is important!

We can think of the above code as being equivalent to writing the following in an `psql` file.

```sql
CREATE TABLE houses (
  house_id SERIAL PRIMARY KEY,
  house_name VARCHAR NOT NULL,
  founder VARCHAR NOT NULL,
  animal VARCHAR NOT NULL
);
```

In order to create a relationship between two tables, we must use `.references()` to set the column that the current column references as a foreign key. E.g.

```js
exports.up = function(knex) {
  console.log('creating wizards table...');
  return knex.schema.createTable('wizards', (wizardsTable) => {
    // ...
    wizardsTable.integer('house_id').references('houses.house_id');
    // ...
  });
};
```

### Implementing the down function

The `down` function **must** contain the commands to undo the creation of this table. So we can write:

```js
exports.down = function(knex) {
  console.log('removing houses tables...');
  return knex.schema.dropTable('houses');
};
```

This function must also return a `Promise` and simply drop the table that we created in the `up` function.

### Running latest migrations

Finally, once we have created our migration file then we can add the following script to our `package.json`:

```json
{
  "scripts": {
    "migrate-latest": "knex migrate:latest"
  }
}
```

We can then run the command:

```bash
npm run migrate-latest
```

This command will run the `up` function we have just created and, therefore, create the new table.

If we want to add more tables to the database then we can just make more migration files with similar commands to add table and drop tables.

### Rolling back the database

If we add the following to our `package.json`:

```json
{
  "scripts": {
    "migrate-rollback": "knex migrate:rollback"
  }
}
```

We can run the following command:

```bash
npm run migrate-rollback
```

This will run the `down` functions in your migration files in order to undo the latest migration. Ensure that you have rolled back to the base migration.

## Seeding

- We can create a seed function that inserts data into our database. This should be created in the file referenced by the `knexfile.js`' seed directory.
- To begin, we want to make sure the database has no old data in it. (migrate-rollback)
- Next, we want to make sure the database schema is all up to date. (migrate-latest)
- Then, we are free to start inserting data. Think carefully about which data you try to add to the database first.

```js
// db/seeds/index.js
const { houseData, wizardData } = require('../data');

exports.seed = function(knex) {
  return knex.migrate
    .rollback()
    .then(() => knex.migrate.latest())
    .then(() => {
      return knex('houses')
        .insert(houseData)
        .returning('*');
    })
    .then((houseRows) => {
      // <-- do the rest of the seed logic here ...
    });
};
```

The structure of the data directory should mean that we can export only the data that matches our current `NODE_ENV`, so we can require in `'../data'` and the seed function will work for both the `test` and `development` environments.

We use `knex('houses').insert(houseData)` to insert the `houseData` into the database. `houseData` here is an array of objects, with each object representing a single row or entry in the `house` table.

The `returning("*")` method that is chained at the end of the insertion means that, should we want to, we can access the rows that have just been added to the database. We can add `.then()` and pass a callback to it in order to work with the newly inserted rows.

```js
const { houseData, wizardData } = require('../data');
const { createRef, formatWizards } = require('../utils');

exports.seed = function(knex) {
  return knex.migrate
    .rollback()
    .then(() => knex.migrate.latest())
    .then(() => {
      return knex('houses')
        .insert(houseData)
        .returning('*');
    })
    .then((houseRows) => {
      const houseRef = createRef(houseRows, 'house_name', 'house_id');
      const formattedWizards = formatWizards(wizardData, houseRef);
      return knex('wizards')
        .insert(formattedWizards)
        .returning('*');
    });
};
```

To run the seed function, again we can add an npm script to the `package.json`:

```json
{
  "scripts": {
    "seed": "knex seed:run"
  }
}
```

### Seeding Utils

We can use a function like `createRef` in order to generate a reference object that will help us to replace the old object fields with their corresponding primary keys. If we pass the `houseRows` to our `createRef` function then we expect to get a reference object like this:

```js
{
  'Gryffindor': 1,
  'Slytherin': 2,
  'Ravenclaw': 3,
  'Hufflepuff': 4,
}
```

Once we have this object then we can iterate over the `wizardData` in order to take the `house` property and replace it with a `house_id`

In `formatWizards`, we can ensure that we return a new array by using `map`.
We also spread the properties of `restOfWizard` into a new object in order to create a new object.
This pattern means that we can completely avoid mutating the input data.

🤔 seems like these util functions are pretty pure. Given a particular input, they will consistently give the same output without mutating the input or relying on anything external. Looks like a great opportunity for some lovely unit testing!