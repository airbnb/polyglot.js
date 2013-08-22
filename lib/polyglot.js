//     (c) 2012 Airbnb, Inc.
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

!function(root) {
  'use strict';

  // ### Polyglot class constructor
  function Polyglot(options) {
    options = options || {};
    this.phrases = options.phrases || {};
    this.currentLocale = options.locale || 'en';
    this.allowMissing = !!options.allowMissing;
  }

  // ### Version
  Polyglot.VERSION = '0.2.0';

  // ### polyglot.locale([locale])
  //
  // Get or set locale. Internally, Polyglot only uses locale for pluralization.
  Polyglot.prototype.locale = function(newLocale) {
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
  Polyglot.prototype.extend = function(morePhrases) {
    for (var key in morePhrases) {
      if (morePhrases.hasOwnProperty(key)) {
        this.phrases[key] = morePhrases[key];
      }
    }
  };

  // ### polyglot.clear()
  //
  // Clears all phrases. Useful for special cases, such as freeing
  // up memory if you have lots of phrases but no longer need to
  // perform any translation. Also used internally by `replace`.
  Polyglot.prototype.clear = function() {
    this.phrases = {};
  };

  // ### polyglot.replace(phrases)
  //
  // Completely replace the existing phrases with a new set of phrases.
  // Normally, just use `extend` to add more phrases, but under certain
  // circumstances, you may want to make sure no old phrases are lying around.
  Polyglot.prototype.replace = function(newPhrases) {
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
  Polyglot.prototype.t = function(key, options) {
    var result;
    options = options == null ? {} : options;
    // allow number as a pluralization shortcut
    if (typeof options === 'number') {
      options = {smart_count: options};
    }
    var phrase = this.phrases[key] || options._ || (this.allowMissing ? key : '');
    if (phrase === '') {
      warn('Missing translation for key: "'+key+'"');
      result = key;
    } else {
      options = clone(options);
      result = choosePluralForm(phrase, this.currentLocale, options.smart_count);
      result = interpolate(result, options);
    }
    return result;
  };

  // ### polyglot.tbs(key, options)
  // The same functionality as t, but indexing into a bundle
  // 
  //    polyglot.extend({"hello_bundle":{"hello_name": "Hello, %{name}"}});
  //    polyglot.tbs("hello_bundle", "hell_name", {"name": "Spike"})
  //    => Hello, Spike
  //
  // If there is no bundle then this will act like t using key
  //
  //    polyglot.extend({"hello_name": "Hello, %{name}"});
  //    polyglot.tbs("hello_bundle", "hello_name", {"name": "Spike"})
  //    => Hello, Spike
  //
  Polyglot.prototype.tbs = function(bundle, key, options) {
    var result,
        phrases = this.phrases,
        options = options == null ? {} : options;
    // allow number as a pluralization shortcut
    if (typeof options === 'number') {
      options = {smart_count: options};
    }
    if (typeof this.phrases[bundle] === 'object') {
    	phrases = this.phrases[bundle];
    }
    var phrase = phrases[key] || options._ || (this.allowMissing ? key : '');
    if (phrase === '') {
      warn('Missing translation for key: "'+key+'" in bundle: "'+bundle+'"');
      result = key;
    } else {
      options = clone(options);
      result = choosePluralForm(phrase, this.currentLocale, options.smart_count);
      result = interpolate(result, options);
    }
    return result;
  };
  
  // ### polyglot.tb(key, options)
  //
  // Used in a similar way as t, but works with bundles,  provides a key
  // and b will provide a bundle
  //
  // Works similar to t in that if a key does not match anything it will
  // return an array with the key or ""
  //
  //     polyglot.tb("hello");
  //     => {"hello": "Hello"}
  //
  // The phrase bundle is provided first by a call to `polyglot.extend()` or
  // `polyglot.replace()`.
  //
  // Pass in an object as the second argument to perform interpolation.  If
  // the key is not a bundle this returns the result from t as an associative array.
  //
  //     polyglot.tb("hello_name", {name: "Spike"});
  //     => {"hello_name": "Hello, Spike"}
  //
  // If the key does refer to a bundle, the second argument will attempt interpolation
  // on every member of that bundle
  //     polyglot.extend({"hello_bundle":{"hello_name": "hello %{name}", "my_name": "my name is %{name2}"}})
  //     polyglot.tb("hello_bundle", {name: "Spike", name2: "Jon"});
  //     => {"hello_name": "Hello spike", "my_name": "My name is Jon"}
  //
  // If you like, you can provide a default value in case the phrase is missing.
  // Use the special option key "_" to specify a default.
  //
  //     polyglot.tb("i_like_to_write_in_language", {
  //       _: "I like to write in %{language}.",
  //       language: "JavaScript"
  //     });
  //     => {"i_like_to_write_in_language": "I like to write in JavaScript."}
  //
  Polyglot.prototype.tb = function(key, options) {
    var result = {},
        options = options == null ? {} : options;
    if (typeof options === 'number') {
      options = {smart_count: options};
    }
    var phrases = this.phrases[key] || options._ || (this.allowMissing ? key : '');
    if (phrase === '') {
      warn('Missing bundle for key: "'+key+'"');
      result = key;
    } else if (typeof phrases === "object") {
      for (var phraseKey in phrases) {
        if (phrases.hasOwnProperty(phraseKey)) {
	      var phrase = phrases[phraseKey];
	      options = clone(options);
          result[phraseKey] = choosePluralForm(phrase, this.currentLocale, options.smart_count);
          result[phraseKey] = interpolate(result[phraseKey], options);
        }
      }
    } else {
      result[key] = this.t(key, options);
    }
    return result;
  };


  // #### Pluralization methods
  // The string that separates the different phrase possibilities.
  var delimeter = '||||';

  // Mapping from pluralization group plural logic.
  var pluralTypes = {
    chinese:   function(n) { return 0; },
    german:    function(n) { return n !== 1 ? 1 : 0; },
    french:    function(n) { return n > 1 ? 1 : 0; },
    russian:   function(n) { return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2; },
    czech:     function(n) { return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2; },
    polish:    function(n) { return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2); },
    icelandic: function(n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; }
  };

  // Mapping from pluralization group to individual locales.
  var pluralTypeToLanguages = {
    chinese:   ['id', 'ja', 'ko', 'ms', 'th', 'tr', 'zh'],
    german:    ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
    french:    ['fr', 'tl'],
    russian:   ['hr', 'ru'],
    czech:     ['cs'],
    polish:    ['pl'],
    icelandic: ['is']
  };

  function langToTypeMap(mapping) {
    var type, langs, l, ret = {};
    for (type in mapping) {
      if (mapping.hasOwnProperty(type)) {
        langs = mapping[type];
        for (l in langs) {
          ret[langs[l]] = type;
        }
      }
    }
    return ret;
  }

  // Trim a string.
  function trim(str){
    var trimRe = /^\s+|\s+$/g;
    return str.replace(trimRe, '');
  }

  // Based on a phrase text that contains `n` plural forms separated
  // by `delimeter`, a `locale`, and a `count`, choose the correct
  // plural form, or none if `count` is `null`.
  function choosePluralForm(text, locale, count){
    var ret, texts, chosenText;
    if (count != null && text) {
      texts = text.split(delimeter);
      chosenText = texts[pluralTypeIndex(locale, count)] || texts[0];
      ret = trim(chosenText);
    } else {
      ret = text;
    }
    return ret;
  }

  function pluralTypeName(locale) {
    var langToPluralType = langToTypeMap(pluralTypeToLanguages);
    return langToPluralType[locale] || langToPluralType.en;
  }

  function pluralTypeIndex(locale, count) {
    return pluralTypes[pluralTypeName(locale)](count);
  }

  // ### interpolate
  //
  // Does the dirty work. Creates a `RegExp` object for each
  // interpolation placeholder.
  function interpolate(phrase, options) {
    for (var arg in options) {
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.
        phrase = phrase.replace(new RegExp('%\\{'+arg+'\\}', 'g'), options[arg]);
      }
    }
    return phrase;
  }

  // ### warn
  //
  // Provides a warning in the console if a phrase key is missing.
  function warn(message) {
    root.console && root.console.warn && root.console.warn('WARNING: ' + message);
  }

  // ### clone
  //
  // Clone an object.
  function clone(source) {
    var ret = {};
    for (var prop in source) {
      ret[prop] = source[prop];
    }
    return ret;
  }


  // Export for Node, attach to `window` for browser.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Polyglot;
  } else {
    root.Polyglot = Polyglot;
  }

}(this);

