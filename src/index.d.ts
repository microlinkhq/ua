import type { Redis } from 'ioredis'

export interface TopOptions {
  withScore?: boolean
}

export interface UserAgentResult {
  incr: (userAgent: string) => Promise<void | number>
  top: (n?: number, options?: TopOptions) => Promise<string[] | Array<[string, number]>>
  flush: () => Promise<number>
}

declare function ua(redis: Redis): UserAgentResult

export default ua
