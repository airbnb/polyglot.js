Polyglot = require("../lib/polyglot")
should = require('should')

describe "t", ->

  phrases =
    "hello": "Hello"
    "hi_name_welcome_to_place": "Hi, %{name}, welcome to %{place}!"
    "name_your_name_is_name": "%{name}, your name is %{name}!"
    "empty_string": ""

  beforeEach ->
    @polyglot = new Polyglot({phrases:phrases})

  it "should translate a simple string", ->
    @polyglot.t("hello").should.equal("Hello")

  it "should return the key if translation not found", ->
    @polyglot.t("bogus_key").should.equal("bogus_key")

  it "should interpolate", ->
    @polyglot.t("hi_name_welcome_to_place", {name: "Spike", place: "the webz"}).should.equal("Hi, Spike, welcome to the webz!")

  it "should interpolate the same placeholder multiple times", ->
    @polyglot.t("name_your_name_is_name", {name: "Spike"}).should.equal("Spike, your name is Spike!")

  it "should allow you to supply default values", ->
    @polyglot.t("can_i_call_you_name",
      _: "Can I call you %{name}?"
      name: "Robert"
    ).should.equal "Can I call you Robert?"

  it "should return the non-interpolated key if not initialized with allowMissing and translation not found", ->
    @polyglot.t("Welcome %{name}",
      name: "Robert"
    ).should.equal "Welcome %{name}"

  it "should return an interpolated key if initialized with allowMissing and translation not found", ->
    @polyglot = new Polyglot({phrases:phrases,allowMissing:true})
    @polyglot.t("Welcome %{name}",
      name: "Robert"
    ).should.equal "Welcome Robert"

  it "should return the translation even if it is an empty string", ->
    @polyglot = new Polyglot({phrases:phrases})
    @polyglot.t("empty_string").should.equal("")

  it "should return the default value even if it is an empty string", ->
    @polyglot = new Polyglot({phrases:phrases})
    @polyglot.t("bogus_key", {
      _: ""
    }).should.equal("")

  it "should handle dollar signs in the substitution value", ->
    @polyglot = new Polyglot({phrases: phrases})
    @polyglot.t("hi_name_welcome_to_place", {
      name: '$abc $0'
      place: '$1 $&'
    }).should.equal("Hi, $abc $0, welcome to $1 $&!")

  it "should support nested phrase objects", ->
    nestedPhrases =
      nav:
        presentations: "Presentations"
        hi_user: "Hi, %{user}."
        cta:
          join_now: "Join now!"
      'header.sign_in': "Sign In"
    @polyglot = new Polyglot({phrases: nestedPhrases})
    @polyglot.t("nav.presentations").should.equal "Presentations"
    @polyglot.t("nav.hi_user", user: "Raph").should.equal "Hi, Raph."
    @polyglot.t("nav.cta.join_now").should.equal "Join now!"
    @polyglot.t("header.sign_in").should.equal "Sign In"

describe "pluralize", ->

  phrases =
     "count_name": "%{smart_count} Name |||| %{smart_count} Names"

  beforeEach ->
    @polyglot = new Polyglot({phrases:phrases, locale:'en'})

  it "should support pluralization with an integer", ->
    @polyglot.t("count_name", smart_count: 0).should.equal("0 Names")
    @polyglot.t("count_name", smart_count: 1).should.equal("1 Name")
    @polyglot.t("count_name", smart_count: 2).should.equal("2 Names")
    @polyglot.t("count_name", smart_count: 3).should.equal("3 Names")

  it "should accept a number as a shortcut to pluralize a word", ->
    @polyglot.t("count_name", 0).should.equal "0 Names"
    @polyglot.t("count_name", 1).should.equal "1 Name"
    @polyglot.t("count_name", 2).should.equal "2 Names"
    @polyglot.t("count_name", 3).should.equal "3 Names"

describe "locale", ->

  beforeEach ->
    @polyglot = new Polyglot()

  it "should default to 'en'", ->
    @polyglot.locale().should.equal "en"

  it "should get and set locale", ->
    @polyglot.locale("es")
    @polyglot.locale().should.equal "es"

    @polyglot.locale("fr")
    @polyglot.locale().should.equal "fr"

describe "extend", ->

  beforeEach ->
    @polyglot = new Polyglot()

  it "should support multiple extends, overriding old keys", ->
    @polyglot.extend({aKey: 'First time'})
    @polyglot.extend({aKey: 'Second time'})
    @polyglot.t('aKey').should.equal 'Second time'

  it "shouldn't forget old keys", ->
    @polyglot.extend({firstKey: 'Numba one', secondKey: 'Numba two'})
    @polyglot.extend({secondKey: 'Numero dos'})
    @polyglot.t('firstKey').should.equal 'Numba one'

  it "should support optional `prefix` argument", ->
    @polyglot.extend({click: 'Click', hover: 'Hover'}, 'sidebar')
    @polyglot.phrases['sidebar.click'].should.equal 'Click'
    @polyglot.phrases['sidebar.hover'].should.equal 'Hover'
    should.not.exist(@polyglot.phrases['click'])

  it "should support nested object", ->
    @polyglot.extend({
      sidebar:
        click: 'Click'
        hover: 'Hover'
      nav:
        header:
          log_in: 'Log In'
    })
    @polyglot.phrases['sidebar.click'].should.equal 'Click'
    @polyglot.phrases['sidebar.hover'].should.equal 'Hover'
    @polyglot.phrases['nav.header.log_in'].should.equal 'Log In'
    should.not.exist(@polyglot.phrases['click'])
    should.not.exist(@polyglot.phrases['header.log_in'])
    should.not.exist(@polyglot.phrases['log_in'])

describe "clear", ->

  beforeEach ->
    @polyglot = new Polyglot()

  it "should wipe out old phrases", ->
    @polyglot.extend {hiFriend: "Hi, Friend."}
    @polyglot.clear()
    @polyglot.t("hiFriend").should.equal "hiFriend"

describe "replace", ->

  beforeEach ->
    @polyglot = new Polyglot()

  it "should wipe out old phrases and replace with new phrases", ->
    @polyglot.extend {hiFriend: "Hi, Friend.", byeFriend: "Bye, Friend."}
    @polyglot.replace {hiFriend: "Hi, Friend."}
    @polyglot.t("hiFriend").should.equal "Hi, Friend."
    @polyglot.t("byeFriend").should.equal "byeFriend"

describe "unset", ->

  beforeEach ->
    @polyglot = new Polyglot()

  it "should unset a key based on a string", ->
    @polyglot.extend { test_key: "test_value"}
    @polyglot.has("test_key").should.equal true
    @polyglot.unset("test_key")
    @polyglot.has("test_key").should.equal false

  it "should unset a key based on an object hash", ->
    @polyglot.extend { test_key: "test_value", foo: "bar" }
    @polyglot.has("test_key").should.equal true
    @polyglot.has("foo").should.equal true
    @polyglot.unset { test_key: "test_value", foo: "bar" }
    @polyglot.has("test_key").should.equal false
    @polyglot.has("foo").should.equal false

  it "should unset nested objects using recursive prefix call", ->
    @polyglot.extend { foo: { bar: "foobar" }}
    @polyglot.has("foo.bar").should.equal true
    @polyglot.unset { foo: { bar: "foobar" }}
    @polyglot.has("foo.bar").should.equal false
