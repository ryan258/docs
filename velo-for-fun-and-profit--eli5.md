# Velo for fun and profit — the simple version

Velo adds JavaScript to a site built with **Wix Editor** or **Wix Studio**. Use it for a useful rule or action: show your own saved records, check an answer, or stop copying the same information between tools. If your site says **Studio Two** or **Harmony**, start with the [platform map](01-platform-map.md); those editors use different tools.

**The browser asks; the server decides.** Code sent to a visitor's browser is visible to that visitor. The backend checks who they are and what they may do. Keep passwords with Wix's login system and API keys in its secret store.

## One example you can follow from start to finish

The [member-orders recipe](the-missing-manual-to-velo.md#working-example-private-member-orders) builds a page called **My orders**:

1. You sign in.
2. The page asks the backend for your recent records.
3. The backend gets your identity from the login session and selects your records.
4. It sends back only the record ID, total, and status.
5. The page shows the list, `No orders yet.`, or an error with a Refresh button.

The guide supplies the collection fields, private permissions, editor element names, file locations, code, and expected results. It uses a small custom collection, so you can learn the pattern without setting up a store or making a payment.

The key check: A sees A's records, and B sees B's. Hiding B's rows on A's screen would leave the private data in A's browser. The backend selects only A's records before responding.

## Try the display code without a Wix account

If Node.js 20 or later is already installed, run these from the handbook's `docs/` directory:

~~~sh
node examples/orders-demo.mjs
node examples/orders-demo.mjs --empty
~~~

The first command reads pretend records from a local file and prints two display rows. One includes `$24.50 USD` and `Paid`. The second prints `[]`, the empty-list case. Nothing is sent online or saved. [Files and expected output](examples/README.md).

This checks the display helper. Checking real logins and private records still requires the Wix setup in the full recipe.

## Pick a useful next step

| Repeated problem | Small build to consider |
| --- | --- |
| "I keep looking up the same records." | A private list with a clear Refresh action |
| "I keep making the same calculation." | One tested rule with inputs and an explained result |
| "These pages all use the same layout." | One CMS dynamic-page template with distinct content in each row |
| "I keep retyping this form elsewhere." | Save a receipt first, then sync it with visible pending/failed states |
| "I need the same summary regularly." | A scheduled job that saves its progress and can resume |

Use Wix's existing settings or an app when they already do the job. Add another service only when it solves a real part of the workflow.

## Three states that make a tool dependable

- **Empty:** no records is a normal answer. Say that clearly.
- **Failed:** tell the person what happened and give them a useful next action. Clear stale private data when the current read fails.
- **Saved but unfinished:** if a form was saved but another tool has not received it, show that difference. Keep enough information to finish later without asking for re-entry.

A repeated click can repeat an action. For writes, email, payment, or syncing, design the receipt and retry behavior before adding the button. A network error may leave the remote result uncertain.

## When money or private files are involved

The backend must confirm the real price, payment, or access rule. A message on the page is only a display. A protected file needs a private original and a backend check before issuing a temporary link. The recipient can still keep a downloaded copy.

The [full guide](velo-for-fun-and-profit.md) explains these design outlines and labels the unfinished parts. Its CRM code is a controlled transport example with an intentionally invalid host; it is not a ready-made CRM connection.

## Check the result you actually need

For a personal tool, success might be "one button gets me back to my task" or "my work survives a reload." Check that action with a keyboard, an empty list, a failed request, and the right signed-in identity. Keep the command or alias short and the saved work easy to find.

Local tests and Wix Preview answer different questions. Real member permissions and published behavior need their own site checks when the owner chooses to publish a development version. The [verification record](21-verification-record.md) says which checks have actually happened.
