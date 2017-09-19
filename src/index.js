const warn = (message) => {
  const warning = `Warning: ${message}`;
  console.error(warning); // eslint-disable-line no-console

  try {
    throw new Error(`Warning: ${warning}`);
  } catch (x) {} // eslint-disable-line no-empty
};

const forEach = (items, fn) => {
  Object.keys(items).forEach((key) => {
    const value = items[key];
    fn(value, key);
  });
};

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const replace = String.prototype.replace;
const split = String.prototype.split;

// #### Pluralization methods
// The string that separates the different phrase possibilities.
const delimeter = '||||';

// Mapping from pluralization group plural logic.
const pluralTypes = {
  arabic(n) {
    // http://www.arabeyes.org/Plural_Forms
    if (n < 3) { return n; }
    if (n % 100 >= 3 && n % 100 <= 10) return 3;
    return n % 100 >= 11 ? 4 : 5;
  },
  chinese(n) { return n !== 1 ? 1 : 0; },
  german(n) { return n !== 1 ? 1 : 0; },
  french(n) { return n > 1 ? 1 : 0; },
  russian(n) {
    if (n % 10 === 1 && n % 100 !== 11) { return 0; }
    return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  },
  czech(n) {
    if (n === 1) { return 0; }
    return (n >= 2 && n <= 4) ? 1 : 2;
  },
  polish(n) {
    if (n === 1) { return 0; }
    return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  },
  icelandic(n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; }
};

// Mapping from pluralization group to individual locales.
const pluralTypeToLanguages = {
  arabic: ['ar'],
  chinese: ['id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
  german: ['fa', 'da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
  french: ['fr', 'tl', 'pt-br'],
  russian: ['hr', 'ru', 'lt'],
  czech: ['cs', 'sk'],
  polish: ['pl'],
  icelandic: ['is']
};

function langToTypeMap(mapping) {
  const ret = {};
  forEach(mapping, (langs, type) =>
    forEach(langs, (lang) => {
      ret[lang] = type;
    })
  );
  return ret;
}

function pluralTypeName(locale) {
  const langToPluralType = langToTypeMap(pluralTypeToLanguages);
  return langToPluralType[locale]
    || langToPluralType[split.call(locale, /-/, 1)[0]]
    || langToPluralType.en;
}

function pluralTypeIndex(locale, count) {
  return pluralTypes[pluralTypeName(locale)](count);
}

const dollarRegex = /\$/g;
const dollarBillsYall = '$$';
const tokenRegex = /%\{(.*?)\}/g;

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
function transformPhrase(phrase, substitutions, locale) {
  if (typeof phrase !== 'string') {
    throw new TypeError('Polyglot.transformPhrase expects argument #1 to be string');
  }

  if (substitutions == null) {
    return phrase;
  }

  let result = phrase;

  // allow number as a pluralization shortcut
  const options = typeof substitutions === 'number' ? { smart_count: substitutions } : substitutions;

  // Select plural form: based on a phrase text that contains `n`
  // plural forms separated by `delimeter`, a `locale`, and a `substitutions.smart_count`,
  // choose the correct plural form. This is only done if `count` is set.
  if (options.smart_count != null && result) {
    const texts = split.call(result, delimeter);
    result = (texts[pluralTypeIndex(locale || 'en', options.smart_count)] || texts[0]).trim();
  }

  // Interpolate: Creates a `RegExp` object for each interpolation placeholder.
  result = replace.call(result, tokenRegex, (expression, argument) => {
    if (!has(options, argument) || options[argument] == null) { return expression; }
    // Ensure replacement value is escaped to prevent special $-prefixed regex replace tokens.
    return replace.call(options[argument], dollarRegex, dollarBillsYall);
  });

  return result;
}

// ### Polyglot class constructor
class Polyglot {
  constructor(options) {
    const opts = options || {};
    this.phrases = {};
    this.extend(opts.phrases || {});
    this.currentLocale = opts.locale || 'en';
    const allowMissing = opts.allowMissing ? transformPhrase : null;
    this.onMissingKey = typeof opts.onMissingKey === 'function' ? opts.onMissingKey : allowMissing;
    this.warn = opts.warn || warn;
  }

  // ### polyglot.locale([locale])
  //
  // Get or set locale. Internally, Polyglot only uses locale for pluralization.
  locale(newLocale) {
    if (newLocale) this.currentLocale = newLocale;
    return this.currentLocale;
  }

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
  extend(morePhrases, prefix) {
    forEach(morePhrases, (phrase, key) => {
      const prefixedKey = prefix ? `${prefix}.${key}` : key;
      if (typeof phrase === 'object') {
        this.extend(phrase, prefixedKey);
      } else {
        this.phrases[prefixedKey] = phrase;
      }
    }, this);
  }

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
  unset(morePhrases, prefix) {
    if (typeof morePhrases === 'string') {
      delete this.phrases[morePhrases];
    } else {
      forEach(morePhrases, (phrase, key) => {
        const prefixedKey = prefix ? `${prefix}.${key}` : key;
        if (typeof phrase === 'object') {
          this.unset(phrase, prefixedKey);
        } else {
          delete this.phrases[prefixedKey];
        }
      }, this);
    }
  }

  // ### polyglot.clear()
  //
  // Clears all phrases. Useful for special cases, such as freeing
  // up memory if you have lots of phrases but no longer need to
  // perform any translation. Also used internally by `replace`.
  clear() {
    this.phrases = {};
  }

  // ### polyglot.replace(phrases)
  //
  // Completely replace the existing phrases with a new set of phrases.
  // Normally, just use `extend` to add more phrases, but under certain
  // circumstances, you may want to make sure no old phrases are lying around.
  replace(newPhrases) {
    this.clear();
    this.extend(newPhrases);
  }

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
  t(key, options) {
    let phrase;
    let result;
    const opts = options == null ? {} : options;
    if (typeof this.phrases[key] === 'string') {
      phrase = this.phrases[key];
    } else if (typeof opts._ === 'string') {
      phrase = opts._;
    } else if (this.onMissingKey) {
      const onMissingKey = this.onMissingKey;
      result = onMissingKey(key, opts, this.currentLocale);
    } else {
      this.warn(`Missing translation for key: "${key}"`);
      result = key;
    }
    if (typeof phrase === 'string') {
      result = transformPhrase(phrase, opts, this.currentLocale);
    }
    return result;
  }

  // ### polyglot.has(key)
  //
  // Check if polyglot has a translation for given key
  has(key) {
    return has(this.phrases, key);
  }
}

// export transformPhrase
Polyglot.transformPhrase = transformPhrase;

export default Polyglot;
