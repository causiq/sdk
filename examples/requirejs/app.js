require(['logary-js', 'logary-js/jquery.instrumentation.js'],
        function (LogaryClient, instrumentJQuery) {
  var logary = new LogaryClient({});
  if (window.jQuery) {
    instrumentJQuery(logary, jQuery);
  }

  try {
    throw new Error('hello from logary-js');
  } catch (err) {
    logary.push(err);
  }
});
