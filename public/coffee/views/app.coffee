define ["backbone", "jquery", "moment", "collections/users", "views/user"], (Backbone, $, moment, Users, UserView) ->
  AppView = Backbone.View.extend(
    el: "body"
    range: "week"
    events:
      "click .filter": "filterRange"

    initialize: ->
      Users.fetch reset: true
      @statsEl = @$(".totals tbdoy")
      @calcUserDfds = []
      @userCount = 0
      @listenTo Users, "reset", @render
      @getEnd()
      setInterval (->
        Users.fetch reset: true
      ), 60000

    render: ->
      @$("#users").find("tbody").html ""
      @stats =
        allHours: 0
        allBillableHours: 0
        percentBillable: 0
      end = @getEnd().format "YYYYMMDD"
      start = @getStart(@range).format "YYYYMMDD"
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
      Users.each (user) =>
        if user.get("active") is "true"
          hours = user.get("hours")
          billableHours = user.get("billableHours")
          @stats.allHours += parseFloat(hours)
          @stats.allBillableHours += parseFloat(billableHours)
      @stats.percentBillable = (@stats.allBillableHours / @stats.allHours * 100).toFixed(0)
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
      @range = ($(e.currentTarget).data("range"))
      @$("li").removeClass "active"
      $(e.currentTarget).parent("li").addClass "active"
      @render()
      @showRange()

    getStart: (range) ->
      switch range
        when "day"
          moment()
        when "month"
          moment().startOf("month")
        when "week"
          moment().startOf("week").add("days", 1)
        else
          moment().startOf("week").add("days", 1)

    showRange: () ->
      console.log moment(@getStart(@range), ["YYYYMMDD"]).format("MMM Do YYYY")

  )

  AppView