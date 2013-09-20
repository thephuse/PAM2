define(['backbone'], function(Backbone){

  var User = Backbone.Model.extend({
    defaults: {
      name: '',
      department: '',
      isActive: false
    }
  });

  return User;

});