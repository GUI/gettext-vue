# gettext-vue

Extract translatable strings from [Vue](https://vuejs.org) files. By default, looks for the keywords `$t`, `$gettext`, and `$ngettext`.

It can be used stand-alone or through [xgettext-template](https://github.com/gmarty/xgettext).

## Installation

To install and use with [xgettext-template](https://github.com/gmarty/xgettext):

```sh
npm install -g xgettext-template gettext-vue
```

## Usage

```sh
xgettext-template -L Vue [INPUTFILE]...
```

See [xgettext-template's usage](https://github.com/gmarty/xgettext#usage) for more details.

## API

### new Parser(keywordspec)

Creates a new parser.

The `keywordspec` parameter is optional, with the default being:

```javascript
{
  '$t': [0],
  '$gettext': [0],
  '$ngettext': [0, 1]
}
```

Each keyword (key) requires array of argument number(s) (value). When multiple argument numbers are specified, expressions using this keyword are treaded as single-plural.

### .parse(template)

Parses the `template` string for Swig expressions using the keywordspec.

It returns an object with this structure:

```javascript
{
  msgid1: {
    line: [1, 3]
  },
  msgid2: {
    line: [2],
    plural: 'msgid_plural'
  }
}
```

## Credits

Largely based on [gettext-ejs](https://github.com/pekala/gettext-ejs).
