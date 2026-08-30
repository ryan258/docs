# Wix app development

This guide applies when you are building a reusable Wix app that can be installed on multiple sites. An app is a product with an installation lifecycle, not just site code packaged differently.

## Use the current Wix CLI lane

The current [Wix CLI](https://dev.wix.com/docs/wix-cli) is the primary workflow for new Wix apps. It is distinct from Git Integration & Wix CLI for Sites, which extends one Wix site.

The app CLI provides a generated project structure and supports app extensions, Wix APIs, TypeScript, React, Astro-based project structure, and managed hosting capabilities described in the current documentation. Keep the generated configuration under source control, and do not hand-edit generated platform files unless the relevant Wix guide explicitly says to.

Before starting, read:

- [Create an app with the Wix CLI](https://dev.wix.com/docs/build-apps/get-started/quick-start/create-an-app-with-the-wix-cli)
- [About the Wix CLI](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/about-the-wix-cli)
- [Wix CLI command reference](https://dev.wix.com/docs/wix-cli)

## App anatomy

Model the app as a set of independently reviewable surfaces:

| Surface | Purpose | Questions to answer |
| --- | --- | --- |
| Installation and OAuth | Connect the app to a site | What permissions are requested? What is the consent and return path? |
| Onboarding | Get the site ready to use the app | What is the setup-complete signal? Can the user resume safely? |
| Dashboard UI | Configure and operate the app | What site instance is being viewed? Which actions need admin access? |
| Site extension | Add behavior to a Wix site | What happens if the extension is disabled, duplicated, or uninstalled? |
| Events and webhooks | React to Wix or app events | Are deliveries authenticated, deduplicated, and replay-safe? |
| Billing | Sell plans or upgrades | Are plans, entitlements, and cancellation states consistent? |
| External service | Connect to non-Wix systems | Who owns credentials, rate limits, privacy, and outage handling? |

Do not create an extension because the platform offers it. Every extension should map to a user outcome and have a test case.

## Local development loop

Use the current CLI help for exact prompts and flags. The normal shape of the loop is:

~~~text
install dependencies
  -> select or create a development site
  -> wix dev
  -> implement one extension or flow
  -> verify on the development site
  -> run project checks
  -> wix build
  -> wix preview
  -> share and test the preview
  -> wix release after approval
~~~

The CLI’s development environment supports hot reloading for the documented surfaces. A development site is part of the test fixture: record its identity, installed Wix apps, plan, seed data, and reset procedure.

Preview and release are not interchangeable:

- preview creates a hosted version for review;
- release pushes a version and registers the app configuration needed for distribution;
- some extensions are not recognized or active until release.

Read [Build and Deploy an App with the Wix CLI](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy) immediately before changing the release process.

## Permanent identifiers

Treat these as API:

- app namespace;
- code identifier;
- extension IDs and names;
- webhook event names;
- database keys;
- billing plan IDs;
- public URLs and redirect URIs.

Do not rename them casually. If a rename is needed, document compatibility, migration, and the expected behavior for existing installations.

## Installation-specific state

An app can be installed on many sites by the same person or organization. Store state by the correct installation or site identity. Never use one global account record when the behavior is site-specific.

For every persisted record, answer:

- which app installation or site does it belong to?
- which Wix user or member can access it?
- can the site be duplicated?
- what happens on uninstall?
- what happens on reinstall?
- what happens when the app version changes?

Test the app on at least two separate development sites. Confirm that configuration, billing, data, logs, and permissions never leak between installations.

## OAuth, permissions, and onboarding

Request the smallest set of app permissions that supports the product. A permission is a user-facing security decision and a review concern.

The onboarding flow should:

1. establish the installation identity;
2. verify required Wix apps, plans, or capabilities;
3. create only the necessary records;
4. be safe to retry;
5. explain missing prerequisites;
6. mark setup complete only after the app can actually perform its critical action;
7. emit the documented business or analytics event when appropriate.

Never treat a redirect, an installation callback, or a client-provided identifier as sufficient proof of authorization without following the current Wix authorization guidance.

## Dashboard UX

Dashboard pages should feel native and operational:

- show the site or account context;
- explain current configuration and entitlement state;
- make destructive actions explicit;
- display loading, empty, error, and permission-denied states;
- preserve state on refresh;
- avoid exposing raw tokens or secrets;
- make support diagnostics available without exposing customer data.

If an app requires another Wix product, detect that requirement and provide a clear setup path. Do not fail later with an opaque API error.

## Webhooks and lifecycle

Assume events can be delayed, duplicated, reordered, or delivered during a deploy. The handler must:

- authenticate the request using the current documented mechanism;
- validate the event shape;
- derive an idempotency key;
- record receipt before or atomically with processing where possible;
- return the expected acknowledgment quickly;
- retry transient work safely;
- keep poison messages visible for manual recovery;
- log the installation/site identity and event ID without logging secrets.

See [Integrations](10-integrations.md) for the detailed webhook contract.

## App checks and testing

Before submission or distribution, use the current [App Checks and Testing Guide](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-checks-and-testing-guide). At minimum, test the applicable:

- OAuth consent and redirect flow;
- permissions and denied operations;
- onboarding and re-entry;
- dashboard navigation;
- site extensions;
- webhooks;
- billing and upgrade states;
- required Wix app detection;
- multi-site isolation;
- duplication, uninstall, reinstall, and upgrade behavior;
- supported browsers and devices.

Do not describe an app as ready because its dashboard loads. The installation, billing, event, and recovery paths are part of the product.

## Release record for an app

Each app release should identify:

~~~text
App namespace and code identifier:
Version:
Source commit:
Preview URL(s):
Development sites tested:
Extensions changed:
Permissions added or removed:
OAuth/redirect changes:
Webhook changes:
Billing changes:
Required Wix apps or plans:
Known limitations:
Smoke-test owner:
Release approver:
Recovery action:
~~~

