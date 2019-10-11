# Eamon's NC News

Eamon's NC News is an application open to all that allows users to post articles, comment on articles, upvote articles & comments or simply lurk.

## Getting Started

To download a version on Eamon's NC News and make changes, simply:

1. Fork this repo
2. Click your repo's "Clone or Download" link and copy the URL (which will look something like https://github.com/xxxxx/be-nc-news.git)
3. Navigate to where you'd like the application to be copied in your command line and write:

   ```
   git clone //your URL//
   ```

## Prerequisites

The following dependencies exist for running the application:

#### Express

Express is a minimal and flexible Node.js application framework that provides a robust set of features for web applications. It has a a myriad of HTTP utility methods and middleware, allowing you to make a robust API quickly and easily.

#### KNEX

Knex.js is a "batteries included" SQL query builder for Postgres (and others) designed to be easy to use and provides the ideal conduit between JavaScript & SQL. In this application we take advantage of the Promise-based interface for cleaner async flow control.

#### PostgreSQL

PostgreSQL is a powerful, open source object-relational database system. This application was built using version 2.2.5.

---

In addition, the following Dev Dependencies exist:

#### Chai

Chai is a TDD assertion library for node that can be paired well with Mocha for extensive test.

#### Sam's Chai Sorted

Chai Sorted is an extension of Chai that allows for testing whether arrays of objects have been sorted in a specified order. Sam's version has been used as it handles the sorting of stringified numbers better than the pure version.

#### Mocha

Mocha is a feature-rich JavaScript test framework running on Node.js, which is particualrly good for asynchronous testing. Mocha tests run serially, allowing for flexible and accurate reporting, while mapping uncaught exceptions to the correct test cases.

#### Supertest

Supertest is a library made specifically for testing nodejs http servers and allows us to make client requests to our server, testing the responses with Mocha & Chai.

All of the above can be installed by simply using the following command in your CLI.

```
npm install
```

### Setup

To set up a test and development environment, a file named knexfile.js is required in the project's route folder. This config file tells KNEX which database to use when seeding the database tables and should look like this:

```
const ENV = process.env.NODE_ENV || 'development';

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
};

const customConfig = {
  development: {
    connection: {
      database: 'nc_news'
    }
  },
  test: {
    connection: {
      database: 'nc_news_test'
    }
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };
```

### Database Setup

To set up the databases (one prod, one test), simply run the `npm run setup-dbs` in your CLI.

### Seeding Database

Running the tests using `npm test` (more detailed below) will seed the test database and the seed file will also run migrations, setting up the database's tables / schema.

## Testing

Each built endpoint has been given extensive tests in the file /spec/app.spec.js. A scipt has been added to the package.json so that all tests can be ran by running the following in your CLI:

```
npm test
```

### Endpoint testing

Testing on each endpoint has been written to ensure the following is tested, where relevant to that endpoint:

- Good request
- Bad request (invalid query)
- Bad request (invalid body)
- Bad request (invalid parameter)
- Good request but nothing found in database

## Errors

Errors within the application have been dealt with using the following logic:

- Where the client's request is on an invalid path (i.e. anything other than those specified in endpoints.json), a 404 response is provided.

- Where the client requests a method that's not allowed (e.g. DELETE topic), a 405 response is provided.

- Where the client provides a bad request (body is incorrect or syntax for input is not in line with schema), a 400 response is provided.

* Where a client makes a request for data that does not exist, a 404 is provided. It's worth noting that when a client requests for, for example, articles from a user who exists but has not posted, the server sends a 200 response with a blank array.

* PSQL errors, which are typically due to clients sending bad requests but were unable to be handled by custom errors, are handled within their own error handler and responses are driven by the SQL error codes.

All errors are handled within error-handlers.js.

## Deployment

Eamon's NC News can be deployed live into a production environment by hosting on Heroku.

## Authors

- **Eamon** - [Eamon's GitHub](https://github.com/GustavHolst)
