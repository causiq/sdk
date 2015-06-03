var LogaryClient = require('logary'),
    jQuery       = require('jquery'),
    fixJq        = require('logary/lib/logary.jquery');

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
