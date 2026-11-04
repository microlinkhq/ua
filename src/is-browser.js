'use strict'

const MAX_USER_AGENT_LENGTH = 512

const SHAPE = /^Mozilla\/5\.0 \(([^()]+)\) (.+)$/

const PLATFORMS = {
  windows: /^Windows NT (?:10\.0|6\.[1-3])(?:; (?:Win64; x64|WOW64))?$/,
  mac: /^Macintosh; Intel Mac OS X 10_(?:[0-9]|1[0-5])(?:_\d+)?$/,
  firefoxMac: /^Macintosh; Intel Mac OS X 10\.(?:[0-9]|1[0-5])$/,
  linux: /^X11; Linux (?:x86_64|aarch64|i686)$/,
  firefoxDistroLinux: /^X11; (?:Ubuntu|Fedora); Linux (?:x86_64|aarch64|i686)$/,
  chromeos: /^X11; CrOS (?:x86_64|aarch64) \d+(?:\.\d+)+$/,
  android: /^Linux; (?:U; )?Android \d{1,2}(?:\.\d+)*(?:; [^;]+)*$/,
  firefoxAndroid: /^Android \d{1,2}(?:\.\d+)*; (?:Mobile|Tablet)$/,
  ios: /^(?:iPhone; CPU iPhone OS|iPad; CPU OS) \d+(?:_\d+)* like Mac OS X$/
}

const ANDROID_WEBVIEW_MARKER = '; wv'

const VERSION = String.raw`\d+(?:\.\d+)*`
const CHROMIUM_BUILD = String.raw`\d+\.\d+\.\d+\.\d+`
const IOS_BUILD = String.raw`Mobile\/[0-9A-Z]+`

const CHROMIUM_VENDOR = '(?:Edg|EdgA|EdgiOS|CriOS)'
const VENDOR =
  '(?:YaBrowser|Yowser|SamsungBrowser|HuaweiBrowser|CocCocBrowser|coc_coc_browser|UCBrowser|VivoBrowser|DuckDuckGo|Ddg|FxiOS|Focus)'

const TOKEN = String.raw`(?:Mobile|Version\/${VERSION}|SA\/\d+|XiaoMi\/MiuiBrowser\/[\w.-]+|OPR\/${CHROMIUM_BUILD}(?: \(Edition [\w -]+\))?|${CHROMIUM_VENDOR}\/${CHROMIUM_BUILD}|${VENDOR}\/${VERSION})`

const MAJOR_VERSION = String.raw`[1-9]\d{1,2}`
const CHROME_VERSION = String.raw`${MAJOR_VERSION}\.\d+\.\d+\.\d+`

const BLINK = new RegExp(
  String.raw`^AppleWebKit\/537\.36 \(KHTML, like Gecko\)(?: ${TOKEN})* Chrome\/${CHROME_VERSION}(?: ${TOKEN})* Safari\/537\.36(?: ${TOKEN})*$`
)

const MAC_SAFARI = new RegExp(
  String.raw`^AppleWebKit\/605\.1\.15 \(KHTML, like Gecko\) Version\/${VERSION} Safari\/605\.1\.15(?: ${TOKEN})*$`
)

const IOS_WEBKIT = new RegExp(
  String.raw`^AppleWebKit\/605\.1\.15 \(KHTML, like Gecko\)(?: ${TOKEN})* ${IOS_BUILD} Safari\/(?:604\.1|605\.1\.15)(?: ${TOKEN})*$`
)

const FIREFOX_PLATFORM = new RegExp(
  String.raw`^(.+); rv:(${MAJOR_VERSION})\.0$`
)
const GECKO = new RegExp(
  String.raw`^Gecko\/(20100101|${MAJOR_VERSION}\.0) Firefox\/(${MAJOR_VERSION})\.0$`
)
const GECKO_DESKTOP_BUILD = '20100101'
const FROZEN_GECKO_RV = 109
const FROZEN_GECKO_RV_RANGE = [110, 119]

const BLINK_PLATFORMS = ['windows', 'mac', 'linux', 'chromeos', 'android']

const desktopGeckoToken = () => GECKO_DESKTOP_BUILD
const mobileGeckoToken = version => `${version}.0`

const GECKO_TOKEN_BY_PLATFORM = {
  windows: desktopGeckoToken,
  firefoxMac: desktopGeckoToken,
  linux: desktopGeckoToken,
  firefoxDistroLinux: desktopGeckoToken,
  firefoxAndroid: mobileGeckoToken
}

const platformOf = platform => {
  if (platform.includes(ANDROID_WEBVIEW_MARKER)) return undefined
  return Object.keys(PLATFORMS).find(name => PLATFORMS[name].test(platform))
}

const isFrozenGeckoRevision = (revision, version) =>
  revision === FROZEN_GECKO_RV &&
  version >= FROZEN_GECKO_RV_RANGE[0] &&
  version <= FROZEN_GECKO_RV_RANGE[1]

const isFirefox = (platformWithRevision, engine) => {
  const platformMatch = FIREFOX_PLATFORM.exec(platformWithRevision)
  const engineMatch = GECKO.exec(engine)
  if (!platformMatch || !engineMatch) return false
  const [, platform, revisionToken] = platformMatch
  const [, geckoToken, versionToken] = engineMatch
  const revision = Number(revisionToken)
  const version = Number(versionToken)
  const hasRealRevision =
    revision === version || isFrozenGeckoRevision(revision, version)
  const expectedGeckoToken = GECKO_TOKEN_BY_PLATFORM[platformOf(platform)]
  return (
    hasRealRevision &&
    expectedGeckoToken !== undefined &&
    geckoToken === expectedGeckoToken(version)
  )
}

const isWebKitFamily = (platform, engine) => {
  const name = platformOf(platform)
  if (BLINK.test(engine)) return BLINK_PLATFORMS.includes(name)
  if (name === 'mac') return MAC_SAFARI.test(engine)
  if (name === 'ios') return IOS_WEBKIT.test(engine)
  return false
}

const isBrowser = userAgent => {
  if (typeof userAgent !== 'string') return false
  if (userAgent.length > MAX_USER_AGENT_LENGTH) return false
  const match = SHAPE.exec(userAgent)
  if (!match) return false
  const [, platform, engine] = match
  return isWebKitFamily(platform, engine) || isFirefox(platform, engine)
}

module.exports = isBrowser
