# Accessibility

Choose one critical task and complete it with the input methods the person actually uses. For a saved-search page, that means finding the field, entering or dictating a phrase, submitting, understanding the result, and recovering from failure without starting over.

Use [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) as a documented target. The short checks below are a practical starting pass; they do not cover every success criterion or establish conformance.

## Run a task, not a visual inspection

Example task: “Save a search named Accessible forms.” Run it in the actual browser runtime with a test identity and synthetic data.

| Action | Passing behavior | Common fix |
| --- | --- | --- |
| Tab from the page start | Search field and Save are reached in a sensible order; focus stays visible | Correct reading/tab order; remove obscuring overlays |
| Find the field by its name using assistive technology | Visible label and accessible name both say “Search phrase” | Label the control; avoid an icon-only name |
| Submit an empty phrase | Specific error identifies the field; other input remains | Associate an error and preserve entered values |
| Submit valid input | Loading and saved/failed states are understandable without color alone | Add visible status text and an appropriate status announcement |
| Open and close a modal | Focus enters the modal, stays inside while open, and returns to the opener | Fix the modal's focus behavior; non-modal panels must not trap focus |
| Retry after a failure | Input remains; retry does not create duplicate records | Preserve form state and enforce duplicate handling in the backend |

Short, matching visible labels help voice users name the control. A button visibly called “Save search” should have an accessible name that includes those words. Avoid repeated typing, hover-only instructions, drag-only actions, and expiring forms that discard work.

## Example: visible label, instructions, error, status

For a **custom Headless HTML frontend**, this is a copyable markup pattern. It does not use `$w` and is not pasteable into Wix page code. Wire the error and status to the real submission handler; the markup alone does not save anything.

```html
<form id="saved-search-form">
  <label for="search-phrase">Search phrase</label>
  <p id="search-help">Use 1–80 characters. Your phrase stays here if saving fails.</p>
  <input id="search-phrase" name="phrase" required maxlength="80"
    aria-describedby="search-help search-error">
  <p id="search-error" hidden></p>
  <button type="submit">Save search</button>
  <p id="save-status" role="status"></p>
</form>
```

When server validation rejects the phrase, set `aria-invalid="true"` on the input, fill and show `search-error`, and put focus on the invalid field when that helps recovery. When saving starts or completes, update the existing `save-status` region. Clear stale errors after correction. Do not announce “Saved” before the backend confirms success.

In **Wix Editor/Studio**, use the element's supported accessibility settings for names, descriptions, reading order, and media alternatives, then check the rendered result. Do not assume custom HTML attributes can be applied to every `$w` element. Keep the same task outcomes above for Wix controls, lightboxes, repeaters, and third-party widgets.

In **Studio Two**, use native HTML controls in custom Editor React Components. The Studio Two Site SDK's Device Info API exposes reduced-motion preference, and its Tabbing API can keep focus inside an open overlay. Test Escape, initial focus, and return to the opener in the rendered component. [Wix Site SDK accessibility and devices](https://dev.wix.com/docs/sdk/site-sdk/accessibility-and-devices/introduction).

## Check enlargement and narrow layout separately

1. Enlarge text to 200%. Labels, errors, buttons, and content remain available without overlap or clipping. See [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).
2. Check vertically scrolling content at a width equivalent to 320 CSS pixels, such as a 1280-pixel viewport at 400% zoom. Ordinary content should fit with vertical scrolling alone. Maps, data tables, and other content that needs two-dimensional layout have specific exceptions. Tab through the critical action at this width and check that sticky bars leave the focused control visible. [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
3. With reduced motion enabled, complete the task without relying on animation. Check text/UI contrast, meaningful image alternatives, captions where needed, and touch target usability on the changed surface.

## Record what was actually used

```text
Task: save and reopen a search; development site; source 7c42e19
Checked: keyboard path, visible focus, empty-input recovery, 200% text, 320px reflow
Assistive technology: not yet checked; do not infer a pass from markup
Issue: failure message vanished after 3 seconds
Fix/next check: keep message until retry; repeat failed-save task
```

Automated scans can find some markup and contrast failures. Human task completion is still needed for reading order, useful names, understandable errors, focus recovery, and the effort of returning after an interruption.
