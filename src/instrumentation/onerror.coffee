onerror = (message, file, line, column, error) ->
  if message == 'Script error.'
    # Ignore.
    return

  if error
    global.Logary.push {error: error}
  else
    global.Logary.push
      error:
        message: message
        fileName: file
        lineNumber: line
        columnNumber: column or 0

models.exports = onerror