# Integrations, APIs, webhooks, and asynchronous work

Keep the first integration small: one backend operation, one fixed provider endpoint, one response contract, and an obvious recovery action. Add automatic retries or background processing only when you can preserve the action and tell whether it already succeeded.

The [CRM transport recipe](velo-for-fun-and-profit.md) is the code starting point. Its placeholder provider illustrates request construction and HTTP failure handling. It does not establish a real provider contract, durable idempotency, or a background queue.

## Integration contract

Here is a **design sketch** for a contact-export integration. The `.invalid` host is deliberately fictional; replace the contract with the chosen provider's documentation before making a real request.

| Decision | Filled example |
| --- | --- |
| Purpose / system of record | Export one approved inquiry; local request record remains the source of truth |
| Caller | Site owner approves a saved request through an Admin-only operation |
| Destination | `POST https://crm.example.invalid/v1/contacts`; fixed backend configuration |
| Credential | Development API key in backend secret store |
| Input sent | `{ "email": "reader@example.invalid" }` |
| Action key | `contact-export:demo-request-7`; created once and saved with the request |
| Success | HTTP acceptance is recorded; business completion follows the real provider contract |
| Request budget | One attempt initially; automatic retry disabled until provider idempotency is verified |
| Timeout | Choose a supported transport deadline below the handler's execution limit; record the actual mechanism |
| Failure visible to owner | `pending`, `needs_setup`, `rejected`, or `outcome_unknown` |
| Retained diagnostics | Action key, provider request ID if safe, status, attempt count; no credential |
| Recovery | Inspect provider/request state; retry the same saved action only when safe |
| Disable | Turn off the export operation without deleting the saved inquiry |

An `Idempotency-Key` header only has meaning if the provider supports and enforces that contract. Document its scope, expiry, payload-conflict behavior, and result lookup. The transport helper cannot create those guarantees on its own.

## Backend-first calls

The page should collect intent, while the backend owns the external request:

~~~text
Owner clicks Export on saved inquiry demo-request-7
  -> Admin-only export operation loads that inquiry
  -> validates allowed fields and current export state
  -> resolves backend secret and fixed endpoint
  -> sends the minimized provider payload using the saved action key
  -> records accepted / rejected / outcome unknown
  -> returns a safe state to the page
~~~

This is the workflow around the companion transport, not a complete implemented export service. For a personal tool with occasional exports, a visible manual retry can be sufficient. It avoids maintaining a worker until the workload justifies one.

## HTTP functions and public endpoints

| Project | Page-to-backend call | External server call |
| --- | --- | --- |
| Wix Editor or Wix Studio | `.web.js` web method | `wix-http-functions` in `backend/http-functions.js` |
| Studio Two | HTTP endpoint in `src/api/`, called with `httpClient.fetchWithAuth()` | Unavailable for Studio Two site code in the initial release |
| Current Wix CLI apps and Wix-managed Headless with Astro | HTTP endpoint in `src/pages/api/` | HTTP endpoint with authentication appropriate to the caller |
| Self-managed app or Headless | Your own backend and caller identity handling | Your own backend and provider authentication |

For Wix Editor and Wix Studio, a direct custom-site URL calls the HTTP function without Wix caller context. The separate REST/SDK HTTP Functions API provides Wix caller context and requires a published site. Check the [Velo endpoint matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments) to identify which code and identity a URL uses. [Wix custom site APIs](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/build-a-custom-backend/expose-services/about-custom-site-apis), [Wix API exposure by development path](https://dev.wix.com/docs/overview/backend-services/exposing-apis), [HTTP endpoint file conventions](https://dev.wix.com/docs/backend-extensions/http-endpoints/about-http-endpoints).

For an external webhook endpoint, record the method, exact environment URL, provider authentication scheme, accepted event types, body-size policy, response codes, and replay handling. Authenticate server-to-server requests at the handler. CORS governs browser access.

## Webhook processing

A webhook endpoint needs both acceptance and recovery. The following receipt is a **storage design example**, not an implemented Wix collection or worker:

~~~json
{
  "eventKey": "demo-provider:account-2:evt-17",
  "eventType": "contact.updated",
  "resourceId": "demo-contact-3",
  "scopeId": "account-2",
  "state": "pending",
  "attempts": 0,
  "handlerVersion": "1",
  "receivedAt": "2026-10-26T15:00:00.000Z",
  "nextAttemptAt": null,
  "lastErrorCode": null
}
~~~

Process the receipt in this order:

1. Verify the provider's authentication/signature against the required original bytes, then validate the event type and authenticated account/site scope.
2. Claim `eventKey` using a supported uniqueness or atomic mechanism. An existing completed receipt means no new side effect. An existing pending/failed receipt goes through the recorded recovery path.
3. Persist enough validated information to resume, then acknowledge according to the provider's documented protocol.
4. A supported worker/job processes the receipt, records attempts, and moves it to `completed`, `retryable_failed`, or `permanent_failed`.

If no durable processor is configured, keep the work within a supported bounded handler or leave it pending for an explicit operator action. Returning an HTTP response and starting an unawaited promise is not a recovery strategy.

A `processing` state also needs a lease/expiry or another way to recover a crashed attempt. Claiming a receipt once and leaving it stuck forever is not idempotent recovery. If events can arrive out of order, compare a provider-supported version/timestamp or fetch authoritative current state; never let an older event silently overwrite a newer value.

For Wix events delivered to a supported Wix-managed handler, Wix verifies and decodes the event before invoking your code. For a Wix app webhook delivered to your own server, verify the signed JWT with the app's webhook public key. In either case, design for duplicate and out-of-order delivery. A backend event handler runs without the initiating user's identity in context. [Wix events and delivery](https://dev.wix.com/docs/overview/backend-services/events), [Self-managed Wix app webhooks](https://dev.wix.com/docs/build-apps/develop-your-app/api-integrations/events-and-webhooks/about-webhooks).

## Retries and idempotency

Classify the result before retrying:

| Result | Next action |
| --- | --- |
| Invalid payload / unsupported event | Correct or permanently reject; repeating it will not help |
| `401` / `403` | Repair credentials/permissions; do not loop |
| `429` | Follow provider rate-limit instructions, within a bounded retry budget |
| `5xx` before a known result | Retry only if the operation is safe/idempotent under the provider contract |
| Network timeout after sending a mutation | Mark outcome unknown; reconcile by saved action key or provider lookup |
| Accepted asynchronous response | Save pending/accepted state and follow the provider's completion protocol |

For an idempotent provider operation, save one key per logical action, reuse it on every attempt, and bind it to the normalized payload. Reusing a key with a different payload must be rejected. Bound attempts and elapsed time; expose the final failed/pending state so an owner can resume without guessing.

A read may be safe to repeat but still needs a request budget. A mutation without a verified provider idempotency or reconciliation mechanism should not gain automatic retries just because its HTTP status looks transient.

## External scripts and browser integrations

For a browser widget, document the value it adds, its network/data collection, and the off switch. Show a useful fallback when it is blocked or unavailable. Keep provider credentials in the backend even when the visible widget runs in the page. See [performance](13-performance.md) and [security](09-security.md).

## Service plugins and app extensions

Use these extra controls when building a Wix app or service plugin: installation-scoped credentials and receipts, lifecycle/uninstall cleanup, requested scopes, a bounded response contract, and behavior when the target Wix product is missing. An event key for a distributed app must include the authenticated installation/account scope, rather than relying on a globally unique-looking event ID alone. See [app development](05-app-development.md).

## Integration testing

Start with deterministic checks for the branch you changed. The companion transport's offline fixtures can prove request shape, expected status handling, and network-error propagation. They cannot prove that a provider honors idempotency or that a Wix permission/secret is configured.

Before a deliberately authorized development-site/provider check, prepare one synthetic record and the exact expected state after each of: success, invalid payload, missing credential, rate limit, and uncertain mutation outcome. Use sandbox credentials and retain the action key. Record which paths were mocked, which ran against Wix/provider infrastructure, and what remains unknown. See [testing and evidence](11-testing.md).
