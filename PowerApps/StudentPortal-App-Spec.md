# Student Portal — Canvas App (Tablet)

**⏱️ Time Required:** 4-6 hours (can be done in multiple sessions)  
**🎯 Goal:** Students can submit 3D print requests with file attachments and track their submissions through a clean, professional interface

> 📚 **This is the comprehensive guide** — includes step-by-step build instructions, code references, and quick-copy snippets.
>
> **Key Features:**
> - **EditForm with native attachment support** — files upload directly to SharePoint
> - **Tablet layout (1024×768)** — optimized for computer submission, works on mobile
> - **Modular container structure** — clean organization, reusable patterns
> - **Staff Dashboard styling** — consistent look across student and staff apps

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Design Standards](#design-standards) ← **Font & Color Reference**
3. [Creating the Canvas App](#step-1-creating-the-canvas-app)
4. [Adding Data Connections](#step-2-adding-data-connections)
5. [Setting Up App.OnStart](#step-3-setting-up-apponstart)
6. [Understanding Where Things Go](#understanding-where-things-go-read-this) ← **READ THIS FIRST!**
7. [Building Screen 1: Home (Landing)](#step-4-building-screen-1-home-landing) ← **NEW! Welcome screen**
8. [Building Screen 2: Submit Request](#step-5-building-screen-2-submit-request)
9. [Building the Submit Form (EditForm)](#step-6-building-the-submit-form-editform) ← **Uses EditForm for attachments**
10. [Configuring Form Fields](#step-7-configuring-form-fields)
11. [Building Screen 3: My Requests](#step-8-building-screen-3-my-requests)
12. [Building the Request Cards Gallery](#step-9-building-the-request-cards-gallery)
13. [Adding the Estimate Confirmation Modal](#step-10-adding-the-estimate-confirmation-modal)
14. [Adding the Cancel Request Modal](#step-11-adding-the-cancel-request-modal)
15. [Adding Navigation](#step-12-adding-navigation)
16. [Publishing the App](#step-13-publishing-the-app)
17. [Testing the App](#step-14-testing-the-app)
18. [Embedding in SharePoint](#step-15-embedding-in-sharepoint)
19. [Troubleshooting](#troubleshooting)
20. [Quick Reference Card](#quick-reference-card)
21. [Code Reference (Copy-Paste Snippets)](#code-reference-copy-paste-snippets)
22. [Reference: File Naming Convention](#reference-file-naming-convention) ← **Attachment naming rules**

---

# Prerequisites

Before you start, make sure you have:

- [ ] **SharePoint lists created**: `PrintRequests`, `AuditLog`
- [ ] **Power Automate flows working**: Flow A (PR-Create), Flow B (PR-Audit)
- [ ] **Power Apps license**: Standard license included with Microsoft 365

> ⚠️ **IMPORTANT:** Complete Phases 1 and 2 (SharePoint + Flows) before building the Student Portal. The app depends on these being set up correctly.

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
| `"Submit"` | `"Submit"` |
| `'text'` | `'text'` |

> 💡 **Tip:** If a formula shows red errors after pasting, the quotes are usually the culprit!

---

## Design Standards

This app follows consistent design patterns matching the Staff Dashboard for a professional, cohesive appearance.

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App Title | `Font.'Open Sans'` | 18 | Semibold |
| Screen Headers | `Font.'Open Sans'` | 18 | Semibold |
| Section Headers | `Font.'Open Sans'` | 12 | Semibold |
| Body Text | `Font.'Open Sans'` | 11 | Normal |
| Labels/Hints | `Font.'Open Sans'` | 10 | Normal |
| Buttons | `Font.'Open Sans'` | 12-14 | Semibold |

> ⚠️ **Consistency Rule:** Always use `Font.'Open Sans'` throughout the app. Use `varAppFont` variable instead of hardcoding.

### Color Palette (Matching Staff Dashboard)

| Purpose | Color | RGBA | Variable |
|---------|-------|------|----------|
| Primary (Active) | Blue | `RGBA(56, 96, 178, 1)` | `varColorPrimary` |
| Success | Green | `RGBA(16, 124, 16, 1)` | `varColorSuccess` |
| Warning | Amber | `RGBA(255, 185, 0, 1)` | `varColorWarning` |
| Error/Danger | Red | `RGBA(209, 52, 56, 1)` | `varColorDanger` |
| Info | Light Blue | `RGBA(70, 130, 220, 1)` | `varColorInfo` |
| Header Background | Dark Gray | `RGBA(45, 45, 48, 1)` | `varColorHeader` |
| Modal Overlay | Black 70% | `RGBA(0, 0, 0, 0.7)` | `varColorOverlay` |
| Card Background | White | `Color.White` | `varColorBgCard` |
| Muted Text | Gray | `RGBA(100, 100, 100, 1)` | `varColorTextMuted` |
| Screen Background | Light Gray | `RGBA(248, 248, 248, 1)` | `varColorBg` |
| Border | Gray | `RGBA(200, 200, 200, 1)` | `varColorBorder` |

### Status Colors (Matching Staff Dashboard)

| Status | Color | RGBA |
|--------|-------|------|
| Uploaded | Blue | `RGBA(70, 130, 220, 1)` |
| Pending | Amber | `RGBA(255, 185, 0, 1)` |
| Ready to Print | Green | `RGBA(16, 124, 16, 1)` |
| Printing | Purple | `RGBA(107, 105, 214, 1)` |
| Completed | Dark Blue | `RGBA(0, 78, 140, 1)` |
| Paid & Picked Up | Teal | `RGBA(0, 158, 73, 1)` |
| Rejected | Red | `RGBA(209, 52, 56, 1)` |
| Canceled | Gray | `RGBA(138, 136, 134, 1)` |
| Archived | Gray | `RGBA(96, 94, 92, 1)` |

### Button Styles

| Type | Fill | Color | Border |
|------|------|-------|--------|
| Primary Action | `varColorPrimary` | White | None |
| Success Action | `varColorSuccess` | White | None |
| Danger Action | `varColorDanger` | White | None |
| Secondary/Outline | White | `varColorPrimary` | `varColorPrimary`, 1px |
| Navigation (Active) | `varColorInfo` | White | None |
| Navigation (Inactive) | `RGBA(60, 60, 65, 1)` | White | None |

### Corner Radius Standards

| Element Type | Radius | Variable | Examples |
|--------------|--------|----------|----------|
| Cards & Modals | `8` | `varRadiusMedium` | Request cards, confirmation modals |
| Primary Buttons | `6` | `varRadiusSmall` | Submit, Confirm buttons |
| Input Fields | `4` | `varRadiusXSmall` | Text inputs, dropdowns |
| Status Badges | `12` | `varRadiusPill` | Rounded pill badges |

### Layout Dimensions (Tablet Format)

| Element | Width | Height | Notes |
|---------|-------|--------|-------|
| Screen | `1024` | `768` | Tablet landscape layout |
| Header Bar | `Parent.Width` | `60` | Fixed at top |
| Navigation Bar | `Parent.Width` | `60` | Fixed at bottom |
| Content Area | `Parent.Width` | `Parent.Height - 120` | Between header and nav |
| Form Container | `Parent.Width` | `Parent.Height - 120` | Scrollable form area |
| Form Fields | `Parent.Width - 40` | `45` | With 20px side margins |
| Cards | `Parent.Width - 32` | Variable | With 16px side margins |

> 💡 **Responsive Tip:** Use `Parent.Width` and `Parent.Height` for all sizing. This ensures the app adapts to different screen sizes.

---

# STEP 1: Creating the Canvas App

**What you're doing:** Creating a new Canvas app with a Tablet layout, optimized for students submitting from computers while still working on mobile devices.

### Instructions

1. Open **Power Apps** in your browser: [make.powerapps.com](https://make.powerapps.com)
2. Make sure you're in the correct **Environment** (top right dropdown — should show "Louisiana State Universi...").
3. In the left navigation, click **+ Create**.
4. Under "Create your apps", click **Start with a blank canvas**.
5. In the popup "Start with a blank canvas", click **Tablet size** (right option).
6. Enter these settings:
   - **App name:** `Student Portal`
7. Click **Create**.

> 💡 **Why Tablet?** Students typically submit print requests from computers where their 3D model files are stored. Tablet layout (1024×768) provides comfortable form entry on desktop while still working on mobile devices.

> 📝 **Naming alternatives:** You can also use `3D Print Request Portal`, `FabLab Student Portal`, or any name that fits your lab.

### What You Should See

- The Power Apps Studio editor opens
- A blank white screen appears in the center (wider than tall)
- The left panel shows **Tree view** with `Screen1`
- The top shows the formula bar

---

# STEP 2: Adding Data Connections

**What you're doing:** Connecting your app to the SharePoint lists it needs.

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
9. Check the box for this list:
   - [x] **PrintRequests**
10. Click **Connect**.

### Verification

**In the Data panel**, you should see:
- ✅ PrintRequests

> 💡 **Note:** Students don't need access to AuditLog or Staff lists—those are staff-only.

---

# STEP 3: Setting Up App.OnStart

**What you're doing:** Initializing variables that the entire app will use—like knowing who's logged in and setting up UI state.

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

// === UI STATE VARIABLES ===
// Current screen/page
Set(varCurrentScreen, "Home");

// === MODAL CONTROLS ===
// These control which modal is visible (0 = hidden, ID = visible for that item)
Set(varShowConfirmModal, 0);
Set(varShowCancelModal, 0);

// Currently selected item for modals (typed blank so Power Apps knows the schema)
Set(varSelectedItem, LookUp(PrintRequests, false));

// === FORM STATE ===
// Track if form has been submitted successfully
Set(varFormSubmitted, false);
// Track if user attempted to submit (for showing validation errors)
Set(varSubmitAttempted, false);

// === LOADING STATE ===
Set(varIsLoading, false);

// === PRICING CONFIGURATION ===
// For display purposes (estimates shown to students)
Set(varFilamentRate, 0.10);
Set(varResinRate, 0.20);
Set(varMinimumCost, 3.00);

// ============================================
// === STYLING / THEMING (Centralized) ===
// ============================================
// Matches Staff Dashboard styling - change these once to update the entire app!

// --- FONT ---
Set(varAppFont, Font.'Open Sans');

// --- COLORS: Primary Palette (Staff Dashboard) ---
Set(varColorPrimary, RGBA(56, 96, 178, 1));        // Primary Blue - buttons, active elements
Set(varColorPrimaryHover, RGBA(76, 116, 198, 1)); // Blue hover state
Set(varColorPrimaryPressed, RGBA(36, 76, 158, 1)); // Blue pressed state

// --- COLORS: Semantic ---
Set(varColorSuccess, RGBA(16, 124, 16, 1));        // Green - confirm, success
Set(varColorSuccessHover, RGBA(36, 144, 36, 1));   // Green hover
Set(varColorDanger, RGBA(209, 52, 56, 1));         // Red - cancel, errors
Set(varColorDangerHover, RGBA(229, 72, 76, 1));    // Red hover
Set(varColorWarning, RGBA(255, 185, 0, 1));        // Amber - warnings, pending
Set(varColorInfo, RGBA(70, 130, 220, 1));          // Blue - info, uploaded

// --- COLORS: Neutrals (Staff Dashboard) ---
Set(varColorHeader, RGBA(45, 45, 48, 1));          // Dark Gray - header background
Set(varColorText, RGBA(50, 50, 50, 1));            // Primary text
Set(varColorTextMuted, RGBA(100, 100, 100, 1));    // Secondary/muted text
Set(varColorTextLight, RGBA(150, 150, 150, 1));    // Hint text
Set(varColorBg, RGBA(248, 248, 248, 1));           // Screen background
Set(varColorBgCard, Color.White);                   // Card/modal background
Set(varColorBorder, RGBA(200, 200, 200, 1));       // Input borders
Set(varColorBorderLight, RGBA(220, 220, 220, 1)); // Card borders
Set(varColorOverlay, RGBA(0, 0, 0, 0.7));          // Modal overlay
Set(varColorDisabled, RGBA(180, 180, 180, 1));    // Disabled state

// --- BORDER RADIUS ---
Set(varRadiusLarge, 12);    // Modals
Set(varRadiusMedium, 8);    // Cards, large buttons
Set(varRadiusSmall, 6);     // Standard buttons
Set(varRadiusXSmall, 4);    // Inputs, small buttons
Set(varRadiusPill, 14);     // Status badges (pill shape)

// --- SIZING (Tablet Layout) ---
Set(varHeaderHeight, 60);   // Top header bar
Set(varNavHeight, 60);      // Bottom navigation bar
Set(varInputHeight, 45);    // Standard input field height
Set(varButtonHeight, 50);   // Primary button height
Set(varButtonHeightSmall, 40); // Secondary button height

// --- SPACING ---
Set(varSpacingXL, 20);      // Large padding (screen edges)
Set(varSpacingLG, 16);      // Card padding
Set(varSpacingMD, 12);      // Form field gaps
Set(varSpacingSM, 8);       // Small gaps
Set(varSpacingXS, 4);       // Tiny gaps

// === STATUS COLORS ===
// Consistent with Staff Dashboard
Set(varStatusColors, Table(
    {Status: "Uploaded", Color: varColorInfo},
    {Status: "Pending", Color: varColorWarning},
    {Status: "Ready to Print", Color: varColorSuccess},
    {Status: "Printing", Color: RGBA(107, 105, 214, 1)},
    {Status: "Completed", Color: RGBA(0, 78, 140, 1)},
    {Status: "Paid & Picked Up", Color: RGBA(0, 158, 73, 1)},
    {Status: "Rejected", Color: varColorDanger},
    {Status: "Canceled", Color: RGBA(138, 136, 134, 1)},
    {Status: "Archived", Color: RGBA(96, 94, 92, 1)}
))
```

5. Press **Enter** or click away to confirm.

### Running OnStart to Test

6. At the top of the screen, click the **three dots (...)** next to "App".
7. Click **Run OnStart**.
8. Wait for it to complete (you'll see a brief loading indicator).

> 💡 **Tip:** You can also press **F5** to preview the app, which automatically runs OnStart.

### Understanding the Styling Variables

Use these variables in your control properties instead of hardcoding values. This lets you change the entire app's look by editing OnStart!

#### How to Use

| Instead of... | Use... |
|---------------|--------|
| `RGBA(70, 29, 124, 1)` | `varColorPrimary` |
| `Font.'Open Sans'` | `varAppFont` |
| `RadiusTopLeft: 8` | `RadiusTopLeft: varRadiusMedium` |
| `Height: 45` | `Height: varInputHeight` |

#### Example: Text Input with Variables

```powerfx
// Before (hardcoded)
Font: Font.'Open Sans'
Height: 45
BorderColor: RGBA(200, 200, 200, 1)
FocusedBorderColor: RGBA(70, 29, 124, 1)
RadiusTopLeft: 4

// After (using variables)
Font: varAppFont
Height: varInputHeight
BorderColor: varColorBorder
FocusedBorderColor: varColorPrimary
RadiusTopLeft: varRadiusXSmall
RadiusTopRight: varRadiusXSmall
RadiusBottomLeft: varRadiusXSmall
RadiusBottomRight: varRadiusXSmall
```

### Variable Reference Table

#### Colors

| Variable | Value | Use For |
|----------|-------|---------|
| `varColorPrimary` | LSU Purple | Headers, primary buttons |
| `varColorPrimaryHover` | Lighter purple | Button hover states |
| `varColorPrimaryPressed` | Darker purple | Button pressed states |
| `varColorSecondary` | LSU Gold | Accents, highlights |
| `varColorSuccess` | Green | Confirm buttons, success states |
| `varColorDanger` | Red | Cancel buttons, errors |
| `varColorWarning` | Amber | Warnings, pending states |
| `varColorInfo` | Blue | Info messages |
| `varColorText` | Dark gray | Primary text |
| `varColorTextMuted` | Medium gray | Secondary text |
| `varColorTextLight` | Light gray | Hints, placeholders |
| `varColorBg` | Off-white | Screen backgrounds |
| `varColorBgCard` | White | Cards, modals |
| `varColorBorder` | Gray | Input borders |
| `varColorBorderLight` | Light gray | Card borders |
| `varColorDisabled` | Gray | Disabled controls |

#### Border Radius

| Variable | Value | Use For |
|----------|-------|---------|
| `varRadiusLarge` | 12 | Modals |
| `varRadiusMedium` | 8 | Cards, nav buttons |
| `varRadiusSmall` | 6 | Primary action buttons |
| `varRadiusXSmall` | 4 | Inputs, small buttons |
| `varRadiusPill` | 14 | Status badges |

#### Sizing

| Variable | Value | Use For |
|----------|-------|---------|
| `varHeaderHeight` | 80 | Top header bar |
| `varNavHeight` | 70 | Bottom navigation |
| `varInputHeight` | 45 | Text inputs, dropdowns |
| `varButtonHeight` | 50 | Primary buttons |
| `varButtonHeightSmall` | 40 | Secondary buttons |

#### Spacing

| Variable | Value | Use For |
|----------|-------|---------|
| `varSpacingXL` | 20 | Screen edge padding |
| `varSpacingLG` | 16 | Card padding |
| `varSpacingMD` | 12 | Form field gaps |
| `varSpacingSM` | 8 | Small gaps |
| `varSpacingXS` | 4 | Tiny gaps |

### Other Variables

| Variable | Purpose | Type |
|----------|---------|------|
| `varMeEmail` | Current user's email (lowercase) | Text |
| `varMeName` | Current user's display name | Text |
| `varShowConfirmModal` | ID of item for estimate confirmation (0=hidden) | Number |
| `varShowCancelModal` | ID of item for cancel confirmation (0=hidden) | Number |
| `varSelectedItem` | Item currently selected for modal | Record |
| `varIsLoading` | Shows loading state during operations | Boolean |
| `varStatusColors` | Status-to-color mapping table | Table |

---

## Understanding Where Things Go (READ THIS!)

Before you start building the UI, understand the modular structure of the app:

### App Structure (Modular Containers)

This app uses a **container-based architecture** for clean organization and easy maintenance. Each major section is wrapped in a container.

> 📐 **Tree View Order:** In Power Apps, items at the **TOP** of the tree appear **IN FRONT** visually. Items at the **BOTTOM** appear **BEHIND**. The trees below show the order as it appears in Power Apps (first-created at bottom, last-created at top).

```
▼ App
▼ scrHome                           ← Screen 1: Landing/Welcome Screen (StartScreen)
    ▼ conNavBarHome                 ← (created 5th - TOP of tree = in front)
        btnNavMyRequestsHome        ← "My Requests" (created 4th - top)
        btnNavSubmitHome            ← "New Request" (created 3rd)
        btnNavHomeActive            ← "Home" active (created 2nd)
        recNavBgHome                ← Dark background (created 1st inside - behind)
    lblHelpText                     ← "Need help?" (created 4th)
    ▼ conActionCards                ← (created 3rd)
        ▼ conRequestsCard           ← Right card (created 3rd inside)
            btnViewRequests         ← "VIEW REQUESTS" (created last - top)
            lblRequestsDesc         ← Description text
            lblRequestsTitle        ← "My Requests"
            icnRequests             ← List icon
            recRequestsCardBg       ← Card background (created 1st - behind)
        lblOrDivider                ← "OR" divider (created 2nd inside)
        ▼ conSubmitCard             ← Left card (created 1st inside)
            btnGetStarted           ← "GET STARTED" (created last - top)
            lblSubmitDesc           ← Description text
            lblSubmitTitle          ← "Submit New Request"
            icnSubmit               ← Printer icon
            recSubmitCardBg         ← Card background (created 1st - behind)
    ▼ conWelcome                    ← (created 2nd)
        lblSubtitle                 ← "What would you like..." (created 2nd - top)
        lblWelcome                  ← "Welcome, [Name]!" (created 1st - behind)
    ▼ conHeaderHome                 ← (created 1st - BOTTOM of tree = behind)
        lblHeaderTitleHome          ← "Student Portal" (created 2nd - top)
        recHeaderBgHome             ← Dark gray background (created 1st - behind)

▼ scrSubmit                         ← Screen 2: Submit Request Form
    ▼ conLoadingOverlay             ← (created last - TOP = in front when visible)
        recLoadingOverlay           ← Semi-transparent overlay (bottom)
        recLoadingBg                ← White box
        lblLoadingText              ← "Submitting..." (top)
    ▼ conNavBar                     ← Navigation bar
        btnNavMyRequests            ← "My Requests"
        btnNavSubmit                ← "New Request" (active)
        btnNavHome                  ← "Home"
        recNavBg                    ← Dark background (bottom)
    ▼ conFormArea                   ← Scrollable form container
        btnSubmit                   ← Submit button (top)
        ▼ frmSubmit                 ← EditForm (auto-generates DataCards)
            ▼ Attachments_DataCard1
                lblFileWarning      ← File naming instructions (inside Attachments)
            Notes_DataCard1
            DueDate_DataCard1
            Color_DataCard1
            Printer_DataCard1
            Method_DataCard1
            ProjectType_DataCard1
            Discipline_DataCard1
            Course Number_DataCard1
            ▼ TigerCardNumber_DataCard1
                lblTigerCardError    ← 16-digit validation (styled banner)
                imgTigerCardExample  ← Tiger Card example image
            StudentEmail_DataCard1
            Student_DataCard1
            Title_DataCard1          ← (bottom)
            Status_DataCard1
    ▼ conHeader                     ← (created first - BOTTOM = behind)
        lblHeaderTitle              ← "Submit Request" (top)
        recHeaderBg                 ← Dark gray background (bottom)

▼ scrMyRequests                     ← Screen 3: My Requests List
    ▼ conCancelModal                ← (TOP - modals in front when visible)
        ... modal contents ...
    ▼ conConfirmModal
        ... modal contents ...
    ▼ conLoadingOverlay2
        ... loading contents ...
    ▼ conNavBar2                    ← Navigation bar
        btnNavMyRequests2           ← "My Requests" (active)
        btnNavSubmit2               ← "New Request"
        btnNavHome2                 ← "Home"
        recNavBg2                   ← Dark background (bottom)
    ▼ conGalleryArea                ← Gallery container
        lblEmptyState               ← "No requests" message
        galMyRequests               ← Gallery of user's requests
    ▼ conHeader2                    ← (created first - BOTTOM = behind)
        btnRefresh                  ← Refresh button
        lblHeaderTitle2             ← "My Print Requests"
        recHeaderBg2                ← Dark background (bottom)
```

### Why Containers?

| Benefit | Explanation |
|---------|-------------|
| **Modularity** | Each section is self-contained and reusable |
| **Visibility control** | Hide/show entire sections with one `Visible` property |
| **Easy copying** | Copy containers between screens or apps |
| **Clean Tree View** | Collapse containers to reduce clutter |
| **Responsive sizing** | Child controls use `Parent.Width` relative to container |

### Naming Convention

We use **prefixes** to identify control types at a glance:

| Prefix | Control Type | Example |
|--------|-------------|---------|
| `scr` | Screen | `scrHome`, `scrSubmit`, `scrMyRequests` |
| `con` | Container | `conHeader`, `conNavBar`, `conFormArea` |
| `frm` | EditForm | `frmSubmit` |
| `rec` | Rectangle | `recHeaderBg`, `recNavBg` |
| `lbl` | Label | `lblHeaderTitle`, `lblWelcome` |
| `btn` | Button | `btnSubmit`, `btnGetStarted` |
| `gal` | Gallery | `galMyRequests` |
| `icn` | Icon | `icnSubmit`, `icnRequests` |
| `img` | Image | `imgLogo` |
| `DataCard` | Form field card | `Student_DataCard1`, `Method_DataCard1` (note: Power Apps adds "1" suffix) |

### Key Rules

| Rule | Explanation |
|------|-------------|
| **App = formulas only** | Only put formulas like `OnStart` here. Never visual elements. |
| **Screens = containers** | Organize controls into logical containers on each screen. |
| **Modals = containers** | Each modal is a Container with `Visible` controlled by a variable. |
| **EditForm = DataCards** | Form fields are auto-generated DataCards inside the EditForm. |
| **Rename immediately** | After adding a control, rename it right away. |

> 💡 **How to rename:** In the Tree view, double-click the control name (or click once and press F2) to edit it.

---

# STEP 4: Building Screen 1: Home (Landing)

**What you're doing:** Creating a welcoming landing screen that gives students a clear choice between submitting a new request or viewing their existing requests.

> 💡 **Why a landing screen?** Instead of dropping students directly into a form, this screen provides a personalized welcome and two clear paths. Return visitors can quickly check their request status without scrolling past a form.

### First: Rename the Screen

1. **In the Tree view, double-click on `Screen1`** to rename it.
2. Type `scrHome` and press **Enter**.

### Set Screen Background

3. With `scrHome` selected, set these properties:
   - **Fill:** `varColorBg`

---

### 4A: Create Header Container

4. With `scrHome` selected, click **+ Insert** → **Layout** → **Container**.
5. **Rename it:** `conHeaderHome`
6. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `varHeaderHeight` |
| Fill | `Transparent` |

#### Add Header Background

7. With `conHeaderHome` selected, click **+ Insert** → **Rectangle**.
8. **Rename it:** `recHeaderBgHome`
9. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorHeader` |

#### Add Header Title

10. Click **+ Insert** → **Text label**.
11. **Rename it:** `lblHeaderTitleHome`
12. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Student Portal"` |
| X | `(Parent.Width - Self.Width) / 2` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `300` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `Color.White` |
| Align | `Align.Center` |

---

### 4B: Create Welcome Section

13. With `scrHome` selected, click **+ Insert** → **Layout** → **Container**.
14. **Rename it:** `conWelcome`
15. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `varHeaderHeight + 30` |
| Width | `Parent.Width` |
| Height | `80` |
| Fill | `Transparent` |

#### Add Welcome Label

16. With `conWelcome` selected, click **+ Insert** → **Text label**.
17. **Rename it:** `lblWelcome`
18. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Welcome, " & First(Split(varMeName, " ")).Value & "!"` |
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `40` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `24` |
| Color | `varColorText` |
| Align | `Align.Center` |

#### Add Subtitle Label

19. Click **+ Insert** → **Text label**.
20. **Rename it:** `lblSubtitle`
21. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"What would you like to do today?"` |
| X | `0` |
| Y | `lblWelcome.Y + lblWelcome.Height` |
| Width | `Parent.Width` |
| Height | `30` |
| Font | `varAppFont` |
| Size | `14` |
| Color | `varColorTextMuted` |
| Align | `Align.Center` |

---

### 4C: Create Action Cards Container

22. With `scrHome` selected, click **+ Insert** → **Layout** → **Container**.
23. **Rename it:** `conActionCards`
24. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingXL` |
| Y | `conWelcome.Y + conWelcome.Height + 30` |
| Width | `Parent.Width - (varSpacingXL * 2)` |
| Height | `350` |
| Fill | `Transparent` |

---

### 4D: Create "Submit New Request" Card (Left)

25. With `conActionCards` selected, click **+ Insert** → **Layout** → **Container**.
26. **Rename it:** `conSubmitCard`
27. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `(Parent.Width - 80) / 2` |
| Height | `Parent.Height` |
| Fill | `varColorBgCard` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `1` |
| RadiusTopLeft | `varRadiusMedium` |
| RadiusTopRight | `varRadiusMedium` |
| RadiusBottomLeft | `varRadiusMedium` |
| RadiusBottomRight | `varRadiusMedium` |

#### Add Submit Icon

28. With `conSubmitCard` selected, click **+ Insert** → **Icons** → **Add** (or use a relevant icon like "Upload" or "Document").
29. **Rename it:** `icnSubmit`
30. Set these properties:

| Property | Value |
|----------|-------|
| Icon | `Icon.Add` (or `Icon.Upload`) |
| X | `(Parent.Width - 80) / 2` |
| Y | `40` |
| Width | `80` |
| Height | `80` |
| Color | `varColorPrimary` |

#### Add Submit Title

31. Click **+ Insert** → **Text label**.
32. **Rename it:** `lblSubmitTitle`
33. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Submit New Request"` |
| X | `0` |
| Y | `icnSubmit.Y + icnSubmit.Height + 20` |
| Width | `Parent.Width` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `16` |
| Color | `varColorText` |
| Align | `Align.Center` |

#### Add Submit Description

34. Click **+ Insert** → **Text label**.
35. **Rename it:** `lblSubmitDesc`
36. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Upload your 3D model file and submit a new print request"` |
| X | `varSpacingLG` |
| Y | `lblSubmitTitle.Y + lblSubmitTitle.Height + 8` |
| Width | `Parent.Width - (varSpacingLG * 2)` |
| Height | `50` |
| Font | `varAppFont` |
| Size | `12` |
| Color | `varColorTextMuted` |
| Align | `Align.Center` |

#### Add "Get Started" Button

37. Click **+ Insert** → **Button**.
38. **Rename it:** `btnGetStarted`
39. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"GET STARTED"` |
| X | `varSpacingLG` |
| Y | `Parent.Height - 70` |
| Width | `Parent.Width - (varSpacingLG * 2)` |
| Height | `varButtonHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |

40. Set **OnSelect:**

```powerfx
Navigate(scrSubmit, ScreenTransition.Fade)
```

---

### 4E: Add "OR" Divider

41. With `conActionCards` selected, click **+ Insert** → **Text label**.
42. **Rename it:** `lblOrDivider`
43. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"OR"` |
| X | `(Parent.Width - 50) / 2` |
| Y | `(Parent.Height - 50) / 2` |
| Width | `50` |
| Height | `50` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Color | `varColorTextMuted` |
| Align | `Align.Center` |
| VerticalAlign | `VerticalAlign.Middle` |
| Fill | `varColorBg` |
| RadiusTopLeft | `25` |
| RadiusTopRight | `25` |
| RadiusBottomLeft | `25` |
| RadiusBottomRight | `25` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `1` |

---

### 4F: Create "My Requests" Card (Right)

44. With `conActionCards` selected, click **+ Insert** → **Layout** → **Container**.
45. **Rename it:** `conRequestsCard`
46. Set these properties:

| Property | Value |
|----------|-------|
| X | `Parent.Width - conSubmitCard.Width` |
| Y | `0` |
| Width | `(Parent.Width - 80) / 2` |
| Height | `Parent.Height` |
| Fill | `varColorBgCard` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `1` |
| RadiusTopLeft | `varRadiusMedium` |
| RadiusTopRight | `varRadiusMedium` |
| RadiusBottomLeft | `varRadiusMedium` |
| RadiusBottomRight | `varRadiusMedium` |

#### Add Requests Icon

47. With `conRequestsCard` selected, click **+ Insert** → **Icons** → **DetailList** (or similar list icon).
48. **Rename it:** `icnRequests`
49. Set these properties:

| Property | Value |
|----------|-------|
| Icon | `Icon.DetailList` |
| X | `(Parent.Width - 80) / 2` |
| Y | `40` |
| Width | `80` |
| Height | `80` |
| Color | `varColorSuccess` |

#### Add Requests Title

50. Click **+ Insert** → **Text label**.
51. **Rename it:** `lblRequestsTitle`
52. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"My Requests"` |
| X | `0` |
| Y | `icnRequests.Y + icnRequests.Height + 20` |
| Width | `Parent.Width` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `16` |
| Color | `varColorText` |
| Align | `Align.Center` |

#### Add Requests Description

53. Click **+ Insert** → **Text label**.
54. **Rename it:** `lblRequestsDesc`
55. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"View status, confirm estimates, or manage your existing requests"` |
| X | `varSpacingLG` |
| Y | `lblRequestsTitle.Y + lblRequestsTitle.Height + 8` |
| Width | `Parent.Width - (varSpacingLG * 2)` |
| Height | `50` |
| Font | `varAppFont` |
| Size | `12` |
| Color | `varColorTextMuted` |
| Align | `Align.Center` |

#### Add "View Requests" Button

56. Click **+ Insert** → **Button**.
57. **Rename it:** `btnViewRequests`
58. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"VIEW REQUESTS"` |
| X | `varSpacingLG` |
| Y | `Parent.Height - 70` |
| Width | `Parent.Width - (varSpacingLG * 2)` |
| Height | `varButtonHeight` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |
| HoverFill | `varColorSuccessHover` |
| PressedFill | `RGBA(0, 100, 0, 1)` |

59. Set **OnSelect:**

```powerfx
Navigate(scrMyRequests, ScreenTransition.Fade)
```

---

### 4G: Create Help Footer

60. With `scrHome` selected, click **+ Insert** → **Text label**.
61. **Rename it:** `lblHelpText`
62. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Need help? Visit Room 145 Atkinson Hall or email fablab@lsu.edu"` |
| X | `0` |
| Y | `Parent.Height - varNavHeight - 50` |
| Width | `Parent.Width` |
| Height | `30` |
| Font | `varAppFont` |
| Size | `11` |
| Color | `varColorTextMuted` |
| Align | `Align.Center` |

---

### 4H: Create Navigation Bar

63. With `scrHome` selected, click **+ Insert** → **Layout** → **Container**.
64. **Rename it:** `conNavBarHome`
65. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `Parent.Height - varNavHeight` |
| Width | `Parent.Width` |
| Height | `varNavHeight` |
| Fill | `Transparent` |

#### Add Nav Background

66. With `conNavBarHome` selected, click **+ Insert** → **Rectangle**.
67. **Rename it:** `recNavBgHome`
68. Set: **X:** `0`, **Y:** `0`, **Width:** `Parent.Width`, **Height:** `Parent.Height`, **Fill:** `varColorHeader`

#### Add Home Nav Button (Active)

69. Click **+ Insert** → **Button**.
70. **Rename it:** `btnNavHomeActive`
71. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Home"` |
| X | `varSpacingXL` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `(Parent.Width - 80) / 3` |
| Height | `varButtonHeightSmall` |
| Fill | `varColorInfo` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

72. Set **OnSelect:** `// Already on this screen`

#### Add New Request Nav Button (Inactive)

73. Click **+ Insert** → **Button**.
74. **Rename it:** `btnNavSubmitHome`
75. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"New Request"` |
| X | `(Parent.Width - Self.Width) / 2` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `(Parent.Width - 80) / 3` |
| Height | `varButtonHeightSmall` |
| Fill | `RGBA(60, 60, 65, 1)` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Normal` |
| Size | `12` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

76. Set **OnSelect:**

```powerfx
Navigate(scrSubmit, ScreenTransition.Fade)
```

#### Add My Requests Nav Button (Inactive)

77. Click **+ Insert** → **Button**.
78. **Rename it:** `btnNavMyRequestsHome`
79. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"My Requests"` |
| X | `Parent.Width - Self.Width - varSpacingXL` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `(Parent.Width - 80) / 3` |
| Height | `varButtonHeightSmall` |
| Fill | `RGBA(60, 60, 65, 1)` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Normal` |
| Size | `12` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

80. Set **OnSelect:**

```powerfx
Navigate(scrMyRequests, ScreenTransition.Fade)
```

---

### ✅ Step 4 Checklist (Home Screen)

Your Tree view should now look like this (first-created at bottom, last-created at top):

```
▼ scrHome
    ▼ conNavBarHome                 ← created last (top = in front)
        btnNavMyRequestsHome
        btnNavSubmitHome
        btnNavHomeActive
        recNavBgHome
    lblHelpText
    ▼ conActionCards
        ▼ conRequestsCard           ← created after conSubmitCard
            btnViewRequests
            lblRequestsDesc
            lblRequestsTitle
            icnRequests
            recRequestsCardBg       ← background at bottom
        lblOrDivider
        ▼ conSubmitCard             ← created first inside conActionCards
            btnGetStarted
            lblSubmitDesc
            lblSubmitTitle
            icnSubmit
            recSubmitCardBg         ← background at bottom
    ▼ conWelcome
        lblSubtitle
        lblWelcome
    ▼ conHeaderHome                 ← created first (bottom = behind)
        lblHeaderTitleHome
        recHeaderBgHome             ← background at bottom
```

> 💡 **Tree view order:** Items at the TOP of the tree appear IN FRONT visually. Items at the BOTTOM appear BEHIND. This is why backgrounds (rectangles) should be created first — they appear at the bottom of each container.

---

# STEP 5: Building Screen 2: Submit Request

**What you're doing:** Creating the submit request screen with a modular container structure for the submission form.

### Create a New Screen

1. In the Tree view, click **+ New screen** → **Blank**.
2. **Rename it:** `scrSubmit`

### Set Screen Background

3. With `scrSubmit` selected, set these properties:
   - **Fill:** `varColorBg`

---

### 5A: Create Header Container

4. With `scrSubmit` selected, click **+ Insert** → **Layout** → **Container**.
5. **Rename it:** `conHeader`
6. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `varHeaderHeight` |
| Fill | `Transparent` |

#### Add Header Background

7. With `conHeader` selected, click **+ Insert** → **Rectangle**.
8. **Rename it:** `recHeaderBg`
9. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorHeader` |

> This creates a dark gray header bar matching the Staff Dashboard.

#### Add Header Title

10. Click **+ Insert** → **Text label**.
11. **Rename it:** `lblHeaderTitle`
12. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Submit 3D Print Request"` |
| X | `varSpacingXL` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `Parent.Width - 40` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `Color.White` |

---

### 5B: Create Navigation Container

13. With `scrSubmit` selected (not conHeader), click **+ Insert** → **Layout** → **Container**.
14. **Rename it:** `conNavBar`
15. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `Parent.Height - varNavHeight` |
| Width | `Parent.Width` |
| Height | `varNavHeight` |
| Fill | `Transparent` |

#### Add Navigation Background

16. With `conNavBar` selected, click **+ Insert** → **Rectangle**.
17. **Rename it:** `recNavBg`
18. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorHeader` |

#### Add Home Nav Button (Inactive)

19. Click **+ Insert** → **Button**.
20. **Rename it:** `btnNavHome`
21. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Home"` |
| X | `varSpacingXL` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `(Parent.Width - 80) / 3` |
| Height | `varButtonHeightSmall` |
| Fill | `RGBA(60, 60, 65, 1)` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Normal` |
| Size | `12` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

22. Set **OnSelect:**

```powerfx
Navigate(scrHome, ScreenTransition.Fade)
```

#### Add New Request Nav Button (Active)

23. Click **+ Insert** → **Button**.
24. **Rename it:** `btnNavSubmit`
25. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"New Request"` |
| X | `(Parent.Width - Self.Width) / 2` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `(Parent.Width - 80) / 3` |
| Height | `varButtonHeightSmall` |
| Fill | `varColorInfo` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `12` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

26. Set **OnSelect:** `// Already on this screen`

#### Add My Requests Nav Button (Inactive)

27. Click **+ Insert** → **Button**.
28. **Rename it:** `btnNavMyRequests`
29. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"My Requests"` |
| X | `Parent.Width - Self.Width - varSpacingXL` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `(Parent.Width - 80) / 3` |
| Height | `varButtonHeightSmall` |
| Fill | `RGBA(60, 60, 65, 1)` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Normal` |
| Size | `12` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

30. Set **OnSelect:**

```powerfx
Navigate(scrMyRequests, ScreenTransition.Fade)
```

---

### 5C: Create Loading Overlay Container

31. With `scrSubmit` selected, click **+ Insert** → **Layout** → **Container**.
32. **Rename it:** `conLoadingOverlay`
33. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `Transparent` |
| Visible | `varIsLoading` |

34. In Tree view, drag `conLoadingOverlay` to the **top** of scrSubmit's children (so it renders in front of everything).

#### Add Overlay Background

35. With `conLoadingOverlay` selected, click **+ Insert** → **Rectangle**.
36. **Rename it:** `recLoadingOverlay`
37. Set: **X:** `0`, **Y:** `0`, **Width:** `Parent.Width`, **Height:** `Parent.Height`, **Fill:** `varColorOverlay`

#### Add Loading Box

38. Click **+ Insert** → **Rectangle**.
39. **Rename it:** `recLoadingBg`
40. Set these properties:

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 200) / 2` |
| Y | `(Parent.Height - 100) / 2` |
| Width | `200` |
| Height | `100` |
| Fill | `varColorBgCard` |

#### Add Loading Text

41. Click **+ Insert** → **Text label**.
42. **Rename it:** `lblLoadingText`
43. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Submitting..."` |
| X | `recLoadingBg.X` |
| Y | `recLoadingBg.Y + 35` |
| Width | `recLoadingBg.Width` |
| Height | `30` |
| Align | `Align.Center` |
| Size | `14` |
| Color | `varColorPrimary` |

#### Arrange Z-Order

In Tree view, ensure controls inside `conLoadingOverlay` are ordered:

```
▼ conLoadingOverlay
    lblLoadingText      ← IN FRONT
    recLoadingBg        ← White box
    recLoadingOverlay   ← BEHIND (semi-transparent)
```

> 💡 **Tip:** Copy this same container structure to `scrMyRequests` (rename with `2` suffix) for consistent loading feedback on both screens.

---

# STEP 6: Building the Submit Form (EditForm)

**What you're doing:** Adding an EditForm control that automatically handles form fields, validation, and file attachments.

> 💡 **Why EditForm?** EditForm auto-generates DataCards for each SharePoint column, handles data binding automatically, and—critically—supports **native file attachments** via `SubmitForm()`. Individual controls with `Patch()` cannot save attachments.

---

### 6A: Create Form Container

1. With `scrSubmit` selected (not inside another container), click **+ Insert** → **Layout** → **Container**.
2. **Rename it:** `conFormArea`
3. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `varHeaderHeight` |
| Width | `Parent.Width` |
| Height | `Parent.Height - varHeaderHeight - varNavHeight` |
| Fill | `varColorBg` |

> This creates the main content area between the header and navigation bar.

---

### 6B: Add the EditForm Control

4. With `conFormArea` selected, click **+ Insert** → **Input** → **Edit form**.
5. **Rename it:** `frmSubmit`
6. Set these properties:

| Property | Value |
|----------|-------|
| DataSource | `PrintRequests` |
| DefaultMode | `FormMode.New` |
| X | `varSpacingXL` |
| Y | `varSpacingXL` |
| Width | `Parent.Width - (varSpacingXL * 2)` |
| Height | `Parent.Height - (varSpacingXL * 2) - 120` |

7. After setting the DataSource, Power Apps will **auto-generate DataCards** for all columns in PrintRequests.

> ⚠️ **Wait for DataCards:** After connecting to PrintRequests, you'll see DataCards appear in the Tree view under `frmSubmit`. This may take a few seconds.

---

### 6C: Configure Form Fields

Now we'll configure which fields are visible and how they behave.

#### Open the Fields Panel

8. With `frmSubmit` selected, in the right Properties pane, click **Edit fields**.
9. A panel opens showing all fields currently in the form.

#### Remove Staff-Only Fields

These fields should NOT appear on the student form. Remove them:

10. For each field below, click the **...** menu next to it and select **Remove**:

| Field to Remove | Reason |
|-----------------|--------|
| AssignedTo | Staff assignment field |
| ReqKey | Auto-generated by Flow |
| Priority | Staff manages queue priority |
| EstimatedTime | Staff estimates print time |
| EstimatedWeight | Staff estimates material |
| EstimatedCost | Staff calculates cost |
| StaffNotes | Internal staff communication |
| LastAction | Auto-populated by flows |
| LastActionBy | Auto-populated by flows |
| LastActionAt | Auto-populated timestamp |
| NeedsAttention | Staff attention flag |
| RejectionReason | Staff rejection reasons |
| TransactionNumber | Payment field |
| FinalWeight | Payment field |
| FinalCost | Payment field |
| PaymentDate | Payment field |
| PaymentNotes | Payment field |
| StudentConfirmed | Handled by confirmation modal |

#### Reorder Fields

11. Drag fields in the panel to arrange in this order:

```
1. Title (will hide)
2. Student
3. StudentEmail
4. TigerCardNumber
5. Course Number
6. Discipline
7. ProjectType
8. Method
9. Printer
10. Color
11. DueDate
12. Notes
13. Attachments
14. Status (will hide)
```

12. Click outside the panel to close it.

---

### 6D: Configure Individual DataCards

Now we'll customize each DataCard. For each DataCard below, **click on it in the Tree view** and set the properties shown.

#### Title_DataCard1 (Hide)

13. Click on `Title_DataCard1` in Tree view.
14. Set these properties:

| Property | Value |
|----------|-------|
| Visible | `false` |

> Title will be auto-generated from the student name, method, and color.

#### Student_DataCard1 (Student Selects)

15. Expand `Student_DataCard1` in Tree view.
16. Click on the **ComboBox control inside** (default name: `DataCardValue3`).
17. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices([@PrintRequests].Student)` |
| DefaultSelectedItems | `Parent.Default` |
| DisplayMode | `Parent.DisplayMode` |
| IsSearchable | `true` |

> 💡 **Why not auto-fill?** SharePoint Person columns have complex type requirements that make auto-fill unreliable. Since `StudentEmail` auto-fills correctly and is used for filtering requests, letting students search and select their name is a simple, reliable approach.

#### StudentEmail_DataCard1 (Auto-fill)

19. Expand `StudentEmail_DataCard1` in Tree view.
20. Click on the **TextInput control inside**.
21. Set these properties:

| Property | Value |
|----------|-------|
| DisplayMode | `DisplayMode.View` |

22. Set **Default:**

```powerfx
If(frmSubmit.Mode = FormMode.New, Lower(User().Email), Parent.Default)
```

#### TigerCardNumber_DataCard1

23. Expand `TigerCardNumber_DataCard1` in Tree view.
24. Click on the **TextInput control inside**.
25. Set these properties:

| Property | Value |
|----------|-------|
| HintText | `"16-digit POS number from Tiger Card"` |
| MaxLength | `16` |

26. Click on `TigerCardNumber_DataCard1` itself (the card, not the input).
27. Set these properties:

| Property | Value |
|----------|-------|
| Required | `true` |
| Height | `240` |

> 💡 **Increased height** accommodates the example Tiger Card image and validation label below.

#### Add TigerCard Validation Label

This styled label provides real-time feedback when the TigerCard number isn't exactly 16 digits.

28. With `TigerCardNumber_DataCard1` expanded, click **+ Insert** → **Text label**.
29. **Rename it:** `lblTigerCardError`
30. Set these properties:

| Property | Value |
|----------|-------|
| X | `DataCardValue30.X` |
| Y | `DataCardValue30.Y + DataCardValue30.Height + 4` |
| Width | `DataCardValue30.Width` |
| Height | `24` |
| Align | `Align.Center` |
| Fill | `RGBA(255, 235, 235, 1)` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| Size | `10` |
| BorderColor | `varColorDanger` |
| BorderThickness | `1` |
| Text | `"Must be exactly 16 digits"` |
| Visible | `!IsBlank(DataCardValue30.Text) && Len(DataCardValue30.Text) <> 16` |

> 💡 **Styled Feedback:** This label matches the bottom validation banner style (pink background, red border) for visual consistency. It only appears when the user has typed something but it's not exactly 16 digits.

> ⚠️ **Control Name:** The TextInput control inside `TigerCardNumber_DataCard1` is named `DataCardValue30` in this example. Your control may have a different number suffix (e.g., `DataCardValue5`, `DataCardValue12`). Check the Tree view to find the actual name and replace `DataCardValue30` accordingly.

#### Add Tiger Card Example Image

This image helps students locate the 16-digit POS number on their Tiger Card.

31. First, **upload the Tiger Card image** to the app:
    - In the left panel, click the **Media** icon (mountain/image icon)
    - Click **+ Add media** → **Upload**
    - Select your Tiger Card example image (showing where the POS number is located)
    - After upload, it will appear in your Media list — note the name (e.g., `Example TigerCard`)

32. With `TigerCardNumber_DataCard1` expanded, click **+ Insert** → **Media** → **Image**.
33. **Rename it:** `imgTigerCardExample`
34. Set these properties:

| Property | Value |
|----------|-------|
| Image | `'Example TigerCard'` (or your uploaded image name) |
| X | `32` |
| Y | `90` |
| Width | `231` |
| Height | `144` |
| ImagePosition | `ImagePosition.Fit` |

> 💡 **Purpose:** This visual reference shows students exactly where to find the 16-digit POS number on the back of their Tiger Card. The number is typically displayed in a highlighted box on the card.

> ⚠️ **Image Name:** Replace `'Example TigerCard'` with your actual uploaded image name. The name must match exactly, including any spaces.

#### Course Number_DataCard1

35. Expand `Course Number_DataCard1` in Tree view.
36. Click on the **TextInput control inside**.
37. Set these properties:

| Property | Value |
|----------|-------|
| HintText | `"e.g., 2001, 4000"` |

> 💡 **Optional field:** Course Number (numeric only) helps staff understand the context of the request but is not strictly required.

#### Discipline_DataCard1

38. Expand `Discipline_DataCard1` in Tree view.
39. Click on the **ComboBox control inside** (named `DataCardValue6` or similar).
40. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices([@PrintRequests].Discipline)` |
| DefaultSelectedItems | `Parent.Default` |

41. Click on `Discipline_DataCard1` itself (the card, not the ComboBox).
42. Set these properties:

| Property | Value |
|----------|-------|
| Required | `true` |

> 💡 **Why required?** Discipline helps staff prioritize requests and understand the academic context of each print job.

#### ProjectType_DataCard1

43. Expand `ProjectType_DataCard1` in Tree view.
44. Click on the **ComboBox control inside** (named `DataCardValue7` or similar).
45. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices([@PrintRequests].ProjectType)` |
| DefaultSelectedItems | `Parent.Default` |

46. Click on `ProjectType_DataCard1` itself (the card, not the ComboBox).
47. Set these properties:

| Property | Value |
|----------|-------|
| Required | `true` |

> 💡 **Why required?** Project Type (e.g., Class Project, Personal, Research) helps staff understand urgency and billing context.

#### Method_DataCard1 (Controls Cascading)

48. Expand `Method_DataCard1` in Tree view.
49. Click on the **ComboBox control inside** (default name: `DataCardValue8`).
50. **Verify the name** of this control matches `DataCardValue8` — this is referenced by Printer and Color cascading filters.

> 💡 If your control has a different name, replace `DataCardValue8` in the Printer and Color formulas below with your actual control name.

#### Printer_DataCard1 (Cascading Filter)

51. Expand `Printer_DataCard1` in Tree view.
52. Click on the **ComboBox control inside**.
53. Set **Items**:

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        DataCardValue8.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        DataCardValue8.Selected.Value = "Resin",
        Value = "Form 3 (5.7×5.7×7.3in)",
        true
    )
)
```

> 💡 **Cascading Logic:** Filament shows FDM printers, Resin shows only Form 3.

#### Color_DataCard1 (Cascading Filter)

54. Expand `Color_DataCard1` in Tree view.
55. Click on the **ComboBox control inside**.
56. Set **Items**:

```powerfx
Filter(
    Choices([@PrintRequests].Color),
    Or(
        DataCardValue8.Selected.Value <> "Resin",
        Value = "Black",
        Value = "White",
        Value = "Gray",
        Value = "Clear"
    )
)
```

> 💡 **Cascading Logic:** Resin is limited to Black, White, Gray, Clear. Filament gets all colors.

#### DueDate_DataCard1

57. Expand `DueDate_DataCard1` in Tree view.
58. Click on the **DatePicker control inside** (e.g., `DataCardValue11`).
59. Set **DefaultDate** to default to today's date:

```powerfx
If(frmSubmit.Mode = FormMode.New, Today(), Parent.Default)
```

> 💡 **Default to Today:** This sets the date picker to today's date for new submissions, while preserving the existing date when editing.

#### Notes_DataCard1

60. Expand `Notes_DataCard1` in Tree view.
61. Click on the **TextInput control inside**.
62. Set these properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| HintText | `"Special instructions, scaling notes, questions for staff..."` |

#### Attachments_DataCard1

63. Click on `Attachments_DataCard1` in Tree view.
64. Set these properties:

| Property | Value |
|----------|-------|
| Required | `false` |

> ✅ **Native Attachments:** Because we're using EditForm with `SubmitForm()`, file attachments work automatically. No extra configuration needed!

#### Status_DataCard1 (Hidden, Auto-Set)

65. Click on `Status_DataCard1` in Tree view.
66. Set these properties:

| Property | Value |
|----------|-------|
| Visible | `false` |

67. Click on the **ComboBox control inside** `Status_DataCard1`.
68. Set **DefaultSelectedItems:**

```powerfx
If(
    frmSubmit.Mode = FormMode.New,
    [{Value: "Uploaded"}],
    Table(Parent.Default)
)
```

> This ensures new submissions always start with Status = "Uploaded".

---

### 6E: Add File Warning Label

69. Expand `Attachments_DataCard1` in Tree view and select it.
70. Click **+ Insert** → **Text label**.
71. **Rename it:** `lblFileWarning`
72. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingMD` |
| Y | `DataCardKey.Y + DataCardKey.Height + varSpacingMD` |
| Width | `Parent.Width - (varSpacingMD * 2)` |
| Height | `180` |
| Overflow | `Overflow.Scroll` |
| Fill | `RGBA(255, 244, 206, 1)` |
| Color | `RGBA(102, 77, 3, 1)` |
| Font | `varAppFont` |
| Size | `10` |
| PaddingTop | `varSpacingMD` |
| PaddingBottom | `varSpacingMD` |
| PaddingLeft | `varSpacingMD` |
| PaddingRight | `varSpacingMD` |
| BorderColor | `varColorWarning` |
| BorderThickness | `1` |

73. Set **Text:**

```powerfx
"IMPORTANT: File Naming Requirement

Your files MUST be named: FirstLast_Method_Color

Examples:
  - JaneDoe_Filament_Blue.stl
  - MikeSmith_Resin_Clear.3mf

Accepted formats: .stl, .obj, .3mf, .idea, .form

Files not following this format will be rejected."
```

---

### 6F: Add Submit Button

74. Click **+ Insert** → **Button**.
75. **Rename it:** `btnSubmit`
76. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"SUBMIT REQUEST"` |
| X | `varSpacingXL` |
| Y | `frmSubmit.Y + frmSubmit.Height + varSpacingMD` |
| Width | `Parent.Width - (varSpacingXL * 2)` |
| Height | `varButtonHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| DisabledFill | `varColorDisabled` |

77. Set **DisplayMode** (validates required fields and TigerCard length):

```powerfx
If(
    frmSubmit.Valid && Len(TigerCardNumber_DataCard1.Update) = 16,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

> 💡 **Form Validation:** EditForm automatically tracks if all required fields are filled via `frmSubmit.Valid`. We also check that the Tiger Card number is exactly 16 digits using the DataCard's `.Update` property, which contains the current value that would be submitted. This is more reliable than referencing the internal control name directly.

78. Set **OnSelect:**

```powerfx
// Track that user attempted to submit (for showing validation errors)
Set(varSubmitAttempted, true);

// Only proceed if form is valid
If(
    frmSubmit.Valid && Len(TigerCardNumber_DataCard1.Update) = 16,
    Set(varIsLoading, true);
    SubmitForm(frmSubmit)
)
```

> 💡 **Submit Attempt Tracking:** We set `varSubmitAttempted` to true when the user clicks Submit. This allows the validation message to only appear after they've tried to submit, not while they're still filling out the form.

---

### 6G: Add Validation Feedback Label

This label shows students exactly which fields need attention — but only after they try to submit.

79. Click **+ Insert** → **Text label**.
80. **Rename it:** `lblValidationMessage`
81. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingXL` |
| Y | `btnSubmit.Y - 40` |
| Width | `Parent.Width - (varSpacingXL * 2)` |
| Height | `32` |
| Align | `Align.Center` |
| Fill | `RGBA(255, 235, 235, 1)` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| Size | `11` |
| PaddingTop | `varSpacingSM` |
| PaddingBottom | `varSpacingSM` |
| PaddingLeft | `varSpacingMD` |
| PaddingRight | `varSpacingMD` |
| BorderColor | `varColorDanger` |
| BorderThickness | `1` |

82. Set **Visible** (only show after submit attempt):

```powerfx
varSubmitAttempted && (!frmSubmit.Valid || Len(TigerCardNumber_DataCard1.Update) <> 16)
```

83. Set **Text:**

```powerfx
If(
    Len(TigerCardNumber_DataCard1.Update) <> 16 && !IsBlank(TigerCardNumber_DataCard1.Update),
    "Tiger Card number must be exactly 16 digits.",
    "Please fill in all required fields before submitting."
)
```

> 💡 **Specific feedback:** When the Tiger Card number is the issue, we show a specific message. Otherwise, we show the general required fields message. This helps students understand exactly what needs to be fixed.

---

### 6H: Configure Form Events

84. Click on `frmSubmit` in Tree view.
85. Set **OnSuccess:**

```powerfx
Set(varIsLoading, false);
Set(varSubmitAttempted, false);  // Reset for next submission
Notify("Request submitted successfully! You'll receive a confirmation email shortly.", NotificationType.Success);
ResetForm(frmSubmit);
Navigate(scrMyRequests, ScreenTransition.Fade)
```

86. Set **OnFailure:**

```powerfx
Set(varIsLoading, false);
Notify(
    "Something went wrong. Please try again or ask staff for help.",
    NotificationType.Error,
    5000
)
```

> 💡 **Keep it simple:** Students don't need technical details. If submission fails after validation passes, it's likely a network or system issue — staff can investigate if needed.

---

### ✅ Step 6 Checklist

Your Tree view should now look like (first-created at bottom, last-created at top):

```
▼ scrSubmit
    ▼ conLoadingOverlay             ← created last (TOP = in front when visible)
        lblLoadingText
        recLoadingBg
        recLoadingOverlay           ← background at bottom
    ▼ conNavBar
        btnNavMyRequests
        btnNavSubmit
        btnNavHome
        recNavBg                    ← background at bottom
    ▼ conFormArea
        btnSubmit                   ← top of form area
        lblValidationMessage
        ▼ frmSubmit
            ▼ Attachments_DataCard1
                lblFileWarning      ← inside Attachments card
            Notes_DataCard1
            DueDate_DataCard1
            Color_DataCard1
            Printer_DataCard1
            Method_DataCard1
            ProjectType_DataCard1
            Discipline_DataCard1
            Course Number_DataCard1
            ▼ TigerCardNumber_DataCard1
                lblTigerCardError        ← 16-digit validation (styled banner)
                imgTigerCardExample      ← Tiger Card example image
                DataCardValue (TextInput)
                DataCardKey (Label)
            StudentEmail_DataCard1
            Student_DataCard1
            Status_DataCard1 (hidden)
            Title_DataCard1 (hidden) ← bottom of form
    ▼ conHeader                     ← created first (BOTTOM = behind)
        lblHeaderTitle
        recHeaderBg                 ← background at bottom
```

---

# STEP 7: Configuring Form Fields

**What you're doing:** This step provides reference information for the form field configuration. Most of this was already covered in Step 6D.

> 💡 **Note:** If you followed Step 6 completely, your form fields are already configured. This section provides additional reference for the cascading dropdown formulas.

---

### Cascading Dropdown Reference

The Method, Printer, and Color fields work together with cascading filters:

#### Printer Filter Logic

When configuring `Printer_DataCard1`'s ComboBox Items property, use this filter (replacing the control name with your actual Method control):

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        DataCardValueMethod.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        DataCardValueMethod.Selected.Value = "Resin",
        Value = "Form 3 (5.7×5.7×7.3in)",
        true
    )
)
```

**Result:**
- Filament → Shows Prusa MK4S, Prusa XL, Raised3D
- Resin → Shows Form 3 only

#### Color Filter Logic

When configuring `Color_DataCard1`'s ComboBox Items property:

```powerfx
Filter(
    Choices([@PrintRequests].Color),
    Or(
        DataCardValueMethod.Selected.Value <> "Resin",
        Value = "Black",
        Value = "White",
        Value = "Gray",
        Value = "Clear"
    )
)
```

**Result:**
- Filament → All colors available
- Resin → Only Black, White, Gray, Clear (resin-compatible colors)

---

### Attachment Support

Because we're using EditForm with `SubmitForm()`, file attachments work **automatically**. The `Attachments_DataCard1` that was auto-generated handles all file upload functionality.

> ✅ **No additional configuration needed** — just ensure the Attachments_DataCard1 is visible in the form.

---

# STEP 8: Building Screen 3: My Requests

**What you're doing:** Creating the second screen where students can view and manage their print requests. Uses the same modular container structure as Screen 1.

### Create the Second Screen

1. In the Tree view, click **+ New screen** → **Blank**.
2. **Rename it:** `scrMyRequests`
3. Set **Fill:** `varColorBg`

---

### 7A: Create Header Container

4. With `scrMyRequests` selected, click **+ Insert** → **Layout** → **Container**.
5. **Rename it:** `conHeader2`
6. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `varHeaderHeight` |
| Fill | `Transparent` |

#### Add Header Background

7. With `conHeader2` selected, click **+ Insert** → **Rectangle**.
8. **Rename it:** `recHeaderBg2`
9. Set: **X:** `0`, **Y:** `0`, **Width:** `Parent.Width`, **Height:** `Parent.Height`, **Fill:** `varColorHeader`

#### Add Header Title

10. Click **+ Insert** → **Text label**.
11. **Rename it:** `lblHeaderTitle2`
12. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"My Print Requests"` |
| X | `varSpacingXL` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `Parent.Width - 100` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `Color.White` |

#### Add Refresh Button

13. Click **+ Insert** → **Button**.
14. **Rename it:** `btnRefresh`
15. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"↻"` |
| X | `Parent.Width - 55` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `40` |
| Height | `40` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| Font | `varAppFont` |
| Size | `18` |
| RadiusTopLeft | `varRadiusPill` |
| RadiusTopRight | `varRadiusPill` |
| RadiusBottomLeft | `varRadiusPill` |
| RadiusBottomRight | `varRadiusPill` |

16. Set **OnSelect:**

```powerfx
Refresh(PrintRequests);
Notify("Requests refreshed!", NotificationType.Information)
```

---

### 7B: Create Navigation Container

17. With `scrMyRequests` selected, click **+ Insert** → **Layout** → **Container**.
18. **Rename it:** `conNavBar2`
19. Copy the same structure from `conNavBar` on Screen 1, but swap active/inactive styles:

| Control | Property | Value |
|---------|----------|-------|
| `recNavBg2` | Fill | `varColorHeader` |
| `btnNavSubmit2` | Text | `"New Request"` |
| `btnNavSubmit2` | Fill | `RGBA(60, 60, 65, 1)` (inactive) |
| `btnNavSubmit2` | OnSelect | `Navigate(scrSubmit, ScreenTransition.Fade)` |
| `btnNavMyRequests2` | Fill | `varColorInfo` (active) |
| `btnNavMyRequests2` | OnSelect | `// Already on this screen` |

---

### 7C: Create Gallery Container

20. With `scrMyRequests` selected, click **+ Insert** → **Layout** → **Container**.
21. **Rename it:** `conGalleryArea`
22. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `varHeaderHeight` |
| Width | `Parent.Width` |
| Height | `Parent.Height - varHeaderHeight - varNavHeight` |
| Fill | `Transparent` |

> The gallery and empty state label will go inside this container.

---

# STEP 9: Building the Request Cards Gallery

**What you're doing:** Creating a gallery that displays the student's print requests as cards.

### Add the Gallery

1. With `scrMyRequests` selected (not inside any other control), click **+ Insert** → **Blank vertical gallery**.
2. **Rename it:** `galMyRequests`
3. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `90` |
| Width | `Parent.Width` |
| Height | `Parent.Height - 170` |
| TemplatePadding | `8` |
| **WrapCount** | `3` |
| TemplateSize | `280` |

> 💡 **WrapCount = 3** creates a grid layout with 3 cards per row! Each card will be approximately 330px wide on a 1024px tablet screen.

4. Set the **Items** property:

**⬇️ FORMULA: Paste into galMyRequests Items**

```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        Lower(Student.Email) = varMeEmail
    ),
    "Created",
    SortOrder.Descending
)
```

> 💡 **How it works:** This filters to show only requests where the Student email matches the logged-in user, sorted newest first.

### Empty State Label

5. Click on `scrMyRequests` in Tree view (to add outside the gallery).
6. Click **+ Insert** → **Text label**.
7. **Rename it:** `lblEmptyState`
8. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"You haven't submitted any print requests yet.\n\nTap 'Submit' to create your first request!"` |
| X | `20` |
| Y | `Parent.Height / 2 - 100` |
| Width | `Parent.Width - 40` |
| Height | `200` |
| Align | `Align.Center` |
| Size | `14` |
| Color | `RGBA(100, 100, 100, 1)` |
| Visible | `CountRows(galMyRequests.AllItems) = 0` |

---

### Building the Card Template

Now add controls **inside** the gallery template.

#### Card Background

9. With `galMyRequests` selected, click **+ Insert** → **Rectangle**.
10. **Rename it:** `recCardBg`
11. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingLG` |
| Y | `0` |
| Width | `Parent.TemplateWidth - 32` |
| Height | `Parent.TemplateHeight - varSpacingSM` |
| Fill | `varColorBgCard` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `1` |

#### Request ID (ReqKey)

12. Click **+ Insert** → **Text label**.
13. **Rename it:** `lblReqKey`
14. Set these properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.ReqKey` |
| X | `28` |
| Y | `12` |
| Width | `150` |
| Height | `24` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Color | `RGBA(50, 50, 50, 1)` |

#### Status Badge

15. Click **+ Insert** → **Button**.
16. **Rename it:** `btnStatusBadge`
17. Set these properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Status.Value` |
| X | `Parent.TemplateWidth - 150` |
| Y | `10` |
| Width | `120` |
| Height | `40` |
| Size | `10` |
| RadiusTopLeft | `14` |
| RadiusTopRight | `14` |
| RadiusBottomLeft | `14` |
| RadiusBottomRight | `14` |
| DisplayMode | `DisplayMode.View` |

18. Set **Fill:**

```powerfx
LookUp(varStatusColors, Status = ThisItem.Status.Value, Color)
```

19. Set **Color:**

```powerfx
If(ThisItem.Status.Value = "Pending", Color.Black, Color.White)
```

#### Submission Date

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblSubmitDate`
22. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Submitted: " & Text(ThisItem.Created, "mmm d, yyyy")` |
| X | `28` |
| Y | `40` |
| Width | `200` |
| Height | `20` |
| Size | `11` |
| Color | `RGBA(100, 100, 100, 1)` |

#### Print Details Row

23. Click **+ Insert** → **Text label**.
24. **Rename it:** `lblPrintDetails`
25. Set these properties:

| Property | Value |
|----------|-------|
| X | `28` |
| Y | `62` |
| Width | `Parent.TemplateWidth - 60` |
| Height | `20` |
| Size | `11` |
| Color | `RGBA(80, 80, 80, 1)` |

26. Set **Text:**

```powerfx
ThisItem.Method.Value & " • " & 
Trim(If(Find("(", ThisItem.Printer.Value) > 0, Left(ThisItem.Printer.Value, Find("(", ThisItem.Printer.Value) - 1), ThisItem.Printer.Value)) & 
" • " & ThisItem.Color.Value
```

#### Estimate Display (Only when available)

27. Click **+ Insert** → **Text label**.
28. **Rename it:** `lblEstimate`
29. Set these properties:

| Property | Value |
|----------|-------|
| X | `28` |
| Y | `85` |
| Width | `Parent.TemplateWidth - 60` |
| Height | `24` |
| Size | `13` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorPrimary` |
| Visible | `!IsBlank(ThisItem.EstimatedCost)` |

30. Set **Text:**

```powerfx
"Estimated Cost: " & Text(ThisItem.EstimatedCost, "[$-en-US]$#,##0.00")
```

#### Action: Confirm Estimate Button (Pending status only)

31. Click **+ Insert** → **Button**.
32. **Rename it:** `btnConfirmEstimate`
33. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"✓ CONFIRM ESTIMATE"` |
| X | `28` |
| Y | `115` |
| Width | `Parent.TemplateWidth - 60` |
| Height | `45` |
| Fill | `RGBA(16, 124, 16, 1)` |
| Color | `Color.White` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Bold` |
| Size | `13` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |
| HoverFill | `RGBA(36, 144, 36, 1)` |
| Visible | `ThisItem.Status.Value = "Pending" && !ThisItem.StudentConfirmed` |

34. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowConfirmModal, ThisItem.ID)
```

#### Action: Cancel Request Button (Before printing starts)

35. Click **+ Insert** → **Button**.
36. **Rename it:** `btnCancelRequest`
37. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel Request"` |
| X | `28` |
| Y | `165` |
| Width | `150` |
| Height | `28` |
| Fill | `Color.White` |
| Color | `RGBA(209, 52, 56, 1)` |
| BorderColor | `RGBA(209, 52, 56, 1)` |
| BorderThickness | `1` |
| Size | `11` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Visible | `ThisItem.Status.Value in ["Uploaded", "Pending", "Ready to Print"]` |

38. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowCancelModal, ThisItem.ID)
```

#### Status Message (For statuses with no actions)

39. Click **+ Insert** → **Text label**.
40. **Rename it:** `lblStatusMessage`
41. Set these properties:

| Property | Value |
|----------|-------|
| X | `28` |
| Y | `115` |
| Width | `Parent.TemplateWidth - 60` |
| Height | `60` |
| Size | `11` |
| Color | `RGBA(100, 100, 100, 1)` |

42. Set **Text:**

```powerfx
Switch(
    ThisItem.Status.Value,
    "Printing", "Your print is currently in progress!",
    "Completed", "Your print is ready for pickup!\n📍 Room 145 Atkinson Hall\n💳 Payment: TigerCASH only",
    "Paid & Picked Up", "✓ Completed and picked up on " & Text(ThisItem.PaymentDate, "mmm d, yyyy"),
    "Rejected", "❌ Request rejected",
    "Canceled", "Request canceled by you",
    ""
)
```

43. Set **Visible:**

```powerfx
ThisItem.Status.Value in ["Printing", "Completed", "Paid & Picked Up", "Rejected", "Canceled"]
```

---

# STEP 10: Adding the Estimate Confirmation Modal

**What you're doing:** Creating a modal that shows estimate details and lets students confirm.

### Create Modal Container

1. With `scrMyRequests` selected (screen level), click **+ Insert** → **Layout** → **Container**.
2. **Rename it:** `conConfirmModal`
3. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| Visible | `varShowConfirmModal > 0` |

4. In Tree view, drag `conConfirmModal` to be **above** (in front of) `galMyRequests`.

### Modal Overlay

5. With `conConfirmModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recConfirmOverlay`
7. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0.7)` |

### Modal Box

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recConfirmModal`
10. Set these properties:

| Property | Value |
|----------|-------|
| X | `20` |
| Y | `(Parent.Height - 450) / 2` |
| Width | `Parent.Width - 40` |
| Height | `450` |
| Fill | `Color.White` |

### Modal Title

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblConfirmTitle`
13. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Confirm Your Print Estimate"` |
| X | `recConfirmModal.X + 20` |
| Y | `recConfirmModal.Y + 20` |
| Width | `recConfirmModal.Width - 40` |
| Height | `35` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Bold` |
| Size | `18` |
| Color | `RGBA(16, 124, 16, 1)` |

### Request Info

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblConfirmReqKey`
16. Set these properties:

| Property | Value |
|----------|-------|
| Text | `varSelectedItem.ReqKey` |
| X | `recConfirmModal.X + 20` |
| Y | `recConfirmModal.Y + 60` |
| Width | `recConfirmModal.Width - 40` |
| Height | `25` |
| Size | `14` |
| Color | `RGBA(100, 100, 100, 1)` |

### Estimate Cost (Large)

17. Click **+ Insert** → **Text label**.
18. **Rename it:** `lblConfirmCost`
19. Set these properties:

| Property | Value |
|----------|-------|
| X | `recConfirmModal.X + 20` |
| Y | `recConfirmModal.Y + 100` |
| Width | `recConfirmModal.Width - 40` |
| Height | `50` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Bold` |
| Size | `28` |
| Color | `varColorPrimary` |
| Align | `Align.Center` |

20. Set **Text:**

```powerfx
If(
    IsBlank(varSelectedItem.EstimatedCost),
    "Cost: TBD",
    Text(varSelectedItem.EstimatedCost, "[$-en-US]$#,##0.00")
)
```

### Estimate Details

21. Click **+ Insert** → **Text label**.
22. **Rename it:** `lblConfirmDetails`
23. Set these properties:

| Property | Value |
|----------|-------|
| X | `recConfirmModal.X + 20` |
| Y | `recConfirmModal.Y + 160` |
| Width | `recConfirmModal.Width - 40` |
| Height | `80` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |
| Align | `Align.Center` |

24. Set **Text:**

```powerfx
"Method: " & varSelectedItem.Method.Value & "  •  Color: " & varSelectedItem.Color.Value &
Char(10) &
If(!IsBlank(varSelectedItem.EstimatedTime), "Print Time: ~" & Text(varSelectedItem.EstimatedTime) & " hours", "") &
Char(10) &
If(!IsBlank(varSelectedItem.EstimatedWeight), "Material: ~" & Text(varSelectedItem.EstimatedWeight) & "g", "")
```

### Warning Text

25. Click **+ Insert** → **Text label**.
26. **Rename it:** `lblConfirmWarning`
27. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"By confirming, you agree to pay this amount at pickup. Printing will begin after confirmation."` |
| X | `recConfirmModal.X + 20` |
| Y | `recConfirmModal.Y + 250` |
| Width | `recConfirmModal.Width - 40` |
| Height | `50` |
| Size | `11` |
| Color | `RGBA(150, 150, 150, 1)` |
| Align | `Align.Center` |

### Confirm Button

28. Click **+ Insert** → **Button**.
29. **Rename it:** `btnConfirmYes`
30. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"I CONFIRM THIS ESTIMATE"` |
| X | `recConfirmModal.X + varSpacingXL` |
| Y | `recConfirmModal.Y + 320` |
| Width | `recConfirmModal.Width - 40` |
| Height | `varButtonHeight` |
| Fill | `varColorSuccess` |
| HoverFill | `varColorSuccessHover` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `varRadiusMedium` |
| RadiusTopRight | `varRadiusMedium` |
| RadiusBottomLeft | `varRadiusMedium` |
| RadiusBottomRight | `varRadiusMedium` |

31. Set **OnSelect:**

```powerfx
// Update the StudentConfirmed field
Patch(
    PrintRequests,
    LookUp(PrintRequests, ID = varShowConfirmModal),
    {StudentConfirmed: true}
);

// Close modal
Set(varShowConfirmModal, 0);
Set(varSelectedItem, Blank());

// Show success
Notify("Estimate confirmed! Your print is now in the queue.", NotificationType.Success);

// Refresh the gallery
Refresh(PrintRequests)
```

### Cancel Button

32. Click **+ Insert** → **Button**.
33. **Rename it:** `btnConfirmCancel`
34. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel"` |
| X | `recConfirmModal.X + 20` |
| Y | `recConfirmModal.Y + 385` |
| Width | `recConfirmModal.Width - 40` |
| Height | `40` |
| Fill | `RGBA(240, 240, 240, 1)` |
| Color | `RGBA(100, 100, 100, 1)` |
| Size | `12` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

35. Set **OnSelect:**

```powerfx
Set(varShowConfirmModal, 0);
Set(varSelectedItem, Blank())
```

### Arrange Z-Order

In the Tree view, ensure controls inside `conConfirmModal` are ordered (top to bottom):

```
▼ conConfirmModal
    btnConfirmYes           ← IN FRONT
    btnConfirmCancel
    lblConfirmWarning
    lblConfirmDetails
    lblConfirmCost
    lblConfirmReqKey
    lblConfirmTitle
    recConfirmModal         ← Modal box
    recConfirmOverlay       ← BEHIND (dark overlay)
```

---

# STEP 11: Adding the Cancel Request Modal

**What you're doing:** Creating a confirmation modal for canceling requests.

### Create Modal Container

1. With `scrMyRequests` selected, click **+ Insert** → **Layout** → **Container**.
2. **Rename it:** `conCancelModal`
3. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| Visible | `varShowCancelModal > 0` |

4. In Tree view, drag `conCancelModal` above `conConfirmModal`.

### Modal Overlay

5. With `conCancelModal` selected, click **+ Insert** → **Rectangle**.
6. **Rename it:** `recCancelOverlay`
7. Set: **X:** `0`, **Y:** `0`, **Width:** `Parent.Width`, **Height:** `Parent.Height`, **Fill:** `RGBA(0, 0, 0, 0.7)`

### Modal Box

8. Click **+ Insert** → **Rectangle**.
9. **Rename it:** `recCancelModal`
10. Set these properties:

| Property | Value |
|----------|-------|
| X | `30` |
| Y | `(Parent.Height - 300) / 2` |
| Width | `Parent.Width - 60` |
| Height | `300` |
| Fill | `Color.White` |

### Modal Title

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblCancelTitle`
13. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Cancel Request?"` |
| X | `recCancelModal.X + 20` |
| Y | `recCancelModal.Y + 20` |
| Width | `recCancelModal.Width - 40` |
| Height | `30` |
| Font | `Font.'Open Sans'` |
| FontWeight | `FontWeight.Bold` |
| Size | `18` |
| Color | `RGBA(209, 52, 56, 1)` |

### Warning Message

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblCancelMessage`
16. Set these properties:

| Property | Value |
|----------|-------|
| X | `recCancelModal.X + 20` |
| Y | `recCancelModal.Y + 60` |
| Width | `recCancelModal.Width - 40` |
| Height | `80` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

17. Set **Text:**

```powerfx
"Are you sure you want to cancel request " & varSelectedItem.ReqKey & "?" & Char(10) & Char(10) &
"This action cannot be undone. You'll need to submit a new request if you change your mind."
```

### Confirm Cancel Button

18. Click **+ Insert** → **Button**.
19. **Rename it:** `btnCancelYes`
20. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Yes, Cancel Request"` |
| X | `recCancelModal.X + varSpacingXL` |
| Y | `recCancelModal.Y + 160` |
| Width | `recCancelModal.Width - 40` |
| Height | `varInputHeight` |
| Fill | `varColorDanger` |
| HoverFill | `varColorDangerHover` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `13` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

21. Set **OnSelect:**

```powerfx
// Update status to Canceled (student-initiated cancellation)
Patch(
    PrintRequests,
    LookUp(PrintRequests, ID = varShowCancelModal),
    {
        Status: {Value: "Canceled"},
        LastAction: {Value: "Canceled by Student"},
        Notes: "Canceled by student before printing."
    }
);

// Close modal
Set(varShowCancelModal, 0);
Set(varSelectedItem, Blank());

// Show confirmation
Notify("Request canceled successfully.", NotificationType.Information);

// Refresh
Refresh(PrintRequests)
```

### Keep Request Button

22. Click **+ Insert** → **Button**.
23. **Rename it:** `btnCancelNo`
24. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"No, Keep Request"` |
| X | `recCancelModal.X + 20` |
| Y | `recCancelModal.Y + 220` |
| Width | `recCancelModal.Width - 40` |
| Height | `40` |
| Fill | `RGBA(240, 240, 240, 1)` |
| Color | `RGBA(100, 100, 100, 1)` |
| Size | `12` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |

25. Set **OnSelect:**

```powerfx
Set(varShowCancelModal, 0);
Set(varSelectedItem, Blank())
```

---

# STEP 12: Adding Navigation

Navigation is built into each screen. All three screens use a consistent bottom navigation bar with Home, New Request, and My Requests buttons. The active screen's button is highlighted with `varColorInfo`.

### Screen Navigation Summary

| Screen | Navigation | Active Button | Actions |
|--------|------------|---------------|---------|
| `scrHome` | Bottom nav bar (`conNavBarHome`) | `btnNavHomeActive` (Home) | `btnNavSubmitHome` → `scrSubmit`, `btnNavMyRequestsHome` → `scrMyRequests` |
| `scrSubmit` | Bottom nav bar (`conNavBar`) | `btnNavSubmit` (New Request) | `btnNavHome` → `scrHome`, `btnNavMyRequests` → `scrMyRequests` |
| `scrMyRequests` | Bottom nav bar (`conNavBar2`) | `btnNavMyRequests2` (My Requests) | `btnNavHome2` → `scrHome`, `btnNavSubmit2` → `scrSubmit` |

> The Home screen also has card buttons (`btnGetStarted` → `scrSubmit`, `btnViewRequests` → `scrMyRequests`) for quick navigation from the landing page.

### Navigation Bar Consistency

All three screens share the same bottom nav bar pattern:

| Element | Left Button | Center Button | Right Button |
|---------|-------------|---------------|--------------|
| Text | `"Home"` | `"New Request"` | `"My Requests"` |
| Active Fill | `varColorInfo` | `varColorInfo` | `varColorInfo` |
| Inactive Fill | `RGBA(60, 60, 65, 1)` | `RGBA(60, 60, 65, 1)` | `RGBA(60, 60, 65, 1)` |

The active button on each screen uses `varColorInfo` fill and `FontWeight.Semibold`, while inactive buttons use the dark gray fill and `FontWeight.Normal`.

### Set Default Screen

1. Click on **App** in Tree view.
2. Set **StartScreen** property:

```powerfx
scrHome
```

> This makes the Home screen the landing page students see when they open the app.

---

# STEP 13: Publishing the App

**What you're doing:** Saving and publishing the app so students can use it.

### Instructions

1. **Save your work**
   - Click **File** in the top-left corner (or press `Ctrl + S`)
   - Click **Save**
   - Wait for "All changes saved" message

2. **Publish the app**
   - Still in the File menu, click **Publish**
   - Click **Publish this version**
   - Wait for confirmation

3. **Get the shareable link**
   - Click **Share**
   - Click **Copy link** to get the direct app URL
   - The link format: `https://apps.powerapps.com/play/e/[environment]/a/[app-id]`

### Share Settings

4. In the Share panel:
   - Under "Enter a name, email address, or Everyone", type `Everyone`
   - Select **Everyone** from the dropdown
   - Ensure **User** permission is selected (not Co-owner)
   - Click **Share**

> 💡 **Tip:** This allows any LSU Microsoft 365 user to access the app. They'll still only see their own requests due to the filter in the gallery.

---

# STEP 14: Testing the App

**What you're doing:** Verifying all functionality works correctly.

### Test 1: Home Screen (Landing)

1. Open the app in preview (F5) or via the published link
2. Verify:
   - [ ] Home screen appears as the landing page
   - [ ] Welcome message shows your name ("Welcome, [Your Name]!")
   - [ ] Two cards are visible: "Submit New Request" and "My Requests"
   - [ ] "OR" divider appears between cards
3. Click "GET STARTED" button
4. Verify:
   - [ ] Navigates to Submit Request screen
5. Use navigation to return to Home, then click "VIEW REQUESTS"
6. Verify:
   - [ ] Navigates to My Requests screen

### Test 2: Submit Request Flow

1. From Home screen, click "GET STARTED"
2. Verify auto-filled fields:
   - [ ] Student Name shows your name
   - [ ] Student Email shows your email
3. Fill in required fields:
   - [ ] Tiger Card Number
   - [ ] Discipline
   - [ ] Project Type
   - [ ] Due Date
   - [ ] Method (select Filament or Resin)
   - [ ] Printer (verify cascading filter works)
   - [ ] Color (verify cascading filter works)
4. Click Submit
5. Verify:
   - [ ] Success message appears
   - [ ] Navigates to My Requests
   - [ ] New request appears in gallery

### Test 3: My Requests Gallery

1. Navigate to My Requests screen
2. Verify:
   - [ ] Your request appears with correct details
   - [ ] Status badge shows "Uploaded"
   - [ ] Cancel button is visible
3. Click Refresh button
4. Verify list refreshes

### Test 4: Cancel Request

1. Click "Cancel Request" on an Uploaded request
2. Verify:
   - [ ] Modal appears with warning
   - [ ] Click "No, Keep Request" → modal closes
   - [ ] Click "Yes, Cancel Request" → request status changes to Canceled

### Test 5: Estimate Confirmation

1. Have a staff member set estimates on your request and change status to "Pending"
2. Refresh My Requests
3. Verify:
   - [ ] Request shows estimated cost
   - [ ] Green "CONFIRM ESTIMATE" button appears
4. Click the button
5. Verify:
   - [ ] Modal shows estimate details
   - [ ] Click "I CONFIRM" → StudentConfirmed becomes true
   - [ ] Flow B should automatically change status to "Ready to Print"

### Test 6: Different Status States

Have staff move a request through different statuses and verify:
- [ ] Ready to Print: Shows "in queue" message
- [ ] Printing: Shows "in progress" message
- [ ] Completed: Shows pickup instructions
- [ ] Paid & Picked Up: Shows completion date

---

# STEP 15: Embedding in SharePoint

**What you're doing:** Adding the app to your SharePoint student portal pages.

### Get the App Web Link

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Find **Student Portal** in your apps
3. Click the **...** menu → **Details**
4. Copy the **Web link** (looks like: `https://apps.powerapps.com/play/e/.../a/...`)

### Embed on Submit Request Page

1. Go to your SharePoint site
2. Navigate to the **Submit Request** page (or create one)
3. Edit the page
4. Click **+** → **Power Apps**
5. Paste the app web link
6. Set dimensions: Width `100%`, Height `900px`
7. Republish the page

### Embed on My Print Requests Page

1. Navigate to the **My Print Requests** page
2. Edit the page
3. Remove the existing List web part (if present)
4. Click **+** → **Power Apps**
5. Paste the same app web link
6. Add `?source=myrequests` to the URL to deep-link (optional)
7. Set dimensions: Width `100%`, Height `900px`
8. Republish the page

### Alternative: Use Power Apps Button

For a simpler embed:

1. Edit the SharePoint page
2. Click **+** → **Button**
3. Set:
   - Label: `Open Student Portal`
   - Link: [Your app web link]
4. Style the button to match your site

---

# Troubleshooting

## Problem: "User not found" or empty gallery

**Cause:** Email comparison is case-sensitive.

**Solution:** Ensure you're using `Lower()` for email comparisons:
```powerfx
Lower(Student.Email) = varMeEmail
```

And in OnStart:
```powerfx
Set(varMeEmail, Lower(User().Email))
```

---

## Problem: Cascading dropdowns not filtering

**Cause:** Formula references wrong control name.

**Solution:** Verify the Method dropdown is named `ddMethod` and update the Printer/Color Items formulas to reference it correctly.

---

## Problem: Patch fails with Person field

**Cause:** Person field requires specific format.

**Solution:** Use this format:
```powerfx
Student: {
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    DisplayName: varMeName,
    Claims: "i:0#.f|membership|" & varMeEmail,
    Email: varMeEmail
}
```

---

## Problem: Status badge colors not showing

**Cause:** `varStatusColors` not initialized.

**Solution:** Ensure App.OnStart runs before using the app. Click the **...** next to App → **Run OnStart**.

---

## Problem: Can't see requests after submitting

**Cause:** Gallery filter doesn't match or data hasn't refreshed.

**Solution:**
1. Add `Refresh(PrintRequests)` after the Patch in submit button
2. Verify the filter uses the correct email comparison

---

## Problem: Modal doesn't appear

**Cause:** Container visibility not set correctly or z-order issue.

**Solution:**
1. Verify container Visible property: `varShowConfirmModal > 0`
2. Ensure container is above the gallery in Tree view (higher = in front)

---

## Problem: Form fields don't reset after submit

**Cause:** Reset functions not included in OnSelect.

**Solution:** Add Reset() for each field after the Patch:
```powerfx
Reset(txtTigerCard);
Reset(ddDiscipline);
// ... etc
```

---

## Problem: Student reports submission failed

**What the student sees:** "Something went wrong. Please try again or ask staff for help."

**Staff troubleshooting steps:**

1. **Check SharePoint list permissions** — Student needs Contribute access to PrintRequests
2. **Verify list columns exist** — All required columns must be present in SharePoint
3. **Check network/browser** — Have student refresh the page and try again
4. **Review browser console** — Press F12 → Console tab for technical errors

**For debugging**, you can temporarily change `frmSubmit.OnFailure` to show the technical error:
```powerfx
// TEMPORARY - for debugging only
Notify("Debug: " & frmSubmit.Error, NotificationType.Error)
```

---

# Quick Reference Card

## Key Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `varMeEmail` | Text | Current user's email (lowercase) |
| `varMeName` | Text | Current user's display name |
| `varShowConfirmModal` | Number | ID of item for confirmation (0=hidden) |
| `varShowCancelModal` | Number | ID of item for cancellation (0=hidden) |
| `varSelectedItem` | Record | Currently selected PrintRequest item |
| `varStatusColors` | Table | Status → Color mapping |

## Screen Navigation

| From | To | Formula |
|------|-----|---------|
| scrHome | scrSubmit | `Navigate(scrSubmit, ScreenTransition.Fade)` |
| scrHome | scrMyRequests | `Navigate(scrMyRequests, ScreenTransition.Fade)` |
| scrSubmit | scrHome | `Navigate(scrHome, ScreenTransition.Fade)` |
| scrSubmit | scrMyRequests | `Navigate(scrMyRequests, ScreenTransition.Fade)` |
| scrMyRequests | scrHome | `Navigate(scrHome, ScreenTransition.Fade)` |
| scrMyRequests | scrSubmit | `Navigate(scrSubmit, ScreenTransition.Fade)` |

## Status Actions Available

| Status | Student Actions |
|--------|----------------|
| Uploaded | Cancel Request |
| Pending | Confirm Estimate, Cancel Request |
| Ready to Print | Cancel Request |
| Printing | View only |
| Completed | View only (pickup info shown) |
| Paid & Picked Up | View only |
| Rejected | View only (reason shown) |

## Filter Formulas

**My Requests Gallery:**
```powerfx
Filter(PrintRequests, Lower(Student.Email) = varMeEmail)
```

**Printer by Method:**
```powerfx
Filter(
    Choices(PrintRequests.Printer),
    If(ddMethod.Selected.Value = "Filament", Value in [...], ddMethod.Selected.Value = "Resin", Value = "Form 3...", true)
)
```

---

# Code Reference (Copy-Paste Snippets)

## App.OnStart

```powerfx
// === USER IDENTIFICATION ===
Set(varMeEmail, Lower(User().Email));
Set(varMeName, User().FullName);

// === UI STATE ===
Set(varCurrentScreen, "Home");
Set(varShowConfirmModal, 0);
Set(varShowCancelModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));  // Typed blank
Set(varFormSubmitted, false);
Set(varSubmitAttempted, false);  // For validation message display
Set(varIsLoading, false);

// === PRICING ===
Set(varFilamentRate, 0.10);
Set(varResinRate, 0.20);
Set(varMinimumCost, 3.00);

// === STYLING ===
Set(varAppFont, Font.'Open Sans');

// === STATUS COLORS ===
Set(varStatusColors, Table(
    {Status: "Uploaded", Color: RGBA(70, 130, 220, 1)},
    {Status: "Pending", Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Color: RGBA(16, 124, 16, 1)},
    {Status: "Printing", Color: RGBA(107, 105, 214, 1)},
    {Status: "Completed", Color: RGBA(0, 78, 140, 1)},
    {Status: "Paid & Picked Up", Color: RGBA(0, 158, 73, 1)},
    {Status: "Rejected", Color: RGBA(209, 52, 56, 1)},
    {Status: "Canceled", Color: RGBA(138, 136, 134, 1)},
    {Status: "Archived", Color: RGBA(96, 94, 92, 1)}
))
```

## Submit Button OnSelect

```powerfx
Set(varIsLoading, true);

Patch(
    PrintRequests,
    Defaults(PrintRequests),
    {
        Title: varMeName & "_" & ddMethod.Selected.Value & "_" & ddColor.Selected.Value,
        Student: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            DisplayName: varMeName,
            Claims: "i:0#.f|membership|" & varMeEmail,
            Email: varMeEmail
        },
        StudentEmail: varMeEmail,
        TigerCardNumber: txtTigerCard.Text,
        'Course Number': txtCourse.Text,
        Discipline: ddDiscipline.Selected,
        ProjectType: ddProjectType.Selected,
        Method: ddMethod.Selected,
        Printer: ddPrinter.Selected,
        Color: ddColor.Selected,
        DueDate: dpDueDate.SelectedDate,
        Notes: txtNotes.Text,
        Status: {Value: "Uploaded"}
    }
);

Set(varIsLoading, false);
Notify("Request submitted successfully!", NotificationType.Success);

Reset(txtTigerCard);
Reset(txtCourse);
Reset(ddDiscipline);
Reset(ddProjectType);
Reset(ddMethod);
Reset(ddPrinter);
Reset(ddColor);
Reset(dpDueDate);
Reset(txtNotes);

Navigate(scrMyRequests, ScreenTransition.Fade)
```

## Form OnFailure (Simple Error Message)

```powerfx
Set(varIsLoading, false);
Notify(
    "Something went wrong. Please try again or ask staff for help.",
    NotificationType.Error,
    5000
)
```

## Validation Message Text

```powerfx
"Please fill in all required fields before submitting."
```

## File Warning Label Text (lblFileWarning)

```powerfx
"IMPORTANT: File Naming Requirement

Your files MUST be named: FirstLast_Method_Color

Examples:
  - JaneDoe_Filament_Blue.stl
  - MikeSmith_Resin_Clear.3mf

Accepted formats: .stl, .obj, .3mf, .idea, .form

Files not following this format will be rejected."
```

## My Requests Gallery Items

```powerfx
SortByColumns(
    Filter(
        PrintRequests,
        Lower(Student.Email) = varMeEmail
    ),
    "Created",
    SortOrder.Descending
)
```

## Confirm Estimate OnSelect

```powerfx
Patch(
    PrintRequests,
    LookUp(PrintRequests, ID = varShowConfirmModal),
    {StudentConfirmed: true}
);

Set(varShowConfirmModal, 0);
Set(varSelectedItem, Blank());
Notify("Estimate confirmed! Your print is now in the queue.", NotificationType.Success);
Refresh(PrintRequests)
```

## Cancel Request OnSelect

```powerfx
Patch(
    PrintRequests,
    LookUp(PrintRequests, ID = varShowCancelModal),
    {
        Status: {Value: "Canceled"},
        LastAction: {Value: "Canceled by Student"},
        Notes: "Canceled by student before printing."
    }
);

Set(varShowCancelModal, 0);
Set(varSelectedItem, Blank());
Notify("Request canceled successfully.", NotificationType.Information);
Refresh(PrintRequests)
```

## Printer Cascading Filter

```powerfx
Filter(
    Choices(PrintRequests.Printer),
    If(
        ddMethod.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        ddMethod.Selected.Value = "Resin",
        Value = "Form 3 (5.7×5.7×7.3in)",
        true
    )
)
```

## Color Cascading Filter

```powerfx
Filter(
    Choices(PrintRequests.Color),
    Or(
        ddMethod.Selected.Value <> "Resin",
        Value = "Black",
        Value = "White",
        Value = "Gray",
        Value = "Clear"
    )
)
```

## Status Badge Fill

```powerfx
LookUp(varStatusColors, Status = ThisItem.Status.Value, Color)
```

## Status Badge Color (Text)

```powerfx
If(ThisItem.Status.Value = "Pending", Color.Black, Color.White)
```

---

# Reference: File Naming Convention

## Naming Format

**Required format:** `FirstLast_Method_Color.extension`

| Component | Description | Example |
|-----------|-------------|---------|
| FirstLast | Student's first and last name (no spaces) | `JaneDoe` |
| Method | Print method selected | `Filament` or `Resin` |
| Color | Filament/resin color selected | `Blue`, `Clear`, `Black` |
| extension | One of the accepted file formats | `.stl`, `.3mf` |

## Accepted File Formats

| Extension | Description |
|-----------|-------------|
| `.stl` | Standard mesh format (most common) |
| `.obj` | Object file format |
| `.3mf` | 3D Manufacturing Format |
| `.idea` | PrusaSlicer project file |
| `.form` | Formlabs project file |

## Valid Filenames

| Filename | Why It's Valid |
|----------|----------------|
| `JaneDoe_Filament_Blue.stl` | Correct format |
| `MikeSmith_Resin_Clear.3mf` | Correct format |
| `SarahOConnor_Filament_Red.obj` | Correct format |
| `PatrickOBrien_Filament_Black.idea` | PrusaSlicer project file |
| `MaryJane_Resin_Clear.form` | Formlabs project file |

## Invalid Filenames

| Filename | Why It's Invalid |
|----------|------------------|
| `model.stl` | Missing student name, method, color |
| `JaneDoe.stl` | Missing method and color |
| `JaneDoe_Blue.stl` | Missing method |
| `Jane Doe_Filament_Blue.stl` | Spaces in name (use `JaneDoe`) |
| `project.pdf` | Invalid file type |

> **Note:** Flow A validates file types after submission. Files with invalid extensions will be flagged for staff review.

---

# Next Steps

After your Student Portal app is working:

1. ✅ Test the full submission → confirmation → pickup flow
2. ✅ Share the app link with students or embed on SharePoint
3. ✅ Train staff on how student confirmations work
4. 🎯 Consider adding push notifications (future enhancement)

---

**💡 Pro Tips:**

- **Always test in Preview mode** (press F5 in Power Apps) before publishing
- **After making changes, always Save and Publish**
- **If something breaks**, you can always revert to a previous version
- **Back up your work** by taking screenshots of complex formulas
- **Test with a real student account** to ensure filters work correctly

> **Official Microsoft Docs:** [Create a canvas app from scratch](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/create-blank-canvas-app)
