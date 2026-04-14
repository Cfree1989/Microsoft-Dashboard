# StaffSchedule SharePoint List Setup

**Purpose:** Store the semester schedule for all active student workers  
**Time Required:** 15 minutes

> **Complete these first:**
> 1. `SharePoint/Staff-List-AidType-Update.md` — adds `AidType` to the Staff list
> 2. This document — creates the `StaffSchedule` list
> 3. Then: `PowerApps/StaffDashboard-Schedule-Screen.md` — builds the screen in Power Apps

---

## Overview

The `StaffSchedule` list stores each staff member's working hours for the semester. It replaces the fragile HTML/PDF schedule file with live, editable data backed by SharePoint.

**How it works:**
- One row per person per day (maximum 5 rows per person per semester)
- The Power Apps schedule screen reads these rows and renders them as a color-coded weekly grid
- Staff members update their own schedule directly in the app
- Each new semester, old rows stay archived and new rows are written for the current semester

**Key Features:**
- 6 total columns
- Fixed semester schedule (same every week — not week-by-week)
- 30-minute increment time slots, Monday–Friday, 8:30 AM – 4:30 PM
- Column order controlled by `SortOrder` for custom left-to-right arrangement in the grid

---

## Related Documents

- **Staff List update:** `SharePoint/Staff-List-AidType-Update.md`
- **Schedule Screen:** `PowerApps/StaffDashboard-Schedule-Screen.md`

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `StaffSchedule`
6. **Description:** `Semester working hours for all active student workers`
7. Click **Create**

---

## Step 2: Add Columns

After creating the list, add these 6 columns in order. The `Title` column already exists — leave it as-is (it will be used as an auto-generated key).

---

### Column 1: StaffMember (Person)

This links the schedule entry to the actual person.

1. Click **+ Add column** → **Person**
2. **Name:** `StaffMember`
3. **Description:** `The staff member this schedule entry belongs to`
4. **Require that this column contains information:** Yes
5. **Allow multiple selections:** No
6. Click **Save**

---

### Column 2: Semester (Choice)

Controls which semester this entry belongs to. This lets you keep past semesters in the list for reference without them appearing in the current schedule.

1. Click **+ Add column** → **Choice**
2. **Name:** `Semester`
3. **Description:** `Academic semester this schedule applies to`
4. **Choices** (add each on a new line):
   - `Spring 2026`
   - `Fall 2026`
   - `Spring 2027`
   - `Fall 2027`
   - `Spring 2028`
   - `Fall 2028`
5. **Default value:** `Spring 2026`
   > Update this each semester. The Power Apps screen also has a `varSchedSemester` variable you update at the start of each semester.
6. **Require that this column contains information:** Yes
7. Click **Save**

> **Adding future semesters:** When a new semester starts, come back to this column's settings and add the new semester to the choices list. Then update `varSchedSemester` in the Power Apps app.

---

### Column 3: Day (Choice)

The day of the week this entry covers.

1. Click **+ Add column** → **Choice**
2. **Name:** `Day`
3. **Description:** `Day of the week`
4. **Choices** (add each on a new line, in this exact order):
   - `Monday`
   - `Tuesday`
   - `Wednesday`
   - `Thursday`
   - `Friday`
5. **Require that this column contains information:** Yes
6. Click **Save**

---

### Column 4: StartTime (Choice)

The time the person starts work on this day. These are 30-minute increments from opening time (8:30 AM) to one slot before closing (4:00 PM — because the minimum shift is 30 minutes, the latest start is 4:00 for a 4:30 end).

1. Click **+ Add column** → **Choice**
2. **Name:** `StartTime`
3. **Description:** `Shift start time (30-minute increments, 8:30 AM to 4:00 PM)`
4. **Choices** (add each on a new line, in this exact order):
   - `8:30 AM`
   - `9:00 AM`
   - `9:30 AM`
   - `10:00 AM`
   - `10:30 AM`
   - `11:00 AM`
   - `11:30 AM`
   - `12:00 PM`
   - `12:30 PM`
   - `1:00 PM`
   - `1:30 PM`
   - `2:00 PM`
   - `2:30 PM`
   - `3:00 PM`
   - `3:30 PM`
   - `4:00 PM`
5. **Require that this column contains information:** No
   > Not required because a person may not work on a given day. If `StartTime` is blank, the app treats that day as "Off."
6. Click **Save**

> **Why start at 8:30?** The lab opens at 8:30 AM. The earliest a staff member can start is 8:30 AM.  
> **Why end at 4:00?** The lab closes at 4:30 PM. A 4:00 PM start gives a minimum 30-minute shift before closing.

---

### Column 5: EndTime (Choice)

The time the person ends their shift. These are 30-minute increments from the earliest possible end (9:00 AM) to closing (4:30 PM).

1. Click **+ Add column** → **Choice**
2. **Name:** `EndTime`
3. **Description:** `Shift end time (30-minute increments, 9:00 AM to 4:30 PM)`
4. **Choices** (add each on a new line, in this exact order):
   - `9:00 AM`
   - `9:30 AM`
   - `10:00 AM`
   - `10:30 AM`
   - `11:00 AM`
   - `11:30 AM`
   - `12:00 PM`
   - `12:30 PM`
   - `1:00 PM`
   - `1:30 PM`
   - `2:00 PM`
   - `2:30 PM`
   - `3:00 PM`
   - `3:30 PM`
   - `4:00 PM`
   - `4:30 PM`
5. **Require that this column contains information:** No
   > Same as StartTime — blank means "Off" for that day.
6. Click **Save**

---

### Column 6: SortOrder (Number)

Controls the left-to-right order of each person's column in the schedule grid. Lower numbers appear on the left. The app's Up/Down arrows adjust this value when staff reorganize the column order.

1. Click **+ Add column** → **Number**
2. **Name:** `SortOrder`
3. **Description:** `Controls column order in the schedule grid (lower = further left)`
4. **Number of decimal places:** 0
5. **Default value:** `10`
   > Starting at 10 instead of 1 leaves room to insert people between existing positions without renumbering everyone.
6. **Require that this column contains information:** No
7. Click **Save**

> **How reordering works in the app:** When a manager presses the Up or Down arrow next to a person's column, the app decrements or increments their `SortOrder` by 1 and saves back to SharePoint. It then re-sorts the grid. You do not need to manage `SortOrder` manually in SharePoint.

---

## Step 3: Create Views

### View 1: By Person (Default View)

A clean view for manually checking or correcting schedule data.

1. Click **Settings** (gear icon) → **List settings**
2. Scroll down to **Views** → Click **Create view**
3. Select **Standard View**
4. **View Name:** `By Person`
5. **Make this the default view:** Yes
6. **Columns to show:**
   - StaffMember
   - Semester
   - Day
   - StartTime
   - EndTime
   - SortOrder
7. **Sort:**
   - First by: **StaffMember** (Ascending)
   - Then by: **Day** (Ascending)
8. **Filter:** Semester **is equal to** `Spring 2026`
   > Update this filter at the start of each semester so the default view shows current data.
9. Click **OK**

---

### View 2: By Day

Useful for checking coverage — who is working on a specific day.

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `By Day`
4. **Make this the default view:** No
5. **Columns to show:**
   - Day
   - StaffMember
   - StartTime
   - EndTime
   - Semester
6. **Sort:**
   - First by: **Day** (Ascending)
   - Then by: **SortOrder** (Ascending)
7. **Group by:** Day
8. Click **OK**

---

### View 3: All Semesters

For archival reference — shows every row ever written, across all semesters.

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `All Semesters`
4. **Make this the default view:** No
5. **Columns:** Same as By Person
6. **Sort:** StaffMember (Ascending), then Semester (Ascending)
7. **No filter** (shows all rows)
8. Click **OK**

---

## Step 4: Initialize SortOrder for Current Staff

When the schedule screen is first used, the app assigns `SortOrder` values automatically when saving a schedule. However, if you want to pre-set the column order before anyone uses the app, you can do it manually here.

1. In the `StaffSchedule` list, switch to **Edit in grid view**
2. Add a few test rows manually (or wait until the app writes them)
3. Set `SortOrder` values: the person you want leftmost gets `1`, next gets `2`, etc.

> **Tip:** Leave gaps (e.g., 10, 20, 30) instead of sequential numbers (1, 2, 3). This makes it easy to insert someone between two existing positions later.

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | No | — | Auto-generated key (leave as-is) |
| StaffMember | Person | Yes | — | Links entry to a staff member |
| Semester | Choice | Yes | Spring 2026 | Archives entries by semester |
| Day | Choice | Yes | — | Monday – Friday |
| StartTime | Choice | No | — | Shift start (blank = Off that day) |
| EndTime | Choice | No | — | Shift end (blank = Off that day) |
| SortOrder | Number | No | 10 | Left-to-right column order in grid |

---

## How a Full Schedule Looks in This List

Once staff have entered their schedules, the list will look like this (example):

| StaffMember | Semester | Day | StartTime | EndTime | SortOrder |
|-------------|----------|-----|-----------|---------|-----------|
| Jake T. | Spring 2026 | Monday | 9:00 AM | 1:00 PM | 10 |
| Jake T. | Spring 2026 | Wednesday | 10:00 AM | 2:00 PM | 10 |
| Jake T. | Spring 2026 | Friday | 9:00 AM | 12:00 PM | 10 |
| Sara M. | Spring 2026 | Monday | 10:00 AM | 4:30 PM | 20 |
| Sara M. | Spring 2026 | Tuesday | 9:30 AM | 1:30 PM | 20 |
| Sara M. | Spring 2026 | Thursday | 11:00 AM | 3:00 PM | 20 |

Notice:
- No row for a day = "Off" on that day (the app shows a blank/gray cell)
- `SortOrder` is the same for all of a person's rows (Jake = 10, Sara = 20)
- Multiple semesters coexist in the list — the app filters to the active semester

---

## Verification Checklist

- [ ] List created with name `StaffSchedule`
- [ ] `StaffMember` is a Person column (required)
- [ ] `Semester` has all 6 choices, default set to current semester
- [ ] `Day` has exactly 5 choices: Monday, Tuesday, Wednesday, Thursday, Friday
- [ ] `StartTime` has exactly 16 choices (8:30 AM through 4:00 PM)
- [ ] `EndTime` has exactly 16 choices (9:00 AM through 4:30 PM)
- [ ] `SortOrder` is Number type, default 10, not required
- [ ] `By Person` view created as default, filtered to current semester
- [ ] `By Day` view created with Day grouping
- [ ] `All Semesters` view created with no filter

---

## Seasonal Maintenance (Start of Each Semester)

At the beginning of each new semester, do the following:

1. **Add the new semester to the `Semester` choices:**
   - Go to List settings → click `Semester` column → add the new value to the choices list → Save
2. **Update the default filter on the `By Person` view:**
   - Go to List settings → Views → click `By Person` → update the Semester filter to the new semester → OK
3. **Update `varSchedSemester` in Power Apps:**
   - Open the Staff Dashboard app in Power Apps Studio
   - Go to `App.OnStart`
   - Find the line `Set(varSchedSemester, "Spring 2026")`
   - Change the semester string to match the new one
   - Save and Publish the app

> Old semester data is preserved automatically — it's just filtered out of the current view. You can always review past schedules using the `All Semesters` view.

---

## Next Steps

Proceed to build the schedule screen in Power Apps:

**`PowerApps/StaffDashboard-Schedule-Screen.md`**
