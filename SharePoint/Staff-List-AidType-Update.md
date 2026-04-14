# Staff List — AidType Column Update

**Purpose:** Add financial aid type tracking to existing staff members  
**Time Required:** 5 minutes  
**Applies to:** Existing `Staff` list (already created)

> This update is required before building the Schedule screen in the Staff Dashboard app. The app reads `AidType` to calculate each person's maximum weekly hours.

---

## Related Documents

- **Staff List (original setup):** `SharePoint/Staff-List-Setup.md`
- **StaffSchedule List (new):** `SharePoint/StaffSchedule-List-Setup.md`
- **Schedule Screen Build Guide:** `PowerApps/StaffDashboard-Schedule-Screen.md`

---

## What This Update Does

Adds one new column to the existing `Staff` list:

| Column | Type | Choices |
|--------|------|---------|
| `AidType` | Choice | President's Aid, Work Study |

The app uses this value to determine how many hours per week each person is allowed to schedule:

| Aid Type | Max Hours/Week | Max Slots/Week | Fund (Annual) |
|----------|----------------|----------------|---------------|
| President's Aid | 6 hrs | 12 slots | $1,550 |
| Work Study | 12 hrs | 24 slots | $3,000 |

> **How the limit is calculated:** Annual fund amount ÷ 2 semesters ÷ 14 weeks ÷ $10/hr = max weekly hours. The app enforces this automatically — no manual math needed.

---

## Step 1: Open the Staff List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click on the **Staff** list

---

## Step 2: Add the AidType Column

1. Click **+ Add column** (at the right edge of the column headers)
2. Select **Choice**
3. Fill in the column details:
   - **Name:** `AidType`
   - **Description:** `Financial aid type — determines maximum weekly hours`
   - **Choices** (add each on a new line):
     - `President's Aid`
     - `Work Study`
4. **Default value:** Leave blank (no default — must be set explicitly per person)
5. **Require that this column contains information:** No
   > Leaving this optional prevents errors if you have staff who aren't on financial aid (e.g., paid directly by the department). They simply won't appear in the hours counter in the schedule app.
6. Click **Save**

---

## Step 3: Populate AidType for Existing Staff Members

Now that the column exists, go through each active staff member and set their aid type.

1. In the Staff list, click **Edit in grid view** (the pencil icon in the toolbar)
   > Grid view lets you fill in all values quickly without opening each item one at a time.
2. For each person, click their `AidType` cell and select the appropriate type:
   - **President's Aid** — for staff on the Presidential Aid program (~6 hrs/week)
   - **Work Study** — for staff on the Federal/LSU Work Study program (~12 hrs/week)
3. Leave blank for any staff member who is not on either program
4. Click **Exit grid view** when finished

---

## Step 4: Verify the Column Appears Correctly

1. Open any staff member's record by clicking their name
2. Confirm you see an **AidType** field with the correct value selected
3. Confirm the `Member`, `Role`, `Active`, and `AidType` columns all appear in the default view

---

## Column Summary (Full Staff List After Update)

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| Title | Single line | No | Optional identifier |
| Member | Person | Yes | Staff member's LSU account |
| Role | Choice | Yes | Manager; Technician; Student Worker |
| Active | Yes/No | No | Employment status (default: Yes) |
| AidType | Choice | No | President's Aid; Work Study |

---

## Verification Checklist

- [ ] `AidType` column added as Choice type
- [ ] Choices are exactly: `President's Aid` and `Work Study` (spelling matters — the app matches these strings)
- [ ] No default value set
- [ ] Column is not required
- [ ] AidType populated for all active student workers
- [ ] Column visible in the default list view

---

## Next Steps

Once this update is complete, proceed to:

1. Create the `StaffSchedule` list → `SharePoint/StaffSchedule-List-Setup.md`
2. Build the Schedule screen in Power Apps → `PowerApps/StaffDashboard-Schedule-Screen.md`
