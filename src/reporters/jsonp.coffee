jsonifyLogline = require('../internal/jsonify_logline')


cbCount = 0

report = (logline, opts) ->
  cbCount++

  cbName = "logaryCb" + String(cbCount)
  global[cbName] = (resp) ->
    console?.debug?("logary-js: error #%s was reported: %s", resp.id, resp.url)
    try
      delete global[cbName]
    catch _ # IE
      global[cbName] = undefined

  payload = encodeURIComponent(jsonifyLogline(logline))
  url = "#{opts.host}/i/logary/logline?&callback=#{cbName}&body=#{payload}"

  document = global.document
  head = document.getElementsByTagName('head')[0]
  script = document.createElement('script')
  script.src = url
  removeScript = -> head.removeChild(script)
  script.onload = removeScript
  script.onerror = removeScript
  head.appendChild(script)


module.exports = report
