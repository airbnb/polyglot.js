polyglot = require("../lib/polyglot")
should = require('chai').should()

describe "t", ->

  phrases =
    "hello": "Hello"
    "hi_name_welcome_to_place": "Hi, %{name}, welcome to %{place}!"
    "name_your_name_is_name": "%{name}, your name is %{name}!"

  before ->
    polyglot.extend(phrases)

  it "should translate a simple string", ->
    polyglot.t("hello").should.equal("Hello")

  it "should return the key if translation not found", ->
    polyglot.t("bogus_key").should.equal("bogus_key")

  it "should interpolate", ->
    polyglot.t("hi_name_welcome_to_place", {name: "Spike", place: "the webz"}).should.equal("Hi, Spike, welcome to the webz!")

  it "should interpolate the same placeholder multiple times", ->
    polyglot.t("name_your_name_is_name", {name: "Spike"}).should.equal("Spike, your name is Spike!")


describe "extend", ->

  it "should support multiple extends, overriding old keys", ->
    polyglot.extend {aKey: 'First time'}
    polyglot.extend {aKey: 'Second time'}
    polyglot.t('aKey').should.equal('Second time')

  it "shouldn't forget old keys", ->
    polyglot.extend {firstKey: 'Numba one', secondKey: 'Numba two'}
    polyglot.extend {secondKey: 'Numero dos'}
    polyglot.t('firstKey').should.equal('Numba one')

describe "pluralize", ->

  phrases =
    "pluralize.Name.zero": "%{count} Names"
    "pluralize.Name.one":  "%{count} Name"
    "pluralize.Name.many": "%{count} Names"

  before ->
    polyglot.extend(phrases)

  it "should support pluralization with an integer", ->
    polyglot.pluralize("Name", 0).should.equal("0 Names")
    polyglot.pluralize("Name", 1).should.equal("1 Name")
    polyglot.pluralize("Name", 2).should.equal("2 Names")
    polyglot.pluralize("Name", 3).should.equal("3 Names")

  it "should support pluralization with an Array", ->
    names = []
    polyglot.pluralize("Name", names).should.equal("0 Names")
    names.push "LTJ Bukem"
    polyglot.pluralize("Name", names).should.equal("1 Name")
    names.push "MC Conrad"
    polyglot.pluralize("Name", names).should.equal("2 Names")

  it "should support pluralization of anything with a 'length' property", ->
    obj = {length: 0}
    polyglot.pluralize("Name", obj).should.equal("0 Names")
    obj.length++
    polyglot.pluralize("Name", obj).should.equal("1 Name")
    obj.length++
    polyglot.pluralize("Name", obj).should.equal("2 Names")
