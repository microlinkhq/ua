import { Redis } from 'ioredis'
import userAgents from '../index.js'
import type { RedisClient, TopOptions, TopResult, UserAgentsAPI } from '../index.js'

const redis: RedisClient = new Redis({ lazyConnect: true })
const ua: UserAgentsAPI = userAgents(redis)

const header: string | undefined = undefined
const tracked = await ua.incr(header)
const names: string[] = await ua.top(3)
const scored: TopResult[] = await ua.top(3, { withScore: true })
const [userAgent, count]: [string, number] = scored[0]
const options: TopOptions = { withScore: false }
const either: string[] | TopResult[] = await ua.top(undefined, options)
const flushed: number = await ua.flush()

const daily: UserAgentsAPI = userAgents(redis, { window: 60 })
const perClient: string | null | false = await daily.incr(header, '203.0.113.1')
const browser: boolean = userAgents.isBrowser(header)

// @ts-expect-error the client id identifies a caller, so it is a string
daily.incr('Mozilla/5.0', 42)

type HasDefault = 'default' extends keyof typeof userAgents ? true : false
const hasDefault: HasDefault = false

// @ts-expect-error a scored entry is a [userAgent, count] tuple, not an object
console.log(scored[0].userAgent)
// @ts-expect-error incr skips without a promise, so its result is not always thenable
ua.incr('Mozilla/5.0').then(console.log)

console.log(tracked, names, userAgent, count, either, flushed, hasDefault, perClient, browser)
