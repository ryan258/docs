// Type companion for reading-list.mjs in strict generated Astro projects.
export interface ReadingLink {
  id: string;
  title: string;
  href: string;
  summary: string;
}

export interface ReadingQuery {
  ascending(field: string): ReadingQuery;
  limit(size: number): ReadingQuery;
  find(): Promise<unknown>;
}

export interface ReadingDataItems {
  query(collectionId: string): ReadingQuery;
}

export const COLLECTION_ID: 'ReadingList';
export const MAX_ITEMS: 50;
export function toReadingLinks(records: unknown): ReadingLink[];
export function loadReadingList(dataItems: ReadingDataItems): Promise<ReadingLink[]>;
