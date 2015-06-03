define ['client', 'logary.onerror'], (Client, errorHandlerFactory) ->
  requests = null

  describe 'requirejs', ->
    it 'works', ->
      expect(Client).to.be.defined
      expect(errorHandlerFactory).to.be.defined
      expect(window).to.be.defined

  describe 'global error handler', ->
    xhr = null

  	beforeEach ->
      xhr = sinon.useFakeXMLHttpRequest()
      requests = []

      xhr.onCreate = (req) ->
        requests.push req

      fixture.base = 'test/e2e/fixtures'
      fixture.load 'window_onerror.html'

      # karma captures window.onerror, so we can't test it
      window.handleError = errorHandlerFactory (new Client({}))
      window.document.getElementById('btn').click()

    afterEach ->
      #xhr.restore() # TODO: fix
      fixture.cleanup()

    it 'catches exception', ->
      expect(requests.length).to.equal(1)
      req = requests[0]
      expect(req.method).to.equal('POST')
      expect(req.url).to.equal('/i/logary/loglines')
      body = JSON.parse(req.requestBody)
      expect(body.errors[0].message).to.equal('Error: button test exception')
