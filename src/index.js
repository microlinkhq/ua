'use strict'

const { createHash } = require('crypto')
const { isIP } = require('net')
const ipaddr = require('ipaddr.js')

const isBrowser = require('./is-browser')

const KEY = 'user_agents'
const SEEN_KEY_PREFIX = `${KEY}:seen:`
const ONE_DAY_IN_SECONDS = 24 * 60 * 60
const INCR_ONCE_COMMAND = 'userAgentsIncrOnce'

const INCR_ONCE_SCRIPT = `
if redis.call('SET', KEYS[2], 1, 'NX', 'EX', ARGV[2]) then
  return redis.call('ZINCRBY', KEYS[1], 1, ARGV[1])
end
return false
`

const IPV6_NETWORK_HEXTETS = 4

const ipClientKey = ip => {
  if (ip.kind() === 'ipv4') return ip.toString()
  const network = ip.parts
    .slice(0, IPV6_NETWORK_HEXTETS)
    .map(hextet => hextet.toString(16))
    .join(':')
  return `${network}::/64`
}

const withoutZone = address => address.split('%')[0]

const ipClientKeyOrId = id => {
  try {
    return ipClientKey(ipaddr.process(withoutZone(id)))
  } catch {
    return id
  }
}

const clientKey = clientId => {
  const id = String(clientId)
  return isIP(id) === 0 ? id : ipClientKeyOrId(id)
}

const seenKey = (clientId, userAgent) =>
  SEEN_KEY_PREFIX +
  createHash('sha1')
    .update(`${clientKey(clientId)}\n${userAgent}`)
    .digest('base64url')

const assertWindow = window => {
  if (!Number.isSafeInteger(window) || window <= 0) {
    throw new TypeError(
      `window must be a positive integer of seconds, got ${window}`
    )
  }
}

const incrOnce = redis => {
  if (typeof redis[INCR_ONCE_COMMAND] !== 'function') {
    redis.defineCommand(INCR_ONCE_COMMAND, {
      numberOfKeys: 2,
      lua: INCR_ONCE_SCRIPT
    })
  }
  return redis[INCR_ONCE_COMMAND].bind(redis)
}

module.exports = (redis, options) => {
  const { window = ONE_DAY_IN_SECONDS } = options ?? {}
  assertWindow(window)

  let incrOnceCommand

  const incr = (userAgent, clientId) => {
    if (!isBrowser(userAgent)) return false
    if (clientId == null) return redis.zincrby(KEY, 1, userAgent)
    incrOnceCommand ??= incrOnce(redis)
    return incrOnceCommand(KEY, seenKey(clientId, userAgent), userAgent, window)
  }

  const top = async (n = 10, { withScore = false } = {}) => {
    const args = [KEY, 0, n - 1, 'REV']
    if (withScore) args.push('WITHSCORES')
    const range = await redis.zrange(...args)

    return range.reduce((acc, val, index) => {
      if (withScore) {
        if (index % 2 === 0) acc.push([val, Number(range[index + 1])])
      } else {
        acc.push(val)
      }
      return acc
    }, [])
  }

  const flush = () => redis.del(KEY)

  return { incr, flush, top }
}

module.exports.isBrowser = isBrowser
