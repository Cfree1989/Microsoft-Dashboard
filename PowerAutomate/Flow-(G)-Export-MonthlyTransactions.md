# Flow G (Export-MonthlyTransactions)

**Full Name:** Export: Generate Monthly TigerCASH Report  
**Trigger:** PowerApps (V2) — manual trigger from the Export Modal (Step 12G)

**Purpose:** Generate an Excel spreadsheet of all TigerCASH payment transactions for a selected month. The file is saved to a SharePoint document library and the download URL is returned to Power Apps. Accounting receives four columns: Transaction #, Payer, Amount, and Date.

---

## Quick Overview

This flow runs when a staff member clicks **Download Excel** in the Export Modal. Here's what happens:

1. **Receive inputs** from Power Apps (month and year)
2. **Compose date range** for the selected month
3. **Query Payments list** with OData filter (TigerCASH only, selected month)
4. **Create Excel file** in SharePoint document library
5. **Add data rows** — one per payment transaction
6. **Add blank rows** — for manual Art Building 123 entries
7. **Return download URL** to Power Apps

---

## Overview

- **Staff clicks Download Excel** → Flow generates a 4-column Excel file
- **Only TigerCASH payments** are included (Check and Code payments are excluded)
- **Art Building 123** (subtractive manufacturing) transactions are not in the dashboard — staff adds them manually to the downloaded file before sending to accounting
- **No delegation limits** — Power Automate queries SharePoint server-side via OData

---

## Prerequisites

- [ ] `Payments` SharePoint list exists (see `SharePoint/Payments-List-Setup.md`)
- [ ] SharePoint document library folder for exports (e.g., `Shared Documents/Exports`)
- [ ] Power Automate license (included with most Microsoft 365 plans)
- [ ] Flow added as a data connection in the Power Apps Staff Console

---

## Error Handling Configuration

**Configure retry policies on the Get items and Create file actions:**
- **Retry Policy Type:** Exponential interval

**How to set retry policy on any action:**
1. Click the **three dots (…)** on the action card
2. Choose **Settings**
3. Scroll down to **Networking** section
4. In **Retry policy** dropdown, select **Exponential interval**
5. Fill in ALL four fields (all are required):
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
6. Click **Done**

---

## Trigger: PowerApps (V2)

1. Create a new **Instant cloud flow**
2. **Name:** `GenerateMonthlyExport`
3. **Trigger:** PowerApps (V2)
4. Add two inputs:

| Input | Type | Name | Description |
|-------|------|------|-------------|
| 1 | Number | `Month` | Month number (1–12) |
| 2 | Number | `Year` | Year (e.g. 2026) |

---

## Step 1: Compose Start and End Dates

**Action:** Compose (x2)

**StartDate:**

```
@{concat(triggerBody()['number_1'], '-', formatNumber(triggerBody()['number'], '00'), '-01')}
```

> Produces e.g. `2026-03-01`

**EndDate:**

```
@{formatDateTime(addDays(endOfMonth(outputs('StartDate')), 1), 'yyyy-MM-dd')}
```

> Produces the first day of the next month, e.g. `2026-04-01`

**MonthName:**

```
@{formatDateTime(outputs('StartDate'), 'MMMM')}
```

> Produces e.g. `March` (used in the filename)

---

## Step 2: Get Payments from SharePoint

**Action:** SharePoint — Get items

| Setting | Value |
|---------|-------|
| Site Address | `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab` |
| List Name | `Payments` |
| Filter Query | See below |
| Order By | `PaymentDate asc, TransactionNumber asc` |
| Top Count | `5000` |

**OData Filter Query:**

```
PaymentDate ge '@{outputs('StartDate')}' and PaymentDate lt '@{outputs('EndDate')}' and PaymentType eq 'TigerCASH'
```

> This returns only TigerCASH payments for the selected month. Check and Code payments are excluded — accounting only reconciles TigerCASH transactions. The `5000` top count is well above any realistic monthly volume.

---

## Step 3: Create Excel File in SharePoint

**Action:** SharePoint — Create file

| Setting | Value |
|---------|-------|
| Site Address | Same as above |
| Folder Path | `/Shared Documents/Exports` |
| File Name | `TigerCASH-Log-@{outputs('MonthName')}-@{triggerBody()['number_1']}.xlsx` |
| File Content | (empty — creates a blank .xlsx) |

> 💡 **Folder setup:** Create the `Exports` folder in your SharePoint document library if it doesn't exist. This keeps generated reports organized and separate from other documents.

**Action:** Excel Online (Business) — Create table

| Setting | Value |
|---------|-------|
| Location | SharePoint site |
| Document Library | `Shared Documents` |
| File | `/Exports/TigerCASH-Log-@{outputs('MonthName')}-@{triggerBody()['number_1']}.xlsx` |
| Table Name | `Transactions` |
| Column Names | `Transaction #, Payer, Amount, Date` |

---

## Step 4: Add Data Rows

**Action:** Apply to each

- **Input:** `body/value` from Get items (Step 2)

Inside the loop — **Excel Online (Business) — Add a row into a table:**

| Setting | Value |
|---------|-------|
| Table Name | `Transactions` |

| Column | Expression |
|--------|------------|
| Transaction # | `items('Apply_to_each')?['TransactionNumber']` |
| Payer | `items('Apply_to_each')?['PayerName']` |
| Amount | `items('Apply_to_each')?['Amount']` |
| Date | `formatDateTime(items('Apply_to_each')?['PaymentDate'], 'M/d/yyyy')` |

---

## Step 5: Add Blank Rows

After the Apply to each loop, add **5 blank rows** so staff can manually type in Art Building 123 (CNC, Plasma) transactions without reformatting the Excel table.

**Action:** Apply to each

- **Input:** `createArray(1, 2, 3, 4, 5)`

Inside the loop — **Excel Online (Business) — Add a row into a table:**

| Column | Value |
|--------|-------|
| Transaction # | ` ` (single space) |
| Payer | ` ` |
| Amount | ` ` |
| Date | ` ` |

> Single spaces keep Excel from collapsing the table rows. Staff overwrites them when entering Art Building data.

---

## Step 6: Return Download URL

**Action:** Respond to a PowerApp or flow

| Output | Type | Value |
|--------|------|-------|
| `FileUrl` | Text | File link from the Create file step (Step 3) |
| `Success` | Text | `true` |

> 💡 Power Apps calls `GenerateMonthlyExport.Run(month, year)` and reads `varExportResult.FileUrl` to trigger the download.

---

## Expected Output

The generated Excel file contains a single table with 4 columns, sorted by date then transaction number:

| Transaction # | Payer | Amount | Date |
|---|---|---|---|
| 214 | Ryan Atkinson | 11.50 | 3/2/2026 |
| 215 | Lily Bacas | 4.90 | 3/2/2026 |
| 216 | Caitlin Mclin | 17.30 | 3/2/2026 |
| ... | ... | ... | ... |
| 298 | Ava Stout | 15.90 | 3/20/2026 |
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

Staff downloads this file, manually adds Art Building 123 entries in the blank rows, and emails the completed report to departmental accounting.

---

## Testing

### Test 1: Normal Month

1. Open Export Modal in Power Apps, select March / 2026
2. Click **Download Excel**
3. Verify flow completes successfully
4. Open the generated file — confirm 4 columns, correct data, sorted by date
5. Confirm 5 blank rows at the bottom
6. Confirm only TigerCASH payments are included (no Check or Code rows)

### Test 2: Empty Month

1. Select a month with no TigerCASH payments
2. Flow should still complete (creating a file with headers and 5 blank rows)
3. Power Apps should show "0 transactions" and disable the button — but test the flow directly too

### Test 3: Duplicate Filenames

1. Run the export twice for the same month/year
2. Verify SharePoint handles the duplicate filename (may append a number)

---

## Related Documents

- **Payments List Setup:** `SharePoint/Payments-List-Setup.md`
- **Staff Dashboard App Spec (Export Modal):** `PowerApps/StaffDashboard-App-Spec.md` — Step 12G
- **Current TigerCASH Log:** `TigerCASH Log 25-26.xlsx` (reference for what accounting currently receives)
- **Flow Testing Guide:** `PowerAutomate/Flow-Testing-Guide.md`

---

*Created: March 20, 2026*
