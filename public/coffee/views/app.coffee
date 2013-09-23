define ["backbone", "jquery", "moment", "collections/users", "views/user"], (Backbone, $, moment, Users, UserView) ->
  AppView = Backbone.View.extend(
    el: "body"
    range: "week"
    statsTemplate: _.template($("#stats-template").html())
    events:
      "click .filter": "filterRange"

    initialize: ->
      Users.fetch reset: true
      @listenTo Users, "reset", @render
      @listenTo Users, "change", @showStats
      @getEnd()
      setInterval (->
        Users.fetch reset: true
      ), 60000

    render: ->
      @$("#users").find("tbody").html ""
      Users.each @showActive, this

    showActive: (user) ->
      end = @getEnd()
      start = @getStart(@range)
      if user.get("active") is "true"
        view = new UserView(
          model: user
          endDate: end
          startDate: start
        )
        $("#users").append view.render().el

    showStats: ->
      allHours = 0
      allBillableHours = 0
      Users.each (user) ->
        if user.get("active") is "true"
          hours = user.get("hours")
          billableHours = user.get("billableHours")
          allHours += parseFloat(hours)
          allBillableHours += parseFloat(billableHours)

      percentBillable = (allBillableHours / allHours * 100).toFixed(0)
      @$(".totals tbody").html @statsTemplate(
        hours: ((if isNaN(allHours) then "0.0" else allHours.toFixed(1)))
        billableHours: ((if isNaN(allBillableHours) then "0.0" else allBillableHours.toFixed(1)))
        percentBillable: ((if isNaN(percentBillable) then "00" else percentBillable + "%"))
      )

    getEnd: ->
      moment().format "YYYYMMDD"

    filterRange: (e) ->
      @range = ($(e.currentTarget).data("range"))
      @$("li").removeClass "active"
      $(e.currentTarget).parent("li").addClass "active"
      @render()

    getStart: (range) ->
      switch range
        when "day"
          moment().format "YYYYMMDD"
        when "month"
          moment().startOf("month").format "YYYYMMDD"
        when "week"
          moment().startOf("week").add("days", 1).format "YYYYMMDD"
        else
          moment().startOf("week").add("days", 1).format "YYYYMMDD"
  )
  AppView
