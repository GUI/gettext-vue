# gettext-vue

Extract translatable strings from [Vue](https://vuejs.org) files. By default, looks for the keywords `$t`, `$gettext`, and `$ngettext`.

## Installation

```sh
npm install -g gettext-vue
```

## Usage

```sh
xgettext-vue [OPTION] [INPUTFILE]...
```

#### Options

```
Input file location:
  -f, --files-from  get list of input files from FILE
  -D, --directory   add DIRECTORY to list for input files search[default: ["."]]

Output file location:
  -o, --output  write output to specified file          [default: "messages.po"]

Input file interpretation:
  --from-code  encoding of input files                        [default: "ascii"]

Operation mode:
  -j, --join-existing  join messages with existing file         [default: false]

Output details:
  --force-po     write PO file even if empty                    [default: false]
  --no-location  do not write '#: filename:line' lines          [default: false]

Informative output:
  -h, --help     display this help and exit                            [boolean]
  -V, --version  output version information and exit                   [boolean]
```

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

Largely based on [gettext-ejs](https://github.com/pekala/gettext-ejs) and [xgettext-template](https://github.com/gmarty/xgettext)
