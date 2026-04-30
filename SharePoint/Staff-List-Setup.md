# Staff SharePoint List Setup

**Purpose:** Team member management, role assignment, financial aid type, and schedule column order  
**Time Required:** 15 minutes

---

## Overview

The Staff list manages team member information and role assignments. Power Apps staff console checks this list to determine if a user has staff access and enforces weekly hour limits based on financial aid type. Actual shift times live in the separate **StaffShifts** list — see [StaffShifts-List-Setup.md](StaffShifts-List-Setup.md).

**Key Features:**
- 6 fields on Staff (plus built-in Title)
- Person field integration with LSU accounts
- Role designation (Manager, Technician, Student Worker)
- Active/inactive status management
- Financial aid type for automatic weekly hour limit enforcement
- `SchedSortOrder` for left-to-right column order in the schedule grid

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
| President's Aid | PA | 7 hrs | $1,550 |
| Work Study | WS | 13 hrs | $3,000 |
| Graduate Assistant | GA | 20 hrs | — |

> **How WS/PA limits relate to funding:** A rough planning formula is annual fund ÷ 2 semesters ÷ 14 weeks ÷ $10/hr. **Apr 30, 2026:** The Staff Dashboard Schedule screen enforces **fixed** weekly caps in Power Fx (**PA 7**, **WS 13**, **GA 20**). Changing caps requires updating those formulas (see [`PowerApps/StaffDashboard-Schedule-Screen.md`](../PowerApps/StaffDashboard-Schedule-Screen.md)), not this list alone.

### Column 5: SchedSortOrder (Number)

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
   - **President's Aid (PA)** — ~7 hrs/week cap (enforced in app)
   - **Work Study (WS)** — ~13 hrs/week cap (enforced in app)
   - **Graduate Assistant (GA)** — ~20 hrs/week cap
   - Leave blank if not on a financial aid program
3. Click **Exit grid view** when done

> **Shifts:** Staff enter shift times in the Power Apps Schedule screen. Those rows are stored in the **StaffShifts** list, not on this list.

---

## Removing Staff Access

To deactivate a staff member (recommended over deletion):

1. Find the staff member → click to edit
2. Change **Active** to **No** → Save

This preserves historical records while removing access. Optionally delete or clear their rows in **StaffShifts** if you do not want old shifts to appear.

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | No | — | Optional identifier |
| Member | Person | Yes | — | Staff member's LSU account |
| Role | Choice | Yes | — | Manager; Technician; Student Worker |
| Active | Yes/No | No | Yes | Employment status |
| AidType | Choice | No | — | President's Aid; Work Study; Graduate Assistant |
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

At the start of each new semester, staff update their own schedule in the app. Shifts are overwritten in **StaffShifts** (delete + re-insert per person on save).

To clear all shifts at once, open **StaffShifts** in SharePoint and delete rows in grid view, or filter by semester if you add a Semester column later.

---

## Verification Checklist

- [ ] List created with name "Staff"
- [ ] Member column is Person type (required)
- [ ] Role has choices: Manager, Technician, Student Worker
- [ ] Active defaults to Yes
- [ ] AidType has choices: `President's Aid`, `Work Study`, `Graduate Assistant`
- [ ] `SchedSortOrder` added as Number, default 10, not required
- [ ] Active Staff and All Staff views created
- [ ] At least one staff member added for testing
- [ ] `AidType` populated for all active student workers
- [ ] **StaffShifts** list created per [StaffShifts-List-Setup.md](StaffShifts-List-Setup.md)

---

## Next Steps

1. Create the **StaffShifts** list: [StaffShifts-List-Setup.md](StaffShifts-List-Setup.md)
2. Add all current Fabrication Lab staff members and set their `AidType`
3. Configure Power Apps staff console to check this list
4. Build the schedule screen: [StaffDashboard-Schedule-Screen.md](../PowerApps/StaffDashboard-Schedule-Screen.md)
