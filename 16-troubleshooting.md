# Troubleshooting and diagnosis

Write one sentence before changing code: “On **this environment**, **this identity** does **this action**, expects **this result**, and observes **this failure**.” Then identify the failing boundary.

## Start with one failing request

A useful example:

```text
On orders-test at source 7c42e19, member-a opens /my-orders.
Expected: member-a's two fixture orders.
Observed: permission error; no rows rendered.
Evidence: backend request TEST-104 at 14:20 UTC; anonymous call also denied.
Next check: method permission and collection access for the actual member identity.
```

This is an illustrative report. Use redacted request/record identifiers, not a full collection export or unfiltered provider payload.

## Symptom guide

| Symptom | Check first | Avoid |
| --- | --- | --- |
| Works in editor, fails live | Published source, caller, live collection/configuration and logs | Repeated publishes without comparing environments |
| CLI preview ignores endpoint changes | Site CLI uses live HTTP functions; see [endpoint matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments) | Treating the preview as a test of local HTTP functions |
| UI shows old behavior | Source chosen for publish, editor sync/UI version, deployed revision | Assuming a local edit reached the destination |
| Permission denied | Actual caller, web-method permission, collection/API permission | Making the method or collection public to remove the error |
| Another member's data appears | Backend owner filter, caller-derived identity, returned field projection | Filtering private data only after it reaches the browser |
| Secret missing | Destination's secret store, exact name, environment mapping | Copying a secret into page code or logs |
| App or managed Headless preview shows old behavior | Build output used for the preview, selected site, and whether the URL is for a fresh snapshot | Expecting a previously created preview to update itself |
| App CLI opens the wrong site | `wix dev-site current` and the setting it reports. Check `.env.local` for a `WIX_SITE_ID` override | Relying on a familiar site name or assuming the terminal environment overrides it |
| App works on only one site | Installation key, required Wix solution, permissions and configuration | Caching installation state under a global key |
| Headless 401/403 | Identity type, token expiry/audience, operation permissions, redirect configuration | Retrying with an admin secret in the browser |
| Duplicate writes/events | Request/action key, event ID, stored receipt, side-effect log | Replaying a possibly completed action without checking state |
| Provider times out | Request ID, duration, bounded retries, provider status | Assuming the timed-out action never happened |
| Search/list misses one record | That record's visibility, query filter, pagination, pending write | Exporting every private record to find one missing item |
| Search/list displays an old response | Request order and stale-response handling | Increasing retries |
| Slow page or moving layout | Media sizes, query waterfall, third-party cost, reserved space | Optimizing an unrelated route or a single score |

For command details, see [CLI preview](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/preview) and [app development site selection](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/app-only/dev-site).

## Find Studio Two errors and logs

- **Code issue:** Open **Problems** in the Code tab for diagnostics. A type error can still leave the site prepared.
- **Build failed:** If the editor shows **Couldn't prepare site**, check **Site code errors**. Fix a reported syntax error or missing import, then verify preparation and the changed task before publishing.
- **Runtime issue:** Check the browser console for frontend errors and **Developer Tools → Logs** in the site dashboard for monitoring-client entries and uncaught backend errors. The Code tab's **WIX LOGS** panel shows development activity such as build and sync. Dashboard Logs keeps entries for 24 hours, so save redacted IDs and timestamps while they are available.

[Studio Two error guide](https://dev.wix.com/docs/studio-two/test-your-site/about-errors-in-studio-two) · [Studio Two logs guide](https://dev.wix.com/docs/studio-two/test-your-site/work-with-logs/about-logs-in-studio-two)

## Diagnose a permission failure

1. Capture the exact operation, caller identity class, environment, redacted resource ID, and timestamp.
2. Inspect the method/API permission and the collection permission for that operation.
3. Repeat with the allowed identity, anonymous/lower-privilege caller, and another member/site as appropriate.
4. If backend elevation is required, verify caller authorization and output filtering before the elevated operation. Elevation is not an identity check.
5. Repeat the original request after the smallest correction. Confirm the denied identities still fail.

See [Security](09-security.md) for the boundary rules. Missing visibility can be correct authorization, an incorrect filter, or genuinely absent data; distinguish them before fixing the query.

## Find Git/editor drift without losing work

Read-only Git commands from the **affected code repository**:

```bash
git status --short
git branch --show-current
git log -1 --format='%h %s'
git diff --stat
```

These show local changes, current branch, local HEAD, and unstaged diff size. They do not prove the remote/default branch or the live site matches local HEAD. Compare them with the release record and editor history, then identify dashboard-only UI, schema, permission, or configuration changes. Preserve local work before any reconciliation. Do not disconnect Git or delete the checkout as a first response.

## Handle a provider outage

Keep the user's input and a stable pending/unavailable state. Stop needless retries, keep redacted correlation/provider request IDs, and check whether the provider already accepted the action. Resume only work with defined duplicate behavior. If the action may have completed, reconcile its record before retrying. If work is queued, record the affected IDs and the deliberate replay procedure.

## Escalate with a small evidence packet

Copy this filled example and replace only the relevant facts:

```text
Problem: saved search returns 403 for signed-in member-a on search-test
Expected/observed: one private save / denied before collection write
Source/time: 7c42e19; 2026-10-26 14:20 UTC; request TEST-104
Reproduce: sign in as test member → /search → enter "forms" → Save search
Changed recently: web-method permission; no collection/schema change
Checked: anonymous denied; correct site selected; secret not involved
Impact: test environment only; no record or provider action created
Need: confirm intended member permission, then repeat allowed/denied checks
```

Keep secrets, tokens, personal data, and full provider payloads out of the packet. State what is unknown instead of guessing at a cause.
