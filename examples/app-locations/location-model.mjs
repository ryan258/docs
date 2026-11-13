// Shared by the installed dashboard page and its offline tests.
// The caller injects the real Wix SDK method or a controlled local stand-in.
export const PAGE_SIZE = 50;

function displayText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function toLocationPage(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw new TypeError('Invalid Locations response');
  }
  // Some serialized empty responses omit repeated fields entirely.
  const records = response.locations ?? [];
  if (!Array.isArray(records) || records.length > PAGE_SIZE) {
    throw new TypeError('Expected at most 50 locations');
  }
  const seen = new Set();
  const rows = records.map((location, index) => {
    if (!location || typeof location._id !== 'string' || !location._id.trim()
      || seen.has(location._id)) {
      throw new TypeError(`Invalid location ID at index ${index}`);
    }
    seen.add(location._id);
    return {
      id: location._id,
      name: displayText(location.name, 'Unnamed location'),
      address: displayText(location.address?.formatted, 'Address not set'),
      timeZone: displayText(location.timeZone, 'Time zone not set'),
      isDefault: location.default === true,
    };
  });
  return {
    rows,
    hasMore: typeof response.pagingMetadata?.hasNext === 'boolean'
      ? response.pagingMetadata.hasNext
      : null,
  };
}

export async function loadLocationsPage(listLocations) {
  const response = await listLocations({
    paging: { limit: PAGE_SIZE, offset: 0 },
    includeArchived: false,
  });
  return toLocationPage(response);
}
