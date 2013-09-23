(function() {
  define(["backbone"], function(Backbone) {
    var User;
    User = Backbone.Model.extend({
      defaults: {
        name: "",
        department: "",
        isActive: false
      }
    });
    return User;
  });

}).call(this);
