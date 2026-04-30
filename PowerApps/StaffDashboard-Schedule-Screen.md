# Schedule Screen — Staff Dashboard Canvas App

**⏱️ Time Required:** 2–3 hours  
**🎯 Goal:** A live color-coded semester schedule showing all active student workers, with inline editing so each person can enter their own hours

> 📚 **This is a screen addition to the existing Staff Dashboard app.** Complete the SharePoint update before starting here.
>
> Dashboard note: the shared `scrDashboard` search bar now matches printer text too, so staff can type tokens like `xl` or `mk4s` and see both the card list and status counts narrow to that printer subset. This schedule screen's totals sorting is unchanged by that dashboard update.

**Live YAML (coauthor):** [PowerApps/canvas-coauthor/scrSchedule.pa.yaml](canvas-coauthor/scrSchedule.pa.yaml) — run **`sync_canvas`** before comparing Studio to this repo.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Design Standards](#design-standards)
3. [Overview](#overview-how-the-schedule-screen-works)
4. [Step 1: Update App.OnStart](#step-1-update-apponstart)
5. [Step 2: Add the Schedule Nav Button to scrDashboard](#step-2-add-the-schedule-nav-button-to-scrdashboard)
6. [Step 3: Create the scrSchedule Screen](#step-3-create-the-scrschedule-screen)
7. [Step 4: Build the Header Bar](#step-4-build-the-header-bar)
8. [Step 5: Build the Edit Bar](#step-5-build-the-edit-bar)
9. [Step 6: Build the HtmlViewer schedule grid](#step-6-build-the-htmlviewer-schedule-grid)
10. [Step 7: Save Logic](#step-7-save-logic)
11. [Step 8: Sortable Totals Section](#step-8-sortable-totals-section)
12. [Troubleshooting](#troubleshooting)
13. [Seasonal Maintenance](#seasonal-maintenance)
14. [Live coauthor control inventory (scrSchedule)](#live-coauthor-control-inventory-scrschedule)
15. [Audit findings](#audit-findings-schedule-doc-vs-live-yaml)

---

## Prerequisites

Before starting, confirm all of the following:

- [ ] `Staff` list configured per [SharePoint/Staff-List-Setup.md](../SharePoint/Staff-List-Setup.md) (Member, Role, Active, AidType, SchedSortOrder)
- [ ] `StaffShifts` list created per [SharePoint/StaffShifts-List-Setup.md](../SharePoint/StaffShifts-List-Setup.md)
- [ ] `AidType` populated for all active student workers
- [ ] In Power Apps Studio: **Data** → add the **StaffShifts** SharePoint list as a data source (same site as `Staff`)
- [ ] You can open the Staff Dashboard app in **Power Apps Studio** (make.powerapps.com → Apps → Edit StaffDashboard)
- [ ] The existing app is working (print requests dashboard is functional)

> **Two data sources:** `Staff` (who they are, caps, column order) and `StaffShifts` (one row per shift, unlimited per person per day).

---

## ⚠️ Curly Quotes Warning

When copying formulas from this guide, curly/smart quotes (`"text"`) will cause errors. Power Apps only accepts straight quotes.

**Fix:** After pasting any formula, delete the quotation marks and retype them using `Shift + '` on your keyboard.

---

## Design Standards

This screen reuses the same variables already defined in `App.OnStart`. Key variables you will use:

| Variable | Value | Use |
|----------|-------|-----|
| `varAppFont` | `Font.'Open Sans'` | All text controls |
| `varColorPrimary` | Blue `RGBA(70,130,220,1)` | Primary buttons |
| `varColorHeader` | Dark gray `RGBA(77,77,77,1)` | Header bar |
| `varColorBg` | Light gray `RGBA(248,248,248,1)` | Screen background |
| `varColorBgCard` | Warm cream `RGBA(247,237,223,1)` | Card backgrounds |
| `varColorBorder` | `RGBA(200,200,200,1)` | Borders |
| `varBtnBorderRadius` | `4` | Standard button corners |

---

## Overview: How the Schedule Screen Works

```
┌──────────────────────────────────────────────────────┐
│  HEADER BAR  Schedule          [← Dashboard]         │
├──────────────────────────────────────────────────────┤
│  EDIT BAR  [ComboBox: Select Your Name ▼] … [Save] … │
│  (gallery + Save/Cancel when a name is selected)     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  HTMLVIEWER GRID (read-only colored block schedule)  │
│                                                      │
│  [Time] ║ Mon: JAKE SARA TOM ║ Tue: JAKE SARA ... ║  │
│  8:30   ║  ██   ░░   ░░    ║  ██   ██   ░░    ║     │
│  9:00   ║  ██   ██   ░░    ║  ░░   ██   ██    ║     │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

- The **HtmlViewer** grid shows the live schedule from `colSchedLookup` (built from `StaffShifts` + `colSchedStaff`)
  - **Per-day filtering:** Each day column shows **only** the people who have shifts on that specific day (not all staff). This reduces visual clutter and makes each day easier to read.
  - Days with no shifts show "No shifts" instead of empty columns.
- The **Edit Bar** lets someone pick their name, then edit shifts in a **gallery** (add/remove rows; unlimited shifts per day)
- Saving **removes** all `StaffShifts` rows for that email, then **inserts** one row per gallery row (complete rows only)

---

## Step 1: Update App.OnStart

`App.OnStart` already loads the `Staff` list into `colStaff`. You need to:

1. Ensure `colStaff` includes schedule-related fields **only from Staff** (no time columns — shifts live in `StaffShifts`)
2. Add helper collections for the time slots and color palette
3. Add schedule state: `varSchedSelectedEmail`, `varSchedEditSaving`, and initialize `colEditShifts`

### 1A — Update the colStaff load

Find this existing line in `App.OnStart`:

```
ClearCollect(colStaff, ForAll(Filter(Staff, Active = true), {MemberName: Member.DisplayName, MemberEmail: Member.Email, Role: Role, Active: Active})),
```

Replace it with (adds `StaffID`, `AidType`, `SchedSortOrder` — the fields the schedule grid and totals rely on):

```
ClearCollect(
    colStaff,
    ForAll(
        Filter(Staff, Active = true),
        {
            StaffID:        ID,
            MemberName:     Member.DisplayName,
            MemberEmail:    Lower(Trim(Member.Email)),
            Role:           Role,
            Active:         Active,
            AidType:        AidType.Value,
            SchedSortOrder: Coalesce(SchedSortOrder, 10)
        }
    )
),
```

> **What changed:** `StaffID`, `AidType`, and `SchedSortOrder` are added. All shift times are stored in **StaffShifts** — loaded on the Schedule screen, not here. `MemberName` stays as the raw `Member.DisplayName` so dashboard screens and the schedule share the same display name.

> **Schedule screen only:** When users open **`scrSchedule`**, its **`OnVisible`** builds a **separate** collection called **`colSchedStaff`** (not `colStaff`) with a stricter student-worker filter (active only, role not `"Manager"`, `AidType` ∈ `"Work Study" | "Graduate Assistant" | "President's Aid"`) and with a **first + last** normalized `MemberName` (`Trim(First(Split(...)).Value & " " & Last(Split(...)).Value)`). That keeps manager or misc staff records out of the schedule grid/ComboBox and collapses middle names/initials so the colored HTML blocks show `First Last` instead of the full SharePoint display name. **Do not `ClearCollect` into `colStaff` from this screen** — that would silently drop full-time and manager staff from every other dropdown in the app (which all bind to `Items: =colStaff`) until the next app reload.

### 1B — Add the colTimeSlots collection

This helper table converts time labels like `"9:00 AM"` into slot index numbers used by the HTML grid formula and by hour totals. The **end-time** dropdown includes `"4:30 PM"`, so **`colTimeSlots` must include a row for that label** (Idx `16`). Idx `0`–`15` are the **start-of-block** times for the 16 visible half-hour rows (8:30 through 4:00); Idx `16` is only the **4:30 close boundary** for lookups — the schedule grid still iterates **`Filter(colTimeSlots, Idx < 16)`** so you do not render a bogus extra `4:30–4:30` label row.

Add this anywhere inside the `Concurrent()` block — or after it:

```
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
    {Idx: 12, Label: "2:30 PM",  Minutes: 870},
    {Idx: 13, Label: "3:00 PM",  Minutes: 900},
    {Idx: 14, Label: "3:30 PM",  Minutes: 930},
    {Idx: 15, Label: "4:00 PM",  Minutes: 960},
    {Idx: 16, Label: "4:30 PM",  Minutes: 990}
);
```

> **Why store Minutes?** Power Apps can't do time math directly. Storing minutes since midnight (510 = 8h30m) lets us calculate shift duration with subtraction: `(EndMinutes - StartMinutes) / 60 = hours`.

### 1C — Add the colSchedColors collection

A 12-color palette of warm earth tones that sits well against `varColorBgCard` (cream). Each staff member's color is assigned by `StaffID mod 12` — automatic, no manual assignment needed.

```
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
```

> **Each record stores two colors:** `Hex` is the saturated body color used for slots that contain a shift. `Light` is the tint used for the legend/header cells so every staff column has a consistent identity color that doesn't wash out against the cream card background.

### 1D — Add schedule state variables and empty edit collection

Add these alongside the other `Set()` calls in `App.OnStart` (immediately after the `// === MODAL CONTROLS ===` block in the live YAML):

```
// === SCHEDULE SCREEN STATE ===
Set(varSchedSelectedEmail, "");     // Email of the person being edited ("" = no one)
Set(varSchedEditSaving, false);
Set(varSchedConfirmSave, false);    // Two-step save guard; true = waiting for confirmation click
Set(varSchedShowReorder, false);    // Legacy flag from the retired reorder panel — kept for back-compat
Set(varSchedTotalsSortBy, "Total"); // Current sort column in galSchedTotals
Set(varSchedTotalsSortDesc, true); // Sort direction toggle (btnSchedTotalsSortDir); true = descending by default
Set(varSchedScrollVersion, 0);      // Incremented to force conSchedScrollBody to rebuild (clears ComboBox)
// Working copy of shifts while editing — one row per shift: RowKey, Day, ShiftStart, ShiftEnd
ClearCollect(colEditShifts, {RowKey: "x", Day: "Monday", ShiftStart: "8:30 AM", ShiftEnd: "9:00 AM"});
Clear(colEditShifts);
```

> **Why seed with real times (`"8:30 AM"` / `"9:00 AM"`) even though we immediately `Clear`?** The `ClearCollect` is there purely so Power Apps **infers the column types** of `colEditShifts` before any control reads it. Using real time strings (not `""`) matches the type that runtime code — `btnSchedAddShift.OnSelect` and the fallback seed in `drpSchedName.OnChange` — will insert later, preventing type-drift warnings on the gallery DropDowns.

After making all changes, press **Ctrl+S** to save, then click **Run** (▶) to confirm the app starts without errors.

---

## Step 2: Add the Schedule Nav Button to scrDashboard

> **Live app / coauthor:** The synced Staff Dashboard already includes **`btnNavSchedule`** next to **`btnNavAnalytics`** (`Report`). Use this step only when you are building from scratch or your header is missing the control.

1. In Power Apps Studio, go to **scrDashboard**
2. Find `btnNavAnalytics` (the **Report** button in the top-right of the header bar)
3. Insert a new **Button** control to the left of it (skip if `btnNavSchedule` already exists)

| Property | Value |
|----------|-------|
| Name | `btnNavSchedule` |
| Text | `"Schedule"` |
| Font | `=varAppFont` |
| Size | `8` |
| Color | `=Color.White` |
| Fill | `=varColorPrimary` |
| BorderColor | `=Color.Transparent` |
| BorderThickness | `0` |
| HoverFill | `=varColorPrimaryHover` |
| PressedFill | `=varColorPrimaryPressed` |
| RadiusTopLeft | `=varBtnBorderRadius` |
| RadiusTopRight | `=varBtnBorderRadius` |
| RadiusBottomLeft | `=varBtnBorderRadius` |
| RadiusBottomRight | `=varBtnBorderRadius` |
| Width | `64` |
| Height | `22` |
| X | *(position left of btnNavAnalytics)* |
| Y | `15` |
| OnSelect | `=Navigate(scrSchedule, varScreenTransition)` |

> The formula will show a red error until `scrSchedule` is created in the next step — that's normal.

---

## Step 3: Create the scrSchedule Screen

1. In the left panel, click **Screens** (monitor icon)
2. Click **+ New screen** → **Blank**
3. Right-click the new screen → **Rename** → type `scrSchedule`
4. Set these screen properties:

| Property | Value |
|----------|-------|
| Fill | `=varColorBg` |
| OnVisible | *(formula below)* |

**OnVisible formula:**

```
// Refresh active student-worker staff from SharePoint (picks up SchedSortOrder after reorder, etc.)
// IMPORTANT: we build a SEPARATE collection (colSchedStaff) so we don't stomp the global
// colStaff that every dashboard dropdown binds to. Using colStaff here would silently
// drop managers + full-time staff from every dropdown in the app after visiting this screen.
ClearCollect(
    colSchedStaff,
    ForAll(
        Filter(
            Staff,
            Active = true &&
            Lower(Trim(Coalesce(Role.Value, ""))) <> "manager" &&
            (
                AidType.Value = "Work Study" ||
                AidType.Value = "Graduate Assistant" ||
                AidType.Value = "President's Aid"
            )
        ),
        {
            StaffID:        ID,
            MemberName:     Trim(
                                First(Split(Trim(Member.DisplayName), " ")).Value & " " &
                                Last(Split(Trim(Member.DisplayName), " ")).Value
                            ),
            MemberEmail:    Member.Email,
            Role:           Role,
            Active:         Active,
            AidType:        AidType.Value,
            SchedSortOrder: Coalesce(SchedSortOrder, 10)
        }
    )
);

// Load all shift rows from SharePoint into a flat collection
// Filter out shifts for people not in colSchedStaff (inactive users, managers, or full-time staff)
ClearCollect(colShifts,
    ForAll(
        Filter(
            StaffShifts,
            Lower(Trim(Coalesce(StaffEmail, ""))) <> "" &&
            !IsBlank(LookUp(colSchedStaff, MemberEmail = Lower(Trim(StaffEmail))))
        ),
        {
            ShiftID:    ID,
            Email:      Lower(Trim(StaffEmail)),
            Day:        Day.Value,
            ShiftStart: ShiftStart.Value,
            ShiftEnd:   ShiftEnd.Value
        }
    )
);

// One row per SHIFT (not per person-day) — unlimited shifts per day supported
ClearCollect(
    colSchedLookup,
    ForAll(
        colShifts As sh,
        With(
            {
                sr: LookUp(colSchedStaff, MemberEmail = sh.Email),
                cr: LookUp(
                    colSchedColors,
                    Idx = Mod(LookUp(colSchedStaff, MemberEmail = sh.Email).StaffID, 12)
                )
            },
            {
                ShiftID:    sh.ShiftID,
                Email:      sh.Email,
                Name:       sr.MemberName,
                Initials:   Left(First(Split(Trim(sr.MemberName), " ")).Value, 1) &
                            Left(Last(Split(Trim(sr.MemberName), " ")).Value, 1),
                Day:        sh.Day,
                StartSlot:  Coalesce(LookUp(colTimeSlots, Label = sh.ShiftStart).Idx, -1),
                EndSlot:    Coalesce(LookUp(colTimeSlots, Label = sh.ShiftEnd).Idx, -1),
                ColorHex:   cr.Hex,
                ColorLight: cr.Light,
                SortOrder:  sr.SchedSortOrder
            }
        )
    )
);

// Reset editing + totals sort state whenever the screen becomes visible
Set(varSchedSelectedEmail, "");
Clear(colEditShifts);
Set(varSchedTotalsSortBy, "Total");
Set(varSchedTotalsSortDesc, true);
Set(varSchedScrollVersion, Coalesce(varSchedScrollVersion, 0) + 1)
```

> **What `colSchedLookup` does:** One record per row in `StaffShifts`. The HTML grid checks whether a time slot falls inside **any** shift for that person and day using `Filter` / `CountRows` — no artificial cap on shifts per day.

---

## Step 4: Build the Header Bar

### Header background

| Property | Value |
|----------|-------|
| Name | `recSchedHeader` |
| Fill | `=varColorHeader` |
| X | `0`, Y | `0` |
| Width | `=Parent.Width` |
| Height | `52` |
| BorderThickness | `0` |

### Back button

Matches `btnNavSchedule` styling (primary fill, top-right): same look as dashboard navigation.

| Property | Value |
|----------|-------|
| Name | `btnSchedBack` |
| Text | `"← Dashboard"` |
| Font | `=varAppFont` |
| Size | `8` |
| Color | `=Color.White` |
| Fill | `=varColorPrimary` |
| HoverFill | `=varColorPrimaryHover` |
| PressedFill | `=varColorPrimaryPressed` |
| BorderColor | `=Color.Transparent` |
| BorderThickness | `0` |
| Radius corners | `=varBtnBorderRadius` (all four) |
| X | `=Parent.Width - 100`, Y | `15`, Width | `90`, Height | `22` |
| OnSelect | `=Navigate(scrDashboard, varScreenTransition)` |

### Title label

Same treatment as **Print Lab Dashboard** on `scrDashboard` (`lblAppTitle`): left-aligned, larger type.

| Property | Value |
|----------|-------|
| Name | `lblSchedTitle` |
| Text | `"Schedule"` |
| Font | `=varAppFont` |
| Size | `18` |
| FontWeight | `=FontWeight.Semibold` |
| Color | `=Color.White` |
| X | `20`, Y | `11` |
| Width | `300`, Height | `30` |

---

## Step 5: Build the Edit Bar

The Edit Bar sits below the header. It shows the name picker always; once a name is selected, the **shift gallery** appears so the user can add, edit, or remove any number of shift rows.

### Scrollable body container

Use a **single-item vertical gallery** as the page viewport so the **page** scrolls instead of the schedule grid and totals section scrolling separately:

| Property | Value |
|----------|-------|
| Name | `conSchedScrollBody` |
| Control | `Gallery` |
| Variant | `Vertical` |
| Width | `=Parent.Width` |
| Height | `=Parent.Height - recSchedHeader.Height` |
| Y | `=recSchedHeader.Height` |
| Items | `=[varSchedScrollVersion]` (single-row “refresh key” gallery — increment to rebuild template and clear `drpSchedName`) |
| ShowScrollbar | `true` |
| TemplatePadding | `0` |
| TemplateSize | `=If(varSchedSelectedEmail <> "", 116 + Max(CountRows(colEditShifts), 1) * 36 + 12, 76) + (80 + 56 + CountRows(Filter(colTimeSlots, Idx < 16)) * 28) + Max(CountRows(colSchedStaff), 1) * 28 + 124` |

> **Why this wrapper matters:** it becomes the single vertical scroll surface for everything under the header. The edit bar, schedule grid, totals card, and totals footer all live inside one gallery template, so you no longer get separate vertical scrollbars for the schedule and totals areas.

### Edit bar background

| Property | Value |
|----------|-------|
| Name | `recSchedEditBar` |
| Fill | `=varColorBgCard` |
| BorderColor | `=varColorBorder` |
| BorderThickness | `1` |
| X | `0`, Y | `0` |
| Width | `=Parent.Width` |
| Height | `=If(varSchedSelectedEmail <> "", 116 + Max(CountRows(colEditShifts), 1) * 36 + 12, 76)` |

> **Responsive height formula breakdown:**
> - When collapsed (no selection): `76` px.
> - When expanded: `128` px of fixed chrome (`30` px top offset + `36` px top input row + `8` px gap + ample bottom padding) plus `Max(CountRows(colEditShifts), 1) * 36` for the shift gallery. Grows/shrinks as rows are added/removed while keeping the schedule grid pushed below the bar.
>
> **Internal vertical stack when expanded:**
>
> | Y | Control |
> |---|---------|
> | 8 | `lblSchedDropdownHint` |
> | 30 | `drpSchedName` · `lblSchedAidInfo` · `btnSchedAddShift` · `btnSchedSave` · `btnSchedClear` (top input row — `btnSchedAddShift` anchored to the right of the name so it stays fixed) |
> | `btnSchedAddShift.Y + btnSchedAddShift.Height + 8` (≈74) | `galEditShifts` (height = `Max(CountRows(colEditShifts), 1) * 36`) |
> | `recSchedEditBar.Y + recSchedEditBar.Height + 12` | `htmlSchedGrid` |

> **Why this fixes the overlap:** because the entire scrollable page starts below the header and `htmlSchedGrid` is anchored from the edit bar bottom, the schedule can no longer ride up into the dropdown row.

> **No “Who are you?” label** — the ComboBox placeholder is enough; controls sit on one row when collapsed.

### Name picker (ComboBox)

Use **`Classic/ComboBox`**, not DropDown — same pattern as staff pickers elsewhere in the app (`DisplayFields` / `SearchFields` on `MemberName`, shared `varDropdown*` / chevron colors).

| Property | Value |
|----------|-------|
| Name | `drpSchedName` |
| Control | `Classic/ComboBox` |
| Items | `=Sort(colSchedStaff, MemberName, SortOrder.Ascending)` |
| DisplayFields | `=["MemberName"]` |
| SearchFields | `=["MemberName"]` |
| SelectMultiple | `false` |
| IsSearchable | `false` |
| DefaultSelectedItems | `Blank()` |
| InputTextPlaceholder | `"Select Your Name"` |
| BorderColor | `=varInputBorderColor` |
| BorderThickness | `=varInputBorderThickness` |
| FocusedBorderThickness | `=varFocusedBorderThickness` |
| Chevron* | Same as other app ComboBoxes (`varChevronBackground`, etc.) |
| HoverFill / Pressed* / Selection* | `varDropdownHoverFill`, `varDropdownPressedColor`, `varDropdownSelectionColor`, `varDropdownSelectionFill` |
| Font | `=varAppFont`, Size | `=varInputFontSize` |
| X | `16`, Y | `30`, Width | `227`, Height | `36` |
| OnChange | *(formula below)* |

**OnChange formula** — loads that person's shifts from `colShifts` into `colEditShifts` (one gallery row per shift). If they have no shifts yet, seeds one blank row.

```
If(
    IsBlank(drpSchedName.Selected),
    Set(varSchedSelectedEmail, "");
    Clear(colEditShifts),
    With(
        {em: Lower(Trim(drpSchedName.Selected.MemberEmail))},
        Set(varSchedSelectedEmail, em);
        ClearCollect(
            colEditShifts,
            ForAll(
                Filter(colShifts, Email = em),
                {
                    RowKey:     Text(GUID()),
                    Day:        Day,
                    ShiftStart: ShiftStart,
                    ShiftEnd:   ShiftEnd
                }
            )
        );
        If(
            CountRows(colEditShifts) = 0,
            Collect(
                colEditShifts,
                {RowKey: Text(GUID()), Day: "Monday", ShiftStart: "8:30 AM", ShiftEnd: "9:00 AM"}
            )
        )
    )
)
```

> **Why real defaults (not blank)?** Classic **DropDown** controls do **not** fire `OnChange` on first render, so a row seeded with `ShiftStart: ""`/`ShiftEnd: ""` looks valid in the UI (the dropdown shows the first item — `8:30 AM` / `9:00 AM`) but the underlying `colEditShifts` row stays blank. The Save handler filters with `!IsBlank(ShiftStart) && !IsBlank(ShiftEnd)`, so a user who clicked **+ Add shift** and then **Save Schedule** without touching the dropdowns would silently lose that row. Seeding with the actual first option keeps what you see = what you save. If you change the first item in `drpGalShiftStart.Items` or `drpGalShiftEnd.Items`, update these defaults to match.

### Aid type + hour counter label

| Property | Value |
|----------|-------|
| Name | `lblSchedAidInfo` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Font | `=varAppFont`, Size | `10` |
| X | `257`, Y | `32`, Width | `=Max(120, btnSchedSave.X - Self.X - 8)`, Height | `32` |
| Text | *(formula below)* |
| Color | *(formula below)* |

**Text formula** — sums all **valid complete** rows in `colEditShifts` (both start and end filled, and end after start):

```
=With(
    {
        aidType: drpSchedName.Selected.AidType,
        maxHrs: Switch(
            drpSchedName.Selected.AidType,
            "Work Study",         13,
            "Graduate Assistant", 20,
            7
        ),
        mins: Sum(
            AddColumns(
                Filter(
                    colEditShifts,
                    !IsBlank(ShiftStart) &&
                    !IsBlank(ShiftEnd) &&
                    LookUp(colTimeSlots, Label = ShiftEnd).Idx > LookUp(colTimeSlots, Label = ShiftStart).Idx
                ),
                "SlotMins",
                (LookUp(colTimeSlots, Label = ShiftEnd).Idx -
                 LookUp(colTimeSlots, Label = ShiftStart).Idx) * 30
            ),
            SlotMins
        )
    },
    aidType & " · " & If(mins / 60 = RoundDown(mins / 60, 0), Text(mins / 60, "0"), Text(mins / 60, "0.#")) & " / " & Text(maxHrs, "0") & " hrs"
)
```

**Color formula** (turns red when over the limit):

```
=With(
    {maxHrs: Switch(drpSchedName.Selected.AidType,
                 "Work Study",         13,
                 "Graduate Assistant", 20,
                 7)},
    If(
        Value(Mid(lblSchedAidInfo.Text, Find("·", lblSchedAidInfo.Text) + 2, 4)) > maxHrs,
        varColorDanger,
        varColorText
    )
)
```

### Shift gallery (`galEditShifts`)

Insert a **Vertical gallery** on the edit bar:

| Property | Value |
|----------|-------|
| Name | `galEditShifts` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Items | `=colEditShifts` |
| Layout | Vertical |
| TemplateSize | `36` |
| X | `16`, Y | `=btnSchedAddShift.Y + btnSchedAddShift.Height + 8` |
| Width | `=Parent.Width - 260` |
| Height | `=Max(CountRows(colEditShifts), 1) * 36` |
| ShowScrollbar | `false` |

> **Dynamic gallery height:** Each row is `TemplateSize = 36` px tall; the gallery's `Height` grows/shrinks with `CountRows(colEditShifts)`. `Max(..., 1)` keeps a minimum of 1 row while editing.

> **Why this `Y`:** `btnSchedAddShift` sits on the top input row at `Y = 30` with `Height = varBtnHeight` (`36`). Anchoring the gallery to `btnSchedAddShift.Y + btnSchedAddShift.Height + 8` starts the first shift row at **Y ≈ 74**, leaving an `8` px gap under the top row so the **+ Add shift** button never moves when new shift rows are appended.

**Inside the gallery template**, add controls in a row. Widths are sized to keep each classic DropDown wide enough to show its longest label on a single line without horizontal scroll:

1. **Day** — Drop down `drpGalShiftDay`
   - **Items:** `=["Monday","Tuesday","Wednesday","Thursday","Friday"]`
   - **DefaultSelectedItems:** `=[ThisItem.Day]`
   - **OnChange:** `=UpdateIf(colEditShifts, RowKey = ThisItem.RowKey, {Day: drpGalShiftDay.Selected.Value})`
   - **X** `0`, **Width** `166`, **Height** `28`, **Y** `4`

2. **Start** — Drop down `drpGalShiftStart`
   - **Items:** `=["8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"]`
   - **DefaultSelectedItems:** `=If(IsBlank(ThisItem.ShiftStart), Blank(), [ThisItem.ShiftStart])`
   - **OnChange:** `=UpdateIf(colEditShifts, RowKey = ThisItem.RowKey, {ShiftStart: drpGalShiftStart.Selected.Value})`
   - **X** `=drpGalShiftDay.X + drpGalShiftDay.Width + 11`, **Width** `132`, **Height** `28`, **Y** `4`

3. **End** — Drop down `drpGalShiftEnd`
   - **Items:** `=["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"]`
   - **DefaultSelectedItems:** `=If(IsBlank(ThisItem.ShiftEnd), Blank(), [ThisItem.ShiftEnd])`
   - **OnChange:** `=UpdateIf(colEditShifts, RowKey = ThisItem.RowKey, {ShiftEnd: drpGalShiftEnd.Selected.Value})`
   - **X** `=drpGalShiftStart.X + drpGalShiftStart.Width + 11`, **Width** `130`, **Height** `28`, **Y** `4`

4. **Delete** — Button `btnGalShiftRemove`
   - **Text:** `"✕"`
   - **OnSelect:** `=Remove(colEditShifts, ThisItem)`
   - **X** `463`, **Width** `32`, **Height** `28`, **Y** `4`

> **Note:** If `DefaultSelectedItems` with `Blank()` causes issues in your build, use a first option like `"--"` in Items and treat it as empty in the save filter (`ShiftStart <> "--"`).

### Add Shift button

Solid primary-color button that sits on the **top input row** (not below the gallery) so it stays a fixed target when adding rows and never falls behind the `HtmlViewer` grid. It sits to the right of the name/aid-info block, just before `btnSchedSave`.

| Property | Value |
|----------|-------|
| Name | `btnSchedAddShift` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Text | `"+ Add shift"` |
| Font | `=varAppFont`, Size | `11` |
| Color | `=Color.White` |
| Fill | `=varColorPrimary` |
| BorderColor | `=varColorPrimary`, BorderThickness | `=varInputBorderThickness` |
| HoverBorderColor | `=ColorFade(Self.BorderColor, 20%)` |
| HoverColor | `=Color.White` |
| HoverFill | `=varColorPrimaryHover` |
| PressedBorderColor | `=Self.Fill` |
| PressedColor | `=Self.Fill` |
| PressedFill | `=varColorPrimaryPressed` |
| DisabledBorderColor | `=RGBA(166, 166, 166, 1)` |
| RadiusTop/Bottom Left/Right | `=varBtnBorderRadius` |
| X | `905`, Y | `30` |
| Width | `120`, Height | `=varBtnHeight` |
| OnSelect | `=Collect(colEditShifts, {RowKey: Text(GUID()), Day: "Monday", ShiftStart: "8:30 AM", ShiftEnd: "9:00 AM"})` |

> **Why this position:** the add button sits on the top input row at `Y = 30` alongside `drpSchedName`, `lblSchedAidInfo`, `btnSchedSave`, and `btnSchedClear`. Because it's above `galEditShifts` (which anchors to `btnSchedAddShift.Y + btnSchedAddShift.Height + 8`), the button stays in place as new shift rows are appended — no moving target.

> **OnSelect defaults match the first dropdown option.** Same reasoning as `drpSchedName.OnChange`: a blank row silently drops on Save because classic DropDowns don't fire `OnChange` on first render. If you change the first item in `drpGalShiftStart.Items` (`"8:30 AM"`) or `drpGalShiftEnd.Items` (`"9:00 AM"`), update this `Collect` to match.

### Save button

| Property | Value |
|----------|-------|
| Name | `btnSchedSave` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Text | `=If(varSchedEditSaving, "Saving...", "Save Schedule")` |
| Font | `=varAppFont`, Size | `11` |
| Color | `=Color.White` |
| Fill | `=varColorSuccess` |
| HoverFill | `=varColorSuccessHover` |
| BorderThickness | `0` |
| RadiusTopLeft/Right/Bottom | `=varBtnBorderRadius` |
| X | `=Parent.Width - 330`, Y | `30`, Width | `130`, Height | `36` |
| DisplayMode | `=If(varSchedEditSaving, DisplayMode.Disabled, DisplayMode.Edit)` |
| OnSelect | *(add in Step 7)* |

### Cancel button

| Property | Value |
|----------|-------|
| Name | `btnSchedClear` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Text | `"✕ Cancel"` |
| Font | `=varAppFont`, Size | `11` |
| Color | `=varColorText` |
| Fill | `=RGBA(0,0,0,0)` |
| BorderColor | `=varColorBorder`, BorderThickness | `1` |
| X | `=Parent.Width - 190`, Y | `30`, Width | `80`, Height | `36` |
| OnSelect | `=Set(varSchedSelectedEmail, ""); Clear(colEditShifts); Set(varSchedScrollVersion, Coalesce(varSchedScrollVersion, 0) + 1)` |

---

## Step 6: Build the HtmlViewer schedule grid

### Add the control

Use **`HtmlViewer`** (`htmlSchedGrid`). Do **not** follow older guides that used a `<style>` block or CSS Grid — those are stripped or ignored; the working layout is a **single master `<table>`** with **inline `style="..."` only** (`border-collapse:collapse`, one `<tr>` per time slot so labels and cells stay aligned). Full rationale is in **HtmlViewer: What Actually Works** below.

| Property | Value |
|----------|-------|
| Name | `htmlSchedGrid` |
| Control | `HtmlViewer` |
| Y | `=recSchedEditBar.Y + recSchedEditBar.Height + 12` |
| X | `=(Parent.Width - Self.Width) / 2` |
| Width | `=Parent.Width - 20` |
| Height | `=80 + 56 + CountRows(Filter(colTimeSlots, Idx < 16)) * 28` |
| Padding | `0` on all sides |

> **Dynamic positioning:** the grid still tracks the edit bar bottom, but it now uses a content-sized height instead of viewport height so the **page container** owns vertical scrolling. Width is `Parent.Width - 20` (10 px gutter on each side) and centered horizontally via `X = (Parent.Width - Self.Width) / 2` so the grid doesn't run edge-to-edge with the screen.

### Authoritative `HtmlText` formula

Paste this into **`htmlSchedGrid.HtmlText`** in Studio. It uses inline table styles only, carries the alternating day color down into blank grid cells, and keeps scheduled shift blocks in each staff member's saturated `Hex` color.

```powerfx
With(
    {
        st: Sort(colSchedStaff, SchedSortOrder, SortOrder.Ascending),
        H: 28,
        slotCount: CountRows(Filter(colTimeSlots, Idx < 16)),
        minSlotIdx: Min(Filter(colTimeSlots, Idx < 16), Idx)
    },
    "<div style='overflow-x:auto;overflow-y:hidden;width:100%;height:100%;box-sizing:border-box;background:#f5f1eb;padding:8px;font-family:Segoe UI,Arial,sans-serif;font-size:11px;'>" &
    "<table cellpadding='0' style='width:100%;border-collapse:collapse;table-layout:fixed;background:#e8e0d8;border:2px solid #d7ccc8;border-radius:10px;overflow:hidden;'>" &
    "<tr><td rowspan='2' style='width:80px;min-width:80px;background:#fdf6f0;border-right:2px solid #d7ccc8;box-sizing:border-box;'></td>" &
    Concat(
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] As dn,
        With(
            {
                dayStaff: Filter(st As person, CountRows(Filter(colSchedLookup, Email = person.MemberEmail && Day = dn.Value)) > 0),
                dayBg: Switch(dn.Value, "Monday", "#c1b3a3", "Tuesday", "#ece2d6", "Wednesday", "#c1b3a3", "Thursday", "#ece2d6", "Friday", "#c1b3a3", "#d7ccc8")
            },
            With(
                {nc: CountRows(dayStaff)},
                If(
                    nc = 0,
                    "<th style='height:" & Text(H) & "px;background:" & dayBg & ";text-align:center;font-size:11px;font-weight:600;letter-spacing:.05em;white-space:nowrap;border:1px solid #bdbdbd;color:#3e2723;padding:2px;'>" & Upper(dn.Value) & "</th>",
                    "<th colspan='" & Text(nc) & "' style='height:" & Text(H) & "px;background:" & dayBg & ";text-align:center;font-size:11px;font-weight:600;letter-spacing:.05em;white-space:nowrap;border:1px solid #bdbdbd;color:#3e2723;padding:2px;'>" & Upper(dn.Value) & "</th>"
                )
            )
        )
    ) &
    "<td rowspan='2' style='width:80px;min-width:80px;background:#fdf6f0;border-left:2px solid #d7ccc8;box-sizing:border-box;'></td></tr>" &
    "<tr>" &
    Concat(
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] As dn,
        With(
            {dayStaff: Filter(st As person, CountRows(Filter(colSchedLookup, Email = person.MemberEmail && Day = dn.Value)) > 0)},
            If(
                CountRows(dayStaff) = 0,
                "<td style='height:" & Text(H) & "px;background:#e8e0d8;border:1px solid #bdbdbd;'></td>",
                Concat(
                    dayStaff As s,
                    With(
                        {cr: LookUp(colSchedColors, Idx = Mod(s.StaffID, 12))},
                        "<td style='height:" & Text(H) & "px;background:" & Coalesce(cr.Hex, "#8B4513") & ";text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:10px;border:1px solid #bdbdbd;overflow:hidden;white-space:nowrap;'>" &
                        Left(First(Split(Trim(s.MemberName), " ")).Value, 1) &
                        Left(Last(Split(Trim(s.MemberName), " ")).Value, 1) &
                        "</td>"
                    )
                )
            )
        )
    ) &
    "</tr>" &
    Concat(
        Filter(colTimeSlots, Idx < 16) As slot,
        With(
            {
                nxt: Coalesce(LookUp(colTimeSlots, Idx = slot.Idx + 1).Label, "4:30 PM"),
                brd: "border-top:1px solid #d7ccc8;"
            },
            With(
                {lab: Left(slot.Label, Find(" ", slot.Label) - 1) & "-" & Left(nxt, Find(" ", nxt) - 1)},
                "<tr style='height:" & Text(H) & "px;'>" &
                "<td style='" & brd & "background:#fdf6f0;text-align:center;color:#5d4037;white-space:nowrap;padding:0 4px;font-size:11px;vertical-align:middle;border-right:2px solid #d7ccc8;box-sizing:border-box;'>" & lab & "</td>" &
                Concat(
                    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] As dn,
                    With(
                        {
                            dayStaff: Filter(st As person, CountRows(Filter(colSchedLookup, Email = person.MemberEmail && Day = dn.Value)) > 0),
                            dayCellBg: Switch(dn.Value, "Monday", "#e2d3c2", "Tuesday", "#fbf1e5", "Wednesday", "#e2d3c2", "Thursday", "#fbf1e5", "Friday", "#e2d3c2", "#fbf1e5"),
                            si: slot.Idx
                        },
                        If(
                            CountRows(dayStaff) = 0,
                            If(
                                slot.Idx = minSlotIdx,
                                "<td rowspan='" & Text(slotCount) & "' style='border:1px solid #bdbdbd;border-top:1px solid #d7ccc8;background:" & dayCellBg & ";text-align:center;color:#999;vertical-align:middle;padding:12px;font-size:11px;'>No shifts</td>",
                                ""
                            ),
                            Concat(
                                dayStaff As s,
                                With(
                                    {
                                        cr: LookUp(colSchedColors, Idx = Mod(s.StaffID, 12)),
                                        on: CountRows(Filter(colSchedLookup, Email = s.MemberEmail && Day = dn.Value && si >= StartSlot && si < EndSlot)) > 0
                                    },
                                    "<td style='border:1px solid #bdbdbd;" & brd & If(on, "background:" & Coalesce(cr.Hex, "#8B4513") & ";", "background:" & dayCellBg & ";") & "'></td>"
                                )
                            )
                        )
                    )
                ) &
                "<td style='" & brd & "background:#fdf6f0;text-align:center;color:#5d4037;white-space:nowrap;padding:0 4px;font-size:11px;vertical-align:middle;border-left:2px solid #d7ccc8;box-sizing:border-box;'>" & lab & "</td>" &
                "</tr>"
            )
        )
    ) &
    "</table></div>"
)
```

**Structure summary (as implemented):**

- Outer `<div style='overflow-x:auto;overflow-y:hidden;width:100%;height:100%;…'>` so horizontal overflow can still fit if needed without the grid taking over vertical scrolling.
- **Single master `<table>`** with `border-collapse:collapse`, `table-layout:fixed`, `width:100%`, and **per-cell** `border:1px solid #bdbdbd` (plus `border-top:1px solid #d7ccc8` on every slot row, including the first, so the grid line under the legend is visible). One outer rounded border wraps the whole table (`border:2px solid #d7ccc8;border-radius:10px`).
- **Header rows:** Row 1 — left/right **corner** cells (`rowspan=2`, 80px) bracket Mon–Fri **`<th>`** cells (dynamic `colspan` from `CountRows(dayStaff)`). Row 2 — staff **initials** `<td>`s (one per staff column); empty placeholder `<td>` for a day with no staff.
- **Slot rows:** one **`<tr style='height:{H}px'>`** per **`Filter(colTimeSlots, Idx < 16)`**. Cell order: **left time label** | Mon columns… | Tue… | … | **right time label** (same text as left). **`With({ dayCellBg: Switch(dn.Value, "Monday", "#e2d3c2", "Tuesday", "#fbf1e5", "Wednesday", "#e2d3c2", "Thursday", "#fbf1e5", "Friday", "#e2d3c2", "#fbf1e5"), si: slot.Idx }, …)`** keeps the Mon/Wed/Fri vs Tue/Thu day banding visible down the grid while staff shift blocks still use each person's saturated `Hex` color.
- **Per day filtering (reduces visual clutter):** For each day, `With({dayStaff: Filter(st As person, CountRows(Filter(colSchedLookup, Email = person.MemberEmail && Day = dn.Value)) > 0)}, …)` so only staff with shifts on that day get columns. **`H = 28`** for header, legend, and slot row heights (same pitch everywhere).
- **No shifts:** for a day with `CountRows(dayStaff)=0`, emit **one** `<td rowspan='{slotCount}' …>No shifts</td>` on the **first** slot row (`slot.Idx = Min(…)` / `minSlotIdx` in the YAML); emit `""` for that day on later slot rows so column counts stay valid.
- **Gallery `TemplateSize`:** the scroll template’s grid segment uses the same **28px** slot pitch as the HtmlViewer (`80 + 56 + CountRows(Filter(colTimeSlots, Idx < 16)) * 28` in the formula’s grid part) so the body height matches the rendered grid.
- **Totals section:** no longer part of `HtmlText`. The week grid stays in `htmlSchedGrid`, while the sortable totals area is now a native card + gallery (`recSchedTotalsCard`, `drpSchedTotalsSort`, `btnSchedTotalsSortDir`, `galSchedTotals`) rendered below it.

### Fitting the whole week on one screen width

1. **HtmlViewer table:** Keep the week inner table at **`width:100%`** without a large **`min-width`** in pixels. A fixed `min-width` larger than the app’s design width (this project uses **1366** in `CanvasManifest.json`) guarantees horizontal scrolling and can clip the first day depending on scroll position.
2. **Screen controls:** `htmlSchedGrid` uses **`Width: =Parent.Width - 20`** and **`X: =(Parent.Width - Self.Width) / 2`** so it centers under the edit bar with a 10 px gutter on each side; the step above already sets this.
3. **App display settings:** If you still see empty margins on a wide monitor, the app may be using **Scale to fit** with **Maintain aspect ratio** (common on desktop layouts). In Studio: **Settings** → **Display** — try **Lock aspect ratio** off or adjust **Scale to fit** / design resolution so the canvas matches how you run the app (trade-off: layout may letterbox or stretch).

### Obsolete sample removed

Older drafts of this document inlined a **CSS class + `<style>`** grid formula. **That approach does not work in Canvas HtmlViewer** and is intentionally removed here to avoid confusion.

---

## Step 7: Save Logic

Wire the `OnSelect` of `btnSchedSave` with this formula. It now has a **two-click confirmation flow**: the first click turns the button into **`Confirm Replace`** and warns that the save will overwrite every existing `StaffShifts` row for the selected email; the second click performs the replace. It also hard-blocks blank `varSchedSelectedEmail`, still rejects invalid time ranges, and then rebuilds the schedule collections so the grid updates without leaving the screen.

The save uses a blank-selection guard, a confirmation flag (`varSchedConfirmSave`), an upfront invalid-range guard, and nested `IfError` handlers — the same `IfError(...; true, Notify(...); false)` pattern used by `btnCompleteConfirm` and `btnApprovalConfirm` throughout the app. The result is stored in `varSchedSaved`. The collection rebuild and state reset only run when validation passes and both data operations succeed. `varSchedEditSaving` resets unconditionally so the button can never get stuck in "Saving..." state, and any edit/change/cancel action resets `varSchedConfirmSave` so confirmation only applies to the current draft.

```
If(
    IsBlank(Trim(varSchedSelectedEmail)),
    Set(varSchedSaved, false);
    Set(varSchedConfirmSave, false);
    Notify("Select your name before saving your schedule.", NotificationType.Error),
    If(
        !varSchedConfirmSave,
        Set(varSchedSaved, false);
        Set(varSchedConfirmSave, true);
        Notify("Click Confirm Replace to overwrite your saved schedule with the rows shown here.", NotificationType.Warning),
        Set(varSchedEditSaving, true);

        If(
            CountRows(
                Filter(
                    colEditShifts,
                    !IsBlank(ShiftStart) &&
                    !IsBlank(ShiftEnd) &&
                    LookUp(colTimeSlots, Label = ShiftEnd).Idx <= LookUp(colTimeSlots, Label = ShiftStart).Idx
                )
            ) > 0,
            Set(varSchedSaved, false);
            Set(varSchedConfirmSave, false);
            Notify("Each shift must end after it starts. Fix the invalid time range and try again.", NotificationType.Error),

            // Remove existing shifts, then patch new ones.
            // Outer IfError catches RemoveIf failure (no data changed — safe to retry).
            // Inner IfError catches Patch failure (shifts were removed — user warned to re-enter).
            Set(
                varSchedSaved,
                IfError(
                    RemoveIf(StaffShifts, Lower(Trim(StaffEmail)) = varSchedSelectedEmail);
                    IfError(
                        Patch(
                            StaffShifts,
                            ForAll(
                                Filter(
                                    colEditShifts,
                                    !IsBlank(ShiftStart) &&
                                    !IsBlank(ShiftEnd) &&
                                    LookUp(colTimeSlots, Label = ShiftEnd).Idx > LookUp(colTimeSlots, Label = ShiftStart).Idx
                                ),
                                {
                                    StaffEmail: varSchedSelectedEmail,
                                    Day:        {Value: Day},
                                    ShiftStart: {Value: ShiftStart},
                                    ShiftEnd:   {Value: ShiftEnd}
                                }
                            )
                        );
                        true,
                        Notify("New shifts could not be saved after existing shifts were removed. Please re-enter your shifts and try again.", NotificationType.Error);
                        false
                    ),
                    Notify("Schedule could not be saved. Your existing shifts were not changed. Please try again.", NotificationType.Error);
                    false
                )
            )
        );

        If(
            varSchedSaved,
            ClearCollect(
                colSchedStaff,
                ForAll(
                    Filter(
                        Staff,
                        Active = true &&
                        Lower(Trim(Coalesce(Role.Value, ""))) <> "manager" &&
                        (
                            AidType.Value = "Work Study" ||
                            AidType.Value = "Graduate Assistant" ||
                            AidType.Value = "President's Aid"
                        )
                    ),
                    {
                        StaffID:        ID,
                        MemberName:     Trim(
                                            First(Split(Trim(Member.DisplayName), " ")).Value & " " &
                                            Last(Split(Trim(Member.DisplayName), " ")).Value
                                        ),
                        MemberEmail:    Lower(Trim(Member.Email)),
                        Role:           Role,
                        Active:         Active,
                        AidType:        AidType.Value,
                        SchedSortOrder: Coalesce(SchedSortOrder, 10)
                    }
                )
            );
            ClearCollect(
                colShifts,
                ForAll(
                    Filter(
                        StaffShifts,
                        Lower(Trim(Coalesce(StaffEmail, ""))) <> "" &&
                        !IsBlank(LookUp(colSchedStaff, MemberEmail = Lower(Trim(StaffEmail))))
                    ),
                    {
                        ShiftID:    ID,
                        Email:      Lower(Trim(StaffEmail)),
                        Day:        Day.Value,
                        ShiftStart: ShiftStart.Value,
                        ShiftEnd:   ShiftEnd.Value
                    }
                )
            );
            ClearCollect(
                colSchedLookup,
                ForAll(
                    colShifts As sh,
                    With(
                        {
                            sr: LookUp(colSchedStaff, MemberEmail = sh.Email),
                            cr: LookUp(
                                colSchedColors,
                                Idx = Mod(LookUp(colSchedStaff, MemberEmail = sh.Email).StaffID, 12)
                            )
                        },
                        {
                            ShiftID:    sh.ShiftID,
                            Email:      sh.Email,
                            Name:       sr.MemberName,
                            Initials:   Left(First(Split(Trim(sr.MemberName), " ")).Value, 1) &
                                        Left(Last(Split(Trim(sr.MemberName), " ")).Value, 1),
                            Day:        sh.Day,
                            StartSlot:  Coalesce(LookUp(colTimeSlots, Label = sh.ShiftStart).Idx, -1),
                            EndSlot:    Coalesce(LookUp(colTimeSlots, Label = sh.ShiftEnd).Idx, -1),
                            ColorHex:   cr.Hex,
                            ColorLight: cr.Light,
                            SortOrder:  sr.SchedSortOrder
                        }
                    )
                )
            );
            Set(varSchedSelectedEmail, "");
            Set(varSchedConfirmSave, false);
            Clear(colEditShifts);
            Set(varSchedScrollVersion, Coalesce(varSchedScrollVersion, 0) + 1),
            Set(varSchedConfirmSave, false)
        );

        Set(varSchedEditSaving, false)
    )
);
```

> **Why filter `colShifts` by `LookUp(colSchedStaff, …)`?** If a manager, full-time staffer, or inactive user has shifts in the `StaffShifts` SharePoint list, loading them without checking would create orphaned entries in the schedule grid (blank names, broken lookups). The filter ensures only shifts for active student-worker staff appear.

> **Why require a second click?** `btnSchedSave` is destructive by design: it deletes every saved `StaffShifts` row for that email and replaces them with the current edit collection. The first click turns the button orange and changes the label to `Confirm Replace`, which gives users one explicit checkpoint before wiping their previously saved schedule.

> **Why validate `ShiftEnd > ShiftStart` before `RemoveIf`?** The schedule grid and totals assume every saved row spans at least one half-hour block. Blocking invalid ranges before deleting anything prevents negative hour totals, empty grid spans, and accidental replacement of good saved data with bad rows.

> **Why not `ForAll(..., Patch(Defaults(StaffShifts), …))`?** That pattern often creates **only one** new row when several are needed (concurrent evaluation). **`Patch(StaffShifts, ForAll(..., { ... }))`** performs a **batch create** in one call — reliable for multiple shifts.

> **Why `RemoveIf` + `Patch`?** SharePoint has no "replace collection" in one call. Deleting all rows for that email then inserting the current set keeps unlimited shifts per day without orphaned rows.

> **Why nested `IfError`?** The two operations are not atomic. If `RemoveIf` fails, no data has changed and the user can safely retry (outer `IfError`). If `RemoveIf` succeeds but `Patch` fails, the staff member's shifts are already deleted — the inner `IfError` catches this and tells the user to re-enter their shifts. In both error cases `varSchedSaved` is `false`, the collection rebuild is skipped, and `varSchedEditSaving` unconditionally resets to `false`.

> **Choice columns** on `StaffShifts` (`Day`, `ShiftStart`, `ShiftEnd`) must be written as `{Value: "text"}`, not plain strings.

> **Cancel / OnVisible** cannot reset `drpSchedName` directly because the ComboBox lives inside the scroll gallery template. Instead, use a gallery refresh key like `varSchedScrollVersion` and bind `conSchedScrollBody.Items` to `=[varSchedScrollVersion]`. Incrementing that value from `OnVisible`, Cancel, or Save rebuilds the single gallery row and naturally clears the ComboBox placeholder without using `Reset(...)`.

---

## Step 8: Sortable Totals Section

The current app no longer includes the reorder panel. Instead, the lower section is a native totals card so it can sort properly while the week grid stays in `htmlSchedGrid`.

### Current layout

- `conSchedScrollBody` provides the single vertical scrollbar for the page below the header.
- `htmlSchedGrid` uses a fixed content height tall enough to show the full week grid without its own vertical scrollbar.
- `recSchedTotalsCard` sits directly below the grid and contains the sortable totals area.
- `galSchedTotals` expands to its full content height so the totals rows and footer stay reachable via page scroll.

### Totals card sizing

| Property | Value |
|----------|-------|
| Name | `recSchedTotalsCard` |
| Control | `Rectangle` |
| Fill | `=varColorBgCard` |
| BorderColor | `=varColorBorder`, BorderThickness | `1` |
| Width | `=Min(Parent.Width - 32, 1200)` |
| X | `=(Parent.Width - Self.Width) / 2` |
| Y | `=htmlSchedGrid.Y + htmlSchedGrid.Height + 12` |
| Height | `=recSchedTotalsFooter.Y + recSchedTotalsFooter.Height - Self.Y + 8` |

> **Width formula:** `Min(Parent.Width - 32, 1200)` keeps a 16 px gutter on each side while capping the max card width at **1200 px** on very wide monitors so the totals row stays readable and the card centers within the page via `X = (Parent.Width - Self.Width) / 2`.

### Default sort

`App.OnStart` (and `scrSchedule.OnVisible` on every screen entry) seed:

```
Set(varSchedTotalsSortBy, "Total");
Set(varSchedTotalsSortDesc, true);
```

so the totals gallery opens sorted by **Total hours, descending** (heaviest scheduled students on top). The sort `Default: =Coalesce(varSchedTotalsSortBy, "Total")` on `drpSchedTotalsSort` and the `Switch(... "Total", Sort(totalsRows, TotalH, ord), ...)` branch in `galSchedTotals.Items` are what actually consume those variables.

### Sort controls

| Property | Value |
|----------|-------|
| Sort field control | `drpSchedTotalsSort` |
| Items | `"Student"`, `"Role"`, `"Mon"`, `"Tue"`, `"Wed"`, `"Thu"`, `"Fri"`, `"Total"`, `"Max"` |
| X | `=lblSchedTotalsTitle.X + lblSchedTotalsTitle.Width + 8` |
| Shared styling | `varInputBorderColor`, `varChevron*`, `varDropdown*`, `varFocusedBorderThickness` |
| Direction toggle | `btnSchedTotalsSortDir` |
| Direction text | `=If(varSchedTotalsSortDesc, "⌄", "⌃")` |
| Direction X | `=drpSchedTotalsSort.X + drpSchedTotalsSort.Width + 8` |

### Totals gallery

| Property | Value |
|----------|-------|
| Name | `galSchedTotals` |
| Items | Precomputed per-person totals built with `ForAll(...)` and sorted from `varSchedTotalsSortBy` / `varSchedTotalsSortDesc` |
| TemplateSize | `28` |
| Height | `=Max(CountRows(colSchedStaff), 1) * 28` |
| ShowScrollbar | `false` |

> **Why native controls instead of HTML here?** Power Apps can't do true click-to-sort inside `HtmlViewer`. Moving totals into a gallery keeps the week grid fast while allowing real sorting, while the surrounding scroll body keeps the entire page on one vertical scrollbar.

---

## Testing

### Test 1: Grid displays with no data
- Navigate to the Schedule screen
- The HTML grid should show **16** half-hour time labels (8:30–9:00 through 4:00–4:30), day headers, and blank white cells
- No errors in the app checker

### Test 2: Enter a schedule
- Select your name from the ComboBox (`Select Your Name` placeholder when empty)
- In the gallery, set Day **Monday**, Start **9:00 AM**, End **1:00 PM**
- Click **+ Add shift** and add **Wednesday** 10:00 AM – 2:00 PM
- Hour counter should show "8 / 13 hrs" (or "8 / 7 hrs" for President's Aid), etc.
- Click **Save Schedule**
- Grid should update with your colored blocks

### Test 3: Re-edit
- Select the same name again
- Gallery should list the same shift rows you saved
- Add a third shift, remove one, or change times — save — grid should reflect the change

### Test 3b: End time 4:30 PM (regression guard)
- Add or edit a shift with **End** = **4:30 PM** (e.g. Monday 9:00 AM – 4:30 PM)
- Hour preview and **Totals** should show **positive** hours (e.g. **7.5** for that day), not negative values. If totals go negative, `colTimeSlots` is missing the Idx `16` row or the grid is iterating all 17 rows without the `Idx < 16` filter.

### Test 4: Totals sorting
- Change the sort dropdown to **Total** or **Student**
- Press the chevron toggle to reverse the order
- Confirm the totals rows reorder correctly while the week grid above stays unchanged

### Test 5: Return to dashboard
- Press **← Dashboard** — returns to `scrDashboard` without errors

---

## Verification Checklist

**SharePoint:**
- [ ] `StaffShifts` list exists per [StaffShifts-List-Setup.md](../SharePoint/StaffShifts-List-Setup.md)
- [ ] `Staff` list has no time columns — only `AidType`, `SchedSortOrder`, etc.

**App.OnStart:**
- [ ] `colStaff` includes `StaffID`, `AidType`, `SchedSortOrder` (no shift time fields). Loaded with `Filter(Staff, Active = true)` only — **no manager/AidType filter here** (that filter lives on `scrSchedule` and builds `colSchedStaff`, not `colStaff`)
- [ ] `colTimeSlots` has **17** rows (Idx `0`–`15` for grid starts, Idx `16` = `"4:30 PM"` end boundary), correct labels and minute values; schedule **HtmlText** uses **`Filter(colTimeSlots, Idx < 16)`** for row count and gutters so the grid stays 16 rows tall
- [ ] `colSchedColors` has 12 color entries
- [ ] `colEditShifts` initialized empty (`ClearCollect` dummy row then `Clear`)
- [ ] `varSchedSelectedEmail`, `varSchedEditSaving`, `varSchedTotalsSortBy`, `varSchedTotalsSortDesc` initialized
- [ ] App starts without errors

**Data:**
- [ ] `StaffShifts` added as a data source in the app

**scrDashboard:**
- [ ] `btnNavSchedule` navigates to `scrSchedule`

**scrSchedule:**
- [ ] `OnVisible` loads `colShifts` from `StaffShifts` and builds `colSchedLookup` (one row per shift)
- [ ] Header bar has back button + title
- [ ] Selecting a name fills `galEditShifts` from `colShifts`
- [ ] **+ Add shift** appends rows; delete removes a row
- [ ] Hour counter updates from `colEditShifts`
- [ ] HTML grid renders with time labels and day groups
- [ ] Grid cells color when any shift covers the slot (multiple shifts per day OK)
- [ ] Save runs `RemoveIf` + batch `Patch(StaffShifts, ForAll(Filter(...), {...}))`, then rebuilds `colSchedStaff` (managers + full-time excluded), `colShifts`, and `colSchedLookup`. **Never** `ClearCollect`s into `colStaff` — that collection stays as App.OnStart loaded it.
- [ ] Cancel clears selection and `colEditShifts` without saving
- [ ] Totals dropdown + chevron toggle sort `galSchedTotals`

---

## HtmlViewer: What Actually Works (Hard-Won Notes)

This section documents exactly what CSS and HTML techniques the Power Apps Canvas **HtmlViewer** control supports, based on direct testing during development of this screen. Save yourself the debugging time.

### The single most important rule

> **`<style>` blocks are silently stripped.** The HtmlViewer sanitizes its input and discards any `<style>...</style>` element without warning. Your HTML renders, but completely unstyled. CSS classes you define in a style block simply do not exist.

This means **every style must be an inline `style="..."` attribute** on the element itself. There are no exceptions.

### What works

| Technique | Status | Notes |
|-----------|--------|-------|
| Inline `style="..."` on any element | ✅ Works | The only way to apply styles |
| `<table>`, `<tr>`, `<td>`, `<th>` | ✅ Works | Most reliable layout method |
| `border-collapse:collapse` on `<table>` | ✅ Works | Inline on the table element |
| `border-collapse:separate` + `border-spacing:1px` + table `background` | ✅ Works | **Legacy grid-lines trick** (older nested per-day tables): 1px gaps show rules without per-cell borders. **Current schedule** uses `collapse` + explicit borders instead. |
| `border-spacing` on `<table>` | ✅ Works | Optional for gaps between day groups; not used in the current single-table layout |
| `min-width` on week inner `<table>` | ✅ Works | Prevents over-compression; restores horizontal scroll in `overflow:auto` wrapper (add only if you widen the column model) |
| `vertical-align:bottom` on `<td>` | ✅ Works | Legacy gutter alignment when inner day table used `border-collapse:collapse` only |
| `vertical-align:top` + fixed spacer on gutter `<td>` | ⚠️ Superseded | Was used with **nested** day tables + `border-spacing` gutter drift; **current** screen uses **one row per slot** so left/right time cells align without spacers |
| `height:Npx` on `<tr>` | ✅ Works | Sets row height; empty cells don't collapse |
| `overflow:hidden` on `<div>` | ✅ Works | Used to clip `border-radius` on day block wrappers |
| `border-radius` on `<div>` | ✅ Works | Must be on a `<div>`, not directly on `<table>` |
| `position:sticky; left:0` | ✅ Works | Optional; left gutter can stay visible on horizontal scroll (current shipped YAML may omit sticky if not required) |
| `background:#hexcolor` inline | ✅ Works | How shift colors are applied to cells |

### What does NOT work

| Technique | Status | Why it fails |
|-----------|--------|--------------|
| `<style>...</style>` block | ❌ Stripped | Sanitized out entirely, no error shown |
| CSS classes (`.myClass`) | ❌ Stripped | No style block = no class definitions |
| `display:grid` | ❌ Does not render | Even inline; grid layout is not applied |
| `display:flex` via `<style>` block | ❌ Stripped | The class is gone so flex never applies |
| CSS pseudo-selectors (`:first-child`, `:hover`) | ❌ Stripped | No style block to hold them |
| `<script>` tags | ❌ Blocked | No JavaScript in HtmlViewer |
| `column-count` | ❌ Not supported | Reported broken across community |
| `border-radius` directly on `<table>` | ❌ Inconsistent | Wrap the table in a `<div>` instead |

### The layout pattern that works (current)

Use **one `<table>`** with **`border-collapse:collapse`**: two header rows (day titles + staff initials, with **empty corner `<td rowspan="2">`** columns for the left and right time gutters), then **one `<tr>` per visible time slot**. Each slot row contains, in order: **left time `<td>`** | **Monday staff cells** … **Friday staff cells** | **right time `<td>`** (duplicate label). Inline styles only.

```html
<!-- Sketch: columns = [corner] [Mon×N₁] [Tue×N₂] … [Fri×N₅] [corner] on row 1; row 2 = initials; then slot rows -->
<table cellpadding="0" style="width:100%; border-collapse:collapse; table-layout:fixed; border:2px solid #d7ccc8;">
  <tr>
    <td rowspan="2" style="width:80px; …"></td>
    <th colspan="3" style="height:28px; …">MONDAY</th>
    <!-- … other days … -->
    <td rowspan="2" style="width:80px; …"></td>
  </tr>
  <tr><!-- one <td> per staff column; empty <td> for a no-staff day --></tr>
  <tr style="height:28px;">
    <td style="border-top:1px solid #d7ccc8; …">8:30-9:00</td>
    <td style="border:1px solid #bdbdbd; border-top:1px solid #d7ccc8; …"></td>
    <!-- … -->
    <td style="border-top:1px solid #d7ccc8; …">8:30-9:00</td>
  </tr>
  <!-- repeat slot rows; "No shifts" = rowspan on first slot row only for that day column -->
</table>
```

### Gutter alignment (historical note)

Older drafts used **separate** left/right gutter stacks and **nested** per-day tables with **`border-spacing:1px`**, which made row pitch drift from the time labels (spacers, **`H+1`** label heights, etc.). The **current** implementation avoids that by putting **time labels and slot cells in the same `<tr>`** so heights always match. If you fork the markup back to nested per-day tables, re-read community notes on **`border-spacing`** vs fixed **`height`** on `<tr>`.

### Right gutter overlap fix

`position:sticky; right:0` causes the right gutter to paint **on top of** the last day column when the browser is zoomed in (the middle column narrows but the gutter stays fixed). Fix: **do not make the right gutter sticky**. Keep it in normal table flow as the third column. Only the left gutter needs sticky positioning.

---

## Troubleshooting

**Grid is all white after saving**
- Check that `colSchedLookup` is being rebuilt in the save formula. Add a temporary label with `Text: =CountRows(colSchedLookup)` to verify it has rows.

**"Invalid argument type" on Patch to StaffShifts**
- `Day`, `ShiftStart`, and `ShiftEnd` are Choice columns — use `{Value: Day}` etc., not plain strings.

**Gallery dropdowns don't reflect collection updates**
- Prefer `UpdateIf(colEditShifts, RowKey = ThisItem.RowKey, {...})` on each dropdown's `OnChange`. If defaults stick incorrectly, toggle `Reset(galEditShifts)` after `ClearCollect` in `drpSchedName.OnChange` (Power Apps build-dependent).

**"Delegation warning" on colSchedStaff load**
- Expected. The schedule's student-worker filter may show delegation warnings in Studio. Since your `Staff` list is well under 500 rows, this is fine for this app.

**A staff member (manager / full-time) is missing from dashboard dropdowns after visiting the Schedule screen**
- This means something on `scrSchedule` is still running `ClearCollect(colStaff, …)` instead of `ClearCollect(colSchedStaff, …)`. The schedule filter intentionally excludes managers, full-time, and non-student-worker staff — if that filter is allowed to overwrite the global `colStaff` collection, every dashboard dropdown (which binds to `Items: =colStaff`) will drop those people until the app is reloaded. Grep the live YAML for `ClearCollect( *colStaff` on the schedule screen — there should be zero hits. All schedule-side collects target `colSchedStaff`.

**Totals sort looks wrong**
- Verify `varSchedTotalsSortBy` is changing from `drpSchedTotalsSort.OnChange` and `varSchedTotalsSortDesc` is toggling from `btnSchedTotalsSortDir.OnSelect`. The gallery sorts a precomputed `totalsRows` table, so stale order usually means one of those variables did not update.

**Negative hours when end time is 4:30 PM**
- The end dropdown includes `"4:30 PM"` but **`LookUp(colTimeSlots, Label = ShiftEnd)`** must find a matching row. Without **`{Idx: 16, Label: "4:30 PM", …}`**, `EndSlot` falls back to `-1` or *Blank* and hour math goes negative. Add the row and keep the HTML grid on **`Filter(colTimeSlots, Idx < 16)`** so layout does not gain an extra row.

---

## Seasonal Maintenance

At the start of each new semester, staff update their own schedule in the app — saving **replaces** their rows in `StaffShifts` for that email.

To clear everyone's shifts at once, open **StaffShifts** in SharePoint **Edit in grid view** and delete rows (or filter/export first if you need a record).

---

# Live coauthor control inventory (scrSchedule)

> Synced from `PowerApps/canvas-coauthor/scrSchedule.pa.yaml` via `sync_canvas`. **Parent** is the immediate YAML container.

﻿## scrSchedule control inventory

> Generated from coauthor YAML (sync_canvas). Parent is the immediate container in the YAML tree (screen, gallery, or container).

### conSchedScrollBody

| Control | Type |
|---------|------|
| `btnSchedAddShift` | Classic/Button |
| `btnSchedClear` | Classic/Button |
| `btnSchedSave` | Classic/Button |
| `btnSchedTotalsSortDir` | Classic/Button |
| `drpSchedName` | Classic/ComboBox |
| `drpSchedTotalsSort` | Classic/DropDown |
| `galEditShifts` | Gallery |
| `galSchedTotals` | Gallery |
| `htmlSchedGrid` | HtmlViewer |
| `lblSchedAidInfo` | Label |
| `lblSchedDropdownHint` | Label |
| `lblSchedTotalsFooterFri` | Label |
| `lblSchedTotalsFooterMon` | Label |
| `lblSchedTotalsFooterThu` | Label |
| `lblSchedTotalsFooterTitle` | Label |
| `lblSchedTotalsFooterTotal` | Label |
| `lblSchedTotalsFooterTue` | Label |
| `lblSchedTotalsFooterWed` | Label |
| `lblSchedTotalsHeaderFri` | Label |
| `lblSchedTotalsHeaderMax` | Label |
| `lblSchedTotalsHeaderMon` | Label |
| `lblSchedTotalsHeaderRole` | Label |
| `lblSchedTotalsHeaderStudent` | Label |
| `lblSchedTotalsHeaderThu` | Label |
| `lblSchedTotalsHeaderTotal` | Label |
| `lblSchedTotalsHeaderTue` | Label |
| `lblSchedTotalsHeaderWed` | Label |
| `lblSchedTotalsTitle` | Label |
| `recSchedEditBar` | Rectangle |
| `recSchedTotalsCard` | Rectangle |
| `recSchedTotalsFooter` | Rectangle |
| `recSchedTotalsHeader` | Rectangle |

### galEditShifts

| Control | Type |
|---------|------|
| `btnGalShiftRemove` | Classic/Button |
| `drpGalShiftDay` | Classic/DropDown |
| `drpGalShiftEnd` | Classic/DropDown |
| `drpGalShiftStart` | Classic/DropDown |

### galSchedTotals

| Control | Type |
|---------|------|
| `lblSchedTotalsFri` | Label |
| `lblSchedTotalsMax` | Label |
| `lblSchedTotalsMon` | Label |
| `lblSchedTotalsRole` | Label |
| `lblSchedTotalsStudent` | Label |
| `lblSchedTotalsThu` | Label |
| `lblSchedTotalsTotal` | Label |
| `lblSchedTotalsTue` | Label |
| `lblSchedTotalsWed` | Label |
| `recSchedTotalsRowBg` | Rectangle |

### scrSchedule

| Control | Type |
|---------|------|
| `btnSchedBack` | Classic/Button |
| `conSchedScrollBody` | Gallery |
| `lblSchedTitle` | Label |
| `recSchedHeader` | Rectangle |




---

# Audit findings (schedule doc vs live YAML)

| Topic | Finding |
|-------|---------|
| **conSchedScrollBody.Items** | Docs previously showed `=[1]`; live app uses **`=[varSchedScrollVersion]`** as the gallery refresh key. |
| **TemplateSize** | Live formula uses **`(80 + 56 + CountRows(Filter(colTimeSlots, Idx < 16)) * 28) + Max(CountRows(colSchedStaff), 1) * 28 + 124`**, not `* 30` for slot rows. Updated in this guide. |
| **Root controls** | Live screen has `recSchedHeader`, `btnSchedBack`, `lblSchedTitle`, **`conSchedScrollBody`** (vertical gallery wrapping the whole scroll body). |
| **Weekly hour caps (AidType)** | **Apr 30, 2026:** Canvas formulas enforce **Work Study 13**, **President's Aid 7**, **Graduate Assistant 20** hrs/week (`lblSchedAidInfo` + totals `MaxH`). SharePoint stores only `AidType`; numeric caps are fixed in `scrSchedule` YAML. |


