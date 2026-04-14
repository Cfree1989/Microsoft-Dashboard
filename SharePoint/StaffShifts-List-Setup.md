# StaffShifts SharePoint List Setup

**Purpose:** Store every work shift as its own row — unlimited shifts per person per day (split shifts, multiple blocks, etc.)  
**Time Required:** 15 minutes  
**Related:** [Staff-List-Setup.md](Staff-List-Setup.md) — the `Staff` list holds identity, role, aid type, and sort order; this list holds only schedule blocks.

---

## Overview

| Concept | Detail |
|---------|--------|
| One row | One shift (one continuous time range on one weekday) |
| Same person, same day | Multiple rows allowed (e.g. 9–11 AM and 2–4 PM Monday = 2 rows) |
| Join key | `StaffEmail` must match `Member.Email` from the Staff list exactly |

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** → **Site contents**
3. Click **+ New** → **List** → **Blank list**
4. **Name:** `StaffShifts`
5. **Description:** `Per-shift schedule rows for the staff dashboard`
6. Click **Create**

---

## Step 2: Add Columns

### Column 1: StaffEmail (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `StaffEmail`
3. **Description:** `Must match Member.Email from the Staff list`
4. **Require that this column contains information:** Yes
5. Click **Save**

### Column 2: Day (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Day`
3. **Description:** `Weekday for this shift`
4. **Choices** (exact spelling — Power Apps uses these strings):
   - `Monday`
   - `Tuesday`
   - `Wednesday`
   - `Thursday`
   - `Friday`
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 3: ShiftStart (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `ShiftStart`
3. **Description:** `Shift start time`
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
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 4: ShiftEnd (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `ShiftEnd`
3. **Description:** `Shift end time (must be after start)`
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
5. **Require that this column contains information:** Yes
6. Click **Save**

---

## Column Summary

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| Title | Single line | No | SharePoint default; optional |
| StaffEmail | Single line | Yes | Links shift to Staff.Member.Email |
| Day | Choice | Yes | Monday … Friday |
| ShiftStart | Choice | Yes | Start label (must exist in app's colTimeSlots) |
| ShiftEnd | Choice | Yes | End label |

---

## Power Apps

Add **StaffShifts** as a data source in the Staff Dashboard app (same site). The schedule screen loads all rows into `colShifts`, builds `colSchedLookup` for the HTML grid, and on save uses `RemoveIf(StaffShifts, StaffEmail = ...)` then `Patch` for each edited row.

---

## Verification Checklist

- [ ] List named `StaffShifts` on the same site as `Staff`
- [ ] `StaffEmail` — single line of text, required
- [ ] `Day` — choice with five weekday values spelled exactly as above
- [ ] `ShiftStart` — 16 choices (8:30 AM → 4:00 PM)
- [ ] `ShiftEnd` — 16 choices (9:00 AM → 4:30 PM)
- [ ] List connected in Power Apps as `StaffShifts`

---

## Next Steps

Build the schedule screen: [StaffDashboard-Schedule-Screen.md](../PowerApps/StaffDashboard-Schedule-Screen.md)
