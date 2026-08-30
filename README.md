# Professional Wix development handbook

This is the operating manual for building, shipping, and maintaining Wix work that another developer can safely inherit.

It is written for teams working across Wix Studio, Wix Editor, Velo, the Wix JavaScript SDK, Wix CLI projects, and Wix Headless. It treats the Wix editor as part of a production system, not as a substitute for engineering discipline.

> Platform facts and links were reviewed on 2026-08-30. Wix changes product names, command surfaces, and editor locations over time. Use the linked Wix documentation as the final authority for current commands and availability.

## Start here

Read these in order when you are new to a project:

1. [Platform map](01-platform-map.md) — decide which Wix development lane you are in.
2. [Professional workflow](02-professional-workflow.md) — learn the lifecycle and the evidence expected at each stage.
3. [Project setup](03-project-setup.md) — establish accounts, access, source control, and environments.
4. The lane guide:
   - [Wix site development](04-site-development.md)
   - [Wix app development](05-app-development.md)
   - [Wix Headless](06-headless.md)
5. [Architecture and code organization](07-architecture.md) — keep the system understandable as it grows.
6. [Testing and quality](11-testing.md), then the relevant [release and operations](15-release-operations.md) checklist.

## Find the right document

| If you need to... | Read... |
| --- | --- |
| Choose between Velo, SDK, an app, and Headless | [Platform map](01-platform-map.md) |
| Set expectations for a new feature | [Professional workflow](02-professional-workflow.md) and [Feature brief template](templates/feature-brief.md) |
| Connect a site to GitHub and develop locally | [Site development](04-site-development.md) and [Project setup](03-project-setup.md) |
| Build a Wix app with extensions | [App development](05-app-development.md) |
| Build a custom frontend on Wix business APIs | [Headless](06-headless.md) |
| Decide where code belongs | [Architecture](07-architecture.md) |
| Design collections and permissions | [Data and content](08-data-content.md) |
| Protect secrets and backend operations | [Security](09-security.md) |
| Integrate a third-party API or webhook | [Integrations](10-integrations.md) |
| Plan meaningful tests | [Testing and quality](11-testing.md) |
| Make a site usable with assistive technology | [Accessibility](12-accessibility.md) |
| Improve load time and real-user experience | [Performance](13-performance.md) |
| Plan search visibility and measurement | [SEO and analytics](14-seo-and-analytics.md) |
| Ship safely or recover from a bad release | [Release and operations](15-release-operations.md) |
| Debug a broken Wix project | [Troubleshooting](16-troubleshooting.md) |
| Set team conventions and keep docs current | [Team practice](17-team-practice.md) |
| Run a launch or maintenance review | [Checklists](18-checklists.md) |
| Record a decision, release, or incident | [Templates](templates/README.md) |
| Look up Wix terminology | [Glossary](19-glossary.md) |
| Compare site, app, and Headless CLI commands | [CLI quick reference](20-cli-quick-reference.md) |
| Find canonical platform references | [Official resources](99-official-resources.md) |

## Choose the development lane before writing code

| You are building... | Primary surface | Source and delivery model |
| --- | --- | --- |
| A site whose pages, CMS, and business behavior live in Wix | Wix Studio or Wix Editor with Velo/SDK | Site code in the editor or GitHub through Git Integration & Wix CLI for Sites; publish the site |
| A reusable product installed on many customer sites | Wix app platform | Local Wix CLI project; develop on a development site; preview and release app versions |
| A custom frontend backed by Wix business solutions | Wix Headless | Wix-managed or self-managed frontend; authenticate and deploy according to the selected path |
| A visual site with no custom runtime behavior | Wix Studio or Wix Editor | Editor-owned design and content; still document ownership, accessibility, SEO, and release checks |

Do not start with a tool because it is familiar. Start with the ownership question:

> Who owns the frontend, the runtime, the data, the authentication flow, and the production release?

If the answer differs by part of the system, document the boundary explicitly in the project inventory.

## What “professional” means here

A professional Wix project has:

- one declared source of truth for code, configuration, content, and secrets;
- a written distinction between editor changes, code changes, data changes, and platform configuration;
- least-privilege permissions at both the collection and callable-function boundary;
- backend-only handling of secrets, sensitive logic, and privileged operations;
- tests for denied access, malformed input, duplicate events, empty data, slow dependencies, and failed releases;
- a repeatable preview, release, smoke-test, and recovery path;
- accessibility, performance, SEO, privacy, and observability treated as acceptance criteria;
- evidence that a release was tested, who approved it, and how to recover it;
- documentation that explains why a design exists, not only what buttons to click.

Green status pages, successful editor previews, and passing happy-path tests do not prove production readiness on their own.

## The default delivery loop

~~~text
Discover
  -> define behavior, data, identity, risks, and acceptance evidence
Design
  -> choose the Wix lane, boundaries, contracts, and recovery path
Build
  -> implement the smallest coherent change behind safe interfaces
Verify
  -> test positive, negative, responsive, accessibility, security, and failure paths
Release
  -> publish or release from the declared source, then smoke-test the live path
Operate
  -> observe, document, maintain, and improve without losing the recovery path
~~~

## Canonical platform references

This handbook is a project-level guide. It does not replace the canonical references:

- [Wix documentation home for extending websites](https://dev.wix.com/docs/develop-websites)
- [Velo API reference](https://dev.wix.com/docs/velo)
- [Wix JavaScript SDK documentation](https://dev.wix.com/docs/develop-websites-sdk)
- [Wix CLI documentation](https://dev.wix.com/docs/wix-cli)
- [Wix app development documentation](https://dev.wix.com/docs/build-apps)
- [Wix Headless documentation](https://dev.wix.com/docs/go-headless)
- [Wix Studio Help Center](https://support.wix.com/en/wix-studio)

When this handbook and the platform documentation disagree, follow the current platform documentation and update this handbook with the new decision.

## Keeping this collection healthy

Every project should assign an owner for this folder. Review it:

- when Wix changes a supported development path, CLI, SDK, or authentication model;
- before a major release or app submission;
- after an incident exposes a missing control;
- at least quarterly for active products.

Every page should make its scope clear. If a recommendation only applies to sites, apps, or Headless, say so in the heading or a note. Avoid copying a site workflow into an app project because both happen to use a command named wix.
