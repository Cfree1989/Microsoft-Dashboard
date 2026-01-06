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
15. [Building the Change Print Details Modal](#step-12b-building-the-change-print-details-modal)
16. [Building the Payment Recording Modal](#step-12c-building-the-payment-recording-modal)
17. [Adding Search and Filters](#step-14-adding-search-and-filters)
18. [Adding the Lightbulb Attention System](#step-15-adding-the-lightbulb-attention-system)
19. [Adding the Attachments Modal](#step-16-adding-the-attachments-modal)
20. [Adding the Messaging System](#step-17-adding-the-messaging-system) ← **⏸️ STOP: Create RequestComments list first**
    - [Step 17A: Adding the Data Connection](#step-17a-adding-the-data-connection)
    - [Step 17B: Adding Messages Display to Job Cards](#step-17b-adding-messages-display-to-job-cards)
    - [Step 17C: Building the Message Modal](#step-17c-building-the-message-modal)
21. [Publishing the App](#step-18-publishing-the-app)
22. [Testing the App](#step-19-testing-the-app)
23. [Troubleshooting](#troubleshooting)
24. [Quick Reference Card](#quick-reference-card)
25. [Code Reference (Copy-Paste Snippets)](#code-reference-copy-paste-snippets)

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
- ✅ Flow-(C)-Action-LogAction

> ⚠️ **Flow Name Note:** All formulas in this guide use `'Flow-(C)-Action-LogAction'`. If your flow has a different name in Power Apps, replace accordingly.

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
// Note: ForAll flattens the Person column so dropdowns can display names
ClearCollect(colStaff, ForAll(Filter(Staff, Active = true), {MemberName: Member.DisplayName, MemberEmail: Member.Email, Role: Role, Active: Active}));

// Check if current user is a staff member
Set(varIsStaff, CountRows(Filter(colStaff, Lower(MemberEmail) = varMeEmail)) > 0);

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
Set(varShowPaymentModal, 0);
Set(varShowAddFileModal, 0);
Set(varShowMessageModal, 0);

// Currently selected item for modals (typed to PrintRequests schema)
Set(varSelectedItem, LookUp(PrintRequests, false))
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
| `colStaff` | Collection of active staff (flattened: MemberName, MemberEmail, Role, Active) | Table |
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
| `varShowPaymentModal` | ID of item for payment (0=hidden) | Number |
| `varShowAddFileModal` | ID of item for attachments (0=hidden) | Number |
| `varShowMessageModal` | ID of item for messaging (0=hidden) | Number |
| `varSelectedItem` | Item currently selected for modal | PrintRequests Record |

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

Here's the **complete Tree view** exactly as it should appear in Power Apps after all steps are complete:

> ⚠️ **Z-ORDER RULE:** TOP of list = FRONT (renders on top) · BOTTOM of list = BACK (renders behind)

> 📝 **Build Order Notes:**
> - Controls are listed in Z-order (top = front), not build order
> - Message Modal controls (btnMessageSend through recMessageOverlay) are added in **Step 16C**
> - Message display controls in galJobCards (galMessages, lblNoMessages, lblUnreadBadge, btnSendMessage) are added in **Step 16B**

```
▼ App
▼ scrDashboard
    btnMessageSend                    ← Step 16C
    btnMessageCancel                  ← Step 16C
    lblMessageCharCount               ← Step 16C
    txtMessageBody                    ← Step 16C
    lblMessageBodyLabel               ← Step 16C
    txtMessageSubject                 ← Step 16C
    lblMessageSubjectLabel            ← Step 16C
    ddMessageStaff                    ← Step 16C
    lblMessageStaffLabel              ← Step 16C
    lblMessageStudent                 ← Step 16C
    lblMessageTitle                   ← Step 16C
    recMessageModal                   ← Step 16C
    recMessageOverlay                 ← Step 16C
    btnFileCancel                     ← Step 16
    btnFileSave                       ← Step 16
    frmAttachmentsEdit                ← Step 16
    ddFileActor                       ← Step 16
    lblFileStaffLabel                 ← Step 16
    lblFileTitle                      ← Step 16
    recFileModal                      ← Step 16
    recFileOverlay                    ← Step 16
    btnDetailsConfirm                 ← Step 12B
    btnDetailsCancel                  ← Step 12B
    ddDetailsColor                    ← Step 12B
    lblDetailsColorLabel              ← Step 12B
    ddDetailsPrinter                  ← Step 12B
    lblDetailsPrinterLabel            ← Step 12B
    ddDetailsStaff                    ← Step 12B
    lblDetailsStaffLabel              ← Step 12B
    lblDetailsCurrent                 ← Step 12B
    lblDetailsCurrentLabel            ← Step 12B
    lblDetailsTitle                   ← Step 12B
    recDetailsModal                   ← Step 12B
    recDetailsOverlay                 ← Step 12B
    btnArchiveConfirm                 ← Step 12
    btnArchiveCancel                  ← Step 12
    txtArchiveReason                  ← Step 12
    lblArchiveReasonLabel             ← Step 12
    ddArchiveStaff                    ← Step 12
    lblArchiveStaffLabel              ← Step 12
    lblArchiveWarning                 ← Step 12
    lblArchiveTitle                   ← Step 12
    recArchiveModal                   ← Step 12
    recArchiveOverlay                 ← Step 12
    btnApprovalConfirm                ← Step 11
    btnApprovalCancel                 ← Step 11
    txtApprovalComments               ← Step 11
    lblApprovalCommentsLabel          ← Step 11
    lblCalculatedCost                 ← Step 11
    lblCostLabel                      ← Step 11
    txtEstimatedTime                  ← Step 11
    lblTimeLabel                      ← Step 11
    lblWeightError                    ← Step 11
    txtEstimatedWeight                ← Step 11
    lblWeightLabel                    ← Step 11
    ddApprovalStaff                   ← Step 11
    lblApprovalStaffLabel             ← Step 11
    lblApprovalStudent                ← Step 11
    lblApprovalTitle                  ← Step 11
    recApprovalModal                  ← Step 11
    recApprovalOverlay                ← Step 11
    btnRejectConfirm                  ← Step 10
    btnRejectCancel                   ← Step 10
    txtRejectComments                 ← Step 10
    lblRejectCommentsLabel            ← Step 10
    chkNotJoined                      ← Step 10
    chkOverhangs                      ← Step 10
    chkMessy                          ← Step 10
    chkScale                          ← Step 10
    chkNotSolid                       ← Step 10
    chkGeometry                       ← Step 10
    chkTooSmall                       ← Step 10
    lblRejectReasonsLabel             ← Step 10
    ddRejectStaff                     ← Step 10
    lblRejectStaffLabel               ← Step 10
    lblRejectStudent                  ← Step 10
    lblRejectTitle                    ← Step 10
    recRejectModal                    ← Step 10
    recRejectOverlay                  ← Step 10
    ▼ galJobCards                     ← Step 6
        btnSendMessage                ← Step 16C
        btnFiles                      ← Step 16
        btnChangeDetails              ← Step 12B
        btnPickedUp                   ← Step 9
        btnComplete                   ← Step 9
        btnStartPrint                 ← Step 9
        btnArchive                    ← Step 9
        btnReject                     ← Step 9
        btnApprove                    ← Step 9
        icoLightbulb                  ← Step 15
        // icoExpandCollapse removed (details always visible)
        lblUnreadBadge                ← Step 16B
        ▼ galMessages                 ← Step 16B
            lblMsgContent             ← Step 16B
            lblMsgDirectionBadge      ← Step 16B
            lblMsgAuthor              ← Step 16B
            icoMsgDirection           ← Step 16B
            recMessageBg              ← Step 16B
        lblNoMessages                 ← Step 16B
        lblMessagesHeader             ← Step 16B
        lblCourse                     ← Step 7
        lblProjectType                ← Step 7
        lblDiscipline                 ← Step 7
        lblDueDate                    ← Step 7
        lblCreated                    ← Step 7
        lblJobId                      ← Step 7
        btnSaveNotes                  ← Step 7
        txtStaffNotes                 ← Step 7
        lblStaffNotesPlaceholder      ← Step 7
        lblStaffNotesHeader           ← Step 7
        lblColor                      ← Step 7
        lblPrinter                    ← Step 7
        lblStudentEmail               ← Step 7
        lblReqKey                     ← Step 7
        lblSubmittedTime              ← Step 7
        lblStudentName                ← Step 7
        recCardBackground             ← Step 7
    lblEmptyState                     ← Step 9
    btnClearFilters                   ← Step 13
    btnExpandAll                      ← Step 13
    chkNeedsAttention                 ← Step 13
    txtSearch                         ← Step 13
    ▼ galStatusTabs                   ← Step 5
        btnStatusTab                  ← Step 5
    lblUserName                       ← Step 4
    btnNavAnalytics                   ← Step 4
    btnNavAdmin                       ← Step 4
    btnNavDashboard                   ← Step 4
    lblAppTitle                       ← Step 4
    recHeader                         ← Step 4
    tmrGlow                           ← Step 14
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
| Y | `160` |
| Width | `1366` |
| Height | `608` |
| **WrapCount** | `4` |
| TemplatePadding | `8` |

> 💡 **WrapCount = 4** creates a grid layout with 4 cards per row! Each card will be approximately 330px wide.
> 
> ⚠️ **Note:** Y=160 leaves room for the Filter Bar (built in Step 14) between the status tabs and job cards.

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

6. Set **TemplateSize:** `450` (fixed card height - accommodates messages section and action buttons)

> ⚠️ **Power Apps Limitation:** The `TemplateSize` property cannot use `ThisItem` because it's evaluated at the gallery level, not per-item. All cards must have the same height. The expand/collapse feature works by showing/hiding the "Additional Details" section within this fixed space.

> 💡 **Card Layout:** All details are always visible on the card. No expand/collapse functionality — this provides a cleaner, consistent layout.

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


### Student Name (lblStudentName)

4. Click **+ Insert** → **Text label**.
5. **Rename it:** `lblStudentName`
6. Set properties:

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

7. Click **+ Insert** → **Text label**.
8. **Rename it:** `lblSubmittedTime`
9. Set properties:

| Property | Value |
|----------|-------|
| X | `Parent.TemplateWidth - 130` |
| Y | `8` |
| Width | `120` |
| Height | `20` |
| Align | `Align.Right` |
| Size | `10` |
| Color | `RGBA(209, 52, 56, 1)` |

10. Set **Text:**

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

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblReqKey`
13. Set properties:

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

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblStudentEmail`
16. Set properties:

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

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblPrinter`
19. Set properties:

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

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblColor`
22. Set properties:

| Property | Value |
|----------|-------|
| Text | `"⬤ " & ThisItem.Color.Value` |
| X | `12` |
| Y | `75` |
| Width | `150` |
| Height | `20` |
| Size | `10` |
| Color | See formula below |

23. Set **Color** formula (matches the actual color):

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

### Staff Notes Section (lblStaffNotesHeader + lblStaffNotesPlaceholder)

24. Click **+ Insert** → **Text label**.
25. **Rename it:** `lblStaffNotesHeader`
26. Set properties:

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

27. Click **+ Insert** → **Text label**.
28. **Rename it:** `lblStaffNotesPlaceholder`
29. Set properties:

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

30. Click **+ Insert** → **Text label**.
31. **Rename it:** `lblDetailsHeader`
32. Set properties:

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
| Visible | `true` |

### Expanded Detail Labels

These labels show additional info when the card is expanded. All have the same Visible formula.

#### Job ID Row (Y = 185)

33. Click **+ Insert** → **Text label**.
34. **Rename it:** `lblJobIdLabel`
35. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Job ID:"` |
| X | `12` |
| Y | `185` |
| Width | `65` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(120, 120, 120, 1)` |
| Visible | `true` |

36. Click **+ Insert** → **Text label**.
37. **Rename it:** `lblJobId`
38. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.ReqKey` |
| X | `80` |
| Y | `185` |
| Width | `120` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `true` |

39. Click **+ Insert** → **Text label**.
40. **Rename it:** `lblCreatedLabel`
41. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Created:"` |
| X | `Parent.TemplateWidth / 2` |
| Y | `185` |
| Width | `55` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(120, 120, 120, 1)` |
| Visible | `true` |

42. Click **+ Insert** → **Text label**.
43. **Rename it:** `lblCreated`
44. Set properties:

| Property | Value |
|----------|-------|
| Text | `Text(ThisItem.Created, "mmm dd, yyyy hh:mm AM/PM")` |
| X | `Parent.TemplateWidth / 2 + 55` |
| Y | `185` |
| Width | `150` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `true` |

#### Discipline & Project Row (Y = 205)

45. Click **+ Insert** → **Text label**.
46. **Rename it:** `lblDisciplineLabel`
47. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Discipline:"` |
| X | `12` |
| Y | `205` |
| Width | `65` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(120, 120, 120, 1)` |
| Visible | `true` |

48. Click **+ Insert** → **Text label**.
49. **Rename it:** `lblDiscipline`
50. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Discipline.Value` |
| X | `80` |
| Y | `205` |
| Width | `120` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `true` |

51. Click **+ Insert** → **Text label**.
52. **Rename it:** `lblProjectTypeLabel`
53. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Project:"` |
| X | `Parent.TemplateWidth / 2` |
| Y | `205` |
| Width | `50` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(120, 120, 120, 1)` |
| Visible | `true` |

54. Click **+ Insert** → **Text label**.
55. **Rename it:** `lblProjectType`
56. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.ProjectType.Value` |
| X | `Parent.TemplateWidth / 2 + 50` |
| Y | `205` |
| Width | `150` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `true` |

#### Course Row (Y = 225) - Optional

57. Click **+ Insert** → **Text label**.
58. **Rename it:** `lblCourseLabel`
59. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Course:"` |
| X | `12` |
| Y | `225` |
| Width | `65` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(120, 120, 120, 1)` |
| Visible | `true` |

60. Click **+ Insert** → **Text label**.
61. **Rename it:** `lblCourse`
62. Set properties:

| Property | Value |
|----------|-------|
| Text | `Coalesce(ThisItem.'Course Number', "—")` |
| X | `80` |
| Y | `225` |
| Width | `150` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `true` |

---

### ✅ Step 7 Checklist

Your gallery template should now contain these controls (Z-order: top = front):

```
▼ galJobCards
    lblCourse
    lblCourseLabel
    lblProjectType
    lblProjectTypeLabel
    lblDiscipline
    lblDisciplineLabel
    lblCreated
    lblCreatedLabel
    lblJobId
    lblJobIdLabel
    lblDetailsHeader
    lblStaffNotesPlaceholder
    lblStaffNotesHeader
    lblColor
    lblPrinter
    lblStudentEmail
    lblReqKey
    lblSubmittedTime
    lblStudentName
    recCardBackground              ← Bottom (background)
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

### Expand/Collapse Icon — REMOVED

> ⚠️ **No longer needed:** Since all details are always visible, the expand/collapse icon has been removed. If you already have `icoExpandCollapse`, delete it or set its `Visible` property to `false`.

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
Set(varActor, {
    Claims: "i:0#.f|membership|" & varMeEmail,
    Discipline: "",
    DisplayName: varMeName,
    Email: varMeEmail,
    JobTitle: "",
    Picture: ""
})
```

> 💡 **SharePoint Person fields** require all six properties (Claims, Department, DisplayName, Email, JobTitle, Picture) even if some are empty strings.

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
    Status: LookUp(Choices(PrintRequests.Status), Value = "Printing"),
    LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
    LastActionAt: Now(),
    LastActionBy: {
        Claims: "i:0#.f|membership|" & User().Email,
        Discipline: "",
        DisplayName: User().FullName,
        Email: User().Email,
        JobTitle: "",
        Picture: ""
    }
});

'Flow-(C)-Action-LogAction'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    "Printing",
    varMeEmail
);

Notify("Print started!", NotificationType.Success)
```

> 💡 **Flow C Parameters:** Only pass the 5 required parameters: RequestID, Action, FieldName, NewValue, ActorEmail. The optional parameters (OldValue, ClientApp, Notes) are not passed.

### Complete Printing Button (btnComplete)

17. Click **+ Insert** → **Button**.
18. **Rename it:** `btnComplete`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Complete"` |
| X | `12` |
| Y | `Parent.TemplateHeight - 50` |
| Width | `(Parent.TemplateWidth - 28) / 2` |
| Height | `32` |
| Fill | `RGBA(0, 78, 140, 1)` |
| Color | `Color.White` |
| Visible | `ThisItem.Status.Value = "Printing"` |

20. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {
    Status: LookUp(Choices(PrintRequests.Status), Value = "Completed"),
    LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
    LastActionAt: Now(),
    LastActionBy: {
        Claims: "i:0#.f|membership|" & User().Email,
        Discipline: "",
        DisplayName: User().FullName,
        Email: User().Email,
        JobTitle: "",
        Picture: ""
    }
});

'Flow-(C)-Action-LogAction'.Run(
    Text(ThisItem.ID),
    "Status Change",
    "Status",
    "Completed",
    varMeEmail
);

Notify("Marked as completed!", NotificationType.Success)
```

### Picked Up Button (btnPickedUp)

21. Click **+ Insert** → **Button**.
22. **Rename it:** `btnPickedUp`
23. Set properties:

| Property | Value |
|----------|-------|
| Text | `"💰 Picked Up"` |
| X | `12 + (Parent.TemplateWidth - 28) / 2 + 4` |
| Y | `Parent.TemplateHeight - 50` |
| Width | `(Parent.TemplateWidth - 28) / 2` |
| Height | `32` |
| Fill | `RGBA(0, 158, 73, 1)` |
| Color | `Color.White` |
| Visible | `ThisItem.Status.Value = "Completed"` |

24. Set **OnSelect:**

```powerfx
Set(varShowPaymentModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Note:** This opens the Payment Modal (built in Step 12C) where staff enters the transaction number, final weight, and payment details before marking as picked up.

### Edit Details Button (btnEditDetails)

25. Click **+ Insert** → **Button**.
26. **Rename it:** `btnEditDetails`
27. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✏️ Edit"` |
| X | `Parent.TemplateWidth - 75` |
| Y | `162` |
| Width | `65` |
| Height | `26` |
| Fill | `Color.White` |
| Color | `RGBA(0, 120, 212, 1)` |
| BorderColor | `RGBA(0, 120, 212, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Size | `9` |
| Visible | `ThisItem.Status.Value <> "Pending"` |

28. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Visibility:** Available on ALL status tabs except Pending. Positioned near the "Additional Details" header for consistent placement regardless of which action buttons are showing.

---

### Empty State Label (lblEmptyState)

**What this does:** Shows a friendly message when no requests match the current filter, instead of showing a blank area.

25. Click on **scrDashboard** in Tree view (outside the gallery).
26. Click **+ Insert** → **Text label**.
27. **Rename it:** `lblEmptyState`
28. Set properties:

| Property | Value |
|----------|-------|
| Text | `"No " & varSelectedStatus & " requests found"` |
| X | `(1366 - 400) / 2` |
| Y | `350` |
| Width | `400` |
| Height | `100` |
| Size | `14` |
| Align | `Align.Center` |
| Color | `RGBA(120, 120, 120, 1)` |
| Font | `Font.'Segoe UI'` |
| Visible | `CountRows(galJobCards.AllItems) = 0` |

> 💡 **How it works:** The label is centered on screen and only appears when the gallery has zero items. When a user selects a status tab with no matching requests, they'll see "No Uploaded requests found" (or whichever status is selected) instead of empty space.

---

# STEP 10: Building the Rejection Modal

**What you're doing:** Creating a popup dialog that appears when staff click "Reject" to capture rejection reasons.

### Modal Structure

All controls are added to **scrDashboard** (screen level, outside the gallery). They float above everything else when visible.

```
scrDashboard
├── recRejectOverlay          ← Dark semi-transparent background
├── recRejectModal            ← White modal box (container)
├── lblRejectTitle            ← "Reject Request - REQ-00042"
├── lblRejectStudent          ← Student name and email
├── lblRejectStaffLabel       ← "Performing Action As: *"
├── ddRejectStaff             ← Staff dropdown
├── lblRejectReasonsLabel     ← "Rejection Reasons..."
├── chkTooSmall               ← Checkbox: Features too small/thin
├── chkGeometry               ← Checkbox: Geometry is problematic
├── chkNotSolid               ← Checkbox: Open model/not solid
├── chkScale                  ← Checkbox: Scale is wrong
├── chkMessy                  ← Checkbox: Model is messy
├── chkOverhangs              ← Checkbox: Excessive overhangs
├── chkNotJoined              ← Checkbox: Parts not joined
├── lblRejectCommentsLabel    ← "Additional Comments..."
├── txtRejectComments         ← Multi-line text input
├── btnRejectCancel           ← Cancel button
└── btnRejectConfirm          ← Confirm Rejection button
```

---

### Modal Overlay (recRejectOverlay)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. **Rename it:** `recRejectOverlay`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `1366` |
| Height | `768` |
| Fill | `RGBA(0, 0, 0, 0.7)` |
| Visible | `varShowRejectModal > 0` |

---

### Modal Content Box (recRejectModal)

5. Click **+ Insert** → **Rectangle**.
6. **Rename it:** `recRejectModal`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 610) / 2` |
| Width | `600` |
| Height | `610` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |
| Visible | `varShowRejectModal > 0` |

---

### Modal Title (lblRejectTitle)

8. Click **+ Insert** → **Text label**.
9. **Rename it:** `lblRejectTitle`
10. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Reject Request - " & varSelectedItem.ReqKey` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 20` |
| Width | `560` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(209, 52, 56, 1)` |
| Visible | `varShowRejectModal > 0` |

---

### Student Info (lblRejectStudent)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblRejectStudent`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 55` |
| Width | `560` |
| Height | `25` |
| Size | `12` |
| Color | `RGBA(100, 100, 100, 1)` |
| Visible | `varShowRejectModal > 0` |

---

### Staff Label (lblRejectStaffLabel)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblRejectStaffLabel`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 90` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowRejectModal > 0` |

---

### Staff Dropdown (ddRejectStaff)

17. Click **+ Insert** → **Combo box**.
18. **Rename it:** `ddRejectStaff`
19. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 115` |
| Width | `300` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowRejectModal > 0` |

> ⚠️ **Important:** You must **Run OnStart** first before setting DisplayFields. Otherwise Power Apps will auto-change it to `["ComplianceAssetId"]` because it doesn't recognize the collection columns yet.

---

### Rejection Reasons Label (lblRejectReasonsLabel)

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblRejectReasonsLabel`
22. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Rejection Reasons (select all that apply):"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 160` |
| Width | `400` |
| Height | `32` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowRejectModal > 0` |

---

### Rejection Reason Checkboxes

Add 7 checkboxes. For each, click **+ Insert** → **Checkbox**:

| # | Control Name | Text | X | Y |
|---|--------------|------|---|---|
| 23 | `chkTooSmall` | `"Features are too small or too thin"` | `recRejectModal.X + 20` | `recRejectModal.Y + 185` |
| 24 | `chkGeometry` | `"The geometry is problematic"` | `recRejectModal.X + 20` | `recRejectModal.Y + 215` |
| 25 | `chkNotSolid` | `"Open model/not solid geometry"` | `recRejectModal.X + 20` | `recRejectModal.Y + 245` |
| 26 | `chkScale` | `"The scale is wrong"` | `recRejectModal.X + 20` | `recRejectModal.Y + 275` |
| 27 | `chkMessy` | `"The model is messy"` | `recRejectModal.X + 20` | `recRejectModal.Y + 305` |
| 28 | `chkOverhangs` | `"Excessive overhangs requiring too much support"` | `recRejectModal.X + 20` | `recRejectModal.Y + 335` |
| 29 | `chkNotJoined` | `"Model parts are not joined together"` | `recRejectModal.X + 20` | `recRejectModal.Y + 365` |

Set **Visible** for all: `varShowRejectModal > 0`

---

### Comments Label (lblRejectCommentsLabel)

30. Click **+ Insert** → **Text label**.
31. **Rename it:** `lblRejectCommentsLabel`
32. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Additional Comments (optional):"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 400` |
| Width | `300` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowRejectModal > 0` |

---

### Comments Text Input (txtRejectComments)

33. Click **+ Insert** → **Text input**.
34. **Rename it:** `txtRejectComments`
35. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 425` |
| Width | `560` |
| Height | `80` |
| HintText | `"Provide specific feedback for the student..."` |
| Visible | `varShowRejectModal > 0` |

---

### Cancel Button (btnRejectCancel)

36. Click **+ Insert** → **Button**.
37. **Rename it:** `btnRejectCancel`
38. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recRejectModal.X + 300` |
| Y | `recRejectModal.Y + 550` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |
| Visible | `varShowRejectModal > 0` |

39. Set **OnSelect:**

```powerfx
Set(varShowRejectModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtRejectComments);
Reset(ddRejectStaff);
Reset(chkTooSmall);
Reset(chkGeometry);
Reset(chkNotSolid);
Reset(chkScale);
Reset(chkMessy);
Reset(chkOverhangs);
Reset(chkNotJoined)
```

---

### Confirm Rejection Button (btnRejectConfirm)

40. Click **+ Insert** → **Button**.
41. **Rename it:** `btnRejectConfirm`
42. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✗ Confirm Rejection"` |
| X | `recRejectModal.X + 430` |
| Y | `recRejectModal.Y + 550` |
| Width | `150` |
| Height | `36` |
| Fill | `RGBA(209, 52, 56, 1)` |
| Color | `Color.White` |
| Visible | `varShowRejectModal > 0` |
| DisplayMode | `If(IsBlank(ddRejectStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

43. Set **OnSelect:**

```powerfx
// Build rejection reasons string
Set(varRejectionReasons, 
    If(chkTooSmall.Value, "Features are too small or too thin; ", "") &
    If(chkGeometry.Value, "The geometry is problematic; ", "") &
    If(chkNotSolid.Value, "Open model/not solid geometry; ", "") &
    If(chkScale.Value, "The scale is wrong; ", "") &
    If(chkMessy.Value, "The model is messy; ", "") &
    If(chkOverhangs.Value, "Excessive overhangs requiring too much support; ", "") &
    If(chkNotJoined.Value, "Model parts are not joined together; ", "")
);

// Update the SharePoint item
Patch(PrintRequests, varSelectedItem, {
    Status: LookUp(Choices(PrintRequests.Status), Value = "Rejected"),
    NeedsAttention: false,
    LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Rejected"),
    LastActionBy: {
        Claims: "i:0#.f|membership|" & ddRejectStaff.Selected.MemberEmail,
        Discipline: "",
        DisplayName: ddRejectStaff.Selected.MemberName,
        Email: ddRejectStaff.Selected.MemberEmail,
        JobTitle: "",
        Picture: ""
    },
    LastActionAt: Now(),
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "REJECTED by " & ddRejectStaff.Selected.MemberName & ": " & 
        varRejectionReasons & txtRejectComments.Text & " - " & Text(Now(), "mm/dd/yyyy")
    )
});

// Log to AuditLog via Flow C
IfError(
    'Flow-(C)-Action-LogAction'.Run(
        Text(varSelectedItem.ID),
        "Rejected",
        "Status",
        "Rejected",
        ddRejectStaff.Selected.MemberEmail
    ),
    Notify("Could not log rejection.", NotificationType.Error),
    Notify("Request rejected. Student will be notified.", NotificationType.Success)
);

// Close modal and reset
Set(varShowRejectModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtRejectComments);
Reset(ddRejectStaff);
Reset(chkTooSmall);
Reset(chkGeometry);
Reset(chkNotSolid);
Reset(chkScale);
Reset(chkMessy);
Reset(chkOverhangs);
Reset(chkNotJoined)
```

---

# STEP 11: Building the Approval Modal

**What you're doing:** Creating a dialog for staff to enter weight/time estimates before approving a request.

### Control Hierarchy

```
scrDashboard
├── recApprovalOverlay        ← Dark semi-transparent background
├── recApprovalModal          ← White modal box (container)
├── lblApprovalTitle          ← "Approve Request - REQ-00042"
├── lblApprovalStudent        ← Student name and email
├── lblApprovalStaffLabel     ← "Performing Action As: *"
├── ddApprovalStaff           ← Staff dropdown
├── lblApprovalWeightLabel    ← "Estimated Weight (grams): *"
├── txtEstimatedWeight        ← Weight input field
├── lblWeightValidation       ← Validation error message
├── lblApprovalTimeLabel      ← "Estimated Print Time (hours):"
├── txtEstimatedTime          ← Time input field (optional)
├── lblApprovalCostLabel      ← "Estimated Cost:"
├── lblApprovalCostValue      ← Auto-calculated cost display
├── lblApprovalCommentsLabel  ← "Additional Comments:"
├── txtApprovalComments       ← Multi-line text input
├── btnApprovalCancel         ← Cancel button
└── btnApprovalConfirm        ← Confirm Approval button
```

---

### Modal Overlay (recApprovalOverlay)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. **Rename it:** `recApprovalOverlay`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `1366` |
| Height | `768` |
| Fill | `RGBA(0, 0, 0, 0.7)` |
| Visible | `varShowApprovalModal > 0` |

---

### Modal Content Box (recApprovalModal)

5. Click **+ Insert** → **Rectangle**.
6. **Rename it:** `recApprovalModal`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 650) / 2` |
| Width | `600` |
| Height | `650` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |
| Visible | `varShowApprovalModal > 0` |

---

### Modal Title (lblApprovalTitle)

8. Click **+ Insert** → **Text label**.
9. **Rename it:** `lblApprovalTitle`
10. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Approve Request - " & varSelectedItem.ReqKey` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 20` |
| Width | `560` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(16, 124, 16, 1)` |
| Visible | `varShowApprovalModal > 0` |

---

### Student Info (lblApprovalStudent)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblApprovalStudent`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 55` |
| Width | `560` |
| Height | `25` |
| Size | `12` |
| Color | `RGBA(100, 100, 100, 1)` |
| Visible | `varShowApprovalModal > 0` |

---

### Staff Label (lblApprovalStaffLabel)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblApprovalStaffLabel`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 90` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowApprovalModal > 0` |

---

### Staff Dropdown (ddApprovalStaff)

17. Click **+ Insert** → **Combo box**.
18. **Rename it:** `ddApprovalStaff`
19. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 115` |
| Width | `300` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowApprovalModal > 0` |

> ⚠️ **Important:** You must **Run OnStart** first before setting DisplayFields. Otherwise Power Apps will auto-change it to `["ComplianceAssetId"]` because it doesn't recognize the collection columns yet.

---

### Weight Label (lblApprovalWeightLabel)

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblApprovalWeightLabel`
22. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Weight (grams): *"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 165` |
| Width | `250` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowApprovalModal > 0` |

---

### Weight Input (txtEstimatedWeight)

23. Click **+ Insert** → **Text input**.
24. **Rename it:** `txtEstimatedWeight`
25. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 190` |
| Width | `200` |
| Height | `36` |
| HintText | `"Enter weight in grams (e.g., 25)"` |
| Visible | `varShowApprovalModal > 0` |

---

### Weight Validation Label (lblWeightValidation)

26. Click **+ Insert** → **Text label**.
27. **Rename it:** `lblWeightValidation`
28. Set properties:

| Property | Value |
|----------|-------|
| X | `recApprovalModal.X + 230` |
| Y | `recApprovalModal.Y + 195` |
| Width | `200` |
| Height | `25` |
| Size | `11` |
| Color | `RGBA(209, 52, 56, 1)` |

29. Set **Text:**

```powerfx
If(
    IsBlank(txtEstimatedWeight.Text), 
    "⚠️ Weight is required",
    !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0,
    "⚠️ Enter a valid weight > 0",
    ""
)
```

30. Set **Visible:**

```powerfx
varShowApprovalModal > 0 && (IsBlank(txtEstimatedWeight.Text) || !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0)
```

---

### Time Label (lblApprovalTimeLabel)

31. Click **+ Insert** → **Text label**.
32. **Rename it:** `lblApprovalTimeLabel`
33. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Print Time (hours): (Optional)"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 240` |
| Width | `300` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowApprovalModal > 0` |

---

### Time Input (txtEstimatedTime)

34. Click **+ Insert** → **Text input**.
35. **Rename it:** `txtEstimatedTime`
36. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 265` |
| Width | `200` |
| Height | `36` |
| HintText | `"Enter hours (e.g., 2.5)"` |
| Visible | `varShowApprovalModal > 0` |

---

### Cost Label (lblApprovalCostLabel)

37. Click **+ Insert** → **Text label**.
38. **Rename it:** `lblApprovalCostLabel`
39. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Cost:"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 320` |
| Width | `150` |
| Height | `25` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Visible | `varShowApprovalModal > 0` |

---

### Cost Value Display (lblApprovalCostValue)

40. Click **+ Insert** → **Text label**.
41. **Rename it:** `lblApprovalCostValue`
42. Set properties:

| Property | Value |
|----------|-------|
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 345` |
| Width | `200` |
| Height | `40` |
| FontWeight | `FontWeight.Bold` |
| Size | `24` |
| Color | `RGBA(16, 124, 16, 1)` |
| Visible | `varShowApprovalModal > 0` |

43. Set **Text:**

```powerfx
If(
    IsNumeric(txtEstimatedWeight.Text) && Value(txtEstimatedWeight.Text) > 0,
    "$" & Text(
        Max(
            3.00,
            Value(txtEstimatedWeight.Text) * If(
                varSelectedItem.Method.Value = "Resin",
                0.20,
                0.10
            )
        ),
        "[$-en-US]#,##0.00"
    ),
    "$3.00 (minimum)"
)
```

> 💰 **Pricing:** Filament = $0.10/gram, Resin = $0.20/gram, $3.00 minimum

---

### Comments Label (lblApprovalCommentsLabel)

44. Click **+ Insert** → **Text label**.
45. **Rename it:** `lblApprovalCommentsLabel`
46. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Additional Comments (optional):"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 400` |
| Width | `300` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowApprovalModal > 0` |

---

### Comments Text Input (txtApprovalComments)

47. Click **+ Insert** → **Text input**.
48. **Rename it:** `txtApprovalComments`
49. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 425` |
| Width | `560` |
| Height | `80` |
| HintText | `"Add any special instructions for this job..."` |
| Visible | `varShowApprovalModal > 0` |

---

### Cancel Button (btnApprovalCancel)

50. Click **+ Insert** → **Button**.
51. **Rename it:** `btnApprovalCancel`
52. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recApprovalModal.X + 300` |
| Y | `recApprovalModal.Y + 560` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |
| Visible | `varShowApprovalModal > 0` |

53. Set **OnSelect:**

```powerfx
Set(varShowApprovalModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtEstimatedWeight);
Reset(txtEstimatedTime);
Reset(txtApprovalComments);
Reset(ddApprovalStaff)
```

---

### Confirm Approval Button (btnApprovalConfirm)

54. Click **+ Insert** → **Button**.
55. **Rename it:** `btnApprovalConfirm`
56. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Confirm Approval"` |
| X | `recApprovalModal.X + 430` |
| Y | `recApprovalModal.Y + 560` |
| Width | `150` |
| Height | `36` |
| Fill | `RGBA(16, 124, 16, 1)` |
| Color | `Color.White` |
| Visible | `varShowApprovalModal > 0` |

57. Set **DisplayMode:**

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

58. Set **OnSelect:**

```powerfx
// Calculate cost
Set(varCalculatedCost, 
    Max(
        3.00,
        Value(txtEstimatedWeight.Text) * If(
            varSelectedItem.Method.Value = "Resin",
            0.20,
            0.10
        )
    )
);

// Update SharePoint item
// ⚠️ IMPORTANT: Use internal column names (EstimatedWeight, EstimatedTime) not display names
Patch(PrintRequests, varSelectedItem, {
    Status: LookUp(Choices(PrintRequests.Status), Value = "Pending"),
    NeedsAttention: false,
    LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
    LastActionBy: {
        Claims: "i:0#.f|membership|" & ddApprovalStaff.Selected.MemberEmail,
        Discipline: "",
        DisplayName: ddApprovalStaff.Selected.MemberName,
        Email: ddApprovalStaff.Selected.MemberEmail,
        JobTitle: "",
        Picture: ""
    },
    LastActionAt: Now(),
    EstimatedWeight: Value(txtEstimatedWeight.Text),
    EstimatedTime: If(IsNumeric(txtEstimatedTime.Text), Value(txtEstimatedTime.Text), Blank()),
    EstimatedCost: varCalculatedCost,
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "APPROVED by " & ddApprovalStaff.Selected.MemberName &
        ": Weight=" & txtEstimatedWeight.Text & "g, Cost=$" & Text(varCalculatedCost, "[$-en-US]#,##0.00") &
        If(!IsBlank(txtApprovalComments.Text), " - " & txtApprovalComments.Text, "") &
        " - " & Text(Now(), "mm/dd/yyyy")
    )
});

// Log action via Flow C
IfError(
    'Flow-(C)-Action-LogAction'.Run(
        Text(varSelectedItem.ID),
        "Approved",
        "Status",
        "Pending",
        ddApprovalStaff.Selected.MemberEmail
    ),
    Notify("Could not log approval.", NotificationType.Error),
    Notify("Approved! Student will receive estimate email.", NotificationType.Success)
);

// Close modal and reset
Set(varShowApprovalModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtEstimatedWeight);
Reset(txtEstimatedTime);
Reset(txtApprovalComments);
Reset(ddApprovalStaff)
```

---

# STEP 12: Building the Archive Modal

**What you're doing:** Creating a confirmation dialog for archiving completed/rejected requests.

### Control Hierarchy

```
scrDashboard
├── recArchiveOverlay         ← Dark semi-transparent background
├── recArchiveModal           ← White modal box (container)
├── lblArchiveTitle           ← "Archive Request - REQ-00042"
├── lblArchiveWarning         ← Warning message
├── lblArchiveStaffLabel      ← "Performing Action As: *"
├── ddArchiveStaff            ← Staff dropdown
├── lblArchiveReasonLabel     ← "Reason (optional):"
├── txtArchiveReason          ← Reason text input
├── btnArchiveCancel          ← Cancel button
└── btnArchiveConfirm         ← Confirm Archive button
```

---

### Modal Overlay (recArchiveOverlay)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. **Rename it:** `recArchiveOverlay`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `1366` |
| Height | `768` |
| Fill | `RGBA(0, 0, 0, 0.7)` |
| Visible | `varShowArchiveModal > 0` |

---

### Modal Content Box (recArchiveModal)

5. Click **+ Insert** → **Rectangle**.
6. **Rename it:** `recArchiveModal`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 500) / 2` |
| Y | `(Parent.Height - 400) / 2` |
| Width | `500` |
| Height | `400` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |
| Visible | `varShowArchiveModal > 0` |

---

### Modal Title (lblArchiveTitle)

8. Click **+ Insert** → **Text label**.
9. **Rename it:** `lblArchiveTitle`
10. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Archive Request - " & varSelectedItem.ReqKey` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 20` |
| Width | `460` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(100, 100, 100, 1)` |
| Visible | `varShowArchiveModal > 0` |

---

### Warning Message (lblArchiveWarning)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblArchiveWarning`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"⚠️ This will remove the request from active views. Archived requests can still be viewed in the Archived filter."` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 60` |
| Width | `460` |
| Height | `50` |
| Size | `12` |
| Color | `RGBA(150, 100, 0, 1)` |
| Visible | `varShowArchiveModal > 0` |

---

### Staff Label (lblArchiveStaffLabel)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblArchiveStaffLabel`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 120` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowArchiveModal > 0` |

---

### Staff Dropdown (ddArchiveStaff)

17. Click **+ Insert** → **Combo box**.
18. **Rename it:** `ddArchiveStaff`
19. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 145` |
| Width | `300` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowArchiveModal > 0` |

---

### Reason Label (lblArchiveReasonLabel)

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblArchiveReasonLabel`
22. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Reason (optional):"` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 195` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowArchiveModal > 0` |

---

### Reason Text Input (txtArchiveReason)

23. Click **+ Insert** → **Text input**.
24. **Rename it:** `txtArchiveReason`
25. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 220` |
| Width | `460` |
| Height | `80` |
| HintText | `"Why is this request being archived?"` |
| Visible | `varShowArchiveModal > 0` |

---

### Cancel Button (btnArchiveCancel)

26. Click **+ Insert** → **Button**.
27. **Rename it:** `btnArchiveCancel`
28. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recArchiveModal.X + 200` |
| Y | `recArchiveModal.Y + 340` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |
| Visible | `varShowArchiveModal > 0` |

29. Set **OnSelect:**

```powerfx
Set(varShowArchiveModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtArchiveReason);
Reset(ddArchiveStaff)
```

---

### Confirm Archive Button (btnArchiveConfirm)

30. Click **+ Insert** → **Button**.
31. **Rename it:** `btnArchiveConfirm`
32. Set properties:

| Property | Value |
|----------|-------|
| Text | `"📦 Confirm Archive"` |
| X | `recArchiveModal.X + 330` |
| Y | `recArchiveModal.Y + 340` |
| Width | `150` |
| Height | `36` |
| Fill | `RGBA(100, 100, 100, 1)` |
| Color | `Color.White` |
| Visible | `varShowArchiveModal > 0` |
| DisplayMode | `If(IsBlank(ddArchiveStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

33. Set **OnSelect:**

```powerfx
// Update SharePoint item
Patch(PrintRequests, varSelectedItem, {
    Status: LookUp(Choices(PrintRequests.Status), Value = "Archived"),
    NeedsAttention: false,
    LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
    LastActionBy: {
        Claims: "i:0#.f|membership|" & ddArchiveStaff.Selected.MemberEmail,
        Discipline: "",
        DisplayName: ddArchiveStaff.Selected.MemberName,
        Email: ddArchiveStaff.Selected.MemberEmail,
        JobTitle: "",
        Picture: ""
    },
    LastActionAt: Now(),
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "ARCHIVED by " & ddArchiveStaff.Selected.MemberName &
        If(!IsBlank(txtArchiveReason.Text), ": " & txtArchiveReason.Text, "") &
        " - " & Text(Now(), "mm/dd/yyyy")
    )
});

// Log action via Flow C
IfError(
    'Flow-(C)-Action-LogAction'.Run(
        Text(varSelectedItem.ID),
        "Archived",
        "Status",
        "Archived",
        ddArchiveStaff.Selected.MemberEmail
    ),
    Notify("Could not log archive.", NotificationType.Error),
    Notify("Request archived successfully.", NotificationType.Success)
);

// Close modal and reset
Set(varShowArchiveModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtArchiveReason);
Reset(ddArchiveStaff)
```

---

# STEP 12B: Building the Change Print Details Modal

**What you're doing:** Creating a modal that allows staff to change Method, Printer, Color, Weight, Hours, and recalculate Cost for a job. All changes are optional — staff can update any combination of fields.

> 💡 **Why this matters:** Provides flexibility to fix mistakes or adjust job parameters at any point in the workflow (except Pending status). Changing Method automatically resets the Printer dropdown to show compatible printers only.

> ⚠️ **Availability:** This modal is accessible from ALL status tabs EXCEPT Pending. The Edit button (✏️ Edit) appears near the "Additional Details" header on each job card.

### Control Hierarchy

```
scrDashboard
├── recDetailsOverlay         ← Dark semi-transparent background
├── recDetailsModal           ← White modal box (container)
├── lblDetailsTitle           ← "Change Print Details - REQ-00042"
├── lblDetailsCurrentLabel    ← "Current Settings:"
├── lblDetailsCurrent         ← Shows current settings summary
├── lblDetailsStaffLabel      ← "Performing Action As: *"
├── ddDetailsStaff            ← Staff dropdown
├── lblDetailsMethodLabel     ← "Method:"
├── ddDetailsMethod           ← Method dropdown (Filament/Resin)
├── lblDetailsPrinterLabel    ← "Printer:"
├── ddDetailsPrinter          ← Printer dropdown (filtered by method)
├── lblDetailsColorLabel      ← "Color:"
├── ddDetailsColor            ← Color dropdown
├── lblDetailsWeightLabel     ← "Est. Weight (grams):"
├── txtDetailsWeight          ← Weight number input
├── lblDetailsHoursLabel      ← "Est. Hours:"
├── txtDetailsHours           ← Hours number input
├── lblDetailsCostLabel       ← "Calculated Cost:"
├── lblDetailsCostValue       ← Auto-calculated cost display
├── btnDetailsCancel          ← Cancel button
└── btnDetailsConfirm         ← Save Changes button
```

---

### Modal Overlay (recDetailsOverlay)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. **Rename it:** `recDetailsOverlay`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `1366` |
| Height | `768` |
| Fill | `RGBA(0, 0, 0, 0.7)` |
| Visible | `varShowDetailsModal > 0` |

---

### Modal Content Box (recDetailsModal)

5. Click **+ Insert** → **Rectangle**.
6. **Rename it:** `recDetailsModal`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 550) / 2` |
| Y | `(Parent.Height - 620) / 2` |
| Width | `550` |
| Height | `620` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |
| Visible | `varShowDetailsModal > 0` |

---

### Modal Title (lblDetailsTitle)

8. Click **+ Insert** → **Text label**.
9. **Rename it:** `lblDetailsTitle`
10. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Change Print Details - " & varSelectedItem.ReqKey` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 20` |
| Width | `460` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(0, 120, 212, 1)` |
| Visible | `varShowDetailsModal > 0` |

---

### Current Settings Label (lblDetailsCurrentLabel)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblDetailsCurrentLabel`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Current Settings:"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 55` |
| Width | `150` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowDetailsModal > 0` |

---

### Current Settings Display (lblDetailsCurrent)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblDetailsCurrent`
16. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 75` |
| Width | `510` |
| Height | `30` |
| Size | `10` |
| Color | `RGBA(100, 100, 100, 1)` |
| Visible | `varShowDetailsModal > 0` |

17. Set **Text:**

```powerfx
varSelectedItem.Method.Value & " | " & 
Trim(If(Find("(", varSelectedItem.Printer.Value) > 0, Left(varSelectedItem.Printer.Value, Find("(", varSelectedItem.Printer.Value) - 1), varSelectedItem.Printer.Value)) & " | " &
varSelectedItem.Color.Value & " | " &
If(IsBlank(varSelectedItem.EstimatedWeight), "No weight", Text(varSelectedItem.EstimatedWeight) & "g") & " | " &
If(IsBlank(varSelectedItem.EstimatedCost), "No cost", "$" & Text(varSelectedItem.EstimatedCost, "[$-en-US]#,##0.00"))
```

---

### Staff Label (lblDetailsStaffLabel)

18. Click **+ Insert** → **Text label**.
19. **Rename it:** `lblDetailsStaffLabel`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 115` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowDetailsModal > 0` |

---

### Staff Dropdown (ddDetailsStaff)

21. Click **+ Insert** → **Combo box**.
22. **Rename it:** `ddDetailsStaff`
23. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 138` |
| Width | `250` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowDetailsModal > 0` |

---

### Method Label (lblDetailsMethodLabel)

24. Click **+ Insert** → **Text label**.
25. **Rename it:** `lblDetailsMethodLabel`
26. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Method:"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 185` |
| Width | `100` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowDetailsModal > 0` |

---

### Method Dropdown (ddDetailsMethod)

27. Click **+ Insert** → **Combo box**.
28. **Rename it:** `ddDetailsMethod`
29. Set properties:

| Property | Value |
|----------|-------|
| Items | `Choices([@PrintRequests].Method)` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 208` |
| Width | `150` |
| Height | `36` |
| DisplayFields | `["Value"]` |
| SearchFields | `["Value"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowDetailsModal > 0` |

> 💡 **Leaving empty:** `DefaultSelectedItems: Blank()` means no pre-selection. Staff can leave it empty to keep the current method.

> ⚠️ **Important:** Changing Method resets the Printer dropdown to show only compatible printers.

---

### Printer Label (lblDetailsPrinterLabel)

30. Click **+ Insert** → **Text label**.
31. **Rename it:** `lblDetailsPrinterLabel`
32. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Printer:"` |
| X | `recDetailsModal.X + 190` |
| Y | `recDetailsModal.Y + 185` |
| Width | `100` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowDetailsModal > 0` |

---

### Printer Dropdown (ddDetailsPrinter)

33. Click **+ Insert** → **Combo box**.
34. **Rename it:** `ddDetailsPrinter`
35. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 190` |
| Y | `recDetailsModal.Y + 208` |
| Width | `340` |
| Height | `36` |
| DisplayFields | `["Value"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowDetailsModal > 0` |

36. Set **Items** (filtered by Method — uses new method if selected, otherwise current):

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    With(
        {selectedMethod: If(!IsBlank(ddDetailsMethod.Selected), ddDetailsMethod.Selected.Value, varSelectedItem.Method.Value)},
        If(
            selectedMethod = "Filament",
            Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
            selectedMethod = "Resin",
            Value = "Form 3 (5.7×5.7×7.3in)",
            true
        )
    )
)
```

> 💡 **Dynamic filtering:** If staff selects a new Method, the Printer dropdown immediately updates to show only compatible printers.

---

### Color Label (lblDetailsColorLabel)

37. Click **+ Insert** → **Text label**.
38. **Rename it:** `lblDetailsColorLabel`
39. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Color:"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 255` |
| Width | `100` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowDetailsModal > 0` |

---

### Color Dropdown (ddDetailsColor)

40. Click **+ Insert** → **Combo box**.
41. **Rename it:** `ddDetailsColor`
42. Set properties:

| Property | Value |
|----------|-------|
| Items | `Choices([@PrintRequests].Color)` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 278` |
| Width | `200` |
| Height | `36` |
| DisplayFields | `["Value"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowDetailsModal > 0` |

---

### Weight Label (lblDetailsWeightLabel)

43. Click **+ Insert** → **Text label**.
44. **Rename it:** `lblDetailsWeightLabel`
45. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Est. Weight (g):"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 325` |
| Width | `130` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowDetailsModal > 0` |

---

### Weight Input (txtDetailsWeight)

46. Click **+ Insert** → **Text input**.
47. **Rename it:** `txtDetailsWeight`
48. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 348` |
| Width | `120` |
| Height | `36` |
| Format | `TextFormat.Number` |
| HintText | `"e.g., 25"` |
| Default | `If(IsBlank(varSelectedItem.EstimatedWeight), "", Text(varSelectedItem.EstimatedWeight))` |
| Visible | `varShowDetailsModal > 0` |

---

### Hours Label (lblDetailsHoursLabel)

49. Click **+ Insert** → **Text label**.
50. **Rename it:** `lblDetailsHoursLabel`
51. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Est. Hours:"` |
| X | `recDetailsModal.X + 160` |
| Y | `recDetailsModal.Y + 325` |
| Width | `100` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowDetailsModal > 0` |

---

### Hours Input (txtDetailsHours)

52. Click **+ Insert** → **Text input**.
53. **Rename it:** `txtDetailsHours`
54. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 160` |
| Y | `recDetailsModal.Y + 348` |
| Width | `100` |
| Height | `36` |
| Format | `TextFormat.Number` |
| HintText | `"e.g., 2.5"` |
| Default | `If(IsBlank(varSelectedItem.EstimatedTime), "", Text(varSelectedItem.EstimatedTime))` |
| Visible | `varShowDetailsModal > 0` |

---

### Cost Label (lblDetailsCostLabel)

55. Click **+ Insert** → **Text label**.
56. **Rename it:** `lblDetailsCostLabel`
57. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Calculated Cost:"` |
| X | `recDetailsModal.X + 280` |
| Y | `recDetailsModal.Y + 325` |
| Width | `130` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowDetailsModal > 0` |

---

### Cost Value Display (lblDetailsCostValue)

58. Click **+ Insert** → **Text label**.
59. **Rename it:** `lblDetailsCostValue`
60. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 280` |
| Y | `recDetailsModal.Y + 348` |
| Width | `150` |
| Height | `36` |
| Size | `18` |
| FontWeight | `FontWeight.Bold` |
| Color | `RGBA(16, 124, 16, 1)` |
| Visible | `varShowDetailsModal > 0` |

61. Set **Text** (auto-calculates based on weight and method):

```powerfx
With(
    {
        weight: If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) > 0, 
                   Value(txtDetailsWeight.Text), 
                   varSelectedItem.EstimatedWeight),
        method: If(!IsBlank(ddDetailsMethod.Selected), 
                   ddDetailsMethod.Selected.Value, 
                   varSelectedItem.Method.Value)
    },
    If(
        IsBlank(weight) || weight <= 0,
        "$3.00 (min)",
        "$" & Text(
            Max(3.00, weight * If(method = "Resin", 0.20, 0.10)),
            "[$-en-US]#,##0.00"
        )
    )
)
```

---

### Cancel Button (btnDetailsCancel)

62. Click **+ Insert** → **Button**.
63. **Rename it:** `btnDetailsCancel`
64. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recDetailsModal.X + 230` |
| Y | `recDetailsModal.Y + 560` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |
| Visible | `varShowDetailsModal > 0` |

65. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(ddDetailsStaff);
Reset(ddDetailsMethod);
Reset(ddDetailsPrinter);
Reset(ddDetailsColor);
Reset(txtDetailsWeight);
Reset(txtDetailsHours)
```

---

### Save Changes Button (btnDetailsConfirm)

66. Click **+ Insert** → **Button**.
67. **Rename it:** `btnDetailsConfirm`
68. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Save Changes"` |
| X | `recDetailsModal.X + 360` |
| Y | `recDetailsModal.Y + 560` |
| Width | `170` |
| Height | `36` |
| Fill | `RGBA(0, 120, 212, 1)` |
| Color | `Color.White` |
| Visible | `varShowDetailsModal > 0` |

69. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddDetailsStaff.Selected) && 
    (
        // At least one field must be changed
        (!IsBlank(ddDetailsMethod.Selected) && ddDetailsMethod.Selected.Value <> varSelectedItem.Method.Value) ||
        (!IsBlank(ddDetailsPrinter.Selected) && ddDetailsPrinter.Selected.Value <> varSelectedItem.Printer.Value) ||
        (!IsBlank(ddDetailsColor.Selected) && ddDetailsColor.Selected.Value <> varSelectedItem.Color.Value) ||
        (IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) <> Coalesce(varSelectedItem.EstimatedWeight, 0)) ||
        (IsNumeric(txtDetailsHours.Text) && Value(txtDetailsHours.Text) <> Coalesce(varSelectedItem.EstimatedTime, 0))
    ),
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

> 💡 Button is enabled only when staff is selected AND at least one field is being changed.

70. Set **OnSelect:**

```powerfx
// Calculate new cost based on weight and method
Set(varNewMethod, If(!IsBlank(ddDetailsMethod.Selected), ddDetailsMethod.Selected.Value, varSelectedItem.Method.Value));
Set(varNewWeight, If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) > 0, Value(txtDetailsWeight.Text), varSelectedItem.EstimatedWeight));
Set(varNewCost, If(IsBlank(varNewWeight), varSelectedItem.EstimatedCost, Max(3.00, varNewWeight * If(varNewMethod = "Resin", 0.20, 0.10))));

// Build change description for audit
Set(varChangeDesc, "");
If(!IsBlank(ddDetailsMethod.Selected) && ddDetailsMethod.Selected.Value <> varSelectedItem.Method.Value,
    Set(varChangeDesc, "Method: " & varSelectedItem.Method.Value & " → " & ddDetailsMethod.Selected.Value));
If(!IsBlank(ddDetailsPrinter.Selected) && ddDetailsPrinter.Selected.Value <> varSelectedItem.Printer.Value,
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & " | ") & "Printer: " & varSelectedItem.Printer.Value & " → " & ddDetailsPrinter.Selected.Value));
If(!IsBlank(ddDetailsColor.Selected) && ddDetailsColor.Selected.Value <> varSelectedItem.Color.Value,
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & " | ") & "Color: " & varSelectedItem.Color.Value & " → " & ddDetailsColor.Selected.Value));
If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) <> Coalesce(varSelectedItem.EstimatedWeight, 0),
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & " | ") & "Weight: " & Coalesce(varSelectedItem.EstimatedWeight, 0) & "g → " & txtDetailsWeight.Text & "g"));
If(IsNumeric(txtDetailsHours.Text) && Value(txtDetailsHours.Text) <> Coalesce(varSelectedItem.EstimatedTime, 0),
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & " | ") & "Hours: " & Coalesce(varSelectedItem.EstimatedTime, 0) & " → " & txtDetailsHours.Text));

// Update SharePoint item
Patch(
    PrintRequests,
    varSelectedItem,
    {
        Method: If(!IsBlank(ddDetailsMethod.Selected), ddDetailsMethod.Selected, varSelectedItem.Method),
        Printer: If(!IsBlank(ddDetailsPrinter.Selected), ddDetailsPrinter.Selected, varSelectedItem.Printer),
        Color: If(!IsBlank(ddDetailsColor.Selected), ddDetailsColor.Selected, varSelectedItem.Color),
        EstimatedWeight: If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) > 0, Value(txtDetailsWeight.Text), varSelectedItem.EstimatedWeight),
        EstimatedTime: If(IsNumeric(txtDetailsHours.Text) && Value(txtDetailsHours.Text) > 0, Value(txtDetailsHours.Text), varSelectedItem.EstimatedTime),
        EstimatedCost: varNewCost,
        LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Updated"),
        LastActionBy: {
            Claims: "i:0#.f|membership|" & ddDetailsStaff.Selected.MemberEmail,
            Discipline: "",
            DisplayName: ddDetailsStaff.Selected.MemberName,
            Email: ddDetailsStaff.Selected.MemberEmail,
            JobTitle: "",
            Picture: ""
        },
        LastActionAt: Now(),
        StaffNotes: Concatenate(
            If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
            "UPDATED by " & ddDetailsStaff.Selected.MemberName & ": " & varChangeDesc & " - " & Text(Now(), "mm/dd/yyyy")
        )
    }
);

// Log to audit via Flow C
IfError(
    'Flow-(C)-Action-LogAction'.Run(
        Text(varSelectedItem.ID),
        "Details Changed",
        "Details",
        varChangeDesc,
        ddDetailsStaff.Selected.MemberEmail
    ),
    Notify("Could not log changes.", NotificationType.Error),
    Notify("Print details updated successfully!", NotificationType.Success)
);

// Close modal and reset
Set(varShowDetailsModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(ddDetailsStaff);
Reset(ddDetailsMethod);
Reset(ddDetailsPrinter);
Reset(ddDetailsColor);
Reset(txtDetailsWeight);
Reset(txtDetailsHours)
```

> 💡 **Cost recalculation:** When weight or method changes, cost is automatically recalculated using the formula: `Max($3.00, weight × rate)` where rate is $0.10/g for Filament and $0.20/g for Resin

---

# STEP 12C: Building the Payment Recording Modal

**What you're doing:** Creating a modal that captures payment details when staff marks an item as "Picked Up". This ensures transaction numbers, actual weights, and final costs are recorded for accounting and reconciliation.

> 💡 **Why this matters:** Previously, clicking "Picked Up" immediately changed the status without recording any payment details. This modal requires staff to enter the actual weight (measured from the finished print), which auto-calculates the final cost, plus the TigerCASH transaction number for reconciliation.

> ⚠️ **Trigger:** This modal opens when staff clicks the "💰 Picked Up" button on items with Status = "Completed".

### Key Concept: Estimates vs Actuals

| Stage | Weight Field | Cost Field | When Set |
|-------|--------------|------------|----------|
| **Estimate** | EstimatedWeight | EstimatedCost | At approval (slicer prediction) |
| **Actual** | FinalWeight | FinalCost | At pickup (physical measurement) |

### Control Hierarchy

```
scrDashboard
├── recPaymentOverlay         ← Dark semi-transparent background
├── recPaymentModal           ← White modal box (container)
├── lblPaymentTitle           ← "Record Payment - REQ-00042"
├── lblPaymentStudent         ← Student name and estimated vs final info
├── lblPaymentStaffLabel      ← "Performing Action As: *"
├── ddPaymentStaff            ← Staff dropdown
├── lblPaymentTransLabel      ← "Transaction Number: *"
├── txtPaymentTransaction     ← Transaction number input (required)
├── lblPaymentWeightLabel     ← "Final Weight (grams): *"
├── txtPaymentWeight          ← Weight input (pre-filled with EstimatedWeight)
├── lblPaymentCostLabel       ← "Final Cost:"
├── lblPaymentCostValue       ← Auto-calculated cost display
├── lblPaymentDateLabel       ← "Payment Date: *"
├── dpPaymentDate             ← Date picker (default: Today())
├── lblPaymentNotesLabel      ← "Payment Notes (optional):"
├── txtPaymentNotes           ← Multi-line text input
├── chkPartialPickup          ← Partial pickup checkbox (keeps status as Completed)
├── btnPaymentCancel          ← Cancel button
└── btnPaymentConfirm         ← Record Payment button (changes color based on partial)
```

---

### Modal Overlay (recPaymentOverlay)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. **Rename it:** `recPaymentOverlay`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `1366` |
| Height | `768` |
| Fill | `RGBA(0, 0, 0, 0.7)` |
| Visible | `varShowPaymentModal > 0` |

---

### Modal Content Box (recPaymentModal)

5. Click **+ Insert** → **Rectangle**.
6. **Rename it:** `recPaymentModal`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 550) / 2` |
| Y | `(Parent.Height - 630) / 2` |
| Width | `550` |
| Height | `630` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |
| Visible | `varShowPaymentModal > 0` |

---

### Modal Title (lblPaymentTitle)

8. Click **+ Insert** → **Text label**.
9. **Rename it:** `lblPaymentTitle`
10. Set properties:

| Property | Value |
|----------|-------|
| Text | `"💳 Record Payment - " & varSelectedItem.ReqKey` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 20` |
| Width | `510` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(0, 158, 73, 1)` |
| Visible | `varShowPaymentModal > 0` |

---

### Student Info (lblPaymentStudent)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblPaymentStudent`
13. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 55` |
| Width | `510` |
| Height | `40` |
| Size | `12` |
| Color | `RGBA(100, 100, 100, 1)` |
| Visible | `varShowPaymentModal > 0` |

14. Set **Text:**

```powerfx
"Student: " & varSelectedItem.Student.DisplayName & Char(10) &
"Estimated: " & Text(varSelectedItem.EstimatedWeight) & "g → $" & Text(varSelectedItem.EstimatedCost, "[$-en-US]#,##0.00")
```

---

### Staff Label (lblPaymentStaffLabel)

15. Click **+ Insert** → **Text label**.
16. **Rename it:** `lblPaymentStaffLabel`
17. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 105` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowPaymentModal > 0` |

---

### Staff Dropdown (ddPaymentStaff)

18. Click **+ Insert** → **Combo box**.
19. **Rename it:** `ddPaymentStaff`
20. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 130` |
| Width | `300` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowPaymentModal > 0` |

---

### Transaction Label (lblPaymentTransLabel)

21. Click **+ Insert** → **Text label**.
22. **Rename it:** `lblPaymentTransLabel`
23. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Transaction Number: *"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 180` |
| Width | `250` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowPaymentModal > 0` |

---

### Transaction Input (txtPaymentTransaction)

24. Click **+ Insert** → **Text input**.
25. **Rename it:** `txtPaymentTransaction`
26. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 205` |
| Width | `250` |
| Height | `36` |
| HintText | `"TigerCASH receipt number"` |
| Visible | `varShowPaymentModal > 0` |

---

### Weight Label (lblPaymentWeightLabel)

27. Click **+ Insert** → **Text label**.
28. **Rename it:** `lblPaymentWeightLabel`
29. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Final Weight (grams): *"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 255` |
| Width | `250` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowPaymentModal > 0` |

---

### Weight Input (txtPaymentWeight)

30. Click **+ Insert** → **Text input**.
31. **Rename it:** `txtPaymentWeight`
32. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 280` |
| Width | `150` |
| Height | `36` |
| HintText | `"Weight in grams"` |
| Visible | `varShowPaymentModal > 0` |

33. Set **Default:**
- none.

> 💡 **Pre-fill:** The weight input pre-fills with the estimated weight. Staff should update this with the actual measured weight of the finished print.

---

### Cost Label (lblPaymentCostLabel)

34. Click **+ Insert** → **Text label**.
35. **Rename it:** `lblPaymentCostLabel`
36. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Final Cost:"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 330` |
| Width | `150` |
| Height | `25` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Visible | `varShowPaymentModal > 0` |

---

### Cost Value Display (lblPaymentCostValue)

37. Click **+ Insert** → **Text label**.
38. **Rename it:** `lblPaymentCostValue`
39. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 355` |
| Width | `200` |
| Height | `40` |
| FontWeight | `FontWeight.Bold` |
| Size | `24` |
| Color | `RGBA(0, 158, 73, 1)` |
| Visible | `varShowPaymentModal > 0` |

40. Set **Text:**

```powerfx
If(
    IsNumeric(txtPaymentWeight.Text) && Value(txtPaymentWeight.Text) > 0,
    "$" & Text(
        Max(
            3.00,
            Value(txtPaymentWeight.Text) * If(
                varSelectedItem.Method.Value = "Resin",
                0.20,
                0.10
            )
        ),
        "[$-en-US]#,##0.00"
    ),
    "$3.00 (minimum)"
)
```

> 💰 **Pricing:** Same formula as estimates: Filament = $0.10/gram, Resin = $0.20/gram, $3.00 minimum

---

### Date Label (lblPaymentDateLabel)

41. Click **+ Insert** → **Text label**.
42. **Rename it:** `lblPaymentDateLabel`
43. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payment Date: *"` |
| X | `recPaymentModal.X + 300` |
| Y | `recPaymentModal.Y + 180` |
| Width | `150` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowPaymentModal > 0` |

---

### Date Picker (dpPaymentDate)

44. Click **+ Insert** → **Date picker**.
45. **Rename it:** `dpPaymentDate`
46. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 300` |
| Y | `recPaymentModal.Y + 205` |
| Width | `200` |
| Height | `36` |
| DefaultDate | `Today()` |
| Visible | `varShowPaymentModal > 0` |

---

### Notes Label (lblPaymentNotesLabel)

47. Click **+ Insert** → **Text label**.
48. **Rename it:** `lblPaymentNotesLabel`
49. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payment Notes (optional):"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 410` |
| Width | `300` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowPaymentModal > 0` |

---

### Notes Text Input (txtPaymentNotes)

50. Click **+ Insert** → **Text input**.
51. **Rename it:** `txtPaymentNotes`
52. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 435` |
| Width | `510` |
| Height | `60` |
| HintText | `"Any discrepancies, special circumstances..."` |
| Visible | `varShowPaymentModal > 0` |

---

### Partial Pickup Checkbox (chkPartialPickup)

> 💡 **Use Case:** When students pick up only some of their printed items and will return for the rest. This keeps the job in "Completed" status so staff can process another payment later.

53. Click **+ Insert** → **Checkbox**.
54. **Rename it:** `chkPartialPickup`
55. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Partial Pickup — Student will return for remaining items"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 505` |
| Width | `510` |
| Height | `32` |
| FontItalic | `true` |
| Color | `RGBA(150, 100, 0, 1)` |
| Visible | `varShowPaymentModal > 0` |

> ⚠️ **Behavior:** When checked, the status stays "Completed" instead of changing to "Paid & Picked Up". Payment details are recorded in PaymentNotes, and staff can process additional payments when the student returns.

---

### Cancel Button (btnPaymentCancel)

56. Click **+ Insert** → **Button**.
57. **Rename it:** `btnPaymentCancel`
58. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recPaymentModal.X + 250` |
| Y | `recPaymentModal.Y + 570` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |
| Visible | `varShowPaymentModal > 0` |

59. Set **OnSelect:**

```powerfx
Set(varShowPaymentModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtPaymentTransaction);
Reset(txtPaymentWeight);
Reset(dpPaymentDate);
Reset(txtPaymentNotes);
Reset(ddPaymentStaff);
Reset(chkPartialPickup)
```

---

### Confirm Payment Button (btnPaymentConfirm)

60. Click **+ Insert** → **Button**.
61. **Rename it:** `btnPaymentConfirm`
62. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(chkPartialPickup.Value, "✓ Record Partial Payment", "✓ Record Payment")` |
| X | `recPaymentModal.X + 380` |
| Y | `recPaymentModal.Y + 570` |
| Width | `150` |
| Height | `36` |
| Fill | `If(chkPartialPickup.Value, RGBA(255, 140, 0, 1), RGBA(0, 158, 73, 1))` |
| Color | `Color.White` |
| Visible | `varShowPaymentModal > 0` |

> 💡 **Button changes color:** Green for full pickup, Orange for partial pickup.

63. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddPaymentStaff.Selected) && 
    !IsBlank(txtPaymentTransaction.Text) &&
    !IsBlank(txtPaymentWeight.Text) && 
    IsNumeric(txtPaymentWeight.Text) && 
    Value(txtPaymentWeight.Text) > 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

64. Set **OnSelect:**

```powerfx
// Calculate cost from weight picked up
Set(varFinalCost, 
    Max(
        3.00,
        Value(txtPaymentWeight.Text) * If(
            varSelectedItem.Method.Value = "Resin",
            0.20,
            0.10
        )
    )
);

// Build payment record string (used for both partial and full)
Set(varPaymentRecord,
    "PAYMENT by " & ddPaymentStaff.Selected.MemberName &
    ": Trans#=" & txtPaymentTransaction.Text & 
    ", Weight=" & txtPaymentWeight.Text & "g" &
    ", Cost=$" & Text(varFinalCost, "[$-en-US]#,##0.00") &
    If(chkPartialPickup.Value, " (PARTIAL)", "") &
    If(!IsBlank(txtPaymentNotes.Text), " - " & txtPaymentNotes.Text, "") &
    " - " & Text(Now(), "mm/dd/yyyy")
);

// Update SharePoint item - conditional on partial pickup
If(
    chkPartialPickup.Value,
    // PARTIAL PICKUP: Keep status as Completed, append to PaymentNotes
    Patch(PrintRequests, varSelectedItem, {
        // Status stays "Completed" - don't change it
        PaymentNotes: Concatenate(
            If(IsBlank(varSelectedItem.PaymentNotes), "", varSelectedItem.PaymentNotes & " | "),
            varPaymentRecord
        ),
        LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Updated"),
        LastActionBy: {
            Claims: "i:0#.f|membership|" & ddPaymentStaff.Selected.MemberEmail,
            Discipline: "",
            DisplayName: ddPaymentStaff.Selected.MemberName,
            Email: ddPaymentStaff.Selected.MemberEmail,
            JobTitle: "",
            Picture: ""
        },
        LastActionAt: Now(),
        StaffNotes: Concatenate(
            If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
            varPaymentRecord
        )
    }),
    // FULL PICKUP: Change status to Paid & Picked Up, record final details
    Patch(PrintRequests, varSelectedItem, {
        Status: LookUp(Choices(PrintRequests.Status), Value = "Paid & Picked Up"),
        TransactionNumber: txtPaymentTransaction.Text,
        FinalWeight: Value(txtPaymentWeight.Text),
        FinalCost: varFinalCost,
        PaymentDate: dpPaymentDate.SelectedDate,
        PaymentNotes: Concatenate(
            If(IsBlank(varSelectedItem.PaymentNotes), "", varSelectedItem.PaymentNotes & " | "),
            varPaymentRecord
        ),
        LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
        LastActionBy: {
            Claims: "i:0#.f|membership|" & ddPaymentStaff.Selected.MemberEmail,
            Discipline: "",
            DisplayName: ddPaymentStaff.Selected.MemberName,
            Email: ddPaymentStaff.Selected.MemberEmail,
            JobTitle: "",
            Picture: ""
        },
        LastActionAt: Now(),
        StaffNotes: Concatenate(
            If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
            varPaymentRecord
        )
    })
);

// Log action via Flow C
IfError(
    'Flow-(C)-Action-LogAction'.Run(
        Text(varSelectedItem.ID),
        If(chkPartialPickup.Value, "Partial Payment", "Status Change"),
        If(chkPartialPickup.Value, "Payment", "Status"),
        If(chkPartialPickup.Value, "Partial: $" & Text(varFinalCost, "[$-en-US]#,##0.00"), "Paid & Picked Up"),
        ddPaymentStaff.Selected.MemberEmail
    ),
    Notify("Could not log payment.", NotificationType.Error),
    If(
        chkPartialPickup.Value,
        Notify("Partial payment recorded! Job stays in Completed for remaining items.", NotificationType.Warning),
        Notify("Payment recorded! Item marked as picked up.", NotificationType.Success)
    )
);

// Close modal and reset
Set(varShowPaymentModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtPaymentTransaction);
Reset(txtPaymentWeight);
Reset(dpPaymentDate);
Reset(txtPaymentNotes);
Reset(ddPaymentStaff);
Reset(chkPartialPickup)
```

> 💡 **Partial Pickup Behavior:**
> - Status remains "Completed" (job stays visible in queue)
> - Payment details appended to PaymentNotes (creates a log)
> - Staff can process another pickup later
> - Final pickup (unchecked) records to FinalWeight/FinalCost fields

---

# STEP 14: Adding the Filter Bar

**What you're doing:** Creating a dedicated filter bar between the status tabs and job cards gallery with search and filter controls.

> ⚠️ **IMPORTANT:** You must create **ALL 4 controls** in this section. The filter bar won't look right if you only create some of them. The background rectangle (`recFilterBar`) provides the visual container for the other controls.

> 💡 **Design:** A clean horizontal bar with a subtle background containing search input, attention filter checkbox, and clear button.

### Control Hierarchy

```
scrDashboard
├── recFilterBar              ← Background bar (CREATE THIS FIRST!)
├── txtSearch                 ← Search input
├── chkNeedsAttention         ← Checkbox filter
└── btnClearFilters           ← Reset button
```

> 📐 **Positioning:** The filter bar sits at Y=110 (right below the status tabs which end at Y=110). The job cards gallery starts at Y=160 (after the 50px tall filter bar).

---

### Filter Bar Background (recFilterBar)

> ⚠️ **Create this FIRST!** This rectangle provides the visual background for the filter bar. Without it, the other controls will float awkwardly.

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. **Rename it:** `recFilterBar`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `110` |
| Width | `1366` |
| Height | `50` |
| Fill | `RGBA(248, 248, 248, 1)` |
| BorderColor | `RGBA(230, 230, 230, 1)` |
| BorderThickness | `1` |

---

### Search Text Input (txtSearch)

5. Click **+ Insert** → **Text input**.
6. **Rename it:** `txtSearch`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `20` |
| Y | `117` |
| Width | `350` |
| Height | `36` |
| BorderRadius | `4` |
| HintText | `"🔍 Search by name, email, or ReqKey..."` |
| BorderColor | `RGBA(200, 200, 200, 1)` |

8. Set **OnChange:**

```powerfx
Set(varSearchText, Self.Text)
```

---

### Needs Attention Checkbox (chkNeedsAttention)

9. Click **+ Insert** → **Checkbox**.
10. **Rename it:** `chkNeedsAttention`
11. Set properties:

| Property | Value |
|----------|-------|
| Text | `"⚡ Needs Attention Only"` |
| X | `400` |
| Y | `122` |
| Width | `200` |
| Height | `26` |
| Size | `11` |
| Color | `RGBA(80, 80, 80, 1)` |

12. Set **OnCheck:** `Set(varNeedsAttention, true)`
13. Set **OnUncheck:** `Set(varNeedsAttention, false)`

---

### Clear Filters Button (btnClearFilters)

14. Click **+ Insert** → **Button**.
15. **Rename it:** `btnClearFilters`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕ Clear"` |
| X | `1280` |
| Y | `117` |
| Width | `70` |
| Height | `36` |
| Fill | `RGBA(240, 240, 240, 1)` |
| Color | `RGBA(100, 100, 100, 1)` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

17. Set **OnSelect:**

```powerfx
Reset(txtSearch);
Set(varSearchText, "");
Set(varNeedsAttention, false);
Reset(chkNeedsAttention)
```

---

# STEP 15: Adding the Lightbulb Attention System

**What you're doing:** Adding a toggleable lightbulb icon to each card that marks items as needing attention.

### Lightbulb Icon (icoLightbulb)

1. In the Tree view, click on **galJobCards** to select the gallery.
2. Click **+ Insert** → **Icon**.
3. **Rename it:** `icoLightbulb`
4. Set properties:

| Property | Value |
|----------|-------|
| Icon | `Icon.Lightbulb` |
| X | `Parent.TemplateWidth - 30` |
| Y | `16` |
| Width | `24` |
| Height | `24` |
| Color | `If(ThisItem.NeedsAttention, RGBA(255, 215, 0, 1), RGBA(180, 180, 180, 1))` |
| Tooltip | `If(ThisItem.NeedsAttention, "Mark as handled", "Mark as needing attention")` |
| Visible | `true` |

5. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {NeedsAttention: !ThisItem.NeedsAttention})
```

---

### Optional: Animated Glow Timer (tmrGlow)

6. Click on **scrDashboard** in Tree view (outside the gallery).
7. Click **+ Insert** → **Input** → **Timer**.
8. **Rename it:** `tmrGlow`
9. Set properties:

| Property | Value |
|----------|-------|
| Duration | `1500` |
| Repeat | `true` |
| AutoStart | `true` |
| Visible | `false` |

10. Update `recCardBackground` (inside galJobCards). Set **Fill:**

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

---

# STEP 16: Adding the Attachments Modal

**What you're doing:** Creating a modal for staff to add/remove file attachments from requests.

### Control Hierarchy

```
scrDashboard
├── recFileOverlay               ← Dark semi-transparent background
├── recFileModal                 ← White modal box (container)
├── lblFileTitle                 ← "Manage Attachments - REQ-00042"
├── lblFileStaffLabel            ← "Performing Action As: *"
├── ddFileActor                  ← Staff dropdown
├── frmAttachmentsEdit           ← Edit form for attachments
├── btnFileSave                  ← Save Changes button
└── btnFileCancel                ← Cancel button
```

---

### Files Button in Job Card (btnFiles)

1. In the Tree view, click on **galJobCards** to select the gallery.
2. Click **+ Insert** → **Button**.
3. **Rename it:** `btnFiles`
4. Set properties:

| Property | Value |
|----------|-------|
| Text | `"📎 Files"` |
| X | `12` |
| Y | `Parent.TemplateHeight - 85` |
| Width | `80` |
| Height | `28` |
| Fill | `Color.White` |
| Color | `RGBA(0, 120, 212, 1)` |
| BorderColor | `RGBA(0, 120, 212, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Size | `10` |

5. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowAddFileModal, ThisItem.ID)
```

---

### Modal Overlay (recFileOverlay)

6. Click on **scrDashboard** in Tree view.
7. Click **+ Insert** → **Rectangle**.
8. **Rename it:** `recFileOverlay`
9. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `1366` |
| Height | `768` |
| Fill | `RGBA(0, 0, 0, 0.7)` |
| Visible | `varShowAddFileModal > 0` |

---

### Modal Content Box (recFileModal)

10. Click **+ Insert** → **Rectangle**.
11. **Rename it:** `recFileModal`
12. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 500) / 2` |
| Y | `(Parent.Height - 450) / 2` |
| Width | `500` |
| Height | `450` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |
| Visible | `varShowAddFileModal > 0` |

---

### Modal Title (lblFileTitle)

13. Click **+ Insert** → **Text label**.
14. **Rename it:** `lblFileTitle`
15. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Manage Attachments - " & varSelectedItem.ReqKey` |
| X | `recFileModal.X + 20` |
| Y | `recFileModal.Y + 20` |
| Width | `460` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(0, 120, 212, 1)` |
| Visible | `varShowAddFileModal > 0` |

---

### Staff Label (lblFileStaffLabel)

16. Click **+ Insert** → **Text label**.
17. **Rename it:** `lblFileStaffLabel`
18. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recFileModal.X + 20` |
| Y | `recFileModal.Y + 55` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `varShowAddFileModal > 0` |

---

### Staff Dropdown (ddFileActor)

19. Click **+ Insert** → **Combo box**.
20. **Rename it:** `ddFileActor`
21. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recFileModal.X + 20` |
| Y | `recFileModal.Y + 80` |
| Width | `300` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowAddFileModal > 0` |

---

### Edit Form for Attachments (frmAttachmentsEdit)

22. Click **+ Insert** → **Edit form**.
23. **Rename it:** `frmAttachmentsEdit`
24. Set properties:

| Property | Value |
|----------|-------|
| DataSource | `PrintRequests` |
| Item | `varSelectedItem` |
| X | `recFileModal.X + 20` |
| Y | `recFileModal.Y + 130` |
| Width | `460` |
| Height | `200` |
| Visible | `varShowAddFileModal > 0` |

25. In the **Fields** panel (right side), click **Edit fields**.
26. Remove all fields except **Attachments**.

#### Resizing the Attachments Data Card

27. In Tree view, expand `frmAttachmentsEdit` → click on **Attachments_DataCard1**.
28. In the **Properties panel** (right side), click **Advanced** tab.
29. Click **Unlock to change properties** (lock icon).
30. Set these properties on **Attachments_DataCard1**:

| Property | Value |
|----------|-------|
| Height | `180` |
| Width | `460` |

31. Inside the data card, click on the **DataCardValue** control (the actual attachments control).
32. Set its **Height** to `100`.

27. Set **OnSuccess:**

```powerfx
Patch(
    PrintRequests,
    frmAttachmentsEdit.LastSubmit,
    {
        LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "File Added"),
        LastActionBy: {
            Claims: "i:0#.f|membership|" & ddFileActor.Selected.MemberEmail,
            Discipline: "",
            DisplayName: ddFileActor.Selected.MemberName,
            Email: ddFileActor.Selected.MemberEmail,
            JobTitle: "",
            Picture: ""
        },
        LastActionAt: Now()
    }
);

Set(varShowAddFileModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(ddFileActor);
Notify("Attachments updated", NotificationType.Success)
```

---

### Save Button (btnFileSave)

28. Click **+ Insert** → **Button**.
29. **Rename it:** `btnFileSave`
30. Set properties:

| Property | Value |
|----------|-------|
| Text | `"💾 Save Changes"` |
| X | `recFileModal.X + 350` |
| Y | `recFileModal.Y + 390` |
| Width | `130` |
| Height | `36` |
| Fill | `RGBA(0, 120, 212, 1)` |
| Color | `Color.White` |
| Visible | `varShowAddFileModal > 0` |
| DisplayMode | `If(IsBlank(ddFileActor.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

31. Set **OnSelect:**

```powerfx
SubmitForm(frmAttachmentsEdit)
```

---

### Cancel Button (btnFileCancel)

32. Click **+ Insert** → **Button**.
33. **Rename it:** `btnFileCancel`
34. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recFileModal.X + 220` |
| Y | `recFileModal.Y + 390` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |
| Visible | `varShowAddFileModal > 0` |

35. Set **OnSelect:**

```powerfx
ResetForm(frmAttachmentsEdit);
Set(varShowAddFileModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(ddFileActor)
```

---

# STEP 17: Adding the Messaging System

**What you're doing:** Building the complete messaging system — including the modal for sending messages AND the message display on job cards.

> ⏸️ **STOP — Complete Prerequisites First:**
> 
> Before continuing with this step, you MUST complete these prerequisites:
> 1. **Create the `RequestComments` SharePoint list** — See `SharePoint/RequestComments-List-Setup.md`
> 2. **Return here** once the list is created
>
> ⚠️ Do NOT proceed until the RequestComments list exists in SharePoint.

---

## Step 17A: Adding the Data Connection

**What you're doing:** Connecting your app to the RequestComments list.

### Instructions

1. In the left panel, click the **Data** icon (cylinder).
2. Click **+ Add data** → **SharePoint**.
3. Select your site and check **RequestComments**.
4. Click **Connect**.

### Verification

In the Data panel, you should now see:
- ✅ PrintRequests
- ✅ AuditLog  
- ✅ Staff
- ✅ **RequestComments** ← NEW

---

## Step 17B: Adding Messages Display to Job Cards

**What you're doing:** Adding a message history section to each job card that shows the conversation between staff and students.

### Overview

This section shows message history between staff and students for each request, with visual distinction between outbound (staff) and inbound (student) messages.

### Instructions

Go back inside `galJobCards` gallery template to add the messages display.

#### Messages Header (lblMessagesHeader)

1. Click **+ Insert** → **Text label**.
2. **Rename it:** `lblMessagesHeader`
3. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Messages (" & CountRows(Filter(RequestComments, RequestID = ThisItem.ID)) & ")"` |
| X | `12` |
| Y | `260` |
| Width | `200` |
| Height | `20` |
| Font | `Font.'Segoe UI Semibold'` |
| Size | `11` |
| Color | `RGBA(80, 80, 80, 1)` |
| Visible | `true` |

#### Messages Gallery (galMessages)

4. Click **+ Insert** → **Blank vertical gallery**.
5. **Rename it:** `galMessages`
6. Set properties:

| Property | Value |
|----------|-------|
| Items | `Sort(Filter(RequestComments, RequestID = ThisItem.ID), SentAt, SortOrder.Descending)` |
| X | `12` |
| Y | `280` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `120` |
| TemplateSize | `70` |
| TemplatePadding | `2` |
| Visible | `!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID))` |
| ShowScrollbar | `true` |

> **Note:** TemplateSize is 70 to accommodate Direction indicator.

#### Inside galMessages — Message Background

7. Inside `galMessages`, add a **Rectangle** for message background:
   - **Name:** `recMessageBg`
   - **X:** `If(ThisItem.Direction.Value = "Outbound", Parent.TemplateWidth * 0.3, 0)`
   - **Y:** `0`
   - **Width:** `Parent.TemplateWidth * 0.7 - 10`
   - **Height:** `Parent.TemplateHeight - 4`
   - **Fill:** `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 0.1), RGBA(255, 248, 230, 1))`

> **Direction-based styling:**
> - **Outbound (staff → student):** Blue tint, aligned right
> - **Inbound (student → staff):** Warm yellow tint, aligned left

#### Inside galMessages — Direction Icon

8. Make sure you're inside `galMessages` (click on it in the Tree View).
9. Click **+ Insert** → **Icons** → select any icon (we'll change it dynamically).
10. **Rename it:** `icoMsgDirection`
11. Set properties:

| Property | Value |
|----------|-------|
| Icon | `If(ThisItem.Direction.Value = "Outbound", Icon.Send, Icon.Mail)` |
| X | `recMessageBg.X + 8` |
| Y | `4` |
| Width | `14` |
| Height | `14` |
| Color | `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(200, 150, 50, 1))` |

> **Icon behavior:** Shows "Send" arrow for staff messages (Outbound), "Mail" envelope for student replies (Inbound).

#### Inside galMessages — Author Label

12. Still inside `galMessages`, click **+ Insert** → **Text label**.
13. **Rename it:** `lblMsgAuthor`
14. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Author.DisplayName & " • " & Text(ThisItem.SentAt, "mmm dd, h:mm AM/PM")` |
| X | `recMessageBg.X + 26` |
| Y | `4` |
| Width | `180` |
| Height | `16` |
| Size | `9` |
| Color | `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(180, 130, 40, 1))` |
| FontItalic | `false` |
| Font | `Font.'Segoe UI Semibold'` |

#### Inside galMessages — Direction Badge

15. Still inside `galMessages`, click **+ Insert** → **Text label**.
16. **Rename it:** `lblMsgDirectionBadge`
17. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(ThisItem.Direction.Value = "Outbound", "SENT", "REPLY")` |
| X | `recMessageBg.X + recMessageBg.Width - 50` |
| Y | `4` |
| Width | `40` |
| Height | `14` |
| Size | `8` |
| Align | `Align.Right` |
| Color | `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(180, 130, 40, 1))` |
| FontItalic | `true` |

#### Inside galMessages — Message Content

18. Still inside `galMessages`, click **+ Insert** → **Text label**.
19. **Rename it:** `lblMsgContent`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(Len(ThisItem.Message) > 100, Left(ThisItem.Message, 100) & "...", ThisItem.Message)` |
| X | `recMessageBg.X + 8` |
| Y | `22` |
| Width | `recMessageBg.Width - 16` |
| Height | `40` |
| Size | `10` |
| Color | `RGBA(50, 50, 50, 1)` |

#### No Messages Placeholder (Outside galMessages)

21. Click on `galJobCards` in the Tree View (NOT galMessages — go up one level to the job card).
22. Click **+ Insert** → **Text label**.
23. **Rename it:** `lblNoMessages`
24. Set properties:

| Property | Value |
|----------|-------|
| Text | `"No messages yet"` |
| X | `12` |
| Y | `280` |
| Width | `200` |
| Height | `20` |
| Color | `RGBA(150, 150, 150, 1)` |
| FontItalic | `true` |
| Size | `10` |
| Visible | `IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID))` |

> **Note:** This label only shows when there are no messages for this request. It sits where the galMessages gallery would be.

#### Unread Badge (Outside galMessages)

25. Still in `galJobCards` (not galMessages), click **+ Insert** → **Text label**.
26. **Rename it:** `lblUnreadBadge`
27. Set properties:

| Property | Value |
|----------|-------|
| Text | `Text(CountRows(Filter(RequestComments, RequestID = ThisItem.ID, Direction.Value = "Inbound", ReadByStaff = false)))` |
| X | `120` |
| Y | `258` |
| Width | `20` |
| Height | `20` |
| Size | `10` |
| Fill | `RGBA(209, 52, 56, 1)` |
| Color | `Color.White` |
| Align | `Align.Center` |
| Visible | `!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID, Direction.Value = "Inbound", ReadByStaff = false))` |

> **Note:** The unread badge shows a red circle with the count of student replies that staff haven't read yet. It only appears when there are unread inbound messages.

---

## Step 17C: Building the Message Modal

**What you're doing:** Creating a modal for staff to send messages to students about their print requests without leaving the dashboard.

### Overview

This modal allows bi-directional communication between staff and students. Messages are stored in the `RequestComments` list and trigger email notifications to students via Flow D.

### Adding Variables to App.OnStart

Add these variables to your existing `App.OnStart`:

```powerfx
// === MESSAGE MODAL CONTROLS ===
Set(varShowMessageModal, 0);
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

### Modal Overlay (recMessageOverlay)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Rectangle**.
3. **Rename it:** `recMessageOverlay`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |
| Visible | `varShowMessageModal > 0` |

---

### Modal Content Box (recMessageModal)

5. Click **+ Insert** → **Rectangle**.
6. **Rename it:** `recMessageModal`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 500) / 2` |
| Width | `600` |
| Height | `500` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |
| Visible | `varShowMessageModal > 0` |

---

### Modal Title (lblMessageTitle)

8. Click **+ Insert** → **Text label**.
9. **Rename it:** `lblMessageTitle`
10. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Send Message - " & varSelectedItem.ReqKey` |
| X | `recMessageModal.X + 20` |
| Y | `recMessageModal.Y + 20` |
| Width | `400` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(70, 130, 220, 1)` |
| Visible | `varShowMessageModal > 0` |

---

### Student Info Label (lblMessageStudent)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblMessageStudent`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"To: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"` |
| X | `recMessageModal.X + 20` |
| Y | `recMessageModal.Y + 55` |
| Width | `560` |
| Height | `25` |
| Font | `Font.'Segoe UI'` |
| Size | `12` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `varShowMessageModal > 0` |

---

### Staff Attribution Label (lblMessageStaffLabel)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblMessageStaffLabel`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recMessageModal.X + 20` |
| Y | `recMessageModal.Y + 90` |
| Width | `200` |
| Height | `20` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `varShowMessageModal > 0` |

---

### Staff Attribution Dropdown (ddMessageStaff)

17. Click **+ Insert** → **Combo box**.
18. **Rename it:** `ddMessageStaff`
19. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recMessageModal.X + 20` |
| Y | `recMessageModal.Y + 115` |
| Width | `300` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Visible | `varShowMessageModal > 0` |

---

### Subject Label (lblMessageSubjectLabel)

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblMessageSubjectLabel`
22. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Subject: *"` |
| X | `recMessageModal.X + 20` |
| Y | `recMessageModal.Y + 165` |
| Width | `150` |
| Height | `20` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `varShowMessageModal > 0` |

---

### Subject Input (txtMessageSubject)

23. Click **+ Insert** → **Text input**.
24. **Rename it:** `txtMessageSubject`
25. Set properties:

| Property | Value |
|----------|-------|
| X | `recMessageModal.X + 20` |
| Y | `recMessageModal.Y + 190` |
| Width | `540` |
| Height | `40` |
| HintText | `"Brief subject (e.g., Question about your file)"` |
| Default | `""` |
| MaxLength | `200` |
| Visible | `varShowMessageModal > 0` |

---

### Message Body Label (lblMessageBodyLabel)

26. Click **+ Insert** → **Text label**.
27. **Rename it:** `lblMessageBodyLabel`
28. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Message: *"` |
| X | `recMessageModal.X + 20` |
| Y | `recMessageModal.Y + 240` |
| Width | `150` |
| Height | `20` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(50, 50, 50, 1)` |
| Visible | `varShowMessageModal > 0` |

---

### Message Body Input (txtMessageBody)

29. Click **+ Insert** → **Text input**.
30. **Rename it:** `txtMessageBody`
31. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recMessageModal.X + 20` |
| Y | `recMessageModal.Y + 265` |
| Width | `540` |
| Height | `140` |
| HintText | `"Type your message to the student..."` |
| Default | `""` |
| MaxLength | `2000` |
| Visible | `varShowMessageModal > 0` |

---

### Character Count Label (lblMessageCharCount)

32. Click **+ Insert** → **Text label**.
33. **Rename it:** `lblMessageCharCount`
34. Set properties:

| Property | Value |
|----------|-------|
| X | `recMessageModal.X + 460` |
| Y | `recMessageModal.Y + 408` |
| Width | `100` |
| Height | `20` |
| Size | `10` |
| Align | `Align.Right` |
| Visible | `varShowMessageModal > 0` |

35. Set **Text:**

```powerfx
Len(txtMessageBody.Text) & " / 2000 characters"
```

36. Set **Color:**

```powerfx
If(Len(txtMessageBody.Text) > 1800, RGBA(209, 52, 56, 1), RGBA(100, 100, 100, 1))
```

---

### Cancel Button (btnMessageCancel)

37. Click **+ Insert** → **Button**.
38. **Rename it:** `btnMessageCancel`
39. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recMessageModal.X + 340` |
| Y | `recMessageModal.Y + 440` |
| Width | `100` |
| Height | `40` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |
| Visible | `varShowMessageModal > 0` |

40. Set **OnSelect:**

```powerfx
Set(varShowMessageModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtMessageSubject);
Reset(txtMessageBody);
Reset(ddMessageStaff)
```

---

### Send Message Button (btnMessageSend)

41. Click **+ Insert** → **Button**.
42. **Rename it:** `btnMessageSend`
43. Set properties:

| Property | Value |
|----------|-------|
| Text | `"📧 Send Message"` |
| X | `recMessageModal.X + 450` |
| Y | `recMessageModal.Y + 440` |
| Width | `130` |
| Height | `40` |
| Fill | `RGBA(70, 130, 220, 1)` |
| Color | `Color.White` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |
| Visible | `varShowMessageModal > 0` |

44. Set **DisplayMode:**

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

45. Set **OnSelect:**

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
            Claims: "i:0#.f|membership|" & ddMessageStaff.Selected.MemberEmail,
            Department: "",
            DisplayName: ddMessageStaff.Selected.MemberName,
            Email: ddMessageStaff.Selected.MemberEmail,
            JobTitle: "",
            Picture: ""
        },
        AuthorRole: LookUp(Choices(RequestComments.AuthorRole), Value = "Staff"),
        Direction: LookUp(Choices(RequestComments.Direction), Value = "Outbound"),
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
        LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Comment Added"),
        LastActionBy: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & ddMessageStaff.Selected.MemberEmail,
            Department: "",
            DisplayName: ddMessageStaff.Selected.MemberName,
            Email: ddMessageStaff.Selected.MemberEmail,
            JobTitle: "",
            Picture: ""
        },
        LastActionAt: Now()
    }
);

// Close modal and notify
Set(varShowMessageModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));
Reset(txtMessageSubject);
Reset(txtMessageBody);
Reset(ddMessageStaff);

Notify("Message sent! Student will receive email notification.", NotificationType.Success)
```

> **Note:** The `Direction: {Value: "Outbound"}` field is required for the new email threading system. Flow D will detect this and send the email with threading headers. See `PowerAutomate/Flow-(D)-Message-Notifications.md` for details.

---

### Adding the Send Message Button to Job Cards

Add a "Send Message" button to each job card in the gallery.

---

### Gallery Message Button (btnCardSendMessage)

1. Inside `galJobCards`, click **+ Insert** → **Button**.
2. **Rename it:** `btnCardSendMessage`
3. Set properties:

| Property | Value |
|----------|-------|
| Text | `"💬 Message"` |
| X | `100` |
| Y | `Parent.TemplateHeight - 85` |
| Width | `100` |
| Height | `28` |
| Fill | `RGBA(70, 130, 220, 1)` |
| Color | `Color.White` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |

4. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowMessageModal, ThisItem.ID)
```

---

### Message Count Badge (Optional)

To show unread inbound message count on job cards.

---

### Unread Message Badge (lblCardMessageBadge)

1. Inside `galJobCards`, click **+ Insert** → **Text label**.
2. **Rename it:** `lblCardMessageBadge`
3. Set properties:

| Property | Value |
|----------|-------|
| X | `Parent.TemplateWidth - 365` |
| Y | `95` |
| Width | `24` |
| Height | `24` |
| Fill | `RGBA(209, 52, 56, 1)` |
| Color | `Color.White` |
| Align | `Align.Center` |
| VerticalAlign | `VerticalAlign.Middle` |
| Size | `10` |
| FontWeight | `FontWeight.Bold` |
| RadiusTopLeft | `12` |
| RadiusTopRight | `12` |
| RadiusBottomLeft | `12` |
| RadiusBottomRight | `12` |

4. Set **Text:**

```powerfx
Text(CountRows(Filter(RequestComments, RequestID = ThisItem.ID, Direction.Value = "Inbound", ReadByStaff = false)))
```

5. Set **Visible:**

```powerfx
!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID, Direction.Value = "Inbound", ReadByStaff = false))
```

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

# STEP 18: Publishing the App

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

# STEP 19: Testing the App

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

**Cause:** Incorrect person field format — SharePoint Person fields require all six properties.

**Solution:** Use this exact format with all six properties:

```powerfx
{
    Claims: "i:0#.f|membership|" & Lower(userEmail),
    Discipline: "",
    DisplayName: userName,
    Email: Lower(userEmail),
    JobTitle: "",
    Picture: ""
}
```

> ⚠️ All six properties (Claims, Department, DisplayName, Email, JobTitle, Picture) are required, even if some are empty strings.

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
| `varShowPaymentModal` | btnPickedUp click | Controls payment modal visibility |
| `varFinalCost` | Payment modal confirm | Calculated from FinalWeight |

## Person Field Format

```powerfx
{
    Claims: "i:0#.f|membership|" & email,
    Discipline: "",
    DisplayName: name,
    Email: email,
    JobTitle: "",
    Picture: ""
    Email: email
}
```

## Pricing Formula

**For Estimates (Approval Modal):**
```powerfx
// EstimatedCost from EstimatedWeight
Max(3.00, EstimatedWeight * If(Method = "Resin", 0.20, 0.10))
```

**For Finals (Payment Modal):**
```powerfx
// FinalCost from FinalWeight (actual measured weight)
Max(3.00, FinalWeight * If(Method = "Resin", 0.20, 0.10))
```

> 💡 **Estimate vs Actual:** EstimatedWeight/EstimatedCost are set at approval (slicer prediction). FinalWeight/FinalCost are recorded at payment pickup (physical measurement).

## Flow C Call Pattern

```powerfx
'Flow-(C)-Action-LogAction'.Run(
    Text(ThisItem.ID),      // RequestID
    "Status Change",        // Action
    "Status",               // FieldName
    "NewStatus",            // NewValue
    varMeEmail              // ActorEmail
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
Blank()

// DisplayFields
["MemberName"]

// SearchFields
["MemberName"]
```

> ⚠️ **Important:** The `colStaff` collection uses flattened columns (`MemberName`, `MemberEmail`) instead of the SharePoint Person column (`Member`). This is because Person columns are complex types that can't be directly displayed in dropdowns. The `ForAll` function in App.OnStart extracts the display name and email into simple text columns.

## Expand/Collapse Toggle — REMOVED

> ⚠️ **No longer used:** All card details are always visible. The expand/collapse functionality has been removed for a cleaner layout.

## Button Visibility by Status

| Button | Visible When |
|--------|-------------|
| Approve | `Status.Value = "Uploaded"` |
| Reject | `Status.Value in ["Uploaded", "Pending"]` |
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
