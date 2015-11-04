merge = require '../internal/merge'
jsonifyMessage = require '../internal/jsonify_message'

module.exports = (msg, opts) ->
  opts = merge opts,
    host: null
    port: null
    path: '/i/logary/messages'
    query: null

  url = "#{opts.host}#{if opts.port? then ':' + opts.port else ''}#{opts.path}#{if opts.query? then '?' + opts.query else ''}"

  payload = jsonifyMessage msg

  req = new global.XMLHttpRequest()
  req.open 'POST', url, true
  req.setRequestHeader 'Content-Type', 'application/json'
  req.send payload

  req.onreadystatechange = ->
    if req.readyState == 4 and req.status == 201 and console?.debug?
      console.debug("logary: error #%s was reported: %s", req.response.id)
