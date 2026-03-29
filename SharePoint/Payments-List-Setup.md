# Payments SharePoint List Setup

**Purpose:** Track individual payment transactions for print jobs supporting multi-payment workflows  
**Time Required:** 20 minutes

---

## Overview

The Payments list stores individual transaction records for print jobs. Unlike the single-value payment fields on `PrintRequests`, this list supports multiple payments per job — essential for partial pickup workflows where students collect and pay for parts of their order over multiple visits.

**Key Features:**
- 14 columns capturing full transaction details
- One-to-many relationship with PrintRequests (multiple payments per job)
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
6. **Description:** `Individual payment transaction records for print jobs`
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

### Column 2: ReqKey (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `ReqKey`
3. **Description:** `Request reference for easy identification (e.g., REQ-00042)`
4. Click **Save**

### Column 3: TransactionNumber (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `TransactionNumber`
3. **Description:** `TigerCASH receipt, check number, or grant/program code`
4. **Require that this column contains information:** No
5. Click **Save**

> 💡 **Purpose:** The identifier for this payment transaction. Format depends on PaymentType (receipt for TigerCASH, check number for Check, code for grants). This field is **not required** because grant/program codes are not always available at the time of payment — staff may need to record the payment first and add the code later.
>
> 💡 **Batch note:** If one checkout covers multiple requests, create one `Payments` row per request but reuse the same `TransactionNumber` across all rows created from that shared transaction.
>
> ⚠️ **Do not use a TigerCard number as the transaction number.** The TigerCard belongs in `PayerTigerCard`; `TransactionNumber` should hold the TigerCASH receipt / approval / reference number.

### Column 4: Weight (Number)

1. Click **+ Add column** → **Number**
2. **Name:** `Weight`
3. **Description:** `Grams picked up in this transaction`
4. **Number of decimal places:** 0
5. **Require that this column contains information:** Yes
6. Click **Save**

### Column 5: Amount (Currency)

1. Click **+ Add column** → **Currency**
2. **Name:** `Amount`
3. **Description:** `Cost charged for this transaction`
4. **Currency format:** $ English (United States)
5. **Number of decimal places:** 2
6. **Require that this column contains information:** Yes
7. Click **Save**

### Column 6: PaymentType (Choice)

1. Click **+ Add column** → **Choice**
2. **Name:** `PaymentType`
3. **Description:** `Payment method used`
4. **Choices:**
   - TigerCASH
   - Check
   - Code
5. **Default value:** TigerCASH
6. **Require that this column contains information:** Yes
7. Click **Save**

### Column 7: PaymentDate (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `PaymentDate`
3. **Description:** `Business date of the payment transaction`
4. **Include time:** No
5. **Require that this column contains information:** Yes
6. Click **Save**

> 💡 **Purpose:** This is the staff-selected accounting date for the payment.
>
> 💡 **Batch note:** For batched checkouts, reuse the same payment date on every `Payments` row created from that transaction.

### Column 8: RecordedAt (Date and time)

1. Click **+ Add column** → **Date and time**
2. **Name:** `RecordedAt`
3. **Description:** `Exact timestamp when the payment row was saved`
4. **Include time:** Yes
5. **Require that this column contains information:** Yes
6. Click **Save**

> 💡 **Purpose:** Use this field for transaction ordering, audit reconstruction, and export timestamps. Unlike `PaymentDate`, this should capture the real save time to the minute.
>
> 💡 **Batch note:** When one real-world checkout creates multiple `Payments` rows, stamp the same `RecordedAt` value on every row created by that batch action.

### Column 9: PayerName (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `PayerName`
3. **Description:** `Name of person who paid`
4. Click **Save**

> 💡 **Purpose:** Tracks who actually paid for this transaction. May differ from the student who submitted the request (e.g., friend, parent, grant administrator).
>
> 💡 **Batch note:** For batched checkouts, stamp the same payer name on every `Payments` row generated from that single real-world transaction.

### Column 10: PayerTigerCard (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `PayerTigerCard`
3. **Description:** `TigerCard number of payer (for remote charging)`
4. Click **Save**

### Column 11: PlatesPickedUp (Single line of text)

1. Click **+ Add column** → **Single line of text**
2. **Name:** `PlatesPickedUp`
3. **Description:** `Plate display labels collected in this transaction (e.g., "1/4, 2/4", "Reprint 1")`
4. Click **Save**

> 💡 **Purpose:** Links this payment to specific build plates. When Build Plate Tracking is enabled, staff can check which plates are being picked up during payment, and the exact staff-facing plate labels are recorded here.

### Column 12: PlateIDsPickedUp (Multiple lines of text)

1. Click **+ Add column** → **Multiple lines of text**
2. **Name:** `PlateIDsPickedUp`
3. **Description:** `PlateKey snapshot captured at pickup time for this transaction`
4. Click **Save**

> ⚠️ **Important:** This stores the best available plate snapshot at pickup time. `PlatesPickedUp` is only a human-readable display snapshot, and even `PlateIDsPickedUp` can become historical context rather than a live 1:1 map if staff later re-slice, replace, relabel, or renumber plates. The canonical transaction record is still the `Payments` row itself.

### Column 13: RecordedBy (Person)

1. Click **+ Add column** → **Person**
2. **Name:** `RecordedBy`
3. **Description:** `Staff member who processed payment`
4. **Require that this column contains information:** Yes
5. **Allow multiple selections:** No
6. Click **Save**

### Column 14: StudentOwnMaterial (Yes/No)

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
| RequestID | Number | Yes | - | Links to PrintRequests.ID |
| ReqKey | Single line | No | - | Request reference (REQ-00042) |
| TransactionNumber | Single line | No | - | Receipt/check/code reference (not always available for grants) |
| Weight | Number | Yes | - | Grams picked up in this transaction |
| Amount | Currency | Yes | - | Cost charged |
| PaymentType | Choice | Yes | TigerCASH | TigerCASH / Check / Code |
| PaymentDate | Date | Yes | - | Business date of the payment |
| RecordedAt | DateTime | Yes | - | Exact timestamp the payment row was saved |
| PayerName | Single line | No | - | Who paid |
| PayerTigerCard | Single line | No | - | Payer's TigerCard number |
| PlatesPickedUp | Single line | No | - | Display plate labels collected (e.g., "1/4, 2/4", "Reprint 1") |
| PlateIDsPickedUp | Multiple lines | No | - | Stable PlateKey values for picked-up plates |
| RecordedBy | Person | Yes | - | Staff who processed payment |
| StudentOwnMaterial | Yes/No | No | No | 70% discount applied |

---

## Data Flow Example

**Scenario:** Student submits request REQ-00042. Job has 5 plates. Student picks up in 2 visits.

| ID | RequestID | ReqKey | TransactionNumber | Weight | Amount | PaymentDate | RecordedAt | PlatesPickedUp | PlateIDsPickedUp | PayerName |
|----|-----------|--------|-------------------|--------|--------|-------------|------------|----------------|------------------|-----------|
| 1 | 42 | REQ-00042 | TXN-44821 | 85 | $8.50 | 3/15/2026 | 3/15/2026 2:14 PM | 1/5, 2/5, 3/5 | BP-42-A1, BP-42-A2, BP-42-A3 | Jane Smith |
| 2 | 42 | REQ-00042 | TXN-44890 | 62 | $6.20 | 3/16/2026 | 3/16/2026 11:08 AM | 4/5, Reprint 1 | BP-42-B1, BP-42-R3 | Jane Smith |

**What this shows:**
- 2 separate transactions for same job
- Both transaction numbers preserved (not overwritten)
- Plates linked to each payment with both display labels and stable IDs
- Finance report will show 2 rows

---

## Relationship to PrintRequests

The `PrintRequests` list has payment fields that become **running totals** when Payments records exist:

| PrintRequests Field | Payments Relationship |
|---------------------|----------------------|
| `FinalWeight` | `Sum(Payments.Weight)` — running total |
| `FinalCost` | `Sum(Payments.Amount)` — running total |
| `PaymentDate` | Date of most recent payment |
| `TransactionNumber` | **Deprecated** — not updated for new payments |
| `PaymentType` | **Deprecated** — each payment has its own type |

> 💡 **Backward Compatibility:** Existing jobs with payment data in PrintRequests (but no Payments records) continue to work. The system checks for Payments records first; if none exist, it uses the legacy single-value fields.
>
> 💡 **Canonical ledger rule:** Reporting and reconciliation should read transaction details from `Payments` first. `PrintRequests` payment fields are convenience rollups for the parent request, not the source of truth for individual transactions.

---

## Verification Checklist

- [ ] List created with name "Payments"
- [ ] RequestID column: Number type, required
- [ ] ReqKey column: Single line of text
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
| Request ID | `ReqKey` |
| Processed By | `RecordedBy.DisplayName` |
| Machine | `LookUp(PrintRequests, ID = RequestID).Method.Value` |
| Course | `LookUp(PrintRequests, ID = RequestID).CourseNumber` |

> 💡 **Export sorting rule:** Filter by `PaymentDate` for the selected month, but sort the output by `RecordedAt` so same-day transactions appear in the exact order they were recorded.

---

*Created: March 17, 2026*
