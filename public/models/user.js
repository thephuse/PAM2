var app = app || {}; 

app.User = Backbone.Model.extend ({
  defaults: {
    name: '',
    department: ''
  }
});