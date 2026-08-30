# Security, privacy, and trust boundaries

Security in a Wix project is mostly about preventing a trusted platform from being used through an untrusted boundary. Browser code, CMS permissions, backend methods, app callbacks, external webhooks, and dashboard settings all deserve review.

## Threat model the real surfaces

At minimum, consider:

- anonymous visitor input;
- logged-in member input;
- Wix user or collaborator actions;
- app installation and duplication;
- browser inspection and replay;
- malicious or malformed webhook requests;
- third-party API compromise or outage;
- leaked repository, preview URL, or log;
- cross-site or cross-installation data access;
- accidental publication of test data;
- dependency or embedded-script supply-chain risk.

For each threat, state the control and the evidence that proves it.

## Code visibility

Assume page, public, and master-page code is visible to a visitor. Never place these in browser-delivered code:

- API keys;
- OAuth client secrets;
- signing secrets;
- database credentials;
- private member records;
- privileged business rules that must not be disclosed;
- unrestricted collection or provider access.

Backend code is not automatically safe: it still needs authorization, input validation, least privilege, and safe responses.

## Secrets

Use Wix Secrets Manager for site secrets and the documented secret mechanism for app or Headless projects. Store secrets by purpose, not in source files or collections.

Rules:

- never commit a secret, even temporarily;
- never log a secret or a full authorization header;
- never return a secret to a browser;
- rotate compromised or overexposed credentials;
- keep development and production secrets separate;
- record who owns each secret and when it was last reviewed;
- fail closed when a required secret is missing;
- do not use a production secret in a test environment unless specifically approved.

## Authentication versus authorization

Authentication answers “who is calling?” Authorization answers “may this identity perform this operation on this resource?”

Enforce authorization at the backend operation boundary:

1. establish the caller identity using the platform’s current API;
2. load the server-side resource or site context;
3. verify the identity is allowed to act;
4. validate the requested transition;
5. perform the smallest operation;
6. return a safe result.

Do not authorize from:

- a role string supplied by the browser;
- a hidden form field;
- a disabled button;
- a URL parameter alone;
- a record ID without checking its owner or site scope.

## Web methods and elevated access

Web methods are public entry points even when their implementation is backend code. Give each method the most restrictive caller permission that fits the product.

If a method uses elevated access or suppresses collection authorization:

- document why the ordinary permission model is insufficient;
- check the caller’s identity and resource ownership yourself;
- filter private fields before returning data;
- log the privileged path without sensitive payloads;
- add tests for unauthorized, cross-resource, and malformed requests;
- revisit whether the elevated path can be removed later.

Read [About Web Modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules) and [Security Best Practices](https://dev.wix.com/docs/develop-websites/articles/best-practices/security-best-practices).

## Input validation

Validate on the server:

- type and shape;
- length and size;
- allowed enum values;
- dates and time zones;
- identifiers and ownership;
- URLs and redirect targets;
- uploaded file type, size, and content;
- HTML or rich text;
- numeric ranges and currency precision;
- request frequency and replay.

Prefer allowlists over deny-lists. Normalize before applying business rules so equivalent inputs cannot bypass validation.

## Outbound requests

External calls can create SSRF, data leakage, cost, and availability risks. Do not accept an arbitrary URL from a visitor and pass it to a backend fetch. Use fixed provider hosts or a strict allowlist, validate redirects, set timeouts, limit response sizes, and redact provider payloads in logs.

Apply a provider-specific policy:

- required authentication;
- allowed methods and paths;
- timeout;
- retryable status codes;
- backoff and maximum attempts;
- rate limit behavior;
- idempotency key;
- response validation;
- data minimization.

## Webhooks

Treat every webhook as hostile input until verified:

- verify the current provider signature or authentication scheme;
- reject stale or replayed requests where the protocol supports it;
- validate the event type, ID, timestamp, and resource scope;
- deduplicate before side effects;
- acknowledge only after the request is accepted for processing;
- keep a recoverable receipt and failure state;
- never trust the event body’s user or site ID without checking the signed/authenticated context.

## Privacy and logs

Log what is needed to answer:

- which operation ran;
- for which site/app installation;
- under which identity class;
- with which correlation ID;
- against which provider or resource;
- with what outcome and latency.

Do not log passwords, tokens, full payment instruments, unnecessary member data, or raw secrets. Define retention and access for logs and support exports.

## Dependencies and embedded code

Before adding a package, script, iframe, or app:

- identify the owner and update path;
- review permissions and network destinations;
- check license and security posture;
- pin or lock versions where possible;
- assess performance and privacy impact;
- define how it is disabled or removed;
- test it after browser and Wix platform updates.

## Security release gate

A high-risk change is not ready until:

- the data flow is documented;
- the trust boundary is reviewed;
- secrets are externalized;
- permission changes are explicit;
- negative authorization tests pass;
- logs are redacted;
- dependency and external-service risks are recorded;
- recovery and credential rotation are known.

