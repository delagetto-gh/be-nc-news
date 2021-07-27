process.env.NODE_ENV = 'test';
const app = require('../app');
const request = require('supertest');
const chai = require('chai');
const chaiSorted = require('sams-chai-sorted');
const { expect } = require('chai');
chai.use(chaiSorted);
const { connection } = require('../connection');
const apiJSON = require('../endpoints.json');

describe('app', () => {
  beforeEach(() => connection.seed.run());
  after(() => connection.destroy());
  describe('bad-path', () => {
    it('ANYMETHOD 404: "/" returns a 404 error when given an invalid path', () => {
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
    it('GET 200: "/" responds with a JSON object with all', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.eql(apiJSON);
        });
    });
    describe.only('/topics', () => {
      it('GET 200: "/" returns all topics', () => {
        return request(app)
          .get('/api/topics')
          .expect(200)
          .then(({ body: { topics } }) => {
            expect(topics).to.have.length(3);
            expect(topics[0]).to.have.keys('description', 'slug');
          });
      });
      it('POST 201: "/" returns the posted topic', () => {
        return request(app)
          .post('/api/topics')
          .send({
            slug: 'BalkanBeatBox',
            description:
              "A place to discuss 00's balkan rap group Balkan Beat Box"
          })
          .expect(201)
          .then(({ body: { topic } }) => {
            expect(topic).to.be.eql({
              slug: 'BalkanBeatBox',
              description:
                "A place to discuss 00's balkan rap group Balkan Beat Box"
            });
          });
      });
      it('POST 400: "/" with a missing slug returns a 400', () => {
        return request(app)
          .post('/api/topics')
          .send({
            description:
              "A place to discuss 00's gypsy punk band Balkan Beat Box"
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.eql('Bad request: mandatory information missing');
          });
      });
      it('POST 400: "/" with a duplicate slug returns a 400', () => {
        return request(app)
          .post('/api/topics')
          .send({
            slug: 'paper',
            description: 'A place to discuss paper'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.eql('Primary key already exists');
          });
      });
    });
    describe('/users', () => {
      it('GET 200: "/real_user" returns a user with that username', () => {
        return request(app)
          .get('/api/users/lurker')
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).to.have.keys('username', 'avatar_url', 'name');
          });
      });
      it('GET 404: "/not_a_real_user" returns a 404 error where no user is found', () => {
        return request(app)
          .get('/api/users/GustavHolst')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('user GustavHolst not found');
          });
      });
      it('POST 201: "/" returns the posted user', () => {
        return request(app)
          .post('/api/users')
          .send({
            username: 'GustavHolst',
            name: 'Gustav Holst'
          })
          .expect(201)
          .then(({ body: { user } }) => {
            expect(user).to.be.eql({
              username: 'GustavHolst',
              avatar_url: null,
              name: 'Gustav Holst'
            });
          });
      });
      it('POST 400: "/" request with a missing username returns a 400 error', () => {
        return request(app)
          .post('/api/users')
          .send({
            name: 'Gustav Holst'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              'bad request: mandatory information missing'
            );
          });
      });
      it('POST 400: "/" request with a duplicate username returns a 400 error', () => {
        return request(app)
          .post('/api/users')
          .send({ username: 'lurker', name: 'lurky lurkenstein' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('primary key already exists');
          });
      });
      it('GET 200: "/" returns an array of all users', () => {
        return request(app)
          .get('/api/users')
          .expect(200)
          .then(({ body: { users } }) => {
            expect(users).to.be.an('array');
            expect(users).to.have.length(4);
            expect(users[0]).to.have.keys('username', 'avatar_url', 'name');
          });
      });
      it('GET 200: "?limit=3" limits the number of results to 3', () => {
        return request(app)
          .get('/api/users?limit=3')
          .expect(200)
          .then(({ body: { users } }) => {
            expect(users).to.have.length(3);
          });
      });
      it('GET 200: "?limit=3&p=2" returns the second page of results', () => {
        return request(app)
          .get('/api/users?limit=3&p=2')
          .expect(200)
          .then(({ body: { users } }) => {
            expect(users).to.have.length(1);
          });
      });
      it('GET 200: response includes a total count', () => {
        return request(app)
          .get('/api/users?limit=3')
          .expect(200)
          .then(({ body: { total_count } }) => {
            expect(total_count).to.be.equal(4);
          });
      });
      it('GET 400: bad query responds with a 400 error', () => {
        return request(app)
          .get('/api/users?limit=three')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('bad request: limit must be a number');
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
      it('GET 404: "/:article_id" returns a 400 error article_id is not a number', () => {
        return request(app)
          .get('/api/articles/somethingorother')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('bad request: article_id must be a number');
          });
      });
      it('PATCH 200: "/:article_id" returns a 201 with the article object', () => {
        return request(app)
          .patch('/api/articles/2')
          .send({ inc_votes: 5 })
          .expect(200)
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
      it('PATCH 400: "/:article_id" returns a 400 error the inc_votes value is not a number', () => {
        return request(app)
          .patch('/api/articles/2')
          .send({ inc_votes: 'hi there' })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('bad request: "hi there" is not a number');
          });
      });
      it('PATCH 404: "/:article_id" returns a 404 error where no article with that article_id is found', () => {
        return request(app)
          .patch('/api/articles/30')
          .send({ inc_votes: 1 })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('article 30 not found');
          });
      });
      it('GET 200: "/" returns all articles', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
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
      it('GET 200: "?sort_by=topic" returns all articles sorted by topic in zetabetical order', () => {
        return request(app)
          .get('/api/articles/?sort_by=topic')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('topic', { descending: true });
          });
      });
      it('GET 200: "?sort_by=topic&order=asc" returns all articles sorted by topic in alphabetical order', () => {
        return request(app)
          .get('/api/articles/?sort_by=topic&order=asc')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('topic', { ascending: true });
          });
      });
      it('GET 200: "?author=rogersop" returns all articles by rogersop', () => {
        return request(app)
          .get('/api/articles/?author=rogersop')
          .expect(200)
          .then(({ body: { articles } }) => {
            articles.forEach(article => {
              expect(article.author).to.be.equal('rogersop');
            });
          });
      });
      it('GET 404: "?author=not_a_user" returns a 404 error', () => {
        return request(app)
          .get('/api/articles/?author=GustavHolst')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('user GustavHolst not found');
          });
      });
      it('GET 200: "?author=lurker" returns a blank array', () => {
        return request(app)
          .get('/api/articles/?author=lurker')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.an('array');
            expect(articles.length).to.be.equal(0);
          });
      });
      it('GET 200: "?topic=real_topic" returns all articles for that topic', () => {
        return request(app)
          .get('/api/articles/?topic=cats')
          .expect(200)
          .then(({ body: { articles } }) => {
            articles.forEach(article => {
              expect(article.topic).to.be.equal('cats');
            });
          });
      });
      it('GET 400: "?sort_by=not_a_column" returns "bad request..."', () => {
        return request(app)
          .get('/api/articles/?sort_by=not_a_column')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              'bad request: one or more fields not valid'
            );
          });
      });
      it('GET 200: "?order=random_order" still returns the data and orders in the default (descending)', () => {
        return request(app)
          .get('/api/articles/?order=random_order')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.sortedBy('created_at', { descending: true });
          });
      });
      it('GET 404: "?topic=not_a_topic" returns a 404 error', () => {
        return request(app)
          .get('/api/articles/?topic=80s_balkan_music')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('topic not found');
          });
      });
      it('GET 200: "?topic=paper" returns a blank array', () => {
        return request(app)
          .get('/api/articles/?topic=paper')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.be.eql([]);
          });
      });
      it('GET 200: "?limit=5" limits the number of responses to 5', () => {
        return request(app)
          .get('/api/articles/?limit=5')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.have.length(5);
          });
      });
      it('GET 200: "?sort_by=article_id&order=asc&limit=5&p=2" shows the second page of responses (6-10)', () => {
        return request(app)
          .get('/api/articles/?sort_by=article_id&order=asc&limit=5&p=2')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.have.length(5);
            expect(articles[0].article_id).to.be.equal(6);
            expect(articles).to.be.sortedBy('article_id', { ascending: true });
          });
      });
      it('GET 200: "/" limits the number of responses to 10 by default', () => {
        return request(app)
          .get('/api/articles/')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.have.length(10);
          });
      });
      it('GET 200: bad limit in request ignores the bad limit and defaults to 10', () => {
        return request(app)
          .get('/api/articles/?limit=five')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).to.have.length(10);
          });
      });
      it('GET 200: bad page in request ignores the bad page and defaults to 1', () => {
        return request(app)
          .get('/api/articles/?sort_by=article_id&order=asc&p=page1')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].article_id).to.be.equal(1);
            expect(articles).to.be.sortedBy('article_id', { ascending: true });
          });
      });
      it('GET 200: "/" includes a total_count of all articles, regardless of limit', () => {
        return request(app)
          .get('/api/articles/')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).to.be.equal(10);
            expect(body.total_count).to.be.equal(12);
          });
      });
      it('POST 201: "/" returns the posted article', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'Why I chose to break my silence',
            body: "I've had enough! ...",
            author: 'lurker',
            topic: 'paper'
          })
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article.article_id).to.be.equal(13);
            expect(article).to.contain.keys('title', 'body');
          });
      });
      it('POST 400: post with missing non-nullable fields returns a 400 response', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'Why I chose to break my silence',
            body: "I've had enough! ...",
            topic: 'paper'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              'bad request: mandatory information missing'
            );
          });
      });
      it('POST 400: post with erroneous fields returns a 400 response', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'Why I chose to break my silence',
            body: "I've had enough! ...",
            author: 'lurker',
            topic: 'paper',
            something: 'something else'
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              'bad request: one or more fields not valid'
            );
          });
      });
      it('POST 400: post with erroneous fields returns a 400 response', () => {
        return request(app)
          .post('/api/articles')
          .send({
            title: 'Why I chose to break my silence',
            body: "I've had enough! ...",
            author: 'turk turkleton',
            topic: 'paper'
          })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('username, topic or article not found');
          });
      });
      it('DELETE 204: "/:article_id" returns a 204 with no body', () => {
        return request(app)
          .delete('/api/articles/1')
          .expect(204);
      });
      it('DELETE 204: "/:article_id" deletes all article\'s comments (where there are any)', () => {
        return request(app)
          .delete('/api/articles/1')
          .expect(204)
          .then(() => {
            return request(app)
              .get('/api/articles/1/comments')
              .expect(404)
              .then(({ body: { msg } }) => {
                expect(msg).to.be.equal('article not found');
              });
          });
      });
      it('DELETE 404: "/not_an_article_id" returns a 404', () => {
        return request(app)
          .delete('/api/articles/20')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal('article not found');
          });
      });
    });
    describe('/comments', () => {
      it('POST 201: "/" returns a posted comment', () => {
        return request(app)
          .post('/api/articles/1/comments')
          .send({
            username: 'butter_bridge',
            body: 'testing, testing 1,2',
            article_id: 1
          })
          .expect(201)
          .then(({ body: { comment } }) => {
            expect(comment).to.have.keys(
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            );
            expect(comment.comment_id).to.be.equal(19);
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
            expect(msg).to.equal('username, topic or article not found');
          });
      });
      it('POST 404: request w/ non-existent article_id returns 404', () => {
        return request(app)
          .post('/api/articles/45/comments')
          .send({ username: 'butter_bridge', body: 'testing, testing 1,2' })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('username, topic or article not found');
          });
      });
      it('GET 200: "/" returns all comments for a specified article', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.an('array');
            expect(comments[0]).to.have.keys(
              'article_id',
              'comment_id',
              'votes',
              'created_at',
              'author',
              'body'
            );
            comments.forEach(comment => {
              expect(comment.article_id).to.be.equal(1);
            });
          });
      });
      it('GET 404: request w/ non-existent article_id returns 404', () => {
        return request(app)
          .get('/api/articles/45/comments')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('article not found');
          });
      });
      it('GET 200: request for comments for an uncommented article returns a blank array', () => {
        return request(app)
          .get('/api/articles/3/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.an('array');
            expect(comments.length).to.be.equal(0);
          });
      });
      it('GET 200: "/" comments are sorted by created_at in descending order by default', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('created_at', { descending: true });
          });
      });
      it('GET 200: "?sort_by=votes" comments are sorted by votes in descending order', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=votes')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('votes', { descending: true });
          });
      });
      it('GET 200: "?order=asc" comments are sorted by created_at in ascending order', () => {
        return request(app)
          .get('/api/articles/1/comments?order=asc')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('created_at', { ascending: true });
          });
      });
      it('GET 200: "?order=BAD" comments are still sorted by created_at in descending order', () => {
        return request(app)
          .get('/api/articles/1/comments?order=BAD')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('created_at', { descending: true });
          });
      });
      it('GET 400: "?sort_by=not_a_column" returns "bad request..."', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=not_a_ting')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              'bad request: one or more fields not valid'
            );
          });
      });
      it('GET 200: "?order=random_order" still returns the data and orders in the default (descending)', () => {
        return request(app)
          .get("/api/articles/1/comments?order=i_dunno_just_mix_'em_up")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.be.sortedBy('created_at', { descending: true });
          });
      });
      it('GET 200: "?limit=5" limits the number of responses to 5', () => {
        return request(app)
          .get('/api/articles/1/comments?limit=5')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.length(5);
          });
      });
      it('GET 200: "?sort_by=article_id&order=asc&limit=5&p=2" shows the second page of responses (6-10)', () => {
        return request(app)
          .get(
            '/api/articles/1/comments?sort_by=comment_id&order=asc&limit=5&p=2'
          )
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.length(5);
            expect(comments[0].comment_id).to.be.equal(7);
            expect(comments).to.be.sortedBy('comment_id', { ascending: true });
          });
      });
      it('GET 200: "/" limits the number of responses to 10 by default', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.length(10);
          });
      });
      it('GET 200: bad limit in request ignores the bad limit and defaults to 10', () => {
        return request(app)
          .get('/api/articles/1/comments?limit=five')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).to.have.length(10);
          });
      });
      it('GET 200: bad page in request ignores the bad page and defaults to 1', () => {
        return request(app)
          .get('/api/articles/1/comments?sort_by=comment_id&order=asc&p=page1')
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments[0].article_id).to.be.equal(1);
            expect(comments).to.be.sortedBy('article_id', { ascending: true });
          });
      });
      it('GET 200: "/" includes a total_count of all comments, regardless of limit', () => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments.length).to.be.equal(10);
            expect(body.total_count).to.be.equal(13);
          });
      });
      it('PATCH 201: "/:comment_id" returns a 201 with the comment object', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: -5 })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).to.have.keys(
              'comment_id',
              'author',
              'article_id',
              'votes',
              'created_at',
              'body'
            );
            expect(comment.votes).to.be.equal(11);
          });
      });
      it('PATCH 404: request w/ non - existent comment_id returns a 404', () => {
        return request(app)
          .patch('/api/comments/30')
          .send({ inc_votes: -5 })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              `no comment with comment_id: 30 to patch found`
            );
          });
      });
      it('PATCH 400: request w/ bad key(s) returns a 400', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_boats: 5 })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              `bad request: request must be for inc_votes and inc_votes only`
            );
          });
      });
      it('PATCH 400: request w/ bad value returns a 400', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({ inc_votes: "I'M TRYING CHRISTOPHER!" })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              `bad request: inc_votes value must be a number`
            );
          });
      });
      it('PATCH 400: request w/ bad comment_id returns a 400', () => {
        return request(app)
          .patch('/api/comments/not-an-id')
          .send({ inc_votes: 5 })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(`syntax error for requested value`);
          });
      });
      it('DELETE 204: "/" responds with a 204 error (no body) for successful deletion', () => {
        return request(app)
          .delete('/api/comments/1')
          .expect(204);
      });
      it('DELETE 404: request w/ non - existent comment_id returns a 404', () => {
        return request(app)
          .delete('/api/comments/30')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(
              `no comment with comment_id: 30 to delete found`
            );
          });
      });
      it('DELETE 400: request w/ bad comment_id returns a 400', () => {
        return request(app)
          .delete('/api/comments/not-a-number')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.be.equal(`syntax error for requested value`);
          });
      });
    });
  });
});
