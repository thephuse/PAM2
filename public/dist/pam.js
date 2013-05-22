var app = app || {}; 

app.User = Backbone.Model.extend ({
  defaults: {
    name: '',
    department: '',
    isActive: false
  }
});;var app = app || {}; 

app.Entry = Backbone.Model.extend ({});
;var app = app || {}; 

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
      var email = $(this).find('email').text();
      parsed.push({id: uid, name: fname, active: isActive, department: dept, email: email});
    })
    return parsed;
  },

  fetch: function (options) {
    options = options || {};
    options.dataType = "xml";
    Backbone.Collection.prototype.fetch.call(this, options);
  }    

});

app.Users = new UserList(); ;var app = app || {}; 

var EntryList = Backbone.Collection.extend ({
  model: app.Entry,
  parse: function (data) {
    var parsed = [];
    $(data).find('day-entry').each(function (index) {
      var hours = $(this).find("hours").text();           
      parsed.push({hours: hours});
    })
    return parsed;
  },
  fetch: function (options) {
    options = options || {};
    options.dataType = "xml";
    Backbone.Collection.prototype.fetch.call(this, options);
  }    
});;var app = app || {}; 

app.AppView = Backbone.View.extend ({

  el: 'body',
  range: "week",
  statsTemplate: _.template($('#stats-template').html()),
  events: {
    "click .filter" : "filterRange"
  },

  initialize: function() {
    app.Users.fetch({reset: true});
    this.listenTo(app.Users, 'reset', this.render);  
    this.listenTo(app.Users, 'change', this.showStats);      
    this.getEnd();      
    setInterval(function(){
      app.Users.fetch({reset:true});
    }, 60000);
  },

  render: function() {
    this.$("#users").find("tbody").html('');
    app.Users.each(this.showActive, this);
  },

  showActive: function(user) {
    var end = this.getEnd();
    var start = this.getStart(this.range);      
    if (user.get("active") === "true") {
      var view = new app.UserView({
        model: user, 
        endDate: end, 
        startDate: start
      });
      $("#users").append(view.render().el);     
    }
  },

  showStats: function() {
    var allHours = 0;
    var allBillableHours = 0;
    app.Users.each(function(user){
      if (user.get("active") === "true") {
        var hours = user.get("hours");
        var billableHours = user.get("billableHours");
        allHours += parseFloat(hours);
        allBillableHours += parseFloat(billableHours);
      }
    });
    var percentBillable = (allBillableHours/allHours*100).toFixed(1)
    this.$("#footer tbody").html(this.statsTemplate({
      hours: (isNaN(allHours) ? '0.0' : allHours.toFixed(1)),
      billableHours: (isNaN(allBillableHours) ? '0.0' : allBillableHours.toFixed(1)),
      percentBillable: (isNaN(percentBillable) ? '0.0' : percentBillable)
    }));
  },

  getEnd: function() {
    return moment().format("YYYYMMDD");
  },

  filterRange: function(e){
    this.range = ($(e.currentTarget).data("range"));
    this.$("li").removeClass("active");
    $(e.currentTarget).parent("li").addClass("active");
    this.render();
  },

  getStart: function(range) {
    switch (range) {
      case "day": 
        return moment().format("YYYYMMDD");
        break;
      case "month": 
        return moment().startOf("month").format("YYYYMMDD");
        break;
      case "week":           
        return moment().startOf('week').add('days', 1).format("YYYYMMDD");
        break;
      default:          
        return moment().startOf('week').add('days', 1).format("YYYYMMDD");          
    }
  }

});;var app = app || {}; 

app.UserView = Backbone.View.extend ({
  tagName: 'tr',
  template: _.template($('#person-template').html()),    
  initialize: function(attrs) {   
    var self = this;
    this.end = attrs.endDate; 
    this.start = attrs.startDate; 
    var hoursDfd = new $.Deferred();         
    var billableHoursDfd = new $.Deferred();         
    this.getTotalHours(hoursDfd);      
    this.getBillableHours(billableHoursDfd);
    this.getStatus(); 
    $.when(hoursDfd, billableHoursDfd).then(function(){
      self.calcPercent();
    });
  },

  // these two functions are a mess and there's got to be a better way...
  getTotalHours: function(hoursDfd) {
    var self = this;      
    var entries = new EntryList({});
    entries.url = '/users/' + this.model.get("id") + "/" + this.start + "/" + this.end;
    entries.fetch(
      {success: function(){
        var totalHours = 0;
        entries.each(function(entry){
          totalHours += parseFloat(entry.get("hours"));
        });
        totalHours = totalHours.toFixed(2);
        self.model.set({hours: totalHours});
        self.$el.find("#hours").html(self.model.get("hours"));
        hoursDfd.resolve();
      }
    });  
  },

  getBillableHours: function(billableHoursDfd) {
    var self = this;
    var billableEntries = new EntryList({});
    billableEntries.url = '/users/' + this.model.get("id") + "/billable/" + this.start + "/" + this.end;
    billableEntries.fetch(
      {success: function(){
        var billableHours = 0;
        billableEntries.each(function(entry){
          billableHours += parseFloat(entry.get("hours"));
        });
        billableHours = billableHours.toFixed(2);
        self.model.set({billableHours: billableHours});
        self.$el.find("#billable").html(self.model.get("billableHours"));
        billableHoursDfd.resolve();
      }
    }); 
  },

  calcPercent: function() {
    var total = this.model.get("hours");
    var billable = this.model.get("billableHours");
    var percentBillable = (billable/total)*100;
    if (total > 0) {
      this.$el.find("#percent").html(percentBillable.toFixed(0));
    }
  },

  getStatus: function() {
    var userId = this.model.get("id");
    var self = this; 
    $.get('/daily/' + userId, function(response){
      if ($(response).find('timer_started_at').length > 0) {
        self.model.set({isActive: true});
        self.$el.find(".status").addClass("status-true");
        self.$el.find(".status").removeClass("status-false");
      } else {
        self.model.set({isActive: false});
        self.$el.find(".status").addClass("status-false");
        self.$el.find(".status").removeClass("status-true");
      }      
    });

  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
  
});