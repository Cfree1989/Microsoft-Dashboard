# Fabrication Lab 3D Print Request System — **Beginner Build Guide**

This hands-on guide will help you build a complete MVP system for managing 3D print requests using **SharePoint**, **Power Automate**, and **Power Apps**. It is written for first-time users — no prior experience required.

---

## What you will build

- A SharePoint site with three lists: **PrintRequests** (19 fields total), **AuditLog** (14 fields total), and **Staff** (3 fields total).
- A **simplified student form** (9 fields) with smart printer selection based on build plate dimensions.
- A **Power Apps staff console** focused on operational management (10 staff-only fields).
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
| Discipline | Choice | Architecture; Engineering; Art & Design; Other |
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
| EstimatedTime | Number | Staff estimation (print time in hours) |
| EstimatedWeight | Number | Staff estimation (weight in grams) |
| EstimatedCost | Currency | Auto-calculated cost (Filament: $0.10/gram, Resin: $0.20/gram, $3.00 minimum) |
| StaffNotes | Multiple lines of text | Staff-only |
| LastAction | Choice | Created; Updated; Status Change; File Added; Approved; Rejected; Printing; Completed; Picked Up; Comment Added; Email Sent |
| LastActionBy | Person | Who did it |
| LastActionAt | Date and Time | Timestamp |
| NeedsAttention | Yes/No | Flags items requiring staff review (Default: No) |
| Expanded | Yes/No | Controls expanded view state in Dashboard (Default: No) |

> **💰 Pricing Structure for EstimatedCost Calculation:**
> - **Filament prints:** $0.10 per gram
> - **Resin prints:** $0.20 per gram  
> - **Minimum charge:** $3.00 per print (applied automatically)
> - **Formula:** `Cost = Max($3.00, Weight × Method Rate)`
> - **EstimatedTime:** Optional for operational tracking (not used in pricing)

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

#### 2c. Add **Status** color "chips" (optional but nice)
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
   - Action (Choice) → Created; Updated; Status Change; File Added; Comment Added; Assigned; Email Sent; Rejected; System
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
**Purpose:** When a new request is created, assign a **ReqKey**, compute a standardized display name string (used for the list item Title/email/validation; no file rename), validate attachment filename(s), log a **Created** event, and email the student with confirmation.

📋 **Full implementation details:** See [`PowerAutomate/PR-Create_SetReqKey_Acknowledge.md`](PowerAutomate/PR-Create_SetReqKey_Acknowledge.md)

**Quick Summary:**
- **Type:** Automated cloud flow
- **Trigger:** SharePoint - When an item is created
- **Actions:** Generate ReqKey → Compute standardized display name → Attachment filename validation gate → Update SharePoint item → Log to AuditLog → Send confirmation email

### Flow B — PR-Audit: Log changes + Email notifications (Automated)
**Purpose:** Whenever a request is modified, record which fields changed in `AuditLog` and send automated emails for key status changes (Rejected/Completed).

📋 **Full implementation details:** See [`PowerAutomate/PR-Audit_LogChanges.md`](PowerAutomate/PR-Audit_LogChanges.md)

**Quick Summary:**
- **Type:** Automated cloud flow
- **Trigger:** SharePoint - When an item is created or modified
- **Actions:** Get field changes → Log all field changes to AuditLog → Send status-based emails (rejection/completion) → Log email actions

### Flow C — PR-Action_LogAction (Instant, called from Power Apps)
**Purpose:** When staff press buttons in the Power Apps staff console (e.g., Approve, Reject), log that action with proper actor attribution and comprehensive audit details.

📋 **Full implementation details:** See [`PowerAutomate/PR-Action_LogAction.md`](PowerAutomate/PR-Action_LogAction.md)

**Quick Summary:**
- **Type:** Instant cloud flow (called from Power Apps)
- **Trigger:** Power Apps with 8 input parameters
- **Actions:** Validate inputs → Get SharePoint item → Create AuditLog entry → Return success response

### URL Reference Guide

Update these URLs for your specific SharePoint site:

- **Site root**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
- **Per‑item link (used in emails)**: `/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}`
- **My Requests view (students)**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`
- **Staff – Queue view (staff)**: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/Staff%20%20Queue.aspx`

> **How to get your My Requests view URL:** In SharePoint, open `PrintRequests`, switch to the "My Requests" view, then copy the full browser URL.

---

## Part 3 — Power Apps

### A Student Submission Form (Customize SharePoint Form)
1. Go to the `PrintRequests` list → **Integrate → Power Apps → Customize forms**.
2. Ensure these **student-facing data cards** are present: Title, Student, StudentEmail, Course, Discipline, ProjectType, Color, Method, PrinterSelection, DueDate, Notes, **Attachments**.
3. **Hide staff-only** cards (select each card → set **Visible** = `false`): Status, Priority, AssignedTo, StaffNotes, EstimatedTime, EstimatedWeight, EstimatedCost, LastAction, LastActionBy, LastActionAt, NeedsAttention, Expanded.
4. **File Validation Setup**: Add helper text for file requirements:
   - Select the **Attachments** card → **Advanced** → **DisplayName**: 
   ```
  "File Upload (Required: .stl, .obj, .3mf, .idea, .form • Max 150MB per file)"
   ```
   - Add a **Text label** above the Attachments card with validation guidance:
   ```
  "ACCEPTED FILE TYPES: .stl, .obj, .3mf, .idea, .form
   MAXIMUM SIZE: 150MB per file
   Files not meeting these requirements will be rejected by staff"
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
3. Add your **instant flow**: `PR-Action_LogAction` (from the Data / Power Automate panel).
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
6. Add a **Detail/Edit screen** bound to `PrintRequests`. Include Staff fields (AssignedTo, StaffNotes, EstimatedTime, EstimatedWeight, EstimatedCost, Priority, Status).
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

'PR-Action_LogAction'.Run(
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

'PR-Action_LogAction'.Run(
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
> 1. **Filename Policy** (enforced by Flow A): Attachments must be named `FirstLast_Method_Color.ext` with extensions in `.stl, .obj, .3mf, .idea, .form` (≤150MB each). Invalid submissions are auto‑rejected.
> 2. **Download and Process** valid attachments locally (no in‑place rename in SharePoint). Use your normal slicer workflow.
>    - **No re-upload required** - work with local files throughout the process
> 3. **Status Management**: Use Power Apps dashboard buttons to update request status as work progresses
> 
> Use the **File Validation Reject** button above for policy violations, which automatically logs the reason.

> **Troubleshooting:** If a Person field fails to patch, verify the **internal name** or rebuild `varActor` using your email.

---

---

## Part 4 — Testing (End-to-End)

1. As a **student** account: Submit a new request with an attachment.
   - Fill out student fields: Title, Course, Discipline, ProjectType, Color, Method, PrinterSelection, DueDate, Notes
   - Test **Printer Selection filtering**: Select "Resin" method → only "Form 3" should appear in printer choices
   - Open the **My Requests** view link to confirm the new item appears for the student:
     `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`
   - Expect: **ReqKey** is set (e.g., `REQ-00001`), a **Created** entry in `AuditLog`, and a confirmation **email**.
2. As **staff**: Open the **Staff Console**, select the new item, click **Approve**.
   - Expect: `Status` changes to "Ready to Print", `LastAction/By/At` populated, and an **AuditLog** entry from Flow C.
3. Edit a staff field like **Priority** or **EstimatedTime** in the SharePoint list (as staff).
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
- **Person field won't set in Flow.** Map the person field to **Author Claims** / **Editor Claims** or pass an **email** (the connector usually resolves it).
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

## You're Done!

You now have a working MVP for Fabrication Lab 3D printing requests with audit trails and staff attribution, built entirely with Microsoft 365 tools. If you'd like, I can also provide an **importable Solution** (flows + app) tailored to your tenant/site URL to save more time.