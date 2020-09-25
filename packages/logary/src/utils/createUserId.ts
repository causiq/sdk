import { v4 } from 'uuid'

export default function createUserId(): string {
  return v4().replace(/-/ig, '')
}