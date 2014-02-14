define ["backbone", "underscore", "jquery", "md5", "collections/entries", "railsTimezone", "moment-timezone", "moment-timezone-data"], (Backbone, _, $, md5, Entries, railsTimezone, moment) ->
  UserView = Backbone.View.extend(
    el: $("#users tbody")
    template: _.template($("#person-template").html())
    initialize: (attrs) ->
      self = this
      @end = attrs.endDate
      @start = attrs.startDate
      hoursDfd = new $.Deferred()
      billableHoursDfd = new $.Deferred()
      @userLoaded = new $.Deferred()
      @getTotalHours hoursDfd
      @getBillableHours billableHoursDfd
      @getStatus()
      $.when(hoursDfd, billableHoursDfd).then ->
        self.calcPercent()

    getTotalHours: (hoursDfd) ->
      self = this
      userId = @model.get("id")
      entries = new Entries()
      entries.url = "/users/" + @model.get("id") + "/" + @start + "/" + @end
      entries.fetch success: ->
        totalHours = 0
        entries.each (entry) ->
          totalHours += parseFloat(entry.get("hours"))
        totalHours = totalHours.toFixed(2)
        self.model.set hours: totalHours
        self.$el.find("tr#" + userId).find(".hours").html(self.model.get("hours")).removeClass "pending"
        hoursDfd.resolve()

    getBillableHours: (billableHoursDfd) ->
      self = this
      userId = @model.get("id")
      billableEntries = new Entries()
      billableEntries.url = "/users/" + userId + "/billable/" + @start + "/" + @end
      billableEntries.fetch success: ->
        billableHours = 0
        billableEntries.each (entry) ->
          billableHours += parseFloat(entry.get("hours"))
        billableHours = billableHours.toFixed(2)
        self.model.set billableHours: billableHours
        self.$el.find("tr#" + userId).find(".billable").html(self.model.get("billableHours")).removeClass "pending"
        billableHoursDfd.resolve()

    calcPercent: ->
      self = this
      userId = @model.get("id")
      total = @model.get("hours")
      billable = @model.get("billableHours")
      percentBillable = ((if total > 0 then (billable / total) * 100 else 0))
      @$el.find("tr#" + userId).find(".percent").html(percentBillable.toFixed(0) + "%").removeClass "pending"
      @userLoaded.resolve()

    getStatus: ->
      self = this
      userId = @model.get("id")
      $.get "/daily/" + userId, (response) ->
        if $(response).find("timer_started_at").length > 0
          self.model.set isActive: true
          self.$el.find("tr#" + userId).find(".status").addClass("status-true").removeClass("status-false")
        else
          self.model.set isActive: false
          self.$el.find("tr#" + userId).find(".status").addClass("status-false").removeClass("status-true")

    render: ->
      userId = @model.get("id")
      person = @model.toJSON()
      timezone = railsTimezone.from(person.timezone)
      person.localTime = moment().tz(timezone).format('h:mm a')
      person.hash = userId
      person.gravatarUrl = "http://www.gravatar.com/avatar/" + md5(person.email)
      if (@$el.find("tr#" + userId).length == 0)
        @$el.append @template(person)
      this
  )
  UserView
