(function() {
  define(["backbone", "jquery", "md5", "collections/entries"], function(Backbone, $, md5, Entries) {
    var UserView;
    UserView = Backbone.View.extend({
      tagName: "tr",
      template: _.template($("#person-template").html()),
      initialize: function(attrs) {
        var billableHoursDfd, hoursDfd, self;
        self = this;
        this.end = attrs.endDate;
        this.start = attrs.startDate;
        hoursDfd = new $.Deferred();
        billableHoursDfd = new $.Deferred();
        this.getTotalHours(hoursDfd);
        this.getBillableHours(billableHoursDfd);
        this.getStatus();
        return $.when(hoursDfd, billableHoursDfd).then(function() {
          return self.calcPercent();
        });
      },
      getTotalHours: function(hoursDfd) {
        var entries, self;
        self = this;
        entries = new Entries();
        entries.url = "/users/" + this.model.get("id") + "/" + this.start + "/" + this.end;
        return entries.fetch({
          success: function() {
            var totalHours;
            totalHours = 0;
            entries.each(function(entry) {
              return totalHours += parseFloat(entry.get("hours"));
            });
            totalHours = totalHours.toFixed(2);
            self.model.set({
              hours: totalHours
            });
            self.$el.find(".hours").html(self.model.get("hours")).removeClass("pending");
            return hoursDfd.resolve();
          }
        });
      },
      getBillableHours: function(billableHoursDfd) {
        var billableEntries, self;
        self = this;
        billableEntries = new Entries();
        billableEntries.url = "/users/" + this.model.get("id") + "/billable/" + this.start + "/" + this.end;
        return billableEntries.fetch({
          success: function() {
            var billableHours;
            billableHours = 0;
            billableEntries.each(function(entry) {
              return billableHours += parseFloat(entry.get("hours"));
            });
            billableHours = billableHours.toFixed(2);
            self.model.set({
              billableHours: billableHours
            });
            self.$el.find(".billable").html(self.model.get("billableHours")).removeClass("pending");
            return billableHoursDfd.resolve();
          }
        });
      },
      calcPercent: function() {
        var billable, percentBillable, total;
        total = this.model.get("hours");
        billable = this.model.get("billableHours");
        percentBillable = (billable / total) * 100;
        return this.$el.find(".percent").html(total > 0 ? percentBillable.toFixed(0) + "%" : void 0).removeClass("pending");
      },
      getStatus: function() {
        var self, userId;
        userId = this.model.get("id");
        self = this;
        return $.get("/daily/" + userId, function(response) {
          if ($(response).find("timer_started_at").length > 0) {
            self.model.set({
              isActive: true
            });
            self.$el.find(".status").addClass("status-true");
            return self.$el.find(".status").removeClass("status-false");
          } else {
            self.model.set({
              isActive: false
            });
            self.$el.find(".status").addClass("status-false");
            return self.$el.find(".status").removeClass("status-true");
          }
        });
      },
      render: function() {
        var person;
        person = this.model.toJSON();
        person.gravatarUrl = "http://www.gravatar.com/avatar/" + md5(person.email);
        this.$el.html(this.template(person));
        return this;
      }
    });
    return UserView;
  });

}).call(this);
