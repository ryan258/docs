# Velo for fun and profit — the simple version

This is the plain-language version of [Velo for fun and profit](velo-for-fun-and-profit.md). Same ideas, fewer big words. Read the full one when you actually build something.

## What Velo is

A Wix site is like a house you decorate by dragging furniture around. Velo is the toolbox that lets you add wiring: light switches, a doorbell that texts you, a lock that only opens for certain people.

Two useful categories (page code can also run on Wix’s server while preparing a page):

- **Front code** runs in the visitor's browser. Anyone can peek at it. Treat it like a note taped to your front door — fine for "hello," bad for secrets.
- **Back code** runs on Wix's computers. Visitors never see it. It reads API keys from a secure secret store and checks who is allowed to do what. Use Wix authentication for member passwords; do not store them in your own code.

Golden rule: **the browser asks, the server decides.** Never let the note on the door decide who gets in.

## Good things to build

You get the most out of Velo when the valuable part is a *rule* or an *action*, and the info is already in Wix.

- **A locked door.** Show a video or file only to members, or only to people who paid.
- **A smart form.** Someone fills in a form, and your code checks it, saves it, and tells your email tool or Slack. No more copying by hand.
- **Lots of pages from a list.** Make one page design, fill a spreadsheet-style list, and get hundreds of pages (useful when each page has distinct, valuable content).
- **A calculator.** "Answer 4 questions, get a price or a yes/no." The math lives in safe back code.
- **A robot chore.** A schedule can email a summary or tidy records. It still needs monitoring and a way to recover failures.
- **A helper widget.** Pull reviews, stock counts, or prices from another website and show them on yours.

## Bad things to build

Velo is the wrong tool when the hard part isn't "a Wix site with rules."

- Building a whole control panel or database app. Use a real app instead.
- Heavy work like making big PDFs or editing video. Let another service do that.
- Live systems with unusual scale or delivery requirements. Wix has realtime messaging for live updates; compare its capabilities with what your project needs.
- Giant piles of data with fancy reports. Keep that somewhere else and just show it on Wix.

If the fun part isn't the website, you might be using the wrong lane. Check [Platform map](01-platform-map.md).

## Possible effort and benefit

These are rough prototype estimates for someone who already knows Wix and has the required accounts and content ready. Reliable delivery, testing, and ongoing maintenance take additional work. The benefits are possibilities, not promises.

| Build | Work | Reward |
| --- | --- | --- |
| Members-only content | A few hours | A way to offer paid membership content |
| Smart form to your email/CRM tool | A few hours | Less manual re-entry and a clearer record of submissions |
| Many pages from a list | A few days | More useful pages that search engines may discover |
| Paid file download | Up to a day | Sell a file without a full store |
| Price/eligibility calculator | A few days | Better leads, fewer back-and-forth emails |
| Nightly robot chore | A few hours | Less routine work, with monitoring and recovery still needed |

## The recipes, in one line each

1. **Locked door:** browser asks for the file → server checks "are you a member / did you pay?" → server creates an expiring link to a private file. A public original would defeat the protection, and downloaded copies cannot be recalled.
2. **Smart form:** server checks the answers → saves one receipt per action → safely retries unfinished work → confirms the other tool accepted or completed it. "Saved" and "synced" are different states.
3. **Many pages:** write rows in a list, not pages. One design pulls in each row's words and picture.
4. **Paid download:** only make the download link *when someone asks and has paid.* Don't store the real link where people can find it.
5. **Calculator:** keep the math in one tested back-code function. The page just collects answers and shows the result.
6. **Robot chore:** a timer wakes your code → it grabs the new stuff (standard Wix Data queries return a first page of 50 by default, so handle additional pages) → sends it or syncs it → marks it done.
7. **Helper widget:** back code calls the other website when a secret is needed → may briefly cache public results to reduce requests → shows a small, tidy version.

## Fun little wins

Small, safe, quick, and they make people smile.

- "Welcome back, Sam!" when a member returns.
- A "copy link" button with a little checkmark animation.
- Change the headline based on where the visitor came from.
- A live counter: "12 spots left."
- A form field that checks itself as you type (phone number, promo code).
- A random tip or review that changes on each visit.
- A countdown that switches the button when it hits zero.

## Where the money really comes from

Not the clever button. It comes from:

- **Counting what happens.** Track when people view, start, submit, and pay. You can't improve what you don't measure.
- **Killing hand-work.** Every form you retype, every weekly export, every "is this in stock?" email is a chore your code can delete. Count the hours saved.
- **Not dropping leads.** Checking and saving forms properly means fewer lost because of a typo or a broken hand-off.
- **Rules that change a lot.** Custom code can help when existing settings cannot express your rules, but someone must maintain and test it.

## Easy ways to lose money

- One huge "utils" file nobody can read anymore.
- Letting the browser decide who's allowed in. It's only a hint. The server decides.
- Changing data through code without updating the dataset or display that shows it.
- Hiding a permission bug behind "saved answers" so one person sees another person's stuff.
- A robot that runs twice and does everything twice. Make it safe to repeat.
- Copying a product across sites without a maintenance plan. Use an app when it needs installation and updates on multiple sites.
- Skipping the test on the real published site because the preview looked fine.

## Before you ship

- Access, payment, and other trusted decisions are checked on the server.
- The server checks the inputs and only sends back what's needed.
- Retries have been tested to prevent duplicate effects; uncertain payment or email outcomes have a recovery path.
- Secrets live in a secret store and are read only by authorized back code. None in the page or repo.
- Loading, empty, and error screens actually exist.
- You're tracking the steps that matter.
- You tested it on the real published site.
- The full launch list: [Checklists](18-checklists.md).

## Read the implementation guides

- [Velo for fun and profit](velo-for-fun-and-profit.md) — the full recipes with code.
- [The missing manual to Velo](the-missing-manual-to-velo.md) — how Velo works and where it trips you up.
- [Velo API reference](https://dev.wix.com/docs/velo) — the official docs.

Technical facts and implementation caveats are maintained in the [full guide](velo-for-fun-and-profit.md) and [verification record](21-verification-record.md). The record describes the focused 2026-10-03 fact-check, the uncorroborated historical test report, and how to run new local checks.
