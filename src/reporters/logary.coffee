jsonifyLogline = require('../internal/jsonify_logline')

report = (logline, opts) ->
  url = "#{if opts?.host? then opts.host else ''}/i/logary/loglines"
  payload = jsonifyLogline logline

  req = new global.XMLHttpRequest()
  req.open('POST', url, true)
  req.setRequestHeader('Content-Type', 'application/json')
  req.send(payload)
  req.onreadystatechange = ->
    if req.readyState == 4 and req.status == 201 and console?.debug?
      console.debug("logary: error #%s was reported: %s", req.response.id, req.response.url)

module.exports = report
