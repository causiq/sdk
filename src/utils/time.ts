import { HrTime } from '@opentelemetry/api'
import { hrTimeToMilliseconds } from '@opentelemetry/core'

export type EpochNanoSeconds = bigint;

export function hrTimeToEpochNanoSeconds(time: HrTime) {
  return BigInt(hrTimeToMilliseconds(time)) * BigInt('1000000')
}

/**
 * Gets the client's current timestamp as an EpochNanoSeconds value (int64 value of nanoseconds since Unix Epoch)
 */
export default function getTimestamp(): EpochNanoSeconds {
  return BigInt(Date.now()) * BigInt(1_000_000)
}