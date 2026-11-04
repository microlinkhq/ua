<div align="center">
  <img src="https://github.com/microlinkhq/cdn/raw/master/dist/logo/banner.png#gh-light-mode-only" alt="microlink logo">
  <img src="https://github.com/microlinkhq/cdn/raw/master/dist/logo/banner-dark.png#gh-dark-mode-only" alt="microlink logo">
  <br>
  <br>
</div>

![Last version](https://img.shields.io/github/tag/microlinkhq/ua.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/microlinkhq/ua.svg?style=flat-square)](https://coveralls.io/github/microlinkhq/ua)
[![NPM Status](https://img.shields.io/npm/dm/microlinkhq/ua.svg?style=flat-square)](https://www.npmjs.org/package/microlinkhq/ua)

> A simple redis primitives to incr() and top() user agents.

## Install

```sh
npm install @microlink/ua
```

## Usage

First, initialize the library passing a Redis instance:

```js
const Redis = require('ioredis')
const redis = new Redis()
const ua = require('@microlink/ua')(redis)
```

After that, the library offers the following methods:

- **incr(userAgent, [clientId])** — e.g. <small>`ua.incr(req.headers['user-agent'], req.ip)`</small><br/>
Increment the counter associated with a user agent. Only user agents with the exact shape a real browser sends are counted: a known platform (Windows, macOS, Linux, ChromeOS, Android, iOS), an engine that runs on it (Blink, WebKit, Gecko) and known browser vendor tokens only (Edge, Opera, Samsung, Yandex, Firefox, etc.). Bots, HTTP libraries, Electron apps, in-app webviews and hand-written fakes such as `Chrome/124.0` or `Mac OS X 14_6` are skipped without touching Redis.<br/>
When `clientId` is provided, the same client is counted once per user agent within `window` seconds, so a single heavy caller cannot dominate the ranking. IP addresses are normalized first: IPv6 clients are grouped by their /64 network and IPv4-mapped IPv6 (`::ffff:203.0.113.1`) is the same client as its IPv4. Any other string, including an empty one or one that only looks numeric, is used as given; only `null` or `undefined` count every request. Each mark is a key holding a SHA-1 of the client id and user agent that expires after `window`; it is not anonymization, since anyone reading Redis can brute-force the client id back.

- **top(n, { withScore })** — e.g. <small>`ua.top(100)`</small><br/>
Returns an array of the N ranked from top.

- **flush()** — e.g. <small>`ua.flush()`</small><br/>
Delete the counters. Client marks are kept and expire on their own after `window`, so a client seen just before a flush is counted again once its mark expires.

The factory accepts options as a second argument:

- **window** — <small>default: `86400`</small><br/>
Seconds during which a `clientId` is counted once per user agent.

```js
const ua = require('@microlink/ua')(redis, { window: 60 * 60 })
```

The browser check is also exported for reuse:

```js
const { isBrowser } = require('@microlink/ua')

isBrowser('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36') // => false
```

## License

**microlink/ua** © [microlink.io](https://microlink.io), released under the [MIT](https://github.com/microlinkhq/ua/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/microlinkhq/queue/contributors).

> [microlink.io](https://microlink.io) · GitHub [microlink.io](https://github.com/microlinkhq) · X [@microlinkhq](https://x.com/microlinkhq)
