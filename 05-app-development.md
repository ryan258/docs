# Build an installed Wix app

Build an installed app when the feature belongs in a site's dashboard or must travel with an installation. For one site's page feature, use [site development](04-site-development.md).

This chapter builds a **Business locations** dashboard page that reads actual locations from the site where the app is installed. It shows names, addresses, time zones, and the default-location marker, with loading, empty, error, and retry states. The read is deliberately bounded to the first 50 non-archived locations.

This is a complete source example for a newly generated basic Wix CLI app. The app reads existing Wix location data. Use the acceptance steps below to check dependency resolution, installation, and rendering on your development site. [Verification record](21-verification-record.md)

## Create a development app

The app quick start specifies Node.js **24.22.1 or later**, configured Git, and a Wix account. [App quick start](https://dev.wix.com/docs/build-apps/get-started/quick-start/create-an-app-with-the-wix-cli) · [Runtime and offline checker requirements](03-project-setup.md#check-the-runtime-before-installing-the-cli)

The scaffold downloads packages, registers an app in your Wix account, and initializes the new project's Git repository with a first commit. The development step installs the app on the site you choose. [App creation reference](https://dev.wix.com/docs/wix-cli/command-reference/project-creation/create-app)

For the copy commands in this example, create the app **beside this `docs/` directory**. From the handbook's repository root, go to its parent and create the app:

~~~sh
cd ..
npm create @wix/new@latest app
~~~

Choose **Create a new Wix App**, then **Create a basic app** if prompted. Use:

| Prompt | Value |
| --- | --- |
| App name | `Locations Reader` |
| Folder | `locations-reader` |
| Namespace | Accept a suitable generated unique value; it is permanent |
| Code identifier | Accept the generated identifier; it is permanent |
| Optional IDE/MCP setup | Choose only tooling you intend to use; this example does not require it |

Enter the new project and add the Locations package:

~~~sh
cd locations-reader
npm install --save-exact @wix/business-tools
~~~

The complete source imports `react`, `@wix/design-system`, and `@wix/business-tools`. React and the Design System come with the basic dashboard scaffold; the command adds the only extra package. Keep the generated `package.json`, configuration, and lockfile. `--save-exact` records the resolved SDK version so the project can reproduce it; this handbook does not invent a version independent of the scaffold. [SDK package setup](https://dev.wix.com/docs/api-reference/business-management/locations/list-locations?apiView=SDK).

## Grant the read permission

In the **app's dashboard**, open **Permissions → Add Permissions**. Add **Read Locations**, matching scope ID **`SCOPE.DC-MULTILOCATION.READ-LOCATIONS`**, and save. Follow the List Locations operation reference for this read-only page. Wix's app quick start asks for the broader **Manage Locations** permission. [List Locations permission](https://dev.wix.com/docs/api-reference/business-management/locations/list-locations?apiView=SDK) · [How to match the scope ID](https://dev.wix.com/docs/build-apps/get-started/tutorials/tutorial-build-a-locations-app-with-the-cli) · [App quick start](https://dev.wix.com/docs/build-apps/get-started/quick-start/create-an-app-with-the-wix-cli)

Saved permission changes apply automatically to development sites, sometimes after a few minutes. They do not require a release merely to take effect there. Existing released installations follow the app's permission-update/acceptance lifecycle. [Configure app permissions](https://dev.wix.com/docs/build-apps/develop-your-app/auth/permissions/configure-permissions-for-your-app).

## Add the complete dashboard page

The basic app already registers a dashboard page at `src/extensions/dashboard/pages/my-page/my-page.tsx`. Keep its generated extension definition and ID; replace the component and place its two helper files beside it:

| Handbook source | Destination in the generated app |
| --- | --- |
| [my-page.tsx](examples/app-locations/my-page.tsx) | `src/extensions/dashboard/pages/my-page/my-page.tsx` |
| [location-model.mjs](examples/app-locations/location-model.mjs) | `src/extensions/dashboard/pages/my-page/location-model.mjs` |
| [location-model.d.mts](examples/app-locations/location-model.d.mts) | `src/extensions/dashboard/pages/my-page/location-model.d.mts` |

From `locations-reader/`, with the handbook in the sibling `docs/` folder:

~~~sh
cp ../docs/examples/app-locations/my-page.tsx src/extensions/dashboard/pages/my-page/my-page.tsx
cp ../docs/examples/app-locations/location-model.mjs src/extensions/dashboard/pages/my-page/location-model.mjs
cp ../docs/examples/app-locations/location-model.d.mts src/extensions/dashboard/pages/my-page/location-model.d.mts
~~~

These are whole files. The `.mjs` helper is both the app's actual request/formatting logic and the offline test target. Its adjacent `.d.mts` supplies TypeScript declarations. There are no hidden utilities or required editor element IDs. If an intentionally different template generated another dashboard filename, place all three files in that page's directory and keep its registered component path correct.

Here is the complete page source, also stored in the linked file:

~~~tsx
// src/extensions/dashboard/pages/my-page/my-page.tsx
import React, { useEffect, useState } from 'react';
import { Page, WixDesignSystemProvider } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { locations } from '@wix/business-tools';
import { loadLocationsPage, type LocationPage } from './location-model.mjs';

type View =
  | { status: 'loading' }
  | { status: 'success'; page: LocationPage }
  | { status: 'error' };

export default function DashboardPage() {
  const [view, setView] = useState<View>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setView({ status: 'loading' });
    loadLocationsPage(options => locations.listLocations(options))
      .then(page => {
        if (active) setView({ status: 'success', page });
      })
      .catch(() => {
        if (active) setView({ status: 'error' });
      });
    return () => { active = false; };
  }, [attempt]);

  const status = view.status === 'loading'
    ? 'Loading locations…'
    : view.status === 'success'
      ? `${view.page.rows.length} location(s) returned.`
      : '';

  return (
    <WixDesignSystemProvider>
      <Page>
        <Page.Header title="Business locations" subtitle="Locations for this installed site" />
        <Page.Content>
          <section aria-label="Business locations list">
            <p role="status" aria-live="polite">{status}</p>
            <button
              type="button"
              disabled={view.status === 'loading'}
              onClick={() => setAttempt(value => value + 1)}
              style={{ minHeight: 44, padding: '8px 16px' }}
            >
              {view.status === 'error' ? 'Retry' : 'Refresh locations'}
            </button>
            {view.status === 'error' && (
              <p role="alert">Locations could not be loaded. Choose Retry.</p>
            )}
            {view.status === 'success' && view.page.rows.length === 0 && (
              <p>No locations returned. Add one in this site's Settings → Business Info, then refresh.</p>
            )}
            {view.status === 'success' && view.page.rows.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left' }}>
                  <caption>First page: up to 50 non-archived locations.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Address</th>
                      <th scope="col">Time zone</th>
                      <th scope="col">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.page.rows.map(row => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.address}</td>
                        <td>{row.timeZone}</td>
                        <td>{row.isDefault ? 'Default' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {view.status === 'success' && view.page.hasMore === true && (
              <p>More locations are available. Open Settings → Business Info for the full list.</p>
            )}
          </section>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
}
~~~

The helper calls `locations.listLocations({ paging: { limit: 50, offset: 0 }, includeArchived: false })` and reads `response.locations`. It uses the SDK's `_id` and `address.formatted`; the REST JSON fields are `id` and `address.formattedAddress`. `queryLocations().find()` is a different call with a different result shape. Missing optional address/time-zone values get explicit labels. Missing or duplicate IDs cause a visible failure rather than ambiguous rows. [List Locations contract](https://dev.wix.com/docs/api-reference/business-management/locations/list-locations?apiView=SDK), [SDK Location response examples](https://dev.wix.com/docs/sdk/backend-modules/business-tools/locations/locations-query-result/items), [REST list and paging fields](https://dev.wix.com/docs/api-reference/business-management/locations/list-locations).

For this current Wix CLI dashboard extension, authentication is handled by the framework and calls use the Wix user's dashboard identity. The app's configured scopes still apply. The page default-exports a component inside `WixDesignSystemProvider` and imports its CSS, as the current quick start does; no manual client, API key, or `withDashboard()` wrapper is required for this simple page. Self-managed apps need a different authentication setup. [SDK environments and identity](https://dev.wix.com/docs/api-reference/articles/sdk-setup-and-usage/develop-with-the-sdk), [dashboard-react migration](https://dev.wix.com/docs/sdk/host-modules/dashboard-react-deprecated/migrating-from-dashboard-react).

## Install on a development site and run

From the generated app folder, start its development script:

~~~sh
npm run dev
~~~

The basic scaffold's `dev` script runs the Wix `dev` command. Select or create a **development site**, approve **Agree & Add** when the installation page opens, then open **Dashboard** from the CLI menu. In that site's dashboard, open the generated page under **Apps**. Its sidebar name may still be **My Page** because the generated extension metadata controls that label; the page header should read **Business locations**.

For the next session, `wix dev-site current` shows which site the app uses. If you need to switch without the interactive picker, run `wix dev-site list` and then `wix dev-site select <site-id>` from the app project. The list includes regular sites, so confirm the ID of your development site first. If the app needs to be installed there, the CLI prompts for installation before saving the selection. [Development-site commands](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/app-only/dev-site)

To make this page easier to find, set `title` to `Business locations` in the generated `.extension.ts` definition and keep its existing ID. To include it in dashboard search, set `metaData.searchable` to `true`, use the same name in `metaData.title`, and describe the page in `metaData.description` (up to 200 characters). Leave `fullPage` unset to keep the sidebar. Check search after release on the intended installation, since the CLI build does not check these metadata limits. [Dashboard page configuration](https://dev.wix.com/docs/dashboard-extensions/dashboard-pages/dashboard-page-extension-files-and-code)

To get recognizable results, use that development site's **Settings → Business Info** to add test locations named **North studio** and **South studio**, entering any required non-sensitive address details in Wix's form. Then return to the app and select **Refresh locations**. A site may already contain a default location, so do not expect exactly two rows or remove an existing location to match the example. The app only reads; adding or editing test locations here is an explicit owner action in the Wix settings UI. [Development loop](https://dev.wix.com/docs/build-apps/get-started/quick-start/create-an-app-with-the-wix-cli), [location-data setup](https://dev.wix.com/docs/build-apps/get-started/tutorials/tutorial-build-a-locations-app-with-the-cli).

**Expected successful result:** a table includes the two test names, their returned addresses and time zones, and the default marker where applicable. The status gives the number in this response. Its caption identifies the first-50 limit; if `pagingMetadata.hasNext` is true, the page explicitly says more locations exist. It does not claim this response is the site's complete history or all locations on a large site.

Stop the local server with **Ctrl+C**. This does not uninstall the app or remove the site's location data. A local development result does not release an app version.

## Check loading, empty, error, and retry states

Run the shared helper tests from this handbook's repository root (`docs/`), with Node.js 20 or later:

~~~sh
node --test examples/app-locations/location-model.test.mjs
~~~

The tests inject controlled SDK stand-ins into the **same helper the dashboard imports**. They check the exact bounded request, response projection, omitted/empty arrays, safe display fallbacks, malformed IDs, partial-page metadata, immutability, and a rejected API call. They make no Wix requests and do not establish React rendering or installed-site permissions.

For a visible empty/error check without changing business data, use a **disposable local app copy** and temporarily replace the `loadLocationsPage(...)` invocation in the page effect with one of these calls. Keep its existing `.then(...).catch(...)` chain. These are controlled UI fixtures, not Wix responses:

~~~tsx
// Empty fixture: finish loading and show the normal empty state.
loadLocationsPage(async () => ({ locations: [], pagingMetadata: { hasNext: false } }))

// Error fixture: finish loading and show Retry.
loadLocationsPage(async () => { throw new Error('Synthetic location failure'); })

// Retry fixture: first attempt fails; clicking Retry returns a named row.
loadLocationsPage(async () => {
  if (attempt === 0) throw new Error('Synthetic location failure');
  return {
    locations: [{ _id: 'fixture-location', name: 'Retry recovered' }],
    pagingMetadata: { hasNext: false },
  };
})
~~~

For the Retry fixture, reload the disposable app page to reset `attempt` to zero. Expect the safe error; click Retry and expect the `Retry recovered` row. This exercises the existing retry state without relying on hot-reload timing or changing any Wix data. Restore `loadLocationsPage(options => locations.listLocations(options))` before checking actual API access or building a review artifact. Do not delete or archive real locations to force an empty screen.

| Acceptance case | Expected result |
| --- | --- |
| First load or Refresh | `Loading locations…`; button disabled; previous table hidden |
| Real read with the test records | Named rows appear; requested limit is visible; button re-enabled |
| Controlled empty fixture | `No locations returned…`; button remains available; no indefinite spinner |
| Controlled rejected fixture | Safe alert; button becomes Retry; no old records shown as current |
| Read after recovery | Table replaces error; button returns to Refresh locations |
| Leave the page while a read is pending | Effect cleanup prevents that read updating an unmounted page |
| Install on a second development site | Its own location data appears; no site ID from the browser selects another installation |
| Keyboard and assistive use | Refresh/Retry can be invoked without a pointer; status changes are announced; table headers describe their cells |

Record the actual site, installed app, SDK lockfile version, and observed outcomes. These are acceptance instructions, not a claim that this repository has completed live Wix or assistive-device testing.

## Troubleshoot the example

| Symptom | Check first |
| --- | --- |
| App is in the app dashboard but no page appears on the site | Install it on the same development site opened from the active CLI menu |
| Old header or code persists | Active dev-server folder, selected development site, and generated extension component path; refresh/reopen the page |
| Module or TypeScript declaration cannot be found | Copy both `location-model.mjs` and `location-model.d.mts` beside `my-page.tsx`; retain the `.mjs` import extension |
| `@wix/business-tools` cannot be resolved | Install it in the generated app folder with that project's package manager; retain its lockfile |
| Permission denied / safe error on every real read | Correct app's Read Locations scope ID, selected development site, installer/collaborator access, and propagation delay |
| Unexpected empty result | Real call restored; site in dashboard matches the CLI selection; locations exist and are non-archived |
| Invalid ID error in a controlled fixture | Use SDK `_id`, not REST `id`, and give each row a unique ID |
| More locations exist than the table shows | This example intentionally requests one 50-row page; extend the paging contract before promising a full list |

## Installation-specific state

This read-only example stores no app settings. Wix's installed-site context selects the site's locations. If you later add saved preferences, scope them by verified installation context on the backend:

~~~text
verified installation/site A → settings A
verified installation/site B → settings B
caller-supplied site ID → input to validate, never authorization by itself
~~~

Before relying on saved settings, set different values on two development sites and demonstrate isolation. Define and check uninstall/reinstall behavior deliberately; do not assume removing the app also removes data you store elsewhere.

## Add only the required surface

| Needed behavior | Add | Concrete check |
| --- | --- | --- |
| Change a saved app preference | Backend persistence behind the dashboard | Refresh and reopen; preference survives for this installation |
| Show something on the public site | Supported site widget/plugin | Correct placement and loading/empty/error behavior on the installed site |
| Respond to a business event | Event extension | Repeated delivery does not repeat an unintended mutation |
| Call a protected external service | Authorized backend adapter and secret | Safe failure and recoverable pending work |

Use the current extension generator/reference in [CLI commands](20-cli-quick-reference.md); preserve generated IDs. Nothing in this read-only recipe requires a database, external provider, or new hosted service.

## Preview a snapshot; release a version

From the generated app's root, build through its npm script before creating a review snapshot:

~~~sh
npm run build
~~~

Expected: the project's build completes successfully and produces its app assets. This checks the generated app with its installed dependencies; it does not release an app version or establish live API permission behavior. Keep the generated script mapping to the current Wix `build` command rather than substituting a different CLI family. [Build command](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/build).

Rebuild after each change you want to preview. `wix preview` uploads that build as a fixed snapshot without creating an app version. The links it prints install the preview on the development site you select. `wix release` creates an app version for the intended distribution path. [Preview command](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/preview) · [App build and deploy guide](https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy)

Wix added service-plugin and event testing in CLI previews on October 19, 2026. Check the extension-specific preview contract before deciding a release is needed for testing. [Wix changelog](https://dev.wix.com/changelog?featureType=Build+Apps).

Keep a [release note](templates/release-record.md) with source revision, development site, SDK versions, permissions, observed results, and recovery action. Use [distribution checks](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-checks-and-testing-guide) when distribution is the goal. The [verification record](21-verification-record.md) distinguishes local source checks from live acceptance.
