# Payments SharePoint List Setup

**Purpose:** Track payment ledger entries for print jobs, including consolidated multi-request batch checkouts  
**Time Required:** 20 minutes

---

## Overview

The Payments list stores transaction ledger records for print jobs. Unlike the single-value payment fields on `PrintRequests`, this list supports multiple payments per job and can also store one consolidated checkout that covers multiple requests.

**Key Features:**
- 17 columns capturing full transaction details
- One-to-many relationship with PrintRequests (multiple payments per job)
- Supports one consolidated ledger row for a batch checkout spanning multiple requests
- Supports multi-payer scenarios (different people paying for same job)
- Source data for Monthly Transaction Export
- Staff-only access (no student visibility of transaction details)

**Related Documents:**
- **PrintRequests List:** `SharePoint/PrintRequests-List-Setup.md`
- **BuildPlates List:** `SharePoint/BuildPlates-List-Setup.md`
- **Staff Dashboard App Spec:** `PowerApps/StaffDashboard-App-Spec.md`
- **Monthly Transaction Export (App UI):** `PowerApps/StaffDashboard-App-Spec.md` — Step 12G
- **Monthly Transaction Export (Flow):** `PowerAutomate/Flow-(G)-Export-MonthlyTransactions.md`

---

## Step 1: Create the List

1. Go to your SharePoint site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Click **Settings** (gear icon) → **Site contents**
3. Click **+ New** → **List**
4. Select **Blank list**
5. **Name:** `Payments`
6. **Description:** `Payment ledger records for print jobs, including consolidated batch checkouts`
7. Click **Create**

---

## Step 2: Add Columns

### Column 1: RequestID (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `RequestID`
3. **Description:** `Links to PrintRequests.ID for single-request payments`
4. **Number of decimal places:** 0
5. **Require that this column contains information:** No
6. Click **Save**

> 💡 **Usage rule:** Populate `RequestID` only when the payment row covers exactly one request. Leave it blank for consolidated batch rows that use `BatchRequestIDs` instead.

### Column 2: ReqKey (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `ReqKey`
3. **Description:** `Request reference for easy identification (e.g., REQ-00042) for single-request payments`
4. Click **Save**

> 💡 **Usage rule:** Populate `ReqKey` only when the payment row covers exactly one request. Leave it blank for consolidated batch rows that use `BatchReqKeys` instead.

### Column 3: BatchRequestIDs (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `BatchRequestIDs`
3. **Description:** `Comma-separated PrintRequests.ID values covered by one consolidated batch payment`
4. Click **Save**

> 💡 **Usage rule:** Leave this blank for normal single-request payments. For a consolidated batch payment, store the covered request IDs in ascending order such as `164, 165`.

### Column 4: BatchReqKeys (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `BatchReqKeys`
3. **Description:** `Comma-separated REQ keys covered by one consolidated batch payment`
4. Click **Save**

> 💡 **Usage rule:** Leave this blank for normal single-request payments. For a consolidated batch payment, store the covered request references in ascending order such as `REQ-00164, REQ-00165`.

### Column 5: BatchAllocationSummary (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `BatchAllocationSummary`
3. **Description:** `Per-request weight and cost allocation snapshot for consolidated batch payments`
4. Click **Save**

> 💡 **Usage rule:** Leave this blank for normal single-request payments. For a consolidated batch payment, capture the saved allocation snapshot in a human-readable format such as `REQ-00164: $21.18 for 181.41g | REQ-00165: $5.42 for 54.2g`.

### Column 6: TransactionNumber (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `TransactionNumber`
3. **Description:** `TigerCASH receipt, check number, or grant/program code`
4. **Require that this column contains information:** No
5. Click **Save**

> 💡 **Purpose:** The identifier for this payment transaction. Format depends on PaymentType (receipt for TigerCASH, check number for Check, code for grants). This field is **not required** because grant/program codes are not always available at the time of payment — staff may need to record the payment first and add the code later.
>
> 💡 **Batch note:** If one checkout covers multiple requests, create one consolidated `Payments` row for the full checkout total and reuse that one `TransactionNumber` on the single ledger row.
>
> ⚠️ **Do not use a TigerCard number as the transaction number.** The TigerCard belongs in `PayerTigerCard`; `TransactionNumber` should hold the TigerCASH receipt / approval / reference number.
>
> 💡 **Uniqueness:** SharePoint does **not** enforce a unique constraint on this column. **`Flow-(H)-Payment-SaveSingle`** and **`Flow-(I)-Payment-SaveBatch`** treat duplicate **`TransactionNumber`** values as an error **only for `PaymentType = TigerCASH`** (POS receipt de-duplication). **Check** numbers and **grant/program** (`Code`) references may repeat across rows.

### Column 7: Weight (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `Weight`
3. **Description:** `Grams picked up in this ledger row`
4. **Number of decimal places:** 0
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 8: Amount (Currency)

1. Click **+ Add column** → **Currency**
2. **Name:** `Amount`
3. **Description:** `Cost charged in this ledger row`
4. **Currency format:** $ English (United States)
5. **Number of decimal places:** 2
6. **Require that this column contains information:** Yes
7. Click **Save**

### Column 9: PaymentType (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `PaymentType`
3. **Description:** `Payment method used`
4. **Choices:**
   - TigerCASH
   - Check
   - Grant/Program Code
5. **Default value:** TigerCASH
6. **Require that this column contains information:** Yes
7. Click **Save**

### Column 10: PaymentDate (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `PaymentDate`
3. **Description:** `Business date of the payment transaction`
4. **Include time:** No
5. **Require that this column contains information:** Yes
6. Click **Save**

> 💡 **Purpose:** This is the staff-selected accounting date for the payment.
>
> 💡 **Batch note:** For a consolidated batch checkout, the shared payment date is stored once on the single `Payments` row.

### Column 11: RecordedAt (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `RecordedAt`
3. **Description:** `Exact timestamp when the payment row was saved`
4. **Include time:** Yes
5. **Require that this column contains information:** Yes
6. Click **Save**

> 💡 **Purpose:** Use this field for transaction ordering, audit reconstruction, and export timestamps. Unlike `PaymentDate`, this should capture the real save time to the minute.
>
> 💡 **Batch note:** A consolidated batch checkout stores one `RecordedAt` value on its single ledger row.

### Column 12: PayerName (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `PayerName`
3. **Description:** `Name of person who paid`
4. Click **Save**

> 💡 **Purpose:** Tracks who actually paid for this transaction. May differ from the student who submitted the request (e.g., friend, parent, grant administrator).
>
> 💡 **Batch note:** A consolidated batch checkout stores the payer once on the shared ledger row.

### Column 13: PayerTigerCard (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `PayerTigerCard`
3. **Description:** `TigerCard number of payer (for remote charging)`
4. Click **Save**

### Column 14: PlatesPickedUp (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `PlatesPickedUp`
3. **Description:** `Plate display labels collected in this transaction (single request or aggregated batch snapshot)`
4. Click **Save**

> 💡 **Purpose:** Links this payment to specific build plates. When Build Plate Tracking is enabled, staff can check which plates are being picked up during payment, and the exact staff-facing plate labels are recorded here.
>
> 💡 **Batch note:** For consolidated batch rows, prefix each plate snapshot segment with the request key so staff can still tell which plates belonged to which request.

### Column 15: PlateIDsPickedUp (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `PlateIDsPickedUp`
3. **Description:** `PlateKey snapshot captured at pickup time for this transaction`
4. Click **Save**

> ⚠️ **Important:** This stores the best available plate snapshot at pickup time. `PlatesPickedUp` is only a human-readable display snapshot, and even `PlateIDsPickedUp` can become historical context rather than a live 1:1 map if staff later re-slice, replace, relabel, or renumber plates. The canonical transaction record is still the `Payments` row itself.

### Column 16: RecordedBy (Person)

1. Click **+ Add column** → **Person**
2. **Name:** `RecordedBy`
3. **Description:** `Staff member who processed payment`
4. **Require that this column contains information:** Yes
5. **Allow multiple selections:** No
6. Click **Save**

### Column 17: StudentOwnMaterial (Yes/No)

1. Click **+ Add column** → **Yes/No**
2. **Name:** `StudentOwnMaterial`
3. **Description:** `Student provided own material (70% discount applied)`
4. **Default value:** No
5. Click **Save**

---

## Step 3: Set Permissions

The Payments list should be accessible **only to staff**, not students.

1. Go to the Payments list
2. Click **Settings** (gear icon) → **List settings**
3. Click **Permissions for this list**
4. Click **Stop Inheriting Permissions**
5. Click **OK** to confirm
6. **Remove** any groups that include students
7. **Keep** these groups:
   - Owners (Full Control)
   - Staff Group (Edit or Contribute)

> ⚠️ **Privacy Note:** Students should not see transaction numbers, payer details, or staff info. They can see their own payment totals on PrintRequests, but not the detailed Payments records.

---

## Column Summary

| Column | Type | Required | Default | Purpose |
|--------|------|----------|---------|---------|
| Title | Single line | Yes | - | Auto-created by SharePoint (can be hidden) |
| RequestID | Number | No | - | Single-request link to `PrintRequests.ID` |
| ReqKey | Single line | No | - | Single-request reference (REQ-00042) |
| BatchRequestIDs | Multiple lines | No | - | Consolidated batch request IDs (`164, 165`) |
| BatchReqKeys | Multiple lines | No | - | Consolidated batch request refs (`REQ-00164, REQ-00165`) |
| BatchAllocationSummary | Multiple lines | No | - | Per-request saved cost/weight snapshot for batch rows |
| TransactionNumber | Single line | No | - | Receipt/check/code reference (not always available for grants) |
| Weight | Number | Yes | - | Grams picked up in this ledger row |
| Amount | Currency | Yes | - | Cost charged in this ledger row |
| PaymentType | Choice | Yes | TigerCASH | TigerCASH / Check / Grant/Program Code |
| PaymentDate | Date | Yes | - | Business date of the payment |
| RecordedAt | DateTime | Yes | - | Exact timestamp the payment row was saved |
| PayerName | Single line | No | - | Who paid |
| PayerTigerCard | Single line | No | - | Payer's TigerCard number |
| PlatesPickedUp | Single line | No | - | Display plate labels collected (single request or aggregated batch snapshot) |
| PlateIDsPickedUp | Multiple lines | No | - | Stable PlateKey values for picked-up plates |
| RecordedBy | Person | Yes | - | Staff who processed payment |
| StudentOwnMaterial | Yes/No | No | No | 70% discount applied |

---

## Data Flow Examples

### Example A: Two separate payments for one job

**Scenario:** Student submits request `REQ-00042`. Job has 5 plates. Student picks up in 2 visits.

| ID | RequestID | ReqKey | BatchRequestIDs | BatchReqKeys | BatchAllocationSummary | TransactionNumber | Weight | Amount | PaymentDate | RecordedAt | PlatesPickedUp | PlateIDsPickedUp | PayerName |
|----|-----------|--------|-----------------|--------------|------------------------|-------------------|--------|--------|-------------|------------|----------------|------------------|-----------|
| 1 | 42 | REQ-00042 | - | - | - | TXN-44821 | 85 | $8.50 | 3/15/2026 | 3/15/2026 2:14 PM | 1/5, 2/5, 3/5 | BP-42-A1, BP-42-A2, BP-42-A3 | Jane Smith |
| 2 | 42 | REQ-00042 | - | - | - | TXN-44890 | 62 | $6.20 | 3/16/2026 | 3/16/2026 11:08 AM | 4/5, Reprint 1 | BP-42-B1, BP-42-R3 | Jane Smith |

### Example B: One consolidated payment for two jobs

**Scenario:** One checkout covers `REQ-00164` and `REQ-00165`. Staff collect `$26.60` total and want one ledger row for the whole transaction.

| ID | RequestID | ReqKey | BatchRequestIDs | BatchReqKeys | BatchAllocationSummary | TransactionNumber | Weight | Amount | PaymentDate | RecordedAt | PlatesPickedUp | PlateIDsPickedUp | PayerName |
|----|-----------|--------|-----------------|--------------|------------------------|-------------------|--------|--------|-------------|------------|----------------|------------------|-----------|
| 3 | - | - | 164, 165 | REQ-00164, REQ-00165 | REQ-00164: $21.18 for 181.41g \| REQ-00165: $5.42 for 54.2g | TXN-45122 | 235.61 | $26.60 | 3/30/2026 | 3/30/2026 2:54 PM | REQ-00164: 1/1 \| REQ-00165: 1/1 | REQ-00164: BP-164-A1 \| REQ-00165: BP-165-A1 | Conrad F. |

**What this shows:**
- Single-request payments still use `RequestID` / `ReqKey`
- Consolidated batch payments leave `RequestID` / `ReqKey` blank and use `BatchRequestIDs` / `BatchReqKeys`
- `BatchAllocationSummary` preserves the saved per-request split for later audit and troubleshooting
- Finance exports now show one row for the real-world batch checkout instead of one row per job

---

## Relationship to PrintRequests

The `PrintRequests` list has payment fields that become **running totals** when Payments records exist:

| PrintRequests Field | Payments Relationship |
|---------------------|----------------------|
| `FinalWeight` | Running total written by the app at save time; single-request payments can be recomputed from matching `Payments` rows, consolidated batch payments use the saved allocation snapshot |
| `FinalCost` | Running total written by the app at save time; single-request payments can be recomputed from matching `Payments` rows, consolidated batch payments use the saved allocation snapshot |
| `PaymentDate` | Date of most recent payment |
| `TransactionNumber` | **Deprecated** — not updated for new payments |
| `PaymentType` | **Deprecated** — each payment has its own type |

> 💡 **Backward Compatibility:** Existing jobs with payment data in PrintRequests (but no Payments records) continue to work. The system checks for Payments records first; if none exist, it uses the legacy single-value fields.
>
> 💡 **Canonical ledger rule:** Reporting and reconciliation should read transaction details from `Payments` first. `PrintRequests` payment fields are convenience rollups for the parent request, not the source of truth for individual transactions.
>
> ⚠️ **Consolidated batch rule:** A multi-request batch row is the source of truth for the real-world checkout total, while each affected `PrintRequests` item stores its own allocated rollup values after the payment is saved. Do not try to divide a consolidated `Payments.Amount` evenly after the fact.

---

## Verification Checklist

- [ ] List created with name "Payments"
- [ ] RequestID column: Number type, optional for consolidated batch rows
- [ ] ReqKey column: Single line of text
- [ ] BatchRequestIDs column: Multiple lines of text
- [ ] BatchReqKeys column: Multiple lines of text
- [ ] BatchAllocationSummary column: Multiple lines of text
- [ ] TransactionNumber column: Single line of text, not required
- [ ] Weight column: Number type, required, 0 decimal places
- [ ] Amount column: Currency type, required, 2 decimal places
- [ ] PaymentType column: Choice with 3 options, default "TigerCASH"
- [ ] PaymentDate column: Date only, required
- [ ] RecordedAt column: Date and time, required
- [ ] PayerName column: Single line of text
- [ ] PayerTigerCard column: Single line of text
- [ ] PlatesPickedUp column: Single line of text
- [ ] PlateIDsPickedUp column: Multiple lines of text
- [ ] RecordedBy column: Person type, required
- [ ] StudentOwnMaterial column: Yes/No, default No
- [ ] Permissions stopped inheriting from site
- [ ] Student groups removed from permissions
- [ ] Staff groups have Edit or Contribute access

---

## Monthly Transaction Export

This list is the source for the Monthly Transaction Export (see `PowerApps/StaffDashboard-App-Spec.md` Step 12G and `PowerAutomate/Flow-(G)-Export-MonthlyTransactions.md`). The export queries:

```powerfx
Filter(
    Payments,
    Month(PaymentDate) = varSelectedMonth &&
    Year(PaymentDate) = varSelectedYear
)
```

**Export Columns:**

| Excel Column | Source Field |
|--------------|--------------|
| Date | `PaymentDate` |
| Recorded At | `RecordedAt` |
| Transaction # | `TransactionNumber` |
| Payer | `PayerName` |
| Amount | `Amount` |
| Weight | `Weight` |
| Request Ref | `Coalesce(ReqKey, BatchReqKeys)` |
| Processed By | `RecordedBy.DisplayName` |
| Machine | Single-request rows can use `LookUp(PrintRequests, ID = RequestID).Method.Value`; consolidated rows should render a combined summary if exported |
| Course | Single-request rows can use `LookUp(PrintRequests, ID = RequestID).CourseNumber`; consolidated rows should render a combined summary if exported |

> 💡 **Export sorting rule:** Filter by `PaymentDate` for the selected month, but sort the output by `RecordedAt` so same-day transactions appear in the exact order they were recorded.
>
> 💡 **Consolidated batch export rule:** The Power Automate TigerCASH flow exports each `Payments` row exactly once. A consolidated batch checkout should therefore appear as one exported transaction row, not be expanded back into per-request rows.

---

*Created: March 17, 2026*
