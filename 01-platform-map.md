# Choose your Wix development path

Choose by the result you need and the editor you actually have. A single site's custom button usually belongs in site code. Use an app when you need to install the same extension across sites.

| Your requirement | Choose | First useful example |
| --- | --- | --- |
| Keep pages editable in Wix Studio or Wix Editor; add custom behavior | Wix site with Velo/SDK | [Button → backend greeting](04-site-development.md#build-a-button-that-calls-the-backend) |
| Extend a site built in Studio Two | Studio Two Code tab and Wix Extension Builder | [Add a Studio Two HTTP endpoint](https://dev.wix.com/docs/studio-two/code-your-site/build-a-custom-backend/http-endpoints/add-an-http-endpoint-extension-in-studio-two) |
| Install a dashboard page, widget or integration on separate Wix sites | Wix app | [Development-site dashboard edit](05-app-development.md) |
| Build your frontend in a custom framework with Wix business APIs | Wix Headless | [Choose hosting and create a starter](06-headless.md) |
| Change only copy or visual layout | Editor/CMS | Update the content, then check the affected page |

## Identify your editor before copying code

- **Wix Studio and Wix Editor** share the site code model used by this handbook's `$w`, `.web.js`, and `/_functions` examples. Open the Code panel in Wix Studio or enable Dev Mode in Wix Editor. [Wix development paths](https://dev.wix.com/docs/overview/platform-overview/development-paths)
- **Studio Two** began rolling out on November 2, 2026. It uses a browser Code tab, TypeScript, Editor React Components, the Site SDK, and HTTP endpoints for calls from its own frontend. The initial release excludes `$w`, Velo web modules and HTTP functions, and Wix Studio's Git integration. Check which features your project needs before choosing it. [Studio Two overview](https://dev.wix.com/docs/studio-two/get-started/about-extending-websites-with-studio-two) · [Feature comparison](https://dev.wix.com/docs/studio-two/get-started/compare-extending-websites-in-studio-two-to-wix-editor-and-wix-studio)
- **Wix Harmony** supports dashboard custom code snippets for embeds and similar tasks. The Velo site code recipes require Wix Studio or Wix Editor. [About Wix Harmony](https://dev.wix.com/docs/develop-websites/articles/get-started/about-wix-harmony)

## Write one decision, with a reason

Example for a reading list:

~~~text
Result: I can open my saved reading list after signing in.
Path: Wix Studio, with the existing Velo/SDK site code model.
Code: editor-managed for this first feature.
Data: private ReadingList collection; backend derives the member identity.
Release: site owner publishes after checking two test members.
Recovery: restore previous page/backend code; keep the collection data.
Revisit if: I need a separately hosted mobile frontend.
~~~

Change the nouns and the actual source locations. You do not need a platform comparison report for a button.

## Know which boundary you selected

| Concern | Wix Studio / Wix Editor | Studio Two | Wix app | Headless |
| --- | --- | --- | --- | --- |
| Frontend | Wix editor pages with Velo | Editor pages with React components | App dashboard/site extensions | Your frontend framework |
| Backend entry point | Site web methods, HTTP functions, events | HTTP endpoints for the site's frontend and backend extensions | App extensions and app APIs | Chosen host/integration and Wix APIs |
| Identity to check | Visitor, member, owner/collaborator | Visitor, member, Wix dashboard user | Authorized installation/site and caller | Visitor/member or protected server identity |
| Source | Editor code or connected repository; layout also lives in editor | Code tab and editor layout; optional export | CLI repository and app configuration | Frontend repository plus Wix configuration |
| Production action | Publish site | Publish from Studio Two | Release app version and use its distribution path | Managed release or your host's deploy |

Site Git integration has its own command reference. The app/Headless CLI has another. See the [lane-specific commands](20-cli-quick-reference.md) before copying a command from another project.

## Headless has a second decision

Choose Wix-managed Astro when its integrated hosting and authentication fit. With another supported managed framework, Wix hosts the frontend and you configure authentication. Self-managed Headless puts both in your hands. Compare the available capabilities and decide whether the custom frontend should replace an existing site or run alongside it. [Wix Headless development paths](https://dev.wix.com/docs/go-headless/get-started/choose-your-development-path)

## Three mistakes that cost time

- **Preview assumed to cover HTTP changes:** a site CLI preview uses live HTTP functions. Use the [endpoint matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments).
- **Private page assumed to hide frontend code:** keep credentials and protected operations in the backend. See [code placement](07-architecture.md).
- **App created for a single site's form:** first try a narrow site web method; add installation machinery when installation is a requirement.

Next: [set up the selected path](03-project-setup.md), or [scope one feature](02-professional-workflow.md).
