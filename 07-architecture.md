# Architecture and code organization

Good Wix architecture keeps platform-specific code at the edges and business decisions in small, testable units. The goal is not to recreate a large enterprise framework inside a site; it is to make behavior, trust boundaries, and recovery obvious.

## Start with a system map

Every non-trivial project should have a one-page map containing:

- Wix site, app, or Headless project;
- frontend surfaces;
- backend surfaces;
- collections and Wix business systems;
- identities and permission boundaries;
- third-party integrations;
- secrets and configuration;
- preview and production environments;
- logs, alerts, and support owner;
- release and recovery paths.

If a new contributor cannot trace a user action from browser to final data change, the architecture is under-documented.

## Recommended layers

| Layer | Responsibility | Should not own |
| --- | --- | --- |
| UI/page/component | Render state, collect intent, invoke an allowed operation | Authorization, secrets, direct privileged data access |
| Application/service | Orchestrate a business action and map platform errors | Layout details or raw credentials |
| Domain/pure logic | Rules, validation, transformations, state transitions | Network calls or Wix-specific UI |
| Platform adapter | Wix SDK/Velo calls, CMS queries, external API calls | Product decisions scattered across every call site |
| Persistence | Read/write records, idempotency, audit state | Presenting UI messages |
| Observability | Structured logs, metrics, correlation IDs | Sensitive payload dumps |

A small site may combine layers into fewer files. Preserve the responsibilities even when the file count is small.

## Boundary-first design

For every callable backend operation, document:

~~~text
Operation:
Caller identities:
Allowed purpose:
Input schema:
Normalization:
Authorization rule:
Data read:
Data written:
External calls:
Idempotency key:
Expected errors:
Retry policy:
Safe response:
Audit/log fields:
~~~

This record doubles as a review and test plan.

## Keep APIs narrow

Prefer:

- getDashboardSummary;
- submitContactRequest;
- createBookingRequest;
- updateMemberPreference;
- syncOrderStatus.

Avoid exposing generic methods such as:

- queryAnyCollection;
- updateAnyRecord;
- callExternalUrl;
- runAdminAction.

Narrow interfaces make authorization, testing, logging, and future migrations tractable.

## State and concurrency

Explicitly model:

- loading versus empty;
- optimistic versus confirmed state;
- stale reads;
- simultaneous edits;
- duplicate submissions;
- retries after a timeout;
- partial success;
- cancellation or deletion during an in-flight request.

For mutations:

1. create a client or server correlation ID;
2. validate input again on the server;
3. reject or deduplicate repeated actions;
4. write a state transition that can be observed;
5. return a stable result;
6. make the UI safe to refresh or retry.

## Data and cache boundaries

Cache only data that is safe to reuse for the same audience and time window. Document:

- cache key;
- identity and tenant/site scope;
- freshness period;
- invalidation trigger;
- behavior when the cache is unavailable;
- whether the returned object is copied or shared.

Never allow a cache entry for one site, member, or permission scope to be served to another. Do not use caching to hide an authorization bug.

## Error design

Separate:

- user-correctable validation errors;
- authentication or authorization failures;
- missing configuration;
- not-found or stale-resource errors;
- transient Wix or third-party failures;
- permanent provider or contract failures;
- unexpected defects.

The UI should receive a safe, actionable state. Logs should contain enough context to investigate, but not credentials, tokens, full payment data, or unnecessary personal information.

## Naming and structure

Use consistent names for:

- user-facing operations;
- backend methods;
- collection records;
- integration adapters;
- analytics events;
- error codes;
- feature flags;
- release artifacts.

Group files by capability when a feature is substantial. Avoid a single “utils” file that becomes an unreviewable second application.

## Architecture review triggers

Revisit the design when:

- a page calls more than one unrelated backend method to complete one action;
- a collection becomes both public content and private operational data;
- a web method needs to suppress authorization checks;
- a third-party call is made from frontend code;
- a single app record now represents multiple Wix installations;
- the same business rule is duplicated in page, backend, and automation code;
- a release cannot be reproduced from the repository;
- a new data type or identity changes the threat model.

