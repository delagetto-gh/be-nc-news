process.env.NODE_ENV = 'test';
const app = require('../app');
const request = require('supertest');
const chai = require('chai');
const chaiSorted = require('sams-chai-sorted');
const { expect } = require('chai');
chai.use(chaiSorted);
const { connection } = require('../connection');

describe('app', () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());
  describe('/bad-path', () => {
    it('ANYMETHOD 404: "/" returns a 404 error when given a bad path', () => {
      return request(app)
        .get('/bad-path')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).to.be.equal('bad path');
        });
    });
  });
  describe('invalid method', () => {
    it('DELETE 405: returns a 405 error in the event of an invalid method being requested', () => {
      return request(app)
        .delete('/api/topics')
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).to.be.equal('method not allowed');
        });
    });
  });
  describe('/api', () => {
    describe('/topics', () => {
      it('GET 200: "/" returns all topics', () => {
        return request(app)
          .get('/api/topics')
          .expect(200)
          .then(({ body: { topics } }) => {
            expect(topics).to.have.length(3);
            expect(topics[0]).to.have.keys('description', 'slug');
          });
      });
    });
    describe('/users', () => {
      it('GET 200: "/:username" returns a user with that username', () => {
        return request(app)
          .get('/api/users/lurker')
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).to.have.keys('username', 'avatar_url', 'name');
          });
      });
      it('GET 404: "/:username" returns a 404 error where no user is found', () => {
        return request(app)
          .get('/api/users/GustavHolst')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('user GustavHolst not found');
          });
      });
    });
    describe('/articles', () => {
      it('GET 200: "/:article_id" returns the article with matching ID', () => {
        return request(app)
          .get('/api/articles/2')
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.have.keys(
              'author',
              'title',
              'article_id',
              'body',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
          });
      });
      it('GET 404: "/:article_id" returns a 404 error where no article is found', () => {
        return request(app)
          .get('/api/articles/15')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('article not found');
          });
      });
      it('PATCH 201: "/:article_id" returns a 201 with the article object', () => {
        return request(app)
          .patch('/api/articles/2')
          .send({ inc_votes: 5 })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article.votes).to.be.equal(5);
          });
      });
      it('PATCH 400: "/:article_id" returns a 400 error when passed a bad request (one invalid item)', () => {
        return request(app)
          .patch('/api/articles/2')
          .send({ dec_votes: 5 })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              'bad request: patch request must be for inc_votes only'
            );
          });
      });
      it('PATCH 400: "/:article_id" returns a 400 error when passed a bad request (one valid, one invalid)', () => {
        return request(app)
          .patch('/api/articles/2')
          .send({ inc_votes: 5, something: 'somethingelse' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              'bad request: patch request must be for inc_votes only'
            );
          });
      });
      it('GET 200: "/" returns all articles', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).to.be.equal(12);
            expect(articles[0]).to.have.keys(
              'author',
              'title',
              'article_id',
              'body',
              'topic',
              'created_at',
              'votes',
              'comment_count'
            );
          });
      });
      it('GET 200: "/?sort_by=topic" returns all articles sorted by topic in zetabetical order', () => {
        return request(app)
          .get('/api/articles/?sort_by=topic')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('topic', { descending: true });
          });
      });
      it('GET 200: "/?sort_by=topic&order=asc" returns all articles sorted by topic in alphabetical order', () => {
        return request(app)
          .get('/api/articles/?sort_by=topic&order=asc')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('topic', { ascending: true });
          });
      });
      it('GET 200: "/?author=rogersop" returns all articles by rogersop', () => {
        return request(app)
          .get('/api/articles/?author=rogersop')
          .expect(200)
          .then(({ body: { articles } }) => {
            articles.forEach(article => {
              expect(article.author).to.be.equal('rogersop');
            });
          });
      });
      it('GET 200: "/?topic=cats" returns all articles by rogersop', () => {
        return request(app)
          .get('/api/articles/?topic=cats')
          .expect(200)
          .then(({ body: { articles } }) => {
            articles.forEach(article => {
              expect(article.topic).to.be.equal('cats');
            });
          });
      });
    });
    describe.only('/comments', () => {
      it('POST 201: "/" returns a posted article', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({ username: 'butter_bridge', body: 'testing, testing 1,2' })
          .expect(201)
          .then(({ body: { postedComment } }) => {
            expect(postedComment).to.have.keys(
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            );
            expect(postedComment.comment_id).to.be.equal(19);
          });
      });
      it('POST 400: request w/ bad keys returns "bad request..."', () => {
        return request(app)
          .post('/api/articles/2/comments')
          .send({ losername: 'butter_bridge', body: 'testing, testing 1,2' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal(
              'bad request - comment must have username & body'
            );
          });
      });
      it('POST 400: "/bad-article_id" returns "bad request..."', () => {
        return request(app)
          .post('/api/articles/article/comments')
          .send({ username: 'butter_bridge', body: 'testing, testing 1,2' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('bad request - article_id must be a number');
          });
      });
      it('POST 404: request w/ non-existent username returns 404', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({ username: 'GustavHolst', body: 'testing, testing 1,2' })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('username or article not found');
          });
      });
      it('POST 404: request w/ non-existent article_id returns 404', () => {
        return request(app)
          .post('/api/articles/45/comments')
          .send({ username: 'butter_bridge', body: 'testing, testing 1,2' })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('username or article not found');
          });
      });
      it('GET 200: "/" returns all comments for a specified article', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.an('array');
            comments.forEach(comment => {
              expect(comment.article_id).to.be.equal(1);
            });
          });
      });

      /*
GET /api/articles/:article_id/comments
```

#### Responds with

- an array of comments for the given `article_id` of which each comment should have the following properties:
  - `comment_id`
  - `votes`
  - `created_at`
  - `author` which is the `username` from the users table
  - `body`

#### Accepts queries

- `sort_by`, which sorts the comments by any valid column (defaults to created_at)
- `order`, which can be set to `asc` or `desc` for ascending or descending (defaults to descending)
      */
    });
  });
});
