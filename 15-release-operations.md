# Release, deployment, rollback, and operations

The release is the moment a change becomes someone else’s environment. Make the source, scope, evidence, and recovery action explicit.

## Source-of-truth matrix

Before every release, record the source for each category:

| Category | Source of truth | Verified by |
| --- | --- | --- |
| Site code | Editor-managed project or GitHub branch | Commit/version or editor history |
| App code | Wix CLI project | Immutable source commit and app version |
| Headless frontend | Managed project or team repository | Build artifact and deployment record |
| UI/design | Wix editor/project version or code | Preview comparison |
| CMS content | Named collection/editor workflow | Content review |
| Collection schema | Wix project configuration | Schema diff or inventory |
| Permissions | Wix dashboard/configuration | Permission review |
| Secrets | Secrets Manager or host secret store | Secret presence and scope check |
| Domains/redirects | Wix or hosting configuration | Route smoke test |
| External integrations | Provider dashboard and source config | Contract and credential check |

If any row is unknown, the release is not fully traceable.

## Release lanes

### Wix site

Use the site’s documented Git/editor/CLI process:

1. review code and editor changes;
2. identify the branch or local source;
3. preview in the appropriate environment;
4. verify data, permissions, secrets, and installed packages;
5. publish from the declared source;
6. smoke-test the live site;
7. record the source, time, approver, and result.

The current site CLI documentation distinguishes publishing from the repository’s default branch from publishing local code. Local-code publishing can leave production and GitHub out of sync; use it only with an explicit recovery action. See [Publishing a site with Git Integration & Wix CLI](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli/publishing-a-site-with-git-integration-wix-cli).

### Wix app

Use the current app CLI release flow:

1. build;
2. create and share a preview when useful;
3. test on development sites;
4. review extension registration, permissions, OAuth, webhooks, billing, and listing;
5. release an app version;
6. install/test the released version;
7. record the version and recovery action.

Preview is not a substitute for release. Some extensions are not registered or recognized until release. See [Build and Deploy an App with the Wix CLI](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy).

### Wix Headless

Follow the managed or self-managed deployment path selected in the project inventory. Verify:

- build artifact;
- environment variables and secrets;
- auth and redirect configuration;
- domain and route behavior;
- API identity;
- logs and alerting;
- rollback or forward-fix.

## Pre-release gate

The release owner should confirm:

- source commit/version is recorded;
- review approvals are present;
- changed data, permissions, and configuration are listed;
- migrations and backfills are safe;
- secrets exist in the destination environment;
- feature flags or kill switches are ready;
- test evidence includes negative paths;
- accessibility, performance, SEO, privacy, and analytics checks are complete;
- critical smoke tests are written;
- support and escalation contacts are known;
- recovery has an owner.

## Release procedure

1. Announce the change window and risk.
2. Confirm the destination and the source.
3. Take or verify the permitted recovery artifact for data/configuration changes.
4. Apply schema/configuration changes in the documented order.
5. Deploy, publish, or release.
6. Run smoke tests from a real user perspective.
7. Check logs, error rate, latency, webhooks, analytics, and key business records.
8. Compare the observed behavior with the acceptance criteria.
9. Close or roll back only with evidence.
10. Complete the release record.

## Rollback and forward-fix

Recovery depends on the Wix lane and the change type. Separate:

- code rollback;
- UI/design rollback;
- app-version recovery;
- configuration rollback;
- secret rotation;
- data correction;
- external side-effect compensation;
- DNS or redirect recovery.

Never write “roll back” as a complete procedure without naming the command, dashboard action, version, data consequence, and approver. If the recovery path has not been tested, mark it unverified.

When rollback could make data incompatible, prefer a compatible forward fix or staged disablement. Stop new writes before correcting data when necessary.

## Post-release monitoring

For the first release window, watch:

- critical page availability;
- login and permission failures;
- backend exceptions;
- Wix and provider latency;
- webhook acceptance and processing;
- duplicate or missing business records;
- analytics conversion events;
- mobile and accessibility reports;
- support tickets and unusual user behavior.

## Incident response

When production behavior is wrong:

1. establish impact and affected sites/installation IDs;
2. stop harmful writes or disable the feature if possible;
3. preserve logs, release source, and request IDs;
4. choose rollback, disablement, or forward fix;
5. communicate a bounded user-facing status;
6. verify recovery with a critical-path smoke test;
7. repair data or external side effects;
8. write an [incident report](templates/incident-report.md);
9. add a test or control that would have caught the failure.

