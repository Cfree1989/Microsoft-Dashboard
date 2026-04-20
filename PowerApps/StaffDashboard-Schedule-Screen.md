# Schedule Screen — Staff Dashboard Canvas App

**⏱️ Time Required:** 2–3 hours  
**🎯 Goal:** A live color-coded semester schedule showing all active student workers, with inline editing so each person can enter their own hours

> 📚 **This is a screen addition to the existing Staff Dashboard app.** Complete the SharePoint update before starting here.

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

- The **HtmlViewer** grid shows the live schedule from `colSchedLookup` (built from `StaffShifts` + `colStaff`)
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
            MemberEmail:    Member.Email,
            Role:           Role,
            Active:         Active,
            AidType:        AidType.Value,
            SchedSortOrder: Coalesce(SchedSortOrder, 10)
        }
    )
),
```

> **What changed:** `StaffID`, `AidType`, and `SchedSortOrder` are added. All shift times are stored in **StaffShifts** — loaded on the Schedule screen, not here. `MemberName` stays as the raw `Member.DisplayName` so dashboard screens and the schedule share the same display name.

> **Schedule screen only:** When users open **`scrSchedule`**, its **`OnVisible`** runs **`ClearCollect(colStaff, …)`** again with a stricter student-worker filter (active only, role not `"Manager"`, `AidType` ∈ `"Work Study" | "Graduate Assistant" | "President's Aid"`) and with a **first + last** normalized `MemberName` (`Trim(First(Split(...)).Value & " " & Last(Split(...)).Value)`). That keeps manager or misc staff records out of the schedule grid/ComboBox and collapses middle names/initials so the colored HTML blocks show `First Last` instead of the full SharePoint display name.

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
Set(varSchedShowReorder, false);    // Legacy flag from the retired reorder panel — kept for back-compat
Set(varSchedTotalsSortBy, "Student"); // Current sort column in galSchedTotals
Set(varSchedTotalsSortDesc, false); // Sort direction toggle (btnSchedTotalsSortDir)
Set(varSchedScrollVersion, 0);      // Incremented to force conSchedScrollBody to rebuild (clears ComboBox)
// Working copy of shifts while editing — one row per shift: RowKey, Day, ShiftStart, ShiftEnd
ClearCollect(colEditShifts, {RowKey: "x", Day: "Monday", ShiftStart: "8:30 AM", ShiftEnd: "9:00 AM"});
Clear(colEditShifts);
```

> **Why seed with real times (`"8:30 AM"` / `"9:00 AM"`) even though we immediately `Clear`?** The `ClearCollect` is there purely so Power Apps **infers the column types** of `colEditShifts` before any control reads it. Using real time strings (not `""`) matches the type that runtime code — `btnSchedAddShift.OnSelect` and the fallback seed in `drpSchedName.OnChange` — will insert later, preventing type-drift warnings on the gallery DropDowns.

After making all changes, press **Ctrl+S** to save, then click **Run** (▶) to confirm the app starts without errors.

---

## Step 2: Add the Schedule Nav Button to scrDashboard

1. In Power Apps Studio, go to **scrDashboard**
2. Find `btnNavAnalytics` (the "Report" button in the top-right of the header bar)
3. Insert a new **Button** control to the left of it

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
// Refresh active staff from SharePoint (picks up SchedSortOrder after reorder, etc.)
// Excludes managers and any non-student worker records from this schedule UI.
ClearCollect(
    colStaff,
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
// Filter out shifts for people not in colStaff (inactive users or managers)
ClearCollect(colShifts,
    ForAll(
        Filter(
            StaffShifts,
            StaffEmail <> "" &&
            !IsBlank(LookUp(colStaff, MemberEmail = StaffEmail))
        ),
        {
            ShiftID:    ID,
            Email:      StaffEmail,
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
                sr: LookUp(colStaff, MemberEmail = sh.Email),
                cr: LookUp(
                    colSchedColors,
                    Idx = Mod(LookUp(colStaff, MemberEmail = sh.Email).StaffID, 12)
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
Set(varSchedTotalsSortBy, "Student");
Set(varSchedTotalsSortDesc, false);
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
| Items | `=[1]` |
| ShowScrollbar | `true` |
| TemplatePadding | `0` |
| TemplateSize | `=If(varSchedSelectedEmail <> "", 116 + Max(CountRows(colEditShifts), 1) * 36 + 12, 76) + (80 + CountRows(Filter(colTimeSlots, Idx < 16)) * 30) + Max(CountRows(colStaff), 1) * 28 + 124` |

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
| Items | `=Sort(colStaff, MemberName, SortOrder.Ascending)` |
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
        {em: drpSchedName.Selected.MemberEmail},
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

**Text formula** — sums all **complete** rows in `colEditShifts` (both start and end filled):

```
=With(
    {
        aidType: drpSchedName.Selected.AidType,
        maxHrs: Switch(
            drpSchedName.Selected.AidType,
            "Work Study",         12,
            "Graduate Assistant", 20,
            6
        ),
        mins: Sum(
            AddColumns(
                Filter(colEditShifts, !IsBlank(ShiftStart) && !IsBlank(ShiftEnd)),
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
                 "Work Study",         12,
                 "Graduate Assistant", 20,
                 6)},
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

Use **`HtmlViewer`** (`htmlSchedGrid`). Do **not** follow older guides that used a `<style>` block or CSS Grid — those are stripped or ignored; the working layout is **nested `<table>`s with inline `style="..."` only**. Full rationale is in **HtmlViewer: What Actually Works** below.

| Property | Value |
|----------|-------|
| Name | `htmlSchedGrid` |
| Control | `HtmlViewer` |
| Y | `=recSchedEditBar.Y + recSchedEditBar.Height + 12` |
| Width | `=Parent.Width` |
| Height | `=80 + CountRows(Filter(colTimeSlots, Idx < 16)) * 30` |
| Padding | `0` on all sides |

> **Dynamic positioning:** the grid still tracks the edit bar bottom, but it now uses a content-sized height instead of viewport height so the **page container** owns vertical scrolling.

### Authoritative `HtmlText` formula

The live formula is **large** and must stay under Power Fx string limits. **Source of truth:** `PowerApps/canvas-coauthor/scrSchedule.pa.yaml` → control **`htmlSchedGrid`** → property **`HtmlText`**. Copy from there when updating Studio by hand.

**Structure summary (as implemented):**

- Outer `<div style='overflow-x:auto;overflow-y:hidden;width:100%;height:100%;…'>` so horizontal overflow can still fit if needed without the grid taking over vertical scrolling.
- **Outer 3-column table:** left time gutter \| week \| right gutter (`border-spacing:8px 0` between columns).
- **Week row:** inner table with `width:100%;table-layout:fixed` (no `min-width`) so Mon–Fri share the `HtmlViewer` width and the week fits one screen without a forced horizontal scroll. If you have many staff columns and readability suffers on small tablets, you can add a modest `min-width` again or reduce slot height `H` in the formula.
- **Per day filtering (reduces visual clutter):** For each day (Mon–Fri), the formula uses `With({dayStaff: Filter(st As person, CountRows(Filter(colSchedLookup, Email = person.MemberEmail && Day = dn.Value)) > 0)}, ...)` to show **only staff who have shifts on that specific day**. Days with no scheduled shifts display "No shifts" in a single cell.
  - The `colspan` header is dynamic per day: `colspan='{Text(CountRows(dayStaff))}'` instead of a fixed count.
  - Staff appear in `SchedSortOrder` within each day (consistent left-to-right order when they work).
- **Per day:** rounded border `div` wrapping an inner table with **`border-collapse:separate;border-spacing:1px;background:#e8e0d8`** so **1px grid lines** (horizontal and vertical) show without per-cell border markup.
- **Slot coloring:** one `<tr>` per **visible** slot — iterate **`Filter(colTimeSlots, Idx < 16) As slot`** (same filter for the left and right time gutters). Inner `Concat` over **`dayStaff`** (not all staff); use **`With({ si: slot.Idx }, …)`** when testing `colSchedLookup` so slot index is not lost in nested scope. Close **`</tr>` once per slot row** (not inside the staff `Concat`). The full `colTimeSlots` table (including Idx `16` for `"4:30 PM"`) is still used in **`LookUp(colTimeSlots, Idx = slot.Idx + 1)`** inside those gutters so the last label row shows **4:00–4:30**.
- **Gutters:** `vertical-align:top`, **`59px`** spacer, then time labels at **`H+1`** px line height to align with **`border-spacing`** row rhythm (`H = 28`).
- **Totals section:** no longer part of `HtmlText`. The week grid stays in `htmlSchedGrid`, while the sortable totals area is now a native card + gallery (`recSchedTotalsCard`, `drpSchedTotalsSort`, `btnSchedTotalsSortDir`, `galSchedTotals`) rendered below it.

### Fitting the whole week on one screen width

1. **HtmlViewer table:** Keep the week inner table at **`width:100%`** without a large **`min-width`** in pixels. A fixed `min-width` larger than the app’s design width (this project uses **1366** in `CanvasManifest.json`) guarantees horizontal scrolling and can clip the first day depending on scroll position.
2. **Screen controls:** `htmlSchedGrid` should use **`Width: =Parent.Width`** and **`X: =0`** (default) so it spans the screen; the guide already sets this.
3. **App display settings:** If you still see empty margins on a wide monitor, the app may be using **Scale to fit** with **Maintain aspect ratio** (common on desktop layouts). In Studio: **Settings** → **Display** — try **Lock aspect ratio** off or adjust **Scale to fit** / design resolution so the canvas matches how you run the app (trade-off: layout may letterbox or stretch).

### Obsolete sample removed

Older drafts of this document inlined a **CSS class + `<style>`** grid formula. **That approach does not work in Canvas HtmlViewer** and is intentionally removed here to avoid confusion.

---

## Step 7: Save Logic

Wire the `OnSelect` of `btnSchedSave` with this formula. It **replaces** all `StaffShifts` rows for the selected email with the current gallery rows (complete rows only), then rebuilds collections so the grid updates without leaving the screen.

```
Set(varSchedEditSaving, true);
RemoveIf(StaffShifts, StaffEmail = varSchedSelectedEmail);
Patch(
    StaffShifts,
    ForAll(
        Filter(colEditShifts, !IsBlank(ShiftStart) && !IsBlank(ShiftEnd)),
        {
            StaffEmail: varSchedSelectedEmail,
            Day:        {Value: Day},
            ShiftStart: {Value: ShiftStart},
            ShiftEnd:   {Value: ShiftEnd}
        }
    )
);
ClearCollect(
    colStaff,
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
ClearCollect(
    colShifts,
    ForAll(
        Filter(
            StaffShifts,
            StaffEmail <> "" &&
            !IsBlank(LookUp(colStaff, MemberEmail = StaffEmail))
        ),
        {
            ShiftID:    ID,
            Email:      StaffEmail,
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
                sr: LookUp(colStaff, MemberEmail = sh.Email),
                cr: LookUp(
                    colSchedColors,
                    Idx = Mod(LookUp(colStaff, MemberEmail = sh.Email).StaffID, 12)
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
Clear(colEditShifts);
Set(varSchedScrollVersion, Coalesce(varSchedScrollVersion, 0) + 1);
Set(varSchedEditSaving, false)
```

> **Why filter `colShifts` by `LookUp(colStaff, …)`?** If a manager or inactive user has shifts in the `StaffShifts` SharePoint list, loading them without checking would create orphaned entries in the schedule grid (blank names, broken lookups). The filter ensures only shifts for active non-manager staff appear.

> **Why not `ForAll(..., Patch(Defaults(StaffShifts), …))`?** That pattern often creates **only one** new row when several are needed (concurrent evaluation). **`Patch(StaffShifts, ForAll(..., { ... }))`** performs a **batch create** in one call — reliable for multiple shifts.

> **Why `RemoveIf` + `Patch`?** SharePoint has no "replace collection" in one call. Deleting all rows for that email then inserting the current set keeps unlimited shifts per day without orphaned rows.

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
| Height | `=Max(CountRows(colStaff), 1) * 28` |
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
- Hour counter should show "8 / 12 hrs" (or "8 / 6 hrs" for President's Aid), etc.
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
- [ ] `colStaff` includes `StaffID`, `AidType`, `SchedSortOrder` (no shift time fields)
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
- [ ] Save runs `RemoveIf` + batch `Patch(StaffShifts, ForAll(Filter(...), {...}))`, then rebuilds `colStaff` (Manager excluded), `colShifts`, and `colSchedLookup`
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
| `border-collapse:separate` + `border-spacing:1px` + table `background` | ✅ Works | **Grid lines trick:** 1px gaps between cells show the table background as both horizontal and vertical rules (saves characters vs per-cell borders) |
| `border-spacing` on `<table>` | ✅ Works | Also use for gap between day columns (`8px 0` outer, `4px 0` week row) |
| `min-width` on week inner `<table>` | ✅ Works | Prevents over-compression; restores horizontal scroll in `overflow:auto` wrapper |
| `vertical-align:bottom` on `<td>` | ✅ Works | Legacy gutter alignment when inner day table used `border-collapse:collapse` only |
| `vertical-align:top` + fixed spacer on gutter `<td>` | ✅ Works | Aligns gutters when per-day table uses `border-spacing` (row pitch is `H+1` px) |
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

### The layout pattern that works

Use a **3-cell outer table** (left gutter | content | right gutter), with **a second inner table** for the 5 day columns, and **a third per-day table** for the day header, legend row, and slot rows. All styles inline.

```html
<!-- Outer 3-column layout -->
<table style="border-collapse:separate; border-spacing:8px 0;">
  <tr>
    <!-- Left time gutter — optional sticky; align with slot rows (see below) -->
    <td style="vertical-align:top; width:80px; padding:0;">
      <div style="height:59px;"></div>
      <div style="border:2px solid #d7ccc8; border-radius:10px; overflow:hidden;">
        <div style="height:29px; line-height:29px; text-align:center; ...">8:30-9:00</div>
        <!-- repeat for each time slot (29px = 28px slot + 1px border-spacing rhythm) -->
      </div>
    </td>

    <!-- Week grid — add min-width so HtmlViewer shows horizontal scroll instead of crushing columns -->
    <td style="vertical-align:top; padding:0;">
      <table style="border-collapse:separate; border-spacing:4px 0; table-layout:fixed; width:100%; min-width:1500px;">
        <tr>
          <td style="vertical-align:top; padding:0;">
            <div style="border:2px solid #d7ccc8; border-radius:10px; overflow:hidden;">
              <!-- Per-day: 1px grid via border-spacing + table background (not collapse) -->
              <table cellpadding="0" style="border-collapse:separate; border-spacing:1px; background:#e8e0d8; width:100%; table-layout:fixed;">
                <tr><th colspan="N" style="...">MONDAY</th></tr>
                <tr><!-- legend: one <td> per staff --></tr>
                <tr style="height:28px;"><!-- slot row: one <td> per staff --></tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </td>

    <!-- Right time gutter — NOT sticky (prevents overlap on zoom) -->
    <td style="vertical-align:top; width:80px; padding:0;">
      <div style="height:59px;"></div>
      <!-- same label stack as left -->
    </td>
  </tr>
</table>
```

### Gutter alignment (with `border-spacing` on the day table)

When the **inner per-day** table uses **`border-collapse:separate; border-spacing:1px`**, each slot row is effectively **one pixel taller** than its cell `height` alone. **`vertical-align:bottom`** on the gutter no longer lines up. The shipped screen uses **`vertical-align:top`**, a **`59px`** spacer `<div>` above the gutter box, and **29px**-tall label rows (**`H+1`** when `H = 28`) so labels track the slot rows.

If you ever switch the day table back to **`border-collapse:collapse`** with no vertical `border-spacing`, you can revert to **bottom-aligned** gutters and **28px** labels only (two header rows × 28px = 56px offset).

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

**"Delegation warning" on colStaff load**
- Expected. The schedule's student-worker filter may show delegation warnings in Studio. Since your `Staff` list is well under 500 rows, this is fine for this app.

**Totals sort looks wrong**
- Verify `varSchedTotalsSortBy` is changing from `drpSchedTotalsSort.OnChange` and `varSchedTotalsSortDesc` is toggling from `btnSchedTotalsSortDir.OnSelect`. The gallery sorts a precomputed `totalsRows` table, so stale order usually means one of those variables did not update.

**Negative hours when end time is 4:30 PM**
- The end dropdown includes `"4:30 PM"` but **`LookUp(colTimeSlots, Label = ShiftEnd)`** must find a matching row. Without **`{Idx: 16, Label: "4:30 PM", …}`**, `EndSlot` falls back to `-1` or *Blank* and hour math goes negative. Add the row and keep the HTML grid on **`Filter(colTimeSlots, Idx < 16)`** so layout does not gain an extra row.

---

## Seasonal Maintenance

At the start of each new semester, staff update their own schedule in the app — saving **replaces** their rows in `StaffShifts` for that email.

To clear everyone's shifts at once, open **StaffShifts** in SharePoint **Edit in grid view** and delete rows (or filter/export first if you need a record).
