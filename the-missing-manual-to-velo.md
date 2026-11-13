# The missing manual to Velo

Use Velo when a Wix page needs a rule, a private data lookup, or an action that the editor cannot express. Start with the [complete member-orders example](#working-example-private-member-orders), then use the reference sections to diagnose problems. For a first public web method, use [Site development](04-site-development.md).

This manual applies to **Wix Editor and Wix Studio sites**. Studio Two uses Editor React Components and site HTTP endpoints; it does not run `$w` page code or `.web.js` modules. Wix Harmony supports standalone dashboard snippets and has no Velo site code. [Wix editor comparison](01-platform-map.md), [Studio Two coding differences](https://dev.wix.com/docs/studio-two/get-started/compare-extending-websites-in-studio-two-to-wix-editor-and-wix-studio).

The governing rule is simple: **the browser asks; the backend checks identity, applies the rule, and returns only the permitted fields.** A hidden button or members-only page improves the interface; the backend still decides what each caller may receive.

The examples use Velo modules such as `wix-data` to keep the recipe's imports, permissions, and query options consistent. Wix recommends its JavaScript SDK where a supported equivalent exists. Check the equivalent operation's caller identity, options, and response shape before migrating; keep Velo for APIs such as `$w` that this site model still needs. [Wix's Velo and SDK guidance](https://dev.wix.com/docs/velo/articles/api-overview/about-using-the-sdk). See the [verification record](21-verification-record.md) for what was checked.

## Execution contexts

| Location | Put this here | Important boundary |
| --- | --- | --- |
| Page code | Element handlers and calls to web methods | Browser-delivered; may also execute during server rendering |
| `masterPage.js` | Shared header, navigation, and site-wide handlers | Runs across pages; keep page-specific work in page code |
| `public/*.js` | Pure formatting and other nonsecret helpers | Publicly accessible; can be imported by frontend or backend code |
| `backend/*.web.js` | Functions exposed through `webMethod()` | Each function declares who may call it |
| `backend/*.js` | Internal backend helpers | Import from backend code, not page code |
| `backend/data.js` | Collection hooks | Only operations that invoke the hook are covered |
| `backend/events.js` | Wix event handlers | Use the event's documented signature and retry contract |
| `backend/http-functions.js` | A custom site API for external callers | Authenticate and validate each protected request |
| `backend/routers.js` | Custom URL-prefix handling | A page route does not authorize its backend data calls |
| `backend/jobs.config` | Scheduled-job declarations | Points at an exported backend function; uses UTC |

These are editor locations. In a Git-connected Wix site, backend and public files normally live under `src/backend/` and `src/public/`; use the project's existing structure. Frontend imports keep the Wix module path, for example `backend/orders.web`. Older `.jsw` web modules remain supported; prefer `.web.js` for new Velo web methods. [File placement](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/overview/where-do-i-put-my-code), [web modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules).

## The `$w` lifecycle

Initialize elements and register handlers inside `$w.onReady()`. During initial rendering, that callback can execute on Wix's server and again in the browser. Use `wix-window-frontend` `rendering.env` for effects that should run only in the browser; keep public content needed for rendering available to the server. Editor Preview skips server rendering. [Rendering environment](https://dev.wix.com/docs/velo/apis/wix-window-frontend/rendering/introduction).

For repeaters, register `onItemReady()` before assigning `.data`, and select each repeated element through the supplied `$item`. Existing IDs do not trigger `onItemReady()` again when their values change; use `forEachItem()` or `forItems()` to repaint them. The example below handles both creation and refresh. [Repeater lifecycle](https://dev.wix.com/docs/velo/velo-only-apis/%24w/repeater/the-lifecycle-of-repeated-items), [onItemReady()](https://dev.wix.com/docs/velo/velo-only-apis/%24w/repeater/on-item-ready).

Two small distinctions explain many UI bugs: `collapse()` removes layout space while `hide()` retains it, and assigning an input's `.value` does not trigger its `onChange` handler. Keep durable work in a deliberate save mechanism rather than page memory.

## Web modules: `.web.js`, permissions, and elevation

Wrap exposed functions in `webMethod()` and choose the least permission that fits: `Anyone`, `SiteMember`, or `Admin`. Validate arguments on the backend and return a small projection. Page code imports the web module without its final `.js`, for example `backend/orders.web`. [Web-method declaration and import example](https://dev.wix.com/docs/velo/apis/wix-web-module/web-method).

Collection permissions and web-method permissions are separate gates. Legacy `wix-data` supports `suppressAuth: true` in backend operations; this bypasses the collection's permission check. The code must establish the caller's authority first. Newer SDK APIs use `elevate()` where their references permit it; do not copy `suppressAuth` into SDK calls. [Wix Data permissions](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/data-api/working-with-the-data-api), [SDK migration differences](https://dev.wix.com/docs/velo/apis/wix-data/migrate-to-the-sdk).

### Working example: private member orders

**Result:** a signed-in member sees at most 50 of their own recent records, with loading, empty, error, and refresh states. The data comes from a custom collection named `Orders`. This example does not read Wix Stores orders or handle payments.

The request has no member-ID argument. The backend obtains identity from the Wix session, filters the collection, and returns only `id`, `total`, and `status`. This is the authorization boundary. Formatting code in `public/` only prepares display text.

#### 1. Prepare a development site and data

Use a development site with Velo and CMS enabled and a working Wix member login. Create two approved test members, A and B. In CMS, show Wix App Collections if necessary, open `Members/FullData`, and expose its system `_id` column. Match each account by its login email and copy its member `_id`. Do not substitute a contact ID or email. [Show Wix App Collections](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/collections/working-with-wix-app-collections-and-code), [member collection fields](https://dev.wix.com/docs/api-reference/business-solutions/cms/collection-management/wix-app-collections/wix-members-collections).

Create a **custom collection with collection ID `Orders`**. Display names can differ from API IDs; verify the actual collection and field IDs in the code sidebar. [Find collection and field IDs](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/work-with-data/introduction/find-collection-and-field-ids).

| Field key | Type | Contract for this example |
| --- | --- | --- |
| `memberId` | Text | Exact Wix member `_id`; assigned by the owner or trusted backend |
| `total` | Number | Nonnegative amount in USD dollars, such as `24.5`; display only |
| `status` | Text | `pending`, `paid`, or `cancelled` |
| `privateNote` | Text | Optional diagnostic value that must stay on the backend |
| `_id`, `_createdDate` | System fields | Let Wix create these |

Set **read, create, update, and delete permissions to Admin only**. Add synthetic rows manually as the site owner: two for A with totals `24.5` and `0`, and one for B with total `99`. Use actual member IDs in `memberId`, and set each `status` to one of the listed values. Create A's `24.5` row last so it sorts first. Put `synthetic private note` in `privateNote`.

Use the collection environment the chosen test path reads. If sandbox collections are enabled, inspect which environment contains the fixtures before debugging an empty result. Do not connect the collection directly to this page's elements; the web method owns access and the page code owns the displayed state.

#### 2. Add the page elements

Create a page named **My orders** and restrict it to site members. Add a normal member login entry through Wix's member tools. Set these element IDs in the editor's properties panel; code selectors include `#`, editor IDs do not.

| Element | Editor ID | Initial state |
| --- | --- | --- |
| Repeater | `ordersRepeater` | Collapsed; not connected to a dataset |
| Text inside its repeated item | `orderIdText` | Placeholder text |
| Text inside its repeated item | `orderTotalText` | Placeholder text |
| Text inside its repeated item | `orderStatusText` | Placeholder text |
| Text outside the repeater | `ordersMessage` | Visible: `Loading your orders…` |
| Button outside the repeater | `refreshOrders` | Visible, enabled, label `Refresh orders` |

The three item text elements must be inside the repeated item, not adjacent to the repeater. In the editor's accessibility settings, make `ordersMessage` a polite status announcement if the selected text element supports that setting. Keep Refresh usable with a keyboard and its label visible.

#### 3. Add `backend/orders.web.js`

Create this web module in the backend section. In a Git-connected project, use `src/backend/orders.web.js`.

~~~js
// backend/orders.web.js
import { Permissions, webMethod } from 'wix-web-module';
import { currentMember } from 'wix-members-backend';
import wixData from 'wix-data';

export const getMyRecentOrders = webMethod(Permissions.SiteMember, async () => {
  const member = await currentMember.getMember();
  if (!member?._id) throw new Error('Not signed in');
  const res = await wixData.query('Orders')
    .eq('memberId', member._id)
    .descending('_createdDate')
    .limit(50)
    .find({ suppressAuth: true });
  return res.items.map(o => ({ id: o._id, total: o.total, status: o.status }));
});
~~~

The permission override is deliberately next to a session-derived filter. Keeping all writes admin-only prevents a member from assigning themselves to another record. `currentMember.getMember()` currently rejects when signed out; the explicit `_id` check also rejects an absent/invalid member object. Wix documents limited member-API behavior in Preview, so check actual member identities on the intended published development path. [Current member](https://dev.wix.com/docs/velo/apis/wix-members-backend/current-member/get-member), [find() options](https://dev.wix.com/docs/velo/apis/wix-data/wix-data-query/find).

#### 4. Add `public/orderPresentation.js`

Copy the entire contents of [order-presentation.mjs](examples/order-presentation.mjs) into a public file named **`orderPresentation.js`** (`src/public/orderPresentation.js` in Git). The local `.mjs` file is an ES module for Node; its contents use ordinary JavaScript and no Node or Wix imports.

`toOrderRows()` validates the response shape, formats dollars and status labels, and adds valid repeater `_id` values. It throws on a malformed amount or identifier, returns `[]` for an empty response, and labels unfamiliar statuses `Status unavailable`. It preserves the supplied order. These are display rules; trusted prices and authorization remain backend responsibilities.

#### 5. Add the page code

Paste this in the **My orders page code**, not in `masterPage.js` or a backend file. Loading begins automatically; Refresh repeats the same read. The browser guard keeps this private panel's member request in the browser rendering pass.

~~~js
// Page: My orders
import wixWindowFrontend from 'wix-window-frontend';
import { getMyRecentOrders } from 'backend/orders.web';
import { toOrderRows } from 'public/orderPresentation.js';

let loading = false;

function renderOrder($item, row) {
  $item('#orderIdText').text = row.orderText;
  $item('#orderTotalText').text = row.totalText;
  $item('#orderStatusText').text = row.statusText;
}

async function refreshOrders() {
  if (loading) return;
  loading = true;
  $w('#refreshOrders').disable();
  $w('#ordersMessage').text = 'Loading your orders…';

  try {
    await $w('#ordersRepeater').collapse();
    $w('#ordersRepeater').data = [];
    const rows = toOrderRows(await getMyRecentOrders());
    $w('#ordersRepeater').data = rows;
    // Repaint existing IDs as well as newly created items.
    $w('#ordersRepeater').forEachItem(renderOrder);
    if (rows.length) {
      await $w('#ordersRepeater').expand();
      $w('#ordersMessage').text = `Showing ${rows.length} recent order(s). Maximum 50.`;
    } else {
      $w('#ordersMessage').text = 'No orders yet.';
    }
  } catch {
    $w('#ordersRepeater').data = [];
    await $w('#ordersRepeater').collapse();
    $w('#ordersMessage').text = 'Orders could not be loaded. Check that you are signed in, then choose Refresh orders.';
  } finally {
    loading = false;
    $w('#refreshOrders').enable();
  }
}

$w.onReady(async () => {
  if (wixWindowFrontend.rendering.env !== 'browser') return;
  $w('#ordersRepeater').onItemReady(renderOrder);
  $w('#refreshOrders').onClick(refreshOrders);
  await refreshOrders();
});
~~~

#### 6. Run the offline example, then verify the Wix boundary

From this handbook's `docs/` directory (the Git repository root) with **Node.js 20 or later**, these commands need no install, account, credential, or network:

~~~sh
node examples/orders-demo.mjs
node examples/orders-demo.mjs --empty
node --test examples/order-presentation.test.mjs
~~~

The first command prints two rows, including `"totalText": "$24.50 USD"` and `"statusText": "Paid"`. The second prints `[]`. To use a different local JSON array, pass its path, for example `node examples/orders-demo.mjs examples/orders.fixture.json`. Invalid JSON, an unreadable file, an invalid order, or more than 50 records produces `Orders demo failed: …` and exit code 1. Tests cover empty/malformed data, display labels, extra-field handling, source immutability, and 50 unique repeater IDs. They test formatting; they cannot enforce Wix permissions.

When the site owner chooses to publish the development version, use these acceptance cases. The instructions describe expected behavior; they are not a claim that this repository has passed a live Wix test.

| Case | Expected result |
| --- | --- |
| Sign in as A and open My orders | Two rows; newest `24.5` row first, displayed as `$24.50 USD`; B's `99` row absent |
| Sign in as B in a separate session | Only B's row; no A rows |
| Inspect the web-method response | Only `id`, `total`, `status`; no `memberId` or `privateNote` |
| A member with no matching rows | `No orders yet.`; repeater stays collapsed; Refresh remains available |
| Signed-out visitor | Page login restriction applies; a direct web-method call is also denied by `SiteMember` |
| In a disposable copy, use a missing collection ID or malformed `total` | Safe failure text; old rows cleared; Refresh enabled again |
| Change A's row as owner, then choose Refresh | New values repaint after the read reflects the change; no extra event handlers or duplicate rows |
| More than 50 records for A | At most 50 newest records; the UI identifies the limit |

After switching accounts, reload the page. Check member A, member B, and signed-out behavior separately; owner Preview alone cannot establish member isolation. This recipe is a bounded recent list. Full history needs a deliberate pagination contract; adding a browser-supplied `memberId` would weaken the current boundary.

## wix-data quirks that will bite you

| Situation | Working rule |
| --- | --- |
| You need every matching row | Standard queries default to 50. Set a limit and paginate with `results.next()` or another documented strategy; check app-collection limits. |
| You need a count | Legacy `wix-data` includes `totalCount` unless omitted; the Data Items SDK instead uses `returnTotalCount`. Keep their options separate. |
| You need a referenced record | Use `.include('fieldKey')` where supported; a reference ID alone is not the referenced object. |
| A hook should protect data | Hooks run on supported operations and can be suppressed by backend code. Validate exposed backend entry points too. |
| You need to update one field | Check `update()`'s replacement semantics and preserve fields that must remain. |
| You are preventing duplicate work | A query followed by an insert is not an atomic claim. Enforced uniqueness helps receipts; external effects need their own retry/reconciliation design. |
| A recent write is missing | Account for eventual consistency. Use `consistentRead: true` where supported and required; confirm the write succeeded first. |
| Code writes but a dataset looks old | Decide which path owns the UI; explicitly refresh the dataset when needed. |

[Velo queries](https://dev.wix.com/docs/velo/apis/wix-data/wix-data-query/introduction), [SDK migration](https://dev.wix.com/docs/velo/apis/wix-data/migrate-to-the-sdk), [query consistency and caching](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/data-api/about-caching-data-query-results).

## Secrets, fetch, and the backend environment

Keep credentials in Secrets Manager and retrieve only the secret required by an authorized backend operation. Wix lists `wix-secrets-backend.getSecret()` as [deprecated since September 7, 2025](https://dev.wix.com/docs/velo/apis/wix-secrets-backend/get-secret). Its replacement, [`secrets.getSecretValue()`](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value) from `wix-secrets-backend.v2`, takes a secret name, requires elevation, and returns a response object. Never accept an arbitrary secret name from a browser or return a secret to it.

For credentialed requests, fetch on the backend and check `response.ok`: Wix `fetch()` can resolve on HTTP 4xx/5xx. A successful HTTP response may still mean only "accepted," as the [CRM transport example](velo-for-fun-and-profit.md#form-to-workflow-transport-only-example) demonstrates. Validate the actual provider's response contract before marking work complete. [Wix fetch](https://dev.wix.com/docs/velo/apis/wix-fetch/fetch).

Backend module memory is temporary, not a durable save or a shared lock. Bound each operation against the target site's applicable runtime and request limits. Check [npm compatibility](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/packages/about-npm-packages) before choosing a package; local Node success does not establish Wix compatibility. Use Wix Logs for backend diagnostics and keep tokens, personal records, and provider bodies out of logs. [Debugging and logs](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/testing-monitoring/testing-troubleshooting/about-debugging-your-code).

## Routers, dynamic pages, and data binding

Use a CMS dynamic page when one template can display each collection item at a configured URL pattern. Read its item after the dataset is ready. Use a custom router when resolving a URL prefix requires custom logic; router data is available through `wix-window-frontend.getRouterData()`. A router needs its documented SEO response and sitemap entries. [Routers](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/routers/about-routers), [SEO and analytics](14-seo-and-analytics.md).

## Events and scheduled jobs

Generate event stubs or copy the exact signature from the current event reference. Collection hooks use names such as `<collectionId>_beforeInsert` in `backend/data.js`; there is no generic `wixData_onInsert` handler for that purpose.

Design event work to tolerate duplicates, delays, and interruptions. Confirm the delivery/retry contract for the specific event. An "already processed?" lookup alone is not safe against simultaneous workers; persist enough state to recover uncertain external outcomes.

Scheduled jobs point to an exported backend function through `jobs.config` (`src/backend/jobs.config` in Git). Use UTC, publish changes deliberately, and account for daylight-saving changes when the desired time is local. Wix documents execution within five minutes of the scheduled time; frequency and job-count limits depend on plan. Keep batches bounded and save checkpoints. [Scheduling rules](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/recurring-jobs/about-scheduling-recurring-jobs), [configuration](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/recurring-jobs/schedule-recurring-jobs).

## HTTP functions and preview environments

Export handlers such as `get_name` and `post_name` from `backend/http-functions.js`, returning helpers from `wix-http-functions`. For a protected operation, validate input and authenticate the external caller using a documented scheme. CORS controls browser access; it does not authenticate requests.

| Source to execute | Endpoint after the site base URL |
| --- | --- |
| Production code | `/_functions/<name>` |
| Published test-site code | `/_functions/<name>?rc=test-site` |
| Git branch and revision | `/_functions/<name>?siteRevision=<revision>&branchId=<branch>` |
| Latest editor code | `/_functions-dev/<name>`; the reference requires a test site |

Direct endpoint calls **do not carry Wix authentication context**. A member being signed in elsewhere does not establish identity in that handler. Operations requiring Wix caller context use the HTTP Functions REST API or SDK path with authorization and a published site; external webhooks normally use the provider's signature/authentication contract. [Endpoint source selection](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/site-api-calls), [authentication contexts](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/about-custom-site-apis).

CLI `wix preview` uses live HTTP functions, not local HTTP-function edits, and differs from a Release Manager test site. Record the actual endpoint and revision in an integration test. Preview also does not automatically isolate collections, credentials, or external side effects. [Site CLI behavior](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands).

## Diagnose by symptom

| Symptom | Inspect first |
| --- | --- |
| Element does not exist | ID spelling, page placement, `$w.onReady()`, repeated-item `$item` scope |
| Repeater has rows but still shows template text | Register `onItemReady()` before data; repaint existing IDs with `forEachItem()` |
| Web method cannot be imported | `.web.js` backend file; frontend import ending `.web`; exact exported name |
| Permission denied | Caller identity, web-method permission, then collection permission |
| Signed-in member gets no rows | Actual member `_id`, `memberId` field key/value, collection ID, chosen data environment |
| Data exists locally but HTTP endpoint behaves differently | Endpoint source selection; CLI preview's live HTTP-function behavior |
| A saved value looks old | Failed write, dataset state, consistency/caching; inspect the responsible path before retrying |
| `window is not defined` | Code reached the server rendering pass; inspect `rendering.env` |
| A retry sends twice | Missing provider idempotency/reconciliation or unsafe worker claim |

Test pure rules locally, then check Wix import resolution, actual identities, collection permissions, rendering, and provider contracts in the chosen Wix environment. Label these results separately. Keep [Testing and quality](11-testing.md) and the [verification record](21-verification-record.md) beside the evidence rather than treating a local test as a site acceptance result.
