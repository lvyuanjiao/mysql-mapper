'use strict';

var path = require('path');
var should = require('should');
var mapper = require('sql-mapper');

var opts = {
  adaptor: path.join(__dirname, '../index'),
  driver: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog'
  },
  pool: {}
};

var post = {
  title: 'Lorem ipsum dolor sit amet',
  content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  created: new Date(),
  author: 'lvyuanjiao'
};

describe('MySQL Mapper', function() {
  before(function(done) {
    mapper.create(path.join(__dirname, 'mappers'), opts).then(function(mapper){
      should.exist(mapper);
      done();
    }).catch(done);
  });

  describe('Query', function() {
    it('#insert()', function(done) {
      mapper().insert('post.insert', post).then(function(insertId) {
        insertId.should.be.a.Number();
        post.id = insertId;
        done();
      }).catch(done);
    });

    it('#update()', function(done) {
      post.updated = new Date();
      mapper().update('post.update', post).then(function(affectedRows) {
        affectedRows.should.be.above(0);
        done();
      }).catch(done);
    });

    it('#selectOne()', function(done) {
      mapper().selectOne('post.selectById', post.id).then(function(ret) {
        ret.should.be.instanceof(Object).and.have.properties({
          title: post.title,
          content: post.content,
          author: post.author
        });
        done();
      }).catch(done);
    });

    it('#select()', function(done) {
      mapper().select('post.selectAll').then(function(posts) {
        posts.should.be.instanceof(Array);
        should.exist(posts[0]);
        posts[0].should.have.properties({
          title: post.title,
          content: post.content,
          author: post.author
        });
        done();
      }).catch(done);
    });

    it('#delete()', function(done) {
      mapper().delete('post.deleteById', post.id).then(function(affectedRows) {
        affectedRows.should.be.above(0);
        done();
      }).catch(done);
    });
  });

  describe('Transaction', function() {
    it('#commit', function(done) {
      var testMapper = mapper();
      testMapper.begin().then(function(conn) {
        testMapper.insert(conn, 'post.insert', post)
          .then(function(postId) {
            postId.should.be.a.Number();
            post.id = postId;
            post.updated = new Date();
            return testMapper.update(conn, 'post.update', post);
          })
          .then(function(changedRows){
            changedRows.should.be.above(0);
            return testMapper.delete(conn, 'post.deleteById', post.id);
          })
          .then(function(affectedRows){
            affectedRows.should.be.ok();
            return testMapper.commit(conn);
          })
          .then(done)
          .catch(done);
      }).catch(done);
    });

    it('#rollback', function(done) {
      var testMapper = mapper();
      testMapper.begin().then(function(conn) {
        testMapper.insert(conn, 'post.insert', post)
          .then(function(postId) {
            postId.should.be.a.Number();
            post.id = postId;
            post.updated = new Date();
            return testMapper.select(conn, 'post.errorQuery', post);
          })
          .then(function(){
            return testMapper.commit(conn);
          })
          .then(done)
          .catch(function(err){
            should.exist(err);
            testMapper.rollback(conn).then(function(){
              done();
            });
          });
      }).catch(done);
    });
  });
});
