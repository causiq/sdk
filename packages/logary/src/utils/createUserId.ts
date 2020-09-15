import uuid from 'uuid'

export default function createUserId(): string {
  return uuid.v4().replace(/-/ig, '')
}