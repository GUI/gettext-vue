const newline = /\r?\n|\r/g;
function escapeRegExp(str) {
  // source: https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
  return str.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
}
function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}
function trimQuotes(str) {
  return str.replace(/^['"`]|['"`]$/g, '');
}
function unescapeQuotes(str) {
  return str.replace(/\\(['"])/g, '$1');
}

/**
 * Constructor
 * @param Object keywordSpec An object with keywords as keys and parameter indexes as values
 */
function Parser(customKeywordSpec) {
  const keywordSpec = customKeywordSpec || {
    $t: {
      msgid: 0,
    },
    $gettext: {
      msgid: 0,
    },
    $dgettext: {
      msgid: 1,
    },
    $dcgettext: {
      msgid: 1,
    },
    $ngettext: {
      msgid: 0,
      msgid_plural: 1,
    },
    $dngettext: {
      msgid: 1,
      msgid_plural: 2,
    },
    $pgettext: {
      msgctxt: 0,
      msgid: 1,
    },
    $dpgettext: {
      msgctxt: 1,
      msgid: 2,
    },
  };

  if (typeof keywordSpec !== 'object') {
    throw new Error('Invalid keyword spec');
  }

  this.keywordSpec = keywordSpec;

  // String parameter in different quotes (single, double, and template
  // literals). Taking into account backslash escapes in the quotes.
  const stringPatternGroup = [
    '"((?:\\\\.|[^"\\\\])*)"',
    '|',
    '\'((?:\\\\.|[^\'\\\\])*)\'',
    '|',
    '`((?:\\\\.|[^`\\\\])*)`',
  ].join('');

  this.stringPattern = new RegExp(`(${stringPatternGroup})`, 'g');

  /* eslint-disable indent */
  this.expressionPattern = new RegExp([
    // Function name
    `(${Object.keys(keywordSpec).map(escapeRegExp).join('|')})`,
    // Opening parentheses.
    '\\s*\\(\\s*',
    '(',
      // String parameter, followed by an optional comma.
      '(?:',
        // String parameter in different quotes (single, double, and template
        // literals).
        `(?:${stringPatternGroup})`,
        // Optional comma for multiple parameters.
        '(?:\\s*,\\s*)?',
      ')+',
    ')',
  ].join(''), 'g');
  /* eslint-enable indent */
}

/**
 * Given a Vue file string returns the list of i18n strings.
 *
 * @param String template The content of a Vue file.
 * @return Object The list of translatable strings, the line(s) on which each
 * appears and an optional plural form.
 */
Parser.prototype.parse = function parse(template) {
  const result = {};
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = this.expressionPattern.exec(template)) !== null) {
    const keyword = match[1];
    const params = match[2].match(this.stringPattern).map(trim).map(trimQuotes).map(unescapeQuotes);

    const spec = this.keywordSpec[keyword];
    const msgidIndex = spec.msgid;
    const msgid = params[msgidIndex];
    if (msgid) {
      let key = msgid;

      const contextIndex = spec.msgctxt;
      let context;
      if (contextIndex !== undefined) {
        context = params[contextIndex];
        key = context + String.fromCharCode(4) + key;
      }

      if (result[key] === undefined) {
        result[key] = { line: [] };
      }

      result[key].msgctxt = context;
      result[key].msgid = msgid;
      result[key].line.push(template.substr(0, match.index).split(newline).length);
      result[key].line.sort();

      const pluralIndex = spec.msgid_plural;
      if (pluralIndex !== undefined) {
        const plural = params[pluralIndex];
        const existingPlural = result[key].plural;
        if (plural && existingPlural && existingPlural !== plural) {
          throw new Error(`Incompatible plural definitions for msgid "${msgid}" ("${existingPlural}" and "${plural}")`);
        }

        result[key].plural = plural;
      }
    }
  }

  return result;
};

module.exports = Parser;
