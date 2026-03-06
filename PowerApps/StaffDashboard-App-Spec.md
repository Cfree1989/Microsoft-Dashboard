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
17. [Building the Revert Status Modal](#step-12d-building-the-revert-status-modal)
18. [Building the Notes Modal](#step-13-building-the-notes-modal)
19. [Building the Student Note Modal](#step-13b-building-the-student-note-modal)
20. [Adding Search and Filters](#step-14-adding-search-and-filters)
18. [Adding the Lightbulb Attention System](#step-15-adding-the-lightbulb-attention-system)
19. [Adding the Attachments Modal](#step-16-adding-the-attachments-modal)
20. [Adding the Messaging System](#step-17-adding-the-messaging-system) ← **⏸️ STOP: Create RequestComments list first**
    - [Step 17A: Adding the Data Connection](#step-17a-adding-the-data-connection)
    - [Step 17B: Adding Messages Display to Job Cards](#step-17b-adding-messages-display-to-job-cards)
    - [Step 17C: Adding the Message Button to Job Cards](#step-17c-adding-the-message-button-to-job-cards)
    - [Step 17D: Unified Messages Modal](#step-17d-unified-messages-modal)
    - [Step 17E: Adding the Loading Overlay](#step-17e-adding-the-loading-overlay) ← **UX Enhancement**
    - [Step 17F: Adding the Audio Notification System](#step-17f-adding-the-audio-notification-system) ← **NEW**
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
| Header Background | Dark Gray | `RGBA(45, 45, 48, 1)` | — |
| Modal Overlay | Black 70% | `RGBA(0, 0, 0, 0.7)` | — |
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

**Secondary buttons (light fill) should also include:**
| Property | Value |
|----------|-------|
| BorderColor | `varSecondaryBtnBorderColor` |
| BorderThickness | `2` |

### Corner Radius Standards

| Element Type | Radius | Variable | Examples |
|--------------|--------|----------|----------|
| Cards & Modals | `8` | — | `recCardBackground`, `recApprovalModal` |
| Primary Buttons | `6` | — | `btnViewMsgSend`, `btnCardSendMessage` |
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
| Row Hover Fill | `varDropdownHoverFill` | `RGBA(186, 202, 226, 1)` |
| Pressed Fill | `varDropdownPressedFill` | `RGBA(128, 128, 128, 1)` |
| Selection Fill | `varDropdownSelectionFill` | `RGBA(255, 255, 255, 1)` |

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
   - [x] **AuditLog**
   - [x] **Staff**
10. Click **Connect**.

### Adding the Office365Users Connector

> 💡 **Why this connector?** The Office365Users connector lets us display the signed-in user's profile photo in the header.

11. Click **+ Add data**.
12. In the search box, type `Office 365 Users`.
13. Click **Office 365 Users** from the list.
14. If prompted, sign in with your Microsoft 365 account.

### Adding the Power Automate Flow

> ⚠️ **IMPORTANT:** Adding a flow is DIFFERENT from adding a data source. Don't search for "Power Automate" in the data panel — those are admin connectors, not your flow!

15. Look in the **left sidebar** for a **Power Automate icon** (lightning bolt ⚡).
    - OR: In the top menu, click the **three dots (...)** → **Power Automate**
16. Click **+ Add flow**.
17. You'll see "Add a flow from this environment" with your flows listed.
18. Under **Instant**, find and click **Flow C (PR-Action)** (or whatever you named Flow C).
19. The flow is now added to your app.

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
- ✅ Office365Users

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

// === SLICING COMPUTERS ===
// Collection for slicing computer dropdown in approval modal
ClearCollect(colSlicingComputers, 
    {Name: "Computer 1"},
    {Name: "Computer 2"}
);

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
Set(varNeedsAttention, false);
Set(varExpandAll, false);

// === MODAL CONTROLS ===
// These control which modal is visible (0 = hidden, ID = visible for that item)
Set(varShowRejectModal, 0);
Set(varShowApprovalModal, 0);
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

// === BATCH PAYMENT MODE ===
// Controls multi-select batch payment functionality
Set(varBatchSelectMode, false);
ClearCollect(colBatchItems, Blank());
Clear(colBatchItems);

// Batch calculation variables (used during batch payment processing)
Set(varBatchTotalEstWeight, 0);
Set(varBatchCombinedWeight, 0);
Set(varBatchItemCount, 0);
Set(varBatchFinalCost, 0);
Set(varBatchProcessedCount, 0);

// Currently selected item for modals (typed to PrintRequests schema)
Set(varSelectedItem, Blank());

// === LOADING STATE ===
// Controls loading overlay visibility during async operations
Set(varIsLoading, false);

// === AUDIO NOTIFICATION SYSTEM ===
// Boolean trigger for Audio control (use Reset(audNotification) then Set(varPlaySound, true) to play)
Set(varPlaySound, false);

// Load NeedsAttention items into a local collection (avoids delegation)
ClearCollect(colNeedsAttention, Filter(PrintRequests, NeedsAttention = true));

// Track count for change detection (CountRows on local collection is safe)
Set(varPrevAttentionCount, CountRows(colNeedsAttention));

// === PRICING CONFIGURATION ===
// Centralized pricing rates - change here to update all cost calculations
Set(varFilamentRate, 0.10);    // $ per gram for filament printing
Set(varResinRate, 0.30);       // $ per gram for resin printing  
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
Set(varColorHeader, Color.Transparent);            // Header background
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
Set(varDropdownHoverFill, RGBA(186, 202, 226, 1));     // Light blue row hover
Set(varDropdownPressedFill, RGBA(128, 128, 128, 1));   // Gray when pressed
Set(varDropdownPressedColor, RGBA(255, 255, 255, 1)); // White text when pressed
Set(varDropdownSelectionFill, RGBA(255, 255, 255, 1)); // White selection background
Set(varDropdownSelectionColor, RGBA(255, 255, 255, 1)); // White selection text

// === LAYOUT DIMENSIONS ===
// Modal sizing - adjust for different screen sizes or design preferences
Set(varModalMaxWidth, 600);                        // Maximum modal width in pixels
Set(varModalMaxHeight, 650);                       // Standard modal height
Set(varModalMaxHeightExpanded, 740);               // Expanded height (with payment history)
Set(varModalMargin, 40);                           // Margin from screen edges

// Gallery template sizes
Set(varTabGalleryHeight, 148);                     // Status tabs gallery height
Set(varCardGalleryHeight, 450);                    // Job cards gallery template size

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
Set(varRefreshInterval, 10000);                    // 10 seconds

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
| `varShowCompleteModal` | ID of item being marked complete (0=hidden) | Number |
| `varShowDetailsModal` | ID of item for detail changes (0=hidden) | Number |
| `varShowPaymentModal` | ID of item for payment (0=hidden) | Number |
| `varShowAddFileModal` | ID of item for attachments (0=hidden) | Number |
| `varShowNotesModal` | ID of item for notes modal (0=hidden) | Number |
| `varShowViewMessagesModal` | ID of item for unified messages modal (0=hidden) | Number |
| `varShowStudentNoteModal` | ID of item for student note modal (0=hidden) | Number |
| `varShowRevertModal` | ID of item for revert status modal (0=hidden) | Number |
| `varShowBatchPaymentModal` | Controls batch payment modal visibility (0=hidden) | Number |
| `varBatchSelectMode` | Whether multi-select batch payment mode is active | Boolean |
| `colBatchItems` | Collection of items selected for batch payment | Table |
| `varBatchTotalEstWeight` | Sum of estimated weights for batch items (calculation temp) | Number |
| `varBatchCombinedWeight` | Combined final weight entered for batch (calculation temp) | Number |
| `varBatchItemCount` | Number of items in batch (calculation temp) | Number |
| `varBatchFinalCost` | Total final cost for batch (calculation temp) | Number |
| `varBatchProcessedCount` | Count of items processed (for notification) | Number |
| `varSelectedItem` | Item currently selected for modal | PrintRequests Record |
| `varIsLoading` | Shows loading overlay during operations | Boolean |
| `varLoadingMessage` | Custom message shown during loading | Text |
| `colNeedsAttention` | Local collection of NeedsAttention items (avoids delegation) | Table |
| `varPrevAttentionCount` | Previous count of NeedsAttention items (for change detection) | Number |
| `varPlaySound` | Boolean trigger for Audio; use `Reset(audNotification); Set(varPlaySound, true)` to play | Boolean |
| `varFilamentRate` | Cost per gram for filament printing | Number |
| `varResinRate` | Cost per gram for resin printing | Number |
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
| `varColorHeader` | Header background color | Color |
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
| `varCardGalleryHeight` | Job cards gallery template size | Number |
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
    ▼ conPaymentModal                 ← Step 12C (Payment Modal Container)
        btnPaymentConfirm
        btnPaymentCancel
        btnAddMoreItems
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
    audNotification                   ← Step 17F (Audio notification - invisible)
    tmrAutoRefresh                    ← Step 17F (Auto-refresh timer - invisible)
    btnClearFilters                   ← Step 14
    btnRefresh                        ← Step 14
    chkNeedsAttention                 ← Step 14
    txtSearch                         ← Step 14
    recFilterBar                      ← Step 14 (filter bar background)
    ▼ galJobCards                     ← Step 6
        btnCardSendMessage            ← Step 16C
        lblUnreadBadge                ← Step 16B (text on top)
        recUnreadBadge                ← Step 16B (circular background)
        btnViewMessages               ← Step 16B (opens View Messages Modal)
        lblMessagesHeader             ← Step 16B
        lblNotesHeader                ← Step 16B (notes count indicator)
        btnFiles                      ← Step 16
        btnRevert                     ← Step 9 (revert status for Printing/Completed)
        btnEditDetails                ← Step 12B
        btnPickedUp                   ← Step 9
        btnComplete                   ← Step 9
        btnStartPrint                 ← Step 9
        btnArchive                    ← Step 9
        btnReject                     ← Step 9
        btnApprove                    ← Step 9
        icoLightbulb                  ← Step 15
        icoBatchCheck                 ← Step 15 (batch selection indicator)
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
        btnStudentNote                ← Step 7 (opens Student Note Modal, visible only if note exists)
        lblPrinter                    ← Step 7
        lblStudentEmail               ← Step 7
        lblFilename                   ← Step 7
        lblSubmittedTime              ← Step 7
        lblStudentName                ← Step 7
        recCardBackground             ← Step 7
    ▼ conBatchSelectionFooter         ← Step 15 (Batch Selection Footer)
        btnProcessBatchPayment
        btnBatchCancel
        lblBatchStudents
        lblBatchEstTotal
        lblBatchCount
        lblBatchModeActive
        recBatchFooterBg
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
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
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
   - **X:** `Parent.Width - 260`
   - **Y:** `18`
   - **Width:** `200`
   - **Height:** `24`
   - **Align:** `Align.Right`
   - **Color:** `varColorBorder`
   - **Size:** `12`
   - **Visible:** `false`

> 💡 **Hidden by default:** The user name label is hidden to keep the header clean. Set `Visible: true` if you want to display the user's name in the header.

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

### Creating the Gallery (galStatusTabs)

1. Click **+ Insert** → **Horizontal gallery** (or search for "Blank horizontal gallery").
2. **Rename it:** `galStatusTabs`
3. Set properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `60` |
| Width | `Parent.Width` |
| Height | `50` |
| TemplateSize | `varTabGalleryHeight` |
| TemplatePadding | `3` |
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
| Height | `40` |
| Size | `11` |
| BorderRadius | `20` |
| Text | `ThisItem.Status & " " & Text(CountRows(Filter(PrintRequests, Status.Value = ThisItem.Status)))` |
| Fill | `If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1))` |
| Color | `If(varSelectedStatus = ThisItem.Status, Color.White, varColorText)` |
| OnSelect | `Set(varSelectedStatus, ThisItem.Status)` |
| HoverFill | `ColorFade(If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1)), -10%)` |
| PressedFill | `ColorFade(If(varSelectedStatus = ThisItem.Status, ThisItem.Color, RGBA(245, 245, 245, 1)), -20%)` |
| HoverColor | `If(varSelectedStatus = ThisItem.Status, Color.White, varColorText)` |
| PressedColor | `If(varSelectedStatus = ThisItem.Status, Color.White, varColorText)` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `1` |
| FocusedBorderColor | `varInputBorderColor` |
| FocusedBorderThickness | `1` |

> 💡 **Why these sizes?** 9 tabs × 148px = 1332px fits most tablet screens. The gallery uses `Parent.Width` so tabs scale with screen size. Font size 11 ensures "Paid & Picked Up" fits while remaining readable.
>
> ⚠️ **Note:** We use `Status.Value` because Status is a **Choice field** in SharePoint. Choice fields store objects, not plain text, so `.Value` extracts the text.

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
4. Set properties:

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
SortByColumns(
    Filter(
        PrintRequests,
        Status.Value = varSelectedStatus,
        If(
            IsBlank(varSearchText), 
            true, 
            varSearchText in Student.DisplayName || varSearchText in StudentEmail || varSearchText in ReqKey
        ),
        If(varNeedsAttention, NeedsAttention = true, true)
    ),
    "NeedsAttention", SortOrder.Descending,
    "Created", SortOrder.Ascending
)
```

> ⚠️ **Note:** Use `Status.Value` because Status is a Choice field in SharePoint. The sort puts attention items first, then oldest requests (longest in queue).
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
| Height | `Parent.TemplateHeight - 8` |
| Fill | `If(varBatchSelectMode && ThisItem.ID in colBatchItems.ID, RGBA(220, 240, 220, 1), If(ThisItem.NeedsAttention, RGBA(255, 235, 180, 1), varColorBgCard))` |
| BorderColor | `If(varBatchSelectMode && ThisItem.ID in colBatchItems.ID, varColorSuccess, If(ThisItem.NeedsAttention, RGBA(255, 235, 180, 1), varColorBorderLight))` |
| BorderThickness | `If(ThisItem.NeedsAttention, 2, 1)` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

4. Set **OnSelect:**

```powerfx
If(
    varBatchSelectMode && ThisItem.Status.Value = "Completed",
    // Batch mode: toggle item in collection
    If(
        ThisItem.ID in colBatchItems.ID,
        Remove(colBatchItems, LookUp(colBatchItems, ID = ThisItem.ID)),
        Collect(colBatchItems, ThisItem)
    ),
    // Normal mode: select item for details (no action needed here - buttons handle modals)
    Set(varSelectedItem, ThisItem)
)
```

> 💡 **Attention Styling:** Cards needing attention get a warm yellow background `RGBA(255, 235, 180, 1)` with an orange border `RGBA(255, 180, 0, 1)` and thicker border (2px vs 1px). In batch select mode, selected cards show a light green background with green border.

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
| Text | `"🖨 " & Trim(If(Find("(", ThisItem.Printer.Value) > 0, Left(ThisItem.Printer.Value, Find("(", ThisItem.Printer.Value) - 1), ThisItem.Printer.Value))` |
| X | `Parent.TemplateWidth / 2` |
| Y | `55` |
| Width | `Parent.TemplateWidth / 2 - 16` |
| Height | `20` |
| Size | `10` |
| Color | `varColorTextMuted` |

> 💡 **Why this formula?** The Printer column includes dimensions (e.g., "Prusa XL (14.2×14.2×14.2in)") to help students check if their model fits. This formula strips the dimensions for cleaner display on staff cards, showing just "Prusa XL".

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
| Color | `varColorTextMuted` |

27. Set **Text:**

```powerfx
If(
    ThisItem.Status.Value = "Paid & Picked Up" && !IsBlank(ThisItem.FinalCost),
    // After payment: show final weight and cost only
    "⚖ " & Text(ThisItem.FinalWeight) & "g · 💲" & Text(ThisItem.FinalCost, "[$-en-US]#,##0.00"),
    // Before payment: show estimates
    If(
        !IsBlank(ThisItem.EstimatedWeight),
        "⚖ " & Text(ThisItem.EstimatedWeight) & "g" &
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
| Fill | `ColorFade(varColorNeutral, varSecondaryFade)` |
| Color | `varColorNeutral` |
| HoverFill | `ColorFade(varColorNeutral, 55%)` |
| PressedFill | `ColorFade(varColorNeutral, 45%)` |
| BorderColor | `varSecondaryBtnBorderColor` |
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

> 💡 **Note:** This button opens the Notes Modal (Step 13) which displays both Student Notes and Staff Notes, and allows staff to add new notes.

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

> 💡 **Conditional Display:** This label appears on ANY status tab when PaymentNotes exist. This ensures staff can always see payment history even if a job is reverted back in the workflow (e.g., partial payment collected, then job sent back to "Printing").

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
| Visible | `!IsBlank(ThisItem.PaymentNotes)` |

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
| Visible | `!IsBlank(ThisItem.PaymentNotes)` |

Set **Text** (count payments and show total):

```powerfx
With(
    {payments: Split(ThisItem.PaymentNotes, " | ")},
    Text(CountRows(payments)) & " payment" & If(CountRows(payments) > 1, "s", "") & " recorded"
)
```

> 💡 **Why this matters:** When staff opens the Payment Modal for a partial pickup, they can see at a glance that prior payments exist. The full payment history is shown in the Payment Modal itself.

---

### ✅ Step 7 Checklist

Your gallery template should now contain these controls (Z-order: top = front):

```
▼ galJobCards
    lblPaymentHistoryValue         ← Any status with PaymentNotes
    lblPaymentHistoryLabel         ← Any status with PaymentNotes
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
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
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
| Y | `Parent.TemplateHeight - varBtnHeight - 12` |
| Width | `(Parent.TemplateWidth - 40) / 3` |
| Height | `varBtnHeight` |
| Fill | `varColorDanger` |
| Color | `White` |
| HoverFill | `varColorDangerHover` |
| PressedFill | `ColorFade(varColorDanger, -25%)` |
| BorderColor | `Transparent` |
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
| BorderColor | `Transparent` |
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
| BorderColor | `Transparent` |
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
    }
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
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `ThisItem.Status.Value = "Printing"` |

20. Set **OnSelect:**

```powerfx
Set(varShowCompleteModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Safety Check:** This opens the Complete Confirmation Modal (built in Step 12A) instead of immediately marking the print complete. This prevents accidental status changes and ensures staff intentionally confirms before the student receives a pickup notification email.

### Picked Up Button (btnPickedUp)

21. Click **+ Insert** → **Button**.
22. **Rename it:** `btnPickedUp`
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
| BorderColor | `Transparent` |
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

24. Set **OnSelect:**

```powerfx
Set(varShowPaymentModal, ThisItem.ID);
Set(varSelectedItem, ThisItem)
```

> 💡 **Note:** This opens the Payment Modal (built in Step 12C) where staff enters the transaction number, final weight, and payment details. When opened from "Printing" status, it records a partial payment (student picking up completed portions while the rest continues printing). When opened from "Completed" status, staff can choose partial or full pickup.

### Edit Details Button (btnEditDetails)

25. Click **+ Insert** → **Button**.
26. **Rename it:** `btnEditDetails`
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
Set(varSelectedItem, ThisItem)
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
| Fill | `Transparent` |
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
| Visible | `ThisItem.Status.Value in ["Printing", "Completed"] && !varBatchSelectMode` |

> ⚠️ **Batch Mode:** Button is hidden when `varBatchSelectMode = true` to allow clicking the card for batch selection.

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
| BorderColor | `Transparent` |
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
| BorderColor | `Transparent` |
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
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "REJECTED by " &
        With({n: ddRejectStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
        ": " & Concat(varRejectionReasonsTable, Value, "; ") &
        If(!IsBlank(txtRejectComments.Text), " - " & txtRejectComments.Text, "") &
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
    ├── txtEstimatedTime         ← Time input field (required)
    ├── lblApprovalTimeLabel     ← "Estimated Print Time (hours): *"
    ├── lblWeightValidation      ← Weight validation error message
    ├── txtEstimatedWeight       ← Weight input field
    ├── lblApprovalWeightLabel   ← "Estimated Weight (grams): *"
    ├── ddSlicedOnComputer       ← Slicing computer dropdown
    ├── lblSlicedOnLabel         ← "Sliced On Computer:"
    ├── ddApprovalStaff          ← Staff dropdown
    ├── lblApprovalStaffLabel    ← "Performing Action As: *"
    ├── lblApprovalStudent       ← Student name and email
    ├── lblApprovalTitle         ← "Approve Request - REQ-00042"
    ├── recApprovalModal         ← White modal box (725px tall)
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
| Fill | `varColorOverlay` |

---

### Modal Content Box (recApprovalModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recApprovalModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 725) / 2` |
| Width | `600` |
| Height | `725` |
| Fill | `varColorBgCard` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

> 💡 **Modal Height:** 725px to accommodate slicing computer dropdown and required time field.

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

### Slicing Computer Label (lblSlicedOnLabel)

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblSlicedOnLabel`
25. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Sliced On Computer: *"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 165` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Slicing Computer Dropdown (ddSlicedOnComputer)

26. Click **+ Insert** → **Combo box**.
27. **Rename it:** `ddSlicedOnComputer`
28. Set properties:

| Property | Value |
|----------|-------|
| Items | `colSlicingComputers` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 190` |
| Width | `200` |
| Height | `36` |
| DisplayFields | `["Name"]` |
| SearchFields | `["Name"]` |
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

> 💡 **Note:** This field is required. Staff must select which computer was used for slicing; it will display on the job card after approval.

---

### Weight Label (lblApprovalWeightLabel)

29. Click **+ Insert** → **Text label**.
30. **Rename it:** `lblApprovalWeightLabel`
31. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Weight (grams): *"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 240` |
| Width | `250` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Weight Input (txtEstimatedWeight)

32. Click **+ Insert** → **Text input**.
33. **Rename it:** `txtEstimatedWeight`
34. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 265` |
| Width | `200` |
| Height | `36` |
| HintText | `"Enter weight in grams (e.g., 25)"` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Weight Validation Label (lblWeightValidation)

35. Click **+ Insert** → **Text label**.
36. **Rename it:** `lblWeightValidation`
37. Set properties:

| Property | Value |
|----------|-------|
| X | `recApprovalModal.X + 230` |
| Y | `recApprovalModal.Y + 270` |
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

38. Click **+ Insert** → **Text label**.
39. **Rename it:** `lblApprovalTimeLabel`
40. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Print Time (hours): *"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 315` |
| Width | `300` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

> ⚠️ **Required Field:** Print time is now required (changed from optional).

---

### Time Input (txtEstimatedTime)

41. Click **+ Insert** → **Text input**.
42. **Rename it:** `txtEstimatedTime`
43. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 340` |
| Width | `200` |
| Height | `36` |
| HintText | `"Enter hours (e.g., 2.5)"` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Cost Label (lblApprovalCostLabel)

44. Click **+ Insert** → **Text label**.
45. **Rename it:** `lblApprovalCostLabel`
46. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Estimated Cost:"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 395` |
| Width | `150` |
| Height | `25` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |

---

### Cost Value Display (lblApprovalCostValue)

47. Click **+ Insert** → **Text label**.
48. **Rename it:** `lblApprovalCostValue`
49. Set properties:

| Property | Value |
|----------|-------|
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 420` |
| Width | `200` |
| Height | `40` |
| FontWeight | `FontWeight.Bold` |
| Size | `24` |
| Color | `RGBA(16, 124, 16, 1)` |

50. Set **Text:**

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

51. Click **+ Insert** → **Text label**.
52. **Rename it:** `lblApprovalCommentsLabel`
53. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Additional Comments (optional):"` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 475` |
| Width | `300` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Comments Text Input (txtApprovalComments)

54. Click **+ Insert** → **Text input**.
55. **Rename it:** `txtApprovalComments`
56. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recApprovalModal.X + 20` |
| Y | `recApprovalModal.Y + 500` |
| Width | `560` |
| Height | `80` |
| HintText | `"Add any special instructions for this job..."` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Cancel Button (btnApprovalCancel)

57. Click **+ Insert** → **Button**.
58. **Rename it:** `btnApprovalCancel`
59. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recApprovalModal.X + 300` |
| Y | `recApprovalModal.Y + 635` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

60. Set **OnSelect:**

```powerfx
Set(varShowApprovalModal, 0);
Set(varSelectedItem, Blank());
Reset(txtEstimatedWeight);
Reset(txtEstimatedTime);
Reset(txtApprovalComments);
Reset(ddApprovalStaff);
Reset(ddSlicedOnComputer)
```

---

### Confirm Approval Button (btnApprovalConfirm)

61. Click **+ Insert** → **Button**.
62. **Rename it:** `btnApprovalConfirm`
63. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Confirm Approval"` |
| X | `recApprovalModal.X + 430` |
| Y | `recApprovalModal.Y + 635` |
| Width | `150` |
| Height | `varBtnHeight` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `varColorSuccessHover` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

64. Set **DisplayMode:**

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

> ⚠️ **Required Fields:** Staff, sliced on computer, weight, AND time are all required for the confirm button to be enabled.

65. Set **OnSelect:**

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
IfError(
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
        SlicedOnComputer: {Value: ddSlicedOnComputer.Selected.Name},
        StaffNotes: Concatenate(
            If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
            "APPROVED by " & 
            With({n: ddApprovalStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
            ": " & txtEstimatedWeight.Text & "g, $" & Text(varCalculatedCost, "[$-en-US]#,##0.00") &
            " on " & ddSlicedOnComputer.Selected.Name &
            If(!IsBlank(txtApprovalComments.Text), " - " & txtApprovalComments.Text, "") &
            " - " & Text(Now(), "m/d h:mmam/pm")
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
    Reset(ddApprovalStaff);
    Reset(ddSlicedOnComputer)
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
| BorderColor | `Transparent` |
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
| BorderColor | `Transparent` |
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
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "ARCHIVED by " & 
        With({n: ddArchiveStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
        If(!IsBlank(txtArchiveReason.Text), ": " & txtArchiveReason.Text, "") &
        " - " & Text(Now(), "m/d h:mmam/pm")
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
    ├── ddCompleteStaff       ← Staff dropdown
    ├── lblCompleteStaffLabel ← "Performing Action As: *"
    ├── lblCompleteWarning    ← Warning about email notification
    ├── lblCompleteTitle      ← "Mark [Student Name] Complete - REQ-00042"
    ├── recCompleteModal      ← White modal box
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
| Y | `(Parent.Height - 260) / 2` |
| Width | `500` |
| Height | `260` |
| Fill | `varColorBgCard` |

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
| Text | `"Performing Action As: *"` |
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

### Cancel Button (btnCompleteCancel)

23. Click **+ Insert** → **Button**.
24. **Rename it:** `btnCompleteCancel`
25. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recCompleteModal.X + 200` |
| Y | `recCompleteModal.Y + 200` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
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

27. Click **+ Insert** → **Button**.
28. **Rename it:** `btnCompleteConfirm`
29. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Confirm Complete"` |
| X | `recCompleteModal.X + 330` |
| Y | `recCompleteModal.Y + 200` |
| Width | `150` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| DisplayMode | `If(IsBlank(ddCompleteStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

30. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Completing print...");

// Update SharePoint item
Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
    Status: LookUp(Choices(PrintRequests.Status), Value = "Completed"),
    LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
    LastActionBy: {
        Claims: "i:0#.f|membership|" & ddCompleteStaff.Selected.MemberEmail,
        Discipline: "",
        DisplayName: ddCompleteStaff.Selected.MemberName,
        Email: ddCompleteStaff.Selected.MemberEmail,
        JobTitle: "",
        Picture: ""
    },
    LastActionAt: Now()
});

// Log action via Flow C
IfError(
    'Flow-(C)-Action-LogAction'.Run(
        Text(varSelectedItem.ID),              // RequestID
        "Status Change",                       // Action
        "Status",                              // FieldName
        "Completed",                           // NewValue
        ddCompleteStaff.Selected.MemberEmail   // ActorEmail
    ),
    Notify("Marked complete, but could not log to audit.", NotificationType.Warning),
    Notify("Marked as completed! Student will receive pickup email.", NotificationType.Success)
);

// Close modal and reset
Set(varShowCompleteModal, 0);
Set(varSelectedItem, Blank());
Reset(ddCompleteStaff);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Email Notification:** When the status changes to "Completed", Flow B automatically sends a pickup notification email to the student. This modal ensures staff intentionally confirms before that email is sent.

---

# STEP 12B: Building the Change Print Details Modal

**What you're doing:** Creating a modal that allows staff to change Method, Printer, Color, Weight, Hours, and recalculate Cost for a job. All changes are optional — staff can update any combination of fields.

> 🎯 **Using Containers:** This modal uses a **Container** to group all controls together. Setting `Visible` on the container automatically shows/hides all child controls!

> 💡 **Why this matters:** Provides flexibility to fix mistakes or adjust job parameters at any point in the workflow (except Pending status). Changing Method automatically resets the Printer dropdown to show compatible printers only.

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
| Fill | `varColorOverlay` |

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

### Transaction Number Label (lblDetailsTransLabel)

62. Click **+ Insert** → **Text label**.
63. **Rename it:** `lblDetailsTransLabel`
64. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Transaction #:"` |
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 395` |
| Width | `130` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Visible | `!IsBlank(varSelectedItem.TransactionNumber)` |

> 💡 **Conditional visibility:** This field appears whenever a transaction number exists, regardless of status. This allows staff to correct typos even if a job has been reverted back in the workflow.

---

### Transaction Number Input (txtDetailsTransaction)

65. Click **+ Insert** → **Text input**.
66. **Rename it:** `txtDetailsTransaction`
67. Set properties:

| Property | Value |
|----------|-------|
| X | `recDetailsModal.X + 20` |
| Y | `recDetailsModal.Y + 418` |
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

68. Click **+ Insert** → **Button**.
69. **Rename it:** `btnDetailsCancel`
70. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recDetailsModal.X + 230` |
| Y | `recDetailsModal.Y + 560` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

71. Set **OnSelect:**

```powerfx
Set(varShowDetailsModal, 0);
Set(varSelectedItem, Blank());
Reset(ddDetailsStaff);
Reset(ddDetailsMethod);
Reset(ddDetailsPrinter);
Reset(ddDetailsColor);
Reset(txtDetailsWeight);
Reset(txtDetailsHours);
Reset(txtDetailsTransaction)
```

---

### Save Changes Button (btnDetailsConfirm)

72. Click **+ Insert** → **Button**.
73. **Rename it:** `btnDetailsConfirm`
74. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✓ Save Changes"` |
| X | `recDetailsModal.X + 360` |
| Y | `recDetailsModal.Y + 560` |
| Width | `170` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

75. Set **DisplayMode:**

```powerfx
If(
    !IsBlank(ddDetailsStaff.Selected) && 
    (
        // At least one field must be changed
        (!IsBlank(ddDetailsMethod.Selected) && ddDetailsMethod.Selected.Value <> varSelectedItem.Method.Value) ||
        (!IsBlank(ddDetailsPrinter.Selected) && ddDetailsPrinter.Selected.Value <> varSelectedItem.Printer.Value) ||
        (!IsBlank(ddDetailsColor.Selected) && ddDetailsColor.Selected.Value <> varSelectedItem.Color.Value) ||
        (IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) <> Coalesce(varSelectedItem.EstimatedWeight, 0)) ||
        (IsNumeric(txtDetailsHours.Text) && Value(txtDetailsHours.Text) <> Coalesce(varSelectedItem.EstimatedTime, 0)) ||
        (!IsBlank(txtDetailsTransaction.Text) && txtDetailsTransaction.Text <> Coalesce(varSelectedItem.TransactionNumber, ""))
    ),
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

> 💡 Button is enabled only when staff is selected AND at least one field is being changed (including transaction number for paid items).

76. Set **OnSelect:**

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
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") & "Printer: " & 
        Trim(If(Find("(", varSelectedItem.Printer.Value) > 0, Left(varSelectedItem.Printer.Value, Find("(", varSelectedItem.Printer.Value) - 1), varSelectedItem.Printer.Value)) & 
        " → " & 
        Trim(If(Find("(", ddDetailsPrinter.Selected.Value) > 0, Left(ddDetailsPrinter.Selected.Value, Find("(", ddDetailsPrinter.Selected.Value) - 1), ddDetailsPrinter.Selected.Value))));
If(!IsBlank(ddDetailsColor.Selected) && ddDetailsColor.Selected.Value <> varSelectedItem.Color.Value,
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") & "Color: " & varSelectedItem.Color.Value & " → " & ddDetailsColor.Selected.Value));
If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) <> Coalesce(varSelectedItem.EstimatedWeight, 0),
    Set(varChangeDesc, If(IsBlank(varChangeDesc), "", varChangeDesc & "; ") & "Weight: " & Coalesce(varSelectedItem.EstimatedWeight, 0) & "g → " & txtDetailsWeight.Text & "g"));
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
        Printer: If(!IsBlank(ddDetailsPrinter.Selected), ddDetailsPrinter.Selected, varSelectedItem.Printer),
        Color: If(!IsBlank(ddDetailsColor.Selected), ddDetailsColor.Selected, varSelectedItem.Color),
        EstimatedWeight: If(IsNumeric(txtDetailsWeight.Text) && Value(txtDetailsWeight.Text) > 0, Value(txtDetailsWeight.Text), varSelectedItem.EstimatedWeight),
        EstimatedTime: If(IsNumeric(txtDetailsHours.Text) && Value(txtDetailsHours.Text) > 0, Value(txtDetailsHours.Text), varSelectedItem.EstimatedTime),
        EstimatedCost: varNewCost,
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
            If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
            "UPDATED by " & 
            With({n: ddDetailsStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
            ": " & varChangeDesc & " - " & Text(Now(), "m/d h:mmam/pm")
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
Reset(txtDetailsTransaction);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Cost recalculation:** When weight or method changes, cost is automatically recalculated using: `Max(varMinimumCost, weight × rate)` where rate is `varFilamentRate` for Filament and `varResinRate` for Resin (configured in App.OnStart)

> 💡 **Transaction number editing:** The transaction number field only appears for items that have already been paid (have a TransactionNumber value). This allows staff to correct typos without undoing the entire payment.

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
    ├── btnAddMoreItems       ← Batch mode button (adds item to batch, enters multi-select)
    ├── chkPartialPickup      ← Partial pickup checkbox (keeps status as Completed)
    ├── txtPaymentNotes       ← Multi-line text input
    ├── lblPaymentNotesLabel  ← "Payment Notes (optional):"
    ├── txtPaymentHistory     ← Prior payments display (conditional)
    ├── lblPaymentHistoryHeader ← "⚠️ Prior Payments" (conditional)
    ├── chkOwnMaterial        ← Own material checkbox (70% discount)
    ├── dpPaymentDate         ← Date picker (default: Today())
    ├── lblPaymentDateLabel   ← "Payment Date: *"
    ├── lblPaymentCostValue   ← Auto-calculated cost display (reflects discount)
    ├── lblPaymentCostLabel   ← "Final Cost:"
    ├── txtPaymentWeight      ← Weight input (pre-filled with EstimatedWeight)
    ├── lblPaymentWeightLabel ← "Final Weight (grams): *"
    ├── txtPaymentTransaction ← Transaction number input (required)
    ├── lblPaymentTransLabel  ← "Transaction Number: *" (dynamic based on payment type)
    ├── ddPaymentType         ← Payment type dropdown (TigerCASH, Check, Code)
    ├── lblPaymentTypeLabel   ← "Payment Type: *"
    ├── ddPaymentStaff        ← Staff dropdown
    ├── lblPaymentStaffLabel  ← "Performing Action As: *"
    ├── lblPaymentStudent     ← Student name and estimated vs final info
    ├── lblPaymentTitle       ← "Record Payment - REQ-00042"
    ├── recPaymentModal       ← White modal box (dynamic height)
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
| Fill | `varColorOverlay` |

---

### Modal Content Box (recPaymentModal)

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recPaymentModal`
10. Set properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 550) / 2` |
| Y | `(Parent.Height - If(!IsBlank(varSelectedItem.PaymentNotes), 740, 650)) / 2` |
| Width | `550` |
| Height | `If(!IsBlank(varSelectedItem.PaymentNotes), 740, 650)` |
| Fill | `varColorBgCard` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

> 💡 **Dynamic Height:** The modal grows taller (740px vs 650px) when there are prior payments to display. This ensures the payment history section fits without crowding other controls.

---

### Modal Title (lblPaymentTitle)

8. Click **+ Insert** → **Text label**.
9. **Rename it:** `lblPaymentTitle`
10. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(varSelectedItem.Status.Value = "Printing", "Partial Payment - ", "Record Payment - ") & varSelectedItem.ReqKey` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 20` |
| Width | `510` |
| Height | `30` |
| Font | `Font.'Open Sans'` |
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
| Color | `varColorTextMuted` |

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

### Payment Type Label (lblPaymentTypeLabel)

21. Click **+ Insert** → **Text label**.
22. **Rename it:** `lblPaymentTypeLabel`
23. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Payment Type: *"` |
| X | `recPaymentModal.X + 340` |
| Y | `recPaymentModal.Y + 105` |
| Width | `180` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Payment Type Dropdown (ddPaymentType)

24. Click **+ Insert** → **Drop down**.
25. **Rename it:** `ddPaymentType`
26. Set properties:

| Property | Value |
|----------|-------|
| Items | `["TigerCASH", "Check", "Code"]` |
| X | `recPaymentModal.X + 340` |
| Y | `recPaymentModal.Y + 130` |
| Width | `180` |
| Height | `36` |
| Default | `"TigerCASH"` |
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

> 💡 **Payment Types:**
> - **TigerCASH** - Standard campus payment (receipt number)
> - **Check** - Paper check payment (check number)
> - **Code** - Grant or program code (e.g., GRANT-12345)

---

### Transaction Label (lblPaymentTransLabel)

27. Click **+ Insert** → **Text label**.
28. **Rename it:** `lblPaymentTransLabel`
29. Set properties:

| Property | Value |
|----------|-------|
| Text | See formula below |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 180` |
| Width | `250` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

Set **Text** (dynamic based on payment type):

```powerfx
Switch(
    ddPaymentType.Selected.Value,
    "TigerCASH", "Transaction Number: *",
    "Check", "Check Number: *",
    "Code", "Grant/Program Code: *",
    "Reference Number: *"
)
```

---

### Transaction Input (txtPaymentTransaction)

30. Click **+ Insert** → **Text input**.
31. **Rename it:** `txtPaymentTransaction`
32. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 205` |
| Width | `250` |
| Height | `36` |
| HintText | See formula below |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

Set **HintText** (dynamic based on payment type):

```powerfx
Switch(
    ddPaymentType.Selected.Value,
    "TigerCASH", "TigerCASH receipt number",
    "Check", "Check number",
    "Code", "e.g. GRANT-12345",
    "Reference number"
)
```

---

### Weight Label (lblPaymentWeightLabel)

33. Click **+ Insert** → **Text label**.
34. **Rename it:** `lblPaymentWeightLabel`
35. Set properties:

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

36. Click **+ Insert** → **Text input**.
37. **Rename it:** `txtPaymentWeight`
38. Set properties:

| Property | Value |
|----------|-------|
| Format | `TextFormat.Number` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 280` |
| Width | `150` |
| Height | `36` |
| HintText | `"Weight in grams"` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

39. Set **Default:**
- none.

> 💡 **Pre-fill:** The weight input pre-fills with the estimated weight. Staff should update this with the actual measured weight of the finished print.

---

### Cost Label (lblPaymentCostLabel)

40. Click **+ Insert** → **Text label**.
41. **Rename it:** `lblPaymentCostLabel`
42. Set properties:

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

43. Click **+ Insert** → **Text label**.
44. **Rename it:** `lblPaymentCostValue`
45. Set properties:

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
    With(
        {
            baseCost: Max(
                varMinimumCost,
                Value(txtPaymentWeight.Text) * If(
                    varSelectedItem.Method.Value = "Resin",
                    varResinRate,
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

> 💰 **Pricing:** Uses `varFilamentRate`, `varResinRate`, and `varMinimumCost` from App.OnStart. When `chkOwnMaterial` is checked, the cost is reduced to 30% of the base price (70% discount).

---

### Own Material Checkbox (chkOwnMaterial)

> 💡 **Use Case:** When students provide their own filament/resin, they receive a 70% discount (pay only 30% of normal cost). This is recorded in the SharePoint `StudentOwnMaterial` field for tracking.

46. Click **+ Insert** → **Checkbox**.
47. **Rename it:** `chkOwnMaterial`
48. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student provided own material (70% discount)"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 400` |
| Width | `510` |
| Height | `32` |
| FontWeight | `FontWeight.Semibold` |
| Color | `RGBA(0, 158, 73, 1)` |

> 💰 **Discount Logic:** When checked, the `lblPaymentCostValue` display and final cost calculation both apply a 70% discount (multiply by 0.30).

---

### Date Label (lblPaymentDateLabel)

49. Click **+ Insert** → **Text label**.
50. **Rename it:** `lblPaymentDateLabel`
51. Set properties:

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

52. Click **+ Insert** → **Date picker**.
53. **Rename it:** `dpPaymentDate`
54. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 300` |
| Y | `recPaymentModal.Y + 205` |
| Width | `200` |
| Height | `36` |
| DefaultDate | `Today()` |

---

### Payment History Section (Conditional)

> 💡 **Conditional Display:** This section only appears when there are prior payments recorded in PaymentNotes (indicating partial payments were already made). It shows staff what has already been collected before they process another payment.

55. Click **+ Insert** → **Text label**.
56. **Rename it:** `lblPaymentHistoryHeader`
57. Set properties:

| Property | Value |
|----------|-------|
| Text | `"⚠️ Prior Payments on This Job"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 440` |
| Width | `510` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `RGBA(180, 100, 0, 1)` |
| Visible | `!IsBlank(varSelectedItem.PaymentNotes)` |

58. Click **+ Insert** → **Text input**.
59. **Rename it:** `txtPaymentHistory`
60. Set properties:

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 462` |
| Width | `510` |
| Height | `55` |
| Mode | `TextMode.MultiLine` |
| DisplayMode | `DisplayMode.View` |
| Size | `10` |
| Color | `RGBA(80, 80, 80, 1)` |
| Fill | `RGBA(255, 248, 230, 1)` |
| BorderColor | `RGBA(220, 180, 100, 1)` |
| Visible | `!IsBlank(varSelectedItem.PaymentNotes)` |

61. Set **Default** (parse and display payment history):

```powerfx
Concat(
    ForAll(
        Split(varSelectedItem.PaymentNotes, " | ") As entry,
        With(
            {
                text: entry.Value,
                colonPos: Find(":", entry.Value),
                hashPos: Find("#", entry.Value)
            },
            With(
                {
                    staffName: If(colonPos > 0, Left(text, Max(0, colonPos - 1)), ""),
                    datetime: Last(Split(text, " - ")).Value,
                    // Everything between ":" and the last " - " is the payment details
                    middlePart: If(colonPos > 0, 
                        Trim(Mid(text, colonPos + 2, Max(0, Len(text) - colonPos - Len(Last(Split(text, " - ")).Value) - 4))),
                        "")
                },
                With(
                    {
                        // Split middle part at "#" to get amount and transaction+note
                        amountPart: If(hashPos > colonPos, Trim(Mid(text, colonPos + 2, Max(0, hashPos - colonPos - 2))), middlePart),
                        afterHash: If(hashPos > 0, Trim(Mid(text, hashPos + 1, Max(0, Len(text) - hashPos - Len(Last(Split(text, " - ")).Value) - 3))), ""),
                        isPartial: Find("partial", text) > 0
                    },
                    With(
                        {
                            transNum: If(Find(" ", afterHash) > 0, Left(afterHash, Find(" ", afterHash) - 1), afterHash),
                            noteText: If(Find(" - ", afterHash) > 0, Trim(Mid(afterHash, Find(" - ", afterHash) + 3, Len(afterHash))), "")
                        },
                        datetime & " - " & If(isPartial, "PARTIAL PAYMENT", "PAYMENT") & Char(10) &
                        staffName & Char(10) &
                        "Transaction #" & transNum & " - " & amountPart & 
                        If(!IsBlank(noteText), " - """ & noteText & """", "") &
                        Char(10) & Char(10)
                    )
                )
            )
        )
    ),
    Value
)
```

> 💡 **Formatted display:** Each payment entry is parsed and displayed to match the Staff Notes format:
> ```
> 2/9 11:21AM - PARTIAL PAYMENT
> Conrad F.
> Transaction #150 - $6.00 partial (60g) - "Picking up part so they can work on it while the rest finishes."
> ```
> This makes it consistent with how Staff Notes & Activity entries are displayed.

> 💡 **Why this matters:** Staff can see exactly what payments have been recorded before processing another partial or final pickup. This prevents confusion about what's already been collected.

---

### Notes Label (lblPaymentNotesLabel)

> ⚠️ **Dynamic Y Position:** This control and all controls below it shift down when payment history is visible.

62. Click **+ Insert** → **Text label**.
63. **Rename it:** `lblPaymentNotesLabel`
64. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(varSelectedItem.Status.Value = "Printing", "Partial Payment Notes (optional):", "Payment Notes (optional):")` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + If(!IsBlank(varSelectedItem.PaymentNotes), 525, 440)` |
| Width | `300` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Notes Text Input (txtPaymentNotes)

65. Click **+ Insert** → **Text input**.
66. **Rename it:** `txtPaymentNotes`
67. Set properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + If(!IsBlank(varSelectedItem.PaymentNotes), 547, 462)` |
| Width | `510` |
| Height | `50` |
| HintText | `"Any discrepancies, special circumstances..."` |
| Font | `varAppFont` |
| Size | `varInputFontSize` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| HoverFill | `varInputHoverFill` |
| DisabledBorderColor | `varInputBorderColor` |

---

### Partial Pickup Checkbox (chkPartialPickup)

> 💡 **Use Case:** When students pick up only some of their printed items and will return for the rest. This keeps the job in "Completed" status so staff can process another payment later. This checkbox only appears when the Payment Modal is opened from "Completed" status — when opened from "Printing" status, partial payment is automatic (the job continues printing).

68. Click **+ Insert** → **Checkbox**.
69. **Rename it:** `chkPartialPickup`
70. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Partial Pickup — Student will return for remaining items"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + If(!IsBlank(varSelectedItem.PaymentNotes), 605, 520)` |
| Width | `510` |
| Height | `32` |
| FontItalic | `true` |
| Color | `RGBA(150, 100, 0, 1)` |
| Visible | `varSelectedItem.Status.Value = "Completed"` |

> ⚠️ **Behavior:** When checked, the status stays "Completed" instead of changing to "Paid & Picked Up". Payment details are recorded in PaymentNotes, and staff can process additional payments when the student returns. When the modal is opened from "Printing" status, this checkbox is hidden because partial payment is automatic — the job continues printing.

---

### Add More Items Button (btnAddMoreItems)

> 💡 **Use Case:** When a student is picking up multiple jobs at once (their own or friends'), staff can click this button to enter batch select mode. The current item is added to a batch collection, the modal closes, and staff can select additional "Completed" items from the gallery before processing them all in one transaction.

71. Click **+ Insert** → **Button**.
72. **Rename it:** `btnAddMoreItems`
73. Set properties:

| Property | Value |
|----------|-------|
| Text | `"+ Add More Items"` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + If(!IsBlank(varSelectedItem.PaymentNotes), 650, 565)` |
| Width | `140` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorPrimary, -15%)` |
| PressedFill | `ColorFade(varColorPrimary, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `varSelectedItem.Status.Value = "Completed"` |

> ⚠️ **Visibility:** This button only appears when the Payment Modal is opened from "Completed" status. When opened from "Printing" status (for partial payments during active printing), batch mode is not available.

74. Set **OnSelect:**

```powerfx
// Add current item to batch collection
Collect(colBatchItems, varSelectedItem);

// Enable batch select mode
Set(varBatchSelectMode, true);

// Close this modal
Set(varShowPaymentModal, 0);
Set(varSelectedItem, Blank());

// Reset modal fields
Reset(txtPaymentTransaction);
Reset(txtPaymentWeight);
Reset(dpPaymentDate);
Reset(txtPaymentNotes);
Reset(ddPaymentStaff);
Reset(chkOwnMaterial);
Reset(chkPartialPickup);
Reset(ddPaymentType);

// Notify user
Notify("Batch mode enabled. Select more Completed items, then click 'Process Batch Payment'.", NotificationType.Information)
```

---

### Cancel Button (btnPaymentCancel)

75. Click **+ Insert** → **Button**.
76. **Rename it:** `btnPaymentCancel`
77. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recPaymentModal.X + 250` |
| Y | `recPaymentModal.Y + If(!IsBlank(varSelectedItem.PaymentNotes), 650, 565)` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

78. Set **OnSelect:**

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
Reset(ddPaymentType)
```

---

### Confirm Payment Button (btnPaymentConfirm)

79. Click **+ Insert** → **Button**.
80. **Rename it:** `btnPaymentConfirm`
81. Set properties:

| Property | Value |
|----------|-------|
| Text | `If(chkPartialPickup.Value, "✓ Record Partial Payment", "✓ Record Payment")` |
| X | `recPaymentModal.X + 380` |
| Y | `recPaymentModal.Y + If(!IsBlank(varSelectedItem.PaymentNotes), 650, 565)` |
| Width | `150` |
| Height | `varBtnHeight` |
| Fill | `If(chkPartialPickup.Value, varColorWarning, varColorSuccess)` |
| Color | `Color.White` |
| HoverFill | `ColorFade(Self.Fill, -15%)` |
| PressedFill | `ColorFade(Self.Fill, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

> 💡 **Button changes color:** Green for full pickup, Orange for partial pickup.

82. Set **DisplayMode:**

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

83. Set **OnSelect:**

```powerfx
// === SHOW LOADING ===
Set(varIsLoading, true);
Set(varLoadingMessage, "Recording payment...");

// Calculate cost from weight picked up (with discount if own material)
Set(varBaseCost, 
    Max(
        varMinimumCost,
        Value(txtPaymentWeight.Text) * If(
            varSelectedItem.Method.Value = "Resin",
            varResinRate,
            varFilamentRate
        )
    )
);
Set(varFinalCost, If(chkOwnMaterial.Value, varBaseCost * varOwnMaterialDiscount, varBaseCost));

// Build payment record string (used for both partial and full)
// Format matches other staff notes: "Name: details - timestamp"
Set(varPaymentRecord,
    With({n: ddPaymentStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
    ": " & 
    Text(varFinalCost, "[$-en-US]$#,##0.00") & 
    If(chkPartialPickup.Value, " partial", "") &
    " (" & txtPaymentWeight.Text & "g" &
    If(chkOwnMaterial.Value, ", own material", "") &
    ") #" & txtPaymentTransaction.Text &
    If(!IsBlank(txtPaymentNotes.Text), " - " & txtPaymentNotes.Text, "") &
    " - " & Text(Now(), "m/d h:mmam/pm")
);

// Update SharePoint item - conditional on partial pickup or Printing status
// Using LookUp to get fresh record avoids concurrency conflicts
If(
    chkPartialPickup.Value || varSelectedItem.Status.Value = "Printing",
    // PARTIAL PAYMENT: Keep status unchanged (Completed or Printing), append to PaymentNotes
    Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
        // Status stays "Completed" - don't change it
        PaymentType: LookUp(Choices(PrintRequests.PaymentType), Value = ddPaymentType.Selected.Value),
        TransactionNumber: If(
            IsBlank(varSelectedItem.TransactionNumber),
            txtPaymentTransaction.Text,
            varSelectedItem.TransactionNumber & ", " & txtPaymentTransaction.Text
        ),
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
    Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
        Status: LookUp(Choices(PrintRequests.Status), Value = "Paid & Picked Up"),
        PaymentType: LookUp(Choices(PrintRequests.PaymentType), Value = ddPaymentType.Selected.Value),
        TransactionNumber: If(
            IsBlank(varSelectedItem.TransactionNumber),
            txtPaymentTransaction.Text,
            varSelectedItem.TransactionNumber & ", " & txtPaymentTransaction.Text
        ),
        FinalWeight: Value(txtPaymentWeight.Text),
        FinalCost: varFinalCost,
        StudentOwnMaterial: chkOwnMaterial.Value,
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
        If(chkPartialPickup.Value || varSelectedItem.Status.Value = "Printing", "Partial Payment", "Status Change"),
        If(chkPartialPickup.Value || varSelectedItem.Status.Value = "Printing", "Payment", "Status"),
        If(chkPartialPickup.Value || varSelectedItem.Status.Value = "Printing", "Partial: $" & Text(varFinalCost, "[$-en-US]#,##0.00"), "Paid & Picked Up"),
        ddPaymentStaff.Selected.MemberEmail
    ),
    Notify("Could not log payment.", NotificationType.Error),
    If(
        varSelectedItem.Status.Value = "Printing",
        Notify("Payment recorded! Job continues printing.", NotificationType.Success),
        If(
            chkPartialPickup.Value,
            Notify("Partial payment recorded! Job stays in Completed for remaining items.", NotificationType.Warning),
            Notify("Payment recorded! Item marked as picked up.", NotificationType.Success)
        )
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
Reset(chkOwnMaterial);
Reset(chkPartialPickup);
Reset(ddPaymentType);

// === HIDE LOADING ===
Set(varIsLoading, false);
Set(varLoadingMessage, "")
```

> 💡 **Partial Payment Behavior:**
> 
> | Source Status | Checkbox | Status After | Use Case |
> |---------------|----------|--------------|----------|
> | Printing | Hidden (forced partial) | Stays "Printing" | Student picks up completed portions while rest continues printing |
> | Completed | Checked | Stays "Completed" | Student picks up some items, will return for rest |
> | Completed | Unchecked | "Paid & Picked Up" | Full pickup, job complete |
>
> - TransactionNumber is updated (so it displays on the job card)
> - Payment details appended to PaymentNotes (creates a log)
> - Staff can process another pickup later for partial payments
> - Final pickup (unchecked from Completed) records to FinalWeight/FinalCost/StudentOwnMaterial fields
>
> 💡 **Own Material Discount:** When `chkOwnMaterial` is checked, the cost is reduced to 30% of the base price (70% discount). This is recorded in the `StudentOwnMaterial` field and noted in the PaymentNotes audit trail.
>
> 💡 **Payment Note Format:** Payment notes use a simplified format that matches other staff notes:
> ```
> Ian R.: $10.80 partial (36g) #150 - 2/6 2:54pm
> ```
> This is cleaner than the previous verbose format and displays consistently in the Staff Notes & Activity section.

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

> ⚠️ **Note:** "Paid & Picked Up" cannot be reverted since a financial transaction has been completed.

### Control Hierarchy (Container-Based)

```
scrDashboard
└── conRevertModal               ← CONTAINER (set Visible here only!)
    ├── btnRevertConfirm         ← Confirm Revert button
    ├── btnRevertCancel          ← Cancel button
    ├── txtRevertReason          ← Reason text input (required)
    ├── lblRevertReasonLabel     ← "Reason for Revert: *"
    ├── ddRevertTarget           ← Target status dropdown
    ├── lblRevertTargetLabel     ← "Revert To: *"
    ├── lblRevertCurrentStatus   ← Shows current status
    ├── ddRevertStaff            ← Staff dropdown
    ├── lblRevertStaffLabel      ← "Performing Action As: *"
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

### Staff Dropdown Label (lblRevertStaffLabel)

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblRevertStaffLabel`
16. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
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
| Text | `"Revert To: *"` |
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
    Blank()
)
```

> 💡 **Dynamic Options:** The dropdown shows only valid revert targets based on the current status. "Printing" can only go back to "Ready to Print", while "Completed" can go back to either "Printing" or "Ready to Print".

---

### Reason Label (lblRevertReasonLabel)

30. Click **+ Insert** → **Text label**.
31. **Rename it:** `lblRevertReasonLabel`
32. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Reason for Revert: *"` |
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
| BorderColor | `Transparent` |
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
| BorderColor | `Transparent` |
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
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "REVERTED by " &
        With({n: ddRevertStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
        ": " & varSelectedItem.Status.Value & " → " & ddRevertTarget.Selected.Value & 
        " - " & txtRevertReason.Text & " - " & Text(Now(), "m/d h:mmam/pm")
    )
});

// Log to audit flow
'Flow-(C)-Action-LogAction'.Run(
    Text(varSelectedItem.ID),                    // RequestID
    "Status Change",                             // Action
    "Status",                                    // FieldName
    ddRevertTarget.Selected.Value,               // NewValue
    ddRevertStaff.Selected.MemberEmail           // ActorEmail
);

Notify(
    "Status reverted to " & ddRevertTarget.Selected.Value, 
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

> 💡 **Audit Trail:** The revert action is logged in two places:
> - **StaffNotes field:** Human-readable entry like "REVERTED by John D.: Printing → Ready to Print - Printer jammed - 2/6 2:45pm"
> - **Flow C audit log:** Machine-readable entry for reporting and compliance

---

# STEP 12E: Building the Batch Payment Modal

**What you're doing:** Creating a modal for processing multiple payments at once. When staff clicks "Process Batch Payment" from the selection footer, this modal opens showing all selected items and allowing entry of a combined weight and single transaction number.

> 🎯 **Use Case:** A student picks up multiple jobs at once (their own + friends'), or buys several items. Instead of processing each individually, staff can handle them all in one transaction.

> ⚠️ **Reminder:** Use Classic controls as described in Step 10. Classic TextInput uses `.Text`, Classic Button uses `Fill`/`Color` properties.

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
    ├── txtBatchWeight            ← Combined weight input
    ├── lblBatchWeightLabel       ← "Combined Weight (grams): *"
    ├── txtBatchTransaction       ← Transaction number input
    ├── lblBatchTransLabel        ← "Transaction Number: *"
    ├── ddBatchPaymentType        ← Payment type dropdown
    ├── lblBatchPaymentTypeLabel  ← "Payment Type: *"
    ├── ddBatchStaff              ← Staff dropdown
    ├── lblBatchStaffLabel        ← "Performing Action As: *"
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
| Y | `(Parent.Height - 650) / 2` |
| Width | `600` |
| Height | `650` |
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
"Batch Payment - " & CountRows(colBatchItems) & " Item" & If(CountRows(colBatchItems) <> 1, "s", "")
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
| Size | `12` |
| Color | `varColorTextMuted` |

18. Set **Text:**

```powerfx
"Estimated Total: " & Text(Sum(colBatchItems, EstimatedWeight)) & "g → " & Text(Sum(colBatchItems, EstimatedCost), "[$-en-US]$#,##0.00")
```

---

### Staff Label (lblBatchStaffLabel)

19. Click **+ Insert** → **Text label**.
20. **Rename it:** `lblBatchStaffLabel`
21. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Performing Action As: *"` |
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
| Text | `"Payment Type: *"` |
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
| Items | `["TigerCASH", "Check", "Code"]` |
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
If(ddBatchPaymentType.Selected.Value = "Code", "Promo Code: *", "Transaction #: *")
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

---

### Weight Label (lblBatchWeightLabel)

38. Click **+ Insert** → **Text label**.
39. **Rename it:** `lblBatchWeightLabel`
40. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Combined Weight (grams): *"` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 160` |
| Width | `200` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Weight Input (txtBatchWeight)

41. Click **+ Insert** → **Input** → **Text input** (Classic version, NOT "Text input (modern)").
42. **Rename it:** `txtBatchWeight`
43. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 185` |
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

44. Set **Default:**

```powerfx
Text(Sum(colBatchItems, EstimatedWeight))
```

> 💡 **Pre-filled:** Weight is pre-filled with the sum of estimated weights from all selected items. Staff can adjust based on actual measured weight.

---

### Cost Label (lblBatchCostLabel)

45. Click **+ Insert** → **Text label**.
46. **Rename it:** `lblBatchCostLabel`
47. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Total Cost:"` |
| X | `recBatchPaymentModal.X + 190` |
| Y | `recBatchPaymentModal.Y + 160` |
| Width | `100` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |

---

### Cost Value (lblBatchCostValue)

48. Click **+ Insert** → **Text label**.
49. **Rename it:** `lblBatchCostValue`
50. Set properties:

| Property | Value |
|----------|-------|
| X | `recBatchPaymentModal.X + 190` |
| Y | `recBatchPaymentModal.Y + 185` |
| Width | `150` |
| Height | `36` |
| Size | `16` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorSuccess` |
| VerticalAlign | `VerticalAlign.Middle` |

51. Set **Text:**

```powerfx
With(
    {
        baseCost: Max(
            Value(txtBatchWeight.Text) * varFilamentRate,
            varMinimumCost
        )
    },
    Text(
        If(chkBatchOwnMaterial.Value, baseCost * varOwnMaterialDiscount, baseCost),
        "[$-en-US]$#,##0.00"
    )
)
```

> 💡 **Auto-calculated:** Cost updates in real-time based on weight and own material discount. Uses the same rate variables as single-item payment.

---

### Own Material Checkbox (chkBatchOwnMaterial)

52. Click **+ Insert** → **Checkbox**.
53. **Rename it:** `chkBatchOwnMaterial`
54. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Student provides own material (70% discount)"` |
| X | `recBatchPaymentModal.X + 360` |
| Y | `recBatchPaymentModal.Y + 185` |
| Width | `220` |
| Height | `36` |
| Size | `11` |

---

### Items Header (lblBatchItemsHeader)

55. Click **+ Insert** → **Text label**.
56. **Rename it:** `lblBatchItemsHeader`
57. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Selected Items:"` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 235` |
| Width | `560` |
| Height | `20` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |

---

### Items Gallery (galBatchItems)

58. Click **+ Insert** → **Blank vertical gallery**.
59. **Rename it:** `galBatchItems`
60. Set properties:

| Property | Value |
|----------|-------|
| Items | `colBatchItems` |
| X | `recBatchPaymentModal.X + 20` |
| Y | `recBatchPaymentModal.Y + 260` |
| Width | `560` |
| Height | `280` |
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
ThisItem.ReqKey & " - " & ThisItem.Student.DisplayName & " (" & Text(ThisItem.EstimatedWeight) & "g, " & Text(ThisItem.EstimatedCost, "[$-en-US]$#,##0.00") & ")"
```

63. Inside `galBatchItems`, add a **Button** named `btnRemoveFromBatch`:

> ⚠️ **Use Classic Button:** Insert → Input → **Button** (NOT Modern Button). Classic buttons use `Fill`/`Color` properties. Do NOT set an `Appearance` property - that's Modern-only syntax.

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `Parent.TemplateWidth - 30` |
| Y | `(Parent.TemplateHeight - 24) / 2` |
| Width | `24` |
| Height | `24` |
| Fill | `Transparent` |
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

---

### Cancel Button (btnBatchPaymentCancel)

65. Click **+ Insert** → **Button** (Classic, NOT Modern).
66. **Rename it:** `btnBatchPaymentCancel`
67. Set properties (do NOT use `Appearance` - that's Modern-only):

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recBatchPaymentModal.X + 320` |
| Y | `recBatchPaymentModal.Y + 560` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
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
| Y | `recBatchPaymentModal.Y + 560` |
| Width | `130` |
| Height | `varBtnHeight` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorSuccess, -15%)` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Transparent` |
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

// === STEP 1: CONCURRENCY CHECK ===
// Refresh data and verify all items are still in Completed status
Refresh(PrintRequests);
If(
    CountRows(Filter(PrintRequests, ID in colBatchItems.ID && Status.Value <> "Completed")) > 0,
    // One or more items changed - abort
    Set(varIsLoading, false);
    Set(varLoadingMessage, "");
    Notify("One or more items are no longer in 'Completed' status. Please cancel and try again.", NotificationType.Error),
    
    // === STEP 2: CALCULATE VALUES AND PROCESS ===
    // Store calculated values in variables for use in ForAll
    Set(varBatchTotalEstWeight, Sum(colBatchItems, EstimatedWeight));
    Set(varBatchCombinedWeight, Value(txtBatchWeight.Text));
    Set(varBatchItemCount, CountRows(colBatchItems));
    Set(varBatchFinalCost, 
        If(
            chkBatchOwnMaterial.Value,
            Max(Value(txtBatchWeight.Text) * varFilamentRate, varMinimumCost) * varOwnMaterialDiscount,
            Max(Value(txtBatchWeight.Text) * varFilamentRate, varMinimumCost)
        )
    );
    
    // === STEP 3: PATCH EACH ITEM ===
    ForAll(
        colBatchItems As BatchItem,
        Patch(
            PrintRequests,
            LookUp(PrintRequests, ID = BatchItem.ID),
            {
                Status: LookUp(Choices(PrintRequests.Status), Value = "Paid & Picked Up"),
                FinalWeight: If(
                    varBatchTotalEstWeight > 0,
                    Round((BatchItem.EstimatedWeight / varBatchTotalEstWeight) * varBatchCombinedWeight, 2),
                    Round(varBatchCombinedWeight / varBatchItemCount, 2)
                ),
                FinalCost: If(
                    varBatchTotalEstWeight > 0,
                    Round((BatchItem.EstimatedWeight / varBatchTotalEstWeight) * varBatchFinalCost, 2),
                    Round(varBatchFinalCost / varBatchItemCount, 2)
                ),
                TransactionNumber: txtBatchTransaction.Text,
                StudentOwnMaterial: chkBatchOwnMaterial.Value,
                PaymentType: LookUp(Choices(PrintRequests.PaymentType), Value = ddBatchPaymentType.Selected.Value),
                PaymentNotes: Concatenate(
                    BatchItem.PaymentNotes,
                    If(IsBlank(BatchItem.PaymentNotes), "", " | "),
                    "[BATCH " & varBatchItemCount & "] " &
                    With({n: ddBatchStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
                    ": " &
                    Text(
                        If(
                            varBatchTotalEstWeight > 0,
                            Round((BatchItem.EstimatedWeight / varBatchTotalEstWeight) * varBatchFinalCost, 2),
                            Round(varBatchFinalCost / varBatchItemCount, 2)
                        ),
                        "[$-en-US]$#,##0.00"
                    ) &
                    " (" &
                    Text(
                        If(
                            varBatchTotalEstWeight > 0,
                            Round((BatchItem.EstimatedWeight / varBatchTotalEstWeight) * varBatchCombinedWeight, 2),
                            Round(varBatchCombinedWeight / varBatchItemCount, 2)
                        )
                    ) &
                    "g from " & varBatchCombinedWeight & "g combined" &
                    If(chkBatchOwnMaterial.Value, ", own material", "") &
                    ") #" & txtBatchTransaction.Text &
                    " " & ddBatchPaymentType.Selected.Value &
                    " - " & Text(Now(), "m/d h:mmam/pm")
                ),
                LastActionBy: {
                    Claims: "i:0#.f|membership|" & ddBatchStaff.Selected.MemberEmail,
                    Discipline: "",
                    DisplayName: ddBatchStaff.Selected.MemberName,
                    Email: ddBatchStaff.Selected.MemberEmail,
                    JobTitle: "",
                    Picture: ""
                },
                LastActionAt: Now(),
                LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change")
            }
        )
    );
    
    // === STEP 4: LOG ACTIONS VIA FLOW ===
    ForAll(
        colBatchItems,
        IfError(
            'Flow-(C)-Action-LogAction'.Run(
                Text(ID),
                "Status Change",
                "Status",
                "Paid & Picked Up (Batch)",
                ddBatchStaff.Selected.MemberEmail
            ),
            Blank()
        )
    );
    
    // === STEP 5: CLEANUP AND NOTIFY ===
    // Store count before clearing for notification
    Set(varBatchProcessedCount, varBatchItemCount);
    
    Clear(colBatchItems);
    Set(varBatchSelectMode, false);
    Set(varShowBatchPaymentModal, 0);
    
    // Reset form fields
    Reset(txtBatchTransaction);
    Reset(txtBatchWeight);
    Reset(ddBatchStaff);
    Reset(chkBatchOwnMaterial);
    Reset(ddBatchPaymentType);
    
    // Success notification
    Notify(varBatchProcessedCount & " item" & If(varBatchProcessedCount <> 1, "s", "") & " processed successfully!", NotificationType.Success);
    
    // === HIDE LOADING ===
    Set(varIsLoading, false);
    Set(varLoadingMessage, "")
)
```

> ⚠️ **Why ForAll + Patch instead of Patch(Table, ForAll)?** The `Patch(DataSource, Table)` bulk pattern has compatibility issues with SharePoint connectors. Using `ForAll` with individual `Patch` calls inside is more reliable and universally supported.

> ⚠️ **Division-by-Zero Protection:** If total estimated weight is 0 (e.g., all items have no estimates), the weight and cost are distributed evenly across all items instead of using proportional calculation.

> 💡 **PaymentNotes Format:** Each item's notes include `[BATCH N]` indicator, staff initials, proportional cost, weight breakdown, transaction number, payment type, and timestamp. Example: `[BATCH 3] John D.: $12.50 (45g from 180g combined, own material) #12345 TigerCASH - 3/2 10:30am`

---

### Troubleshooting: Batch Payment Modal Errors

If you see formula errors after building this modal, here are the most common causes and fixes:

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
| Fill | `varColorOverlay` |

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
| Fill | `varColorBgCard` |
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
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `varColorText` |

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
| Fill | `color.white` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `varcolorborderlight` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

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
| Font | `varAppFont` |
| Color | `If(IsBlank(varSelectedItem.Notes), varColorTextLight, varColorText)` |
| FontItalic | `IsBlank(varSelectedItem.Notes)` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| HoverBorderColor | `varInputBorderColor` |
| DisabledBorderColor | `varInputBorderColor` |

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
| Default | See formula below |
| X | `recNotesModal.X + 20` |
| Y | `recNotesModal.Y + 172` |
| Width | `510` |
| Height | `120` |
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

30. Set **Default** (the display parsing formula):

```powerfx
If(
    IsBlank(varSelectedItem.StaffNotes),
    "None",
    Concat(
        ForAll(
            Split(varSelectedItem.StaffNotes, " | ") As entry,
            With(
                {
                    // Strip [NOTE] prefix if present for manual notes
                    text: If(StartsWith(entry.Value, "[NOTE] "), Mid(entry.Value, 8, Len(entry.Value) - 7), entry.Value),
                    isManualNote: StartsWith(entry.Value, "[NOTE] ")
                },
                With(
                    {
                        dashParts: Split(text, " - ")
                    },
                    With(
                        {
                            datetime: Last(dashParts).Value,
                            beforeDatetime: Left(text, Max(0, Len(text) - Len(Last(dashParts).Value) - 3)),
                            byPos: Find(" by ", text),
                            colonPos: Find(":", text)
                        },
                        With(
                            {
                                // Force "NOTE" action if [NOTE] prefix was present, otherwise detect from " by " pattern
                                action: If(isManualNote, "NOTE", If(byPos > 0 && byPos < colonPos, Upper(Left(text, byPos - 1)), "NOTE")),
                                rawName: If(
                                    !isManualNote && byPos > 0 && colonPos > byPos + 4,
                                    Trim(Mid(text, byPos + 4, Max(0, colonPos - byPos - 4))),
                                    If(colonPos > 1, Trim(Left(text, colonPos - 1)), "")
                                ),
                                details: If(colonPos > 0 && Len(beforeDatetime) > colonPos + 1, Trim(Mid(beforeDatetime, colonPos + 2, Max(0, Len(beforeDatetime) - colonPos - 1))), "")
                            },
                        With(
                            {
                                // Convert any name to "First L." format
                                shortName: If(
                                    Find(" ", rawName) > 0,
                                    Left(rawName, Find(" ", rawName) - 1) & " " & Left(Last(Split(rawName, " ")).Value, 1) & ".",
                                    rawName
                                )
                            },
                            datetime & " - " & action & Char(10) &
                            shortName & Char(10) &
                            If(
                                Len(details) > 0,
                                If(
                                    action = "NOTE",
                                    // Manual note - quote the whole thing
                                    """" & details & """",
                                    // Action entry - format reasons as bullets, quote comment after " - "
                                    With(
                                        {
                                            hasComment: Find(" - ", details) > 0,
                                            reasonsPart: If(Find(" - ", details) > 0, Left(details, Max(0, Find(" - ", details) - 1)), details),
                                            commentPart: If(Find(" - ", details) > 0, Mid(details, Find(" - ", details) + 3, Max(0, Len(details) - Find(" - ", details) - 2)), "")
                                        },
                                        // Format reasons with header and spacing
                                        Char(10) & "Reasons:" & Char(10) &
                                        If(
                                            Find("; ", reasonsPart) > 0,
                                            Concat(ForAll(Split(reasonsPart, "; ") As reason, {line: "  - " & reason.Value}), line, Char(10)),
                                            "  - " & reasonsPart
                                        ) &
                                        // Add quoted comment if present (with blank line before)
                                        If(hasComment, Char(10) & Char(10) & """" & commentPart & """", "")
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
        ),
        Value,
        Char(10)
    )
)
```

> 💡 **Note:** This formula parses each entry and restructures it for cleaner display:
> - Manual notes prefixed with `[NOTE]` have the prefix stripped before display
> - Line 1: Date/time and action type (e.g., "1/30 2:45pm - APPROVED" or "3/4 9:15am - NOTE")
> - Line 2: Staff name (e.g., "Lauren V.")
> - Line 3+: Details/comments (for rejections, shows each reason as a bulleted item, then quoted staff comment; for manual notes, shows the note in quotes)
>
> **Example rejection display:**
> ```
> 2/28 2:14pm - REJECTED
> Sarah B.
>
> Reasons:
>   - The geometry is problematic
>   - The model is messy
>
> "It looks awful..."
> ```
>
> The formula uses `Last(Split(text, " - "))` to reliably extract the timestamp from the end of each entry.
>
> ⚠️ **Safety guards:** The formula uses `Max(0, ...)` around all `Mid` and `Left` length calculations to prevent "argument must be greater than or equal to 0" errors when parsing malformed or unexpected note formats. This ensures the app doesn't crash if a note entry doesn't match the expected pattern.
>
> ⚠️ **Critical — use `Last(Split())` for timestamp extraction.** Do NOT try to manually calculate the position of the last ` - ` using `Mid`/`Find`/`Len` arithmetic (e.g., `Len(text) - Find(" - ", Mid(text, Len(text) - 20, 20)) - 18`). This approach is error-prone because the offset math must account for the `Mid` start position, the 1-based indexing of `Find`, and the 3-character length of ` - `. Getting any of these wrong causes `datetime` to absorb part of the note content and `details` to be truncated — producing garbled output where the tail of the details text appears on the datetime line. The `Last(Split(text, " - "))` approach avoids all of this by letting Power Apps find the last segment automatically.

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

42. Click **+ Insert** → **Button**.
43. **Rename it:** `btnNotesCancel`
44. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recNotesModal.X + 300` |
| Y | `recNotesModal.Y + 480` |
| Width | `100` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

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
| Height | `varBtnHeight` |
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

49. Set **DisplayMode:**

```powerfx
If(IsBlank(txtAddNote.Text) || IsBlank(ddNotesStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)
```

50. Set **OnSelect:**

```powerfx
// Append the new note to StaffNotes with [NOTE] prefix for manual notes
// Using LookUp to get fresh record avoids concurrency conflicts
Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID),
{
    StaffNotes: Concatenate(
        If(IsBlank(varSelectedItem.StaffNotes), "", varSelectedItem.StaffNotes & " | "),
        "[NOTE] " &
        With({n: ddNotesStaff.Selected.MemberName}, Left(n, Find(" ", n) - 1) & " " & Left(Last(Split(n, " ")).Value, 1) & ".") &
        ": " & txtAddNote.Text & " - " & Text(Now(), "m/d h:mmam/pm")
    )
});

// Refresh the selected item to show updated notes
Set(varSelectedItem, LookUp(PrintRequests, ID = varSelectedItem.ID));

// Clear the input
Reset(txtAddNote);

// Show success notification
Notify("Note added successfully!", NotificationType.Success)
```

> 💡 **Note Format:** Manual notes are prefixed with `[NOTE]` to distinguish them from automated audit entries (APPROVED, REJECTED, etc.). The job card counter only counts manual `[NOTE]` entries, while the modal displays all entries. All notes are separated by ` | ` in storage and parsed for clean display.
>
> ⚠️ **Reserved Separator:** The ` | ` character sequence is used as the delimiter between note entries. Free-text inputs (approval comments in `txtApprovalComments`, rejection comments in `txtRejectComments`, and manual notes in `txtAddNote`) must **not** contain ` | ` or the note will be split into garbled fragments on display. If users may type pipe characters, sanitize the input by replacing `" | "` with `"; "` before saving.

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

# STEP 13B: Building the Student Note Modal

**What you're doing:** Creating a simple modal that displays the student's submission note when they click the "📝 Note" button on a job card. This ensures staff don't miss important instructions from students.

> 💡 **Why a separate modal?** The Notes Modal (Step 13) shows both staff notes and student notes together. This dedicated Student Note modal is a quick, focused view triggered by the attention-grabbing gold button, ensuring student instructions are noticed.

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
| Fill | `RGBA(0, 0, 0, 0.7)` |

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
| BorderColor | `Transparent` |
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

### Close Button (btnStudentNoteClose)

22. Inside `conStudentNoteModal`, click **+ Insert** → **Button**.
23. **Rename it:** `btnStudentNoteClose`
24. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recStudentNoteModal.X + recStudentNoteModal.Width - 40` |
| Y | `recStudentNoteModal.Y + 10recStudentNoteModal.Y + 10` |
| Width | `30` |
| Height | `30` |
| Fill | `Transparent` |
| Color | `RGBA(100, 100, 100, 1)` |
| HoverFill | `RGBA(230, 230, 230, 1)` |
| PressedFill | `RGBA(200, 200, 200, 1)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `15` |
| RadiusTopRight | `15` |
| RadiusBottomLeft | `15` |
| RadiusBottomRight | `15` |
| Size | `14` |
| Font | `varAppFont` |

25. Set **OnSelect:**

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
| HintText | `"🔍 Search by name, email, or ReqKey..."` |
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
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |

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

5. Set **OnSelect:**

```powerfx
Patch(PrintRequests, ThisItem, {NeedsAttention: !ThisItem.NeedsAttention});
// When marking as needing attention, play notification sound
If(!ThisItem.NeedsAttention, Reset(audNotification); Set(varPlaySound, true))
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
| BorderColor | `Transparent` |
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
| BorderColor | `Transparent` |
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
Set(varShowBatchPaymentModal, 1)
```

> 💡 **Opens Batch Modal:** This button opens the Batch Payment Modal (Step 12E) where staff enters the combined weight and transaction number for all selected items.

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
| BorderColor | `Transparent` |
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

> 💡 **Note:** This counts only **manual staff notes** (tagged with `[NOTE]`), not automated audit entries like approvals or rejections. The formula splits on `[NOTE]` and subtracts 1 (since splitting "A[NOTE]B" returns 2 parts). Automated entries are still visible in the Notes modal but don't increment this counter.

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
| Fill | `RGBA(255, 46, 46, 1)` |
| Color | `RGBA(255, 255, 255, 1)` |
| HoverColor | `Color.White` |
| HoverFill | `RGBA(220, 40, 40, 1)` |
| PressedFill | `RGBA(200, 35, 35, 1)` |
| BorderColor | `RGBA(184, 0, 0, 1)` |
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
- **Notes (X)** header with staff notes count
- **View Messages** button to open the full conversation modal
- **Red unread badge** with count of unread student replies

The full messaging functionality (view history AND compose) is in the unified Messages Modal (Step 17D).

---

## Step 17C: Adding the Message Button to Job Cards

Add a "Send Message" button to each job card in the gallery.

---

### Gallery Message Button (btnCardSendMessage)

1. Inside `galJobCards`, click **+ Insert** → **Button**.
2. **Rename it:** `btnCardSendMessage`
3. Set properties:

| Property | Value |
|----------|-------|
| Text | `"Message"` |
| X | `12 + (Parent.TemplateWidth - 40) / 3 + 8` |
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

> Note: btnFiles, btnCardSendMessage, and btnArchive are positioned in a row with even 8px spacing.

4. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowViewMessagesModal, ThisItem.ID)
```

> **Note:** This button opens the same unified Messages Modal as the "View Messages" button. Staff can view conversation history and send new messages from one place.

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
    ├── lblViewMsgBodyLabel         ← "Message: *"
    ├── txtViewMsgSubject           ← Subject input
    ├── lblViewMsgSubjectLabel      ← "Subject: *"
    ├── ddViewMsgStaff              ← Staff dropdown
    ├── lblViewMsgStaffLabel        ← "Performing Action As: *"
    ├── recViewMsgSeparator         ← Line separating history from compose
    ├── galViewMessages             ← Scrollable message gallery
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

17. Click **+ Insert** → **Button**.
18. **Rename it:** `btnViewMsgClose`
19. Set properties:

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recViewMsgModal.X + recViewMsgModal.Width - 45` |
| Y | `recViewMsgModal.Y + 10` |
| Width | `35` |
| Height | `35` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `16` |
| Font | `varAppFont` |

20. Set **OnSelect:**

```powerfx
Set(varShowViewMessagesModal, 0);
Set(varSelectedItem, Blank());
Reset(txtViewMsgSubject);
Reset(txtViewMsgBody);
Reset(ddViewMsgStaff)
```

---

### Messages Gallery (galViewMessages)

21. Click **+ Insert** → **Blank vertical gallery**.
22. **Rename it:** `galViewMessages`
23. Set properties:

| Property | Value |
|----------|-------|
| Items | `Sort(Filter(RequestComments, RequestID = varSelectedItem.ID), SentAt, SortOrder.Descending)` |
| X | `recViewMsgModal.X + 20` |
| Y | `recViewMsgModal.Y + 65` |
| Width | `560` |
| Height | `250` |
| TemplateSize | `lblVMsgContent.Y + lblVMsgContent.Height + 16` |
| TemplatePadding | `8` |
| ShowScrollbar | `true` |

> **Flexible Height:** The `TemplateSize` formula calculates each row's height based on the auto-height label plus padding, allowing messages to expand naturally.

---

#### Inside galViewMessages — Message Background

24. Inside `galViewMessages`, add a **Rectangle**:
   - **Name:** `recVMsgBg`
   - **X:** `If(ThisItem.Direction.Value = "Outbound", Parent.TemplateWidth * (1 - varMessageBubbleWidth), 0)`
   - **Y:** `0`
   - **Width:** `Parent.TemplateWidth * varMessageBubbleWidth`
   - **Height:** `lblVMsgContent.Y + lblVMsgContent.Height + 6`
   - **Fill:** `If(ThisItem.Direction.Value = "Outbound", RGBA(70, 130, 220, 0.1), RGBA(255, 248, 230, 1))`
   - **RadiusTopLeft:** `6`
   - **RadiusTopRight:** `6`
   - **RadiusBottomLeft:** `6`
   - **RadiusBottomRight:** `6`

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
| Width | `300` |
| Height | `18` |
| Size | `10` |
| Color | `If(ThisItem.Direction.Value = "Outbound", varColorPrimary, RGBA(180, 130, 40, 1))` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |

> **Important:** Use `Author0` (the custom Person column), not `Author` (the built-in "Created By" field). Using `Author` would always show the logged-in user who created the record, not the staff member selected in the dropdown.

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
| Y | `26` |
| Width | `recVMsgBg.Width - 20` |
| AutoHeight | `true` |
| Size | `11` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Top` |

> **Note:** Using `AutoHeight` allows each message to expand to fit its content. The gallery scrolls to show all messages rather than each message having its own scrollbar.

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
| Text | `"Performing Action As: *"` |
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
| Text | `"Subject: *"` |
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
| Text | `"Message: *"` |
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
| BorderColor | `Transparent` |
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
| BorderColor | `Transparent` |
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
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| Visible | `!IsEmpty(Filter(RequestComments, RequestID = varSelectedItem.ID, Direction.Value = "Inbound", ReadByStaff = false))` |

75. Set **OnSelect:**

```powerfx
UpdateIf(
    RequestComments,
    RequestID = varSelectedItem.ID &&
    Direction.Value = "Inbound" &&
    ReadByStaff = false,
    {ReadByStaff: true}
);

// Clear NeedsAttention flag on the print request
// Using LookUp to get fresh record avoids concurrency conflicts
Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {NeedsAttention: false});

Notify("Messages marked as read", NotificationType.Success)
```

> **Note:** This button only appears when there are unread inbound messages. After clicking, it disappears, the NeedsAttention flag is cleared, and the unread badge on the job card also updates.

---

### Testing the Unified Messages Modal

**Message History:**
- [ ] "View Messages" button appears on job cards
- [ ] Clicking opens modal with correct title (Messages - REQ-XXXXX) and subtitle (Student name + email)
- [ ] Messages display with correct direction styling (blue=outbound, yellow=inbound)
- [ ] Full message content visible (no truncation)
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
// Refresh data from SharePoint
Refresh(PrintRequests);

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
| 2 | `Refresh(PrintRequests)` fetches latest data from SharePoint |
| 3 | Count current NeedsAttention items |
| 4 | Compare to previous count stored in `varPrevAttentionCount` |
| 5 | If count increased, `Reset(audNotification); Set(varPlaySound, true)` triggers audio |
| 6 | Update `varPrevAttentionCount` for next cycle |

> 💡 **Why 10 seconds?** This provides responsive notifications while staying well within SharePoint API limits. You can adjust `varRefreshInterval` in App.OnStart (in milliseconds) — 15000 for 15 seconds, 30000 for 30 seconds, 60000 for 1 minute.

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

Add the new controls to your Tree view. The Timer and Audio controls are invisible and can be placed near the filter bar controls.

```
▼ scrDashboard
    ▼ conLoadingOverlay               ← TOP (highest z-order)
        ...
    ▼ conViewMessagesModal            ← Unified Messages Modal
        ...
    ...other modal containers...
    audNotification                   ← NEW: Audio control (invisible)
    tmrAutoRefresh                    ← NEW: Timer control (invisible)
    recFilterBar
    txtSearch
    chkNeedsAttention
    lblNeedsAttention
    btnRefresh
    btnClearFilters
    galJobCards
    ...
```

> 💡 **Z-Order:** The Timer and Audio controls don't need specific z-ordering since they're invisible.

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

# Quick Reference Card

## Key Variables

| Variable | Set By | Purpose |
|----------|--------|---------|
| `varMeEmail` | App.OnStart | Current user email |
| `varIsStaff` | App.OnStart | Staff member check |
| `colStaff` | App.OnStart | Active staff collection |
| `varFilamentRate` | App.OnStart | Filament price per gram ($0.10) |
| `varResinRate` | App.OnStart | Resin price per gram ($0.30) |
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
| `varResinRate` | `0.30` | $ per gram for resin |
| `varMinimumCost` | `3.00` | Minimum charge |

**For Estimates (Approval Modal):**
```powerfx
// EstimatedCost from EstimatedWeight
Max(varMinimumCost, EstimatedWeight * If(Method = "Resin", varResinRate, varFilamentRate))
```

**For Finals (Payment Modal):**
```powerfx
// FinalCost from FinalWeight (actual measured weight)
// With own material discount: multiply by varOwnMaterialDiscount when chkOwnMaterial.Value is true
Set(varBaseCost, Max(varMinimumCost, FinalWeight * If(Method = "Resin", varResinRate, varFilamentRate)));
Set(varFinalCost, If(chkOwnMaterial.Value, varBaseCost * varOwnMaterialDiscount, varBaseCost))
```

> 💡 **Estimate vs Actual:** EstimatedWeight/EstimatedCost are set at approval (slicer prediction). FinalWeight/FinalCost are recorded at payment pickup (physical measurement).
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
