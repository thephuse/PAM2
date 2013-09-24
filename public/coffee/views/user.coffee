define ["backbone", "jquery", "md5", "collections/entries"], (Backbone, $, md5, Entries) ->
  UserView = Backbone.View.extend(
    tagName: "tr"
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
      entries = new Entries()
      entries.url = "/users/" + @model.get("id") + "/" + @start + "/" + @end
      entries.fetch success: ->
        totalHours = 0
        entries.each (entry) ->
          totalHours += parseFloat(entry.get("hours"))
        totalHours = totalHours.toFixed(2)
        self.model.set hours: totalHours
        self.$el.find(".hours").html(self.model.get("hours")).removeClass "pending"
        hoursDfd.resolve()

    getBillableHours: (billableHoursDfd) ->
      self = this
      billableEntries = new Entries()
      billableEntries.url = "/users/" + @model.get("id") + "/billable/" + @start + "/" + @end
      billableEntries.fetch success: ->
        billableHours = 0
        billableEntries.each (entry) ->
          billableHours += parseFloat(entry.get("hours"))
        billableHours = billableHours.toFixed(2)
        self.model.set billableHours: billableHours
        self.$el.find(".billable").html(self.model.get("billableHours")).removeClass "pending"
        billableHoursDfd.resolve()

    calcPercent: ->
      total = @model.get("hours")
      billable = @model.get("billableHours")
      percentBillable = (billable / total) * 100
      @$el.find(".percent").html(percentBillable.toFixed(0) + "%"  if total > 0).removeClass "pending"
      @userLoaded.resolve()

    getStatus: ->
      userId = @model.get("id")
      self = this
      $.get "/daily/" + userId, (response) ->
        if $(response).find("timer_started_at").length > 0
          self.model.set isActive: true
          self.$el.find(".status").addClass "status-true"
          self.$el.find(".status").removeClass "status-false"
        else
          self.model.set isActive: false
          self.$el.find(".status").addClass "status-false"
          self.$el.find(".status").removeClass "status-true"

    render: ->
      person = @model.toJSON()
      person.gravatarUrl = "http://www.gravatar.com/avatar/" + md5(person.email)
      @$el.html @template(person)
      this
  )
  UserView
