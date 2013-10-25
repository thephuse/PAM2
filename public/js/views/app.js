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
        users: $("#users"),
        date: $("#date"),
        stats: $(".totals ul"),
        total: $(".totals span"),
        filtersLi: $(".filters li")
      },
      statsTemplate: _.template($("#stats-template").html()),
      initialize: function() {
        moment.lang("en", {
          week: {
            dow: 1
          }
        });
        Users.fetch({
          reset: true
        });
        this.calcUserDfds = [];
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
        var _end, _self, _start,
          _this = this;
        this.ui.users.find("tbody").html("");
        _end = this.range.end.format("YYYYMMDD");
        _start = this.range.start.format("YYYYMMDD");
        _self = this;
        Users.each(function(user) {
          return _self.showActive(user, _start, _end);
        });
        return $.when.apply($, this.calcUserDfds).done(function() {
          return _this.calcStats();
        });
      },
      showActive: function(user, start, end) {
        var _view;
        if (user.get("active") === "true") {
          _view = new UserView({
            model: user,
            endDate: end,
            startDate: start
          });
          this.ui.users.append(_view.render().el);
          return this.calcUserDfds.push(_view.userLoaded);
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
        var _stats;
        _stats = {
          hours: this.stats.allHours.toFixed(1),
          billableHours: this.stats.allBillableHours.toFixed(1),
          percentBillable: this.stats.percentBillable
        };
        if (this.stats.percentBillable >= 60) {
          _stats.percentClass = "onTarget";
        } else if (this.stats.percentBillable >= 50 && this.stats.percentBillable < 60) {
          _stats.percentClass = "nearTarget";
        } else {
          _stats.percentClass = "offTarget";
        }
        return this.ui.stats.html(this.statsTemplate(_stats));
      },
      filterRange: function(e) {
        this.ui.total.text("").addClass("pending");
        this.timeUnit = $(e.currentTarget).data("range");
        this.range.start = this.getStart(this.timeUnit);
        this.range.end = moment();
        this.ui.filtersLi.removeClass("active");
        $(e.currentTarget).parent("li").addClass("active");
        this.render();
        return this.showRange();
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
