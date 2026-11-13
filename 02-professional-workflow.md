# Finish one useful change

Write down the expected result, build the smallest complete path, and check the behavior you changed. Keep a resume note so you can stop without losing context.

## Example: a member sees their recent orders

This feature reads a custom collection on a Wix Studio or Wix Editor site. The collection is independent of Wix Stores order history. [Private member orders recipe](the-missing-manual-to-velo.md)

~~~text
Result: A signed-in member sees up to 50 of their own recent orders.
Editor: Wix Studio with editor-managed Velo site code.
Data: custom Orders collection; memberId is set by trusted backend code.
Access: members call getMyRecentOrders(); browser cannot read the collection.
UI: loading → rows, empty message, or recoverable error.
Check: member A sees A's rows; B sees B's rows; signed-out call is denied.
Recovery: restore previous code; preserve all order records.
Next action: create two synthetic test-member fixtures.
~~~

That is enough to start. Use the [feature template](templates/feature-brief.md) when a reusable form helps.

## Work in four passes

| Pass | Do | Evidence to keep |
| --- | --- | --- |
| Define | Name the user action, identity and stored data | A short brief like the example above |
| Build | Complete one path through UI, backend and data | Actual files, element IDs and collection settings |
| Check | Run focused checks; exercise success, empty and denied/failure states | Command/result or exact manual steps and observation |
| Resume or release | Save the next action, or prepare an explicit publish/recovery record | Source location, unresolved limits and recovery steps |

For an editor-only copy edit, the affected page and links may be the whole check. A permission change needs identity checks. An external mutation needs duplicate and ambiguous-result handling. Size the work to the behavior.

## Keep the boundaries visible

A code diff does not capture an editor layout or a CMS permission change. Record each affected surface:

~~~text
Code: backend/orders.web.js and the Orders page code.
Editor: ordersRepeater with orderIdText/orderTotalText/orderStatusText children;
        ordersMessage text and refreshOrders button outside the repeater.
CMS: Orders collection, private CRUD permissions; synthetic rows only.
External settings: none.
Not checked yet: signed-out rejection on the published test site.
~~~

Use the actual names from your implementation. Do not label a configuration “done” because the JavaScript parses.

## Stop with a usable resume note

~~~text
Stopped: collection and backend are ready; repeater not wired yet.
Open: Orders page → page code.
Next: paste the page example and set the three element IDs.
Known: offline member-query mocks pass; real Wix permissions remain untested.
Preserve: existing collection records; no migration needed.
~~~

Record observed results and unknowns separately. A future session should need one next action, not a reconstruction of the conversation.

## When the change is ready

The named behavior works in its target environment, failure messages are usable, and the saved source/configuration can reproduce it. If release is next, use the [release guide](15-release-operations.md). For shared work, add the [handoff details](17-team-practice.md) that another person needs.
