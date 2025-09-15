# Flow B — PR-Audit: Log changes (field-level) + notifications

**Trigger:** SharePoint — When an item is **created or modified** (List: `PrintRequests`)

## Steps
1) **Get changes for an item or a file (properties only)**
- Since: **Trigger Window Start Token** (compares with the version at trigger time)

2) Add **Condition** blocks using **Has Column Changed** outputs for fields:
- Status, AssignedTo, Priority, Method, PrinterSelection, Color, DueDate, EstHours, EstWeight, StaffNotes, Attachments

3) For each changed field, **Create item** in `AuditLog`:
- Title: `Field Change: <FieldName>`
- RequestID: `@{triggerOutputs()?['body/ID']}`
- ReqKey: `@{triggerOutputs()?['body/ReqKey']}`
- Action: `Status Change` if Status changed, else `Updated`
- FieldName: `<FieldName>`
- OldValue: *(optional — keep blank for MVP)*
- NewValue: use the current field value from Trigger body
- Actor: map the person field to **Editor Claims** (auto-resolves)
- ActorRole: Resolve via Staff list (optional) or set `Staff` if in owners
- ClientApp: `SharePoint Form` or `Power Apps` depending on source
- FlowRunId: `@{workflow().run.name}`

> Concurrency: For strictly ordered logs, set trigger concurrency control to 1. Default is acceptable for MVP when using the Trigger Window Start Token.

4) **Status-based email notifications** (optional but recommended):
- Add a Condition: `Has Column Changed: Status` = `true`
  - If Yes → add nested conditions:
    - If `Status` = `Rejected` → Send email (V2) to `StudentEmail` with a rejection message and this link:
      ```html
      <a href="https://{tenant}.sharepoint.com/sites/FabLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a>
      ```
    - If `Status` = `Completed` → Send email (V2) to `StudentEmail` notifying ready for pickup (use the same item link).
  - Keep all email logic inside this branch to avoid duplicate emails on multi-field edits.

4) **Attachments** special case (optional):
- Use **Get attachments** and log each filename with Action=`File Added`.
