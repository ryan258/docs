# Data, CMS, and content

Define records and permissions before connecting a form or dataset. Start with these order and preference examples.

## Model before building UI

Create this **custom** `Orders` collection for the [member-orders recipe](the-missing-manual-to-velo.md#web-modules-webjs-permissions-and-elevation). It is separate from Wix Stores. Collections must exist before Data API calls use them. [Wix: Working with the Data API](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/data-api/working-with-the-data-api).

| Field ID | CMS type | Example | Rule for this example |
| --- | --- | --- | --- |
| `_id` | System ID | `demo-order-a` | Existing record identifier |
| `_createdDate` | System date/time | Assigned when inserted | Used for newest-first sorting |
| `memberId` | Text | Actual test member A's ID | Set by trusted backend/admin work, never accepted from the browser |
| `total` | Number | `29.5` | Display value for this sample; not a payment calculation |
| `status` | Text | `paid` | Example application value, not a Wix Stores enum |
| `privateNote` | Text | `Synthetic private note` | Must never appear in the member response |

For real payments, define currency, rounding, and amount ownership; this read-only sample supplies none of those rules.

## Separate content from operational data

| Collection / store | Example fields | Reader |
| --- | --- | --- |
| `Articles` | title, slug, body, image, alt text | Public if the content is intended to be public |
| Custom `Orders` | memberId, total, status, privateNote | Admin directly; members receive a filtered backend response |
| Integration receipts | event ID, processing state, attempts | Backend/operator |
| Secrets Manager | Provider credential | Backend only |

Keep private fields out of public collections. Where a mixed record is necessary, restrict direct access and return an authorized backend projection.

## Permissions are a security boundary

Set custom `Orders` **Read, Create, Update, Delete: Admin**. The web method uses a backend permission override, filters by the caller's resolved `memberId`, and returns only `id`, `total`, and `status`. Members gain no direct collection access. [Wix: Security Best Practices](https://dev.wix.com/docs/develop-websites/articles/best-practices/security-best-practices).

Use two synthetic test members and at least one order for each. Expected response when A calls:

~~~json
[
  { "id": "demo-order-a", "total": 29.5, "status": "paid" }
]
~~~

B's order and A's `privateNote` must be absent. This returns at most 50 recent records; full history needs explicit pagination.

## Query discipline

| Decision | Recent-orders recipe |
| --- | --- |
| Collection | Fixed `Orders` |
| Filter | Backend-resolved `memberId` |
| Sort | Explicit `_createdDate` descending |
| Limit | Explicit 50 |
| Output | Explicit `id`, `total`, `status` projection |
| Empty result | `[]`; a normal page state |

For search, accept validated named inputs such as `status`; keep collection/field names fixed in code. Choose indexes from actual queries and measured performance.

A read immediately after a successful write can still return the older record because Wix Data replicates changes. Prefer the record returned by the write for immediate confirmation. Use `consistentRead: true` on a retrieval that supports it when the next step needs the latest committed data. [Wix Data and eventual consistency](https://dev.wix.com/docs/velo/apis/wix-data/introduction).

## Write discipline

Save this complete **pure JavaScript** block as `preference-rules.mjs`; run `node preference-rules.mjs`. It prints the shown outputs, makes no Wix call, and saves nothing.

~~~js
export function normalizePreference(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Expected a preference object');
  }

  const allowed = new Set(['displayName', 'theme']);
  if (Object.keys(input).some(key => !allowed.has(key))) {
    throw new Error('Unknown preference field');
  }
  if (typeof input.displayName !== 'string') {
    throw new Error('Display name must be text');
  }

  const displayName = input.displayName.trim();
  if (displayName.length < 1 || displayName.length > 80) {
    throw new Error('Display name must contain 1 to 80 characters');
  }
  if (!['light', 'dark', 'system'].includes(input.theme)) {
    throw new Error('Choose light, dark, or system');
  }

  return { displayName, theme: input.theme };
}

console.log(JSON.stringify(normalizePreference({
  displayName: '  Ryan  ', theme: 'system'
})));
// {"displayName":"Ryan","theme":"system"}

try {
  normalizePreference({ displayName: 'Ryan', theme: 'system', memberId: 'other' });
} catch (error) {
  console.log(error.message);
}
// Unknown preference field
~~~

Length counts UTF-16 code units; a visible-character limit needs a different rule.

Before a backend write, resolve the caller, load their owned record, normalize the input, and construct allowed write fields. Velo `wixData.update()` replaces the item payload and drops omitted values. With the Data Items API, use a supported Patch Data Item operation when editing only selected fields. Prevent duplicates with a supported uniqueness constraint or an idempotent write. Concurrent requests can both pass an initial lookup. [Velo update](https://dev.wix.com/docs/velo/apis/wix-data/update), [Data Items write methods](https://dev.wix.com/docs/api-reference/business-solutions/cms/data-items/introduction).

## Hooks and side effects

On Wix Editor and Wix Studio, backend Velo calls that support `suppressHooks: true` can bypass registered data hooks. Validate at the write boundary and check which other writers can change the collection. [Wix Data API and hooks](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/data-api/working-with-the-data-api).

Studio Two's initial release uses CMS Data Sources for display in place of datasets. It supports data events for user-created collections. Those events run after the change is saved, so validate in the write handler when invalid data must be rejected before it reaches the collection. [Studio Two feature comparison](https://dev.wix.com/docs/studio-two/get-started/compare-extending-websites-in-studio-two-to-wix-editor-and-wix-studio).

Save a validated contact request before CRM delivery, then record the CRM result/pending state so retries resume the same request. See [receipts](10-integrations.md#webhook-processing).

## CMS content workflow

For an article collection, give the editor a small publish recipe:

1. Fill `title`, unique `slug`, body, image, and meaningful alt text when the image conveys information.
2. Preview one filled article and one missing optional-image case.
3. Check the rendered heading, link, image alternative, and URL.
4. Publish through the project's chosen workflow; retain the previous content/export when recovery matters.

Adapt field names and publication controls to the [chosen site setup](04-site-development.md).

For code that publishes CMS drafts, check the collection's draft-items plugin and the release status of the method. Wix lists bulk publish and unpublish for Data Items V2 in Developer Preview. A bulk call can partially succeed, so inspect each item's result before recording what went live or deciding what to retry. [Wix Data Items draft lifecycle](https://dev.wix.com/docs/api-reference/business-solutions/cms/data-items/introduction), [Developer Preview methods](https://dev.wix.com/docs/api-reference/articles/work-with-wix-apis/platform/about-developer-preview).

## Schema changes

Example: replace a preference field `name` with `displayName` without losing older records.

| Order | Change | Evidence |
| --- | --- | --- |
| 1 | Add `displayName`; readers temporarily fall back to `name` | Old and new fixtures render |
| 2 | New writes populate `displayName` | A new synthetic record uses it |
| 3 | Backfill only missing `displayName` values; retain `name` | Counts before/after; inspect failures |
| 4 | Remove fallback after all consumers migrate | Search code, jobs, automations, exports |
| 5 | Consider retiring `name` after a recovery window | Authorized export and rollback/forward-fix recorded |

This is a plan, not a migration script. Data changes need the intended environment and an authorized recovery path.

## Privacy lifecycle

Give personal fields a purpose, retention choice, and export/deletion path. An inquiry email need not also appear in diagnostics. Use synthetic development records; store secrets outside collections.
