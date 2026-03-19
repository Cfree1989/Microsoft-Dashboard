# Multi-Payment Tracking Enhancement

**Status:** Future Enhancement  
**Priority:** Critical ⚠️  
**Dependencies:** Payment Modal (Step 12C), Payer Tracking (Enhancement #2), Monthly Transaction Export (Enhancement #4)

**Integrates With:** Build Plate Tracking (Enhancement #3), Printer Verification (Enhancement #1)

> 📦 **Bundle Implementation:** This enhancement is designed to be implemented alongside Build Plate Tracking (#3) and Printer Verification (#1). The Payment Modal changes in this document include the plate pickup section from Enhancement #3.

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
    ├── Payment 1: 3/15, TXN-44821, 85g, $8.50, Plates 1-3, PlateIDs=[...stable keys...]
    └── Payment 2: 3/16, TXN-44890, 62g, $6.20, Plates 4-5, PlateIDs=[...stable keys...]
```

### Key Design Points

| Aspect | Design |
|--------|--------|
| **One row per transaction** | Each swipe/check/code entry = one `Payments` record |
| **Linked to job** | `RequestID` links to `PrintRequests.ID` |
| **Running totals** | `PrintRequests.FinalWeight` and `FinalCost` updated after each payment |
| **Plates linked** | Each payment records both display labels and stable plate IDs for the picked-up plates |
| **Payer captured** | Integrates with Payer Tracking Enhancement |
| **Export source** | Monthly Transaction Export queries `Payments` list |

`PlatesPickedUp` remains a human-readable snapshot for UI display. Durable history must come from `PlateIDsPickedUp`, which stores the immutable `PlateKey` values from the `BuildPlates` list. This prevents old payment records from becoming ambiguous if visible plate numbering changes later.

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
│     RequestID: 42, Weight: 85, Amount: $8.50,                   │
│     PlatesPickedUp: "1,2,3", PlateIDsPickedUp: "..."            │
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
| `PlatesPickedUp` | Single line of text | No | — | Human-readable plate labels picked up (e.g., "1, 2, 3") |
| `PlateIDsPickedUp` | Multiple lines of text | No | — | Stable `PlateKey` values picked up in this transaction |
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
3. **Description:** `Display labels collected in this transaction (e.g., "1, 2, 3")`
4. Click **Save**

##### PlateIDsPickedUp
1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `PlateIDsPickedUp`
3. **Description:** `Stable PlateKey values collected in this transaction`
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

### Phase 3: Payment Modal Updates — Two-Column Layout

> 📐 **Layout Change:** The Payment Modal expands from 550px to **800px wide** with a two-column layout. The left column contains form fields (unchanged). The right column shows Payment History and Plates being picked up.

#### Updated Modal Dimensions

| Property | Before | After |
|----------|--------|-------|
| `recPaymentModal.Width` | `550` | `800` |
| `recPaymentModal.Height` | `650` (or 740) | `680` |

#### Visual Layout (Two-Column)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  Record Payment — Jane Smith · REQ-00042                                       [✕] │
│  Student: Jane Smith · Estimated: 147g → $14.70                                    │
├────────────────────────────────────────────┬───────────────────────────────────────┤
│  LEFT COLUMN — FORM FIELDS                 │  RIGHT COLUMN — HISTORY & PLATES      │
│                                            │                                       │
│  Performing Action As: *   Payment Type: * │  PAYMENT HISTORY                      │
│  ┌─────────────────┐       ┌─────────────┐ │  ┌─────────────────────────────────┐  │
│  │ Colin Freeman ▼ │       │ TigerCASH ▼ │ │  │ 3/15  TXN-44821  85g   $8.50   │  │
│  └─────────────────┘       └─────────────┘ │  │ Plates 1,2,3 · Colin            │  │
│                                            │  └─────────────────────────────────┘  │
│  Transaction #: *          Payment Date: * │  Paid so far: 85g · $8.50             │
│  ┌─────────────────┐       ┌─────────────┐ │  Remaining: ~62g · ~$6.20             │
│  │ TXN-44890       │       │ 3/17/2026 📅│ │                                       │
│  └─────────────────┘       └─────────────┘ │  ─────────────────────────────────    │
│                                            │                                       │
│  Final Weight (grams): *                   │  PLATES BEING PICKED UP               │
│  ┌─────────────────┐                       │  ┌─────────────────────────────────┐  │
│  │ 62              │                       │  │ ☑ Plate 4/5 · Prusa XL          │  │
│  └─────────────────┘                       │  │ ☑ Plate 5/5 · Prusa XL          │  │
│  Final Cost: $6.20                         │  └─────────────────────────────────┘  │
│                                            │  (Only completed plates shown)        │
│  ☐ Student provided own material (70%)    │                                       │
│                                            │                                       │
│  Payment Notes (optional):                 │                                       │
│  ┌────────────────────────────────────┐    │                                       │
│  │                                    │    │                                       │
│  └────────────────────────────────────┘    │                                       │
│                                            │                                       │
│  ☐ Partial Pickup — Student will return   │                                       │
├────────────────────────────────────────────┴───────────────────────────────────────┤
│  [Add More Items]                                       [Cancel]  [Record Payment] │
└────────────────────────────────────────────────────────────────────────────────────┘
```

#### Column Containers

##### Left Column Container (conPaymentLeft)

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X` |
| Y | `recPaymentModal.Y + 80` |
| Width | `400` |
| Height | `520` |

> All existing form controls (staff dropdown, payment type, transaction #, date, weight, cost, checkboxes, notes) go inside this container with their existing relative positions.

##### Right Column Container (conPaymentRight)

| Property | Value |
|----------|-------|
| X | `recPaymentModal.X + 410` |
| Y | `recPaymentModal.Y + 80` |
| Width | `370` |
| Height | `520` |
| Visible | `CountRows(Filter(Payments, RequestID = varSelectedItem.ID)) > 0 Or CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

> Right column only appears when there's something to show (prior payments OR completed plates to pick up).

---

#### Payment History Section (inside conPaymentRight)

##### Header: lblPaymentHistoryHeader

| Property | Value |
|----------|-------|
| Text | `"PAYMENT HISTORY"` |
| X | `0` |
| Y | `0` |
| Width | `350` |
| Height | `24` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `varColorText` |
| Visible | `CountRows(Filter(Payments, RequestID = varSelectedItem.ID)) > 0` |

##### Gallery: galPaymentHistory

| Property | Value |
|----------|-------|
| Items | `Sort(Filter(Payments, RequestID = varSelectedItem.ID), PaymentDate, SortOrder.Ascending)` |
| X | `0` |
| Y | `28` |
| Width | `350` |
| Height | `Min(100, CountRows(Filter(Payments, RequestID = varSelectedItem.ID)) * 44)` |
| TemplateSize | `42` |
| TemplatePadding | `2` |
| Fill | `RGBA(248, 249, 250, 1)` |
| Visible | `CountRows(Filter(Payments, RequestID = varSelectedItem.ID)) > 0` |

##### Row Template (inside galPaymentHistory)

| Control | Property | Value |
|---------|----------|-------|
| lblHistDate | Text | `Text(ThisItem.PaymentDate, "m/d")` |
| lblHistDate | Width | `40` |
| lblHistTxn | Text | `ThisItem.TransactionNumber` |
| lblHistTxn | Width | `90` |
| lblHistWeight | Text | `Text(ThisItem.Weight) & "g"` |
| lblHistWeight | Width | `45` |
| lblHistAmount | Text | `Text(ThisItem.Amount, "[$-en-US]$#,##0.00")` |
| lblHistAmount | Width | `60` |
| lblHistPlates | Text | `If(!IsBlank(ThisItem.PlatesPickedUp), "Plates " & ThisItem.PlatesPickedUp, "")` |
| lblHistPlates | Y | `22` (second row) |
| lblHistStaff | Text | `ThisItem.RecordedBy.DisplayName` |
| lblHistStaff | Y | `22` (second row) |

> ⚠️ The history row intentionally shows the human-readable `PlatesPickedUp` value. Durable cross-checking should use `PlateIDsPickedUp`, which is stored on the same `Payments` record but does not need to be shown in the default UI.

##### Summary Labels

| Control | Property | Value |
|---------|----------|-------|
| lblPaidSoFar | Text | `"Paid so far: " & Text(Sum(Filter(Payments, RequestID = varSelectedItem.ID), Weight)) & "g · " & Text(Sum(Filter(Payments, RequestID = varSelectedItem.ID), Amount), "[$-en-US]$#,##0.00")` |
| lblPaidSoFar | Y | `galPaymentHistory.Y + galPaymentHistory.Height + 8` |
| lblPaidSoFar | FontWeight | `FontWeight.Semibold` |
| lblPaidSoFar | Color | `varColorSuccess` |
| lblRemainingEst | Text | `"Remaining: ~" & Text(Max(0, varSelectedItem.EstWeight - Sum(Filter(Payments, RequestID = varSelectedItem.ID), Weight))) & "g · ~" & Text(Max(0, (varSelectedItem.EstWeight - Sum(Filter(Payments, RequestID = varSelectedItem.ID), Weight)) * varFilamentRate), "[$-en-US]$#,##0.00")` |
| lblRemainingEst | Y | `lblPaidSoFar.Y + 20` |
| lblRemainingEst | Color | `varColorTextSecondary` |

---

#### Plates Pickup Section (inside conPaymentRight)

> 📦 **From Build Plate Tracking (#3):** This section shows completed plates as checkboxes. Staff checks which plates are being picked up with this payment.

##### Divider: recPlatesDivider

| Property | Value |
|----------|-------|
| X | `0` |
| Y | `lblRemainingEst.Y + 36` |
| Width | `350` |
| Height | `1` |
| Fill | `varColorBorderLight` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

##### Header: lblPlatesPickupHeader

| Property | Value |
|----------|-------|
| Text | `"PLATES BEING PICKED UP"` |
| X | `0` |
| Y | `recPlatesDivider.Y + 12` |
| Width | `350` |
| Height | `24` |
| FontWeight | `FontWeight.Semibold` |
| Size | `11` |
| Color | `varColorText` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

##### Gallery: galPlatesPickup

| Property | Value |
|----------|-------|
| Items | `Filter(colBuildPlatesIndexed, Status.Value = "Completed")` |
| X | `0` |
| Y | `lblPlatesPickupHeader.Y + 28` |
| Width | `350` |
| Height | `Min(140, CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) * 36)` |
| TemplateSize | `34` |
| TemplatePadding | `2` |
| Fill | `RGBA(248, 249, 250, 1)` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

##### Row Template (inside galPlatesPickup)

| Control | Property | Value |
|---------|----------|-------|
| chkPlate | Control | Checkbox |
| chkPlate | Default | `ThisItem.ID in colPickedUpPlates.ID` |
| chkPlate | OnCheck | `Collect(colPickedUpPlates, ThisItem)` |
| chkPlate | OnUncheck | `Remove(colPickedUpPlates, ThisItem)` |
| chkPlate | X | `4` |
| chkPlate | Width | `20` |
| lblPlateName | Text | `"Plate " & Text(ThisItem.PlateNum) & "/" & Text(CountRows(colBuildPlatesIndexed)) & " · " & Trim(If(Find("(", ThisItem.Machine.Value) > 0, Left(ThisItem.Machine.Value, Find("(", ThisItem.Machine.Value) - 2), ThisItem.Machine.Value))` |
| lblPlateName | X | `30` |

##### Helper Text: lblPlatesHint

| Property | Value |
|----------|-------|
| Text | `"(Only completed plates shown)"` |
| Y | `galPlatesPickup.Y + galPlatesPickup.Height + 4` |
| Size | `9` |
| Color | `varColorTextMuted` |
| Visible | `CountRows(Filter(colBuildPlatesIndexed, Status.Value = "Completed")) > 0` |

### Phase 4: Update Payment Confirm Logic

Replace the single `Patch(PrintRequests, ...)` with a multi-step operation that:
1. Creates a `Payments` record
2. Updates `PrintRequests` running totals
3. Marks checked plates as "Picked Up" (from Build Plate Tracking #3)

```powerfx
// btnPaymentConfirm.OnSelect

// Calculate final cost (same logic as current payment modal)
Set(varBaseCost, Max(varMinimumCost, Value(txtPaymentWeight.Text) * If(varSelectedItem.Method.Value = "Resin", varResinRate, varFilamentRate)));
Set(varFinalCost, If(chkOwnMaterial.Value, varBaseCost * varOwnMaterialDiscount, varBaseCost));
Set(
    varPickedPlateIDsText,
    If(
        CountRows(colPickedUpPlates) > 0,
        Concat(
            SortByColumns(colPickedUpPlates, "PlateNum", SortOrder.Ascending),
            PlateKey,
            ", "
        ),
        ""
    )
);

// 1. Create new Payment record
Set(varNewPayment, 
    Patch(
        Payments,
        Defaults(Payments),
        {
            RequestID: varSelectedItem.ID,
            ReqKey: varSelectedItem.ReqKey,
            TransactionNumber: txtPaymentTransaction.Text,
            Weight: Value(txtPaymentWeight.Text),
            Amount: varFinalCost,
            PaymentType: {Value: ddPaymentType.Selected.Value},
            PaymentDate: dpPaymentDate.SelectedDate,
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
            PlatesPickedUp: If(
                CountRows(colPickedUpPlates) > 0,
                Concat(colPickedUpPlates, Text(PlateNum), ", "),
                ""
            ),
            PlateIDsPickedUp: varPickedPlateIDsText,
            RecordedBy: {
                Claims: "i:0#.f|membership|" & ddPaymentStaff.Selected.MemberEmail,
                Department: "",
                DisplayName: ddPaymentStaff.Selected.MemberName,
                Email: ddPaymentStaff.Selected.MemberEmail,
                JobTitle: "",
                Picture: ""
            },
            StudentOwnMaterial: chkOwnMaterial.Value
        }
    )
);

// 2. Update PrintRequests running totals
// Note: Query Payments AFTER the new record is created to include it in totals
With(
    {
        wTotalWeight: Sum(Filter(Payments, RequestID = varSelectedItem.ID), Weight),
        wTotalCost: Sum(Filter(Payments, RequestID = varSelectedItem.ID), Amount),
        wAllPlatesPickedUp: CountRows(Filter(colAllBuildPlates, RequestID = varSelectedItem.ID)) = 0 Or
            CountRows(Filter(colAllBuildPlates, RequestID = varSelectedItem.ID, Status.Value <> "Picked Up")) - CountRows(colPickedUpPlates) <= 0
    },
    Patch(
        PrintRequests,
        LookUp(PrintRequests, ID = varSelectedItem.ID),
        {
            FinalWeight: wTotalWeight,
            FinalCost: wTotalCost,
            PaymentDate: dpPaymentDate.SelectedDate,
            Status: If(
                wAllPlatesPickedUp && !chkPartialPickup.Value,
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

// 3. Mark checked plates as "Picked Up" (Build Plate Tracking integration)
If(
    CountRows(colPickedUpPlates) > 0,
    ForAll(
        colPickedUpPlates,
        Patch(
            BuildPlates,
            LookUp(BuildPlates, ID = ThisRecord.ID),
            {Status: {Value: "Picked Up"}}
        )
    )
);

// 4. Call Flow C for audit logging (same as existing)
IfError(
    'Flow-(C)-Action-LogAction'.Run(
        Text(varSelectedItem.ID),
        If(chkPartialPickup.Value, "Partial Payment", "Status Change"),
        If(chkPartialPickup.Value, "Payment", "Status"),
        "Payment: " & Text(varFinalCost, "[$-en-US]$#,##0.00") & 
        If(
            CountRows(colPickedUpPlates) > 0,
            " (Plate IDs " & Concat(colPickedUpPlates, PlateKey, ",") &
            " | Display " & Concat(colPickedUpPlates, Text(PlateNum), ",") & ")",
            ""
        ),
        ddPaymentStaff.Selected.MemberEmail
    ),
    Notify("Payment saved, but could not log to audit.", NotificationType.Warning)
);

// 5. Refresh collections
ClearCollect(colAllBuildPlates, BuildPlates);
Clear(colPickedUpPlates);

// 6. Reset form and close modal
Reset(txtPaymentTransaction);
Reset(txtPaymentWeight);
Reset(dpPaymentDate);
Reset(txtPaymentNotes);
Reset(ddPaymentStaff);
Reset(chkOwnMaterial);
Reset(chkPartialPickup);
Reset(ddPaymentType);
Notify("Payment recorded!", NotificationType.Success);
Set(varShowPaymentModal, 0);
Set(varSelectedItem, Blank())
```

> 💡 **Integration Note:** Step 3 (marking plates as Picked Up) comes from Build Plate Tracking Enhancement #3. If no plates are checked or no plates exist, this step is skipped via the `If(CountRows(...) > 0, ...)` guard.

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
| `PlatesPickedUp` + `PlateIDsPickedUp` populated | Plate fields left blank |
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
7. **Verify:** Each `Payments` row stores both `PlatesPickedUp` and `PlateIDsPickedUp`
8. **Verify:** Monthly export shows 2 rows

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

### Scenario 7: Final Batch Pickup After Earlier Partial Pickup

1. Request A already has one earlier `Payments` row from a partial pickup
2. The remaining completed pieces for Request A are collected later through batch payment
3. **Verify:** Batch creates one additional `Payments` row for Request A rather than overwriting its earlier history
4. **Verify:** The batch-created row stores `PlateIDsPickedUp` for the remaining plates
5. **Verify:** `PrintRequests.FinalWeight` / `FinalCost` equal the sum of all `Payments` rows for Request A

### Scenario 8: Plate Renumbering After Payment

1. Record a payment tied to completed plates on a multi-plate request
2. Later remove one older plate and add a replacement plate
3. **Verify:** Current visible plate numbering may change
4. **Verify:** Earlier `Payments.PlateIDsPickedUp` values still identify the originally picked-up plates unambiguously

---

## Related Spec Sections

- **Payment Modal:** `StaffDashboard-App-Spec.md` Step 12C
- **Build Plate Tracking:** `PowerApps/Future Improvements/3-BuildPlate-Tracking-Enhancement.md`
- **Payer Tracking:** `PowerApps/Future Improvements/2-Payer-Tracking-Enhancement.md`
- **Monthly Transaction Export:** `PowerApps/Future Improvements/4-Monthly-Transaction-Export.md`
- **SharePoint PrintRequests List:** `SharePoint/PrintRequests-List-Setup.md`

---

*Last Updated: March 17, 2026*
