import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadReadingList, toReadingLinks } from './reading-list.mjs';

const fixture = JSON.parse(await readFile(new URL('./reading-list.fixture.json', import.meta.url), 'utf8'));

function sdkFixture(records) {
  const calls = [];
  const dataItems = {
    query(collection) {
      calls.push(['query', collection]);
      return {
        ascending(field) { calls.push(['ascending', field]); return this; },
        limit(size) { calls.push(['limit', size]); return this; },
        async find() { calls.push(['find']); return { items: records }; },
      };
    },
  };
  return { calls, dataItems };
}

test('the route loader queries the real collection contract and projects links', async () => {
  const fake = sdkFixture(fixture.map(record => ({ ...record, extraField: 'not displayed' })));
  const links = await loadReadingList(fake.dataItems);
  assert.deepEqual(fake.calls, [
    ['query', 'ReadingList'], ['ascending', 'position'], ['limit', 50], ['find'],
  ]);
  assert.equal(links.length, 2);
  assert.equal(links[0].title, 'Wix Astro integration');
  assert.equal(links[1].href, 'https://docs.astro.build/en/guides/on-demand-rendering/');
  assert.deepEqual(Object.keys(links[0]).sort(), ['href', 'id', 'summary', 'title']);
});

test('an empty collection is a successful empty result', async () => {
  assert.deepEqual(await loadReadingList(sdkFixture([]).dataItems), []);
});

test('an unset optional summary becomes empty display text', () => {
  assert.equal(toReadingLinks([{ ...fixture[0], summary: null }])[0].summary, '');
});

test('query rejection remains a failure instead of becoming an empty list', async () => {
  const failure = new Error('Synthetic SDK rejection');
  const fake = sdkFixture([]);
  const originalQuery = fake.dataItems.query;
  fake.dataItems.query = collection => ({
    ...originalQuery(collection),
    async find() { throw failure; },
  });
  await assert.rejects(() => loadReadingList(fake.dataItems), error => error === failure);
});

test('unsafe URLs and malformed content fail before becoming page links', () => {
  for (const url of ['javascript:alert(1)', 'http://example.invalid/', 'https://user:password@example.invalid/']) {
    assert.throws(() => toReadingLinks([{ ...fixture[0], url }]));
  }
  for (const record of [null, {}, { ...fixture[0], title: ' ' }, { ...fixture[0], position: '10' }]) {
    assert.throws(() => toReadingLinks([record]));
  }
});

test('missing results and oversized responses do not disguise contract failures', () => {
  assert.throws(() => toReadingLinks(undefined));
  assert.throws(() => toReadingLinks(Array(51).fill(fixture[0])));
});

test('formatting preserves supplied order and leaves source records unchanged', () => {
  const records = Object.freeze(fixture.map(record => Object.freeze({ ...record })));
  const links = toReadingLinks(records);
  assert.deepEqual(links.map(link => link.id), records.map(record => record._id));
  assert.equal(records[0].url, fixture[0].url);
});
