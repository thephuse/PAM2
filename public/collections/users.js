var app = app || {}; 

var UserList = Backbone.Collection.extend ({
  model: app.User,
  url: '/users',
  parse: function (data) {
    var parsed = [];
    $(data).find('user').each(function (index) {
      var fname = $(this).find('first-name').text();
      var isActive = $(this).find('is-active').text();
      var uid = $(this).find('id').text();
      var dept = $(this).find('department').text();
      parsed.push({id: uid, name: fname, active: isActive, department: dept});
    })
    return parsed;
  },
  fetch: function (options) {
    options = options || {};
    options.dataType = "xml";
    Backbone.Collection.prototype.fetch.call(this, options);
  }    
});

app.Users = new UserList(); 