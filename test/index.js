var Polyglot = require('../');
var expect = require('chai').expect;

describe('t', function () {
  var phrases = {
    hello: 'Hello',
    hi_name_welcome_to_place: 'Hi, %{name}, welcome to %{place}!',
    name_your_name_is_name: '%{name}, your name is %{name}!',
    empty_string: ''
  };

  var polyglot;
  beforeEach(function () {
    polyglot = new Polyglot({ phrases: phrases });
  });

  it('translates a simple string', function () {
    expect(polyglot.t('hello')).to.equal('Hello');
  });

  it('returns the key if translation not found', function () {
    expect(polyglot.t('bogus_key')).to.equal('bogus_key');
  });

  it('interpolates', function () {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: 'Spike',
      place: 'the webz'
    })).to.equal('Hi, Spike, welcome to the webz!');
  });

  it('interpolates the same placeholder multiple times', function () {
    expect(polyglot.t('name_your_name_is_name', {
      name: 'Spike'
    })).to.equal('Spike, your name is Spike!');
  });

  it('allows you to supply default values', function () {
    expect(polyglot.t('can_i_call_you_name', {
      _: 'Can I call you %{name}?',
      name: 'Robert'
    })).to.equal('Can I call you Robert?');
  });

  it('returns the non-interpolated key if not initialized with allowMissing and translation not found', function () {
    expect(polyglot.t('Welcome %{name}', {
      name: 'Robert'
    })).to.equal('Welcome %{name}');
  });

  it('returns an interpolated key if initialized with allowMissing and translation not found', function () {
    var instance = new Polyglot({ phrases: phrases, allowMissing: true });
    expect(instance.t('Welcome %{name}', {
      name: 'Robert'
    })).to.equal('Welcome Robert');
  });

  it('returns the translation even if it is an empty string', function () {
    expect(polyglot.t('empty_string')).to.equal('');
  });

  it('returns the default value even if it is an empty string', function () {
    expect(polyglot.t('bogus_key', { _: '' })).to.equal('');
  });

  it('handles dollar signs in the substitution value', function () {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: '$abc $0',
      place: '$1 $&'
    })).to.equal('Hi, $abc $0, welcome to $1 $&!');
  });

  it('supports nested phrase objects', function () {
    var nestedPhrases = {
      nav: {
        presentations: 'Presentations',
        hi_user: 'Hi, %{user}.',
        cta: {
          join_now: 'Join now!',
        },
      },
      'header.sign_in': 'Sign In'
    };
    var instance = new Polyglot({ phrases: nestedPhrases });
    expect(instance.t('nav.presentations')).to.equal('Presentations');
    expect(instance.t('nav.hi_user', { user: 'Raph' })).to.equal('Hi, Raph.');
    expect(instance.t('nav.cta.join_now')).to.equal('Join now!');
    expect(instance.t('header.sign_in')).to.equal('Sign In');
  });
});

describe('pluralize', function () {
  var phrases = {
    count_name: '%{smart_count} Name |||| %{smart_count} Names'
  };

  var polyglot;
  beforeEach(function () {
    polyglot = new Polyglot({ phrases: phrases, locale:'en' });
  });

  it('supports pluralization with an integer', function () {
    expect(polyglot.t('count_name', { smart_count: 0 })).to.equal('0 Names');
    expect(polyglot.t('count_name', { smart_count: 1 })).to.equal('1 Name');
    expect(polyglot.t('count_name', { smart_count: 2 })).to.equal('2 Names');
    expect(polyglot.t('count_name', { smart_count: 3 })).to.equal('3 Names');
  });

  it('accepts a number as a shortcut to pluralize a word', function () {
    expect(polyglot.t('count_name', 0)).to.equal('0 Names');
    expect(polyglot.t('count_name', 1)).to.equal('1 Name');
    expect(polyglot.t('count_name', 2)).to.equal('2 Names');
    expect(polyglot.t('count_name', 3)).to.equal('3 Names');
  });
});

describe('locale', function () {
  var polyglot;
  beforeEach(function () {
    polyglot = new Polyglot();
  });

  it('defaults to "en"', function () {
    expect(polyglot.locale()).to.equal('en');
  });

  it('gets and sets locale', function () {
    polyglot.locale('es');
    expect(polyglot.locale()).to.equal('es');

    polyglot.locale('fr');
    expect(polyglot.locale()).to.equal('fr');
  });
});

describe('extend', function () {
  var polyglot;
  beforeEach(function () {
    polyglot = new Polyglot();
  });

  it('supports multiple extends, overriding old keys', function () {
    polyglot.extend({ aKey: 'First time' });
    polyglot.extend({ aKey: 'Second time' });
    expect(polyglot.t('aKey')).to.equal('Second time');
  });

  it('does not forget old keys', function () {
    polyglot.extend({ firstKey: 'Numba one', secondKey: 'Numba two' });
    polyglot.extend({ secondKey: 'Numero dos' });
    expect(polyglot.t('firstKey')).to.equal('Numba one');
  });

  it('supports optional `prefix` argument', function () {
    polyglot.extend({ click: 'Click', hover: 'Hover' }, 'sidebar');
    expect(polyglot.phrases['sidebar.click']).to.equal('Click');
    expect(polyglot.phrases['sidebar.hover']).to.equal('Hover');
    expect(polyglot.phrases['click']).not.to.exist;
  });

  it('supports nested object', function () {
    polyglot.extend({
      sidebar: {
        click: 'Click',
        hover: 'Hover'
      },
      nav: {
        header: {
          log_in: 'Log In'
        }
      }
    })
    expect(polyglot.phrases['sidebar.click']).to.equal('Click');
    expect(polyglot.phrases['sidebar.hover']).to.equal('Hover');
    expect(polyglot.phrases['nav.header.log_in']).to.equal('Log In');
    expect(polyglot.phrases['click']).not.to.exist;
    expect(polyglot.phrases['header.log_in']).not.to.exist;
    expect(polyglot.phrases['log_in']).not.to.exist;
  });
});

describe('clear', function () {
  var polyglot;
  beforeEach(function () {
    polyglot = new Polyglot();
  });

  it('wipes out old phrases', function () {
    polyglot.extend({ hiFriend: 'Hi, Friend.' });
    polyglot.clear();
    expect(polyglot.t('hiFriend')).to.equal('hiFriend');
  });
});

describe('replace', function () {
  var polyglot;
  beforeEach(function () {
    polyglot = new Polyglot();
  });

  it('wipes out old phrases and replace with new phrases', function () {
    polyglot.extend({ hiFriend: 'Hi, Friend.', byeFriend: 'Bye, Friend.' });
    polyglot.replace({ hiFriend: 'Hi, Friend.' });
    expect(polyglot.t('hiFriend')).to.equal('Hi, Friend.');
    expect(polyglot.t('byeFriend')).to.equal('byeFriend');
  });
});

describe('unset', function () {
  var polyglot;
  beforeEach(function () {
    polyglot = new Polyglot();
  });

  it('unsets a key based on a string', function () {
    polyglot.extend({ test_key: 'test_value' });
    expect(polyglot.has('test_key')).to.equal(true);

    polyglot.unset('test_key');
    expect(polyglot.has('test_key')).to.equal(false);
  });

  it('unsets a key based on an object hash', function () {
    polyglot.extend({ test_key: 'test_value', foo: 'bar' });
    expect(polyglot.has('test_key')).to.equal(true);
    expect(polyglot.has('foo')).to.equal(true);

    polyglot.unset({ test_key: 'test_value', foo: 'bar' });
    expect(polyglot.has('test_key')).to.equal(false);
    expect(polyglot.has('foo')).to.equal(false);
  });

  it('unsets nested objects using recursive prefix call', function () {
    polyglot.extend({ foo: { bar: 'foobar' }});
    expect(polyglot.has('foo.bar')).to.equal(true);

    polyglot.unset({ foo: { bar: 'foobar' }});
    expect(polyglot.has('foo.bar')).to.equal(false);
  });
});
