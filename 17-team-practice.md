# Team practice and documentation

The best Wix project is one where a new contributor can make a safe change without guessing which dashboard, branch, site, secret, or identity matters.

## Repository README minimum

Every code repository should link to or contain:

- project purpose and non-goals;
- [Platform map](01-platform-map.md) decision;
- local prerequisites and commands;
- development site and test-data instructions;
- environment matrix;
- source-of-truth rules;
- architecture map;
- data and permission inventory;
- secrets/configuration instructions without secret values;
- test and release commands;
- smoke tests;
- rollback/forward-fix instructions;
- owners and escalation path;
- known limitations and dangerous edges.

## Pull request standard

Every pull request should state:

- what user or business behavior changes;
- which Wix lane and surfaces are involved;
- code, UI, content, schema, permission, secret, and configuration changes;
- source of truth and release source;
- tests and environments;
- negative paths checked;
- accessibility, performance, SEO, privacy, and analytics impact;
- screenshots or recordings where visual behavior changed;
- migration and recovery plan;
- known limitations.

Reviewers should be able to answer “what could this expose, break, duplicate, or make unrecoverable?” from the pull request without opening an undocumented dashboard.

## Ownership

Assign named owners for:

- product behavior;
- site/editor and design;
- application/backend code;
- data and collections;
- authentication and security;
- integrations and webhooks;
- accessibility;
- SEO and analytics;
- release;
- incidents and support;
- this documentation collection.

One person may hold several roles. The point is to eliminate unnamed responsibility.

## Decision records

Record a decision when it changes:

- platform lane or hosting;
- frontend framework;
- authentication or identity flow;
- data system of record;
- collection permission model;
- secret storage;
- external provider;
- deployment/release path;
- accessibility or performance baseline;
- migration or deprecation strategy.

Use [Decision record](templates/decision-record.md). Record rejected alternatives and revisit triggers so future maintainers do not reopen a closed question without context.

## Change communication

Use release notes that mention behavior and risk:

- user-visible change;
- operational change;
- data/configuration change;
- migration;
- security or permission change;
- known limitation;
- support action;
- recovery action.

Do not describe a deployment only as “updated code.”

## Onboarding exercise

A new developer should be able to complete this in a safe test environment:

1. find the project lane and source of truth;
2. run the local or editor development workflow;
3. locate the relevant page, app extension, or Headless route;
4. trace one request to Wix data or a provider;
5. identify the caller identity and authorization boundary;
6. run a denied or malformed-input test;
7. find logs;
8. create a preview;
9. find the release record and recovery path;
10. improve one missing instruction.

## Documentation quality

Prefer:

- commands that can be copied;
- exact scope labels;
- links to canonical Wix docs;
- examples with synthetic values;
- diagrams or tables for boundaries;
- explicit unknowns and limitations;
- dates and owners for time-sensitive facts.

Avoid:

- screenshots as the only source of truth;
- undocumented dashboard state;
- stale commands copied from old tutorials;
- “works” without environment and identity;
- secrets in examples;
- claims that a test proves more than it does;
- a single document that mixes site, app, and Headless instructions without labels.

## Maintenance cadence

Review this collection:

- before onboarding a new person;
- after a major Wix platform or SDK change;
- after every production incident;
- before a major data or auth change;
- quarterly for active projects;
- when a link or command is discovered to be stale.

Make a documentation change part of the definition of done when the implementation changes an operator or developer workflow.

