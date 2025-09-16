# Fabrication Lab 3D Print Request System — **Beginner Build Guide**

This hands-on guide will help you build a complete MVP system for managing 3D print requests using **SharePoint**, **Power Automate**, and **Power Apps**. It is written for first-time users — no prior experience required.

---

## What you will build

- A SharePoint site with three lists: **PrintRequests** (17 fields total), **AuditLog**, and **Staff**.
- A **simplified student form** (9 fields) with smart printer selection based on build plate dimensions.
- A **Power Apps staff console** focused on operational management (8 staff-only fields).
- Three **Power Automate** flows to: assign request keys + send confirmation emails, log changes + send automated rejection/completion emails, and log staff actions.
- **Clean separation**: Students focus on project definition, staff control technical execution.

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
3. Name it: `Digital Fabrication Lab`.
4. Privacy: **Private** (recommended for MVP).
5. Add your Fabrication Lab staff as **Owners** (you can adjust later).

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

**Student-Facing Fields** (what students see and fill out):
| Column (Display Name) | Type | Choices / Notes |
|---|---|---|
| Title | Single line of text | Request title (already exists) |
| ReqKey | Single line of text | Will be filled by a flow (e.g., `REQ-00042`) |
| Student | Person | Required |
| StudentEmail | Single line of text | Auto-filled by the form/flow |
| Course | Single line of text | Optional |
| Department | Choice | Architecture; Engineering; Art & Design; Other |
| ProjectType | Choice | Class Project; Research; Personal; Other |
| Color | Choice | Any; Black; White; Gray; Red; Green; Blue; Yellow; Other |
| Method | Choice | Filament; Resin |
| PrinterSelection | Choice | Prusa MK4S (9.8×8.3×8.7in); Prusa XL (14.2×14.2×14.2in); Raised3D Pro 2 Plus (12.0×12.0×23in); Form 3 (5.7×5.7×7.3in) |
| DueDate | Date | Optional |
| Notes | Multiple lines of text | Plain text |

**Staff-Only Fields** (hidden from students, managed by staff):
| Column (Display Name) | Type | Choices / Notes |
|---|---|---|
| Status | Choice | Uploaded; Pending; Ready to Print; Printing; Completed; Paid & Picked Up; Rejected; Archived (Default: Uploaded) |
| Priority | Choice | Low; Normal; High; Rush |
| AssignedTo | Person | Optional manual assignment |
| EstHours | Number | Staff estimation |
| EstWeight | Number | Staff estimation |
| StaffNotes | Multiple lines of text | Staff-only |
| LastAction | Choice | Created; Updated; Status Change; File Added; Approved; Rejected; Printing; Completed; Picked Up; Comment Added; Email Sent |
| LastActionBy | Person | Who did it |
| LastActionAt | Date and Time | Timestamp |

#### 2b. Create helpful **Views**
Create two modern views to simplify day‑to‑day use. These are lenses on the same data; permissions still control which rows users can see.

My Requests (students)
1. Open the `PrintRequests` list → View menu → Create new view → Name: `My Requests` → Show as: List → Create.
2. View menu → Edit current view → Filter: check "Show items only when the following is true" → set `Created By` is equal to `[Me]` → Sort by `Modified` Descending → OK.
3. View menu → Add or remove fields → keep only `Title, ReqKey, Status, Modified` → Apply. Drag to order.
4. Optional: Make it a public view. Copy the URL to use in emails:
   - URL: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`

Staff – Queue (staff)
1. View menu → Create new view → Name: `Staff – Queue` → Show as: List → Create.
2. Open the filter pane (funnel icon) → select `Status` values `Uploaded, Pending, Ready to Print, Printing` (optionally `Completed`) → Apply.
3. View menu → Add or remove fields → select `Title, ReqKey, Status, Priority, Assigned To, Modified, Created by` → Apply. Drag to order.
4. Click the `Modified` header → Newest. View menu → Save view.
5. Optional: Make it public and (for staff) Set current view as default. Public URL for reference:
   - URL: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/Staff%20%20Queue.aspx`

Notes
- "Add or remove fields" controls which columns a view shows; it does not change permissions.
- Item‑level permissions still ensure students see only their own items.

#### 2c. Add **Status** color “chips” (optional but nice)
1. Open **All Items** view → hover **Status** column → **Column settings → Format this column → Advanced mode**.
2. Paste the JSON below and click **Save**.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "span",
  "style": {
    "padding": "4px 8px",
    "border-radius": "16px",
    "font-weight": 600,
    "color": "#ffffff",
    "background-color": {
      "operator": "?",
      "operands": [
        { "operator": "==", "operands": [ "@currentField", "Uploaded" ] }, "#0078D4",
        { "operator": "==", "operands": [ "@currentField", "Pending" ] }, "#FFB900",
        { "operator": "==", "operands": [ "@currentField", "Ready to Print" ] }, "#107C10",
        { "operator": "==", "operands": [ "@currentField", "Printing" ] }, "#6B69D6",
        { "operator": "==", "operands": [ "@currentField", "Completed" ] }, "#004E8C",
        { "operator": "==", "operands": [ "@currentField", "Paid & Picked Up" ] }, "#009E49",
        { "operator": "==", "operands": [ "@currentField", "Rejected" ] }, "#D13438",
        { "operator": "==", "operands": [ "@currentField", "Archived" ] }, "#605E5C",
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

### What type of flows are these? Where do I create them?
- All flows here are **cloud flows** (not desktop flows).
- Navigation: Power Automate → left nav **Create** → choose the flow type:
  - **Automated cloud flow** for Flow A and Flow B (they run automatically on SharePoint triggers)
  - **Instant cloud flow** for Flow C (it is called from Power Apps)

### Before you start (one-time setup)
- Make sure you have these connections (Power Automate will prompt if missing):
  - SharePoint (uses your Microsoft 365 account)  
  - Office 365 Outlook (for Send an email (V2))
- Use the correct site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- Lists used: `PrintRequests`, `AuditLog`
- Turn each flow **On** after saving, and add at least one test item in `PrintRequests` to test triggers.
- Recommended: Use the lab shared mailbox for all emails: `coad-Fabrication Lab@lsu.edu`.
  - Preferred action: "Send an email from a shared mailbox (V2)"
  - Shared mailbox: `coad-Fabrication Lab@lsu.edu`
  - If only "Send an email (V2)" is available, set Advanced option "From (Send as)" = `coad-Fabrication Lab@lsu.edu` (requires Send As permission).

### Flow A — PR-Create: Set ReqKey + Acknowledge (Automated)
**Purpose:** When a new request is created, assign a **ReqKey**, log a **Created** event, and email the student.

#### Step-by-Step Setup:

1. **Create → Automated cloud flow**
   - Name: `PR-Create: Set ReqKey + Acknowledge`
   - Trigger: **SharePoint – When an item is created**
   - Site address: your Fabrication Lab site → List: `PrintRequests`

2. **New step → Compose** (rename to: "Compose ReqKey")
   - **Inputs**:
```
@{concat('REQ-', right(concat('00000', string(triggerOutputs()?['body/ID'])), 5))}
```

3. **New step → Compose** (rename to: "Generate Standardized Filename")
   - **Inputs**:
```
@{concat(
  replace(replace(replace(replace(replace(triggerOutputs()?['body/Student/DisplayName'], ' ', ''), '-', ''), '''', ''), '.', ''), ',', ''),
  '_',
  triggerOutputs()?['body/Method'],
  '_', 
  triggerOutputs()?['body/Color'],
  '_',
  right(outputs('Compose ReqKey'), 5),
  '.',
  last(split(triggerOutputs()?['body/Attachments'][0]['Name'], '.'))
)}
```

4. **New step → Update item** (SharePoint)
   - **Site Address**: same as trigger
   - **List Name**: PrintRequests
   - **Id**: `ID` (from trigger)
   - **ReqKey**: `Outputs` (from Compose ReqKey step)
   - **Title**: `Outputs` (from Generate Standardized Filename step, without extension) ← standardized display name
   - **StudentEmail**:
```
@{toLower(triggerOutputs()?['body/Author/Email'])}
```
   - **Course**: `Course` (from trigger) ← OR use "Limit columns by view" to avoid mapping required fields

5. **New step → Create item** (SharePoint → AuditLog)
   - **Site Address**: same
   - **List Name**: AuditLog
   - **Title**: `Created`
   - **RequestID**: `ID` (from trigger)
   - **ReqKey**: `Outputs` (from Compose ReqKey)
   - **Action Value**: `Created`
   - **FieldName**: (leave blank)
   - **OldValue**: (leave blank)
   - **NewValue**: (leave blank)
   - **Actor Claims**: `Author Claims` (from trigger)
   - **ActorRole Value**: `Student`
   - **ClientApp Value**: `SharePoint Form`
   - **ActionAt** (optional):
```
@{utcNow()}
```
   - **FlowRunId** (optional):
```
@{workflow()['run']['name']}
```
   - **Notes**: (leave blank)

6. **New step → Send an email from a shared mailbox (V2)**
   - **Shared Mailbox**: `coad-Fabrication Lab@lsu.edu`
   - **To**: `StudentEmail` (from Update item step)
   - **Subject**:
```
We received your 3D Print request – @{outputs('Compose ReqKey')}
```
   - **Body**:
```html
<p>We received your 3D Print request.</p>
<p><strong>Request:</strong> @{outputs('Generate Standardized Filename')}</p>
<p><strong>Request ID:</strong> @{outputs('Compose ReqKey')}</p>
<p><strong>Method:</strong> @{triggerOutputs()?['body/Method']}</p>
<p><strong>Printer:</strong> @{triggerOutputs()?['body/PrinterSelection']}</p>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p>Our team will review your request and contact you with any questions. You'll receive updates as your request progresses through our queue.</p>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

> **Tip:** If the **Actor** person field fails to resolve, use **Author Claims** from the trigger.

> **How to get or verify the My Requests link:** In SharePoint, open `PrintRequests`, switch to the "My Requests" view, then copy the full browser URL. For LSU Fabrication Lab, use: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`.

#### URL glossary (replace placeholders)
- **Site root**: For LSU Fabrication Lab it is `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`.
- **Per‑item link (used in emails)**: `/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}` points to the SharePoint Display Form for the specific item created or edited. Keep the `@{...}` expression exactly; Flow fills in the item ID at runtime.
- **My Requests view (students)**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx` — public link to the student‑filtered view. Use in the confirmation email.
- **Staff – Queue view (staff)**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/Staff%20%20Queue.aspx` — staff dashboard view link (optional to share with staff).

### Flow B — PR-Audit: Log changes + Email notifications (Automated)
**Purpose:** Whenever a request is modified, record which fields changed in `AuditLog` and send automated emails for key status changes.

#### Step-by-Step Setup:

1. **Create → Automated cloud flow**
   - Name: `PR-Audit: Log changes + Email notifications`
   - Trigger: **SharePoint – When an item is created or modified**
   - **Site Address**: your Fabrication Lab site
   - **List Name**: PrintRequests

2. **New step → Get changes for an item or a file (properties only)**
   - **Site Address**: same as trigger
   - **List Name**: PrintRequests
   - **Id**: `ID` (from trigger)
   - **Since**: `Trigger Window Start Token` (from dynamic content)
   - This compares current values to those at flow start time.

3. **New step → Condition** (rename to: "Check if Status Changed")
   - **Choose a value**: `Has Column Changed: Status` (from Get changes output)
   - **Condition**: is equal to
   - **Choose a value**: `true`

4. **Yes branch → Create item** (SharePoint → AuditLog) for Status changes:
   - **Site Address**: same
   - **List Name**: AuditLog
   - **Title**: `Status Change`
   - **RequestID**: `ID` (from trigger)
   - **ReqKey**: `ReqKey` (from trigger body)
   - **Action Value**: `Status Change`
   - **FieldName**: `Status`
   - **OldValue**: (optional - leave blank for MVP)
   - **NewValue**: `Status` (from trigger body)
   - **Actor Claims**: `Editor Claims` (from trigger)
   - **ActorRole Value**: `Staff` (or conditionally check if editor is staff)
   - **ClientApp Value**: `SharePoint Form`
   - **ActionAt**:
```
@{utcNow()}
```
   - **FlowRunId**:
```
@{workflow()['run']['name']}
```

5. **Add parallel Condition branches** for other fields (repeat pattern above):
   - **AssignedTo**: `Has Column Changed: AssignedTo` = true
   - **Priority**: `Has Column Changed: Priority` = true  
   - **Method**: `Has Column Changed: Method` = true
   - **PrinterSelection**: `Has Column Changed: PrinterSelection` = true
   - **EstHours**: `Has Column Changed: EstHours` = true
   - **WeightEstimate**: `Has Column Changed: WeightEstimate` = true
   - **StaffNotes**: `Has Column Changed: StaffNotes` = true
   - Each creates an AuditLog entry with appropriate FieldName and NewValue from trigger body.

6. **Status-Based Email Logic** (inside the "Check if Status Changed" Yes branch):

   **Add nested Condition** ("Check Status = Rejected"):
   - **Choose a value**: `Status` (from trigger body)
   - **Condition**: is equal to
   - **Choose a value**: `Rejected`
   
   **Yes branch → Send an email from a shared mailbox (V2)**:
   - **Shared Mailbox**: `coad-Fabrication Lab@lsu.edu`
   - **To**: `StudentEmail` (from trigger body)
   - **Subject**:
```
Your 3D Print request has been rejected – @{triggerOutputs()?['body/ReqKey']}
```
   - **Body**:
```html
<p>Unfortunately, your 3D Print request has been rejected by our staff.</p>
<p><strong>Request:</strong> @{triggerOutputs()?['body/Title']} (@{triggerOutputs()?['body/ReqKey']})</p>
<p><strong>Reason:</strong> Please check the staff notes in your request for specific details.</p>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p>You may submit a new corrected request at any time through the Fabrication Lab website.</p>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

   **Add parallel nested Condition** ("Check Status = Completed"):
   - **Choose a value**: `Status` (from trigger body)
   - **Condition**: is equal to
   - **Choose a value**: `Completed`
   
   **Yes branch → Send an email from a shared mailbox (V2)**:
   - **Shared Mailbox**: `coad-Fabrication Lab@lsu.edu`
   - **To**: `StudentEmail` (from trigger body)
   - **Subject**:
```
Your 3D print is ready for pickup – @{triggerOutputs()?['body/ReqKey']}
```
   - **Body**:
```html
<p>Great news! Your 3D print is completed and ready for pickup.</p>
<p><strong>Request:</strong> @{triggerOutputs()?['body/Title']} (@{triggerOutputs()?['body/ReqKey']})</p>
<p><strong>Method:</strong> @{triggerOutputs()?['body/Method']}</p>
<p><strong>Printer Used:</strong> @{triggerOutputs()?['body/PrinterSelection']}</p>
<br>
<p><strong>Next Steps:</strong></p>
<ul>
  <li>Visit the Digital Fabrication Lab to pay and collect your print</li>
  <li>Payment will be calculated based on actual material used</li>
  <li>Bring your student ID for verification</li>
  <li>Lab hours: [Add your lab hours here]</li>
</ul>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

7. **Email Audit Logging** (add after each email step):
   
   For **Rejection Email → Create item** (AuditLog):
   - **Title**: `Email Sent: Rejection`
   - **RequestID**: `ID` (from trigger)
   - **ReqKey**: `ReqKey` (from trigger body)
   - **Action Value**: `Email Sent`
   - **FieldName**: `StudentEmail`
   - **NewValue**: `StudentEmail` (from trigger body)
   - **Actor Claims**: (leave blank for system)
   - **ActorRole Value**: `System`
   - **ClientApp Value**: `Power Automate`
   - **ActionAt**: `@{utcNow()}`
   - **FlowRunId**: `@{workflow()['run']['name']}`
   - **Notes**: `Rejection notification sent to student`

   For **Completion Email → Create item** (AuditLog):
   - **Title**: `Email Sent: Completion`
   - **RequestID**: `ID` (from trigger)
   - **ReqKey**: `ReqKey` (from trigger body)
   - **Action Value**: `Email Sent`
   - **FieldName**: `StudentEmail`
   - **NewValue**: `StudentEmail` (from trigger body)
   - **Actor Claims**: (leave blank for system)
   - **ActorRole Value**: `System`
   - **ClientApp Value**: `Power Automate`
   - **ActionAt**: `@{utcNow()}`
   - **FlowRunId**: `@{workflow()['run']['name']}`
   - **Notes**: `Completion notification sent to student`

> **Note:** Power Automate doesn't directly provide the *previous* value in a simple way. For MVP, logging the **new** value is sufficient; if needed you can look up the previous version in SharePoint version history.

### Flow C — PR-Action: Log action (Instant, called from Power Apps)
**Purpose:** When staff press a button in the staff app (e.g., Approve), log that action with the true actor identity.

#### Step-by-Step Setup:

1. **Create → Instant cloud flow**
   - Name: `PR-Action: Log action`
   - Trigger: **Power Apps**
   - Skip the "Choose how to trigger this flow" step (Power Apps will be added automatically)

2. **Add input parameters** from Power Apps trigger:
   Click **Add an input** for each:
   - **RequestID** (Text) → "The ID of the request being modified"
   - **Action** (Text) → "The action being performed (e.g., Status Change)"
   - **FieldName** (Text) → "The field being changed (e.g., Status)"
   - **OldValue** (Text) → "Previous value of the field"
   - **NewValue** (Text) → "New value of the field"
   - **ActorEmail** (Text) → "Email of the staff member performing the action"
   - **ClientApp** (Text) → "Source application (Power Apps)"
   - **Notes** (Text) → "Additional context or notes"

3. **New step → Get item** (SharePoint)
   - **Site Address**: your Fabrication Lab site
   - **List Name**: PrintRequests
   - **Id**: `RequestID` (from Power Apps trigger)

4. **New step → Create item** (SharePoint → AuditLog)
   - **Site Address**: same
   - **List Name**: AuditLog
   - **Title**: 
```
Action: @{triggerBody()['text']}
```
   - **RequestID**: `RequestID` (from Power Apps)
   - **ReqKey**: `ReqKey` (from Get item step)
   - **Action Value**: `Action` (from Power Apps)
   - **FieldName**: `FieldName` (from Power Apps)
   - **OldValue**: `OldValue` (from Power Apps)
   - **NewValue**: `NewValue` (from Power Apps)
   - **Actor Claims**: `ActorEmail` (from Power Apps - SharePoint resolves to person)
   - **ActorRole Value**: `Staff`
   - **ClientApp Value**: `ClientApp` (from Power Apps)
   - **ActionAt**:
```
@{utcNow()}
```
   - **FlowRunId**:
```
@{workflow()['run']['name']}
```
   - **Notes**: `Notes` (from Power Apps)

5. **New step → Respond to a PowerApp or flow** (optional but recommended)
   - **Text**: `true`
   - This confirms success back to Power Apps

#### Power Apps Integration Notes:
- **Call the flow within `IfError()`** for better error handling:
```powerfx
IfError(
    'PR-Action: Log action'.Run(
        Text(ThisItem.ID),
        "Status Change",
        "Status",
        ThisItem.Status,
        "Ready to Print",
        varMeEmail,
        "Power Apps",
        "Approved in Staff Console"
    ),
    Notify("Failed to log action: " & FirstError.Message, NotificationType.Error),
    Notify("Action logged successfully.", NotificationType.Success)
)
```

---

## Part 3 — Power Apps

### A Student Submission Form (Customize SharePoint Form)
1. Go to the `PrintRequests` list → **Integrate → Power Apps → Customize forms**.
2. Ensure these **student-facing data cards** are present: Title, Student, StudentEmail, Course, Department, ProjectType, Color, Method, PrinterSelection, DueDate, Notes, **Attachments**.
3. **Hide staff-only** cards (select each card → set **Visible** = `false`): Status, Priority, AssignedTo, StaffNotes, EstHours, WeightEstimate, LastAction, LastActionBy, LastActionAt.
4. **File Validation Setup**: Add helper text for file requirements:
   - Select the **Attachments** card → **Advanced** → **DisplayName**: 
   ```
   "File Upload (Required: .stl, .obj, or .3mf files only • Max 150MB per file)"
   ```
   - Add a **Text label** above the Attachments card with validation guidance:
   ```
   "📁 ACCEPTED FILE TYPES: .stl, .obj, .3mf only
   📏 MAXIMUM SIZE: 150MB per file
   ⚠️ Files not meeting these requirements will be rejected by staff"
   ```
5. **Defaults** (select the card → set the property shown):
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
If(SharePointForm1.Mode = FormMode.New, "Uploaded", Parent.Default)
```
6. **Form OnSuccess** (or SharePointIntegration.OnSave):
```powerfx
Notify("Request submitted. You'll receive an email confirmation shortly.", NotificationType.Success)
```
7. **Publish** the form and close the editor.

### B Staff Console (Canvas App — Tablet)
1. Open **Power Apps** → **Create → Canvas app** (Tablet).
2. **Data** → Add data: SharePoint → connect to your site → add `PrintRequests`, `AuditLog`, `Staff`.
3. Add your **instant flow**: `PR-Action: Log action` (from the Data / Power Automate panel).
4. **App.OnStart** (App object → Advanced → OnStart):
```powerfx
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);

ClearCollect(colStaff, Filter(Staff, Active = true));
Set(varIsStaff, CountRows(Filter(colStaff, Lower(Member.Email) = varMeEmail)) > 0);

Set(varStatuses, ["Uploaded","Pending","Ready to Print","Printing","Completed","Paid & Picked Up","Rejected","Archived"]);
Set(varQuickQueue, ["Uploaded","Pending","Ready to Print","Printing","Completed"]);
```
5. **Main screen**: Insert a **Gallery** (Vertical). Set **Items**:
```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        Status = "Uploaded" || Status = "Pending" || Status = "Ready to Print" || Status = "Printing" || Status = "Completed"
    ),
    "Modified",
    Descending
)
```
6. Add a **Detail/Edit screen** bound to `PrintRequests`. Include Staff fields (AssignedTo, StaffNotes, EstHours, WeightEstimate, Priority, Status).
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
    Status: "Ready to Print",
    LastAction: "Approved",
    LastActionBy: varActor,
    LastActionAt: Now()
});

'PR-Action: Log action'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Ready to Print",
    varMeEmail,
    "Power Apps",
    "Approved in Staff Console"
);

Notify("Marked Ready to Print.", NotificationType.Success);
```
9. Create additional action buttons for other status transitions:
   - **Reject Button**: Status → "Rejected"
   - **Start Printing Button**: Status → "Printing"
   - **Complete Printing Button**: Status → "Completed" 
   - **Ready for Pickup Button**: Status → "Paid & Picked Up"
   - **Archive Button**: Status → "Archived"
10. **File Validation Reject Button** (for policy violations):
```powerfx
Patch(PrintRequests, ThisItem, {
    Status: "Rejected",
    LastAction: "Rejected",
    LastActionBy: varActor,
    LastActionAt: Now(),
    StaffNotes: Concatenate(
        If(IsBlank(ThisItem.StaffNotes), "", ThisItem.StaffNotes & " | "),
        "REJECTED: File does not meet requirements (.stl/.obj/.3mf only, max 150MB) - " & Text(Now(), "mm/dd/yyyy")
    )
});

'PR-Action: Log action'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Rejected",
    varMeEmail,
    "Power Apps",
    "File validation failure - does not meet .stl/.obj/.3mf or 150MB requirements"
);

Notify("Request rejected due to file policy violation. Student will be notified.", NotificationType.Warning);
```

> **Staff File Management Workflow**: 
> 1. **File Validation**: Check attachments for:
>    - **File type**: Only .stl, .obj, .3mf extensions allowed
>    - **File size**: Each file must be ≤150MB  
>    - **Completeness**: At least one valid 3D model file required
> 2. **File Processing**: 
>    - **Download** the attachment locally to your workstation
>    - **Open** the file in PrusaSlicer for slicing and preparation
>    - **Save/modify** locally as needed for printing requirements
>    - **No re-upload required** - work with local files throughout the process
> 3. **Status Management**: Use Power Apps dashboard buttons to update request status as work progresses
> 
> Use the **File Validation Reject** button above for policy violations, which automatically logs the reason.

> **Troubleshooting:** If a Person field fails to patch, verify the **internal name** or rebuild `varActor` using your email.

---

---

## Part 4 — Testing (End-to-End)

1. As a **student** account: Submit a new request with an attachment.
   - Fill out student fields: Title, Course, Department, ProjectType, Color, Method, PrinterSelection, DueDate, Notes
   - Test **Printer Selection filtering**: Select "Resin" method → only "Form 3" should appear in printer choices
   - Open the **My Requests** view link to confirm the new item appears for the student:
     `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`
   - Expect: **ReqKey** is set (e.g., `REQ-00001`), a **Created** entry in `AuditLog`, and a confirmation **email**.
2. As **staff**: Open the **Staff Console**, select the new item, click **Approve**.
   - Expect: `Status` changes to "Ready to Print", `LastAction/By/At` populated, and an **AuditLog** entry from Flow C.
3. Edit a staff field like **Priority** or **EstHours** in the SharePoint list (as staff).
   - Expect: **PR-Audit** flow logs a field change entry.
   - Open the **Staff – Queue** view link and verify the item shows while in active statuses:
     `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/Staff%20%20Queue.aspx`
4. **File Validation Testing**:
   - Submit a request with a `.pdf` or `.docx` file (invalid type)
   - As **staff**: Use the File Validation Reject button
   - Expect: Status changes to "Rejected", StaffNotes updated with violation reason, AuditLog entry created
   - Verify the helper text appears correctly on the student form
5. **Automated Email Testing**:
   - **Rejection Email**: When staff reject a request, student should receive rejection email with reason to check staff notes
   - **Completion Email**: When staff mark a request as "Completed", student should receive pickup notification email
   - Verify both emails are logged in AuditLog with "Email Sent" action and "System" actor

---

## Optional Enhancements

- **Additional Notifications**: Create separate flows for `Needs Info` and `Ready for Pickup` status changes to email students
- **Enhanced Views**: Add `Printing`, `Completed This Week`, or `Ready for Pickup` views for staff dashboard
- **Advanced File Management**: Migrate to Document Library later if you outgrow SharePoint attachments
- **Approval Emails**: Add student confirmation emails when requests are approved (before they become "Pending")

---

## Common Issues & Fixes

- **I pasted Power Fx into SharePoint and saw a JSON message.** Use the Power Apps **formula bar** for Power Fx; use **JSON** only in SharePoint column formatting.
- **Person field won’t set in Flow.** Map the person field to **Author Claims** / **Editor Claims** or pass an **email** (the connector usually resolves it).
- **Delegation warning in Power Apps.** The provided OR filter for `Status` is acceptable for MVP. If your list grows very large, ask for a delegation-optimized filter.
- **Users can see other items.** Revisit **Item-level permissions** on `PrintRequests` (Advanced settings). Staff should be in **Owners**.

---

## Time Estimate (Beginner)

- SharePoint lists & columns: **1.5–2 hours** *(simplified with fewer fields)*
- Power Automate flows: **3–4 hours** *(fewer field validations needed)*  
- Power Apps (form + staff app): **6–8 hours** *(cleaner interface, less complex logic)*
- Testing & fixes: **2–3 hours** *(fewer edge cases with simplified structure)*

**Total: 12.5–17 hours** *(vs 17-26 hours with complex field structure)*

---

## You’re Done!

You now have a working MVP for Fabrication Lab 3D printing requests with audit trails and staff attribution, built entirely with Microsoft 365 tools. If you’d like, I can also provide an **importable Solution** (flows + app) tailored to your tenant/site URL to save more time.
