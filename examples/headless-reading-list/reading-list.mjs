// Shared by the real Astro route and its offline checks. No Wix import here:
// the route passes the real @wix/data `items` namespace to loadReadingList().
export const COLLECTION_ID = 'ReadingList';
export const MAX_ITEMS = 50;

export function toReadingLinks(records) {
  if (!Array.isArray(records) || records.length > MAX_ITEMS) {
    throw new TypeError('Expected at most 50 reading-list records');
  }

  return records.map((record, index) => {
    if (!record || typeof record._id !== 'string' || !record._id.trim()
      || typeof record.title !== 'string' || !record.title.trim()
      || record.title.trim().length > 100
      || !Number.isInteger(record.position) || record.position < 0
      || typeof record.url !== 'string'
      || (record.summary !== undefined && record.summary !== null && typeof record.summary !== 'string')) {
      throw new TypeError(`Invalid reading-list record at index ${index}`);
    }
    const summary = (record.summary ?? '').trim();
    if (summary.length > 240) {
      throw new TypeError(`Summary too long at index ${index}`);
    }
    const url = new URL(record.url);
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new TypeError(`Expected an HTTPS URL without credentials at index ${index}`);
    }
    return {
      id: record._id,
      title: record.title.trim(),
      href: url.href,
      summary,
    };
  });
}

export async function loadReadingList(dataItems) {
  const result = await dataItems
    .query(COLLECTION_ID)
    .ascending('position')
    .limit(MAX_ITEMS)
    .find();
  return toReadingLinks(result.items);
}
