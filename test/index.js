'use strict'

const Redis = require('ioredis')
const test = require('ava')

const client = new Redis()

const ua = require('..')(client)

test.beforeEach(() => client.flushdb())

const UA = [
  'Mozilla/0.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/1.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/2.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/3.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
]

const insert = async data => {
  for (const [key, n] of Object.entries(data)) {
    for (let i = 0; i < n; i++) {
      await ua.incr(key)
    }
  }
}

test.serial('avoid falsy insertions', async t => {
  await ua.incr('')
  await ua.incr(null)
  await ua.incr(undefined)
  await ua.incr(false)
  await ua.incr(0)
  await ua.incr(NaN)

  t.deepEqual(await ua.top(3), [])
})

test.serial('.top', async t => {
  await insert({
    [UA[0]]: 100,
    [UA[1]]: 50,
    [UA[2]]: 10,
    [UA[3]]: 5,
    [UA[4]]: 1
  })
  t.deepEqual(await ua.top(3, { withScore: true }), [
    [UA[0], 100],
    [UA[1], 50],
    [UA[2], 10]
  ])
  t.deepEqual(await ua.top(3), [UA[0], UA[1], UA[2]])
})

test.serial('.flush', async t => {
  await insert({
    [UA[0]]: 100,
    [UA[1]]: 50,
    [UA[2]]: 10,
    [UA[3]]: 5,
    [UA[4]]: 1
  })
  t.deepEqual(await ua.top(3), [UA[0], UA[1], UA[2]])
  await ua.flush()
  t.deepEqual(await ua.top(3), [])
})
