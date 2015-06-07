var LogaryClient = require('logary-js'),
    jQuery       = require('jquery'),
    fixJq        = require('logary-js/lib/logary.jquery');

(function() {
  // this by default both logs to server & console
  var logary = new LogaryClient();
  fixJq(logary, jQuery);

  try {
    throw new Error('hello from logary-js');
  } catch (err) {
    logary.push(err);
  }
})();
