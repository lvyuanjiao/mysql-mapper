
var async = require('async');
var mysql = require('mysql');
var mapper = require('sql-mapper');

module.exports = (function(){
	
	var _pool;
	
	return {
		
		build: mapper.build,
		
		section: mapper.section,
		
		createPool: function(conf){
			_pool = mysql.createPool(conf);
		},
		
		getPool: function(){
			return _pool;
		},
		
		getConnection: function(callback) {
			if(!_pool) {
				return callback(new Error('Please init pool first use #mapper.createPool(conf)'));
			}
			_pool.getConnection(callback);
		},
		
		get: function(id, args){
			args = [].concat(args);
			id = id.split('.');
			var fn = mapper.get(id[0])[id[1]];
	
			return {
				sql: function(done) {
					args.push(done);
					fn.apply(null, args);
				},
				query: function(conn, done) {
					if(typeof conn === 'function'){
						done = conn;
						// Use pool directly.
						conn = _pool;
					}					
					args.push(function(sql, values){
						conn.query(sql, values, done);
					});
					fn.apply(null, args);
				}
			};
		},
		
		tx: function(tasks, done){
			
			_pool.getConnection(function(err, conn){
	
				if(err) {
					return done(err);
				}
		
				var wrapper = wrap(tasks, conn);

				conn.beginTransaction(function(err){

					async.series(wrapper, function(err, results){
			
						if(err) {
							return rollback(conn, function(){done(err)});
						}
				
						conn.commit(function(err) {
							if(err) {
								return rollback(conn, function(){done(err)});
							}
							conn.release();
							done(null, results);
						});
			
					});
			
				});		
	
			});
			
		}
		
	};
	
})();

var wrap = function(tasks, conn){
	var wrapper = [];
	tasks.forEach(function(task, i){
		wrapper[i] = function(callback){
			task(conn, callback);
		}
	});
	return wrapper;
};

var rollback = function(conn, callback){
	conn.rollback(function() {
		conn.release();
		return callback && callback();
	});
};
