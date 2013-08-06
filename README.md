Polyglot.js
===========

Polyglot.js is a tiny I18n helper library written in JavaScript, made to
work both in the browser and in CommonJS environments (Node). It provides a simple solution for interpolation and pluralization, based off of Airbnb's
experience adding I18n functionality to its Backbone.js and Node apps. Polyglot has zero dependencies.

I18n is incredibly important for us at [Airbnb](https://www.airbnb.com/),
as we have listings in 192 countries, and we translate our site into 30-odd different languages.
We're also [hiring talented engineers](https://www.airbnb.com/jobs/departments/engineering)
to help us scale up to meet the challenges of buliding a global marketplace.

View the [documentation on Github](http://airbnb.github.com/polyglot.js).

View the [annotated source](http://airbnb.github.com/polyglot.js/polyglot.html).

Download the [development version](https://raw.github.com/airbnb/polyglot.js/master/build/polyglot.js): 7.9kb, unminified with comments.

Download the [production version](https://raw.github.com/airbnb/polyglot.js/master/build/polyglot.min.js): 2.8kb, minified (1.3kb gzipped).

Polylglot is agnostic to your translation backend. It doesn't perform any
translation; it simply gives you a way to manage translated phrases from
your client- or server-side JavaScript application.

## Installation

For use with Node, install with [NPM](http://npmjs.org):

    $ npm install node-polyglot

### Running the tests

    $ npm install

    $ npm test

      t
        ✓ should translate a simple string
        ✓ should return the key if translation not found
        ✓ should interpolate
        ✓ should interpolate the same placeholder multiple times
        ✓ should allow you to supply default values 
        ✓ should return the non-interpolated key if not initialized with allowMissing and translation not found 
        ✓ should return an interpolated key if initialized with allowMissing and translation not found 

      pluralize
        ✓ should support pluralization with an integer 
        ✓ should accept a number as a shortcut to pluralize a word 

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


      ✔ 15 tests complete (19ms)

## Usage

### Instantiation

First, create an instance of the `Polyglot` class, which you will use for translation.

```js
var polyglot = new Polyglot();
```

Polyglot is class-based so you can maintain different sets of phrases at the same time, possibly in different locales. This is very useful for example when serving requests with [Express](http://expressjs.com), because each request may have a different locale, and you don't want concurrent requests to clobber each other's phrases.

### Translation

Tell Polyglot what to say by simply giving it a phrases object,
where the key is the canonical name of the phrase and the value is
the already-translated string.

```js
polyglot.extend({
  "hello": "Hello"
});

polyglot.t("hello");
=> "Hello"
```

You can also pass a mapping at instantiation, using the key `phrases`:

```js
var polyglot = new Polyglot({phrases: {"hello": "Hello"}});
```

Polyglot doesn't do the translation for you. It's up to you to give it
the proper phrases for the user's locale.

A common pattern is to gather a hash of phrases in your backend, and output
them in a `<script>` tag at the bottom of the document.  For example, in Rails:

`app/controllers/home_controller.rb`

```ruby
def index
  @phrases = {
    "home.login" => I18n.t("home.login"),
    "home.signup" => I18n.t("home.signup"),
    ...
  }
end
```

`app/views/home/index.html.erb`

```html
<script>
  var polyglot = new Polyglot({phrases: <%= raw @phrases.to_json %>});
</script>
```

And now you can utilize i.e. `polyglot.t("home.login")` in your JavaScript application
or Handlebars templates.

### Interpolation

`Polyglot.t()` also provides interpolation. Pass an object with key-value pairs of
interpolation arguments as the second parameter.

```js
polyglot.extend({
  "hello_name": "Hola, %{name}."
});

polyglot.t("hello_name", {name: "DeNiro"});
=> "Hola, DeNiro."
```

### Pluralization

For pluralization to work properly, you need to tell Polyglot what the current locale is.  You can use `polyglot.locale("fr")` to set the locale to, for example, French. This method is also a getter:

```js
polyglot.locale()
=> "fr"
```

You can also pass this in during instantiation.

```js
var polyglot = new Polyglot({locale: "fr"});
```

Currently, the _only_ thing that Polyglot uses this locale setting for is pluralization.

Polyglot provides a very basic pattern for providing
pluralization based on a single string that contains all plural forms for a given phrase. Because various languages have different nominal forms for zero, one, and multiple, and because the noun can be before or after the count, we have to be overly explicit
about the possible phrases.

To get a pluralized phrase, still use `polyglot.t()` but use a specially-formatted phrase string that separates the plural forms by the delimeter `||||`, or four vertical pipe characters.

For pluralizing "car" in English, Polyglot assumes you have a phrase of the form:

```js
polyglot.extend({
  "num_cars": "%{smart_count} car |||| %{smart_count} cars",
});
```

English (and German, Spanish, Italian, and a few others) there are only two plural forms: singular and not-singular.

Some languages get a bit more complicated. In Czech, there are three separate forms: 1, 2 through 4, and 5 and up. Russian is even crazier.

`polyglot.t()` will choose the appropriate phrase based
on the provided `smart_count` option, whose value is a number.

```js
polyglot.t("num_cars", {smart_count: 0});
=> "0 cars"

polyglot.t("num_cars", {smart_count: 1});
=> "1 car"

polyglot.t("num_cars", {smart_count: 2});
=> "2 cars"
```

As a shortcut, you can also pass a number to the second parameter:

```js
polyglot.t("num_cars", 2);
=> "2 cars"
```

## Public Methods

### Polyglot.prototype.extend(phrases)

Use `extend` to tell Polyglot how to translate a given key.

```js
polyglot.extend({
  "hello": "Hello",
  "hello_name": "Hello, %{name}"
});
```

The key can be any string.  Feel free to call `extend` multiple times;
it will override any phrases with the same key, but leave existing phrases
untouched.

### Polyglot.prototype.clear()

Clears all phrases. Useful for special cases, such as freeing
up memory if you have lots of phrases but no longer need to
perform any translation. Also used internally by `replace`.


### Polyglot.prototype.replace(phrases)

Completely replace the existing phrases with a new set of phrases.
Normally, just use `extend` to add more phrases, but under certain
circumstances, you may want to make sure no old phrases are lying around.

### Polyglot.prototype.t(key, interpolationOptions)

The most-used method. Provide a key, and `t()` will return the
phrase.

```
polyglot.t("hello");
=> "Hello"
```

The phrase value is provided first by a call to `polyglot.extend()` or
`polyglot.replace()`.

Pass in an object as the second argument to perform interpolation.

```
polyglot.t("hello_name", {name: "Spike"});
=> "Hello, Spike"
```

Pass a number as the second argument as a shortcut to `smart_count`:

```js
// same as: polyglot.t("car", {smart_count: 2});
polyglot.t("car", 2);
=> "2 cars"
```

If you like, you can provide a default value in case the phrase is missing.
Use the special option key "_" to specify a default.

```js
polyglot.t("i_like_to_write_in_language", {
  _: "I like to write in %{language}.",
  language: "JavaScript"
});
=> "I like to write in JavaScript."
```

## History

### v0.3.0: August 6, 2013
* _Breaking change_: Removed `pluralize()` method; instead, just use the `t()` method, passing in a `smart_count` option.
* _Breaking change_: Removed the ability to use `Array`, `Backbone.Collection`, etc. instances for the `smart_count` option; instead, must pass a `Number`.
* Allow passing `Number` as second argument to `t()`, which gets converted to the options object `{smart_count: <my number>}`.

### v0.2.1: May 2, 2013
* Added `allowMissing` option to let the phrase key be the default translation (thanks @ziad-saab).

### v0.2.0: Dec 20, 2012
* _Breaking change_: Moved from Singleton pattern to class-based. Now you create an instance of the `Polyglot` class rather than using class methods directly on it. The reason is to allow maintaining multiple sets of phrases, which is something we ran into at Airbnb with a highly-concurrent Express app.
* _Breaking change_: Removed the built-in Handlebars helpers, because Handlebars is a singleton, and it's messy to create a single helper function that can be bound to different Polyglot instances.  Instead, it's super easy to create your own, based on your requirements.
