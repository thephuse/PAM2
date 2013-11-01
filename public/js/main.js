(function() {
  require.config({
    paths: {
      jquery: "vendor/jquery/jquery",
      backbone: "vendor/backbone-amd/backbone",
      underscore: "vendor/underscore-amd/underscore",
      moment: "vendor/momentjs/moment",
      "moment-timezone": "vendor/momentjs/moment-timezone",
      "moment-timezone-data": "vendor/momentjs/moment-timezone-data",
      md5: "vendor/js-md5/js/md5",
      railsTimezone: "vendor/rails-timezone-js/rails-timezone"
    }
  });

  require(["views/app"], function(AppView) {
    return new AppView();
  });

}).call(this);
