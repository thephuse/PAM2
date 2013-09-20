module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dir: {
      local: 'public',
      dist: 'dist'
    },

    stylus: {
      compile: {
        options: {
          paths: [],
          use: [],
          import: []
        },
        files: {
          '<%= dir.local %>/css/main.css': '<%= dir.local %>/stylus/main.styl'
        }
      }
    },

    jshint: {
      files: ['gruntfile.js', '<%= dir.local %>/models/**/*.js', '<%= dir.local %>/collections/**/*.js', '<%= dir.local %>/views/**/*.js'],
      options: {
          // more options here if you want to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },

    watch: {
      files: ['<%= dir.local %>/stylus/{,*/}*.styl'],
      tasks: ['stylus']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['stylus', 'jshint']);

};