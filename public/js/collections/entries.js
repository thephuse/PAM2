define(['backbone', 'models/entry'], function(Backbone, Entry){

  var Entries = Backbone.Collection.extend ({
    model: Entry,
    parse: function (data) {
      var parsed = [];
      $(data).find('day-entry').each(function (index) {
        var hours = $(this).find("hours").text();
        parsed.push({hours: hours});
      });
      return parsed;
    },
    fetch: function (options) {
      options = options || {};
      options.dataType = "xml";
      Backbone.Collection.prototype.fetch.call(this, options);
    }
  });

  return Entries;

});