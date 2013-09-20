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
    }

  });

  grunt.loadNpmTasks('grunt-contrib-stylus');

  grunt.registerTask('default', ['stylus']);

};