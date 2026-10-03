# Data, CMS, and content

Wix collections and business APIs are part of the application’s contract. Treat schema, permissions, content, indexes, and migrations as production code even when they are edited through a dashboard.

## Model before building UI

For each data concept, record:

- business meaning;
- owning system;
- identifier and uniqueness rule;
- required versus optional fields;
- allowed values and normalization;
- relationships;
- public and private fields;
- retention and deletion behavior;
- who can create, read, update, and delete;
- migration and backfill path;
- audit requirements.

Do not begin with a form and let the form silently become the schema.

## Separate content from operational data

| Data type | Examples | Default treatment |
| --- | --- | --- |
| Public content | Pages, articles, product descriptions | CMS/editor-owned; accessible only as intended |
| User-submitted content | Comments, applications, inquiries | Validate, moderate, rate-limit, and retain minimally |
| Private member data | Preferences, addresses, history | Backend access; strict permissions and field filtering |
| Operational state | Sync cursors, webhook receipts, job status | Admin/backend only; idempotency and recovery matter |
| Secrets | API keys, tokens, signing material | Secrets Manager or the selected host secret store; never collection data |
| Analytics data | Events, attribution, usage counters | Minimize, consent where required, never include unnecessary PII |

One collection that mixes public and private fields is a recurring source of accidental disclosure. Split it or return an explicit public projection.

## Permissions are a security boundary

Set collection permissions to the most restrictive common case. Review read, create, update, and delete separately. An unused permission is still an attack surface; a visitor may call an API even when the UI does not expose a form.

Use backend code for special-case access rather than widening an entire collection. If a backend operation suppresses the platform’s permission check, it must perform its own authorization and return only the safe fields.

Read the current [Velo security best practices](https://dev.wix.com/docs/develop-websites/articles/best-practices/security-best-practices) before using suppressAuth or an elevated operation.

## Query discipline

For every list or search:

- define the allowed filters;
- validate and normalize filter values;
- use explicit sort order;
- cap page size;
- paginate using the API-supported method;
- add indexes for known access patterns;
- avoid returning fields the caller does not need;
- handle empty, deleted, and stale records;
- record slow-query evidence when available.

Do not accept arbitrary field names, collection names, sort expressions, or query fragments from the browser.

## Write discipline

Before a write:

1. authenticate and authorize the caller;
2. validate shape, type, length, range, and business rules;
3. normalize values consistently;
4. enforce uniqueness and concurrency requirements with supported persistence constraints; a read-before-write check alone is insufficient;
5. write the smallest allowed fields;
6. record an audit or correlation ID when the action matters;
7. return a safe projection, not the entire stored record.

Do not trust hidden form fields, disabled controls, member IDs supplied by the client, or UI-only role checks.

## Hooks and side effects

Use data hooks or service-layer logic for validation on the supported write paths. Hooks can be suppressed by backend calls, so inventory bypass paths before relying on them for an invariant. Make side effects deliberate:

- avoid sending email before the write is confirmed;
- avoid charging twice on retries;
- avoid calling an external service inside a transaction-like path without a compensation plan;
- make asynchronous work visible and recoverable.

Document whether a hook runs before or after the write and what happens if it fails.

## CMS content workflow

Content owners should be able to update editorial content without changing application code, but the team should still define:

- required fields;
- preview/review status;
- publication responsibility;
- image and alt-text rules;
- URL slug and canonical behavior;
- localization requirements;
- archival/deletion rules;
- access and audit expectations.

Test content as a user would see it. A valid collection record can still create an unusable page, broken metadata, inaccessible images, or an unhandled empty state.

## Schema changes

Classify a schema change:

- additive and backward-compatible;
- behavior-changing;
- destructive;
- data-migrating;
- permission-changing.

For any non-trivial change, write:

- current and target schema;
- affected code paths;
- migration/backfill steps;
- validation query or report;
- deploy order;
- compatibility window;
- rollback or forward-fix;
- owner and evidence.

Do not delete or rename a field because current code no longer references it. Search historical jobs, automations, exports, integrations, and support workflows first.

## Privacy lifecycle

For personal data, document:

- why it is collected;
- the minimum fields required;
- who can access it;
- retention period;
- deletion/export request behavior;
- processor or third-party sharing;
- logging and analytics redaction.

Use synthetic or anonymized records in development. Production exports require explicit authorization and secure handling.

