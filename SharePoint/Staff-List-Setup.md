# Staff SharePoint List Setup

**Purpose:** Team member management, role assignment, financial aid type, and semester schedule  
**Time Required:** 30 minutes

---

## Overview

The Staff list manages team member information and role assignments. Power Apps staff console checks this list to determine if a user has staff access, enforces weekly hour limits based on financial aid type, and drives the schedule grid.

**Key Features:**
- 16 total fields — one row per person, no separate schedule list needed
- Person field integration with LSU accounts
- Role designation (Manager, Technician, Student Worker)
- Active/inactive status management
- Financial aid type for automatic weekly hour limit enforcement
- Per-person Monday–Friday shift schedule

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
5. **Default value:** Leave blank
6. **Require that this column contains information:** No
7. Click **Save**

The app uses `AidType` to enforce weekly hour limits:

| Aid Type | Max Hours/Week | Fund (Annual) |
|----------|----------------|---------------|
| President's Aid | 6 hrs | $1,550 |
| Work Study | 12 hrs | $3,000 |

> **How the limit is calculated:** Annual fund ÷ 2 semesters ÷ 14 weeks ÷ $10/hr = max weekly hours. The app enforces this — no manual math needed.

### Columns 5–9: Start Time Columns (Mon–Fri)

Each day needs a **StartTime** column. Choices are 30-minute increments from when the lab opens (8:30 AM) to the latest possible start for a 30-minute shift (4:00 PM).

Repeat these steps for all 5 days — the only thing that changes is the **Name**:

| Column Name | Description |
|-------------|-------------|
| `MonStart` | Monday shift start time |
| `TueStart` | Tuesday shift start time |
| `WedStart` | Wednesday shift start time |
| `ThuStart` | Thursday shift start time |
| `FriStart` | Friday shift start time |

For each:

1. Click **+ Add column** → **Choice**
2. **Name:** *(see table above)*
3. **Description:** *(day) shift start time*
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

> **Tip:** After saving `MonStart`, you can copy-paste the choices when creating the remaining 4 columns rather than retyping them.

### Columns 10–14: End Time Columns (Mon–Fri)

Each day also needs an **EndTime** column. Choices are 30-minute increments from the earliest possible end (9:00 AM) to when the lab closes (4:30 PM).

| Column Name | Description |
|-------------|-------------|
| `MonEnd` | Monday shift end time |
| `TueEnd` | Tuesday shift end time |
| `WedEnd` | Wednesday shift end time |
| `ThuEnd` | Thursday shift end time |
| `FriEnd` | Friday shift end time |

For each:

1. Click **+ Add column** → **Choice**
2. **Name:** *(see table above)*
3. **Description:** *(day) shift end time*
4. **Choices** (in this exact order):
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
5. **Default value:** Leave blank
6. **Require that this column contains information:** No
7. Click **Save**

### Column 15: SchedSortOrder (Number)

Controls the left-to-right column order each staff member appears in the schedule grid. The app's reorder arrows update this value automatically — you don't need to manage it by hand.

1. Click **+ Add column** → **Number**
2. **Name:** `SchedSortOrder`
3. **Description:** `Controls column order in the schedule grid (lower number = further left)`
4. **Number of decimal places:** 0
5. **Default value:** `10`
   > Starting at 10 instead of 1 leaves room to insert people between existing entries later.
6. **Require that this column contains information:** No
7. Click **Save**

---

## Step 3: Create Views

### View 1: Active Staff

1. Click **Settings** (gear icon) → **List settings**
2. Scroll down to **Views** section → Click **Create view**
3. Select **Standard View**
4. **View Name:** `Active Staff`
5. **Columns:** Check these columns:
   - Member
   - Role
   - Active
6. **Filter:** Active **is equal to** Yes
7. **Sort:** Member (Ascending)
8. Click **OK**

### View 2: All Staff

1. Click **Create view** again
2. Select **Standard View**
3. **View Name:** `All Staff`
4. **Columns:** Check these columns:
   - Member
   - Role
   - Active
5. **Sort:** Member (Ascending)
6. Click **OK**

---

## Step 4: Add Staff Members and Populate AidType

### Adding a new staff member

1. Go to the Staff list
2. Click **+ New**
3. **Member:** Search for and select the LSU account
4. **Role:** Select appropriate role
5. **Active:** Leave as Yes (default)
6. Click **Save**

### Populating AidType for existing staff

1. Click **Edit in grid view** (pencil icon in the toolbar)
   > Grid view lets you fill in all values at once without opening each record individually.
2. For each active staff member, click their `AidType` cell and select:
   - **President's Aid** — for staff on the Presidential Aid program (~6 hrs/week)
   - **Work Study** — for staff on the Federal/LSU Work Study program (~12 hrs/week)
   - Leave blank if not on either program
3. Click **Exit grid view** when done

> **Schedule times:** Leave all the `MonStart`/`MonEnd` etc. columns blank for now. Staff members will fill in their own schedule using the app.

---

## Removing Staff Access

To deactivate a staff member (recommended over deletion):

1. Find the staff member in the list
2. Click to edit the item
3. Change **Active** to **No**
4. Click **Save**

This preserves historical records while removing access.

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | No | — | Optional identifier |
| Member | Person | Yes | — | Staff member's LSU account |
| Role | Choice | Yes | — | Manager; Technician; Student Worker |
| Active | Yes/No | No | Yes | Employment status |
| AidType | Choice | No | — | President's Aid; Work Study |
| MonStart | Choice | No | — | Monday shift start (blank = Off) |
| MonEnd | Choice | No | — | Monday shift end (blank = Off) |
| TueStart | Choice | No | — | Tuesday shift start |
| TueEnd | Choice | No | — | Tuesday shift end |
| WedStart | Choice | No | — | Wednesday shift start |
| WedEnd | Choice | No | — | Wednesday shift end |
| ThuStart | Choice | No | — | Thursday shift start |
| ThuEnd | Choice | No | — | Thursday shift end |
| FriStart | Choice | No | — | Friday shift start |
| FriEnd | Choice | No | — | Friday shift end |
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

If no match is found, the user is not granted staff access to the dashboard.

---

## Seasonal Maintenance

At the start of each new semester, staff simply update their own schedule using the app — the old values get overwritten by the new ones. There is no archiving of previous schedules, which keeps things simple.

If you ever need to clear everyone's schedule at once (e.g., at the end of the year), use **Edit in grid view** in SharePoint to bulk-clear all the time columns.

---

## Verification Checklist

- [ ] List created with name "Staff"
- [ ] Member column is Person type (required)
- [ ] Role has choices: Manager, Technician, Student Worker
- [ ] Active defaults to Yes
- [ ] AidType column added with choices: `President's Aid`, `Work Study`
- [ ] `MonStart` through `FriStart` — 5 columns, each with 16 choices (8:30 AM → 4:00 PM)
- [ ] `MonEnd` through `FriEnd` — 5 columns, each with 16 choices (9:00 AM → 4:30 PM)
- [ ] All 10 time columns have no default value and are not required
- [ ] `SchedSortOrder` added as Number type, default 10, not required
- [ ] Active Staff view created with filter
- [ ] All Staff view created
- [ ] At least one staff member added for testing
- [ ] `AidType` populated for all active student workers

---

## Next Steps

1. Add all current Fabrication Lab staff members and set their `AidType`
2. Configure Power Apps staff console to check this list
3. Test access control by logging in as a staff member
4. Build the schedule screen: `PowerApps/StaffDashboard-Schedule-Screen.md`
