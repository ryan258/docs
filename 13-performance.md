# Performance and resilience

Performance is the time and effort a real visitor spends waiting, interacting, and recovering. Optimize the critical user task, not only a synthetic score.

## Set project budgets

Before implementation, define budgets for the primary routes:

| Budget | Example starting policy | Measure |
| --- | --- | --- |
| First meaningful view | Critical content and primary action appear quickly on target mobile hardware | Real-user data and representative throttled runs |
| Interaction | Primary controls respond without avoidable blocking work | Interaction latency and long-task evidence |
| Layout stability | Content does not jump when images, fonts, or third parties load | Cumulative layout shift and visual recordings |
| JavaScript | Ship only the code needed for the route | Transfer size, parse/execute time |
| Third parties | Every script has a performance owner and a removal decision | Network waterfall and feature comparison |
| Backend | User-facing Wix/provider calls have documented latency and timeout budgets | Logs, traces, and error rates |

These are starting policies, not Wix guarantees. Measure a baseline, choose thresholds for the audience, and record exceptions.

## Wix-specific practices

Follow the current [Wix site performance best practices](https://support.wix.com/en/article/site-performance-best-practices). In particular:

- keep above-the-fold content focused and light;
- optimize image dimensions and formats for their actual use;
- avoid unnecessary custom fonts;
- keep animation and heavy media below the critical path where possible;
- limit lightboxes and expensive interactive elements;
- review loading order;
- minimize third-party code;
- check mobile content separately;
- use the Wix performance dashboard and real-user metrics when available.

Platform optimization does not replace page-level decisions. A light template can still be slowed by an unbounded query, a waterfall of backend calls, or a blocking external script.

## Frontend patterns

- render a useful shell while data loads;
- avoid fetching data the user cannot see or use;
- parallelize independent requests;
- defer non-critical widgets;
- reserve image and media space to reduce layout shift;
- paginate long lists;
- avoid repeated queries caused by reactive state;
- debounce search and autosave;
- cancel or ignore stale requests;
- do not block the main task on analytics or secondary personalization.

## Backend and data patterns

- query only the fields and records needed;
- use explicit limits, filters, and indexes;
- avoid N+1 calls;
- cache only safe, correctly scoped data;
- set timeouts for third-party requests;
- bound retries;
- move slow work to an asynchronous process where the product allows it;
- make progress and failure observable;
- return partial results only when the UI can explain them.

## Performance testing

Use a repeatable matrix:

- a representative public route;
- a data-heavy route;
- a member or dashboard route;
- a critical mutation;
- a cold and warm run;
- narrow mobile and desktop;
- slow network and ordinary network;
- third-party enabled and intentionally blocked;
- preview and production.

Capture the URL, source version, browser, device emulation, network profile, run date, key metrics, waterfall, and known variance.

## Performance regression triage

When performance drops:

1. compare against the last known-good source version;
2. separate frontend, backend, Wix API, content, and third-party time;
3. identify whether the regression is universal or route/data-specific;
4. reproduce on a real device or representative profile;
5. remove or defer the largest avoidable cost;
6. add a regression check or budget;
7. record the cause and fix in the release notes.

Do not “fix” a performance failure by hiding content, weakening accessibility, disabling required analytics consent, or adding an unbounded cache.

## Resilience

For a critical action, define:

- loading and timeout behavior;
- retry behavior;
- duplicate-submission behavior;
- offline or interrupted behavior;
- provider outage behavior;
- operator recovery;
- user communication.

The fastest page that loses a submission silently is not a high-quality page.

