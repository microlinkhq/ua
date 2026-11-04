'use strict'

const Redis = require('ioredis')
const test = require('ava')

const client = new Redis(process.env.REDIS_URI)

const ua = require('..')(client)

test.beforeEach(() => client.flushdb())
test.after.always(() => client.quit())

const UA = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0',
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'
]

const insert = async data => {
  for (const [key, n] of Object.entries(data)) {
    for (let i = 0; i < n; i++) {
      await ua.incr(key)
    }
  }
}

const seenKeys = () => client.keys('user_agents:seen:*')

test.serial('avoid falsy insertions', async t => {
  await ua.incr('')
  await ua.incr(null)
  await ua.incr(undefined)
  await ua.incr(false)
  await ua.incr(0)
  await ua.incr(NaN)

  t.deepEqual(await ua.top(3), [])
})

test.serial('skip non-browser user agents without touching redis', async t => {
  const notBrowsers = [
    'Event-Admin/1.0 (thumbnail)',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  ]
  for (const userAgent of notBrowsers) {
    t.false(ua.incr(userAgent))
    t.false(ua.incr(userAgent, '203.0.113.1'))
  }
  t.is(await client.dbsize(), 0)
})

test.serial('skip browser-shaped bots', async t => {
  t.false(
    ua.incr(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36'
    )
  )
  t.is(await client.dbsize(), 0)
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

test.serial('count a client once per user agent', async t => {
  for (let i = 0; i < 1000; i++) await ua.incr(UA[0], '203.0.113.1')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 1]])
})

test.serial('a heavy client cannot outrank many light clients', async t => {
  for (let i = 0; i < 500; i++) await ua.incr(UA[0], '203.0.113.1')
  for (let i = 0; i < 3; i++) await ua.incr(UA[1], `198.51.100.${i}`)
  t.deepEqual(await ua.top(2, { withScore: true }), [
    [UA[1], 3],
    [UA[0], 1]
  ])
})

test.serial('count each user agent of the same client', async t => {
  await ua.incr(UA[0], '203.0.113.1')
  await ua.incr(UA[1], '203.0.113.1')
  t.deepEqual(
    (await ua.top(2, { withScore: true })).sort(),
    [
      [UA[0], 1],
      [UA[1], 1]
    ].sort()
  )
})

test.serial('client marks expire after the window', async t => {
  const daily = require('..')(client)
  await daily.incr(UA[0], '203.0.113.1')
  const [key] = await seenKeys()
  const ttl = await client.ttl(key)
  t.true(ttl > 24 * 60 * 60 - 5 && ttl <= 24 * 60 * 60)

  const short = require('..')(client, { window: 1 })
  await short.incr(UA[1], '203.0.113.1')
  await new Promise(resolve => setTimeout(resolve, 1100))
  await short.incr(UA[1], '203.0.113.1')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[1], 2]])
})

test.serial('an empty client id is still one client', async t => {
  for (let i = 0; i < 10; i++) await ua.incr(UA[0], '')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 1]])
})

test.serial('ipv6 clients are grouped by their /64 network', async t => {
  const sameNetwork = [
    '2001:db8:1:2::1',
    '2001:db8:1:2:ffff:ffff:ffff:ffff',
    '2001:0DB8:0001:0002::63',
    '2001:db8:1:2::192.0.2.1',
    'fe80::1%eth0',
    'fe80::2%eth1'
  ]
  for (const ip of sameNetwork) await ua.incr(UA[0], ip)
  await ua.incr(UA[0], '2001:db8:1:3::1')
  await ua.incr(UA[0], '::1')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 4]])
})

test.serial('ipv6 with an embedded ipv4 keeps its network', async t => {
  await ua.incr(UA[0], '1::2:3:4:5:192.0.2.1')
  await ua.incr(UA[0], '1:0:2:3::1')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 1]])
})

test.serial('a null client id counts every request', async t => {
  for (let i = 0; i < 3; i++) await ua.incr(UA[0], null)
  for (let i = 0; i < 2; i++) await ua.incr(UA[0], undefined)
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 5]])
})

test.serial(
  'every spelling of an ipv4-mapped address is one client',
  async t => {
    const spellings = [
      '203.0.113.1',
      '::ffff:203.0.113.1',
      '::FFFF:203.0.113.1',
      '0:0:0:0:0:ffff:203.0.113.1',
      '::ffff:cb00:7101',
      '::0:ffff:203.0.113.1'
    ]
    for (const ip of spellings) await ua.incr(UA[0], ip)
    await ua.incr(UA[0], '::ffff:203.0.113.1%eth0')
    t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 1]])
  }
)

test.serial('counting a client again resolves to null', async t => {
  t.is(await ua.incr(UA[0], '203.0.113.4'), '1')
  t.is(await ua.incr(UA[0], '203.0.113.4'), null)
})

test.serial('a parser failure keeps the raw client id', async t => {
  const ipaddr = require('ipaddr.js')
  const original = ipaddr.process
  ipaddr.process = () => {
    throw new Error('boom')
  }
  t.teardown(() => {
    ipaddr.process = original
  })

  await ua.incr(UA[0], '2001:db8:9:9::1')
  await ua.incr(UA[0], '2001:db8:9:9::1')
  await ua.incr(UA[0], '2001:db8:9:9::2')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 2]])
})

test.serial('null options use the default window', async t => {
  const api = require('..')(client, null)
  await api.incr(UA[0], '203.0.113.77')
  const [key] = await seenKeys()
  const ttl = await client.ttl(key)
  t.true(ttl > 24 * 60 * 60 - 5 && ttl <= 24 * 60 * 60)
})

test.serial('different ipv4-mapped clients stay different', async t => {
  await ua.incr(UA[0], '0:0:0:0:0:ffff:198.51.100.1')
  await ua.incr(UA[0], '0:0:0:0:0:ffff:198.51.100.2')
  await ua.incr(UA[0], '::ffff:c633:6403')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 3]])
})

test.serial('non-ip client ids are used as given', async t => {
  await ua.incr(UA[0], '12345')
  await ua.incr(UA[0], '0.0.48.57')
  await ua.incr(UA[0], '203.0.113.010')
  await ua.incr(UA[0], '203.0.113.8')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 4]])
})

test.serial('ipv6 zones do not split a client', async t => {
  await ua.incr(UA[0], 'fe80:0:0:0:1:2:3:4%eth0.100')
  await ua.incr(UA[0], 'fe80::1%eth1')
  await ua.incr(UA[0], '1:2:3:4:5:6:7:8%::1:2')
  await ua.incr(UA[0], '1:2:3:4::9')
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 2]])
})

test.serial('unusual client ids never throw', async t => {
  const ids = [
    'fe80:0:0:0:1:2:3:4%eth0.100',
    '1:2:3:4:5:6:7:8%::1:2',
    'fe80::1%eth0',
    'not-an-ip',
    '999.999.999.999',
    42
  ]
  for (const id of ids) await t.notThrowsAsync(() => ua.incr(UA[0], id))
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], ids.length - 1]])
})

test.serial('client marks are hashed', async t => {
  await ua.incr(UA[0], '203.0.113.1')
  const [key] = await seenKeys()
  t.false(key.includes('203.0.113.1'))
  t.false(key.includes('Mozilla'))
})

test.serial(
  'flush resets counts but keeps client marks until they expire',
  async t => {
    await ua.incr(UA[0], '203.0.113.1')
    await ua.flush()
    await ua.incr(UA[0], '203.0.113.1')
    t.deepEqual(await ua.top(1), [])
    t.is((await seenKeys()).length, 1)
  }
)

test.serial('define the script once per client, only when needed', async t => {
  const redis = new Redis(process.env.REDIS_URI)
  t.teardown(() => redis.quit())
  const defineCommand = redis.defineCommand.bind(redis)
  let definitions = 0
  redis.defineCommand = (...args) => {
    definitions++
    return defineCommand(...args)
  }

  const first = require('..')(redis)
  const second = require('..')(redis)
  await first.incr(UA[0])
  t.is(definitions, 0)

  await first.incr(UA[0], '203.0.113.1')
  await first.incr(UA[0], '203.0.113.2')
  await second.incr(UA[0], '203.0.113.3')
  t.is(definitions, 1)
  t.deepEqual(await ua.top(1, { withScore: true }), [[UA[0], 4]])
})

test.serial(
  'clients without scripting still count without a client id',
  async t => {
    const calls = []
    const minimal = require('..')({
      zincrby: (...args) => calls.push(args),
      zrange: async () => [],
      del: async () => 0
    })
    minimal.incr(UA[0])
    t.deepEqual(calls, [['user_agents', 1, UA[0]]])
    t.throws(() => minimal.incr(UA[0], '203.0.113.1'), {
      instanceOf: TypeError
    })
  }
)

test('reject an invalid window', t => {
  for (const window of [0, -1, 1.5, 2 ** 53, 1e19, Infinity, NaN, '60']) {
    t.throws(() => require('..')(client, { window }), {
      instanceOf: TypeError,
      message: /window must be a positive integer/
    })
  }
})
