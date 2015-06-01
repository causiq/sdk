truncate = require('./truncate')

# truncateObj truncates each key in the object separately, which is
# useful for handling circular references.
truncateObj = (obj, n=1000) ->
  dst = {}
  for key of obj
    dst[key] = truncate obj[key], n=n
  return dst

# jsonifyLogline serializes logline to JSON and truncates data,
# environment and session keys.
jsonifyLogline = (logline, n=1000, maxLength=64000) ->
  while true
    logline.data = truncateObj logline.data, n=n
    logline.session = truncateObj logline.session, n=n

    s = JSON.stringify(logline)
    if s.length < maxLength
      return s

    if n == 0
      break
    n = Math.floor(n/2)

  err = new Error("logary-js: cannot jsonify logline (length=#{s.length} maxLength=#{maxLength})")
  err.data =
    json: s[..Math.floor(n/2)] + '...',

  throw err


module.exports = jsonifyLogline
