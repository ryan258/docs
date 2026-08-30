# Wix Headless development

Wix Headless separates the frontend from the Wix-managed business layer. That flexibility is valuable, but it moves important responsibilities—especially hosting and authentication—between the team and Wix.

## Choose the path first

Use the current [Choose Your Development Path](https://dev.wix.com/docs/go-headless/get-started/choose-your-development-path) guide for availability. The practical comparison is:

| Path | Wix manages | Team manages | Good fit |
| --- | --- | --- | --- |
| Wix-managed Headless with Astro | Hosting, deployment, managed infrastructure, and the integrated authentication/SEO capabilities documented for the integration | Product code, authorization decisions, data behavior, quality, content, and operations | New custom frontends that want the most Wix-managed workflow |
| Wix-managed Headless with another supported framework | Hosting and deployment; integration capabilities depend on the framework | Authentication and any capabilities not provided by the integration | An existing supported frontend that should run on Wix infrastructure |
| Self-managed Headless | Wix business APIs and Wix project services | Frontend hosting, deployment, authentication, secrets, monitoring, and operational controls | A framework, host, or architecture that needs full team control |

“Wix-managed” is not a universal guarantee that authentication, secrets, extensions, SEO, or monitoring are automatic. Record the exact framework and integration capabilities in the project inventory.

## Headless architecture

Define four boundaries:

1. **Frontend:** renders the user experience and collects intent.
2. **Application backend:** owns secrets, privileged calls, validation, authorization, and integration orchestration.
3. **Wix business layer:** owns the selected CMS, Stores, Bookings, Events, memberships, or other system of record.
4. **Operations layer:** owns deployment, logs, alerts, rate limits, and recovery according to the selected hosting path.

Avoid calling privileged Wix APIs directly from browser code. The browser identity and the server identity are different trust zones.

## Authentication and identities

When a Headless client calls a Wix API, the call runs as an identity. Common identities include:

- visitor;
- member;
- the app or backend;
- API-key administrator for operations that require it.

Read [About Authentication](https://dev.wix.com/docs/go-headless/authentication/about-authentication) before implementing a login or admin operation.

The project record must state:

- whether visitor and member authentication is automatic or manually configured;
- where tokens are stored;
- which redirects are allowlisted;
- which operations require elevated or admin access;
- which backend boundary performs privileged calls;
- how logout, expiry, revocation, and account switching work.

Visitor/member authentication is not the same as admin access. A member should not receive an API key or a client secret. Admin credentials belong only in a protected server environment and should be scoped to the smallest operation.

## Headless client setup

For a self-managed client or a managed framework path that requires manual configuration:

1. register a client with the Wix project;
2. use the client ID in the appropriate SDK or REST configuration;
3. configure approved redirect domains and authorization redirect URIs;
4. keep client secrets server-side;
5. test an allowed redirect and a rejected redirect;
6. test visitor, member, and denied/admin paths separately.

See [Set Up a Headless Client](https://dev.wix.com/docs/go-headless/authentication/setup/set-up-a-headless-client).

## API design

Use Wix APIs as a domain boundary, not as a reason to mirror every API method into the frontend. Create application-level operations:

- name the user action;
- validate input;
- choose the correct identity;
- call the smallest Wix API surface;
- normalize the result;
- return only what the UI needs;
- map expected errors to stable user-facing states.

Keep Wix API calls behind a small adapter layer so API version changes, retries, and test doubles do not spread through the UI.

## Managed deployment

For Wix-managed projects, follow the current CLI and framework-specific deployment workflow. Confirm:

- which build output is deployed;
- how environment variables and secrets are provided;
- how preview URLs differ from production;
- how domains and redirects are configured;
- how logs and errors are found;
- whether extensions are supported by the selected framework;
- how a previous version is recovered.

For self-managed projects, treat the frontend like any production web application:

- use protected CI/CD credentials;
- build from an immutable commit;
- run security and dependency checks;
- provision secrets through the host’s secret store;
- protect preview and admin routes;
- monitor authentication and API failures;
- keep a tested rollback or forward-fix process.

## SEO and rendering

Headless SEO responsibility depends on the selected path and rendering model. Explicitly test:

- server-rendered or statically generated HTML where required;
- title, description, canonical, robots, and social metadata;
- stable URLs and redirect behavior;
- structured data;
- sitemap and indexing controls;
- error, not-found, and loading responses;
- authenticated pages that should not be indexed.

Do not assume a preview screenshot proves that crawlers receive the intended document.

## Migration and coexistence

When connecting a custom frontend to an existing Wix site:

- inventory the current site, collections, member identities, domains, SEO URLs, and installed apps;
- decide whether the custom frontend coexists with or replaces the editor-built frontend;
- avoid changing URL ownership and canonical tags without a migration plan;
- preserve data and account identity where supported;
- run dual-path smoke tests before switching traffic;
- document the exact cutover and recovery action.

Headless is an architecture choice, not merely a new frontend framework.

