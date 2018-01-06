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

/**
 * Constructor
 * @param Object keywordSpec An object with keywords as keys and parameter indexes as values
 */
function Parser(customKeywordSpec) {
  const keywordSpec = customKeywordSpec || {
    $t: [0],
    $gettext: [0],
    $ngettext: [0, 1],
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
    const params = match[2].match(this.stringPattern).map(trim).map(trimQuotes);
    const msgid = params[this.keywordSpec[keyword][0]];

    result[msgid] = result[msgid] || { line: [] };
    result[msgid].line.push(template.substr(0, match.index).split(newline).length);

    if (this.keywordSpec[keyword].length > 1) {
      result[msgid].plural = result[msgid].plural || params[this.keywordSpec[keyword][1]];
    }
  }

  return result;
};

module.exports = Parser;
