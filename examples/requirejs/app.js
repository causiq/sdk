require.config({
  paths: {
    logaryJs: 'node_modules/logary-js/dist'
  }
});

require(['logaryJs/client', 'logaryJs/instrumentation/jquery'],
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
