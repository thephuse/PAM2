require.config({
  paths: {
    "jquery" : "vendor/jquery/jquery",
    "backbone" : "vendor/backbone-amd/backbone",
    "underscore" : "vendor/underscore-amd/underscore",
    "moment" : "vendor/momentjs/moment",
    "md5" : "vendor/js-md5/js/md5"
  }
});

require(['views/app'], function(AppView){

  new AppView();
});