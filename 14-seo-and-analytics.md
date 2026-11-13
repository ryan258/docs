# SEO, discoverability, and analytics

For a public route, define what a visitor should find and what completed action you need to measure. For a private route, enforce access in the backend; an indexing directive is not authorization.

## Example: publish one useful guide route

Use this as a filled route specification. `example.invalid` is a placeholder domain, not a live destination.

| Field | Example | Check |
| --- | --- | --- |
| Route | `/guides/accessible-forms` | Stable slug; internal links reach this page |
| Page title | `Accessible forms: labels, errors, and recovery` | Unique and describes visible content |
| Description | `Build a form people can complete with a keyboard or voice, including clear errors and safe retries.` | Accurate summary; no unsupported promise |
| Main heading | `Build an accessible form` | Matches the task and makes sense in the heading order |
| Canonical | `https://example.invalid/guides/accessible-forms` | Actual production domain after replacement; no preview domain |
| Social image | A readable preview of the finished form | Relevant image and sensible crop |
| Retired URL | `/guides/forms-v1` | Redirects to the intended replacement after migration |

Set these through the page's supported SEO settings. Review defaults against the real route rather than copying the same title into every item. See [Wix page SEO settings](https://support.wix.com/en/article/customizing-your-pages-seo-settings-in-the-seo-panel) and [advanced settings](https://support.wix.com/en/article/seo-settings-advanced-seo).

For a CMS/dynamic route, check one valid item, a missing/deleted item, unusually long text, and missing media. Each item should receive its intended metadata and useful content. Structured data must describe visible content; it does not guarantee a rich result.

The SEO URL Mapping API changes the pattern for a supported business item type, such as all Stores product pages. A write changes the published site's URLs immediately. Set up redirects from old URLs as part of the change and verify the old and new routes on the actual domain. Wix labels the write methods Developer Preview. [Wix URL Mapping API](https://dev.wix.com/docs/api-reference/business-management/seo/url-mapping-v1/introduction), [Update URL Mapping](https://dev.wix.com/docs/api-reference/business-management/seo/url-mapping-v1/update-url-mapping).

## Headless response check

For a custom frontend, inspect the initial response as well as the hydrated page. Verify the title, description, canonical, public content, redirects, and missing-route status. Check the sitemap and robots behavior for the actual host. Keep preview URLs and private routes out of unintended indexing.

- With **Wix-managed Headless and Astro**, Wix injects dashboard SEO tags for published main pages and generates the sitemap from registered routes and business solutions. Business item pages need their own route registration and tag rendering. Inspect the released HTML because `wix dev` lacks the main-page injection. [Main page SEO](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/feature-guides/seo/manage-seo-for-main-pages), [Item page SEO](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/feature-guides/seo/add-seo-support-to-item-pages), [Generated sitemaps](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/feature-guides/seo/about-sitemaps-in-the-astro-integration).
- For **other Wix-managed frameworks and self-managed Headless**, render SEO tags in the initial HTML and serve the crawl files from your frontend. Wix site scripts can add dashboard tags in the browser after load, so check the initial response independently. [Wix Headless SEO without Astro integration](https://dev.wix.com/docs/go-headless/self-managed-headless/seo/about-seo-for-self-managed-headless-projects).
- When **migrating an existing Wix site to managed Astro**, map old routes to their replacements and check redirects, canonical URLs, generated crawl files, and analytics on the connected domain after the switch. [Wix Headless post-migration checklist](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/post-migration-checklist-wix-studio-and-editor-sites-to-headless).

This read-only request is an **operator example** for your own route. Replace the domain before running it; it does not test a Wix project in this repository.

```bash
curl --silent --show-error --include 'https://example.invalid/guides/accessible-forms'
```

Expected: the intended success status and document content for a public route. A `200` page that merely says “Not found” needs attention; a title inserted only after client rendering needs a framework-specific SEO review. Do not paste cookies, tokens, or private response bodies into shared logs.

## Example: measure a completed save

Choose one question: “How many searches were successfully saved?” Define the event before adding code.

```json
{
  "name": "search_saved",
  "properties": {
    "schema_version": 1,
    "surface": "guide_search",
    "environment": "development"
  }
}
```

Emit this only after a confirmed save, subject to the project's consent/privacy choices. The object is a provider-neutral contract, not a Wix analytics API call. Implement it with the chosen provider's documented adapter. Do not include the phrase, email, token, or full backend payload merely to count successful saves.

Wix's managed Astro integration provides `analytics.trackEvent()` from `@wix/site`. Local `wix dev` can exercise the call site. Wix delivers the event from a released site with a connected custom domain, so check delivery there and confirm the site's default consent settings before enabling tracking. [Wix Headless analytics events](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/feature-guides/track-analytics-events).

| Scenario | Expected measurement |
| --- | --- |
| Save rejected by validation | No `search_saved` event |
| Backend confirms save | One event for that confirmed action |
| User double-clicks or retries the same action | One business record; prevent/deduplicate duplicate completion reporting as needed |
| Analytics is blocked or fails | Save still succeeds; measurement may be absent |
| Tracking consent is declined | Follow the documented consent policy; do not force delivery |

Never equate an event count with stored records. If the provider cannot deduplicate completion events, label counts as approximate and compare them with backend outcomes. Separate a clicked button, an accepted request, and a completed action in both names and reports.

## Troubleshooting

| Symptom | Check first |
| --- | --- |
| Old title in a search result | Actual response/SEO settings, canonical, crawl/index state; a release does not force immediate recrawl |
| Preview host appears as canonical | Environment-dependent base URL and metadata configuration |
| Removed guide still reachable | Route/redirect behavior and source CMS record, not only navigation links |
| Saved-event count exceeds saved records | Duplicate handlers, retries, premature success events, environment mixing |
| Missing events with successful saves | Consent, blockers, provider configuration, failed event delivery |

Record the route, source version, response/event observed, and remaining uncertainty. Search-engine display and analytics delivery are external outcomes; a successful build cannot prove them.
