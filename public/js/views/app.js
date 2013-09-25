(function() {
  define(["backbone", "jquery", "moment", "collections/users", "views/user"], function(Backbone, $, moment, Users, UserView) {
    var AppView;
    AppView = Backbone.View.extend({
      el: "body",
      range: "week",
      events: {
        "click .filter": "filterRange"
      },
      initialize: function() {
        Users.fetch({
          reset: true
        });
        this.statsEl = this.$(".totals tbdoy");
        this.calcUserDfds = [];
        this.userCount = 0;
        this.listenTo(Users, "reset", this.render);
        this.getEnd();
        this.showRange();
        return setInterval((function() {
          return Users.fetch({
            reset: true
          });
        }), 60000);
      },
      render: function() {
        var end, self, start,
          _this = this;
        this.$("#users").find("tbody").html("");
        this.stats = {
          allHours: 0,
          allBillableHours: 0,
          percentBillable: 0
        };
        end = this.getEnd().format("YYYYMMDD");
        start = this.getStart(this.range).format("YYYYMMDD");
        self = this;
        Users.each(function(user) {
          return self.showActive(user, start, end);
        });
        return $.when.apply($, this.calcUserDfds).done(function() {
          return _this.calcStats();
        });
      },
      showActive: function(user, start, end) {
        var view;
        if (user.get("active") === "true") {
          view = new UserView({
            model: user,
            endDate: end,
            startDate: start
          });
          $("#users").append(view.render().el);
          this.userCount++;
          return this.calcUserDfds.push(view.userLoaded);
        }
      },
      calcStats: function() {
        var _this = this;
        Users.each(function(user) {
          var billableHours, hours;
          if (user.get("active") === "true") {
            hours = user.get("hours");
            billableHours = user.get("billableHours");
            _this.stats.allHours += parseFloat(hours);
            return _this.stats.allBillableHours += parseFloat(billableHours);
          }
        });
        this.stats.percentBillable = (this.stats.allBillableHours / this.stats.allHours * 100).toFixed(0);
        return this.showStats();
      },
      showStats: function() {
        var percentClass;
        if (this.stats.percentBillable >= 60) {
          percentClass = "onTarget";
        } else if (this.stats.percentBillable >= 50 && this.stats.percentBillable < 60) {
          percentClass = "nearTarget";
        } else {
          percentClass = "offTarget";
        }
        this.$el.find(".stats-hours span").text(this.stats.allHours.toFixed(1)).removeClass("pending");
        this.$el.find(".stats-billable span").text(this.stats.allBillableHours.toFixed(1)).removeClass("pending");
        return this.$el.find(".stats-percent span").text(this.stats.percentBillable + "%").removeClass().addClass(percentClass);
      },
      getEnd: function() {
        return moment();
      },
      filterRange: function(e) {
        this.$el.find(".totals span").text("").addClass("pending");
        this.range = $(e.currentTarget).data("range");
        this.$("li").removeClass("active");
        $(e.currentTarget).parent("li").addClass("active");
        this.render();
        return this.showRange();
      },
      getStart: function(range) {
        switch (range) {
          case "day":
            return moment();
          case "month":
            return moment().startOf("month");
          case "week":
            return moment().startOf("week").add("days", 1);
          default:
            return moment().startOf("week").add("days", 1);
        }
      },
      showRange: function() {
        var end, start;
        start = this.getStart(this.range).format("MMMM Do");
        end = this.getEnd().format("MMMM Do");
        console.log(this.range);
        if (this.range === "day") {
          return $("#date").text(this.getEnd().format("MMMM Do"));
        } else if (this.range === "week") {
          return $("#date").text(start + " to " + this.getEnd().format("Do"));
        } else {
          return $("#date").text(this.getEnd().format("MMMM"));
        }
      }
    });
    return AppView;
  });

}).call(this);
