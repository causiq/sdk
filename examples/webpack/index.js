import {
  default as Logary,
  Targets, Message, getLogger, build,
  createContent, ajax
} from 'logary';

// once per site/app
const target = Targets.logaryService({
  path: '/i/site/logary',
  serialise: createContent,
  send: ajax
});

// save this in the app's context:
const logary = new Logary('example.com', target);

// in your module, or in your functions:
const logger = build(logary, getLogger(logary, 'MyModule.MySub'));

logger(Message.event('Initialised App'));
