# Platform map: choose the right Wix surface

Wix is a platform family, not a single runtime. The first professional decision is selecting the development surface that owns the behavior you are about to build.

## The three lanes

### Lane A — extend an existing Wix site

Use Wix Studio or Wix Editor when Wix owns the site’s frontend, editor experience, hosting, and business context. Add behavior with Velo APIs and, where supported, the Wix JavaScript SDK.

Typical work:

- page interactions and dynamic UI;
- CMS-backed pages and forms;
- backend web methods;
- data hooks and HTTP functions;
- integrations with Wix business solutions;
- custom site behavior that should remain inside the site.

For local source control, use [Git Integration & Wix CLI for Sites](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/setting-up-git-integration-wix-cli-for-sites). This is a site workflow. It is not the same thing as the newer Wix CLI flow for creating apps and Headless projects.

### Lane B — build a Wix app

Use the Wix app platform when a product should be installed, configured, billed, and potentially distributed across many Wix sites.

Typical work:

- dashboard pages and onboarding;
- site widgets, plugins, and embedded scripts;
- event handlers and service plugins;
- app permissions, OAuth, billing, and webhooks;
- multiple site installations with installation-specific state.

The current [Wix CLI](https://dev.wix.com/docs/wix-cli) is the primary local workflow for new Wix apps. App projects have their own extension model, release process, and app-market checks.

### Lane C — build a custom frontend with Wix Headless

Use Wix Headless when the frontend should be custom-built while Wix provides business capabilities such as CMS, Stores, Bookings, Events, or memberships.

There are two important choices:

- **Wix-managed Headless:** Wix hosts and deploys the frontend. Astro is the recommended fully integrated path; authentication and other platform capabilities depend on the framework choice.
- **Self-managed Headless:** the team owns the frontend hosting, deployment, and authentication setup, while connecting to Wix through the SDK or REST APIs.

Read [Choose Your Development Path](https://dev.wix.com/docs/go-headless/get-started/choose-your-development-path) before scaffolding. Do not assume that a Wix-managed non-Astro project has the same authentication, secrets, SEO, or extension support as the Astro path.

## Capability comparison

| Concern | Wix site | Wix app | Wix-managed Headless | Self-managed Headless |
| --- | --- | --- | --- | --- |
| Frontend owner | Wix editor/site team | App team for app surfaces; host Wix site for installed surfaces | Wix-managed project and selected frontend stack | Team and its hosting provider |
| Main source | Site code/editor plus optional GitHub integration | Local CLI project | Local CLI project | Team’s application repository |
| Runtime | Wix site runtime | Wix app runtime and extensions | Wix-managed frontend/runtime | Team-managed frontend/runtime |
| Backend | Velo/SDK backend and Wix services | App backend/extensions and Wix APIs | Managed project services and Wix APIs | Team backend plus Wix APIs |
| Authentication | Site visitor/member/Wix user identities | App installation and Wix authorization model | Automatic only where the chosen managed integration provides it | Team implements and operates the auth flow |
| Secrets | Wix Secrets Manager | Project/platform secret mechanism as documented for the app | Managed secrets where supported by the chosen path | Team secret manager and hosting environment |
| Preview | Editor preview, Local Editor, or Wix CLI site preview | Development site and CLI preview URLs | Managed preview/deploy flow | Team’s preview/deploy system |
| Production action | Publish the site | Release an app version and distribute/install it | Deploy/release the managed project | Deploy through the team’s infrastructure |
| Main failure mode | Editor, code, UI, and data drift | Extension, permission, installation, or version drift | Framework capability mismatch | Auth, hosting, API, and deployment complexity |

Treat this table as an orientation aid, not a feature guarantee. Verify current support in the linked Wix documentation before committing to a path.

## Decision questions

Answer these in a project brief:

1. Is the product a single site experience or something installed on multiple sites?
2. Must the frontend remain editable by a site owner in Wix Studio?
3. Do we need app-market distribution, billing, or installation lifecycle events?
4. Do we need a custom frontend framework or mobile client?
5. Who owns authentication and token storage?
6. Who owns hosting, deploys, logs, and rollback?
7. Which Wix business solution is the system of record?
8. What must work if the Wix API, an external provider, or a webhook is unavailable?

If a project cannot answer those questions, it is not ready to choose a platform lane.

## Common boundary mistakes

### Treating a site as an app

Site code runs in the context of one Wix site. An app must handle installation, multiple site instances, permissions, onboarding, versioning, and distribution. A site integration that works for one site is not automatically app-ready.

### Treating the Wix CLI as one universal command set

The site Git workflow and the app/Headless workflow have overlapping command names but different project models. Record the lane in the README and in the onboarding instructions.

### Treating preview as production equivalence

Preview may use different UI, data, HTTP functions, extension registration, secrets, or integrations than production. Define what preview proves and what still requires a development-site or live smoke test.

### Treating “managed” as “no engineering responsibility”

Wix may manage hosting, certificates, scaling, or authentication for a selected path. The team still owns authorization decisions, data exposure, input validation, error behavior, accessibility, content quality, and release evidence.

## Platform choice record

Copy this into the project inventory:

~~~text
Project:
Chosen lane:
Chosen framework/editor:
Wix-managed or self-managed:
Code source of truth:
UI/design source of truth:
Content/data source of truth:
Secrets source of truth:
Authentication owner:
Hosting/deployment owner:
Preview environment:
Production release action:
Verified recovery path:
Known unsupported or deferred capability:
Decision owner and date:
~~~

