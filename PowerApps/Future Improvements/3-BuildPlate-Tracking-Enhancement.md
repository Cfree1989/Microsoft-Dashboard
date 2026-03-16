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

Add a lightweight `BuildPlates` sub-list (one row per gcode file) linked to `PrintRequests`, plus a `TotalBuildPlates` field on the parent request. The Staff Dashboard gets a **Build Plates modal** to manage plate records and a **plate pickup checklist** inside the existing Payment Modal.

```
PrintRequests (1 record)
└── BuildPlates (many records — one per gcode file)
    ├── Machine: Prusa MK4S / XL / Raised3D / Form 3
    └── Status: Queued → Printing → Completed → Picked Up
```

Weight and cost recording stays exactly as-is — staff weighs whatever is being picked up and enters the combined weight. No per-plate cost calculation is added.

### Relationship to ActualPrinter

If **Printer Verification Enhancement** (Document 1) is also implemented, `ActualPrinter` on `PrintRequests` records the printer used at completion time. For multi-plate jobs:

| Scenario | ActualPrinter Behavior |
|----------|------------------------|
| Single plate | Set to the machine that plate ran on (normal case) |
| Multiple plates, same machine | Set to that machine |
| Multiple plates, different machines | Set to the **primary** machine (the one with the most plates, or staff's judgment call) |

The `BuildPlates` list provides full granularity — every plate's machine is recorded individually. `ActualPrinter` remains a single-value summary field for high-level reporting. Staff who need per-machine utilization data should query `BuildPlates` directly.

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

### New Field on `PrintRequests`: `TotalBuildPlates`

Add one column to the existing `PrintRequests` list:

| Column Name | Type | Required | Default | Description |
|-------------|------|----------|---------|-------------|
| `TotalBuildPlates` | Number | No | 0 | Total gcode files sliced for this request |

**Setup:**
1. Click **+ Add column** → **Number**
2. **Name:** `TotalBuildPlates`
3. **Number of decimal places:** 0
4. **Default value:** 0
5. Click **Save**

> 💡 This drives the denominator in plate labels ("1/**4**", "2/**4**"). Set once at slicing time. May be set before all individual plate rows are created in `BuildPlates`.

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

### Phase 3: Job Card — Progress Pill and Build Plates Button

Both controls are added inside `galJobCards`.

#### Progress Pill (lblBuildPlatesProgress)

A small read-only label in the top-right corner of the card. Visible only when `TotalBuildPlates > 0`.

| Property | Value |
|----------|-------|
| Control | Text label |
| Name | `lblBuildPlatesProgress` |
| Text | `Text(CountRows(Filter(colAllBuildPlates, RequestID = ThisItem.ID, Or(Status.Value = "Completed", Status.Value = "Picked Up")))) & "/" & Text(ThisItem.TotalBuildPlates) & " done"` |
| X | `Parent.TemplateWidth - 90` |
| Y | `8` |
| Width | `78` |
| Height | `20` |
| Size | `9` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorSuccess` |
| Align | `Align.Right` |
| Visible | `ThisItem.TotalBuildPlates > 0` |

> 💡 Uses `colAllBuildPlates` (pre-loaded at startup) — not a live `Filter(BuildPlates, ...)` call — to avoid delegation warnings inside a gallery loop.

#### Build Plates Button (btnBuildPlates)

A full-width button at `Y = 396`, between the utility row (Y=360) and the primary action row (Y=446 after the height increase).

| Property | Value |
|----------|-------|
| Control | Button |
| Name | `btnBuildPlates` |
| Text | `"🖨 Build Plates"` |
| X | `12` |
| Y | `396` |
| Width | `Parent.TemplateWidth - 24` |
| Height | `varBtnHeight` |
| Fill | `Color.White` |
| Color | `varColorPrimary` |
| HoverColor | `Color.White` |
| HoverFill | `varColorPrimary` |
| PressedFill | `ColorFade(varColorPrimary, -15%)` |
| BorderColor | `varColorPrimary` |
| BorderThickness | `varInputBorderThickness` |
| RadiusTopLeft | `varBtnBorderRadius` |
| RadiusTopRight | `varBtnBorderRadius` |
| RadiusBottomLeft | `varBtnBorderRadius` |
| RadiusBottomRight | `varBtnBorderRadius` |
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| Visible | `!varBatchSelectMode && (ThisItem.Status.Value = "Ready to Print" \|\| ThisItem.Status.Value = "Printing" \|\| ThisItem.Status.Value = "Completed")` |

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

#### Control Hierarchy

```
scrDashboard
└── conBuildPlatesModal              ← CONTAINER (Visible = varShowBuildPlatesModal > 0)
    ├── recBuildPlatesOverlay        ← Full-screen dark overlay
    ├── recBuildPlatesModal          ← White box (600×620)
    ├── lblBuildPlatesTitle          ← "Build Plates — Jane Smith · REQ-00042"
    ├── btnBuildPlatesClose          ← ✕ top-right
    ├── recBuildPlatesDivider1       ← Divider under title
    ├── lblTotalSlicedLabel          ← "Total Sliced:"
    ├── txtTotalSliced               ← Number input (pre-filled from TotalBuildPlates)
    ├── btnSetTotalSliced            ← Saves to PrintRequests
    ├── lblBuildPlatesProgressModal  ← "2 of 4 Completed"
    ├── recBuildPlatesDivider2       ← Divider above gallery
    ├── galBuildPlates               ← One row per plate
    │   ├── recPlateRowBg            ← Alternating row tint
    │   ├── lblPlateLabel            ← "1/4", "2/4" etc.
    │   ├── lblPlateMachine          ← "Prusa MK4S"
    │   ├── lblPlateStatus           ← Colored status badge
    │   ├── btnMarkPrinting          ← Queued → Printing
    │   ├── btnMarkDone              ← Printing → Completed
    │   └── btnRemovePlate           ← ✕ (Queued only)
    ├── recBuildPlatesDivider3       ← Divider above Add section
    ├── lblAddPlateHeader            ← "Add plate:"
    ├── ddBuildPlatesMachine         ← Machine dropdown (filtered by Method)
    ├── btnBuildPlatesAdd            ← "+ Add Plate"
    └── btnBuildPlatesDone           ← "Done"
```

#### Visual Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Build Plates — Jane Smith · REQ-00042                    [✕]│
│  ────────────────────────────────────────────────────────── │
│  Total Sliced: [ 4 ]  [Set]              2 of 4 Completed   │
│  ────────────────────────────────────────────────────────── │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1/4  Prusa MK4S        ● Queued      [▶ Printing]  [✕]│  │
│  │ 2/4  Prusa MK4S        ● Printing    [✓ Done]         │  │
│  │ 3/4  Prusa MK4S        ● Completed                    │  │
│  │ 4/4  Prusa XL          ● Completed                    │  │
│  └────────────────────────────────────────────────────────┘  │
│  ────────────────────────────────────────────────────────── │
│  Add plate:  [ Prusa MK4S (9.8×8.3×8.7in)          ▼ ]      │
│              [ + Add Plate ]                                  │
│                                                    [ Done ]  │
└──────────────────────────────────────────────────────────────┘
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

#### Total Sliced Input (txtTotalSliced)

| Property | Value |
|----------|-------|
| Default | `Text(varSelectedItem.TotalBuildPlates)` |
| X | `recBuildPlatesModal.X + 124` |
| Y | `recBuildPlatesModal.Y + 66` |
| Width | `60` |
| Height | `28` |
| Size | `11` |
| Font | `varAppFont` |
| BorderColor | `varInputBorderColor` |
| BorderThickness | `varInputBorderThickness` |
| Format | `TextInputFormat.Number` |
| HintText | `"0"` |

#### Set Button (btnSetTotalSliced)

| Property | Value |
|----------|-------|
| Text | `"Set"` |
| X | `recBuildPlatesModal.X + 192` |
| Y | `recBuildPlatesModal.Y + 66` |
| Width | `50` |
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
| Size | `varBtnFontSize` |
| Font | `varAppFont` |
| FocusedBorderThickness | `varFocusedBorderThickness` |
| DisplayMode | `If(IsBlank(txtTotalSliced.Text) \|\| !IsNumeric(txtTotalSliced.Text), DisplayMode.Disabled, DisplayMode.Edit)` |

**OnSelect:**

```powerfx
Patch(PrintRequests,
    LookUp(PrintRequests, ID = varSelectedItem.ID),
    { TotalBuildPlates: Value(txtTotalSliced.Text) }
);
// Refresh varSelectedItem so the progress label updates immediately
Set(varSelectedItem, LookUp(PrintRequests, ID = varSelectedItem.ID));
// Refresh colAllBuildPlates so job card progress pills stay current
ClearCollect(colAllBuildPlates, BuildPlates);
Notify("Total updated.", NotificationType.Success)
```

#### Progress Label (lblBuildPlatesProgressModal)

| Property | Value |
|----------|-------|
| Text | `Text(CountRows(Filter(colBuildPlatesIndexed, Or(Status.Value = "Completed", Status.Value = "Picked Up")))) & " of " & Text(If(varSelectedItem.TotalBuildPlates > 0, varSelectedItem.TotalBuildPlates, CountRows(colBuildPlatesIndexed))) & " Completed"` |
| X | `recBuildPlatesModal.X + 260` |
| Y | `recBuildPlatesModal.Y + 66` |
| Width | `320` |
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
| Text | `Text(ThisItem.PlateNum) & "/" & Text(If(varSelectedItem.TotalBuildPlates > 0, varSelectedItem.TotalBuildPlates, CountRows(colBuildPlatesIndexed)))` |
| X | `8` |
| Y | `0` |
| Width | `40` |
| Height | `Parent.TemplateHeight` |
| Size | `11` |
| FontWeight | `FontWeight.Semibold` |
| Font | `varAppFont` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

##### Machine Label (lblPlateMachine) — inside template

Strips the dimensions from the choice value for brevity ("Prusa MK4S" instead of "Prusa MK4S (9.8×8.3×8.7in)"):

| Property | Value |
|----------|-------|
| Text | `Trim(If(Find("(", ThisItem.Machine.Value) > 0, Left(ThisItem.Machine.Value, Find("(", ThisItem.Machine.Value) - 2), ThisItem.Machine.Value))` |
| X | `52` |
| Y | `0` |
| Width | `160` |
| Height | `Parent.TemplateHeight` |
| Size | `10` |
| Font | `varAppFont` |
| Color | `varColorText` |
| VerticalAlign | `VerticalAlign.Middle` |

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

> 💡 **Method filter:** Filament jobs show MK4S, XL, and Raised3D. Resin jobs show only Form 3. Uses the same filter pattern as `ddCompletePrinter` in the Printer Verification Enhancement (Document 1).

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
| Text | `Text(ThisItem.PlateNum) & "/" & Text(If(varSelectedItem.TotalBuildPlates > 0, varSelectedItem.TotalBuildPlates, CountRows(colBuildPlatesIndexed))) & "  ·  " & Trim(If(Find("(", ThisItem.Machine.Value) > 0, Left(ThisItem.Machine.Value, Find("(", ThisItem.Machine.Value) - 2), ThisItem.Machine.Value))` |
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

## Testing Scenarios

### Scenario 1: Single-Plate Job (No Change to Existing Flow)

1. Open a Completed job with no BuildPlates records
2. Click "Picked Up" to open the Payment Modal
3. **Verify:** The "Plates being picked up" section is hidden (no completed plates exist)
4. Record payment as normal
5. **Verify:** Payment records correctly; no BuildPlates errors

### Scenario 2: Set Up Build Plates for a New Job

1. Open a "Ready to Print" job card
2. **Verify:** "🖨 Build Plates" button is visible
3. Click it → modal opens
4. Type `4` in Total Sliced → click "Set" → **Verify:** progress label reads "0 of 4 Completed"; job card pill shows "0/4 done"
5. Select "Prusa MK4S (9.8×8.3×8.7in)" → click "+ Add Plate" three times
6. Select "Prusa XL (14.2×14.2×14.2in)" → click "+ Add Plate" once
7. **Verify:** Gallery shows 4 rows labeled 1/4, 2/4, 3/4, 4/4 with correct machine names

### Scenario 3: Advance Plate Statuses

1. With 4 plates in gallery (all Queued):
2. Click "▶ Printing" on plates 1/4 and 2/4
3. **Verify:** Status badge changes to "Printing" (yellow); "✓ Done" button appears; "▶ Printing" disappears
4. Click "✓ Done" on plate 2/4
5. **Verify:** Status badge changes to "Completed" (green); both action buttons disappear
6. **Verify:** Progress label reads "1 of 4 Completed"

### Scenario 4: Partial Pickup via Payment Modal

1. Open a Printing job with 2 Completed and 2 Printing plates
2. Click "Partial Payment" → Payment Modal opens
3. **Verify:** "Plates being picked up" section shows 2 checkboxes (only Completed plates)
4. Check both boxes
5. Enter weight and transaction number → click confirm
6. **Verify:** Both checked plates updated to "Picked Up" in SharePoint
7. **Verify:** Job card pill shows "2/4 done"

### Scenario 5: Resin Job Machine Filter

1. Open the Build Plates modal for a Resin request
2. **Verify:** Machine dropdown shows only "Form 3 (5.7×5.7×7.3in)"
3. Confirm "+ Add Plate" creates a plate with Machine = "Form 3..."

### Scenario 6: Remove a Queued Plate

1. Open Build Plates modal with a Queued plate
2. Click "✕" on the Queued row
3. **Verify:** Row removed; plate count decreases
4. **Verify:** "✕" is NOT visible on Printing or Completed rows

### Scenario 7: Card Height and Button Layout

1. Open the Staff Dashboard — no errors on load
2. **Verify:** "🖨 Build Plates" button is visible on Ready to Print, Printing, and Completed cards
3. **Verify:** Button is NOT visible on Uploaded, Pending, Rejected, Archived cards
4. **Verify:** Primary action buttons (Approve, Start Print, Complete, Picked Up) are still positioned at the bottom of each card with correct spacing

---

## Implementation Priority

### Phase 1: SharePoint (Do First)

1. Create `BuildPlates` list with 4 columns
2. Add `TotalBuildPlates` column to `PrintRequests`

Both can be done immediately with no app changes.

### Phase 2: Staff Dashboard (When Updating App)

1. Add `BuildPlates` data connection
2. Update `App.OnStart` (new variables, collections, card height)
3. Add progress pill and Build Plates button to job card
4. Build `conBuildPlatesModal` and all child controls
5. Update Payment Modal button `OnSelect` to load plates
6. Add plate pickup gallery inside `conPaymentModal`
7. Update `btnPaymentConfirm.OnSelect` to patch picked-up plates

---

## Related Spec Sections

- **Staff Dashboard App.OnStart:** `StaffDashboard-App-Spec.md` Step 3
- **Job Card Template:** `StaffDashboard-App-Spec.md` Step 7
- **Payment Recording Modal:** `StaffDashboard-App-Spec.md` Step 12C
- **SharePoint PrintRequests List:** `SharePoint/PrintRequests-List-Setup.md` Step 4C
- **BuildPlates List:** `SharePoint/BuildPlates-List-Setup.md` *(create this list first)*
- **Printer Verification (machine choice values, ActualPrinter integration):** `PowerApps/Future Improvements/1-Printer-Verification-Enhancement.md`

---

*Last Updated: March 16, 2026*
