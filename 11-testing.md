# Testing and quality

Testing a Wix project means testing the platform boundary, not just JavaScript functions. A green local page is useful evidence, but it does not prove permissions, publication, content, responsive behavior, or production integrations.

## Test layers

| Layer | What it proves | Examples |
| --- | --- | --- |
| Pure unit | Deterministic business logic | Validation, mapping, state transitions, retry classification |
| Adapter/contract | Platform and provider assumptions | Wix response mapping, webhook schema, API error mapping |
| Backend integration | Real permissions and persistence | Collection access, web methods, secrets, hooks |
| Functional/editor | Site behavior in Wix runtime | Backend functional tests, Local Editor interactions |
| Browser/system | User-visible behavior | Navigation, forms, dashboard, checkout or booking handoff |
| Accessibility | Operability and understandable output | Keyboard, focus, names, contrast, screen-reader path |
| Performance | Load and interaction budgets | Core Web Vitals, mobile load, long tasks, third-party cost |
| Security/abuse | Boundary resistance | Unauthorized calls, replay, injection, rate limits, cross-site access |
| Release smoke | Production path | Critical route, login, mutation, webhook receipt, analytics |

Choose the smallest layer that can prove a behavior, then add a higher layer for platform interactions.

## Test environments

Keep environments distinct:

- local development environment;
- Wix development site;
- preview URL/version;
- staging or test site;
- production site.

For each environment, record:

- site/project ID;
- code source and commit;
- UI/editor version;
- installed apps and packages;
- collection schema and seed data;
- secrets and configuration source;
- domain and redirect behavior;
- known differences from production.

Never assume preview and production share data, secrets, HTTP functions, extension registration, or authentication behavior.

## Minimum feature test matrix

For every user-facing feature, test the applicable:

- first use;
- repeat use;
- empty state;
- malformed input;
- boundary values;
- cancel/back/refresh;
- slow response;
- timeout;
- provider failure;
- anonymous visitor;
- authenticated member;
- wrong member or wrong site;
- missing permission;
- duplicate submission;
- browser refresh after success;
- mobile width and orientation;
- keyboard-only path;
- screen-reader or accessibility-tree path;
- analytics event and privacy redaction.

For a mutation, test the second request. For a webhook, test the second delivery. For a migration, test partially migrated data.

## Negative-path testing

Negative tests are closure evidence, not optional hardening. At minimum, prove:

- a caller without permission is rejected;
- a member cannot access another member’s record;
- an app installation cannot access another site’s state;
- a missing or invalid secret fails closed;
- malformed input cannot reach a provider or data write;
- an arbitrary URL cannot become a server-side fetch;
- repeated events do not duplicate side effects;
- a timeout leaves a recoverable state;
- an empty collection does not look like a system failure;
- a live release does not use test configuration.

## Browser and device coverage

Test the browsers and devices your audience actually uses. Include:

- current desktop Chrome, Safari, Firefox, and Edge as appropriate;
- iOS Safari and Android Chrome;
- narrow phone, tablet, laptop, and wide desktop layouts;
- zoom or text enlargement;
- reduced motion;
- slow network and high-latency conditions.

The current [Wix App Checks and Testing Guide](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-checks-and-testing-guide) contains app-specific browser and distribution checks. Treat that guide as the source of truth for app submission requirements.

## Test data discipline

Use synthetic records with obvious environment markers. Never use real customer exports merely because they are convenient.

Seed data should be:

- small;
- deterministic;
- resettable;
- owned by the test environment;
- safe to expose to every tester in that environment.

If a test requires production-like data, document approval, minimization, access, retention, and deletion.

## Evidence record

A useful test record includes:

~~~text
Change:
Environment:
Source commit/version:
Date and time:
Tester:
Scenario:
Identity/site:
Expected:
Observed:
Result:
Evidence link or artifact:
Known limitation:
Follow-up owner:
~~~

Do not call a feature “fully tested” when the record only covers a screenshot or a happy-path click-through.

## Test ownership

Assign owners for:

- unit and contract tests;
- Wix runtime and permission tests;
- browser and accessibility checks;
- performance measurements;
- app submission checks;
- production smoke tests;
- test-data reset and environment health.

When a test is skipped, record why, what risk remains, and when it will be revisited.

## Quality gate

Before release, the project should be able to answer:

- what changed;
- what was tested;
- which identity and environment were used;
- which negative paths were exercised;
- what the tests do not prove;
- what will be smoke-tested after release;
- what evidence will be retained.

