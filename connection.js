'use strict';

function Connection(conn){
	this.conn = conn;
}

Connection.prototype.query = function() {
	this.conn.query.apply(this.conn, arguments);
};

Connection.prototype.release = function() {
	this.conn.release.apply(this.conn, arguments);
};

Connection.prototype.end = function() {
	this.conn.end.apply(this.conn, arguments);
};

Connection.prototype.begin = function() {
	this.conn.beginTransaction.apply(this.conn, arguments);
};

Connection.prototype.rollback = function() {
	this.conn.rollback.apply(this.conn, arguments);
};

Connection.prototype.commit = function() {
	this.conn.commit.apply(this.conn, arguments);
};

module.exports = Connection;