# Official Wix resources

Use this page as the link registry for the handbook. Wix’s documentation is the authority for current commands, supported frameworks, API behavior, editor locations, product limits, and distribution requirements.

## Core documentation

- [Types of Wix sites](https://dev.wix.com/docs/overview/platform-overview/types-of-wix-sites) and [development paths](https://dev.wix.com/docs/overview/platform-overview/development-paths) — identify the editor and code model first.
- [Wix APIs and References](https://dev.wix.com/docs/references) — current index for SDKs, the CLI, shared extensions, and components.
- [Developer changelog](https://dev.wix.com/changelog) — dated platform changes and rollout notes.
- [Extending Wix Editor and Wix Studio websites with Velo](https://dev.wix.com/docs/develop-websites) — editor development, site APIs, local IDE options, testing, publishing, and maintenance.
- [Velo API reference](https://dev.wix.com/docs/velo) — Velo APIs, events, and reference material.
- [Wix JavaScript SDK](https://dev.wix.com/docs/develop-websites-sdk) — SDK-based site and Blocks development.
- [Velo APIs and the SDK](https://dev.wix.com/docs/velo/apis/about-velo-apis-and-the-sdk) — transition context and API choices.
- [Velo-to-SDK API mapping](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping) — identify SDK replacements and Velo-only APIs.

## Studio Two and Harmony

- [About developing in Studio Two](https://dev.wix.com/docs/studio-two/get-started/about-extending-websites-with-studio-two) and [comparison with Wix Editor and Wix Studio](https://dev.wix.com/docs/studio-two/get-started/compare-extending-websites-in-studio-two-to-wix-editor-and-wix-studio) — the Code tab, React components, extensions, and gaps in the initial release.
- [Site SDK](https://dev.wix.com/docs/sdk/site-sdk/introduction) — Studio Two navigation, site settings, rendering, and accessibility APIs.
- [Frontend-to-backend communication](https://dev.wix.com/docs/overview/backend-services/frontend-to-backend-communication) — web methods versus HTTP endpoints across site types, apps, and Headless.
- [Studio Two export to code](https://dev.wix.com/docs/studio-two/code-your-site/export-your-site/about-exporting-your-site-to-code) and [CLI import](https://dev.wix.com/docs/wix-cli/command-reference/origami-commands/origami-import-site) — separate workflow from Git Integration for Sites; importing replaces editor content.
- [About Wix Harmony](https://dev.wix.com/docs/develop-websites/articles/get-started/about-wix-harmony) and [dashboard custom code](https://dev.wix.com/docs/overview/site-features-tools/about-custom-code) — supported snippets and their limits.

## Wix Editor and Wix Studio site development

- [Velo quick start](https://dev.wix.com/docs/develop-websites/articles/get-started/quick-start)
- [Where to put code](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/overview/where-do-i-put-my-code)
- [About web modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules)
- [Set up Git Integration & Wix CLI for Sites](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/setting-up-git-integration-wix-cli-for-sites)
- [GitHub integration behavior](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/changes-to-the-editor-when-your-site-is-integrated)
- [Custom site APIs and authentication context](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/about-custom-site-apis)
- [Velo query behavior](https://dev.wix.com/docs/velo/apis/wix-data/wix-data-query/introduction) and [Data Items SDK migration differences](https://dev.wix.com/docs/velo/apis/wix-data/migrate-to-the-sdk)
- [Repeater selector scope](https://dev.wix.com/docs/velo/velo-only-apis/%24w/repeater/selector-scope)
- [Site CLI commands](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands)
- [Publish a site with Git Integration & Wix CLI](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/publishing-a-site-with-git-integration-wix-cli-for-sites)
- [Velo security best practices](https://dev.wix.com/docs/develop-websites/articles/best-practices/security-best-practices)
- [Best practices for building a site with Velo](https://dev.wix.com/docs/develop-websites/articles/best-practices/best-practices-for-building-a-site-with-velo)

## Apps

- [Wix CLI](https://dev.wix.com/docs/wix-cli) — unified CLI overview and current scope.
- [CLI command reference](https://dev.wix.com/docs/wix-cli/command-reference/introduction) — project creation, project-local commands and effects.
- [Create an app with the Wix CLI](https://dev.wix.com/docs/build-apps/get-started/quick-start/create-an-app-with-the-wix-cli)
- [About the Wix CLI for apps](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/about-the-wix-cli)
- [Build and deploy an app](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy)
- [App checks and testing guide](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-checks-and-testing-guide)
- [About testing your app](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/test-your-app/about-testing-your-app)
- [Dashboard page extension files](https://dev.wix.com/docs/dashboard-extensions/dashboard-pages/dashboard-page-extension-files-and-code) — shared reference; preserve the registration and imports generated for your project.
- [List Locations](https://dev.wix.com/docs/api-reference/business-management/locations/list-locations) — request/response contract and read permission for the installed-app recipe.
- [CLI `dev-site`](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/app-only/dev-site) — inspect, select, or create the app's development site without the interactive selector.
- [App compatibility by editor](https://dev.wix.com/docs/build-apps/get-started/overview/about-apps-in-wix-harmony-and-wix-studio-two) — check extension support before targeting another editor.

## Headless

- [Wix Headless](https://dev.wix.com/docs/go-headless)
- [Choose your development path](https://dev.wix.com/docs/go-headless/get-started/choose-your-development-path)
- [About Wix-managed Headless](https://dev.wix.com/docs/go-headless/wix-managed-headless/about-wix-managed-headless)
- [About authentication](https://dev.wix.com/docs/go-headless/authentication/about-authentication)
- [Set up a Headless client](https://dev.wix.com/docs/go-headless/authentication/setup/set-up-a-headless-client)
- [Managed Astro integration](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/about-the-astro-integration) — generated configuration, SDK authentication and rendering context.
- [Query Items with the Data SDK](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/work-with-data/data-api/query-items) — the flat item result shape used by the Headless recipe.
- [Create a Headless project](https://dev.wix.com/docs/wix-cli/command-reference/project-creation/create-headless) — exact flags, account resources, Git initialization and auto-publishing effects.
- [Post-migration checklist for Wix Studio and Wix Editor sites](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/post-migration-checklist-wix-studio-and-editor-sites-to-headless) — review feature, routing, and SEO gaps before switching to the managed Astro frontend.

## SEO, performance, and accessibility

- [Wix site performance best practices](https://support.wix.com/en/article/site-performance-best-practices)
- [Customize page SEO settings](https://support.wix.com/en/article/customizing-your-pages-seo-settings-in-the-seo-panel)
- [Advanced SEO settings](https://support.wix.com/en/article/seo-settings-advanced-seo)
- [SEO URL Mapping sample flows](https://dev.wix.com/docs/api-reference/business-management/seo/url-mapping-v1/sample-flows) — inspect the consequences for live item URLs and redirects before changing a mapping.
- [W3C Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG22/)

## Claim-level evidence

The [verification record](21-verification-record.md) maps corrected claims to operation-specific official sources and records what local checks do not establish. Consult it for rendering, HTTP preview and authentication behavior, Git-connected field changes, Velo/SDK query differences, repeater scope, fetch errors, secrets migration, private media, scheduling, and logging.

## How to use this registry

When a platform behavior matters to a release:

1. open the current official page;
2. confirm the page applies to the project lane and framework;
3. record the date checked;
4. capture the project-specific decision in the relevant handbook page;
5. update this registry if the canonical URL changed;
6. record any unresolved discrepancy instead of silently guessing.
