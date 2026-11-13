# Installed-app location reader

These whole files implement the [installed-app recipe](../../05-app-development.md). Follow that chapter to generate the basic Wix CLI app, grant Read Locations, and install it on a development site. This folder is source material, not a scaffolded app with account IDs or dependencies already installed.

## Copy the app sources

Put these three files together in the generated app's `src/extensions/dashboard/pages/my-page/` directory:

| Source | Purpose |
| --- | --- |
| [my-page.tsx](my-page.tsx) | Full React dashboard page with loading, table, empty, error, Refresh, and Retry |
| [location-model.mjs](location-model.mjs) | Shared bounded request and response-to-row mapping |
| [location-model.d.mts](location-model.d.mts) | TypeScript declarations for the adjacent ES module |

Keep the generated page's extension metadata and registration. The component imports the helper as `./location-model.mjs`. The app uses generated React/Design System dependencies plus `@wix/business-tools`; it relies on the current Wix CLI dashboard identity rather than a manually supplied token or site ID.

## Run the offline checks

From the handbook's repository root (`docs/`), with Node.js 20 or later:

~~~sh
node --test examples/app-locations/location-model.test.mjs
~~~

The tests import the actual helper used by the page and inject a controlled `listLocations` function. They need no dependency install, credentials, filesystem writes, network, or Wix account.

Expected request:

~~~json
{
  "paging": { "limit": 50, "offset": 0 },
  "includeArchived": false
}
~~~

For the synthetic SDK response, the test expects one row named `North studio`, its supplied address and time zone, and `isDefault: true`. An empty response produces `rows: []`; API rejection stays a failure; missing optional fields get explicit display labels. SDK records use `_id` and `address.formatted`. REST JSON uses `id` and `address.formattedAddress`; a REST record is deliberately rejected by this SDK response mapper if copied unchanged without an `_id`.

The UI's `.tsx` cannot run as a Node script. It must render inside the generated Wix CLI app with its Design System stylesheet and framework identity. Offline helper tests and TypeScript syntax parsing cannot establish package import resolution, dashboard permissions, site selection, styling, or keyboard/assistive acceptance. Use the chapter's targeted manual cases and [verification record](../../21-verification-record.md).
