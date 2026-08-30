# Accessibility

Accessibility is product quality. A page that looks correct in the editor but cannot be completed with a keyboard, screen reader, zoom, or reduced-motion setting is not done.

## Baseline

Adopt [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA as the default internal target unless the product owner, legal counsel, or a documented audience requirement sets a stricter or different standard. Record the target; do not imply that using Wix automatically makes custom code accessible.

Accessibility acceptance criteria belong in the feature brief and release record.

## Structure and semantics

- Use one clear page title and a logical heading hierarchy.
- Use real buttons for actions and links for navigation.
- Give forms visible labels, instructions, required-state cues, and useful errors.
- Use landmarks and meaningful regions so assistive-technology users can navigate.
- Keep visual order and DOM or layer order aligned.
- Do not communicate meaning with color alone.
- Provide text alternatives for meaningful images; use empty alternative text for genuinely decorative images.
- Give icons accessible names or hide decorative icons from assistive technology.
- Make tables, lists, accordions, dialogs, and menus behave according to their semantics.

## Keyboard and focus

Every interactive task must work without a mouse:

- all controls are reachable in a logical order;
- focus is visible and not hidden behind sticky UI;
- dialogs move focus in, trap it appropriately, and return it on close;
- menus and custom widgets have predictable keyboard behavior;
- there is no keyboard trap;
- drag, hover, or pointer-only actions have an equivalent;
- dynamic content does not unexpectedly steal focus.

Test the actual published page, not only the editor canvas.

## Forms and errors

For each field:

- label it visibly;
- describe format and constraints before entry where useful;
- validate on the server as well as in the UI;
- associate errors with the field;
- preserve valid input after an error;
- summarize errors for long forms;
- announce important asynchronous status changes;
- avoid timing out a user without warning or recovery.

Error text should tell the user what happened and what to do next. Do not expose raw stack traces or provider messages.

## Visual design

Check:

- text and UI contrast;
- focus indicators;
- text resizing and zoom;
- line length and spacing;
- touch target size and spacing;
- responsive reflow;
- content at 200% zoom;
- high-contrast or forced-color modes where relevant;
- color blindness and grayscale as a quick sanity check.

Do not fix a contrast issue by removing meaningful focus or disabled-state distinctions.

## Motion and media

- Respect reduced-motion preferences where the implementation supports them.
- Avoid autoplaying sound and provide controls for media.
- Do not use flashing content.
- Keep animation away from critical reading and form completion.
- Ensure video has captions and identify transcript or audio-description needs.
- Provide a non-animated path for essential information.

## Wix-specific checks

In Wix Studio or Wix Editor, verify:

- layer order matches reading order;
- image alt text is correct for the actual content;
- custom elements and widgets expose names and states;
- dynamic pages handle missing or delayed content;
- lightboxes and menus have correct focus behavior;
- code does not hide required content from assistive technology;
- third-party apps do not introduce an inaccessible critical path;
- mobile and desktop layouts retain the same task capability.

## Manual test protocol

For each critical flow:

1. Reload on the first page.
2. Complete the flow with keyboard only.
3. Repeat at increased text size or zoom.
4. Repeat with reduced motion.
5. Inspect the accessibility tree or use a screen reader.
6. Test invalid input and recovery.
7. Test loading, empty, and error states.
8. Test on a narrow mobile viewport.
9. Record the browser, viewport, identity, result, and remaining limitations.

Automated scans are useful for common detectable failures. They do not prove task completion, logical focus, meaningful alternative text, or understandable error recovery.

## Accessibility definition of done

- critical flows are keyboard-complete;
- all controls have an accessible name and state;
- focus is visible and predictable;
- headings and landmarks make sense;
- forms and errors are understandable;
- images and media have appropriate alternatives;
- contrast and zoom/reflow checks pass;
- motion has a safe alternative;
- automated and manual checks are recorded;
- known exceptions have an owner and remediation date.

