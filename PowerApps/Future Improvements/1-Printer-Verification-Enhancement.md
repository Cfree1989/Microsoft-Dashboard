# Printer Verification Enhancement

**Status:** Future Enhancement  
**Priority:** Medium  
**Dependencies:** Complete Confirmation Modal (Step 12B)

---

## Problem Statement

### Current Behavior

When staff marks a print job complete in the Complete Confirmation Modal, the system captures:
- `Status` - Set to "Completed"
- `LastActionBy` - The staff member performing the action
- `Printer` - The printer the **student originally selected** when submitting the request

### The Gap

Students submit print requests without always knowing which printer is most appropriate. In practice:
- Students frequently guess or select any available printer at submission time
- Staff assigns the job to whichever machine is actually free and appropriate
- The **Change Details Modal** exists to correct the printer field, but staff rarely use it before marking a job complete
- When "Print Complete" is confirmed, `Printer` still holds the student's original guess — not the machine the job actually ran on

### Data Quality Impact

The `Printer` field is currently doing double duty — it records both the student's original request and (ideally) the actual machine used. Because staff don't reliably update it, the field is unreliable for reporting:

| Need | Current Source | Problem |
|------|----------------|---------|
| What printer did the student request? | `Printer` | Works, but gets overwritten when staff corrects it |
| What printer was actually used? | `Printer` | Unreliable — often still the student's original guess |
| Printer utilization reporting | `Printer` | Inaccurate data makes utilization tracking impossible |

---

## Proposed Solution

### Two-Part Fix

**Part 1 — Separate the fields.** Add a new `ActualPrinter` choice column to `PrintRequests`. The original `Printer` field stays as the student's request (read-only after submission). `ActualPrinter` records what was truly used, set at completion time.

**Part 2 — Require printer confirmation at completion.** Add a required printer dropdown to the existing Complete Confirmation Modal. Staff is already stopping in that modal to select their name — adding printer confirmation at the same moment is natural, low-friction, and ensures every completed job has an accurate printer record.

### Default Behavior

- `ddCompletePrinter` pre-selects the printer already on the record (`varSelectedItem.Printer`)
- If the student guessed correctly, staff just confirms the pre-selected value — one extra tap
- If the student guessed wrong, staff corrects it before confirming — same single interaction

---

## SharePoint Schema Changes

Add one new column to the `PrintRequests` list:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| `ActualPrinter` | Choice | No | The printer the job was actually printed on; set at completion time |

### ActualPrinter Column Choices

Use the same four options as the existing `Printer` column:

- Prusa MK4S (9.8×8.3×8.7in)
- Prusa XL (14.2×14.2×14.2in)
- Raised3D Pro 2 Plus (12.0×12.0×23in)
- Form 3 (5.7×5.7×7.3in)

### SharePoint Column Setup

1. Open the `PrintRequests` list → **+ Add column** → **Choice**
2. **Name:** `ActualPrinter`
3. **Description:** `The printer this job was actually printed on, confirmed by staff at completion`
4. **Choices:** (same four as above)
5. **Require that this column contains information:** No (column is blank until completion)
6. Click **Save**

### Field Relationship

| Field | Set By | When | Purpose |
|-------|--------|------|---------|
| `Printer` | Student (at submission) | Form submission | Records original printer request; never changed |
| `ActualPrinter` | Staff (at completion) | Mark Complete modal | Records actual machine used |

This separation allows future reporting on how often student selections match actual usage — useful for understanding student behavior and informing printer labeling or documentation.

### Integration with Build Plate Tracking

If **Build Plate Tracking Enhancement** (Document 3) is also implemented, jobs may span multiple printers via the `BuildPlates` sub-list. In that case:

- `ActualPrinter` remains a single-value field — set to the **primary** machine (the one with the most plates, or staff's judgment)
- `BuildPlates.Machine` provides per-plate granularity for detailed utilization reporting
- Both fields should use the same choice values to ensure consistency

For single-plate jobs (the common case), `ActualPrinter` and the single plate's `Machine` will match.

---

## Complete Modal UI Changes

### Layout Comparison

**Before** (500×260px):
```
┌────────────────────────────────────────────────────┐
│  Mark Jane Smith Complete - REQ-00042              │
│                                                    │
│  ⚠️ Marking this print complete will immediately   │
│  send a pickup notification email...               │
│                                                    │
│  Performing Action As: *                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Pick your name                              │   │
│  └─────────────────────────────────────────────┘   │
│                                         [Cancel]  [✓ Confirm Complete] │
└────────────────────────────────────────────────────┘
```

**After** (500×370px):
```
┌────────────────────────────────────────────────────┐
│  Mark Jane Smith Complete - REQ-00042              │
│                                                    │
│  ⚠️ Marking this print complete will immediately   │
│  send a pickup notification email...               │
│                                                    │
│  Performing Action As: *                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Pick your name                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  Printed On: *                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Prusa MK4S (9.8×8.3×8.7in)          ▼      │   │
│  └─────────────────────────────────────────────┘   │
│  (pre-filled with student's requested printer)     │
│                                         [Cancel]  [✓ Confirm Complete] │
└────────────────────────────────────────────────────┘
```

### Container Resize

Update `recCompleteModal`:

| Property | Before | After |
|----------|--------|-------|
| `Height` | `260` | `370` |

### New Controls

#### Label: lblCompletePrinterLabel

Add after `ddCompleteStaff`:

| Property | Value |
|----------|-------|
| Control Type | Label |
| Text | `"Printed On: *"` |
| Font | `varAppFont` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorText` |
| Height | `20` |
| Size | `12` |
| Width | `200` |
| X | `recCompleteModal.X + 20` |
| Y | `recCompleteModal.Y + 225` |

#### ComboBox: ddCompletePrinter

| Property | Value |
|----------|-------|
| Control Type | Classic/ComboBox |
| Items | `Filter(Choices([@PrintRequests].ActualPrinter), If(varSelectedItem.Method.Value = "Filament", Value in ["Prusa MK4S (9.8×8.3×8.7in)", "Prusa XL (14.2×14.2×14.2in)", "Raised3D Pro 2 Plus (12.0×12.0×23in)"], varSelectedItem.Method.Value = "Resin", Value = "Form 3 (5.7×5.7×7.3in)", true))` |
| DefaultSelectedItems | `Filter(Choices([@PrintRequests].ActualPrinter), Value = varSelectedItem.Printer.Value)` |
| InputTextPlaceholder | `"Select printer used"` |
| DisplayFields | `["Value"]` |
| SearchFields | `["Value"]` |
| Height | `36` |
| Width | `460` |
| X | `recCompleteModal.X + 20` |
| Y | `recCompleteModal.Y + 250` |
| Font | `varAppFont` |
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

> Note: `DefaultSelectedItems` pre-selects the student's originally requested printer. Staff must actively confirm or change it before the Confirm button unlocks.

### Updated Button Positions

Move both buttons down by **110px** to clear the new controls:

#### btnCompleteCancel

| Property | Before | After |
|----------|--------|-------|
| Y | `recCompleteModal.Y + 200` | `recCompleteModal.Y + 310` |

#### btnCompleteConfirm

| Property | Before | After |
|----------|--------|-------|
| Y | `recCompleteModal.Y + 200` | `recCompleteModal.Y + 310` |

### Updated DisplayMode (Confirm Button)

Block the Confirm button until **both** the staff name and printer are selected:

```powerfx
// btnCompleteConfirm DisplayMode — Before
If(IsBlank(ddCompleteStaff.Selected), DisplayMode.Disabled, DisplayMode.Edit)

// btnCompleteConfirm DisplayMode — After
If(
    IsBlank(ddCompleteStaff.Selected) || IsBlank(ddCompletePrinter.Selected),
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```

### Updated Patch Operation

Add `ActualPrinter` to the `Patch` call in `btnCompleteConfirm.OnSelect`:

```powerfx
Patch(PrintRequests, LookUp(PrintRequests, ID = varSelectedItem.ID), {
    Status: LookUp(Choices(PrintRequests.Status), Value = "Completed"),
    ActualPrinter: {Value: ddCompletePrinter.Selected.Value},
    LastAction: LookUp(Choices(PrintRequests.LastAction), Value = "Status Change"),
    LastActionBy: {
        Claims: "i:0#.f|membership|" & ddCompleteStaff.Selected.MemberEmail,
        Discipline: "",
        DisplayName: ddCompleteStaff.Selected.MemberName,
        Email: ddCompleteStaff.Selected.MemberEmail,
        JobTitle: "",
        Picture: ""
    },
    LastActionAt: Now()
});
```

### Updated Cancel / Reset Logic

Add `Reset(ddCompletePrinter)` to both the Cancel button and the post-confirm reset block:

```powerfx
// btnCompleteCancel.OnSelect — After
Set(varShowCompleteModal, 0);
Set(varSelectedItem, Blank());
Reset(ddCompleteStaff);
Reset(ddCompletePrinter)

// btnCompleteConfirm.OnSelect — post-patch reset block — After
// (placed after Flow C IfError block)
Set(varShowCompleteModal, 0);
Set(varSelectedItem, Blank());
Reset(ddCompleteStaff);
Reset(ddCompletePrinter)
```

---

## Audit Log Enhancement

### Conditional Printer Correction Note

When the selected printer differs from what was on the record, append a correction note to the Flow C audit log call:

```powerfx
// In btnCompleteConfirm.OnSelect, replace the existing Flow C call with:
IfError(
    'Flow-(C)-Action-LogAction'.Run(
        Text(varSelectedItem.ID),
        "Status Change",
        "Status",
        Concatenate(
            "Completed",
            If(
                ddCompletePrinter.Selected.Value <> varSelectedItem.Printer.Value,
                " (Printer corrected: " &
                    Trim(If(Find("(", varSelectedItem.Printer.Value) > 0,
                        Left(varSelectedItem.Printer.Value, Find("(", varSelectedItem.Printer.Value) - 2),
                        varSelectedItem.Printer.Value)) &
                " → " &
                    Trim(If(Find("(", ddCompletePrinter.Selected.Value) > 0,
                        Left(ddCompletePrinter.Selected.Value, Find("(", ddCompletePrinter.Selected.Value) - 2),
                        ddCompletePrinter.Selected.Value)) &
                ")",
                ""
            )
        ),
        ddCompleteStaff.Selected.MemberEmail
    ),
    Notify("Marked complete, but could not log to audit.", NotificationType.Warning),
    Notify("Marked as completed! Student will receive pickup email.", NotificationType.Success)
);
```

This produces audit log entries such as:
- Normal completion: `"Completed"`
- Corrected printer: `"Completed (Printer corrected: Prusa MK4S → Raised3D Pro 2 Plus)"`

---

## Printer Quick Reference

For physical labels on machines and for staff familiarity, printers can be referenced by number:

| # | Full Name | Method | Build Volume |
|---|-----------|--------|--------------|
| 1 | Prusa MK4S | Filament | 9.8×8.3×8.7in |
| 2 | Prusa XL | Filament | 14.2×14.2×14.2in |
| 3 | Raised3D Pro 2 Plus | Filament | 12.0×12.0×23in |
| 4 | Form 3 | Resin | 5.7×5.7×7.3in |

> Note: The printer numbers are a convenience reference for physical signage only. The implementation uses the full choice values as they exist in SharePoint — no schema changes are needed to support numbering.

If physical number labels are added to machines, consider updating the SharePoint choice values to include the number prefix (e.g., `"1 · Prusa MK4S (9.8×8.3×8.7in)"`) so the dropdown label matches what staff sees on the machine. This would require updating the choice values in the `Printer` and `ActualPrinter` columns and any hardcoded filter formulas in both the Student Portal and Staff Dashboard apps.

---

## Implementation Priority

### Phase 1: SharePoint Schema (Do Now)

1. Add `ActualPrinter` column (Choice, same 4 options as `Printer`)

This can be done immediately with no app changes. The column will be blank on all existing records until the UI is updated, but the schema is ready for when the modal is built.

### Phase 2: Complete Modal UI (When Updating App)

1. Resize `recCompleteModal` height from 260 to 370
2. Add `lblCompletePrinterLabel` and `ddCompletePrinter` controls
3. Move Cancel and Confirm buttons down 110px
4. Update `btnCompleteConfirm.DisplayMode` to require printer selection
5. Add `ActualPrinter` to the `Patch` call
6. Update reset logic in Cancel and post-confirm blocks
7. Update Flow C audit log call with conditional printer correction note

---

## Testing Scenarios

### Scenario 1: Student Picked the Correct Printer

1. Open Complete Confirmation Modal for a Printing item
2. `ddCompletePrinter` pre-selects the printer already on the record (e.g., "Prusa MK4S...")
3. Staff selects their name in `ddCompleteStaff`
4. Staff confirms the pre-selected printer — no change needed
5. Click "Confirm Complete"
6. **Verify:** `ActualPrinter` = "Prusa MK4S (9.8×8.3×8.7in)", `Status` = "Completed"
7. **Verify:** Audit log entry reads `"Completed"` (no correction note)

### Scenario 2: Student Picked the Wrong Printer

1. Open Complete Confirmation Modal for a Printing item (record shows "Prusa MK4S...")
2. `ddCompletePrinter` pre-selects "Prusa MK4S..."
3. Staff changes the dropdown to "Raised3D Pro 2 Plus..."
4. Staff selects their name and clicks "Confirm Complete"
5. **Verify:** `ActualPrinter` = "Raised3D Pro 2 Plus (12.0×12.0×23in)"
6. **Verify:** `Printer` still = "Prusa MK4S (9.8×8.3×8.7in)" (original request preserved)
7. **Verify:** Audit log entry reads `"Completed (Printer corrected: Prusa MK4S → Raised3D Pro 2 Plus)"`

### Scenario 3: Resin Job

1. Open Complete Confirmation Modal for a Resin Printing item
2. `ddCompletePrinter` should only show "Form 3 (5.7×5.7×7.3in)" as an option (filtered by Method)
3. Confirm it is the only available choice
4. Staff confirms and clicks "Confirm Complete"
5. **Verify:** `ActualPrinter` = "Form 3 (5.7×5.7×7.3in)"

### Scenario 4: Confirm Button Blocked Until Printer Selected

1. Open Complete Confirmation Modal
2. Select a name in `ddCompleteStaff` but do not select a printer
3. **Verify:** "Confirm Complete" button remains disabled
4. Select a printer in `ddCompletePrinter`
5. **Verify:** "Confirm Complete" button becomes active

### Scenario 5: Cancel Resets All Controls

1. Open Complete Confirmation Modal
2. Select a staff name and a printer
3. Click "Cancel"
4. Re-open the modal for the same item
5. **Verify:** Both `ddCompleteStaff` and `ddCompletePrinter` are blank (not carrying over previous selections)

---

## Related Spec Sections

- **Complete Confirmation Modal:** [`PowerApps/Components/CompleteConfirmationModal.yaml`](../Components/CompleteConfirmationModal.yaml)
- **Staff Dashboard — Job Card Complete Button:** `StaffDashboard-App-Spec.md` Step 11 (Line 2226)
- **Change Details Modal (printer filter logic reference):** `StaffDashboard-App-Spec.md` Step 12A (Lines 4302–5114)
- **SharePoint Schema:** `SharePoint/PrintRequests-List-Setup.md` Column 10 (Lines 230–241)
- **Flow C — Audit Log:** `PowerAutomate/Flow-(C)-Action-LogAction.md`
- **Build Plate Tracking (multi-printer job handling):** `PowerApps/Future Improvements/3-BuildPlate-Tracking-Enhancement.md`

---

*Last Updated: March 16, 2026*
