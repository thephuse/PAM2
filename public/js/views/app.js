(function() {
  define(["backbone", "jquery", "moment", "collections/users", "views/user"], function(Backbone, $, moment, Users, UserView) {
    var AppView;
    AppView = Backbone.View.extend({
      el: "body",
      range: "week",
      statsTemplate: _.template($("#stats-template").html()),
      events: {
        "click .filter": "filterRange"
      },
      initialize: function() {
        Users.fetch({
          reset: true
        });
        this.listenTo(Users, "reset", this.render);
        this.listenTo(Users, "change", this.showStats);
        this.getEnd();
        return setInterval((function() {
          return Users.fetch({
            reset: true
          });
        }), 60000);
      },
      render: function() {
        this.$("#users").find("tbody").html("");
        return Users.each(this.showActive, this);
      },
      showActive: function(user) {
        var end, start, view;
        end = this.getEnd();
        start = this.getStart(this.range);
        if (user.get("active") === "true") {
          view = new UserView({
            model: user,
            endDate: end,
            startDate: start
          });
          return $("#users").append(view.render().el);
        }
      },
      showStats: function() {
        var allBillableHours, allHours, percentBillable;
        allHours = 0;
        allBillableHours = 0;
        Users.each(function(user) {
          var billableHours, hours;
          if (user.get("active") === "true") {
            hours = user.get("hours");
            billableHours = user.get("billableHours");
            allHours += parseFloat(hours);
            return allBillableHours += parseFloat(billableHours);
          }
        });
        percentBillable = (allBillableHours / allHours * 100).toFixed(0);
        return this.$(".totals tbody").html(this.statsTemplate({
          hours: (isNaN(allHours) ? "0.0" : allHours.toFixed(1)),
          billableHours: (isNaN(allBillableHours) ? "0.0" : allBillableHours.toFixed(1)),
          percentBillable: (isNaN(percentBillable) ? "00" : percentBillable + "%")
        }));
      },
      getEnd: function() {
        return moment().format("YYYYMMDD");
      },
      filterRange: function(e) {
        this.range = $(e.currentTarget).data("range");
        this.$("li").removeClass("active");
        $(e.currentTarget).parent("li").addClass("active");
        return this.render();
      },
      getStart: function(range) {
        switch (range) {
          case "day":
            return moment().format("YYYYMMDD");
          case "month":
            return moment().startOf("month").format("YYYYMMDD");
          case "week":
            return moment().startOf("week").add("days", 1).format("YYYYMMDD");
          default:
            return moment().startOf("week").add("days", 1).format("YYYYMMDD");
        }
      }
    });
    return AppView;
  });

}).call(this);
