import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc } from '../js/util.js';

test('esc escapes ampersand, angle brackets, and quotes', () => {
  assert.equal(esc('<a>&"b"'), '&lt;a&gt;&amp;&quot;b&quot;');
});

test('esc treats null and undefined as empty string', () => {
  assert.equal(esc(null), '');
  assert.equal(esc(undefined), '');
});

test('esc passes through plain text unchanged', () => {
  assert.equal(esc('Albus Dumbledore'), 'Albus Dumbledore');
});
