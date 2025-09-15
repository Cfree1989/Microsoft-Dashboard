# Flow B — PR-Audit: Log changes (field-level)

**Trigger:** SharePoint — When an item is **created or modified** (List: `PrintRequests`)

## Steps
1) **Get changes for an item or a file (properties only)**
- Since: **Trigger Window Start Token**

2) Add **Condition** blocks using **Has Column Changed** outputs for fields:
- Status, AssignedTo, Priority, Infill, LayerHeight, Supports, Rafts, DueDate, EstHours, StaffNotes, Attachments

3) For each changed field, **Create item** in `AuditLog`:
- Title: `Field Change: <FieldName>`
- RequestID: `@{triggerOutputs()?['body/ID']}`
- ReqKey: `@{triggerOutputs()?['body/ReqKey']}`
- Action: `Status Change` if Status changed, else `Updated`
- FieldName: `<FieldName>`
- OldValue: *(optional — keep blank for MVP)*
- NewValue: use the current field value from Trigger body
- Actor: `@{triggerOutputs()?['body/Editor/Email']}`
- ActorRole: Resolve via Staff list (optional) or set `Staff` if in owners
- ClientApp: `SharePoint Form` or `Power Apps` depending on source
- FlowRunId: `@{workflow().run.name}`

> Concurrency: For strictly ordered logs, set trigger concurrency control to 1. Default is acceptable for MVP when using the Trigger Window Start Token.

4) **Attachments** special case (optional):
- Use **Get attachments** and log each filename with Action=`File Added`.
