/**
 * Tests for what the editor shows, by ticket source and mode, and for the
 * draft-text helpers. Run with `pnpm test`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { composerLayout, isChat, isEmailLike } from './composerLayout.ts';
import { emailFor, htmlToText, isBlank, textToHtml } from './composerText.ts';

test('a Slack reply is short: no mail rows, no signature, the basic toolbar', () => {
  const layout = composerLayout('slack', 'reply');
  assert.equal(layout.fromRow, false);
  assert.equal(layout.replyToRow, false);
  assert.equal(layout.signature, false);
  assert.equal(layout.sendMenu, true);
  assert.equal(layout.toolbar, 'basic');
  assert.equal(layout.canned, true);
});

test('Teams is treated like Slack', () => {
  assert.deepEqual(composerLayout('teams', 'reply'), composerLayout('slack', 'reply'));
});

test('an email or portal reply has the mail rows, the full toolbar and a Send menu', () => {
  for (const source of ['email', 'portal'] as const) {
    const layout = composerLayout(source, 'reply');
    assert.equal(layout.fromRow, true);
    assert.equal(layout.replyToRow, true);
    assert.equal(layout.signature, true);
    assert.equal(layout.quoted, true);
    assert.equal(layout.sendMenu, true);
    assert.equal(layout.toolbar, 'full');
  }
});

test('a private note never gets mail rows, a signature or canned responses', () => {
  for (const source of ['slack', 'email', 'portal'] as const) {
    const layout = composerLayout(source, 'note');
    assert.equal(layout.fromRow, false);
    assert.equal(layout.replyToRow, false);
    assert.equal(layout.signature, false);
    assert.equal(layout.canned, false);
    assert.equal(layout.sendMenu, false);
    assert.ok(layout.toolbar);
  }
});

test('Ask AI is a plain question: no toolbar, articles or canned responses, but starting prompts', () => {
  for (const source of ['slack', 'email'] as const) {
    const layout = composerLayout(source, 'ask');
    assert.equal(layout.toolbar, null);
    assert.equal(layout.solutions, false);
    assert.equal(layout.canned, false);
    assert.equal(layout.attach, true);
    assert.equal(layout.promptChips, true);
  }
});

test('email and portal are email-like; Slack and Teams are chat; phone is neither', () => {
  assert.equal(isEmailLike('email'), true);
  assert.equal(isEmailLike('portal'), true);
  assert.equal(isChat('slack'), true);
  assert.equal(isChat('teams'), true);
  assert.equal(isEmailLike('phone') || isChat('phone'), false);
});

test('a draft keeps its words, line breaks and bullets', () => {
  assert.equal(htmlToText('Hi <b>Megan</b>,<br><br>Please restart.'), 'Hi Megan,\n\nPlease restart.');
  assert.equal(htmlToText('<ul><li>One</li><li>Two</li></ul>'), '• One\n• Two');
  assert.equal(htmlToText('a&nbsp;&amp;&nbsp;b'), 'a & b');
});

test('text round-trips through the editor as escaped HTML', () => {
  assert.equal(textToHtml('a < b\nnext'), 'a &lt; b<br>next');
  assert.equal(htmlToText(textToHtml('a < b\nnext')), 'a < b\nnext');
});

test('a draft with only markup in it is blank', () => {
  assert.equal(isBlank(''), true);
  assert.equal(isBlank('<br>'), true);
  assert.equal(isBlank('<div><br></div>'), true);
  assert.equal(isBlank('<b>hi</b>'), false);
});

test('an address is derived from a name', () => {
  assert.equal(emailFor('Megan Brooks'), 'megan.brooks@acme.com');
  assert.equal(emailFor('Daniel Ortiz'), 'daniel.ortiz@acme.com');
});

test('a forward has the mail rows but no canned responses or Send menu', () => {
  const layout = composerLayout('email', 'forward');
  assert.equal(layout.replyToRow, true);
  assert.equal(layout.fromRow, true);
  assert.equal(layout.quoted, true);
  assert.equal(layout.canned, false);
  assert.equal(layout.sendMenu, false);
  assert.equal(layout.solutions, false);
});
