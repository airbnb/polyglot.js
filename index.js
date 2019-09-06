//     (c) 2012-2018 Airbnb, Inc.
//
//     polyglot.js may be freely distributed under the terms of the BSD
//     license. For all licensing information, details, and documention:
//     http://airbnb.github.com/polyglot.js
//
//
// Polyglot.js is an I18n helper library written in JavaScript, made to
// work both in the browser and in Node. It provides a simple solution for
// interpolation and pluralization, based off of Airbnb's
// experience adding I18n functionality to its Backbone.js and Node apps.
//
// Polylglot is agnostic to your translation backend. It doesn't perform any
// translation; it simply gives you a way to manage translated phrases from
// your client- or server-side JavaScript application.
//

'use strict';

var forEach = require('for-each');
var warning = require('warning');
var has = require('has');
var trim = require('string.prototype.trim');

var warn = function warn(message) {
  warning(false, message);
};

var replace = String.prototype.replace;
var split = String.prototype.split;

// #### Pluralization methods
// The string that separates the different phrase possibilities.
var delimiter = '||||';

// Mapping from pluralization group plural logic.
var pluralTypes = {
  chineseLike: function () {
    return 0;
  },
  germanLike: function (n) {
    // is 1
    if (n === 1) {
      return 0;
    }
    // everything else
    return 1;
  },
  frenchLike: function (n) {
    // is 0 or 1
    if (n <= 1) {
      return 0;
    }
    // everything else
    return 1;
  },
  russianLike: function (n) {
    // ends in 1, excluding 11
    if (n % 10 === 1 && n % 100 !== 11) {
      return 0;
    }
    // ends in 2-4, excluding 12-14
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
      return 1;
    }
    // everything else
    return 2;
  },
  czechLike: function (n) {
    // is 1
    if (n === 1) {
      return 0;
    }
    // is 2-4
    if (n >= 2 && n <= 4) {
      return 1;
    }
    // everything else
    return 2;
  },
  polishLike: function (n) {
    // is 1
    if (n === 1) {
      return 0;
    }
    // ends in 2-4, excluding 12-14
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
      return 1;
    }
    // everything else
    return 2;
  },
  icelandicLike: function (n) {
    // ends in 1, excluding 11
    if (n % 10 === 1 && n % 100 !== 11) {
      return 0;
    }
    // everything else
    return 1;
  },
  arabicLike: function (n) {
    // is 0
    if (n === 0) {
      return 0;
    }
    // is 1
    if (n === 1) {
      return 1;
    }
    // is 2
    if (n === 2) {
      return 2;
    }
    // ends in 03-10
    if (n % 100 >= 3 && n % 100 <= 10) {
      return 3;
    }
    // everything else but is 0 and ends in 00-02, excluding 0-2
    if (n % 100 >= 11) {
      return 4;
    }
    // everything else
    return 5;
  },
  irish: function (n) {
    // is 1
    if (n === 1) {
      return 0;
    }
    // is 2
    if (n === 2) {
      return 1;
    }
    // is 3-6
    if (n >= 3 && n <= 6) {
      return 2;
    }
    // is 7-10
    if (n >= 7 && n <= 10) {
      return 3;
    }
    // everything else
    return 4;
  },
  latvianLike: function (n) {
    // ends in 0
    if (n % 10 === 0) {
      return 0;
    }
    // ends in 1, excluding 11
    if (n % 10 === 1 && n % 100 !== 11) {
      return 1;
    }
    // everything else
    return 2;
  },
  lithuanian: function (n) {
    // ends in 1, excluding 11
    if (n % 10 === 1 && n % 100 !== 11) {
      return 0;
    }
    // ends in 0 or ends in 11-19
    if (n % 10 === 0 || (n % 100 >= 11 && n % 100 <= 19)) {
      return 1;
    }
    // everything else
    return 2;
  },
  maltese: function (n) {
    // is 1
    if (n === 1) {
      return 0;
    }
    // is 0 or ends in 01-10, excluding 1
    if (n === 0 || (n !== 1 && n % 100 >= 1 && n % 100 <= 10)) {
      return 1;
    }
    // ends in 11-19
    if (n % 100 >= 11 && n % 100 <= 19) {
      return 2;
    }
    // everything else
    return 3;
  },
  romanian: function (n) {
    // is 1
    if (n === 1) {
      return 0;
    }
    // is 0 or ends in 01-19, excluding 1
    if (n === 0 || (n !== 1 && n % 100 >= 1 && n % 100 <= 19)) {
      return 1;
    }
    // everything else
    return 2;
  },
  slovenianLike: function (n) {
    // ends in 01
    if (n % 100 === 1) {
      return 0;
    }
    // ends in 02
    if (n % 100 === 2) {
      return 1;
    }
    // ends in 03-04
    if (n % 100 === 3 || n % 100 === 4) {
      return 2;
    }
    // everything else
    return 3;
  },
  tagalog: function (n) {
    // ends in 0, 1, 2, 3, 5, 7, 8
    if (n % 10 !== 4 && n % 10 !== 6 && n % 10 !== 9) {
      return 0;
    }
    // everything else
    return 1;
  }
};

// Mapping from pluralization group to individual language codes/locales.
// Will look up based on exact match, if not found and it's a locale will parse the locale
// for language code, and if that does not exist will default to 'en'
var pluralTypeToLanguages = {
  chineseLike: ['az', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'vi', 'zh', 'zh-TW'],
  germanLike: ['bg', 'ca', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'he', 'hu', 'it', 'ka', 'nl', 'no', 'pt', 'sq', 'sv', 'sw', 'xh', 'zu'],
  frenchLike: ['fr', 'hi', 'hy', 'pt-BR', 'pt-br'],
  russianLike: ['bs', 'hr', 'ru', 'sr', 'srl', 'uk'],
  czechLike: ['cs', 'sk'],
  polishLike: ['pl'],
  icelandicLike: ['is', 'mk'],
  arabicLike: ['ar'],
  irish: ['ga'],
  latvianLike: ['lv'],
  lithuanian: ['lt'],
  maltese: ['mt'],
  romanian: ['ro'],
  slovenianLike: ['sl'],
  tagalog: ['tl']
};

function langToTypeMap(mapping) {
  var ret = {};
  forEach(mapping, function (langs, type) {
    forEach(langs, function (lang) {
      ret[lang] = type;
    });
  });
  return ret;
}

function pluralTypeName(locale) {
  var langToPluralType = langToTypeMap(pluralTypeToLanguages);
  return langToPluralType[locale]
    || langToPluralType[split.call(locale, /-/, 1)[0]]
    || langToPluralType.en;
}

function pluralTypeIndex(locale, count) {
  return pluralTypes[pluralTypeName(locale)](count);
}

function escape(token) {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function constructTokenRegex(opts) {
  var prefix = (opts && opts.prefix) || '%{';
  var suffix = (opts && opts.suffix) || '}';

  if (prefix === delimiter || suffix === delimiter) {
    throw new RangeError('"' + delimiter + '" token is reserved for pluralization');
  }

  return new RegExp(escape(prefix) + '(.*?)' + escape(suffix), 'g');
}

var defaultTokenRegex = /%\{(.*?)\}/g;

// ### transformPhrase(phrase, substitutions, locale)
//
// Takes a phrase string and transforms it by choosing the correct
// plural form and interpolating it.
//
//     transformPhrase('Hello, %{name}!', {name: 'Spike'});
//     // "Hello, Spike!"
//
// The correct plural form is selected if substitutions.smart_count
// is set. You can pass in a number instead of an Object as `substitutions`
// as a shortcut for `smart_count`.
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', {smart_count: 1}, 'en');
//     // "1 new message"
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', {smart_count: 2}, 'en');
//     // "2 new messages"
//
//     transformPhrase('%{smart_count} new messages |||| 1 new message', 5, 'en');
//     // "5 new messages"
//
// You should pass in a third argument, the locale, to specify the correct plural type.
// It defaults to `'en'` with 2 plural forms.
function transformPhrase(phrase, substitutions, locale, tokenRegex) {
  if (typeof phrase !== 'string') {
    throw new TypeError('Polyglot.transformPhrase expects argument #1 to be string');
  }

  if (substitutions == null) {
    return phrase;
  }

  var result = phrase;
  var interpolationRegex = tokenRegex || defaultTokenRegex;

  // allow number as a pluralization shortcut
  var options = typeof substitutions === 'number' ? { smart_count: substitutions } : substitutions;

  // Select plural form: based on a phrase text that contains `n`
  // plural forms separated by `delimiter`, a `locale`, and a `substitutions.smart_count`,
  // choose the correct plural form. This is only done if `count` is set.
  if (options.smart_count != null && result) {
    var texts = split.call(result, delimiter);
    result = trim(texts[pluralTypeIndex(locale || 'en', options.smart_count)] || texts[0]);
  }

  // Interpolate: Creates a `RegExp` object for each interpolation placeholder.
  result = replace.call(result, interpolationRegex, function (expression, argument) {
    if (!has(options, argument) || options[argument] == null) { return expression; }
    return options[argument];
  });

  return result;
}

// ### Polyglot class constructor
function Polyglot(options) {
  var opts = options || {};
  this.phrases = {};
  this.extend(opts.phrases || {});
  this.currentLocale = opts.locale || 'en';
  var allowMissing = opts.allowMissing ? transformPhrase : null;
  this.onMissingKey = typeof opts.onMissingKey === 'function' ? opts.onMissingKey : allowMissing;
  this.warn = opts.warn || warn;
  this.tokenRegex = constructTokenRegex(opts.interpolation);
}

// ### polyglot.locale([locale])
//
// Get or set locale. Internally, Polyglot only uses locale for pluralization.
Polyglot.prototype.locale = function (newLocale) {
  if (newLocale) this.currentLocale = newLocale;
  return this.currentLocale;
};

// ### polyglot.extend(phrases)
//
// Use `extend` to tell Polyglot how to translate a given key.
//
//     polyglot.extend({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     });
//
// The key can be any string.  Feel free to call `extend` multiple times;
// it will override any phrases with the same key, but leave existing phrases
// untouched.
//
// It is also possible to pass nested phrase objects, which get flattened
// into an object with the nested keys concatenated using dot notation.
//
//     polyglot.extend({
//       "nav": {
//         "hello": "Hello",
//         "hello_name": "Hello, %{name}",
//         "sidebar": {
//           "welcome": "Welcome"
//         }
//       }
//     });
//
//     console.log(polyglot.phrases);
//     // {
//     //   'nav.hello': 'Hello',
//     //   'nav.hello_name': 'Hello, %{name}',
//     //   'nav.sidebar.welcome': 'Welcome'
//     // }
//
// `extend` accepts an optional second argument, `prefix`, which can be used
// to prefix every key in the phrases object with some string, using dot
// notation.
//
//     polyglot.extend({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     }, "nav");
//
//     console.log(polyglot.phrases);
//     // {
//     //   'nav.hello': 'Hello',
//     //   'nav.hello_name': 'Hello, %{name}'
//     // }
//
// This feature is used internally to support nested phrase objects.
Polyglot.prototype.extend = function (morePhrases, prefix) {
  forEach(morePhrases, function (phrase, key) {
    var prefixedKey = prefix ? prefix + '.' + key : key;
    if (typeof phrase === 'object') {
      this.extend(phrase, prefixedKey);
    } else {
      this.phrases[prefixedKey] = phrase;
    }
  }, this);
};

// ### polyglot.unset(phrases)
// Use `unset` to selectively remove keys from a polyglot instance.
//
//     polyglot.unset("some_key");
//     polyglot.unset({
//       "hello": "Hello",
//       "hello_name": "Hello, %{name}"
//     });
//
// The unset method can take either a string (for the key), or an object hash with
// the keys that you would like to unset.
Polyglot.prototype.unset = function (morePhrases, prefix) {
  if (typeof morePhrases === 'string') {
    delete this.phrases[morePhrases];
  } else {
    forEach(morePhrases, function (phrase, key) {
      var prefixedKey = prefix ? prefix + '.' + key : key;
      if (typeof phrase === 'object') {
        this.unset(phrase, prefixedKey);
      } else {
        delete this.phrases[prefixedKey];
      }
    }, this);
  }
};

// ### polyglot.clear()
//
// Clears all phrases. Useful for special cases, such as freeing
// up memory if you have lots of phrases but no longer need to
// perform any translation. Also used internally by `replace`.
Polyglot.prototype.clear = function () {
  this.phrases = {};
};

// ### polyglot.replace(phrases)
//
// Completely replace the existing phrases with a new set of phrases.
// Normally, just use `extend` to add more phrases, but under certain
// circumstances, you may want to make sure no old phrases are lying around.
Polyglot.prototype.replace = function (newPhrases) {
  this.clear();
  this.extend(newPhrases);
};


// ### polyglot.t(key, options)
//
// The most-used method. Provide a key, and `t` will return the
// phrase.
//
//     polyglot.t("hello");
//     => "Hello"
//
// The phrase value is provided first by a call to `polyglot.extend()` or
// `polyglot.replace()`.
//
// Pass in an object as the second argument to perform interpolation.
//
//     polyglot.t("hello_name", {name: "Spike"});
//     => "Hello, Spike"
//
// If you like, you can provide a default value in case the phrase is missing.
// Use the special option key "_" to specify a default.
//
//     polyglot.t("i_like_to_write_in_language", {
//       _: "I like to write in %{language}.",
//       language: "JavaScript"
//     });
//     => "I like to write in JavaScript."
//
Polyglot.prototype.t = function (key, options) {
  var phrase, result;
  var opts = options == null ? {} : options;
  if (typeof this.phrases[key] === 'string') {
    phrase = this.phrases[key];
  } else if (typeof opts._ === 'string') {
    phrase = opts._;
  } else if (this.onMissingKey) {
    var onMissingKey = this.onMissingKey;
    result = onMissingKey(key, opts, this.currentLocale, this.tokenRegex);
  } else {
    this.warn('Missing translation for key: "' + key + '"');
    result = key;
  }
  if (typeof phrase === 'string') {
    result = transformPhrase(phrase, opts, this.currentLocale, this.tokenRegex);
  }
  return result;
};


// ### polyglot.has(key)
//
// Check if polyglot has a translation for given key
Polyglot.prototype.has = function (key) {
  return has(this.phrases, key);
};

// export transformPhrase
Polyglot.transformPhrase = function transform(phrase, substitutions, locale) {
  return transformPhrase(phrase, substitutions, locale);
};

module.exports = Polyglot;
