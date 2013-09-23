define ["backbone"], (Backbone) ->
  User = Backbone.Model.extend(defaults:
    name: ""
    department: ""
    isActive: false
  )
  User