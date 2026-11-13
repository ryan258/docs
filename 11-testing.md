# Testing and quality

Start with the behavior you changed. Prove it with the smallest useful check, then test the real Wix boundary that a local check cannot exercise. A formatting change does not need a checkout test; a permission change needs a denied caller.

## Choose a check by the change

| Change | First check | Then verify in the relevant runtime |
| --- | --- | --- |
| Input parsing or calculation | Pure JavaScript examples at normal and boundary values | One calling form still passes the expected input |
| Member data read | Query filter and returned fields | Member A cannot obtain member B's data; anonymous access is denied |
| Create/update action | Validation and duplicate/retry behavior | One intended record, correct owner, recoverable failure |
| Webhook | Invalid signature, repeated event ID, partial failure | Development delivery reaches the correct installation and side effect |
| Page layout or interaction | Changed route and error state | Keyboard, narrow width, labels, focus, preserved input |
| Release configuration | Source, destination, changed settings | The critical path on the released version |

Run the focused checks affected by the change. Broaden when a failure or shared dependency gives you a reason. App distribution has additional requirements in the [official app checks guide](https://dev.wix.com/docs/build-apps/launch-your-app/app-distribution/app-checks-and-testing-guide).

## Example: test input logic without Wix

This copyable command needs Node.js and its built-in assertion library. It writes no files and makes no requests. The rule is deliberately small: trim a search phrase, reject empty/non-text input, and cap it at 80 characters.

```bash
node --input-type=module <<'JS'
import assert from 'node:assert/strict';

function searchPhrase(value) {
  if (typeof value !== 'string') throw new Error('Enter a search phrase');
  const phrase = value.trim();
  if (!phrase || phrase.length > 80) throw new Error('Use 1–80 characters');
  return phrase;
}

assert.equal(searchPhrase('  accessible forms  '), 'accessible forms');
assert.equal(searchPhrase('x'.repeat(80)).length, 80);
assert.throws(() => searchPhrase('   '), /1–80/);
assert.throws(() => searchPhrase('x'.repeat(81)), /1–80/);
assert.throws(() => searchPhrase(null), /search phrase/);
console.log('PASS: 5 input cases');
JS
```

Expected: `PASS: 5 input cases`. A failed assertion exits nonzero. Move the rule into the project's real shared module and test that module when implementing it; this standalone example demonstrates the test shape. It does not check Wix imports, page events, or permissions.

## Example: prove a member read is private

Use synthetic records on a development site. Create one record owned by `member-a` and one by `member-b`. Call the same backend method the page uses; hiding another member's row in the UI is insufficient.

| Caller/action | Expected result |
| --- | --- |
| Member A requests their records | Only A's records; only fields the UI needs |
| Member B requests their records | Only B's records |
| Anonymous caller calls the method directly | Denied; no private record returned |
| Member A submits B's ID in a forged request | Denied or ignored; B's record never returned |
| Allowed member has no records | Successful empty result and a useful empty message |

For a write, add a repeated request with the same action key. Check stored records and external side effects, as well as the displayed confirmation. A disabled button alone does not prove duplicate safety. See [Security](09-security.md) and [Data and content](08-data-content.md).

## Know what environment the check reaches

Before a runtime test, capture the lane, site/installation ID, source revision, caller, and collection/configuration used. Use obvious fixture names such as `TEST-member-a`, and delete only fixtures you created.

| Runtime | What to verify before drawing a conclusion |
| --- | --- |
| Wix Editor or Wix Studio editor Preview | Wix assigns Preview the Admin role. Test denied callers with synthetic visitor/member accounts in a published development environment. [Wix Preview behavior](https://dev.wix.com/docs/develop-websites-sdk/test-your-site/debug-your-code/about-testing-code-in-preview-mode). |
| Wix Editor or Wix Studio Site CLI preview | Requires a previously published site and uses its live HTTP functions. Verify changed functions through the development path in the [endpoint matrix](the-missing-manual-to-velo.md#http-functions-and-preview-environments). [Wix Site CLI preview](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/developer-environments/ides/git-integration/wix-cli-commands#wix-preview). |
| Studio Two | Use editor Preview for UI and a separate development site for endpoint acceptance. Wix documents that calls from site code in Preview need the latest endpoint code published. Dashboard calls work after saving and exercise the Wix user identity. Test the member path with a synthetic member on the published development site. [Wix Studio Two endpoint checks](https://dev.wix.com/docs/studio-two/code-your-site/build-a-custom-backend/http-endpoints/build-an-http-endpoint-in-studio-two). |

## Save a small evidence record

Illustrative record, not a claim of a completed test:

```text
Change: member order list returns only the caller's records
Environment: development site orders-test; source 7c42e19
Checks: A sees A; B sees B; anonymous denied; forged owner ID rejected
Observed: all four outcomes matched; response excludes privateNote
Evidence: test-run-2026-10-26.txt (redacted)
Still unknown: live-site configuration and published-page keyboard behavior
Next: owner-approved published smoke check
```

Keep the remaining unknown beside the result. A mock, a screenshot, and a live task test establish different things.
