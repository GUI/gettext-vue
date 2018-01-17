import Parser from '..';
import fs from 'fs';
import test from 'ava';

test('default', t => {
    t.deepEqual((new Parser()).keywordSpec.$t, { msgid : 0 },
        'should have default keyword spec when none is passed');
});

test.cb('singular', t => {
    fs.readFile(__dirname + '/fixtures/singular.vue', {encoding: 'utf8'}, (err, data) => {
        if (err) throw err;

        const result = (new Parser()).parse(data);
        t.is(typeof result, 'object');
        t.true('This is a title' in result);
        t.true('This is wrapped in single quotes' in result);
        t.true('\'single escape\'' in result);
        t.true('"double escape"' in result);
        t.true('word "escaped, word", with comma' in result);
        t.true('ending with an escaped quote"' in result);
        t.true('data \'single escape\'' in result);
        t.true('data "double escape"' in result);
        t.true('Description' in result);
        t.is(result['Description'].line.length, 3);
        t.end();
    });
});