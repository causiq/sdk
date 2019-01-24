// @flow
import { Observer, Observable, range, timer, throwError, of } from 'rxjs';
import { map, mergeMap, retryWhen, zip } from 'rxjs/operators';
import { compose } from './utilities'

// deps
function fail<T>(header: string): T {
  throw new Error(`Expected header to match /^([\w0-9\-]+): (.*)$/, but was ${header}`);
}

export function parseJSON(data: string): Object {
  try {
    return JSON.parse(data);
  } catch(e) {
    e.rawResponse = data;
    throw e;
  }
}

export function parseHeaders(responseHeaders: string): Headers {
  const parsed =
    responseHeaders
      .split(/\r\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(h => [/^([\w0-9\-]+): (.*)$/.exec(h), h])
      .map(([res, h]) => res == null ? fail(h) : res.slice(-2))
      .reduce(function(acc, [k,v]) { acc[k] = v; return acc; }, {});
  return new Headers(parsed);
}

// impl

/*
 * NOTES
 *
 * At the time of writing, XmlHTTPRequest is used.
 *
 * We want to migrade to fetch (https://fetch.spec.whatwg.org/)
 * when it supports:
 *
 *  - aborting/timeouts
 *  - progress
 *
 * When using fetch, we can use flow's Fetch types:
 *
 *  - https://github.com/facebook/flow/blob/v0.50.0/lib/bom.js#L908
 *  - https://github.com/facebook/flow/blob/v0.50.0/lib/bom.js#L882
 *  - https://github.com/facebook/flow/blob/v0.50.0/lib/bom.js#L860
 *
 * And also see:
 *
 *  - https://www.saltycrane.com/blog/2016/06/flow-type-cheat-sheet/
 *
 * Further, we'd like to support caching GET-able resources. This is
 * primarily a server-side optimisation (https://stackoverflow.com/questions/18414477/chrome-browser-not-sending-if-none-match-for-xhr).
 * However, we won't be able to see the results in dev because of the self-
 * signed certificate.
 *
 * We'll be modelling our Flow types after the flow types, until we can
 * switch to fetch.
 *
 * This questions goes through the differences (repeated from above):
 *
 * https://stackoverflow.com/a/35552420/63621
 *
 * ## Binary data
 *
 * Working with binary data:
 *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
 *  - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
 */

/**
 * This is a helper type to simplify the specification, it isn't an interface
 * and there are no objects implementing it.
 * https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
 *
 * See https://github.com/facebook/flow/blob/v0.50.0/lib/core.js#L696
 */
export type $ArrayBufferView = $TypedArray | DataView;

const RequestHeaders = {
  Accept: 'Accept',
  Authorization: 'Authorization',
  ContentType: 'Content-Type',
  ContentEncoding: 'Content-Encoding'
}

const ResponseHeaders = {
  ContentType: 'Content-Type',
}

const ImageStar = 'image/*'
const ApplicationJson = 'application/json';
const ApplicationJsonUTF8 = 'application/json; charset=utf-8';
const ApplicationOctetStream = 'application/octet-stream';
const MultipartFormData = 'multipart/form-data';

/**
 * About ArrayBuffer: https://stackoverflow.com/a/42418358/63621
 */
export type Body =
  | string
  | Object
  | FormData
  | Blob
  | ArrayBuffer
  | $ArrayBufferView

export type RequestBody =
  | Body
  | URLSearchParams

export type ContentEncoding =
  | 'compress'
  | 'identity'

export type RequestContent =
  { body: RequestBody,
    /**
     * Content-Type header
     */
    contentType: ?string,
    /**
     * Content-Encoding header
     */
    encoding: ContentEncoding }

export type Method =
  | 'GET'
  | 'POST'
  | 'PUT'

export type Request =
  { method: Method,
    /**
     * The URL to send the request to.
     */
    url: string,
    /**
     * The content to send to the server.
     */
    content: ?RequestContent,
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers
     */
    headers: { [name: string]: string },
    /**
     * Transforms request before it is sent
     */
    transformer?: Request => Request }

/**
 * Create a new request value.
 */
export function createRequest(method: Method, url: string, content:?RequestContent = null, headers:{[name:string]: string} = {}) {
  return {method, url, content, headers };
}

export type ResponseType =
  | ''
  | 'json'
  | 'text'
  | 'document'
  | 'blob'
  | 'arraybuffer'

export type ResponseContent =
  { body: Body,
    /**
     * Content-Type header
     */
    contentType: string,
    /**
     * The 'responseType' value from the XmlHTTPRequest.
     */
    type: ResponseType }

export type Response =
  { content: ResponseContent,
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers
     */
    headers: Headers,

    /**
     * The status code of the response.
     */
    status: number,

    /**
     * The request if any.
     */
    request?: Request }

export const emptyResponse: Response =
  // @flow-ignore null headers for unit-testing purposes (when not available in runtime)
  { content: {
      body: "{}",
      contentType: ApplicationJsonUTF8,
      type: 'json'
    },
    headers: typeof window !== 'undefined' && window.Headers ? new Headers() : null,
    status: 0 }

export type Filter =
  (next: (Request => Observable<Response>)) => (request: Request) => Observable<Response>

/*
 *    UTILITIES
 */

type Interpreter = (headers:Headers, response:any, responseType: ResponseType) => ?ResponseContent

function choose(alts: Interpreter[]): (headers:Headers, any, ResponseType) => ResponseContent {
  return (headers, response, responseType) => {
    let tmp;
    for (var i = 0; i < alts.length; i++) {
      tmp = alts[i](headers, response, responseType);
      if (tmp != null) return tmp;
    }
    console.error('No response handler could parse response', response); // eslint-disable-line no-console
    throw new Error('No response handler could parse response');
  }
}

const iJSON: Interpreter = (headers, response, responseType) =>
  responseType === 'json'
    ? { body: response, contentType: 'application/json', type: responseType }
    : null;

const iText2JSON: Interpreter = (headers, response, responseType) =>
  responseType === 'text'
  && headers.has(ResponseHeaders.ContentType)
  // @flow-ignore Checked above
  && headers.get(ResponseHeaders.ContentType).indexOf('application/json') !== -1
    ? { body: JSON.parse(response), contentType: 'application/json', type: 'json' }
    : null;

const iblob: Interpreter = (headers, response, responseType) =>
  responseType === 'blob'
    ? { body: response, contentType: headers.get(ResponseHeaders.ContentType) || 'text/plain', type: responseType }
    : null;

const iblob2: Interpreter = (headers, response, responseType) =>
  headers.get('Content-Type') === 'application/octet-stream'
    ? { body: new Uint8Array(response).buffer, contentType: 'application/octet-stream', type: 'arraybuffer' }
    : null;

const arraybuffer: Interpreter = (headers, response, responseType) =>
  responseType === 'arraybuffer'
    ? { body: response, contentType: 'application/octet-stream', type: responseType }
    : null;

const crash: Interpreter = (headers, response, responseType) => {
  console.error('Unknown response type', responseType, ', and response', response); // eslint-disable-line no-console
  throw new Error(`Unknown response type ${responseType}, and response ${response}`);
}

function normaliseSuccess(e: Event, xhr: XMLHttpRequest, request: Request): Response {
  // with Fetch: `.headers()`
  const headers = parseHeaders(xhr.getAllResponseHeaders());
  const response = ('response' in xhr) ? xhr.response : xhr.responseText;
  const content =
    choose([iJSON, iText2JSON, iblob, iblob2, arraybuffer, crash])(
      headers,
      response,
      // @flow-ignore Docs say it is https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
      xhr.responseType
    );

  return {
    content,
    headers,
    status: xhr.status,
    request
  }
}

export type ErrorType =
  | 'error'
  | 'abort'

function normaliseError(e: Event, xhr: XMLHttpRequest, type: ErrorType): Error {
  const error = new Error(`Request error, status=${xhr.status}`);
  // @flow-ignore
  error.type = type;
  // @flow-ignore
  error.status = xhr.status;
  // @flow-ignore
  error.xhr = xhr;
  // @flow-ignore
  error.originalEvent = e;
  return error;
};

// @flow-ignore
const ctorOf = Function.prototype.call.bind(Object.prototype.toString);


function getOrigin() {
  // window.location.origin is undefined in <= IE11, so we must use fallback
  return !window.location.origin
    ? window.location.protocol +
      "//" + window.location.hostname +
      (window.location.port ? ':' + window.location.port: '')
    : window.location.origin;
}

function createProcessor(r: Request, observer: Observer<*>) {
  return (xhr: XMLHttpRequest, event: Event) => {
    let status = xhr.status === 1223 ? 204 : xhr.status;
    if ((status >= 200 && status <= 500) || status === 0 || status === '') {
      observer.next(normaliseSuccess(event, xhr, r));
      observer.complete();
    } else {
      observer.error(normaliseError(event, xhr, 'error'));
    }
  }
}

/**
 * The DONE value for the XMLHttpRequest
 */
const DONE = 4;

// const isFormData = ctorOf(data) === "[object FormData]";

/**
 * Create request content from the inputs.
 * @param {*} body
 */
export function getContent<T>(body: Body | string | number | boolean | T[] | ?Object): ?RequestContent {
  if (body == null) {
    return null;
  }
  else if (typeof window !== 'undefined' && !!window.FormData && body instanceof FormData) {
    return {
      body,
      contentType: null, // let the browser generate the boundary
      encoding: 'identity'
    }
  } else if (body instanceof ArrayBuffer
             || typeof window !== 'undefined' && !!window.Blob && body instanceof Blob) {
    return {
      body,
      contentType: ApplicationOctetStream,
      encoding: 'identity'
    }
  } else if (body instanceof Uint8Array
             || body instanceof DataView) {
    return {
      body: body.buffer,
      contentType: ApplicationOctetStream,
      encoding: 'identity'
    }
  } else if (typeof body === 'string'
             || typeof body === 'number'
             || typeof body === 'boolean'
             || Array.isArray(body)
             || ctorOf(body) === '[object Object]') {
    return {
      body: JSON.stringify(body),
      contentType: ApplicationJsonUTF8,
      encoding: 'identity'
    }
  } else {
    return {
      body,
      contentType: ApplicationOctetStream,
      encoding: 'identity'
    }
  }
}

export function send(progress?: Observer<ProgressEvent>): Request => Observable<Response> {
  return r => Observable.create(observer => {
    let isDone = false;
    const req = new XMLHttpRequest();
    const processor = createProcessor(r, observer);
    const request = r.transformer != null ? r.transformer(r) : r;

    try {
      req.open(request.method, request.url, /* async */ true);
    } catch (e) {
      observer.error(e);
      // no need for aborting, 'open' failed
      return () => { return; };
    }

    if (request.content != null && request.content.contentType != null) {
      req.setRequestHeader(RequestHeaders.ContentType, request.content.contentType);
      // @flow-ignore
      req.setRequestHeader(RequestHeaders.ContentEncoding, request.content.encoding);
    }

    if (request.headers[RequestHeaders.Accept] === ApplicationJson) {
      req.responseType = "json";
    } else if (request.headers[RequestHeaders.Accept].indexOf('image/') !== -1) {
      req.responseType = "blob";
    }

    for (var key in request.headers) {
      if (Object.hasOwnProperty.call(request.headers, key)) {
        req.setRequestHeader(key, request.headers[key]);
      }
    }

    // it's open, now subscribe everything
    req.onload = (e: ProgressEvent) => {
      if (progress != null) {
        progress.next(e);
        progress.complete();
      }
      processor(req, e);
    }

    if (progress != null) {
      // https://stackoverflow.com/a/22753668/63621
      if (req.upload != null) {
        req.upload.onprogress = progress.next.bind(progress);
      } else {
        req.onprogress = progress.next.bind(progress);
      }
    }

    req.onerror = e => {
      if (progress != null) progress.error(e);
      observer.error(normaliseError(e, req, 'error'));
      isDone = true;
    }

    req.onabort = e => {
      if (progress != null) progress.error(e);
      observer.error(normaliseError(e, req, 'abort'));
      isDone = true;
    }

    try {
      req.send(request.content != null ? request.content.body : null);
    } catch (e) {
      observer.error(e);
    }

    // after sending request, we may abort it, even on error
    return () => {
      if (!isDone && req.readyState !== DONE) {
        req.abort();
      }
    };
  });
}

export function appendHeader(request: Request) {
  return (name: string, value: string): Request => ({
    ...request,
    headers: {
      ...request.headers,
      [name]: value
    }
  })
}

export function appendHeaders(request: Request) {
  return (headers: { [name: string]: string }) => ({
    ...request,
    headers: {
      ...request.headers,
      ...headers
    }
  })
}

function appendTransformer(r: Request) {
  return (t: Request => Request): Request => ({
    ...r,
    transformer: r.transformer != null ? compose(t, r.transformer) : t
  })
}

type RetryOptions =
  { maxRetryAttempts?: number,
    scalingDuration?: number,
    excludedStatusCodes?: number[] }

const defaultRetryOptions: RetryOptions =
  { maxRetryAttempts: 15,
    scalingDuration: 1000 }

/**
 * https://www.learnrxjs.io/operators/error_handling/retrywhen.html
 * @param {*} param0
 */
export const genericRetryStrategy =
  (opts: ?RetryOptions = {}) =>
  (attempts: Observable<any>) => {

  const { maxRetryAttempts, scalingDuration } = { ...defaultRetryOptions, ...opts };

  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      // if maximum number of retries have been met
      // or response is a status code we don't wish to retry, throw error
      if (retryAttempt > maxRetryAttempts || typeof error !== 'string' || error.indexOf("RETRY") === -1) {
        return throwError(error);
      }

      // retry after 1s, 2s, etc...
      console.warn(`Attempt ${retryAttempt}: retrying in ${retryAttempt * scalingDuration}ms`); // eslint-disable-line no-console
      return timer(retryAttempt * scalingDuration);
    })
    //finalize(() => console.log('We are done!'))
  );
}

type OnErrorCallback = (number, Response) => void
const ignoreOnError: OnErrorCallback = (_,__) => {};

// https://www.learnrxjs.io/operators/error_handling/retrywhen.html
function retryCode(code: number, retries: number = 3, onError: OnErrorCallback = ignoreOnError): Filter {
  return next => request =>
    next(request).pipe(
      mergeMap(response => {
        if (response.status === code) {
          return throwError(`RETRY ${code}.`);
        }
        return of(response);
      }),
      retryWhen(genericRetryStrategy())
    )
}

/**
 * E.g. upon entity creation pending
 */
export const retry404: Filter = retryCode(404, 25);

/**
 * Bad Gateway
 */
export const retry502: Filter = retryCode(502, 1000);

/**
 * Service Unavailable
 */
export const retry503: Filter = retryCode(503, 1000);

/**
 * Gateway Timeout; this should not happen, so we must log error on it.
 * Each of these retries ought to take around 30 seconds.
 */
export const retry504: Filter = retryCode(504, 3, console.log.bind(console, 'Gateway Timeout error'));

export const speakJSON: Filter =
  next => request => {
    return next({
      ...appendHeader(request)(RequestHeaders.Accept, ApplicationJson),
      content: request.content
    })
  };

export const idfilter: Filter =
  next => request => next(request);

export const wantsBlob: Filter =
  next => request => {
    return next({
      ...appendHeader(request)(RequestHeaders.Accept, ImageStar),
      content: request.content
    })
  };

export const cond: <T>(?T, T => Filter) => Filter =
  // @flow-ignore
  (t, factory) => t != null ? factory(t) : idfilter;

export function request<T>(filter: Filter): (method: Method, url: string, any, any) => Observable<Response> {
  return function (method: Method,
                   url: string,
                   body?: ?Object | FormData | string | number  | boolean | T[],
                   progress?: Observer<ProgressEvent>): Observable<Response> {
    const content = getContent(body),
          req = createRequest(method, url, content),
          sender = filter(send(progress));
    return sender(req);
  }
}

/**
 * The unauthenticated request filter function that makes it all
 * speak JSON (at time of commenting).
 */
export const uafilter = speakJSON;

export function uarequest(method: Method, url: string, body: mixed, progress?: Observer<ProgressEvent>): Observable<Response> {
  // @flow-ignore - this should work
  return request(uafilter)(method, url, body, progress);
}