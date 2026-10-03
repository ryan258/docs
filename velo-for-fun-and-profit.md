# Velo for fun and profit

This is the "what should I actually build with it" companion to [The missing manual to Velo](the-missing-manual-to-velo.md). That page covers how Velo works and where it bites. This page is about payoff: the builds where Velo earns its keep, the small ones worth doing for their own sake, and the ones that quietly lose money.

> A focused fact-check on 2026-10-03 updated HTTP authentication context, Git-connected field changes, query counts, and repeater scope across this handbook. See the [verification record](21-verification-record.md) for sources, the uncorroborated historical test report, and the command for new local checks. Recommendations are team guidance, not platform guarantees.

## When Velo pays off

Velo is a useful candidate when custom behavior adds value and the relevant data or identity already lives in Wix. Compare available Wix features and apps before building a custom flow.

| Good fit | Why |
| --- | --- |
| Gating content or downloads behind membership or payment | Wix already owns members, pricing plans, and checkout; you add the rule |
| Turning a form into a real workflow (validate, enrich, route, notify) | Server-side logic and `wix-fetch` to your CRM/email/Slack |
| Many similar pages from one collection (SEO landing pages, listings) | One dynamic-page template + CMS rows scales to hundreds of URLs |
| Custom quote / booking / eligibility flows | Business rules that change often, owned in code not a plugin config |
| Scheduled back-office automation (digests, syncs, cleanup) | A `jobs.config` cron + one backend function replaces a manual chore |
| Personalizing a page by member, referrer, geo, or history | Small conditional rendering against data you already have |

## When to consider another approach

| Bad fit | Do instead |
| --- | --- |
| Rebuilding a general CMS / admin panel inside a site | Use the Wix dashboard, CMS, or a real app |
| Heavy compute, image/video processing, PDF generation at scale | External service called from a web module |
| Realtime with specialized transport, persistence, or scale requirements | Compare Wix Realtime publish/subscribe with a purpose-built service against the actual requirements |
| Large datasets with complex reporting queries | External database + API; keep Velo as the thin frontend |
| Anything needing sub-second cold-start guarantees | Not a Velo runtime property |
| Product installed on multiple Wix sites | Use an app for its installation and distribution lifecycle — see [App development](05-app-development.md) |

If the interesting part of the system is not "a Wix site with rules," you are probably in the wrong lane. Re-check [Platform map](01-platform-map.md).

Wix supports backend-to-client realtime channels with permission controls. Live counters, alerts, and dashboards are possible; transport ownership and delivery requirements determine whether an external service is preferable. [Wix Realtime](https://dev.wix.com/docs/sdk/core-modules/realtime/realtime/introduction).

## Effort versus payoff

These are illustrative estimates for a small prototype by a developer familiar with Wix, with access, content, and provider setup already available. Security, accessibility, recovery, approvals, and maintenance can add substantial work. Outcomes require measurement.

| Build | Illustrative prototype effort | Potential benefit |
| --- | --- | --- |
| Members-only content gate | Hours | Support for a paid membership offering |
| Form → validated backend → CRM/email/Slack | Hours | Fewer lost leads, no manual re-entry |
| CMS-driven SEO landing pages | Days | Additional useful, indexable content |
| Paid digital download with expiring link | Hours to a day | Sell files without a store integration |
| Custom quote / eligibility calculator | Days | Higher-intent leads, less sales back-and-forth |
| Scheduled digest / sync job | Hours | Removes a standing manual task |
| Third-party API widget (reviews, inventory, pricing) | Hours to days | Trust signals, fewer "is this in stock" emails |

## Recipes

Each recipe is a shape, not a finished app. Keep page code thin, put the rule on the server, return a projection. See [Architecture](07-architecture.md) and [Security](09-security.md).

### 1. Gate content or a download behind membership

- **Ingredients:** `wix-members-backend` `currentMember`, a pricing-plan check if it is paid, a web module, an explicitly private asset in Media Manager or access-controlled external storage.
- **Sketch:** page calls `getAsset()`; backend confirms the member and (if paid) an active plan, then returns a temporary download URL or the permitted content projection. Never ship the asset URL to a page that has not passed the check.
- **Watch out:** page access restrictions do not make browser-delivered code a secret store. Protect the file itself and authorize each issuance; an expiring URL does not protect a separately accessible public original.

### 2. Form to workflow

- **Ingredients:** an editor form or custom inputs, one `.web.js` method, `wix-fetch` to the downstream system, the current Secrets API for the API key, `wix-data` if you also store the submission.
- **Sketch:** validate and normalize server-side → atomically persist a receipt for a stable action key → return accepted → process and reconcile downstream work → record completion.
- **Watch out:** the browser submit can fire twice. Deduplicate. Downstream calls fail; decide what "submitted but not synced" looks like and log it.

A reliable implementation has two parts. The following is **design pseudocode**, not a Wix API sample; the named persistence operations must be implemented using a store with the required concurrency guarantees.

~~~text
acceptSubmission(input, stableActionKey):
  validate and normalize bounded input; apply abuse controls
  atomically create one receipt per action key
  on a duplicate key, verify the same payload and return a safe receipt state
  persist the normalized payload and pending status together
  return accepted (not synced)

processReceipt(receipt):
  claim work with a concurrency-safe mechanism
  call the provider using the same idempotency key on each retry
  validate HTTP status and the provider's completion contract
  record completed, pending, retryable failure, or permanent failure
  on an ambiguous timeout, reconcile with the provider before retrying
~~~

A `query()` followed by `insert()` is not an atomic claim. A custom `_id` or unique index can enforce receipt uniqueness, but does not by itself implement worker locking or exactly-once provider effects. A matching receipt must not skip an unfinished sync. Choose a provider with idempotency/reconciliation support or document the remaining duplicate risk. [Collection indexes](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/collections/indexes-and-wix-data-collections).

Keep `Leads` and processing receipts private. An anonymous web method does not automatically grant access to an admin-only collection. Any necessary `suppressAuth` or elevation must follow server-side validation, abuse controls, and the operation's authorization policy. Do not return whether an arbitrary email address exists in the database.

This isolated **backend HTTP helper** illustrates status handling only. The caller supplies a backend-retrieved secret, validated payload, and stable action key. It does not implement persistence, retry scheduling, or a real CRM integration. The placeholder provider must be replaced and its idempotency header and success contract verified.

~~~js
// backend/crmTransport.js — internal helper, not a web method
import { fetch } from 'wix-fetch';

export async function sendContact({ apiKey, email, actionKey }) {
  const response = await fetch('https://crm.example.com/v1/contacts', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      'idempotency-key': actionKey,
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    // Do not expose provider bodies or credentials to callers or logs.
    throw new Error(`CRM HTTP failure: ${response.status}`);
  }
  // A 2xx response proves HTTP acceptance only. For example, 202 may
  // require polling or a webhook before the receipt can become completed.
  return { httpAccepted: true, status: response.status };
}
~~~

Wix `fetch()` fulfills on 4xx/5xx responses, so `try/catch` alone is insufficient. Retrieve credentials using the current Secrets API inside the authorized backend flow. [Fetch behavior](https://dev.wix.com/docs/velo/apis/wix-fetch/fetch), [Get Secret Value](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value).

Acceptance cases: concurrent identical submissions; same key with different payload; provider 400/401/429/500; 202 pending; network failure; provider success followed by a failed local status write; retry of an unfinished receipt; and recovery after a worker interruption. These require project-specific tests before use.

### 3. CMS-driven SEO landing pages

- **Ingredients:** one collection (one row per page), a dynamic page template `/topic/{slug}`, per-item SEO fields, `wix-seo` if you use a router instead.
- **Sketch:** author rows, not pages. The template binds title, body, image, and meta from the current item. Verify the generated sitemap. Built-in dynamic pages have Wix-managed routing/SEO; a custom router needs its own sitemap function.
- **Watch out:** thin duplicate pages hurt more than they help. Each row needs real, distinct content. See [SEO and analytics](14-seo-and-analytics.md).

### 4. Paid digital download with an expiring link

- **Ingredients:** a pricing plan or a one-time payment, `wix-members-backend`, a temporary URL generated for a private file through the Media Files API or an equivalent external storage API, a web module.
- **Sketch:** on request, verify entitlement → mint a URL that expires in minutes → return it → let the client redirect. Log every issuance with member ID and timestamp.
- **Watch out:** upload/import the file as private using the supported API. Media Manager files are public by default. Generate a per-file URL with an explicit expiration after checking entitlement; do not use a permanent archive-download URL for private distribution. Private files can still have content-derived thumbnails, so review those too. A recipient can retain a downloaded copy; expiration is not DRM. [Private files](https://dev.wix.com/docs/rest/assets/media/media-manager/files/private-files), [temporary download URLs](https://dev.wix.com/docs/api-reference/assets/media/media-manager/files/generate-file-download-url?apiView=SDK).

### 5. Quote / eligibility calculator

- **Ingredients:** pure pricing/rules module in `public/` or `backend/*.js`, a thin web method, optionally a `Leads` write on submit.
- **Sketch:** keep the rules in one tested pure function. Page collects inputs, backend runs the function, returns a number plus a breakdown. Capture the lead with the quote attached.
- **Watch out:** if pricing is sensitive, run it server-side so the logic is not in downloadable frontend code.

### 6. Scheduled digest or sync

- **Ingredients:** `backend/jobs.config` (cron), one exported backend function, `wix-data` query with pagination, `wix-fetch` or email out.
- **Sketch:** job wakes → queries the window of new/changed rows (mind the 50-item default, paginate) → sends the digest or pushes to the external system → marks rows processed.
- **Watch out:** use UTC configuration, plan-supported frequency, and bounded batches. Publish scheduler changes. Check the applicable execution limits rather than assuming an HTTP-request timeout; persist checkpoints and reconcile ambiguous external results. See [scheduled-work guidance](the-missing-manual-to-velo.md#events-and-scheduled-jobs).

### 7. Third-party API widget

- **Ingredients:** a web module wrapping the external API, the current Secrets API, short-TTL caching by a non-identity key where the data is public, a repeater or elements to render.
- **Sketch:** backend fetches and shapes the response → returns a small projection → page renders loading/empty/error/success. Cache public results briefly to stay under rate limits.
- **Watch out:** calls requiring a secret or trusted business rule belong on the backend. A public API may be called from the browser if its CORS policy permits it. Cache keys must not mix identities.

## Fun quick wins

Low risk, small code, satisfying. Good for a Friday or a demo.

- Personalized greeting / "welcome back" using `currentMember` and last-visit data.
- A "copy to clipboard" / share-link element with a little confirmation animation.
- Referrer- or UTM-aware hero copy (`wix-location` query params → swap text).
- A live counter (signups, spots left) backed by one collection field.
- Form field that validates and previews as you type (format a phone, check a promo code).
- A random or rotating testimonial / tip pulled from a small collection on `onReady`.
- Countdown to an event that flips the CTA when it hits zero.

Keep presentation optional and handle slow or failed loading. Promo-code eligibility, inventory availability, and other business decisions must be confirmed by the authoritative backend. Do not trust the browser clock or displayed counter for a transaction.

## Where the profit actually is

The revenue rarely comes from a clever widget. It comes from:

- **Instrumenting conversion.** Fire analytics events at the real funnel steps (view, start, submit, paid). You cannot improve what you do not measure. See [SEO and analytics](14-seo-and-analytics.md).
- **Deleting manual operations.** Form re-entry, exports, and stock queries may be candidates for automation; allow for exceptions, monitoring, and recovery. Count the hours, not the lines of code.
- **Reducing lead leakage.** Server-side validation, deduping, and reliable downstream sync mean fewer submissions lost to a typo or a failed integration.
- **Upsell and eligibility logic that changes often.** Custom code may suit rules that available configuration cannot express; weigh that flexibility against testing and maintenance costs.

## Anti-patterns that cost money

- One giant `utils.js` that becomes a second, unreviewable application.
- Page code that makes the authorization decision. It is a UX hint only; the server decides.
- Dataset bindings and independent `wix-data` writes with no explicit refresh or state-ownership policy.
- Caching used to hide an authorization bug: a cached response for one member reaching another.
- Business-critical event handlers with no idempotency. Design for duplicates; check the delivery contract for the particular source.
- Copying a product between sites without a maintenance plan. Apps provide an installation lifecycle; shared helpers and packages can also provide code reuse.
- Skipping the published-site smoke test because Preview looked fine.

## Ship-it checklist

- Authorization, trusted pricing, and transaction rules run on the backend; presentation logic stays with the UI.
- Inputs validated and normalized server-side; response is a projection.
- Repeated submits, retries, and duplicate events are idempotent.
- Secrets read only in backend via the current Secrets API; no keys in frontend or the repo.
- Loading, empty, error, and unauthorized states are real, not blank.
- Conversion / funnel analytics events fire at the steps that matter.
- Tested on the published site, not only Preview.
- Extracted pure logic has unit tests; see [Testing and quality](11-testing.md).
- Full launch pass: [Checklists](18-checklists.md).

## References

- [Velo API reference](https://dev.wix.com/docs/velo)
- [wix-members-backend](https://dev.wix.com/docs/velo/api-reference/wix-members-backend) · [Pricing Plans](https://dev.wix.com/docs/velo/api-reference/wix-pricing-plans-backend)
- [wix-data](https://dev.wix.com/docs/velo/api-reference/wix-data) · [wix-fetch](https://dev.wix.com/docs/velo/api-reference/wix-fetch) · [Secrets API](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/introduction)
- [Routers and dynamic pages](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/routers/about-routers) · [wix-seo](https://dev.wix.com/docs/velo/api-reference/wix-seo)
- [Scheduled jobs](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/recurring-jobs/about-scheduling-recurring-jobs)
- [Tracking & Analytics APIs](https://dev.wix.com/docs/velo/api-reference/wix-window-frontend/tracking)
