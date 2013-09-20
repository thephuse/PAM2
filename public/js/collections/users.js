define(['backbone', 'models/user'], function(Backbone, User){

  var Users = Backbone.Collection.extend ({

    model: User,
    url: '/users',

    parse: function (data) {
      var parsed = [];
      $(data).find('user').each(function (index) {
        var fname = $(this).find('first-name').text();
        var isActive = $(this).find('is-active').text();
        var uid = $(this).find('id').text();
        var dept = $(this).find('department').text();
        var email = $(this).find('email').text();
        parsed.push({id: uid, name: fname, active: isActive, department: dept, email: email});
      });
      return parsed;
    },

    fetch: function (options) {
      options = options || {};
      options.dataType = "xml";
      Backbone.Collection.prototype.fetch.call(this, options);
    }

  });

  return new Users;

});