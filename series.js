'use strict';

module.exports = function series (tasks, callback, conn) {

    callback = callback || function(err) {};

    var isArr = Array.isArray(tasks);
    var len = isArr ? tasks.length : Object.keys(tasks).length;
    var keys = isArr ? null : Object.keys(tasks);
    var results = isArr ? [] : {};

    if (len === 0) {
        return callback(null, results);
    }

    var completed = 0;
    var iterate = function () {

        var key = isArr ? completed : keys[completed];
        tasks[key](function(err, result) {
            if (err) {
                return callback(err, results);
            }

            if (isArr) {
                results.push(result);
            } else {
                results[key] = result;
            }

            if (++completed >= len) {
                callback(null, results);
            } else {
                iterate();
            }

        }, conn, results);

    };

    iterate();

};