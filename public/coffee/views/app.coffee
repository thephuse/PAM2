define ["backbone", "jquery", "moment", "collections/users", "views/user"], (Backbone, $, moment, Users, UserView) ->
  AppView = Backbone.View.extend(

    el: "body"

    events:
      "click .filter": "filterRange"
      "click .adjust-range" : "adjustRange"

    ui:
      users: $("#users")
      date: $("#date")
      stats: $(".totals ul")
      total: $(".totals span")
      filtersLi: $(".filters li")

    statsTemplate: _.template($("#stats-template").html())

    initialize: ->
      moment.lang "en",
        week:
          dow: 1
      Users.fetch reset: true
      @calcUserDfds = []
      @timeUnit = "week"
      @range =
        start: @getStart(@timeUnit)
        end: moment()
      @listenTo Users, "reset", @render
      @showRange()
      setInterval (->
        Users.fetch reset: true
      ), 600000

    render: ->
      _end = @range.end.format "YYYYMMDD"
      _start = @range.start.format "YYYYMMDD"
      _self = @
      Users.each (user) ->
        _self.showActive(user, _start, _end)
      $.when.apply($, @calcUserDfds).done =>
        @calcStats()

    showActive: (user, start, end) ->
      if user.get("active") is "true"
        _view = new UserView(
          model: user
          endDate: end
          startDate: start
        )
        @ui.users.append _view.render().el
        @calcUserDfds.push _view.userLoaded

    calcStats: ->
      @stats =
        allHours: 0
        allBillableHours: 0
        percentBillable: 0
      Users.each (user) =>
        if user.get("active") is "true"
          @stats.allHours += parseFloat(user.get("hours"))
          @stats.allBillableHours += parseFloat(user.get("billableHours"))
      @stats.percentBillable = (if @stats.allHours > 0 then (@stats.allBillableHours / @stats.allHours * 100).toFixed(0) else 0)
      @showStats()

    showStats: ->
      _stats =
        hours: @stats.allHours.toFixed(1)
        billableHours: @stats.allBillableHours.toFixed(1)
        percentBillable: @stats.percentBillable
      if @stats.percentBillable >= 60
        _stats.percentClass = "onTarget"
      else if @stats.percentBillable >= 50 and @stats.percentBillable < 60
        _stats.percentClass = "nearTarget"
      else
        _stats.percentClass = "offTarget"
      @ui.stats.html(@statsTemplate(_stats))


    filterRange: (e) ->
      @timeUnit = ($(e.currentTarget).data("range"))
      @range.start = @getStart(@timeUnit)
      @range.end = moment()
      @ui.filtersLi.removeClass "active"
      $(e.currentTarget).parent("li").addClass "active"
      @render()
      @showRange()

    getStart: (unit) ->
      switch unit
        when "day"
          moment()
        when "month"
          moment().startOf("month")
        when "week"
          moment().startOf("week")
        else
          moment().startOf("week")

    showRange:  ->
      _end = moment(@range.end)
      if @timeUnit is "day"
        _range = _end.format("MMMM D")
      else if @timeUnit is "week"
        _start = @range.start.format("MMMM D")
        _end.endOf('week')
        if @range.start.month() is @range.end.month()
          _end = _end.format("D")
        else
          _end = _end.format("MMMM D")
        _range = "#{_start} to #{_end}"
      else
        _range = _end.format("MMMM")
      @ui.date.text(_range)

    adjustRange: (e) ->
      _direction = $(e.currentTarget).data("direction")
      _isToday = moment().isSame(@range.end, 'day')
      if _direction is "future" and _isToday is true
        console.log "YOU CAN'T KNOW THE FUTURE BRO"
      else
        moment.fn.manipulate = (if _direction is "past" then moment.fn.subtract else moment.fn.add)
        if @timeUnit is "day"
          @range.start = @range.start.manipulate('days', 1)
          @range.end = @range.end.manipulate('days', 1)
        else if @timeUnit is "week"
          @range.start = @range.start.manipulate('weeks', 1)
          @range.end = @range.end.endOf('week').manipulate('weeks', 1)
        else if @timeUnit is "month"
          @range.start = @range.start.manipulate('months', 1)
          @range.end = @range.end.endOf('month').manipulate('months', 1).endOf('month')
        @render()
        @showRange()

  )

  AppView