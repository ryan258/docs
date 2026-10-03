# Wix site development: Studio, Editor, Velo, SDK, and Git

This guide applies when Wix owns the site’s frontend and runtime. It covers Wix Studio and Wix Editor projects extended with code.

## The site code model

The exact file names depend on the project’s generation path, but the security model is stable:

| Location | Runs where | Appropriate for |
| --- | --- | --- |
| Page code | Browser and potentially server rendering | UI interactions and presentation orchestration |
| Site-wide/master-page code | Browser and potentially server rendering on relevant pages | Shared UI behavior and navigation concerns |
| Public code | Importing frontend or backend context; publicly accessible | Non-sensitive reusable helpers |
| Backend code | Wix server | Secrets, privileged logic, data access, external calls, validation |
| Backend web module (.web.js) | Wix server, callable from frontend | Explicitly exposed backend methods with permissions |
| CMS/data collections | Wix data layer | Structured content and application data, with explicit permissions |

Anything delivered to the browser should be considered inspectable. A members-only or password-protected page does not make its frontend source secret.

Read [Where Do I Put My Code?](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/overview/where-do-i-put-my-code) and [About Web Modules](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules) when the placement is unclear.

Page `onReady()` can run on the server and again in the browser on initial load. Guard side effects while preserving server-rendered content. See [page rendering](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/frontend-code/page-rendering/about-page-rendering).

## SDK-first, Velo-aware

Wix is transitioning much of its site and Blocks development toward the Wix JavaScript SDK. For new work:

1. Check whether the required capability has an SDK module.
2. Use the SDK when it supports the use case and project surface.
3. Use Velo APIs where the capability is still Velo-only or where migration is not yet practical.
4. Do not mix styles casually inside one feature; document the boundary and the reason.
5. Re-check the current [Velo-to-SDK mapping](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping) before adopting an older example.

Wix’s $w API and some editor-specific APIs remain site concerns. Backend, frontend, and universal APIs have different identity and execution behavior; always read the API’s authorization notes.

## UI and behavior boundaries

Keep the page layer responsible for:

- reading user intent from controls;
- rendering loading, empty, success, and error states;
- coordinating navigation and visual state;
- calling a narrow backend method or service helper.

Keep the backend responsible for:

- authenticating and authorizing the action;
- validating and normalizing input;
- reading secrets;
- calling third-party services requiring credentials, privileges, or trusted business rules;
- querying or mutating protected data;
- returning the smallest safe response.

Do not let a page file decide that a user is authorized. The server must enforce the decision at the operation boundary.

## Git Integration & Wix CLI for Sites

Git Integration & Wix CLI for Sites lets a team develop site code in a preferred IDE and use GitHub as the code source. Important consequences:

- the site editor’s code becomes read-only after connection;
- the editor syncs with the repository’s default branch;
- code changes should be made in the local repository and reviewed through normal Git workflows;
- collection field changes are immediately reflected on the live site, even before publishing; review them as live data/schema changes;
- duplicating a page does not include the original page's code;
- UI and code can come from different versions if the release method is not chosen carefully.

Read [Changes to the Editor When Your Site Is Integrated](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/changes-to-the-editor-when-your-site-is-integrated) before changing an established site. These behaviors apply to the Git-connected site workflow; do not assume publishing is the activation boundary for collection field changes.

### Site CLI command orientation

The site CLI currently documents commands such as:

| Command | Use |
| --- | --- |
| wix dev | Open the local development environment |
| wix install | Install a package |
| wix update | Update a package |
| wix uninstall | Remove a package |
| wix preview | Create a shareable site preview |
| wix publish | Publish to production |
| wix login, wix whoami, wix logout | Manage CLI authentication |

Use the command’s help output and the current [site CLI reference](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands) for exact prompts and flags.

**HTTP-function caveat:** `wix preview` uses the live versions of site HTTP functions and cannot test local endpoint changes. It also requires a previously published site and is not a Release Manager test site. For editor, test-site, and Git-revision endpoints, use the [endpoint matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments). [Official site CLI behavior](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands).

### Publishing source discipline

Before publishing, identify which source is being published:

- the latest commit from the repository’s default branch; or
- local code that may not yet be pushed.

Publishing local code creates a source-control mismatch. If that path is used intentionally for an emergency, immediately push the exact code or record the divergence and recovery plan. Never leave production code that exists only on one laptop.

### Site changes that are not ordinary code

Track these separately:

- editor layout and design changes;
- CMS schema and content changes;
- collection permissions;
- site settings and domains;
- secrets;
- installed apps and package versions;
- redirects and SEO settings;
- automation and webhook configuration.

A code review does not prove that these dashboard changes were reviewed.

## Page implementation pattern

For a non-trivial page:

1. Define the user states: loading, empty, ready, invalid, unauthorized, failed, offline/slow.
2. Give important elements stable IDs and accessible labels.
3. Keep page code thin.
4. Call one purpose-specific backend method rather than exposing collection-wide CRUD.
5. Handle stale results if users can trigger requests quickly.
6. Disable or debounce actions while a mutation is in flight.
7. Show errors that are useful to users and log details server-side.
8. Test at narrow, medium, and wide layouts.

## Site-development review checklist

- Is the chosen API surface current and supported?
- Is browser-visible code free of secrets and privileged decisions?
- Are web methods narrowly named and permissioned?
- Is the response filtered to the minimum data the UI needs?
- Are collection permissions appropriate for the common case?
- Are validation and authorization in backend code?
- Does the page have real loading, empty, and error states?
- Does the code behave correctly in preview and on the published site?
- If Git-connected, are code, UI, and data changes synchronized and traceable?
