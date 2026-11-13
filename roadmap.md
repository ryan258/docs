# Wixing roadmap

This roadmap tracks the verified state, immediate priorities, and planned expansions for the Wixing developer handbook and reference suite.

## Guiding principles

- **Smallest runnable change:** Every feature begins with an offline-testable helper or minimal reproducible recipe before adding platform scaffolding.
- **Explicit verification boundaries:** Distinguish offline deterministic checks from live Wix/provider behavior. Document what is tested and what remains an operator responsibility.
- **Production-quality personal tools:** Prioritize capacity capture, rapid resumption, reliable exports, and accessible interaction over speculative infrastructure.

## Current state (November 2026 refresh)

- [x] **Platform map alignment:** Documented development paths for Wix Studio, Wix Editor, Studio Two (November 2 rollout), and Wix Harmony in [platform map](01-platform-map.md).
- [x] **Offline test harness:** Deterministic checker ([scripts/verify.mjs](scripts/verify.mjs)) validating internal links, Markdown syntax, JavaScript blocks, mock cases, and unit tests without external network or credentials.
- [x] **Framework parser verification:** Static syntax check ([scripts/verify-frameworks.mjs](scripts/verify-frameworks.mjs)) for TSX dashboard extensions and Astro frontmatter.
- [x] **Reference implementations:** Three verified helpers with 21 unit tests:
  - [Offline order formatter](examples/README.md) (`examples/order-presentation.mjs`)
  - [Business locations dashboard model](05-app-development.md) (`examples/app-locations/location-model.mjs`)
  - [Headless reading list loader](06-headless.md) (`examples/headless-reading-list/reading-list.mjs`)
- [x] **Project restart aid:** Single-page local dashboard ([restart.html](restart.html)) capturing current state and next action.
- [x] **101 practical use cases:** Brainstorming and starter prompts cataloged in [101 ways to use this project](101-ways-to-use-this-project-for-fun-and-profit.md).

## Active priorities (Horizon 1)

- [ ] **Live Wix sandbox recipe acceptance:** Execute and record live acceptance runs for the three core handbook recipes using the [Wix recipe acceptance checklist](18-checklists.md#wix-recipe-acceptance):
  - Greeting button on a Wix Studio / Editor sandbox site ([04-site-development.md](04-site-development.md#build-a-button-that-calls-the-backend)).
  - Member-owned private orders query and repeater display ([the-missing-manual-to-velo.md](the-missing-manual-to-velo.md#working-example-private-member-orders)).
  - Locations dashboard page installed on a development site ([05-app-development.md](05-app-development.md)).
- [ ] **Studio Two tracking:** Monitor Studio Two feature availability during its gradual rollout:
  - Site SDK method coverage updates.
  - Studio Two HTTP endpoints calling contracts and caller authentication.
  - Export-to-code workflow and Git integration evolution.

## Planned expansions (Horizon 2)

- [ ] **Multi-framework Headless recipes:** Implement the reading list contract in Next.js (App Router) and Remix/React Router alongside the existing Astro integration.
- [ ] **Custom Element integration:** Add a minimal recipe for embedding standalone web components in Wix Studio pages with bi-directional attributes and events.
- [ ] **Webhook receiver & idempotency helper:** Provide a tested backend endpoint pattern for inbound provider webhooks with signature verification and replay protection.

## Operational & tooling (Horizon 3)

- [ ] **CI automation:** Set up a lightweight GitHub Actions workflow to run `node scripts/verify.mjs` and `node scripts/verify-frameworks.mjs` on pull requests.
- [ ] **Quarterly platform review:** Scheduled audit of Wix CLI, SDK, and API documentation changes to keep chapters synchronized with current platform behavior. See the [verification record](21-verification-record.md) for evidence conventions.
