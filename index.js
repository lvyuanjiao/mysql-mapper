'use strict';

var mysql = require('mysql');
var Connection = require('./connection');

function MySQLMapper (opts){
	this.opts = opts;
	this.pool = mysql.createPool(opts);
}

MySQLMapper.prototype.connect = function(callback){
	/*
	if(this.pool) {
		this.pool.getConnection(function(err, conn){
			if(err) {
				return callback(err);
			}
			callback(null, new Connection(conn));
		});
	} else {
		callback(null, new Connection(mysql.createConnection(this.opts)));
	}
	*/
	this.pool.getConnection(function(err, conn){
		if(err) {
			return callback(err);
		}
		callback(null, new Connection(conn));
	});
};

MySQLMapper.prototype.select = function(err, rows, callback) {
	callback(err, rows);
};

MySQLMapper.prototype.selectOne = function(err, rows, callback) {
	callback(err, rows && rows[0]);
};

MySQLMapper.prototype.insert = function(err, rows, callback) {	
	callback(err, rows && (rows.insertId || rows.affectedRows));
};

MySQLMapper.prototype.update = function(err, rows, callback) {
	callback(err, rows && rows.affectedRows);
};

MySQLMapper.prototype.delete = function(err, rows, callback) {
	callback(err, rows && rows.affectedRows);
};

module.exports = MySQLMapper;