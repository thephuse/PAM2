var app = app || {}; 

app.AppView = Backbone.View.extend ({

  el: 'body',
  range: "week",
  statsTemplate: _.template($('#stats-template').html()),
  events: {
    "click .filter" : "filterRange",
    "click #test" : 'render'
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

});