Polyglot.js
===========

Polyglot.js is an I18n helper library written in JavaScript, made to
work both in the browser and in Node. It provides a simple solution for
interpolation and pluralization, based off of Airbnb's
experience adding I18n functionality to its Backbone.js and Node apps.

Polylglot is agnostic to your translation backend. It doesn't perform any
translation; it simply gives you a way to manage translated phrases from
your client- or server-side JavaScript application.

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

### Interpolation

`Polyglot.t()` also provides interpolation. Pass an object with key-value pairs of
interpolation arguments as the second parameter.

    Polyglot.extend({
      "hello_name": "Hola, %{name}."
    });

    Polyglot.t("hello_name", {name: "DeNiro"});
    => "Hola, DeNiro."

### Pluralization

Polyglot provides a very basic pattern for providing
pluralization based on a singular noun. Because varous languages
have different nominal forms for zero, one, and multiple, and because
the noun can be before or after the count, we have to be overly explicit
about the possibile phrases.

For pluralizing "car", it assumes you have phrase keys of the form:

    Polyglot.extend({
      "pluralize.car.zero": "%{count} cars",
      "pluralize.car.one":  "%{count} car",
      "pluralize.car.many": "%{count} cars"
    });

`Polyglot.pluralize()` will choose the appropriate phrase based
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

### Handlebars Helpers

Polygot also provides two useful Handlebars helpers: `t` and `pluralize`.

#### t

You can use the `t` helper with or without interpolation arguments.

    // In a Handlebars template
    <h1>{{t "welcome_to_my_site"}}</h1>
    <p>{{t "signed_in_as_username" username=username}}</p>

    // In your JavaScript
    Polyglot.extend({
      "welcome_to_my_site": "Weclome to my site.",
      "signed_in_as_username": "Signed in as %{username}."
    });

    var template = Handlebars.compile(...);
    var html = template({username: "Spike"});

gives:

    <h1>Welcome to my site.</h1>
    <p>Signed in as Spike.</p>

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

### Polyglot.registerHandlebars(Handlebars)

Registers Polyglot's Handlebars helpers on a given
Handlebars context. This is automatically called if we find
a global `Handlebars` object, which makes use in the
browser a snap if Handlebars is included before Polyglot.
Otherwise, you can manually register the Handlebars helpers
by passing in a Handlebars conext, which is the primary Node
use case:

    var Handlebars = require('handlebars');
    var Polyglot = require('polyglot');

    console.log(Handlebars.helpers.t);
    => undefined

    Polyglot.registerHandlebars(Handlebars);

    console.log(Handlebars.helpers.t);
    => function(){...}

## Handlebars helpers

### t

    <h1>{{t "hello_name" name=name}}</h1>

gives:

    <h1>Hello, DeNiro.</h1>

### pluralize

    <p>{{pluralize "car" count=carCollection}}</p>

gives:

    <p>3 cars</p>

