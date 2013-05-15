var app = app || {}; 

var EntryList = Backbone.Collection.extend ({
  model: app.Entry,
  parse: function (data) {
    var parsed = [];
    $(data).find('day-entry').each(function (index) {
      var hours = $(this).find("hours").text();           
      parsed.push({hours: hours});
    })
    return parsed;
  },
  fetch: function (options) {
    options = options || {};
    options.dataType = "xml";
    Backbone.Collection.prototype.fetch.call(this, options);
  }    
});