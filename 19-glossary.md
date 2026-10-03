# Wix development glossary

Use these terms consistently in project briefs, pull requests, release records, and support conversations.

## Wix surfaces

**Wix Editor** — Wix’s visual site editor. It can be extended with code, but editor-managed design, content, and settings are separate change surfaces from source-controlled code.

**Wix Studio** — Wix’s professional site-building environment with collaborative design and developer workflows.

**Wix site** — One site project whose pages, design, content, settings, and runtime behavior are operated in Wix.

**Wix project** — A broader Wix container that may include sites, business solutions, apps, Headless clients, and project-level configuration. Confirm the meaning in the specific API or dashboard.

**Wix app** — A reusable product that can be installed on Wix sites and may include dashboard pages, site extensions, permissions, billing, webhooks, and distribution.

**Wix Headless** — A model in which a custom frontend uses Wix business solutions and APIs. The frontend may be Wix-managed or self-managed.

**Wix-managed Headless** — A Headless path where Wix hosts and deploys the frontend. Capabilities depend on the framework and integration, so record the exact path.

**Self-managed Headless** — A Headless path where the team owns frontend hosting, deployment, authentication, secrets, and operations.

## Code and runtime

**Velo** — Wix’s JavaScript-based development platform and API surface for extending sites.

**Wix JavaScript SDK** — Wix’s newer SDK surface for site and app development. Wix is transitioning supported functionality from Velo APIs toward the SDK over time.

**$w API** — The site-editor API used to interact with Wix page elements and their events. It is a site concern and should not be confused with Wix business APIs.

**Page code** — Frontend code associated with a page. It is inspectable browser-delivered code and can also execute during server rendering.

**Master page/global code** — Frontend code that runs across pages for shared site behavior. Keep it small and avoid duplicating page initialization.

**Public code** — Publicly accessible reusable code that can be imported by frontend or backend code. It is not a place for secrets.

**Backend code** — Server-side code that is not delivered to visitors. It still requires authorization, validation, and safe data handling.

**Web module** — A backend file that exposes selected functions to frontend callers through web methods. Each method is an authorization boundary.

**HTTP function** — A custom site endpoint for handling external HTTP requests. Validate and authenticate it as a public boundary.

**Data hook** — Code that runs before or after a collection operation. Use it for validation or transformations on supported operations; backend callers can suppress hooks.

**App extension** — A defined app surface such as a dashboard page, site widget, plugin, embedded script, event handler, or service plugin.

**Site plugin** — An app extension that integrates app behavior into a supported Wix site surface.

**Service plugin** — An extension point that lets an app implement or customize a Wix service behavior according to the relevant contract.

## Data and identity

**CMS collection** — A structured content/data collection managed through Wix’s content system. Its fields and permissions are part of the application contract.

**Collection permission** — The configured allowance to read, create, update, or delete records. Review each operation separately.

**Projection** — The intentionally limited set of fields returned to a caller. Return a projection instead of an entire private record.

**Visitor** — An unauthenticated site user. Visitor access is not anonymous trust.

**Member** — A site user who has signed in. Member identity does not automatically grant admin access.

**Wix user/collaborator** — A person operating the Wix dashboard or an app dashboard with platform-level permissions.

**App installation** — One installed instance of an app on a Wix site. State should be scoped to the correct installation/site.

**Instance ID** — An installation or site-scoped identifier used by app flows to distinguish one installed app context from another. Follow the current app documentation for the exact field and lifecycle.

**Elevation** — A documented way for backend code to perform an operation with stronger permissions than the caller. Use sparingly and add an explicit authorization check.

**suppressAuth** — A Wix Data option that bypasses ordinary collection permission checks in backend code. It is not authorization; the backend must enforce authorization and filter output itself.

**API key** — A credential for an API operation. Treat it as a secret and keep it server-side.

**OAuth** — An authorization protocol used for client or user access without sharing a Wix login password with application code.

## Delivery and operations

**Development site** — A non-production Wix site used to install, configure, and test a project.

**Local Editor** — The Wix development environment that lets local site code be tested against a site.

**Preview** — A hosted version or review environment whose isolation depends on the mechanism. Site CLI previews use live HTTP functions. Verify which code, UI, data, secrets, and extensions it actually uses.

**Publish** — The action that makes a Wix site version live. Site publishing can have different code and UI sources depending on the workflow.

**Build** — Compiling or packaging a Wix app or Headless project into deployable assets.

**Release** — Publishing a version of a Wix app or managed project to Wix’s release/distribution system. It is not synonymous with site preview.

**App version** — A released, identifiable version of a Wix app that can be installed or distributed according to the app’s lifecycle.

**Webhook** — An HTTP event delivery from Wix or another provider. Design for authentication, duplication, delay, reordering, and replay.

**Idempotency** — The property that retrying the same business action does not repeat harmful side effects.

**Smoke test** — A small post-release test of the most important live user path.

**Forward fix** — A compatible new change that corrects a production problem when rollback would make data or configuration inconsistent.

**Source of truth** — The declared authoritative location for a category of state, such as code, UI, content, schema, permissions, secrets, or domains.

