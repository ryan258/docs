# Project setup

Set up access, source control, environments, and ownership before building features. A fast first commit that leaves the team unable to reproduce or recover the project is not a fast start.

## Baseline prerequisites

Confirm the current requirements in the applicable Wix quick start. Select the Node.js version supported by the exact CLI and project template, and record it alongside the installed CLI version. Do not treat a minimum version in one lane’s guide as a compatibility guarantee for all later versions or other lanes. Install Git for Git-based workflows. Also prepare:

- a Wix account with the minimum project/site permissions;
- a GitHub account and repository access when using Git Integration;
- a package manager selected by the project;
- a development or test site that is not the production site;
- access to the required Wix business solutions and test plans;
- a secure place for secrets;
- a named technical owner and release owner.

Do not use a production site as the first development environment.

## Pick the setup path

### Existing Wix site

1. Enable coding in Wix Studio or Wix Editor.
2. Decide whether the project stays editor-managed or uses Git Integration & Wix CLI for Sites.
3. If using Git, connect the site to GitHub and confirm the default branch.
4. Clone the repository locally.
5. Install the documented dependencies and the site CLI.
6. Open the project in the Local Editor.
7. Verify a harmless change in preview and verify that the source-control sync behaves as expected.

Follow the current [site Git setup guide](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/setting-up-git-integration-wix-cli-for-sites).

### Wix app

1. Read the [Wix CLI app quick start](https://dev.wix.com/docs/build-apps/get-started/quick-start/create-an-app-with-the-wix-cli).
2. Create the app with a permanent namespace and code identifier. Treat both as identity, not decoration.
3. Select or create a development site.
4. Run the local development workflow and install the app on the development site.
5. Generate only the extensions the product needs.
6. Record app permissions, OAuth settings, supported plans, webhooks, and required Wix apps.

### Wix Headless

1. Read [Choose Your Development Path](https://dev.wix.com/docs/go-headless/get-started/choose-your-development-path).
2. Decide between Wix-managed and self-managed hosting.
3. Choose the framework and authentication path.
4. Register a headless client when the path requires one.
5. Approve redirect domains and URIs before testing member flows.
6. Record which operations run as visitor, member, app, or admin.
7. Verify a real API call from the chosen frontend and a denied call from the wrong identity.

## Repository setup

Record these files or dashboard locations in the project README:

~~~text
Project name:
Wix site, app, or Headless project ID:
GitHub repository:
Default branch:
Wix lane:
Framework and package manager:
Node version:
Local start command:
Preview command:
Production release command:
Development site:
Staging or preview site:
Production site:
Secrets manager:
Required Wix apps or plans:
Required environment variables:
Code owner:
Content/data owner:
Release owner:
Support owner:
~~~

Use an .nvmrc, Volta, or the team’s equivalent version pin when the project supports it. Keep dependency versions reproducible with the selected package manager’s lockfile.

## Naming

Choose names that survive a rebrand:

- repositories describe the product or capability, not a temporary campaign;
- namespaces and code identifiers are permanent;
- collection names describe domain concepts;
- web methods describe an allowed business action, not a database operation;
- environment names describe risk: development, preview, staging, production;
- secrets describe purpose without embedding secret values;
- analytics events describe behavior and use a stable naming convention.

Do not put passwords, API keys, production exports, personal access tokens, or member data in:

- source code;
- commit messages;
- screenshots;
- issue bodies;
- test fixtures;
- browser local storage used for demos;
- public assets.

## First-day verification

Before accepting a feature:

- clone or open the project from the documented source;
- install dependencies from the lockfile;
- run the documented local development command;
- reach a harmless page or app surface;
- confirm logs are visible in the intended place;
- confirm the test site is not production;
- confirm a secret can be read only through the intended backend path;
- confirm a denied operation is actually denied;
- make and revert a trivial change without publishing it;
- write down anything that required tribal knowledge.

If the project cannot pass this check, fix the setup documentation before adding more functionality.

## Access review

Grant the smallest role that lets each person work. Review:

- Wix account roles and collaborators;
- GitHub repository roles and branch protection;
- app permissions and OAuth scopes;
- site collection permissions;
- secrets access;
- production publish rights;
- domain/DNS access;
- analytics and customer-data access.

Remove access when a person, vendor, or integration no longer needs it. Record the review date and owner.

