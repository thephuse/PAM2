(function() {
  define(["backbone", "underscore", "jquery", "md5", "collections/entries", "railsTimezone", "moment-timezone", "moment-timezone-data"], function(Backbone, _, $, md5, Entries, railsTimezone, moment) {
    var UserView;
    UserView = Backbone.View.extend({
      el: $("#users tbody"),
      template: _.template($("#person-template").html()),
      initialize: function(attrs) {
        var billableHoursDfd, hoursDfd, self;
        self = this;
        this.end = attrs.endDate;
        this.start = attrs.startDate;
        hoursDfd = new $.Deferred();
        billableHoursDfd = new $.Deferred();
        this.userLoaded = new $.Deferred();
        this.getTotalHours(hoursDfd);
        this.getBillableHours(billableHoursDfd);
        this.getStatus();
        return $.when(hoursDfd, billableHoursDfd).then(function() {
          return self.calcPercent();
        });
      },
      getTotalHours: function(hoursDfd) {
        var entries, self, userId;
        self = this;
        userId = this.model.get("id");
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
            self.$el.find("tr#" + userId).find(".hours").html(self.model.get("hours")).removeClass("pending");
            return hoursDfd.resolve();
          }
        });
      },
      getBillableHours: function(billableHoursDfd) {
        var billableEntries, self, userId;
        self = this;
        userId = this.model.get("id");
        billableEntries = new Entries();
        billableEntries.url = "/users/" + userId + "/billable/" + this.start + "/" + this.end;
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
            self.$el.find("tr#" + userId).find(".billable").html(self.model.get("billableHours")).removeClass("pending");
            return billableHoursDfd.resolve();
          }
        });
      },
      calcPercent: function() {
        var billable, percentBillable, self, total, userId;
        self = this;
        userId = this.model.get("id");
        total = this.model.get("hours");
        billable = this.model.get("billableHours");
        percentBillable = (total > 0 ? (billable / total) * 100 : 0);
        this.$el.find("tr#" + userId).find(".percent").html(percentBillable.toFixed(0) + "%").removeClass("pending");
        return this.userLoaded.resolve();
      },
      getStatus: function() {
        var self, userId;
        self = this;
        userId = this.model.get("id");
        return $.get("/daily/" + userId, function(response) {
          if ($(response).find("timer_started_at").length > 0) {
            self.model.set({
              isActive: true
            });
            return self.$el.find("tr#" + userId).find(".status").addClass("status-true").removeClass("status-false");
          } else {
            self.model.set({
              isActive: false
            });
            return self.$el.find("tr#" + userId).find(".status").addClass("status-false").removeClass("status-true");
          }
        });
      },
      render: function() {
        var person, timezone, userId;
        userId = this.model.get("id");
        person = this.model.toJSON();
        timezone = railsTimezone.from(person.timezone);
        person.localTime = moment().tz(timezone).format('h:mm a');
        person.hash = userId;
        person.gravatarUrl = "http://www.gravatar.com/avatar/" + md5(person.email);
        if (this.$el.find("tr#" + userId).length === 0) {
          this.$el.append(this.template(person));
        }
        return this;
      }
    });
    return UserView;
  });

}).call(this);
