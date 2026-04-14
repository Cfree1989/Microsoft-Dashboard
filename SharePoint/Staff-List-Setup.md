# Staff SharePoint List Setup

**Purpose:** Team member management, role assignment, financial aid type, and semester schedule  
**Time Required:** 45 minutes

---

## Overview

The Staff list manages team member information and role assignments. Power Apps staff console checks this list to determine if a user has staff access, enforces weekly hour limits based on financial aid type, and drives the schedule grid.

**Key Features:**
- 26 total fields — one row per person, no separate schedule list needed
- Person field integration with LSU accounts
- Role designation (Manager, Technician, Student Worker)
- Active/inactive status management
- Financial aid type for automatic weekly hour limit enforcement
- Per-person Monday–Friday schedule with support for **two shifts per day**

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `Staff`
6. **Description:** `Team member management and role assignment`
7. Click **Create**

---

## Step 2: Add Columns

### Column 1: Member (Person)

1. Click **+ Add column** → **Person**
2. **Name:** `Member`
3. **Description:** `Staff member's LSU account`
4. **Require that this column contains information:** Yes
5. **Allow multiple selections:** No
6. Click **Save**

### Column 2: Role (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Role`
3. **Description:** `Staff member's role`
4. **Choices:**
   - Manager
   - Technician
   - Student Worker
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 3: Active (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `Active`
3. **Description:** `Employment status`
4. **Default value:** Yes
5. Click **Save**

### Column 4: AidType (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `AidType`
3. **Description:** `Financial aid type — determines maximum weekly hours`
4. **Choices:**
   - `President's Aid`
   - `Work Study`
   - `Graduate Assistant`
5. **Default value:** Leave blank
6. **Require that this column contains information:** No
7. Click **Save**

The app uses `AidType` to enforce weekly hour limits:

| Aid Type | Abbrev | Max Hours/Week | Fund (Annual) |
|----------|--------|----------------|---------------|
| President's Aid | PA | 6 hrs | $1,550 |
| Work Study | WS | 12 hrs | $3,000 |
| Graduate Assistant | GA | 20 hrs | — |

> **How WS/PA limits are calculated:** Annual fund ÷ 2 semesters ÷ 14 weeks ÷ $10/hr = max weekly hours. The app enforces this automatically.

### Columns 5–9: Shift 1 Start Time Columns (Mon–Fri)

Each day needs a **first shift start** column. Choices are 30-minute increments from when the lab opens (8:30 AM) to the latest possible start for a 30-minute shift (4:00 PM).

| Column Name | Description |
|-------------|-------------|
| `MonStart` | Monday shift 1 start time |
| `TueStart` | Tuesday shift 1 start time |
| `WedStart` | Wednesday shift 1 start time |
| `ThuStart` | Thursday shift 1 start time |
| `FriStart` | Friday shift 1 start time |

For each:

1. Click **+ Add column** → **Choice**
2. **Name:** *(see table above)*
3. **Description:** *(day) shift 1 start time*
4. **Choices** (in this exact order):
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
5. **Default value:** Leave blank *(blank = not working that day)*
6. **Require that this column contains information:** No
7. Click **Save**

> **Tip:** After saving `MonStart`, copy-paste the choices when creating the remaining 4 columns.

### Columns 10–14: Shift 1 End Time Columns (Mon–Fri)

| Column Name | Description |
|-------------|-------------|
| `MonEnd` | Monday shift 1 end time |
| `TueEnd` | Tuesday shift 1 end time |
| `WedEnd` | Wednesday shift 1 end time |
| `ThuEnd` | Thursday shift 1 end time |
| `FriEnd` | Friday shift 1 end time |

For each:

1. Click **+ Add column** → **Choice**
2. **Name:** *(see table above)*
3. **Choices** (in this exact order):
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
4. **Default value:** Leave blank
5. **Require that this column contains information:** No
6. Click **Save**

### Columns 15–19: Shift 2 Start Time Columns (Mon–Fri)

For staff who work a split shift (e.g., morning and then back in the afternoon), add a second start column per day. Use the **exact same choices** as the Shift 1 start columns.

| Column Name | Description |
|-------------|-------------|
| `MonStart2` | Monday shift 2 start time |
| `TueStart2` | Tuesday shift 2 start time |
| `WedStart2` | Wednesday shift 2 start time |
| `ThuStart2` | Thursday shift 2 start time |
| `FriStart2` | Friday shift 2 start time |

Same choices as the Shift 1 start columns (8:30 AM → 4:00 PM). Leave blank if no second shift.

### Columns 20–24: Shift 2 End Time Columns (Mon–Fri)

| Column Name | Description |
|-------------|-------------|
| `MonEnd2` | Monday shift 2 end time |
| `TueEnd2` | Tuesday shift 2 end time |
| `WedEnd2` | Wednesday shift 2 end time |
| `ThuEnd2` | Thursday shift 2 end time |
| `FriEnd2` | Friday shift 2 end time |

Same choices as the Shift 1 end columns (9:00 AM → 4:30 PM). Leave blank if no second shift.

### Column 25: SchedSortOrder (Number)

Controls the left-to-right column order in the schedule grid. The app's reorder arrows update this automatically.

1. Click **+ Add column** → **Number**
2. **Name:** `SchedSortOrder`
3. **Description:** `Controls column order in the schedule grid (lower number = further left)`
4. **Number of decimal places:** 0
5. **Default value:** `10`
6. **Require that this column contains information:** No
7. Click **Save**

---

## Step 3: Create Views

### View 1: Active Staff

1. Click **Settings** (gear icon) → **List settings**
2. Scroll to **Views** → Click **Create view** → **Standard View**
3. **View Name:** `Active Staff`
4. **Columns:** Member, Role, Active
5. **Filter:** Active **is equal to** Yes
6. **Sort:** Member (Ascending)
7. Click **OK**

### View 2: All Staff

1. Click **Create view** → **Standard View**
2. **View Name:** `All Staff`
3. **Columns:** Member, Role, Active
4. **Sort:** Member (Ascending)
5. Click **OK**

---

## Step 4: Add Staff Members and Populate AidType

### Adding a new staff member

1. Go to the Staff list → Click **+ New**
2. **Member:** Search for and select the LSU account
3. **Role:** Select appropriate role
4. **Active:** Leave as Yes
5. Click **Save**

### Populating AidType for existing staff

1. Click **Edit in grid view** in the toolbar
2. For each active staff member, click their `AidType` cell and select:
   - **President's Aid (PA)** — ~6 hrs/week cap
   - **Work Study (WS)** — ~12 hrs/week cap
   - **Graduate Assistant (GA)** — ~20 hrs/week cap
   - Leave blank if not on a financial aid program
3. Click **Exit grid view** when done

> **Schedule times:** Leave all time columns blank initially. Staff fill in their own schedule using the app.

---

## Removing Staff Access

To deactivate a staff member (recommended over deletion):

1. Find the staff member → click to edit
2. Change **Active** to **No** → Save

This preserves historical records while removing access.

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | No | — | Optional identifier |
| Member | Person | Yes | — | Staff member's LSU account |
| Role | Choice | Yes | — | Manager; Technician; Student Worker |
| Active | Yes/No | No | Yes | Employment status |
| AidType | Choice | No | — | President's Aid; Work Study; Graduate Assistant |
| MonStart | Choice | No | — | Monday shift 1 start (blank = Off) |
| MonEnd | Choice | No | — | Monday shift 1 end |
| TueStart | Choice | No | — | Tuesday shift 1 start |
| TueEnd | Choice | No | — | Tuesday shift 1 end |
| WedStart | Choice | No | — | Wednesday shift 1 start |
| WedEnd | Choice | No | — | Wednesday shift 1 end |
| ThuStart | Choice | No | — | Thursday shift 1 start |
| ThuEnd | Choice | No | — | Thursday shift 1 end |
| FriStart | Choice | No | — | Friday shift 1 start |
| FriEnd | Choice | No | — | Friday shift 1 end |
| MonStart2 | Choice | No | — | Monday shift 2 start (blank = no second shift) |
| MonEnd2 | Choice | No | — | Monday shift 2 end |
| TueStart2 | Choice | No | — | Tuesday shift 2 start |
| TueEnd2 | Choice | No | — | Tuesday shift 2 end |
| WedStart2 | Choice | No | — | Wednesday shift 2 start |
| WedEnd2 | Choice | No | — | Wednesday shift 2 end |
| ThuStart2 | Choice | No | — | Thursday shift 2 start |
| ThuEnd2 | Choice | No | — | Thursday shift 2 end |
| FriStart2 | Choice | No | — | Friday shift 2 start |
| FriEnd2 | Choice | No | — | Friday shift 2 end |
| SchedSortOrder | Number | No | 10 | Left-to-right grid column order |

---

## Power Apps Integration

The Staff Dashboard app uses this list for access control:

```
// Check if current user is active staff
LookUp(
    Staff,
    Member.Email = User().Email && Active = true
)
```

---

## Seasonal Maintenance

At the start of each new semester, staff update their own schedule using the app — old values are overwritten. No archiving or list changes needed.

To clear all schedules at once, use **Edit in grid view** and bulk-clear all the time columns.

---

## Verification Checklist

- [ ] List created with name "Staff"
- [ ] Member column is Person type (required)
- [ ] Role has choices: Manager, Technician, Student Worker
- [ ] Active defaults to Yes
- [ ] AidType has choices: `President's Aid`, `Work Study`, `Graduate Assistant`
- [ ] `MonStart` through `FriStart` — 5 columns, 16 choices (8:30 AM → 4:00 PM)
- [ ] `MonEnd` through `FriEnd` — 5 columns, 16 choices (9:00 AM → 4:30 PM)
- [ ] `MonStart2` through `FriStart2` — 5 columns, same choices as Shift 1 start
- [ ] `MonEnd2` through `FriEnd2` — 5 columns, same choices as Shift 1 end
- [ ] All 20 time columns: no default value, not required
- [ ] `SchedSortOrder` added as Number, default 10, not required
- [ ] Active Staff and All Staff views created
- [ ] At least one staff member added for testing
- [ ] `AidType` populated for all active student workers

---

## Next Steps

1. Add all current Fabrication Lab staff members and set their `AidType`
2. Configure Power Apps staff console to check this list
3. Test access control by logging in as a staff member
4. Build the schedule screen: `PowerApps/StaffDashboard-Schedule-Screen.md`
