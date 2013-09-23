define ["backbone", "models/entry"], (Backbone, Entry) ->
  Entries = Backbone.Collection.extend(
    model: Entry
    parse: (data) ->
      parsed = []
      $(data).find("day-entry").each (index) ->
        hours = $(this).find("hours").text()
        parsed.push hours: hours

      parsed

    fetch: (options) ->
      options = options or {}
      options.dataType = "xml"
      Backbone.Collection::fetch.call this, options
  )
  Entries
