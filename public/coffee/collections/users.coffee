define ["backbone", "models/user"], (Backbone, User) ->
  Users = Backbone.Collection.extend(
    model: User
    url: "/users"
    parse: (data) ->
      parsed = []
      $(data).find("user").each (index) ->
        fname = $(this).find("first-name").text()
        isActive = $(this).find("is-active").text()
        uid = $(this).find("id").text()
        dept = $(this).find("department").text()
        email = $(this).find("email").text()
        parsed.push
          id: uid
          name: fname
          active: isActive
          department: dept
          email: email
      parsed

    fetch: (options) ->
      options = options or {}
      options.dataType = "xml"
      Backbone.Collection::fetch.call this, options
  )
  new Users