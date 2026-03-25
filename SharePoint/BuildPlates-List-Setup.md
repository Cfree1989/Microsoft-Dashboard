# BuildPlates SharePoint List Setup

**Purpose:** Track individual build plates/gcode files for multi-plate print jobs  
**Time Required:** 15 minutes

---

## Overview

The BuildPlates list enables staff to track multiple build plates (gcode files) per print request. A single print job may require several plates across different printers, and this list maintains the status of each plate individually.

**Key Features:**
- 6 columns for linking plates to requests, preserving stable identity, freezing staff-facing labels, and tracking reprints
- One-to-many relationship with PrintRequests (multiple plates per job)
- Status progression: Queued → Printing → Completed → Picked Up
- Machine assignment supporting multi-printer jobs
- Staff-only access (no student visibility)

**Related Documents:**
- **PrintRequests List:** `SharePoint/PrintRequests-List-Setup.md`
- **Payments List:** `SharePoint/Payments-List-Setup.md`
- **Staff Dashboard App Spec:** `PowerApps/StaffDashboard-App-Spec.md`

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `BuildPlates`
6. **Description:** `Tracks individual build plates (gcode files) for multi-plate print jobs`
7. Click **Create**

---

## Step 2: Add Columns

### Column 1: RequestID (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `RequestID`
3. **Description:** `Links to PrintRequests.ID`
4. **Number of decimal places:** 0
5. **Require that this column contains information:** Yes
6. Click **Save**

> 💡 **Purpose:** Foreign key linking this plate to its parent print request. Every plate must belong to a request.

### Column 2: ReqKey (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `ReqKey`
3. **Description:** `Request reference for easy identification (e.g., REQ-00042)`
4. Click **Save**

> 💡 **Purpose:** Human-readable identifier copied from the parent request for quick reference in list views.

### Column 3: PlateKey (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `PlateKey`
3. **Description:** `Stable per-plate identifier used by payment history and audit records`
4. **Require that this column contains information:** Yes
5. Click **Save**

> ⚠️ **Important:** `PlateKey` is the durable identifier for a plate. Generate it once when the record is created in Power Apps using `Text(GUID())`. Do not change it later, even if plate order or visible numbering changes.

### Column 4: Machine (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Machine`
3. **Description:** `Printer assigned to this build plate`
4. **Choices** (must match `PrintRequests.Printer` values exactly):
   - Prusa MK4S (9.8×8.3×8.7in)
   - Prusa XL (14.2×14.2×14.2in)
   - Raised3D Pro 2 Plus (12.0×12.0×23in)
   - Form 3 (5.7×5.7×7.3in)
5. **Require that this column contains information:** Yes
6. Click **Save**

> ⚠️ **Important:** Choice values must EXACTLY match the printer names in the `PrintRequests.Printer` column. This ensures consistent filtering in Power Apps.

### Column 5: Status (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `Status`
3. **Description:** `Current status of this build plate`
4. **Choices:**
   - Queued
   - Printing
   - Completed
   - Picked Up
5. **Default value:** Queued
6. **Require that this column contains information:** Yes
7. Click **Save**

> 💡 **Status Progression:**
> - **Queued** - Plate is ready to print but not yet started
> - **Printing** - Plate is currently printing on the assigned machine
> - **Completed** - Print finished, ready for pickup
> - **Picked Up** - Student has collected this plate (marked during payment)

### Column 6: DisplayLabel (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `DisplayLabel`
3. **Description:** `Frozen staff-facing label once numbering locks (e.g., "1/4", "Reprint 1")`
4. Click **Save**

> 💡 **Purpose:** This stores the exact label staff should continue seeing after the first plate is completed. Leave it blank while a job is still being actively re-sliced. Once labels lock, existing rows receive their frozen labels and later additions can use numbered labels such as `Reprint 1`, `Reprint 2`.

---

## Step 3: Set Permissions

The BuildPlates list should be accessible **only to staff**, not students.

1. Go to the BuildPlates list
2. Click **Settings** (gear icon) → **List settings**
3. Click **Permissions for this list**
4. Click **Stop Inheriting Permissions**
5. Click **OK** to confirm
6. **Remove** any groups that include students (e.g., "Site Members" if it contains students)
7. **Keep** these groups:
   - Owners (Full Control)
   - Staff Group (Edit or Contribute)

> 💡 **Why Staff-Only?** BuildPlates is internal tracking data. Students see their overall job status via PrintRequests; they don't need to see individual plate-level details.

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | Yes | - | Auto-created by SharePoint (can be hidden) |
| RequestID | Number | Yes | - | Links to PrintRequests.ID |
| ReqKey | Single line | No | - | Request reference (REQ-00042) |
| PlateKey | Single line | Yes | - | Immutable per-plate identifier |
| Machine | Choice | Yes | - | Printer assigned to this plate |
| Status | Choice | Yes | Queued | Queued → Printing → Completed → Picked Up |
| DisplayLabel | Single line | No | - | Frozen staff-facing label once numbering locks |

---

## Data Flow Example

**Scenario:** Student submits request REQ-00087. Staff slices the model into 4 gcode files that will print on different machines. Later, 2 reprints are added after the original labels lock.

| ID | RequestID | ReqKey | PlateKey | Machine | Status | DisplayLabel |
|----|-----------|--------|----------|---------|--------|--------------|
| 1 | 87 | REQ-00087 | BP-87-A1 | Prusa MK4S (9.8×8.3×8.7in) | Completed | 1/4 |
| 2 | 87 | REQ-00087 | BP-87-A2 | Prusa MK4S (9.8×8.3×8.7in) | Completed | 2/4 |
| 3 | 87 | REQ-00087 | BP-87-A3 | Prusa MK4S (9.8×8.3×8.7in) | Completed | 3/4 |
| 4 | 87 | REQ-00087 | BP-87-B1 | Prusa XL (14.2×14.2×14.2in) | Queued | 4/4 |
| 5 | 87 | REQ-00087 | BP-87-R1 | Prusa MK4S (9.8×8.3×8.7in) | Queued | Reprint 1 |
| 6 | 87 | REQ-00087 | BP-87-R2 | Prusa XL (14.2×14.2×14.2in) | Queued | Reprint 2 |

**What this shows:**
- Original plates keep their frozen labels once the first plate is completed
- Reprints are still part of the same job, but they are explicitly labeled outside the original `x/4` set
- Stable `PlateKey` values still provide the durable audit trail even when display labels stop being position-based

---

## Verification Checklist

- [ ] List created with name "BuildPlates"
- [ ] RequestID column: Number type, required
- [ ] ReqKey column: Single line of text
- [ ] PlateKey column: Single line of text, required
- [ ] Machine column: Choice with all 4 printer options (exact names match PrintRequests.Printer)
- [ ] Status column: Choice with 4 options, default "Queued"
- [ ] DisplayLabel column: Single line of text
- [ ] Permissions stopped inheriting from site
- [ ] Student groups removed from permissions
- [ ] Staff groups have Edit or Contribute access

---

## Integration Notes

### Power Apps Integration

In the Staff Dashboard, this list is accessed via:
- **Data connection:** `BuildPlates`
- **Primary collection:** `colAllBuildPlates` (pre-loaded at App.OnStart)
- **Working collection:** `colBuildPlates` (plates for current selection)
- **Indexed collection:** `colBuildPlatesIndexed` (with dynamic `PlateNum` plus a resolved staff-facing label)

> 💡 `PlateNum` in Power Apps remains display-only and is still useful while a job is being actively re-sliced. Once the parent request locks labels, the app should render `DisplayLabel` instead of recalculating the visible text from `PlateNum`. Use the stored `PlateKey` column for the durable pickup-time and audit snapshot.

> 💡 **Locking rule:** The parent request controls when labels lock. The recommended companion fields are `PrintRequests.BuildPlateLabelsLocked` (Yes/No, default `No`) and `PrintRequests.BuildPlateOriginalTotal` (Number). When the first build plate reaches `Completed`, Power Apps should patch frozen `DisplayLabel` values onto all current rows, set the parent request flag to `Yes`, and store the original denominator. Later additions can be treated as reprints and given explicit `DisplayLabel` values such as `Reprint 1`, `Reprint 2`.
>
> **Protected original set:** Once labels lock, the original numbered plates become the frozen baseline set and should no longer be deletable in Power Apps. Only reprint rows should remain removable. This prevents staff from accidentally deleting `1/4`, `2/4`, etc. and breaking the original sequence.

### ActualPrinter Auto-Population

When a job is marked complete, the `PrintRequests.ActualPrinter` field is auto-populated from the distinct `Machine` values across all plates:

```powerfx
Distinct(Filter(BuildPlates, RequestID = varSelectedItem.ID), Machine.Value)
```

**Example:** If plates used MK4S and XL, `ActualPrinter` becomes `[MK4S, XL]` (multi-select).

### Completion Gate

A job cannot be marked "Complete" until all its plates are either Completed or Picked Up:

```powerfx
CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Not(Status.Value in ["Completed", "Picked Up"]))) = 0
```

---

*Created: March 17, 2026*
