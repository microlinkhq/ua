'use strict'

const Redis = require('ioredis')
const test = require('ava')

const client = new Redis()

const ua = require('..')(client)

test.beforeEach(() => client.flushdb())

const insert = async data => {
  for (const [key, n] of Object.entries(data)) {
    for (let i = 0; i < n; i++) {
      await ua.incr(key)
    }
  }
}

test.serial('.top', async t => {
  await insert({
    googlebot: 100,
    bingbot: 50,
    vercelbot: 10,
    baidu: 5,
    yandex: 1
  })
  t.deepEqual(await ua.top(3, { withScore: true }), [
    ['googlebot', 100],
    ['bingbot', 50],
    ['vercelbot', 10]
  ])
  t.deepEqual(await ua.top(3), ['googlebot', 'bingbot', 'vercelbot'])
})

test.serial('.flush', async t => {
  await insert({
    googlebot: 100,
    bingbot: 50,
    vercelbot: 10,
    baidu: 5,
    yandex: 1
  })
  t.deepEqual(await ua.top(3), ['googlebot', 'bingbot', 'vercelbot'])
  await ua.flush()
  t.deepEqual(await ua.top(3), [])
})
