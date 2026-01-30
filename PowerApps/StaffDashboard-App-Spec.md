# Staff Console — Canvas App (Tablet)

**⏱️ Time Required:** 8-12 hours (can be done in multiple sessions)  
**🎯 Goal:** Staff can view, manage, and process all 3D print requests through an intuitive dashboard

> 📚 **This is the comprehensive guide** — includes step-by-step build instructions, code references, and quick-copy snippets.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Design Standards](#design-standards) ← **Font & Color Reference**
3. [Creating the Canvas App](#step-1-creating-the-canvas-app)
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
17. [Building the Notes Modal](#step-13-building-the-notes-modal)
18. [Adding Search and Filters](#step-14-adding-search-and-filters)
18. [Adding the Lightbulb Attention System](#step-15-adding-the-lightbulb-attention-system)
19. [Adding the Attachments Modal](#step-16-adding-the-attachments-modal)
20. [Adding the Messaging System](#step-17-adding-the-messaging-system) ← **⏸️ STOP: Create RequestComments list first**
    - [Step 17A: Adding the Data Connection](#step-17a-adding-the-data-connection)
    - [Step 17B: Adding Messages Display to Job Cards](#step-17b-adding-messages-display-to-job-cards)
    - [Step 17C: Building the Message Modal](#step-17c-building-the-message-modal)
    - [Step 17D: View Messages Modal](#step-17d-view-messages-modal) ← **NEW**
    - [Step 17E: Adding the Loading Overlay](#step-17e-adding-the-loading-overlay) ← **UX Enhancement**
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

## Design Standards

This app follows consistent design patterns for a professional appearance:

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App Title | `Font.'Segoe UI'` | 18 | Semibold |
| Modal Titles | `Font.'Segoe UI'` | 20 | Semibold |
| Section Headers | `Font.'Segoe UI'` | 11-12 | Semibold |
| Body Text | `Font.'Segoe UI'` | 10-11 | Normal |
| Labels/Hints | `Font.'Segoe UI'` | 8-10 | Normal |
| Buttons | `Font.'Segoe UI'` | 10-13 | Normal |

> ⚠️ **Consistency Rule:** Always use `Font.'Segoe UI'` throughout the app. Avoid mixing fonts like `Font.'Open Sans'` — stick to the Microsoft design language.

### Color Palette

| Purpose | Color | RGBA |
|---------|-------|------|
| Primary (Active) | Blue | `RGBA(56, 96, 178, 1)` |
| Success | Green | `RGBA(16, 124, 16, 1)` |
| Warning | Amber | `RGBA(255, 185, 0, 1)` |
| Error/Reject | Red | `RGBA(209, 52, 56, 1)` |
| Info | Light Blue | `RGBA(70, 130, 220, 1)` |
| Header Background | Dark Gray | `RGBA(45, 45, 48, 1)` |
| Modal Overlay | Black 70% | `RGBA(0, 0, 0, 0.7)` |
| Card Background | White | `Color.White` |
| Muted Text | Gray | `RGBA(100, 100, 100, 1)` |

### Button Styles

| Type | Fill | Color | Border |
|------|------|-------|--------|
| Primary Action | Solid color | White | None |
| Secondary/Outline | White | Colored | Colored, 1px |
| Danger | White | Red | Red, 1px |
| Navigation (Active) | `RGBA(70, 130, 220, 1)` | White | None |
| Navigation (Inactive) | `RGBA(60, 60, 65, 1)` | White | None |

### Corner Radius Standards

| Element Type | Radius | Examples |
|--------------|--------|----------|
| Cards & Modals | `8` | `recCardBackground`, `recApprovalModal` |
| Primary Buttons | `6` | `btnMessageSend`, `btnCardSendMessage` |
| Action Buttons | `4` | `btnApprove`, `btnReject`, `btnEditDetails` |
| Text Inputs | `4` | `txtSearch` |

> 💡 **Consistency Tip:** Apply all four radius properties together:
> ```powerfx
> RadiusTopLeft: 4
> RadiusTopRight: 4
> RadiusBottomLeft: 4
> RadiusBottomRight: 4
> ```

### Layout Dimensions (Dynamic Sizing)

Use **Parent-relative sizing** for responsive layouts:

| Element | Width | Height | Formula |
|---------|-------|--------|---------|
| Full-width bars | 100% | Fixed | `Parent.Width` / `60` |
| Galleries | 100% | Fill remaining | `Parent.Width` / `Parent.Height - 160` |
| Modal overlay | 100% | 100% | `Parent.Width` / `Parent.Height` |
| Modal box | Centered | Centered | `(Parent.Width - Self.Width) / 2` for X |
| Cards in gallery | Auto | Fixed | Controlled by `WrapCount` and `TemplateSize` |

#### Modal Dimensions Reference

| Modal | Width | Height | Notes |
|-------|-------|--------|-------|
| Approval | 600 | 650 | Includes cost calculator |
| Rejection | 600 | 610 | Multiple checkboxes |
| Archive | 500 | 400 | Simple confirmation |
| Details | 550 | 620 | Multiple dropdowns |
| Payment | 550 | 630 | Includes partial pickup |
| Files | 500 | 450 | Attachment form |
| Message | 600 | 500 | Text input area |

> ⚡ **Responsive Modal Sizing:** For better responsiveness on smaller screens, use `Min()`:
> ```powerfx
> Width: Min(600, Parent.Width - 40)
> Height: Min(650, Parent.Height - 40)
> X: (Parent.Width - Min(600, Parent.Width - 40)) / 2
> Y: (Parent.Height - Min(650, Parent.Height - 40)) / 2
> ```

#### Common Dynamic Formulas

```powerfx
// Full-width element
Width: Parent.Width

// Centered horizontally (for 600px wide modal)
X: (Parent.Width - 600) / 2

// Centered vertically (for 500px tall modal)  
Y: (Parent.Height - 500) / 2

// Fill remaining height (below 160px of header/tabs/filters)
Height: Parent.Height - 160

// Percentage-based width
Width: Parent.Width * 0.8

// Right-aligned element
X: Parent.Width - Self.Width - 20
```

> 💡 **Best Practice:** Always use `Parent.Width` and `Parent.Height` instead of hard-coded values like `1366` or `768`. This ensures the app adapts to different screen sizes and orientations.

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
Set(varShowNotesModal, 0);
Set(varShowViewMessagesModal, 0);

// Currently selected item for modals (typed to PrintRequests schema)
Set(varSelectedItem, Blank());

// === LOADING STATE ===
// Controls loading overlay visibility during async operations
Set(varIsLoading, false);

// === PRICING CONFIGURATION ===
// Centralized pricing rates - change here to update all cost calculations
Set(varFilamentRate, 0.10);    // $ per gram for filament printing
Set(varResinRate, 0.20);       // $ per gram for resin printing  
Set(varMinimumCost, 3.00);     // Minimum charge for any print job

// === STYLING / THEMING ===
// Centralized font setting - use varAppFont in controls for easy bulk updates
Set(varAppFont, Font.'Segoe UI');

Set(varLoadingMessage, "")
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
| `varShowNotesModal` | ID of item for notes modal (0=hidden) | Number |
| `varShowViewMessagesModal` | ID of item for view messages modal (0=hidden) | Number |
| `varSelectedItem` | Item currently selected for modal | PrintRequests Record |
| `varIsLoading` | Shows loading overlay during operations | Boolean |
| `varLoadingMessage` | Custom message shown during loading | Text |
| `varFilamentRate` | Cost per gram for filament printing | Number |
| `varResinRate` | Cost per gram for resin printing | Number |
| `varMinimumCost` | Minimum charge for any print job | Number |
| `varAppFont` | Global font for consistent styling | Font |

> 💡 **Styling Tip:** Use `varAppFont` in control Font properties instead of hardcoding `Font.'Segoe UI'`. This lets you change the app-wide font with a single edit in OnStart.

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

### Complete Tree View — All Controls

Here's the **complete Tree view** exactly as it should appear in Power Apps after all steps are complete:

> ⚠️ **Z-ORDER RULE:** TOP of list = FRONT (renders on top) · BOTTOM of list = BACK (renders behind)

> 📝 **Build Order Notes:**
> - Controls are listed in Z-order (top = front), not build order
> - **Modals use Containers** — each modal is wrapped in a Container control for easier management
> - Loading Overlay container must be at top for highest Z-order
> - Setting `Visible` on a container automatically hides/shows ALL child controls

### 🎯 Why Containers for Modals?

| Before (Flat) | After (Container) |
|--------------|-------------------|
| Set `Visible` on 15+ individual controls | Set `Visible` on 1 container |
| Drag 15+ controls to reorder z-index | Drag 1 container to reorder |
| Complex positioning (relative to screen) | Simple positioning (relative to container) |
| Risk of forgetting visibility on some controls | All children automatically inherit visibility |

> 💡 **Container Benefits:**
> - **Single Visibility Control** — Set `Visible` on the container, all children inherit it
> - **Easy Repositioning** — Move or resize the entire modal as one unit
> - **Better Organization** — All modal controls grouped in Tree view under one parent
> - **Cleaner Code** — No need to set `Visible` formula on every child control

```
▼ App
▼ scrDashboard
    ▼ conLoadingOverlay               ← Step 17E (Loading — TOP for highest z-order)
        lblLoadingMessage
        lblLoadingSpinner
        recLoadingBox
        recLoadingOverlay
    ▼ conMessageModal                 ← Step 17C (Send Message Modal Container)
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
    ▼ conViewMessagesModal            ← Step 17D (View Messages Modal Container)
        btnViewMsgClose
        btnViewMsgSendNew
        btnViewMsgMarkRead
        galViewMessages
        lblViewMsgTitle
        recViewMsgModal
        recViewMsgOverlay
    ▼ conFileModal                    ← Step 16 (Files Modal Container)
        btnFileCancel
        btnFileSave
        frmAttachmentsEdit
        ddFileActor
        lblFileStaffLabel
        lblFileTitle
        recFileModal
        recFileOverlay
    ▼ conNotesModal                   ← Step 13 (Notes Modal Container)
        btnNotesClose
        btnAddNote
        btnNotesCancel
        txtAddNote
        lblAddNoteLabel
        ddNotesStaff
        lblNotesStaffLabel
        txtStaffNotesContent
        lblStaffNotesHeader
        txtStudentNotesContent
        lblStudentNotesHeader
        lblNotesTitle
        recNotesModal
        recNotesOverlay
    ▼ conPaymentModal                 ← Step 12C (Payment Modal Container)
        btnPaymentConfirm
        btnPaymentCancel
        chkPartialPickup
        txtPaymentNotes
        lblPaymentNotesLabel
        dpPaymentDate
        lblPaymentDateLabel
        lblPaymentCostValue
        lblPaymentCostLabel
        txtPaymentWeight
        lblPaymentWeightLabel
        txtPaymentTransaction
        lblPaymentTransLabel
        ddPaymentStaff
        lblPaymentStaffLabel
        lblPaymentStudent
        lblPaymentTitle
        recPaymentModal
        recPaymentOverlay
    ▼ conDetailsModal                 ← Step 12B (Details Modal Container)
        btnDetailsConfirm
        btnDetailsCancel
        lblDetailsCostValue
        lblDetailsCostLabel
        txtDetailsHours
        lblDetailsHoursLabel
        txtDetailsWeight
        lblDetailsWeightLabel
        ddDetailsColor
        lblDetailsColorLabel
        ddDetailsPrinter
        lblDetailsPrinterLabel
        ddDetailsMethod
        lblDetailsMethodLabel
        ddDetailsStaff
        lblDetailsStaffLabel
        lblDetailsCurrent
        lblDetailsCurrentLabel
        lblDetailsTitle
        recDetailsModal
        recDetailsOverlay
    ▼ conArchiveModal                 ← Step 12 (Archive Modal Container)
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
    ▼ conApprovalModal                ← Step 11 (Approval Modal Container)
        btnApprovalConfirm
        btnApprovalCancel
        txtApprovalComments
        lblApprovalCommentsLabel
        lblApprovalCostValue
        lblApprovalCostLabel
        txtEstimatedTime
        lblApprovalTimeLabel
        lblWeightValidation
        txtEstimatedWeight
        lblApprovalWeightLabel
        ddApprovalStaff
        lblApprovalStaffLabel
        lblApprovalStudent
        lblApprovalTitle
        recApprovalModal
        recApprovalOverlay
    ▼ conRejectModal                  ← Step 10 (Reject Modal Container)
        btnRejectConfirm
        btnRejectCancel
        txtRejectComments
        lblRejectCommentsLabel
        chkNotJoined
        chkOverhangs
        chkMessy
        chkScale
        chkNotSolid
        chkGeometry
        chkTooSmall
        lblRejectReasonsLabel
        ddRejectStaff
        lblRejectStaffLabel
        lblRejectStudent
        lblRejectTitle
        recRejectModal
        recRejectOverlay
    btnClearFilters                   ← Step 14
    btnRefresh                        ← Step 14
    chkNeedsAttention                 ← Step 14
    txtSearch                         ← Step 14
    recFilterBar                      ← Step 14 (filter bar background)
    ▼ galJobCards                     ← Step 6
        btnCardSendMessage            ← Step 16C
        lblUnreadBadge                ← Step 16B
        btnViewMessages               ← Step 16B (opens View Messages Modal)
        lblMessagesHeader             ← Step 16B
        btnFiles                      ← Step 16
        btnEditDetails                ← Step 12B
        btnPickedUp                   ← Step 9
        btnComplete                   ← Step 9
        btnStartPrint                 ← Step 9
        btnArchive                    ← Step 9
        btnReject                     ← Step 9
        btnApprove                    ← Step 9
        icoLightbulb                  ← Step 15
        lblCourse                     ← Step 7
        lblCourseLabel                ← Step 7
        lblProjectType                ← Step 7
        lblProjectTypeLabel           ← Step 7
        lblDiscipline                 ← Step 7
        lblDisciplineLabel            ← Step 7
        lblCreatedLabel               ← Step 7
        lblJobIdLabel                 ← Step 7
        lblDetailsHeader              ← Step 7
        lblCreated                    ← Step 7
        lblJobId                      ← Step 7
        btnViewNotes                  ← Step 7 (opens Notes Modal)
        lblEstimates                  ← Step 7 (shows after approval)
        lblColor                      ← Step 7
        lblPrinter                    ← Step 7
        lblStudentEmail               ← Step 7
        lblFilename                   ← Step 7
        lblSubmittedTime              ← Step 7
        lblStudentName                ← Step 7
        recCardBackground             ← Step 7
    lblEmptyState                     ← Step 9
    ▼ galStatusTabs                   ← Step 5
        btnStatusTab                  ← Step 5
    lblUserName                       ← Step 4
    btnNavAnalytics                   ← Step 4
    btnNavAdmin                       ← Step 4
    btnNavDashboard                   ← Step 4
    lblAppTitle                       ← Step 4
    recHeader                         ← Step 4
```

### Key Rules

| Rule | Explanation |
|------|-------------|
| **App = formulas only** | Only put formulas like `OnStart` here. Never visual elements. |
| **scrDashboard = all visuals** | All rectangles, labels, buttons, galleries go here. |
| **Modals use Containers** | Each modal is wrapped in a Container control — set Visible on container only! |
| **Galleries are special** | If you select a gallery and then Insert, the new control goes INSIDE that gallery's template. |
| **Containers are special** | If you select a container and then Insert, the new control goes INSIDE that container. |
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
| Width | `Parent.Width` |
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
   - **X:** `Parent.Width - 216`
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
   - **Width:** `Parent.Width`
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

> 💡 **Why these sizes?** 8 tabs × 165px = 1320px fits most tablet screens. The gallery uses `Parent.Width` so tabs scale with screen size. Font size 11 ensures "Paid & Picked Up" fits.

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
| Width | `Parent.Width` |
| Height | `Parent.Height - 160` |
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
    "NeedsAttention", SortOrder.Descending,  // Attention items first (true > false)
    "Created", SortOrder.Ascending            // Then oldest first (longest in queue)
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
| Fill | `If(ThisItem.NeedsAttention, RGBA(255, 235, 180, 1), Color.White)` |
| BorderColor | `If(ThisItem.NeedsAttention, RGBA(255, 180, 0, 1), RGBA(220, 220, 220, 1))` |
| BorderThickness | `If(ThisItem.NeedsAttention, 2, 1)` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

> 💡 **Attention Styling:** Cards needing attention get a warm yellow background `RGBA(255, 235, 180, 1)` with an orange border `RGBA(255, 180, 0, 1)` and thicker border (2px vs 1px).

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

**⬇️ FORMULA: Shows relative time since submission (with "Just now" for recent items)**

```powerfx
If(
    DateDiff(ThisItem.Created, Now(), TimeUnit.Minutes) < 1,
    "Just now",
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
)
```

> 💡 **Time Display:**
> - "Just now" for items less than 1 minute old
> - "Submitted Xd Xh Xm ago" for older items
> - Red color indicates urgency

### File Name / Request Info (lblFilename)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblFilename`
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
    "Black", RGBA(26, 26, 26, 1),
    "White", RGBA(180, 180, 180, 1),
    "Gray", RGBA(128, 128, 128, 1),
    "Red", RGBA(204, 0, 0, 1),
    "Orange", RGBA(255, 102, 0, 1),
    "Yellow", RGBA(255, 215, 0, 1),
    "Green", RGBA(76, 175, 80, 1),
    "Forest Green", RGBA(34, 139, 34, 1),
    "Blue", RGBA(0, 102, 204, 1),
    "Purple", RGBA(107, 63, 160, 1),
    "Brown", RGBA(93, 64, 55, 1),
    "Chocolate Brown", RGBA(123, 63, 0, 1),
    "Copper", RGBA(184, 115, 51, 1),
    "Bronze", RGBA(205, 127, 50, 1),
    "Silver", RGBA(192, 192, 192, 1),
    "Clear", RGBA(245, 245, 245, 1),
    "Any", RGBA(224, 224, 224, 1),
    RGBA(153, 153, 153, 1)
)
```

> 💡 **Note:** Uses `ThisItem.Color.Value` because Color is a Choice field in SharePoint. Colors match the SharePoint column formatting in `FilamentColor-Column-Formatting.json`.

---

### Estimates Display (lblEstimates)

24. Click **+ Insert** → **Text label**.
25. **Rename it:** `lblEstimates`
26. Set properties:

| Property | Value |
|----------|-------|
| X | `12` |
| Y | `95` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(100, 100, 100, 1)` |

27. Set **Text:**

```powerfx
If(
    !IsBlank(ThisItem.EstimatedWeight),
    "⚖ " & Text(ThisItem.EstimatedWeight) & "g" &
    If(!IsBlank(ThisItem.EstimatedTime), " · ⏱ ~" & Text(ThisItem.EstimatedTime) & "h", "") &
    If(!IsBlank(ThisItem.EstimatedCost), " · 💲" & Text(ThisItem.EstimatedCost, "[$-en-US]#,##0.00"), ""),
    ""
)
```

28. Set **Visible:** `!IsBlank(ThisItem.EstimatedWeight)`

> 💡 **When it shows:** This label only appears after approval, when EstimatedWeight has been set. Displays weight, optional print time, and calculated cost.

---

### View Notes Button (btnViewNotes)

24. Click **+ Insert** → **Button**.
25. **Rename it:** `btnViewNotes`
26. Set properties:

| Property | Value |
|----------|-------|
| Text | `"View Notes"` |
| X | `12` |
| Y | `100` |
| Width | `80` |
| Height | `28` |
| Fill | `RGBA(240, 240, 240, 1)` |
| Color | `RGBA(50, 50, 50, 1)` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Size | `11` |

27. Set **OnSelect:**

```powerfx
Set(varShowNotesModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Note:** This button opens the Notes Modal (Step 13) which displays both Student Notes and Staff Notes, and allows staff to add new notes.

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
| Text | `Coalesce(Text(ThisItem.'Course Number'), "—")` |
| _Note_ | Use `Text()` for numeric columns to avoid the runtime error "The value '' cannot be converted to a number." |
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
    btnViewNotes
    lblEstimates
    lblColor
    lblPrinter
    lblStudentEmail
    lblFilename
    lblSubmittedTime
    lblStudentName
    recCardBackground              ← Bottom (background)
```

Each card displays:
- Student name + submission time
- File/request info
- Email and printer
- Color indicator
- Estimates (weight, time, cost) — visible after approval
- View Notes button (opens Notes Modal)
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

The `varActor` variable creates a Person record for the **current logged-in user**. This can be used for quick Patch operations that don't require a staff dropdown selection.

1. Click on **scrDashboard** in Tree view.
2. Set the **OnVisible** property:

**⬇️ FORMULA: Paste into scrDashboard.OnVisible**

```powerfx
Set(varActor, {
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & varMeEmail,
    Discipline: "",
    DisplayName: varMeName,
    Email: varMeEmail,
    JobTitle: "",
    Picture: ""
})
```

> 💡 **`varActor` vs Staff Dropdowns:** Modal actions use staff dropdowns so staff can process actions on behalf of others. Use `varActor` only when you need a quick Patch with the current user and don't need dropdown selection.

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
    Text(ThisItem.ID),      // RequestID
    "Status Change",        // Action
    "Status",               // FieldName
    "Printing",             // NewValue
    varMeEmail              // ActorEmail
);

Notify("Print started!", NotificationType.Success)
```

> 💡 **Flow C Parameters:** Pass 5 parameters: RequestID, Action, FieldName, NewValue, ActorEmail. The flow auto-populates ClientApp ("Power Apps") and Notes.

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
    Text(ThisItem.ID),      // RequestID
    "Status Change",        // Action
    "Status",               // FieldName
    "Completed",            // NewValue
    varMeEmail              // ActorEmail
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
| Visible | `Not(ThisItem.Status.Value in ["Pending", "Uploaded"])` |

28. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Visibility:** Available on ALL status tabs except Pending and Uploaded. New submissions need to be reviewed and assigned estimates first before details can be edited. Positioned near the "Additional Details" header for consistent placement regardless of which action buttons are showing.

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
| X | `(Parent.Width - 400) / 2` |
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

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls — no need to set visibility on each individual control!

### Modal Structure (Container-Based)

All controls are added **INSIDE** the `conRejectModal` container. The container handles visibility for all children.

```
scrDashboard
└── conRejectModal             ← CONTAINER (set Visible here only!)
    ├── btnRejectConfirm       ← Confirm Rejection button
    ├── btnRejectCancel        ← Cancel button
    ├── txtRejectComments      ← Multi-line text input
    ├── lblRejectCommentsLabel ← "Additional Comments:"
    ├── chkNotJoined           ← Checkbox: Parts not joined
    ├── chkOverhangs           ← Checkbox: Excessive overhangs
    ├── chkMessy               ← Checkbox: Model is messy
    ├── chkScale               ← Checkbox: Scale is wrong
    ├── chkNotSolid            ← Checkbox: Open model/not solid
    ├── chkGeometry            ← Checkbox: Geometry is problematic
    ├── chkTooSmall            ← Checkbox: Features too small/thin
    ├── lblRejectReasonsLabel  ← "Rejection Reasons..."
    ├── ddRejectStaff          ← Staff dropdown
    ├── lblRejectStaffLabel    ← "Performing Action As: *"
    ├── lblRejectStudent       ← Student name and email
    ├── lblRejectTitle         ← "Reject Request - REQ-00042"
    ├── recRejectModal         ← White modal box
    └── recRejectOverlay       ← Dark semi-transparent background
```

---

### Modal Container (conRejectModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conRejectModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowRejectModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls will automatically inherit this visibility — you do NOT need to set `Visible` on any child control!

---

### Modal Overlay (recRejectOverlay)

5. With `conRejectModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recRejectOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

> ⚠️ **No Visible property needed!** The container handles visibility for all children.

---

### Modal Content Box (recRejectModal)

8. With `conRejectModal` selected, click **+ Insert** → **Rectangle**.
9. **Rename it:** `recRejectModal`
10. Set properties:

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

---

### Modal Title (lblRejectTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblRejectTitle`
13. Set properties:

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

---

### Student Info (lblRejectStudent)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblRejectStudent`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 55` |
| Width | `560` |
| Height | `25` |
| Size | `12` |
| Color | `RGBA(100, 100, 100, 1)` |

---

### Staff Label (lblRejectStaffLabel)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblRejectStaffLabel`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 90` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Staff Dropdown (ddRejectStaff)

20. Click **+ Insert** → **Combo box**.
21. **Rename it:** `ddRejectStaff`
22. Set properties:

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

> ⚠️ **Important:** You must **Run OnStart** first before setting DisplayFields. Otherwise Power Apps will auto-change it to `["ComplianceAssetId"]` because it doesn't recognize the collection columns yet.

---

### Rejection Reasons Label (lblRejectReasonsLabel)

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblRejectReasonsLabel`
25. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Rejection Reasons (select all that apply):"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 160` |
| Width | `400` |
| Height | `32` |
| FontWeight | `FontWeight.Semibold` |

---

### Rejection Reason Checkboxes

Add 7 checkboxes. For each, click **+ Insert** → **Checkbox**:

| # | Control Name | Text | X | Y |
|---|--------------|------|---|---|
| 26 | `chkTooSmall` | `"Features are too small or too thin"` | `recRejectModal.X + 20` | `recRejectModal.Y + 185` |
| 27 | `chkGeometry` | `"The geometry is problematic"` | `recRejectModal.X + 20` | `recRejectModal.Y + 215` |
| 28 | `chkNotSolid` | `"Open model/not solid geometry"` | `recRejectModal.X + 20` | `recRejectModal.Y + 245` |
| 29 | `chkScale` | `"The scale is wrong"` | `recRejectModal.X + 20` | `recRejectModal.Y + 275` |
| 30 | `chkMessy` | `"The model is messy"` | `recRejectModal.X + 20` | `recRejectModal.Y + 305` |
| 31 | `chkOverhangs` | `"Excessive overhangs requiring too much support"` | `recRejectModal.X + 20` | `recRejectModal.Y + 335` |
| 32 | `chkNotJoined` | `"Model parts are not joined together"` | `recRejectModal.X + 20` | `recRejectModal.Y + 365` |

> ⚠️ **No Visible property needed!** The container handles visibility for all children.

---

### Comments Label (lblRejectCommentsLabel)

33. Click **+ Insert** → **Text label**.
34. **Rename it:** `lblRejectCommentsLabel`
35. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Additional Comments (optional):"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 400` |
| Width | `300` |
| FontWeight | `FontWeight.Semibold` |

---

### Comments Text Input (txtRejectComments)

36. Click **+ Insert** → **Text input**.
37. **Rename it:** `txtRejectComments`
38. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 442` |
| Width | `560` |
| Height | `80` |
| HintText | `"Provide specific feedback for the student..."` |

> 💡 **Note:** The Y position of `442` provides adequate spacing below the "Additional Comments" label to prevent overlap.

---

### Cancel Button (btnRejectCancel)

39. Click **+ Insert** → **Button**.
40. **Rename it:** `btnRejectCancel`
41. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recRejectModal.X + 300` |
| Y | `recRejectModal.Y + 550` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |

42. Set **OnSelect:**

```powerfx
Set(varShowRejectModal, 0);
Set(varSelectedItem, Blank());
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

43. Click **+ Insert** → **Button**.
44. **Rename it:** `btnRejectConfirm`
45. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✗ Confirm Rejection"` |
| X | `recRejectModal.X + 430` |
| Y | `recRejectModal.Y + 550` |
| Width | `150` |
| Height | `36` |
| Fill | `RGBA(209, 52, 56, 1)` |
| Color | `Color.White` |
| DisplayMode | `If(IsBlank(ddRejectStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

46. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Rejecting request...");

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
        Text(varSelectedItem.ID),              // RequestID
        "Rejected",                            // Action
        "Status",                              // FieldName
        "Rejected",                            // NewValue
        ddRejectStaff.Selected.MemberEmail     // ActorEmail
    ),
    Notify("Could not log rejection.", NotificationType.Error),
    Notify("Request rejected. Student will be notified.", NotificationType.Success)
);

// Close modal and reset
Set(varShowRejectModal, 0);
Set(varSelectedItem, Blank());
Reset(txtRejectComments);
Reset(ddRejectStaff);
Reset(chkTooSmall);
Reset(chkGeometry);
Reset(chkNotSolid);
Reset(chkScale);
Reset(chkMessy);
Reset(chkOverhangs);
Reset(chkNotJoined);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

---

# STEP 11: Building the Approval Modal

**What you're doing:** Creating a dialog for staff to enter weight/time estimates before approving a request.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conApprovalModal             ← CONTAINER (set Visible here only!)
    ├── btnApprovalConfirm       ← Confirm Approval button
    ├── btnApprovalCancel        ← Cancel button
    ├── txtApprovalComments      ← Multi-line text input
    ├── lblApprovalCommentsLabel ← "Additional Comments:"
    ├── lblApprovalCostValue     ← Auto-calculated cost display
    ├── lblApprovalCostLabel     ← "Estimated Cost:"
    ├── txtEstimatedTime         ← Time input field (optional)
    ├── lblApprovalTimeLabel     ← "Estimated Print Time (hours):"
    ├── lblWeightValidation      ← Validation error message
    ├── txtEstimatedWeight       ← Weight input field
    ├── lblApprovalWeightLabel   ← "Estimated Weight (grams): *"
    ├── ddApprovalStaff          ← Staff dropdown
    ├── lblApprovalStaffLabel    ← "Performing Action As: *"
    ├── lblApprovalStudent       ← Student name and email
    ├── lblApprovalTitle         ← "Approve Request - REQ-00042"
    ├── recApprovalModal         ← White modal box
    └── recApprovalOverlay       ← Dark semi-transparent background
```

---

### Modal Container (conApprovalModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conApprovalModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowApprovalModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Modal Overlay (recApprovalOverlay)

5. With `conApprovalModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recApprovalOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

---

### Modal Content Box (recApprovalModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recApprovalModal`
10. Set properties:

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

---

### Modal Title (lblApprovalTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblApprovalTitle`
13. Set properties:

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

---

### Student Info (lblApprovalStudent)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblApprovalStudent`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 55` |
| Width | `560` |
| Height | `25` |
| Size | `12` |
| Color | `RGBA(100, 100, 100, 1)` |

---

### Staff Label (lblApprovalStaffLabel)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblApprovalStaffLabel`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 90` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Staff Dropdown (ddApprovalStaff)

20. Click **+ Insert** → **Combo box**.
21. **Rename it:** `ddApprovalStaff`
22. Set properties:

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

> ⚠️ **Important:** You must **Run OnStart** first before setting DisplayFields. Otherwise Power Apps will auto-change it to `["ComplianceAssetId"]` because it doesn't recognize the collection columns yet.

---

### Weight Label (lblApprovalWeightLabel)

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblApprovalWeightLabel`
25. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Weight (grams): *"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 165` |
| Width | `250` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Weight Input (txtEstimatedWeight)

26. Click **+ Insert** → **Text input**.
27. **Rename it:** `txtEstimatedWeight`
28. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 190` |
| Width | `200` |
| Height | `36` |
| HintText | `"Enter weight in grams (e.g., 25)"` |

---

### Weight Validation Label (lblWeightValidation)

29. Click **+ Insert** → **Text label**.
30. **Rename it:** `lblWeightValidation`
31. Set properties:

| Property | Value |
|----------|-------|
| X | `recApprovalModal.X + 230` |
| Y | `recApprovalModal.Y + 195` |
| Width | `200` |
| Height | `25` |
| Size | `11` |
| Color | `RGBA(209, 52, 56, 1)` |

32. Set **Text:**

```powerfx
If(
    IsBlank(txtEstimatedWeight.Text), 
    "⚠️ Weight is required",
    !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0,
    "⚠️ Enter a valid weight > 0",
    ""
)
```

33. Set **Visible** (this is an exception - conditional visibility within the container):

```powerfx
IsBlank(txtEstimatedWeight.Text) || !IsNumeric(txtEstimatedWeight.Text) || Value(txtEstimatedWeight.Text) <= 0
```

> 💡 **Note:** This validation label has its OWN Visible formula because it should only appear when validation fails, even when the container is visible.

---

### Time Label (lblApprovalTimeLabel)

34. Click **+ Insert** → **Text label**.
35. **Rename it:** `lblApprovalTimeLabel`
36. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Print Time (hours): (Optional)"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 240` |
| Width | `300` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Time Input (txtEstimatedTime)

37. Click **+ Insert** → **Text input**.
38. **Rename it:** `txtEstimatedTime`
39. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 265` |
| Width | `200` |
| Height | `36` |
| HintText | `"Enter hours (e.g., 2.5)"` |

---

### Cost Label (lblApprovalCostLabel)

40. Click **+ Insert** → **Text label**.
41. **Rename it:** `lblApprovalCostLabel`
42. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Cost:"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 320` |
| Width | `150` |
| Height | `25` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |

---

### Cost Value Display (lblApprovalCostValue)

43. Click **+ Insert** → **Text label**.
44. **Rename it:** `lblApprovalCostValue`
45. Set properties:

| Property | Value |
|----------|-------|
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 345` |
| Width | `200` |
| Height | `40` |
| FontWeight | `FontWeight.Bold` |
| Size | `24` |
| Color | `RGBA(16, 124, 16, 1)` |

46. Set **Text:**

```powerfx
If(
    IsNumeric(txtEstimatedWeight.Text) && Value(txtEstimatedWeight.Text) > 0,
    "$" & Text(
        Max(
            varMinimumCost,
            Value(txtEstimatedWeight.Text) * If(
                varSelectedItem.Method.Value = "Resin",
                varResinRate,
                varFilamentRate
            )
        ),
        "[$-en-US]#,##0.00"
    ),
    "$" & Text(varMinimumCost, "[$-en-US]#,##0.00") & " (minimum)"
)
```

> 💰 **Pricing:** Uses `varFilamentRate`, `varResinRate`, and `varMinimumCost` from App.OnStart

---

### Comments Label (lblApprovalCommentsLabel)

47. Click **+ Insert** → **Text label**.
48. **Rename it:** `lblApprovalCommentsLabel`
49. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Additional Comments (optional):"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 400` |
| Width | `300` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Comments Text Input (txtApprovalComments)

50. Click **+ Insert** → **Text input**.
51. **Rename it:** `txtApprovalComments`
52. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 425` |
| Width | `560` |
| Height | `80` |
| HintText | `"Add any special instructions for this job..."` |

---

### Cancel Button (btnApprovalCancel)

53. Click **+ Insert** → **Button**.
54. **Rename it:** `btnApprovalCancel`
55. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recApprovalModal.X + 300` |
| Y | `recApprovalModal.Y + 560` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |

56. Set **OnSelect:**

```powerfx
Set(varShowApprovalModal, 0);
Set(varSelectedItem, Blank());
Reset(txtEstimatedWeight);
Reset(txtEstimatedTime);
Reset(txtApprovalComments);
Reset(ddApprovalStaff)
```

---

### Confirm Approval Button (btnApprovalConfirm)

57. Click **+ Insert** → **Button**.
58. **Rename it:** `btnApprovalConfirm`
59. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Confirm Approval"` |
| X | `recApprovalModal.X + 430` |
| Y | `recApprovalModal.Y + 560` |
| Width | `150` |
| Height | `36` |
| Fill | `RGBA(16, 124, 16, 1)` |
| Color | `Color.White` |

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
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Approving request...");

// Calculate cost
Set(varCalculatedCost, 
    Max(
        varMinimumCost,
        Value(txtEstimatedWeight.Text) * If(
            varSelectedItem.Method.Value = "Resin",
            varResinRate,
            varFilamentRate
        )
    )
);

// Update SharePoint item with error handling
// ⚠️ IMPORTANT: Use internal column names (EstimatedWeight, EstimatedTime) not display names
IfError(
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
    }),
    // ERROR: Patch failed
    Set(varIsLoading, false);
    Notify("Failed to save approval. Please try again.", NotificationType.Error),
    // SUCCESS: Continue with Flow logging
    IfError(
        'Flow-(C)-Action-LogAction'.Run(
            Text(varSelectedItem.ID),              // RequestID
            "Approved",                            // Action
            "Status",                              // FieldName
            "Pending",                             // NewValue
            ddApprovalStaff.Selected.MemberEmail   // ActorEmail
        ),
        Notify("Approved, but could not log to audit.", NotificationType.Warning),
        Notify("Approved! Student will receive estimate email.", NotificationType.Success)
    );
    // Close modal and reset
    Set(varShowApprovalModal, 0);
    Set(varSelectedItem, Blank());
    Reset(txtEstimatedWeight);
    Reset(txtEstimatedTime);
    Reset(txtApprovalComments);
    Reset(ddApprovalStaff)
);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Error Handling Pattern:**
> - The outer `IfError` catches Patch failures
> - The inner `IfError` catches Flow failures (approval still saved even if logging fails)
> - Loading overlay prevents double-clicks during operation

---

# STEP 12: Building the Archive Modal

**What you're doing:** Creating a confirmation dialog for archiving completed/rejected requests.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conArchiveModal           ← CONTAINER (set Visible here only!)
    ├── btnArchiveConfirm     ← Confirm Archive button
    ├── btnArchiveCancel      ← Cancel button
    ├── txtArchiveReason      ← Reason text input
    ├── lblArchiveReasonLabel ← "Reason (optional):"
    ├── ddArchiveStaff        ← Staff dropdown
    ├── lblArchiveStaffLabel  ← "Performing Action As: *"
    ├── lblArchiveWarning     ← Warning message
    ├── lblArchiveTitle       ← "Archive Request - REQ-00042"
    ├── recArchiveModal       ← White modal box
    └── recArchiveOverlay     ← Dark semi-transparent background
```

---

### Modal Container (conArchiveModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conArchiveModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowArchiveModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Modal Overlay (recArchiveOverlay)

5. With `conArchiveModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recArchiveOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

---

### Modal Content Box (recArchiveModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recArchiveModal`
10. Set properties:

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

---

### Modal Title (lblArchiveTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblArchiveTitle`
13. Set properties:

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

---

### Warning Message (lblArchiveWarning)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblArchiveWarning`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"⚠️ This will remove the request from active views. Archived requests can still be viewed in the Archived filter."` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 60` |
| Width | `460` |
| Height | `50` |
| Size | `12` |
| Color | `RGBA(150, 100, 0, 1)` |

---

### Staff Label (lblArchiveStaffLabel)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblArchiveStaffLabel`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 120` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Staff Dropdown (ddArchiveStaff)

20. Click **+ Insert** → **Combo box**.
21. **Rename it:** `ddArchiveStaff`
22. Set properties:

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

---

### Reason Label (lblArchiveReasonLabel)

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblArchiveReasonLabel`
25. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Reason (optional):"` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 195` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Reason Text Input (txtArchiveReason)

26. Click **+ Insert** → **Text input**.
27. **Rename it:** `txtArchiveReason`
28. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recArchiveModal.X + 20` |
| Y | `recArchiveModal.Y + 220` |
| Width | `460` |
| Height | `80` |
| HintText | `"Why is this request being archived?"` |

---

### Cancel Button (btnArchiveCancel)

29. Click **+ Insert** → **Button**.
30. **Rename it:** `btnArchiveCancel`
31. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recArchiveModal.X + 200` |
| Y | `recArchiveModal.Y + 340` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |

32. Set **OnSelect:**

```powerfx
Set(varShowArchiveModal, 0);
Set(varSelectedItem, Blank());
Reset(txtArchiveReason);
Reset(ddArchiveStaff)
```

---

### Confirm Archive Button (btnArchiveConfirm)

33. Click **+ Insert** → **Button**.
34. **Rename it:** `btnArchiveConfirm`
35. Set properties:

| Property | Value |
|----------|-------|
| Text | `"📦 Confirm Archive"` |
| X | `recArchiveModal.X + 330` |
| Y | `recArchiveModal.Y + 340` |
| Width | `150` |
| Height | `36` |
| Fill | `RGBA(100, 100, 100, 1)` |
| Color | `Color.White` |
| DisplayMode | `If(IsBlank(ddArchiveStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

33. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Archiving request...");

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
        Text(varSelectedItem.ID),              // RequestID
        "Archived",                            // Action
        "Status",                              // FieldName
        "Archived",                            // NewValue
        ddArchiveStaff.Selected.MemberEmail    // ActorEmail
    ),
    Notify("Could not log archive.", NotificationType.Error),
    Notify("Request archived successfully.", NotificationType.Success)
);

// Close modal and reset
Set(varShowArchiveModal, 0);
Set(varSelectedItem, Blank());
Reset(txtArchiveReason);
Reset(ddArchiveStaff);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

---

# STEP 12B: Building the Change Print Details Modal

**What you're doing:** Creating a modal that allows staff to change Method, Printer, Color, Weight, Hours, and recalculate Cost for a job. All changes are optional — staff can update any combination of fields.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

> 💡 **Why this matters:** Provides flexibility to fix mistakes or adjust job parameters at any point in the workflow (except Pending and Uploaded statuses). Changing Method automatically resets the Printer dropdown to show compatible printers only.

> ⚠️ **Availability:** This modal is accessible from ALL status tabs EXCEPT Pending and Uploaded. New submissions need initial review and estimate assignment before details can be edited. The Edit button (✏️ Edit) appears near the "Additional Details" header on each job card.

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conDetailsModal            ← CONTAINER (set Visible here only!)
    ├── btnDetailsConfirm      ← Save Changes button
    ├── btnDetailsCancel       ← Cancel button
    ├── lblDetailsCostValue    ← Auto-calculated cost display
    ├── lblDetailsCostLabel    ← "Calculated Cost:"
    ├── txtDetailsHours        ← Hours number input
    ├── lblDetailsHoursLabel   ← "Est. Hours:"
    ├── txtDetailsWeight       ← Weight number input
    ├── lblDetailsWeightLabel  ← "Est. Weight (grams):"
    ├── ddDetailsColor         ← Color dropdown
    ├── lblDetailsColorLabel   ← "Color:"
    ├── ddDetailsPrinter       ← Printer dropdown (filtered by method)
    ├── lblDetailsPrinterLabel ← "Printer:"
    ├── ddDetailsMethod        ← Method dropdown (Filament/Resin)
    ├── lblDetailsMethodLabel  ← "Method:"
    ├── ddDetailsStaff         ← Staff dropdown
    ├── lblDetailsStaffLabel   ← "Performing Action As: *"
    ├── lblDetailsCurrent      ← Shows current settings summary
    ├── lblDetailsCurrentLabel ← "Current Settings:"
    ├── lblDetailsTitle        ← "Change Print Details - REQ-00042"
    ├── recDetailsModal        ← White modal box
    └── recDetailsOverlay      ← Dark semi-transparent background
```

---

### Modal Container (conDetailsModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conDetailsModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowDetailsModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Modal Overlay (recDetailsOverlay)

5. With `conDetailsModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recDetailsOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

---

### Modal Content Box (recDetailsModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recDetailsModal`
10. Set properties:

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
        "$" & Text(varMinimumCost, "[$-en-US]#,##0.00") & " (min)",
        "$" & Text(
            Max(varMinimumCost, weight * If(method = "Resin", varResinRate, varFilamentRate)),
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

65. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, 0);
Set(varSelectedItem, Blank());
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
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Saving changes...");

// Calculate new cost based on weight and method
Set(varNewMethod, If(!IsBlank(ddDetailsMethod.Selected), ddDetailsMethod.Selected.Value, varSelectedItem.Method.Value));
Set(varNewWeight, If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) > 0, Value(txtDetailsWeight.Text), varSelectedItem.EstimatedWeight));
Set(varNewCost, If(IsBlank(varNewWeight), varSelectedItem.EstimatedCost, Max(varMinimumCost, varNewWeight * If(varNewMethod = "Resin", varResinRate, varFilamentRate))));

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
        Text(varSelectedItem.ID),              // RequestID
        "Details Changed",                     // Action
        "Details",                             // FieldName
        varChangeDesc,                         // NewValue
        ddDetailsStaff.Selected.MemberEmail    // ActorEmail
    ),
    Notify("Could not log changes.", NotificationType.Error),
    Notify("Print details updated successfully!", NotificationType.Success)
);

// Close modal and reset
Set(varShowDetailsModal, 0);
Set(varSelectedItem, Blank());
Reset(ddDetailsStaff);
Reset(ddDetailsMethod);
Reset(ddDetailsPrinter);
Reset(ddDetailsColor);
Reset(txtDetailsWeight);
Reset(txtDetailsHours);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Cost recalculation:** When weight or method changes, cost is automatically recalculated using: `Max(varMinimumCost, weight × rate)` where rate is `varFilamentRate` for Filament and `varResinRate` for Resin (configured in App.OnStart)

---

# STEP 12C: Building the Payment Recording Modal

**What you're doing:** Creating a modal that captures payment details when staff marks an item as "Picked Up". This ensures transaction numbers, actual weights, and final costs are recorded for accounting and reconciliation.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

> 💡 **Why this matters:** Previously, clicking "Picked Up" immediately changed the status without recording any payment details. This modal requires staff to enter the actual weight (measured from the finished print), which auto-calculates the final cost, plus the TigerCASH transaction number for reconciliation.

> ⚠️ **Trigger:** This modal opens when staff clicks the "💰 Picked Up" button on items with Status = "Completed".

### Key Concept: Estimates vs Actuals

| Stage | Weight Field | Cost Field | When Set |
|-------|--------------|------------|----------|
| **Estimate** | EstimatedWeight | EstimatedCost | At approval (slicer prediction) |
| **Actual** | FinalWeight | FinalCost | At pickup (physical measurement) |

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conPaymentModal           ← CONTAINER (set Visible here only!)
    ├── btnPaymentConfirm     ← Record Payment button (changes color based on partial)
    ├── btnPaymentCancel      ← Cancel button
    ├── chkPartialPickup      ← Partial pickup checkbox (keeps status as Completed)
    ├── txtPaymentNotes       ← Multi-line text input
    ├── lblPaymentNotesLabel  ← "Payment Notes (optional):"
    ├── dpPaymentDate         ← Date picker (default: Today())
    ├── lblPaymentDateLabel   ← "Payment Date: *"
    ├── lblPaymentCostValue   ← Auto-calculated cost display
    ├── lblPaymentCostLabel   ← "Final Cost:"
    ├── txtPaymentWeight      ← Weight input (pre-filled with EstimatedWeight)
    ├── lblPaymentWeightLabel ← "Final Weight (grams): *"
    ├── txtPaymentTransaction ← Transaction number input (required)
    ├── lblPaymentTransLabel  ← "Transaction Number: *"
    ├── ddPaymentStaff        ← Staff dropdown
    ├── lblPaymentStaffLabel  ← "Performing Action As: *"
    ├── lblPaymentStudent     ← Student name and estimated vs final info
    ├── lblPaymentTitle       ← "Record Payment - REQ-00042"
    ├── recPaymentModal       ← White modal box
    └── recPaymentOverlay     ← Dark semi-transparent background
```

---

### Modal Container (conPaymentModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conPaymentModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowPaymentModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility — you do NOT need to set `Visible` on any child control!

---

### Modal Overlay (recPaymentOverlay)

5. With `conPaymentModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recPaymentOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

---

### Modal Content Box (recPaymentModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recPaymentModal`
10. Set properties:

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

40. Set **Text:**

```powerfx
If(
    IsNumeric(txtPaymentWeight.Text) && Value(txtPaymentWeight.Text) > 0,
    "$" & Text(
        Max(
            varMinimumCost,
            Value(txtPaymentWeight.Text) * If(
                varSelectedItem.Method.Value = "Resin",
                varResinRate,
                varFilamentRate
            )
        ),
        "[$-en-US]#,##0.00"
    ),
    "$" & Text(varMinimumCost, "[$-en-US]#,##0.00") & " (minimum)"
)
```

> 💰 **Pricing:** Uses `varFilamentRate`, `varResinRate`, and `varMinimumCost` from App.OnStart

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

59. Set **OnSelect:**

```powerfx
Set(varShowPaymentModal, 0);
Set(varSelectedItem, Blank());
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
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Recording payment...");

// Calculate cost from weight picked up
Set(varFinalCost, 
    Max(
        varMinimumCost,
        Value(txtPaymentWeight.Text) * If(
            varSelectedItem.Method.Value = "Resin",
            varResinRate,
            varFilamentRate
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
Set(varSelectedItem, Blank());
Reset(txtPaymentTransaction);
Reset(txtPaymentWeight);
Reset(dpPaymentDate);
Reset(txtPaymentNotes);
Reset(ddPaymentStaff);
Reset(chkPartialPickup);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Partial Pickup Behavior:**
> - Status remains "Completed" (job stays visible in queue)
> - Payment details appended to PaymentNotes (creates a log)
> - Staff can process another pickup later
> - Final pickup (unchecked) records to FinalWeight/FinalCost fields

---

# STEP 13: Building the Notes Modal

**What you're doing:** Creating a modal that displays both Student Notes (from submission) and Staff Notes (including system audit entries), and allows staff to add new notes.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conNotesModal                    ← CONTAINER (set Visible here only!)
    ├── btnNotesClose                ← X button top-right
    ├── btnAddNote                   ← "+ Add Note" button
    ├── btnNotesCancel               ← "Cancel" button
    ├── txtAddNote                   ← Text input for new note
    ├── ddNotesStaff                 ← Staff dropdown
    ├── lblNotesStaffLabel           ← "Add note as:"
    ├── lblAddNoteLabel              ← "Add a note:"
    ├── txtStaffNotesContent         ← Staff notes display (scrollable)
    ├── lblStaffNotesHeader          ← "Staff Notes & Activity"
    ├── txtStudentNotesContent       ← Student notes display (scrollable)
    ├── lblStudentNotesHeader        ← "Student Notes"
    ├── lblNotesTitle                ← "Notes - REQ-00042"
    ├── recNotesModal                ← White modal box
    └── recNotesOverlay              ← Dark semi-transparent background
```

---

### Modal Container (conNotesModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conNotesModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowNotesModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Modal Overlay (recNotesOverlay)

5. With `conNotesModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recNotesOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

---

### Modal Content Box (recNotesModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recNotesModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 550) / 2` |
| Y | `(Parent.Height - 520) / 2` |
| Width | `550` |
| Height | `520` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

---

### Modal Title (lblNotesTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblNotesTitle`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Notes - " & varSelectedItem.ReqKey` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 20` |
| Width | `480` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `RGBA(50, 50, 50, 1)` |

---

### Close Button (btnNotesClose)

14. Click **+ Insert** → **Button**.
15. **Rename it:** `btnNotesClose`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recNotesModal.X + recNotesModal.Width - 45` |
| Y | `recNotesModal.Y + 15` |
| Width | `30` |
| Height | `30` |
| Fill | `RGBA(240, 240, 240, 1)` |
| Color | `RGBA(100, 100, 100, 1)` |
| BorderThickness | `0` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

17. Set **OnSelect:**

```powerfx
Set(varShowNotesModal, 0);
Set(varSelectedItem, Blank());
Reset(txtAddNote);
Reset(ddNotesStaff)
```

---

### Student Notes Header (lblStudentNotesHeader)

18. Click **+ Insert** → **Text label**.
19. **Rename it:** `lblStudentNotesHeader`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student Notes"` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 60` |
| Width | `510` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

---

### Student Notes Content (txtStudentNotesContent)

21. Click **+ Insert** → **Text input**.
22. **Rename it:** `txtStudentNotesContent`
23. Set properties:

| Property | Value |
|----------|-------|
| Default | `If(IsBlank(varSelectedItem.Notes), "None", varSelectedItem.Notes)` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 82` |
| Width | `510` |
| Height | `60` |
| Mode | `TextMode.MultiLine` |
| DisplayMode | `DisplayMode.View` |
| Size | `11` |
| Color | `If(IsBlank(varSelectedItem.Notes), RGBA(150, 150, 150, 1), RGBA(50, 50, 50, 1))` |
| FontItalic | `IsBlank(varSelectedItem.Notes)` |
| BorderColor | `RGBA(200, 200, 200, 1)` |

> 💡 **Note:** Using a Text Input with `DisplayMode.View` provides automatic scrollbars when content overflows. This displays the student's notes from submission (the `Notes` field). Read-only.

---

### Staff Notes Header (lblStaffNotesHeader)

24. Click **+ Insert** → **Text label**.
25. **Rename it:** `lblStaffNotesHeader`
26. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Staff Notes & Activity"` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 150` |
| Width | `510` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

---

### Staff Notes Content (txtStaffNotesContent)

27. Click **+ Insert** → **Text input**.
28. **Rename it:** `txtStaffNotesContent`
29. Set properties:

| Property | Value |
|----------|-------|
| Default | `If(IsBlank(varSelectedItem.StaffNotes), "None", varSelectedItem.StaffNotes)` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 172` |
| Width | `510` |
| Height | `120` |
| Mode | `TextMode.MultiLine` |
| DisplayMode | `DisplayMode.View` |
| Size | `11` |
| Color | `If(IsBlank(varSelectedItem.StaffNotes), RGBA(150, 150, 150, 1), RGBA(50, 50, 50, 1))` |
| FontItalic | `IsBlank(varSelectedItem.StaffNotes)` |
| BorderColor | `RGBA(200, 200, 200, 1)` |

> 💡 **Note:** Using a Text Input with `DisplayMode.View` provides automatic scrollbars when content overflows. This displays the `StaffNotes` field which includes system audit entries (APPROVED by..., REJECTED by..., etc.) and any manual notes added by staff.

---

### Staff Name Label (lblNotesStaffLabel)

30. Click **+ Insert** → **Text label**.
31. **Rename it:** `lblNotesStaffLabel`
32. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Add note as: *"` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 300` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

---

### Staff Dropdown (ddNotesStaff)

33. Click **+ Insert** → **Combo box**.
34. **Rename it:** `ddNotesStaff`
35. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 325` |
| Width | `300` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |

---

### Add Note Label (lblAddNoteLabel)

36. Click **+ Insert** → **Text label**.
37. **Rename it:** `lblAddNoteLabel`
38. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Add a note:"` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 370` |
| Width | `150` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

---

### Add Note Text Input (txtAddNote)

39. Click **+ Insert** → **Text input**.
40. **Rename it:** `txtAddNote`
41. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 395` |
| Width | `510` |
| Height | `80` |
| HintText | `"Type your note here..."` |

---

### Cancel Button (btnNotesCancel)

42. Click **+ Insert** → **Button**.
43. **Rename it:** `btnNotesCancel`
44. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recNotesModal.X + 300` |
| Y | `recNotesModal.Y + 480` |
| Width | `100` |
| Height | `36` |
| Fill | `RGBA(150, 150, 150, 1)` |
| Color | `Color.White` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

45. Set **OnSelect:**

```powerfx
Set(varShowNotesModal, 0);
Set(varSelectedItem, Blank());
Reset(txtAddNote);
Reset(ddNotesStaff)
```

---

### Add Note Button (btnAddNote)

46. Click **+ Insert** → **Button**.
47. **Rename it:** `btnAddNote`
48. Set properties:

| Property | Value |
|----------|-------|
| Text | `"+ Add Note"` |
| X | `recNotesModal.X + 410` |
| Y | `recNotesModal.Y + 480` |
| Width | `120` |
| Height | `36` |
| Fill | `RGBA(16, 124, 16, 1)` |
| Color | `Color.White` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

49. Set **DisplayMode:**

```powerfx
If(IsBlank(txtAddNote.Text) || IsBlank(ddNotesStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)
```

50. Set **OnSelect:**

```powerfx
// Append the new note to StaffNotes with staff name and timestamp
Patch(PrintRequests, varSelectedItem,
{
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & Char(10)),
        First(Split(ddNotesStaff.Selected.MemberName, " ")).Value & ": " &
        txtAddNote.Text & " - " & Text(Now(), "mm/dd/yyyy")
    )
});

// Refresh the selected item to show updated notes
Set(varSelectedItem, LookUp(PrintRequests, ID = varSelectedItem.ID));

// Clear the input
Reset(txtAddNote);

// Show success notification
Notify("Note added successfully!", NotificationType.Success)
```

> 💡 **Note Format:** Manual notes are prefixed with the staff member's first name and include a timestamp. This distinguishes them from system-generated entries like "APPROVED by..." which don't have the prefix.

---

### ✅ Step 13 Checklist

Your Notes Modal should now contain these controls:

```
▼ conNotesModal
    btnNotesClose
    btnAddNote
    btnNotesCancel
    txtAddNote
    lblAddNoteLabel
    ddNotesStaff
    lblNotesStaffLabel
    txtStaffNotesContent
    lblStaffNotesHeader
    txtStudentNotesContent
    lblStudentNotesHeader
    lblNotesTitle
    recNotesModal
    recNotesOverlay
```

**Testing the Notes Modal:**
1. Click "View Notes" on any job card
2. Verify Student Notes section shows the student's submission notes (or "None")
3. Verify Staff Notes section shows audit entries and manual notes (or "None")
4. Select a staff member in the "Add note as" dropdown
5. Type a note and click "+ Add Note"
6. Verify the note appears in the Staff Notes section with the staff first name prefix
7. Click Cancel or X to close the modal

---

# STEP 14: Adding the Filter Bar

**What you're doing:** Creating a dedicated filter bar between the status tabs and job cards gallery with search and filter controls.

> ⚠️ **IMPORTANT:** You must create **ALL 5 controls** in this section. The filter bar won't look right if you only create some of them. The background rectangle (`recFilterBar`) provides the visual container for the other controls.

> 💡 **Design:** A clean horizontal bar with a subtle background containing search input, attention filter checkbox, refresh button, and clear button.

### Control Hierarchy

```
scrDashboard
├── recFilterBar              ← Background bar (CREATE THIS FIRST!)
├── txtSearch                 ← Search input
├── chkNeedsAttention         ← Checkbox filter
├── btnRefresh                ← Refresh data button
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
| Width | `Parent.Width` |
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
| X | `Parent.Width - 86` |
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

### Refresh Data Button (btnRefresh)

18. Click **+ Insert** → **Button**.
19. **Rename it:** `btnRefresh`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"↻ Refresh"` |
| X | `Parent.Width - 176` |
| Y | `117` |
| Width | `80` |
| Height | `36` |
| Fill | `RGBA(70, 130, 220, 1)` |
| Color | `Color.White` |
| HoverFill | `RGBA(50, 110, 200, 1)` |
| BorderColor | `RGBA(70, 130, 220, 1)` |
| BorderThickness | `0` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

21. Set **OnSelect:**

```powerfx
Refresh(PrintRequests)
```

> **Why this button?** Power Apps caches SharePoint data. When new requests are submitted via the student form, the tab counts and gallery won't update automatically. Clicking this button forces a fresh data fetch so staff see the latest submissions and accurate counts.

---

### ⚠️ CRITICAL: Reorder Modal Containers for Proper Z-Index

**After creating the filter bar controls, you MUST reorder the modal CONTAINERS so they appear ON TOP of the filter bar when visible.**

In Power Apps, controls that are **higher in the Tree view** (closer to the top) render **on top of** controls that are lower. 

> 🎯 **With Containers:** You only need to move ONE container per modal instead of 15+ individual controls! This is much easier.

**How to fix:**

1. In the **Tree view** (left panel), locate these containers:
   - `conPaymentModal`
   - `conDetailsModal`
   - `conArchiveModal`
   - `conApprovalModal`
   - `conRejectModal`

2. **Drag each container** to the **TOP** of the Tree view (just under `scrDashboard`).

3. The correct order from top to bottom should be:
   ```
   scrDashboard
   ├── conPaymentModal           ← Modal containers at TOP
   ├── conDetailsModal
   ├── conArchiveModal
   ├── conApprovalModal
   ├── conRejectModal            ← ...all above filter bar
   ├── recFilterBar              ← Filter bar BELOW modal containers
   ├── txtSearch
   ├── chkNeedsAttention
   ├── btnRefresh
   ├── btnClearFilters
   ├── galJobCards               ← Gallery BELOW filter bar
   └── (remaining controls...)
   ```

> 💡 **Container Advantage:** With containers, you only need to drag **5 containers** instead of **50+ individual controls**! Each container groups all related modal controls together.

> 💡 **Quick Test:** After reordering, click a card's Approve button. The modal should appear fully visible, covering the filter bar and search controls completely.

> ⚠️ **Note:** Later steps will add more modals (File Modal, Message Modal, View Messages Modal, Loading Overlay). Each time you add a new modal, drag its container to the TOP of the Tree view. The Loading Overlay (STEP 17E) must always be the topmost container.

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

> 💡 **Simple Toggle:** This is a quick flag toggle for staff to mark items needing attention. It doesn't log to the audit trail since it's a temporary visual indicator, not a workflow action.

---

### Attention Card Styling

6. Update `recCardBackground` (inside galJobCards). Set **Fill:**

```powerfx
If(ThisItem.NeedsAttention, RGBA(255, 235, 180, 1), Color.White)
```

7. Set **BorderColor:**

```powerfx
If(ThisItem.NeedsAttention, RGBA(255, 180, 0, 1), RGBA(220, 220, 220, 1))
```

8. Set **BorderThickness:**

```powerfx
If(ThisItem.NeedsAttention, 2, 1)
```

> 💡 **Static Highlight:** Items needing attention get a noticeable warm yellow/orange background with an orange border. No animation required—the color stands out without being distracting.

---

# STEP 16: Adding the Attachments Modal

**What you're doing:** Creating a modal for staff to add/remove file attachments from requests.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conFileModal                 ← CONTAINER (set Visible here only!)
    ├── btnFileCancel            ← Cancel button
    ├── btnFileSave              ← Save Changes button
    ├── frmAttachmentsEdit       ← Edit form for attachments
    ├── ddFileActor              ← Staff dropdown
    ├── lblFileStaffLabel        ← "Performing Action As: *"
    ├── lblFileTitle             ← "Manage Attachments - REQ-00042"
    ├── recFileModal             ← White modal box
    └── recFileOverlay           ← Dark semi-transparent background
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

### Modal Container (conFileModal)

6. Click on **scrDashboard** in Tree view.
7. Click **+ Insert** → **Layout** → **Container**.
8. **Rename it:** `conFileModal`
9. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowAddFileModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Modal Overlay (recFileOverlay)

10. With `conFileModal` selected, click **+ Insert** → **Rectangle**.
11. **Rename it:** `recFileOverlay`
12. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

---

### Modal Content Box (recFileModal)

13. Click **+ Insert** → **Rectangle**.
14. **Rename it:** `recFileModal`
15. Set properties:

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
Set(varSelectedItem, Blank());
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

35. Set **OnSelect:**

```powerfx
ResetForm(frmAttachmentsEdit);
Set(varShowAddFileModal, 0);
Set(varSelectedItem, Blank());
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

#### View Messages Button (btnViewMessages)

4. Click **+ Insert** → **Button**.
5. **Rename it:** `btnViewMessages`
6. Set properties:

| Property | Value |
|----------|-------|
| Text | `"View Messages"` |
| X | `12` |
| Y | `280` |
| Width | `100` |
| Height | `28` |
| Fill | `RGBA(240, 240, 240, 1)` |
| Color | `RGBA(70, 130, 220, 1)` |
| BorderColor | `RGBA(70, 130, 220, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |
| Size | `10` |
| HoverFill | `RGBA(70, 130, 220, 1)` |
| HoverColor | `Color.White` |

7. Set **OnSelect:**

```powerfx
Set(varShowViewMessagesModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> **Note:** This button opens the View Messages Modal (Step 17D) which displays the full conversation thread in a scrollable modal.

---

#### Unread Badge (lblUnreadBadge)

8. Still in `galJobCards`, click **+ Insert** → **Text label**.
9. **Rename it:** `lblUnreadBadge`
10. Set properties:

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

#### Job Card Messages Summary

With these controls, each job card shows:
- **Messages (X)** header with total count
- **View Messages** button to open the full conversation modal
- **Red unread badge** with count of unread student replies

The full message content and Mark Read functionality are in the View Messages Modal (Step 17D).

---

## Step 17C: Building the Message Modal

**What you're doing:** Creating a modal for staff to send messages to students about their print requests without leaving the dashboard.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

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

### Controls to Create (Container-Based)

```
└── conMessageModal                  ← CONTAINER (set Visible here only!)
    ├── btnMessageSend               ← "Send Message" button
    ├── btnMessageCancel             ← "Cancel" button
    ├── lblMessageCharCount          ← Character count display
    ├── txtMessageBody               ← Message text input (multiline)
    ├── lblMessageBodyLabel          ← "Message:"
    ├── txtMessageSubject            ← Subject input
    ├── lblMessageSubjectLabel       ← "Subject:"
    ├── ddMessageStaff               ← Staff dropdown
    ├── lblMessageStaffLabel         ← "Performing Action As:"
    ├── lblMessageStudent            ← Student info display
    ├── lblMessageTitle              ← "Send Message - REQ-00001"
    ├── recMessageModal              ← White modal box
    └── recMessageOverlay            ← Dark semi-transparent overlay
```

### Building the Modal

### Modal Container (conMessageModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conMessageModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowMessageModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Modal Overlay (recMessageOverlay)

5. With `conMessageModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recMessageOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

---

### Modal Content Box (recMessageModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recMessageModal`
10. Set properties:

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

---

### Character Count Label (lblMessageCharCount)

32. Click **+ Insert** → **Text label**.
33. **Rename it:** `lblMessageCharCount`
34. Set properties:

| Property | Value |
|----------|-------|
| X | `recMessageModal.X + 430` |
| Y | `recMessageModal.Y + 408` |
| Width | `130` |
| Height | `22` |
| Size | `8` |
| Align | `Align.Center` |

35. Set **Text:**

```powerfx
Len(txtMessageBody.Text) & " / 2000" & If(Len(txtMessageBody.Text) > 1900, " ⚠️ Near limit!", "")
```

36. Set **Color:**

```powerfx
If(
    Len(txtMessageBody.Text) > 1900, 
    RGBA(209, 52, 56, 1),
    Len(txtMessageBody.Text) > 1800, 
    RGBA(255, 140, 0, 1),
    RGBA(100, 100, 100, 1)
)
```

> 💡 **Character Feedback:**
> - Gray (0-1800): Normal
> - Orange (1800-1900): Warning
> - Red (1900+): Near limit with "⚠️ Near limit!" text

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

40. Set **OnSelect:**

```powerfx
Set(varShowMessageModal, 0);
Set(varSelectedItem, Blank());
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
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Sending message...");

// Create the message in RequestComments with Direction field
Patch(
    RequestComments,
    Defaults(RequestComments),
    {
        Title: txtMessageSubject.Text,
        RequestID: varSelectedItem.ID,
        ReqKey: varSelectedItem.ReqKey,
        Message: txtMessageBody.Text,
        Author0: {
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
Set(varSelectedItem, Blank());
Reset(txtMessageSubject);
Reset(txtMessageBody);
Reset(ddMessageStaff);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "");

Notify("Message sent! Student will receive email notification.", NotificationType.Success)
```

> **Note:** The `Direction: {Value: "Outbound"}` field is required for the new email threading system. Flow D will detect this and send the email with threading headers. See `PowerAutomate/Flow-(D)-Message-Notifications.md` for details.

> **Important:** The field is named `Author0` (not `Author`) because SharePoint has a built-in "Author" field for "Created By". When you create a custom Person column named "Author", SharePoint assigns it the internal name `Author0` to avoid conflict.

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
| Fill | `Color.White` |
| Color | `RGBA(70, 130, 220, 1)` |
| BorderColor | `RGBA(70, 130, 220, 1)` |
| BorderThickness | `1` |
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

## Step 17D: View Messages Modal

**What you're doing:** Creating a modal to view the full conversation thread between staff and students, with better formatting than the inline display.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Overview

This modal displays the complete message history for a print request:
- Full message content (no truncation)
- Clear visual distinction between inbound/outbound messages
- Scrollable conversation thread
- Button to send new messages

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conViewMessagesModal            ← CONTAINER (set Visible here only!)
    ├── btnViewMsgClose             ← X close button
    ├── btnViewMsgSendNew           ← "Send New Message" button
    ├── btnViewMsgMarkRead          ← "Mark All Read" button (visible when unread)
    ├── galViewMessages             ← Scrollable message gallery
    │   ├── recVMsgBg               ← Background (direction-based colors)
    │   ├── icoVMsgDirection        ← Direction icon (send/mail)
    │   ├── lblVMsgAuthor           ← Author name + timestamp
    │   ├── lblVMsgDirectionBadge   ← SENT/REPLY badge
    │   └── lblVMsgContent          ← Full message text
    ├── lblViewMsgTitle             ← "Messages - REQ-00001"
    ├── recViewMsgModal             ← White modal box
    └── recViewMsgOverlay           ← Dark semi-transparent overlay
```

---

### Modal Container (conViewMessagesModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conViewMessagesModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowViewMessagesModal > 0` |

---

### Modal Overlay (recViewMsgOverlay)

5. With `conViewMessagesModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recViewMsgOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

---

### Modal Box (recViewMsgModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recViewMsgModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 550) / 2` |
| Width | `600` |
| Height | `550` |
| Fill | `Color.White` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

---

### Modal Title (lblViewMsgTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblViewMsgTitle`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Messages - " & varSelectedItem.ReqKey` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 15` |
| Width | `400` |
| Height | `30` |
| Font | `Font.'Segoe UI Semibold'` |
| Size | `18` |
| Color | `RGBA(70, 130, 220, 1)` |

---

### Close Button (btnViewMsgClose)

14. Click **+ Insert** → **Button**.
15. **Rename it:** `btnViewMsgClose`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recViewMsgModal.X + recViewMsgModal.Width - 45` |
| Y | `recViewMsgModal.Y + 10` |
| Width | `35` |
| Height | `35` |
| Fill | `RGBA(0, 0, 0, 0)` |
| Color | `RGBA(100, 100, 100, 1)` |
| BorderThickness | `0` |
| Size | `16` |
| HoverFill | `RGBA(240, 240, 240, 1)` |

17. Set **OnSelect:**

```powerfx
Set(varShowViewMessagesModal, 0);
Set(varSelectedItem, Blank())
```

---

### Messages Gallery (galViewMessages)

18. Click **+ Insert** → **Blank vertical gallery**.
19. **Rename it:** `galViewMessages`
20. Set properties:

| Property | Value |
|----------|-------|
| Items | `Sort(Filter(RequestComments, RequestID = varSelectedItem.ID), SentAt, SortOrder.Descending)` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 55` |
| Width | `560` |
| Height | `420` |
| TemplateSize | `100` |
| TemplatePadding | `4` |
| ShowScrollbar | `true` |

---

#### Inside galViewMessages — Message Background

21. Inside `galViewMessages`, add a **Rectangle**:
   - **Name:** `recVMsgBg`
   - **X:** `If(ThisItem.Direction.Value = "Outbound", Parent.TemplateWidth * 0.15, 0)`
   - **Y:** `0`
   - **Width:** `Parent.TemplateWidth * 0.85`
   - **Height:** `Parent.TemplateHeight - 8`
   - **Fill:** `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 0.1), RGBA(255, 248, 230, 1))`
   - **RadiusTopLeft:** `6`
   - **RadiusTopRight:** `6`
   - **RadiusBottomLeft:** `6`
   - **RadiusBottomRight:** `6`

---

#### Inside galViewMessages — Direction Icon

22. Inside `galViewMessages`, click **+ Insert** → **Icons** → select any icon.
23. **Rename it:** `icoVMsgDirection`
24. Set properties:

| Property | Value |
|----------|-------|
| Icon | `If(ThisItem.Direction.Value = "Outbound", Icon.Send, Icon.Mail)` |
| X | `recVMsgBg.X + 10` |
| Y | `8` |
| Width | `16` |
| Height | `16` |
| Color | `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(200, 150, 50, 1))` |

---

#### Inside galViewMessages — Author Label

25. Inside `galViewMessages`, click **+ Insert** → **Text label**.
26. **Rename it:** `lblVMsgAuthor`
27. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Author.DisplayName & " • " & Text(ThisItem.SentAt, "mmm dd, yyyy h:mm AM/PM")` |
| X | `recVMsgBg.X + 32` |
| Y | `6` |
| Width | `300` |
| Height | `18` |
| Size | `10` |
| Color | `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(180, 130, 40, 1))` |
| Font | `Font.'Segoe UI Semibold'` |

---

#### Inside galViewMessages — Direction Badge

28. Inside `galViewMessages`, click **+ Insert** → **Text label**.
29. **Rename it:** `lblVMsgDirectionBadge`
30. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(ThisItem.Direction.Value = "Outbound", "SENT", "REPLY")` |
| X | `recVMsgBg.X + recVMsgBg.Width - 55` |
| Y | `6` |
| Width | `45` |
| Height | `16` |
| Size | `9` |
| Align | `Align.Right` |
| Color | `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(180, 130, 40, 1))` |
| FontItalic | `true` |

---

#### Inside galViewMessages — Message Content

31. Inside `galViewMessages`, click **+ Insert** → **Text label**.
32. **Rename it:** `lblVMsgContent`
33. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Message` |
| X | `recVMsgBg.X + 10` |
| Y | `26` |
| Width | `recVMsgBg.Width - 20` |
| Height | `Parent.TemplateHeight - 36` |
| Size | `11` |
| Color | `RGBA(50, 50, 50, 1)` |
| VerticalAlign | `VerticalAlign.Top` |
| Overflow | `Overflow.Scroll` |

> **Note:** Full message content is displayed without truncation. Long messages will scroll within the template.

---

### Send New Message Button (btnViewMsgSendNew)

34. Click **+ Insert** → **Button**.
35. **Rename it:** `btnViewMsgSendNew`
36. Set properties:

| Property | Value |
|----------|-------|
| Text | `"📧 Send New Message"` |
| X | `recViewMsgModal.X + recViewMsgModal.Width - 170` |
| Y | `recViewMsgModal.Y + recViewMsgModal.Height - 50` |
| Width | `150` |
| Height | `35` |
| Fill | `RGBA(70, 130, 220, 1)` |
| Color | `Color.White` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |

37. Set **OnSelect:**

```powerfx
// Close view modal and open send modal
Set(varShowViewMessagesModal, 0);
Set(varShowMessageModal, varSelectedItem.ID)
```

> **Note:** This closes the View Messages modal and opens the Send Message modal (Step 17C) for the same request.

---

### Mark Read Button (btnViewMsgMarkRead)

38. Click **+ Insert** → **Button**.
39. **Rename it:** `btnViewMsgMarkRead`
40. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Mark All Read"` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + recViewMsgModal.Height - 50` |
| Width | `120` |
| Height | `35` |
| Fill | `Color.White` |
| Color | `RGBA(209, 52, 56, 1)` |
| BorderColor | `RGBA(209, 52, 56, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |
| HoverFill | `RGBA(209, 52, 56, 1)` |
| HoverColor | `Color.White` |
| Visible | `!IsEmpty(Filter(RequestComments, RequestID = varSelectedItem.ID, Direction.Value = "Inbound", ReadByStaff = false))` |

41. Set **OnSelect:**

```powerfx
UpdateIf(
    RequestComments,
    RequestID = varSelectedItem.ID &&
    Direction.Value = "Inbound" &&
    ReadByStaff = false,
    {ReadByStaff: true}
);
Notify("Messages marked as read", NotificationType.Success)
```

> **Note:** This button only appears when there are unread inbound messages. After clicking, it disappears and the unread badge on the job card also updates.

---

### Testing the View Messages Modal

- [ ] "View Messages" button appears on job cards
- [ ] Clicking opens modal with correct request title
- [ ] Messages display with correct direction styling (blue=outbound, yellow=inbound)
- [ ] Full message content visible (no truncation)
- [ ] Messages scroll when there are many
- [ ] Close button (X) closes modal
- [ ] "Send New Message" opens the send message modal
- [ ] "Mark All Read" button appears when there are unread messages
- [ ] Clicking "Mark All Read" clears unread status and hides the button
- [ ] Unread badge on job card updates after marking read

---

# STEP 17E: Adding the Loading Overlay

**What you're doing:** Adding a loading indicator that shows during async operations (Patch, Flow calls) to prevent user confusion and double-clicks.

> 🎯 **Using Containers:** This overlay uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conLoadingOverlay            ← CONTAINER (set Visible here only!)
    ├── lblLoadingMessage        ← Custom loading message
    ├── lblLoadingSpinner        ← Animated spinner emoji
    ├── recLoadingBox            ← White box with spinner
    └── recLoadingOverlay        ← Semi-transparent dark overlay
```

> 💡 **Why this matters:** Without visual feedback, users may click buttons multiple times or think the app is frozen during database operations.

> ⚠️ **Z-Order:** This container must be at the TOP of the Tree view (highest Z-order) so it appears on top of everything, including other modals.

---

### Loading Container (conLoadingOverlay)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conLoadingOverlay`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varIsLoading` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Loading Overlay Background (recLoadingOverlay)

5. With `conLoadingOverlay` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recLoadingOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.5)` |

---

### Loading Box (recLoadingBox)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recLoadingBox`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 200) / 2` |
| Y | `(Parent.Height - 100) / 2` |
| Width | `200` |
| Height | `100` |
| Fill | `Color.White` |
| BorderColor | `RGBA(56, 96, 178, 1)` |
| BorderThickness | `2` |

---

### Loading Spinner (lblLoadingSpinner)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblLoadingSpinner`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"⏳"` |
| X | `(Parent.Width - 50) / 2` |
| Y | `(Parent.Height - 100) / 2 + 15` |
| Width | `50` |
| Height | `40` |
| Size | `24` |
| Align | `Align.Center` |

---

### Loading Message (lblLoadingMessage)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblLoadingMessage`
16. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 200) / 2` |
| Y | `(Parent.Height - 100) / 2 + 55` |
| Width | `200` |
| Height | `30` |
| Size | `12` |
| Align | `Align.Center` |
| Color | `RGBA(80, 80, 80, 1)` |

14. Set **Text:**

```powerfx
If(IsBlank(varLoadingMessage), "Processing...", varLoadingMessage)
```

---

### Using the Loading Overlay

To show the loading overlay during an operation, wrap your button's `OnSelect` like this:

**Example Pattern:**

```powerfx
// Show loading
Set(varIsLoading, true);
Set(varLoadingMessage, "Saving changes...");

// Do the work
Patch(PrintRequests, varSelectedItem, { ... });

// Call flow (if needed)
'Flow-(C)-Action-LogAction'.Run(...);

// Hide loading
Set(varIsLoading, false);
Set(varLoadingMessage, "");

// Show result
Notify("Changes saved!", NotificationType.Success)
```

> 💡 **Tip:** You can customize `varLoadingMessage` for each operation:
> - `"Approving request..."` for approval
> - `"Recording payment..."` for payment
> - `"Sending message..."` for messaging

---

### Testing Checklist

- [ ] Loading overlay appears during operations
- [ ] User cannot click other buttons while loading is visible
- [ ] Loading message displays correctly
- [ ] Overlay dismisses after operation completes

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
- [ ] Refresh button reloads data and updates tab counts

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
| `varFilamentRate` | App.OnStart | Filament price per gram ($0.10) |
| `varResinRate` | App.OnStart | Resin price per gram ($0.20) |
| `varMinimumCost` | App.OnStart | Minimum charge ($3.00) |
| `varSelectedStatus` | Status tab click | Current filter |
| `varSelectedItem` | Button click | Item for modal |
| `varActor` | Screen.OnVisible | Current user Person record (available for quick Patch operations) |
| `varShowPaymentModal` | btnPickedUp click | Controls payment modal visibility |
| `varFinalCost` | Payment modal confirm | Calculated from FinalWeight |

## Person Field Format

SharePoint Person fields require a specific structure. This pattern is repeated across all modals because each uses a **different staff dropdown** (e.g., `ddApprovalStaff`, `ddRejectStaff`, etc.).

**Standard Pattern:**
```powerfx
LastActionBy: {
    Claims: "i:0#.f|membership|" & ddXXXStaff.Selected.MemberEmail,
    Discipline: "",
    DisplayName: ddXXXStaff.Selected.MemberName,
    Email: ddXXXStaff.Selected.MemberEmail,
    JobTitle: "",
    Picture: ""
}
```

> 💡 **Why the repetition?** Each modal has its own staff dropdown to allow processing actions on behalf of different staff members. The `Claims` field format (`i:0#.f|membership|email`) is required by SharePoint for Person field resolution.

**Dropdown Reference:**
| Modal | Dropdown Control |
|-------|-----------------|
| Approval | `ddApprovalStaff` |
| Rejection | `ddRejectStaff` |
| Archive | `ddArchiveStaff` |
| Details | `ddDetailsStaff` |
| Payment | `ddPaymentStaff` |
| Files | `ddFileActor` |
| Message | `ddMessageStaff` |

## Pricing Formula

**Pricing Variables (set in App.OnStart):**
| Variable | Default | Description |
|----------|---------|-------------|
| `varFilamentRate` | `0.10` | $ per gram for filament |
| `varResinRate` | `0.20` | $ per gram for resin |
| `varMinimumCost` | `3.00` | Minimum charge |

**For Estimates (Approval Modal):**
```powerfx
// EstimatedCost from EstimatedWeight
Max(varMinimumCost, EstimatedWeight * If(Method = "Resin", varResinRate, varFilamentRate))
```

**For Finals (Payment Modal):**
```powerfx
// FinalCost from FinalWeight (actual measured weight)
Max(varMinimumCost, FinalWeight * If(Method = "Resin", varResinRate, varFilamentRate))
```

> 💡 **Estimate vs Actual:** EstimatedWeight/EstimatedCost are set at approval (slicer prediction). FinalWeight/FinalCost are recorded at payment pickup (physical measurement).

> 💡 **Changing Prices:** To update pricing, only change the values in `App.OnStart`. All modals reference these variables automatically.

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

> 💡 **5 Parameters:** Pass RequestID, Action, FieldName, NewValue, ActorEmail. The flow auto-populates ClientApp ("Power Apps") and Notes.

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
// NeedsAttention items appear first, then sorted by time in queue (oldest first)
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
    "NeedsAttention", SortOrder.Descending,  // Attention items first
    "Created", SortOrder.Ascending            // Oldest first (longest in queue)
)
```

## Attention Highlight (Card Background)

```powerfx
// Rectangle.Fill for attention highlight
If(ThisItem.NeedsAttention, RGBA(255, 235, 180, 1), Color.White)

// Rectangle.BorderColor for attention highlight
If(ThisItem.NeedsAttention, RGBA(255, 180, 0, 1), RGBA(220, 220, 220, 1))

// Rectangle.BorderThickness for attention highlight
If(ThisItem.NeedsAttention, 2, 1)
```

## Color Switch Statement

```powerfx
// Matches SharePoint FilamentColor-Column-Formatting.json
Switch(
    ThisItem.Color.Value,
    "Black", RGBA(26, 26, 26, 1),
    "White", RGBA(180, 180, 180, 1),
    "Gray", RGBA(128, 128, 128, 1),
    "Red", RGBA(204, 0, 0, 1),
    "Orange", RGBA(255, 102, 0, 1),
    "Yellow", RGBA(255, 215, 0, 1),
    "Green", RGBA(76, 175, 80, 1),
    "Forest Green", RGBA(34, 139, 34, 1),
    "Blue", RGBA(0, 102, 204, 1),
    "Purple", RGBA(107, 63, 160, 1),
    "Brown", RGBA(93, 64, 55, 1),
    "Chocolate Brown", RGBA(123, 63, 0, 1),
    "Copper", RGBA(184, 115, 51, 1),
    "Bronze", RGBA(205, 127, 50, 1),
    "Silver", RGBA(192, 192, 192, 1),
    "Clear", RGBA(245, 245, 245, 1),
    "Any", RGBA(224, 224, 224, 1),
    RGBA(153, 153, 153, 1)
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
// Auto-calculate using pricing variables from App.OnStart
If(
    IsNumeric(txtEstimatedWeight.Text) && Value(txtEstimatedWeight.Text) > 0,
    "$" & Text(
        Max(varMinimumCost, Value(txtEstimatedWeight.Text) * 
            If(varSelectedItem.Method.Value = "Resin", varResinRate, varFilamentRate)),
        "[$-en-US]#,##0.00"
    ),
    "$" & Text(varMinimumCost, "[$-en-US]#,##0.00") & " (minimum)"
)
```

## Modal Visibility Pattern

```powerfx
// Show modal (on button click)
Set(varShowRejectModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)

// Hide modal (on cancel/confirm)
Set(varShowRejectModal, 0);
Set(varSelectedItem, Blank())
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
