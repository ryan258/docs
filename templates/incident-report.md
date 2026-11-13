# Incident report: duplicate saved searches

Copy this hypothetical incident note and replace its facts. Example findings and outcomes are not real test or production evidence.

```text
Status/time: investigating; 2026-10-26 14:20 UTC
Impact: search-test only; repeated save creates two synthetic records
Expected: retry of one action produces one saved search
Evidence: source 7c42e19; action TEST-104; records TEST-a and TEST-b
Reproduce: save phrase → delay response → retry same action
Known: two writes observed; no external provider called
Unknown: whether production has the same handler
Mitigation: pause test writes; preserve request IDs and duplicate records
Cause: unconfirmed; inspect backend action-key handling
Recovery: correct synthetic data only after confirming duplicate ownership
Verification: pending repeated-request check and normal-save check
Next: add durable duplicate handling, then repeat those two cases
```

After recovery, replace the unknown/cause/verification lines with evidence. Separate fixing code from correcting data or compensating provider effects. Keep secrets and personal records out of the note.
