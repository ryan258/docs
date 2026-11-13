# CLI and release quick reference

Identify the project lane before running a Wix command. Site, app, and Headless workflows can share a command name while changing different things. All commands here are operator examples; writing this handbook does not run or authorize them.

## First question

| You are changing… | Use… | Production action |
| --- | --- | --- |
| One Wix Editor or Wix Studio site | Git Integration & Wix CLI for Sites, if configured | Publish from the editor or configured site CLI |
| One Studio Two site | Code tab in the editor, with optional beta `origami` flow for export/import | Publish from Studio Two |
| An installable Wix app | Current Wix app CLI/project scripts | Release an app version |
| A Wix-managed Headless frontend | That framework's build plus Wix CLI or the static site uploader | `wix release` for a CLI-linked project or upload the static build to publish it |
| A self-managed Headless frontend | Your frontend framework and host tooling | Your host's deployment procedure |

Start in the **actual code project's root**. Check its package manifest, lockfile, and [runtime requirements](03-project-setup.md) before upgrading Node or the CLI. Use `node --version` to compare your runtime with those requirements.

## Site command orientation

In an already configured **site CLI project**, inspect identity and help first:

```bash
wix -h
wix whoami
wix dev -h
wix preview -h
wix publish -h
```

Expected: the installed site's supported commands/options and current Wix username. If a command is missing or refers to an app workflow, stop and check the installed project/CLI family. Use `wix login` only when you intend to authenticate; `wix logout` ends that session.

Open the Local Editor when ready to develop:

```bash
wix dev
```

Create a shareable review version after confirming the source and site:

```bash
wix preview
```

**Site preview boundary:** the site must have been published previously. This preview uses **live HTTP functions**, cannot test local HTTP-function changes, and is not a Release Manager test site. It can use the repository default branch or local code; record the chosen source. For endpoint-specific testing, use the [HTTP environment matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments).

The production action is a separate deliberate step after the [release procedure](15-release-operations.md):

```bash
wix publish
```

Check the code source and the UI version from `wix.config.json` before confirming. Save the release result and keep a recoverable copy of local code if you published it, since a later default-branch publish can replace it on the live site. [Wix site publishing](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/publishing-a-site-with-git-integration-wix-cli-for-sites)

Package-changing commands are `wix install`, `wix update`, and `wix uninstall`. Read their installed help before using them; package changes are not a troubleshooting prerequisite. Source for these commands and preview/publish behavior: [official site CLI reference](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands).

## Studio Two export and import

Use the Code tab and editor Preview for day-to-day development. Where Studio Two's beta source export is available, the `origami` flow adds separate commands to work with a React export. [Studio Two Code tab](https://dev.wix.com/docs/studio-two/get-started/about-the-code-tab) · [Export overview](https://dev.wix.com/docs/studio-two/code-your-site/export-your-site/about-exporting-your-site-to-code)

| Command | Effect |
| --- | --- |
| `wix origami export-site` | Exports the site to a local Git repository. The first export can create a Wix OAuth app, and refreshing an existing export can commit local changes before replacing the export. |
| `wix origami import-site --site <site-id>` | Replaces pages, shared sections, menus, theme, and any included code on the chosen site. Pages missing from the export are deleted. This write has no confirmation prompt. |

With no `--site` value, import defaults to the original site. Review the target site ID and the complete exported changes before import. Use the export's lint and preview checks, then test the imported version in the editor before a separate publish. [Export procedure](https://dev.wix.com/docs/studio-two/code-your-site/export-your-site/export-your-site-to-code) · [Import command](https://dev.wix.com/docs/wix-cli/command-reference/origami-commands/origami-import-site)

## App command orientation

For a complete dashboard page with a real SDK read, permissions and expected results, use the [business locations recipe](05-app-development.md).

Use the current **app project's configured runner**. A generated project can expose Wix commands through package scripts; `npm run` lists scripts without running one. Keep the project's chosen package manager and lockfile. The command names below are the Wix app CLI operations, not a reason to install a different global CLI.

| Operation | Command | Expected result |
| --- | --- | --- |
| Develop | `wix dev` | Local app development against the selected development site |
| Build | `wix build` | Project assets built; no released version inferred |
| Review | `wix preview` | Uploads built output and returns hosted review URLs without creating an app version |
| Release | `wix release` | Uploads built output, registers extensions, and creates an app version |

Use `wix dev-site current` to check the effective development site. `wix dev-site list` includes other account sites, so confirm the ID of the intended development site before using `wix dev-site select <site-id>`. Selection can install the app if it is absent. A `WIX_SITE_ID` value in `.env.local` overrides selection. This command family applies to app projects. [Development-site command](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/app-only/dev-site) · [Work with development sites](https://dev.wix.com/docs/build-apps/develop-your-app/development-sites/work-with-development-sites)

Build again after every change you want to preview or release. Existing preview URLs retain their original snapshots. Check caller permissions, installation data, and the preview support for each changed extension. [App build and deploy](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy) · [Wix changelog](https://dev.wix.com/changelog?featureType=Build+Apps)

## Headless command orientation

The [managed Astro reading-list recipe](06-headless.md) supplies a complete CMS-backed route, exact dependencies, files and build/start commands for that path.

| Headless setup | Build | Review | Publish |
| --- | --- | --- | --- |
| Wix-managed Astro | Generated build script | `wix preview` uploads the build to a hosted snapshot | `wix release` uploads the build and publishes the site |
| Other framework linked with `npm create @wix/new init` | Your framework's build. Match `site.outputDirectory` in `wix.config.json`. | `wix preview` uploads that output | `wix release` uploads that output and publishes the site |
| Wix-managed static upload | Your framework's build or existing static files | Review the artifact locally | Uploading the files deploys them to a live URL |
| Self-managed | Your framework's build | Your host's preview workflow | Your host's deploy workflow |

Record the project's tested script names, runner, and destination. For either CLI-linked path, rebuild after the last edit. The preview and release commands use the current build output. [Managed Astro deployment](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/development/build-and-deploy-with-the-cli) · [Other frameworks](https://dev.wix.com/docs/go-headless/wix-managed-headless/other-frameworks/your-own-frontend/deploy-your-own-frontend-with-the-cli) · [Static site upload](https://dev.wix.com/docs/go-headless/wix-managed-headless/other-frameworks/your-own-frontend/upload-a-static-site)

```text
Lane/framework: self-managed Headless; existing frontend framework
Local start: exact command from this project's package scripts
Build/check: exact scripts and their prerequisites
Preview: selected host's documented non-production mechanism
Production action: owner-controlled host deployment procedure
Configuration: allowed redirect origins, server secret names, public client config
Recovery: known-good artifact plus data/configuration compatibility notes
```

## Check this handbook locally

From this handbook's repository root (`docs/` in the surrounding workspace):

```bash
node scripts/verify.mjs
```

The checker requires Node.js 20+ and runs offline Markdown/link/anchor, snippet syntax, and controlled mock checks. That runtime requirement belongs to this checker, not Wix's current CLI. It writes a dated JSON record in `verification-results/`. It does not import Wix packages, contact providers, verify external URLs, open a browser, publish, or prove live permissions. See [verification record](21-verification-record.md).
