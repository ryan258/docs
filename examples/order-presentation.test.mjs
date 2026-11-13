import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { toOrderRows } from './order-presentation.mjs';

test('fixture produces readable amounts and labels in the supplied order', async () => {
  const orders = JSON.parse(await readFile(new URL('./orders.fixture.json', import.meta.url), 'utf8'));
  assert.deepEqual(toOrderRows(orders), [
    { _id: 'order-1', orderText: 'Order order-new', totalText: '$24.50 USD', statusText: 'Paid' },
    { _id: 'order-2', orderText: 'Order order-old', totalText: '$0.00 USD', statusText: 'Pending' },
  ]);
});

test('empty input produces an empty list', () => {
  assert.deepEqual(toOrderRows([]), []);
});

test('extra fields stay out of the view model and the source is unchanged', () => {
  const orders = Object.freeze([
    Object.freeze({ id: 'record:with/odd-id', total: 12, status: 'paid', privateNote: 'synthetic-only' }),
  ]);
  const rows = toOrderRows(orders);
  assert.deepEqual(Object.keys(rows[0]).sort(), ['_id', 'orderText', 'statusText', 'totalText']);
  assert.equal(rows[0].orderText, 'Order record:with/odd-id');
  assert.match(rows[0]._id, /^[A-Za-z0-9-]+$/);
  assert.equal(orders[0].privateNote, 'synthetic-only');
});

test('unknown status is visible as unavailable rather than a fabricated paid state', () => {
  assert.equal(toOrderRows([{ id: 'one', total: 1, status: 'future-status' }])[0].statusText, 'Status unavailable');
});

test('the complete 50-row response has unique repeater IDs', () => {
  const orders = Array.from({ length: 50 }, (_, index) => ({ id: `id-${index}`, total: index, status: 'pending' }));
  const rows = toOrderRows(orders);
  assert.equal(rows.length, 50);
  assert.equal(new Set(rows.map(row => row._id)).size, 50);
});

test('wrong response type and oversized results fail instead of becoming empty success', () => {
  for (const value of [undefined, null, {}, 'orders', Array(51).fill({ id: 'one', total: 1 })]) {
    assert.throws(() => toOrderRows(value), /Expected an array of at most 50 orders/);
  }
});

test('malformed identifiers and amounts fail before a misleading row is shown', () => {
  const invalid = [
    null, {}, { id: '', total: 1 }, { id: '   ', total: 1 },
    { id: 'x'.repeat(129), total: 1 }, { id: 'one', total: '12.00' },
    { id: 'one', total: -1 }, { id: 'one', total: NaN }, { id: 'one', total: Infinity },
  ];
  for (const order of invalid) assert.throws(() => toOrderRows([order]), /Invalid order at index 0/);
});
