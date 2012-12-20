Polyglot = require("../lib/pg")
should = require('chai').should()

describe "t", ->

  phrases =
    "hello": "Hello"
    "hi_name_welcome_to_place": "Hi, %{name}, welcome to %{place}!"
    "name_your_name_is_name": "%{name}, your name is %{name}!"

  it "should translate a simple string", ->
    polyglot = new Polyglot({phrases:phrases})
    polyglot.t("hello").should.equal("Hello")

  it "should return the key if translation not found", ->
    polyglot = new Polyglot({phrases:phrases})
    polyglot.t("bogus_key").should.equal("bogus_key")

  it "should interpolate", ->
    polyglot = new Polyglot({phrases:phrases})
    polyglot.t("hi_name_welcome_to_place", {name: "Spike", place: "the webz"}).should.equal("Hi, Spike, welcome to the webz!")

  it "should interpolate the same placeholder multiple times", ->
    polyglot = new Polyglot({phrases:phrases})
    polyglot.t("name_your_name_is_name", {name: "Spike"}).should.equal("Spike, your name is Spike!")

  it "should allow you to supply default values", ->
    polyglot = new Polyglot({phrases:phrases})
    polyglot.t("can_i_call_you_name",
      _: "Can I call you %{name}?"
      name: "Robert"
    ).should.equal "Can I call you Robert?"

describe "locale", ->

  it "should default to 'en'", ->
    polyglot = new Polyglot()
    polyglot.locale().should.equal "en"

  it "should get and set locale", ->
    polyglot = new Polyglot()
    polyglot.locale("es")
    polyglot.locale().should.equal "es"

    polyglot.locale("fr")
    polyglot.locale().should.equal "fr"

describe "extend", ->

  it "should support multiple extends, overriding old keys", ->
    polyglot = new Polyglot()
    polyglot.extend {aKey: 'First time'}
    polyglot.extend {aKey: 'Second time'}
    polyglot.t('aKey').should.equal 'Second time'

  it "shouldn't forget old keys", ->
    polyglot = new Polyglot()
    polyglot.extend {firstKey: 'Numba one', secondKey: 'Numba two'}
    polyglot.extend {secondKey: 'Numero dos'}
    polyglot.t('firstKey').should.equal 'Numba one'

describe "clear", ->

  it "should wipe out old phrases", ->
    polyglot = new Polyglot()
    polyglot.extend {hiFriend: "Hi, Friend."}
    polyglot.clear()
    polyglot.t("hiFriend").should.equal "hiFriend"


describe "replace", ->

  it "should wipe out old phrases and replace with new phrases", ->
    polyglot = new Polyglot()
    polyglot.extend {hiFriend: "Hi, Friend.", byeFriend: "Bye, Friend."}
    polyglot.replace {hiFriend: "Hi, Friend."}
    polyglot.t("hiFriend").should.equal "Hi, Friend."
    polyglot.t("byeFriend").should.equal "byeFriend"

describe "pluralize", ->

  phrases =
    "shared.pluralize.Name": "%{smart_count} Name |||| %{smart_count} Names"

  it "should support pluralization with an integer", ->
    polyglot = new Polyglot({phrases:phrases, locale:'en'})
    polyglot.t("shared.pluralize.Name", smart_count: 0).should.equal("0 Names")
    polyglot.t("shared.pluralize.Name", smart_count: 1).should.equal("1 Name")
    polyglot.t("shared.pluralize.Name", smart_count: 2).should.equal("2 Names")
    polyglot.t("shared.pluralize.Name", smart_count: 3).should.equal("3 Names")

  it "should support pluralization with an Array", ->
    polyglot = new Polyglot({phrases:phrases, locale:'en'})
    names = []
    polyglot.t("shared.pluralize.Name", smart_count: names).should.equal("0 Names")
    names.push "LTJ Bukem"
    polyglot.t("shared.pluralize.Name", smart_count: names).should.equal("1 Name")
    names.push "MC Conrad"
    polyglot.t("shared.pluralize.Name", smart_count: names).should.equal("2 Names")

  it "should support pluralization of anything with a 'length' property", ->
    polyglot = new Polyglot({phrases:phrases, locale:'en'})
    obj = {length: 0}
    polyglot.t("shared.pluralize.Name", smart_count: obj).should.equal("0 Names")
    obj.length++
    polyglot.t("shared.pluralize.Name", smart_count: obj).should.equal("1 Name")
    obj.length++
    polyglot.t("shared.pluralize.Name", smart_count: obj).should.equal("2 Names")

  it "should support the 'pluralize' shortcut", ->
    polyglot = new Polyglot({phrases:phrases, locale:'en'})
    polyglot.pluralize("Name", 0).should.equal("0 Names")
    polyglot.pluralize("Name", 1).should.equal("1 Name")
    polyglot.pluralize("Name", 2).should.equal("2 Names")
    polyglot.pluralize("Name", 3).should.equal("3 Names")
