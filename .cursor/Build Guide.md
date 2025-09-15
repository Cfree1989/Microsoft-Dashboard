# FabLab 3D Print Request System — **Beginner Build Guide**

This hands-on guide will help you build a complete MVP system for managing 3D print requests using **SharePoint**, **Power Automate**, and **Power Apps**. It is written for first-time users — no prior experience required.

---

## What you will build

- A SharePoint site with three lists: **PrintRequests**, **AuditLog**, and **Staff**.
- A customized **SharePoint form** (Power Apps) for students to submit requests with attachments.
- A **Power Apps canvas app** for staff to manage the queue and change statuses.
- Three **Power Automate** flows to: assign request keys, log changes, and log staff actions.

> **Scope & constraints (MVP):** Internal-only (LSU accounts), file management via SharePoint **attachments**, staff attribution on every action, and a complete **AuditLog**.

---

## Prerequisites

- A Microsoft 365 account with access to SharePoint, Power Automate, and Power Apps.
- You are a **Site Owner** of the SharePoint site you will create.
- Basic familiarity with navigating Microsoft 365 web apps (the rest is explained step-by-step).

---

## Part 1 — SharePoint Setup

### 1. Create a SharePoint Team Site
1. Open SharePoint in a browser and click **Create site**.
2. Choose **Team site**.
3. Name it: `FABLAB – 3D Printing`.
4. Privacy: **Private** (recommended for MVP).
5. Add your FabLab staff as **Owners** (you can adjust later).

### 2. Create the list: `PrintRequests`
1. In the site, click **New → List**.
2. Choose **Blank list**, name it `PrintRequests`.
3. Open **Settings → List settings → Advanced settings**.
   - **Attachments**: *Enabled* (students will upload STL/3MF files here).
   - **Item-level permissions** (scroll down):
     - Read access: **Read items that were created by the user**
     - Create and Edit access: **Create items and edit items that were created by the user**
4. Open **Settings → Versioning settings** → Enable: *Create a version each time you edit an item*.

#### 2a. Add columns to `PrintRequests`
Use the table below. For each row: **Add column** → pick **Type** → set the **Name** → (if Choice) enter the list of choices → **Save**.

| Column (Display Name) | Type | Choices / Notes |
|---|---|---|
| Title | Single line of text | Request title (already exists) |
| ReqKey | Single line of text | Will be filled by a flow (e.g., `REQ-00042`) |
| Student | Person | Required |
| StudentEmail | Single line of text | Auto-filled by the form/flow |
| Course | Single line of text | Optional |
| Department | Choice | Architecture; Engineering; Art & Design; Other |
| ProjectType | Choice | Class Project; Research; Personal; Other |
| Quantity | Number | Default 1 |
| Material | Choice | PLA; PETG; ABS; Resin; Other |
| Color | Choice | Any; Black; White; Gray; Red; Green; Blue; Yellow; Other |
| Infill | Number | 0–100 |
| LayerHeight | Choice | 0.08; 0.12; 0.16; 0.2; 0.28 |
| Supports | Yes/No | Default No |
| Rafts | Yes/No | Default No |
| DueDate | Date | Optional |
| Dimensions | Single line of text | Example: `120 x 80 x 40` |
| Notes | Multiple lines of text | Plain text |
| Status | Choice | Submitted; Intake Review; Needs Info; Approved; Rejected; Queued; Printing; Paused; Failed; Completed; Ready for Pickup; Picked Up; Canceled (Default: Submitted) |
| Priority | Choice | Low; Normal; High; Rush |
| AssignedTo | Person | Staff owner |
| EstHours | Number | Staff-only |
| StaffNotes | Multiple lines of text | Staff-only |
| LastAction | Choice | Created; Updated; Status Change; File Added; Needs Info; Approved; Rejected; Queued; Printing; Paused; Failed; Completed; Ready for Pickup; Picked Up; Canceled; Comment Added; Email Sent |
| LastActionBy | Person | Who did it |
| LastActionAt | Date and Time | Timestamp |
| StudentLSUID | Single line of text | Optional |

#### 2b. Create helpful **Views**
1. **My Requests** (for students): Filter **Created By is [Me]**. Show `Title, ReqKey, Status, Modified`.
2. **Staff – Queue**: Filter **Status** in `Submitted, Intake Review, Approved, Queued, Printing`. Sort by **Modified (descending)**.

#### 2c. Add **Status** color “chips” (optional but nice)
1. Open **All Items** view → hover **Status** column → **Column settings → Format this column → Advanced mode**.
2. Paste the JSON below and click **Save**.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/column-formatting.schema.json",
  "elmType": "span",
  "attributes": { "class": "ms-fontColor-white" },
  "style": {
    "padding": "4px 8px",
    "border-radius": "16px",
    "font-weight": 600,
    "background-color": {
      "operator": "?",
      "operands": [
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "submitted" ] },
        "#0078D4",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "intake review" ] },
        "#605E5C",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "needs info" ] },
        "#FFB900",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "approved" ] },
        "#107C10",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "rejected" ] },
        "#D13438",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "queued" ] },
        "#8E8CD8",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "printing" ] },
        "#6B69D6",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "paused" ] },
        "#744DA9",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "failed" ] },
        "#A4262C",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "completed" ] },
        "#004E8C",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "ready for pickup" ] },
        "#009E49",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "picked up" ] },
        "#107C10",
        { "operator": "==", "operands": [ { "operator": "toLowerCase", "operands": [ "@currentField" ] }, "canceled" ] },
        "#C50F1F",
        "#333333"
      ]
    }
  },
  "txtContent": "@currentField"
}
```

### 3. Create the list: `AuditLog`
1. **New → List** → name: `AuditLog`.
2. **Settings → Versioning settings** → enable versioning.
3. Add these columns (types in parentheses):
   - Title (Single line)
   - Request (Lookup → list: PrintRequests → field: ID)
   - RequestID (Number)
   - ReqKey (Single line)
   - Action (Choice) → Created; Updated; Status Change; File Added; Comment Added; Assigned; Email Sent; System
   - FieldName (Single line)
   - OldValue (Multiple lines)
   - NewValue (Multiple lines)
   - Actor (Person)
   - ActorRole (Choice) → Student; Staff; System
   - ActionAt (Date and Time)
   - Notes (Multiple lines)
   - ClientApp (Choice) → SharePoint Form; Power Apps; Power Automate
   - FlowRunId (Single line)

### 4. Create the list: `Staff`
1. **New → List** → name: `Staff`.
2. Add columns:
   - Member (Person) — **Required**
   - Role (Choice) → Manager; Technician; Student Worker
   - Active (Yes/No) → Default: Yes

---

## Part 2 — Power Automate (Flows)

You will make three flows. Open **Power Automate** (flow.microsoft.com) and ensure you are in the same environment as your SharePoint site.

### Flow A — PR-Create: Set ReqKey + Acknowledge (Automated)
**Purpose:** When a new request is created, assign a **ReqKey**, log a **Created** event, and email the student.

1. **Create → Automated cloud flow**
   - Name: `PR-Create: Set ReqKey + Acknowledge`
   - Trigger: **SharePoint – When an item is created**
   - Site address: your FabLab site → List: `PrintRequests`
2. **New step → Compose** (name: Compose ReqKey)
   - Inputs:
```
@{concat('REQ-', right(concat('00000', string(triggerOutputs()?['body/ID'])), 5))}
```
3. **Update item** (SharePoint)
   - Site/List: same as trigger
   - ID: `ID` (from trigger)
   - **ReqKey**: use **Outputs** of *Compose ReqKey*
   - **StudentEmail**:
```
@{toLower(triggerOutputs()?['body/Author/Email'])}
```
4. **Create item** in `AuditLog`
   - Title: `Created`
   - RequestID: `ID` (from trigger)
   - ReqKey: Outputs of *Compose ReqKey*
   - Action: `Created`
   - Actor: map to **Author Claims** (person field will resolve)
   - ActorRole: `Student`
   - ClientApp: `SharePoint Form`
5. **Send an email (V2)** to the student
   - To: **StudentEmail** (from the item or step 3)
   - Subject: `We received your 3D Print request – @{outputs('Compose ReqKey')}`
   - Body (example):
```html
<p>We received your 3D Print request.</p>
<p><strong>Request:</strong> @{triggerOutputs()?['body/Title']}</p>
<p><a href="https://{tenant}.sharepoint.com/sites/FabLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request (@{outputs('Compose ReqKey')})</a></p>
```

> **Tip:** If the **Actor** person field fails to resolve, use **Author Claims** from the trigger.

### Flow B — PR-Audit: Log changes (Automated)
**Purpose:** Whenever a request is modified, record which fields changed in `AuditLog`.

1. **Create → Automated cloud flow**
   - Name: `PR-Audit: Log changes`
   - Trigger: **SharePoint – When an item is created or modified**
   - Site/List: `PrintRequests`
2. **Get changes for an item or a file (properties only)**
   - Site/List: same
   - ID: `ID` (from trigger)
   - Since: **Trigger Window Start Token** (dynamic content)
3. Add **Condition** steps using the action’s outputs **Has Column Changed: {Field}** for fields you care about (repeat per field):
   - Status, AssignedTo, Priority, Infill, LayerHeight, Supports, Rafts, DueDate, EstHours, StaffNotes, Attachments
4. For each field that changed → **Create item** in `AuditLog`:
   - Title: `Field Change: <FieldName>`
   - RequestID: `ID` (from trigger)
   - ReqKey: `ReqKey` (from the current item)
   - Action: `Status Change` (if Status changed) else `Updated`
   - FieldName: the literal field name (e.g., `Status`)
   - OldValue: *(optional for MVP)*
   - NewValue: the current field value from the trigger body
   - Actor: **Editor Claims** (from trigger)
   - ActorRole: `Staff` if the editor is a staff account; otherwise `Student`
   - ClientApp: `SharePoint Form` or `Power Apps`

> **Note:** Power Automate doesn’t directly provide the *previous* value in a simple way. For MVP, logging the **new** value is sufficient; if needed you can look up the previous version in SharePoint version history.

### Flow C — PR-Action: Log action (Instant, called from Power Apps)
**Purpose:** When staff press a button in the staff app (e.g., Approve), log that action with the true actor identity.

1. **Create → Instant cloud flow**
   - Name: `PR-Action: Log action`
   - Trigger: **Power Apps**
2. **Add input parameters** (from Power Apps):
   - `RequestID` (Text)
   - `Action` (Text) — e.g., `Status Change`
   - `FieldName` (Text) — e.g., `Status`
   - `OldValue` (Text)
   - `NewValue` (Text)
   - `ActorEmail` (Text)
   - `ClientApp` (Text) — `Power Apps`
   - `Notes` (Text)
3. **Get item** (SharePoint)
   - Site/List: `PrintRequests`
   - ID: `RequestID` (from trigger)
4. **Create item** (SharePoint → `AuditLog`)
   - Title: `Action: @{triggerBody()['Action']}`
   - RequestID: `RequestID`
   - ReqKey: from **Get item**
   - Action: `Action` (trigger input)
   - FieldName: `FieldName`
   - OldValue: `OldValue`
   - NewValue: `NewValue`
   - Actor: `ActorEmail` (SharePoint person field resolves email)
   - ActorRole: `Staff`
   - ClientApp: `ClientApp`
   - Notes: `Notes`
5. (Optional) **Respond to Power Apps** with `true` to confirm success.

---

## Part 3 — Power Apps

### A) Student Submission Form (Customize SharePoint Form)
1. Go to the `PrintRequests` list → **Integrate → Power Apps → Customize forms**.
2. Ensure these **data cards** are present: Title, Student, StudentEmail, Course, Department, ProjectType, Quantity, Material, Color, Infill, LayerHeight, Supports, Rafts, Dimensions, DueDate, Notes, **Attachments**.
3. **Hide staff-only** cards (select each card → set **Visible** = `false`): Status, AssignedTo, StaffNotes, EstHours, LastAction, LastActionBy, LastActionAt.
4. **Defaults** (select the card → set the property shown):
   - Student → **DefaultSelectedItems**:
```powerfx
If(
    SharePointForm1.Mode = FormMode.New,
    [
        {
            DisplayName: User().FullName,
            Claims: "i:0#.f|membership|" & Lower(User().Email),
            Email: Lower(User().Email)
        }
    ],
    Parent.Default
)
```
   - StudentEmail → **Default**:
```powerfx
If(SharePointForm1.Mode = FormMode.New, Lower(User().Email), Parent.Default)
```
   - Status → **Default**:
```powerfx
If(SharePointForm1.Mode = FormMode.New, "Submitted", Parent.Default)
```
5. **Form OnSuccess** (or SharePointIntegration.OnSave):
```powerfx
Notify("Request submitted. You’ll receive an email confirmation shortly.", NotificationType.Success)
```
6. **Publish** the form and close the editor.

### B) Staff Console (Canvas App — Tablet)
1. Open **Power Apps** → **Create → Canvas app** (Tablet).
2. **Data** → Add data: SharePoint → connect to your site → add `PrintRequests`, `AuditLog`, `Staff`.
3. Add your **instant flow**: `PR-Action: Log action` (from the Data / Power Automate panel).
4. **App.OnStart** (App object → Advanced → OnStart):
```powerfx
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);

ClearCollect(colStaff, Filter(Staff, Active = true));
Set(varIsStaff, CountRows(Filter(colStaff, Lower(Member.Email) = varMeEmail)) > 0);

Set(varStatuses, ["Submitted","Intake Review","Needs Info","Approved","Rejected","Queued","Printing","Paused","Failed","Completed","Ready for Pickup","Picked Up","Canceled"]);
Set(varQuickQueue, ["Submitted","Intake Review","Approved","Queued","Printing"]);
```
5. **Main screen**: Insert a **Gallery** (Vertical). Set **Items**:
```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        Status = "Submitted" || Status = "Intake Review" || Status = "Approved" || Status = "Queued" || Status = "Printing"
    ),
    "Modified",
    Descending
)
```
6. Add a **Detail/Edit screen** bound to `PrintRequests`. Include Staff fields (AssignedTo, StaffNotes, EstHours, Priority, Status).
7. On that screen, add buttons for actions (Approve, Queue, Printing, Needs Info, Ready for Pickup, Picked Up, etc.). First, prepare a reusable **person** value (Screen.OnVisible):
```powerfx
Set(varActor,
{
  '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
  Claims: "i:0#.f|membership|" & varMeEmail,
  DisplayName: varMeName,
  Email: varMeEmail
});
```
8. Example **Approve** button (OnSelect):
```powerfx
Patch(PrintRequests, ThisItem, {
    Status: "Approved",
    LastAction: "Approved",
    LastActionBy: varActor,
    LastActionAt: Now(),
    AssignedTo: varActor
});

'PR-Action: Log action'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Approved",
    varMeEmail,
    "Power Apps",
    "Approved in Staff Console"
);

Notify("Marked Approved.", NotificationType.Success);
```
9. Duplicate the button and change the **Status** value for other actions: `Queued`, `Printing`, `Needs Info`, `Ready for Pickup`, `Picked Up`, etc.

> **Troubleshooting:** If a Person field fails to patch, verify the **internal name** or rebuild `varActor` using your email.

---

## Part 4 — Testing (End-to-End)

1. As a **student** account: Submit a new request with an attachment.
   - Expect: **ReqKey** is set (e.g., `REQ-00001`), a **Created** entry in `AuditLog`, and a confirmation **email**.
2. As **staff**: Open the **Staff Console**, select the new item, click **Approve**.
   - Expect: `Status` changes to Approved, `LastAction/By/At` populated, and an **AuditLog** entry from Flow C.
3. Edit a field like **Infill** in the SharePoint form.
   - Expect: **PR-Audit** flow logs a `Field Change: Infill` entry.

---

## Optional Enhancements

- **Notifications**: Create separate flows for `Needs Info` and `Ready for Pickup` to email the student and add `AuditLog` entries with `Action = Email Sent`.
- **Views**: Add `Printing`, `Completed This Week`, or `Ready for Pickup` views for staff.
- **Document library** later if you outgrow attachments.

---

## Common Issues & Fixes

- **I pasted Power Fx into SharePoint and saw a JSON message.** Use the Power Apps **formula bar** for Power Fx; use **JSON** only in SharePoint column formatting.
- **Person field won’t set in Flow.** Map the person field to **Author Claims** / **Editor Claims** or pass an **email** (the connector usually resolves it).
- **Delegation warning in Power Apps.** The provided OR filter for `Status` is acceptable for MVP. If your list grows very large, ask for a delegation-optimized filter.
- **Users can see other items.** Revisit **Item-level permissions** on `PrintRequests` (Advanced settings). Staff should be in **Owners**.

---

## Time Estimate (Beginner)

- SharePoint lists & columns: **2–3 hours**
- Power Automate flows: **4–6 hours**
- Power Apps (form + staff app): **8–12 hours**
- Testing & fixes: **3–5 hours**

---

## You’re Done!

You now have a working MVP for FabLab 3D printing requests with audit trails and staff attribution, built entirely with Microsoft 365 tools. If you’d like, I can also provide an **importable Solution** (flows + app) tailored to your tenant/site URL to save more time.
