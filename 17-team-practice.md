# Team practice and documentation

Make it easy for the next person—including your returning self—to find the project, start it, understand one request, and resume safely. One person can own the whole project; a large role chart is unnecessary.

## Keep the entry point short

A useful project README answers these questions in its first screen:

```text
Purpose: save and reopen my own useful guide searches
Lane: Wix site; code in this repository; layout in Wix Studio
Start: use this site's verified local command; see CLI quick reference
Test site: search-test; synthetic member-a/member-b fixtures only
Critical task: /search → Save search → reopen after refresh
Private boundary: backend derives member ID; SavedSearches is not a public list
Release: owner-controlled site publish from recorded source
Resume: finish failure-state keyboard check; last evidence linked below
```

This is an example structure, not configuration for a live site. Add the real local command, project/site IDs, relevant logs, secret **names** and storage location, plus a working evidence/recovery link. Do not put secret values in the README.

Keep the environment and source details in one [project inventory](templates/site-inventory.md). For CLI work, save the package runner, Wix CLI and Node versions used, and the site or project ID. For app work, include how to verify the effective development site when you return. [CLI quick reference](20-cli-quick-reference.md)

## Write changes around the resulting behavior

Example review note:

```text
Members now reopen only their own saved searches after refresh.
The backend derives the owner from the signed-in caller and returns id/title only.
Evidence: A/B isolation, anonymous denial, empty list, and failed-save retry on search-test.
Still unknown: published-site configuration; no publication performed.
Recovery: disable saving before restoring old code if its schema is incompatible.
```

For a visual change, add a useful image or task recording when available. For a permission, schema, provider, or release-path change, explain that specific boundary and its evidence. Do not add ten irrelevant review categories to a one-line copy change.

## Record decisions that would otherwise be re-litigated

Use a [decision record](templates/decision-record.md) for a choice with a real alternative or recovery cost: lane/hosting, identity flow, system of record, collection access, provider, release method, or incompatible migration. A small example:

> Use the existing Wix member identity for saved searches. The backend derives the owner. A separate account system adds setup and recovery work without helping this personal workflow. Revisit if data must be shared between different identity systems.

Keep the decision, reason, rejected alternative, and revisit trigger. You do not need a record for every variable name.

## Leave a return point

At a natural stop, save four lines in the project's existing note or handoff:

```text
Done: private read path and synthetic A/B test matrix documented.
Next: check that failed-save input remains usable with keyboard and voice.
Unknown: no live-site check; production publish not authorized.
Resume from: docs/11-testing.md and the saved development-site evidence.
```

A saved local result can be the completed outcome. Publication is a separate deliberate action. Do not introduce an extra daily ceremony or require the user to retype context that is already saved.

## Update documentation when the workflow changes

Fix the owning instruction after a command, permission, schema, environment, or recovery procedure changes. Remove a stale instruction where readers will encounter it; adding a correction in a distant changelog is insufficient. Record current official references for changeable platform claims, and label unverified assumptions.

For a new contributor, use one small test-site task: trace the page/route to its backend read, identify the caller and permission, run one allowed and denied case, and find the release/recovery instructions. Missing steps discovered during that task become documentation fixes.
