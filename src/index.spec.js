import { expect } from 'chai';
import Polyglot from '../lib';

describe('t', () => {
  const phrases = {
    hello: 'Hello',
    hi_name_welcome_to_place: 'Hi, %{name}, welcome to %{place}!',
    name_your_name_is_name: '%{name}, your name is %{name}!',
    empty_string: '',
    two_forms: '%{smart_count} form1 |||| %{smart_count} form2',
    one_form: '%{smart_count} form1'
  };

  let polyglot;
  beforeEach(() => {
    polyglot = new Polyglot({ phrases });
  });

  it('translates a simple string', () => {
    expect(polyglot.t('hello')).to.equal('Hello');
  });

  it('returns the key if translation not found', () => {
    expect(polyglot.t('bogus_key')).to.equal('bogus_key');
  });

  it('interpolates', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: 'Spike',
      place: 'the webz'
    })).to.equal('Hi, Spike, welcome to the webz!');
  });

  it('interpolates with missing substitutions', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      place: undefined
    })).to.equal('Hi, %{name}, welcome to %{place}!');
  });

  it('interpolates the same placeholder multiple times', () => {
    expect(polyglot.t('name_your_name_is_name', {
      name: 'Spike'
    })).to.equal('Spike, your name is Spike!');
  });

  it('allows you to supply default values', () => {
    expect(polyglot.t('can_i_call_you_name', {
      _: 'Can I call you %{name}?',
      name: 'Robert'
    })).to.equal('Can I call you Robert?');
  });

  it('returns the non-interpolated key if not initialized with allowMissing and translation not found', () => {
    expect(polyglot.t('Welcome %{name}', {
      name: 'Robert'
    })).to.equal('Welcome %{name}');
  });

  it('returns an interpolated key if initialized with allowMissing and translation not found', () => {
    const instance = new Polyglot({ phrases, allowMissing: true });
    expect(instance.t('Welcome %{name}', {
      name: 'Robert'
    })).to.equal('Welcome Robert');
  });

  it('returns the translation even if it is an empty string', () => {
    expect(polyglot.t('empty_string')).to.equal('');
  });

  it('returns the default value even if it is an empty string', () => {
    expect(polyglot.t('bogus_key', { _: '' })).to.equal('');
  });

  it('handles dollar signs in the substitution value', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: '$abc $0',
      place: '$1 $&'
    })).to.equal('Hi, $abc $0, welcome to $1 $&!');
  });

  it('supports nested phrase objects', () => {
    const nestedPhrases = {
      nav: {
        presentations: 'Presentations',
        hi_user: 'Hi, %{user}.',
        cta: {
          join_now: 'Join now!'
        }
      },
      'header.sign_in': 'Sign In'
    };
    const instance = new Polyglot({ phrases: nestedPhrases });
    expect(instance.t('nav.presentations')).to.equal('Presentations');
    expect(instance.t('nav.hi_user', { user: 'Raph' })).to.equal('Hi, Raph.');
    expect(instance.t('nav.cta.join_now')).to.equal('Join now!');
    expect(instance.t('header.sign_in')).to.equal('Sign In');
  });

  describe('onMissingKey', () => {
    it('calls the function when a key is missing', () => {
      const expectedKey = 'some key';
      const expectedOptions = {};
      const expectedLocale = 'oz';
      const returnValue = {};
      const onMissingKey = (key, options, locale) => {
        expect(key).to.equal(expectedKey);
        expect(options).to.equal(expectedOptions);
        expect(locale).to.equal(expectedLocale);
        return returnValue;
      };
      const instance = new Polyglot({ onMissingKey, locale: expectedLocale });
      const result = instance.t(expectedKey, expectedOptions);
      expect(result).to.equal(returnValue);
    });

    it('overrides allowMissing', (done) => {
      const missingKey = 'missing key';
      const onMissingKey = (key) => {
        expect(key).to.equal(missingKey);
        done();
      };
      const instance = new Polyglot({ onMissingKey, allowMissing: true });
      instance.t(missingKey);
    });
  });

  describe('Turkish', () => {
    it('should return the first form for 1 for not noun', () =>
      expect(polyglot.t('two_forms', 1)).to.be.equal('1 form1'));
    it('should return the second form for 2 for not noun', () =>
      expect(polyglot.t('two_forms', 2)).to.be.equal('2 form2'));
    it('should return the first form for 1 for noun', () =>
      expect(polyglot.t('one_form', 1)).to.be.equal('1 form1'));
    it('should return the first form for 2 for noun', () =>
      expect(polyglot.t('one_form', 2)).to.be.equal('2 form1'));
  });
});

describe('pluralize', () => {
  const phrases = {
    count_name: '%{smart_count} Name |||| %{smart_count} Names'
  };

  let polyglot;
  beforeEach(() => {
    polyglot = new Polyglot({ phrases, locale: 'en' });
  });

  it('supports pluralization with an integer', () => {
    expect(polyglot.t('count_name', { smart_count: 0 })).to.equal('0 Names');
    expect(polyglot.t('count_name', { smart_count: 1 })).to.equal('1 Name');
    expect(polyglot.t('count_name', { smart_count: 2 })).to.equal('2 Names');
    expect(polyglot.t('count_name', { smart_count: 3 })).to.equal('3 Names');
  });

  it('accepts a number as a shortcut to pluralize a word', () => {
    expect(polyglot.t('count_name', 0)).to.equal('0 Names');
    expect(polyglot.t('count_name', 1)).to.equal('1 Name');
    expect(polyglot.t('count_name', 2)).to.equal('2 Names');
    expect(polyglot.t('count_name', 3)).to.equal('3 Names');
  });

  it('ignores a region subtag when choosing a pluralization rule', () => {
    const instance = new Polyglot({ phrases, locale: 'fr-FR' });
    // French rule: "0" is singular
    expect(instance.t('count_name', 0)).to.equal('0 Name');
  });
});

describe('locale-specific pluralization rules', () => {
  it('pluralizes in Arabic', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      'ولا صوت',
      'صوت واحد',
      'صوتان',
      '%{smart_count} أصوات',
      '%{smart_count} صوت',
      '%{smart_count} صوت'
    ];
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| ')
    };

    const polyglot = new Polyglot({ phrases, locale: 'ar' });

    expect(polyglot.t('n_votes', 0)).to.equal('ولا صوت');
    expect(polyglot.t('n_votes', 1)).to.equal('صوت واحد');
    expect(polyglot.t('n_votes', 2)).to.equal('صوتان');
    expect(polyglot.t('n_votes', 3)).to.equal('3 أصوات');
    expect(polyglot.t('n_votes', 11)).to.equal('11 صوت');
    expect(polyglot.t('n_votes', 102)).to.equal('102 صوت');
  });
});

describe('locale', () => {
  let polyglot;
  beforeEach(() => {
    polyglot = new Polyglot();
  });

  it('defaults to "en"', () => {
    expect(polyglot.locale()).to.equal('en');
  });

  it('gets and sets locale', () => {
    polyglot.locale('es');
    expect(polyglot.locale()).to.equal('es');

    polyglot.locale('fr');
    expect(polyglot.locale()).to.equal('fr');
  });
});

describe('extend', () => {
  let polyglot;
  beforeEach(() => {
    polyglot = new Polyglot();
  });

  it('supports multiple extends, overriding old keys', () => {
    polyglot.extend({ aKey: 'First time' });
    polyglot.extend({ aKey: 'Second time' });
    expect(polyglot.t('aKey')).to.equal('Second time');
  });

  it('does not forget old keys', () => {
    polyglot.extend({ firstKey: 'Numba one', secondKey: 'Numba two' });
    polyglot.extend({ secondKey: 'Numero dos' });
    expect(polyglot.t('firstKey')).to.equal('Numba one');
  });

  it('supports optional `prefix` argument', () => {
    polyglot.extend({ click: 'Click', hover: 'Hover' }, 'sidebar');
    expect(polyglot.phrases['sidebar.click']).to.equal('Click');
    expect(polyglot.phrases['sidebar.hover']).to.equal('Hover');
    expect(polyglot.phrases).not.to.have.property('click');
  });

  it('supports nested object', () => {
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
    });
    expect(polyglot.phrases['sidebar.click']).to.equal('Click');
    expect(polyglot.phrases['sidebar.hover']).to.equal('Hover');
    expect(polyglot.phrases['nav.header.log_in']).to.equal('Log In');
    expect(polyglot.phrases).not.to.have.property('click');
    expect(polyglot.phrases).not.to.have.property('header.log_in');
    expect(polyglot.phrases).not.to.have.property('log_in');
  });
});

describe('clear', () => {
  let polyglot;
  beforeEach(() => {
    polyglot = new Polyglot();
  });

  it('wipes out old phrases', () => {
    polyglot.extend({ hiFriend: 'Hi, Friend.' });
    polyglot.clear();
    expect(polyglot.t('hiFriend')).to.equal('hiFriend');
  });
});

describe('replace', () => {
  let polyglot;
  beforeEach(() => {
    polyglot = new Polyglot();
  });

  it('wipes out old phrases and replace with new phrases', () => {
    polyglot.extend({ hiFriend: 'Hi, Friend.', byeFriend: 'Bye, Friend.' });
    polyglot.replace({ hiFriend: 'Hi, Friend.' });
    expect(polyglot.t('hiFriend')).to.equal('Hi, Friend.');
    expect(polyglot.t('byeFriend')).to.equal('byeFriend');
  });
});

describe('unset', () => {
  let polyglot;
  beforeEach(() => {
    polyglot = new Polyglot();
  });

  it('unsets a key based on a string', () => {
    polyglot.extend({ test_key: 'test_value' });
    expect(polyglot.has('test_key')).to.equal(true);

    polyglot.unset('test_key');
    expect(polyglot.has('test_key')).to.equal(false);
  });

  it('unsets a key based on an object hash', () => {
    polyglot.extend({ test_key: 'test_value', foo: 'bar' });
    expect(polyglot.has('test_key')).to.equal(true);
    expect(polyglot.has('foo')).to.equal(true);

    polyglot.unset({ test_key: 'test_value', foo: 'bar' });
    expect(polyglot.has('test_key')).to.equal(false);
    expect(polyglot.has('foo')).to.equal(false);
  });

  it('unsets nested objects using recursive prefix call', () => {
    polyglot.extend({ foo: { bar: 'foobar' } });
    expect(polyglot.has('foo.bar')).to.equal(true);

    polyglot.unset({ foo: { bar: 'foobar' } });
    expect(polyglot.has('foo.bar')).to.equal(false);
  });
});

describe('transformPhrase', () => {
  const simple = '%{name} is %{attribute}';
  const english = '%{smart_count} Name |||| %{smart_count} Names';
  const arabic = [
    'ولا صوت',
    'صوت واحد',
    'صوتان',
    '%{smart_count} أصوات',
    '%{smart_count} صوت',
    '%{smart_count} صوت'
  ].join(' |||| ');

  it('does simple interpolation', () => {
    expect(Polyglot.transformPhrase(simple, { name: 'Polyglot', attribute: 'awesome' })).to.equal('Polyglot is awesome');
  });

  it('removes missing keys', () => {
    expect(Polyglot.transformPhrase(simple, { name: 'Polyglot' })).to.equal('Polyglot is %{attribute}');
  });

  it('selects the correct plural form based on smart_count', () => {
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'en')).to.equal('0 Names');
    expect(Polyglot.transformPhrase(english, { smart_count: 1 }, 'en')).to.equal('1 Name');
    expect(Polyglot.transformPhrase(english, { smart_count: 2 }, 'en')).to.equal('2 Names');
    expect(Polyglot.transformPhrase(english, { smart_count: 3 }, 'en')).to.equal('3 Names');
  });

  it('selects the correct locale', () => {
    // French rule: "0" is singular
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'fr')).to.equal('0 Name');
    expect(Polyglot.transformPhrase(english, { smart_count: 1 }, 'fr')).to.equal('1 Name');
    expect(Polyglot.transformPhrase(english, { smart_count: 2 }, 'fr')).to.equal('2 Names');
    expect(Polyglot.transformPhrase(english, { smart_count: 3 }, 'fr')).to.equal('3 Names');

    // Arabic has 6 rules
    expect(Polyglot.transformPhrase(arabic, 0, 'ar')).to.equal('ولا صوت');
    expect(Polyglot.transformPhrase(arabic, 1, 'ar')).to.equal('صوت واحد');
    expect(Polyglot.transformPhrase(arabic, 2, 'ar')).to.equal('صوتان');
    expect(Polyglot.transformPhrase(arabic, 3, 'ar')).to.equal('3 أصوات');
    expect(Polyglot.transformPhrase(arabic, 11, 'ar')).to.equal('11 صوت');
    expect(Polyglot.transformPhrase(arabic, 102, 'ar')).to.equal('102 صوت');
  });

  it('defaults to `en`', () => {
    // French rule: "0" is singular
    expect(Polyglot.transformPhrase(english, { smart_count: 0 })).to.equal('0 Names');
  });

  it('ignores a region subtag when choosing a pluralization rule', () => {
    // French rule: "0" is singular
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'fr-FR')).to.equal('0 Name');
  });

  it('works without arguments', () => {
    expect(Polyglot.transformPhrase(english)).to.equal(english);
  });

  it('respects a number as shortcut for smart_count', () => {
    expect(Polyglot.transformPhrase(english, 0, 'en')).to.equal('0 Names');
    expect(Polyglot.transformPhrase(english, 1, 'en')).to.equal('1 Name');
    expect(Polyglot.transformPhrase(english, 5, 'en')).to.equal('5 Names');
  });

  it('throws without sane phrase string', () => {
    expect(() => { Polyglot.transformPhrase(); }).to.throw(TypeError);
    expect(() => { Polyglot.transformPhrase(null); }).to.throw(TypeError);
    expect(() => { Polyglot.transformPhrase(32); }).to.throw(TypeError);
    expect(() => { Polyglot.transformPhrase({}); }).to.throw(TypeError);
  });
});
