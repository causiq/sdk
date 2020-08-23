import { HrTime } from '@opentelemetry/api'
import { hrTimeToMilliseconds } from '@opentelemetry/core'

export type EpochNanoSeconds = bigint;

export default function getTimestamp(): EpochNanoSeconds {
  return BigInt(Date.now()) * BigInt(1_000_000)
}

export function hrTimeToEpochNanoSeconds(time: HrTime) {
  return BigInt(hrTimeToMilliseconds(time)) * BigInt('1000000')
}