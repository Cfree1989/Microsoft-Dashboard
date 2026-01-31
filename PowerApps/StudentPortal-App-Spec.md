# Student Print Portal — Canvas App (Phone)

**⏱️ Time Required:** 6-8 hours (can be done in multiple sessions)  
**🎯 Goal:** Students can submit 3D print requests and track their submissions through an intuitive mobile-friendly app

> 📚 **This is the comprehensive guide** — includes step-by-step build instructions, code references, and quick-copy snippets.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Design Standards](#design-standards) ← **Font & Color Reference**
3. [Creating the Canvas App](#step-1-creating-the-canvas-app)
4. [Adding Data Connections](#step-2-adding-data-connections)
5. [Setting Up App.OnStart](#step-3-setting-up-apponstart)
6. [Understanding Where Things Go](#understanding-where-things-go-read-this) ← **READ THIS FIRST!**
7. [Building Screen 1: Submit Request](#step-4-building-screen-1-submit-request)
8. [Building the Submit Form](#step-5-building-the-submit-form)
9. [Adding Cascading Dropdowns](#step-6-adding-cascading-dropdowns)
10. [Adding File Attachments](#step-7-adding-file-attachments)
11. [Building Screen 2: My Requests](#step-8-building-screen-2-my-requests)
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

This app follows consistent design patterns for a professional appearance that matches the Staff Dashboard and LSU branding.

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| App Title | `Font.'Segoe UI'` | 20 | Semibold |
| Screen Headers | `Font.'Segoe UI'` | 18 | Semibold |
| Section Headers | `Font.'Segoe UI'` | 14 | Semibold |
| Body Text | `Font.'Segoe UI'` | 12 | Normal |
| Labels/Hints | `Font.'Segoe UI'` | 10 | Normal |
| Buttons | `Font.'Segoe UI'` | 12-14 | Semibold |

> ⚠️ **Consistency Rule:** Always use `Font.'Segoe UI'` throughout the app. This matches the Microsoft design language and LSU's professional standards.

### Color Palette

| Purpose | Color | RGBA |
|---------|-------|------|
| Primary (LSU Purple) | Purple | `RGBA(70, 29, 124, 1)` |
| Secondary (LSU Gold) | Gold | `RGBA(253, 208, 35, 1)` |
| Success | Green | `RGBA(16, 124, 16, 1)` |
| Warning | Amber | `RGBA(255, 185, 0, 1)` |
| Error/Danger | Red | `RGBA(209, 52, 56, 1)` |
| Info | Blue | `RGBA(70, 130, 220, 1)` |
| Header Background | LSU Purple | `RGBA(70, 29, 124, 1)` |
| Modal Overlay | Black 70% | `RGBA(0, 0, 0, 0.7)` |
| Card Background | White | `Color.White` |
| Muted Text | Gray | `RGBA(100, 100, 100, 1)` |
| Screen Background | Light Gray | `RGBA(248, 248, 248, 1)` |

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
| Archived | Gray | `RGBA(96, 94, 92, 1)` |

### Button Styles

| Type | Fill | Color | Border |
|------|------|-------|--------|
| Primary Action | LSU Purple | White | None |
| Success Action | Green | White | None |
| Danger Action | Red | White | None |
| Secondary/Outline | White | Purple | Purple, 1px |
| Navigation (Active) | LSU Purple | White | None |
| Navigation (Inactive) | Light Gray | Dark Gray | None |

### Corner Radius Standards

| Element Type | Radius | Examples |
|--------------|--------|----------|
| Cards & Modals | `8` | Request cards, confirmation modals |
| Primary Buttons | `6` | Submit, Confirm buttons |
| Input Fields | `4` | Text inputs, dropdowns |
| Status Badges | `12` | Rounded pill badges |

### Layout Dimensions (Phone Format)

| Element | Width | Height | Notes |
|---------|-------|--------|-------|
| Screen | `640` | `1136` | Phone portrait layout |
| Header Bar | `Parent.Width` | `80` | Fixed at top |
| Navigation Bar | `Parent.Width` | `70` | Fixed at bottom |
| Content Area | `Parent.Width` | `Parent.Height - 150` | Between header and nav |
| Form Fields | `Parent.Width - 40` | `50` | With 20px side margins |
| Cards | `Parent.Width - 32` | Variable | With 16px side margins |

---

# STEP 1: Creating the Canvas App

**What you're doing:** Creating a new Canvas app with a Phone layout, which gives you a mobile-friendly interface perfect for students on the go.

### Instructions

1. Open **Power Apps** in your browser: [make.powerapps.com](https://make.powerapps.com)
2. Make sure you're in the correct **Environment** (top right dropdown — should show "Louisiana State Universi...").
3. In the left navigation, click **+ Create**.
4. Under "Create your apps", click **Start with a blank canvas**.
5. In the popup "Start with a blank canvas", click **Phone size** (left option).
6. Enter these settings:
   - **App name:** `Student Print Portal`
7. Click **Create**.

> 💡 **Tip:** Phone format creates a mobile-friendly vertical canvas—perfect for students accessing from their phones. It also works well embedded on SharePoint pages.

> 📝 **Naming alternatives:** You can also use `3D Print Request Portal`, `FabLab Student Portal`, or any name that fits your lab.

### What You Should See

- The Power Apps Studio editor opens
- A blank white screen appears in the center (taller than wide)
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
Set(varCurrentScreen, "Submit");

// === MODAL CONTROLS ===
// These control which modal is visible (0 = hidden, ID = visible for that item)
Set(varShowConfirmModal, 0);
Set(varShowCancelModal, 0);

// Currently selected item for modals
Set(varSelectedItem, Blank());

// === FORM STATE ===
// Track if form has been submitted successfully
Set(varFormSubmitted, false);

// === LOADING STATE ===
Set(varIsLoading, false);

// === PRICING CONFIGURATION ===
// For display purposes (estimates shown to students)
Set(varFilamentRate, 0.10);
Set(varResinRate, 0.20);
Set(varMinimumCost, 3.00);

// === STYLING / THEMING ===
Set(varAppFont, Font.'Segoe UI');

// === STATUS COLORS ===
// Consistent with Staff Dashboard
Set(varStatusColors, Table(
    {Status: "Uploaded", Color: RGBA(70, 130, 220, 1)},
    {Status: "Pending", Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Color: RGBA(16, 124, 16, 1)},
    {Status: "Printing", Color: RGBA(107, 105, 214, 1)},
    {Status: "Completed", Color: RGBA(0, 78, 140, 1)},
    {Status: "Paid & Picked Up", Color: RGBA(0, 158, 73, 1)},
    {Status: "Rejected", Color: RGBA(209, 52, 56, 1)},
    {Status: "Archived", Color: RGBA(96, 94, 92, 1)}
))
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
| `varCurrentScreen` | Currently active screen | Text |
| `varShowConfirmModal` | ID of item for estimate confirmation (0=hidden) | Number |
| `varShowCancelModal` | ID of item for cancel confirmation (0=hidden) | Number |
| `varSelectedItem` | Item currently selected for modal | PrintRequests Record |
| `varFormSubmitted` | Track successful form submission | Boolean |
| `varIsLoading` | Shows loading state during operations | Boolean |
| `varStatusColors` | Status-to-color mapping table | Table |
| `varAppFont` | Global font for consistent styling | Font |

---

## Understanding Where Things Go (READ THIS!)

Before you start building the UI, understand the structure of the app:

### App Structure

```
▼ App
▼ scrSubmit                     ← Screen 1: Submit Request Form
    recHeaderSubmit             ← Purple header bar
    lblHeaderSubmit             ← "Submit Request" title
    scrollSubmitForm            ← Scrollable container for form
        ... form fields ...
    recNavBar                   ← Bottom navigation bar
    btnNavSubmit                ← "Submit" nav button (active)
    btnNavMyRequests            ← "My Requests" nav button

▼ scrMyRequests                 ← Screen 2: My Requests List
    ▼ conConfirmModal           ← Estimate confirmation modal
        ... modal controls ...
    ▼ conCancelModal            ← Cancel request modal
        ... modal controls ...
    recHeaderRequests           ← Purple header bar
    lblHeaderRequests           ← "My Requests" title
    btnRefresh                  ← Refresh button
    galMyRequests               ← Gallery of user's requests
        ... card template ...
    lblEmptyState               ← "No requests" message
    recNavBar2                  ← Bottom navigation bar
    btnNavSubmit2               ← "Submit" nav button
    btnNavMyRequests2           ← "My Requests" nav button (active)
```

### Naming Convention

We use **prefixes** to identify control types at a glance:

| Prefix | Control Type | Example |
|--------|-------------|---------|
| `scr` | Screen | `scrSubmit`, `scrMyRequests` |
| `rec` | Rectangle | `recHeaderSubmit` |
| `lbl` | Label | `lblHeaderSubmit` |
| `btn` | Button | `btnSubmit` |
| `gal` | Gallery | `galMyRequests` |
| `txt` | Text Input | `txtTigerCard` |
| `dd` | Dropdown/ComboBox | `ddMethod` |
| `dp` | Date Picker | `dpDueDate` |
| `con` | Container | `conConfirmModal` |
| `ico` | Icon | `icoStatus` |
| `att` | Attachments | `attFiles` |

### Key Rules

| Rule | Explanation |
|------|-------------|
| **App = formulas only** | Only put formulas like `OnStart` here. Never visual elements. |
| **Screens = all visuals** | All rectangles, labels, buttons, galleries go in screens. |
| **Modals use Containers** | Each modal is wrapped in a Container control — set Visible on container only! |
| **Galleries are special** | If you select a gallery and then Insert, the new control goes INSIDE that gallery's template. |
| **Rename immediately** | After adding a control, rename it right away (click name in Tree view). |

> 💡 **How to rename:** In the Tree view, double-click the control name (or click once and press F2) to edit it.

---

# STEP 4: Building Screen 1: Submit Request

**What you're doing:** Creating the first screen where students fill out and submit their 3D print requests.

### First: Rename the Screen

1. **In the Tree view, double-click on `Screen1`** to rename it.
2. Type `scrSubmit` and press **Enter**.

### Set Screen Background

3. With `scrSubmit` selected, set these properties:
   - **Fill:** `RGBA(248, 248, 248, 1)`

### Creating the Header Bar (recHeaderSubmit)

4. With `scrSubmit` selected, click **+ Insert** → **Rectangle**.
5. **Rename it:** `recHeaderSubmit`
6. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `80` |
| Fill | `RGBA(70, 29, 124, 1)` |

> This creates an LSU Purple header bar.

### Adding the Header Title (lblHeaderSubmit)

7. Click **+ Insert** → **Text label**.
8. **Rename it:** `lblHeaderSubmit`
9. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Submit 3D Print Request"` |
| X | `20` |
| Y | `30` |
| Width | `Parent.Width - 40` |
| Height | `40` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `Color.White` |

### Creating the Bottom Navigation Bar

10. Click **+ Insert** → **Rectangle**.
11. **Rename it:** `recNavBar`
12. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `Parent.Height - 70` |
| Width | `Parent.Width` |
| Height | `70` |
| Fill | `Color.White` |
| BorderColor | `RGBA(220, 220, 220, 1)` |
| BorderThickness | `1` |

### Adding Navigation Button: Submit (Active)

13. Click **+ Insert** → **Button**.
14. **Rename it:** `btnNavSubmit`
15. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"📝 Submit"` |
| X | `20` |
| Y | `Parent.Height - 60` |
| Width | `(Parent.Width - 60) / 2` |
| Height | `50` |
| Fill | `RGBA(70, 29, 124, 1)` |
| Color | `Color.White` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

16. Set **OnSelect:**

```powerfx
// Already on this screen
```

### Adding Navigation Button: My Requests

17. Click **+ Insert** → **Button**.
18. **Rename it:** `btnNavMyRequests`
19. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"📋 My Requests"` |
| X | `(Parent.Width - 60) / 2 + 40` |
| Y | `Parent.Height - 60` |
| Width | `(Parent.Width - 60) / 2` |
| Height | `50` |
| Fill | `RGBA(240, 240, 240, 1)` |
| Color | `RGBA(70, 29, 124, 1)` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

20. Set **OnSelect:**

```powerfx
Navigate(scrMyRequests, ScreenTransition.Fade)
```

### ✅ Step 4 Checklist

Your Tree view should now look like:

```
▼ App
▼ scrSubmit
    recHeaderSubmit
    lblHeaderSubmit
    recNavBar
    btnNavSubmit
    btnNavMyRequests
```

---

# STEP 5: Building the Submit Form

**What you're doing:** Adding all the form fields for students to fill out their print request.

### Add a Vertical Container for the Form

1. With `scrSubmit` selected, click **+ Insert** → **Layout** → **Vertical container**.
2. **Rename it:** `conSubmitForm`
3. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `80` |
| Width | `Parent.Width` |
| Height | `Parent.Height - 150` |
| Fill | `RGBA(248, 248, 248, 1)` |
| PaddingLeft | `20` |
| PaddingRight | `20` |
| PaddingTop | `20` |
| PaddingBottom | `20` |
| Gap | `12` |
| VerticalOverflow | `LayoutOverflow.Scroll` |

> 💡 **Why a container?** This creates a scrollable area so all form fields fit on any screen size.

---

### Student Information Section

#### Section Header

4. With `conSubmitForm` selected, click **+ Insert** → **Text label**.
5. **Rename it:** `lblSectionStudent`
6. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Student Information"` |
| Width | `Parent.Width - 40` |
| Height | `30` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Color | `RGBA(70, 29, 124, 1)` |

#### Student Name (Auto-filled, Read-only)

7. Click **+ Insert** → **Text label**.
8. **Rename it:** `lblStudentNameLabel`
9. Set: **Text:** `"Student Name"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

10. Click **+ Insert** → **Text input**.
11. **Rename it:** `txtStudentName`
12. Set these properties:

| Property | Value |
|----------|-------|
| Default | `varMeName` |
| Width | `Parent.Width - 40` |
| Height | `45` |
| DisplayMode | `DisplayMode.View` |
| Fill | `RGBA(240, 240, 240, 1)` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

#### Student Email (Auto-filled, Read-only)

13. Click **+ Insert** → **Text label**.
14. **Rename it:** `lblStudentEmailLabel`
15. Set: **Text:** `"Student Email"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

16. Click **+ Insert** → **Text input**.
17. **Rename it:** `txtStudentEmail`
18. Set these properties:

| Property | Value |
|----------|-------|
| Default | `varMeEmail` |
| Width | `Parent.Width - 40` |
| Height | `45` |
| DisplayMode | `DisplayMode.View` |
| Fill | `RGBA(240, 240, 240, 1)` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

#### Tiger Card Number (Required)

19. Click **+ Insert** → **Text label**.
20. **Rename it:** `lblTigerCardLabel`
21. Set: **Text:** `"Tiger Card Number (16-digit POS) *"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

22. Click **+ Insert** → **Text input**.
23. **Rename it:** `txtTigerCard`
24. Set these properties:

| Property | Value |
|----------|-------|
| Default | `""` |
| HintText | `"16-digit number from your Tiger Card"` |
| Width | `Parent.Width - 40` |
| Height | `45` |
| Mode | `TextMode.SingleLine` |
| Format | `TextFormat.Text` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| FocusedBorderColor | `RGBA(70, 29, 124, 1)` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

25. Click **+ Insert** → **Text label**.
26. **Rename it:** `lblTigerCardHint`
27. Set: **Text:** `"This is the 16-digit POS number, NOT your 89-number LSUID"`, **Height:** `18`, **Size:** `9`, **Color:** `RGBA(150, 150, 150, 1)`

---

### Project Details Section

#### Section Header

28. Click **+ Insert** → **Text label**.
29. **Rename it:** `lblSectionProject`
30. Set: **Text:** `"Project Details"`, **Height:** `30`, **Size:** `14`, **FontWeight:** `FontWeight.Semibold`, **Color:** `RGBA(70, 29, 124, 1)`

#### Course Number (Optional)

31. Click **+ Insert** → **Text label**.
32. **Rename it:** `lblCourseLabel`
33. Set: **Text:** `"Course Number (optional)"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

34. Click **+ Insert** → **Text input**.
35. **Rename it:** `txtCourse`
36. Set these properties:

| Property | Value |
|----------|-------|
| Default | `""` |
| HintText | `"e.g., ART 2000, ME 4201"` |
| Width | `Parent.Width - 40` |
| Height | `45` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| FocusedBorderColor | `RGBA(70, 29, 124, 1)` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

#### Discipline (Dropdown)

37. Click **+ Insert** → **Text label**.
38. **Rename it:** `lblDisciplineLabel`
39. Set: **Text:** `"Discipline *"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

40. Click **+ Insert** → **Drop down**.
41. **Rename it:** `ddDiscipline`
42. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices(PrintRequests.Discipline)` |
| Width | `Parent.Width - 40` |
| Height | `45` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| ChevronBackground | `RGBA(70, 29, 124, 1)` |
| ChevronFill | `Color.White` |

#### Project Type (Dropdown)

43. Click **+ Insert** → **Text label**.
44. **Rename it:** `lblProjectTypeLabel`
45. Set: **Text:** `"Project Type *"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

46. Click **+ Insert** → **Drop down**.
47. **Rename it:** `ddProjectType`
48. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices(PrintRequests.ProjectType)` |
| Width | `Parent.Width - 40` |
| Height | `45` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| ChevronBackground | `RGBA(70, 29, 124, 1)` |
| ChevronFill | `Color.White` |

#### Due Date

49. Click **+ Insert** → **Text label**.
50. **Rename it:** `lblDueDateLabel`
51. Set: **Text:** `"Due Date *"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

52. Click **+ Insert** → **Date picker**.
53. **Rename it:** `dpDueDate`
54. Set these properties:

| Property | Value |
|----------|-------|
| DefaultDate | `Today()` |
| Width | `Parent.Width - 40` |
| Height | `45` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| IconFill | `RGBA(70, 29, 124, 1)` |

---

### Print Configuration Section

#### Section Header

55. Click **+ Insert** → **Text label**.
56. **Rename it:** `lblSectionPrint`
57. Set: **Text:** `"Print Configuration"`, **Height:** `30`, **Size:** `14`, **FontWeight:** `FontWeight.Semibold`, **Color:** `RGBA(70, 29, 124, 1)`

#### Method (Dropdown) — Controls other dropdowns

58. Click **+ Insert** → **Text label**.
59. **Rename it:** `lblMethodLabel`
60. Set: **Text:** `"Print Method *"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

61. Click **+ Insert** → **Drop down**.
62. **Rename it:** `ddMethod`
63. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices(PrintRequests.Method)` |
| Width | `Parent.Width - 40` |
| Height | `45` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| ChevronBackground | `RGBA(70, 29, 124, 1)` |
| ChevronFill | `Color.White` |

---

# STEP 6: Adding Cascading Dropdowns

**What you're doing:** Setting up Printer and Color dropdowns that filter based on the selected Method.

### Printer (Cascading Dropdown)

1. With `conSubmitForm` still selected, click **+ Insert** → **Text label**.
2. **Rename it:** `lblPrinterLabel`
3. Set: **Text:** `"Printer *"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

4. Click **+ Insert** → **Drop down**.
5. **Rename it:** `ddPrinter`
6. Set these properties:

| Property | Value |
|----------|-------|
| Width | `Parent.Width - 40` |
| Height | `45` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| ChevronBackground | `RGBA(70, 29, 124, 1)` |
| ChevronFill | `Color.White` |

7. Set the **Items** property (cascading filter):

**⬇️ FORMULA: Paste into ddPrinter Items**

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

> 💡 **How it works:** 
> - Filament → Shows Prusa MK4S, Prusa XL, Raised3D
> - Resin → Shows Form 3 only

8. Click **+ Insert** → **Text label**.
9. **Rename it:** `lblPrinterHint`
10. Set: **Text:** `"Build dimensions shown in parentheses (W×D×H)"`, **Height:** `18`, **Size:** `9`, **Color:** `RGBA(150, 150, 150, 1)`

### Color (Cascading Dropdown)

11. Click **+ Insert** → **Text label**.
12. **Rename it:** `lblColorLabel`
13. Set: **Text:** `"Color *"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

14. Click **+ Insert** → **Drop down**.
15. **Rename it:** `ddColor`
16. Set these properties:

| Property | Value |
|----------|-------|
| Width | `Parent.Width - 40` |
| Height | `45` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| ChevronBackground | `RGBA(70, 29, 124, 1)` |
| ChevronFill | `Color.White` |

17. Set the **Items** property (cascading filter):

**⬇️ FORMULA: Paste into ddColor Items**

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

> 💡 **How it works:**
> - Filament → All colors available
> - Resin → Only Black, White, Gray, Clear (resin-compatible colors)

---

### Notes Field

18. Click **+ Insert** → **Text label**.
19. **Rename it:** `lblNotesLabel`
20. Set: **Text:** `"Additional Notes (optional)"`, **Height:** `20`, **Size:** `11`, **Color:** `RGBA(100, 100, 100, 1)`

21. Click **+ Insert** → **Text input**.
22. **Rename it:** `txtNotes`
23. Set these properties:

| Property | Value |
|----------|-------|
| Default | `""` |
| HintText | `"Special instructions, scaling notes, questions..."` |
| Width | `Parent.Width - 40` |
| Height | `100` |
| Mode | `TextMode.MultiLine` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| FocusedBorderColor | `RGBA(70, 29, 124, 1)` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

---

# STEP 7: Adding File Attachments

**What you're doing:** Adding the file attachment section with clear instructions.

### File Warning Box

1. Click **+ Insert** → **Text label**.
2. **Rename it:** `lblFileWarning`
3. Set these properties:

| Property | Value |
|----------|-------|
| Width | `Parent.Width - 40` |
| Height | `140` |
| Fill | `RGBA(255, 244, 206, 1)` |
| Color | `RGBA(102, 77, 3, 1)` |
| Font | `Font.'Segoe UI'` |
| Size | `11` |
| PaddingTop | `12` |
| PaddingBottom | `12` |
| PaddingLeft | `12` |
| PaddingRight | `12` |
| BorderColor | `RGBA(255, 185, 0, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

4. Set **Text:**

```powerfx
"IMPORTANT: File Naming Requirement

Your files MUST be named: FirstLast_Method_Color
Example: JaneDoe_Filament_Blue.stl

Accepted formats: .stl, .obj, .3mf, .idea, .form

Files not following this format will be rejected."
```

### Attachments Control

5. Click **+ Insert** → **Input** → **Attachments**.
6. **Rename it:** `attFiles`
7. Set these properties:

| Property | Value |
|----------|-------|
| Width | `Parent.Width - 40` |
| Height | `100` |
| BorderColor | `RGBA(200, 200, 200, 1)` |
| Items | `Blank()` |

> 💡 **Note:** The Attachments control handles file uploads. Files are attached when the form is submitted.

---

### Submit Button

8. Click **+ Insert** → **Button**.
9. **Rename it:** `btnSubmit`
10. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"SUBMIT REQUEST"` |
| Width | `Parent.Width - 40` |
| Height | `55` |
| Fill | `RGBA(70, 29, 124, 1)` |
| Color | `Color.White` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Bold` |
| Size | `16` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |
| HoverFill | `RGBA(90, 49, 144, 1)` |
| PressedFill | `RGBA(50, 19, 104, 1)` |
| DisabledFill | `RGBA(180, 180, 180, 1)` |

11. Set **DisplayMode** (validates required fields):

```powerfx
If(
    IsBlank(txtTigerCard.Text) ||
    IsBlank(ddDiscipline.Selected) ||
    IsBlank(ddProjectType.Selected) ||
    IsBlank(ddMethod.Selected) ||
    IsBlank(ddPrinter.Selected) ||
    IsBlank(ddColor.Selected) ||
    IsBlank(dpDueDate.SelectedDate),
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```

12. Set **OnSelect:**

**⬇️ FORMULA: Paste into btnSubmit OnSelect**

```powerfx
// Show loading
Set(varIsLoading, true);

// Create the print request
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

// Hide loading
Set(varIsLoading, false);

// Show success and navigate
Notify("Request submitted successfully! You'll receive a confirmation email shortly.", NotificationType.Success);

// Reset form fields
Reset(txtTigerCard);
Reset(txtCourse);
Reset(ddDiscipline);
Reset(ddProjectType);
Reset(ddMethod);
Reset(ddPrinter);
Reset(ddColor);
Reset(dpDueDate);
Reset(txtNotes);

// Navigate to My Requests
Navigate(scrMyRequests, ScreenTransition.Fade)
```

> ⚠️ **Note on Attachments:** The basic `Patch` function doesn't handle attachments. For full attachment support, you would need to use a Power Automate flow or the SharePoint form. The current implementation creates the request; students can add files through SharePoint if needed.

---

### Add Spacer at Bottom

13. Click **+ Insert** → **Text label**.
14. **Rename it:** `lblSpacer`
15. Set: **Text:** `""`, **Height:** `100`

> This adds padding at the bottom so content isn't hidden behind the navigation bar when scrolling.

---

# STEP 8: Building Screen 2: My Requests

**What you're doing:** Creating the second screen where students can view and manage their print requests.

### Create the Second Screen

1. In the Tree view, click **+ New screen** → **Blank**.
2. **Rename it:** `scrMyRequests`
3. Set **Fill:** `RGBA(248, 248, 248, 1)`

### Creating the Header Bar

4. Click **+ Insert** → **Rectangle**.
5. **Rename it:** `recHeaderRequests`
6. Set these properties:

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `80` |
| Fill | `RGBA(70, 29, 124, 1)` |

### Header Title

7. Click **+ Insert** → **Text label**.
8. **Rename it:** `lblHeaderRequests`
9. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"My Print Requests"` |
| X | `20` |
| Y | `30` |
| Width | `Parent.Width - 100` |
| Height | `40` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Semibold` |
| Size | `20` |
| Color | `Color.White` |

### Refresh Button

10. Click **+ Insert** → **Button**.
11. **Rename it:** `btnRefresh`
12. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"↻"` |
| X | `Parent.Width - 60` |
| Y | `25` |
| Width | `45` |
| Height | `45` |
| Fill | `RGBA(90, 49, 144, 1)` |
| Color | `Color.White` |
| Size | `20` |
| RadiusTopLeft | `22` |
| RadiusTopRight | `22` |
| RadiusBottomLeft | `22` |
| RadiusBottomRight | `22` |

13. Set **OnSelect:**

```powerfx
Refresh(PrintRequests);
Notify("Requests refreshed!", NotificationType.Information)
```

### Bottom Navigation Bar (Copy from Screen 1)

14-20. Create the navigation bar similar to Screen 1:
- `recNavBar2` — Rectangle at Y: `Parent.Height - 70`
- `btnNavSubmit2` — "📝 Submit" button (inactive style: Fill=`RGBA(240, 240, 240, 1)`, Color=`RGBA(70, 29, 124, 1)`)
- `btnNavMyRequests2` — "📋 My Requests" button (active style: Fill=`RGBA(70, 29, 124, 1)`, Color=`Color.White`)

For `btnNavSubmit2` **OnSelect:**
```powerfx
Navigate(scrSubmit, ScreenTransition.Fade)
```

For `btnNavMyRequests2` **OnSelect:**
```powerfx
// Already on this screen
```

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
| TemplateSize | `200` |

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
| X | `16` |
| Y | `0` |
| Width | `Parent.TemplateWidth - 32` |
| Height | `Parent.TemplateHeight - 8` |
| Fill | `Color.White` |
| BorderColor | `RGBA(220, 220, 220, 1)` |
| BorderThickness | `1` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

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
| Font | `Font.'Segoe UI'` |
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
| Height | `28` |
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
| Color | `RGBA(70, 29, 124, 1)` |
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
| Font | `Font.'Segoe UI'` |
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

#### Action: Cancel Request Button (Uploaded status only)

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
| Visible | `ThisItem.Status.Value = "Uploaded"` |

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
    "Ready to Print", "Your request is in the print queue. You'll be notified when printing starts.",
    "Printing", "Your print is currently in progress!",
    "Completed", "Your print is ready for pickup!\n📍 Room 145 Atkinson Hall\n💳 Payment: TigerCASH only",
    "Paid & Picked Up", "✓ Completed and picked up on " & Text(ThisItem.PaymentDate, "mmm d, yyyy"),
    "Rejected", "❌ Rejected: " & ThisItem.RejectionReason.Value,
    ""
)
```

43. Set **Visible:**

```powerfx
ThisItem.Status.Value in ["Ready to Print", "Printing", "Completed", "Paid & Picked Up", "Rejected"]
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
| RadiusTopLeft | `12` |
| RadiusTopRight | `12` |
| RadiusBottomLeft | `12` |
| RadiusBottomRight | `12` |

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
| Font | `Font.'Segoe UI'` |
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
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Bold` |
| Size | `28` |
| Color | `RGBA(70, 29, 124, 1)` |
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
| X | `recConfirmModal.X + 20` |
| Y | `recConfirmModal.Y + 320` |
| Width | `recConfirmModal.Width - 40` |
| Height | `50` |
| Fill | `RGBA(16, 124, 16, 1)` |
| Color | `Color.White` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

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
| RadiusTopLeft | `12` |
| RadiusTopRight | `12` |
| RadiusBottomLeft | `12` |
| RadiusBottomRight | `12` |

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
| Font | `Font.'Segoe UI'` |
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
| X | `recCancelModal.X + 20` |
| Y | `recCancelModal.Y + 160` |
| Width | `recCancelModal.Width - 40` |
| Height | `45` |
| Fill | `RGBA(209, 52, 56, 1)` |
| Color | `Color.White` |
| Font | `Font.'Segoe UI'` |
| FontWeight | `FontWeight.Bold` |
| Size | `13` |
| RadiusTopLeft | `6` |
| RadiusTopRight | `6` |
| RadiusBottomLeft | `6` |
| RadiusBottomRight | `6` |

21. Set **OnSelect:**

```powerfx
// Update status to Rejected with student cancellation reason
Patch(
    PrintRequests,
    LookUp(PrintRequests, ID = varShowCancelModal),
    {
        Status: {Value: "Rejected"},
        RejectionReason: {Value: "Other"},
        Notes: "Cancelled by student before staff review."
    }
);

// Close modal
Set(varShowCancelModal, 0);
Set(varSelectedItem, Blank());

// Show confirmation
Notify("Request cancelled successfully.", NotificationType.Information);

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

Navigation is already built into each screen (Steps 4 and 8). Just verify:

### Screen Navigation Summary

| Screen | Active Button | Inactive Button Action |
|--------|--------------|----------------------|
| `scrSubmit` | `btnNavSubmit` (purple) | `btnNavMyRequests` → `Navigate(scrMyRequests)` |
| `scrMyRequests` | `btnNavMyRequests2` (purple) | `btnNavSubmit2` → `Navigate(scrSubmit)` |

### Set Default Screen

1. Click on **App** in Tree view.
2. Set **StartScreen** property:

```powerfx
scrSubmit
```

> This makes the Submit screen the first screen students see.

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

### Test 1: Submit Request Flow

1. Open the app in preview (F5) or via the published link
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

### Test 2: My Requests Gallery

1. Navigate to My Requests screen
2. Verify:
   - [ ] Your request appears with correct details
   - [ ] Status badge shows "Uploaded"
   - [ ] Cancel button is visible
3. Click Refresh button
4. Verify list refreshes

### Test 3: Cancel Request

1. Click "Cancel Request" on an Uploaded request
2. Verify:
   - [ ] Modal appears with warning
   - [ ] Click "No, Keep Request" → modal closes
   - [ ] Click "Yes, Cancel Request" → request status changes to Rejected

### Test 4: Estimate Confirmation

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

### Test 5: Different Status States

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
2. Find **Student Print Portal** in your apps
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
| scrSubmit | scrMyRequests | `Navigate(scrMyRequests, ScreenTransition.Fade)` |
| scrMyRequests | scrSubmit | `Navigate(scrSubmit, ScreenTransition.Fade)` |

## Status Actions Available

| Status | Student Actions |
|--------|----------------|
| Uploaded | Cancel Request |
| Pending | Confirm Estimate |
| Ready to Print | View only |
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
Set(varCurrentScreen, "Submit");
Set(varShowConfirmModal, 0);
Set(varShowCancelModal, 0);
Set(varSelectedItem, Blank());
Set(varFormSubmitted, false);
Set(varIsLoading, false);

// === PRICING ===
Set(varFilamentRate, 0.10);
Set(varResinRate, 0.20);
Set(varMinimumCost, 3.00);

// === STYLING ===
Set(varAppFont, Font.'Segoe UI');

// === STATUS COLORS ===
Set(varStatusColors, Table(
    {Status: "Uploaded", Color: RGBA(70, 130, 220, 1)},
    {Status: "Pending", Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Color: RGBA(16, 124, 16, 1)},
    {Status: "Printing", Color: RGBA(107, 105, 214, 1)},
    {Status: "Completed", Color: RGBA(0, 78, 140, 1)},
    {Status: "Paid & Picked Up", Color: RGBA(0, 158, 73, 1)},
    {Status: "Rejected", Color: RGBA(209, 52, 56, 1)},
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
        Status: {Value: "Rejected"},
        RejectionReason: {Value: "Other"},
        Notes: "Cancelled by student before staff review."
    }
);

Set(varShowCancelModal, 0);
Set(varSelectedItem, Blank());
Notify("Request cancelled successfully.", NotificationType.Information);
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
