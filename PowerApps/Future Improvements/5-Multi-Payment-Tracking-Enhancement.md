# Multi-Payment Tracking Enhancement

**Status:** Future Enhancement  
**Priority:** Critical ⚠️  
**Dependencies:** Payment Modal (Step 12C), Build Plate Tracking (Enhancement #3), Payer Tracking (Enhancement #2), Monthly Transaction Export (Enhancement #4)

> ⚠️ **URGENT:** The current system overwrites payment data when multiple payments occur for one job. Staff are already processing partial pickups, meaning **transaction data is being lost**. This enhancement should be implemented before or alongside Build Plate Tracking.

---

## Problem Statement

### Current Behavior

The `PrintRequests` list stores payment information in single-value fields:

| Field | Type | Current Behavior |
|-------|------|------------------|
| `TransactionNumber` | Single line of text | Stores ONE transaction reference |
| `FinalWeight` | Number | Stores ONE weight value |
| `FinalCost` | Currency | Stores ONE cost value |
| `PaymentDate` | Date | Stores ONE date |
| `PaymentType` | Choice | Stores ONE payment method |

When a payment is recorded, these fields are written. If a second payment occurs, the values are **overwritten** — the first transaction is lost.

### The Gap

With Build Plate Tracking, partial pickups become a supported workflow:

> Student has 5 plates. 3 finish on Day 1, student picks them up and pays $8.50 (TXN-44821). The remaining 2 finish on Day 2, student returns and pays $6.20 (TXN-44890).

**What finance needs:**
- Two separate transaction records
- Each with its own transaction number, amount, date
- One row per actual swipe in the monthly export

**What the current system captures:**
- Only the last payment ($6.20, TXN-44890)
- First payment ($8.50, TXN-44821) is lost

### Finance Requirement

The monthly TigerCASH report sent to finance must show **every transaction as it happened**:

| Date | Transaction # | Payer | Amount | Request |
|------|---------------|-------|--------|---------|
| 3/15 | TXN-44821 | Jane Smith | $8.50 | REQ-00042 |
| 3/16 | TXN-44890 | Jane Smith | $6.20 | REQ-00042 |

Not a single row with $14.70 total.

---

## Proposed Solution

### Overview

Create a `Payments` child list (same pattern as `BuildPlates`) to store each transaction separately. The `PrintRequests` list keeps running totals for quick display, but the authoritative transaction history lives in `Payments`.

```
PrintRequests (1 record)
├── FinalWeight: 147g              ← running total (sum of payments)
├── FinalCost: $14.70              ← running total (sum of payments)
└── Payments (many records)
    ├── Payment 1: 3/15, TXN-44821, 85g, $8.50, Plates 1-3
    └── Payment 2: 3/16, TXN-44890, 62g, $6.20, Plates 4-5
```

### Key Design Points

| Aspect | Design |
|--------|--------|
| **One row per transaction** | Each swipe/check/code entry = one `Payments` record |
| **Linked to job** | `RequestID` links to `PrintRequests.ID` |
| **Running totals** | `PrintRequests.FinalWeight` and `FinalCost` updated after each payment |
| **Plates linked** | Each payment records which plates were picked up |
| **Payer captured** | Integrates with Payer Tracking Enhancement |
| **Export source** | Monthly Transaction Export queries `Payments` list |

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  PAYMENT MODAL                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Weight: [85]g    Transaction: [TXN-44821]                  │ │
│  │  Plates: ☑ 1  ☑ 2  ☑ 3  ☐ 4  ☐ 5                           │ │
│  │                                          [Confirm Payment]  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. CREATE Payments record                                       │
│     RequestID: 42, Weight: 85, Amount: $8.50, Plates: "1,2,3"   │
│                                                                  │
│  2. UPDATE PrintRequests running totals                          │
│     FinalWeight += 85  →  85                                     │
│     FinalCost += $8.50  →  $8.50                                │
│                                                                  │
│  3. UPDATE BuildPlates status                                    │
│     Plates 1,2,3 → "Picked Up"                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SharePoint Schema

### New List: `Payments`

Create a new SharePoint list at the site root. No item-level permissions required (staff-only data).

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| `RequestID` | Number | Yes | — | Links to `PrintRequests.ID` |
| `ReqKey` | Single line of text | No | — | Request reference (REQ-00042) for easy identification |
| `TransactionNumber` | Single line of text | Yes | — | TigerCASH receipt, check number, or grant code |
| `Weight` | Number | Yes | — | Grams picked up in this transaction |
| `Amount` | Currency | Yes | — | Cost charged for this transaction |
| `PaymentType` | Choice | Yes | TigerCASH | TigerCASH / Check / Code |
| `PaymentDate` | Date and time | Yes | — | When payment was recorded |
| `PayerName` | Single line of text | No | — | Who paid (from Payer Tracking) |
| `PayerTigerCard` | Single line of text | No | — | Payer's TigerCard number |
| `PlatesPickedUp` | Single line of text | No | — | Plate numbers picked up (e.g., "1, 2, 3") |
| `RecordedBy` | Person | Yes | — | Staff member who processed payment |
| `StudentOwnMaterial` | Yes/No | No | No | 70% discount applied |

#### Column Setup Instructions

##### RequestID
1. Click **+ Add column** → **Number**
2. **Name:** `RequestID`
3. **Number of decimal places:** 0
4. **Require that this column contains information:** Yes
5. Click **Save**

##### ReqKey
1. Click **+ Add column** → **Single line of text**
2. **Name:** `ReqKey`
3. **Description:** `Request reference for easy identification`
4. Click **Save**

##### TransactionNumber
1. Click **+ Add column** → **Single line of text**
2. **Name:** `TransactionNumber`
3. **Description:** `TigerCASH receipt, check number, or grant/program code`
4. **Require that this column contains information:** Yes
5. Click **Save**

##### Weight
1. Click **+ Add column** → **Number**
2. **Name:** `Weight`
3. **Description:** `Grams picked up in this transaction`
4. **Number of decimal places:** 0
5. **Require that this column contains information:** Yes
6. Click **Save**

##### Amount
1. Click **+ Add column** → **Currency**
2. **Name:** `Amount`
3. **Description:** `Cost charged for this transaction`
4. **Currency format:** $ English (United States)
5. **Number of decimal places:** 2
6. **Require that this column contains information:** Yes
7. Click **Save**

##### PaymentType
1. Click **+ Add column** → **Choice**
2. **Name:** `PaymentType`
3. **Choices:**
   - TigerCASH
   - Check
   - Code
4. **Default value:** TigerCASH
5. **Require that this column contains information:** Yes
6. Click **Save**

##### PaymentDate
1. Click **+ Add column** → **Date and time**
2. **Name:** `PaymentDate`
3. **Include time:** No
4. **Require that this column contains information:** Yes
5. Click **Save**

##### PayerName
1. Click **+ Add column** → **Single line of text**
2. **Name:** `PayerName`
3. **Description:** `Name of person who paid`
4. Click **Save**

##### PayerTigerCard
1. Click **+ Add column** → **Single line of text**
2. **Name:** `PayerTigerCard`
3. **Description:** `TigerCard number of payer (for remote charging)`
4. Click **Save**

##### PlatesPickedUp
1. Click **+ Add column** → **Single line of text**
2. **Name:** `PlatesPickedUp`
3. **Description:** `Plate numbers collected in this transaction (e.g., "1, 2, 3")`
4. Click **Save**

##### RecordedBy
1. Click **+ Add column** → **Person**
2. **Name:** `RecordedBy`
3. **Description:** `Staff member who processed payment`
4. **Require that this column contains information:** Yes
5. Click **Save**

##### StudentOwnMaterial
1. Click **+ Add column** → **Yes/No**
2. **Name:** `StudentOwnMaterial`
3. **Description:** `Student provided own material (70% discount)`
4. **Default value:** No
5. Click **Save**

#### Permissions

Stop inheriting permissions. Keep staff/owner groups with full access. Remove any group that includes students.

---

### PrintRequests Field Changes

The existing payment fields on `PrintRequests` become **running totals** (computed from sum of `Payments`):

| Field | New Behavior |
|-------|--------------|
| `TransactionNumber` | **Deprecated** — kept for backward compatibility, but not updated for new payments |
| `FinalWeight` | Running total: `Sum(Payments where RequestID = this.ID, Weight)` |
| `FinalCost` | Running total: `Sum(Payments where RequestID = this.ID, Amount)` |
| `PaymentDate` | Date of **most recent** payment |
| `PaymentType` | **Deprecated** — each payment has its own type in `Payments` list |

> 💡 **Backward Compatibility:** Existing jobs with data in `TransactionNumber`/`FinalCost` continue to work. The system checks for `Payments` records first; if none exist, falls back to the legacy single-value fields.

---

## Staff Dashboard App Changes

### Phase 1: Add Data Connection

1. Open **Staff Dashboard** in Edit mode
2. Click the **Data** icon (left toolbar)
3. Click **+ Add data** → search for **Payments** → **Connect**

### Phase 2: App.OnStart Changes

Add collection for payments:

```powerfx
// === PAYMENT TRACKING ===
ClearCollect(colPayments, Blank());
Clear(colPayments);
```

### Phase 3: Payment Modal Updates

#### New: Payment History Section

Add a Payment History gallery **above** the payment input fields, showing all previous payments for this job:

```
┌──────────────────────────────────────────────────────────────────┐
│  Record Payment — Jane Smith · REQ-00042                     [✕] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Student: Jane Smith · jane.smith@lsu.edu                        │
│  Estimated: 147g → $14.70                                        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  PAYMENT HISTORY                                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  3/15  TXN-44821  85g  $8.50   Plates 1,2,3    Colin      │  │
│  │  (No more payments recorded)                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│  Paid so far: 85g · $8.50                                        │
│  Remaining estimate: ~62g · ~$6.20                               │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  RECORD NEW PAYMENT                                              │
│                                                                  │
│  Final Weight (grams): *        Transaction Number: *            │
│  ┌──────────────────────┐       ┌──────────────────────┐         │
│  │ 62                   │       │ TXN-44890            │         │
│  └──────────────────────┘       └──────────────────────┘         │
│                                                                  │
│  ☑ Payer is same as student                                      │
│  ...                                                             │
│                                                                  │
│  Plates being picked up:                                         │
│  ☑ Plate 4 · Prusa XL                                            │
│  ☑ Plate 5 · Prusa XL                                            │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                            [Cancel]  [Confirm]   │
└──────────────────────────────────────────────────────────────────┘
```

#### Control: galPaymentHistory

| Property | Value |
|----------|-------|
| Items | `Sort(Filter(Payments, RequestID = varSelectedItem.ID), PaymentDate, SortOrder.Ascending)` |
| X | `recPaymentModal.X + 20` |
| Y | `recPaymentModal.Y + 120` |
| Width | `560` |
| Height | `Min(120, CountRows(Filter(Payments, RequestID = varSelectedItem.ID)) * 32 + 8)` |
| TemplateSize | `30` |
| Visible | `CountRows(Filter(Payments, RequestID = varSelectedItem.ID)) > 0` |

##### Row Template (inside gallery)

| Control | Property | Value |
|---------|----------|-------|
| lblPaymentDate | Text | `Text(ThisItem.PaymentDate, "m/d")` |
| lblPaymentTxn | Text | `ThisItem.TransactionNumber` |
| lblPaymentWeight | Text | `Text(ThisItem.Weight) & "g"` |
| lblPaymentAmount | Text | `Text(ThisItem.Amount, "[$-en-US]$#,##0.00")` |
| lblPaymentPlates | Text | `"Plates " & ThisItem.PlatesPickedUp` |
| lblPaymentStaff | Text | `ThisItem.RecordedBy.DisplayName` |

#### Control: lblPaidSoFar

| Property | Value |
|----------|-------|
| Text | `"Paid so far: " & Text(Sum(Filter(Payments, RequestID = varSelectedItem.ID), Weight)) & "g · " & Text(Sum(Filter(Payments, RequestID = varSelectedItem.ID), Amount), "[$-en-US]$#,##0.00")` |
| Visible | `CountRows(Filter(Payments, RequestID = varSelectedItem.ID)) > 0` |
| FontWeight | `FontWeight.Semibold` |
| Color | `varColorSuccess` |

#### Control: lblRemainingEstimate

| Property | Value |
|----------|-------|
| Text | `"Remaining estimate: ~" & Text(varSelectedItem.EstWeight - Sum(Filter(Payments, RequestID = varSelectedItem.ID), Weight)) & "g · ~" & Text((varSelectedItem.EstWeight - Sum(Filter(Payments, RequestID = varSelectedItem.ID), Weight)) * varFilamentRate, "[$-en-US]$#,##0.00")` |
| Visible | `CountRows(Filter(Payments, RequestID = varSelectedItem.ID)) > 0` |
| Color | `varColorTextSecondary` |

### Phase 4: Update Payment Confirm Logic

Replace the single `Patch(PrintRequests, ...)` with a two-step operation:

```powerfx
// btnPaymentConfirm.OnSelect

// 1. Create new Payment record
Patch(
    Payments,
    Defaults(Payments),
    {
        RequestID: varSelectedItem.ID,
        ReqKey: varSelectedItem.ReqKey,
        TransactionNumber: txtTransactionNumber.Text,
        Weight: Value(txtFinalWeight.Text),
        Amount: Value(txtFinalWeight.Text) * If(
            chkStudentOwnMaterial.Value,
            varFilamentRate * 0.3,
            varFilamentRate
        ),
        PaymentType: ddPaymentType.Selected,
        PaymentDate: Today(),
        PayerName: If(
            chkPayerSameAsStudent.Value,
            varSelectedItem.Student.DisplayName,
            txtPayerName.Text
        ),
        PayerTigerCard: If(
            chkPayerSameAsStudent.Value,
            varSelectedItem.TigerCardNumber,
            txtPayerTigerCard.Text
        ),
        PlatesPickedUp: Concat(colPickedUpPlates, Text(PlateNum), ", "),
        RecordedBy: {
            Claims: "i:0#.f|membership|" & ddPaymentStaff.Selected.MemberEmail,
            Department: "",
            DisplayName: ddPaymentStaff.Selected.MemberName,
            Email: ddPaymentStaff.Selected.MemberEmail,
            JobTitle: "",
            Picture: ""
        },
        StudentOwnMaterial: chkStudentOwnMaterial.Value
    }
);

// 2. Update PrintRequests running totals
With(
    {
        totalWeight: Sum(Filter(Payments, RequestID = varSelectedItem.ID), Weight),
        totalCost: Sum(Filter(Payments, RequestID = varSelectedItem.ID), Amount),
        allPlatesDone: CountRows(Filter(colAllBuildPlates, RequestID = varSelectedItem.ID, Not(Status.Value in ["Completed", "Picked Up"]))) = 0
    },
    Patch(
        PrintRequests,
        LookUp(PrintRequests, ID = varSelectedItem.ID),
        {
            FinalWeight: totalWeight,
            FinalCost: totalCost,
            PaymentDate: Today(),
            Status: If(
                allPlatesDone && CountRows(Filter(colAllBuildPlates, RequestID = varSelectedItem.ID, Status.Value <> "Picked Up")) = 0,
                {Value: "Paid & Picked Up"},
                varSelectedItem.Status
            ),
            LastAction: {Value: "Picked Up"},
            LastActionBy: {
                Claims: "i:0#.f|membership|" & ddPaymentStaff.Selected.MemberEmail,
                Department: "",
                DisplayName: ddPaymentStaff.Selected.MemberName,
                Email: ddPaymentStaff.Selected.MemberEmail,
                JobTitle: "",
                Picture: ""
            },
            LastActionAt: Now()
        }
    )
);

// 3. Update BuildPlates status (existing logic)
ForAll(
    colPickedUpPlates,
    Patch(
        BuildPlates,
        LookUp(BuildPlates, ID = ThisRecord.ID),
        {Status: {Value: "Picked Up"}}
    )
);

// 4. Refresh collections
ClearCollect(colAllBuildPlates, BuildPlates);
Clear(colPickedUpPlates);

// 5. Notify and close
Notify("Payment recorded!", NotificationType.Success);
Set(varShowPaymentModal, 0);
Set(varSelectedItem, Blank())
```

---

## Student Portal Integration

### Student View: Payment History

Students should see their payment history on their request details:

```
┌─────────────────────────────────────────────────────────────────┐
│  My Request: REQ-00042                                          │
│  Status: Completed (awaiting final pickup)                      │
│                                                                 │
│  Estimated Cost: $14.70                                         │
│                                                                 │
│  PAYMENTS                                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  3/15/2026    $8.50    Partial pickup                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  Paid: $8.50                                                    │
│  Remaining: ~$6.20                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

> ⚠️ **Security Note:** Students should only see Amount and Date — not transaction numbers, payer details, or staff info. Filter the display accordingly.

---

## Monthly Transaction Export Update

### Query Change

Update the export to query `Payments` instead of `PrintRequests`:

**Before (Enhancement #4 spec):**
```powerfx
Filter(
    PrintRequests,
    Status.Value = "Paid & Picked Up" &&
    Month(PaymentDate) = varSelectedMonth &&
    Year(PaymentDate) = varSelectedYear
)
```

**After:**
```powerfx
Filter(
    Payments,
    Month(PaymentDate) = varSelectedMonth &&
    Year(PaymentDate) = varSelectedYear
)
```

### Column Mapping Update

| Excel Column | Source (Updated) |
|--------------|------------------|
| Machine | `LookUp(PrintRequests, ID = RequestID).Method.Value` |
| $/Unit | Rate based on Method |
| Unit Amount | `Weight` |
| Cost | `Amount` |
| Payer | `PayerName` |
| Notes | `LookUp(PrintRequests, ID = RequestID).PaymentNotes` |
| Course Number | `LookUp(PrintRequests, ID = RequestID).CourseNumber` |
| Date | `PaymentDate` |
| Transaction Number | `TransactionNumber` |
| Processed By | `RecordedBy.DisplayName` |
| Request ID | `ReqKey` |

### Export Result

For the partial pickup example:

| Date | Transaction # | Payer | Amount | Request |
|------|---------------|-------|--------|---------|
| 3/15/2026 | TXN-44821 | Jane Smith | $8.50 | REQ-00042 |
| 3/16/2026 | TXN-44890 | Jane Smith | $6.20 | REQ-00042 |

Finance gets exactly what they need: one row per actual transaction.

---

## Job Card Display

### Running Total on Job Card

The job card payment info section shows running totals from `PrintRequests.FinalWeight` and `FinalCost`:

```
│  ⚖ Est: 147g · $14.70                                           │
│  ✓ Paid: 85g · $8.50 (1 of 2 payments)                          │
```

Formula for payment count:
```powerfx
"(" & Text(CountRows(Filter(Payments, RequestID = ThisItem.ID))) & " payment" & 
If(CountRows(Filter(Payments, RequestID = ThisItem.ID)) <> 1, "s", "") & ")"
```

---

## Implementation Priority

> ⚠️ **Current Data Loss:** Every time staff processes a second payment for a job, the first payment's transaction number and details are overwritten. This is happening NOW. Implement the SharePoint schema immediately to start capturing data correctly, even before the UI is updated.

### Phase 1: SharePoint Schema (Do Immediately)

1. Create `Payments` list with all columns
2. Set permissions (staff-only)
3. **Workaround until UI is updated:** Staff can manually add records to the `Payments` list via SharePoint when processing partial pickups

This can be done TODAY with no app changes. The list will be ready when the UI catches up.

### Implementation Order Note

This enhancement can be implemented **independently of Build Plate Tracking**:

| With Build Plates | Without Build Plates |
|-------------------|----------------------|
| `PlatesPickedUp` field populated | `PlatesPickedUp` field left blank |
| Plate checkboxes in Payment Modal | No plate checkboxes shown |
| Full partial pickup workflow | Still tracks multiple payments per job |

**Recommended order:**
1. **Multi-Payment Tracking** ← Do this first (stops data loss)
2. **Build Plate Tracking** ← Adds plate-level granularity later

### Phase 2: Staff Dashboard — Payment Recording

1. Add `Payments` data connection
2. Update Payment Modal with Payment History section
3. Update `btnPaymentConfirm.OnSelect` to create `Payments` record and update running totals
4. Test partial pickup workflow

### Phase 3: Monthly Export Update

1. Update export query to use `Payments` list
2. Update column mappings
3. Test export with multi-payment jobs

### Phase 4: Student Portal

1. Add payment history display for students
2. Show running total and remaining estimate

---

## Testing Scenarios

### Scenario 1: Single Payment (Normal Case)

1. Job with 1 plate, student picks up everything at once
2. Staff records payment: 115g, $11.50, TXN-12345
3. **Verify:** `Payments` has 1 record
4. **Verify:** `PrintRequests.FinalWeight` = 115, `FinalCost` = $11.50
5. **Verify:** Monthly export shows 1 row

### Scenario 2: Two Partial Payments

1. Job with 5 plates
2. Day 1: 3 plates done, student picks up, pays $8.50 (TXN-44821)
3. **Verify:** `Payments` has 1 record, `PrintRequests.FinalCost` = $8.50
4. Day 2: 2 plates done, student picks up remaining, pays $6.20 (TXN-44890)
5. **Verify:** `Payments` has 2 records
6. **Verify:** `PrintRequests.FinalWeight` = 147, `FinalCost` = $14.70
7. **Verify:** Monthly export shows 2 rows

### Scenario 3: Payment History Display

1. Job with existing payment
2. Open Payment Modal for additional payment
3. **Verify:** Payment History section shows previous payment(s)
4. **Verify:** "Paid so far" shows running total
5. **Verify:** "Remaining estimate" calculates correctly

### Scenario 4: Different Payers

1. Day 1: Student pays for first pickup
2. Day 2: Student's friend pays for second pickup (different payer)
3. **Verify:** Payment 1 has student's name as payer
4. **Verify:** Payment 2 has friend's name as payer
5. **Verify:** Monthly export shows correct payer for each row

### Scenario 5: Mixed Payment Types

1. First payment: TigerCASH
2. Second payment: Check
3. Third payment: Grant Code
4. **Verify:** Each `Payments` record has correct `PaymentType`
5. **Verify:** Export shows payment type per row

### Scenario 6: Backward Compatibility

1. Existing job with payment recorded before this enhancement (data in `PrintRequests` fields only)
2. Open Payment Modal
3. **Verify:** Payment History is empty (no `Payments` records)
4. **Verify:** System still shows `FinalWeight`/`FinalCost` from `PrintRequests`
5. New payment creates first `Payments` record

---

## Related Spec Sections

- **Payment Modal:** `StaffDashboard-App-Spec.md` Step 12C
- **Build Plate Tracking:** `PowerApps/Future Improvements/3-BuildPlate-Tracking-Enhancement.md`
- **Payer Tracking:** `PowerApps/Future Improvements/2-Payer-Tracking-Enhancement.md`
- **Monthly Transaction Export:** `PowerApps/Future Improvements/4-Monthly-Transaction-Export.md`
- **SharePoint PrintRequests List:** `SharePoint/PrintRequests-List-Setup.md`

---

*Last Updated: March 17, 2026*
