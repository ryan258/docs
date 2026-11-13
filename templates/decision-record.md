# Decision record: reuse Wix member identity

Copy this filled example. It records a hypothetical decision, not an adopted architecture for your project.

```text
Status/date: proposed; 2026-10-26
Scope: Wix site; private saved-search feature
Decision: use the existing signed-in Wix member identity.
Reason: backend can derive the owner without a second login/recovery workflow.
Alternative: separate application accounts.
Why deferred: adds setup and credential recovery without a current personal benefit.
Consequence: every backend read/write must scope records to the current member.
Migration/recovery: no existing data migration; disable saving if isolation fails.
Revisit when: records must be shared across different identity systems.
Evidence/next: link feature brief; prove A/B isolation before accepting.
```

Keep the reason and revisit trigger when the decision becomes accepted. Add a migration plan only when real data or an existing contract changes.
