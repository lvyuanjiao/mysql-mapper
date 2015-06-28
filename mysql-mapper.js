'use strict';

var mysql = require('mysql');
var mapper = require('sql-mapper');
var Connection = require('./connection');
var series = require('./series');

function MySQLMapper(opts) {
    this.opts = opts;
    this.pool = mysql.createPool(opts.mysql);
}

MySQLMapper.prototype.build = function(done) {
    
    mapper.build({
        namespace: this.opts.namespace,
        dialect: 'mysql',
        mappers: this.opts.mappers
    }, done);

};

// Create connection directly
MySQLMapper.prototype.connect = function(callback) {

    var conn = mysql.createConnection(this.opts);
    callback(null, new Connection(conn));

};

// Get connection from pool
MySQLMapper.prototype.getConnection = function(callback) {

    this.pool.getConnection(function(err, conn) {
        if (err) {
            return callback(err);
        }
        callback(null, new Connection(conn));
    });

};

MySQLMapper.prototype.sqlMapper = function() {
    return mapper(this.opts.namespace);
};


MySQLMapper.prototype.sql = function(queryName, args, done) {
    this.sqlMapper().sql(queryName, args, done);
};


MySQLMapper.prototype.query = function(queryName, args, done, conn) {

    if (typeof args === 'function') {
        conn = done;
        done = args;
        args = [];
    }

    var self = this;
    this.sqlMapper().sql(queryName, args, function(sql, values) {

        //console.log('SQL Query: ', beauty(sql), values);

        if (!conn) {
            // Use pool directly
            conn = self.pool;
        }

        conn.query(sql, values, done);

    });

};

MySQLMapper.prototype.select = function(queryName, args, done, conn) {

    this.query(queryName, args, done, conn);

};

MySQLMapper.prototype.selectOne = function(queryName, args, done, conn) {

    this.query(queryName, args, function(err, rows) {
        done(err, rows && rows[0]);
    }, conn);

};

MySQLMapper.prototype.insert = function(queryName, args, done, conn) {

    this.query(queryName, args, function(err, rows) {
        done(err, rows && (rows.insertId || rows.affectedRows));
    }, conn);

};

MySQLMapper.prototype.update = function(queryName, args, done, conn) {

    this.query(queryName, args, function(err, rows) {
        done(err, rows && rows.affectedRows);
    }, conn);

};

MySQLMapper.prototype.delete = function(queryName, args, done, conn) {

    this.query(queryName, args, function(err, rows) {
        done(err, rows && rows.affectedRows);
    }, conn);

};


MySQLMapper.prototype.transaction = function(tasks, done) {

    this.getConnection(function(err, conn) {

        if (err) {
            return done(err);
        }
        
        conn.begin(function(err) {

            
            if (err) {
                conn.release();
                return done(err);
            }
            
            var rollback = function(e) {
                conn.rollback(function() {
                    conn.release();
                    done(e);
                });
            };

            
            series(tasks, function(err, results) {

                if (err) {
                    return rollback(err);
                }
                
                conn.commit(function(err) {

                    if (err) {
                        return rollback(err);
                    }
                    conn.release();
                    done(err, results);

                });


            }, conn);


        });
        

    });

};



function beauty(sql) {
    return sql.replace(/\s+/g, ' ').trim();
}

module.exports = MySQLMapper;