path = require("path")
module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    dir:
      local: "public"
      dist: "dist"

    stylus:
      compile:
        files:
          "<%= dir.local %>/css/main.css": "<%= dir.local %>/stylus/main.styl"

    jshint:
      files: ["gruntfile.js", "<%= dir.local %>/models/**/*.js", "<%= dir.local %>/collections/**/*.js", "<%= dir.local %>/views/**/*.js"]
      options:
        globals:
          jQuery: true
          console: true
          module: true

    coffee:
      glob_to_multiple:
        expand: true
        cwd: "<%= dir.local %>/coffee"
        src: "{,*/}*.coffee"
        dest: "<%= dir.local %>/js"
        ext: ".js"

    requirejs:
      compile:
        options:
          baseUrl: "<%= dir.local %>/js"
          name: "main"
          mainConfigFile: "<%= dir.local %>/js/main.js"
          out: "<%= dir.local %>/js/main.min.js"

    copy:
      main:
        expand: true
        src: "index.html"
        dest: "dist"

    useminPrepare:
      html: "dist/index.html"

    usemin:
      html: "dist/index.html"

    watch:
      files: ["<%= dir.local %>/stylus/{,*/}*.styl", "<%= dir.local %>/models/**/*.js", "<%= dir.local %>/collections/**/*.js", "<%= dir.local %>/views/**/*.js", "<%= dir.local %>/coffee/{,*/}*.coffee"]
      tasks: ["stylus", "jshint", "coffee"]

  grunt.loadNpmTasks "grunt-contrib-stylus"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-requirejs"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-usemin"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.registerTask "server", ["watch"]
  grunt.registerTask "default", ["stylus", "jshint", "coffee", "requirejs", "copy", "useminPrepare", "usemin"]