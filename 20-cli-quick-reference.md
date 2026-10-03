# CLI and release quick reference

Wix has different command workflows for sites, apps, and Headless projects. Use the lane-specific command set and confirm exact flags with the current CLI help.

## First question

Ask: “Am I extending one Wix site, building a reusable Wix app, or building a custom Headless frontend?”

| Lane | CLI/documentation family | Production action |
| --- | --- | --- |
| Site | Git Integration & Wix CLI for Sites | Publish the site |
| App | Current Wix CLI for apps | Release an app version |
| Wix-managed Headless | Current Wix CLI and selected framework integration | Deploy/release the managed project |
| Self-managed Headless | Team’s framework/hosting CLI | Deploy through team infrastructure |

Do not copy a command from one lane into another because both use the Wix command name.

## Site command orientation

The current site command reference includes:

| Command | Meaning |
| --- | --- |
| wix dev | Open the local development environment |
| wix install | Install a package |
| wix update | Update a package |
| wix uninstall | Uninstall a package |
| wix preview | Build a shareable site preview |
| wix publish | Publish the site |
| wix login | Authenticate the CLI |
| wix whoami | Show the current CLI identity |
| wix logout | End CLI authentication |

Before publishing:

- identify whether the source is the repository’s default branch or local code;
- confirm the UI/editor version;
- check unpushed local work;
- record the exact source in the release record;
- smoke-test the published site.

Publishing local code without pushing it creates source-control drift. Reconcile it immediately or record the emergency exception and recovery action.

Canonical reference: [Wix CLI commands for sites](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands).

**HTTP-function caveat:** `wix preview` uses the live versions of site HTTP functions and cannot test local endpoint changes. It also requires a previously published site and is not a Release Manager test site. For editor, test-site, and Git-revision endpoints, use the [endpoint matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments). [Official site CLI behavior](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands).

## App command orientation

The current app workflow has this shape:

| Command | Meaning |
| --- | --- |
| wix dev | Run the local app development environment on a development site |
| wix build | Build project assets |
| wix preview | Upload a reviewable hosted version and create preview URLs |
| wix release | Release a version and register app configuration for distribution |

Before release:

- test on a development site;
- verify app permissions and OAuth;
- test every changed extension;
- check multi-site isolation;
- test webhooks and billing where applicable;
- confirm required Wix apps and plans;
- complete app checks;
- record the source commit and version.

Preview is useful for review but is not a substitute for release. Some app extensions are not recognized until the release action registers them.

Canonical references: [Wix CLI](https://dev.wix.com/docs/wix-cli) and [Build and deploy an app](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy).

## Headless command orientation

Headless commands depend on the selected managed framework or self-managed infrastructure. Record:

~~~text
Framework:
Wix-managed or self-managed:
Local start:
Build:
Preview:
Deploy/release:
Environment configuration:
Secret configuration:
Authentication setup:
Logs:
Rollback/forward-fix:
~~~

For Wix-managed Headless, verify the framework-specific capabilities before assuming that authentication, SEO, secrets, extensions, or monitoring are automatic. For self-managed Headless, the team owns hosting and authentication.

Canonical reference: [Choose Your Development Path](https://dev.wix.com/docs/go-headless/get-started/choose-your-development-path).

## Command safety rules

- Run help for the exact installed CLI version before scripting a new command.
- Never put a secret in a command line that may enter shell history or CI logs.
- Use a development site for commands that install, publish, or mutate data.
- Make the destination explicit in CI.
- Capture the output needed to identify source and version, but redact tokens.
- Do not run production publish/release from an unreviewed local working tree.
- Keep a recovery action next to every release action.

