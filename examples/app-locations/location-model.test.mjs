import assert from 'node:assert/strict';
import test from 'node:test';
import { loadLocationsPage, toLocationPage } from './location-model.mjs';

test('the shared loader requests one bounded non-archived page and uses SDK _id fields', async () => {
  let calls = 0;
  const page = await loadLocationsPage(async options => {
    calls++;
    assert.deepEqual(options, { paging: { limit: 50, offset: 0 }, includeArchived: false });
    return {
      locations: [{
        _id: 'location-a', name: 'North studio', default: true,
        address: { formatted: 'Synthetic address' }, timeZone: 'America/Chicago',
        phone: 'unused synthetic field',
      }],
      pagingMetadata: { hasNext: false },
    };
  });
  assert.equal(calls, 1);
  assert.deepEqual(page, {
    rows: [{ id: 'location-a', name: 'North studio', address: 'Synthetic address', timeZone: 'America/Chicago', isDefault: true }],
    hasMore: false,
  });
});

test('empty and omitted repeated fields both become a finished empty result', () => {
  assert.deepEqual(toLocationPage({ locations: [], pagingMetadata: { hasNext: false } }), { rows: [], hasMore: false });
  assert.deepEqual(toLocationPage({}), { rows: [], hasMore: null });
});

test('missing optional values have explicit labels and the source is unchanged', () => {
  const response = Object.freeze({ locations: Object.freeze([Object.freeze({ _id: 'location-a', name: '   ' })]) });
  assert.deepEqual(toLocationPage(response), {
    rows: [{ id: 'location-a', name: 'Unnamed location', address: 'Address not set', timeZone: 'Time zone not set', isDefault: false }],
    hasMore: null,
  });
  assert.equal(response.locations[0].name, '   ');
});

test('an upstream failure remains a failure and does not become an empty success', async () => {
  const failure = new Error('Synthetic SDK denial');
  await assert.rejects(() => loadLocationsPage(async () => { throw failure; }), error => error === failure);
});

test('hasMore distinguishes a partial page from an unknown or complete page', () => {
  assert.equal(toLocationPage({ locations: [], pagingMetadata: { hasNext: true } }).hasMore, true);
  assert.equal(toLocationPage({ locations: [], pagingMetadata: {} }).hasMore, null);
});

test('malformed responses and ambiguous record IDs fail visibly', () => {
  for (const response of [null, [], 'locations', { locations: {} }, { locations: [{ id: 'rest-id-only' }] },
    { locations: [{ _id: 'a' }, { _id: 'a' }] }]) {
    assert.throws(() => toLocationPage(response), TypeError);
  }
});

test('50 results fit; an oversized response violates the requested page contract', () => {
  const records = Array.from({ length: 50 }, (_, index) => ({ _id: `location-${index}` }));
  assert.equal(toLocationPage({ locations: records }).rows.length, 50);
  assert.throws(() => toLocationPage({ locations: [...records, { _id: 'extra' }] }), /Expected at most 50 locations/);
});
