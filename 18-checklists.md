# Checklists

Use the smallest list that fits the current job. Attach evidence or an explicit unknown to each material result; a checked box alone cannot explain how to resume.

## Before coding

- [ ] State one useful outcome and one concrete acceptance example.
- [ ] Choose the lane and find the actual site/project and source of truth.
- [ ] Identify private data, caller identity, and any external side effect.
- [ ] Define the failure/retry behavior and one denied case where access matters.
- [ ] Write only the decisions needed for this change in a [feature brief](templates/feature-brief.md).

**Example:** “A signed-in member can reopen their own saved search. Another member cannot read it. A failed save keeps the phrase available for retry.”

## Before a focused check

- [ ] Use the affected environment, source revision, and synthetic fixture.
- [ ] Select the smallest check that proves the changed behavior; see [Testing](11-testing.md).
- [ ] For a read/write boundary, exercise the allowed caller and relevant denied caller.
- [ ] For an action with side effects, repeat the request/event and inspect the stored outcome.
- [ ] Record the observed result and what the check cannot prove.

**Example:** a pure input test cannot establish collection permission. A site CLI preview cannot test local HTTP-function changes.

## Wix recipe acceptance

Use the checks for your recipe. Use synthetic data in a development site or disposable example project. The member test uses an owner-approved publication of the development site. Production verification belongs to its own release record.

- [ ] **Greeting.** In editor Preview, enter `Ryan` and press **Greet**. Expect `Hello, Ryan.` and an enabled button. Clear the field and expect `Enter 1–40 characters.` [Greeting recipe](04-site-development.md#build-a-button-that-calls-the-backend)
- [ ] **Private member orders.** On the published development site, open **My orders** in separate sessions as A, as B, and signed out. A sees A’s two rows with `$24.50 USD` first. B sees only B’s `$99.00 USD` row. Signed-out access is denied at the page and web method. A member with no rows sees `No orders yet.` and can refresh. Check that the response contains only `id`, `total`, and `status`. [Private orders recipe](the-missing-manual-to-velo.md#working-example-private-member-orders)
- [ ] **Locations app, if using the app recipe.** On the selected development site, open **Business locations** and select **Refresh locations**. Expect that site’s test locations and a first-page limit of 50. The empty fixture shows `No locations returned…`. With the error fixture, **Retry** replaces the error with `Retry recovered`. [Locations recipe](05-app-development.md#check-loading-empty-error-and-retry-states)
- [ ] **Reading list, if using managed Astro.** Open the local `/reading-list` route signed out with the test project's Wix CMS seeded. Expect HTTP 200 and `Wix Astro integration` before `Astro on-demand rendering`. With empty test data, expect `No reading links yet.` with HTTP 200. An invalid test link should show `Reading list unavailable` with HTTP 503. Correct it and select **Refresh reading list** to see the list return. [Reading-list recipe](06-headless.md#start-it-and-check-filled-empty-and-error-results)
- [ ] **Access and recovery.** Repeat the chosen task by keyboard and with the voice or assistive tools you use. Expect visible focus, controls you can invoke by their visible labels, and status changes you can read or hear without moving focus. [Accessibility task checks](12-accessibility.md)

Record the site or project, source revision, identity, and observed result. Mark any unrun case pending in the verification record.

## Before publishing or releasing

- [ ] Confirm the exact owner-approved action, source, and destination.
- [ ] For a CLI app or Headless release, rebuild after the final source edit and record which build you reviewed. For a static Headless upload, review the files locally before uploading them to publish.
- [ ] For a Studio Two import, review the exported changes and which pages will be replaced or removed. After import, confirm the editor has prepared the site and test the changed task before publishing.
- [ ] List changed code/UI/data/permission/configuration state; leave unrelated categories out.
- [ ] Keep the relevant acceptance, failure, and accessibility evidence together.
- [ ] Name a specific recovery action and its data/provider consequences; mark untested recovery unverified.
- [ ] Save the [release record](templates/release-record.md), then verify the released critical path and relevant logs.

See [Release operations](15-release-operations.md) for the procedure and [CLI reference](20-cli-quick-reference.md) for lane-specific commands. For app distribution, use the current [official app checks guide](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-checks-and-testing-guide) in addition to the checks relevant to the change.

## When a task fails

- [ ] Capture the failing action, environment, identity, source, timestamp, and redacted request ID.
- [ ] Stop harmful new writes or repeated side effects where possible.
- [ ] Diagnose the boundary using [Troubleshooting](16-troubleshooting.md).
- [ ] Recover source, data, and provider effects as separate concerns.
- [ ] Repeat the critical task and denied case; save a short [incident note](templates/incident-report.md).

## Before stopping

- [ ] Save useful work and the next concrete action.
- [ ] State unresolved checks, unknown behavior, and any external action still under owner control.
- [ ] Point to the source/evidence needed to resume without repeating setup.

**Example:** “Saved-search read is implemented; A/B fixture check passes on search-test. Next: failed-save keyboard check. Published behavior unknown; no publish performed.”

## Maintenance triggered by a change

| Trigger | Focused follow-up |
| --- | --- |
| Wix/SDK/CLI upgrade | Recheck changed APIs/commands and the affected flow; record the version |
| Auth/schema/permission change | Repeat allowed/denied and compatibility checks |
| New third-party code | Measure the affected route and task with/without it |
| Broken command or link | Fix the entry readers actually use; check its nearby example |
| Data/recovery change | Verify the permitted backup/restore or correction path |
| Repeated incident | Add a regression check for the demonstrated cause |

Use [Accessibility](12-accessibility.md), [Performance](13-performance.md), and [SEO/analytics](14-seo-and-analytics.md) when those surfaces changed. They supply task protocols and examples; they are not mandatory extra suites for every edit.
