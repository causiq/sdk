/// <reference types="logary" />

// [{"event":"Foobar purchased",
// "monetaryValue":{"amount":20,"currency":"EUR"},
//"error":null,"level":3,"fields":{},"context":{"userId":"d052e0b66497406aa0b329e7b8a9a545"},"name":["with-nextjs","IndexPage"],"parentSpanId":"9d55ac598002d718","type":"event","timestamp":"1603819069309000000","templated":{"message":"Foobar purchased","consumed":[],"remaining":[]},"id":"PiE4RcWXxLEt6EzQOUaoRA=="},{"event":"User clicked \"{cssSelector}\"","monetaryValue":null,"error":null,"level":3,"fields":{"text":"Place purchase","cssSelector":"html body div#__next div#layout button#purchase.primary"},"context":{"userId":"d052e0b66497406aa0b329e7b8a9a545"},"name":["with-nextjs","plugins","browser","click"],"parentSpanId":"9d55ac598002d718","type":"event","timestamp":"1603819069314000000","templated":{"message":"User clicked \"html body div#__next div#layout button#purchase.primary\"","consumed":[{"key":"cssSelector","value":"html body div#__next div#layout button#purchase.primary"}],"remaining":[{"key":"text","value":"Place purchase"}]},"id":"DDuhbfS/kW1pVJXB1GGXaQ=="}]

context('logary-browser via async script', () => {
  beforeEach(() => {
    cy.visit('/?env=test')
  })

  it('finds "logary" & "stubTarget" on "window" since we\'re using env=test', () => {
    cy.window().then(w => {
      expect(w).to.haveOwnProperty('logary')
      expect(w).to.haveOwnProperty('stubTarget')
    })
  })

  it('sends events as beacons', () => {
    cy.route2('/api/logary', "true").as("logcall")

    cy.get("#purchase").click()

    cy.wait("@logcall")
  })

  it('creates a "uid" cookie', () => {
    cy.getCookie('uid').should('have.property', 'value')
  })

  it('logs "event" type messages', () => {
    cy.get('#purchase').click()

    cy.window().then(w => {
      // @ts-ignore
      const es = w.stubTarget.messages.filter(m => m.type === 'event')
      // @ts-ignore
      console.log(w.stubTarget)

      expect(es.length).to.be.greaterThan(0, "Has events")

      const esx = es.filter(m => m.fields.text === 'Place purchase')

      expect(esx.length).to.be.greaterThan(0, "Has events in esx")
    })
  })

  it('logs "identify" type messages', () => {
    cy.get('#identify').click()

    cy.window().then(w => {
      // @ts-ignore
      const es = w.stubTarget.messages.filter(m => m.type === 'identifyUser')
      // @ts-ignore
      console.log(w.stubTarget)

      expect(es.length).to.be.greaterThan(0, "Has events")

      const esx = es.filter(m => m.prevUserId === 'ABC123' && m.nextUserId === 'ABC321')

      expect(esx.length).to.be.greaterThan(0, "Has events in esx")
    })
  })

  it('logs "setUserProperty" type messages', () => {
    cy.get('#setUserProperty').click()

    cy.window().then(w => {
      // @ts-ignore
      const es = w.stubTarget.messages.filter(m => m.type === 'setUserProperty')
      // @ts-ignore
      console.log(w.stubTarget)

      expect(es.length).to.be.greaterThan(0, "Has events")

      const esx = es.filter(m => m.userId === 'ABC123')

      expect(esx.length).to.be.greaterThan(0, "Has events in esx")
    })
  })

  it('logs "forgetUser" type messages', () => {
    cy.get('#forgetUser').click()

    cy.window().then(w => {
      // @ts-ignore
      const es = w.stubTarget.messages.filter(m => m.type === 'forgetUser')
      // @ts-ignore
      console.log(w.stubTarget)

      expect(es.length).to.be.greaterThan(0, "Has events")

      const esx = es.filter(m => m.userId === 'ABC123')

      expect(esx.length).to.be.greaterThan(0, "Has events in esx")
    })
  })
})