# Runnable Wix examples

Choose a complete recipe, then use its source files and focused checks:

| Example | Source and setup | Offline check from `docs/` |
| --- | --- | --- |
| Installed dashboard app: business locations | [App files and mapping](app-locations/README.md), [full walkthrough](../05-app-development.md) | `node --test examples/app-locations/location-model.test.mjs` |
| Managed Headless Astro: public CMS reading list | [Route, helper and seed CSV](headless-reading-list/README.md), [full walkthrough](../06-headless.md) | `node --test examples/headless-reading-list/reading-list.test.mjs` |
| Velo member orders: display helper for Wix Editor or Wix Studio | [Full recipe](../the-missing-manual-to-velo.md#working-example-private-member-orders), files below | `node --test examples/order-presentation.test.mjs` |

The tests execute the same helpers used by the real pages with controlled inputs and SDK stand-ins. They do not run the React/Astro UI or establish Wix authentication. `node scripts/verify.mjs` runs these focused example tests plus the handbook checks.

The helpers run locally without a Wix account. For the full site recipes, [identify the editor](../01-platform-map.md#identify-your-editor-before-copying-code) before copying the code.

An optional syntax pass, `node scripts/verify-frameworks.mjs`, uses an existing TypeScript installation (local module or `tsc` on `PATH`). It parses TSX/declarations and Astro frontmatter. It does not compile Astro templates or resolve SDK imports. If needed, select an existing compiler with `--typescript /absolute/path/to/typescript/lib/typescript.js`; the script downloads nothing. For actual framework compilation, use each recipe's documented project build after setup.

## Velo display helper

Start here for a local result before setting up a Wix site. These files support the [private member-orders recipe](../the-missing-manual-to-velo.md#working-example-private-member-orders). They format synthetic order records; they do not authenticate anyone or query Wix.

## Run

Use **Node.js 20 or later**. From this handbook's `docs/` directory (the Git repository root):

~~~sh
node examples/orders-demo.mjs
node examples/orders-demo.mjs --empty
node --test examples/order-presentation.test.mjs
~~~

No package install, credentials, network, or file writes. The default fixture is resolved relative to the script, so it works when the script is launched from another directory too.

## Expected results

The normal demo prints:

~~~json
[
  {
    "_id": "order-1",
    "orderText": "Order order-new",
    "totalText": "$24.50 USD",
    "statusText": "Paid"
  },
  {
    "_id": "order-2",
    "orderText": "Order order-old",
    "totalText": "$0.00 USD",
    "statusText": "Pending"
  }
]
~~~

`--empty` prints `[]`. To supply your own local JSON array, pass a path relative to your current directory:

~~~sh
node examples/orders-demo.mjs examples/orders.fixture.json
~~~

Each record needs a nonblank string `id` of at most 128 characters and a finite, nonnegative numeric `total` in USD dollars. Known statuses are `pending`, `paid`, and `cancelled`; other values show `Status unavailable`. The array may contain at most 50 records. Invalid data, invalid JSON, an unreadable file, or an unsupported option prints `Orders demo failed: …` to stderr and exits with code 1. Input data is never modified.

## File map

| File | Purpose | Wix destination |
| --- | --- | --- |
| [order-presentation.mjs](order-presentation.mjs) | Pure `toOrderRows()` helper | Copy its entire contents to `public/orderPresentation.js`, or `src/public/orderPresentation.js` in Git |
| [orders.fixture.json](orders.fixture.json) | Two synthetic records already in recent-first order | Local only; actual CMS rows are created separately |
| [orders-demo.mjs](orders-demo.mjs) | Read fixture and print the resulting display rows | Local only; imports Node filesystem APIs |
| [order-presentation.test.mjs](order-presentation.test.mjs) | Tests labels, empty/malformed data, limit, IDs, and immutability | Local only |

The helper is the source used by the recipe; there is no second formatter snippet to keep synchronized. It turns an existing authorized response into view data. Keeping a field out of its output cannot remove that field from a response the browser has already received. The recipe's backend projection enforces that boundary.

Passing these tests establishes only local presentation behavior. Wix import resolution, web-method permissions, member isolation, collection configuration, and rendered accessibility still need the recipe's site acceptance checks. See the [verification record](../21-verification-record.md).
