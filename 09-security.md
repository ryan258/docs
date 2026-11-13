# Security, privacy, and trust boundaries

Start with the operation that reads or changes private data. Establish the caller on the backend, authorize the specific resource, validate inputs, and return only the fields the caller needs. A page's visibility and a disabled button do not supply that boundary.

## Threat model the real surfaces

For the [member-orders recipe](the-missing-manual-to-velo.md#web-modules-webjs-permissions-and-elevation), this compact threat model is enough to start:

| Attempt | Control | Evidence to collect |
| --- | --- | --- |
| Signed-out visitor calls the operation | `Permissions.SiteMember`; backend rejects missing member ID | Rejected before collection access |
| Member A requests B's records | No member-ID parameter; query uses backend-resolved member ID | A and B see only their own seeded rows |
| Member tries direct CMS access | All custom `Orders` CRUD permissions Admin | Direct member read/write is denied |
| New private field is added later | Response constructs only `{ id, total, status }` | `privateNote` and any extra fixture field stay absent |
| Page failure prints private data | Safe UI message; redacted diagnostics | No full record or credential in page/log output |

Add threats when adding a surface. A local personal helper does not need an app-installation threat model. A distributed Wix app does: see [installation state](05-app-development.md#installation-specific-state).

## Code visibility

In Wix Editor and Wix Studio, page, public, and `masterPage.js` code is visible to visitors, including on restricted pages. Apply the same rule to browser code in Studio Two and Headless. Keep secrets and private operations on the server and return only the fields the caller needs. [Wix security best practices](https://dev.wix.com/docs/develop-websites/articles/best-practices/security-best-practices), [Wix frontend-to-backend communication](https://dev.wix.com/docs/overview/backend-services/frontend-to-backend-communication).

A backend file prevents visitors from reading its implementation, but an exposed operation still needs caller and resource checks. Treat its arguments as user input.

## Secrets

For a site integration, store provider credentials in Wix Secrets Manager and retrieve a fixed secret by name in backend code. Use the current Get Secret Value method for your project lane. In Studio Two, use `@wix/secrets` with `auth.elevate()` from `@wix/essentials` in the authorized handler. For an external Headless backend, use the host's documented secret store. [Wix Secrets Manager](https://dev.wix.com/docs/overview/site-features-tools/secrets-manager), [Studio Two endpoint guide](https://dev.wix.com/docs/studio-two/code-your-site/build-a-custom-backend/http-endpoints/build-an-http-endpoint-in-studio-two).

A duplicated site starts with an empty Secrets Manager. Set up the duplicate with the intended development credential before exercising the integration. In Studio Two, secret changes take effect immediately. Check which site owns the credential before rotating it. [Wix Secrets Manager](https://dev.wix.com/docs/overview/site-features-tools/secrets-manager), [Manage secrets in Studio Two](https://dev.wix.com/docs/studio-two/code-your-site/developer-environment/secrets/manage-secrets-in-the-secrets-manager).

Keep a record containing names and ownership, never values. Example for a single-owner CRM integration:

| Item | Example record |
| --- | --- |
| Purpose | Submit approved contact requests to the chosen CRM |
| Secret reference | `CRM_API_KEY` (example secret name; use the name configured in Secrets Manager) |
| Owner | Site owner |
| Environment | Development credential distinct from production |
| Scope | Minimum provider permission needed to create contacts |
| Missing-secret behavior | Fail before provider call; show “Integration needs setup” |
| Rotation | Owner replaces credential, verifies bounded request, revokes old value |

If a value leaks, stop the affected integration and rotate it. Removing it from the latest source file does not revoke it or remove historical copies.

## Authentication versus authorization

“Signed in” answers who is calling. It does not prove that the caller owns the requested order.

For `getMyRecentOrders()`, the backend resolves the member and filters by that ID. For a future `getMyOrder(orderId)`, the backend must also check that the selected order belongs to the caller before returning it. A valid record ID alone is insufficient. Reject a browser-supplied `memberId`, `siteId`, or role as an authority claim.

## Web methods and elevated access

For `.web.js` methods in Wix Editor and Wix Studio, choose the smallest permitted caller group (`Anyone`, `SiteMember`, or `Admin`). Check record ownership inside the method. [Wix web modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules).

The custom-orders example deliberately uses `suppressAuth` to read an Admin-only collection after resolving the member. Keep that override next to its member filter and explicit response projection. An elevated or permission-suppressed read should have a written reason and negative authorization cases. [Wix: Permission overrides](https://dev.wix.com/docs/develop-websites/articles/best-practices/security-best-practices).

Do not copy this override into an unrelated operation just to make a permissions error disappear. Diagnose the caller, collection settings, and intended access first.

For a Studio Two HTTP endpoint, a signed-out visitor can still have a valid visitor token. Check `auth.getTokenInfo()` inside the handler. For a member operation, require `subjectType === "MEMBER"`, use `subjectId` for ownership, and validate input before elevating the specific SDK call. Check signed-out visitors and Wix dashboard users separately because they arrive as different caller types. [Build an HTTP Endpoint in Studio Two](https://dev.wix.com/docs/studio-two/code-your-site/build-a-custom-backend/http-endpoints/build-an-http-endpoint-in-studio-two).

## Input validation

The [preference normalizer](08-data-content.md#write-discipline) provides a runnable example: it rejects arrays, unknown fields, invalid themes, and empty/overlong names, then returns a fresh allowed-field object. Run it on the backend before saving. UI validation can reuse the rule for quicker feedback.

Choose controls for the input you actually accept:

| Input | Concrete rule |
| --- | --- |
| Theme | Exactly `light`, `dark`, or `system` |
| Record ID | Correct shape plus ownership check after load |
| Redirect | Fixed application route or strict allowlist |
| Provider URL | Fixed configured host/path; never a visitor's arbitrary URL |
| HTML/rich text | Treat as untrusted; use a rendering/sanitization policy appropriate to that surface |
| Upload | Allowed size/type plus server-side content checks supported by the storage pipeline |

Validation should reject an invalid request before a privileged read, write, or external call. Size/rate controls belong at the ingress where supported; the normalizer alone does not provide them.

## Outbound requests

A browser should invoke `submitContactRequest(...)`; the backend chooses the provider endpoint and credential. Do not expose `fetchAnyUrl(url)` with privileged network access.

Before sending real requests, define the provider's host, authentication, payload fields, response handling, request limits, retry rules, and data retention. A timeout does not establish whether a remote write happened. See the [integration contract](10-integrations.md#integration-contract) for a filled example and the limits of the companion transport helper.

## Webhooks

Signature verification is provider-specific. Use the provider's documented algorithm, key handling, timestamp tolerance, and original request bytes where required; a generic parsed-JSON comparison is not a substitute. Verify before trusting the event's account/site fields.

Then validate the event type and scope, atomically claim its event key, and record processing state. A lookup followed by an insert does not by itself prevent two concurrent deliveries from both doing the work. The [webhook receipt example](10-integrations.md#webhook-processing) shows the state needed for recovery; it is a design sketch, not a deployed queue.

## Privacy and logs

Use a synthetic log like this to explain a failure without copying the request or private record:

~~~json
{
  "operation": "getMyRecentOrders",
  "correlationId": "demo-request-7",
  "actorClass": "member",
  "outcome": "data_unavailable",
  "durationMs": 148
}
~~~

Keep credentials, authorization headers, email bodies, private notes, and full provider responses out of routine logs. Add site/installation identifiers only when that scope is needed for diagnosis; define who can read the logs and how long they remain. Return a concise retry message to the page, with a correlation reference if it helps support.

In Studio Two, use the monitoring client from `@wix/essentials` for entries in Developer Tools → Logs. Browser `console` messages stay in the browser's developer tools. Wix keeps dashboard log entries for 24 hours by default. [Studio Two logs](https://dev.wix.com/docs/studio-two/test-your-site/work-with-logs/about-logs-in-studio-two).

## Dependencies and embedded code

A package, iframe, or browser script earns its place by solving a current task. Record its purpose, permission/network scope, update path, and removal switch. For an analytics script, also document what it collects and how the site behaves when it is blocked. See [performance](13-performance.md) for the loading budget.

## Security release gate

Before enabling a new private-data operation, collect these four pieces of evidence:

1. A filled [operation contract](07-architecture.md#boundary-first-design) and explicit collection permissions.
2. Authorized, signed-out, wrong-owner, and malformed-input results for that operation.
3. An inspected response and log showing that private fields and credentials are absent.
4. A known disable/recovery action, including credential rotation if a provider is involved.

Offline mocks can check filtering and validation. Wix authentication, permissions, secret access, and deployment behavior need a separate, deliberately authorized Wix development-site check. See [testing](11-testing.md).
