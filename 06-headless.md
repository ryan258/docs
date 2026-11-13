# Build a Wix Headless reading list

This example serves **`/reading-list` from Wix-managed Astro**, reads a real Wix CMS collection through `@wix/data`, and renders useful links in curated order. It includes complete source files, seed content, empty/error screens, and offline checks. No API key or member login is needed because the collection deliberately contains public content.

**Runtime boundary:** run the page inside the generated Wix-managed Astro project. Wix's Astro integration supplies visitor authentication to direct SDK calls; copying it into a generic Astro project does not supply that context. The code is complete for the documented setup; a live Wix run and full Astro compilation remain separate acceptance steps. [Wix Astro integration](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/about-the-astro-integration).

## Choose the path with the least upkeep for your requirement

| Path | Authentication/hosting | Use this example? |
| --- | --- | --- |
| Wix-managed Astro | Wix integration manages visitor sessions and hosting | Yes; this is the selected runtime |
| Wix-managed, another supported framework | Wix hosts your static build or server output targeting Cloudflare Workers. You configure authentication. | Adapt using that framework's Wix client and build setup |
| Self-managed frontend | Your host and Wix client/session handling | Use the [self-managed setup](https://dev.wix.com/docs/go-headless/authentication/setup/create-an-sdk-client-with-oauth); do not assume the direct-import context exists |

A local tool needs Headless only when Wix services are part of its job. This example demonstrates a public CMS read; private/member-owned records require a different authorization contract.

For an existing Astro project, Wix's link flow currently accepts Astro 5 and Astro 7. This recipe uses the versions from the generated blank starter. Keep its framework and integration versions together. [Supported managed frameworks](https://dev.wix.com/docs/go-headless/wix-managed-headless/about-supported-frameworks) · [Connect an existing Astro project](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/connect-an-existing-astro-project)

## Create a blank managed Astro starter

**Operator setup, not a command run by this handbook.** Requires Git, a Wix account, and Wix's current CLI runtime; see [project setup](03-project-setup.md). From this handbook's **`docs/` Git root**, create a **new** `reading-room` project beside the handbook:

~~~sh
cd ..
npm create @wix/new@latest -- headless \
  --folder-name reading-room \
  --business-name "Reading Room" \
  --site-template blank \
  --no-publish \
  --skip-git
cd reading-room
npm install --save-exact @wix/data
~~~

The scaffold provisions a site and private app in your Wix account, creates local files, installs dependencies, and configures the integration. `--no-publish` disables the scaffold's default publication. `--skip-git` skips Git initialization and its initial commit. [Headless scaffold reference](https://dev.wix.com/docs/wix-cli/command-reference/project-creation/create-headless)

Keep the generated `astro.config.mjs`, `wix.config.json`, package manifest, and lockfile. They connect the project to its Wix site and runtime. Do not replace them with a generic Astro configuration. The [official blank template](https://github.com/wix/headless-templates/tree/main/astro/blank) supplies Astro, `@wix/astro`, `@wix/astro-pages`, and the related Wix dependencies; `@wix/data` is the package added for this example. No React component library or standalone server is needed.

## Create and seed the public collection

In the **new project's dashboard**, open CMS and create a regular, multiple-item **content collection** with collection ID **`ReadingList`**. Verify the ID, not just its display name. Headless projects include CMS support. [Wix CMS](https://dev.wix.com/docs/overview/site-features-tools/cms).

| Field ID | Type | Contract |
| --- | --- | --- |
| `title` | Text | Required; 1–100 characters after trimming |
| `url` | URL | Required absolute HTTPS URL; no embedded username/password |
| `summary` | Text | Optional; at most 240 characters |
| `position` | Number | Nonnegative integer; use distinct values for a clear order |
| `_id` | System | Assigned by Wix; do not add a custom field with this name |

Set **Read: Anyone; Create, Update, Delete: Admin only**. Every field in this collection is public; keep private notes, member data, and credentials elsewhere. The page uses ordinary visitor permissions with no elevation or permission override.

For a short setup without retyping content, import [seed.csv](examples/headless-reading-list/seed.csv) into this **new, empty test collection**. Map all four columns to the exact field IDs/types above; Wix supplies system IDs. If item visibility/status controls are enabled, make the two test items visible/published. Importing into an existing collection can replace unmapped field values, so use this seed only for the new example collection. [Wix CSV import procedure](https://support.wix.com/en/article/wix-code-importing-data-in-the-data-manager).

Expected seed order:

| Position | Title |
| --- | --- |
| 10 | Wix Astro integration |
| 20 | Astro on-demand rendering |

The JSON [offline fixture](examples/headless-reading-list/reading-list.fixture.json) represents those two API results with synthetic system IDs. It is not a CMS JSON import file. Use the collection environment read by the selected project; do not seed an unrelated site's CMS.

## Add the complete source files

These are full files, with no missing adapters or placeholder API methods:

| Source in this handbook | Destination in generated project |
| --- | --- |
| [reading-list.astro](examples/headless-reading-list/reading-list.astro) | `src/pages/reading-list.astro` |
| [reading-list.mjs](examples/headless-reading-list/reading-list.mjs) | `src/lib/reading-list.mjs` |
| [reading-list.d.mts](examples/headless-reading-list/reading-list.d.mts) | `src/lib/reading-list.d.mts` (types for the strict generated project) |

You can copy them in your editor, or run these commands **from the generated `reading-room/` folder**, with the handbook in the sibling `docs/` directory:

~~~sh
mkdir -p src/lib
cp -n ../docs/examples/headless-reading-list/reading-list.mjs src/lib/reading-list.mjs
cp -n ../docs/examples/headless-reading-list/reading-list.d.mts src/lib/reading-list.d.mts
cp -n ../docs/examples/headless-reading-list/reading-list.astro src/pages/reading-list.astro
~~~

`cp -n` preserves an existing destination file; compare it with the linked source if the destination already exists. The declaration sits beside the `.mjs` helper so strict TypeScript tooling can type the route's import. The fixture, tests, and CSV stay in this handbook. No editor element IDs, dataset, `.web.js` module, or HTTP endpoint is required.

## Add the first data operation deliberately

The route imports the real SDK namespace:

~~~js
import { items } from '@wix/data';
~~~

Its imported `loadReadingList(items)` helper runs `items.query('ReadingList').ascending('position').limit(50).find()`. These are SDK Data Items methods, and collection fields appear directly on each result object. Do not substitute the older `dataItems.queryDataItems()` envelope or Velo `suppressAuth` options. [SDK query guide](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/work-with-data/data-api/query-items), [flat field result example](https://dev.wix.com/docs/develop-websites-sdk/get-started/tutorials/data/tutorial-display-database-collection-content-in-a-repeater).

The helper validates each result, accepts only HTTPS links, and returns `id`, `title`, `href`, and `summary`. The Astro template escapes text through normal expressions and never uses `set:html`. It reads at request time through `export const prerender = false`, avoids response caching, and returns HTTP 503 with a safe retry screen when the query or validation fails. [Astro on-demand rendering and response status](https://docs.astro.build/en/guides/on-demand-rendering/).

This is a bounded list of the first 50 records. The displayed limit is intentional; full-history pagination and browser writes are outside this example.

## Start it and check filled, empty, and error results

From the **generated `reading-room` project root**:

~~~sh
npm run dev
~~~

Use the exact local URL printed by the dev command and append **`/reading-list`**. There is no hard-coded port. The root route `/` can retain the blank starter; the useful feature lives at `/reading-list`. Stop the local process with Control-C.

| Action in the disposable example project | Expected outcome |
| --- | --- |
| Open `/reading-list` after seeding | HTTP 200; two titled links in position order, summaries, and `Refresh reading list` |
| Open without signing in | Same public list; no login or API key required |
| Follow a title link | Navigate to that exact HTTPS reference |
| Remove only the two example records, then refresh | HTTP 200; `No reading links yet.`; Refresh remains available |
| Restore the fixture content, change one URL to `http://example.invalid/`, then refresh | HTTP 503; `Reading list unavailable`; no misleading partial list |
| In a disposable copy, change `ReadingList` in the helper to a missing collection ID | Same safe error screen; terminal logs only `ReadingList load failed` |
| Correct the data/ID, then choose Refresh | Filled list returns once the successful query reflects the correction |
| Use keyboard navigation and narrow/enlarged text | Each link and Refresh remains operable with visible focus and readable wrapping |

CMS changes are real data changes even while the frontend is local. Use only the fresh example site and fixtures for these cases. Publishing and target-site acceptance are separate from creating these files.

After the route works in development, compile it from the generated project root:

~~~sh
npm run build
~~~

The [blank template's build script](https://raw.githubusercontent.com/wix/headless-templates/main/astro/blank/package.json) runs `astro build`. Expected: compilation finishes successfully with the generated Wix adapter; it does not publish the site. Keeping `prerender = false` leaves the CMS query for requests rather than treating build success as evidence that the collection can be read. Import, type or adapter failures belong in this project build; the handbook's offline tests cannot establish those dependencies.

## Check the example offline

From this handbook's **`docs/` Git root**, with Node.js 20+:

~~~sh
node --test examples/headless-reading-list/reading-list.test.mjs
~~~

These tests import the same helper used by the Astro route and control only the SDK query boundary. They check query collection/sort/limit, projection, empty data, propagated failure, unsafe links, malformed records, and immutability. They need no package install or network. They cannot establish Wix authentication, CMS permissions, SDK import resolution, or compilation/rendering of the complete Astro template. See [current verification](21-verification-record.md).

## Troubleshooting

| Symptom | Smallest useful check |
| --- | --- |
| `@wix/data` cannot be resolved | Run the documented package install in the generated project, not the handbook |
| Authentication/context or 403 error | Start the project through its generated dev script; preserve Wix integration/config; check the collection's Anyone-read permission; do not add an API key to the page |
| Collection not found | Confirm the dashboard belongs to this project and its exact collection ID is `ReadingList` |
| List is empty after import | Check collection environment, item visibility, field IDs, and actual saved rows |
| Data exists but page shows 503 | Inspect title/URL/position/summary against the contract; numbers imported as text are invalid |
| `/reading-list` is missing | Verify `src/pages/reading-list.astro` exists in the active project; start with that route, not the root page |
| Changes appear only after building | Keep `prerender = false`; retain the generated Wix adapter/integration; use the dev script |
| Plain Astro says an SSR adapter is required | This recipe needs the Wix-managed scaffold; copying only the page does not configure hosting/authentication |

## Check identities before connecting real data

This example's entire collection is public. Before adapting it to private records, define the member session, allowed resource owner, backend authorization, safe response, and cache scope. Check ownership for each record even when collection permissions require membership. Use the Astro integration's built-in authentication routes to handle OAuth and the member session if you add custom login or signup forms. [Velo example for the ownership boundary](the-missing-manual-to-velo.md#working-example-private-member-orders) · [Managed Astro login and signup](https://dev.wix.com/docs/go-headless/authentication/members/custom-login-page/add-custom-login-with-the-astro-integration)

## Keep existing sites recoverable

Use a new test project for this walkthrough. If you want a second frontend that shares an existing site's business data while the editor-built site remains public, follow Wix's guide to adding a self-managed frontend. [Add a frontend to an existing site](https://dev.wix.com/docs/go-headless/self-managed-headless/get-started/add-a-frontend-to-an-existing-wix-site)

To replace an editor-built frontend with Wix-managed Astro, check the owner and connected domain requirements. Wix previews the new frontend separately while the original site continues serving the public domain. With Wix's documented migration setup, the preview frontend reads business data from the original site. Confirm which data a test can change. Inventory URLs and redirects, form IDs, member pages, Wix apps, analytics, and existing Velo dependencies before cutover. Rebuild the editor UI and page code the new frontend still needs. **Complete Migration** starts the handoff to the finalization step, which builds and releases to the public domain. Record who runs it and where to use **Switch back** in Headless Settings. [Wix migration instructions](https://support.wix.com/en/article/wix-headless-moving-your-site-to-a-custom-frontend) · [Developer migration checklist](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/post-migration-checklist-wix-studio-and-editor-sites-to-headless) · [Release record](templates/release-record.md)

Wix's migration references differ on Velo HTTP functions. Wix Support says the new frontend can call existing HTTP functions. The developer checklist says the old `/_functions` URLs stop reaching the Velo backend after the switch. Before cutover, plan a replacement and a recovery step for each required integration. Include the expected URL and caller identity in the cutover checks. [Wix Support migration FAQ](https://support.wix.com/en/article/wix-headless-moving-your-site-to-a-custom-frontend) · [Developer migration checklist](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/post-migration-checklist-wix-studio-and-editor-sites-to-headless)
