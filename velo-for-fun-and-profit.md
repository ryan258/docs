# Velo for fun and profit

This is the "what should I actually build with it" companion to [The missing manual to Velo](the-missing-manual-to-velo.md). That page covers how Velo works and where it bites. This page is about payoff: the builds where Velo earns its keep, the small ones worth doing for their own sake, and the ones that quietly lose money.

> Platform facts and links were reviewed on 2026-08-30. Availability of specific APIs and business solutions changes. The linked Wix documentation is the final authority.

## When Velo pays off

Velo is worth the code when **the value is in behavior a designer cannot drag onto a page**, and the data or identity already lives in Wix.

| Good fit | Why |
| --- | --- |
| Gating content or downloads behind membership or payment | Wix already owns members, pricing plans, and checkout; you add the rule |
| Turning a form into a real workflow (validate, enrich, route, notify) | Server-side logic and `wix-fetch` to your CRM/email/Slack |
| Many similar pages from one collection (SEO landing pages, listings) | One dynamic-page template + CMS rows scales to hundreds of URLs |
| Custom quote / booking / eligibility flows | Business rules that change often, owned in code not a plugin config |
| Scheduled back-office automation (digests, syncs, cleanup) | A `jobs.config` cron + one backend function replaces a manual chore |
| Personalizing a page by member, referrer, geo, or history | Small conditional rendering against data you already have |

## When Velo loses money

| Bad fit | Do instead |
| --- | --- |
| Rebuilding a general CMS / admin panel inside a site | Use the Wix dashboard, CMS, or a real app |
| Heavy compute, image/video processing, PDF generation at scale | External service called from a web module |
| Real-time (chat, live dashboards, presence) | Purpose-built service; Velo has no websockets you control |
| Large datasets with complex reporting queries | External database + API; keep Velo as the thin frontend |
| Anything needing sub-second cold-start guarantees | Not a Velo runtime property |
| Multi-tenant product logic | That is a Wix **app**, not site code — see [App development](05-app-development.md) |

If the interesting part of the system is not "a Wix site with rules," you are probably in the wrong lane. Re-check [Platform map](01-platform-map.md).

## Effort versus payoff

| Build | Rough effort | Typical payoff |
| --- | --- | --- |
| Members-only content gate | Hours | Recurring revenue, retention |
| Form → validated backend → CRM/email/Slack | Hours | Fewer lost leads, no manual re-entry |
| CMS-driven SEO landing pages | Days | Organic traffic that compounds |
| Paid digital download with expiring link | Hours to a day | Sell files without a store integration |
| Custom quote / eligibility calculator | Days | Higher-intent leads, less sales back-and-forth |
| Scheduled digest / sync job | Hours | Removes a standing manual task |
| Third-party API widget (reviews, inventory, pricing) | Hours to days | Trust signals, fewer "is this in stock" emails |

## Recipes

Each recipe is a shape, not a finished app. Keep page code thin, put the rule on the server, return a projection. See [Architecture](07-architecture.md) and [Security](09-security.md).

### 1. Gate content or a download behind membership

- **Ingredients:** `wix-members-backend` `currentMember`, a pricing-plan check if it is paid, a web module, the protected asset in the Media Manager or an external store.
- **Sketch:** page calls `getAsset()`; backend confirms the member and (if paid) an active plan, then returns a short-lived URL or the content projection. Never ship the asset URL to a page that has not passed the check.
- **Watch out:** a members-only *page* still serves its frontend source to anyone. The gate must be the web method, not page visibility.

### 2. Form to workflow

- **Ingredients:** an editor form or custom inputs, one `.web.js` method, `wix-fetch` to the downstream system, `getSecret` for the API key, `wix-data` if you also store the submission.
- **Sketch:** validate and normalize server-side → dedupe on email or an idempotency key → write the record → call CRM/email/Slack → return a safe success or a user-correctable error.
- **Watch out:** the browser submit can fire twice. Deduplicate. Downstream calls fail; decide what "submitted but not synced" looks like and log it.

~~~js
// backend/leads.web.js
import { Permissions, webMethod } from 'wix-web-module';
import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';
import wixData from 'wix-data';

export const submitLead = webMethod(Permissions.Anyone, async (raw) => {
  const email = String(raw?.email ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email');

  const existing = await wixData.query('Leads').eq('email', email).limit(1).find();
  if (existing.items.length) return { ok: true, deduped: true };

  const lead = await wixData.insert('Leads', { email, source: raw?.source ?? 'site', status: 'new' });

  try {
    const key = await getSecret('CRM_API_KEY');
    await fetch('https://crm.example.com/v1/contacts', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ email, externalId: lead._id }),
    });
    await wixData.update('Leads', { ...lead, status: 'synced' });
  } catch (err) {
    console.error('CRM sync failed', lead._id, err); // check Site Monitoring
  }
  return { ok: true };
});
~~~

### 3. CMS-driven SEO landing pages

- **Ingredients:** one collection (one row per page), a dynamic page template `/topic/{slug}`, per-item SEO fields, `wix-seo` if you use a router instead.
- **Sketch:** author rows, not pages. The template binds title, body, image, and meta from the current item. Add a sitemap entry pattern so search engines find them.
- **Watch out:** thin duplicate pages hurt more than they help. Each row needs real, distinct content. See [SEO and analytics](14-seo-and-analytics.md).

### 4. Paid digital download with an expiring link

- **Ingredients:** a pricing plan or a one-time payment, `wix-members-backend`, a signed/expiring URL from your storage (or Wix media token), a web module.
- **Sketch:** on request, verify entitlement → mint a URL that expires in minutes → return it → let the client redirect. Log every issuance with member ID and timestamp.
- **Watch out:** do not store the raw file URL in a collection a member can query. Issue on demand only.

### 5. Quote / eligibility calculator

- **Ingredients:** pure pricing/rules module in `public/` or `backend/*.js`, a thin web method, optionally a `Leads` write on submit.
- **Sketch:** keep the rules in one tested pure function. Page collects inputs, backend runs the function, returns a number plus a breakdown. Capture the lead with the quote attached.
- **Watch out:** if pricing is sensitive, run it server-side so the logic is not in downloadable frontend code.

### 6. Scheduled digest or sync

- **Ingredients:** `backend/jobs.config` (cron), one exported backend function, `wix-data` query with pagination, `wix-fetch` or email out.
- **Sketch:** job wakes → queries the window of new/changed rows (mind the 50-item default, paginate) → sends the digest or pushes to the external system → marks rows processed.
- **Watch out:** the job shares the normal request time budget. If the work is large, checkpoint progress in a collection and resume next run.

### 7. Third-party API widget

- **Ingredients:** a web module wrapping the external API, `getSecret`, short-TTL caching by a non-identity key where the data is public, a repeater or elements to render.
- **Sketch:** backend fetches and shapes the response → returns a small projection → page renders loading/empty/error/success. Cache public results briefly to stay under rate limits.
- **Watch out:** never call the third-party API from page code — key leak plus CORS. Cache keys must not mix identities.

## Fun quick wins

Low risk, small code, satisfying. Good for a Friday or a demo.

- Personalized greeting / "welcome back" using `currentMember` and last-visit data.
- A "copy to clipboard" / share-link element with a little confirmation animation.
- Referrer- or UTM-aware hero copy (`wix-location` query params → swap text).
- A live counter (signups, spots left) backed by one collection field.
- Form field that validates and previews as you type (format a phone, check a promo code).
- A random or rotating testimonial / tip pulled from a small collection on `onReady`.
- Countdown to an event that flips the CTA when it hits zero.

Keep these on the page layer, keep them optional, and make sure the page still works with JavaScript slow or an element missing.

## Where the profit actually is

The revenue rarely comes from a clever widget. It comes from:

- **Instrumenting conversion.** Fire analytics events at the real funnel steps (view, start, submit, paid). You cannot improve what you do not measure. See [SEO and analytics](14-seo-and-analytics.md).
- **Deleting manual operations.** Every form re-typed into a CRM, every weekly export, every "is it in stock" email is a job a small backend function removes. Count the hours, not the lines of code.
- **Reducing lead leakage.** Server-side validation, deduping, and reliable downstream sync mean fewer submissions lost to a typo or a failed integration.
- **Upsell and eligibility logic that changes often.** Rules you can edit in code beat plugin configuration when the business tweaks them monthly.

## Anti-patterns that cost money

- One giant `utils.js` that becomes a second, unreviewable application.
- Page code that makes the authorization decision. It is a UX hint only; the server decides.
- Datasets and `wix-data` mixed on the same page — hours lost to "why won't it refresh."
- Caching used to hide an authorization bug: a cached response for one member reaching another.
- Business-critical event handlers with no idempotency. Webhooks and Wix events fire more than once.
- Building for multi-site reuse in site code. That is an app.
- Skipping the published-site smoke test because Preview looked fine.

## Ship-it checklist

- The rule that creates the value runs on the server, not the page.
- Inputs validated and normalized server-side; response is a projection.
- Repeated submits, retries, and duplicate events are idempotent.
- Secrets read only in backend via `getSecret`; no keys in frontend or the repo.
- Loading, empty, error, and unauthorized states are real, not blank.
- Conversion / funnel analytics events fire at the steps that matter.
- Tested on the published site, not only Preview.
- Extracted pure logic has unit tests; see [Testing and quality](11-testing.md).
- Full launch pass: [Checklists](18-checklists.md).

## References

- [Velo API reference](https://dev.wix.com/docs/velo)
- [wix-members-backend](https://dev.wix.com/docs/velo/api-reference/wix-members-backend) · [Pricing Plans](https://dev.wix.com/docs/velo/api-reference/wix-pricing-plans-backend)
- [wix-data](https://dev.wix.com/docs/velo/api-reference/wix-data) · [wix-fetch](https://dev.wix.com/docs/velo/api-reference/wix-fetch) · [wix-secrets-backend](https://dev.wix.com/docs/velo/api-reference/wix-secrets-backend)
- [Routers and dynamic pages](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/routers-and-dynamic-pages/about-routers) · [wix-seo](https://dev.wix.com/docs/velo/api-reference/wix-seo)
- [Scheduled jobs](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/scheduled-jobs)
- [Tracking & Analytics APIs](https://dev.wix.com/docs/velo/api-reference/wix-window-frontend/tracking)
