var path = require('path');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    dir: {
      local: 'public',
      dist: 'dist'
    },

    stylus: {
      compile: {
        files: {
          '<%= dir.local %>/css/main.css': '<%= dir.local %>/stylus/main.styl'
        }
      }
    },

    jshint: {
      files: ['gruntfile.js', '<%= dir.local %>/models/**/*.js', '<%= dir.local %>/collections/**/*.js', '<%= dir.local %>/views/**/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },

    watch: {
      files: [
        '<%= dir.local %>/stylus/{,*/}*.styl',
        '<%= dir.local %>/models/**/*.js',
        '<%= dir.local %>/collections/**/*.js',
        '<%= dir.local %>/views/**/*.js'
      ],
      tasks: ['stylus', 'jshint']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('server', ['watch']);

  grunt.registerTask('default', ['stylus', 'jshint']);

};