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
        this.statsEl = this.$(".totals tbdoy");
        this.calcUserDfds = [];
        this.userCount = 0;
        this.stats = {
          allHours: 0,
          allBillableHours: 0,
          percentBillable: 0
        };
        this.listenTo(Users, "reset", this.render);
        this.getEnd();
        return setInterval((function() {
          return Users.fetch({
            reset: true
          });
        }), 60000);
      },
      render: function() {
        var _this = this;
        this.$("#users").find("tbody").html("");
        Users.each(this.showActive, this);
        return $.when.apply($, this.calcUserDfds).done(function() {
          return _this.calcStats(function() {
            return _this.showStats();
          });
        });
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
          $("#users").append(view.render().el);
          this.userCount++;
          return this.calcUserDfds.push(view.userLoaded);
        }
      },
      calcStats: function(cb) {
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
        return cb();
      },
      showStats: function() {
        console.log(this.stats);
        this.$el.find(".stats-hours span").text(this.stats.allHours.toFixed(1)).removeClass("pending");
        this.$el.find(".stats-billable span").text(this.stats.allBillableHours.toFixed(1)).removeClass("pending");
        return this.$el.find(".stats-percent span").text(this.stats.percentBillable).removeClass("pending");
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
