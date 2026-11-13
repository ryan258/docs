# Open a project and get to the first useful result

Start with the editor and code model the site already uses. The site recipes below use Wix Studio or Wix Editor. For a Studio Two site, open its Code tab and use Wix's own extension setup. [Identify your editor](01-platform-map.md#identify-your-editor-before-copying-code) · [Studio Two Code tab](https://dev.wix.com/docs/studio-two/get-started/about-the-code-tab)

## Check the runtime before installing the CLI

Use **Node.js 24.22.1 or later** for the site Git integration, CLI app, and managed Astro walkthroughs in this handbook. As of November 10, 2026, those setup pages and the October 22 changelog specify that minimum. Wix's general CLI introduction lists **24.18 or later** for the global CLI. Check the prerequisites for your exact command and record the Node version that worked. [Site setup](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/set-up-git-integration-with-wix-cli) · [App quick start](https://dev.wix.com/docs/build-apps/get-started/quick-start/create-an-app-with-the-wix-cli) · [Managed Astro quick start](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/create-a-project-with-the-wix-cli) · [CLI introduction](https://dev.wix.com/docs/wix-cli/command-reference/introduction) · [Wix changelog](https://dev.wix.com/changelog)

~~~sh
node --version
git --version
~~~

Expected: installed versions print. If Node is below the documented CLI minimum, select a supported version before scaffolding. The handbook's offline checker needs Node 20+ and does not need the Wix CLI.

## Existing site: use the editor first

1. Open the intended test site in Wix Studio or Wix Editor.
2. In Wix Studio, open **Code** and select the page's code. In Wix Editor, turn on **Dev Mode** and open the page code panel. [Wix development paths](https://dev.wix.com/docs/overview/platform-overview/development-paths)
3. Add the three controls in the [greeting recipe](04-site-development.md#build-a-button-that-calls-the-backend).
4. Add its backend web module and page code.
5. Preview; enter `Ryan`, press **Greet**, and look for `Hello, Ryan.`

No collection, provider credential or Git integration is needed for that first feature. Use a test site for experiments that touch data or permissions.

## Existing site: develop locally

Connect the site using Wix's [Git integration setup](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/set-up-git-integration-with-wix-cli). Use **Local Dev Setup** in the editor for the site's actual clone/install commands; the generated repository is the starting point.

Once its documented dependencies and CLI are installed, run these from that site repository:

~~~sh
git status --short
wix whoami
wix dev
~~~

Expected: you can identify local changes and the signed-in account, and `wix dev` opens the Local Editor. Verify the site identity before changing anything. If the command is absent or behaves like another project type, consult the [CLI reference](20-cli-quick-reference.md).

Connecting Git changes the editor's code workflow; read the [Git-connected caveats](04-site-development.md#when-the-site-is-connected-to-git) first.

## New app or Headless project

Follow the [app walkthrough](05-app-development.md) or [Headless walkthrough](06-headless.md). Their scaffold commands create Wix account resources; the Headless example explicitly disables auto-publishing. They are instructions for a chosen new project, not commands needed to read this handbook.

For an existing generated npm project with `package-lock.json`, install its pinned dependencies with `npm ci`. If the project uses another package manager, follow its lockfile and README instead. Do not create a second lockfile merely to follow an example.

## Save the few facts you need to return

Filled example for an editor-managed personal site:

~~~text
Project: Reading Room test site.
Path: Wix site / Wix Studio / editor-managed code.
Open: Wix dashboard → Reading Room test → Edit Site → Orders page.
Data: custom Orders collection; permissions recorded with the recipe.
Secrets: none for greeting and recent-orders examples.
Local start: not applicable; work in the editor.
Publish: owner action after target-site checks.
Next: test empty state as member B.
~~~

For a local project, add the repository path, Node version, package manager and exact start command. Use the [site inventory](templates/site-inventory.md) if you want a reusable note.

## First useful check

Open the documented source, make a harmless visible edit, and confirm the expected result in the selected test environment. Then restore the edit if it was only a setup probe. If this fails, record the exact command/error and use [troubleshooting](16-troubleshooting.md) before adding a feature.
