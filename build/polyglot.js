//     (c) 2012 Airbnb, Inc.
//
//     polyglot.js may be freely distributed under the terms of the BSD
//     license. For all licensing information, details, and documention:
//     http://airbnb.github.com/polyglot.js

!function(root) {
  'use strict';

  var phrases = {};

  function extend(morePhrases) {
    for (var key in morePhrases) {
      if (morePhrases.hasOwnProperty(key)) {
        phrases[key] = morePhrases[key];
      }
    }
  };


  function t(key, options) {
    var result;
    options = options || {};
    var phrase = phrases[key] || options['default'] || '';
    if (phrase === '') {
      warn('Missing translation for key: "'+key+'"');
      result = key;
    } else {
      result = interpolate(phrase, options);
    }
    return result;
  };


  function interpolate(phrase, options) {
    for (var arg in options) {
      if (arg !== 'default' && options.hasOwnProperty(arg)) {
        phrase = phrase.replace(new RegExp('%\\{'+arg+'\\}', 'g'), options[arg]);
      }
    }
    return phrase;
  };


  function pluralize(object, count) {
    if (count != null && typeof count.length !== 'undefined') {
      count = count.length;
    }
    var key;
    if (count === 0) {
      key = "pluralize." + object + ".zero";
    } else if (count === 1) {
      key = "pluralize." + object + ".one";
    } else {
      key = "pluralize." + object + ".many";
    }
    return t(key, {count: count});
  };


  function registerHandlebars(handlebars) {
    for (var key in handlebarsHelpers) {
      if (handlebarsHelpers.hasOwnProperty(key)) {
        handlebars.registerHelper(key, handlebarsHelpers[key]);
      }
    }
  };

  // Handlebars helpers
  // ==================

  var handlebarsHelpers = {
    t: function(key, options) {
      return t(key, options.hash);
    },

    pluralize: function(object, block) {
      return pluralize(object, block.hash.count);
    }
  };


  // Helper functions
  // ===================

  function warn(message) {
    root.console && root.console.warn && root.console.warn('WARNING: ' + message);
  }

  // Export methods
  // ==============

  var Polyglot = {
    extend: extend,
    t: t,
    interpolate: interpolate,
    pluralize: pluralize,
    registerHandlebars: registerHandlebars
  };

  // Export for Node, attach to `window` for browser.
  // ================================================

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Polyglot;
  } else {
    root.Polyglot = Polyglot;
  }


  // Register Handlebars helpers if Handlebars is found.
  if (root.Handlebars && root.Handlebars.registerHelper) {
    registerHandlebars(root.Handlebars);
  }

}(this);
