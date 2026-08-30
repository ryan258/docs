# Professional workflow

Professional Wix development is a controlled lifecycle. The editor, code repository, dashboard, CMS, and external services are all parts of the system. A change is safe only when its full path is understood.

## The six stages

### 1. Discover

Write down:

- the user and business outcome;
- the current behavior and the desired behavior;
- the chosen Wix lane;
- the identities involved: anonymous visitor, member, Wix user, app installation, or admin;
- the data read and written;
- external services and failure behavior;
- accessibility, SEO, performance, privacy, and analytics requirements;
- the production owner and the recovery path.

The output is a small [feature brief](templates/feature-brief.md), not a list of implementation tasks without context.

### 2. Design

Design the boundary before the UI:

- what runs in the browser and what must remain server-side;
- which collection or Wix business API is authoritative;
- which callable functions are exposed and to whom;
- what input and output contracts look like;
- which actions are idempotent;
- how unauthorized, duplicate, stale, and unavailable states appear;
- how the change is previewed, released, monitored, and recovered.

Record meaningful choices in a [decision record](templates/decision-record.md).

### 3. Build

Build in a small branch or change set. Keep the change reviewable:

- one coherent purpose per pull request;
- no secrets, tokens, or production data in source;
- no unexplained permission broadening;
- no untracked editor-only change that changes the behavior under review;
- no new external dependency without ownership, license, security, and update notes.

Prefer small pure functions and explicit contracts around Wix APIs. Platform calls are integration boundaries; keep them easy to mock or replace in tests.

### 4. Verify

Verify more than the happy path:

- expected user flows;
- empty, duplicate, stale, malformed, and oversized inputs;
- anonymous and authenticated identities;
- denied permissions;
- failed Wix and third-party calls;
- slow calls and retries;
- mobile, keyboard, screen-reader, zoom, and reduced-motion behavior;
- SEO metadata and canonical URLs;
- real-user performance on representative pages;
- deployment from the actual production source.

Record the evidence, not just “tested.”

### 5. Release

Before release, confirm:

- the source being shipped is identified;
- the UI/editor version and code version are compatible;
- schema, content, secrets, permissions, and environment configuration are ready;
- migrations and backfills are safe and reversible;
- smoke tests are written and have an owner;
- monitoring and support instructions are available;
- rollback or forward-fix instructions have been tested or honestly marked unverified.

Use [release and operations](15-release-operations.md) and the [release record template](templates/release-record.md).

### 6. Operate

After release:

- smoke-test the critical path from a real user perspective;
- check logs, errors, webhook deliveries, analytics, and performance;
- watch for permission and content regressions;
- close temporary flags and test data;
- update the runbook when reality differs from the plan;
- capture incidents as learning, not as blame.

## Definition of Ready

A feature is ready to build when:

- the outcome and acceptance criteria are explicit;
- the platform lane is confirmed;
- the data and identity model is known;
- the security boundary is reviewed;
- the source-of-truth and deployment path are known;
- the failure and recovery behavior is described;
- required design, content, legal, accessibility, SEO, and analytics inputs exist;
- the test cases include at least one denied or failed path.

## Definition of Done

A feature is done when:

- code and editor changes are in the declared source of truth;
- permissions and secrets are least-privilege and documented;
- tests cover the relevant positive and negative paths;
- accessibility and responsive behavior have been checked;
- performance and SEO impact is known;
- the change is reviewed by the appropriate owner;
- production smoke tests pass;
- monitoring and support notes exist;
- the release record identifies what shipped and how to recover.

## Change classification

Classify changes before review:

| Change | Examples | Minimum review |
| --- | --- | --- |
| Content | Copy, images, CMS entries | Content owner; links, metadata, accessibility |
| Presentation | Layout, styles, animations | Design; responsive and accessibility checks |
| Behavior | Page code, web methods, app extension | Engineering; tests, auth, failure behavior |
| Data | Collection schema, permissions, migration | Data owner; security, backup/recovery, backfill plan |
| Integration | API, webhook, OAuth, external script | Security; contract, retry, privacy, outage behavior |
| Release/configuration | Secrets, domains, redirects, plan, app version | Release owner; evidence and rollback |

Higher-risk changes may cross several classes. Review them at the strictest class.

## Review questions that catch real failures

- Does any frontend file reveal a secret, privileged identifier, or sensitive business rule?
- Can a caller invoke the backend method with malformed input or the wrong identity?
- Does the data permission match the public behavior and the private fields?
- What happens on the second webhook delivery?
- What happens when a member loses permission between page load and save?
- What happens when the collection is empty or the external API returns a partial result?
- Does the preview prove the same thing as production?
- Is the release source unambiguous?
- If the release is wrong, is the recovery instruction executable by someone else?

