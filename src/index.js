'use strict'

const { isbot } = require('isbot')

const KEY = 'user_agents'

module.exports = redis => {
  const incr = userAgent =>
    userAgent && !isbot(userAgent) && redis.zincrby(KEY, 1, userAgent)

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
