# Performance and resilience

Measure one slow task before changing it. “The search page takes six seconds before results appear on a phone” is actionable; “make the site faster” is not.

## Capture a comparable baseline

Use the same route, data, browser/profile, cache state, and network setting before and after the change. Record whether the result is a local lab run or real-user field data.

```text
Task: load /guides and search for "forms"
Source/environment: 7c42e19; development site; 50 synthetic guide records
Profile: same phone/browser and network; cold page load
Baseline: results visible 4.2s; 3 sequential backend reads
Change: combine the required read; defer the optional recommendation panel
Target: remove the two unnecessary waits; preserve errors and keyboard use
Evidence: before/after timing notes and request waterfall
```

The numbers above illustrate a record; they are not measurements of this handbook or a Wix site.

For real-user targets, Google's current Core Web Vitals guidance uses LCP ≤2.5 seconds, INP ≤200 milliseconds, and CLS ≤0.1 at the 75th percentile, considered separately for mobile and desktop. A single lab run cannot establish those field results. See [Web Vitals](https://web.dev/articles/vitals).

## Find the largest avoidable wait

| Evidence | Likely next change | Verify after changing |
| --- | --- | --- |
| Large hero image dominates initial loading | Use appropriate dimensions/format; keep critical content light | Readable image, same task, lower transfer/load cost |
| Content jumps after media loads | Reserve its layout space | No new clipping at narrow widths or enlarged text |
| Several independent reads run in sequence | Run them together when both are required | No duplicate calls; meaningful failure handling |
| One query per list item | Fetch needed records together; bound/paginate the list | Same permitted rows and ordering; bounded request count |
| Third-party widget delays the main task | Defer or remove the optional widget | Core path still succeeds when the widget fails |
| Old search response replaces new results | Ignore stale responses | Slow first search cannot overwrite the second |

Follow [Wix's performance practices](https://support.wix.com/en/article/site-performance-best-practices) for platform-specific media, fonts, animation, and page choices. Do not cache member or installation data under a shared public key.

In Studio Two, use the Site SDK's Rendering Context API when a React component needs to tell server rendering from browser rendering. Wix also provides Above the Fold and Head Appender APIs for loading critical resources early. Compare the same task and request timings after changing what loads first. [Wix Site SDK rendering and performance](https://dev.wix.com/docs/sdk/site-sdk/rendering-and-performance/introduction).

## Example: avoid a request waterfall

This ordinary JavaScript pattern applies only when two reads are independent and both are required. The functions stand for your existing adapters; it does not introduce a Wix API.

```js
export async function loadSearchPage({ getGuides, getCategories }) {
  const [guides, categories] = await Promise.all([
    getGuides(),
    getCategories()
  ]);
  return { guides, categories };
}
```

Expected: both reads start without waiting for each other; rejection from either makes the combined operation fail. Use separate handling for an optional panel so its outage cannot block required results. Do not parallelize operations whose order matters, such as creating a record and then using its ID.

## Example: ignore stale search results

The counter belongs to one page/component instance. Use it around your real read adapter and UI renderer.

```js
export function createSearch({ findGuides, showResults, showError }) {
  let latest = 0;
  return async function search(phrase) {
    const request = ++latest;
    try {
      const results = await findGuides(phrase);
      if (request === latest) showResults(results);
    } catch (error) {
      if (request === latest) showError('Search failed. Try again.');
    }
  };
}
```

Check it by delaying the first request, starting a second, then allowing the first to finish. Only the second result should appear. This ignores obsolete responses; it does not cancel requests, reduce query cost, or authorize callers. Debounce if appropriate and bound the backend query separately.

## Keep interrupted actions recoverable

For a save, preserve input during loading, keep the button state understandable, and show a stable failure message. Use timeouts and bounded retries at the adapter layer. A timed-out request may already have written data: check its saved status/action key before submitting it again. Retry an external side effect only when its duplicate behavior is defined. See [Integrations](10-integrations.md) and [Troubleshooting](16-troubleshooting.md).

Studio Two uses fixed backend compute limits. Wix currently documents a 60-second limit per request and regular instance recycling. Keep the handler bounded and store action status in persistent storage so a new instance can recover it. [Studio Two backend compute limits](https://dev.wix.com/docs/studio-two/maintain-your-site/scale-your-site/about-backend-compute-limitations).
