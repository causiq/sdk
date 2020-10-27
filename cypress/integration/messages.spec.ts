/// <reference types="cypress" />

context('Network Requests', () => {
  it('sends events as beacons', () => {
    cy.route2('/api/logary', "true").as("logcall")

    cy.get("#purchase").click()

    cy.wait("@logcall")
  })
})