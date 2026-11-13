# Wix development glossary

Use this page to distinguish terms that change where code runs, whose data it touches, or how it reaches users.

## Pick the surface

| Term | Meaning in this handbook | Practical consequence |
| --- | --- | --- |
| Wix Editor / Wix Studio | Visual environments for building a Wix site | Editor design/configuration can differ from source-controlled code |
| Studio Two | Wix editor with a Code tab and extension-based development | Identify the editor before choosing a coding or publishing workflow |
| Wix site | One site's pages, content, settings, and runtime | Record the actual site ID before changing it |
| Wix project | A context-dependent Wix container | Confirm what the specific API/dashboard means by project |
| Wix app | Installable app with defined extensions | Track app version and installation/site scope |
| Wix Headless | Custom frontend using Wix APIs/business solutions | Record frontend hosting and authentication ownership |
| Wix-managed Headless | Frontend managed through the chosen Wix-supported workflow | Check that framework's current capabilities and commands |
| Self-managed Headless | Frontend hosted through your chosen infrastructure | You own that frontend's deployment and runtime configuration |

## Place the code

| Term | Meaning | Example or warning |
| --- | --- | --- |
| Velo | Wix's JavaScript platform and APIs for extending sites | Existing Velo code still needs operation-specific API references |
| Wix JavaScript SDK | Wix SDK APIs used across supported development paths | Do not mechanically replace Velo imports; check API mappings |
| `$w` | Site-element selection and interaction API | `$w('#saveButton')` refers to an editor element ID, not a CSS selector |
| Page code | Frontend behavior for one site page | Browser-delivered; account for rendering context where relevant |
| Master page/global code | Shared behavior across site pages | Keep page-specific initialization out of it |
| Public code | Shared code importable by frontend/backend | Never place secret values in it |
| Backend code | Server-side implementation | Still validate input and authorize the caller |
| Web module | Backend functions exposed as callable web methods | Each exposed method needs an intentional permission boundary |
| HTTP function | Site endpoint for external HTTP requests | Validate input and establish caller authenticity explicitly |
| Data hook | Function invoked around supported collection operations | Not an unconditional security boundary; supported callers can bypass hooks |
| App extension | App integration surface, such as a dashboard page or event handler | Follow that extension's testing/lifecycle contract |
| Site plugin / service plugin | Specific app extension types integrating with supported Wix surfaces/services | Do not assume all extension types have identical APIs or lifecycle |

See [Architecture](07-architecture.md) and [Security](09-security.md) for code placement and boundaries.

## Identify the caller and data

| Term | Meaning | Practical consequence |
| --- | --- | --- |
| Visitor | Caller who is not signed in as a site member | Public entry points still need validation and abuse controls |
| Member | Signed-in site user | Membership alone does not grant access to every member's records |
| Wix user/collaborator | Person operating Wix dashboard/editor features | Dashboard permissions differ from visitor/member permissions |
| App installation / instance ID | Site-scoped app context; use the identifier defined by the current contract | Key installation data correctly; test another site |
| CMS collection | Structured records and fields managed in Wix | Fields and permissions are part of the application contract |
| Projection | Deliberately limited output fields | Return `id` and `title` rather than the full private record |
| Elevation | Operation performed with stronger backend permissions | Check the caller's authority before elevating |
| `suppressAuth` | Velo Wix Data option bypassing ordinary collection permission checks in backend calls | You must supply authorization, owner scoping, and output filtering |
| API key | Secret credential for supported API operations | Keep server-side and scoped to the operation |
| OAuth | Protocol for delegated authorization | Use the documented flow for the selected client/identity |

## Distinguish development from delivery

| Term | Meaning | What it does not establish |
| --- | --- | --- |
| Development site | Wix site used to exercise app/project behavior safely | Same configuration/data as production |
| Local Editor | Site development environment opened by the site CLI | A released live site |
| Site CLI preview | Shareable version of a Git-connected Wix Editor or Wix Studio site using live HTTP functions | Local endpoint changes or a Release Manager test site |
| Studio Two export / import | Beta workflow for editing a React export locally and replacing editor content from that export | Publication of the imported site |
| App or managed Headless preview | Hosted snapshot of the build output for review/testing | A released app version or a published Headless site |
| Build | Compile/package project assets | Correct runtime permissions or successful publication |
| Publish | Make a Wix site version live | Git, editor, collection data, and provider state all match automatically |
| Release / app version | Create an identifiable app version through its release flow | Every installation has necessarily exercised the new version |
| Release / managed Headless | Upload the current build and publish the site with the project CLI | Correct routing, runtime identity, or live CMS behavior |
| Smoke test | Small check of the released critical task | Exhaustive acceptance or full recovery validation |
| Forward fix | New compatible change correcting the problem | Reversal of already completed data/provider effects |

Use [CLI reference](20-cli-quick-reference.md) for current command families and their cited official sources.

## Recovery and evidence

**Webhook:** an HTTP event delivery. Authenticate it and handle duplicate delivery according to the provider's contract.

**Idempotency:** repeated execution of the same action does not repeat its harmful side effect. A unique action key plus durable handling is a common ingredient; the key alone is insufficient.

**Source of truth:** the declared owning location for a category of state. For example, site code may live in Git while design remains editor-managed.

**Known limitation:** an explicit boundary of the evidence or implementation. “Tested with mocks; Wix permissions unverified” is a useful limitation. “Fully tested” without an environment and scenario is not.
