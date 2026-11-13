export type LocationRow = {
  id: string;
  name: string;
  address: string;
  timeZone: string;
  isDefault: boolean;
};

export type LocationPage = {
  rows: LocationRow[];
  hasMore: boolean | null;
};

export type ListLocationsRequest = {
  paging: { limit: number; offset: number };
  includeArchived: boolean;
};

export const PAGE_SIZE: number;
export function toLocationPage(response: unknown): LocationPage;
export function loadLocationsPage(
  listLocations: (options: ListLocationsRequest) => Promise<unknown>,
): Promise<LocationPage>;
