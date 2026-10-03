# Integrations, APIs, webhooks, and asynchronous work

Integrations fail at the edges: authentication expires, providers rate-limit, requests are duplicated, payloads change, and a successful response arrives after the user has already retried. Design the edge as a product surface.

## Integration contract

For every external or Wix integration, record:

~~~text
Provider and API version:
Business purpose:
System of record:
Caller identity:
Credentials/secrets owner:
Allowed endpoints:
Request schema:
Response schema:
Timeout:
Retryable failures:
Retry budget and backoff:
Idempotency strategy:
Rate-limit strategy:
PII or sensitive data:
Monitoring:
Provider outage behavior:
Deactivation/recovery:
~~~

If the provider has no stable version or schema, add contract tests and a change watch.

## Backend-first calls

Call APIs requiring secrets, privileged identity, or business-rule enforcement from backend code. A frontend should call a narrow application operation, not carry a provider credential.

Return stable application states instead of leaking provider internals:

- accepted;
- completed;
- pending;
- invalid;
- not authorized;
- not found;
- temporarily unavailable;
- permanently failed.

Keep provider request IDs in diagnostic metadata when safe, but do not show raw authorization details to users.

## HTTP functions and public endpoints

If a site exposes HTTP functions or another public endpoint:

- document the public URL and method;
- decide whether it is public, authenticated, or signed;
- validate headers, body, query, and size;
- define CORS behavior explicitly;
- reject unexpected origins where applicable;
- add replay protection for signed callbacks;
- return the provider’s expected status code;
- do not expose stack traces or secrets;
- monitor traffic and failed authentication.

Writing and exposing site HTTP functions still uses Velo's `wix-http-functions` module. Calling those functions with Wix authentication context is supported by the HTTP Functions REST API and SDK module, and requires a published site. Direct `/_functions/` and `/_functions-dev/` URLs do not carry that context: do not assume they establish a member identity. Direct external calls need the intended caller's signature/authentication checks and operation-level authorization. See [custom site API authentication](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/integrations/exposing-services/about-custom-site-apis) and the [endpoint matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments).

## Webhook processing

Use a two-phase mental model:

1. **Accept:** authenticate, validate, deduplicate, persist a receipt, and acknowledge quickly.
2. **Process:** perform business work asynchronously or in a bounded handler, record outcome, and retry safe failures.

The receipt should make these questions answerable:

- have we seen this event ID?
- which app/site/account does it belong to?
- what version of the handler processed it?
- did side effects begin?
- did they finish?
- can an operator safely replay it?

Design for:

- duplicate delivery;
- out-of-order events;
- delayed delivery;
- missing referenced records;
- provider retries after a timeout;
- a deploy during processing;
- poison events that will never succeed.

## Retries and idempotency

Retry only failures that are likely transient. Use bounded exponential backoff with jitter where the platform and provider allow it. Do not retry:

- invalid input;
- authentication failures until credentials are repaired;
- permission failures;
- a known non-retryable provider response;
- a mutation without an idempotency strategy.

Create or derive an idempotency key once per logical business action and reuse it for retries. A random key created once and retained is valid; a new key on every attempt is not. Bind the key to the normalized payload and reject conflicting reuse.

## External scripts and browser integrations

Treat client-side scripts as production dependencies:

- load only what is necessary;
- use the safest loading mode;
- document data collection and consent;
- avoid blocking critical content;
- test failure and ad-blocked behavior;
- verify that the script cannot mutate unrelated page state;
- define a removal switch.

See [Performance](13-performance.md) and [Security](09-security.md) before shipping a third-party script.

## Service plugins and app extensions

For app or service-plugin integrations, define:

- extension lifecycle;
- supported Wix products and versions;
- installation and uninstall behavior;
- permission scopes;
- timeout and response contract;
- retry and duplicate behavior;
- dashboard diagnostics;
- compatibility policy.

An extension should degrade cleanly if the target Wix product is unavailable or not installed.

## Integration testing

Use a layered strategy:

- unit-test normalization, mapping, retry classification, and idempotency;
- contract-test representative provider responses;
- use provider sandbox or development credentials for integration tests;
- replay signed and malformed webhook fixtures;
- test timeout, 429, 401, 403, 404, 409, 5xx, malformed JSON, and oversized responses;
- run a small live smoke test after release;
- record which tests require network access or external accounts.
