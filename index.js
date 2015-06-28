'use strict';

var MySQLMapper = require('./mysql-mapper');

var mappers = {};

function factory(name) {
    if (!name) {
        name = Object.keys(mappers)[0];
    }
    var mapper = mappers[name];
    if (!mapper) {
        throw new Error('Mapper' + (name ? (' name : ' + name) : '') + ' is not exist');
    }
    return mapper;
}

factory.create = function(opts, done) {

    opts.namespace = opts.namespace || opts.mysql.database || 'DEFAULT_NAME_SPACE';

    var mapper = new MySQLMapper(opts);

    mapper.build(function(err) {

        if (err) {
            return done(err);
        }

        mappers[opts.namespace] = mapper;

        done(null, mapper);

    });

};

module.exports = factory;