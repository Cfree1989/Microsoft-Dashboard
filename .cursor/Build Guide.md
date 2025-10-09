# Fabrication Lab 3D Print Request System — **Beginner Build Guide**

This hands-on guide will help you build a complete MVP system for managing 3D print requests using **SharePoint**, **Power Automate**, and **Power Apps**. It is written for first-time users — no prior experience required.

---

## What you will build

- A SharePoint site with three lists: **PrintRequests** (19 fields total), **AuditLog** (14 fields total), and **Staff** (3 fields total).
- A **simplified student form** (9 fields) with smart printer selection based on build plate dimensions.
- A **Power Apps staff console** focused on operational management (10 staff-only fields).
- Four **Power Automate** flows to: assign request keys + send confirmation emails, log changes + send automated emails (including estimates), log staff actions, and handle student estimate confirmations.
- **Approval workflow**: Staff approve requests → students receive estimates → students confirm → printing begins.
- **Clean separation**: Students focus on project definition, staff control technical execution.

> **Scope & constraints (MVP):** Internal-only (LSU accounts), file management via SharePoint **attachments**, staff attribution on every action, and a complete **AuditLog**.

---

## Prerequisites

- A Microsoft 365 account with access to SharePoint, Power Automate, and Power Apps.
- You are a **Site Owner** of the SharePoint site you will create.
- Basic familiarity with navigating Microsoft 365 web apps (the rest is explained step-by-step).

---

## Build Strategy & Optimal Order

### Why Build Order Matters

Building this system in the wrong order can lead to frustrating rework, broken dependencies, and wasted time. This section provides the **strategic build plan** with dependency analysis to ensure smooth implementation.

### **PHASE 1: SharePoint Foundation (1.5-2 hours)**
**Critical Path**: Everything depends on this foundation  
**Build in this exact order:**

1. **Create SharePoint Team Site** (15 min)
   - **Why first**: Site must exist before creating lists
   - **Success criteria**: Site accessible, staff added as owners

2. **Build PrintRequests List** (60 min)
   - **Dependencies**: Site created
   - **Why critical**: All flows and Power Apps connect to this list
   - **Success criteria**: 19 columns added, item-level permissions working, views created

3. **Build AuditLog List** (15 min) 
   - **Dependencies**: Site created
   - **Why needed**: Flows A, B, C all write audit entries here
   - **Success criteria**: 14 columns added, can create test entries

4. **Build Staff List + Populate** (10 min)
   - **Dependencies**: Site created
   - **Why essential**: Power Apps staff detection and Flow C logging depend on this
   - **Success criteria**: Team members added with Active = Yes

5. **Foundation Validation** (15 min)
   - **Why critical**: Catches permission and configuration issues early
   - **Success criteria**: Students see only their items, staff see all items

---

### **PHASE 2: Power Automate Flows (4-5 hours)**
**Dependencies**: Requires Phase 1 complete  
**SEQUENTIAL BUILD ORDER** (order matters due to dependencies):

1. **Flow A: PR-Create** (2 hours)
   - **Purpose**: ReqKey generation + confirmation emails + filename validation
   - **Why first**: Creates the ReqKey field that other flows depend on reading
   - **Success criteria**: New requests get ReqKey, confirmation email sent

2. **Flow B: PR-Audit** (2-3 hours)
   - **Purpose**: Change logging + automated status emails (rejection/completion/estimates) 
   - **Why second**: Needs ReqKey from Flow A, provides email infrastructure for estimate workflow
   - **Dependencies**: Must work with Flow A's ReqKey generation
   - **Success criteria**: Field changes logged, status emails sent automatically

3. **Flow C: PR-Action** (1 hour)
   - **Purpose**: Staff action logging from Power Apps buttons
   - **Why third**: Power Apps will call this for all button actions
   - **Dependencies**: Needs AuditLog structure and ReqKey field working
   - **Success criteria**: Manual test succeeds, proper audit logging

4. **Flow D: PR-Confirm** (1 hour) 
   - **Purpose**: Student estimate confirmation via email links
   - **Why fourth**: Completes the approval workflow chain started by Flow B
   - **Dependencies**: Needs estimate emails from Flow B working
   - **Success criteria**: HTTP trigger processes confirmations correctly

5. **Flow Integration Testing** (30 min)
   - **Why essential**: Ensures all flows work together without conflicts
   - **Success criteria**: No duplicate audit entries, complete workflow functions

---

### **PHASE 3: Power Apps Development (6-8 hours)**
**Dependencies**: Requires Phases 1 & 2 complete

1. **Student Form Customization** (2 hours)
   - **Dependencies**: PrintRequests list with all columns, Flow A working
   - **Why early**: Students need working submission process before staff console
   - **Success criteria**: Form hides staff fields, Flow A triggers on submission

2. **Staff Console Foundation** (2 hours)
   - **Dependencies**: All lists created, Flow C available
   - **Purpose**: Connect to data sources, build basic queue display
   - **Success criteria**: App connects to lists, staff detection working

3. **Staff Action Buttons** (3-4 hours)
   - **Dependencies**: Flow C working for audit logging
   - **Purpose**: Approve, Reject, status change buttons with proper logging
   - **Success criteria**: Each button updates status and calls Flow C successfully

4. **Polish & Error Handling** (2 hours)
   - **Dependencies**: Core functionality working
   - **Purpose**: Loading states, notifications, search capabilities
   - **Success criteria**: Professional UX, graceful error handling

---

### **PHASE 4: Integration & Production (2-3 hours)**
**Dependencies**: Everything complete

1. **End-to-End Testing** (1.5 hours)
   - **Purpose**: Validate complete student → staff → confirmation workflow
   - **Success criteria**: Full workflow completes, all emails deliver

2. **Edge Case Testing** (30 min)
   - **Purpose**: File validation, permissions, error conditions
   - **Success criteria**: System handles edge cases gracefully

3. **Production Deployment** (30 min)
   - **Purpose**: Share apps, enable flows, document system
   - **Success criteria**: Team can use system independently

---

### **Critical Dependencies**

| **Component** | **Must Have First** | **Why** |
|---|---|---|
| All Flows | SharePoint Lists | Need lists to read/write data |
| Flow B | Flow A complete | Needs ReqKey generated by Flow A |
| Power Apps | Flows A, B, C working | Calls flows, displays flow-generated data |  
| Flow D | Flow B estimate emails | Uses confirmation links from Flow B |
| Testing | All components | Validates complete system integration |

### **Success Gates** 
**Don't proceed to the next phase until:**

- **Phase 1 Complete**: Students see only their items, staff see everything, test items work
- **Phase 2 Complete**: Create request → gets ReqKey → field changes logged → emails sent  
- **Phase 3 Complete**: Student form working, staff console updates status + logs actions
- **Phase 4 Complete**: Full end-to-end workflow tested successfully

###  **Optimized Timeline**
- **SharePoint Foundation**: 1.5-2 hours *(front-loaded investment)*
- **Power Automate Flows**: 4-5 hours *(sequential, most complex)*
- **Power Apps Development**: 6-8 hours *(depends on backend working)*  
- **Testing & Production**: 2-3 hours *(validates everything)*

**Total: 14-18 hours** *(vs 17-23 hours without strategic ordering)*

> **💡 Pro Tip**: The 2-3 hours invested in Phase 1 foundation work prevents weeks of debugging downstream issues. Build it right the first time!

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
| Course Number | Number | Optional class number (e.g., 1001, 2050) |
| Discipline | Choice | Architecture; Engineering; Art & Design; Business; Liberal Arts; Sciences; Other |
| ProjectType | Choice | Class Project; Research; Personal; Other |
| Color | Choice | Any; Black; White; Gray; Red; Green; Blue; Yellow; Other |
| Method | Choice | Filament; Resin |
| Printer | Choice | Prusa MK4S (9.8×8.3×8.7in); Prusa XL (14.2×14.2×14.2in); Raised3D Pro 2 Plus (12.0×12.0×23in); Form 3 (5.7×5.7×7.3in) |
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
| AttachmentCount | Number | Default 0; hidden from students. Used by Flow B Step 5 to detect attachment adds/removes. |

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

#### 2c. Add **RejectionReason** column for structured feedback

Add this additional column to the `PrintRequests` list for structured rejection feedback:

**Column Configuration:**
- **Column Name:** `RejectionReason`
- **Type:** Choice (single selection)
- **Allow 'Fill-in' choices:** Yes (enable "Can add values manually")
- **Predefined Choices:**
  - `File format not supported (.stl, .obj, .3mf required)`
  - `Design not printable (overhangs, thin walls, unsupported features)`
  - `Excessive material usage (optimize design for cost efficiency)`
  - `Incomplete request information (missing details or files)`
  - `Size limitations (exceeds printer build volume)`
  - `Material not available (requested filament/resin unavailable)`
  - `Quality concerns (design likely to fail during printing)`
  - `Other (see additional details)`

**Implementation Notes:**
- This field supports structured rejection reasons in automated emails
- Staff can select from predefined reasons OR type custom reasons as needed
- Power Automate flows automatically use this for email content (whether predefined or custom)
- Students receive specific, actionable feedback instead of generic messages
- **Benefits of Fill-in choices:** Combines consistency with flexibility for unique situations

#### 2d. Add **Status** color "chips" (optional but nice)
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
    "color": {
      "operator": "?",
      "operands": [
        { "operator": "==", "operands": [ "@currentField", "Pending" ] }, "#000000",
        "#ffffff"
      ]
    },
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

**⚠️ Color Accessibility:**
- **Pending** uses dark text (#000000) on yellow background (#FFB900) for readability
- All other statuses use white text (#ffffff) on dark backgrounds for high contrast

### 3. Create the list: `AuditLog`
1. **New → List** → name: `AuditLog`.
2. **Settings → Versioning settings** → enable versioning.
3. Add these columns (types in parentheses):
   - Title (Single line)
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

You will make four flows. Open **Power Automate** (flow.microsoft.com) and ensure you are in the same environment as your SharePoint site.

### What type of flows are these? Where do I create them?
- All flows here are **cloud flows** (not desktop flows).
- Navigation: Power Automate → left nav **Create** → choose the flow type:
  - **Automated cloud flow** for Flow A and Flow B (they run automatically on SharePoint triggers)
  - **Instant cloud flow** for Flow C (it is called from Power Apps) and Flow D (it is called from email links)

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

### Flow D — PR-Confirm: Estimate Approval (Instant, called from email)
**Purpose:** When students click the confirmation link in their estimate email, update the status from "Pending" to "Ready to Print" and log the confirmation action.

📋 **Full implementation details:** See [`PowerAutomate/PR-Confirm_EstimateApproval.md`](PowerAutomate/PR-Confirm_EstimateApproval.md)

**Quick Summary:**
- **Type:** Instant cloud flow (HTTP trigger)
- **Trigger:** Manual (HTTP Request) with RequestID parameter
- **Actions:** Get PrintRequest → Validate status is "Pending" → Update to "Ready to Print" → Log confirmation → Return success/error page

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
2. Ensure these **student-facing data cards** are present: Title, Student, StudentEmail, Course Number, Discipline, ProjectType, Color, Method, Printer, DueDate, Notes, **Attachments**.
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
    Status: "Pending",
    LastAction: "Approved",
    LastActionBy: varActor,
    LastActionAt: Now()
});

'PR-Action_LogAction'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Pending",
    varMeEmail,
    "Power Apps",
    "Approved - pending student confirmation of estimate"
);

Notify("Approved. Estimate email sent to student.", NotificationType.Success);
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

11. Attachments — Add/Remove Files Modal (Actor Required)
   - Purpose: Let staff add or remove SharePoint attachments from the job card without leaving the app, and require attribution for who performed the action. No drag‑and‑drop.
   
   a) Variables (App.OnStart, add to existing block)
   ```powerfx
   Set(varShowAddFileModal, false);
   Set(varSelectedItem, Blank());
   Set(varSelectedActor, Blank());
   Set(varAttachmentChangeType, Blank());    // "Added" or "Removed" (optional)
   Set(varAttachmentChangedName, Blank());   // filename (optional)
   ```

   b) Show attachments on the job card (read‑only)
   - Insert a Display Form: Name = `frmAttachmentsView`, DataSource = `PrintRequests`, Item = `ThisItem` (place inside the gallery template), and include only the Attachments data card.
   - Collapsed card: show a small label near the paperclip icon, e.g. `"Files: " & CountRows(AttachmentsView_Attachments.Attachments)` where `AttachmentsView_Attachments` is the Attachments control inside `frmAttachmentsView`.
   - Expanded card: increase the form height so the full list of filenames is visible. Clicking a filename will open/download it via SharePoint.

   c) Open the Add/Remove modal from the job card
   - Add a button labeled `Add/Remove Files` in both collapsed and expanded layouts.
   - Button.OnSelect:
   ```powerfx
   Set(varSelectedItem, ThisItem);
   Set(varShowAddFileModal, true);
   ResetForm(frmAttachmentsEdit);
   Set(varSelectedActor, Blank());
   Set(varAttachmentChangeType, Blank());
   Set(varAttachmentChangedName, Blank());
   ```

   d) Modal container
   - Add a full‑screen overlay container. Set `Visible = varShowAddFileModal`.
   - Inside, add a centered white rectangle for the modal content.

   e) Required actor (person) selector
   - Add a ComboBox named `ddAttachmentActor` with `Items = colStaff` and default to the signed‑in user:
   ```powerfx
   ddAttachmentActor.DefaultSelectedItems = Filter(colStaff, Lower(Member.Email) = varMeEmail)
   ```
   - OnChange:
   ```powerfx
   Set(varSelectedActor,
       {
         '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
         Claims: "i:0#.f|membership|" & ddAttachmentActor.Selected.Member.Email,
         DisplayName: ddAttachmentActor.Selected.Member.DisplayName,
         Email: ddAttachmentActor.Selected.Member.Email
       }
   )
   ```

   f) Edit Form for attachments (add and remove)
   - Insert an Edit Form: Name = `frmAttachmentsEdit`, DataSource = `PrintRequests`, Item = `varSelectedItem`.
   - Include ONLY the Attachments data card. This control supports selecting multiple files and deleting existing files.
   - Optional signals (inside the Attachments control):
   ```powerfx
   // DataCardValue_Attachments.OnAddFile
   Set(varAttachmentChangeType, "Added");
   // DataCardValue_Attachments.OnRemoveFile
   Set(varAttachmentChangeType, "Removed");
   ```

   g) Modal actions
   - Save button.DisplayMode:
   ```powerfx
   If(IsBlank(varSelectedActor), DisplayMode.Disabled, DisplayMode.Edit)
   ```
   - Save button.OnSelect:
   ```powerfx
   If(IsBlank(varSelectedActor),
       Notify("Select your name to continue", NotificationType.Error),
       SubmitForm(frmAttachmentsEdit)
   )
   ```
   - Cancel button.OnSelect:
   ```powerfx
   Set(varShowAddFileModal, false);
   Set(varSelectedItem, Blank());
   Set(varSelectedActor, Blank())
   ```

   h) `frmAttachmentsEdit.OnSuccess` (audit fields and optional flow call)
   ```powerfx
   Patch(
       PrintRequests,
       frmAttachmentsEdit.LastSubmit,
       {
           LastAction: If(varAttachmentChangeType = "Removed", "File Removed", "File Added"),
           LastActionBy: varSelectedActor,
           LastActionAt: Now()
       }
   );

   // Optional: explicit audit entry via Flow C
   IfError(
       'PR-Action_LogAction'.Run(
           Text(frmAttachmentsEdit.LastSubmit.ID),
           If(varAttachmentChangeType = "Removed", "File Removed", "File Added"),
           "Attachments",
           "",
           "",
           varMeEmail,
           "Power Apps",
           Coalesce(varAttachmentChangedName, "")
       ),
       Notify("Could not log attachment action.", NotificationType.Error)
   );

   Set(varShowAddFileModal, false);
   ```

   Notes
   - No drag‑and‑drop in Canvas; use the Attachments control’s picker UI.
   - Your existing PR‑Audit flow will log file additions automatically; removals can be inferred in history.

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
   - Fill out student fields: Title, Course Number, Discipline, ProjectType, Color, Method, Printer, DueDate, Notes
   - Test **Printer Selection filtering**: Select "Resin" method → only "Form 3" should appear in printer choices
   - Open the **My Requests** view link to confirm the new item appears for the student:
     `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx`
   - Expect: **ReqKey** is set (e.g., `REQ-00001`), a **Created** entry in `AuditLog`, and a confirmation **email**.
2. As **staff**: Fill in **EstimatedWeight**, **EstimatedTime**, and **EstimatedCost** for the request, then click **Approve**.
   - Expect: `Status` changes to "Pending", `LastAction/By/At` populated, and an **AuditLog** entry from Flow C.
   - Student should receive an **estimate email** with cost details and confirmation link (from Flow B).
3. As the **student**: Check email for estimate notification and click **"✅ Yes, proceed with printing"** link.
   - Expect: Browser opens with success page, `Status` changes to "Ready to Print", and **AuditLog** entry from Flow D.
4. Edit a staff field like **Priority** or **EstimatedTime** in the SharePoint list (as staff).
   - Expect: **PR-Audit** flow logs a field change entry.
   - Open the **Staff – Queue** view link and verify the item shows while in active statuses:
     `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/Staff%20%20Queue.aspx`
5. **File Validation Testing**:
   - Submit a request with a `.pdf` or `.docx` file (invalid type)
   - As **staff**: Use the File Validation Reject button
   - Expect: Status changes to "Rejected", StaffNotes updated with violation reason, AuditLog entry created
   - Verify the helper text appears correctly on the student form
6. **Automated Email Testing**:
   - **Estimate Email**: When staff approve a request (status → "Pending"), student should receive estimate email with cost details and confirmation link
   - **Rejection Email**: When staff reject a request, student should receive rejection email with reason to check staff notes
   - **Completion Email**: When staff mark a request as "Completed", student should receive pickup notification email
   - Verify all emails are logged in AuditLog with "Email Sent" action and "System" actor

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

- **Phase 1** SharePoint Foundation: **1.5–2 hours** *(front-loaded investment prevents downstream issues)*
- **Phase 2** Power Automate flows: **4–5 hours** *(four flows total, sequential dependencies)*  
- **Phase 3** Power Apps development: **6–8 hours** *(student form + staff console with action buttons)*
- **Phase 4** Integration & testing: **2–3 hours** *(end-to-end validation + production deployment)*

**Total: 14–18 hours** *(optimized with strategic build order)*

---

## You're Done!

You now have a working MVP for Fabrication Lab 3D printing requests with audit trails and staff attribution, built entirely with Microsoft 365 tools. If you'd like, I can also provide an **importable Solution** (flows + app) tailored to your tenant/site URL to save more time.