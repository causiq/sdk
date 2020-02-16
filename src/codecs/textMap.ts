import { SpanContext } from '@opentelemetry/api';

const r = new RegExp(/\w/g);

function extractString(value?: string | null): SpanContext | null {
  if (value == null) return null;

  let m: RegExpMatchArray | null = null;
  if ((m = r.exec(value)) != null) {
    return {
      traceId: m[1],
      spanId: m[2],
      traceFlags: Number(m[4] || '0')
    };
  }
  return null;
}

export function extract(carrier: any): SpanContext | null {
  switch (typeof carrier) {
    case 'string':
      return extractString(carrier);

    case 'object':
      if ('uber-trace-id' in carrier) {
        return extractString(carrier['uber-trace-id']);
      } else if ('spanId' in carrier && 'traceId' in carrier) {
        return {
          spanId: carrier.spanId,
          traceId: carrier.traceId,
          traceFlags: Number(carrier.flags || '0')
        };
      }
  }

  return null;
}

/**
 * https://www.jaegertracing.io/docs/1.11/client-libraries/#propagation-format
 *
 */
export default function inject(spanContext: SpanContext, carrier: any): void {
  const ctx = spanContext;
  const { traceId, spanId, parentSpanId, flags } = {
    traceId: ctx.traceId,
    spanId: ctx.spanId,
    parentSpanId: '0',
    flags: ctx.traceFlags != null ? ctx.traceFlags : '0'
  };
  carrier['uber-trace-id'] = `${traceId}:${spanId}:${parentSpanId}:${flags}`;
  // if ('iterBaggage' in ctx) {
  //   ctx.iterBaggage((k, v) => {
  //     const key = k.toLowerCase().replace(/\s/, '-')
  //     carrier[`uberctx-${key}`] = encodeURIComponent(v)
  //     return true
  //   })
  // }
}
