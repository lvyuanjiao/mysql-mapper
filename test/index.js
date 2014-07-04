
var path = require('path');
var should = require('should');
var mapper = require('../index');

var mappersDir = 'mappers';

function beauty(sql){
	return sql.replace(/\s+/g, ' ').trim();
};

describe('Test', function() {
	
	before(function(done) {
		mapper.createPool({
			host: 'localhost',
			post: 3306,
			database: 'test',
			user: 'root',
			password: 'adminadmin'
		});
		mapper.build(path.join(__dirname, mappersDir), function() {
			done();
		});
	});
	
	describe('#mapper', function() {
		
		
		it('post#Sql', function(done) {
			
			mapper.get('post.selectAll').sql(function(sql, values) {
				console.log(sql, values);
				done();
			});
		
		});
		
		it('post#query from pool', function(done) {
			
			mapper.get('post.selectAll').query(function(err, result) {
				console.log(result);
				done();
			});
		
		});
		
		it('post#qury from connection', function(done) {
		
			mapper.getConnection(function(err, conn){
				mapper.get('post.selectAll').query(conn, function(err, result) {
					console.log(result);
					conn.release();
					done();
				});
			});						
		
		});
		
		
		it('tx#object params', function(done) {
		
			mapper.tx({
				'one': function(conn, next) {
					mapper.get('post.selectAll').query(conn, function(err, result){
						next(err, result);
					});
				},
				'two': function(conn, next) {
					mapper.get('post.selectById', 1).query(conn, function(err, result){
						next(err, result);
					});
				}
			}, function(err, results){
				console.log(err, results);
				done();
			});
		
		});
		
		
		it('tx#array params', function(done) {
		
			mapper.tx([
				function(conn, next) {
					mapper.get('post.selectAll').query(conn, function(err, result){
						next(err, result);
					});
				},
				function(conn, next) {
					mapper.get('post.selectById', 1).query(conn, function(err, result){
						next(err, result);
					});
				}
			], function(err, results){
				console.log(err, results);
				done();
			});
		
		});
		

		it('tx#rollback error', function(done) {
		
			mapper.tx([
				function(conn, next) {
					mapper.get('post.selectAll').query(conn, function(err, result) {
						next(err, result);
					});
				},
				function(conn, next) {
					mapper.get('post.selectById', 1).query(conn, function(err, result){
						next(new Error('Error!'), result);
					});
				}
			], function(err, results) {
				console.log(err, results);
				done();
			});
		
		});
		
	});			
	
	
});
