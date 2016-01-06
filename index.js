'use strict';

var mysql = require('mysql');

module.exports = function(opts) {

  var pool = null;
  if (opts.pool) {
    var config = {};
    copyTo(opts.pool, config);
    copyTo(opts.driver, config);
    pool = mysql.createPool(config);
  }

  function Connection(conn) {
    return {
      query: function() {
        conn.query.apply(conn, arguments);
      },
      end: function() {
        if(pool) {
          conn.release.apply(conn, arguments);
        } else {
          conn.end.apply(conn, arguments);
        }
      },
      begin: function() {
        conn.beginTransaction.apply(conn, arguments);
      },
      rollback: function() {
        conn.rollback.apply(conn, arguments);
      },
      commit: function() {
        conn.commit.apply(conn, arguments);
      }
    };
  }

  return {
    dialect: 'mysql',
    connect: function(callback) {
      if (pool) {
        pool.getConnection(function(err, conn) {
          if (err) {
            return callback(err);
          }
          callback(null, new Connection(conn));
        });
      } else {
        callback(null, new Connection(mysql.createConnection(opts.driver)));
      }
    },
    select: function (rows) {
      return rows;
    },
    selectOne: function(rows) {
      return rows[0];
    },
    insert: function(result) {
      return result.insertId || result.affectedRows;
    },
    update: function(result) {
      return result.affectedRows;
    },
    delete: function(result) {
      return result.affectedRows;
    }
  };
};

function copyTo(source, dest) {
  for (var k in source) {
    dest[k] = source[k];
  }
}
