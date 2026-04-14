# Schedule Screen — Staff Dashboard Canvas App

**⏱️ Time Required:** 3–4 hours  
**🎯 Goal:** A live color-coded semester schedule showing all active student workers, with inline editing so each person can enter their own hours

> 📚 **This is a screen addition to the existing Staff Dashboard app.** Complete the two SharePoint setup docs before starting here.

---

## Prerequisites

Before starting, confirm all of the following:

- [ ] `Staff` list has the `AidType` column added → `SharePoint/Staff-List-AidType-Update.md`
- [ ] `StaffSchedule` list created with all 6 columns → `SharePoint/StaffSchedule-List-Setup.md`
- [ ] `AidType` populated for all active student workers in the Staff list
- [ ] You can open the Staff Dashboard app in **Power Apps Studio** (go to make.powerapps.com → Apps → open StaffDashboard in Edit mode)
- [ ] The existing app is working (print requests dashboard is functional)

---

## ⚠️ Curly Quotes Warning

When copying formulas from this guide, curly/smart quotes (`"text"`) will cause errors. Power Apps only accepts straight quotes.

**Fix:** After pasting any formula, delete the quotation marks and retype them using `Shift + '` on your keyboard.

---

## Design Standards

This screen uses the same variables already defined in `App.OnStart`. You do not need to redefine them. Key variables you will use:

| Variable | Value | Use |
|----------|-------|-----|
| `varAppFont` | `Font.'Open Sans'` | All text controls |
| `varColorPrimary` | Blue `RGBA(70,130,220,1)` | Primary buttons |
| `varColorHeader` | Dark gray `RGBA(77,77,77,1)` | Header bar |
| `varColorBg` | Light gray `RGBA(248,248,248,1)` | Screen background |
| `varColorBgCard` | Warm cream `RGBA(247,237,223,1)` | Card backgrounds |
| `varColorBorder` | `RGBA(200,200,200,1)` | Borders |
| `varBtnBorderRadius` | `4` | Standard button corners |
| `varRadiusLarge` | `12` | Panel corners |

---

## Overview: How the Schedule Screen Works

Before building, here is a mental model of all the pieces:

```
┌──────────────────────────────────────────────────────┐
│  HEADER BAR  ← Dashboard  │  Spring 2026 Schedule    │
├──────────────────────────────────────────────────────┤
│  EDIT BAR  [Select your name ▼]  (hidden until name  │
│  selected: [Mon 9AM-1PM] [Tue Off] ... [Save] [×])   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  HTML TEXT GRID (read-only colored block schedule)   │
│                                                      │
│  [Time] ║ Mon: JAKE SARA TOM ║ Tue: JAKE SARA ... ║  │
│  8:30   ║  ██   ░░   ░░   ║  ██   ██   ░░   ║      │
│  9:00   ║  ██   ██   ░░   ║  ░░   ██   ██   ║      │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

- The **HTML Text grid** is always visible — it renders the live schedule from SharePoint
- The **Edit Bar** appears when someone picks their name from the dropdown
- **Up/Down reorder arrows** appear next to each person's column header inside the grid (rendered as clickable-looking labels — actual clicks are handled by buttons layered over the HTML control)

---

## Step 1: Add the StaffSchedule Data Connection

The app needs to be connected to the new SharePoint list before you can reference it in formulas.

1. In Power Apps Studio, click **Data** (cylinder icon in the left sidebar)
2. Click **+ Add data**
3. Search for **SharePoint**
4. Select your SharePoint site: `lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
5. Check the box next to **StaffSchedule**
6. Click **Connect**

You should now see `StaffSchedule` appear in your Data panel alongside `PrintRequests`, `Staff`, etc.

---

## Step 2: Update App.OnStart

`App.OnStart` runs once when the app loads. You need to add four things:

1. Include `AidType` and `ID` in the `colStaff` collection
2. Add the `colTimeSlots` helper collection (time slot labels + numeric values)
3. Add the `colSchedColors` color palette collection
4. Add new schedule state variables

### 2A — Update the colStaff load

Find this existing line in `App.OnStart`:

```
ClearCollect(colStaff, ForAll(Filter(Staff, Active = true), {MemberName: Member.DisplayName, MemberEmail: Member.Email, Role: Role, Active: Active})),
```

Replace it with:

```
ClearCollect(colStaff, ForAll(Filter(Staff, Active = true), {StaffID: ID, MemberName: Member.DisplayName, MemberEmail: Member.Email, Role: Role, Active: Active, AidType: AidType.Value})),
```

> **What changed:** Added `StaffID: ID` (the SharePoint item ID — used to assign colors) and `AidType: AidType.Value` (used to calculate max hours in the edit bar).

### 2B — Add the colTimeSlots collection

This is a helper table the schedule formulas use to convert between time labels ("9:00 AM") and slot index numbers (1, 2, 3...). Add this anywhere inside the `Concurrent()` block — or after it:

```
// === SCHEDULE: TIME SLOTS ===
// 16 slots: index 0 = 8:30 AM start, index 15 = 4:00 AM start (4:30 PM end)
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

> **Why Minutes?** Power Apps can't do time math with time values directly. Storing minutes since midnight (510 = 8 hours 30 minutes = 8:30 AM) lets us calculate shift duration with simple subtraction: `(EndMinutes - StartMinutes) / 60 = hours worked`.

### 2C — Add the colSchedColors collection

This defines the 12-color palette used to assign each staff member a unique color. Add this after `colTimeSlots`:

```
// === SCHEDULE: COLOR PALETTE ===
// 12 distinct colors for staff member columns
// Assigned by: StaffID mod 12 = color index
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

> **How colors are assigned:** Each staff member's color = their SharePoint Item ID mod 12. Example: if Jake's Staff list item ID is 7, his color index is `7 mod 12 = 7` → `#FF9DA7`. This is automatic — no manual color assignment needed. Colors stay consistent as long as the item IDs don't change.

### 2D — Add schedule state variables

Find the `// === MODAL CONTROLS ===` section in `App.OnStart` and add these lines alongside the other `Set()` calls:

```
// === SCHEDULE SCREEN STATE ===
Set(varSchedSemester, "Spring 2026");       // Update this at the start of each semester
Set(varSchedSelectedEmail, "");             // Email of the person currently being edited ("" = no one)
Set(varSchedEditMon_Start, "");             // Monday start time selection during editing
Set(varSchedEditMon_End, "");
Set(varSchedEditTue_Start, "");
Set(varSchedEditTue_End, "");
Set(varSchedEditWed_Start, "");
Set(varSchedEditWed_End, "");
Set(varSchedEditThu_Start, "");
Set(varSchedEditThu_End, "");
Set(varSchedEditFri_Start, "");
Set(varSchedEditFri_End, "");
Set(varSchedEditSaving, false);             // True while save is in progress
```

> **varSchedSemester:** This is the most important one to update each semester. Change `"Spring 2026"` to match whatever semester is currently active.

After adding all four sections, click the **Save** icon (or press `Ctrl+S`) to save your changes to `App.OnStart`. Then click the **Run** button (▶) at the top to test that the app still starts without errors.

---

## Step 3: Add the Schedule Nav Button to scrDashboard

Add a button to the existing dashboard header bar so staff can navigate to the schedule screen. The schedule screen doesn't exist yet — you'll create it in the next step — but add the button now so you can wire the navigation.

1. In Power Apps Studio, make sure you're on **scrDashboard**
2. In the header bar area, find `btnNavAnalytics` (the "Report" button, near the top right)
3. Add a new **Button** control near it:
   - Click **Insert** → **Button**
   - Drag it into the header bar area, to the left of `btnNavAnalytics`

4. Set these properties on the new button:

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
| X | *(position it to the left of btnNavAnalytics)* |
| Y | `15` |
| OnSelect | `=Navigate(scrSchedule, varScreenTransition)` |

> The `Navigate(scrSchedule, ...)` formula will show a red error until you create `scrSchedule` in the next step — that's normal.

---

## Step 4: Create the scrSchedule Screen

1. In the left panel, click the **Screens** tab (monitor icon)
2. Click **+ New screen** → **Blank**
3. Rename the new screen:
   - Right-click on "Screen2" (or whatever it was named) in the screens list
   - Select **Rename**
   - Type `scrSchedule`
4. With `scrSchedule` selected, set these screen properties:

| Property | Value |
|----------|-------|
| Fill | `=varColorBg` |
| OnVisible | *(add the formula below)* |

**OnVisible formula:**

```
// Load schedule data for the current semester
ClearCollect(colStaffSchedule,
    Filter(StaffSchedule, Semester.Value = varSchedSemester)
);

// Build a flat lookup table: one row per person per day with slot indices
// This is what the HTML grid formula uses to determine which cells to color
ClearCollect(colSchedLookup,
    ForAll(
        colStaff As s,
        ForAll(
            ["Monday","Tuesday","Wednesday","Thursday","Friday"] As d,
            With(
                {
                    entry: LookUp(
                        colStaffSchedule,
                        StaffMember.Email = s.MemberEmail && Day.Value = d.Value
                    ),
                    colorRec: LookUp(colSchedColors, Idx = Mod(s.StaffID, 12))
                },
                {
                    Email:      s.MemberEmail,
                    Name:       s.MemberName,
                    Day:        d.Value,
                    StartSlot:  If(IsBlank(entry), -1, Coalesce(LookUp(colTimeSlots, Label = entry.StartTime.Value).Idx, -1)),
                    EndSlot:    If(IsBlank(entry), -1, Coalesce(LookUp(colTimeSlots, Label = entry.EndTime.Value).Idx, -1)),
                    ColorHex:   colorRec.Hex,
                    ColorLight: colorRec.Light,
                    SortOrder:  Coalesce(entry.SortOrder, 10)
                }
            )
        )
    )
);

// Reset editing state when screen becomes visible
Set(varSchedSelectedEmail, "")
```

> **What colSchedLookup does:** Instead of running complex nested lookups inside the HTML formula, we pre-compute everything here once. The HTML formula then does a simple `LookUp(colSchedLookup, Email = ... && Day = ...)` to get the start slot, end slot, and color for each cell. This keeps the HTML formula readable and the app fast.

---

## Step 5: Build the Header Bar

The header bar is a thin strip at the top of the screen, identical in style to the dashboard header.

1. On `scrSchedule`, insert a **Rectangle** control:

| Property | Value |
|----------|-------|
| Name | `recSchedHeader` |
| Fill | `=varColorHeader` |
| X | `0` |
| Y | `0` |
| Width | `=Parent.Width` |
| Height | `52` |
| BorderThickness | `0` |

2. Insert a **Button** for the back navigation:

| Property | Value |
|----------|-------|
| Name | `btnSchedBack` |
| Text | `"← Dashboard"` |
| Font | `=varAppFont` |
| Size | `11` |
| Color | `=Color.White` |
| Fill | `=Color.Transparent` |
| HoverFill | `=RGBA(255,255,255,0.1)` |
| PressedFill | `=RGBA(255,255,255,0.2)` |
| BorderThickness | `0` |
| X | `8` |
| Y | `14` |
| Width | `120` |
| Height | `24` |
| OnSelect | `=Navigate(scrDashboard, varScreenTransition)` |

3. Insert a **Label** for the screen title:

| Property | Value |
|----------|-------|
| Name | `lblSchedTitle` |
| Text | `="📅 " & varSchedSemester & " Schedule"` |
| Font | `=varAppFont` |
| Size | `14` |
| FontWeight | `=FontWeight.Semibold` |
| Color | `=Color.White` |
| Align | `=Align.Center` |
| X | `=(Parent.Width - 300) / 2` |
| Y | `13` |
| Width | `300` |
| Height | `26` |

---

## Step 6: Build the Edit Bar

The Edit Bar is a panel just below the header that lets a staff member identify themselves and enter their schedule. It is always visible but its content changes based on whether someone is selected.

### 6A — Edit Bar background rectangle

| Property | Value |
|----------|-------|
| Name | `recSchedEditBar` |
| Fill | `=varColorBgCard` |
| BorderColor | `=varColorBorder` |
| BorderThickness | `1` |
| X | `0` |
| Y | `52` |
| Width | `=Parent.Width` |
| Height | `90` |

### 6B — "Who are you?" label

| Property | Value |
|----------|-------|
| Name | `lblSchedWho` |
| Text | `"Who are you?"` |
| Font | `=varAppFont` |
| Size | `11` |
| Color | `=varColorTextMuted` |
| X | `16` |
| Y | `66` |
| Width | `100` |
| Height | `20` |

### 6C — Name dropdown

| Property | Value |
|----------|-------|
| Name | `drpSchedName` |
| Items | `=Sort(colStaff, MemberName, SortOrder.Ascending)` |
| Value | `MemberName` |
| Font | `=varAppFont` |
| Size | `=varInputFontSize` |
| BorderColor | `=varInputBorderColor` |
| BorderThickness | `=varInputBorderThickness` |
| SelectionFill | `=varDropdownSelectionFill` |
| HoverFill | `=varDropdownHoverFill` |
| X | `16` |
| Y | `88` |
| Width | `180` |
| Height | `32` |
| OnChange | *(add formula below)* |

**OnChange formula for drpSchedName:**

```
// When a name is selected, set the selected email and pre-fill their existing schedule
If(
    IsBlank(drpSchedName.Selected) || drpSchedName.Selected.MemberName = "Select...",

    // No selection — clear editing state
    Set(varSchedSelectedEmail, ""),

    // Load their existing schedule into the edit variables
    With(
        {
            mon: LookUp(colStaffSchedule, StaffMember.Email = drpSchedName.Selected.MemberEmail && Day.Value = "Monday"),
            tue: LookUp(colStaffSchedule, StaffMember.Email = drpSchedName.Selected.MemberEmail && Day.Value = "Tuesday"),
            wed: LookUp(colStaffSchedule, StaffMember.Email = drpSchedName.Selected.MemberEmail && Day.Value = "Wednesday"),
            thu: LookUp(colStaffSchedule, StaffMember.Email = drpSchedName.Selected.MemberEmail && Day.Value = "Thursday"),
            fri: LookUp(colStaffSchedule, StaffMember.Email = drpSchedName.Selected.MemberEmail && Day.Value = "Friday")
        },
        Set(varSchedSelectedEmail, drpSchedName.Selected.MemberEmail);
        Set(varSchedEditMon_Start, Coalesce(mon.StartTime.Value, ""));
        Set(varSchedEditMon_End,   Coalesce(mon.EndTime.Value, ""));
        Set(varSchedEditTue_Start, Coalesce(tue.StartTime.Value, ""));
        Set(varSchedEditTue_End,   Coalesce(tue.EndTime.Value, ""));
        Set(varSchedEditWed_Start, Coalesce(wed.StartTime.Value, ""));
        Set(varSchedEditWed_End,   Coalesce(wed.EndTime.Value, ""));
        Set(varSchedEditThu_Start, Coalesce(thu.StartTime.Value, ""));
        Set(varSchedEditThu_End,   Coalesce(thu.EndTime.Value, ""));
        Set(varSchedEditFri_Start, Coalesce(fri.StartTime.Value, ""));
        Set(varSchedEditFri_End,   Coalesce(fri.EndTime.Value, ""))
    )
)
```

### 6D — Aid type + hours display (visible only when selected)

When a name is chosen, show their aid type and how many hours they've used vs. their maximum.

Insert a **Label**:

| Property | Value |
|----------|-------|
| Name | `lblSchedAidInfo` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Text | *(formula below)* |
| Font | `=varAppFont` |
| Size | `10` |
| X | `208` |
| Y | `88` |
| Width | `200` |
| Height | `32` |

**Text formula:**

```
=With(
    {
        aidType: drpSchedName.Selected.AidType,
        maxHrs:  If(drpSchedName.Selected.AidType = "Work Study", 12, 6),
        usedMins: Sum(
            Filter(
                colTimeSlots,
                Or(
                    And(varSchedEditMon_Start <> "", varSchedEditMon_End <> "", Idx >= LookUp(colTimeSlots, Label = varSchedEditMon_Start).Idx, Idx < LookUp(colTimeSlots, Label = varSchedEditMon_End).Idx),
                    And(varSchedEditTue_Start <> "", varSchedEditTue_End <> "", Idx >= LookUp(colTimeSlots, Label = varSchedEditTue_Start).Idx, Idx < LookUp(colTimeSlots, Label = varSchedEditTue_End).Idx),
                    And(varSchedEditWed_Start <> "", varSchedEditWed_End <> "", Idx >= LookUp(colTimeSlots, Label = varSchedEditWed_Start).Idx, Idx < LookUp(colTimeSlots, Label = varSchedEditWed_End).Idx),
                    And(varSchedEditThu_Start <> "", varSchedEditThu_End <> "", Idx >= LookUp(colTimeSlots, Label = varSchedEditThu_Start).Idx, Idx < LookUp(colTimeSlots, Label = varSchedEditThu_End).Idx),
                    And(varSchedEditFri_Start <> "", varSchedEditFri_End <> "", Idx >= LookUp(colTimeSlots, Label = varSchedEditFri_Start).Idx, Idx < LookUp(colTimeSlots, Label = varSchedEditFri_End).Idx)
                )
            ),
            30
        )
    },
    aidType & " · " & Text(usedMins / 60, "0.#") & " / " & Text(maxHrs, "0") & " hrs"
)
```

> **How the hour counter works:** For each day, if both a start and end time are chosen, count the number of 30-minute slots between them. Multiply by 30 to get minutes. Sum across all 5 days. Divide by 60 to get hours. Display as "Work Study · 8 / 12 hrs".

> **Warning color:** To add a red warning when over the limit, set the `Color` property of `lblSchedAidInfo` to:
> ```
> =With({maxHrs: If(drpSchedName.Selected.AidType = "Work Study", 12, 6), usedHrs: /* same usedMins calc */ / 60}, If(usedHrs > maxHrs, varColorDanger, varColorText))
> ```

### 6E — Per-day dropdowns (visible only when selected)

For each of the 5 days, add two Dropdown controls: one for start time, one for end time. These appear in a row across the edit bar when a name is selected.

Below are the settings for **Monday**. Repeat the pattern for Tuesday through Friday, changing the variable names and X positions.

**Monday Start Time dropdown:**

| Property | Value |
|----------|-------|
| Name | `drpSchedMonStart` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Items | `=["Off","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"]` |
| Default | `=If(varSchedEditMon_Start = "", "Off", varSchedEditMon_Start)` |
| Font | `=varAppFont` |
| Size | `9` |
| X | `420` |
| Y | `58` |
| Width | `88` |
| Height | `28` |
| OnChange | `=Set(varSchedEditMon_Start, If(drpSchedMonStart.Selected.Value = "Off", "", drpSchedMonStart.Selected.Value))` |

**Monday End Time dropdown:**

| Property | Value |
|----------|-------|
| Name | `drpSchedMonEnd` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Items | `=["Off","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"]` |
| Default | `=If(varSchedEditMon_End = "", "Off", varSchedEditMon_End)` |
| Font | `=varAppFont` |
| Size | `9` |
| X | `420` |
| Y | `90` |
| Width | `88` |
| Height | `28` |
| OnChange | `=Set(varSchedEditMon_End, If(drpSchedMonEnd.Selected.Value = "Off", "", drpSchedMonEnd.Selected.Value))` |

**Add a "Mon" label above each pair:**

| Property | Value |
|----------|-------|
| Name | `lblSchedMonHeader` |
| Text | `"Mon"` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Font | `=varAppFont` |
| Size | `9` |
| FontWeight | `=FontWeight.Semibold` |
| Align | `=Align.Center` |
| X | `420` |
| Y | `44` |
| Width | `88` |
| Height | `16` |

**Repeat for Tuesday–Friday** with these X positions (88px per day + 4px gap):

| Day | X Position | Start Var | End Var |
|-----|-----------|-----------|---------|
| Monday | `420` | `varSchedEditMon_Start` | `varSchedEditMon_End` |
| Tuesday | `512` | `varSchedEditTue_Start` | `varSchedEditTue_End` |
| Wednesday | `604` | `varSchedEditWed_Start` | `varSchedEditWed_End` |
| Thursday | `696` | `varSchedEditThu_Start` | `varSchedEditThu_End` |
| Friday | `788` | `varSchedEditFri_Start` | `varSchedEditFri_End` |

### 6F — Save button

| Property | Value |
|----------|-------|
| Name | `btnSchedSave` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Text | `=If(varSchedEditSaving, "Saving...", "Save Schedule")` |
| Font | `=varAppFont` |
| Size | `11` |
| Color | `=Color.White` |
| Fill | `=varColorSuccess` |
| HoverFill | `=varColorSuccessHover` |
| BorderThickness | `0` |
| RadiusTopLeft | `=varBtnBorderRadius` |
| RadiusTopRight | `=varBtnBorderRadius` |
| RadiusBottomLeft | `=varBtnBorderRadius` |
| RadiusBottomRight | `=varBtnBorderRadius` |
| X | `890` |
| Y | `68` |
| Width | `130` |
| Height | `36` |
| DisplayMode | `=If(varSchedEditSaving, DisplayMode.Disabled, DisplayMode.Edit)` |
| OnSelect | *(add in Step 10)* |

### 6G — Clear/Cancel button

| Property | Value |
|----------|-------|
| Name | `btnSchedClear` |
| Visible | `=varSchedSelectedEmail <> ""` |
| Text | `"✕ Cancel"` |
| Font | `=varAppFont` |
| Size | `11` |
| Color | `=varColorText` |
| Fill | `=RGBA(0,0,0,0)` |
| BorderColor | `=varColorBorder` |
| BorderThickness | `1` |
| X | `1032` |
| Y | `68` |
| Width | `80` |
| Height | `36` |
| OnSelect | `=Set(varSchedSelectedEmail, ""); Reset(drpSchedName)` |

---

## Step 7: Build the HTML Text Grid Control

This is the main visual of the screen — a color-coded grid rendered as HTML. The `HTML Text` control in Power Apps can render arbitrary HTML and CSS, which gives us a pixel-accurate replication of the existing HTML schedule app's grid.

### 7A — Add the HTML Text control

1. Click **Insert** → search for **HTML Text** (it's under "Text")
2. Place it below the edit bar:

| Property | Value |
|----------|-------|
| Name | `htmlSchedGrid` |
| X | `0` |
| Y | `144` |
| Width | `=Parent.Width` |
| Height | `=Parent.Height - 144` |
| PaddingLeft | `0` |
| PaddingTop | `0` |
| HtmlText | *(add the formula in Step 8)* |

> **Important:** The HTML Text control is read-only. Users cannot click inside it to interact with the schedule. All editing is handled by the Edit Bar controls above.

---

## Step 8: The HTML Grid Formula

This formula builds the entire schedule grid as an HTML string. It combines:
- CSS styles (colors, borders, font)
- A table header (time gutter + day group headers + staff column headers)
- 16 time slot rows with colored cells per staff member per day
- A totals row at the bottom

The formula is long but built from repeating parts. Read through it in sections before pasting.

**Paste this entire formula into the `HtmlText` property of `htmlSchedGrid`:**

```
=With(
    {
        // Sorted list of unique staff members (by SortOrder from their Monday entry — consistent across days)
        sortedStaff: Sort(
            GroupBy(Filter(colSchedLookup, Day = "Monday"), "Email", "rows"),
            First(rows).SortOrder,
            SortOrder.Ascending
        ),
        days: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        slotH: 28,
        colW:  64,
        gutterW: 52,
        headerH: 28
    },

    // ---- CSS ----
    "<style>
    .sg { border-collapse:collapse; font-family:'Segoe UI',Arial,sans-serif; font-size:11px; }
    .sg td, .sg th { padding:0; margin:0; }
    .sg .tg { width:" & Text(gutterW) & "px; text-align:right; padding-right:6px; color:#666; font-size:10px; height:" & Text(slotH) & "px; vertical-align:middle; background:#f8f8f8; border-right:1px solid #ddd; }
    .sg .dh { font-weight:700; text-align:center; background:#4d4d4d; color:#fff; height:" & Text(headerH) & "px; font-size:11px; border-right:2px solid #999; }
    .sg .sh { text-align:center; height:" & Text(headerH) & "px; font-weight:600; font-size:10px; border-right:1px solid #ccc; border-bottom:1px solid #aaa; overflow:hidden; }
    .sg .sc { width:" & Text(colW) & "px; height:" & Text(slotH) & "px; border-right:1px solid #e0e0e0; border-bottom:1px solid #e8e8e8; }
    .sg .sc.on { border-right:1px solid rgba(0,0,0,0.1); }
    .sg .day-sep { border-right:2px solid #999 !important; }
    .sg .tot { text-align:center; font-size:10px; font-weight:600; height:24px; vertical-align:middle; border-top:2px solid #aaa; border-right:1px solid #ccc; }
    .sg .tot-gutter { background:#f8f8f8; border-top:2px solid #aaa; border-right:1px solid #ddd; }
    </style>" &

    // ---- TABLE START ----
    "<table class='sg'>" &

    // ---- ROW 1: Day group headers ----
    "<tr>" &
    "<th class='tg' rowspan='2'></th>" &  // Top-left corner spans 2 header rows
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        "<th class='dh" & If(dayName.Value = "Friday", "", " day-sep") & "' colspan='" &
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
                {colorRec: LookUp(colSchedLookup, Email = s.Email && Day = dayName.Value)},
                "<th class='sh" & If(dayName.Value = "Friday" && s.Email = Last(sortedStaff).Email, "", If(s.Email = Last(sortedStaff).Email, " day-sep", "")) & "' style='background:" & Coalesce(colorRec.ColorLight, "#eee") & ";width:" & Text(colW) & "px'>" &
                // First name only (truncated to ~8 chars for column width)
                Left(First(Split(s.Email, "@")).Result, 8) &
                "</th>"
            )
        )
    ) &
    "</tr>" &

    // ---- ROWS 3–18: Time slot rows ----
    Concat(
        colTimeSlots As slot,
        "<tr>" &
        // Left time gutter label
        "<td class='tg'>" & slot.Label & "</td>" &
        // 5 day groups × N staff columns
        Concat(
            ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
            Concat(
                sortedStaff As s,
                With(
                    {lookup: LookUp(colSchedLookup, Email = s.Email && Day = dayName.Value)},
                    "<td class='sc" &
                    // "on" class if this slot is within this person's shift
                    If(
                        !IsBlank(lookup) && lookup.StartSlot >= 0 && slot.Idx >= lookup.StartSlot && slot.Idx < lookup.EndSlot,
                        " on",
                        ""
                    ) &
                    // Day separator on last column of each day group
                    If(dayName.Value = "Friday" && s.Email = Last(sortedStaff).Email, "", If(s.Email = Last(sortedStaff).Email, " day-sep", "")) &
                    // Background color: use the person's color if working, white if not
                    "' style='background:" &
                    If(
                        !IsBlank(lookup) && lookup.StartSlot >= 0 && slot.Idx >= lookup.StartSlot && slot.Idx < lookup.EndSlot,
                        lookup.ColorHex,
                        "#ffffff"
                    ) &
                    "'></td>"
                )
            )
        ) &
        "</tr>"
    ) &

    // ---- TOTALS ROW ----
    "<tr>" &
    "<td class='tg tot-gutter'></td>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        Concat(
            sortedStaff As s,
            With(
                {
                    lookup: LookUp(colSchedLookup, Email = s.Email && Day = dayName.Value),
                    staffRec: LookUp(colStaff, MemberEmail = s.Email)
                },
                "<td class='tot" & If(s.Email = Last(sortedStaff).Email, " day-sep", "") & "' style='background:" & Coalesce(LookUp(colSchedLookup, Email = s.Email && Day = dayName.Value).ColorLight, "#f0f0f0") & "'>" &
                If(
                    !IsBlank(lookup) && lookup.StartSlot >= 0,
                    Text((lookup.EndSlot - lookup.StartSlot) / 2, "0.#") & "h",
                    "—"
                ) &
                "</td>"
            )
        )
    ) &
    "</tr>" &

    // ---- WEEKLY HOURS ROW ----
    "<tr>" &
    "<td class='tg' style='font-weight:700;font-size:9px;'>Wk Hrs</td>" &
    Concat(
        ["Monday","Tuesday","Wednesday","Thursday","Friday"] As dayName,
        Concat(
            sortedStaff As s,
            With(
                {
                    staffRec: LookUp(colStaff, MemberEmail = s.Email),
                    totalSlots: Sum(
                        Filter(colSchedLookup, Email = s.Email, StartSlot >= 0),
                        EndSlot - StartSlot
                    ),
                    maxHrs: If(LookUp(colStaff, MemberEmail = s.Email).AidType = "Work Study", 12, 6)
                },
                // Only show weekly total once — in the Monday column
                "<td class='tot" & If(s.Email = Last(sortedStaff).Email, " day-sep", "") & "' style='background:" & Coalesce(LookUp(colSchedLookup, Email = s.Email && Day = "Monday").ColorLight, "#f0f0f0") & ";font-size:9px;'>" &
                If(
                    dayName.Value = "Monday",
                    Text(totalSlots / 2, "0.#") & "/" & Text(maxHrs, "0"),
                    ""
                ) &
                "</td>"
            )
        )
    ) &
    "</tr>" &

    "</table>"
)
```

> **If the formula looks overwhelming:** Read it in sections — CSS block, then header rows, then the slot rows loop, then totals. Each `Concat()` call just repeats a pattern for each item in a list. The `LookUp(colSchedLookup, ...)` is the key — it checks whether a given person is scheduled during a given slot on a given day, and if so, paints the cell with their color.

> **Column widths:** The `colW: 64` value sets each staff column to 64px wide. If you have many staff and the grid is wider than the screen, reduce this to `48` or `56`.

---

## Step 9: Reorder Buttons (Up/Down Arrows)

Staff can reorder columns by pressing Up/Down buttons. Since the HTML Text control is read-only, the arrows are **separate Button controls** that float over the grid area, positioned over each staff column header.

Because the number of staff members can vary, the simplest approach is a **reorder panel** that slides in from the side, showing a list of staff members with arrow buttons.

### 9A — Add the Reorder Panel toggle button

| Property | Value |
|----------|-------|
| Name | `btnSchedReorderToggle` |
| Text | `"⇅ Reorder"` |
| Font | `=varAppFont` |
| Size | `10` |
| Color | `=Color.White` |
| Fill | `=varColorNeutral` |
| BorderThickness | `0` |
| RadiusTopLeft | `=varBtnBorderRadius` |
| RadiusTopRight | `=varBtnBorderRadius` |
| RadiusBottomLeft | `=varBtnBorderRadius` |
| RadiusBottomRight | `=varBtnBorderRadius` |
| X | `1150` |
| Y | `68` |
| Width | `90` |
| Height | `36` |
| OnSelect | `=Set(varSchedShowReorder, !varSchedShowReorder)` |

Add `Set(varSchedShowReorder, false)` to your `App.OnStart` alongside the other schedule state variables.

### 9B — Reorder Panel background

| Property | Value |
|----------|-------|
| Name | `recSchedReorderPanel` |
| Visible | `=varSchedShowReorder` |
| Fill | `=varColorBgCard` |
| BorderColor | `=varColorBorder` |
| BorderThickness | `1` |
| X | `=Parent.Width - 220` |
| Y | `144` |
| Width | `220` |
| Height | `=Parent.Height - 144` |

### 9C — Reorder list gallery

| Property | Value |
|----------|-------|
| Name | `galSchedReorder` |
| Visible | `=varSchedShowReorder` |
| Items | `=Sort(colStaff, LookUp(colSchedLookup, Email = MemberEmail && Day = "Monday").SortOrder, SortOrder.Ascending)` |
| TemplateSize | `40` |
| X | `=Parent.Width - 218` |
| Y | `148` |
| Width | `216` |
| Height | `=Parent.Height - 152` |

**Inside the gallery template, add:**

1. A **Label** for the staff name:
   - `Text`: `=ThisItem.MemberName`
   - `Font`: `=varAppFont`, `Size`: `11`
   - `X`: `8`, `Y`: `10`, `Width`: `130`, `Height`: `20`

2. A **Button** for Up (↑):
   - `Name`: `btnReorderUp`
   - `Text`: `"↑"`
   - `X`: `148`, `Y`: `8`, `Width`: `28`, `Height`: `24`
   - `OnSelect`:
     ```
     // Find this person's current Monday entry to get their SortOrder
     With(
         {
             curEntry: LookUp(colStaffSchedule, StaffMember.Email = ThisItem.MemberEmail && Day.Value = "Monday"),
             prevEntry: LookUp(
                 Sort(colStaffSchedule, SortOrder, SortOrder.Ascending),
                 SortOrder < LookUp(colStaffSchedule, StaffMember.Email = ThisItem.MemberEmail && Day.Value = "Monday").SortOrder && Day.Value = "Monday"
             )
         },
         If(!IsBlank(curEntry) && !IsBlank(prevEntry),
             // Swap SortOrder values between current and previous
             Patch(StaffSchedule, curEntry, {SortOrder: prevEntry.SortOrder});
             Patch(StaffSchedule, prevEntry, {SortOrder: curEntry.SortOrder});
             // Refresh the local collection
             ClearCollect(colStaffSchedule, Filter(StaffSchedule, Semester.Value = varSchedSemester));
             // Rebuild the lookup table
             ClearCollect(colSchedLookup, /* same formula as OnVisible — see note below */)
         )
     )
     ```

   > **Note on refreshing:** After saving reorder changes, re-run the same `ClearCollect(colSchedLookup, ...)` formula from Step 4's `OnVisible`. Because the formula is long, the easiest approach in Power Apps is to create a named formula or to navigate away and back to refresh `OnVisible`. Alternatively, call `Navigate(scrSchedule, ScreenTransition.None)` from the Up/Down `OnSelect` — this triggers `OnVisible` which rebuilds everything fresh.

3. A **Button** for Down (↓): Same as Up button but with `SortOrder` swap logic reversed (swap with the next entry instead of the previous).

---

## Step 10: Save Logic

Wire the `btnSchedSave` button's `OnSelect` property with this formula. It:
1. Sets a "saving" flag to disable the button and show "Saving..."
2. Deletes any existing schedule rows for this person + semester
3. Writes a fresh row for each day that has a start and end time
4. Refreshes the screen data

```
// Start saving
Set(varSchedEditSaving, true);

// Step 1: Remove existing schedule entries for this person + semester
RemoveIf(
    StaffSchedule,
    StaffMember.Email = varSchedSelectedEmail && Semester.Value = varSchedSemester
);

// Step 2: Build the person record for the StaffMember field
With(
    {
        staffRec: LookUp(colStaff, MemberEmail = varSchedSelectedEmail),
        personField: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & varSchedSelectedEmail,
            Discipline: "",
            DisplayName: LookUp(colStaff, MemberEmail = varSchedSelectedEmail).MemberName,
            Email: varSchedSelectedEmail,
            JobTitle: "",
            Picture: ""
        },
        // Get or initialize SortOrder for this person
        // Use their existing SortOrder if any rows existed, or assign based on staff count
        existingSortOrder: Coalesce(
            First(Filter(colSchedLookup, Email = varSchedSelectedEmail)).SortOrder,
            CountRows(colStaff) * 10
        )
    },

    // Step 3: Patch a row for each day that has a shift assigned
    If(varSchedEditMon_Start <> "" && varSchedEditMon_End <> "",
        Patch(StaffSchedule, Defaults(StaffSchedule), {
            Title: varSchedSelectedEmail & "-Mon-" & varSchedSemester,
            StaffMember: personField,
            Semester: {Value: varSchedSemester},
            Day: {Value: "Monday"},
            StartTime: {Value: varSchedEditMon_Start},
            EndTime: {Value: varSchedEditMon_End},
            SortOrder: existingSortOrder
        })
    );
    If(varSchedEditTue_Start <> "" && varSchedEditTue_End <> "",
        Patch(StaffSchedule, Defaults(StaffSchedule), {
            Title: varSchedSelectedEmail & "-Tue-" & varSchedSemester,
            StaffMember: personField,
            Semester: {Value: varSchedSemester},
            Day: {Value: "Tuesday"},
            StartTime: {Value: varSchedEditTue_Start},
            EndTime: {Value: varSchedEditTue_End},
            SortOrder: existingSortOrder
        })
    );
    If(varSchedEditWed_Start <> "" && varSchedEditWed_End <> "",
        Patch(StaffSchedule, Defaults(StaffSchedule), {
            Title: varSchedSelectedEmail & "-Wed-" & varSchedSemester,
            StaffMember: personField,
            Semester: {Value: varSchedSemester},
            Day: {Value: "Wednesday"},
            StartTime: {Value: varSchedEditWed_Start},
            EndTime: {Value: varSchedEditWed_End},
            SortOrder: existingSortOrder
        })
    );
    If(varSchedEditThu_Start <> "" && varSchedEditThu_End <> "",
        Patch(StaffSchedule, Defaults(StaffSchedule), {
            Title: varSchedSelectedEmail & "-Thu-" & varSchedSemester,
            StaffMember: personField,
            Semester: {Value: varSchedSemester},
            Day: {Value: "Thursday"},
            StartTime: {Value: varSchedEditThu_Start},
            EndTime: {Value: varSchedEditThu_End},
            SortOrder: existingSortOrder
        })
    );
    If(varSchedEditFri_Start <> "" && varSchedEditFri_End <> "",
        Patch(StaffSchedule, Defaults(StaffSchedule), {
            Title: varSchedSelectedEmail & "-Fri-" & varSchedSemester,
            StaffMember: personField,
            Semester: {Value: varSchedSemester},
            Day: {Value: "Friday"},
            StartTime: {Value: varSchedEditFri_Start},
            EndTime: {Value: varSchedEditFri_End},
            SortOrder: existingSortOrder
        })
    )
);

// Step 4: Refresh data and reset editing state
ClearCollect(colStaffSchedule,
    Filter(StaffSchedule, Semester.Value = varSchedSemester)
);
// Rebuild lookup table — paste the same formula from scrSchedule.OnVisible here
ClearCollect(colSchedLookup, /* same ForAll formula as in OnVisible */);

Set(varSchedSelectedEmail, "");
Reset(drpSchedName);
Set(varSchedEditSaving, false)
```

> **The `personField` object:** SharePoint Person fields require a specific structure when writing from Power Apps. The `'@odata.type'` and `Claims` fields are required — without them, `Patch()` will fail with an error about the person field. This pattern matches how other person fields are written in the existing app (see `varActor` in `scrDashboard.OnVisible`).

> **Duplicate check:** The `RemoveIf` at the start ensures there are never two rows for the same person + day + semester. This is safer than checking and updating because `Patch` on a blank `Defaults(StaffSchedule)` always creates a new row.

---

## Testing the Screen

After completing all steps, test the following scenarios:

### Test 1: Grid displays correctly with no data
1. Navigate to the Schedule screen
2. The HTML grid should show the correct time labels (8:30 AM – 4:00 PM) and day headers
3. All cells should be white (no schedule entered yet)
4. No errors should appear in the app checker

### Test 2: Entering a schedule
1. Select your name from the dropdown
2. Set Monday: 9:00 AM – 1:00 PM
3. Set Wednesday: 10:00 AM – 2:00 PM
4. Confirm the hour counter shows "4 / 12 hrs" (or "4 / 6 hrs" for President's Aid)
5. Click **Save Schedule**
6. The edit bar should clear and the grid should update showing your color blocks on Monday and Wednesday

### Test 3: Re-editing a saved schedule
1. Select the same name again
2. Confirm the dropdowns pre-fill with your saved times (9:00 AM / 1:00 PM for Monday, etc.)
3. Change one day and save again
4. Confirm the grid reflects the change

### Test 4: Reorder panel
1. Click **Reorder**
2. Confirm the panel slides in with all active staff listed
3. Press the ↑ button on a staff member — confirm their column moves left in the grid
4. Navigate away and back — confirm the new order is preserved

### Test 5: Return to Dashboard
1. Press **← Dashboard** in the header
2. Confirm you return to `scrDashboard` without errors

---

## Verification Checklist

**App.OnStart:**
- [ ] `colStaff` now includes `StaffID` and `AidType` fields
- [ ] `colTimeSlots` created with 16 rows, correct `Label` and `Minutes` values
- [ ] `colSchedColors` created with 12 color entries
- [ ] All `varSched*` state variables initialized
- [ ] App starts without errors after changes

**scrDashboard:**
- [ ] `btnNavSchedule` added to header bar
- [ ] Button navigates to `scrSchedule`

**scrSchedule:**
- [ ] Screen created, named `scrSchedule`
- [ ] `OnVisible` loads `colStaffSchedule` and builds `colSchedLookup`
- [ ] Header bar has back button and title showing `varSchedSemester`
- [ ] Edit bar is visible; dropdown shows active staff names
- [ ] Selecting a name pre-fills day dropdowns with existing data
- [ ] Hour counter updates as day times are selected
- [ ] HTML Text grid renders with correct time labels
- [ ] Grid cells show person colors after schedule is saved
- [ ] Save button writes to SharePoint and refreshes grid
- [ ] Cancel button clears selection without saving
- [ ] Reorder panel appears and Up/Down buttons affect column order
- [ ] Screen is published and accessible from the lab computer

---

## Troubleshooting

**"The formula contains an error" on the HTML Text control**
- The formula is very long — Power Apps may time out building it in the formula bar. Try saving the app and reopening it. If the error persists, check for any curly quotes introduced when pasting.

**Grid shows but cells are all white after saving**
- Check that `colSchedLookup` is being rebuilt after the save. Add `Set(varDebugLookupCount, CountRows(colSchedLookup))` and inspect the value — if it's 0, `OnVisible` didn't run or the `ForAll` formula has an error.

**Person field error when saving ("Invalid person field value")**
- The `personField` object in the save formula needs exact formatting. Double-check the `Claims` value format: `"i:0#.f|membership|" & email`. If the email is uppercase, the `Lower()` function might be needed: `Lower(varSchedSelectedEmail)`.

**"Delegation warning" yellow squiggly on the Filter in OnVisible**
- This is expected — `Filter(StaffSchedule, Semester.Value = varSchedSemester)` may show a delegation warning because it's filtering on a Choice field. The warning means the filter runs client-side after loading the first 500 rows. As long as your `StaffSchedule` list has fewer than 500 rows (it will, since you have at most 5 rows × ~15 staff = 75 rows), this is fine.

**Reorder buttons don't update the grid**
- After patching `SortOrder`, the quickest fix is `Navigate(scrSchedule, ScreenTransition.None)` which re-triggers `OnVisible` and fully refreshes the data and grid. Add this at the end of the Up/Down `OnSelect` formulas.

---

## Seasonal Maintenance Reminder

At the start of each new semester:

1. In `App.OnStart`, update `Set(varSchedSemester, "Spring 2026")` to the new semester string
2. Add the new semester to the `Semester` choices in the `StaffSchedule` SharePoint list
3. Update the default filter on the `By Person` SharePoint view
4. Publish the updated app
5. Staff will enter their new semester schedules — old ones are automatically archived
