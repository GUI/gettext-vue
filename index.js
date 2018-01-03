const newline = /\r?\n|\r/g;
function escapeRegExp(str) {
  // source: https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
  return str.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
}
function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}
function trimQuotes(str) {
  return str.replace(/^['"]|['"]$/g, '');
}
function isQuote(chr) {
  return /['"]/.test(chr);
}
function groupParams(result, part) {
  if (result.length > 0) {
    const last = result[result.length - 1];
    const firstChar = last[0];
    const lastChar = last[last.length - 1];

    if (isQuote(firstChar) && (!isQuote(lastChar) || last[last.length - 2] === '\\')) {
      // merge with previous
      // eslint-disable-next-line no-param-reassign
      result[result.length - 1] += `,${part}`;
    } else {
      result.push(part);
    }
  } else {
    result.push(part);
  }

  return result;
}

/**
 * Constructor
 * @param Object keywordSpec An object with keywords as keys and parameter indexes as values
 */
function Parser(customKeywordSpec) {
  const keywordSpec = customKeywordSpec || {
    '$t': [0],
    '$gettext': [0],
    '$ngettext': [0, 1],
  };

  if (typeof keywordSpec !== 'object') {
    throw new Error('Invalid keyword spec');
  }

  this.keywordSpec = keywordSpec;
  this.expressionPattern = new RegExp([
    `(${Object.keys(keywordSpec).map(escapeRegExp).join('|')})`,
    '\\(',
    '([\\s\\S]*?)',
    '\\)',
  ].join(''), 'g');
}

/**
 * Given a EJS template string returns the list of i18n strings.
 *
 * @param String template The content of a EJS template.
 * @return Object The list of translatable strings, the line(s) on which each
 * appears and an optional plural form.
 */
Parser.prototype.parse = function parse(template) {
  const result = {};
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = this.expressionPattern.exec(template)) !== null) {
    const keyword = match[1];
    const params = match[2].split(',').reduce(groupParams, []).map(trim).map(trimQuotes);
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
