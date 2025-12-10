# Staff Console — Canvas App (Tablet)

**⏱️ Time Required:** 8-12 hours (can be done in multiple sessions)  
**🎯 Goal:** Staff can view, manage, and process all 3D print requests through an intuitive dashboard

> 📚 **This is the comprehensive guide** — includes step-by-step build instructions, code references, and quick-copy snippets.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating the Canvas App](#step-1-creating-the-canvas-app)
3. [Adding Data Connections](#step-2-adding-data-connections)
4. [Setting Up App.OnStart](#step-3-setting-up-apponstart)
5. [Understanding Where Things Go](#understanding-where-things-go-read-this) ← **READ THIS FIRST!**
6. [Building the Top Navigation Bar](#step-4-building-the-top-navigation-bar)
7. [Creating Status Tabs](#step-5-creating-status-tabs)
8. [Building the Job Cards Gallery](#step-6-building-the-job-cards-gallery)
9. [Creating the Job Card Template](#step-7-creating-the-job-card-template)
10. [Adding Expandable Details](#step-8-adding-expandable-details)
11. [Implementing Action Buttons](#step-9-implementing-action-buttons)
12. [Building the Rejection Modal](#step-10-building-the-rejection-modal)
13. [Building the Approval Modal](#step-11-building-the-approval-modal)
14. [Building the Archive Modal](#step-12-building-the-archive-modal)
15. [Adding Search and Filters](#step-13-adding-search-and-filters)
16. [Adding the Lightbulb Attention System](#step-14-adding-the-lightbulb-attention-system)
17. [Adding the Attachments Modal](#step-15-adding-the-attachments-modal)
18. [Adding the Message Modal](#step-16-adding-the-message-modal)
19. [Publishing the App](#step-17-publishing-the-app)
20. [Testing the App](#step-18-testing-the-app)
21. [Troubleshooting](#troubleshooting)
22. [Quick Reference Card](#quick-reference-card)
23. [Code Reference (Copy-Paste Snippets)](#code-reference-copy-paste-snippets)

---

# Prerequisites

Before you start, make sure you have:

- [ ] **SharePoint lists created**: `PrintRequests`, `AuditLog`, `Staff`
- [ ] **Power Automate flows working**: Flow A (PR-Create), Flow B (PR-Audit), Flow C (PR-Action)
- [ ] **Staff list populated**: At least one staff member with `Active = Yes`
- [ ] **Power Apps license**: Standard license included with Microsoft 365

> ⚠️ **IMPORTANT:** Complete Phases 1 and 2 (SharePoint + Flows) before building the Staff Console. The app depends on these being set up correctly.

---

## ⚠️ CRITICAL: Curly Quotes Warning

**When copying formulas from this guide, you may get errors like:**
- "Unexpected characters"
- "Characters are used in the formula in an unexpected way"

**The Problem:** Document formatting often converts straight quotes `"text"` to curly/smart quotes `"text"`. Power Apps only accepts straight quotes.

**The Fix:**
1. **Best option:** Type formulas directly in Power Apps instead of copy-pasting
2. **If you paste:** Delete the quotes and retype them using your keyboard (`Shift + '`)

| Wrong (curly) | Correct (straight) |
|---------------|---------------------|
| `"Dashboard"` | `"Dashboard"` |
| `'text'` | `'text'` |

> 💡 **Tip:** If a formula shows red errors after pasting, the quotes are usually the culprit!

---

# STEP 1: Creating the Canvas App

**What you're doing:** Creating a new Canvas app with a Tablet layout, which gives you a wide screen perfect for viewing job queues.

### Instructions

1. Open **Power Apps** in your browser: [make.powerapps.com](https://make.powerapps.com)
2. Make sure you're in the correct **Environment** (top right dropdown — should show "Louisiana State Universi...").
3. In the left navigation, click **+ Create**.
4. Under "Create your apps", click **Start with a blank canvas**.
5. In the popup "Start with a blank canvas", click **Tablet size** (middle option, 1084 x 1386).
6. Enter these settings:
   - **App name:** `Print Lab Dashboard`
7. Click **Create**.

> 💡 **Tip:** Tablet format gives you a wide landscape canvas—perfect for dashboards with side-by-side content.

> 📝 **Naming alternatives:** You can also use `3D Print Queue Dashboard`, `FabLab Print Dashboard`, or any name that fits your lab.

### What You Should See

- The Power Apps Studio editor opens
- A blank white screen appears in the center
- The left panel shows **Tree view** with `Screen1`
- The top shows the formula bar

---

# STEP 2: Adding Data Connections

**What you're doing:** Connecting your app to the SharePoint lists and Power Automate flow it needs.

### Instructions

1. In the left panel, click the **Data** icon (cylinder icon, 4th from top).
2. Click **+ Add data**.
3. In the search box, type `SharePoint`.
4. Click **SharePoint** from the list.
5. You may see **duplicate SharePoint connections** (both showing your email). This is normal — **click either one**, they're the same connection.
6. If prompted, sign in with your Microsoft 365 account.
7. Paste your SharePoint site URL:

**⬇️ URL: Paste into "Enter a custom site URL"**

```
https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab
```

8. Click **Connect**.
9. Check the boxes for these lists:
   - [x] **PrintRequests**
   - [x] **AuditLog**
   - [x] **Staff**
10. Click **Connect**.

### Adding the Power Automate Flow

> ⚠️ **IMPORTANT:** Adding a flow is DIFFERENT from adding a data source. Don't search for "Power Automate" in the data panel — those are admin connectors, not your flow!

11. Look in the **left sidebar** for a **Power Automate icon** (lightning bolt ⚡).
    - OR: In the top menu, click the **three dots (...)** → **Power Automate**
12. Click **+ Add flow**.
13. You'll see "Add a flow from this environment" with your flows listed.
14. Under **Instant**, find and click **Flow C (PR-Action)** (or whatever you named Flow C).
15. The flow is now added to your app.

> 💡 **Why only Flow C?** Flows A and B are automatic SharePoint triggers — they run on their own when items are created/modified. Only Flow C (instant trigger) is called from Power Apps buttons.

| Flow | Trigger Type | Add to Power Apps? |
|------|-------------|-------------------|
| Flow A (PR-Create) | Automatic (SharePoint) | ❌ No |
| Flow B (PR-Audit) | Automatic (SharePoint) | ❌ No |
| **Flow C (PR-Action)** | **Instant (Power Apps)** | ✅ **Yes** |

### Verification

**In the Data panel**, you should see:
- ✅ PrintRequests
- ✅ AuditLog  
- ✅ Staff

**In the Power Automate panel**, you should see:
- ✅ Flow C (PR-Action)

> ⚠️ **Flow Name Note:** Your flow might be named `PR-Action: Log action`, `Flow C (PR-Action)`, or `PR-Action_LogAction`. The formulas in this guide use `'Flow C (PR-Action)'` — replace with your actual flow name as it appears in Power Apps.

---

# STEP 3: Setting Up App.OnStart

**What you're doing:** Initializing variables that the entire app will use—like knowing who's logged in, loading staff data, and defining status options.

### Instructions

1. In the **Tree view** (left panel), click on **App** at the very top.
2. In the **Property dropdown** (top left, shows "OnStart"), make sure **OnStart** is selected.
3. Click in the **formula bar** (the wide text area at the top).
4. Delete any existing content and paste this formula:

**⬇️ FORMULA: Paste into App.OnStart**

```powerfx
// === USER IDENTIFICATION ===
// Cache user info for performance
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);

// === STAFF DATA ===
// Load active staff members into a collection for dropdowns
ClearCollect(colStaff, Filter(Staff, Active = true));

// Check if current user is a staff member
Set(varIsStaff, CountRows(Filter(colStaff, Lower(Member.Email) = varMeEmail)) > 0);

// === STATUS DEFINITIONS ===
// All possible statuses in the system
Set(varStatuses, ["Uploaded", "Pending", "Ready to Print", "Printing", "Completed", "Paid & Picked Up", "Rejected", "Archived"]);

// Statuses shown in the main queue (active work)
Set(varQuickQueue, ["Uploaded", "Pending", "Ready to Print", "Printing", "Completed"]);

// === UI STATE VARIABLES ===
// Currently selected status tab
Set(varSelectedStatus, "Uploaded");

// Current page/view
Set(varCurrentPage, "Dashboard");

// Search and filter state
Set(varSearchText, "");
Set(varNeedsAttention, false);
Set(varExpandAll, false);

// === MODAL CONTROLS ===
// These control which modal is visible (0 = hidden, ID = visible for that item)
Set(varShowRejectModal, 0);
Set(varShowApprovalModal, 0);
Set(varShowArchiveModal, 0);
Set(varShowDetailsModal, 0);
Set(varShowAddFileModal, false);
Set(varShowMessageModal, false);

// Currently selected item for modals (typed to PrintRequests schema)
Set(varSelectedItem, LookUp(PrintRequests, false));

// === FORM VALIDATION ===
Set(varApprovalFormValid, false);

// === ATTACHMENT TRACKING ===
// Typed to Staff record schema
Set(varSelectedActor, LookUp(Staff, false));
Set(varAttachmentChangeType, "");
Set(varAttachmentChangedName, "");

// === EXPANDED CARDS TRACKING ===
// Track which cards are expanded (local state, not saved to SharePoint)
ClearCollect(colExpanded, {ID: -1});
RemoveIf(colExpanded, true);  // Start with empty collection
```

5. Press **Enter** or click away to confirm.

### Running OnStart to Test

6. At the top of the screen, click the **three dots (...)** next to "App".
7. Click **Run OnStart**.
8. Wait for it to complete (you'll see a brief loading indicator).

> 💡 **Tip:** You can also press **F5** to preview the app, which automatically runs OnStart.

### Understanding the Variables

| Variable | Purpose | Type |
|----------|---------|------|
| `varMeEmail` | Current user's email (lowercase) | Text |
| `varMeName` | Current user's display name | Text |
| `colStaff` | Collection of active staff members | Table |
| `varIsStaff` | Is current user a staff member? | Boolean |
| `varStatuses` | All status options | Table |
| `varQuickQueue` | Active queue statuses | Table |
| `varSelectedStatus` | Currently selected status tab | Text |
| `varSearchText` | Current search filter | Text |
| `varNeedsAttention` | Filter for attention items only | Boolean |
| `varShowRejectModal` | ID of item being rejected (0=hidden) | Number |
| `varShowApprovalModal` | ID of item being approved (0=hidden) | Number |
| `varShowArchiveModal` | ID of item being archived (0=hidden) | Number |
| `varShowDetailsModal` | ID of item for detail changes (0=hidden) | Number |
| `varShowAddFileModal` | Show attachment modal | Boolean |
| `varShowMessageModal` | Show message modal | Boolean |
| `varSelectedItem` | Item currently selected for modal | PrintRequests Record |
| `varSelectedActor` | Staff member for attribution | Staff Record |
| `varAttachmentChangeType` | Type of attachment change | Text |
| `varAttachmentChangedName` | Name of changed attachment | Text |
| `colExpanded` | IDs of expanded job cards | Table |

> ⚠️ **Important:** Variables holding records (`varSelectedItem`, `varSelectedActor`) must be initialized with `LookUp(TableName, false)` instead of `Blank()`. This tells PowerApps the expected data type while returning an empty value.

---

## Understanding Where Things Go (READ THIS!)

Before you start building the UI, understand the difference between **App** and **scrDashboard** (your screen):

### Naming Convention

We use **prefixes** to identify control types at a glance:

| Prefix | Control Type | Example |
|--------|-------------|---------|
| `scr` | Screen | `scrDashboard` |
| `rec` | Rectangle | `recHeader` |
| `lbl` | Label | `lblAppTitle` |
| `btn` | Button | `btnApprove` |
| `gal` | Gallery | `galJobCards` |
| `txt` | Text Input | `txtSearch` |
| `dd` | Dropdown/ComboBox | `ddStaff` |
| `chk` | Checkbox | `chkNeedsAttention` |
| `ico` | Icon | `icoExpand` |
| `con` | Container | `conExpandedDetails` |
| `frm` | Form | `frmAttachments` |
| `tmr` | Timer | `tmrGlow` |

### Complete Tree View — All Controls

Here's the **complete Tree view** exactly as it should appear in Power Apps:

> ⚠️ **Z-ORDER RULE:** TOP of list = FRONT (renders on top) · BOTTOM of list = BACK (renders behind)

```
▼ App
▼ scrDashboard
    btnMessageSend
    btnMessageCancel
    lblMessageCharCount
    txtMessageBody
    lblMessageBodyLabel
    txtMessageSubject
    lblMessageSubjectLabel
    ddMessageStaff
    lblMessageStaffLabel
    lblMessageStudent
    lblMessageTitle
    recMessageModal
    recMessageOverlay
    btnFileCancel
    btnFileSave
    frmAttachmentsEdit
    ddFileActor
    lblFileStaffLabel
    lblFileTitle
    recFileModal
    recFileOverlay
    btnDetailsConfirm
    btnDetailsCancel
    ddDetailsColor
    lblDetailsColorLabel
    ddDetailsPrinter
    lblDetailsPrinterLabel
    ddDetailsStaff
    lblDetailsStaffLabel
    lblDetailsCurrent
    lblDetailsCurrentLabel
    lblDetailsTitle
    recDetailsModal
    recDetailsOverlay
    btnArchiveConfirm
    btnArchiveCancel
    txtArchiveReason
    lblArchiveReasonLabel
    ddArchiveStaff
    lblArchiveStaffLabel
    lblArchiveWarning
    lblArchiveTitle
    recArchiveModal
    recArchiveOverlay
    btnApprovalConfirm
    btnApprovalCancel
    txtApprovalComments
    lblApprovalCommentsLabel
    lblCalculatedCost
    lblCostLabel
    txtEstimatedTime
    lblTimeLabel
    lblWeightError
    txtEstimatedWeight
    lblWeightLabel
    ddApprovalStaff
    lblApprovalStaffLabel
    lblApprovalStudent
    lblApprovalTitle
    recApprovalModal
    recApprovalOverlay
    btnRejectConfirm
    btnRejectCancel
    txtRejectComments
    lblRejectCommentsLabel
    chkComplexity
    chkCopyright
    chkDetail
    chkSafety
    chkIncomplete
    lblRejectReasonsLabel
    ddRejectStaff
    lblRejectStaffLabel
    lblRejectStudent
    lblRejectTitle
    recRejectModal
    recRejectOverlay
    ▼ galJobCards
        btnSendMessage
        btnFiles
        btnChangeDetails
        btnPickedUp
        btnComplete
        btnStartPrint
        btnArchive
        btnReject
        btnApprove
        icoLightbulb
        icoExpandCollapse
        lblUnreadBadge
        ▼ galMessages
            lblMsgContent
            lblMsgDirectionBadge
            lblMsgAuthor
            icoMsgDirection
            recMessageBg
        lblNoMessages
        lblMessagesHeader
        lblCourse
        lblProjectType
        lblDiscipline
        lblDueDate
        lblCreated
        lblJobId
        btnSaveNotes
        txtStaffNotes
        lblStaffNotesPlaceholder
        lblStaffNotesHeader
        lblColor
        lblPrinter
        lblStudentEmail
        lblReqKey
        lblSubmittedTime
        lblStudentName
        recCardBackground
    btnClearFilters
    btnExpandAll
    chkNeedsAttention
    txtSearch
    ▼ galStatusTabs
        btnStatusTab
    lblUserName
    btnNavAnalytics
    btnNavAdmin
    btnNavDashboard
    lblAppTitle
    recHeader
    tmrGlow
```

### Key Rules

| Rule | Explanation |
|------|-------------|
| **App = formulas only** | Only put formulas like `OnStart` here. Never visual elements. |
| **scrDashboard = all visuals** | All rectangles, labels, buttons, galleries go here. |
| **Elements are siblings** | They sit side-by-side in Tree view, NOT nested inside each other. |
| **Galleries are special** | If you select a gallery and then Insert, the new control goes INSIDE that gallery's template. |
| **Rename immediately** | After adding a control, rename it right away (click name in Tree view). |

> 💡 **How to rename:** In the Tree view, double-click the control name (or click once and press F2) to edit it.

> 💡 **How to know what's selected:** Look at the Tree view on the left. The highlighted item is what's currently selected. When you click **+ Insert**, the new control goes into whatever is selected.

---

# STEP 4: Building the Top Navigation Bar

**What you're doing:** Creating a professional navigation bar at the top of the screen with page buttons.

**Controls you'll create:**
- `recHeader` — Header background
- `lblAppTitle` — App title label
- `btnNavDashboard`, `btnNavAdmin`, `btnNavAnalytics` — Navigation buttons
- `lblUserName` — User display

### First: Rename the Screen

1. **In the Tree view, double-click on `Screen1`** to rename it.
2. Type `scrDashboard` and press **Enter**.

> 💡 **Why rename?** Using consistent names makes your formulas easier to read and debug.

### Creating the Header Bar (recHeader)

3. With `scrDashboard` selected, click **+ Insert** → **Rectangle**.
4. **Rename it:** Double-click `Rectangle1` in Tree view → type `recHeader` → press Enter.
5. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `1366` |
| Height | `60` |
| Fill | `RGBA(45, 45, 48, 1)` |

> This creates a dark gray header bar.

### Adding the App Title (lblAppTitle)

6. Click **+ Insert** → **Text label**.
7. **Rename it:** `lblAppTitle`
8. Set these properties:

| Property | Value |
|----------|-------|
| Text | `Print Lab Dashboard` |
| X | `20` |
| Y | `15` |
| Width | `300` |
| Height | `30` |
| Font | `Font.'Segoe UI Semibold'` |
| Size | `18` |
| Color | `Color.White` |

### Adding Navigation Buttons

#### btnNavDashboard

9. Click **+ Insert** → **Button**.
10. **Rename it:** `btnNavDashboard`
11. Set these properties:
   - **Text:** `"Dashboard"`
   - **X:** `300`
   - **Y:** `12`
   - **Width:** `120`
   - **Height:** `36`

10. Set the **Fill** property (makes it highlight when selected):

**⬇️ FORMULA: Paste into Button Fill**

```powerfx
If(varCurrentPage = "Dashboard", RGBA(70, 130, 220, 1), RGBA(60, 60, 65, 1))
```

11. Set the **Color** property:

```powerfx
Color.White
```

12. Set the **OnSelect** property:

```powerfx
Set(varCurrentPage, "Dashboard")
```

13. Repeat steps 8-12 to create **Admin** and **Analytics** buttons:

| Button | X | OnSelect |
|--------|---|----------|
| Admin | `430` | `Notify("Admin features coming soon!", NotificationType.Information)` |
| Analytics | `560` | `Notify("Analytics features coming soon!", NotificationType.Information)` |

### Adding User Info Display (lblUserName)

18. Click **+ Insert** → **Text label**.
19. **Rename it:** `lblUserName`
20. Set these properties:
   - **Text:** `varMeName`
   - **X:** `1150`
   - **Y:** `18`
   - **Width:** `200`
   - **Height:** `24`
   - **Align:** `Align.Right`
   - **Color:** `RGBA(200, 200, 200, 1)`
   - **Size:** `12`

### ✅ Step 4 Checklist

After completing this step, your Tree view should look like:

```
▼ App
▼ scrDashboard
    recHeader
    lblAppTitle
    btnNavDashboard
    btnNavAdmin
    btnNavAnalytics
    lblUserName
```

---

# STEP 5: Creating Status Tabs

**What you're doing:** Building a row of clickable tabs that show status counts and filter the gallery.

### Instructions

1. Click **+ Insert** → **Horizontal gallery** (or search for "Blank horizontal gallery").
2. Rename it to `galStatusTabs` (click the name in Tree view to edit).
3. Position and size:
   - **X:** `0`
   - **Y:** `60`
   - **Width:** `1366`
   - **Height:** `50`

4. Set the **Items** property:

**⬇️ FORMULA: Paste into galStatusTabs Items**

```powerfx
Table(
    {Status: "Uploaded", Color: RGBA(70, 130, 220, 1)},
    {Status: "Pending", Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Color: RGBA(16, 124, 16, 1)},
    {Status: "Printing", Color: RGBA(107, 105, 214, 1)},
    {Status: "Completed", Color: RGBA(0, 78, 140, 1)},
    {Status: "Paid & Picked Up", Color: RGBA(0, 158, 73, 1)},
    {Status: "Rejected", Color: RGBA(209, 52, 56, 1)},
    {Status: "Archived", Color: RGBA(96, 94, 92, 1)}
)
```

5. Set **TemplateSize:** `165`
6. Set **TemplatePadding:** `3`


### Adding the Tab Button Inside the Gallery (btnStatusTab)

9. With `galStatusTabs` selected, click **+ Insert** → **Button**.
10. **Rename it:** `btnStatusTab`
11. The button appears inside the gallery template.
12. **First, set the size and position:**

| Property | Value |
|----------|-------|
| X | `3` |
| Y | `5` |
| Width | `158` |
| Height | `40` |
| Size | `11` |
| BorderRadius | `20` |

> 💡 **Why these sizes?** 8 tabs × 165px = 1320px fits the 1366px screen width. Font size 11 ensures "Paid & Picked Up" fits.

14. Set the button's **Text** property (type directly to avoid quote issues):

```powerfx
ThisItem.Status & " " & Text(CountRows(Filter(PrintRequests, Status.Value = ThisItem.Status)))
```

> ⚠️ **Note:** We use `Status.Value` because Status is a **Choice field** in SharePoint. Choice fields store objects, not plain text, so `.Value` extracts the text.

16. Set the **Fill** property:

```powerfx
If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1))
```

17. Set the **Color** property (text color):

```powerfx
If(
    varSelectedStatus = ThisItem.Status, 
    If(ThisItem.Status = "Pending", Color.Black, Color.White),
    RGBA(100, 100, 100, 1)
)
```

18. Set the **OnSelect** property:

```powerfx
Set(varSelectedStatus, ThisItem.Status)
```

> 💡 **Result:** Clicking a tab highlights it with its color and filters the job cards gallery.

### ✅ Step 5 Checklist

Your Tree view should now include:

```
▼ scrDashboard
    ... (header controls)
    ▼ galStatusTabs
        btnStatusTab
```

---

# STEP 6: Building the Job Cards Gallery

**What you're doing:** Creating the main gallery that displays all print requests as job cards.

### Instructions

1. Click on **scrDashboard** in the Tree view (not inside the status tabs gallery).
2. Click **+ Insert** → **Blank vertical gallery**.
3. Rename it to `galJobCards`.
4. Position and size:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `115` |
| Width | `1366` |
| Height | `653` |
| **WrapCount** | `4` |
| TemplatePadding | `8` |

> 💡 **WrapCount = 4** creates a grid layout with 4 cards per row! Each card will be approximately 330px wide.

5. Set the **Items** property:

**⬇️ FORMULA: Paste into galJobCards Items**

```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        // Filter by selected status tab (use .Value for Choice fields)
        Status.Value = varSelectedStatus,
        // Search filter (searches name and email)
        If(
            IsBlank(varSearchText), 
            true, 
            varSearchText in Student.DisplayName || varSearchText in StudentEmail || varSearchText in ReqKey
        ),
        // Needs attention filter
        If(varNeedsAttention, NeedsAttention = true, true)
    ),
    "Modified",
    SortOrder.Descending
)
```

> ⚠️ **Note:** Use `Status.Value` because Status is a Choice field in SharePoint.

6. Set **TemplateSize:** `380` (card height for compact layout)

### Making Cards Expandable

7. Update the **TemplateSize** property to be dynamic:

```powerfx
If(ThisItem.ID in colExpanded.ID || varExpandAll, 480, 380)
```

> 💡 **How this works:** We track expanded cards in `colExpanded` collection (created in App.OnStart). This avoids storing UI state in SharePoint.

---

# STEP 7: Creating the Job Card Template

**What you're doing:** Designing a compact job card (~330px wide × 380px tall) that shows student info, request details, and action buttons.

> 💡 **Card Layout:** With WrapCount=4, you'll see 4 cards per row. Each card is approximately 330px wide.

### Instructions

With `galJobCards` selected, you'll add controls **inside** the gallery template.

### Card Background (recCardBackground)

1. Click **+ Insert** → **Rectangle**.
2. **Rename it:** `recCardBackground`
3. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.TemplateWidth` |
| Height | `Parent.TemplateHeight - 8` |
| Fill | `If(ThisItem.NeedsAttention, RGBA(255, 250, 230, 1), Color.White)` |
| BorderColor | `RGBA(220, 220, 220, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

### Attention Icon (icoLightbulb)

4. Click **+ Insert** → **Icon** → select **Lightbulb** icon.
5. **Rename it:** `icoLightbulb`
6. Set properties:

| Property | Value |
|----------|-------|
| X | `Parent.TemplateWidth - 35` |
| Y | `8` |
| Width | `24` |
| Height | `24` |
| Color | `RGBA(255, 185, 0, 1)` |
| Visible | `ThisItem.NeedsAttention` |

### Student Name (lblStudentName)

7. Click **+ Insert** → **Text label**.
8. **Rename it:** `lblStudentName`
9. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Student.DisplayName` |
| X | `12` |
| Y | `8` |
| Width | `Parent.TemplateWidth - 50` |
| Height | `24` |
| Font | `Font.'Segoe UI Semibold'` |
| Size | `14` |
| Color | `RGBA(50, 50, 50, 1)` |

### Submission Time (lblSubmittedTime)

10. Click **+ Insert** → **Text label**.
11. **Rename it:** `lblSubmittedTime`
12. Set properties:

| Property | Value |
|----------|-------|
| X | `Parent.TemplateWidth - 130` |
| Y | `8` |
| Width | `120` |
| Height | `20` |
| Align | `Align.Right` |
| Size | `10` |
| Color | `RGBA(209, 52, 56, 1)` |

13. Set **Text:**

**⬇️ FORMULA: Shows relative time since submission**

```powerfx
"Submitted " & 
If(
    DateDiff(ThisItem.Created, Now(), TimeUnit.Days) > 0,
    Text(DateDiff(ThisItem.Created, Now(), TimeUnit.Days)) & "d ",
    ""
) &
If(
    Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Hours), 24) > 0,
    Text(Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Hours), 24)) & "h ",
    ""
) &
Text(Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Minutes), 60)) & "m ago"
```

> 💡 Items older than 2 days show in red to indicate urgency.

### File Name / Request Info (lblReqKey)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblReqKey`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Student.DisplayName & "_" & ThisItem.Method.Value & "_" & ThisItem.Color.Value` |
| X | `12` |
| Y | `32` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `20` |
| Size | `11` |
| Color | `RGBA(100, 100, 100, 1)` |

### Email Row (lblStudentEmail)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblStudentEmail`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✉ " & ThisItem.StudentEmail` |
| X | `12` |
| Y | `55` |
| Width | `Parent.TemplateWidth / 2 - 16` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(100, 100, 100, 1)` |

### Printer Label (lblPrinter)

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblPrinter`
22. Set properties:

| Property | Value |
|----------|-------|
| Text | `"🖨 " & Trim(If(Find("(", ThisItem.Printer.Value) > 0, Left(ThisItem.Printer.Value, Find("(", ThisItem.Printer.Value) - 1), ThisItem.Printer.Value))` |
| X | `Parent.TemplateWidth / 2` |
| Y | `55` |
| Width | `Parent.TemplateWidth / 2 - 16` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(100, 100, 100, 1)` |

> 💡 **Why this formula?** The Printer column includes dimensions (e.g., "Prusa XL (14.2×14.2×14.2in)") to help students check if their model fits. This formula strips the dimensions for cleaner display on staff cards, showing just "Prusa XL".

### Color Indicator (lblColor)

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblColor`
25. Set properties:

| Property | Value |
|----------|-------|
| Text | `"⬤ " & ThisItem.Color.Value` |
| X | `12` |
| Y | `75` |
| Width | `150` |
| Height | `20` |
| Size | `10` |
| Color | See formula below |

26. Set **Color** formula (matches the actual color):

**⬇️ FORMULA: Maps color names to display colors**

```powerfx
Switch(
    ThisItem.Color.Value,
    "Black", RGBA(50, 50, 50, 1),
    "White", RGBA(180, 180, 180, 1),
    "Gray", RGBA(128, 128, 128, 1),
    "Red", RGBA(200, 50, 50, 1),
    "Green", RGBA(50, 150, 50, 1),
    "Blue", RGBA(50, 100, 200, 1),
    "Yellow", RGBA(218, 165, 32, 1),
    "Dark Yellow", RGBA(184, 134, 11, 1),
    "Any", RGBA(150, 150, 150, 1),
    RGBA(100, 100, 100, 1)
)
```

> 💡 **Note:** Uses `ThisItem.Color.Value` because Color is a Choice field in SharePoint.

---

### Staff Notes Section (lblStaffNotesHeader + txtStaffNotes)

27. Click **+ Insert** → **Text label**.
28. **Rename it:** `lblStaffNotesHeader`
29. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Staff Notes"` |
| X | `12` |
| Y | `100` |
| Width | `100` |
| Height | `20` |
| Font | `Font.'Segoe UI Semibold'` |
| Size | `11` |
| Color | `RGBA(80, 80, 80, 1)` |

30. Click **+ Insert** → **Text label**.
31. **Rename it:** `lblStaffNotesPlaceholder`
32. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(IsBlank(ThisItem.StaffNotes), "No notes added yet — click to add", ThisItem.StaffNotes)` |
| X | `12` |
| Y | `118` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `40` |
| Size | `10` |
| Color | `If(IsBlank(ThisItem.StaffNotes), RGBA(150, 150, 150, 1), RGBA(80, 80, 80, 1))` |
| FontItalic | `IsBlank(ThisItem.StaffNotes)` |

---

### Additional Details Section (Expandable)

33. Click **+ Insert** → **Text label**.
34. **Rename it:** `lblDetailsHeader`
35. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Additional Details"` |
| X | `12` |
| Y | `165` |
| Width | `150` |
| Height | `20` |
| Font | `Font.'Segoe UI Semibold'` |
| Size | `11` |
| Color | `RGBA(80, 80, 80, 1)` |
| Visible | `Or(ThisItem.ID in colExpanded.ID, varExpandAll)` |

36. Add detail labels (all with `Visible: ThisItem.Expanded || varExpandAll`):

**Job ID Label:**
| Property | Value |
|----------|-------|
| Text | `"Job ID:"` |
| X | `12` |
| Y | `185` |
| Size | `10` |
| Color | `RGBA(120, 120, 120, 1)` |

**Job ID Value:**
| Property | Value |
|----------|-------|
| Text | `ThisItem.ReqKey` |
| X | `80` |
| Y | `185` |
| Size | `10` |
| Color | `RGBA(50, 50, 50, 1)` |

**Created Label:**
| Property | Value |
|----------|-------|
| Text | `"Created:"` |
| X | `Parent.TemplateWidth / 2` |
| Y | `185` |
| Size | `10` |

**Created Value:**
| Property | Value |
|----------|-------|
| Text | `Text(ThisItem.Created, "mmm dd, yyyy, hh:mm AM/PM")` |
| X | `Parent.TemplateWidth / 2 + 55` |
| Y | `185` |
| Size | `10` |

**Discipline & Class Labels:** (similar pattern at Y = 205)

---

### Messages Section (Expandable Conversation View)

This section shows message history between staff and students for each request, with visual distinction between outbound (staff) and inbound (student) messages.

> **Prerequisites:** 
> - Complete Step 16 (Message Modal) first
> - Ensure `RequestComments` list is connected with Direction column (see `SharePoint/RequestComments-List-Setup.md`)

37. Click **+ Insert** → **Text label**.
38. **Rename it:** `lblMessagesHeader`
39. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Messages (" & CountRows(Filter(RequestComments, RequestID = ThisItem.ID)) & ")"` |
| X | `12` |
| Y | `230` |
| Width | `200` |
| Height | `20` |
| Font | `Font.'Segoe UI Semibold'` |
| Size | `11` |
| Color | `RGBA(80, 80, 80, 1)` |
| Visible | `Or(ThisItem.ID in colExpanded.ID, varExpandAll)` |

40. Click **+ Insert** → **Blank vertical gallery**.
41. **Rename it:** `galMessages`
42. Set properties:

| Property | Value |
|----------|-------|
| Items | `Sort(Filter(RequestComments, RequestID = ThisItem.ID), SentAt, SortOrder.Descending)` |
| X | `12` |
| Y | `250` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `120` |
| TemplateSize | `70` |
| TemplatePadding | `2` |
| Visible | `Or(ThisItem.ID in colExpanded.ID, varExpandAll)` |
| ShowScrollbar | `true` |

> **Note:** TemplateSize increased to 70 to accommodate Direction indicator.

43. Inside `galMessages`, add a **Rectangle** for message background:
    - **Name:** `recMessageBg`
    - **X:** `If(ThisItem.Direction.Value = "Outbound", Parent.TemplateWidth * 0.3, 0)`
    - **Y:** `0`
    - **Width:** `Parent.TemplateWidth * 0.7 - 10`
    - **Height:** `Parent.TemplateHeight - 4`
    - **Fill:** `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 0.1), RGBA(255, 248, 230, 1))`
    - **BorderRadius:** `8`

> **Direction-based styling:**
> - **Outbound (staff → student):** Blue tint, aligned right
> - **Inbound (student → staff):** Warm yellow tint, aligned left

44. Add direction indicator icon:
    - **Name:** `icoMsgDirection`
    - **Icon:** `If(ThisItem.Direction.Value = "Outbound", Icon.Send, Icon.Mail)`
    - **X:** `recMessageBg.X + 8`
    - **Y:** `4`
    - **Width:** `14`
    - **Height:** `14`
    - **Color:** `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(200, 150, 50, 1))`

45. Add message author label:
    - **Name:** `lblMsgAuthor`
    - **Text:** `ThisItem.Author.DisplayName & " • " & Text(ThisItem.SentAt, "mmm dd, h:mm AM/PM")`
    - **X:** `recMessageBg.X + 26`
    - **Y:** `4`
    - **Size:** `9`
    - **Color:** `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(180, 130, 40, 1))`
    - **FontItalic:** `false`
    - **Font:** `Font.'Segoe UI Semibold'`

46. Add direction badge label:
    - **Name:** `lblMsgDirectionBadge`
    - **Text:** `If(ThisItem.Direction.Value = "Outbound", "SENT", "REPLY")`
    - **X:** `recMessageBg.X + recMessageBg.Width - 50`
    - **Y:** `4`
    - **Width:** `40`
    - **Height:** `14`
    - **Size:** `8`
    - **Align:** `Align.Right`
    - **Color:** `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(180, 130, 40, 1))`
    - **FontItalic:** `true`

47. Add message content label:
    - **Name:** `lblMsgContent`
    - **Text:** `If(Len(ThisItem.Message) > 100, Left(ThisItem.Message, 100) & "...", ThisItem.Message)`
    - **X:** `recMessageBg.X + 8`
    - **Y:** `22`
    - **Width:** `recMessageBg.Width - 16`
    - **Height:** `40`
    - **Size:** `10`
    - **Color:** `RGBA(50, 50, 50, 1)`

48. Add "No messages" placeholder (outside galMessages but same visibility):
    - **Name:** `lblNoMessages`
    - **Text:** `"No messages yet"`
    - **X:** `12`
    - **Y:** `260`
    - **Color:** `RGBA(150, 150, 150, 1)`
    - **FontItalic:** `true`
    - **Size:** `10`
    - **Visible:** `(ThisItem.Expanded || varExpandAll) && CountRows(Filter(RequestComments, RequestID = ThisItem.ID)) = 0`

49. Add unread badge for inbound (student) messages:
    - **Name:** `lblUnreadBadge`
    - **Text:** `Text(CountRows(Filter(RequestComments, RequestID = ThisItem.ID && Direction.Value = "Inbound" && ReadByStaff = false)))`
    - **X:** `120`
    - **Y:** `228`
    - **Width:** `20`
    - **Height:** `20`
    - **Fill:** `RGBA(209, 52, 56, 1)`
    - **Color:** `Color.White`
    - **Align:** `Align.Center`
    - **BorderRadius:** `10`
    - **Visible:** `(ThisItem.Expanded || varExpandAll) && CountRows(Filter(RequestComments, RequestID = ThisItem.ID && Direction.Value = "Inbound" && ReadByStaff = false)) > 0`

> **Note:** The unread badge now filters on `Direction.Value = "Inbound"` instead of `AuthorRole.Value = "Student"` for consistency with the new schema.

---

### ✅ Step 7 Checklist

Your gallery template should now contain these controls:

```
▼ galJobCards
    recCardBackground
    icoLightbulb
    lblStudentName
    lblSubmittedTime
    lblReqKey
    lblStudentEmail
    lblPrinter
    lblColor
    lblStaffNotesHeader
    lblStaffNotesPlaceholder
    lblDetailsHeader (and detail labels)
```

Each card displays:
- Student name + submission time
- File/request info
- Email and printer
- Color indicator
- Staff notes section
- Expandable additional details

---

# STEP 8: Adding Expandable Details

**What you're doing:** Adding the expand/collapse icon and making the Additional Details section toggle.

### Instructions

Still inside the `galJobCards` gallery template:

### Expand/Collapse Icon (icoExpandCollapse)

1. Click **+ Insert** → **Icon** → select **ChevronDown**.
2. **Rename it:** `icoExpandCollapse`
3. Set properties:

| Property | Value |
|----------|-------|
| Icon | `If(Or(ThisItem.ID in colExpanded.ID, varExpandAll), Icon.ChevronUp, Icon.ChevronDown)` |
| X | `Parent.TemplateWidth / 2 - 12` |
| Y | `Parent.TemplateHeight - 35` |
| Width | `24` |
| Height | `24` |
| Color | `RGBA(150, 150, 150, 1)` |

4. Set **OnSelect:**

```powerfx
With(
    {isCurrentlyExpanded: ThisItem.ID in colExpanded.ID},
    If(
        isCurrentlyExpanded,
        RemoveIf(colExpanded, ID = ThisItem.ID),
        Collect(colExpanded, {ID: ThisItem.ID})
    )
)
```

> 💡 This toggles the card's expanded state using a local collection (no SharePoint updates needed for UI state). The `With()` function captures the current state before modifying the collection, ensuring correct toggle behavior.

---

# STEP 9: Implementing Action Buttons

**What you're doing:** Adding the Approve, Reject, and Archive buttons to each job card.

### Understanding the Person Record

Before adding buttons, you need to understand how to update Person fields in SharePoint. Power Apps requires a specific format.

### Setting Up varActor

First, let's ensure varActor is set up. We'll create it on the screen's OnVisible event.

1. Click on **scrDashboard** in Tree view.
2. Set the **OnVisible** property:

**⬇️ FORMULA: Paste into scrDashboard.OnVisible**

```powerfx
Set(varActor,
{
  '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
  Claims: "i:0#.f|membership|" & varMeEmail,
  DisplayName: varMeName,
  Email: varMeEmail
    }
)
```

### Adding Action Buttons to Job Cards

Go back inside `galJobCards` gallery template. We'll place buttons at the **bottom** of each card.

> 💡 **Button Layout:** Three buttons in a row at the bottom of the card. Different buttons appear based on status.

### Approve Button (btnApprove)

1. Click **+ Insert** → **Button**.
2. **Rename it:** `btnApprove`
3. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Approve"` |
| X | `12` |
| Y | `Parent.TemplateHeight - 50` |
| Width | `(Parent.TemplateWidth - 40) / 3` |
| Height | `32` |
| Fill | `Color.White` |
| Color | `RGBA(16, 124, 16, 1)` |
| BorderColor | `RGBA(16, 124, 16, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Visible | `ThisItem.Status.Value = "Uploaded"` |

4. Set **OnSelect:**

```powerfx
Set(varShowApprovalModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

### Reject Button (btnReject)

5. Click **+ Insert** → **Button**.
6. **Rename it:** `btnReject`
7. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✗ Reject"` |
| X | `12 + (Parent.TemplateWidth - 40) / 3 + 4` |
| Y | `Parent.TemplateHeight - 50` |
| Width | `(Parent.TemplateWidth - 40) / 3` |
| Height | `32` |
| Fill | `Color.White` |
| Color | `RGBA(209, 52, 56, 1)` |
| BorderColor | `RGBA(209, 52, 56, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Visible | `Or(ThisItem.Status.Value = "Uploaded", ThisItem.Status.Value = "Pending")` |

8. Set **OnSelect:**

```powerfx
Set(varShowRejectModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

### Archive Button (btnArchive)

9. Click **+ Insert** → **Button**.
10. **Rename it:** `btnArchive`
11. Set properties:

| Property | Value |
|----------|-------|
| Text | `"📦 Archive"` |
| X | `12 + 2 * ((Parent.TemplateWidth - 40) / 3 + 4)` |
| Y | `Parent.TemplateHeight - 50` |
| Width | `(Parent.TemplateWidth - 40) / 3` |
| Height | `32` |
| Fill | `Color.White` |
| Color | `RGBA(255, 140, 0, 1)` |
| BorderColor | `RGBA(255, 140, 0, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Visible | `ThisItem.Status.Value in ["Completed", "Paid & Picked Up", "Rejected"]` |

12. Set **OnSelect:**

```powerfx
Set(varShowArchiveModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

### Start Printing Button (btnStartPrint)

13. Click **+ Insert** → **Button**.
14. **Rename it:** `btnStartPrint`
15. Set properties:

| Property | Value |
|----------|-------|
| Text | `"🖨️ Start Print"` |
| X | `12` |
| Y | `Parent.TemplateHeight - 50` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `32` |
| Fill | `RGBA(107, 105, 214, 1)` |
| Color | `Color.White` |
| Visible | `ThisItem.Status.Value = "Ready to Print"` |

16. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {
    Status: "Printing",
    LastAction: "Printing",
    LastActionBy: varActor,
    LastActionAt: Now()
});

'Flow C (PR-Action)'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Printing",
    varMeEmail,
    "Power Apps",
    "Started printing"
);

Notify("Print started!", NotificationType.Success)
```

### Complete Printing Button

10. Add button:
   - **Text:** `"✓ Complete"`
   - **Visible:** `ThisItem.Status = "Printing"`
   - **Fill:** `RGBA(0, 78, 140, 1)`

11. Set **OnSelect:**

```powerfx
    Patch(PrintRequests, ThisItem, {
    Status: "Completed",
    LastAction: "Completed",
        LastActionBy: varActor,
        LastActionAt: Now()
    });

'Flow C (PR-Action)'.Run(
        Text(ThisItem.ID),
        "Status Change",
        "Status",
        ThisItem.Status,
    "Completed",
        varMeEmail,
        "Power Apps",
    "Print completed - ready for pickup"
);

Notify("Marked as completed!", NotificationType.Success)
```

### Picked Up Button

12. Add button:
   - **Text:** `"💰 Picked Up"`
   - **Visible:** `ThisItem.Status = "Completed"`
   - **Fill:** `RGBA(0, 158, 73, 1)`

13. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {
    Status: "Paid & Picked Up",
    LastAction: "Picked Up",
    LastActionBy: varActor,
    LastActionAt: Now()
});

'Flow C (PR-Action)'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    ThisItem.Status,
    "Paid & Picked Up",
    varMeEmail,
    "Power Apps",
    "Student picked up and paid"
);

Notify("Marked as picked up!", NotificationType.Success)
```

---

# STEP 10: Building the Rejection Modal

**What you're doing:** Creating a popup dialog that appears when staff click "Reject" to capture rejection reasons.

### Instructions

Build this on **scrDashboard**, outside of the gallery (at the screen level).

### Modal Overlay (Dark Background)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. Rename to `recRejectOverlay`.
4. Set properties:
   - **X:** `0`
   - **Y:** `0`
   - **Width:** `1366`
   - **Height:** `768`
   - **Fill:** `RGBA(0, 0, 0, 0.7)`
   - **Visible:** `varShowRejectModal > 0`

### Modal Content Box

5. Add another **Rectangle**.
6. Rename to `recRejectModal`.
7. Set properties:
   - **X:** `(Parent.Width - 600) / 2`
   - **Y:** `(Parent.Height - 550) / 2`
   - **Width:** `600`
   - **Height:** `550`
   - **Fill:** `Color.White`
   - **BorderRadius:** `8` (all corners)
   - **Visible:** `varShowRejectModal > 0`

### Modal Title

8. Add **Text label**:
   - **Text:** `"Reject Request - " & varSelectedItem.ReqKey`
   - **X:** `recRejectModal.X + 20`
   - **Y:** `recRejectModal.Y + 20`
   - **Font:** `Font.'Segoe UI Semibold'`
   - **Size:** `20`
   - **Color:** `RGBA(209, 52, 56, 1)`
   - **Visible:** `varShowRejectModal > 0`

### Student Info

9. Add label:
   - **Text:** `"Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"`
   - **X:** `recRejectModal.X + 20`
   - **Y:** `recRejectModal.Y + 55`
   - **Visible:** `varShowRejectModal > 0`

### Staff Attribution Dropdown

10. Add **Text label**:
   - **Text:** `"Performing Action As: *"`
   - **X:** `recRejectModal.X + 20`
   - **Y:** `recRejectModal.Y + 90`
   - **Font:** `Font.'Segoe UI Semibold'`
   - **Visible:** `varShowRejectModal > 0`

11. Click **+ Insert** → **Combo box** (or Dropdown).
12. Rename to `ddRejectStaff`.
13. Set properties:
   - **Items:** `colStaff`
   - **X:** `recRejectModal.X + 20`
   - **Y:** `recRejectModal.Y + 115`
   - **Width:** `300`
   - **DisplayFields:** `["Member"]`
   - **SearchFields:** `["Member"]`
   - **DefaultSelectedItems:** `Filter(colStaff, Lower(Member.Email) = varMeEmail)`
   - **Visible:** `varShowRejectModal > 0`

### Rejection Reasons Checkboxes

14. Add label: `"Rejection Reasons (select all that apply):"`

15. Add **Checkbox** controls for each reason. For each:
   - Name them: `chkIncomplete`, `chkSafety`, `chkDetail`, `chkCopyright`, `chkComplexity`
   - Set **Visible:** `varShowRejectModal > 0`

| Checkbox Name | Text Property |
|--------------|---------------|
| chkIncomplete | `"Incomplete project description"` |
| chkSafety | `"Safety concerns with design"` |
| chkDetail | `"Insufficient detail/resolution"` |
| chkCopyright | `"Copyright/IP concerns"` |
| chkComplexity | `"Too complex for equipment"` |

Position them vertically starting at `recRejectModal.Y + 170` with 30px spacing.

### Custom Comments

16. Add label: `"Additional Comments (optional):"`
17. Add **Text input**:
   - Rename to `txtRejectComments`
   - **Mode:** `TextMode.MultiLine`
   - **HintText:** `"Provide specific feedback..."`
   - **Width:** `540`
   - **Height:** `80`
   - **Visible:** `varShowRejectModal > 0`

### Cancel Button

18. Add **Button**:
   - **Text:** `"Cancel"`
   - **X:** `recRejectModal.X + 300`
   - **Y:** `recRejectModal.Y + 490`
   - **Width:** `120`
   - **Fill:** `RGBA(150, 150, 150, 1)`
   - **Visible:** `varShowRejectModal > 0`

19. Set **OnSelect:**

```powerfx
Set(varShowRejectModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtRejectComments);
Reset(ddRejectStaff);
Reset(chkIncomplete);
Reset(chkSafety);
Reset(chkDetail);
Reset(chkCopyright);
Reset(chkComplexity)
```

### Confirm Rejection Button

20. Add **Button**:
   - **Text:** `"✗ Confirm Rejection"`
   - **X:** `recRejectModal.X + 430`
   - **Y:** `recRejectModal.Y + 490`
   - **Width:** `150`
   - **Fill:** `RGBA(209, 52, 56, 1)`
   - **Color:** `Color.White`
   - **Visible:** `varShowRejectModal > 0`

21. Set **DisplayMode:**

```powerfx
If(IsBlank(ddRejectStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)
```

22. Set **OnSelect:**

**⬇️ FORMULA: Complete rejection logic with audit logging**

```powerfx
// Build rejection reasons string
Set(varRejectionReasons, 
    If(chkIncomplete.Value, "Incomplete description; ", "") &
    If(chkSafety.Value, "Safety concerns; ", "") &
    If(chkDetail.Value, "Insufficient detail; ", "") &
    If(chkCopyright.Value, "Copyright concerns; ", "") &
    If(chkComplexity.Value, "Too complex; ", "")
);

// Update the SharePoint item
Patch(PrintRequests, varSelectedItem, {
    Status: "Rejected",
    NeedsAttention: false,
    LastAction: "Rejected",
    LastActionBy: {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & ddRejectStaff.Selected.Member.Email,
        DisplayName: ddRejectStaff.Selected.Member.DisplayName,
        Email: ddRejectStaff.Selected.Member.Email
    },
    LastActionAt: Now(),
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "REJECTED by " & ddRejectStaff.Selected.Member.DisplayName & ": " & 
        varRejectionReasons & txtRejectComments.Text & " - " & Text(Now(), "mm/dd/yyyy")
    )
});

// Log to AuditLog via Flow C
IfError(
    'Flow C (PR-Action)'.Run(
        Text(varSelectedItem.ID),
        "Rejected",
        "Status",
        varSelectedItem.Status,
        "Rejected",
        ddRejectStaff.Selected.Member.Email,
        "Power Apps",
        "Rejected: " & varRejectionReasons & txtRejectComments.Text
    ),
    Notify("Could not log rejection.", NotificationType.Error),
    Notify("Request rejected. Student will be notified.", NotificationType.Success)
);

// Close modal and reset
Set(varShowRejectModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtRejectComments);
Reset(ddRejectStaff);
Reset(chkIncomplete);
Reset(chkSafety);
Reset(chkDetail);
Reset(chkCopyright);
Reset(chkComplexity)
```

---

# STEP 11: Building the Approval Modal

**What you're doing:** Creating a dialog for staff to enter weight/time estimates before approving a request.

### Instructions

Similar to the rejection modal, build on scrDashboard:

### Modal Overlay

1. Add **Rectangle** named `recApprovalOverlay`:
   - Same size as screen, `Fill: RGBA(0, 0, 0, 0.7)`
   - **Visible:** `varShowApprovalModal > 0`

### Modal Content Box

2. Add **Rectangle** named `recApprovalModal`:
   - **Width:** `600`, **Height:** `650`
   - Centered like the reject modal
   - **Visible:** `varShowApprovalModal > 0`

### Modal Title

3. Add label:
   - **Text:** `"Approve Request - " & varSelectedItem.ReqKey`
   - **Color:** `RGBA(16, 124, 16, 1)` (green)

### Staff Dropdown

4. Add **Combo box** named `ddApprovalStaff`:
   - Same setup as rejection modal

### Estimated Weight Input

5. Add label: `"Estimated Weight (grams): *"`
6. Add **Text input** named `txtEstimatedWeight`:
   - **Format:** `TextFormat.Number`
   - **HintText:** `"Enter weight in grams (e.g., 25)"`
   - **Width:** `200`
   - **Visible:** `varShowApprovalModal > 0`

7. Add validation label:
   - **Text:**

```powerfx
If(
    IsBlank(txtEstimatedWeight.Text), 
    "Weight is required",
    !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0,
    "Enter a valid weight > 0",
    ""
)
```
   - **Color:** `RGBA(209, 52, 56, 1)`
   - **Visible:** `varShowApprovalModal > 0 && (IsBlank(txtEstimatedWeight.Text) || !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0)`

### Estimated Time Input (Optional)

8. Add label: `"Estimated Print Time (hours): (Optional)"`
9. Add **Text input** named `txtEstimatedTime`:
   - Same setup but optional

### Cost Calculation Display

10. Add label: `"Estimated Cost:"`
11. Add label for the calculated cost:

**⬇️ FORMULA: Auto-calculates cost based on weight and method**

```powerfx
If(
    IsNumeric(txtEstimatedWeight.Text) && Value(txtEstimatedWeight.Text) > 0,
    "$" & Text(
        Max(
            3.00,
            Value(txtEstimatedWeight.Text) * If(
                varSelectedItem.Method = "Resin",
                0.20,
                0.10
            )
        ),
        "[$-en-US]#,##0.00"
    ),
    "$3.00 (minimum)"
)
```

12. Style this label with green color and larger font.

### Comments Input

13. Add **Text input** named `txtApprovalComments`:
   - **Mode:** `TextMode.MultiLine`
   - **HintText:** `"Add any special instructions..."`

### Cancel Button

14. Same pattern as rejection modal

### Confirm Approval Button

15. Add **Button**:
   - **Text:** `"✓ Confirm Approval"`
   - **Fill:** `RGBA(16, 124, 16, 1)`
   - **Color:** `Color.White`

16. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddApprovalStaff.Selected) && 
    !IsBlank(txtEstimatedWeight.Text) && 
    IsNumeric(txtEstimatedWeight.Text) && 
    Value(txtEstimatedWeight.Text) > 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

17. Set **OnSelect:**

**⬇️ FORMULA: Complete approval logic with cost calculation**

```powerfx
// Calculate cost
Set(varCalculatedCost, 
    Max(
        3.00,
        Value(txtEstimatedWeight.Text) * If(
            varSelectedItem.Method = "Resin",
            0.20,
            0.10
        )
    )
);

// Update SharePoint item
// ⚠️ IMPORTANT: Use internal column names (EstWeight, EstHours) not display names
Patch(PrintRequests, varSelectedItem, {
    Status: "Pending",
    NeedsAttention: false,
    LastAction: "Approved",
    LastActionBy: {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & ddApprovalStaff.Selected.Member.Email,
        DisplayName: ddApprovalStaff.Selected.Member.DisplayName,
        Email: ddApprovalStaff.Selected.Member.Email
    },
    LastActionAt: Now(),
    EstWeight: Value(txtEstimatedWeight.Text),           // Internal name (not EstimatedWeight)
    EstHours: If(IsNumeric(txtEstimatedTime.Text), Value(txtEstimatedTime.Text), Blank()),  // Internal name (not EstimatedTime)
    EstimatedCost: varCalculatedCost,
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "APPROVED by " & ddApprovalStaff.Selected.Member.DisplayName &
        ": Weight=" & txtEstimatedWeight.Text & "g, Cost=$" & Text(varCalculatedCost, "[$-en-US]#,##0.00") &
        If(!IsBlank(txtApprovalComments.Text), " - " & txtApprovalComments.Text, "") &
        " - " & Text(Now(), "mm/dd/yyyy")
    )
});

// Log action
IfError(
    'Flow C (PR-Action)'.Run(
        Text(varSelectedItem.ID),
        "Approved",
        "Status",
        varSelectedItem.Status,
        "Pending",
        ddApprovalStaff.Selected.Member.Email,
        "Power Apps",
        "Approved - Weight: " & txtEstimatedWeight.Text & "g, Cost: $" & Text(varCalculatedCost, "[$-en-US]#,##0.00")
    ),
    Notify("Could not log approval.", NotificationType.Error),
    Notify("Approved! Student will receive estimate email.", NotificationType.Success)
);

// Close and reset
Set(varShowApprovalModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtEstimatedWeight);
Reset(txtEstimatedTime);
Reset(txtApprovalComments);
Reset(ddApprovalStaff)
```

> 💰 **Pricing:** Filament = $0.10/gram, Resin = $0.20/gram, $3.00 minimum

---

# STEP 12: Building the Archive Modal

**What you're doing:** Creating a confirmation dialog for archiving completed/rejected requests.

### Instructions

Follow the same modal pattern:

### Modal Structure

1. Create `recArchiveOverlay` and `recArchiveModal`
2. **Visible:** `varShowArchiveModal > 0`
3. **Modal size:** 500×450

### Content

4. Title: `"Archive Request - " & varSelectedItem.ReqKey`
5. Warning icon and text: `"This will remove the request from active views."`
6. Staff dropdown: `ddArchiveStaff`
7. Optional reason: `txtArchiveReason`

### Confirm Archive OnSelect

**⬇️ FORMULA: Archive logic**

```powerfx
Patch(PrintRequests, varSelectedItem, {
    Status: "Archived",
    NeedsAttention: false,
    LastAction: "Archived",
    LastActionBy: {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & ddArchiveStaff.Selected.Member.Email,
        DisplayName: ddArchiveStaff.Selected.Member.DisplayName,
        Email: ddArchiveStaff.Selected.Member.Email
    },
    LastActionAt: Now(),
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "ARCHIVED by " & ddArchiveStaff.Selected.Member.DisplayName &
        If(!IsBlank(txtArchiveReason.Text), ": " & txtArchiveReason.Text, "") &
        " - " & Text(Now(), "mm/dd/yyyy")
    )
});

IfError(
    'Flow C (PR-Action)'.Run(
        Text(varSelectedItem.ID),
        "Archived",
        "Status",
        varSelectedItem.Status,
        "Archived",
        ddArchiveStaff.Selected.Member.Email,
        "Power Apps",
        If(!IsBlank(txtArchiveReason.Text), "Reason: " & txtArchiveReason.Text, "")
    ),
    Notify("Could not log archive.", NotificationType.Error),
    Notify("Request archived.", NotificationType.Success)
);

Set(varShowArchiveModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtArchiveReason);
Reset(ddArchiveStaff)
```

---

# STEP 12B: Building the Change Print Details Modal

**What you're doing:** Creating a modal that allows staff to change printer and/or color for a job. All changes are optional — staff can update one, both, or neither field.

> 💡 **Why this matters:** Provides flexibility while still preventing printer/method mismatches via filtered dropdown.

### Instructions

### Modal Overlay and Box

1. Create `recDetailsOverlay` and `recDetailsModal` following the same pattern as previous modals.
2. **Visible:** `varShowDetailsModal > 0`
3. **Modal size:** 500×520

### Modal Title

4. Add label `lblDetailsTitle`:
   - **Text:** `"Change Print Details - " & varSelectedItem.ReqKey`
   - **Color:** `RGBA(0, 120, 212, 1)` (blue)

### Current Settings Display

5. Add label `lblDetailsCurrentLabel`:
   - **Text:** `"Current Settings:"`

6. Add label `lblDetailsCurrent`:
   - **Text:**

```powerfx
"Method: " & varSelectedItem.Method.Value & "  |  Printer: " & varSelectedItem.Printer.Value & "  |  Color: " & varSelectedItem.Color.Value
```

   - **Font:** `Font.'Segoe UI Semibold'`
   - **Color:** `RGBA(80, 80, 80, 1)`

### Staff Dropdown

7. Add **Combo box** named `ddDetailsStaff`:
   - Same setup as other modals (Items = colStaff, etc.)

### Printer Dropdown (METHOD-FILTERED, OPTIONAL)

8. Add label: `"Printer: (leave blank to keep current)"`

9. Add **Combo box** named `ddDetailsPrinter`:
   - **Width:** `350`
   - **Height:** `40`

10. Set **Items** property (filtered by Method):

**⬇️ FORMULA: Filters printers based on job's Method**

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        // Filament jobs → show only FDM printers
        varSelectedItem.Method.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        // Resin jobs → show only resin printers
        varSelectedItem.Method.Value = "Resin",
        Value = "Form 3 (5.7×5.7×7.3in)",
        // Fallback: show all
        true
    )
)
```

11. Set **DisplayFields:** `["Value"]`
12. Set **SelectMultiple:** `false`
13. Set **AllowEmptySelection:** `true`

### Color Dropdown (OPTIONAL)

14. Add label: `"Color: (leave blank to keep current)"`

15. Add **Combo box** named `ddDetailsColor`:
   - **Width:** `350`
   - **Height:** `40`

16. Set **Items:**

```powerfx
Choices([@PrintRequests].Color)
```

17. Set **DisplayFields:** `["Value"]`
18. Set **SelectMultiple:** `false`
19. Set **AllowEmptySelection:** `true`

### Cancel Button

20. Add cancel button `btnDetailsCancel`:
   - **Text:** `"Cancel"`
   - **OnSelect:** `Set(varShowDetailsModal, 0); Reset(ddDetailsPrinter); Reset(ddDetailsColor); Reset(ddDetailsStaff)`

### Save Changes Button

21. Add **Button** `btnDetailsConfirm`:
   - **Text:** `"✓ Save Changes"`
   - **Fill:** `RGBA(0, 120, 212, 1)` (blue)
   - **Color:** `Color.White`

22. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddDetailsStaff.Selected) && 
    (
        // At least one field must be changed
        (!IsBlank(ddDetailsPrinter.Selected) && ddDetailsPrinter.Selected.Value <> varSelectedItem.Printer.Value) ||
        (!IsBlank(ddDetailsColor.Selected) && ddDetailsColor.Selected.Value <> varSelectedItem.Color.Value)
    ),
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

> 💡 Button is enabled only when staff is selected AND at least one field is being changed.

23. Set **OnSelect:**

**⬇️ FORMULA: Complete change logic with audit logging**

```powerfx
// Build change description for audit
Set(varChangeDesc, "");

// Track what changed
If(!IsBlank(ddDetailsPrinter.Selected) && ddDetailsPrinter.Selected.Value <> varSelectedItem.Printer.Value,
    Set(varChangeDesc, "Printer: " & varSelectedItem.Printer.Value & " → " & ddDetailsPrinter.Selected.Value)
);
If(!IsBlank(ddDetailsColor.Selected) && ddDetailsColor.Selected.Value <> varSelectedItem.Color.Value,
    Set(varChangeDesc, 
        If(IsBlank(varChangeDesc), "", varChangeDesc & " | ") & 
        "Color: " & varSelectedItem.Color.Value & " → " & ddDetailsColor.Selected.Value
    )
);

// Update SharePoint item (only changed fields)
Patch(
    PrintRequests,
    varSelectedItem,
    {
        Printer: If(!IsBlank(ddDetailsPrinter.Selected), ddDetailsPrinter.Selected, varSelectedItem.Printer),
        Color: If(!IsBlank(ddDetailsColor.Selected), ddDetailsColor.Selected, varSelectedItem.Color),
        LastAction: "Details Changed: " & varChangeDesc,
        LastActionBy: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & Lower(LookUp(colStaff, DisplayName = ddDetailsStaff.Selected.DisplayName).Email),
            DisplayName: ddDetailsStaff.Selected.DisplayName,
            Email: LookUp(colStaff, DisplayName = ddDetailsStaff.Selected.DisplayName).Email
        },
        LastActionAt: Now()
    }
);

// Log to audit via Flow C
'PR-Action'.Run(
    varSelectedItem.ID,
    "Details Changed",
    ddDetailsStaff.Selected.DisplayName,
    "Power Apps",
    varChangeDesc
);

// Close modal and reset
Set(varShowDetailsModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(ddDetailsPrinter);
Reset(ddDetailsColor);
Reset(ddDetailsStaff);
Notify("Print details updated.", NotificationType.Success)
```

---

### Adding the Change Details Button to Job Cards

Go back to `galJobCards` and add the button:

24. Click **+ Insert** → **Button**.
25. **Rename it:** `btnChangeDetails`
26. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✏️ Details"` |
| X | Position after other action buttons |
| Y | `Parent.TemplateHeight - 50` |
| Width | `90` |
| Height | `32` |
| Fill | `Color.White` |
| Color | `RGBA(0, 120, 212, 1)` |
| BorderColor | `RGBA(0, 120, 212, 1)` |
| BorderThickness | `1` |
| Visible | `ThisItem.Status.Value in ["Uploaded", "Pending", "Ready to Print"]` |

27. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **When visible:** The Details button appears for jobs that haven't started printing yet (Uploaded, Pending, Ready to Print). Once printing starts, details are locked.

---

# STEP 13: Adding Search and Filters

**What you're doing:** Adding a search box and filter controls above the job cards gallery.

### Instructions

### Search Text Input

1. Click **+ Insert** → **Text input**.
2. Rename to `txtSearch`.
3. Set properties:
   - **X:** `20`
   - **Y:** `120`
   - **Width:** `300`
   - **Height:** `40`
   - **HintText:** `"Search by name, email, or ReqKey..."`
   - **OnChange:** `Set(varSearchText, txtSearch.Text)`

### Needs Attention Checkbox

4. Click **+ Insert** → **Checkbox**.
5. Rename to `chkNeedsAttention`.
6. Set properties:
   - **Text:** `"Needs Attention Only"`
   - **X:** `340`
   - **Y:** `125`
   - **OnCheck:** `Set(varNeedsAttention, true)`
   - **OnUncheck:** `Set(varNeedsAttention, false)`

### Expand All Button

7. Add **Button**:
   - **Text:** `If(varExpandAll, "Collapse All", "Expand All")`
   - **X:** `550`
   - **Y:** `120`
   - **Width:** `120`
   - **Height:** `40`
   - **OnSelect:** `Set(varExpandAll, !varExpandAll)`

### Clear Filters Button

8. Add **Button**:
   - **Text:** `"Clear Filters"`
   - **X:** `680`
   - **Y:** `120`
   - **Width:** `100`
   - **Fill:** `RGBA(150, 150, 150, 1)`
   - **OnSelect:**

```powerfx
Reset(txtSearch);
Set(varSearchText, "");
Set(varNeedsAttention, false);
Reset(chkNeedsAttention)
```

---

# STEP 14: Adding the Lightbulb Attention System

**What you're doing:** Adding a toggleable lightbulb icon to each card that marks items as needing attention.

### Instructions

Inside `galJobCards` gallery template:

### Lightbulb Icon

1. Click **+ Insert** → **Icon**.
2. Set **Icon:**

```powerfx
If(ThisItem.NeedsAttention, Icon.Lightbulb, Icon.LightbulbSolid)
```

3. Position in top right corner of card:
   - **X:** `Parent.TemplateWidth - 90`
   - **Y:** `12`
   - **Width:** `28`
   - **Height:** `28`

4. Set **Color:**

```powerfx
If(ThisItem.NeedsAttention, RGBA(255, 215, 0, 1), RGBA(180, 180, 180, 1))
```

5. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {NeedsAttention: !ThisItem.NeedsAttention})
```

6. Set **Tooltip:**

```powerfx
If(ThisItem.NeedsAttention, "Mark as handled", "Mark as needing attention")
```

### Optional: Animated Glow Effect

For a pulsing glow on cards needing attention:

7. Add a **Timer** control to scrDashboard (not in gallery):
   - **Duration:** `1500`
   - **Repeat:** `true`
   - **AutoStart:** `true`
   - **Visible:** `false`
   - Rename to `tmrGlow`

8. Update the card background rectangle's **Fill:**

```powerfx
If(
    ThisItem.NeedsAttention,
    If(
        Mod(tmrGlow.Value, 1500) < 750,
        RGBA(255, 250, 230, 1),
        RGBA(255, 245, 210, 1)
    ),
    Color.White
)
```

### Optional: Sound Notifications

For audible alerts when new jobs arrive or actions are needed:

```powerfx
// Add to App.OnStart
Set(varPlayNotificationSound, false);

// Trigger sound on new job or status change (in relevant OnSelect or Timer)
If(varPlayNotificationSound,
    PlaySound(SoundType.Notification);
    Set(varPlayNotificationSound, false)
)
```

> 💡 **Note:** Sound notifications can be triggered via a Timer that periodically checks for new items, or through Power Automate push notifications.

---

# STEP 15: Adding the Attachments Modal

**What you're doing:** Creating a modal for staff to add/remove file attachments from requests.

### Overview

This uses a Display Form (read-only) and Edit Form (for modifications).

### Variables (Already Added in OnStart)

```powerfx
Set(varShowAddFileModal, false);
Set(varSelectedActor, LookUp(Staff, false));
```

### Add Files Button (In Job Card)

1. Add button in gallery template:
   - **Text:** `"📎 Files"`
   - **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowAddFileModal, true);
Set(varSelectedActor, LookUp(Staff, false))
```

### Modal Overlay

2. Add rectangle `recFileOverlay`:
   - **Visible:** `varShowAddFileModal`
   - Full screen dark overlay

### Modal Content

3. Add rectangle `recFileModal`:
   - **Visible:** `varShowAddFileModal`
   - **Width:** `500`, **Height:** `500`
   - Centered

### Edit Form for Attachments

4. Click **+ Insert** → **Edit form**.
5. Rename to `frmAttachmentsEdit`.
6. Set properties:
   - **DataSource:** `PrintRequests`
   - **Item:** `varSelectedItem`
   - **Visible:** `varShowAddFileModal`

7. In the form's Fields panel, remove all fields except **Attachments**.

### Staff Selector

8. Add combo box `ddFileActor`:
   - **Items:** `colStaff`
   - **DefaultSelectedItems:** `Filter(colStaff, Lower(Member.Email) = varMeEmail)`

9. Set **OnChange:**

```powerfx
Set(varSelectedActor,
    {
        '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: "i:0#.f|membership|" & ddFileActor.Selected.Member.Email,
        DisplayName: ddFileActor.Selected.Member.DisplayName,
        Email: ddFileActor.Selected.Member.Email
    }
)
```

### Save Button

10. Add button:
   - **Text:** `"Save Changes"`
   - **DisplayMode:** `If(IsBlank(varSelectedActor), DisplayMode.Disabled, DisplayMode.Edit)`
   - **OnSelect:** `SubmitForm(frmAttachmentsEdit)`

### Tracking File Changes (Optional Enhancement)

Inside the Attachments data card, you can optionally track what type of change occurred:

```powerfx
// Inside Attachments control - OnAddFile event
Set(varAttachmentChangeType, "Added")

// Inside Attachments control - OnRemoveFile event  
Set(varAttachmentChangeType, "Removed")
```

### Form OnSuccess

11. Set `frmAttachmentsEdit.OnSuccess`:

```powerfx
// Update the record with action tracking
Patch(
    PrintRequests,
    frmAttachmentsEdit.LastSubmit,
    {
        LastAction: If(varAttachmentChangeType = "Removed", "File Removed", "File Added"),
        LastActionBy: varSelectedActor,
        LastActionAt: Now()
    }
);

// Optional: Log to AuditLog via Flow C for detailed tracking
IfError(
    'Flow C (PR-Action)'.Run(
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
Set(varAttachmentChangeType, "");
Set(varAttachmentChangedName, "");
Notify("Attachments updated", NotificationType.Success)
```

> 💡 **Note:** The existing Flow B (PR-Audit) automatically logs file additions when they're detected. The explicit Flow C call above is optional but provides more granular control over audit entries.

### Cancel Button

12. Add button:
   - **OnSelect:** `Set(varShowAddFileModal, false); Set(varSelectedItem, LookUp(PrintRequests, false))`

---

# STEP 16: Adding the Message Modal

**What you're doing:** Creating a modal for staff to send messages to students about their print requests without leaving the dashboard.

### Overview

This modal allows bi-directional communication between staff and students. Messages are stored in a separate SharePoint list (`RequestComments`) and trigger email notifications to students.

### Prerequisites

Before building this modal:
- [ ] Create the `RequestComments` SharePoint list (see `SharePoint/RequestComments-List-Setup.md`)
- [ ] Add `RequestComments` as a data connection in Power Apps

### Adding the Data Connection

1. In the left panel, click the **Data** icon (cylinder).
2. Click **+ Add data** → **SharePoint**.
3. Select your site and check **RequestComments**.
4. Click **Connect**.

### Adding Variables to App.OnStart

Add these variables to your existing `App.OnStart`:

```powerfx
// === MESSAGE MODAL CONTROLS ===
Set(varShowMessageModal, false);
Set(varMessageSubject, "");
Set(varMessageText, "");
```

### Controls to Create

```
├── MESSAGE MODAL ─────────────────────────────────────────
│   recMessageOverlay               ← Dark semi-transparent overlay
│   recMessageModal                 ← White modal box
│   lblMessageTitle                 ← "Send Message - REQ-00001"
│   lblMessageStudent               ← Student info display
│   lblMessageStaffLabel            ← "Performing Action As:"
│   ddMessageStaff                  ← Staff dropdown
│   lblMessageSubjectLabel          ← "Subject:"
│   txtMessageSubject               ← Subject input
│   lblMessageBodyLabel             ← "Message:"
│   txtMessageBody                  ← Message text input (multiline)
│   lblMessageCount                 ← Character count display
│   btnMessageCancel                ← "Cancel" button
│   btnMessageSend                  ← "Send Message" button
```

### Building the Modal

#### Modal Overlay

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. Rename to `recMessageOverlay`.
4. Set properties:
   - **X:** `0`
   - **Y:** `0`
   - **Width:** `1366`
   - **Height:** `768`
   - **Fill:** `RGBA(0, 0, 0, 0.7)`
   - **Visible:** `varShowMessageModal`

#### Modal Content Box

5. Add another **Rectangle**.
6. Rename to `recMessageModal`.
7. Set properties:
   - **X:** `(Parent.Width - 600) / 2`
   - **Y:** `(Parent.Height - 500) / 2`
   - **Width:** `600`
   - **Height:** `500`
   - **Fill:** `Color.White`
   - **BorderRadius:** `8` (all corners)
   - **Visible:** `varShowMessageModal`

#### Modal Title

8. Add **Text label**:
   - **Name:** `lblMessageTitle`
   - **Text:** `"Send Message - " & varSelectedItem.ReqKey`
   - **X:** `recMessageModal.X + 20`
   - **Y:** `recMessageModal.Y + 20`
   - **Font:** `Font.'Segoe UI Semibold'`
   - **Size:** `20`
   - **Color:** `RGBA(70, 130, 220, 1)`
   - **Visible:** `varShowMessageModal`

#### Student Info

9. Add label:
   - **Name:** `lblMessageStudent`
   - **Text:** `"To: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"`
   - **X:** `recMessageModal.X + 20`
   - **Y:** `recMessageModal.Y + 55`
   - **Visible:** `varShowMessageModal`

#### Staff Attribution Dropdown

10. Add **Text label**:
    - **Text:** `"Performing Action As: *"`
    - **X:** `recMessageModal.X + 20`
    - **Y:** `recMessageModal.Y + 90`
    - **Font:** `Font.'Segoe UI Semibold'`
    - **Visible:** `varShowMessageModal`

11. Click **+ Insert** → **Combo box**.
12. Rename to `ddMessageStaff`.
13. Set properties:
    - **Items:** `colStaff`
    - **X:** `recMessageModal.X + 20`
    - **Y:** `recMessageModal.Y + 115`
    - **Width:** `300`
    - **DisplayFields:** `["Member"]`
    - **SearchFields:** `["Member"]`
    - **DefaultSelectedItems:** `Filter(colStaff, Lower(Member.Email) = varMeEmail)`
    - **Visible:** `varShowMessageModal`

#### Subject Input

14. Add **Text label**:
    - **Text:** `"Subject:"`
    - **X:** `recMessageModal.X + 20`
    - **Y:** `recMessageModal.Y + 165`
    - **Font:** `Font.'Segoe UI Semibold'`
    - **Visible:** `varShowMessageModal`

15. Click **+ Insert** → **Text input**.
16. Rename to `txtMessageSubject`.
17. Set properties:
    - **X:** `recMessageModal.X + 20`
    - **Y:** `recMessageModal.Y + 190`
    - **Width:** `540`
    - **Height:** `40`
    - **HintText:** `"Brief subject (e.g., Question about your file)"`
    - **Default:** `""`
    - **Visible:** `varShowMessageModal`

#### Message Body Input

18. Add **Text label**:
    - **Text:** `"Message:"`
    - **X:** `recMessageModal.X + 20`
    - **Y:** `recMessageModal.Y + 240`
    - **Font:** `Font.'Segoe UI Semibold'`
    - **Visible:** `varShowMessageModal`

19. Click **+ Insert** → **Text input**.
20. Rename to `txtMessageBody`.
21. Set properties:
    - **Mode:** `TextMode.MultiLine`
    - **X:** `recMessageModal.X + 20`
    - **Y:** `recMessageModal.Y + 265`
    - **Width:** `540`
    - **Height:** `140`
    - **HintText:** `"Type your message to the student..."`
    - **Default:** `""`
    - **Visible:** `varShowMessageModal`

#### Character Count

22. Add label:
    - **Name:** `lblMessageCount`
    - **Text:** `Len(txtMessageBody.Text) & " characters"`
    - **X:** `recMessageModal.X + 460`
    - **Y:** `recMessageModal.Y + 408`
    - **Color:** `If(Len(txtMessageBody.Text) > 1000, RGBA(209, 52, 56, 1), RGBA(100, 100, 100, 1))`
    - **Size:** `10`
    - **Visible:** `varShowMessageModal`

#### Cancel Button

23. Add **Button**:
    - **Name:** `btnMessageCancel`
    - **Text:** `"Cancel"`
    - **X:** `recMessageModal.X + 340`
    - **Y:** `recMessageModal.Y + 440`
    - **Width:** `100`
    - **Fill:** `RGBA(150, 150, 150, 1)`
    - **Visible:** `varShowMessageModal`

24. Set **OnSelect:**

```powerfx
Set(varShowMessageModal, false);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtMessageSubject);
Reset(txtMessageBody);
Reset(ddMessageStaff)
```

#### Send Message Button

25. Add **Button**:
    - **Name:** `btnMessageSend`
    - **Text:** `"📧 Send Message"`
    - **X:** `recMessageModal.X + 450`
    - **Y:** `recMessageModal.Y + 440`
    - **Width:** `130`
    - **Fill:** `RGBA(70, 130, 220, 1)`
    - **Color:** `Color.White`
    - **Visible:** `varShowMessageModal`

26. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddMessageStaff.Selected) && 
    !IsBlank(txtMessageSubject.Text) && 
    Len(txtMessageSubject.Text) >= 3 &&
    !IsBlank(txtMessageBody.Text) &&
    Len(txtMessageBody.Text) >= 10,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

27. Set **OnSelect:**

```powerfx
// Create the message in RequestComments with Direction field
Patch(
    RequestComments,
    Defaults(RequestComments),
    {
        Title: txtMessageSubject.Text,
        RequestID: varSelectedItem.ID,
        ReqKey: varSelectedItem.ReqKey,
        Message: txtMessageBody.Text,
        Author: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & ddMessageStaff.Selected.Member.Email,
            DisplayName: ddMessageStaff.Selected.Member.DisplayName,
            Email: ddMessageStaff.Selected.Member.Email
        },
        AuthorRole: {Value: "Staff"},
        Direction: {Value: "Outbound"},  // Marks this as staff-initiated message
        SentAt: Now(),
        ReadByStudent: false,
        ReadByStaff: true,
        StudentEmail: varSelectedItem.StudentEmail
    }
);

// Update PrintRequest to mark last action
Patch(
    PrintRequests,
    varSelectedItem,
    {
        LastAction: "Message Sent",
        LastActionBy: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & ddMessageStaff.Selected.Member.Email,
            DisplayName: ddMessageStaff.Selected.Member.DisplayName,
            Email: ddMessageStaff.Selected.Member.Email
        },
        LastActionAt: Now()
    }
);

// Close modal and notify
Set(varShowMessageModal, false);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtMessageSubject);
Reset(txtMessageBody);
Reset(ddMessageStaff);

Notify("Message sent! Student will receive email notification.", NotificationType.Success)
```

> **Note:** The `Direction: {Value: "Outbound"}` field is required for the new email threading system. Flow D will detect this and send the email with threading headers. See `PowerAutomate/Flow-(D)-Message-Notifications.md` for details.

### Adding the Send Message Button to Job Cards

Add a "Send Message" button to each job card in the gallery:

1. Inside `galJobCards`, add a **Button**:
   - **Name:** `btnSendMessage`
   - **Text:** `"💬 Message"`
   - **X:** `Parent.TemplateWidth - 470`
   - **Y:** `100`
   - **Width:** `110`
   - **Height:** `40`
   - **Fill:** `RGBA(70, 130, 220, 1)`
   - **Color:** `Color.White`
   - **BorderRadius:** `6`

2. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowMessageModal, true)
```

### Message Count Badge (Optional)

To show unread inbound message count on job cards:

1. Add a label inside the gallery:
   - **Name:** `lblMessageCount`
   - **Text:** `Text(CountRows(Filter(RequestComments, RequestID = ThisItem.ID && Direction.Value = "Inbound" && ReadByStaff = false)))`
   - **X:** `Parent.TemplateWidth - 365`
   - **Y:** `95`
   - **Width:** `24`
   - **Height:** `24`
   - **Fill:** `RGBA(209, 52, 56, 1)`
   - **Color:** `Color.White`
   - **Align:** `Align.Center`
   - **BorderRadius:** `12`
   - **Visible:** `CountRows(Filter(RequestComments, RequestID = ThisItem.ID && Direction.Value = "Inbound" && ReadByStaff = false)) > 0`

> **Note:** Uses `Direction.Value = "Inbound"` to count student email replies. Inbound messages are created by Flow E when students reply to emails.

### Testing the Message Modal

- [ ] Message button appears on all job cards
- [ ] Clicking "Message" opens the modal with correct request info
- [ ] Staff dropdown defaults to current user
- [ ] Send button disabled until subject (3+ chars) and message (10+ chars) entered
- [ ] Sending creates entry in RequestComments list with Direction = Outbound
- [ ] Success notification appears
- [ ] Modal closes and resets after sending
- [ ] Flow D sends threaded email to student with [REQ-00001] in subject

---

# STEP 17: Publishing the App

**What you're doing:** Saving and publishing your app so staff can use it.

### Instructions

1. Click **File** in the top left.
2. Click **Save**.
3. Wait for the save to complete.
4. Click **Publish**.
5. Click **Publish this version**.
6. Click the **←** back arrow to return to the editor.

### Sharing the App

7. Go to [make.powerapps.com](https://make.powerapps.com).
8. Find your app in the **Apps** list.
9. Click the **three dots (...)** next to the app.
10. Click **Share**.
11. Add your staff team or security group.
12. Check **Co-owner** if you want them to edit the app.
13. Click **Share**.

---

# STEP 18: Testing the App

**What you're doing:** Verifying everything works correctly.

### Testing Checklist

#### Basic Functionality
- [ ] App loads without errors
- [ ] Status tabs show correct counts
- [ ] Clicking a tab filters the gallery
- [ ] Search filters by name/email/ReqKey
- [ ] "Needs Attention" checkbox filters correctly

#### Action Buttons
- [ ] Approve button opens approval modal
- [ ] Reject button opens rejection modal
- [ ] Archive button opens archive modal
- [ ] All modals close with Cancel button
- [ ] Staff dropdown defaults to current user

#### Approval Flow
- [ ] Enter weight → cost calculates automatically
- [ ] Confirm with valid data → status changes to "Pending"
- [ ] AuditLog entry created
- [ ] Success notification appears
- [ ] Student receives estimate email (via Flow B)

#### Rejection Flow
- [ ] Select at least one reason checkbox
- [ ] Confirm → status changes to "Rejected"
- [ ] AuditLog entry created
- [ ] Success notification appears
- [ ] Student receives rejection email (via Flow B)

#### Archive Flow
- [ ] Confirm → status changes to "Archived"
- [ ] AuditLog entry created
- [ ] Item disappears from active tabs

#### Other Actions
- [ ] Start Print → status changes to "Printing"
- [ ] Complete → status changes to "Completed"
- [ ] Picked Up → status changes to "Paid & Picked Up"
- [ ] Lightbulb toggle works
- [ ] Staff Notes save correctly

---

# Troubleshooting

## Problem: "Unexpected characters" or formula errors after pasting

**Cause:** Curly/smart quotes from the documentation instead of straight quotes.

**What you see:**
- Red error: "Unexpected characters. Characters are used in the formula in an unexpected way"
- The quotes look like `"text"` instead of `"text"`

**Solution:**
1. Delete the quoted text in the formula
2. Retype the quotes manually using your keyboard (`Shift + '`)
3. Or type the entire formula directly instead of copy-pasting

**Example:**
```
❌ Set(varCurrentPage, "Dashboard")   ← curly quotes (from docs)
✅ Set(varCurrentPage, "Dashboard")   ← straight quotes (typed)
```

---

## Problem: "Data source not found" error

**Cause:** SharePoint connection lost or list renamed.

**Solution:**
1. Go to **Data** panel
2. Remove the broken connection
3. Re-add SharePoint connection with correct site URL
4. Reconnect to lists

---

## Problem: Flow not appearing in Power Automate panel

**Cause:** Flow not saved, wrong environment, or looking in wrong place.

**Solution:**
1. **Don't search in Data panel** — flows are NOT added through "Add data"
2. Look in the **left sidebar** for the Power Automate icon (⚡), OR go to **Action** → **Power Automate**
3. Click **+ Add flow** to see available flows
4. If flow still missing:
   - In Power Automate, open your flow and click **Save**
   - Verify you're in the same environment (check top-right dropdown)
   - Ensure the flow has a **Power Apps trigger** (instant flow)

> 💡 **Only instant flows appear!** Automated flows (SharePoint triggers) won't show up — that's correct behavior.

---

## Problem: Person field won't save (Patch fails)

**Cause:** Incorrect person field format.

**Solution:** Use the exact format:

```powerfx
{
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & Lower(userEmail),
    DisplayName: userName,
    Email: Lower(userEmail)
}
```

---

## Problem: Gallery shows all items, not filtered

**Cause:** Filter formula has errors.

**Solution:**
1. Check that `varSelectedStatus` is being set correctly
2. Verify the Status column in SharePoint matches exactly (case-sensitive)
3. Test with a simpler filter first: `Filter(PrintRequests, Status = "Uploaded")`

---

## Problem: Modals appear behind other elements

**Cause:** Z-order (stacking order) is wrong.

**Solution:**
1. In Tree view, right-click the modal overlay
2. Click **Reorder** → **Bring to front**
3. Do the same for the modal content rectangle

---

## Problem: "The specified column doesn't exist" error

**Cause:** Column internal name differs from display name.

**Solution:**
1. In SharePoint, go to List Settings → click the column
2. Look at the URL for `Field=InternalName`
3. Use the internal name in your formulas

---

## Problem: Cost calculation shows wrong value

**Cause:** Method field value doesn't match expected text.

**Solution:**
1. Check your SharePoint Method column choices
2. Ensure they're exactly "Filament" and "Resin" (case-sensitive)
3. Or update the formula to match your actual choices

---

# Quick Reference Card

## Key Variables

| Variable | Set By | Purpose |
|----------|--------|---------|
| `varMeEmail` | App.OnStart | Current user email |
| `varIsStaff` | App.OnStart | Staff member check |
| `colStaff` | App.OnStart | Active staff collection |
| `varSelectedStatus` | Status tab click | Current filter |
| `varSelectedItem` | Button click | Item for modal |
| `varActor` | Screen.OnVisible | Person record for Patch |

## Person Field Format

```powerfx
{
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & email,
    DisplayName: name,
    Email: email
}
```

## Pricing Formula

```powerfx
Max(3.00, weight * If(method = "Resin", 0.20, 0.10))
```

## Flow C Call Pattern

```powerfx
'Flow C (PR-Action)'.Run(
    Text(ThisItem.ID),      // RequestID
    "Status Change",         // Action
    "Status",               // FieldName
    ThisItem.Status,        // OldValue
    "NewStatus",            // NewValue
    varMeEmail,             // ActorEmail
    "Power Apps",           // ClientApp
    "Notes here"            // Notes
)
```

> ⚠️ **Replace flow name:** If your flow has a different name (like `PR-Action_LogAction` or `PR-Action: Log action`), use that name instead in all formulas.

---

# Code Reference (Copy-Paste Snippets)

This section provides condensed code snippets for quick reference when building or modifying the app.

## Status Tab Gallery Items

```powerfx
Table(
    {Status: "Uploaded", Color: RGBA(70, 130, 220, 1)},
    {Status: "Pending", Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Color: RGBA(16, 124, 16, 1)},
    {Status: "Printing", Color: RGBA(107, 105, 214, 1)},
    {Status: "Completed", Color: RGBA(0, 78, 140, 1)},
    {Status: "Paid & Picked Up", Color: RGBA(0, 158, 73, 1)},
    {Status: "Rejected", Color: RGBA(209, 52, 56, 1)},
    {Status: "Archived", Color: RGBA(96, 94, 92, 1)}
)
```

## Job Cards Gallery Filter

```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        Status.Value = varSelectedStatus,
        If(IsBlank(varSearchText), true, 
            varSearchText in Student.DisplayName || 
            varSearchText in StudentEmail || 
            varSearchText in ReqKey
        ),
        If(varNeedsAttention, NeedsAttention = true, true)
    ),
    "Modified",
    SortOrder.Descending
)
```

## Glow Effect (Card Background)

```powerfx
// Rectangle.Fill for attention glow
If(
    ThisItem.NeedsAttention,
    If(Mod(tmrGlow.Value, 1500) < 750, 
        RGBA(255, 215, 0, 0.08),
        RGBA(255, 215, 0, 0.03)
    ),
    Color.White
)

// Rectangle.BorderColor for attention glow
If(
    ThisItem.NeedsAttention,
    If(Mod(tmrGlow.Value, 1500) < 750, 
        RGBA(255, 215, 0, 1),
        RGBA(255, 215, 0, 0.6)
    ),
    RGBA(220, 220, 220, 1)
)
```

## Color Switch Statement

```powerfx
Switch(
    ThisItem.Color.Value,
    "Black", RGBA(50, 50, 50, 1),
    "White", RGBA(180, 180, 180, 1),
    "Gray", RGBA(128, 128, 128, 1),
    "Red", RGBA(200, 50, 50, 1),
    "Green", RGBA(50, 150, 50, 1),
    "Blue", RGBA(50, 100, 200, 1),
    "Yellow", RGBA(218, 165, 32, 1),
    "Dark Yellow", RGBA(184, 134, 11, 1),
    "Any", RGBA(150, 150, 150, 1),
    RGBA(100, 100, 100, 1)
)
```

## Relative Time Display

```powerfx
"Submitted " & 
If(DateDiff(ThisItem.Created, Now(), TimeUnit.Days) > 0,
    Text(DateDiff(ThisItem.Created, Now(), TimeUnit.Days)) & "d ", "") &
If(Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Hours), 24) > 0,
    Text(Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Hours), 24)) & "h ", "") &
Text(Mod(DateDiff(ThisItem.Created, Now(), TimeUnit.Minutes), 60)) & "m ago"
```

## Cost Calculation

```powerfx
// Auto-calculate with $3.00 minimum
If(
    IsNumeric(txtEstimatedWeight.Text) && Value(txtEstimatedWeight.Text) > 0,
    "$" & Text(
        Max(3.00, Value(txtEstimatedWeight.Text) * 
            If(varSelectedItem.Method.Value = "Resin", 0.20, 0.10)),
        "[$-en-US]#,##0.00"
    ),
    "$3.00 (minimum)"
)
```

## Modal Visibility Pattern

```powerfx
// Show modal (on button click)
Set(varShowRejectModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)

// Hide modal (on cancel/confirm)
Set(varShowRejectModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false))
```

## Staff Dropdown Default

```powerfx
// Items
colStaff

// DefaultSelectedItems
Filter(colStaff, Lower(Member.Email) = varMeEmail)

// DisplayFields
["Member"]
```

## Expand/Collapse Toggle

```powerfx
// OnSelect for expand icon
With(
    {isCurrentlyExpanded: ThisItem.ID in colExpanded.ID},
    If(
        isCurrentlyExpanded,
        RemoveIf(colExpanded, ID = ThisItem.ID),
        Collect(colExpanded, {ID: ThisItem.ID})
    )
)

// Dynamic TemplateSize
If(ThisItem.ID in colExpanded.ID || varExpandAll, 480, 380)
```

## Button Visibility by Status

| Button | Visible When |
|--------|-------------|
| Approve | `Status.Value = "Uploaded"` |
| Reject | `Status.Value = "Uploaded" \|\| Status.Value = "Pending"` |
| Start Print | `Status.Value = "Ready to Print"` |
| Complete | `Status.Value = "Printing"` |
| Picked Up | `Status.Value = "Completed"` |
| Archive | `Status.Value in ["Completed", "Paid & Picked Up", "Rejected"]` |

## Standard Button Colors

| Action | Fill | Border | Text |
|--------|------|--------|------|
| Approve | `RGBA(16, 124, 16, 1)` | Same | White |
| Reject | `RGBA(209, 52, 56, 1)` | Same | White |
| Archive | `RGBA(255, 140, 0, 1)` | Same | White |
| Start Print | `RGBA(107, 105, 214, 1)` | Same | White |
| Complete | `RGBA(0, 78, 140, 1)` | Same | White |
| Picked Up | `RGBA(0, 158, 73, 1)` | Same | White |
| Cancel | `RGBA(150, 150, 150, 1)` | Same | White |
| Message | `RGBA(70, 130, 220, 1)` | Same | White |

---

# Next Steps

After your Staff Console is working:

1. ✅ Test the complete workflow end-to-end
2. ✅ Train staff on using the dashboard
3. ✅ Monitor AuditLog for proper logging
4. 🎯 Move to Phase 4: Integration & Production

---

**💡 Pro Tips:**

- **Preview often:** Press **F5** frequently to test changes
- **Save incrementally:** Save after each major section
- **Name controls:** Rename controls as you create them—it makes formulas easier to read
- **Use the formula bar:** Click in the formula bar to see the full formula
- **Check the App Checker:** Click the checkmark icon (top right) to see warnings and errors

> **Official Microsoft Docs:** [Create a canvas app from scratch](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/create-blank-app)
