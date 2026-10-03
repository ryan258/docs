# Documentation verification record

Original record: **2026-09-21**. Focused source review and corrections: **2026-10-03**. Scope: the Wix handbook and its three Velo companions in this folder. Operator-run local verification on **2026-10-03 passed 15/15 checks** for the snapshot identified below.

This record separates source-supported platform behavior, engineering recommendations, and example verification. It is not a certification of a deployed Wix project or a promise that platform behavior will never change.

## Focused corrections: 2026-10-03

The follow-up review identified the following corrections and clarifications. These are supported by official documentation; no live Wix site was exercised. This review does not establish that every external link is available or every example works in a deployed site.

| Topic | Corrected guidance | Primary evidence |
| --- | --- | --- |
| HTTP authentication context | Direct `/_functions/` and `/_functions-dev/` endpoints do not carry Wix authentication context. Use the HTTP Functions REST/SDK caller with authorization when that context is needed; the authenticated API path requires a published site. Validate direct external callers through their intended authentication/signature scheme. Writing handlers still uses Velo. | [Endpoints](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/site-api-calls), [authentication context and API roles](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/about-custom-site-apis) |
| Git-connected collection fields | Field changes are immediately reflected on the live site before publishing. In this workflow, duplicating a page also omits its original code. | [Git integration behavior](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/changes-to-the-editor-when-your-site-is-integrated) |
| Velo versus SDK query totals | Legacy `wix-data` returns `totalCount` by default unless omitted. The Data Items SDK requires `returnTotalCount: true` and does not accept `omitTotalCount`. | [Velo query reference](https://dev.wix.com/docs/velo/apis/wix-data/wix-data-query/introduction), [SDK migration](https://dev.wix.com/docs/velo/apis/wix-data/migrate-to-the-sdk) |
| Repeater selectors | Global `$w()` reads the item template; setting a property or calling a method affects the template and all repeated instances. Use `$item` for one repeated item. | [Selector scope](https://dev.wix.com/docs/velo/velo-only-apis/%24w/repeater/selector-scope) |

The source review also found support for the existing site CLI preview warning, app extension registration at release, server/browser rendering distinction, fetch HTTP-error handling, UTC scheduling rules, and separate WCAG resize/reflow checks. These findings are source comparisons, not runtime test results.

## Original evidence registry: 2026-09-21

The source links below are retained from the original record. The focused review above is not a blanket re-verification of every entry or API import.

| Topic | Correction or confirmed behavior | Primary evidence |
| --- | --- | --- |
| Rendering | Page initialization can execute server-side and in the browser; editor preview does not exercise SSR | [Page rendering](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/frontend-code/page-rendering/about-page-rendering) |
| Query permissions | The custom Orders example uses `find({ suppressAuth: true })` after identifying the member and filtering by their ID | [find](https://dev.wix.com/docs/velo/apis/wix-data/wix-data-query/find) |
| Provider status | HTTP 4xx/5xx fulfill Wix fetch promises; check the response before reporting success | [fetch](https://dev.wix.com/docs/velo/apis/wix-fetch/fetch) |
| Deduplication | Separate reads and writes are not a uniqueness guarantee; use enforced constraints and handle conflicts | [Indexes](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/collections/indexes-and-wix-data-collections) |
| Data semantics | Supplied IDs are supported; updates replace item data; reads can be eventually consistent | [Data API](https://dev.wix.com/docs/velo/apis/wix-data/introduction), [ID examples](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/collections/importing-and-exporting-collection-data-with-code) |
| Hooks | Supported CMS/code operations invoke hooks, but backend callers can suppress them | [Hooks](https://dev.wix.com/docs/velo/apis/wix-data/hooks/introduction) |
| Secrets | Old `getSecret` is deprecated; Get Secret Value requires elevated permission | [Deprecation notice](https://dev.wix.com/docs/velo/apis/wix-secrets-backend/get-secret), [replacement](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value) |
| Realtime | Wix supports channel-based realtime messaging; external services are a requirements decision | [Realtime](https://dev.wix.com/docs/sdk/core-modules/realtime/realtime/introduction) |
| Routing | Dataset current-item access and custom-router `getRouterData()` are distinct paths | [Dataset API](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/data-api/overview-of-the-wix-data-and-wix-dataset-apis), [routers](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/build-a-custom-backend/routers/about-routers) |
| Packages | Public npm packages have runtime restrictions; Wix does not verify third-party package safety | [npm packages](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/packages/about-npm-packages) |
| Logs | Wix Logs can collect frontend and backend messages | [Debugging](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/testing-monitoring/testing-troubleshooting/about-debugging-your-code) |
| Scheduled work | UTC configuration, publication, and plan-specific scheduling constraints apply | [Scheduling](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/recurring-jobs/about-scheduling-recurring-jobs), [configuration](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/recurring-jobs/schedule-recurring-jobs) |
| Protected media | Protect the original file; generate temporary access after entitlement checks | [Private files](https://dev.wix.com/docs/rest/assets/media/media-manager/files/private-files), [download API](https://dev.wix.com/docs/api-reference/assets/media/media-manager/files/generate-file-download-url?apiView=SDK) |
| HTTP test environments | Production, test site, Git revision, and editor endpoints differ; CLI previews use live HTTP functions | [Endpoints](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/site-api-calls), [CLI](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands) |
| App release | Preview does not register all extensions; release handles registration | [App deployment](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy) |
| Headless | Hosting/authentication responsibility depends on managed versus self-managed and framework choice | [Development paths](https://dev.wix.com/docs/go-headless/get-started/choose-your-development-path) |
| Accessibility | Text resizing and reflow are separate requirements; a short checklist is not a full conformance assessment | [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow) |

## Example contracts

The recent-orders example uses a custom collection, backend-controlled member ownership, and a bounded result set. It is not an implementation of Wix Stores order history. Test actual identities and collection permissions in Wix before adopting it.

The CRM transport helper demonstrates HTTP acceptance/error handling. The receipt/worker design is explicitly pseudocode: persistence, concurrency-safe claiming, provider idempotency, abuse controls, secrets retrieval, and recovery belong to the consuming project. No example claims exactly-once external delivery or a working connection to the placeholder CRM.

The `$w` snippet is an initialization fragment: its `items` value and repeater must be supplied by the consuming page.

Local checks can establish Markdown structure, internal-link validity, JavaScript syntax, and behavior against controlled mocks. They cannot establish live Wix authentication, API import compatibility, deployment, provider behavior, or accessibility conformance of a site. No live Wix site or provider was exercised in this documentation pass.

## Historical local validation: uncorroborated

The earlier record reported passing checks on 2026-09-21 for 32 Markdown files, 79 internal links and heading anchors, balanced example fences, trailing whitespace, three JavaScript syntax checks, and eleven mocked cases. It also reported inspection of external source pages. The follow-up review found no retained test scripts or result artifacts supporting those historical local test counts in this workspace. Treat them as an **uncorroborated historical report**, not reproducible verification of the current files. This does not establish that the earlier checks never ran.

## Reproducible local checks: passed on 2026-10-03

The [offline checker](scripts/verify.mjs) is retained with the handbook. Ryan ran it on 2026-10-03 and supplied the terminal result. The assistant read the saved JSON report and confirmed that the checker and both documents containing JavaScript examples match its recorded SHA-256 hashes. The assistant did not rerun the checks. This establishes new local evidence; it does not corroborate what ran on 2026-09-21.

| Run detail | Recorded value |
| --- | --- |
| Operator | Ryan Johnson |
| Run time | 2026-10-03T22:06:27.413Z (17:06 CDT) |
| Node.js | v22.22.3 |
| Outcome | PASS: 15/15 checks |
| Markdown coverage | 32 files; 81 internal links |
| Example coverage | 3 JavaScript syntax checks; 11 mocked cases |
| Local report | `verification-results/2026-10-03T22-06-27-413Z-87585.json` |

Relevant source hashes from that report:

~~~text
c6c547ac7d3eded4884cc508820d4747084f54674bb70afb1903a799304c7339  scripts/verify.mjs
356467f574ba2ce0b4c5a3f4a737a9671c04ad745c85555ea1bfd5af89786e7b  the-missing-manual-to-velo.md
7e6645a84047e64ae6fb5c3db34c5028f6d1fcc7e406183bf11811e1864bbe29  velo-for-fun-and-profit.md
~~~

The JSON report retains hashes for all checked Markdown files. This verification entry and the README's status note were updated after the run to record its outcome; those status edits are outside the checked snapshot. The checker and JavaScript examples were unchanged. No additional test run was requested for these status-only edits. The full JSON report remains local and ignored by Git.

With Node.js 20 or later, run this from the handbook directory (the directory containing this file). No dependency installation, Wix account, provider credentials, or network access is needed:

~~~sh
node scripts/verify.mjs
~~~

The checker reads the actual Markdown examples and covers:

- balanced fenced examples, trailing whitespace, inline relative links, and referenced ATX heading anchors in the handbook;
- Node syntax checks of JavaScript fences, without resolving Wix imports;
- eleven controlled mock cases: HTTP 200/202/400/401/429/500, network rejection, two member-specific queries, and missing/invalid member rejection before data access;
- declared member permission, the query's filter/order/limit/permission override, safe response fields, and CRM request/status handling within those mocks.

The mock dataset contains more than 50 records per member so the orders cases check both member isolation and the result bound. The mocked `webMethod` captures the declared permission; it does not implement Wix permission enforcement. The checker does not test the pseudocode receipt/worker design, live Wix identity, package import compatibility, authentication context, HTTP endpoint routing, rendering, collection field publication, provider behavior, accessibility conformance, or external URL availability.

Each completed run prints a concise result and saves a uniquely named JSON file under `verification-results/`, which is ignored by Git. The report includes the UTC run time, Node version, check results, and SHA-256 hashes of the Markdown and checker source. A nonzero exit status indicates failure. Reports remain on disk; preserve the relevant report with release evidence when needed. A setup failure before a report is written is not a passing run.

For subsequent runs, record the run date, report path, outcome, and relevant source hashes here. Record failures as failures. If examples, checker logic, links, or document structure change, rerun the relevant checks before extending the result to those changes. When only recording a result, identify the status edits made after the run instead of attributing them to the earlier snapshot.

## Deliberately project-specific details

- Record the installed CLI version, supported Node version, plan, and API version. A minimum Node version does not guarantee compatibility with every later version.
- Determine execution limits for the actual operation and site. The scheduler documentation establishes schedule behavior, not a universal job execution timeout; no guessed job-timeout value is prescribed here.
- Read each event's own delivery and retry contract. Design defensively for duplicates without inventing a universal delivery guarantee.
- Verify private-file upload, access denial, URL expiration, thumbnails, and entitlement changes. A temporary URL cannot recall a downloaded copy.
- Define the provider's completion signal: a successful HTTP response can acknowledge queued work rather than completed processing.
- Treat effort estimates, potential revenue, and SEO benefits as planning assumptions, not measured outcomes.

## Maintaining accuracy

For each material platform change, record the affected claim, official source, date, and project lane. If official pages disagree, prefer the current operation-specific reference, document the discrepancy, and verify the behavior in the target environment before relying on it. Do not turn an inaccessible page or a mock test into a claim of platform verification.

Keep engineering policy separate from platform limits. Refresh the relevant evidence when upgrading an API or CLI, changing plans, migrating frameworks, or changing the publishing workflow. Update this record with the scope of each new check rather than applying an unqualified “all verified” banner.
