# Payer Tracking Enhancement

**Status:** Future Enhancement  
**Priority:** Medium  
**Dependencies:** Payment Modal (Step 12C)

---

## Problem Statement

### Current Behavior

When staff records a payment in the Payment Modal, the system captures:
- `TransactionNumber` - The TigerCASH/Check/Code reference
- `FinalCost` - The amount charged
- `Student.DisplayName` - The person who **submitted** the print request

### The Gap

Sometimes a third party pays for a student's print (friend, family member, boyfriend, etc.). In these cases:
- The **transaction** is under the payer's name/card
- But the **system** only knows about the original submitter
- Staff may verbally collect the payer's TigerCard for potential remote charging, but there's no structured field to store it

### Finance Requirements

The monthly TigerCASH report requires:

| Field | Current Source | Problem |
|-------|----------------|---------|
| Amount Charged | `FinalCost` | Works correctly |
| Person Charged | `Student.DisplayName` | **Wrong when someone else pays** |
| Transaction # | `TransactionNumber` | Works correctly |

---

## Proposed Solution

### SharePoint Schema Changes

Add two new columns to the `PrintRequests` list:

| Column Name | Type | Description |
|-------------|------|-------------|
| `PayerName` | Single line of text | Name of the person who actually paid |
| `PayerTigerCard` | Single line of text | TigerCard number of the payer (for remote charging) |

### Default Behavior

- `PayerName` defaults to `Student.DisplayName`
- `PayerTigerCard` defaults to the student's `TigerCardNumber`
- In most cases, the student pays for their own print and staff doesn't need to change anything

### Override Behavior

When someone else pays:
1. Staff unchecks "Payer is same as student"
2. The `PayerName` and `PayerTigerCard` fields become editable
3. Staff enters the actual payer's information
4. This data is stored separately from the student's info

---

## Payment Modal UI Changes

### New Controls

Add to the Payment Modal (Step 12C) between Student Info and Staff Dropdown:

```
┌─────────────────────────────────────────────────────┐
│  Record Payment - REQ-00042                         │
├─────────────────────────────────────────────────────┤
│  Student: Jane Smith                                │
│  Estimated: 115g → $11.50                           │
│                                                     │
│  ☑ Payer is same as student                         │
│                                                     │
│  Payer Name: *              Payer TigerCard:        │
│  ┌───────────────────┐      ┌───────────────────┐   │
│  │ Jane Smith        │      │ 1234567890        │   │
│  └───────────────────┘      └───────────────────┘   │
│  (auto-filled when checkbox is checked)             │
│                                                     │
│  Performing Action As: *    Payment Type: *         │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

### Control Specifications

#### Checkbox: chkPayerSameAsStudent

| Property | Value |
|----------|-------|
| Control Type | Checkbox |
| Text | `"Payer is same as student"` |
| Default | `true` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 100` |

#### Label: lblPayerNameLabel

| Property | Value |
|----------|-------|
| Text | `"Payer Name: *"` |
| Visible | `true` (always visible) |
| Color | `If(chkPayerSameAsStudent.Value, varColorTextMuted, varColorText)` |

#### Text Input: txtPayerName

| Property | Value |
|----------|-------|
| Default | `varSelectedItem.Student.DisplayName` |
| DisplayMode | `If(chkPayerSameAsStudent.Value, DisplayMode.Disabled, DisplayMode.Edit)` |
| Fill | `If(chkPayerSameAsStudent.Value, RGBA(245, 245, 245, 1), Color.White)` |

#### Label: lblPayerTigerCardLabel

| Property | Value |
|----------|-------|
| Text | `"Payer TigerCard:"` |
| Color | `If(chkPayerSameAsStudent.Value, varColorTextMuted, varColorText)` |

#### Text Input: txtPayerTigerCard

| Property | Value |
|----------|-------|
| Default | `varSelectedItem.TigerCardNumber` |
| DisplayMode | `If(chkPayerSameAsStudent.Value, DisplayMode.Disabled, DisplayMode.Edit)` |
| Fill | `If(chkPayerSameAsStudent.Value, RGBA(245, 245, 245, 1), Color.White)` |

### Patch Operation Update

Update the `btnPaymentConfirm.OnSelect` to include:

```powerfx
Patch(
    PrintRequests,
    LookUp(PrintRequests, ID = varSelectedItem.ID),
    {
        // ... existing fields ...
        PayerName: If(
            chkPayerSameAsStudent.Value,
            varSelectedItem.Student.DisplayName,
            txtPayerName.Text
        ),
        PayerTigerCard: If(
            chkPayerSameAsStudent.Value,
            varSelectedItem.TigerCardNumber,
            txtPayerTigerCard.Text
        )
    }
)
```

---

## Batch Payment Considerations

The Batch Payment Modal (Step 12E) should also capture payer information:

### Single Payer for Batch

When processing a batch (e.g., student picking up their own + friend's prints):
- Add the same `chkPayerSameAsStudent`, `txtPayerName`, `txtPayerTigerCard` controls
- The payer info applies to **all items in the batch**
- Each item's `PayerName` and `PayerTigerCard` are set to the same values

### UI Addition for Batch Modal

```
┌─────────────────────────────────────────────────────┐
│  Batch Payment - 3 Items                            │
├─────────────────────────────────────────────────────┤
│  Items: REQ-00042, REQ-00043, REQ-00044             │
│  Combined Weight: 180g                              │
│  Total Cost: $18.00                                 │
│                                                     │
│  ☐ Payer is same as students                        │
│     (Unchecked because items have different owners) │
│                                                     │
│  Payer Name: *              Payer TigerCard:        │
│  ┌───────────────────┐      ┌───────────────────┐   │
│  │                   │      │                   │   │
│  └───────────────────┘      └───────────────────┘   │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

### Batch Logic Note

For batch payments where items belong to different students:
- The checkbox defaults to **unchecked** (since there's no single "student")
- Staff must enter the payer's name (whoever is actually paying)
- Formula: `chkPayerSameAsStudent.Default = CountRows(Distinct(colBatchItems, Student.Email)) = 1`

---

## Report Export Feature

### Future Monthly Export

Once payer tracking is implemented, build a report export feature:

#### Query Pattern

```powerfx
// Filter paid items for the target month
Set(
    colMonthlyPayments,
    Filter(
        PrintRequests,
        Status.Value = "Paid & Picked Up" &&
        Month(PaymentDate) = varTargetMonth &&
        Year(PaymentDate) = varTargetYear
    )
);

// Export columns
ForAll(
    colMonthlyPayments,
    {
        PayerName: PayerName,
        Amount: FinalCost,
        TransactionNumber: TransactionNumber,
        PaymentDate: PaymentDate,
        PaymentType: // Extract from PaymentNotes or add dedicated field
        ProcessedBy: LastActionBy.DisplayName,
        StudentName: Student.DisplayName,
        ReqKey: ReqKey
    }
)
```

#### Export Format

Match the existing TigerCASH log format:

| Column | Source |
|--------|--------|
| Machine | `Method.Value` (Filament/Resin printer) |
| $/Unit | `varFilamentRate` or `varResinRate` |
| Unit Amount | `FinalWeight` |
| Cost | `FinalCost` |
| Payer | `PayerName` |
| Notes | `PaymentNotes` |
| Course Number | `CourseNumber` |
| Date | `PaymentDate` |
| Transaction Number | `TransactionNumber` |
| Processed By | `LastActionBy.DisplayName` |
| Status | `"Closed"` |

#### Export Options

1. **Power Automate Flow** - Trigger monthly, generate Excel, email to finance
2. **In-App Export Button** - Staff clicks button, downloads CSV/Excel
3. **Power BI Integration** - Direct connection for live reporting

---

## Implementation Priority

### Phase 1: SharePoint Schema (Do Now)

1. Add `PayerName` column (Single line of text)
2. Add `PayerTigerCard` column (Single line of text)

This can be done immediately with no app changes. The columns will be empty until the UI is updated, but the schema is ready.

### Phase 2: Payment Modal UI (When Updating App)

1. Add checkbox and payer input fields to Payment Modal
2. Update Patch operation to save payer info
3. Add reset logic for new controls

### Phase 3: Batch Payment Modal (After Phase 2)

1. Add same controls to Batch Payment Modal
2. Handle multi-student batch logic

### Phase 4: Report Export (Future)

1. Build report generation UI
2. Create Power Automate flow for monthly export
3. Test with finance team

---

## Testing Scenarios

### Scenario 1: Student Pays for Own Print

1. Open Payment Modal for a Completed item
2. Checkbox "Payer is same as student" is checked (default)
3. Payer fields show student's name and TigerCard (disabled)
4. Complete payment
5. **Verify:** `PayerName` = Student name, `PayerTigerCard` = Student's TigerCard

### Scenario 2: Third Party Pays

1. Open Payment Modal for a Completed item
2. Uncheck "Payer is same as student"
3. Payer fields become editable
4. Enter payer's name: "John Smith"
5. Enter payer's TigerCard: "9876543210"
6. Complete payment
7. **Verify:** `PayerName` = "John Smith", `PayerTigerCard` = "9876543210"

### Scenario 3: Batch Payment (Mixed Owners)

1. Select 3 items from different students
2. Open Batch Payment Modal
3. Checkbox is unchecked by default (multiple students)
4. Enter single payer's info
5. Process batch
6. **Verify:** All 3 items have same `PayerName` and `PayerTigerCard`

---

## Related Spec Sections

- **Payment Modal:** `StaffDashboard-App-Spec.md` Step 12C (Lines 4504-5480)
- **Batch Payment Modal:** `StaffDashboard-App-Spec.md` Step 12E (Lines 5881-6600)
- **SharePoint Schema:** `StudentForm-Instructions.md` Section 2

---

*Last Updated: March 3, 2026*
