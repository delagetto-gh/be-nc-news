process.env.NODE_ENV = 'test';
const app = require('../app');
const request = require('supertest');
const { expect } = require('chai');
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
      it('PATCH 201: "/:article_id" returns a 201 with the article object', () => {
        return request(app)
          .patch('/api/articles/2')
          .send({ inc_votes: 5 })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article.votes).to.be.equal(5);
          });
      });
      it('PATCH 400: "/:article_id" returns a 400 error when passed a bad request', () => {
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
      it('PATCH 400: "/:article_id" returns a 400 error when passed a bad request', () => {
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
      it('GET 404: "/:article_id" returns a 404 error where no article is found', () => {
        return request(app)
          .get('/api/articles/15')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('article not found');
          });
      });
    });
  });
});
