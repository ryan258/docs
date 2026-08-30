# Troubleshooting and diagnosis

Diagnose from evidence. Start by identifying the failing boundary, the affected environment, the identity, and the first version where behavior changed. Do not patch a symptom before proving which layer owns it.

## Triage sequence

1. Define the exact user action and expected result.
2. Identify the Wix lane: site, app, managed Headless, or self-managed Headless.
3. Reproduce with a known identity and environment.
4. Compare the last known-good source/version with the failing one.
5. Inspect browser, backend, Wix, provider, webhook, and deployment evidence.
6. Check permissions, secrets, configuration, and data before changing code.
7. Reproduce the negative path if the issue involves access or data exposure.
8. Choose the smallest safe fix and add a regression test.

## Symptom guide

| Symptom | Likely boundary | Check first |
| --- | --- | --- |
| Works in editor preview, fails live | Environment, publish source, secret, domain, or data | Published source/version, live logs, destination secrets, live data |
| UI shows old code | Git/editor sync or cached/old deployment | Default branch, editor sync status, publish source, browser cache |
| Site and repository disagree | Local-code publish or dashboard-only change | Release record, Git status, editor history, UI/data/config changes |
| Permission denied | Caller identity, method permission, collection permission, or elevation | Actual identity, method permission, collection permission, API authorization notes |
| Unauthorized data is visible | Frontend exposure or over-broad read path | Browser bundle, collection permissions, backend projection, cross-member test |
| Secret is missing | Destination environment or secret name/configuration | Secret store, environment mapping, rotation history, fail-closed behavior |
| Webhook runs twice | At-least-once delivery without idempotency | Event ID receipt, dedupe key, side-effect log, retry response |
| Webhook never completes | Signature, endpoint, response code, timeout, or provider config | Delivery logs, public URL, auth/signature, status code, handler latency |
| External API times out | Provider latency, network, unbounded retry, or payload size | Request ID, timeout, retry count, response size, provider status |
| API call works as admin but not member | Identity or missing elevation | Caller identity, required scope, backend-only privileged operation |
| Headless request returns 401/403 | Client, token, redirect, or identity setup | Client ID, token audience/expiry, redirect allowlist, operation identity |
| App installs but dashboard is blank | Extension registration, route, or installation state | Released version, dashboard extension, installation ID, browser console |
| App works on one site only | Site-scoped state or required Wix app/plan | Installation/site key, required product, second-site test |
| Search result is wrong | Metadata, canonical, indexing, or generated page | Actual HTML, SEO settings, canonical, robots, sitemap, redirects |
| Layout shifts or page is slow | Media, fonts, third-party code, query waterfall | Network waterfall, real-user metrics, image dimensions, backend timings |
| Form submits twice | UI state or backend idempotency | Button state, request IDs, duplicate records, retry behavior |

## Permission failures

Capture:

- site/project and environment;
- operation name;
- caller identity;
- member/user/site/install identifier in redacted form;
- collection or Wix API method;
- configured permission;
- expected permission;
- exact error and timestamp;
- whether preview and production differ.

Then test:

- the permitted identity;
- an anonymous or lower-privilege identity;
- a different member or site;
- a malformed resource ID.

Do not fix a permission error by making the collection or method public without reviewing the data model.

## Git and editor drift

If code, UI, or behavior is inconsistent:

1. stop publishing;
2. identify the last known-good editor version and repository commit;
3. check the repository default branch;
4. check whether local code was published without being pushed;
5. inventory dashboard-only changes;
6. compare UI version/configuration with the code version;
7. reconcile into one source of truth;
8. publish a known source and record the reconciliation.

Do not delete the repository or disconnect Git integration as a first response.

## Missing or stale data

Separate:

- no matching record;
- record exists but is not visible to this identity;
- record is unpublished or archived;
- query filter is wrong;
- index or pagination behavior is wrong;
- write has not completed;
- webhook or asynchronous job is delayed;
- the UI is showing cached data.

Inspect a single record by a safe internal identifier, then inspect the list query and permissions. Avoid exporting an entire collection just to debug one missing item.

## Third-party outage

When a provider is degraded:

- stop unnecessary retries;
- preserve user intent if it is safe;
- show a pending or unavailable state;
- keep correlation and provider request IDs;
- avoid charging or submitting twice;
- use the provider’s status and support channel;
- replay only idempotent work;
- document affected records and recovery.

## What to include in an escalation

~~~text
Summary:
Affected Wix lane:
Affected site/app installation/project:
Environment:
First observed:
Last known-good version:
User impact:
Reproduction steps:
Identity used:
Expected:
Observed:
Browser/backend/provider evidence:
Recent changes:
Mitigation attempted:
Data or privacy risk:
Requested decision:
Owner:
~~~

Redact credentials, tokens, private member data, and full provider payloads before sharing.

