'use strict';

// Based on https://github.com/gmarty/xgettext

const async = require('async');
const fs = require('fs');
const gt = require('gettext-parser');
const objectAssign = require('object-assign');
const VueParser = new require('./parser');
const path = require('path');

const parser = new VueParser();

/**
 * Simple is object check.
 *
 * @param item
 * @returns {boolean}
 */
function isObject (item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 *
 * @param target
 * @param source
 */
function mergeDeep (target, source) {
  let dummy;

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          dummy = {};
          dummy[key] = {};
          objectAssign(target, dummy);
        }
        mergeDeep(target[key], source[key]);
      } else {
        dummy = {};
        dummy[key] = source[key];
        objectAssign(target, dummy);
      }
    }
  }
  return target;
}

/**
 * Parse input and save the i18n strings to a PO file.
 *
 * @param Array|String input Array of files to parse or input string
 * @param Object options Options
 * @param Function cb Callback
 */
function xgettext (input, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  options = options || {};

  if (!input) {
    throw new Error('No input specified');
  }

  options.output = options.output || 'messages.po';
  options.directory = options.directory || ['.'];
  options['from-code'] = options['from-code'] || 'utf8';
  options['force-po'] = options['force-po'] || false;
  options['join-existing'] = options['join-existing'] || false;

  if (typeof options.directory === 'string') {
    options.directory = [options.directory];
  }

  const translations = Object.create(null);

  const parseTemplate = function (template, linePrefixer) {
    const strings = parser.parse(template);

    for (const key in strings) {
      if (Object.prototype.hasOwnProperty.call(strings, key)) {
        const msgctxt = strings[key].msgctxt || '';
        const context = translations[msgctxt] || (translations[msgctxt] = {});
        const msgid = strings[key].msgid || key;
        context[msgid] = context[msgid] || { msgid: msgid, comments: {} };

        if (msgctxt) {
          context[msgid].msgctxt = strings[key].msgctxt;
        }

        if (strings[key].plural) {
          context[msgid].msgid_plural = context[msgid].msgid_plural || strings[key].plural;
          context[msgid].msgstr = ['', ''];
        }

        if (!options['no-location']) {
          context[msgid].comments.reference = (context[msgid].comments.reference || '')
            .split('\n')
            .concat(strings[key].line.map(linePrefixer))
            .sort()
            .join('\n')
            .trim('\n');
        }
      }
    }
  };

  const output = function () {
    if (cb) {
      if (Object.keys(translations).length > 0 || options['force-po']) {
        let existing = {};
        const writeToStdout = options.output === '-' || options.output === '/dev/stdout';

        if (!writeToStdout && options['join-existing']) {
          try {
            fs.accessSync(options.output, fs.F_OK);
            existing = gt.po.parse(fs.readFileSync(options.output, {
              encoding: options['from-code']
            }));
          } catch (e) {
            // ignore non-existing file
          }

          mergeDeep(translations, existing.translations);
        }

        const po = gt.po.compile({
          charset: options['from-code'],
          headers: {
            'content-type': `text/plain; charset=${options['from-code']}`
          },
          translations: translations
        });

        if (writeToStdout) {
          cb(po);
        } else {
          fs.writeFile(options.output, po, err => {
            if (err) {
              throw err;
            }

            cb(po);
          });
        }
      } else {
        cb();
      }
    }
  };

  if (typeof input === 'string') {
    parseTemplate(
      input,
      line => `standard input:${line}`
    );

    output();
  } else {
    const addPath = path => line => `${path}:${line}`;

    if (options['files-from']) {
      input = fs.readFileSync(options['files-from'], options['from-code'])
        .split('\n')
        .filter(line => line.trim().length > 0);
    }

    const files = options.directory.reduce(
      (result, directory) => result.concat(input.map(
        file => path.join(directory, file.replace(/\\/g, path.sep))
      )),
      []
    );

    async.parallel(files.map(function (file) {
      return function (cb) {
        fs.readFile(path.resolve(file), options['from-code'], (err, res) => {
          if (err) {
            throw err;
          }

          parseTemplate(res, addPath(file.replace(/\\/g, '/')));

          cb();
        });
      };
    }), output);
  }
}

module.exports = xgettext;
