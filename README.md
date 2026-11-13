# Wix development: examples and field guide

Build one useful thing, understand where it runs, and keep enough notes to resume it. Start with the task below; the numbered chapters are references, not a required course.

[Resume Wixing](restart.html) for the last decision and next action.

**Platform review: November 10, 2026.** Check the editor before copying a recipe. The greeting and member-orders recipes use Velo on **Wix Editor** or **Wix Studio**. **Studio Two** is rolling out gradually and uses React, TypeScript, and its own extension model. **Wix Harmony** supports dashboard snippets but has no site code. Use the [platform map](01-platform-map.md) to find the path for your site. [Wix site types](https://dev.wix.com/docs/overview/platform-overview/types-of-wix-sites)

## Start with something you can run

| You want to… | Start here | Result |
| --- | --- | --- |
| Try an example without Wix or credentials | [Offline order formatter](examples/README.md) | Run a fixture through real JavaScript; inspect the output and focused tests |
| Connect a Wix button to backend code | [First site feature](04-site-development.md#build-a-button-that-calls-the-backend) | A named greeting, server validation, loading and failure states; no collection needed |
| Show a member only their own records | [Member orders recipe](the-missing-manual-to-velo.md) | Exact collection, permissions, backend method, repeater and page setup |
| Handle an external API response correctly | [CRM transport example](velo-for-fun-and-profit.md) | A mockable helper that distinguishes HTTP acceptance from failure; provider setup is still required |
| Read site data from an installed dashboard app | [Business locations app](05-app-development.md) | Complete React page, exact read permission, SDK call, loading/empty/error/retry states |
| Render CMS data in a custom frontend | [Headless reading list](06-headless.md) | Complete managed Astro route, collection setup and seed CSV, safe links and useful failures |
| See what still needs a Wix test | [Wix recipe acceptance checklist](18-checklists.md#wix-recipe-acceptance) | One action and expected result for each recipe |
| Find something worth building | [101 ways to use this project for fun and profit](101-ways-to-use-this-project-for-fun-and-profit.md) | Ideas for personal tools, creative projects, paid work, and practice |
| Check project priorities and plans | [Roadmap](roadmap.md) | Verified state, active priorities, and planned expansions |
| Fix something broken | [Troubleshooting](16-troubleshooting.md) | Symptom → smallest useful check → next action |

**Example labels:** “Offline runnable” needs only Node.js. “Wix recipe” includes editor/account setup and needs a Wix check. “Design sketch” explains a contract and leaves infrastructure to the consuming project. Each example says what it requires and what you should see.

## Find the detail you need

| Task | Reference |
| --- | --- |
| Identify your editor or choose between site code, an app, and Headless | [Platform map](01-platform-map.md) |
| Scope one change and resume it later | [Workflow](02-professional-workflow.md), [small templates](templates/README.md) |
| Set up an existing project | [Project setup](03-project-setup.md), [CLI reference](20-cli-quick-reference.md) |
| Decide where code and rules belong | [Architecture](07-architecture.md), [Velo runtime manual](the-missing-manual-to-velo.md) |
| Design collection fields, queries and writes | [Data and CMS](08-data-content.md) |
| Protect private data or secrets | [Security](09-security.md) |
| Call an API, accept a webhook or retry work | [Integrations](10-integrations.md) |
| Check changed behavior | [Testing](11-testing.md), [verification evidence](21-verification-record.md) |
| Improve keyboard use, layout or load time | [Accessibility](12-accessibility.md), [performance](13-performance.md) |
| Set page metadata and useful measurements | [SEO and analytics](14-seo-and-analytics.md) |
| Publish, diagnose or recover a change | [Release](15-release-operations.md), [checklists](18-checklists.md) |
| Hand work to another person | [Shared practice](17-team-practice.md) |
| Track project priorities and next steps | [Roadmap](roadmap.md) |
| Decode a term or find an official API | [Glossary](19-glossary.md), [official resources](99-official-resources.md) |
| Start with the plain-language explanation | [The simple version](velo-for-fun-and-profit--eli5.md) |

## Check this handbook locally

From this `docs/` directory, with Node.js 20 or later:

~~~sh
node examples/orders-demo.mjs
node examples/orders-demo.mjs --empty
node scripts/verify.mjs
~~~

The first commands show filled and empty states from synthetic orders. The handbook checker includes the formatter's focused tests, Markdown links/fences, JavaScript syntax and controlled example behavior; it saves a dated JSON report under `verification-results/`. It does not contact Wix or a provider. See the [verification record](21-verification-record.md) for the latest result and exact limits. To check only the formatter, run `node --test examples/order-presentation.test.mjs`.

The offline examples' Node requirement is separate from Wix's CLI requirement. For the supported Node version and commands for your project, see [setup](03-project-setup.md) and the [CLI reference](20-cli-quick-reference.md). The [verification record](21-verification-record.md) separates the platform source review from local checks. The Wix recipes still need verification with your actual site and identities.

## Use the smallest workflow that serves the job

For a personal site, start in the editor with one useful feature and a short resume note. Git integration, an app installation lifecycle, or a separately hosted frontend should solve an actual requirement. The app and Headless chapters remain available when the work calls for them.

Keep credentials in the appropriate backend secret store. Track code, editor layout, collection permissions and content separately: changing one does not automatically capture the others. Publishing and external account changes are explicit operator actions.
