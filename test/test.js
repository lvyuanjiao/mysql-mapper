'use strict';

var should = require('should');
var mapper = require('../index');


var opts = {
    namespace: 'blog',
    mappers: __dirname + '/mappers',
    mysql: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'blog'
    }
};

var post = {
    title: 'SQL-MAPPER',
    content: 'You should try this lib.',
    post_at: new Date(),
    author: 'lvyuanjiao'
};

describe('MySQL Mapper', function() {

    before(function(done) {

        mapper.create(opts, function(err, mapper) {
            should.not.exist(err);
            should.exist(mapper);
            done();
        });

    });


    describe('Connection', function() {

        it('#create directly', function(done) {

            mapper('blog').connect(function(err, conn) {
                should.not.exist(err);
                should.exist(conn);
                done();
            });

        });


        it('#from pool', function(done) {

            mapper('blog').getConnection(function(err, conn) {
                should.not.exist(err);
                should.exist(conn);
                conn.release();
                done();
            });

        });

    });


    describe('Query', function() {

        it('#insert()', function(done) {

            mapper('blog').insert('post.insert', post, function(err, insertId) {
                should.not.exist(err);
                insertId.should.be.a.Number();
                post.id = insertId;
                done();
            });

        });

        it('#update()', function(done) {

            post.updated = new Date();
            mapper('blog').update('post.update', post, function(err, affectedRows) {
                should.not.exist(err);
                affectedRows.should.be.above(0);
                done();
            });

        });


        it('#selectOne()', function(done) {

            mapper('blog').selectOne('post.selectById', post.id, function(err, post) {
                should.not.exist(err);
                post.should.be.instanceof(Object).and.have.properties({
                    title: 'SQL-MAPPER',
                    content: 'You should try this lib.',
                    author: 'lvyuanjiao'
                });
                done();
            });

        });


        it('#select()', function(done) {

            mapper('blog').select('post.selectAll', function(err, posts) {
                should.not.exist(err);
                posts.should.be.instanceof(Array);
                should.exist(posts[0]);
                posts[0].should.have.properties({
                    title: 'SQL-MAPPER',
                    content: 'You should try this lib.',
                    author: 'lvyuanjiao'
                });
                done();
            });

        });


        it('#delete()', function(done) {

            mapper('blog').delete('post.deleteById', post.id, function(err, affectedRows) {
                should.not.exist(err);
                affectedRows.should.be.above(0);
                done();
            });

        });


    });


    describe('Transaction', function() {

        it('#tasks as array', function(done) {

            var testMapper = mapper('blog');
            testMapper.transaction([

                function(next, conn, map) {
                    testMapper.insert('post.insert', post, next, conn);
                },

                function(next, conn, map) {
                    post.id = map[0];
                    post.updated = new Date();
                    testMapper.update('post.update', post, next, conn);
                },

                function(next, conn, map) {
                    testMapper.delete('post.deleteById', post.id, next, conn);
                }

            ], function(err, map) {

                should.not.exist(err);
                map.should.be.instanceof(Array).and.have.lengthOf(3);
                map[0].should.be.a.Number();
                map[1].should.be.above(0);
                map[2].should.be.ok();

                done();

            });

        });



        it('#tasks as object', function(done) {

            var testMapper = mapper('blog');
            testMapper.transaction({

                insertId: function(next, conn, map) {
                    testMapper.insert('post.insert', post, next, conn);
                },

                updateRows: function(next, conn, map) {
                    post.id = map.insertId;
                    post.updated = new Date();
                    testMapper.update('post.update', post, next, conn);
                },

                deleteRows: function(next, conn, map) {
                    testMapper.delete('post.deleteById', post.id, next, conn);
                }

            }, function(err, map) {

                should.not.exist(err);
                map.should.be.instanceof(Object);
                map.insertId.should.be.a.Number();
                map.updateRows.should.be.above(0);
                map.deleteRows.should.be.ok();

                done();

            });

        });


        it('#rollback', function(done) {

            var testMapper = mapper('blog');
            testMapper.transaction({

                insertId: function(next, conn, map) {
                    testMapper.insert('post.insert', post, next, conn);
                },

                // Throw error
                errorQuery: function(next, conn, map) {
                    post.id = map.insertId;
                    testMapper.select('post.errorQuery', next, conn);
                },

                deleteRows: function(next, conn, map) {
                    testMapper.delete('post.deleteById', post.id, next, conn);
                }

            }, function(err, map) {

                should.exist(err);
                should.not.exist(map);

                done();

            });

        });



    });


});