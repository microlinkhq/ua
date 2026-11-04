'use strict'

const test = require('ava')

const { isBrowser } = require('..')

const BROWSERS = {
  'chrome windows':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
  'chrome windows unreduced version':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.34 Safari/537.36',
  'chrome macos':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
  'chrome macos before the platform freeze':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
  'chrome linux':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
  'chrome android':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36',
  'samsung internet':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36',
  'huawei browser':
    'Mozilla/5.0 (Linux; Android 10; HarmonyOS; HLK-AL00; HMSCore 6.10.0.312) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.93 HuaweiBrowser/11.1.2.332 Mobile Safari/537.36',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.0.0',
  opera:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 OPR/136.0.0.0 (Edition std-2)',
  'yandex browser':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 YaBrowser/26.10.0.0 Safari/537.36',
  'safari macos':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
  'safari iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  'chrome iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/156.0.7827.55 Mobile/15E148 Safari/604.1',
  'duckduckgo iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1 Ddg/18.5',
  'firefox windows':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0',
  'firefox macos':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0',
  'firefox with frozen rv:109':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
  'firefox android':
    'Mozilla/5.0 (Android 14; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0',
  'chrome chromeos':
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
  'chrome linux arm':
    'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
  'safari ipad':
    'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  'edge android':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36 EdgA/156.0.0.0',
  'duckduckgo android':
    'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile DuckDuckGo/5 Safari/537.36',
  'miui browser':
    'Mozilla/5.0 (Linux; U; Android 12; zh-cn; M2012K11AC Build/SKQ1.211006.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.127 Mobile Safari/537.36 XiaoMi/MiuiBrowser/17.2.99',
  'firefox focus':
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Focus/124.0 Chrome/124.0.0.0 Mobile Safari/537.36',
  'firefox linux':
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0',
  'firefox fedora':
    'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
  'yandex browser android':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.2.86.00 SA/3 Mobile Safari/537.36',
  'uc browser':
    'Mozilla/5.0 (Linux; U; Android 10; en-US; RMX2030 Build/QKQ1.200209.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.108 UCBrowser/13.4.0.1306 Mobile Safari/537.36',
  'opera campaign edition':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 OPR/112.0.0.0 (Edition Campaign 34)',
  'yandex browser with yowser':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 YaBrowser/24.4.0.0 Yowser/2.5 Safari/537.36',
  'firefox on the first frozen rv version':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
  'firefox tablet':
    'Mozilla/5.0 (Android 14; Tablet; rv:145.0) Gecko/145.0 Firefox/145.0',
  'safari with the duckduckgo token on macos':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15 Ddg/26.0',
  'firefox iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/140.1 Mobile/15E148 Safari/605.1.15',
  'edge iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/131.0.2903.145 Version/18.0 Mobile/15E148 Safari/604.1',
  'coc coc android token':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 CocCocBrowser/123.0.123 Safari/537.36',
  'vivo browser':
    'Mozilla/5.0 (Linux; Android 12; V2111) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/123.0.6312.118 Mobile Safari/537.36 VivoBrowser/15.0.0.0',
  'chrome 32-bit on 64-bit windows':
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
  'firefox windows 7':
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
  'firefox windows without architecture':
    'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0',
  'firefox linux 32-bit':
    'Mozilla/5.0 (X11; Linux i686; rv:138.0) Gecko/20100101 Firefox/138.0',
  'chrome arm chromebook':
    'Mozilla/5.0 (X11; CrOS aarch64 15359.58.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
  'coc coc desktop':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/130.0.264 Chrome/124.0.6367.264 Safari/537.36'
}

const NOT_BROWSERS = {
  'issue #60: no browser at all': 'Event-Admin/1.0 (thumbnail)',
  'issue #60: two-part chrome version':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'issue #60: one-part chrome version without KHTML':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
  'issue #60: chrome without KHTML':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
  'issue #60: chrome reporting the real macos version':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
  'issue #60: truncated webkit':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)',
  'electron app':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) BykreatorWorkstation/1.4.3 Chrome/126.0.6478.234 Electron/31.7.7 Safari/537.36',
  'obs embedded browser':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.120 OBS/32.2.2 Safari/537.36',
  'truncated safari build':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.3',
  'bare platform': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'ios webview without safari':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  'safari reporting the real macos version':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  'firefox reporting the real macos version':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:133.0) Gecko/20100101 Firefox/133.0',
  'firefox with rv:109 after the freeze ended':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'firefox with mismatched rv':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/145.0',
  'internet explorer':
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
  'chrome with a trailing word':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 FlexCDN',
  'old mozilla prefix': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)',
  dalvik: 'Dalvik/2.1.0 (Linux; U; Android 14; SM-S911N Build/UP1A.231005.007)',
  dart: 'Dart/3.8 (dart:io)',
  'android webview':
    'Mozilla/5.0 (Linux; Android 17; SM-S948W Build/CP2A.260605.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/156.0.8078.47 Mobile Safari/537.36',
  'google app on iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/411.0.879111500 Mobile/15E148 Safari/604.1',
  'made-up platform':
    'Mozilla/5.0 (lol) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1.2.3.4 Safari/537.36',
  'http library appended to chrome':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 python-requests/2.31.0',
  'electron app without the electron token':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) BykreatorWorkstation/1.4.3 Chrome/126.0.6478.234 Safari/537.36',
  'unknown trailing token':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 FlexCDN/1.0',
  'chrome version that does not exist':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99999.0.0.0 Safari/537.36',
  'safari on windows':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'chrome engine on iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'mac version that does not exist':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_99_99) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'windows platform chrome never sends':
    'Mozilla/5.0 (Windows NT 10.0; Win32; x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'firefox with a made-up platform':
    'Mozilla/5.0 (x; rv:128.0) Gecko/20100101 Firefox/128.0',
  'firefox version zero':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:0.0) Gecko/20100101 Firefox/0.0',
  'firefox with a gecko token from another version':
    'Mozilla/5.0 (Android 14; Mobile; rv:145.0) Gecko/119.0 Firefox/145.0',
  'firefox with a made-up gecko build':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100102 Firefox/145.0',
  'chrome major version with a leading zero':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/01.0.0.0 Safari/537.36',
  'android version that does not exist':
    'Mozilla/5.0 (Linux; Android 999; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'windows version chrome never sends':
    'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'chrome with the firefox macos separator':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'firefox with the chrome macos separator':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:145.0) Gecko/20100101 Firefox/145.0',
  'desktop firefox with the android gecko token':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/145.0 Firefox/145.0',
  'android firefox with the desktop gecko build':
    'Mozilla/5.0 (Android 14; Mobile; rv:145.0) Gecko/20100101 Firefox/145.0',
  'firefox with an rv near the frozen one':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/115.0',
  'gecko engine on iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X; rv:145.0) Gecko/20100101 Firefox/145.0',
  'truncated safari build on macos':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/6',
  'safari with empty versions':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/. Safari/.',
  'safari on macos without version':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Safari/605.1.15',
  'safari on iphone without the mobile build':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Safari/604.1',
  'iphone with a made-up mobile build':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/curl Safari/604.1',
  'vendor token without a version':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/.',
  'chrome on a firefox-only linux platform':
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'chromeos with a made-up build':
    'Mozilla/5.0 (X11; CrOS lol .) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'macos version after the freeze':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_16) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'firefox with rv:109 one version after the freeze':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
  'firefox android with a made-up form factor':
    'Mozilla/5.0 (Android 14; Phone; rv:145.0) Gecko/145.0 Firefox/145.0',
  'firefox on an unknown distro':
    'Mozilla/5.0 (X11; Arch; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0',
  'electron without any vendor':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.243 Electron/30.1.0 Safari/537.36',
  'chrome iphone with a short version':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124 Mobile/15E148 Safari/604.1',
  'opera with a short version':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110',
  'edge with a short version':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124',
  'ios build inside a blink user agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile/15E148 Safari/537.36',
  'opera edition after another vendor':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0 (Edition python requests)',
  'macos version with too many parts':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'chrome on 32-bit arm linux':
    'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'http library prepended to chrome':
    'python-requests/2.31.0 Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'http library appended to safari on macos':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15 python-requests/2.31.0',
  'http library appended to safari on iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1 python-requests/2.31.0',
  'http library appended to firefox':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0 python-requests/2.31.0',
  'firefox reporting a macos version after the freeze':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.99; rv:145.0) Gecko/20100101 Firefox/145.0',
  'truncated safari build on iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/6',
  'safari build without patch on iphone':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604',
  'windows without the architecture pair':
    'Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'truncated blink webkit version':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.3 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'truncated webkit version on macos safari':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'iphone with a made-up os version':
    'Mozilla/5.0 (iPhone; CPU iPhone OS lol like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  'android with a made-up prefix':
    'Mozilla/5.0 (Linux; X; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'chromeos with a made-up architecture':
    'Mozilla/5.0 (X11; CrOS riscv64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'firefox with rv:109 before the freeze':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/105.0',
  'yandex token carrying a library':
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.2.86.00 SA/curl Mobile Safari/537.36',
  'miui token carrying a library':
    'Mozilla/5.0 (Linux; U; Android 12; zh-cn; M2012K11AC Build/SKQ1.211006.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.4896.127 Mobile Safari/537.36 XiaoMi/MiuiBrowser/curl/8.0',
  'firefox android on a made-up tv form factor':
    'Mozilla/5.0 (Android 14; TV; rv:145.0) Gecko/145.0 Firefox/145.0',
  'chrome with a four-digit major version':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1000.0.0.0 Safari/537.36',
  'browser-shaped crawler':
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.7390.122 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
}

for (const [name, userAgent] of Object.entries(BROWSERS)) {
  test(`accepts ${name}`, t => t.true(isBrowser(userAgent)))
}

for (const [name, userAgent] of Object.entries(NOT_BROWSERS)) {
  test(`rejects ${name}`, t => t.false(isBrowser(userAgent)))
}

const androidWithModelOfLength = length => {
  const prefix = 'Mozilla/5.0 (Linux; Android 14; '
  const suffix =
    ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36'
  return prefix + 'K'.repeat(length - prefix.length - suffix.length) + suffix
}

test('accepts a user agent exactly at the length cap', t => {
  t.true(isBrowser(androidWithModelOfLength(512)))
  t.false(isBrowser(androidWithModelOfLength(513)))
})

test('rejects oversized input before matching', t => {
  const padded = BROWSERS['chrome windows'].replace(
    'Safari/537.36',
    `${'Mobile '.repeat(80)}Safari/537.36`
  )
  t.true(padded.length > 512)
  t.false(isBrowser(padded))
})

test('rejects non-string input', t => {
  for (const value of [undefined, null, '', 0, NaN, false, {}, []]) {
    t.false(isBrowser(value))
  }
})
