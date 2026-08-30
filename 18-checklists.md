# Checklists

Use these as gates, not as ceremonial boxes. Mark an item not applicable only when the reason is recorded.

## Discovery

- [ ] User and business outcome are explicit.
- [ ] Non-goals are explicit.
- [ ] Wix lane is selected and recorded.
- [ ] Frontend, backend, data, auth, hosting, and release ownership are known.
- [ ] User identities and site/app scope are known.
- [ ] Data fields and retention needs are known.
- [ ] External services and outage behavior are identified.
- [ ] Accessibility target is included.
- [ ] Performance target is included.
- [ ] SEO and analytics impact is included.
- [ ] Privacy or legal review is identified where applicable.
- [ ] Recovery path is described.
- [ ] At least one denied or failed acceptance case exists.

## Project setup

- [ ] Wix and GitHub access is least-privilege.
- [ ] Development site is separate from production.
- [ ] Repository and default branch are recorded.
- [ ] Node and package-manager versions are reproducible.
- [ ] Local start, preview, and release commands are documented.
- [ ] Environment matrix exists.
- [ ] Secrets are in the approved secret store.
- [ ] No credentials or production data are in source or fixtures.
- [ ] Logs are discoverable.
- [ ] A harmless change was previewed without publishing.
- [ ] A denied operation was verified.

## Site feature

- [ ] Code placement is intentional.
- [ ] Browser-visible code contains no secrets or privileged decisions.
- [ ] Backend web methods are narrow and permissioned.
- [ ] Collection permissions match the common case.
- [ ] Server-side authorization and validation exist.
- [ ] Data returned to the browser is minimized.
- [ ] Loading, empty, success, invalid, unauthorized, and failed states exist.
- [ ] Duplicate submission is safe.
- [ ] Dynamic pages handle missing and deleted content.
- [ ] Git/editor/UI/data source-of-truth behavior is understood.
- [ ] Local Editor and published behavior are both checked.

## App feature

- [ ] App namespace and code identifier are recorded.
- [ ] Every extension maps to a user outcome.
- [ ] Development site and installation state are recorded.
- [ ] OAuth and permissions are minimal.
- [ ] Onboarding is resumable and idempotent.
- [ ] Site/app installation state is correctly scoped.
- [ ] Required Wix apps and plans are detected.
- [ ] Dashboard has loading, empty, error, and permission states.
- [ ] Webhooks are authenticated and deduplicated.
- [ ] Billing and entitlement transitions are tested.
- [ ] Duplicate, uninstall, reinstall, duplication, and upgrade behavior is tested.
- [ ] App checks and supported-browser checks are complete.

## Headless feature

- [ ] Managed versus self-managed path is recorded.
- [ ] Framework support and integration capabilities are verified.
- [ ] Authentication owner is known.
- [ ] Visitor, member, and admin identities are separated.
- [ ] Redirect domains and URIs are allowlisted.
- [ ] Client secrets are server-side.
- [ ] Wix API calls are behind application boundaries.
- [ ] API errors map to stable user states.
- [ ] Public and private routes have correct indexing behavior.
- [ ] Hosting, deployment, logs, and recovery are documented.

## Security

- [ ] Threat model covers browser, member, collaborator, webhook, provider, and deployment boundaries.
- [ ] Frontend code has been inspected for secrets and private logic.
- [ ] Collection permissions are least-privilege.
- [ ] Web-method permissions are least-privilege.
- [ ] Elevated or suppressAuth paths have a written reason and own authorization.
- [ ] Inputs are validated server-side.
- [ ] URLs and redirects are allowlisted.
- [ ] Uploads are bounded and validated.
- [ ] Webhooks verify authenticity and replay behavior.
- [ ] Logs are redacted.
- [ ] Dependencies, scripts, and apps have owners.
- [ ] Credential rotation and incident contacts are known.

## Accessibility

- [ ] Critical flows work by keyboard only.
- [ ] Focus is visible, logical, and restored after dialogs.
- [ ] Buttons, links, form fields, and custom widgets have accessible names.
- [ ] Heading hierarchy and landmarks are meaningful.
- [ ] Errors are associated with fields and announced where needed.
- [ ] Empty, loading, and failure states are understandable.
- [ ] Images and media have appropriate alternatives.
- [ ] Contrast, zoom, reflow, and touch targets are checked.
- [ ] Reduced motion has been checked.
- [ ] DOM/layer order matches reading order.
- [ ] Automated and manual evidence is recorded.

## Performance

- [ ] Baseline exists for critical routes.
- [ ] Target mobile and desktop profiles are tested.
- [ ] Images have intentional dimensions and formats.
- [ ] Fonts and animations are reviewed.
- [ ] Third-party scripts have owners and budgets.
- [ ] Queries are bounded and indexed for known paths.
- [ ] Independent requests are not needlessly serialized.
- [ ] Timeouts and retries are bounded.
- [ ] Long lists are paginated.
- [ ] Real-user or production metrics are monitored.
- [ ] A performance regression has a named follow-up if budgets are missed.

## SEO and analytics

- [ ] Titles and descriptions are unique and useful.
- [ ] URLs, redirects, canonicals, and robots behavior are intentional.
- [ ] Public/private indexing behavior is tested.
- [ ] Dynamic records handle missing and unpublished states.
- [ ] Structured data matches visible content and is validated.
- [ ] Sitemap and Search Console ownership are known.
- [ ] Analytics events answer documented questions.
- [ ] Consent and identity handling are correct.
- [ ] Events do not contain unnecessary PII.
- [ ] Attempted, accepted, completed, and failed actions are distinguishable.
- [ ] Analytics is checked against business records or server logs.

## Release

- [ ] Source commit/version is recorded.
- [ ] Destination environment is correct.
- [ ] Code, UI, data, schema, permissions, secrets, and configuration changes are listed.
- [ ] Migration/backfill order and compatibility are documented.
- [ ] Preview evidence exists.
- [ ] Negative-path evidence exists.
- [ ] Smoke tests are assigned.
- [ ] Monitoring and support instructions are ready.
- [ ] Recovery action is named, owned, and honestly classified as verified or unverified.
- [ ] Release approver is recorded.
- [ ] Post-release smoke test is complete.
- [ ] Release record is complete.

## Incident

- [ ] Impact and affected sites/installations are scoped.
- [ ] Harmful writes or feature are stopped if necessary.
- [ ] Logs, source version, and request IDs are preserved.
- [ ] Privacy and security impact are assessed.
- [ ] User-facing communication is bounded and accurate.
- [ ] Rollback, disablement, or forward fix is selected.
- [ ] Recovery is smoke-tested.
- [ ] Data and external side effects are reconciled.
- [ ] Root cause and contributing conditions are documented.
- [ ] A regression test or control is added.
- [ ] Runbooks and owners are updated.

## Maintenance

- [ ] Dependencies and Wix platform changes are reviewed.
- [ ] Access and secrets are reviewed.
- [ ] Test sites and test data are cleaned or reset.
- [ ] Logs, alerts, and dashboards have owners.
- [ ] Dead integrations, scripts, flags, and packages are removed.
- [ ] Collection fields and permissions still match usage.
- [ ] SEO routes and redirects are checked.
- [ ] Performance baseline is refreshed.
- [ ] Documentation links and commands are current.
- [ ] Recovery instructions still work.

