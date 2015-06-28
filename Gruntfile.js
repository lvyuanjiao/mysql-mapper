module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({

        'sql-mapper': {
            build: {
                files: [{
                    namespace: 'test',
                    src: 'test/**/*.smp',
                    dest: 'test/.build/mappers',
                    ext: '.js'
                }],
                options: {}
            }
        },

        'mochacli': {
            src: ['test/**/*.js'],
            options: {
                timeout: 6000,
                'check-leaks': true,
                ui: 'bdd',
                reporter: 'spec'
            }
        }

    });

    grunt.loadNpmTasks('grunt-sql-mapper');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('test', ['sql-mapper', 'mochacli']);

};