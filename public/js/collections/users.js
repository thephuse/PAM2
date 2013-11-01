(function() {
  define(["backbone", "models/user"], function(Backbone, User) {
    var Users;
    Users = Backbone.Collection.extend({
      model: User,
      url: "/users",
      parse: function(data) {
        var parsed;
        parsed = [];
        $(data).find("user").each(function(index) {
          var dept, email, fname, isActive, timezone, uid;
          fname = $(this).find("first-name").text();
          isActive = $(this).find("is-active").text();
          uid = $(this).find("id").text();
          dept = $(this).find("department").text();
          email = $(this).find("email").text();
          timezone = $(this).find("timezone").text();
          return parsed.push({
            id: uid,
            name: fname,
            active: isActive,
            department: dept,
            email: email,
            timezone: timezone
          });
        });
        return parsed;
      },
      fetch: function(options) {
        options = options || {};
        options.dataType = "xml";
        return Backbone.Collection.prototype.fetch.call(this, options);
      }
    });
    return new Users;
  });

}).call(this);
