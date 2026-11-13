# Release record: private saved-search page

Copy this example as a plan, then replace planned actions with actual results. Synthetic values below do not establish a release or a passing check.

```text
Status: planned; no production action performed
Lane/destination: Wix site; search-production (confirm actual site ID)
Source: reviewed commit 7c42e19; editor UI version recorded separately
Change: member-owned saved-search list; no schema/backfill change
Other state: member method and collection permissions reviewed
Evidence: link focused development-site checks and their limitations
Release action: owner-approved site publish; record chosen source and result here
Smoke: member reopens saved fixture; anonymous denied; failed-save input retained
Observed result: pending
Recovery: disable saving; preserve records; restore known-good compatible source
Recovery status: documented, unverified in production
Next: owner confirms destination and source before publication
```

If the workflow publishes local code, record where to recover the published source. For a CLI app or Headless release, record the build output reviewed and the released app version or site URL. For an app update, record the release type and which installed version you exercised. Keep recovery details for data and external effects alongside the source recovery. [Release operations](../15-release-operations.md)
