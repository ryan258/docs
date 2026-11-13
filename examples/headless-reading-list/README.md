# Headless reading list: complete application files

The [Headless walkthrough](../../06-headless.md) supplies the exact managed Astro setup, CMS schema/permissions, copy commands, start route, expected results, and troubleshooting. The route uses a real Wix SDK query; its `loadReadingList()` helper is shared with the offline checks.

| File | Role |
| --- | --- |
| [reading-list.astro](reading-list.astro) | Complete `/reading-list` route; copy to the generated project's `src/pages/reading-list.astro` |
| [reading-list.mjs](reading-list.mjs) | Real query call plus result validation/projection; copy to `src/lib/reading-list.mjs` |
| [reading-list.d.mts](reading-list.d.mts) | Types for the helper import; copy beside it to `src/lib/reading-list.d.mts` |
| [seed.csv](seed.csv) | Import into the new empty example CMS collection; no system IDs |
| [reading-list.fixture.json](reading-list.fixture.json) | Synthetic API result used by offline checks; not a CMS import file |
| [reading-list.test.mjs](reading-list.test.mjs) | Controlled query and result-contract checks; no Wix/network execution |

From this handbook's `docs/` Git root with Node.js 20+:

~~~sh
node --test examples/headless-reading-list/reading-list.test.mjs
~~~

The application itself needs the Wix-managed Astro scaffold and `@wix/data`; the offline checks do not install or import Wix. A passing local result does not establish actual project authentication, permissions, imports, or Astro rendering.
