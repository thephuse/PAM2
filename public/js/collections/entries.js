(function() {
  define(["backbone", "models/entry"], function(Backbone, Entry) {
    var Entries;
    Entries = Backbone.Collection.extend({
      model: Entry,
      parse: function(data) {
        var parsed;
        parsed = [];
        $(data).find("day-entry").each(function(index) {
          var hours;
          hours = $(this).find("hours").text();
          return parsed.push({
            hours: hours
          });
        });
        return parsed;
      },
      fetch: function(options) {
        options = options || {};
        options.dataType = "xml";
        return Backbone.Collection.prototype.fetch.call(this, options);
      }
    });
    return Entries;
  });

}).call(this);
