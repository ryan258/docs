# Feature brief: save my guide searches

Copy this filled example and replace the relevant facts. All names and expected outcomes below are illustrative.

```text
Outcome: I can reopen a useful guide search without dictating it again.
Lane/surface: Wix site; /search page; backend saved-search web method.
Scope: save and list my phrases; no shared accounts or public directory.
Data: SavedSearches; owner derived from signed-in member, phrase, created time.
Boundary: member-only method; each read/write scoped to the current member.
Browser output: id and phrase only; no private profile or internal notes.
Happy path: enter phrase → Save search → confirm → refresh → reopen phrase.
Failure: empty phrase rejected; failed save keeps input; duplicate retry is safe.
Acceptance: A sees A; B sees B; anonymous denied; empty list is understandable.
Accessibility: complete save/reopen/error recovery by keyboard and voice labels.
Focused checks: input boundaries; member isolation; retry; failed-save task.
Recovery: disable saving; preserve records; restore only compatible code.
Next: implement backend boundary on search-test with synthetic records.
```

Add a provider, schema migration, SEO, or measurement line only when this change introduces one. Link the resulting evidence from the [release record](release-record.md).
