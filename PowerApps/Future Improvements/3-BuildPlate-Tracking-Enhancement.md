# Build Plate Tracking Enhancement

**Status:** Future Enhancement  
**Priority:** Medium  
**Dependencies:** Payment Modal (Step 12C), Job Card Gallery (Step 6–7), App.OnStart (Step 3)

---

## Problem Statement

### Current Behavior

The system tracks print requests one-to-one: one student submission = one SharePoint item. When staff processes a job, they slice the model, load files onto USB sticks, and start printing. The system captures:

- `Printer` — the printer type the student originally requested
- `Status` — the overall job state (Ready to Print → Printing → Completed)
- `EstWeight` / `FinalWeight` — combined estimate and actual weight for the whole job

### The Gap

A single print request often requires **multiple gcode files across multiple machines**. A model too large for one build plate gets split; a project with many parts may run on three MK4S machines simultaneously plus the XL. Currently:

- There is no way to record how many files were sliced from a single request
- There is no way to track which individual files have finished printing vs. which are still running
- When a student picks up a partial order (some pieces ready, rest still printing), staff has no structured record of which pieces were collected
- The naming convention staff use informally ("1/4", "3/5") exists only on paper or verbally

### Use Case Example

> Four gcode files were sliced from REQ-00087. Three are queued on MK4S machines; one was too large and is running on the XL. The student comes in the next day — two MK4S plates are done, the third MK4S plate and the XL plate are still running. Staff records a partial payment for the two completed pieces. Currently there is no way to indicate in the system which two pieces were picked up.

---

## Proposed Solution

### Overview

Add a `BuildPlates` sub-list (one row per gcode file) linked to `PrintRequests`. Every job has at least one plate — a default plate is auto-created on approval using the student's requested printer. For multi-plate jobs, staff uses the **Build Plates Modal** to add plates organized by printer.

```
PrintRequests (1 record)
├── ActualPrinter: [MK4S, XL]              ← multi-select, auto-populated from plates
└── BuildPlates (5 records)               ← count derived: CountRows(plates)
    ├── Plate 1: Machine=MK4S, Status=Completed
    ├── Plate 2: Machine=MK4S, Status=Completed
    ├── Plate 3: Machine=MK4S, Status=Printing
    ├── Plate 4: Machine=XL, Status=Queued
    └── Plate 5: Machine=XL, Status=Queued
```

### Key Design Points

| Aspect | Design |
|--------|--------|
| **Default plate** | 1 plate auto-created on approval using student's requested `Printer` |
| **Multi-plate setup** | "Add Plates/Printers" button in Approval Modal; "Manage Plates" in Change Details Modal |
| **Plate organization** | Grouped by printer in Build Plates Modal |
| **Plate removal** | Any plate can be removed at any time (full flexibility for re-slicing/reprinting) |
| **Completion gate** | Job cannot be marked "Complete" until all plates are Completed or Picked Up |
| **ActualPrinter** | Multi-select, auto-populated from distinct `Machine` values across job's plates |
| **Partial pickup** | Payment Modal shows completed plates as checkboxes; checked plates marked "Picked Up" |

### Integration with Printer Verification (ActualPrinter)

Build Plate Tracking and Printer Verification are **integrated features**. The `ActualPrinter` field on `PrintRequests`:

- Is a **multi-select** Choice column (not single-select)
- Is **auto-populated** at completion time from the distinct `Machine` values across the job's plates
- Is **read-only** in the Complete Modal (staff cannot manually edit it)

| Scenario | ActualPrinter Value |
|----------|---------------------|
| Single plate on MK4S | `[MK4S]` |
| 3 plates all on MK4S | `[MK4S]` |
| 2 plates on MK4S, 2 on XL | `[MK4S, XL]` |
| 1 plate on MK4S, 1 on XL, 1 on Raised3D | `[MK4S, XL, Raised3D]` |

Weight and cost recording stays exactly as-is — staff weighs whatever is being picked up and enters the combined weight. No per-plate cost calculation is added.

---

## SharePoint Schema Changes

### New List: `BuildPlates`

Create a new SharePoint list at the site root. No item-level permissions required (staff-only data).

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| `RequestID` | Number | Yes | — | Links to `PrintRequests.ID` |
| `ReqKey` | Single line of text | No | — | Request reference (REQ-00001) |
| `Machine` | Choice | Yes | — | Printer type assigned to this plate |
| `Status` | Choice | Yes | Queued | Queued → Printing → Completed → Picked Up |

#### Machine Column Setup

1. Click **+ Add column** → **Choice**
2. **Name:** `Machine`
3. **Choices** (exact text — must match `PrintRequests.Printer` values):
   - Prusa MK4S (9.8×8.3×8.7in)
   - Prusa XL (14.2×14.2×14.2in)
   - Raised3D Pro 2 Plus (12.0×12.0×23in)
   - Form 3 (5.7×5.7×7.3in)
4. **Require that this column contains information:** Yes

#### Status Column Setup

1. Click **+ Add column** → **Choice**
2. **Name:** `Status`
3. **Choices:**
   - Queued
   - Printing
   - Completed
   - Picked Up
4. **Default value:** Queued
5. **Require that this column contains information:** Yes

#### Permissions

Stop inheriting permissions. Keep staff/owner groups with full access. Remove any group that includes students.

---

## Staff Dashboard App Changes

### Phase 1: Add Data Connection

1. Open **Staff Dashboard** in Edit mode
2. Click the **Data** icon (left toolbar)
3. Click **+ Add data** → search for **BuildPlates** → **Connect**

> ⚠️ All `BuildPlates` references in formulas below will show red errors until this connection is added.

---

### Phase 2: App.OnStart Changes

#### Add Modal Variable

In `App.OnStart`, add to the `=== MODAL CONTROLS ===` block:

```powerfx
Set(varShowBuildPlatesModal, 0);
```

#### Add Collections

In `App.OnStart`, after the `ClearCollect(colNeedsAttention, ...)` line, add:

```powerfx
// === BUILD PLATE TRACKING ===
// Pre-load all plate records so job card progress pills don't trigger per-card delegation
ClearCollect(colAllBuildPlates, BuildPlates);
// Working collections for the Build Plates modal and payment plate selection
ClearCollect(colBuildPlates, Blank());
Clear(colBuildPlates);
ClearCollect(colBuildPlatesIndexed, Blank());
Clear(colBuildPlatesIndexed);
ClearCollect(colPickedUpPlates, Blank());
Clear(colPickedUpPlates);
```

#### Update Card Height

Change `varCardGalleryHeight` from `450` to `490` to accommodate the new button row:

```powerfx
// Before
Set(varCardGalleryHeight, 450);

// After
Set(varCardGalleryHeight, 490);
```

#### New Variables Reference

| Variable | Purpose | Type |
|----------|---------|------|
| `varShowBuildPlatesModal` | ID of item for build plates modal (0=hidden) | Number |
| `colAllBuildPlates` | All BuildPlates records pre-loaded at startup (avoids per-card delegation) | Table |
| `colBuildPlates` | Sorted BuildPlates records for currently selected item | Table |
| `colBuildPlatesIndexed` | `colBuildPlates` with added `PlateNum` column (1, 2, 3…) for labels | Table |
| `colPickedUpPlates` | Plates checked for pickup in the Payment Modal | Table |

---

### Phase 3: Job Card — Build Plates Row

Add a Build Plates information row **above the Details section** (below the Weight/Hours/Cost row). This row shows progress, printers in use, and a button to open the Build Plates Modal.

#### Job Card Layout Reference

```
┌─────────────────────────────────────────────────────────────────┐
│  Logan A Bereziuk                              1d 11h    💡 ▶   │
│  ✉ logan.bereziuk@lsu.edu                                       │
│  loganbereziuk_filament_black                                   │
│                                                                 │
│  ● Black                              🖨 Prusa MK4S             │  ← student's request
│  ⚖ 176.15g · ⏱ ~6h · 💲 17.61                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🖨 3/5 done · Using: MK4S, XL         [Build Plates]    │ ◄── NEW ROW
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Details [✏ Edit]                                               │
│  [expandable details section...]                                │
│                                                                 │
│  Messages (0)      Notes (0)                    🖥 Computer 1   │
│  [Messages]        [Notes]                      [Files]         │
│                                                                 │
│  [Print Complete]                    [Partial Payment]          │
└─────────────────────────────────────────────────────────────────┘
```

The Build Plates row is visible when plates exist (hidden for legacy jobs without plate tracking).

#### Build Plates Row Container (conBuildPlatesRow)

| Property | Value |
|----------|-------|
| Control | Container |
| Name | `conBuildPlatesRow` |
| X | `12` |
| Y | `[position above Details section]` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `36` |
| Fill | `RGBA(245, 247, 250, 1)` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |
| Visible | `CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID)) > 0` |

#### Progress Label (lblBuildPlatesProgress)

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblBuildPlatesProgress` |
| Text | `"🖨 " & Text(CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Or(Status.Value = "Completed", Status.Value = "Picked Up")))) & "/" & Text(CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID))) & " done"` |
| X | `8` |
| Y | `0` |
| Width | `100` |
| Height | `Parent.Height` |
| Size | `10` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorSuccess` |
| VerticalAlign | `VerticalAlign.Middle` |

> 💡 Uses `colAllBuildPlates` (pre-loaded at startup) — not a live `Filter(BuildPlates, ...)` call — to avoid delegation warnings inside a gallery loop.

#### Using Printers Label (lblUsingPrinters)

Shows distinct printers being used for this job, derived from BuildPlates:

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblUsingPrinters` |
| Text | `"Using: " & Concat(Distinct(Filter(colAllBuildPlates, RequestID = ThisItem.ID), Machine.Value), Trim(If(Find("(", Result) > 0, Left(Result, Find("(", Result) - 2), Result)), ", ")` |
| X | `110` |
| Y | `0` |
| Width | `200` |
| Height | `Parent.Height` |
| Size | `10` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

> 💡 Strips dimensions from printer names for brevity: "Using: MK4S, XL" instead of full names.

#### Build Plates Button (btnBuildPlates)

| Property | Value |
|----------|-------|
| Control | Button |
| Name | `btnBuildPlates` |
| Text | `"Build Plates"` |
| X | `Parent.Width - 110` |
| Y | `4` |
| Width | `100` |
| Height | `28` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `10` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

**OnSelect:**

```powerfx
Set(varSelectedItem, ThisItem);
// Load sorted plates for this request
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = ThisItem.ID), ID, SortOrder.Ascending)
);
// Add sequential PlateNum (1, 2, 3…) for use in plate labels
ClearCollect(colBuildPlatesIndexed,
    AddColumns(
        colBuildPlates,
        "PlateNum",
        CountRows(Filter(colBuildPlates, ID <= ThisRecord.ID))
    )
);
Set(varShowBuildPlatesModal, ThisItem.ID)
```

> 📐 **Card height note:** `varCardGalleryHeight` is increased from 450 to 490. The primary action buttons use `Parent.TemplateHeight - varBtnHeight - 12` and shift automatically. The utility row (btnFiles, Message, Archive) stays at Y=360.

---

### Phase 4: Build Plates Modal (conBuildPlatesModal)

#### Design Overview

The Build Plates Modal organizes plates **grouped by printer**. Each printer section is collapsible, shows its plates, and has an "Add Plate" button. Staff adds new printers via the dropdown at the bottom.

#### Visual Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Build Plates — Jane Smith · REQ-00042                               [✕] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Total Plates: [ 5 ]  [Set]                           3 of 5 Completed   │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ▼ Prusa MK4S                                                    [+ Add] │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Plate 1    ● Completed                                     [✕]   │  │
│  │  Plate 2    ● Completed                                     [✕]   │  │
│  │  Plate 3    ● Printing            [✓ Done]                  [✕]   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ▼ Prusa XL                                                      [+ Add] │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Plate 4    ● Queued              [▶ Printing]              [✕]   │  │
│  │  Plate 5    ● Queued              [▶ Printing]              [✕]   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  Add Printer:  [ Select printer...                    ▼ ]    [+ Add]     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                  [Done]  │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Plate Removal

**Any plate can be removed at any time**, regardless of status. This supports scenarios where staff needs to scrap and re-slice a job:

| Status | Can Remove? | Use Case |
|--------|-------------|----------|
| Queued | ✅ Yes | Job not started yet |
| Printing | ✅ Yes | Print failed, need to redo |
| Completed | ✅ Yes | Re-slicing entire job |
| Picked Up | ✅ Yes | Data correction |

The [✕] remove button appears on ALL plate rows.

#### Control Hierarchy

```
scrDashboard
└── conBuildPlatesModal              ← CONTAINER (Visible = varShowBuildPlatesModal > 0)
    ├── recBuildPlatesOverlay        ← Full-screen dark overlay
    ├── recBuildPlatesModal          ← White box (600×680)
    ├── lblBuildPlatesTitle          ← "Build Plates — Jane Smith · REQ-00042"
    ├── btnBuildPlatesClose          ← ✕ top-right
    ├── recBuildPlatesDivider1       ← Divider under title
    ├── lblTotalPlatesLabel          ← "Total Plates:"
    ├── txtTotalPlates               ← Number input
    ├── btnSetTotalPlates            ← Saves to PrintRequests
    ├── lblBuildPlatesProgress       ← "3 of 5 Completed"
    ├── recBuildPlatesDivider2       ← Divider above printer groups
    ├── galPrinterGroups             ← Gallery of distinct printers used
    │   ├── lblPrinterHeader         ← "▼ Prusa MK4S"
    │   ├── btnAddPlateUnderPrinter  ← [+ Add] button for this printer
    │   └── galPlatesForPrinter      ← Nested gallery of plates for this printer
    │       ├── lblPlateNum          ← "Plate 1", "Plate 2"
    │       ├── lblPlateStatus       ← Colored status badge
    │       ├── btnMarkPrinting      ← Queued → Printing
    │       ├── btnMarkDone          ← Printing → Completed
    │       └── btnRemovePlate       ← [✕] (always visible)
    ├── recBuildPlatesDivider3       ← Divider above Add Printer section
    ├── lblAddPrinterLabel           ← "Add Printer:"
    ├── ddAddPrinter                 ← Printer dropdown (filtered by Method)
    ├── btnAddPrinter                ← [+ Add] new printer group
    └── btnBuildPlatesDone           ← "Done"
```

#### Data Structure for Grouped Display

To display plates grouped by printer, use nested collections:

```powerfx
// On modal open, create collection of distinct printers
ClearCollect(colPrintersUsed,
    Distinct(Filter(BuildPlates, RequestID = varSelectedItem.ID), Machine.Value)
);

// The galPrinterGroups gallery uses colPrintersUsed as Items
// Each row's nested galPlatesForPrinter filters plates by that printer:
Filter(colBuildPlatesIndexed, Machine.Value = ThisItem.Result)
```

#### Container (conBuildPlatesModal)

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `RGBA(0, 0, 0, 0)` |
| **Visible** | `varShowBuildPlatesModal > 0` |

#### Overlay (recBuildPlatesOverlay)

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.Width` |
| Height | `Parent.Height` |
| Fill | `varColorOverlay` |

#### Modal Box (recBuildPlatesModal)

| Property | Value |
|----------|-------|
| X | `(Parent.Width - 600) / 2` |
| Y | `(Parent.Height - 620) / 2` |
| Width | `600` |
| Height | `620` |
| Fill | `varColorBgCard` |
| RadiusTopLeft | `8` |
| RadiusTopRight | `8` |
| RadiusBottomLeft | `8` |
| RadiusBottomRight | `8` |

#### Title (lblBuildPlatesTitle)

| Property | Value |
|----------|-------|
| Text | `"Build Plates — " & varSelectedItem.Title & " · " & varSelectedItem.ReqKey` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 18` |
| Width | `520` |
| Height | `26` |
| Size | `14` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |

#### Close Button (btnBuildPlatesClose)

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `recBuildPlatesModal.X + 562` |
| Y | `recBuildPlatesModal.Y + 16` |
| Width | `24` |
| Height | `24` |
| Fill | `Transparent` |
| Color | `varColorTextSecondary` |
| HoverFill | `RGBA(200, 200, 200, 0.3)` |
| HoverColor | `varColorText` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| Size | `14` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

**OnSelect (shared with btnBuildPlatesDone):**

```powerfx
Set(varShowBuildPlatesModal, 0);
Set(varSelectedItem, Blank());
ClearCollect(colBuildPlates, Blank());
Clear(colBuildPlates);
ClearCollect(colBuildPlatesIndexed, Blank());
Clear(colBuildPlatesIndexed);
Reset(txtTotalSliced);
Reset(ddBuildPlatesMachine)
```

#### Divider 1 (recBuildPlatesDivider1)

| Property | Value |
|----------|-------|
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 52` |
| Width | `560` |
| Height | `1` |
| Fill | `varColorBorderLight` |

#### Total Sliced Label (lblTotalSlicedLabel)

| Property | Value |
|----------|-------|
| Text | `"Total Sliced:"` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 66` |
| Width | `100` |
| Height | `28` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

#### Progress Label (lblBuildPlatesProgressModal)

| Property | Value |
|----------|-------|
| Text | `Text(CountRows(Filter(colBuildPlatesIndexed, Or(Status.Value = "Completed", Status.Value = "Picked Up")))) & " of " & Text(CountRows(colBuildPlatesIndexed)) & " Completed"` |
| X | `recBuildPlatesModal.X + 124` |
| Y | `recBuildPlatesModal.Y + 66` |
| Width | `456` |
| Height | `28` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorSuccess` |
| Align | `Align.Right` |
| VerticalAlign | `VerticalAlign.Middle` |

#### Divider 2 (recBuildPlatesDivider2)

| Property | Value |
|----------|-------|
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 102` |
| Width | `560` |
| Height | `1` |
| Fill | `varColorBorderLight` |

#### Build Plates Gallery (galBuildPlates)

| Property | Value |
|----------|-------|
| Items | `colBuildPlatesIndexed` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 110` |
| Width | `560` |
| Height | `320` |
| TemplateSize | `52` |
| TemplatePadding | `2` |
| ShowScrollbar | `true` |

##### Row Background (recPlateRowBg) — inside template

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `0` |
| Width | `Parent.TemplateWidth` |
| Height | `Parent.TemplateHeight` |
| Fill | `If(Mod(ThisItem.PlateNum, 2) = 0, RGBA(245, 247, 250, 1), RGBA(255, 255, 255, 1))` |

##### Plate Label (lblPlateLabel) — inside template

| Property | Value |
|----------|-------|
| Text | `Text(ThisItem.PlateNum) & "/" & Text(CountRows(colBuildPlatesIndexed))` |
| X | `8` |
| Y | `0` |
| Width | `40` |
| Height | `Parent.TemplateHeight` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

##### Machine Dropdown (drpPlateMachine) — inside template

Editable for Queued/Printing plates. Locked (disabled) for Completed/Picked Up to preserve history.

| Property | Value |
|----------|-------|
| Items | `colAvailablePrinters` |
| DefaultSelectedItems | `[ThisItem.Machine]` |
| X | `52` |
| Y | `8` |
| Width | `160` |
| Height | `36` |
| Size | `10` |
| Font | `varAppFont` |
| BorderColor | `If(Self.DisplayMode = DisplayMode.Edit, varInputBorderColor, Transparent)` |
| ChevronBackground | `If(Self.DisplayMode = DisplayMode.Edit, varColorPrimary, Transparent)` |
| DisplayMode | `If(ThisItem.Status.Value in ["Queued", "Printing"], DisplayMode.Edit, DisplayMode.Disabled)` |

**OnChange:**

```powerfx
Patch(BuildPlates,
    LookUp(BuildPlates, ID = ThisItem.ID),
    { Machine: drpPlateMachine.Selected }
);
// Refresh collections
ClearCollect(colBuildPlates, Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending));
ClearCollect(colBuildPlatesIndexed, AddColumns(colBuildPlates, "PlateNum", CountRows(Filter(colBuildPlates, ID <= ThisRecord.ID))));
ClearCollect(colAllBuildPlates, BuildPlates);
ClearCollect(colPrintersUsed, Distinct(colBuildPlates, Machine.Value))
```

##### Status Badge (lblPlateStatus) — inside template

| Property | Value |
|----------|-------|
| Text | `ThisItem.Status.Value` |
| X | `216` |
| Y | `10` |
| Width | `84` |
| Height | `32` |
| Size | `9` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Align | `Align.Center` |
| VerticalAlign | `VerticalAlign.Middle` |
| Fill | `Switch(ThisItem.Status.Value, "Queued", RGBA(230, 230, 230, 1), "Printing", RGBA(255, 243, 205, 1), "Completed", RGBA(200, 230, 201, 1), "Picked Up", RGBA(187, 222, 251, 1), RGBA(230, 230, 230, 1))` |
| Color | `Switch(ThisItem.Status.Value, "Queued", RGBA(80, 80, 80, 1), "Printing", RGBA(130, 80, 0, 1), "Completed", RGBA(27, 94, 32, 1), "Picked Up", RGBA(13, 71, 161, 1), RGBA(80, 80, 80, 1))` |
| RadiusTopLeft | `4` |
| RadiusTopRight | `4` |
| RadiusBottomLeft | `4` |
| RadiusBottomRight | `4` |

##### Mark Printing Button (btnMarkPrinting) — inside template

| Property | Value |
|----------|-------|
| Text | `"▶ Printing"` |
| X | `308` |
| Y | `10` |
| Width | `90` |
| Height | `32` |
| Fill | `varColorWarning` |
| Color | `Color.White` |
| HoverFill | `ColorFade(varColorWarning, -15%)` |
| PressedFill | `ColorFade(varColorWarning, -25%)` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `9` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| **Visible** | `ThisItem.Status.Value = "Queued"` |

**OnSelect (reload pattern used by all three action buttons):**

```powerfx
Patch(BuildPlates,
    LookUp(BuildPlates, ID = ThisItem.ID),
    { Status: { Value: "Printing" } }
);
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(colBuildPlates, "PlateNum", CountRows(Filter(colBuildPlates, ID <= ThisRecord.ID)))
);
ClearCollect(colAllBuildPlates, BuildPlates)
```

##### Mark Done Button (btnMarkDone) — inside template

Same properties as `btnMarkPrinting` with:

| Property | Value |
|----------|-------|
| Text | `"✓ Done"` |
| Fill | `varColorSuccess` |
| HoverFill | `varColorSuccessHover` |
| **Visible** | `ThisItem.Status.Value = "Printing"` |

**OnSelect:** Same reload pattern, `Status: { Value: "Completed" }`.

##### Remove Button (btnRemovePlate) — inside template

| Property | Value |
|----------|-------|
| Text | `"✕"` |
| X | `524` |
| Y | `14` |
| Width | `24` |
| Height | `24` |
| Fill | `Transparent` |
| Color | `varColorTextSecondary` |
| HoverFill | `RGBA(220, 50, 50, 0.15)` |
| HoverColor | `varColorDanger` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| Size | `12` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| **Visible** | `ThisItem.Status.Value = "Queued"` |

> ⚠️ Only Queued plates can be removed. Plates already Printing or Completed cannot be deleted to prevent accidental data loss.

**OnSelect:**

```powerfx
Remove(BuildPlates, LookUp(BuildPlates, ID = ThisItem.ID));
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(colBuildPlates, "PlateNum", CountRows(Filter(colBuildPlates, ID <= ThisRecord.ID)))
);
ClearCollect(colAllBuildPlates, BuildPlates)
```

#### Divider 3 (recBuildPlatesDivider3)

| Property | Value |
|----------|-------|
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 438` |
| Width | `560` |
| Height | `1` |
| Fill | `varColorBorderLight` |

#### Add Plate Section

##### Label (lblAddPlateHeader)

| Property | Value |
|----------|-------|
| Text | `"Add plate:"` |
| X | `recBuildPlatesModal.X + 20` |
| Y | `recBuildPlatesModal.Y + 452` |
| Width | `80` |
| Height | `32` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

##### Machine Dropdown (ddBuildPlatesMachine)

| Property | Value |
|----------|-------|
| Items | `Filter(Choices([@BuildPlates].Machine), If(varSelectedItem.Method.Value = "Filament", Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"], varSelectedItem.Method.Value = "Resin", Value = "Form 3 (5.7×5.7×7.3in)", true))` |
| X | `recBuildPlatesModal.X + 104` |
| Y | `recBuildPlatesModal.Y + 452` |
| Width | `280` |
| Height | `32` |
| Font | `varAppFont` |
| Size | `10` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| DisabledBorderColor | `varInputBorderColor` |
| ChevronBackground | `varChevronBackground` |
| ChevronFill | `varChevronFill` |
| ChevronHoverBackground | `varChevronHoverBackground` |
| ChevronHoverFill | `varChevronHoverFill` |
| ChevronDisabledBackground | `varChevronBackground` |
| ChevronDisabledFill | `varChevronBackground` |
| HoverFill | `varDropdownHoverFill` |
| PressedFill | `varDropdownPressedFill` |
| PressedColor | `varDropdownPressedColor` |
| SelectionFill | `varDropdownSelectionFill` |
| SelectionColor | `varDropdownSelectionColor` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

> 💡 **Method filter:** Filament jobs show MK4S, XL, and Raised3D. Resin jobs show only Form 3. Uses the same filter pattern as `ddCompletePrinter` in Step 12A Enhancement.

##### Add Plate Button (btnBuildPlatesAdd)

| Property | Value |
|----------|-------|
| Text | `"+ Add Plate"` |
| X | `recBuildPlatesModal.X + 396` |
| Y | `recBuildPlatesModal.Y + 452` |
| Width | `100` |
| Height | `32` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisplayMode | `If(IsBlank(ddBuildPlatesMachine.Selected), DisplayMode.Disabled, DisplayMode.Edit)` |

**OnSelect:**

```powerfx
Patch(BuildPlates,
    Defaults(BuildPlates),
    {
        RequestID: varSelectedItem.ID,
        ReqKey: varSelectedItem.ReqKey,
        Machine: { Value: ddBuildPlatesMachine.Selected.Value },
        Status: { Value: "Queued" }
    }
);
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(colBuildPlates, "PlateNum", CountRows(Filter(colBuildPlates, ID <= ThisRecord.ID)))
);
ClearCollect(colAllBuildPlates, BuildPlates);
Reset(ddBuildPlatesMachine)
```

#### Done Button (btnBuildPlatesDone)

| Property | Value |
|----------|-------|
| Text | `"Done"` |
| X | `recBuildPlatesModal.X + 460` |
| Y | `recBuildPlatesModal.Y + 572` |
| Width | `120` |
| Height | `varBtnHeight` |
| Fill | `varColorPrimary` |
| Color | `Color.White` |
| HoverFill | `varColorPrimaryHover` |
| PressedFill | `varColorPrimaryPressed` |
| BorderColor | `Transparent` |
| BorderThickness | `0` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |

**OnSelect:** Same as `btnBuildPlatesClose`.

---

### Phase 5: Payment Modal — Plate Pickup Section

#### Update btnPickedUp / btnPayment OnSelect

When opening the Payment Modal, load the build plates for the selected item and clear prior selections. Add these lines to the **end** of the `btnPickedUp.OnSelect` (and `btnPayment.OnSelect` for Printing status) formula, after `Set(varSelectedItem, ThisItem)`:

```powerfx
// Load plates for the plate pickup checklist
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = ThisItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(colBuildPlates, "PlateNum", CountRows(Filter(colBuildPlates, ID <= ThisRecord.ID)))
);
ClearCollect(colPickedUpPlates, Blank());
Clear(colPickedUpPlates)
```

#### New Controls Inside conPaymentModal

Add after the Payment History section, before `chkPartialPickup`.

##### Section Header (lblPlatePickupHeader)

| Property | Value |
|----------|-------|
| Text | `"Plates being picked up:"` |
| X | `conPaymentModal.X + 20` |
| Y | `conPaymentModal.Y + 460` |
| Width | `510` |
| Height | `22` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

##### Plates Gallery (galPaymentPlates)

| Property | Value |
|----------|-------|
| Items | `Filter(colBuildPlatesIndexed, Status.Value = "Completed")` |
| X | `conPaymentModal.X + 20` |
| Y | `conPaymentModal.Y + 486` |
| Width | `510` |
| Height | `Min(140, CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) * 36)` |
| TemplateSize | `34` |
| TemplatePadding | `2` |
| ShowScrollbar | `true` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

> 💡 **Height formula:** Grows with completed plate count up to 140px (≈4 plates). Collapses to zero (via `Visible`) when no completed plates exist, so the modal layout is unchanged for single-plate jobs.

###### Row Checkbox (chkPaymentPlate) — inside template

| Property | Value |
|----------|-------|
| Text | `""` |
| Default | `ThisItem.ID in colPickedUpPlates.ID` |
| X | `4` |
| Y | `(Parent.TemplateHeight - 20) / 2` |
| Width | `20` |
| Height | `20` |
| CheckmarkFill | `Color.White` |
| Fill | `varColorPrimary` |
| BorderColor | `varInputBorderColor` |

**OnCheck:** `Collect(colPickedUpPlates, ThisItem)`

**OnUncheck:** `Remove(colPickedUpPlates, ThisItem)`

###### Plate Label (lblPaymentPlateLabel) — inside template

| Property | Value |
|----------|-------|
| Text | `Text(ThisItem.PlateNum) & "/" & Text(CountRows(colBuildPlatesIndexed)) & "  ·  " & Trim(If(Find("(", ThisItem.Machine.Value) > 0, Left(ThisItem.Machine.Value, Find("(", ThisItem.Machine.Value) - 2), ThisItem.Machine.Value))` |
| X | `30` |
| Y | `0` |
| Width | `460` |
| Height | `Parent.TemplateHeight` |
| Size | `10` |
| Font | `varAppFont` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

> 💡 **Example:** "2/4  ·  Prusa MK4S"

#### Update Payment Confirm (btnPaymentConfirm OnSelect)

After the existing `Patch(PrintRequests, ...)` and Flow C call, add a block to mark checked plates as Picked Up:

```powerfx
// Mark selected plates as Picked Up in BuildPlates list
If(
    CountRows(colPickedUpPlates) > 0,
    ForAll(colPickedUpPlates,
        Patch(BuildPlates,
            LookUp(BuildPlates, ID = ThisRecord.ID),
            { Status: { Value: "Picked Up" } }
        )
    )
);
// Refresh colAllBuildPlates so job card progress pills update
ClearCollect(colAllBuildPlates, BuildPlates);
Clear(colPickedUpPlates)
```

> 💡 This runs after the main payment Patch — it is additive and does not change weight, cost, or status logic. If no plates exist or none are checked, the `If(CountRows(...) > 0, ...)` guard skips the block entirely.

---

### Phase 6: Approval Modal Integration

Add an "Add Plates/Printers" button to the Approval Modal. When a job is approved, a default plate is auto-created using the student's requested printer.

#### Visual Layout Update

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Approve Logan A Bereziuk - REQ-00240                                [✕] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Performing Action As: *                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Pick your name                                                  ▼  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Est. Weight (grams): *              Est. Print Time (hours): *          │
│  ┌─────────────────────┐             ┌─────────────────────┐             │
│  │ 176                 │             │ 6                   │             │
│  └─────────────────────┘             └─────────────────────┘             │
│                                                                          │
│  Sliced On Computer: *                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Computer 1                                                      ▼  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Build Plates:  Default: 1 plate on Prusa MK4S (student's request)       │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │       [🖨 Add Plates/Printers]  (optional - for multi-plate jobs)  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                             [Cancel]    [✓ Approve]      │
└──────────────────────────────────────────────────────────────────────────┘
```

#### New Label: lblApprovePlatesInfo

| Property | Value |
|----------|-------|
| Text | `"Build Plates:  Default: 1 plate on " & Trim(If(Find("(", varSelectedItem.Printer.Value) > 0, Left(varSelectedItem.Printer.Value, Find("(", varSelectedItem.Printer.Value) - 2), varSelectedItem.Printer.Value)) & " (student's request)"` |
| X | `recApproveModal.X + 20` |
| Y | `[below Computer dropdown]` |
| Width | `410` |
| Height | `20` |
| Size | `11` |
| Color | `varColorTextSecondary` |

#### New Button: btnApproveAddPlates

| Property | Value |
|----------|-------|
| Text | `"🖨 Add Plates/Printers"` |
| X | `recApproveModal.X + 20` |
| Y | `[below lblApprovePlatesInfo]` |
| Width | `200` |
| Height | `32` |
| Fill | `Color.White` |
| Color | `varColorPrimary` |
| HoverFill | `varColorPrimary` |
| HoverColor | `Color.White` |
| BorderColor | `varColorPrimary` |
| BorderThickness | `varInputBorderThickness` |

**OnSelect:**

```powerfx
// Open Build Plates modal (varSelectedItem already set from Approve button click)
Set(varShowBuildPlatesModal, varSelectedItem.ID);
// Load existing plates (if any)
ClearCollect(colBuildPlates,
    Sort(Filter(BuildPlates, RequestID = varSelectedItem.ID), ID, SortOrder.Ascending)
);
ClearCollect(colBuildPlatesIndexed,
    AddColumns(colBuildPlates, "PlateNum", CountRows(Filter(colBuildPlates, ID <= ThisRecord.ID)))
);
ClearCollect(colPrintersUsed,
    Distinct(Filter(BuildPlates, RequestID = varSelectedItem.ID), Machine.Value)
)
```

#### Update btnApproveConfirm.OnSelect

After the existing Patch operation, add logic to create a default plate if none exist:

```powerfx
// ... existing approval Patch and Flow C calls ...

// Create default plate if staff didn't configure any
If(CountRows(Filter(BuildPlates, RequestID = varSelectedItem.ID)) = 0,
    Patch(BuildPlates, Defaults(BuildPlates), {
        RequestID: varSelectedItem.ID,
        ReqKey: varSelectedItem.ReqKey,
        Machine: varSelectedItem.Printer,
        Status: {Value: "Queued"}
    })
);

// Refresh collections
ClearCollect(colAllBuildPlates, BuildPlates);

// ... existing close modal / reset logic ...
```

---

### Phase 7: Completion Gate Validation

The "Print Complete" button should be **disabled** until all plates are Completed or Picked Up. This prevents marking a job complete while prints are still running.

#### Update btnPrintComplete DisplayMode

```powerfx
// btnPrintComplete.DisplayMode (in Job Card)
If(
    // Check if job has plates
    CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID)) > 0,
    // If plates exist, all must be Completed or Picked Up
    If(
        CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Not(Status.Value in ["Completed", "Picked Up"]))) > 0,
        DisplayMode.Disabled,
        DisplayMode.Edit
    ),
    // If no plates, allow completion (legacy behavior)
    DisplayMode.Edit
)
```

#### Add Tooltip/Helper Text

When the button is disabled due to incomplete plates, show a hint:

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblCompletePlatesHint` |
| Text | `Text(CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Not(Status.Value in ["Completed", "Picked Up"])))) & " plate(s) still printing"` |
| Visible | `ThisItem.Status.Value = "Printing" && CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Not(Status.Value in ["Completed", "Picked Up"]))) > 0` |
| Color | `varColorWarning` |
| Size | `9` |

#### Update Complete Modal — Auto-Populate ActualPrinter

When the Complete Modal opens, auto-populate `ActualPrinter` from the job's plates:

```powerfx
// In btnPrintComplete.OnSelect (before opening modal)
// Collect distinct printers from plates for this job
ClearCollect(colActualPrinters,
    Distinct(Filter(BuildPlates, RequestID = ThisItem.ID), Machine.Value)
);
Set(varShowCompleteModal, ThisItem.ID)
```

In the Complete Modal, `ActualPrinter` is displayed as read-only (not a dropdown):

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblActualPrinters` |
| Text | `"Printers used: " & Concat(colActualPrinters, Trim(If(Find("(", Result) > 0, Left(Result, Find("(", Result) - 2), Result)), ", ")` |

The actual Patch sets `ActualPrinter` as a multi-select value from the plates.

---

## Testing Scenarios

### Scenario 1: Default Plate on Approval

1. Open Approval Modal for a Pending job (student requested "Prusa MK4S")
2. **Verify:** "Build Plates" section shows "Default: 1 plate on Prusa MK4S (student's request)"
3. Fill in weight, hours, computer → click "Approve" (without clicking "Add Plates/Printers")
4. **Verify:** Job moves to "Ready to Print"
5. **Verify:** BuildPlates list has 1 record with Machine = "Prusa MK4S", Status = "Queued"
6. **Verify:** Job card shows "0/1 done" (derived from BuildPlates count)
7. **Verify:** Job card shows "Using: MK4S"

### Scenario 2: Multi-Plate Setup via Approval Modal

1. Open Approval Modal for a Pending job
2. Click "Add Plates/Printers" → Build Plates Modal opens
3. Set Total Plates = 5
4. Add Prusa MK4S → add 3 plates under it
5. Add Prusa XL → add 2 plates under it
6. Click "Done" → back to Approval Modal
7. **Verify:** Build Plates section now shows "5 plates on 2 printers (MK4S, XL)"
8. Click "Approve"
9. **Verify:** BuildPlates list has 5 records
10. **Verify:** Job card shows "0/5 done · Using: MK4S, XL"

### Scenario 3: Advance Plate Statuses

1. Open Build Plates modal for a job with 5 plates (all Queued)
2. Click "▶ Printing" on Plate 1 and Plate 2
3. **Verify:** Status badges change to "Printing" (yellow)
4. Click "✓ Done" on Plate 1
5. **Verify:** Status badge changes to "Completed" (green)
6. **Verify:** Progress shows "1 of 5 Completed"
7. **Verify:** Job card shows "1/5 done"

### Scenario 4: Completion Gate — Plates Not Done

1. Job has 5 plates: 3 Completed, 2 still Printing
2. **Verify:** "Print Complete" button is **disabled** on job card
3. **Verify:** Helper text shows "2 plate(s) still printing"
4. Mark remaining 2 plates as Completed
5. **Verify:** "Print Complete" button becomes **enabled**

### Scenario 5: Completion Gate — With Partial Pickup

1. Job has 5 plates: 2 Picked Up (student already collected), 3 Completed
2. **Verify:** "Print Complete" button is **enabled** (Picked Up counts as done)
3. Click "Print Complete" → Complete Modal opens
4. **Verify:** ActualPrinter shows "Printers used: MK4S, XL" (read-only, auto-populated)
5. Confirm completion
6. **Verify:** Job status = "Completed", ActualPrinter = [MK4S, XL]

### Scenario 6: Remove Any Plate (Full Flexibility)

1. Open Build Plates modal with plates in various statuses
2. Click "✕" on a **Queued** plate → **Verify:** Removed
3. Click "✕" on a **Printing** plate → **Verify:** Removed
4. Click "✕" on a **Completed** plate → **Verify:** Removed
5. **Verify:** Plate count decreases after each removal
6. **Verify:** "✕" button is visible on ALL plates regardless of status

### Scenario 7: Scrap and Re-slice Workflow

1. Job has 4 plates: 2 Completed, 2 Printing
2. Print fails — need to re-slice everything
3. Open Build Plates modal
4. Remove all 4 plates (including Completed ones)
5. **Verify:** All plates removed, progress shows "0 of 0 Completed"
6. Add new plates with different configuration
7. **Verify:** New plates appear, job can continue fresh

### Scenario 8: Partial Pickup via Payment Modal

1. Job has 5 plates: 3 Completed, 2 still Printing
2. Student comes to pick up the completed pieces
3. Click "Partial Payment" → Payment Modal opens
4. **Verify:** "Plates being picked up" shows 3 checkboxes (only Completed plates)
5. Check all 3 boxes, enter weight and transaction number
6. Click confirm
7. **Verify:** 3 plates updated to "Picked Up"
8. **Verify:** Job card shows "3/5 done" (Picked Up plates count as done)

### Scenario 9: Resin Job Printer Filter

1. Open Build Plates modal for a Resin request
2. **Verify:** "Add Printer" dropdown shows only "Form 3"
3. Add Form 3 → add plates
4. **Verify:** All plates have Machine = "Form 3"

### Scenario 10: Machine Edit on Queued/Printing Plate

1. Create a plate with Machine = MK4S, Status = Queued
2. **Verify:** Machine dropdown is enabled
3. Change Machine from MK4S to XL
4. **Verify:** Plate now shows Machine = XL
5. Mark plate as Printing
6. **Verify:** Machine dropdown still enabled
7. Change Machine from XL to MK3S
8. **Verify:** Plate shows Machine = MK3S
9. Mark plate as Completed
10. **Verify:** Machine dropdown is now disabled (locked)

---

## Implementation Priority

### Phase 1: SharePoint (Do First)

1. Create `BuildPlates` list with 4 columns
2. Change `ActualPrinter` column to **multi-select** (see SharePoint doc)

Both can be done immediately with no app changes.

### Phase 2: Staff Dashboard — Core Build Plates

1. Add `BuildPlates` data connection
2. Update `App.OnStart` (new variables, collections)
3. Build `conBuildPlatesModal` with grouped-by-printer UI
4. Add Build Plates row to job card (above Details section)

### Phase 3: Staff Dashboard — Approval Modal Integration

5. Update Approval Modal — add "Add Plates/Printers" button
6. Update Approval Modal — auto-create default plate on approve

### Phase 4: Staff Dashboard — Completion & Payment

7. Add completion gate validation (disable Complete button if plates incomplete)
8. Update Complete Modal — auto-populate ActualPrinter from plates
9. Update Payment Modal — plate pickup checkboxes
10. Update `btnPaymentConfirm.OnSelect` to patch picked-up plates

---

## Related Spec Sections

- **Staff Dashboard App.OnStart:** `StaffDashboard-App-Spec.md` Step 3
- **Job Card Template:** `StaffDashboard-App-Spec.md` Step 7
- **Approval Modal:** `StaffDashboard-App-Spec.md` Step 11
- **Complete Confirmation Modal:** `StaffDashboard-App-Spec.md` Step 12A
- **Payment Recording Modal:** `StaffDashboard-App-Spec.md` Step 12C
- **SharePoint PrintRequests List:** `SharePoint/PrintRequests-List-Setup.md`
- **SharePoint ActualPrinter (multi-select):** `SharePoint/PrintRequests-List-Setup.md` Step 4C
- **BuildPlates List:** Create new list per SharePoint Schema Changes section above
- **Printer Verification Integration:** `PowerApps/StaffDashboard-App-Spec.md` → Step 12A Enhancement

---

*Last Updated: March 17, 2026*
