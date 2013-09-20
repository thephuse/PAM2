define(['backbone', 'models/entry'], function(Backbone, entryModel){

  var entrylist = Backbone.Collection.extend ({
    model: entryModel,
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

  return entrylist;

});