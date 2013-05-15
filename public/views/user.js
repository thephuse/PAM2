var app = app || {}; 

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