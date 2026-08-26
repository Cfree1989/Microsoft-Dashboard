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
> - **Lab today card** — Quiet / Typical / Busy / Packed plus waiting and printing counts (from `LabStatus`, not other students’ jobs)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Design Standards](#design-standards) ← **Font & Color Reference**
3. [Creating the Canvas App](#step-1-creating-the-canvas-app)
4. [Adding Data Connections](#step-2-adding-data-connections)
5. [Setting Up App.OnStart](#step-3-setting-up-apponstart)
6. [Understanding Where Things Go](#understanding-where-things-go-read-this) ← **READ THIS FIRST!**
7. [Building Screen 1: Home (Landing)](#step-4-building-screen-1-home-landing) ← Welcome, **Lab today**, action cards
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
22. [Reference: File Requirements](#reference-file-requirements) ← **Accepted formats & size limits**

---

# Prerequisites

Before you start, make sure you have:

- [ ] **SharePoint lists created**: `PrintRequests`, `AuditLog`, `LabStatus` (one row, Title = `Current`)
- [ ] **Power Automate flows working**: Flow A (PR-Create), Flow B (PR-Audit), Flow J (PR-LabStatus)
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

### Live coauthor notes

- **2026-08-26: Home confirm banner after OnStart.** `App.OnStart` still initializes counts to 0 (schema). **Run OnStart does not re-fire `scrHome.OnVisible`**, so the banner stayed hidden until the student left Home and came back. OnStart now `Refresh(PrintRequests)` and recounts at the end. Home OnVisible skips the count until `varMeEmail` / `varMeEntraId` exist so a racing first paint cannot overwrite a good count with an empty filter.
- **2026-08-26: Home confirm banner refresh.** `scrHome.OnVisible` now `Concurrent(Refresh(PrintRequests), Refresh(LabStatus))` before counting Pending-confirm / Completed-pickup jobs. Previously Home only refreshed LabStatus, so the orange “waiting for your OK” line could stay hidden after an estimate email until SharePoint cache caught up or the student used My Requests **Refresh**.
- **2026-08-14: Item 1 — Form 3+ and Staff Console dropdown/status colors.** Resin printer `Items` / `DefaultSelectedItems` use **`Form 3+ (5.7×5.7×7.3in)`** only (not `Form 3`). Method `OnChange` resets the printer combo so resin auto-selects Form 3+. Classic ComboBox defaults to **IsSearchable = true**, which fills the flyout from sample `ComboBoxSample` instead of `Items`. Discipline/Project Type/Method/Printer/Color now use **`IsSearchable = false`** and **`SelectMultiple = false`**. Discipline `Items` uses internal name **`Department`**. Selected-value chip uses **`SelectionTagFill` white**.
- **2026-08-14: Item 2 — Confirm and Cancel saves.** `btnConfirmYes` / `btnCancelYes` wrap `Patch` in **`IfError`**, set `varIsLoading`, and toast success only after a successful save. Failure keeps the modal open and shows an error. `conLoadingOverlayMyRequests` shows **Saving...**. Confirm/Cancel buttons use `DisplayMode.Disabled` while loading.
- **2026-08-14: Item 3 — Cancel does not wipe Notes.** Cancel no longer Patches `Notes`. It appends `"Canceled by student {date}"` to **`StaffNotes`** (pipe-separated, same as Staff Console) and sets `LastActionAt`. `lblCancelMessage` warns when status is **Ready to Print** (staff may already be preparing; email/visit lab). Cancel remains allowed in Uploaded, Pending, and Ready to Print.
- **2026-08-14: Item 4 — My Requests filter.** Gallery `Items` prefers **`StudentEntraId = Text(varMeEntraId)`** (SharePoint text vs GUID), with **`StudentEmail = varMeEmail` or `varMeUPN`** as fallback for older rows. If Entra ID is blank, filter email only — never `StudentEntraId = Blank()`. No `Lower()` on SharePoint columns (`varMeEmail` / `varMeUPN` are already Lower in OnStart). Empty state uses **`galMyRequests.AllItemsCount = 0`**. Index **StudentEntraId** and **StudentEmail** in SharePoint list settings.
- **2026-08-14: Item 5 — Staff Console chrome.** `varColorHeader` is **`RGBA(77, 77, 77, 1)`** (same as Staff `recHeader`). Header height **55**. Titles are white Open Sans Semibold 18 (`Print Lab Student Portal` / `New Print Request` / `My Print Requests`). Refresh is a Staff-style header button (22px, radius 4). Welcome `Fill = Color.Transparent` (no Studio purple). Home action cards use **`varColorBgCard`**. ReqKey shows **`Job #{ID}`** until Flow A fills `ReqKey`. Rejected cards show **`RejectionComment`**, else **`RejectionReason`**. No logo — Staff live header has none.
- **2026-08-14: Item 6 — Home “needs you” line.** `scrHome.OnVisible` counts this student’s **Pending** rows where `StudentConfirmed` is not true (same identity filter as My Requests). **`btnNeedsYou`** (Classic button, not a label) is **500px** wide and centered, orange text on a transparent fill (peach chip on hover only), and navigates to My Requests. Hidden when the count is 0. The My Requests card description switches to “N estimate(s) waiting for your OK.” Confirm success decrements `varNeedsConfirmCount`. (2026-08-26: OnVisible also `Refresh(PrintRequests)` so this count is not stale after an estimate email.)
- **2026-08-14: Item 7 (partial) — Method “(Required)”.** `lblMethodRequired.Visible` is **`IsBlank(DataCardValue8.Selected.Value)`**. It no longer uses the TigerCard `Len(DataCardValue30.Text) <> 16` copy-paste. Submit layout left unchanged.
- **2026-08-14: Item 8 — Unused OnStart variables.** Removed 23 App Checker unused vars (pricing, leftover hover/radius/input/dropdown-selection aliases, `varCurrentScreen`, `varFormSubmitted`, `varDateFormatFull`, and others never bound on a control). Combo selected-row colors stay hardcoded `RGBA(219,219,219)` / `RGBA(50,50,50)` on the five dropdowns.
- **2026-08-17: Pickup location.** `varPickupLocation` is **`Room 113 Art Building`** (was Room 145 Atkinson Hall). Run **OnStart** to pick it up.
- **2026-08-17: LabStatus snapshot (list + Flow J).** Students cannot count `PrintRequests` (item-level security). Build the one-row **LabStatus** list and **Flow J** first: [LabStatus-List-Setup.md](../SharePoint/LabStatus-List-Setup.md), [Flow-(J)-LabStatus-Refresh.md](../PowerAutomate/Flow-(J)-LabStatus-Refresh.md).
- **2026-08-18: Home cards square; icons restored.** Header, welcome, nav, My Requests card, and overlay containers use **Radius = 0**. **`conLabToday` and `conSubmitCard` do not set Radius** (Studio default rounding — restored 2026-08-18). Submit/My Requests icons are the original 80px blue **Add** / green **DetailList**. Live Lab today: title **Lab Status:**, Width **620**, BusyLevel pill at **X = 148**. Button/chip radii stay 14.
- **2026-08-18: Lab Status chip borders.** Classic buttons in **View** drop the chrome, so `BorderColor` / `DisabledBorderColor` never showed. Live chips are **Edit**, `OnSelect = false`, white fill, **2px** `varInputBorderColor` stroke, radius `12`.
- **2026-08-18: Lab Status + Welcome on one row.** Removed **How it works**. Lab Status is **left**; Welcome is **right**. Submit / My Requests sit under that row.
- **2026-08-18: Home Studio layout (live).** Welcome **X = 715**, greeting **Size 30** / Height **57** / **Y = 11**. Lab Status **X = 28**. BusyLevel pill **X = 140**, Width **467**. Counts **Size 14**, **Y = 61**, copy is **“N waiting · N printing”** (no “jobs”). Filament **X = 379** / Resin **X = 507**, both **Y = 61**. Wait line centered, **Y = 114**. Action cards **Height = 395**, **Y = 12**; Submit **X = 8**, My Requests **X = 695**. `DropShadow.None` on welcome and action-card row. My Requests card radius omitted again (Studio default).
- **2026-08-18: Home pickup line.** `varPickupReadyCount` is this student’s **Completed** rows (same identity filter as confirm). `btnNeedsYou` shows confirm first (orange); if none, pickup (green). Visible when either count > 0. My Requests card copy follows the same priority. Recount on Home **OnVisible** (after `Refresh(PrintRequests)`) and My Requests **Refresh**.
- **2026-08-18: Submit required labels.** Added `lblDisciplineRequired` and `lblProjectTypeRequired` (`IsBlank(Selected.Value)`). `lblAttachmentsRequired` X/Y sit on `DataCardKey32` (was 955/85). Method/Printer/Color/TigerCard already used field-specific Visible.
- **2026-08-18: Required tag clip.** `DataCardKey6` / `DataCardKey7` were `Parent.Width - 60`, so “(Required)” started past the card edge and showed as “(Re”. Live widths: Discipline **95**, Project Type **135** (Method 79, Printer 78, Color 59, TigerCard 171).
- **2026-08-18: Submit layout restored.** Dropdowns, field Y, Attachments Size 20, and Printer **Height 200** are back to the original form. Discipline / Project Type “(Required)” use `Min(DataCardKey.Width, 108|128) + 8` so the tag stays next to the title if the FieldName width stretches.
- **2026-08-18: Submit cards 440.** Visible DataCards are **Width = 440** (were 442). Three 442 cards overflowed the form and clipped “(Required)” into the next column. Hidden Status / StudentEntraId stay **442**. Course Number **Height = 99**. `frmSubmit` border is `varColorBorderLight` / `varInputBorderThickness`. `lblAttachmentsRequired` is **X = 786, Y = 11** (file-picker column), not `DataCardKey32.Width + 5`.
- **2026-08-18: Submit button lower.** Live `frmSubmit` **Height = 526** (was `Parent.Height - 40 - 120`). `btnSubmit` **Y = 588**. `lblValidationMessage` **Y = 550**. Discipline title width **95** (was 112). Project Type title **X = 38**; its ComboBox **X = 30**.
- **2026-08-18: Submit title/dropdown X.** Match Discipline: label and ComboBox **X = 30**. Project Type title was **38**; Method/Printer ComboBoxes were **40**; Color ComboBox was **46**.
- **2026-08-18: Messages button alert.** `btnViewMessages` is solid `varColorDanger` (white text) when `LookUp(RequestComments, RequestID = ThisItem.ID)` finds a row; otherwise the blue outline. Label stays **Messages** — no count.
- **2026-08-17: Item 9 — My Requests filters + filename.** Open / Done / All are a **horizontal gallery** (`galMyRequestTabs`) like Staff `galStatusTabs`: Height 55, TemplateSize 148, TemplatePadding 3, button Width 141 / Size 10 / X 5 / Y 4. Left under the header. Selected uses `ThisItem.Color` (`RGBA(70, 130, 220, 1)`); idle is light gray + 1px border. Counts are this student’s rows. Names stay Open / Done / All.
- **2026-08-17: Item 9 — Message history (read-only).** My Requests cards have a **Messages** button. It opens a Staff-style thread modal (`conViewMessagesModal`): cream box, Outbound (staff, blue, SENT) vs Inbound (student, cream, REPLY) bubbles, newest first. Loads **only that job’s** `RequestComments` into `colStudentRequestComments` (no full-list cache). No compose — students still reply by email. Requires the **RequestComments** SharePoint list added as a data source in Studio.
- **2026-08-17: Item 9 — Lab hours banner.** Home (`lblHoursBanner`) and My Requests (`lblHoursBannerMyRequests`) show a page footer above the nav (not on cards). Copy uses **`varLabHours`** (`Mon–Fri 8:30 AM – 4:30 PM`) and **`varPickupLocation`**. **Open now** (green) weekdays 8:30–4:30 local time; otherwise **Closed now** (orange). Classic button, `DisplayMode.View` (no I-beam). Run **OnStart**.
- **2026-08-17: Item 9 — File download.** My Requests **Files** opens `conFilesModal`, sized like Staff (`500×450`, cream). Title **Attachments - ReqKey** (18–20pt primary). View-only Attachments control: grey chips (`ItemFill = varChevronBackground`, white text), **Attachments** field label, no attach/delete, no Performing Action As. **Close** is the Staff grey Cancel button. Tap the file name to download.
- **2026-08-17: Card buttons match Staff Console.** Status badge is always tab blue `RGBA(70, 130, 220, 1)` (white text, radius 10). **Cancel Request** matches Staff **Reject** (solid `varColorDanger`, white text, `varBtnHeight`). **Confirm Estimate** matches Staff **Approve** (solid green, `varBtnHeight`, not bold shouty). **Messages** and **Files** match Staff **Files** (white fill, blue border/text, fill blue on hover).
- **2026-08-17: My Requests card layout matches Staff job cards.** Same cream card, then **ReqKey** (not student name), relative age (`lblSubmittedTime`, danger red, `2d 21h`), submitted date (email-row slot), Staff filename, **color swatch** (`cirColorDotBackdrop` + `cirColorDot` + `lblColorText`, same Switch as Staff), printer (`🖨` trimmed, no build plates), then weight/time/cost (`lblEstimates`). No Details grid, Notes, or Build Plates. Template height **`varRequestCardHeight` = 300**. Status stays a blue badge (Open mixes statuses). Student email is omitted.
- **2026-08-17: Card filename and printer type.** Filename is Open Sans **9**, muted, **not italic**. Printer (`lblPrinter`) is **size 8** (smaller than filename 9 and color name 10).
- **2026-08-17: Card filename formula.** `lblFilename` is `firstnameLastname_method_color` with **spaces stripped from color** (`mattegreen`, not `matte green`) so it matches Submit `Name_Method_Color`. Name uses `ThisItem.Student.DisplayName`, or `varMeName` if that Person field is blank.
- **2026-08-17: Confirm Estimate Y.** Live Studio moved `btnConfirmEstimate` to **Y = 165** (was 155). Cancel / Messages / Files stay at **Y = 218**.

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
| Primary (Active) | Blue | `RGBA(70, 130, 220, 1)` | `varColorPrimary` |
| Success | Green | `RGBA(46, 125, 50, 1)` | `varColorSuccess` |
| Warning | Orange | `RGBA(255, 140, 0, 1)` | `varColorWarning` |
| Error/Danger | Red | `RGBA(219, 3, 3, 1)` | `varColorDanger` |
| Neutral/Cancel | Gray | `RGBA(150, 150, 150, 1)` | `varColorNeutral` |
| Info | Blue | `RGBA(70, 130, 220, 1)` | `varColorInfo` |
| Header Background | Dark Gray | `RGBA(77, 77, 77, 1)` | `varColorHeader` |
| Nav Button Inactive | Gray | `RGBA(128, 128, 128, 1)` | `varNavBtnInactiveFill` |
| Nav Button Hover | Dark Gray | `RGBA(90, 90, 90, 1)` | `varNavBtnHoverFill` |
| Modal Overlay | Black 70% | `RGBA(0, 0, 0, 0.7)` | `varColorOverlay` |
| Card Background | Warm Cream | `RGBA(247, 237, 223, 1)` | `varColorBgCard` |
| Muted Text | Gray | `RGBA(100, 100, 100, 1)` | `varColorTextMuted` |
| Screen Background | Light Gray | `RGBA(248, 248, 248, 1)` | `varColorBg` |
| Border | Gray | `RGBA(200, 200, 200, 1)` | `varColorBorder` |

### Status Colors (Matching Staff Dashboard)

| Status | Color | RGBA |
|--------|-------|------|
| Uploaded | Blue | `RGBA(70, 130, 220, 1)` |
| Pending | Amber | `RGBA(255, 185, 0, 1)` |
| Ready to Print | Green | `RGBA(46, 125, 50, 1)` |
| Printing | Orange | `RGBA(255, 140, 0, 1)` |
| Completed | Dark Blue | `RGBA(0, 78, 140, 1)` |
| Paid & Picked Up | Teal | `RGBA(0, 158, 73, 1)` |
| Rejected | Red | `RGBA(219, 3, 3, 1)` |
| Canceled | Gray | `RGBA(138, 136, 134, 1)` |
| Archived | Gray | `RGBA(96, 94, 92, 1)` |

### BusyLevel Colors (Home Lab today pill)

Same words and colors as the SharePoint `BusyLevel` column ([BusyLevel-Column-Formatting.json](../SharePoint/Formating/BusyLevel-Column-Formatting.json)). Typical uses **black** text; the others use **white**.

| BusyLevel | Meaning (waiting jobs) | Fill | Text |
|-----------|------------------------|------|------|
| Quiet | 0–5 | `RGBA(16, 124, 16, 1)` | White |
| Typical | 6–15 | `RGBA(255, 185, 0, 1)` | Black |
| Busy | 16–30 | `varColorWarning` | White |
| Packed | 31+ | `RGBA(209, 52, 56, 1)` | White |

### Button Styles

| Type | Fill | Color | Border |
|------|------|-------|--------|
| Primary Action | `varColorPrimary` | White | None (No Border style) |
| Success Action | `varColorSuccess` | White | None (No Border style) |
| Danger Action | `varColorDanger` | White | None (No Border style) |
| Secondary (Tinted) | `ColorFade([color], varSecondaryFade)` | `[color]` | None (No Border style) |
| Cancel/Neutral | `varColorNeutral` | White | None (No Border style) |
| Navigation (Active) | `varColorInfo` | White | None |
| Navigation (Inactive) | `RGBA(60, 60, 65, 1)` | White | None |

### Corner Radius Standards

| Element Type | Radius | Variable | Examples |
|--------------|--------|----------|----------|
| Cards & Modals | `8` | `varRadiusMedium` | Request cards, confirmation modals |
| Buttons | `4` | `varBtnBorderRadius` | All buttons (unified style) |
| Status badges | `14` | (hardcoded on `btnStatusBadge`) | My Requests status pill |
| BusyLevel pill | `14` | (hardcoded on `btnBusyLevel`) | Home Lab today Quiet/Typical/Busy/Packed |

### Layout Dimensions (Tablet Format)

| Element | Width | Height | Notes |
|---------|-------|--------|-------|
| Screen | `1024` | `768` | Tablet landscape layout |
| Header Bar | `Parent.Width` | `55` | Fixed at top (matches Staff Console) |
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

**What you're doing:** Connecting your app to the SharePoint lists and user identity services it needs.

### Add SharePoint Connection

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
   - [x] **LabStatus** ← one-row queue snapshot for the Home Lab today card
10. Click **Connect**.

> 💡 **Already built the app?** Click **+ Add data** → **SharePoint** → the same site URL → check **LabStatus** only → **Connect**. You do not recreate PrintRequests.

> ⚠️ **LabStatus is not PrintRequests.** Students read **one** scoreboard row (`Title` = `Current`). They still only see **their own** print jobs. Never add LabStatus to a gallery of requests.

### Add Office 365 Users Connector (Critical for User Identity)

> ⚠️ **Why this connector?** Power Apps' built-in `User().Email` returns the **User Principal Name (UPN)**, which is the sign-in identifier (e.g., `jsmith3@lsu.edu`). However, SharePoint Person fields may resolve users by their **primary SMTP email** (e.g., `john.smith@lsu.edu`). This mismatch causes students' requests to "disappear" from the My Requests gallery. The Office 365 Users connector provides the actual SMTP email address, ensuring consistent user identification.

11. Click **+ Add data** again.
12. In the search box, type `Office 365 Users`.
13. Click **Office 365 Users** from the list.
14. If prompted, click **Connect** to authorize the connector.

> 💡 **Note:** This connector requires admin consent in some tenants. If you see a permissions error, contact your Microsoft 365 administrator.

### Verification

**In the Data panel**, you should see:
- ✅ PrintRequests
- ✅ LabStatus
- ✅ Office365Users

> 💡 **Note:** Students don't need access to AuditLog or Staff lists—those are staff-only. `LabStatus` is the exception: it is a **public totals** row, not a job list.

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
// CRITICAL: Resolve user identity correctly for reliable "My Requests" filtering
// 
// WHY THIS MATTERS:
// - User().Email returns the User Principal Name (UPN), e.g., "jsmith3@lsu.edu"
// - SharePoint may store the primary SMTP email, e.g., "john.smith@lsu.edu"
// - These can differ at universities with multiple email aliases per user
// - Using the wrong one causes student requests to "disappear" from My Requests
//
// SOLUTION: Use Office365Users.MyProfileV2().mail for the actual SMTP address

// Cache user profile from Office 365 Users connector (call once for performance)
Set(varUserProfile, IfError(Office365Users.MyProfileV2(), Blank()));

// Primary email: SMTP address from profile, fallback to UPN if unavailable
Set(varMeEmail, Lower(Coalesce(varUserProfile.mail, User().Email)));

// Display name: Profile name with fallback
Set(varMeName, Coalesce(varUserProfile.displayName, User().FullName));

// Entra Object ID: Immutable GUID - the most reliable long-term identifier
// (Survives email changes, name changes, and domain migrations)
Set(varMeEntraId, User().EntraObjectId);

// UPN (for SharePoint Person field Claims - must use sign-in identifier)
Set(varMeUPN, Lower(User().Email));

// === MODAL CONTROLS ===
// These control which modal is visible (0 = hidden, ID = visible for that item)
Set(varShowConfirmModal, 0);
Set(varShowCancelModal, 0);
Set(varShowViewMessagesModal, 0);
Set(varShowFilesModal, 0);
Set(varMessageBubbleWidth, 0.85);

// Currently selected item for modals (typed blank so Power Apps knows the schema)
Set(varSelectedItem, LookUp(PrintRequests, false));

// Pending estimates waiting for the student to confirm (Home "needs you" line)
Set(varNeedsConfirmCount, 0);
Set(varPickupReadyCount, 0);

// === FORM STATE ===
// Track if user attempted to submit (for showing validation errors)
Set(varSubmitAttempted, false);
// Track files with invalid names (populated by Attachments OnAddFile/OnRemoveFile)
Set(varInvalidFiles, Table());
Set(varHasInvalidFile, false);

// === LOADING STATE ===
Set(varIsLoading, false);

// ============================================
// === STYLING / THEMING (Centralized) ===
// ============================================
// Matches Staff Dashboard styling - change these once to update the entire app!

// --- FONT ---
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

// === UI NEUTRAL COLORS ===
Set(varColorHeader, RGBA(77, 77, 77, 1));          // Header background (matches Staff Console)
Set(varNavBtnInactiveFill, RGBA(128, 128, 128, 1));  // Nav button inactive state
Set(varNavBtnHoverFill, RGBA(90, 90, 90, 1));      // Nav button hover state
Set(varColorText, RGBA(50, 50, 50, 1));            // Primary text
Set(varColorTextMuted, RGBA(100, 100, 100, 1));    // Secondary/muted text
Set(varColorBg, RGBA(248, 248, 248, 1));           // Screen background
Set(varColorBgCard, RGBA(247, 237, 223, 1));        // Card/modal background (warm cream)
Set(varColorBorderLight, RGBA(220, 220, 220, 1)); // Card borders
Set(varColorOverlay, RGBA(0, 0, 0, 0.7));          // Modal overlay
Set(varColorDisabled, RGBA(180, 180, 180, 1));    // Disabled state

// --- BORDER RADIUS ---
Set(varRadiusMedium, 8);    // Cards, large buttons
Set(varRadiusSmall, 6);     // Standard buttons

// --- BUTTON STYLING (Unified with Staff Dashboard) ---
Set(varBtnBorderRadius, 4);                        // Standard corner radius
Set(varBtnFontSize, 12);
Set(varBtnHeight, 36);
Set(varBtnHeightLarge, 50);                        // Large buttons (CTAs)
Set(varSecondaryFade, 70%);                        // Secondary button fill lightness

// --- FOCUS STYLING ---
Set(varFocusedBorderThickness, 2);

// --- INPUT FIELD STYLING ---
Set(varInputBorderColor, RGBA(128, 128, 128, 1));  // Gray border
Set(varInputBorderThickness, 1);                   // Thin border

// --- DROPDOWN/COMBOBOX STYLING ---
Set(varChevronBackground, RGBA(128, 128, 128, 1));
Set(varChevronFill, RGBA(255, 255, 255, 1));
Set(varChevronHoverBackground, RGBA(128, 128, 128, 1));
Set(varChevronHoverFill, RGBA(219, 219, 219, 1));
Set(varDropdownHoverFill, RGBA(219, 219, 219, 1));
Set(varDropdownPressedFill, RGBA(128, 128, 128, 1));
Set(varDropdownPressedColor, RGBA(255, 255, 255, 1));

// --- SIZING (Tablet Layout) ---
Set(varHeaderHeight, 55);   // Top header bar (matches Staff Console recHeader)
Set(varNavHeight, 60);      // Bottom navigation bar
Set(varButtonHeight, 50);
Set(varButtonHeightSmall, 40);

// --- SPACING ---
Set(varSpacingXL, 20);
Set(varSpacingLG, 16);
Set(varSpacingMD, 12);
Set(varSpacingSM, 8);

// === GALLERY DIMENSIONS ===
Set(varRequestCardHeight, 300);

// === CONTACT INFORMATION ===
Set(varSupportEmail, "coad-fablab@lsu.edu");
Set(varPickupLocation, "Room 113 Art Building");
Set(varPaymentMethod, "TigerCASH only");
Set(varLabHours, "Mon–Fri 8:30 AM – 4:30 PM");

// === LAB STATUS SNAPSHOT ===
// One student-readable row. Do not CountRows(PrintRequests) for lab-wide totals.
Set(varLabStatus, LookUp(LabStatus, Title = "Current"));
If(
    !IsBlank(varLabStatus),
    Set(varLabHours, Coalesce(varLabStatus.LabHours, varLabHours));
    Set(varPickupLocation, Coalesce(varLabStatus.PickupLocation, varPickupLocation))
);

// === DATE/TIME FORMATS ===
Set(varDateFormatShort, "mmm d, yyyy");

// === NAVIGATION ===
Set(varScreenTransition, ScreenTransition.Fade);

// === STATUS COLORS ===
// Consistent with Staff Dashboard
Set(varStatusColors, Table(
    {Status: "Uploaded", Color: varColorPrimary},
    {Status: "Pending", Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Color: varColorSuccess},
    {Status: "Printing", Color: varColorWarning},
    {Status: "Completed", Color: varColorPrimary},
    {Status: "Paid & Picked Up", Color: varColorSuccess},
    {Status: "Rejected", Color: varColorDanger},
    {Status: "Canceled", Color: RGBA(138, 136, 134, 1)},
    {Status: "Archived", Color: RGBA(96, 94, 92, 1)}
))

// Home banner counts. Run OnStart zeros these earlier and does not re-fire scrHome.OnVisible.
Refresh(PrintRequests);
With(
    {
        wMine: If(
            !IsBlank(varMeEntraId),
            Filter(
                PrintRequests,
                StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
            ),
            Filter(
                PrintRequests,
                StudentEmail = varMeEmail || StudentEmail = varMeUPN
            )
        )
    },
    Set(
        varNeedsConfirmCount,
        CountRows(
            Filter(
                wMine,
                Status.Value = "Pending",
                Not(StudentConfirmed)
            )
        )
    );
    Set(
        varPickupReadyCount,
        CountRows(
            Filter(
                wMine,
                Status.Value = "Completed"
            )
        )
    )
)
```

5. Press **Enter** or click away to confirm.

### Running OnStart to Test

6. At the top of the screen, click the **three dots (...)** next to "App".
7. Click **Run OnStart**.
8. Wait for it to complete (you'll see a brief loading indicator).

> 💡 **Tip:** You can also press **F5** to preview the app, which automatically runs OnStart. After **Run OnStart** on Home, the confirm/pickup banner should appear when OnStart finishes (OnStart recounts; it does not re-run Home **OnVisible**).

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
| `varColorBg` | Off-white | Screen backgrounds |
| `varColorBgCard` | Warm Cream | Cards, modals |
| `varColorBorderLight` | Light gray | Card borders |
| `varColorDisabled` | Gray | Disabled controls |

#### Input/Dropdown Styling

| Variable | Value | Use For |
|----------|-------|---------|
| `varFocusedBorderThickness` | 2 | Focus indicator for all controls |
| `varInputBorderColor` | Gray | Input/dropdown borders |
| `varInputBorderThickness` | 1 | Input border width |
| `varChevronBackground` | Gray | Dropdown chevron bg |
| `varChevronFill` | White | Dropdown chevron arrow |
| `varChevronHoverFill` | Light gray | Dropdown hover arrow |
| `varDropdownHoverFill` | Light gray | Dropdown row hover |
| `varDropdownPressedFill` | Gray | Dropdown pressed state |

> Combo selected-row colors are hardcoded on Discipline/Project Type/Method/Printer/Color (`SelectionFill` `RGBA(219,219,219,1)`, `SelectionColor` `RGBA(50,50,50,1)`). Do not reintroduce unused `varDropdownSelection*` aliases unless a control binds them.

#### Border Radius

| Variable | Value | Use For |
|----------|-------|---------|
| `varRadiusMedium` | 8 | Cards, nav buttons |
| `varRadiusSmall` | 6 | Primary action buttons |

#### Sizing

| Variable | Value | Use For |
|----------|-------|---------|
| `varHeaderHeight` | 55 | Top header bar (matches Staff Console) |
| `varNavHeight` | 60 | Bottom navigation |
| `varButtonHeight` | 50 | Primary buttons |
| `varButtonHeightSmall` | 40 | Secondary buttons |

#### Spacing

| Variable | Value | Use For |
|----------|-------|---------|
| `varSpacingXL` | 20 | Screen edge padding |
| `varSpacingLG` | 16 | Card padding |
| `varSpacingMD` | 12 | Form field gaps |
| `varSpacingSM` | 8 | Small gaps |

### Other Variables

| Variable | Purpose | Type |
|----------|---------|------|
| `varUserProfile` | Cached Office 365 user profile (call once for performance) | Record |
| `varMeEmail` | Current user's **SMTP email** (lowercase) — used for `StudentEmail` field | Text |
| `varMeName` | Current user's display name | Text |
| `varMeEntraId` | Current user's Entra Object ID (GUID) — immutable, survives email changes | Text |
| `varMeUPN` | Current user's UPN (sign-in identifier) — used for Person field Claims | Text |
| `varShowConfirmModal` | ID of item for estimate confirmation (0=hidden) | Number |
| `varNeedsConfirmCount` | Pending jobs waiting for student OK (Home line) | Number |
| `varPickupReadyCount` | Completed jobs ready for pickup (Home line) | Number |
| `varMyRequestsFilter` | My Requests chip: Open, Done, or All | Text |
| `varShowCancelModal` | ID of item for cancel confirmation (0=hidden) | Number |
| `varShowViewMessagesModal` | ID of item for message history modal (0=hidden) | Number |
| `varShowFilesModal` | ID of item for file download modal (0=hidden) | Number |
| `varMessageBubbleWidth` | Message bubble width as a fraction of the gallery template | Number |
| `varSelectedItem` | Item currently selected for modal | Record |
| `varIsLoading` | Shows loading state during operations | Boolean |
| `varStatusColors` | Status-to-color mapping table | Table |
| `varRequestCardHeight` | My Requests gallery template size | Number |
| `varSupportEmail` | Help/support email address | Text |
| `varPickupLocation` | Physical pickup location (from LabStatus when present) | Text |
| `varLabHours` | Posted lab hours (from LabStatus when present) | Text |
| `varLabStatus` | `LookUp` of LabStatus Title = `Current` (BusyLevel, counts, wait text) | Record |
| `varPaymentMethod` | Accepted payment method | Text |
| `varDateFormatShort` | Short date format string | Text |
| `varScreenTransition` | Navigation transition effect | ScreenTransition |
| `varSubmitAttempted` | Track if user attempted submit (for validation display) | Boolean |
| `varInvalidFiles` | Collection of attached files with invalid names | Table |
| `varHasInvalidFile` | True if any attached file has invalid name | Boolean |

> 💡 **User Identity Variables Explained:**
> - **`varMeEmail`** (SMTP): The primary email address (e.g., `john.smith@lsu.edu`). Used for the `StudentEmail` text field and gallery filtering.
> - **`varMeUPN`** (UPN): The sign-in identifier (e.g., `jsmith3@lsu.edu`). Required for SharePoint Person field Claims.
> - **`varMeEntraId`** (GUID): Immutable identifier that never changes. Best for long-term user matching if emails/names change.

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
    lblHoursBanner                  ← Open/Closed hours + pickup room (above nav)
    ▼ conActionCards                ← (created 4th)
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
            icnSubmit               ← Add icon
            recSubmitCardBg         ← Card background (created 1st - behind)
    ▼ conLabToday                   ← Lab today / staff business (left, aligns with Submit)
        lblLabStaffMessage          ← optional note (hidden if blank)
        lblLabWait                  ← typical wait · Updated
        lblResinChip                ← Resin N pill
        lblFilamentChip             ← Filament N pill
        lblLabCounts                ← N waiting · N printing
        btnBusyLevel                ← Quiet / Typical / Busy / Packed
        lblLabTodayTitle            ← "Lab Status:"
    ▼ conWelcome                    ← (right, same row as Lab Status, aligns with My Requests)
        btnNeedsYou                 ← Pending confirm button (top, hidden if 0)
        lblSubtitle                 ← hidden
        lblWelcome                  ← "Welcome, [Name]!"
    ▼ conHeaderHome                 ← (created 1st - BOTTOM of tree = behind)
        imgUserPhotoHome            ← User profile photo (top right)
        lblHeaderTitleHome          ← "Print Lab Student Portal"
        recHeaderBgHome             ← Background (created 1st - behind)

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
        imgUserPhoto                ← User profile photo (top right)
        lblHeaderTitle              ← "Submit Request"
        recHeaderBg                 ← Background (bottom)

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
        btnRefresh                  ← Refresh button (top right)
        imgUserPhoto2               ← User profile photo
        lblHeaderTitle2             ← "My Print Requests"
        recHeaderBg2                ← Background (bottom)
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

**What you're doing:** Creating a welcoming landing screen that shows how busy the lab is (Lab today) and gives students a clear choice between submitting a new request or viewing their existing requests.

> 💡 **Why a landing screen?** Instead of dropping students directly into a form, this screen provides a personalized welcome and two clear paths. Return visitors can quickly check their request status without scrolling past a form.

### First: Rename the Screen

1. **In the Tree view, double-click on `Screen1`** to rename it.
2. Type `scrHome` and press **Enter**.

### Set Screen Background

3. With `scrHome` selected, set these properties:
   - **Fill:** `varColorBg`
   - **OnVisible:** paste the formula below (refreshes this student’s PrintRequests plus the LabStatus snapshot, then counts Pending-confirm jobs and Completed-pickup jobs)

**⬇️ FORMULA: Paste into scrHome OnVisible**

```powerfx
Concurrent(
    Refresh(PrintRequests),
    Refresh(LabStatus)
);
Set(varLabStatus, LookUp(LabStatus, Title = "Current"));
If(
    !IsBlank(varLabStatus),
    Set(varLabHours, Coalesce(varLabStatus.LabHours, varLabHours));
    Set(varPickupLocation, Coalesce(varLabStatus.PickupLocation, varPickupLocation))
);
// Skip if identity is not ready yet (StartScreen OnVisible can race OnStart).
If(
    !IsBlank(varMeEmail) || !IsBlank(varMeEntraId),
    With(
        {
            wMine: If(
                !IsBlank(varMeEntraId),
                Filter(
                    PrintRequests,
                    StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
                ),
                Filter(
                    PrintRequests,
                    StudentEmail = varMeEmail || StudentEmail = varMeUPN
                )
            )
        },
        Set(
            varNeedsConfirmCount,
            CountRows(
                Filter(
                    wMine,
                    Status.Value = "Pending",
                    Not(StudentConfirmed)
                )
            )
        );
        Set(
            varPickupReadyCount,
            CountRows(
                Filter(
                    wMine,
                    Status.Value = "Completed"
                )
            )
        )
    )
)
```

> 💡 Identity match is the same as My Requests. `Not(StudentConfirmed)` runs on that student’s rows only (covers blank and false). Confirm (orange) takes priority over pickup (green). The Home line is hidden when both counts are 0.

> 💡 **Lab today:** `Refresh` + `LookUp` on `LabStatus` is one row. Do **not** `CountRows(Filter(PrintRequests, Status.Value = "Ready to Print"))` — that only counts **this student’s** jobs, not the lab.

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
| Text | `"Print Lab Student Portal"` |
| X | `20` |
| Y | `11` |
| Width | `400` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `Color.White` |

#### Add User Profile Image

13. Click **+ Insert** → **Media** → **Image**.
14. **Rename it:** `imgUserPhotoHome`
15. Set these properties:

| Property | Value |
|----------|-------|
| Image | `Office365Users.UserPhotoV2(varMeUPN)` |
| X | `Parent.Width - Self.Width - varSpacingMD` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `40` |
| Height | `40` |
| ImagePosition | `ImagePosition.Fill` |
| RadiusTopLeft | `20` |
| RadiusTopRight | `20` |
| RadiusBottomLeft | `20` |
| RadiusBottomRight | `20` |

> 💡 **Circular Profile Photo:** The 20px radius on a 40x40 image creates a perfect circle. The image pulls the user's Microsoft 365 profile photo.

---

### 4B: Create Welcome Section

16. With `scrHome` selected, click **+ Insert** → **Layout** → **Container**.
17. **Rename it:** `conWelcome`
18. Set these properties:

| Property | Value |
|----------|-------|
| X | `conActionCards.X + conRequestsCard.X` |
| Y | `conLabToday.Y` |
| Width | `conRequestsCard.Width` |
| Height | `conLabToday.Height` |
| Fill | `Transparent` |
| DropShadow | `DropShadow.None` |

> 💡 **Same row as Lab Status:** Welcome sits on the **right**, stacked above My Requests. `X` / `Width` bind to the My Requests card so the column stays aligned when the window resizes. Radius stays **0**.

#### Add Welcome Label

19. With `conWelcome` selected, click **+ Insert** → **Text label**.
20. **Rename it:** `lblWelcome`
21. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Welcome, " & First(Split(varMeName, " ")).Value & "!"` |
| X | `16` |
| Y | `11` |
| Width | `Parent.Width - 32` |
| Height | `57` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `30` |
| Color | `varColorText` |
| Fill | `Color.Transparent` |
| Align | `Align.Center` |

#### Add Subtitle Label

22. Click **+ Insert** → **Text label**.
23. **Rename it:** `lblSubtitle`
24. Set these properties:

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
| Visible | `false` |

#### Add “needs you” button

25. Click **+ Insert** → **Button**.
26. **Rename it:** `btnNeedsYou`
27. Set these properties:

| Property | Value |
|----------|-------|
| X | `16` |
| Y | `lblWelcome.Y + lblWelcome.Height + 4` |
| Width | `Parent.Width - 32` |
| Height | `61` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Color | `If(varNeedsConfirmCount > 0, varColorWarning, varColorSuccess)` |
| Fill | `Color.Transparent` |
| HoverFill | `ColorFade(Self.Color, 85%)` |
| HoverColor | `Self.Color` |
| PressedFill | `ColorFade(Self.Color, 75%)` |
| BorderThickness | `0` |
| Align | `Align.Center` |
| Visible | `varNeedsConfirmCount > 0 \|\| varPickupReadyCount > 0` |
| OnSelect | `Navigate(scrMyRequests, varScreenTransition)` |

> Use a **Button**, not a Label. Labels show the text I-beam cursor; buttons show the hand pointer.

**⬇️ FORMULA: Paste into btnNeedsYou Text**

```powerfx
If(
    varNeedsConfirmCount > 0,
    If(
        varNeedsConfirmCount = 1,
        "You have a print waiting for your OK — tap to confirm",
        "You have " & varNeedsConfirmCount & " prints waiting for your OK — tap to confirm"
    ),
    If(
        varPickupReadyCount = 1,
        "You have a print ready for pickup — tap to view",
        "You have " & varPickupReadyCount & " prints ready for pickup — tap to view"
    )
)
```

---

### 4C: Create Lab Today Card (staff business)

**What you're doing:** Adding a cream card on the **left** of the same row as Welcome. Students are not allowed to see other people’s `PrintRequests`, so this card reads the one `LabStatus` row named `Current` (written by Flow J).

> ⚠️ **Build [LabStatus](../SharePoint/LabStatus-List-Setup.md) and [Flow J](../PowerAutomate/Flow-(J)-LabStatus-Refresh.md) first.** If the list is missing, counts show as 0 / —. The card still keeps its height so Welcome stays aligned on the right.

> 💡 **What students see:** Quiet / Typical / Busy / Packed, how many jobs are waiting vs printing, Filament vs Resin waiting, a typical-wait sentence, and an optional staff note. They never see other students’ names, files, or ReqKeys.

28. With `scrHome` selected, click **+ Insert** → **Layout** → **Container**.
29. **Rename it:** `conLabToday`
30. Set these properties:

| Property | Value |
|----------|-------|
| X | `conActionCards.X + conSubmitCard.X` |
| Y | `varHeaderHeight + 20` |
| Width | `conSubmitCard.Width` |
| Height | `If(IsBlank(varLabStatus) || IsBlank(varLabStatus.StaffMessage), 148, 178)` |
| Fill | `varColorBgCard` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `1` |

> 💡 **Same row as Welcome:** Lab Status is **left** (`X` / `Width` bind to Submit). Welcome is **right**. Height stays **148 / 178**. Do **not** set Radius on this container — omit it so Studio’s default rounding applies (`conSubmitCard` is the same).

#### Add title

31. With `conLabToday` selected, click **+ Insert** → **Text label**.
32. **Rename it:** `lblLabTodayTitle`
33. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Lab Status:"` |
| X | `16` |
| Y | `12` |
| Width | `124` |
| Height | `28` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Color | `varColorText` |

#### Add BusyLevel pill (top right)

34. Click **+ Insert** → **Button** (Classic).
35. **Rename it:** `btnBusyLevel`
36. Set these properties:

| Property | Value |
|----------|-------|
| DisplayMode | `DisplayMode.View` |
| X | `lblLabTodayTitle.X + lblLabTodayTitle.Width + varSpacingSM` |
| Y | `12` |
| Width | `Parent.Width - (lblLabTodayTitle.X + lblLabTodayTitle.Width + varSpacingSM) - 16` |
| Height | `28` |
| Size | `11` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| BorderThickness | `0` |
| RadiusTopLeft | `14` |
| RadiusTopRight | `14` |
| RadiusBottomLeft | `14` |
| RadiusBottomRight | `14` |
| Align | `Align.Center` |
| Text | `Coalesce(varLabStatus.BusyLevel.Value, "—")` |
| HoverFill | `Self.Fill` |
| HoverColor | `Self.Color` |
| PressedFill | `Self.Fill` |
| PressedColor | `Self.Color` |

> Use a **Button** in **View** mode (same trick as the hours banner). A Label shows the I-beam; this pill is not tappable.

**⬇️ FORMULA: Paste into btnBusyLevel Fill**

```powerfx
Switch(
    varLabStatus.BusyLevel.Value,
    "Quiet",
    RGBA(16, 124, 16, 1),
    "Typical",
    RGBA(255, 185, 0, 1),
    "Busy",
    varColorWarning,
    "Packed",
    RGBA(209, 52, 56, 1),
    varColorNeutral
)
```

**⬇️ FORMULA: Paste into btnBusyLevel Color**

```powerfx
If(
    varLabStatus.BusyLevel.Value = "Typical",
    RGBA(0, 0, 0, 1),
    Color.White
)
```

> 💡 Typical is gold with **black** text (same as the SharePoint column). Quiet / Busy / Packed use white text.

#### Add waiting / printing counts

40. Click **+ Insert** → **Text label**.
41. **Rename it:** `lblLabCounts`
42. Set these properties:

| Property | Value |
|----------|-------|
| X | `16` |
| Y | `61` |
| Width | `lblFilamentChip.X - Self.X - varSpacingSM` |
| Height | `28` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Color | `varColorText` |

**⬇️ FORMULA: Paste into lblLabCounts Text**

```powerfx
If(
    Coalesce(varLabStatus.JobsWaiting, 0) = 1,
    "1 waiting",
    Coalesce(varLabStatus.JobsWaiting, 0) & " waiting"
) & "  ·  " & If(
    Coalesce(varLabStatus.JobsPrinting, 0) = 1,
    "1 printing",
    Coalesce(varLabStatus.JobsPrinting, 0) & " printing"
)
```

#### Add Filament / Resin chips

43. Click **+ Insert** → **Button** (Classic). Rename it `lblFilamentChip`.
44. Click **+ Insert** → **Button** (Classic). Rename it `lblResinChip`.
45. Both chips: Height `28`, Size `11`, Fill `Color.White`, radius `12`, Color `varColorText`, **Y `61`**. **Do not use DisplayMode.View**. Use **Edit**, `OnSelect` `false`, `TabIndex` `-1`. Border: thickness `2`, `BorderColor` / Hover / Pressed / Focused all `varInputBorderColor`. Filament: Width `120`, X `lblResinChip.X - Self.Width - varSpacingSM`. Resin: Width `100`, X `Parent.Width - 16 - Self.Width`.

> 💡 These chips are **waiting** (Ready to Print) only. Printing is the total on the line above. Labels cannot round corners — use Classic buttons in View mode. Do not show `ManualOverride`.

#### Add typical-wait footer

46. Click **+ Insert** → **Text label**.
47. **Rename it:** `lblLabWait`
48. Set these properties:

| Property | Value |
|----------|-------|
| X | `16` |
| Y | `114` |
| Width | `Parent.Width - 32` |
| Height | `29` |
| Font | `varAppFont` |
| Size | `10` |
| Color | `varColorTextMuted` |
| Align | `Align.Center` |
| Wrap | `true` |

**⬇️ FORMULA: Paste into lblLabWait Text**

```powerfx
Coalesce(
    varLabStatus.TypicalWaitText,
    "Typical wait after you confirm: 1–3 lab days"
) & If(
    IsBlank(varLabStatus.UpdatedAt),
    "",
    "  ·  Updated " & Text(varLabStatus.UpdatedAt, DateTimeFormat.ShortTime)
)
```

> ⚠️ This is **not** a clock time. Queue order is not FIFO in a way students can trust to the minute. Staff edit `TypicalWaitText` on the `Current` row; Flow J does not overwrite it.

#### Add optional staff message

49. Click **+ Insert** → **Text label**.
50. **Rename it:** `lblLabStaffMessage`
51. Set these properties:

| Property | Value |
|----------|-------|
| X | `16` |
| Y | `144` |
| Width | `Parent.Width - 32` |
| Height | `24` |
| Font | `varAppFont` |
| Size | `11` |
| Color | `varColorWarning` |
| Visible | `!IsBlank(varLabStatus.StaffMessage)` |
| Text | `varLabStatus.StaffMessage` |
| Wrap | `true` |

> 💡 Examples: `XL down today — expect longer filament waits.` Leave the SharePoint field blank on quiet days. Flow J does **not** clear this field.

**Do not put on this card**

| Leave off | Why |
|-----------|-----|
| Other students’ names, emails, files, ReqKeys | Privacy — not on `LabStatus` |
| `ManualOverride` | Staff-only switch |
| Build plates / which printer is running | Staff-only lists |
| A promised finish clock (`Tuesday 3:14 PM`) | The lab cannot guarantee that |

---

### 4D: Create Action Cards Container

25. With `scrHome` selected, click **+ Insert** → **Layout** → **Container**.
26. **Rename it:** `conActionCards`
27. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingXL` |
| Y | `conLabToday.Y + conLabToday.Height + 12` |
| Width | `Parent.Width - (varSpacingXL * 2)` |
| Height | `lblHoursBanner.Y - Self.Y - 12` |
| Fill | `Transparent` |

---

### 4E: Create "Submit New Request" Card (Left)

28. With `conActionCards` selected, click **+ Insert** → **Layout** → **Container**.
29. **Rename it:** `conSubmitCard`
27. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingSM` |
| Y | `varSpacingMD` |
| Width | `(Parent.Width - varSpacingSM * 2 - varSpacingXL) / 2` |
| Height | `Parent.Height - varSpacingMD * 2` |
| Fill | `varColorBgCard` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `1` |

#### Add Submit Icon

30. With `conSubmitCard` selected, click **+ Insert** → **Icons** → **Add**.
31. **Rename it:** `icnSubmit`
32. Set these properties:

| Property | Value |
|----------|-------|
| Icon | `Icon.Add` |
| X | `(Parent.Width - 80) / 2` |
| Y | `40` |
| Width | `80` |
| Height | `80` |
| Color | `varColorPrimary` |

#### Add Submit Title

33. Click **+ Insert** → **Text label**.
34. **Rename it:** `lblSubmitTitle`
35. Set these properties:

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
| Height | `varBtnHeightLarge` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorPrimary, -15%)` |
| PressedFill | `ColorFade(varColorPrimary, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

40. Set **OnSelect:**

```powerfx
Navigate(scrSubmit, varScreenTransition)
```

---

### 4F: Add "OR" Divider

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

### 4G: Create "My Requests" Card (Right)

44. With `conActionCards` selected, click **+ Insert** → **Layout** → **Container**.
45. **Rename it:** `conRequestsCard`
46. Set these properties:

| Property | Value |
|----------|-------|
| X | `conSubmitCard.X + conSubmitCard.Width + varSpacingXL` |
| Y | `varSpacingMD` |
| Width | `(Parent.Width - varSpacingSM * 2 - varSpacingXL) / 2` |
| Height | `Parent.Height - varSpacingMD * 2` |
| Fill | `varColorBgCard` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `1` |

#### Add Requests Icon

47. With `conRequestsCard` selected, click **+ Insert** → **Icons** → **DetailList**.
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
| Text | See formula below |

**⬇️ FORMULA: Paste into lblRequestsDesc Text**

```powerfx
If(
    varNeedsConfirmCount > 0,
    If(
        varNeedsConfirmCount = 1,
        "1 estimate waiting for your OK",
        varNeedsConfirmCount & " estimates waiting for your OK"
    ),
    If(
        varPickupReadyCount > 0,
        If(
            varPickupReadyCount = 1,
            "1 print ready for pickup",
            varPickupReadyCount & " prints ready for pickup"
        ),
        "View status, confirm estimates, or manage your existing requests"
    )
)
```
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
| Height | `varBtnHeightLarge` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorSuccess, -15%)` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

59. Set **OnSelect:**

```powerfx
Navigate(scrMyRequests, varScreenTransition)
```

---

### 4H: Create Hours Banner

60. With `scrHome` selected, click **+ Insert** → **Button** (Classic).
61. **Rename it:** `lblHoursBanner`
62. Set these properties:

| Property | Value |
|----------|-------|
| DisplayMode | `DisplayMode.View` |
| Fill | `Color.Transparent` |
| BorderThickness | `0` |
| X | `0` |
| Y | `Parent.Height - varNavHeight - 42` |
| Width | `Parent.Width` |
| Height | `32` |
| Font | `varAppFont` |
| Size | `12` |
| Align | `Align.Center` |

63. Set **Text:**

```powerfx
With(
    {
        wDay: Weekday(Now(), StartOfWeek.Monday),
        wMin: Hour(Now()) * 60 + Minute(Now())
    },
    If(
        wDay <= 5 && wMin >= 510 && wMin < 990,
        "Open now  ·  " & varLabHours & "  ·  " & varPickupLocation,
        "Closed now  ·  " & varLabHours & "  ·  " & varPickupLocation
    )
)
```

64. Set **Color** to the same `With(...)` but return `varColorSuccess` when open and `varColorWarning` when closed.

Hours are **8:30 AM–4:30 PM** (`510` / `990` minutes) for the Open/Closed color. That window stays in this formula even when staff change the **display** string on LabStatus (`LabHours` / `PickupLocation` flow into `varLabHours` / `varPickupLocation` from Home OnVisible). Duplicate this control on `scrMyRequests` as `lblHoursBannerMyRequests` (`Y = Parent.Height - varNavHeight - 34`, gallery area height minus 36). Do not put hours on each request card.

---

### 4I: Create Navigation Bar

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
| Size | `varBtnFontSize` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
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
| Fill | `varNavBtnInactiveFill` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Normal` |
| Size | `varBtnFontSize` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

76. Set **OnSelect:**

```powerfx
Navigate(scrSubmit, varScreenTransition)
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
| Fill | `varNavBtnInactiveFill` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Normal` |
| Size | `varBtnFontSize` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

80. Set **OnSelect:**

```powerfx
Navigate(scrMyRequests, varScreenTransition)
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
    lblHoursBanner
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
    ▼ conLabToday
        lblLabStaffMessage
        lblLabWait
        lblResinChip
        lblFilamentChip
        lblLabCounts
        btnBusyLevel
        lblLabTodayTitle
    ▼ conWelcome
        btnNeedsYou
        lblSubtitle
        lblWelcome
    ▼ conHeaderHome                 ← created first (bottom = behind)
        imgUserPhotoHome            ← user profile photo
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
| Text | `"New Print Request"` |
| X | `20` |
| Y | `11` |
| Width | `Parent.Width - 40` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `Color.White` |

#### Add User Profile Image

13. Click **+ Insert** → **Media** → **Image**.
14. **Rename it:** `imgUserPhoto`
15. Set these properties:

| Property | Value |
|----------|-------|
| Image | `Office365Users.UserPhotoV2(varMeUPN)` |
| X | `Parent.Width - Self.Width - varSpacingMD` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `40` |
| Height | `40` |
| ImagePosition | `ImagePosition.Fill` |
| RadiusTopLeft | `20` |
| RadiusTopRight | `20` |
| RadiusBottomLeft | `20` |
| RadiusBottomRight | `20` |

> 💡 **Circular Profile Photo:** Displays the current user's Microsoft 365 profile picture in the header.

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
| Fill | `varNavBtnInactiveFill` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Normal` |
| Size | `varBtnFontSize` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

22. Set **OnSelect:**

```powerfx
Navigate(scrHome, varScreenTransition)
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
| Size | `varBtnFontSize` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
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
| Fill | `varNavBtnInactiveFill` |
| Color | `Color.White` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Normal` |
| Size | `varBtnFontSize` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varRadiusSmall` |
| RadiusTopRight | `varRadiusSmall` |
| RadiusBottomLeft | `varRadiusSmall` |
| RadiusBottomRight | `varRadiusSmall` |

30. Set **OnSelect:**

```powerfx
Navigate(scrMyRequests, varScreenTransition)
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
| Height | `526` |
| BorderColor | `varColorBorderLight` |
| BorderThickness | `varInputBorderThickness` |

7. After setting the DataSource, Power Apps will **auto-generate DataCards** for all columns in PrintRequests.

> ⚠️ **Wait for DataCards:** After connecting to PrintRequests, you'll see DataCards appear in the Tree view under `frmSubmit`. This may take a few seconds.

---

### 6C: Configure Form Fields

Now we'll configure which fields are visible and how they behave.

> **Card width:** Set every **visible** DataCard **Width** to `440`. Three `442` cards overflow the form and clip “(Required)” into the next column. Hidden Status / StudentEntraId can stay `442`.

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

### 6D: Add Important Information DataCard

This warning card appears at the top of the form and scrolls with all the other fields, ensuring students see it before filling out the form.

13. With `frmSubmit` selected, click **+ Insert** → **Input** → **Add a custom card** (or right-click on `frmSubmit` and select **New card** → **Blank card**).
14. **Rename it:** `dcImportantInfo`
15. Set these properties:

| Property | Value |
|----------|-------|
| Width | `Parent.Width` |
| Height | `200` |
| Fill | `RGBA(255, 244, 206, 1)` |
| BorderColor | `varColorWarning` |
| BorderThickness | `1` |
| DisplayMode | `DisplayMode.View` |

> 💡 **Custom Card:** A blank/custom DataCard is not bound to any SharePoint column — it's just a container for displaying content within the form.

16. With `dcImportantInfo` selected, click **+ Insert** → **Text label**.
17. **Rename it:** `lblImportantInfo`
18. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingMD` |
| Y | `varSpacingMD` |
| Width | `Parent.Width - (varSpacingMD * 2)` |
| Height | `Parent.Height - (varSpacingMD * 2)` |
| Fill | `Transparent` |
| Color | `RGBA(102, 77, 3, 1)` |
| Font | `varAppFont` |
| Size | `11` |

19. Set **Text:**

```powerfx
"Important Information Before Submitting Your 3D Printing Request

Before submitting your model for 3D printing, please ensure you have thoroughly reviewed our Additive Manufacturing Moodle page, read all the guides, and checked the checklist. If necessary, revisit and fix your model before submission. Your model must be scaled and simplified appropriately, often requiring a second version specifically optimized for 3D printing.

We will not print models that are broken, messy, or too large. Your model must follow the rules and constraints of the machine. We will not fix or scale your model as we do not know your specific needs or project requirements. We print exactly what you send us; if the scale is wrong or you are unsatisfied with the product, it is your responsibility.

We will gladly print another model for you at an additional cost. We are only responsible for print failures due to issues under our control."
```

> 💡 **Scrolls with form:** Because this is a DataCard inside `frmSubmit`, it will scroll along with all the other DataCards, ensuring students see it as they begin filling out the form.

#### Position the Card at the Top

20. In the **Edit fields** panel (click **Edit fields** in the Properties pane), drag `dcImportantInfo` to the **very top** of the field list, above Title.

> ⚠️ **Field Order:** The order in the Edit fields panel determines the visual order in the form. Make sure this card appears first so students see the warning before any input fields.

---

### 6E: Configure Individual DataCards

Now we'll customize each DataCard. For each DataCard below, **click on it in the Tree view** and set the properties shown.

#### Title_DataCard1 (Hide)

20. Click on `Title_DataCard1` in Tree view.
21. Set these properties:

| Property | Value |
|----------|-------|
| Visible | `false` |

> Title will be auto-generated from the student name, method, and color.

#### Student_DataCard1 (Auto-populated)

> ⚠️ **CRITICAL: Do NOT let students manually select their name.** Manual selection causes filter mismatches when students select the wrong person or can't find themselves in the list. The Student field must be auto-populated from the logged-in user's session.

15. Click on `Student_DataCard1` itself (the DataCard, not the control inside).
16. Set the **Update** property:

**⬇️ FORMULA: Paste into Student_DataCard1.Update**

```powerfx
{
    '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
    Claims: "i:0#.f|membership|" & varMeUPN,
    DisplayName: varMeName,
    Email: varMeEmail
}
```

17. Set these properties on the DataCard:

| Property | Value |
|----------|-------|
| DisplayMode | `DisplayMode.View` |

> 💡 **Why auto-populate?** This record structure tells SharePoint exactly who the current user is. The `Claims` value is the SharePoint user identifier, `DisplayName` shows the name, and `Email` stores the email. By locking to View mode, students cannot accidentally select the wrong person.

> ⚠️ **Claims vs Email:** The `Claims` field **must use the UPN** (`varMeUPN`) because SharePoint resolves Person fields by the sign-in identifier. The `Email` field uses the **SMTP address** (`varMeEmail`) for display and notifications. These can be different in multi-alias environments (e.g., `jsmith3@lsu.edu` vs `john.smith@lsu.edu`).

> ⚠️ **Note:** The `@odata.type` line must include the `@` symbol and quotes exactly as shown. If you get errors after pasting, check for curly quotes (see [Curly Quotes Warning](#-critical-curly-quotes-warning)).

#### Hide the ComboBox, Add a Display Label

Since students can't edit this field, we replace the ComboBox with a simple label showing their name.

18. Expand `Student_DataCard1` in Tree view.
19. Click on the **ComboBox control inside** (default name: `DataCardValue3`).
20. Set **Visible** to:

```powerfx
false
```

21. With `Student_DataCard1` still expanded, click **+ Insert** → **Text label**.
22. **Rename it:** `lblStudentName`
23. Set these properties:

| Property | Value |
|----------|-------|
| Text | `varMeName` |
| Font | `varAppFont` |
| Color | `varColorText` |
| X | `30` |
| Y | `DataCardKey3.Y + DataCardKey3.Height + 5` |
| Width | `Parent.Width - 60` |
| Height | `40` |
| Size | `12` |

> 💡 **Why a label instead of the ComboBox?** The ComboBox requires the user to exist in SharePoint's People Picker choices, which may not include new users. A label simply shows `varMeName` (set in `App.OnStart`) and always works. The `Update` property on the DataCard handles saving the correct Person value regardless of what's displayed.

#### StudentEmail_DataCard1 (Auto-fill) - CRITICAL FOR FILTERING

> ⚠️ **This field is still required.** New My Requests filtering prefers `StudentEntraId`, but `StudentEmail` remains the fallback for older rows and when Entra ID is blank. Store the user's **primary SMTP** from `Office365Users.MyProfileV2().mail` (`varMeEmail`).

24. Click on `StudentEmail_DataCard1` itself (the DataCard, not the TextInput inside).
25. Set these properties:

| Property | Value |
|----------|-------|
| DisplayName | `"Student Email"` |
| Update | `varMeEmail` |

**⬇️ FORMULA: Paste into StudentEmail_DataCard1.Update**

```powerfx
varMeEmail
```

> ⚠️ **CRITICAL: Set Update on the DataCard itself, not the TextInput.** The `Update` property determines what actually gets written to SharePoint. By using `varMeEmail` (set in `App.OnStart` from `Office365Users.MyProfileV2().mail`), the correct SMTP email is always saved.

> 💡 **Why `varMeEmail` instead of `User().Email`?** At universities like LSU, students have multiple email aliases (e.g., `jsmith3@lsu.edu` and `john.smith@lsu.edu`). `User().Email` returns the UPN (sign-in identifier), but SharePoint may resolve Person fields using the primary SMTP address. By consistently using the SMTP address from `varMeEmail`, the gallery filter `StudentEmail = varMeEmail` always matches correctly.

26. Expand `StudentEmail_DataCard1` and click on the **TextInput control inside**.
27. Set these properties:

| Property | Value |
|----------|-------|
| Default | `varMeEmail` |
| DisplayMode | `DisplayMode.View` |

> 💡 **Why `varMeEmail`?** This displays the same SMTP email that gets saved to SharePoint. Since `varMeEmail` is already lowercase (set in `App.OnStart`), the gallery filter `StudentEmail = varMeEmail` works with a simple equality check, keeping the query **fully delegable** to SharePoint.

#### StudentEntraId_DataCard1 (Hidden - Auto-fill)

> **Purpose:** Hidden field stores the student's Entra Object ID (GUID). My Requests filters on this first (`StudentEntraId = Text(varMeEntraId)`). Flow E also uses it to validate email sender identity.

28. In the Fields pane, click **+ Add field** and select `StudentEntraId`.
29. Click on `StudentEntraId_DataCard1` itself (the DataCard).
30. Set these properties:

| Property | Value |
|----------|-------|
| Visible | `false` |
| Update | `varMeEntraId` |

**FORMULA: Paste into StudentEntraId_DataCard1.Update**

```powerfx
varMeEntraId
```

> 💡 **Why store Entra Object ID?** Even if a student's email changes (e.g., name change, alias switch), their Entra Object ID remains the same forever. Flow E uses this to verify that email replies come from the correct student, regardless of which email alias they reply from.

#### TigerCardNumber_DataCard1

28. Expand `TigerCardNumber_DataCard1` in Tree view.
29. Click on the **TextInput control inside**.
30. Set these properties:

| Property | Value |
|----------|-------|
| HintText | `"16-digit POS number from Tiger Card"` |
| MaxLength | `16` |

31. Click on `TigerCardNumber_DataCard1` itself (the card, not the input).
32. Set these properties:

| Property | Value |
|----------|-------|
| DisplayName | `"TigerCard Number"` |
| Required | `true` |
| Height | `240` |

> 💡 **Increased height** accommodates the example Tiger Card image and validation label below.

#### Add TigerCard Validation Label

This styled label provides real-time feedback when the TigerCard number isn't exactly 16 digits.

33. With `TigerCardNumber_DataCard1` expanded, click **+ Insert** → **Text label**.
34. **Rename it:** `lblTigerCardError`
35. Set these properties:

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

36. First, **upload the Tiger Card image** to the app:
    - In the left panel, click the **Media** icon (mountain/image icon)
    - Click **+ Add media** → **Upload**
    - Select your Tiger Card example image (showing where the POS number is located)
    - After upload, it will appear in your Media list — note the name (e.g., `Example TigerCard`)

37. With `TigerCardNumber_DataCard1` expanded, click **+ Insert** → **Media** → **Image**.
38. **Rename it:** `imgTigerCardExample`
39. Set these properties:

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

40. Expand `Course Number_DataCard1` in Tree view. Set the **card** **Height** to `99` and **Width** to `440` (same Width as the other visible Submit cards).
41. Click on the **TextInput control inside**.
42. Set these properties:

| Property | Value |
|----------|-------|
| HintText | `"e.g., 2001, 4000"` |

> 💡 **Optional field:** Course Number (numeric only) helps staff understand the context of the request but is not strictly required.

#### Discipline_DataCard1

43. Expand `Discipline_DataCard1` in Tree view.
44. Click on the **ComboBox control inside** (named `DataCardValue6`).
45. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices([@PrintRequests].Department)` |
| DefaultSelectedItems | `Blank()` |
| SelectMultiple | `false` |
| DisplayFields | `["Value"]` |
| SearchFields | `["Value"]` |
| InputTextPlaceholder | `"Associated with course number"` |
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

> ⚠️ **Important - Internal Name:** The SharePoint column's display name is "Discipline" but its **internal name** is `Department`. PowerApps `Choices()` function requires the internal name, which you can find in the column's URL when editing it in SharePoint (look for `Field=Department`).

45b. Click `DataCardKey6` (the “Discipline” field name). Set **Width** to `95` — not `Parent.Width - 60`, or the Required tag clips.

46. Click on `Discipline_DataCard1` itself (the card, not the ComboBox).
47. Set these properties:

| Property | Value |
|----------|-------|
| DataField | `"Department"` |
| Required | `true` |

> 💡 **Why required?** Discipline helps staff prioritize requests and understand the academic context of each print job.

> ⚠️ **Dropdown Empty Fix:** If the ComboBox appears empty even though `Choices()` returns data (test with a label: `CountRows(Choices(PrintRequests.Department))`), the control may be corrupted. **Fix:** Delete `DataCardValue6`, insert a new ComboBox inside the DataCard, rename it to `DataCardValue6`, and reapply the properties above.

> 📋 **SharePoint Discipline Choices:** The Discipline column in SharePoint should include all LSU colleges plus specific programs:
> - Agriculture, Architecture, Art, Business, Coast & Environment, Computer Science, Engineering, Human Sciences & Education, Humanities & Social Sciences, Interior Design, Landscape Architecture, Law, Mass Communication, Music & Dramatic Arts, Personal, Science, Veterinary Medicine

#### ProjectType_DataCard1

48. Expand `ProjectType_DataCard1` in Tree view.
49. Click on the **ComboBox control inside** (named `DataCardValue7`).
50. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices([@PrintRequests].ProjectType)` |
| DefaultSelectedItems | `Parent.Default` |
| SelectMultiple | `false` |
| DisplayFields | `["Value"]` |
| SearchFields | `["Value"]` |
| InputTextPlaceholder | `"What's this for?"` |
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

51. Click on `ProjectType_DataCard1` itself (the card, not the ComboBox).
52. Set these properties:

| Property | Value |
|----------|-------|
| DisplayName | `"Project Type"` |
| Required | `true` |

50b. Click `DataCardKey7` (the “Project Type” field name). Set **Width** to `135` — not `Parent.Width - 60`.

> 💡 **Why required?** Project Type (e.g., Class Project, Personal, Research) helps staff understand urgency and billing context.

> ⚠️ **Dropdown Empty Fix:** If the ComboBox appears empty even though `Choices()` returns data (test with a label: `CountRows(Choices(PrintRequests.ProjectType))`), the control may be corrupted. **Fix:** Delete `DataCardValue7`, insert a new ComboBox inside the DataCard, rename it to `DataCardValue7`, and reapply the properties above.

#### Method_DataCard1 (Controls Cascading)

53. Expand `Method_DataCard1` in Tree view.
54. Click on `Method_DataCard1` itself (the card) and set:

| Property | Value |
|----------|-------|
| Height | `280` |

> 💡 **Increased height** accommodates the method description label below the ComboBox.

55. Click on the **ComboBox control inside** (named `DataCardValue8`).
56. **Verify the name** of this control is `DataCardValue8` — this is referenced by Printer and Color cascading filters.
57. Set these properties:

| Property | Value |
|----------|-------|
| Items | `Choices([@PrintRequests].Method)` |
| DefaultSelectedItems | `Parent.Default` |
| OnChange | `Reset(DataCardValue10)` |
| SelectMultiple | `false` |
| DisplayFields | `["Value"]` |
| SearchFields | `["Value"]` |
| InputTextPlaceholder | `"What type of printer?"` |
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

> ⚠️ **Critical:** The Printer and Color dropdowns reference `DataCardValue8.Selected.Value` for cascading filters. If you rename this control, update those formulas accordingly.

> ⚠️ **Dropdown Empty Fix:** If the ComboBox appears empty even though `Choices()` returns data (test with a label: `CountRows(Choices(PrintRequests.Method))`), the control may be corrupted. **Fix:** Delete `DataCardValue8`, insert a new ComboBox inside the DataCard, rename it to `DataCardValue8`, and reapply the properties above.

#### Add Method Description Label

58. With `Method_DataCard1` expanded, click **+ Insert** → **Text label**.
59. **Rename it:** `lblMethodInfo`
60. Set these properties:

| Property | Value |
|----------|-------|
| X | `DataCardValue8.X` |
| Y | `DataCardValue8.Y + DataCardValue8.Height + 8` |
| Width | `DataCardValue8.Width` |
| Height | `180` |
| Fill | `RGBA(240, 248, 255, 1)` |
| Color | `varColorText` |
| Font | `varAppFont` |
| Size | `10` |
| PaddingTop | `varSpacingMD` |
| PaddingBottom | `varSpacingMD` |
| PaddingLeft | `varSpacingMD` |
| PaddingRight | `varSpacingMD` |
| BorderColor | `varColorInfo` |
| BorderThickness | `1` |

61. Set **Text:**

```powerfx
"Choose the appropriate print method for your model:

Filament:
• Description: Good resolution, suitable for simpler models. Fast.
• Best For: Medium items.
• Cost: Least expensive.

Resin:
• Description: Super high resolution and detail. Slow.
• Best For: Small items.
• Cost: More expensive."


```

> 💡 **Purpose:** This helps students choose the right print method based on their model's size and detail requirements.

> ⚠️ **Control Name:** The ComboBox control inside `Method_DataCard1` is named `DataCardValue8` in this example. Your control may have a different number suffix. Check the Tree view to find the actual name and replace `DataCardValue8` accordingly.

#### Printer_DataCard1 (Cascading Filter)

62. Expand `Printer_DataCard1` in Tree view.
63. Click on `Printer_DataCard1` itself (the card) and set:

| Property | Value |
|----------|-------|
| Height | `200` |

> 💡 **Increased height** accommodates the dimensions warning label below the ComboBox.

64. Click on the **ComboBox control inside** (named `DataCardValue10`).
65. Set these properties:

| Property | Value |
|----------|-------|
| Items | *(see cascading formula below)* |
| DefaultSelectedItems | `If(DataCardValue8.Selected.Value = "Resin", Table(LookUp(Choices([@PrintRequests].Printer), Value = "Form 3+ (5.7×5.7×7.3in)")), Table(Parent.Default))` |
| SelectMultiple | `false` |
| DisplayFields | `["Value"]` |
| SearchFields | `["Value"]` |
| InputTextPlaceholder | `"What size printer?"` |
| DisplayMode | `If(IsBlank(DataCardValue8.Selected.Value), DisplayMode.Disabled, DisplayMode.Edit)` |
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

> 💡 **Disabled Until Method Selected:** The Printer dropdown is disabled until the user selects a Method. This prevents invalid combinations and guides the user through the form in the correct order.

66. Set **Items** (cascading filter — shows printers based on Method selection in `DataCardValue8`):

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        DataCardValue8.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        DataCardValue8.Selected.Value = "Resin",
        Value = "Form 3+ (5.7×5.7×7.3in)",
        true
    )
)
```

> 💡 **Cascading Logic:** When Method (`DataCardValue8`) = "Filament" → shows FDM printers. When Method = "Resin" → shows only Form 3+. When Method is blank → shows all printers.
>
> **Auto-populate:** Because the Method combo resets the Printer combo on change and resin has only one valid printer, selecting `Resin` auto-populates `Form 3+`.

> ⚠️ **Dropdown Empty Fix:** If the ComboBox appears empty even though `Choices()` returns data (test with a label: `CountRows(Choices(PrintRequests.Printer))`), the control may be corrupted. **Fix:** Delete `DataCardValue10`, insert a new ComboBox inside the DataCard, rename it to `DataCardValue10`, and reapply the properties above.

#### Add Printer Dimensions Warning Label

67. With `Printer_DataCard1` expanded, click **+ Insert** → **Text label**.
68. **Rename it:** `lblDimensionsWarning`
69. Set these properties:

| Property | Value |
|----------|-------|
| X | `DataCardValue10.X` |
| Y | `DataCardValue10.Y + DataCardValue10.Height + 8` |
| Width | `DataCardValue10.Width` |
| Height | `90` |
| Fill | `RGBA(255, 244, 206, 1)` |
| Color | `RGBA(102, 77, 3, 1)` |
| Font | `varAppFont` |
| Size | `10` |
| PaddingTop | `varSpacingSM` |
| PaddingBottom | `varSpacingSM` |
| PaddingLeft | `varSpacingMD` |
| PaddingRight | `varSpacingMD` |
| BorderColor | `varColorWarning` |
| BorderThickness | `1` |

70. Set **Text:**

```powerfx
"Ensure your model's dimensions are within the specified limits for the printer you plan to use. If your model is too large, consider scaling it down or splitting it into parts. For more guidance, refer to the design guides on our Moodle page.

If exporting as .STL or .OBJ you MUST scale it down in millimeters BEFORE exporting. If you do not the scale will not work correctly."
```

#### Color_DataCard1 (Cascading Filter)

71. Expand `Color_DataCard1` in Tree view.
72. Click on the **ComboBox control inside** (named `DataCardValue9`).
73. Set these properties:

| Property | Value |
|----------|-------|
| Items | *(see cascading formula below)* |
| DefaultSelectedItems | `Parent.Default` |
| SelectMultiple | `false` |
| DisplayFields | `["Value"]` |
| SearchFields | `["Value"]` |
| InputTextPlaceholder | `""` |
| Width | `Parent.Width - 36` |
| DisplayMode | `If(IsBlank(DataCardValue8.Selected.Value), DisplayMode.Disabled, DisplayMode.Edit)` |
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

> 💡 **Disabled Until Method Selected:** The Color dropdown is disabled until the user selects a Method. This ensures the cascading filter shows the correct color options for the selected print method.

> 💡 **Single Select:** `SelectMultiple` must stay `false` here. The SharePoint `Color` column is a required single-choice field, so allowing multiple selections creates confusing UI chips and does not match the underlying data model.

74. Set **Items** (cascading filter — shows colors based on Method selection in `DataCardValue8`):

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

> 💡 **Cascading Logic:** When Method (`DataCardValue8`) = "Resin" → shows only Black, White, Gray, Clear. When Method ≠ "Resin" (Filament or blank) → shows all colors.

> ⚠️ **Dropdown Empty Fix:** If the ComboBox appears empty even though `Choices()` returns data (test with a label: `CountRows(Choices(PrintRequests.Color))`), the control may be corrupted. **Fix:** Delete `DataCardValue9`, insert a new ComboBox inside the DataCard, rename it to `DataCardValue9`, and reapply the properties above.

#### Add Live Color Preview Swatch

75. With `Color_DataCard1` expanded, click **+ Insert** → **Icons** → **Circle**.
76. **Rename it:** `cirColorPreviewBackdrop`
77. Set these properties:

| Property | Value |
|----------|-------|
| X | `DataCardValue9.X + DataCardValue9.Width + 8` |
| Y | `DataCardValue9.Y + (DataCardValue9.Height - Self.Height) / 2` |
| Width | `12` |
| Height | `12` |
| Fill | `RGBA(45, 45, 48, 1)` |
| Visible | `DataCardValue9.Selected.Value = "White" || DataCardValue9.Selected.Value = "Matte White" || DataCardValue9.Selected.Value = "Clear" || DataCardValue9.Selected.Value = "Light Gray" || DataCardValue9.Selected.Value = "Matte Light Gray" || DataCardValue9.Selected.Value = "Silver" || DataCardValue9.Selected.Value = "Any" || DataCardValue9.Selected.Value = "Yellow" || DataCardValue9.Selected.Value = "Matte Yellow" || DataCardValue9.Selected.Value = "Gold"` |
| AccessibleLabel | `""` |

78. Click **+ Insert** → **Icons** → **Circle** again.
79. **Rename it:** `cirColorPreview`
80. Set these properties:

| Property | Value |
|----------|-------|
| X | `cirColorPreviewBackdrop.X + 2` |
| Y | `cirColorPreviewBackdrop.Y + 2` |
| Width | `8` |
| Height | `8` |
| Visible | `!IsBlank(DataCardValue9.Selected.Value)` |
| Fill | See formula below |
| AccessibleLabel | `""` |

81. Set **Fill** for `cirColorPreview`:

```powerfx
Switch(
    DataCardValue9.Selected.Value,
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

> 💡 **Recommended Option 1:** This keeps the built-in ComboBox for accessibility and keyboard behavior, while adding a lightweight live swatch preview beside the control so students can immediately confirm the selected color.

> 💡 **Accessibility Note:** Per Microsoft Power Apps guidance surfaced via Context7, built-in dropdown/combobox controls are preferable to homemade combo-box patterns. The preview circles are decorative only, so their `AccessibleLabel` values are intentionally blank.

---

### 6E-2: Add Required Field Indicators

**What you're doing:** Adding separate red "(Required)" labels next to each field name that disappear once the field is filled in.

For each required field below, add a new label inside the DataCard positioned next to the field name.

#### Discipline Required Label

1. Expand `Discipline_DataCard1` in Tree view.
2. Click **+ Insert** → **Text label**.
3. **Rename it:** `lblDisciplineRequired`
4. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"(Required)"` |
| X | `DataCardKey6.X + Min(DataCardKey6.Width, 108) + 8` |
| Y | `DataCardKey6.Y` |
| Width | `85` |
| Height | `DataCardKey6.Height` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| FontStyle | `FontStyle.Italic` |
| Size | `12` |
| Visible | `IsBlank(DataCardValue6.Selected.Value)` |

#### Project Type Required Label

1. Expand `ProjectType_DataCard1` in Tree view.
2. Click **+ Insert** → **Text label**.
3. **Rename it:** `lblProjectTypeRequired`
4. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"(Required)"` |
| X | `DataCardKey7.X + Min(DataCardKey7.Width, 128) + 8` |
| Y | `DataCardKey7.Y` |
| Width | `85` |
| Height | `DataCardKey7.Height` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| FontStyle | `FontStyle.Italic` |
| Size | `12` |
| Visible | `IsBlank(DataCardValue7.Selected.Value)` |

#### TigerCardNumber Required Label

1. Expand `TigerCardNumber_DataCard1` in Tree view.
2. Click **+ Insert** → **Text label**.
3. **Rename it:** `lblTigerCardRequired`
4. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"(Required)"` |
| X | `DataCardKey31.X + DataCardKey31.Width + 5` |
| Y | `DataCardKey31.Y` |
| Width | `85` |
| Height | `DataCardKey31.Height` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| FontStyle | `FontStyle.Italic` |
| Size | `12` |
| Visible | `Len(DataCardValue30.Text) <> 16` |

#### Method Required Label

1. Expand `Method_DataCard1` in Tree view.
2. Click **+ Insert** → **Text label**.
3. **Rename it:** `lblMethodRequired`
4. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"(Required)"` |
| X | `DataCardKey8.X + DataCardKey8.Width + 5` |
| Y | `DataCardKey8.Y` |
| Width | `85` |
| Height | `DataCardKey8.Height` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| FontStyle | `FontStyle.Italic` |
| Size | `12` |
| Visible | `IsBlank(DataCardValue8.Selected.Value)` |

#### Printer Required Label

1. Expand `Printer_DataCard1` in Tree view.
2. Click **+ Insert** → **Text label**.
3. **Rename it:** `lblPrinterRequired`
4. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"(Required)"` |
| X | `DataCardKey10.X + DataCardKey10.Width + 5` |
| Y | `DataCardKey10.Y` |
| Width | `85` |
| Height | `DataCardKey10.Height` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| FontStyle | `FontStyle.Italic` |
| Size | `12` |
| Visible | `IsBlank(DataCardValue10.Selected.Value)` |

#### Color Required Label

1. Expand `Color_DataCard1` in Tree view.
2. Click **+ Insert** → **Text label**.
3. **Rename it:** `lblColorRequired`
4. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"(Required)"` |
| X | `DataCardKey9.X + DataCardKey9.Width + 5` |
| Y | `DataCardKey9.Y` |
| Width | `85` |
| Height | `DataCardKey9.Height` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| FontStyle | `FontStyle.Italic` |
| Size | `12` |
| Visible | `IsBlank(DataCardValue9.Selected.Value)` |

#### Attachments Required Label

1. Expand `Attachments_DataCard1` in Tree view.
2. Click **+ Insert** → **Text label**.
3. **Rename it:** `lblAttachmentsRequired`
4. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"(Required)"` |
| X | `786` |
| Y | `11` |
| Width | `85` |
| Height | `DataCardKey32.Height` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| FontStyle | `FontStyle.Italic` |
| Size | `12` |
| Visible | `CountRows(DataCardValue31.Attachments) = 0` |

> 💡 **How it works:** Each "(Required)" label is positioned right after the field name and only shows when the field is empty. The red italic text provides clear visual feedback that disappears as students complete each required field.

> ⚠️ **Field name width:** `DataCardKey` must be sized to the word, not `Parent.Width - 60`. Otherwise the Required label starts past the card edge and clips to “(Re”. Live: Discipline **95**, Project Type **135**, Method **79**, Printer **78**, Color **59**, TigerCard Number **171**. Discipline / Project Type also cap the tag X with `Min(DataCardKey.Width, 108|128) + 8`. Visible Submit DataCards are **Width = 440** (not 442) so three columns fit without covering the tag.

---

#### DueDate_DataCard1

75. Click on `DueDate_DataCard1` itself (the card) and set:

| Property | Value |
|----------|-------|
| DisplayName | `"Due Date"` |

76. Expand `DueDate_DataCard1` in Tree view.
77. Click on the **DatePicker control inside** (e.g., `DataCardValue11`).
78. Set **DefaultDate** to default to today's date:

```powerfx
If(frmSubmit.Mode = FormMode.New, Today(), Parent.Default)
```

> 💡 **Default to Today:** This sets the date picker to today's date for new submissions, while preserving the existing date when editing.

#### Notes_DataCard1

79. Expand `Notes_DataCard1` in Tree view.
80. Click on the **TextInput control inside**.
81. Set these properties:

| Property | Value |
|----------|-------|
| Mode | `TextMode.MultiLine` |
| HintText | `"Special instructions, scaling notes, questions for staff..."` |

#### Attachments_DataCard1

82. Click on `Attachments_DataCard1` in Tree view.
83. Set these properties:

| Property | Value |
|----------|-------|
| Required | `false` |
| Height | `280` |

> ✅ **Native Attachments:** Because we're using EditForm with `SubmitForm()`, file attachments work automatically. No extra configuration needed!

> 💡 **Increased height** accommodates the file warning label below the attachment control.

#### Status_DataCard1 (Hidden, Auto-Set)

84. Click on `Status_DataCard1` in Tree view.
85. Set these properties:

| Property | Value |
|----------|-------|
| Visible | `false` |

86. Click on the **ComboBox control inside** `Status_DataCard1`.
87. Set **DefaultSelectedItems:**

```powerfx
If(
    frmSubmit.Mode = FormMode.New,
    [{Value: "Uploaded"}],
    Table(Parent.Default)
)
```

88. Set this additional property:

| Property | Value |
|----------|-------|
| SelectMultiple | `false` |
| InputTextPlaceholder | `"Select status..."` |

> This ensures new submissions always start with Status = "Uploaded".

---

### 6F: Add File Warning Label

89. Expand `Attachments_DataCard1` in Tree view and select it.
90. Click **+ Insert** → **Text label**.
91. **Rename it:** `lblFileWarning`
92. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingMD` |
| Y | `DataCardKey.Y + DataCardKey.Height + varSpacingMD` |
| Width | `Parent.Width - (varSpacingMD * 2)` |
| Height | `180` |
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

93. Set **Text:**

```powerfx
"IMPORTANT: File Requirements

Accepted formats: .stl, .obj, .3mf, .idea, .form
Maximum file size: 50MB per file

Tip: Include your name and details in the filename for easy identification.
Example: JaneDoe_Filament_Blue.stl

Send us ONE FILE with all of your parts and pieces. Do not upload multiple files at a time unless absolutely necessary."
```

---

### 6F-2: Configure File Name Validation

> ⚠️ **Why client-side validation?** Previously, file validation happened after submission (in Flow A), resulting in rejection emails that confused students. By validating filenames *before* submission, students get immediate feedback and can fix issues on the spot.

**What this validates:**
- File extension must be `.stl`, `.obj`, `.3mf`, `.idea`, or `.form`
- Filename must follow the format `Name_Method_Color.ext` (exactly 3 underscore-separated parts)

#### Configure Attachments Control Events

89a. Expand `Attachments_DataCard1` in Tree view.
89b. Click on the **Attachments control** inside (usually named `DataCardValue31` — look for the paperclip icon).
89c. Set **OnAddFile:**

```powerfx
// Validate all attached files whenever a new file is added
Set(varInvalidFiles,
    Filter(
        Self.Attachments,
        With(
            {
                baseName: First(Split(Name, ".")).Value,
                ext: Lower(Last(Split(Name, ".")).Value)
            },
            // Invalid if: wrong extension OR not exactly 3 underscore parts
            Not(ext in ["stl", "obj", "3mf", "idea", "form"]) ||
            CountRows(Split(baseName, "_")) <> 3
        )
    )
);
Set(varHasInvalidFile, CountRows(varInvalidFiles) > 0)
```

89d. Set **OnRemoveFile:**

```powerfx
// Re-validate remaining files when a file is removed
Set(varInvalidFiles,
    Filter(
        Self.Attachments,
        With(
            {
                baseName: First(Split(Name, ".")).Value,
                ext: Lower(Last(Split(Name, ".")).Value)
            },
            Not(ext in ["stl", "obj", "3mf", "idea", "form"]) ||
            CountRows(Split(baseName, "_")) <> 3
        )
    )
);
Set(varHasInvalidFile, CountRows(varInvalidFiles) > 0)
```

> 💡 **How it works:** Each time a file is added or removed, we filter the attachments to find any that don't meet our requirements. The `varInvalidFiles` collection contains all problematic files, and `varHasInvalidFile` is a simple boolean for the submit button.

> ⚠️ **Control Name:** Your Attachments control may have a different number (e.g., `DataCardValue27`). Expand `Attachments_DataCard1` in Tree view to find the control with the paperclip icon.

---

### 6G: Add Submit Button

94. Click **+ Insert** → **Button**.
95. **Rename it:** `btnSubmit`
96. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"SUBMIT REQUEST"` |
| X | `varSpacingXL` |
| Y | `588` |
| Width | `Parent.Width - (varSpacingXL * 2)` |
| Height | `varBtnHeightLarge` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorPrimary, -15%)` |
| PressedFill | `ColorFade(varColorPrimary, -25%)` |
| DisabledFill | `varColorDisabled` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

97. Set **DisplayMode** (validates required fields, TigerCard length, file attachment, and filename format):

```powerfx
If(
    frmSubmit.Valid && 
    Len(TigerCardNumber_DataCard1.Update) = 16 &&
    CountRows(DataCardValue31.Attachments) > 0 &&
    !varHasInvalidFile,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

> ⚠️ **Control Name:** `DataCardValue31` is the Attachments control inside `Attachments_DataCard1`. Your number may differ — expand `Attachments_DataCard1` in Tree view to find the control with the paperclip icon.

> 💡 **Form Validation:** EditForm automatically tracks if all required fields are filled via `frmSubmit.Valid`. We also check that the Tiger Card number is exactly 16 digits, that at least one file has been attached, and that all filenames follow the required format (via `varHasInvalidFile` from Step 6F-2).

98. Set **OnSelect:**

```powerfx
// Track that user attempted to submit (for showing validation errors)
Set(varSubmitAttempted, true);

// Only proceed if form is valid, file is attached, and filenames are valid
If(
    frmSubmit.Valid && 
    Len(TigerCardNumber_DataCard1.Update) = 16 &&
    CountRows(DataCardValue31.Attachments) > 0 &&
    !varHasInvalidFile,
    Set(varIsLoading, true);
    SubmitForm(frmSubmit)
)
```

> 💡 **Submit Attempt Tracking:** We set `varSubmitAttempted` to true when the user clicks Submit. This allows the validation message to only appear after they've tried to submit, not while they're still filling out the form.

---

### 6H: Add Validation Feedback Label

This label shows students exactly which fields need attention — but only after they try to submit.

99. Click **+ Insert** → **Text label**.
100. **Rename it:** `lblValidationMessage`
101. Set these properties:

| Property | Value |
|----------|-------|
| X | `varSpacingXL` |
| Y | `550` |
| Width | `Parent.Width - (varSpacingXL * 2)` |
| Height | `60` |
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

> 💡 **Height for multi-line messages:** The increased height (60px) accommodates 2-3 line validation messages (wrong file type, wrong filename format, or both). The Y position is adjusted to prevent overlap with the submit button.

102. Set **Visible** (only show after submit attempt):

```powerfx
varSubmitAttempted && (
    !frmSubmit.Valid || 
    Len(TigerCardNumber_DataCard1.Update) <> 16 ||
    CountRows(DataCardValue31.Attachments) = 0 ||
    varHasInvalidFile
)
```

103. Set **Text:**

```powerfx
If(
    CountRows(DataCardValue31.Attachments) = 0,
    "Please attach your 3D model file before submitting.",
    varHasInvalidFile,
    With(
        {
            invalidFile: First(varInvalidFiles),
            baseName: First(Split(First(varInvalidFiles).Name, ".")).Value,
            ext: Lower(Last(Split(First(varInvalidFiles).Name, ".")).Value)
        },
        With(
            {
                hasValidExt: ext in ["stl", "obj", "3mf", "idea", "form"],
                hasValidFormat: CountRows(Split(baseName, "_")) = 3
            },
            If(
                !hasValidExt && hasValidFormat,
                "Invalid file type: ." & ext & Char(10) &
                "Accepted formats: .stl, .obj, .3mf, .idea, .form",
                hasValidExt && !hasValidFormat,
                "Invalid filename format: " & invalidFile.Name & Char(10) &
                "Required: YourName_Method_Color.ext" & Char(10) &
                "Example: JaneDoe_Filament_Blue.3mf",
                "Invalid file: " & invalidFile.Name & Char(10) &
                "Use format: YourName_Method_Color.ext" & Char(10) &
                "Accepted: .stl, .obj, .3mf, .idea, .form"
            )
        )
    ),
    Len(TigerCardNumber_DataCard1.Update) <> 16 && !IsBlank(TigerCardNumber_DataCard1.Update),
    "Tiger Card number must be exactly 16 digits.",
    "You must fill in all required fields before submitting."
)
```

> 💡 **Specific feedback:** The message prioritizes the most common issue (missing file attachment), then provides specific feedback for file issues:
> - **Wrong extension only** → "Invalid file type: .xyz" with accepted formats
> - **Wrong format only** → "Invalid filename format" with naming example
> - **Both wrong** → Combined guidance for extension and format

---

### 6I: Configure Form Events

104. Click on `frmSubmit` in Tree view.
105. Set **OnSuccess:**

```powerfx
Set(varIsLoading, false);
Set(varSubmitAttempted, false);  // Reset for next submission
Notify("Request submitted successfully! You'll receive a confirmation email shortly.", NotificationType.Success);
ResetForm(frmSubmit);
Navigate(scrMyRequests, varScreenTransition)
```

106. Set **OnFailure:**

```powerfx
Set(varIsLoading, false);
Notify(
    "Error: " & frmSubmit.Error,
    NotificationType.Error,
    5000
)
```

> 💡 **Show the actual error:** By displaying `frmSubmit.Error`, students (and staff) can see exactly what went wrong. Common errors include "List data validation failed" (check SharePoint column settings) or permission issues. This makes debugging much easier than a generic message.

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
            ▼ Student_DataCard1
                lblStudentName           ← displays varMeName
                DataCardValue3 (hidden)  ← ComboBox hidden
            Status_DataCard1 (hidden)
            Title_DataCard1 (hidden) ← bottom of form
    ▼ conHeader                     ← created first (BOTTOM = behind)
        imgUserPhoto                ← user profile photo
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

> 💡 **Important:** Both Printer and Color dropdowns are **disabled until Method is selected**. This guides users to select the print method first, ensuring the cascading filters show the correct options.

#### Printer Filter Logic

When configuring `Printer_DataCard1`'s ComboBox Items property, use this filter (replacing the control name with your actual Method control):

```powerfx
Filter(
    Choices([@PrintRequests].Printer),
    If(
        DataCardValue8.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        DataCardValue8.Selected.Value = "Resin",
        Value = "Form 3+ (5.7×5.7×7.3in)",
        true
    )
)
```

**Result:**
- Filament → Shows Prusa MK4S, Prusa XL, Raised3D
- Resin → Shows Form 3+ only

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

#### DisplayMode (Disable Until Method Selected)

Set this on both Printer and Color ComboBox controls to disable them until Method is selected:

```powerfx
If(IsBlank(DataCardValue8.Selected.Value), DisplayMode.Disabled, DisplayMode.Edit)
```

**Result:**
- Method blank → Printer and Color dropdowns are grayed out and unclickable
- Method selected → Printer and Color dropdowns become active

---

### Attachment Support

Because we're using EditForm with `SubmitForm()`, file attachments work **automatically**. The `Attachments_DataCard1` that was auto-generated handles all file upload functionality.

> ⚠️ **Required Configuration:** You must increase the `MaxAttachmentSize` property to allow files larger than the 10MB default. See Step 6E below.

#### 6E: Configure MaxAttachmentSize (Required)

The PowerApps Attachment control defaults to **10MB** max file size. To allow 3D model files up to 50MB:

1. In Tree view, expand `Attachments_DataCard1`
2. Click on the **DataCardValue** control (the one with the paperclip icon — may be named `DataCardValue31` or similar)
3. In the Properties pane on the right, find **MaxAttachmentSize**
4. Set it to `50` (this is in MB)

| Property | Value | Notes |
|----------|-------|-------|
| MaxAttachmentSize | `50` | Maximum file size in MB (default is 10) |

> **Why 50MB?** While SharePoint supports 250MB attachments, PowerApps has a practical ceiling of ~50MB for the Attachment control. Files larger than this may fail to upload or become corrupted. Most 3D model files (STL, OBJ, 3MF) are well under 50MB.

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
| X | `20` |
| Y | `11` |
| Width | `Parent.Width - 120` |
| Height | `30` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `18` |
| Color | `Color.White` |

#### Add User Profile Image

13. Click **+ Insert** → **Media** → **Image**.
14. **Rename it:** `imgUserPhoto2`
15. Set these properties:

| Property | Value |
|----------|-------|
| Image | `Office365Users.UserPhotoV2(varMeUPN)` |
| X | `Parent.Width - 100` |
| Y | `(Parent.Height - Self.Height) / 2` |
| Width | `40` |
| Height | `40` |
| ImagePosition | `ImagePosition.Fill` |
| RadiusTopLeft | `20` |
| RadiusTopRight | `20` |
| RadiusBottomLeft | `20` |
| RadiusBottomRight | `20` |

> 💡 **Circular Profile Photo:** Positioned to the left of the refresh button.

#### Add Refresh Button

16. Click **+ Insert** → **Button**.
17. **Rename it:** `btnRefresh`
18. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Refresh"` |
| X | `Parent.Width - 84` |
| Y | `15` |
| Width | `64` |
| Height | `22` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| Font | `varAppFont` |
| Size | `8` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

19. Set **OnSelect:**

```powerfx
Refresh(PrintRequests);
Refresh(LabStatus);
Set(varLabStatus, LookUp(LabStatus, Title = "Current"));
If(
    !IsBlank(varLabStatus),
    Set(varLabHours, Coalesce(varLabStatus.LabHours, varLabHours));
    Set(varPickupLocation, Coalesce(varLabStatus.PickupLocation, varPickupLocation))
);
With(
    {
        wMine: If(
            !IsBlank(varMeEntraId),
            Filter(
                PrintRequests,
                StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
            ),
            Filter(
                PrintRequests,
                StudentEmail = varMeEmail || StudentEmail = varMeUPN
            )
        )
    },
    Set(
        varNeedsConfirmCount,
        CountRows(
            Filter(
                wMine,
                Status.Value = "Pending",
                Not(StudentConfirmed)
            )
        )
    );
    Set(
        varPickupReadyCount,
        CountRows(
            Filter(
                wMine,
                Status.Value = "Completed"
            )
        )
    )
);
Notify("Requests refreshed!", NotificationType.Information)
```

---

### 7B: Create Navigation Container

17. With `scrMyRequests` selected, click **+ Insert** → **Layout** → **Container**.
18. **Rename it:** `conNavBar2`
19. Copy the same structure from `conNavBar` on Screen 2, but swap active/inactive styles:

| Control | Property | Value |
|---------|----------|-------|
| `recNavBg2` | Fill | `varColorHeader` |
| `btnNavHome2` | Fill | `varNavBtnInactiveFill` |
| `btnNavHome2` | OnSelect | `Navigate(scrHome, varScreenTransition)` |
| `btnNavHome2` | Size | `varBtnFontSize` |
| `btnNavHome2` | BorderThickness | `0` |
| `btnNavHome2` | FocusedBorderThickness | `varFocusedBorderThickness` |
| `btnNavSubmit2` | Text | `"New Request"` |
| `btnNavSubmit2` | Fill | `varNavBtnInactiveFill` |
| `btnNavSubmit2` | OnSelect | `Navigate(scrSubmit, varScreenTransition)` |
| `btnNavSubmit2` | Size | `varBtnFontSize` |
| `btnNavSubmit2` | BorderThickness | `0` |
| `btnNavSubmit2` | FocusedBorderThickness | `varFocusedBorderThickness` |
| `btnNavMyRequests2` | Fill | `varColorInfo` |
| `btnNavMyRequests2` | OnSelect | `// Already on this screen` |
| `btnNavMyRequests2` | Size | `varBtnFontSize` |
| `btnNavMyRequests2` | BorderThickness | `0` |
| `btnNavMyRequests2` | FocusedBorderThickness | `varFocusedBorderThickness` |

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
| TemplateSize | `varRequestCardHeight` |

> 💡 **WrapCount = 3** creates a grid layout with 3 cards per row! Each card will be approximately 330px wide on a 1024px tablet screen.

4. Set the **Items** property:

**⬇️ FORMULA: Paste into galMyRequests Items**

```powerfx
If(
    !IsBlank(varMeEntraId),
    SortByColumns(
        Filter(
            PrintRequests,
            StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
        ),
        "Created",
        SortOrder.Descending
    ),
    SortByColumns(
        Filter(
            PrintRequests,
            StudentEmail = varMeEmail || StudentEmail = varMeUPN
        ),
        "Created",
        SortOrder.Descending
    )
)
```

> 💡 **How it works:** Prefer **Entra Object ID** (immutable). `User().EntraObjectId` is a GUID; SharePoint `StudentEntraId` is text, so compare with `Text(varMeEntraId)`. Email fallback still matches SMTP (`varMeEmail`) or UPN (`varMeUPN`) for older rows with a blank Entra ID. Newest first.

> ⚠️ **If Entra ID is blank:** Do **not** write `StudentEntraId = Blank()` — that would match every row with an empty Entra ID. The outer `If` uses email-only when `varMeEntraId` is blank.

> 💡 **Delegation:** Equality on text columns is delegable. Do **not** wrap SharePoint columns in `Lower()` — `varMeEmail` and `varMeUPN` are already Lower in `App.OnStart`. Index **StudentEntraId** and **StudentEmail** in SharePoint list settings (see PrintRequests list setup Step 6b).

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
| Visible | `galMyRequests.AllItemsCount = 0` |

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
| RadiusTopLeft | `12` |
| RadiusTopRight | `12` |
| RadiusBottomLeft | `12` |
| RadiusBottomRight | `12` |

> 💡 **Styled Card:** The card uses `varColorBgCard` for a warm cream background with rounded corners.

#### Request ID (ReqKey)

12. Click **+ Insert** → **Text label**.
13. **Rename it:** `lblReqKey`
14. Set these properties:

| Property | Value |
|----------|-------|
| Text | `If(!IsBlank(ThisItem.ReqKey), ThisItem.ReqKey, "Job #" & ThisItem.ID)` |
| X | `12` |
| Y | `14` |
| Width | `Parent.TemplateWidth - 240` |
| Height | `24` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Size | `14` |
| Color | `varColorText` |

#### Relative age (Staff `lblSubmittedTime`)

14A. Click **+ Insert** → **Text label**.
14B. **Rename it:** `lblSubmittedTime`
14C. Align right, `Color = varColorDanger`, Size 8, `X = Parent.TemplateWidth - 230`, `Y = 16`, Width 90. Use the Staff `DateDiff` minutes formula (`Just now` / `2d 21h` / `3h 12m`).

#### Status Badge

15. Click **+ Insert** → **Button**.
16. **Rename it:** `btnStatusBadge`
17. Set these properties:

| Property | Value |
|----------|-------|
| Text | `ThisItem.Status.Value` |
| X | `Parent.TemplateWidth - 132` |
| Y | `10` |
| Width | `120` |
| Size | `10` |
| Radius (all) | `10` |
| DisplayMode | `DisplayMode.View` |
| Fill | `RGBA(70, 130, 220, 1)` |
| Color | `Color.White` |

#### Submission Date (email-row slot)

20. Click **+ Insert** → **Text label**.
21. **Rename it:** `lblSubmitDate`
22. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Submitted: " & Text(ThisItem.Created, varDateFormatShort)` |
| X | `13` |
| Y | `45` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `22` |
| Size | `9` |
| Color | `varColorTextMuted` |

#### Filename (Staff formula)

22A. Click **+ Insert** → **Text label**. Rename `lblFilename`. Size **9**, Open Sans, muted, **not italic**, `FontWeight.Normal`, `X = 13`, `Y = 72`. Printer (`lblPrinter`) is **size 8**; color name (`lblColorText`) is **size 10**.

```powerfx
With(
    {
        wParts: Split(
            Trim(Coalesce(ThisItem.Student.DisplayName, varMeName)),
            " "
        )
    },
    Lower(First(wParts).Value & Last(wParts).Value) & "_" &
    Lower(ThisItem.Method.Value) & "_" &
    Substitute(Lower(ThisItem.Color.Value), " ", "")
)
```

#### Color swatch + printer (Staff names)

23. Insert two **Circle** controls: `cirColorDotBackdrop` (16×16, X 16, Y 103, gray fill, visible for light colors) then `cirColorDot` (12×12, X 18, Y 105) so the fill sits in front.
24. **Rename** the color label `lblColorText` — Text `ThisItem.Color.Value`, Size 10, X 36, Y 101.
25. **Rename** the printer label `lblPrinter` — Size 8, X 180, Y 101. Do **not** look up build plates.

```powerfx
"🖨 " & Trim(If(Find("(", ThisItem.Printer.Value) > 0, Left(ThisItem.Printer.Value, Find("(", ThisItem.Printer.Value) - 1), ThisItem.Printer.Value))
```

26. Set **Fill** for `cirColorDot` (same Switch as Staff `galJobCards`):

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

Backdrop **Visible** (light colors only):

```powerfx
ThisItem.Color.Value = "White" || ThisItem.Color.Value = "Matte White" || ThisItem.Color.Value = "Clear" || ThisItem.Color.Value = "Light Gray" || ThisItem.Color.Value = "Matte Light Gray" || ThisItem.Color.Value = "Silver" || ThisItem.Color.Value = "Any" || ThisItem.Color.Value = "Yellow" || ThisItem.Color.Value = "Matte Yellow" || ThisItem.Color.Value = "Gold"
```

> 💡 Student cards skip Staff-only rows: student name/email, lightbulb, Build Plates, Notes, Details grid.

#### Estimates (Staff `lblEstimates`)

27. Click **+ Insert** → **Text label**.
28. **Rename it:** `lblEstimates`
29. Set these properties:

| Property | Value |
|----------|-------|
| X | `12` |
| Y | `128` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `20` |
| Size | `10` |
| Color | `varColorTextMuted` |
| Visible | `!IsBlank(ThisItem.EstimatedWeight)` or FinalWeight or EstimatedCost |

30. Set **Text** (weight · time · cost; Resin uses mL; Paid & Picked Up uses finals; cost-only fallback if weight is blank):

```powerfx
If(
    ThisItem.Status.Value = "Paid & Picked Up" && !IsBlank(ThisItem.FinalCost),
    "⚖ " & Text(ThisItem.FinalWeight) & "g" &
    " · 💲" & Text(ThisItem.FinalCost, "[$-en-US]#,##0.00"),
    If(
        !IsBlank(ThisItem.EstimatedWeight),
        "⚖ " & Text(ThisItem.EstimatedWeight) &
        If(ThisItem.Method.Value = "Resin", "mL", "g") &
        If(!IsBlank(ThisItem.EstimatedTime), " · ⏱ ~" & Text(ThisItem.EstimatedTime) & "h", "") &
        If(!IsBlank(ThisItem.EstimatedCost), " · 💲" & Text(ThisItem.EstimatedCost, "[$-en-US]#,##0.00"), ""),
        If(!IsBlank(ThisItem.EstimatedCost), "💲 " & Text(ThisItem.EstimatedCost, "[$-en-US]#,##0.00"), "")
    )
)
```

#### Action: Confirm Estimate Button (Pending status only)

31. Click **+ Insert** → **Button**.
32. **Rename it:** `btnConfirmEstimate`
33. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"Confirm Estimate"` |
| X | `12` |
| Y | `165` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `varBtnHeight` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorSuccess, -15%)` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Font | `varAppFont` |
| Size | `varBtnFontSize` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
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
| X | `12` |
| Y | `218` |
| Width | `150` |
| Height | `varBtnHeight` |
| Fill | `varColorDanger` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorDanger, -15%)` |
| PressedFill | `ColorFade(varColorDanger, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Visible | `ThisItem.Status.Value in ["Uploaded", "Pending", "Ready to Print"]` |

38. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowCancelModal, ThisItem.ID)
```

#### Action: Messages Button (Read-only thread)

38b. Click **+ Insert** → **Button**. Rename it `btnViewMessages`. Place it to the right of Cancel (`X = 172`, `Y = 218`, `Width = 110`, `Height = varBtnHeight`). Visible on every card. **Text stays `"Messages"`** — do not put a count on the button.

| Property | Value |
|----------|-------|
| Text | `"Messages"` |
| Fill | `If(!IsBlank(LookUp(RequestComments, RequestID = ThisItem.ID)), varColorDanger, Color.White)` |
| Color | `If(!IsBlank(LookUp(RequestComments, RequestID = ThisItem.ID)), Color.White, varColorPrimary)` |
| BorderColor | `If(!IsBlank(LookUp(RequestComments, RequestID = ThisItem.ID)), varColorDanger, varColorPrimary)` |
| BorderThickness | `varInputBorderThickness` |
| HoverFill | `If(!IsBlank(LookUp(RequestComments, RequestID = ThisItem.ID)), ColorFade(varColorDanger, -15%), varColorPrimary)` |
| HoverColor | `Color.White` |
| HoverBorderColor | `ColorFade(Self.BorderColor, 20%)` |
| PressedFill | `If(!IsBlank(LookUp(RequestComments, RequestID = ThisItem.ID)), ColorFade(varColorDanger, -25%), ColorFade(varColorPrimary, -15%))` |
| Size | `10` |

38c. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowViewMessagesModal, ThisItem.ID);
ClearCollect(colStudentRequestComments, Filter(RequestComments, RequestID = ThisItem.ID))
```

> Requires the **RequestComments** SharePoint list as a data source (same site as PrintRequests). Do not `ClearCollect` the whole comments list on OnStart.

#### Action: Files Button (Download attachments)

38d. Click **+ Insert** → **Button**. Rename it `btnViewFiles`. Place it to the right of Messages (`X = 292`, `Y = 218`, `Width = 90`, `Height = varBtnHeight`). Same outline style as Messages. Visible on every card.

38e. Set **OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
Set(varShowFilesModal, ThisItem.ID)
```

#### Status Message (For statuses with no actions)

39. Click **+ Insert** → **Text label**.
40. **Rename it:** `lblStatusMessage`
41. Set these properties:

| Property | Value |
|----------|-------|
| X | `12` |
| Y | `155` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `60` |
| Size | `11` |
| Color | `If(ThisItem.Status.Value = "Rejected", varColorDanger, RGBA(100, 100, 100, 1))` |

42. Set **Text:**

```powerfx
Switch(
    ThisItem.Status.Value,
    "Printing", "Your print is currently in progress.",
    "Completed", "Ready for pickup at " & varPickupLocation & Char(10) & "Payment: " & varPaymentMethod,
    "Paid & Picked Up", "Picked up on " & Text(ThisItem.PaymentDate, varDateFormatShort),
    "Rejected",
        "Rejected" & If(
            !IsBlank(ThisItem.RejectionComment),
            ": " & ThisItem.RejectionComment,
            If(
                !IsBlank(Concat(ThisItem.RejectionReason, Value, "; ")),
                ": " & Concat(ThisItem.RejectionReason, Value, "; "),
                ". Check your email for details."
            )
        ),
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
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `18` |
| Color | `varColorSuccess` |

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
| Font | `varAppFont` |
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
| Height | `varBtnHeightLarge` |
| Fill | `varColorSuccess` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorSuccess, -15%)` |
| PressedFill | `ColorFade(varColorSuccess, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `14` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

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
| Y | `recConfirmModal.Y + 320 + varBtnHeightLarge + varSpacingMD` |
| Width | `recConfirmModal.Width - 40` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

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
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `18` |
| Color | `varColorDanger` |

### Warning Message

14. Click **+ Insert** → **Text label**.
15. **Rename it:** `lblCancelMessage`
16. Set these properties:

| Property | Value |
|----------|-------|
| X | `recCancelModal.X + 20` |
| Y | `recCancelModal.Y + 60` |
| Width | `recCancelModal.Width - 40` |
| Height | `120` |
| Size | `12` |
| Color | `RGBA(80, 80, 80, 1)` |

17. Set **Text:**

```powerfx
"Are you sure you want to cancel request " & Coalesce(varSelectedItem.ReqKey, "this print") & "?" & Char(10) & Char(10) &
If(
    varSelectedItem.Status.Value = "Ready to Print",
    "Staff may already be preparing this print. If you are not sure, email " & varSupportEmail & " or visit " & varPickupLocation & " before canceling." & Char(10) & Char(10) &
    "This cannot be undone. You would need to submit a new request.",
    "This action cannot be undone. You'll need to submit a new request if you change your mind."
)
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
| Height | `varBtnHeight` |
| Fill | `varColorDanger` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorDanger, -15%)` |
| PressedFill | `ColorFade(varColorDanger, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Bold` |
| Size | `13` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

21. Set **OnSelect:**

```powerfx
Set(varIsLoading, true);
IfError(
    With(
        {wRow: LookUp(PrintRequests, ID = varShowCancelModal)},
        Patch(
            PrintRequests,
            wRow,
            {
                Status: {Value: "Canceled"},
                LastAction: {Value: "Canceled by Student"},
                LastActionAt: Now(),
                StaffNotes: If(
                    IsBlank(wRow.StaffNotes),
                    "Canceled by student " & Text(Now(), varDateFormatShort),
                    Concatenate(
                        wRow.StaffNotes,
                        " | ",
                        "Canceled by student " & Text(Now(), varDateFormatShort)
                    )
                )
            }
        )
    );
    Set(varIsLoading, false);
    Set(varShowCancelModal, 0);
    Set(varSelectedItem, Blank());
    Notify("Request canceled successfully.", NotificationType.Information);
    Refresh(PrintRequests),
    Notify(
        "Could not cancel the request. Please try again.",
        NotificationType.Error,
        5000
    );
    Set(varIsLoading, false)
)
```

### Keep Request Button

22. Click **+ Insert** → **Button**.
23. **Rename it:** `btnCancelNo`
24. Set these properties:

| Property | Value |
|----------|-------|
| Text | `"No, Keep Request"` |
| X | `recCancelModal.X + 20` |
| Y | `recCancelModal.Y + 160 + varBtnHeight + varSpacingXL` |
| Width | `recCancelModal.Width - 40` |
| Height | `varBtnHeight` |
| Fill | `varColorNeutral` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorNeutral, -15%)` |
| PressedFill | `ColorFade(varColorNeutral, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |

25. Set **OnSelect:**

```powerfx
Set(varShowCancelModal, 0);
Set(varSelectedItem, Blank())
```

### Read-only Messages Modal (`conViewMessagesModal`)

Screen-level container, **Visible** = `varShowViewMessagesModal > 0`. Cream modal (`varColorBgCard`) 560 tall, max 600 wide. Gallery `galViewMessages` is variable-height; **Items** = `Sort(colStudentRequestComments, SentAt, SortOrder.Descending)`. Bubbles match Staff Console: Outbound = staff (blue, right, SENT), Inbound = student (cream, left, REPLY). Author uses `Author0.DisplayName`. Close (`btnViewMsgClose`) clears the collection. Empty state: **No messages yet.** Footer hint: reply by email. No compose, no Patch.

### Read-only Files Modal (`conFilesModal`)

Screen-level container, **Visible** = `varShowFilesModal > 0`. Cream modal 420 tall. **`frmStudentFiles`** is a view-only form (`DefaultMode = FormMode.View`) on `PrintRequests`, **Item** = `LookUp(PrintRequests, ID = varShowFilesModal)`. The Attachments control (`attStudentFiles`) is **DisplayMode.View** — tap the file name to download. Do not use `Launch(ThisItem.Value)` (SharePoint blobs do not open). Empty when `CountRows(LookUp(PrintRequests, ID = varShowFilesModal).Attachments) = 0`.

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
   - [ ] With no Pending-confirm and no Completed jobs, the “needs you” line is hidden
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
   - [ ] Red “(Required)” appears next to Discipline, Project Type, Method, Printer, Color, Tiger Card, and Attachments until each is filled
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
   - [ ] Home “needs you” line is orange and says the print is waiting for OK
4. Click the button
5. Verify:
   - [ ] Modal shows estimate details
   - [ ] Click "I CONFIRM" → StudentConfirmed becomes true
   - [ ] Flow B should automatically change status to "Ready to Print"
   - [ ] After confirming, the orange Home line hides (unless another job still needs OK)

### Test 6: Different Status States

Have staff move a request through different statuses and verify:
- [ ] Ready to Print: Shows "in queue" message
- [ ] Printing: Shows "in progress" message
- [ ] Completed: Shows pickup instructions
- [ ] Home “needs you” line is green (“ready for pickup”) when this student has a Completed job and no Pending-confirm jobs
- [ ] My Requests **Messages** is red with white text when that job has any `RequestComments`; blue outline with no count when it does not
- [ ] Paid & Picked Up: Shows completion date

### Test 7: Home Lab today (staff business)

Requires [LabStatus](../SharePoint/LabStatus-List-Setup.md) + [Flow J](../PowerAutomate/Flow-(J)-LabStatus-Refresh.md).

1. Run Flow J (or wait for the 15-minute schedule)
2. Open the Student Portal as a **student** test account (not a staff account that can see every PrintRequests row)
3. On Home, verify:
   - [ ] Cream **Lab today** card appears under the welcome line
   - [ ] BusyLevel pill matches the `Current` row (Quiet / Typical / Busy / Packed)
   - [ ] Waiting and printing counts match LabStatus (not the student’s own job count)
   - [ ] Filament / Resin waiting numbers match
   - [ ] Typical-wait sentence shows
   - [ ] Hours banner still shows Open/Closed + pickup
4. In SharePoint, type a **StaffMessage** on `Current` (for example `XL down today`) and refresh Home
   - [ ] Orange note appears and the card grows
5. Clear StaffMessage, refresh
   - [ ] Note hides and the card shrinks
6. Confirm the student **cannot** see other people’s jobs anywhere on Home

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

**Cause:** The gallery filter doesn't match the logged-in user's email.

**Root Cause (UPN vs SMTP Mismatch):**
At universities like LSU, students have multiple email aliases:
- **UPN (User Principal Name):** `jsmith3@lsu.edu` — the sign-in identifier returned by `User().Email`
- **SMTP (Primary Email):** `john.smith@lsu.edu` — the email address used by SharePoint, Exchange, and displayed in profile

If the app uses `User().Email` directly, it may save the UPN, but SharePoint's Person fields may resolve to the SMTP address. This mismatch causes the gallery filter to fail.

**Solution:** Use `Office365Users.MyProfileV2().mail` to get the actual SMTP address:

```powerfx
// In App.OnStart - retrieve SMTP email with fallback
Set(varUserProfile, IfError(Office365Users.MyProfileV2(), Blank()));
Set(varMeEmail, Lower(Coalesce(varUserProfile.mail, User().Email)));
Set(varMeUPN, Lower(User().Email));
```

Then filter by Entra ID first, with email fallback (no `Lower()` on SharePoint columns — emails are already Lower in OnStart):
```powerfx
If(
    !IsBlank(varMeEntraId),
    Filter(
        PrintRequests,
        StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
    ),
    Filter(
        PrintRequests,
        StudentEmail = varMeEmail || StudentEmail = varMeUPN
    )
)
```

> ⚠️ **Why NOT Claims?** The `Student` Person field is auto-populated, but `StudentEmail` (a text field) remains the most reliable filter key because it's a simple text comparison and fully delegable.

---

## Problem: Student sees empty "My Requests" but request exists in Staff Dashboard

**Symptom:** A student submits a request, staff processes it, student receives email notification, but when they click through to view their request, the My Requests page is completely empty.

**Root Cause: UPN vs SMTP Email Mismatch**

This is almost always caused by the **User Principal Name (UPN) vs SMTP email mismatch**:

| Identity Type | Example | Source |
|--------------|---------|--------|
| UPN (sign-in) | `jsmith3@lsu.edu` | `User().Email` returns this |
| SMTP (primary email) | `john.smith@lsu.edu` | SharePoint/Exchange may store this |

Both are valid email aliases for the same student, but if the record was saved with one format and the filter uses the other, **no match**.

**Common Causes:**

1. **UPN vs SMTP mismatch:** The record was saved using `User().Email` (UPN), but `varMeEmail` now uses the SMTP address from `Office365Users.MyProfileV2().mail`. Or vice versa for legacy records.

2. **Case mismatch:** Email comparison is case-sensitive. Ensure both `StudentEmail` (saved) and `varMeEmail` (filter) are lowercase.

3. **Office 365 Users connector not added:** If the connector wasn't added or consent failed, `varUserProfile.mail` may be blank, causing `varMeEmail` to fall back to UPN.

4. **Old records with wrong email format:** Records created before implementing the SMTP fix may have UPN-based emails that don't match the new SMTP-based `varMeEmail`.

**How to diagnose:**

1. Add temporary debug labels to the My Requests screen:
   ```powerfx
   // Label showing current user identity info
   "SMTP: " & varMeEmail & " | UPN: " & varMeUPN & " | Entra ID: " & varMeEntraId
   
   // Label showing what's stored in first item
   "First item StudentEmail: " & First(PrintRequests).StudentEmail
   ```

2. Compare all three values. If `StudentEmail` matches `varMeUPN` but not `varMeEmail`, the record was saved with UPN.

3. The dual-filter (`varMeEmail || varMeUPN`) should catch both formats.

**Solution (Recommended):**

Use a filter that matches BOTH email formats to handle the transition period:

```powerfx
If(
    !IsBlank(varMeEntraId),
    SortByColumns(
        Filter(
            PrintRequests,
            StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
        ),
        "Created",
        SortOrder.Descending
    ),
    SortByColumns(
        Filter(
            PrintRequests,
            StudentEmail = varMeEmail || StudentEmail = varMeUPN
        ),
        "Created",
        SortOrder.Descending
    )
)
```

> 💡 **Why Entra ID plus email?** `StudentEntraId` is the durable match (survives email changes). Email still catches older rows with a blank Entra ID, and both SMTP and UPN. Do not wrap SharePoint columns in `Lower()`.

> ⚠️ **Why `StudentEmail` instead of `Student.Claims`?** The `StudentEmail` text field is auto-populated and never modified, making it reliable for filtering. Text comparison is simpler and more delegable than Person field comparisons. `StudentEntraId` is also text; compare with `Text(varMeEntraId)` because `User().EntraObjectId` is a GUID.

**Quick fix for existing records:**

If a student can't see their request, manually edit it in SharePoint:
1. Open the request item in SharePoint
2. Check the `StudentEmail` field value
3. Update it to match either their SMTP email (preferred) or UPN
4. Save the item

**Long-term fix — Backfill via Power Automate:**

Create a Power Automate flow to normalize all existing records:
1. Trigger: Manual or scheduled
2. Get all PrintRequests items
3. For each item: Look up the user by current `StudentEmail`, get their SMTP from Graph API, update the field
4. Index **StudentEntraId** and **StudentEmail** in SharePoint (list settings → Indexed columns) so the gallery filter stays delegable as the list grows.

**Prevention:**

Ensure `StudentEmail_DataCard1.Update` is set to:
```powerfx
varMeEmail
```

This saves the SMTP email (retrieved from `Office365Users.MyProfileV2().mail` in `App.OnStart`) rather than the UPN.

---

## Problem: Cascading dropdowns not filtering

**Cause:** Formula references wrong control name.

**Solution:** Verify the Method dropdown is named `ddMethod` and update the Printer/Color Items formulas to reference it correctly.

---

## Problem: Dropdown choices are empty (Choices() returns nothing)

**Cause:** The `Choices()` function requires the SharePoint column's **internal name**, not its display name. If a column was renamed after creation, the internal name remains the original name.

**How to find the internal name:**
1. Go to SharePoint → List settings → Click on the column
2. Look at the URL — it contains `Field=InternalName`
3. Example: URL shows `Field=Department` even though display name is "Discipline"

**Solution:** Use the internal name in your formula:
```powerfx
// Wrong - using display name:
Choices([@PrintRequests].Discipline)

// Correct - using internal name:
Choices([@PrintRequests].Department)
```

**Common mismatches in this app:**
| Display Name | Internal Name | Notes |
|--------------|---------------|-------|
| Discipline | `Department` | Column was renamed after creation |

> 💡 **Tip:** Also ensure the DataCard's `DataField` property matches the internal name.

---

## Problem: ComboBox in form is empty but Choices() works outside form

**Cause:** The ComboBox control inside the DataCard has become corrupted. This can happen after modifying certain properties like InputTextPlaceholder, DisplayName labels, or adding sibling controls. The control appears functional but silently fails to display items.

**Diagnostic test:**
1. Add a Label outside the form with: `CountRows(Choices(PrintRequests.Method))`
2. Add a standalone ComboBox outside the form with: `Items: Choices(PrintRequests.Method)`
3. If both work but the form ComboBox is empty, the control is corrupted.

**Solution:** Recreate the ComboBox control:
1. Note down all current property values (Items, DisplayFields, DefaultSelectedItems, etc.)
2. Delete the corrupted ComboBox (e.g., `DataCardValue8`)
3. With the DataCard selected, click **+ Insert** → **Input** → **Combo box**
4. Rename the new ComboBox to match the original name (e.g., `DataCardValue8`)
5. Reapply all properties from step 1
6. If other controls reference this ComboBox (cascading filters), verify they still work

**Expected control names in this app:**
| DataCard | ComboBox Name |
|----------|---------------|
| Discipline_DataCard1 | `DataCardValue6` |
| ProjectType_DataCard1 | `DataCardValue7` |
| Method_DataCard1 | `DataCardValue8` |
| Color_DataCard1 | `DataCardValue9` |
| Printer_DataCard1 | `DataCardValue10` |

> ⚠️ **Prevention:** When modifying form fields, avoid changing control names or certain internal properties. If dropdowns stop working after edits, try the recreate approach above.

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

**For debugging**, the `frmSubmit.OnFailure` now shows the actual error by default:
```powerfx
Notify("Error: " & frmSubmit.Error, NotificationType.Error)
```

Common error messages:
- **"List data validation failed"** — Check SharePoint column Required/Validation settings
- **"Access denied"** — Student doesn't have Contribute permission to PrintRequests list
- **"The specified user could not be found"** — Student Person field format issue (check `Student_DataCard1.Update` formula)

---

## Problem: Home Lab today card is missing or blank

**Symptom:** Welcome and the two action cards show, but there is no cream **Lab today** card (or it is empty).

**Checks (in order):**

1. **LabStatus data source** — Data panel must list `LabStatus`. If it is missing, add it (same site as PrintRequests).
2. **The `Current` row** — SharePoint LabStatus must have **exactly one** item with Title = `Current`.
3. **Item-level security** — LabStatus **Read access** must be **Read all items**. If it is “only their own,” students cannot see a row staff created.
4. **Student Read permission** — The student account must have **Read** on LabStatus (not Contribute).
5. **Run OnStart / reopen Home** — `varLabStatus` is set in App.OnStart and `scrHome.OnVisible`. Click **Run OnStart**, then open Home.
6. **Flow J has run** — Counts stay `0` / BusyLevel `Quiet` until Flow J runs. The card should still appear.

Do **not** “fix” this by counting `PrintRequests` from the student app. That either fails or shows only that student’s jobs.

---

# Quick Reference Card

## Key Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `varUserProfile` | Record | Cached Office 365 user profile |
| `varMeEmail` | Text | Current user's **SMTP email** (lowercase) — used for `StudentEmail` |
| `varMeName` | Text | Current user's display name |
| `varMeEntraId` | Text | Current user's Entra Object ID (GUID) — immutable identifier |
| `varMeUPN` | Text | Current user's UPN (sign-in identifier) — used for Person field Claims |
| `varShowConfirmModal` | Number | ID of item for confirmation (0=hidden) |
| `varShowCancelModal` | Number | ID of item for cancellation (0=hidden) |
| `varShowViewMessagesModal` | Number | ID of item for message history (0=hidden) |
| `varShowFilesModal` | Number | ID of item for file download (0=hidden) |
| `varMessageBubbleWidth` | Number | Message bubble width fraction (0.85) |
| `varSelectedItem` | Record | Currently selected PrintRequest item |
| `varLabStatus` | Record | `LookUp(LabStatus, Title = "Current")` — Home Lab today card |
| `varLabHours` | Text | Posted hours (LabStatus when present) |
| `varPickupLocation` | Text | Pickup room (LabStatus when present) |

## Screen Navigation

| From | To | Formula |
|------|-----|---------|
| scrHome | scrSubmit | `Navigate(scrSubmit, varScreenTransition)` |
| scrHome | scrMyRequests | `Navigate(scrMyRequests, varScreenTransition)` |
| scrSubmit | scrHome | `Navigate(scrHome, varScreenTransition)` |
| scrSubmit | scrMyRequests | `Navigate(scrMyRequests, varScreenTransition)` |
| scrMyRequests | scrHome | `Navigate(scrHome, varScreenTransition)` |
| scrMyRequests | scrSubmit | `Navigate(scrSubmit, varScreenTransition)` |

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
If(
    !IsBlank(varMeEntraId),
    Filter(
        PrintRequests,
        StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
    ),
    Filter(
        PrintRequests,
        StudentEmail = varMeEmail || StudentEmail = varMeUPN
    )
)
```

> 💡 Prefer Entra ID (`Text(varMeEntraId)` because SharePoint stores text). Email fallback matches SMTP and UPN for older rows. No `Lower()` on columns.

**Printer by Method:**
```powerfx
Filter(
    Choices(PrintRequests.Printer),
    If(ddMethod.Selected.Value = "Filament", Value in [...], ddMethod.Selected.Value = "Resin", Value = "Form 3+...", true)
)
```

**Disable Printer/Color Until Method Selected:**
```powerfx
If(IsBlank(DataCardValue8.Selected.Value), DisplayMode.Disabled, DisplayMode.Edit)
```

---

# Code Reference (Copy-Paste Snippets)

## App.OnStart

```powerfx
// === USER IDENTIFICATION ===
// CRITICAL: Resolve user identity correctly for reliable "My Requests" filtering
// User().Email returns UPN (sign-in identifier), which may differ from SMTP email
// Office365Users.MyProfileV2().mail returns the actual SMTP address

// Cache user profile from Office 365 Users connector (call once for performance)
Set(varUserProfile, IfError(Office365Users.MyProfileV2(), Blank()));

// Primary email: SMTP address from profile, fallback to UPN if unavailable
Set(varMeEmail, Lower(Coalesce(varUserProfile.mail, User().Email)));

// Display name: Profile name with fallback
Set(varMeName, Coalesce(varUserProfile.displayName, User().FullName));

// Entra Object ID: Immutable GUID (survives email/name changes)
Set(varMeEntraId, User().EntraObjectId);

// UPN (for SharePoint Person field Claims - must use sign-in identifier)
Set(varMeUPN, Lower(User().Email));

// === UI STATE ===
Set(varShowConfirmModal, 0);
Set(varShowCancelModal, 0);
Set(varSelectedItem, LookUp(PrintRequests, false));  // Typed blank
Set(varNeedsConfirmCount, 0);
Set(varPickupReadyCount, 0);
Set(varSubmitAttempted, false);  // For validation message display
Set(varInvalidFiles, Table());   // Files with invalid names
Set(varHasInvalidFile, false);   // Quick check for submit button
Set(varIsLoading, false);

// Lab today snapshot (after Set(varLabHours) / Set(varPickupLocation) defaults)
Set(varLabStatus, LookUp(LabStatus, Title = "Current"));
If(
    !IsBlank(varLabStatus),
    Set(varLabHours, Coalesce(varLabStatus.LabHours, varLabHours));
    Set(varPickupLocation, Coalesce(varLabStatus.PickupLocation, varPickupLocation))
);

// === STYLING ===
Set(varAppFont, Font.'Open Sans');

// === STATUS COLORS ===
Set(varStatusColors, Table(
    {Status: "Uploaded", Color: varColorPrimary},
    {Status: "Pending", Color: RGBA(255, 185, 0, 1)},
    {Status: "Ready to Print", Color: varColorSuccess},
    {Status: "Printing", Color: varColorWarning},
    {Status: "Completed", Color: varColorPrimary},
    {Status: "Paid & Picked Up", Color: varColorSuccess},
    {Status: "Rejected", Color: varColorDanger},
    {Status: "Canceled", Color: RGBA(138, 136, 134, 1)},
    {Status: "Archived", Color: RGBA(96, 94, 92, 1)}
))

// Home banner counts. Run OnStart zeros these earlier and does not re-fire scrHome.OnVisible.
Refresh(PrintRequests);
With(
    {
        wMine: If(
            !IsBlank(varMeEntraId),
            Filter(
                PrintRequests,
                StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
            ),
            Filter(
                PrintRequests,
                StudentEmail = varMeEmail || StudentEmail = varMeUPN
            )
        )
    },
    Set(
        varNeedsConfirmCount,
        CountRows(
            Filter(
                wMine,
                Status.Value = "Pending",
                Not(StudentConfirmed)
            )
        )
    );
    Set(
        varPickupReadyCount,
        CountRows(
            Filter(
                wMine,
                Status.Value = "Completed"
            )
        )
    )
)
```

## Home Lab today (staff business)

**Load snapshot** (`App.OnStart` loads LabStatus then recounts Home banner jobs from PrintRequests; `scrHome.OnVisible` refreshes both lists; My Requests `btnRefresh` refreshes both):

```powerfx
Concurrent(
    Refresh(PrintRequests),
    Refresh(LabStatus)
);
Set(varLabStatus, LookUp(LabStatus, Title = "Current"));
If(
    !IsBlank(varLabStatus),
    Set(varLabHours, Coalesce(varLabStatus.LabHours, varLabHours));
    Set(varPickupLocation, Coalesce(varLabStatus.PickupLocation, varPickupLocation))
)
```

**conLabToday Height:**

```powerfx
If(IsBlank(varLabStatus) || IsBlank(varLabStatus.StaffMessage), 148, 178)
```

**Align Lab Status (left) and Welcome (right) to the action cards:**

```powerfx
// conSubmitCard / conRequestsCard (equal columns)
X left: varSpacingSM
X right: conSubmitCard.X + conSubmitCard.Width + varSpacingXL
Width: (Parent.Width - varSpacingSM * 2 - varSpacingXL) / 2
Height: Parent.Height - varSpacingMD * 2
Y: varSpacingMD

// conLabToday
X: conActionCards.X + conSubmitCard.X
Y: varHeaderHeight + 20
Width: conSubmitCard.Width

// conWelcome
X: conActionCards.X + conRequestsCard.X
Y: conLabToday.Y
Width: conRequestsCard.Width
Height: conLabToday.Height
```

**btnBusyLevel Fill / Color / Text:**

```powerfx
Switch(
    varLabStatus.BusyLevel.Value,
    "Quiet", RGBA(16, 124, 16, 1),
    "Typical", RGBA(255, 185, 0, 1),
    "Busy", varColorWarning,
    "Packed", RGBA(209, 52, 56, 1),
    varColorNeutral
)

If(varLabStatus.BusyLevel.Value = "Typical", RGBA(0, 0, 0, 1), Color.White)

Coalesce(varLabStatus.BusyLevel.Value, "—")
```

**Counts and chips:**

```powerfx
If(
    Coalesce(varLabStatus.JobsWaiting, 0) = 1,
    "1 waiting",
    Coalesce(varLabStatus.JobsWaiting, 0) & " waiting"
) & "  ·  " & If(
    Coalesce(varLabStatus.JobsPrinting, 0) = 1,
    "1 printing",
    Coalesce(varLabStatus.JobsPrinting, 0) & " printing"
)

"Filament " & Coalesce(varLabStatus.FilamentWaiting, 0)
"Resin " & Coalesce(varLabStatus.ResinWaiting, 0)
```

**Typical wait footer:**

```powerfx
Coalesce(varLabStatus.TypicalWaitText, "Typical wait after you confirm: 1–3 lab days")
    & If(IsBlank(varLabStatus.UpdatedAt), "", "  ·  Updated " & Text(varLabStatus.UpdatedAt, DateTimeFormat.ShortTime))
```

`lblLabStaffMessage.Visible` = `!IsBlank(varLabStatus.StaffMessage)`

---

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
            Claims: "i:0#.f|membership|" & varMeUPN,  // Claims must use UPN (sign-in identifier)
            Email: varMeEmail  // Email uses SMTP address
        },
        StudentEmail: varMeEmail,  // SMTP address for gallery filtering
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

Navigate(scrMyRequests, varScreenTransition)
```

## Form OnFailure (Show Actual Error)

```powerfx
Set(varIsLoading, false);
Notify(
    "Error: " & frmSubmit.Error,
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
"IMPORTANT: File Requirements

Accepted formats: .stl, .obj, .3mf, .idea, .form
Maximum file size: 50MB per file

Tip: Include your name and details in the filename for easy identification.
Example: JaneDoe_Filament_Blue.stl

Send us ONE FILE with all of your parts and pieces. Do not upload multiple files at a time unless absolutely necessary."
```

## File Name Validation (Attachments OnAddFile/OnRemoveFile)

```powerfx
// Validate all attached files - checks extension and underscore format
Set(varInvalidFiles,
    Filter(
        Self.Attachments,
        With(
            {
                baseName: First(Split(Name, ".")).Value,
                ext: Lower(Last(Split(Name, ".")).Value)
            },
            // Invalid if: wrong extension OR not exactly 3 underscore parts
            Not(ext in ["stl", "obj", "3mf", "idea", "form"]) ||
            CountRows(Split(baseName, "_")) <> 3
        )
    )
);
Set(varHasInvalidFile, CountRows(varInvalidFiles) > 0)
```

> 💡 **How it works:** Validates each filename has a valid 3D file extension AND follows the `Name_Method_Color.ext` format (exactly 3 underscore-separated parts before the extension).

## Submit Button DisplayMode (with File Validation)

```powerfx
If(
    frmSubmit.Valid && 
    Len(TigerCardNumber_DataCard1.Update) = 16 &&
    CountRows(DataCardValue31.Attachments) > 0 &&
    !varHasInvalidFile,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

## Validation Message Text (with File Validation)

```powerfx
If(
    CountRows(DataCardValue31.Attachments) = 0,
    "Please attach your 3D model file before submitting.",
    varHasInvalidFile,
    With(
        {
            invalidFile: First(varInvalidFiles),
            baseName: First(Split(First(varInvalidFiles).Name, ".")).Value,
            ext: Lower(Last(Split(First(varInvalidFiles).Name, ".")).Value)
        },
        With(
            {
                hasValidExt: ext in ["stl", "obj", "3mf", "idea", "form"],
                hasValidFormat: CountRows(Split(baseName, "_")) = 3
            },
            If(
                !hasValidExt && hasValidFormat,
                "Invalid file type: ." & ext & Char(10) &
                "Accepted formats: .stl, .obj, .3mf, .idea, .form",
                hasValidExt && !hasValidFormat,
                "Invalid filename format: " & invalidFile.Name & Char(10) &
                "Required: YourName_Method_Color.ext" & Char(10) &
                "Example: JaneDoe_Filament_Blue.3mf",
                "Invalid file: " & invalidFile.Name & Char(10) &
                "Use format: YourName_Method_Color.ext" & Char(10) &
                "Accepted: .stl, .obj, .3mf, .idea, .form"
            )
        )
    ),
    Len(TigerCardNumber_DataCard1.Update) <> 16 && !IsBlank(TigerCardNumber_DataCard1.Update),
    "Tiger Card number must be exactly 16 digits.",
    "Please fill in all required fields before submitting."
)
```

## Required Field Label Indicators

Separate "(Required)" labels positioned next to field names. Common properties:

| Property | Value |
|----------|-------|
| Text | `"(Required)"` |
| Width | `85` |
| Color | `varColorDanger` |
| Font | `varAppFont` |
| FontStyle | `FontStyle.Italic` |
| Size | `12` |

**Per-field configuration:**

| Label | DataCard | Position X | Position Y | Height | Visible |
|-------|----------|------------|------------|--------|---------|
| `lblTigerCardRequired` | TigerCardNumber | `DataCardKey31.X + DataCardKey31.Width + 5` | `DataCardKey31.Y` | `DataCardKey31.Height` | `Len(DataCardValue30.Text) <> 16` |
| `lblDisciplineRequired` | Discipline | `DataCardKey6.X + Min(DataCardKey6.Width, 108) + 8` | `DataCardKey6.Y` | `DataCardKey6.Height` | `IsBlank(DataCardValue6.Selected.Value)` |
| `lblProjectTypeRequired` | Project Type | `DataCardKey7.X + Min(DataCardKey7.Width, 128) + 8` | `DataCardKey7.Y` | `DataCardKey7.Height` | `IsBlank(DataCardValue7.Selected.Value)` |
| `lblMethodRequired` | Method | `DataCardKey8.X + DataCardKey8.Width + 5` | `DataCardKey8.Y` | `DataCardKey8.Height` | `IsBlank(DataCardValue8.Selected.Value)` |
| `lblPrinterRequired` | Printer | `DataCardKey10.X + DataCardKey10.Width + 5` | `DataCardKey10.Y` | `DataCardKey10.Height` | `IsBlank(DataCardValue10.Selected.Value)` |
| `lblColorRequired` | Color | `DataCardKey9.X + DataCardKey9.Width + 5` | `DataCardKey9.Y` | `DataCardKey9.Height` | `IsBlank(DataCardValue9.Selected.Value)` |
| `lblAttachmentsRequired` | Attachments | `786` | `11` | `DataCardKey32.Height` | `CountRows(DataCardValue31.Attachments) = 0` |

## My Requests Gallery Items

```powerfx
If(
    !IsBlank(varMeEntraId),
    SortByColumns(
        Filter(
            PrintRequests,
            StudentEntraId = Text(varMeEntraId) || StudentEmail = varMeEmail || StudentEmail = varMeUPN
        ),
        "Created",
        SortOrder.Descending
    ),
    SortByColumns(
        Filter(
            PrintRequests,
            StudentEmail = varMeEmail || StudentEmail = varMeUPN
        ),
        "Created",
        SortOrder.Descending
    )
)
```

## Confirm Estimate OnSelect

```powerfx
Set(varIsLoading, true);
IfError(
    Patch(
        PrintRequests,
        LookUp(PrintRequests, ID = varShowConfirmModal),
        {StudentConfirmed: true}
    );
    Set(varIsLoading, false);
    Set(varShowConfirmModal, 0);
    Set(varSelectedItem, Blank());
    Set(varNeedsConfirmCount, Max(0, Coalesce(varNeedsConfirmCount, 0) - 1));
    Notify("Estimate confirmed! Your print is now in the queue.", NotificationType.Success);
    Refresh(PrintRequests),
    Notify(
        "Could not confirm the estimate. Please try again.",
        NotificationType.Error,
        5000
    );
    Set(varIsLoading, false)
)
```

## Cancel Request OnSelect

```powerfx
Set(varIsLoading, true);
IfError(
    With(
        {wRow: LookUp(PrintRequests, ID = varShowCancelModal)},
        Patch(
            PrintRequests,
            wRow,
            {
                Status: {Value: "Canceled"},
                LastAction: {Value: "Canceled by Student"},
                LastActionAt: Now(),
                StaffNotes: If(
                    IsBlank(wRow.StaffNotes),
                    "Canceled by student " & Text(Now(), varDateFormatShort),
                    Concatenate(
                        wRow.StaffNotes,
                        " | ",
                        "Canceled by student " & Text(Now(), varDateFormatShort)
                    )
                )
            }
        )
    );
    Set(varIsLoading, false);
    Set(varShowCancelModal, 0);
    Set(varSelectedItem, Blank());
    Notify("Request canceled successfully.", NotificationType.Information);
    Refresh(PrintRequests),
    Notify(
        "Could not cancel the request. Please try again.",
        NotificationType.Error,
        5000
    );
    Set(varIsLoading, false)
)
```

## Printer Cascading Filter

```powerfx
Filter(
    Choices(PrintRequests.Printer),
    If(
        ddMethod.Selected.Value = "Filament",
        Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"],
        ddMethod.Selected.Value = "Resin",
        Value = "Form 3+ (5.7×5.7×7.3in)",
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

# Reference: File Requirements

## Accepted File Formats

| Extension | Description |
|-----------|-------------|
| `.stl` | Standard mesh format (most common) |
| `.obj` | Object file format |
| `.3mf` | 3D Manufacturing Format |
| `.idea` | PrusaSlicer project file |
| `.form` | Formlabs project file |

## File Size Limit

**Maximum:** 50MB per file

> **Important:** This limit is imposed by PowerApps, not SharePoint. While SharePoint supports files up to 250MB, the PowerApps Attachment control has a practical ceiling of ~50MB. The default `MaxAttachmentSize` property is only 10MB — you must explicitly increase it (see Step 6E below for configuration).
>
> If students receive errors uploading files under 50MB, verify that `MaxAttachmentSize` is set to `50` on the Attachments control.

## Recommended Naming (Optional)

While not required, descriptive filenames help staff identify and organize files:

**Suggested format:** `Name_Method_Color.extension`

| Filename | Notes |
|----------|-------|
| `JaneDoe_Filament_Blue.stl` | Easy to identify student and preferences |
| `MikeSmith_Resin_Clear.3mf` | Includes all relevant info |
| `Gear_Assembly_v2.stl` | Also acceptable - describes the model |

## Valid vs Invalid Examples

| Filename | Valid? | Notes |
|----------|--------|-------|
| `MyModel.stl` | ✅ Yes | Valid extension |
| `project.3mf` | ✅ Yes | Valid extension |
| `JaneDoe_Filament_Blue.obj` | ✅ Yes | Valid extension |
| `design.form` | ✅ Yes | Valid extension |
| `model.pdf` | ❌ No | Invalid file type |
| `project.gcode` | ❌ No | Invalid file type |
| `image.jpg` | ❌ No | Invalid file type |

> **Note:** Flow A validates file extensions after submission. Files with invalid extensions are automatically rejected with an email notification to the student.

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
