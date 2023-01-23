### v2.5.0: January 23, 2023
 * [New] Add `replace` option for custom replace implementation (#171)
 * [New] Add Romanian and Macedonian (#176)
 * [Deps] update array.prototype.foreach, object.entries, `string.prototype.trim` (#172)
 * [Tests] Migrate tests to GitHub Actions (#169)
 * [Tests] Add passing tests (#168)

### v2.4.2: August 16, 2021
 * [Fix] Handle null and undefined gracefully in extend and unset (#161)

### v2.4.1: August 16, 2021
 * [Fix] French starts plural at 2 (#154)
 * [Refactor] Replace `for-each` with `object.entries` and `array.prototype.foreach` (#127)
 * [Performance] Add plural type name memoization (#158)
 * [Deps] Update `string.prototype.trim` (#127)
 * [Dev Deps] update `chai`, `safe-publish-latest`, `eslint`, `eslint-plugin-import` (#127)

### v2.4.0: September 10, 2019
 * [New] add ability to configure pluralization rules (#138)

### v2.3.1: June 20, 2019
 * [Fix] fix plurals for Russian with n > 100 (#119)
 * [Performance] Remove unnecessary dollar signs replacement (#132)
 * [Docs] fix typo in the Czech example (#123)
 * [Deps] update `warning`
 * [Dev Deps] update `chai`, `eslint`, `eslint-config-airbnb-base`, `eslint-plugin-import`, `safe-publish-latest`, `uglify-js`
 * [Tests] on `node` `v12`, `v11`, `v10`

### v2.3.0: July 2, 2018
 * [New] add ability to change interpolation regex by specifying prefix and suffix (#106, #64)
 * [New] support for Serbian (Latin & Cyrillic), Bosnian (Latin & Cyrillic), Czech (#113)
 * [Fix] Moved lt to it's own group (#101)
 * [Fix] Moved tr from chinese to german group (#100)
 * [Fix] Move persian(fa) language to german group of pluralization (#86)
 * [Fix] Remove long-since-updated build files
 * [Fix] fix russian pluralization; add tests (#115)
 * [Fix] croatian is not russian (#114)
 * [Clarity] add more specific locales, even though language codes will match them (#115)
 * [Docs] document constructor options (#84)
 * [Docs] document all instance and static methods (#83)
 * [Docs] fix spelling of "delimiter" (#91)
 * [Docs] `onMissingKey` can (rather, should) return a value (#95)
 * [Docs] fix instructions to only recommend use with npm (#96)
 * [Docs] Added documentation for method has (#104)
 * [Docs] add example for languages with multiple plurals (#108)
 * [Docs] remove outdated sentence (#112, #110)
 * [Deps] update `for-each`, `has`, `warning`
 * [Dev Deps] update `chai`, `eslint`, `eslint-config-airbnb-base`, `eslint-plugin-import`, `mocha`; remove `should`
 * [Tests] up to `node` `v10`; use `nvm install-latest-npm` to ensure new npm doesn’t break old node; improve matrix

### v2.2.2: January 5, 2017
 * [Fix] revert unintentional breaking change of missing substitutions being untouched
 * [Dev Deps] update `eslint`, `eslint-config-airbnb-base`, `mocha`, `should`; add `safe-publish-latest`

### v2.2.1: November 18, 2016
 * [Fix] restore behavior of explicit null/undefined not touching the substitution

### v2.2.0: November 14, 2016
 * [New] add `onMissingKey` constructor option - this can call `.transformPhrase`, or return `false`, or `undefined`, or throw - whatever you like (#34, #77)
 * [Dev Deps] update `eslint`

### v2.1.3: January 5, 2017
 * [Fix] revert unintentional breaking change of missing substitutions being untouched

### v2.1.2: November 18, 2016
 * [Fix] restore behavior of explicit null/undefined not touching the substitution

### v2.1.1: November 13, 2016
 * [Fix] ensure that missing or null substitutions don’t crash (#79)

### v2.1.0: November 11, 2016
 * [New] Merge choosePluralForm & interpolate into one exported function: `transformPhrase` (#75)
 * [New] Allow locales to have regions (#70)
 * [New] Support Arabic pluralization (#71)
 * [New] Added Lithuanian locale to russian group of pluralization (#68)
 * [Deps] update `object.assign`, `warning`
 * [Dev Deps] pin `uglify-js` because it does not follow semver
 * [Dev Deps] update `eslint-config-airbnb-base`, `eslint`, `eslint-plugin-import`, `mocha`, `should`, `uglify-js`
 * [Performance] instead of creating a new regex for each token, use the function form of `replace` (#19)
 * [Refactor] use `warning` package for warnings
 * [Robustness] Use `has` package to properly check “has own property”
 * [Robustness] use `string.prototype.trim` rather than a homegrown trim polyfill
 * [Tests] only test on latest `node` `v7`, `v6`, `v5`, `v4`, and `iojs`; improve test matrix
 * [Tests] add linting

### v2.0.0: April 6, 2016
 * [Breaking] Remove non-node support + use object.assign/for-each.
 * [New] Add Slovak language to the Czech pluralization group
 * [Fix] fix`warn` messages in `node`, where `this` is not the global object
 * [Tests] up to `node` `v5.10`, `v4.4`
 * [Tests] decaffeinate tests

### v1.0.0: November 29, 2015
 * [Tests] up to `node` `v5.1`
 * [Tests] fix npm upgrades on older nodes
 * [Dev Deps] update `uglify-js`, `docco`, `should`, `mocha`, and fix test pollution

### v0.4.5: November 29, 2015
 * [Fix] Ensure that dollar signs are properly escaped in substitutions (#43)
 * [Docs] use SPDX-compliant license string (#44)

### v0.4.4: October 26, 2015
 * [New] Add `unset` method (#43)
 * [Tests] test on travis-ci

### v0.4.3: June 26, 2015
 * Add `.has(key)` method (thanks @scarfacedeb).
 * Add UMD wrapper for AMD support (thanks @TomOne).

### v0.4.2: March 13, 2015
 * Allow blank translations.

### v0.4.1: July 14, 2014
 * Added support for `warn` option for custom error handler (thanks @terinjokes).
 * Added some more plural forms (thanks @jgill333).

### v0.4.0: May 22, 2014
 * Added support for nested phrase objects to `extend()` and in the `phrases` option in the constructor.

### v0.3.0: August 6, 2013
 * _Breaking change_: Removed `pluralize()` method; instead, just use the `t()` method, passing in a `smart_count` option.
 * _Breaking change_: Removed the ability to use `Array`, `Backbone.Collection`, etc. instances for the `smart_count` option; instead, must pass a `Number`.
 * Allow passing `Number` as second argument to `t()`, which gets converted to the options object `{smart_count: <my number>}`.

### v0.2.1: May 2, 2013
 * Added `allowMissing` option to let the phrase key be the default translation (thanks @ziad-saab).

### v0.2.0: Dec 20, 2012
 * _Breaking change_: Moved from Singleton pattern to class-based. Now you create an instance of the `Polyglot` class rather than using class methods directly on it. The reason is to allow maintaining multiple sets of phrases, which is something we ran into at Airbnb with a highly-concurrent Express app.
 * _Breaking change_: Removed the built-in Handlebars helpers, because Handlebars is a singleton, and it's messy to create a single helper function that can be bound to different Polyglot instances.  Instead, it's super easy to create your own, based on your requirements.
