# SEO, discoverability, and analytics

SEO is the combination of crawlable technical structure, useful content, clear intent, and trustworthy measurement. Analytics is a product contract, not a dump of every click.

## SEO ownership

For each indexable route, assign an owner for:

- title and description;
- URL slug;
- canonical URL;
- index/follow behavior;
- heading structure;
- image alternative text;
- structured data;
- internal links;
- social sharing metadata;
- redirects and retired URLs;
- sitemap and Search Console checks.

Wix supplies defaults for many pages, but defaults must be reviewed against the actual content and product intent. See [Customizing page SEO settings](https://support.wix.com/en/article/customizing-your-pages-seo-settings-in-the-seo-panel) and [Advanced SEO](https://support.wix.com/en/article/seo-settings-advanced-seo).

## Route checklist

For every public page:

- the URL is stable and human-readable;
- the title is unique and describes the page;
- the description is useful to a searcher;
- the canonical points to the intended primary URL;
- duplicate or tracking-parameter paths are handled;
- the page has one clear primary heading;
- the content is available without an unnecessary interaction barrier;
- images have correct alt text;
- internal links use descriptive text;
- the page returns a correct not-found or redirect response when applicable;
- social title, description, and image are intentional;
- structured data matches visible content and is validated;
- authenticated or private pages are not unintentionally indexable.

Structured data can improve eligibility for rich results; it does not guarantee that a search engine will display one.

## Dynamic and CMS pages

For dynamic pages, test:

- a valid record;
- a missing record;
- an unpublished record;
- a deleted record;
- a record with long or unusual content;
- a record with missing media;
- a record with unsafe or unexpected user content;
- canonical and social metadata per item;
- pagination or infinite-scroll discoverability.

Do not let a CMS record create a public URL without a plan for ownership, moderation, SEO, accessibility, and deletion.

## Headless SEO

For Headless, verify the actual response sent to crawlers:

- server-rendered or generated content where required;
- metadata in the document, not only after client hydration;
- canonical, robots, and sitemap behavior;
- redirects and error status codes;
- structured data;
- authenticated routes excluded from indexing;
- preview and production domains handled correctly.

## Analytics governance

Define an event taxonomy before instrumenting:

~~~text
Event name:
Business question:
Trigger:
Required properties:
Optional properties:
Identity/consent requirement:
PII policy:
Owner:
Dashboard/report:
Retention:
~~~

Rules:

- use stable, human-readable event names;
- send the event once per business action;
- do not include passwords, tokens, full email bodies, payment data, or unnecessary PII;
- document anonymous/member/account identity handling;
- respect applicable consent choices;
- use server-side confirmation for completed mutations where possible;
- distinguish attempted, accepted, completed, and failed events;
- version a breaking schema change;
- test events in preview and production.

## Launch measurement

Before launch, verify:

- analytics property and environment are correct;
- consent behavior is correct;
- critical conversion events fire once;
- failure events are visible;
- internal/test traffic is identifiable or excluded;
- dashboards have an owner;
- alert thresholds are meaningful;
- no secret or sensitive payload is sent.

After launch, compare analytics with backend logs and business records. A high event count does not prove that the action completed.

