# Staff Console — Canvas App (Tablet)

**⏱️ Time Required:** 8-12 hours (can be done in multiple sessions)  
**🎯 Goal:** Staff can view, manage, and process all 3D print requests through an intuitive dashboard

> 📚 **This is the comprehensive guide** — includes step-by-step build instructions, code references, and quick-copy snippets.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Design Standards](#design-standards) ← **Font & Color Reference**
3. [Creating the Canvas App](#step-1-creating-the-canvas-app)
4. [Adding Data Connections](#step-2-adding-data-connections)
5. [Setting Up App.OnStart](#step-3-setting-up-apponstart)
6. [Understanding Where Things Go](#understanding-where-things-go-read-this) ← **READ THIS FIRST!**
7. [Building the Top Navigation Bar](#step-4-building-the-top-navigation-bar)
8. [Creating Status Tabs](#step-5-creating-status-tabs)
9. [Building the Job Cards Gallery](#step-6-building-the-job-cards-gallery)
10. [Creating the Job Card Template](#step-7-creating-the-job-card-template)
11. [Adding Expandable Details](#step-8-adding-expandable-details)
12. [Implementing Action Buttons](#step-9-implementing-action-buttons)
13. [Building the Rejection Modal](#step-10-building-the-rejection-modal)
14. [Building the Approval Modal](#step-11-building-the-approval-modal)
15. [Building the Archive Modal](#step-12-building-the-archive-modal)
16. [Building the Complete Modal](#step-12a-building-the-complete-modal)
17. [Building the Change Print Details Modal](#step-12b-building-the-change-print-details-modal)
18. [Building the Payment Recording Modal](#step-12c-building-the-payment-recording-modal)
19. [Building the Revert Status Modal](#step-12d-building-the-revert-status-modal)
20. [Building the Build Plates Modal](#step-12f-building-the-build-plates-modal)
21. [Building the Export Modal](#step-12g-building-the-export-modal) ← **Monthly Transaction Export**
22. [Building the Batch Payment Modal](#step-12e-building-the-batch-payment-modal)
23. [Building the Notes Modal](#step-13-building-the-notes-modal)
24. [Building the Student Note Modal](#step-13b-building-the-student-note-modal)
25. [Adding Search and Filters](#step-14-adding-search-and-filters)
26. [Adding the Lightbulb Attention System](#step-15-adding-the-lightbulb-attention-system)
27. [Adding the Attachments Modal](#step-16-adding-the-attachments-modal)
28. [Adding the Messaging System](#step-17-adding-the-messaging-system) ← **⏸️ STOP: Create RequestComments list first**
    - [Step 17A: Adding the Data Connection](#step-17a-adding-the-data-connection)
    - [Step 17B: Adding Messages Display to Job Cards](#step-17b-adding-messages-display-to-job-cards)
    - [Step 17C: Adding the Message Button to Job Cards](#step-17c-adding-the-message-button-to-job-cards)
    - [Step 17D: Unified Messages Modal](#step-17d-unified-messages-modal)
    - [Step 17E: Adding the Loading Overlay](#step-17e-adding-the-loading-overlay) ← **UX Enhancement**
    - [Step 17F: Adding the Audio Notification System](#step-17f-adding-the-audio-notification-system) ← **NEW**
29. [Publishing the App](#step-18-publishing-the-app)
30. [Testing the App](#step-19-testing-the-app)
31. [Troubleshooting](#troubleshooting)
32. [Quick Reference Card](#quick-reference-card)
33. [Code Reference (Copy-Paste Snippets)](#code-reference-copy-paste-snippets)
34. [Live coauthor control inventory](#live-coauthor-control-inventory)
35. [Audit findings (live app vs docs)](#audit-findings-live-app-vs-docs)

---

# Prerequisites

Before you start, make sure you have:

- [ ] **SharePoint lists created**: `PrintRequests`, `Staff`, `BuildPlates`, `Payments`, `RequestComments`
- [ ] **Power Automate flows working**: Flow A (PR-Create), Flow B (PR-Audit), Flow C (PR-Action), Flow G (Export), Flow H (Payment-SaveSingle), Flow I (Payment-SaveBatch)
- [ ] **Staff list populated**: At least one staff member with `Active = Yes`
- [ ] **Power Apps license**: Standard license included with Microsoft 365
- [ ] **PrintRequests.ActualPrinter**: Configured as multi-select Choice column (supports jobs spanning multiple printers)

> ⚠️ **IMPORTANT:** Complete Phases 1 and 2 (SharePoint + Flows) before building the Staff Console. The app depends on these being set up correctly.

> 💡 **New SharePoint Lists:**
> - **BuildPlates** — Tracks individual build plates (gcode files) per job. See `SharePoint/BuildPlates-List-Setup.md`
> - **Payments** — Tracks individual payment transactions per job. See `SharePoint/Payments-List-Setup.md`

> 💡 **Optional:** Flow F (PR-Cleanup) handles automatic AuditLog retention and can be set up after the system is operational. See `PowerAutomate/Flow-(F)-Cleanup-AuditRetention.md`.

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
| App Title | `Font.'Open Sans'` | 18 | Semibold |
| Modal Titles | `Font.'Open Sans'` | 20 | Semibold |
| Section Headers | `Font.'Open Sans'` | 11-12 | Semibold |
| Body Text | `Font.'Open Sans'` | 10-11 | Normal |
| Labels/Hints | `Font.'Open Sans'` | 8-10 | Normal |
| Buttons | `Font.'Open Sans'` | 10-13 | Normal |

**Button font size tiers (implemented in the app):** Standard card actions use `varBtnFontSize` (12). The app also uses intentional fixed sizes for density and touch targets:

| Tier | Size | Typical controls |
|------|------|------------------|
| Standard | `varBtnFontSize` (12) | Primary card actions (`btnApprove`, `btnReject`, …) |
| Compact card actions | `9` | `btnViewNotes`, `btnViewMessages` |
| Header / tight card chrome | `8` | `btnNavAnalytics`, `btnBuildPlates` |
| Ultra-compact | `5` | `btnStudentNote` |
| Modal chrome | `14` | Modal ✕ close buttons (`btnRejectClose`, …), `btnBuildPlatesDone` |

> ⚠️ **Consistency Rule:** Always use `Font.'Open Sans'` throughout the app. Avoid mixing fonts like `Font.'Open Sans'` — stick to the Microsoft design language.

### Color Palette

> **Moodle Brand Colors:** These colors match the lab's Moodle course pages for visual consistency.

| Purpose | Color | RGBA | Hex |
|---------|-------|------|-----|
| Primary (Active) | Blue | `RGBA(70, 130, 220, 1)` | #4682DC |
| Success | Green | `RGBA(46, 125, 50, 1)` | #2e7d32 |
| Warning | Orange | `RGBA(255, 140, 0, 1)` | #FF8C00 |
| Error/Reject | Red | `RGBA(219, 3, 3, 1)` | #DB0303 |
| Info | Blue | `RGBA(70, 130, 220, 1)` | #4682DC |
| Gold (Pending) | Gold | `RGBA(255, 185, 0, 1)` | #FFB900 |
| Orange (Printing) | Orange | `RGBA(255, 140, 0, 1)` | #FF8C00 |
| Header Background | Dark Gray | `RGBA(77, 77, 77, 1)` | — |
| Modal Overlay | Black 70% | `RGBA(0, 0, 0, 0.7)` — use `varColorOverlay` in the app | — |
| Card Background | Warm Cream | `RGBA(247, 237, 223, 1)` | — |
| Muted Text | Gray | `RGBA(100, 100, 100, 1)` | — |
| Secondary Btn Border | Gray | `RGBA(166, 166, 166, 1)` | #A6A6A6 |

### Button Styles

| Type | Fill | Color | Border |
|------|------|-------|--------|
| Primary Action | Solid color (varColorPrimary) | White | None |
| Secondary (Light Fill) | `ColorFade(varColor*, varSecondaryFade)` | Colored | Gray, 2px (`varSecondaryBtnBorderColor`) |
| Outline | White | Colored | Colored, 1px |
| Danger | White | Red | Red, 1px |
| Navigation (Active) | `varColorPrimary` | White | None |
| Navigation (Inactive) | `RGBA(60, 60, 65, 1)` | White | None |

**All standard buttons should include:**
| Property | Value |
|----------|-------|
| Height | `varBtnHeight` (36) |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Font | `varAppFont` |
| Size | `varBtnFontSize` (12) |

**Compact toolbar (filter bar):** Controls in the row under the status tabs (`txtSearch`, `ddSortOrder`, `btnClearFilters`, `btnRefresh`, `chkNeedsAttention`) intentionally use **Height `26`** and often **Size `10`** so the bar stays dense. This is separate from standard `varBtnHeight` (36) buttons.

**Secondary buttons (light fill) should also include:**
| Property | Value |
|----------|-------|
| BorderColor | `varSecondaryBtnBorderColor` |
| BorderThickness | `2` |

### Corner Radius Standards

| Element Type | Radius | Variable | Examples |
|--------------|--------|----------|----------|
| Cards & Modals | `8` | — | `recCardBackground`, `recApprovalModal` |
| Primary Buttons | `6` | — | `btnViewMsgSend` (in messages modal), card uses `btnViewMessages` |
| Action Buttons | `4` | `varBtnBorderRadius` | `btnApprove`, `btnReject`, `btnEditDetails` |
| Text Inputs | `4` | `varInputBorderRadius` | `txtSearch`, `txtViewMsgSubject` |
| Dropdowns | `4` | `varInputBorderRadius` | `ddRejectStaff`, `ddViewMsgStaff` |

> 💡 **Consistency Tip:** Apply all four radius properties together:
> ```powerfx
> RadiusTopLeft: varInputBorderRadius
> RadiusTopRight: varInputBorderRadius
> RadiusBottomLeft: varInputBorderRadius
> RadiusBottomRight: varInputBorderRadius
> ```

### Input Field Styles

All text inputs and dropdowns use centralized styling variables for a clean, consistent look.

| Property | Variable | Value |
|----------|----------|-------|
| Border Color | `varInputBorderColor` | `RGBA(128, 128, 128, 1)` (gray) |
| Border Thickness | `varInputBorderThickness` | `1` |
| Focus Border | `varFocusedBorderThickness` | `2` |
| Hover Fill | `varInputHoverFill` | `RGBA(255, 255, 255, 1)` (white) |
| Font Size | `varInputFontSize` | `12` |
| Corner Radius | `varInputBorderRadius` | `4` |

### Dropdown/ComboBox Chevron Styles

| Property | Variable | Value |
|----------|----------|-------|
| Chevron Background | `varChevronBackground` | `RGBA(128, 128, 128, 1)` |
| Chevron Arrow | `varChevronFill` | `RGBA(255, 255, 255, 1)` |
| Chevron Hover Fill | `varChevronHoverFill` | `RGBA(219, 219, 219, 1)` |
| Row Hover Fill | `varDropdownHoverFill` | `RGBA(219, 219, 219, 1)` |
| Pressed Fill | `varDropdownPressedFill` | `RGBA(128, 128, 128, 1)` |
| Selection Fill | `varDropdownSelectionFill` | `RGBA(219, 219, 219, 1)` |
| Selection Text | `varDropdownSelectionColor` | `RGBA(50, 50, 50, 1)` |

> 💡 **Consistency Rule:** All dropdowns and combo boxes should use the shared `varDropdown*` and `varChevron*` variables for hover, pressed, and selection states. Do not hardcode row state colors on individual controls.

### Job card semantic backgrounds (`recCardBackground`)

These are **not** global theme tokens—they are conditional fills and borders on each job card:

| State | Fill | Border |
|-------|------|--------|
| Default | `varColorBgCard` | `varColorBorderLight` |
| Needs attention | `RGBA(255, 235, 180, 1)` | `RGBA(102, 102, 102, 1)`, **BorderThickness** `2` |
| Batch selection (selected completed job) | `RGBA(220, 240, 220, 1)` | `varColorSuccess` |

Default **BorderThickness** when not needing attention is **1.5** in the shipped app (slightly heavier than a single pixel for card separation).

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
| Approval | 600 | 725 | Includes cost calculator, slicing computer dropdown |
| Rejection | 600 | 610 | Multiple checkboxes |
| Archive | 500 | 400 | Simple confirmation |
| Details | 550 | 620 | Multiple dropdowns |
| Payment | 550 | 660 | Includes own material discount + partial pickup |
| Files | 500 | 450 | Attachment form |
| Message | 600 | 500 | Text input area |

> ⚡ **Responsive Modal Sizing:** For better responsiveness on smaller screens, use `Min()`:
> ```powerfx
> Width: Min(varModalMaxWidth, Parent.Width - varModalMargin)
> Height: Min(varModalMaxHeight, Parent.Height - varModalMargin)
> X: (Parent.Width - Min(varModalMaxWidth, Parent.Width - varModalMargin)) / 2
> Y: (Parent.Height - Min(varModalMaxHeight, Parent.Height - varModalMargin)) / 2
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
   - [x] **Staff**
   - [x] **BuildPlates**
   - [x] **Payments**
   - [x] **RequestComments**
10. Click **Connect**.

> 💡 **AuditLog note:** Do **not** add AuditLog as a direct data connection. Audit writes are handled automatically by Flow C — the app never reads from AuditLog directly.

### Adding the Power Automate Flows

> ⚠️ **IMPORTANT:** Adding a flow is DIFFERENT from adding a data source. Don't search for "Power Automate" in the data panel — those are admin connectors, not your flow!

11. Look in the **left sidebar** for a **Power Automate icon** (lightning bolt ⚡).
    - OR: In the top menu, click the **three dots (...)** → **Power Automate**
12. Click **+ Add flow**.
13. You'll see "Add a flow from this environment" with your flows listed.
14. Under **Instant**, add each of the following flows one at a time:
    - **Flow C (PR-Action)**
    - **Flow G (Export-MonthlyTransactions)**
    - **Flow H (Payment-SaveSingle)**
    - **Flow I (Payment-SaveBatch)**

> 💡 **Why only C, G, H, I?** Flows A and B are automatic SharePoint triggers — they run on their own when items are created/modified. Only the instant flows are called from Power Apps buttons.

| Flow | Trigger Type | Add to Power Apps? |
|------|-------------|-------------------|
| Flow A (PR-Create) | Automatic (SharePoint) | ❌ No |
| Flow B (PR-Audit) | Automatic (SharePoint) | ❌ No |
| **Flow C (PR-Action)** | **Instant (Power Apps)** | ✅ **Yes** |
| **Flow G (Export-MonthlyTransactions)** | **Instant (Power Apps)** | ✅ **Yes** |
| **Flow H (Payment-SaveSingle)** | **Instant (Power Apps)** | ✅ **Yes** |
| **Flow I (Payment-SaveBatch)** | **Instant (Power Apps)** | ✅ **Yes** |

### Verification

**In the Data panel**, you should see:
- ✅ PrintRequests
- ✅ Staff
- ✅ BuildPlates
- ✅ Payments
- ✅ RequestComments

**In the Power Automate panel**, you should see:
- ✅ Flow-(C)-Action-LogAction
- ✅ Flow-(G)-Export-MonthlyTransactions
- ✅ Flow-(H)-Payment-SaveSingle
- ✅ Flow-(I)-Payment-SaveBatch

> ⚠️ **Flow Name Note:** Formulas use quoted names exactly as above. If your flow titles differ in Power Apps, change every `'...'.Run(` to match the **Data** panel name.

---

# STEP 3: Setting Up App.OnStart

**What you're doing:** Initializing variables that the entire app will use—like knowing who's logged in, loading staff data, and defining status options.

### Instructions

1. In the **Tree view** (left panel), click on **App** at the very top.
2. In the **Property dropdown** (top left, shows "OnStart"), make sure **OnStart** is selected.
3. Click in the **formula bar** (the wide text area at the top).
4. Delete any existing content and paste this formula:

> **Coauthor source of truth:** The block below matches **`PowerApps/canvas-coauthor/App.pa.yaml`** after `sync_canvas`. If Studio and this doc diverge, sync YAML first, then update this section.

**⬇️ FORMULA: Paste into App.OnStart**

```powerfx
=// === USER IDENTIFICATION ===
// Cache user info for performance
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);

// === SLICING COMPUTERS ===
// Loaded directly from SharePoint choices â€” adding a computer to the column auto-updates this
ClearCollect(colSlicingComputers, ForAll(Choices(PrintRequests.SlicedOnComputer), {Name: ThisRecord.Value}));

// === STATUS DEFINITIONS ===
// All possible statuses in the system
Set(varStatuses, ["Uploaded", "Pending", "Ready to Print", "Printing", "Completed", "Paid & Picked Up", "Rejected", "Canceled", "Archived"]);

// Statuses shown in the main queue (active work)
Set(varQuickQueue, ["Uploaded", "Pending", "Ready to Print", "Printing", "Completed"]);

// === UI STATE VARIABLES ===
// Currently selected status tab
Set(varSelectedStatus, "Uploaded");

// Current page/view
Set(varCurrentPage, "Dashboard");

// Search and filter state
Set(varSearchText, "");
Set(varSortOrder, "Queue Order");
Set(varNeedsAttention, false);
Set(varExpandAll, false);

// === MODAL CONTROLS ===
// These control which modal is visible (0 = hidden, ID = visible for that item)
Set(varShowRejectModal, 0);
Set(varShowApprovalModal, 0);
Set(varBuildPlatesOpenedFromApproval, false);
Set(varShowArchiveModal, 0);
Set(varShowCompleteModal, 0);
Set(varShowDetailsModal, 0);
Set(varShowPaymentModal, 0);
Set(varShowAddFileModal, 0);
Set(varShowNotesModal, 0);
Set(varShowViewMessagesModal, 0);
Set(varShowStudentNoteModal, 0);
Set(varShowRevertModal, 0);
Set(varShowBatchPaymentModal, 0);
Set(varShowBuildPlatesModal, 0);
Set(varShowExportModal, false);

// === SCHEDULE SCREEN STATE ===
Set(varSchedSelectedEmail, "");
Set(varSchedEditSaving, false);
Set(varSchedShowReorder, false);
Set(varSchedTotalsSortBy, "Total");
Set(varSchedTotalsSortDesc, true);
Set(varSchedScrollVersion, 0);
ClearCollect(colEditShifts, {RowKey: "x", Day: "Monday", ShiftStart: "8:30 AM", ShiftEnd: "9:00 AM"});
Clear(colEditShifts);

// === BATCH PAYMENT MODE ===
// Controls multi-select batch payment functionality
Set(varBatchSelectMode, false);
ClearCollect(colBatchItems, Blank());
Clear(colBatchItems);
ClearCollect(colBatchSucceededItems, Blank());
Clear(colBatchSucceededItems);
ClearCollect(colBatchFailedItems, Blank());
Clear(colBatchFailedItems);

// Batch calculation variables (used during batch payment processing)
Set(varBatchTotalEstWeight, 0);
Set(varBatchCombinedWeight, 0);
Set(varBatchItemCount, 0);
Set(varBatchLastItemID, 0);
Set(varBatchLastItemWeight, 0);
Set(varBatchFinalCost, 0);
Set(varBatchProcessedCount, 0);
// DateTime â€” use Now() (not Blank()) so App Checker infers a type. Flow H / I still send PaymentDate from the modal; these are legacy scratch fields if anything in the app references them.
Set(varBatchRecordedAt, Now());
Set(varPaymentRecordedAt, Now());

// === PAYMENT FLOW SCRATCH (Flow H / Flow I + App Checker types) ===
// Initialize before any control references these; flow .Run() overwrites varFlowResult.
Set(varFlowResult, {success: "false", message: "", paymentid: ""});
Set(varPickedPlatesText, "");
Set(varPickedPlateIDsText, "");
Set(varPickedPlateIDsList, "");
Set(varBaseCost, 0);
Set(varFinalCost, 0);

// Currently selected item for modals (typed to PrintRequests schema)
Set(varSelectedItem, Blank());

// === LOADING STATE ===
// Controls loading overlay visibility during async operations
Set(varIsLoading, false);

// === AUDIO NOTIFICATION SYSTEM ===
// Boolean trigger for Audio control (use Reset(audNotification) then Set(varPlaySound, true) to play)
Set(varPlaySound, false);

// === DATA LOADING ===
// Load all SharePoint data in parallel to reduce startup time and avoid 429 throttling.
// Concurrent() fires these as a single batched request instead of sequential calls.
Concurrent(
    ClearCollect(
        colStaff,
        ForAll(
            Filter(Staff, Active = true),
            {
                StaffID:        ID,
                MemberName:     Member.DisplayName,
                MemberEmail:    Member.Email,
                Role:           Role,
                Active:         Active,
                AidType:        AidType.Value,
                SchedSortOrder: Coalesce(SchedSortOrder, 10)
            }
        )
    ),
    ClearCollect(colNeedsAttention, Filter(PrintRequests, NeedsAttention = true)),
    ClearCollect(colAllBuildPlates, BuildPlates),
    ClearCollect(colAllPayments, Payments)
);

// === SCHEDULE: TIME SLOTS ===
// 17 rows: Idx 0-15 = grid start-of-block (8:30 AM-4:00 PM); Idx 16 = 4:30 PM end boundary for lookups only
ClearCollect(colTimeSlots,
    {Idx: 0,  Label: "8:30 AM",  Minutes: 510},
    {Idx: 1,  Label: "9:00 AM",  Minutes: 540},
    {Idx: 2,  Label: "9:30 AM",  Minutes: 570},
    {Idx: 3,  Label: "10:00 AM", Minutes: 600},
    {Idx: 4,  Label: "10:30 AM", Minutes: 630},
    {Idx: 5,  Label: "11:00 AM", Minutes: 660},
    {Idx: 6,  Label: "11:30 AM", Minutes: 690},
    {Idx: 7,  Label: "12:00 PM", Minutes: 720},
    {Idx: 8,  Label: "12:30 PM", Minutes: 750},
    {Idx: 9,  Label: "1:00 PM",  Minutes: 780},
    {Idx: 10, Label: "1:30 PM",  Minutes: 810},
    {Idx: 11, Label: "2:00 PM",  Minutes: 840},
    {Idx: 12, Label: "2:30 PM", Minutes: 870},
    {Idx: 13, Label: "3:00 PM",  Minutes: 900},
    {Idx: 14, Label: "3:30 PM", Minutes: 930},
    {Idx: 15, Label: "4:00 PM",  Minutes: 960},
    {Idx: 16, Label: "4:30 PM",  Minutes: 990}
);

// === SCHEDULE: COLOR PALETTE (warm earth tones matching reference) ===
ClearCollect(colSchedColors,
    {Idx: 0,  Hex: "#7B3F2B", Light: "#E8C9B8"},
    {Idx: 1,  Hex: "#4A7C59", Light: "#B8D9C4"},
    {Idx: 2,  Hex: "#C87941", Light: "#F0D4B0"},
    {Idx: 3,  Hex: "#8B5E3C", Light: "#D9C0A8"},
    {Idx: 4,  Hex: "#2E6B4F", Light: "#A8D4BE"},
    {Idx: 5,  Hex: "#B34A2A", Light: "#EAB89A"},
    {Idx: 6,  Hex: "#5B7A3A", Light: "#C0D4A0"},
    {Idx: 7,  Hex: "#9B4520", Light: "#E8B898"},
    {Idx: 8,  Hex: "#3D7060", Light: "#AACCB8"},
    {Idx: 9,  Hex: "#A06030", Light: "#DEC0A0"},
    {Idx: 10, Hex: "#6B3A5A", Light: "#CCA8C0"},
    {Idx: 11, Hex: "#4E7A8A", Light: "#B0CCd8"}
);

// Pre-aggregate build plate counts per request (avoids per-card inline filtering on the dashboard)
ClearCollect(colBuildPlateSummary,
    ForAll(
        Distinct(colAllBuildPlates, RequestID) As grp,
        {
            RequestID: grp.Value,
            TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))),
            CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))),
            ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))),
            ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))
        }
    )
);

// Check if current user is a staff member (uses colStaff loaded above)
Set(varIsStaff, CountRows(Filter(colStaff, Lower(MemberEmail) = varMeEmail)) > 0);

// Track count for change detection (CountRows on local collection is safe)
Set(varPrevAttentionCount, CountRows(colNeedsAttention));

// === WORKING COLLECTIONS ===
// Initialize typed empty tables from already-loaded collections (no additional SharePoint calls)
ClearCollect(colBuildPlates, FirstN(colAllBuildPlates, 0));
ClearCollect(colBuildPlatesIndexed, AddColumns(FirstN(colAllBuildPlates, 0), PlateNum, Blank(), ResolvedPlateLabel, Blank()));
ClearCollect(colPickedUpPlates, AddColumns(FirstN(colAllBuildPlates, 0), PlateNum, Blank(), ResolvedPlateLabel, Blank()));
Clear(colPickedUpPlates);
ClearCollect(colPrintersUsed, FirstN(Distinct(colAllBuildPlates, Machine.Value), 0));
ClearCollect(colPayments, FirstN(colAllPayments, 0));

// === PRICING CONFIGURATION ===
// Centralized pricing rates - change here to update all cost calculations
Set(varFilamentRate, 0.10);    // $ per gram for filament printing
Set(varResinRate, 0.30);       // $ per mL for resin printing  
Set(varResinDensity, 1.11);    // g per mL for Formlabs Black/Gray/White/Clear V4.1 resin
Set(varResinGramRate, Round(varResinRate / varResinDensity, 4)); // $ per gram for resin pickup billing
Set(varMinimumCost, 3.00);     // Minimum charge for any print job

// === STYLING / THEMING ===
// Centralized font setting - use varAppFont in controls for easy bulk updates
Set(varAppFont, Font.'Open Sans');

// === BUTTON COLOR PALETTE ===
Set(varColorPrimary, RGBA(70, 130, 220, 1));       // Blue - primary actions
Set(varColorSuccess, RGBA(46, 125, 50, 1));        // Green #2e7d32 - Resources
Set(varColorDanger, RGBA(219, 3, 3, 1));           // Red #DB0303 - Subtractive, Safety
Set(varColorWarning, RGBA(255, 140, 0, 1));        // Orange - archive/caution
Set(varColorNeutral, RGBA(150, 150, 150, 1));      // Gray - cancel
Set(varColorInfo, RGBA(70, 130, 220, 1));          // Alias for primary

// === COLOR HOVER/PRESSED STATES ===
Set(varColorPrimaryHover, ColorFade(varColorPrimary, -15%));
Set(varColorPrimaryPressed, ColorFade(varColorPrimary, -25%));
Set(varColorSuccessHover, ColorFade(varColorSuccess, -15%));
Set(varColorDangerHover, ColorFade(varColorDanger, -15%));

// === UI NEUTRAL COLORS ===
Set(varColorHeader, RGBA(77, 77, 77, 1));          // Header background (matches recHeader)
Set(varNavBtnInactiveFill, RGBA(128, 128, 128, 1));  // Nav button inactive state
Set(varNavBtnHoverFill, RGBA(90, 90, 90, 1));      // Nav button hover state
Set(varColorText, RGBA(50, 50, 50, 1));            // Primary text
Set(varColorTextMuted, RGBA(100, 100, 100, 1));    // Secondary/muted text
Set(varColorTextLight, RGBA(150, 150, 150, 1));    // Hint text
Set(varColorBg, RGBA(248, 248, 248, 1));           // Screen background
Set(varColorBgCard, RGBA(247, 237, 223, 1));        // Card/modal background (warm cream)
Set(varColorBorder, RGBA(200, 200, 200, 1));       // Input borders
Set(varColorBorderLight, RGBA(220, 220, 220, 1)); // Card borders
Set(varSecondaryBtnBorderColor, RGBA(166, 166, 166, 1)); // Secondary button borders
Set(varColorOverlay, RGBA(0, 0, 0, 0.7));          // Modal overlay
Set(varColorDisabled, RGBA(180, 180, 180, 1));    // Disabled state

// === BORDER RADIUS ===
Set(varRadiusLarge, 12);    // Modals
Set(varRadiusMedium, 8);    // Cards, large buttons
Set(varRadiusSmall, 6);     // Standard buttons
Set(varRadiusXSmall, 4);    // Inputs, small buttons
Set(varRadiusPill, 14);     // Status badges (pill shape)

// === BUTTON STYLING ===
Set(varBtnBorderRadius, 4);                        // Standard corner radius
Set(varBtnBorderRadiusPill, 20);                   // Pill shape for tabs
Set(varBtnFontSize, 12);
Set(varBtnHeight, 36);
Set(varBtnHeightLarge, 50);                        // Large buttons
Set(varBtnHeightSmall, 40);                        // Navigation buttons
Set(varSecondaryFade, 70%);                        // Secondary button fill lightness

// === FOCUS STYLING ===
// Consistent focus indicator for all interactive controls (buttons, inputs, dropdowns)
Set(varFocusedBorderThickness, 2);

// === INPUT FIELD STYLING ===
// Cleaner borders than Power Apps defaults - gray instead of themed colors
Set(varInputBorderColor, RGBA(128, 128, 128, 1));  // Gray border
Set(varInputBorderThickness, 1);                   // Thin border
Set(varInputHoverFill, RGBA(255, 255, 255, 1));    // White on hover
Set(varInputBorderRadius, 4);                      // Match button radius
Set(varInputFontSize, 12);                         // Standard input text size

// === DROPDOWN/COMBOBOX STYLING ===
// Custom chevron and selection colors for a polished look
Set(varChevronBackground, RGBA(128, 128, 128, 1));     // Gray chevron background
Set(varChevronFill, RGBA(255, 255, 255, 1));           // White chevron arrow
Set(varChevronHoverBackground, RGBA(128, 128, 128, 1));
Set(varChevronHoverFill, RGBA(219, 219, 219, 1));      // Light gray on hover
Set(varDropdownHoverFill, RGBA(219, 219, 219, 1));     // Light gray row hover
Set(varDropdownPressedFill, RGBA(128, 128, 128, 1));   // Gray when pressed
Set(varDropdownPressedColor, RGBA(255, 255, 255, 1)); // White text when pressed
Set(varDropdownSelectionFill, RGBA(219, 219, 219, 1)); // Light gray selected row background
Set(varDropdownSelectionColor, varColorText); // Dark text so selected items remain readable

// === LAYOUT DIMENSIONS ===
// Modal sizing - adjust for different screen sizes or design preferences
Set(varModalMaxWidth, 600);                        // Maximum modal width in pixels
Set(varModalMaxHeight, 650);                       // Standard modal height
Set(varModalMaxHeightExpanded, 740);               // Expanded height (with payment history)
Set(varModalMargin, 40);                           // Margin from screen edges

// Gallery template sizes
Set(varTabGalleryHeight, 148);                     // Status tabs gallery height
Set(varCardGalleryHeight, 450);                    // Job cards gallery template size (increased for Build Plates row)

// Message bubble layout
Set(varMessageBubbleWidth, 0.85);                  // Message bubble width as % of container

// === BUSINESS RULES ===
// Discount rate for students providing their own material
Set(varOwnMaterialDiscount, 0.30);                 // 30% of base cost when using own material

// === CONTACT INFORMATION ===
// Update these when location or contact details change
Set(varSupportEmail, "coad-fablab@lsu.edu");
Set(varPickupLocation, "Room 145 Atkinson Hall");
Set(varPaymentMethod, "TigerCASH only");

// === DATE/TIME FORMATS ===
// Consistent date formatting across the app
Set(varDateFormatShort, "mmm d, yyyy");            // e.g., "Feb 20, 2026"
Set(varDateFormatFull, "mmmm d, yyyy h:mm AM/PM"); // e.g., "February 20, 2026 3:45 PM"
Set(varDateTimeShort, "mmm d, h:mm AM/PM");        // e.g., "Mar 4, 2:17 PM"

// === NAVIGATION ===
// Screen transition effect - change to customize navigation feel
Set(varScreenTransition, ScreenTransition.Fade);

// === TIMER CONFIGURATION ===
// Auto-refresh interval for dashboard data (milliseconds)
Set(varRefreshInterval, 30000);                    // 30 seconds

// === SCHEDULE SCREEN STATE ===
Set(varSchedSelectedEmail, "");
Set(varSchedEditSaving, false);
Set(varSchedShowReorder, false);
ClearCollect(colEditShifts, {RowKey: "x", Day: "Monday", ShiftStart: "", ShiftEnd: ""});
Clear(colEditShifts);

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
| `colStaff` | Active staff from SharePoint `Staff` (`Active = true`), flattened: `StaffID`, `MemberName`, `MemberEmail`, `Role`, `Active`, `AidType`, `SchedSortOrder` | Table |
| `varIsStaff` | Is current user a staff member? | Boolean |
| `varStatuses` | All status options | Table |
| `varQuickQueue` | Active queue statuses | Table |
| `varSelectedStatus` | Currently selected status tab | Text |
| `varCurrentPage` | Legacy navigation flag (live header uses `Navigate` / modals instead of multi-page chrome) | Text |
| `colSlicingComputers` | `{Name}` table from `Choices(PrintRequests.SlicedOnComputer)` for slicer dropdowns | Table |
| `varSearchText` | Current search filter | Text |
| `varSortOrder` | Current dashboard sort mode | Text |
| `varNeedsAttention` | Filter for attention items only | Boolean |
| `varExpandAll` | Reserved (expand/collapse removed; cards always expanded) | Boolean |
| `varSchedSelectedEmail` | Schedule screen: staff member email selected for editing | Text |
| `varSchedEditSaving` | Schedule screen: true while save is in progress | Boolean |
| `varSchedShowReorder` | Schedule screen: UI flag for totals row reorder mode | Boolean |
| `varSchedTotalsSortBy` | Schedule screen: totals gallery sort column (`Total`, day names, etc.) | Text |
| `varSchedTotalsSortDesc` | Schedule screen: totals sort descending when true | Boolean |
| `varSchedScrollVersion` | Schedule screen: bumps `conSchedScrollBody` template height when changed | Number |
| `colEditShifts` | Schedule screen: in-memory shift rows for the editor gallery | Table |
| `colTimeSlots` | Schedule screen: `{Idx, Label, Minutes}` rows for the HTML grid (Idx 0–16) | Table |
| `colSchedColors` | Schedule screen: `{Idx, Hex, Light}` palette rows for staff blocks | Table |
| `varShowRejectModal` | ID of item being rejected (0=hidden) | Number |
| `varShowApprovalModal` | ID of item being approved (0=hidden) | Number |
| `varBuildPlatesOpenedFromApproval` | Tracks whether Build Plates was opened from the Approval modal | Boolean |
| `varShowArchiveModal` | ID of item being archived (0=hidden) | Number |
| `varShowCompleteModal` | ID of item being marked complete (0=hidden) | Number |
| `varShowDetailsModal` | ID of item for detail changes (0=hidden) | Number |
| `varShowPaymentModal` | ID of item for payment (0=hidden) | Number |
| `varShowAddFileModal` | ID of item for attachments (0=hidden) | Number |
| `varShowNotesModal` | ID of item for notes modal (0=hidden) | Number |
| `varShowViewMessagesModal` | ID of item for unified messages modal (0=hidden) | Number |
| `varShowStudentNoteModal` | ID of item for student note modal (0=hidden) | Number |
| `varShowRevertModal` | ID of item for revert status modal (0=hidden) | Number |
| `varRevertPlatesNeeded` | True when the current revert is `Paid & Picked Up` → `Completed` and should cascade to plates | Boolean |
| `varRevertedPlateCount` | Number of plates the revert cascade will flip `Picked Up` → `Completed` (used in StaffNotes, audit log, and toast) | Number |
| `colRevertedPlates` | Snapshot of `BuildPlates` rows targeted by the revert cascade (used to drive the `ForAll` patch) | Table |
| `varShowBatchPaymentModal` | Controls batch payment modal visibility (0=hidden) | Number |
| `varShowBuildPlatesModal` | ID of item for build plates modal (0=hidden) | Number |
| `varShowExportModal` | Controls export modal visibility | Boolean |
| `varBatchSelectMode` | Whether multi-select batch payment mode is active | Boolean |
| `colBatchItems` | Collection of items selected for batch payment | Table |
| `colBatchSucceededItems` | Batch items saved successfully in the current run | Table |
| `colBatchFailedItems` | Batch items that failed validation or patching in the current run | Table |
| `varBatchTotalEstWeight` | Sum of estimated weights for batch items (calculation temp) | Number |
| `varBatchCombinedWeight` | Combined final weight entered for batch (calculation temp) | Number |
| `varBatchItemCount` | Number of items in batch (calculation temp) | Number |
| `varBatchLastItemID` | ID of the last batch item (receives rounding remainder) | Number |
| `varBatchLastItemWeight` | Weight for last batch item after remainder adjustment | Number |
| `varBatchFinalCost` | Sum of the per-item charges for the current batch run | Number |
| `varBatchProcessedCount` | Count of items processed (for notification) | Number |
| `varBatchRecordedAt` | Shared timestamp used for all rows created by one batch checkout | DateTime |
| `varSelectedItem` | Item currently selected for modal | PrintRequests Record |
| `varPaymentRecordedAt` | Timestamp used for the current single-item payment row | DateTime |
| `varIsLoading` | Shows loading overlay during operations | Boolean |
| `varLoadingMessage` | Custom message shown during loading | Text |
| `colNeedsAttention` | Local collection of NeedsAttention items (avoids delegation) | Table |
| `varPrevAttentionCount` | Previous count of NeedsAttention items (for change detection) | Number |
| `colAllBuildPlates` | All BuildPlates records pre-loaded at startup (avoids per-card delegation) | Table |
| `colBuildPlateSummary` | Pre-aggregated build plate counts per `RequestID` (`TotalCount`, `CompletedCount`, `ReprintTotal`, `ReprintCompleted`) — rebuilt after every `colAllBuildPlates` refresh | Table |
| `colAllPayments` | All Payments records pre-loaded for job-card payment summaries | Table |
| `colBuildPlates` | Sorted BuildPlates records for currently selected item | Table |
| `colBuildPlatesIndexed` | `colBuildPlates` with dynamic `PlateNum` plus resolved staff-facing labels | Table |
| `colPickedUpPlates` | Plates checked for pickup in Payment Modal | Table |
| `colPrintersUsed` | Distinct printers used for current item | Table |
| `colPayments` | Payment records for current modal context | Table |
| `varPickedPlatesText` | Deduped, sorted comma-separated plate numbers for the current payment save | Text |
| `varPickedPlateIDsText` | Comma-separated `PlateKey` values passed to Flow H | Text |
| `varPickedPlateIDsList` | Comma-separated numeric `BuildPlates.ID` values passed to Flow H | Text |
| `varFlowResult` | Last instant-flow response (`success`, `message`, `paymentid` — lowercase) | Record |
| `varBaseCost` | Payment modal: base cost before own-material discount | Number |
| `varFinalCost` | Payment modal: final cost after discount | Number |
| `varPlaySound` | Boolean trigger for Audio; use `Reset(audNotification); Set(varPlaySound, true)` to play | Boolean |
| `varFilamentRate` | Cost per gram for filament printing | Number |
| `varResinRate` | Cost per mL for resin printing | Number |
| `varResinDensity` | Resin density in g/mL for pickup conversion | Number |
| `varResinGramRate` | Cost per gram for resin pickup billing | Number |
| `varMinimumCost` | Minimum charge for any print job | Number |
| `varAppFont` | Global font for consistent styling | Font |
| `varColorPrimary` | Blue - primary actions | Color |
| `varColorSuccess` | Green #2e7d32 - approve/complete (Moodle: Resources) | Color |
| `varColorDanger` | Red #DB0303 - reject/delete (Moodle: Subtractive, Safety) | Color |
| `varColorWarning` | Orange - archive/caution | Color |
| `varColorNeutral` | Gray - cancel | Color |
| `varColorInfo` | Alias for primary | Color |
| `varColorPrimaryHover` | Primary color hover state | Color |
| `varColorPrimaryPressed` | Primary color pressed state | Color |
| `varColorSuccessHover` | Success color hover state | Color |
| `varColorDangerHover` | Danger color hover state | Color |
| `varColorHeader` | Header background (`recHeader`); `RGBA(77, 77, 77, 1)` | Color |
| `varNavBtnInactiveFill` | Nav button inactive state | Color |
| `varNavBtnHoverFill` | Nav button hover state | Color |
| `varColorText` | Primary text color | Color |
| `varColorTextMuted` | Secondary/muted text color | Color |
| `varColorTextLight` | Hint text color | Color |
| `varColorBg` | Screen background color | Color |
| `varColorBgCard` | Card/modal background color | Color |
| `varColorBorder` | Input border color | Color |
| `varColorBorderLight` | Card border color | Color |
| `varSecondaryBtnBorderColor` | Secondary button border color (#A6A6A6) | Color |
| `varColorOverlay` | Modal overlay color | Color |
| `varColorDisabled` | Disabled state color | Color |
| `varRadiusLarge` | Border radius for modals (12) | Number |
| `varRadiusMedium` | Border radius for cards (8) | Number |
| `varRadiusSmall` | Border radius for buttons (6) | Number |
| `varRadiusXSmall` | Border radius for inputs (4) | Number |
| `varRadiusPill` | Border radius for badges (14) | Number |
| `varFocusedBorderThickness` | Focus indicator thickness for all controls | Number |
| `varInputBorderColor` | Border color for inputs/dropdowns | Color |
| `varInputBorderThickness` | Border thickness for inputs/dropdowns | Number |
| `varInputHoverFill` | Hover fill for inputs | Color |
| `varInputBorderRadius` | Corner radius for inputs/dropdowns | Number |
| `varInputFontSize` | Font size for inputs | Number |
| `varChevronBackground` | Dropdown chevron background color | Color |
| `varChevronFill` | Dropdown chevron arrow color | Color |
| `varChevronHoverBackground` | Dropdown chevron hover background | Color |
| `varChevronHoverFill` | Dropdown chevron hover arrow color | Color |
| `varDropdownHoverFill` | Dropdown row hover color | Color |
| `varDropdownPressedFill` | Dropdown pressed state fill | Color |
| `varDropdownPressedColor` | Dropdown pressed state text color | Color |
| `varDropdownSelectionFill` | Dropdown selection background | Color |
| `varDropdownSelectionColor` | Dropdown selection text color | Color |
| `varModalMaxWidth` | Maximum modal width in pixels | Number |
| `varModalMaxHeight` | Standard modal height in pixels | Number |
| `varModalMaxHeightExpanded` | Expanded modal height (with payment history) | Number |
| `varModalMargin` | Margin from screen edges for modals | Number |
| `varTabGalleryHeight` | Status tabs gallery template height | Number |
| `varCardGalleryHeight` | Job cards gallery template size (490 - includes Build Plates row) | Number |
| `varMessageBubbleWidth` | Message bubble width as % of container | Number |
| `varOwnMaterialDiscount` | Discount multiplier for own material (0.30 = 30%) | Number |
| `varSupportEmail` | Help/support email address | Text |
| `varPickupLocation` | Physical pickup location | Text |
| `varPaymentMethod` | Accepted payment method | Text |
| `varDateFormatShort` | Short date format string | Text |
| `varDateFormatFull` | Full date/time format string | Text |
| `varDateTimeShort` | Compact date/time format string | Text |
| `varScreenTransition` | Navigation transition effect | ScreenTransition |
| `varRefreshInterval` | Auto-refresh timer interval (milliseconds) | Number |

> 💡 **Styling Tip:** Use `varAppFont` in control Font properties instead of hardcoding `Font.'Open Sans'`. This lets you change the app-wide font with a single edit in OnStart.

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
    ▼ conExportModal                   ← Step 12G (Monthly Transaction Export)
        btnExportDownload
        lblExportNote
        lblExportPreview
        ddExportYear
        lblExportYearLabel
        ddExportMonth
        lblExportMonthLabel
        btnExportClose
        lblExportTitle
        recExportBox
        recExportOverlay
        recLoadingOverlay
    ▼ conViewMessagesModal            ← Step 17D (Unified Messages Modal Container)
        btnViewMsgClose
        btnViewMsgSend
        btnViewMsgCancel
        btnViewMsgMarkRead
        lblViewMsgCharCount
        txtViewMsgBody
        lblViewMsgBodyLabel
        txtViewMsgSubject
        lblViewMsgSubjectLabel
        ddViewMsgStaff
        lblViewMsgStaffLabel
        recViewMsgSeparator
        galViewMessages
        lblViewMsgSubtitle
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
        lblNotesTitle
        recNotesModal
        recNotesOverlay
    ▼ conStudentNoteModal             ← Step 13B (Student Note Modal Container)
        btnStudentNoteClose
        btnStudentNoteOk
        txtStudentNoteContent
        lblStudentNoteTitle
        recStudentNoteModal
        recStudentNoteOverlay
    ▼ conBatchPaymentModal            ← Step 12E (Batch Payment Modal Container)
        btnBatchPaymentConfirm
        btnBatchPaymentCancel
        galBatchItems
        lblBatchItemsHeader
        chkBatchOwnMaterial
        lblBatchCostValue
        lblBatchCostLabel
        txtBatchWeight
        lblBatchWeightLabel
        txtBatchTransaction
        lblBatchTransLabel
        ddBatchPaymentType
        lblBatchPaymentTypeLabel
        ddBatchStaff
        lblBatchStaffLabel
        lblBatchSummary
        lblBatchTitle
        recBatchPaymentModal
        recBatchPaymentOverlay
    ▼ conBuildPlatesModal             ← Step 12F (Build Plates Modal Container)
        btnBuildPlatesClose
        btnBuildPlatesDone
        btnBuildPlatesAdd
        lblAddPlateHeader
        recBuildPlatesDivider3
        galBuildPlates
        lblBuildPlatesProgressModal
        lblTotalSlicedLabel
        recBuildPlatesDivider2
        recBuildPlatesDivider1
        lblBuildPlatesTitle
        recBuildPlatesModal
        recBuildPlatesOverlay
    ▼ conPaymentModal                 ← Step 12C (Payment Modal Container)
        btnPaymentConfirm
        btnPaymentCancel
        btnAddMoreItems
        chkPartialPickup
        txtPaymentNotes
        lblPaymentNotesLabel
        txtPayerTigerCard
        lblPayerTigerCardLabel
        txtPayerName
        lblPayerNameLabel
        chkPayerSameAsStudent
        chkOwnMaterial
        lblPaymentCostValue
        lblPaymentCostLabel
        txtPaymentWeight
        lblPaymentWeightLabel
        dpPaymentDate
        lblPaymentDateLabel
        txtPaymentTransaction
        lblPaymentTransLabel
        ddPaymentType
        lblPaymentTypeLabel
        ddPaymentStaff
        lblPaymentStaffLabel
        lblPlatesHint
        galPlatesPickup
        lblPlatesPickupHeader
        recPlatesDivider
        lblRemainingEst
        lblPaidSoFar
        galPaymentHistory
        lblPaymentHistoryHeader
        recPaymentVerticalDivider
        lblPaymentStudent
        btnPaymentClose
        lblPaymentTitle
        recPaymentModal
        recPaymentOverlay
    ▼ conDetailsModal                 ← Step 12B (Details Modal Container)
        btnDetailsConfirm
        btnDetailsCancel
        lblDetailsCostValue
        chkDetailsOwnMaterial
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
    ▼ conRevertModal                  ← Step 12D (Revert Status Modal Container)
        btnRevertConfirm
        btnRevertCancel
        txtRevertReason
        lblRevertReasonLabel
        ddRevertTarget
        lblRevertTargetLabel
        lblRevertCurrentStatus
        ddRevertStaff
        lblRevertStaffLabel
        lblRevertTitle
        recRevertModal
        recRevertOverlay
    ▼ conCompleteModal                ← Step 12A (Complete Confirmation Modal Container)
        lblActualPrinters
        btnCompleteClose
        btnCompleteConfirm
        btnCompleteCancel
        ddCompleteStaff
        lblCompleteStaffLabel
        lblCompleteWarning
        lblCompleteTitle
        recCompleteModal
        recCompleteOverlay
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
    ▼ conApprovalModal                ← Step 11 (Approval Modal Container — `GroupContainer`)
        chkApprovalOwnMaterial
        btnApproveAddPlates
        lblApprovePlatesInfo
        ddSlicedOnComputer
        lblSlicedOnLabel
        btnApprovalConfirm
        btnApprovalCancel
        txtApprovalComments
        lblApprovalCommentsLabel
        lblApprovalCostValue
        lblApprovalCostLabel
        txtEstimatedTime
        lblApprovalTimeLabel
        txtEstimatedWeight
        lblApprovalWeightLabel
        ddApprovalStaff
        lblApprovalStaffLabel
        lblApprovalStudent
        btnApprovalClose
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
    tmrAutoRefresh                    ← Step 17F (Auto-refresh timer - invisible)
    audNotification                   ← Step 17F (Audio)
    btnClearFilters                   ← Step 14
    btnRefresh                        ← Step 14
    ddSortOrder                       ← Step 14
    chkNeedsAttention                 ← Step 14
    txtSearch                         ← Step 14
    recFilterBar                      ← Step 14 (filter bar background)
    ▼ conBatchSelectionFooter         ← Step 15 (Batch Selection Footer - floating above gallery)
        btnProcessBatchPayment
        btnBatchCancel
        lblBatchStudents
        lblBatchEstTotal
        lblBatchCount
        lblBatchModeActive
        recBatchFooterBg
    ▼ galJobCards                     ← Step 6 (template controls — order matches live YAML)
        recCardBackground             ← Step 7
        lblStudentName                ← Step 7
        lblSubmittedTime              ← Step 7
        lblFilename                   ← Step 7
        lblStudentEmail               ← Step 7
        lblPrinter                    ← Step 7
        cirColorDotBackdrop           ← Step 7
        cirColorDot                   ← Step 7
        lblColorText                  ← Step 7
        lblEstimates                  ← Step 7
        lblBuildPlatesProgress        ← Step 7
        btnBuildPlates                ← Step 12F
        btnViewNotes                  ← Step 13
        lblJobId                      ← Step 7
        lblcreated                    ← Step 7
        lblDetailsHeader              ← Step 8
        lblJobIdLabel                 ← Step 8
        lblCreatedLabel               ← Step 8
        lblDisciplineLabel            ← Step 8
        lblDiscipline                 ← Step 8
        lblProjectTypeLabel           ← Step 8
        lblProjectType                ← Step 8
        lblCourseLabel                ← Step 8
        lblCourse                     ← Step 8
        icoLightbulb                  ← Step 15
        icoBatchCheck                 ← Step 15
        btnApprove                    ← Step 9
        btnReject                     ← Step 9
        btnArchive                    ← Step 9
        btnStartPrint                 ← Step 9
        btnComplete                   ← Step 9
        btnPickedUp                   ← Step 9
        btnEditDetails                ← Step 12B
        btnFiles                      ← Step 16
        lblMessagesHeader             ← Step 17B
        btnViewMessages               ← Step 17C
        lblUnreadBadge                ← Step 17B
        lblTransactionLabel           ← Step 12C (job card payment summary)
        lblTransactionValue           ← Step 12C
        btnRevert                     ← Step 12D
        lblPaymentHistoryLabel        ← Step 12C
        lblPaymentHistoryValue        ← Step 12C
        btnStudentNote                ← Step 13B
        lblNotesHeader                ← Step 13
        lblSlicedOn                   ← Step 7 (slicer line on card)
    lblEmptyState                     ← Step 9
    ▼ galStatusTabs                   ← Step 5
        btnStatusTab                  ← Step 5
    btnNavAnalytics                   ← Step 4 (`Report` — opens Export modal)
    btnNavSchedule                    ← Step 4 (`Schedule` — `Navigate(scrSchedule)`)
    lblAppTitle                       ← Step 4
    recHeader                         ← Step 4
    audNotification                   ← Step 17F (Audio — `Start = varPlaySound`)
```

Collapsed version (containers closed) for quick reference:

```
▼ App
▼ scrDashboard
    ▸ conLoadingOverlay               ← Step 17E (Loading — TOP for highest z-order)
    ▸ conExportModal                  ← Step 12G (Monthly Transaction Export)
    ▸ conViewMessagesModal            ← Step 17D
    ▸ conFileModal                    ← Step 16
    ▸ conNotesModal                   ← Step 13
    ▸ conStudentNoteModal             ← Step 13B
    ▸ conBatchPaymentModal            ← Step 12E
    ▸ conBuildPlatesModal             ← Step 12F
    ▸ conPaymentModal                 ← Step 12C
    ▸ conDetailsModal                 ← Step 12B
    ▸ conRevertModal                  ← Step 12D
    ▸ conCompleteModal                ← Step 12A
    ▸ conArchiveModal                 ← Step 12
    ▸ conApprovalModal                ← Step 11
    ▸ conRejectModal                  ← Step 10
    tmrAutoRefresh                    ← Step 17F (Auto-refresh timer - invisible)
    audNotification                   ← Step 17F (Audio)
    btnClearFilters                   ← Step 14
    btnRefresh                        ← Step 14
    ddSortOrder                       ← Step 14
    chkNeedsAttention                 ← Step 14
    txtSearch                         ← Step 14
    recFilterBar                      ← Step 14 (filter bar background)
    ▸ conBatchSelectionFooter         ← Step 15 (Batch Selection Footer - floating above gallery)
    ▸ galJobCards                     ← Step 6
    lblEmptyState                     ← Step 9
    ▸ galStatusTabs                   ← Step 5
    btnNavAnalytics                   ← Step 4
    btnNavSchedule                    ← Step 4
    lblAppTitle                       ← Step 4
    recHeader                         ← Step 4
    audNotification                   ← Step 17F
```

> 💡 **Tree View Stacking Rule:** For overlapping controls on the same screen, items higher in Tree view appear in front of items below them. Use **Bring to front / Send to back** to adjust visual stacking.

> 💡 **Important:** Tree view order affects visual layering, but it does **not** control runtime tab/accessibility order. Logical control order is based on control position (`X`/`Y`) when the app is saved.

### Key Rules

| Rule | Explanation |
|------|-------------|
| **App = formulas only** | Only put formulas like `OnStart` here. Never visual elements. |
| **scrDashboard = all visuals** | All rectangles, labels, buttons, galleries go here. |
| **Modals use Containers** | Each modal is wrapped in a Container control — set Visible on container only! |
| **Higher in Tree view = in front** | If controls overlap visually, the one higher in Tree view sits on top. |
| **Galleries are special** | If you select a gallery and then Insert, the new control goes INSIDE that gallery's template. |
| **Containers are special** | If you select a container and then Insert, the new control goes INSIDE that container. |
| **Rename immediately** | After adding a control, rename it right away (click name in Tree view). |

> 💡 **How to rename:** In the Tree view, double-click the control name (or click once and press F2) to edit it.

> 💡 **How to know what's selected:** Look at the Tree view on the left. The highlighted item is what's currently selected. When you click **+ Insert**, the new control goes into whatever is selected.

---

# STEP 4: Building the Top Navigation Bar

**What you're doing:** Creating the header bar on `scrDashboard` with the app title and two actions: open the **Schedule** screen and open the **Report** (monthly export) modal.

**Live app controls (source: coauthor YAML):**
- `recHeader` — Header background (`Classic/Button` nav controls sit visually on top)
- `lblAppTitle` — Title `Print Lab Dashboard`
- `btnNavSchedule` — Navigates to `scrSchedule`
- `btnNavAnalytics` — Label **Report** in Studio; `OnSelect` = `Set(varShowExportModal, true)`

> **Removed in the live build:** `btnNavDashboard`, `btnNavAdmin`, and `lblUserName` are not present. `varCurrentPage` remains in `App.OnStart` for compatibility with older formulas but the header does not use multi-tab chrome.

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
| Height | `55` |
| Fill | `varColorHeader` |

> This creates a dark gray header bar. `varColorHeader` is set in **App.OnStart** to `RGBA(77, 77, 77, 1)` (see Color Palette).

### Adding the App Title (lblAppTitle)

6. Click **+ Insert** → **Text label**.
7. **Rename it:** `lblAppTitle`
8. Set these properties:

| Property | Value |
|----------|-------|
| Text | `Print Lab Dashboard` |
| X | `20` |
| Y | `11` |
| Width | `300` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `Color.White` |

### Adding `btnNavSchedule`

9. Insert a **Button** (`Classic/Button`), rename to **`btnNavSchedule`**.
10. Properties:

| Property | Value |
|----------|-------|
| Text | `"Schedule"` |
| X | `1206` |
| Y | `15` |
| Width | `64` |
| Height | `22` |
| Size | `8` |
| Font | `varAppFont` |
| Color | `Color.White` |
| Fill | `varColorPrimary` |
| BorderColor / BorderThickness | `Color.Transparent`, `0` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Radius corners | `varBtnBorderRadius` (all four) |
| OnSelect | `Navigate(scrSchedule, varScreenTransition)` |

### Adding `btnNavAnalytics` (label: **Report**)

11. Insert a **Button**, rename **`btnNavAnalytics`**.
12. Properties (match live):

| Property | Value |
|----------|-------|
| Text | `"Report"` |
| X | `1278` |
| Y | `15` |
| Width | `58` |
| Height | `22` |
| Size | `8` |
| Font | `varAppFont` |
| Color | `Color.White` |
| Fill | `varColorPrimary` |
| BorderColor / BorderThickness | `Color.Transparent`, `0` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Radius corners | `varBtnBorderRadius` (all four) |
| OnSelect | `Set(varShowExportModal, true)` |

> **Export modal:** See [Step 12G](#step-12g-building-the-export-modal). The header button does not use `Launch()`; it toggles `varShowExportModal`.

### ✅ Step 4 Checklist

After completing this step, your Tree view should look like:

```
▼ App
▼ scrDashboard
    recHeader
    lblAppTitle
    btnNavSchedule
    btnNavAnalytics
```

---

# STEP 5: Creating Status Tabs

**What you're doing:** Building a row of clickable tabs that show status counts and filter the gallery.

### Creating the Gallery (galStatusTabs)

1. Click **+ Insert** → **Horizontal gallery** (or search for "Blank horizontal gallery").
2. **Rename it:** `galStatusTabs`
3. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `55` |
| Width | `Parent.Width` |
| Height | `55` |
| BorderColor | `RGBA(0, 18, 107, 1)` |
| FocusedBorderThickness | `0` (live app; avoids a heavy focus ring on the tab strip) |
| TemplateSize | `varTabGalleryHeight` |
| TemplatePadding | `3` |
| Transition | `Transition.Push` |
| Items | _(see formula below)_ |

**⬇️ FORMULA: Paste into galStatusTabs Items**

```powerfx
Table(
    {Status: "Uploaded", Color: varColorPrimary},
    {Status: "Pending", Color: varColorPrimary},
    {Status: "Ready to Print", Color: varColorPrimary},
    {Status: "Printing", Color: varColorPrimary},
    {Status: "Completed", Color: varColorPrimary},
    {Status: "Paid & Picked Up", Color: varColorPrimary},
    {Status: "Rejected", Color: varColorPrimary},
    {Status: "Canceled", Color: varColorPrimary},
    {Status: "Archived", Color: varColorPrimary}
)
```

### Adding the Tab Button (btnStatusTab)

4. With `galStatusTabs` selected, click **+ Insert** → **Button**.
5. **Rename it:** `btnStatusTab`
6. Set properties:

| Property | Value |
|----------|-------|
| X | `5` |
| Y | `4` |
| Width | `141` |
| Size | `10` |
| Text | `ThisItem.Status & " " & Text(CountRows(Filter(PrintRequests, Status.Value = ThisItem.Status, If(IsBlank(varSearchText), true, varSearchText in Student.DisplayName || varSearchText in StudentEmail || varSearchText in ReqKey), If(varNeedsAttention, NeedsAttention = true, true))))` |
| Fill | `If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1))` |
| Color | `If(varSelectedStatus = ThisItem.Status, Color.White, varColorText)` |
| OnSelect | `Set(varSelectedStatus, ThisItem.Status)` |
| HoverFill | `ColorFade(If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1)), -10%)` |
| PressedFill | `ColorFade(If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1)), -20%)` |
| HoverColor | `If(varSelectedStatus = ThisItem.Status, Color.White, varColorText)` |
| PressedColor | `If(varSelectedStatus = ThisItem.Status, Color.White, varColorText)` |
| BorderColor | `If(varSelectedStatus = ThisItem.Status, Color.Transparent, varInputBorderColor)` |
| BorderThickness | `1` |
| DisabledBorderColor | `RGBA(166, 166, 166, 1)` |
| FocusedBorderColor | `Color.Transparent` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `If(varSelectedStatus = ThisItem.Status, Color.Transparent, ColorFade(Self.BorderColor, 20%))` |
| PressedBorderColor | `Self.Fill` |

> 💡 **Why these sizes?** 9 tabs at `Width = 141` with `TemplatePadding = 3` recreate the original compact tab strip while still fitting common tablet widths. Font size `10` keeps "Paid & Picked Up" readable without the rounded pill treatment.
>
> ⚠️ **Note:** We use `Status.Value` because Status is a **Choice field** in SharePoint. Choice fields store objects, not plain text, so `.Value` extracts the text.
>
> 💡 **Filtered count behavior:** Each tab count intentionally uses the same search text and Needs Attention filters as the main gallery. In this low-volume app, that keeps the badges aligned with the visible result set across all statuses, including Archived.

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

### Creating the Gallery (galJobCards)

1. Click on **scrDashboard** in the Tree view (not inside the status tabs gallery).
2. Click **+ Insert** → **Blank vertical gallery**.
3. **Rename it:** `galJobCards`
4. Set properties.
5. **Replace the `Visible` property** with the exact formula below so the Approval modal is hidden whenever the Build Plates modal is open:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `160` |
| Width | `Parent.Width` |
| Height | `Parent.Height - 160` |
| WrapCount | `4` |
| TemplatePadding | `8` |
| TemplateSize | `varCardGalleryHeight` |
| Items | _(see formula below)_ |

> 💡 **WrapCount = 4** creates a grid layout with 4 cards per row. Each card will be approximately 330px wide.
> 
> ⚠️ **Note:** Y=160 leaves room for the Filter Bar (built in Step 14) between the status tabs and job cards.

**⬇️ FORMULA: Paste into galJobCards Items**

```powerfx
With(
    {
        filteredJobs: Filter(
            PrintRequests,
            Status.Value = varSelectedStatus,
            If(
                IsBlank(varSearchText), 
                true, 
                varSearchText in Student.DisplayName || varSearchText in StudentEmail || varSearchText in ReqKey || varSearchText in SlicedOnComputer.Value
            ),
            If(varNeedsAttention, NeedsAttention = true, true)
        )
    },
    Switch(
        varSortOrder,
        "Student Name A-Z",
        Sort(filteredJobs, Student.DisplayName, SortOrder.Ascending),
        "Student Name Z-A",
        Sort(filteredJobs, Student.DisplayName, SortOrder.Descending),
        "Oldest First",
        SortByColumns(filteredJobs, "Created", SortOrder.Ascending),
        "Newest First",
        SortByColumns(filteredJobs, "Created", SortOrder.Descending),
        "Color A-Z",
        Sort(filteredJobs, Color.Value, SortOrder.Ascending),
        "Computer A-Z",
        Sort(filteredJobs, SlicedOnComputer.Value, SortOrder.Ascending),
        "Printer A-Z",
        Sort(filteredJobs, Printer.Value, SortOrder.Ascending),
        SortByColumns(
            filteredJobs,
            "NeedsAttention", SortOrder.Descending,
            "Created", SortOrder.Ascending
        )
    )
)
```

> ⚠️ **Note:** Use `Status.Value` because Status is a Choice field in SharePoint. `Queue Order` preserves the operational default: attention items first, then oldest requests (longest in queue).
>
> 💡 **Sort modes:** Staff can switch the gallery between `Queue Order`, `Student Name A-Z`, `Student Name Z-A`, `Oldest First`, `Newest First`, `Color A-Z`, `Computer A-Z`, and `Printer A-Z` from the filter bar.
>
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
| Height | `Parent.TemplateHeight` |
| Fill | `If(varBatchSelectMode && ThisItem.ID in colBatchItems.ID, RGBA(220, 240, 220, 1), If(ThisItem.NeedsAttention, RGBA(255, 235, 180, 1), varColorBgCard))` |
| BorderColor | `If(varBatchSelectMode && ThisItem.ID in colBatchItems.ID, varColorSuccess, If(ThisItem.NeedsAttention, RGBA(102, 102, 102, 1), varColorBorderLight))` |
| BorderThickness | `If(ThisItem.NeedsAttention, 2, 1.5)` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

4. Set **OnSelect** exactly as follows:

```powerfx
If(
    varBatchSelectMode && ThisItem.Status.Value = "Completed",
    // Batch mode: toggle item in collection (Filament and Resin cannot mix—same Method.Value only)
    If(
        ThisItem.ID in colBatchItems.ID,
        Remove(colBatchItems, LookUp(colBatchItems, ID = ThisItem.ID)),
        If(
            CountRows(colBatchItems) = 0,
            Collect(colBatchItems, ThisItem),
            If(
                ThisItem.Method.Value = First(colBatchItems).Method.Value,
                Collect(colBatchItems, ThisItem),
                Notify(
                    "Cannot mix Filament and Resin in one batch. Remove a job or finish checkout, then batch jobs that use the same print method only.",
                    NotificationType.Warning
                )
            )
        )
    ),
    // Normal mode: select item for details (no action needed here - buttons handle modals)
    Set(varSelectedItem, ThisItem)
)
```

> 💡 **Attention Styling:** Cards needing attention get a warm yellow background `RGBA(255, 235, 180, 1)` with a gray border `RGBA(102, 102, 102, 1)` and thicker border (2px vs 1.5px). In batch select mode, selected cards show a light green background with green border.

> **Note:** These formulas reference `varBatchSelectMode`, `colBatchItems`, and `NeedsAttention` which are used in later steps (batch payment in Step 12C/12E, lightbulb in Step 15). The variables are initialized in App.OnStart (Step 3).

### Student Name (lblStudentName)

4. Click **+ Insert** → **Text label**.
5. **Rename it:** `lblStudentName`
6. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Student.DisplayName` |
| X | `12` |
| Y | `14` |
| Width | `Parent.TemplateWidth - 50` |
| Height | `24` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Color | `varColorText` |

### Submission Time (lblSubmittedTime)

7. Click **+ Insert** → **Text label**.
8. **Rename it:** `lblSubmittedTime`
9. Set properties:

| Property | Value |
|----------|-------|
| X | `200` |
| Y | `8` |
| Width | `99` |
| Height | `44` |
| Align | `Align.Right` |
| Size | `8` |
| Color | `varColorDanger` |

10. Set **Text:**

**⬇️ FORMULA: Shows relative time since submission (with "Just now" for recent items)**

```powerfx
With(
    {varMinutes: DateDiff(ThisItem.Created, Now(), TimeUnit.Minutes)},
    If(
        varMinutes < 1,
        "Just now",
        If(
            varMinutes >= 1440,
            Text(RoundDown(varMinutes / 1440, 0)) & "d " &
            If(
                Mod(RoundDown(varMinutes / 60, 0), 24) > 0,
                Text(Mod(RoundDown(varMinutes / 60, 0), 24)) & "h",
                ""
            ),
            If(
                varMinutes >= 60,
                Text(RoundDown(varMinutes / 60, 0)) & "h ",
                ""
            ) &
            Text(Mod(varMinutes, 60)) & "m"
        )
    )
)
```

> 💡 **Time Display:**
> - Calculates elapsed time from total minutes (avoids `DateDiff` calendar day bug)
> - Days = `RoundDown(minutes / 1440, 0)` (1440 min = 24 hours)
> - "Just now" for items less than 1 minute old
> - "Xh Xm" for items less than 24 hours old
> - "Xd Xh" for items 24+ hours old (minutes hidden for clarity)
> - Red color indicates urgency

### File Name (lblFilename)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblFilename`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `Lower(First(Split(ThisItem.Student.DisplayName, " ")).Value & Last(Split(ThisItem.Student.DisplayName, " ")).Value) & "_" & Lower(ThisItem.Method.Value) & "_" & Lower(ThisItem.Color.Value)` |
| X | `12` |
| Y | `32` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `20` |
| Size | `11` |
| Color | `varColorTextMuted` |

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
| Color | `varColorTextMuted` |

### Printer Label (lblPrinter)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblPrinter`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"🖨 " & If(CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID)) > 0, Concat(Distinct(Filter(colAllBuildPlates, RequestID = ThisItem.ID), Machine.Value), Trim(If(Find("(", ThisRecord.Value) > 0, Left(ThisRecord.Value, Find("(", ThisRecord.Value) - 2), ThisRecord.Value)), ", "), Trim(If(Find("(", ThisItem.Printer.Value) > 0, Left(ThisItem.Printer.Value, Find("(", ThisItem.Printer.Value) - 1), ThisItem.Printer.Value)))` |
| X | `Parent.TemplateWidth / 2` |
| Y | `55` |
| Width | `Parent.TemplateWidth / 2 - 16` |
| Height | `20` |
| Size | `10` |
| Color | `varColorTextMuted` |

> 💡 **Why this formula?** If build plates exist for this job, shows the actual printers being used (from `colAllBuildPlates`). Otherwise, falls back to the student's requested printer. Dimensions (e.g., "(14.2×14.2×14.2in)") are stripped for cleaner display.
>
> When `Distinct(...)` is used in these printer-summary formulas, reference the single-column output as `Value`.

### Student Note Button (btnStudentNote)

> 💡 **Purpose:** This button only appears when a student submitted a note with their print request. It draws attention so staff don't miss important student instructions.

18. Click **+ Insert** → **Button**.
19. **Rename it:** `btnStudentNote`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student Notes"` |
| X | `Parent.TemplateWidth - 75` |
| Y | `55` |
| Width | `60` |
| Height | `20` |
| Fill | `RGBA(255, 46, 46, 1)` |
| Color | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(220, 40, 40, 1)` |
| PressedFill | `RGBA(200, 35, 35, 1)` |
| BorderColor | `RGBA(184, 0, 0, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Size | `9` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| **Visible** | `!IsBlank(ThisItem.Notes)` |

21. Set **OnSelect:**

```powerfx
Set(varShowStudentNoteModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Styling Note:** The gold/amber color matches the attention system and stands out against the card background. The button only appears when the student included a note, so staff immediately know there's something to review.

---

### Color Indicator (Accessible Swatch + Label)

20. Click **+ Insert** → **Icons** → **Circle**.
21. **Rename it:** `cirColorDotBackdrop`
22. Set properties:

| Property | Value |
|----------|-------|
| X | `12` |
| Y | `79` |
| Width | `12` |
| Height | `12` |
| Fill | `varcolormuted` |
| Visible | `ThisItem.Color.Value = "White" || ThisItem.Color.Value = "Matte White" || ThisItem.Color.Value = "Clear" || ThisItem.Color.Value = "Light Gray" || ThisItem.Color.Value = "Matte Light Gray" || ThisItem.Color.Value = "Silver" || ThisItem.Color.Value = "Any" || ThisItem.Color.Value = "Yellow" || ThisItem.Color.Value = "Matte Yellow" || ThisItem.Color.Value = "Gold"` |
| AccessibleLabel | `""` |

23. Click **+ Insert** → **Icons** → **Circle** again.
24. **Rename it:** `cirColorDot`
25. Set properties:

| Property | Value |
|----------|-------|
| X | `14` |
| Y | `81` |
| Width | `8` |
| Height | `8` |
| Fill | See formula below |
| AccessibleLabel | `""` |

26. Set **Fill** formula for `cirColorDot` (matches the actual filament color):

**⬇️ FORMULA: Maps color names to display colors**

```powerfx
Switch(
    ThisItem.Color.Value,
    "Black", RGBA(26, 26, 26, 1),
    "Matte Black", RGBA(26, 26, 26, 1),
    "White", RGBA(255, 255, 255, 1),
    "Matte White", RGBA(255, 255, 255, 1),
    "Gray", RGBA(128, 128, 128, 1),
    "Light Gray", RGBA(211, 211, 211, 1),
    "Matte Light Gray", RGBA(211, 211, 211, 1),
    "Red", RGBA(204, 0, 0, 1),
    "Matte Red", RGBA(204, 0, 0, 1),
    "Orange", RGBA(255, 102, 0, 1),
    "Matte Orange", RGBA(255, 102, 0, 1),
    "Yellow", RGBA(255, 215, 0, 1),
    "Matte Yellow", RGBA(255, 215, 0, 1),
    "Gold", RGBA(255, 215, 0, 1),
    "Green", RGBA(76, 175, 80, 1),
    "Matte Green", RGBA(76, 175, 80, 1),
    "Forest Green", RGBA(34, 139, 34, 1),
    "Blue", RGBA(0, 71, 171, 1),
    "Matte Blue", RGBA(0, 71, 171, 1),
    "Cobalt Blue", RGBA(0, 102, 204, 1),
    "Purple", RGBA(107, 63, 160, 1),
    "Matte Purple", RGBA(107, 63, 160, 1),
    "Brown", RGBA(93, 64, 55, 1),
    "Light Brown", RGBA(196, 164, 132, 1),
    "Chocolate Brown", RGBA(123, 63, 0, 1),
    "Matte Chocolate", RGBA(123, 63, 0, 1),
    "Copper", RGBA(184, 115, 51, 1),
    "Bronze", RGBA(205, 127, 50, 1),
    "Silver", RGBA(192, 192, 192, 1),
    "Clear", RGBA(245, 245, 245, 1),
    "Any", RGBA(224, 224, 224, 1),
    RGBA(153, 153, 153, 1)
)
```

27. Click **+ Insert** → **Text label** again.
28. **Rename it:** `lblColorText`
29. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Color.Value` |
| X | `28` |
| Y | `75` |
| Width | `134` |
| Height | `20` |
| Size | `10` |
| Color | `varColorText` |

> 💡 **Accessibility Update:** Context7 guidance for Power Apps points back to Microsoft’s canvas app accessibility docs: maintain at least `4.5:1` contrast between text and its effective background, and do not rely on color alone to communicate meaning. Using actual circle controls instead of stacked `⬤` labels gives both dots a true shared centerpoint, keeps the readable label in `lblColorText` high contrast on the warm cream card background, and avoids font-glyph alignment issues.

> 💡 **Note:** Uses `ThisItem.Color.Value` because Color is a Choice field in SharePoint. Colors still match the SharePoint column formatting in `FilamentColor-Column-Formatting.json`; only the presentation changed for readability and alignment. The backdrop circle is decorative, so its `AccessibleLabel` is intentionally blank. The `Visible` formula now covers the palest and lowest-contrast swatches on the warm cream card background: `White`, `Matte White`, `Clear`, `Light Gray`, `Matte Light Gray`, `Silver`, `Any`, `Yellow`, `Matte Yellow`, and `Gold`.

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
| Color | `varColorTextMuted` |

27. Set **Text:**

```powerfx
If(
    ThisItem.Status.Value = "Paid & Picked Up" && !IsBlank(ThisItem.FinalCost),
    // After payment: show final weight and cost only
    "⚖ " & Text(ThisItem.FinalWeight) & "g" &
    " · 💲" & Text(ThisItem.FinalCost, "[$-en-US]#,##0.00"),
    // Before payment: show estimates
    If(
        !IsBlank(ThisItem.EstimatedWeight),
        "⚖ " & Text(ThisItem.EstimatedWeight) &
        If(ThisItem.Method.Value = "Resin", "mL", "g") &
        If(!IsBlank(ThisItem.EstimatedTime), " · ⏱ ~" & Text(ThisItem.EstimatedTime) & "h", "") &
        If(!IsBlank(ThisItem.EstimatedCost), " · 💲" & Text(ThisItem.EstimatedCost, "[$-en-US]#,##0.00"), ""),
        ""
    )
)
```

28. Set **Visible:** `!IsBlank(ThisItem.EstimatedWeight) || !IsBlank(ThisItem.FinalWeight)`

> 💡 **When it shows:** Before payment, displays estimated weight, time, and cost. After payment (status = "Paid & Picked Up"), displays final weight and cost instead.

---

### Slicing Computer Display (lblSlicedOn)

29. Click **+ Insert** → **Text label**.
30. **Rename it:** `lblSlicedOn`
31. Set properties:

| Property | Value |
|----------|-------|
| Text | `"💻 " & ThisItem.SlicedOnComputer.Value` |
| X | `12` |
| Y | `115` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `20` |
| Size | `10` |
| Color | `varColorTextMuted` |
| **Visible** | `!IsBlank(ThisItem.SlicedOnComputer)` |

> 💡 **When it shows:** Only appears after approval when the slicing computer field is populated. Displays which workstation was used to slice the model.

---

### View Notes Button (btnViewNotes)

32. Click **+ Insert** → **Button**.
33. **Rename it:** `btnViewNotes`
26. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Staff Notes"` |
| X | `242` |
| Y | `73` |
| Width | `75` |
| Height | `25` |
| Fill | `If("[NOTE]" in ThisItem.StaffNotes, RGBA(255, 46, 46, 1), Color.White)` |
| Color | `If("[NOTE]" in ThisItem.StaffNotes, RGBA(255, 255, 255, 1), varColorPrimary)` |
| HoverFill | `If("[NOTE]" in ThisItem.StaffNotes, RGBA(220, 40, 40, 1), varColorPrimary)` |
| HoverColor | `Color.White` |
| PressedFill | `If("[NOTE]" in ThisItem.StaffNotes, RGBA(200, 35, 35, 1), ColorFade(varColorPrimary, -15%))` |
| BorderColor | `If("[NOTE]" in ThisItem.StaffNotes, RGBA(184, 0, 0, 1), varColorPrimary)` |
| BorderThickness | `2` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `9` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

> Note: This is a small secondary button so uses Size: 9 instead of varBtnFontSize.

34. Set **OnSelect:**

```powerfx
Set(varShowNotesModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

---

### Build Plates Row (conBuildPlatesRow)

This row displays build plate progress, printers in use, and a button to open the Build Plates Modal. It appears only when plates exist for the job.
Because approved jobs default to at least one build plate, single-plate jobs should still show this row as `0/1 done` and later `1/1 done` when complete. Do not hide the row just because there is only one plate.

**Job Card Layout with Build Plates:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Logan A Bereziuk                              1d 11h    💡 ▶   │
│  ✉ logan.bereziuk@lsu.edu                                       │
│  loganbereziuk_filament_black                                   │
│                                                                 │
│  ● Black                              🖨 Prusa MK4S             │
│  ⚖ 176.15g · ⏱ ~6h · 💲 17.61                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🖨 3/5 done · R 0/1 · Using: MK4S, XL [Build Plates]    │ ◄── BUILD PLATES ROW
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Details                                                        │
│  [expandable details section...]                                │
└─────────────────────────────────────────────────────────────────┘
```

**34a.** Click **+ Insert** → **Layout** → **Container**.
**34b.** **Rename it:** `conBuildPlatesRow`
**34c.** Set properties:

| Property | Value |
|----------|-------|
| X | `12` |
| Y | `125` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `36` |
| Fill | `RGBA(245, 247, 250, 1)` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| **Visible** | `CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID)) > 0` |

> 💡 **Visibility:** Row only appears when plates exist for this job. Uses `colAllBuildPlates` (pre-loaded at startup) to avoid per-card delegation.

#### Progress Label (lblBuildPlatesProgress)

**34d.** With `conBuildPlatesRow` selected, click **+ Insert** → **Text label**.
**34e.** **Rename it:** `lblBuildPlatesProgress`
**34f.** Set properties:

| Property | Value |
|----------|-------|
| Text | `With({wSummary: LookUp(colBuildPlateSummary, RequestID = ThisItem.ID)}, If(Coalesce(ThisItem.BuildPlateLabelsLocked, false) && Coalesce(ThisItem.BuildPlateOriginalTotal, 0) > 0, "🖨 " & Text(Coalesce(wSummary.CompletedCount, 0)) & "/" & Text(ThisItem.BuildPlateOriginalTotal) & " done" & If(Coalesce(wSummary.ReprintTotal, 0) > 0, " · R " & Text(Coalesce(wSummary.ReprintCompleted, 0)) & "/" & Text(Coalesce(wSummary.ReprintTotal, 0)), ""), "🖨 " & Text(Coalesce(wSummary.CompletedCount, 0) + Coalesce(wSummary.ReprintCompleted, 0)) & "/" & Text(Coalesce(wSummary.TotalCount, 0) + Coalesce(wSummary.ReprintTotal, 0)) & " done"))` |
| X | `8` |
| Y | `0` |
| Width | `100` |
| Height | `Parent.Height` |
| Size | `10` |
| Font | `varAppFont` |
| Color | `varColorTextMuted` |
| VerticalAlign | `VerticalAlign.Middle` |

> 💡 **Formula:** Uses a single `LookUp` into `colBuildPlateSummary` (pre-aggregated at each data refresh) instead of scanning `colAllBuildPlates` inline per card. Before labels lock, shows completed plates against the live total, such as `🖨 3/5 done`. After labels lock, it preserves the original denominator and shows reprints separately, such as `🖨 3/5 done · R 0/1`.
>
> For single-plate jobs, this should read `🖨 0/1 done` while queued/printing and `🖨 1/1 done` once the plate is completed or picked up. This is preferred over hiding the summary for one-plate jobs.

#### Build Plates Button (btnBuildPlates)

**34g.** Click **+ Insert** → **Button**.
**34h.** **Rename it:** `btnBuildPlates`
**34i.** Set properties:

| Property | Value |
|----------|-------|
| Text | `"Build Plates"` |
| X | `Parent.Width - 110` |
| Y | `5` |
| Width | `100` |
| Height | `25` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| HoverColor | `Color.White` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `9` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

> Note: This is a small in-card button, so uses Height: 25 and Size: 9 to match other card buttons like btnViewNotes.

**34m.** Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varBuildPlatesOpenedFromApproval, false);
// Load sorted plates for this request
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = ThisItem.ID), ID, SortOrder.Ascending)
);
// Add sequential PlateNum plus resolved staff-facing labels
ClearCollect(colBuildPlatesIndexed,
    AddColumns(
        colBuildPlates As plate,
        PlateNum,
        CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
        ResolvedPlateLabel,
        With(
            {
                wDynamicNum: CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
                wStoredLabel: Trim(Coalesce(plate.DisplayLabel, ""))
            },
            If(
                !IsBlank(wStoredLabel),
                wStoredLabel,
                Text(wDynamicNum) & "/" & Text(CountRows(colBuildPlates))
            )
        )
    )
);
// Collect distinct printers used
ClearCollect(colPrintersUsed,
    Distinct(Filter(BuildPlates, RequestID = ThisItem.ID), Machine.Value)
);
Set(varShowBuildPlatesModal, ThisItem.ID)
```

> 💡 **OnSelect:** Loads plate data into working collections, then opens the Build Plates Modal (Step 12F).
>
> Use the aliased `AddColumns(...)` pattern exactly as shown. In current Power Apps, the older `AddColumns(colBuildPlates, "PlateNum", CountRows(Filter(colBuildPlates, ID <= ThisRecord.ID)))` form can still trigger `Expected identifier name` and `AddColumns has some invalid arguments`.

---

### Additional Details Section (Expandable)

35. Click **+ Insert** → **Text label**.
36. **Rename it:** `lblDetailsHeader`
37. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Details"` |
| X | `12` |
| Y | `165` |
| Width | `150` |
| Height | `20` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `varColorText` |
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
| Color | `varColorText` |
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
| Text | `Text(ThisItem.Created, varDateTimeShort)` |
| X | `Parent.TemplateWidth / 2 + 55` |
| Y | `185` |
| Width | `150` |
| Height | `20` |
| Size | `10` |
| Color | `varColorText` |
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
| Color | `varColorText` |
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
| Color | `varColorText` |
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
| Color | `varColorText` |
| Visible | `true` |

#### Transaction Row (Y = 245) - Paid & Picked Up Only

> 💡 **Conditional Display:** These labels appear on ANY status tab when a transaction number exists. This ensures staff can always see payment info even if a job is reverted back in the workflow (e.g., partial payment collected, then job sent back to "Printing").

63. Click **+ Insert** → **Text label**.
64. **Rename it:** `lblTransactionLabel`
65. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Transaction #:"` |
| X | `12` |
| Y | `245` |
| Width | `80` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(120, 120, 120, 1)` |
| Visible | `!IsBlank(ThisItem.TransactionNumber)` |

66. Click **+ Insert** → **Text label**.
67. **Rename it:** `lblTransactionValue`
68. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.TransactionNumber` |
| X | `95` |
| Y | `245` |
| Width | `200` |
| Height | `20` |
| Size | `10` |
| Color | `varColorText` |
| Visible | `!IsBlank(ThisItem.TransactionNumber)` |

#### Payment History Row (Y = 265) - Completed Items with Prior Payments

> 💡 **Conditional Display:** This label appears on ANY status tab when payment history exists for the request. It should use any existing on-record payment text first, then fall back to the newer `Payments` rows when that older text is blank.

69. Click **+ Insert** → **Text label**.
70. **Rename it:** `lblPaymentHistoryLabel`
71. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Prior Payments:"` |
| X | `12` |
| Y | `265` |
| Width | `85` |
| Height | `20` |
| Size | `10` |
| Color | `RGBA(120, 120, 120, 1)` |
| Visible | `CountRows(Filter(colAllPayments, RequestID = ThisItem.ID Or Text(ThisItem.ID) in Split(Coalesce(BatchRequestIDs, ""), ", ").Value)) > 0 Or (CountRows(Filter(colAllPayments, RequestID = ThisItem.ID Or Text(ThisItem.ID) in Split(Coalesce(BatchRequestIDs, ""), ", ").Value)) = 0 And !IsBlank(ThisItem.PaymentDate) And Coalesce(ThisItem.FinalCost, 0) > 0)` |

72. Click **+ Insert** → **Text label**.
73. **Rename it:** `lblPaymentHistoryValue`
74. Set properties:

| Property | Value |
|----------|-------|
| Text | See formula below |
| X | `100` |
| Y | `265` |
| Width | `200` |
| Height | `20` |
| Size | `10` |
| Color | `varColorText` |
| Visible | `CountRows(Filter(colAllPayments, RequestID = ThisItem.ID Or Text(ThisItem.ID) in Split(Coalesce(BatchRequestIDs, ""), ", ").Value)) > 0 Or (CountRows(Filter(colAllPayments, RequestID = ThisItem.ID Or Text(ThisItem.ID) in Split(Coalesce(BatchRequestIDs, ""), ", ").Value)) = 0 And !IsBlank(ThisItem.PaymentDate) And Coalesce(ThisItem.FinalCost, 0) > 0)` |

Set **Text** (use existing on-record text first, then fall back to `Payments`):

```powerfx
With(
    {
        wLegacyNotes: Trim(Coalesce(ThisItem.PaymentNotes, "")),
        wPaymentRows: Filter(colAllPayments, RequestID = ThisItem.ID Or Text(ThisItem.ID) in Split(Coalesce(BatchRequestIDs, ""), ", ").Value)
    },
    If(
        !IsBlank(wLegacyNotes),
        With(
            {payments: Split(wLegacyNotes, " | ")},
            Text(CountRows(payments)) & " payment" & If(CountRows(payments) > 1, "s", "") & " recorded"
        ),
        If(
            CountRows(wPaymentRows) > 0,
            Text(CountRows(wPaymentRows)) & " payment" & If(CountRows(wPaymentRows) > 1, "s", "") & " recorded",
            "Payment recorded"
        )
    )
)
```

> 💡 **Why this matters:** This keeps older records reading the way staff already expect when payment text is already on the request, while still letting newer list-backed payment records drive the card when that older text is missing.

---

### ✅ Step 7 Checklist

Your gallery template should now contain these controls (Z-order: top = front):

```
▼ galJobCards
    lblPaymentHistoryValue         ← Any status with payment history
    lblPaymentHistoryLabel         ← Any status with payment history
    lblTransactionValue            ← Any status with TransactionNumber
    lblTransactionLabel            ← Any status with TransactionNumber
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
- Transaction number (for Paid & Picked Up jobs only)
- Prior payment count (for Completed jobs with partial payments)


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
| Y | `Parent.TemplateHeight - varBtnHeight - 12` |
| Width | `(Parent.TemplateWidth - 40) / 3` |
| Height | `varBtnHeight` |
| Fill | `varColorSuccess` |
| Color | `White` |
| HoverFill | `varColorSuccessHover` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `ThisItem.Status.Value = "Uploaded"` |

4. Set **OnSelect** exactly as follows:

```powerfx
Set(varShowApprovalModal, ThisItem.ID);
Set(varBuildPlatesOpenedFromApproval, false);
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
| Y | `Parent.TemplateHeight - varBtnHeight - 12` |
| Width | `(Parent.TemplateWidth - 40) / 3` |
| Height | `varBtnHeight` |
| Fill | `varColorDanger` |
| Color | `White` |
| HoverFill | `varColorDangerHover` |
| PressedFill | `ColorFade(varColorDanger, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
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
| X | `12 + ((Parent.TemplateWidth - 40) / 3 + 8) * 2` |
| Y | `360` |
| Width | `(Parent.TemplateWidth - 40) / 3` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
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
| Y | `Parent.TemplateHeight - varBtnHeight - 12` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `ThisItem.Status.Value = "Ready to Print"` |

16. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Starting print...");

// Store reference to current item before async operations
Set(varCurrentItem, ThisItem);

Patch(PrintRequests, varCurrentItem, {
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
    },
    StaffNotes: Concatenate(
        If(IsBlank(varCurrentItem.StaffNotes), "", varCurrentItem.StaffNotes & " | "),
        "STATUS: [Summary] Ready to Print -> Printing [Changes] [Reason] [Context] [Comment] - " &
        Text(Now(), "m/d h:mmam/pm")
    )
});

'Flow-(C)-Action-LogAction'.Run(
    Text(varCurrentItem.ID),      // RequestID
    "Status Change",              // Action
    "Status",                     // FieldName
    "Printing",                   // NewValue
    varMeEmail                    // ActorEmail
);

Notify("Print started!", NotificationType.Success);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Flow C Parameters:** Pass 5 parameters: RequestID, Action, FieldName, NewValue, ActorEmail. The flow auto-populates ClientApp ("Power Apps") and Notes.

> 💡 **Loading Overlay:** The loading state prevents double-clicks during the Patch and Flow operations, ensuring data consistency.

### Complete Printing Button (btnComplete)

17. Click **+ Insert** → **Button**.
18. **Rename it:** `btnComplete`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Print Complete"` |
| X | `12` |
| Y | `Parent.TemplateHeight - varBtnHeight - 12` |
| Width | `(Parent.TemplateWidth - 28) / 2` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `ThisItem.Status.Value = "Printing"` |

20. Set **DisplayMode:**

```powerfx
// Completion Gate: All plates must be Completed or Picked Up
If(
    // Check if job has plates
    CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID)) > 0,
    // If plates exist, all must be Completed or Picked Up
    If(
        CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Not(Status.Value in ["Completed", "Picked Up"]))) > 0,
        DisplayMode.Disabled,
        DisplayMode.Edit
    ),
    // If no plates, allow completion (legacy behavior)
    DisplayMode.Edit
)
```

> 💡 **Completion Gate:** The button is disabled until all build plates are marked as "Completed" or "Picked Up". This prevents marking a job complete while prints are still running. Jobs without plates (legacy) can be completed normally.

21. Set **OnSelect:**

```powerfx
// Collect distinct printers from plates for this job
ClearCollect(colActualPrinters,
    Distinct(Filter(BuildPlates, RequestID = ThisItem.ID), Machine.Value)
);
Set(varShowCompleteModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Safety Check:** This collects the actual printers used (from build plates), then opens the Complete Confirmation Modal (built in Step 12A). The modal displays the printers in a read-only label and saves them to the `ActualPrinter` field upon confirmation.

### Completion Gate Hint (lblCompletePlatesHint)

This label appears when the Print Complete button is disabled due to incomplete plates, helping staff understand why they can't mark the job complete yet.

22. Click **+ Insert** → **Text label**.
23. **Rename it:** `lblCompletePlatesHint`
24. Set properties:

| Property | Value |
|----------|-------|
| X | `12` |
| Y | `Parent.TemplateHeight - varBtnHeight - 30` |
| Width | `(Parent.TemplateWidth - 28) / 2` |
| Height | `16` |
| Font | `varAppFont` |
| Size | `9` |
| Color | `varColorWarning` |
| Align | `Align.Center` |

25. Set **Text:**

```powerfx
Text(CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Not(Status.Value in ["Completed", "Picked Up"])))) & " plate(s) still printing"
```

26. Set **Visible:**

```powerfx
ThisItem.Status.Value = "Printing" && 
CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID)) > 0 &&
CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Not(Status.Value in ["Completed", "Picked Up"]))) > 0
```

> 💡 **Completion Gate Hint:** This warning message appears above the disabled "Print Complete" button when plates are still in "Queued" or "Printing" status. It tells staff exactly how many plates need to finish before the job can be marked complete.

### Picked Up Button (btnPickedUp)

27. Click **+ Insert** → **Button**.
28. **Rename it:** `btnPickedUp`
23. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(ThisItem.Status.Value = "Printing", "Partial Payment", "Picked Up")` |
| X | `12 + (Parent.TemplateWidth - 28) / 2 + 4` |
| Y | `Parent.TemplateHeight - varBtnHeight - 12` |
| Width | `(Parent.TemplateWidth - 28) / 2` |
| Height | `varBtnHeight` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `varColorSuccessHover` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `ThisItem.Status.Value in ["Printing", "Completed"] && !varBatchSelectMode` |

> ⚠️ **Batch Mode:** Button is hidden when `varBatchSelectMode = true` to allow clicking the card for batch selection.

29. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
ClearCollect(
    colPayments,
    SortByColumns(
        AddColumns(
            Filter(
                Payments,
                RequestID = ThisItem.ID Or Text(ThisItem.ID) in Split(Coalesce(BatchRequestIDs, ""), ", ").Value
            ),
            PaymentSortAt,
            Coalesce(RecordedAt, PaymentDate),
            DisplayWeight,
            If(
                !IsBlank(RequestID),
                Weight,
                With(
                    {
                        wBatchEntry: First(
                            Filter(
                                Split(Coalesce(BatchAllocationSummary, ""), " | "),
                                StartsWith(Value, ThisItem.ReqKey & ": ")
                            )
                        ).Value
                    },
                    If(
                        IsBlank(wBatchEntry),
                        Blank(),
                        Value(First(Split(Last(Split(wBatchEntry, " for ")).Value, "g")).Value)
                    )
                )
            ),
            DisplayAmount,
            If(
                !IsBlank(RequestID),
                Amount,
                With(
                    {
                        wBatchEntry: First(
                            Filter(
                                Split(Coalesce(BatchAllocationSummary, ""), " | "),
                                StartsWith(Value, ThisItem.ReqKey & ": ")
                            )
                        ).Value
                    },
                    If(
                        IsBlank(wBatchEntry),
                        Blank(),
                        Value(
                            Substitute(
                                Trim(First(Split(Last(Split(wBatchEntry, ": ")).Value, " for ")).Value),
                                "$",
                                ""
                            )
                        )
                    )
                )
            ),
            DisplayPlatesPickedUp,
            If(
                !IsBlank(RequestID),
                PlatesPickedUp,
                Trim(
                    Substitute(
                        First(
                            Filter(
                                Split(Coalesce(PlatesPickedUp, ""), " | "),
                                StartsWith(Value, ThisItem.ReqKey & ": ")
                            )
                        ).Value,
                        ThisItem.ReqKey & ": ",
                        ""
                    )
                )
            )
        ),
        "PaymentSortAt",
        SortOrder.Ascending,
        "ID",
        SortOrder.Ascending
    )
);
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = ThisItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(
        colBuildPlates As plate,
        PlateNum,
        CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
        ResolvedPlateLabel,
        With(
            {
                wDynamicNum: CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
                wStoredLabel: Trim(Coalesce(plate.DisplayLabel, ""))
            },
            If(
                !IsBlank(wStoredLabel),
                wStoredLabel,
                Text(wDynamicNum) & "/" & Text(CountRows(colBuildPlates))
            )
        )
    )
);
ClearCollect(colPickedUpPlates, Blank());
Clear(colPickedUpPlates);
Set(varShowPaymentModal, ThisItem.ID)
```

> 💡 **Note:** This opens the Payment Modal (built in Step 12C) and pre-loads both `Payments` history and the build-plate pickup checklist for the selected request. When opened from "Printing" status, it records a partial payment while the rest continues printing. When opened from "Completed" status, staff can record either a final pickup or another partial pickup.

### Edit Details Button (btnEditDetails)

30. Click **+ Insert** → **Button**.
31. **Rename it:** `btnEditDetails`
27. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✏️ Edit"` |
| X | `70` |
| Y | `167` |
| Width | `55` |
| Height | `20` |
| Fill | `ColorFade(varColorPrimary, varSecondaryFade)` |
| Color | `varColorPrimary` |
| HoverFill | `ColorFade(varColorPrimary, 55%)` |
| PressedFill | `ColorFade(varColorPrimary, 45%)` |
| BorderColor | `varSecondaryBtnBorderColor` |
| BorderThickness | `2` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `8` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Visible | `ThisItem.Status.Value <> "Pending" && !varBatchSelectMode` |

> Note: This is a small secondary button, so uses a reduced Size of 8 instead of varBtnFontSize.

> ⚠️ **Batch Mode:** Button is hidden when `varBatchSelectMode = true` to allow clicking the card for batch selection.

28. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, ThisItem.ID);
Set(varSelectedItem, ThisItem);
Set(varDetailsComputerChanged, false)

```
> 💡 **Visibility:** Available on ALL status tabs except Pending. Positioned near the "Additional Details" header for consistent placement regardless of which action buttons are showing.

### Revert Status Button (btnRevert)

29. Click **+ Insert** → **Button**.
30. **Rename it:** `btnRevert`
31. Set properties:

| Property | Value |
|----------|-------|
| Text | `"↩️"` |
| X | `Parent.TemplateWidth - 70` |
| Y | `6` |
| Width | `28` |
| Height | `28` |
| Fill | `Color.Transparent` |
| Color | `RGBA(120, 120, 120, 1)` |
| HoverFill | `RGBA(0, 0, 0, 0.05)` |
| PressedFill | `RGBA(0, 0, 0, 0.1)` |
| BorderThickness | `0` |
| RadiusTopLeft | `14` |
| RadiusTopRight | `14` |
| RadiusBottomLeft | `14` |
| RadiusBottomRight | `14` |
| Size | `12` |
| PaddingTop | `0` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| Visible | `ThisItem.Status.Value in ["Printing", "Completed", "Paid & Picked Up"] && !varBatchSelectMode` |

> ⚠️ **Batch Mode:** Button is hidden when `varBatchSelectMode = true` to allow clicking the card for batch selection.

> ⚠️ **Recovery path:** Revert is now available on `Paid & Picked Up` requests so staff can reopen a request that was closed in error. Existing `Payments` rows are preserved — only the parent status changes.

32. Set **OnSelect:**

```powerfx
Set(varShowRevertModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Styling:** This is a subtle icon-only button with transparent background, similar to the lightbulb icon. It only shows a light hover effect when moused over, keeping the card clean.

> 💡 **Purpose:** Allows staff to move a job backwards in the workflow (e.g., from "Printing" back to "Ready to Print"). Opens the Revert Modal (Step 12D) where staff must provide a reason for the status change.

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
| Font | `Font.'Open Sans'` |
| Visible | `CountRows(galJobCards.AllItems) = 0` |

> 💡 **How it works:** The label is centered on screen and only appears when the gallery has zero items. When a user selects a status tab with no matching requests, they'll see "No Uploaded requests found" (or whichever status is selected) instead of empty space.

---

# STEP 10: Building the Rejection Modal

**What you're doing:** Creating a popup dialog that appears when staff click "Reject" to capture rejection reasons.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls — no need to set visibility on each individual control!

> ⚠️ **IMPORTANT - Control Types:** This guide uses **Classic** controls (not Modern controls). When inserting controls:
> - For **Text Input**: Insert → Input → **Text input** (Classic). Uses `.Text` property.
> - For **Buttons**: Insert → Input → **Button** (Classic). Uses `Fill`/`Color` properties, NOT `Appearance`.
> - For **Combo Box**: Insert → Input → **Combo box** (Classic). Uses `.Selected.Value`.
> - For **Checkbox**: Insert → Input → **Checkbox** (Classic). Uses `.Value` property.
>
> If you accidentally insert Modern controls, you'll see errors like "Name isn't valid. 'Text' isn't recognized." Modern TextInput uses `.Value` instead of `.Text`.

### Modal Structure (Container-Based)

All controls are added **INSIDE** the `conRejectModal` container. The container handles visibility for all children.

```
scrDashboard
└── conRejectModal             ← CONTAINER (set Visible here only!)
    ├── btnRejectConfirm       ← Confirm Rejection button
    ├── btnRejectCancel        ← Cancel button
    ├── txtRejectComments      ← Multi-line text input for staff comments
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
    ├── lblRejectStaffLabel    ← "Performing Action As"
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
4. Set properties.
5. Replace the `Visible` property with the exact formula shown below.

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
| Fill | `varColorOverlay` |

> ⚠️ **No Visible property needed!** The container handles visibility for all children.

---

### Modal Content Box (recRejectModal)

8. With `conRejectModal` selected, click **+ Insert** → **Rectangle**.
9. **Rename it:** `recRejectModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 720) / 2` |
| Y | `(Parent.Height - 700) / 2` |
| Width | `720` |
| Height | `700` |
| Fill | `varColorBgCard` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

> 💡 **Wider Modal:** The 720px width provides more room for the rejection reason checkboxes and staff dropdown.

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
| Width | `680` |
| Height | `30` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(209, 52, 56, 1)` |

---

### Close Button (btnRejectClose)

13A. Click **+ Insert** → **Button**
13B. **Rename it:** `btnRejectClose`
13C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recRejectModal.X + recRejectModal.Width - 40` |
| Y | `recRejectModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

13D. Set **OnSelect:**

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

### Student Info (lblRejectStudent)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblRejectStudent`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 55` |
| Width | `680` |
| Height | `25` |
| Size | `12` |
| Color | `varColorTextMuted` |

---

### Staff Label (lblRejectStaffLabel)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblRejectStaffLabel`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
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
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

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
| Default | `""` |
| X | `recRejectModal.X + 20` |
| Y | `recRejectModal.Y + 442` |
| Width | `560` |
| Height | `120` |
| Mode | `TextMode.MultiLine` |
| DisplayMode | `DisplayMode.Edit` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |
| HintText | `"Add any additional details for the student..."` |

> 💡 **Data Storage:**
> - `RejectionComment` field: Staff comment for student-facing rejection emails
> - `RejectionReason` field: Structured reasons as multi-select choices (displayed as bullets)
> - `StaffNotes` field: Activity log for internal tracking only (not shown in emails)

---

### Cancel Button (btnRejectCancel)

39. Click **+ Insert** → **Button**.
40. **Rename it:** `btnRejectCancel`
41. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recRejectModal.X + 420` |
| Y | `recRejectModal.Y + 630` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

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
| X | `recRejectModal.X + 550` |
| Y | `recRejectModal.Y + 630` |
| Width | `150` |
| Height | `varBtnHeight` |
| Fill | `varColorDanger` |
| Color | `Color.White` |
| HoverFill | `varColorDangerHover` |
| PressedFill | `ColorFade(varColorDanger, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| DisplayMode | `If(IsBlank(ddRejectStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

46. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Rejecting request...");

// Note: Data is stored in three separate fields for clean separation:
// - RejectionReason: Multi-select choice field for structured reasons (displayed as bullets in email)
// - RejectionComment: Plain text staff comment for student-facing email display
// - StaffNotes: Activity log entry for internal tracking (includes rejection reasons for easy reference in Notes modal)

// Build rejection reasons table (for RejectionReason choice column)
// Filter to only include selected checkboxes, then map to Value records
Set(varRejectionReasonsTable,
    Filter(
        Table(
            {Selected: chkTooSmall.Value, Value: "Features are too small or too thin"},
            {Selected: chkGeometry.Value, Value: "The geometry is problematic"},
            {Selected: chkNotSolid.Value, Value: "Open model/not solid geometry"},
            {Selected: chkScale.Value, Value: "The scale is wrong"},
            {Selected: chkMessy.Value, Value: "The model is messy"},
            {Selected: chkOverhangs.Value, Value: "Excessive overhangs requiring too much support"},
            {Selected: chkNotJoined.Value, Value: "Model parts are not joined together"}
        ),
        Selected
    )
);

// Update the SharePoint item
// Using LookUp to get fresh record avoids concurrency conflicts
Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
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
    RejectionReason: varRejectionReasonsTable,
    RejectionComment: txtRejectComments.Text,
    StaffNotes: Concatenate(
        If(IsBlank(LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes), "", LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes & " | "),
        "REJECTED by " &
        With({n: ddRejectStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
        ": [Summary] " & Concat(varRejectionReasonsTable, Value, "; ") & " [Changes] [Reason] [Context] " &
        " [Comment] " &
        Trim(
            Substitute(
                Substitute(
                    Substitute(
                        Substitute(
                            Substitute(
                                Substitute(
                                    Substitute(txtRejectComments.Text, " | ", "; "),
                                    " ~~ ",
                                    "; "
                                ),
                                "[Summary]",
                                "(Summary)"
                            ),
                            "[Changes]",
                            "(Changes)"
                        ),
                        "[Reason]",
                        "(Reason)"
                    ),
                    "[Context]",
                    "(Context)"
                ),
                "[Comment]",
                "(Comment)"
            )
        ) &
        " - " & Text(Now(), "m/d h:mmam/pm")
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
    Notify("Could not log rejection.", NotificationType.Error)
);

Notify("Request rejected. Student will be notified.", NotificationType.Success);

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
>
> **Nested Modal UX:** If staff opens Build Plates from inside Approval, the Approval modal should be hidden while Build Plates is open, then shown again when Build Plates closes.

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conApprovalModal             ← CONTAINER (set Visible here only!)
    ├── btnApprovalConfirm       ← Confirm Approval button
    ├── btnApprovalCancel        ← Cancel button
    ├── btnApproveAddPlates      ← Open Build Plates modal button (right side)
    ├── lblApprovePlatesInfo     ← "Build Plates: 1 plate on..." (right side)
    ├── ddSlicedOnComputer       ← Slicing computer dropdown (right side)
    ├── lblSlicedOnLabel         ← "Computer:" (right side)
    ├── txtApprovalComments      ← Multi-line text input
    ├── lblApprovalCommentsLabel ← "Additional Comments:"
    ├── lblApprovalCostValue     ← Auto-calculated cost display
    ├── chkApprovalOwnMaterial   ← "Student provided own material (70% discount)"
    ├── lblApprovalCostLabel     ← "Estimated Cost:"
    ├── txtEstimatedTime         ← Time input field
    ├── lblApprovalTimeLabel     ← "Estimated Print Time (hours):"
    ├── txtEstimatedWeight       ← Material usage input field
    ├── lblApprovalWeightLabel   ← "Estimated Weight/Volume:"
    ├── ddApprovalStaff          ← Staff dropdown
    ├── lblApprovalStaffLabel    ← "Performing Action As:"
    ├── lblApprovalStudent       ← Student name and email
    ├── btnApprovalClose         ← X close button (top-right)
    ├── lblApprovalTitle         ← "Approve Request - REQ-00042"
    ├── recApprovalModal         ← White modal box (644px tall)
    └── recApprovalOverlay       ← Dark semi-transparent background
```

---

### Modal Container (conApprovalModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conApprovalModal`
4. Set properties:
5. Replace the `Visible` property with the exact formula shown below.

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowApprovalModal > 0 && varShowBuildPlatesModal = 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility. The added `varShowBuildPlatesModal = 0` condition prevents the approval modal from remaining visible behind the Build Plates modal.
>
> **If you still see Approval behind Build Plates:** The live app formula on `conApprovalModal.Visible` has not been updated yet. The fix is not visual styling alone; it must be this exact visibility formula.

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
| Fill | `varColorOverlay` |

---

### Modal Content Box (recApprovalModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recApprovalModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 751) / 2` |
| Width | `600` |
| Height | `670` |
| Fill | `varColorBgCard` |

> 💡 **Layout:** Side-by-side design with weight/time/cost on left, computer/plates on right.

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
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(16, 124, 16, 1)` |

---

### Close Button (btnApprovalClose)

13A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
13B. **Rename it:** `btnApprovalClose`
13C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recApprovalModal.X + recApprovalModal.Width - 40` |
| Y | `recApprovalModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

13D. Set **OnSelect:**

```powerfx
Set(varShowApprovalModal, 0);
Set(varSelectedItem, Blank());
Reset(txtEstimatedWeight);
Reset(txtEstimatedTime);
Reset(txtApprovalComments);
Reset(ddApprovalStaff);
Reset(ddSlicedOnComputer);
Reset(chkApprovalOwnMaterial)
```

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
| Color | `varColorTextMuted` |

---

### Staff Label (lblApprovalStaffLabel)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblApprovalStaffLabel`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
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
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

> ⚠️ **Important:** You must **Run OnStart** first before setting DisplayFields. Otherwise Power Apps will auto-change it to `["ComplianceAssetId"]` because it doesn't recognize the collection columns yet.

---

### Slicing Computer Label (lblSlicedOnLabel) — Right Side

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblSlicedOnLabel`
25. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Computer:"` |
| X | `670` |
| Y | `189` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |

---

### Slicing Computer Dropdown (ddSlicedOnComputer) — Right Side

26. Click **+ Insert** → **Combo box**.
27. **Rename it:** `ddSlicedOnComputer`
28. Set properties:

| Property | Value |
|----------|-------|
| Items | `colSlicingComputers` |
| X | `670` |
| Y | `211` |
| Width | `270` |
| Height | `36` |
| DisplayFields | `["Name"]` |
| SearchFields | `["Name"]` |
| DefaultSelectedItems | `Blank()` |
| InputTextPlaceholder | `"Where is the sliced file?"` |
| IsSearchable | `false` |
| SelectMultiple | `false` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

> 💡 **Layout:** Computer dropdown is positioned on the right side of the modal, aligned with the Build Plates section below it.

---

### Weight Label (lblApprovalWeightLabel)

29. Click **+ Insert** → **Text label**.
30. **Rename it:** `lblApprovalWeightLabel`
31. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(varSelectedItem.Method.Value = "Resin", "Estimated Volume (mL):", "Estimated Weight (grams):")` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 165` |
| Width | `250` |
| Height | `25` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |

---

### Weight Input (txtEstimatedWeight)

32. Click **+ Insert** → **Text input**.
33. **Rename it:** `txtEstimatedWeight`
34. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 190` |
| Width | `236` |
| Height | `36` |
| HintText | `If(varSelectedItem.Method.Value = "Resin", "Enter resin volume in mL (e.g., 318)", "Enter weight in grams (e.g., 25)")` |
| Font | `varAppFont` |
| Size | `11` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

---

### Time Label (lblApprovalTimeLabel)

35. Click **+ Insert** → **Text label**.
36. **Rename it:** `lblApprovalTimeLabel`
37. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Print Time (hours):"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 240` |
| Width | `300` |
| Height | `25` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |

---

### Time Input (txtEstimatedTime)

38. Click **+ Insert** → **Text input**.
39. **Rename it:** `txtEstimatedTime`
40. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 265` |
| Width | `200` |
| Height | `36` |
| HintText | `"Enter hours (e.g., 2.5)"` |
| Font | `varAppFont` |
| Size | `11` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

---

### Cost Label (lblApprovalCostLabel)

41. Click **+ Insert** → **Text label**.
42. **Rename it:** `lblApprovalCostLabel`
43. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Cost:"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 320` |
| Width | `267` |
| Height | `25` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |

---

### Cost Value Display (lblApprovalCostValue)

44. Click **+ Insert** → **Text label**.
45. **Rename it:** `lblApprovalCostValue`
46. Set properties:

| Property | Value |
|----------|-------|
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 345` |
| Width | `280` |
| FontWeight | `FontWeight.Bold` |
| Size | `24` |
| Color | `varColorSuccess` |

47. Set **Text:**

```powerfx
If(
    IsNumeric(txtEstimatedWeight.Text) && Value(txtEstimatedWeight.Text) > 0,
    With(
        {
            baseCost: Max(
                varMinimumCost,
                Value(txtEstimatedWeight.Text) * If(
                    varSelectedItem.Method.Value = "Resin",
                    varResinRate,
                    varFilamentRate
                )
            )
        },
        "$" & Text(
            If(chkApprovalOwnMaterial.Value, baseCost * varOwnMaterialDiscount, baseCost),
            "[$-en-US]#,##0.00"
        ) & If(chkApprovalOwnMaterial.Value, " (70% off)", "")
    ),
    "$" & Text(varMinimumCost, "[$-en-US]#,##0.00") & " (minimum)"
)
```

> 💰 **Pricing:** Uses `varFilamentRate` ($/g), `varResinRate` ($/mL), and `varMinimumCost` from App.OnStart

---

### Own Material Checkbox (chkApprovalOwnMaterial)

47A. Click **+ Insert** ? **Checkbox** (**Classic**).
47B. **Rename it:** `chkApprovalOwnMaterial`
47C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student provided own material (70% discount)"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 383` |
| Width | `420` |
| Height | `32` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorNeutral` |
| CheckboxBorderColor | `varInputBorderColor` |
| CheckmarkFill | `RGBA(0, 0, 0, 1)` |
| HoverColor | `RGBA(0, 18, 107, 1)` |
| Default | `false` |

> ?? **Discount Logic:** When checked, the estimated cost display above updates in real time to reflect the 70% discount (`varOwnMaterialDiscount`). The value is saved to `StudentOwnMaterial` on the `PrintRequests` record so the details modal and payment modal can pre-populate from it.

---

### Comments Label (lblApprovalCommentsLabel)

48. Click **+ Insert** → **Text label**.
49. **Rename it:** `lblApprovalCommentsLabel`
50. Set properties:

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

51. Click **+ Insert** → **Text input**.
52. **Rename it:** `txtApprovalComments`
53. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 425` |
| Width | `560` |
| Height | `100` |
| HintText | `"Add any special instructions for this job..."` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

> 💡 **Data Storage:**
> - `ApprovalComment` field: Clean staff note for student-facing estimate emails
> - `StaffNotes` field: Internal audit/history entry with estimate details, comment, and timestamp

---

### Build Plates Info Label (lblApprovePlatesInfo) — Right Side

54. Click **+ Insert** → **Text label**.
55. **Rename it:** `lblApprovePlatesInfo`
56. Set properties:

| Property | Value |
|----------|-------|
| X | `643` |
| Y | `263` |
| Width | `324` |
| Height | `23` |
| Size | `11` |
| Color | `varColorTextMuted` |

57. Set **Text:**

```powerfx
"Build Plates:  " & 
If(
    CountRows(Filter(BuildPlates, RequestID = varSelectedItem.ID)) > 0,
    Text(CountRows(Filter(BuildPlates, RequestID = varSelectedItem.ID))) & " plate(s) configured",
    "1 plate on " & 
    Trim(If(Find("(", varSelectedItem.Printer.Value) > 0, 
        Left(varSelectedItem.Printer.Value, Find("(", varSelectedItem.Printer.Value) - 2), 
        varSelectedItem.Printer.Value))
)
```

> 💡 **Dynamic Display:** Shows "X plate(s) configured" if staff has added plates via the Build Plates modal, otherwise shows the default plate that will be auto-created upon approval.

---

### Add Plates Button (btnApproveAddPlates) — Right Side

58. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
59. **Rename it:** `btnApproveAddPlates`
60. Set properties:

| Property | Value |
|----------|-------|
| Text | `"🖨 Add Plates/Printers"` |
| X | `703` |
| Y | `286` |
| Width | `200` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimary` |
| HoverColor | `Color.White` |
| BorderColor | `varColorPrimary` |
| BorderThickness | `varInputBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Font | `varAppFont` |
| Size | `12` |

61. Set **OnSelect** exactly as follows:

```powerfx
// Open Build Plates modal (varSelectedItem already set from Approve button click)
Set(varBuildPlatesOpenedFromApproval, true);
Set(varShowBuildPlatesModal, varSelectedItem.ID);
// Load existing plates (if any)
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(
        colBuildPlates As plate,
        PlateNum,
        CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
        ResolvedPlateLabel,
        With(
            {
                wDynamicNum: CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
                wStoredLabel: Trim(Coalesce(plate.DisplayLabel, ""))
            },
            If(
                !IsBlank(wStoredLabel),
                wStoredLabel,
                Text(wDynamicNum) & "/" & Text(CountRows(colBuildPlates))
            )
        )
    )
);
ClearCollect(colPrintersUsed,
    Distinct(Filter(BuildPlates, RequestID = varSelectedItem.ID), Machine.Value)
)
```

> 💡 **Optional Pre-Configuration:** Staff can optionally click this button to configure multiple plates/printers before approval. If they don't, a default plate is auto-created when they click "Confirm Approval".
>
> `varBuildPlatesOpenedFromApproval` tracks that this modal was opened from Approval, so closing Build Plates returns staff to the Approval modal instead of clearing the current request context.
>
> Keep the `colBuildPlatesIndexed` rebuild formula identical across all build-plate entry points so `PlateNum` and `ResolvedPlateLabel` stay consistent anywhere they are displayed. `PlateNum` is display-only and must never be used as the durable historical identifier; use `PlateKey` for that instead.
>
> **Expected result:** Once this button is clicked, staff should only see the Build Plates modal. The Approval modal title, body, and buttons should not remain visible in the background.

---

### Cancel Button (btnApprovalCancel)

62. Click **+ Insert** → **Button**.
63. **Rename it:** `btnApprovalCancel`
64. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recApprovalModal.X + 300` |
| Y | `recApprovalModal.Y + 560` |
| Width | `120` |
| Height | `36` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

65. Set **OnSelect:**

```powerfx
Set(varShowApprovalModal, 0);
Set(varSelectedItem, Blank());
Reset(txtEstimatedWeight);
Reset(txtEstimatedTime);
Reset(txtApprovalComments);
Reset(ddApprovalStaff);
Reset(ddSlicedOnComputer);
Reset(chkApprovalOwnMaterial)
```

---

### Confirm Approval Button (btnApprovalConfirm)

66. Click **+ Insert** → **Button**.
67. **Rename it:** `btnApprovalConfirm`
68. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Confirm Approval"` |
| X | `recApprovalModal.X + 430` |
| Y | `recApprovalModal.Y + 560` |
| Width | `150` |
| Height | `36` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorSuccess, -15%)` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `ColorFade(Self.Fill, -15%)` |
| BorderThickness | `1` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

69. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddApprovalStaff.Selected) && 
    !IsBlank(ddSlicedOnComputer.Selected) &&
    !IsBlank(txtEstimatedWeight.Text) && 
    IsNumeric(txtEstimatedWeight.Text) && 
    Value(txtEstimatedWeight.Text) > 0 &&
    !IsBlank(txtEstimatedTime.Text) &&
    IsNumeric(txtEstimatedTime.Text) &&
    Value(txtEstimatedTime.Text) > 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

> ⚠️ **Required Fields:** Staff, sliced on computer, material usage, AND time are all required for the confirm button to be enabled.

70. Set **OnSelect:**

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
// Using LookUp to get fresh record avoids concurrency conflicts
Set(
    varApprovalSaved,
    IfError(
        With(
            {
                wBuildPlateCount: Max(1, CountRows(Filter(BuildPlates, RequestID = varSelectedItem.ID)))
            },
            Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
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
                EstimatedTime: Value(txtEstimatedTime.Text),
                EstimatedCost: varCalculatedCost,
                StudentOwnMaterial: chkApprovalOwnMaterial.Value,
                SlicedOnComputer: {Value: ddSlicedOnComputer.Selected.Name},
                ApprovalComment: txtApprovalComments.Text,
                StaffNotes: Concatenate(
                    If(IsBlank(LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes), "", LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes & " | "),
                    "APPROVED by " &
                    With({n: ddApprovalStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
                    ": [Summary] " & txtEstimatedWeight.Text &
                    If(varSelectedItem.Method.Value = "Resin", "mL", "g") &
                    ", $" & Text(varCalculatedCost, "[$-en-US]#,##0.00") &
                    " [Changes] [Reason] [Context] " &
                    " [Comment] " &
                    Trim(
                        Substitute(
                            Substitute(
                                Substitute(
                                    Substitute(
                                        Substitute(
                                            Substitute(
                                                Substitute(txtApprovalComments.Text, " | ", "; "),
                                                " ~~ ",
                                                "; "
                                            ),
                                            "[Summary]",
                                            "(Summary)"
                                        ),
                                        "[Changes]",
                                        "(Changes)"
                                    ),
                                    "[Reason]",
                                    "(Reason)"
                                ),
                                "[Context]",
                                "(Context)"
                            ),
                            "[Comment]",
                            "(Comment)"
                        )
                    ) &
                    " - " & Text(Now(), "m/d h:mmam/pm")
                )
            })
        );
        true,
        Set(varIsLoading, false);
        Notify("Failed to save approval. Please try again.", NotificationType.Error);
        false
    )
);

If(
    varApprovalSaved,
    IfError(
        'Flow-(C)-Action-LogAction'.Run(
            Text(varSelectedItem.ID),              // RequestID
            "Approved",                            // Action
            "Status",                              // FieldName
            "Pending",                             // NewValue
            ddApprovalStaff.Selected.MemberEmail   // ActorEmail
        ),
        Notify("Approved, but could not log to audit.", NotificationType.Warning)
    );
    Notify("Approved! Student will receive estimate email.", NotificationType.Success);
    
    // === CREATE DEFAULT BUILD PLATE ===
    // If staff didn't configure plates via "Add Plates/Printers" button, auto-create one
    If(CountRows(Filter(BuildPlates, RequestID = varSelectedItem.ID)) = 0,
        Patch(BuildPlates, Defaults(BuildPlates), {
            RequestID: varSelectedItem.ID,
            ReqKey: varSelectedItem.ReqKey,
            PlateKey: Text(GUID()),
            Machine: If(
                varSelectedItem.Method.Value = "Resin",
                Coalesce(
                    LookUp(Choices([@BuildPlates].Machine), Value = varSelectedItem.Printer.Value),
                    LookUp(
                        Choices([@BuildPlates].Machine),
                        Or(StartsWith(Value, "Form 3+"), StartsWith(Value, "Form 3 ("))
                    )
                ),
                varSelectedItem.Printer
            ),
            Status: {Value: "Queued"},
            DisplayLabel: Blank()
        })
    );
    // Refresh plate collections for job cards
    ClearCollect(colAllBuildPlates, BuildPlates);
    ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}));
    
    // Close modal and reset
    Set(varShowApprovalModal, 0);
    Set(varSelectedItem, Blank());
    Reset(txtEstimatedWeight);
    Reset(txtEstimatedTime);
    Reset(txtApprovalComments);
    Reset(ddApprovalStaff);
    Reset(ddSlicedOnComputer);
    Reset(chkApprovalOwnMaterial)
);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Error Handling Pattern:**
> - `varApprovalSaved` captures whether the request save succeeded
> - `IfError(...)` is used only for failure handling, not as a mixed success/error branch
> - Flow logging is attempted only after the save succeeds, and the success `Notify(...)` is called separately
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
    ├── lblArchiveStaffLabel  ← "Performing Action As"
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
| Fill | `varColorOverlay` |

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
| Fill | `varColorBgCard` |
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
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `varColorTextMuted` |

---

### Close Button (btnArchiveClose)

13A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
13B. **Rename it:** `btnArchiveClose`
13C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recArchiveModal.X + recArchiveModal.Width - 40` |
| Y | `recArchiveModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

13D. Set **OnSelect:**

```powerfx
Set(varShowArchiveModal, 0);
Set(varSelectedItem, Blank());
Reset(txtArchiveReason);
Reset(ddArchiveStaff)
```

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
| Text | `"Performing Action As"` |
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
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

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
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

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
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

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
| Height | `varBtnHeight` |
| Fill | `varColorWarning` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorWarning, -15%)` |
| PressedFill | `ColorFade(varColorWarning, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| DisplayMode | `If(IsBlank(ddArchiveStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

33. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Archiving request...");

// Update SharePoint item
// Using LookUp to get fresh record avoids concurrency conflicts
Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
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
        If(IsBlank(LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes), "", LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes & " | "),
        "ARCHIVED by " & 
        With({n: ddArchiveStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
        ": [Summary] " &
        Trim(
            Substitute(
                Substitute(
                    Substitute(
                        Substitute(
                            Substitute(
                                Substitute(
                                    Substitute(txtArchiveReason.Text, " | ", "; "),
                                    " ~~ ",
                                    "; "
                                ),
                                "[Summary]",
                                "(Summary)"
                            ),
                            "[Changes]",
                            "(Changes)"
                        ),
                        "[Reason]",
                        "(Reason)"
                    ),
                    "[Context]",
                    "(Context)"
                ),
                "[Comment]",
                "(Comment)"
            )
        ) &
        " [Changes] [Reason] [Context] " &
        " [Comment] - " & Text(Now(), "m/d h:mmam/pm")
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
    Notify("Could not log archive.", NotificationType.Error)
);

Notify("Request archived successfully.", NotificationType.Success);

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

# STEP 12A: Building the Complete Confirmation Modal

**What you're doing:** Creating a confirmation dialog before marking a print as complete. This prevents accidental status changes and ensures staff intentionally confirms before the student receives a pickup notification email.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

> ⚠️ **Why This Matters:** When a print is marked "Completed", the student immediately receives an email telling them to come pick up their print. An accidental click could cause the student to waste a trip to the lab. This confirmation modal adds a safety check.

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conCompleteModal          ← CONTAINER (set Visible here only!)
    ├── btnCompleteConfirm    ← Confirm Complete button
    ├── btnCompleteCancel     ← Cancel button
    ├── lblActualPrinters     ← Read-only printers display (auto-populated from plates)
    ├── ddCompleteStaff       ← Staff dropdown
    ├── lblCompleteStaffLabel ← "Performing Action As"
    ├── lblCompleteWarning    ← Warning about email notification
    ├── lblCompleteTitle      ← "Mark [Student Name] Complete - REQ-00042"
    ├── recCompleteModal      ← White modal box (340px tall)
    └── recCompleteOverlay    ← Dark semi-transparent background
```

---

### Modal Container (conCompleteModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conCompleteModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowCompleteModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Modal Overlay (recCompleteOverlay)

5. With `conCompleteModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recCompleteOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorOverlay` |

---

### Modal Content Box (recCompleteModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recCompleteModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 500) / 2` |
| Y | `(Parent.Height - 340) / 2` |
| Width | `500` |
| Height | `340` |
| Fill | `varColorBgCard` |

> 💡 **Modal Height:** 340px to accommodate the printers used display (auto-populated from build plates).

---

### Modal Title (lblCompleteTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblCompleteTitle`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Mark " & varSelectedItem.Student.DisplayName & " Complete - " & varSelectedItem.ReqKey` |
| X | `recCompleteModal.X + 20` |
| Y | `recCompleteModal.Y + 20` |
| Width | `460` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `varColorTextMuted` |

---

### Close Button (btnCompleteClose)

13A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
13B. **Rename it:** `btnCompleteClose`
13C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recCompleteModal.X + recCompleteModal.Width - 40` |
| Y | `recCompleteModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

13D. Set **OnSelect:**

```powerfx
Set(varShowCompleteModal, 0);
Set(varSelectedItem, Blank());
Reset(ddCompleteStaff)
```

---

### Warning Message (lblCompleteWarning)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblCompleteWarning`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"⚠️ Marking this print complete will immediately send a pickup notification email to the student. Make sure the print is actually finished and ready."` |
| X | `recCompleteModal.X + 20` |
| Y | `recCompleteModal.Y + 55` |
| Width | `460` |
| Height | `50` |
| Font | `varAppFont` |
| Size | `12` |
| Color | `RGBA(150, 100, 0, 1)` |

---

### Staff Label (lblCompleteStaffLabel)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblCompleteStaffLabel`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
| X | `recCompleteModal.X + 20` |
| Y | `recCompleteModal.Y + 115` |
| Width | `200` |
| Height | `20` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `varColorText` |

---

### Staff Dropdown (ddCompleteStaff)

20. Click **+ Insert** → **Combo box**.
21. **Rename it:** `ddCompleteStaff`
22. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recCompleteModal.X + 20` |
| Y | `recCompleteModal.Y + 140` |
| Width | `300` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

---

### Printers Used Label (lblActualPrinters)

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblActualPrinters`
25. Set properties:

| Property | Value |
|----------|-------|
| X | `recCompleteModal.X + 20` |
| Y | `recCompleteModal.Y + 190` |
| Width | `460` |
| Height | `40` |
| Font | `varAppFont` |
| Size | `12` |
| Color | `varColorTextMuted` |

26. Set **Text:**

```powerfx
"Printers used: " & 
If(
    CountRows(colActualPrinters) > 0,
    Concat(
        colActualPrinters, 
        Trim(If(Find("(", ThisRecord.Value) > 0, Left(ThisRecord.Value, Find("(", ThisRecord.Value) - 2), ThisRecord.Value)), 
        ", "
    ),
    Trim(If(Find("(", varSelectedItem.Printer.Value) > 0, 
        Left(varSelectedItem.Printer.Value, Find("(", varSelectedItem.Printer.Value) - 2), 
        varSelectedItem.Printer.Value))
) & Char(10) & "(derived from build plates)"
```

> 💡 **Read-Only Display:** Unlike the legacy dropdown approach, this label shows the actual printers used based on the job's build plates. Staff cannot manually edit this — the data comes from what was tracked in the BuildPlates list. If no plates exist, it falls back to displaying the student's originally requested printer.

---

### Cancel Button (btnCompleteCancel)

27. Click **+ Insert** → **Button**.
28. **Rename it:** `btnCompleteCancel`
29. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recCompleteModal.X + 200` |
| Y | `recCompleteModal.Y + 280` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

30. Set **OnSelect:**

```powerfx
Set(varShowCompleteModal, 0);
Set(varSelectedItem, Blank());
Reset(ddCompleteStaff)
```

---

### Confirm Complete Button (btnCompleteConfirm)

31. Click **+ Insert** → **Button**.
32. **Rename it:** `btnCompleteConfirm`
33. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Confirm Complete"` |
| X | `recCompleteModal.X + 330` |
| Y | `recCompleteModal.Y + 280` |
| Width | `150` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| DisplayMode | `If(IsBlank(ddCompleteStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

34. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Completing print...");

// Determine ActualPrinter from plates (or fall back to student's requested printer)
Set(varActualPrinterValue, 
    If(
        CountRows(colActualPrinters) > 0,
        // Use first printer from plates (multi-select will use all values)
        First(colActualPrinters).Value,
        // Fall back to student's requested printer
        varSelectedItem.Printer.Value
    )
);

// Update SharePoint item with ActualPrinter
Set(
    varCompleteSaved,
    IfError(
        Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
            Status: LookUp(Choices(PrintRequests.Status), Value = "Completed"),
            ActualPrinter: If(
                CountRows(colActualPrinters) > 0,
                ForAll(colActualPrinters As printer, {Value: printer.Value}),
                Table({Value: varSelectedItem.Printer.Value})
            ),
            LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
            LastActionBy: {
                Claims: "i:0#.f|membership|" & ddCompleteStaff.Selected.MemberEmail,
                Discipline: "",
                DisplayName: ddCompleteStaff.Selected.MemberName,
                Email: ddCompleteStaff.Selected.MemberEmail,
                JobTitle: "",
                Picture: ""
            },
            LastActionAt: Now(),
            StaffNotes: Concatenate(
                If(IsBlank(LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes), "", LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes & " | "),
                "STATUS by " &
                With({n: ddCompleteStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
                ": [Summary] Printing -> Completed [Changes] [Reason] [Context] " &
                " [Comment] - " & Text(Now(), "m/d h:mmam/pm")
            )
        });
        true,
        Notify("Failed to mark print complete.", NotificationType.Error);
        false
    )
);

If(
    varCompleteSaved,
    // Log action via Flow C with conditional printer correction note
    IfError(
        Set(
            varCompleteAuditResult,
            'Flow-(C)-Action-LogAction'.Run(
                Text(varSelectedItem.ID),              // RequestID
                "Status Change",                       // Action
                "Status",                              // FieldName
                Concatenate(
                    "Completed",
                    If(
                        varActualPrinterValue <> varSelectedItem.Printer.Value,
                        " (Printer: " &
                            Trim(If(Find("(", varActualPrinterValue) > 0,
                                Left(varActualPrinterValue, Find("(", varActualPrinterValue) - 2),
                                varActualPrinterValue)) &
                            If(CountRows(colActualPrinters) > 1, " + " & Text(CountRows(colActualPrinters) - 1) & " more", "") &
                        ")",
                        ""
                    )
                ),                                     // NewValue
                ddCompleteStaff.Selected.MemberEmail   // ActorEmail
            )
        ),
        Notify("Marked complete, but could not log to audit.", NotificationType.Warning)
    );

    Notify("Marked as completed! Student will receive pickup email.", NotificationType.Success);

    // Close modal and reset
    Set(varShowCompleteModal, 0);
    Set(varSelectedItem, Blank());
    Reset(ddCompleteStaff)
);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Email Notification:** When the status changes to "Completed", Flow B automatically sends a pickup notification email to the student. This modal ensures staff intentionally confirms before that email is sent.

> 💡 **ActualPrinter:** The `ActualPrinter` field is a multi-select choice column, so patch it as a table of `{Value: ...}` records derived from `colActualPrinters`. If the actual printer(s) differ from the student's original request, the audit log includes a note showing which printer(s) were used.

---

# STEP 12B: Building the Change Print Details Modal

**What you're doing:** Creating a modal that allows staff to change Method, Printer, Color, Sliced-On Computer, Weight, Hours, and recalculate Cost for a job. All changes are optional — staff can update any combination of fields.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

> 💡 **Why this matters:** Provides flexibility to fix mistakes or adjust job parameters at any point in the workflow (except Pending status). The choice controls should preload the current values so staff can clearly see what is already saved before making a change.

> ⚠️ **Availability:** This modal is accessible from ALL status tabs EXCEPT Pending. The Edit button (✏️ Edit) appears near the "Additional Details" header on each job card.

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conDetailsModal            ← CONTAINER (set Visible here only!)
    ├── btnDetailsConfirm      ← Save Changes button
    ├── btnDetailsCancel       ← Cancel button
    ├── txtDetailsTransaction  ← Transaction number input (only shows for paid items)
    ├── lblDetailsTransLabel   ← "Transaction #:"
    ├── lblDetailsCostValue    ← Auto-calculated cost display
    ├── chkDetailsOwnMaterial  ← "Student provided own material (70% discount)"
    ├── lblDetailsCostLabel    ← "Calculated Cost:"
    ├── txtDetailsHours        ← Hours number input
    ├── lblDetailsHoursLabel   ← "Est. Hours:"
    ├── txtDetailsWeight       ← Weight number input
    ├── lblDetailsWeightLabel  ← "Est. Weight/Volume:"
    ├── ddDetailsColor         ← Color dropdown
    ├── lblDetailsColorLabel   ← "Color:"
    ├── ddDetailsPrinter       ← Printer dropdown (filtered by method)
    ├── lblDetailsPrinterLabel ← "Printer:"
    ├── ddDetailsMethod        ← Method dropdown (Filament/Resin)
    ├── lblDetailsMethodLabel  ← "Method:"
    ├── ddDetailsSlicedOnComputer ← Sliced-on computer dropdown
    ├── lblDetailsSlicedOnLabel   ← "Sliced On Computer:"
    ├── ddDetailsStaff         ← Staff dropdown
    ├── lblDetailsStaffLabel   ← "Performing Action As"
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
| Fill | `varColorOverlay` |

---

### Modal Content Box (recDetailsModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recDetailsModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 550) / 2` |
| Y | `(Parent.Height - 660) / 2` |
| Width | `550` |
| Height | `660` |
| Fill | `varColorBgCard` |
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
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(0, 120, 212, 1)` |

---

### Close Button (btnDetailsClose)

10A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
10B. **Rename it:** `btnDetailsClose`
10C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recDetailsModal.X + recDetailsModal.Width - 40` |
| Y | `recDetailsModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

10D. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, 0);
Set(varSelectedItem, Blank());
Reset(ddDetailsStaff);
Reset(ddDetailsSlicedOnComputer);
Reset(ddDetailsMethod);
Reset(ddDetailsPrinter);
Reset(ddDetailsColor);
Reset(txtDetailsWeight);
Reset(txtDetailsHours);
Reset(txtDetailsTransaction);
Reset(chkDetailsOwnMaterial);
Set(varDetailsComputerChanged, false)
```

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
| Color | `varColorTextMuted` |

17. Set **Text:**

```powerfx
varSelectedItem.Method.Value & " | " &
varSelectedItem.Printer.Value & " | " &
varSelectedItem.Color.Value & " | " &
Coalesce(varSelectedItem.SlicedOnComputer.Value, "No computer") & " | " &
If(
    IsBlank(varSelectedItem.EstimatedWeight),
    "No estimate",
    Text(varSelectedItem.EstimatedWeight) & If(varSelectedItem.Method.Value = "Resin", "mL", "g")
) & " | " &
If(IsBlank(varSelectedItem.EstimatedCost), "No cost", "$" & Text(varSelectedItem.EstimatedCost, "[$-en-US]#,##0.00"))
```

> 💡 **Show full printer value:** Display the full stored printer choice here instead of trimming dimensions. That avoids the confusing case where the summary says `Prusa XL` but the actual saved value is `Prusa XL (14.2×14.2×14.2in)`.

---

### Staff Label (lblDetailsStaffLabel)

18. Click **+ Insert** → **Text label**.
19. **Rename it:** `lblDetailsStaffLabel`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
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
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

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
| DefaultSelectedItems | `If(IsBlank(varSelectedItem.Method), Blank(), [varSelectedItem.Method])` |
| OnChange | `Reset(ddDetailsPrinter)` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

> 💡 **Preloaded current value:** Preloading the current Method makes the modal easier to understand and keeps the combo box aligned with the record that is being edited.

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
| DefaultSelectedItems | `If(Coalesce(ddDetailsMethod.Selected.Value, varSelectedItem.Method.Value) = "Resin", [LookUp(Choices([@PrintRequests].Printer), Or(StartsWith(Value, "Form 3+"), StartsWith(Value, "Form 3 (")))], If(IsBlank(varSelectedItem.Printer), Blank(), [varSelectedItem.Printer]))` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

36. Set **Items** (filtered by Method — uses new method if selected, otherwise current):

```powerfx
With(
    {selectedMethod: Coalesce(ddDetailsMethod.Selected.Value, varSelectedItem.Method.Value)},
    Filter(
        Choices([@PrintRequests].Printer),
        (
            selectedMethod = varSelectedItem.Method.Value &&
            Value = varSelectedItem.Printer.Value
        ) ||
        If(
            selectedMethod = "Filament",
            StartsWith(Value, "Prusa MK4S") || StartsWith(Value, "Prusa XL") || StartsWith(Value, "Raise"),
            selectedMethod = "Resin",
            StartsWith(Value, "Form 3+") || StartsWith(Value, "Form 3 ("),
            true
        )
    )
)
```

> 💡 **Dynamic filtering:** When the modal first opens, the current printer is guaranteed to remain in the list so the preloaded selection renders correctly. If staff changes Method, the dropdown switches to the compatible printer list for that new method.

> ⚠️ **Important:** This avoids a common UX bug where the combo appears blank even though a printer is already saved, and it ensures printer-only changes are easier to detect.
>
> **Resin default:** When staff switches Method to `Resin`, reset `ddDetailsPrinter` so the printer auto-populates to the first resin choice (`Form 3+…` or `Form 3 (…)` per your SharePoint labels).

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
| DefaultSelectedItems | `If(IsBlank(varSelectedItem.Color), Blank(), [varSelectedItem.Color])` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

---

### Sliced-On Computer Label (lblDetailsSlicedOnLabel)

43. Click **+ Insert** → **Text label**.
44. **Rename it:** `lblDetailsSlicedOnLabel`
45. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Sliced On Computer:"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 325` |
| Width | `180` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Sliced-On Computer Dropdown (ddDetailsSlicedOnComputer)

46. Click **+ Insert** → **Combo box**.
47. **Rename it:** `ddDetailsSlicedOnComputer`
48. Set properties:

| Property | Value |
|----------|-------|
| Items | `colSlicingComputers` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 348` |
| Width | `200` |
| Height | `36` |
| DisplayFields | `["Name"]` |
| SearchFields | `["Name"]` |
| SelectMultiple | `false` |
| IsSearchable | `false` |
| DefaultSelectedItems | `If(IsBlank(varSelectedItem.SlicedOnComputer.Value), Blank(), [LookUp(colSlicingComputers, Name = varSelectedItem.SlicedOnComputer.Value)])` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |
| OnChange | `Set(varDetailsComputerChanged, ddDetailsSlicedOnComputer.Selected.Name <> Coalesce(varSelectedItem.SlicedOnComputer.Value, ""))` |

> 💡 **Preloaded current computer:** Reuse the same local slicing-computer collection from approval so staff can correct the stored workstation without needing a SharePoint lookup. The `OnChange` handler sets `varDetailsComputerChanged` so the Save button enables correctly — this is required because Power Apps does not always re-evaluate button `DisplayMode` formulas when a ComboBox selection changes.

---

### Weight Label (lblDetailsWeightLabel)

49. Click **+ Insert** → **Text label**.
50. **Rename it:** `lblDetailsWeightLabel`
51. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(Coalesce(ddDetailsMethod.Selected.Value, varSelectedItem.Method.Value) = "Resin", "Est. Volume (mL):", "Est. Weight (g):")` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 395` |
| Width | `130` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Weight Input (txtDetailsWeight)

52. Click **+ Insert** → **Text input**.
53. **Rename it:** `txtDetailsWeight`
54. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 418` |
| Width | `120` |
| Height | `36` |
| Format | `TextFormat.Number` |
| HintText | `If(Coalesce(ddDetailsMethod.Selected.Value, varSelectedItem.Method.Value) = "Resin", "e.g., 318", "e.g., 25")` |
| Default | `If(IsBlank(varSelectedItem.EstimatedWeight), "", Text(varSelectedItem.EstimatedWeight))` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Hours Label (lblDetailsHoursLabel)

55. Click **+ Insert** → **Text label**.
56. **Rename it:** `lblDetailsHoursLabel`
57. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Est. Hours:"` |
| X | `recDetailsModal.X + 160` |
| Y | `recDetailsModal.Y + 395` |
| Width | `100` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Hours Input (txtDetailsHours)

58. Click **+ Insert** → **Text input**.
59. **Rename it:** `txtDetailsHours`
60. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 160` |
| Y | `recDetailsModal.Y + 418` |
| Width | `100` |
| Height | `36` |
| Format | `TextFormat.Number` |
| HintText | `"e.g., 2.5"` |
| Default | `If(IsBlank(varSelectedItem.EstimatedTime), "", Text(varSelectedItem.EstimatedTime))` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Cost Label (lblDetailsCostLabel)

61. Click **+ Insert** → **Text label**.
62. **Rename it:** `lblDetailsCostLabel`
63. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Calculated Cost:"` |
| X | `recDetailsModal.X + 280` |
| Y | `recDetailsModal.Y + 395` |
| Width | `130` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Cost Value Display (lblDetailsCostValue)

64. Click **+ Insert** → **Text label**.
65. **Rename it:** `lblDetailsCostValue`
66. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 280` |
| Y | `recDetailsModal.Y + 418` |
| Width | `150` |
| Height | `36` |
| Size | `18` |
| FontWeight | `FontWeight.Bold` |
| Color | `RGBA(16, 124, 16, 1)` |

67. Set **Text** (auto-calculates based on weight and method):

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
        With(
            {baseCost: Max(varMinimumCost, weight * If(method = "Resin", varResinRate, varFilamentRate))},
            "$" & Text(
                If(chkDetailsOwnMaterial.Value, baseCost * varOwnMaterialDiscount, baseCost),
                "[$-en-US]#,##0.00"
            ) & If(chkDetailsOwnMaterial.Value, " (70% off)", "")
        )
    )
)
```

---

### Own Material Checkbox (chkDetailsOwnMaterial)

67A. Click **+ Insert** ? **Checkbox** (**Classic**).
67B. **Rename it:** `chkDetailsOwnMaterial`
67C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student material (70% discount)"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 462` |
| Width | `420` |
| Height | `32` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorNeutral` |
| CheckboxBorderColor | `varInputBorderColor` |
| CheckmarkFill | `RGBA(0, 0, 0, 1)` |
| HoverColor | `RGBA(0, 18, 107, 1)` |
| Default | `varSelectedItem.StudentOwnMaterial` |

> ?? **Pre-populated from record:** The checkbox defaults to the current `StudentOwnMaterial` value saved on the request (set at approval or by a prior details edit). When toggled, it updates the saved value so downstream modals (payment) can pre-populate correctly. The cost formula above also updates in real time when checked.

---

### Transaction Number Label (lblDetailsTransLabel)

68. Click **+ Insert** → **Text label**.
69. **Rename it:** `lblDetailsTransLabel`
70. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Transaction #:"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 465` |
| Width | `130` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `!IsBlank(varSelectedItem.TransactionNumber)` |

> 💡 **Conditional visibility:** This field appears whenever a transaction number exists, regardless of status. This allows staff to correct typos even if a job has been reverted back in the workflow.

---

### Transaction Number Input (txtDetailsTransaction)

71. Click **+ Insert** → **Text input**.
72. **Rename it:** `txtDetailsTransaction`
73. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 488` |
| Width | `200` |
| Height | `36` |
| HintText | `"e.g., 123"` |
| Default | `Coalesce(varSelectedItem.TransactionNumber, "")` |
| Visible | `!IsBlank(varSelectedItem.TransactionNumber)` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

> 💡 **Why this matters:** If a transaction number was entered incorrectly during payment recording, staff can fix it here without having to undo the entire payment process. Shows on any status where a transaction exists.

---

### Cancel Button (btnDetailsCancel)

74. Click **+ Insert** → **Button**.
75. **Rename it:** `btnDetailsCancel`
76. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recDetailsModal.X + 230` |
| Y | `recDetailsModal.Y + 600` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

77. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, 0);
Set(varSelectedItem, Blank());
Reset(ddDetailsStaff);
Reset(ddDetailsSlicedOnComputer);
Reset(ddDetailsMethod);
Reset(ddDetailsPrinter);
Reset(ddDetailsColor);
Reset(txtDetailsWeight);
Reset(txtDetailsHours);
Reset(txtDetailsTransaction);
Reset(chkDetailsOwnMaterial);
Set(varDetailsComputerChanged, false)
```

---

### Save Changes Button (btnDetailsConfirm)

78. Click **+ Insert** → **Button**.
79. **Rename it:** `btnDetailsConfirm`
80. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Save Changes"` |
| X | `recDetailsModal.X + 360` |
| Y | `recDetailsModal.Y + 600` |
| Width | `170` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

81. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddDetailsStaff.Selected) &&
    (
        // At least one field must be changed
        Coalesce(ddDetailsMethod.Selected.Value, "") <> Coalesce(varSelectedItem.Method.Value, "") ||
        Coalesce(ddDetailsPrinter.Selected.Value, "") <> Coalesce(varSelectedItem.Printer.Value, "") ||
        Coalesce(ddDetailsColor.Selected.Value, "") <> Coalesce(varSelectedItem.Color.Value, "") ||
        varDetailsComputerChanged ||
        (IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) <> Coalesce(varSelectedItem.EstimatedWeight, 0)) ||
        (IsNumeric(txtDetailsHours.Text) && Value(txtDetailsHours.Text) <> Coalesce(varSelectedItem.EstimatedTime, 0)) ||
        (!IsBlank(txtDetailsTransaction.Text) && txtDetailsTransaction.Text <> Coalesce(varSelectedItem.TransactionNumber, "")) ||
        chkDetailsOwnMaterial.Value <> varSelectedItem.StudentOwnMaterial
    ),
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

> 💡 Button is enabled only when staff is selected AND at least one field is being changed (including sliced-on computer and transaction number for paid items).

> 💡 **Choice-field comparison:** Use `Coalesce(..., "")` for Method, Printer, Color, and Sliced-On Computer comparisons so the Save button still works reliably when a combo box is preloaded or when a field is blank.

82. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Saving changes...");

// Calculate new cost based on material usage and method
Set(varNewMethod, If(!IsBlank(ddDetailsMethod.Selected), ddDetailsMethod.Selected.Value, varSelectedItem.Method.Value));
Set(
    varNewPrinter,
    If(
        varNewMethod = "Resin",
        LookUp(Choices([@PrintRequests].Printer), Or(StartsWith(Value, "Form 3+"), StartsWith(Value, "Form 3 ("))),
        If(!IsBlank(ddDetailsPrinter.Selected), ddDetailsPrinter.Selected, varSelectedItem.Printer)
    )
);
Set(
    varNewSlicedOnComputer,
    If(
        !IsBlank(ddDetailsSlicedOnComputer.Selected),
        {Value: ddDetailsSlicedOnComputer.Selected.Name},
        varSelectedItem.SlicedOnComputer
    )
);
Set(varNewWeight, If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) > 0, Value(txtDetailsWeight.Text), varSelectedItem.EstimatedWeight));
Set(varNewCost, If(
    IsBlank(varNewWeight),
    varSelectedItem.EstimatedCost,
    If(
        chkDetailsOwnMaterial.Value,
        Max(varMinimumCost, varNewWeight * If(varNewMethod = "Resin", varResinRate, varFilamentRate)) * varOwnMaterialDiscount,
        Max(varMinimumCost, varNewWeight * If(varNewMethod = "Resin", varResinRate, varFilamentRate))
    )
));

// Build change description for audit
Set(varChangeDesc, "");
If(Coalesce(ddDetailsMethod.Selected.Value, "") <> Coalesce(varSelectedItem.Method.Value, ""),
    Set(varChangeDesc, "Method: " & varSelectedItem.Method.Value & " → " & ddDetailsMethod.Selected.Value));
If(Coalesce(varNewPrinter.Value, "") <> Coalesce(varSelectedItem.Printer.Value, ""),
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") & "Printer: " & 
        Trim(If(Find("(", varSelectedItem.Printer.Value) > 0, Left(varSelectedItem.Printer.Value, Find("(", varSelectedItem.Printer.Value) - 1), varSelectedItem.Printer.Value)) & 
        " → " & 
        Trim(If(Find("(", varNewPrinter.Value) > 0, Left(varNewPrinter.Value, Find("(", varNewPrinter.Value) - 1), varNewPrinter.Value))));
If(Coalesce(ddDetailsColor.Selected.Value, "") <> Coalesce(varSelectedItem.Color.Value, ""),
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") & "Color: " & varSelectedItem.Color.Value & " → " & ddDetailsColor.Selected.Value));
If(Coalesce(varNewSlicedOnComputer.Value, "") <> Coalesce(varSelectedItem.SlicedOnComputer.Value, ""),
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") & "Computer: " & Coalesce(varSelectedItem.SlicedOnComputer.Value, "(none)") & " → " & varNewSlicedOnComputer.Value));
If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) <> Coalesce(varSelectedItem.EstimatedWeight, 0),
    Set(
        varChangeDesc,
        If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") &
        If(varNewMethod = "Resin", "Volume: ", "Weight: ") &
        Text(Coalesce(varSelectedItem.EstimatedWeight, 0)) &
        If(varNewMethod = "Resin", "mL", "g") &
        " → " & txtDetailsWeight.Text &
        If(varNewMethod = "Resin", "mL", "g")
    ));
If(IsNumeric(txtDetailsHours.Text) && Value(txtDetailsHours.Text) <> Coalesce(varSelectedItem.EstimatedTime, 0),
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") & "Hours: " & Coalesce(varSelectedItem.EstimatedTime, 0) & " → " & txtDetailsHours.Text));
If(!IsBlank(txtDetailsTransaction.Text) && txtDetailsTransaction.Text <> Coalesce(varSelectedItem.TransactionNumber, ""),
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") & "Transaction#: " & Coalesce(varSelectedItem.TransactionNumber, "(none)") & " → " & txtDetailsTransaction.Text));

// Update SharePoint item
// Using LookUp to get fresh record avoids concurrency conflicts
Patch(
    PrintRequests,
    LookUp(PrintRequests, ID = varSelectedItem.ID),
    {
        Method: If(!IsBlank(ddDetailsMethod.Selected), ddDetailsMethod.Selected, varSelectedItem.Method),
        Printer: varNewPrinter,
        Color: If(!IsBlank(ddDetailsColor.Selected), ddDetailsColor.Selected, varSelectedItem.Color),
        SlicedOnComputer: varNewSlicedOnComputer,
        EstimatedWeight: If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) > 0, Value(txtDetailsWeight.Text), varSelectedItem.EstimatedWeight),
        EstimatedTime: If(IsNumeric(txtDetailsHours.Text) && Value(txtDetailsHours.Text) > 0, Value(txtDetailsHours.Text), varSelectedItem.EstimatedTime),
        EstimatedCost: varNewCost,
        StudentOwnMaterial: chkDetailsOwnMaterial.Value,
        TransactionNumber: If(!IsBlank(txtDetailsTransaction.Text) && txtDetailsTransaction.Text <> Coalesce(varSelectedItem.TransactionNumber, ""), txtDetailsTransaction.Text, varSelectedItem.TransactionNumber),
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
            If(IsBlank(LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes), "", LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes & " | "),
            "UPDATED by " & 
            With({n: ddDetailsStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
            ": [Summary] " & varChangeDesc & " [Changes] [Reason] [Context] [Comment] - " & Text(Now(), "m/d h:mmam/pm")
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
    Notify("Could not log changes.", NotificationType.Error)
);

Notify("Print details updated successfully!", NotificationType.Success);

// Close modal and reset
Set(varShowDetailsModal, 0);
Set(varSelectedItem, Blank());
Reset(ddDetailsStaff);
Reset(ddDetailsSlicedOnComputer);
Reset(ddDetailsMethod);
Reset(ddDetailsPrinter);
Reset(ddDetailsColor);
Reset(txtDetailsWeight);
Reset(txtDetailsHours);
Reset(txtDetailsTransaction);
Reset(chkDetailsOwnMaterial);
Set(varDetailsComputerChanged, false);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Cost recalculation:** When material usage or method changes, cost is automatically recalculated using: `Max(varMinimumCost, usage × rate)` where rate is `varFilamentRate` for Filament ($/g) and `varResinRate` for Resin ($/mL).

> 💡 **Transaction number editing:** The transaction number field only appears for items that have already been paid (have a TransactionNumber value). This allows staff to correct typos without undoing the entire payment.

---

# STEP 12C: Building the Payment Recording Modal

**What you're doing:** Creating a payment modal that records **one row per actual transaction** in the `Payments` list, updates the `PrintRequests` running totals, and lets staff mark completed build plates as picked up during payment.

> 🎯 **Layout approach:** Unlike some earlier modals, this one stays simple: one top-level overlay container and a single **1100px-wide** modal. Do **not** add inner left/right containers. Just place the controls directly on the modal using absolute positioning, like the earlier modal steps.

> ⚠️ **Trigger:** This modal opens when staff clicks the `"💰 Picked Up"` button on `Completed` items, or the `"💰 Partial Payment"` button on `Printing` items.

### Key Concept: Estimates vs Running Totals

| Stage | Weight Field | Cost Field | When Set |
|-------|--------------|------------|----------|
| **Estimate** | `EstimatedWeight` | `EstimatedCost` | At approval |
| **Actual running total** | `FinalWeight` | `FinalCost` | Updated after each payment |

### Control Hierarchy

```
scrDashboard
└── conPaymentModal               ← CONTAINER (set Visible here only!)
    ├── btnPaymentConfirm
    ├── btnPaymentCancel
    ├── btnAddMoreItems
    ├── chkPartialPickup
    ├── lblPlatesHint
    ├── galPlatesPickup
    │   ├── chkPlate
    │   └── lblPlateName
    ├── lblPlatesPickupHeader
    ├── recPlatesDivider
    ├── lblRemainingEst
    ├── lblPaidSoFar
    ├── galPaymentHistory
    │   ├── recHistRowBg
    │   └── lblHistSummary
    ├── lblPaymentHistoryHeader
    ├── txtPaymentNotes
    ├── lblPaymentNotesLabel
    ├── txtPayerTigerCard
    ├── lblPayerTigerCardLabel
    ├── txtPayerName
    ├── lblPayerNameLabel
    ├── chkPayerSameAsStudent
    ├── chkOwnMaterial
    ├── lblPaymentCostValue
    ├── lblPaymentCostLabel
    ├── txtPaymentWeight
    ├── lblPaymentWeightLabel
    ├── dpPaymentDate
    ├── lblPaymentDateLabel
    ├── txtPaymentTransaction
    ├── lblPaymentTransLabel
    ├── ddPaymentType
    ├── lblPaymentTypeLabel
    ├── ddPaymentStaff
    ├── lblPaymentStaffLabel
    ├── recPaymentVerticalDivider
    ├── lblPaymentStudent
    ├── btnPaymentClose
    ├── lblPaymentTitle
    ├── recPaymentModal
    └── recPaymentOverlay
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

> 💡 **Key Point:** As with the other modals, set `Visible` only on the container.

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
| Fill | `varColorOverlay` |

---

### Modal Content Box (recPaymentModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recPaymentModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 1100) / 2` |
| Y | `(Parent.Height - 680) / 2` |
| Width | `1100` |
| Height | `680` |
| Fill | `varColorBgCard` |

> 💡 **No nested layout containers:** The extra width gives plenty of room for the payment form and history panel without additional container complexity.

---

### Modal Title (lblPaymentTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblPaymentTitle`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(varSelectedItem.Status.Value = "Printing", "Partial Payment - ", "Record Payment - ") & varSelectedItem.ReqKey` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 20` |
| Width | `520` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `varColorSuccess` |

---

### Close Button (btnPaymentClose)

14. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
15. **Rename it:** `btnPaymentClose`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recPaymentModal.X + recPaymentModal.Width - 40` |
| Y | `recPaymentModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

17. Set **OnSelect:**

```powerfx
Set(varShowPaymentModal, 0);
Set(varSelectedItem, Blank());
Reset(txtPaymentTransaction);
Reset(txtPaymentWeight);
Reset(dpPaymentDate);
Reset(txtPaymentNotes);
Reset(ddPaymentStaff);
Reset(chkOwnMaterial);
Reset(chkPartialPickup);
Reset(ddPaymentType);
Reset(chkPayerSameAsStudent);
Reset(txtPayerName);
Reset(txtPayerTigerCard);
Clear(colPickedUpPlates);
Clear(colPayments)
```

---

### Student Info (lblPaymentStudent)

18. Click **+ Insert** → **Text label**.
19. **Rename it:** `lblPaymentStudent`
20. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 55` |
| Width | `520` |
| Height | `40` |
| Size | `12` |
| Color | `varColorTextMuted` |

21. Set **Text:**

```powerfx
"Student: " & varSelectedItem.Student.DisplayName & Char(10) &
"Estimated: " & Text(varSelectedItem.EstimatedWeight) &
If(varSelectedItem.Method.Value = "Resin", "mL", "g") &
" → $" &
Text(varSelectedItem.EstimatedCost, "[$-en-US]#,##0.00")
```

---

### Vertical Divider (recPaymentVerticalDivider)

22. Click **+ Insert** → **Rectangle**.
23. **Rename it:** `recPaymentVerticalDivider`
24. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 555` |
| Y | `recPaymentModal.Y + 88` |
| Width | `1` |
| Height | `btnPaymentCancel.Y - recPaymentVerticalDivider.Y - 18` |
| Fill | `varColorBorderLight` |
| Visible | `CountRows(colPayments) > 0 Or CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0 Or !IsBlank(varSelectedItem.FinalCost)` |

---

### Staff Label (lblPaymentStaffLabel)

25. Click **+ Insert** → **Text label**.
26. **Rename it:** `lblPaymentStaffLabel`
27. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 110` |
| Width | `240` |
| Height | `29` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |

---

### Staff Dropdown (ddPaymentStaff)

28. Click **+ Insert** → **Combo box** (**Classic**).
29. **Rename it:** `ddPaymentStaff`
30. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 135` |
| Width | `240` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberEmail"]` |
| DefaultSelectedItems | `Blank()` |
| IsSearchable | `false` |
| SelectMultiple | `false` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

---

### Payment Type Label (lblPaymentTypeLabel)

31. Click **+ Insert** → **Text label**.
32. **Rename it:** `lblPaymentTypeLabel`
33. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payment Type"` |
| X | `recPaymentModal.X + 280` |
| Y | `recPaymentModal.Y + 110` |
| Width | `180` |
| Height | `29` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |

---

### Payment Type Dropdown (ddPaymentType)

34. Click **+ Insert** → **Drop down** (**Classic**).
35. **Rename it:** `ddPaymentType`
36. Set properties:

| Property | Value |
|----------|-------|
| Items | `["TigerCASH", "Check", "Grant/Program Code"]` |
| X | `recPaymentModal.X + 280` |
| Y | `recPaymentModal.Y + 135` |
| Width | `180` |
| Height | `36` |
| Default | `"TigerCASH"` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

> 💡 **Payment types:** `TigerCASH` for standard campus payments, `Check` for checks, and `Grant/Program Code` for grants/program codes.

---

### Transaction Label (lblPaymentTransLabel)

37. Click **+ Insert** → **Text label**.
38. **Rename it:** `lblPaymentTransLabel`
39. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 190` |
| Width | `240` |
| Height | `29` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |

40. Set **Text:**

```powerfx
Switch(
    ddPaymentType.Selected.Value,
    "TigerCASH", "Transaction #",
    "Check", "Check #",
    "Grant/Program Code", "Grant/Program Code",
    "Transaction #"
)
```

---

### Transaction Input (txtPaymentTransaction)

41. Click **+ Insert** → **Text input** (**Classic**).
42. **Rename it:** `txtPaymentTransaction`
43. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 215` |
| Width | `240` |
| Height | `36` |
| Format | `TextFormat.Text` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

44. Set **HintText:**

```powerfx
Switch(
    ddPaymentType.Selected.Value,
    "TigerCASH", "TigerCASH receipt number",
    "Check", "Check number",
    "Grant/Program Code", "Leave blank if code is unknown",
    "Receipt or reference number"
)
```

> 💡 **Important:** This field is `TextFormat.Text`, not number-only. Checks and grant/program codes may contain letters.
>
> 💡 **Pending-code workflow:** For `Grant/Program Code` payments, staff should be able to save the transaction even if the grant/program code is not known yet. Store the payment row with a blank `TransactionNumber` and fill it in later when accounting provides the code.

---

### Date Label (lblPaymentDateLabel)

45. Click **+ Insert** → **Text label**.
46. **Rename it:** `lblPaymentDateLabel`
47. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payment Date"` |
| X | `recPaymentModal.X + 280` |
| Y | `recPaymentModal.Y + 190` |
| Width | `180` |
| Height | `29` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |

---

### Date Picker (dpPaymentDate)

48. Click **+ Insert** → **Date picker** (**Classic**).
49. **Rename it:** `dpPaymentDate`
50. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 280` |
| Y | `recPaymentModal.Y + 215` |
| Width | `180` |
| Height | `36` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| IconBackground | `varChevronBackground` |
| IconFill | `RGBA(255, 255, 255, 1)` |

---

### Weight Label (lblPaymentWeightLabel)

51. Click **+ Insert** → **Text label**.
52. **Rename it:** `lblPaymentWeightLabel`
53. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 270` |
| Width | `250` |
| Height | `33` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |

53A. Set **Text:**

```powerfx
If(
    varSelectedItem.Method.Value = "Resin",
    "Final Resin Weight (g)",
    With(
        {
            varRemainingWeight: Max(0, varSelectedItem.EstimatedWeight - Coalesce(varSelectedItem.FinalWeight, 0))
        },
        If(
            IsNumeric(txtPaymentWeight.Text) && Value(txtPaymentWeight.Text) > 0 &&
            !IsBlank(varRemainingWeight) && varRemainingWeight > 0 &&
            Abs(Value(txtPaymentWeight.Text) - varRemainingWeight) / varRemainingWeight > 0.5,
            "⚠️ Weight (" & Text(Round(Value(txtPaymentWeight.Text) / varRemainingWeight * 100, 0)) & "% of remaining)",
            "Final Weight"
        )
    )
)
```

53B. Set **Color:**

```powerfx
If(
    varSelectedItem.Method.Value = "Resin",
    varColorText,
    With(
        {
            varRemainingWeight: Max(0, varSelectedItem.EstimatedWeight - Coalesce(varSelectedItem.FinalWeight, 0))
        },
        If(
            IsNumeric(txtPaymentWeight.Text) && Value(txtPaymentWeight.Text) > 0 &&
            !IsBlank(varRemainingWeight) && varRemainingWeight > 0 &&
            Abs(Value(txtPaymentWeight.Text) - varRemainingWeight) / varRemainingWeight > 0.5,
            varColorWarning,
            varColorText
        )
    )
)
```

> ⚠️ **Sanity check:** Filament entries switch to a warning when entered weight deviates more than 50% from the **remaining weight** (original estimate minus already-picked-up weight). For partial pickups, this ensures the warning reflects what's left, not the original estimate. Resin estimates are stored in `mL`, so the pickup field stays grams-only and skips that direct comparison.

---

### Weight Input (txtPaymentWeight)

54. Click **+ Insert** → **Text input** (**Classic**).
55. **Rename it:** `txtPaymentWeight`
56. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 295` |
| Width | `150` |
| Height | `36` |
| Format | `TextFormat.Number` |
| HintText | `"Weight in grams"` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

---

### Cost Label (lblPaymentCostLabel)

57. Click **+ Insert** → **Text label**.
58. **Rename it:** `lblPaymentCostLabel`
59. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Final Cost:"` |
| X | `recPaymentModal.X + 190` |
| Y | `recPaymentModal.Y + 270` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Height | `25` |
| Size | `14` |

---

### Cost Value Display (lblPaymentCostValue)

60. Click **+ Insert** → **Text label**.
61. **Rename it:** `lblPaymentCostValue`
62. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 190` |
| Y | `recPaymentModal.Y + 292` |
| Width | `270` |
| Height | `42` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `24` |
| Color | `varColorSuccess` |

63. Set **Text:**

```powerfx
If(
    IsNumeric(txtPaymentWeight.Text) && Value(txtPaymentWeight.Text) > 0,
    With(
        {
            baseCost: Max(
                varMinimumCost,
                Value(txtPaymentWeight.Text) * If(
                    varSelectedItem.Method.Value = "Resin",
                    varResinGramRate,
                    varFilamentRate
                )
            )
        },
        "$" & Text(
            If(chkOwnMaterial.Value, baseCost * varOwnMaterialDiscount, baseCost),
            "[$-en-US]#,##0.00"
        ) & If(chkOwnMaterial.Value, " (70% off)", "")
    ),
    "$" & Text(varMinimumCost, "[$-en-US]#,##0.00") & " (minimum)"
)
```

> 💰 **Pricing:** Uses the same centralized pricing variables from `App.OnStart`.

---

### Own Material Checkbox (chkOwnMaterial)

64. Click **+ Insert** → **Checkbox** (**Classic**).
65. **Rename it:** `chkOwnMaterial`
66. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student provided own material (70% discount)"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 350` |
| Width | `420` |
| Height | `32` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorNeutral` |
| CheckboxBorderColor | `varInputBorderColor` |
| CheckmarkFill | `RGBA(0, 0, 0, 1)` |
| HoverColor | `RGBA(0, 18, 107, 1)` |
| Default | `varSelectedItem.StudentOwnMaterial` |

> 💡 **Pre-populated from record:** Defaults to the StudentOwnMaterial value saved at approval or via the Change Print Details modal. Staff can still toggle it here — this value is what gets written to the Payments ledger via Flow H.

---

### Payer Same-As-Student Checkbox (chkPayerSameAsStudent)

67. Click **+ Insert** → **Checkbox** (**Classic**).
68. **Rename it:** `chkPayerSameAsStudent`
69. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payer is the student on this request"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 390` |
| Width | `420` |
| Height | `32` |
| Default | `true` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorNeutral` |
| CheckboxBorderColor | `varInputBorderColor` |

---

### Payer Name Label (lblPayerNameLabel)

70. Click **+ Insert** → **Text label**.
71. **Rename it:** `lblPayerNameLabel`
72. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payer Name"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 430` |
| Width | `200` |
| Height | `20` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |

---

### Payer Name Input (txtPayerName)

73. Click **+ Insert** → **Text input** (**Classic**).
74. **Rename it:** `txtPayerName`
75. Set properties:

| Property | Value |
|----------|-------|
| Default | `If(chkPayerSameAsStudent.Value, varSelectedItem.Student.DisplayName, "")` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 455` |
| Width | `420` |
| Height | `36` |
| DisplayMode | `If(chkPayerSameAsStudent.Value, DisplayMode.Disabled, DisplayMode.Edit)` |
| HintText | `"Who is paying?"` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

---

### Payer Tiger Card Label (lblPayerTigerCardLabel)

76. Click **+ Insert** → **Text label**.
77. **Rename it:** `lblPayerTigerCardLabel`
78. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payer Tiger Card"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 510` |
| Width | `200` |
| Height | `20` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |

---

### Payer Tiger Card Input (txtPayerTigerCard)

79. Click **+ Insert** → **Text input** (**Classic**).
80. **Rename it:** `txtPayerTigerCard`
81. Set properties:

| Property | Value |
|----------|-------|
| Default | `If(chkPayerSameAsStudent.Value, varSelectedItem.TigerCardNumber, "")` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 535` |
| Width | `420` |
| Height | `36` |
| DisplayMode | `If(chkPayerSameAsStudent.Value, DisplayMode.Disabled, DisplayMode.Edit)` |
| HintText | `"TigerCard number"` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

---

### Notes Label (lblPaymentNotesLabel)

82. Click **+ Insert** → **Text label**.
83. **Rename it:** `lblPaymentNotesLabel`
84. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(varSelectedItem.Status.Value = "Printing", "Partial Payment Notes", "Payment Notes")` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 585` |
| Width | `420` |
| Height | `20` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |

> 💡 **Note:** `txtPaymentNotes` is optional free-text context for staff and audit logging. It is **not** the payment history source anymore; payment history comes from the `Payments` list.

---

### Notes Text Input (txtPaymentNotes)

85. Click **+ Insert** → **Text input** (**Classic**).
86. **Rename it:** `txtPaymentNotes`
87. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 610` |
| Width | `420` |
| Height | `45` |
| HintText | `"Any discrepancies, exceptions, or staff notes..."` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |

> 🧹 **Remove legacy control:** If you still have an older `txtPaymentHistory` text box from a previous draft of this modal, delete it. Payment history should come only from `galPaymentHistory` bound to the `Payments` list.

---

### Payment History Header (lblPaymentHistoryHeader)

88. Click **+ Insert** → **Text label**.
89. **Rename it:** `lblPaymentHistoryHeader`
90. Set properties:

| Property | Value |
|----------|-------|
| Text | `"PAYMENT HISTORY"` |
| X | `recPaymentModal.X + 590` |
| Y | `recPaymentModal.Y + 110` |
| Width | `460` |
| Height | `24` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `varColorText` |
| Visible | `CountRows(colPayments) > 0` |

---

### Payment History Gallery (galPaymentHistory)

91. Click **+ Insert** → **Vertical gallery**.
92. **Rename it:** `galPaymentHistory`
93. Set properties:

| Property | Value |
|----------|-------|
| Items | `colPayments` |
| X | `recPaymentModal.X + 590` |
| Y | `lblPaymentHistoryHeader.Y + lblPaymentHistoryHeader.Height + 4` |
| Width | `460` |
| Height | `Min(98, CountRows(colPayments) * 32 + 2)` |
| TemplateSize | `32` |
| TemplatePadding | `0` |
| Fill | `Color.Transparent` |
| ShowScrollbar | `false` |
| Visible | `CountRows(colPayments) > 0` |

94. Use a **blank vertical gallery layout** for this control, or delete any stock template controls that Power Apps inserts automatically. This history row is a single compact line, not the default gallery layout.

95. Inside the `galPaymentHistory` **template**, add these two controls:

> 💡 **Important:** These controls are placed **inside the gallery row template**. They are **not** separate controls placed directly on the modal canvas. Insert each one while `galPaymentHistory` is selected and you are editing the template.

| Control | Property | Value |
|---------|----------|-------|
| `recHistRowBg` | X | `0` |
| `recHistRowBg` | Y | `1` |
| `recHistRowBg` | Width | `448` |
| `recHistRowBg` | Height | `28` |
| `recHistRowBg` | Fill | `RGBA(219, 219, 219, 1)` |
| `lblHistSummary` | X | `10` |
| `lblHistSummary` | Y | `5` |
| `lblHistSummary` | Width | `432` |
| `lblHistSummary` | Height | `18` |
| `lblHistSummary` | Font | `varAppFont` |
| `lblHistSummary` | Size | `10` |
| `lblHistSummary` | Wrap | `false` |

96. Set `lblHistSummary.Text`:

```powerfx
If(
    !IsBlank(ThisItem.RecordedAt),
    Text(ThisItem.RecordedAt, "[$-en-US]mm/dd/yyyy h:mm AM/PM"),
    Text(ThisItem.PaymentDate, "[$-en-US]mm/dd/yyyy")
) &
If(
    IsBlank(Trim(Coalesce(ThisItem.TransactionNumber, ""))),
    "",
    " · #" & Trim(ThisItem.TransactionNumber)
) &
" · " & Text(Coalesce(ThisItem.DisplayWeight, ThisItem.Weight)) & "g" &
" · " & Text(Coalesce(ThisItem.DisplayAmount, ThisItem.Amount), "[$-en-US]$#,##0.00") &
With(
    {
        wPlateText: Trim(Coalesce(ThisItem.DisplayPlatesPickedUp, ThisItem.PlatesPickedUp, ""))
    },
    If(
        IsBlank(wPlateText),
        "",
        With(
            {
                wPlateParts: Filter(
                    Split(Substitute(wPlateText, " ", ""), ",") As platePart,
                    !IsBlank(platePart.Value)
                )
            },
            With(
                {
                    wPlateCount: CountRows(wPlateParts),
                    wMinPlate: Min(wPlateParts, Value(Value)),
                    wMaxPlate: Max(wPlateParts, Value(Value))
                },
                " · " &
                If(wPlateCount = 1, "Plate ", "Plates ") &
                If(
                    wPlateCount > 1 && wPlateCount = wMaxPlate - wMinPlate + 1,
                    Text(wMinPlate) & "-" & Text(wMaxPlate),
                    Concat(wPlateParts As platePart, platePart.Value, ",")
                )
            )
        )
    )
) &
If(
    !IsBlank(ThisItem.RecordedBy.DisplayName),
    " · " & ThisItem.RecordedBy.DisplayName,
    ""
)
```

> 💡 **Source of truth:** This gallery reads from the `Payments` list. Do not parse payment history out of `PrintRequests.PaymentNotes`.
>
> 💡 **Ordering rule:** Sort by `RecordedAt` when available so same-day transactions stay in the exact order they were entered. Fall back to `PaymentDate` for legacy rows that predate the timestamp field.
>
> 💡 **Layout rule:** Everything in the right column below this gallery should be positioned from the control above it, not from a fixed `Y` value. That keeps the modal layout stable whether history is shown or hidden.
>
> 💡 **Visual target:** Each payment should render as one compact gray row with inline `·` separators, matching the generated mockup. Avoid multi-line stacked labels here unless you intentionally redesign the row.
>
> 💡 **Plate formatting rule:** Show `Plate 4` for one plate, `Plates 1-3` for consecutive ranges, and `Plates 1,3,5` for non-consecutive pickups.
>
> ⚠️ **Durability rule:** `PlatesPickedUp` is a human-readable display snapshot only. Store the best available pickup-time keys in `Payments.PlateIDsPickedUp`, but treat the `Payments` row itself as the canonical financial record if plates are later re-sliced, replaced, relabeled, or renumbered.

---

### Paid So Far Label (lblPaidSoFar)

95. Click **+ Insert** → **Text label**.
96. **Rename it:** `lblPaidSoFar`
97. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 590` |
| Y | `If(galPaymentHistory.Visible, galPaymentHistory.Y + galPaymentHistory.Height + 8, recPaymentModal.Y + 110)` |
| Width | `460` |
| Height | `20` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `varColorSuccess` |

98. Set **Text:**

```powerfx
"Paid so far: " &
Text(
    If(CountRows(colPayments) > 0, Sum(colPayments, DisplayWeight), Coalesce(varSelectedItem.FinalWeight, 0))
) & "g · " &
Text(
    If(CountRows(colPayments) > 0, Sum(colPayments, DisplayAmount), Coalesce(varSelectedItem.FinalCost, 0)),
    "[$-en-US]$#,##0.00"
)
```

---

### Remaining Estimate Label (lblRemainingEst)

99. Click **+ Insert** → **Text label**.
100. **Rename it:** `lblRemainingEst`
101. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 590` |
| Y | `lblPaidSoFar.Y + lblPaidSoFar.Height + 4` |
| Width | `460` |
| Height | `20` |
| Font | `varAppFont` |
| Size | `11` |
| Color | `varColorTextMuted` |

102. Set **Text:**

```powerfx
With(
    {
        wPaidWeight: If(CountRows(colPayments) > 0, Sum(colPayments, DisplayWeight), Coalesce(varSelectedItem.FinalWeight, 0))
    },
    If(
        varSelectedItem.Method.Value = "Resin",
        "Estimate: " & Text(varSelectedItem.EstimatedWeight) & "mL → " &
        Text(varSelectedItem.EstimatedCost, "[$-en-US]$#,##0.00") &
        " · Pickup billed from grams",
        "Remaining: ~" & Text(Max(0, varSelectedItem.EstimatedWeight - wPaidWeight)) & "g · " &
        Text(
            Max(
                0,
                (varSelectedItem.EstimatedWeight - wPaidWeight) * varFilamentRate
            ),
            "[$-en-US]$#,##0.00"
        )
    )
)
```

> Use `EstimatedWeight` here to match the `PrintRequests` schema documented throughout this spec. For resin, that numeric field stores slicer volume in `mL`.

---

### Plates Divider (recPlatesDivider)

103. Click **+ Insert** → **Rectangle**.
104. **Rename it:** `recPlatesDivider`
105. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 590` |
| Y | `lblRemainingEst.Y + lblRemainingEst.Height + 12` |
| Width | `460` |
| Height | `1` |
| Fill | `varColorBorderLight` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

---

### Plates Pickup Header (lblPlatesPickupHeader)

106. Click **+ Insert** → **Text label**.
107. **Rename it:** `lblPlatesPickupHeader`
108. Set properties:

| Property | Value |
|----------|-------|
| Text | `"PLATES BEING PICKED UP"` |
| X | `recPaymentModal.X + 590` |
| Y | `recPlatesDivider.Y + recPlatesDivider.Height + 12` |
| Width | `460` |
| Height | `24` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `varColorText` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

---

### Plates Pickup Gallery (galPlatesPickup)

109. Click **+ Insert** → **Vertical gallery**.
110. **Rename it:** `galPlatesPickup`
111. Set properties:

| Property | Value |
|----------|-------|
| Items | `Filter(colBuildPlatesIndexed, Status.Value = "Completed")` |
| X | `recPaymentModal.X + 590` |
| Y | `lblPlatesPickupHeader.Y + lblPlatesPickupHeader.Height + 4` |
| Width | `460` |
| Height | `Min(170, CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) * 36)` |
| TemplateSize | `34` |
| TemplatePadding | `2` |
| Fill | `RGBA(248, 249, 250, 1)` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

112. Inside the template, add a checkbox named `chkPlate` and a label named `lblPlateName`.

113. Set `chkPlate` properties:

| Property | Value |
|----------|-------|
| X | `4` |
| Y | `2` |
| Width | `20` |
| Height | `28` |
| Default | `ThisItem.ID in colPickedUpPlates.ID` |

114. Set `chkPlate.OnCheck`:

```powerfx
If(
    !(ThisItem.ID in colPickedUpPlates.ID),
    Collect(colPickedUpPlates, ThisItem)
)
```

115. Set `chkPlate.OnUncheck`:

```powerfx
Remove(colPickedUpPlates, ThisItem)
```

> 💡 **Deduping rule:** Guard `OnCheck` with the `ID in colPickedUpPlates.ID` test so repeated checkbox refreshes or gallery re-renders do not collect the same plate twice. Step 12C also dedupes again during save and sorts by `ID` before generating the display-only `PlatesPickedUp` text plus the stable `PlateIDsPickedUp` value.

116. Set `lblPlateName` properties:

| Property | Value |
|----------|-------|
| X | `30` |
| Y | `6` |
| Width | `410` |
| Height | `22` |
| Font | `varAppFont` |
| Size | `10` |

117. Set `lblPlateName.Text`:

```powerfx
ThisItem.ResolvedPlateLabel &
" · " &
Trim(
    If(
        Find("(", ThisItem.Machine.Value) > 0,
        Left(ThisItem.Machine.Value, Find("(", ThisItem.Machine.Value) - 2),
        ThisItem.Machine.Value
    )
)
```

---

### Plates Hint (lblPlatesHint)

118. Click **+ Insert** → **Text label**.
119. **Rename it:** `lblPlatesHint`
120. Set properties:

| Property | Value |
|----------|-------|
| Text | `"(Only completed plates shown)"` |
| X | `recPaymentModal.X + 590` |
| Y | `galPlatesPickup.Y + galPlatesPickup.Height + 4` |
| Width | `460` |
| Height | `16` |
| Font | `varAppFont` |
| Size | `9` |
| OnSelect | `Blank()` |
| Color | `varColorTextMuted` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

---

### Partial Pickup Checkbox (chkPartialPickup)

121. Click **+ Insert** → **Checkbox** (**Classic**).
122. **Rename it:** `chkPartialPickup`
123. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Partial Pickup — Student will return for remaining items"` |
| X | `recPaymentModal.X + 590` |
| Y | `btnPaymentConfirm.Y - Self.Height - 8` |
| Width | `460` |
| Height | `32` |
| Font | `varAppFont` |
| Italic | `true` |
| Color | `varColorNeutral` |
| CheckboxBorderColor | `varInputBorderColor` |
| CheckmarkFill | `RGBA(0, 0, 0, 1)` |
| HoverColor | `RGBA(0, 18, 107, 1)` |
| Visible | `varSelectedItem.Status.Value = "Completed"` |

> ⚠️ **Behavior:** If the modal is opened from `Printing`, the payment is automatically partial and this checkbox stays hidden.

---

### Add More Items Button (btnAddMoreItems)

124. Click **+ Insert** → **Button** (**Classic**).
125. **Rename it:** `btnAddMoreItems`
126. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Add More Items"` |
| X | `recPaymentModal.X + 590` |
| Y | `recPaymentModal.Y + recPaymentModal.Height - Self.Height - 20` |
| Width | `140` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `varSelectedItem.Status.Value = "Completed"` |

127. Set **OnSelect:**

```powerfx
If(
    !(varSelectedItem.ID in colBatchItems.ID),
    If(
        CountRows(colBatchItems) = 0,
        Collect(colBatchItems, varSelectedItem),
        If(
            varSelectedItem.Method.Value = First(colBatchItems).Method.Value,
            Collect(colBatchItems, varSelectedItem),
            Notify(
                "Cannot mix Filament and Resin in one batch. Clear the batch or remove jobs until only one print method remains.",
                NotificationType.Warning
            )
        )
    )
);
Set(varBatchSelectMode, true);
Set(varShowPaymentModal, 0);
Set(varSelectedItem, Blank());
Reset(txtPaymentTransaction);
Reset(txtPaymentWeight);
Reset(dpPaymentDate);
Reset(txtPaymentNotes);
Reset(ddPaymentStaff);
Reset(chkOwnMaterial);
Reset(chkPartialPickup);
Reset(ddPaymentType);
Reset(chkPayerSameAsStudent);
Reset(txtPayerName);
Reset(txtPayerTigerCard);
Clear(colPickedUpPlates);
Clear(colPayments);
Notify("Batch mode enabled. Select more Completed items, then click 'Process Batch Payment'.", NotificationType.Information)
```

> ⚠️ **Batch contract:** Once staff switches into batch mode, they are building a **final pickup** across multiple completed requests. For any selected request that has build plates, batch processing will mark **all remaining eligible completed plates** as `Picked Up`. If staff needs to pick up only some of a request's completed plates, they must stay in the single-request Payment Modal instead of batch mode.
>
> 💡 **Deduping safeguard:** `btnAddMoreItems` uses an `ID` guard so the same request cannot be appended twice through the modal path.

---

### Cancel Button (btnPaymentCancel)

128. Click **+ Insert** → **Button** (**Classic**).
129. **Rename it:** `btnPaymentCancel`
130. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `btnPaymentConfirm.X - Self.Width - 20` |
| Y | `recPaymentModal.Y + recPaymentModal.Height - Self.Height - 20` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

131. Set **OnSelect:**

```powerfx
Set(varShowPaymentModal, 0);
Set(varSelectedItem, Blank());
Reset(txtPaymentTransaction);
Reset(txtPaymentWeight);
Reset(dpPaymentDate);
Reset(txtPaymentNotes);
Reset(ddPaymentStaff);
Reset(chkOwnMaterial);
Reset(chkPartialPickup);
Reset(ddPaymentType);
Reset(chkPayerSameAsStudent);
Reset(txtPayerName);
Reset(txtPayerTigerCard);
Clear(colPickedUpPlates);
Clear(colPayments)
```

---

### Confirm Payment Button (btnPaymentConfirm)

132. Click **+ Insert** → **Button** (**Classic**).
133. **Rename it:** `btnPaymentConfirm`
134. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(chkPartialPickup.Value, "Record Partial Payment", "Record Payment")` |
| X | `recPaymentModal.X + recPaymentModal.Width - Self.Width - 30` |
| Y | `recPaymentModal.Y + recPaymentModal.Height - Self.Height - 20` |
| Width | `130` |
| Height | `varBtnHeight` |
| Fill | `If(chkPartialPickup.Value, varColorWarning, varColorSuccess)` |
| Color | `Color.White` |
| HoverFill | `If(chkPartialPickup.Value, ColorFade(varColorWarning, -15%), ColorFade(varColorSuccess, -15%))` |
| PressedFill | `If(chkPartialPickup.Value, ColorFade(varColorWarning, -25%), ColorFade(varColorSuccess, -25%))` |
| BorderColor | `ColorFade(Self.Fill, -15%)` |
| BorderThickness | `1` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

135. Set **DisplayMode:**

```powerfx
If(
    IsBlank(ddPaymentStaff.Selected) ||
    IsBlank(ddPaymentType.Selected.Value) ||
    (ddPaymentType.Selected.Value = "TigerCASH" && IsBlank(Trim(txtPaymentTransaction.Text))) ||
    !IsNumeric(txtPaymentWeight.Text) ||
    Value(txtPaymentWeight.Text) <= 0 ||
    (
        !chkPayerSameAsStudent.Value &&
        (
            IsBlank(Trim(txtPayerName.Text)) ||
            IsBlank(Trim(txtPayerTigerCard.Text))
        )
    ) ||
    (
        CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0 &&
        CountRows(colPickedUpPlates) = 0
    ),
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```

> 💡 Button is enabled only when staff is selected, transaction info is valid, payer info is complete, and at least one completed plate is checked when the plate pickup list is shown. Transaction number is required for TigerCASH payments but optional for Check and Grant/Program Code payments, since grant codes are not always available at the time of payment.
>
> 💡 **Grant/Program Code payments:** Treat a blank `TransactionNumber` as "code pending", not as a validation failure.

136. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Recording payment...");

// Build plate snapshot texts from checked plates
Set(
    varPickedPlatesText,
    Concat(
        SortByColumns(
            ForAll(
                Distinct(colPickedUpPlates, ID) As pickedPlateId,
                LookUp(colPickedUpPlates, ID = pickedPlateId.Value)
            ),
            "ID",
            SortOrder.Ascending
        ),
        ResolvedPlateLabel,
        ", "
    )
);
Set(
    varPickedPlateIDsText,
    Concat(
        SortByColumns(
            ForAll(
                Distinct(colPickedUpPlates, ID) As pickedPlateId,
                LookUp(colPickedUpPlates, ID = pickedPlateId.Value)
            ),
            "ID",
            SortOrder.Ascending
        ),
        PlateKey,
        ", "
    )
);
Set(
    varPickedPlateIDsList,
    Concat(
        SortByColumns(
            ForAll(
                Distinct(colPickedUpPlates, ID) As pickedPlateId,
                LookUp(colPickedUpPlates, ID = pickedPlateId.Value)
            ),
            "ID",
            SortOrder.Ascending
        ),
        Text(ID),
        ", "
    )
);

// Calculate cost locally for audit message
Set(varBaseCost,
    Max(
        varMinimumCost,
        Value(txtPaymentWeight.Text) *
        If(varSelectedItem.Method.Value = "Resin", varResinGramRate, varFilamentRate)
    )
);
Set(varFinalCost, If(chkOwnMaterial.Value, varBaseCost * varOwnMaterialDiscount, varBaseCost));

// Call Flow H to handle all writes server-side
Set(
    varFlowResult,
    'Flow-(H)-Payment-SaveSingle'.Run(
        varSelectedItem.ID,
        Value(txtPaymentWeight.Text),
        varFilamentRate,
        varResinGramRate,
        varMinimumCost,
        varOwnMaterialDiscount,
        If(IsBlank(Trim(txtPaymentTransaction.Text)), "", Trim(txtPaymentTransaction.Text)),
        ddPaymentType.Selected.Value,
        If(chkPayerSameAsStudent.Value, varSelectedItem.Student.DisplayName, txtPayerName.Text),
        If(chkPayerSameAsStudent.Value, varSelectedItem.TigerCardNumber, txtPayerTigerCard.Text),
        ddPaymentStaff.Selected.MemberEmail,
        ddPaymentStaff.Selected.MemberName,
        varPickedPlateIDsList,
        varPickedPlatesText,
        varPickedPlateIDsText,
        If(IsBlank(Trim(txtPaymentNotes.Text)), " ", Trim(txtPaymentNotes.Text)),
        chkOwnMaterial.Value,
        chkPartialPickup.Value,
        Text(dpPaymentDate.SelectedDate, "yyyy-mm-dd")
    )
);

// Success output may be boolean true or the string "true"/"True" depending on flow serialization — strict = "true" misses "True" and wrongly shows Notify(..., Error) with the success message.
If(
    Or(
        varFlowResult.success = true,
        Lower(Trim(Coalesce(Text(varFlowResult.success), ""))) = "true"
    ),

    // === SUCCESS PATH ===
    Concurrent(
        Refresh(PrintRequests),
        Refresh(BuildPlates),
        Refresh(Payments)
    );
    ClearCollect(colAllBuildPlates, BuildPlates);
    ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}));
    ClearCollect(colAllPayments, Payments);
    Set(varSelectedItem, LookUp(PrintRequests, ID = varSelectedItem.ID));

    With(
        {
            wResultStatus: If(
                !IsBlank(varSelectedItem),
                varSelectedItem.Status.Value,
                "Unknown"
            )
        },
        With(
            {
                wAudit: IfError(
                    'Flow-(C)-Action-LogAction'.Run(
                        Text(varSelectedItem.ID),
                        If(wResultStatus = "Paid & Picked Up", "Status Change", "Partial Payment"),
                        If(wResultStatus = "Paid & Picked Up", "Status", "Payment"),
                        "Payment: " & Text(varFinalCost, "[$-en-US]$#,##0.00") &
                        If(
                            !IsBlank(varPickedPlateIDsText),
                            " (Plate IDs " & varPickedPlateIDsText & " | Display " & varPickedPlatesText & ")",
                            ""
                        ) &
                        If(!IsBlank(txtPaymentNotes.Text), " - " & txtPaymentNotes.Text, ""),
                        ddPaymentStaff.Selected.MemberEmail
                    ),
                    Blank()
                )
            },
            If(
                IsBlank(wAudit),
                Notify("Payment saved, but could not log to audit.", NotificationType.Warning)
            )
        )
    );

    Set(varShowPaymentModal, 0);
    Set(varSelectedItem, Blank());
    Reset(txtPaymentTransaction);
    Reset(txtPaymentWeight);
    Reset(dpPaymentDate);
    Reset(txtPaymentNotes);
    Reset(ddPaymentStaff);
    Reset(chkOwnMaterial);
    Reset(chkPartialPickup);
    Reset(ddPaymentType);
    Reset(chkPayerSameAsStudent);
    Reset(txtPayerName);
    Reset(txtPayerTigerCard);
    Clear(colPickedUpPlates);
    Clear(colPayments);
    Notify("Payment recorded!", NotificationType.Success),

    // === FAILURE PATH ===
    Notify(varFlowResult.message, NotificationType.Error)
);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> ⚠️ **Server-side save architecture:** As of the Payment Strengthening Phase, all writes (`Payments`, `BuildPlates`, `PrintRequests`) are handled by `Flow-(H)-Payment-SaveSingle` in Power Automate. The app only collects inputs, calls the flow, and displays the result. See `PowerAutomate/Flow-(H)-Payment-SaveSingle.md` for the full server-side implementation. **Payment date:** pass **`Text(dpPaymentDate.SelectedDate, "yyyy-mm-dd")`** into the flow’s last argument so the trigger’s **Text** `PaymentDate` matches the flow spec; Flow H parses it with **inline `parseDateTime`** on the actions that need a datetime (**no Compose** — same pattern as Flow I).

> **Power Fx date format:** In **`Text( date, format )`**, the month token is **lowercase `mm`**. Using **`"yyyy-MM-dd"`** (uppercase **`MM`**) emits the **literal characters** `MM` (e.g. **`2026-MM-02`**), which **`parseDateTime`** in the flow rejects. Use **`"yyyy-mm-dd"`** so the value is a real ISO-style string (e.g. **`2026-04-02`**).

### Troubleshooting: After adding Flow H / Flow I (App Checker errors)

| App Checker message | Typical cause | Fix |
|---------------------|---------------|-----|
| **No type found for `varIsBatchSelected`** | Variable name not in this spec; referenced in a formula but never initialized | **Preferred:** Remove it and use **`varBatchSelectMode`** (already set in App.OnStart). **Or** add `Set(varIsBatchSelected, false);` to App.OnStart if you intentionally keep a separate flag. |
| **No type found for `varPaymentSelected`** | Same — not part of this guide | **Preferred:** Use **`varSelectedItem`** (PrintRequests row for the single-payment modal). **Or** if you meant a Boolean, add `Set(varPaymentSelected, false);` to OnStart. Do not use ambiguous names that duplicate `varSelectedItem`. |
| **No type found for `varBatchRecordedAt` / `varPaymentRecordedAt`** | `Set(varX, Blank())` does **not** give a **DateTime** type; App Checker cannot infer the variable type. | In App.OnStart use **`Set(varBatchRecordedAt, Now());`** and **`Set(varPaymentRecordedAt, Now());`** (this spec), or any other **typed** `DateTime` literal. Only use `IsBlank` on these if you switch to a separate “has value” flag. |
| **Invalid argument type (Boolean). Expecting a Record** / **`IfError` has invalid arguments** | `Notify(...)` returns a **Boolean**. `'Flow-(C)-Action-LogAction'.Run(...)` returns a **Record**. Using **`IfError(Run, Notify)`** mixes types and fails under strict checking. | Use **`IfError(Run(...), Blank())`** inside a **`With({ wAudit: ... }, If(IsBlank(wAudit), Notify(...)))`** — same pattern as batch audit logging in **`btnBatchPaymentConfirm`**. |
| **Invalid argument type (Boolean). Expecting a Record** / **Filter has invalid arguments** | `Filter`’s first argument must be a **table/collection**, not `true`/`false`. Often happens when an **`If(...)`** branch returns a Boolean instead of a table, e.g. `If(x, Filter(col, ...), false)` or `Filter(If(x, true, col), ...)`. | Make **both** branches of `If` return the same kind of value (both tables, or both records). Ensure `Filter( *first arg* , ...)` is never `Filter(chkSomething.Value, ...)` or `Filter(varBatchSelectMode, ...)`. |
| **Flow name errors** | Flow title in Power Automate does not match the formula | In **Data** → flow must appear as **`Flow-(H)-Payment-SaveSingle`** and **`Flow-(I)-Payment-SaveBatch`**, or change the quoted name in every `'...'.Run(` to match **exactly** (including spelling and hyphens). |
| **`TriggerInputSchemaMismatch`** / *String `M/D/YYYY` does not validate against format `date`* | The flow trigger still has **PaymentDate** as type **Date** while Power Apps sends a **locale** date string, or the app still passes **`SelectedDate`** instead of an ISO string | Align with **`Flow-(H)-Payment-SaveSingle.md`** / **`Flow-(I)-Payment-SaveBatch.md`**: trigger **PaymentDate** = **Text**; app passes **`Text(dpPaymentDate.SelectedDate, "yyyy-mm-dd")`** (single) or **`Text(dpBatchPaymentDate.SelectedDate, "yyyy-mm-dd")`** (batch). **Both H and I:** inline **`parseDateTime`** where SharePoint needs a datetime (**no payment-date Compose**). Remove and re-add the flow under **Data** after changing the trigger. |
| **`parseDateTime`… `'2026-MM-02'` was not valid** / **`InvalidTemplate`** on **Create Consolidated Payment** (batch) | **`Text`** used **`"yyyy-MM-dd"`**; **`MM`** is **not** the month in Power Fx and is written literally | Use **`"yyyy-mm-dd"`** (lowercase **`mm`**) so the trigger receives a numeric month (e.g. **`2026-04-02`**). See **Power Fx date format** note above. |
| **Red error banner but text says “Batch payment saved.” / success wording** | **`Respond to a Power App`** returns **`Success`** as **`string(bool)`**, which is often **`"True"`** (capital **T**). **`varFlowResult.success = "true"`** is **false**, so the app takes the **failure** branch and calls **`Notify(..., NotificationType.Error)`** with the success **message** | Use the **`Or(varFlowResult.success = true, Lower(Trim(Coalesce(Text(varFlowResult.success), ""))) = "true")`** pattern in **`btnPaymentConfirm`** / **`btnBatchPaymentConfirm`** (this spec), **or** set the flow output to **`toLower(string(variables('varSuccess')))`** so the string is always lowercase. |

**Correct split (this spec):** Single checkout → **`btnPaymentConfirm`** calls **`'Flow-(H)-Payment-SaveSingle'.Run(...)`** using **`varSelectedItem`** and the payment modal fields. Batch checkout → **`btnBatchPaymentConfirm`** calls **`'Flow-(I)-Payment-SaveBatch'.Run(...)`** using **`colBatchItems`**. Do not route both through one button unless every `If` branch passes valid types into `Filter` / `.Run`.

### Final Behavior Summary

| Source Status | Plates Picked | Partial Checkbox | Status After |
|---------------|---------------|------------------|--------------|
| `Printing` | Some completed plates | Hidden | stays `Printing` |
| `Completed` | Some plates | Checked or implied by remaining plates | stays `Completed` |
| `Completed` | All remaining plates | Unchecked | `Paid & Picked Up` |

> 💡 **Merged result:** Payment history now comes from the `Payments` list, payment activity is also appended to `StaffNotes` for the Notes modal timeline, and `PrintRequests.FinalWeight` / `FinalCost` remain the running totals used elsewhere in the app.

---

# STEP 12D: Building the Revert Status Modal

**What you're doing:** Creating a modal that allows staff to move a job backwards in the workflow (e.g., from "Printing" back to "Ready to Print" if there's a printer issue). This is useful when prints fail, need to be redone, or were accidentally moved forward.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Valid Revert Transitions

| Current Status | Can Revert To | Use Case |
|----------------|---------------|----------|
| Printing | Ready to Print | Printer jam, wrong filament, need to reassign |
| Completed | Printing | Print has defect, needs reprint |
| Completed | Ready to Print | Complete redo needed |
| Paid & Picked Up | Completed | Reopen a request closed in error (e.g., single-save ran against a multi-job POS receipt; duplicate `TransactionNumber` rejected the sibling job). |

> ⚠️ **Paid & Picked Up revert is a recovery path, not a payment undo.** Reverting the request status **does not** delete any `Payments` row — those ledger entries remain the record of money actually collected at the POS. Staff use this revert to redo work on a completed request and then re-run checkout (single or batch) on the cleaned-up request. See **Plate cascade on Paid & Picked Up → Completed** and **Payment-field cascade on Paid & Picked Up → Completed** below for what the revert does touch.

### Plate cascade on Paid & Picked Up → Completed

When — and only when — a staffer reverts a request from **Paid & Picked Up** back to **Completed**, `btnRevertConfirm.OnSelect` also flips every `BuildPlates` row for that request where `Status.Value = "Picked Up"` back to `Status.Value = "Completed"`. This keeps request state and plate state in sync so the next payment attempt (single or batch) sees a clean `Completed` job with `Completed` plates.

For all other revert transitions (`Printing → Ready to Print`, `Completed → Printing`, `Completed → Ready to Print`) the cascade is **skipped** and plate statuses are preserved — those transitions intentionally reopen a job without discarding progress already logged against individual plates.

The cascade is reflected in three places:

- **`StaffNotes`:** the `[Changes]` bracket includes `"N plate(s) Picked Up -> Completed"` when the cascade fires.
- **Flow C audit log:** the `NewValue` arg is suffixed with `" (+N plate(s) reverted Picked Up->Completed)"` so the raw audit table records it too.
- **Toast notification:** staff see `"Status reverted to Completed — N plate(s) also reverted to Completed."` instead of the generic "adjust in Build Plates if needed" hint.

### Payment-field cascade on Paid & Picked Up → Completed

When — and only when — a staffer reverts a request from **Paid & Picked Up** back to **Completed**, `btnRevertConfirm.OnSelect` also clears the denormalized payment fields on the `PrintRequests` row:

- `FinalWeight`
- `FinalCost`
- `PaymentDate`
- `PaymentType`
- `PayerName`
- `PayerTigerCard`
- `TransactionNumber`
- `PaymentNotes`

This is **required for correctness**, not cosmetic. Both `Flow-(H)-Payment-SaveSingle` and `Flow-(I)-Payment-SaveBatch` write `FinalWeight` / `FinalCost` using an **additive** expression — `add(coalesce(<existing>, 0), <new allocation>)` — so that multi-plate partial payments on the same request accumulate correctly. If the revert leaves the previously-paid totals in place, the next payment attempt against that request silently double-counts them (e.g., a $3.10 re-charge on a reverted batch item ends up recorded as $6.19 because the flow reads `$3.10 + $3.09` on the SharePoint row).

#### What the cascade does **not** touch

- **`Payments` ledger rows stay intact.** The flows never clean them up, and neither does this revert. Rationale:
  - A single request may have several `Payments` rows from earlier **partial pickups**; only the final pickup should be "undone" conceptually, and the app has no reliable way to pick which one out automatically.
  - **Batch** `Payments` rows are shared across siblings via `BatchRequestIDs` / `BatchAllocationSummary`. Deleting the row when reverting one batch member would break the still-paid siblings.
  - Finance reconciles via `Flow-(G)-Export-MonthlyTransactions`, whose Excel export reflects actual TigerCASH charges. Staff who issued a refund through TigerCASH manually delete the corresponding `Payments` row in SharePoint before the month closes (see cleanup guidance on `btnRevertConfirm`).
- **Sibling batch requests are untouched.** Only the reverted request's own fields are cleared. `REQ-00501`'s `FinalCost` stays intact when you revert `REQ-00502` out of the same batch.

#### Follow-on behavior after the cascade

- **Re-paying the reverted request works cleanly from zero.** The additive math now starts at `0 + <new allocation>` because `FinalWeight` / `FinalCost` were cleared.
- **The reverted request still shows the old batch row in its payment history dropdown** — `BatchRequestIDs` on that row still lists this request's ID. Staff see both the original batch entry (now historically accurate context) and the new payment, separated by the `REVERTED by…` entry in `StaffNotes`. This is intentional history, not a bug: it's identical to how plate history is kept even after a revert.
- **Flow-(G) monthly export is unaffected.** It reads `Payments`, not `PrintRequests`, so untouched ledger rows continue to export as-is; the new payment creates a new ledger row and also exports. If TigerCASH refunded the first charge, the staffer deletes that specific `Payments` row manually before month-end.

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conRevertModal               ← CONTAINER (set Visible here only!)
    ├── btnRevertConfirm         ← Confirm Revert button
    ├── btnRevertCancel          ← Cancel button
    ├── txtRevertReason          ← Reason text input (required)
    ├── lblRevertReasonLabel     ← "Reason for Revert"
    ├── ddRevertTarget           ← Target status dropdown
    ├── lblRevertTargetLabel     ← "Revert To"
    ├── lblRevertCurrentStatus   ← Shows current status
    ├── ddRevertStaff            ← Staff dropdown
    ├── lblRevertStaffLabel      ← "Performing Action As"
    ├── lblRevertTitle           ← "Revert Status - REQ-00042"
    ├── recRevertModal           ← White modal box
    └── recRevertOverlay         ← Dark semi-transparent background
```

---

### Modal Container (conRevertModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conRevertModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowRevertModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Modal Overlay (recRevertOverlay)

5. With `conRevertModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recRevertOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorOverlay` |

---

### Modal Content Box (recRevertModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recRevertModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 450) / 2` |
| Y | `(Parent.Height - 380) / 2` |
| Width | `450` |
| Height | `380` |
| Fill | `varColorBgCard` |

---

### Modal Title (lblRevertTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblRevertTitle`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Revert Status - " & varSelectedItem.ReqKey` |
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 15` |
| Width | `410` |
| Height | `30` |
| Size | `16` |
| FontWeight | `FontWeight.Bold` |
| Color | `RGBA(50, 49, 48, 1)` |

---

### Close Button (btnRevertClose)

13A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
13B. **Rename it:** `btnRevertClose`
13C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recRevertModal.X + recRevertModal.Width - 40` |
| Y | `recRevertModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

13D. Set **OnSelect:**

```powerfx
Set(varShowRevertModal, 0);
Set(varSelectedItem, Blank());
Reset(ddRevertStaff);
Reset(ddRevertTarget);
Reset(txtRevertReason)
```

---

### Staff Dropdown Label (lblRevertStaffLabel)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblRevertStaffLabel`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 55` |
| Width | `200` |
| Height | `20` |
| Size | `11` |
| Color | `RGBA(50, 49, 48, 1)` |

---

### Staff Dropdown (ddRevertStaff)

17. Click **+ Insert** → **Combo box**.
18. **Rename it:** `ddRevertStaff`
19. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 75` |
| Width | `410` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

> ⚠️ **Important:** You must **Run OnStart** first before setting DisplayFields. Otherwise Power Apps will auto-change it to `["ComplianceAssetId"]` because it doesn't recognize the collection columns yet.

---

### Current Status Display (lblRevertCurrentStatus)

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblRevertCurrentStatus`
22. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Current Status: " & varSelectedItem.Status.Value` |
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 120` |
| Width | `410` |
| Height | `25` |
| Size | `12` |
| FontWeight | `FontWeight.Semibold` |
| Color | `RGBA(107, 105, 214, 1)` |

---

### Target Status Label (lblRevertTargetLabel)

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblRevertTargetLabel`
25. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Revert To"` |
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 150` |
| Width | `200` |
| Height | `20` |
| Size | `11` |
| Color | `RGBA(50, 49, 48, 1)` |

---

### Target Status Dropdown (ddRevertTarget)

26. Click **+ Insert** → **Drop down**.
27. **Rename it:** `ddRevertTarget`
28. Set properties:

| Property | Value |
|----------|-------|
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 170` |
| Width | `410` |
| Height | `35` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

29. Set **Items:**

```powerfx
If(
    varSelectedItem.Status.Value = "Printing",
    Table({Value: "Ready to Print"}),
    varSelectedItem.Status.Value = "Completed",
    Table({Value: "Printing"}, {Value: "Ready to Print"}),
    varSelectedItem.Status.Value = "Paid & Picked Up",
    Table({Value: "Completed"}),
    Blank()
)
```

> 💡 **Why the extra refresh?** After saving the payment and patching selected plates to `Picked Up`, refresh `Payments` and `BuildPlates` before recalculating totals and final status. This avoids the edge case where the payment row saves successfully but the app evaluates the request against stale plate data and leaves the parent request in `Completed` instead of moving it to `Paid & Picked Up`.

> 💡 **Dynamic Options:** The dropdown shows only valid revert targets based on the current status. "Printing" can only go back to "Ready to Print", "Completed" can go back to either "Printing" or "Ready to Print", and "Paid & Picked Up" can go back to "Completed" (reopening the request for further payment or correction while preserving existing `Payments` history).

---

### Reason Label (lblRevertReasonLabel)

30. Click **+ Insert** → **Text label**.
31. **Rename it:** `lblRevertReasonLabel`
32. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Reason for Revert"` |
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 215` |
| Width | `200` |
| Height | `20` |
| Size | `11` |
| Color | `RGBA(50, 49, 48, 1)` |

---

### Reason Text Input (txtRevertReason)

33. Click **+ Insert** → **Text input**.
34. **Rename it:** `txtRevertReason`
35. Set properties:

| Property | Value |
|----------|-------|
| Default | `""` |
| HintText | `"e.g., Printer jammed, need to restart print"` |
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 235` |
| Width | `410` |
| Height | `70` |
| Mode | `TextMode.MultiLine` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Cancel Button (btnRevertCancel)

36. Click **+ Insert** → **Button**.
37. **Rename it:** `btnRevertCancel`
38. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recRevertModal.X + 20` |
| Y | `recRevertModal.Y + 325` |
| Width | `195` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

39. Set **OnSelect:**

```powerfx
Set(varShowRevertModal, 0);
Set(varSelectedItem, Blank());
Reset(ddRevertStaff);
Reset(ddRevertTarget);
Reset(txtRevertReason)
```

---

### Confirm Button (btnRevertConfirm)

40. Click **+ Insert** → **Button**.
41. **Rename it:** `btnRevertConfirm`
42. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Confirm Revert"` |
| X | `recRevertModal.X + 235` |
| Y | `recRevertModal.Y + 325` |
| Width | `195` |
| Height | `varBtnHeight` |
| Fill | `varColorWarning` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorWarning, -15%)` |
| PressedFill | `ColorFade(varColorWarning, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| DisplayMode | `If(IsBlank(ddRevertStaff.Selected) Or IsBlank(txtRevertReason.Text) Or Len(Trim(txtRevertReason.Text)) < 5, DisplayMode.Disabled, DisplayMode.Edit)` |

> 💡 **Validation:** The confirm button is disabled until: (1) a staff member is selected, and (2) at least 5 characters are entered in the reason field. This ensures proper documentation of who performed the action and why.

43. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Reverting status...");

// Cascade plate revert on "Paid & Picked Up" -> "Completed".
// Without this, request status and plate status drift apart (plates
// stay "Picked Up" while request is back at "Completed"), which then
// corrupts batch/partial checkout logic on the next payment attempt.
Set(
    varRevertPlatesNeeded,
    varSelectedItem.Status.Value = "Paid & Picked Up" && ddRevertTarget.Selected.Value = "Completed"
);
Clear(colRevertedPlates);
If(
    varRevertPlatesNeeded,
    Collect(
        colRevertedPlates,
        Filter(
            colAllBuildPlates,
            RequestID = varSelectedItem.ID,
            Status.Value = "Picked Up"
        )
    )
);
Set(varRevertedPlateCount, CountRows(colRevertedPlates));

// Update SharePoint item
Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
    Status: LookUp(Choices(PrintRequests.Status), Value = ddRevertTarget.Selected.Value),
    LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
    LastActionAt: Now(),
    LastActionBy: {
        Claims: "i:0#.f|membership|" & ddRevertStaff.Selected.MemberEmail,
        Discipline: "",
        DisplayName: ddRevertStaff.Selected.MemberName,
        Email: ddRevertStaff.Selected.MemberEmail,
        JobTitle: "",
        Picture: ""
    },
    StaffNotes: Concatenate(
        If(IsBlank(LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes), "", LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes & " | "),
        "REVERTED by " &
        With({n: ddRevertStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
        ": [Summary] " & varSelectedItem.Status.Value & " -> " & ddRevertTarget.Selected.Value &
        " [Changes] " &
        If(
            varRevertPlatesNeeded && varRevertedPlateCount > 0,
            Text(varRevertedPlateCount) & " plate" & If(varRevertedPlateCount = 1, "", "s") & " Picked Up -> Completed",
            ""
        ) &
        " [Reason] " &
        Trim(
            Substitute(
                Substitute(
                    Substitute(
                        Substitute(
                            Substitute(
                                Substitute(
                                    Substitute(txtRevertReason.Text, " | ", "; "),
                                    " ~~ ",
                                    "; "
                                ),
                                "[Summary]",
                                "(Summary)"
                            ),
                            "[Changes]",
                            "(Changes)"
                        ),
                        "[Reason]",
                        "(Reason)"
                    ),
                    "[Context]",
                    "(Context)"
                ),
                "[Comment]",
                "(Comment)"
            )
        ) &
        " [Context] " &
        " [Comment] - " & Text(Now(), "m/d h:mmam/pm")
    )
});

// Cascade revert to plates when returning from "Paid & Picked Up"
// to "Completed". Preserves required fields to match the rest of
// the app's BuildPlates patch pattern.
If(
    varRevertPlatesNeeded && varRevertedPlateCount > 0,
    ForAll(
        colRevertedPlates As wSnapPlate,
        With(
            { wFreshPlate: LookUp(BuildPlates, ID = wSnapPlate.ID) },
            If(
                !IsBlank(wFreshPlate),
                Patch(
                    BuildPlates,
                    wFreshPlate,
                    {
                        Status: { Value: "Completed" },
                        RequestID: wFreshPlate.RequestID,
                        ReqKey: wFreshPlate.ReqKey,
                        PlateKey: wFreshPlate.PlateKey,
                        Machine: wFreshPlate.Machine,
                        Title: wFreshPlate.Title
                    }
                )
            )
        )
    );
    ClearCollect(colAllBuildPlates, BuildPlates)
);

// Clear the stale payment fields on the request row when reverting
// "Paid & Picked Up" -> "Completed". Without this, Flow-(H) and
// Flow-(I) use additive math on the existing FinalWeight/FinalCost
// values (coalesce(existing, 0) + new), so re-paying the same
// request double-counts the previously recorded amounts.
// Payments ledger rows are intentionally left alone — a single
// request may have multiple Payments rows from prior partial
// pickups, and batch rows are still referenced by sibling
// requests. Staff delete orphaned Payments rows manually in
// SharePoint when a full-price refund needs to leave the ledger.
If(
    varRevertPlatesNeeded,
    Patch(
        PrintRequests,
        LookUp(PrintRequests, ID = varSelectedItem.ID),
        {
            FinalWeight: Blank(),
            FinalCost: Blank(),
            PaymentDate: Blank(),
            PaymentType: Blank(),
            PayerName: Blank(),
            PayerTigerCard: Blank(),
            TransactionNumber: Blank(),
            PaymentNotes: Blank()
        }
    )
);

// Log to audit flow
'Flow-(C)-Action-LogAction'.Run(
    Text(varSelectedItem.ID),                    // RequestID
    "Status Change",                             // Action
    "Status",                                    // FieldName
    ddRevertTarget.Selected.Value &
        If(
            varRevertPlatesNeeded && varRevertedPlateCount > 0,
            " (+" & Text(varRevertedPlateCount) & " plate" & If(varRevertedPlateCount = 1, "", "s") & " reverted Picked Up->Completed)",
            ""
        ),                                       // NewValue
    ddRevertStaff.Selected.MemberEmail           // ActorEmail
);

Notify(
    "Status reverted to " & ddRevertTarget.Selected.Value &
    If(
        varRevertPlatesNeeded && varRevertedPlateCount > 0,
        " — " & Text(varRevertedPlateCount) & " plate" & If(varRevertedPlateCount = 1, "", "s") & " also reverted to Completed.",
        If(
            CountRows(Filter(colAllBuildPlates, RequestID = varSelectedItem.ID)) > 0,
            ". Note: plate statuses are unchanged — adjust in Build Plates if needed.",
            ""
        )
    ),
    NotificationType.Success
);

// Close modal and reset
Set(varShowRevertModal, 0);
Set(varSelectedItem, Blank());
Reset(ddRevertStaff);
Reset(ddRevertTarget);
Reset(txtRevertReason);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Audit Trail:** The revert action is logged in four places:
> - **StaffNotes field:** Human-readable entry like `"REVERTED by John D.: [Summary] Paid & Picked Up -> Completed [Changes] 2 plates Picked Up -> Completed [Reason] POS transaction covered a sibling job ..."`.
> - **Flow C audit log:** Machine-readable entry where `NewValue` is `"Completed (+2 plates reverted Picked Up->Completed)"` so the cascade is queryable in the audit table.
> - **BuildPlates list:** Each cascaded plate is patched via the standard `wFreshPlate` pattern (required fields preserved), so its SharePoint `Modified` / `Editor` reflect the revert operation.
> - **PrintRequests list:** The Paid & Picked Up → Completed transition patches the row twice — once to flip status / log staff notes, and once to clear the denormalized payment fields (`FinalWeight`, `FinalCost`, `PaymentDate`, `PaymentType`, `PayerName`, `PayerTigerCard`, `TransactionNumber`, `PaymentNotes`). Both patches run in the same `OnSelect` and show up as a single consecutive pair of `Modified` entries on the row.

> ⚠️ **Cascade is scoped to Paid & Picked Up → Completed.** No other revert transition touches `BuildPlates` or clears payment fields. This is intentional: reverting `Completed → Printing` (for example, to add a reprint) should keep the finished plates marked `Completed` and preserve any `FinalWeight` / `FinalCost` already accumulated from partial-payment pickups. The legacy "plate statuses are unchanged" notice still fires in those cases.

> ⚠️ **Why clear the payment fields automatically?** Both `Flow-(H)-Payment-SaveSingle` and `Flow-(I)-Payment-SaveBatch` write with `add(coalesce(<existing>, 0), <new>)` so that multi-plate partial pickups accumulate correctly on the same request. That same math **double-counts** if `Paid & Picked Up` is reverted without clearing the previously-saved totals — the second payment posts `$3.10` but the row records `$6.19`. Clearing the fields on the revert restores a clean `0` baseline for the next payment attempt. `Payments` ledger rows are deliberately left intact: a request may have several (partial-pickup history) and batch rows are shared with sibling requests. See **Payment-field cascade on Paid & Picked Up → Completed** above for the full rationale.

> 🧹 **Cleanup guidance — orphaned or refunded Payment row.** The request row is cleaned automatically on revert, but `Payments` rows are not. You only need to delete a `Payments` row manually in two situations:
>
> 1. **TigerCASH refund issued.** If the student was refunded through TigerCASH, the monthly export (`Flow-(G)-Export-MonthlyTransactions`) will still include the charge. Screenshot the row for audit, then delete it in SharePoint before month-end so the export reconciles with the TigerCASH report.
> 2. **Duplicate-transaction retry.** If a staffer ran `Flow-(H)-Payment-SaveSingle` for one job, hit a duplicate `TransactionNumber` error on the sibling, and reverted the first job to rerun as a batch, the original `Payments` row blocks re-use of that transaction number. Delete it in SharePoint (after screenshotting for audit), then re-run the batch with the real combined weight/amount and the original `TransactionNumber` so the monthly export lands in the right period.
>
> In all other cases (student is re-paying without a refund, redo-the-print scenario, partial-payment flow, etc.), leave the `Payments` rows alone — the cleared request fields are enough, and the ledger entries are finance's source of truth.

---

# STEP 12E: Building the Batch Payment Modal

**What you're doing:** Creating a modal for processing multiple payments at once. When staff clicks "Process Batch Payment" from the selection footer, this modal opens showing all selected items and allowing entry of a shared transaction header: one transaction number, one payer, one payment date, and one combined material-usage total that will be saved as one consolidated `Payments` row for the checkout.

> 🎯 **Use Case:** A student picks up multiple jobs at once (their own + friends'), or buys several items. Instead of processing each individually, staff can handle them all in one transaction.
>
> ⚠️ **Batch means final pickup.** This modal is only for requests where the student is taking **all remaining completed pieces for each selected request**. If a request still needs a partial pickup decision, process it through the single-item Payment Modal in Step 12C instead.
>
> ⚠️ **Consistency note:** Batch must follow the same source-of-truth pattern as Step 12C: validate and close each selected request, then write one consolidated `Payments` row for the real-world checkout. The per-request allocation details belong in the saved batch fields and request rollups, not in duplicate ledger rows.
>
> ⚠️ **Pricing note:** Batch weight is allocated **proportionally** across the selected requests. **Filament and Resin are not batched together** (see **Batch Eligibility Rules**), so every row shares one `Method.Value` and comparable **EstimatedWeight** units—no mixing mL and grams in the same checkout.
>
> ⚠️ **Stable identity rule:** Any request with build plates should still persist `PlateKey` values to `Payments.PlateIDsPickedUp` and audit text, but that snapshot is operational context only. If plates are later re-sliced or replaced, the `Payments` row remains the canonical history.

> ⚠️ **Reminder:** Use Classic controls as described in Step 10. Classic TextInput uses `.Text`, Classic Button uses `Fill`/`Color` properties.

### Batch Eligibility Rules

- Only requests currently in `Completed` status may enter batch mode.
- **Single print method per batch.** Selections **must not mix** `Filament` and `Resin`. The gallery blocks adding a second method; **Process Batch Payment** and **`Flow-(I)-Payment-SaveBatch`** also reject mixed batches. Staff process mixed-method pickups as **separate** checkouts (or use single-item payment). This keeps **EstimatedWeight** sums and proportional allocation meaningful (filament in **g**, resin estimates often in **mL**—never added together).
- Staff enter **one combined pickup total** in **Combined weight**; `Flow-(I)-Payment-SaveBatch` and `lblBatchCostValue` allocate it **proportionally** by each row's `EstimatedWeight` and apply **`varFilamentRate`** or **`varResinGramRate`** according to the **shared** method for that batch.
- If a selected request has build plates, batch processing must re-check that there are no `Queued` or `Printing` plates before confirming payment.
- If a selected request has build plates, batch processing must verify that at least one remaining plate is eligible for pickup (`Status = "Completed"`). Requests whose plates are already fully `Picked Up` must be removed from the batch with a blocking message.
- Batch pickup always means "pick up all remaining eligible completed plates for this request now." There is no per-plate checkbox UI inside the batch modal.
- Requests without build plates remain supported for backward compatibility; they still move to `Paid & Picked Up` and contribute one allocation entry to the consolidated ledger row.
- Each real-world batch checkout creates exactly one `Payments` row with shared `TransactionNumber`, `PayerName`, `PaymentDate`, and `RecordedAt`, because accounting treats the batch as one transaction.

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conBatchPaymentModal          ← CONTAINER (set Visible here only!)
    ├── btnBatchPaymentConfirm    ← Record Batch Payment button
    ├── btnBatchPaymentCancel     ← Cancel button
    ├── galBatchItems             ← Gallery showing selected items
    ├── lblBatchItemsHeader       ← "Selected Items:"
    ├── chkBatchOwnMaterial       ← Own material checkbox (applies to all)
    ├── lblBatchCostValue         ← Auto-calculated combined cost
    ├── lblBatchCostLabel         ← "Total Cost:"
    ├── dpBatchPaymentDate        ← Shared payment date picker
    ├── lblBatchPaymentDateLabel  ← "Payment Date"
    ├── txtBatchPayerName         ← Shared payer name input
    ├── lblBatchPayerNameLabel    ← "Payer Name"
    ├── txtBatchWeight            ← Combined pickup weight input
    ├── lblBatchWeightLabel       ← "Combined weight" (same unit family as estimates: g for filament, g weighed at pickup for resin batches)
    ├── txtBatchTransaction       ← Transaction number input
    ├── lblBatchTransLabel        ← "Transaction Number"
    ├── ddBatchPaymentType        ← Payment type dropdown
    ├── lblBatchPaymentTypeLabel  ← "Payment Type"
    ├── ddBatchStaff              ← Staff dropdown
    ├── lblBatchStaffLabel        ← "Performing Action As"
    ├── lblBatchSummary           ← Summary showing count and estimated total
    ├── lblBatchTitle             ← "Batch Payment - X Items"
    ├── recBatchPaymentModal      ← White modal box
    └── recBatchPaymentOverlay    ← Dark semi-transparent background
```

---

### Modal Container (conBatchPaymentModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conBatchPaymentModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowBatchPaymentModal > 0` |

---

### Modal Overlay (recBatchPaymentOverlay)

5. With `conBatchPaymentModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recBatchPaymentOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorOverlay` |

---

### Modal Content Box (recBatchPaymentModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recBatchPaymentModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 720) / 2` |
| Width | `600` |
| Height | `720` |
| Fill | `varColorBgCard` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

---

### Modal Title (lblBatchTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblBatchTitle`
13. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 20` |
| Width | `560` |
| Height | `30` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `varColorSuccess` |

14. Set **Text:**

```powerfx
"Final Batch Pickup - " & CountRows(colBatchItems) & " Item" & If(CountRows(colBatchItems) <> 1, "s", "")
```

---

### Close Button (btnBatchPaymentClose)

14A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
14B. **Rename it:** `btnBatchPaymentClose`
14C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recBatchPaymentModal.X + recBatchPaymentModal.Width - 40` |
| Y | `recBatchPaymentModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

14D. Set **OnSelect:**

```powerfx
Set(varShowBatchPaymentModal, 0);
// Don't clear colBatchItems - let user continue selecting
Reset(txtBatchTransaction);
Reset(txtBatchPayerName);
Reset(dpBatchPaymentDate);
Reset(txtBatchWeight);
Reset(ddBatchStaff);
Reset(chkBatchOwnMaterial);
Reset(ddBatchPaymentType)
```

---

### Summary Label (lblBatchSummary)

15. Click **+ Insert** → **Text label**.
16. **Rename it:** `lblBatchSummary`
17. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 55` |
| Width | `560` |
| Height | `20` |
| Size | `11` |
| Color | `varColorWarning` |

18. Set **Text:**

```powerfx
"Estimated Total: " &
Text(Sum(colBatchItems, EstimatedWeight)) &
If(CountIf(colBatchItems, Method.Value = "Resin") = CountRows(colBatchItems), "mL est.", "g") &
" → " &
Text(Sum(colBatchItems, EstimatedCost), "[$-en-US]$#,##0.00")
```

> ⚠️ **Final-pickup clarity:** This warning replaces the previous neutral summary to make the batch consequence explicit. Staff must understand that batch = final pickup for every selected request.

---

### Staff Label (lblBatchStaffLabel)

19. Click **+ Insert** → **Text label**.
20. **Rename it:** `lblBatchStaffLabel`
21. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 85` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Staff Dropdown (ddBatchStaff)

22. Click **+ Insert** → **Combo box**.
23. **Rename it:** `ddBatchStaff`
24. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 110` |
| Width | `270` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |

---

### Payment Type Label (lblBatchPaymentTypeLabel)

25. Click **+ Insert** → **Text label**.
26. **Rename it:** `lblBatchPaymentTypeLabel`
27. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payment Type"` |
| X | `recBatchPaymentModal.X + 310` |
| Y | `recBatchPaymentModal.Y + 85` |
| Width | `120` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Payment Type Dropdown (ddBatchPaymentType)

28. Click **+ Insert** → **Combo box**.
29. **Rename it:** `ddBatchPaymentType`
30. Set properties:

| Property | Value |
|----------|-------|
| Items | `["TigerCASH", "Check", "Grant/Program Code"]` |
| X | `recBatchPaymentModal.X + 310` |
| Y | `recBatchPaymentModal.Y + 110` |
| Width | `130` |
| Height | `36` |
| DefaultSelectedItems | `["TigerCASH"]` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |

---

### Transaction Label (lblBatchTransLabel)

31. Click **+ Insert** → **Text label**.
32. **Rename it:** `lblBatchTransLabel`
33. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 460` |
| Y | `recBatchPaymentModal.Y + 85` |
| Width | `120` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

34. Set **Text:**

```powerfx
Switch(
    ddBatchPaymentType.Selected.Value,
    "TigerCASH", "Transaction #",
    "Check", "Check #",
    "Grant/Program Code", "Grant/Program Code",
    "Transaction #"
)
```

---

### Transaction Input (txtBatchTransaction)

35. Click **+ Insert** → **Input** → **Text input** (Classic version, NOT "Text input (modern)").
36. **Rename it:** `txtBatchTransaction`
37. Set properties:

| Property | Value |
|----------|-------|
| Default | `""` |
| X | `recBatchPaymentModal.X + 460` |
| Y | `recBatchPaymentModal.Y + 110` |
| Width | `120` |
| Height | `36` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |
38. Set **HintText:**

```powerfx
Switch(
    ddBatchPaymentType.Selected.Value,
    "TigerCASH", "TigerCASH receipt number",
    "Check", "Check number",
    "Grant/Program Code", "Leave blank if code is pending",
    "Receipt or reference number"
)
```

---

### Payer Name Label (lblBatchPayerNameLabel)

38. Click **+ Insert** → **Text label**.
39. **Rename it:** `lblBatchPayerNameLabel`
40. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payer Name"` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 160` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Payer Name Input (txtBatchPayerName)

41. Click **+ Insert** → **Input** → **Text input** (Classic version, NOT "Text input (modern)").
42. **Rename it:** `txtBatchPayerName`
43. Set properties:

| Property | Value |
|----------|-------|
| Default | `""` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 185` |
| Width | `270` |
| Height | `36` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

---

### Payment Date Label (lblBatchPaymentDateLabel)

50. Click **+ Insert** → **Text label**.
51. **Rename it:** `lblBatchPaymentDateLabel`
52. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payment Date"` |
| X | `recBatchPaymentModal.X + 310` |
| Y | `recBatchPaymentModal.Y + 160` |
| Width | `140` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Payment Date Picker (dpBatchPaymentDate)

53. Click **+ Insert** → **Date picker** (**Classic**).
54. **Rename it:** `dpBatchPaymentDate`
55. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 310` |
| Y | `recBatchPaymentModal.Y + 185` |
| Width | `130` |
| Height | `36` |
| DefaultDate | `Today()` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| IconBackground | `varChevronBackground` |
| IconFill | `RGBA(255, 255, 255, 1)` |

> ⚠️ **Build-order reminder:** Create `txtBatchPayerName` and `dpBatchPaymentDate` in the app before pasting any updated batch close/cancel/confirm formulas. Those formulas reference these controls directly.

---

### Weight Label (lblBatchWeightLabel)

50. Click **+ Insert** → **Text label**.
51. **Rename it:** `lblBatchWeightLabel`
52. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 245` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

52A. Set **Text:**

```powerfx
If(
    CountIf(colBatchItems, Method.Value = "Resin") = CountRows(colBatchItems) && CountRows(colBatchItems) > 0,
    "Combined Resin Weight (g)",
    With(
        {
            varBatchRemainingWeight: Sum(colBatchItems, Max(0, EstimatedWeight - Coalesce(FinalWeight, 0)))
        },
        If(
            IsNumeric(txtBatchWeight.Text) && Value(txtBatchWeight.Text) > 0 &&
            varBatchRemainingWeight > 0 &&
            Abs(Value(txtBatchWeight.Text) - varBatchRemainingWeight) / varBatchRemainingWeight > 0.5,
            "⚠️ Weight (" & Text(Round(Value(txtBatchWeight.Text) / varBatchRemainingWeight * 100, 0)) & "% of remaining)",
            "Combined Weight"
        )
    )
)
```

52B. Set **Color:**

```powerfx
If(
    CountIf(colBatchItems, Method.Value = "Resin") = CountRows(colBatchItems) && CountRows(colBatchItems) > 0,
    varColorText,
    With(
        {
            varBatchRemainingWeight: Sum(colBatchItems, Max(0, EstimatedWeight - Coalesce(FinalWeight, 0)))
        },
        If(
            IsNumeric(txtBatchWeight.Text) && Value(txtBatchWeight.Text) > 0 &&
            varBatchRemainingWeight > 0 &&
            Abs(Value(txtBatchWeight.Text) - varBatchRemainingWeight) / varBatchRemainingWeight > 0.5,
            varColorWarning,
            varColorText
        )
    )
)
```

> ⚠️ **Sanity check:** Filament batches use the same >50% deviation warning as the single-payment weight label, comparing against the sum of **remaining weights** (original estimates minus already-picked-up weights) for all requests in the batch. **All-resin** batches skip the direct comparison because estimates are stored in `mL` while pickup is entered in grams. **Mixed Filament + Resin in one batch is blocked** in the gallery and in `Flow-(I)-Payment-SaveBatch`, so this label logic only runs for **homogeneous** batches.

---

### Weight Input (txtBatchWeight)

53. Click **+ Insert** → **Input** → **Text input** (Classic version, NOT "Text input (modern)").
54. **Rename it:** `txtBatchWeight`
55. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 270` |
| Width | `150` |
| Height | `36` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

56. Set **Default:**

```powerfx
Text(Sum(colBatchItems, EstimatedWeight))
```

> 💡 **Pre-filled:** Weight is pre-filled with the sum of estimated weights from all selected items. Staff can adjust based on actual measured weight.

---

### Cost Label (lblBatchCostLabel)

57. Click **+ Insert** → **Text label**.
58. **Rename it:** `lblBatchCostLabel`
59. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Total Cost:"` |
| X | `recBatchPaymentModal.X + 190` |
| Y | `recBatchPaymentModal.Y + 245` |
| Width | `100` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Cost Value (lblBatchCostValue)

60. Click **+ Insert** → **Text label**.
61. **Rename it:** `lblBatchCostValue`
62. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 190` |
| Y | `recBatchPaymentModal.Y + 270` |
| Width | `150` |
| Height | `36` |
| Size | `16` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorSuccess` |
| VerticalAlign | `VerticalAlign.Middle` |

63. Set **Text:**

```powerfx
With(
    {
        totalEstWeight: Sum(colBatchItems, EstimatedWeight),
        itemCount: CountRows(colBatchItems),
        enteredWeight: Value(txtBatchWeight.Text)
    },
    Text(
        Sum(
            ForAll(
                colBatchItems As batchItem,
                With(
                    {
                        allocatedWeight: If(
                            totalEstWeight > 0,
                            Round((batchItem.EstimatedWeight / totalEstWeight) * enteredWeight, 2),
                            Round(enteredWeight / itemCount, 2)
                        )
                    },
                    With(
                        {
                            baseCost: Max(
                                If(
                                    batchItem.Method.Value = "Resin",
                                    allocatedWeight * varResinGramRate,
                                    allocatedWeight * varFilamentRate
                                ),
                                varMinimumCost
                            )
                        },
                        If(chkBatchOwnMaterial.Value, baseCost * varOwnMaterialDiscount, baseCost)
                    )
                )
            ),
            Value
        ),
        "[$-en-US]$#,##0.00"
    )
)
```

> 💡 **Auto-calculated:** Cost updates in real-time from the entered combined weight, then prices each request with its own method-specific rate before summing the per-item charges.

---

### Own Material Checkbox (chkBatchOwnMaterial)

64. Click **+ Insert** → **Checkbox**.
65. **Rename it:** `chkBatchOwnMaterial`
66. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student provides own material (70% discount)"` |
| X | `recBatchPaymentModal.X + 360` |
| Y | `recBatchPaymentModal.Y + 270` |
| Width | `220` |
| Height | `36` |
| Size | `11` |

---

### Items Header (lblBatchItemsHeader)

67. Click **+ Insert** → **Text label**.
68. **Rename it:** `lblBatchItemsHeader`
69. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Selected Items:"` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 320` |
| Width | `560` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |

---

### Items Gallery (galBatchItems)

70. Click **+ Insert** → **Blank vertical gallery**.
71. **Rename it:** `galBatchItems`
72. Set properties:

| Property | Value |
|----------|-------|
| Items | `colBatchItems` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 345` |
| Width | `560` |
| Height | `230` |
| TemplateSize | `35` |
| TemplatePadding | `2` |

61. Inside `galBatchItems`, add a **Text label** named `lblBatchItemRow`:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.TemplateWidth` |
| Height | `Parent.TemplateHeight` |
| Size | `11` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

62. Set **Text** for `lblBatchItemRow`:

```powerfx
With(
    {wPlates: CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Status.Value = "Completed"))},
    ThisItem.ReqKey & " - " & ThisItem.Student.DisplayName &
    " (" & Text(ThisItem.EstimatedWeight) &
    If(ThisItem.Method.Value = "Resin", "mL", "g") &
    ", " & Text(ThisItem.EstimatedCost, "[$-en-US]$#,##0.00") & ")" &
    If(wPlates > 0, " — " & wPlates & " plate" & If(wPlates <> 1, "s", ""), "")
)
```

> 💡 **Plate count display:** Each batch row now shows how many completed plates will be picked up, reinforcing the final-pickup semantics.

63. Inside `galBatchItems`, add a **Button** named `btnRemoveFromBatch`:

> ⚠️ **Use Classic Button:** Insert → Input → **Button** (NOT Modern Button). Classic buttons use `Fill`/`Color` properties. Do NOT set an `Appearance` property - that's Modern-only syntax.

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `Parent.TemplateWidth - 30` |
| Y | `(Parent.TemplateHeight - 24) / 2` |
| Width | `24` |
| Height | `24` |
| Fill | `Color.Transparent` |
| Color | `RGBA(180, 0, 0, 1)` |
| HoverFill | `RGBA(255, 220, 220, 1)` |
| PressedFill | `RGBA(255, 200, 200, 1)` |
| BorderThickness | `0` |
| RadiusTopLeft | `12` |
| RadiusTopRight | `12` |
| RadiusBottomLeft | `12` |
| RadiusBottomRight | `12` |
| Size | `10` |
| Font | `varAppFont` |

64. Set **OnSelect** for `btnRemoveFromBatch`:

```powerfx
Remove(colBatchItems, ThisItem);
If(
    CountRows(colBatchItems) = 0,
    // If no items left, close modal and exit batch mode
    Set(varShowBatchPaymentModal, 0);
    Set(varBatchSelectMode, false);
    Notify("All items removed. Batch mode cancelled.", NotificationType.Information)
)
```

> 💡 **Remove Items:** Staff can remove individual items from the batch if needed. If all items are removed, the modal closes automatically.
>
> 💡 **Use this when one request no longer qualifies:** If refresh-time validation finds that an item already had its remaining plates picked up, or now has active `Queued` / `Printing` plates, remove it here and process the rest of the batch separately.

---

### Cancel Button (btnBatchPaymentCancel)

65. Click **+ Insert** → **Button** (Classic, NOT Modern).
66. **Rename it:** `btnBatchPaymentCancel`
67. Set properties (do NOT use `Appearance` - that's Modern-only):

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recBatchPaymentModal.X + 320` |
| Y | `recBatchPaymentModal.Y + 630` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

68. Set **OnSelect:**

```powerfx
Set(varShowBatchPaymentModal, 0);
// Don't clear colBatchItems - let user continue selecting
Reset(txtBatchTransaction);
Reset(txtBatchPayerName);
Reset(dpBatchPaymentDate);
Reset(txtBatchWeight);
Reset(ddBatchStaff);
Reset(chkBatchOwnMaterial);
Reset(ddBatchPaymentType)
```

---

### Confirm Batch Payment Button (btnBatchPaymentConfirm)

69. Click **+ Insert** → **Button** (Classic, NOT Modern).
70. **Rename it:** `btnBatchPaymentConfirm`
71. Set properties 

| Property | Value |
|----------|-------|
| Text | `"Record Batch Payment"` |
| X | `recBatchPaymentModal.X + 450` |
| Y | `recBatchPaymentModal.Y + 630` |
| Width | `130` |
| Height | `varBtnHeight` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorSuccess, -15%)` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

72. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddBatchStaff.Selected) && 
    !IsBlank(txtBatchTransaction.Text) &&
    !IsBlank(Trim(txtBatchPayerName.Text)) &&
    !IsBlank(dpBatchPaymentDate.SelectedDate) &&
    !IsBlank(txtBatchWeight.Text) && 
    IsNumeric(txtBatchWeight.Text) && 
    Value(txtBatchWeight.Text) > 0 &&
    CountRows(colBatchItems) > 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

73. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Processing batch payment...");

// Call Flow I to handle the entire batch save server-side
Set(varBatchProcessedCount, CountRows(colBatchItems));
Set(
    varFlowResult,
    'Flow-(I)-Payment-SaveBatch'.Run(
        Value(txtBatchWeight.Text),
        varFilamentRate,
        varResinGramRate,
        varMinimumCost,
        varOwnMaterialDiscount,
        Concat(SortByColumns(colBatchItems, "ID", SortOrder.Ascending), Text(ID), ", "),
        Concat(SortByColumns(colBatchItems, "ReqKey", SortOrder.Ascending), ReqKey, ", "),
        If(IsBlank(Trim(txtBatchTransaction.Text)), "", Trim(txtBatchTransaction.Text)),
        ddBatchPaymentType.Selected.Value,
        Trim(txtBatchPayerName.Text),
        ddBatchStaff.Selected.MemberEmail,
        ddBatchStaff.Selected.MemberName,
        chkBatchOwnMaterial.Value,
        Text(dpBatchPaymentDate.SelectedDate, "yyyy-mm-dd")
    )
);

// Success output may be boolean true or the string "true"/"True" — see btnPaymentConfirm success check.
If(
    Or(
        varFlowResult.success = true,
        Lower(Trim(Coalesce(Text(varFlowResult.success), ""))) = "true"
    ),

    // === SUCCESS PATH ===
    Concurrent(
        Refresh(PrintRequests),
        Refresh(BuildPlates),
        Refresh(Payments)
    );
    ClearCollect(colAllBuildPlates, BuildPlates);
    ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}));
    ClearCollect(colAllPayments, Payments);

    ForAll(
        colBatchItems As BatchItem,
        IfError(
            'Flow-(C)-Action-LogAction'.Run(
                Text(BatchItem.ID),
                "Status Change",
                "Status",
                "Paid & Picked Up (Batch final pickup)" &
                With(
                    {
                        wLoggedPlates: Filter(colAllBuildPlates, RequestID = BatchItem.ID, Status.Value = "Picked Up")
                    },
                    If(
                        CountRows(wLoggedPlates) > 0,
                        " - Plate IDs " & Concat(wLoggedPlates, PlateKey, ", "),
                        ""
                    )
                ),
                ddBatchStaff.Selected.MemberEmail
            ),
            Blank()
        )
    );

    Clear(colBatchItems);
    Set(varBatchSelectMode, false);
    Set(varShowBatchPaymentModal, 0);
    Reset(txtBatchTransaction);
    Reset(txtBatchPayerName);
    Reset(dpBatchPaymentDate);
    Reset(txtBatchWeight);
    Reset(ddBatchStaff);
    Reset(chkBatchOwnMaterial);
    Reset(ddBatchPaymentType);
    Notify(
        varBatchProcessedCount & " item" & If(varBatchProcessedCount <> 1, "s", "") &
        " processed successfully and saved as one consolidated payment row.",
        NotificationType.Success
    ),

    // === FAILURE PATH ===
    Notify(varFlowResult.message, NotificationType.Error)
);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> ⚠️ **Server-side save architecture:** As of the Payment Strengthening Phase, all writes (`Payments`, `BuildPlates`, `PrintRequests`) are handled by `Flow-(I)-Payment-SaveBatch` in Power Automate. The app only collects inputs, calls the flow, and displays the result. See `PowerAutomate/Flow-(I)-Payment-SaveBatch.md` for the full server-side implementation. **Payment date:** pass **`Text(dpBatchPaymentDate.SelectedDate, "yyyy-mm-dd")`** as the last `.Run` argument (same **lowercase `mm`** rule as single payment — not **`"yyyy-MM-dd"`**); the flow parses it with **inline `parseDateTime`** on the SharePoint actions (no Compose).

> ⚠️ **Division-by-Zero Protection:** If total estimated weight is 0 (e.g., all items have no estimates), the weight and cost are distributed evenly across all items instead of using proportional calculation.

> 💡 **Batch history guidance:** Canonical batch payment history must come from the one consolidated `Payments` row created for the checkout. Use `BatchRequestIDs`, `BatchReqKeys`, and `BatchAllocationSummary` for the per-request breakdown. Do not treat appended `StaffNotes` text as authoritative history.
>
> 💡 **Transaction number guidance:** For batch payments, `TransactionNumber` should contain the receipt / approval identifier so finance exports remain reconcilable.
>
> 💡 **Single-method batch pricing:** The batch modal and `Flow-(I)-Payment-SaveBatch` only run when every selected row shares the same `Method.Value`, so the live cost preview and saved allocations use one rate family (`varFilamentRate` or `varResinGramRate`) for the whole checkout.
>
> 💡 **All-or-nothing:** If any request in the batch fails validation, the entire batch is rejected and nothing is written. There is no partial success or retry of subsets. Staff retries the whole batch.
>
> 💡 **Plate handling guidance:** For requests with build plates, batch payment is intentionally narrower than the single-item Payment Modal. Step 12E always picks up every remaining completed plate for the request. If the student is only taking some of the completed pieces, go back to Step 12C instead.

---

### Troubleshooting: Batch Payment Modal Errors

If you see formula errors after building this modal, here are the most common causes and fixes:

#### Strange estimated total vs. total cost (e.g. mL + grams), or modal stays open after “success”

**Cause:** **Filament** and **Resin** were previously allowed in one batch; **EstimatedWeight** for resin is often **mL** while filament is **grams**, so summing estimates and splitting proportionally produced misleading UI and odd totals.

**Fix:** This spec **blocks mixed-method batches** in the gallery, on **Process Batch Payment**, and in **`Flow-(I)-Payment-SaveBatch`**. Rebuild those formulas and publish. For the modal not closing after payment, also confirm **`btnBatchPaymentConfirm`** uses the **`Or(varFlowResult.success = true, Lower(Trim(...)) = "true")`** success test and the flow’s **Respond** action uses **`toLower(string(variables('varSuccess')))`** so the success branch actually runs.

#### Error: "Name isn't valid. 'Text' isn't recognized."

**Cause:** You inserted a **Modern TextInput** control instead of a **Classic Text input**. Modern TextInput uses `.Value` property, not `.Text`.

**Fix:** Delete the control and re-add it correctly:
1. Delete `txtBatchWeight` (or `txtBatchTransaction`)
2. Click **+ Insert** → **Input** → **Text input** (the Classic version)
3. Rename and configure as specified above

**Alternative Fix (if you want to keep Modern controls):** Replace all `.Text` references with `.Value`:
- `txtBatchWeight.Text` → `txtBatchWeight.Value`
- `txtBatchTransaction.Text` → `txtBatchTransaction.Value`

#### Error: "Name isn't valid. 'ButtonAppearance' isn't recognized."

**Cause:** You're using Modern button syntax (`Appearance: ButtonAppearance.Primary`) on a Classic button, or the enum syntax is wrong.

**Fix:** Classic buttons don't have an `Appearance` property. Use these style properties instead:
- For Primary (green) button: `Fill: varColorSuccess`, `Color: Color.White`
- For Secondary (gray) button: `Fill: varColorNeutral`, `Color: Color.White`  
- For Subtle/transparent button: `Fill: Transparent`, `Color: RGBA(180, 0, 0, 1)`

If using Modern buttons, the correct syntax is `'ButtonAppearance'.Primary` (with quotes around ButtonAppearance).

#### Error: "The '.' operator cannot be used on Error values."

**Cause:** A cascading error. Another formula has an error, and this formula references its output.

**Fix:** Fix the root cause error first (usually the `ButtonAppearance` or `.Text` error above), and this error will resolve automatically.

#### Error: "The function 'If' / 'Value' / 'IsBlank' / 'IsNumeric' has some invalid arguments."

**Cause:** One of the function's arguments is an error value (usually from `.Text` not being recognized).

**Fix:** Fix the TextInput control type issue first. Once `txtBatchWeight.Text` resolves correctly, these functions will work.

#### Error: "Name isn't valid. 'txtBatchPayerName' isn't recognized." / "Name isn't valid. 'dpBatchPaymentDate' isn't recognized."

**Cause:** The updated batch formulas were pasted before the new shared transaction-header controls were created.

**Fix:** Add the missing controls from Step 12E first:
- `txtBatchPayerName`
- `dpBatchPaymentDate`

Then re-paste these formulas:
- `btnBatchPaymentClose.OnSelect`
- `btnBatchPaymentCancel.OnSelect`
- `btnBatchPaymentConfirm.DisplayMode`
- `btnBatchPaymentConfirm.OnSelect`

#### Error: "Name isn't valid. 'allocatedWeight' isn't recognized." / "Name isn't valid. 'wAllocatedWeight' isn't recognized."

**Cause:** Power Fx can reject sibling local-variable references inside the same record literal of a `With(...)`.

**Fix:** Use the nested `With(...)` version shown in this guide for both:
- `lblBatchCostValue.Text`
- the `Set(varBatchFinalCost, ...)` block inside `btnBatchPaymentConfirm.OnSelect`

#### Error: "The function 'Patch' has some invalid arguments." / "Invalid argument type (Table). Expecting a Record value instead."

**Cause:** The `Patch(DataSource, Table)` pattern requires each record in the table to include the primary key (ID) field. If `colBatchItems` doesn't have ID, or if the ForAll structure is wrong, this error appears.

**Fix:** Ensure your `colBatchItems` collection includes the `ID` field from the original records. When you `Collect(colBatchItems, ThisItem)` in the card OnSelect, the ID should be included automatically.

If the error persists, try this alternative approach using ForAll with individual Patch calls:

```powerfx
// Alternative: Individual Patch calls (slower but more compatible)
ForAll(
    colBatchItems As BatchItem,
    Patch(
        PrintRequests,
        LookUp(PrintRequests, ID = BatchItem.ID),
        {
            Status: LookUp(Choices(PrintRequests.Status), Value = "Paid & Picked Up"),
            // ... rest of fields
        }
    )
)
```

#### Quick Reference: Classic vs Modern Control Properties

| Control Type | Classic Property | Modern Property |
|--------------|------------------|-----------------|
| TextInput value | `.Text` | `.Value` |
| Button style | `Fill`, `Color`, `HoverFill` | `Appearance` |
| ComboBox selection | `.Selected.Value` | `.Selected.Value` |
| Checkbox value | `.Value` | `.Value` |

---

# STEP 12F: Building the Build Plates Modal

**What you're doing:** Creating a modal for managing build plates (gcode files) across multiple printers. This modal allows staff to add, remove, and track the status of individual plates for a single print request.

> 🎯 **Use Case:** A student submits a large or multi-part model that gets sliced into 5 gcode files — 3 running on MK4S machines and 2 on the XL. The Build Plates Modal lets staff track each plate's progress (Queued → Printing → Completed → Picked Up) and know exactly which pieces are done.

### Design Overview

The Build Plates Modal organizes plates as a scrollable list. Staff can:
- Add new plates with a default printer, then adjust the row's printer if needed
- Change a plate's assigned printer (while Queued or Printing)
- Advance plate status (Queued → Printing → Completed)
- Keep labels fully dynamic while the job is still being re-sliced
- Freeze original labels after the first completed plate so finished work does not get renumbered
- Add later plates as explicit reprints without forcing staff to choose a source plate
- Remove any plate (for re-slicing scenarios)

### Visual Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Build Plates - REQ-00042                                            [✕] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Total Sliced:                   3 of 5 Original Completed · Reprints: 0/1 │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  1/5           [Prusa MK4S ▼]    ● Completed              [✕]  │  │
│  │  2/5           [Prusa MK4S ▼]    ● Completed              [✕]  │  │
│  │  3/5           [Prusa MK4S ▼]    ● Printing    [✓ Done]   [✕]  │  │
│  │  4/5           [Prusa XL   ▼]    ● Queued      [▶ Printing][✕]  │  │
│  │  Reprint 1     [Prusa XL   ▼]    ● Queued      [▶ Printing][✕]  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  Add plate / reprint:                              [+ Add Plate]         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                  [Done]  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Plate Removal Flexibility

**Any plate can be removed at any time**, regardless of status. This supports scenarios where staff needs to scrap and re-slice a job:

| Status | Can Remove? | Use Case |
|--------|-------------|----------|
| Queued | ✅ Yes | Job not started yet |
| Printing | ✅ Yes | Print failed, need to redo |
| Completed | ✅ Yes | Re-slicing entire job |
| Picked Up | ✅ Yes | Data correction |

The [✕] remove button appears on ALL plate rows.

### Control Hierarchy

Before customizing this gallery, either insert a blank vertical gallery or delete the default browse-gallery template children first. The final template should contain only the plate controls documented below, not stock controls like `Image3`, `Title3`, `Subtitle3`, `NextArrow3`, or bindings to unrelated default fields such as `Compliance Asset Id` or `Color Tag`.

```
scrDashboard
└── conBuildPlatesModal              ← CONTAINER (Visible = varShowBuildPlatesModal > 0)
    ├── recBuildPlatesOverlay        ← Full-screen dark overlay
    ├── recBuildPlatesModal          ← White box (600×620)
    ├── lblBuildPlatesTitle          ← "Build Plates - REQ-00042"
    ├── btnBuildPlatesClose          ← ✕ top-right
    ├── recBuildPlatesDivider1       ← Divider under title
    ├── lblTotalSlicedLabel          ← "Total Sliced:"
    ├── lblBuildPlatesProgressModal  ← "3 of 5 Original Completed · Reprints: 0/1"
    ├── recBuildPlatesDivider2       ← Divider above plates gallery
    ├── galBuildPlates               ← Gallery of plates
    │   ├── recPlateRowBg            ← Alternating row background
    │   ├── lblPlateLabel            ← "1/5", "Reprint 1"
    │   ├── drpPlateMachine          ← Printer dropdown
    │   ├── lblPlateStatus           ← Colored status badge
    │   ├── btnMarkPrinting          ← Queued → Printing
    │   ├── btnMarkDone              ← Printing → Completed
    │   └── btnRemovePlate           ← [✕] (always visible)
    ├── recBuildPlatesDivider3       ← Divider above Add Plate section
    ├── lblAddPlateHeader            ← "Add plate:" or "Add reprint:"
    ├── btnBuildPlatesAdd            ← [+ Add Plate] or [+ Add Reprint]
    └── btnBuildPlatesDone           ← "Done"
```

---

### Modal Container (conBuildPlatesModal)

| Property | Value |
|----------|-------|
| Control | Container |
| Name | `conBuildPlatesModal` |
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowBuildPlatesModal > 0` |

> 💡 **Modal Stacking Rule:** When this modal is opened from the Approval modal, it acts like a child modal. It should fully cover the screen, and the Approval modal should be hidden until Build Plates closes.
>
> **Troubleshooting:** If the Build Plates modal appears but the Approval modal is still visible behind it, re-check `conApprovalModal.Visible`. This behavior is controlled by the Approval container, not the Build Plates container.

---

### Modal Overlay (recBuildPlatesOverlay)

| Property | Value |
|----------|-------|
| Control | Rectangle |
| Name | `recBuildPlatesOverlay` |
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorOverlay` |

---

### Modal Content Box (recBuildPlatesModal)

| Property | Value |
|----------|-------|
| Control | Rectangle |
| Name | `recBuildPlatesModal` |
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 620) / 2` |
| Width | `600` |
| Height | `620` |
| Fill | `varColorBgCard` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

---

### Modal Title (lblBuildPlatesTitle)

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblBuildPlatesTitle` |
| Text | `"Build Plates - " & varSelectedItem.ReqKey` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 18` |
| Width | `520` |
| Height | `26` |
| Size | `14` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |

---

### Close Button (btnBuildPlatesClose)

| Property | Value |
|----------|-------|
| Control | Button |
| Name | `btnBuildPlatesClose` |
| Text | `"✕"` |
| X | `recBuildPlatesModal.X + 562` |
| Y | `recBuildPlatesModal.Y + 16` |
| Width | `24` |
| Height | `24` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverFill | `RGBA(200, 200, 200, 0.3)` |
| HoverColor | `varColorText` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| Size | `14` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

**Replace the existing `OnSelect` formula with:**

```powerfx
Set(varShowBuildPlatesModal, 0);
If(!Coalesce(varBuildPlatesOpenedFromApproval, false), Set(varSelectedItem, Blank()));
ClearCollect(colBuildPlates, Blank());
Clear(colBuildPlates);
ClearCollect(colBuildPlatesIndexed, Blank());
Clear(colBuildPlatesIndexed);
Set(varBuildPlatesOpenedFromApproval, false)
```

---

### Divider 1 (recBuildPlatesDivider1)

| Property | Value |
|----------|-------|
| Control | Rectangle |
| Name | `recBuildPlatesDivider1` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 52` |
| Width | `560` |
| Height | `1` |
| Fill | `varColorBorderLight` |

---

### Total Sliced Label (lblTotalSlicedLabel)

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblTotalSlicedLabel` |
| Text | `"Total Sliced:"` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 66` |
| Width | `100` |
| Height | `28` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

---

### Progress Label (lblBuildPlatesProgressModal)

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblBuildPlatesProgressModal` |
| Text | `If(Coalesce(varSelectedItem.BuildPlateLabelsLocked, false), With({ wOriginalTotal: Coalesce(varSelectedItem.BuildPlateOriginalTotal, CountRows(Filter(colBuildPlatesIndexed, !StartsWith(ResolvedPlateLabel, "Reprint")))), wOriginalDone: CountRows(Filter(colBuildPlatesIndexed, !StartsWith(ResolvedPlateLabel, "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), wReprintTotal: CountRows(Filter(colBuildPlatesIndexed, StartsWith(ResolvedPlateLabel, "Reprint"))), wReprintDone: CountRows(Filter(colBuildPlatesIndexed, StartsWith(ResolvedPlateLabel, "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))) }, Text(wOriginalDone) & " of " & Text(wOriginalTotal) & " Original Completed" & If(wReprintTotal > 0, " · Reprints: " & Text(wReprintDone) & "/" & Text(wReprintTotal), "")), Text(CountRows(Filter(colBuildPlatesIndexed, Or(Status.Value = "Completed", Status.Value = "Picked Up")))) & " of " & Text(CountRows(colBuildPlatesIndexed)) & " Completed")` |
| X | `recBuildPlatesModal.X + 124` |
| Y | `recBuildPlatesModal.Y + 66` |
| Width | `456` |
| Height | `28` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorSuccess` |
| Align | `Align.Right` |
| VerticalAlign | `VerticalAlign.Middle` |

---

### Divider 2 (recBuildPlatesDivider2)

| Property | Value |
|----------|-------|
| Control | Rectangle |
| Name | `recBuildPlatesDivider2` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 102` |
| Width | `560` |
| Height | `1` |
| Fill | `varColorBorderLight` |

---

### Build Plates Gallery (galBuildPlates)

| Property | Value |
|----------|-------|
| Control | Vertical Gallery |
| Name | `galBuildPlates` |
| Items | `colBuildPlatesIndexed` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 110` |
| Width | `560` |
| Height | `320` |
| TemplateSize | `52` |
| TemplatePadding | `2` |
| Fill | `Color.Transparent` |
| TemplateFill | `Color.Transparent` |
| ShowScrollbar | `true` |

> Important: if you started from a stock browse gallery, remove the default children before wiring up the controls below. `galBuildPlates` should not display placeholder SharePoint fields such as `Compliance Asset Id` or `Color Tag`.

---

#### Row Background (recPlateRowBg) — inside gallery template

| Property | Value |
|----------|-------|
| Control | Rectangle |
| Name | `recPlateRowBg` |
| X | `0` |
| Y | `0` |
| Width | `Parent.TemplateWidth` |
| Height | `Parent.TemplateHeight` |
| Fill | `If(Mod(ThisItem.PlateNum, 2) = 0, RGBA(245, 247, 250, 1), RGBA(255, 255, 255, 1))` |

---

#### Plate Label (lblPlateLabel) — inside gallery template

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblPlateLabel` |
| Text | `ThisItem.ResolvedPlateLabel` |
| X | `8` |
| Y | `0` |
| Width | `104` |
| Height | `Parent.TemplateHeight` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

---

#### Machine Dropdown (drpPlateMachine) — inside gallery template

Editable for Queued/Printing plates. Locked (disabled) for Completed/Picked Up to preserve history.

| Property | Value |
|----------|-------|
| Control | Dropdown |
| Name | `drpPlateMachine` |
| Items | `AddColumns(Filter(Choices([@BuildPlates].Machine), If(varSelectedItem.Method.Value = "Filament", StartsWith(Value, "Prusa MK4S") Or StartsWith(Value, "Prusa XL") Or StartsWith(Value, "Raise"), varSelectedItem.Method.Value = "Resin", Or(StartsWith(Value, "Form 3+"), StartsWith(Value, "Form 3 (")), true)), DisplayValue, Trim(If(Find("(", Value) > 0, Left(Value, Find("(", Value) - 2), Value)))` |
| Value | `"DisplayValue"` |
| Default | `Trim(If(Find("(", ThisItem.Machine.Value) > 0, Left(ThisItem.Machine.Value, Find("(", ThisItem.Machine.Value) - 2), ThisItem.Machine.Value))` |
| X | `116` |
| Y | `8` |
| Width | `160` |
| Height | `36` |
| Size | `10` |
| Font | `varAppFont` |
| BorderColor | `If(Self.DisplayMode = DisplayMode.Edit, varInputBorderColor, Color.Transparent)` |
| ChevronBackground | `If(Self.DisplayMode = DisplayMode.Edit, varColorPrimary, Color.Transparent)` |
| DisplayMode | `If(varIsLoading, DisplayMode.Disabled, If(ThisItem.Status.Value in ["Queued", "Printing"], DisplayMode.Edit, DisplayMode.Disabled))` |

**OnChange:**

```powerfx
Set(varIsLoading, true);
Set(varLoadingMessage, "Updating machine...");

// Patch 1: Update the BuildPlate machine, preserving all required fields
Set(
    varMachineChangeSuccess,
    IfError(
        Patch(
            BuildPlates,
            LookUp(BuildPlates, ID = ThisItem.ID),
            {
                Machine: { Value: drpPlateMachine.Selected.Value },
                ReqKey: LookUp(BuildPlates, ID = ThisItem.ID).ReqKey,
                RequestID: LookUp(BuildPlates, ID = ThisItem.ID).RequestID,
                PlateKey: LookUp(BuildPlates, ID = ThisItem.ID).PlateKey,
                Status: LookUp(BuildPlates, ID = ThisItem.ID).Status,
                Title: LookUp(BuildPlates, ID = ThisItem.ID).Title
            }
        );
        true,
        Notify("Failed to update machine.", NotificationType.Error, 3000);
        false
    )
);

// Patch 2: Append StaffNotes on the parent request (only if Patch 1 succeeded)
If(
    varMachineChangeSuccess,
    Set(
        varMachineChangeSuccess,
        IfError(
            Patch(
                PrintRequests,
                LookUp(PrintRequests, ID = varSelectedItem.ID),
                {
                    StaffNotes: Concatenate(
                        If(IsBlank(LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes), "", LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes & " | "),
                        "BUILD PLATE: [Summary] " & ThisItem.ResolvedPlateLabel & " machine " &
                        Trim(If(Find("(", ThisItem.Machine.Value) > 0, Left(ThisItem.Machine.Value, Find("(", ThisItem.Machine.Value) - 2), ThisItem.Machine.Value)) &
                        " -> " & drpPlateMachine.Selected.Value &
                        " [Changes] [Reason] [Context] [Comment] - " & Text(Now(), "m/d h:mmam/pm")
                    )
                }
            );
            true,
            Notify("Machine updated but could not log note.", NotificationType.Warning, 3000);
            true
        )
    )
);

// Refresh collections and notify on success
If(
    varMachineChangeSuccess,
    ClearCollect(colBuildPlates, Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending));
    ClearCollect(
        colBuildPlatesIndexed,
        AddColumns(
            colBuildPlates As plate,
            PlateNum,
            CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
            ResolvedPlateLabel,
            With(
                {
                    wDynamicNum: CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
                    wStoredLabel: Trim(Coalesce(plate.DisplayLabel, ""))
                },
                If(!IsBlank(wStoredLabel), wStoredLabel, Text(wDynamicNum) & "/" & Text(CountRows(colBuildPlates)))
            )
        )
    );
    ClearCollect(colAllBuildPlates, BuildPlates);
    ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}));
    ClearCollect(colPrintersUsed, Distinct(colBuildPlates, Machine.Value));
    Notify("Machine updated", NotificationType.Success, 2000)
);

Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Method filter:** Filament jobs show MK4S, XL, and any machine choice that **starts with `Raise`** (covers `Raise3D`, `Raise 3D`, vendor spacing, and model suffixes—SharePoint labels vary). Resin jobs show Formlabs resin lines that start with `Form 3+` or `Form 3 (` (covers labels with or without `+` before the dimension parenthesis).
>
> **Modal-only display cleanup:** In this modal, the dropdown shows shortened labels like `Prusa MK4S` and `Raise3D Pro 2 Plus`, but the app still patches the original full SharePoint choice value behind the scenes.
>
> The aliased `plate` / `priorPlate` version avoids the parser ambiguity that can happen when `ThisRecord` is reused inside the nested `Filter(...)`.

---

#### Status Badge (lblPlateStatus) — inside gallery template

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblPlateStatus` |
| Text | `ThisItem.Status.Value` |
| X | `280` |
| Y | `10` |
| Width | `84` |
| Height | `32` |
| Size | `9` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Align | `Align.Center` |
| VerticalAlign | `VerticalAlign.Middle` |
| Fill | `Switch(ThisItem.Status.Value, "Queued", RGBA(230, 230, 230, 1), "Printing", RGBA(255, 243, 205, 1), "Completed", RGBA(200, 230, 201, 1), "Picked Up", RGBA(187, 222, 251, 1), RGBA(230, 230, 230, 1))` |
| Color | `Switch(ThisItem.Status.Value, "Queued", RGBA(80, 80, 80, 1), "Printing", RGBA(130, 80, 0, 1), "Completed", RGBA(27, 94, 32, 1), "Picked Up", RGBA(13, 71, 161, 1), RGBA(80, 80, 80, 1))` |

---

#### Mark Printing Button (btnMarkPrinting) — inside gallery template

| Property | Value |
|----------|-------|
| Control | Button |
| Name | `btnMarkPrinting` |
| Text | `"▶ Printing"` |
| X | `372` |
| Y | `10` |
| Width | `90` |
| Height | `32` |
| Fill | `varColorWarning` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorPrimary, -15%)` |
| PressedFill | `ColorFade(varColorPrimary, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `9` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| **Visible** | `ThisItem.Status.Value = "Queued" && varSelectedItem.Status.Value = "Printing"` |

| **DisplayMode** | `If(varIsLoading, DisplayMode.Disabled, DisplayMode.Edit)` |

**Replace the existing `OnSelect` formula with:**

```powerfx
// Show loading overlay to prevent double-clicks
Set(varIsLoading, true);
Set(varLoadingMessage, "Updating plate status...");

With(
    {
        wFreshRequest: LookUp(PrintRequests, ID = varSelectedItem.ID),
        wFreshPlate: LookUp(BuildPlates, ID = ThisItem.ID)
    },
    // Update BuildPlate with explicit field preservation
    Set(
        varPlatePatchSuccess,
        IfError(
            Patch(BuildPlates,
                wFreshPlate,
                { 
                    Status: { Value: "Printing" },
                    // Explicitly preserve required fields to prevent clearing
                    RequestID: wFreshPlate.RequestID,
                    ReqKey: wFreshPlate.ReqKey,
                    PlateKey: wFreshPlate.PlateKey,
                    Machine: wFreshPlate.Machine,
                    Title: wFreshPlate.Title
                }
            ),
            Blank()
        )
    );
    
    // Only update request if plate update succeeded
    If(
        !IsBlank(varPlatePatchSuccess),
        Patch(
            PrintRequests,
            wFreshRequest,
            {
                StaffNotes: Concatenate(
                    If(IsBlank(wFreshRequest.StaffNotes), "", wFreshRequest.StaffNotes & " | "),
                    "BUILD PLATE: [Summary] " & ThisItem.ResolvedPlateLabel & " queued -> printing on " &
                    Trim(If(Find("(", ThisItem.Machine.Value) > 0, Left(ThisItem.Machine.Value, Find("(", ThisItem.Machine.Value) - 2), ThisItem.Machine.Value)) &
                    " [Changes] [Reason] [Context] [Comment] - " & Text(Now(), "m/d h:mmam/pm")
                )
            }
        );
        Notify("Plate marked as printing", NotificationType.Success, 2000),
        // Error notification
        Notify("Failed to update plate status. Please try again.", NotificationType.Error, 3000)
    )
);

// Hide loading overlay
Set(varIsLoading, false);
Set(varLoadingMessage, "")
;
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(
        colBuildPlates As plate,
        PlateNum,
        CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
        ResolvedPlateLabel,
        With(
            {
                wDynamicNum: CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
                wStoredLabel: Trim(Coalesce(plate.DisplayLabel, ""))
            },
            If(
                !IsBlank(wStoredLabel),
                wStoredLabel,
                Text(wDynamicNum) & "/" & Text(CountRows(colBuildPlates))
            )
        )
    )
);
ClearCollect(colAllBuildPlates, BuildPlates);
ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}))
```

> 💡 **Parent status gate:** Staff should not mark an individual plate as `Printing` until the parent request itself has been moved to `Printing` from the job card. This keeps plate-level progress aligned with the request's overall status.

---

#### Mark Done Button (btnMarkDone) — inside gallery template

Same properties as `btnMarkPrinting` with:

| Property | Value |
|----------|-------|
| Control | Button |
| Name | `btnMarkDone` |
| Text | `"✓ Done"` |
| X | `372` |
| Y | `10` |
| Width | `90` |
| Height | `32` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `varColorSuccessHover` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `9` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| **Visible** | `ThisItem.Status.Value = "Printing"` |
| **DisplayMode** | `If(varIsLoading, DisplayMode.Disabled, DisplayMode.Edit)` |

**Replace the existing `OnSelect` formula with:**

```powerfx
// Show loading overlay to prevent double-clicks
Set(varIsLoading, true);
Set(varLoadingMessage, "Marking plate as completed...");

With(
    {
        wShouldLockLabels: !Coalesce(varSelectedItem.BuildPlateLabelsLocked, false),
        wFreshPlate: LookUp(BuildPlates, ID = ThisItem.ID),
        wFreshRequest: LookUp(PrintRequests, ID = varSelectedItem.ID)
    },
    // Update BuildPlate with explicit field preservation
    Set(
        varPlatePatchSuccess,
        IfError(
            Patch(BuildPlates,
                wFreshPlate,
                { 
                    Status: { Value: "Completed" },
                    // Explicitly preserve required fields to prevent clearing
                    RequestID: wFreshPlate.RequestID,
                    ReqKey: wFreshPlate.ReqKey,
                    PlateKey: wFreshPlate.PlateKey,
                    Machine: wFreshPlate.Machine,
                    Title: wFreshPlate.Title
                }
            ),
            Blank()
        )
    );
    
    // Only continue if plate update succeeded
    If(
        !IsBlank(varPlatePatchSuccess),
        // Lock labels if this is the first completed plate
        If(
            wShouldLockLabels,
            ForAll(
                AddColumns(
                    colBuildPlates As plate,
                    FrozenLabel,
                    Text(CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID))) & "/" & Text(CountRows(colBuildPlates))
                ) As plateToLock,
                Patch(
                    BuildPlates,
                    LookUp(BuildPlates, ID = plateToLock.ID),
                    { 
                        DisplayLabel: plateToLock.FrozenLabel,
                        // Preserve ReqKey in label-locking updates
                        ReqKey: plateToLock.ReqKey
                    }
                )
            );
            Set(
                varSelectedItem,
                Patch(
                    PrintRequests,
                    wFreshRequest,
                    {
                        BuildPlateLabelsLocked: true,
                        BuildPlateOriginalTotal: CountRows(colBuildPlates)
                    }
                )
            )
        );
        // Update request notes
        Patch(
            PrintRequests,
            wFreshRequest,
            {
                StaffNotes: Concatenate(
                    If(IsBlank(wFreshRequest.StaffNotes), "", wFreshRequest.StaffNotes & " | "),
                    "BUILD PLATE: [Summary] " & ThisItem.ResolvedPlateLabel & " printing -> completed [Changes] [Reason] [Context] [Comment] - " & Text(Now(), "m/d h:mmam/pm")
                )
            }
        );
        Notify("Plate marked as completed", NotificationType.Success, 2000),
        // Error notification
        Notify("Failed to update plate status. Please try again.", NotificationType.Error, 3000)
    )
);

// Hide loading overlay
Set(varIsLoading, false);
Set(varLoadingMessage, "");

// Refresh collection
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(
        colBuildPlates As plate,
        PlateNum,
        CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
        ResolvedPlateLabel,
        With(
            {
                wDynamicNum: CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
                wStoredLabel: Trim(Coalesce(plate.DisplayLabel, ""))
            },
            If(
                !IsBlank(wStoredLabel),
                wStoredLabel,
                Text(wDynamicNum) & "/" & Text(CountRows(colBuildPlates))
            )
        )
    )
);
ClearCollect(colAllBuildPlates, BuildPlates);
ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}))
```

> 💡 **Label lock trigger:** The first time any plate is marked `Completed`, freeze the current visible labels onto all existing plates, set `PrintRequests.BuildPlateLabelsLocked` to `true`, and store the frozen denominator in `PrintRequests.BuildPlateOriginalTotal`. Do not clear those values later if the request is reverted.
>
> **Important:** Only `btnMarkDone` should apply the label-lock logic. `btnMarkPrinting` may append a `StaffNotes` entry, but it must not change label-lock state or parent request status.
>
> 🔒 **Concurrency Protection & Field Preservation:**
> - Both status buttons now use `IfError()` to catch patch conflicts when clicking too quickly
> - **Critical:** All Patch operations explicitly preserve `ReqKey` and other required fields (`RequestID`, `PlateKey`, `Machine`, `Title`)
> - Without explicit field preservation, SharePoint may clear values during update, causing "orphaned" plates that don't show up in filtered views
> - Loading overlay (`varIsLoading`) prevents double-clicks while patch is in progress
> - Success/error notifications inform staff immediately if an update fails
> - The `wFreshPlate` lookup ensures the patch operates on the latest record version, preventing version conflicts

---

#### Remove Button (btnRemovePlate) — inside gallery template

| Property | Value |
|----------|-------|
| Control | Button |
| Name | `btnRemovePlate` |
| Text | `"✕"` |
| X | `524` |
| Y | `14` |
| Width | `24` |
| Height | `24` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverFill | `RGBA(220, 50, 50, 0.15)` |
| HoverColor | `varColorDanger` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| Size | `12` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| **Visible** | `If(Coalesce(varSelectedItem.BuildPlateLabelsLocked, false), StartsWith(ThisItem.ResolvedPlateLabel, "Reprint"), true)` |

> 💡 **Flexible plate history:** Before labels lock, any plate can be removed. After labels lock, only reprint rows should remain removable. Original numbered plates become the frozen baseline set and must stay intact so `1/4`, `2/4`, etc. keep their meaning. Historical `Payments` rows remain the canonical transaction record; any stored plate IDs are the pickup-time snapshot only.

**OnSelect:**

```powerfx
If(
    Coalesce(varSelectedItem.BuildPlateLabelsLocked, false) && !StartsWith(ThisItem.ResolvedPlateLabel, "Reprint"),
    Notify("Original locked plates cannot be deleted. Add a reprint instead.", NotificationType.Warning),
    With(
        {
            wFreshRequest: LookUp(PrintRequests, ID = varSelectedItem.ID)
        },
        Remove(BuildPlates, LookUp(BuildPlates, ID = ThisItem.ID));
        Patch(
            PrintRequests,
            wFreshRequest,
            {
                StaffNotes: Concatenate(
                    If(IsBlank(wFreshRequest.StaffNotes), "", wFreshRequest.StaffNotes & " | "),
                    "BUILD PLATE: [Summary] Removed " & ThisItem.ResolvedPlateLabel &
                    " [Changes] [Reason] [Context] [Comment] - " & Text(Now(), "m/d h:mmam/pm")
                )
            }
        )
    );
    ClearCollect(colBuildPlates,
        Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending)
    );
    ClearCollect(colBuildPlatesIndexed,
        AddColumns(
            colBuildPlates As plate,
            PlateNum,
            CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
            ResolvedPlateLabel,
            With(
                {
                    wDynamicNum: CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
                    wStoredLabel: Trim(Coalesce(plate.DisplayLabel, ""))
                },
                If(
                    !IsBlank(wStoredLabel),
                    wStoredLabel,
                    Text(wDynamicNum) & "/" & Text(CountRows(colBuildPlates))
                )
            )
        )
    );
    ClearCollect(colAllBuildPlates, BuildPlates);
    ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}))
)
```

---

### Divider 3 (recBuildPlatesDivider3)

| Property | Value |
|----------|-------|
| Control | Rectangle |
| Name | `recBuildPlatesDivider3` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 438` |
| Width | `560` |
| Height | `1` |
| Fill | `varColorBorderLight` |

---

### Add Plate Header (lblAddPlateHeader)

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblAddPlateHeader` |
| Text | `If(Coalesce(varSelectedItem.BuildPlateLabelsLocked, false), "Add reprint:", "Add plate:")` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 456` |
| Width | `110` |
| Height | `24` |
| Font | `varAppFont` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorText` |

---

### Add Plate Button (btnBuildPlatesAdd)

| Property | Value |
|----------|-------|
| Control | Button |
| Name | `btnBuildPlatesAdd` |
| Text | `If(Coalesce(varSelectedItem.BuildPlateLabelsLocked, false), "+ Add Reprint", "+ Add Plate")` |
| X | `recBuildPlatesModal.X + 460` |
| Y | `recBuildPlatesModal.Y + 452` |
| Width | `100` |
| Height | `32` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisplayMode | `If(varIsLoading, DisplayMode.Disabled, DisplayMode.Edit)` |

> 💡 **Simplified UX:** Before labels lock, `+ Add Plate` creates a new plate immediately. After labels lock, the same button becomes `+ Add Reprint` and creates clearly labeled rows such as `Reprint 1`, `Reprint 2` without forcing staff to select a source plate first.
>
> **Numbering rule:** Do not use a simple `CountRows(...)+1` approach for reprint labels, because it can reuse numbers after deletions. Instead, calculate the next suffix from the highest existing `Reprint N` label and add 1.
>
> **Default printer logic:** `PrintRequests.Printer` and `BuildPlates.Machine` are separate SharePoint choice columns—their option text must align for an exact match. The app sets `Machine` with `Coalesce(LookUp(..., Value = varSelectedItem.Printer.Value), LookUp(filtered method choices, true))` so resin jobs first reuse the same text as the request’s printer when it exists on `BuildPlates.Machine`, then fall back to the first resin choice (`Form 3+` or `Form 3 (` prefix). Using only `StartsWith("Form 3+")` or only exact match can leave `Machine` blank and trigger **Field 'Machine' is required** on `Patch`.

**OnSelect:**

```powerfx
Set(varIsLoading, true);
Set(varLoadingMessage, "Adding plate...");

// Compute reprint number and display label before patching
Set(
    varNextReprintNum,
    Coalesce(
        Max(
            AddColumns(
                Filter(colBuildPlates, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint ")),
                ReprintNum,
                Value(Substitute(Trim(Coalesce(DisplayLabel, "")), "Reprint ", ""))
            ),
            ReprintNum
        ),
        0
    ) + 1
);
Set(
    varNewDisplayLabel,
    If(
        Coalesce(varSelectedItem.BuildPlateLabelsLocked, false),
        "Reprint " & Text(varNextReprintNum),
        Text(CountRows(colBuildPlates) + 1) & "/" & Text(CountRows(colBuildPlates) + 1)
    )
);

// Patch 1: Create the new BuildPlate record
Set(
    varAddPlateSuccess,
    IfError(
        Patch(
            BuildPlates,
            Defaults(BuildPlates),
            {
                RequestID: varSelectedItem.ID,
                ReqKey: varSelectedItem.ReqKey,
                Machine: Coalesce(
                    LookUp(Choices([@BuildPlates].Machine), Value = varSelectedItem.Printer.Value),
                    LookUp(
                        Filter(
                            Choices([@BuildPlates].Machine),
                            If(
                                varSelectedItem.Method.Value = "Filament",
                                StartsWith(Value, "Prusa MK4S") Or StartsWith(Value, "Prusa XL") Or StartsWith(Value, "Raise"),
                                varSelectedItem.Method.Value = "Resin",
                                Or(StartsWith(Value, "Form 3+"), StartsWith(Value, "Form 3 (")),
                                true
                            )
                        ),
                        true
                    )
                ),
                PlateKey: Text(GUID()),
                Status: { Value: "Queued" },
                DisplayLabel: If(
                    Coalesce(varSelectedItem.BuildPlateLabelsLocked, false),
                    "Reprint " & Text(varNextReprintNum),
                    Blank()
                )
            }
        );
        true,
        Notify("Failed to add plate. Please try again.", NotificationType.Error, 3000);
        false
    )
);

// Patch 2: Append StaffNotes on the parent request (only if Patch 1 succeeded)
If(
    varAddPlateSuccess,
    Set(
        varAddPlateSuccess,
        IfError(
            Patch(
                PrintRequests,
                LookUp(PrintRequests, ID = varSelectedItem.ID),
                {
                    StaffNotes: Concatenate(
                        If(IsBlank(LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes), "", LookUp(PrintRequests, ID = varSelectedItem.ID).StaffNotes & " | "),
                        "BUILD PLATE: [Summary] Added " & varNewDisplayLabel & " [Changes] [Reason] [Context] [Comment] - " & Text(Now(), "m/d h:mmam/pm")
                    )
                }
            );
            true,
            Notify("Plate added but could not log note.", NotificationType.Warning, 3000);
            true
        )
    )
);

// Refresh collections and notify on success
If(
    varAddPlateSuccess,
    ClearCollect(colBuildPlates, Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending));
    ClearCollect(
        colBuildPlatesIndexed,
        AddColumns(
            colBuildPlates As plate,
            PlateNum,
            CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
            ResolvedPlateLabel,
            With(
                {
                    wDynamicNum: CountRows(Filter(colBuildPlates As priorPlate, priorPlate.ID <= plate.ID)),
                    wStoredLabel: Trim(Coalesce(plate.DisplayLabel, ""))
                },
                If(!IsBlank(wStoredLabel), wStoredLabel, Text(wDynamicNum) & "/" & Text(CountRows(colBuildPlates)))
            )
        )
    );
    ClearCollect(colAllBuildPlates, BuildPlates);
    ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}));
    Notify("Plate added", NotificationType.Success, 2000)
);

Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

---

### Done Button (btnBuildPlatesDone)

| Property | Value |
|----------|-------|
| Control | Button |
| Name | `btnBuildPlatesDone` |
| Text | `"Done"` |
| X | `recBuildPlatesModal.X + 460` |
| Y | `recBuildPlatesModal.Y + 572` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

**Replace the existing `OnSelect` formula with:**

```powerfx
Set(varShowBuildPlatesModal, 0);
If(!Coalesce(varBuildPlatesOpenedFromApproval, false), Set(varSelectedItem, Blank()));
ClearCollect(colBuildPlates, Blank());
Clear(colBuildPlates);
ClearCollect(colBuildPlatesIndexed, Blank());
Clear(colBuildPlatesIndexed);
Set(varBuildPlatesOpenedFromApproval, false)
```

> 💡 **Same as Close button:** Both buttons close the modal and clean up collections.

---

### ✅ Step 12F Checklist

Before moving on, verify:

- [ ] `conBuildPlatesModal` container visible when `varShowBuildPlatesModal > 0`
- [ ] Title shows student name and ReqKey from `varSelectedItem`
- [ ] Gallery displays `ResolvedPlateLabel` values (dynamic `1/5`, `2/5`, etc. before lock; frozen originals plus `Reprint 1`, `Reprint 2`, etc. after lock)
- [ ] Status badges show correct colors (gray=Queued, yellow=Printing, green=Completed, blue=Picked Up)
- [ ] "▶ Printing" button appears only for Queued plates
- [ ] "✓ Done" button appears only for Printing plates
- [ ] Before labels lock, Remove [✕] appears on all plates
- [ ] After labels lock, Remove [✕] appears only on reprint rows; original numbered plates stay intact
- [ ] Machine dropdown is editable for Queued/Printing plates, disabled for Completed/Picked Up
- [ ] `▶ Printing` only appears after the parent request has been moved to `Printing`
- [ ] Before labels lock, `+ Add Plate` creates a new queued plate immediately
- [ ] After labels lock, `+ Add Reprint` creates queued reprint rows with numbered labels such as `Reprint 1`
- [ ] Reprint numbering continues upward from the highest existing reprint number instead of reusing deleted numbers
- [ ] New plates default to the request's current printer when valid, otherwise fall back to the first valid machine for that method
- [ ] Method filter works on the row dropdown: Resin jobs only show Form 3+ / Form 3 resin choices, Filament jobs show MK4S/XL/Raise3D-family printers
- [ ] Adding a plate creates a new BuildPlates record with Status="Queued"
- [ ] Removing a plate deletes the BuildPlates record only when that row is eligible for deletion
- [ ] Progress label updates when plate statuses change
- [ ] Close and Done buttons both reset collections and close modal

---

# STEP 12G: Building the Export Modal

**What you're doing:** Creating a modal that lets staff generate a monthly Excel export of TigerCASH transactions for departmental accounting. The modal is triggered from the **Analytics** button in the nav bar.

> The lab has two spaces: **Atkinson Hall 145** (additive manufacturing — 3D printing, tracked in this dashboard) and **Art Building 123** (subtractive manufacturing — CNC, plasma, tracked separately). This export covers Atkinson Hall only. Art Building transactions are manually added to the downloaded file before sending to accounting.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Control Hierarchy (Container-Based)

```
▼ conExportModal                    ← Container (visibility gate)
    recExportOverlay                ← Dark overlay
    recExportBox                    ← White modal box
    lblExportTitle                  ← Title label
    btnExportClose                  ← Close button (X)
    lblExportMonthLabel             ← "Month:" label
    ddExportMonth                   ← Month dropdown
    lblExportYearLabel              ← "Year:" label
    ddExportYear                    ← Year dropdown
    lblExportPreview                ← Transaction count + total
    btnExportDownload               ← Download button
    lblExportNote                   ← Art Building note
```

### Wireframe

```
+---------------------------------------------------+
|  Monthly Transaction Export                  [ X ] |
|---------------------------------------------------|
|                                                   |
|  Month: [ March       v ]  Year: [ 2026    v ]   |
|                                                   |
|  87 transactions  ·  $1,204.30 total              |
|                                                   |
|               [ Download Excel ]                  |
|                                                   |
|  Art Bldg 123 (CNC/Plasma) must be added          |
|  manually after download.                         |
+---------------------------------------------------+
```

---

> **Quick build option:** Instead of creating each control manually, you can paste all 11 controls at once using the YAML file at [`PowerApps/YAML/Step-12G-ExportModal.yaml`](YAML/Step-12G-ExportModal.yaml). Open that file, copy everything below the comment block, then right-click **scrDashboard** in the Tree view → **Paste code**.

### Modal Container (conExportModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conExportModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowExportModal` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility — you do NOT need to set `Visible` on any child control!

---

### Modal Overlay (recExportOverlay)

5. With `conExportModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recExportOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorOverlay` |
| OnSelect | `Set(varShowExportModal, false)` |

---

### Modal Box (recExportBox)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recExportBox`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - Self.Width) / 2` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `500` |
| Height | `320` |
| Fill | `White` |
| BorderRadius | `varRadiusLarge` |

---

### Title (lblExportTitle)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblExportTitle`
13. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Monthly Transaction Export"` |
| X | `recExportBox.X + 20` |
| Y | `recExportBox.Y + 15` |
| Width | `400` |
| Height | `30` |
| Font | `varAppFont` |
| Size | `16` |
| FontWeight | `FontWeight.Bold` |
| Color | `varColorText` |

---

### Close Button (btnExportClose)

14. Click **+ Insert** → **Button** (**Classic**).
15. **Rename it:** `btnExportClose`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recExportBox.X + recExportBox.Width - Self.Width - 10` |
| Y | `recExportBox.Y + 10` |
| Width | `36` |
| Height | `36` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverFill | `RGBA(0, 0, 0, 0.05)` |
| BorderThickness | `0` |
| Size | `14` |
| OnSelect | `Set(varShowExportModal, false)` |

---

### Month Label (lblExportMonthLabel)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblExportMonthLabel`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Month:"` |
| X | `recExportBox.X + 20` |
| Y | `recExportBox.Y + 65` |
| Width | `60` |
| Height | `20` |
| Font | `varAppFont` |
| Size | `12` |
| Color | `varColorText` |

---

### Month Dropdown (ddExportMonth)

20. Click **+ Insert** → **Drop down** (**Classic**).
21. **Rename it:** `ddExportMonth`
22. Set properties:

| Property | Value |
|----------|-------|
| X | `recExportBox.X + 20` |
| Y | `lblExportMonthLabel.Y + lblExportMonthLabel.Height + 4` |
| Width | `200` |
| Height | `36` |
| Font | `varAppFont` |
| Size | `12` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| ChevronBackground | `Color.Transparent` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

23. Set **Items:**

```powerfx
Table(
    {Display: "January", Value: 1},
    {Display: "February", Value: 2},
    {Display: "March", Value: 3},
    {Display: "April", Value: 4},
    {Display: "May", Value: 5},
    {Display: "June", Value: 6},
    {Display: "July", Value: 7},
    {Display: "August", Value: 8},
    {Display: "September", Value: 9},
    {Display: "October", Value: 10},
    {Display: "November", Value: 11},
    {Display: "December", Value: 12}
)
```

24. Set **Default:**

```powerfx
LookUp(Self.Items, Value = Month(Today()))
```

---

### Year Label (lblExportYearLabel)

25. Click **+ Insert** → **Text label**.
26. **Rename it:** `lblExportYearLabel`
27. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Year:"` |
| X | `ddExportMonth.X + ddExportMonth.Width + 30` |
| Y | `lblExportMonthLabel.Y` |
| Width | `50` |
| Height | `20` |
| Font | `varAppFont` |
| Size | `12` |
| Color | `varColorText` |

---

### Year Dropdown (ddExportYear)

28. Click **+ Insert** → **Drop down** (**Classic**).
29. **Rename it:** `ddExportYear`
30. Set properties:

| Property | Value |
|----------|-------|
| X | `lblExportYearLabel.X` |
| Y | `ddExportMonth.Y` |
| Width | `120` |
| Height | `36` |
| Font | `varAppFont` |
| Size | `12` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| ChevronBackground | `Color.Transparent` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |
| Items | `[Year(Today()) - 1, Year(Today()), Year(Today()) + 1]` |
| Default | `Year(Today())` |

---

### Preview Label (lblExportPreview)

31. Click **+ Insert** → **Text label**.
32. **Rename it:** `lblExportPreview`
33. Set properties:

| Property | Value |
|----------|-------|
| X | `recExportBox.X + 20` |
| Y | `ddExportMonth.Y + ddExportMonth.Height + 20` |
| Width | `460` |
| Height | `24` |
| Font | `varAppFont` |
| Size | `13` |
| Color | `varColorText` |

34. Set **Text:**

```powerfx
With(
    {
        filtered: Filter(
            colAllPayments,
            PaymentType.Value = "TigerCASH" &&
            Month(PaymentDate) = ddExportMonth.Selected.Value &&
            Year(PaymentDate) = ddExportYear.Selected.Value
        )
    },
    CountRows(filtered) & " transactions  ·  " &
    Text(Sum(filtered, Amount), "[$-en-US]$#,##0.00") & " total"
)
```

> This queries the local `colAllPayments` collection (pre-loaded at startup) for preview purposes only. The actual export uses Power Automate with server-side filtering — no delegation limits. Only TigerCASH payments are included; Check and Grant/Program Code payments are excluded.

---

### Download Button (btnExportDownload)

35. Click **+ Insert** → **Button** (**Classic**).
36. **Rename it:** `btnExportDownload`
37. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Download Excel"` |
| X | `(recExportBox.X + recExportBox.Width - Self.Width) / 2 + recExportBox.X / 2` |
| Y | `lblExportPreview.Y + lblExportPreview.Height + 20` |
| Width | `160` |
| Height | `varBtnHeight` |
| Fill | `varColorSuccess` |
| Color | `White` |
| HoverFill | `varColorSuccessHover` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `ColorFade(Self.Fill, -15%)` |
| BorderThickness | `1` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

38. Set **DisplayMode:**

```powerfx
If(
    CountRows(
        Filter(
            colAllPayments,
            PaymentType.Value = "TigerCASH" &&
            Month(PaymentDate) = ddExportMonth.Selected.Value &&
            Year(PaymentDate) = ddExportYear.Selected.Value
        )
    ) > 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

39. Set **OnSelect:**

```powerfx
Set(varIsLoading, true);
Set(varLoadingMessage, "Generating export...");

IfError(
    Set(
        varExportResult,
        'Flow-(G)-Export-MonthlyTransactions'.Run(
            ddExportMonth.Selected.Value,
            ddExportYear.Selected.Value
        )
    );

    If(
        !IsBlank(varExportResult.fileurl),
        Download(varExportResult.fileurl);
        Notify("Export ready — check your downloads.", NotificationType.Success),
        Notify("Export finished, but no download link was returned.", NotificationType.Warning)
    ),

    Notify(
        "Couldn't generate the export right now. Please try again in a moment.",
        NotificationType.Error
    )
);

Set(varIsLoading, false);
Set(varLoadingMessage, "");
```

> 💡 **Power Automate:** The `Flow-(G)-Export-MonthlyTransactions` flow must be added as a data connection (see `PowerAutomate/Flow-(G)-Export-MonthlyTransactions.md`). The name has special characters, so Power Apps requires single quotes: `'Flow-(G)-Export-MonthlyTransactions'.Run(...)`. It queries the `Payments` SharePoint list server-side, creates a 5-column Excel file (`Transaction #`, `Payer`, `Amount`, `Date`, `Recorded At`), and returns a download URL.

> 💡 **Friendly error handling:** `IfError(...)` prevents raw Power Automate/connector errors from surfacing directly to staff. The flow should already generate unique file names, but this still gives users a clean message if anything goes wrong.

---

### Art Building Note (lblExportNote)

40. Click **+ Insert** → **Text label**.
41. **Rename it:** `lblExportNote`
42. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Art Building 123 (CNC/Plasma) transactions must be added manually after download."` |
| X | `recExportBox.X + 20` |
| Y | `recExportBox.Y + recExportBox.Height - 50` |
| Width | `460` |
| Height | `30` |
| Font | `varAppFont` |
| Size | `11` |
| Color | `RGBA(120, 120, 120, 1)` |
| Italic | `true` |

---

### ✅ Step 12G Checklist

- [ ] `conExportModal` container created with `Visible: varShowExportModal`
- [ ] Overlay closes modal on click
- [ ] Close button (✕) closes modal
- [ ] Month dropdown defaults to current month
- [ ] Year dropdown defaults to current year
- [ ] Preview label shows TigerCASH-only transaction count and total
- [ ] Download button is disabled when count is zero
- [ ] Download button triggers `Flow-(G)-Export-MonthlyTransactions` Power Automate flow
- [ ] Loading overlay displays while flow runs
- [ ] `btnNavAnalytics` OnSelect opens this modal
- [ ] Art Building note is visible at the bottom

---

# STEP 13: Building the Notes Modal

**What you're doing:** Creating a modal that displays Staff Notes & Activity (including manual notes, workflow audit entries, build plate history, status changes, and payment activity), and allows staff to add new notes. Student-submitted notes are shown in the dedicated Student Note modal in Step 13B.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

> 📘 **Format reference:** The finalized compact note format and examples live in `PowerApps/Notes-Format-Options.md`. This step keeps tokenized storage if helpful internally, but the Notes modal should render compact notes with the action first, then the timestamp.

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
| Fill | `varColorOverlay` |

---

### Modal Content Box (recNotesModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recNotesModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - Self.Width) / 2` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `700` |
| Height | `Min(720, Parent.Height - 40)` |
| Fill | `varColorBgCard` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

> 💡 **Layout note:** The final notes modal uses a fixed `700` pixel content width with a dynamic height cap. This keeps the staff notes view in a readable single-column layout while still centering and shrinking vertically on smaller screens.

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
| Width | `recNotesModal.Width - 80` |
| Height | `30` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `varColorText` |

---

### Close Button (btnNotesClose)

13A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
13B. **Rename it:** `btnNotesClose`
13C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recNotesModal.X + recNotesModal.Width - 40` |
| Y | `recNotesModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

13D. Set **OnSelect:**

```powerfx
Set(varShowNotesModal, 0);
Set(varSelectedItem, Blank());
Reset(txtAddNote);
Reset(ddNotesStaff)
```

---

> 💡 **Student note handling:** Keep `conNotesModal` focused on staff-authored and system-generated activity. Student-submitted notes are intentionally shown in the dedicated `conStudentNoteModal` built in Step 13B.

---

### Staff Notes Header (lblStaffNotesHeader)

18. Click **+ Insert** → **Text label**.
19. **Rename it:** `lblStaffNotesHeader`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Staff Notes & Activity"` |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 60` |
| Width | `recNotesModal.Width - 40` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

---

### Staff Notes Content (txtStaffNotesContent)

21. Click **+ Insert** → **Text input**.
22. **Rename it:** `txtStaffNotesContent`
23. Set properties:

| Property | Value |
|----------|-------|
| Default | See formula below |
| X | `recNotesModal.X + 20` |
| Y | `lblStaffNotesHeader.Y + 28` |
| Width | `recNotesModal.Width - 40` |
| Height | `recNotesModal.Height - 360` |
| Mode | `TextMode.MultiLine` |
| DisplayMode | `DisplayMode.View` |
| Size | `11` |
| Font | `varAppFont` |
| Color | `If(IsBlank(varSelectedItem.StaffNotes), varColorTextLight, varColorText)` |
| FontItalic | `IsBlank(varSelectedItem.StaffNotes)` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| DisabledBorderColor | `varInputBorderColor` |

24. Set **Default** (the display parsing formula):

```powerfx
If(
    IsBlank(varSelectedItem.StaffNotes),
    "None",
    Concat(
        ForAll(
            Split(varSelectedItem.StaffNotes, " | ") As entry,
            With(
                {
                    text: If(StartsWith(entry.Value, "[NOTE] "), Mid(entry.Value, 8, Len(entry.Value) - 7), entry.Value),
                    isManualNote: StartsWith(entry.Value, "[NOTE] ")
                },
                With(
                    {
                        datetime: Last(Split(text, " - ")).Value,
                        beforeDatetime: Left(text, Max(0, Len(text) - Len(Last(Split(text, " - ")).Value) - 3)),
                        byPos: Find(" by ", text),
                        colonPos: Find(":", text)
                    },
                    With(
                        {
                            action: If(isManualNote, "NOTE", If(byPos > 0 && byPos < colonPos, Upper(Left(text, byPos - 1)), If(colonPos > 0, Upper(Left(text, colonPos - 1)), "NOTE"))),
                            rawName: If(
                                !isManualNote && byPos > 0 && colonPos > byPos + 4,
                                Trim(Mid(text, byPos + 4, Max(0, colonPos - byPos - 4))),
                                If(colonPos > 1, Trim(Left(text, colonPos - 1)), "")
                            ),
                            details: If(colonPos > 0 && Len(beforeDatetime) > colonPos + 1, Trim(Mid(beforeDatetime, colonPos + 2, Max(0, Len(beforeDatetime) - colonPos - 1))), "")
                        },
                        With(
                            {
                                shortName: If(
                                    Find(" ", rawName) > 0,
                                    Left(rawName, Find(" ", rawName) - 1) & " " & Left(Last(Split(rawName, " ")).Value, 1) & ".",
                                    rawName
                                ),
                                usesV2Blocks:
                                    Find("[Summary]", details) > 0 &&
                                    Find("[Changes]", details) > 0 &&
                                    Find("[Reason]", details) > 0 &&
                                    Find("[Context]", details) > 0 &&
                                    Find("[Comment]", details) > 0
                            },
                            If(
                                usesV2Blocks,
                                With(
                                    {
                                        summaryText: Trim(First(Split(Last(Split(details, "[Summary]")).Value, "[Changes]")).Value),
                                        changesText: Trim(First(Split(Last(Split(details, "[Changes]")).Value, "[Reason]")).Value),
                                        reasonText: Trim(First(Split(Last(Split(details, "[Reason]")).Value, "[Context]")).Value),
                                        commentText: Trim(Last(Split(details, "[Comment]")).Value),
                                        mainText: Trim(First(Filter(Table({t: Trim(First(Split(Last(Split(details, "[Summary]")).Value, "[Changes]")).Value)}, {t: Trim(First(Split(Last(Split(details, "[Changes]")).Value, "[Reason]")).Value)}), !IsBlank(t))).t)
                                    },
                                    action & " - " & datetime & Char(10) &
                                    shortName &
                                    If(!IsBlank(mainText), " - " & mainText, "") &
                                    If(
                                        action = "NOTE" && !IsBlank(commentText) && IsBlank(mainText),
                                        " - " & """" & commentText & """",
                                        ""
                                    ) &
                                    If(
                                        !IsBlank(commentText) && !(action = "NOTE" && IsBlank(mainText)),
                                        Char(10) & """" & commentText & """",
                                        If(
                                            !IsBlank(reasonText),
                                            Char(10) & """" & reasonText & """",
                                            ""
                                        )
                                    ) &
                                    Char(10)
                                ),
                                With(
                                    {
                                        legacyReasonSplit: Find(" - ", details) > 0,
                                        legacyMainText: If(Find(" - ", details) > 0, Left(details, Max(0, Find(" - ", details) - 1)), details),
                                        legacyCommentText: If(Find(" - ", details) > 0, Mid(details, Find(" - ", details) + 3, Max(0, Len(details) - Find(" - ", details) - 2)), "")
                                    },
                                    action & " - " & datetime & Char(10) &
                                    shortName &
                                    If(
                                        Len(details) > 0,
                                        If(
                                            action = "NOTE",
                                            " - " & """" & details & """",
                                            If(
                                                action = "UPDATED",
                                                " - " & details,
                                                If(
                                                    action = "REVERTED",
                                                    " - " & legacyMainText &
                                                    If(!IsBlank(legacyCommentText), Char(10) & """" & legacyCommentText & """", ""),
                                                    If(
                                                        action in ["APPROVED", "PAID", "PAID (BATCH)", "STATUS", "BUILD PLATE"],
                                                        " - " & details,
                                                        " - " & legacyMainText &
                                                        If(!IsBlank(legacyCommentText), Char(10) & """" & legacyCommentText & """", "")
                                                    )
                                                )
                                            )
                                        ),
                                        ""
                                    ) &
                                    Char(10)
                                )
                            )
                        )
                    )
                )
            )
        ),
        Value,
        Char(10)
    )
)
```

> 💡 **Note:** This formula still supports both tokenized entries and older legacy prose, but the rendered output now follows the finalized compact format from `PowerApps/Notes-Format-Options.md`.
>
> **Example compact update display:**
> ```
> UPDATED - 3/25 9:45am
> Conrad F. - Weight 42g -> 103.5g; Hours 3 -> 6
> ```
>
> **Example compact payment display:**
> ```
> PAID - 3/25 10:10am
> Sarah B. - $10.10 for 101g
> "Paid at front desk"
> ```
>
> **Example compact manual note display:**
> ```
> NOTE - 3/26 9:44am
> Sarah B. - "Print too small"
> ```
>
> The formula still uses `Last(Split(text, " - "))` to reliably extract the timestamp from the end of each entry.
>
> ⚠️ **Token order:** If you keep tokenized storage for new entries, emit blocks in this order: `[Summary]`, `[Changes]`, `[Reason]`, `[Context]`, `[Comment]`.
>
> ⚠️ **Safety guards:** The formula uses `Max(0, ...)` around all `Mid` and `Left` length calculations to prevent negative-length parsing errors on malformed historical notes.

---

### Staff Name Label (lblNotesStaffLabel)

24. Click **+ Insert** → **Text label**.
25. **Rename it:** `lblNotesStaffLabel`
26. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Add note as"` |
| X | `recNotesModal.X + 20` |
| Y | `txtStaffNotesContent.Y + txtStaffNotesContent.Height + 16` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

---

### Staff Dropdown (ddNotesStaff)

27. Click **+ Insert** → **Combo box**.
28. **Rename it:** `ddNotesStaff`
29. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recNotesModal.X + 20` |
| Y | `lblNotesStaffLabel.Y + 22` |
| Width | `360` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

---

### Add Note Label (lblAddNoteLabel)

30. Click **+ Insert** → **Text label**.
31. **Rename it:** `lblAddNoteLabel`
32. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Add a note:"` |
| X | `recNotesModal.X + 20` |
| Y | `ddNotesStaff.Y + ddNotesStaff.Height + 12` |
| Width | `150` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

---

### Add Note Text Input (txtAddNote)

33. Click **+ Insert** → **Text input**.
34. **Rename it:** `txtAddNote`
35. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recNotesModal.X + 20` |
| Y | `lblAddNoteLabel.Y + 22` |
| Width | `recNotesModal.Width - 40` |
| Height | `88` |
| HintText | `"Type your note here..."` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Cancel Button (btnNotesCancel)

36. Click **+ Insert** → **Button**.
37. **Rename it:** `btnNotesCancel`
38. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recNotesModal.X + recNotesModal.Width - 255` |
| Y | `recNotesModal.Y + recNotesModal.Height - 52` |
| Width | `100` |
| Height | `36` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

39. Set **OnSelect:**

```powerfx
Set(varShowNotesModal, 0);
Set(varSelectedItem, Blank());
Reset(txtAddNote);
Reset(ddNotesStaff)
```

---

### Add Note Button (btnAddNote)

40. Click **+ Insert** → **Button**.
41. **Rename it:** `btnAddNote`
42. Set properties:

| Property | Value |
|----------|-------|
| Text | `"+ Add Note"` |
| X | `recNotesModal.X + recNotesModal.Width - 140` |
| Y | `recNotesModal.Y + recNotesModal.Height - 52` |
| Width | `120` |
| Height | `36` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `varColorSuccessHover` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `2` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

43. Set **DisplayMode:**

```powerfx
If(IsBlank(txtAddNote.Text) || IsBlank(ddNotesStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)
```

44. Set **OnSelect:**

```powerfx
With(
    {
        wFreshRequest: LookUp(PrintRequests, ID = varSelectedItem.ID),
        wNoteShortName: With({n: ddNotesStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & "."),
        wSafeNoteText:
            Trim(
                Substitute(
                    Substitute(
                        Substitute(
                            Substitute(
                                Substitute(
                                    Substitute(
                                        Substitute(txtAddNote.Text, " | ", "; "),
                                        " ~~ ",
                                        "; "
                                    ),
                                    "[Summary]",
                                    "(Summary)"
                                ),
                                "[Changes]",
                                "(Changes)"
                            ),
                            "[Reason]",
                            "(Reason)"
                        ),
                        "[Context]",
                        "(Context)"
                    ),
                    "[Comment]",
                    "(Comment)"
                )
            )
    },
    Patch(
        PrintRequests,
        wFreshRequest,
        {
            StaffNotes: Concatenate(
                If(IsBlank(wFreshRequest.StaffNotes), "", wFreshRequest.StaffNotes & " | "),
                "[NOTE] " & wNoteShortName &
                ": [Summary] [Changes] [Reason] [Context] [Comment] " & wSafeNoteText &
                " - " & Text(Now(), "m/d h:mmam/pm")
            )
        }
    )
);

// Refresh the selected item to show updated notes
Set(varSelectedItem, LookUp(PrintRequests, ID = varSelectedItem.ID));

// Clear the input
Reset(txtAddNote);

// Show success notification
Notify("Note added successfully!", NotificationType.Success)
```

> 💡 **Note Format:** Manual notes are still prefixed with `[NOTE]` so the job card counter continues to count only human-authored notes. Inside the entry, manual notes now use the same token blocks as automated entries.
>
> ⚠️ **Reserved Tokens:** The ` | ` character sequence still separates entries, and the renderer also depends on `[Summary]`, `[Changes]`, `[Reason]`, `[Context]`, `[Comment]`, and ` ~~ `. Sanitize free text before saving so users cannot accidentally break the parser.

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
    lblNotesTitle
    recNotesModal
    recNotesOverlay
```

**Testing the Notes Modal:**
1. Click "View Notes" on any job card
2. Verify Staff Notes & Activity shows audit entries and manual notes (or "None")
3. Select a staff member in the "Add note as" dropdown
4. Type a note and click "+ Add Note"
5. Verify the note appears in the Staff Notes section with the staff first name prefix
6. Click Cancel or X to close the modal

---

# STEP 13B: Building the Student Note Modal

**What you're doing:** Creating a simple modal that displays the student's submission note when they click the "📝 Note" button on a job card. This ensures staff don't miss important instructions from students.

> 💡 **Why a separate modal?** The main Notes Modal (Step 13) is reserved for staff-authored and system-generated activity. This dedicated Student Note modal keeps student-submitted instructions separate, prominent, and easy to review from the job card.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conStudentNoteModal              ← CONTAINER (set Visible here only!)
    ├── btnStudentNoteClose          ← X close button
    ├── btnStudentNoteOk             ← "Got It" button
    ├── txtStudentNoteContent        ← Note display (read-only)
    ├── lblStudentNoteTitle          ← "Student Note - REQ-00116"
    ├── recStudentNoteModal          ← White modal box
    └── recStudentNoteOverlay        ← Dark semi-transparent background
```

---

### Modal Container (conStudentNoteModal)

1. Click on **scrDashboard** in Tree view.
2. Click **+ Insert** → **Layout** → **Container**.
3. **Rename it:** `conStudentNoteModal`
4. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowStudentNoteModal > 0` |

> 💡 **Key Point:** The `Visible` property is set ONLY on this container. All child controls automatically inherit this visibility!

---

### Overlay (recStudentNoteOverlay)

5. Inside `conStudentNoteModal`, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recStudentNoteOverlay`
7. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorOverlay` |

8. Set **OnSelect:**

```powerfx
Set(varShowStudentNoteModal, 0);
Set(varSelectedItem, Blank())
```

---

### Modal Box (recStudentNoteModal)

9. Inside `conStudentNoteModal`, click **+ Insert** → **Rectangle**.
10. **Rename it:** `recStudentNoteModal`
11. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 400) / 2` |
| Y | `(Parent.Height - 250) / 2` |
| Width | `400` |
| Height | `250` |
| Fill | `varColorBgCard` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

---

### Title Label (lblStudentNoteTitle)

12. Inside `conStudentNoteModal`, click **+ Insert** → **Text label**.
13. **Rename it:** `lblStudentNoteTitle`
14. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student Note - " & varSelectedItem.ReqKey` |
| X | `recStudentNoteModal.X + 20` |
| Y | `recStudentNoteModal.Y + 15` |
| Width | `340` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `16` |
| Color | `varColorText` |

---

### Close Button (btnStudentNoteClose)

14A. Inside `conStudentNoteModal`, click **+ Insert** → **Button** (**Classic**, NOT Modern).
14B. **Rename it:** `btnStudentNoteClose`
14C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recStudentNoteModal.X + recStudentNoteModal.Width - 40` |
| Y | `recStudentNoteModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

14D. Set **OnSelect:**

```powerfx
Set(varShowStudentNoteModal, 0);
Set(varSelectedItem, Blank())
```

---

### Note Content Display (txtStudentNoteContent)

15. Inside `conStudentNoteModal`, click **+ Insert** → **Text input**.
16. **Rename it:** `txtStudentNoteContent`
17. Set properties:

| Property | Value |
|----------|-------|
| Default | `varSelectedItem.Notes` |
| X | `recStudentNoteModal.X + 20` |
| Y | `recStudentNoteModal.Y + 55` |
| Width | `360` |
| Height | `120` |
| Mode | `TextMode.MultiLine` |
| DisplayMode | `DisplayMode.View` |
| Font | `varAppFont` |
| Size | `12` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| DisabledBorderColor | `varInputBorderColor` |
| Fill | `RGBA(248, 248, 248, 1)` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

> 💡 **Read-Only Display:** Setting `DisplayMode` to `View` makes this a read-only text display. The light gray background visually indicates it's not editable.

---

### "Got It" Button (btnStudentNoteOk)

18. Inside `conStudentNoteModal`, click **+ Insert** → **Button**.
19. **Rename it:** `btnStudentNoteOk`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Got It"` |
| X | `recStudentNoteModal.X + recStudentNoteModal.Width - 100` |
| Y | `recStudentNoteModal.Y + recStudentNoteModal.Height - 50` |
| Width | `80` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

21. Set **OnSelect:**

```powerfx
Set(varShowStudentNoteModal, 0);
Set(varSelectedItem, Blank())
```

---

### ⚠️ CRITICAL: Reorder Modal Container for Proper Z-Index

**After creating the Student Note Modal, drag `conStudentNoteModal` to the TOP of the Tree view** with the other modal containers.

The correct order from top to bottom should place `conStudentNoteModal` with the other modal containers, above `recFilterBar` and `galJobCards`.

---

### ✅ Step 13B Checklist

Your Student Note Modal should now contain these controls:

```
▼ conStudentNoteModal
    btnStudentNoteClose
    btnStudentNoteOk
    txtStudentNoteContent
    lblStudentNoteTitle
    recStudentNoteModal
    recStudentNoteOverlay
```

**Testing the Student Note Modal:**
1. Find a job card where the student included a note (gold "📝 Note" button visible)
2. Click the "📝 Note" button
3. Verify the modal opens with the student's note displayed
4. Verify the ReqKey shows in the title
5. Click "Got It" or "✕" to close the modal
6. Verify the modal closes properly

---

# STEP 14: Adding the Filter Bar

**What you're doing:** Creating a dedicated filter bar between the status tabs and job cards gallery with search, sort, and filter controls.

> ⚠️ **IMPORTANT:** You must create **ALL 6 controls** in this section. The filter bar won't look right if you only create some of them. The background rectangle (`recFilterBar`) provides the visual container for the other controls.

> 💡 **Design:** A clean horizontal bar with a subtle background containing search input, sort dropdown, attention filter checkbox, refresh button, and clear button.

### Control Hierarchy

```
scrDashboard
├── recFilterBar              ← Background bar (CREATE THIS FIRST!)
├── txtSearch                 ← Search input
├── chkNeedsAttention         ← Checkbox filter
├── ddSortOrder               ← Sort dropdown
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
| Fill | `varColorBg` |
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
| HintText | `"Job Search"` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |
| RadiusTopLeft | `varInputBorderRadius` |
| RadiusTopRight | `varInputBorderRadius` |
| RadiusBottomLeft | `varInputBorderRadius` |
| RadiusBottomRight | `varInputBorderRadius` |

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
| BorderColor | `varInputBorderColor` |
| CheckboxBorderColor | `varInputBorderColor` |
| CheckmarkFill | `varColorText` |
| Color | `varColorTextMuted` |
| HoverColor | `varColorTextMuted` |

12. Set **OnCheck:** `Set(varNeedsAttention, true)`
13. Set **OnUncheck:** `Set(varNeedsAttention, false)`

---

### Sort Dropdown (ddSortOrder)

14. Click **+ Insert** → **Drop down**.
15. **Rename it:** `ddSortOrder`
16. Set properties:

| Property | Value |
|----------|-------|
| Items | `["Queue Order", "Student Name A-Z", "Student Name Z-A", "Oldest First", "Newest First", "Color A-Z", "Computer A-Z", "Printer A-Z"]` |
| Default | `varSortOrder` |
| X | `620` |
| Y | `117` |
| Width | `180` |
| Height | `36` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| AccessibleLabel | `"Sort dashboard jobs"` |

17. Set **OnChange:**

```powerfx
Set(varSortOrder, Self.Selected.Value)
```

> 💡 **Default behavior:** `Queue Order` keeps the dashboard in its normal workflow order: attention items first, then oldest jobs first.

---

### Clear Filters Button (btnClearFilters)

18. Click **+ Insert** → **Button**.
19. **Rename it:** `btnClearFilters`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕ Clear"` |
| X | `Parent.Width - 86` |
| Y | `117` |
| Width | `70` |
| Height | `varBtnHeight` |
| Fill | `ColorFade(varColorNeutral, varSecondaryFade)` |
| Color | `varColorTextMuted` |
| HoverFill | `ColorFade(varColorNeutral, 55%)` |
| PressedFill | `ColorFade(varColorNeutral, 45%)` |
| BorderColor | `varSecondaryBtnBorderColor` |
| BorderThickness | `2` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

21. Set **OnSelect:**

```powerfx
Reset(txtSearch);
Set(varSearchText, "");
Set(varSortOrder, "Queue Order");
Reset(ddSortOrder);
Set(varNeedsAttention, false);
Reset(chkNeedsAttention)
```

---

### Refresh Data Button (btnRefresh)

22. Click **+ Insert** → **Button**.
23. **Rename it:** `btnRefresh`
24. Set properties:

| Property | Value |
|----------|-------|
| Text | `"↻ Refresh"` |
| X | `Parent.Width - 276` |
| Y | `117` |
| Width | `80` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

25. Set **OnSelect:**

```powerfx
Concurrent(
    Refresh(PrintRequests),
    Refresh(BuildPlates),
    Refresh(Payments)
);
ClearCollect(colAllBuildPlates, BuildPlates);
ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}));
ClearCollect(colAllPayments, Payments)
```

> **Why this button?** Power Apps caches SharePoint data. When new requests are submitted or payments/plates are updated elsewhere, the tab counts, job-card summaries, and payment indicators won't update automatically. Clicking this button forces a fresh data fetch so staff see the latest submissions and accurate counts. The three `Refresh` calls run inside `Concurrent` so the app waits only for the slowest list, not the sum of all three.

---

### ⚠️ CRITICAL: Reorder Modal Containers for Proper Z-Index

**After creating the filter bar controls, you MUST reorder the modal CONTAINERS so they appear ON TOP of the filter bar when visible.**

In Power Apps, controls that are **higher in the Tree view** (closer to the top) render **on top of** controls that are lower. 

> 🎯 **With Containers:** You only need to move ONE container per modal instead of 15+ individual controls! This is much easier.

**How to fix:**

1. In the **Tree view** (left panel), locate these containers:
   - `conPaymentModal`
   - `conDetailsModal`
   - `conCompleteModal`
   - `conArchiveModal`
   - `conApprovalModal`
   - `conRejectModal`

2. **Drag each container** to the **TOP** of the Tree view (just under `scrDashboard`).

3. The correct order from top to bottom should be:
   ```
   scrDashboard
   ├── conPaymentModal           ← Modal containers at TOP
   ├── conDetailsModal
   ├── conCompleteModal
   ├── conArchiveModal
   ├── conApprovalModal
   ├── conRejectModal            ← ...all above filter bar
   ├── recFilterBar              ← Filter bar BELOW modal containers
   ├── txtSearch
   ├── chkNeedsAttention
   ├── ddSortOrder
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
| Color | `If(ThisItem.NeedsAttention, RGBA(255, 215, 0, 1), varColorDisabled)` |
| Tooltip | `If(ThisItem.NeedsAttention, "Mark as handled", "Mark as needing attention")` |
| Visible | `!varBatchSelectMode` |
| DisplayMode | `If(varIsLoading, DisplayMode.Disabled, DisplayMode.Edit)` |

5. Set **OnSelect:**

```powerfx
Set(varIsLoading, true);
Set(varLoadingMessage, "Updating attention flag...");

// Capture current state before patching so we know which direction the toggle went
Set(varWasAttention, ThisItem.NeedsAttention);

Set(
    varAttentionToggleSuccess,
    IfError(
        Patch(PrintRequests, LookUp(PrintRequests, ID = ThisItem.ID), { NeedsAttention: !varWasAttention });
        true,
        Notify("Could not update attention flag. Please try again.", NotificationType.Error, 3000);
        false
    )
);

// Play sound only when turning attention ON (was false, now true)
If(varAttentionToggleSuccess && !varWasAttention, Reset(audNotification); Set(varPlaySound, true));
If(varAttentionToggleSuccess, Notify("Attention flag updated", NotificationType.Success, 1500));

Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Simple Toggle:** This is a quick flag toggle for staff to mark items needing attention. When they turn the lightbulb *on* (NeedsAttention = true), we call `Reset(audNotification)` then `Set(varPlaySound, true)` so the chime plays. It doesn't log to the audit trail since it's a temporary visual indicator, not a workflow action.

> **Note:** The `recCardBackground` styling for batch selection (green highlight) and attention highlighting (yellow/orange) was already configured in Step 7 with the complete formulas.

---

### Batch Selection Checkbox Icon (icoBatchCheck)

6. Inside `galJobCards`, click **+ Insert** → **Icons** → select any icon.
7. **Rename it:** `icoBatchCheck`
8. Set properties:

| Property | Value |
|----------|-------|
| Icon | `If(ThisItem.ID in colBatchItems.ID, Icon.Check, Icon.Add)` |
| X | `Parent.TemplateWidth - 40` |
| Y | `10` |
| Width | `28` |
| Height | `28` |
| Color | `If(ThisItem.ID in colBatchItems.ID, varColorSuccess, RGBA(180, 180, 180, 1))` |
| Visible | `varBatchSelectMode && ThisItem.Status.Value = "Completed"` |
| OnSelect | `If(ThisItem.ID in colBatchItems.ID, Remove(colBatchItems, LookUp(colBatchItems, ID = ThisItem.ID)), Collect(colBatchItems, ThisItem))` |

> 💡 **Batch Selection Indicator:** This icon appears in the top-right corner of cards when batch select mode is active. Shows a filled checkmark for selected items and an empty circle for unselected items. Only appears on "Completed" status cards since batch payment only applies to those.

---

### Batch Selection Footer Panel (conBatchSelectionFooter)

This floating panel appears at the bottom of the screen when batch select mode is active, showing selection count, estimated total, and action buttons.

9. Click on **scrDashboard** in Tree view (not inside galJobCards).
10. Click **+ Insert** → **Layout** → **Container**.
11. **Rename it:** `conBatchSelectionFooter`
12. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `Parent.Height - 80` |
| Width | `Parent.Width` |
| Height | `80` |
| Fill | `RGBA(255, 255, 255, 0.98)` |
| Visible | `varBatchSelectMode` |

> 💡 **Key Point:** This container is positioned at the bottom of the screen and only appears when batch select mode is active.

---

### Footer Background (recBatchFooterBg)

13. Inside `conBatchSelectionFooter`, click **+ Insert** → **Rectangle**.
14. **Rename it:** `recBatchFooterBg`
15. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `Color.White` |

16. Set **BorderColor:**

```powerfx
varColorBorderLight
```

17. Set **BorderThickness:** `1`

---

### Batch Mode Label (lblBatchModeActive)

18. Inside `conBatchSelectionFooter`, click **+ Insert** → **Text label**.
19. **Rename it:** `lblBatchModeActive`
20. Set properties:

| Property | Value |
|----------|-------|
| Text | `"BATCH MODE"` |
| X | `20` |
| Y | `8` |
| Width | `100` |
| Height | `20` |
| FontWeight | `FontWeight.Bold` |
| Size | `10` |
| Color | `varColorPrimary` |

---

### Selection Count Label (lblBatchCount)

21. Inside `conBatchSelectionFooter`, click **+ Insert** → **Text label**.
22. **Rename it:** `lblBatchCount`
23. Set properties:

| Property | Value |
|----------|-------|
| X | `20` |
| Y | `30` |
| Width | `200` |
| Height | `20` |
| Size | `12` |
| Color | `varColorText` |

24. Set **Text:**

```powerfx
CountRows(colBatchItems) & " item" & If(CountRows(colBatchItems) <> 1, "s", "") & " selected"
```

---

### Estimated Total Label (lblBatchEstTotal)

25. Inside `conBatchSelectionFooter`, click **+ Insert** → **Text label**.
26. **Rename it:** `lblBatchEstTotal`
27. Set properties:

| Property | Value |
|----------|-------|
| X | `20` |
| Y | `50` |
| Width | `200` |
| Height | `20` |
| Size | `11` |
| Color | `varColorTextMuted` |

28. Set **Text:**

```powerfx
"Est. Total: " & Text(Sum(colBatchItems, EstimatedCost), "[$-en-US]$#,##0.00")
```

---

### Selected Students Label (lblBatchStudents)

29. Inside `conBatchSelectionFooter`, click **+ Insert** → **Text label**.
30. **Rename it:** `lblBatchStudents`
31. Set properties:

| Property | Value |
|----------|-------|
| X | `230` |
| Y | `30` |
| Width | `Parent.Width - 500` |
| Height | `40` |
| Size | `10` |
| Color | `varColorTextMuted` |
| VerticalAlign | `VerticalAlign.Top` |

32. Set **Text:**

```powerfx
Concat(Distinct(colBatchItems, Student.DisplayName), Value, ", ")
```

> 💡 **Shows Students:** Lists all unique student names in the batch, separated by commas. Useful when picking up jobs for multiple students.

---

### Cancel Batch Button (btnBatchCancel)

33. Inside `conBatchSelectionFooter`, click **+ Insert** → **Button**.
34. **Rename it:** `btnBatchCancel`
35. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `Parent.Width - 280` |
| Y | `(Parent.Height - varBtnHeight) / 2` |
| Width | `100` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

36. Set **OnSelect:**

```powerfx
Clear(colBatchItems);
Set(varBatchSelectMode, false);
Notify("Batch selection cancelled.", NotificationType.Information)
```

---

### Process Batch Payment Button (btnProcessBatchPayment)

37. Inside `conBatchSelectionFooter`, click **+ Insert** → **Button**.
38. **Rename it:** `btnProcessBatchPayment`
39. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Process Batch Payment"` |
| X | `Parent.Width - 170` |
| Y | `(Parent.Height - varBtnHeight) / 2` |
| Width | `150` |
| Height | `varBtnHeight` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorSuccess, -15%)` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| DisplayMode | `If(CountRows(colBatchItems) > 0, DisplayMode.Edit, DisplayMode.Disabled)` |

40. Set **OnSelect:**

```powerfx
If(
    CountRows(Distinct(colBatchItems, Method.Value)) > 1,
    Notify(
        "Cannot open batch payment: selection mixes Filament and Resin. Remove items until only one print method remains.",
        NotificationType.Warning
    ),
    Set(varShowBatchPaymentModal, 1)
)
```

> 💡 **Opens Batch Modal:** This button opens the Batch Payment Modal (Step 12E) where staff enters the combined weight and transaction number for all selected items. The **`Distinct`** guard enforces **one `Method.Value` per batch** (defense in depth if data ever drifts).

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
    ├── lblFileStaffLabel        ← "Performing Action As"
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
| Text | `"Edit Files"` |
| X | `12` |
| Y | `360` |
| Width | `(Parent.TemplateWidth - 40) / 3` |
| Height | `varBtnHeight` |
| Fill | `Color.White` |
| Color | `varColorPrimary` |
| HoverColor | `Color.White` |
| HoverFill | `varColorPrimary` |
| PressedFill | `ColorFade(varColorPrimary, -15%)` |
| BorderColor | `varColorPrimary` |
| BorderThickness | `varInputBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Visible | `!varBatchSelectMode` |

> ⚠️ **Batch Mode:** Button is hidden when `varBatchSelectMode = true` to allow clicking the card for batch selection.

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
| Fill | `varColorOverlay` |

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
| Fill | `varColorBgCard` |
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
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `RGBA(0, 120, 212, 1)` |

---

### Close Button (btnFileClose)

15A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
15B. **Rename it:** `btnFileClose`
15C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recFileModal.X + recFileModal.Width - 40` |
| Y | `recFileModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

15D. Set **OnSelect:**

```powerfx
ResetForm(frmAttachmentsEdit);
Set(varShowAddFileModal, 0);
Set(varSelectedItem, Blank());
Reset(ddFileActor)
```

---

### Staff Label (lblFileStaffLabel)

16. Click **+ Insert** → **Text label**.
17. **Rename it:** `lblFileStaffLabel`
18. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
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
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

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
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `2` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
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
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

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
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `varColorText` |
| Visible | `true` |

#### Notes Header (lblNotesHeader)

4. Click **+ Insert** → **Text label**.
5. **Rename it:** `lblNotesHeader`
6. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Notes (" & If(IsBlank(ThisItem.StaffNotes), 0, CountRows(Split(ThisItem.StaffNotes, "[NOTE]")) - 1) & ")"` |
| X | `lblMessagesHeader.X + lblMessagesHeader.Width + 20` |
| Y | `lblMessagesHeader.Y` |
| Width | `200` |
| Height | `20` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `varColorText` |
| Visible | `true` |

> 💡 **Note:** This counts only **manual staff notes** (tagged with `[NOTE]`), not automated audit entries like approvals, rejections, or payments. The formula splits on `[NOTE]` and subtracts 1 (since splitting "A[NOTE]B" returns 2 parts). Automated entries are still visible in the Notes modal but don't increment this counter.

#### View Messages Button (btnViewMessages)

7. Click **+ Insert** → **Button**.
8. **Rename it:** `btnViewMessages`
9. Set properties:

| Property | Value |
|----------|-------|
| Text | `"View Student Messages"` |
| X | `11` |
| Y | `317` |
| Width | `100` |
| Height | `varBtnHeight` |
| Fill | `If(!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID)), RGBA(255, 46, 46, 1), Color.White)` |
| Color | `If(!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID)), RGBA(255, 255, 255, 1), varColorPrimary)` |
| HoverColor | `Color.White` |
| HoverFill | `If(!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID)), RGBA(220, 40, 40, 1), varColorPrimary)` |
| PressedFill | `If(!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID)), RGBA(200, 35, 35, 1), ColorFade(varColorPrimary, -15%))` |
| BorderColor | `If(!IsEmpty(Filter(RequestComments, RequestID = ThisItem.ID)), RGBA(184, 0, 0, 1), varColorPrimary)` |
| BorderThickness | `varInputBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

10. Set **OnSelect:**

```powerfx
Set(varShowViewMessagesModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> **Note:** This button opens the View Messages Modal (Step 17D) which displays the full conversation thread in a scrollable modal.

---

#### Unread Badge Background (recUnreadBadge)

11. Still in `galJobCards`, click **+ Insert** → **Text label**.
12. **Rename it:** `lblUnreadBadge`
13. Set properties:

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

> **Note:** The unread badge uses two layered controls: a rounded rectangle (`recUnreadBadge`) for the circular red background, and a label (`lblUnreadBadge`) for the white text on top. Both share the same visibility condition so they appear/disappear together.

---

#### Job Card Messages & Notes Summary

With these controls, each job card shows:
- **Messages (X)** header with total message count
- **Notes (X)** header with manual note count
- **View Messages** button to open the full conversation modal
- **Red unread badge** with count of unread student replies

The full messaging functionality (view history AND compose) is in the unified Messages Modal (Step 17D).

---

## Step 17C: Adding the Message Button to Job Cards

The **live app** uses a single compact control **`btnViewMessages`** (label **Messages**) plus **`lblUnreadBadge`** — there is **no** separate `btnCardSendMessage` on the card. Compose/reply happens inside **Step 17D** (`conViewMessagesModal`).

> **Legacy docs:** Earlier versions added `btnCardSendMessage` beside **Files** / **Archive**. If you still have that control, you can delete it and rely on `btnViewMessages` only.

---

### Gallery message entry (`btnViewMessages`)

1. Inside `galJobCards`, confirm the control **`btnViewMessages`** (**Classic/Button**).
2. Typical pattern (match live YAML):

| Property | Example (tune X/Y to your template) |
|----------|--------------------------------------|
| Text | `"Messages"` |
| OnSelect | `Set(varSelectedItem, ThisItem); Set(varShowViewMessagesModal, ThisItem.ID)` |
| Size | `9` (compact tier) |
| Font | `varAppFont` |

3. **`lblUnreadBadge`** — small label over the button showing unread count; **Visible** when count `> 0`.

> **Note:** `btnFiles`, `btnViewMessages`, and `btnArchive` share the action row on the card; spacing is driven by each control’s `X` / `Width` in the live app.

---

## Step 17D: Unified Messages Modal

**What you're doing:** Creating a unified modal that displays the conversation thread between staff and students AND allows composing new messages — all in one place.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

### Overview

This unified modal displays the complete message history AND allows composing new messages:
- Full message content (no truncation)
- Clear visual distinction between inbound/outbound messages
- Scrollable conversation thread
- Integrated compose section for sending messages without switching modals

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conViewMessagesModal            ← CONTAINER (set Visible here only!)
    ├── btnViewMsgClose             ← X close button
    ├── btnViewMsgSend              ← "Send Message" button
    ├── btnViewMsgCancel            ← "Cancel" button
    ├── btnViewMsgMarkRead          ← "Mark All Read" button (visible when unread)
    ├── lblViewMsgCharCount         ← Character count display
    ├── txtViewMsgBody              ← Message body input
    ├── lblViewMsgBodyLabel         ← "Message"
    ├── txtViewMsgSubject           ← Subject input
    ├── lblViewMsgSubjectLabel      ← "Subject"
    ├── ddViewMsgStaff              ← Staff dropdown
    ├── lblViewMsgStaffLabel        ← "Performing Action As"
    ├── recViewMsgSeparator         ← Line separating history from compose
    ├── galViewMessages             ← Flexible-height message gallery
    │   ├── recVMsgBg               ← Background (direction-based colors)
    │   ├── icoVMsgDirection        ← Direction icon (send/mail)
    │   ├── lblVMsgAuthor           ← Author name + timestamp
    │   ├── lblVMsgDirectionBadge   ← SENT/REPLY badge
    │   └── lblVMsgContent          ← Full message text
    ├── lblViewMsgSubtitle          ← "Student: Name (email)"
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
| Fill | `varColorOverlay` |

---

### Modal Box (recViewMsgModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recViewMsgModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 750) / 2` |
| Width | `600` |
| Height | `750` |
| Fill | `varColorBgCard` |
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
| Y | `recViewMsgModal.Y + 12` |
| Width | `400` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `varColorPrimary` |

---

### Modal Subtitle (lblViewMsgSubtitle)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblViewMsgSubtitle`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student: " & varSelectedItem.Student.DisplayName & " (" & varSelectedItem.StudentEmail & ")"` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 38` |
| Width | `400` |
| Height | `20` |
| Font | `varAppFont` |
| Size | `12` |
| Color | `varColorText` |

---

### Close Button (btnViewMsgClose)

16A. Click **+ Insert** → **Button** (**Classic**, NOT Modern).
16B. **Rename it:** `btnViewMsgClose`
16C. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recViewMsgModal.X + recViewMsgModal.Width - 40` |
| Y | `recViewMsgModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Color.Transparent` |
| Color | `varColorTextMuted` |
| HoverBorderColor | `Color.Transparent` |
| HoverColor | `RGBA(255, 255, 255, 1)` |
| HoverFill | `RGBA(255, 46, 46, 1)` |
| PaddingBottom | `0` |
| PaddingLeft | `0` |
| PaddingRight | `0` |
| PaddingTop | `0` |
| PressedBorderColor | `Color.Transparent` |
| PressedColor | `RGBA(245, 245, 245, 1)` |
| PressedFill | `RGBA(220, 32, 32, 1)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `14` |
| Font | `varAppFont` |

16D. Set **OnSelect:**

```powerfx
Set(varShowViewMessagesModal, 0);
Set(varSelectedItem, Blank());
Reset(txtViewMsgSubject);
Reset(txtViewMsgBody);
Reset(ddViewMsgStaff)
```

---

### Messages Gallery (galViewMessages)

21. Click **+ Insert** → **Blank flexible height gallery**.
22. **Rename it:** `galViewMessages`
23. Set properties:

| Property | Value |
|----------|-------|
| Items | `Sort(Filter(RequestComments, RequestID = varSelectedItem.ID), SentAt, SortOrder.Descending)` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 75` |
| Width | `560` |
| Height | `335` |
| TemplateSize | `80` |
| TemplatePadding | `8` |
| ShowScrollbar | `true` |

> **Use a Blank Flexible Height Gallery:** This is the correct gallery type for a message thread where each item can have a different height. It starts empty, which is what you want here because you are building a custom message bubble layout from scratch. Keep scrolling at the gallery level only, not inside individual message controls.

---

#### Inside galViewMessages — Message Background

24. Inside `galViewMessages`, add a **Rectangle**:
   - **Name:** `recVMsgBg`
   - **X:** `If(ThisItem.Direction.Value = "Outbound", Parent.TemplateWidth * (1 - varMessageBubbleWidth), 0)`
   - **Y:** `0`
   - **Width:** `Parent.TemplateWidth * varMessageBubbleWidth`
   - **Height:** `Max(56, lblVMsgContent.Y + lblVMsgContent.Height + 10)`
   - **Fill:** `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 0.1), RGBA(255, 248, 230, 1))`
   - **RadiusTopLeft:** `6`
   - **RadiusTopRight:** `6`
   - **RadiusBottomLeft:** `6`
   - **RadiusBottomRight:** `6`

> **Why this works:** The background rectangle grows to the bottom of the message text, so the gallery can size each row to the actual bubble height instead of reserving empty space for every item.

---

#### Inside galViewMessages — Direction Icon

25. Inside `galViewMessages`, click **+ Insert** → **Icons** → select any icon.
26. **Rename it:** `icoVMsgDirection`
27. Set properties:

| Property | Value |
|----------|-------|
| Icon | `If(ThisItem.Direction.Value = "Outbound", Icon.ChevronRight, Icon.ChevronLeft)` |
| X | `recVMsgBg.X + 10` |
| Y | `8` |
| Width | `16` |
| Height | `16` |
| Color | `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 1), RGBA(200, 150, 50, 1))` |
| DisplayMode | `DisplayMode.View` |

---

#### Inside galViewMessages — Author Label

28. Inside `galViewMessages`, click **+ Insert** → **Text label**.
29. **Rename it:** `lblVMsgAuthor`
30. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(IsBlank(ThisItem.Author0.DisplayName), "Unknown", With({parts: Split(ThisItem.Author0.DisplayName, " ")}, First(parts).Value & " " & Last(parts).Value)) & " • " & Text(ThisItem.SentAt, "mmm d, yyyy h:mm AM/PM")` |
| X | `recVMsgBg.X + 32` |
| Y | `6` |
| Width | `recVMsgBg.Width - 95` |
| AutoHeight | `true` |
| Height | `Remove any fixed value` |
| Size | `10` |
| Color | `If(ThisItem.Direction.Value = "Outbound", varColorPrimary, RGBA(180, 130, 40, 1))` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |

> **Important:** Use `Author0` (the custom Person column), not `Author` (the built-in "Created By" field). Using `Author` would always show the logged-in user who created the record, not the staff member selected in the dropdown. Using `AutoHeight` here also prevents long names and timestamps from overlapping the message body.

---

#### Inside galViewMessages — Direction Badge

31. Inside `galViewMessages`, click **+ Insert** → **Text label**.
32. **Rename it:** `lblVMsgDirectionBadge`
33. Set properties:

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

34. Inside `galViewMessages`, click **+ Insert** → **Text label**.
35. **Rename it:** `lblVMsgContent`
36. Set properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Message` |
| X | `recVMsgBg.X + 10` |
| Y | `lblVMsgAuthor.Y + lblVMsgAuthor.Height + 8` |
| Width | `recVMsgBg.Width - 20` |
| AutoHeight | `true` |
| Height | `Remove any fixed value` |
| Overflow | `Overflow.Hidden` |
| Size | `11` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Top` |

> **Note:** Using `AutoHeight` with `Overflow.Hidden` allows each message to expand to fit its content without showing a scrollbar on the label itself. Do not set a fixed `Height` or `Overflow.Scroll` on this label. The gallery scrolls to show all messages rather than each message having its own scrollbar.

> **How the layout works:** In a flexible height gallery, items stack correctly when the controls inside each item are allowed to size naturally. The message body sits below `lblVMsgAuthor`, and the background grows to the bottom of `lblVMsgContent`; then Power Apps places the next message underneath the fully rendered bubble automatically.

### Common Fixes If Messages Still Overlap

If the thread still overlaps after these updates, check these exact issues:

- `galViewMessages` was inserted as **Vertical** instead of **Blank flexible height gallery**
- `lblVMsgAuthor` still has a fixed `Height` like `18`
- `lblVMsgContent` still has a fixed `Height` like `146`
- `lblVMsgContent` still uses `Overflow.Scroll`
- one or more controls inside the gallery were given fixed heights instead of sizing from the content

---

### Compose Section Separator (recViewMsgSeparator)

37. Click **+ Insert** → **Rectangle**.
38. **Rename it:** `recViewMsgSeparator`
39. Set properties:

| Property | Value |
|----------|-------|
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 315` |
| Width | `560` |
| Height | `1` |
| Fill | `RGBA(200, 200, 200, 1)` |

---

### Staff Attribution Label (lblViewMsgStaffLabel)

40. Click **+ Insert** → **Text label**.
41. **Rename it:** `lblViewMsgStaffLabel`
42. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As"` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 325` |
| Width | `200` |
| Height | `20` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `varColorText` |

---

### Staff Attribution Dropdown (ddViewMsgStaff)

43. Click **+ Insert** → **Combo box**.
44. **Rename it:** `ddViewMsgStaff`
45. Set properties:

| Property | Value |
|----------|-------|
| Items | `colStaff` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 348` |
| Width | `250` |
| Height | `36` |
| DisplayFields | `["MemberName"]` |
| SearchFields | `["MemberName"]` |
| DefaultSelectedItems | `Blank()` |
| InputTextPlaceholder | `"Pick your name"` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |

---

### Subject Label (lblViewMsgSubjectLabel)

46. Click **+ Insert** → **Text label**.
47. **Rename it:** `lblViewMsgSubjectLabel`
48. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Subject"` |
| X | `recViewMsgModal.X + 290` |
| Y | `recViewMsgModal.Y + 325` |
| Width | `100` |
| Height | `20` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `varColorText` |

---

### Subject Input (txtViewMsgSubject)

49. Click **+ Insert** → **Text input**.
50. **Rename it:** `txtViewMsgSubject`
51. Set properties:

| Property | Value |
|----------|-------|
| X | `recViewMsgModal.X + 290` |
| Y | `recViewMsgModal.Y + 348` |
| Width | `290` |
| Height | `36` |
| HintText | `"Brief subject..."` |
| Default | `""` |
| MaxLength | `200` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Message Body Label (lblViewMsgBodyLabel)

52. Click **+ Insert** → **Text label**.
53. **Rename it:** `lblViewMsgBodyLabel`
54. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Message"` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 395` |
| Width | `150` |
| Height | `20` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| Color | `varColorText` |

---

### Message Body Input (txtViewMsgBody)

55. Click **+ Insert** → **Text input**.
56. **Rename it:** `txtViewMsgBody`
57. Set properties:

| Property | Value |
|----------|-------|
| Default | `""` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 418` |
| Width | `560` |
| Height | `130` |
| Mode | `TextMode.MultiLine` |
| DisplayMode | `DisplayMode.Edit` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |
| HintText | `"Type your message to the student..."` |

---

### Character Count Label (lblViewMsgCharCount)

58. Click **+ Insert** → **Text label**.
59. **Rename it:** `lblViewMsgCharCount`
60. Set properties:

| Property | Value |
|----------|-------|
| X | `recViewMsgModal.X + 450` |
| Y | `recViewMsgModal.Y + 552` |
| Width | `130` |
| Height | `22` |
| Size | `8` |
| Align | `Align.Center` |

61. Set **Text:**

```powerfx
Len(txtViewMsgBody.Text) & " characters"
```

62. Set **Color:**

```powerfx
varColorTextMuted
```

---

### Cancel Button (btnViewMsgCancel)

63. Click **+ Insert** → **Button**.
64. **Rename it:** `btnViewMsgCancel`
65. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recViewMsgModal.X + 340` |
| Y | `recViewMsgModal.Y + recViewMsgModal.Height - 50` |
| Width | `100` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

66. Set **OnSelect:**

```powerfx
Set(varShowViewMessagesModal, 0);
Set(varSelectedItem, Blank());
Reset(txtViewMsgSubject);
Reset(txtViewMsgBody);
Reset(ddViewMsgStaff)
```

---

### Send Message Button (btnViewMsgSend)

67. Click **+ Insert** → **Button**.
68. **Rename it:** `btnViewMsgSend`
69. Set properties:

| Property | Value |
|----------|-------|
| Text | `"📧 Send Message"` |
| X | `recViewMsgModal.X + 450` |
| Y | `recViewMsgModal.Y + recViewMsgModal.Height - 50` |
| Width | `130` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

70. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddViewMsgStaff.Selected) && 
    !IsBlank(txtViewMsgSubject.Text) && 
    Len(txtViewMsgSubject.Text) >= 3 &&
    !IsBlank(txtViewMsgBody.Text) &&
    Len(txtViewMsgBody.Text) >= 10,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

71. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Sending message...");

// Create the message in RequestComments with Direction field
Patch(
    RequestComments,
    Defaults(RequestComments),
    {
        Title: txtViewMsgSubject.Text,
        RequestID: varSelectedItem.ID,
        ReqKey: varSelectedItem.ReqKey,
        Message: txtViewMsgBody.Text,
        Author0: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & ddViewMsgStaff.Selected.MemberEmail,
            Department: "",
            DisplayName: ddViewMsgStaff.Selected.MemberName,
            Email: ddViewMsgStaff.Selected.MemberEmail,
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
    LookUp(PrintRequests, ID = varSelectedItem.ID),
    {
        LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Comment Added"),
        LastActionBy: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & ddViewMsgStaff.Selected.MemberEmail,
            Department: "",
            DisplayName: ddViewMsgStaff.Selected.MemberName,
            Email: ddViewMsgStaff.Selected.MemberEmail,
            JobTitle: "",
            Picture: ""
        },
        LastActionAt: Now()
    }
);

// Reset compose fields but keep modal open to see new message
Reset(txtViewMsgSubject);
Reset(txtViewMsgBody);
Reset(ddViewMsgStaff);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "");

Notify("Message sent! Student will receive email notification.", NotificationType.Success)
```

> **Note:** After sending, the modal stays open so staff can see the new message appear in the conversation. The compose fields are reset for easy follow-up messages.

---

### Mark Read Button (btnViewMsgMarkRead)

72. Click **+ Insert** → **Button**.
73. **Rename it:** `btnViewMsgMarkRead`
74. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Mark All Read"` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + recViewMsgModal.Height - 50` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `ColorFade(varColorDanger, varSecondaryFade)` |
| Color | `varColorDanger` |
| HoverFill | `ColorFade(varColorDanger, 55%)` |
| PressedFill | `ColorFade(varColorDanger, 45%)` |
| BorderColor | `Color.Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `!IsEmpty(Filter(RequestComments, RequestID = varSelectedItem.ID, Direction.Value = "Inbound", ReadByStaff = false))` |
| DisplayMode | `If(varIsLoading, DisplayMode.Disabled, DisplayMode.Edit)` |

75. Set **OnSelect:**

```powerfx
Set(varIsLoading, true);
Set(varLoadingMessage, "Marking messages read...");

// Mark all inbound unread comments as read
UpdateIf(
    RequestComments,
    RequestID = varSelectedItem.ID &&
    Direction.Value = "Inbound" &&
    ReadByStaff = false,
    { ReadByStaff: true }
);

// Clear the NeedsAttention flag on the request
Set(
    varMarkReadSuccess,
    IfError(
        Patch(
            PrintRequests,
            LookUp(PrintRequests, ID = varSelectedItem.ID),
            { NeedsAttention: false }
        );
        true,
        Notify("Could not clear attention flag. Please try again.", NotificationType.Error, 3000);
        false
    )
);

If(varMarkReadSuccess, Notify("Messages marked as read", NotificationType.Success));

Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> **Note:** This button only appears when there are unread inbound messages. After clicking, it disappears, the NeedsAttention flag is cleared, and the unread badge on the job card also updates.

---

### Testing the Unified Messages Modal

**Message History:**
- [ ] "View Messages" button appears on job cards
- [ ] Clicking opens modal with correct title (Messages - REQ-XXXXX) and subtitle (Student name + email)
- [ ] Messages display with correct direction styling (blue=outbound, yellow=inbound)
- [ ] Full message content visible (no truncation)
- [ ] No individual message shows its own scrollbar
- [ ] Long author names wrap without overlapping the message body
- [ ] Short and long messages stack without overlapping each other
- [ ] Messages scroll when there are many
- [ ] Close button (X) closes modal and resets compose fields
- [ ] "Mark All Read" button appears when there are unread messages
- [ ] Clicking "Mark All Read" clears unread status and hides the button
- [ ] Unread badge on job card updates after marking read

**Compose Section:**
- [ ] Staff dropdown shows all staff members
- [ ] Subject field accepts input with hint text
- [ ] Message body is a multi-line text area
- [ ] Character count updates as you type
- [ ] Send button disabled until staff selected, subject (3+ chars), and message (10+ chars) entered
- [ ] Sending message creates entry in RequestComments list with Direction = Outbound
- [ ] After sending, compose fields reset but modal stays open
- [ ] New message appears in the conversation above
- [ ] Success notification appears
- [ ] Cancel button closes modal and resets all fields

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
| Fill | `varColorBgCard` |
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

# STEP 17F: Adding the Audio Notification System

**What you're doing:** Adding automatic data refresh and audio notifications so staff are alerted when new items need attention, without having to manually check or refresh the dashboard.

> 💡 **Why this matters:** Student workers often miss when a print moves to "Needs Attention" status because there's no audible alert. This system plays a notification sound when new attention items appear, ensuring timely responses.

---

## Important: Browser Autoplay Policy

> ⚠️ **Critical Limitation:** Modern browsers (Chrome, Edge, Firefox) and the Power Apps for Windows desktop app (which uses WebView2/Chromium) **block audio from playing until the user interacts with the page**. This is a browser security feature, not a Power Apps bug.
>
> **What this means:** The very first time a user opens the app, they must click somewhere (any button, the canvas, a tab) before audio notifications will work. After that first click, all subsequent audio triggers will play automatically.
>
> **Practical impact:** Since staff will naturally click something within seconds of opening the app (e.g., clicking a status tab or job card), this is rarely an issue in practice.

---

## Overview

The audio notification system consists of two components:

1. **Timer Control** — Automatically refreshes data every 30 seconds and triggers sound when the NeedsAttention *count* increases (e.g. student reply via Flow, staff manually flagging a job)
2. **Audio Control** — Plays when `Reset(audNotification)` is called followed by `Set(varPlaySound, true)`

**When the sound plays (exact conditions):**

| # | Condition | Where it happens |
|---|-----------|------------------|
| 1 | **Timer:** The number of items with NeedsAttention = Yes **increases** since the last timer run (every 30 seconds). | Flow E sets NeedsAttention when a student replies by email. Timer compares current count to `varPrevAttentionCount`. |
| 2 | **Lightbulb:** A staff member clicks the lightbulb on a job card to turn **on** “needs attention” (card was gray, becomes yellow). | User taps the lightbulb icon on a card; the Patch sets NeedsAttention = true and we trigger the sound. |

The sound does **not** play when: count stays the same or goes down, when you toggle the lightbulb **off**, or on app startup (we only compare count after the first timer run).

```
┌─────────────────────────────────────────────────────────────┐
│  Timer (30s)  →  Refresh Data  →  Count NeedsAttention     │
│                                          ↓                  │
│                              Compare to Previous Count      │
│                                          ↓                  │
│                              If Increased → Play Sound      │
└─────────────────────────────────────────────────────────────┘
```

---

## Uploading the Notification Sound

Before adding the Audio control, you need to upload a sound file to the app's Media library.

### Instructions

1. Find or create a notification sound file:
   - Use a short (1-2 second) pleasant chime or bell tone
   - Supported formats: `.mp3`, `.wav`, `.m4a`
   - Avoid harsh or alarming sounds that could startle workers
   - Free options: [Pixabay Sound Effects](https://pixabay.com/sound-effects/), [Freesound.org](https://freesound.org/)

2. In Power Apps Studio, click the **Media** icon in the left panel (image icon).

3. Click **+ Add media** → **Upload**.

4. Select your notification sound file.

5. After upload, the file will appear in your Media library as `notification_chime`.

> 💡 **Note:** Power Apps removes the file extension in the Media library, so `notification_chime.mp3` becomes `notification_chime`.

---

## Adding the Timer Control (tmrAutoRefresh)

The Timer control automatically refreshes data and checks for new NeedsAttention items.

### Instructions

1. Make sure you're on `scrDashboard` (not inside a gallery or container).

2. Click **+ Insert** → **Input** → **Timer**.

3. **Rename it:** `tmrAutoRefresh`

4. Set properties:

| Property | Value |
|----------|-------|
| Duration | `varRefreshInterval` |
| Repeat | `true` |
| AutoStart | `true` |
| Visible | `false` |

> ⚠️ **Important:** Set `Visible` to `false` — the timer doesn't need to be seen by users.

5. Set **OnTimerEnd:**

**⬇️ FORMULA: Paste into tmrAutoRefresh.OnTimerEnd**

```powerfx
// Refresh data from SharePoint concurrently
Concurrent(
    Refresh(PrintRequests),
    Refresh(BuildPlates),
    Refresh(Payments)
);

// Reload local collections used by job-card summaries
ClearCollect(colAllBuildPlates, BuildPlates);
ClearCollect(colBuildPlateSummary, ForAll(Distinct(colAllBuildPlates, RequestID) As grp, {RequestID: grp.Value, TotalCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), CompletedCount: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, !StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up"))), ReprintTotal: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"))), ReprintCompleted: CountRows(Filter(colAllBuildPlates, RequestID = grp.Value, StartsWith(Trim(Coalesce(DisplayLabel, "")), "Reprint"), Or(Status.Value = "Completed", Status.Value = "Picked Up")))}));
ClearCollect(colAllPayments, Payments);

// Reload NeedsAttention items into local collection (avoids delegation)
ClearCollect(colNeedsAttention, Filter(PrintRequests, NeedsAttention = true));

// Count from local collection (no delegation warning)
Set(varCurrentAttentionCount, CountRows(colNeedsAttention));

// If count increased, play notification sound
If(
    varCurrentAttentionCount > varPrevAttentionCount,
    Reset(audNotification);
    Set(varPlaySound, true)
);

// Update previous count for next comparison
Set(varPrevAttentionCount, varCurrentAttentionCount)
```

> ⚠️ **Delegation Note:** We use `ClearCollect` to load NeedsAttention items into a local collection first, then `CountRows` on that collection. This avoids delegation warnings because `CountRows` on a local collection always works correctly. The `Filter` may show a delegation warning, but since NeedsAttention items are typically a small subset, this approach is reliable.

### How It Works

| Step | What Happens |
|------|--------------|
| 1 | Timer fires every 30 seconds |
| 2 | `Concurrent(Refresh(PrintRequests), Refresh(BuildPlates), Refresh(Payments))` fetches all three SharePoint lists in parallel |
| 3 | `colAllBuildPlates` and `colAllPayments` are reloaded for job-card summaries |
| 4 | Count current NeedsAttention items |
| 5 | Compare to previous count stored in `varPrevAttentionCount` |
| 6 | If count increased, `Reset(audNotification); Set(varPlaySound, true)` triggers audio |
| 7 | Update `varPrevAttentionCount` for next cycle |

> 💡 **Why 30 seconds?** This provides responsive notifications while staying within SharePoint API limits. You can adjust `varRefreshInterval` in App.OnStart (in milliseconds) — 30000 for 30 seconds, 60000 for 1 minute, 120000 for 2 minutes. Shorter intervals (e.g. 10 seconds) risk 429 throttling errors from SharePoint.

---

## Adding the Audio Control (audNotification)

The Audio control plays the notification sound when triggered.

### Instructions

1. Click **+ Insert** → **Media** → **Audio**.

2. **Rename it:** `audNotification`

3. Set properties:

| Property | Value |
|----------|-------|
| Media | `notification_chime` |
| Start | `varPlaySound` |
| Loop | `false` |
| Visible | `false` |
| AutoStart | `false` |

4. Set **OnEnd:**

```powerfx
Set(varPlaySound, false)
```

### Understanding the Audio Control

| Property | Purpose |
|----------|---------|
| `Media` | The sound file from your Media library |
| `Start` | Bound to `varPlaySound`. We call `Reset(audNotification)` then set this to `true` each time we want to play. |
| `OnEnd` | Sets `varPlaySound` back to `false` so the next trigger can fire again. |
| `Loop` | Set to `false` — we only want one chime per notification |
| `Visible` | Set to `false` — audio controls don't need to be visible |
| `AutoStart` | Set to `false` — we trigger manually, not on screen load |

> ⚠️ **Why Reset() before setting true?** The Audio control doesn't reliably re-trigger if `Start` goes `true` → `false` → `true`. Calling `Reset(audNotification)` first clears its internal state, so the next `Set(varPlaySound, true)` is seen as a fresh start and the sound plays. Always use this pattern where you trigger the sound (Timer and Lightbulb).

---

## If the sound still doesn't play

### 1. Confirm the trigger pattern

Every place that should play sound must use this pattern:

```powerfx
Reset(audNotification);
Set(varPlaySound, true)
```

- **Lightbulb OnSelect:** After the Patch, when turning attention ON: `If(!ThisItem.NeedsAttention, Reset(audNotification); Set(varPlaySound, true))`
- **Timer OnTimerEnd:** Inside the If when count increased: `Reset(audNotification); Set(varPlaySound, true)`

The Audio control must have **Start** = `varPlaySound` and **OnEnd** = `Set(varPlaySound, false)`.

### 2. Media and name

- **Media** on the Audio control must exactly match the file in the app (e.g. `notification_chime` for `notification_chime.mp3`). Check under **Media** in the left panel that the file exists and use that exact name.
- If you renamed the file after upload, set the control's **Media** dropdown to that name.

### 3. Browser and user gesture (MOST COMMON ISSUE)

- **This is the #1 reason audio doesn't play!** Browsers block audio until the user has interacted with the page.
- Click once somewhere on the app (e.g. the Refresh button, a status tab, or any button), then try the lightbulb again.
- Test in **Play** mode (F5) or the **published** app in a browser; editor preview can behave differently.
- The Power Apps for Windows desktop app has the same restriction (it uses WebView2/Chromium).

### 4. Control name

- The formula uses **audNotification** (the name of the Audio control). If your control has a different name (e.g. `Audio1`), ensure the Audio control's **Start** property is set to `varPlaySound`. The name doesn't matter for the trigger pattern since we're just toggling the variable.

---

## Control Placement in Tree View

Add the new controls to your Tree view. The Timer and Audio controls are invisible. The timer can sit near the filter bar controls, and the audio control can be wrapped in `grpSoundNotification` at the bottom of the screen tree.

```
▼ scrDashboard
    ▼ conLoadingOverlay               ← TOP (highest z-order)
        ...
    ▼ conViewMessagesModal            ← Unified Messages Modal
        ...
    ...other modal containers...
    tmrAutoRefresh                    ← NEW: Timer control (invisible)
    recFilterBar
    txtSearch
    chkNeedsAttention
    ddSortOrder
    lblNeedsAttention
    btnRefresh
    btnClearFilters
    galJobCards
    ...
    ▸ grpSoundNotification            ← NEW: Group at bottom
```

> 💡 **Z-Order:** The Timer and Audio controls don't need specific z-ordering since they're invisible. Keeping `grpSoundNotification` at the bottom is fine.

---

## Testing the Audio Notification System

### Pre-Test Setup

1. **Run OnStart:** Click the three dots next to "App" → "Run OnStart" to initialize the new variables.

2. **Browser Interaction:** Click anywhere on the app canvas to satisfy browser autoplay requirements.

### Test Checklist

- [ ] Timer fires every 30 seconds (watch the data refresh)
- [ ] Sound plays when a new NeedsAttention item appears (timer detects count increase)
- [ ] Sound plays when staff toggles the lightbulb ON (marking an item as needing attention)
- [ ] Sound does NOT play when count stays the same
- [ ] Sound does NOT play when count decreases
- [ ] App startup doesn't trigger a false positive sound

### Manual Testing Steps

1. **Test Auto-Refresh:**
   - Open the app in Play mode (F5)
   - Wait 30 seconds
   - Verify the data refreshes (check tab counts or add a test item in SharePoint)

2. **Test Sound Notification:**
   - Open SharePoint and create a new PrintRequest with `NeedsAttention = Yes`
   - Wait for the timer to fire (up to 30 seconds)
   - Verify the notification sound plays

3. **Test Lightbulb Trigger:**
   - Click the lightbulb on a job card that currently has NeedsAttention = false (gray bulb)
   - The card should turn yellow/orange and the notification sound should play immediately
   - Toggling the lightbulb OFF (back to gray) should NOT play the sound

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Sound never plays | Browser autoplay blocked | Click anywhere on the app first |
| Sound never plays | Wrong media file name | Check `audNotification.Media` matches your uploaded file name |
| Sound never plays | Start not changing | Use `Reset(audNotification); Set(varPlaySound, true)` where you trigger; Audio **Start** = `varPlaySound`, **OnEnd** = `Set(varPlaySound, false)` |
| Sound plays on app start | Initial count comparison issue | Ensure `varPrevAttentionCount` is set in `App.OnStart` |
| Timer doesn't fire | `AutoStart` is `false` | Set `tmrAutoRefresh.AutoStart = true` |

---

# STEP 20: Schedule Screen (`scrSchedule`)

**What you're doing:** Adding a semester-wide color-coded schedule screen where each student worker can enter/edit their own shifts. Because this screen is large (HtmlViewer grid + edit bar + sortable totals card) it has its own dedicated guide.

### Source of truth

- **Step-by-step build + property tables:** [`PowerApps/StaffDashboard-Schedule-Screen.md`](./StaffDashboard-Schedule-Screen.md) — covers the 3 collections (`colStaff`, `colShifts`, `colSchedLookup`), `colTimeSlots`, `colSchedColors`, the edit bar, the HtmlViewer grid formula, and the native totals card.
- **Live YAML** (authoritative for copy-paste): `PowerApps/canvas-coauthor/scrSchedule.pa.yaml` after running `sync_canvas` from the `canvas-authoring` MCP server. Edit there → `compile_canvas` pushes back into the coauthoring session.

### Screen overview

- **Header bar** (`recSchedHeader`, `lblSchedTitle`, `btnSchedBack` → Dashboard).
- **Scroll body** (`conSchedScrollBody`) — single-item vertical gallery that wraps the edit bar, grid, and totals card so the whole page shares one vertical scrollbar below the header.
- **Edit bar** (`recSchedEditBar`) — grows vertically with the number of rows the current user is editing.
  - Row 1 (`Y = 30`, height `36`): `drpSchedName` (ComboBox, `X=16`, `Width=227`) · `lblSchedAidInfo` (aid type + hour counter, red when over cap, `X=257`) · **`btnSchedAddShift`** (solid primary, `X=905`, `Width=120`, `Height=varBtnHeight`) · `btnSchedSave` (`X=Parent.Width-330`, `Width=130`) · `btnSchedClear` (cancel, `X=Parent.Width-190`, `Width=80`). Keeping **`btnSchedAddShift`** on this top row guarantees it never shifts position when new shift rows are appended.
  - Row 2 (`Y = btnSchedAddShift.Y + btnSchedAddShift.Height + 8` ≈ `74`): **`galEditShifts`** — Day (`Width=166`) / Start (`Width=132`) / End (`Width=130`) DropDowns + ✕ remove per shift (`X=463`, `Width=32`); gallery height = `Max(CountRows(colEditShifts), 1) * 36`.
  - Bar height: `=If(varSchedSelectedEmail <> "", 116 + Max(CountRows(colEditShifts), 1) * 36 + 12, 76)`.
- **HtmlViewer grid** (`htmlSchedGrid`) — `Y = recSchedEditBar.Y + recSchedEditBar.Height + 12`, `Height = 80 + 56 + CountRows(Filter(colTimeSlots, Idx < 16)) * 28` (two 28px header rows plus one row per visible slot) so it always shows the full week grid without its own scrollbar. Renders Mon–Fri columns with per-day filtering (only staff who have shifts on that day appear). Markup is a **single master table** with `border-collapse:collapse` (see `PowerApps/canvas-coauthor/scrSchedule.pa.yaml`).
- **Totals card** (`recSchedTotalsCard` + `lblSchedTotalsTitle` + `drpSchedTotalsSort` + `btnSchedTotalsSortDir` + `galSchedTotals`) — sits directly below the grid. Native controls replaced the old HtmlViewer totals row so the columns can be truly click-sorted (`varSchedTotalsSortBy`, `varSchedTotalsSortDesc`). The reorder panel has been retired; per-person display order still comes from the `SchedSortOrder` column on the Staff list.

### Critical conventions (easy to get wrong)

1. **Seed real default times, never blank.** `btnSchedAddShift.OnSelect` and the fallback blank row in `drpSchedName.OnChange` must use `ShiftStart: "8:30 AM"`, `ShiftEnd: "9:00 AM"` — not `""`. Classic `DropDown` does **not** fire `OnChange` on first render, so a blank-seeded row looks valid in the UI but the record stays blank and `btnSchedSave` filters it out with `!IsBlank(ShiftStart) && !IsBlank(ShiftEnd)`. If you ever change the first item in `drpGalShiftStart.Items` / `drpGalShiftEnd.Items`, update these seeds too.
2. **Initials = first + last name.** Use `Left(First(Split(name, " ")).Value, 1) & Left(Last(Split(name, " ")).Value, 1)` — **not** `Left(name, 1) & Mid(name, Find(" ", name)+1, 1)` (the old formula returned the middle initial for `Francisco A Gonzalez-Hernandez` → `FA` instead of `FG`). `Split` returns a single-column table whose column is `Value` (not `Result` — a common gotcha in older Power Fx docs).
3. **Batch-create shifts on save.** Use `Patch(StaffShifts, ForAll(Filter(colEditShifts, !IsBlank(ShiftStart) && !IsBlank(ShiftEnd)), { ... }))`. Do **not** use `ForAll(..., Patch(Defaults(StaffShifts), …))` — that pattern often produces only one new row when multiple were needed (concurrent evaluation).
4. **Choice columns** on `StaffShifts` (`Day`, `ShiftStart`, `ShiftEnd`) must be written as `{Value: "text"}`, not plain strings.
5. **Reorder panel sizes to content, not to screen.** Don't revert `Height` to `Parent.Height - Self.Y`; use `Min(CountRows(colStaff) * 40 + 8, Parent.Height - Self.Y)` so the background hugs the last row instead of stretching to the bottom.

### Authoring workflow (canvas-authoring MCP)

```text
1. sync_canvas    → .cursor-mcp-deploy\ (pulls current server YAML)
2. edit           → .cursor-mcp-deploy\scrSchedule.pa.yaml
3. compile_canvas → .cursor-mcp-deploy\ (validates + pushes)
4. sync_canvas    → any clean dir and diff to confirm
```

`compile_canvas` reports **"Validation FAILED"** with ~18 pre-existing delegation warnings (on `btnStatusTab`, `galJobCards`, messages counts, `btnPickedUp`, schedule `OnVisible`, and `btnSchedSave.OnSelect`). **None** of those warnings block the push — they're the same app-wide warnings that have always been there. Only investigate *new* warnings that mention controls you just changed. Always re-sync and diff to confirm the push actually landed.

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
- [ ] Search filters by name/email/ReqKey/computer
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

#### Audio Notification System
- [ ] Timer auto-refreshes data every 30 seconds
- [ ] Sound plays when NeedsAttention count increases (timer)
- [ ] Sound plays when lightbulb is toggled ON (mark needs attention)
- [ ] Sound does NOT play when count stays same or decreases
- [ ] No false positive sound on app startup

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

## Problem: Audio notification never plays

**Cause:** Browser autoplay policy blocks audio, or incorrect control configuration.

**Solution:**
1. **Browser autoplay:** Click anywhere on the app canvas first — browsers require user interaction before playing audio
2. **Check Media property:** Ensure `audNotification.Media` matches your uploaded sound file name exactly
3. **Check Start property:** Ensure `audNotification.Start` is set to `varPlaySound`
4. **Check OnEnd:** Ensure `audNotification.OnEnd` is `Set(varPlaySound, false)`
5. **Check trigger:** When playing, use `Reset(audNotification); Set(varPlaySound, true)` (both steps in that order)
6. **Check Timer:** Ensure `tmrAutoRefresh.AutoStart` is `true` and `Repeat` is `true`

---

## Problem: Audio plays on every timer tick

**Cause:** Timer is triggering sound even when count didn't increase (e.g. formula logic error).

**Solution:**
1. Ensure the Timer's OnTimerEnd only runs the sound when count increased: `If(varCurrentAttentionCount > varPrevAttentionCount, Reset(audNotification); Set(varPlaySound, true))`
2. Ensure `varPrevAttentionCount` is updated after the check: `Set(varPrevAttentionCount, varCurrentAttentionCount)`

---

## Problem: Audio plays on app startup

**Cause:** Initial count comparison detecting existing items as "new".

**Solution:**
1. Ensure `varPrevAttentionCount` and `varPlaySound` are set in `App.OnStart` before the timer starts
2. The OnStart formula should include:
   ```powerfx
   Set(varPlaySound, false);
   ClearCollect(colNeedsAttention, Filter(PrintRequests, NeedsAttention = true));
   Set(varPrevAttentionCount, CountRows(colNeedsAttention));
   ```

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

# Step 18: Testing the App

**What you're doing:** Comprehensive testing of all Staff Dashboard features including build plate tracking, printer verification, and multi-payment workflows.

---

## Build Plate Tracking Tests

### Scenario 1: Default Plate on Approval

1. Open Approval Modal for a Pending job (student requested "Prusa MK4S")
2. **Verify:** "Build Plates" section shows "Default: 1 plate on Prusa MK4S (student's request)"
3. Fill in weight, hours, computer → click "Approve" (without clicking "Add Plates/Printers")
4. **Verify:** Job moves to "Ready to Print"
5. **Verify:** BuildPlates list has 1 record with Machine = "Prusa MK4S", Status = "Queued"
6. **Verify:** Job card shows "0/1 done" (derived from BuildPlates count)
7. **Verify:** Job card shows "Using: MK4S"

### Scenario 2: Multi-Plate Setup via Approval Modal

1. Open Approval Modal for a Pending job
2. Click "Add Plates/Printers" → Build Plates Modal opens and the Approval modal is hidden
3. **Verify:** You do not see the Approval modal title, body fields, or action buttons behind the Build Plates modal
4. Set Total Plates = 5
5. Add Prusa MK4S → add 3 plates under it
6. Add Prusa XL → add 2 plates under it
7. Click "Done" → Build Plates closes and the Approval modal returns
8. **Verify:** Build Plates section now shows "5 plates on 2 printers (MK4S, XL)"
9. Click "Approve"
10. **Verify:** BuildPlates list has 5 records
11. **Verify:** Job card shows "0/5 done · Using: MK4S, XL"

### Scenario 3: Advance Plate Statuses

1. Open Build Plates modal for a job with 5 plates (all Queued)
2. **Verify:** "▶ Printing" is hidden because the parent request is not yet in `Printing`
3. Use the main job card `"Start Printing"` button
4. Re-open Build Plates modal
5. Click "▶ Printing" on Plate 1 and Plate 2
6. **Verify:** Status badges change to "Printing" (yellow)
7. Click "✓ Done" on Plate 1
8. **Verify:** Status badge changes to "Completed" (green)
9. **Verify:** Progress shows "1 of 5 Original Completed"
10. **Verify:** The original visible labels remain `1/5` through `5/5` after the first completion locks them
11. Click `+ Add Reprint`
12. **Verify:** The new row label is `Reprint 1`
13. **Verify:** The original five rows still display `1/5` through `5/5` instead of renumbering
14. **Verify:** Job card shows `1/5 done · R 0/1` because the original denominator stays frozen and reprints are counted separately

### Scenario 4: Completion Gate — Plates Not Done

1. Job has 5 plates: 3 Completed, 2 still Printing
2. **Verify:** "Print Complete" button is **disabled** on job card
3. **Verify:** Helper text shows "2 plate(s) still printing"
4. Mark remaining 2 plates as Completed
5. **Verify:** "Print Complete" button becomes **enabled**

### Scenario 5: Completion Gate — With Partial Pickup

1. Job has 5 plates: 2 Picked Up (student already collected), 3 Completed
2. **Verify:** "Print Complete" button is **enabled** (Picked Up counts as done)
3. Click "Print Complete" → Complete Modal opens
4. **Verify:** ActualPrinter shows "Printers used: MK4S, XL" (read-only, auto-populated)
5. Confirm completion
6. **Verify:** Job status = "Completed", ActualPrinter = [MK4S, XL]

### Scenario 6: Remove Any Plate (Full Flexibility)

1. Open Build Plates modal with plates in various statuses
2. Click "✕" on a **Queued** plate → **Verify:** Removed
3. Click "✕" on a **Printing** plate → **Verify:** Removed
4. Click "✕" on a **Completed** plate → **Verify:** Removed
5. **Verify:** Plate count decreases after each removal
6. **Verify:** "✕" button is visible on ALL plates regardless of status

### Scenario 7: Scrap and Re-slice Workflow

1. Job has 4 plates: 2 Completed, 2 Printing
2. Print fails — need to re-slice everything
3. Open Build Plates modal
4. Remove all 4 plates (including Completed ones)
5. **Verify:** All plates removed, progress shows "0 of 0 Completed"
6. Add new plates with different configuration
7. **Verify:** New plates appear, job can continue fresh

### Scenario 8: Partial Pickup via Payment Modal

1. Job has 5 plates: 3 Completed, 2 still Printing
2. Student comes to pick up the completed pieces
3. Click "Partial Payment" → Payment Modal opens
4. **Verify:** "Plates being picked up" shows 3 checkboxes (only Completed plates)
5. Check all 3 boxes, enter weight and transaction number
6. Click confirm
7. **Verify:** 3 plates updated to "Picked Up"
8. **Verify:** Job card shows "3/5 done" (Picked Up original plates count as done; any reprints would appear in the separate `R x/y` segment)
9. **Verify:** The new `Payments` row stores `PlatesPickedUp` once per plate in ascending order using the visible labels shown to staff (for example `1/5, 2/5, 3/5`, with no duplicates)
10. **Verify:** The same `Payments` row also stores stable `PlateIDsPickedUp` values so history remains correct even if rows are later re-sliced, relabeled, or replaced

### Scenario 9: Resin Job Printer Filter

1. Open Build Plates modal for a Resin request
2. **Verify:** "Add Printer" dropdown shows only the resin line(s) (e.g. `Form 3+…` or `Form 3 (…)` per list labels)
3. Add a plate on the resin printer → add plates
4. **Verify:** All plates have `Machine` set to that resin choice (not blank)

### Scenario 10: Machine Edit on Queued/Printing Plate

1. Create a plate with Machine = MK4S, Status = Queued
2. **Verify:** Machine dropdown is enabled
3. Change Machine from MK4S to XL
4. **Verify:** Plate now shows Machine = XL
5. Mark plate as Printing
6. **Verify:** Machine dropdown still enabled
7. Change Machine from XL to MK3S
8. **Verify:** Plate shows Machine = MK3S
9. Mark plate as Completed
10. **Verify:** Machine dropdown is now disabled (locked)

---

## Printer Verification Tests

### Scenario 11: Student Picked the Correct Printer

1. Open Complete Confirmation Modal for a Printing item
2. `ddCompletePrinter` pre-selects the printer already on the record (e.g., "Prusa MK4S...")
3. Staff selects their name in `ddCompleteStaff`
4. Staff confirms the pre-selected printer — no change needed
5. Click "Confirm Complete"
6. **Verify:** `ActualPrinter` = "Prusa MK4S", `Status` = "Completed"
7. **Verify:** Audit log entry reads `"Completed"` (no correction note)

### Scenario 12: Student Picked the Wrong Printer

1. Open Complete Confirmation Modal for a Printing item (record shows "Prusa MK4S...")
2. `ddCompletePrinter` pre-selects "Prusa MK4S..."
3. Staff changes the dropdown to "Raise3D Pro 2 Plus..."
4. Staff selects their name and clicks "Confirm Complete"
5. **Verify:** `ActualPrinter` = "Raise3D Pro 2 Plus (12.0×12.0×23in)"
6. **Verify:** `Printer` still = "Prusa MK4S (9.8×8.3×8.7in)" (original request preserved)
7. **Verify:** Audit log entry reads `"Completed (Printer corrected: Prusa MK4S → Raise3D Pro 2 Plus)"`

### Scenario 13: Resin Job Printer Filter

1. Open Complete Confirmation Modal for a Resin Printing item
2. `ddCompletePrinter` should only show "Form 3+ (5.7×5.7×7.3in)" as an option (filtered by Method)
3. Confirm it is the only available choice
4. Staff confirms and clicks "Confirm Complete"
5. **Verify:** `ActualPrinter` = "Form 3+ (5.7×5.7×7.3in)"

### Scenario 14: Confirm Button Blocked Until Printer Selected

1. Open Complete Confirmation Modal
2. Select a name in `ddCompleteStaff` but do not select a printer
3. **Verify:** "Confirm Complete" button remains disabled
4. Select a printer in `ddCompletePrinter`
5. **Verify:** "Confirm Complete" button becomes active

### Scenario 15: Cancel Resets All Controls

1. Open Complete Confirmation Modal
2. Select a staff name and a printer
3. Click "Cancel"
4. Re-open the modal for the same item
5. **Verify:** Both `ddCompleteStaff` and `ddCompletePrinter` are blank (not carrying over previous selections)

---

## Multi-Payment Tracking Tests

### Scenario 16: Single Payment (Normal Case)

1. Job with 1 plate, student picks up everything at once
2. Staff records payment: 115g, $11.50, TXN-12345
3. **Verify:** `Payments` has 1 record
4. **Verify:** `PrintRequests.FinalWeight` = 115, `FinalCost` = $11.50
5. **Verify:** Job card shows `1 payment recorded` even if `txtPaymentNotes` was left blank
6. **Verify:** Notes modal shows a `PAID` timeline entry in `StaffNotes`
7. **Verify:** Monthly export shows 1 row

### Scenario 17: Two Partial Payments

1. Job with 5 plates
2. Day 1: 3 plates done, student picks up, pays $8.50 (TXN-44821)
3. **Verify:** `Payments` has 1 record, `PrintRequests.FinalCost` = $8.50
4. Day 2: 2 plates done, student picks up remaining, pays $6.20 (TXN-44890)
5. **Verify:** `Payments` has 2 records
6. **Verify:** `PrintRequests.FinalWeight` = 147, `FinalCost` = $14.70
7. **Verify:** Notes modal shows two `PAID` entries in chronological order
8. **Verify:** Monthly export shows 2 rows

### Scenario 18: Payment History Display

1. Job with existing payment
2. Open Payment Modal for additional payment
3. **Verify:** Payment History section shows previous payment(s)
4. **Verify:** "Paid so far" shows running total
5. **Verify:** "Remaining estimate" calculates correctly
6. **Verify:** Job card payment summary is driven by `Payments`, not by `PaymentNotes`
7. **Verify:** Optional `PaymentNotes` text is still treated as free-text context, not payment history

### Scenario 18B: Final Pickup Status Refresh

1. Job is in `Completed` with all remaining finished plates shown in the pickup checklist
2. Staff checks all remaining completed plates and records payment
3. **Verify:** selected `BuildPlates` rows become `Picked Up`
4. **Verify:** the new `Payments` row appears in history immediately
5. **Verify:** parent `PrintRequests.Status` changes to `Paid & Picked Up` on the same save, without needing to reopen the modal or record a second payment

### Scenario 19: Different Payers

1. Day 1: Student pays for first pickup
2. Day 2: Student's friend pays for second pickup (different payer)
3. **Verify:** Payment 1 has student's name as payer
4. **Verify:** Payment 2 has friend's name as payer
5. **Verify:** Monthly export shows correct payer for each row

### Scenario 20: Mixed Payment Types

1. First payment: TigerCASH
2. Second payment: Check
3. Third payment: Grant/Program Code
4. **Verify:** Each `Payments` record has correct `PaymentType`
5. **Verify:** Export shows payment type per row

### Scenario 21: Backward Compatibility

1. Existing job with payment recorded before this enhancement (data in `PrintRequests` fields only)
2. Open Payment Modal
3. **Verify:** Payment History gallery is empty (no `Payments` records)
4. **Verify:** `Paid so far` still shows `FinalWeight`/`FinalCost` from `PrintRequests`
5. **Verify:** Job card shows a legacy fallback summary rather than a `Payments` count
6. New payment creates first `Payments` record

### Scenario 22: Prior Partial Pickup, Then Final Batch Pickup

1. Request A has 5 plates
2. Day 1: 2 completed plates are picked up through the single-item Payment Modal
3. **Verify:** Request A stays `Completed`, 2 plates = `Picked Up`, 3 plates remain `Completed`
4. Select Request A plus another completed request in batch mode
5. Process batch payment
6. **Verify:** Request A moves to `Paid & Picked Up`
7. **Verify:** All 3 remaining completed plates on Request A are patched to `Picked Up`
8. **Verify:** Exactly one consolidated `Payments` row is created for the shared checkout, not one row per request
9. **Verify:** That consolidated row includes both requests in `BatchRequestIDs` / `BatchReqKeys`
10. **Verify:** `BatchAllocationSummary` stores Request A's allocated grams and dollars alongside the other request
11. **Verify:** Opening Request A later still shows both the earlier single payment and the consolidated batch payment in request history using Request A's allocated amount/weight

### Scenario 22B: One Checkout Across Two Jobs

1. Select two completed requests in batch mode (same or different `Method`; if different, use rows whose `EstimatedWeight` values are comparable for proportional allocation)
2. Enter one payment header and one combined total (example: `$26.60` across both jobs)
3. Click **Record Batch Payment**
4. **Verify:** Only one new `Payments` row is created for the checkout
5. **Verify:** `Amount` on that row equals the combined total and `Weight` equals the combined pickup grams
6. **Verify:** `BatchRequestIDs`, `BatchReqKeys`, and `BatchAllocationSummary` preserve the per-request split
7. **Verify:** Both requests move to `Paid & Picked Up` and keep their own allocated `FinalWeight` / `FinalCost`

### Scenario 22C: Filament and Resin Cannot Share One Batch

1. Enter batch mode and select a completed **Filament** request, then try to add a completed **Resin** request (or the reverse)
2. **Verify:** A **Warning** notification explains that Filament and Resin cannot mix; the second job is **not** added (or **Process Batch Payment** refuses to open if both slipped in from legacy data)
3. **Verify:** Completing two jobs that use different methods requires **two** checkouts (or single-item payment), not one consolidated batch row
4. **Optional (flow):** If a mixed ID list is sent anyway, **Verify:** `Flow-(I)-Payment-SaveBatch` fails with the mixed-method message and writes nothing

### Scenario 23: Batch Item Already Fully Picked Up

1. Select two completed requests for batch mode
2. Before confirming, another staff member finishes pickup for one of them through Step 12C
3. Return to the open batch modal and click confirm
4. **Verify:** Batch payment is blocked with a validation message
5. **Verify:** Staff must remove the now-invalid request from the batch before retrying

### Scenario 24: Batch Item Has Active Plates

1. Select a request for batch mode while all of its plates are `Completed`
2. Before confirming, another staff member changes one plate back to `Printing`
3. Click confirm in the batch modal
4. **Verify:** Batch payment is blocked because the request is no longer a valid final pickup

### Scenario 25: Re-slice After Earlier Payment

1. Record a payment for completed plates on a multi-plate request
2. Open Build Plates and remove one of the old completed plates, then add a replacement plate
3. **Verify:** The original locked labels on surviving rows do **not** renumber
4. **Verify:** The replacement row is labeled as a numbered reprint (for example `Reprint 1`)
5. **Verify:** Earlier `Payments.PlateIDsPickedUp` values still point to the original picked-up plates
6. **Verify:** New replacement plates receive new `PlateKey` values instead of reusing old history

---

## Core Workflow Tests

### Scenario 26: Complete Approval-to-Pickup Workflow

1. New job appears with Status = "Uploaded"
2. Click "Approve" → Approval Modal opens
3. Configure build plates (or accept default)
4. Fill estimates → click "Approve"
5. **Verify:** Status = "Ready to Print", plates created
6. Click "Start Print" → Status = "Printing"
7. Update plate statuses as prints complete
8. All plates done → "Print Complete" enabled
9. Click "Print Complete" → verify ActualPrinter auto-populated
10. Student pays → record payment with plate pickup
11. **Verify:** Status = "Paid & Picked Up", all plates = "Picked Up"

### Scenario 27: Rejection Workflow

1. Job with Status = "Uploaded" or "Pending"
2. Click "Reject" → Rejection Modal opens
3. Select reason, add notes → click "Confirm Reject"
4. **Verify:** Status = "Rejected"
5. **Verify:** Audit log shows rejection with reason

### Scenario 28: Archive Workflow

1. Completed job (any terminal status)
2. Click "Archive" button
3. **Verify:** Job moves to Archived status
4. **Verify:** Job no longer appears in active tabs

---

## Testing Checklist

Use this checklist to verify all features work correctly:

- [ ] **Build Plates:** Default plate created on approval
- [ ] **Build Plates:** Multi-plate/multi-printer setup works
- [ ] **Build Plates:** Plate status transitions are gated by parent request status (`Queued` plates cannot be marked `Printing` until the job is in `Printing`)
- [ ] **Build Plates:** Completion gate blocks until all plates done
- [ ] **Build Plates:** Plates can be removed at any status
- [ ] **Printer Verification:** Correct printer pre-selected
- [ ] **Printer Verification:** Wrong printer can be corrected
- [ ] **Printer Verification:** Audit log notes correction
- [ ] **Printer Verification:** Resin jobs filter to Form 3+ / Form 3 resin choices only
- [ ] **Payments:** Single payment records correctly
- [ ] **Payments:** Multiple partial payments accumulate
- [ ] **Payments:** Payment history displays in modal
- [ ] **Payments:** Different payers tracked per payment
- [ ] **Payments:** Plate pickup checkboxes work
- [ ] **Payments:** Batch payment only succeeds for valid final pickups
- [ ] **Payments:** Batch payment writes one consolidated `Payments` row per checkout
- [ ] **Payments:** Request history still shows consolidated batch rows using per-request allocated values
- [ ] **Payments:** Stable `PlateIDsPickedUp` survives plate renumbering/re-slicing
- [ ] **Core:** Full workflow from submission to pickup
- [ ] **Core:** Rejection workflow with reason
- [ ] **Core:** Archive moves jobs out of active view

---

# Quick Reference Card

## Key Variables

| Variable | Set By | Purpose |
|----------|--------|---------|
| `varMeEmail` | App.OnStart | Current user email |
| `varIsStaff` | App.OnStart | Staff member check |
| `colStaff` | App.OnStart | Active staff collection |
| `varFilamentRate` | App.OnStart | Filament price per gram ($0.10) |
| `varResinRate` | App.OnStart | Resin price per mL ($0.30) |
| `varResinDensity` | App.OnStart | Resin density in g/mL (1.11) |
| `varResinGramRate` | App.OnStart | Resin pickup price per gram (~$0.2703) |
| `varMinimumCost` | App.OnStart | Minimum charge ($3.00) |
| `varSelectedStatus` | Status tab click | Current filter |
| `varSelectedItem` | Button click | Item for modal |
| `varActor` | Screen.OnVisible | Current user Person record (available for quick Patch operations) |
| `varShowPaymentModal` | btnPickedUp click | Controls payment modal visibility |
| `varShowBatchPaymentModal` | btnProcessBatchPayment click | Controls batch payment modal visibility |
| `varBatchSelectMode` | btnAddMoreItems click | Enables multi-select batch payment mode |
| `colBatchItems` | Card selection in batch mode | Collection of items selected for batch payment |
| `varBaseCost` | Payment modal confirm | Base cost before discount |
| `varFinalCost` | Payment modal confirm | Final cost (with 70% discount if own material) |

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
| Message | `ddViewMsgStaff` |

## Pricing Formula

**Pricing Variables (set in App.OnStart):**
| Variable | Default | Description |
|----------|---------|-------------|
| `varFilamentRate` | `0.10` | $ per gram for filament |
| `varResinRate` | `0.30` | $ per mL for resin |
| `varResinDensity` | `1.11` | g per mL for supported resin colors (Black/Gray/White/Clear V4.1) |
| `varResinGramRate` | `Round(varResinRate / varResinDensity, 4)` | $ per gram for resin pickup billing |
| `varMinimumCost` | `3.00` | Minimum charge |

**For Estimates (Approval Modal):**
```powerfx
// EstimatedCost from EstimatedWeight
Max(varMinimumCost, EstimatedWeight * If(Method = "Resin", varResinRate, varFilamentRate))
```

**For Finals (Payment Modal):**
```powerfx
// FinalCost from FinalWeight (grams for both methods)
// With own material discount: multiply by varOwnMaterialDiscount when chkOwnMaterial.Value is true
Set(varBaseCost, Max(varMinimumCost, FinalWeight * If(Method = "Resin", varResinGramRate, varFilamentRate)));
Set(varFinalCost, If(chkOwnMaterial.Value, varBaseCost * varOwnMaterialDiscount, varBaseCost))
```

> 💡 **Estimate vs Actual:** EstimatedWeight/EstimatedCost are set at approval (grams for filament, slicer mL for resin). FinalWeight/FinalCost are recorded at payment pickup in grams for both methods; resin pickup charges convert those grams through `varResinGramRate`.
>
> 💡 **Own Material Discount:** When student provides their own filament/resin, check `chkOwnMaterial` for a 70% discount (student pays 30% of normal cost). This is saved to the `StudentOwnMaterial` field.

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
    {Status: "Uploaded", Color: varColorPrimary},
    {Status: "Pending", Color: varColorPrimary},
    {Status: "Ready to Print", Color: varColorPrimary},
    {Status: "Printing", Color: varColorPrimary},
    {Status: "Completed", Color: varColorPrimary},
    {Status: "Paid & Picked Up", Color: varColorPrimary},
    {Status: "Rejected", Color: varColorPrimary},
    {Status: "Canceled", Color: varColorPrimary},
    {Status: "Archived", Color: varColorPrimary}
)
```

## Status Tab Button Text

```powerfx
ThisItem.Status & " " & Text(
    CountRows(
        Filter(
            PrintRequests,
            Status.Value = ThisItem.Status,
            If(IsBlank(varSearchText), true,
                varSearchText in Student.DisplayName ||
                varSearchText in StudentEmail ||
                varSearchText in ReqKey
            ),
            If(varNeedsAttention, NeedsAttention = true, true)
        )
    )
)
```

## Job Cards Gallery Filter

```powerfx
// Queue Order keeps attention items first, then oldest in queue first
With(
    {
        filteredJobs: Filter(
            PrintRequests,
            Status.Value = varSelectedStatus,
            If(IsBlank(varSearchText), true, 
                varSearchText in Student.DisplayName || 
                varSearchText in StudentEmail || 
                varSearchText in ReqKey ||
                varSearchText in SlicedOnComputer.Value
            ),
            If(varNeedsAttention, NeedsAttention = true, true)
        )
    },
    Switch(
        varSortOrder,
        "Student Name A-Z",
        Sort(filteredJobs, Student.DisplayName, SortOrder.Ascending),
        "Student Name Z-A",
        Sort(filteredJobs, Student.DisplayName, SortOrder.Descending),
        "Oldest First",
        SortByColumns(filteredJobs, "Created", SortOrder.Ascending),
        "Newest First",
        SortByColumns(filteredJobs, "Created", SortOrder.Descending),
        "Color A-Z",
        Sort(filteredJobs, Color.Value, SortOrder.Ascending),
        "Computer A-Z",
        Sort(filteredJobs, SlicedOnComputer.Value, SortOrder.Ascending),
        "Printer A-Z",
        Sort(filteredJobs, Printer.Value, SortOrder.Ascending),
        SortByColumns(
            filteredJobs,
            "NeedsAttention", SortOrder.Descending,
            "Created", SortOrder.Ascending
        )
    )
)
```

## Attention Highlight (Card Background)

```powerfx
// Rectangle.Fill for attention highlight
If(ThisItem.NeedsAttention, RGBA(255, 235, 180, 1), Color.White)

// Rectangle.BorderColor for attention highlight
If(ThisItem.NeedsAttention, RGBA(255, 180, 0, 1), varColorBorderLight)

// Rectangle.BorderThickness for attention highlight
If(ThisItem.NeedsAttention, 2, 1)
```

## Color Switch Statement

```powerfx
// Matches SharePoint FilamentColor-Column-Formatting.json
Switch(
    ThisItem.Color.Value,
    "Black", RGBA(26, 26, 26, 1),
    "Matte Black", RGBA(26, 26, 26, 1),
    "White", RGBA(180, 180, 180, 1),
    "Matte White", RGBA(180, 180, 180, 1),
    "Gray", RGBA(128, 128, 128, 1),
    "Light Gray", RGBA(211, 211, 211, 1),
    "Matte Light Gray", RGBA(169, 169, 169, 1),
    "Red", RGBA(204, 0, 0, 1),
    "Matte Red", RGBA(204, 0, 0, 1),
    "Orange", RGBA(255, 102, 0, 1),
    "Matte Orange", RGBA(255, 102, 0, 1),
    "Yellow", RGBA(255, 215, 0, 1),
    "Matte Yellow", RGBA(255, 215, 0, 1),
    "Gold", RGBA(255, 215, 0, 1),
    "Green", RGBA(76, 175, 80, 1),
    "Matte Green", RGBA(76, 175, 80, 1),
    "Forest Green", RGBA(34, 139, 34, 1),
    "Blue", RGBA(0, 71, 171, 1),
    "Matte Blue", RGBA(0, 71, 171, 1),
    "Cobalt Blue", RGBA(0, 102, 204, 1),
    "Purple", RGBA(107, 63, 160, 1),
    "Matte Purple", RGBA(107, 63, 160, 1),
    "Brown", RGBA(93, 64, 55, 1),
    "Light Brown", RGBA(196, 164, 132, 1),
    "Chocolate Brown", RGBA(123, 63, 0, 1),
    "Matte Chocolate", RGBA(123, 63, 0, 1),
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
// LookUp the "Request Created" audit entry to get the actual creation timestamp
// Dynamic display: shows minutes only for items < 1 day old
With(
    {varCreatedAt: LookUp(AuditLog, ReqKey = ThisItem.ReqKey && Action.Value = "Created", ActionAt)},
    If(
        IsBlank(varCreatedAt),
        "",
        If(
            DateDiff(varCreatedAt, Now(), TimeUnit.Minutes) < 1,
            "Just now",
            If(
                DateDiff(varCreatedAt, Now(), TimeUnit.Days) > 0,
                // 1+ days: show days and hours only
                Text(DateDiff(varCreatedAt, Now(), TimeUnit.Days)) & "d " &
                If(
                    Mod(DateDiff(varCreatedAt, Now(), TimeUnit.Hours), 24) > 0,
                    Text(Mod(DateDiff(varCreatedAt, Now(), TimeUnit.Hours), 24)) & "h",
                    ""
                ),
                // Less than 1 day: show hours and minutes
                If(
                    DateDiff(varCreatedAt, Now(), TimeUnit.Hours) > 0,
                    Text(DateDiff(varCreatedAt, Now(), TimeUnit.Hours)) & "h ",
                    ""
                ) &
                Text(Mod(DateDiff(varCreatedAt, Now(), TimeUnit.Minutes), 60)) & "m"
            )
        )
    )
)
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



---

# Live coauthor control inventory

This section is the **authoritative list of controls** in `scrDashboard` as exported from **Canvas coauthor** (`sync_canvas` → `PowerApps/canvas-coauthor/scrDashboard.pa.yaml`). Use it when the step-by-step tree diagrams and older screenshots disagree with Studio.

﻿## scrDashboard control inventory

> Generated from coauthor YAML (sync_canvas). Parent is the immediate container in the YAML tree (screen, gallery, or container).

### Attachments_DataCard1

| Control | Type |
|---------|------|
| `DataCardKey13` | Label |
| `DataCardValue13` | Attachments |
| `ErrorMessage13` | Label |
| `StarVisible13` | Label |

### conApprovalModal

| Control | Type |
|---------|------|
| `btnApprovalCancel` | Classic/Button |
| `btnApprovalClose` | Classic/Button |
| `btnApprovalConfirm` | Classic/Button |
| `btnApproveAddPlates` | Classic/Button |
| `chkApprovalOwnMaterial` | Classic/CheckBox |
| `ddApprovalStaff` | Classic/ComboBox |
| `ddSlicedOnComputer` | Classic/ComboBox |
| `lblApprovalCommentsLabel` | Label |
| `lblApprovalCostLabel` | Label |
| `lblApprovalCostValue` | Label |
| `lblApprovalStaffLabel` | Label |
| `lblApprovalStudent` | Label |
| `lblApprovalTimeLabel` | Label |
| `lblApprovalTitle` | Label |
| `lblApprovalWeightLabel` | Label |
| `lblApprovePlatesInfo` | Label |
| `lblSlicedOnLabel` | Label |
| `recApprovalModal` | Rectangle |
| `recApprovalOverlay` | Rectangle |
| `txtApprovalComments` | Classic/TextInput |
| `txtEstimatedTime` | Classic/TextInput |
| `txtEstimatedWeight` | Classic/TextInput |

### conArchiveModal

| Control | Type |
|---------|------|
| `btnArchiveCancel` | Classic/Button |
| `btnArchiveClose` | Classic/Button |
| `btnArchiveConfirm` | Classic/Button |
| `ddArchiveStaff` | Classic/ComboBox |
| `lblArchiveReasonLabel` | Label |
| `lblArchiveStaffLabel` | Label |
| `lblArchiveTitle` | Label |
| `lblArchiveWarning` | Label |
| `recArchiveModal` | Rectangle |
| `recArchiveOverlay` | Rectangle |
| `txtArchiveReason` | Classic/TextInput |

### conBatchPaymentModal

| Control | Type |
|---------|------|
| `btnBatchPaymentCancel` | Classic/Button |
| `btnBatchPaymentClose` | Classic/Button |
| `btnBatchPaymentConfirm` | Classic/Button |
| `chkBatchOwnMaterial` | Classic/CheckBox |
| `ddBatchPaymentType` | Classic/ComboBox |
| `ddBatchStaff` | Classic/ComboBox |
| `dpBatchPaymentDate` | Classic/DatePicker |
| `galBatchItems` | Gallery |
| `lblBatchCostLabel` | Label |
| `lblBatchCostValue` | Label |
| `lblBatchItemsHeader` | Label |
| `lblBatchPayerNameLabel` | Label |
| `lblBatchPaymentDateLabel` | Label |
| `lblBatchPaymentTypeLabel` | Label |
| `lblBatchStaffLabel` | Label |
| `lblBatchSummary` | Label |
| `lblBatchTitle` | Label |
| `lblBatchTransLabel` | Label |
| `lblBatchWeightLabel` | Label |
| `recBatchPaymentModal` | Rectangle |
| `recBatchPaymentOverlay` | Rectangle |
| `txtBatchPayerName` | Classic/TextInput |
| `txtBatchTransaction` | Classic/TextInput |
| `txtBatchWeight` | Classic/TextInput |

### conBatchSelectionFooter

| Control | Type |
|---------|------|
| `btnBatchCancel` | Classic/Button |
| `btnProcessBatchPayment` | Classic/Button |
| `lblBatchCount` | Label |
| `lblBatchEstTotal` | Label |
| `lblBatchModeActive` | Label |
| `lblBatchStudents` | Label |
| `recBatchFooterBg` | Rectangle |

### conBuildPlatesModal

| Control | Type |
|---------|------|
| `btnBuildPlatesAdd` | Classic/Button |
| `btnBuildPlatesClose` | Classic/Button |
| `btnBuildPlatesDone` | Classic/Button |
| `galBuildPlates` | Gallery |
| `lblBuildPlatesProgressModal` | Label |
| `lblBuildPlatesTitle` | Label |
| `lblTotalSlicedLabel` | Label |
| `recBuildPlatesDivider1` | Rectangle |
| `recBuildPlatesDivider2` | Rectangle |
| `recBuildPlatesDivider3` | Rectangle |
| `recBuildPlatesModal` | Rectangle |
| `recBuildPlatesOverlay` | Rectangle |

### conCompleteModal

| Control | Type |
|---------|------|
| `btnCompleteCancel` | Classic/Button |
| `btnCompleteClose` | Classic/Button |
| `btnCompleteConfirm` | Classic/Button |
| `ddCompleteStaff` | Classic/ComboBox |
| `lblActualPrinters` | Label |
| `lblCompleteStaffLabel` | Label |
| `lblCompleteTitle` | Label |
| `lblCompleteWarning` | Label |
| `recCompleteModal` | Rectangle |
| `recCompleteOverlay` | Rectangle |

### conDetailsModal

| Control | Type |
|---------|------|
| `btnDetailsCancel` | Classic/Button |
| `btnDetailsClose` | Classic/Button |
| `btnDetailsConfirm` | Classic/Button |
| `chkDetailsOwnMaterial` | Classic/CheckBox |
| `ddDetailsColor` | Classic/ComboBox |
| `ddDetailsMethod` | Classic/ComboBox |
| `ddDetailsPrinter` | Classic/ComboBox |
| `ddDetailsSlicedOnComputer` | Classic/ComboBox |
| `ddDetailsStaff` | Classic/ComboBox |
| `lblDetailsColorLabel` | Label |
| `lblDetailsCostLabel` | Label |
| `lblDetailsCostValue` | Label |
| `lblDetailsCurrent` | Label |
| `lblDetailsCurrentLabel` | Label |
| `lblDetailsHoursLabel` | Label |
| `lblDetailsMethodLabel` | Label |
| `lblDetailsPrinterLabel` | Label |
| `lblDetailsSlicedOnLabel` | Label |
| `lblDetailsStaffLabel` | Label |
| `lblDetailsTitle` | Label |
| `lblDetailsTransLabel` | Label |
| `lblDetailsWeightLabel` | Label |
| `recDetailsModal` | Rectangle |
| `recDetailsOverlay` | Rectangle |
| `txtDetailsHours` | Classic/TextInput |
| `txtDetailsTransaction` | Classic/TextInput |
| `txtDetailsWeight` | Classic/TextInput |

### conExportModal

| Control | Type |
|---------|------|
| `btnExportClose` | Classic/Button |
| `btnExportDownload` | Classic/Button |
| `ddExportMonth` | Classic/DropDown |
| `ddExportYear` | Classic/DropDown |
| `lblExportMonthLabel` | Label |
| `lblExportNote` | Label |
| `lblExportPreview` | Label |
| `lblExportTitle` | Label |
| `lblExportYearLabel` | Label |
| `recExportBox` | Rectangle |
| `recExportOverlay` | Rectangle |

### conFileModal

| Control | Type |
|---------|------|
| `btnFileCancel` | Classic/Button |
| `btnFileClose` | Classic/Button |
| `btnFileSave` | Classic/Button |
| `ddFileActor` | Classic/ComboBox |
| `frmAttachmentsEdit` | Form |
| `lblFileStaffLabel` | Label |
| `lblFileTitle` | Label |
| `recFileModal` | Rectangle |
| `recFileOverlay` | Rectangle |

### conLoadingOverlay

| Control | Type |
|---------|------|
| `lblLoadingMessage` | Label |
| `lblLoadingSpinner` | Label |
| `recLoadingBox` | Rectangle |
| `recLoadingOverlay` | Rectangle |

### conNotesModal

| Control | Type |
|---------|------|
| `btnAddNote` | Classic/Button |
| `btnNotesCancel` | Classic/Button |
| `btnNotesClose` | Classic/Button |
| `ddNotesStaff` | Classic/ComboBox |
| `lblAddNoteLabel` | Label |
| `lblNotesStaffLabel` | Label |
| `lblNotesTitle` | Label |
| `lblStaffNotesHeader` | Label |
| `recNotesModal` | Rectangle |
| `recNotesOverlay` | Rectangle |
| `txtAddNote` | Classic/TextInput |
| `txtStaffNotesContent` | Classic/TextInput |

### conPaymentModal

| Control | Type |
|---------|------|
| `btnAddMoreItems` | Classic/Button |
| `btnPaymentCancel` | Classic/Button |
| `btnPaymentClose` | Classic/Button |
| `btnPaymentConfirm` | Classic/Button |
| `chkOwnMaterial` | Classic/CheckBox |
| `chkPartialPickup` | Classic/CheckBox |
| `chkPayerSameAsStudent` | Classic/CheckBox |
| `ddPaymentStaff` | Classic/ComboBox |
| `ddPaymentType` | Classic/DropDown |
| `dpPaymentDate` | Classic/DatePicker |
| `galPaymentHistory` | Gallery |
| `galPlatesPickup` | Gallery |
| `lblPaidSoFar` | Label |
| `lblPayerNameLabel` | Label |
| `lblPayerTigerCardLabel` | Label |
| `lblPaymentCostLabel` | Label |
| `lblPaymentCostValue` | Label |
| `lblPaymentDateLabel` | Label |
| `lblPaymentHistoryHeader` | Label |
| `lblPaymentNotesLabel` | Label |
| `lblPaymentStaffLabel` | Label |
| `lblPaymentStudent` | Label |
| `lblPaymentTitle` | Label |
| `lblPaymentTransLabel` | Label |
| `lblPaymentTypeLabel` | Label |
| `lblPaymentWeightLabel` | Label |
| `lblPlatesHint` | Label |
| `lblPlatesPickupHeader` | Label |
| `lblRemainingEst` | Label |
| `recPaymentModal` | Rectangle |
| `recPaymentOverlay` | Rectangle |
| `recPaymentVerticalDivider` | Rectangle |
| `recPlatesDivider` | Rectangle |
| `txtPayerName` | Classic/TextInput |
| `txtPayerTigerCard` | Classic/TextInput |
| `txtPaymentNotes` | Classic/TextInput |
| `txtPaymentTransaction` | Classic/TextInput |
| `txtPaymentWeight` | Classic/TextInput |

### conRejectModal

| Control | Type |
|---------|------|
| `btnRejectCancel` | Classic/Button |
| `btnRejectClose` | Classic/Button |
| `btnRejectConfirm` | Classic/Button |
| `chkGeometry` | Classic/CheckBox |
| `chkMessy` | Classic/CheckBox |
| `chkNotJoined` | Classic/CheckBox |
| `chkNotSolid` | Classic/CheckBox |
| `chkOverhangs` | Classic/CheckBox |
| `chkScale` | Classic/CheckBox |
| `chkTooSmall` | Classic/CheckBox |
| `ddRejectStaff` | Classic/ComboBox |
| `lblRejectCommentsLabel` | Label |
| `lblRejectReasonsLabel` | Label |
| `lblRejectStaffLabel` | Label |
| `lblRejectStudent` | Label |
| `lblRejectTitle` | Label |
| `recRejectModal` | Rectangle |
| `recRejectOverlay` | Rectangle |
| `txtRejectComments` | Classic/TextInput |

### conRevertModal

| Control | Type |
|---------|------|
| `btnRevertCancel` | Classic/Button |
| `btnRevertClose` | Classic/Button |
| `btnRevertConfirm` | Classic/Button |
| `ddRevertStaff` | Classic/ComboBox |
| `ddRevertTarget` | Classic/DropDown |
| `lblRevertCurrentStatus` | Label |
| `lblRevertReasonLabel` | Label |
| `lblRevertStaffLabel` | Label |
| `lblRevertTargetLabel` | Label |
| `lblRevertTitle` | Label |
| `recRevertModal` | Rectangle |
| `recRevertOverlay` | Rectangle |
| `txtRevertReason` | Classic/TextInput |

### conStudentNoteModal

| Control | Type |
|---------|------|
| `btnStudentNoteClose` | Classic/Button |
| `btnStudentNoteOk` | Classic/Button |
| `lblStudentNoteTitle` | Label |
| `recStudentNoteModal` | Rectangle |
| `recStudentNoteOverlay` | Rectangle |
| `txtStudentNoteContent` | Classic/TextInput |

### conViewMessagesModal

| Control | Type |
|---------|------|
| `btnViewMsgCancel` | Classic/Button |
| `btnViewMsgClose` | Classic/Button |
| `btnViewMsgMarkRead` | Classic/Button |
| `btnViewMsgSend` | Classic/Button |
| `ddViewMsgStaff` | Classic/ComboBox |
| `galViewMessages` | Gallery |
| `lblViewMsgBodyLabel` | Label |
| `lblViewMsgCharCount` | Label |
| `lblViewMsgStaffLabel` | Label |
| `lblViewMsgSubjectLabel` | Label |
| `lblViewMsgSubtitle` | Label |
| `lblViewMsgTitle` | Label |
| `recViewMsgModal` | Rectangle |
| `recViewMsgOverlay` | Rectangle |
| `recViewMsgSeparator` | Rectangle |
| `txtViewMsgBody` | Classic/TextInput |
| `txtViewMsgSubject` | Classic/TextInput |

### frmAttachmentsEdit

| Control | Type |
|---------|------|
| `Attachments_DataCard1` | TypedDataCard |

### galBatchItems

| Control | Type |
|---------|------|
| `btnRemoveFromBatch` | Classic/Button |
| `lblBatchItemRow` | Label |

### galBuildPlates

| Control | Type |
|---------|------|
| `btnMarkDone` | Classic/Button |
| `btnMarkPrinting` | Classic/Button |
| `btnRemovePlate` | Classic/Button |
| `drpPlateMachine` | Classic/DropDown |
| `lblPlateLabel` | Label |
| `lblPlateStatus` | Label |
| `recPlateRowBg` | Rectangle |

### galJobCards

| Control | Type |
|---------|------|
| `btnApprove` | Classic/Button |
| `btnArchive` | Classic/Button |
| `btnBuildPlates` | Classic/Button |
| `btnComplete` | Classic/Button |
| `btnEditDetails` | Classic/Button |
| `btnFiles` | Classic/Button |
| `btnPickedUp` | Classic/Button |
| `btnReject` | Classic/Button |
| `btnRevert` | Classic/Button |
| `btnStartPrint` | Classic/Button |
| `btnStudentNote` | Classic/Button |
| `btnViewMessages` | Classic/Button |
| `btnViewNotes` | Classic/Button |
| `cirColorDot` | Circle |
| `cirColorDotBackdrop` | Circle |
| `icoBatchCheck` | Classic/Icon |
| `icoLightbulb` | Classic/Icon |
| `lblBuildPlatesProgress` | Label |
| `lblColorText` | Label |
| `lblCourse` | Label |
| `lblCourseLabel` | Label |
| `lblcreated` | Label |
| `lblCreatedLabel` | Label |
| `lblDetailsHeader` | Label |
| `lblDiscipline` | Label |
| `lblDisciplineLabel` | Label |
| `lblEstimates` | Label |
| `lblFilename` | Label |
| `lblJobId` | Label |
| `lblJobIdLabel` | Label |
| `lblMessagesHeader` | Label |
| `lblNotesHeader` | Label |
| `lblPaymentHistoryLabel` | Label |
| `lblPaymentHistoryValue` | Label |
| `lblPrinter` | Label |
| `lblProjectType` | Label |
| `lblProjectTypeLabel` | Label |
| `lblSlicedOn` | Label |
| `lblStudentEmail` | Label |
| `lblStudentName` | Label |
| `lblSubmittedTime` | Label |
| `lblTransactionLabel` | Label |
| `lblTransactionValue` | Label |
| `lblUnreadBadge` | Label |
| `recCardBackground` | Rectangle |

### galPaymentHistory

| Control | Type |
|---------|------|
| `lblHistSummary` | Label |
| `recHistRowBg` | Rectangle |

### galPlatesPickup

| Control | Type |
|---------|------|
| `chkPlate` | Classic/CheckBox |
| `lblPlateName` | Label |

### galStatusTabs

| Control | Type |
|---------|------|
| `btnStatusTab` | Classic/Button |

### galViewMessages

| Control | Type |
|---------|------|
| `icoVMsgDirection` | Classic/Icon |
| `lblVMsgAuthor` | Label |
| `lblVMsgContent` | Label |
| `lblVMsgDirectionBadge` | Label |
| `recVMsgBg` | Rectangle |

### scrDashboard

| Control | Type |
|---------|------|
| `audNotification` | Audio |
| `btnClearFilters` | Classic/Button |
| `btnNavAnalytics` | Classic/Button |
| `btnNavSchedule` | Classic/Button |
| `btnRefresh` | Classic/Button |
| `chkNeedsAttention` | Classic/CheckBox |
| `conApprovalModal` | GroupContainer |
| `conArchiveModal` | GroupContainer |
| `conBatchPaymentModal` | GroupContainer |
| `conBatchSelectionFooter` | GroupContainer |
| `conBuildPlatesModal` | GroupContainer |
| `conCompleteModal` | GroupContainer |
| `conDetailsModal` | GroupContainer |
| `conExportModal` | GroupContainer |
| `conFileModal` | GroupContainer |
| `conLoadingOverlay` | GroupContainer |
| `conNotesModal` | GroupContainer |
| `conPaymentModal` | GroupContainer |
| `conRejectModal` | GroupContainer |
| `conRevertModal` | GroupContainer |
| `conStudentNoteModal` | GroupContainer |
| `conViewMessagesModal` | GroupContainer |
| `ddSortOrder` | Classic/DropDown |
| `galJobCards` | Gallery |
| `galStatusTabs` | Gallery |
| `lblAppTitle` | Label |
| `lblEmptyState` | Label |
| `recFilterBar` | Rectangle |
| `recHeader` | Rectangle |
| `tmrAutoRefresh` | Timer |
| `txtSearch` | Classic/TextInput |




---

# Audit findings (live app vs docs)

| Topic | Finding |
|-------|---------|
| **App.OnStart** | The live formula includes `// === SCHEDULE SCREEN STATE ===` **twice** (initial defaults, then again after `varRefreshInterval`). The second block resets `colEditShifts` with empty `ShiftStart`/`ShiftEnd` strings. Documented to match the live app; consider consolidating in a future app edit. |
| **Step 4 header** | Docs previously described `btnNavDashboard`, `btnNavAdmin`, and `lblUserName`. The live app uses **`btnNavSchedule`** + **`btnNavAnalytics`** (`Report`), `recHeader.Height = 55`, and `lblAppTitle.Y = 11`. |
| **Job card messaging** | Older steps referenced **`btnCardSendMessage`** on the card template. The live YAML has **`btnViewMessages`** + **`lblUnreadBadge`** only; compose/send is inside **conViewMessagesModal**. |
| **Approval modal tree** | **`lblWeightValidation`** is not present in the live app; sliced-on computer, own material, and build-plates shortcuts are. |
| **DisplayFields for staff** | Live `colStaff` includes `StaffID`, `AidType`, and `SchedSortOrder` (see variable table). ComboBox `DisplayFields` may use `["MemberName"]` or include email — match your live control. |
| **galStatusTabs** | Step 5 was updated: live **`FocusedBorderThickness`** is `0`. |

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
