window.onload = function() {
  require.config({
    paths: {
      logary: 'node_modules/logary-js/lib'
    }
  });

  require(['logary/logary', 'logary/jquery.instrumentation'],
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
}
