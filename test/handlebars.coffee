polyglot = require("../lib/polyglot")
Handlebars = require('handlebars')

describe "Handlebars support", ->

  polyglot.registerHandlebars(Handlebars)

  polyglot.extend
    "hello": "Hola"
    "hi_name": "Hola, %{name}"
    "im_so_excited": "Estoy <strong>muy</strong> emocionada"

  it "should allow you to lazily register Handlebars helpers", ->
    Handlebars.helpers.should.have.property('t')

  it "should support basic 't' Handlebars helper", ->
    template = Handlebars.compile """
      <h1>{{t "hello"}}</h1>
      """
    template().should.eql "<h1>Hola</h1>"

  it "should support 't' Handlebars helper with interpolation", ->
    template = Handlebars.compile """
      <h1>{{t "hi_name" name=name}}</h1>
      """
    template(name: "Spike").should.eql "<h1>Hola, Spike</h1>"

  it "should escape HTML when using 't'", ->
    template = Handlebars.compile """
      <p>{{t "im_so_excited"}}</p>
      """
    template().should.eql "<p>Estoy &lt;strong&gt;muy&lt;/strong&gt; emocionada</p>"

    template = Handlebars.compile """
      <p>{{{t "im_so_excited"}}}</p>
      """
    template().should.eql "<p>Estoy <strong>muy</strong> emocionada</p>"
