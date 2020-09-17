(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('path'), require('crypto'), require('perf_hooks'), require('events'), require('http'), require('os'), require('stream'), require('url'), require('https'), require('zlib'), require('net'), require('tls'), require('assert'), require('tty'), require('util')) :
	typeof define === 'function' && define.amd ? define(['path', 'crypto', 'perf_hooks', 'events', 'http', 'os', 'stream', 'url', 'https', 'zlib', 'net', 'tls', 'assert', 'tty', 'util'], factory) :
	(global = global || self, global.logary = factory(global.path, global.crypto$1, global.perf_hooks, global.events$1, global.http$1, global.os, global.Stream, global.Url, global.https, global.zlib, global.net, global.tls, global.assert, global.tty, global.util));
}(this, (function (path, crypto$1, perf_hooks, events$1, http$1, os, Stream, Url, https, zlib, net, tls, assert, tty, util) { 'use strict';

	path = path && Object.prototype.hasOwnProperty.call(path, 'default') ? path['default'] : path;
	crypto$1 = crypto$1 && Object.prototype.hasOwnProperty.call(crypto$1, 'default') ? crypto$1['default'] : crypto$1;
	perf_hooks = perf_hooks && Object.prototype.hasOwnProperty.call(perf_hooks, 'default') ? perf_hooks['default'] : perf_hooks;
	events$1 = events$1 && Object.prototype.hasOwnProperty.call(events$1, 'default') ? events$1['default'] : events$1;
	http$1 = http$1 && Object.prototype.hasOwnProperty.call(http$1, 'default') ? http$1['default'] : http$1;
	os = os && Object.prototype.hasOwnProperty.call(os, 'default') ? os['default'] : os;
	Stream = Stream && Object.prototype.hasOwnProperty.call(Stream, 'default') ? Stream['default'] : Stream;
	Url = Url && Object.prototype.hasOwnProperty.call(Url, 'default') ? Url['default'] : Url;
	https = https && Object.prototype.hasOwnProperty.call(https, 'default') ? https['default'] : https;
	zlib = zlib && Object.prototype.hasOwnProperty.call(zlib, 'default') ? zlib['default'] : zlib;
	net = net && Object.prototype.hasOwnProperty.call(net, 'default') ? net['default'] : net;
	tls = tls && Object.prototype.hasOwnProperty.call(tls, 'default') ? tls['default'] : tls;
	assert = assert && Object.prototype.hasOwnProperty.call(assert, 'default') ? assert['default'] : assert;
	tty = tty && Object.prototype.hasOwnProperty.call(tty, 'default') ? tty['default'] : tty;
	util = util && Object.prototype.hasOwnProperty.call(util, 'default') ? util['default'] : util;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
	}

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	function getCjsExportFromNamespace (n) {
		return n && n['default'] || n;
	}

	var types = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LogLevel = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var LogLevel;
	(function (LogLevel) {
	    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
	    LogLevel[LogLevel["WARN"] = 1] = "WARN";
	    LogLevel[LogLevel["INFO"] = 2] = "INFO";
	    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
	})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

	});

	unwrapExports(types);
	var types_1 = types.LogLevel;

	// Note: this is the semver.org version of the spec that it implements
	// Not necessarily the package version of this code.
	const SEMVER_SPEC_VERSION = '2.0.0';

	const MAX_LENGTH = 256;
	const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
	  /* istanbul ignore next */ 9007199254740991;

	// Max safe segment length for coercion.
	const MAX_SAFE_COMPONENT_LENGTH = 16;

	var constants = {
	  SEMVER_SPEC_VERSION,
	  MAX_LENGTH,
	  MAX_SAFE_INTEGER,
	  MAX_SAFE_COMPONENT_LENGTH
	};

	const debug = (
	  typeof process === 'object' &&
	  process.env &&
	  process.env.NODE_DEBUG &&
	  /\bsemver\b/i.test(process.env.NODE_DEBUG)
	) ? (...args) => console.error('SEMVER', ...args)
	  : () => {};

	var debug_1 = debug;

	var re_1 = createCommonjsModule(function (module, exports) {
	const { MAX_SAFE_COMPONENT_LENGTH } = constants;

	exports = module.exports = {};

	// The actual regexps go on exports.re
	const re = exports.re = [];
	const src = exports.src = [];
	const t = exports.t = {};
	let R = 0;

	const createToken = (name, value, isGlobal) => {
	  const index = R++;
	  debug_1(index, value);
	  t[name] = index;
	  src[index] = value;
	  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
	};

	// The following Regular Expressions can be used for tokenizing,
	// validating, and parsing SemVer version strings.

	// ## Numeric Identifier
	// A single `0`, or a non-zero digit followed by zero or more digits.

	createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
	createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+');

	// ## Non-numeric Identifier
	// Zero or more digits, followed by a letter or hyphen, and then zero or
	// more letters, digits, or hyphens.

	createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*');

	// ## Main Version
	// Three dot-separated numeric identifiers.

	createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
	                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
	                   `(${src[t.NUMERICIDENTIFIER]})`);

	createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
	                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
	                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

	// ## Pre-release Version Identifier
	// A numeric identifier, or a non-numeric identifier.

	createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`);

	createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`);

	// ## Pre-release Version
	// Hyphen, followed by one or more dot-separated pre-release version
	// identifiers.

	createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

	createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

	// ## Build Metadata Identifier
	// Any combination of digits, letters, or hyphens.

	createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+');

	// ## Build Metadata
	// Plus sign, followed by one or more period-separated build metadata
	// identifiers.

	createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

	// ## Full Version String
	// A main version, followed optionally by a pre-release version and
	// build metadata.

	// Note that the only major, minor, patch, and pre-release sections of
	// the version string are capturing groups.  The build metadata is not a
	// capturing group, because it should not ever be used in version
	// comparison.

	createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`);

	createToken('FULL', `^${src[t.FULLPLAIN]}$`);

	// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
	// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
	// common in the npm registry.
	createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`);

	createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

	createToken('GTLT', '((?:<|>)?=?)');

	// Something like "2.*" or "1.2.x".
	// Note that "x.x" is a valid xRange identifer, meaning "any version"
	// Only the first item is strictly required.
	createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
	createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

	createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
	                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
	                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
	                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
	                   `)?)?`);

	createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
	                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
	                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
	                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
	                        `)?)?`);

	createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
	createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

	// Coercion.
	// Extract anything that could conceivably be a part of a valid semver
	createToken('COERCE', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
	              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
	              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
	              `(?:$|[^\\d])`);
	createToken('COERCERTL', src[t.COERCE], true);

	// Tilde ranges.
	// Meaning is "reasonably at or greater than"
	createToken('LONETILDE', '(?:~>?)');

	createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
	exports.tildeTrimReplace = '$1~';

	createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
	createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

	// Caret ranges.
	// Meaning is "at least and backwards compatible with"
	createToken('LONECARET', '(?:\\^)');

	createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
	exports.caretTrimReplace = '$1^';

	createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
	createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

	// A simple gt/lt/eq thing, or just "" to indicate "any version"
	createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
	createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

	// An expression to strip any whitespace between the gtlt and the thing
	// it modifies, so that `> 1.2.3` ==> `>1.2.3`
	createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
	exports.comparatorTrimReplace = '$1$2$3';

	// Something like `1.2.3 - 1.2.4`
	// Note that these all use the loose form, because they'll be
	// checked against either the strict or loose comparator form
	// later.
	createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
	                   `\\s+-\\s+` +
	                   `(${src[t.XRANGEPLAIN]})` +
	                   `\\s*$`);

	createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
	                        `\\s+-\\s+` +
	                        `(${src[t.XRANGEPLAINLOOSE]})` +
	                        `\\s*$`);

	// Star ranges basically just allow anything at all.
	createToken('STAR', '(<|>)?=?\\s*\\*');
	// >=0.0.0 is like a star
	createToken('GTE0', '^\\s*>=\\s*0\.0\.0\\s*$');
	createToken('GTE0PRE', '^\\s*>=\\s*0\.0\.0-0\\s*$');
	});
	var re_2 = re_1.re;
	var re_3 = re_1.src;
	var re_4 = re_1.t;
	var re_5 = re_1.tildeTrimReplace;
	var re_6 = re_1.caretTrimReplace;
	var re_7 = re_1.comparatorTrimReplace;

	const numeric = /^[0-9]+$/;
	const compareIdentifiers = (a, b) => {
	  const anum = numeric.test(a);
	  const bnum = numeric.test(b);

	  if (anum && bnum) {
	    a = +a;
	    b = +b;
	  }

	  return a === b ? 0
	    : (anum && !bnum) ? -1
	    : (bnum && !anum) ? 1
	    : a < b ? -1
	    : 1
	};

	const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);

	var identifiers = {
	  compareIdentifiers,
	  rcompareIdentifiers
	};

	const { MAX_LENGTH: MAX_LENGTH$1, MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1 } = constants;
	const { re, t } = re_1;

	const { compareIdentifiers: compareIdentifiers$1 } = identifiers;
	class SemVer {
	  constructor (version, options) {
	    if (!options || typeof options !== 'object') {
	      options = {
	        loose: !!options,
	        includePrerelease: false
	      };
	    }
	    if (version instanceof SemVer) {
	      if (version.loose === !!options.loose &&
	          version.includePrerelease === !!options.includePrerelease) {
	        return version
	      } else {
	        version = version.version;
	      }
	    } else if (typeof version !== 'string') {
	      throw new TypeError(`Invalid Version: ${version}`)
	    }

	    if (version.length > MAX_LENGTH$1) {
	      throw new TypeError(
	        `version is longer than ${MAX_LENGTH$1} characters`
	      )
	    }

	    debug_1('SemVer', version, options);
	    this.options = options;
	    this.loose = !!options.loose;
	    // this isn't actually relevant for versions, but keep it so that we
	    // don't run into trouble passing this.options around.
	    this.includePrerelease = !!options.includePrerelease;

	    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);

	    if (!m) {
	      throw new TypeError(`Invalid Version: ${version}`)
	    }

	    this.raw = version;

	    // these are actually numbers
	    this.major = +m[1];
	    this.minor = +m[2];
	    this.patch = +m[3];

	    if (this.major > MAX_SAFE_INTEGER$1 || this.major < 0) {
	      throw new TypeError('Invalid major version')
	    }

	    if (this.minor > MAX_SAFE_INTEGER$1 || this.minor < 0) {
	      throw new TypeError('Invalid minor version')
	    }

	    if (this.patch > MAX_SAFE_INTEGER$1 || this.patch < 0) {
	      throw new TypeError('Invalid patch version')
	    }

	    // numberify any prerelease numeric ids
	    if (!m[4]) {
	      this.prerelease = [];
	    } else {
	      this.prerelease = m[4].split('.').map((id) => {
	        if (/^[0-9]+$/.test(id)) {
	          const num = +id;
	          if (num >= 0 && num < MAX_SAFE_INTEGER$1) {
	            return num
	          }
	        }
	        return id
	      });
	    }

	    this.build = m[5] ? m[5].split('.') : [];
	    this.format();
	  }

	  format () {
	    this.version = `${this.major}.${this.minor}.${this.patch}`;
	    if (this.prerelease.length) {
	      this.version += `-${this.prerelease.join('.')}`;
	    }
	    return this.version
	  }

	  toString () {
	    return this.version
	  }

	  compare (other) {
	    debug_1('SemVer.compare', this.version, this.options, other);
	    if (!(other instanceof SemVer)) {
	      if (typeof other === 'string' && other === this.version) {
	        return 0
	      }
	      other = new SemVer(other, this.options);
	    }

	    if (other.version === this.version) {
	      return 0
	    }

	    return this.compareMain(other) || this.comparePre(other)
	  }

	  compareMain (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    return (
	      compareIdentifiers$1(this.major, other.major) ||
	      compareIdentifiers$1(this.minor, other.minor) ||
	      compareIdentifiers$1(this.patch, other.patch)
	    )
	  }

	  comparePre (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    // NOT having a prerelease is > having one
	    if (this.prerelease.length && !other.prerelease.length) {
	      return -1
	    } else if (!this.prerelease.length && other.prerelease.length) {
	      return 1
	    } else if (!this.prerelease.length && !other.prerelease.length) {
	      return 0
	    }

	    let i = 0;
	    do {
	      const a = this.prerelease[i];
	      const b = other.prerelease[i];
	      debug_1('prerelease compare', i, a, b);
	      if (a === undefined && b === undefined) {
	        return 0
	      } else if (b === undefined) {
	        return 1
	      } else if (a === undefined) {
	        return -1
	      } else if (a === b) {
	        continue
	      } else {
	        return compareIdentifiers$1(a, b)
	      }
	    } while (++i)
	  }

	  compareBuild (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    let i = 0;
	    do {
	      const a = this.build[i];
	      const b = other.build[i];
	      debug_1('prerelease compare', i, a, b);
	      if (a === undefined && b === undefined) {
	        return 0
	      } else if (b === undefined) {
	        return 1
	      } else if (a === undefined) {
	        return -1
	      } else if (a === b) {
	        continue
	      } else {
	        return compareIdentifiers$1(a, b)
	      }
	    } while (++i)
	  }

	  // preminor will bump the version up to the next minor release, and immediately
	  // down to pre-release. premajor and prepatch work the same way.
	  inc (release, identifier) {
	    switch (release) {
	      case 'premajor':
	        this.prerelease.length = 0;
	        this.patch = 0;
	        this.minor = 0;
	        this.major++;
	        this.inc('pre', identifier);
	        break
	      case 'preminor':
	        this.prerelease.length = 0;
	        this.patch = 0;
	        this.minor++;
	        this.inc('pre', identifier);
	        break
	      case 'prepatch':
	        // If this is already a prerelease, it will bump to the next version
	        // drop any prereleases that might already exist, since they are not
	        // relevant at this point.
	        this.prerelease.length = 0;
	        this.inc('patch', identifier);
	        this.inc('pre', identifier);
	        break
	      // If the input is a non-prerelease version, this acts the same as
	      // prepatch.
	      case 'prerelease':
	        if (this.prerelease.length === 0) {
	          this.inc('patch', identifier);
	        }
	        this.inc('pre', identifier);
	        break

	      case 'major':
	        // If this is a pre-major version, bump up to the same major version.
	        // Otherwise increment major.
	        // 1.0.0-5 bumps to 1.0.0
	        // 1.1.0 bumps to 2.0.0
	        if (
	          this.minor !== 0 ||
	          this.patch !== 0 ||
	          this.prerelease.length === 0
	        ) {
	          this.major++;
	        }
	        this.minor = 0;
	        this.patch = 0;
	        this.prerelease = [];
	        break
	      case 'minor':
	        // If this is a pre-minor version, bump up to the same minor version.
	        // Otherwise increment minor.
	        // 1.2.0-5 bumps to 1.2.0
	        // 1.2.1 bumps to 1.3.0
	        if (this.patch !== 0 || this.prerelease.length === 0) {
	          this.minor++;
	        }
	        this.patch = 0;
	        this.prerelease = [];
	        break
	      case 'patch':
	        // If this is not a pre-release version, it will increment the patch.
	        // If it is a pre-release it will bump up to the same patch version.
	        // 1.2.0-5 patches to 1.2.0
	        // 1.2.0 patches to 1.2.1
	        if (this.prerelease.length === 0) {
	          this.patch++;
	        }
	        this.prerelease = [];
	        break
	      // This probably shouldn't be used publicly.
	      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
	      case 'pre':
	        if (this.prerelease.length === 0) {
	          this.prerelease = [0];
	        } else {
	          let i = this.prerelease.length;
	          while (--i >= 0) {
	            if (typeof this.prerelease[i] === 'number') {
	              this.prerelease[i]++;
	              i = -2;
	            }
	          }
	          if (i === -1) {
	            // didn't increment anything
	            this.prerelease.push(0);
	          }
	        }
	        if (identifier) {
	          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
	          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
	          if (this.prerelease[0] === identifier) {
	            if (isNaN(this.prerelease[1])) {
	              this.prerelease = [identifier, 0];
	            }
	          } else {
	            this.prerelease = [identifier, 0];
	          }
	        }
	        break

	      default:
	        throw new Error(`invalid increment argument: ${release}`)
	    }
	    this.format();
	    this.raw = this.version;
	    return this
	  }
	}

	var semver = SemVer;

	const {MAX_LENGTH: MAX_LENGTH$2} = constants;
	const { re: re$1, t: t$1 } = re_1;


	const parse = (version, options) => {
	  if (!options || typeof options !== 'object') {
	    options = {
	      loose: !!options,
	      includePrerelease: false
	    };
	  }

	  if (version instanceof semver) {
	    return version
	  }

	  if (typeof version !== 'string') {
	    return null
	  }

	  if (version.length > MAX_LENGTH$2) {
	    return null
	  }

	  const r = options.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL];
	  if (!r.test(version)) {
	    return null
	  }

	  try {
	    return new semver(version, options)
	  } catch (er) {
	    return null
	  }
	};

	var parse_1 = parse;

	const valid = (version, options) => {
	  const v = parse_1(version, options);
	  return v ? v.version : null
	};
	var valid_1 = valid;

	const clean = (version, options) => {
	  const s = parse_1(version.trim().replace(/^[=v]+/, ''), options);
	  return s ? s.version : null
	};
	var clean_1 = clean;

	const inc = (version, release, options, identifier) => {
	  if (typeof (options) === 'string') {
	    identifier = options;
	    options = undefined;
	  }

	  try {
	    return new semver(version, options).inc(release, identifier).version
	  } catch (er) {
	    return null
	  }
	};
	var inc_1 = inc;

	const compare = (a, b, loose) =>
	  new semver(a, loose).compare(new semver(b, loose));

	var compare_1 = compare;

	const eq = (a, b, loose) => compare_1(a, b, loose) === 0;
	var eq_1 = eq;

	const diff = (version1, version2) => {
	  if (eq_1(version1, version2)) {
	    return null
	  } else {
	    const v1 = parse_1(version1);
	    const v2 = parse_1(version2);
	    const hasPre = v1.prerelease.length || v2.prerelease.length;
	    const prefix = hasPre ? 'pre' : '';
	    const defaultResult = hasPre ? 'prerelease' : '';
	    for (const key in v1) {
	      if (key === 'major' || key === 'minor' || key === 'patch') {
	        if (v1[key] !== v2[key]) {
	          return prefix + key
	        }
	      }
	    }
	    return defaultResult // may be undefined
	  }
	};
	var diff_1 = diff;

	const major = (a, loose) => new semver(a, loose).major;
	var major_1 = major;

	const minor = (a, loose) => new semver(a, loose).minor;
	var minor_1 = minor;

	const patch = (a, loose) => new semver(a, loose).patch;
	var patch_1 = patch;

	const prerelease = (version, options) => {
	  const parsed = parse_1(version, options);
	  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
	};
	var prerelease_1 = prerelease;

	const rcompare = (a, b, loose) => compare_1(b, a, loose);
	var rcompare_1 = rcompare;

	const compareLoose = (a, b) => compare_1(a, b, true);
	var compareLoose_1 = compareLoose;

	const compareBuild = (a, b, loose) => {
	  const versionA = new semver(a, loose);
	  const versionB = new semver(b, loose);
	  return versionA.compare(versionB) || versionA.compareBuild(versionB)
	};
	var compareBuild_1 = compareBuild;

	const sort = (list, loose) => list.sort((a, b) => compareBuild_1(a, b, loose));
	var sort_1 = sort;

	const rsort = (list, loose) => list.sort((a, b) => compareBuild_1(b, a, loose));
	var rsort_1 = rsort;

	const gt = (a, b, loose) => compare_1(a, b, loose) > 0;
	var gt_1 = gt;

	const lt = (a, b, loose) => compare_1(a, b, loose) < 0;
	var lt_1 = lt;

	const neq = (a, b, loose) => compare_1(a, b, loose) !== 0;
	var neq_1 = neq;

	const gte = (a, b, loose) => compare_1(a, b, loose) >= 0;
	var gte_1 = gte;

	const lte = (a, b, loose) => compare_1(a, b, loose) <= 0;
	var lte_1 = lte;

	const cmp = (a, op, b, loose) => {
	  switch (op) {
	    case '===':
	      if (typeof a === 'object')
	        a = a.version;
	      if (typeof b === 'object')
	        b = b.version;
	      return a === b

	    case '!==':
	      if (typeof a === 'object')
	        a = a.version;
	      if (typeof b === 'object')
	        b = b.version;
	      return a !== b

	    case '':
	    case '=':
	    case '==':
	      return eq_1(a, b, loose)

	    case '!=':
	      return neq_1(a, b, loose)

	    case '>':
	      return gt_1(a, b, loose)

	    case '>=':
	      return gte_1(a, b, loose)

	    case '<':
	      return lt_1(a, b, loose)

	    case '<=':
	      return lte_1(a, b, loose)

	    default:
	      throw new TypeError(`Invalid operator: ${op}`)
	  }
	};
	var cmp_1 = cmp;

	const {re: re$2, t: t$2} = re_1;

	const coerce = (version, options) => {
	  if (version instanceof semver) {
	    return version
	  }

	  if (typeof version === 'number') {
	    version = String(version);
	  }

	  if (typeof version !== 'string') {
	    return null
	  }

	  options = options || {};

	  let match = null;
	  if (!options.rtl) {
	    match = version.match(re$2[t$2.COERCE]);
	  } else {
	    // Find the right-most coercible string that does not share
	    // a terminus with a more left-ward coercible string.
	    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
	    //
	    // Walk through the string checking with a /g regexp
	    // Manually set the index so as to pick up overlapping matches.
	    // Stop when we get a match that ends at the string end, since no
	    // coercible string can be more right-ward without the same terminus.
	    let next;
	    while ((next = re$2[t$2.COERCERTL].exec(version)) &&
	        (!match || match.index + match[0].length !== version.length)
	    ) {
	      if (!match ||
	            next.index + next[0].length !== match.index + match[0].length) {
	        match = next;
	      }
	      re$2[t$2.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
	    }
	    // leave it in a clean state
	    re$2[t$2.COERCERTL].lastIndex = -1;
	  }

	  if (match === null)
	    return null

	  return parse_1(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
	};
	var coerce_1 = coerce;

	// hoisted class for cyclic dependency
	class Range {
	  constructor (range, options) {
	    if (!options || typeof options !== 'object') {
	      options = {
	        loose: !!options,
	        includePrerelease: false
	      };
	    }

	    if (range instanceof Range) {
	      if (
	        range.loose === !!options.loose &&
	        range.includePrerelease === !!options.includePrerelease
	      ) {
	        return range
	      } else {
	        return new Range(range.raw, options)
	      }
	    }

	    if (range instanceof comparator) {
	      // just put it in the set and return
	      this.raw = range.value;
	      this.set = [[range]];
	      this.format();
	      return this
	    }

	    this.options = options;
	    this.loose = !!options.loose;
	    this.includePrerelease = !!options.includePrerelease;

	    // First, split based on boolean or ||
	    this.raw = range;
	    this.set = range
	      .split(/\s*\|\|\s*/)
	      // map the range to a 2d array of comparators
	      .map(range => this.parseRange(range.trim()))
	      // throw out any comparator lists that are empty
	      // this generally means that it was not a valid range, which is allowed
	      // in loose mode, but will still throw if the WHOLE range is invalid.
	      .filter(c => c.length);

	    if (!this.set.length) {
	      throw new TypeError(`Invalid SemVer Range: ${range}`)
	    }

	    this.format();
	  }

	  format () {
	    this.range = this.set
	      .map((comps) => {
	        return comps.join(' ').trim()
	      })
	      .join('||')
	      .trim();
	    return this.range
	  }

	  toString () {
	    return this.range
	  }

	  parseRange (range) {
	    const loose = this.options.loose;
	    range = range.trim();
	    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
	    const hr = loose ? re$3[t$3.HYPHENRANGELOOSE] : re$3[t$3.HYPHENRANGE];
	    range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
	    debug_1('hyphen replace', range);
	    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
	    range = range.replace(re$3[t$3.COMPARATORTRIM], comparatorTrimReplace);
	    debug_1('comparator trim', range, re$3[t$3.COMPARATORTRIM]);

	    // `~ 1.2.3` => `~1.2.3`
	    range = range.replace(re$3[t$3.TILDETRIM], tildeTrimReplace);

	    // `^ 1.2.3` => `^1.2.3`
	    range = range.replace(re$3[t$3.CARETTRIM], caretTrimReplace);

	    // normalize spaces
	    range = range.split(/\s+/).join(' ');

	    // At this point, the range is completely trimmed and
	    // ready to be split into comparators.

	    const compRe = loose ? re$3[t$3.COMPARATORLOOSE] : re$3[t$3.COMPARATOR];
	    return range
	      .split(' ')
	      .map(comp => parseComparator(comp, this.options))
	      .join(' ')
	      .split(/\s+/)
	      .map(comp => replaceGTE0(comp, this.options))
	      // in loose mode, throw out any that are not valid comparators
	      .filter(this.options.loose ? comp => !!comp.match(compRe) : () => true)
	      .map(comp => new comparator(comp, this.options))
	  }

	  intersects (range, options) {
	    if (!(range instanceof Range)) {
	      throw new TypeError('a Range is required')
	    }

	    return this.set.some((thisComparators) => {
	      return (
	        isSatisfiable(thisComparators, options) &&
	        range.set.some((rangeComparators) => {
	          return (
	            isSatisfiable(rangeComparators, options) &&
	            thisComparators.every((thisComparator) => {
	              return rangeComparators.every((rangeComparator) => {
	                return thisComparator.intersects(rangeComparator, options)
	              })
	            })
	          )
	        })
	      )
	    })
	  }

	  // if ANY of the sets match ALL of its comparators, then pass
	  test (version) {
	    if (!version) {
	      return false
	    }

	    if (typeof version === 'string') {
	      try {
	        version = new semver(version, this.options);
	      } catch (er) {
	        return false
	      }
	    }

	    for (let i = 0; i < this.set.length; i++) {
	      if (testSet(this.set[i], version, this.options)) {
	        return true
	      }
	    }
	    return false
	  }
	}
	var range = Range;




	const {
	  re: re$3,
	  t: t$3,
	  comparatorTrimReplace,
	  tildeTrimReplace,
	  caretTrimReplace
	} = re_1;

	// take a set of comparators and determine whether there
	// exists a version which can satisfy it
	const isSatisfiable = (comparators, options) => {
	  let result = true;
	  const remainingComparators = comparators.slice();
	  let testComparator = remainingComparators.pop();

	  while (result && remainingComparators.length) {
	    result = remainingComparators.every((otherComparator) => {
	      return testComparator.intersects(otherComparator, options)
	    });

	    testComparator = remainingComparators.pop();
	  }

	  return result
	};

	// comprised of xranges, tildes, stars, and gtlt's at this point.
	// already replaced the hyphen ranges
	// turn into a set of JUST comparators.
	const parseComparator = (comp, options) => {
	  debug_1('comp', comp, options);
	  comp = replaceCarets(comp, options);
	  debug_1('caret', comp);
	  comp = replaceTildes(comp, options);
	  debug_1('tildes', comp);
	  comp = replaceXRanges(comp, options);
	  debug_1('xrange', comp);
	  comp = replaceStars(comp, options);
	  debug_1('stars', comp);
	  return comp
	};

	const isX = id => !id || id.toLowerCase() === 'x' || id === '*';

	// ~, ~> --> * (any, kinda silly)
	// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
	// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
	// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
	// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
	// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
	const replaceTildes = (comp, options) =>
	  comp.trim().split(/\s+/).map((comp) => {
	    return replaceTilde(comp, options)
	  }).join(' ');

	const replaceTilde = (comp, options) => {
	  const r = options.loose ? re$3[t$3.TILDELOOSE] : re$3[t$3.TILDE];
	  return comp.replace(r, (_, M, m, p, pr) => {
	    debug_1('tilde', comp, _, M, m, p, pr);
	    let ret;

	    if (isX(M)) {
	      ret = '';
	    } else if (isX(m)) {
	      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
	    } else if (isX(p)) {
	      // ~1.2 == >=1.2.0 <1.3.0-0
	      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
	    } else if (pr) {
	      debug_1('replaceTilde pr', pr);
	      ret = `>=${M}.${m}.${p}-${pr
      } <${M}.${+m + 1}.0-0`;
	    } else {
	      // ~1.2.3 == >=1.2.3 <1.3.0-0
	      ret = `>=${M}.${m}.${p
      } <${M}.${+m + 1}.0-0`;
	    }

	    debug_1('tilde return', ret);
	    return ret
	  })
	};

	// ^ --> * (any, kinda silly)
	// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
	// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
	// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
	// ^1.2.3 --> >=1.2.3 <2.0.0-0
	// ^1.2.0 --> >=1.2.0 <2.0.0-0
	const replaceCarets = (comp, options) =>
	  comp.trim().split(/\s+/).map((comp) => {
	    return replaceCaret(comp, options)
	  }).join(' ');

	const replaceCaret = (comp, options) => {
	  debug_1('caret', comp, options);
	  const r = options.loose ? re$3[t$3.CARETLOOSE] : re$3[t$3.CARET];
	  const z = options.includePrerelease ? '-0' : '';
	  return comp.replace(r, (_, M, m, p, pr) => {
	    debug_1('caret', comp, _, M, m, p, pr);
	    let ret;

	    if (isX(M)) {
	      ret = '';
	    } else if (isX(m)) {
	      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
	    } else if (isX(p)) {
	      if (M === '0') {
	        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
	      } else {
	        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
	      }
	    } else if (pr) {
	      debug_1('replaceCaret pr', pr);
	      if (M === '0') {
	        if (m === '0') {
	          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${m}.${+p + 1}-0`;
	        } else {
	          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${+m + 1}.0-0`;
	        }
	      } else {
	        ret = `>=${M}.${m}.${p}-${pr
        } <${+M + 1}.0.0-0`;
	      }
	    } else {
	      debug_1('no pr');
	      if (M === '0') {
	        if (m === '0') {
	          ret = `>=${M}.${m}.${p
          }${z} <${M}.${m}.${+p + 1}-0`;
	        } else {
	          ret = `>=${M}.${m}.${p
          }${z} <${M}.${+m + 1}.0-0`;
	        }
	      } else {
	        ret = `>=${M}.${m}.${p
        } <${+M + 1}.0.0-0`;
	      }
	    }

	    debug_1('caret return', ret);
	    return ret
	  })
	};

	const replaceXRanges = (comp, options) => {
	  debug_1('replaceXRanges', comp, options);
	  return comp.split(/\s+/).map((comp) => {
	    return replaceXRange(comp, options)
	  }).join(' ')
	};

	const replaceXRange = (comp, options) => {
	  comp = comp.trim();
	  const r = options.loose ? re$3[t$3.XRANGELOOSE] : re$3[t$3.XRANGE];
	  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
	    debug_1('xRange', comp, ret, gtlt, M, m, p, pr);
	    const xM = isX(M);
	    const xm = xM || isX(m);
	    const xp = xm || isX(p);
	    const anyX = xp;

	    if (gtlt === '=' && anyX) {
	      gtlt = '';
	    }

	    // if we're including prereleases in the match, then we need
	    // to fix this to -0, the lowest possible prerelease value
	    pr = options.includePrerelease ? '-0' : '';

	    if (xM) {
	      if (gtlt === '>' || gtlt === '<') {
	        // nothing is allowed
	        ret = '<0.0.0-0';
	      } else {
	        // nothing is forbidden
	        ret = '*';
	      }
	    } else if (gtlt && anyX) {
	      // we know patch is an x, because we have any x at all.
	      // replace X with 0
	      if (xm) {
	        m = 0;
	      }
	      p = 0;

	      if (gtlt === '>') {
	        // >1 => >=2.0.0
	        // >1.2 => >=1.3.0
	        gtlt = '>=';
	        if (xm) {
	          M = +M + 1;
	          m = 0;
	          p = 0;
	        } else {
	          m = +m + 1;
	          p = 0;
	        }
	      } else if (gtlt === '<=') {
	        // <=0.7.x is actually <0.8.0, since any 0.7.x should
	        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
	        gtlt = '<';
	        if (xm) {
	          M = +M + 1;
	        } else {
	          m = +m + 1;
	        }
	      }

	      if (gtlt === '<')
	        pr = '-0';

	      ret = `${gtlt + M}.${m}.${p}${pr}`;
	    } else if (xm) {
	      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
	    } else if (xp) {
	      ret = `>=${M}.${m}.0${pr
      } <${M}.${+m + 1}.0-0`;
	    }

	    debug_1('xRange return', ret);

	    return ret
	  })
	};

	// Because * is AND-ed with everything else in the comparator,
	// and '' means "any version", just remove the *s entirely.
	const replaceStars = (comp, options) => {
	  debug_1('replaceStars', comp, options);
	  // Looseness is ignored here.  star is always as loose as it gets!
	  return comp.trim().replace(re$3[t$3.STAR], '')
	};

	const replaceGTE0 = (comp, options) => {
	  debug_1('replaceGTE0', comp, options);
	  return comp.trim()
	    .replace(re$3[options.includePrerelease ? t$3.GTE0PRE : t$3.GTE0], '')
	};

	// This function is passed to string.replace(re[t.HYPHENRANGE])
	// M, m, patch, prerelease, build
	// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
	// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
	// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
	const hyphenReplace = incPr => ($0,
	  from, fM, fm, fp, fpr, fb,
	  to, tM, tm, tp, tpr, tb) => {
	  if (isX(fM)) {
	    from = '';
	  } else if (isX(fm)) {
	    from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
	  } else if (isX(fp)) {
	    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
	  } else if (fpr) {
	    from = `>=${from}`;
	  } else {
	    from = `>=${from}${incPr ? '-0' : ''}`;
	  }

	  if (isX(tM)) {
	    to = '';
	  } else if (isX(tm)) {
	    to = `<${+tM + 1}.0.0-0`;
	  } else if (isX(tp)) {
	    to = `<${tM}.${+tm + 1}.0-0`;
	  } else if (tpr) {
	    to = `<=${tM}.${tm}.${tp}-${tpr}`;
	  } else if (incPr) {
	    to = `<${tM}.${tm}.${+tp + 1}-0`;
	  } else {
	    to = `<=${to}`;
	  }

	  return (`${from} ${to}`).trim()
	};

	const testSet = (set, version, options) => {
	  for (let i = 0; i < set.length; i++) {
	    if (!set[i].test(version)) {
	      return false
	    }
	  }

	  if (version.prerelease.length && !options.includePrerelease) {
	    // Find the set of versions that are allowed to have prereleases
	    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
	    // That should allow `1.2.3-pr.2` to pass.
	    // However, `1.2.4-alpha.notready` should NOT be allowed,
	    // even though it's within the range set by the comparators.
	    for (let i = 0; i < set.length; i++) {
	      debug_1(set[i].semver);
	      if (set[i].semver === comparator.ANY) {
	        continue
	      }

	      if (set[i].semver.prerelease.length > 0) {
	        const allowed = set[i].semver;
	        if (allowed.major === version.major &&
	            allowed.minor === version.minor &&
	            allowed.patch === version.patch) {
	          return true
	        }
	      }
	    }

	    // Version has a -pre, but it's not one of the ones we like.
	    return false
	  }

	  return true
	};

	const ANY = Symbol('SemVer ANY');
	// hoisted class for cyclic dependency
	class Comparator {
	  static get ANY () {
	    return ANY
	  }
	  constructor (comp, options) {
	    if (!options || typeof options !== 'object') {
	      options = {
	        loose: !!options,
	        includePrerelease: false
	      };
	    }

	    if (comp instanceof Comparator) {
	      if (comp.loose === !!options.loose) {
	        return comp
	      } else {
	        comp = comp.value;
	      }
	    }

	    debug_1('comparator', comp, options);
	    this.options = options;
	    this.loose = !!options.loose;
	    this.parse(comp);

	    if (this.semver === ANY) {
	      this.value = '';
	    } else {
	      this.value = this.operator + this.semver.version;
	    }

	    debug_1('comp', this);
	  }

	  parse (comp) {
	    const r = this.options.loose ? re$4[t$4.COMPARATORLOOSE] : re$4[t$4.COMPARATOR];
	    const m = comp.match(r);

	    if (!m) {
	      throw new TypeError(`Invalid comparator: ${comp}`)
	    }

	    this.operator = m[1] !== undefined ? m[1] : '';
	    if (this.operator === '=') {
	      this.operator = '';
	    }

	    // if it literally is just '>' or '' then allow anything.
	    if (!m[2]) {
	      this.semver = ANY;
	    } else {
	      this.semver = new semver(m[2], this.options.loose);
	    }
	  }

	  toString () {
	    return this.value
	  }

	  test (version) {
	    debug_1('Comparator.test', version, this.options.loose);

	    if (this.semver === ANY || version === ANY) {
	      return true
	    }

	    if (typeof version === 'string') {
	      try {
	        version = new semver(version, this.options);
	      } catch (er) {
	        return false
	      }
	    }

	    return cmp_1(version, this.operator, this.semver, this.options)
	  }

	  intersects (comp, options) {
	    if (!(comp instanceof Comparator)) {
	      throw new TypeError('a Comparator is required')
	    }

	    if (!options || typeof options !== 'object') {
	      options = {
	        loose: !!options,
	        includePrerelease: false
	      };
	    }

	    if (this.operator === '') {
	      if (this.value === '') {
	        return true
	      }
	      return new range(comp.value, options).test(this.value)
	    } else if (comp.operator === '') {
	      if (comp.value === '') {
	        return true
	      }
	      return new range(this.value, options).test(comp.semver)
	    }

	    const sameDirectionIncreasing =
	      (this.operator === '>=' || this.operator === '>') &&
	      (comp.operator === '>=' || comp.operator === '>');
	    const sameDirectionDecreasing =
	      (this.operator === '<=' || this.operator === '<') &&
	      (comp.operator === '<=' || comp.operator === '<');
	    const sameSemVer = this.semver.version === comp.semver.version;
	    const differentDirectionsInclusive =
	      (this.operator === '>=' || this.operator === '<=') &&
	      (comp.operator === '>=' || comp.operator === '<=');
	    const oppositeDirectionsLessThan =
	      cmp_1(this.semver, '<', comp.semver, options) &&
	      (this.operator === '>=' || this.operator === '>') &&
	        (comp.operator === '<=' || comp.operator === '<');
	    const oppositeDirectionsGreaterThan =
	      cmp_1(this.semver, '>', comp.semver, options) &&
	      (this.operator === '<=' || this.operator === '<') &&
	        (comp.operator === '>=' || comp.operator === '>');

	    return (
	      sameDirectionIncreasing ||
	      sameDirectionDecreasing ||
	      (sameSemVer && differentDirectionsInclusive) ||
	      oppositeDirectionsLessThan ||
	      oppositeDirectionsGreaterThan
	    )
	  }
	}

	var comparator = Comparator;

	const {re: re$4, t: t$4} = re_1;

	const satisfies = (version, range$1, options) => {
	  try {
	    range$1 = new range(range$1, options);
	  } catch (er) {
	    return false
	  }
	  return range$1.test(version)
	};
	var satisfies_1 = satisfies;

	// Mostly just for testing and legacy API reasons
	const toComparators = (range$1, options) =>
	  new range(range$1, options).set
	    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '));

	var toComparators_1 = toComparators;

	const maxSatisfying = (versions, range$1, options) => {
	  let max = null;
	  let maxSV = null;
	  let rangeObj = null;
	  try {
	    rangeObj = new range(range$1, options);
	  } catch (er) {
	    return null
	  }
	  versions.forEach((v) => {
	    if (rangeObj.test(v)) {
	      // satisfies(v, range, options)
	      if (!max || maxSV.compare(v) === -1) {
	        // compare(max, v, true)
	        max = v;
	        maxSV = new semver(max, options);
	      }
	    }
	  });
	  return max
	};
	var maxSatisfying_1 = maxSatisfying;

	const minSatisfying = (versions, range$1, options) => {
	  let min = null;
	  let minSV = null;
	  let rangeObj = null;
	  try {
	    rangeObj = new range(range$1, options);
	  } catch (er) {
	    return null
	  }
	  versions.forEach((v) => {
	    if (rangeObj.test(v)) {
	      // satisfies(v, range, options)
	      if (!min || minSV.compare(v) === 1) {
	        // compare(min, v, true)
	        min = v;
	        minSV = new semver(min, options);
	      }
	    }
	  });
	  return min
	};
	var minSatisfying_1 = minSatisfying;

	const minVersion = (range$1, loose) => {
	  range$1 = new range(range$1, loose);

	  let minver = new semver('0.0.0');
	  if (range$1.test(minver)) {
	    return minver
	  }

	  minver = new semver('0.0.0-0');
	  if (range$1.test(minver)) {
	    return minver
	  }

	  minver = null;
	  for (let i = 0; i < range$1.set.length; ++i) {
	    const comparators = range$1.set[i];

	    comparators.forEach((comparator) => {
	      // Clone to avoid manipulating the comparator's semver object.
	      const compver = new semver(comparator.semver.version);
	      switch (comparator.operator) {
	        case '>':
	          if (compver.prerelease.length === 0) {
	            compver.patch++;
	          } else {
	            compver.prerelease.push(0);
	          }
	          compver.raw = compver.format();
	          /* fallthrough */
	        case '':
	        case '>=':
	          if (!minver || gt_1(minver, compver)) {
	            minver = compver;
	          }
	          break
	        case '<':
	        case '<=':
	          /* Ignore maximum versions */
	          break
	        /* istanbul ignore next */
	        default:
	          throw new Error(`Unexpected operation: ${comparator.operator}`)
	      }
	    });
	  }

	  if (minver && range$1.test(minver)) {
	    return minver
	  }

	  return null
	};
	var minVersion_1 = minVersion;

	const validRange = (range$1, options) => {
	  try {
	    // Return '*' instead of '' so that truthiness works.
	    // This will throw if it's invalid anyway
	    return new range(range$1, options).range || '*'
	  } catch (er) {
	    return null
	  }
	};
	var valid$1 = validRange;

	const {ANY: ANY$1} = comparator;







	const outside = (version, range$1, hilo, options) => {
	  version = new semver(version, options);
	  range$1 = new range(range$1, options);

	  let gtfn, ltefn, ltfn, comp, ecomp;
	  switch (hilo) {
	    case '>':
	      gtfn = gt_1;
	      ltefn = lte_1;
	      ltfn = lt_1;
	      comp = '>';
	      ecomp = '>=';
	      break
	    case '<':
	      gtfn = lt_1;
	      ltefn = gte_1;
	      ltfn = gt_1;
	      comp = '<';
	      ecomp = '<=';
	      break
	    default:
	      throw new TypeError('Must provide a hilo val of "<" or ">"')
	  }

	  // If it satisifes the range it is not outside
	  if (satisfies_1(version, range$1, options)) {
	    return false
	  }

	  // From now on, variable terms are as if we're in "gtr" mode.
	  // but note that everything is flipped for the "ltr" function.

	  for (let i = 0; i < range$1.set.length; ++i) {
	    const comparators = range$1.set[i];

	    let high = null;
	    let low = null;

	    comparators.forEach((comparator$1) => {
	      if (comparator$1.semver === ANY$1) {
	        comparator$1 = new comparator('>=0.0.0');
	      }
	      high = high || comparator$1;
	      low = low || comparator$1;
	      if (gtfn(comparator$1.semver, high.semver, options)) {
	        high = comparator$1;
	      } else if (ltfn(comparator$1.semver, low.semver, options)) {
	        low = comparator$1;
	      }
	    });

	    // If the edge version comparator has a operator then our version
	    // isn't outside it
	    if (high.operator === comp || high.operator === ecomp) {
	      return false
	    }

	    // If the lowest version comparator has an operator and our version
	    // is less than it then it isn't higher than the range
	    if ((!low.operator || low.operator === comp) &&
	        ltefn(version, low.semver)) {
	      return false
	    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
	      return false
	    }
	  }
	  return true
	};

	var outside_1 = outside;

	// Determine if version is greater than all the versions possible in the range.

	const gtr = (version, range, options) => outside_1(version, range, '>', options);
	var gtr_1 = gtr;

	// Determine if version is less than all the versions possible in the range
	const ltr = (version, range, options) => outside_1(version, range, '<', options);
	var ltr_1 = ltr;

	const intersects = (r1, r2, options) => {
	  r1 = new range(r1, options);
	  r2 = new range(r2, options);
	  return r1.intersects(r2)
	};
	var intersects_1 = intersects;

	// given a set of versions and a range, create a "simplified" range
	// that includes the same versions that the original range does
	// If the original range is shorter than the simplified one, return that.


	var simplify = (versions, range, options) => {
	  const set = [];
	  let min = null;
	  let prev = null;
	  const v = versions.sort((a, b) => compare_1(a, b, options));
	  for (const version of v) {
	    const included = satisfies_1(version, range, options);
	    if (included) {
	      prev = version;
	      if (!min)
	        min = version;
	    } else {
	      if (prev) {
	        set.push([min, prev]);
	      }
	      prev = null;
	      min = null;
	    }
	  }
	  if (min)
	    set.push([min, null]);

	  const ranges = [];
	  for (const [min, max] of set) {
	    if (min === max)
	      ranges.push(min);
	    else if (!max && min === v[0])
	      ranges.push('*');
	    else if (!max)
	      ranges.push(`>=${min}`);
	    else if (min === v[0])
	      ranges.push(`<=${max}`);
	    else
	      ranges.push(`${min} - ${max}`);
	  }
	  const simplified = ranges.join(' || ');
	  const original = typeof range.raw === 'string' ? range.raw : String(range);
	  return simplified.length < original.length ? simplified : range
	};

	const { ANY: ANY$2 } = comparator;



	// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
	// - Every simple range `r1, r2, ...` is a subset of some `R1, R2, ...`
	//
	// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
	// - If c is only the ANY comparator
	//   - If C is only the ANY comparator, return true
	//   - Else return false
	// - Let EQ be the set of = comparators in c
	// - If EQ is more than one, return true (null set)
	// - Let GT be the highest > or >= comparator in c
	// - Let LT be the lowest < or <= comparator in c
	// - If GT and LT, and GT.semver > LT.semver, return true (null set)
	// - If EQ
	//   - If GT, and EQ does not satisfy GT, return true (null set)
	//   - If LT, and EQ does not satisfy LT, return true (null set)
	//   - If EQ satisfies every C, return true
	//   - Else return false
	// - If GT
	//   - If GT is lower than any > or >= comp in C, return false
	//   - If GT is >=, and GT.semver does not satisfy every C, return false
	// - If LT
	//   - If LT.semver is greater than that of any > comp in C, return false
	//   - If LT is <=, and LT.semver does not satisfy every C, return false
	// - If any C is a = range, and GT or LT are set, return false
	// - Else return true

	const subset = (sub, dom, options) => {
	  sub = new range(sub, options);
	  dom = new range(dom, options);
	  let sawNonNull = false;

	  OUTER: for (const simpleSub of sub.set) {
	    for (const simpleDom of dom.set) {
	      const isSub = simpleSubset(simpleSub, simpleDom, options);
	      sawNonNull = sawNonNull || isSub !== null;
	      if (isSub)
	        continue OUTER
	    }
	    // the null set is a subset of everything, but null simple ranges in
	    // a complex range should be ignored.  so if we saw a non-null range,
	    // then we know this isn't a subset, but if EVERY simple range was null,
	    // then it is a subset.
	    if (sawNonNull)
	      return false
	  }
	  return true
	};

	const simpleSubset = (sub, dom, options) => {
	  if (sub.length === 1 && sub[0].semver === ANY$2)
	    return dom.length === 1 && dom[0].semver === ANY$2

	  const eqSet = new Set();
	  let gt, lt;
	  for (const c of sub) {
	    if (c.operator === '>' || c.operator === '>=')
	      gt = higherGT(gt, c, options);
	    else if (c.operator === '<' || c.operator === '<=')
	      lt = lowerLT(lt, c, options);
	    else
	      eqSet.add(c.semver);
	  }

	  if (eqSet.size > 1)
	    return null

	  let gtltComp;
	  if (gt && lt) {
	    gtltComp = compare_1(gt.semver, lt.semver, options);
	    if (gtltComp > 0)
	      return null
	    else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<='))
	      return null
	  }

	  // will iterate one or zero times
	  for (const eq of eqSet) {
	    if (gt && !satisfies_1(eq, String(gt), options))
	      return null

	    if (lt && !satisfies_1(eq, String(lt), options))
	      return null

	    for (const c of dom) {
	      if (!satisfies_1(eq, String(c), options))
	        return false
	    }
	    return true
	  }

	  let higher, lower;
	  let hasDomLT, hasDomGT;
	  for (const c of dom) {
	    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
	    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
	    if (gt) {
	      if (c.operator === '>' || c.operator === '>=') {
	        higher = higherGT(gt, c, options);
	        if (higher === c)
	          return false
	      } else if (gt.operator === '>=' && !satisfies_1(gt.semver, String(c), options))
	        return false
	    }
	    if (lt) {
	      if (c.operator === '<' || c.operator === '<=') {
	        lower = lowerLT(lt, c, options);
	        if (lower === c)
	          return false
	      } else if (lt.operator === '<=' && !satisfies_1(lt.semver, String(c), options))
	        return false
	    }
	    if (!c.operator && (lt || gt) && gtltComp !== 0)
	      return false
	  }

	  // if there was a < or >, and nothing in the dom, then must be false
	  // UNLESS it was limited by another range in the other direction.
	  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
	  if (gt && hasDomLT && !lt && gtltComp !== 0)
	    return false

	  if (lt && hasDomGT && !gt && gtltComp !== 0)
	    return false

	  return true
	};

	// >=1.2.3 is lower than >1.2.3
	const higherGT = (a, b, options) => {
	  if (!a)
	    return b
	  const comp = compare_1(a.semver, b.semver, options);
	  return comp > 0 ? a
	    : comp < 0 ? b
	    : b.operator === '>' && a.operator === '>=' ? b
	    : a
	};

	// <=1.2.3 is higher than <1.2.3
	const lowerLT = (a, b, options) => {
	  if (!a)
	    return b
	  const comp = compare_1(a.semver, b.semver, options);
	  return comp < 0 ? a
	    : comp > 0 ? b
	    : b.operator === '<' && a.operator === '<=' ? b
	    : a
	};

	var subset_1 = subset;

	// just pre-load all the stuff that index.js lazily exports

	var semver$1 = {
	  re: re_1.re,
	  src: re_1.src,
	  tokens: re_1.t,
	  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
	  SemVer: semver,
	  compareIdentifiers: identifiers.compareIdentifiers,
	  rcompareIdentifiers: identifiers.rcompareIdentifiers,
	  parse: parse_1,
	  valid: valid_1,
	  clean: clean_1,
	  inc: inc_1,
	  diff: diff_1,
	  major: major_1,
	  minor: minor_1,
	  patch: patch_1,
	  prerelease: prerelease_1,
	  compare: compare_1,
	  rcompare: rcompare_1,
	  compareLoose: compareLoose_1,
	  compareBuild: compareBuild_1,
	  sort: sort_1,
	  rsort: rsort_1,
	  gt: gt_1,
	  lt: lt_1,
	  eq: eq_1,
	  neq: neq_1,
	  gte: gte_1,
	  lte: lte_1,
	  cmp: cmp_1,
	  coerce: coerce_1,
	  Comparator: comparator,
	  Range: range,
	  satisfies: satisfies_1,
	  toComparators: toComparators_1,
	  maxSatisfying: maxSatisfying_1,
	  minSatisfying: minSatisfying_1,
	  minVersion: minVersion_1,
	  validRange: valid$1,
	  outside: outside_1,
	  gtr: gtr_1,
	  ltr: ltr_1,
	  intersects: intersects_1,
	  simplifyRange: simplify,
	  subset: subset_1,
	};

	var BaseAbstractPlugin_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BaseAbstractPlugin = void 0;
	/** This class represent the base to patch plugin. */
	class BaseAbstractPlugin {
	    constructor(_tracerName, _tracerVersion) {
	        this._tracerName = _tracerName;
	        this._tracerVersion = _tracerVersion;
	    }
	    disable() {
	        this.unpatch();
	    }
	}
	exports.BaseAbstractPlugin = BaseAbstractPlugin;

	});

	unwrapExports(BaseAbstractPlugin_1);
	var BaseAbstractPlugin_2 = BaseAbstractPlugin_1.BaseAbstractPlugin;

	var BasePlugin_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BasePlugin = void 0;



	/** This class represent the base to patch plugin. */
	class BasePlugin extends BaseAbstractPlugin_1.BaseAbstractPlugin {
	    enable(moduleExports, tracerProvider, logger, config) {
	        this._moduleExports = moduleExports;
	        this._tracer = tracerProvider.getTracer(this._tracerName, this._tracerVersion);
	        this._logger = logger;
	        this._internalFilesExports = this._loadInternalFilesExports();
	        if (config)
	            this._config = config;
	        return this.patch();
	    }
	    disable() {
	        this.unpatch();
	    }
	    /**
	     * @TODO: To avoid circular dependencies, internal file loading functionality currently
	     * lives in BasePlugin. It is not meant to work in the browser and so this logic
	     * should eventually be moved somewhere else where it makes more sense.
	     * https://github.com/open-telemetry/opentelemetry-js/issues/285
	     */
	    _loadInternalFilesExports() {
	        if (!this._internalFilesList)
	            return {};
	        if (!this.version || !this.moduleName || !this._basedir) {
	            // log here because internalFilesList was provided, so internal file loading
	            // was expected to be working
	            this._logger.debug('loadInternalFiles failed because one of the required fields was missing: moduleName=%s, version=%s, basedir=%s', this.moduleName, this.version, this._basedir);
	            return {};
	        }
	        const extraModules = {};
	        this._logger.debug('loadInternalFiles %o', this._internalFilesList);
	        Object.keys(this._internalFilesList).forEach(versionRange => {
	            this._loadInternalModule(versionRange, extraModules);
	        });
	        if (Object.keys(extraModules).length === 0) {
	            this._logger.debug('No internal files could be loaded for %s@%s', this.moduleName, this.version);
	        }
	        return extraModules;
	    }
	    _loadInternalModule(versionRange, outExtraModules) {
	        if (semver$1.satisfies(this.version, versionRange)) {
	            if (Object.keys(outExtraModules).length > 0) {
	                this._logger.warn('Plugin for %s@%s, has overlap version range (%s) for internal files: %o', this.moduleName, this.version, versionRange, this._internalFilesList);
	            }
	            this._requireInternalFiles(this._internalFilesList[versionRange], this._basedir, outExtraModules);
	        }
	    }
	    _requireInternalFiles(extraModulesList, basedir, outExtraModules) {
	        if (!extraModulesList)
	            return;
	        Object.keys(extraModulesList).forEach(moduleName => {
	            try {
	                this._logger.debug('loading File %s', extraModulesList[moduleName]);
	                outExtraModules[moduleName] = commonjsRequire(path.join(basedir, extraModulesList[moduleName]));
	            }
	            catch (e) {
	                this._logger.error('Could not load internal file %s of module %s. Error: %s', path.join(basedir, extraModulesList[moduleName]), this.moduleName, e.message);
	            }
	        });
	    }
	}
	exports.BasePlugin = BasePlugin;

	});

	unwrapExports(BasePlugin_1);
	var BasePlugin_2 = BasePlugin_1.BasePlugin;

	var environment = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseEnvironment = exports.DEFAULT_ENVIRONMENT = void 0;

	const ENVIRONMENT_NUMBERS = [
	    'OTEL_SAMPLING_PROBABILITY',
	];
	/**
	 * Default environment variables
	 */
	exports.DEFAULT_ENVIRONMENT = {
	    OTEL_NO_PATCH_MODULES: '',
	    OTEL_LOG_LEVEL: types.LogLevel.INFO,
	    OTEL_SAMPLING_PROBABILITY: 1,
	};
	/**
	 * Parses a variable as number with number validation
	 * @param name
	 * @param environment
	 * @param values
	 * @param min
	 * @param max
	 */
	function parseNumber(name, environment, values, min = -Infinity, max = Infinity) {
	    if (typeof values[name] !== 'undefined') {
	        const value = Number(values[name]);
	        if (!isNaN(value) && value >= min && value <= max) {
	            environment[name] = value;
	        }
	    }
	}
	/**
	 * Environmentally sets log level if valid log level string is provided
	 * @param key
	 * @param environment
	 * @param values
	 */
	function setLogLevelFromEnv(key, environment, values) {
	    const value = values[key];
	    switch (typeof value === 'string' ? value.toUpperCase() : value) {
	        case 'DEBUG':
	            environment[key] = types.LogLevel.DEBUG;
	            break;
	        case 'INFO':
	            environment[key] = types.LogLevel.INFO;
	            break;
	        case 'WARN':
	            environment[key] = types.LogLevel.WARN;
	            break;
	        case 'ERROR':
	            environment[key] = types.LogLevel.ERROR;
	            break;
	    }
	}
	/**
	 * Parses environment values
	 * @param values
	 */
	function parseEnvironment(values) {
	    const environment = {};
	    for (const env in exports.DEFAULT_ENVIRONMENT) {
	        const key = env;
	        switch (key) {
	            case 'OTEL_SAMPLING_PROBABILITY':
	                parseNumber(key, environment, values, 0, 1);
	                break;
	            case 'OTEL_LOG_LEVEL':
	                setLogLevelFromEnv(key, environment, values);
	                break;
	            default:
	                if (ENVIRONMENT_NUMBERS.indexOf(key) >= 0) {
	                    parseNumber(key, environment, values);
	                }
	                else {
	                    if (typeof values[key] !== 'undefined') {
	                        environment[key] = values[key];
	                    }
	                }
	        }
	    }
	    return environment;
	}
	exports.parseEnvironment = parseEnvironment;

	});

	unwrapExports(environment);
	var environment_1 = environment.parseEnvironment;
	var environment_2 = environment.DEFAULT_ENVIRONMENT;

	var environment$1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getEnv = void 0;

	/**
	 * Gets the environment variables
	 */
	function getEnv() {
	    const processEnv = environment.parseEnvironment(process.env);
	    return Object.assign({}, environment.DEFAULT_ENVIRONMENT, processEnv);
	}
	exports.getEnv = getEnv;

	});

	unwrapExports(environment$1);
	var environment_2$1 = environment$1.getEnv;

	var hexToBase64_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hexToBase64 = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	function hexToBase64(hexStr) {
	    const hexStrLen = hexStr.length;
	    let hexAsciiCharsStr = '';
	    for (let i = 0; i < hexStrLen; i += 2) {
	        const hexPair = hexStr.substring(i, i + 2);
	        const hexVal = parseInt(hexPair, 16);
	        hexAsciiCharsStr += String.fromCharCode(hexVal);
	    }
	    return Buffer.from(hexAsciiCharsStr, 'ascii').toString('base64');
	}
	exports.hexToBase64 = hexToBase64;

	});

	unwrapExports(hexToBase64_1);
	var hexToBase64_2 = hexToBase64_1.hexToBase64;

	var RandomIdGenerator_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RandomIdGenerator = void 0;

	const SPAN_ID_BYTES = 8;
	const TRACE_ID_BYTES = 16;
	class RandomIdGenerator {
	    /**
	     * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
	     * characters corresponding to 128 bits.
	     */
	    generateTraceId() {
	        return crypto$1.randomBytes(TRACE_ID_BYTES).toString('hex');
	    }
	    /**
	     * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
	     * characters corresponding to 64 bits.
	     */
	    generateSpanId() {
	        return crypto$1.randomBytes(SPAN_ID_BYTES).toString('hex');
	    }
	}
	exports.RandomIdGenerator = RandomIdGenerator;

	});

	unwrapExports(RandomIdGenerator_1);
	var RandomIdGenerator_2 = RandomIdGenerator_1.RandomIdGenerator;

	var performance$1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.otperformance = void 0;

	exports.otperformance = perf_hooks.performance;

	});

	unwrapExports(performance$1);
	var performance_1 = performance$1.otperformance;

	var version = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VERSION = void 0;
	// this is autogenerated file, see scripts/version-update.js
	exports.VERSION = '0.10.2';

	});

	unwrapExports(version);
	var version_1 = version.VERSION;

	var sdkInfo = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SDK_INFO = void 0;

	/** Constants describing the SDK in use */
	exports.SDK_INFO = {
	    NAME: 'opentelemetry',
	    RUNTIME: 'node',
	    LANGUAGE: 'nodejs',
	    VERSION: version.VERSION,
	};

	});

	unwrapExports(sdkInfo);
	var sdkInfo_1 = sdkInfo.SDK_INFO;

	var timerUtil = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unrefTimer = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	function unrefTimer(timer) {
	    timer.unref();
	}
	exports.unrefTimer = unrefTimer;

	});

	unwrapExports(timerUtil);
	var timerUtil_1 = timerUtil.unrefTimer;

	var node = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(BasePlugin_1, exports);
	__exportStar(environment$1, exports);
	__exportStar(hexToBase64_1, exports);
	__exportStar(RandomIdGenerator_1, exports);
	__exportStar(performance$1, exports);
	__exportStar(sdkInfo, exports);
	__exportStar(timerUtil, exports);

	});

	unwrapExports(node);

	var platform = createCommonjsModule(function (module, exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	__exportStar(node, exports);

	});

	unwrapExports(platform);

	var ConsoleLogger_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ConsoleLogger = void 0;


	class ConsoleLogger {
	    constructor(level = platform.getEnv().OTEL_LOG_LEVEL) {
	        if (level >= types.LogLevel.DEBUG) {
	            this.debug = (...args) => {
	                console.debug(...args);
	            };
	        }
	        if (level >= types.LogLevel.INFO) {
	            this.info = (...args) => {
	                console.info(...args);
	            };
	        }
	        if (level >= types.LogLevel.WARN) {
	            this.warn = (...args) => {
	                console.warn(...args);
	            };
	        }
	        if (level >= types.LogLevel.ERROR) {
	            this.error = (...args) => {
	                console.error(...args);
	            };
	        }
	    }
	    debug(message, ...args) { }
	    error(message, ...args) { }
	    warn(message, ...args) { }
	    info(message, ...args) { }
	}
	exports.ConsoleLogger = ConsoleLogger;

	});

	unwrapExports(ConsoleLogger_1);
	var ConsoleLogger_2 = ConsoleLogger_1.ConsoleLogger;

	var NoopLogger_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NoopLogger = void 0;
	/** No-op implementation of Logger */
	class NoopLogger {
	    // By default does nothing
	    debug(message, ...args) { }
	    // By default does nothing
	    error(message, ...args) { }
	    // By default does nothing
	    warn(message, ...args) { }
	    // By default does nothing
	    info(message, ...args) { }
	}
	exports.NoopLogger = NoopLogger;

	});

	unwrapExports(NoopLogger_1);
	var NoopLogger_2 = NoopLogger_1.NoopLogger;

	var time = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isTimeInput = exports.isTimeInputHrTime = exports.hrTimeToMicroseconds = exports.hrTimeToMilliseconds = exports.hrTimeToNanoseconds = exports.hrTimeToTimeStamp = exports.hrTimeDuration = exports.timeInputToHrTime = exports.hrTime = void 0;

	const NANOSECOND_DIGITS = 9;
	const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
	/**
	 * Converts a number to HrTime
	 * @param epochMillis
	 */
	function numberToHrtime(epochMillis) {
	    const epochSeconds = epochMillis / 1000;
	    // Decimals only.
	    const seconds = Math.trunc(epochSeconds);
	    // Round sub-nanosecond accuracy to nanosecond.
	    const nanos = Number((epochSeconds - seconds).toFixed(NANOSECOND_DIGITS)) *
	        SECOND_TO_NANOSECONDS;
	    return [seconds, nanos];
	}
	function getTimeOrigin() {
	    let timeOrigin = platform.otperformance.timeOrigin;
	    if (typeof timeOrigin !== 'number') {
	        const perf = platform.otperformance;
	        timeOrigin = perf.timing && perf.timing.fetchStart;
	    }
	    return timeOrigin;
	}
	/**
	 * Returns an hrtime calculated via performance component.
	 * @param performanceNow
	 */
	function hrTime(performanceNow) {
	    const timeOrigin = numberToHrtime(getTimeOrigin());
	    const now = numberToHrtime(typeof performanceNow === 'number' ? performanceNow : platform.otperformance.now());
	    let seconds = timeOrigin[0] + now[0];
	    let nanos = timeOrigin[1] + now[1];
	    // Nanoseconds
	    if (nanos > SECOND_TO_NANOSECONDS) {
	        nanos -= SECOND_TO_NANOSECONDS;
	        seconds += 1;
	    }
	    return [seconds, nanos];
	}
	exports.hrTime = hrTime;
	/**
	 *
	 * Converts a TimeInput to an HrTime, defaults to _hrtime().
	 * @param time
	 */
	function timeInputToHrTime(time) {
	    // process.hrtime
	    if (isTimeInputHrTime(time)) {
	        return time;
	    }
	    else if (typeof time === 'number') {
	        // Must be a performance.now() if it's smaller than process start time.
	        if (time < getTimeOrigin()) {
	            return hrTime(time);
	        }
	        else {
	            // epoch milliseconds or performance.timeOrigin
	            return numberToHrtime(time);
	        }
	    }
	    else if (time instanceof Date) {
	        return [time.getTime(), 0];
	    }
	    else {
	        throw TypeError('Invalid input type');
	    }
	}
	exports.timeInputToHrTime = timeInputToHrTime;
	/**
	 * Returns a duration of two hrTime.
	 * @param startTime
	 * @param endTime
	 */
	function hrTimeDuration(startTime, endTime) {
	    let seconds = endTime[0] - startTime[0];
	    let nanos = endTime[1] - startTime[1];
	    // overflow
	    if (nanos < 0) {
	        seconds -= 1;
	        // negate
	        nanos += SECOND_TO_NANOSECONDS;
	    }
	    return [seconds, nanos];
	}
	exports.hrTimeDuration = hrTimeDuration;
	/**
	 * Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
	 * @param hrTime
	 */
	function hrTimeToTimeStamp(hrTime) {
	    const precision = NANOSECOND_DIGITS;
	    const tmp = `${'0'.repeat(precision)}${hrTime[1]}Z`;
	    const nanoString = tmp.substr(tmp.length - precision - 1);
	    const date = new Date(hrTime[0] * 1000).toISOString();
	    return date.replace('000Z', nanoString);
	}
	exports.hrTimeToTimeStamp = hrTimeToTimeStamp;
	/**
	 * Convert hrTime to nanoseconds.
	 * @param hrTime
	 */
	function hrTimeToNanoseconds(hrTime) {
	    return hrTime[0] * SECOND_TO_NANOSECONDS + hrTime[1];
	}
	exports.hrTimeToNanoseconds = hrTimeToNanoseconds;
	/**
	 * Convert hrTime to milliseconds.
	 * @param hrTime
	 */
	function hrTimeToMilliseconds(hrTime) {
	    return Math.round(hrTime[0] * 1e3 + hrTime[1] / 1e6);
	}
	exports.hrTimeToMilliseconds = hrTimeToMilliseconds;
	/**
	 * Convert hrTime to microseconds.
	 * @param hrTime
	 */
	function hrTimeToMicroseconds(hrTime) {
	    return Math.round(hrTime[0] * 1e6 + hrTime[1] / 1e3);
	}
	exports.hrTimeToMicroseconds = hrTimeToMicroseconds;
	/**
	 * check if time is HrTime
	 * @param value
	 */
	function isTimeInputHrTime(value) {
	    return (Array.isArray(value) &&
	        value.length === 2 &&
	        typeof value[0] === 'number' &&
	        typeof value[1] === 'number');
	}
	exports.isTimeInputHrTime = isTimeInputHrTime;
	/**
	 * check if input value is a correct types.TimeInput
	 * @param value
	 */
	function isTimeInput(value) {
	    return (isTimeInputHrTime(value) ||
	        typeof value === 'number' ||
	        value instanceof Date);
	}
	exports.isTimeInput = isTimeInput;

	});

	unwrapExports(time);
	var time_1 = time.isTimeInput;
	var time_2 = time.isTimeInputHrTime;
	var time_3 = time.hrTimeToMicroseconds;
	var time_4 = time.hrTimeToMilliseconds;
	var time_5 = time.hrTimeToNanoseconds;
	var time_6 = time.hrTimeToTimeStamp;
	var time_7 = time.hrTimeDuration;
	var time_8 = time.timeInputToHrTime;
	var time_9 = time.hrTime;

	var ExportResult_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ExportResult = void 0;
	var ExportResult;
	(function (ExportResult) {
	    ExportResult[ExportResult["SUCCESS"] = 0] = "SUCCESS";
	    ExportResult[ExportResult["FAILED_NOT_RETRYABLE"] = 1] = "FAILED_NOT_RETRYABLE";
	    ExportResult[ExportResult["FAILED_RETRYABLE"] = 2] = "FAILED_RETRYABLE";
	})(ExportResult = exports.ExportResult || (exports.ExportResult = {}));

	});

	unwrapExports(ExportResult_1);
	var ExportResult_2 = ExportResult_1.ExportResult;

	var types$1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(types$1);

	var context = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Context = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var Context = /** @class */ (function () {
	    /**
	     * Construct a new context which inherits values from an optional parent context.
	     *
	     * @param parentContext a context from which to inherit values
	     */
	    function Context(parentContext) {
	        this._currentContext = parentContext ? new Map(parentContext) : new Map();
	    }
	    /** Get a key to uniquely identify a context value */
	    Context.createKey = function (description) {
	        return Symbol(description);
	    };
	    /**
	     * Get a value from the context.
	     *
	     * @param key key which identifies a context value
	     */
	    Context.prototype.getValue = function (key) {
	        return this._currentContext.get(key);
	    };
	    /**
	     * Create a new context which inherits from this context and has
	     * the given key set to the given value.
	     *
	     * @param key context key for which to set the value
	     * @param value value to set for the given key
	     */
	    Context.prototype.setValue = function (key, value) {
	        var context = new Context(this._currentContext);
	        context._currentContext.set(key, value);
	        return context;
	    };
	    /**
	     * Return a new context which inherits from this context but does
	     * not contain a value for the given key.
	     *
	     * @param key context key for which to clear a value
	     */
	    Context.prototype.deleteValue = function (key) {
	        var context = new Context(this._currentContext);
	        context._currentContext.delete(key);
	        return context;
	    };
	    /** The root context is used as the default parent context when there is no active context */
	    Context.ROOT_CONTEXT = new Context();
	    /**
	     * This is another identifier to the root context which allows developers to easily search the
	     * codebase for direct uses of context which need to be removed in later PRs.
	     *
	     * It's existence is temporary and it should be removed when all references are fixed.
	     */
	    Context.TODO = Context.ROOT_CONTEXT;
	    return Context;
	}());
	exports.Context = Context;

	});

	unwrapExports(context);
	var context_1 = context.Context;

	var NoopContextManager_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NoopContextManager = void 0;

	var NoopContextManager = /** @class */ (function () {
	    function NoopContextManager() {
	    }
	    NoopContextManager.prototype.active = function () {
	        return context.Context.ROOT_CONTEXT;
	    };
	    NoopContextManager.prototype.with = function (context, fn) {
	        return fn();
	    };
	    NoopContextManager.prototype.bind = function (target, context) {
	        return target;
	    };
	    NoopContextManager.prototype.enable = function () {
	        return this;
	    };
	    NoopContextManager.prototype.disable = function () {
	        return this;
	    };
	    return NoopContextManager;
	}());
	exports.NoopContextManager = NoopContextManager;

	});

	unwrapExports(NoopContextManager_1);
	var NoopContextManager_2 = NoopContextManager_1.NoopContextManager;

	var src = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(types$1, exports);
	__exportStar(context, exports);
	__exportStar(NoopContextManager_1, exports);

	});

	unwrapExports(src);

	var context$1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getParentSpanContext = exports.setExtractedSpanContext = exports.getExtractedSpanContext = exports.setActiveSpan = exports.getActiveSpan = exports.ACTIVE_SPAN_KEY = void 0;

	/**
	 * Active span key
	 */
	exports.ACTIVE_SPAN_KEY = src.Context.createKey('OpenTelemetry Context Key ACTIVE_SPAN');
	const EXTRACTED_SPAN_CONTEXT_KEY = src.Context.createKey('OpenTelemetry Context Key EXTRACTED_SPAN_CONTEXT');
	/**
	 * Return the active span if one exists
	 *
	 * @param context context to get span from
	 */
	function getActiveSpan(context) {
	    return context.getValue(exports.ACTIVE_SPAN_KEY) || undefined;
	}
	exports.getActiveSpan = getActiveSpan;
	/**
	 * Set the active span on a context
	 *
	 * @param context context to use as parent
	 * @param span span to set active
	 */
	function setActiveSpan(context, span) {
	    return context.setValue(exports.ACTIVE_SPAN_KEY, span);
	}
	exports.setActiveSpan = setActiveSpan;
	/**
	 * Get the extracted span context from a context
	 *
	 * @param context context to get span context from
	 */
	function getExtractedSpanContext(context) {
	    return (context.getValue(EXTRACTED_SPAN_CONTEXT_KEY) || undefined);
	}
	exports.getExtractedSpanContext = getExtractedSpanContext;
	/**
	 * Set the extracted span context on a context
	 *
	 * @param context context to set span context on
	 * @param spanContext span context to set
	 */
	function setExtractedSpanContext(context, spanContext) {
	    return context.setValue(EXTRACTED_SPAN_CONTEXT_KEY, spanContext);
	}
	exports.setExtractedSpanContext = setExtractedSpanContext;
	/**
	 * Get the span context of the parent span if it exists,
	 * or the extracted span context if there is no active
	 * span.
	 *
	 * @param context context to get values from
	 */
	function getParentSpanContext(context) {
	    var _a;
	    return ((_a = getActiveSpan(context)) === null || _a === void 0 ? void 0 : _a.context()) || getExtractedSpanContext(context);
	}
	exports.getParentSpanContext = getParentSpanContext;

	});

	unwrapExports(context$1);
	var context_1$1 = context$1.getParentSpanContext;
	var context_2 = context$1.setExtractedSpanContext;
	var context_3 = context$1.getExtractedSpanContext;
	var context_4 = context$1.setActiveSpan;
	var context_5 = context$1.getActiveSpan;
	var context_6 = context$1.ACTIVE_SPAN_KEY;

	var Logger = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(Logger);

	var Time = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(Time);

	var getter = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultGetter = void 0;
	/**
	 * Default getter which just does a simple property access. Returns
	 * undefined if the key is not set.
	 *
	 * @param carrier
	 * @param key
	 */
	function defaultGetter(carrier, key) {
	    return carrier[key];
	}
	exports.defaultGetter = defaultGetter;

	});

	unwrapExports(getter);
	var getter_1 = getter.defaultGetter;

	var HttpTextPropagator = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(HttpTextPropagator);

	var NoopHttpTextPropagator_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOOP_HTTP_TEXT_PROPAGATOR = exports.NoopHttpTextPropagator = void 0;
	/**
	 * No-op implementations of {@link HttpTextPropagator}.
	 */
	var NoopHttpTextPropagator = /** @class */ (function () {
	    function NoopHttpTextPropagator() {
	    }
	    /** Noop inject function does nothing */
	    NoopHttpTextPropagator.prototype.inject = function (context, carrier, setter) { };
	    /** Noop extract function does nothing and returns the input context */
	    NoopHttpTextPropagator.prototype.extract = function (context, carrier, getter) {
	        return context;
	    };
	    return NoopHttpTextPropagator;
	}());
	exports.NoopHttpTextPropagator = NoopHttpTextPropagator;
	exports.NOOP_HTTP_TEXT_PROPAGATOR = new NoopHttpTextPropagator();

	});

	unwrapExports(NoopHttpTextPropagator_1);
	var NoopHttpTextPropagator_2 = NoopHttpTextPropagator_1.NOOP_HTTP_TEXT_PROPAGATOR;
	var NoopHttpTextPropagator_3 = NoopHttpTextPropagator_1.NoopHttpTextPropagator;

	var setter = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultSetter = void 0;
	/**
	 * Default setter which sets value via direct property access
	 *
	 * @param carrier
	 * @param key
	 */
	function defaultSetter(carrier, key, value) {
	    carrier[key] = value;
	}
	exports.defaultSetter = defaultSetter;

	});

	unwrapExports(setter);
	var setter_1 = setter.defaultSetter;

	var CorrelationContext = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(CorrelationContext);

	var EntryValue = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EntryTtl = void 0;
	/**
	 * EntryTtl is an integer that represents number of hops an entry can propagate.
	 *
	 * For now, ONLY special values (0 and -1) are supported.
	 */
	var EntryTtl;
	(function (EntryTtl) {
	    /**
	     * NO_PROPAGATION is considered to have local context and is used within the
	     * process it created.
	     */
	    EntryTtl[EntryTtl["NO_PROPAGATION"] = 0] = "NO_PROPAGATION";
	    /** UNLIMITED_PROPAGATION can propagate unlimited hops. */
	    EntryTtl[EntryTtl["UNLIMITED_PROPAGATION"] = -1] = "UNLIMITED_PROPAGATION";
	})(EntryTtl = exports.EntryTtl || (exports.EntryTtl = {}));

	});

	unwrapExports(EntryValue);
	var EntryValue_1 = EntryValue.EntryTtl;

	var BatchObserverResult = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(BatchObserverResult);

	var BoundInstrument = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(BoundInstrument);

	var Meter = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(Meter);

	var MeterProvider = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(MeterProvider);

	var Metric = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ValueType = void 0;
	/** The Type of value. It describes how the data is reported. */
	var ValueType;
	(function (ValueType) {
	    ValueType[ValueType["INT"] = 0] = "INT";
	    ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
	})(ValueType = exports.ValueType || (exports.ValueType = {}));

	});

	unwrapExports(Metric);
	var Metric_1 = Metric.ValueType;

	var NoopMeter_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOOP_BATCH_OBSERVER_METRIC = exports.NOOP_SUM_OBSERVER_METRIC = exports.NOOP_UP_DOWN_SUM_OBSERVER_METRIC = exports.NOOP_VALUE_OBSERVER_METRIC = exports.NOOP_BOUND_BASE_OBSERVER = exports.NOOP_VALUE_RECORDER_METRIC = exports.NOOP_BOUND_VALUE_RECORDER = exports.NOOP_COUNTER_METRIC = exports.NOOP_BOUND_COUNTER = exports.NOOP_METER = exports.NoopBoundBaseObserver = exports.NoopBoundValueRecorder = exports.NoopBoundCounter = exports.NoopBatchObserverMetric = exports.NoopBaseObserverMetric = exports.NoopValueRecorderMetric = exports.NoopCounterMetric = exports.NoopMetric = exports.NoopMeter = void 0;
	/**
	 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
	 * constant NoopMetrics for all of its methods.
	 */
	var NoopMeter = /** @class */ (function () {
	    function NoopMeter() {
	    }
	    /**
	     * Returns constant noop value recorder.
	     * @param name the name of the metric.
	     * @param [options] the metric options.
	     */
	    NoopMeter.prototype.createValueRecorder = function (name, options) {
	        return exports.NOOP_VALUE_RECORDER_METRIC;
	    };
	    /**
	     * Returns a constant noop counter.
	     * @param name the name of the metric.
	     * @param [options] the metric options.
	     */
	    NoopMeter.prototype.createCounter = function (name, options) {
	        return exports.NOOP_COUNTER_METRIC;
	    };
	    /**
	     * Returns a constant noop UpDownCounter.
	     * @param name the name of the metric.
	     * @param [options] the metric options.
	     */
	    NoopMeter.prototype.createUpDownCounter = function (name, options) {
	        return exports.NOOP_COUNTER_METRIC;
	    };
	    /**
	     * Returns constant noop value observer.
	     * @param name the name of the metric.
	     * @param [options] the metric options.
	     * @param [callback] the value observer callback
	     */
	    NoopMeter.prototype.createValueObserver = function (name, options, callback) {
	        return exports.NOOP_VALUE_OBSERVER_METRIC;
	    };
	    /**
	     * Returns constant noop batch observer.
	     * @param name the name of the metric.
	     * @param callback the batch observer callback
	     */
	    NoopMeter.prototype.createBatchObserver = function (name, callback) {
	        return exports.NOOP_BATCH_OBSERVER_METRIC;
	    };
	    return NoopMeter;
	}());
	exports.NoopMeter = NoopMeter;
	var NoopMetric = /** @class */ (function () {
	    function NoopMetric(instrument) {
	        this._instrument = instrument;
	    }
	    /**
	     * Returns a Bound Instrument associated with specified Labels.
	     * It is recommended to keep a reference to the Bound Instrument instead of
	     * always calling this method for every operations.
	     * @param labels key-values pairs that are associated with a specific metric
	     *     that you want to record.
	     */
	    NoopMetric.prototype.bind = function (labels) {
	        return this._instrument;
	    };
	    /**
	     * Removes the Binding from the metric, if it is present.
	     * @param labels key-values pairs that are associated with a specific metric.
	     */
	    NoopMetric.prototype.unbind = function (labels) {
	        return;
	    };
	    /**
	     * Clears all timeseries from the Metric.
	     */
	    NoopMetric.prototype.clear = function () {
	        return;
	    };
	    return NoopMetric;
	}());
	exports.NoopMetric = NoopMetric;
	var NoopCounterMetric = /** @class */ (function (_super) {
	    __extends(NoopCounterMetric, _super);
	    function NoopCounterMetric() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    NoopCounterMetric.prototype.add = function (value, labels) {
	        this.bind(labels).add(value);
	    };
	    return NoopCounterMetric;
	}(NoopMetric));
	exports.NoopCounterMetric = NoopCounterMetric;
	var NoopValueRecorderMetric = /** @class */ (function (_super) {
	    __extends(NoopValueRecorderMetric, _super);
	    function NoopValueRecorderMetric() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    NoopValueRecorderMetric.prototype.record = function (value, labels, correlationContext, spanContext) {
	        if (typeof correlationContext === 'undefined') {
	            this.bind(labels).record(value);
	        }
	        else if (typeof spanContext === 'undefined') {
	            this.bind(labels).record(value, correlationContext);
	        }
	        else {
	            this.bind(labels).record(value, correlationContext, spanContext);
	        }
	    };
	    return NoopValueRecorderMetric;
	}(NoopMetric));
	exports.NoopValueRecorderMetric = NoopValueRecorderMetric;
	var NoopBaseObserverMetric = /** @class */ (function (_super) {
	    __extends(NoopBaseObserverMetric, _super);
	    function NoopBaseObserverMetric() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    NoopBaseObserverMetric.prototype.observation = function () {
	        return {
	            observer: this,
	            value: 0,
	        };
	    };
	    return NoopBaseObserverMetric;
	}(NoopMetric));
	exports.NoopBaseObserverMetric = NoopBaseObserverMetric;
	var NoopBatchObserverMetric = /** @class */ (function (_super) {
	    __extends(NoopBatchObserverMetric, _super);
	    function NoopBatchObserverMetric() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    return NoopBatchObserverMetric;
	}(NoopMetric));
	exports.NoopBatchObserverMetric = NoopBatchObserverMetric;
	var NoopBoundCounter = /** @class */ (function () {
	    function NoopBoundCounter() {
	    }
	    NoopBoundCounter.prototype.add = function (value) {
	        return;
	    };
	    return NoopBoundCounter;
	}());
	exports.NoopBoundCounter = NoopBoundCounter;
	var NoopBoundValueRecorder = /** @class */ (function () {
	    function NoopBoundValueRecorder() {
	    }
	    NoopBoundValueRecorder.prototype.record = function (value, correlationContext, spanContext) {
	        return;
	    };
	    return NoopBoundValueRecorder;
	}());
	exports.NoopBoundValueRecorder = NoopBoundValueRecorder;
	var NoopBoundBaseObserver = /** @class */ (function () {
	    function NoopBoundBaseObserver() {
	    }
	    NoopBoundBaseObserver.prototype.update = function (value) { };
	    return NoopBoundBaseObserver;
	}());
	exports.NoopBoundBaseObserver = NoopBoundBaseObserver;
	exports.NOOP_METER = new NoopMeter();
	exports.NOOP_BOUND_COUNTER = new NoopBoundCounter();
	exports.NOOP_COUNTER_METRIC = new NoopCounterMetric(exports.NOOP_BOUND_COUNTER);
	exports.NOOP_BOUND_VALUE_RECORDER = new NoopBoundValueRecorder();
	exports.NOOP_VALUE_RECORDER_METRIC = new NoopValueRecorderMetric(exports.NOOP_BOUND_VALUE_RECORDER);
	exports.NOOP_BOUND_BASE_OBSERVER = new NoopBoundBaseObserver();
	exports.NOOP_VALUE_OBSERVER_METRIC = new NoopBaseObserverMetric(exports.NOOP_BOUND_BASE_OBSERVER);
	exports.NOOP_UP_DOWN_SUM_OBSERVER_METRIC = new NoopBaseObserverMetric(exports.NOOP_BOUND_BASE_OBSERVER);
	exports.NOOP_SUM_OBSERVER_METRIC = new NoopBaseObserverMetric(exports.NOOP_BOUND_BASE_OBSERVER);
	exports.NOOP_BATCH_OBSERVER_METRIC = new NoopBatchObserverMetric();

	});

	unwrapExports(NoopMeter_1);
	var NoopMeter_2 = NoopMeter_1.NOOP_BATCH_OBSERVER_METRIC;
	var NoopMeter_3 = NoopMeter_1.NOOP_SUM_OBSERVER_METRIC;
	var NoopMeter_4 = NoopMeter_1.NOOP_UP_DOWN_SUM_OBSERVER_METRIC;
	var NoopMeter_5 = NoopMeter_1.NOOP_VALUE_OBSERVER_METRIC;
	var NoopMeter_6 = NoopMeter_1.NOOP_BOUND_BASE_OBSERVER;
	var NoopMeter_7 = NoopMeter_1.NOOP_VALUE_RECORDER_METRIC;
	var NoopMeter_8 = NoopMeter_1.NOOP_BOUND_VALUE_RECORDER;
	var NoopMeter_9 = NoopMeter_1.NOOP_COUNTER_METRIC;
	var NoopMeter_10 = NoopMeter_1.NOOP_BOUND_COUNTER;
	var NoopMeter_11 = NoopMeter_1.NOOP_METER;
	var NoopMeter_12 = NoopMeter_1.NoopBoundBaseObserver;
	var NoopMeter_13 = NoopMeter_1.NoopBoundValueRecorder;
	var NoopMeter_14 = NoopMeter_1.NoopBoundCounter;
	var NoopMeter_15 = NoopMeter_1.NoopBatchObserverMetric;
	var NoopMeter_16 = NoopMeter_1.NoopBaseObserverMetric;
	var NoopMeter_17 = NoopMeter_1.NoopValueRecorderMetric;
	var NoopMeter_18 = NoopMeter_1.NoopCounterMetric;
	var NoopMeter_19 = NoopMeter_1.NoopMetric;
	var NoopMeter_20 = NoopMeter_1.NoopMeter;

	var NoopMeterProvider_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOOP_METER_PROVIDER = exports.NoopMeterProvider = void 0;

	/**
	 * An implementation of the {@link MeterProvider} which returns an impotent Meter
	 * for all calls to `getMeter`
	 */
	var NoopMeterProvider = /** @class */ (function () {
	    function NoopMeterProvider() {
	    }
	    NoopMeterProvider.prototype.getMeter = function (_name, _version) {
	        return NoopMeter_1.NOOP_METER;
	    };
	    return NoopMeterProvider;
	}());
	exports.NoopMeterProvider = NoopMeterProvider;
	exports.NOOP_METER_PROVIDER = new NoopMeterProvider();

	});

	unwrapExports(NoopMeterProvider_1);
	var NoopMeterProvider_2 = NoopMeterProvider_1.NOOP_METER_PROVIDER;
	var NoopMeterProvider_3 = NoopMeterProvider_1.NoopMeterProvider;

	var Observation = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(Observation);

	var ObserverResult = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(ObserverResult);

	var attributes = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(attributes);

	var Event = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(Event);

	var Plugin = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(Plugin);

	var link_context = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(link_context);

	var link = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(link);

	var trace_flags = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TraceFlags = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var TraceFlags;
	(function (TraceFlags) {
	    /** Represents no flag set. */
	    TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
	    /** Bit to represent whether trace is sampled in trace flags. */
	    TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
	})(TraceFlags = exports.TraceFlags || (exports.TraceFlags = {}));

	});

	unwrapExports(trace_flags);
	var trace_flags_1 = trace_flags.TraceFlags;

	var NoopSpan_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOOP_SPAN = exports.NoopSpan = exports.INVALID_SPAN_ID = exports.INVALID_TRACE_ID = void 0;

	exports.INVALID_TRACE_ID = '0';
	exports.INVALID_SPAN_ID = '0';
	var INVALID_SPAN_CONTEXT = {
	    traceId: exports.INVALID_TRACE_ID,
	    spanId: exports.INVALID_SPAN_ID,
	    traceFlags: trace_flags.TraceFlags.NONE,
	};
	/**
	 * The NoopSpan is the default {@link Span} that is used when no Span
	 * implementation is available. All operations are no-op including context
	 * propagation.
	 */
	var NoopSpan = /** @class */ (function () {
	    function NoopSpan(_spanContext) {
	        if (_spanContext === void 0) { _spanContext = INVALID_SPAN_CONTEXT; }
	        this._spanContext = _spanContext;
	    }
	    // Returns a SpanContext.
	    NoopSpan.prototype.context = function () {
	        return this._spanContext;
	    };
	    // By default does nothing
	    NoopSpan.prototype.setAttribute = function (key, value) {
	        return this;
	    };
	    // By default does nothing
	    NoopSpan.prototype.setAttributes = function (attributes) {
	        return this;
	    };
	    // By default does nothing
	    NoopSpan.prototype.addEvent = function (name, attributes) {
	        return this;
	    };
	    // By default does nothing
	    NoopSpan.prototype.setStatus = function (status) {
	        return this;
	    };
	    // By default does nothing
	    NoopSpan.prototype.updateName = function (name) {
	        return this;
	    };
	    // By default does nothing
	    NoopSpan.prototype.end = function (endTime) { };
	    // isRecording always returns false for noopSpan.
	    NoopSpan.prototype.isRecording = function () {
	        return false;
	    };
	    return NoopSpan;
	}());
	exports.NoopSpan = NoopSpan;
	exports.NOOP_SPAN = new NoopSpan();

	});

	unwrapExports(NoopSpan_1);
	var NoopSpan_2 = NoopSpan_1.NOOP_SPAN;
	var NoopSpan_3 = NoopSpan_1.NoopSpan;
	var NoopSpan_4 = NoopSpan_1.INVALID_SPAN_ID;
	var NoopSpan_5 = NoopSpan_1.INVALID_TRACE_ID;

	var NoopTracer_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOOP_TRACER = exports.NoopTracer = void 0;

	/**
	 * No-op implementations of {@link Tracer}.
	 */
	var NoopTracer = /** @class */ (function () {
	    function NoopTracer() {
	    }
	    NoopTracer.prototype.getCurrentSpan = function () {
	        return NoopSpan_1.NOOP_SPAN;
	    };
	    // startSpan starts a noop span.
	    NoopTracer.prototype.startSpan = function (name, options) {
	        return NoopSpan_1.NOOP_SPAN;
	    };
	    NoopTracer.prototype.withSpan = function (span, fn) {
	        return fn();
	    };
	    NoopTracer.prototype.bind = function (target, span) {
	        return target;
	    };
	    return NoopTracer;
	}());
	exports.NoopTracer = NoopTracer;
	exports.NOOP_TRACER = new NoopTracer();

	});

	unwrapExports(NoopTracer_1);
	var NoopTracer_2 = NoopTracer_1.NOOP_TRACER;
	var NoopTracer_3 = NoopTracer_1.NoopTracer;

	var NoopTracerProvider_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOOP_TRACER_PROVIDER = exports.NoopTracerProvider = void 0;

	/**
	 * An implementation of the {@link TracerProvider} which returns an impotent
	 * Tracer for all calls to `getTracer`.
	 *
	 * All operations are no-op.
	 */
	var NoopTracerProvider = /** @class */ (function () {
	    function NoopTracerProvider() {
	    }
	    NoopTracerProvider.prototype.getTracer = function (_name, _version) {
	        return NoopTracer_1.NOOP_TRACER;
	    };
	    return NoopTracerProvider;
	}());
	exports.NoopTracerProvider = NoopTracerProvider;
	exports.NOOP_TRACER_PROVIDER = new NoopTracerProvider();

	});

	unwrapExports(NoopTracerProvider_1);
	var NoopTracerProvider_2 = NoopTracerProvider_1.NOOP_TRACER_PROVIDER;
	var NoopTracerProvider_3 = NoopTracerProvider_1.NoopTracerProvider;

	var Sampler = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(Sampler);

	var SamplingResult = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SamplingDecision = void 0;
	/**
	 * A sampling decision that determines how a {@link Span} will be recorded
	 * and collected.
	 */
	var SamplingDecision;
	(function (SamplingDecision) {
	    /**
	     * `Span.isRecording() === false`, span will not be recorded and all events
	     * and attributes will be dropped.
	     */
	    SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
	    /**
	     * `Span.isRecording() === true`, but `Sampled` flag in {@link TraceFlags}
	     * MUST NOT be set.
	     */
	    SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
	    /**
	     * `Span.isRecording() === true` AND `Sampled` flag in {@link TraceFlags}
	     * MUST be set.
	     */
	    SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
	})(SamplingDecision = exports.SamplingDecision || (exports.SamplingDecision = {}));

	});

	unwrapExports(SamplingResult);
	var SamplingResult_1 = SamplingResult.SamplingDecision;

	var span_context = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(span_context);

	var span_kind = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SpanKind = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var SpanKind;
	(function (SpanKind) {
	    /** Default value. Indicates that the span is used internally. */
	    SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
	    /**
	     * Indicates that the span covers server-side handling of an RPC or other
	     * remote request.
	     */
	    SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
	    /**
	     * Indicates that the span covers the client-side wrapper around an RPC or
	     * other remote request.
	     */
	    SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
	    /**
	     * Indicates that the span describes producer sending a message to a
	     * broker. Unlike client and server, there is no direct critical path latency
	     * relationship between producer and consumer spans.
	     */
	    SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
	    /**
	     * Indicates that the span describes consumer receiving a message from a
	     * broker. Unlike client and server, there is no direct critical path latency
	     * relationship between producer and consumer spans.
	     */
	    SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
	})(SpanKind = exports.SpanKind || (exports.SpanKind = {}));

	});

	unwrapExports(span_kind);
	var span_kind_1 = span_kind.SpanKind;

	var span = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(span);

	var SpanOptions = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(SpanOptions);

	var status = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CanonicalCode = void 0;
	/**
	 * An enumeration of canonical status codes.
	 */
	var CanonicalCode;
	(function (CanonicalCode) {
	    /**
	     * Not an error; returned on success
	     */
	    CanonicalCode[CanonicalCode["OK"] = 0] = "OK";
	    /**
	     * The operation was cancelled (typically by the caller).
	     */
	    CanonicalCode[CanonicalCode["CANCELLED"] = 1] = "CANCELLED";
	    /**
	     * Unknown error.  An example of where this error may be returned is
	     * if a status value received from another address space belongs to
	     * an error-space that is not known in this address space.  Also
	     * errors raised by APIs that do not return enough error information
	     * may be converted to this error.
	     */
	    CanonicalCode[CanonicalCode["UNKNOWN"] = 2] = "UNKNOWN";
	    /**
	     * Client specified an invalid argument.  Note that this differs
	     * from FAILED_PRECONDITION.  INVALID_ARGUMENT indicates arguments
	     * that are problematic regardless of the state of the system
	     * (e.g., a malformed file name).
	     */
	    CanonicalCode[CanonicalCode["INVALID_ARGUMENT"] = 3] = "INVALID_ARGUMENT";
	    /**
	     * Deadline expired before operation could complete.  For operations
	     * that change the state of the system, this error may be returned
	     * even if the operation has completed successfully.  For example, a
	     * successful response from a server could have been delayed long
	     * enough for the deadline to expire.
	     */
	    CanonicalCode[CanonicalCode["DEADLINE_EXCEEDED"] = 4] = "DEADLINE_EXCEEDED";
	    /**
	     * Some requested entity (e.g., file or directory) was not found.
	     */
	    CanonicalCode[CanonicalCode["NOT_FOUND"] = 5] = "NOT_FOUND";
	    /**
	     * Some entity that we attempted to create (e.g., file or directory)
	     * already exists.
	     */
	    CanonicalCode[CanonicalCode["ALREADY_EXISTS"] = 6] = "ALREADY_EXISTS";
	    /**
	     * The caller does not have permission to execute the specified
	     * operation.  PERMISSION_DENIED must not be used for rejections
	     * caused by exhausting some resource (use RESOURCE_EXHAUSTED
	     * instead for those errors).  PERMISSION_DENIED must not be
	     * used if the caller can not be identified (use UNAUTHENTICATED
	     * instead for those errors).
	     */
	    CanonicalCode[CanonicalCode["PERMISSION_DENIED"] = 7] = "PERMISSION_DENIED";
	    /**
	     * Some resource has been exhausted, perhaps a per-user quota, or
	     * perhaps the entire file system is out of space.
	     */
	    CanonicalCode[CanonicalCode["RESOURCE_EXHAUSTED"] = 8] = "RESOURCE_EXHAUSTED";
	    /**
	     * Operation was rejected because the system is not in a state
	     * required for the operation's execution.  For example, directory
	     * to be deleted may be non-empty, an rmdir operation is applied to
	     * a non-directory, etc.
	     *
	     * A litmus test that may help a service implementor in deciding
	     * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
	     *
	     *  - Use UNAVAILABLE if the client can retry just the failing call.
	     *  - Use ABORTED if the client should retry at a higher-level
	     *    (e.g., restarting a read-modify-write sequence).
	     *  - Use FAILED_PRECONDITION if the client should not retry until
	     *    the system state has been explicitly fixed.  E.g., if an "rmdir"
	     *    fails because the directory is non-empty, FAILED_PRECONDITION
	     *    should be returned since the client should not retry unless
	     *    they have first fixed up the directory by deleting files from it.
	     *  - Use FAILED_PRECONDITION if the client performs conditional
	     *    REST Get/Update/Delete on a resource and the resource on the
	     *    server does not match the condition. E.g., conflicting
	     *    read-modify-write on the same resource.
	     */
	    CanonicalCode[CanonicalCode["FAILED_PRECONDITION"] = 9] = "FAILED_PRECONDITION";
	    /**
	     * The operation was aborted, typically due to a concurrency issue
	     * like sequencer check failures, transaction aborts, etc.
	     *
	     * See litmus test above for deciding between FAILED_PRECONDITION,
	     * ABORTED, and UNAVAILABLE.
	     */
	    CanonicalCode[CanonicalCode["ABORTED"] = 10] = "ABORTED";
	    /**
	     * Operation was attempted past the valid range.  E.g., seeking or
	     * reading past end of file.
	     *
	     * Unlike INVALID_ARGUMENT, this error indicates a problem that may
	     * be fixed if the system state changes. For example, a 32-bit file
	     * system will generate INVALID_ARGUMENT if asked to read at an
	     * offset that is not in the range [0,2^32-1], but it will generate
	     * OUT_OF_RANGE if asked to read from an offset past the current
	     * file size.
	     *
	     * There is a fair bit of overlap between FAILED_PRECONDITION and
	     * OUT_OF_RANGE.  We recommend using OUT_OF_RANGE (the more specific
	     * error) when it applies so that callers who are iterating through
	     * a space can easily look for an OUT_OF_RANGE error to detect when
	     * they are done.
	     */
	    CanonicalCode[CanonicalCode["OUT_OF_RANGE"] = 11] = "OUT_OF_RANGE";
	    /**
	     * Operation is not implemented or not supported/enabled in this service.
	     */
	    CanonicalCode[CanonicalCode["UNIMPLEMENTED"] = 12] = "UNIMPLEMENTED";
	    /**
	     * Internal errors.  Means some invariants expected by underlying
	     * system has been broken.  If you see one of these errors,
	     * something is very broken.
	     */
	    CanonicalCode[CanonicalCode["INTERNAL"] = 13] = "INTERNAL";
	    /**
	     * The service is currently unavailable.  This is a most likely a
	     * transient condition and may be corrected by retrying with
	     * a backoff.
	     *
	     * See litmus test above for deciding between FAILED_PRECONDITION,
	     * ABORTED, and UNAVAILABLE.
	     */
	    CanonicalCode[CanonicalCode["UNAVAILABLE"] = 14] = "UNAVAILABLE";
	    /**
	     * Unrecoverable data loss or corruption.
	     */
	    CanonicalCode[CanonicalCode["DATA_LOSS"] = 15] = "DATA_LOSS";
	    /**
	     * The request does not have valid authentication credentials for the
	     * operation.
	     */
	    CanonicalCode[CanonicalCode["UNAUTHENTICATED"] = 16] = "UNAUTHENTICATED";
	})(CanonicalCode = exports.CanonicalCode || (exports.CanonicalCode = {}));

	});

	unwrapExports(status);
	var status_1 = status.CanonicalCode;

	var TimedEvent = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(TimedEvent);

	var trace_state = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(trace_state);

	var tracer_provider = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(tracer_provider);

	var tracer = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(tracer);

	var globalThis_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._globalThis = void 0;
	/** only globals that common to node and browsers are allowed */
	// eslint-disable-next-line node/no-unsupported-features/es-builtins
	exports._globalThis = typeof globalThis === 'object' ? globalThis : commonjsGlobal;

	});

	unwrapExports(globalThis_1);
	var globalThis_2 = globalThis_1._globalThis;

	var node$1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(globalThis_1, exports);

	});

	unwrapExports(node$1);

	var platform$1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(node$1, exports);

	});

	unwrapExports(platform$1);

	var globalUtils = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.API_BACKWARDS_COMPATIBILITY_VERSION = exports.makeGetter = exports._global = exports.GLOBAL_TRACE_API_KEY = exports.GLOBAL_PROPAGATION_API_KEY = exports.GLOBAL_METRICS_API_KEY = exports.GLOBAL_CONTEXT_MANAGER_API_KEY = void 0;

	exports.GLOBAL_CONTEXT_MANAGER_API_KEY = Symbol.for('io.opentelemetry.js.api.context');
	exports.GLOBAL_METRICS_API_KEY = Symbol.for('io.opentelemetry.js.api.metrics');
	exports.GLOBAL_PROPAGATION_API_KEY = Symbol.for('io.opentelemetry.js.api.propagation');
	exports.GLOBAL_TRACE_API_KEY = Symbol.for('io.opentelemetry.js.api.trace');
	exports._global = platform$1._globalThis;
	/**
	 * Make a function which accepts a version integer and returns the instance of an API if the version
	 * is compatible, or a fallback version (usually NOOP) if it is not.
	 *
	 * @param requiredVersion Backwards compatibility version which is required to return the instance
	 * @param instance Instance which should be returned if the required version is compatible
	 * @param fallback Fallback instance, usually NOOP, which will be returned if the required version is not compatible
	 */
	function makeGetter(requiredVersion, instance, fallback) {
	    return function (version) {
	        return version === requiredVersion ? instance : fallback;
	    };
	}
	exports.makeGetter = makeGetter;
	/**
	 * A number which should be incremented each time a backwards incompatible
	 * change is made to the API. This number is used when an API package
	 * attempts to access the global API to ensure it is getting a compatible
	 * version. If the global API is not compatible with the API package
	 * attempting to get it, a NOOP API implementation will be returned.
	 */
	exports.API_BACKWARDS_COMPATIBILITY_VERSION = 0;

	});

	unwrapExports(globalUtils);
	var globalUtils_1 = globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION;
	var globalUtils_2 = globalUtils.makeGetter;
	var globalUtils_3 = globalUtils._global;
	var globalUtils_4 = globalUtils.GLOBAL_TRACE_API_KEY;
	var globalUtils_5 = globalUtils.GLOBAL_PROPAGATION_API_KEY;
	var globalUtils_6 = globalUtils.GLOBAL_METRICS_API_KEY;
	var globalUtils_7 = globalUtils.GLOBAL_CONTEXT_MANAGER_API_KEY;

	var context$2 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ContextAPI = void 0;


	var NOOP_CONTEXT_MANAGER = new src.NoopContextManager();
	/**
	 * Singleton object which represents the entry point to the OpenTelemetry Context API
	 */
	var ContextAPI = /** @class */ (function () {
	    /** Empty private constructor prevents end users from constructing a new instance of the API */
	    function ContextAPI() {
	    }
	    /** Get the singleton instance of the Context API */
	    ContextAPI.getInstance = function () {
	        if (!this._instance) {
	            this._instance = new ContextAPI();
	        }
	        return this._instance;
	    };
	    /**
	     * Set the current context manager. Returns the initialized context manager
	     */
	    ContextAPI.prototype.setGlobalContextManager = function (contextManager) {
	        if (globalUtils._global[globalUtils.GLOBAL_CONTEXT_MANAGER_API_KEY]) {
	            // global context manager has already been set
	            return this._getContextManager();
	        }
	        globalUtils._global[globalUtils.GLOBAL_CONTEXT_MANAGER_API_KEY] = globalUtils.makeGetter(globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION, contextManager, NOOP_CONTEXT_MANAGER);
	        return contextManager;
	    };
	    /**
	     * Get the currently active context
	     */
	    ContextAPI.prototype.active = function () {
	        return this._getContextManager().active();
	    };
	    /**
	     * Execute a function with an active context
	     *
	     * @param context context to be active during function execution
	     * @param fn function to execute in a context
	     */
	    ContextAPI.prototype.with = function (context, fn) {
	        return this._getContextManager().with(context, fn);
	    };
	    /**
	     * Bind a context to a target function or event emitter
	     *
	     * @param target function or event emitter to bind
	     * @param context context to bind to the event emitter or function. Defaults to the currently active context
	     */
	    ContextAPI.prototype.bind = function (target, context) {
	        if (context === void 0) { context = this.active(); }
	        return this._getContextManager().bind(target, context);
	    };
	    ContextAPI.prototype._getContextManager = function () {
	        var _a, _b;
	        return ((_b = (_a = globalUtils._global[globalUtils.GLOBAL_CONTEXT_MANAGER_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(globalUtils._global, globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : NOOP_CONTEXT_MANAGER);
	    };
	    /** Disable and remove the global context manager */
	    ContextAPI.prototype.disable = function () {
	        this._getContextManager().disable();
	        delete globalUtils._global[globalUtils.GLOBAL_CONTEXT_MANAGER_API_KEY];
	    };
	    return ContextAPI;
	}());
	exports.ContextAPI = ContextAPI;

	});

	unwrapExports(context$2);
	var context_1$2 = context$2.ContextAPI;

	var trace = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TraceAPI = void 0;


	/**
	 * Singleton object which represents the entry point to the OpenTelemetry Tracing API
	 */
	var TraceAPI = /** @class */ (function () {
	    /** Empty private constructor prevents end users from constructing a new instance of the API */
	    function TraceAPI() {
	    }
	    /** Get the singleton instance of the Trace API */
	    TraceAPI.getInstance = function () {
	        if (!this._instance) {
	            this._instance = new TraceAPI();
	        }
	        return this._instance;
	    };
	    /**
	     * Set the current global tracer. Returns the initialized global tracer provider
	     */
	    TraceAPI.prototype.setGlobalTracerProvider = function (provider) {
	        if (globalUtils._global[globalUtils.GLOBAL_TRACE_API_KEY]) {
	            // global tracer provider has already been set
	            return this.getTracerProvider();
	        }
	        globalUtils._global[globalUtils.GLOBAL_TRACE_API_KEY] = globalUtils.makeGetter(globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION, provider, NoopTracerProvider_1.NOOP_TRACER_PROVIDER);
	        return this.getTracerProvider();
	    };
	    /**
	     * Returns the global tracer provider.
	     */
	    TraceAPI.prototype.getTracerProvider = function () {
	        var _a, _b;
	        return ((_b = (_a = globalUtils._global[globalUtils.GLOBAL_TRACE_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(globalUtils._global, globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : NoopTracerProvider_1.NOOP_TRACER_PROVIDER);
	    };
	    /**
	     * Returns a tracer from the global tracer provider.
	     */
	    TraceAPI.prototype.getTracer = function (name, version) {
	        return this.getTracerProvider().getTracer(name, version);
	    };
	    /** Remove the global tracer provider */
	    TraceAPI.prototype.disable = function () {
	        delete globalUtils._global[globalUtils.GLOBAL_TRACE_API_KEY];
	    };
	    return TraceAPI;
	}());
	exports.TraceAPI = TraceAPI;

	});

	unwrapExports(trace);
	var trace_1 = trace.TraceAPI;

	var metrics = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MetricsAPI = void 0;


	/**
	 * Singleton object which represents the entry point to the OpenTelemetry Metrics API
	 */
	var MetricsAPI = /** @class */ (function () {
	    /** Empty private constructor prevents end users from constructing a new instance of the API */
	    function MetricsAPI() {
	    }
	    /** Get the singleton instance of the Metrics API */
	    MetricsAPI.getInstance = function () {
	        if (!this._instance) {
	            this._instance = new MetricsAPI();
	        }
	        return this._instance;
	    };
	    /**
	     * Set the current global meter. Returns the initialized global meter provider.
	     */
	    MetricsAPI.prototype.setGlobalMeterProvider = function (provider) {
	        if (globalUtils._global[globalUtils.GLOBAL_METRICS_API_KEY]) {
	            // global meter provider has already been set
	            return this.getMeterProvider();
	        }
	        globalUtils._global[globalUtils.GLOBAL_METRICS_API_KEY] = globalUtils.makeGetter(globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION, provider, NoopMeterProvider_1.NOOP_METER_PROVIDER);
	        return provider;
	    };
	    /**
	     * Returns the global meter provider.
	     */
	    MetricsAPI.prototype.getMeterProvider = function () {
	        var _a, _b;
	        return ((_b = (_a = globalUtils._global[globalUtils.GLOBAL_METRICS_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(globalUtils._global, globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : NoopMeterProvider_1.NOOP_METER_PROVIDER);
	    };
	    /**
	     * Returns a meter from the global meter provider.
	     */
	    MetricsAPI.prototype.getMeter = function (name, version) {
	        return this.getMeterProvider().getMeter(name, version);
	    };
	    /** Remove the global meter provider */
	    MetricsAPI.prototype.disable = function () {
	        delete globalUtils._global[globalUtils.GLOBAL_METRICS_API_KEY];
	    };
	    return MetricsAPI;
	}());
	exports.MetricsAPI = MetricsAPI;

	});

	unwrapExports(metrics);
	var metrics_1 = metrics.MetricsAPI;

	var propagation = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PropagationAPI = void 0;





	var contextApi = context$2.ContextAPI.getInstance();
	/**
	 * Singleton object which represents the entry point to the OpenTelemetry Propagation API
	 */
	var PropagationAPI = /** @class */ (function () {
	    /** Empty private constructor prevents end users from constructing a new instance of the API */
	    function PropagationAPI() {
	    }
	    /** Get the singleton instance of the Propagator API */
	    PropagationAPI.getInstance = function () {
	        if (!this._instance) {
	            this._instance = new PropagationAPI();
	        }
	        return this._instance;
	    };
	    /**
	     * Set the current propagator. Returns the initialized propagator
	     */
	    PropagationAPI.prototype.setGlobalPropagator = function (propagator) {
	        if (globalUtils._global[globalUtils.GLOBAL_PROPAGATION_API_KEY]) {
	            // global propagator has already been set
	            return this._getGlobalPropagator();
	        }
	        globalUtils._global[globalUtils.GLOBAL_PROPAGATION_API_KEY] = globalUtils.makeGetter(globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION, propagator, NoopHttpTextPropagator_1.NOOP_HTTP_TEXT_PROPAGATOR);
	        return propagator;
	    };
	    /**
	     * Inject context into a carrier to be propagated inter-process
	     *
	     * @param carrier carrier to inject context into
	     * @param setter Function used to set values on the carrier
	     * @param context Context carrying tracing data to inject. Defaults to the currently active context.
	     */
	    PropagationAPI.prototype.inject = function (carrier, setter$1, context) {
	        if (setter$1 === void 0) { setter$1 = setter.defaultSetter; }
	        if (context === void 0) { context = contextApi.active(); }
	        return this._getGlobalPropagator().inject(context, carrier, setter$1);
	    };
	    /**
	     * Extract context from a carrier
	     *
	     * @param carrier Carrier to extract context from
	     * @param getter Function used to extract keys from a carrier
	     * @param context Context which the newly created context will inherit from. Defaults to the currently active context.
	     */
	    PropagationAPI.prototype.extract = function (carrier, getter$1, context) {
	        if (getter$1 === void 0) { getter$1 = getter.defaultGetter; }
	        if (context === void 0) { context = contextApi.active(); }
	        return this._getGlobalPropagator().extract(context, carrier, getter$1);
	    };
	    /** Remove the global propagator */
	    PropagationAPI.prototype.disable = function () {
	        delete globalUtils._global[globalUtils.GLOBAL_PROPAGATION_API_KEY];
	    };
	    PropagationAPI.prototype._getGlobalPropagator = function () {
	        var _a, _b;
	        return ((_b = (_a = globalUtils._global[globalUtils.GLOBAL_PROPAGATION_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(globalUtils._global, globalUtils.API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : NoopHttpTextPropagator_1.NOOP_HTTP_TEXT_PROPAGATOR);
	    };
	    return PropagationAPI;
	}());
	exports.PropagationAPI = PropagationAPI;

	});

	unwrapExports(propagation);
	var propagation_1 = propagation.PropagationAPI;

	var src$1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.propagation = exports.metrics = exports.trace = exports.context = void 0;
	__exportStar(Logger, exports);
	__exportStar(Time, exports);
	__exportStar(getter, exports);
	__exportStar(HttpTextPropagator, exports);
	__exportStar(NoopHttpTextPropagator_1, exports);
	__exportStar(setter, exports);
	__exportStar(CorrelationContext, exports);
	__exportStar(EntryValue, exports);
	__exportStar(BatchObserverResult, exports);
	__exportStar(BoundInstrument, exports);
	__exportStar(Meter, exports);
	__exportStar(MeterProvider, exports);
	__exportStar(Metric, exports);
	__exportStar(NoopMeter_1, exports);
	__exportStar(NoopMeterProvider_1, exports);
	__exportStar(Observation, exports);
	__exportStar(ObserverResult, exports);
	__exportStar(attributes, exports);
	__exportStar(Event, exports);
	__exportStar(Plugin, exports);
	__exportStar(link_context, exports);
	__exportStar(link, exports);
	__exportStar(NoopSpan_1, exports);
	__exportStar(NoopTracer_1, exports);
	__exportStar(NoopTracerProvider_1, exports);
	__exportStar(Sampler, exports);
	__exportStar(SamplingResult, exports);
	__exportStar(span_context, exports);
	__exportStar(span_kind, exports);
	__exportStar(span, exports);
	__exportStar(SpanOptions, exports);
	__exportStar(status, exports);
	__exportStar(TimedEvent, exports);
	__exportStar(trace_flags, exports);
	__exportStar(trace_state, exports);
	__exportStar(tracer_provider, exports);
	__exportStar(tracer, exports);

	Object.defineProperty(exports, "Context", { enumerable: true, get: function () { return src.Context; } });

	/** Entrypoint for context API */
	exports.context = context$2.ContextAPI.getInstance();

	/** Entrypoint for trace API */
	exports.trace = trace.TraceAPI.getInstance();

	/** Entrypoint for metrics API */
	exports.metrics = metrics.MetricsAPI.getInstance();

	/** Entrypoint for propagation API */
	exports.propagation = propagation.PropagationAPI.getInstance();
	exports.default = {
	    trace: exports.trace,
	    metrics: exports.metrics,
	    context: exports.context,
	    propagation: exports.propagation,
	};

	});

	unwrapExports(src$1);
	var src_1 = src$1.propagation;
	var src_2 = src$1.metrics;
	var src_3 = src$1.trace;
	var src_4 = src$1.context;

	var B3Propagator_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.B3Propagator = exports.X_B3_SAMPLED = exports.X_B3_SPAN_ID = exports.X_B3_TRACE_ID = void 0;


	exports.X_B3_TRACE_ID = 'x-b3-traceid';
	exports.X_B3_SPAN_ID = 'x-b3-spanid';
	exports.X_B3_SAMPLED = 'x-b3-sampled';
	const VALID_TRACEID_REGEX = /^([0-9a-f]{16}){1,2}$/i;
	const VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
	const INVALID_ID_REGEX = /^0+$/i;
	function isValidTraceId(traceId) {
	    return VALID_TRACEID_REGEX.test(traceId) && !INVALID_ID_REGEX.test(traceId);
	}
	function isValidSpanId(spanId) {
	    return VALID_SPANID_REGEX.test(spanId) && !INVALID_ID_REGEX.test(spanId);
	}
	/**
	 * Propagator for the B3 HTTP header format.
	 * Based on: https://github.com/openzipkin/b3-propagation
	 */
	class B3Propagator {
	    inject(context, carrier, setter) {
	        const spanContext = context$1.getParentSpanContext(context);
	        if (!spanContext)
	            return;
	        if (isValidTraceId(spanContext.traceId) &&
	            isValidSpanId(spanContext.spanId)) {
	            setter(carrier, exports.X_B3_TRACE_ID, spanContext.traceId);
	            setter(carrier, exports.X_B3_SPAN_ID, spanContext.spanId);
	            // We set the header only if there is an existing sampling decision.
	            // Otherwise we will omit it => Absent.
	            if (spanContext.traceFlags !== undefined) {
	                setter(carrier, exports.X_B3_SAMPLED, (src$1.TraceFlags.SAMPLED & spanContext.traceFlags) === src$1.TraceFlags.SAMPLED
	                    ? '1'
	                    : '0');
	            }
	        }
	    }
	    extract(context, carrier, getter) {
	        const traceIdHeader = getter(carrier, exports.X_B3_TRACE_ID);
	        const spanIdHeader = getter(carrier, exports.X_B3_SPAN_ID);
	        const sampledHeader = getter(carrier, exports.X_B3_SAMPLED);
	        const traceIdHeaderValue = Array.isArray(traceIdHeader)
	            ? traceIdHeader[0]
	            : traceIdHeader;
	        const spanId = Array.isArray(spanIdHeader) ? spanIdHeader[0] : spanIdHeader;
	        const options = Array.isArray(sampledHeader)
	            ? sampledHeader[0]
	            : sampledHeader;
	        if (typeof traceIdHeaderValue !== 'string' || typeof spanId !== 'string') {
	            return context;
	        }
	        const traceId = traceIdHeaderValue.padStart(32, '0');
	        if (isValidTraceId(traceId) && isValidSpanId(spanId)) {
	            return context$1.setExtractedSpanContext(context, {
	                traceId,
	                spanId,
	                isRemote: true,
	                traceFlags: isNaN(Number(options)) ? src$1.TraceFlags.NONE : Number(options),
	            });
	        }
	        return context;
	    }
	}
	exports.B3Propagator = B3Propagator;

	});

	unwrapExports(B3Propagator_1);
	var B3Propagator_2 = B3Propagator_1.B3Propagator;
	var B3Propagator_3 = B3Propagator_1.X_B3_SAMPLED;
	var B3Propagator_4 = B3Propagator_1.X_B3_SPAN_ID;
	var B3Propagator_5 = B3Propagator_1.X_B3_TRACE_ID;

	var composite = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CompositePropagator = void 0;

	/** Combines multiple propagators into a single propagator. */
	class CompositePropagator {
	    /**
	     * Construct a composite propagator from a list of propagators.
	     *
	     * @param [config] Configuration object for composite propagator
	     */
	    constructor(config = {}) {
	        var _a, _b;
	        this._propagators = (_a = config.propagators) !== null && _a !== void 0 ? _a : [];
	        this._logger = (_b = config.logger) !== null && _b !== void 0 ? _b : new NoopLogger_1.NoopLogger();
	    }
	    /**
	     * Run each of the configured propagators with the given context and carrier.
	     * Propagators are run in the order they are configured, so if multiple
	     * propagators write the same carrier key, the propagator later in the list
	     * will "win".
	     *
	     * @param context Context to inject
	     * @param carrier Carrier into which context will be injected
	     */
	    inject(context, carrier, setter) {
	        for (const propagator of this._propagators) {
	            try {
	                propagator.inject(context, carrier, setter);
	            }
	            catch (err) {
	                this._logger.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
	            }
	        }
	    }
	    /**
	     * Run each of the configured propagators with the given context and carrier.
	     * Propagators are run in the order they are configured, so if multiple
	     * propagators write the same context key, the propagator later in the list
	     * will "win".
	     *
	     * @param context Context to add values to
	     * @param carrier Carrier from which to extract context
	     */
	    extract(context, carrier, getter) {
	        return this._propagators.reduce((ctx, propagator) => {
	            try {
	                return propagator.extract(ctx, carrier, getter);
	            }
	            catch (err) {
	                this._logger.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
	            }
	            return ctx;
	        }, context);
	    }
	}
	exports.CompositePropagator = CompositePropagator;

	});

	unwrapExports(composite);
	var composite_1 = composite.CompositePropagator;

	var validators = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.validateValue = exports.validateKey = void 0;
	const VALID_KEY_CHAR_RANGE = '[_0-9a-z-*/]';
	const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
	const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
	const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
	const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
	const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
	/**
	 * Key is opaque string up to 256 characters printable. It MUST begin with a
	 * lowercase letter, and can only contain lowercase letters a-z, digits 0-9,
	 * underscores _, dashes -, asterisks *, and forward slashes /.
	 * For multi-tenant vendor scenarios, an at sign (@) can be used to prefix the
	 * vendor name. Vendors SHOULD set the tenant ID at the beginning of the key.
	 * see https://www.w3.org/TR/trace-context/#key
	 */
	function validateKey(key) {
	    return VALID_KEY_REGEX.test(key);
	}
	exports.validateKey = validateKey;
	/**
	 * Value is opaque string up to 256 characters printable ASCII RFC0020
	 * characters (i.e., the range 0x20 to 0x7E) except comma , and =.
	 */
	function validateValue(value) {
	    return (VALID_VALUE_BASE_REGEX.test(value) &&
	        !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value));
	}
	exports.validateValue = validateValue;

	});

	unwrapExports(validators);
	var validators_1 = validators.validateValue;
	var validators_2 = validators.validateKey;

	var TraceState_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.TraceState = void 0;

	const MAX_TRACE_STATE_ITEMS = 32;
	const MAX_TRACE_STATE_LEN = 512;
	const LIST_MEMBERS_SEPARATOR = ',';
	const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';
	/**
	 * TraceState must be a class and not a simple object type because of the spec
	 * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
	 *
	 * Here is the list of allowed mutations:
	 * - New key-value pair should be added into the beginning of the list
	 * - The value of any key can be updated. Modified keys MUST be moved to the
	 * beginning of the list.
	 */
	class TraceState {
	    constructor(rawTraceState) {
	        this._internalState = new Map();
	        if (rawTraceState)
	            this._parse(rawTraceState);
	    }
	    set(key, value) {
	        // TODO: Benchmark the different approaches(map vs list) and
	        // use the faster one.
	        if (this._internalState.has(key))
	            this._internalState.delete(key);
	        this._internalState.set(key, value);
	    }
	    unset(key) {
	        this._internalState.delete(key);
	    }
	    get(key) {
	        return this._internalState.get(key);
	    }
	    serialize() {
	        return this._keys()
	            .reduce((agg, key) => {
	            agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
	            return agg;
	        }, [])
	            .join(LIST_MEMBERS_SEPARATOR);
	    }
	    _parse(rawTraceState) {
	        if (rawTraceState.length > MAX_TRACE_STATE_LEN)
	            return;
	        this._internalState = rawTraceState
	            .split(LIST_MEMBERS_SEPARATOR)
	            .reverse() // Store in reverse so new keys (.set(...)) will be placed at the beginning
	            .reduce((agg, part) => {
	            const i = part.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
	            if (i !== -1) {
	                const key = part.slice(0, i);
	                const value = part.slice(i + 1, part.length);
	                if (validators.validateKey(key) && validators.validateValue(value)) {
	                    agg.set(key, value);
	                }
	            }
	            return agg;
	        }, new Map());
	        // Because of the reverse() requirement, trunc must be done after map is created
	        if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
	            this._internalState = new Map(Array.from(this._internalState.entries())
	                .reverse() // Use reverse same as original tracestate parse chain
	                .slice(0, MAX_TRACE_STATE_ITEMS));
	        }
	    }
	    _keys() {
	        return Array.from(this._internalState.keys()).reverse();
	    }
	}
	exports.TraceState = TraceState;

	});

	unwrapExports(TraceState_1);
	var TraceState_2 = TraceState_1.TraceState;

	var HttpTraceContext_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HttpTraceContext = exports.parseTraceParent = exports.TRACE_STATE_HEADER = exports.TRACE_PARENT_HEADER = void 0;



	exports.TRACE_PARENT_HEADER = 'traceparent';
	exports.TRACE_STATE_HEADER = 'tracestate';
	const VALID_TRACE_PARENT_REGEX = /^(?!ff)[\da-f]{2}-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})(-|$)/;
	const VERSION = '00';
	/**
	 * Parses information from the [traceparent] span tag and converts it into {@link SpanContext}
	 * @param traceParent - A meta property that comes from server.
	 *     It should be dynamically generated server side to have the server's request trace Id,
	 *     a parent span Id that was set on the server's request span,
	 *     and the trace flags to indicate the server's sampling decision
	 *     (01 = sampled, 00 = not sampled).
	 *     for example: '{version}-{traceId}-{spanId}-{sampleDecision}'
	 *     For more information see {@link https://www.w3.org/TR/trace-context/}
	 */
	function parseTraceParent(traceParent) {
	    const match = traceParent.match(VALID_TRACE_PARENT_REGEX);
	    if (!match ||
	        match[1] === '00000000000000000000000000000000' ||
	        match[2] === '0000000000000000') {
	        return null;
	    }
	    return {
	        traceId: match[1],
	        spanId: match[2],
	        traceFlags: parseInt(match[3], 16),
	    };
	}
	exports.parseTraceParent = parseTraceParent;
	/**
	 * Propagates {@link SpanContext} through Trace Context format propagation.
	 *
	 * Based on the Trace Context specification:
	 * https://www.w3.org/TR/trace-context/
	 */
	class HttpTraceContext {
	    inject(context, carrier, setter) {
	        const spanContext = context$1.getParentSpanContext(context);
	        if (!spanContext)
	            return;
	        const traceParent = `${VERSION}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || src$1.TraceFlags.NONE).toString(16)}`;
	        setter(carrier, exports.TRACE_PARENT_HEADER, traceParent);
	        if (spanContext.traceState) {
	            setter(carrier, exports.TRACE_STATE_HEADER, spanContext.traceState.serialize());
	        }
	    }
	    extract(context, carrier, getter) {
	        const traceParentHeader = getter(carrier, exports.TRACE_PARENT_HEADER);
	        if (!traceParentHeader)
	            return context;
	        const traceParent = Array.isArray(traceParentHeader)
	            ? traceParentHeader[0]
	            : traceParentHeader;
	        if (typeof traceParent !== 'string')
	            return context;
	        const spanContext = parseTraceParent(traceParent);
	        if (!spanContext)
	            return context;
	        spanContext.isRemote = true;
	        const traceStateHeader = getter(carrier, exports.TRACE_STATE_HEADER);
	        if (traceStateHeader) {
	            // If more than one `tracestate` header is found, we merge them into a
	            // single header.
	            const state = Array.isArray(traceStateHeader)
	                ? traceStateHeader.join(',')
	                : traceStateHeader;
	            spanContext.traceState = new TraceState_1.TraceState(typeof state === 'string' ? state : undefined);
	        }
	        return context$1.setExtractedSpanContext(context, spanContext);
	    }
	}
	exports.HttpTraceContext = HttpTraceContext;

	});

	unwrapExports(HttpTraceContext_1);
	var HttpTraceContext_2 = HttpTraceContext_1.HttpTraceContext;
	var HttpTraceContext_3 = HttpTraceContext_1.parseTraceParent;
	var HttpTraceContext_4 = HttpTraceContext_1.TRACE_STATE_HEADER;
	var HttpTraceContext_5 = HttpTraceContext_1.TRACE_PARENT_HEADER;

	var types$2 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(types$2);

	var correlationContext = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.setCorrelationContext = exports.getCorrelationContext = void 0;

	const CORRELATION_CONTEXT = src.Context.createKey('OpenTelemetry Distributed Contexts Key');
	/**
	 * @param {Context} Context that manage all context values
	 * @returns {CorrelationContext} Extracted correlation context from the context
	 */
	function getCorrelationContext(context) {
	    return (context.getValue(CORRELATION_CONTEXT) || undefined);
	}
	exports.getCorrelationContext = getCorrelationContext;
	/**
	 * @param {Context} Context that manage all context values
	 * @param {CorrelationContext} correlation context that will be set in the actual context
	 */
	function setCorrelationContext(context, correlationContext) {
	    return context.setValue(CORRELATION_CONTEXT, correlationContext);
	}
	exports.setCorrelationContext = setCorrelationContext;

	});

	unwrapExports(correlationContext);
	var correlationContext_1 = correlationContext.setCorrelationContext;
	var correlationContext_2 = correlationContext.getCorrelationContext;

	var HttpCorrelationContext_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HttpCorrelationContext = exports.MAX_TOTAL_LENGTH = exports.MAX_PER_NAME_VALUE_PAIRS = exports.MAX_NAME_VALUE_PAIRS = exports.CORRELATION_CONTEXT_HEADER = void 0;

	const KEY_PAIR_SEPARATOR = '=';
	const PROPERTIES_SEPARATOR = ';';
	const ITEMS_SEPARATOR = ',';
	// Name of the http header used to propagate the correlation context
	exports.CORRELATION_CONTEXT_HEADER = 'otcorrelations';
	// Maximum number of name-value pairs allowed by w3c spec
	exports.MAX_NAME_VALUE_PAIRS = 180;
	// Maximum number of bytes per a single name-value pair allowed by w3c spec
	exports.MAX_PER_NAME_VALUE_PAIRS = 4096;
	// Maximum total length of all name-value pairs allowed by w3c spec
	exports.MAX_TOTAL_LENGTH = 8192;
	/**
	 * Propagates {@link CorrelationContext} through Context format propagation.
	 *
	 * Based on the Correlation Context specification:
	 * https://w3c.github.io/correlation-context/
	 */
	class HttpCorrelationContext {
	    inject(context, carrier, setter) {
	        const correlationContext$1 = correlationContext.getCorrelationContext(context);
	        if (!correlationContext$1)
	            return;
	        const keyPairs = this._getKeyPairs(correlationContext$1)
	            .filter((pair) => {
	            return pair.length <= exports.MAX_PER_NAME_VALUE_PAIRS;
	        })
	            .slice(0, exports.MAX_NAME_VALUE_PAIRS);
	        const headerValue = this._serializeKeyPairs(keyPairs);
	        if (headerValue.length > 0) {
	            setter(carrier, exports.CORRELATION_CONTEXT_HEADER, headerValue);
	        }
	    }
	    _serializeKeyPairs(keyPairs) {
	        return keyPairs.reduce((hValue, current) => {
	            const value = `${hValue}${hValue != '' ? ITEMS_SEPARATOR : ''}${current}`;
	            return value.length > exports.MAX_TOTAL_LENGTH ? hValue : value;
	        }, '');
	    }
	    _getKeyPairs(correlationContext) {
	        return Object.keys(correlationContext).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(correlationContext[key].value)}`);
	    }
	    extract(context, carrier, getter) {
	        const headerValue = getter(carrier, exports.CORRELATION_CONTEXT_HEADER);
	        if (!headerValue)
	            return context;
	        const correlationContext$1 = {};
	        if (headerValue.length == 0) {
	            return context;
	        }
	        const pairs = headerValue.split(ITEMS_SEPARATOR);
	        if (pairs.length == 1)
	            return context;
	        pairs.forEach(entry => {
	            const keyPair = this._parsePairKeyValue(entry);
	            if (keyPair) {
	                correlationContext$1[keyPair.key] = { value: keyPair.value };
	            }
	        });
	        return correlationContext.setCorrelationContext(context, correlationContext$1);
	    }
	    _parsePairKeyValue(entry) {
	        const valueProps = entry.split(PROPERTIES_SEPARATOR);
	        if (valueProps.length <= 0)
	            return;
	        const keyPairPart = valueProps.shift();
	        if (!keyPairPart)
	            return;
	        const keyPair = keyPairPart.split(KEY_PAIR_SEPARATOR);
	        if (keyPair.length <= 1)
	            return;
	        const key = decodeURIComponent(keyPair[0].trim());
	        let value = decodeURIComponent(keyPair[1].trim());
	        if (valueProps.length > 0) {
	            value =
	                value + PROPERTIES_SEPARATOR + valueProps.join(PROPERTIES_SEPARATOR);
	        }
	        return { key, value };
	    }
	}
	exports.HttpCorrelationContext = HttpCorrelationContext;

	});

	unwrapExports(HttpCorrelationContext_1);
	var HttpCorrelationContext_2 = HttpCorrelationContext_1.HttpCorrelationContext;
	var HttpCorrelationContext_3 = HttpCorrelationContext_1.MAX_TOTAL_LENGTH;
	var HttpCorrelationContext_4 = HttpCorrelationContext_1.MAX_PER_NAME_VALUE_PAIRS;
	var HttpCorrelationContext_5 = HttpCorrelationContext_1.MAX_NAME_VALUE_PAIRS;
	var HttpCorrelationContext_6 = HttpCorrelationContext_1.CORRELATION_CONTEXT_HEADER;

	var spancontextUtils = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isValid = exports.INVALID_SPAN_CONTEXT = exports.INVALID_TRACEID = exports.INVALID_SPANID = void 0;

	exports.INVALID_SPANID = '0';
	exports.INVALID_TRACEID = '0';
	exports.INVALID_SPAN_CONTEXT = {
	    traceId: exports.INVALID_TRACEID,
	    spanId: exports.INVALID_SPANID,
	    traceFlags: src$1.TraceFlags.NONE,
	};
	/**
	 * Returns true if this {@link SpanContext} is valid.
	 * @return true if this {@link SpanContext} is valid.
	 */
	function isValid(spanContext) {
	    return (spanContext.traceId !== exports.INVALID_TRACEID &&
	        spanContext.spanId !== exports.INVALID_SPANID);
	}
	exports.isValid = isValid;

	});

	unwrapExports(spancontextUtils);
	var spancontextUtils_1 = spancontextUtils.isValid;
	var spancontextUtils_2 = spancontextUtils.INVALID_SPAN_CONTEXT;
	var spancontextUtils_3 = spancontextUtils.INVALID_TRACEID;
	var spancontextUtils_4 = spancontextUtils.INVALID_SPANID;

	var NoRecordingSpan_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NoRecordingSpan = void 0;


	/**
	 * The NoRecordingSpan extends the {@link NoopSpan}, making all operations no-op
	 * except context propagation.
	 */
	class NoRecordingSpan extends src$1.NoopSpan {
	    constructor(spanContext) {
	        super(spanContext);
	        this._context = spanContext || spancontextUtils.INVALID_SPAN_CONTEXT;
	    }
	    // Returns a SpanContext.
	    context() {
	        return this._context;
	    }
	}
	exports.NoRecordingSpan = NoRecordingSpan;

	});

	unwrapExports(NoRecordingSpan_1);
	var NoRecordingSpan_2 = NoRecordingSpan_1.NoRecordingSpan;

	var AlwaysOffSampler_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AlwaysOffSampler = void 0;

	/** Sampler that samples no traces. */
	class AlwaysOffSampler {
	    shouldSample() {
	        return {
	            decision: src$1.SamplingDecision.NOT_RECORD,
	        };
	    }
	    toString() {
	        return `AlwaysOffSampler`;
	    }
	}
	exports.AlwaysOffSampler = AlwaysOffSampler;

	});

	unwrapExports(AlwaysOffSampler_1);
	var AlwaysOffSampler_2 = AlwaysOffSampler_1.AlwaysOffSampler;

	var AlwaysOnSampler_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AlwaysOnSampler = void 0;

	/** Sampler that samples all traces. */
	class AlwaysOnSampler {
	    shouldSample() {
	        return {
	            decision: src$1.SamplingDecision.RECORD_AND_SAMPLED,
	        };
	    }
	    toString() {
	        return `AlwaysOnSampler`;
	    }
	}
	exports.AlwaysOnSampler = AlwaysOnSampler;

	});

	unwrapExports(AlwaysOnSampler_1);
	var AlwaysOnSampler_2 = AlwaysOnSampler_1.AlwaysOnSampler;

	var ParentOrElseSampler_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ParentOrElseSampler = void 0;

	/**
	 * A composite sampler that either respects the parent span's sampling decision
	 * or delegates to `delegateSampler` for root spans.
	 */
	class ParentOrElseSampler {
	    constructor(_delegateSampler) {
	        this._delegateSampler = _delegateSampler;
	    }
	    shouldSample(parentContext, traceId, spanName, spanKind, attributes, links) {
	        // Respect the parent sampling decision if there is one
	        if (parentContext) {
	            return {
	                decision: (src$1.TraceFlags.SAMPLED & parentContext.traceFlags) === src$1.TraceFlags.SAMPLED
	                    ? src$1.SamplingDecision.RECORD_AND_SAMPLED
	                    : src$1.SamplingDecision.NOT_RECORD,
	            };
	        }
	        return this._delegateSampler.shouldSample(parentContext, traceId, spanName, spanKind, attributes, links);
	    }
	    toString() {
	        return `ParentOrElse{${this._delegateSampler.toString()}}`;
	    }
	}
	exports.ParentOrElseSampler = ParentOrElseSampler;

	});

	unwrapExports(ParentOrElseSampler_1);
	var ParentOrElseSampler_2 = ParentOrElseSampler_1.ParentOrElseSampler;

	var ProbabilitySampler_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ProbabilitySampler = void 0;

	/** Sampler that samples a given fraction of traces. */
	class ProbabilitySampler {
	    constructor(_probability = 0) {
	        this._probability = _probability;
	        this._probability = this._normalize(_probability);
	    }
	    shouldSample(parentContext) {
	        // Respect the parent sampling decision if there is one.
	        // TODO(#1284): add an option to ignore parent regarding to spec.
	        if (parentContext) {
	            return {
	                decision: (src$1.TraceFlags.SAMPLED & parentContext.traceFlags) === src$1.TraceFlags.SAMPLED
	                    ? src$1.SamplingDecision.RECORD_AND_SAMPLED
	                    : src$1.SamplingDecision.NOT_RECORD,
	            };
	        }
	        return {
	            decision: Math.random() < this._probability
	                ? src$1.SamplingDecision.RECORD_AND_SAMPLED
	                : src$1.SamplingDecision.NOT_RECORD,
	        };
	    }
	    toString() {
	        return `ProbabilitySampler{${this._probability}}`;
	    }
	    _normalize(probability) {
	        if (typeof probability !== 'number' || isNaN(probability))
	            return 0;
	        return probability >= 1 ? 1 : probability <= 0 ? 0 : probability;
	    }
	}
	exports.ProbabilitySampler = ProbabilitySampler;

	});

	unwrapExports(ProbabilitySampler_1);
	var ProbabilitySampler_2 = ProbabilitySampler_1.ProbabilitySampler;

	var IdGenerator = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(IdGenerator);

	var url = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isUrlIgnored = exports.urlMatches = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	function urlMatches(url, urlToMatch) {
	    if (typeof urlToMatch === 'string') {
	        return url === urlToMatch;
	    }
	    else {
	        return !!url.match(urlToMatch);
	    }
	}
	exports.urlMatches = urlMatches;
	/**
	 * Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
	 * @param url
	 * @param ignoredUrls
	 */
	function isUrlIgnored(url, ignoredUrls) {
	    if (!ignoredUrls) {
	        return false;
	    }
	    for (const ignoreUrl of ignoredUrls) {
	        if (urlMatches(url, ignoreUrl)) {
	            return true;
	        }
	    }
	    return false;
	}
	exports.isUrlIgnored = isUrlIgnored;

	});

	unwrapExports(url);
	var url_1 = url.isUrlIgnored;
	var url_2 = url.urlMatches;

	var wrap = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isWrapped = void 0;
	/**
	 * Checks if certain function has been already wrapped
	 * @param func
	 */
	function isWrapped(func) {
	    return (typeof func === 'function' &&
	        typeof func.__original === 'function' &&
	        typeof func.__unwrap === 'function' &&
	        func.__wrapped === true);
	}
	exports.isWrapped = isWrapped;

	});

	unwrapExports(wrap);
	var wrap_1 = wrap.isWrapped;

	var src$2 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(ConsoleLogger_1, exports);
	__exportStar(NoopLogger_1, exports);
	__exportStar(time, exports);
	__exportStar(types, exports);
	__exportStar(ExportResult_1, exports);
	__exportStar(version, exports);
	__exportStar(context$1, exports);
	__exportStar(B3Propagator_1, exports);
	__exportStar(composite, exports);
	__exportStar(HttpTraceContext_1, exports);
	__exportStar(types$2, exports);
	__exportStar(correlationContext, exports);
	__exportStar(HttpCorrelationContext_1, exports);
	__exportStar(platform, exports);
	__exportStar(NoRecordingSpan_1, exports);
	__exportStar(AlwaysOffSampler_1, exports);
	__exportStar(AlwaysOnSampler_1, exports);
	__exportStar(ParentOrElseSampler_1, exports);
	__exportStar(ProbabilitySampler_1, exports);
	__exportStar(spancontextUtils, exports);
	__exportStar(TraceState_1, exports);
	__exportStar(IdGenerator, exports);
	__exportStar(url, exports);
	__exportStar(wrap, exports);

	});

	unwrapExports(src$2);

	var time$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hrTimeToEpochNanoSeconds = void 0;

	function hrTimeToEpochNanoSeconds(time) {
	    return BigInt(src$2.hrTimeToMilliseconds(time)) * BigInt('1000000');
	}
	exports.hrTimeToEpochNanoSeconds = hrTimeToEpochNanoSeconds;
	function getTimestamp() {
	    return BigInt(Date.now()) * BigInt(1000000);
	}
	exports.default = getTimestamp;

	});

	unwrapExports(time$1);
	var time_1$1 = time$1.hrTimeToEpochNanoSeconds;

	var BigIntJSONPatch = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	BigInt.prototype.toJSON = function BigIntToString() { return this.toString(); };
	exports.default = {};

	});

	unwrapExports(BigIntJSONPatch);

	var template_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	function render(value) {
	    if (value == null)
	        return value;
	    if (typeof value === 'object') {
	        return JSON.stringify(value);
	    }
	    return String(value);
	}
	function getIn(path, fromArgs) {
	    let p, cP, c = fromArgs, i = 0;
	    while ((p = path[i++]) != null && (c = c[p]) != null)
	        cP = c;
	    return cP;
	}
	function template(templ, args = {}) {
	    const consumed = [], argsCopy = Object.assign({}, args);
	    const message = templ.replace(/\{([\w-.]+)\}/g, substr => {
	        const key = substr.replace(/[}{]/g, ''), raw = key.indexOf('.') === -1 ? args[key] : getIn(key.split('.'), args);
	        let value;
	        if ((value = render(raw)) != null) {
	            consumed.push({ key, value });
	            delete argsCopy[key];
	            return value;
	        }
	        else
	            return key;
	    });
	    const remaining = Object.keys(argsCopy).map(key => ({ key, value: argsCopy[key] }));
	    return { message, consumed, remaining };
	}
	exports.default = template;

	});

	unwrapExports(template_1);

	/**
	 * A JavaScript implementation of the SHA family of hashes - defined in FIPS PUB 180-4, FIPS PUB 202,
	 * and SP 800-185 - as well as the corresponding HMAC implementation as defined in FIPS PUB 198-1.
	 *
	 * Copyright 2008-2020 Brian Turek, 1998-2009 Paul Johnston & Contributors
	 * Distributed under the BSD License
	 * See http://caligatio.github.com/jsSHA/ for more information
	 */
	const t$5="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function n(t,n,e,r){let i,s,o;const h=n||[0],u=(e=e||0)>>>3,w=-1===r?3:0;for(i=0;i<t.length;i+=1)o=i+u,s=o>>>2,h.length<=s&&h.push(0),h[s]|=t[i]<<8*(w+r*(o%4));return {value:h,binLen:8*t.length+e}}function e(e,r,i){switch(r){case"UTF8":case"UTF16BE":case"UTF16LE":break;default:throw new Error("encoding must be UTF8, UTF16BE, or UTF16LE")}switch(e){case"HEX":return function(t,n,e){return function(t,n,e,r){let i,s,o,h;if(0!=t.length%2)throw new Error("String of HEX type must be in byte increments");const u=n||[0],w=(e=e||0)>>>3,c=-1===r?3:0;for(i=0;i<t.length;i+=2){if(s=parseInt(t.substr(i,2),16),isNaN(s))throw new Error("String of HEX type contains invalid characters");for(h=(i>>>1)+w,o=h>>>2;u.length<=o;)u.push(0);u[o]|=s<<8*(c+r*(h%4));}return {value:u,binLen:4*t.length+e}}(t,n,e,i)};case"TEXT":return function(t,n,e){return function(t,n,e,r,i){let s,o,h,u,w,c,f,a,l=0;const A=e||[0],E=(r=r||0)>>>3;if("UTF8"===n)for(f=-1===i?3:0,h=0;h<t.length;h+=1)for(s=t.charCodeAt(h),o=[],128>s?o.push(s):2048>s?(o.push(192|s>>>6),o.push(128|63&s)):55296>s||57344<=s?o.push(224|s>>>12,128|s>>>6&63,128|63&s):(h+=1,s=65536+((1023&s)<<10|1023&t.charCodeAt(h)),o.push(240|s>>>18,128|s>>>12&63,128|s>>>6&63,128|63&s)),u=0;u<o.length;u+=1){for(c=l+E,w=c>>>2;A.length<=w;)A.push(0);A[w]|=o[u]<<8*(f+i*(c%4)),l+=1;}else for(f=-1===i?2:0,a="UTF16LE"===n&&1!==i||"UTF16LE"!==n&&1===i,h=0;h<t.length;h+=1){for(s=t.charCodeAt(h),!0===a&&(u=255&s,s=u<<8|s>>>8),c=l+E,w=c>>>2;A.length<=w;)A.push(0);A[w]|=s<<8*(f+i*(c%4)),l+=2;}return {value:A,binLen:8*l+r}}(t,r,n,e,i)};case"B64":return function(n,e,r){return function(n,e,r,i){let s,o,h,u,w,c,f,a=0;const l=e||[0],A=(r=r||0)>>>3,E=-1===i?3:0,H=n.indexOf("=");if(-1===n.search(/^[a-zA-Z0-9=+/]+$/))throw new Error("Invalid character in base-64 string");if(n=n.replace(/=/g,""),-1!==H&&H<n.length)throw new Error("Invalid '=' found in base-64 string");for(o=0;o<n.length;o+=4){for(w=n.substr(o,4),u=0,h=0;h<w.length;h+=1)s=t$5.indexOf(w.charAt(h)),u|=s<<18-6*h;for(h=0;h<w.length-1;h+=1){for(f=a+A,c=f>>>2;l.length<=c;)l.push(0);l[c]|=(u>>>16-8*h&255)<<8*(E+i*(f%4)),a+=1;}}return {value:l,binLen:8*a+r}}(n,e,r,i)};case"BYTES":return function(t,n,e){return function(t,n,e,r){let i,s,o,h;const u=n||[0],w=(e=e||0)>>>3,c=-1===r?3:0;for(s=0;s<t.length;s+=1)i=t.charCodeAt(s),h=s+w,o=h>>>2,u.length<=o&&u.push(0),u[o]|=i<<8*(c+r*(h%4));return {value:u,binLen:8*t.length+e}}(t,n,e,i)};case"ARRAYBUFFER":try{new ArrayBuffer(0);}catch(t){throw new Error("ARRAYBUFFER not supported by this environment")}return function(t,e,r){return function(t,e,r,i){return n(new Uint8Array(t),e,r,i)}(t,e,r,i)};case"UINT8ARRAY":try{new Uint8Array(0);}catch(t){throw new Error("UINT8ARRAY not supported by this environment")}return function(t,e,r){return n(t,e,r,i)};default:throw new Error("format must be HEX, TEXT, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY")}}function r(n,e,r,i){switch(n){case"HEX":return function(t){return function(t,n,e,r){let i,s,o="";const h=n/8,u=-1===e?3:0;for(i=0;i<h;i+=1)s=t[i>>>2]>>>8*(u+e*(i%4)),o+="0123456789abcdef".charAt(s>>>4&15)+"0123456789abcdef".charAt(15&s);return r.outputUpper?o.toUpperCase():o}(t,e,r,i)};case"B64":return function(n){return function(n,e,r,i){let s,o,h,u,w,c="";const f=e/8,a=-1===r?3:0;for(s=0;s<f;s+=3)for(u=s+1<f?n[s+1>>>2]:0,w=s+2<f?n[s+2>>>2]:0,h=(n[s>>>2]>>>8*(a+r*(s%4))&255)<<16|(u>>>8*(a+r*((s+1)%4))&255)<<8|w>>>8*(a+r*((s+2)%4))&255,o=0;o<4;o+=1)c+=8*s+6*o<=e?t$5.charAt(h>>>6*(3-o)&63):i.b64Pad;return c}(n,e,r,i)};case"BYTES":return function(t){return function(t,n,e){let r,i,s="";const o=n/8,h=-1===e?3:0;for(r=0;r<o;r+=1)i=t[r>>>2]>>>8*(h+e*(r%4))&255,s+=String.fromCharCode(i);return s}(t,e,r)};case"ARRAYBUFFER":try{new ArrayBuffer(0);}catch(t){throw new Error("ARRAYBUFFER not supported by this environment")}return function(t){return function(t,n,e){let r;const i=n/8,s=new ArrayBuffer(i),o=new Uint8Array(s),h=-1===e?3:0;for(r=0;r<i;r+=1)o[r]=t[r>>>2]>>>8*(h+e*(r%4))&255;return s}(t,e,r)};case"UINT8ARRAY":try{new Uint8Array(0);}catch(t){throw new Error("UINT8ARRAY not supported by this environment")}return function(t){return function(t,n,e){let r;const i=n/8,s=-1===e?3:0,o=new Uint8Array(i);for(r=0;r<i;r+=1)o[r]=t[r>>>2]>>>8*(s+e*(r%4))&255;return o}(t,e,r)};default:throw new Error("format must be HEX, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY")}}const i=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],s=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428],o=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],h="Chosen SHA variant is not supported";function u(t,n){let e,r;const i=t.binLen>>>3,s=n.binLen>>>3,o=i<<3,h=4-i<<3;if(i%4!=0){for(e=0;e<s;e+=4)r=i+e>>>2,t.value[r]|=n.value[e>>>2]<<o,t.value.push(0),t.value[r+1]|=n.value[e>>>2]>>>h;return (t.value.length<<2)-4>=s+i&&t.value.pop(),{value:t.value,binLen:t.binLen+n.binLen}}return {value:t.value.concat(n.value),binLen:t.binLen+n.binLen}}function w(t){const n={outputUpper:!1,b64Pad:"=",outputLen:-1},e=t||{},r="Output length must be a multiple of 8";if(n.outputUpper=e.outputUpper||!1,e.b64Pad&&(n.b64Pad=e.b64Pad),e.outputLen){if(e.outputLen%8!=0)throw new Error(r);n.outputLen=e.outputLen;}else if(e.shakeLen){if(e.shakeLen%8!=0)throw new Error(r);n.outputLen=e.shakeLen;}if("boolean"!=typeof n.outputUpper)throw new Error("Invalid outputUpper formatting option");if("string"!=typeof n.b64Pad)throw new Error("Invalid b64Pad formatting option");return n}function c(t,n,r,i){const s=t+" must include a value and format";if(!n){if(!i)throw new Error(s);return i}if(void 0===n.value||!n.format)throw new Error(s);return e(n.format,n.encoding||"UTF8",r)(n.value)}class f{constructor(t,n,e){const r=e||{};if(this.t=n,this.i=r.encoding||"UTF8",this.numRounds=r.numRounds||1,isNaN(this.numRounds)||this.numRounds!==parseInt(this.numRounds,10)||1>this.numRounds)throw new Error("numRounds must a integer >= 1");this.s=t,this.o=[],this.h=0,this.u=!1,this.l=0,this.A=!1,this.H=[],this.S=[];}update(t){let n,e=0;const r=this.p>>>5,i=this.m(t,this.o,this.h),s=i.binLen,o=i.value,h=s>>>5;for(n=0;n<h;n+=r)e+this.p<=s&&(this.C=this.R(o.slice(n,n+r),this.C),e+=this.p);this.l+=e,this.o=o.slice(e>>>5),this.h=s%this.p,this.u=!0;}getHash(t,n){let e,i,s=this.U;const o=w(n);if(this.v){if(-1===o.outputLen)throw new Error("Output length must be specified in options");s=o.outputLen;}const h=r(t,s,this.K,o);if(this.A&&this.T)return h(this.T(o));for(i=this.F(this.o.slice(),this.h,this.l,this.g(this.C),s),e=1;e<this.numRounds;e+=1)this.v&&s%32!=0&&(i[i.length-1]&=16777215>>>24-s%32),i=this.F(i,s,0,this.B(this.s),s);return h(i)}setHMACKey(t,n,r){if(!this.L)throw new Error("Variant does not support HMAC");if(this.u)throw new Error("Cannot set MAC key after calling update");const i=e(n,(r||{}).encoding||"UTF8",this.K);this.M(i(t));}M(t){const n=this.p>>>3,e=n/4-1;let r;if(1!==this.numRounds)throw new Error("Cannot set numRounds with MAC");if(this.A)throw new Error("MAC key already set");for(n<t.binLen/8&&(t.value=this.F(t.value,t.binLen,0,this.B(this.s),this.U));t.value.length<=e;)t.value.push(0);for(r=0;r<=e;r+=1)this.H[r]=909522486^t.value[r],this.S[r]=1549556828^t.value[r];this.C=this.R(this.H,this.C),this.l=this.p,this.A=!0;}getHMAC(t,n){const e=w(n);return r(t,this.U,this.K,e)(this.k())}k(){let t;if(!this.A)throw new Error("Cannot call getHMAC without first setting MAC key");const n=this.F(this.o.slice(),this.h,this.l,this.g(this.C),this.U);return t=this.R(this.S,this.B(this.s)),t=this.F(n,this.U,this.p,t,this.U),t}}function a(t,n){return t<<n|t>>>32-n}function l(t,n){return t>>>n|t<<32-n}function A(t,n){return t>>>n}function E(t,n,e){return t^n^e}function H(t,n,e){return t&n^~t&e}function S(t,n,e){return t&n^t&e^n&e}function b(t){return l(t,2)^l(t,13)^l(t,22)}function p(t,n){const e=(65535&t)+(65535&n);return (65535&(t>>>16)+(n>>>16)+(e>>>16))<<16|65535&e}function d(t,n,e,r){const i=(65535&t)+(65535&n)+(65535&e)+(65535&r);return (65535&(t>>>16)+(n>>>16)+(e>>>16)+(r>>>16)+(i>>>16))<<16|65535&i}function m(t,n,e,r,i){const s=(65535&t)+(65535&n)+(65535&e)+(65535&r)+(65535&i);return (65535&(t>>>16)+(n>>>16)+(e>>>16)+(r>>>16)+(i>>>16)+(s>>>16))<<16|65535&s}function C(t){return l(t,7)^l(t,18)^A(t,3)}function y(t){return l(t,6)^l(t,11)^l(t,25)}function R(t){return [1732584193,4023233417,2562383102,271733878,3285377520]}function U(t,n){let e,r,i,s,o,h,u;const w=[];for(e=n[0],r=n[1],i=n[2],s=n[3],o=n[4],u=0;u<80;u+=1)w[u]=u<16?t[u]:a(w[u-3]^w[u-8]^w[u-14]^w[u-16],1),h=u<20?m(a(e,5),H(r,i,s),o,1518500249,w[u]):u<40?m(a(e,5),E(r,i,s),o,1859775393,w[u]):u<60?m(a(e,5),S(r,i,s),o,2400959708,w[u]):m(a(e,5),E(r,i,s),o,3395469782,w[u]),o=s,s=i,i=a(r,30),r=e,e=h;return n[0]=p(e,n[0]),n[1]=p(r,n[1]),n[2]=p(i,n[2]),n[3]=p(s,n[3]),n[4]=p(o,n[4]),n}function v(t,n,e,r){let i;const s=15+(n+65>>>9<<4),o=n+e;for(;t.length<=s;)t.push(0);for(t[n>>>5]|=128<<24-n%32,t[s]=4294967295&o,t[s-1]=o/4294967296|0,i=0;i<t.length;i+=16)r=U(t.slice(i,i+16),r);return r}class K extends f{constructor(t,n,r){if("SHA-1"!==t)throw new Error(h);super(t,n,r);const i=r||{};this.L=!0,this.T=this.k,this.K=-1,this.m=e(this.t,this.i,this.K),this.R=U,this.g=function(t){return t.slice()},this.B=R,this.F=v,this.C=[1732584193,4023233417,2562383102,271733878,3285377520],this.p=512,this.U=160,this.v=!1,i.hmacKey&&this.M(c("hmacKey",i.hmacKey,this.K));}}function T(t){let n;return n="SHA-224"==t?s.slice():o.slice(),n}function F(t,n){let e,r,s,o,h,u,w,c,f,a,E;const R=[];for(e=n[0],r=n[1],s=n[2],o=n[3],h=n[4],u=n[5],w=n[6],c=n[7],E=0;E<64;E+=1)R[E]=E<16?t[E]:d(l(U=R[E-2],17)^l(U,19)^A(U,10),R[E-7],C(R[E-15]),R[E-16]),f=m(c,y(h),H(h,u,w),i[E],R[E]),a=p(b(e),S(e,r,s)),c=w,w=u,u=h,h=p(o,f),o=s,s=r,r=e,e=p(f,a);var U;return n[0]=p(e,n[0]),n[1]=p(r,n[1]),n[2]=p(s,n[2]),n[3]=p(o,n[3]),n[4]=p(h,n[4]),n[5]=p(u,n[5]),n[6]=p(w,n[6]),n[7]=p(c,n[7]),n}class g extends f{constructor(t,n,r){if("SHA-224"!==t&&"SHA-256"!==t)throw new Error(h);super(t,n,r);const i=r||{};this.T=this.k,this.L=!0,this.K=-1,this.m=e(this.t,this.i,this.K),this.R=F,this.g=function(t){return t.slice()},this.B=T,this.F=function(n,e,r,i){return function(t,n,e,r,i){let s,o;const h=15+(n+65>>>9<<4),u=n+e;for(;t.length<=h;)t.push(0);for(t[n>>>5]|=128<<24-n%32,t[h]=4294967295&u,t[h-1]=u/4294967296|0,s=0;s<t.length;s+=16)r=F(t.slice(s,s+16),r);return o="SHA-224"===i?[r[0],r[1],r[2],r[3],r[4],r[5],r[6]]:r,o}(n,e,r,i,t)},this.C=T(t),this.p=512,this.U="SHA-224"===t?224:256,this.v=!1,i.hmacKey&&this.M(c("hmacKey",i.hmacKey,this.K));}}class B{constructor(t,n){this.Y=t,this.N=n;}}function L(t,n){let e;return n>32?(e=64-n,new B(t.N<<n|t.Y>>>e,t.Y<<n|t.N>>>e)):0!==n?(e=32-n,new B(t.Y<<n|t.N>>>e,t.N<<n|t.Y>>>e)):t}function M(t,n){let e;return n<32?(e=32-n,new B(t.Y>>>n|t.N<<e,t.N>>>n|t.Y<<e)):(e=64-n,new B(t.N>>>n|t.Y<<e,t.Y>>>n|t.N<<e))}function k(t,n){return new B(t.Y>>>n,t.N>>>n|t.Y<<32-n)}function Y(t,n,e){return new B(t.Y&n.Y^t.Y&e.Y^n.Y&e.Y,t.N&n.N^t.N&e.N^n.N&e.N)}function N(t){const n=M(t,28),e=M(t,34),r=M(t,39);return new B(n.Y^e.Y^r.Y,n.N^e.N^r.N)}function I(t,n){let e,r;e=(65535&t.N)+(65535&n.N),r=(t.N>>>16)+(n.N>>>16)+(e>>>16);const i=(65535&r)<<16|65535&e;return e=(65535&t.Y)+(65535&n.Y)+(r>>>16),r=(t.Y>>>16)+(n.Y>>>16)+(e>>>16),new B((65535&r)<<16|65535&e,i)}function X(t,n,e,r){let i,s;i=(65535&t.N)+(65535&n.N)+(65535&e.N)+(65535&r.N),s=(t.N>>>16)+(n.N>>>16)+(e.N>>>16)+(r.N>>>16)+(i>>>16);const o=(65535&s)<<16|65535&i;return i=(65535&t.Y)+(65535&n.Y)+(65535&e.Y)+(65535&r.Y)+(s>>>16),s=(t.Y>>>16)+(n.Y>>>16)+(e.Y>>>16)+(r.Y>>>16)+(i>>>16),new B((65535&s)<<16|65535&i,o)}function z(t,n,e,r,i){let s,o;s=(65535&t.N)+(65535&n.N)+(65535&e.N)+(65535&r.N)+(65535&i.N),o=(t.N>>>16)+(n.N>>>16)+(e.N>>>16)+(r.N>>>16)+(i.N>>>16)+(s>>>16);const h=(65535&o)<<16|65535&s;return s=(65535&t.Y)+(65535&n.Y)+(65535&e.Y)+(65535&r.Y)+(65535&i.Y)+(o>>>16),o=(t.Y>>>16)+(n.Y>>>16)+(e.Y>>>16)+(r.Y>>>16)+(i.Y>>>16)+(s>>>16),new B((65535&o)<<16|65535&s,h)}function x(t,n){return new B(t.Y^n.Y,t.N^n.N)}function _(t){const n=M(t,19),e=M(t,61),r=k(t,6);return new B(n.Y^e.Y^r.Y,n.N^e.N^r.N)}function O(t){const n=M(t,1),e=M(t,8),r=k(t,7);return new B(n.Y^e.Y^r.Y,n.N^e.N^r.N)}function P(t){const n=M(t,14),e=M(t,18),r=M(t,41);return new B(n.Y^e.Y^r.Y,n.N^e.N^r.N)}const V=[new B(i[0],3609767458),new B(i[1],602891725),new B(i[2],3964484399),new B(i[3],2173295548),new B(i[4],4081628472),new B(i[5],3053834265),new B(i[6],2937671579),new B(i[7],3664609560),new B(i[8],2734883394),new B(i[9],1164996542),new B(i[10],1323610764),new B(i[11],3590304994),new B(i[12],4068182383),new B(i[13],991336113),new B(i[14],633803317),new B(i[15],3479774868),new B(i[16],2666613458),new B(i[17],944711139),new B(i[18],2341262773),new B(i[19],2007800933),new B(i[20],1495990901),new B(i[21],1856431235),new B(i[22],3175218132),new B(i[23],2198950837),new B(i[24],3999719339),new B(i[25],766784016),new B(i[26],2566594879),new B(i[27],3203337956),new B(i[28],1034457026),new B(i[29],2466948901),new B(i[30],3758326383),new B(i[31],168717936),new B(i[32],1188179964),new B(i[33],1546045734),new B(i[34],1522805485),new B(i[35],2643833823),new B(i[36],2343527390),new B(i[37],1014477480),new B(i[38],1206759142),new B(i[39],344077627),new B(i[40],1290863460),new B(i[41],3158454273),new B(i[42],3505952657),new B(i[43],106217008),new B(i[44],3606008344),new B(i[45],1432725776),new B(i[46],1467031594),new B(i[47],851169720),new B(i[48],3100823752),new B(i[49],1363258195),new B(i[50],3750685593),new B(i[51],3785050280),new B(i[52],3318307427),new B(i[53],3812723403),new B(i[54],2003034995),new B(i[55],3602036899),new B(i[56],1575990012),new B(i[57],1125592928),new B(i[58],2716904306),new B(i[59],442776044),new B(i[60],593698344),new B(i[61],3733110249),new B(i[62],2999351573),new B(i[63],3815920427),new B(3391569614,3928383900),new B(3515267271,566280711),new B(3940187606,3454069534),new B(4118630271,4000239992),new B(116418474,1914138554),new B(174292421,2731055270),new B(289380356,3203993006),new B(460393269,320620315),new B(685471733,587496836),new B(852142971,1086792851),new B(1017036298,365543100),new B(1126000580,2618297676),new B(1288033470,3409855158),new B(1501505948,4234509866),new B(1607167915,987167468),new B(1816402316,1246189591)];function Z(t){return "SHA-384"===t?[new B(3418070365,s[0]),new B(1654270250,s[1]),new B(2438529370,s[2]),new B(355462360,s[3]),new B(1731405415,s[4]),new B(41048885895,s[5]),new B(3675008525,s[6]),new B(1203062813,s[7])]:[new B(o[0],4089235720),new B(o[1],2227873595),new B(o[2],4271175723),new B(o[3],1595750129),new B(o[4],2917565137),new B(o[5],725511199),new B(o[6],4215389547),new B(o[7],327033209)]}function j(t,n){let e,r,i,s,o,h,u,w,c,f,a,l;const A=[];for(e=n[0],r=n[1],i=n[2],s=n[3],o=n[4],h=n[5],u=n[6],w=n[7],a=0;a<80;a+=1)a<16?(l=2*a,A[a]=new B(t[l],t[l+1])):A[a]=X(_(A[a-2]),A[a-7],O(A[a-15]),A[a-16]),c=z(w,P(o),(H=h,S=u,new B((E=o).Y&H.Y^~E.Y&S.Y,E.N&H.N^~E.N&S.N)),V[a],A[a]),f=I(N(e),Y(e,r,i)),w=u,u=h,h=o,o=I(s,c),s=i,i=r,r=e,e=I(c,f);var E,H,S;return n[0]=I(e,n[0]),n[1]=I(r,n[1]),n[2]=I(i,n[2]),n[3]=I(s,n[3]),n[4]=I(o,n[4]),n[5]=I(h,n[5]),n[6]=I(u,n[6]),n[7]=I(w,n[7]),n}class q extends f{constructor(t,n,r){if("SHA-384"!==t&&"SHA-512"!==t)throw new Error(h);super(t,n,r);const i=r||{};this.T=this.k,this.L=!0,this.K=-1,this.m=e(this.t,this.i,this.K),this.R=j,this.g=function(t){return t.slice()},this.B=Z,this.F=function(n,e,r,i){return function(t,n,e,r,i){let s,o;const h=31+(n+129>>>10<<5),u=n+e;for(;t.length<=h;)t.push(0);for(t[n>>>5]|=128<<24-n%32,t[h]=4294967295&u,t[h-1]=u/4294967296|0,s=0;s<t.length;s+=32)r=j(t.slice(s,s+32),r);return o="SHA-384"===i?[(r=r)[0].Y,r[0].N,r[1].Y,r[1].N,r[2].Y,r[2].N,r[3].Y,r[3].N,r[4].Y,r[4].N,r[5].Y,r[5].N]:[r[0].Y,r[0].N,r[1].Y,r[1].N,r[2].Y,r[2].N,r[3].Y,r[3].N,r[4].Y,r[4].N,r[5].Y,r[5].N,r[6].Y,r[6].N,r[7].Y,r[7].N],o}(n,e,r,i,t)},this.C=Z(t),this.p=1024,this.U="SHA-384"===t?384:512,this.v=!1,i.hmacKey&&this.M(c("hmacKey",i.hmacKey,this.K));}}const D=[new B(0,1),new B(0,32898),new B(2147483648,32906),new B(2147483648,2147516416),new B(0,32907),new B(0,2147483649),new B(2147483648,2147516545),new B(2147483648,32777),new B(0,138),new B(0,136),new B(0,2147516425),new B(0,2147483658),new B(0,2147516555),new B(2147483648,139),new B(2147483648,32905),new B(2147483648,32771),new B(2147483648,32770),new B(2147483648,128),new B(0,32778),new B(2147483648,2147483658),new B(2147483648,2147516545),new B(2147483648,32896),new B(0,2147483649),new B(2147483648,2147516424)],G=[[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];function J(t){let n;const e=[];for(n=0;n<5;n+=1)e[n]=[new B(0,0),new B(0,0),new B(0,0),new B(0,0),new B(0,0)];return e}function Q(t){let n;const e=[];for(n=0;n<5;n+=1)e[n]=t[n].slice();return e}function W(t,n){let e,r,i,s;const o=[],h=[];if(null!==t)for(r=0;r<t.length;r+=2)n[(r>>>1)%5][(r>>>1)/5|0]=x(n[(r>>>1)%5][(r>>>1)/5|0],new B(t[r+1],t[r]));for(e=0;e<24;e+=1){for(s=J(),r=0;r<5;r+=1)o[r]=(u=n[r][0],w=n[r][1],c=n[r][2],f=n[r][3],a=n[r][4],new B(u.Y^w.Y^c.Y^f.Y^a.Y,u.N^w.N^c.N^f.N^a.N));for(r=0;r<5;r+=1)h[r]=x(o[(r+4)%5],L(o[(r+1)%5],1));for(r=0;r<5;r+=1)for(i=0;i<5;i+=1)n[r][i]=x(n[r][i],h[r]);for(r=0;r<5;r+=1)for(i=0;i<5;i+=1)s[i][(2*r+3*i)%5]=L(n[r][i],G[r][i]);for(r=0;r<5;r+=1)for(i=0;i<5;i+=1)n[r][i]=x(s[r][i],new B(~s[(r+1)%5][i].Y&s[(r+2)%5][i].Y,~s[(r+1)%5][i].N&s[(r+2)%5][i].N));n[0][0]=x(n[0][0],D[e]);}var u,w,c,f,a;return n}function $(t){let n,e,r=0;const i=[0,0],s=[4294967295&t,t/4294967296&2097151];for(n=6;n>=0;n--)e=s[n>>2]>>>8*n&255,0===e&&0===r||(i[r+1>>2]|=e<<8*(r+1),r+=1);return r=0!==r?r:1,i[0]|=r,{value:r+1>4?i:[i[0]],binLen:8+8*r}}function tt(t){return u($(t.binLen),t)}function nt(t,n){let e,r=$(n);r=u(r,t);const i=n>>>2,s=(i-r.value.length%i)%i;for(e=0;e<s;e++)r.value.push(0);return r.value}class et extends f{constructor(t,n,r){let i=6,s=0;super(t,n,r);const o=r||{};if(1!==this.numRounds){if(o.kmacKey||o.hmacKey)throw new Error("Cannot set numRounds with MAC");if("CSHAKE128"===this.s||"CSHAKE256"===this.s)throw new Error("Cannot set numRounds for CSHAKE variants")}switch(this.K=1,this.m=e(this.t,this.i,this.K),this.R=W,this.g=Q,this.B=J,this.C=J(),this.v=!1,t){case"SHA3-224":this.p=s=1152,this.U=224,this.L=!0,this.T=this.k;break;case"SHA3-256":this.p=s=1088,this.U=256,this.L=!0,this.T=this.k;break;case"SHA3-384":this.p=s=832,this.U=384,this.L=!0,this.T=this.k;break;case"SHA3-512":this.p=s=576,this.U=512,this.L=!0,this.T=this.k;break;case"SHAKE128":i=31,this.p=s=1344,this.U=-1,this.v=!0,this.L=!1,this.T=null;break;case"SHAKE256":i=31,this.p=s=1088,this.U=-1,this.v=!0,this.L=!1,this.T=null;break;case"KMAC128":i=4,this.p=s=1344,this.I(r),this.U=-1,this.v=!0,this.L=!1,this.T=this.X;break;case"KMAC256":i=4,this.p=s=1088,this.I(r),this.U=-1,this.v=!0,this.L=!1,this.T=this.X;break;case"CSHAKE128":this.p=s=1344,i=this._(r),this.U=-1,this.v=!0,this.L=!1,this.T=null;break;case"CSHAKE256":this.p=s=1088,i=this._(r),this.U=-1,this.v=!0,this.L=!1,this.T=null;break;default:throw new Error(h)}this.F=function(t,n,e,r,o){return function(t,n,e,r,i,s,o){let h,u,w=0;const c=[],f=i>>>5,a=n>>>5;for(h=0;h<a&&n>=i;h+=f)r=W(t.slice(h,h+f),r),n-=i;for(t=t.slice(h),n%=i;t.length<f;)t.push(0);for(h=n>>>3,t[h>>2]^=s<<h%4*8,t[f-1]^=2147483648,r=W(t,r);32*c.length<o&&(u=r[w%5][w/5|0],c.push(u.N),!(32*c.length>=o));)c.push(u.Y),w+=1,0==64*w%i&&(W(null,r),w=0);return c}(t,n,0,r,s,i,o)},o.hmacKey&&this.M(c("hmacKey",o.hmacKey,this.K));}_(t,n){const e=function(t){const n=t||{};return {funcName:c("funcName",n.funcName,1,{value:[],binLen:0}),customization:c("Customization",n.customization,1,{value:[],binLen:0})}}(t||{});n&&(e.funcName=n);const r=u(tt(e.funcName),tt(e.customization));if(0!==e.customization.binLen||0!==e.funcName.binLen){const t=nt(r,this.p>>>3);for(let n=0;n<t.length;n+=this.p>>>5)this.C=this.R(t.slice(n,n+(this.p>>>5)),this.C),this.l+=this.p;return 4}return 31}I(t){const n=function(t){const n=t||{};return {kmacKey:c("kmacKey",n.kmacKey,1),funcName:{value:[1128353099],binLen:32},customization:c("Customization",n.customization,1,{value:[],binLen:0})}}(t||{});this._(t,n.funcName);const e=nt(tt(n.kmacKey),this.p>>>3);for(let t=0;t<e.length;t+=this.p>>>5)this.C=this.R(e.slice(t,t+(this.p>>>5)),this.C),this.l+=this.p;this.A=!0;}X(t){const n=u({value:this.o.slice(),binLen:this.h},function(t){let n,e,r=0;const i=[0,0],s=[4294967295&t,t/4294967296&2097151];for(n=6;n>=0;n--)e=s[n>>2]>>>8*n&255,0===e&&0===r||(i[r>>2]|=e<<8*r,r+=1);return r=0!==r?r:1,i[r>>2]|=r<<8*r,{value:r+1>4?i:[i[0]],binLen:8+8*r}}(t.outputLen));return this.F(n.value,n.binLen,this.l,this.g(this.C),t.outputLen)}}class sha{constructor(t,n,e){if("SHA-1"==t)this.O=new K(t,n,e);else if("SHA-224"==t||"SHA-256"==t)this.O=new g(t,n,e);else if("SHA-384"==t||"SHA-512"==t)this.O=new q(t,n,e);else {if("SHA3-224"!=t&&"SHA3-256"!=t&&"SHA3-384"!=t&&"SHA3-512"!=t&&"SHAKE128"!=t&&"SHAKE256"!=t&&"CSHAKE128"!=t&&"CSHAKE256"!=t&&"KMAC128"!=t&&"KMAC256"!=t)throw new Error(h);this.O=new et(t,n,e);}}update(t){this.O.update(t);}getHash(t,n){return this.O.getHash(t,n)}setHMACKey(t,n,e){this.O.setHMACKey(t,n,e);}getHMAC(t,n){return this.O.getHMAC(t,n)}}

	var sha$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': sha
	});

	var require$$0 = getCjsExportFromNamespace(sha$1);

	var hasher = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hexDigest = void 0;
	const jssha_1 = __importDefault(require$$0);
	function traverse(o, state, func) {
	    return Object.keys(o).sort().reduce((currState, key) => {
	        if (o[key] != null && typeof o[key] === "object") {
	            return traverse(o[key], currState, func);
	        }
	        else {
	            return func.apply(this, [currState, key, o[key]]);
	        }
	    }, state);
	}
	function normalise(o) {
	    return traverse(o, '', (state, key, value) => {
	        return `${state + key}\t${value}\n`;
	    });
	}
	function bufToB64(buffer) {
	    if (typeof window === 'undefined') {
	        return Buffer.from(buffer).toString('base64');
	    }
	    else {
	        let binary = '';
	        const bytes = new Uint8Array(buffer);
	        for (let i = 0; i < bytes.byteLength; i++) {
	            binary += String.fromCharCode(bytes[i]);
	        }
	        return window.btoa(binary);
	    }
	}
	function hexDigest(o) {
	    const hasher = new jssha_1.default('SHA-256', 'TEXT');
	    const normalised = normalise(o);
	    hasher.update(normalised);
	    const buf = hasher.getHash('ARRAYBUFFER');
	    return bufToB64(buf.slice(0, 16));
	}
	exports.hexDigest = hexDigest;

	});

	unwrapExports(hasher);
	var hasher_1 = hasher.hexDigest;

	var message = createCommonjsModule(function (module, exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ForgetUserMessage = exports.IdentifyUserMessage = exports.SetUserPropertyMessage = exports.SpanMessage = exports.EventMessage = exports.LogLevel = void 0;
	const template_1$1 = __importDefault(template_1);


	const time_1 = __importStar(time$1);
	var LogLevel;
	(function (LogLevel) {
	    LogLevel[LogLevel["verbose"] = 1] = "verbose";
	    LogLevel[LogLevel["debug"] = 2] = "debug";
	    LogLevel[LogLevel["info"] = 3] = "info";
	    LogLevel[LogLevel["warn"] = 4] = "warn";
	    LogLevel[LogLevel["error"] = 5] = "error";
	    LogLevel[LogLevel["fatal"] = 6] = "fatal";
	})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
	class EventMessage {
	    constructor(event, monetaryValue = null, error = null, level = LogLevel.info, timestamp = time_1.default(), fields = {}, context = {}, name = [], parentSpanId) {
	        this.event = event;
	        this.monetaryValue = monetaryValue;
	        this.error = error;
	        this.level = level;
	        this.fields = fields;
	        this.context = context;
	        this.name = name;
	        this.parentSpanId = parentSpanId;
	        this.type = 'event';
	        const vars = this.error == null ? Object.assign(Object.assign({}, fields), context) : Object.assign(Object.assign(Object.assign({}, fields), context), { error: this.error });
	        this.timestamp = timestamp || time_1.default();
	        this.templated = template_1$1.default(event, vars);
	        this.id = hasher.hexDigest(this);
	    }
	    static ofTimedEvent(te, parentSpanId) {
	        const timestamp = time_1.hrTimeToEpochNanoSeconds(te.time);
	        return new EventMessage(te.name, null, null, LogLevel.info, timestamp, {}, {}, [], parentSpanId);
	    }
	}
	exports.EventMessage = EventMessage;
	class SpanMessage {
	    constructor(spanContext, label, level = LogLevel.info, kind = src$1.SpanKind.CLIENT, status = { code: src$1.CanonicalCode.OK }, events = [], attrs = {}, context = {}, started = time_1.default(), finished) {
	        this.spanContext = spanContext;
	        this.label = label;
	        this.level = level;
	        this.kind = kind;
	        this.status = status;
	        this.events = events;
	        this.attrs = attrs;
	        this.context = context;
	        this.type = 'span';
	        this.started = started || time_1.default();
	        this.finished = finished || this.started + BigInt(1);
	        this.id = hasher.hexDigest(this);
	    }
	    get name() { return [this.label]; }
	    get timestamp() { return this.started; }
	    get fields() { return this.attrs; }
	    static ofReadableSpan(rs) {
	        const level = rs.attributes['error'] === true ? LogLevel.error : LogLevel.info;
	        return new SpanMessage(rs.spanContext, rs.name, level, rs.kind, rs.status, rs.events.map(e => EventMessage.ofTimedEvent(e, rs.spanContext.spanId)), rs.attributes, {}, time_1.hrTimeToEpochNanoSeconds(rs.startTime), time_1.hrTimeToEpochNanoSeconds(rs.endTime));
	    }
	}
	exports.SpanMessage = SpanMessage;
	class SetUserPropertyMessage {
	    constructor(userId, key, value, name, timestamp = null, id) {
	        this.userId = userId;
	        this.key = key;
	        this.value = value;
	        this.name = name;
	        this.type = 'setUserProperty';
	        this.level = LogLevel.info;
	        this.fields = {};
	        this.context = {};
	        this.timestamp = timestamp || time_1.default();
	        this.id = id || hasher.hexDigest(this);
	    }
	}
	exports.SetUserPropertyMessage = SetUserPropertyMessage;
	class IdentifyUserMessage {
	    constructor(prevUserId, nextUserId, level = LogLevel.info, fields = {}, context = {}, name = [], timestamp = null) {
	        this.prevUserId = prevUserId;
	        this.nextUserId = nextUserId;
	        this.level = level;
	        this.fields = fields;
	        this.context = context;
	        this.name = name;
	        this.type = 'identifyUser';
	        this.timestamp = timestamp || time_1.default();
	        this.id = hasher.hexDigest(this);
	    }
	}
	exports.IdentifyUserMessage = IdentifyUserMessage;
	class ForgetUserMessage {
	    constructor(userId, name = [], fields = {}, context = {}, parentSpanId, timestamp) {
	        this.userId = userId;
	        this.name = name;
	        this.fields = fields;
	        this.context = context;
	        this.parentSpanId = parentSpanId;
	        this.type = 'forgetUser';
	        this.name = name;
	        this.level = LogLevel.info;
	        this.timestamp = timestamp || time_1.default();
	        this.id = hasher.hexDigest(this);
	    }
	}
	exports.ForgetUserMessage = ForgetUserMessage;

	});

	unwrapExports(message);
	var message_1 = message.ForgetUserMessage;
	var message_2 = message.IdentifyUserMessage;
	var message_3 = message.SetUserPropertyMessage;
	var message_4 = message.SpanMessage;
	var message_5 = message.EventMessage;
	var message_6 = message.LogLevel;

	var adaptLogFunction_1 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const time_1 = __importDefault(time$1);

	const known = new Set([
	    'type', 'id', 'timestamp', 'level',
	    'name', 'fields', 'context',
	    'monetaryValue',
	    'error'
	]);
	function getPartialMessage(thing) {
	    const fields = {};
	    const o = {};
	    if (thing == null)
	        return { fields };
	    for (const k of Object.keys(thing)) {
	        if (Object.prototype.hasOwnProperty.call(thing, k)) {
	            if (known.has(k)) {
	                o[k] = thing[k];
	            }
	            else {
	                fields[k] = thing[k];
	            }
	        }
	    }
	    return Object.assign(Object.assign({}, o), { fields });
	}
	function adaptLogFunction(level, message$1, ...args) {
	    const timestamp = time_1.default();
	    const o = args != null && args.length !== 0 && typeof args[0] === 'object'
	        ? getPartialMessage(args[0])
	        : {};
	    return Object.assign(Object.assign(Object.assign({}, (new message.EventMessage(message$1, o.monetaryValue || null, o.error || null, level, timestamp, o.fields || {}, o.context || {}, o.name || []))), o), { type: 'event' });
	}
	exports.default = adaptLogFunction;

	});

	unwrapExports(adaptLogFunction_1);

	var ensureMessageId_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	function ensureMessageId(m) {
	    return Object.assign(Object.assign({}, m), { id: hasher.hexDigest(m) });
	}
	exports.default = ensureMessageId;

	});

	unwrapExports(ensureMessageId_1);

	var utils = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hexDigest = exports.ensureMessageId = exports.adaptLogFunction = void 0;

	Object.defineProperty(exports, "adaptLogFunction", { enumerable: true, get: function () { return __importDefault(adaptLogFunction_1).default; } });

	Object.defineProperty(exports, "ensureMessageId", { enumerable: true, get: function () { return __importDefault(ensureMessageId_1).default; } });

	Object.defineProperty(exports, "hexDigest", { enumerable: true, get: function () { return hasher.hexDigest; } });

	});

	unwrapExports(utils);
	var utils_1 = utils.hexDigest;
	var utils_2 = utils.ensureMessageId;
	var utils_3 = utils.adaptLogFunction;

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function isFunction(x) {
	    return typeof x === 'function';
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var _enable_super_gross_mode_that_will_cause_bad_things = false;
	var config = {
	    Promise: undefined,
	    set useDeprecatedSynchronousErrorHandling(value) {
	        if (value) {
	            var error = /*@__PURE__*/ new Error();
	            /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
	        }
	        _enable_super_gross_mode_that_will_cause_bad_things = value;
	    },
	    get useDeprecatedSynchronousErrorHandling() {
	        return _enable_super_gross_mode_that_will_cause_bad_things;
	    },
	};

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function hostReportError(err) {
	    setTimeout(function () { throw err; }, 0);
	}

	/** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
	var empty = {
	    closed: true,
	    next: function (value) { },
	    error: function (err) {
	        if (config.useDeprecatedSynchronousErrorHandling) {
	            throw err;
	        }
	        else {
	            hostReportError(err);
	        }
	    },
	    complete: function () { }
	};

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var isArray = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function isObject(x) {
	    return x !== null && typeof x === 'object';
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
	    function UnsubscriptionErrorImpl(errors) {
	        Error.call(this);
	        this.message = errors ?
	            errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
	        this.name = 'UnsubscriptionError';
	        this.errors = errors;
	        return this;
	    }
	    UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
	    return UnsubscriptionErrorImpl;
	})();
	var UnsubscriptionError = UnsubscriptionErrorImpl;

	/** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
	var Subscription = /*@__PURE__*/ (function () {
	    function Subscription(unsubscribe) {
	        this.closed = false;
	        this._parentOrParents = null;
	        this._subscriptions = null;
	        if (unsubscribe) {
	            this._ctorUnsubscribe = true;
	            this._unsubscribe = unsubscribe;
	        }
	    }
	    Subscription.prototype.unsubscribe = function () {
	        var errors;
	        if (this.closed) {
	            return;
	        }
	        var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
	        this.closed = true;
	        this._parentOrParents = null;
	        this._subscriptions = null;
	        if (_parentOrParents instanceof Subscription) {
	            _parentOrParents.remove(this);
	        }
	        else if (_parentOrParents !== null) {
	            for (var index = 0; index < _parentOrParents.length; ++index) {
	                var parent_1 = _parentOrParents[index];
	                parent_1.remove(this);
	            }
	        }
	        if (isFunction(_unsubscribe)) {
	            if (_ctorUnsubscribe) {
	                this._unsubscribe = undefined;
	            }
	            try {
	                _unsubscribe.call(this);
	            }
	            catch (e) {
	                errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
	            }
	        }
	        if (isArray(_subscriptions)) {
	            var index = -1;
	            var len = _subscriptions.length;
	            while (++index < len) {
	                var sub = _subscriptions[index];
	                if (isObject(sub)) {
	                    try {
	                        sub.unsubscribe();
	                    }
	                    catch (e) {
	                        errors = errors || [];
	                        if (e instanceof UnsubscriptionError) {
	                            errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
	                        }
	                        else {
	                            errors.push(e);
	                        }
	                    }
	                }
	            }
	        }
	        if (errors) {
	            throw new UnsubscriptionError(errors);
	        }
	    };
	    Subscription.prototype.add = function (teardown) {
	        var subscription = teardown;
	        if (!teardown) {
	            return Subscription.EMPTY;
	        }
	        switch (typeof teardown) {
	            case 'function':
	                subscription = new Subscription(teardown);
	            case 'object':
	                if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
	                    return subscription;
	                }
	                else if (this.closed) {
	                    subscription.unsubscribe();
	                    return subscription;
	                }
	                else if (!(subscription instanceof Subscription)) {
	                    var tmp = subscription;
	                    subscription = new Subscription();
	                    subscription._subscriptions = [tmp];
	                }
	                break;
	            default: {
	                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
	            }
	        }
	        var _parentOrParents = subscription._parentOrParents;
	        if (_parentOrParents === null) {
	            subscription._parentOrParents = this;
	        }
	        else if (_parentOrParents instanceof Subscription) {
	            if (_parentOrParents === this) {
	                return subscription;
	            }
	            subscription._parentOrParents = [_parentOrParents, this];
	        }
	        else if (_parentOrParents.indexOf(this) === -1) {
	            _parentOrParents.push(this);
	        }
	        else {
	            return subscription;
	        }
	        var subscriptions = this._subscriptions;
	        if (subscriptions === null) {
	            this._subscriptions = [subscription];
	        }
	        else {
	            subscriptions.push(subscription);
	        }
	        return subscription;
	    };
	    Subscription.prototype.remove = function (subscription) {
	        var subscriptions = this._subscriptions;
	        if (subscriptions) {
	            var subscriptionIndex = subscriptions.indexOf(subscription);
	            if (subscriptionIndex !== -1) {
	                subscriptions.splice(subscriptionIndex, 1);
	            }
	        }
	    };
	    Subscription.EMPTY = (function (empty) {
	        empty.closed = true;
	        return empty;
	    }(new Subscription()));
	    return Subscription;
	}());
	function flattenUnsubscriptionErrors(errors) {
	    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var rxSubscriber = /*@__PURE__*/ (function () {
	    return typeof Symbol === 'function'
	        ? /*@__PURE__*/ Symbol('rxSubscriber')
	        : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
	})();

	/** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
	var Subscriber = /*@__PURE__*/ (function (_super) {
	    __extends(Subscriber, _super);
	    function Subscriber(destinationOrNext, error, complete) {
	        var _this = _super.call(this) || this;
	        _this.syncErrorValue = null;
	        _this.syncErrorThrown = false;
	        _this.syncErrorThrowable = false;
	        _this.isStopped = false;
	        switch (arguments.length) {
	            case 0:
	                _this.destination = empty;
	                break;
	            case 1:
	                if (!destinationOrNext) {
	                    _this.destination = empty;
	                    break;
	                }
	                if (typeof destinationOrNext === 'object') {
	                    if (destinationOrNext instanceof Subscriber) {
	                        _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
	                        _this.destination = destinationOrNext;
	                        destinationOrNext.add(_this);
	                    }
	                    else {
	                        _this.syncErrorThrowable = true;
	                        _this.destination = new SafeSubscriber(_this, destinationOrNext);
	                    }
	                    break;
	                }
	            default:
	                _this.syncErrorThrowable = true;
	                _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
	                break;
	        }
	        return _this;
	    }
	    Subscriber.prototype[rxSubscriber] = function () { return this; };
	    Subscriber.create = function (next, error, complete) {
	        var subscriber = new Subscriber(next, error, complete);
	        subscriber.syncErrorThrowable = false;
	        return subscriber;
	    };
	    Subscriber.prototype.next = function (value) {
	        if (!this.isStopped) {
	            this._next(value);
	        }
	    };
	    Subscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            this.isStopped = true;
	            this._error(err);
	        }
	    };
	    Subscriber.prototype.complete = function () {
	        if (!this.isStopped) {
	            this.isStopped = true;
	            this._complete();
	        }
	    };
	    Subscriber.prototype.unsubscribe = function () {
	        if (this.closed) {
	            return;
	        }
	        this.isStopped = true;
	        _super.prototype.unsubscribe.call(this);
	    };
	    Subscriber.prototype._next = function (value) {
	        this.destination.next(value);
	    };
	    Subscriber.prototype._error = function (err) {
	        this.destination.error(err);
	        this.unsubscribe();
	    };
	    Subscriber.prototype._complete = function () {
	        this.destination.complete();
	        this.unsubscribe();
	    };
	    Subscriber.prototype._unsubscribeAndRecycle = function () {
	        var _parentOrParents = this._parentOrParents;
	        this._parentOrParents = null;
	        this.unsubscribe();
	        this.closed = false;
	        this.isStopped = false;
	        this._parentOrParents = _parentOrParents;
	        return this;
	    };
	    return Subscriber;
	}(Subscription));
	var SafeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SafeSubscriber, _super);
	    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
	        var _this = _super.call(this) || this;
	        _this._parentSubscriber = _parentSubscriber;
	        var next;
	        var context = _this;
	        if (isFunction(observerOrNext)) {
	            next = observerOrNext;
	        }
	        else if (observerOrNext) {
	            next = observerOrNext.next;
	            error = observerOrNext.error;
	            complete = observerOrNext.complete;
	            if (observerOrNext !== empty) {
	                context = Object.create(observerOrNext);
	                if (isFunction(context.unsubscribe)) {
	                    _this.add(context.unsubscribe.bind(context));
	                }
	                context.unsubscribe = _this.unsubscribe.bind(_this);
	            }
	        }
	        _this._context = context;
	        _this._next = next;
	        _this._error = error;
	        _this._complete = complete;
	        return _this;
	    }
	    SafeSubscriber.prototype.next = function (value) {
	        if (!this.isStopped && this._next) {
	            var _parentSubscriber = this._parentSubscriber;
	            if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
	                this.__tryOrUnsub(this._next, value);
	            }
	            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var _parentSubscriber = this._parentSubscriber;
	            var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
	            if (this._error) {
	                if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
	                    this.__tryOrUnsub(this._error, err);
	                    this.unsubscribe();
	                }
	                else {
	                    this.__tryOrSetError(_parentSubscriber, this._error, err);
	                    this.unsubscribe();
	                }
	            }
	            else if (!_parentSubscriber.syncErrorThrowable) {
	                this.unsubscribe();
	                if (useDeprecatedSynchronousErrorHandling) {
	                    throw err;
	                }
	                hostReportError(err);
	            }
	            else {
	                if (useDeprecatedSynchronousErrorHandling) {
	                    _parentSubscriber.syncErrorValue = err;
	                    _parentSubscriber.syncErrorThrown = true;
	                }
	                else {
	                    hostReportError(err);
	                }
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.complete = function () {
	        var _this = this;
	        if (!this.isStopped) {
	            var _parentSubscriber = this._parentSubscriber;
	            if (this._complete) {
	                var wrappedComplete = function () { return _this._complete.call(_this._context); };
	                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
	                    this.__tryOrUnsub(wrappedComplete);
	                    this.unsubscribe();
	                }
	                else {
	                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
	                    this.unsubscribe();
	                }
	            }
	            else {
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
	        try {
	            fn.call(this._context, value);
	        }
	        catch (err) {
	            this.unsubscribe();
	            if (config.useDeprecatedSynchronousErrorHandling) {
	                throw err;
	            }
	            else {
	                hostReportError(err);
	            }
	        }
	    };
	    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
	        if (!config.useDeprecatedSynchronousErrorHandling) {
	            throw new Error('bad call');
	        }
	        try {
	            fn.call(this._context, value);
	        }
	        catch (err) {
	            if (config.useDeprecatedSynchronousErrorHandling) {
	                parent.syncErrorValue = err;
	                parent.syncErrorThrown = true;
	                return true;
	            }
	            else {
	                hostReportError(err);
	                return true;
	            }
	        }
	        return false;
	    };
	    SafeSubscriber.prototype._unsubscribe = function () {
	        var _parentSubscriber = this._parentSubscriber;
	        this._context = null;
	        this._parentSubscriber = null;
	        _parentSubscriber.unsubscribe();
	    };
	    return SafeSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
	function canReportError(observer) {
	    while (observer) {
	        var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
	        if (closed_1 || isStopped) {
	            return false;
	        }
	        else if (destination && destination instanceof Subscriber) {
	            observer = destination;
	        }
	        else {
	            observer = null;
	        }
	    }
	    return true;
	}

	/** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
	function toSubscriber(nextOrObserver, error, complete) {
	    if (nextOrObserver) {
	        if (nextOrObserver instanceof Subscriber) {
	            return nextOrObserver;
	        }
	        if (nextOrObserver[rxSubscriber]) {
	            return nextOrObserver[rxSubscriber]();
	        }
	    }
	    if (!nextOrObserver && !error && !complete) {
	        return new Subscriber(empty);
	    }
	    return new Subscriber(nextOrObserver, error, complete);
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function identity(x) {
	    return x;
	}

	/** PURE_IMPORTS_START _identity PURE_IMPORTS_END */
	function pipe() {
	    var fns = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        fns[_i] = arguments[_i];
	    }
	    return pipeFromArray(fns);
	}
	function pipeFromArray(fns) {
	    if (fns.length === 0) {
	        return identity;
	    }
	    if (fns.length === 1) {
	        return fns[0];
	    }
	    return function piped(input) {
	        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
	    };
	}

	/** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
	var Observable = /*@__PURE__*/ (function () {
	    function Observable(subscribe) {
	        this._isScalar = false;
	        if (subscribe) {
	            this._subscribe = subscribe;
	        }
	    }
	    Observable.prototype.lift = function (operator) {
	        var observable = new Observable();
	        observable.source = this;
	        observable.operator = operator;
	        return observable;
	    };
	    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
	        var operator = this.operator;
	        var sink = toSubscriber(observerOrNext, error, complete);
	        if (operator) {
	            sink.add(operator.call(sink, this.source));
	        }
	        else {
	            sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
	                this._subscribe(sink) :
	                this._trySubscribe(sink));
	        }
	        if (config.useDeprecatedSynchronousErrorHandling) {
	            if (sink.syncErrorThrowable) {
	                sink.syncErrorThrowable = false;
	                if (sink.syncErrorThrown) {
	                    throw sink.syncErrorValue;
	                }
	            }
	        }
	        return sink;
	    };
	    Observable.prototype._trySubscribe = function (sink) {
	        try {
	            return this._subscribe(sink);
	        }
	        catch (err) {
	            if (config.useDeprecatedSynchronousErrorHandling) {
	                sink.syncErrorThrown = true;
	                sink.syncErrorValue = err;
	            }
	            if (canReportError(sink)) {
	                sink.error(err);
	            }
	            else {
	                console.warn(err);
	            }
	        }
	    };
	    Observable.prototype.forEach = function (next, promiseCtor) {
	        var _this = this;
	        promiseCtor = getPromiseCtor(promiseCtor);
	        return new promiseCtor(function (resolve, reject) {
	            var subscription;
	            subscription = _this.subscribe(function (value) {
	                try {
	                    next(value);
	                }
	                catch (err) {
	                    reject(err);
	                    if (subscription) {
	                        subscription.unsubscribe();
	                    }
	                }
	            }, reject, resolve);
	        });
	    };
	    Observable.prototype._subscribe = function (subscriber) {
	        var source = this.source;
	        return source && source.subscribe(subscriber);
	    };
	    Observable.prototype[observable] = function () {
	        return this;
	    };
	    Observable.prototype.pipe = function () {
	        var operations = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            operations[_i] = arguments[_i];
	        }
	        if (operations.length === 0) {
	            return this;
	        }
	        return pipeFromArray(operations)(this);
	    };
	    Observable.prototype.toPromise = function (promiseCtor) {
	        var _this = this;
	        promiseCtor = getPromiseCtor(promiseCtor);
	        return new promiseCtor(function (resolve, reject) {
	            var value;
	            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
	        });
	    };
	    Observable.create = function (subscribe) {
	        return new Observable(subscribe);
	    };
	    return Observable;
	}());
	function getPromiseCtor(promiseCtor) {
	    if (!promiseCtor) {
	        promiseCtor = config.Promise || Promise;
	    }
	    if (!promiseCtor) {
	        throw new Error('no Promise impl found');
	    }
	    return promiseCtor;
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
	    function ObjectUnsubscribedErrorImpl() {
	        Error.call(this);
	        this.message = 'object unsubscribed';
	        this.name = 'ObjectUnsubscribedError';
	        return this;
	    }
	    ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
	    return ObjectUnsubscribedErrorImpl;
	})();
	var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

	/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
	var SubjectSubscription = /*@__PURE__*/ (function (_super) {
	    __extends(SubjectSubscription, _super);
	    function SubjectSubscription(subject, subscriber) {
	        var _this = _super.call(this) || this;
	        _this.subject = subject;
	        _this.subscriber = subscriber;
	        _this.closed = false;
	        return _this;
	    }
	    SubjectSubscription.prototype.unsubscribe = function () {
	        if (this.closed) {
	            return;
	        }
	        this.closed = true;
	        var subject = this.subject;
	        var observers = subject.observers;
	        this.subject = null;
	        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
	            return;
	        }
	        var subscriberIndex = observers.indexOf(this.subscriber);
	        if (subscriberIndex !== -1) {
	            observers.splice(subscriberIndex, 1);
	        }
	    };
	    return SubjectSubscription;
	}(Subscription));

	/** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
	var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SubjectSubscriber, _super);
	    function SubjectSubscriber(destination) {
	        var _this = _super.call(this, destination) || this;
	        _this.destination = destination;
	        return _this;
	    }
	    return SubjectSubscriber;
	}(Subscriber));
	var Subject = /*@__PURE__*/ (function (_super) {
	    __extends(Subject, _super);
	    function Subject() {
	        var _this = _super.call(this) || this;
	        _this.observers = [];
	        _this.closed = false;
	        _this.isStopped = false;
	        _this.hasError = false;
	        _this.thrownError = null;
	        return _this;
	    }
	    Subject.prototype[rxSubscriber] = function () {
	        return new SubjectSubscriber(this);
	    };
	    Subject.prototype.lift = function (operator) {
	        var subject = new AnonymousSubject(this, this);
	        subject.operator = operator;
	        return subject;
	    };
	    Subject.prototype.next = function (value) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError();
	        }
	        if (!this.isStopped) {
	            var observers = this.observers;
	            var len = observers.length;
	            var copy = observers.slice();
	            for (var i = 0; i < len; i++) {
	                copy[i].next(value);
	            }
	        }
	    };
	    Subject.prototype.error = function (err) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError();
	        }
	        this.hasError = true;
	        this.thrownError = err;
	        this.isStopped = true;
	        var observers = this.observers;
	        var len = observers.length;
	        var copy = observers.slice();
	        for (var i = 0; i < len; i++) {
	            copy[i].error(err);
	        }
	        this.observers.length = 0;
	    };
	    Subject.prototype.complete = function () {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError();
	        }
	        this.isStopped = true;
	        var observers = this.observers;
	        var len = observers.length;
	        var copy = observers.slice();
	        for (var i = 0; i < len; i++) {
	            copy[i].complete();
	        }
	        this.observers.length = 0;
	    };
	    Subject.prototype.unsubscribe = function () {
	        this.isStopped = true;
	        this.closed = true;
	        this.observers = null;
	    };
	    Subject.prototype._trySubscribe = function (subscriber) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError();
	        }
	        else {
	            return _super.prototype._trySubscribe.call(this, subscriber);
	        }
	    };
	    Subject.prototype._subscribe = function (subscriber) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError();
	        }
	        else if (this.hasError) {
	            subscriber.error(this.thrownError);
	            return Subscription.EMPTY;
	        }
	        else if (this.isStopped) {
	            subscriber.complete();
	            return Subscription.EMPTY;
	        }
	        else {
	            this.observers.push(subscriber);
	            return new SubjectSubscription(this, subscriber);
	        }
	    };
	    Subject.prototype.asObservable = function () {
	        var observable = new Observable();
	        observable.source = this;
	        return observable;
	    };
	    Subject.create = function (destination, source) {
	        return new AnonymousSubject(destination, source);
	    };
	    return Subject;
	}(Observable));
	var AnonymousSubject = /*@__PURE__*/ (function (_super) {
	    __extends(AnonymousSubject, _super);
	    function AnonymousSubject(destination, source) {
	        var _this = _super.call(this) || this;
	        _this.destination = destination;
	        _this.source = source;
	        return _this;
	    }
	    AnonymousSubject.prototype.next = function (value) {
	        var destination = this.destination;
	        if (destination && destination.next) {
	            destination.next(value);
	        }
	    };
	    AnonymousSubject.prototype.error = function (err) {
	        var destination = this.destination;
	        if (destination && destination.error) {
	            this.destination.error(err);
	        }
	    };
	    AnonymousSubject.prototype.complete = function () {
	        var destination = this.destination;
	        if (destination && destination.complete) {
	            this.destination.complete();
	        }
	    };
	    AnonymousSubject.prototype._subscribe = function (subscriber) {
	        var source = this.source;
	        if (source) {
	            return this.source.subscribe(subscriber);
	        }
	        else {
	            return Subscription.EMPTY;
	        }
	    };
	    return AnonymousSubject;
	}(Subject));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function refCount() {
	    return function refCountOperatorFunction(source) {
	        return source.lift(new RefCountOperator(source));
	    };
	}
	var RefCountOperator = /*@__PURE__*/ (function () {
	    function RefCountOperator(connectable) {
	        this.connectable = connectable;
	    }
	    RefCountOperator.prototype.call = function (subscriber, source) {
	        var connectable = this.connectable;
	        connectable._refCount++;
	        var refCounter = new RefCountSubscriber(subscriber, connectable);
	        var subscription = source.subscribe(refCounter);
	        if (!refCounter.closed) {
	            refCounter.connection = connectable.connect();
	        }
	        return subscription;
	    };
	    return RefCountOperator;
	}());
	var RefCountSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(RefCountSubscriber, _super);
	    function RefCountSubscriber(destination, connectable) {
	        var _this = _super.call(this, destination) || this;
	        _this.connectable = connectable;
	        return _this;
	    }
	    RefCountSubscriber.prototype._unsubscribe = function () {
	        var connectable = this.connectable;
	        if (!connectable) {
	            this.connection = null;
	            return;
	        }
	        this.connectable = null;
	        var refCount = connectable._refCount;
	        if (refCount <= 0) {
	            this.connection = null;
	            return;
	        }
	        connectable._refCount = refCount - 1;
	        if (refCount > 1) {
	            this.connection = null;
	            return;
	        }
	        var connection = this.connection;
	        var sharedConnection = connectable._connection;
	        this.connection = null;
	        if (sharedConnection && (!connection || sharedConnection === connection)) {
	            sharedConnection.unsubscribe();
	        }
	    };
	    return RefCountSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subject,_Observable,_Subscriber,_Subscription,_operators_refCount PURE_IMPORTS_END */
	var ConnectableObservable = /*@__PURE__*/ (function (_super) {
	    __extends(ConnectableObservable, _super);
	    function ConnectableObservable(source, subjectFactory) {
	        var _this = _super.call(this) || this;
	        _this.source = source;
	        _this.subjectFactory = subjectFactory;
	        _this._refCount = 0;
	        _this._isComplete = false;
	        return _this;
	    }
	    ConnectableObservable.prototype._subscribe = function (subscriber) {
	        return this.getSubject().subscribe(subscriber);
	    };
	    ConnectableObservable.prototype.getSubject = function () {
	        var subject = this._subject;
	        if (!subject || subject.isStopped) {
	            this._subject = this.subjectFactory();
	        }
	        return this._subject;
	    };
	    ConnectableObservable.prototype.connect = function () {
	        var connection = this._connection;
	        if (!connection) {
	            this._isComplete = false;
	            connection = this._connection = new Subscription();
	            connection.add(this.source
	                .subscribe(new ConnectableSubscriber(this.getSubject(), this)));
	            if (connection.closed) {
	                this._connection = null;
	                connection = Subscription.EMPTY;
	            }
	        }
	        return connection;
	    };
	    ConnectableObservable.prototype.refCount = function () {
	        return refCount()(this);
	    };
	    return ConnectableObservable;
	}(Observable));
	var connectableObservableDescriptor = /*@__PURE__*/ (function () {
	    var connectableProto = ConnectableObservable.prototype;
	    return {
	        operator: { value: null },
	        _refCount: { value: 0, writable: true },
	        _subject: { value: null, writable: true },
	        _connection: { value: null, writable: true },
	        _subscribe: { value: connectableProto._subscribe },
	        _isComplete: { value: connectableProto._isComplete, writable: true },
	        getSubject: { value: connectableProto.getSubject },
	        connect: { value: connectableProto.connect },
	        refCount: { value: connectableProto.refCount }
	    };
	})();
	var ConnectableSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ConnectableSubscriber, _super);
	    function ConnectableSubscriber(destination, connectable) {
	        var _this = _super.call(this, destination) || this;
	        _this.connectable = connectable;
	        return _this;
	    }
	    ConnectableSubscriber.prototype._error = function (err) {
	        this._unsubscribe();
	        _super.prototype._error.call(this, err);
	    };
	    ConnectableSubscriber.prototype._complete = function () {
	        this.connectable._isComplete = true;
	        this._unsubscribe();
	        _super.prototype._complete.call(this);
	    };
	    ConnectableSubscriber.prototype._unsubscribe = function () {
	        var connectable = this.connectable;
	        if (connectable) {
	            this.connectable = null;
	            var connection = connectable._connection;
	            connectable._refCount = 0;
	            connectable._subject = null;
	            connectable._connection = null;
	            if (connection) {
	                connection.unsubscribe();
	            }
	        }
	    };
	    return ConnectableSubscriber;
	}(SubjectSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_Subscription,_Observable,_Subject PURE_IMPORTS_END */
	function groupBy(keySelector, elementSelector, durationSelector, subjectSelector) {
	    return function (source) {
	        return source.lift(new GroupByOperator(keySelector, elementSelector, durationSelector, subjectSelector));
	    };
	}
	var GroupByOperator = /*@__PURE__*/ (function () {
	    function GroupByOperator(keySelector, elementSelector, durationSelector, subjectSelector) {
	        this.keySelector = keySelector;
	        this.elementSelector = elementSelector;
	        this.durationSelector = durationSelector;
	        this.subjectSelector = subjectSelector;
	    }
	    GroupByOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new GroupBySubscriber(subscriber, this.keySelector, this.elementSelector, this.durationSelector, this.subjectSelector));
	    };
	    return GroupByOperator;
	}());
	var GroupBySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(GroupBySubscriber, _super);
	    function GroupBySubscriber(destination, keySelector, elementSelector, durationSelector, subjectSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.keySelector = keySelector;
	        _this.elementSelector = elementSelector;
	        _this.durationSelector = durationSelector;
	        _this.subjectSelector = subjectSelector;
	        _this.groups = null;
	        _this.attemptedToUnsubscribe = false;
	        _this.count = 0;
	        return _this;
	    }
	    GroupBySubscriber.prototype._next = function (value) {
	        var key;
	        try {
	            key = this.keySelector(value);
	        }
	        catch (err) {
	            this.error(err);
	            return;
	        }
	        this._group(value, key);
	    };
	    GroupBySubscriber.prototype._group = function (value, key) {
	        var groups = this.groups;
	        if (!groups) {
	            groups = this.groups = new Map();
	        }
	        var group = groups.get(key);
	        var element;
	        if (this.elementSelector) {
	            try {
	                element = this.elementSelector(value);
	            }
	            catch (err) {
	                this.error(err);
	            }
	        }
	        else {
	            element = value;
	        }
	        if (!group) {
	            group = (this.subjectSelector ? this.subjectSelector() : new Subject());
	            groups.set(key, group);
	            var groupedObservable = new GroupedObservable(key, group, this);
	            this.destination.next(groupedObservable);
	            if (this.durationSelector) {
	                var duration = void 0;
	                try {
	                    duration = this.durationSelector(new GroupedObservable(key, group));
	                }
	                catch (err) {
	                    this.error(err);
	                    return;
	                }
	                this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
	            }
	        }
	        if (!group.closed) {
	            group.next(element);
	        }
	    };
	    GroupBySubscriber.prototype._error = function (err) {
	        var groups = this.groups;
	        if (groups) {
	            groups.forEach(function (group, key) {
	                group.error(err);
	            });
	            groups.clear();
	        }
	        this.destination.error(err);
	    };
	    GroupBySubscriber.prototype._complete = function () {
	        var groups = this.groups;
	        if (groups) {
	            groups.forEach(function (group, key) {
	                group.complete();
	            });
	            groups.clear();
	        }
	        this.destination.complete();
	    };
	    GroupBySubscriber.prototype.removeGroup = function (key) {
	        this.groups.delete(key);
	    };
	    GroupBySubscriber.prototype.unsubscribe = function () {
	        if (!this.closed) {
	            this.attemptedToUnsubscribe = true;
	            if (this.count === 0) {
	                _super.prototype.unsubscribe.call(this);
	            }
	        }
	    };
	    return GroupBySubscriber;
	}(Subscriber));
	var GroupDurationSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(GroupDurationSubscriber, _super);
	    function GroupDurationSubscriber(key, group, parent) {
	        var _this = _super.call(this, group) || this;
	        _this.key = key;
	        _this.group = group;
	        _this.parent = parent;
	        return _this;
	    }
	    GroupDurationSubscriber.prototype._next = function (value) {
	        this.complete();
	    };
	    GroupDurationSubscriber.prototype._unsubscribe = function () {
	        var _a = this, parent = _a.parent, key = _a.key;
	        this.key = this.parent = null;
	        if (parent) {
	            parent.removeGroup(key);
	        }
	    };
	    return GroupDurationSubscriber;
	}(Subscriber));
	var GroupedObservable = /*@__PURE__*/ (function (_super) {
	    __extends(GroupedObservable, _super);
	    function GroupedObservable(key, groupSubject, refCountSubscription) {
	        var _this = _super.call(this) || this;
	        _this.key = key;
	        _this.groupSubject = groupSubject;
	        _this.refCountSubscription = refCountSubscription;
	        return _this;
	    }
	    GroupedObservable.prototype._subscribe = function (subscriber) {
	        var subscription = new Subscription();
	        var _a = this, refCountSubscription = _a.refCountSubscription, groupSubject = _a.groupSubject;
	        if (refCountSubscription && !refCountSubscription.closed) {
	            subscription.add(new InnerRefCountSubscription(refCountSubscription));
	        }
	        subscription.add(groupSubject.subscribe(subscriber));
	        return subscription;
	    };
	    return GroupedObservable;
	}(Observable));
	var InnerRefCountSubscription = /*@__PURE__*/ (function (_super) {
	    __extends(InnerRefCountSubscription, _super);
	    function InnerRefCountSubscription(parent) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        parent.count++;
	        return _this;
	    }
	    InnerRefCountSubscription.prototype.unsubscribe = function () {
	        var parent = this.parent;
	        if (!parent.closed && !this.closed) {
	            _super.prototype.unsubscribe.call(this);
	            parent.count -= 1;
	            if (parent.count === 0 && parent.attemptedToUnsubscribe) {
	                parent.unsubscribe();
	            }
	        }
	    };
	    return InnerRefCountSubscription;
	}(Subscription));

	/** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */
	var BehaviorSubject = /*@__PURE__*/ (function (_super) {
	    __extends(BehaviorSubject, _super);
	    function BehaviorSubject(_value) {
	        var _this = _super.call(this) || this;
	        _this._value = _value;
	        return _this;
	    }
	    Object.defineProperty(BehaviorSubject.prototype, "value", {
	        get: function () {
	            return this.getValue();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    BehaviorSubject.prototype._subscribe = function (subscriber) {
	        var subscription = _super.prototype._subscribe.call(this, subscriber);
	        if (subscription && !subscription.closed) {
	            subscriber.next(this._value);
	        }
	        return subscription;
	    };
	    BehaviorSubject.prototype.getValue = function () {
	        if (this.hasError) {
	            throw this.thrownError;
	        }
	        else if (this.closed) {
	            throw new ObjectUnsubscribedError();
	        }
	        else {
	            return this._value;
	        }
	    };
	    BehaviorSubject.prototype.next = function (value) {
	        _super.prototype.next.call(this, this._value = value);
	    };
	    return BehaviorSubject;
	}(Subject));

	/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
	var Action = /*@__PURE__*/ (function (_super) {
	    __extends(Action, _super);
	    function Action(scheduler, work) {
	        return _super.call(this) || this;
	    }
	    Action.prototype.schedule = function (state, delay) {
	        return this;
	    };
	    return Action;
	}(Subscription));

	/** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */
	var AsyncAction = /*@__PURE__*/ (function (_super) {
	    __extends(AsyncAction, _super);
	    function AsyncAction(scheduler, work) {
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        _this.pending = false;
	        return _this;
	    }
	    AsyncAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (this.closed) {
	            return this;
	        }
	        this.state = state;
	        var id = this.id;
	        var scheduler = this.scheduler;
	        if (id != null) {
	            this.id = this.recycleAsyncId(scheduler, id, delay);
	        }
	        this.pending = true;
	        this.delay = delay;
	        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
	        return this;
	    };
	    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        return setInterval(scheduler.flush.bind(scheduler, this), delay);
	    };
	    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && this.delay === delay && this.pending === false) {
	            return id;
	        }
	        clearInterval(id);
	        return undefined;
	    };
	    AsyncAction.prototype.execute = function (state, delay) {
	        if (this.closed) {
	            return new Error('executing a cancelled action');
	        }
	        this.pending = false;
	        var error = this._execute(state, delay);
	        if (error) {
	            return error;
	        }
	        else if (this.pending === false && this.id != null) {
	            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
	        }
	    };
	    AsyncAction.prototype._execute = function (state, delay) {
	        var errored = false;
	        var errorValue = undefined;
	        try {
	            this.work(state);
	        }
	        catch (e) {
	            errored = true;
	            errorValue = !!e && e || new Error(e);
	        }
	        if (errored) {
	            this.unsubscribe();
	            return errorValue;
	        }
	    };
	    AsyncAction.prototype._unsubscribe = function () {
	        var id = this.id;
	        var scheduler = this.scheduler;
	        var actions = scheduler.actions;
	        var index = actions.indexOf(this);
	        this.work = null;
	        this.state = null;
	        this.pending = false;
	        this.scheduler = null;
	        if (index !== -1) {
	            actions.splice(index, 1);
	        }
	        if (id != null) {
	            this.id = this.recycleAsyncId(scheduler, id, null);
	        }
	        this.delay = null;
	    };
	    return AsyncAction;
	}(Action));

	/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
	var QueueAction = /*@__PURE__*/ (function (_super) {
	    __extends(QueueAction, _super);
	    function QueueAction(scheduler, work) {
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        return _this;
	    }
	    QueueAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay > 0) {
	            return _super.prototype.schedule.call(this, state, delay);
	        }
	        this.delay = delay;
	        this.state = state;
	        this.scheduler.flush(this);
	        return this;
	    };
	    QueueAction.prototype.execute = function (state, delay) {
	        return (delay > 0 || this.closed) ?
	            _super.prototype.execute.call(this, state, delay) :
	            this._execute(state, delay);
	    };
	    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        return scheduler.flush(this);
	    };
	    return QueueAction;
	}(AsyncAction));

	var Scheduler = /*@__PURE__*/ (function () {
	    function Scheduler(SchedulerAction, now) {
	        if (now === void 0) {
	            now = Scheduler.now;
	        }
	        this.SchedulerAction = SchedulerAction;
	        this.now = now;
	    }
	    Scheduler.prototype.schedule = function (work, delay, state) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        return new this.SchedulerAction(this, work).schedule(state, delay);
	    };
	    Scheduler.now = function () { return Date.now(); };
	    return Scheduler;
	}());

	/** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */
	var AsyncScheduler = /*@__PURE__*/ (function (_super) {
	    __extends(AsyncScheduler, _super);
	    function AsyncScheduler(SchedulerAction, now) {
	        if (now === void 0) {
	            now = Scheduler.now;
	        }
	        var _this = _super.call(this, SchedulerAction, function () {
	            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
	                return AsyncScheduler.delegate.now();
	            }
	            else {
	                return now();
	            }
	        }) || this;
	        _this.actions = [];
	        _this.active = false;
	        _this.scheduled = undefined;
	        return _this;
	    }
	    AsyncScheduler.prototype.schedule = function (work, delay, state) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
	            return AsyncScheduler.delegate.schedule(work, delay, state);
	        }
	        else {
	            return _super.prototype.schedule.call(this, work, delay, state);
	        }
	    };
	    AsyncScheduler.prototype.flush = function (action) {
	        var actions = this.actions;
	        if (this.active) {
	            actions.push(action);
	            return;
	        }
	        var error;
	        this.active = true;
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (action = actions.shift());
	        this.active = false;
	        if (error) {
	            while (action = actions.shift()) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AsyncScheduler;
	}(Scheduler));

	/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
	var QueueScheduler = /*@__PURE__*/ (function (_super) {
	    __extends(QueueScheduler, _super);
	    function QueueScheduler() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    return QueueScheduler;
	}(AsyncScheduler));

	/** PURE_IMPORTS_START _QueueAction,_QueueScheduler PURE_IMPORTS_END */
	var queueScheduler = /*@__PURE__*/ new QueueScheduler(QueueAction);
	var queue = queueScheduler;

	/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
	var EMPTY = /*@__PURE__*/ new Observable(function (subscriber) { return subscriber.complete(); });
	function empty$1(scheduler) {
	    return scheduler ? emptyScheduled(scheduler) : EMPTY;
	}
	function emptyScheduled(scheduler) {
	    return new Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function isScheduler(value) {
	    return value && typeof value.schedule === 'function';
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var subscribeToArray = function (array) {
	    return function (subscriber) {
	        for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
	            subscriber.next(array[i]);
	        }
	        subscriber.complete();
	    };
	};

	/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
	function scheduleArray(input, scheduler) {
	    return new Observable(function (subscriber) {
	        var sub = new Subscription();
	        var i = 0;
	        sub.add(scheduler.schedule(function () {
	            if (i === input.length) {
	                subscriber.complete();
	                return;
	            }
	            subscriber.next(input[i++]);
	            if (!subscriber.closed) {
	                sub.add(this.schedule());
	            }
	        }));
	        return sub;
	    });
	}

	/** PURE_IMPORTS_START _Observable,_util_subscribeToArray,_scheduled_scheduleArray PURE_IMPORTS_END */
	function fromArray(input, scheduler) {
	    if (!scheduler) {
	        return new Observable(subscribeToArray(input));
	    }
	    else {
	        return scheduleArray(input, scheduler);
	    }
	}

	/** PURE_IMPORTS_START _util_isScheduler,_fromArray,_scheduled_scheduleArray PURE_IMPORTS_END */
	function of() {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i] = arguments[_i];
	    }
	    var scheduler = args[args.length - 1];
	    if (isScheduler(scheduler)) {
	        args.pop();
	        return scheduleArray(args, scheduler);
	    }
	    else {
	        return fromArray(args);
	    }
	}

	/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
	function throwError(error, scheduler) {
	    if (!scheduler) {
	        return new Observable(function (subscriber) { return subscriber.error(error); });
	    }
	    else {
	        return new Observable(function (subscriber) { return scheduler.schedule(dispatch, 0, { error: error, subscriber: subscriber }); });
	    }
	}
	function dispatch(_a) {
	    var error = _a.error, subscriber = _a.subscriber;
	    subscriber.error(error);
	}

	/** PURE_IMPORTS_START _observable_empty,_observable_of,_observable_throwError PURE_IMPORTS_END */
	var NotificationKind;
	/*@__PURE__*/ (function (NotificationKind) {
	    NotificationKind["NEXT"] = "N";
	    NotificationKind["ERROR"] = "E";
	    NotificationKind["COMPLETE"] = "C";
	})(NotificationKind || (NotificationKind = {}));
	var Notification = /*@__PURE__*/ (function () {
	    function Notification(kind, value, error) {
	        this.kind = kind;
	        this.value = value;
	        this.error = error;
	        this.hasValue = kind === 'N';
	    }
	    Notification.prototype.observe = function (observer) {
	        switch (this.kind) {
	            case 'N':
	                return observer.next && observer.next(this.value);
	            case 'E':
	                return observer.error && observer.error(this.error);
	            case 'C':
	                return observer.complete && observer.complete();
	        }
	    };
	    Notification.prototype.do = function (next, error, complete) {
	        var kind = this.kind;
	        switch (kind) {
	            case 'N':
	                return next && next(this.value);
	            case 'E':
	                return error && error(this.error);
	            case 'C':
	                return complete && complete();
	        }
	    };
	    Notification.prototype.accept = function (nextOrObserver, error, complete) {
	        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
	            return this.observe(nextOrObserver);
	        }
	        else {
	            return this.do(nextOrObserver, error, complete);
	        }
	    };
	    Notification.prototype.toObservable = function () {
	        var kind = this.kind;
	        switch (kind) {
	            case 'N':
	                return of(this.value);
	            case 'E':
	                return throwError(this.error);
	            case 'C':
	                return empty$1();
	        }
	        throw new Error('unexpected notification kind value');
	    };
	    Notification.createNext = function (value) {
	        if (typeof value !== 'undefined') {
	            return new Notification('N', value);
	        }
	        return Notification.undefinedValueNotification;
	    };
	    Notification.createError = function (err) {
	        return new Notification('E', undefined, err);
	    };
	    Notification.createComplete = function () {
	        return Notification.completeNotification;
	    };
	    Notification.completeNotification = new Notification('C');
	    Notification.undefinedValueNotification = new Notification('N', undefined);
	    return Notification;
	}());

	/** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */
	function observeOn(scheduler, delay) {
	    if (delay === void 0) {
	        delay = 0;
	    }
	    return function observeOnOperatorFunction(source) {
	        return source.lift(new ObserveOnOperator(scheduler, delay));
	    };
	}
	var ObserveOnOperator = /*@__PURE__*/ (function () {
	    function ObserveOnOperator(scheduler, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        this.scheduler = scheduler;
	        this.delay = delay;
	    }
	    ObserveOnOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
	    };
	    return ObserveOnOperator;
	}());
	var ObserveOnSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ObserveOnSubscriber, _super);
	    function ObserveOnSubscriber(destination, scheduler, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        var _this = _super.call(this, destination) || this;
	        _this.scheduler = scheduler;
	        _this.delay = delay;
	        return _this;
	    }
	    ObserveOnSubscriber.dispatch = function (arg) {
	        var notification = arg.notification, destination = arg.destination;
	        notification.observe(destination);
	        this.unsubscribe();
	    };
	    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
	        var destination = this.destination;
	        destination.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
	    };
	    ObserveOnSubscriber.prototype._next = function (value) {
	        this.scheduleMessage(Notification.createNext(value));
	    };
	    ObserveOnSubscriber.prototype._error = function (err) {
	        this.scheduleMessage(Notification.createError(err));
	        this.unsubscribe();
	    };
	    ObserveOnSubscriber.prototype._complete = function () {
	        this.scheduleMessage(Notification.createComplete());
	        this.unsubscribe();
	    };
	    return ObserveOnSubscriber;
	}(Subscriber));
	var ObserveOnMessage = /*@__PURE__*/ (function () {
	    function ObserveOnMessage(notification, destination) {
	        this.notification = notification;
	        this.destination = destination;
	    }
	    return ObserveOnMessage;
	}());

	/** PURE_IMPORTS_START tslib,_Subject,_scheduler_queue,_Subscription,_operators_observeOn,_util_ObjectUnsubscribedError,_SubjectSubscription PURE_IMPORTS_END */
	var ReplaySubject = /*@__PURE__*/ (function (_super) {
	    __extends(ReplaySubject, _super);
	    function ReplaySubject(bufferSize, windowTime, scheduler) {
	        if (bufferSize === void 0) {
	            bufferSize = Number.POSITIVE_INFINITY;
	        }
	        if (windowTime === void 0) {
	            windowTime = Number.POSITIVE_INFINITY;
	        }
	        var _this = _super.call(this) || this;
	        _this.scheduler = scheduler;
	        _this._events = [];
	        _this._infiniteTimeWindow = false;
	        _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
	        _this._windowTime = windowTime < 1 ? 1 : windowTime;
	        if (windowTime === Number.POSITIVE_INFINITY) {
	            _this._infiniteTimeWindow = true;
	            _this.next = _this.nextInfiniteTimeWindow;
	        }
	        else {
	            _this.next = _this.nextTimeWindow;
	        }
	        return _this;
	    }
	    ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
	        if (!this.isStopped) {
	            var _events = this._events;
	            _events.push(value);
	            if (_events.length > this._bufferSize) {
	                _events.shift();
	            }
	        }
	        _super.prototype.next.call(this, value);
	    };
	    ReplaySubject.prototype.nextTimeWindow = function (value) {
	        if (!this.isStopped) {
	            this._events.push(new ReplayEvent(this._getNow(), value));
	            this._trimBufferThenGetEvents();
	        }
	        _super.prototype.next.call(this, value);
	    };
	    ReplaySubject.prototype._subscribe = function (subscriber) {
	        var _infiniteTimeWindow = this._infiniteTimeWindow;
	        var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
	        var scheduler = this.scheduler;
	        var len = _events.length;
	        var subscription;
	        if (this.closed) {
	            throw new ObjectUnsubscribedError();
	        }
	        else if (this.isStopped || this.hasError) {
	            subscription = Subscription.EMPTY;
	        }
	        else {
	            this.observers.push(subscriber);
	            subscription = new SubjectSubscription(this, subscriber);
	        }
	        if (scheduler) {
	            subscriber.add(subscriber = new ObserveOnSubscriber(subscriber, scheduler));
	        }
	        if (_infiniteTimeWindow) {
	            for (var i = 0; i < len && !subscriber.closed; i++) {
	                subscriber.next(_events[i]);
	            }
	        }
	        else {
	            for (var i = 0; i < len && !subscriber.closed; i++) {
	                subscriber.next(_events[i].value);
	            }
	        }
	        if (this.hasError) {
	            subscriber.error(this.thrownError);
	        }
	        else if (this.isStopped) {
	            subscriber.complete();
	        }
	        return subscription;
	    };
	    ReplaySubject.prototype._getNow = function () {
	        return (this.scheduler || queue).now();
	    };
	    ReplaySubject.prototype._trimBufferThenGetEvents = function () {
	        var now = this._getNow();
	        var _bufferSize = this._bufferSize;
	        var _windowTime = this._windowTime;
	        var _events = this._events;
	        var eventsCount = _events.length;
	        var spliceCount = 0;
	        while (spliceCount < eventsCount) {
	            if ((now - _events[spliceCount].time) < _windowTime) {
	                break;
	            }
	            spliceCount++;
	        }
	        if (eventsCount > _bufferSize) {
	            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
	        }
	        if (spliceCount > 0) {
	            _events.splice(0, spliceCount);
	        }
	        return _events;
	    };
	    return ReplaySubject;
	}(Subject));
	var ReplayEvent = /*@__PURE__*/ (function () {
	    function ReplayEvent(time, value) {
	        this.time = time;
	        this.value = value;
	    }
	    return ReplayEvent;
	}());

	/** PURE_IMPORTS_START tslib,_Subject,_Subscription PURE_IMPORTS_END */
	var AsyncSubject = /*@__PURE__*/ (function (_super) {
	    __extends(AsyncSubject, _super);
	    function AsyncSubject() {
	        var _this = _super !== null && _super.apply(this, arguments) || this;
	        _this.value = null;
	        _this.hasNext = false;
	        _this.hasCompleted = false;
	        return _this;
	    }
	    AsyncSubject.prototype._subscribe = function (subscriber) {
	        if (this.hasError) {
	            subscriber.error(this.thrownError);
	            return Subscription.EMPTY;
	        }
	        else if (this.hasCompleted && this.hasNext) {
	            subscriber.next(this.value);
	            subscriber.complete();
	            return Subscription.EMPTY;
	        }
	        return _super.prototype._subscribe.call(this, subscriber);
	    };
	    AsyncSubject.prototype.next = function (value) {
	        if (!this.hasCompleted) {
	            this.value = value;
	            this.hasNext = true;
	        }
	    };
	    AsyncSubject.prototype.error = function (error) {
	        if (!this.hasCompleted) {
	            _super.prototype.error.call(this, error);
	        }
	    };
	    AsyncSubject.prototype.complete = function () {
	        this.hasCompleted = true;
	        if (this.hasNext) {
	            _super.prototype.next.call(this, this.value);
	        }
	        _super.prototype.complete.call(this);
	    };
	    return AsyncSubject;
	}(Subject));

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var nextHandle = 1;
	var RESOLVED = /*@__PURE__*/ (function () { return /*@__PURE__*/ Promise.resolve(); })();
	var activeHandles = {};
	function findAndClearHandle(handle) {
	    if (handle in activeHandles) {
	        delete activeHandles[handle];
	        return true;
	    }
	    return false;
	}
	var Immediate = {
	    setImmediate: function (cb) {
	        var handle = nextHandle++;
	        activeHandles[handle] = true;
	        RESOLVED.then(function () { return findAndClearHandle(handle) && cb(); });
	        return handle;
	    },
	    clearImmediate: function (handle) {
	        findAndClearHandle(handle);
	    },
	};

	/** PURE_IMPORTS_START tslib,_util_Immediate,_AsyncAction PURE_IMPORTS_END */
	var AsapAction = /*@__PURE__*/ (function (_super) {
	    __extends(AsapAction, _super);
	    function AsapAction(scheduler, work) {
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        return _this;
	    }
	    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && delay > 0) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        scheduler.actions.push(this);
	        return scheduler.scheduled || (scheduler.scheduled = Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
	    };
	    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
	            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
	        }
	        if (scheduler.actions.length === 0) {
	            Immediate.clearImmediate(id);
	            scheduler.scheduled = undefined;
	        }
	        return undefined;
	    };
	    return AsapAction;
	}(AsyncAction));

	/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
	var AsapScheduler = /*@__PURE__*/ (function (_super) {
	    __extends(AsapScheduler, _super);
	    function AsapScheduler() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    AsapScheduler.prototype.flush = function (action) {
	        this.active = true;
	        this.scheduled = undefined;
	        var actions = this.actions;
	        var error;
	        var index = -1;
	        var count = actions.length;
	        action = action || actions.shift();
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (++index < count && (action = actions.shift()));
	        this.active = false;
	        if (error) {
	            while (++index < count && (action = actions.shift())) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AsapScheduler;
	}(AsyncScheduler));

	/** PURE_IMPORTS_START _AsapAction,_AsapScheduler PURE_IMPORTS_END */
	var asapScheduler = /*@__PURE__*/ new AsapScheduler(AsapAction);
	var asap = asapScheduler;

	/** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
	var asyncScheduler = /*@__PURE__*/ new AsyncScheduler(AsyncAction);
	var async = asyncScheduler;

	/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
	var AnimationFrameAction = /*@__PURE__*/ (function (_super) {
	    __extends(AnimationFrameAction, _super);
	    function AnimationFrameAction(scheduler, work) {
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        return _this;
	    }
	    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && delay > 0) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        scheduler.actions.push(this);
	        return scheduler.scheduled || (scheduler.scheduled = requestAnimationFrame(function () { return scheduler.flush(null); }));
	    };
	    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
	            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
	        }
	        if (scheduler.actions.length === 0) {
	            cancelAnimationFrame(id);
	            scheduler.scheduled = undefined;
	        }
	        return undefined;
	    };
	    return AnimationFrameAction;
	}(AsyncAction));

	/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
	var AnimationFrameScheduler = /*@__PURE__*/ (function (_super) {
	    __extends(AnimationFrameScheduler, _super);
	    function AnimationFrameScheduler() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    AnimationFrameScheduler.prototype.flush = function (action) {
	        this.active = true;
	        this.scheduled = undefined;
	        var actions = this.actions;
	        var error;
	        var index = -1;
	        var count = actions.length;
	        action = action || actions.shift();
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (++index < count && (action = actions.shift()));
	        this.active = false;
	        if (error) {
	            while (++index < count && (action = actions.shift())) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AnimationFrameScheduler;
	}(AsyncScheduler));

	/** PURE_IMPORTS_START _AnimationFrameAction,_AnimationFrameScheduler PURE_IMPORTS_END */
	var animationFrameScheduler = /*@__PURE__*/ new AnimationFrameScheduler(AnimationFrameAction);
	var animationFrame = animationFrameScheduler;

	/** PURE_IMPORTS_START tslib,_AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
	var VirtualTimeScheduler = /*@__PURE__*/ (function (_super) {
	    __extends(VirtualTimeScheduler, _super);
	    function VirtualTimeScheduler(SchedulerAction, maxFrames) {
	        if (SchedulerAction === void 0) {
	            SchedulerAction = VirtualAction;
	        }
	        if (maxFrames === void 0) {
	            maxFrames = Number.POSITIVE_INFINITY;
	        }
	        var _this = _super.call(this, SchedulerAction, function () { return _this.frame; }) || this;
	        _this.maxFrames = maxFrames;
	        _this.frame = 0;
	        _this.index = -1;
	        return _this;
	    }
	    VirtualTimeScheduler.prototype.flush = function () {
	        var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
	        var error, action;
	        while ((action = actions[0]) && action.delay <= maxFrames) {
	            actions.shift();
	            this.frame = action.delay;
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        }
	        if (error) {
	            while (action = actions.shift()) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    VirtualTimeScheduler.frameTimeFactor = 10;
	    return VirtualTimeScheduler;
	}(AsyncScheduler));
	var VirtualAction = /*@__PURE__*/ (function (_super) {
	    __extends(VirtualAction, _super);
	    function VirtualAction(scheduler, work, index) {
	        if (index === void 0) {
	            index = scheduler.index += 1;
	        }
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        _this.index = index;
	        _this.active = true;
	        _this.index = scheduler.index = index;
	        return _this;
	    }
	    VirtualAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (!this.id) {
	            return _super.prototype.schedule.call(this, state, delay);
	        }
	        this.active = false;
	        var action = new VirtualAction(this.scheduler, this.work);
	        this.add(action);
	        return action.schedule(state, delay);
	    };
	    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        this.delay = scheduler.frame + delay;
	        var actions = scheduler.actions;
	        actions.push(this);
	        actions.sort(VirtualAction.sortActions);
	        return true;
	    };
	    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        return undefined;
	    };
	    VirtualAction.prototype._execute = function (state, delay) {
	        if (this.active === true) {
	            return _super.prototype._execute.call(this, state, delay);
	        }
	    };
	    VirtualAction.sortActions = function (a, b) {
	        if (a.delay === b.delay) {
	            if (a.index === b.index) {
	                return 0;
	            }
	            else if (a.index > b.index) {
	                return 1;
	            }
	            else {
	                return -1;
	            }
	        }
	        else if (a.delay > b.delay) {
	            return 1;
	        }
	        else {
	            return -1;
	        }
	    };
	    return VirtualAction;
	}(AsyncAction));

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function noop() { }

	/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
	function isObservable(obj) {
	    return !!obj && (obj instanceof Observable || (typeof obj.lift === 'function' && typeof obj.subscribe === 'function'));
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var ArgumentOutOfRangeErrorImpl = /*@__PURE__*/ (function () {
	    function ArgumentOutOfRangeErrorImpl() {
	        Error.call(this);
	        this.message = 'argument out of range';
	        this.name = 'ArgumentOutOfRangeError';
	        return this;
	    }
	    ArgumentOutOfRangeErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
	    return ArgumentOutOfRangeErrorImpl;
	})();
	var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var EmptyErrorImpl = /*@__PURE__*/ (function () {
	    function EmptyErrorImpl() {
	        Error.call(this);
	        this.message = 'no elements in sequence';
	        this.name = 'EmptyError';
	        return this;
	    }
	    EmptyErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
	    return EmptyErrorImpl;
	})();
	var EmptyError = EmptyErrorImpl;

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var TimeoutErrorImpl = /*@__PURE__*/ (function () {
	    function TimeoutErrorImpl() {
	        Error.call(this);
	        this.message = 'Timeout has occurred';
	        this.name = 'TimeoutError';
	        return this;
	    }
	    TimeoutErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
	    return TimeoutErrorImpl;
	})();
	var TimeoutError = TimeoutErrorImpl;

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function map(project, thisArg) {
	    return function mapOperation(source) {
	        if (typeof project !== 'function') {
	            throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
	        }
	        return source.lift(new MapOperator(project, thisArg));
	    };
	}
	var MapOperator = /*@__PURE__*/ (function () {
	    function MapOperator(project, thisArg) {
	        this.project = project;
	        this.thisArg = thisArg;
	    }
	    MapOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
	    };
	    return MapOperator;
	}());
	var MapSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(MapSubscriber, _super);
	    function MapSubscriber(destination, project, thisArg) {
	        var _this = _super.call(this, destination) || this;
	        _this.project = project;
	        _this.count = 0;
	        _this.thisArg = thisArg || _this;
	        return _this;
	    }
	    MapSubscriber.prototype._next = function (value) {
	        var result;
	        try {
	            result = this.project.call(this.thisArg, value, this.count++);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return MapSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isArray,_util_isScheduler PURE_IMPORTS_END */
	function bindCallback(callbackFunc, resultSelector, scheduler) {
	    if (resultSelector) {
	        if (isScheduler(resultSelector)) {
	            scheduler = resultSelector;
	        }
	        else {
	            return function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i] = arguments[_i];
	                }
	                return bindCallback(callbackFunc, scheduler).apply(void 0, args).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
	            };
	        }
	    }
	    return function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        var context = this;
	        var subject;
	        var params = {
	            context: context,
	            subject: subject,
	            callbackFunc: callbackFunc,
	            scheduler: scheduler,
	        };
	        return new Observable(function (subscriber) {
	            if (!scheduler) {
	                if (!subject) {
	                    subject = new AsyncSubject();
	                    var handler = function () {
	                        var innerArgs = [];
	                        for (var _i = 0; _i < arguments.length; _i++) {
	                            innerArgs[_i] = arguments[_i];
	                        }
	                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
	                        subject.complete();
	                    };
	                    try {
	                        callbackFunc.apply(context, args.concat([handler]));
	                    }
	                    catch (err) {
	                        if (canReportError(subject)) {
	                            subject.error(err);
	                        }
	                        else {
	                            console.warn(err);
	                        }
	                    }
	                }
	                return subject.subscribe(subscriber);
	            }
	            else {
	                var state = {
	                    args: args, subscriber: subscriber, params: params,
	                };
	                return scheduler.schedule(dispatch$1, 0, state);
	            }
	        });
	    };
	}
	function dispatch$1(state) {
	    var _this = this;
	    var args = state.args, subscriber = state.subscriber, params = state.params;
	    var callbackFunc = params.callbackFunc, context = params.context, scheduler = params.scheduler;
	    var subject = params.subject;
	    if (!subject) {
	        subject = params.subject = new AsyncSubject();
	        var handler = function () {
	            var innerArgs = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                innerArgs[_i] = arguments[_i];
	            }
	            var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
	            _this.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
	        };
	        try {
	            callbackFunc.apply(context, args.concat([handler]));
	        }
	        catch (err) {
	            subject.error(err);
	        }
	    }
	    this.add(subject.subscribe(subscriber));
	}
	function dispatchNext(state) {
	    var value = state.value, subject = state.subject;
	    subject.next(value);
	    subject.complete();
	}

	/** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isScheduler,_util_isArray PURE_IMPORTS_END */
	function bindNodeCallback(callbackFunc, resultSelector, scheduler) {
	    if (resultSelector) {
	        if (isScheduler(resultSelector)) {
	            scheduler = resultSelector;
	        }
	        else {
	            return function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i] = arguments[_i];
	                }
	                return bindNodeCallback(callbackFunc, scheduler).apply(void 0, args).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
	            };
	        }
	    }
	    return function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        var params = {
	            subject: undefined,
	            args: args,
	            callbackFunc: callbackFunc,
	            scheduler: scheduler,
	            context: this,
	        };
	        return new Observable(function (subscriber) {
	            var context = params.context;
	            var subject = params.subject;
	            if (!scheduler) {
	                if (!subject) {
	                    subject = params.subject = new AsyncSubject();
	                    var handler = function () {
	                        var innerArgs = [];
	                        for (var _i = 0; _i < arguments.length; _i++) {
	                            innerArgs[_i] = arguments[_i];
	                        }
	                        var err = innerArgs.shift();
	                        if (err) {
	                            subject.error(err);
	                            return;
	                        }
	                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
	                        subject.complete();
	                    };
	                    try {
	                        callbackFunc.apply(context, args.concat([handler]));
	                    }
	                    catch (err) {
	                        if (canReportError(subject)) {
	                            subject.error(err);
	                        }
	                        else {
	                            console.warn(err);
	                        }
	                    }
	                }
	                return subject.subscribe(subscriber);
	            }
	            else {
	                return scheduler.schedule(dispatch$2, 0, { params: params, subscriber: subscriber, context: context });
	            }
	        });
	    };
	}
	function dispatch$2(state) {
	    var _this = this;
	    var params = state.params, subscriber = state.subscriber, context = state.context;
	    var callbackFunc = params.callbackFunc, args = params.args, scheduler = params.scheduler;
	    var subject = params.subject;
	    if (!subject) {
	        subject = params.subject = new AsyncSubject();
	        var handler = function () {
	            var innerArgs = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                innerArgs[_i] = arguments[_i];
	            }
	            var err = innerArgs.shift();
	            if (err) {
	                _this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
	            }
	            else {
	                var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
	                _this.add(scheduler.schedule(dispatchNext$1, 0, { value: value, subject: subject }));
	            }
	        };
	        try {
	            callbackFunc.apply(context, args.concat([handler]));
	        }
	        catch (err) {
	            this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
	        }
	    }
	    this.add(subject.subscribe(subscriber));
	}
	function dispatchNext$1(arg) {
	    var value = arg.value, subject = arg.subject;
	    subject.next(value);
	    subject.complete();
	}
	function dispatchError(arg) {
	    var err = arg.err, subject = arg.subject;
	    subject.error(err);
	}

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	var OuterSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(OuterSubscriber, _super);
	    function OuterSubscriber() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.destination.next(innerValue);
	    };
	    OuterSubscriber.prototype.notifyError = function (error, innerSub) {
	        this.destination.error(error);
	    };
	    OuterSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.destination.complete();
	    };
	    return OuterSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	var InnerSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(InnerSubscriber, _super);
	    function InnerSubscriber(parent, outerValue, outerIndex) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        _this.outerValue = outerValue;
	        _this.outerIndex = outerIndex;
	        _this.index = 0;
	        return _this;
	    }
	    InnerSubscriber.prototype._next = function (value) {
	        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
	    };
	    InnerSubscriber.prototype._error = function (error) {
	        this.parent.notifyError(error, this);
	        this.unsubscribe();
	    };
	    InnerSubscriber.prototype._complete = function () {
	        this.parent.notifyComplete(this);
	        this.unsubscribe();
	    };
	    return InnerSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */
	var subscribeToPromise = function (promise) {
	    return function (subscriber) {
	        promise.then(function (value) {
	            if (!subscriber.closed) {
	                subscriber.next(value);
	                subscriber.complete();
	            }
	        }, function (err) { return subscriber.error(err); })
	            .then(null, hostReportError);
	        return subscriber;
	    };
	};

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function getSymbolIterator() {
	    if (typeof Symbol !== 'function' || !Symbol.iterator) {
	        return '@@iterator';
	    }
	    return Symbol.iterator;
	}
	var iterator = /*@__PURE__*/ getSymbolIterator();

	/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
	var subscribeToIterable = function (iterable) {
	    return function (subscriber) {
	        var iterator$1 = iterable[iterator]();
	        do {
	            var item = void 0;
	            try {
	                item = iterator$1.next();
	            }
	            catch (err) {
	                subscriber.error(err);
	                return subscriber;
	            }
	            if (item.done) {
	                subscriber.complete();
	                break;
	            }
	            subscriber.next(item.value);
	            if (subscriber.closed) {
	                break;
	            }
	        } while (true);
	        if (typeof iterator$1.return === 'function') {
	            subscriber.add(function () {
	                if (iterator$1.return) {
	                    iterator$1.return();
	                }
	            });
	        }
	        return subscriber;
	    };
	};

	/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
	var subscribeToObservable = function (obj) {
	    return function (subscriber) {
	        var obs = obj[observable]();
	        if (typeof obs.subscribe !== 'function') {
	            throw new TypeError('Provided object does not correctly implement Symbol.observable');
	        }
	        else {
	            return obs.subscribe(subscriber);
	        }
	    };
	};

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function isPromise(value) {
	    return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
	}

	/** PURE_IMPORTS_START _subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */
	var subscribeTo = function (result) {
	    if (!!result && typeof result[observable] === 'function') {
	        return subscribeToObservable(result);
	    }
	    else if (isArrayLike(result)) {
	        return subscribeToArray(result);
	    }
	    else if (isPromise(result)) {
	        return subscribeToPromise(result);
	    }
	    else if (!!result && typeof result[iterator] === 'function') {
	        return subscribeToIterable(result);
	    }
	    else {
	        var value = isObject(result) ? 'an invalid object' : "'" + result + "'";
	        var msg = "You provided " + value + " where a stream was expected."
	            + ' You can provide an Observable, Promise, Array, or Iterable.';
	        throw new TypeError(msg);
	    }
	};

	/** PURE_IMPORTS_START _InnerSubscriber,_subscribeTo,_Observable PURE_IMPORTS_END */
	function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
	    if (innerSubscriber === void 0) {
	        innerSubscriber = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);
	    }
	    if (innerSubscriber.closed) {
	        return undefined;
	    }
	    if (result instanceof Observable) {
	        return result.subscribe(innerSubscriber);
	    }
	    return subscribeTo(result)(innerSubscriber);
	}

	/** PURE_IMPORTS_START tslib,_util_isScheduler,_util_isArray,_OuterSubscriber,_util_subscribeToResult,_fromArray PURE_IMPORTS_END */
	var NONE = {};
	function combineLatest() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    var resultSelector = undefined;
	    var scheduler = undefined;
	    if (isScheduler(observables[observables.length - 1])) {
	        scheduler = observables.pop();
	    }
	    if (typeof observables[observables.length - 1] === 'function') {
	        resultSelector = observables.pop();
	    }
	    if (observables.length === 1 && isArray(observables[0])) {
	        observables = observables[0];
	    }
	    return fromArray(observables, scheduler).lift(new CombineLatestOperator(resultSelector));
	}
	var CombineLatestOperator = /*@__PURE__*/ (function () {
	    function CombineLatestOperator(resultSelector) {
	        this.resultSelector = resultSelector;
	    }
	    CombineLatestOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
	    };
	    return CombineLatestOperator;
	}());
	var CombineLatestSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(CombineLatestSubscriber, _super);
	    function CombineLatestSubscriber(destination, resultSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.resultSelector = resultSelector;
	        _this.active = 0;
	        _this.values = [];
	        _this.observables = [];
	        return _this;
	    }
	    CombineLatestSubscriber.prototype._next = function (observable) {
	        this.values.push(NONE);
	        this.observables.push(observable);
	    };
	    CombineLatestSubscriber.prototype._complete = function () {
	        var observables = this.observables;
	        var len = observables.length;
	        if (len === 0) {
	            this.destination.complete();
	        }
	        else {
	            this.active = len;
	            this.toRespond = len;
	            for (var i = 0; i < len; i++) {
	                var observable = observables[i];
	                this.add(subscribeToResult(this, observable, undefined, i));
	            }
	        }
	    };
	    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
	        if ((this.active -= 1) === 0) {
	            this.destination.complete();
	        }
	    };
	    CombineLatestSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
	        var values = this.values;
	        var oldVal = values[outerIndex];
	        var toRespond = !this.toRespond
	            ? 0
	            : oldVal === NONE ? --this.toRespond : this.toRespond;
	        values[outerIndex] = innerValue;
	        if (toRespond === 0) {
	            if (this.resultSelector) {
	                this._tryResultSelector(values);
	            }
	            else {
	                this.destination.next(values.slice());
	            }
	        }
	    };
	    CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
	        var result;
	        try {
	            result = this.resultSelector.apply(this, values);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return CombineLatestSubscriber;
	}(OuterSubscriber));

	/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable PURE_IMPORTS_END */
	function scheduleObservable(input, scheduler) {
	    return new Observable(function (subscriber) {
	        var sub = new Subscription();
	        sub.add(scheduler.schedule(function () {
	            var observable$1 = input[observable]();
	            sub.add(observable$1.subscribe({
	                next: function (value) { sub.add(scheduler.schedule(function () { return subscriber.next(value); })); },
	                error: function (err) { sub.add(scheduler.schedule(function () { return subscriber.error(err); })); },
	                complete: function () { sub.add(scheduler.schedule(function () { return subscriber.complete(); })); },
	            }));
	        }));
	        return sub;
	    });
	}

	/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
	function schedulePromise(input, scheduler) {
	    return new Observable(function (subscriber) {
	        var sub = new Subscription();
	        sub.add(scheduler.schedule(function () {
	            return input.then(function (value) {
	                sub.add(scheduler.schedule(function () {
	                    subscriber.next(value);
	                    sub.add(scheduler.schedule(function () { return subscriber.complete(); }));
	                }));
	            }, function (err) {
	                sub.add(scheduler.schedule(function () { return subscriber.error(err); }));
	            });
	        }));
	        return sub;
	    });
	}

	/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator PURE_IMPORTS_END */
	function scheduleIterable(input, scheduler) {
	    if (!input) {
	        throw new Error('Iterable cannot be null');
	    }
	    return new Observable(function (subscriber) {
	        var sub = new Subscription();
	        var iterator$1;
	        sub.add(function () {
	            if (iterator$1 && typeof iterator$1.return === 'function') {
	                iterator$1.return();
	            }
	        });
	        sub.add(scheduler.schedule(function () {
	            iterator$1 = input[iterator]();
	            sub.add(scheduler.schedule(function () {
	                if (subscriber.closed) {
	                    return;
	                }
	                var value;
	                var done;
	                try {
	                    var result = iterator$1.next();
	                    value = result.value;
	                    done = result.done;
	                }
	                catch (err) {
	                    subscriber.error(err);
	                    return;
	                }
	                if (done) {
	                    subscriber.complete();
	                }
	                else {
	                    subscriber.next(value);
	                    this.schedule();
	                }
	            }));
	        }));
	        return sub;
	    });
	}

	/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
	function isInteropObservable(input) {
	    return input && typeof input[observable] === 'function';
	}

	/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
	function isIterable(input) {
	    return input && typeof input[iterator] === 'function';
	}

	/** PURE_IMPORTS_START _scheduleObservable,_schedulePromise,_scheduleArray,_scheduleIterable,_util_isInteropObservable,_util_isPromise,_util_isArrayLike,_util_isIterable PURE_IMPORTS_END */
	function scheduled(input, scheduler) {
	    if (input != null) {
	        if (isInteropObservable(input)) {
	            return scheduleObservable(input, scheduler);
	        }
	        else if (isPromise(input)) {
	            return schedulePromise(input, scheduler);
	        }
	        else if (isArrayLike(input)) {
	            return scheduleArray(input, scheduler);
	        }
	        else if (isIterable(input) || typeof input === 'string') {
	            return scheduleIterable(input, scheduler);
	        }
	    }
	    throw new TypeError((input !== null && typeof input || input) + ' is not observable');
	}

	/** PURE_IMPORTS_START _Observable,_util_subscribeTo,_scheduled_scheduled PURE_IMPORTS_END */
	function from(input, scheduler) {
	    if (!scheduler) {
	        if (input instanceof Observable) {
	            return input;
	        }
	        return new Observable(subscribeTo(input));
	    }
	    else {
	        return scheduled(input, scheduler);
	    }
	}

	/** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_util_subscribeTo PURE_IMPORTS_END */
	var SimpleInnerSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SimpleInnerSubscriber, _super);
	    function SimpleInnerSubscriber(parent) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        return _this;
	    }
	    SimpleInnerSubscriber.prototype._next = function (value) {
	        this.parent.notifyNext(value);
	    };
	    SimpleInnerSubscriber.prototype._error = function (error) {
	        this.parent.notifyError(error);
	        this.unsubscribe();
	    };
	    SimpleInnerSubscriber.prototype._complete = function () {
	        this.parent.notifyComplete();
	        this.unsubscribe();
	    };
	    return SimpleInnerSubscriber;
	}(Subscriber));
	var SimpleOuterSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SimpleOuterSubscriber, _super);
	    function SimpleOuterSubscriber() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    SimpleOuterSubscriber.prototype.notifyNext = function (innerValue) {
	        this.destination.next(innerValue);
	    };
	    SimpleOuterSubscriber.prototype.notifyError = function (err) {
	        this.destination.error(err);
	    };
	    SimpleOuterSubscriber.prototype.notifyComplete = function () {
	        this.destination.complete();
	    };
	    return SimpleOuterSubscriber;
	}(Subscriber));
	function innerSubscribe(result, innerSubscriber) {
	    if (innerSubscriber.closed) {
	        return undefined;
	    }
	    if (result instanceof Observable) {
	        return result.subscribe(innerSubscriber);
	    }
	    return subscribeTo(result)(innerSubscriber);
	}

	/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */
	function mergeMap(project, resultSelector, concurrent) {
	    if (concurrent === void 0) {
	        concurrent = Number.POSITIVE_INFINITY;
	    }
	    if (typeof resultSelector === 'function') {
	        return function (source) { return source.pipe(mergeMap(function (a, i) { return from(project(a, i)).pipe(map(function (b, ii) { return resultSelector(a, b, i, ii); })); }, concurrent)); };
	    }
	    else if (typeof resultSelector === 'number') {
	        concurrent = resultSelector;
	    }
	    return function (source) { return source.lift(new MergeMapOperator(project, concurrent)); };
	}
	var MergeMapOperator = /*@__PURE__*/ (function () {
	    function MergeMapOperator(project, concurrent) {
	        if (concurrent === void 0) {
	            concurrent = Number.POSITIVE_INFINITY;
	        }
	        this.project = project;
	        this.concurrent = concurrent;
	    }
	    MergeMapOperator.prototype.call = function (observer, source) {
	        return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
	    };
	    return MergeMapOperator;
	}());
	var MergeMapSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(MergeMapSubscriber, _super);
	    function MergeMapSubscriber(destination, project, concurrent) {
	        if (concurrent === void 0) {
	            concurrent = Number.POSITIVE_INFINITY;
	        }
	        var _this = _super.call(this, destination) || this;
	        _this.project = project;
	        _this.concurrent = concurrent;
	        _this.hasCompleted = false;
	        _this.buffer = [];
	        _this.active = 0;
	        _this.index = 0;
	        return _this;
	    }
	    MergeMapSubscriber.prototype._next = function (value) {
	        if (this.active < this.concurrent) {
	            this._tryNext(value);
	        }
	        else {
	            this.buffer.push(value);
	        }
	    };
	    MergeMapSubscriber.prototype._tryNext = function (value) {
	        var result;
	        var index = this.index++;
	        try {
	            result = this.project(value, index);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.active++;
	        this._innerSub(result);
	    };
	    MergeMapSubscriber.prototype._innerSub = function (ish) {
	        var innerSubscriber = new SimpleInnerSubscriber(this);
	        var destination = this.destination;
	        destination.add(innerSubscriber);
	        var innerSubscription = innerSubscribe(ish, innerSubscriber);
	        if (innerSubscription !== innerSubscriber) {
	            destination.add(innerSubscription);
	        }
	    };
	    MergeMapSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.active === 0 && this.buffer.length === 0) {
	            this.destination.complete();
	        }
	        this.unsubscribe();
	    };
	    MergeMapSubscriber.prototype.notifyNext = function (innerValue) {
	        this.destination.next(innerValue);
	    };
	    MergeMapSubscriber.prototype.notifyComplete = function () {
	        var buffer = this.buffer;
	        this.active--;
	        if (buffer.length > 0) {
	            this._next(buffer.shift());
	        }
	        else if (this.active === 0 && this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return MergeMapSubscriber;
	}(SimpleOuterSubscriber));
	var flatMap = mergeMap;

	/** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */
	function mergeAll(concurrent) {
	    if (concurrent === void 0) {
	        concurrent = Number.POSITIVE_INFINITY;
	    }
	    return mergeMap(identity, concurrent);
	}

	/** PURE_IMPORTS_START _mergeAll PURE_IMPORTS_END */
	function concatAll() {
	    return mergeAll(1);
	}

	/** PURE_IMPORTS_START _of,_operators_concatAll PURE_IMPORTS_END */
	function concat() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    return concatAll()(of.apply(void 0, observables));
	}

	/** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */
	function defer(observableFactory) {
	    return new Observable(function (subscriber) {
	        var input;
	        try {
	            input = observableFactory();
	        }
	        catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        var source = input ? from(input) : empty$1();
	        return source.subscribe(subscriber);
	    });
	}

	/** PURE_IMPORTS_START _Observable,_util_isArray,_operators_map,_util_isObject,_from PURE_IMPORTS_END */
	function forkJoin() {
	    var sources = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        sources[_i] = arguments[_i];
	    }
	    if (sources.length === 1) {
	        var first_1 = sources[0];
	        if (isArray(first_1)) {
	            return forkJoinInternal(first_1, null);
	        }
	        if (isObject(first_1) && Object.getPrototypeOf(first_1) === Object.prototype) {
	            var keys = Object.keys(first_1);
	            return forkJoinInternal(keys.map(function (key) { return first_1[key]; }), keys);
	        }
	    }
	    if (typeof sources[sources.length - 1] === 'function') {
	        var resultSelector_1 = sources.pop();
	        sources = (sources.length === 1 && isArray(sources[0])) ? sources[0] : sources;
	        return forkJoinInternal(sources, null).pipe(map(function (args) { return resultSelector_1.apply(void 0, args); }));
	    }
	    return forkJoinInternal(sources, null);
	}
	function forkJoinInternal(sources, keys) {
	    return new Observable(function (subscriber) {
	        var len = sources.length;
	        if (len === 0) {
	            subscriber.complete();
	            return;
	        }
	        var values = new Array(len);
	        var completed = 0;
	        var emitted = 0;
	        var _loop_1 = function (i) {
	            var source = from(sources[i]);
	            var hasValue = false;
	            subscriber.add(source.subscribe({
	                next: function (value) {
	                    if (!hasValue) {
	                        hasValue = true;
	                        emitted++;
	                    }
	                    values[i] = value;
	                },
	                error: function (err) { return subscriber.error(err); },
	                complete: function () {
	                    completed++;
	                    if (completed === len || !hasValue) {
	                        if (emitted === len) {
	                            subscriber.next(keys ?
	                                keys.reduce(function (result, key, i) { return (result[key] = values[i], result); }, {}) :
	                                values);
	                        }
	                        subscriber.complete();
	                    }
	                }
	            }));
	        };
	        for (var i = 0; i < len; i++) {
	            _loop_1(i);
	        }
	    });
	}

	/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */
	function fromEvent(target, eventName, options, resultSelector) {
	    if (isFunction(options)) {
	        resultSelector = options;
	        options = undefined;
	    }
	    if (resultSelector) {
	        return fromEvent(target, eventName, options).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
	    }
	    return new Observable(function (subscriber) {
	        function handler(e) {
	            if (arguments.length > 1) {
	                subscriber.next(Array.prototype.slice.call(arguments));
	            }
	            else {
	                subscriber.next(e);
	            }
	        }
	        setupSubscription(target, eventName, handler, subscriber, options);
	    });
	}
	function setupSubscription(sourceObj, eventName, handler, subscriber, options) {
	    var unsubscribe;
	    if (isEventTarget(sourceObj)) {
	        var source_1 = sourceObj;
	        sourceObj.addEventListener(eventName, handler, options);
	        unsubscribe = function () { return source_1.removeEventListener(eventName, handler, options); };
	    }
	    else if (isJQueryStyleEventEmitter(sourceObj)) {
	        var source_2 = sourceObj;
	        sourceObj.on(eventName, handler);
	        unsubscribe = function () { return source_2.off(eventName, handler); };
	    }
	    else if (isNodeStyleEventEmitter(sourceObj)) {
	        var source_3 = sourceObj;
	        sourceObj.addListener(eventName, handler);
	        unsubscribe = function () { return source_3.removeListener(eventName, handler); };
	    }
	    else if (sourceObj && sourceObj.length) {
	        for (var i = 0, len = sourceObj.length; i < len; i++) {
	            setupSubscription(sourceObj[i], eventName, handler, subscriber, options);
	        }
	    }
	    else {
	        throw new TypeError('Invalid event target');
	    }
	    subscriber.add(unsubscribe);
	}
	function isNodeStyleEventEmitter(sourceObj) {
	    return sourceObj && typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function';
	}
	function isJQueryStyleEventEmitter(sourceObj) {
	    return sourceObj && typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function';
	}
	function isEventTarget(sourceObj) {
	    return sourceObj && typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function';
	}

	/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */
	function fromEventPattern(addHandler, removeHandler, resultSelector) {
	    if (resultSelector) {
	        return fromEventPattern(addHandler, removeHandler).pipe(map(function (args) { return isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args); }));
	    }
	    return new Observable(function (subscriber) {
	        var handler = function () {
	            var e = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                e[_i] = arguments[_i];
	            }
	            return subscriber.next(e.length === 1 ? e[0] : e);
	        };
	        var retValue;
	        try {
	            retValue = addHandler(handler);
	        }
	        catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        if (!isFunction(removeHandler)) {
	            return undefined;
	        }
	        return function () { return removeHandler(handler, retValue); };
	    });
	}

	/** PURE_IMPORTS_START _Observable,_util_identity,_util_isScheduler PURE_IMPORTS_END */
	function generate(initialStateOrOptions, condition, iterate, resultSelectorOrObservable, scheduler) {
	    var resultSelector;
	    var initialState;
	    if (arguments.length == 1) {
	        var options = initialStateOrOptions;
	        initialState = options.initialState;
	        condition = options.condition;
	        iterate = options.iterate;
	        resultSelector = options.resultSelector || identity;
	        scheduler = options.scheduler;
	    }
	    else if (resultSelectorOrObservable === undefined || isScheduler(resultSelectorOrObservable)) {
	        initialState = initialStateOrOptions;
	        resultSelector = identity;
	        scheduler = resultSelectorOrObservable;
	    }
	    else {
	        initialState = initialStateOrOptions;
	        resultSelector = resultSelectorOrObservable;
	    }
	    return new Observable(function (subscriber) {
	        var state = initialState;
	        if (scheduler) {
	            return scheduler.schedule(dispatch$3, 0, {
	                subscriber: subscriber,
	                iterate: iterate,
	                condition: condition,
	                resultSelector: resultSelector,
	                state: state
	            });
	        }
	        do {
	            if (condition) {
	                var conditionResult = void 0;
	                try {
	                    conditionResult = condition(state);
	                }
	                catch (err) {
	                    subscriber.error(err);
	                    return undefined;
	                }
	                if (!conditionResult) {
	                    subscriber.complete();
	                    break;
	                }
	            }
	            var value = void 0;
	            try {
	                value = resultSelector(state);
	            }
	            catch (err) {
	                subscriber.error(err);
	                return undefined;
	            }
	            subscriber.next(value);
	            if (subscriber.closed) {
	                break;
	            }
	            try {
	                state = iterate(state);
	            }
	            catch (err) {
	                subscriber.error(err);
	                return undefined;
	            }
	        } while (true);
	        return undefined;
	    });
	}
	function dispatch$3(state) {
	    var subscriber = state.subscriber, condition = state.condition;
	    if (subscriber.closed) {
	        return undefined;
	    }
	    if (state.needIterate) {
	        try {
	            state.state = state.iterate(state.state);
	        }
	        catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	    }
	    else {
	        state.needIterate = true;
	    }
	    if (condition) {
	        var conditionResult = void 0;
	        try {
	            conditionResult = condition(state.state);
	        }
	        catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        if (!conditionResult) {
	            subscriber.complete();
	            return undefined;
	        }
	        if (subscriber.closed) {
	            return undefined;
	        }
	    }
	    var value;
	    try {
	        value = state.resultSelector(state.state);
	    }
	    catch (err) {
	        subscriber.error(err);
	        return undefined;
	    }
	    if (subscriber.closed) {
	        return undefined;
	    }
	    subscriber.next(value);
	    if (subscriber.closed) {
	        return undefined;
	    }
	    return this.schedule(state);
	}

	/** PURE_IMPORTS_START _defer,_empty PURE_IMPORTS_END */
	function iif(condition, trueResult, falseResult) {
	    if (trueResult === void 0) {
	        trueResult = EMPTY;
	    }
	    if (falseResult === void 0) {
	        falseResult = EMPTY;
	    }
	    return defer(function () { return condition() ? trueResult : falseResult; });
	}

	/** PURE_IMPORTS_START _isArray PURE_IMPORTS_END */
	function isNumeric(val) {
	    return !isArray(val) && (val - parseFloat(val) + 1) >= 0;
	}

	/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric PURE_IMPORTS_END */
	function interval(period, scheduler) {
	    if (period === void 0) {
	        period = 0;
	    }
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    if (!isNumeric(period) || period < 0) {
	        period = 0;
	    }
	    if (!scheduler || typeof scheduler.schedule !== 'function') {
	        scheduler = async;
	    }
	    return new Observable(function (subscriber) {
	        subscriber.add(scheduler.schedule(dispatch$4, period, { subscriber: subscriber, counter: 0, period: period }));
	        return subscriber;
	    });
	}
	function dispatch$4(state) {
	    var subscriber = state.subscriber, counter = state.counter, period = state.period;
	    subscriber.next(counter);
	    this.schedule({ subscriber: subscriber, counter: counter + 1, period: period }, period);
	}

	/** PURE_IMPORTS_START _Observable,_util_isScheduler,_operators_mergeAll,_fromArray PURE_IMPORTS_END */
	function merge() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    var concurrent = Number.POSITIVE_INFINITY;
	    var scheduler = null;
	    var last = observables[observables.length - 1];
	    if (isScheduler(last)) {
	        scheduler = observables.pop();
	        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
	            concurrent = observables.pop();
	        }
	    }
	    else if (typeof last === 'number') {
	        concurrent = observables.pop();
	    }
	    if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
	        return observables[0];
	    }
	    return mergeAll(concurrent)(fromArray(observables, scheduler));
	}

	/** PURE_IMPORTS_START _Observable,_util_noop PURE_IMPORTS_END */
	var NEVER = /*@__PURE__*/ new Observable(noop);
	function never() {
	    return NEVER;
	}

	/** PURE_IMPORTS_START _Observable,_from,_util_isArray,_empty PURE_IMPORTS_END */
	function onErrorResumeNext() {
	    var sources = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        sources[_i] = arguments[_i];
	    }
	    if (sources.length === 0) {
	        return EMPTY;
	    }
	    var first = sources[0], remainder = sources.slice(1);
	    if (sources.length === 1 && isArray(first)) {
	        return onErrorResumeNext.apply(void 0, first);
	    }
	    return new Observable(function (subscriber) {
	        var subNext = function () { return subscriber.add(onErrorResumeNext.apply(void 0, remainder).subscribe(subscriber)); };
	        return from(first).subscribe({
	            next: function (value) { subscriber.next(value); },
	            error: subNext,
	            complete: subNext,
	        });
	    });
	}

	/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
	function pairs(obj, scheduler) {
	    if (!scheduler) {
	        return new Observable(function (subscriber) {
	            var keys = Object.keys(obj);
	            for (var i = 0; i < keys.length && !subscriber.closed; i++) {
	                var key = keys[i];
	                if (obj.hasOwnProperty(key)) {
	                    subscriber.next([key, obj[key]]);
	                }
	            }
	            subscriber.complete();
	        });
	    }
	    else {
	        return new Observable(function (subscriber) {
	            var keys = Object.keys(obj);
	            var subscription = new Subscription();
	            subscription.add(scheduler.schedule(dispatch$5, 0, { keys: keys, index: 0, subscriber: subscriber, subscription: subscription, obj: obj }));
	            return subscription;
	        });
	    }
	}
	function dispatch$5(state) {
	    var keys = state.keys, index = state.index, subscriber = state.subscriber, subscription = state.subscription, obj = state.obj;
	    if (!subscriber.closed) {
	        if (index < keys.length) {
	            var key = keys[index];
	            subscriber.next([key, obj[key]]);
	            subscription.add(this.schedule({ keys: keys, index: index + 1, subscriber: subscriber, subscription: subscription, obj: obj }));
	        }
	        else {
	            subscriber.complete();
	        }
	    }
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function not(pred, thisArg) {
	    function notPred() {
	        return !(notPred.pred.apply(notPred.thisArg, arguments));
	    }
	    notPred.pred = pred;
	    notPred.thisArg = thisArg;
	    return notPred;
	}

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function filter(predicate, thisArg) {
	    return function filterOperatorFunction(source) {
	        return source.lift(new FilterOperator(predicate, thisArg));
	    };
	}
	var FilterOperator = /*@__PURE__*/ (function () {
	    function FilterOperator(predicate, thisArg) {
	        this.predicate = predicate;
	        this.thisArg = thisArg;
	    }
	    FilterOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
	    };
	    return FilterOperator;
	}());
	var FilterSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(FilterSubscriber, _super);
	    function FilterSubscriber(destination, predicate, thisArg) {
	        var _this = _super.call(this, destination) || this;
	        _this.predicate = predicate;
	        _this.thisArg = thisArg;
	        _this.count = 0;
	        return _this;
	    }
	    FilterSubscriber.prototype._next = function (value) {
	        var result;
	        try {
	            result = this.predicate.call(this.thisArg, value, this.count++);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (result) {
	            this.destination.next(value);
	        }
	    };
	    return FilterSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _util_not,_util_subscribeTo,_operators_filter,_Observable PURE_IMPORTS_END */
	function partition(source, predicate, thisArg) {
	    return [
	        filter(predicate, thisArg)(new Observable(subscribeTo(source))),
	        filter(not(predicate, thisArg))(new Observable(subscribeTo(source)))
	    ];
	}

	/** PURE_IMPORTS_START tslib,_util_isArray,_fromArray,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */
	function race() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    if (observables.length === 1) {
	        if (isArray(observables[0])) {
	            observables = observables[0];
	        }
	        else {
	            return observables[0];
	        }
	    }
	    return fromArray(observables, undefined).lift(new RaceOperator());
	}
	var RaceOperator = /*@__PURE__*/ (function () {
	    function RaceOperator() {
	    }
	    RaceOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new RaceSubscriber(subscriber));
	    };
	    return RaceOperator;
	}());
	var RaceSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(RaceSubscriber, _super);
	    function RaceSubscriber(destination) {
	        var _this = _super.call(this, destination) || this;
	        _this.hasFirst = false;
	        _this.observables = [];
	        _this.subscriptions = [];
	        return _this;
	    }
	    RaceSubscriber.prototype._next = function (observable) {
	        this.observables.push(observable);
	    };
	    RaceSubscriber.prototype._complete = function () {
	        var observables = this.observables;
	        var len = observables.length;
	        if (len === 0) {
	            this.destination.complete();
	        }
	        else {
	            for (var i = 0; i < len && !this.hasFirst; i++) {
	                var observable = observables[i];
	                var subscription = subscribeToResult(this, observable, undefined, i);
	                if (this.subscriptions) {
	                    this.subscriptions.push(subscription);
	                }
	                this.add(subscription);
	            }
	            this.observables = null;
	        }
	    };
	    RaceSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
	        if (!this.hasFirst) {
	            this.hasFirst = true;
	            for (var i = 0; i < this.subscriptions.length; i++) {
	                if (i !== outerIndex) {
	                    var subscription = this.subscriptions[i];
	                    subscription.unsubscribe();
	                    this.remove(subscription);
	                }
	            }
	            this.subscriptions = null;
	        }
	        this.destination.next(innerValue);
	    };
	    return RaceSubscriber;
	}(OuterSubscriber));

	/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
	function range$1(start, count, scheduler) {
	    if (start === void 0) {
	        start = 0;
	    }
	    return new Observable(function (subscriber) {
	        if (count === undefined) {
	            count = start;
	            start = 0;
	        }
	        var index = 0;
	        var current = start;
	        if (scheduler) {
	            return scheduler.schedule(dispatch$6, 0, {
	                index: index, count: count, start: start, subscriber: subscriber
	            });
	        }
	        else {
	            do {
	                if (index++ >= count) {
	                    subscriber.complete();
	                    break;
	                }
	                subscriber.next(current++);
	                if (subscriber.closed) {
	                    break;
	                }
	            } while (true);
	        }
	        return undefined;
	    });
	}
	function dispatch$6(state) {
	    var start = state.start, index = state.index, count = state.count, subscriber = state.subscriber;
	    if (index >= count) {
	        subscriber.complete();
	        return;
	    }
	    subscriber.next(start);
	    if (subscriber.closed) {
	        return;
	    }
	    state.index = index + 1;
	    state.start = start + 1;
	    this.schedule(state);
	}

	/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */
	function timer(dueTime, periodOrScheduler, scheduler) {
	    if (dueTime === void 0) {
	        dueTime = 0;
	    }
	    var period = -1;
	    if (isNumeric(periodOrScheduler)) {
	        period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
	    }
	    else if (isScheduler(periodOrScheduler)) {
	        scheduler = periodOrScheduler;
	    }
	    if (!isScheduler(scheduler)) {
	        scheduler = async;
	    }
	    return new Observable(function (subscriber) {
	        var due = isNumeric(dueTime)
	            ? dueTime
	            : (+dueTime - scheduler.now());
	        return scheduler.schedule(dispatch$7, due, {
	            index: 0, period: period, subscriber: subscriber
	        });
	    });
	}
	function dispatch$7(state) {
	    var index = state.index, period = state.period, subscriber = state.subscriber;
	    subscriber.next(index);
	    if (subscriber.closed) {
	        return;
	    }
	    else if (period === -1) {
	        return subscriber.complete();
	    }
	    state.index = index + 1;
	    this.schedule(state, period);
	}

	/** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */
	function using(resourceFactory, observableFactory) {
	    return new Observable(function (subscriber) {
	        var resource;
	        try {
	            resource = resourceFactory();
	        }
	        catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        var result;
	        try {
	            result = observableFactory(resource);
	        }
	        catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        var source = result ? from(result) : EMPTY;
	        var subscription = source.subscribe(subscriber);
	        return function () {
	            subscription.unsubscribe();
	            if (resource) {
	                resource.unsubscribe();
	            }
	        };
	    });
	}

	/** PURE_IMPORTS_START tslib,_fromArray,_util_isArray,_Subscriber,_.._internal_symbol_iterator,_innerSubscribe PURE_IMPORTS_END */
	function zip() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    var resultSelector = observables[observables.length - 1];
	    if (typeof resultSelector === 'function') {
	        observables.pop();
	    }
	    return fromArray(observables, undefined).lift(new ZipOperator(resultSelector));
	}
	var ZipOperator = /*@__PURE__*/ (function () {
	    function ZipOperator(resultSelector) {
	        this.resultSelector = resultSelector;
	    }
	    ZipOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ZipSubscriber(subscriber, this.resultSelector));
	    };
	    return ZipOperator;
	}());
	var ZipSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ZipSubscriber, _super);
	    function ZipSubscriber(destination, resultSelector, values) {
	        var _this = _super.call(this, destination) || this;
	        _this.resultSelector = resultSelector;
	        _this.iterators = [];
	        _this.active = 0;
	        _this.resultSelector = (typeof resultSelector === 'function') ? resultSelector : undefined;
	        return _this;
	    }
	    ZipSubscriber.prototype._next = function (value) {
	        var iterators = this.iterators;
	        if (isArray(value)) {
	            iterators.push(new StaticArrayIterator(value));
	        }
	        else if (typeof value[iterator] === 'function') {
	            iterators.push(new StaticIterator(value[iterator]()));
	        }
	        else {
	            iterators.push(new ZipBufferIterator(this.destination, this, value));
	        }
	    };
	    ZipSubscriber.prototype._complete = function () {
	        var iterators = this.iterators;
	        var len = iterators.length;
	        this.unsubscribe();
	        if (len === 0) {
	            this.destination.complete();
	            return;
	        }
	        this.active = len;
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            if (iterator.stillUnsubscribed) {
	                var destination = this.destination;
	                destination.add(iterator.subscribe());
	            }
	            else {
	                this.active--;
	            }
	        }
	    };
	    ZipSubscriber.prototype.notifyInactive = function () {
	        this.active--;
	        if (this.active === 0) {
	            this.destination.complete();
	        }
	    };
	    ZipSubscriber.prototype.checkIterators = function () {
	        var iterators = this.iterators;
	        var len = iterators.length;
	        var destination = this.destination;
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            if (typeof iterator.hasValue === 'function' && !iterator.hasValue()) {
	                return;
	            }
	        }
	        var shouldComplete = false;
	        var args = [];
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            var result = iterator.next();
	            if (iterator.hasCompleted()) {
	                shouldComplete = true;
	            }
	            if (result.done) {
	                destination.complete();
	                return;
	            }
	            args.push(result.value);
	        }
	        if (this.resultSelector) {
	            this._tryresultSelector(args);
	        }
	        else {
	            destination.next(args);
	        }
	        if (shouldComplete) {
	            destination.complete();
	        }
	    };
	    ZipSubscriber.prototype._tryresultSelector = function (args) {
	        var result;
	        try {
	            result = this.resultSelector.apply(this, args);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return ZipSubscriber;
	}(Subscriber));
	var StaticIterator = /*@__PURE__*/ (function () {
	    function StaticIterator(iterator) {
	        this.iterator = iterator;
	        this.nextResult = iterator.next();
	    }
	    StaticIterator.prototype.hasValue = function () {
	        return true;
	    };
	    StaticIterator.prototype.next = function () {
	        var result = this.nextResult;
	        this.nextResult = this.iterator.next();
	        return result;
	    };
	    StaticIterator.prototype.hasCompleted = function () {
	        var nextResult = this.nextResult;
	        return Boolean(nextResult && nextResult.done);
	    };
	    return StaticIterator;
	}());
	var StaticArrayIterator = /*@__PURE__*/ (function () {
	    function StaticArrayIterator(array) {
	        this.array = array;
	        this.index = 0;
	        this.length = 0;
	        this.length = array.length;
	    }
	    StaticArrayIterator.prototype[iterator] = function () {
	        return this;
	    };
	    StaticArrayIterator.prototype.next = function (value) {
	        var i = this.index++;
	        var array = this.array;
	        return i < this.length ? { value: array[i], done: false } : { value: null, done: true };
	    };
	    StaticArrayIterator.prototype.hasValue = function () {
	        return this.array.length > this.index;
	    };
	    StaticArrayIterator.prototype.hasCompleted = function () {
	        return this.array.length === this.index;
	    };
	    return StaticArrayIterator;
	}());
	var ZipBufferIterator = /*@__PURE__*/ (function (_super) {
	    __extends(ZipBufferIterator, _super);
	    function ZipBufferIterator(destination, parent, observable) {
	        var _this = _super.call(this, destination) || this;
	        _this.parent = parent;
	        _this.observable = observable;
	        _this.stillUnsubscribed = true;
	        _this.buffer = [];
	        _this.isComplete = false;
	        return _this;
	    }
	    ZipBufferIterator.prototype[iterator] = function () {
	        return this;
	    };
	    ZipBufferIterator.prototype.next = function () {
	        var buffer = this.buffer;
	        if (buffer.length === 0 && this.isComplete) {
	            return { value: null, done: true };
	        }
	        else {
	            return { value: buffer.shift(), done: false };
	        }
	    };
	    ZipBufferIterator.prototype.hasValue = function () {
	        return this.buffer.length > 0;
	    };
	    ZipBufferIterator.prototype.hasCompleted = function () {
	        return this.buffer.length === 0 && this.isComplete;
	    };
	    ZipBufferIterator.prototype.notifyComplete = function () {
	        if (this.buffer.length > 0) {
	            this.isComplete = true;
	            this.parent.notifyInactive();
	        }
	        else {
	            this.destination.complete();
	        }
	    };
	    ZipBufferIterator.prototype.notifyNext = function (innerValue) {
	        this.buffer.push(innerValue);
	        this.parent.checkIterators();
	    };
	    ZipBufferIterator.prototype.subscribe = function () {
	        return innerSubscribe(this.observable, new SimpleInnerSubscriber(this));
	    };
	    return ZipBufferIterator;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */

	var _esm5 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		Observable: Observable,
		ConnectableObservable: ConnectableObservable,
		GroupedObservable: GroupedObservable,
		observable: observable,
		Subject: Subject,
		BehaviorSubject: BehaviorSubject,
		ReplaySubject: ReplaySubject,
		AsyncSubject: AsyncSubject,
		asap: asap,
		asapScheduler: asapScheduler,
		async: async,
		asyncScheduler: asyncScheduler,
		queue: queue,
		queueScheduler: queueScheduler,
		animationFrame: animationFrame,
		animationFrameScheduler: animationFrameScheduler,
		VirtualTimeScheduler: VirtualTimeScheduler,
		VirtualAction: VirtualAction,
		Scheduler: Scheduler,
		Subscription: Subscription,
		Subscriber: Subscriber,
		Notification: Notification,
		get NotificationKind () { return NotificationKind; },
		pipe: pipe,
		noop: noop,
		identity: identity,
		isObservable: isObservable,
		ArgumentOutOfRangeError: ArgumentOutOfRangeError,
		EmptyError: EmptyError,
		ObjectUnsubscribedError: ObjectUnsubscribedError,
		UnsubscriptionError: UnsubscriptionError,
		TimeoutError: TimeoutError,
		bindCallback: bindCallback,
		bindNodeCallback: bindNodeCallback,
		combineLatest: combineLatest,
		concat: concat,
		defer: defer,
		empty: empty$1,
		forkJoin: forkJoin,
		from: from,
		fromEvent: fromEvent,
		fromEventPattern: fromEventPattern,
		generate: generate,
		iif: iif,
		interval: interval,
		merge: merge,
		never: never,
		of: of,
		onErrorResumeNext: onErrorResumeNext,
		pairs: pairs,
		partition: partition,
		race: race,
		range: range$1,
		throwError: throwError,
		timer: timer,
		using: using,
		zip: zip,
		scheduled: scheduled,
		EMPTY: EMPTY,
		NEVER: NEVER,
		config: config
	});

	var money_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isMoney = void 0;
	function isMoney(x) {
	    return x != null
	        && typeof x === 'object'
	        && typeof x.currency === 'string'
	        && typeof x.amount === 'number';
	}
	exports.isMoney = isMoney;
	function money(moneyOrCurrency, amount) {
	    if (isMoney(moneyOrCurrency))
	        return moneyOrCurrency;
	    if (typeof moneyOrCurrency === 'string' && amount != null)
	        return { currency: moneyOrCurrency, amount };
	    return { currency: 'EUR', amount: 0 };
	}
	exports.default = money;

	});

	unwrapExports(money_1);
	var money_2 = money_1.isMoney;

	var createEventMessage_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });


	const createEventMessage = (...args) => {
	    if (typeof args[0] !== 'string')
	        throw new Error("First parameter must be of type 'string'");
	    if (args.length === 1)
	        return new message.EventMessage(args[0]);
	    let fields = args[2];
	    let context = args[3];
	    if (args[1] instanceof Error) {
	        return new message.EventMessage(args[0], null, args[1], message.LogLevel.error, null, fields, context);
	    }
	    if (money_1.isMoney(args[1])) {
	        return new message.EventMessage(args[0], args[1], null, message.LogLevel.info, null, fields, context);
	    }
	    fields = args[1];
	    context = args[2];
	    return new message.EventMessage(args[0], null, null, message.LogLevel.info, null, fields, context);
	};
	exports.default = createEventMessage;

	});

	unwrapExports(createEventMessage_1);

	var createIdentifyMessage_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	const createIdentifyMessage = (currentUserId, ...args) => {
	    if (args.length === 0 || typeof args[0] !== 'string')
	        throw new Error('args.length === 0 || typeof args[0] !== string, which means an invalid call to the identify function, was made');
	    if (args.length === 1 && currentUserId == null)
	        throw new Error('userIdFallback parameter is null or undefined, but the call to identify only has a single userId supplied');
	    if (args.length >= 2 && typeof args[1] !== 'string')
	        throw new Error('args[0] was string, but args[1] was not.');
	    if (args.length >= 2)
	        return new message.IdentifyUserMessage(args[0], args[1]);
	    else
	        return new message.IdentifyUserMessage(currentUserId, args[1]);
	};
	exports.default = createIdentifyMessage;

	});

	unwrapExports(createIdentifyMessage_1);

	var features = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.OpenTelemetryHasTracer = exports.OpenTelemetryFeature = exports.GlobalLocationHandling = exports.GlobalClickHandling = exports.GlobalErrorHandling = exports.UniversalRendering = void 0;
	exports.UniversalRendering = 'universal-rendering';
	exports.GlobalErrorHandling = 'global-error-handling';
	exports.GlobalClickHandling = 'global-click-handling';
	exports.GlobalLocationHandling = 'global-location-handling';
	exports.OpenTelemetryFeature = 'opentelemetry';
	exports.OpenTelemetryHasTracer = 'opentelemetry/has-tracer';

	});

	unwrapExports(features);
	var features_1 = features.OpenTelemetryHasTracer;
	var features_2 = features.OpenTelemetryFeature;
	var features_3 = features.GlobalLocationHandling;
	var features_4 = features.GlobalClickHandling;
	var features_5 = features.GlobalErrorHandling;
	var features_6 = features.UniversalRendering;

	/*!
	 * cookie
	 * Copyright(c) 2012-2014 Roman Shtylman
	 * Copyright(c) 2015 Douglas Christopher Wilson
	 * MIT Licensed
	 */

	/**
	 * Module exports.
	 * @public
	 */

	var parse_1$1 = parse$1;
	var serialize_1 = serialize;

	/**
	 * Module variables.
	 * @private
	 */

	var decode = decodeURIComponent;
	var encode = encodeURIComponent;
	var pairSplitRegExp = /; */;

	/**
	 * RegExp to match field-content in RFC 7230 sec 3.2
	 *
	 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
	 * field-vchar   = VCHAR / obs-text
	 * obs-text      = %x80-FF
	 */

	var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

	/**
	 * Parse a cookie header.
	 *
	 * Parse the given cookie header string into an object
	 * The object has the various cookies as keys(names) => values
	 *
	 * @param {string} str
	 * @param {object} [options]
	 * @return {object}
	 * @public
	 */

	function parse$1(str, options) {
	  if (typeof str !== 'string') {
	    throw new TypeError('argument str must be a string');
	  }

	  var obj = {};
	  var opt = options || {};
	  var pairs = str.split(pairSplitRegExp);
	  var dec = opt.decode || decode;

	  for (var i = 0; i < pairs.length; i++) {
	    var pair = pairs[i];
	    var eq_idx = pair.indexOf('=');

	    // skip things that don't look like key=value
	    if (eq_idx < 0) {
	      continue;
	    }

	    var key = pair.substr(0, eq_idx).trim();
	    var val = pair.substr(++eq_idx, pair.length).trim();

	    // quoted values
	    if ('"' == val[0]) {
	      val = val.slice(1, -1);
	    }

	    // only assign once
	    if (undefined == obj[key]) {
	      obj[key] = tryDecode(val, dec);
	    }
	  }

	  return obj;
	}

	/**
	 * Serialize data into a cookie header.
	 *
	 * Serialize the a name value pair into a cookie string suitable for
	 * http headers. An optional options object specified cookie parameters.
	 *
	 * serialize('foo', 'bar', { httpOnly: true })
	 *   => "foo=bar; httpOnly"
	 *
	 * @param {string} name
	 * @param {string} val
	 * @param {object} [options]
	 * @return {string}
	 * @public
	 */

	function serialize(name, val, options) {
	  var opt = options || {};
	  var enc = opt.encode || encode;

	  if (typeof enc !== 'function') {
	    throw new TypeError('option encode is invalid');
	  }

	  if (!fieldContentRegExp.test(name)) {
	    throw new TypeError('argument name is invalid');
	  }

	  var value = enc(val);

	  if (value && !fieldContentRegExp.test(value)) {
	    throw new TypeError('argument val is invalid');
	  }

	  var str = name + '=' + value;

	  if (null != opt.maxAge) {
	    var maxAge = opt.maxAge - 0;

	    if (isNaN(maxAge) || !isFinite(maxAge)) {
	      throw new TypeError('option maxAge is invalid')
	    }

	    str += '; Max-Age=' + Math.floor(maxAge);
	  }

	  if (opt.domain) {
	    if (!fieldContentRegExp.test(opt.domain)) {
	      throw new TypeError('option domain is invalid');
	    }

	    str += '; Domain=' + opt.domain;
	  }

	  if (opt.path) {
	    if (!fieldContentRegExp.test(opt.path)) {
	      throw new TypeError('option path is invalid');
	    }

	    str += '; Path=' + opt.path;
	  }

	  if (opt.expires) {
	    if (typeof opt.expires.toUTCString !== 'function') {
	      throw new TypeError('option expires is invalid');
	    }

	    str += '; Expires=' + opt.expires.toUTCString();
	  }

	  if (opt.httpOnly) {
	    str += '; HttpOnly';
	  }

	  if (opt.secure) {
	    str += '; Secure';
	  }

	  if (opt.sameSite) {
	    var sameSite = typeof opt.sameSite === 'string'
	      ? opt.sameSite.toLowerCase() : opt.sameSite;

	    switch (sameSite) {
	      case true:
	        str += '; SameSite=Strict';
	        break;
	      case 'lax':
	        str += '; SameSite=Lax';
	        break;
	      case 'strict':
	        str += '; SameSite=Strict';
	        break;
	      case 'none':
	        str += '; SameSite=None';
	        break;
	      default:
	        throw new TypeError('option sameSite is invalid');
	    }
	  }

	  return str;
	}

	/**
	 * Try decoding a string using a decoding function.
	 *
	 * @param {string} str
	 * @param {function} decode
	 * @private
	 */

	function tryDecode(str, decode) {
	  try {
	    return decode(str);
	  } catch (e) {
	    return str;
	  }
	}

	var cookie = {
		parse: parse_1$1,
		serialize: serialize_1
	};

	var defaultParseOptions = {
	  decodeValues: true,
	  map: false,
	  silent: false,
	};

	function isNonEmptyString(str) {
	  return typeof str === "string" && !!str.trim();
	}

	function parseString(setCookieValue, options) {
	  var parts = setCookieValue.split(";").filter(isNonEmptyString);
	  var nameValue = parts.shift().split("=");
	  var name = nameValue.shift();
	  var value = nameValue.join("="); // everything after the first =, joined by a "=" if there was more than one part

	  options = options
	    ? Object.assign({}, defaultParseOptions, options)
	    : defaultParseOptions;

	  var cookie = {
	    name: name, // grab everything before the first =
	    value: options.decodeValues ? decodeURIComponent(value) : value, // decode cookie value
	  };

	  parts.forEach(function (part) {
	    var sides = part.split("=");
	    var key = sides.shift().trimLeft().toLowerCase();
	    var value = sides.join("=");
	    if (key === "expires") {
	      cookie.expires = new Date(value);
	    } else if (key === "max-age") {
	      cookie.maxAge = parseInt(value, 10);
	    } else if (key === "secure") {
	      cookie.secure = true;
	    } else if (key === "httponly") {
	      cookie.httpOnly = true;
	    } else if (key === "samesite") {
	      cookie.sameSite = value;
	    } else {
	      cookie[key] = value;
	    }
	  });

	  return cookie;
	}

	function parse$2(input, options) {
	  options = options
	    ? Object.assign({}, defaultParseOptions, options)
	    : defaultParseOptions;

	  if (!input) {
	    if (!options.map) {
	      return [];
	    } else {
	      return {};
	    }
	  }

	  if (input.headers && input.headers["set-cookie"]) {
	    // fast-path for node.js (which automatically normalizes header names to lower-case
	    input = input.headers["set-cookie"];
	  } else if (input.headers) {
	    // slow-path for other environments - see #25
	    var sch =
	      input.headers[
	        Object.keys(input.headers).find(function (key) {
	          return key.toLowerCase() === "set-cookie";
	        })
	      ];
	    // warn if called on a request-like object with a cookie header rather than a set-cookie header - see #34, 36
	    if (!sch && input.headers.cookie && !options.silent) {
	      console.warn(
	        "Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
	      );
	    }
	    input = sch;
	  }
	  if (!Array.isArray(input)) {
	    input = [input];
	  }

	  options = options
	    ? Object.assign({}, defaultParseOptions, options)
	    : defaultParseOptions;

	  if (!options.map) {
	    return input.filter(isNonEmptyString).map(function (str) {
	      return parseString(str, options);
	    });
	  } else {
	    var cookies = {};
	    return input.filter(isNonEmptyString).reduce(function (cookies, str) {
	      var cookie = parseString(str, options);
	      cookies[cookie.name] = cookie;
	      return cookies;
	    }, cookies);
	  }
	}

	/*
	  Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas
	  that are within a single set-cookie field-value, such as in the Expires portion.

	  This is uncommon, but explicitly allowed - see https://tools.ietf.org/html/rfc2616#section-4.2
	  Node.js does this for every header *except* set-cookie - see https://github.com/nodejs/node/blob/d5e363b77ebaf1caf67cd7528224b651c86815c1/lib/_http_incoming.js#L128
	  React Native's fetch does this for *every* header, including set-cookie.

	  Based on: https://github.com/google/j2objc/commit/16820fdbc8f76ca0c33472810ce0cb03d20efe25
	  Credits to: https://github.com/tomball for original and https://github.com/chrusart for JavaScript implementation
	*/
	function splitCookiesString(cookiesString) {
	  if (Array.isArray(cookiesString)) {
	    return cookiesString;
	  }
	  if (typeof cookiesString !== "string") {
	    return [];
	  }

	  var cookiesStrings = [];
	  var pos = 0;
	  var start;
	  var ch;
	  var lastComma;
	  var nextStart;
	  var cookiesSeparatorFound;

	  function skipWhitespace() {
	    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
	      pos += 1;
	    }
	    return pos < cookiesString.length;
	  }

	  function notSpecialChar() {
	    ch = cookiesString.charAt(pos);

	    return ch !== "=" && ch !== ";" && ch !== ",";
	  }

	  while (pos < cookiesString.length) {
	    start = pos;
	    cookiesSeparatorFound = false;

	    while (skipWhitespace()) {
	      ch = cookiesString.charAt(pos);
	      if (ch === ",") {
	        // ',' is a cookie separator if we have later first '=', not ';' or ','
	        lastComma = pos;
	        pos += 1;

	        skipWhitespace();
	        nextStart = pos;

	        while (pos < cookiesString.length && notSpecialChar()) {
	          pos += 1;
	        }

	        // currently special character
	        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
	          // we found cookies separator
	          cookiesSeparatorFound = true;
	          // pos is inside the next cookie, so back up and return it.
	          pos = nextStart;
	          cookiesStrings.push(cookiesString.substring(start, lastComma));
	          start = pos;
	        } else {
	          // in param ',' or param separator ';',
	          // we continue from that comma
	          pos = lastComma + 1;
	        }
	      } else {
	        pos += 1;
	      }
	    }

	    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
	      cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
	    }
	  }

	  return cookiesStrings;
	}

	var setCookie = parse$2;
	var parse_1$2 = parse$2;
	var parseString_1 = parseString;
	var splitCookiesString_1 = splitCookiesString;
	setCookie.parse = parse_1$2;
	setCookie.parseString = parseString_1;
	setCookie.splitCookiesString = splitCookiesString_1;

	var cookies = createCommonjsModule(function (module, exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.destroyCookie = exports.setCookie = exports.parseCookies = void 0;
	const cookie$1 = __importStar(cookie);
	const setCookieParser = __importStar(setCookie);
	const isBrowser = () => typeof window !== 'undefined';
	function hasSameProperties(a, b) {
	    const aProps = Object.getOwnPropertyNames(a);
	    const bProps = Object.getOwnPropertyNames(b);
	    if (aProps.length !== bProps.length) {
	        return false;
	    }
	    for (let i = 0; i < aProps.length; i++) {
	        const propName = aProps[i];
	        if (a[propName] !== b[propName]) {
	            return false;
	        }
	    }
	    return true;
	}
	function areCookiesEqual(a, b) {
	    let sameSiteSame = a.sameSite === b.sameSite;
	    if (typeof a.sameSite === 'string' && typeof b.sameSite === 'string') {
	        sameSiteSame = a.sameSite.toLowerCase() === b.sameSite.toLowerCase();
	    }
	    return (hasSameProperties(Object.assign(Object.assign({}, a), { sameSite: undefined }), Object.assign(Object.assign({}, b), { sameSite: undefined })) && sameSiteSame);
	}
	function createCookie(name, value, options = {}) {
	    let sameSite = options.sameSite;
	    if (sameSite === true) {
	        sameSite = 'strict';
	    }
	    if (sameSite === undefined || sameSite === false) {
	        sameSite = 'lax';
	    }
	    const cookieToSet = Object.assign(Object.assign({}, options), { sameSite: sameSite });
	    delete cookieToSet.encode;
	    return Object.assign({ name: name, value: value }, cookieToSet);
	}
	function parseCookies(ctx, options = {}) {
	    if (ctx && ctx.req && ctx.req.headers && ctx.req.headers.cookie) {
	        return cookie$1.parse(ctx.req.headers.cookie, options);
	    }
	    if (isBrowser()) {
	        return cookie$1.parse(document.cookie, options);
	    }
	    return {};
	}
	exports.parseCookies = parseCookies;
	function setCookie$1(ctx, name, value, options = {}) {
	    if (ctx && ctx.res && ctx.res.getHeader && ctx.res.setHeader) {
	        let cookies = ctx.res.getHeader('Set-Cookie') || [];
	        if (typeof cookies === 'string')
	            cookies = [cookies];
	        if (typeof cookies === 'number')
	            cookies = [];
	        const parsedCookies = setCookieParser.parse(cookies);
	        const cookiesToSet = [];
	        parsedCookies.forEach((parsedCookie) => {
	            if (!areCookiesEqual(parsedCookie, createCookie(name, value, options))) {
	                cookiesToSet.push(cookie$1.serialize(parsedCookie.name, parsedCookie.value, Object.assign({}, parsedCookie)));
	            }
	        });
	        cookiesToSet.push(cookie$1.serialize(name, value, options));
	        if (!ctx.res.finished) {
	            ctx.res.setHeader('Set-Cookie', cookiesToSet);
	        }
	    }
	    if (isBrowser()) {
	        if (options && options.httpOnly) {
	            throw new Error('Can not set a httpOnly cookie in the browser.');
	        }
	        document.cookie = cookie$1.serialize(name, value, options);
	    }
	}
	exports.setCookie = setCookie$1;
	function destroyCookie(ctx, name, options = {}) {
	    const opts = Object.assign(Object.assign({}, (options || {})), { maxAge: -1 });
	    if (ctx && ctx.res && ctx.res.setHeader && ctx.res.getHeader) {
	        let cookies = ctx.res.getHeader('Set-Cookie') || [];
	        if (typeof cookies === 'string')
	            cookies = [cookies];
	        if (typeof cookies === 'number')
	            cookies = [];
	        cookies.push(cookie$1.serialize(name, '', opts));
	        ctx.res.setHeader('Set-Cookie', cookies);
	    }
	    if (isBrowser()) {
	        document.cookie = cookie$1.serialize(name, '', opts);
	    }
	}
	exports.destroyCookie = destroyCookie;
	exports.default = {
	    set: setCookie$1,
	    get: parseCookies,
	    destroy: destroyCookie,
	};

	});

	unwrapExports(cookies);
	var cookies_1 = cookies.destroyCookie;
	var cookies_2 = cookies.setCookie;
	var cookies_3 = cookies.parseCookies;

	// Unique ID creation requires a high quality random # generator.  In node.js
	// this is pretty straight-forward - we use the crypto API.



	var rng = function nodeRNG() {
	  return crypto$1.randomBytes(16);
	};

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];
	for (var i$1 = 0; i$1 < 256; ++i$1) {
	  byteToHex[i$1] = (i$1 + 0x100).toString(16).substr(1);
	}

	function bytesToUuid(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex;
	  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
	  return ([
	    bth[buf[i++]], bth[buf[i++]],
	    bth[buf[i++]], bth[buf[i++]], '-',
	    bth[buf[i++]], bth[buf[i++]], '-',
	    bth[buf[i++]], bth[buf[i++]], '-',
	    bth[buf[i++]], bth[buf[i++]], '-',
	    bth[buf[i++]], bth[buf[i++]],
	    bth[buf[i++]], bth[buf[i++]],
	    bth[buf[i++]], bth[buf[i++]]
	  ]).join('');
	}

	var bytesToUuid_1 = bytesToUuid;

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	var _nodeId;
	var _clockseq;

	// Previous uuid creation time
	var _lastMSecs = 0;
	var _lastNSecs = 0;

	// See https://github.com/uuidjs/uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};
	  var node = options.node || _nodeId;
	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // node and clockseq need to be initialized to random values if they're not
	  // specified.  We do this lazily to minimize issues related to insufficient
	  // system entropy.  See #189
	  if (node == null || clockseq == null) {
	    var seedBytes = rng();
	    if (node == null) {
	      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	      node = _nodeId = [
	        seedBytes[0] | 0x01,
	        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
	      ];
	    }
	    if (clockseq == null) {
	      // Per 4.2.2, randomize (14 bit) clockseq
	      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
	    }
	  }

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : bytesToUuid_1(b);
	}

	var v1_1 = v1;

	function v4(options, buf, offset) {
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options === 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || bytesToUuid_1(rnds);
	}

	var v4_1 = v4;

	var uuid = v4_1;
	uuid.v1 = v1_1;
	uuid.v4 = v4_1;

	var uuid_1 = uuid;

	var createUserId_1 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const uuid_1$1 = __importDefault(uuid_1);
	function createUserId() {
	    return uuid_1$1.default.v4().replace(/-/ig, '');
	}
	exports.default = createUserId;

	});

	unwrapExports(createUserId_1);

	var config$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CookieName = void 0;
	exports.CookieName = 'uid';

	});

	unwrapExports(config$1);
	var config_1 = config$1.CookieName;

	var getUserId_1 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });

	const createUserId_1$1 = __importDefault(createUserId_1);

	function getUserId(ctx, parseOptions, serializeOptions) {
	    const cookies$1 = cookies.parseCookies(ctx, parseOptions);
	    if (cookies$1[config$1.CookieName] != null)
	        return cookies$1[config$1.CookieName];
	    else {
	        const created = createUserId_1$1.default();
	        cookies.setCookie(ctx, config$1.CookieName, created, serializeOptions);
	        return created;
	    }
	}
	exports.default = getUserId;

	});

	unwrapExports(getUserId_1);

	var impl = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });



	const createEventMessage_1$1 = __importDefault(createEventMessage_1);
	const createIdentifyMessage_1$1 = __importDefault(createIdentifyMessage_1);
	const time_1 = __importDefault(time$1);


	const getUserId_1$1 = __importDefault(getUserId_1);
	const noPlugins = [];
	function ensureSpanId(parentSpanId, m) {
	    return m.type === 'event' && parentSpanId != null ? Object.assign(Object.assign({}, m), { parentSpanId }) : m;
	}
	function ensureUserId(m) {
	    if (typeof window === 'undefined')
	        return m;
	    if (typeof m.context['userId'] !== 'undefined')
	        return m;
	    return Object.assign(Object.assign({}, m), { context: Object.assign(Object.assign({}, m.context), { userId: getUserId_1$1.default() }) });
	}
	function ensureAppId(appId, m) {
	    if (typeof window === 'undefined')
	        return m;
	    if (appId == null)
	        return m;
	    if (typeof m.context['appId'] !== 'undefined')
	        return m;
	    return Object.assign(Object.assign({}, m), { context: Object.assign(Object.assign({}, m.context), { appId: getUserId_1$1.default() }) });
	}
	function ensureName(name, m) {
	    return m.name == null || m.name.length === 0 ? Object.assign(Object.assign({}, m), { name }) : m;
	}
	class Logary {
	    constructor(config) {
	        this.config = config;
	        this._state = 'initial';
	        this._messages = new _esm5.Subject();
	        this._subscription = new _esm5.Subscription(this.stop.bind(this));
	        this._runOnStart = [];
	        this._plugins = [];
	        this.i = [];
	        if (Array.isArray(config.serviceName) && config.serviceName.length === 0) {
	            throw new Error("config.serviceName must be non-empty array, if it gets passed an array");
	        }
	        this.start = this.start.bind(this);
	        this.getLogger = this.getLogger.bind(this);
	        this.getSupporters = this.getSupporters.bind(this);
	        this.register = this.register.bind(this);
	    }
	    start() {
	        if (this._state !== 'initial')
	            throw new Error("Logary started twice");
	        if (this.config.debug)
	            console.log('Logary starting, config=', this.config);
	        this._state = 'started';
	        for (const t of this.config.targets) {
	            if (this.config.debug)
	                console.log('Logary starting Target', t);
	            this._subscription.add(t.run(this.config, this));
	        }
	        for (const r of this._runOnStart) {
	            if (this.config.debug)
	                console.log('Logary starting Runnable', r);
	            this._subscription.add(r.run(this.config, this));
	        }
	        this._runOnStart = [];
	        return this._subscription;
	    }
	    stop() {
	        if (this._state === 'initial')
	            throw new Error("Logary not started yet");
	        if (this.config.debug)
	            console.log('Logary stopping');
	        this._plugins = [];
	        this._state = 'closed';
	    }
	    register(plugin) {
	        if (this._state === 'closed')
	            throw new Error("Logary is closed");
	        if (this.config.debug)
	            console.log('Logary registering Plugin', plugin);
	        this._plugins.push(plugin);
	        if (this._state === 'initial')
	            this._runOnStart.push(plugin);
	        else
	            this._subscription.add(plugin.run(this.config, this));
	    }
	    getSupporters(...features) {
	        let ret = null;
	        for (const p of this._plugins) {
	            for (const f of features) {
	                if (p.supports(f)) {
	                    (ret = ret || []).push(p);
	                    break;
	                }
	            }
	        }
	        return ret || noPlugins;
	    }
	    getTracer() {
	        const hasTracer = this.getSupporters(features.OpenTelemetryHasTracer);
	        return hasTracer.length === 0 ? new src$1.NoopTracer() : hasTracer[0].tracer;
	    }
	    getLogger(...scopeName) {
	        if (scopeName == null)
	            throw new Error('scopeName was null or undefined');
	        const logary = this;
	        return new class LoggerImpl {
	            constructor() {
	                this.name = [...logary.serviceName, ...scopeName];
	                this.verbose = this._loggerEx.bind(this, message.LogLevel.verbose);
	                this.debug = this._loggerEx.bind(this, message.LogLevel.debug);
	                this.info = this._loggerEx.bind(this, message.LogLevel.info);
	                this.warn = this._loggerEx.bind(this, message.LogLevel.warn);
	                this.error = this._loggerEx.bind(this, message.LogLevel.error);
	                this.fatal = this._loggerEx.bind(this, message.LogLevel.fatal);
	                this.event = (...args) => {
	                    const m = createEventMessage_1$1.default(...args);
	                    this.log(message.LogLevel.info, m);
	                };
	                this.setUserProperty = (userId, key, value) => {
	                    const m = new message.SetUserPropertyMessage(userId, key, value, this.name, time_1.default());
	                    this.log(message.LogLevel.info, m);
	                };
	                this.identify = (...args) => {
	                    const m = createIdentifyMessage_1$1.default(null, ...args);
	                    this.log(message.LogLevel.info, m);
	                };
	                this.forgetUser = (...args) => {
	                    const uId = args[0] || getUserId_1$1.default();
	                    this.log(message.LogLevel.info, new message.ForgetUserMessage(uId));
	                };
	            }
	            ensureName(m) {
	                return ensureName(this.name, m);
	            }
	            log(level, ...messages) {
	                var _a;
	                if (level < logary.minLevel)
	                    return;
	                if (messages == null || messages.length === 0)
	                    return;
	                const parentSpanId = (_a = this.getCurrentSpan()) === null || _a === void 0 ? void 0 : _a.context().spanId;
	                for (const message of messages.map(m => ensureAppId(logary.config.appId, utils.ensureMessageId(ensureUserId(ensureSpanId(parentSpanId, this.ensureName(m))))))) {
	                    logary._messages.next(message);
	                }
	            }
	            _loggerEx(level, message, ...args) {
	                this.log(level, utils.adaptLogFunction(level, message, ...args));
	            }
	            getCurrentSpan() {
	                return logary.getTracer().getCurrentSpan();
	            }
	            withSpan(span, fn) {
	                return logary.getTracer().withSpan(span, fn);
	            }
	            bind(target, context) {
	                return logary.getTracer().bind(target, context);
	            }
	            startSpan(name, options, context) {
	                return logary.getTracer().startSpan(name, options, context);
	            }
	        };
	    }
	    set(key, value) {
	        if (key == null || value == null)
	            return;
	        if (this.config.debug)
	            console.log('(:Logary).set', key, value);
	        this.config = Object.assign(Object.assign({}, this.config), { [key]: value });
	    }
	    reconfigure() {
	        if (this.i == null || this.i.length == 0)
	            return;
	        for (let k = 0; k < this.i.length; k++) {
	            this.set(this.i[k][0], this.i[k][1]);
	        }
	        this.i = [];
	    }
	    get messages() {
	        if (this._state !== 'started')
	            return _esm5.empty();
	        return this._messages.asObservable();
	    }
	    get serviceName() {
	        return Array.isArray(this.config.serviceName)
	            ? this.config.serviceName
	            : [this.config.serviceName];
	    }
	    get serviceVersion() {
	        return this.config.serviceVersion;
	    }
	    get targets() {
	        return this.config.targets;
	    }
	    get minLevel() {
	        return this.config.minLevel;
	    }
	    get debug() {
	        return this.config.debug;
	    }
	    get appId() {
	        return this.config.appId;
	    }
	    get state() {
	        return this._state;
	    }
	}
	exports.default = Logary;

	});

	unwrapExports(impl);

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function audit(durationSelector) {
	    return function auditOperatorFunction(source) {
	        return source.lift(new AuditOperator(durationSelector));
	    };
	}
	var AuditOperator = /*@__PURE__*/ (function () {
	    function AuditOperator(durationSelector) {
	        this.durationSelector = durationSelector;
	    }
	    AuditOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new AuditSubscriber(subscriber, this.durationSelector));
	    };
	    return AuditOperator;
	}());
	var AuditSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(AuditSubscriber, _super);
	    function AuditSubscriber(destination, durationSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.durationSelector = durationSelector;
	        _this.hasValue = false;
	        return _this;
	    }
	    AuditSubscriber.prototype._next = function (value) {
	        this.value = value;
	        this.hasValue = true;
	        if (!this.throttled) {
	            var duration = void 0;
	            try {
	                var durationSelector = this.durationSelector;
	                duration = durationSelector(value);
	            }
	            catch (err) {
	                return this.destination.error(err);
	            }
	            var innerSubscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
	            if (!innerSubscription || innerSubscription.closed) {
	                this.clearThrottle();
	            }
	            else {
	                this.add(this.throttled = innerSubscription);
	            }
	        }
	    };
	    AuditSubscriber.prototype.clearThrottle = function () {
	        var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
	        if (throttled) {
	            this.remove(throttled);
	            this.throttled = undefined;
	            throttled.unsubscribe();
	        }
	        if (hasValue) {
	            this.value = undefined;
	            this.hasValue = false;
	            this.destination.next(value);
	        }
	    };
	    AuditSubscriber.prototype.notifyNext = function () {
	        this.clearThrottle();
	    };
	    AuditSubscriber.prototype.notifyComplete = function () {
	        this.clearThrottle();
	    };
	    return AuditSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START _scheduler_async,_audit,_observable_timer PURE_IMPORTS_END */
	function auditTime(duration, scheduler) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    return audit(function () { return timer(duration, scheduler); });
	}

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function buffer(closingNotifier) {
	    return function bufferOperatorFunction(source) {
	        return source.lift(new BufferOperator(closingNotifier));
	    };
	}
	var BufferOperator = /*@__PURE__*/ (function () {
	    function BufferOperator(closingNotifier) {
	        this.closingNotifier = closingNotifier;
	    }
	    BufferOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new BufferSubscriber(subscriber, this.closingNotifier));
	    };
	    return BufferOperator;
	}());
	var BufferSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(BufferSubscriber, _super);
	    function BufferSubscriber(destination, closingNotifier) {
	        var _this = _super.call(this, destination) || this;
	        _this.buffer = [];
	        _this.add(innerSubscribe(closingNotifier, new SimpleInnerSubscriber(_this)));
	        return _this;
	    }
	    BufferSubscriber.prototype._next = function (value) {
	        this.buffer.push(value);
	    };
	    BufferSubscriber.prototype.notifyNext = function () {
	        var buffer = this.buffer;
	        this.buffer = [];
	        this.destination.next(buffer);
	    };
	    return BufferSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function bufferCount(bufferSize, startBufferEvery) {
	    if (startBufferEvery === void 0) {
	        startBufferEvery = null;
	    }
	    return function bufferCountOperatorFunction(source) {
	        return source.lift(new BufferCountOperator(bufferSize, startBufferEvery));
	    };
	}
	var BufferCountOperator = /*@__PURE__*/ (function () {
	    function BufferCountOperator(bufferSize, startBufferEvery) {
	        this.bufferSize = bufferSize;
	        this.startBufferEvery = startBufferEvery;
	        if (!startBufferEvery || bufferSize === startBufferEvery) {
	            this.subscriberClass = BufferCountSubscriber;
	        }
	        else {
	            this.subscriberClass = BufferSkipCountSubscriber;
	        }
	    }
	    BufferCountOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new this.subscriberClass(subscriber, this.bufferSize, this.startBufferEvery));
	    };
	    return BufferCountOperator;
	}());
	var BufferCountSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(BufferCountSubscriber, _super);
	    function BufferCountSubscriber(destination, bufferSize) {
	        var _this = _super.call(this, destination) || this;
	        _this.bufferSize = bufferSize;
	        _this.buffer = [];
	        return _this;
	    }
	    BufferCountSubscriber.prototype._next = function (value) {
	        var buffer = this.buffer;
	        buffer.push(value);
	        if (buffer.length == this.bufferSize) {
	            this.destination.next(buffer);
	            this.buffer = [];
	        }
	    };
	    BufferCountSubscriber.prototype._complete = function () {
	        var buffer = this.buffer;
	        if (buffer.length > 0) {
	            this.destination.next(buffer);
	        }
	        _super.prototype._complete.call(this);
	    };
	    return BufferCountSubscriber;
	}(Subscriber));
	var BufferSkipCountSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(BufferSkipCountSubscriber, _super);
	    function BufferSkipCountSubscriber(destination, bufferSize, startBufferEvery) {
	        var _this = _super.call(this, destination) || this;
	        _this.bufferSize = bufferSize;
	        _this.startBufferEvery = startBufferEvery;
	        _this.buffers = [];
	        _this.count = 0;
	        return _this;
	    }
	    BufferSkipCountSubscriber.prototype._next = function (value) {
	        var _a = this, bufferSize = _a.bufferSize, startBufferEvery = _a.startBufferEvery, buffers = _a.buffers, count = _a.count;
	        this.count++;
	        if (count % startBufferEvery === 0) {
	            buffers.push([]);
	        }
	        for (var i = buffers.length; i--;) {
	            var buffer = buffers[i];
	            buffer.push(value);
	            if (buffer.length === bufferSize) {
	                buffers.splice(i, 1);
	                this.destination.next(buffer);
	            }
	        }
	    };
	    BufferSkipCountSubscriber.prototype._complete = function () {
	        var _a = this, buffers = _a.buffers, destination = _a.destination;
	        while (buffers.length > 0) {
	            var buffer = buffers.shift();
	            if (buffer.length > 0) {
	                destination.next(buffer);
	            }
	        }
	        _super.prototype._complete.call(this);
	    };
	    return BufferSkipCountSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_scheduler_async,_Subscriber,_util_isScheduler PURE_IMPORTS_END */
	function bufferTime(bufferTimeSpan) {
	    var length = arguments.length;
	    var scheduler = async;
	    if (isScheduler(arguments[arguments.length - 1])) {
	        scheduler = arguments[arguments.length - 1];
	        length--;
	    }
	    var bufferCreationInterval = null;
	    if (length >= 2) {
	        bufferCreationInterval = arguments[1];
	    }
	    var maxBufferSize = Number.POSITIVE_INFINITY;
	    if (length >= 3) {
	        maxBufferSize = arguments[2];
	    }
	    return function bufferTimeOperatorFunction(source) {
	        return source.lift(new BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler));
	    };
	}
	var BufferTimeOperator = /*@__PURE__*/ (function () {
	    function BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
	        this.bufferTimeSpan = bufferTimeSpan;
	        this.bufferCreationInterval = bufferCreationInterval;
	        this.maxBufferSize = maxBufferSize;
	        this.scheduler = scheduler;
	    }
	    BufferTimeOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new BufferTimeSubscriber(subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.maxBufferSize, this.scheduler));
	    };
	    return BufferTimeOperator;
	}());
	var Context = /*@__PURE__*/ (function () {
	    function Context() {
	        this.buffer = [];
	    }
	    return Context;
	}());
	var BufferTimeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(BufferTimeSubscriber, _super);
	    function BufferTimeSubscriber(destination, bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
	        var _this = _super.call(this, destination) || this;
	        _this.bufferTimeSpan = bufferTimeSpan;
	        _this.bufferCreationInterval = bufferCreationInterval;
	        _this.maxBufferSize = maxBufferSize;
	        _this.scheduler = scheduler;
	        _this.contexts = [];
	        var context = _this.openContext();
	        _this.timespanOnly = bufferCreationInterval == null || bufferCreationInterval < 0;
	        if (_this.timespanOnly) {
	            var timeSpanOnlyState = { subscriber: _this, context: context, bufferTimeSpan: bufferTimeSpan };
	            _this.add(context.closeAction = scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
	        }
	        else {
	            var closeState = { subscriber: _this, context: context };
	            var creationState = { bufferTimeSpan: bufferTimeSpan, bufferCreationInterval: bufferCreationInterval, subscriber: _this, scheduler: scheduler };
	            _this.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
	            _this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
	        }
	        return _this;
	    }
	    BufferTimeSubscriber.prototype._next = function (value) {
	        var contexts = this.contexts;
	        var len = contexts.length;
	        var filledBufferContext;
	        for (var i = 0; i < len; i++) {
	            var context_1 = contexts[i];
	            var buffer = context_1.buffer;
	            buffer.push(value);
	            if (buffer.length == this.maxBufferSize) {
	                filledBufferContext = context_1;
	            }
	        }
	        if (filledBufferContext) {
	            this.onBufferFull(filledBufferContext);
	        }
	    };
	    BufferTimeSubscriber.prototype._error = function (err) {
	        this.contexts.length = 0;
	        _super.prototype._error.call(this, err);
	    };
	    BufferTimeSubscriber.prototype._complete = function () {
	        var _a = this, contexts = _a.contexts, destination = _a.destination;
	        while (contexts.length > 0) {
	            var context_2 = contexts.shift();
	            destination.next(context_2.buffer);
	        }
	        _super.prototype._complete.call(this);
	    };
	    BufferTimeSubscriber.prototype._unsubscribe = function () {
	        this.contexts = null;
	    };
	    BufferTimeSubscriber.prototype.onBufferFull = function (context) {
	        this.closeContext(context);
	        var closeAction = context.closeAction;
	        closeAction.unsubscribe();
	        this.remove(closeAction);
	        if (!this.closed && this.timespanOnly) {
	            context = this.openContext();
	            var bufferTimeSpan = this.bufferTimeSpan;
	            var timeSpanOnlyState = { subscriber: this, context: context, bufferTimeSpan: bufferTimeSpan };
	            this.add(context.closeAction = this.scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
	        }
	    };
	    BufferTimeSubscriber.prototype.openContext = function () {
	        var context = new Context();
	        this.contexts.push(context);
	        return context;
	    };
	    BufferTimeSubscriber.prototype.closeContext = function (context) {
	        this.destination.next(context.buffer);
	        var contexts = this.contexts;
	        var spliceIndex = contexts ? contexts.indexOf(context) : -1;
	        if (spliceIndex >= 0) {
	            contexts.splice(contexts.indexOf(context), 1);
	        }
	    };
	    return BufferTimeSubscriber;
	}(Subscriber));
	function dispatchBufferTimeSpanOnly(state) {
	    var subscriber = state.subscriber;
	    var prevContext = state.context;
	    if (prevContext) {
	        subscriber.closeContext(prevContext);
	    }
	    if (!subscriber.closed) {
	        state.context = subscriber.openContext();
	        state.context.closeAction = this.schedule(state, state.bufferTimeSpan);
	    }
	}
	function dispatchBufferCreation(state) {
	    var bufferCreationInterval = state.bufferCreationInterval, bufferTimeSpan = state.bufferTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler;
	    var context = subscriber.openContext();
	    var action = this;
	    if (!subscriber.closed) {
	        subscriber.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber: subscriber, context: context }));
	        action.schedule(state, bufferCreationInterval);
	    }
	}
	function dispatchBufferClose(arg) {
	    var subscriber = arg.subscriber, context = arg.context;
	    subscriber.closeContext(context);
	}

	/** PURE_IMPORTS_START tslib,_Subscription,_util_subscribeToResult,_OuterSubscriber PURE_IMPORTS_END */
	function bufferToggle(openings, closingSelector) {
	    return function bufferToggleOperatorFunction(source) {
	        return source.lift(new BufferToggleOperator(openings, closingSelector));
	    };
	}
	var BufferToggleOperator = /*@__PURE__*/ (function () {
	    function BufferToggleOperator(openings, closingSelector) {
	        this.openings = openings;
	        this.closingSelector = closingSelector;
	    }
	    BufferToggleOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new BufferToggleSubscriber(subscriber, this.openings, this.closingSelector));
	    };
	    return BufferToggleOperator;
	}());
	var BufferToggleSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(BufferToggleSubscriber, _super);
	    function BufferToggleSubscriber(destination, openings, closingSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.closingSelector = closingSelector;
	        _this.contexts = [];
	        _this.add(subscribeToResult(_this, openings));
	        return _this;
	    }
	    BufferToggleSubscriber.prototype._next = function (value) {
	        var contexts = this.contexts;
	        var len = contexts.length;
	        for (var i = 0; i < len; i++) {
	            contexts[i].buffer.push(value);
	        }
	    };
	    BufferToggleSubscriber.prototype._error = function (err) {
	        var contexts = this.contexts;
	        while (contexts.length > 0) {
	            var context_1 = contexts.shift();
	            context_1.subscription.unsubscribe();
	            context_1.buffer = null;
	            context_1.subscription = null;
	        }
	        this.contexts = null;
	        _super.prototype._error.call(this, err);
	    };
	    BufferToggleSubscriber.prototype._complete = function () {
	        var contexts = this.contexts;
	        while (contexts.length > 0) {
	            var context_2 = contexts.shift();
	            this.destination.next(context_2.buffer);
	            context_2.subscription.unsubscribe();
	            context_2.buffer = null;
	            context_2.subscription = null;
	        }
	        this.contexts = null;
	        _super.prototype._complete.call(this);
	    };
	    BufferToggleSubscriber.prototype.notifyNext = function (outerValue, innerValue) {
	        outerValue ? this.closeBuffer(outerValue) : this.openBuffer(innerValue);
	    };
	    BufferToggleSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.closeBuffer(innerSub.context);
	    };
	    BufferToggleSubscriber.prototype.openBuffer = function (value) {
	        try {
	            var closingSelector = this.closingSelector;
	            var closingNotifier = closingSelector.call(this, value);
	            if (closingNotifier) {
	                this.trySubscribe(closingNotifier);
	            }
	        }
	        catch (err) {
	            this._error(err);
	        }
	    };
	    BufferToggleSubscriber.prototype.closeBuffer = function (context) {
	        var contexts = this.contexts;
	        if (contexts && context) {
	            var buffer = context.buffer, subscription = context.subscription;
	            this.destination.next(buffer);
	            contexts.splice(contexts.indexOf(context), 1);
	            this.remove(subscription);
	            subscription.unsubscribe();
	        }
	    };
	    BufferToggleSubscriber.prototype.trySubscribe = function (closingNotifier) {
	        var contexts = this.contexts;
	        var buffer = [];
	        var subscription = new Subscription();
	        var context = { buffer: buffer, subscription: subscription };
	        contexts.push(context);
	        var innerSubscription = subscribeToResult(this, closingNotifier, context);
	        if (!innerSubscription || innerSubscription.closed) {
	            this.closeBuffer(context);
	        }
	        else {
	            innerSubscription.context = context;
	            this.add(innerSubscription);
	            subscription.add(innerSubscription);
	        }
	    };
	    return BufferToggleSubscriber;
	}(OuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscription,_innerSubscribe PURE_IMPORTS_END */
	function bufferWhen(closingSelector) {
	    return function (source) {
	        return source.lift(new BufferWhenOperator(closingSelector));
	    };
	}
	var BufferWhenOperator = /*@__PURE__*/ (function () {
	    function BufferWhenOperator(closingSelector) {
	        this.closingSelector = closingSelector;
	    }
	    BufferWhenOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new BufferWhenSubscriber(subscriber, this.closingSelector));
	    };
	    return BufferWhenOperator;
	}());
	var BufferWhenSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(BufferWhenSubscriber, _super);
	    function BufferWhenSubscriber(destination, closingSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.closingSelector = closingSelector;
	        _this.subscribing = false;
	        _this.openBuffer();
	        return _this;
	    }
	    BufferWhenSubscriber.prototype._next = function (value) {
	        this.buffer.push(value);
	    };
	    BufferWhenSubscriber.prototype._complete = function () {
	        var buffer = this.buffer;
	        if (buffer) {
	            this.destination.next(buffer);
	        }
	        _super.prototype._complete.call(this);
	    };
	    BufferWhenSubscriber.prototype._unsubscribe = function () {
	        this.buffer = undefined;
	        this.subscribing = false;
	    };
	    BufferWhenSubscriber.prototype.notifyNext = function () {
	        this.openBuffer();
	    };
	    BufferWhenSubscriber.prototype.notifyComplete = function () {
	        if (this.subscribing) {
	            this.complete();
	        }
	        else {
	            this.openBuffer();
	        }
	    };
	    BufferWhenSubscriber.prototype.openBuffer = function () {
	        var closingSubscription = this.closingSubscription;
	        if (closingSubscription) {
	            this.remove(closingSubscription);
	            closingSubscription.unsubscribe();
	        }
	        var buffer = this.buffer;
	        if (this.buffer) {
	            this.destination.next(buffer);
	        }
	        this.buffer = [];
	        var closingNotifier;
	        try {
	            var closingSelector = this.closingSelector;
	            closingNotifier = closingSelector();
	        }
	        catch (err) {
	            return this.error(err);
	        }
	        closingSubscription = new Subscription();
	        this.closingSubscription = closingSubscription;
	        this.add(closingSubscription);
	        this.subscribing = true;
	        closingSubscription.add(innerSubscribe(closingNotifier, new SimpleInnerSubscriber(this)));
	        this.subscribing = false;
	    };
	    return BufferWhenSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function catchError(selector) {
	    return function catchErrorOperatorFunction(source) {
	        var operator = new CatchOperator(selector);
	        var caught = source.lift(operator);
	        return (operator.caught = caught);
	    };
	}
	var CatchOperator = /*@__PURE__*/ (function () {
	    function CatchOperator(selector) {
	        this.selector = selector;
	    }
	    CatchOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
	    };
	    return CatchOperator;
	}());
	var CatchSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(CatchSubscriber, _super);
	    function CatchSubscriber(destination, selector, caught) {
	        var _this = _super.call(this, destination) || this;
	        _this.selector = selector;
	        _this.caught = caught;
	        return _this;
	    }
	    CatchSubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var result = void 0;
	            try {
	                result = this.selector(err, this.caught);
	            }
	            catch (err2) {
	                _super.prototype.error.call(this, err2);
	                return;
	            }
	            this._unsubscribeAndRecycle();
	            var innerSubscriber = new SimpleInnerSubscriber(this);
	            this.add(innerSubscriber);
	            var innerSubscription = innerSubscribe(result, innerSubscriber);
	            if (innerSubscription !== innerSubscriber) {
	                this.add(innerSubscription);
	            }
	        }
	    };
	    return CatchSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START _observable_combineLatest PURE_IMPORTS_END */
	function combineAll(project) {
	    return function (source) { return source.lift(new CombineLatestOperator(project)); };
	}

	/** PURE_IMPORTS_START _util_isArray,_observable_combineLatest,_observable_from PURE_IMPORTS_END */
	function combineLatest$1() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    var project = null;
	    if (typeof observables[observables.length - 1] === 'function') {
	        project = observables.pop();
	    }
	    if (observables.length === 1 && isArray(observables[0])) {
	        observables = observables[0].slice();
	    }
	    return function (source) { return source.lift.call(from([source].concat(observables)), new CombineLatestOperator(project)); };
	}

	/** PURE_IMPORTS_START _observable_concat PURE_IMPORTS_END */
	function concat$1() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    return function (source) { return source.lift.call(concat.apply(void 0, [source].concat(observables))); };
	}

	/** PURE_IMPORTS_START _mergeMap PURE_IMPORTS_END */
	function concatMap(project, resultSelector) {
	    return mergeMap(project, resultSelector, 1);
	}

	/** PURE_IMPORTS_START _concatMap PURE_IMPORTS_END */
	function concatMapTo(innerObservable, resultSelector) {
	    return concatMap(function () { return innerObservable; }, resultSelector);
	}

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function count(predicate) {
	    return function (source) { return source.lift(new CountOperator(predicate, source)); };
	}
	var CountOperator = /*@__PURE__*/ (function () {
	    function CountOperator(predicate, source) {
	        this.predicate = predicate;
	        this.source = source;
	    }
	    CountOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new CountSubscriber(subscriber, this.predicate, this.source));
	    };
	    return CountOperator;
	}());
	var CountSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(CountSubscriber, _super);
	    function CountSubscriber(destination, predicate, source) {
	        var _this = _super.call(this, destination) || this;
	        _this.predicate = predicate;
	        _this.source = source;
	        _this.count = 0;
	        _this.index = 0;
	        return _this;
	    }
	    CountSubscriber.prototype._next = function (value) {
	        if (this.predicate) {
	            this._tryPredicate(value);
	        }
	        else {
	            this.count++;
	        }
	    };
	    CountSubscriber.prototype._tryPredicate = function (value) {
	        var result;
	        try {
	            result = this.predicate(value, this.index++, this.source);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (result) {
	            this.count++;
	        }
	    };
	    CountSubscriber.prototype._complete = function () {
	        this.destination.next(this.count);
	        this.destination.complete();
	    };
	    return CountSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function debounce(durationSelector) {
	    return function (source) { return source.lift(new DebounceOperator(durationSelector)); };
	}
	var DebounceOperator = /*@__PURE__*/ (function () {
	    function DebounceOperator(durationSelector) {
	        this.durationSelector = durationSelector;
	    }
	    DebounceOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new DebounceSubscriber(subscriber, this.durationSelector));
	    };
	    return DebounceOperator;
	}());
	var DebounceSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(DebounceSubscriber, _super);
	    function DebounceSubscriber(destination, durationSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.durationSelector = durationSelector;
	        _this.hasValue = false;
	        return _this;
	    }
	    DebounceSubscriber.prototype._next = function (value) {
	        try {
	            var result = this.durationSelector.call(this, value);
	            if (result) {
	                this._tryNext(value, result);
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    DebounceSubscriber.prototype._complete = function () {
	        this.emitValue();
	        this.destination.complete();
	    };
	    DebounceSubscriber.prototype._tryNext = function (value, duration) {
	        var subscription = this.durationSubscription;
	        this.value = value;
	        this.hasValue = true;
	        if (subscription) {
	            subscription.unsubscribe();
	            this.remove(subscription);
	        }
	        subscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
	        if (subscription && !subscription.closed) {
	            this.add(this.durationSubscription = subscription);
	        }
	    };
	    DebounceSubscriber.prototype.notifyNext = function () {
	        this.emitValue();
	    };
	    DebounceSubscriber.prototype.notifyComplete = function () {
	        this.emitValue();
	    };
	    DebounceSubscriber.prototype.emitValue = function () {
	        if (this.hasValue) {
	            var value = this.value;
	            var subscription = this.durationSubscription;
	            if (subscription) {
	                this.durationSubscription = undefined;
	                subscription.unsubscribe();
	                this.remove(subscription);
	            }
	            this.value = undefined;
	            this.hasValue = false;
	            _super.prototype._next.call(this, value);
	        }
	    };
	    return DebounceSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */
	function debounceTime(dueTime, scheduler) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    return function (source) { return source.lift(new DebounceTimeOperator(dueTime, scheduler)); };
	}
	var DebounceTimeOperator = /*@__PURE__*/ (function () {
	    function DebounceTimeOperator(dueTime, scheduler) {
	        this.dueTime = dueTime;
	        this.scheduler = scheduler;
	    }
	    DebounceTimeOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
	    };
	    return DebounceTimeOperator;
	}());
	var DebounceTimeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(DebounceTimeSubscriber, _super);
	    function DebounceTimeSubscriber(destination, dueTime, scheduler) {
	        var _this = _super.call(this, destination) || this;
	        _this.dueTime = dueTime;
	        _this.scheduler = scheduler;
	        _this.debouncedSubscription = null;
	        _this.lastValue = null;
	        _this.hasValue = false;
	        return _this;
	    }
	    DebounceTimeSubscriber.prototype._next = function (value) {
	        this.clearDebounce();
	        this.lastValue = value;
	        this.hasValue = true;
	        this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext$2, this.dueTime, this));
	    };
	    DebounceTimeSubscriber.prototype._complete = function () {
	        this.debouncedNext();
	        this.destination.complete();
	    };
	    DebounceTimeSubscriber.prototype.debouncedNext = function () {
	        this.clearDebounce();
	        if (this.hasValue) {
	            var lastValue = this.lastValue;
	            this.lastValue = null;
	            this.hasValue = false;
	            this.destination.next(lastValue);
	        }
	    };
	    DebounceTimeSubscriber.prototype.clearDebounce = function () {
	        var debouncedSubscription = this.debouncedSubscription;
	        if (debouncedSubscription !== null) {
	            this.remove(debouncedSubscription);
	            debouncedSubscription.unsubscribe();
	            this.debouncedSubscription = null;
	        }
	    };
	    return DebounceTimeSubscriber;
	}(Subscriber));
	function dispatchNext$2(subscriber) {
	    subscriber.debouncedNext();
	}

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function defaultIfEmpty(defaultValue) {
	    if (defaultValue === void 0) {
	        defaultValue = null;
	    }
	    return function (source) { return source.lift(new DefaultIfEmptyOperator(defaultValue)); };
	}
	var DefaultIfEmptyOperator = /*@__PURE__*/ (function () {
	    function DefaultIfEmptyOperator(defaultValue) {
	        this.defaultValue = defaultValue;
	    }
	    DefaultIfEmptyOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
	    };
	    return DefaultIfEmptyOperator;
	}());
	var DefaultIfEmptySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(DefaultIfEmptySubscriber, _super);
	    function DefaultIfEmptySubscriber(destination, defaultValue) {
	        var _this = _super.call(this, destination) || this;
	        _this.defaultValue = defaultValue;
	        _this.isEmpty = true;
	        return _this;
	    }
	    DefaultIfEmptySubscriber.prototype._next = function (value) {
	        this.isEmpty = false;
	        this.destination.next(value);
	    };
	    DefaultIfEmptySubscriber.prototype._complete = function () {
	        if (this.isEmpty) {
	            this.destination.next(this.defaultValue);
	        }
	        this.destination.complete();
	    };
	    return DefaultIfEmptySubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */
	function isDate(value) {
	    return value instanceof Date && !isNaN(+value);
	}

	/** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_Subscriber,_Notification PURE_IMPORTS_END */
	function delay(delay, scheduler) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    var absoluteDelay = isDate(delay);
	    var delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(delay);
	    return function (source) { return source.lift(new DelayOperator(delayFor, scheduler)); };
	}
	var DelayOperator = /*@__PURE__*/ (function () {
	    function DelayOperator(delay, scheduler) {
	        this.delay = delay;
	        this.scheduler = scheduler;
	    }
	    DelayOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
	    };
	    return DelayOperator;
	}());
	var DelaySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(DelaySubscriber, _super);
	    function DelaySubscriber(destination, delay, scheduler) {
	        var _this = _super.call(this, destination) || this;
	        _this.delay = delay;
	        _this.scheduler = scheduler;
	        _this.queue = [];
	        _this.active = false;
	        _this.errored = false;
	        return _this;
	    }
	    DelaySubscriber.dispatch = function (state) {
	        var source = state.source;
	        var queue = source.queue;
	        var scheduler = state.scheduler;
	        var destination = state.destination;
	        while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
	            queue.shift().notification.observe(destination);
	        }
	        if (queue.length > 0) {
	            var delay_1 = Math.max(0, queue[0].time - scheduler.now());
	            this.schedule(state, delay_1);
	        }
	        else {
	            this.unsubscribe();
	            source.active = false;
	        }
	    };
	    DelaySubscriber.prototype._schedule = function (scheduler) {
	        this.active = true;
	        var destination = this.destination;
	        destination.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {
	            source: this, destination: this.destination, scheduler: scheduler
	        }));
	    };
	    DelaySubscriber.prototype.scheduleNotification = function (notification) {
	        if (this.errored === true) {
	            return;
	        }
	        var scheduler = this.scheduler;
	        var message = new DelayMessage(scheduler.now() + this.delay, notification);
	        this.queue.push(message);
	        if (this.active === false) {
	            this._schedule(scheduler);
	        }
	    };
	    DelaySubscriber.prototype._next = function (value) {
	        this.scheduleNotification(Notification.createNext(value));
	    };
	    DelaySubscriber.prototype._error = function (err) {
	        this.errored = true;
	        this.queue = [];
	        this.destination.error(err);
	        this.unsubscribe();
	    };
	    DelaySubscriber.prototype._complete = function () {
	        this.scheduleNotification(Notification.createComplete());
	        this.unsubscribe();
	    };
	    return DelaySubscriber;
	}(Subscriber));
	var DelayMessage = /*@__PURE__*/ (function () {
	    function DelayMessage(time, notification) {
	        this.time = time;
	        this.notification = notification;
	    }
	    return DelayMessage;
	}());

	/** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */
	function delayWhen(delayDurationSelector, subscriptionDelay) {
	    if (subscriptionDelay) {
	        return function (source) {
	            return new SubscriptionDelayObservable(source, subscriptionDelay)
	                .lift(new DelayWhenOperator(delayDurationSelector));
	        };
	    }
	    return function (source) { return source.lift(new DelayWhenOperator(delayDurationSelector)); };
	}
	var DelayWhenOperator = /*@__PURE__*/ (function () {
	    function DelayWhenOperator(delayDurationSelector) {
	        this.delayDurationSelector = delayDurationSelector;
	    }
	    DelayWhenOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new DelayWhenSubscriber(subscriber, this.delayDurationSelector));
	    };
	    return DelayWhenOperator;
	}());
	var DelayWhenSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(DelayWhenSubscriber, _super);
	    function DelayWhenSubscriber(destination, delayDurationSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.delayDurationSelector = delayDurationSelector;
	        _this.completed = false;
	        _this.delayNotifierSubscriptions = [];
	        _this.index = 0;
	        return _this;
	    }
	    DelayWhenSubscriber.prototype.notifyNext = function (outerValue, _innerValue, _outerIndex, _innerIndex, innerSub) {
	        this.destination.next(outerValue);
	        this.removeSubscription(innerSub);
	        this.tryComplete();
	    };
	    DelayWhenSubscriber.prototype.notifyError = function (error, innerSub) {
	        this._error(error);
	    };
	    DelayWhenSubscriber.prototype.notifyComplete = function (innerSub) {
	        var value = this.removeSubscription(innerSub);
	        if (value) {
	            this.destination.next(value);
	        }
	        this.tryComplete();
	    };
	    DelayWhenSubscriber.prototype._next = function (value) {
	        var index = this.index++;
	        try {
	            var delayNotifier = this.delayDurationSelector(value, index);
	            if (delayNotifier) {
	                this.tryDelay(delayNotifier, value);
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    DelayWhenSubscriber.prototype._complete = function () {
	        this.completed = true;
	        this.tryComplete();
	        this.unsubscribe();
	    };
	    DelayWhenSubscriber.prototype.removeSubscription = function (subscription) {
	        subscription.unsubscribe();
	        var subscriptionIdx = this.delayNotifierSubscriptions.indexOf(subscription);
	        if (subscriptionIdx !== -1) {
	            this.delayNotifierSubscriptions.splice(subscriptionIdx, 1);
	        }
	        return subscription.outerValue;
	    };
	    DelayWhenSubscriber.prototype.tryDelay = function (delayNotifier, value) {
	        var notifierSubscription = subscribeToResult(this, delayNotifier, value);
	        if (notifierSubscription && !notifierSubscription.closed) {
	            var destination = this.destination;
	            destination.add(notifierSubscription);
	            this.delayNotifierSubscriptions.push(notifierSubscription);
	        }
	    };
	    DelayWhenSubscriber.prototype.tryComplete = function () {
	        if (this.completed && this.delayNotifierSubscriptions.length === 0) {
	            this.destination.complete();
	        }
	    };
	    return DelayWhenSubscriber;
	}(OuterSubscriber));
	var SubscriptionDelayObservable = /*@__PURE__*/ (function (_super) {
	    __extends(SubscriptionDelayObservable, _super);
	    function SubscriptionDelayObservable(source, subscriptionDelay) {
	        var _this = _super.call(this) || this;
	        _this.source = source;
	        _this.subscriptionDelay = subscriptionDelay;
	        return _this;
	    }
	    SubscriptionDelayObservable.prototype._subscribe = function (subscriber) {
	        this.subscriptionDelay.subscribe(new SubscriptionDelaySubscriber(subscriber, this.source));
	    };
	    return SubscriptionDelayObservable;
	}(Observable));
	var SubscriptionDelaySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SubscriptionDelaySubscriber, _super);
	    function SubscriptionDelaySubscriber(parent, source) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        _this.source = source;
	        _this.sourceSubscribed = false;
	        return _this;
	    }
	    SubscriptionDelaySubscriber.prototype._next = function (unused) {
	        this.subscribeToSource();
	    };
	    SubscriptionDelaySubscriber.prototype._error = function (err) {
	        this.unsubscribe();
	        this.parent.error(err);
	    };
	    SubscriptionDelaySubscriber.prototype._complete = function () {
	        this.unsubscribe();
	        this.subscribeToSource();
	    };
	    SubscriptionDelaySubscriber.prototype.subscribeToSource = function () {
	        if (!this.sourceSubscribed) {
	            this.sourceSubscribed = true;
	            this.unsubscribe();
	            this.source.subscribe(this.parent);
	        }
	    };
	    return SubscriptionDelaySubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function dematerialize() {
	    return function dematerializeOperatorFunction(source) {
	        return source.lift(new DeMaterializeOperator());
	    };
	}
	var DeMaterializeOperator = /*@__PURE__*/ (function () {
	    function DeMaterializeOperator() {
	    }
	    DeMaterializeOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new DeMaterializeSubscriber(subscriber));
	    };
	    return DeMaterializeOperator;
	}());
	var DeMaterializeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(DeMaterializeSubscriber, _super);
	    function DeMaterializeSubscriber(destination) {
	        return _super.call(this, destination) || this;
	    }
	    DeMaterializeSubscriber.prototype._next = function (value) {
	        value.observe(this.destination);
	    };
	    return DeMaterializeSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function distinct(keySelector, flushes) {
	    return function (source) { return source.lift(new DistinctOperator(keySelector, flushes)); };
	}
	var DistinctOperator = /*@__PURE__*/ (function () {
	    function DistinctOperator(keySelector, flushes) {
	        this.keySelector = keySelector;
	        this.flushes = flushes;
	    }
	    DistinctOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new DistinctSubscriber(subscriber, this.keySelector, this.flushes));
	    };
	    return DistinctOperator;
	}());
	var DistinctSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(DistinctSubscriber, _super);
	    function DistinctSubscriber(destination, keySelector, flushes) {
	        var _this = _super.call(this, destination) || this;
	        _this.keySelector = keySelector;
	        _this.values = new Set();
	        if (flushes) {
	            _this.add(innerSubscribe(flushes, new SimpleInnerSubscriber(_this)));
	        }
	        return _this;
	    }
	    DistinctSubscriber.prototype.notifyNext = function () {
	        this.values.clear();
	    };
	    DistinctSubscriber.prototype.notifyError = function (error) {
	        this._error(error);
	    };
	    DistinctSubscriber.prototype._next = function (value) {
	        if (this.keySelector) {
	            this._useKeySelector(value);
	        }
	        else {
	            this._finalizeNext(value, value);
	        }
	    };
	    DistinctSubscriber.prototype._useKeySelector = function (value) {
	        var key;
	        var destination = this.destination;
	        try {
	            key = this.keySelector(value);
	        }
	        catch (err) {
	            destination.error(err);
	            return;
	        }
	        this._finalizeNext(key, value);
	    };
	    DistinctSubscriber.prototype._finalizeNext = function (key, value) {
	        var values = this.values;
	        if (!values.has(key)) {
	            values.add(key);
	            this.destination.next(value);
	        }
	    };
	    return DistinctSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function distinctUntilChanged(compare, keySelector) {
	    return function (source) { return source.lift(new DistinctUntilChangedOperator(compare, keySelector)); };
	}
	var DistinctUntilChangedOperator = /*@__PURE__*/ (function () {
	    function DistinctUntilChangedOperator(compare, keySelector) {
	        this.compare = compare;
	        this.keySelector = keySelector;
	    }
	    DistinctUntilChangedOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
	    };
	    return DistinctUntilChangedOperator;
	}());
	var DistinctUntilChangedSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(DistinctUntilChangedSubscriber, _super);
	    function DistinctUntilChangedSubscriber(destination, compare, keySelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.keySelector = keySelector;
	        _this.hasKey = false;
	        if (typeof compare === 'function') {
	            _this.compare = compare;
	        }
	        return _this;
	    }
	    DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {
	        return x === y;
	    };
	    DistinctUntilChangedSubscriber.prototype._next = function (value) {
	        var key;
	        try {
	            var keySelector = this.keySelector;
	            key = keySelector ? keySelector(value) : value;
	        }
	        catch (err) {
	            return this.destination.error(err);
	        }
	        var result = false;
	        if (this.hasKey) {
	            try {
	                var compare = this.compare;
	                result = compare(this.key, key);
	            }
	            catch (err) {
	                return this.destination.error(err);
	            }
	        }
	        else {
	            this.hasKey = true;
	        }
	        if (!result) {
	            this.key = key;
	            this.destination.next(value);
	        }
	    };
	    return DistinctUntilChangedSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _distinctUntilChanged PURE_IMPORTS_END */
	function distinctUntilKeyChanged(key, compare) {
	    return distinctUntilChanged(function (x, y) { return compare ? compare(x[key], y[key]) : x[key] === y[key]; });
	}

	/** PURE_IMPORTS_START tslib,_util_EmptyError,_Subscriber PURE_IMPORTS_END */
	function throwIfEmpty(errorFactory) {
	    if (errorFactory === void 0) {
	        errorFactory = defaultErrorFactory;
	    }
	    return function (source) {
	        return source.lift(new ThrowIfEmptyOperator(errorFactory));
	    };
	}
	var ThrowIfEmptyOperator = /*@__PURE__*/ (function () {
	    function ThrowIfEmptyOperator(errorFactory) {
	        this.errorFactory = errorFactory;
	    }
	    ThrowIfEmptyOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ThrowIfEmptySubscriber(subscriber, this.errorFactory));
	    };
	    return ThrowIfEmptyOperator;
	}());
	var ThrowIfEmptySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ThrowIfEmptySubscriber, _super);
	    function ThrowIfEmptySubscriber(destination, errorFactory) {
	        var _this = _super.call(this, destination) || this;
	        _this.errorFactory = errorFactory;
	        _this.hasValue = false;
	        return _this;
	    }
	    ThrowIfEmptySubscriber.prototype._next = function (value) {
	        this.hasValue = true;
	        this.destination.next(value);
	    };
	    ThrowIfEmptySubscriber.prototype._complete = function () {
	        if (!this.hasValue) {
	            var err = void 0;
	            try {
	                err = this.errorFactory();
	            }
	            catch (e) {
	                err = e;
	            }
	            this.destination.error(err);
	        }
	        else {
	            return this.destination.complete();
	        }
	    };
	    return ThrowIfEmptySubscriber;
	}(Subscriber));
	function defaultErrorFactory() {
	    return new EmptyError();
	}

	/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */
	function take(count) {
	    return function (source) {
	        if (count === 0) {
	            return empty$1();
	        }
	        else {
	            return source.lift(new TakeOperator(count));
	        }
	    };
	}
	var TakeOperator = /*@__PURE__*/ (function () {
	    function TakeOperator(total) {
	        this.total = total;
	        if (this.total < 0) {
	            throw new ArgumentOutOfRangeError;
	        }
	    }
	    TakeOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new TakeSubscriber(subscriber, this.total));
	    };
	    return TakeOperator;
	}());
	var TakeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(TakeSubscriber, _super);
	    function TakeSubscriber(destination, total) {
	        var _this = _super.call(this, destination) || this;
	        _this.total = total;
	        _this.count = 0;
	        return _this;
	    }
	    TakeSubscriber.prototype._next = function (value) {
	        var total = this.total;
	        var count = ++this.count;
	        if (count <= total) {
	            this.destination.next(value);
	            if (count === total) {
	                this.destination.complete();
	                this.unsubscribe();
	            }
	        }
	    };
	    return TakeSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _util_ArgumentOutOfRangeError,_filter,_throwIfEmpty,_defaultIfEmpty,_take PURE_IMPORTS_END */
	function elementAt(index, defaultValue) {
	    if (index < 0) {
	        throw new ArgumentOutOfRangeError();
	    }
	    var hasDefaultValue = arguments.length >= 2;
	    return function (source) {
	        return source.pipe(filter(function (v, i) { return i === index; }), take(1), hasDefaultValue
	            ? defaultIfEmpty(defaultValue)
	            : throwIfEmpty(function () { return new ArgumentOutOfRangeError(); }));
	    };
	}

	/** PURE_IMPORTS_START _observable_concat,_observable_of PURE_IMPORTS_END */
	function endWith() {
	    var array = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        array[_i] = arguments[_i];
	    }
	    return function (source) { return concat(source, of.apply(void 0, array)); };
	}

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function every(predicate, thisArg) {
	    return function (source) { return source.lift(new EveryOperator(predicate, thisArg, source)); };
	}
	var EveryOperator = /*@__PURE__*/ (function () {
	    function EveryOperator(predicate, thisArg, source) {
	        this.predicate = predicate;
	        this.thisArg = thisArg;
	        this.source = source;
	    }
	    EveryOperator.prototype.call = function (observer, source) {
	        return source.subscribe(new EverySubscriber(observer, this.predicate, this.thisArg, this.source));
	    };
	    return EveryOperator;
	}());
	var EverySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(EverySubscriber, _super);
	    function EverySubscriber(destination, predicate, thisArg, source) {
	        var _this = _super.call(this, destination) || this;
	        _this.predicate = predicate;
	        _this.thisArg = thisArg;
	        _this.source = source;
	        _this.index = 0;
	        _this.thisArg = thisArg || _this;
	        return _this;
	    }
	    EverySubscriber.prototype.notifyComplete = function (everyValueMatch) {
	        this.destination.next(everyValueMatch);
	        this.destination.complete();
	    };
	    EverySubscriber.prototype._next = function (value) {
	        var result = false;
	        try {
	            result = this.predicate.call(this.thisArg, value, this.index++, this.source);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (!result) {
	            this.notifyComplete(false);
	        }
	    };
	    EverySubscriber.prototype._complete = function () {
	        this.notifyComplete(true);
	    };
	    return EverySubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function exhaust() {
	    return function (source) { return source.lift(new SwitchFirstOperator()); };
	}
	var SwitchFirstOperator = /*@__PURE__*/ (function () {
	    function SwitchFirstOperator() {
	    }
	    SwitchFirstOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new SwitchFirstSubscriber(subscriber));
	    };
	    return SwitchFirstOperator;
	}());
	var SwitchFirstSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SwitchFirstSubscriber, _super);
	    function SwitchFirstSubscriber(destination) {
	        var _this = _super.call(this, destination) || this;
	        _this.hasCompleted = false;
	        _this.hasSubscription = false;
	        return _this;
	    }
	    SwitchFirstSubscriber.prototype._next = function (value) {
	        if (!this.hasSubscription) {
	            this.hasSubscription = true;
	            this.add(innerSubscribe(value, new SimpleInnerSubscriber(this)));
	        }
	    };
	    SwitchFirstSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (!this.hasSubscription) {
	            this.destination.complete();
	        }
	    };
	    SwitchFirstSubscriber.prototype.notifyComplete = function () {
	        this.hasSubscription = false;
	        if (this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return SwitchFirstSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */
	function exhaustMap(project, resultSelector) {
	    if (resultSelector) {
	        return function (source) { return source.pipe(exhaustMap(function (a, i) { return from(project(a, i)).pipe(map(function (b, ii) { return resultSelector(a, b, i, ii); })); })); };
	    }
	    return function (source) {
	        return source.lift(new ExhaustMapOperator(project));
	    };
	}
	var ExhaustMapOperator = /*@__PURE__*/ (function () {
	    function ExhaustMapOperator(project) {
	        this.project = project;
	    }
	    ExhaustMapOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ExhaustMapSubscriber(subscriber, this.project));
	    };
	    return ExhaustMapOperator;
	}());
	var ExhaustMapSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ExhaustMapSubscriber, _super);
	    function ExhaustMapSubscriber(destination, project) {
	        var _this = _super.call(this, destination) || this;
	        _this.project = project;
	        _this.hasSubscription = false;
	        _this.hasCompleted = false;
	        _this.index = 0;
	        return _this;
	    }
	    ExhaustMapSubscriber.prototype._next = function (value) {
	        if (!this.hasSubscription) {
	            this.tryNext(value);
	        }
	    };
	    ExhaustMapSubscriber.prototype.tryNext = function (value) {
	        var result;
	        var index = this.index++;
	        try {
	            result = this.project(value, index);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.hasSubscription = true;
	        this._innerSub(result);
	    };
	    ExhaustMapSubscriber.prototype._innerSub = function (result) {
	        var innerSubscriber = new SimpleInnerSubscriber(this);
	        var destination = this.destination;
	        destination.add(innerSubscriber);
	        var innerSubscription = innerSubscribe(result, innerSubscriber);
	        if (innerSubscription !== innerSubscriber) {
	            destination.add(innerSubscription);
	        }
	    };
	    ExhaustMapSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (!this.hasSubscription) {
	            this.destination.complete();
	        }
	        this.unsubscribe();
	    };
	    ExhaustMapSubscriber.prototype.notifyNext = function (innerValue) {
	        this.destination.next(innerValue);
	    };
	    ExhaustMapSubscriber.prototype.notifyError = function (err) {
	        this.destination.error(err);
	    };
	    ExhaustMapSubscriber.prototype.notifyComplete = function () {
	        this.hasSubscription = false;
	        if (this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return ExhaustMapSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function expand(project, concurrent, scheduler) {
	    if (concurrent === void 0) {
	        concurrent = Number.POSITIVE_INFINITY;
	    }
	    concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;
	    return function (source) { return source.lift(new ExpandOperator(project, concurrent, scheduler)); };
	}
	var ExpandOperator = /*@__PURE__*/ (function () {
	    function ExpandOperator(project, concurrent, scheduler) {
	        this.project = project;
	        this.concurrent = concurrent;
	        this.scheduler = scheduler;
	    }
	    ExpandOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
	    };
	    return ExpandOperator;
	}());
	var ExpandSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ExpandSubscriber, _super);
	    function ExpandSubscriber(destination, project, concurrent, scheduler) {
	        var _this = _super.call(this, destination) || this;
	        _this.project = project;
	        _this.concurrent = concurrent;
	        _this.scheduler = scheduler;
	        _this.index = 0;
	        _this.active = 0;
	        _this.hasCompleted = false;
	        if (concurrent < Number.POSITIVE_INFINITY) {
	            _this.buffer = [];
	        }
	        return _this;
	    }
	    ExpandSubscriber.dispatch = function (arg) {
	        var subscriber = arg.subscriber, result = arg.result, value = arg.value, index = arg.index;
	        subscriber.subscribeToProjection(result, value, index);
	    };
	    ExpandSubscriber.prototype._next = function (value) {
	        var destination = this.destination;
	        if (destination.closed) {
	            this._complete();
	            return;
	        }
	        var index = this.index++;
	        if (this.active < this.concurrent) {
	            destination.next(value);
	            try {
	                var project = this.project;
	                var result = project(value, index);
	                if (!this.scheduler) {
	                    this.subscribeToProjection(result, value, index);
	                }
	                else {
	                    var state = { subscriber: this, result: result, value: value, index: index };
	                    var destination_1 = this.destination;
	                    destination_1.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
	                }
	            }
	            catch (e) {
	                destination.error(e);
	            }
	        }
	        else {
	            this.buffer.push(value);
	        }
	    };
	    ExpandSubscriber.prototype.subscribeToProjection = function (result, value, index) {
	        this.active++;
	        var destination = this.destination;
	        destination.add(innerSubscribe(result, new SimpleInnerSubscriber(this)));
	    };
	    ExpandSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.hasCompleted && this.active === 0) {
	            this.destination.complete();
	        }
	        this.unsubscribe();
	    };
	    ExpandSubscriber.prototype.notifyNext = function (innerValue) {
	        this._next(innerValue);
	    };
	    ExpandSubscriber.prototype.notifyComplete = function () {
	        var buffer = this.buffer;
	        this.active--;
	        if (buffer && buffer.length > 0) {
	            this._next(buffer.shift());
	        }
	        if (this.hasCompleted && this.active === 0) {
	            this.destination.complete();
	        }
	    };
	    return ExpandSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_Subscription PURE_IMPORTS_END */
	function finalize(callback) {
	    return function (source) { return source.lift(new FinallyOperator(callback)); };
	}
	var FinallyOperator = /*@__PURE__*/ (function () {
	    function FinallyOperator(callback) {
	        this.callback = callback;
	    }
	    FinallyOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new FinallySubscriber(subscriber, this.callback));
	    };
	    return FinallyOperator;
	}());
	var FinallySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(FinallySubscriber, _super);
	    function FinallySubscriber(destination, callback) {
	        var _this = _super.call(this, destination) || this;
	        _this.add(new Subscription(callback));
	        return _this;
	    }
	    return FinallySubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function find(predicate, thisArg) {
	    if (typeof predicate !== 'function') {
	        throw new TypeError('predicate is not a function');
	    }
	    return function (source) { return source.lift(new FindValueOperator(predicate, source, false, thisArg)); };
	}
	var FindValueOperator = /*@__PURE__*/ (function () {
	    function FindValueOperator(predicate, source, yieldIndex, thisArg) {
	        this.predicate = predicate;
	        this.source = source;
	        this.yieldIndex = yieldIndex;
	        this.thisArg = thisArg;
	    }
	    FindValueOperator.prototype.call = function (observer, source) {
	        return source.subscribe(new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg));
	    };
	    return FindValueOperator;
	}());
	var FindValueSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(FindValueSubscriber, _super);
	    function FindValueSubscriber(destination, predicate, source, yieldIndex, thisArg) {
	        var _this = _super.call(this, destination) || this;
	        _this.predicate = predicate;
	        _this.source = source;
	        _this.yieldIndex = yieldIndex;
	        _this.thisArg = thisArg;
	        _this.index = 0;
	        return _this;
	    }
	    FindValueSubscriber.prototype.notifyComplete = function (value) {
	        var destination = this.destination;
	        destination.next(value);
	        destination.complete();
	        this.unsubscribe();
	    };
	    FindValueSubscriber.prototype._next = function (value) {
	        var _a = this, predicate = _a.predicate, thisArg = _a.thisArg;
	        var index = this.index++;
	        try {
	            var result = predicate.call(thisArg || this, value, index, this.source);
	            if (result) {
	                this.notifyComplete(this.yieldIndex ? index : value);
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    FindValueSubscriber.prototype._complete = function () {
	        this.notifyComplete(this.yieldIndex ? -1 : undefined);
	    };
	    return FindValueSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _operators_find PURE_IMPORTS_END */
	function findIndex(predicate, thisArg) {
	    return function (source) { return source.lift(new FindValueOperator(predicate, source, true, thisArg)); };
	}

	/** PURE_IMPORTS_START _util_EmptyError,_filter,_take,_defaultIfEmpty,_throwIfEmpty,_util_identity PURE_IMPORTS_END */
	function first(predicate, defaultValue) {
	    var hasDefaultValue = arguments.length >= 2;
	    return function (source) { return source.pipe(predicate ? filter(function (v, i) { return predicate(v, i, source); }) : identity, take(1), hasDefaultValue ? defaultIfEmpty(defaultValue) : throwIfEmpty(function () { return new EmptyError(); })); };
	}

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function ignoreElements() {
	    return function ignoreElementsOperatorFunction(source) {
	        return source.lift(new IgnoreElementsOperator());
	    };
	}
	var IgnoreElementsOperator = /*@__PURE__*/ (function () {
	    function IgnoreElementsOperator() {
	    }
	    IgnoreElementsOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new IgnoreElementsSubscriber(subscriber));
	    };
	    return IgnoreElementsOperator;
	}());
	var IgnoreElementsSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(IgnoreElementsSubscriber, _super);
	    function IgnoreElementsSubscriber() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    IgnoreElementsSubscriber.prototype._next = function (unused) {
	    };
	    return IgnoreElementsSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function isEmpty() {
	    return function (source) { return source.lift(new IsEmptyOperator()); };
	}
	var IsEmptyOperator = /*@__PURE__*/ (function () {
	    function IsEmptyOperator() {
	    }
	    IsEmptyOperator.prototype.call = function (observer, source) {
	        return source.subscribe(new IsEmptySubscriber(observer));
	    };
	    return IsEmptyOperator;
	}());
	var IsEmptySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(IsEmptySubscriber, _super);
	    function IsEmptySubscriber(destination) {
	        return _super.call(this, destination) || this;
	    }
	    IsEmptySubscriber.prototype.notifyComplete = function (isEmpty) {
	        var destination = this.destination;
	        destination.next(isEmpty);
	        destination.complete();
	    };
	    IsEmptySubscriber.prototype._next = function (value) {
	        this.notifyComplete(false);
	    };
	    IsEmptySubscriber.prototype._complete = function () {
	        this.notifyComplete(true);
	    };
	    return IsEmptySubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */
	function takeLast(count) {
	    return function takeLastOperatorFunction(source) {
	        if (count === 0) {
	            return empty$1();
	        }
	        else {
	            return source.lift(new TakeLastOperator(count));
	        }
	    };
	}
	var TakeLastOperator = /*@__PURE__*/ (function () {
	    function TakeLastOperator(total) {
	        this.total = total;
	        if (this.total < 0) {
	            throw new ArgumentOutOfRangeError;
	        }
	    }
	    TakeLastOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new TakeLastSubscriber(subscriber, this.total));
	    };
	    return TakeLastOperator;
	}());
	var TakeLastSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(TakeLastSubscriber, _super);
	    function TakeLastSubscriber(destination, total) {
	        var _this = _super.call(this, destination) || this;
	        _this.total = total;
	        _this.ring = new Array();
	        _this.count = 0;
	        return _this;
	    }
	    TakeLastSubscriber.prototype._next = function (value) {
	        var ring = this.ring;
	        var total = this.total;
	        var count = this.count++;
	        if (ring.length < total) {
	            ring.push(value);
	        }
	        else {
	            var index = count % total;
	            ring[index] = value;
	        }
	    };
	    TakeLastSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        var count = this.count;
	        if (count > 0) {
	            var total = this.count >= this.total ? this.total : this.count;
	            var ring = this.ring;
	            for (var i = 0; i < total; i++) {
	                var idx = (count++) % total;
	                destination.next(ring[idx]);
	            }
	        }
	        destination.complete();
	    };
	    return TakeLastSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _util_EmptyError,_filter,_takeLast,_throwIfEmpty,_defaultIfEmpty,_util_identity PURE_IMPORTS_END */
	function last(predicate, defaultValue) {
	    var hasDefaultValue = arguments.length >= 2;
	    return function (source) { return source.pipe(predicate ? filter(function (v, i) { return predicate(v, i, source); }) : identity, takeLast(1), hasDefaultValue ? defaultIfEmpty(defaultValue) : throwIfEmpty(function () { return new EmptyError(); })); };
	}

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function mapTo(value) {
	    return function (source) { return source.lift(new MapToOperator(value)); };
	}
	var MapToOperator = /*@__PURE__*/ (function () {
	    function MapToOperator(value) {
	        this.value = value;
	    }
	    MapToOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new MapToSubscriber(subscriber, this.value));
	    };
	    return MapToOperator;
	}());
	var MapToSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(MapToSubscriber, _super);
	    function MapToSubscriber(destination, value) {
	        var _this = _super.call(this, destination) || this;
	        _this.value = value;
	        return _this;
	    }
	    MapToSubscriber.prototype._next = function (x) {
	        this.destination.next(this.value);
	    };
	    return MapToSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */
	function materialize() {
	    return function materializeOperatorFunction(source) {
	        return source.lift(new MaterializeOperator());
	    };
	}
	var MaterializeOperator = /*@__PURE__*/ (function () {
	    function MaterializeOperator() {
	    }
	    MaterializeOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new MaterializeSubscriber(subscriber));
	    };
	    return MaterializeOperator;
	}());
	var MaterializeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(MaterializeSubscriber, _super);
	    function MaterializeSubscriber(destination) {
	        return _super.call(this, destination) || this;
	    }
	    MaterializeSubscriber.prototype._next = function (value) {
	        this.destination.next(Notification.createNext(value));
	    };
	    MaterializeSubscriber.prototype._error = function (err) {
	        var destination = this.destination;
	        destination.next(Notification.createError(err));
	        destination.complete();
	    };
	    MaterializeSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        destination.next(Notification.createComplete());
	        destination.complete();
	    };
	    return MaterializeSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function scan(accumulator, seed) {
	    var hasSeed = false;
	    if (arguments.length >= 2) {
	        hasSeed = true;
	    }
	    return function scanOperatorFunction(source) {
	        return source.lift(new ScanOperator(accumulator, seed, hasSeed));
	    };
	}
	var ScanOperator = /*@__PURE__*/ (function () {
	    function ScanOperator(accumulator, seed, hasSeed) {
	        if (hasSeed === void 0) {
	            hasSeed = false;
	        }
	        this.accumulator = accumulator;
	        this.seed = seed;
	        this.hasSeed = hasSeed;
	    }
	    ScanOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
	    };
	    return ScanOperator;
	}());
	var ScanSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ScanSubscriber, _super);
	    function ScanSubscriber(destination, accumulator, _seed, hasSeed) {
	        var _this = _super.call(this, destination) || this;
	        _this.accumulator = accumulator;
	        _this._seed = _seed;
	        _this.hasSeed = hasSeed;
	        _this.index = 0;
	        return _this;
	    }
	    Object.defineProperty(ScanSubscriber.prototype, "seed", {
	        get: function () {
	            return this._seed;
	        },
	        set: function (value) {
	            this.hasSeed = true;
	            this._seed = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    ScanSubscriber.prototype._next = function (value) {
	        if (!this.hasSeed) {
	            this.seed = value;
	            this.destination.next(value);
	        }
	        else {
	            return this._tryNext(value);
	        }
	    };
	    ScanSubscriber.prototype._tryNext = function (value) {
	        var index = this.index++;
	        var result;
	        try {
	            result = this.accumulator(this.seed, value, index);
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	        this.seed = result;
	        this.destination.next(result);
	    };
	    return ScanSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _scan,_takeLast,_defaultIfEmpty,_util_pipe PURE_IMPORTS_END */
	function reduce(accumulator, seed) {
	    if (arguments.length >= 2) {
	        return function reduceOperatorFunctionWithSeed(source) {
	            return pipe(scan(accumulator, seed), takeLast(1), defaultIfEmpty(seed))(source);
	        };
	    }
	    return function reduceOperatorFunction(source) {
	        return pipe(scan(function (acc, value, index) { return accumulator(acc, value, index + 1); }), takeLast(1))(source);
	    };
	}

	/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */
	function max(comparer) {
	    var max = (typeof comparer === 'function')
	        ? function (x, y) { return comparer(x, y) > 0 ? x : y; }
	        : function (x, y) { return x > y ? x : y; };
	    return reduce(max);
	}

	/** PURE_IMPORTS_START _observable_merge PURE_IMPORTS_END */
	function merge$1() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    return function (source) { return source.lift.call(merge.apply(void 0, [source].concat(observables))); };
	}

	/** PURE_IMPORTS_START _mergeMap PURE_IMPORTS_END */
	function mergeMapTo(innerObservable, resultSelector, concurrent) {
	    if (concurrent === void 0) {
	        concurrent = Number.POSITIVE_INFINITY;
	    }
	    if (typeof resultSelector === 'function') {
	        return mergeMap(function () { return innerObservable; }, resultSelector, concurrent);
	    }
	    if (typeof resultSelector === 'number') {
	        concurrent = resultSelector;
	    }
	    return mergeMap(function () { return innerObservable; }, concurrent);
	}

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function mergeScan(accumulator, seed, concurrent) {
	    if (concurrent === void 0) {
	        concurrent = Number.POSITIVE_INFINITY;
	    }
	    return function (source) { return source.lift(new MergeScanOperator(accumulator, seed, concurrent)); };
	}
	var MergeScanOperator = /*@__PURE__*/ (function () {
	    function MergeScanOperator(accumulator, seed, concurrent) {
	        this.accumulator = accumulator;
	        this.seed = seed;
	        this.concurrent = concurrent;
	    }
	    MergeScanOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new MergeScanSubscriber(subscriber, this.accumulator, this.seed, this.concurrent));
	    };
	    return MergeScanOperator;
	}());
	var MergeScanSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(MergeScanSubscriber, _super);
	    function MergeScanSubscriber(destination, accumulator, acc, concurrent) {
	        var _this = _super.call(this, destination) || this;
	        _this.accumulator = accumulator;
	        _this.acc = acc;
	        _this.concurrent = concurrent;
	        _this.hasValue = false;
	        _this.hasCompleted = false;
	        _this.buffer = [];
	        _this.active = 0;
	        _this.index = 0;
	        return _this;
	    }
	    MergeScanSubscriber.prototype._next = function (value) {
	        if (this.active < this.concurrent) {
	            var index = this.index++;
	            var destination = this.destination;
	            var ish = void 0;
	            try {
	                var accumulator = this.accumulator;
	                ish = accumulator(this.acc, value, index);
	            }
	            catch (e) {
	                return destination.error(e);
	            }
	            this.active++;
	            this._innerSub(ish);
	        }
	        else {
	            this.buffer.push(value);
	        }
	    };
	    MergeScanSubscriber.prototype._innerSub = function (ish) {
	        var innerSubscriber = new SimpleInnerSubscriber(this);
	        var destination = this.destination;
	        destination.add(innerSubscriber);
	        var innerSubscription = innerSubscribe(ish, innerSubscriber);
	        if (innerSubscription !== innerSubscriber) {
	            destination.add(innerSubscription);
	        }
	    };
	    MergeScanSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.active === 0 && this.buffer.length === 0) {
	            if (this.hasValue === false) {
	                this.destination.next(this.acc);
	            }
	            this.destination.complete();
	        }
	        this.unsubscribe();
	    };
	    MergeScanSubscriber.prototype.notifyNext = function (innerValue) {
	        var destination = this.destination;
	        this.acc = innerValue;
	        this.hasValue = true;
	        destination.next(innerValue);
	    };
	    MergeScanSubscriber.prototype.notifyComplete = function () {
	        var buffer = this.buffer;
	        this.active--;
	        if (buffer.length > 0) {
	            this._next(buffer.shift());
	        }
	        else if (this.active === 0 && this.hasCompleted) {
	            if (this.hasValue === false) {
	                this.destination.next(this.acc);
	            }
	            this.destination.complete();
	        }
	    };
	    return MergeScanSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */
	function min(comparer) {
	    var min = (typeof comparer === 'function')
	        ? function (x, y) { return comparer(x, y) < 0 ? x : y; }
	        : function (x, y) { return x < y ? x : y; };
	    return reduce(min);
	}

	/** PURE_IMPORTS_START _observable_ConnectableObservable PURE_IMPORTS_END */
	function multicast(subjectOrSubjectFactory, selector) {
	    return function multicastOperatorFunction(source) {
	        var subjectFactory;
	        if (typeof subjectOrSubjectFactory === 'function') {
	            subjectFactory = subjectOrSubjectFactory;
	        }
	        else {
	            subjectFactory = function subjectFactory() {
	                return subjectOrSubjectFactory;
	            };
	        }
	        if (typeof selector === 'function') {
	            return source.lift(new MulticastOperator(subjectFactory, selector));
	        }
	        var connectable = Object.create(source, connectableObservableDescriptor);
	        connectable.source = source;
	        connectable.subjectFactory = subjectFactory;
	        return connectable;
	    };
	}
	var MulticastOperator = /*@__PURE__*/ (function () {
	    function MulticastOperator(subjectFactory, selector) {
	        this.subjectFactory = subjectFactory;
	        this.selector = selector;
	    }
	    MulticastOperator.prototype.call = function (subscriber, source) {
	        var selector = this.selector;
	        var subject = this.subjectFactory();
	        var subscription = selector(subject).subscribe(subscriber);
	        subscription.add(source.subscribe(subject));
	        return subscription;
	    };
	    return MulticastOperator;
	}());

	/** PURE_IMPORTS_START tslib,_observable_from,_util_isArray,_innerSubscribe PURE_IMPORTS_END */
	function onErrorResumeNext$1() {
	    var nextSources = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        nextSources[_i] = arguments[_i];
	    }
	    if (nextSources.length === 1 && isArray(nextSources[0])) {
	        nextSources = nextSources[0];
	    }
	    return function (source) { return source.lift(new OnErrorResumeNextOperator(nextSources)); };
	}
	var OnErrorResumeNextOperator = /*@__PURE__*/ (function () {
	    function OnErrorResumeNextOperator(nextSources) {
	        this.nextSources = nextSources;
	    }
	    OnErrorResumeNextOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new OnErrorResumeNextSubscriber(subscriber, this.nextSources));
	    };
	    return OnErrorResumeNextOperator;
	}());
	var OnErrorResumeNextSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(OnErrorResumeNextSubscriber, _super);
	    function OnErrorResumeNextSubscriber(destination, nextSources) {
	        var _this = _super.call(this, destination) || this;
	        _this.destination = destination;
	        _this.nextSources = nextSources;
	        return _this;
	    }
	    OnErrorResumeNextSubscriber.prototype.notifyError = function () {
	        this.subscribeToNextSource();
	    };
	    OnErrorResumeNextSubscriber.prototype.notifyComplete = function () {
	        this.subscribeToNextSource();
	    };
	    OnErrorResumeNextSubscriber.prototype._error = function (err) {
	        this.subscribeToNextSource();
	        this.unsubscribe();
	    };
	    OnErrorResumeNextSubscriber.prototype._complete = function () {
	        this.subscribeToNextSource();
	        this.unsubscribe();
	    };
	    OnErrorResumeNextSubscriber.prototype.subscribeToNextSource = function () {
	        var next = this.nextSources.shift();
	        if (!!next) {
	            var innerSubscriber = new SimpleInnerSubscriber(this);
	            var destination = this.destination;
	            destination.add(innerSubscriber);
	            var innerSubscription = innerSubscribe(next, innerSubscriber);
	            if (innerSubscription !== innerSubscriber) {
	                destination.add(innerSubscription);
	            }
	        }
	        else {
	            this.destination.complete();
	        }
	    };
	    return OnErrorResumeNextSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function pairwise() {
	    return function (source) { return source.lift(new PairwiseOperator()); };
	}
	var PairwiseOperator = /*@__PURE__*/ (function () {
	    function PairwiseOperator() {
	    }
	    PairwiseOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new PairwiseSubscriber(subscriber));
	    };
	    return PairwiseOperator;
	}());
	var PairwiseSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(PairwiseSubscriber, _super);
	    function PairwiseSubscriber(destination) {
	        var _this = _super.call(this, destination) || this;
	        _this.hasPrev = false;
	        return _this;
	    }
	    PairwiseSubscriber.prototype._next = function (value) {
	        var pair;
	        if (this.hasPrev) {
	            pair = [this.prev, value];
	        }
	        else {
	            this.hasPrev = true;
	        }
	        this.prev = value;
	        if (pair) {
	            this.destination.next(pair);
	        }
	    };
	    return PairwiseSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _util_not,_filter PURE_IMPORTS_END */
	function partition$1(predicate, thisArg) {
	    return function (source) {
	        return [
	            filter(predicate, thisArg)(source),
	            filter(not(predicate, thisArg))(source)
	        ];
	    };
	}

	/** PURE_IMPORTS_START _map PURE_IMPORTS_END */
	function pluck() {
	    var properties = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        properties[_i] = arguments[_i];
	    }
	    var length = properties.length;
	    if (length === 0) {
	        throw new Error('list of properties cannot be empty.');
	    }
	    return function (source) { return map(plucker(properties, length))(source); };
	}
	function plucker(props, length) {
	    var mapper = function (x) {
	        var currentProp = x;
	        for (var i = 0; i < length; i++) {
	            var p = currentProp != null ? currentProp[props[i]] : undefined;
	            if (p !== void 0) {
	                currentProp = p;
	            }
	            else {
	                return undefined;
	            }
	        }
	        return currentProp;
	    };
	    return mapper;
	}

	/** PURE_IMPORTS_START _Subject,_multicast PURE_IMPORTS_END */
	function publish(selector) {
	    return selector ?
	        multicast(function () { return new Subject(); }, selector) :
	        multicast(new Subject());
	}

	/** PURE_IMPORTS_START _BehaviorSubject,_multicast PURE_IMPORTS_END */
	function publishBehavior(value) {
	    return function (source) { return multicast(new BehaviorSubject(value))(source); };
	}

	/** PURE_IMPORTS_START _AsyncSubject,_multicast PURE_IMPORTS_END */
	function publishLast() {
	    return function (source) { return multicast(new AsyncSubject())(source); };
	}

	/** PURE_IMPORTS_START _ReplaySubject,_multicast PURE_IMPORTS_END */
	function publishReplay(bufferSize, windowTime, selectorOrScheduler, scheduler) {
	    if (selectorOrScheduler && typeof selectorOrScheduler !== 'function') {
	        scheduler = selectorOrScheduler;
	    }
	    var selector = typeof selectorOrScheduler === 'function' ? selectorOrScheduler : undefined;
	    var subject = new ReplaySubject(bufferSize, windowTime, scheduler);
	    return function (source) { return multicast(function () { return subject; }, selector)(source); };
	}

	/** PURE_IMPORTS_START _util_isArray,_observable_race PURE_IMPORTS_END */
	function race$1() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    return function raceOperatorFunction(source) {
	        if (observables.length === 1 && isArray(observables[0])) {
	            observables = observables[0];
	        }
	        return source.lift.call(race.apply(void 0, [source].concat(observables)));
	    };
	}

	/** PURE_IMPORTS_START tslib,_Subscriber,_observable_empty PURE_IMPORTS_END */
	function repeat(count) {
	    if (count === void 0) {
	        count = -1;
	    }
	    return function (source) {
	        if (count === 0) {
	            return empty$1();
	        }
	        else if (count < 0) {
	            return source.lift(new RepeatOperator(-1, source));
	        }
	        else {
	            return source.lift(new RepeatOperator(count - 1, source));
	        }
	    };
	}
	var RepeatOperator = /*@__PURE__*/ (function () {
	    function RepeatOperator(count, source) {
	        this.count = count;
	        this.source = source;
	    }
	    RepeatOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new RepeatSubscriber(subscriber, this.count, this.source));
	    };
	    return RepeatOperator;
	}());
	var RepeatSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(RepeatSubscriber, _super);
	    function RepeatSubscriber(destination, count, source) {
	        var _this = _super.call(this, destination) || this;
	        _this.count = count;
	        _this.source = source;
	        return _this;
	    }
	    RepeatSubscriber.prototype.complete = function () {
	        if (!this.isStopped) {
	            var _a = this, source = _a.source, count = _a.count;
	            if (count === 0) {
	                return _super.prototype.complete.call(this);
	            }
	            else if (count > -1) {
	                this.count = count - 1;
	            }
	            source.subscribe(this._unsubscribeAndRecycle());
	        }
	    };
	    return RepeatSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */
	function repeatWhen(notifier) {
	    return function (source) { return source.lift(new RepeatWhenOperator(notifier)); };
	}
	var RepeatWhenOperator = /*@__PURE__*/ (function () {
	    function RepeatWhenOperator(notifier) {
	        this.notifier = notifier;
	    }
	    RepeatWhenOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new RepeatWhenSubscriber(subscriber, this.notifier, source));
	    };
	    return RepeatWhenOperator;
	}());
	var RepeatWhenSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(RepeatWhenSubscriber, _super);
	    function RepeatWhenSubscriber(destination, notifier, source) {
	        var _this = _super.call(this, destination) || this;
	        _this.notifier = notifier;
	        _this.source = source;
	        _this.sourceIsBeingSubscribedTo = true;
	        return _this;
	    }
	    RepeatWhenSubscriber.prototype.notifyNext = function () {
	        this.sourceIsBeingSubscribedTo = true;
	        this.source.subscribe(this);
	    };
	    RepeatWhenSubscriber.prototype.notifyComplete = function () {
	        if (this.sourceIsBeingSubscribedTo === false) {
	            return _super.prototype.complete.call(this);
	        }
	    };
	    RepeatWhenSubscriber.prototype.complete = function () {
	        this.sourceIsBeingSubscribedTo = false;
	        if (!this.isStopped) {
	            if (!this.retries) {
	                this.subscribeToRetries();
	            }
	            if (!this.retriesSubscription || this.retriesSubscription.closed) {
	                return _super.prototype.complete.call(this);
	            }
	            this._unsubscribeAndRecycle();
	            this.notifications.next(undefined);
	        }
	    };
	    RepeatWhenSubscriber.prototype._unsubscribe = function () {
	        var _a = this, notifications = _a.notifications, retriesSubscription = _a.retriesSubscription;
	        if (notifications) {
	            notifications.unsubscribe();
	            this.notifications = undefined;
	        }
	        if (retriesSubscription) {
	            retriesSubscription.unsubscribe();
	            this.retriesSubscription = undefined;
	        }
	        this.retries = undefined;
	    };
	    RepeatWhenSubscriber.prototype._unsubscribeAndRecycle = function () {
	        var _unsubscribe = this._unsubscribe;
	        this._unsubscribe = null;
	        _super.prototype._unsubscribeAndRecycle.call(this);
	        this._unsubscribe = _unsubscribe;
	        return this;
	    };
	    RepeatWhenSubscriber.prototype.subscribeToRetries = function () {
	        this.notifications = new Subject();
	        var retries;
	        try {
	            var notifier = this.notifier;
	            retries = notifier(this.notifications);
	        }
	        catch (e) {
	            return _super.prototype.complete.call(this);
	        }
	        this.retries = retries;
	        this.retriesSubscription = innerSubscribe(retries, new SimpleInnerSubscriber(this));
	    };
	    return RepeatWhenSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function retry(count) {
	    if (count === void 0) {
	        count = -1;
	    }
	    return function (source) { return source.lift(new RetryOperator(count, source)); };
	}
	var RetryOperator = /*@__PURE__*/ (function () {
	    function RetryOperator(count, source) {
	        this.count = count;
	        this.source = source;
	    }
	    RetryOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new RetrySubscriber(subscriber, this.count, this.source));
	    };
	    return RetryOperator;
	}());
	var RetrySubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(RetrySubscriber, _super);
	    function RetrySubscriber(destination, count, source) {
	        var _this = _super.call(this, destination) || this;
	        _this.count = count;
	        _this.source = source;
	        return _this;
	    }
	    RetrySubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var _a = this, source = _a.source, count = _a.count;
	            if (count === 0) {
	                return _super.prototype.error.call(this, err);
	            }
	            else if (count > -1) {
	                this.count = count - 1;
	            }
	            source.subscribe(this._unsubscribeAndRecycle());
	        }
	    };
	    return RetrySubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */
	function retryWhen(notifier) {
	    return function (source) { return source.lift(new RetryWhenOperator(notifier, source)); };
	}
	var RetryWhenOperator = /*@__PURE__*/ (function () {
	    function RetryWhenOperator(notifier, source) {
	        this.notifier = notifier;
	        this.source = source;
	    }
	    RetryWhenOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new RetryWhenSubscriber(subscriber, this.notifier, this.source));
	    };
	    return RetryWhenOperator;
	}());
	var RetryWhenSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(RetryWhenSubscriber, _super);
	    function RetryWhenSubscriber(destination, notifier, source) {
	        var _this = _super.call(this, destination) || this;
	        _this.notifier = notifier;
	        _this.source = source;
	        return _this;
	    }
	    RetryWhenSubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var errors = this.errors;
	            var retries = this.retries;
	            var retriesSubscription = this.retriesSubscription;
	            if (!retries) {
	                errors = new Subject();
	                try {
	                    var notifier = this.notifier;
	                    retries = notifier(errors);
	                }
	                catch (e) {
	                    return _super.prototype.error.call(this, e);
	                }
	                retriesSubscription = innerSubscribe(retries, new SimpleInnerSubscriber(this));
	            }
	            else {
	                this.errors = undefined;
	                this.retriesSubscription = undefined;
	            }
	            this._unsubscribeAndRecycle();
	            this.errors = errors;
	            this.retries = retries;
	            this.retriesSubscription = retriesSubscription;
	            errors.next(err);
	        }
	    };
	    RetryWhenSubscriber.prototype._unsubscribe = function () {
	        var _a = this, errors = _a.errors, retriesSubscription = _a.retriesSubscription;
	        if (errors) {
	            errors.unsubscribe();
	            this.errors = undefined;
	        }
	        if (retriesSubscription) {
	            retriesSubscription.unsubscribe();
	            this.retriesSubscription = undefined;
	        }
	        this.retries = undefined;
	    };
	    RetryWhenSubscriber.prototype.notifyNext = function () {
	        var _unsubscribe = this._unsubscribe;
	        this._unsubscribe = null;
	        this._unsubscribeAndRecycle();
	        this._unsubscribe = _unsubscribe;
	        this.source.subscribe(this);
	    };
	    return RetryWhenSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function sample(notifier) {
	    return function (source) { return source.lift(new SampleOperator(notifier)); };
	}
	var SampleOperator = /*@__PURE__*/ (function () {
	    function SampleOperator(notifier) {
	        this.notifier = notifier;
	    }
	    SampleOperator.prototype.call = function (subscriber, source) {
	        var sampleSubscriber = new SampleSubscriber(subscriber);
	        var subscription = source.subscribe(sampleSubscriber);
	        subscription.add(innerSubscribe(this.notifier, new SimpleInnerSubscriber(sampleSubscriber)));
	        return subscription;
	    };
	    return SampleOperator;
	}());
	var SampleSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SampleSubscriber, _super);
	    function SampleSubscriber() {
	        var _this = _super !== null && _super.apply(this, arguments) || this;
	        _this.hasValue = false;
	        return _this;
	    }
	    SampleSubscriber.prototype._next = function (value) {
	        this.value = value;
	        this.hasValue = true;
	    };
	    SampleSubscriber.prototype.notifyNext = function () {
	        this.emitValue();
	    };
	    SampleSubscriber.prototype.notifyComplete = function () {
	        this.emitValue();
	    };
	    SampleSubscriber.prototype.emitValue = function () {
	        if (this.hasValue) {
	            this.hasValue = false;
	            this.destination.next(this.value);
	        }
	    };
	    return SampleSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */
	function sampleTime(period, scheduler) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    return function (source) { return source.lift(new SampleTimeOperator(period, scheduler)); };
	}
	var SampleTimeOperator = /*@__PURE__*/ (function () {
	    function SampleTimeOperator(period, scheduler) {
	        this.period = period;
	        this.scheduler = scheduler;
	    }
	    SampleTimeOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new SampleTimeSubscriber(subscriber, this.period, this.scheduler));
	    };
	    return SampleTimeOperator;
	}());
	var SampleTimeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SampleTimeSubscriber, _super);
	    function SampleTimeSubscriber(destination, period, scheduler) {
	        var _this = _super.call(this, destination) || this;
	        _this.period = period;
	        _this.scheduler = scheduler;
	        _this.hasValue = false;
	        _this.add(scheduler.schedule(dispatchNotification, period, { subscriber: _this, period: period }));
	        return _this;
	    }
	    SampleTimeSubscriber.prototype._next = function (value) {
	        this.lastValue = value;
	        this.hasValue = true;
	    };
	    SampleTimeSubscriber.prototype.notifyNext = function () {
	        if (this.hasValue) {
	            this.hasValue = false;
	            this.destination.next(this.lastValue);
	        }
	    };
	    return SampleTimeSubscriber;
	}(Subscriber));
	function dispatchNotification(state) {
	    var subscriber = state.subscriber, period = state.period;
	    subscriber.notifyNext();
	    this.schedule(state, period);
	}

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function sequenceEqual(compareTo, comparator) {
	    return function (source) { return source.lift(new SequenceEqualOperator(compareTo, comparator)); };
	}
	var SequenceEqualOperator = /*@__PURE__*/ (function () {
	    function SequenceEqualOperator(compareTo, comparator) {
	        this.compareTo = compareTo;
	        this.comparator = comparator;
	    }
	    SequenceEqualOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new SequenceEqualSubscriber(subscriber, this.compareTo, this.comparator));
	    };
	    return SequenceEqualOperator;
	}());
	var SequenceEqualSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SequenceEqualSubscriber, _super);
	    function SequenceEqualSubscriber(destination, compareTo, comparator) {
	        var _this = _super.call(this, destination) || this;
	        _this.compareTo = compareTo;
	        _this.comparator = comparator;
	        _this._a = [];
	        _this._b = [];
	        _this._oneComplete = false;
	        _this.destination.add(compareTo.subscribe(new SequenceEqualCompareToSubscriber(destination, _this)));
	        return _this;
	    }
	    SequenceEqualSubscriber.prototype._next = function (value) {
	        if (this._oneComplete && this._b.length === 0) {
	            this.emit(false);
	        }
	        else {
	            this._a.push(value);
	            this.checkValues();
	        }
	    };
	    SequenceEqualSubscriber.prototype._complete = function () {
	        if (this._oneComplete) {
	            this.emit(this._a.length === 0 && this._b.length === 0);
	        }
	        else {
	            this._oneComplete = true;
	        }
	        this.unsubscribe();
	    };
	    SequenceEqualSubscriber.prototype.checkValues = function () {
	        var _c = this, _a = _c._a, _b = _c._b, comparator = _c.comparator;
	        while (_a.length > 0 && _b.length > 0) {
	            var a = _a.shift();
	            var b = _b.shift();
	            var areEqual = false;
	            try {
	                areEqual = comparator ? comparator(a, b) : a === b;
	            }
	            catch (e) {
	                this.destination.error(e);
	            }
	            if (!areEqual) {
	                this.emit(false);
	            }
	        }
	    };
	    SequenceEqualSubscriber.prototype.emit = function (value) {
	        var destination = this.destination;
	        destination.next(value);
	        destination.complete();
	    };
	    SequenceEqualSubscriber.prototype.nextB = function (value) {
	        if (this._oneComplete && this._a.length === 0) {
	            this.emit(false);
	        }
	        else {
	            this._b.push(value);
	            this.checkValues();
	        }
	    };
	    SequenceEqualSubscriber.prototype.completeB = function () {
	        if (this._oneComplete) {
	            this.emit(this._a.length === 0 && this._b.length === 0);
	        }
	        else {
	            this._oneComplete = true;
	        }
	    };
	    return SequenceEqualSubscriber;
	}(Subscriber));
	var SequenceEqualCompareToSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SequenceEqualCompareToSubscriber, _super);
	    function SequenceEqualCompareToSubscriber(destination, parent) {
	        var _this = _super.call(this, destination) || this;
	        _this.parent = parent;
	        return _this;
	    }
	    SequenceEqualCompareToSubscriber.prototype._next = function (value) {
	        this.parent.nextB(value);
	    };
	    SequenceEqualCompareToSubscriber.prototype._error = function (err) {
	        this.parent.error(err);
	        this.unsubscribe();
	    };
	    SequenceEqualCompareToSubscriber.prototype._complete = function () {
	        this.parent.completeB();
	        this.unsubscribe();
	    };
	    return SequenceEqualCompareToSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _multicast,_refCount,_Subject PURE_IMPORTS_END */
	function shareSubjectFactory() {
	    return new Subject();
	}
	function share() {
	    return function (source) { return refCount()(multicast(shareSubjectFactory)(source)); };
	}

	/** PURE_IMPORTS_START _ReplaySubject PURE_IMPORTS_END */
	function shareReplay(configOrBufferSize, windowTime, scheduler) {
	    var config;
	    if (configOrBufferSize && typeof configOrBufferSize === 'object') {
	        config = configOrBufferSize;
	    }
	    else {
	        config = {
	            bufferSize: configOrBufferSize,
	            windowTime: windowTime,
	            refCount: false,
	            scheduler: scheduler
	        };
	    }
	    return function (source) { return source.lift(shareReplayOperator(config)); };
	}
	function shareReplayOperator(_a) {
	    var _b = _a.bufferSize, bufferSize = _b === void 0 ? Number.POSITIVE_INFINITY : _b, _c = _a.windowTime, windowTime = _c === void 0 ? Number.POSITIVE_INFINITY : _c, useRefCount = _a.refCount, scheduler = _a.scheduler;
	    var subject;
	    var refCount = 0;
	    var subscription;
	    var hasError = false;
	    var isComplete = false;
	    return function shareReplayOperation(source) {
	        refCount++;
	        var innerSub;
	        if (!subject || hasError) {
	            hasError = false;
	            subject = new ReplaySubject(bufferSize, windowTime, scheduler);
	            innerSub = subject.subscribe(this);
	            subscription = source.subscribe({
	                next: function (value) { subject.next(value); },
	                error: function (err) {
	                    hasError = true;
	                    subject.error(err);
	                },
	                complete: function () {
	                    isComplete = true;
	                    subscription = undefined;
	                    subject.complete();
	                },
	            });
	        }
	        else {
	            innerSub = subject.subscribe(this);
	        }
	        this.add(function () {
	            refCount--;
	            innerSub.unsubscribe();
	            if (subscription && !isComplete && useRefCount && refCount === 0) {
	                subscription.unsubscribe();
	                subscription = undefined;
	                subject = undefined;
	            }
	        });
	    };
	}

	/** PURE_IMPORTS_START tslib,_Subscriber,_util_EmptyError PURE_IMPORTS_END */
	function single(predicate) {
	    return function (source) { return source.lift(new SingleOperator(predicate, source)); };
	}
	var SingleOperator = /*@__PURE__*/ (function () {
	    function SingleOperator(predicate, source) {
	        this.predicate = predicate;
	        this.source = source;
	    }
	    SingleOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new SingleSubscriber(subscriber, this.predicate, this.source));
	    };
	    return SingleOperator;
	}());
	var SingleSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SingleSubscriber, _super);
	    function SingleSubscriber(destination, predicate, source) {
	        var _this = _super.call(this, destination) || this;
	        _this.predicate = predicate;
	        _this.source = source;
	        _this.seenValue = false;
	        _this.index = 0;
	        return _this;
	    }
	    SingleSubscriber.prototype.applySingleValue = function (value) {
	        if (this.seenValue) {
	            this.destination.error('Sequence contains more than one element');
	        }
	        else {
	            this.seenValue = true;
	            this.singleValue = value;
	        }
	    };
	    SingleSubscriber.prototype._next = function (value) {
	        var index = this.index++;
	        if (this.predicate) {
	            this.tryNext(value, index);
	        }
	        else {
	            this.applySingleValue(value);
	        }
	    };
	    SingleSubscriber.prototype.tryNext = function (value, index) {
	        try {
	            if (this.predicate(value, index, this.source)) {
	                this.applySingleValue(value);
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    SingleSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        if (this.index > 0) {
	            destination.next(this.seenValue ? this.singleValue : undefined);
	            destination.complete();
	        }
	        else {
	            destination.error(new EmptyError);
	        }
	    };
	    return SingleSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function skip(count) {
	    return function (source) { return source.lift(new SkipOperator(count)); };
	}
	var SkipOperator = /*@__PURE__*/ (function () {
	    function SkipOperator(total) {
	        this.total = total;
	    }
	    SkipOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new SkipSubscriber(subscriber, this.total));
	    };
	    return SkipOperator;
	}());
	var SkipSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SkipSubscriber, _super);
	    function SkipSubscriber(destination, total) {
	        var _this = _super.call(this, destination) || this;
	        _this.total = total;
	        _this.count = 0;
	        return _this;
	    }
	    SkipSubscriber.prototype._next = function (x) {
	        if (++this.count > this.total) {
	            this.destination.next(x);
	        }
	    };
	    return SkipSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError PURE_IMPORTS_END */
	function skipLast(count) {
	    return function (source) { return source.lift(new SkipLastOperator(count)); };
	}
	var SkipLastOperator = /*@__PURE__*/ (function () {
	    function SkipLastOperator(_skipCount) {
	        this._skipCount = _skipCount;
	        if (this._skipCount < 0) {
	            throw new ArgumentOutOfRangeError;
	        }
	    }
	    SkipLastOperator.prototype.call = function (subscriber, source) {
	        if (this._skipCount === 0) {
	            return source.subscribe(new Subscriber(subscriber));
	        }
	        else {
	            return source.subscribe(new SkipLastSubscriber(subscriber, this._skipCount));
	        }
	    };
	    return SkipLastOperator;
	}());
	var SkipLastSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SkipLastSubscriber, _super);
	    function SkipLastSubscriber(destination, _skipCount) {
	        var _this = _super.call(this, destination) || this;
	        _this._skipCount = _skipCount;
	        _this._count = 0;
	        _this._ring = new Array(_skipCount);
	        return _this;
	    }
	    SkipLastSubscriber.prototype._next = function (value) {
	        var skipCount = this._skipCount;
	        var count = this._count++;
	        if (count < skipCount) {
	            this._ring[count] = value;
	        }
	        else {
	            var currentIndex = count % skipCount;
	            var ring = this._ring;
	            var oldValue = ring[currentIndex];
	            ring[currentIndex] = value;
	            this.destination.next(oldValue);
	        }
	    };
	    return SkipLastSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function skipUntil(notifier) {
	    return function (source) { return source.lift(new SkipUntilOperator(notifier)); };
	}
	var SkipUntilOperator = /*@__PURE__*/ (function () {
	    function SkipUntilOperator(notifier) {
	        this.notifier = notifier;
	    }
	    SkipUntilOperator.prototype.call = function (destination, source) {
	        return source.subscribe(new SkipUntilSubscriber(destination, this.notifier));
	    };
	    return SkipUntilOperator;
	}());
	var SkipUntilSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SkipUntilSubscriber, _super);
	    function SkipUntilSubscriber(destination, notifier) {
	        var _this = _super.call(this, destination) || this;
	        _this.hasValue = false;
	        var innerSubscriber = new SimpleInnerSubscriber(_this);
	        _this.add(innerSubscriber);
	        _this.innerSubscription = innerSubscriber;
	        var innerSubscription = innerSubscribe(notifier, innerSubscriber);
	        if (innerSubscription !== innerSubscriber) {
	            _this.add(innerSubscription);
	            _this.innerSubscription = innerSubscription;
	        }
	        return _this;
	    }
	    SkipUntilSubscriber.prototype._next = function (value) {
	        if (this.hasValue) {
	            _super.prototype._next.call(this, value);
	        }
	    };
	    SkipUntilSubscriber.prototype.notifyNext = function () {
	        this.hasValue = true;
	        if (this.innerSubscription) {
	            this.innerSubscription.unsubscribe();
	        }
	    };
	    SkipUntilSubscriber.prototype.notifyComplete = function () {
	    };
	    return SkipUntilSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function skipWhile(predicate) {
	    return function (source) { return source.lift(new SkipWhileOperator(predicate)); };
	}
	var SkipWhileOperator = /*@__PURE__*/ (function () {
	    function SkipWhileOperator(predicate) {
	        this.predicate = predicate;
	    }
	    SkipWhileOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new SkipWhileSubscriber(subscriber, this.predicate));
	    };
	    return SkipWhileOperator;
	}());
	var SkipWhileSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SkipWhileSubscriber, _super);
	    function SkipWhileSubscriber(destination, predicate) {
	        var _this = _super.call(this, destination) || this;
	        _this.predicate = predicate;
	        _this.skipping = true;
	        _this.index = 0;
	        return _this;
	    }
	    SkipWhileSubscriber.prototype._next = function (value) {
	        var destination = this.destination;
	        if (this.skipping) {
	            this.tryCallPredicate(value);
	        }
	        if (!this.skipping) {
	            destination.next(value);
	        }
	    };
	    SkipWhileSubscriber.prototype.tryCallPredicate = function (value) {
	        try {
	            var result = this.predicate(value, this.index++);
	            this.skipping = Boolean(result);
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    return SkipWhileSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START _observable_concat,_util_isScheduler PURE_IMPORTS_END */
	function startWith() {
	    var array = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        array[_i] = arguments[_i];
	    }
	    var scheduler = array[array.length - 1];
	    if (isScheduler(scheduler)) {
	        array.pop();
	        return function (source) { return concat(array, source, scheduler); };
	    }
	    else {
	        return function (source) { return concat(array, source); };
	    }
	}

	/** PURE_IMPORTS_START tslib,_Observable,_scheduler_asap,_util_isNumeric PURE_IMPORTS_END */
	var SubscribeOnObservable = /*@__PURE__*/ (function (_super) {
	    __extends(SubscribeOnObservable, _super);
	    function SubscribeOnObservable(source, delayTime, scheduler) {
	        if (delayTime === void 0) {
	            delayTime = 0;
	        }
	        if (scheduler === void 0) {
	            scheduler = asap;
	        }
	        var _this = _super.call(this) || this;
	        _this.source = source;
	        _this.delayTime = delayTime;
	        _this.scheduler = scheduler;
	        if (!isNumeric(delayTime) || delayTime < 0) {
	            _this.delayTime = 0;
	        }
	        if (!scheduler || typeof scheduler.schedule !== 'function') {
	            _this.scheduler = asap;
	        }
	        return _this;
	    }
	    SubscribeOnObservable.create = function (source, delay, scheduler) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (scheduler === void 0) {
	            scheduler = asap;
	        }
	        return new SubscribeOnObservable(source, delay, scheduler);
	    };
	    SubscribeOnObservable.dispatch = function (arg) {
	        var source = arg.source, subscriber = arg.subscriber;
	        return this.add(source.subscribe(subscriber));
	    };
	    SubscribeOnObservable.prototype._subscribe = function (subscriber) {
	        var delay = this.delayTime;
	        var source = this.source;
	        var scheduler = this.scheduler;
	        return scheduler.schedule(SubscribeOnObservable.dispatch, delay, {
	            source: source, subscriber: subscriber
	        });
	    };
	    return SubscribeOnObservable;
	}(Observable));

	/** PURE_IMPORTS_START _observable_SubscribeOnObservable PURE_IMPORTS_END */
	function subscribeOn(scheduler, delay) {
	    if (delay === void 0) {
	        delay = 0;
	    }
	    return function subscribeOnOperatorFunction(source) {
	        return source.lift(new SubscribeOnOperator(scheduler, delay));
	    };
	}
	var SubscribeOnOperator = /*@__PURE__*/ (function () {
	    function SubscribeOnOperator(scheduler, delay) {
	        this.scheduler = scheduler;
	        this.delay = delay;
	    }
	    SubscribeOnOperator.prototype.call = function (subscriber, source) {
	        return new SubscribeOnObservable(source, this.delay, this.scheduler).subscribe(subscriber);
	    };
	    return SubscribeOnOperator;
	}());

	/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */
	function switchMap(project, resultSelector) {
	    if (typeof resultSelector === 'function') {
	        return function (source) { return source.pipe(switchMap(function (a, i) { return from(project(a, i)).pipe(map(function (b, ii) { return resultSelector(a, b, i, ii); })); })); };
	    }
	    return function (source) { return source.lift(new SwitchMapOperator(project)); };
	}
	var SwitchMapOperator = /*@__PURE__*/ (function () {
	    function SwitchMapOperator(project) {
	        this.project = project;
	    }
	    SwitchMapOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new SwitchMapSubscriber(subscriber, this.project));
	    };
	    return SwitchMapOperator;
	}());
	var SwitchMapSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(SwitchMapSubscriber, _super);
	    function SwitchMapSubscriber(destination, project) {
	        var _this = _super.call(this, destination) || this;
	        _this.project = project;
	        _this.index = 0;
	        return _this;
	    }
	    SwitchMapSubscriber.prototype._next = function (value) {
	        var result;
	        var index = this.index++;
	        try {
	            result = this.project(value, index);
	        }
	        catch (error) {
	            this.destination.error(error);
	            return;
	        }
	        this._innerSub(result);
	    };
	    SwitchMapSubscriber.prototype._innerSub = function (result) {
	        var innerSubscription = this.innerSubscription;
	        if (innerSubscription) {
	            innerSubscription.unsubscribe();
	        }
	        var innerSubscriber = new SimpleInnerSubscriber(this);
	        var destination = this.destination;
	        destination.add(innerSubscriber);
	        this.innerSubscription = innerSubscribe(result, innerSubscriber);
	        if (this.innerSubscription !== innerSubscriber) {
	            destination.add(this.innerSubscription);
	        }
	    };
	    SwitchMapSubscriber.prototype._complete = function () {
	        var innerSubscription = this.innerSubscription;
	        if (!innerSubscription || innerSubscription.closed) {
	            _super.prototype._complete.call(this);
	        }
	        this.unsubscribe();
	    };
	    SwitchMapSubscriber.prototype._unsubscribe = function () {
	        this.innerSubscription = undefined;
	    };
	    SwitchMapSubscriber.prototype.notifyComplete = function () {
	        this.innerSubscription = undefined;
	        if (this.isStopped) {
	            _super.prototype._complete.call(this);
	        }
	    };
	    SwitchMapSubscriber.prototype.notifyNext = function (innerValue) {
	        this.destination.next(innerValue);
	    };
	    return SwitchMapSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START _switchMap,_util_identity PURE_IMPORTS_END */
	function switchAll() {
	    return switchMap(identity);
	}

	/** PURE_IMPORTS_START _switchMap PURE_IMPORTS_END */
	function switchMapTo(innerObservable, resultSelector) {
	    return resultSelector ? switchMap(function () { return innerObservable; }, resultSelector) : switchMap(function () { return innerObservable; });
	}

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	function takeUntil(notifier) {
	    return function (source) { return source.lift(new TakeUntilOperator(notifier)); };
	}
	var TakeUntilOperator = /*@__PURE__*/ (function () {
	    function TakeUntilOperator(notifier) {
	        this.notifier = notifier;
	    }
	    TakeUntilOperator.prototype.call = function (subscriber, source) {
	        var takeUntilSubscriber = new TakeUntilSubscriber(subscriber);
	        var notifierSubscription = innerSubscribe(this.notifier, new SimpleInnerSubscriber(takeUntilSubscriber));
	        if (notifierSubscription && !takeUntilSubscriber.seenValue) {
	            takeUntilSubscriber.add(notifierSubscription);
	            return source.subscribe(takeUntilSubscriber);
	        }
	        return takeUntilSubscriber;
	    };
	    return TakeUntilOperator;
	}());
	var TakeUntilSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(TakeUntilSubscriber, _super);
	    function TakeUntilSubscriber(destination) {
	        var _this = _super.call(this, destination) || this;
	        _this.seenValue = false;
	        return _this;
	    }
	    TakeUntilSubscriber.prototype.notifyNext = function () {
	        this.seenValue = true;
	        this.complete();
	    };
	    TakeUntilSubscriber.prototype.notifyComplete = function () {
	    };
	    return TakeUntilSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
	function takeWhile(predicate, inclusive) {
	    if (inclusive === void 0) {
	        inclusive = false;
	    }
	    return function (source) {
	        return source.lift(new TakeWhileOperator(predicate, inclusive));
	    };
	}
	var TakeWhileOperator = /*@__PURE__*/ (function () {
	    function TakeWhileOperator(predicate, inclusive) {
	        this.predicate = predicate;
	        this.inclusive = inclusive;
	    }
	    TakeWhileOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new TakeWhileSubscriber(subscriber, this.predicate, this.inclusive));
	    };
	    return TakeWhileOperator;
	}());
	var TakeWhileSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(TakeWhileSubscriber, _super);
	    function TakeWhileSubscriber(destination, predicate, inclusive) {
	        var _this = _super.call(this, destination) || this;
	        _this.predicate = predicate;
	        _this.inclusive = inclusive;
	        _this.index = 0;
	        return _this;
	    }
	    TakeWhileSubscriber.prototype._next = function (value) {
	        var destination = this.destination;
	        var result;
	        try {
	            result = this.predicate(value, this.index++);
	        }
	        catch (err) {
	            destination.error(err);
	            return;
	        }
	        this.nextOrComplete(value, result);
	    };
	    TakeWhileSubscriber.prototype.nextOrComplete = function (value, predicateResult) {
	        var destination = this.destination;
	        if (Boolean(predicateResult)) {
	            destination.next(value);
	        }
	        else {
	            if (this.inclusive) {
	                destination.next(value);
	            }
	            destination.complete();
	        }
	    };
	    return TakeWhileSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_util_noop,_util_isFunction PURE_IMPORTS_END */
	function tap(nextOrObserver, error, complete) {
	    return function tapOperatorFunction(source) {
	        return source.lift(new DoOperator(nextOrObserver, error, complete));
	    };
	}
	var DoOperator = /*@__PURE__*/ (function () {
	    function DoOperator(nextOrObserver, error, complete) {
	        this.nextOrObserver = nextOrObserver;
	        this.error = error;
	        this.complete = complete;
	    }
	    DoOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new TapSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
	    };
	    return DoOperator;
	}());
	var TapSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(TapSubscriber, _super);
	    function TapSubscriber(destination, observerOrNext, error, complete) {
	        var _this = _super.call(this, destination) || this;
	        _this._tapNext = noop;
	        _this._tapError = noop;
	        _this._tapComplete = noop;
	        _this._tapError = error || noop;
	        _this._tapComplete = complete || noop;
	        if (isFunction(observerOrNext)) {
	            _this._context = _this;
	            _this._tapNext = observerOrNext;
	        }
	        else if (observerOrNext) {
	            _this._context = observerOrNext;
	            _this._tapNext = observerOrNext.next || noop;
	            _this._tapError = observerOrNext.error || noop;
	            _this._tapComplete = observerOrNext.complete || noop;
	        }
	        return _this;
	    }
	    TapSubscriber.prototype._next = function (value) {
	        try {
	            this._tapNext.call(this._context, value);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(value);
	    };
	    TapSubscriber.prototype._error = function (err) {
	        try {
	            this._tapError.call(this._context, err);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.error(err);
	    };
	    TapSubscriber.prototype._complete = function () {
	        try {
	            this._tapComplete.call(this._context);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        return this.destination.complete();
	    };
	    return TapSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
	var defaultThrottleConfig = {
	    leading: true,
	    trailing: false
	};
	function throttle(durationSelector, config) {
	    if (config === void 0) {
	        config = defaultThrottleConfig;
	    }
	    return function (source) { return source.lift(new ThrottleOperator(durationSelector, !!config.leading, !!config.trailing)); };
	}
	var ThrottleOperator = /*@__PURE__*/ (function () {
	    function ThrottleOperator(durationSelector, leading, trailing) {
	        this.durationSelector = durationSelector;
	        this.leading = leading;
	        this.trailing = trailing;
	    }
	    ThrottleOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ThrottleSubscriber(subscriber, this.durationSelector, this.leading, this.trailing));
	    };
	    return ThrottleOperator;
	}());
	var ThrottleSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ThrottleSubscriber, _super);
	    function ThrottleSubscriber(destination, durationSelector, _leading, _trailing) {
	        var _this = _super.call(this, destination) || this;
	        _this.destination = destination;
	        _this.durationSelector = durationSelector;
	        _this._leading = _leading;
	        _this._trailing = _trailing;
	        _this._hasValue = false;
	        return _this;
	    }
	    ThrottleSubscriber.prototype._next = function (value) {
	        this._hasValue = true;
	        this._sendValue = value;
	        if (!this._throttled) {
	            if (this._leading) {
	                this.send();
	            }
	            else {
	                this.throttle(value);
	            }
	        }
	    };
	    ThrottleSubscriber.prototype.send = function () {
	        var _a = this, _hasValue = _a._hasValue, _sendValue = _a._sendValue;
	        if (_hasValue) {
	            this.destination.next(_sendValue);
	            this.throttle(_sendValue);
	        }
	        this._hasValue = false;
	        this._sendValue = undefined;
	    };
	    ThrottleSubscriber.prototype.throttle = function (value) {
	        var duration = this.tryDurationSelector(value);
	        if (!!duration) {
	            this.add(this._throttled = innerSubscribe(duration, new SimpleInnerSubscriber(this)));
	        }
	    };
	    ThrottleSubscriber.prototype.tryDurationSelector = function (value) {
	        try {
	            return this.durationSelector(value);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return null;
	        }
	    };
	    ThrottleSubscriber.prototype.throttlingDone = function () {
	        var _a = this, _throttled = _a._throttled, _trailing = _a._trailing;
	        if (_throttled) {
	            _throttled.unsubscribe();
	        }
	        this._throttled = undefined;
	        if (_trailing) {
	            this.send();
	        }
	    };
	    ThrottleSubscriber.prototype.notifyNext = function () {
	        this.throttlingDone();
	    };
	    ThrottleSubscriber.prototype.notifyComplete = function () {
	        this.throttlingDone();
	    };
	    return ThrottleSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async,_throttle PURE_IMPORTS_END */
	function throttleTime(duration, scheduler, config) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    if (config === void 0) {
	        config = defaultThrottleConfig;
	    }
	    return function (source) { return source.lift(new ThrottleTimeOperator(duration, scheduler, config.leading, config.trailing)); };
	}
	var ThrottleTimeOperator = /*@__PURE__*/ (function () {
	    function ThrottleTimeOperator(duration, scheduler, leading, trailing) {
	        this.duration = duration;
	        this.scheduler = scheduler;
	        this.leading = leading;
	        this.trailing = trailing;
	    }
	    ThrottleTimeOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler, this.leading, this.trailing));
	    };
	    return ThrottleTimeOperator;
	}());
	var ThrottleTimeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(ThrottleTimeSubscriber, _super);
	    function ThrottleTimeSubscriber(destination, duration, scheduler, leading, trailing) {
	        var _this = _super.call(this, destination) || this;
	        _this.duration = duration;
	        _this.scheduler = scheduler;
	        _this.leading = leading;
	        _this.trailing = trailing;
	        _this._hasTrailingValue = false;
	        _this._trailingValue = null;
	        return _this;
	    }
	    ThrottleTimeSubscriber.prototype._next = function (value) {
	        if (this.throttled) {
	            if (this.trailing) {
	                this._trailingValue = value;
	                this._hasTrailingValue = true;
	            }
	        }
	        else {
	            this.add(this.throttled = this.scheduler.schedule(dispatchNext$3, this.duration, { subscriber: this }));
	            if (this.leading) {
	                this.destination.next(value);
	            }
	            else if (this.trailing) {
	                this._trailingValue = value;
	                this._hasTrailingValue = true;
	            }
	        }
	    };
	    ThrottleTimeSubscriber.prototype._complete = function () {
	        if (this._hasTrailingValue) {
	            this.destination.next(this._trailingValue);
	            this.destination.complete();
	        }
	        else {
	            this.destination.complete();
	        }
	    };
	    ThrottleTimeSubscriber.prototype.clearThrottle = function () {
	        var throttled = this.throttled;
	        if (throttled) {
	            if (this.trailing && this._hasTrailingValue) {
	                this.destination.next(this._trailingValue);
	                this._trailingValue = null;
	                this._hasTrailingValue = false;
	            }
	            throttled.unsubscribe();
	            this.remove(throttled);
	            this.throttled = null;
	        }
	    };
	    return ThrottleTimeSubscriber;
	}(Subscriber));
	function dispatchNext$3(arg) {
	    var subscriber = arg.subscriber;
	    subscriber.clearThrottle();
	}

	/** PURE_IMPORTS_START _scheduler_async,_scan,_observable_defer,_map PURE_IMPORTS_END */
	function timeInterval(scheduler) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    return function (source) {
	        return defer(function () {
	            return source.pipe(scan(function (_a, value) {
	                var current = _a.current;
	                return ({ value: value, current: scheduler.now(), last: current });
	            }, { current: scheduler.now(), value: undefined, last: undefined }), map(function (_a) {
	                var current = _a.current, last = _a.last, value = _a.value;
	                return new TimeInterval(value, current - last);
	            }));
	        });
	    };
	}
	var TimeInterval = /*@__PURE__*/ (function () {
	    function TimeInterval(value, interval) {
	        this.value = value;
	        this.interval = interval;
	    }
	    return TimeInterval;
	}());

	/** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_innerSubscribe PURE_IMPORTS_END */
	function timeoutWith(due, withObservable, scheduler) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    return function (source) {
	        var absoluteTimeout = isDate(due);
	        var waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(due);
	        return source.lift(new TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler));
	    };
	}
	var TimeoutWithOperator = /*@__PURE__*/ (function () {
	    function TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler) {
	        this.waitFor = waitFor;
	        this.absoluteTimeout = absoluteTimeout;
	        this.withObservable = withObservable;
	        this.scheduler = scheduler;
	    }
	    TimeoutWithOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new TimeoutWithSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler));
	    };
	    return TimeoutWithOperator;
	}());
	var TimeoutWithSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(TimeoutWithSubscriber, _super);
	    function TimeoutWithSubscriber(destination, absoluteTimeout, waitFor, withObservable, scheduler) {
	        var _this = _super.call(this, destination) || this;
	        _this.absoluteTimeout = absoluteTimeout;
	        _this.waitFor = waitFor;
	        _this.withObservable = withObservable;
	        _this.scheduler = scheduler;
	        _this.scheduleTimeout();
	        return _this;
	    }
	    TimeoutWithSubscriber.dispatchTimeout = function (subscriber) {
	        var withObservable = subscriber.withObservable;
	        subscriber._unsubscribeAndRecycle();
	        subscriber.add(innerSubscribe(withObservable, new SimpleInnerSubscriber(subscriber)));
	    };
	    TimeoutWithSubscriber.prototype.scheduleTimeout = function () {
	        var action = this.action;
	        if (action) {
	            this.action = action.schedule(this, this.waitFor);
	        }
	        else {
	            this.add(this.action = this.scheduler.schedule(TimeoutWithSubscriber.dispatchTimeout, this.waitFor, this));
	        }
	    };
	    TimeoutWithSubscriber.prototype._next = function (value) {
	        if (!this.absoluteTimeout) {
	            this.scheduleTimeout();
	        }
	        _super.prototype._next.call(this, value);
	    };
	    TimeoutWithSubscriber.prototype._unsubscribe = function () {
	        this.action = undefined;
	        this.scheduler = null;
	        this.withObservable = null;
	    };
	    return TimeoutWithSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START _scheduler_async,_util_TimeoutError,_timeoutWith,_observable_throwError PURE_IMPORTS_END */
	function timeout(due, scheduler) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    return timeoutWith(due, throwError(new TimeoutError()), scheduler);
	}

	/** PURE_IMPORTS_START _scheduler_async,_map PURE_IMPORTS_END */
	function timestamp(scheduler) {
	    if (scheduler === void 0) {
	        scheduler = async;
	    }
	    return map(function (value) { return new Timestamp(value, scheduler.now()); });
	}
	var Timestamp = /*@__PURE__*/ (function () {
	    function Timestamp(value, timestamp) {
	        this.value = value;
	        this.timestamp = timestamp;
	    }
	    return Timestamp;
	}());

	/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */
	function toArrayReducer(arr, item, index) {
	    if (index === 0) {
	        return [item];
	    }
	    arr.push(item);
	    return arr;
	}
	function toArray() {
	    return reduce(toArrayReducer, []);
	}

	/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */
	function window$1(windowBoundaries) {
	    return function windowOperatorFunction(source) {
	        return source.lift(new WindowOperator(windowBoundaries));
	    };
	}
	var WindowOperator = /*@__PURE__*/ (function () {
	    function WindowOperator(windowBoundaries) {
	        this.windowBoundaries = windowBoundaries;
	    }
	    WindowOperator.prototype.call = function (subscriber, source) {
	        var windowSubscriber = new WindowSubscriber(subscriber);
	        var sourceSubscription = source.subscribe(windowSubscriber);
	        if (!sourceSubscription.closed) {
	            windowSubscriber.add(innerSubscribe(this.windowBoundaries, new SimpleInnerSubscriber(windowSubscriber)));
	        }
	        return sourceSubscription;
	    };
	    return WindowOperator;
	}());
	var WindowSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(WindowSubscriber, _super);
	    function WindowSubscriber(destination) {
	        var _this = _super.call(this, destination) || this;
	        _this.window = new Subject();
	        destination.next(_this.window);
	        return _this;
	    }
	    WindowSubscriber.prototype.notifyNext = function () {
	        this.openWindow();
	    };
	    WindowSubscriber.prototype.notifyError = function (error) {
	        this._error(error);
	    };
	    WindowSubscriber.prototype.notifyComplete = function () {
	        this._complete();
	    };
	    WindowSubscriber.prototype._next = function (value) {
	        this.window.next(value);
	    };
	    WindowSubscriber.prototype._error = function (err) {
	        this.window.error(err);
	        this.destination.error(err);
	    };
	    WindowSubscriber.prototype._complete = function () {
	        this.window.complete();
	        this.destination.complete();
	    };
	    WindowSubscriber.prototype._unsubscribe = function () {
	        this.window = null;
	    };
	    WindowSubscriber.prototype.openWindow = function () {
	        var prevWindow = this.window;
	        if (prevWindow) {
	            prevWindow.complete();
	        }
	        var destination = this.destination;
	        var newWindow = this.window = new Subject();
	        destination.next(newWindow);
	    };
	    return WindowSubscriber;
	}(SimpleOuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subscriber,_Subject PURE_IMPORTS_END */
	function windowCount(windowSize, startWindowEvery) {
	    if (startWindowEvery === void 0) {
	        startWindowEvery = 0;
	    }
	    return function windowCountOperatorFunction(source) {
	        return source.lift(new WindowCountOperator(windowSize, startWindowEvery));
	    };
	}
	var WindowCountOperator = /*@__PURE__*/ (function () {
	    function WindowCountOperator(windowSize, startWindowEvery) {
	        this.windowSize = windowSize;
	        this.startWindowEvery = startWindowEvery;
	    }
	    WindowCountOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new WindowCountSubscriber(subscriber, this.windowSize, this.startWindowEvery));
	    };
	    return WindowCountOperator;
	}());
	var WindowCountSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(WindowCountSubscriber, _super);
	    function WindowCountSubscriber(destination, windowSize, startWindowEvery) {
	        var _this = _super.call(this, destination) || this;
	        _this.destination = destination;
	        _this.windowSize = windowSize;
	        _this.startWindowEvery = startWindowEvery;
	        _this.windows = [new Subject()];
	        _this.count = 0;
	        destination.next(_this.windows[0]);
	        return _this;
	    }
	    WindowCountSubscriber.prototype._next = function (value) {
	        var startWindowEvery = (this.startWindowEvery > 0) ? this.startWindowEvery : this.windowSize;
	        var destination = this.destination;
	        var windowSize = this.windowSize;
	        var windows = this.windows;
	        var len = windows.length;
	        for (var i = 0; i < len && !this.closed; i++) {
	            windows[i].next(value);
	        }
	        var c = this.count - windowSize + 1;
	        if (c >= 0 && c % startWindowEvery === 0 && !this.closed) {
	            windows.shift().complete();
	        }
	        if (++this.count % startWindowEvery === 0 && !this.closed) {
	            var window_1 = new Subject();
	            windows.push(window_1);
	            destination.next(window_1);
	        }
	    };
	    WindowCountSubscriber.prototype._error = function (err) {
	        var windows = this.windows;
	        if (windows) {
	            while (windows.length > 0 && !this.closed) {
	                windows.shift().error(err);
	            }
	        }
	        this.destination.error(err);
	    };
	    WindowCountSubscriber.prototype._complete = function () {
	        var windows = this.windows;
	        if (windows) {
	            while (windows.length > 0 && !this.closed) {
	                windows.shift().complete();
	            }
	        }
	        this.destination.complete();
	    };
	    WindowCountSubscriber.prototype._unsubscribe = function () {
	        this.count = 0;
	        this.windows = null;
	    };
	    return WindowCountSubscriber;
	}(Subscriber));

	/** PURE_IMPORTS_START tslib,_Subject,_scheduler_async,_Subscriber,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */
	function windowTime(windowTimeSpan) {
	    var scheduler = async;
	    var windowCreationInterval = null;
	    var maxWindowSize = Number.POSITIVE_INFINITY;
	    if (isScheduler(arguments[3])) {
	        scheduler = arguments[3];
	    }
	    if (isScheduler(arguments[2])) {
	        scheduler = arguments[2];
	    }
	    else if (isNumeric(arguments[2])) {
	        maxWindowSize = Number(arguments[2]);
	    }
	    if (isScheduler(arguments[1])) {
	        scheduler = arguments[1];
	    }
	    else if (isNumeric(arguments[1])) {
	        windowCreationInterval = Number(arguments[1]);
	    }
	    return function windowTimeOperatorFunction(source) {
	        return source.lift(new WindowTimeOperator(windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler));
	    };
	}
	var WindowTimeOperator = /*@__PURE__*/ (function () {
	    function WindowTimeOperator(windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler) {
	        this.windowTimeSpan = windowTimeSpan;
	        this.windowCreationInterval = windowCreationInterval;
	        this.maxWindowSize = maxWindowSize;
	        this.scheduler = scheduler;
	    }
	    WindowTimeOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new WindowTimeSubscriber(subscriber, this.windowTimeSpan, this.windowCreationInterval, this.maxWindowSize, this.scheduler));
	    };
	    return WindowTimeOperator;
	}());
	var CountedSubject = /*@__PURE__*/ (function (_super) {
	    __extends(CountedSubject, _super);
	    function CountedSubject() {
	        var _this = _super !== null && _super.apply(this, arguments) || this;
	        _this._numberOfNextedValues = 0;
	        return _this;
	    }
	    CountedSubject.prototype.next = function (value) {
	        this._numberOfNextedValues++;
	        _super.prototype.next.call(this, value);
	    };
	    Object.defineProperty(CountedSubject.prototype, "numberOfNextedValues", {
	        get: function () {
	            return this._numberOfNextedValues;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return CountedSubject;
	}(Subject));
	var WindowTimeSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(WindowTimeSubscriber, _super);
	    function WindowTimeSubscriber(destination, windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler) {
	        var _this = _super.call(this, destination) || this;
	        _this.destination = destination;
	        _this.windowTimeSpan = windowTimeSpan;
	        _this.windowCreationInterval = windowCreationInterval;
	        _this.maxWindowSize = maxWindowSize;
	        _this.scheduler = scheduler;
	        _this.windows = [];
	        var window = _this.openWindow();
	        if (windowCreationInterval !== null && windowCreationInterval >= 0) {
	            var closeState = { subscriber: _this, window: window, context: null };
	            var creationState = { windowTimeSpan: windowTimeSpan, windowCreationInterval: windowCreationInterval, subscriber: _this, scheduler: scheduler };
	            _this.add(scheduler.schedule(dispatchWindowClose, windowTimeSpan, closeState));
	            _this.add(scheduler.schedule(dispatchWindowCreation, windowCreationInterval, creationState));
	        }
	        else {
	            var timeSpanOnlyState = { subscriber: _this, window: window, windowTimeSpan: windowTimeSpan };
	            _this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, timeSpanOnlyState));
	        }
	        return _this;
	    }
	    WindowTimeSubscriber.prototype._next = function (value) {
	        var windows = this.windows;
	        var len = windows.length;
	        for (var i = 0; i < len; i++) {
	            var window_1 = windows[i];
	            if (!window_1.closed) {
	                window_1.next(value);
	                if (window_1.numberOfNextedValues >= this.maxWindowSize) {
	                    this.closeWindow(window_1);
	                }
	            }
	        }
	    };
	    WindowTimeSubscriber.prototype._error = function (err) {
	        var windows = this.windows;
	        while (windows.length > 0) {
	            windows.shift().error(err);
	        }
	        this.destination.error(err);
	    };
	    WindowTimeSubscriber.prototype._complete = function () {
	        var windows = this.windows;
	        while (windows.length > 0) {
	            var window_2 = windows.shift();
	            if (!window_2.closed) {
	                window_2.complete();
	            }
	        }
	        this.destination.complete();
	    };
	    WindowTimeSubscriber.prototype.openWindow = function () {
	        var window = new CountedSubject();
	        this.windows.push(window);
	        var destination = this.destination;
	        destination.next(window);
	        return window;
	    };
	    WindowTimeSubscriber.prototype.closeWindow = function (window) {
	        window.complete();
	        var windows = this.windows;
	        windows.splice(windows.indexOf(window), 1);
	    };
	    return WindowTimeSubscriber;
	}(Subscriber));
	function dispatchWindowTimeSpanOnly(state) {
	    var subscriber = state.subscriber, windowTimeSpan = state.windowTimeSpan, window = state.window;
	    if (window) {
	        subscriber.closeWindow(window);
	    }
	    state.window = subscriber.openWindow();
	    this.schedule(state, windowTimeSpan);
	}
	function dispatchWindowCreation(state) {
	    var windowTimeSpan = state.windowTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler, windowCreationInterval = state.windowCreationInterval;
	    var window = subscriber.openWindow();
	    var action = this;
	    var context = { action: action, subscription: null };
	    var timeSpanState = { subscriber: subscriber, window: window, context: context };
	    context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, timeSpanState);
	    action.add(context.subscription);
	    action.schedule(state, windowCreationInterval);
	}
	function dispatchWindowClose(state) {
	    var subscriber = state.subscriber, window = state.window, context = state.context;
	    if (context && context.action && context.subscription) {
	        context.action.remove(context.subscription);
	    }
	    subscriber.closeWindow(window);
	}

	/** PURE_IMPORTS_START tslib,_Subject,_Subscription,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */
	function windowToggle(openings, closingSelector) {
	    return function (source) { return source.lift(new WindowToggleOperator(openings, closingSelector)); };
	}
	var WindowToggleOperator = /*@__PURE__*/ (function () {
	    function WindowToggleOperator(openings, closingSelector) {
	        this.openings = openings;
	        this.closingSelector = closingSelector;
	    }
	    WindowToggleOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new WindowToggleSubscriber(subscriber, this.openings, this.closingSelector));
	    };
	    return WindowToggleOperator;
	}());
	var WindowToggleSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(WindowToggleSubscriber, _super);
	    function WindowToggleSubscriber(destination, openings, closingSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.openings = openings;
	        _this.closingSelector = closingSelector;
	        _this.contexts = [];
	        _this.add(_this.openSubscription = subscribeToResult(_this, openings, openings));
	        return _this;
	    }
	    WindowToggleSubscriber.prototype._next = function (value) {
	        var contexts = this.contexts;
	        if (contexts) {
	            var len = contexts.length;
	            for (var i = 0; i < len; i++) {
	                contexts[i].window.next(value);
	            }
	        }
	    };
	    WindowToggleSubscriber.prototype._error = function (err) {
	        var contexts = this.contexts;
	        this.contexts = null;
	        if (contexts) {
	            var len = contexts.length;
	            var index = -1;
	            while (++index < len) {
	                var context_1 = contexts[index];
	                context_1.window.error(err);
	                context_1.subscription.unsubscribe();
	            }
	        }
	        _super.prototype._error.call(this, err);
	    };
	    WindowToggleSubscriber.prototype._complete = function () {
	        var contexts = this.contexts;
	        this.contexts = null;
	        if (contexts) {
	            var len = contexts.length;
	            var index = -1;
	            while (++index < len) {
	                var context_2 = contexts[index];
	                context_2.window.complete();
	                context_2.subscription.unsubscribe();
	            }
	        }
	        _super.prototype._complete.call(this);
	    };
	    WindowToggleSubscriber.prototype._unsubscribe = function () {
	        var contexts = this.contexts;
	        this.contexts = null;
	        if (contexts) {
	            var len = contexts.length;
	            var index = -1;
	            while (++index < len) {
	                var context_3 = contexts[index];
	                context_3.window.unsubscribe();
	                context_3.subscription.unsubscribe();
	            }
	        }
	    };
	    WindowToggleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        if (outerValue === this.openings) {
	            var closingNotifier = void 0;
	            try {
	                var closingSelector = this.closingSelector;
	                closingNotifier = closingSelector(innerValue);
	            }
	            catch (e) {
	                return this.error(e);
	            }
	            var window_1 = new Subject();
	            var subscription = new Subscription();
	            var context_4 = { window: window_1, subscription: subscription };
	            this.contexts.push(context_4);
	            var innerSubscription = subscribeToResult(this, closingNotifier, context_4);
	            if (innerSubscription.closed) {
	                this.closeWindow(this.contexts.length - 1);
	            }
	            else {
	                innerSubscription.context = context_4;
	                subscription.add(innerSubscription);
	            }
	            this.destination.next(window_1);
	        }
	        else {
	            this.closeWindow(this.contexts.indexOf(outerValue));
	        }
	    };
	    WindowToggleSubscriber.prototype.notifyError = function (err) {
	        this.error(err);
	    };
	    WindowToggleSubscriber.prototype.notifyComplete = function (inner) {
	        if (inner !== this.openSubscription) {
	            this.closeWindow(this.contexts.indexOf(inner.context));
	        }
	    };
	    WindowToggleSubscriber.prototype.closeWindow = function (index) {
	        if (index === -1) {
	            return;
	        }
	        var contexts = this.contexts;
	        var context = contexts[index];
	        var window = context.window, subscription = context.subscription;
	        contexts.splice(index, 1);
	        window.complete();
	        subscription.unsubscribe();
	    };
	    return WindowToggleSubscriber;
	}(OuterSubscriber));

	/** PURE_IMPORTS_START tslib,_Subject,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */
	function windowWhen(closingSelector) {
	    return function windowWhenOperatorFunction(source) {
	        return source.lift(new WindowOperator$1(closingSelector));
	    };
	}
	var WindowOperator$1 = /*@__PURE__*/ (function () {
	    function WindowOperator(closingSelector) {
	        this.closingSelector = closingSelector;
	    }
	    WindowOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new WindowSubscriber$1(subscriber, this.closingSelector));
	    };
	    return WindowOperator;
	}());
	var WindowSubscriber$1 = /*@__PURE__*/ (function (_super) {
	    __extends(WindowSubscriber, _super);
	    function WindowSubscriber(destination, closingSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.destination = destination;
	        _this.closingSelector = closingSelector;
	        _this.openWindow();
	        return _this;
	    }
	    WindowSubscriber.prototype.notifyNext = function (_outerValue, _innerValue, _outerIndex, _innerIndex, innerSub) {
	        this.openWindow(innerSub);
	    };
	    WindowSubscriber.prototype.notifyError = function (error) {
	        this._error(error);
	    };
	    WindowSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.openWindow(innerSub);
	    };
	    WindowSubscriber.prototype._next = function (value) {
	        this.window.next(value);
	    };
	    WindowSubscriber.prototype._error = function (err) {
	        this.window.error(err);
	        this.destination.error(err);
	        this.unsubscribeClosingNotification();
	    };
	    WindowSubscriber.prototype._complete = function () {
	        this.window.complete();
	        this.destination.complete();
	        this.unsubscribeClosingNotification();
	    };
	    WindowSubscriber.prototype.unsubscribeClosingNotification = function () {
	        if (this.closingNotification) {
	            this.closingNotification.unsubscribe();
	        }
	    };
	    WindowSubscriber.prototype.openWindow = function (innerSub) {
	        if (innerSub === void 0) {
	            innerSub = null;
	        }
	        if (innerSub) {
	            this.remove(innerSub);
	            innerSub.unsubscribe();
	        }
	        var prevWindow = this.window;
	        if (prevWindow) {
	            prevWindow.complete();
	        }
	        var window = this.window = new Subject();
	        this.destination.next(window);
	        var closingNotifier;
	        try {
	            var closingSelector = this.closingSelector;
	            closingNotifier = closingSelector();
	        }
	        catch (e) {
	            this.destination.error(e);
	            this.window.error(e);
	            return;
	        }
	        this.add(this.closingNotification = subscribeToResult(this, closingNotifier));
	    };
	    return WindowSubscriber;
	}(OuterSubscriber));

	/** PURE_IMPORTS_START tslib,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */
	function withLatestFrom() {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i] = arguments[_i];
	    }
	    return function (source) {
	        var project;
	        if (typeof args[args.length - 1] === 'function') {
	            project = args.pop();
	        }
	        var observables = args;
	        return source.lift(new WithLatestFromOperator(observables, project));
	    };
	}
	var WithLatestFromOperator = /*@__PURE__*/ (function () {
	    function WithLatestFromOperator(observables, project) {
	        this.observables = observables;
	        this.project = project;
	    }
	    WithLatestFromOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new WithLatestFromSubscriber(subscriber, this.observables, this.project));
	    };
	    return WithLatestFromOperator;
	}());
	var WithLatestFromSubscriber = /*@__PURE__*/ (function (_super) {
	    __extends(WithLatestFromSubscriber, _super);
	    function WithLatestFromSubscriber(destination, observables, project) {
	        var _this = _super.call(this, destination) || this;
	        _this.observables = observables;
	        _this.project = project;
	        _this.toRespond = [];
	        var len = observables.length;
	        _this.values = new Array(len);
	        for (var i = 0; i < len; i++) {
	            _this.toRespond.push(i);
	        }
	        for (var i = 0; i < len; i++) {
	            var observable = observables[i];
	            _this.add(subscribeToResult(_this, observable, undefined, i));
	        }
	        return _this;
	    }
	    WithLatestFromSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
	        this.values[outerIndex] = innerValue;
	        var toRespond = this.toRespond;
	        if (toRespond.length > 0) {
	            var found = toRespond.indexOf(outerIndex);
	            if (found !== -1) {
	                toRespond.splice(found, 1);
	            }
	        }
	    };
	    WithLatestFromSubscriber.prototype.notifyComplete = function () {
	    };
	    WithLatestFromSubscriber.prototype._next = function (value) {
	        if (this.toRespond.length === 0) {
	            var args = [value].concat(this.values);
	            if (this.project) {
	                this._tryProject(args);
	            }
	            else {
	                this.destination.next(args);
	            }
	        }
	    };
	    WithLatestFromSubscriber.prototype._tryProject = function (args) {
	        var result;
	        try {
	            result = this.project.apply(this, args);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return WithLatestFromSubscriber;
	}(OuterSubscriber));

	/** PURE_IMPORTS_START _observable_zip PURE_IMPORTS_END */
	function zip$1() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    return function zipOperatorFunction(source) {
	        return source.lift.call(zip.apply(void 0, [source].concat(observables)));
	    };
	}

	/** PURE_IMPORTS_START _observable_zip PURE_IMPORTS_END */
	function zipAll(project) {
	    return function (source) { return source.lift(new ZipOperator(project)); };
	}

	/** PURE_IMPORTS_START  PURE_IMPORTS_END */

	var operators = /*#__PURE__*/Object.freeze({
		__proto__: null,
		audit: audit,
		auditTime: auditTime,
		buffer: buffer,
		bufferCount: bufferCount,
		bufferTime: bufferTime,
		bufferToggle: bufferToggle,
		bufferWhen: bufferWhen,
		catchError: catchError,
		combineAll: combineAll,
		combineLatest: combineLatest$1,
		concat: concat$1,
		concatAll: concatAll,
		concatMap: concatMap,
		concatMapTo: concatMapTo,
		count: count,
		debounce: debounce,
		debounceTime: debounceTime,
		defaultIfEmpty: defaultIfEmpty,
		delay: delay,
		delayWhen: delayWhen,
		dematerialize: dematerialize,
		distinct: distinct,
		distinctUntilChanged: distinctUntilChanged,
		distinctUntilKeyChanged: distinctUntilKeyChanged,
		elementAt: elementAt,
		endWith: endWith,
		every: every,
		exhaust: exhaust,
		exhaustMap: exhaustMap,
		expand: expand,
		filter: filter,
		finalize: finalize,
		find: find,
		findIndex: findIndex,
		first: first,
		groupBy: groupBy,
		ignoreElements: ignoreElements,
		isEmpty: isEmpty,
		last: last,
		map: map,
		mapTo: mapTo,
		materialize: materialize,
		max: max,
		merge: merge$1,
		mergeAll: mergeAll,
		mergeMap: mergeMap,
		flatMap: flatMap,
		mergeMapTo: mergeMapTo,
		mergeScan: mergeScan,
		min: min,
		multicast: multicast,
		observeOn: observeOn,
		onErrorResumeNext: onErrorResumeNext$1,
		pairwise: pairwise,
		partition: partition$1,
		pluck: pluck,
		publish: publish,
		publishBehavior: publishBehavior,
		publishLast: publishLast,
		publishReplay: publishReplay,
		race: race$1,
		reduce: reduce,
		repeat: repeat,
		repeatWhen: repeatWhen,
		retry: retry,
		retryWhen: retryWhen,
		refCount: refCount,
		sample: sample,
		sampleTime: sampleTime,
		scan: scan,
		sequenceEqual: sequenceEqual,
		share: share,
		shareReplay: shareReplay,
		single: single,
		skip: skip,
		skipLast: skipLast,
		skipUntil: skipUntil,
		skipWhile: skipWhile,
		startWith: startWith,
		subscribeOn: subscribeOn,
		switchAll: switchAll,
		switchMap: switchMap,
		switchMapTo: switchMapTo,
		take: take,
		takeLast: takeLast,
		takeUntil: takeUntil,
		takeWhile: takeWhile,
		tap: tap,
		throttle: throttle,
		throttleTime: throttleTime,
		throwIfEmpty: throwIfEmpty,
		timeInterval: timeInterval,
		timeout: timeout,
		timeoutWith: timeoutWith,
		timestamp: timestamp,
		toArray: toArray,
		window: window$1,
		windowCount: windowCount,
		windowTime: windowTime,
		windowToggle: windowToggle,
		windowWhen: windowWhen,
		withLatestFrom: withLatestFrom,
		zip: zip$1,
		zipAll: zipAll
	});

	var console_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	const M = BigInt('1000000');
	function consolePrintKVs(kvs) {
	    for (let i = 0; i < kvs.length; i++) {
	        const { key, value } = kvs[i];
	        console.info(`${key}:`, value);
	    }
	}
	function consolePrintEvent(message) {
	    const parts = [];
	    parts.push(new Date(Number(message.timestamp / M)).toISOString().slice(11, -1));
	    if (message.name.length > 0) {
	        parts.push(`[${message.name.join('.')}]`);
	    }
	    parts.push(message.templated.message);
	    const msg = parts.join(' ');
	    if (message.templated.remaining.length > 0) {
	        console.groupCollapsed(msg);
	        consolePrintKVs(message.templated.remaining);
	        console.groupEnd();
	    }
	    else {
	        if (message.level in console) {
	            console[message.level](msg);
	        }
	        else {
	            console.log(msg);
	        }
	    }
	}
	function consolePrint(message) {
	    switch (message.type) {
	        case 'event':
	            return consolePrintEvent(message);
	        case 'span':
	            return consolePrintSpan(message);
	    }
	}
	function consolePrintSpan(span) {
	    console.group(span.label, span.finished != null
	        ? Math.max(Number(span.finished / M), Number(span.started / M)) - Number(span.started / M)
	        : 0, 'ms');
	    const tags = Object.keys(span.attrs)
	        .filter(k => k != null && k !== '')
	        .filter(k => 'number|string|boolean'.indexOf(typeof span.attrs[k]) !== -1)
	        .map(k => ({ key: k, value: span.attrs[k] }))
	        .concat([
	        { key: 'traceId', value: span.spanContext.traceId },
	        { key: 'spanId', value: span.spanContext.spanId }
	    ]);
	    consolePrintKVs(tags);
	    if (span.events.length > 0)
	        console.groupCollapsed('events');
	    span.events.forEach(consolePrint);
	    if (span.events.length > 0)
	        console.groupEnd();
	    console.groupEnd();
	}
	class ConsoleTarget {
	    constructor(acceptIf, noWarn) {
	        this.acceptIf = acceptIf;
	        this.name = 'console';
	        this.noWarn = noWarn != null ? noWarn : false;
	    }
	    log(message) {
	        if (typeof window === 'undefined' && !this.noWarn) {
	            console.warn('Logging with the default ConsoleLogger server-side; consider using req.logger instead, to capture logs better');
	        }
	        consolePrint(message);
	    }
	    run(_, ri) {
	        return ri.messages.pipe(operators.filter(m => this.acceptIf == null ? true : this.acceptIf(m))).subscribe(this.log.bind(this));
	    }
	}
	exports.default = ConsoleTarget;

	});

	unwrapExports(console_1);

	var types$3 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(types$3);

	var LogaryExporter_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });


	class LogaryExporter {
	    constructor(logary) {
	        this.logger = logary.getLogger('Logary');
	    }
	    export(spans, resultCallback) {
	        const msgs = spans.map(dist.SpanMessage.ofReadableSpan);
	        let max = dist.LogLevel.info;
	        for (const m of msgs)
	            max = m.level > max ? m.level : max;
	        this.logger.log(max, ...msgs);
	        resultCallback(src$2.ExportResult.SUCCESS);
	    }
	    shutdown() {
	    }
	}
	exports.default = LogaryExporter;

	});

	unwrapExports(LogaryExporter_1);

	var trace$1 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LogaryExporter = void 0;

	Object.defineProperty(exports, "LogaryExporter", { enumerable: true, get: function () { return __importDefault(LogaryExporter_1).default; } });

	});

	unwrapExports(trace$1);
	var trace_1$1 = trace$1.LogaryExporter;

	const { EventEmitter } = events$1;

	class AbortSignal {
	  constructor() {
	    this.eventEmitter = new EventEmitter();
	    this.onabort = null;
	    this.aborted = false;
	  }
	  toString() {
	    return '[object AbortSignal]'
	  }
	  get [Symbol.toStringTag]() {
	    return 'AbortSignal'
	  }
	  removeEventListener(name, handler) {
	    this.eventEmitter.removeListener(name, handler);
	  }
	  addEventListener(name, handler) {
	    this.eventEmitter.on(name, handler);
	  }
	  dispatchEvent(type) {
	    const event = { type, target: this };
	    const handlerName = `on${type}`;
	    
	    if (typeof this[handlerName] === 'function')
	      this[handlerName](event);

	    this.eventEmitter.emit(type, event);
	  }  
	}
	class AbortController {
	  constructor() {
	    this.signal = new AbortSignal();
	  }
	  abort() {
	    if (this.signal.aborted)
	      return
	    
	    this.signal.aborted = true;
	    this.signal.dispatchEvent('abort');
	  }
	  toString() {
	    return '[object AbortController]'
	  }
	  get [Symbol.toStringTag]() {
	    return 'AbortController'
	  }
	}

	var nodeAbortController = AbortController;
	var default_1 = AbortController;
	nodeAbortController.default = default_1;

	var sendBeacon_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });


	function sendBeacon(url, data) {
	    if (typeof window !== 'undefined' && window.navigator.sendBeacon != null) {
	        return _esm5.of(window.navigator.sendBeacon(url, data));
	    }
	    else {
	        return new _esm5.Observable(o => {
	            const AbortController = nodeAbortController;
	            const controller = new AbortController();
	            const signal = controller.signal;
	            const headers = {
	                'content-type': 'application/json; charset=utf-8',
	                'accept': 'application/json'
	            };
	            fetch(url, { method: 'POST', body: data, signal, headers, keepalive: true })
	                .then(res => res.json())
	                .then(json => {
	                o.next(json);
	                o.complete();
	            })
	                .catch(e => {
	                o.error(e);
	            });
	            return () => {
	                controller.abort();
	            };
	        });
	    }
	}
	exports.default = sendBeacon;

	});

	unwrapExports(sendBeacon_1);

	var rutta = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DefaultConfig = exports.DefaultRuttaEndpoint = void 0;



	const sendBeacon_1$1 = __importDefault(sendBeacon_1);
	exports.DefaultRuttaEndpoint = typeof window === 'undefined'
	    ? process.env.LOGARY_RUTTA_ENDPOINT || 'https://i.logary.tech'
	    : '/i';
	exports.DefaultConfig = {
	    endpoint: exports.DefaultRuttaEndpoint,
	    disabled: false,
	    period: 2000
	};
	const initialDelay = 1000;
	const maxRetries = 4;
	class RuttaTarget {
	    constructor(endpointOrConfig) {
	        this.name = 'rutta';
	        if (endpointOrConfig == null) {
	            this.conf = exports.DefaultConfig;
	        }
	        else if (typeof endpointOrConfig === 'string') {
	            this.conf = Object.assign(Object.assign({}, exports.DefaultConfig), { endpoint: endpointOrConfig });
	        }
	        else {
	            this.conf = Object.assign(Object.assign({}, exports.DefaultConfig), endpointOrConfig);
	        }
	    }
	    run(_, ri) {
	        if (this.conf.disabled) {
	            if (ri.debug)
	                console.log('Skipping Logary Rutta because conf.disabled=true');
	            else
	                console.log('RuttaTarget configured with', this.conf);
	            return () => { };
	        }
	        const beforeunload$ = typeof window !== 'undefined'
	            ? _esm5.fromEvent(window, 'beforeunload').pipe(operators.mapTo('beforeunload'))
	            : _esm5.NEVER;
	        const closingSelector = () => {
	            return _esm5.merge(_esm5.interval(this.conf.period), beforeunload$);
	        };
	        if (ri.debug)
	            console.log('RuttaTarget configured with', this.conf);
	        const sendBatches = ri.messages.pipe(operators.bufferWhen(closingSelector), operators.filter(messages => messages.length > 0), operators.mergeMap(messages => sendBeacon_1$1.default(this.conf.endpoint, JSON.stringify(messages))), operators.retryWhen(errors => errors.pipe(operators.delayWhen((error, i) => {
	            const delay = Math.pow(2, i) * initialDelay;
	            console.log(`Retrying after ${delay} msec...`, error);
	            return _esm5.timer(delay);
	        }), operators.take(maxRetries))));
	        return sendBatches.subscribe();
	    }
	}
	exports.default = RuttaTarget;

	});

	unwrapExports(rutta);
	var rutta_1 = rutta.DefaultConfig;
	var rutta_2 = rutta.DefaultRuttaEndpoint;

	var _null = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	class NullTarget {
	    constructor() {
	        this.name = 'null-target';
	    }
	    log(_) { }
	    run() { return new _esm5.Subscription(); }
	}
	exports.default = NullTarget;

	});

	unwrapExports(_null);

	var stub = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	class StubTarget {
	    constructor() {
	        this.name = 'stub';
	        this.interactions = [];
	        this.messages = [];
	        this.subscription = new _esm5.Subscription(() => {
	            this.interactions.push('unsubscribe');
	        });
	    }
	    run(_, ri) {
	        this.interactions.push('run');
	        this.subscription.add(ri.messages.subscribe(this._handle.bind(this)));
	        return this.subscription;
	    }
	    _handle(message) {
	        this.interactions.push(`received message`);
	        this.messages.push(message);
	    }
	}
	exports.default = StubTarget;

	});

	unwrapExports(stub);

	var targets = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.StubTarget = exports.NullTarget = exports.RuttaTarget = exports.ConsoleTarget = void 0;

	Object.defineProperty(exports, "ConsoleTarget", { enumerable: true, get: function () { return __importDefault(console_1).default; } });

	Object.defineProperty(exports, "RuttaTarget", { enumerable: true, get: function () { return __importDefault(rutta).default; } });

	Object.defineProperty(exports, "NullTarget", { enumerable: true, get: function () { return __importDefault(_null).default; } });

	Object.defineProperty(exports, "StubTarget", { enumerable: true, get: function () { return __importDefault(stub).default; } });

	});

	unwrapExports(targets);
	var targets_1 = targets.StubTarget;
	var targets_2 = targets.NullTarget;
	var targets_3 = targets.RuttaTarget;
	var targets_4 = targets.ConsoleTarget;

	var dist = createCommonjsModule(function (module, exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.setUserProperty = exports.forgetUser = exports.identify = exports.event = exports.fatal = exports.error = exports.warn = exports.info = exports.debug = exports.verbose = exports.getLogary = exports.StubTarget = exports.NullTarget = exports.RuttaTarget = exports.ConsoleTarget = exports.getUserId = exports.createUserId = exports.isMoney = exports.money = exports.LogLevel = exports.SpanMessage = exports.EventMessage = exports.CookieName = void 0;
	const impl_1 = __importDefault(impl);

	const console_1$1 = __importDefault(console_1);
	exports.default = impl_1.default;

	Object.defineProperty(exports, "CookieName", { enumerable: true, get: function () { return config$1.CookieName; } });
	var message_2 = message;
	Object.defineProperty(exports, "EventMessage", { enumerable: true, get: function () { return message_2.EventMessage; } });
	Object.defineProperty(exports, "SpanMessage", { enumerable: true, get: function () { return message_2.SpanMessage; } });
	Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return message_2.LogLevel; } });

	Object.defineProperty(exports, "money", { enumerable: true, get: function () { return __importDefault(money_1).default; } });
	Object.defineProperty(exports, "isMoney", { enumerable: true, get: function () { return money_1.isMoney; } });

	Object.defineProperty(exports, "createUserId", { enumerable: true, get: function () { return __importDefault(createUserId_1).default; } });

	Object.defineProperty(exports, "getUserId", { enumerable: true, get: function () { return __importDefault(getUserId_1).default; } });
	__exportStar(types$3, exports);
	__exportStar(features, exports);
	__exportStar(trace$1, exports);

	Object.defineProperty(exports, "ConsoleTarget", { enumerable: true, get: function () { return targets.ConsoleTarget; } });
	Object.defineProperty(exports, "RuttaTarget", { enumerable: true, get: function () { return targets.RuttaTarget; } });
	Object.defineProperty(exports, "NullTarget", { enumerable: true, get: function () { return targets.NullTarget; } });
	Object.defineProperty(exports, "StubTarget", { enumerable: true, get: function () { return targets.StubTarget; } });
	let instance;
	let sub;
	let logger;
	function getLogary(config, userSupplied) {
	    if (userSupplied != null) {
	        if (sub != null && userSupplied != instance) {
	            sub.unsubscribe();
	            sub = null;
	        }
	        return instance = userSupplied;
	    }
	    if (instance == null) {
	        instance = new impl_1.default(config || {
	            minLevel: message.LogLevel.verbose,
	            serviceName: 'Logary',
	            targets: [
	                new console_1$1.default(),
	            ]
	        });
	        sub = instance.start();
	        logger = instance.getLogger();
	    }
	    return instance;
	}
	exports.getLogary = getLogary;
	function getLogger() {
	    if (logger != null)
	        return logger;
	    const logary = getLogary();
	    return logger = logary.getLogger();
	}
	exports.verbose = (m, ...args) => getLogger().verbose(m, ...args);
	exports.debug = (m, ...args) => getLogger().debug(m, ...args);
	exports.info = (m, ...args) => getLogger().info(m, ...args);
	exports.warn = (m, ...args) => getLogger().warn(m, ...args);
	exports.error = (m, ...args) => getLogger().error(m, ...args);
	exports.fatal = (m, ...args) => getLogger().fatal(m, ...args);
	exports.event = (...args) => getLogger().event(...args);
	exports.identify = (...args) => getLogger().identify(...args);
	exports.forgetUser = (...args) => getLogger().forgetUser(...args);
	exports.setUserProperty = (...args) => getLogger().setUserProperty(...args);

	});

	unwrapExports(dist);
	var dist_1 = dist.setUserProperty;
	var dist_2 = dist.forgetUser;
	var dist_3 = dist.identify;
	var dist_4 = dist.event;
	var dist_5 = dist.fatal;
	var dist_6 = dist.error;
	var dist_7 = dist.warn;
	var dist_8 = dist.info;
	var dist_9 = dist.debug;
	var dist_10 = dist.verbose;
	var dist_11 = dist.getLogary;
	var dist_12 = dist.StubTarget;
	var dist_13 = dist.NullTarget;
	var dist_14 = dist.RuttaTarget;
	var dist_15 = dist.ConsoleTarget;
	var dist_16 = dist.getUserId;
	var dist_17 = dist.createUserId;
	var dist_18 = dist.isMoney;
	var dist_19 = dist.money;
	var dist_20 = dist.LogLevel;
	var dist_21 = dist.SpanMessage;
	var dist_22 = dist.EventMessage;
	var dist_23 = dist.CookieName;

	var features$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.features = exports.WebVitalsFeature = exports.SpanPerNavigationFeature = void 0;

	exports.SpanPerNavigationFeature = 'opentelemetry/span-per-navigation';
	exports.WebVitalsFeature = 'plugins/browser/web-vitals';
	exports.features = [
	    dist.GlobalErrorHandling,
	    dist.GlobalClickHandling,
	    dist.GlobalLocationHandling,
	    dist.UniversalRendering,
	    dist.OpenTelemetryFeature,
	    dist.OpenTelemetryHasTracer,
	    exports.SpanPerNavigationFeature,
	    exports.WebVitalsFeature
	];

	});

	unwrapExports(features$1);
	var features_1$1 = features$1.features;
	var features_2$1 = features$1.WebVitalsFeature;
	var features_3$1 = features$1.SpanPerNavigationFeature;

	var events = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PageViewEventName = exports.LocationChangedToHrefEventName = void 0;
	exports.LocationChangedToHrefEventName = 'Location changed to {href}';
	exports.PageViewEventName = 'Page view';

	});

	unwrapExports(events);
	var events_1 = events.PageViewEventName;
	var events_2 = events.LocationChangedToHrefEventName;

	var t$6,n$1,e$1=function(){return "".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12)},i$2=function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1;return {name:t,value:n,delta:0,entries:[],id:e$1(),isFinal:!1}},a$1=function(t,n){try{if(PerformanceObserver.supportedEntryTypes.includes(t)){var e=new PerformanceObserver((function(t){return t.getEntries().map(n)}));return e.observe({type:t,buffered:!0}),e}}catch(t){}},r$1=!1,o$1=!1,s$1=function(t){r$1=!t.persisted;},u$1=function(){addEventListener("pagehide",s$1),addEventListener("beforeunload",(function(){}));},c$1=function(t){var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];o$1||(u$1(),o$1=!0),addEventListener("visibilitychange",(function(n){var e=n.timeStamp;"hidden"===document.visibilityState&&t({timeStamp:e,isUnloading:r$1});}),{capture:!0,once:n});},l$1=function(t,n,e,i){var a;return function(){e&&n.isFinal&&e.disconnect(),n.value>=0&&(i||n.isFinal||"hidden"===document.visibilityState)&&(n.delta=n.value-(a||0),(n.delta||n.isFinal||void 0===a)&&(t(n),a=n.value));}},p$1=function(t){var n,e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r=i$2("CLS",0),o=function(t){t.hadRecentInput||(r.value+=t.value,r.entries.push(t),n());},s=a$1("layout-shift",o);s&&(n=l$1(t,r,s,e),c$1((function(t){var e=t.isUnloading;s.takeRecords().map(o),e&&(r.isFinal=!0),n();})));},d$1=function(){return void 0===t$6&&(t$6="hidden"===document.visibilityState?0:1/0,c$1((function(n){var e=n.timeStamp;return t$6=e}),!0)),{get timeStamp(){return t$6}}},v$1=function(t){var n,e=i$2("FCP"),r=d$1(),o=a$1("paint",(function(t){"first-contentful-paint"===t.name&&t.startTime<r.timeStamp&&(e.value=t.startTime,e.isFinal=!0,e.entries.push(t),n());}));o&&(n=l$1(t,e,o));},f$1=function(t){var n=i$2("FID"),e=d$1(),r=function(t){t.startTime<e.timeStamp&&(n.value=t.processingStart-t.startTime,n.entries.push(t),n.isFinal=!0,s());},o=a$1("first-input",r),s=l$1(t,n,o);o?c$1((function(){o.takeRecords().map(r),o.disconnect();}),!0):window.perfMetrics&&window.perfMetrics.onFirstInputDelay&&window.perfMetrics.onFirstInputDelay((function(t,i){i.timeStamp<e.timeStamp&&(n.value=t,n.isFinal=!0,n.entries=[{entryType:"first-input",name:i.type,target:i.target,cancelable:i.cancelable,startTime:i.timeStamp,processingStart:i.timeStamp+t}],s());}));},m$1=function(){return n$1||(n$1=new Promise((function(t){return ["scroll","keydown","pointerdown"].map((function(n){addEventListener(n,t,{once:!0,passive:!0,capture:!0});}))}))),n$1},g$1=function(t){var n,e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r=i$2("LCP"),o=d$1(),s=function(t){var e=t.startTime;e<o.timeStamp?(r.value=e,r.entries.push(t)):r.isFinal=!0,n();},u=a$1("largest-contentful-paint",s);if(u){n=l$1(t,r,u,e);var p=function(){r.isFinal||(u.takeRecords().map(s),r.isFinal=!0,n());};m$1().then(p),c$1(p,!0);}},h$1=function(t){var n,e=i$2("TTFB");n=function(){try{var n=performance.getEntriesByType("navigation")[0]||function(){var t=performance.timing,n={entryType:"navigation",startTime:0};for(var e in t)"navigationStart"!==e&&"toJSON"!==e&&(n[e]=Math.max(t[e]-t.navigationStart,0));return n}();e.value=e.delta=n.responseStart,e.entries=[n],e.isFinal=!0,t(e);}catch(t){}},"complete"===document.readyState?setTimeout(n,0):addEventListener("pageshow",n);};

	var webVitals_es5_min = /*#__PURE__*/Object.freeze({
		__proto__: null,
		getCLS: p$1,
		getFCP: v$1,
		getFID: f$1,
		getLCP: g$1,
		getTTFB: h$1
	});

	var monitor_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	function monitor(name, enabled) {
	    return operators.tap(value => {
	        if (enabled)
	            console.log(`${name}$ value: `, value);
	    }, error => {
	        if (enabled)
	            console.log(`${name}$ error: `, error);
	    }, () => {
	        if (enabled)
	            console.log(`${name}$ complete.`);
	    });
	}
	exports.default = monitor;

	});

	unwrapExports(monitor_1);

	var subscribeToBodyMutations_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function subscribeToBodyMutations(observer) {
	    const bodyList = document.querySelector("body");
	    if (bodyList == null)
	        return;
	    observer.observe(bodyList, {
	        childList: true,
	        subtree: true
	    });
	}
	exports.default = subscribeToBodyMutations;

	});

	unwrapExports(subscribeToBodyMutations_1);

	var explode_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function explode(p) {
	    if (p == null)
	        return [];
	    return Array.isArray(p)
	        ? p.map(x => x.toString())
	        : typeof p === 'string'
	            ? p.split(/\n/g)
	            : [String(p)];
	}
	exports.default = explode;

	});

	unwrapExports(explode_1);

	var prop_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function prop(e, debug = false) {
	    return (name, tx) => {
	        const value = e[name];
	        if (value == null)
	            return null;
	        if (tx != null && debug) {
	            console.info('prop in:', value);
	            const o = tx(value);
	            console.info('prop out:', o);
	            return o;
	        }
	        if (tx != null)
	            return tx(value);
	        return value;
	    };
	}
	exports.default = prop;

	});

	unwrapExports(prop_1);

	var stringify_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function stringify(ps) {
	    return Array.isArray(ps)
	        ? ps.map(p => String(p)).join(',')
	        : ps.constructor.name;
	}
	exports.default = stringify;

	});

	unwrapExports(stringify_1);

	var describeTarget_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function tryWriteEventName(target, res) {
	    let attr = null;
	    if ((attr = target.attributes['data-track']) != null
	        && attr.value != null && attr.value !== '') {
	        res['eventName'] = attr.value;
	    }
	}
	function getPartName(target) {
	    const i = [];
	    i.push(target.localName);
	    if (target.attributes['id'] != null)
	        i.push(`#${target.attributes.id.value}`);
	    for (const [_, e] of target.classList.entries())
	        i.push(`.${e}`);
	    return i.join('');
	}
	function describeTarget(event) {
	    let target = event.target;
	    if (target == null)
	        return null;
	    const res = {};
	    if ('innerText' in target && target.innerText != null && target.innerText !== '') {
	        res['text'] = target.innerText.substring(0, 50);
	    }
	    const cssSelector = [];
	    do {
	        if (res['eventName'] == null)
	            tryWriteEventName(target, res);
	        cssSelector.push(getPartName(target));
	    } while ((target = target.parentElement) != null);
	    res['cssSelector'] = cssSelector.reverse().join(' ');
	    return res;
	}
	exports.default = describeTarget;

	});

	unwrapExports(describeTarget_1);

	var utils$1 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.describeTarget = exports.stringify = exports.prop = exports.explode = void 0;

	Object.defineProperty(exports, "explode", { enumerable: true, get: function () { return __importDefault(explode_1).default; } });

	Object.defineProperty(exports, "prop", { enumerable: true, get: function () { return __importDefault(prop_1).default; } });

	Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return __importDefault(stringify_1).default; } });

	Object.defineProperty(exports, "describeTarget", { enumerable: true, get: function () { return __importDefault(describeTarget_1).default; } });

	});

	unwrapExports(utils$1);
	var utils_1$1 = utils$1.describeTarget;
	var utils_2$1 = utils$1.stringify;
	var utils_3$1 = utils$1.prop;
	var utils_4 = utils$1.explode;

	var handleClick = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	function onClick(logary) {
	    const logger = logary.getLogger('plugins', 'browser', 'click');
	    return (e) => {
	        const clicked = utils$1.describeTarget(e);
	        logger.info((clicked === null || clicked === void 0 ? void 0 : clicked.eventName) || 'User clicked "{cssSelector}"', clicked);
	    };
	}
	exports.default = onClick;

	});

	unwrapExports(handleClick);

	var handleError_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	function handleError(logary, opts) {
	    const logger = logary.getLogger('plugins', 'browser', 'error');
	    let lastError = null;
	    return (errEvt) => {
	        if (lastError === errEvt.error)
	            return !opts.doNotMarkErrorHandled;
	        else
	            lastError = errEvt.error;
	        if (!opts.doNotMarkErrorHandled)
	            errEvt.stopPropagation();
	        if (logary.debug)
	            console.error(errEvt);
	        const get = utils$1.prop(errEvt, logary.debug);
	        const fields = {
	            error: {
	                colNo: get('colno'),
	                lineNo: get('lineno'),
	                fileName: get('filename'),
	                message: get('message'),
	                stack: utils$1.explode(errEvt.error.stack),
	                path: get('path', utils$1.stringify)
	            }
	        };
	        logger.error('Unhandled window error: {error.message}', fields);
	        if (logary.debug)
	            console.log('returning ', !opts.doNotMarkErrorHandled, 'from error handler');
	        return !opts.doNotMarkErrorHandled;
	    };
	}
	exports.default = handleError;

	});

	unwrapExports(handleError_1);

	var handlers_1 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });






	const monitor_1$1 = __importDefault(monitor_1);
	const subscribeToBodyMutations_1$1 = __importDefault(subscribeToBodyMutations_1);
	const handleClick_1 = __importDefault(handleClick);
	const handleError_1$1 = __importDefault(handleError_1);
	const handlers = [
	    {
	        name: dist.GlobalErrorHandling,
	        run(logary, opts) {
	            const errorHandler = handleError_1$1.default(logary, opts);
	            window.addEventListener('error', errorHandler);
	            return () => {
	                window.removeEventListener('error', errorHandler);
	            };
	        }
	    },
	    {
	        name: dist.GlobalClickHandling,
	        run(logary, _) {
	            const clickHandler = handleClick_1.default(logary);
	            window.addEventListener('click', clickHandler);
	            return () => {
	                window.removeEventListener('click', clickHandler);
	            };
	        }
	    },
	    {
	        name: dist.GlobalLocationHandling,
	        run(logary, _) {
	            const logger = logary.getLogger('plugins', 'browser', 'location');
	            let oldHref = window.location.href, oldTitle = window.document.title;
	            const observer = new MutationObserver(mutations => {
	                mutations.forEach(() => {
	                    const prevHref = oldHref, prevTitle = oldTitle;
	                    if (oldHref != document.location.href) {
	                        oldHref = document.location.href;
	                        oldTitle = document.title;
	                        logger.info(events.LocationChangedToHrefEventName, {
	                            prevHref,
	                            href: oldHref,
	                            prevTitle,
	                            title: oldTitle
	                        });
	                    }
	                });
	            });
	            const subscribeAfterLoad = () => subscribeToBodyMutations_1$1.default(observer);
	            window.addEventListener('load', subscribeAfterLoad);
	            return () => {
	                window.removeEventListener('load', subscribeAfterLoad);
	                observer.disconnect();
	            };
	        }
	    },
	    {
	        name: features$1.SpanPerNavigationFeature,
	        run(logary, _, tm) {
	            if (logary.debug)
	                console.log(`Starting ${features$1.SpanPerNavigationFeature} concern in @logary/plugin-browser`);
	            const load$ = _esm5.fromEvent(window, 'load').pipe(operators.mapTo('load'));
	            const beforeunload$ = _esm5.fromEvent(window, 'beforeunload').pipe(operators.mapTo('beforeunload'));
	            const navEvent$ = logary.messages.pipe(operators.filter(m => m.type === 'event'), operators.filter(m => m.event === events.LocationChangedToHrefEventName)).pipe(operators.mapTo('navigate'));
	            let cancelled = false;
	            let metrics = [];
	            function handleMetric(metric) {
	                if (cancelled)
	                    return;
	                metrics.push([`webvitals.${metric.name.toLowerCase()}`, metric]);
	            }
	            function writeCapturedMetrics(span) {
	                for (const [metricName, metric] of metrics) {
	                    span.setAttribute(metricName, metric.value);
	                }
	                metrics = [];
	            }
	            webVitals_es5_min.getCLS(handleMetric);
	            webVitals_es5_min.getFCP(handleMetric);
	            webVitals_es5_min.getFID(handleMetric);
	            webVitals_es5_min.getLCP(handleMetric);
	            webVitals_es5_min.getTTFB(handleMetric);
	            const emptyState = { prevEvent: null, span: tm.pageViewSpan };
	            const span$ = _esm5.merge(load$, beforeunload$, navEvent$).pipe(operators.scan(({ span }, event) => {
	                if (span != null && event !== 'load') {
	                    writeCapturedMetrics(span);
	                    span.end();
	                }
	                span = tm.newPageViewSpan();
	                span.setAttributes({
	                    'location.href': window.location.href,
	                    'location.pathname': window.location.pathname,
	                    'document.title': document.title,
	                    'document.clientWidth': Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
	                    'document.clientHeight': Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
	                    'navigator.userAgent': navigator.userAgent,
	                    'navigator.appName': navigator.appName,
	                    'navigator.appVersion': navigator.appVersion,
	                    'device.width': Math.max(window.screen.width, window.screen.availWidth),
	                    'device.height': Math.max(window.screen.height, window.screen.availHeight),
	                });
	                return { span, prevEvent: event };
	            }, emptyState), monitor_1$1.default('span', logary.debug));
	            const sub = span$.subscribe();
	            return () => {
	                sub.unsubscribe();
	                cancelled = true;
	            };
	        }
	    },
	];
	exports.default = handlers;

	});

	unwrapExports(handlers_1);

	var rootViewTracer = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	class TracerWithRootPageView {
	    constructor(inner, plugin) {
	        this.inner = inner;
	        this.plugin = plugin;
	    }
	    getCurrentSpan() {
	        return this.plugin.pageViewSpan || this.inner.getCurrentSpan();
	    }
	    startSpan(name, options, context) {
	        return this.inner.startSpan(name, Object.assign({ parent: this.getCurrentSpan() }, (options || {})), context);
	    }
	    withSpan(span, fn) {
	        return this.inner.withSpan(span, fn);
	    }
	    bind(target, context) {
	        return this.inner.bind(target, context);
	    }
	}
	exports.default = TracerWithRootPageView;

	});

	unwrapExports(rootViewTracer);

	var Span_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Span = void 0;


	/**
	 * This class represents a span.
	 */
	class Span {
	    /** Constructs a new Span instance. */
	    constructor(parentTracer, spanName, spanContext, kind, parentSpanId, links = [], startTime = src$2.hrTime()) {
	        this.attributes = {};
	        this.links = [];
	        this.events = [];
	        this.status = {
	            code: src$1.CanonicalCode.OK,
	        };
	        this.endTime = [0, 0];
	        this._ended = false;
	        this._duration = [-1, -1];
	        this.name = spanName;
	        this.spanContext = spanContext;
	        this.parentSpanId = parentSpanId;
	        this.kind = kind;
	        this.links = links;
	        this.startTime = src$2.timeInputToHrTime(startTime);
	        this.resource = parentTracer.resource;
	        this.instrumentationLibrary = parentTracer.instrumentationLibrary;
	        this._logger = parentTracer.logger;
	        this._traceParams = parentTracer.getActiveTraceParams();
	        this._spanProcessor = parentTracer.getActiveSpanProcessor();
	        this._spanProcessor.onStart(this);
	    }
	    context() {
	        return this.spanContext;
	    }
	    setAttribute(key, value) {
	        if (this._isSpanEnded())
	            return this;
	        if (Object.keys(this.attributes).length >=
	            this._traceParams.numberOfAttributesPerSpan) {
	            const attributeKeyToDelete = Object.keys(this.attributes).shift();
	            if (attributeKeyToDelete) {
	                this._logger.warn(`Dropping extra attributes : ${attributeKeyToDelete}`);
	                delete this.attributes[attributeKeyToDelete];
	            }
	        }
	        this.attributes[key] = value;
	        return this;
	    }
	    setAttributes(attributes) {
	        Object.keys(attributes).forEach(key => {
	            this.setAttribute(key, attributes[key]);
	        });
	        return this;
	    }
	    /**
	     *
	     * @param name Span Name
	     * @param [attributesOrStartTime] Span attributes or start time
	     *     if type is {@type TimeInput} and 3rd param is undefined
	     * @param [startTime] Specified start time for the event
	     */
	    addEvent(name, attributesOrStartTime, startTime) {
	        if (this._isSpanEnded())
	            return this;
	        if (this.events.length >= this._traceParams.numberOfEventsPerSpan) {
	            this._logger.warn('Dropping extra events.');
	            this.events.shift();
	        }
	        if (src$2.isTimeInput(attributesOrStartTime)) {
	            if (typeof startTime === 'undefined') {
	                startTime = attributesOrStartTime;
	            }
	            attributesOrStartTime = undefined;
	        }
	        if (typeof startTime === 'undefined') {
	            startTime = src$2.hrTime();
	        }
	        this.events.push({
	            name,
	            attributes: attributesOrStartTime,
	            time: src$2.timeInputToHrTime(startTime),
	        });
	        return this;
	    }
	    setStatus(status) {
	        if (this._isSpanEnded())
	            return this;
	        this.status = status;
	        return this;
	    }
	    updateName(name) {
	        if (this._isSpanEnded())
	            return this;
	        this.name = name;
	        return this;
	    }
	    end(endTime = src$2.hrTime()) {
	        if (this._isSpanEnded()) {
	            this._logger.error('You can only call end() on a span once.');
	            return;
	        }
	        this._ended = true;
	        this.endTime = src$2.timeInputToHrTime(endTime);
	        this._duration = src$2.hrTimeDuration(this.startTime, this.endTime);
	        if (this._duration[0] < 0) {
	            this._logger.warn('Inconsistent start and end time, startTime > endTime', this.startTime, this.endTime);
	        }
	        this._spanProcessor.onEnd(this);
	    }
	    isRecording() {
	        return true;
	    }
	    get duration() {
	        return this._duration;
	    }
	    get ended() {
	        return this._ended;
	    }
	    _isSpanEnded() {
	        if (this._ended) {
	            this._logger.warn('Can not execute the operation on ended Span {traceId: %s, spanId: %s}', this.spanContext.traceId, this.spanContext.spanId);
	        }
	        return this._ended;
	    }
	}
	exports.Span = Span;

	});

	unwrapExports(Span_1);
	var Span_2 = Span_1.Span;

	var config$2 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DEFAULT_CONFIG = exports.DEFAULT_MAX_LINKS_PER_SPAN = exports.DEFAULT_MAX_ATTRIBUTES_PER_SPAN = exports.DEFAULT_MAX_EVENTS_PER_SPAN = void 0;

	/** Default limit for Message events per span */
	exports.DEFAULT_MAX_EVENTS_PER_SPAN = 128;
	/** Default limit for Attributes per span */
	exports.DEFAULT_MAX_ATTRIBUTES_PER_SPAN = 32;
	/** Default limit for Links per span */
	exports.DEFAULT_MAX_LINKS_PER_SPAN = 32;
	/**
	 * Default configuration. For fields with primitive values, any user-provided
	 * value will override the corresponding default value. For fields with
	 * non-primitive values (like `traceParams`), the user-provided value will be
	 * used to extend the default value.
	 */
	exports.DEFAULT_CONFIG = {
	    logLevel: src$2.getEnv().OTEL_LOG_LEVEL,
	    sampler: new src$2.AlwaysOnSampler(),
	    traceParams: {
	        numberOfAttributesPerSpan: exports.DEFAULT_MAX_ATTRIBUTES_PER_SPAN,
	        numberOfLinksPerSpan: exports.DEFAULT_MAX_LINKS_PER_SPAN,
	        numberOfEventsPerSpan: exports.DEFAULT_MAX_EVENTS_PER_SPAN,
	    },
	};

	});

	unwrapExports(config$2);
	var config_1$1 = config$2.DEFAULT_CONFIG;
	var config_2 = config$2.DEFAULT_MAX_LINKS_PER_SPAN;
	var config_3 = config$2.DEFAULT_MAX_ATTRIBUTES_PER_SPAN;
	var config_4 = config$2.DEFAULT_MAX_EVENTS_PER_SPAN;

	var utility = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.mergeConfig = void 0;


	/**
	 * Function to merge Default configuration (as specified in './config') with
	 * user provided configurations.
	 */
	function mergeConfig(userConfig) {
	    const traceParams = userConfig.traceParams;
	    const otelSamplingProbability = src$2.getEnv().OTEL_SAMPLING_PROBABILITY;
	    const target = Object.assign(config$2.DEFAULT_CONFIG, 
	    // use default AlwaysOnSampler if otelSamplingProbability is 1
	    otelSamplingProbability !== undefined && otelSamplingProbability < 1
	        ? {
	            sampler: new src$2.ParentOrElseSampler(new src$2.ProbabilitySampler(otelSamplingProbability)),
	        }
	        : {}, userConfig);
	    // the user-provided value will be used to extend the default value.
	    if (traceParams) {
	        target.traceParams.numberOfAttributesPerSpan =
	            traceParams.numberOfAttributesPerSpan || config$2.DEFAULT_MAX_ATTRIBUTES_PER_SPAN;
	        target.traceParams.numberOfEventsPerSpan =
	            traceParams.numberOfEventsPerSpan || config$2.DEFAULT_MAX_EVENTS_PER_SPAN;
	        target.traceParams.numberOfLinksPerSpan =
	            traceParams.numberOfLinksPerSpan || config$2.DEFAULT_MAX_LINKS_PER_SPAN;
	    }
	    return target;
	}
	exports.mergeConfig = mergeConfig;

	});

	unwrapExports(utility);
	var utility_1 = utility.mergeConfig;

	var Tracer_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Tracer = void 0;




	/**
	 * This class represents a basic tracer.
	 */
	class Tracer {
	    /**
	     * Constructs a new Tracer instance.
	     */
	    constructor(instrumentationLibrary, config, _tracerProvider) {
	        this._tracerProvider = _tracerProvider;
	        const localConfig = utility.mergeConfig(config);
	        this._sampler = localConfig.sampler;
	        this._traceParams = localConfig.traceParams;
	        this._idGenerator = config.idGenerator || new src$2.RandomIdGenerator();
	        this.resource = _tracerProvider.resource;
	        this.instrumentationLibrary = instrumentationLibrary;
	        this.logger = config.logger || new src$2.ConsoleLogger(config.logLevel);
	    }
	    /**
	     * Starts a new Span or returns the default NoopSpan based on the sampling
	     * decision.
	     */
	    startSpan(name, options = {}, context = src$1.context.active()) {
	        var _a, _b, _c;
	        const parentContext = getParent(options, context);
	        const spanId = this._idGenerator.generateSpanId();
	        let traceId;
	        let traceState;
	        if (!parentContext || !src$2.isValid(parentContext)) {
	            // New root span.
	            traceId = this._idGenerator.generateTraceId();
	        }
	        else {
	            // New child span.
	            traceId = parentContext.traceId;
	            traceState = parentContext.traceState;
	        }
	        const spanKind = (_a = options.kind) !== null && _a !== void 0 ? _a : src$1.SpanKind.INTERNAL;
	        const links = (_b = options.links) !== null && _b !== void 0 ? _b : [];
	        const attributes = (_c = options.attributes) !== null && _c !== void 0 ? _c : {};
	        // make sampling decision
	        const samplingResult = this._sampler.shouldSample(parentContext, traceId, name, spanKind, attributes, links);
	        const traceFlags = samplingResult.decision === src$1.SamplingDecision.RECORD_AND_SAMPLED
	            ? src$1.TraceFlags.SAMPLED
	            : src$1.TraceFlags.NONE;
	        const spanContext = { traceId, spanId, traceFlags, traceState };
	        if (samplingResult.decision === src$1.SamplingDecision.NOT_RECORD) {
	            this.logger.debug('Recording is off, starting no recording span');
	            return new src$2.NoRecordingSpan(spanContext);
	        }
	        const span = new Span_1.Span(this, name, spanContext, spanKind, parentContext ? parentContext.spanId : undefined, links, options.startTime);
	        // Set default attributes
	        span.setAttributes(Object.assign(attributes, samplingResult.attributes));
	        return span;
	    }
	    /**
	     * Returns the current Span from the current context.
	     *
	     * If there is no Span associated with the current context, undefined is returned.
	     */
	    getCurrentSpan() {
	        const ctx = src$1.context.active();
	        // Get the current Span from the context or null if none found.
	        return src$2.getActiveSpan(ctx);
	    }
	    /**
	     * Enters the context of code where the given Span is in the current context.
	     */
	    withSpan(span, fn) {
	        // Set given span to context.
	        return src$1.context.with(src$2.setActiveSpan(src$1.context.active(), span), fn);
	    }
	    /**
	     * Bind a span (or the current one) to the target's context
	     */
	    bind(target, span) {
	        return src$1.context.bind(target, span ? src$2.setActiveSpan(src$1.context.active(), span) : src$1.context.active());
	    }
	    /** Returns the active {@link TraceParams}. */
	    getActiveTraceParams() {
	        return this._traceParams;
	    }
	    getActiveSpanProcessor() {
	        return this._tracerProvider.getActiveSpanProcessor();
	    }
	}
	exports.Tracer = Tracer;
	/**
	 * Get the parent to assign to a started span. If options.parent is null,
	 * do not assign a parent.
	 *
	 * @param options span options
	 * @param context context to check for parent
	 */
	function getParent(options, context) {
	    if (options.parent === null)
	        return undefined;
	    if (options.parent)
	        return getContext(options.parent);
	    return src$2.getParentSpanContext(context);
	}
	function getContext(span) {
	    return isSpan(span) ? span.context() : span;
	}
	function isSpan(span) {
	    return typeof span.context === 'function';
	}

	});

	unwrapExports(Tracer_1);
	var Tracer_2 = Tracer_1.Tracer;

	var MultiSpanProcessor_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MultiSpanProcessor = void 0;
	/**
	 * Implementation of the {@link SpanProcessor} that simply forwards all
	 * received events to a list of {@link SpanProcessor}s.
	 */
	class MultiSpanProcessor {
	    constructor(_spanProcessors) {
	        this._spanProcessors = _spanProcessors;
	    }
	    forceFlush(cb = () => { }) {
	        let finished = 0;
	        const total = this._spanProcessors.length;
	        for (const spanProcessor of this._spanProcessors) {
	            spanProcessor.forceFlush(() => {
	                if (++finished === total) {
	                    cb();
	                }
	            });
	        }
	    }
	    onStart(span) {
	        for (const spanProcessor of this._spanProcessors) {
	            spanProcessor.onStart(span);
	        }
	    }
	    onEnd(span) {
	        for (const spanProcessor of this._spanProcessors) {
	            spanProcessor.onEnd(span);
	        }
	    }
	    shutdown(cb = () => { }) {
	        let finished = 0;
	        const total = this._spanProcessors.length;
	        for (const spanProcessor of this._spanProcessors) {
	            spanProcessor.shutdown(() => {
	                if (++finished === total) {
	                    cb();
	                }
	            });
	        }
	    }
	}
	exports.MultiSpanProcessor = MultiSpanProcessor;

	});

	unwrapExports(MultiSpanProcessor_1);
	var MultiSpanProcessor_2 = MultiSpanProcessor_1.MultiSpanProcessor;

	var NoopSpanProcessor_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NoopSpanProcessor = void 0;
	/** No-op implementation of SpanProcessor */
	class NoopSpanProcessor {
	    onStart(span) { }
	    onEnd(span) { }
	    shutdown(cb = () => { }) {
	        setTimeout(cb, 0);
	    }
	    forceFlush(cb = () => { }) {
	        setTimeout(cb, 0);
	    }
	}
	exports.NoopSpanProcessor = NoopSpanProcessor;

	});

	unwrapExports(NoopSpanProcessor_1);
	var NoopSpanProcessor_2 = NoopSpanProcessor_1.NoopSpanProcessor;

	var constants$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SERVICE_RESOURCE = exports.TELEMETRY_SDK_RESOURCE = exports.K8S_RESOURCE = exports.HOST_RESOURCE = exports.CONTAINER_RESOURCE = exports.CLOUD_RESOURCE = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	exports.CLOUD_RESOURCE = {
	    /** Name of the cloud provider. Example values are aws, azure, gcp. */
	    PROVIDER: 'cloud.provider',
	    /** The cloud account id used to identify different entities. */
	    ACCOUNT_ID: 'cloud.account.id',
	    /** A specific geographical location where different entities can run. */
	    REGION: 'cloud.region',
	    /** Zones are a sub set of the region connected through low-latency links. */
	    ZONE: 'cloud.zone',
	};
	/**
	 * Attributes defining a compute unit (e.g. Container, Process, Lambda
	 * Function).
	 * */
	exports.CONTAINER_RESOURCE = {
	    /** The container name. */
	    NAME: 'container.name',
	    /** The name of the image the container was built on. */
	    IMAGE_NAME: 'container.image.name',
	    /** The container image tag. */
	    IMAGE_TAG: 'container.image.tag',
	};
	/** Attributes defining a computing instance (e.g. host). */
	exports.HOST_RESOURCE = {
	    /**
	     * Hostname of the host. It contains what the hostname command returns on the
	     * host machine.
	     */
	    HOSTNAME: 'host.hostname',
	    /**
	     * Unique host id. For Cloud this must be the instance_id assigned by the
	     * cloud provider
	     */
	    ID: 'host.id',
	    /**
	     * Name of the host. It may contain what hostname returns on Unix systems,
	     * the fully qualified, or a name specified by the user.
	     */
	    NAME: 'host.name',
	    /** Type of host. For Cloud this must be the machine type.*/
	    TYPE: 'host.type',
	    /** Name of the VM image or OS install the host was instantiated from. */
	    IMAGE_NAME: 'host.image.name',
	    /** VM image id. For Cloud, this value is from the provider. */
	    IMAGE_ID: 'host.image.id',
	    /** The version string of the VM image */
	    IMAGE_VERSION: 'host.image.version',
	};
	/** Attributes defining a deployment service (e.g. Kubernetes). */
	exports.K8S_RESOURCE = {
	    /** The name of the cluster that the pod is running in. */
	    CLUSTER_NAME: 'k8s.cluster.name',
	    /** The name of the namespace that the pod is running in. */
	    NAMESPACE_NAME: 'k8s.namespace.name',
	    /** The name of the pod. */
	    POD_NAME: 'k8s.pod.name',
	    /** The name of the deployment. */
	    DEPLOYMENT_NAME: 'k8s.deployment.name',
	};
	/** Attributes describing the telemetry library. */
	exports.TELEMETRY_SDK_RESOURCE = {
	    /** The name of the telemetry library. */
	    NAME: 'telemetry.sdk.name',
	    /** The language of telemetry library and of the code instrumented with it. */
	    LANGUAGE: 'telemetry.sdk.language',
	    /** The version string of the telemetry library */
	    VERSION: 'telemetry.sdk.version',
	};
	/** Attributes describing a service instance. */
	exports.SERVICE_RESOURCE = {
	    /** Logical name of the service.  */
	    NAME: 'service.name',
	    /** A namespace for `service.name`. */
	    NAMESPACE: 'service.namespace',
	    /** The string ID of the service instance. */
	    INSTANCE_ID: 'service.instance.id',
	    /** The version string of the service API or implementation. */
	    VERSION: 'service.version',
	};

	});

	unwrapExports(constants$1);
	var constants_1 = constants$1.SERVICE_RESOURCE;
	var constants_2 = constants$1.TELEMETRY_SDK_RESOURCE;
	var constants_3 = constants$1.K8S_RESOURCE;
	var constants_4 = constants$1.HOST_RESOURCE;
	var constants_5 = constants$1.CONTAINER_RESOURCE;
	var constants_6 = constants$1.CLOUD_RESOURCE;

	var Resource_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Resource = void 0;


	/**
	 * A Resource describes the entity for which a signals (metrics or trace) are
	 * collected.
	 */
	class Resource {
	    constructor(
	    /**
	     * A dictionary of labels with string keys and values that provide information
	     * about the entity as numbers, strings or booleans
	     * TODO: Consider to add check/validation on labels.
	     */
	    labels) {
	        this.labels = labels;
	    }
	    /**
	     * Returns an empty Resource
	     */
	    static empty() {
	        return Resource.EMPTY;
	    }
	    /**
	     * Returns a Resource that indentifies the SDK in use.
	     */
	    static createTelemetrySDKResource() {
	        return new Resource({
	            [constants$1.TELEMETRY_SDK_RESOURCE.LANGUAGE]: src$2.SDK_INFO.LANGUAGE,
	            [constants$1.TELEMETRY_SDK_RESOURCE.NAME]: src$2.SDK_INFO.NAME,
	            [constants$1.TELEMETRY_SDK_RESOURCE.VERSION]: src$2.SDK_INFO.VERSION,
	        });
	    }
	    /**
	     * Returns a new, merged {@link Resource} by merging the current Resource
	     * with the other Resource. In case of a collision, current Resource takes
	     * precedence.
	     *
	     * @param other the Resource that will be merged with this.
	     * @returns the newly merged Resource.
	     */
	    merge(other) {
	        if (!other || !Object.keys(other.labels).length)
	            return this;
	        // Labels from resource overwrite labels from other resource.
	        const mergedLabels = Object.assign({}, other.labels, this.labels);
	        return new Resource(mergedLabels);
	    }
	}
	exports.Resource = Resource;
	Resource.EMPTY = new Resource({});

	});

	unwrapExports(Resource_1);
	var Resource_2 = Resource_1.Resource;

	var AwsEc2Detector_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.awsEc2Detector = void 0;



	/**
	 * The AwsEc2Detector can be used to detect if a process is running in AWS EC2
	 * and return a {@link Resource} populated with metadata about the EC2
	 * instance. Returns an empty Resource if detection fails.
	 */
	class AwsEc2Detector {
	    constructor() {
	        /**
	         * See https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-identity-documents.html
	         * for documentation about the AWS instance identity document endpoint.
	         */
	        this.AWS_INSTANCE_IDENTITY_DOCUMENT_URI = 'http://169.254.169.254/latest/dynamic/instance-identity/document';
	    }
	    /**
	     * Attempts to connect and obtain an AWS instance Identity document. If the
	     * connection is succesful it returns a promise containing a {@link Resource}
	     * populated with instance metadata as labels. Returns a promise containing an
	     * empty {@link Resource} if the connection or parsing of the identity
	     * document fails.
	     *
	     * @param config The resource detection config with a required logger
	     */
	    async detect(config) {
	        try {
	            const { accountId, instanceId, instanceType, region, availabilityZone, } = await this._awsMetadataAccessor();
	            return new Resource_1.Resource({
	                [constants$1.CLOUD_RESOURCE.PROVIDER]: 'aws',
	                [constants$1.CLOUD_RESOURCE.ACCOUNT_ID]: accountId,
	                [constants$1.CLOUD_RESOURCE.REGION]: region,
	                [constants$1.CLOUD_RESOURCE.ZONE]: availabilityZone,
	                [constants$1.HOST_RESOURCE.ID]: instanceId,
	                [constants$1.HOST_RESOURCE.TYPE]: instanceType,
	            });
	        }
	        catch (e) {
	            config.logger.debug(`AwsEc2Detector failed: ${e.message}`);
	            return Resource_1.Resource.empty();
	        }
	    }
	    /**
	     * Establishes an HTTP connection to AWS instance identity document url.
	     * If the application is running on an EC2 instance, we should be able
	     * to get back a valid JSON document. Parses that document and stores
	     * the identity properties in a local map.
	     */
	    async _awsMetadataAccessor() {
	        return new Promise((resolve, reject) => {
	            const timeoutId = setTimeout(() => {
	                req.abort();
	                reject(new Error('EC2 metadata api request timed out.'));
	            }, 1000);
	            const req = http$1.get(this.AWS_INSTANCE_IDENTITY_DOCUMENT_URI, res => {
	                clearTimeout(timeoutId);
	                const { statusCode } = res;
	                res.setEncoding('utf8');
	                let rawData = '';
	                res.on('data', chunk => (rawData += chunk));
	                res.on('end', () => {
	                    if (statusCode && statusCode >= 200 && statusCode < 300) {
	                        try {
	                            resolve(JSON.parse(rawData));
	                        }
	                        catch (e) {
	                            reject(e);
	                        }
	                    }
	                    else {
	                        reject(new Error('Failed to load page, status code: ' + statusCode));
	                    }
	                });
	            });
	            req.on('error', err => {
	                clearTimeout(timeoutId);
	                reject(err);
	            });
	        });
	    }
	}
	exports.awsEc2Detector = new AwsEc2Detector();

	});

	unwrapExports(AwsEc2Detector_1);
	var AwsEc2Detector_2 = AwsEc2Detector_1.awsEc2Detector;

	var EnvDetector_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.envDetector = void 0;

	/**
	 * EnvDetector can be used to detect the presence of and create a Resource
	 * from the OTEL_RESOURCE_LABELS environment variable.
	 */
	class EnvDetector {
	    constructor() {
	        // Type, label keys, and label values should not exceed 256 characters.
	        this._MAX_LENGTH = 255;
	        // OTEL_RESOURCE_LABELS is a comma-separated list of labels.
	        this._COMMA_SEPARATOR = ',';
	        // OTEL_RESOURCE_LABELS contains key value pair separated by '='.
	        this._LABEL_KEY_VALUE_SPLITTER = '=';
	        this._ERROR_MESSAGE_INVALID_CHARS = 'should be a ASCII string with a length greater than 0 and not exceed ' +
	            this._MAX_LENGTH +
	            ' characters.';
	        this._ERROR_MESSAGE_INVALID_VALUE = 'should be a ASCII string with a length not exceed ' +
	            this._MAX_LENGTH +
	            ' characters.';
	    }
	    /**
	     * Returns a {@link Resource} populated with labels from the
	     * OTEL_RESOURCE_LABELS environment variable. Note this is an async function
	     * to conform to the Detector interface.
	     *
	     * @param config The resource detection config with a required logger
	     */
	    async detect(config) {
	        try {
	            const labelString = process.env.OTEL_RESOURCE_LABELS;
	            if (!labelString) {
	                config.logger.debug('EnvDetector failed: Environment variable "OTEL_RESOURCE_LABELS" is missing.');
	                return Resource_1.Resource.empty();
	            }
	            const labels = this._parseResourceLabels(process.env.OTEL_RESOURCE_LABELS);
	            return new Resource_1.Resource(labels);
	        }
	        catch (e) {
	            config.logger.debug(`EnvDetector failed: ${e.message}`);
	            return Resource_1.Resource.empty();
	        }
	    }
	    /**
	     * Creates a label map from the OTEL_RESOURCE_LABELS environment variable.
	     *
	     * OTEL_RESOURCE_LABELS: A comma-separated list of labels describing the
	     * source in more detail, e.g. “key1=val1,key2=val2”. Domain names and paths
	     * are accepted as label keys. Values may be quoted or unquoted in general. If
	     * a value contains whitespaces, =, or " characters, it must always be quoted.
	     *
	     * @param rawEnvLabels The resource labels as a comma-seperated list
	     * of key/value pairs.
	     * @returns The sanitized resource labels.
	     */
	    _parseResourceLabels(rawEnvLabels) {
	        if (!rawEnvLabels)
	            return {};
	        const labels = {};
	        const rawLabels = rawEnvLabels.split(this._COMMA_SEPARATOR, -1);
	        for (const rawLabel of rawLabels) {
	            const keyValuePair = rawLabel.split(this._LABEL_KEY_VALUE_SPLITTER, -1);
	            if (keyValuePair.length !== 2) {
	                continue;
	            }
	            let [key, value] = keyValuePair;
	            // Leading and trailing whitespaces are trimmed.
	            key = key.trim();
	            value = value.trim().split('^"|"$').join('');
	            if (!this._isValidAndNotEmpty(key)) {
	                throw new Error(`Label key ${this._ERROR_MESSAGE_INVALID_CHARS}`);
	            }
	            if (!this._isValid(value)) {
	                throw new Error(`Label value ${this._ERROR_MESSAGE_INVALID_VALUE}`);
	            }
	            labels[key] = value;
	        }
	        return labels;
	    }
	    /**
	     * Determines whether the given String is a valid printable ASCII string with
	     * a length not exceed _MAX_LENGTH characters.
	     *
	     * @param str The String to be validated.
	     * @returns Whether the String is valid.
	     */
	    _isValid(name) {
	        return name.length <= this._MAX_LENGTH && this._isPrintableString(name);
	    }
	    _isPrintableString(str) {
	        for (let i = 0; i < str.length; i++) {
	            const ch = str.charAt(i);
	            if (ch <= ' ' || ch >= '~') {
	                return false;
	            }
	        }
	        return true;
	    }
	    /**
	     * Determines whether the given String is a valid printable ASCII string with
	     * a length greater than 0 and not exceed _MAX_LENGTH characters.
	     *
	     * @param str The String to be validated.
	     * @returns Whether the String is valid and not empty.
	     */
	    _isValidAndNotEmpty(str) {
	        return str.length > 0 && this._isValid(str);
	    }
	}
	exports.envDetector = new EnvDetector();

	});

	unwrapExports(EnvDetector_1);
	var EnvDetector_2 = EnvDetector_1.envDetector;

	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var defineProperty = Object.defineProperty;
	var gOPD = Object.getOwnPropertyDescriptor;

	var isArray$1 = function isArray(arr) {
		if (typeof Array.isArray === 'function') {
			return Array.isArray(arr);
		}

		return toStr.call(arr) === '[object Array]';
	};

	var isPlainObject = function isPlainObject(obj) {
		if (!obj || toStr.call(obj) !== '[object Object]') {
			return false;
		}

		var hasOwnConstructor = hasOwn.call(obj, 'constructor');
		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
		// Not own constructor property must be Object
		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		var key;
		for (key in obj) { /**/ }

		return typeof key === 'undefined' || hasOwn.call(obj, key);
	};

	// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
	var setProperty = function setProperty(target, options) {
		if (defineProperty && options.name === '__proto__') {
			defineProperty(target, options.name, {
				enumerable: true,
				configurable: true,
				value: options.newValue,
				writable: true
			});
		} else {
			target[options.name] = options.newValue;
		}
	};

	// Return undefined instead of __proto__ if '__proto__' is not an own property
	var getProperty = function getProperty(obj, name) {
		if (name === '__proto__') {
			if (!hasOwn.call(obj, name)) {
				return void 0;
			} else if (gOPD) {
				// In early versions of node, obj['__proto__'] is buggy when obj has
				// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
				return gOPD(obj, name).value;
			}
		}

		return obj[name];
	};

	var extend = function extend() {
		var options, name, src, copy, copyIsArray, clone;
		var target = arguments[0];
		var i = 1;
		var length = arguments.length;
		var deep = false;

		// Handle a deep copy situation
		if (typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
		if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
			target = {};
		}

		for (; i < length; ++i) {
			options = arguments[i];
			// Only deal with non-null/undefined values
			if (options != null) {
				// Extend the base object
				for (name in options) {
					src = getProperty(target, name);
					copy = getProperty(options, name);

					// Prevent never-ending loop
					if (target !== copy) {
						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray$1(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray$1(src) ? src : [];
							} else {
								clone = src && isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

						// Don't bring in undefined values
						} else if (typeof copy !== 'undefined') {
							setProperty(target, { name: name, newValue: copy });
						}
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

	// fix for "Readable" isn't a named export issue
	const Readable = Stream.Readable;

	const BUFFER = Symbol('buffer');
	const TYPE = Symbol('type');

	class Blob {
		constructor() {
			this[TYPE] = '';

			const blobParts = arguments[0];
			const options = arguments[1];

			const buffers = [];
			let size = 0;

			if (blobParts) {
				const a = blobParts;
				const length = Number(a.length);
				for (let i = 0; i < length; i++) {
					const element = a[i];
					let buffer;
					if (element instanceof Buffer) {
						buffer = element;
					} else if (ArrayBuffer.isView(element)) {
						buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
					} else if (element instanceof ArrayBuffer) {
						buffer = Buffer.from(element);
					} else if (element instanceof Blob) {
						buffer = element[BUFFER];
					} else {
						buffer = Buffer.from(typeof element === 'string' ? element : String(element));
					}
					size += buffer.length;
					buffers.push(buffer);
				}
			}

			this[BUFFER] = Buffer.concat(buffers);

			let type = options && options.type !== undefined && String(options.type).toLowerCase();
			if (type && !/[^\u0020-\u007E]/.test(type)) {
				this[TYPE] = type;
			}
		}
		get size() {
			return this[BUFFER].length;
		}
		get type() {
			return this[TYPE];
		}
		text() {
			return Promise.resolve(this[BUFFER].toString());
		}
		arrayBuffer() {
			const buf = this[BUFFER];
			const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
			return Promise.resolve(ab);
		}
		stream() {
			const readable = new Readable();
			readable._read = function () {};
			readable.push(this[BUFFER]);
			readable.push(null);
			return readable;
		}
		toString() {
			return '[object Blob]';
		}
		slice() {
			const size = this.size;

			const start = arguments[0];
			const end = arguments[1];
			let relativeStart, relativeEnd;
			if (start === undefined) {
				relativeStart = 0;
			} else if (start < 0) {
				relativeStart = Math.max(size + start, 0);
			} else {
				relativeStart = Math.min(start, size);
			}
			if (end === undefined) {
				relativeEnd = size;
			} else if (end < 0) {
				relativeEnd = Math.max(size + end, 0);
			} else {
				relativeEnd = Math.min(end, size);
			}
			const span = Math.max(relativeEnd - relativeStart, 0);

			const buffer = this[BUFFER];
			const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
			const blob = new Blob([], { type: arguments[2] });
			blob[BUFFER] = slicedBuffer;
			return blob;
		}
	}

	Object.defineProperties(Blob.prototype, {
		size: { enumerable: true },
		type: { enumerable: true },
		slice: { enumerable: true }
	});

	Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
		value: 'Blob',
		writable: false,
		enumerable: false,
		configurable: true
	});

	/**
	 * fetch-error.js
	 *
	 * FetchError interface for operational errors
	 */

	/**
	 * Create FetchError instance
	 *
	 * @param   String      message      Error message for human
	 * @param   String      type         Error type for machine
	 * @param   String      systemError  For Node.js system error
	 * @return  FetchError
	 */
	function FetchError(message, type, systemError) {
	  Error.call(this, message);

	  this.message = message;
	  this.type = type;

	  // when err.type is `system`, err.code contains system error code
	  if (systemError) {
	    this.code = this.errno = systemError.code;
	  }

	  // hide custom error implementation details from end-users
	  Error.captureStackTrace(this, this.constructor);
	}

	FetchError.prototype = Object.create(Error.prototype);
	FetchError.prototype.constructor = FetchError;
	FetchError.prototype.name = 'FetchError';

	let convert;
	try {
		convert = require('encoding').convert;
	} catch (e) {}

	const INTERNALS = Symbol('Body internals');

	// fix an issue where "PassThrough" isn't a named export for node <10
	const PassThrough = Stream.PassThrough;

	/**
	 * Body mixin
	 *
	 * Ref: https://fetch.spec.whatwg.org/#body
	 *
	 * @param   Stream  body  Readable stream
	 * @param   Object  opts  Response options
	 * @return  Void
	 */
	function Body(body) {
		var _this = this;

		var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    _ref$size = _ref.size;

		let size = _ref$size === undefined ? 0 : _ref$size;
		var _ref$timeout = _ref.timeout;
		let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

		if (body == null) {
			// body is undefined or null
			body = null;
		} else if (isURLSearchParams(body)) {
			// body is a URLSearchParams
			body = Buffer.from(body.toString());
		} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
			// body is ArrayBuffer
			body = Buffer.from(body);
		} else if (ArrayBuffer.isView(body)) {
			// body is ArrayBufferView
			body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
		} else if (body instanceof Stream) ; else {
			// none of the above
			// coerce to string then buffer
			body = Buffer.from(String(body));
		}
		this[INTERNALS] = {
			body,
			disturbed: false,
			error: null
		};
		this.size = size;
		this.timeout = timeout;

		if (body instanceof Stream) {
			body.on('error', function (err) {
				const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
				_this[INTERNALS].error = error;
			});
		}
	}

	Body.prototype = {
		get body() {
			return this[INTERNALS].body;
		},

		get bodyUsed() {
			return this[INTERNALS].disturbed;
		},

		/**
	  * Decode response as ArrayBuffer
	  *
	  * @return  Promise
	  */
		arrayBuffer() {
			return consumeBody.call(this).then(function (buf) {
				return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
			});
		},

		/**
	  * Return raw response as Blob
	  *
	  * @return Promise
	  */
		blob() {
			let ct = this.headers && this.headers.get('content-type') || '';
			return consumeBody.call(this).then(function (buf) {
				return Object.assign(
				// Prevent copying
				new Blob([], {
					type: ct.toLowerCase()
				}), {
					[BUFFER]: buf
				});
			});
		},

		/**
	  * Decode response as json
	  *
	  * @return  Promise
	  */
		json() {
			var _this2 = this;

			return consumeBody.call(this).then(function (buffer) {
				try {
					return JSON.parse(buffer.toString());
				} catch (err) {
					return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
				}
			});
		},

		/**
	  * Decode response as text
	  *
	  * @return  Promise
	  */
		text() {
			return consumeBody.call(this).then(function (buffer) {
				return buffer.toString();
			});
		},

		/**
	  * Decode response as buffer (non-spec api)
	  *
	  * @return  Promise
	  */
		buffer() {
			return consumeBody.call(this);
		},

		/**
	  * Decode response as text, while automatically detecting the encoding and
	  * trying to decode to UTF-8 (non-spec api)
	  *
	  * @return  Promise
	  */
		textConverted() {
			var _this3 = this;

			return consumeBody.call(this).then(function (buffer) {
				return convertBody(buffer, _this3.headers);
			});
		}
	};

	// In browsers, all properties are enumerable.
	Object.defineProperties(Body.prototype, {
		body: { enumerable: true },
		bodyUsed: { enumerable: true },
		arrayBuffer: { enumerable: true },
		blob: { enumerable: true },
		json: { enumerable: true },
		text: { enumerable: true }
	});

	Body.mixIn = function (proto) {
		for (const name of Object.getOwnPropertyNames(Body.prototype)) {
			// istanbul ignore else: future proof
			if (!(name in proto)) {
				const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
				Object.defineProperty(proto, name, desc);
			}
		}
	};

	/**
	 * Consume and convert an entire Body to a Buffer.
	 *
	 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
	 *
	 * @return  Promise
	 */
	function consumeBody() {
		var _this4 = this;

		if (this[INTERNALS].disturbed) {
			return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
		}

		this[INTERNALS].disturbed = true;

		if (this[INTERNALS].error) {
			return Body.Promise.reject(this[INTERNALS].error);
		}

		let body = this.body;

		// body is null
		if (body === null) {
			return Body.Promise.resolve(Buffer.alloc(0));
		}

		// body is blob
		if (isBlob(body)) {
			body = body.stream();
		}

		// body is buffer
		if (Buffer.isBuffer(body)) {
			return Body.Promise.resolve(body);
		}

		// istanbul ignore if: should never happen
		if (!(body instanceof Stream)) {
			return Body.Promise.resolve(Buffer.alloc(0));
		}

		// body is stream
		// get ready to actually consume the body
		let accum = [];
		let accumBytes = 0;
		let abort = false;

		return new Body.Promise(function (resolve, reject) {
			let resTimeout;

			// allow timeout on slow response body
			if (_this4.timeout) {
				resTimeout = setTimeout(function () {
					abort = true;
					reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
				}, _this4.timeout);
			}

			// handle stream errors
			body.on('error', function (err) {
				if (err.name === 'AbortError') {
					// if the request was aborted, reject with this Error
					abort = true;
					reject(err);
				} else {
					// other errors, such as incorrect content-encoding
					reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
				}
			});

			body.on('data', function (chunk) {
				if (abort || chunk === null) {
					return;
				}

				if (_this4.size && accumBytes + chunk.length > _this4.size) {
					abort = true;
					reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
					return;
				}

				accumBytes += chunk.length;
				accum.push(chunk);
			});

			body.on('end', function () {
				if (abort) {
					return;
				}

				clearTimeout(resTimeout);

				try {
					resolve(Buffer.concat(accum, accumBytes));
				} catch (err) {
					// handle streams that have accumulated too much data (issue #414)
					reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
				}
			});
		});
	}

	/**
	 * Detect buffer encoding and convert to target encoding
	 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
	 *
	 * @param   Buffer  buffer    Incoming buffer
	 * @param   String  encoding  Target encoding
	 * @return  String
	 */
	function convertBody(buffer, headers) {
		if (typeof convert !== 'function') {
			throw new Error('The package `encoding` must be installed to use the textConverted() function');
		}

		const ct = headers.get('content-type');
		let charset = 'utf-8';
		let res, str;

		// header
		if (ct) {
			res = /charset=([^;]*)/i.exec(ct);
		}

		// no charset in content type, peek at response body for at most 1024 bytes
		str = buffer.slice(0, 1024).toString();

		// html5
		if (!res && str) {
			res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
		}

		// html4
		if (!res && str) {
			res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
			if (!res) {
				res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
				if (res) {
					res.pop(); // drop last quote
				}
			}

			if (res) {
				res = /charset=(.*)/i.exec(res.pop());
			}
		}

		// xml
		if (!res && str) {
			res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
		}

		// found charset
		if (res) {
			charset = res.pop();

			// prevent decode issues when sites use incorrect encoding
			// ref: https://hsivonen.fi/encoding-menu/
			if (charset === 'gb2312' || charset === 'gbk') {
				charset = 'gb18030';
			}
		}

		// turn raw buffers into a single utf-8 buffer
		return convert(buffer, 'UTF-8', charset).toString();
	}

	/**
	 * Detect a URLSearchParams object
	 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
	 *
	 * @param   Object  obj     Object to detect by type or brand
	 * @return  String
	 */
	function isURLSearchParams(obj) {
		// Duck-typing as a necessary condition.
		if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
			return false;
		}

		// Brand-checking and more duck-typing as optional condition.
		return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
	}

	/**
	 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
	 * @param  {*} obj
	 * @return {boolean}
	 */
	function isBlob(obj) {
		return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
	}

	/**
	 * Clone body given Res/Req instance
	 *
	 * @param   Mixed  instance  Response or Request instance
	 * @return  Mixed
	 */
	function clone(instance) {
		let p1, p2;
		let body = instance.body;

		// don't allow cloning a used body
		if (instance.bodyUsed) {
			throw new Error('cannot clone body after it is used');
		}

		// check that body is a stream and not form-data object
		// note: we can't clone the form-data object without having it as a dependency
		if (body instanceof Stream && typeof body.getBoundary !== 'function') {
			// tee instance body
			p1 = new PassThrough();
			p2 = new PassThrough();
			body.pipe(p1);
			body.pipe(p2);
			// set instance body to teed body and return the other teed body
			instance[INTERNALS].body = p1;
			body = p2;
		}

		return body;
	}

	/**
	 * Performs the operation "extract a `Content-Type` value from |object|" as
	 * specified in the specification:
	 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
	 *
	 * This function assumes that instance.body is present.
	 *
	 * @param   Mixed  instance  Any options.body input
	 */
	function extractContentType(body) {
		if (body === null) {
			// body is null
			return null;
		} else if (typeof body === 'string') {
			// body is string
			return 'text/plain;charset=UTF-8';
		} else if (isURLSearchParams(body)) {
			// body is a URLSearchParams
			return 'application/x-www-form-urlencoded;charset=UTF-8';
		} else if (isBlob(body)) {
			// body is blob
			return body.type || null;
		} else if (Buffer.isBuffer(body)) {
			// body is buffer
			return null;
		} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
			// body is ArrayBuffer
			return null;
		} else if (ArrayBuffer.isView(body)) {
			// body is ArrayBufferView
			return null;
		} else if (typeof body.getBoundary === 'function') {
			// detect form data input from form-data module
			return `multipart/form-data;boundary=${body.getBoundary()}`;
		} else if (body instanceof Stream) {
			// body is stream
			// can't really do much about this
			return null;
		} else {
			// Body constructor defaults other things to string
			return 'text/plain;charset=UTF-8';
		}
	}

	/**
	 * The Fetch Standard treats this as if "total bytes" is a property on the body.
	 * For us, we have to explicitly get it with a function.
	 *
	 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
	 *
	 * @param   Body    instance   Instance of Body
	 * @return  Number?            Number of bytes, or null if not possible
	 */
	function getTotalBytes(instance) {
		const body = instance.body;


		if (body === null) {
			// body is null
			return 0;
		} else if (isBlob(body)) {
			return body.size;
		} else if (Buffer.isBuffer(body)) {
			// body is buffer
			return body.length;
		} else if (body && typeof body.getLengthSync === 'function') {
			// detect form data input from form-data module
			if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
			body.hasKnownLength && body.hasKnownLength()) {
				// 2.x
				return body.getLengthSync();
			}
			return null;
		} else {
			// body is stream
			return null;
		}
	}

	/**
	 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
	 *
	 * @param   Body    instance   Instance of Body
	 * @return  Void
	 */
	function writeToStream(dest, instance) {
		const body = instance.body;


		if (body === null) {
			// body is null
			dest.end();
		} else if (isBlob(body)) {
			body.stream().pipe(dest);
		} else if (Buffer.isBuffer(body)) {
			// body is buffer
			dest.write(body);
			dest.end();
		} else {
			// body is stream
			body.pipe(dest);
		}
	}

	// expose Promise
	Body.Promise = global.Promise;

	/**
	 * headers.js
	 *
	 * Headers class offers convenient helpers
	 */

	const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
	const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

	function validateName(name) {
		name = `${name}`;
		if (invalidTokenRegex.test(name) || name === '') {
			throw new TypeError(`${name} is not a legal HTTP header name`);
		}
	}

	function validateValue(value) {
		value = `${value}`;
		if (invalidHeaderCharRegex.test(value)) {
			throw new TypeError(`${value} is not a legal HTTP header value`);
		}
	}

	/**
	 * Find the key in the map object given a header name.
	 *
	 * Returns undefined if not found.
	 *
	 * @param   String  name  Header name
	 * @return  String|Undefined
	 */
	function find$1(map, name) {
		name = name.toLowerCase();
		for (const key in map) {
			if (key.toLowerCase() === name) {
				return key;
			}
		}
		return undefined;
	}

	const MAP = Symbol('map');
	class Headers {
		/**
	  * Headers class
	  *
	  * @param   Object  headers  Response headers
	  * @return  Void
	  */
		constructor() {
			let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

			this[MAP] = Object.create(null);

			if (init instanceof Headers) {
				const rawHeaders = init.raw();
				const headerNames = Object.keys(rawHeaders);

				for (const headerName of headerNames) {
					for (const value of rawHeaders[headerName]) {
						this.append(headerName, value);
					}
				}

				return;
			}

			// We don't worry about converting prop to ByteString here as append()
			// will handle it.
			if (init == null) ; else if (typeof init === 'object') {
				const method = init[Symbol.iterator];
				if (method != null) {
					if (typeof method !== 'function') {
						throw new TypeError('Header pairs must be iterable');
					}

					// sequence<sequence<ByteString>>
					// Note: per spec we have to first exhaust the lists then process them
					const pairs = [];
					for (const pair of init) {
						if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
							throw new TypeError('Each header pair must be iterable');
						}
						pairs.push(Array.from(pair));
					}

					for (const pair of pairs) {
						if (pair.length !== 2) {
							throw new TypeError('Each header pair must be a name/value tuple');
						}
						this.append(pair[0], pair[1]);
					}
				} else {
					// record<ByteString, ByteString>
					for (const key of Object.keys(init)) {
						const value = init[key];
						this.append(key, value);
					}
				}
			} else {
				throw new TypeError('Provided initializer must be an object');
			}
		}

		/**
	  * Return combined header value given name
	  *
	  * @param   String  name  Header name
	  * @return  Mixed
	  */
		get(name) {
			name = `${name}`;
			validateName(name);
			const key = find$1(this[MAP], name);
			if (key === undefined) {
				return null;
			}

			return this[MAP][key].join(', ');
		}

		/**
	  * Iterate over all headers
	  *
	  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
	  * @param   Boolean   thisArg   `this` context for callback function
	  * @return  Void
	  */
		forEach(callback) {
			let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

			let pairs = getHeaders(this);
			let i = 0;
			while (i < pairs.length) {
				var _pairs$i = pairs[i];
				const name = _pairs$i[0],
				      value = _pairs$i[1];

				callback.call(thisArg, value, name, this);
				pairs = getHeaders(this);
				i++;
			}
		}

		/**
	  * Overwrite header values given name
	  *
	  * @param   String  name   Header name
	  * @param   String  value  Header value
	  * @return  Void
	  */
		set(name, value) {
			name = `${name}`;
			value = `${value}`;
			validateName(name);
			validateValue(value);
			const key = find$1(this[MAP], name);
			this[MAP][key !== undefined ? key : name] = [value];
		}

		/**
	  * Append a value onto existing header
	  *
	  * @param   String  name   Header name
	  * @param   String  value  Header value
	  * @return  Void
	  */
		append(name, value) {
			name = `${name}`;
			value = `${value}`;
			validateName(name);
			validateValue(value);
			const key = find$1(this[MAP], name);
			if (key !== undefined) {
				this[MAP][key].push(value);
			} else {
				this[MAP][name] = [value];
			}
		}

		/**
	  * Check for header name existence
	  *
	  * @param   String   name  Header name
	  * @return  Boolean
	  */
		has(name) {
			name = `${name}`;
			validateName(name);
			return find$1(this[MAP], name) !== undefined;
		}

		/**
	  * Delete all header values given name
	  *
	  * @param   String  name  Header name
	  * @return  Void
	  */
		delete(name) {
			name = `${name}`;
			validateName(name);
			const key = find$1(this[MAP], name);
			if (key !== undefined) {
				delete this[MAP][key];
			}
		}

		/**
	  * Return raw headers (non-spec api)
	  *
	  * @return  Object
	  */
		raw() {
			return this[MAP];
		}

		/**
	  * Get an iterator on keys.
	  *
	  * @return  Iterator
	  */
		keys() {
			return createHeadersIterator(this, 'key');
		}

		/**
	  * Get an iterator on values.
	  *
	  * @return  Iterator
	  */
		values() {
			return createHeadersIterator(this, 'value');
		}

		/**
	  * Get an iterator on entries.
	  *
	  * This is the default iterator of the Headers object.
	  *
	  * @return  Iterator
	  */
		[Symbol.iterator]() {
			return createHeadersIterator(this, 'key+value');
		}
	}
	Headers.prototype.entries = Headers.prototype[Symbol.iterator];

	Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
		value: 'Headers',
		writable: false,
		enumerable: false,
		configurable: true
	});

	Object.defineProperties(Headers.prototype, {
		get: { enumerable: true },
		forEach: { enumerable: true },
		set: { enumerable: true },
		append: { enumerable: true },
		has: { enumerable: true },
		delete: { enumerable: true },
		keys: { enumerable: true },
		values: { enumerable: true },
		entries: { enumerable: true }
	});

	function getHeaders(headers) {
		let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

		const keys = Object.keys(headers[MAP]).sort();
		return keys.map(kind === 'key' ? function (k) {
			return k.toLowerCase();
		} : kind === 'value' ? function (k) {
			return headers[MAP][k].join(', ');
		} : function (k) {
			return [k.toLowerCase(), headers[MAP][k].join(', ')];
		});
	}

	const INTERNAL = Symbol('internal');

	function createHeadersIterator(target, kind) {
		const iterator = Object.create(HeadersIteratorPrototype);
		iterator[INTERNAL] = {
			target,
			kind,
			index: 0
		};
		return iterator;
	}

	const HeadersIteratorPrototype = Object.setPrototypeOf({
		next() {
			// istanbul ignore if
			if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
				throw new TypeError('Value of `this` is not a HeadersIterator');
			}

			var _INTERNAL = this[INTERNAL];
			const target = _INTERNAL.target,
			      kind = _INTERNAL.kind,
			      index = _INTERNAL.index;

			const values = getHeaders(target, kind);
			const len = values.length;
			if (index >= len) {
				return {
					value: undefined,
					done: true
				};
			}

			this[INTERNAL].index = index + 1;

			return {
				value: values[index],
				done: false
			};
		}
	}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

	Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
		value: 'HeadersIterator',
		writable: false,
		enumerable: false,
		configurable: true
	});

	/**
	 * Export the Headers object in a form that Node.js can consume.
	 *
	 * @param   Headers  headers
	 * @return  Object
	 */
	function exportNodeCompatibleHeaders(headers) {
		const obj = Object.assign({ __proto__: null }, headers[MAP]);

		// http.request() only supports string as Host header. This hack makes
		// specifying custom Host header possible.
		const hostHeaderKey = find$1(headers[MAP], 'Host');
		if (hostHeaderKey !== undefined) {
			obj[hostHeaderKey] = obj[hostHeaderKey][0];
		}

		return obj;
	}

	/**
	 * Create a Headers object from an object of headers, ignoring those that do
	 * not conform to HTTP grammar productions.
	 *
	 * @param   Object  obj  Object of headers
	 * @return  Headers
	 */
	function createHeadersLenient(obj) {
		const headers = new Headers();
		for (const name of Object.keys(obj)) {
			if (invalidTokenRegex.test(name)) {
				continue;
			}
			if (Array.isArray(obj[name])) {
				for (const val of obj[name]) {
					if (invalidHeaderCharRegex.test(val)) {
						continue;
					}
					if (headers[MAP][name] === undefined) {
						headers[MAP][name] = [val];
					} else {
						headers[MAP][name].push(val);
					}
				}
			} else if (!invalidHeaderCharRegex.test(obj[name])) {
				headers[MAP][name] = [obj[name]];
			}
		}
		return headers;
	}

	const INTERNALS$1 = Symbol('Response internals');

	// fix an issue where "STATUS_CODES" aren't a named export for node <10
	const STATUS_CODES = http$1.STATUS_CODES;

	/**
	 * Response class
	 *
	 * @param   Stream  body  Readable stream
	 * @param   Object  opts  Response options
	 * @return  Void
	 */
	class Response {
		constructor() {
			let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
			let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			Body.call(this, body, opts);

			const status = opts.status || 200;
			const headers = new Headers(opts.headers);

			if (body != null && !headers.has('Content-Type')) {
				const contentType = extractContentType(body);
				if (contentType) {
					headers.append('Content-Type', contentType);
				}
			}

			this[INTERNALS$1] = {
				url: opts.url,
				status,
				statusText: opts.statusText || STATUS_CODES[status],
				headers,
				counter: opts.counter
			};
		}

		get url() {
			return this[INTERNALS$1].url || '';
		}

		get status() {
			return this[INTERNALS$1].status;
		}

		/**
	  * Convenience property representing if the request ended normally
	  */
		get ok() {
			return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
		}

		get redirected() {
			return this[INTERNALS$1].counter > 0;
		}

		get statusText() {
			return this[INTERNALS$1].statusText;
		}

		get headers() {
			return this[INTERNALS$1].headers;
		}

		/**
	  * Clone this response
	  *
	  * @return  Response
	  */
		clone() {
			return new Response(clone(this), {
				url: this.url,
				status: this.status,
				statusText: this.statusText,
				headers: this.headers,
				ok: this.ok,
				redirected: this.redirected
			});
		}
	}

	Body.mixIn(Response.prototype);

	Object.defineProperties(Response.prototype, {
		url: { enumerable: true },
		status: { enumerable: true },
		ok: { enumerable: true },
		redirected: { enumerable: true },
		statusText: { enumerable: true },
		headers: { enumerable: true },
		clone: { enumerable: true }
	});

	Object.defineProperty(Response.prototype, Symbol.toStringTag, {
		value: 'Response',
		writable: false,
		enumerable: false,
		configurable: true
	});

	const INTERNALS$2 = Symbol('Request internals');

	// fix an issue where "format", "parse" aren't a named export for node <10
	const parse_url = Url.parse;
	const format_url = Url.format;

	const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

	/**
	 * Check if a value is an instance of Request.
	 *
	 * @param   Mixed   input
	 * @return  Boolean
	 */
	function isRequest(input) {
		return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
	}

	function isAbortSignal(signal) {
		const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
		return !!(proto && proto.constructor.name === 'AbortSignal');
	}

	/**
	 * Request class
	 *
	 * @param   Mixed   input  Url or Request instance
	 * @param   Object  init   Custom options
	 * @return  Void
	 */
	class Request {
		constructor(input) {
			let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			let parsedURL;

			// normalize input
			if (!isRequest(input)) {
				if (input && input.href) {
					// in order to support Node.js' Url objects; though WHATWG's URL objects
					// will fall into this branch also (since their `toString()` will return
					// `href` property anyway)
					parsedURL = parse_url(input.href);
				} else {
					// coerce input to a string before attempting to parse
					parsedURL = parse_url(`${input}`);
				}
				input = {};
			} else {
				parsedURL = parse_url(input.url);
			}

			let method = init.method || input.method || 'GET';
			method = method.toUpperCase();

			if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
				throw new TypeError('Request with GET/HEAD method cannot have body');
			}

			let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

			Body.call(this, inputBody, {
				timeout: init.timeout || input.timeout || 0,
				size: init.size || input.size || 0
			});

			const headers = new Headers(init.headers || input.headers || {});

			if (inputBody != null && !headers.has('Content-Type')) {
				const contentType = extractContentType(inputBody);
				if (contentType) {
					headers.append('Content-Type', contentType);
				}
			}

			let signal = isRequest(input) ? input.signal : null;
			if ('signal' in init) signal = init.signal;

			if (signal != null && !isAbortSignal(signal)) {
				throw new TypeError('Expected signal to be an instanceof AbortSignal');
			}

			this[INTERNALS$2] = {
				method,
				redirect: init.redirect || input.redirect || 'follow',
				headers,
				parsedURL,
				signal
			};

			// node-fetch-only options
			this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
			this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
			this.counter = init.counter || input.counter || 0;
			this.agent = init.agent || input.agent;
		}

		get method() {
			return this[INTERNALS$2].method;
		}

		get url() {
			return format_url(this[INTERNALS$2].parsedURL);
		}

		get headers() {
			return this[INTERNALS$2].headers;
		}

		get redirect() {
			return this[INTERNALS$2].redirect;
		}

		get signal() {
			return this[INTERNALS$2].signal;
		}

		/**
	  * Clone this request
	  *
	  * @return  Request
	  */
		clone() {
			return new Request(this);
		}
	}

	Body.mixIn(Request.prototype);

	Object.defineProperty(Request.prototype, Symbol.toStringTag, {
		value: 'Request',
		writable: false,
		enumerable: false,
		configurable: true
	});

	Object.defineProperties(Request.prototype, {
		method: { enumerable: true },
		url: { enumerable: true },
		headers: { enumerable: true },
		redirect: { enumerable: true },
		clone: { enumerable: true },
		signal: { enumerable: true }
	});

	/**
	 * Convert a Request to Node.js http request options.
	 *
	 * @param   Request  A Request instance
	 * @return  Object   The options object to be passed to http.request
	 */
	function getNodeRequestOptions(request) {
		const parsedURL = request[INTERNALS$2].parsedURL;
		const headers = new Headers(request[INTERNALS$2].headers);

		// fetch step 1.3
		if (!headers.has('Accept')) {
			headers.set('Accept', '*/*');
		}

		// Basic fetch
		if (!parsedURL.protocol || !parsedURL.hostname) {
			throw new TypeError('Only absolute URLs are supported');
		}

		if (!/^https?:$/.test(parsedURL.protocol)) {
			throw new TypeError('Only HTTP(S) protocols are supported');
		}

		if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
			throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
		}

		// HTTP-network-or-cache fetch steps 2.4-2.7
		let contentLengthValue = null;
		if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
			contentLengthValue = '0';
		}
		if (request.body != null) {
			const totalBytes = getTotalBytes(request);
			if (typeof totalBytes === 'number') {
				contentLengthValue = String(totalBytes);
			}
		}
		if (contentLengthValue) {
			headers.set('Content-Length', contentLengthValue);
		}

		// HTTP-network-or-cache fetch step 2.11
		if (!headers.has('User-Agent')) {
			headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
		}

		// HTTP-network-or-cache fetch step 2.15
		if (request.compress && !headers.has('Accept-Encoding')) {
			headers.set('Accept-Encoding', 'gzip,deflate');
		}

		let agent = request.agent;
		if (typeof agent === 'function') {
			agent = agent(parsedURL);
		}

		if (!headers.has('Connection') && !agent) {
			headers.set('Connection', 'close');
		}

		// HTTP-network fetch step 4.2
		// chunked encoding is handled by Node.js

		return Object.assign({}, parsedURL, {
			method: request.method,
			headers: exportNodeCompatibleHeaders(headers),
			agent
		});
	}

	/**
	 * abort-error.js
	 *
	 * AbortError interface for cancelled requests
	 */

	/**
	 * Create AbortError instance
	 *
	 * @param   String      message      Error message for human
	 * @return  AbortError
	 */
	function AbortError(message) {
	  Error.call(this, message);

	  this.type = 'aborted';
	  this.message = message;

	  // hide custom error implementation details from end-users
	  Error.captureStackTrace(this, this.constructor);
	}

	AbortError.prototype = Object.create(Error.prototype);
	AbortError.prototype.constructor = AbortError;
	AbortError.prototype.name = 'AbortError';

	// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
	const PassThrough$1 = Stream.PassThrough;
	const resolve_url = Url.resolve;

	/**
	 * Fetch function
	 *
	 * @param   Mixed    url   Absolute url or Request instance
	 * @param   Object   opts  Fetch options
	 * @return  Promise
	 */
	function fetch$1(url, opts) {

		// allow custom promise
		if (!fetch$1.Promise) {
			throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
		}

		Body.Promise = fetch$1.Promise;

		// wrap http.request into fetch
		return new fetch$1.Promise(function (resolve, reject) {
			// build request object
			const request = new Request(url, opts);
			const options = getNodeRequestOptions(request);

			const send = (options.protocol === 'https:' ? https : http$1).request;
			const signal = request.signal;

			let response = null;

			const abort = function abort() {
				let error = new AbortError('The user aborted a request.');
				reject(error);
				if (request.body && request.body instanceof Stream.Readable) {
					request.body.destroy(error);
				}
				if (!response || !response.body) return;
				response.body.emit('error', error);
			};

			if (signal && signal.aborted) {
				abort();
				return;
			}

			const abortAndFinalize = function abortAndFinalize() {
				abort();
				finalize();
			};

			// send request
			const req = send(options);
			let reqTimeout;

			if (signal) {
				signal.addEventListener('abort', abortAndFinalize);
			}

			function finalize() {
				req.abort();
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
				clearTimeout(reqTimeout);
			}

			if (request.timeout) {
				req.once('socket', function (socket) {
					reqTimeout = setTimeout(function () {
						reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
						finalize();
					}, request.timeout);
				});
			}

			req.on('error', function (err) {
				reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
				finalize();
			});

			req.on('response', function (res) {
				clearTimeout(reqTimeout);

				const headers = createHeadersLenient(res.headers);

				// HTTP fetch step 5
				if (fetch$1.isRedirect(res.statusCode)) {
					// HTTP fetch step 5.2
					const location = headers.get('Location');

					// HTTP fetch step 5.3
					const locationURL = location === null ? null : resolve_url(request.url, location);

					// HTTP fetch step 5.5
					switch (request.redirect) {
						case 'error':
							reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
							finalize();
							return;
						case 'manual':
							// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
							if (locationURL !== null) {
								// handle corrupted header
								try {
									headers.set('Location', locationURL);
								} catch (err) {
									// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
									reject(err);
								}
							}
							break;
						case 'follow':
							// HTTP-redirect fetch step 2
							if (locationURL === null) {
								break;
							}

							// HTTP-redirect fetch step 5
							if (request.counter >= request.follow) {
								reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
								finalize();
								return;
							}

							// HTTP-redirect fetch step 6 (counter increment)
							// Create a new Request object.
							const requestOpts = {
								headers: new Headers(request.headers),
								follow: request.follow,
								counter: request.counter + 1,
								agent: request.agent,
								compress: request.compress,
								method: request.method,
								body: request.body,
								signal: request.signal,
								timeout: request.timeout,
								size: request.size
							};

							// HTTP-redirect fetch step 9
							if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
								reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
								finalize();
								return;
							}

							// HTTP-redirect fetch step 11
							if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
								requestOpts.method = 'GET';
								requestOpts.body = undefined;
								requestOpts.headers.delete('content-length');
							}

							// HTTP-redirect fetch step 15
							resolve(fetch$1(new Request(locationURL, requestOpts)));
							finalize();
							return;
					}
				}

				// prepare response
				res.once('end', function () {
					if (signal) signal.removeEventListener('abort', abortAndFinalize);
				});
				let body = res.pipe(new PassThrough$1());

				const response_options = {
					url: request.url,
					status: res.statusCode,
					statusText: res.statusMessage,
					headers: headers,
					size: request.size,
					timeout: request.timeout,
					counter: request.counter
				};

				// HTTP-network fetch step 12.1.1.3
				const codings = headers.get('Content-Encoding');

				// HTTP-network fetch step 12.1.1.4: handle content codings

				// in following scenarios we ignore compression support
				// 1. compression support is disabled
				// 2. HEAD request
				// 3. no Content-Encoding header
				// 4. no content response (204)
				// 5. content not modified response (304)
				if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
					response = new Response(body, response_options);
					resolve(response);
					return;
				}

				// For Node v6+
				// Be less strict when decoding compressed responses, since sometimes
				// servers send slightly invalid responses that are still accepted
				// by common browsers.
				// Always using Z_SYNC_FLUSH is what cURL does.
				const zlibOptions = {
					flush: zlib.Z_SYNC_FLUSH,
					finishFlush: zlib.Z_SYNC_FLUSH
				};

				// for gzip
				if (codings == 'gzip' || codings == 'x-gzip') {
					body = body.pipe(zlib.createGunzip(zlibOptions));
					response = new Response(body, response_options);
					resolve(response);
					return;
				}

				// for deflate
				if (codings == 'deflate' || codings == 'x-deflate') {
					// handle the infamous raw deflate response from old servers
					// a hack for old IIS and Apache servers
					const raw = res.pipe(new PassThrough$1());
					raw.once('data', function (chunk) {
						// see http://stackoverflow.com/questions/37519828
						if ((chunk[0] & 0x0F) === 0x08) {
							body = body.pipe(zlib.createInflate());
						} else {
							body = body.pipe(zlib.createInflateRaw());
						}
						response = new Response(body, response_options);
						resolve(response);
					});
					return;
				}

				// for br
				if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
					body = body.pipe(zlib.createBrotliDecompress());
					response = new Response(body, response_options);
					resolve(response);
					return;
				}

				// otherwise, use response as-is
				response = new Response(body, response_options);
				resolve(response);
			});

			writeToStream(req, request);
		});
	}
	/**
	 * Redirect code matching
	 *
	 * @param   Number   code  Status code
	 * @return  Boolean
	 */
	fetch$1.isRedirect = function (code) {
		return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
	};

	// expose Promise
	fetch$1.Promise = global.Promise;

	var lib = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': fetch$1,
		Headers: Headers,
		Request: Request,
		Response: Response,
		FetchError: FetchError
	});

	// Copyright Joyent, Inc. and other Node contributors.

	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	var decode$1 = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	};

	// Copyright Joyent, Inc. and other Node contributors.

	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	};

	var encode$1 = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};

	var querystring = createCommonjsModule(function (module, exports) {

	exports.decode = exports.parse = decode$1;
	exports.encode = exports.stringify = encode$1;
	});
	var querystring_1 = querystring.decode;
	var querystring_2 = querystring.parse;
	var querystring_3 = querystring.encode;
	var querystring_4 = querystring.stringify;

	const isStream = stream =>
		stream !== null &&
		typeof stream === 'object' &&
		typeof stream.pipe === 'function';

	isStream.writable = stream =>
		isStream(stream) &&
		stream.writable !== false &&
		typeof stream._write === 'function' &&
		typeof stream._writableState === 'object';

	isStream.readable = stream =>
		isStream(stream) &&
		stream.readable !== false &&
		typeof stream._read === 'function' &&
		typeof stream._readableState === 'object';

	isStream.duplex = stream =>
		isStream.writable(stream) &&
		isStream.readable(stream);

	isStream.transform = stream =>
		isStream.duplex(stream) &&
		typeof stream._transform === 'function' &&
		typeof stream._transformState === 'object';

	var isStream_1 = isStream;

	var common = createCommonjsModule(function (module, exports) {
	// Copyright 2018 Google LLC
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//    http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Object.defineProperty(exports, "__esModule", { value: true });
	// tslint:disable no-any
	class GaxiosError extends Error {
	    constructor(message, options, response) {
	        super(message);
	        this.response = response;
	        this.config = options;
	        this.code = response.status.toString();
	    }
	}
	exports.GaxiosError = GaxiosError;

	});

	unwrapExports(common);
	var common_1 = common.GaxiosError;

	var retry$1 = createCommonjsModule(function (module, exports) {
	// Copyright 2018 Google LLC
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//    http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Object.defineProperty(exports, "__esModule", { value: true });
	async function getRetryConfig(err) {
	    let config = getConfig(err);
	    if (!err || !err.config || (!config && !err.config.retry)) {
	        return { shouldRetry: false };
	    }
	    config = config || {};
	    config.currentRetryAttempt = config.currentRetryAttempt || 0;
	    config.retry =
	        config.retry === undefined || config.retry === null ? 3 : config.retry;
	    config.httpMethodsToRetry = config.httpMethodsToRetry || [
	        'GET',
	        'HEAD',
	        'PUT',
	        'OPTIONS',
	        'DELETE',
	    ];
	    config.noResponseRetries =
	        config.noResponseRetries === undefined || config.noResponseRetries === null
	            ? 2
	            : config.noResponseRetries;
	    // If this wasn't in the list of status codes where we want
	    // to automatically retry, return.
	    const retryRanges = [
	        // https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
	        // 1xx - Retry (Informational, request still processing)
	        // 2xx - Do not retry (Success)
	        // 3xx - Do not retry (Redirect)
	        // 4xx - Do not retry (Client errors)
	        // 429 - Retry ("Too Many Requests")
	        // 5xx - Retry (Server errors)
	        [100, 199],
	        [429, 429],
	        [500, 599],
	    ];
	    config.statusCodesToRetry = config.statusCodesToRetry || retryRanges;
	    // Put the config back into the err
	    err.config.retryConfig = config;
	    // Determine if we should retry the request
	    const shouldRetryFn = config.shouldRetry || shouldRetryRequest;
	    if (!(await shouldRetryFn(err))) {
	        return { shouldRetry: false, config: err.config };
	    }
	    // Calculate time to wait with exponential backoff.
	    // Formula: (2^c - 1 / 2) * 1000
	    const delay = ((Math.pow(2, config.currentRetryAttempt) - 1) / 2) * 1000;
	    // We're going to retry!  Incremenent the counter.
	    err.config.retryConfig.currentRetryAttempt += 1;
	    // Create a promise that invokes the retry after the backOffDelay
	    const backoff = new Promise(resolve => {
	        setTimeout(resolve, delay);
	    });
	    // Notify the user if they added an `onRetryAttempt` handler
	    if (config.onRetryAttempt) {
	        config.onRetryAttempt(err);
	    }
	    // Return the promise in which recalls Gaxios to retry the request
	    await backoff;
	    return { shouldRetry: true, config: err.config };
	}
	exports.getRetryConfig = getRetryConfig;
	/**
	 * Determine based on config if we should retry the request.
	 * @param err The GaxiosError passed to the interceptor.
	 */
	function shouldRetryRequest(err) {
	    const config = getConfig(err);
	    // node-fetch raises an AbortError if signaled:
	    // https://github.com/bitinn/node-fetch#request-cancellation-with-abortsignal
	    if (err.name === 'AbortError') {
	        return false;
	    }
	    // If there's no config, or retries are disabled, return.
	    if (!config || config.retry === 0) {
	        return false;
	    }
	    // Check if this error has no response (ETIMEDOUT, ENOTFOUND, etc)
	    if (!err.response &&
	        (config.currentRetryAttempt || 0) >= config.noResponseRetries) {
	        return false;
	    }
	    // Only retry with configured HttpMethods.
	    if (!err.config.method ||
	        config.httpMethodsToRetry.indexOf(err.config.method.toUpperCase()) < 0) {
	        return false;
	    }
	    // If this wasn't in the list of status codes where we want
	    // to automatically retry, return.
	    if (err.response && err.response.status) {
	        let isInRange = false;
	        for (const [min, max] of config.statusCodesToRetry) {
	            const status = err.response.status;
	            if (status >= min && status <= max) {
	                isInRange = true;
	                break;
	            }
	        }
	        if (!isInRange) {
	            return false;
	        }
	    }
	    // If we are out of retry attempts, return
	    config.currentRetryAttempt = config.currentRetryAttempt || 0;
	    if (config.currentRetryAttempt >= config.retry) {
	        return false;
	    }
	    return true;
	}
	/**
	 * Acquire the raxConfig object from an GaxiosError if available.
	 * @param err The Gaxios error with a config object.
	 */
	function getConfig(err) {
	    if (err && err.config && err.config.retryConfig) {
	        return err.config.retryConfig;
	    }
	    return;
	}

	});

	unwrapExports(retry$1);
	var retry_1 = retry$1.getRetryConfig;

	/**
	 * Helpers.
	 */

	var s$2 = 1000;
	var m$2 = s$2 * 60;
	var h$2 = m$2 * 60;
	var d$2 = h$2 * 24;
	var w$1 = d$2 * 7;
	var y$1 = d$2 * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	var ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse$3(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse$3(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y$1;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w$1;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d$2;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h$2;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m$2;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s$2;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d$2) {
	    return Math.round(ms / d$2) + 'd';
	  }
	  if (msAbs >= h$2) {
	    return Math.round(ms / h$2) + 'h';
	  }
	  if (msAbs >= m$2) {
	    return Math.round(ms / m$2) + 'm';
	  }
	  if (msAbs >= s$2) {
	    return Math.round(ms / s$2) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d$2) {
	    return plural(ms, msAbs, d$2, 'day');
	  }
	  if (msAbs >= h$2) {
	    return plural(ms, msAbs, h$2, 'hour');
	  }
	  if (msAbs >= m$2) {
	    return plural(ms, msAbs, m$2, 'minute');
	  }
	  if (msAbs >= s$2) {
	    return plural(ms, msAbs, s$2, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}

	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = ms;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* Active `debug` instances.
		*/
		createDebug.instances = [];

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return match;
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.enabled = createDebug.enabled(namespace);
			debug.useColors = createDebug.useColors();
			debug.color = selectColor(namespace);
			debug.destroy = destroy;
			debug.extend = extend;
			// Debug.formatArgs = formatArgs;
			// debug.rawLog = rawLog;

			// env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			createDebug.instances.push(debug);

			return debug;
		}

		function destroy() {
			const index = createDebug.instances.indexOf(this);
			if (index !== -1) {
				createDebug.instances.splice(index, 1);
				return true;
			}
			return false;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);

			createDebug.names = [];
			createDebug.skips = [];

			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;

			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}

				namespaces = split[i].replace(/\*/g, '.*?');

				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}

			for (i = 0; i < createDebug.instances.length; i++) {
				const instance = createDebug.instances[i];
				instance.enabled = createDebug.enabled(instance.namespace);
			}
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}

			let i;
			let len;

			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}

			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	var common$1 = setup;

	var browser = createCommonjsModule(function (module, exports) {
	/* eslint-env browser */

	/**
	 * This is the web browser implementation of `debug()`.
	 */

	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
		'#0000CC',
		'#0000FF',
		'#0033CC',
		'#0033FF',
		'#0066CC',
		'#0066FF',
		'#0099CC',
		'#0099FF',
		'#00CC00',
		'#00CC33',
		'#00CC66',
		'#00CC99',
		'#00CCCC',
		'#00CCFF',
		'#3300CC',
		'#3300FF',
		'#3333CC',
		'#3333FF',
		'#3366CC',
		'#3366FF',
		'#3399CC',
		'#3399FF',
		'#33CC00',
		'#33CC33',
		'#33CC66',
		'#33CC99',
		'#33CCCC',
		'#33CCFF',
		'#6600CC',
		'#6600FF',
		'#6633CC',
		'#6633FF',
		'#66CC00',
		'#66CC33',
		'#9900CC',
		'#9900FF',
		'#9933CC',
		'#9933FF',
		'#99CC00',
		'#99CC33',
		'#CC0000',
		'#CC0033',
		'#CC0066',
		'#CC0099',
		'#CC00CC',
		'#CC00FF',
		'#CC3300',
		'#CC3333',
		'#CC3366',
		'#CC3399',
		'#CC33CC',
		'#CC33FF',
		'#CC6600',
		'#CC6633',
		'#CC9900',
		'#CC9933',
		'#CCCC00',
		'#CCCC33',
		'#FF0000',
		'#FF0033',
		'#FF0066',
		'#FF0099',
		'#FF00CC',
		'#FF00FF',
		'#FF3300',
		'#FF3333',
		'#FF3366',
		'#FF3399',
		'#FF33CC',
		'#FF33FF',
		'#FF6600',
		'#FF6633',
		'#FF9900',
		'#FF9933',
		'#FFCC00',
		'#FFCC33'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	// eslint-disable-next-line complexity
	function useColors() {
		// NB: In an Electron preload script, document will be defined but not fully
		// initialized. Since we know we're in Chrome, we'll just detect this case
		// explicitly
		if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
			return true;
		}

		// Internet Explorer and Edge do not support colors.
		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
			return false;
		}

		// Is webkit? http://stackoverflow.com/a/16459606/376773
		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// Is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// Is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
			// Double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}

	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
		args[0] = (this.useColors ? '%c' : '') +
			this.namespace +
			(this.useColors ? ' %c' : ' ') +
			args[0] +
			(this.useColors ? '%c ' : ' ') +
			'+' + module.exports.humanize(this.diff);

		if (!this.useColors) {
			return;
		}

		const c = 'color: ' + this.color;
		args.splice(1, 0, c, 'color: inherit');

		// The final "%c" is somewhat tricky, because there could be other
		// arguments passed either before or after the %c, so we need to
		// figure out the correct index to insert the CSS into
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, match => {
			if (match === '%%') {
				return;
			}
			index++;
			if (match === '%c') {
				// We only are interested in the *last* %c
				// (the user may have provided their own)
				lastC = index;
			}
		});

		args.splice(lastC, 0, c);
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	function log(...args) {
		// This hackery is required for IE8/9, where
		// the `console.log` function doesn't have 'apply'
		return typeof console === 'object' &&
			console.log &&
			console.log(...args);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	function save(namespaces) {
		try {
			if (namespaces) {
				exports.storage.setItem('debug', namespaces);
			} else {
				exports.storage.removeItem('debug');
			}
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	function load() {
		let r;
		try {
			r = exports.storage.getItem('debug');
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}

		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		if (!r && typeof process !== 'undefined' && 'env' in process) {
			r = process.env.DEBUG;
		}

		return r;
	}

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage() {
		try {
			// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
			// The Browser also has localStorage in the global context.
			return localStorage;
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}

	module.exports = common$1(exports);

	const {formatters} = module.exports;

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	formatters.j = function (v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return '[UnexpectedJSONParseError]: ' + error.message;
		}
	};
	});
	var browser_1 = browser.log;
	var browser_2 = browser.formatArgs;
	var browser_3 = browser.save;
	var browser_4 = browser.load;
	var browser_5 = browser.useColors;
	var browser_6 = browser.storage;
	var browser_7 = browser.colors;

	var hasFlag = (flag, argv = process.argv) => {
		const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf('--');
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};

	const {env} = process;

	let forceColor;
	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false') ||
		hasFlag('color=never')) {
		forceColor = 0;
	} else if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		forceColor = 1;
	}

	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			forceColor = 1;
		} else if (env.FORCE_COLOR === 'false') {
			forceColor = 0;
		} else {
			forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
		}
	}

	function translateLevel(level) {
		if (level === 0) {
			return false;
		}

		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}

	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) {
			return 0;
		}

		if (hasFlag('color=16m') ||
			hasFlag('color=full') ||
			hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}

		if (haveStream && !streamIsTTY && forceColor === undefined) {
			return 0;
		}

		const min = forceColor || 0;

		if (env.TERM === 'dumb') {
			return min;
		}

		if (process.platform === 'win32') {
			// Windows 10 build 10586 is the first Windows release that supports 256 colors.
			// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
			const osRelease = os.release().split('.');
			if (
				Number(osRelease[0]) >= 10 &&
				Number(osRelease[2]) >= 10586
			) {
				return Number(osRelease[2]) >= 14931 ? 3 : 2;
			}

			return 1;
		}

		if ('CI' in env) {
			if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
				return 1;
			}

			return min;
		}

		if ('TEAMCITY_VERSION' in env) {
			return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		}

		if (env.COLORTERM === 'truecolor') {
			return 3;
		}

		if ('TERM_PROGRAM' in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

			switch (env.TERM_PROGRAM) {
				case 'iTerm.app':
					return version >= 3 ? 3 : 2;
				case 'Apple_Terminal':
					return 2;
				// No default
			}
		}

		if (/-256(color)?$/i.test(env.TERM)) {
			return 2;
		}

		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
			return 1;
		}

		if ('COLORTERM' in env) {
			return 1;
		}

		return min;
	}

	function getSupportLevel(stream) {
		const level = supportsColor(stream, stream && stream.isTTY);
		return translateLevel(level);
	}

	var supportsColor_1 = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty.isatty(2)))
	};

	var node$2 = createCommonjsModule(function (module, exports) {
	/**
	 * Module dependencies.
	 */




	/**
	 * This is the Node.js implementation of `debug()`.
	 */

	exports.init = init;
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Colors.
	 */

	exports.colors = [6, 2, 3, 4, 5, 1];

	try {
		// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
		// eslint-disable-next-line import/no-extraneous-dependencies
		const supportsColor = supportsColor_1;

		if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
			exports.colors = [
				20,
				21,
				26,
				27,
				32,
				33,
				38,
				39,
				40,
				41,
				42,
				43,
				44,
				45,
				56,
				57,
				62,
				63,
				68,
				69,
				74,
				75,
				76,
				77,
				78,
				79,
				80,
				81,
				92,
				93,
				98,
				99,
				112,
				113,
				128,
				129,
				134,
				135,
				148,
				149,
				160,
				161,
				162,
				163,
				164,
				165,
				166,
				167,
				168,
				169,
				170,
				171,
				172,
				173,
				178,
				179,
				184,
				185,
				196,
				197,
				198,
				199,
				200,
				201,
				202,
				203,
				204,
				205,
				206,
				207,
				208,
				209,
				214,
				215,
				220,
				221
			];
		}
	} catch (error) {
		// Swallow - we only care if `supports-color` is available; it doesn't have to be.
	}

	/**
	 * Build up the default `inspectOpts` object from the environment variables.
	 *
	 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
	 */

	exports.inspectOpts = Object.keys(process.env).filter(key => {
		return /^debug_/i.test(key);
	}).reduce((obj, key) => {
		// Camel-case
		const prop = key
			.substring(6)
			.toLowerCase()
			.replace(/_([a-z])/g, (_, k) => {
				return k.toUpperCase();
			});

		// Coerce string value into JS value
		let val = process.env[key];
		if (/^(yes|on|true|enabled)$/i.test(val)) {
			val = true;
		} else if (/^(no|off|false|disabled)$/i.test(val)) {
			val = false;
		} else if (val === 'null') {
			val = null;
		} else {
			val = Number(val);
		}

		obj[prop] = val;
		return obj;
	}, {});

	/**
	 * Is stdout a TTY? Colored output is enabled when `true`.
	 */

	function useColors() {
		return 'colors' in exports.inspectOpts ?
			Boolean(exports.inspectOpts.colors) :
			tty.isatty(process.stderr.fd);
	}

	/**
	 * Adds ANSI color escape codes if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
		const {namespace: name, useColors} = this;

		if (useColors) {
			const c = this.color;
			const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
			const prefix = `  ${colorCode};1m${name} \u001B[0m`;

			args[0] = prefix + args[0].split('\n').join('\n' + prefix);
			args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
		} else {
			args[0] = getDate() + name + ' ' + args[0];
		}
	}

	function getDate() {
		if (exports.inspectOpts.hideDate) {
			return '';
		}
		return new Date().toISOString() + ' ';
	}

	/**
	 * Invokes `util.format()` with the specified arguments and writes to stderr.
	 */

	function log(...args) {
		return process.stderr.write(util.format(...args) + '\n');
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	function save(namespaces) {
		if (namespaces) {
			process.env.DEBUG = namespaces;
		} else {
			// If you set a process.env field to null or undefined, it gets cast to the
			// string 'null' or 'undefined'. Just delete instead.
			delete process.env.DEBUG;
		}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
		return process.env.DEBUG;
	}

	/**
	 * Init logic for `debug` instances.
	 *
	 * Create a new `inspectOpts` object in case `useColors` is set
	 * differently for a particular `debug` instance.
	 */

	function init(debug) {
		debug.inspectOpts = {};

		const keys = Object.keys(exports.inspectOpts);
		for (let i = 0; i < keys.length; i++) {
			debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
		}
	}

	module.exports = common$1(exports);

	const {formatters} = module.exports;

	/**
	 * Map %o to `util.inspect()`, all on a single line.
	 */

	formatters.o = function (v) {
		this.inspectOpts.colors = this.useColors;
		return util.inspect(v, this.inspectOpts)
			.replace(/\s*\n\s*/g, ' ');
	};

	/**
	 * Map %O to `util.inspect()`, allowing multiple lines if needed.
	 */

	formatters.O = function (v) {
		this.inspectOpts.colors = this.useColors;
		return util.inspect(v, this.inspectOpts);
	};
	});
	var node_1 = node$2.init;
	var node_2 = node$2.log;
	var node_3 = node$2.formatArgs;
	var node_4 = node$2.save;
	var node_5 = node$2.load;
	var node_6 = node$2.useColors;
	var node_7 = node$2.colors;
	var node_8 = node$2.inspectOpts;

	var src$3 = createCommonjsModule(function (module) {
	/**
	 * Detect Electron renderer / nwjs process, which is node, but we should
	 * treat as a browser.
	 */

	if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
		module.exports = browser;
	} else {
		module.exports = node$2;
	}
	});

	var promisify_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function promisify(fn) {
	    return function (req, opts) {
	        return new Promise((resolve, reject) => {
	            fn.call(this, req, opts, (err, rtn) => {
	                if (err) {
	                    reject(err);
	                }
	                else {
	                    resolve(rtn);
	                }
	            });
	        });
	    };
	}
	exports.default = promisify;

	});

	unwrapExports(promisify_1);

	var src$4 = createCommonjsModule(function (module) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};

	const debug_1 = __importDefault(src$3);
	const promisify_1$1 = __importDefault(promisify_1);
	const debug = debug_1.default('agent-base');
	function isAgent(v) {
	    return Boolean(v) && typeof v.addRequest === 'function';
	}
	function isSecureEndpoint() {
	    const { stack } = new Error();
	    if (typeof stack !== 'string')
	        return false;
	    return stack.split('\n').some(l => l.indexOf('(https.js:') !== -1);
	}
	function createAgent(callback, opts) {
	    return new createAgent.Agent(callback, opts);
	}
	(function (createAgent) {
	    /**
	     * Base `http.Agent` implementation.
	     * No pooling/keep-alive is implemented by default.
	     *
	     * @param {Function} callback
	     * @api public
	     */
	    class Agent extends events$1.EventEmitter {
	        constructor(callback, _opts) {
	            super();
	            let opts = _opts;
	            if (typeof callback === 'function') {
	                this.callback = callback;
	            }
	            else if (callback) {
	                opts = callback;
	            }
	            // Timeout for the socket to be returned from the callback
	            this.timeout = null;
	            if (opts && typeof opts.timeout === 'number') {
	                this.timeout = opts.timeout;
	            }
	            // These aren't actually used by `agent-base`, but are required
	            // for the TypeScript definition files in `@types/node` :/
	            this.maxFreeSockets = 1;
	            this.maxSockets = 1;
	            this.sockets = {};
	            this.requests = {};
	            this.options = {};
	        }
	        get defaultPort() {
	            if (typeof this.explicitDefaultPort === 'number') {
	                return this.explicitDefaultPort;
	            }
	            return isSecureEndpoint() ? 443 : 80;
	        }
	        set defaultPort(v) {
	            this.explicitDefaultPort = v;
	        }
	        get protocol() {
	            if (typeof this.explicitProtocol === 'string') {
	                return this.explicitProtocol;
	            }
	            return isSecureEndpoint() ? 'https:' : 'http:';
	        }
	        set protocol(v) {
	            this.explicitProtocol = v;
	        }
	        callback(req, opts, fn) {
	            throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
	        }
	        /**
	         * Called by node-core's "_http_client.js" module when creating
	         * a new HTTP request with this Agent instance.
	         *
	         * @api public
	         */
	        addRequest(req, _opts) {
	            const opts = Object.assign({}, _opts);
	            if (typeof opts.secureEndpoint !== 'boolean') {
	                opts.secureEndpoint = isSecureEndpoint();
	            }
	            if (opts.host == null) {
	                opts.host = 'localhost';
	            }
	            if (opts.port == null) {
	                opts.port = opts.secureEndpoint ? 443 : 80;
	            }
	            if (opts.protocol == null) {
	                opts.protocol = opts.secureEndpoint ? 'https:' : 'http:';
	            }
	            if (opts.host && opts.path) {
	                // If both a `host` and `path` are specified then it's most
	                // likely the result of a `url.parse()` call... we need to
	                // remove the `path` portion so that `net.connect()` doesn't
	                // attempt to open that as a unix socket file.
	                delete opts.path;
	            }
	            delete opts.agent;
	            delete opts.hostname;
	            delete opts._defaultAgent;
	            delete opts.defaultPort;
	            delete opts.createConnection;
	            // Hint to use "Connection: close"
	            // XXX: non-documented `http` module API :(
	            req._last = true;
	            req.shouldKeepAlive = false;
	            let timedOut = false;
	            let timeoutId = null;
	            const timeoutMs = opts.timeout || this.timeout;
	            const onerror = (err) => {
	                if (req._hadError)
	                    return;
	                req.emit('error', err);
	                // For Safety. Some additional errors might fire later on
	                // and we need to make sure we don't double-fire the error event.
	                req._hadError = true;
	            };
	            const ontimeout = () => {
	                timeoutId = null;
	                timedOut = true;
	                const err = new Error(`A "socket" was not created for HTTP request before ${timeoutMs}ms`);
	                err.code = 'ETIMEOUT';
	                onerror(err);
	            };
	            const callbackError = (err) => {
	                if (timedOut)
	                    return;
	                if (timeoutId !== null) {
	                    clearTimeout(timeoutId);
	                    timeoutId = null;
	                }
	                onerror(err);
	            };
	            const onsocket = (socket) => {
	                if (timedOut)
	                    return;
	                if (timeoutId != null) {
	                    clearTimeout(timeoutId);
	                    timeoutId = null;
	                }
	                if (isAgent(socket)) {
	                    // `socket` is actually an `http.Agent` instance, so
	                    // relinquish responsibility for this `req` to the Agent
	                    // from here on
	                    debug('Callback returned another Agent instance %o', socket.constructor.name);
	                    socket.addRequest(req, opts);
	                    return;
	                }
	                if (socket) {
	                    socket.once('free', () => {
	                        this.freeSocket(socket, opts);
	                    });
	                    req.onSocket(socket);
	                    return;
	                }
	                const err = new Error(`no Duplex stream was returned to agent-base for \`${req.method} ${req.path}\``);
	                onerror(err);
	            };
	            if (typeof this.callback !== 'function') {
	                onerror(new Error('`callback` is not defined'));
	                return;
	            }
	            if (!this.promisifiedCallback) {
	                if (this.callback.length >= 3) {
	                    debug('Converting legacy callback function to promise');
	                    this.promisifiedCallback = promisify_1$1.default(this.callback);
	                }
	                else {
	                    this.promisifiedCallback = this.callback;
	                }
	            }
	            if (typeof timeoutMs === 'number' && timeoutMs > 0) {
	                timeoutId = setTimeout(ontimeout, timeoutMs);
	            }
	            if ('port' in opts && typeof opts.port !== 'number') {
	                opts.port = Number(opts.port);
	            }
	            try {
	                debug('Resolving socket for %o request: %o', opts.protocol, `${req.method} ${req.path}`);
	                Promise.resolve(this.promisifiedCallback(req, opts)).then(onsocket, callbackError);
	            }
	            catch (err) {
	                Promise.reject(err).catch(callbackError);
	            }
	        }
	        freeSocket(socket, opts) {
	            debug('Freeing socket %o %o', socket.constructor.name, opts);
	            socket.destroy();
	        }
	        destroy() {
	            debug('Destroying agent %o', this.constructor.name);
	        }
	    }
	    createAgent.Agent = Agent;
	    // So that `instanceof` works correctly
	    createAgent.prototype = createAgent.Agent.prototype;
	})(createAgent || (createAgent = {}));
	module.exports = createAgent;

	});

	unwrapExports(src$4);

	var parseProxyResponse_1 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const debug_1 = __importDefault(src$3);
	const debug = debug_1.default('https-proxy-agent:parse-proxy-response');
	function parseProxyResponse(socket) {
	    return new Promise((resolve, reject) => {
	        // we need to buffer any HTTP traffic that happens with the proxy before we get
	        // the CONNECT response, so that if the response is anything other than an "200"
	        // response code, then we can re-play the "data" events on the socket once the
	        // HTTP parser is hooked up...
	        let buffersLength = 0;
	        const buffers = [];
	        function read() {
	            const b = socket.read();
	            if (b)
	                ondata(b);
	            else
	                socket.once('readable', read);
	        }
	        function cleanup() {
	            socket.removeListener('end', onend);
	            socket.removeListener('error', onerror);
	            socket.removeListener('close', onclose);
	            socket.removeListener('readable', read);
	        }
	        function onclose(err) {
	            debug('onclose had error %o', err);
	        }
	        function onend() {
	            debug('onend');
	        }
	        function onerror(err) {
	            cleanup();
	            debug('onerror %o', err);
	            reject(err);
	        }
	        function ondata(b) {
	            buffers.push(b);
	            buffersLength += b.length;
	            const buffered = Buffer.concat(buffers, buffersLength);
	            const endOfHeaders = buffered.indexOf('\r\n\r\n');
	            if (endOfHeaders === -1) {
	                // keep buffering
	                debug('have not received end of HTTP headers yet...');
	                read();
	                return;
	            }
	            const firstLine = buffered.toString('ascii', 0, buffered.indexOf('\r\n'));
	            const statusCode = +firstLine.split(' ')[1];
	            debug('got proxy server response: %o', firstLine);
	            resolve({
	                statusCode,
	                buffered
	            });
	        }
	        socket.on('error', onerror);
	        socket.on('close', onclose);
	        socket.on('end', onend);
	        read();
	    });
	}
	exports.default = parseProxyResponse;

	});

	unwrapExports(parseProxyResponse_1);

	var agent = createCommonjsModule(function (module, exports) {
	var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const net_1 = __importDefault(net);
	const tls_1 = __importDefault(tls);
	const url_1 = __importDefault(Url);
	const assert_1 = __importDefault(assert);
	const debug_1 = __importDefault(src$3);

	const parse_proxy_response_1 = __importDefault(parseProxyResponse_1);
	const debug = debug_1.default('https-proxy-agent:agent');
	/**
	 * The `HttpsProxyAgent` implements an HTTP Agent subclass that connects to
	 * the specified "HTTP(s) proxy server" in order to proxy HTTPS requests.
	 *
	 * Outgoing HTTP requests are first tunneled through the proxy server using the
	 * `CONNECT` HTTP request method to establish a connection to the proxy server,
	 * and then the proxy server connects to the destination target and issues the
	 * HTTP request from the proxy server.
	 *
	 * `https:` requests have their socket connection upgraded to TLS once
	 * the connection to the proxy server has been established.
	 *
	 * @api public
	 */
	class HttpsProxyAgent extends src$4.Agent {
	    constructor(_opts) {
	        let opts;
	        if (typeof _opts === 'string') {
	            opts = url_1.default.parse(_opts);
	        }
	        else {
	            opts = _opts;
	        }
	        if (!opts) {
	            throw new Error('an HTTP(S) proxy server `host` and `port` must be specified!');
	        }
	        debug('creating new HttpsProxyAgent instance: %o', opts);
	        super(opts);
	        const proxy = Object.assign({}, opts);
	        // If `true`, then connect to the proxy server over TLS.
	        // Defaults to `false`.
	        this.secureProxy = opts.secureProxy || isHTTPS(proxy.protocol);
	        // Prefer `hostname` over `host`, and set the `port` if needed.
	        proxy.host = proxy.hostname || proxy.host;
	        if (typeof proxy.port === 'string') {
	            proxy.port = parseInt(proxy.port, 10);
	        }
	        if (!proxy.port && proxy.host) {
	            proxy.port = this.secureProxy ? 443 : 80;
	        }
	        // ALPN is supported by Node.js >= v5.
	        // attempt to negotiate http/1.1 for proxy servers that support http/2
	        if (this.secureProxy && !('ALPNProtocols' in proxy)) {
	            proxy.ALPNProtocols = ['http 1.1'];
	        }
	        if (proxy.host && proxy.path) {
	            // If both a `host` and `path` are specified then it's most likely
	            // the result of a `url.parse()` call... we need to remove the
	            // `path` portion so that `net.connect()` doesn't attempt to open
	            // that as a Unix socket file.
	            delete proxy.path;
	            delete proxy.pathname;
	        }
	        this.proxy = proxy;
	    }
	    /**
	     * Called when the node-core HTTP client library is creating a
	     * new HTTP request.
	     *
	     * @api protected
	     */
	    callback(req, opts) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const { proxy, secureProxy } = this;
	            // Create a socket connection to the proxy server.
	            let socket;
	            if (secureProxy) {
	                debug('Creating `tls.Socket`: %o', proxy);
	                socket = tls_1.default.connect(proxy);
	            }
	            else {
	                debug('Creating `net.Socket`: %o', proxy);
	                socket = net_1.default.connect(proxy);
	            }
	            const headers = Object.assign({}, proxy.headers);
	            const hostname = `${opts.host}:${opts.port}`;
	            let payload = `CONNECT ${hostname} HTTP/1.1\r\n`;
	            // Inject the `Proxy-Authorization` header if necessary.
	            if (proxy.auth) {
	                headers['Proxy-Authorization'] = `Basic ${Buffer.from(proxy.auth).toString('base64')}`;
	            }
	            // The `Host` header should only include the port
	            // number when it is not the default port.
	            let { host, port, secureEndpoint } = opts;
	            if (!isDefaultPort(port, secureEndpoint)) {
	                host += `:${port}`;
	            }
	            headers.Host = host;
	            headers.Connection = 'close';
	            for (const name of Object.keys(headers)) {
	                payload += `${name}: ${headers[name]}\r\n`;
	            }
	            const proxyResponsePromise = parse_proxy_response_1.default(socket);
	            socket.write(`${payload}\r\n`);
	            const { statusCode, buffered } = yield proxyResponsePromise;
	            if (statusCode === 200) {
	                req.once('socket', resume);
	                if (opts.secureEndpoint) {
	                    const servername = opts.servername || opts.host;
	                    if (!servername) {
	                        throw new Error('Could not determine "servername"');
	                    }
	                    // The proxy is connecting to a TLS server, so upgrade
	                    // this socket connection to a TLS connection.
	                    debug('Upgrading socket connection to TLS');
	                    return tls_1.default.connect(Object.assign(Object.assign({}, omit(opts, 'host', 'hostname', 'path', 'port')), { socket,
	                        servername }));
	                }
	                return socket;
	            }
	            // Some other status code that's not 200... need to re-play the HTTP
	            // header "data" events onto the socket once the HTTP machinery is
	            // attached so that the node core `http` can parse and handle the
	            // error status code.
	            // Close the original socket, and a new "fake" socket is returned
	            // instead, so that the proxy doesn't get the HTTP request
	            // written to it (which may contain `Authorization` headers or other
	            // sensitive data).
	            //
	            // See: https://hackerone.com/reports/541502
	            socket.destroy();
	            const fakeSocket = new net_1.default.Socket();
	            fakeSocket.readable = true;
	            // Need to wait for the "socket" event to re-play the "data" events.
	            req.once('socket', (s) => {
	                debug('replaying proxy buffer for failed request');
	                assert_1.default(s.listenerCount('data') > 0);
	                // Replay the "buffered" Buffer onto the fake `socket`, since at
	                // this point the HTTP module machinery has been hooked up for
	                // the user.
	                s.push(buffered);
	                s.push(null);
	            });
	            return fakeSocket;
	        });
	    }
	}
	exports.default = HttpsProxyAgent;
	function resume(socket) {
	    socket.resume();
	}
	function isDefaultPort(port, secure) {
	    return Boolean((!secure && port === 80) || (secure && port === 443));
	}
	function isHTTPS(protocol) {
	    return typeof protocol === 'string' ? /^https:?$/i.test(protocol) : false;
	}
	function omit(obj, ...keys) {
	    const ret = {};
	    let key;
	    for (key in obj) {
	        if (!keys.includes(key)) {
	            ret[key] = obj[key];
	        }
	    }
	    return ret;
	}

	});

	unwrapExports(agent);

	var dist$1 = createCommonjsModule(function (module) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	const agent_1 = __importDefault(agent);
	function createHttpsProxyAgent(opts) {
	    return new agent_1.default(opts);
	}
	(function (createHttpsProxyAgent) {
	    createHttpsProxyAgent.HttpsProxyAgent = agent_1.default;
	    createHttpsProxyAgent.prototype = agent_1.default.prototype;
	})(createHttpsProxyAgent || (createHttpsProxyAgent = {}));
	module.exports = createHttpsProxyAgent;

	});

	unwrapExports(dist$1);

	var require$$1 = getCjsExportFromNamespace(lib);

	var gaxios = createCommonjsModule(function (module, exports) {
	// Copyright 2018 Google LLC
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//    http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	const extend_1 = __importDefault(extend);
	const node_fetch_1 = __importDefault(require$$1);
	const querystring_1 = __importDefault(querystring);
	const is_stream_1 = __importDefault(isStream_1);
	const url_1 = __importDefault(Url);


	// tslint:disable no-any
	const URL = hasURL() ? window.URL : url_1.default.URL;
	const fetch = hasFetch() ? window.fetch : node_fetch_1.default;
	function hasWindow() {
	    return typeof window !== 'undefined' && !!window;
	}
	function hasURL() {
	    return hasWindow() && !!window.URL;
	}
	function hasFetch() {
	    return hasWindow() && !!window.fetch;
	}
	// tslint:disable-next-line variable-name
	let HttpsProxyAgent;
	// Figure out if we should be using a proxy. Only if it's required, load
	// the https-proxy-agent module as it adds startup cost.
	function loadProxy() {
	    const proxy = process.env.HTTPS_PROXY ||
	        process.env.https_proxy ||
	        process.env.HTTP_PROXY ||
	        process.env.http_proxy;
	    if (proxy) {
	        HttpsProxyAgent = dist$1;
	    }
	    return proxy;
	}
	loadProxy();
	class Gaxios {
	    /**
	     * The Gaxios class is responsible for making HTTP requests.
	     * @param defaults The default set of options to be used for this instance.
	     */
	    constructor(defaults) {
	        this.agentCache = new Map();
	        this.defaults = defaults || {};
	    }
	    /**
	     * Perform an HTTP request with the given options.
	     * @param opts Set of HTTP options that will be used for this HTTP request.
	     */
	    async request(opts = {}) {
	        opts = this.validateOpts(opts);
	        return this._request(opts);
	    }
	    /**
	     * Internal, retryable version of the `request` method.
	     * @param opts Set of HTTP options that will be used for this HTTP request.
	     */
	    async _request(opts = {}) {
	        try {
	            let translatedResponse;
	            if (opts.adapter) {
	                translatedResponse = await opts.adapter(opts);
	            }
	            else {
	                const res = await fetch(opts.url, opts);
	                const data = await this.getResponseData(opts, res);
	                translatedResponse = this.translateResponse(opts, res, data);
	            }
	            if (!opts.validateStatus(translatedResponse.status)) {
	                throw new common.GaxiosError(`Request failed with status code ${translatedResponse.status}`, opts, translatedResponse);
	            }
	            return translatedResponse;
	        }
	        catch (e) {
	            const err = e;
	            err.config = opts;
	            const { shouldRetry, config } = await retry$1.getRetryConfig(e);
	            if (shouldRetry && config) {
	                err.config.retryConfig.currentRetryAttempt = config.retryConfig.currentRetryAttempt;
	                return this._request(err.config);
	            }
	            throw err;
	        }
	    }
	    async getResponseData(opts, res) {
	        switch (opts.responseType) {
	            case 'stream':
	                return res.body;
	            case 'json':
	                let data = await res.text();
	                try {
	                    data = JSON.parse(data);
	                }
	                catch (e) { }
	                return data;
	            case 'arraybuffer':
	                return res.arrayBuffer();
	            case 'blob':
	                return res.blob();
	            default:
	                return res.text();
	        }
	    }
	    /**
	     * Validates the options, and merges them with defaults.
	     * @param opts The original options passed from the client.
	     */
	    validateOpts(options) {
	        const opts = extend_1.default(true, {}, this.defaults, options);
	        if (!opts.url) {
	            throw new Error('URL is required.');
	        }
	        // baseUrl has been deprecated, remove in 2.0
	        const baseUrl = opts.baseUrl || opts.baseURL;
	        if (baseUrl) {
	            opts.url = baseUrl + opts.url;
	        }
	        const parsedUrl = new URL(opts.url);
	        opts.url = `${parsedUrl.origin}${parsedUrl.pathname}`;
	        opts.params = extend_1.default(querystring_1.default.parse(parsedUrl.search.substr(1)), // removes leading ?
	        opts.params);
	        opts.paramsSerializer = opts.paramsSerializer || this.paramsSerializer;
	        if (opts.params) {
	            parsedUrl.search = opts.paramsSerializer(opts.params);
	        }
	        opts.url = parsedUrl.href;
	        if (typeof options.maxContentLength === 'number') {
	            opts.size = options.maxContentLength;
	        }
	        if (typeof options.maxRedirects === 'number') {
	            opts.follow = options.maxRedirects;
	        }
	        opts.headers = opts.headers || {};
	        if (opts.data) {
	            if (is_stream_1.default.readable(opts.data)) {
	                opts.body = opts.data;
	            }
	            else if (typeof opts.data === 'object') {
	                opts.body = JSON.stringify(opts.data);
	                // Allow the user to specifiy their own content type,
	                // such as application/json-patch+json; for historical reasons this
	                // content type must currently be a json type, as we are relying on
	                // application/x-www-form-urlencoded (which is incompatible with
	                // upstream GCP APIs) being rewritten to application/json.
	                //
	                // TODO: refactor upstream dependencies to stop relying on this
	                // side-effect.
	                if (!opts.headers['Content-Type'] ||
	                    !opts.headers['Content-Type'].includes('json')) {
	                    opts.headers['Content-Type'] = 'application/json';
	                }
	            }
	            else {
	                opts.body = opts.data;
	            }
	        }
	        opts.validateStatus = opts.validateStatus || this.validateStatus;
	        opts.responseType = opts.responseType || 'json';
	        if (!opts.headers['Accept'] && opts.responseType === 'json') {
	            opts.headers['Accept'] = 'application/json';
	        }
	        opts.method = opts.method || 'GET';
	        const proxy = loadProxy();
	        if (proxy) {
	            if (this.agentCache.has(proxy)) {
	                opts.agent = this.agentCache.get(proxy);
	            }
	            else {
	                opts.agent = new HttpsProxyAgent(proxy);
	                this.agentCache.set(proxy, opts.agent);
	            }
	        }
	        return opts;
	    }
	    /**
	     * By default, throw for any non-2xx status code
	     * @param status status code from the HTTP response
	     */
	    validateStatus(status) {
	        return status >= 200 && status < 300;
	    }
	    /**
	     * Encode a set of key/value pars into a querystring format (?foo=bar&baz=boo)
	     * @param params key value pars to encode
	     */
	    paramsSerializer(params) {
	        return querystring_1.default.stringify(params);
	    }
	    translateResponse(opts, res, data) {
	        // headers need to be converted from a map to an obj
	        const headers = {};
	        res.headers.forEach((value, key) => {
	            headers[key] = value;
	        });
	        return {
	            config: opts,
	            data: data,
	            headers,
	            status: res.status,
	            statusText: res.statusText,
	            // XMLHttpRequestLike
	            request: {
	                responseURL: res.url,
	            },
	        };
	    }
	}
	exports.Gaxios = Gaxios;

	});

	unwrapExports(gaxios);
	var gaxios_1 = gaxios.Gaxios;

	var src$5 = createCommonjsModule(function (module, exports) {
	// Copyright 2018 Google LLC
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//    http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.
	Object.defineProperty(exports, "__esModule", { value: true });

	exports.Gaxios = gaxios.Gaxios;

	exports.GaxiosError = common.GaxiosError;
	/**
	 * The default instance used when the `request` method is directly
	 * invoked.
	 */
	exports.instance = new gaxios.Gaxios();
	/**
	 * Make an HTTP request using the given options.
	 * @param opts Options for the request
	 */
	async function request(opts) {
	    return exports.instance.request(opts);
	}
	exports.request = request;

	});

	unwrapExports(src$5);
	var src_1$1 = src$5.Gaxios;
	var src_2$1 = src$5.GaxiosError;
	var src_3$1 = src$5.instance;
	var src_4$1 = src$5.request;

	/*
	 *      bignumber.js v9.0.0
	 *      A JavaScript library for arbitrary-precision arithmetic.
	 *      https://github.com/MikeMcl/bignumber.js
	 *      Copyright (c) 2019 Michael Mclaughlin <M8ch88l@gmail.com>
	 *      MIT Licensed.
	 *
	 *      BigNumber.prototype methods     |  BigNumber methods
	 *                                      |
	 *      absoluteValue            abs    |  clone
	 *      comparedTo                      |  config               set
	 *      decimalPlaces            dp     |      DECIMAL_PLACES
	 *      dividedBy                div    |      ROUNDING_MODE
	 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
	 *      exponentiatedBy          pow    |      RANGE
	 *      integerValue                    |      CRYPTO
	 *      isEqualTo                eq     |      MODULO_MODE
	 *      isFinite                        |      POW_PRECISION
	 *      isGreaterThan            gt     |      FORMAT
	 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
	 *      isInteger                       |  isBigNumber
	 *      isLessThan               lt     |  maximum              max
	 *      isLessThanOrEqualTo      lte    |  minimum              min
	 *      isNaN                           |  random
	 *      isNegative                      |  sum
	 *      isPositive                      |
	 *      isZero                          |
	 *      minus                           |
	 *      modulo                   mod    |
	 *      multipliedBy             times  |
	 *      negated                         |
	 *      plus                            |
	 *      precision                sd     |
	 *      shiftedBy                       |
	 *      squareRoot               sqrt   |
	 *      toExponential                   |
	 *      toFixed                         |
	 *      toFormat                        |
	 *      toFraction                      |
	 *      toJSON                          |
	 *      toNumber                        |
	 *      toPrecision                     |
	 *      toString                        |
	 *      valueOf                         |
	 *
	 */


	var
	  isNumeric$1 = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,

	  mathceil = Math.ceil,
	  mathfloor = Math.floor,

	  bignumberError = '[BigNumber Error] ',
	  tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

	  BASE = 1e14,
	  LOG_BASE = 14,
	  MAX_SAFE_INTEGER$2 = 0x1fffffffffffff,         // 2^53 - 1
	  // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
	  POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
	  SQRT_BASE = 1e7,

	  // EDITABLE
	  // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
	  // the arguments to toExponential, toFixed, toFormat, and toPrecision.
	  MAX = 1E9;                                   // 0 to MAX_INT32


	/*
	 * Create and return a BigNumber constructor.
	 */
	function clone$1(configObject) {
	  var div, convertBase, parseNumeric,
	    P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
	    ONE = new BigNumber(1),


	    //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


	    // The default values below must be integers within the inclusive ranges stated.
	    // The values can also be changed at run-time using BigNumber.set.

	    // The maximum number of decimal places for operations involving division.
	    DECIMAL_PLACES = 20,                     // 0 to MAX

	    // The rounding mode used when rounding to the above decimal places, and when using
	    // toExponential, toFixed, toFormat and toPrecision, and round (default value).
	    // UP         0 Away from zero.
	    // DOWN       1 Towards zero.
	    // CEIL       2 Towards +Infinity.
	    // FLOOR      3 Towards -Infinity.
	    // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
	    // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
	    // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
	    // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
	    // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
	    ROUNDING_MODE = 4,                       // 0 to 8

	    // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

	    // The exponent value at and beneath which toString returns exponential notation.
	    // Number type: -7
	    TO_EXP_NEG = -7,                         // 0 to -MAX

	    // The exponent value at and above which toString returns exponential notation.
	    // Number type: 21
	    TO_EXP_POS = 21,                         // 0 to MAX

	    // RANGE : [MIN_EXP, MAX_EXP]

	    // The minimum exponent value, beneath which underflow to zero occurs.
	    // Number type: -324  (5e-324)
	    MIN_EXP = -1e7,                          // -1 to -MAX

	    // The maximum exponent value, above which overflow to Infinity occurs.
	    // Number type:  308  (1.7976931348623157e+308)
	    // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
	    MAX_EXP = 1e7,                           // 1 to MAX

	    // Whether to use cryptographically-secure random number generation, if available.
	    CRYPTO = false,                          // true or false

	    // The modulo mode used when calculating the modulus: a mod n.
	    // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
	    // The remainder (r) is calculated as: r = a - n * q.
	    //
	    // UP        0 The remainder is positive if the dividend is negative, else is negative.
	    // DOWN      1 The remainder has the same sign as the dividend.
	    //             This modulo mode is commonly known as 'truncated division' and is
	    //             equivalent to (a % n) in JavaScript.
	    // FLOOR     3 The remainder has the same sign as the divisor (Python %).
	    // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
	    // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
	    //             The remainder is always positive.
	    //
	    // The truncated division, floored division, Euclidian division and IEEE 754 remainder
	    // modes are commonly used for the modulus operation.
	    // Although the other rounding modes can also be used, they may not give useful results.
	    MODULO_MODE = 1,                         // 0 to 9

	    // The maximum number of significant digits of the result of the exponentiatedBy operation.
	    // If POW_PRECISION is 0, there will be unlimited significant digits.
	    POW_PRECISION = 0,                    // 0 to MAX

	    // The format specification used by the BigNumber.prototype.toFormat method.
	    FORMAT = {
	      prefix: '',
	      groupSize: 3,
	      secondaryGroupSize: 0,
	      groupSeparator: ',',
	      decimalSeparator: '.',
	      fractionGroupSize: 0,
	      fractionGroupSeparator: '\xA0',      // non-breaking space
	      suffix: ''
	    },

	    // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
	    // '-', '.', whitespace, or repeated character.
	    // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
	    ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';


	  //------------------------------------------------------------------------------------------


	  // CONSTRUCTOR


	  /*
	   * The BigNumber constructor and exported function.
	   * Create and return a new instance of a BigNumber object.
	   *
	   * v {number|string|BigNumber} A numeric value.
	   * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
	   */
	  function BigNumber(v, b) {
	    var alphabet, c, caseChanged, e, i, isNum, len, str,
	      x = this;

	    // Enable constructor call without `new`.
	    if (!(x instanceof BigNumber)) return new BigNumber(v, b);

	    if (b == null) {

	      if (v && v._isBigNumber === true) {
	        x.s = v.s;

	        if (!v.c || v.e > MAX_EXP) {
	          x.c = x.e = null;
	        } else if (v.e < MIN_EXP) {
	          x.c = [x.e = 0];
	        } else {
	          x.e = v.e;
	          x.c = v.c.slice();
	        }

	        return;
	      }

	      if ((isNum = typeof v == 'number') && v * 0 == 0) {

	        // Use `1 / n` to handle minus zero also.
	        x.s = 1 / v < 0 ? (v = -v, -1) : 1;

	        // Fast path for integers, where n < 2147483648 (2**31).
	        if (v === ~~v) {
	          for (e = 0, i = v; i >= 10; i /= 10, e++);

	          if (e > MAX_EXP) {
	            x.c = x.e = null;
	          } else {
	            x.e = e;
	            x.c = [v];
	          }

	          return;
	        }

	        str = String(v);
	      } else {

	        if (!isNumeric$1.test(str = String(v))) return parseNumeric(x, str, isNum);

	        x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
	      }

	      // Decimal point?
	      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

	      // Exponential form?
	      if ((i = str.search(/e/i)) > 0) {

	        // Determine exponent.
	        if (e < 0) e = i;
	        e += +str.slice(i + 1);
	        str = str.substring(0, i);
	      } else if (e < 0) {

	        // Integer.
	        e = str.length;
	      }

	    } else {

	      // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
	      intCheck(b, 2, ALPHABET.length, 'Base');

	      // Allow exponential notation to be used with base 10 argument, while
	      // also rounding to DECIMAL_PLACES as with other bases.
	      if (b == 10) {
	        x = new BigNumber(v);
	        return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
	      }

	      str = String(v);

	      if (isNum = typeof v == 'number') {

	        // Avoid potential interpretation of Infinity and NaN as base 44+ values.
	        if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

	        x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

	        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
	        if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
	          throw Error
	           (tooManyDigits + v);
	        }
	      } else {
	        x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
	      }

	      alphabet = ALPHABET.slice(0, b);
	      e = i = 0;

	      // Check that str is a valid base b number.
	      // Don't use RegExp, so alphabet can contain special characters.
	      for (len = str.length; i < len; i++) {
	        if (alphabet.indexOf(c = str.charAt(i)) < 0) {
	          if (c == '.') {

	            // If '.' is not the first character and it has not be found before.
	            if (i > e) {
	              e = len;
	              continue;
	            }
	          } else if (!caseChanged) {

	            // Allow e.g. hexadecimal 'FF' as well as 'ff'.
	            if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
	                str == str.toLowerCase() && (str = str.toUpperCase())) {
	              caseChanged = true;
	              i = -1;
	              e = 0;
	              continue;
	            }
	          }

	          return parseNumeric(x, String(v), isNum, b);
	        }
	      }

	      // Prevent later check for length on converted number.
	      isNum = false;
	      str = convertBase(str, b, 10, x.s);

	      // Decimal point?
	      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
	      else e = str.length;
	    }

	    // Determine leading zeros.
	    for (i = 0; str.charCodeAt(i) === 48; i++);

	    // Determine trailing zeros.
	    for (len = str.length; str.charCodeAt(--len) === 48;);

	    if (str = str.slice(i, ++len)) {
	      len -= i;

	      // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
	      if (isNum && BigNumber.DEBUG &&
	        len > 15 && (v > MAX_SAFE_INTEGER$2 || v !== mathfloor(v))) {
	          throw Error
	           (tooManyDigits + (x.s * v));
	      }

	       // Overflow?
	      if ((e = e - i - 1) > MAX_EXP) {

	        // Infinity.
	        x.c = x.e = null;

	      // Underflow?
	      } else if (e < MIN_EXP) {

	        // Zero.
	        x.c = [x.e = 0];
	      } else {
	        x.e = e;
	        x.c = [];

	        // Transform base

	        // e is the base 10 exponent.
	        // i is where to slice str to get the first element of the coefficient array.
	        i = (e + 1) % LOG_BASE;
	        if (e < 0) i += LOG_BASE;  // i < 1

	        if (i < len) {
	          if (i) x.c.push(+str.slice(0, i));

	          for (len -= LOG_BASE; i < len;) {
	            x.c.push(+str.slice(i, i += LOG_BASE));
	          }

	          i = LOG_BASE - (str = str.slice(i)).length;
	        } else {
	          i -= len;
	        }

	        for (; i--; str += '0');
	        x.c.push(+str);
	      }
	    } else {

	      // Zero.
	      x.c = [x.e = 0];
	    }
	  }


	  // CONSTRUCTOR PROPERTIES


	  BigNumber.clone = clone$1;

	  BigNumber.ROUND_UP = 0;
	  BigNumber.ROUND_DOWN = 1;
	  BigNumber.ROUND_CEIL = 2;
	  BigNumber.ROUND_FLOOR = 3;
	  BigNumber.ROUND_HALF_UP = 4;
	  BigNumber.ROUND_HALF_DOWN = 5;
	  BigNumber.ROUND_HALF_EVEN = 6;
	  BigNumber.ROUND_HALF_CEIL = 7;
	  BigNumber.ROUND_HALF_FLOOR = 8;
	  BigNumber.EUCLID = 9;


	  /*
	   * Configure infrequently-changing library-wide settings.
	   *
	   * Accept an object with the following optional properties (if the value of a property is
	   * a number, it must be an integer within the inclusive range stated):
	   *
	   *   DECIMAL_PLACES   {number}           0 to MAX
	   *   ROUNDING_MODE    {number}           0 to 8
	   *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
	   *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
	   *   CRYPTO           {boolean}          true or false
	   *   MODULO_MODE      {number}           0 to 9
	   *   POW_PRECISION       {number}           0 to MAX
	   *   ALPHABET         {string}           A string of two or more unique characters which does
	   *                                     not contain '.'.
	   *   FORMAT           {object}           An object with some of the following properties:
	   *     prefix                 {string}
	   *     groupSize              {number}
	   *     secondaryGroupSize     {number}
	   *     groupSeparator         {string}
	   *     decimalSeparator       {string}
	   *     fractionGroupSize      {number}
	   *     fractionGroupSeparator {string}
	   *     suffix                 {string}
	   *
	   * (The values assigned to the above FORMAT object properties are not checked for validity.)
	   *
	   * E.g.
	   * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
	   *
	   * Ignore properties/parameters set to null or undefined, except for ALPHABET.
	   *
	   * Return an object with the properties current values.
	   */
	  BigNumber.config = BigNumber.set = function (obj) {
	    var p, v;

	    if (obj != null) {

	      if (typeof obj == 'object') {

	        // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
	        // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
	        if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
	          v = obj[p];
	          intCheck(v, 0, MAX, p);
	          DECIMAL_PLACES = v;
	        }

	        // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
	        // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
	        if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
	          v = obj[p];
	          intCheck(v, 0, 8, p);
	          ROUNDING_MODE = v;
	        }

	        // EXPONENTIAL_AT {number|number[]}
	        // Integer, -MAX to MAX inclusive or
	        // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
	        // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
	        if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
	          v = obj[p];
	          if (v && v.pop) {
	            intCheck(v[0], -MAX, 0, p);
	            intCheck(v[1], 0, MAX, p);
	            TO_EXP_NEG = v[0];
	            TO_EXP_POS = v[1];
	          } else {
	            intCheck(v, -MAX, MAX, p);
	            TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
	          }
	        }

	        // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
	        // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
	        // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
	        if (obj.hasOwnProperty(p = 'RANGE')) {
	          v = obj[p];
	          if (v && v.pop) {
	            intCheck(v[0], -MAX, -1, p);
	            intCheck(v[1], 1, MAX, p);
	            MIN_EXP = v[0];
	            MAX_EXP = v[1];
	          } else {
	            intCheck(v, -MAX, MAX, p);
	            if (v) {
	              MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
	            } else {
	              throw Error
	               (bignumberError + p + ' cannot be zero: ' + v);
	            }
	          }
	        }

	        // CRYPTO {boolean} true or false.
	        // '[BigNumber Error] CRYPTO not true or false: {v}'
	        // '[BigNumber Error] crypto unavailable'
	        if (obj.hasOwnProperty(p = 'CRYPTO')) {
	          v = obj[p];
	          if (v === !!v) {
	            if (v) {
	              if (typeof crypto != 'undefined' && crypto &&
	               (crypto.getRandomValues || crypto.randomBytes)) {
	                CRYPTO = v;
	              } else {
	                CRYPTO = !v;
	                throw Error
	                 (bignumberError + 'crypto unavailable');
	              }
	            } else {
	              CRYPTO = v;
	            }
	          } else {
	            throw Error
	             (bignumberError + p + ' not true or false: ' + v);
	          }
	        }

	        // MODULO_MODE {number} Integer, 0 to 9 inclusive.
	        // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
	        if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
	          v = obj[p];
	          intCheck(v, 0, 9, p);
	          MODULO_MODE = v;
	        }

	        // POW_PRECISION {number} Integer, 0 to MAX inclusive.
	        // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
	        if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
	          v = obj[p];
	          intCheck(v, 0, MAX, p);
	          POW_PRECISION = v;
	        }

	        // FORMAT {object}
	        // '[BigNumber Error] FORMAT not an object: {v}'
	        if (obj.hasOwnProperty(p = 'FORMAT')) {
	          v = obj[p];
	          if (typeof v == 'object') FORMAT = v;
	          else throw Error
	           (bignumberError + p + ' not an object: ' + v);
	        }

	        // ALPHABET {string}
	        // '[BigNumber Error] ALPHABET invalid: {v}'
	        if (obj.hasOwnProperty(p = 'ALPHABET')) {
	          v = obj[p];

	          // Disallow if only one character,
	          // or if it contains '+', '-', '.', whitespace, or a repeated character.
	          if (typeof v == 'string' && !/^.$|[+-.\s]|(.).*\1/.test(v)) {
	            ALPHABET = v;
	          } else {
	            throw Error
	             (bignumberError + p + ' invalid: ' + v);
	          }
	        }

	      } else {

	        // '[BigNumber Error] Object expected: {v}'
	        throw Error
	         (bignumberError + 'Object expected: ' + obj);
	      }
	    }

	    return {
	      DECIMAL_PLACES: DECIMAL_PLACES,
	      ROUNDING_MODE: ROUNDING_MODE,
	      EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
	      RANGE: [MIN_EXP, MAX_EXP],
	      CRYPTO: CRYPTO,
	      MODULO_MODE: MODULO_MODE,
	      POW_PRECISION: POW_PRECISION,
	      FORMAT: FORMAT,
	      ALPHABET: ALPHABET
	    };
	  };


	  /*
	   * Return true if v is a BigNumber instance, otherwise return false.
	   *
	   * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
	   *
	   * v {any}
	   *
	   * '[BigNumber Error] Invalid BigNumber: {v}'
	   */
	  BigNumber.isBigNumber = function (v) {
	    if (!v || v._isBigNumber !== true) return false;
	    if (!BigNumber.DEBUG) return true;

	    var i, n,
	      c = v.c,
	      e = v.e,
	      s = v.s;

	    out: if ({}.toString.call(c) == '[object Array]') {

	      if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

	        // If the first element is zero, the BigNumber value must be zero.
	        if (c[0] === 0) {
	          if (e === 0 && c.length === 1) return true;
	          break out;
	        }

	        // Calculate number of digits that c[0] should have, based on the exponent.
	        i = (e + 1) % LOG_BASE;
	        if (i < 1) i += LOG_BASE;

	        // Calculate number of digits of c[0].
	        //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
	        if (String(c[0]).length == i) {

	          for (i = 0; i < c.length; i++) {
	            n = c[i];
	            if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
	          }

	          // Last element cannot be zero, unless it is the only element.
	          if (n !== 0) return true;
	        }
	      }

	    // Infinity/NaN
	    } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
	      return true;
	    }

	    throw Error
	      (bignumberError + 'Invalid BigNumber: ' + v);
	  };


	  /*
	   * Return a new BigNumber whose value is the maximum of the arguments.
	   *
	   * arguments {number|string|BigNumber}
	   */
	  BigNumber.maximum = BigNumber.max = function () {
	    return maxOrMin(arguments, P.lt);
	  };


	  /*
	   * Return a new BigNumber whose value is the minimum of the arguments.
	   *
	   * arguments {number|string|BigNumber}
	   */
	  BigNumber.minimum = BigNumber.min = function () {
	    return maxOrMin(arguments, P.gt);
	  };


	  /*
	   * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
	   * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
	   * zeros are produced).
	   *
	   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
	   * '[BigNumber Error] crypto unavailable'
	   */
	  BigNumber.random = (function () {
	    var pow2_53 = 0x20000000000000;

	    // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
	    // Check if Math.random() produces more than 32 bits of randomness.
	    // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
	    // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
	    var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
	     ? function () { return mathfloor(Math.random() * pow2_53); }
	     : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
	       (Math.random() * 0x800000 | 0); };

	    return function (dp) {
	      var a, b, e, k, v,
	        i = 0,
	        c = [],
	        rand = new BigNumber(ONE);

	      if (dp == null) dp = DECIMAL_PLACES;
	      else intCheck(dp, 0, MAX);

	      k = mathceil(dp / LOG_BASE);

	      if (CRYPTO) {

	        // Browsers supporting crypto.getRandomValues.
	        if (crypto.getRandomValues) {

	          a = crypto.getRandomValues(new Uint32Array(k *= 2));

	          for (; i < k;) {

	            // 53 bits:
	            // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
	            // 11111 11111111 11111111 11111111 11100000 00000000 00000000
	            // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
	            //                                     11111 11111111 11111111
	            // 0x20000 is 2^21.
	            v = a[i] * 0x20000 + (a[i + 1] >>> 11);

	            // Rejection sampling:
	            // 0 <= v < 9007199254740992
	            // Probability that v >= 9e15, is
	            // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
	            if (v >= 9e15) {
	              b = crypto.getRandomValues(new Uint32Array(2));
	              a[i] = b[0];
	              a[i + 1] = b[1];
	            } else {

	              // 0 <= v <= 8999999999999999
	              // 0 <= (v % 1e14) <= 99999999999999
	              c.push(v % 1e14);
	              i += 2;
	            }
	          }
	          i = k / 2;

	        // Node.js supporting crypto.randomBytes.
	        } else if (crypto.randomBytes) {

	          // buffer
	          a = crypto.randomBytes(k *= 7);

	          for (; i < k;) {

	            // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
	            // 0x100000000 is 2^32, 0x1000000 is 2^24
	            // 11111 11111111 11111111 11111111 11111111 11111111 11111111
	            // 0 <= v < 9007199254740992
	            v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
	               (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
	               (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

	            if (v >= 9e15) {
	              crypto.randomBytes(7).copy(a, i);
	            } else {

	              // 0 <= (v % 1e14) <= 99999999999999
	              c.push(v % 1e14);
	              i += 7;
	            }
	          }
	          i = k / 7;
	        } else {
	          CRYPTO = false;
	          throw Error
	           (bignumberError + 'crypto unavailable');
	        }
	      }

	      // Use Math.random.
	      if (!CRYPTO) {

	        for (; i < k;) {
	          v = random53bitInt();
	          if (v < 9e15) c[i++] = v % 1e14;
	        }
	      }

	      k = c[--i];
	      dp %= LOG_BASE;

	      // Convert trailing digits to zeros according to dp.
	      if (k && dp) {
	        v = POWS_TEN[LOG_BASE - dp];
	        c[i] = mathfloor(k / v) * v;
	      }

	      // Remove trailing elements which are zero.
	      for (; c[i] === 0; c.pop(), i--);

	      // Zero?
	      if (i < 0) {
	        c = [e = 0];
	      } else {

	        // Remove leading elements which are zero and adjust exponent accordingly.
	        for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

	        // Count the digits of the first element of c to determine leading zeros, and...
	        for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

	        // adjust the exponent accordingly.
	        if (i < LOG_BASE) e -= LOG_BASE - i;
	      }

	      rand.e = e;
	      rand.c = c;
	      return rand;
	    };
	  })();


	   /*
	   * Return a BigNumber whose value is the sum of the arguments.
	   *
	   * arguments {number|string|BigNumber}
	   */
	  BigNumber.sum = function () {
	    var i = 1,
	      args = arguments,
	      sum = new BigNumber(args[0]);
	    for (; i < args.length;) sum = sum.plus(args[i++]);
	    return sum;
	  };


	  // PRIVATE FUNCTIONS


	  // Called by BigNumber and BigNumber.prototype.toString.
	  convertBase = (function () {
	    var decimal = '0123456789';

	    /*
	     * Convert string of baseIn to an array of numbers of baseOut.
	     * Eg. toBaseOut('255', 10, 16) returns [15, 15].
	     * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
	     */
	    function toBaseOut(str, baseIn, baseOut, alphabet) {
	      var j,
	        arr = [0],
	        arrL,
	        i = 0,
	        len = str.length;

	      for (; i < len;) {
	        for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

	        arr[0] += alphabet.indexOf(str.charAt(i++));

	        for (j = 0; j < arr.length; j++) {

	          if (arr[j] > baseOut - 1) {
	            if (arr[j + 1] == null) arr[j + 1] = 0;
	            arr[j + 1] += arr[j] / baseOut | 0;
	            arr[j] %= baseOut;
	          }
	        }
	      }

	      return arr.reverse();
	    }

	    // Convert a numeric string of baseIn to a numeric string of baseOut.
	    // If the caller is toString, we are converting from base 10 to baseOut.
	    // If the caller is BigNumber, we are converting from baseIn to base 10.
	    return function (str, baseIn, baseOut, sign, callerIsToString) {
	      var alphabet, d, e, k, r, x, xc, y,
	        i = str.indexOf('.'),
	        dp = DECIMAL_PLACES,
	        rm = ROUNDING_MODE;

	      // Non-integer.
	      if (i >= 0) {
	        k = POW_PRECISION;

	        // Unlimited precision.
	        POW_PRECISION = 0;
	        str = str.replace('.', '');
	        y = new BigNumber(baseIn);
	        x = y.pow(str.length - i);
	        POW_PRECISION = k;

	        // Convert str as if an integer, then restore the fraction part by dividing the
	        // result by its base raised to a power.

	        y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
	         10, baseOut, decimal);
	        y.e = y.c.length;
	      }

	      // Convert the number as integer.

	      xc = toBaseOut(str, baseIn, baseOut, callerIsToString
	       ? (alphabet = ALPHABET, decimal)
	       : (alphabet = decimal, ALPHABET));

	      // xc now represents str as an integer and converted to baseOut. e is the exponent.
	      e = k = xc.length;

	      // Remove trailing zeros.
	      for (; xc[--k] == 0; xc.pop());

	      // Zero?
	      if (!xc[0]) return alphabet.charAt(0);

	      // Does str represent an integer? If so, no need for the division.
	      if (i < 0) {
	        --e;
	      } else {
	        x.c = xc;
	        x.e = e;

	        // The sign is needed for correct rounding.
	        x.s = sign;
	        x = div(x, y, dp, rm, baseOut);
	        xc = x.c;
	        r = x.r;
	        e = x.e;
	      }

	      // xc now represents str converted to baseOut.

	      // THe index of the rounding digit.
	      d = e + dp + 1;

	      // The rounding digit: the digit to the right of the digit that may be rounded up.
	      i = xc[d];

	      // Look at the rounding digits and mode to determine whether to round up.

	      k = baseOut / 2;
	      r = r || d < 0 || xc[d + 1] != null;

	      r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
	            : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
	             rm == (x.s < 0 ? 8 : 7));

	      // If the index of the rounding digit is not greater than zero, or xc represents
	      // zero, then the result of the base conversion is zero or, if rounding up, a value
	      // such as 0.00001.
	      if (d < 1 || !xc[0]) {

	        // 1^-dp or 0
	        str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
	      } else {

	        // Truncate xc to the required number of decimal places.
	        xc.length = d;

	        // Round up?
	        if (r) {

	          // Rounding up may mean the previous digit has to be rounded up and so on.
	          for (--baseOut; ++xc[--d] > baseOut;) {
	            xc[d] = 0;

	            if (!d) {
	              ++e;
	              xc = [1].concat(xc);
	            }
	          }
	        }

	        // Determine trailing zeros.
	        for (k = xc.length; !xc[--k];);

	        // E.g. [4, 11, 15] becomes 4bf.
	        for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

	        // Add leading zeros, decimal point and trailing zeros as required.
	        str = toFixedPoint(str, e, alphabet.charAt(0));
	      }

	      // The caller will add the sign.
	      return str;
	    };
	  })();


	  // Perform division in the specified base. Called by div and convertBase.
	  div = (function () {

	    // Assume non-zero x and k.
	    function multiply(x, k, base) {
	      var m, temp, xlo, xhi,
	        carry = 0,
	        i = x.length,
	        klo = k % SQRT_BASE,
	        khi = k / SQRT_BASE | 0;

	      for (x = x.slice(); i--;) {
	        xlo = x[i] % SQRT_BASE;
	        xhi = x[i] / SQRT_BASE | 0;
	        m = khi * xlo + xhi * klo;
	        temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
	        carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
	        x[i] = temp % base;
	      }

	      if (carry) x = [carry].concat(x);

	      return x;
	    }

	    function compare(a, b, aL, bL) {
	      var i, cmp;

	      if (aL != bL) {
	        cmp = aL > bL ? 1 : -1;
	      } else {

	        for (i = cmp = 0; i < aL; i++) {

	          if (a[i] != b[i]) {
	            cmp = a[i] > b[i] ? 1 : -1;
	            break;
	          }
	        }
	      }

	      return cmp;
	    }

	    function subtract(a, b, aL, base) {
	      var i = 0;

	      // Subtract b from a.
	      for (; aL--;) {
	        a[aL] -= i;
	        i = a[aL] < b[aL] ? 1 : 0;
	        a[aL] = i * base + a[aL] - b[aL];
	      }

	      // Remove leading zeros.
	      for (; !a[0] && a.length > 1; a.splice(0, 1));
	    }

	    // x: dividend, y: divisor.
	    return function (x, y, dp, rm, base) {
	      var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
	        yL, yz,
	        s = x.s == y.s ? 1 : -1,
	        xc = x.c,
	        yc = y.c;

	      // Either NaN, Infinity or 0?
	      if (!xc || !xc[0] || !yc || !yc[0]) {

	        return new BigNumber(

	         // Return NaN if either NaN, or both Infinity or 0.
	         !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

	          // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
	          xc && xc[0] == 0 || !yc ? s * 0 : s / 0
	       );
	      }

	      q = new BigNumber(s);
	      qc = q.c = [];
	      e = x.e - y.e;
	      s = dp + e + 1;

	      if (!base) {
	        base = BASE;
	        e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
	        s = s / LOG_BASE | 0;
	      }

	      // Result exponent may be one less then the current value of e.
	      // The coefficients of the BigNumbers from convertBase may have trailing zeros.
	      for (i = 0; yc[i] == (xc[i] || 0); i++);

	      if (yc[i] > (xc[i] || 0)) e--;

	      if (s < 0) {
	        qc.push(1);
	        more = true;
	      } else {
	        xL = xc.length;
	        yL = yc.length;
	        i = 0;
	        s += 2;

	        // Normalise xc and yc so highest order digit of yc is >= base / 2.

	        n = mathfloor(base / (yc[0] + 1));

	        // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
	        // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
	        if (n > 1) {
	          yc = multiply(yc, n, base);
	          xc = multiply(xc, n, base);
	          yL = yc.length;
	          xL = xc.length;
	        }

	        xi = yL;
	        rem = xc.slice(0, yL);
	        remL = rem.length;

	        // Add zeros to make remainder as long as divisor.
	        for (; remL < yL; rem[remL++] = 0);
	        yz = yc.slice();
	        yz = [0].concat(yz);
	        yc0 = yc[0];
	        if (yc[1] >= base / 2) yc0++;
	        // Not necessary, but to prevent trial digit n > base, when using base 3.
	        // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

	        do {
	          n = 0;

	          // Compare divisor and remainder.
	          cmp = compare(yc, rem, yL, remL);

	          // If divisor < remainder.
	          if (cmp < 0) {

	            // Calculate trial digit, n.

	            rem0 = rem[0];
	            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

	            // n is how many times the divisor goes into the current remainder.
	            n = mathfloor(rem0 / yc0);

	            //  Algorithm:
	            //  product = divisor multiplied by trial digit (n).
	            //  Compare product and remainder.
	            //  If product is greater than remainder:
	            //    Subtract divisor from product, decrement trial digit.
	            //  Subtract product from remainder.
	            //  If product was less than remainder at the last compare:
	            //    Compare new remainder and divisor.
	            //    If remainder is greater than divisor:
	            //      Subtract divisor from remainder, increment trial digit.

	            if (n > 1) {

	              // n may be > base only when base is 3.
	              if (n >= base) n = base - 1;

	              // product = divisor * trial digit.
	              prod = multiply(yc, n, base);
	              prodL = prod.length;
	              remL = rem.length;

	              // Compare product and remainder.
	              // If product > remainder then trial digit n too high.
	              // n is 1 too high about 5% of the time, and is not known to have
	              // ever been more than 1 too high.
	              while (compare(prod, rem, prodL, remL) == 1) {
	                n--;

	                // Subtract divisor from product.
	                subtract(prod, yL < prodL ? yz : yc, prodL, base);
	                prodL = prod.length;
	                cmp = 1;
	              }
	            } else {

	              // n is 0 or 1, cmp is -1.
	              // If n is 0, there is no need to compare yc and rem again below,
	              // so change cmp to 1 to avoid it.
	              // If n is 1, leave cmp as -1, so yc and rem are compared again.
	              if (n == 0) {

	                // divisor < remainder, so n must be at least 1.
	                cmp = n = 1;
	              }

	              // product = divisor
	              prod = yc.slice();
	              prodL = prod.length;
	            }

	            if (prodL < remL) prod = [0].concat(prod);

	            // Subtract product from remainder.
	            subtract(rem, prod, remL, base);
	            remL = rem.length;

	             // If product was < remainder.
	            if (cmp == -1) {

	              // Compare divisor and new remainder.
	              // If divisor < new remainder, subtract divisor from remainder.
	              // Trial digit n too low.
	              // n is 1 too low about 5% of the time, and very rarely 2 too low.
	              while (compare(yc, rem, yL, remL) < 1) {
	                n++;

	                // Subtract divisor from remainder.
	                subtract(rem, yL < remL ? yz : yc, remL, base);
	                remL = rem.length;
	              }
	            }
	          } else if (cmp === 0) {
	            n++;
	            rem = [0];
	          } // else cmp === 1 and n will be 0

	          // Add the next digit, n, to the result array.
	          qc[i++] = n;

	          // Update the remainder.
	          if (rem[0]) {
	            rem[remL++] = xc[xi] || 0;
	          } else {
	            rem = [xc[xi]];
	            remL = 1;
	          }
	        } while ((xi++ < xL || rem[0] != null) && s--);

	        more = rem[0] != null;

	        // Leading zero?
	        if (!qc[0]) qc.splice(0, 1);
	      }

	      if (base == BASE) {

	        // To calculate q.e, first get the number of digits of qc[0].
	        for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

	        round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

	      // Caller is convertBase.
	      } else {
	        q.e = e;
	        q.r = +more;
	      }

	      return q;
	    };
	  })();


	  /*
	   * Return a string representing the value of BigNumber n in fixed-point or exponential
	   * notation rounded to the specified decimal places or significant digits.
	   *
	   * n: a BigNumber.
	   * i: the index of the last digit required (i.e. the digit that may be rounded up).
	   * rm: the rounding mode.
	   * id: 1 (toExponential) or 2 (toPrecision).
	   */
	  function format(n, i, rm, id) {
	    var c0, e, ne, len, str;

	    if (rm == null) rm = ROUNDING_MODE;
	    else intCheck(rm, 0, 8);

	    if (!n.c) return n.toString();

	    c0 = n.c[0];
	    ne = n.e;

	    if (i == null) {
	      str = coeffToString(n.c);
	      str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
	       ? toExponential(str, ne)
	       : toFixedPoint(str, ne, '0');
	    } else {
	      n = round(new BigNumber(n), i, rm);

	      // n.e may have changed if the value was rounded up.
	      e = n.e;

	      str = coeffToString(n.c);
	      len = str.length;

	      // toPrecision returns exponential notation if the number of significant digits
	      // specified is less than the number of digits necessary to represent the integer
	      // part of the value in fixed-point notation.

	      // Exponential notation.
	      if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

	        // Append zeros?
	        for (; len < i; str += '0', len++);
	        str = toExponential(str, e);

	      // Fixed-point notation.
	      } else {
	        i -= ne;
	        str = toFixedPoint(str, e, '0');

	        // Append zeros?
	        if (e + 1 > len) {
	          if (--i > 0) for (str += '.'; i--; str += '0');
	        } else {
	          i += e - len;
	          if (i > 0) {
	            if (e + 1 == len) str += '.';
	            for (; i--; str += '0');
	          }
	        }
	      }
	    }

	    return n.s < 0 && c0 ? '-' + str : str;
	  }


	  // Handle BigNumber.max and BigNumber.min.
	  function maxOrMin(args, method) {
	    var n,
	      i = 1,
	      m = new BigNumber(args[0]);

	    for (; i < args.length; i++) {
	      n = new BigNumber(args[i]);

	      // If any number is NaN, return NaN.
	      if (!n.s) {
	        m = n;
	        break;
	      } else if (method.call(m, n)) {
	        m = n;
	      }
	    }

	    return m;
	  }


	  /*
	   * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
	   * Called by minus, plus and times.
	   */
	  function normalise(n, c, e) {
	    var i = 1,
	      j = c.length;

	     // Remove trailing zeros.
	    for (; !c[--j]; c.pop());

	    // Calculate the base 10 exponent. First get the number of digits of c[0].
	    for (j = c[0]; j >= 10; j /= 10, i++);

	    // Overflow?
	    if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

	      // Infinity.
	      n.c = n.e = null;

	    // Underflow?
	    } else if (e < MIN_EXP) {

	      // Zero.
	      n.c = [n.e = 0];
	    } else {
	      n.e = e;
	      n.c = c;
	    }

	    return n;
	  }


	  // Handle values that fail the validity test in BigNumber.
	  parseNumeric = (function () {
	    var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
	      dotAfter = /^([^.]+)\.$/,
	      dotBefore = /^\.([^.]+)$/,
	      isInfinityOrNaN = /^-?(Infinity|NaN)$/,
	      whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

	    return function (x, str, isNum, b) {
	      var base,
	        s = isNum ? str : str.replace(whitespaceOrPlus, '');

	      // No exception on ±Infinity or NaN.
	      if (isInfinityOrNaN.test(s)) {
	        x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
	      } else {
	        if (!isNum) {

	          // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
	          s = s.replace(basePrefix, function (m, p1, p2) {
	            base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
	            return !b || b == base ? p1 : m;
	          });

	          if (b) {
	            base = b;

	            // E.g. '1.' to '1', '.1' to '0.1'
	            s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
	          }

	          if (str != s) return new BigNumber(s, base);
	        }

	        // '[BigNumber Error] Not a number: {n}'
	        // '[BigNumber Error] Not a base {b} number: {n}'
	        if (BigNumber.DEBUG) {
	          throw Error
	            (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
	        }

	        // NaN
	        x.s = null;
	      }

	      x.c = x.e = null;
	    }
	  })();


	  /*
	   * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
	   * If r is truthy, it is known that there are more digits after the rounding digit.
	   */
	  function round(x, sd, rm, r) {
	    var d, i, j, k, n, ni, rd,
	      xc = x.c,
	      pows10 = POWS_TEN;

	    // if x is not Infinity or NaN...
	    if (xc) {

	      // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
	      // n is a base 1e14 number, the value of the element of array x.c containing rd.
	      // ni is the index of n within x.c.
	      // d is the number of digits of n.
	      // i is the index of rd within n including leading zeros.
	      // j is the actual index of rd within n (if < 0, rd is a leading zero).
	      out: {

	        // Get the number of digits of the first element of xc.
	        for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
	        i = sd - d;

	        // If the rounding digit is in the first element of xc...
	        if (i < 0) {
	          i += LOG_BASE;
	          j = sd;
	          n = xc[ni = 0];

	          // Get the rounding digit at index j of n.
	          rd = n / pows10[d - j - 1] % 10 | 0;
	        } else {
	          ni = mathceil((i + 1) / LOG_BASE);

	          if (ni >= xc.length) {

	            if (r) {

	              // Needed by sqrt.
	              for (; xc.length <= ni; xc.push(0));
	              n = rd = 0;
	              d = 1;
	              i %= LOG_BASE;
	              j = i - LOG_BASE + 1;
	            } else {
	              break out;
	            }
	          } else {
	            n = k = xc[ni];

	            // Get the number of digits of n.
	            for (d = 1; k >= 10; k /= 10, d++);

	            // Get the index of rd within n.
	            i %= LOG_BASE;

	            // Get the index of rd within n, adjusted for leading zeros.
	            // The number of leading zeros of n is given by LOG_BASE - d.
	            j = i - LOG_BASE + d;

	            // Get the rounding digit at index j of n.
	            rd = j < 0 ? 0 : n / pows10[d - j - 1] % 10 | 0;
	          }
	        }

	        r = r || sd < 0 ||

	        // Are there any non-zero digits after the rounding digit?
	        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
	        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
	         xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

	        r = rm < 4
	         ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
	         : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

	          // Check whether the digit to the left of the rounding digit is odd.
	          ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
	           rm == (x.s < 0 ? 8 : 7));

	        if (sd < 1 || !xc[0]) {
	          xc.length = 0;

	          if (r) {

	            // Convert sd to decimal places.
	            sd -= x.e + 1;

	            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
	            xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
	            x.e = -sd || 0;
	          } else {

	            // Zero.
	            xc[0] = x.e = 0;
	          }

	          return x;
	        }

	        // Remove excess digits.
	        if (i == 0) {
	          xc.length = ni;
	          k = 1;
	          ni--;
	        } else {
	          xc.length = ni + 1;
	          k = pows10[LOG_BASE - i];

	          // E.g. 56700 becomes 56000 if 7 is the rounding digit.
	          // j > 0 means i > number of leading zeros of n.
	          xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
	        }

	        // Round up?
	        if (r) {

	          for (; ;) {

	            // If the digit to be rounded up is in the first element of xc...
	            if (ni == 0) {

	              // i will be the length of xc[0] before k is added.
	              for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
	              j = xc[0] += k;
	              for (k = 1; j >= 10; j /= 10, k++);

	              // if i != k the length has increased.
	              if (i != k) {
	                x.e++;
	                if (xc[0] == BASE) xc[0] = 1;
	              }

	              break;
	            } else {
	              xc[ni] += k;
	              if (xc[ni] != BASE) break;
	              xc[ni--] = 0;
	              k = 1;
	            }
	          }
	        }

	        // Remove trailing zeros.
	        for (i = xc.length; xc[--i] === 0; xc.pop());
	      }

	      // Overflow? Infinity.
	      if (x.e > MAX_EXP) {
	        x.c = x.e = null;

	      // Underflow? Zero.
	      } else if (x.e < MIN_EXP) {
	        x.c = [x.e = 0];
	      }
	    }

	    return x;
	  }


	  function valueOf(n) {
	    var str,
	      e = n.e;

	    if (e === null) return n.toString();

	    str = coeffToString(n.c);

	    str = e <= TO_EXP_NEG || e >= TO_EXP_POS
	      ? toExponential(str, e)
	      : toFixedPoint(str, e, '0');

	    return n.s < 0 ? '-' + str : str;
	  }


	  // PROTOTYPE/INSTANCE METHODS


	  /*
	   * Return a new BigNumber whose value is the absolute value of this BigNumber.
	   */
	  P.absoluteValue = P.abs = function () {
	    var x = new BigNumber(this);
	    if (x.s < 0) x.s = 1;
	    return x;
	  };


	  /*
	   * Return
	   *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
	   *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
	   *   0 if they have the same value,
	   *   or null if the value of either is NaN.
	   */
	  P.comparedTo = function (y, b) {
	    return compare$1(this, new BigNumber(y, b));
	  };


	  /*
	   * If dp is undefined or null or true or false, return the number of decimal places of the
	   * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
	   *
	   * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
	   * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
	   * ROUNDING_MODE if rm is omitted.
	   *
	   * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
	   */
	  P.decimalPlaces = P.dp = function (dp, rm) {
	    var c, n, v,
	      x = this;

	    if (dp != null) {
	      intCheck(dp, 0, MAX);
	      if (rm == null) rm = ROUNDING_MODE;
	      else intCheck(rm, 0, 8);

	      return round(new BigNumber(x), dp + x.e + 1, rm);
	    }

	    if (!(c = x.c)) return null;
	    n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

	    // Subtract the number of trailing zeros of the last number.
	    if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
	    if (n < 0) n = 0;

	    return n;
	  };


	  /*
	   *  n / 0 = I
	   *  n / N = N
	   *  n / I = 0
	   *  0 / n = 0
	   *  0 / 0 = N
	   *  0 / N = N
	   *  0 / I = 0
	   *  N / n = N
	   *  N / 0 = N
	   *  N / N = N
	   *  N / I = N
	   *  I / n = I
	   *  I / 0 = I
	   *  I / N = N
	   *  I / I = N
	   *
	   * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
	   * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
	   */
	  P.dividedBy = P.div = function (y, b) {
	    return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
	  };


	  /*
	   * Return a new BigNumber whose value is the integer part of dividing the value of this
	   * BigNumber by the value of BigNumber(y, b).
	   */
	  P.dividedToIntegerBy = P.idiv = function (y, b) {
	    return div(this, new BigNumber(y, b), 0, 1);
	  };


	  /*
	   * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
	   *
	   * If m is present, return the result modulo m.
	   * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
	   * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
	   *
	   * The modular power operation works efficiently when x, n, and m are integers, otherwise it
	   * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
	   *
	   * n {number|string|BigNumber} The exponent. An integer.
	   * [m] {number|string|BigNumber} The modulus.
	   *
	   * '[BigNumber Error] Exponent not an integer: {n}'
	   */
	  P.exponentiatedBy = P.pow = function (n, m) {
	    var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
	      x = this;

	    n = new BigNumber(n);

	    // Allow NaN and ±Infinity, but not other non-integers.
	    if (n.c && !n.isInteger()) {
	      throw Error
	        (bignumberError + 'Exponent not an integer: ' + valueOf(n));
	    }

	    if (m != null) m = new BigNumber(m);

	    // Exponent of MAX_SAFE_INTEGER is 15.
	    nIsBig = n.e > 14;

	    // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
	    if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

	      // The sign of the result of pow when x is negative depends on the evenness of n.
	      // If +n overflows to ±Infinity, the evenness of n would be not be known.
	      y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? 2 - isOdd(n) : +valueOf(n)));
	      return m ? y.mod(m) : y;
	    }

	    nIsNeg = n.s < 0;

	    if (m) {

	      // x % m returns NaN if abs(m) is zero, or m is NaN.
	      if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

	      isModExp = !nIsNeg && x.isInteger() && m.isInteger();

	      if (isModExp) x = x.mod(m);

	    // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
	    // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
	    } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
	      // [1, 240000000]
	      ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
	      // [80000000000000]  [99999750000000]
	      : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

	      // If x is negative and n is odd, k = -0, else k = 0.
	      k = x.s < 0 && isOdd(n) ? -0 : 0;

	      // If x >= 1, k = ±Infinity.
	      if (x.e > -1) k = 1 / k;

	      // If n is negative return ±0, else return ±Infinity.
	      return new BigNumber(nIsNeg ? 1 / k : k);

	    } else if (POW_PRECISION) {

	      // Truncating each coefficient array to a length of k after each multiplication
	      // equates to truncating significant digits to POW_PRECISION + [28, 41],
	      // i.e. there will be a minimum of 28 guard digits retained.
	      k = mathceil(POW_PRECISION / LOG_BASE + 2);
	    }

	    if (nIsBig) {
	      half = new BigNumber(0.5);
	      if (nIsNeg) n.s = 1;
	      nIsOdd = isOdd(n);
	    } else {
	      i = Math.abs(+valueOf(n));
	      nIsOdd = i % 2;
	    }

	    y = new BigNumber(ONE);

	    // Performs 54 loop iterations for n of 9007199254740991.
	    for (; ;) {

	      if (nIsOdd) {
	        y = y.times(x);
	        if (!y.c) break;

	        if (k) {
	          if (y.c.length > k) y.c.length = k;
	        } else if (isModExp) {
	          y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
	        }
	      }

	      if (i) {
	        i = mathfloor(i / 2);
	        if (i === 0) break;
	        nIsOdd = i % 2;
	      } else {
	        n = n.times(half);
	        round(n, n.e + 1, 1);

	        if (n.e > 14) {
	          nIsOdd = isOdd(n);
	        } else {
	          i = +valueOf(n);
	          if (i === 0) break;
	          nIsOdd = i % 2;
	        }
	      }

	      x = x.times(x);

	      if (k) {
	        if (x.c && x.c.length > k) x.c.length = k;
	      } else if (isModExp) {
	        x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
	      }
	    }

	    if (isModExp) return y;
	    if (nIsNeg) y = ONE.div(y);

	    return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
	  };


	  /*
	   * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
	   * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
	   *
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
	   */
	  P.integerValue = function (rm) {
	    var n = new BigNumber(this);
	    if (rm == null) rm = ROUNDING_MODE;
	    else intCheck(rm, 0, 8);
	    return round(n, n.e + 1, rm);
	  };


	  /*
	   * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
	   * otherwise return false.
	   */
	  P.isEqualTo = P.eq = function (y, b) {
	    return compare$1(this, new BigNumber(y, b)) === 0;
	  };


	  /*
	   * Return true if the value of this BigNumber is a finite number, otherwise return false.
	   */
	  P.isFinite = function () {
	    return !!this.c;
	  };


	  /*
	   * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
	   * otherwise return false.
	   */
	  P.isGreaterThan = P.gt = function (y, b) {
	    return compare$1(this, new BigNumber(y, b)) > 0;
	  };


	  /*
	   * Return true if the value of this BigNumber is greater than or equal to the value of
	   * BigNumber(y, b), otherwise return false.
	   */
	  P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
	    return (b = compare$1(this, new BigNumber(y, b))) === 1 || b === 0;

	  };


	  /*
	   * Return true if the value of this BigNumber is an integer, otherwise return false.
	   */
	  P.isInteger = function () {
	    return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
	  };


	  /*
	   * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
	   * otherwise return false.
	   */
	  P.isLessThan = P.lt = function (y, b) {
	    return compare$1(this, new BigNumber(y, b)) < 0;
	  };


	  /*
	   * Return true if the value of this BigNumber is less than or equal to the value of
	   * BigNumber(y, b), otherwise return false.
	   */
	  P.isLessThanOrEqualTo = P.lte = function (y, b) {
	    return (b = compare$1(this, new BigNumber(y, b))) === -1 || b === 0;
	  };


	  /*
	   * Return true if the value of this BigNumber is NaN, otherwise return false.
	   */
	  P.isNaN = function () {
	    return !this.s;
	  };


	  /*
	   * Return true if the value of this BigNumber is negative, otherwise return false.
	   */
	  P.isNegative = function () {
	    return this.s < 0;
	  };


	  /*
	   * Return true if the value of this BigNumber is positive, otherwise return false.
	   */
	  P.isPositive = function () {
	    return this.s > 0;
	  };


	  /*
	   * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
	   */
	  P.isZero = function () {
	    return !!this.c && this.c[0] == 0;
	  };


	  /*
	   *  n - 0 = n
	   *  n - N = N
	   *  n - I = -I
	   *  0 - n = -n
	   *  0 - 0 = 0
	   *  0 - N = N
	   *  0 - I = -I
	   *  N - n = N
	   *  N - 0 = N
	   *  N - N = N
	   *  N - I = N
	   *  I - n = I
	   *  I - 0 = I
	   *  I - N = N
	   *  I - I = N
	   *
	   * Return a new BigNumber whose value is the value of this BigNumber minus the value of
	   * BigNumber(y, b).
	   */
	  P.minus = function (y, b) {
	    var i, j, t, xLTy,
	      x = this,
	      a = x.s;

	    y = new BigNumber(y, b);
	    b = y.s;

	    // Either NaN?
	    if (!a || !b) return new BigNumber(NaN);

	    // Signs differ?
	    if (a != b) {
	      y.s = -b;
	      return x.plus(y);
	    }

	    var xe = x.e / LOG_BASE,
	      ye = y.e / LOG_BASE,
	      xc = x.c,
	      yc = y.c;

	    if (!xe || !ye) {

	      // Either Infinity?
	      if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

	      // Either zero?
	      if (!xc[0] || !yc[0]) {

	        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
	        return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

	         // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
	         ROUNDING_MODE == 3 ? -0 : 0);
	      }
	    }

	    xe = bitFloor(xe);
	    ye = bitFloor(ye);
	    xc = xc.slice();

	    // Determine which is the bigger number.
	    if (a = xe - ye) {

	      if (xLTy = a < 0) {
	        a = -a;
	        t = xc;
	      } else {
	        ye = xe;
	        t = yc;
	      }

	      t.reverse();

	      // Prepend zeros to equalise exponents.
	      for (b = a; b--; t.push(0));
	      t.reverse();
	    } else {

	      // Exponents equal. Check digit by digit.
	      j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

	      for (a = b = 0; b < j; b++) {

	        if (xc[b] != yc[b]) {
	          xLTy = xc[b] < yc[b];
	          break;
	        }
	      }
	    }

	    // x < y? Point xc to the array of the bigger number.
	    if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

	    b = (j = yc.length) - (i = xc.length);

	    // Append zeros to xc if shorter.
	    // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
	    if (b > 0) for (; b--; xc[i++] = 0);
	    b = BASE - 1;

	    // Subtract yc from xc.
	    for (; j > a;) {

	      if (xc[--j] < yc[j]) {
	        for (i = j; i && !xc[--i]; xc[i] = b);
	        --xc[i];
	        xc[j] += BASE;
	      }

	      xc[j] -= yc[j];
	    }

	    // Remove leading zeros and adjust exponent accordingly.
	    for (; xc[0] == 0; xc.splice(0, 1), --ye);

	    // Zero?
	    if (!xc[0]) {

	      // Following IEEE 754 (2008) 6.3,
	      // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
	      y.s = ROUNDING_MODE == 3 ? -1 : 1;
	      y.c = [y.e = 0];
	      return y;
	    }

	    // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
	    // for finite x and y.
	    return normalise(y, xc, ye);
	  };


	  /*
	   *   n % 0 =  N
	   *   n % N =  N
	   *   n % I =  n
	   *   0 % n =  0
	   *  -0 % n = -0
	   *   0 % 0 =  N
	   *   0 % N =  N
	   *   0 % I =  0
	   *   N % n =  N
	   *   N % 0 =  N
	   *   N % N =  N
	   *   N % I =  N
	   *   I % n =  N
	   *   I % 0 =  N
	   *   I % N =  N
	   *   I % I =  N
	   *
	   * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
	   * BigNumber(y, b). The result depends on the value of MODULO_MODE.
	   */
	  P.modulo = P.mod = function (y, b) {
	    var q, s,
	      x = this;

	    y = new BigNumber(y, b);

	    // Return NaN if x is Infinity or NaN, or y is NaN or zero.
	    if (!x.c || !y.s || y.c && !y.c[0]) {
	      return new BigNumber(NaN);

	    // Return x if y is Infinity or x is zero.
	    } else if (!y.c || x.c && !x.c[0]) {
	      return new BigNumber(x);
	    }

	    if (MODULO_MODE == 9) {

	      // Euclidian division: q = sign(y) * floor(x / abs(y))
	      // r = x - qy    where  0 <= r < abs(y)
	      s = y.s;
	      y.s = 1;
	      q = div(x, y, 0, 3);
	      y.s = s;
	      q.s *= s;
	    } else {
	      q = div(x, y, 0, MODULO_MODE);
	    }

	    y = x.minus(q.times(y));

	    // To match JavaScript %, ensure sign of zero is sign of dividend.
	    if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

	    return y;
	  };


	  /*
	   *  n * 0 = 0
	   *  n * N = N
	   *  n * I = I
	   *  0 * n = 0
	   *  0 * 0 = 0
	   *  0 * N = N
	   *  0 * I = N
	   *  N * n = N
	   *  N * 0 = N
	   *  N * N = N
	   *  N * I = N
	   *  I * n = I
	   *  I * 0 = N
	   *  I * N = N
	   *  I * I = I
	   *
	   * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
	   * of BigNumber(y, b).
	   */
	  P.multipliedBy = P.times = function (y, b) {
	    var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
	      base, sqrtBase,
	      x = this,
	      xc = x.c,
	      yc = (y = new BigNumber(y, b)).c;

	    // Either NaN, ±Infinity or ±0?
	    if (!xc || !yc || !xc[0] || !yc[0]) {

	      // Return NaN if either is NaN, or one is 0 and the other is Infinity.
	      if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
	        y.c = y.e = y.s = null;
	      } else {
	        y.s *= x.s;

	        // Return ±Infinity if either is ±Infinity.
	        if (!xc || !yc) {
	          y.c = y.e = null;

	        // Return ±0 if either is ±0.
	        } else {
	          y.c = [0];
	          y.e = 0;
	        }
	      }

	      return y;
	    }

	    e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
	    y.s *= x.s;
	    xcL = xc.length;
	    ycL = yc.length;

	    // Ensure xc points to longer array and xcL to its length.
	    if (xcL < ycL) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

	    // Initialise the result array with zeros.
	    for (i = xcL + ycL, zc = []; i--; zc.push(0));

	    base = BASE;
	    sqrtBase = SQRT_BASE;

	    for (i = ycL; --i >= 0;) {
	      c = 0;
	      ylo = yc[i] % sqrtBase;
	      yhi = yc[i] / sqrtBase | 0;

	      for (k = xcL, j = i + k; j > i;) {
	        xlo = xc[--k] % sqrtBase;
	        xhi = xc[k] / sqrtBase | 0;
	        m = yhi * xlo + xhi * ylo;
	        xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
	        c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
	        zc[j--] = xlo % base;
	      }

	      zc[j] = c;
	    }

	    if (c) {
	      ++e;
	    } else {
	      zc.splice(0, 1);
	    }

	    return normalise(y, zc, e);
	  };


	  /*
	   * Return a new BigNumber whose value is the value of this BigNumber negated,
	   * i.e. multiplied by -1.
	   */
	  P.negated = function () {
	    var x = new BigNumber(this);
	    x.s = -x.s || null;
	    return x;
	  };


	  /*
	   *  n + 0 = n
	   *  n + N = N
	   *  n + I = I
	   *  0 + n = n
	   *  0 + 0 = 0
	   *  0 + N = N
	   *  0 + I = I
	   *  N + n = N
	   *  N + 0 = N
	   *  N + N = N
	   *  N + I = N
	   *  I + n = I
	   *  I + 0 = I
	   *  I + N = N
	   *  I + I = I
	   *
	   * Return a new BigNumber whose value is the value of this BigNumber plus the value of
	   * BigNumber(y, b).
	   */
	  P.plus = function (y, b) {
	    var t,
	      x = this,
	      a = x.s;

	    y = new BigNumber(y, b);
	    b = y.s;

	    // Either NaN?
	    if (!a || !b) return new BigNumber(NaN);

	    // Signs differ?
	     if (a != b) {
	      y.s = -b;
	      return x.minus(y);
	    }

	    var xe = x.e / LOG_BASE,
	      ye = y.e / LOG_BASE,
	      xc = x.c,
	      yc = y.c;

	    if (!xe || !ye) {

	      // Return ±Infinity if either ±Infinity.
	      if (!xc || !yc) return new BigNumber(a / 0);

	      // Either zero?
	      // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
	      if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
	    }

	    xe = bitFloor(xe);
	    ye = bitFloor(ye);
	    xc = xc.slice();

	    // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
	    if (a = xe - ye) {
	      if (a > 0) {
	        ye = xe;
	        t = yc;
	      } else {
	        a = -a;
	        t = xc;
	      }

	      t.reverse();
	      for (; a--; t.push(0));
	      t.reverse();
	    }

	    a = xc.length;
	    b = yc.length;

	    // Point xc to the longer array, and b to the shorter length.
	    if (a - b < 0) t = yc, yc = xc, xc = t, b = a;

	    // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
	    for (a = 0; b;) {
	      a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
	      xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
	    }

	    if (a) {
	      xc = [a].concat(xc);
	      ++ye;
	    }

	    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
	    // ye = MAX_EXP + 1 possible
	    return normalise(y, xc, ye);
	  };


	  /*
	   * If sd is undefined or null or true or false, return the number of significant digits of
	   * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
	   * If sd is true include integer-part trailing zeros in the count.
	   *
	   * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
	   * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
	   * ROUNDING_MODE if rm is omitted.
	   *
	   * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
	   *                     boolean: whether to count integer-part trailing zeros: true or false.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
	   */
	  P.precision = P.sd = function (sd, rm) {
	    var c, n, v,
	      x = this;

	    if (sd != null && sd !== !!sd) {
	      intCheck(sd, 1, MAX);
	      if (rm == null) rm = ROUNDING_MODE;
	      else intCheck(rm, 0, 8);

	      return round(new BigNumber(x), sd, rm);
	    }

	    if (!(c = x.c)) return null;
	    v = c.length - 1;
	    n = v * LOG_BASE + 1;

	    if (v = c[v]) {

	      // Subtract the number of trailing zeros of the last element.
	      for (; v % 10 == 0; v /= 10, n--);

	      // Add the number of digits of the first element.
	      for (v = c[0]; v >= 10; v /= 10, n++);
	    }

	    if (sd && x.e + 1 > n) n = x.e + 1;

	    return n;
	  };


	  /*
	   * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
	   * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
	   *
	   * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
	   */
	  P.shiftedBy = function (k) {
	    intCheck(k, -MAX_SAFE_INTEGER$2, MAX_SAFE_INTEGER$2);
	    return this.times('1e' + k);
	  };


	  /*
	   *  sqrt(-n) =  N
	   *  sqrt(N) =  N
	   *  sqrt(-I) =  N
	   *  sqrt(I) =  I
	   *  sqrt(0) =  0
	   *  sqrt(-0) = -0
	   *
	   * Return a new BigNumber whose value is the square root of the value of this BigNumber,
	   * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
	   */
	  P.squareRoot = P.sqrt = function () {
	    var m, n, r, rep, t,
	      x = this,
	      c = x.c,
	      s = x.s,
	      e = x.e,
	      dp = DECIMAL_PLACES + 4,
	      half = new BigNumber('0.5');

	    // Negative/NaN/Infinity/zero?
	    if (s !== 1 || !c || !c[0]) {
	      return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
	    }

	    // Initial estimate.
	    s = Math.sqrt(+valueOf(x));

	    // Math.sqrt underflow/overflow?
	    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
	    if (s == 0 || s == 1 / 0) {
	      n = coeffToString(c);
	      if ((n.length + e) % 2 == 0) n += '0';
	      s = Math.sqrt(+n);
	      e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

	      if (s == 1 / 0) {
	        n = '1e' + e;
	      } else {
	        n = s.toExponential();
	        n = n.slice(0, n.indexOf('e') + 1) + e;
	      }

	      r = new BigNumber(n);
	    } else {
	      r = new BigNumber(s + '');
	    }

	    // Check for zero.
	    // r could be zero if MIN_EXP is changed after the this value was created.
	    // This would cause a division by zero (x/t) and hence Infinity below, which would cause
	    // coeffToString to throw.
	    if (r.c[0]) {
	      e = r.e;
	      s = e + dp;
	      if (s < 3) s = 0;

	      // Newton-Raphson iteration.
	      for (; ;) {
	        t = r;
	        r = half.times(t.plus(div(x, t, dp, 1)));

	        if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

	          // The exponent of r may here be one less than the final result exponent,
	          // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
	          // are indexed correctly.
	          if (r.e < e) --s;
	          n = n.slice(s - 3, s + 1);

	          // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
	          // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
	          // iteration.
	          if (n == '9999' || !rep && n == '4999') {

	            // On the first iteration only, check to see if rounding up gives the
	            // exact result as the nines may infinitely repeat.
	            if (!rep) {
	              round(t, t.e + DECIMAL_PLACES + 2, 0);

	              if (t.times(t).eq(x)) {
	                r = t;
	                break;
	              }
	            }

	            dp += 4;
	            s += 4;
	            rep = 1;
	          } else {

	            // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
	            // result. If not, then there are further digits and m will be truthy.
	            if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

	              // Truncate to the first rounding digit.
	              round(r, r.e + DECIMAL_PLACES + 2, 1);
	              m = !r.times(r).eq(x);
	            }

	            break;
	          }
	        }
	      }
	    }

	    return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
	  };


	  /*
	   * Return a string representing the value of this BigNumber in exponential notation and
	   * rounded using ROUNDING_MODE to dp fixed decimal places.
	   *
	   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
	   */
	  P.toExponential = function (dp, rm) {
	    if (dp != null) {
	      intCheck(dp, 0, MAX);
	      dp++;
	    }
	    return format(this, dp, rm, 1);
	  };


	  /*
	   * Return a string representing the value of this BigNumber in fixed-point notation rounding
	   * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
	   *
	   * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
	   * but e.g. (-0.00001).toFixed(0) is '-0'.
	   *
	   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
	   */
	  P.toFixed = function (dp, rm) {
	    if (dp != null) {
	      intCheck(dp, 0, MAX);
	      dp = dp + this.e + 1;
	    }
	    return format(this, dp, rm);
	  };


	  /*
	   * Return a string representing the value of this BigNumber in fixed-point notation rounded
	   * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
	   * of the format or FORMAT object (see BigNumber.set).
	   *
	   * The formatting object may contain some or all of the properties shown below.
	   *
	   * FORMAT = {
	   *   prefix: '',
	   *   groupSize: 3,
	   *   secondaryGroupSize: 0,
	   *   groupSeparator: ',',
	   *   decimalSeparator: '.',
	   *   fractionGroupSize: 0,
	   *   fractionGroupSeparator: '\xA0',      // non-breaking space
	   *   suffix: ''
	   * };
	   *
	   * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   * [format] {object} Formatting options. See FORMAT pbject above.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
	   * '[BigNumber Error] Argument not an object: {format}'
	   */
	  P.toFormat = function (dp, rm, format) {
	    var str,
	      x = this;

	    if (format == null) {
	      if (dp != null && rm && typeof rm == 'object') {
	        format = rm;
	        rm = null;
	      } else if (dp && typeof dp == 'object') {
	        format = dp;
	        dp = rm = null;
	      } else {
	        format = FORMAT;
	      }
	    } else if (typeof format != 'object') {
	      throw Error
	        (bignumberError + 'Argument not an object: ' + format);
	    }

	    str = x.toFixed(dp, rm);

	    if (x.c) {
	      var i,
	        arr = str.split('.'),
	        g1 = +format.groupSize,
	        g2 = +format.secondaryGroupSize,
	        groupSeparator = format.groupSeparator || '',
	        intPart = arr[0],
	        fractionPart = arr[1],
	        isNeg = x.s < 0,
	        intDigits = isNeg ? intPart.slice(1) : intPart,
	        len = intDigits.length;

	      if (g2) i = g1, g1 = g2, g2 = i, len -= i;

	      if (g1 > 0 && len > 0) {
	        i = len % g1 || g1;
	        intPart = intDigits.substr(0, i);
	        for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
	        if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
	        if (isNeg) intPart = '-' + intPart;
	      }

	      str = fractionPart
	       ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
	        ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
	         '$&' + (format.fractionGroupSeparator || ''))
	        : fractionPart)
	       : intPart;
	    }

	    return (format.prefix || '') + str + (format.suffix || '');
	  };


	  /*
	   * Return an array of two BigNumbers representing the value of this BigNumber as a simple
	   * fraction with an integer numerator and an integer denominator.
	   * The denominator will be a positive non-zero value less than or equal to the specified
	   * maximum denominator. If a maximum denominator is not specified, the denominator will be
	   * the lowest value necessary to represent the number exactly.
	   *
	   * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
	   *
	   * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
	   */
	  P.toFraction = function (md) {
	    var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
	      x = this,
	      xc = x.c;

	    if (md != null) {
	      n = new BigNumber(md);

	      // Throw if md is less than one or is not an integer, unless it is Infinity.
	      if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
	        throw Error
	          (bignumberError + 'Argument ' +
	            (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
	      }
	    }

	    if (!xc) return new BigNumber(x);

	    d = new BigNumber(ONE);
	    n1 = d0 = new BigNumber(ONE);
	    d1 = n0 = new BigNumber(ONE);
	    s = coeffToString(xc);

	    // Determine initial denominator.
	    // d is a power of 10 and the minimum max denominator that specifies the value exactly.
	    e = d.e = s.length - x.e - 1;
	    d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
	    md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

	    exp = MAX_EXP;
	    MAX_EXP = 1 / 0;
	    n = new BigNumber(s);

	    // n0 = d1 = 0
	    n0.c[0] = 0;

	    for (; ;)  {
	      q = div(n, d, 0, 1);
	      d2 = d0.plus(q.times(d1));
	      if (d2.comparedTo(md) == 1) break;
	      d0 = d1;
	      d1 = d2;
	      n1 = n0.plus(q.times(d2 = n1));
	      n0 = d2;
	      d = n.minus(q.times(d2 = d));
	      n = d2;
	    }

	    d2 = div(md.minus(d0), d1, 0, 1);
	    n0 = n0.plus(d2.times(n1));
	    d0 = d0.plus(d2.times(d1));
	    n0.s = n1.s = x.s;
	    e = e * 2;

	    // Determine which fraction is closer to x, n0/d0 or n1/d1
	    r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
	        div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

	    MAX_EXP = exp;

	    return r;
	  };


	  /*
	   * Return the value of this BigNumber converted to a number primitive.
	   */
	  P.toNumber = function () {
	    return +valueOf(this);
	  };


	  /*
	   * Return a string representing the value of this BigNumber rounded to sd significant digits
	   * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
	   * necessary to represent the integer part of the value in fixed-point notation, then use
	   * exponential notation.
	   *
	   * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
	   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
	   *
	   * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
	   */
	  P.toPrecision = function (sd, rm) {
	    if (sd != null) intCheck(sd, 1, MAX);
	    return format(this, sd, rm, 2);
	  };


	  /*
	   * Return a string representing the value of this BigNumber in base b, or base 10 if b is
	   * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
	   * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
	   * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
	   * TO_EXP_NEG, return exponential notation.
	   *
	   * [b] {number} Integer, 2 to ALPHABET.length inclusive.
	   *
	   * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
	   */
	  P.toString = function (b) {
	    var str,
	      n = this,
	      s = n.s,
	      e = n.e;

	    // Infinity or NaN?
	    if (e === null) {
	      if (s) {
	        str = 'Infinity';
	        if (s < 0) str = '-' + str;
	      } else {
	        str = 'NaN';
	      }
	    } else {
	      if (b == null) {
	        str = e <= TO_EXP_NEG || e >= TO_EXP_POS
	         ? toExponential(coeffToString(n.c), e)
	         : toFixedPoint(coeffToString(n.c), e, '0');
	      } else if (b === 10) {
	        n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
	        str = toFixedPoint(coeffToString(n.c), n.e, '0');
	      } else {
	        intCheck(b, 2, ALPHABET.length, 'Base');
	        str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
	      }

	      if (s < 0 && n.c[0]) str = '-' + str;
	    }

	    return str;
	  };


	  /*
	   * Return as toString, but do not accept a base argument, and include the minus sign for
	   * negative zero.
	   */
	  P.valueOf = P.toJSON = function () {
	    return valueOf(this);
	  };


	  P._isBigNumber = true;

	  P[Symbol.toStringTag] = 'BigNumber';

	  // Node.js v10.12.0+
	  P[Symbol.for('nodejs.util.inspect.custom')] = P.valueOf;

	  if (configObject != null) BigNumber.set(configObject);

	  return BigNumber;
	}


	// PRIVATE HELPER FUNCTIONS

	// These functions don't need access to variables,
	// e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


	function bitFloor(n) {
	  var i = n | 0;
	  return n > 0 || n === i ? i : i - 1;
	}


	// Return a coefficient array as a string of base 10 digits.
	function coeffToString(a) {
	  var s, z,
	    i = 1,
	    j = a.length,
	    r = a[0] + '';

	  for (; i < j;) {
	    s = a[i++] + '';
	    z = LOG_BASE - s.length;
	    for (; z--; s = '0' + s);
	    r += s;
	  }

	  // Determine trailing zeros.
	  for (j = r.length; r.charCodeAt(--j) === 48;);

	  return r.slice(0, j + 1 || 1);
	}


	// Compare the value of BigNumbers x and y.
	function compare$1(x, y) {
	  var a, b,
	    xc = x.c,
	    yc = y.c,
	    i = x.s,
	    j = y.s,
	    k = x.e,
	    l = y.e;

	  // Either NaN?
	  if (!i || !j) return null;

	  a = xc && !xc[0];
	  b = yc && !yc[0];

	  // Either zero?
	  if (a || b) return a ? b ? 0 : -j : i;

	  // Signs differ?
	  if (i != j) return i;

	  a = i < 0;
	  b = k == l;

	  // Either Infinity?
	  if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

	  // Compare exponents.
	  if (!b) return k > l ^ a ? 1 : -1;

	  j = (k = xc.length) < (l = yc.length) ? k : l;

	  // Compare digit by digit.
	  for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

	  // Compare lengths.
	  return k == l ? 0 : k > l ^ a ? 1 : -1;
	}


	/*
	 * Check that n is a primitive number, an integer, and in range, otherwise throw.
	 */
	function intCheck(n, min, max, name) {
	  if (n < min || n > max || n !== mathfloor(n)) {
	    throw Error
	     (bignumberError + (name || 'Argument') + (typeof n == 'number'
	       ? n < min || n > max ? ' out of range: ' : ' not an integer: '
	       : ' not a primitive number: ') + String(n));
	  }
	}


	// Assumes finite n.
	function isOdd(n) {
	  var k = n.c.length - 1;
	  return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
	}


	function toExponential(str, e) {
	  return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
	   (e < 0 ? 'e' : 'e+') + e;
	}


	function toFixedPoint(str, e, z) {
	  var len, zs;

	  // Negative exponent?
	  if (e < 0) {

	    // Prepend zeros.
	    for (zs = z + '.'; ++e; zs += z);
	    str = zs + str;

	  // Positive exponent
	  } else {
	    len = str.length;

	    // Append zeros.
	    if (++e > len) {
	      for (zs = z, e -= len; --e; zs += z);
	      str += zs;
	    } else if (e < len) {
	      str = str.slice(0, e) + '.' + str.slice(e);
	    }
	  }

	  return str;
	}


	// EXPORT


	var BigNumber = clone$1();

	var bignumber = /*#__PURE__*/Object.freeze({
		__proto__: null,
		BigNumber: BigNumber,
		'default': BigNumber
	});

	var require$$0$1 = getCjsExportFromNamespace(bignumber);

	var stringify = createCommonjsModule(function (module) {
	/*
	    json2.js
	    2013-05-26

	    Public Domain.

	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	    See http://www.JSON.org/js.html


	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html

	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.


	    This file creates a global JSON object containing two methods: stringify
	    and parse.

	        JSON.stringify(value, replacer, space)
	            value       any JavaScript value, usually an object or array.

	            replacer    an optional parameter that determines how object
	                        values are stringified for objects. It can be a
	                        function or an array of strings.

	            space       an optional parameter that specifies the indentation
	                        of nested structures. If it is omitted, the text will
	                        be packed without extra whitespace. If it is a number,
	                        it will specify the number of spaces to indent at each
	                        level. If it is a string (such as '\t' or '&nbsp;'),
	                        it contains the characters used to indent at each level.

	            This method produces a JSON text from a JavaScript value.

	            When an object value is found, if the object contains a toJSON
	            method, its toJSON method will be called and the result will be
	            stringified. A toJSON method does not serialize: it returns the
	            value represented by the name/value pair that should be serialized,
	            or undefined if nothing should be serialized. The toJSON method
	            will be passed the key associated with the value, and this will be
	            bound to the value

	            For example, this would serialize Dates as ISO strings.

	                Date.prototype.toJSON = function (key) {
	                    function f(n) {
	                        // Format integers to have at least two digits.
	                        return n < 10 ? '0' + n : n;
	                    }

	                    return this.getUTCFullYear()   + '-' +
	                         f(this.getUTCMonth() + 1) + '-' +
	                         f(this.getUTCDate())      + 'T' +
	                         f(this.getUTCHours())     + ':' +
	                         f(this.getUTCMinutes())   + ':' +
	                         f(this.getUTCSeconds())   + 'Z';
	                };

	            You can provide an optional replacer method. It will be passed the
	            key and value of each member, with this bound to the containing
	            object. The value that is returned from your method will be
	            serialized. If your method returns undefined, then the member will
	            be excluded from the serialization.

	            If the replacer parameter is an array of strings, then it will be
	            used to select the members to be serialized. It filters the results
	            such that only members with keys listed in the replacer array are
	            stringified.

	            Values that do not have JSON representations, such as undefined or
	            functions, will not be serialized. Such values in objects will be
	            dropped; in arrays they will be replaced with null. You can use
	            a replacer function to replace those with JSON values.
	            JSON.stringify(undefined) returns undefined.

	            The optional space parameter produces a stringification of the
	            value that is filled with line breaks and indentation to make it
	            easier to read.

	            If the space parameter is a non-empty string, then that string will
	            be used for indentation. If the space parameter is a number, then
	            the indentation will be that many spaces.

	            Example:

	            text = JSON.stringify(['e', {pluribus: 'unum'}]);
	            // text is '["e",{"pluribus":"unum"}]'


	            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
	            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

	            text = JSON.stringify([new Date()], function (key, value) {
	                return this[key] instanceof Date ?
	                    'Date(' + this[key] + ')' : value;
	            });
	            // text is '["Date(---current time---)"]'


	        JSON.parse(text, reviver)
	            This method parses a JSON text to produce an object or array.
	            It can throw a SyntaxError exception.

	            The optional reviver parameter is a function that can filter and
	            transform the results. It receives each of the keys and values,
	            and its return value is used instead of the original value.
	            If it returns what it received, then the structure is not modified.
	            If it returns undefined then the member is deleted.

	            Example:

	            // Parse the text. Values that look like ISO date strings will
	            // be converted to Date objects.

	            myData = JSON.parse(text, function (key, value) {
	                var a;
	                if (typeof value === 'string') {
	                    a =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
	                    if (a) {
	                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
	                            +a[5], +a[6]));
	                    }
	                }
	                return value;
	            });

	            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
	                var d;
	                if (typeof value === 'string' &&
	                        value.slice(0, 5) === 'Date(' &&
	                        value.slice(-1) === ')') {
	                    d = new Date(value.slice(5, -1));
	                    if (d) {
	                        return d;
	                    }
	                }
	                return value;
	            });


	    This is a reference implementation. You are free to copy, modify, or
	    redistribute.
	*/

	/*jslint evil: true, regexp: true */

	/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
	    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
	    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
	    lastIndex, length, parse, prototype, push, replace, slice, stringify,
	    test, toJSON, toString, valueOf
	*/


	// Create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.

	var JSON = module.exports;

	(function () {

	    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        gap,
	        indent,
	        meta = {    // table of character substitutions
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            '"' : '\\"',
	            '\\': '\\\\'
	        },
	        rep;


	    function quote(string) {

	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.

	        escapable.lastIndex = 0;
	        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
	            var c = meta[a];
	            return typeof c === 'string'
	                ? c
	                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	        }) + '"' : '"' + string + '"';
	    }


	    function str(key, holder) {

	// Produce a string from holder[key].

	        var i,          // The loop counter.
	            k,          // The member key.
	            v,          // The member value.
	            length,
	            mind = gap,
	            partial,
	            value = holder[key],
	            isBigNumber = value != null && (value instanceof require$$0$1 || require$$0$1.isBigNumber(value));

	// If the value has a toJSON method, call it to obtain a replacement value.

	        if (value && typeof value === 'object' &&
	                typeof value.toJSON === 'function') {
	            value = value.toJSON(key);
	        }

	// If we were called with a replacer function, then call the replacer to
	// obtain a replacement value.

	        if (typeof rep === 'function') {
	            value = rep.call(holder, key, value);
	        }

	// What happens next depends on the value's type.

	        switch (typeof value) {
	        case 'string':
	            if (isBigNumber) {
	                return value;
	            } else {
	                return quote(value);
	            }

	        case 'number':

	// JSON numbers must be finite. Encode non-finite numbers as null.

	            return isFinite(value) ? String(value) : 'null';

	        case 'boolean':
	        case 'null':

	// If the value is a boolean or null, convert it to a string. Note:
	// typeof null does not produce 'null'. The case is included here in
	// the remote chance that this gets fixed someday.

	            return String(value);

	// If the type is 'object', we might be dealing with an object or an array or
	// null.

	        case 'object':

	// Due to a specification blunder in ECMAScript, typeof null is 'object',
	// so watch out for that case.

	            if (!value) {
	                return 'null';
	            }

	// Make an array to hold the partial results of stringifying this object value.

	            gap += indent;
	            partial = [];

	// Is the value an array?

	            if (Object.prototype.toString.apply(value) === '[object Array]') {

	// The value is an array. Stringify every element. Use null as a placeholder
	// for non-JSON values.

	                length = value.length;
	                for (i = 0; i < length; i += 1) {
	                    partial[i] = str(i, value) || 'null';
	                }

	// Join all of the elements together, separated with commas, and wrap them in
	// brackets.

	                v = partial.length === 0
	                    ? '[]'
	                    : gap
	                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
	                    : '[' + partial.join(',') + ']';
	                gap = mind;
	                return v;
	            }

	// If the replacer is an array, use it to select the members to be stringified.

	            if (rep && typeof rep === 'object') {
	                length = rep.length;
	                for (i = 0; i < length; i += 1) {
	                    if (typeof rep[i] === 'string') {
	                        k = rep[i];
	                        v = str(k, value);
	                        if (v) {
	                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                        }
	                    }
	                }
	            } else {

	// Otherwise, iterate through all of the keys in the object.

	                Object.keys(value).forEach(function(k) {
	                    var v = str(k, value);
	                    if (v) {
	                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
	                    }
	                });
	            }

	// Join all of the member texts together, separated with commas,
	// and wrap them in braces.

	            v = partial.length === 0
	                ? '{}'
	                : gap
	                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
	                : '{' + partial.join(',') + '}';
	            gap = mind;
	            return v;
	        }
	    }

	// If the JSON object does not yet have a stringify method, give it one.

	    if (typeof JSON.stringify !== 'function') {
	        JSON.stringify = function (value, replacer, space) {

	// The stringify method takes a value and an optional replacer, and an optional
	// space parameter, and returns a JSON text. The replacer can be a function
	// that can replace values, or an array of strings that will select the keys.
	// A default replacer method can be provided. Use of the space parameter can
	// produce text that is more easily readable.

	            var i;
	            gap = '';
	            indent = '';

	// If the space parameter is a number, make an indent string containing that
	// many spaces.

	            if (typeof space === 'number') {
	                for (i = 0; i < space; i += 1) {
	                    indent += ' ';
	                }

	// If the space parameter is a string, it will be used as the indent string.

	            } else if (typeof space === 'string') {
	                indent = space;
	            }

	// If there is a replacer, it must be a function or an array.
	// Otherwise, throw an error.

	            rep = replacer;
	            if (replacer && typeof replacer !== 'function' &&
	                    (typeof replacer !== 'object' ||
	                    typeof replacer.length !== 'number')) {
	                throw new Error('JSON.stringify');
	            }

	// Make a fake root object containing our value under the key of ''.
	// Return the result of stringifying the value.

	            return str('', {'': value});
	        };
	    }
	}());
	});

	var BigNumber$1 = null;
	/*
	    json_parse.js
	    2012-06-20

	    Public Domain.

	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	    This file creates a json_parse function.
	    During create you can (optionally) specify some behavioural switches

	        require('json-bigint')(options)

	            The optional options parameter holds switches that drive certain
	            aspects of the parsing process:
	            * options.strict = true will warn about duplicate-key usage in the json.
	              The default (strict = false) will silently ignore those and overwrite
	              values for keys that are in duplicate use.

	    The resulting function follows this signature:
	        json_parse(text, reviver)
	            This method parses a JSON text to produce an object or array.
	            It can throw a SyntaxError exception.

	            The optional reviver parameter is a function that can filter and
	            transform the results. It receives each of the keys and values,
	            and its return value is used instead of the original value.
	            If it returns what it received, then the structure is not modified.
	            If it returns undefined then the member is deleted.

	            Example:

	            // Parse the text. Values that look like ISO date strings will
	            // be converted to Date objects.

	            myData = json_parse(text, function (key, value) {
	                var a;
	                if (typeof value === 'string') {
	                    a =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
	                    if (a) {
	                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
	                            +a[5], +a[6]));
	                    }
	                }
	                return value;
	            });

	    This is a reference implementation. You are free to copy, modify, or
	    redistribute.

	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html

	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.
	*/

	/*members "", "\"", "\/", "\\", at, b, call, charAt, f, fromCharCode,
	    hasOwnProperty, message, n, name, prototype, push, r, t, text
	*/

	var json_parse = function (options) {

	// This is a function that can parse a JSON text, producing a JavaScript
	// data structure. It is a simple, recursive descent parser. It does not use
	// eval or regular expressions, so it can be used as a model for implementing
	// a JSON parser in other languages.

	// We are defining the function inside of another function to avoid creating
	// global variables.


	// Default options one can override by passing options to the parse()
	    var _options = {
	        "strict": false,  // not being strict means do not generate syntax errors for "duplicate key"
	        "storeAsString": false // toggles whether the values should be stored as BigNumber (default) or a string
	    };


	// If there are options, then use them to override the default _options
	    if (options !== undefined && options !== null) {
	        if (options.strict === true) {
	            _options.strict = true;
	        }
	        if (options.storeAsString === true) {
	            _options.storeAsString = true;
	        }
	    }


	    var at,     // The index of the current character
	        ch,     // The current character
	        escapee = {
	            '"':  '"',
	            '\\': '\\',
	            '/':  '/',
	            b:    '\b',
	            f:    '\f',
	            n:    '\n',
	            r:    '\r',
	            t:    '\t'
	        },
	        text,

	        error = function (m) {

	// Call error when something is wrong.

	            throw {
	                name:    'SyntaxError',
	                message: m,
	                at:      at,
	                text:    text
	            };
	        },

	        next = function (c) {

	// If a c parameter is provided, verify that it matches the current character.

	            if (c && c !== ch) {
	                error("Expected '" + c + "' instead of '" + ch + "'");
	            }

	// Get the next character. When there are no more characters,
	// return the empty string.

	            ch = text.charAt(at);
	            at += 1;
	            return ch;
	        },

	        number = function () {
	// Parse a number value.

	            var number,
	                string = '';

	            if (ch === '-') {
	                string = '-';
	                next('-');
	            }
	            while (ch >= '0' && ch <= '9') {
	                string += ch;
	                next();
	            }
	            if (ch === '.') {
	                string += '.';
	                while (next() && ch >= '0' && ch <= '9') {
	                    string += ch;
	                }
	            }
	            if (ch === 'e' || ch === 'E') {
	                string += ch;
	                next();
	                if (ch === '-' || ch === '+') {
	                    string += ch;
	                    next();
	                }
	                while (ch >= '0' && ch <= '9') {
	                    string += ch;
	                    next();
	                }
	            }
	            number = +string;
	            if (!isFinite(number)) {
	                error("Bad number");
	            } else {
	                if (BigNumber$1 == null)
	                  BigNumber$1 = require$$0$1;
	                //if (number > 9007199254740992 || number < -9007199254740992)
	                // Bignumber has stricter check: everything with length > 15 digits disallowed
	                if (string.length > 15)
	                   return (_options.storeAsString === true) ? string : new BigNumber$1(string);
	                return number;
	            }
	        },

	        string = function () {

	// Parse a string value.

	            var hex,
	                i,
	                string = '',
	                uffff;

	// When parsing for string values, we must look for " and \ characters.

	            if (ch === '"') {
	                while (next()) {
	                    if (ch === '"') {
	                        next();
	                        return string;
	                    }
	                    if (ch === '\\') {
	                        next();
	                        if (ch === 'u') {
	                            uffff = 0;
	                            for (i = 0; i < 4; i += 1) {
	                                hex = parseInt(next(), 16);
	                                if (!isFinite(hex)) {
	                                    break;
	                                }
	                                uffff = uffff * 16 + hex;
	                            }
	                            string += String.fromCharCode(uffff);
	                        } else if (typeof escapee[ch] === 'string') {
	                            string += escapee[ch];
	                        } else {
	                            break;
	                        }
	                    } else {
	                        string += ch;
	                    }
	                }
	            }
	            error("Bad string");
	        },

	        white = function () {

	// Skip whitespace.

	            while (ch && ch <= ' ') {
	                next();
	            }
	        },

	        word = function () {

	// true, false, or null.

	            switch (ch) {
	            case 't':
	                next('t');
	                next('r');
	                next('u');
	                next('e');
	                return true;
	            case 'f':
	                next('f');
	                next('a');
	                next('l');
	                next('s');
	                next('e');
	                return false;
	            case 'n':
	                next('n');
	                next('u');
	                next('l');
	                next('l');
	                return null;
	            }
	            error("Unexpected '" + ch + "'");
	        },

	        value,  // Place holder for the value function.

	        array = function () {

	// Parse an array value.

	            var array = [];

	            if (ch === '[') {
	                next('[');
	                white();
	                if (ch === ']') {
	                    next(']');
	                    return array;   // empty array
	                }
	                while (ch) {
	                    array.push(value());
	                    white();
	                    if (ch === ']') {
	                        next(']');
	                        return array;
	                    }
	                    next(',');
	                    white();
	                }
	            }
	            error("Bad array");
	        },

	        object = function () {

	// Parse an object value.

	            var key,
	                object = {};

	            if (ch === '{') {
	                next('{');
	                white();
	                if (ch === '}') {
	                    next('}');
	                    return object;   // empty object
	                }
	                while (ch) {
	                    key = string();
	                    white();
	                    next(':');
	                    if (_options.strict === true && Object.hasOwnProperty.call(object, key)) {
	                        error('Duplicate key "' + key + '"');
	                    }
	                    object[key] = value();
	                    white();
	                    if (ch === '}') {
	                        next('}');
	                        return object;
	                    }
	                    next(',');
	                    white();
	                }
	            }
	            error("Bad object");
	        };

	    value = function () {

	// Parse a JSON value. It could be an object, an array, a string, a number,
	// or a word.

	        white();
	        switch (ch) {
	        case '{':
	            return object();
	        case '[':
	            return array();
	        case '"':
	            return string();
	        case '-':
	            return number();
	        default:
	            return ch >= '0' && ch <= '9' ? number() : word();
	        }
	    };

	// Return the json_parse function. It will have access to all of the above
	// functions and variables.

	    return function (source, reviver) {
	        var result;

	        text = source + '';
	        at = 0;
	        ch = ' ';
	        result = value();
	        white();
	        if (ch) {
	            error("Syntax error");
	        }

	// If there is a reviver function, we recursively walk the new structure,
	// passing each name/value pair to the reviver function for possible
	// transformation, starting with a temporary root object that holds the result
	// in an empty key. If there is not a reviver function, we simply return the
	// result.

	        return typeof reviver === 'function'
	            ? (function walk(holder, key) {
	                var v, value = holder[key];
	                if (value && typeof value === 'object') {
	                    Object.keys(value).forEach(function(k) {
	                        v = walk(value, k);
	                        if (v !== undefined) {
	                            value[k] = v;
	                        } else {
	                            delete value[k];
	                        }
	                    });
	                }
	                return reviver.call(holder, key, value);
	            }({'': result}, ''))
	            : result;
	    };
	};

	var parse$4 = json_parse;

	var json_stringify = stringify.stringify;


	var jsonBigint = function(options) {
	    return  {
	        parse: parse$4(options),
	        stringify: json_stringify
	    }
	};
	//create the default method members with no options applied for backwards compatibility
	var parse$5 = parse$4();
	var stringify$1 = json_stringify;
	jsonBigint.parse = parse$5;
	jsonBigint.stringify = stringify$1;

	var src$6 = createCommonjsModule(function (module, exports) {
	/**
	 * Copyright 2018 Google LLC
	 *
	 * Distributed under MIT license.
	 * See file LICENSE for detail or copy at https://opensource.org/licenses/MIT
	 */
	Object.defineProperty(exports, "__esModule", { value: true });


	exports.HOST_ADDRESS = 'http://169.254.169.254';
	exports.BASE_PATH = '/computeMetadata/v1';
	exports.BASE_URL = exports.HOST_ADDRESS + exports.BASE_PATH;
	exports.SECONDARY_HOST_ADDRESS = 'http://metadata.google.internal.';
	exports.SECONDARY_BASE_URL = exports.SECONDARY_HOST_ADDRESS + exports.BASE_PATH;
	exports.HEADER_NAME = 'Metadata-Flavor';
	exports.HEADER_VALUE = 'Google';
	exports.HEADERS = Object.freeze({ [exports.HEADER_NAME]: exports.HEADER_VALUE });
	// Accepts an options object passed from the user to the API. In previous
	// versions of the API, it referred to a `Request` or an `Axios` request
	// options object.  Now it refers to an object with very limited property
	// names. This is here to help ensure users don't pass invalid options when
	// they  upgrade from 0.4 to 0.5 to 0.8.
	function validate(options) {
	    Object.keys(options).forEach(key => {
	        switch (key) {
	            case 'params':
	            case 'property':
	            case 'headers':
	                break;
	            case 'qs':
	                throw new Error(`'qs' is not a valid configuration option. Please use 'params' instead.`);
	            default:
	                throw new Error(`'${key}' is not a valid configuration option.`);
	        }
	    });
	}
	async function metadataAccessor(type, options, noResponseRetries = 3, fastFail = false) {
	    options = options || {};
	    if (typeof options === 'string') {
	        options = { property: options };
	    }
	    let property = '';
	    if (typeof options === 'object' && options.property) {
	        property = '/' + options.property;
	    }
	    validate(options);
	    try {
	        const requestMethod = fastFail ? fastFailMetadataRequest : src$5.request;
	        const res = await requestMethod({
	            url: `${exports.BASE_URL}/${type}${property}`,
	            headers: Object.assign({}, exports.HEADERS, options.headers),
	            retryConfig: { noResponseRetries },
	            params: options.params,
	            responseType: 'text',
	            timeout: requestTimeout(),
	        });
	        // NOTE: node.js converts all incoming headers to lower case.
	        if (res.headers[exports.HEADER_NAME.toLowerCase()] !== exports.HEADER_VALUE) {
	            throw new Error(`Invalid response from metadata service: incorrect ${exports.HEADER_NAME} header.`);
	        }
	        else if (!res.data) {
	            throw new Error('Invalid response from the metadata service');
	        }
	        if (typeof res.data === 'string') {
	            try {
	                return jsonBigint.parse(res.data);
	            }
	            catch (_a) {
	                /* ignore */
	            }
	        }
	        return res.data;
	    }
	    catch (e) {
	        if (e.response && e.response.status !== 200) {
	            e.message = `Unsuccessful response status code. ${e.message}`;
	        }
	        throw e;
	    }
	}
	async function fastFailMetadataRequest(options) {
	    const secondaryOptions = Object.assign(Object.assign({}, options), { url: options.url.replace(exports.BASE_URL, exports.SECONDARY_BASE_URL) });
	    // We race a connection between DNS/IP to metadata server. There are a couple
	    // reasons for this:
	    //
	    // 1. the DNS is slow in some GCP environments; by checking both, we might
	    //    detect the runtime environment signficantly faster.
	    // 2. we can't just check the IP, which is tarpitted and slow to respond
	    //    on a user's local machine.
	    //
	    // Additional logic has been added to make sure that we don't create an
	    // unhandled rejection in scenarios where a failure happens sometime
	    // after a success.
	    //
	    // Note, however, if a failure happens prior to a success, a rejection should
	    // occur, this is for folks running locally.
	    //
	    let responded = false;
	    const r1 = src$5.request(options)
	        .then(res => {
	        responded = true;
	        return res;
	    })
	        .catch(err => {
	        if (responded) {
	            return r2;
	        }
	        else {
	            responded = true;
	            throw err;
	        }
	    });
	    const r2 = src$5.request(secondaryOptions)
	        .then(res => {
	        responded = true;
	        return res;
	    })
	        .catch(err => {
	        if (responded) {
	            return r1;
	        }
	        else {
	            responded = true;
	            throw err;
	        }
	    });
	    return Promise.race([r1, r2]);
	}
	// tslint:disable-next-line no-any
	function instance(options) {
	    return metadataAccessor('instance', options);
	}
	exports.instance = instance;
	// tslint:disable-next-line no-any
	function project(options) {
	    return metadataAccessor('project', options);
	}
	exports.project = project;
	/*
	 * How many times should we retry detecting GCP environment.
	 */
	function detectGCPAvailableRetries() {
	    return process.env.DETECT_GCP_RETRIES
	        ? Number(process.env.DETECT_GCP_RETRIES)
	        : 0;
	}
	/**
	 * Determine if the metadata server is currently available.
	 */
	let cachedIsAvailableResponse;
	async function isAvailable() {
	    try {
	        // If a user is instantiating several GCP libraries at the same time,
	        // this may result in multiple calls to isAvailable(), to detect the
	        // runtime environment. We use the same promise for each of these calls
	        // to reduce the network load.
	        if (cachedIsAvailableResponse === undefined) {
	            cachedIsAvailableResponse = metadataAccessor('instance', undefined, detectGCPAvailableRetries(), true);
	        }
	        await cachedIsAvailableResponse;
	        return true;
	    }
	    catch (err) {
	        if (process.env.DEBUG_AUTH) {
	            console.info(err);
	        }
	        if (err.type === 'request-timeout') {
	            // If running in a GCP environment, metadata endpoint should return
	            // within ms.
	            return false;
	        }
	        else if (err.code &&
	            [
	                'EHOSTDOWN',
	                'EHOSTUNREACH',
	                'ENETUNREACH',
	                'ENOENT',
	                'ENOTFOUND',
	                'ECONNREFUSED',
	            ].includes(err.code)) {
	            // Failure to resolve the metadata service means that it is not available.
	            return false;
	        }
	        else if (err.response && err.response.status === 404) {
	            return false;
	        }
	        // Throw unexpected errors.
	        throw err;
	    }
	}
	exports.isAvailable = isAvailable;
	/**
	 * reset the memoized isAvailable() lookup.
	 */
	function resetIsAvailableCache() {
	    cachedIsAvailableResponse = undefined;
	}
	exports.resetIsAvailableCache = resetIsAvailableCache;
	function requestTimeout() {
	    // In testing, we were able to reproduce behavior similar to
	    // https://github.com/googleapis/google-auth-library-nodejs/issues/798
	    // by making many concurrent network requests. Requests do not actually fail,
	    // rather they take significantly longer to complete (and we hit our
	    // default 3000ms timeout).
	    //
	    // This logic detects a GCF environment, using the documented environment
	    // variables K_SERVICE and FUNCTION_NAME:
	    // https://cloud.google.com/functions/docs/env-var and, in a GCF environment
	    // eliminates timeouts (by setting the value to 0 to disable).
	    return process.env.K_SERVICE || process.env.FUNCTION_NAME ? 0 : 3000;
	}
	exports.requestTimeout = requestTimeout;

	});

	unwrapExports(src$6);
	var src_1$2 = src$6.HOST_ADDRESS;
	var src_2$2 = src$6.BASE_PATH;
	var src_3$2 = src$6.BASE_URL;
	var src_4$2 = src$6.SECONDARY_HOST_ADDRESS;
	var src_5 = src$6.SECONDARY_BASE_URL;
	var src_6 = src$6.HEADER_NAME;
	var src_7 = src$6.HEADER_VALUE;
	var src_8 = src$6.HEADERS;
	var src_9 = src$6.instance;
	var src_10 = src$6.project;
	var src_11 = src$6.isAvailable;
	var src_12 = src$6.resetIsAvailableCache;
	var src_13 = src$6.requestTimeout;

	var GcpDetector_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.gcpDetector = void 0;




	/**
	 * The GcpDetector can be used to detect if a process is running in the Google
	 * Cloud Platofrm and return a {@link Resource} populated with metadata about
	 * the instance. Returns an empty Resource if detection fails.
	 */
	class GcpDetector {
	    /**
	     * Attempts to connect and obtain instance configuration data from the GCP metadata service.
	     * If the connection is succesful it returns a promise containing a {@link Resource}
	     * populated with instance metadata as labels. Returns a promise containing an
	     * empty {@link Resource} if the connection or parsing of the metadata fails.
	     *
	     * @param config The resource detection config with a required logger
	     */
	    async detect(config) {
	        if (!(await src$6.isAvailable())) {
	            config.logger.debug('GcpDetector failed: GCP Metadata unavailable.');
	            return Resource_1.Resource.empty();
	        }
	        const [projectId, instanceId, zoneId, clusterName] = await Promise.all([
	            this._getProjectId(),
	            this._getInstanceId(),
	            this._getZone(),
	            this._getClusterName(),
	        ]);
	        const labels = {};
	        labels[constants$1.CLOUD_RESOURCE.ACCOUNT_ID] = projectId;
	        labels[constants$1.HOST_RESOURCE.ID] = instanceId;
	        labels[constants$1.CLOUD_RESOURCE.ZONE] = zoneId;
	        labels[constants$1.CLOUD_RESOURCE.PROVIDER] = 'gcp';
	        if (process.env.KUBERNETES_SERVICE_HOST)
	            this._addK8sLabels(labels, clusterName);
	        return new Resource_1.Resource(labels);
	    }
	    /** Add resource labels for K8s */
	    _addK8sLabels(labels, clusterName) {
	        labels[constants$1.K8S_RESOURCE.CLUSTER_NAME] = clusterName;
	        labels[constants$1.K8S_RESOURCE.NAMESPACE_NAME] = process.env.NAMESPACE || '';
	        labels[constants$1.K8S_RESOURCE.POD_NAME] = process.env.HOSTNAME || os.hostname();
	        labels[constants$1.CONTAINER_RESOURCE.NAME] = process.env.CONTAINER_NAME || '';
	    }
	    /** Gets project id from GCP project metadata. */
	    async _getProjectId() {
	        try {
	            return await src$6.project('project-id');
	        }
	        catch (_a) {
	            return '';
	        }
	    }
	    /** Gets instance id from GCP instance metadata. */
	    async _getInstanceId() {
	        try {
	            const id = await src$6.instance('id');
	            return id.toString();
	        }
	        catch (_a) {
	            return '';
	        }
	    }
	    /** Gets zone from GCP instance metadata. */
	    async _getZone() {
	        try {
	            const zoneId = await src$6.instance('zone');
	            if (zoneId) {
	                return zoneId.split('/').pop();
	            }
	            return '';
	        }
	        catch (_a) {
	            return '';
	        }
	    }
	    /** Gets cluster name from GCP instance metadata. */
	    async _getClusterName() {
	        try {
	            return await src$6.instance('attributes/cluster-name');
	        }
	        catch (_a) {
	            return '';
	        }
	    }
	}
	exports.gcpDetector = new GcpDetector();

	});

	unwrapExports(GcpDetector_1);
	var GcpDetector_2 = GcpDetector_1.gcpDetector;

	var detectors = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	Object.defineProperty(exports, "awsEc2Detector", { enumerable: true, get: function () { return AwsEc2Detector_1.awsEc2Detector; } });

	Object.defineProperty(exports, "envDetector", { enumerable: true, get: function () { return EnvDetector_1.envDetector; } });

	Object.defineProperty(exports, "gcpDetector", { enumerable: true, get: function () { return GcpDetector_1.gcpDetector; } });

	});

	unwrapExports(detectors);

	var detectResources = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.detectResources = void 0;




	const DETECTORS = [detectors.envDetector, detectors.awsEc2Detector, detectors.gcpDetector];
	/**
	 * Runs all resource detectors and returns the results merged into a single
	 * Resource.
	 *
	 * @param config Configuration for resource detection
	 */
	exports.detectResources = async (config = {}) => {
	    const internalConfig = Object.assign({
	        logger: new src$2.NoopLogger(),
	    }, config);
	    const resources = await Promise.all(DETECTORS.map(d => {
	        try {
	            return d.detect(internalConfig);
	        }
	        catch (_a) {
	            return Resource_1.Resource.empty();
	        }
	    }));
	    // Log Resources only if there is a user-provided logger
	    if (config.logger) {
	        logResources(config.logger, resources);
	    }
	    return resources.reduce((acc, resource) => acc.merge(resource), Resource_1.Resource.createTelemetrySDKResource());
	};
	/**
	 * Writes debug information about the detected resources to the logger defined in the resource detection config, if one is provided.
	 *
	 * @param logger The {@link Logger} to write the debug information to.
	 * @param resources The array of {@link Resource} that should be logged. Empty entried will be ignored.
	 */
	const logResources = (logger, resources) => {
	    resources.forEach((resource, index) => {
	        // Print only populated resources
	        if (Object.keys(resource.labels).length > 0) {
	            const resourceDebugString = util.inspect(resource.labels, {
	                depth: 2,
	                breakLength: Infinity,
	                sorted: true,
	                compact: false,
	            });
	            const detectorName = DETECTORS[index].constructor
	                ? DETECTORS[index].constructor.name
	                : 'Unknown detector';
	            logger.debug(`${detectorName} found resource.`);
	            logger.debug(resourceDebugString);
	        }
	    });
	};

	});

	unwrapExports(detectResources);
	var detectResources_1 = detectResources.detectResources;

	var node$3 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(detectResources, exports);

	});

	unwrapExports(node$3);

	var platform$2 = createCommonjsModule(function (module, exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	__exportStar(node$3, exports);

	});

	unwrapExports(platform$2);

	var types$4 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(types$4);

	var src$7 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(Resource_1, exports);
	__exportStar(platform$2, exports);
	__exportStar(constants$1, exports);
	__exportStar(types$4, exports);

	});

	unwrapExports(src$7);

	var BasicTracerProvider_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BasicTracerProvider = void 0;







	/**
	 * This class represents a basic tracer provider which platform libraries can extend
	 */
	class BasicTracerProvider {
	    constructor(config = config$2.DEFAULT_CONFIG) {
	        var _a, _b;
	        this._registeredSpanProcessors = [];
	        this._tracers = new Map();
	        this.activeSpanProcessor = new NoopSpanProcessor_1.NoopSpanProcessor();
	        this.logger = (_a = config.logger) !== null && _a !== void 0 ? _a : new src$2.ConsoleLogger(config.logLevel);
	        this.resource = (_b = config.resource) !== null && _b !== void 0 ? _b : src$7.Resource.createTelemetrySDKResource();
	        this._config = Object.assign({}, config, {
	            logger: this.logger,
	            resource: this.resource,
	        });
	    }
	    getTracer(name, version = '*', config) {
	        const key = `${name}@${version}`;
	        if (!this._tracers.has(key)) {
	            this._tracers.set(key, new src$8.Tracer({ name, version }, config || this._config, this));
	        }
	        return this._tracers.get(key);
	    }
	    /**
	     * Adds a new {@link SpanProcessor} to this tracer.
	     * @param spanProcessor the new SpanProcessor to be added.
	     */
	    addSpanProcessor(spanProcessor) {
	        this._registeredSpanProcessors.push(spanProcessor);
	        this.activeSpanProcessor = new MultiSpanProcessor_1.MultiSpanProcessor(this._registeredSpanProcessors);
	    }
	    getActiveSpanProcessor() {
	        return this.activeSpanProcessor;
	    }
	    /**
	     * Register this TracerProvider for use with the OpenTelemetry API.
	     * Undefined values may be replaced with defaults, and
	     * null values will be skipped.
	     *
	     * @param config Configuration object for SDK registration
	     */
	    register(config = {}) {
	        src$1.trace.setGlobalTracerProvider(this);
	        if (config.propagator === undefined) {
	            config.propagator = new src$2.CompositePropagator({
	                propagators: [new src$2.HttpCorrelationContext(), new src$2.HttpTraceContext()],
	            });
	        }
	        if (config.contextManager) {
	            src$1.context.setGlobalContextManager(config.contextManager);
	        }
	        if (config.propagator) {
	            src$1.propagation.setGlobalPropagator(config.propagator);
	        }
	    }
	}
	exports.BasicTracerProvider = BasicTracerProvider;

	});

	unwrapExports(BasicTracerProvider_1);
	var BasicTracerProvider_2 = BasicTracerProvider_1.BasicTracerProvider;

	var ConsoleSpanExporter_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ConsoleSpanExporter = void 0;

	/**
	 * This is implementation of {@link SpanExporter} that prints spans to the
	 * console. This class can be used for diagnostic purposes.
	 */
	class ConsoleSpanExporter {
	    /**
	     * Export spans.
	     * @param spans
	     * @param resultCallback
	     */
	    export(spans, resultCallback) {
	        return this._sendSpans(spans, resultCallback);
	    }
	    /**
	     * Shutdown the exporter.
	     */
	    shutdown() {
	        return this._sendSpans([]);
	    }
	    /**
	     * converts span info into more readable format
	     * @param span
	     */
	    _exportInfo(span) {
	        return {
	            traceId: span.spanContext.traceId,
	            parentId: span.parentSpanId,
	            name: span.name,
	            id: span.spanContext.spanId,
	            kind: span.kind,
	            timestamp: src$2.hrTimeToMicroseconds(span.startTime),
	            duration: src$2.hrTimeToMicroseconds(span.duration),
	            attributes: span.attributes,
	            status: span.status,
	            events: span.events,
	        };
	    }
	    /**
	     * Showing spans in console
	     * @param spans
	     * @param done
	     */
	    _sendSpans(spans, done) {
	        for (const span of spans) {
	            console.log(this._exportInfo(span));
	        }
	        if (done) {
	            return done(src$2.ExportResult.SUCCESS);
	        }
	    }
	}
	exports.ConsoleSpanExporter = ConsoleSpanExporter;

	});

	unwrapExports(ConsoleSpanExporter_1);
	var ConsoleSpanExporter_2 = ConsoleSpanExporter_1.ConsoleSpanExporter;

	var BatchSpanProcessor_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BatchSpanProcessor = void 0;

	const DEFAULT_BUFFER_SIZE = 100;
	const DEFAULT_BUFFER_TIMEOUT_MS = 20000;
	/**
	 * Implementation of the {@link SpanProcessor} that batches spans exported by
	 * the SDK then pushes them to the exporter pipeline.
	 */
	class BatchSpanProcessor {
	    constructor(_exporter, config) {
	        this._exporter = _exporter;
	        this._finishedSpans = [];
	        this._isShutdown = false;
	        this._bufferSize =
	            config && config.bufferSize ? config.bufferSize : DEFAULT_BUFFER_SIZE;
	        this._bufferTimeout =
	            config && typeof config.bufferTimeout === 'number'
	                ? config.bufferTimeout
	                : DEFAULT_BUFFER_TIMEOUT_MS;
	    }
	    forceFlush(cb = () => { }) {
	        if (this._isShutdown) {
	            setTimeout(cb, 0);
	            return;
	        }
	        this._flush(cb);
	    }
	    // does nothing.
	    onStart(span) { }
	    onEnd(span) {
	        if (this._isShutdown) {
	            return;
	        }
	        this._addToBuffer(span);
	    }
	    shutdown(cb = () => { }) {
	        if (this._isShutdown) {
	            setTimeout(cb, 0);
	            return;
	        }
	        this.forceFlush(cb);
	        this._isShutdown = true;
	        this._exporter.shutdown();
	    }
	    /** Add a span in the buffer. */
	    _addToBuffer(span) {
	        this._finishedSpans.push(span);
	        this._maybeStartTimer();
	        if (this._finishedSpans.length > this._bufferSize) {
	            this._flush();
	        }
	    }
	    /** Send the span data list to exporter */
	    _flush(cb = () => { }) {
	        this._clearTimer();
	        if (this._finishedSpans.length === 0) {
	            setTimeout(cb, 0);
	            return;
	        }
	        this._exporter.export(this._finishedSpans, cb);
	        this._finishedSpans = [];
	    }
	    _maybeStartTimer() {
	        if (this._timer !== undefined)
	            return;
	        this._timer = setTimeout(() => {
	            this._flush();
	        }, this._bufferTimeout);
	        src$2.unrefTimer(this._timer);
	    }
	    _clearTimer() {
	        if (this._timer !== undefined) {
	            clearTimeout(this._timer);
	            this._timer = undefined;
	        }
	    }
	}
	exports.BatchSpanProcessor = BatchSpanProcessor;

	});

	unwrapExports(BatchSpanProcessor_1);
	var BatchSpanProcessor_2 = BatchSpanProcessor_1.BatchSpanProcessor;

	var InMemorySpanExporter_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.InMemorySpanExporter = void 0;

	/**
	 * This class can be used for testing purposes. It stores the exported spans
	 * in a list in memory that can be retrieve using the `getFinishedSpans()`
	 * method.
	 */
	class InMemorySpanExporter {
	    constructor() {
	        this._finishedSpans = [];
	        this._stopped = false;
	    }
	    export(spans, resultCallback) {
	        if (this._stopped)
	            return resultCallback(src$2.ExportResult.FAILED_NOT_RETRYABLE);
	        this._finishedSpans.push(...spans);
	        return resultCallback(src$2.ExportResult.SUCCESS);
	    }
	    shutdown() {
	        this._stopped = true;
	        this._finishedSpans = [];
	    }
	    reset() {
	        this._finishedSpans = [];
	    }
	    getFinishedSpans() {
	        return this._finishedSpans;
	    }
	}
	exports.InMemorySpanExporter = InMemorySpanExporter;

	});

	unwrapExports(InMemorySpanExporter_1);
	var InMemorySpanExporter_2 = InMemorySpanExporter_1.InMemorySpanExporter;

	var ReadableSpan = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(ReadableSpan);

	var SimpleSpanProcessor_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SimpleSpanProcessor = void 0;
	/**
	 * An implementation of the {@link SpanProcessor} that converts the {@link Span}
	 * to {@link ReadableSpan} and passes it to the configured exporter.
	 *
	 * Only spans that are sampled are converted.
	 */
	class SimpleSpanProcessor {
	    constructor(_exporter) {
	        this._exporter = _exporter;
	        this._isShutdown = false;
	    }
	    forceFlush(cb = () => { }) {
	        // do nothing as all spans are being exported without waiting
	        setTimeout(cb, 0);
	    }
	    // does nothing.
	    onStart(span) { }
	    onEnd(span) {
	        if (this._isShutdown) {
	            return;
	        }
	        this._exporter.export([span], () => { });
	    }
	    shutdown(cb = () => { }) {
	        if (this._isShutdown) {
	            setTimeout(cb, 0);
	            return;
	        }
	        this._isShutdown = true;
	        this._exporter.shutdown();
	        setTimeout(cb, 0);
	    }
	}
	exports.SimpleSpanProcessor = SimpleSpanProcessor;

	});

	unwrapExports(SimpleSpanProcessor_1);
	var SimpleSpanProcessor_2 = SimpleSpanProcessor_1.SimpleSpanProcessor;

	var SpanExporter = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(SpanExporter);

	var SpanProcessor = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(SpanProcessor);

	var types$5 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });

	});

	unwrapExports(types$5);

	var src$8 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(Tracer_1, exports);
	__exportStar(BasicTracerProvider_1, exports);
	__exportStar(ConsoleSpanExporter_1, exports);
	__exportStar(BatchSpanProcessor_1, exports);
	__exportStar(InMemorySpanExporter_1, exports);
	__exportStar(ReadableSpan, exports);
	__exportStar(SimpleSpanProcessor_1, exports);
	__exportStar(SpanExporter, exports);
	__exportStar(Span_1, exports);
	__exportStar(SpanProcessor, exports);
	__exportStar(types$5, exports);

	});

	unwrapExports(src$8);

	var StackContextManager_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.StackContextManager = void 0;

	/**
	 * Stack Context Manager for managing the state in web
	 * it doesn't fully support the async calls though
	 */
	class StackContextManager {
	    constructor() {
	        /**
	         * whether the context manager is enabled or not
	         */
	        this._enabled = false;
	        /**
	         * Keeps the reference to current context
	         */
	        this._currentContext = src$1.Context.ROOT_CONTEXT;
	    }
	    /**
	     *
	     * @param target Function to be executed within the context
	     * @param context
	     */
	    _bindFunction(target, context = src$1.Context.ROOT_CONTEXT) {
	        const manager = this;
	        const contextWrapper = function (...args) {
	            return manager.with(context, () => target.apply(this, args));
	        };
	        Object.defineProperty(contextWrapper, 'length', {
	            enumerable: false,
	            configurable: true,
	            writable: false,
	            value: target.length,
	        });
	        return contextWrapper;
	    }
	    /**
	     * Returns the active context
	     */
	    active() {
	        return this._currentContext;
	    }
	    /**
	     * Binds a the certain context or the active one to the target function and then returns the target
	     * @param target
	     * @param context
	     */
	    bind(target, context = src$1.Context.ROOT_CONTEXT) {
	        // if no specific context to propagate is given, we use the current one
	        if (context === undefined) {
	            context = this.active();
	        }
	        if (typeof target === 'function') {
	            return this._bindFunction(target, context);
	        }
	        return target;
	    }
	    /**
	     * Disable the context manager (clears the current context)
	     */
	    disable() {
	        this._currentContext = src$1.Context.ROOT_CONTEXT;
	        this._enabled = false;
	        return this;
	    }
	    /**
	     * Enables the context manager and creates a default(root) context
	     */
	    enable() {
	        if (this._enabled) {
	            return this;
	        }
	        this._enabled = true;
	        this._currentContext = src$1.Context.ROOT_CONTEXT;
	        return this;
	    }
	    /**
	     * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
	     * The context will be set as active
	     * @param context
	     * @param fn Callback function
	     */
	    with(context, fn) {
	        const previousContext = this._currentContext;
	        this._currentContext = context || src$1.Context.ROOT_CONTEXT;
	        try {
	            return fn();
	        }
	        finally {
	            this._currentContext = previousContext;
	        }
	    }
	}
	exports.StackContextManager = StackContextManager;

	});

	unwrapExports(StackContextManager_1);
	var StackContextManager_2 = StackContextManager_1.StackContextManager;

	var WebTracerProvider_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WebTracerProvider = void 0;


	/**
	 * This class represents a web tracer with {@link StackContextManager}
	 */
	class WebTracerProvider extends src$8.BasicTracerProvider {
	    /**
	     * Constructs a new Tracer instance.
	     * @param config Web Tracer config
	     */
	    constructor(config = {}) {
	        if (typeof config.plugins === 'undefined') {
	            config.plugins = [];
	        }
	        super(config);
	        for (const plugin of config.plugins) {
	            plugin.enable([], this, this.logger);
	        }
	        if (config.contextManager) {
	            throw ('contextManager should be defined in register method not in' +
	                ' constructor');
	        }
	        if (config.propagator) {
	            throw 'propagator should be defined in register method not in constructor';
	        }
	    }
	    /**
	     * Register this TracerProvider for use with the OpenTelemetry API.
	     * Undefined values may be replaced with defaults, and
	     * null values will be skipped.
	     *
	     * @param config Configuration object for SDK registration
	     */
	    register(config = {}) {
	        if (config.contextManager === undefined) {
	            config.contextManager = new StackContextManager_1.StackContextManager();
	        }
	        if (config.contextManager) {
	            config.contextManager.enable();
	        }
	        super.register(config);
	    }
	}
	exports.WebTracerProvider = WebTracerProvider;

	});

	unwrapExports(WebTracerProvider_1);
	var WebTracerProvider_2 = WebTracerProvider_1.WebTracerProvider;

	var PerformanceTimingNames_1 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PerformanceTimingNames = void 0;
	var PerformanceTimingNames;
	(function (PerformanceTimingNames) {
	    PerformanceTimingNames["CONNECT_END"] = "connectEnd";
	    PerformanceTimingNames["CONNECT_START"] = "connectStart";
	    PerformanceTimingNames["DOM_COMPLETE"] = "domComplete";
	    PerformanceTimingNames["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
	    PerformanceTimingNames["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
	    PerformanceTimingNames["DOM_INTERACTIVE"] = "domInteractive";
	    PerformanceTimingNames["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
	    PerformanceTimingNames["DOMAIN_LOOKUP_START"] = "domainLookupStart";
	    PerformanceTimingNames["ENCODED_BODY_SIZE"] = "encodedBodySize";
	    PerformanceTimingNames["FETCH_START"] = "fetchStart";
	    PerformanceTimingNames["LOAD_EVENT_END"] = "loadEventEnd";
	    PerformanceTimingNames["LOAD_EVENT_START"] = "loadEventStart";
	    PerformanceTimingNames["REDIRECT_END"] = "redirectEnd";
	    PerformanceTimingNames["REDIRECT_START"] = "redirectStart";
	    PerformanceTimingNames["REQUEST_START"] = "requestStart";
	    PerformanceTimingNames["RESPONSE_END"] = "responseEnd";
	    PerformanceTimingNames["RESPONSE_START"] = "responseStart";
	    PerformanceTimingNames["SECURE_CONNECTION_START"] = "secureConnectionStart";
	    PerformanceTimingNames["UNLOAD_EVENT_END"] = "unloadEventEnd";
	    PerformanceTimingNames["UNLOAD_EVENT_START"] = "unloadEventStart";
	})(PerformanceTimingNames = exports.PerformanceTimingNames || (exports.PerformanceTimingNames = {}));

	});

	unwrapExports(PerformanceTimingNames_1);
	var PerformanceTimingNames_2 = PerformanceTimingNames_1.PerformanceTimingNames;

	var types$6 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */


	});

	unwrapExports(types$6);

	var general = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GeneralAttribute = void 0;
	/**
	 * General purpose networking attributes defined by the OpenTelemetry Semantic Conventions Specification
	 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/span-general.md
	 */
	exports.GeneralAttribute = {
	    NET_PEER_IP: 'net.peer.ip',
	    NET_PEER_ADDRESS: 'net.peer.address',
	    NET_PEER_HOSTNAME: 'net.peer.host',
	    NET_PEER_PORT: 'net.peer.port',
	    NET_PEER_NAME: 'net.peer.name',
	    NET_PEER_IPV4: 'net.peer.ipv4',
	    NET_PEER_IPV6: 'net.peer.ipv6',
	    NET_PEER_SERVICE: 'net.peer.service',
	    NET_HOST_IP: 'net.host.ip',
	    NET_HOST_PORT: 'net.host.port',
	    NET_HOST_NAME: 'net.host.name',
	    NET_TRANSPORT: 'net.transport',
	    // These are used as potential values to NET_TRANSPORT
	    IP_TCP: 'IP.TCP',
	    IP_UDP: 'IP.UDP',
	    INPROC: 'inproc',
	};

	});

	unwrapExports(general);
	var general_1 = general.GeneralAttribute;

	var rpc = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RpcAttribute = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	exports.RpcAttribute = {
	    RPC_SERVICE: 'rpc.service',
	    // GRPC (no spec)
	    GRPC_KIND: 'grpc.kind',
	    GRPC_METHOD: 'grpc.method',
	    GRPC_STATUS_CODE: 'grpc.status_code',
	    GRPC_ERROR_NAME: 'grpc.error_name',
	    GRPC_ERROR_MESSAGE: 'grpc.error_message',
	};

	});

	unwrapExports(rpc);
	var rpc_1 = rpc.RpcAttribute;

	var http = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.HttpAttribute = void 0;
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	exports.HttpAttribute = {
	    HTTP_HOST: 'http.host',
	    HTTP_METHOD: 'http.method',
	    HTTP_TARGET: 'http.target',
	    HTTP_ROUTE: 'http.route',
	    HTTP_URL: 'http.url',
	    HTTP_STATUS_CODE: 'http.status_code',
	    HTTP_STATUS_TEXT: 'http.status_text',
	    HTTP_FLAVOR: 'http.flavor',
	    HTTP_SERVER_NAME: 'http.server_name',
	    HTTP_CLIENT_IP: 'http.client_ip',
	    HTTP_SCHEME: 'http.scheme',
	    HTTP_RESPONSE_CONTENT_LENGTH: 'http.response_content_length',
	    // NOT ON OFFICIAL SPEC
	    HTTP_ERROR_NAME: 'http.error_name',
	    HTTP_ERROR_MESSAGE: 'http.error_message',
	    HTTP_USER_AGENT: 'http.user_agent',
	};

	});

	unwrapExports(http);
	var http_1 = http.HttpAttribute;

	var database = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DatabaseAttribute = void 0;
	/**
	 * Database attribute names defined by the Opetelemetry Semantic Conventions specification
	 * https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/database.md
	 */
	exports.DatabaseAttribute = {
	    // Connection-level attributes
	    /**
	     * An identifier for the database management system (DBMS) product being used.
	     *
	     * @remarks
	     * Required.
	     */
	    DB_SYSTEM: 'db.system',
	    /**
	     * The connection string used to connect to the database.
	     * It is recommended to remove embedded credentials.
	     *
	     * @remarks
	     * Optional.
	     */
	    DB_CONNECTION_STRING: 'db.connection_string',
	    /**
	     * Username for accessing the database, e.g., "readonly_user" or "reporting_user".
	     *
	     * @remarks
	     * Optional.
	     */
	    DB_USER: 'db.user',
	    // Please see ./general.ts for NET_PEER_NAME, NET_PEER_IP, NET_PEER_PORT, NET_TRANSPORT
	    // Call-level attributes
	    /**
	     * If no [tech-specific attribute](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/semantic_conventions/database.md#call-level-attributes-for-specific-technologies)
	     * is defined in the list below,
	     * this attribute is used to report the name of the database being accessed.
	     * For commands that switch the database,this should be set to the
	     * target database (even if the command fails).
	     *
	     * @remarks
	     * Required if applicable and no more specific attribute is defined.
	     */
	    DB_NAME: 'db.name',
	    /**
	     * The database statement being executed.
	     * Note that the value may be sanitized to exclude sensitive information.
	     * E.g., for db.system="other_sql", "SELECT * FROM wuser_table";
	     * for db.system="redis", "SET mykey 'WuValue'".
	     *
	     * @remarks
	     * Required if applicable.
	     */
	    DB_STATEMENT: 'db.statement',
	    /**
	     * The name of the operation being executed,
	     * e.g. the MongoDB command name such as findAndModify.
	     * While it would semantically make sense to set this,
	     * e.g., to an SQL keyword like SELECT or INSERT,
	     * it is not recommended to attempt any client-side parsing of
	     * db.statement just to get this property (the back end can do that if required).
	     *
	     * @remarks
	     * Required if db.statement is not applicable.
	     */
	    DB_OPERATION: 'db.operation',
	    // Connection-level attributes for specific technologies
	    /**
	     * The instance name connecting to.
	     * This name is used to determine the port of a named instance.
	     *
	     * @remarks
	     * If setting a `db.mssql.instance_name`,
	     * `net.peer.port` is no longer required (but still recommended if non-standard)
	     */
	    DB_MSSSQL_INSTANCE_NAME: 'db.mssql.instance_name',
	    /**
	     * The fully-qualified class name of the Java Database Connectivity (JDBC) driver used to connect,
	     * e.g., "org.postgresql.Driver" or "com.microsoft.sqlserver.jdbc.SQLServerDriver".
	     *
	     * @remarks
	     * Optional.
	     */
	    DB_JDBC_DRIVER_CLASSNAME: 'db.jdbc.driver_classname',
	    // Call-level attributes for specific technologies
	    /**
	     * The name of the keyspace being accessed. To be used instead of the generic db.name attribute.
	     *
	     * @remarks
	     * Required.
	     */
	    DB_CASSANDRA_KEYSPACE: 'db.cassandra.keyspace',
	    /**
	     * The [HBase namespace](https://hbase.apache.org/book.html#_namespace) being accessed.
	     * To be used instead of the generic db.name attribute.
	     *
	     * @remarks
	     * Required.
	     */
	    DB_HBASE_NAMESPACE: 'db.hbase.namespace',
	    /**
	     * The index of the database being accessed as used in the [SELECT command](https://redis.io/commands/select),
	     * provided as an integer. To be used instead of the generic db.name attribute.
	     *
	     * @remarks
	     * Required if other than the default database (0).
	     */
	    DB_REDIS_DATABASE_INDEX: 'db.redis.database_index',
	    /**
	     * The collection being accessed within the database stated in db.name.
	     *
	     * @remarks
	     * Required.
	     */
	    DB_MONGODB_COLLECTION: 'db.mongodb.collection',
	    // Not in spec.
	    /** Deprecated. Not in spec. */
	    DB_TYPE: 'db.type',
	    /** Deprecated. Not in spec. */
	    DB_INSTANCE: 'db.instance',
	    /** Deprecated. Not in spec. */
	    DB_URL: 'db.url',
	};

	});

	unwrapExports(database);
	var database_1 = database.DatabaseAttribute;

	var trace$2 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(general, exports);
	__exportStar(rpc, exports);
	__exportStar(http, exports);
	__exportStar(database, exports);

	});

	unwrapExports(trace$2);

	var src$9 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(trace$2, exports);

	});

	unwrapExports(src$9);

	var utils$2 = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.shouldPropagateTraceHeaders = exports.getElementXPath = exports.parseUrl = exports.getResource = exports.sortResources = exports.addSpanNetworkEvents = exports.addSpanNetworkEvent = exports.hasKey = void 0;



	/**
	 * Helper function to be able to use enum as typed key in type and in interface when using forEach
	 * @param obj
	 * @param key
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function hasKey(obj, key) {
	    return key in obj;
	}
	exports.hasKey = hasKey;
	/**
	 * Helper function for starting an event on span based on {@link PerformanceEntries}
	 * @param span
	 * @param performanceName name of performance entry for time start
	 * @param entries
	 */
	function addSpanNetworkEvent(span, performanceName, entries) {
	    if (hasKey(entries, performanceName) &&
	        typeof entries[performanceName] === 'number') {
	        // some metrics are available but have value 0 which means they are invalid
	        // for example "secureConnectionStart" is 0 which makes the events to be wrongly interpreted
	        if (entries[performanceName] === 0) {
	            return undefined;
	        }
	        span.addEvent(performanceName, entries[performanceName]);
	        return span;
	    }
	    return undefined;
	}
	exports.addSpanNetworkEvent = addSpanNetworkEvent;
	/**
	 * Helper function for adding network events
	 * @param span
	 * @param resource
	 */
	function addSpanNetworkEvents(span, resource) {
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START, resource);
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.DOMAIN_LOOKUP_START, resource);
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.DOMAIN_LOOKUP_END, resource);
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.CONNECT_START, resource);
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.SECURE_CONNECTION_START, resource);
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.CONNECT_END, resource);
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.REQUEST_START, resource);
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_START, resource);
	    addSpanNetworkEvent(span, PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END, resource);
	    if (resource[PerformanceTimingNames_1.PerformanceTimingNames.ENCODED_BODY_SIZE]) {
	        span.setAttribute(src$9.HttpAttribute.HTTP_RESPONSE_CONTENT_LENGTH, resource[PerformanceTimingNames_1.PerformanceTimingNames.ENCODED_BODY_SIZE]);
	    }
	}
	exports.addSpanNetworkEvents = addSpanNetworkEvents;
	/**
	 * sort resources by startTime
	 * @param filteredResources
	 */
	function sortResources(filteredResources) {
	    return filteredResources.slice().sort((a, b) => {
	        const valueA = a[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
	        const valueB = b[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
	        if (valueA > valueB) {
	            return 1;
	        }
	        else if (valueA < valueB) {
	            return -1;
	        }
	        return 0;
	    });
	}
	exports.sortResources = sortResources;
	/**
	 * Get closest performance resource ignoring the resources that have been
	 * already used.
	 * @param spanUrl
	 * @param startTimeHR
	 * @param endTimeHR
	 * @param resources
	 * @param ignoredResources
	 * @param initiatorType
	 */
	function getResource(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources = new WeakSet(), initiatorType) {
	    const filteredResources = filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType);
	    if (filteredResources.length === 0) {
	        return {
	            mainRequest: undefined,
	        };
	    }
	    if (filteredResources.length === 1) {
	        return {
	            mainRequest: filteredResources[0],
	        };
	    }
	    const sorted = sortResources(filteredResources.slice());
	    const parsedSpanUrl = parseUrl(spanUrl);
	    if (parsedSpanUrl.origin !== window.location.origin && sorted.length > 1) {
	        let corsPreFlightRequest = sorted[0];
	        let mainRequest = findMainRequest(sorted, corsPreFlightRequest[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END], endTimeHR);
	        const responseEnd = corsPreFlightRequest[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END];
	        const fetchStart = mainRequest[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START];
	        // no corsPreFlightRequest
	        if (fetchStart < responseEnd) {
	            mainRequest = corsPreFlightRequest;
	            corsPreFlightRequest = undefined;
	        }
	        return {
	            corsPreFlightRequest,
	            mainRequest,
	        };
	    }
	    else {
	        return {
	            mainRequest: filteredResources[0],
	        };
	    }
	}
	exports.getResource = getResource;
	/**
	 * Will find the main request skipping the cors pre flight requests
	 * @param resources
	 * @param corsPreFlightRequestEndTime
	 * @param spanEndTimeHR
	 */
	function findMainRequest(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
	    const spanEndTime = src$2.hrTimeToNanoseconds(spanEndTimeHR);
	    const minTime = src$2.hrTimeToNanoseconds(src$2.timeInputToHrTime(corsPreFlightRequestEndTime));
	    let mainRequest = resources[1];
	    let bestGap;
	    const length = resources.length;
	    for (let i = 1; i < length; i++) {
	        const resource = resources[i];
	        const resourceStartTime = src$2.hrTimeToNanoseconds(src$2.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START]));
	        const resourceEndTime = src$2.hrTimeToNanoseconds(src$2.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END]));
	        const currentGap = spanEndTime - resourceEndTime;
	        if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
	            bestGap = currentGap;
	            mainRequest = resource;
	        }
	    }
	    return mainRequest;
	}
	/**
	 * Filter all resources that has started and finished according to span start time and end time.
	 *     It will return the closest resource to a start time
	 * @param spanUrl
	 * @param startTimeHR
	 * @param endTimeHR
	 * @param resources
	 * @param ignoredResources
	 */
	function filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
	    const startTime = src$2.hrTimeToNanoseconds(startTimeHR);
	    const endTime = src$2.hrTimeToNanoseconds(endTimeHR);
	    let filteredResources = resources.filter(resource => {
	        const resourceStartTime = src$2.hrTimeToNanoseconds(src$2.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.FETCH_START]));
	        const resourceEndTime = src$2.hrTimeToNanoseconds(src$2.timeInputToHrTime(resource[PerformanceTimingNames_1.PerformanceTimingNames.RESPONSE_END]));
	        return (resource.initiatorType.toLowerCase() ===
	            (initiatorType || 'xmlhttprequest') &&
	            resource.name === spanUrl &&
	            resourceStartTime >= startTime &&
	            resourceEndTime <= endTime);
	    });
	    if (filteredResources.length > 0) {
	        filteredResources = filteredResources.filter(resource => {
	            return !ignoredResources.has(resource);
	        });
	    }
	    return filteredResources;
	}
	/**
	 * Parses url using anchor element
	 * @param url
	 */
	function parseUrl(url) {
	    const a = document.createElement('a');
	    a.href = url;
	    return a;
	}
	exports.parseUrl = parseUrl;
	/**
	 * Get element XPath
	 * @param target - target element
	 * @param optimised - when id attribute of element is present the xpath can be
	 * simplified to contain id
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function getElementXPath(target, optimised) {
	    if (target.nodeType === Node.DOCUMENT_NODE) {
	        return '/';
	    }
	    const targetValue = getNodeValue(target, optimised);
	    if (optimised && targetValue.indexOf('@id') > 0) {
	        return targetValue;
	    }
	    let xpath = '';
	    if (target.parentNode) {
	        xpath += getElementXPath(target.parentNode, false);
	    }
	    xpath += targetValue;
	    return xpath;
	}
	exports.getElementXPath = getElementXPath;
	/**
	 * get node index within the siblings
	 * @param target
	 */
	function getNodeIndex(target) {
	    if (!target.parentNode) {
	        return 0;
	    }
	    const allowedTypes = [target.nodeType];
	    if (target.nodeType === Node.CDATA_SECTION_NODE) {
	        allowedTypes.push(Node.TEXT_NODE);
	    }
	    let elements = Array.from(target.parentNode.childNodes);
	    elements = elements.filter((element) => {
	        const localName = element.localName;
	        return (allowedTypes.indexOf(element.nodeType) >= 0 &&
	            localName === target.localName);
	    });
	    if (elements.length >= 1) {
	        return elements.indexOf(target) + 1; // xpath starts from 1
	    }
	    // if there are no other similar child xpath doesn't need index
	    return 0;
	}
	/**
	 * get node value for xpath
	 * @param target
	 * @param optimised
	 */
	function getNodeValue(target, optimised) {
	    const nodeType = target.nodeType;
	    const index = getNodeIndex(target);
	    let nodeValue = '';
	    if (nodeType === Node.ELEMENT_NODE) {
	        const id = target.getAttribute('id');
	        if (optimised && id) {
	            return `//*[@id="${id}"]`;
	        }
	        nodeValue = target.localName;
	    }
	    else if (nodeType === Node.TEXT_NODE ||
	        nodeType === Node.CDATA_SECTION_NODE) {
	        nodeValue = 'text()';
	    }
	    else if (nodeType === Node.COMMENT_NODE) {
	        nodeValue = 'comment()';
	    }
	    else {
	        return '';
	    }
	    // if index is 1 it can be omitted in xpath
	    if (nodeValue && index > 1) {
	        return `/${nodeValue}[${index}]`;
	    }
	    return `/${nodeValue}`;
	}
	/**
	 * Checks if trace headers should be propagated
	 * @param spanUrl
	 * @private
	 */
	function shouldPropagateTraceHeaders(spanUrl, propagateTraceHeaderCorsUrls) {
	    let propagateTraceHeaderUrls = propagateTraceHeaderCorsUrls || [];
	    if (typeof propagateTraceHeaderUrls === 'string' ||
	        propagateTraceHeaderUrls instanceof RegExp) {
	        propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
	    }
	    const parsedSpanUrl = parseUrl(spanUrl);
	    if (parsedSpanUrl.origin === window.location.origin) {
	        return true;
	    }
	    else {
	        return propagateTraceHeaderUrls.some(propagateTraceHeaderUrl => src$2.urlMatches(spanUrl, propagateTraceHeaderUrl));
	    }
	}
	exports.shouldPropagateTraceHeaders = shouldPropagateTraceHeaders;

	});

	unwrapExports(utils$2);
	var utils_1$2 = utils$2.shouldPropagateTraceHeaders;
	var utils_2$2 = utils$2.getElementXPath;
	var utils_3$2 = utils$2.parseUrl;
	var utils_4$1 = utils$2.getResource;
	var utils_5 = utils$2.sortResources;
	var utils_6 = utils$2.addSpanNetworkEvents;
	var utils_7 = utils$2.addSpanNetworkEvent;
	var utils_8 = utils$2.hasKey;

	var src$a = createCommonjsModule(function (module, exports) {
	/*
	 * Copyright The OpenTelemetry Authors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(WebTracerProvider_1, exports);
	__exportStar(StackContextManager_1, exports);
	__exportStar(PerformanceTimingNames_1, exports);
	__exportStar(types$6, exports);
	__exportStar(utils$2, exports);

	});

	unwrapExports(src$a);

	var webTracer = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });


	function create(delegator, logary) {
	    const provider = new src$a.WebTracerProvider({
	        logger: logary.getLogger('Logary', 'webTracer'),
	        plugins: [],
	    });
	    provider.addSpanProcessor(new src$8.SimpleSpanProcessor(delegator));
	    provider.register();
	    return { provider };
	}
	exports.default = create;

	});

	unwrapExports(webTracer);

	var tracer$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	function create(logary) {
	    if (logary == null)
	        throw new Error('Parameter "logary" is null or undefined; you need to pass in the Logary instance to the create function.');
	    const loadedModule = webTracer;
	    const { provider } = loadedModule.default(new dist.LogaryExporter(logary), logary);
	    const name = logary.serviceName.join('.');
	    const tracer = provider.getTracer(name, logary.serviceVersion);
	    return { provider, tracer };
	}
	exports.default = create;

	});

	unwrapExports(tracer$1);

	var dist$2 = createCommonjsModule(function (module, exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.name = void 0;


	const handlers_1$1 = __importDefault(handlers_1);
	const rootViewTracer_1 = __importDefault(rootViewTracer);
	exports.name = 'plugins/browser';
	__exportStar(features$1, exports);
	__exportStar(events, exports);
	class BrowserPlugin {
	    constructor(logary, opts = {}) {
	        this.logary = logary;
	        this.opts = opts;
	        this.name = exports.name;
	        this.features = features$1.features;
	        if (typeof window === 'undefined')
	            throw new Error('BrowserPlugin created, but window === "undefined"');
	        const factory = tracer$1;
	        const m = factory.default(logary);
	        this.tracer = new rootViewTracer_1.default(m.tracer, this);
	        this._pageViewSpan = this.newPageViewSpan();
	    }
	    supports(feature) {
	        return features$1.features.indexOf(feature) !== -1;
	    }
	    newPageViewSpan() {
	        const span = this.tracer.startSpan(events.PageViewEventName);
	        return this._pageViewSpan = span;
	    }
	    get pageViewSpan() {
	        return this._pageViewSpan;
	    }
	    run() {
	        const unsubs = [];
	        for (const handler of handlers_1$1.default) {
	            unsubs.push(handler.run(this.logary, this.opts, this));
	        }
	        return () => {
	            for (const unsub of unsubs) {
	                unsub();
	            }
	        };
	    }
	}
	function browser(logary, opts = {}) {
	    if (typeof window === 'undefined')
	        return;
	    logary.register(new BrowserPlugin(logary, opts));
	}
	exports.default = browser;

	});

	var browser$1 = unwrapExports(dist$2);
	var dist_1$1 = dist$2.name;

	var version$1 = "6.0.0-beta.4";
	var browser$2 = "dist/logary.umd.js";
	var pkg = {
		version: version$1,
		browser: browser$2
	};

	function getConfig(init) {
	    let appId = 'unset', serviceName = window.location.hostname;
	    const libraryVersion = pkg.version;
	    for (let i = 0; i < init.length; i++) {
	        switch (init[i][0]) {
	            case 'appId':
	                appId = init[i][1] || appId;
	                break;
	            case 'serviceName':
	                serviceName = init[i][1] || serviceName;
	                break;
	        }
	    }
	    return {
	        serviceName,
	        libraryVersion,
	        appId,
	        minLevel: dist_20.verbose,
	        targets: [new dist_14({ endpoint: 'https://i.logary.tech' })],
	    };
	}
	function initLogary() {
	    let instance;
	    if (_lgy != null && 'reconfigure' in _lgy) {
	        _lgy.reconfigure();
	        instance = _lgy;
	    }
	    else if (_lgy != null) {
	        instance = dist_11(getConfig(_lgy.i));
	    }
	    else {
	        instance = dist_11(getConfig());
	    }
	    browser$1(instance);
	    return window._lgy = instance;
	}

	return initLogary;

})));
