# Verification: what the examples actually prove

This handbook has three kinds of examples: offline runnable code, Wix recipes requiring editor/account setup, and explicitly labeled design sketches. Source review and local mocks provide different evidence; neither establishes a working deployed Wix site.

## Platform refresh: 2026-11-10

This is a review of Wix's public documentation for the workflows in this handbook. It does not establish editor access, platform behavior in a particular account, or SDK compatibility with an installed project. Review the applicable references again when you pick an editor, install a CLI version, or switch a live site.

| Topic | Guidance confirmed or updated | Primary source |
| --- | --- | --- |
| Editor and code model | Studio Two is rolling out gradually. Its React/TypeScript model uses the Code tab and Site SDK. Existing Wix Editor and Wix Studio recipes use Velo; Harmony supports dashboard snippets without Velo site code. | [Site types](https://dev.wix.com/docs/overview/platform-overview/types-of-wix-sites), [Studio Two comparison](https://dev.wix.com/docs/studio-two/get-started/compare-extending-websites-in-studio-two-to-wix-editor-and-wix-studio), [dashboard custom code](https://dev.wix.com/docs/overview/site-features-tools/about-custom-code) |
| Studio Two backend | Site HTTP endpoints serve the site's own frontend. The handler must check caller identity and input; Studio Two does not provide Velo web modules or external HTTP functions in this release. | [Studio Two HTTP endpoints](https://dev.wix.com/docs/studio-two/code-your-site/build-a-custom-backend/http-endpoints/about-http-endpoints) |
| Studio Two export/import | Export to code is documented as beta in the current guide. Import replaces editor content, including deleting omitted pages; publishing is a separate action. The initial changelog used the alpha label. | [Export guide](https://dev.wix.com/docs/studio-two/code-your-site/export-your-site/about-exporting-your-site-to-code), [CLI import](https://dev.wix.com/docs/wix-cli/command-reference/origami-commands/origami-import-site), [changelog](https://dev.wix.com/changelog) |
| CLI runtime | The general CLI reference lists Node 24.18+. The October 22 changelog and Velo site setup specify 24.22.1+. Use the stricter published floor for the app, Headless, and Velo site setup paths here; check the requirement for your pinned tool. No CLI package or account was exercised. | [CLI reference](https://dev.wix.com/docs/wix-cli/command-reference/introduction), [site setup](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/setting-up-git-integration-wix-cli-for-sites), [changelog](https://dev.wix.com/changelog) |
| App development site and dashboard | `wix dev-site` can inspect or change the app's test target; creation and installation affect the account. Dashboard page registration now has a shared reference; `metaData` and `fullPage` are optional. | [`dev-site`](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/app-only/dev-site), [dashboard page files](https://dev.wix.com/docs/dashboard-extensions/dashboard-pages/dashboard-page-extension-files-and-code) |
| Preview and release | App and managed Headless previews upload existing build output as a fixed snapshot. An app release creates a version; a Headless release publishes the site. The static site uploader also deploys live. | [Preview](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/preview), [release](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/release), [static upload](https://dev.wix.com/docs/go-headless/wix-managed-headless/other-frameworks/your-own-frontend/upload-a-static-site) |
| Managed Headless migration | Inventory forms, redirects, SEO, and Velo endpoints before switching an existing site. The support guide and developer checklist describe different outcomes for legacy HTTP functions; verify the required routes in the intended environment. | [Migration support guide](https://support.wix.com/en/article/wix-headless-moving-your-site-to-a-custom-frontend), [developer checklist](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/post-migration-checklist-wix-studio-and-editor-sites-to-headless) |
| Site history and CMS recovery | Wix's guides differ on schema restoration. Both say restoring a site version leaves collection records current; use a separate CMS recovery point. | [Developer site history](https://dev.wix.com/docs/develop-websites-sdk/publish-your-site/site-history/about-site-history), [Help Center restore limits](https://support.wix.com/en/article/restoring-a-saved-version-of-your-site) |
| Item URL patterns | The URL Mapping API changes patterns for Wix business solution item URLs. Mapping writes take effect immediately and do not set up redirects. Check method release status and plan the move separately. | [URL Mapping sample flows](https://dev.wix.com/docs/api-reference/business-management/seo/url-mapping-v1/sample-flows) |
| Existing Velo member and secret recipes | Wix documents that the backend Current Member call rejects without a signed-in member and has limited Preview behavior. For secret reads, `wix-secrets-backend.v2` replaces the deprecated legacy method. | [Current Member](https://dev.wix.com/docs/velo/apis/wix-members-backend/current-member/get-member), [Get Secret Value](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value) |

The [resource registry](99-official-resources.md) points to Wix's reorganized references. This review covers the cited behaviors and does not certify every external URL in the handbook.

**November offline check: PASS, 38/38.** Node checked 37 Markdown files, 237 internal links, 9 JavaScript fragments, 21 controlled mock cases, and 3 standalone helper test files. `git diff --check` also passed. The local report is `verification-results/2026-11-13T04-00-32-180Z-38405.json`. This result paragraph was added after the run; the report hashes the page before this note. The example source files were unchanged, so the optional framework syntax pass was not repeated.

## October 26, 2026 example revision

The October revision added runnable examples and full setup for the greeting, private member orders, installed-app Locations page, and managed Astro CMS reading list. The October snapshot passed **38/38 handbook checks and 6/6 framework syntax checks**. All 20 shared-helper tests passed: 7 order formatter, 7 Locations, and 6 reading-list tests. These are historical results for that snapshot.

| Run detail | Recorded value |
| --- | --- |
| Operator/date | Codex; 2026-10-26 |
| Handbook UTC run time | `2026-10-26T20:57:17.004Z` |
| Runtime | `v26.12.1` |
| Handbook coverage | 35 Markdown files; 188 internal links; 9 JS fragments; 21 controlled mock cases; 3 shared-helper test files |
| Handbook report | `verification-results/2026-10-26T20-57-17-004Z-65652.json` (local, ignored by Git) |
| Framework result | 6/6 parser checks; TypeScript `5.9.2` |
| Framework report | `verification-results/frameworks-2026-10-26T20-57-14-805Z-65653.json` (local, ignored by Git) |
| Whitespace check | `git diff --check` passed |

The October handbook report hashes the verification page before its results were recorded. The reports remain local and ignored by Git. Framework syntax coverage is limited to the parser checks described below.

## What the local checks cover

Run the focused handbook checker from this `docs/` directory with Node.js 20 or later:

~~~sh
node scripts/verify.mjs
~~~

No dependencies, Wix account, secrets or network access are needed. It prints a concise result and saves a uniquely named JSON report under `verification-results/`. A nonzero exit code means failure. Reports include UTC time, runtime version, check results and source hashes.

| Check | What it establishes | What it does not establish |
| --- | --- | --- |
| Markdown parsing | Balanced fences, no trailing whitespace, inline relative links and referenced heading anchors resolve | Every external URL exists; rendered document layout |
| JavaScript syntax | Every `js`/`javascript` block parses as an ES module | Wix packages/imports resolve; editor IDs exist |
| Greeting mocks | Backend validates input; page waits for a click, shows loading/result/error and re-enables retry | Actual Wix invocation or assistive announcements |
| Member-order mocks | Member filter, sort, bound, permission override and safe projection; missing identity rejected before query | Wix's actual member/collection permission enforcement |
| CRM mocks | Request shape, HTTP acceptance/failure handling and network-error propagation | A real provider contract, timeout, idempotency or delivery |
| Standalone formatter tests | Synthetic input validation and filled/empty output behavior in the actual module | Authentication, CMS data quality or a Wix page's repeater |
| App shared-helper tests | Exact Locations request, SDK field mapping, empty/failing responses, projection, bounds and paging metadata | React rendering, actual scope grants or installed-site context |
| Headless shared-helper tests | Exact collection/sort/limit, flat CMS shape, empty/failing reads, HTTPS validation, projection and immutable input | CMS permission enforcement, generated integration or Astro rendering |
| App code-copy check | The chapter's full TSX block matches its supplied source file | SDK imports, TypeScript types or React behavior |
| Demo CLI | Documented filled/empty output and nonzero exit on an unsupported option | Every filesystem error or arbitrary supplied fixture |
| Pure preference example | Documented stdout and rejection of invalid input shapes/values | Record ownership or saving data |
| Input-check command and async patterns | Documented five-case result; independent reads start together; stale results/errors cannot replace the latest state | A particular Wix read adapter or real network performance |

The checker reads the actual Markdown snippets, not separate copies. Member mocks include more than 50 records per member. Mocked `webMethod` records declared caller permissions without implementing Wix authentication. The new app/Headless tests import the same helpers as their pages and replace only the SDK boundary. Source hashes include the checker, Markdown and recursively collected example sources, declarations, JSON and CSV fixtures. The output report is local and ignored by Git.

The optional framework syntax pass uses an existing TypeScript installation, discovered locally or through `tsc` on `PATH`:

~~~sh
node scripts/verify-frameworks.mjs
~~~

It parses saved TSX/declaration files, chapter TSX snippets, and the Astro route's frontmatter. It does **not** compile the Astro template, resolve SDK imports, check types against installed Wix declarations, or render a UI. Use `--typescript /absolute/path/to/typescript/lib/typescript.js` to select an existing compiler when automatic discovery is unavailable; the script downloads nothing. It writes its own uniquely named report. Each recipe documents `npm run build` in the generated target project for the real dependency/framework compilation step; no target app/Headless project was scaffolded or built during this documentation work.

## Platform facts checked on 2026-10-26

These are source comparisons from the October snapshot. Where the November review above adds a caveat, use that newer guidance.

| Topic | Current guidance | Primary source |
| --- | --- | --- |
| CLI runtime | The October 22 release note announced Node 24.22.1+. The offline checker has a separate Node 20+ requirement. See the November review for the conflicting published minimums. | [Wix changelog](https://dev.wix.com/changelog), [site setup](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/set-up-git-integration-with-wix-cli) |
| App previews | Fixed snapshot; no app version. Service plugins and events gained preview testing on October 19 | [App build/deploy](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy), [changelog](https://dev.wix.com/changelog?featureType=Build+Apps) |
| App creation | Use the current app scaffold and permanent namespace/code identifier | [App quick start](https://dev.wix.com/docs/build-apps/get-started/quick-start/create-an-app-with-the-wix-cli) |
| Headless creation | `--no-publish` disables scaffold auto-publishing; `--skip-git` disables Git initialization | [Create Headless reference](https://dev.wix.com/docs/wix-cli/command-reference/project-creation/create-headless) |
| Headless capability | Integrated authentication and other capabilities differ between Astro, other managed frameworks and self-managed | [Path comparison](https://dev.wix.com/docs/go-headless/get-started/choose-your-development-path) |
| Site CLI preview | Requires a previously published site; uses live HTTP functions; not a Release Manager test site | [Site command reference](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands) |
| Git-connected editor | Code follows default branch/read-only editor; field changes affect live before publish; page copy omits code | [Git-connected behavior](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/changes-to-the-editor-when-your-site-is-integrated) |
| Web methods / code placement | `.web.js` exposes permitted methods; browser/public code is visible | [Web modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules), [code placement](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/overview/where-do-i-put-my-code) |
| Private reads / hooks | Backend overrides require application authorization; inventory supported hook bypass paths | [Security](https://dev.wix.com/docs/develop-websites/articles/best-practices/security-best-practices), [Data API](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/data-api/working-with-the-data-api) |
| HTTP caller identity | Direct site URLs do not carry Wix authentication context; REST/SDK calling path differs | [Custom site APIs](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/about-custom-site-apis) |
| App dashboard integration | Use the generated dashboard page registration and default component/provider; the simple page requires no manual API client or deprecated dashboard wrapper | [Dashboard page files](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/supported-extensions/dashboard/dashboard-pages/dashboard-page-extension-files-and-code), [SDK context](https://dev.wix.com/docs/api-reference/articles/sdk-setup-and-usage/develop-with-the-sdk) |
| Locations read | Read Locations scope; `listLocations` returns `.locations`; SDK uses `_id` and `address.formatted`, unlike REST `id`/`formattedAddress` | [List Locations](https://dev.wix.com/docs/api-reference/business-management/locations/list-locations?apiView=SDK), [SDK response objects](https://dev.wix.com/docs/sdk/backend-modules/business-tools/locations/locations-query-result/items), [permission tutorial](https://dev.wix.com/docs/build-apps/get-started/tutorials/tutorial-build-a-locations-app-with-the-cli) |
| Managed Astro CMS read | Generated Wix integration supplies visitor/member context; server execution is not admin access; selected Data SDK returns flat fields | [Astro integration](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/about-the-astro-integration), [SDK queries](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/work-with-data/data-api/query-items) |
| Headless template and rendering | Preserve generated Wix configuration; `prerender = false` reads at request time; template build script runs `astro build` | [Official template](https://github.com/wix/headless-templates/tree/main/astro/blank), [template scripts](https://raw.githubusercontent.com/wix/headless-templates/main/astro/blank/package.json), [Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/) |

Other useful operation-specific sources remain in the [Velo manual](the-missing-manual-to-velo.md) and [resource registry](99-official-resources.md). A source review is scoped to the claim checked; it is not an “all links verified” claim.

## Example boundaries to keep

- The member recipe reads a **custom `Orders` collection**, not Wix Stores order history. Trusted backend/admin work sets ownership. Its currency/display choices are examples, not payment rules.
- The CRM URL ends in `.invalid`. The helper is a tested transport example; secrets lookup, ingress protection, persistence, retries and provider completion are outside its implementation.
- Receipt/worker and integration tables are design sketches. No durable queue, exactly-once delivery or real provider connection is supplied.
- The greeting stores nothing and deliberately allows public callers. Copying that permission onto a private operation would change its security contract.
- The app example reads existing business locations on its installed development site; it creates no custom collection. Its local empty/error/retry fixtures are controlled UI examples, not live Wix responses.
- The Headless example intentionally reads an entirely public collection. Its output projection cannot make other fields in that collection private; member-owned records need a different contract. The seed CSV belongs only in a fresh test collection.
- Wix recipe acceptance still needs the target site's actual imports, elements, members, collection permissions and environment. Neither review exercised a live Wix account or provider, ran browser acceptance, deployed, or published.

## Earlier evidence

| Date | Status | Scope and limits |
| --- | --- | --- |
| 2026-10-26, first pass | Codex-run PASS, 34/34 checks | Earlier rewrite snapshot: 33 Markdown files, 160 links, 8 JS snippets, 21 controlled mock cases, 7 formatter tests; report `2026-10-26T20-33-35-006Z-58689.json` under `verification-results/` |
| 2026-10-03 | Ryan-run PASS, 15/15 checks | 32 Markdown files, 81 internal links, 3 JS syntax checks, 11 mocked cases on that snapshot; Node v22.22.3 |
| 2026-10-03 | Focused source corrections | HTTP identity, live Git-connected field changes, Velo/SDK count options and repeater scope; no live Wix exercise |
| 2026-09-21 | Uncorroborated historical report | Earlier claimed checks had no retained scripts/artifacts found during follow-up; not reproducible evidence of the current files |

The October 3 report was recorded as `verification-results/2026-10-03T22-06-27-413Z-87585.json`, at `2026-10-03T22:06:27.413Z`. It was read and matched against the then-current checker and two example documents; it does not cover this rewrite. Its key source hashes were:

~~~text
c6c547ac7d3eded4884cc508820d4747084f54674bb70afb1903a799304c7339  scripts/verify.mjs
356467f574ba2ce0b4c5a3f4a737a9671c04ad745c85555ea1bfd5af89786e7b  the-missing-manual-to-velo.md
7e6645a84047e64ae6fb5c3db34c5028f6d1fcc7e406183bf11811e1864bbe29  velo-for-fun-and-profit.md
~~~

Retain a new result when examples, links, structure or checker behavior change. For status-only edits made after a run, identify the metadata change rather than attributing it to the checked snapshot. Keep failed runs as failures. Use the exact report and source hashes when comparing evidence across versions.
