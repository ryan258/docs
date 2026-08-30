# The missing manual to Velo

The official Velo reference documents each API. It does not tell you the mental model, the failure modes, or the conventions that a Velo project needs to be maintainable. This page fills those gaps. It complements [Site development](04-site-development.md); read that first for the trust-boundary rules.

> Platform facts and links were reviewed on 2026-08-30. Wix moves APIs from Velo to the [Wix JavaScript SDK](https://dev.wix.com/docs/develop-websites-sdk) over time, renames things, and changes file conventions. The linked Wix documentation is the final authority. Where this page and the platform docs disagree, follow the platform docs and update this page.

## What Velo actually is

Velo is a JavaScript environment bolted onto a hosted Wix site. It is not Node, not a normal SPA, and not a framework you control. Practical consequences:

- You do not own the build, the bundler, the router, the request lifecycle, or the deploy. Wix does.
- Frontend code runs inside the rendered Wix page, after Wix has built the DOM. You manipulate elements through the `$w` selector API, not the DOM directly.
- Backend code runs in a Wix-managed serverless runtime. It is Node-like but restricted: no arbitrary filesystem, no `process.env`, a curated npm allowlist, no native modules, cold starts, and a request timeout you cannot raise.
- "It works in Preview" proves less than you think. Preview and the published site differ in caching, error surfacing, routing, HTTP functions, secrets, SEO rendering, and third-party embeds.

The single most useful reframe: **treat the frontend as an untrusted client of your own backend**, exactly as you would with a separate API. Velo's convenience APIs (`wix-data` from the browser, datasets) blur that line; the line is still real.

## Execution contexts

Every Velo file runs in exactly one context. Putting code in the wrong one is the most common structural mistake.

| File / location | Runs in | Use for | Never put here |
| --- | --- | --- | --- |
| Page code (`Page: <name>`) | Visitor browser | UI wiring for one page, calling backend methods | Secrets, authorization decisions, third-party API keys |
| `masterPage.js` / site code | Visitor browser, every page | Shared header/footer/nav behavior, site-wide listeners | Per-page initialization, heavy work |
| `public/` | Visitor browser when imported | Pure client helpers, formatting, constants | Anything sensitive; anything importing backend |
| `backend/*.web.js` | Wix server, callable from frontend | Exposed backend methods with a permissions declaration | Long-running jobs that exceed the request timeout |
| `backend/*.jsw` (legacy web modules) | Wix server, callable from frontend | Older exposed backend methods | New code — prefer `.web.js` |
| `backend/*.js` (plain) | Wix server, internal only | Shared server logic imported by `.web.js`, events, http-functions | Assuming it is callable from the browser (it is not) |
| `backend/events.js` | Wix server, event-triggered | Reacting to Wix events (data, members, stores, etc.) | Business-critical logic with no idempotency or retry handling |
| `backend/http-functions.js` | Wix server, public HTTP endpoint | Webhooks and external integrations | Trusting the caller; skipping auth and validation |
| `backend/data.js` | Wix server, before/after every collection op | Invariants that must hold no matter which UI wrote the record | Slow external calls on the hot path; unguarded recursion |
| `backend/jobs.config` | Scheduler config (not code) | Declaring scheduled backend jobs | Secrets; logic (it only points at a function) |

If a frontend import resolves a `backend/` path, the bundler exposes a callable wrapper only for web modules (`.web.js` / `.jsw`). Plain `backend/*.js` is server-internal; import it from other backend files, not from page code.

## The `$w` lifecycle — the number one gotcha

`$w` selects page elements. It is only safe to use elements after the page reports ready:

~~~js
$w.onReady(() => {
  // elements exist here
  $w('#repeater1').data = items;
});
~~~

Rules people learn the hard way:

- Code at module top level runs **before** the page is built. Selecting elements there returns nothing useful.
- `$w.onReady` on a page runs once per page load. On `masterPage.js` it runs on every page.
- Inside a repeater, scope selectors to the item: `$item => $item('#title').text = ...`. A bare `$w('#title')` inside a repeater is ambiguous.
- Elements hidden by default (`collapsed`/`hidden` in the editor) are not the same: `collapsed` removes layout space, `hidden` keeps it. Match the one the design assumes.
- Setting `.value` on an input does not fire its `onChange`. Update dependent UI yourself.
- `wix-location` navigation reloads Velo state on classic sites. Do not rely on in-memory page state surviving a `to()` call unless you have confirmed the routing model.

## Web modules: `.web.js`, permissions, and elevation

A web module is your API boundary. Each exported function is individually reachable from the browser.

- Prefer `.web.js` for new code. It supports per-function permission declarations colocated with the code. `.jsw` is the older style and still works; do not mix both for one feature.
- Declare the **minimum** caller identity per function (visitor / member / admin). Default to the most restrictive that still works.
- Validate and normalize every argument on the server. The frontend call site is not a contract; it is a suggestion.
- Return a projection, never a whole private record. See [Data and content](08-data-content.md).
- `elevate()` (from `wix-auth`) runs an operation with elevated permissions regardless of the caller. Every `elevate` call needs an explicit authorization check right next to it, in your own code. Elevation is not authorization.
- A thrown `Error` crosses to the frontend as a rejected promise with the message string exposed. Throw a safe message; log the detail server-side.

~~~js
// backend/orders.web.js
import { Permissions, webMethod } from 'wix-web-module';
import { elevate } from 'wix-auth';
import { currentMember } from 'wix-members-backend';
import wixData from 'wix-data';

export const getMyOrders = webMethod(Permissions.SiteMember, async () => {
  const member = await currentMember.getMember();
  if (!member) throw new Error('Not signed in');
  const res = await elevate(wixData.query)('Orders')
    .eq('memberId', member._id)
    .limit(50)
    .find();
  return res.items.map(o => ({ id: o._id, total: o.total, status: o.status }));
});
~~~

## wix-data quirks that will bite you

- **Queries return 50 items by default.** `.find()` caps at 50 unless you call `.limit(n)` (max 1000). Paginate with `.skip()` / `results.next()`; do not assume you got everything.
- `.find()` returns a result object, not an array. Items are on `.items`; total (if requested) on `.totalCount`.
- Hooks in `data.js` run on **every** call to that collection, including from other hooks, events, and the CMS UI. Guard against recursion. Use `options.suppressHooks` for internal writes that must not re-trigger.
- `suppressAuth: true` bypasses collection permissions in backend code. It does not filter output and it is not an authorization check. You still enforce who-can-see-what yourself.
- Reference fields: `.include('refField')` to hydrate; without it you get an ID or nothing depending on field type.
- No transactions across collections. Design for partial failure and idempotency (correlation IDs, "already processed" checks).
- `insert`/`update` return the written object with `_id`, `_createdDate`, `_updatedDate`, `_owner`. Do not set those yourself.
- Sorting/filtering on unindexed fields is slow and silently so. Add indexes for anything a user-facing query filters or sorts on.
- Datasets (the editor-connected data binding) and `wix-data` are two different access paths to the same collection. Mixing them on one page causes "why didn't it refresh" confusion. Pick one per page.

## Secrets, fetch, and the backend environment

- Secrets live in the Wix Secrets Manager. Read them with `wix-secrets-backend` `getSecret('name')` in **backend code only**. There is no `process.env`.
- `wix-fetch` (`fetch`) is available in backend code. Calling external APIs from frontend code leaks keys and hits CORS — do it from a web module.
- The backend request has a timeout you cannot extend (short — treat it as a few seconds of usable work). Long tasks belong in a scheduled job or must be broken into steps.
- Cold starts happen. Do not keep important state in module-level variables expecting it to persist between requests. It sometimes does, which is worse — it makes the bug intermittent.
- npm packages install through the editor's Packages panel from a curated registry. No native/binary modules. Pin versions; an unpinned bump ships silently on next publish.
- `console.log` / `console.error` in backend code goes to **Site Monitoring** (Wix dashboard), not your terminal. Frontend `console.log` goes to the browser console. There is no unified log.

## Routers, dynamic pages, and data binding

- **Dynamic pages** (CMS-backed URL patterns like `/products/{slug}`) are configured in the editor and get their item automatically. Page code reads it via the dataset or `wix-dynamic-pages` `getData()`.
- **Routers** (`backend/routers.js` with `wix-router`) give you full control of a URL prefix: you resolve the request to a page + data, or return a redirect / 404. Use this when dynamic pages are not flexible enough.
- Router code runs server-side per request. It is a good place for access control on a whole section, but it is not a substitute for authorization in the web methods that section calls.
- SEO for router pages: you set title/description/tags in the router response (`WixRouterSitemapEntry` / the page's SEO data), not only in the editor. See [`wix-seo`](https://dev.wix.com/docs/velo/api-reference/wix-seo) and [SEO and analytics](14-seo-and-analytics.md).

## Events and scheduled jobs

- `backend/events.js` exports handlers named for the event (e.g. `wixData_onInsert`, `wixMembers_onMemberCreated`). Wix calls them after the fact, at least once, with no ordering guarantee and possible duplicates and delays.
- Make every handler **idempotent**. Check "have I already processed this ID" before acting. Assume replays.
- Errors in an event handler do not surface to a user. They go to Site Monitoring and may or may not retry. Log enough context to reconstruct what happened.
- Scheduled jobs: declare in `backend/jobs.config` (JSON), pointing at an exported backend function. Cron-style schedule. The config holds no logic and no secrets. Jobs share the same runtime limits — a job that needs an hour must checkpoint its own progress.

## HTTP functions (webhooks and public endpoints)

- `backend/http-functions.js` exports `get_name`, `post_name`, etc., reachable at `/_functions/name` (and `/_functions-dev/name` in preview).
- These are **public**. Anyone can call them. Authenticate every request yourself — shared secret header, HMAC signature verification, or provider-specific validation.
- Use the `ok()` / `badRequest()` / `serverError()` response builders from `wix-http-functions`. Set CORS headers explicitly if a browser will call the endpoint.
- The `-dev` path only exists in preview. Configure external providers with the correct one per environment, and remember the URL changes between them.
- Webhooks arrive more than once, out of order, and after long delays. Same idempotency discipline as events.

## Preview versus published — what actually differs

| Concern | Preview | Published |
| --- | --- | --- |
| Error surfacing | Verbose, shown in preview console | Swallowed; check Site Monitoring |
| HTTP function path | `/_functions-dev/` | `/_functions/` |
| Caching | Mostly off | CDN + page cache active; stale content possible |
| SEO / meta rendering | Not representative | Real; test with the live URL |
| Secrets | Same store, but test vs prod values are your problem | Same |
| Third-party embeds / cookies | Often blocked by preview origin | Real behavior |
| Router / dynamic page URLs | May differ | Canonical |

Define, per feature, what Preview proves and what still needs a check on the published site or a development site.

## Permissions and identity

- Identity tiers: **visitor** (not signed in), **member** (signed in site user), **Wix user/collaborator** (dashboard/admin). A member is not an admin.
- Read the current member on the backend with `wix-members-backend` `currentMember`. `wix-users` is the older API; check the [Velo-to-SDK mapping](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping) before copying an old sample.
- Frontend "is this user allowed" checks are for UX only (hiding a button). The web method must independently enforce it.
- Collection permissions (editor UI) and web-method permissions (code) are separate gates. A request passes through both. Set each to least privilege; do not rely on one to cover the other.

## Caching

- Published pages and HTTP function responses can be cached at the CDN. A user may see stale data after a write. Design UI to reflect the user's own action optimistically and reconcile on next load.
- `wix-window` `rendering.env` tells you `'backend'` vs `'browser'` during SSR-style rendering. Code that assumes `window` exists will break during the backend render pass.
- Do not use caching to paper over an authorization bug — a cached response for one member must never reach another. Scope cache keys by identity.

## Testing Velo

There is no first-class local test runner for Velo files. Realistic strategy:

1. **Extract pure logic** (validation, pricing, state transitions, formatting) into `public/` or `backend/*.js` modules with no `$w`, no `wix-data`, no `wix-fetch`. Unit-test those in a normal Node/Vitest project outside Wix.
2. Keep web methods thin: auth check, validate, call pure logic, call one adapter, return projection. Thin wrappers need less testing.
3. For the Wix-touching parts, use a development site and a written manual smoke script: denied access, malformed input, empty collection, duplicate submit, slow/failed dependency.
4. If the project is Git-integrated, run the extracted-logic tests in CI. See [Testing and quality](11-testing.md).

## SDK migration note

Wix is moving site development toward the Wix JavaScript SDK. For new work: check whether the capability has an SDK module first, use it where it covers the case, fall back to Velo APIs where it does not, and document the boundary. Do not half-migrate one feature. Re-check the [mapping page](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping) before adopting any older example.

## Error message decoder

| Symptom | Usual cause |
| --- | --- |
| `$w(...)` returns something that does nothing | Called before `$w.onReady`, wrong ID, or element on a different page |
| Query returns exactly 50 rows and you expected more | Default limit; add `.limit()` and paginate |
| "Function not found" / import undefined from `backend/` | Importing plain `backend/*.js` from frontend; only web modules are callable |
| Web method works in Preview, 403/permission error live | Web-method or collection permission set for preview-only identity, or elevation missing |
| Secret is `undefined` | Read from frontend, wrong name, or `getSecret` not awaited |
| External API call fails with CORS in browser | Called from frontend; move to a web module with `wix-fetch` |
| Event handler ran twice / caused a loop | No idempotency guard; or a `data.js` hook re-triggering itself — use `suppressHooks` |
| Backend `console.log` produces nothing | Looking in the browser console instead of Site Monitoring |
| HTTP function 404 | Wrong `/_functions` vs `/_functions-dev` path for the environment |
| Data updates but page does not refresh | Mixing dataset binding and `wix-data` on the same page |
| `window is not defined` in what looks like frontend code | Runs during backend render pass; guard with `wix-window` `rendering.env` |

## Things the docs do not say loudly enough

- Frontend code is downloadable. Members-only and password-protected pages do not hide their source.
- `elevate` / `suppressAuth` remove the guardrail; they do not add authorization. You add that.
- Every event and webhook fires more than once eventually. Idempotency is not optional.
- Queries are capped at 50 by default. Assume you have a partial result until you have handled pagination.
- Backend module-level state is not a cache. It survives sometimes, which makes bugs intermittent.
- Preview is a different environment, not a smaller production. Keep a published-site smoke test.
- There is no unified log. Backend goes to Site Monitoring; frontend to the browser; correlate with your own request IDs.

## Canonical references

- [Velo API reference](https://dev.wix.com/docs/velo)
- [Where Do I Put My Code?](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/overview/where-do-i-put-my-code)
- [About Web Modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules)
- [wix-data](https://dev.wix.com/docs/velo/api-reference/wix-data) · [Data hooks](https://dev.wix.com/docs/velo/api-reference/wix-data/hooks/introduction)
- [wix-secrets-backend](https://dev.wix.com/docs/velo/api-reference/wix-secrets-backend) · [wix-fetch](https://dev.wix.com/docs/velo/api-reference/wix-fetch)
- [wix-http-functions](https://dev.wix.com/docs/velo/api-reference/wix-http-functions) · [Events](https://dev.wix.com/docs/velo/api-reference/events) · [Scheduled jobs](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/scheduled-jobs)
- [wix-router](https://dev.wix.com/docs/velo/api-reference/wix-router) · [Routers and dynamic pages](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/routers-and-dynamic-pages/about-routers)
- [Velo-to-SDK API mapping](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping)
