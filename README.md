Polyglot.js
===========

Polyglot.js is a tiny I18n helper library written in JavaScript, made to
work both in the browser and in Node. It provides a simple solution for
interpolation and pluralization, based off of Airbnb's
experience adding I18n functionality to its Backbone.js and Node apps.

I18n is incredibly important for us at [Airbnb](https://www.airbnb.com/),
as we have listings in 192 countries, and we translate our site into 30-odd different languages.
We're also [hiring talented engineers](https://www.airbnb.com/jobs/departments/engineering)
to help us scale up to meet the challenges of buliding a global marketplace.

View the [documentation on Github](http://airbnb.github.com/polyglot.js).

View the [annotated source](http://airbnb.github.com/polyglot.js/polyglot.html).

Download the [development version](https://raw.github.com/airbnb/polyglot.js/master/build/polyglot.js): 2.6kb, unminified with comments.

Download the [production version](https://raw.github.com/airbnb/polyglot.js/master/build/polyglot.min.js): 1.3kb, minified and gzipped.

Polylglot is agnostic to your translation backend. It doesn't perform any
translation; it simply gives you a way to manage translated phrases from
your client- or server-side JavaScript application.

## Installation

For use with Node, install with [NPM](http://npmjs.org):

    $ npm install node-polyglot

### Running the tests

    $ npm install

    $ npm test

	   Handlebars support
	    ✓ should allow you to lazily register Handlebars helpers
	    ✓ should support basic 't' Handlebars helper
	    ✓ should support 't' Handlebars helper with interpolation
	    ✓ should escape HTML when using 't'

	  t
	    ✓ should translate a simple string
	    ✓ should return the key if translation not found
	    ✓ should interpolate
	    ✓ should interpolate the same placeholder multiple times
	    ✓ should allow you to supply default values

	  locale
	    ✓ should default to 'en'
	    ✓ should get and set locale

	  extend
	    ✓ should support multiple extends, overriding old keys
	    ✓ shouldn't forget old keys

	  clear
	    ✓ should wipe out old phrases

	  replace
	    ✓ should wipe out old phrases and replace with new phrases

	  pluralize
	    ✓ should support pluralization with an integer
	    ✓ should support pluralization with an Array
	    ✓ should support pluralization of anything with a 'length' property


	  ✔ 18 tests complete (13ms)

## Usage

### Translation

Tell Polyglot what to say by simply giving it a phrases object,
where the key is the canonical name of the phrase and the value is
the already-translated string.

    Polyglot.extend({
      "hello": "Hello"
    });

    Polyglot.t("hello");
    => "Hello"

Polyglot doesn't do the translation for you. It's up to you to give it
the proper phrases for the user's locale.

A common pattern is to gather a hash of phrases in your backend, and output
them in a `<script>` tag at the bottom of the document.  For example, in Rails:

`app/controllers/home_controller.rb`

    def index
      @phrases = {
        "home.login" => I18n.t("home.login"),
        "home.signup" => I18n.t("home.signup"),
        ...
      }
    end

`app/views/home/index.html.erb`

    <script>
      Polyglot.extend(<%= raw @phrases.to_json %>);
    </script>

And now you can utilize i.e. `Polyglot.t("home.login")` in your JavaScript application
or Handlebars templates.

### Interpolation

`Polyglot.t()` also provides interpolation. Pass an object with key-value pairs of
interpolation arguments as the second parameter.

    Polyglot.extend({
      "hello_name": "Hola, %{name}."
    });

    Polyglot.t("hello_name", {name: "DeNiro"});
    => "Hola, DeNiro."

### Pluralization

For pluralization to work properly, you need to tell Polyglot what the current locale is.  You can use `Polyglot.locale("fr")` to set the locale to, for example, French. This method is also a getter:

    Polyglot.locale()
    => "fr"

Currently, the _only_ thing that Polyglot uses this locale setting for is pluralization.

Polyglot provides a very basic pattern for providing
pluralization based on a single string that contains all plural forms for a given phrase. Because various languages have different nominal forms for zero, one, and multiple, and because the noun can be before or after the count, we have to be overly explicit
about the possible phrases.

To get a pluralized phrase, still use `Polyglot.t()` but use a specially-formatted phrase string that separates the plural forms by the delimeter `||||`, or four vertical pipe characters.

For pluralizing "car" in English, Polyglot assumes you have a phrase of the form:

    Polyglot.extend({
      "num_cars": "%{smart_count} car |||| %{smart_count} cars",
    });

English (and German, Spanish, Italian, and a few others) there are only two plural forms: singular and not-singular.

`Polyglot.t()` will choose the appropriate phrase based
on the provided `smart_count` option.

    Polyglot.t("num_cars", {smart_count: 0});
    => "0 cars"

    Polyglot.t("num_cars", {smart_count: 1});
    => "1 car"

    Polyglot.t("num_cars", {smart_count: 2});
    => "2 cars"

However, some languages get a bit more complicated. In Czech, there are three separate forms: 1, 2 through 4, and 5 and up. Russian is even crazier.

The `smart_count` option can be a `Number` or anything with a `length` property,
such as an `Array` or a `Backbone.Collection`.

    var Cars = Backbone.Collection.extend({});
    var cars = new Cars;

    Polyglot.t("num_cars", {smart_count: cars});
    => "0 cars"

    cars.add({make: "Ford", model: "Fiesta"});

    Polyglot.t("num_cars", {smart_count: cars});
    => "1 car"

    cars.add({make: "Subaru", model: "Impreza"});

    Polyglot.t("num_cars", {smart_count: cars});
    => "2 cars"

### Handlebars Helpers

Polygot also provides two useful Handlebars helpers: `t` and `pluralize`.

#### t

You can use the `t` helper with or without interpolation arguments.

    // In a Handlebars template
    <h1>{{t "welcome_to_my_site"}}</h1>
    <p>{{t "signed_in_as_username" username=username}}</p>

    // In your JavaScript
    Polyglot.extend({
      "welcome_to_my_site": "Welcome to my site.",
      "signed_in_as_username": "Signed in as %{username}."
    });

    var template = Handlebars.compile(...);
    var html = template({username: "Spike"});

gives:

    <h1>Welcome to my site.</h1>
    <p>Signed in as Spike.</p>

Use as many interpolation arguments as you need.

    // In a Handlebars template
    <h1>{{t "hello_first_and_last_name" firstName=firstName lastName=lastName}}</h1>

    // In your JavaScript
    Polyglot.extend({
      "hello_first_and_last_name": "Hello, %{firstName} %{lastName}."
    });

gives:

    <h1>Hello, Robert DeNiro.</h1>

The output of `t` is not HTML-escaped by default. To escape it, use Handlebars'
triple-bracket `{{{t ...}}}` notation:

    // In a Handlebars template
    <p>{{t "num_unread_messages" count=numUnread}}</p>
    <p>{{{t "num_unread_messages" count=numUnread}}}</p>

    // In your JavaScript
    Polyglot.extend({
      "num_unread_messages": "<strong>%{count}</strong> unread messages"
    });

gives:

    <p>&lt;strong&gt;5&lt;/strong&gt; unread messages</p>
    <p><strong>5</strong> unread messages</p>

#### pluralize

The `pluralize` helper is just a wrapper around `Polyglot.pluralize()`, so
you pass it a singular noun as the main string argument, and `count` as
an argument using Handlebars' block hash syntax.  The `count` argument can
be a `Number` or anything with a lengh property, such as `Array` or `Backbone.Collection`.

    <p>{{pluralize "car" count=carCollection}}</p>

gives:

    <p>3 cars</p>

## Public Methods

### Polyglot.extend(phrases)

Use `extend` to tell Polyglot how to translate a given key.

    Polyglot.extend({
      "hello": "Hello",
      "hello_name": "Hello, %{name}"
    });

The key can be any string.  Feel free to call `extend` multiple times;
it will override any phrases with the same key, but leave existing phrases
untouched.

### Polyglot.clear()

Clears all phrases. Useful for special cases, such as freeing
up memory if you have lots of phrases but no longer need to
perform any translation. Also used internally by `replace`.


### Polyglot.replace(phrases)

Completely replace the existing phrases with a new set of phrases.
Normally, just use `extend` to add more phrases, but under certain
circumstances, you may want to make sure no old phrases are lying around.

### Polyglot.t(key, interpolationOptions)

The most-used method. Provide a key, and `t` will return the
phrase.

    Polyglot.t("hello");
    => "Hello"

The phrase value is provided first by a call to `Polyglot.extend()` or
`Polyglot.replace()`.

Pass in an object as the second argument to perform interpolation.

    Polyglot.t("hello_name", {name: "Spike"});
    => "Hello, Spike"

If you like, you can provide a default value in case the phrase is missing.
Use the special option key "_" to specify a default.

    Polyglot.t("i_like_to_write_in_language", {
      _: "I like to write in %{language}.",
      language: "JavaScript"
    });
    => "I like to write in JavaScript."


### Polyglot.pluralize(noun, count)

For pluralizing "car", it assumes you have phrase keys of the form:

    Polyglot.extend({
      "pluralize.car.zero": "%{count} cars",
      "pluralize.car.one":  "%{count} car",
      "pluralize.car.many": "%{count} cars"
    });

`Polyglot.pluralize()' will choose the appropriate phrase based
on the provided count.

    Polyglot.pluralize("car", 0);
    => "0 cars"

    Polyglot.pluralize("car", 1);
    => "1 car"

    Polyglot.pluralize("car", 2);
    => "2 cars"

The second argument can be a `Number` or anything with a `length` property,
such as an `Array` or a `Backbone.Collection`.

    var Cars = Backbone.Collection.extend({});
    var cars = new Cars;

    Polyglot.pluralize("car", cars);
    => "0 cars"

    cars.add({make: "Ford", model: "Fiesta"});

    Polyglot.pluralize("car", cars);
    => "1 car"

    cars.add({make: "Subaru", model: "Impreza"});

    Polyglot.pluralize("car", cars);
    => "2 cars"

