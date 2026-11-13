# Release, deployment, rollback, and operations

Before publishing, name the destination, the exact source, the changed state, and the recovery action. A local build does not establish that the right code, editor design, permissions, or data will reach the right site.

## Choose the release lane

| Lane | Reviewable artifact | Production action |
| --- | --- | --- |
| Wix Editor / Wix Studio site | Site preview and known editor/Git source | Publish from the editor or configured site CLI |
| Studio Two site | Editor preview of the prepared site | Publish from Studio Two |
| Wix app | Fresh build and review on the selected development site | Release an app version, then use the intended distribution/install path |
| Wix-managed Headless | Fresh build and optional hosted preview, or the static files for upload | `wix release` for a CLI-linked project, or upload the static build to publish it |
| Self-managed Headless | Host/framework build artifact | Use the chosen host's deployment procedure |

Use the [CLI quick reference](20-cli-quick-reference.md) for command details. The CLI for apps and Headless projects uploads the existing build output when you preview or release, so rebuild after any source change you intend to ship. A hosted preview stays fixed, an app release creates an app version, and a Headless release publishes the site. [Preview command](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/preview) · [Release command](https://dev.wix.com/docs/wix-cli/command-reference/project-commands/release)

For a static Headless site, review the built files before uploading. The Wix uploader deploys the files and returns a live URL as part of the upload. [Static site upload](https://dev.wix.com/docs/go-headless/wix-managed-headless/other-frameworks/your-own-frontend/upload-a-static-site)

For app updates, record the release type and the installed version you actually tested. A major update requires site owner action. Sites on the latest major version receive its minor updates automatically. Adding permissions requires a major release. [Wix app versioning](https://dev.wix.com/docs/build-apps/manage-your-app/versioning/about-app-versioning)

## Example: a small site release plan

This is a filled plan, not a completed release record:

```text
Change: member order page now returns only the signed-in member's rows
Lane/destination: Wix site; orders-production; owner confirms site ID before publish
Source: intended reviewed commit 7c42e19; editor UI unchanged
Other state: collection permission reviewed; no schema change or backfill
Evidence: A/B isolation and anonymous denial on orders-test; keyboard retry checked
Release: owner publishes the declared source through the site's configured workflow
Smoke: A sees A's fixture; anonymous denied; no privateNote in response
Recovery: disable order list, preserve evidence, restore known-good source if compatible
Recovery status: procedure documented; production recovery not rehearsed
```

Replace example IDs and source revisions with real values. Record only changed categories; “no schema change” is more useful than ten empty fields. Use the [release record](templates/release-record.md) to save the result.

## Run the release in this order

1. **Confirm source and destination.** Check the branch/commit or local source, selected site/app/project, editor/UI version, and changed settings. Stop if the selected destination is unknown.
2. **Keep a recovery point.** For a data/configuration change, identify a permitted backup/export or correction procedure. Record compatibility constraints before the first write.
3. **Apply dependent changes in their documented order.** For example, add a new optional field before code starts writing it. Keep older readers compatible through the transition.
4. **Perform the owner-approved publish/release.** Save the resulting version/URL and time. Do not infer publication from a successful preview.
5. **Smoke-test the changed task.** Use the intended identity and safe synthetic data. Include the denied path when permissions changed. Check the stored result and provider side effect where relevant.
6. **Inspect the relevant logs and close the record.** Record observed behavior, any unknowns, and the next action. If the task fails, use the recovery procedure below.

For Git-connected Wix Editor and Wix Studio sites, the editor publishes the default-branch code with the latest editor UI. The site CLI lets you choose default-branch or local code and uses the UI version named by `wix.config.json`. Check the displayed code source and UI version together. Keep a recoverable copy if publishing local code, since a subsequent default-branch publish can replace the live copy. [Wix site publishing](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/publishing-a-site-with-git-integration-wix-cli-for-sites)

For Studio Two, wait for the editor to finish preparing the site and exercise the changed task in Preview. Wix can accept a publish while a build is failing, which can leave a live component unable to load. The beta export workflow's import replaces editor content before the separate publish action. Review the target and import scope before either step. [Studio Two errors and publishing](https://dev.wix.com/docs/studio-two/test-your-site/about-errors-in-studio-two) · [Studio Two import behavior](https://dev.wix.com/docs/wix-cli/command-reference/origami-commands/origami-import-site)

## When replacing a site's frontend

For a managed Astro migration, the preview site's URL and the site supplying business data can point to different Wix sites. Verify the target of any test write. Treat the dashboard's **Complete Migration** flow and its `wix finalize-migration` command as the live cutover. Record the old and new routes and confirm the supported switch-back procedure before cutover. [Managed migration procedure](https://support.wix.com/en/article/wix-headless-moving-your-site-to-a-custom-frontend) · [Developer migration checklist](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/post-migration-checklist-wix-studio-and-editor-sites-to-headless)

The developer checklist says old `/_functions` URLs stop reaching Velo after a managed Astro cutover. The Help Center says the new frontend can still call existing HTTP functions. For any endpoint the site or an external caller relies on, plan a replacement and verify its actual destination and behavior as part of cutover. The self-managed migration has a separate domain switch procedure and may also change endpoint URLs. [Developer migration checklist](https://dev.wix.com/docs/go-headless/wix-managed-headless/full-integration-astro/get-started/post-migration-checklist-wix-studio-and-editor-sites-to-headless) · [Help Center migration FAQ](https://support.wix.com/en/article/wix-headless-moving-your-site-to-a-custom-frontend) · [Self-managed migration](https://dev.wix.com/docs/go-headless/self-managed-headless/get-started/migrate-from-an-existing-wix-site/migrate-a-wix-site-to-a-headless-project)

## Make recovery specific

| Changed state | Recovery must name | What source restoration cannot undo |
| --- | --- | --- |
| Site code/UI | Known-good source/editor version and actual restore/publish procedure | Collection writes or provider actions |
| App version | Supported version/distribution recovery for that app | Installation data and already processed events |
| Schema/data | Compatible readers, backup/correction scope, verification query | External actions triggered by bad records |
| Secret/configuration | Intended names/scopes and provider-side correction | Exposed credentials; those need a separate rotation response |
| External action | Provider record/request IDs and compensation procedure | A sent message or payment by merely reverting code |

A statement such as “roll back if needed” is incomplete. If the procedure has not been rehearsed, label it **unverified**. If old code cannot read new data safely, disable the affected write path and use a compatible forward fix.

Treat site history and CMS recovery as separate actions. Wix's developer guide says an older Wix Editor or Wix Studio site version can restore schemas and permissions, while the Wix Help Center says site history leaves CMS collection structure in place. Both say collection records stay current. Before relying on a restore, check the scope on the target editor and collection type and keep a separate recovery point for the affected data and permissions. [Developer site history](https://dev.wix.com/docs/develop-websites-sdk/publish-your-site/site-history/about-site-history) · [Help Center restore limits](https://support.wix.com/en/article/restoring-a-saved-version-of-your-site)

## If the release goes wrong

Stop harmful new writes first when possible. Preserve the version, timestamps, request IDs, and affected record IDs. Establish scope before replaying anything. A timeout does not prove that no write occurred.

Choose disablement, source recovery, or a forward fix using the table above. Verify the recovered task and reconcile data/provider effects. Save a short [incident report](templates/incident-report.md); add the smallest regression check that would catch the cause. See [Troubleshooting](16-troubleshooting.md) for diagnosis.
