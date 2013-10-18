define ["backbone", "jquery", "moment", "collections/users", "views/user"], (Backbone, $, moment, Users, UserView) ->
  AppView = Backbone.View.extend(
    el: "body"
    events:
      "click .filter": "filterRange"
      "click .adjust-range" : "adjustRange"

    initialize: ->
      moment.lang "en",
        week:
          dow: 1
      Users.fetch reset: true
      @statsEl = @$(".totals tbdoy")
      @calcUserDfds = []
      @userCount = 0
      @timeUnit = "week"
      @range =
        start: @getStart(@timeUnit)
        end: @getEnd()
      @listenTo Users, "reset", @render
      @getEnd()
      @showRange()
      setInterval (->
        Users.fetch reset: true
      ), 60000

    render: ->
      @$("#users").find("tbody").html ""
      end = @range.end.format "YYYYMMDD"
      start = @range.start.format "YYYYMMDD"
      self = @
      Users.each (user) ->
        self.showActive(user, start, end)
      $.when.apply($, @calcUserDfds).done =>
        @calcStats()

    showActive: (user, start, end) ->
      if user.get("active") is "true"
        view = new UserView(
          model: user
          endDate: end
          startDate: start
        )
        $("#users").append view.render().el
        @userCount++
        @calcUserDfds.push view.userLoaded

    calcStats: ->
      @stats =
        allHours: 0
        allBillableHours: 0
        percentBillable: 0
      Users.each (user) =>
        if user.get("active") is "true"
          hours = user.get("hours")
          billableHours = user.get("billableHours")
          @stats.allHours += parseFloat(hours)
          @stats.allBillableHours += parseFloat(billableHours)
      @stats.percentBillable = (if @stats.allHours > 0 then (@stats.allBillableHours / @stats.allHours * 100).toFixed(0) else 0)
      @showStats()

    showStats: ->
      if @stats.percentBillable >= 60
        percentClass = "onTarget"
      else if @stats.percentBillable >= 50 and @stats.percentBillable < 60
        percentClass = "nearTarget"
      else
        percentClass = "offTarget"
      @$el.find(".stats-hours span").text(@stats.allHours.toFixed(1)).removeClass "pending"
      @$el.find(".stats-billable span").text(@stats.allBillableHours.toFixed(1)).removeClass "pending"
      @$el.find(".stats-percent span").text(@stats.percentBillable + "%").removeClass().addClass percentClass

    getEnd: ->
      moment()

    filterRange: (e) ->
      @$el.find(".totals span").text("").addClass "pending"
      @timeUnit = ($(e.currentTarget).data("range"))
      @range.start = @getStart(@timeUnit)
      @range.end = @getEnd()
      @$("li").removeClass "active"
      $(e.currentTarget).parent("li").addClass "active"
      @render()
      @showRange(@range.start, @range.end)

    getStart: (unit) ->
      switch unit
        when "day"
          moment()
        when "month"
          moment().startOf("month")
        when "week" # breaks on sunday
          moment().startOf("week")
        else
          moment().startOf("week")

    showRange:  ->
      if @timeUnit is "day"
        $("#date").text @range.end.format("MMMM D")
      else if @timeUnit is "week"
        if @range.start.month() == @range.end.month()
          $("#date").text @range.start.format("MMMM D") + " to " + @range.end.endOf("week").format("D")
        else
          $("#date").text @range.start.format("MMMM D") + " to " + @range.end.endOf("week").format("MMMM D")
      else
        $("#date").text @range.end.format("MMMM")

    adjustRange: (e) ->
      direction = $(e.currentTarget).data("direction")
      isToday = moment().isSame(@range.end, 'day')
      if direction is "future" and isToday is true
        console.log "YOU CAN'T KNOW THE FUTURE"
      else
        moment.fn.manipulate = (if direction is "past" then moment.fn.subtract else moment.fn.add)
        if @timeUnit is "day"
          @range.start = @range.start.manipulate('days', 1)
          @range.end = @range.end.manipulate('days', 1)
        else if @timeUnit is "week"
          @range.start = @range.start.manipulate('weeks', 1)
          @range.end = @range.end.endOf('week').manipulate('weeks', 1)
        else if @timeUnit is "month"
          @range.start = @range.start.manipulate('months', 1)
          @range.end = @range.end.endOf('month').manipulate('months', 1)
        @render()
        @showRange()

  )

  AppView