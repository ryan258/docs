# Build a Wix site feature

Use this recipe on a Wix Studio or Wix Editor site with Velo page code. For the Studio Two Code tab, follow the separate HTTP endpoint walkthrough. [Identify your editor](01-platform-map.md#identify-your-editor-before-copying-code) · [Studio Two endpoint walkthrough](https://dev.wix.com/docs/studio-two/code-your-site/build-a-custom-backend/http-endpoints/add-an-http-endpoint-extension-in-studio-two)

## Build a button that calls the backend

**Wix recipe.** Requires a test site with coding enabled. This example reads no collection, stores nothing and calls no external API. The backend validates a display name and returns text.

### 1. Add the page controls

In the editor, add these elements and set their IDs. The `#` belongs in code selectors, not in the editor's ID field.

| Element | Editor ID | Setup |
| --- | --- | --- |
| Text input | `nameInput` | Visible label `Your name`; initial value `Ryan`; maximum length 40 |
| Button | `greetButton` | Label `Greet`; enabled |
| Text | `greetingMessage` | Visible; initial text `Enter your name, then press Greet.` |

Use the code handler below once and remove any old click handler attached to this button. In the message text's **Accessibility** panel, set `aria-live` to `polite` so updates can be announced. Test the result with a screen reader as well as a keyboard. [Wix ARIA settings](https://support.wix.com/en/article/accessibility-adding-aria-attributes-to-custom-web-applications)

### 2. Add the backend file

Create **`backend/greeting.web.js`** in the editor's Backend section. In a Git-connected site the physical file is **`src/backend/greeting.web.js`**.

~~~js
// backend/greeting.web.js
import { Permissions, webMethod } from 'wix-web-module';

export const getGreeting = webMethod(Permissions.Anyone, (name) => {
  if (typeof name !== 'string') {
    return { ok: false, message: 'Enter 1–40 characters.' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 40) {
    return { ok: false, message: 'Enter 1–40 characters.' };
  }
  return { ok: true, message: `Hello, ${trimmed}.` };
});
~~~

`Permissions.Anyone` is intentional for this public greeting. Private records require a narrower method and an ownership check; see the [member recipe](the-missing-manual-to-velo.md). Frontend input limits improve interaction; server validation still handles direct callers. [Official web-module contract](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/about-web-modules).

This example uses JavaScript string length; some emoji count as more than one of the 40 allowed units.

### 3. Add the page code

Paste this into the code panel for the page containing the controls. In a Git-connected project, edit that page's generated file under `src/pages/`; keep its generated filename.

~~~js
// Page code: Greeting page
import { getGreeting } from 'backend/greeting.web';

$w.onReady(() => {
  $w('#greetButton').onClick(async () => {
    $w('#greetButton').disable();
    $w('#greetingMessage').text = 'Checking…';
    try {
      const result = await getGreeting($w('#nameInput').value);
      $w('#greetingMessage').text = result.message;
    } catch (error) {
      $w('#greetingMessage').text = 'Could not get a greeting. Press Greet to retry.';
      console.error('Greeting request failed');
    } finally {
      $w('#greetButton').enable();
    }
  });
});
~~~

The call happens on a click. Loading the page does not send a request or write data. Text is assigned through `.text`, never interpreted as HTML.

### 4. Check the result

| Action | Expected result |
| --- | --- |
| Preview, enter `Ryan`, press Greet | `Checking…`, then `Hello, Ryan.`; button becomes usable again |
| Enter `  Ada  ` | `Hello, Ada.` |
| Clear the input, press Greet | `Enter 1–40 characters.` |
| Call the backend with a non-string or more than 40 characters | Same validation message; no exception or data write |
| Make the backend unavailable in a disposable test copy, then click | Retry message; button re-enables |
| Navigate by keyboard and activate Greet | Same result; message is available without moving focus |

The offline handbook checker exercises the actual backend snippet with controlled inputs. Editor selectors, Wix imports and message announcements still need the target-site check above. If the button does nothing, compare IDs and file paths first; see [troubleshooting](16-troubleshooting.md).

## Put code where it belongs

| Location | Put here | Example |
| --- | --- | --- |
| Page code | Controls, messages, loading and retry | Greeting click handler |
| Public module | Non-sensitive shared formatting/validation | Order total formatter |
| Backend `.js` | Internal protected helpers and provider calls | CRM transport |
| Backend `.web.js` | Explicit frontend-callable operation | `getGreeting`, `getMyRecentOrders` |
| `masterPage.js` | Site-wide UI behavior | Shared navigation |

Frontend/public code is inspectable. Credentials belong in the backend's secret mechanism. See [Wix code placement](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/overview/where-do-i-put-my-code).

## When the site is connected to Git

In a Git-connected Wix Studio or Wix Editor site, editor code is read-only and follows the repository's default branch. Make code changes in the connected repository. **Collection field changes affect the live site before publishing**, and duplicating a page omits its code. [Wix Git integration behavior](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/git-integration-wix-cli-for-sites/changes-to-the-editor-when-your-site-is-integrated)

Record editor IDs/layout and CMS settings alongside the code change. A repository revert does not restore collection data.

Use [site CLI commands](20-cli-quick-reference.md) for Local Editor and previews. A site CLI preview uses live HTTP functions; use the [endpoint matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments) for endpoint work. Publish only from an identified source using the [release steps](15-release-operations.md).

## Add the next capability

For a new API call, check the [Velo-to-SDK mapping](https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/develop-with-the-sdk/velo-to-sdk-api-mapping), then read that operation's environment and permission requirements. The examples retain Velo modules where their behavior is documented; migrating an import also requires checking identity, query options and response shape.

For data, use the [complete recent-orders recipe](the-missing-manual-to-velo.md); for a provider call, use the [transport example and its limits](velo-for-fun-and-profit.md).
