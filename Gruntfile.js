module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dir: 'public',
   
    concat: {    
      src: {
        src: [
          '<%= dir %>/backbone/models/user.js','<%= dir %>/backbone/models/entry.js',
          '<%= dir %>/backbone/collections/users.js', '<%= dir %>/backbone/collections/entries.js',
          '<%= dir %>/backbone/views/app.js', '<%= dir %>/backbone/views/user.js'
          ],
        dest: '<%= dir %>/dist/pam.js'
      },
      options: {
        separator: ';'
      },
      vendor: {
        src: [
          '<%= dir %>/lib/scripts/jquery.min.js',
          '<%= dir %>/lib/scripts/underscore-min.js',
          '<%= dir %>/lib/scripts/backbone-min.js',
          '<%= dir %>/lib/scripts/md5.js',
          '<%= dir %>/lib/scripts/moment.min.js'
          ],
        dest: '<%= dir %>/dist/vendor.js'
      }
    },

    uglify: {
      src: {
        files: {
          '<%= dir %>/dist/<%= pkg.name %>.min.js': ['<%= dir %>/dist/pam.js']
        }
      },
      vendor: {
        files: {
          '<%= dir %>/dist/vendor.min.js' : ['<%= concat.vendor.dest %>']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'uglify']);

};