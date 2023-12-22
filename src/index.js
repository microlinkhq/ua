'use strict'

module.exports = redis => {
  const incr = userAgent =>
    userAgent && redis.zincrby('user_agents', 1, userAgent)

  const top = async (n = 10, { withScore = false } = {}) => {
    const args = ['user_agents', 0, n - 1, 'REV']
    if (withScore) args.push('WITHSCORES')
    const range = await redis.zrange(...args)

    return range.reduce((acc, val, index) => {
      if (withScore) {
        if (index % 2 === 0) acc.push([val, parseInt(range[index + 1])])
      } else {
        acc.push(val)
      }
      return acc
    }, [])
  }

  return { incr, top }
}
