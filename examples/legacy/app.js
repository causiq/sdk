var logary = new logaryJs.Client({}});
if (window.jQuery) {
  logary.instrumentation.jquery(logary, jQuery);
}

try {
  throw new Error('hello from logary-js');
} catch (err) {
  logary.push(err);
}
