/*eslint-disable no-alert, no-unused-expressions */
import { expect } from 'chai';
import Logary, { Identity } from '../src/index';

describe('Logary function', function() {
  describe('contains the state', function() {
    it('can be created', function() {
      expect(new Logary()).to.not.be.null;
    });

    it('has a context');

    it('has targets');

    it('has enrichers');
  });
});

// Modules:
describe('Events', function() {
  it('can be created');

  it('has fields');

  it('has a context');
});


// Tooling:
describe('Identity', function() {
  describe('#autogen', function() {
    it('can be called', function() {
      const subject = Identity.autogen();
      expect(subject).to.not.be.null;
      expect(subject).to.not.be.empty;
      expect(subject.length).to.equal(32);
    });
  });
});
describe('Users', function() {
});

// Output:
describe('Targets', function() {
  describe('config', function() {
    it('accepts a uri config hash');

    it('returns an Observable[unit]');
  });
});