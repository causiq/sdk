// @flow
import { Observable, Observer, of, from } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import StackTrace from 'stacktrace-js';
import { send, getContent, emptyResponse } from './request';
import type { Request, RequestContent, Method, Body, Response, ResponseContent } from './request';
import { merge, hexDigest } from './utilities'

export type Value = // TO CONSIDER: Gauge/Derived
  { event: string }

export type LogLevel =
  | 'verbose'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal'

export const VERBOSE: LogLevel = 'verbose';
export const DEBUG: LogLevel = 'debug';
export const INFO: LogLevel = 'info';
export const WARN: LogLevel = 'warn';
export const ERROR: LogLevel = 'error';
export const FATAL: LogLevel = 'fatal';

export function lessThan(a: LogLevel, b: LogLevel) {
  const order = {
    VERBOSE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
  };
  const A = a.toUpperCase();
  const B = b.toUpperCase();
  if (Object.hasOwnProperty.call(order, A) && Object.hasOwnProperty.call(order, B)) {
    return order[A] < order[B];
  } else return false;
}

export type MessageType =
  { name: string,
    value: string,
    timestamp: Date | string,
    context: Object,
    fields: Object,
    session?: Object,
    level: LogLevel }

type CreateCall =
  { template: string,
    fields?: Object,
    context?: Object,
    level?: LogLevel,
    timestamp?: Date | string,
    name?: string }

export const Message = {
  defaultLevel: DEBUG,
  defaultEventLevel: INFO,

  create({ template, fields, context, level, timestamp, name }: CreateCall): MessageType {
    return {
      name: name || '',
      value: template,
      fields: fields || {},
      context: context || {},
      level: level || DEBUG,
      timestamp: timestamp || new Date(),
    };
  },

  event(template: string, level: LogLevel = INFO, fields: Object = {}, context: Object = {}): MessageType {
    return this.create({
      template,
      fields,
      context,
      level: level || this.defaultEventLevel
    });
  },

  eventError(template: string, error: ?Error, fields: Object = {}, context: Object = {}): MessageType {
    return this.create({
      template,
      level: ERROR,
      fields: {
        ...fields,
        errors: error != null ? [ error ] : [],
      },
      context
    });
  }
};

type UntypedMiddleware =
  (next: Function) => (message: MessageType) => any

type MidHandler<TResult> =
  (m:MessageType) => TResult

type Middleware<TResult, TResult2> =
  (next: MidHandler<TResult>) => (m: MessageType) => TResult2

export const messageId:Middleware<*, *> = next => msg =>
  msg.fields.messageId != null
    ? next(msg)
    : next({
      ...msg,
      fields: {
        ...msg.fields,
        messageId: hexDigest(msg)
      }
    });

export const stacktrace = function<TResult>(next: MidHandler<TResult>): MessageType => TResult | Observable<*> {
  return (msg: MessageType) => {
    if (msg.fields && msg.fields.errors && msg.fields.errors.length > 0) {
      const allErrors = msg.fields.errors.map(error => {
        return error.constructor.name === 'Error'
          ? StackTrace.fromError(error)
          : error
      });

      return from(Promise.all(allErrors)).pipe(
        concatMap(errors => {
          const result = next({ ...msg, fields: {
              ...msg.fields,
              errors
            }
          });
          return result instanceof Observable ? result : [ result ];
        })
      );
    } else {
      return next(msg);
    }
  }
}

export const timestamp: Middleware<*,*> = next => msg => next(merge(msg, {
  timestamp: (msg.timestamp instanceof Date ?
                  Number((msg.timestamp.getTime() + '000000')) :
                  Number(Date.now() + '000000'))
}));

export const minLevel: LogLevel => Middleware<*,*> = level => next => msg =>
  lessThan(msg.level, level)
    ? msg
    : next(msg);

export type Logger = (m: MessageType) => MessageType;
export type Target = (MessageType | MessageType[]) => Observable<Response>;

export type LogaryType =
  { service: string,
    target: Target,
    middleware: UntypedMiddleware[]
  }

export class Logary {

  constructor(service: string, target: Target, mid: ?UntypedMiddleware | ?UntypedMiddleware[] = null) {
    const missingTarget = (msg: MessageType) => {
      // eslint-disable-next-line
      if (console) { console.warn('No target specified in logary.'); }
      return of(msg);
    }

    const missingMid = [
      minLevel(INFO),
      messageId,
      timestamp
    ];

    const actualMid =
      (mid != null
        ? (Array.isArray(mid) ? mid : [ mid ])
        : missingMid);

    // function wrap(m) {
      // return next => msg => {
        // console.log('middleware ', mid, ' got ', msg)
        // let res = next(msg)
        // console.log('middleware ', mid, ' returned ', res)
        // return res;
      // }
    // }

    this.service = service;
    this.target = target || missingTarget;
    this.middleware = actualMid // actualMid.map(wrap);
  }
}

/**
 * Compose the logger with the target, to create a Sink.
 */
export function thenTarget(logger: Logger, target: Target): Target {
  return msgs =>
    Array.isArray(msgs)
      ? target(msgs.map(logger))
      : target(logger(msgs));
};

/**
 * Compose the logger with the Logary state, to build a Sink
 * with the middleware available in Logary.
 */
export function build(logary: Logary, logger: Logger): Target {
  return thenTarget(logger, logary.target);
};

export function getLogger(logary: Logary, subSection: string): Logger {
  const logger = message => merge(message, {
    context: {
      service: logary.service,
      logger: subSection
    },
    name: message.name.length > 0
            ? message.name
            : `${logary.service}.${subSection}`
  });

  return compose(...logary.middleware)(logger);
};

/**
 * The error tag to attach to the message if it's of cross-origin origin.
 * See https://stackoverflow.com/questions/5913978/cryptic-script-error-reported-in-javascript-in-chrome-and-firefox
 * Ref https://www.w3.org/TR/html5/webappapis.html#runtime-script-errors point 6
 * and https://www.w3.org/TR/html5/webappapis.html#muted-errors
 */
export const MutedErrorTag = 'muted-error';

/**
 * The tag to give a message that is created as a result of
 * a window.onerror callback firing.
 */
export const WindowOnErrorTag = 'window-onerror';

/**
 * Checks whether the callback's parameters implies the error is muted.
 */
function isMuted(message: string, location: string, lineNo: number, columnNo: number, error: ?Error): boolean {
  return message === "Script error."
         && lineNo === 0
         && columnNo === 0
         && error == null;
}

export function messageFromOnError(message: string, location: string, lineNo: number, columnNo: number, error: ?Error): MessageType {
  return isMuted(message, location, lineNo, columnNo, error)
    ? Message.eventError("Cross-origin script error", null, {
      tags: [ MutedErrorTag, WindowOnErrorTag ]
    })
    : Message.eventError(message, error, {
      source: {
        location,
        lineNo,
        columnNo
      },
      tags: [ 'window-onerror' ]
    });
}

export function onerrorTo(o: Observer<MessageType>) {
  return function(message: string, location: string, lineNo: number, columnNo: number, error: ?Error): void {
    const m = messageFromOnError(message, location, lineNo, columnNo, error);
    o.next(m);
  };
}

/**
 * You need to configure your onerror handler with a logger to send things to.
 */
export function onerror(target: Target) {
  return function(message: string, location: string, lineNo: number, columnNo: number, error: ?Error): Observable<Response> {
    const m = messageFromOnError(message, location, lineNo, columnNo, error);
    return target([ m ]);
  };
}

export function createRequest(
  method: Method,
  url: string,
  content: ?RequestContent): Request {

  return {
    content,
    url,
    method,
    headers: {
      'Accept': 'application/json'
    }
  }
}

function ensureName(m: MessageType): MessageType {
  return {
    ...m,
    name: m.name == null || m.name == '' ? "Qvitoo.App" : m.name
  }
}

type LogaryServiceConf =
  { path: string,
    serialise?: (m: MessageType[]) => ?RequestContent,
    alterRequest?: (r: Request) => Request,
    method?: Method,
    send: (r: Request) => Observable<Response> }

export const Targets = {
  logaryService(conf: LogaryServiceConf): Target {
    if (typeof conf !== 'object') {
      throw new Error('Argument \'conf\' must be a LogaryServiceConf');
    }
    return (msgs: MessageType | MessageType[]) => {
      const mapped = Array.isArray(msgs) ? msgs.map(ensureName) : [ ensureName(msgs) ];
      const content = (conf.serialise || getContent)(mapped),
            interm = createRequest(conf.method || 'POST', conf.path, content),
            request = (conf.alterRequest || (x => x))(interm);

      return conf.send(request);
    };
  }
};

function normaliseError(e) {
  var base = {
    overview: e.toString(),
    name: e.name,
    message: e.message,
    fileName: e.fileName,
    lineNumber: e.lineNumber,
    columnNumber: e.columnNumber,
    stack: e.stack
  };
  Object.keys(e).map(key => base[key] = e[key]);
  return base;
}

// once per site/app
export const defaultTarget: Target = Targets.logaryService({
  path: '/i/logary',
  serialise: getContent,
  send: send()
});

export const stubTarget: Target = (_) => of(emptyResponse);

const captureErrors = next => msg => {
  if (msg.fields && msg.fields.errors && msg.fields.errors.length > 0) {
    return next({
      ...msg,
      fields: {
        ...msg.fields,
        errors: msg.fields.errors.map(normaliseError)
      }
    });
  } else {
    return next(msg);
  }
};

const setLocation =
  next => msg => {
    const url = window ? window.location : undefined;
    return next({
      ...msg,
      context: {
        ...msg.context,
        location: url
      }
    });
  };

type LoggedUser =
  { id: string,
    email: string,
    name: ?string }

export function setUser(user: LoggedUser) {
  return (next: Function) => (msg: Object) => {
    return next(merge(msg, { context: { userId: user.id } }));
  };
}

export default function create(user: LoggedUser, target: Target, service: string = 'Qvitoo.App') {
  return new Logary(service, target, [
    messageId,
    stacktrace,
    timestamp,
    captureErrors,
    setLocation,
    setUser(user)
  ]);
}