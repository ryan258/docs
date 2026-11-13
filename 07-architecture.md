# Architecture and code organization

Start with one action, one owner, and one site. A small feature usually needs page code and a narrow backend operation. Add pure rules or a provider adapter when they isolate real work. Multiple app installations need extra isolation only when the project supports them.

## Start with a system map

Here is a filled map for **“Show my recent orders”** on Wix Editor or Wix Studio. It reads the custom CMS collection `Orders`. [Complete member-orders recipe](the-missing-manual-to-velo.md#web-modules-webjs-permissions-and-elevation).

~~~text
Orders page
  -> getMyRecentOrders() in backend/orders.web.js
      -> resolve the signed-in member on the backend
      -> query custom Orders where memberId equals that member's ID
      -> return at most 50 summaries: { id, total, status }
  -> render results, empty state, or retry control

Storage: custom Orders collection; all direct CRUD permissions Admin
External providers: none
Secrets: none
Writes and order creation: outside this read-only operation
Recovery: hide stale results; retry the read using Refresh
~~~

Record IDs, environments, and release details in the [site inventory](templates/site-inventory.md).

## Recommended layers

Keep the responsibilities clear even if two rows share a file.

| Place | Owns in the orders example | Add a separate file when |
| --- | --- | --- |
| Page code | Loading state, rendering, retry button | The UI has reusable components |
| `backend/orders.web.js` | Web-method permission, current member, query, safe response | Another operation needs the same application workflow |
| Pure rules module | Validation or transformations independent of Wix | The same rule appears in two places or needs isolated checks |
| Provider adapter | No file needed for this read | An external API introduces credentials, mapping, or failure handling |

On Wix Editor and Wix Studio, web modules use `.web.js` and expose functions through `webMethod()`. Its permission check controls who can call the method. Your code controls which records they can access. [Wix web modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules).

In Studio Two, the equivalent design uses an Editor React Component (ERC) for the UI and a TypeScript HTTP endpoint in `src/api/` for the backend operation. Keep reusable helpers outside `src/api/` so they stay out of the route tree. Apply the same member and record checks in the handler before reading private data. [Wix Studio Two HTTP endpoints](https://dev.wix.com/docs/studio-two/code-your-site/build-a-custom-backend/http-endpoints/about-http-endpoints).

## Boundary-first design

Keep a filled operation contract beside the implementation:

| Contract | `getMyRecentOrders()` |
| --- | --- |
| Caller | Signed-in site member |
| Input | None; the browser cannot select a member or collection |
| Authorization | Resolve member ID on the backend; filter `memberId` by it |
| Read | Custom `Orders`; newest first; maximum 50 records |
| Output | Array of `{ id, total, status }`; empty array is valid |
| Private fields | `memberId`, `privateNote`, and any unlisted fields stay in backend |
| Write / provider call | None |
| Failure | Missing identity rejects before querying; data failure reaches page error state |
| Retry | Safe to repeat this read; no durable mutation to deduplicate |
| Acceptance | Member A sees only A's rows; B sees only B's; signed-out access fails |

For writes, add normalized input, allowed transition, idempotency, and recovery rules.

## Keep APIs narrow

| Use | Avoid | Why |
| --- | --- | --- |
| `getMyRecentOrders()` | `queryCollection(name, filter)` | The caller cannot choose another member's data |
| `updateMyPreference({ theme })` | `updateRecord(id, fields)` | The backend controls ownership and writable fields |
| `submitContactRequest({ email, message })` | `callUrl(url, body)` | The backend controls the destination and payload |

The latter two rows are proposed interfaces. See [validation](08-data-content.md#write-discipline) and the [integration contract](10-integrations.md#integration-contract) before implementing them.

## State and concurrency

| Result | Page behavior |
| --- | --- |
| Read in progress | Hide old rows; announce loading; disable Refresh |
| `[]` | Show “No orders yet” |
| Non-empty array | Render summaries; describe the view as recent orders |
| Failure | Clear/hide rows, show a safe error, re-enable Refresh |

A disabled button reduces accidental repeats. For writes, preserve the action key across timeouts and retries. See [idempotency](10-integrations.md#retries-and-idempotency).

## Data and cache boundaries

Add caching only for a measured need. The key must include authenticated member and site/installation scope; a shared `recent-orders` key would disclose data. Example application policy: “Cache A's read for 15 seconds; invalidate after a confirmed update; query normally if cache lookup fails.” This is not a Wix default.

## Error design

Return actionable outcomes: “sign in,” “correct this field,” or “try again.” Put the diagnostic detail in a redacted log with a correlation ID. See the [log example](09-security.md#privacy-and-logs).

## Naming and structure

A possible project layout, once the feature grows:

~~~text
page code / Orders             # UI and imports of exposed operations
backend/orders.web.js          # callable boundary
backend/orderRules.js           # pure rules, only if needed
backend/crmTransport.js         # external provider, only if needed
~~~

Create only files the feature needs; this tree is a layout sketch.

## Architecture review triggers

Update the map and negative cases when a read gains side effects, content gains private fields, a new caller needs privileged access, or one site becomes multiple installations.
