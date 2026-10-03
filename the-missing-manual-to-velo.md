# The missing manual to Velo

This companion brings together execution behavior, common failure modes, and project conventions from the official Velo documentation. It complements [Site development](04-site-development.md); read that first for the trust-boundary rules.

> A focused fact-check on 2026-10-03 updated HTTP authentication context, Git-connected field changes, query counts, and repeater scope across this handbook. See the [verification record](21-verification-record.md) for sources, the uncorroborated historical test report, and the command for new local checks. Recommendations are team guidance, not platform guarantees.

## What Velo actually is

Velo lets you extend a hosted Wix site with JavaScript. Wix manages the site runtime and deployment infrastructure. Practical consequences:

- Use the supported site build and publishing workflow. Custom routers can control a URL prefix, but do not replace the Wix hosting infrastructure.
- Page code can execute during server rendering and in the browser. Use `$w` for editor elements and initialize them in `$w.onReady()`.
- Backend code runs in Wix’s managed runtime. Package compatibility depends on the supported Node.js version and Wix restrictions; a local Node program is not proof of compatibility. Use Secrets Manager for credentials and check the site’s compute limits before choosing a workload.
- "It works in Preview" proves less than you think. Preview modes differ in rendering and source selection, and may share live resources. Record their data, credential, and integration boundaries explicitly.

The single most useful reframe: **treat the frontend as an untrusted client of your own backend**, exactly as you would with a separate API. Velo's convenience APIs (`wix-data` from the browser, datasets) blur that line; the line is still real.

## Execution contexts

File placement controls visibility and supported imports. Runtime context is a separate question: browser-delivered page code can also execute during server rendering, and public modules can be imported by backend code.

| File / location | Runs in | Use for | Never put here |
| --- | --- | --- | --- |
| Page code (`Page: <name>`) | Browser and potentially server rendering | UI wiring for one page, calling backend methods | Secrets, authorization decisions, third-party API keys |
| `masterPage.js` / site code | Browser and potentially server rendering, across pages | Shared header/footer/nav behavior, site-wide listeners | Per-page initialization, heavy work |
| `public/` | Importing frontend or backend context; publicly accessible | Pure client helpers, formatting, constants | Anything sensitive; anything importing backend |
| `backend/*.web.js` | Wix server, callable from frontend | Exposed backend methods with a permissions declaration | Long-running jobs that exceed the request timeout |
| `backend/*.jsw` (legacy web modules) | Wix server, callable from frontend | Older exposed backend methods | New code — prefer `.web.js` |
| `backend/*.js` (plain) | Wix server, internal only | Shared server logic imported by `.web.js`, events, http-functions | Assuming it is callable from the browser (it is not) |
| `backend/events.js` | Wix server, event-triggered | Reacting to Wix events (data, members, stores, etc.) | Business-critical logic with no idempotency or retry handling |
| `backend/http-functions.js` | Wix server, public HTTP endpoint | Webhooks and external integrations | Trusting the caller; skipping auth and validation |
| `backend/data.js` | Wix server, on supported collection operations | Validation and transformations on operations that invoke the hook | Slow external calls on the hot path; unguarded recursion |
| `backend/jobs.config` | Scheduler config (not code) | Declaring scheduled backend jobs | Secrets; logic (it only points at a function) |

If a frontend import resolves a `backend/` path, the bundler exposes a callable wrapper only for web modules (`.web.js` / `.jsw`). Plain `backend/*.js` is server-internal; import it from other backend files, not from page code.

## The `$w` lifecycle

`$w` selects page elements. It is only safe to use elements after the page reports ready:

~~~js
$w.onReady(() => {
  // elements exist here
  $w('#repeater1').data = items;
});
~~~

Rules people learn the hard way:

- Put element initialization in `onReady`; do not depend on elements being ready during module evaluation.
- `$w.onReady()` may run on the server and again in the browser on initial load. Page and master-page callbacks both run where applicable. Guard browser-only effects with `wix-window-frontend.rendering.env`; keep required content loading available to server rendering. [Rendering behavior](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/frontend-code/page-rendering/about-page-rendering).
- For one repeated item, use the `$item` selector supplied to `onItemReady()`, `forEachItem()`, or `forItems()`. A global `$w('#title')` reads property values from the repeater's item template; setting a property or calling a method affects the template and all repeated instances. Use that global scope only when the change is intended for every item. [Repeater selector scope](https://dev.wix.com/docs/velo/velo-only-apis/%24w/repeater/selector-scope).
- Elements hidden by default (`collapsed`/`hidden` in the editor) are not the same: `collapsed` removes layout space, `hidden` keeps it. Match the one the design assumes.
- Setting `.value` on an input does not fire its `onChange`. Update dependent UI yourself.
- Do not use page memory as durable state across navigation or reload. Choose an explicit persistence mechanism for state that must survive.

## Web modules: `.web.js`, permissions, and elevation

A `.web.js` module exposes functions wrapped with `webMethod()`. Its permissions control who may call each method; ordinary backend modules remain internal.

- Prefer `.web.js` for new code. It supports per-function permission declarations colocated with the code. `.jsw` is the older style and still works; do not mix both for one feature.
- Declare the **minimum** caller identity per function (visitor / member / admin). Default to the most restrictive that still works.
- Validate and normalize every argument on the server. The frontend call site is not a contract; it is a suggestion.
- Return a projection, never a whole private record. See [Data and content](08-data-content.md).
- `elevate()` (from `wix-auth`) applies to supported APIs whose reference permits elevation. For legacy `wix-data` queries, use the documented `find({ suppressAuth: true })` option when needed. Every `elevate` call needs an explicit authorization check right next to it, in your own code. Elevation is not authorization.
- Handle rejected calls in the UI. Use safe application errors and log diagnostic details separately; do not rely on an exact serialized exception shape without checking it in the selected runtime.

~~~js
// backend/orders.web.js
import { Permissions, webMethod } from 'wix-web-module';
import { currentMember } from 'wix-members-backend';
import wixData from 'wix-data';

export const getMyRecentOrders = webMethod(Permissions.SiteMember, async () => {
  const member = await currentMember.getMember();
  if (!member?._id) throw new Error('Not signed in');
  const res = await wixData.query('Orders')
    .eq('memberId', member._id)
    .descending('_createdDate')
    .limit(50)
    .find({ suppressAuth: true });
  return res.items.map(o => ({ id: o._id, total: o.total, status: o.status }));
});
~~~

This example assumes an admin-only **custom** `Orders` collection with a backend-controlled `memberId` field; it is not the Wix Stores order API. It returns at most 50 recent records, not complete order history. Verify member A, member B, anonymous, missing-member, and collection-permission cases in a Wix development site. The permission override is documented in [find()](https://dev.wix.com/docs/velo/apis/wix-data/wix-data-query/find).

## wix-data quirks that will bite you

- **Standard `wix-data` queries default to a page of 50 items.** Use `.limit(n)` and check collection-specific limits; some Wix app collections impose lower maximums than 1000. Paginate with `.skip()` / `results.next()`; do not assume you got everything.
- `.find()` returns a result object, not an array. Items are on `.items`. Legacy Velo `wix-data` queries return `.totalCount` by default unless `omitTotalCount: true` is set. The Data Items SDK (`@wix/data`) instead requires `find({ returnTotalCount: true })` to include the count and does not accept `omitTotalCount`. Do not copy count options between those APIs. [Velo query reference](https://dev.wix.com/docs/velo/apis/wix-data/wix-data-query/introduction), [SDK migration](https://dev.wix.com/docs/velo/apis/wix-data/migrate-to-the-sdk).
- Defined hooks run on supported collection interactions, including ordinary programmatic and CMS operations. They are not an unbypassable enforcement layer: backend calls can suppress hooks, and a query does not invoke hooks for referenced collections. Guard against recursion. Use `options.suppressHooks` for internal writes that must not re-trigger.
- `suppressAuth: true` bypasses collection permissions in backend code. It does not filter output and it is not an authorization check. You still enforce who-can-see-what yourself.
- Reference fields: `.include('refField')` to hydrate; without it you get an ID or nothing depending on field type.
- Separate `wix-data` calls do not form an atomic transaction. A lookup followed by an insert is not concurrency-safe deduplication. Use enforced uniqueness or a persistence system with the atomic operations your workflow requires; handle partial failure explicitly.
- `insert()` can accept your own unique `_id`; updates identify the existing item by `_id`. Let the platform manage timestamps and follow the operation’s field contract. `update()` replaces ordinary field values: preserve fields you intend to keep. [Wix Data reference](https://dev.wix.com/docs/velo/api-reference/wix-data).
- Measure important queries and add indexes that match access patterns within the site’s index limits. An unindexed query is not automatically slow for every dataset.
- Datasets (the editor-connected data binding) and `wix-data` are two different access paths to the same collection. They can coexist. Assign an owner for each displayed state and explicitly refresh a dataset after independent writes when needed.

## Secrets, fetch, and the backend environment

- Store credentials in Secrets Manager, not source code. The old `wix-secrets-backend.getSecret()` was deprecated in 2025. The replacement [Get Secret Value](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value) retrieves by name, requires elevation, and returns a response object. Keep retrieval inside a narrowly authorized backend operation; never accept arbitrary secret names from a browser.
- Calls needing credentials or privileged business rules belong on the backend. Public APIs can be called from the browser when their CORS policy permits it. [Wix fetch](https://dev.wix.com/docs/velo/apis/wix-fetch/fetch) fulfills on HTTP 4xx/5xx as well as 2xx: check `response.ok` and the provider contract.
- Runtime limits depend on the site plan and operation. Do not equate data-request, backend-request, and scheduled-work limits. Record the applicable limit and bounded batch size before implementation; use external workers when the workload needs capabilities Wix does not provide.
- Module-level state is not durable storage. Do not rely on a particular backend instance serving the next request.
- Public npm packages are available subject to [Wix package compatibility restrictions](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/packages/about-npm-packages). Native modules are unsupported. Follow the documented editor or CLI installation path, retain the lockfile where available, and review dependency changes.
- [Wix Logs](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/testing-monitoring/testing-troubleshooting/about-debugging-your-code) can collect frontend, public, backend, and HTTP-function messages in preview and published contexts. The browser console is not a reliable place to find published backend logs. Use correlation IDs, redact sensitive values, and verify retention and external logging requirements for the project.

## Routers, dynamic pages, and data binding

- **Dynamic pages** (CMS-backed URL patterns like `/products/{slug}`) are configured in the editor and get their item automatically. Page code reads it with the dataset’s `getCurrentItem()` after dataset readiness; custom router data is available through `wix-window-frontend.getRouterData()`.
- **Routers** (`backend/routers.js` with `wix-router`) give you full control of a URL prefix: you resolve the request to a page + data, or return a redirect / 404. Use this when dynamic pages are not flexible enough.
- Router code runs server-side per request. It is a good place for access control on a whole section, but it is not a substitute for authorization in the web methods that section calls.
- SEO for router pages: you set title/description/tags in the router response (page SEO data); separately provide `WixRouterSitemapEntry` objects for discovery. See [`wix-seo`](https://dev.wix.com/docs/velo/api-reference/wix-seo) and [SEO and analytics](14-seo-and-analytics.md).

## Events and scheduled jobs

Use the exact handler signature from the event’s current reference or generated editor stub in `backend/events.js`. Collection insert hooks use `<collectionId>_beforeInsert` / `<collectionId>_afterInsert` in `backend/data.js`; do not invent a generic `wixData_onInsert` event.

Design event processing to tolerate duplicate and delayed delivery. Delivery ordering, retry behavior, and guarantees are event-specific; “every event fires twice” is not a platform contract. An “already processed?” read alone does not prevent concurrent processing. Persist outcomes and define how failed work is retried.

Scheduled jobs point to an exported backend function through `jobs.config` (`src/backend/jobs.config` in Git projects). Configuration supports cron or time properties, uses UTC, and must be published. Account for daylight-saving changes when the business requirement is a local wall-clock time. Wix documents execution within five minutes of the scheduled time, not exact-second execution. Frequency and job-count limits depend on plan. [Scheduling rules](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/recurring-jobs/about-scheduling-recurring-jobs), [configuration and publication](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/recurring-jobs/schedule-recurring-jobs).

Use bounded batches, durable checkpoints, and safe retries. Scheduling does not make a workload unlimited or guarantee that a timed-out external mutation failed. Verify the applicable execution limits for the target site rather than assuming a job shares an HTTP request’s timeout.

## HTTP functions and preview environments

`backend/http-functions.js` exports handlers such as `get_name` and `post_name`. Decide whether each endpoint intentionally serves public data or requires authenticated/signed access. Validate input and apply authorization for protected operations. CORS controls browser access; it does not authenticate a caller.

The [site API endpoint reference](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/site-api-calls) distinguishes:

| Source to execute | Endpoint after the site base URL |
| --- | --- |
| Production code | `/_functions/<name>` |
| Published test-site code | `/_functions/<name>?rc=test-site` |
| Git branch and revision | `/_functions/<name>?siteRevision=<revision>&branchId=<branch>` |
| Latest editor code | `/_functions-dev/<name>`; the reference requires a test site |

**Authentication context:** these direct endpoints do not carry Wix authentication context. Do not assume a signed-in member's identity is available to the handler merely because the caller uses one of these URLs. When the operation needs Wix caller context, use the HTTP Functions REST API or SDK module with the required authorization; that path requires a published site. For external webhooks or other direct calls, verify the caller using the provider's documented signature or authentication scheme and apply your own authorization. CORS is not a substitute. [Custom site API authentication](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/about-custom-site-apis).

A CLI `wix preview` is different: **it uses live HTTP functions**, not local HTTP-function changes, and is not a Release Manager test site. Follow the documented functional-testing/Git workflow to verify changed endpoints. [Site CLI reference](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands).

Use the response helpers from `wix-http-functions`, return the status your caller expects, and verify signatures according to the provider protocol. Record the actual endpoint and source revision used in each integration test.

## What preview proves

Editor preview does not run the server rendering pass. Test published rendering separately. CLI previews, editor preview, and test sites have different source and endpoint behavior; record the specific mechanism rather than writing only “tested in preview.”

Preview is not automatic isolation for data, credentials, or external side effects. Record collection selection, secret names, provider destinations, and caller identity. Verify SEO HTML, routing, cookies, embeds, and caching on the intended published path. Wix Logs supports both preview and published debugging; production errors are not universally “swallowed.”

## Permissions and identity

- Identity tiers: **visitor** (not signed in), **member** (signed in site user), **Wix user/collaborator** (dashboard/admin). A member is not an admin.
- Read the current member on the backend with `wix-members-backend` `currentMember`. `wix-users` is the older API; check the [Velo-to-SDK mapping](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping) before copying an old sample.
- Frontend "is this user allowed" checks are for UX only (hiding a button). The web method must independently enforce it.
- Collection permissions (editor UI) and web-method permissions (code) are separate gates. A web method that accesses a collection must account for both, including any explicit permission override. Set each to least privilege; do not rely on one to cover the other.

## Caching

- Page, router, and data-query caching have different rules. Data queries can also return stale results due to eventual consistency. Use `consistentRead: true` where the data API supports it and immediate freshness is required. Treat optimistic UI as provisional, and reconcile failures. [Data caching rules](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/data-api/about-caching-data-query-results).
- `wix-window-frontend` `rendering.env` tells you `'backend'` vs `'browser'` during SSR-style rendering. Code that assumes `window` exists will break during the backend render pass.
- Do not use caching to paper over an authorization bug — a cached response for one member must never reach another. Scope cache keys by identity.

## Testing Velo

Local JavaScript tests do not reproduce Wix rendering, identities, or persistence. Combine them with Wix functional testing and browser checks:

1. **Extract pure logic** (validation, pricing, state transitions, formatting) into `public/` or `backend/*.js` modules with no `$w`, no `wix-data`, no `wix-fetch`. Unit-test those in a normal Node/Vitest project outside Wix.
2. Keep web methods thin: auth check, validate, call pure logic, call one adapter, return projection. Test the authorization and response behavior even when the wrapper is small.
3. For the Wix-touching parts, use a development site and a written manual smoke script: denied access, malformed input, empty collection, duplicate submit, slow/failed dependency.
4. If the project is Git-integrated, run the extracted-logic tests in CI. See [Testing and quality](11-testing.md).

## SDK migration note

Wix is moving site development toward the Wix JavaScript SDK. For new work: check whether the capability has an SDK module first, use it where it covers the case, fall back to Velo APIs where it does not, and document the boundary. A documented Velo/SDK combination is valid; migrate deliberately and verify identity and response contracts. Re-check the [mapping page](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping) before adopting any older example.

## Error message decoder

| Symptom | Usual cause |
| --- | --- |
| `$w(...)` returns something that does nothing | Called before `$w.onReady`, wrong ID, or element on a different page |
| Query returns exactly 50 rows and you expected more | Default limit; add `.limit()` and paginate |
| "Function not found" / import undefined from `backend/` | Importing plain `backend/*.js` from frontend; only web modules are callable |
| Web method works in Preview, 403/permission error live | Different caller identity, method/collection permissions, or published source; inspect before adding an override |
| Secret is `undefined` | Wrong name, permissions, failed retrieval, or incorrect response handling; never return the value to debug it |
| External API call fails with CORS in browser | Called from frontend; move to a web module with `wix-fetch` |
| Event handler ran twice / caused a loop | No idempotency guard; or a `data.js` hook re-triggering itself — use `suppressHooks` |
| Backend `console.log` produces nothing | Check Wix Logs, source version, execution path, and log filters |
| HTTP function 404 | Wrong `/_functions` vs `/_functions-dev` path for the environment |
| Data updates but page does not refresh | Stale dataset state, query cache, eventual consistency, or an incomplete write; inspect before refreshing |
| `window is not defined` in what looks like frontend code | Runs during backend render pass; guard with `wix-window-frontend` `rendering.env` |

## Operational reminders

- Frontend code is downloadable. Members-only and password-protected pages do not hide their source.
- `elevate` / `suppressAuth` remove the guardrail; they do not add authorization. You add that.
- Design for duplicate events and retries; verify the delivery contract for each source.
- Standard `wix-data` query pages default to 50 items. Assume you have a partial result until you have handled pagination.
- Backend module memory may be reused but is not durable or shared across all instances.
- Preview is a different environment, not a smaller production. Keep a published-site smoke test.
- Wix Logs can collect messages across site code; correlate them with request IDs and verify retention.

## Canonical references

- [Velo API reference](https://dev.wix.com/docs/velo)
- [Where Do I Put My Code?](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/overview/where-do-i-put-my-code)
- [About Web Modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules)
- [wix-data](https://dev.wix.com/docs/velo/api-reference/wix-data) · [Data hooks](https://dev.wix.com/docs/velo/api-reference/wix-data/hooks/introduction)
- [Secrets API](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/introduction) · [wix-fetch](https://dev.wix.com/docs/velo/api-reference/wix-fetch)
- [wix-http-functions](https://dev.wix.com/docs/velo/api-reference/wix-http-functions) · [Events](https://dev.wix.com/docs/velo/api-reference/events) · [Scheduled jobs](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/recurring-jobs/about-scheduling-recurring-jobs)
- [wix-router](https://dev.wix.com/docs/velo/api-reference/wix-router) · [Routers and dynamic pages](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/routers/about-routers)
- [Velo-to-SDK API mapping](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping)
