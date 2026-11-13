# Velo for fun and profit

Start with one useful action: show your own saved records, remove a repeated copy/paste step, or apply a rule that Wix's settings cannot express. Velo earns its upkeep when the site already has the data or member identity that action needs.

Use the Velo file paths and APIs below in **Wix Editor or Wix Studio**. The ideas about permissions, saves, and retries also apply in Studio Two, which has its own [component and backend model](https://dev.wix.com/docs/studio-two/get-started/about-extending-websites-with-studio-two). Check your editor in the [platform map](01-platform-map.md) before copying code.

For runnable code, use the [private member-orders recipe](the-missing-manual-to-velo.md#working-example-private-member-orders). It includes collection fields and permissions, editor IDs, backend and page code, a shared formatting helper, offline fixtures, and expected results. The other flows below are design outlines with their missing pieces named.

## Choose a small first build

| You want to… | Start here | A useful first acceptance case |
| --- | --- | --- |
| Display the current member's recent records | [Member-orders recipe](the-missing-manual-to-velo.md#working-example-private-member-orders) | A sees A's records; B sees B's; signed-out access fails |
| Show many useful pages with one layout | CMS collection + dynamic page | Two distinct rows produce the right content at two distinct URLs |
| Apply a calculator or eligibility rule | One pure rules function + a thin page/web method | Boundary inputs and invalid values produce explained results |
| Stop retyping a form into another tool | Private receipt + recoverable integration | A repeat click creates one receipt; failed sync remains visible |
| Collect a periodic summary | Bounded scheduled job + saved checkpoint | Interrupted work resumes without silently skipping rows |
| Show data from an external API | Backend adapter when credentials or trusted rules are required | Success, empty, rate-limited, and failed requests render usable states |
| Distribute a paid or member-only file | Entitlement check + explicitly private storage | An unauthorized caller cannot obtain a usable file URL |

Use native Wix features or an existing app when they meet the need with less maintenance. If the task needs substantial media processing, complex reporting, or transport guarantees beyond the site's documented limits, move that specific work to a suitable service. Apps become useful when installation and updates across multiple sites are part of the requirement. [Platform map](01-platform-map.md), [App development](05-app-development.md).

## Run something locally first

With **Node.js 20 or later**, run from this handbook's `docs/` directory (the Git repository root):

~~~sh
node examples/orders-demo.mjs
node examples/orders-demo.mjs --empty
node --test examples/order-presentation.test.mjs
~~~

The demo reads a local JSON fixture and prints display rows. Expect `$24.50 USD` / `Paid` for the first row; `--empty` prints `[]`. The tests exercise the actual helper used by the Wix recipe. No install, login, credential, network call, or file write is needed. [Example files and usage](examples/README.md).

This gives you a quick edit/run loop for formatting. Wix authentication, imports, collections, and rendering require separate site checks. The [verification record](21-verification-record.md) states what has actually been checked.

## Form to workflow: transport-only example

A form-to-CRM workflow needs durable state before it needs a fetch call. Give each user action a stable key, save the validated input with a pending receipt, and distinguish **saved**, **accepted by the other service**, and **completed**. Refreshing or retrying should reveal unfinished work and continue it safely.

The outline below is **design pseudocode**. The persistence operations are requirements to implement, not Wix APIs:

~~~text
acceptSubmission(input, actionKey):
  validate bounded input and apply the operation's authorization/abuse policy
  atomically create one receipt containing payload + pending state
  for an existing key, reject a different payload; return the matching receipt

processReceipt(receipt):
  claim pending work with a concurrency-safe mechanism
  use the same provider idempotency key on each retry
  validate HTTP status and the provider's completion contract
  record pending, completed, retryable failure, or permanent failure
  reconcile ambiguous outcomes before repeating an external mutation
~~~

A query followed by an insert is not an atomic claim. A unique `_id` or index can enforce receipt uniqueness, but worker claims and external duplicate effects still need a design. Keep receipts and submissions private; an anonymous web method does not itself grant access to an admin-only collection. [Indexes](https://dev.wix.com/docs/develop-websites/articles/databases/wix-data/collections/indexes-and-wix-data-collections), [permissions](09-security.md).

Create the following file as **`backend/crmTransport.js`** (`src/backend/crmTransport.js` in Git) only when building an integration. It is an internal helper, imported by backend code. It has no page element IDs or collection dependency. Its arguments are a backend-retrieved `apiKey`, validated `email`, and stable `actionKey`.

**The host is intentionally invalid. This is a transport/mock example, not a working CRM integration.** Before using a real service, replace the URL and verify its authentication, payload, idempotency support, rate limits, and completion response. The helper makes one request and has no save, retry, scheduler, or completion tracking.

~~~js
// backend/crmTransport.js — internal helper, not a web method
import { fetch } from 'wix-fetch';

export async function sendContact({ apiKey, email, actionKey }) {
  const response = await fetch('https://crm.example.invalid/v1/contacts', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      'idempotency-key': actionKey,
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    // Do not expose provider bodies or credentials to callers or logs.
    throw new Error(`CRM HTTP failure: ${response.status}`);
  }
  // A 2xx response proves HTTP acceptance only. For example, 202 may
  // require polling or a webhook before the receipt can become completed.
  return { httpAccepted: true, status: response.status };
}
~~~

An internal backend caller would use `await sendContact({ apiKey, email, actionKey })` after its validation and secret retrieval. Keep this out of page code. Wix `fetch()` can resolve on 4xx/5xx, which is why the helper checks `response.ok`. [Fetch behavior](https://dev.wix.com/docs/velo/apis/wix-fetch/fetch), [current secret retrieval API](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value).

| Controlled response | Expected helper result | Workflow meaning |
| --- | --- | --- |
| HTTP 200 | `{ httpAccepted: true, status: 200 }` | Consult the provider body/contract before declaring completion |
| HTTP 202 | `{ httpAccepted: true, status: 202 }` | Accepted; downstream work may still be pending |
| HTTP 400, 401, 429, or 500 | Rejects with `CRM HTTP failure: <status>` | Caller classifies permanent/retryable failure using the provider contract |
| Network rejection | Original rejection propagates | Completion may be uncertain; reconcile before retrying |
| No pending receipts | Worker performs no request | Empty work is normal; it is separate from an HTTP response |

The handbook's [offline verifier](scripts/verify.mjs) exercises this helper with controlled fetch responses. Those mocks do not contact a CRM. A real flow also needs tests for concurrent identical actions, a reused key with different input, success followed by failed receipt persistence, unfinished receipt retry, and recovery after interruption.

## Other useful flows: design outlines

### CMS-driven pages

Create one collection row per useful page, one dynamic page template, and per-item title, description, and content fields. Confirm two real rows resolve to their intended URLs and appear in the sitemap. Each page needs distinct value; generating more near-duplicate pages is not a useful outcome. Custom routers need their own routing and sitemap implementation. [SEO and analytics](14-seo-and-analytics.md).

### A calculator or eligibility rule

Put the rule in one pure function and give it representative valid, boundary, and invalid inputs. The page gathers inputs and explains the result. If the answer controls a price, entitlement, or transaction, the authorized backend must calculate or confirm it. Public helpers are suitable for nonsecret previews. Keep the rule version with any saved result so you can explain it later.

### A scheduled summary or sync

Point `backend/jobs.config` at one exported backend function. Query a bounded batch, save progress, and handle the next page when more work exists. Standard Wix Data queries return 50 items by default. Configure UTC times, check plan limits, and publish deliberately. Decide how to recover after a crash and how to reconcile a request whose remote outcome is unknown. [Scheduled-work details](the-missing-manual-to-velo.md#events-and-scheduled-jobs).

### An external-data widget

Choose the real API and write down its required input, credential, response shape, request budget, and failure behavior. Use a backend adapter when a secret or trusted rule is involved; return only the fields the page needs. The page displays loading, empty, success, and safe failure states. Cache public results only where freshness permits; member-specific results need identity-safe cache scope.

### A protected file download

Use a private original in Wix Media or access-controlled external storage. At each request, the backend checks the member and any paid entitlement, then creates a per-file temporary URL. Verify that direct access to the original is blocked; review any generated thumbnails too. Downloaded copies can be retained, so an expiring link is not copy protection. This outline still needs the chosen entitlement API, private-file setup, URL issuance code, and unauthorized-access tests. [Private files](https://dev.wix.com/docs/rest/assets/media/media-manager/files/private-files), [temporary download URLs](https://dev.wix.com/docs/api-reference/assets/media/media-manager/files/generate-file-download-url?apiView=SDK).

## Decide whether the build worked

For a personal tool, measure the action it enables and the effort it removes. A useful outcome could be: "I can resume the task with one button," "my work survives a reload," or "I can find pending submissions without retyping anything." For a commercial site, add the actual conversion or revenue measure the owner cares about.

Before depending on the flow, demonstrate its specific acceptance cases:

- The backend enforces identity and trusted rules and returns only permitted fields.
- Invalid input, no data, permission failure, and a slow/failed request leave a usable screen.
- Keyboard access and visible status make the main action easy to invoke and understand.
- Saved work can be found and resumed; exports or recovery match the workflow's importance.
- Repeated clicks and retries do not create untracked duplicate effects.
- The chosen Wix environment has been checked with the relevant identity, data, and published code revision.

Use [Testing and quality](11-testing.md) for evidence and [Checklists](18-checklists.md) for the broader launch decision. Avoid adding integrations, accounts, or infrastructure until a concrete workflow earns their upkeep.
