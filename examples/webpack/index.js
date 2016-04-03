import { default as Logary, Targets, getLogger, build } from 'logary';

// once per site/app
const target = Targets.logaryService({
  path: '/i/site/logary',
  serialise: Logary.createContent,
  send: m => /* IRL: ajax */ Promise.resolve('Sent to server!')
});

// save this in the app's context:
const logary = new Logary('example.com', target);

// in your module, or in your functions:
const logger = build(logary, getLogger(logary, 'MyModule.MySub'));

logger(Message.event('Initialised App'));
