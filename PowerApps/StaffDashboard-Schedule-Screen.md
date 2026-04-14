# Schedule Screen — Staff Dashboard Canvas App

**⏱️ Time Required:** 2–3 hours  
**🎯 Goal:** A live color-coded semester schedule showing all active student workers, with inline editing so each person can enter their own hours

> 📚 **This is a screen addition to the existing Staff Dashboard app.** Complete the SharePoint update before starting here.

---

## Prerequisites

Before starting, confirm all of the following:

- [ ] All 12 new columns added to the `Staff` list → `SharePoint/Staff-List-AidType-Update.md`
- [ ] `AidType` populated for all active student workers
- [ ] You can open the Staff Dashboard app in **Power Apps Studio** (go to make.powerapps.com → Apps → open StaffDashboard in Edit mode)
- [ ] The existing app is working (print requests dashboard is functional)

> **No new SharePoint list or data connection needed.** Everything reads from and writes to the existing `Staff` list that the app already uses.

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

- The **HTML Text grid** always shows the live schedule pulled from `colStaff`
- The **Edit Bar** appears when someone picks their name from the dropdown
- Saving writes directly to the `Staff` list — one `Patch()` call, no separate list needed

---

## Step 1: Update App.OnStart

`App.OnStart` already loads the `Staff` list into `colStaff`. You need to:

1. Add the new schedule columns to the `colStaff` projection
2. Add helper collections for the time slots and color palette
3. Add schedule state variables

### 1A — Update the colStaff load

Find this existing line in `App.OnStart`:

```
ClearCollect(colStaff, ForAll(Filter(Staff, Active = true), {StaffID: ID, MemberName: Member.DisplayName, MemberEmail: Member.Email, Role: Role, Active: Active})),
```

> **Note:** Your existing line may not have `StaffID` yet. Add it along with the schedule fields below.

Replace it with:

```
ClearCollect(colStaff,
    ForAll(
        Filter(Staff, Active = true),
        {
            StaffID:       ID,
            MemberName:    Member.DisplayName,
            MemberEmail:   Member.Email,
            Role:          Role,
            Active:        Active,
            AidType:       AidType.Value,
            MonStart:      MonStart.Value,
            MonEnd:        MonEnd.Value,
            TueStart:      TueStart.Value,
            TueEnd:        TueEnd.Value,
            WedStart:      WedStart.Value,
            WedEnd:        WedEnd.Value,
            ThuStart:      ThuStart.Value,
            ThuEnd:        ThuEnd.Value,
            FriStart:      FriStart.Value,
            FriEnd:        FriEnd.Value,
            SchedSortOrder: Coalesce(SchedSortOrder, 10)
        }
    )
),
```

> **What changed:** Added `StaffID`, `AidType`, all 10 day time fields, and `SchedSortOrder`. The `.Value` suffix is needed because Choice columns in SharePoint are complex objects — `.Value` gives you the text string.

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

### 1D — Add schedule state variables

Find the `// === MODAL CONTROLS ===` section and add these alongside the other `Set()` calls:

```
// === SCHEDULE SCREEN STATE ===
Set(varSchedSelectedEmail, "");     // Email of the person being edited ("" = no one)
Set(varSchedEditMon_Start, "");
Set(varSchedEditMon_End, "");
Set(varSchedEditTue_Start, "");
Set(varSchedEditTue_End, "");
Set(varSchedEditWed_Start, "");
Set(varSchedEditWed_End, "");
Set(varSchedEditThu_Start, "");
Set(varSchedEditThu_End, "");
Set(varSchedEditFri_Start, "");
Set(varSchedEditFri_End, "");
Set(varSchedEditSaving, false);
Set(varSchedShowReorder, false);
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
// Build a flat lookup table used by the HTML grid formula.
// One row per person per day — pre-computes slot indices and colors so
// the HTML formula stays fast and readable.
ClearCollect(colSchedLookup,
    ForAll(
        Sort(colStaff, SchedSortOrder, SortOrder.Ascending) As s,
        ForAll(
            ["Monday","Tuesday","Wednesday","Thursday","Friday"] As d,
            With(
                {
                    startLabel: Switch(d.Value,
                        "Monday",    s.MonStart,
                        "Tuesday",   s.TueStart,
                        "Wednesday", s.WedStart,
                        "Thursday",  s.ThuStart,
                        "Friday",    s.FriStart
                    ),
                    endLabel: Switch(d.Value,
                        "Monday",    s.MonEnd,
                        "Tuesday",   s.TueEnd,
                        "Wednesday", s.WedEnd,
                        "Thursday",  s.ThuEnd,
                        "Friday",    s.FriEnd
                    ),
                    colorRec: LookUp(colSchedColors, Idx = Mod(s.StaffID, 12))
                },
                {
                    Email:      s.MemberEmail,
                    Name:       s.MemberName,
                    Day:        d.Value,
                    StartSlot:  Coalesce(LookUp(colTimeSlots, Label = startLabel).Idx, -1),
                    EndSlot:    Coalesce(LookUp(colTimeSlots, Label = endLabel).Idx, -1),
                    ColorHex:   colorRec.Hex,
                    ColorLight: colorRec.Light,
                    SortOrder:  s.SchedSortOrder
                }
            )
        )
    )
);

// Reset editing state whenever the screen becomes visible
Set(varSchedSelectedEmail, "")
```

> **What colSchedLookup does:** Instead of running complex lookups inside the HTML formula itself, we pre-compute everything once here. The HTML formula then does a simple `LookUp(colSchedLookup, Email = ... && Day = ...)` per cell. This keeps the grid fast and the formula readable.

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

The Edit Bar sits below the header. It's always visible, but most of it only appears once a name is selected.

### Edit bar background

| Property | Value |
|----------|-------|
| Name | `recSchedEditBar` |
| Fill | `=varColorBgCard` |
| BorderColor | `=varColorBorder` |
| BorderThickness | `1` |
| X | `0`, Y | `52` |
| Width | `=Parent.Width`, Height | `90` |

### "Who are you?" label

| Property | Value |
|----------|-------|
| Name | `lblSchedWho` |
| Text | `"Who are you?"` |
| Font | `=varAppFont`, Size | `11` |
| Color | `=varColorTextMuted` |
| X | `16`, Y | `66`, Width | `100`, Height | `20` |

### Name dropdown

| Property | Value |
|----------|-------|
| Name | `drpSchedName` |
| Items | `=Sort(colStaff, MemberName, SortOrder.Ascending)` |
| Value | `MemberName` |
| Font | `=varAppFont`, Size | `=varInputFontSize` |
| BorderColor | `=varInputBorderColor` |
| X | `16`, Y | `88`, Width | `180`, Height | `32` |
| OnChange | *(formula below)* |

**OnChange formula:**

```
If(
    IsBlank(drpSchedName.Selected) || drpSchedName.Selected.MemberName = "Select...",
    Set(varSchedSelectedEmail, ""),

    // Load this person's existing schedule into the edit variables
    With(
        {p: drpSchedName.Selected},
        Set(varSchedSelectedEmail, p.MemberEmail);
        Set(varSchedEditMon_Start, Coalesce(p.MonStart, ""));
        Set(varSchedEditMon_End,   Coalesce(p.MonEnd, ""));
        Set(varSchedEditTue_Start, Coalesce(p.TueStart, ""));
        Set(varSchedEditTue_End,   Coalesce(p.TueEnd, ""));
        Set(varSchedEditWed_Start, Coalesce(p.WedStart, ""));
        Set(varSchedEditWed_End,   Coalesce(p.WedEnd, ""));
        Set(varSchedEditThu_Start, Coalesce(p.ThuStart, ""));
        Set(varSchedEditThu_End,   Coalesce(p.ThuEnd, ""));
        Set(varSchedEditFri_Start, Coalesce(p.FriStart, ""));
        Set(varSchedEditFri_End,   Coalesce(p.FriEnd, ""))
    )
)
```

### Aid type + hour counter label

| Property | Value |
|----------|-------|
| Name | `lblSchedAidInfo` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Font | `=varAppFont`, Size | `10` |
| X | `208`, Y | `88`, Width | `200`, Height | `32` |
| Text | *(formula below)* |
| Color | *(formula below)* |

**Text formula:**

```
=With(
    {
        aidType: drpSchedName.Selected.AidType,
        maxHrs:  If(drpSchedName.Selected.AidType = "Work Study", 12, 6),
        usedSlots: Sum(
            Filter(colTimeSlots,
                Or(
                    And(varSchedEditMon_Start <> "", varSchedEditMon_End <> "",
                        Idx >= LookUp(colTimeSlots, Label = varSchedEditMon_Start).Idx,
                        Idx <  LookUp(colTimeSlots, Label = varSchedEditMon_End).Idx),
                    And(varSchedEditTue_Start <> "", varSchedEditTue_End <> "",
                        Idx >= LookUp(colTimeSlots, Label = varSchedEditTue_Start).Idx,
                        Idx <  LookUp(colTimeSlots, Label = varSchedEditTue_End).Idx),
                    And(varSchedEditWed_Start <> "", varSchedEditWed_End <> "",
                        Idx >= LookUp(colTimeSlots, Label = varSchedEditWed_Start).Idx,
                        Idx <  LookUp(colTimeSlots, Label = varSchedEditWed_End).Idx),
                    And(varSchedEditThu_Start <> "", varSchedEditThu_End <> "",
                        Idx >= LookUp(colTimeSlots, Label = varSchedEditThu_Start).Idx,
                        Idx <  LookUp(colTimeSlots, Label = varSchedEditThu_End).Idx),
                    And(varSchedEditFri_Start <> "", varSchedEditFri_End <> "",
                        Idx >= LookUp(colTimeSlots, Label = varSchedEditFri_Start).Idx,
                        Idx <  LookUp(colTimeSlots, Label = varSchedEditFri_End).Idx)
                )
            ),
            30
        )
    },
    aidType & " · " & Text(usedSlots / 60, "0.#") & " / " & Text(maxHrs, "0") & " hrs"
)
```

**Color formula** (turns red when over the limit):

```
=With(
    {maxHrs: If(drpSchedName.Selected.AidType = "Work Study", 12, 6)},
    If(
        Value(Mid(lblSchedAidInfo.Text, Find("·", lblSchedAidInfo.Text) + 2, 4)) > maxHrs,
        varColorDanger,
        varColorText
    )
)
```

### Per-day dropdowns

For each of the 5 days, add a day label and two dropdowns (start, end). Below is the full spec for **Monday** — repeat for Tuesday–Friday changing only the names, variables, and X positions.

**Day header label (Mon):**

| Property | Value |
|----------|-------|
| Name | `lblSchedMonHdr` |
| Text | `"Mon"` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Font | `=varAppFont`, Size | `9`, FontWeight | `=FontWeight.Semibold` |
| Align | `=Align.Center` |
| X | `420`, Y | `56`, Width | `88`, Height | `16` |

**Monday Start dropdown:**

| Property | Value |
|----------|-------|
| Name | `drpSchedMonStart` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Items | `=["Off","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"]` |
| Default | `=If(varSchedEditMon_Start = "", "Off", varSchedEditMon_Start)` |
| Font | `=varAppFont`, Size | `9` |
| X | `420`, Y | `74`, Width | `88`, Height | `28` |
| OnChange | `=Set(varSchedEditMon_Start, If(drpSchedMonStart.Selected.Value = "Off", "", drpSchedMonStart.Selected.Value))` |

**Monday End dropdown:**

| Property | Value |
|----------|-------|
| Name | `drpSchedMonEnd` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Items | `=["Off","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"]` |
| Default | `=If(varSchedEditMon_End = "", "Off", varSchedEditMon_End)` |
| Font | `=varAppFont`, Size | `9` |
| X | `420`, Y | `104`, Width | `88`, Height | `28` |
| OnChange | `=Set(varSchedEditMon_End, If(drpSchedMonEnd.Selected.Value = "Off", "", drpSchedMonEnd.Selected.Value))` |

**Repeat for Tuesday–Friday** with these X positions (92px gap per day):

| Day | X | Start Var | End Var |
|-----|---|-----------|---------|
| Monday | `420` | `varSchedEditMon_Start` | `varSchedEditMon_End` |
| Tuesday | `512` | `varSchedEditTue_Start` | `varSchedEditTue_End` |
| Wednesday | `604` | `varSchedEditWed_Start` | `varSchedEditWed_End` |
| Thursday | `696` | `varSchedEditThu_Start` | `varSchedEditThu_End` |
| Friday | `788` | `varSchedEditFri_Start` | `varSchedEditFri_End` |

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
| OnSelect | `=Set(varSchedSelectedEmail, ""); Reset(drpSchedName)` |

---

## Step 6: Build the HTML Text Grid

### Add the control

Insert an **HTML Text** control:

| Property | Value |
|----------|-------|
| Name | `htmlSchedGrid` |
| X | `0`, Y | `144` |
| Width | `=Parent.Width` |
| Height | `=Parent.Height - 144` |
| PaddingLeft | `0`, PaddingTop | `0` |
| HtmlText | *(formula below)* |

### The HTML formula

This formula builds the entire grid as a string. It uses `colSchedLookup` (built in `OnVisible`) to determine which cells to color.

```
=With(
    {
        sortedStaff: Distinct(Sort(colSchedLookup, SortOrder, SortOrder.Ascending), Email),
        slotH: 28,
        colW:  64,
        gutterW: 56
    },

    // ---- CSS ----
    "<style>
    .sg{border-collapse:collapse;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;}
    .sg td,.sg th{padding:0;margin:0;}
    .sg .tg{width:" & Text(gutterW) & "px;text-align:right;padding-right:6px;color:#666;font-size:10px;height:" & Text(slotH) & "px;vertical-align:middle;background:#f8f8f8;border-right:1px solid #ddd;}
    .sg .dh{font-weight:700;text-align:center;background:#4d4d4d;color:#fff;height:28px;font-size:11px;border-right:2px solid #999;}
    .sg .sh{text-align:center;height:28px;font-weight:600;font-size:10px;border-right:1px solid #ccc;border-bottom:1px solid #aaa;overflow:hidden;}
    .sg .sc{width:" & Text(colW) & "px;height:" & Text(slotH) & "px;border-right:1px solid #e0e0e0;border-bottom:1px solid #e8e8e8;}
    .sg .ds{border-right:2px solid #999!important;}
    .sg .tot{text-align:center;font-size:10px;font-weight:600;height:22px;vertical-align:middle;border-top:2px solid #aaa;border-right:1px solid #ccc;}
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

    // ---- ROW 2: Staff name headers ----
    "<tr>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        Concat(
            sortedStaff As s,
            With(
                {c: LookUp(colSchedLookup, Email = s.Value && Day = dayName.Value)},
                "<th class='sh" & If(dayName.Value = "Friday" && s.Value = Last(sortedStaff).Value, " ds", If(s.Value = Last(sortedStaff).Value, " ds", "")) &
                "' style='background:" & Coalesce(c.ColorLight, "#eeeeee") & ";width:" & Text(colW) & "px'>" &
                Left(LookUp(colSchedLookup, Email = s.Value).Name, 8) &
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
                    {c: LookUp(colSchedLookup, Email = s.Value && Day = dayName.Value)},
                    "<td class='sc" & If(dayName.Value = "Friday" && s.Value = Last(sortedStaff).Value, " ds", If(s.Value = Last(sortedStaff).Value, " ds", "")) &
                    "' style='background:" &
                    If(
                        !IsBlank(c) && c.StartSlot >= 0 && slot.Idx >= c.StartSlot && slot.Idx < c.EndSlot,
                        c.ColorHex,
                        "#ffffff"
                    ) & "'></td>"
                )
            )
        ) &
        "</tr>"
    ) &

    // ---- TOTALS ROW ----
    "<tr><td class='tg' style='font-size:9px;font-weight:700;'>Hrs/Day</td>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        Concat(
            sortedStaff As s,
            With(
                {c: LookUp(colSchedLookup, Email = s.Value && Day = dayName.Value)},
                "<td class='tot" & If(s.Value = Last(sortedStaff).Value, " ds", "") &
                "' style='background:" & Coalesce(c.ColorLight, "#f0f0f0") & "'>" &
                If(!IsBlank(c) && c.StartSlot >= 0,
                    Text((c.EndSlot - c.StartSlot) / 2, "0.#") & "h",
                    "—"
                ) & "</td>"
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
                    totalSlots: Sum(Filter(colSchedLookup, Email = s.Value, StartSlot >= 0), EndSlot - StartSlot),
                    maxHrs: If(LookUp(colStaff, MemberEmail = s.Value).AidType = "Work Study", 12, 6),
                    c: LookUp(colSchedLookup, Email = s.Value && Day = "Monday")
                },
                "<td class='tot" & If(s.Value = Last(sortedStaff).Value, " ds", "") &
                "' style='background:" & Coalesce(c.ColorLight, "#f0f0f0") & ";font-size:9px;'>" &
                If(dayName.Value = "Monday",
                    Text(totalSlots / 2, "0.#") & "/" & Text(maxHrs, "0"),
                    ""
                ) & "</td>"
            )
        )
    ) &
    "</tr>" &

    "</table>"
)
```

> **Column width:** `colW: 64` gives each staff member 64px. If you have many people and the grid overflows, reduce to `48` or `56`.

> **Name truncation:** `Left(...Name..., 8)` truncates to 8 characters to fit the column. Increase the number or the `colW` if names are getting cut off too aggressively.

---

## Step 7: Save Logic

Wire the `OnSelect` of `btnSchedSave` with this formula. It patches a single row in the `Staff` list — much simpler than the separate-list approach.

```
Set(varSchedEditSaving, true);

// Patch the one Staff list row for this person with all their schedule times
Patch(
    Staff,
    LookUp(Staff, Member.Email = varSchedSelectedEmail),
    {
        MonStart: If(varSchedEditMon_Start = "", Blank(), {Value: varSchedEditMon_Start}),
        MonEnd:   If(varSchedEditMon_End   = "", Blank(), {Value: varSchedEditMon_End}),
        TueStart: If(varSchedEditTue_Start = "", Blank(), {Value: varSchedEditTue_Start}),
        TueEnd:   If(varSchedEditTue_End   = "", Blank(), {Value: varSchedEditTue_End}),
        WedStart: If(varSchedEditWed_Start = "", Blank(), {Value: varSchedEditWed_Start}),
        WedEnd:   If(varSchedEditWed_End   = "", Blank(), {Value: varSchedEditWed_End}),
        ThuStart: If(varSchedEditThu_Start = "", Blank(), {Value: varSchedEditThu_Start}),
        ThuEnd:   If(varSchedEditThu_End   = "", Blank(), {Value: varSchedEditThu_End}),
        FriStart: If(varSchedEditFri_Start = "", Blank(), {Value: varSchedEditFri_Start}),
        FriEnd:   If(varSchedEditFri_End   = "", Blank(), {Value: varSchedEditFri_End})
    }
);

// Refresh colStaff from SharePoint to pick up the saved values
ClearCollect(colStaff,
    ForAll(
        Filter(Staff, Active = true),
        {
            StaffID: ID, MemberName: Member.DisplayName, MemberEmail: Member.Email,
            Role: Role, Active: Active, AidType: AidType.Value,
            MonStart: MonStart.Value, MonEnd: MonEnd.Value,
            TueStart: TueStart.Value, TueEnd: TueEnd.Value,
            WedStart: WedStart.Value, WedEnd: WedEnd.Value,
            ThuStart: ThuStart.Value, ThuEnd: ThuEnd.Value,
            FriStart: FriStart.Value, FriEnd: FriEnd.Value,
            SchedSortOrder: Coalesce(SchedSortOrder, 10)
        }
    )
);

// Rebuild the lookup table so the grid refreshes immediately
ClearCollect(colSchedLookup,
    ForAll(Sort(colStaff, SchedSortOrder, SortOrder.Ascending) As s,
        ForAll(["Monday","Tuesday","Wednesday","Thursday","Friday"] As d,
            With({
                    startLabel: Switch(d.Value,"Monday",s.MonStart,"Tuesday",s.TueStart,"Wednesday",s.WedStart,"Thursday",s.ThuStart,"Friday",s.FriStart),
                    endLabel:   Switch(d.Value,"Monday",s.MonEnd,  "Tuesday",s.TueEnd,  "Wednesday",s.WedEnd,  "Thursday",s.ThuEnd,  "Friday",s.FriEnd),
                    colorRec: LookUp(colSchedColors, Idx = Mod(s.StaffID, 12))
                },
                {Email: s.MemberEmail, Name: s.MemberName, Day: d.Value,
                 StartSlot: Coalesce(LookUp(colTimeSlots, Label = startLabel).Idx, -1),
                 EndSlot:   Coalesce(LookUp(colTimeSlots, Label = endLabel).Idx,   -1),
                 ColorHex: colorRec.Hex, ColorLight: colorRec.Light, SortOrder: s.SchedSortOrder}
            )
        )
    )
);

// Reset editing state
Set(varSchedSelectedEmail, "");
Reset(drpSchedName);
Set(varSchedEditSaving, false)
```

> **Why `{Value: varSchedEdit...}`?** Choice columns in SharePoint must be written as a record with a `Value` field, not a plain string. `If(... = "", Blank(), {Value: ...})` clears the field when "Off" is selected and sets it correctly when a time is chosen.

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

### Reorder panel background

| Property | Value |
|----------|-------|
| Name | `recSchedReorderPanel` |
| Visible | `=varSchedShowReorder` |
| Fill | `=varColorBgCard` |
| BorderColor | `=varColorBorder`, BorderThickness | `1` |
| X | `=Parent.Width - 220`, Y | `144` |
| Width | `220`, Height | `=Parent.Height - 144` |

### Reorder gallery

| Property | Value |
|----------|-------|
| Name | `galSchedReorder` |
| Visible | `=varSchedShowReorder` |
| Items | `=Sort(colStaff, SchedSortOrder, SortOrder.Ascending)` |
| TemplateSize | `40` |
| X | `=Parent.Width - 218`, Y | `148` |
| Width | `216`, Height | `=Parent.Height - 152` |

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
   // Navigate to self to re-trigger OnVisible (rebuilds colStaff + colSchedLookup cleanly)
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

> **Why `Navigate(scrSchedule, ScreenTransition.None)`?** This re-triggers `OnVisible`, which rebuilds `colStaff` and `colSchedLookup` with the updated sort order. It's the cleanest way to refresh everything without duplicating the load formula.

---

## Testing

### Test 1: Grid displays with no data
- Navigate to the Schedule screen
- The HTML grid should show time labels (8:30 AM – 4:00 PM), day headers, and blank white cells
- No errors in the app checker

### Test 2: Enter a schedule
- Select your name from the dropdown
- Set Monday: 9:00 AM – 1:00 PM
- Set Wednesday: 10:00 AM – 2:00 PM
- Hour counter should show "4 / 12 hrs" (or "4 / 6 hrs" for President's Aid)
- Click **Save Schedule**
- Grid should update with your colored blocks

### Test 3: Re-edit
- Select the same name again
- Dropdowns should pre-fill with your saved times
- Change one day and save — grid should reflect the change

### Test 4: Reorder
- Click **Reorder**
- Press ↑ on a staff member — their column should move left in the grid
- Navigate away and back — order should be preserved

### Test 5: Return to dashboard
- Press **← Dashboard** — returns to `scrDashboard` without errors

---

## Verification Checklist

**App.OnStart:**
- [ ] `colStaff` includes `StaffID`, `AidType`, all 10 time fields, and `SchedSortOrder`
- [ ] `colTimeSlots` has 16 rows, correct labels and minute values
- [ ] `colSchedColors` has 12 color entries
- [ ] All `varSched*` state variables initialized
- [ ] App starts without errors

**scrDashboard:**
- [ ] `btnNavSchedule` navigates to `scrSchedule`

**scrSchedule:**
- [ ] `OnVisible` builds `colSchedLookup` from `colStaff`
- [ ] Header bar has back button + title
- [ ] Selecting a name pre-fills day dropdowns
- [ ] Hour counter updates as times are set
- [ ] HTML grid renders with time labels and day groups
- [ ] Grid cells color correctly after a schedule is saved
- [ ] Save patches `Staff` list and refreshes grid
- [ ] Cancel clears selection without saving
- [ ] Reorder panel Up/Down buttons update column order

---

## Troubleshooting

**Grid is all white after saving**
- Check that `colSchedLookup` is being rebuilt in the save formula. Add a temporary label with `Text: =CountRows(colSchedLookup)` to verify it has rows.

**"Invalid argument type" on the Patch choice field**
- Choice fields must be written as `{Value: "some text"}`, not as plain strings. Double-check that the save formula wraps each time value in `{Value: ...}`.

**Dropdown doesn't pre-fill when selecting a name**
- The `Default` property on each dropdown references `varSchedEditMon_Start` etc. Make sure the `OnChange` of `drpSchedName` runs and sets those variables before the dropdowns render. If needed, add `Reset(drpSchedMonStart)` after each `Set()` in the OnChange formula.

**"Delegation warning" on colStaff load**
- Expected. `Filter(Staff, Active = true)` may show a delegation warning. Since your Staff list has well under 500 rows, this is fine.

**Reorder doesn't persist after navigating away**
- The `Navigate(scrSchedule, ScreenTransition.None)` approach re-runs `OnVisible` which reloads from SharePoint. If the order still doesn't stick, verify that `Patch(Staff, myRow, {SchedSortOrder: ...})` is succeeding — check for errors using `IfError(Patch(...), Notify("Save failed: " & FirstError.Message, NotificationType.Error))`.

---

## Seasonal Maintenance

At the start of each new semester, staff update their own schedule using the app — old values are simply overwritten. No archiving, no list changes needed.

To clear all schedules at once (e.g., start of a new year before staff re-enter their times), use **Edit in grid view** in the `Staff` SharePoint list and bulk-clear the 10 time columns.
