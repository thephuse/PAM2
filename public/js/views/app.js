(function() {
  define(["backbone", "jquery", "moment", "collections/users", "views/user"], function(Backbone, $, moment, Users, UserView) {
    var AppView;
    AppView = Backbone.View.extend({
      el: "body",
      events: {
        "click .filter": "filterRange",
        "click .adjust-range": "adjustRange"
      },
      ui: {
        users: this.$("#users"),
        date: this.$("#date")
      },
      initialize: function() {
        moment.lang("en", {
          week: {
            dow: 1
          }
        });
        Users.fetch({
          reset: true
        });
        this.statsEl = this.$(".totals tbdoy");
        this.calcUserDfds = [];
        this.userCount = 0;
        this.timeUnit = "week";
        this.range = {
          start: this.getStart(this.timeUnit),
          end: moment()
        };
        this.listenTo(Users, "reset", this.render);
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
        this.ui.users.find("tbody").html("");
        end = this.range.end.format("YYYYMMDD");
        start = this.range.start.format("YYYYMMDD");
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
          this.ui.users.append(view.render().el);
          this.userCount++;
          return this.calcUserDfds.push(view.userLoaded);
        }
      },
      calcStats: function() {
        var _this = this;
        this.stats = {
          allHours: 0,
          allBillableHours: 0,
          percentBillable: 0
        };
        Users.each(function(user) {
          var billableHours, hours;
          if (user.get("active") === "true") {
            hours = user.get("hours");
            billableHours = user.get("billableHours");
            _this.stats.allHours += parseFloat(hours);
            return _this.stats.allBillableHours += parseFloat(billableHours);
          }
        });
        this.stats.percentBillable = (this.stats.allHours > 0 ? (this.stats.allBillableHours / this.stats.allHours * 100).toFixed(0) : 0);
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
        return this.$el.find(".stats-percent span").html(this.stats.percentBillable + "<sup>%</sup>").removeClass().addClass(percentClass);
      },
      getEnd: function() {
        return moment();
      },
      filterRange: function(e) {
        this.$el.find(".totals span").text("").addClass("pending");
        this.timeUnit = $(e.currentTarget).data("range");
        this.range.start = this.getStart(this.timeUnit);
        this.range.end = this.getEnd();
        this.$("li").removeClass("active");
        $(e.currentTarget).parent("li").addClass("active");
        this.render();
        return this.showRange(this.range.start, this.range.end);
      },
      getStart: function(unit) {
        switch (unit) {
          case "day":
            return moment();
          case "month":
            return moment().startOf("month");
          case "week":
            return moment().startOf("week");
          default:
            return moment().startOf("week");
        }
      },
      showRange: function() {
        var _end, _range, _start;
        _end = moment(this.range.end);
        if (this.timeUnit === "day") {
          _range = _end.format("MMMM D");
        } else if (this.timeUnit === "week") {
          _start = this.range.start.format("MMMM D");
          _end.endOf('week');
          if (this.range.start.month() === this.range.end.month()) {
            _end = _end.format("D");
          } else {
            _end = _end.format("MMMM D");
          }
          _range = "" + _start + " to " + _end;
        } else {
          _range = _end.format("MMMM");
        }
        return this.ui.date.text(_range);
      },
      adjustRange: function(e) {
        var direction, isToday;
        direction = $(e.currentTarget).data("direction");
        isToday = moment().isSame(this.range.end, 'day');
        if (direction === "future" && isToday === true) {
          return console.log("YOU CAN'T KNOW THE FUTURE BRO");
        } else {
          moment.fn.manipulate = (direction === "past" ? moment.fn.subtract : moment.fn.add);
          if (this.timeUnit === "day") {
            this.range.start = this.range.start.manipulate('days', 1);
            this.range.end = this.range.end.manipulate('days', 1);
          } else if (this.timeUnit === "week") {
            this.range.start = this.range.start.manipulate('weeks', 1);
            this.range.end = this.range.end.endOf('week').manipulate('weeks', 1);
          } else if (this.timeUnit === "month") {
            this.range.start = this.range.start.manipulate('months', 1);
            this.range.end = this.range.end.endOf('month').manipulate('months', 1);
          }
          this.render();
          return this.showRange();
        }
      }
    });
    return AppView;
  });

}).call(this);
