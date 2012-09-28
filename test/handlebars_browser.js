describe("Handlebars support", function(){

  it("should register Handlebars helpers if Handlebars is present", function(){
    chai.assert(Handlebars.helpers.t != null);
    chai.assert(Handlebars.helpers.pluralize != null);
  });

  it("should support basic 't' Handlebars helper", function(){
    Polyglot.extend({
      "hello": "Hola"
    });
    var template = Handlebars.compile('<h1>{{t "hello"}}</h1>');
    chai.assert(template(), "<h1>Hola</h1>");
  });
});
