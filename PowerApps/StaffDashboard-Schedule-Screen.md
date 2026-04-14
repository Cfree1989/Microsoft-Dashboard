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
│  HEADER BAR  ← Dashboard  │  Schedule                │
├──────────────────────────────────────────────────────┤
│  EDIT BAR  [Select your name ▼]  (hidden until name  │
│  selected: [Mon 9AM-1PM] [Tue Off] ... [Save] [×])   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  HTML TEXT GRID (read-only colored block schedule)   │
│                                                      │
│  [Time] ║ Mon: JAKE SARA TOM ║ Tue: JAKE SARA ... ║  │
│  8:30   ║  ██   ░░   ░░    ║  ██   ██   ░░    ║     │
│  9:00   ║  ██   ██   ░░    ║  ░░   ██   ██    ║     │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

- The **HTML Text grid** shows the live schedule from `colSchedLookup` (built from `StaffShifts` + `colStaff`)
- The **Edit Bar** lets someone pick their name, then edit shifts in a **gallery** (add/remove rows; unlimited shifts per day)
- Saving **removes** all `StaffShifts` rows for that email, then **inserts** one row per gallery row (complete rows only)

---

## Step 1: Update App.OnStart

`App.OnStart` already loads the `Staff` list into `colStaff`. You need to:

1. Ensure `colStaff` includes schedule-related fields **only from Staff** (no time columns — shifts live in `StaffShifts`)
2. Add helper collections for the time slots and color palette
3. Add schedule state: `varSchedSelectedEmail`, `varSchedEditSaving`, `varSchedShowReorder`, and initialize `colEditShifts`

### 1A — Update the colStaff load

Find this existing line in `App.OnStart`:

```
ClearCollect(colStaff, ForAll(Filter(Staff, Active = true), {StaffID: ID, MemberName: Member.DisplayName, MemberEmail: Member.Email, Role: Role, Active: Active})),
```

> **Note:** Your existing line may not have `StaffID` yet — add it along with `AidType` and `SchedSortOrder` below.

Replace it with:

```
ClearCollect(colStaff,
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

> **What changed:** `AidType` and `SchedSortOrder` stay on Staff. All shift times are stored in **StaffShifts** — loaded on the Schedule screen, not here.

### 1B — Add the colTimeSlots collection

This helper table converts time labels like `"9:00 AM"` into slot index numbers used by the HTML grid formula. Add this anywhere inside the `Concurrent()` block — or after it:

```
// === SCHEDULE: TIME SLOTS ===
// 16 slots: index 0 = 8:30 AM, index 15 = 4:00 PM (last start before 4:30 close)
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
    {Idx: 15, Label: "4:00 PM",  Minutes: 960}
);
```

> **Why store Minutes?** Power Apps can't do time math directly. Storing minutes since midnight (510 = 8h30m) lets us calculate shift duration with subtraction: `(EndMinutes - StartMinutes) / 60 = hours`.

### 1C — Add the colSchedColors collection

A 12-color palette. Each staff member's color is assigned by `StaffID mod 12` — automatic, no manual assignment needed.

```
// === SCHEDULE: COLOR PALETTE ===
ClearCollect(colSchedColors,
    {Idx: 0,  Hex: "#4E79A7", Light: "#C8D9ED"},
    {Idx: 1,  Hex: "#F28E2B", Light: "#FCDCB3"},
    {Idx: 2,  Hex: "#59A14F", Light: "#C2E0BF"},
    {Idx: 3,  Hex: "#E15759", Light: "#F5C2C3"},
    {Idx: 4,  Hex: "#76B7B2", Light: "#C8E4E2"},
    {Idx: 5,  Hex: "#EDC948", Light: "#F9EDBB"},
    {Idx: 6,  Hex: "#B07AA1", Light: "#DEC8D9"},
    {Idx: 7,  Hex: "#FF9DA7", Light: "#FFD8DC"},
    {Idx: 8,  Hex: "#9C755F", Light: "#DACFCA"},
    {Idx: 9,  Hex: "#BAB0AC", Light: "#E5E2E1"},
    {Idx: 10, Hex: "#D37295", Light: "#F0C8D6"},
    {Idx: 11, Hex: "#A0CBE8", Light: "#D9EDF7"}
);
```

### 1D — Add schedule state variables and empty edit collection

Find the `// === MODAL CONTROLS ===` section and add these alongside the other `Set()` calls:

```
// === SCHEDULE SCREEN STATE ===
Set(varSchedSelectedEmail, "");   // Email of the person being edited ("" = no one)
Set(varSchedEditSaving, false);
Set(varSchedShowReorder, false);
// Working copy of shifts while editing — one row per shift: RowKey, Day, ShiftStart, ShiftEnd
ClearCollect(colEditShifts, {RowKey: "x", Day: "Monday", ShiftStart: "", ShiftEnd: ""});
Clear(colEditShifts);
```

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
);

// Load all shift rows from SharePoint into a flat collection
ClearCollect(colShifts,
    ForAll(
        Filter(StaffShifts, StaffEmail <> ""),
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
                Initials:   Left(sr.MemberName, 1) &
                            Mid(sr.MemberName, Find(" ", sr.MemberName) + 1, 1),
                Day:        sh.Day,
                StartSlot:  Coalesce(LookUp(colTimeSlots, Label = sh.ShiftStart).Idx, -1),
                EndSlot:    Coalesce(LookUp(colTimeSlots, Label = sh.ShiftEnd).Idx,   -1),
                ColorHex:   cr.Hex,
                ColorLight: cr.Light,
                SortOrder:  sr.SchedSortOrder
            }
        )
    )
);

// Reset editing state whenever the screen becomes visible
Set(varSchedSelectedEmail, "");
Clear(colEditShifts)
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

| Property | Value |
|----------|-------|
| Name | `btnSchedBack` |
| Text | `"← Dashboard"` |
| Font | `=varAppFont` |
| Size | `11` |
| Color | `=Color.White` |
| Fill | `=Color.Transparent` |
| HoverFill | `=RGBA(255,255,255,0.1)` |
| BorderThickness | `0` |
| X | `8`, Y | `14`, Width | `120`, Height | `24` |
| OnSelect | `=Navigate(scrDashboard, varScreenTransition)` |

### Title label

| Property | Value |
|----------|-------|
| Name | `lblSchedTitle` |
| Text | `"Schedule"` |
| Font | `=varAppFont` |
| Size | `14` |
| FontWeight | `=FontWeight.Semibold` |
| Color | `=Color.White` |
| Align | `=Align.Center` |
| X | `=(Parent.Width - 300) / 2`, Y | `13` |
| Width | `300`, Height | `26` |

---

## Step 5: Build the Edit Bar

The Edit Bar sits below the header. It shows the name picker always; once a name is selected, the **shift gallery** appears so the user can add, edit, or remove any number of shift rows.

### Edit bar background

| Property | Value |
|----------|-------|
| Name | `recSchedEditBar` |
| Fill | `=varColorBgCard` |
| BorderColor | `=varColorBorder` |
| BorderThickness | `1` |
| X | `0`, Y | `52` |
| Width | `=Parent.Width`, Height | `220` |

### "Who are you?" label

| Property | Value |
|----------|-------|
| Name | `lblSchedWho` |
| Text | `"Who are you?"` |
| Font | `=varAppFont`, Size | `11` |
| Color | `=varColorTextMuted` |
| X | `16`, Y | `62`, Width | `100`, Height | `20` |

### Name dropdown

| Property | Value |
|----------|-------|
| Name | `drpSchedName` |
| Items | `=Sort(colStaff, MemberName, SortOrder.Ascending)` |
| Value | `MemberName` |
| Font | `=varAppFont`, Size | `=varInputFontSize` |
| BorderColor | `=varInputBorderColor` |
| X | `16`, Y | `82`, Width | `180`, Height | `32` |
| OnChange | *(formula below)* |

**OnChange formula** — loads that person's shifts from `colShifts` into `colEditShifts` (one gallery row per shift). If they have no shifts yet, seeds one blank row.

```
If(
    IsBlank(drpSchedName.Selected) || drpSchedName.Selected.MemberName = "Select...",
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
                {RowKey: Text(GUID()), Day: "Monday", ShiftStart: "", ShiftEnd: ""}
            )
        )
    )
)
```

### Aid type + hour counter label

| Property | Value |
|----------|-------|
| Name | `lblSchedAidInfo` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Font | `=varAppFont`, Size | `10` |
| X | `208`, Y | `82`, Width | `220`, Height | `32` |
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
    aidType & " · " & Text(mins / 60, "0.#") & " / " & Text(maxHrs, "0") & " hrs"
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
| X | `16`, Y | `118` |
| Width | `=Parent.Width - 260`, Height | `92` |
| ShowScrollbar | `true` |

**Inside the gallery template**, add controls in a row:

1. **Day** — Drop down `drpGalShiftDay`
   - **Items:** `=["Monday","Tuesday","Wednesday","Thursday","Friday"]`
   - **DefaultSelectedItems:** `=[ThisItem.Day]`
   - **OnChange:** `=UpdateIf(colEditShifts, RowKey = ThisItem.RowKey, {Day: drpGalShiftDay.Selected.Value})`
   - Width `110`, Height `28`

2. **Start** — Drop down `drpGalShiftStart`
   - **Items:** `=["8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"]`
   - **DefaultSelectedItems:** `=If(IsBlank(ThisItem.ShiftStart), Blank(), [ThisItem.ShiftStart])`
   - **OnChange:** `=UpdateIf(colEditShifts, RowKey = ThisItem.RowKey, {ShiftStart: drpGalShiftStart.Selected.Value})`
   - Width `100`, Height `28`

3. **End** — Drop down `drpGalShiftEnd`
   - **Items:** `=["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"]`
   - **DefaultSelectedItems:** `=If(IsBlank(ThisItem.ShiftEnd), Blank(), [ThisItem.ShiftEnd])`
   - **OnChange:** `=UpdateIf(colEditShifts, RowKey = ThisItem.RowKey, {ShiftEnd: drpGalShiftEnd.Selected.Value})`
   - Width `100`, Height `28`

4. **Delete** — Button `btnGalShiftRemove`
   - **Text:** `"✕"`
   - **OnSelect:** `=Remove(colEditShifts, ThisItem)`
   - Width `32`, Height `28`

> **Note:** If `DefaultSelectedItems` with `Blank()` causes issues in your build, use a first option like `"--"` in Items and treat it as empty in the save filter (`ShiftStart <> "--"`).

### Add Shift button

| Property | Value |
|----------|-------|
| Name | `btnSchedAddShift` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Text | `"+ Add shift"` |
| Font | `=varAppFont`, Size | `10` |
| X | `16`, Y | `186` |
| Width | `100`, Height | `28` |
| OnSelect | `=Collect(colEditShifts, {RowKey: Text(GUID()), Day: "Monday", ShiftStart: "", ShiftEnd: ""})` |

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
| X | `890`, Y | `68`, Width | `130`, Height | `36` |
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
| X | `1032`, Y | `68`, Width | `80`, Height | `36` |
| OnSelect | `=Set(varSchedSelectedEmail, ""); Clear(colEditShifts); Reset(drpSchedName)` |

---

## Step 6: Build the HTML Text Grid

### Add the control

Insert an **HTML Text** control:

| Property | Value |
|----------|-------|
| Name | `htmlSchedGrid` |
| X | `0`, Y | `272` |
| Width | `=Parent.Width` |
| Height | `=Parent.Height - 272` |
| PaddingLeft | `0`, PaddingTop | `0` |
| HtmlText | *(formula below)* |

> **Scrolling:** The HTML formula wraps everything in `<div style="overflow:auto; height:100%">`. This gives you horizontal scroll for the wide staff grid and vertical scroll to reveal the totals summary table below it — all within the single control, no extra setup needed.

### The HTML formula

This formula builds the entire grid as a string. It uses `colSchedLookup` (built in `OnVisible`) to determine which cells to color.

```
=With(
    {
        sortedStaff: Distinct(Sort(colStaff, SchedSortOrder, SortOrder.Ascending), MemberEmail),
        slotH: 24,
        colW:  28,
        gutterW: 60
    },

    // ---- OUTER SCROLL WRAPPER + CSS ----
    // overflow:auto lets the content scroll both horizontally (17 columns) and
    // vertically (grid + totals table) within the single HTML control.
    "<div style='overflow:auto;width:100%;height:100%;box-sizing:border-box;'>" &
    "<style>
    .sg{border-collapse:collapse;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;}
    .sg td,.sg th{padding:0;margin:0;}
    .sg .tg{width:" & Text(gutterW) & "px;text-align:right;padding-right:6px;color:#666;font-size:10px;height:" & Text(slotH) & "px;vertical-align:middle;background:#f8f8f8;border-right:1px solid #ddd;}
    .sg .dh{font-weight:700;text-align:center;background:#4d4d4d;color:#fff;height:28px;font-size:11px;border-right:2px solid #999;}
    .sg .sh{text-align:center;height:28px;font-weight:600;font-size:10px;border-right:1px solid #ccc;border-bottom:1px solid #aaa;overflow:hidden;}
    .sg .sc{width:" & Text(colW) & "px;height:" & Text(slotH) & "px;border-right:1px solid #e0e0e0;border-bottom:1px solid #e8e8e8;}
    .sg .ds{border-right:2px solid #999!important;}
    .sg .tot{text-align:center;font-size:10px;font-weight:600;height:22px;vertical-align:middle;border-top:2px solid #aaa;border-right:1px solid #ccc;}
    .ts{border-collapse:collapse;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;margin-top:24px;min-width:500px;}
    .ts th{background:#4d4d4d;color:#fff;padding:6px 12px;text-align:center;white-space:nowrap;}
    .ts th.ts-n{text-align:left;min-width:160px;}
    .ts td{padding:5px 12px;text-align:center;border-bottom:1px solid #ddd;white-space:nowrap;}
    .ts td.ts-n{text-align:left;}
    .ts .over{color:#c0392b;font-weight:700;}
    .ts-foot td{background:#6b6b6b;color:#fff;font-weight:700;padding:6px 12px;}
    </style>" &

    "<table class='sg'>" &

    // ---- ROW 1: Day group headers ----
    "<tr><th class='tg' rowspan='2'></th>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        "<th class='dh" & If(dayName.Value = "Friday", " ds", "") & "' colspan='" &
        Text(CountRows(sortedStaff)) & "'>" & Left(dayName.Value, 3) & "</th>"
    ) &
    "</tr>" &

    // ---- ROW 2: Staff initials (from colStaff — same for every day column) ----
    "<tr>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        Concat(
            sortedStaff As s,
            With(
                {
                    sr: LookUp(colStaff, MemberEmail = s.Value),
                    cr: LookUp(colSchedColors, Idx = Mod(sr.StaffID, 12))
                },
                "<th class='sh" & If(dayName.Value = "Friday" && s.Value = Last(sortedStaff).Value, " ds", If(s.Value = Last(sortedStaff).Value, " ds", "")) &
                "' style='background:" & Coalesce(cr.Light, "#eeeeee") & ";width:" & Text(colW) & "px'>" &
                Left(sr.MemberName, 1) & Mid(sr.MemberName, Find(" ", sr.MemberName) + 1, 1) &
                "</th>"
            )
        )
    ) &
    "</tr>" &

    // ---- TIME SLOT ROWS ----
    Concat(
        colTimeSlots As slot,
        "<tr><td class='tg'>" & slot.Label & "</td>" &
        Concat(
            ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
            Concat(
                sortedStaff As s,
                With(
                    {
                        matches: Filter(
                            colSchedLookup,
                            Email = s.Value &&
                            Day = dayName.Value &&
                            StartSlot >= 0 &&
                            slot.Idx >= StartSlot &&
                            slot.Idx < EndSlot
                        ),
                        cr: LookUp(colSchedColors, Idx = Mod(LookUp(colStaff, MemberEmail = s.Value).StaffID, 12))
                    },
                    "<td class='sc" & If(dayName.Value = "Friday" && s.Value = Last(sortedStaff).Value, " ds", If(s.Value = Last(sortedStaff).Value, " ds", "")) &
                    "' style='background:" &
                    If(CountRows(matches) > 0, cr.Hex, "#ffffff") & "'></td>"
                )
            )
        ) &
        "</tr>"
    ) &

    // ---- TOTALS ROW (sum all shift rows for that person + day) ----
    "<tr><td class='tg' style='font-size:9px;font-weight:700;'>Hrs/Day</td>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        Concat(
            sortedStaff As s,
            With(
                {
                    dayHrs: Sum(
                        Filter(
                            colSchedLookup,
                            Email = s.Value && Day = dayName.Value && StartSlot >= 0
                        ),
                        (EndSlot - StartSlot) / 2
                    ),
                    cr: LookUp(colSchedColors, Idx = Mod(LookUp(colStaff, MemberEmail = s.Value).StaffID, 12))
                },
                "<td class='tot" & If(s.Value = Last(sortedStaff).Value, " ds", "") &
                "' style='background:" & Coalesce(cr.Light, "#f0f0f0") & "'>" &
                If(dayHrs > 0, Text(dayHrs, "0.#") & "h", "—") & "</td>"
            )
        )
    ) &
    "</tr>" &

    // ---- WEEKLY TOTAL ROW ----
    "<tr><td class='tg' style='font-size:9px;font-weight:700;'>Wk / Max</td>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        Concat(
            sortedStaff As s,
            With(
                {
                    totalHrs: Sum(
                        Filter(colSchedLookup, Email = s.Value && StartSlot >= 0),
                        (EndSlot - StartSlot) / 2
                    ),
                    maxHrs: Switch(
                        LookUp(colStaff, MemberEmail = s.Value).AidType,
                        "Work Study",         12,
                        "Graduate Assistant", 20,
                        6
                    ),
                    cr: LookUp(colSchedColors, Idx = Mod(LookUp(colStaff, MemberEmail = s.Value).StaffID, 12))
                },
                "<td class='tot" & If(s.Value = Last(sortedStaff).Value, " ds", "") &
                "' style='background:" & Coalesce(cr.Light, "#f0f0f0") & ";font-size:9px;'>" &
                If(dayName.Value = "Monday",
                    Text(totalHrs, "0.#") & "/" & Text(maxHrs, "0"),
                    ""
                ) & "</td>"
            )
        )
    ) &
    "</tr>" &

    "</table>" &

    // ---- TOTALS SUMMARY TABLE ----
    "<table class='ts'>" &
    "<thead><tr>" &
    "<th class='ts-n'>Student</th><th>Type</th>" &
    "<th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th>" &
    "<th>Total</th><th>Max</th>" &
    "</tr></thead><tbody>" &
    Concat(
        Distinct(Sort(colStaff, SchedSortOrder, SortOrder.Ascending), MemberEmail) As p,
        With(
            {
                sr: LookUp(colStaff, MemberEmail = p.Value),
                cr: LookUp(colSchedColors, Idx = Mod(sr.StaffID, 12)),
                mH: Sum(
                    Filter(colSchedLookup, Email = p.Value && Day = "Monday" && StartSlot >= 0),
                    (EndSlot - StartSlot) / 2
                ),
                tuH: Sum(
                    Filter(colSchedLookup, Email = p.Value && Day = "Tuesday" && StartSlot >= 0),
                    (EndSlot - StartSlot) / 2
                ),
                wH: Sum(
                    Filter(colSchedLookup, Email = p.Value && Day = "Wednesday" && StartSlot >= 0),
                    (EndSlot - StartSlot) / 2
                ),
                thH: Sum(
                    Filter(colSchedLookup, Email = p.Value && Day = "Thursday" && StartSlot >= 0),
                    (EndSlot - StartSlot) / 2
                ),
                fH: Sum(
                    Filter(colSchedLookup, Email = p.Value && Day = "Friday" && StartSlot >= 0),
                    (EndSlot - StartSlot) / 2
                ),
                maxH: Switch(
                    sr.AidType,
                    "Work Study",         12,
                    "Graduate Assistant", 20,
                    6
                ),
                abbrev: Switch(
                    sr.AidType,
                    "Work Study",         "WS",
                    "Graduate Assistant", "GA",
                    "President's Aid",    "PA",
                    "—"
                ),
                bgColor: Coalesce(cr.Light, "#f5f5f5")
            },
            With(
                {totH: mH + tuH + wH + thH + fH},
                "<tr style='background:" & bgColor & "'>" &
                "<td class='ts-n'>" & sr.MemberName & "</td>" &
                "<td>" & abbrev & "</td>" &
                "<td>" & Text(mH,  "0.#") & "</td>" &
                "<td>" & Text(tuH, "0.#") & "</td>" &
                "<td>" & Text(wH,  "0.#") & "</td>" &
                "<td>" & Text(thH, "0.#") & "</td>" &
                "<td>" & Text(fH,  "0.#") & "</td>" &
                "<td class='" & If(totH > maxH, "over", "") & "'>" & Text(totH, "0.#") & "</td>" &
                "<td>" & Text(maxH, "0") & "</td>" &
                "</tr>"
            )
        )
    ) &
    "</tbody><tfoot>" &

    // Footer: daily totals across all staff
    "<tr class='ts-foot'><td class='ts-n'>DAILY TOTALS</td><td></td>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As d,
        "<td>" &
        Text(
            Sum(
                Filter(colSchedLookup, Day = d.Value && StartSlot >= 0),
                (EndSlot - StartSlot) / 2
            ),
            "0.#"
        ) & "</td>"
    ) &
    With(
        {
            grandTotal: Sum(
                Filter(colSchedLookup, StartSlot >= 0),
                (EndSlot - StartSlot) / 2
            )
        },
        "<td>" & Text(grandTotal, "0.#") & "</td><td></td>"
    ) &
    "</tr></tfoot></table>" &

    "</div>"
)
```

> **Column width:** `colW: 28` is sized for 2-letter initials. Widen to `32`–`36` if you want a bit more breathing room per column.

> **Totals summary table:** Appears below the grid after scrolling down. Rows match staff sort order, colored with each person's pastel. The `Total` column turns red if a person exceeds their AidType cap. `DAILY TOTALS` footer sums all staff hours per day plus a grand weekly total.

---

## Step 7: Save Logic

Wire the `OnSelect` of `btnSchedSave` with this formula. It **replaces** all `StaffShifts` rows for the selected email with the current gallery rows (complete rows only), then rebuilds collections so the grid updates without leaving the screen.

```
Set(varSchedEditSaving, true);

// 1. Remove every existing shift row for this person
RemoveIf(StaffShifts, StaffEmail = varSchedSelectedEmail);

// 2. Insert one SharePoint row per complete gallery row
ForAll(
    Filter(colEditShifts, !IsBlank(ShiftStart) && !IsBlank(ShiftEnd)),
    Patch(
        StaffShifts,
        Defaults(StaffShifts),
        {
            StaffEmail: varSchedSelectedEmail,
            Day:        {Value: Day},
            ShiftStart: {Value: ShiftStart},
            ShiftEnd:   {Value: ShiftEnd}
        }
    )
);

// 3. Refresh colStaff (in case AidType / sort changed elsewhere)
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
);

// 4. Reload shifts + rebuild colSchedLookup (same logic as scrSchedule.OnVisible)
ClearCollect(
    colShifts,
    ForAll(
        Filter(StaffShifts, StaffEmail <> ""),
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
                Initials:   Left(sr.MemberName, 1) &
                            Mid(sr.MemberName, Find(" ", sr.MemberName) + 1, 1),
                Day:        sh.Day,
                StartSlot:  Coalesce(LookUp(colTimeSlots, Label = sh.ShiftStart).Idx, -1),
                EndSlot:    Coalesce(LookUp(colTimeSlots, Label = sh.ShiftEnd).Idx,   -1),
                ColorHex:   cr.Hex,
                ColorLight: cr.Light,
                SortOrder:  sr.SchedSortOrder
            }
        )
    )
);

// 5. Reset editing state
Set(varSchedSelectedEmail, "");
Clear(colEditShifts);
Reset(drpSchedName);
Set(varSchedEditSaving, false)
```

> **Why `RemoveIf` + `Patch`?** SharePoint has no "replace collection" in one call. Deleting all rows for that email then inserting the current set keeps unlimited shifts per day without orphaned rows.

> **Choice columns** on `StaffShifts` (`Day`, `ShiftStart`, `ShiftEnd`) must be written as `{Value: "text"}`, not plain strings.

---

## Step 8: Reorder Panel (Up/Down Arrows)

The reorder panel lets a manager adjust the left-to-right column order by changing `SchedSortOrder` in the Staff list.

### Toggle button

| Property | Value |
|----------|-------|
| Name | `btnSchedReorderToggle` |
| Text | `"⇅ Reorder"` |
| Font | `=varAppFont`, Size | `10` |
| Color | `=Color.White` |
| Fill | `=varColorNeutral` |
| BorderThickness | `0` |
| X | `1150`, Y | `68`, Width | `90`, Height | `36` |
| OnSelect | `=Set(varSchedShowReorder, !varSchedShowReorder)` |

> **Layout:** Edit bar is **220px** tall (52 + 220 = **272** for the top of `htmlSchedGrid` and reorder panel).

### Reorder panel background

| Property | Value |
|----------|-------|
| Name | `recSchedReorderPanel` |
| Visible | `=varSchedShowReorder` |
| Fill | `=varColorBgCard` |
| BorderColor | `=varColorBorder`, BorderThickness | `1` |
| X | `=Parent.Width - 220`, Y | `272` |
| Width | `220`, Height | `=Parent.Height - 272` |

### Reorder gallery

| Property | Value |
|----------|-------|
| Name | `galSchedReorder` |
| Visible | `=varSchedShowReorder` |
| Items | `=Sort(colStaff, SchedSortOrder, SortOrder.Ascending)` |
| TemplateSize | `40` |
| X | `=Parent.Width - 218`, Y | `276` |
| Width | `216`, Height | `=Parent.Height - 280` |

**Inside the gallery template, add:**

1. **Name label** — `Text`: `=ThisItem.MemberName`, X `8`, Y `10`, Width `130`, Height `20`

2. **Up button (↑)** — X `148`, Y `8`, Width `28`, Height `24`

   **OnSelect:**
   ```
   // Find this person's Staff list row and the row above them (lower SortOrder)
   With(
       {
           myRow:   LookUp(Staff, Member.Email = ThisItem.MemberEmail),
           prevRow: Last(Filter(Sort(Staff, SchedSortOrder, SortOrder.Ascending), SchedSortOrder < ThisItem.SchedSortOrder && Active = true))
       },
       If(!IsBlank(myRow) && !IsBlank(prevRow),
           Patch(Staff, myRow,   {SchedSortOrder: prevRow.SchedSortOrder});
           Patch(Staff, prevRow, {SchedSortOrder: myRow.SchedSortOrder})
       )
   );
   // Navigate to self to re-trigger OnVisible (reloads colShifts + colSchedLookup)
   Navigate(scrSchedule, ScreenTransition.None)
   ```

3. **Down button (↓)** — Same as Up but swap `<` for `>` and use `First(Filter(...))` instead of `Last`:

   **OnSelect:**
   ```
   With(
       {
           myRow:   LookUp(Staff, Member.Email = ThisItem.MemberEmail),
           nextRow: First(Filter(Sort(Staff, SchedSortOrder, SortOrder.Ascending), SchedSortOrder > ThisItem.SchedSortOrder && Active = true))
       },
       If(!IsBlank(myRow) && !IsBlank(nextRow),
           Patch(Staff, myRow,   {SchedSortOrder: nextRow.SchedSortOrder});
           Patch(Staff, nextRow, {SchedSortOrder: myRow.SchedSortOrder})
       )
   );
   Navigate(scrSchedule, ScreenTransition.None)
   ```

> **Why `Navigate(scrSchedule, ScreenTransition.None)`?** This re-triggers `OnVisible`, which reloads `colShifts` from SharePoint and rebuilds `colSchedLookup` with the updated column order. It avoids duplicating that load logic after each reorder.

---

## Testing

### Test 1: Grid displays with no data
- Navigate to the Schedule screen
- The HTML grid should show time labels (8:30 AM – 4:00 PM), day headers, and blank white cells
- No errors in the app checker

### Test 2: Enter a schedule
- Select your name from the dropdown
- In the gallery, set Day **Monday**, Start **9:00 AM**, End **1:00 PM**
- Click **+ Add shift** and add **Wednesday** 10:00 AM – 2:00 PM
- Hour counter should show "8 / 12 hrs" (or "8 / 6 hrs" for President's Aid), etc.
- Click **Save Schedule**
- Grid should update with your colored blocks

### Test 3: Re-edit
- Select the same name again
- Gallery should list the same shift rows you saved
- Add a third shift, remove one, or change times — save — grid should reflect the change

### Test 4: Reorder
- Click **Reorder**
- Press ↑ on a staff member — their column should move left in the grid
- Navigate away and back — order should be preserved

### Test 5: Return to dashboard
- Press **← Dashboard** — returns to `scrDashboard` without errors

---

## Verification Checklist

**SharePoint:**
- [ ] `StaffShifts` list exists per [StaffShifts-List-Setup.md](../SharePoint/StaffShifts-List-Setup.md)
- [ ] `Staff` list has no time columns — only `AidType`, `SchedSortOrder`, etc.

**App.OnStart:**
- [ ] `colStaff` includes `StaffID`, `AidType`, `SchedSortOrder` (no shift time fields)
- [ ] `colTimeSlots` has 16 rows, correct labels and minute values
- [ ] `colSchedColors` has 12 color entries
- [ ] `colEditShifts` initialized empty (`ClearCollect` dummy row then `Clear`)
- [ ] `varSchedSelectedEmail`, `varSchedEditSaving`, `varSchedShowReorder` initialized
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
- [ ] Save runs `RemoveIf` + `ForAll`/`Patch` on `StaffShifts`, then rebuilds `colShifts` / `colSchedLookup`
- [ ] Cancel clears selection and `colEditShifts` without saving
- [ ] Reorder panel Up/Down buttons update `SchedSortOrder` on `Staff`

---

## Troubleshooting

**Grid is all white after saving**
- Check that `colSchedLookup` is being rebuilt in the save formula. Add a temporary label with `Text: =CountRows(colSchedLookup)` to verify it has rows.

**"Invalid argument type" on Patch to StaffShifts**
- `Day`, `ShiftStart`, and `ShiftEnd` are Choice columns — use `{Value: Day}` etc., not plain strings.

**Gallery dropdowns don't reflect collection updates**
- Prefer `UpdateIf(colEditShifts, RowKey = ThisItem.RowKey, {...})` on each dropdown's `OnChange`. If defaults stick incorrectly, toggle `Reset(galEditShifts)` after `ClearCollect` in `drpSchedName.OnChange` (Power Apps build-dependent).

**"Delegation warning" on colStaff load**
- Expected. `Filter(Staff, Active = true)` may show a delegation warning. Since your Staff list has well under 500 rows, this is fine.

**Reorder doesn't persist after navigating away**
- The `Navigate(scrSchedule, ScreenTransition.None)` approach re-runs `OnVisible` which reloads from SharePoint. If the order still doesn't stick, verify that `Patch(Staff, myRow, {SchedSortOrder: ...})` is succeeding — check for errors using `IfError(Patch(...), Notify("Save failed: " & FirstError.Message, NotificationType.Error))`.

---

## Seasonal Maintenance

At the start of each new semester, staff update their own schedule in the app — saving **replaces** their rows in `StaffShifts` for that email.

To clear everyone's shifts at once, open **StaffShifts** in SharePoint **Edit in grid view** and delete rows (or filter/export first if you need a record).
