var mysql = require('mysql');
var mapper = require('sql-mapper');
var pool = {};

module.exports = function(namespace){

	var ns = namespace || Object.keys(pool)[0] || 'SQL_MAPPER_DEFAULT_KEY';
	
	return {
	
		build: function(opts, callback){			
			pool[ns] = mysql.createPool(opts);
			mapper(ns).build(opts.mappers, callback);
		},				
		
		query: function(id, params, done, conn){
		
			if(typeof params === 'function') {
				conn = done;
				done = params;
				params = [];
			}
			
			if(!conn) {
				conn = pool[ns];
			}
						
			mapper(ns).sql(id, params, function(sql, values){				
				conn.query(sql, values, done);				
			});
			
		},
		
		sql: function(id, params, done){
			mapper(ns).sql(id, params, done);
		},
		
		section: mapper(ns).section,
		
		getConnection: function(callback){
			pool[ns].getConnection(callback);
		}
		
	};
	
};
