/// <reference types="cypress" />

context('Network Requests', () => {

  beforeEach(() => {
    cy.visit('')
  })


  it('sends events as beacons', () => {
    cy.route2('/api/logary', "true").as("@logcall")

    cy.wait("logcall")
  })
})