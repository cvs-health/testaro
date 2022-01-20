exports.grunt = grunt => {

  grunt.initConfig({
    jshint: {
      files: ['*.js', 'procs/*/*.js', 'tests/*.js'],
      options: {
        globals: {
          jQuery: false
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint']);

};
