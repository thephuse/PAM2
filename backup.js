 var User = Backbone.Model.extend({});

      var Users = Backbone.Collection.extend({
        model: User,
        url: '/users',
        parse: function (data) {
          var parsed = [];
          $(data).find('user').each(function (index) {
              var bookTitle = $(this).find('email').text();
              parsed.push({title: bookTitle});
          });

          return parsed;
        },
        fetch: function (options) {
            options = options || {};
            options.dataType = "xml";
            Backbone.Collection.prototype.fetch.call(this, options);
        }
      });

      var users = new Users();

      var UserListView = Backbone.View.extend({
        initialize: function() {
          this.collection.on('add', this.addOne, this);
          this.collection.on('fetch', this.addAll, this);
        },
        render: function(){
          this.addAll();
        },
        addOne: function(user){
          var userView = new UserView({model: user});
          this.$el.append(userView.render().el);
        },
        addAll: function(){
          this.collection.forEach(this.addOne, this);
        }
      });

      var userListView = new UserListView({collection: users});
        
      var user1 = new User({
        name: "Tessa",
        thing: "thing"
      });

      var users = new Users();
      users.fetch();

     
      var UserView = Backbone.View.extend({
        template: _.template('<h3><%= name %></h3>'),
        render: function(){
          var attributes = this.model.toJSON();
          this.$el.html(this.template(attributes));
          $("body").append(this.$el);
        }
      });


      $(document).ready(function(){
        users.fetch();
        userListView.render();
      });