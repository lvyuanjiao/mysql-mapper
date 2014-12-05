var path = require('path');
var should = require('should');
var mapper = require('../index');

var opts = {
	host: 'localhost',
	post: 3306,
	database: 'test',
	user: 'root',
	password: 'adminadmin',
	mappers: path.join(__dirname, 'mappers')
};

var post = {
	id: 123456,
	title: 'Post title',
	content: 'post content',
	created: new Date()
};

function beauty(sql){
	return sql.replace(/\s+/g, ' ').trim();
};

describe('Test', function() {
	
	before(function(done) {
		mapper().build(opts, function() {
			done();
		});
	});
	
	describe('#mapper', function() {		
		
		it('post#Sql', function(done) {
			
			mapper().sql('post.selectById', post.id, function(sql, values) {
				sql = beauty(sql);
				sql.should.equal('SELECT * FROM post WHERE id = ?');
				values.should.eql([123456]);
				done();
			});
		
		});
		
		it('post#insert', function(done) {
			
			mapper().query('post.insert', post, function(err, result) {
				should.not.exist(err);
				result.insertId.should.not.equal(0);
				result.affectedRows.should.equal(1);
				done();
			});			
		
		});
		
		it('post#update', function(done) {
			post.title = 'post title 2';
			mapper().query('post.update', post, function(err, result) {
				should.not.exist(err);
				result.affectedRows.should.equal(1);
				done();
			});			
		
		});
		
		it('post#selectById', function(done) {
			mapper().query('post.selectById', post.id, function(err, results) {
				should.not.exist(err);
				results.length.should.equal(1);				
				done();
			});			
		
		});
		
		it('post#deleteById', function(done) {

			mapper().query('post.deleteById', post.id, function(err, result) {
				should.not.exist(err);
				result.affectedRows.should.equal(1);
				done();
			});			
		
		});
		
	});			
	
	
});
