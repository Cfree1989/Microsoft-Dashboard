# Flow G (Export-MonthlyTransactions)

**Full Name:** Export: Generate Monthly TigerCASH Report  
**Trigger:** When Power Apps calls a flow (V2)  
**Purpose:** Generate an Excel file of TigerCASH payments for a selected month and return the file URL to Power Apps.

---

## Prerequisites

- `Payments` SharePoint list exists
- SharePoint folder exists: `Shared Documents/TigerCASH Logs`
- `_Template.xlsx` exists in that folder
- `_Template.xlsx` already contains a table named `Transactions`
- The `Transactions` table has these columns in this order:
  - `Transaction #`
  - `Payer`
  - `Amount`
  - `Date`

> **Important:** This flow assumes the table already exists in `_Template.xlsx`. Do not create the table at runtime.

---

## `_Template.xlsx` Setup Instructions

Create the template workbook before building the flow. The copied export file will only work if the workbook already contains a real Excel table named `Transactions`.

### Where to create the file

1. Go to the SharePoint site:
   `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
2. Open **Documents**.
3. Open the folder `TigerCASH Logs`.
4. Create a new Excel workbook named `_Template.xlsx`, or upload a workbook with that exact file name.

> **Important:** The file name must be exactly `_Template.xlsx` because the `Get Template` step reads that exact path.

### Build the worksheet

1. Open `_Template.xlsx` in Excel.
2. Use the first worksheet, or create a worksheet that will hold the export table.
3. In row `1`, enter these headers exactly as written:
   - Cell `A1`: `Transaction #`
   - Cell `B1`: `Payer`
   - Cell `C1`: `Amount`
   - Cell `D1`: `Date`
4. Make sure the header text, spacing, and punctuation match exactly.

> **Important:** The Office Script writes values into the `Transactions` table in this exact column order. If a header is spelled differently, the script may write to the wrong columns or fail to find the expected table layout.

### Convert the range into a table

1. If Excel requires at least one sample row before creating a table, enter temporary values in row `2`.
   - `A2`: `TEMP`
   - `B2`: `TEMP`
   - `C2`: `0`
   - `D2`: `1/1/2000`
2. Select cells `A1:D2`.
3. Click **Insert** -> **Table**.
4. Confirm **My table has headers** is checked.
5. Click **OK**.
6. Click anywhere inside the new table.
7. Open the **Table Design** tab.
8. In **Table Name**, replace the default name with:

```
Transactions
```

9. Press **Enter** to save the table name.

> **Important:** The table name must be exactly `Transactions` with a capital `T`. The script below looks up this table by name.

### Clean up the template

1. If you created a temporary sample row, select the data cells in row `2` and clear them, or delete the temporary table row if the table remains intact.
2. Confirm the table still exists after cleanup.
3. Confirm the table still shows the header row:
   - `Transaction #`
   - `Payer`
   - `Amount`
   - `Date`
4. Save the workbook.
5. Close the workbook.

> **Important:** Do not replace the table with plain cells. The workbook must contain an actual Excel table object, not just formatted headers.

### Recommended formatting

These settings are optional, but they make the exported file easier to read:

1. Format the `Amount` column as **Number** or **Currency**.
2. Format the `Date` column as **Short Date**.
3. Bold the header row.
4. Auto-fit columns `A:D`.

> **Note:** Formatting does not affect the flow logic. Only the table name and column headers are required for the flow to work.

### Final verification checklist

Before using the flow, reopen `_Template.xlsx` and confirm all of the following:

- the file is stored in `Shared Documents/TigerCASH Logs`
- the file name is `_Template.xlsx`
- the workbook contains an Excel table, not just a header row
- the table name is `Transactions`
- the columns are exactly `Transaction #`, `Payer`, `Amount`, `Date`
- the column order is exactly the same as listed above
- the workbook opens without errors in SharePoint/Excel

> **Important:** If the flow creates the output file successfully but row insertion still fails, do not assume the template is the primary issue. In testing, `Get Tables` could see the copied workbook and table, but `Add a row into a table` still failed. This document now uses an Office Script instead of `AddRowV2`.

---

## Office Script Prerequisite

This flow now uses an Excel Office Script to write all payment rows into the copied workbook.

### Create the script

1. Open `_Template.xlsx` in Excel for the web.
2. Go to the **Automate** tab.
3. Click **New Script**.
4. Replace the starter code with:

```typescript
function main(
  workbook: ExcelScript.Workbook,
  rowsJson: string,
  blankRowCount: number
) {
  const table = workbook.getTable("Transactions");

  // Remove any placeholder blank rows that were left in the template table.
  const existingRange = table.getRangeBetweenHeaderAndTotal();
  const existingValues = existingRange.getValues();
  for (let i = existingValues.length - 1; i >= 0; i--) {
    const isBlankRow = existingValues[i].every((cell) =>
      String(cell ?? "").trim() === ""
    );
    if (isBlankRow) {
      table.deleteRowsAt(i, 1);
    }
  }

  const rows = JSON.parse(rowsJson) as Array<{
    transactionNumber: string;
    payer: string;
    amount: string | number;
    date: string;
  }>;

  const values = rows.map((row) => [
    row.transactionNumber ?? "",
    row.payer ?? "",
    row.amount ?? "",
    row.date ?? "",
  ]);

  if (values.length > 0) {
    table.addRows(-1, values);
  }

  // Optional manual-entry rows inside the table. These appear after the exported
  // payment rows and before the total row so staff can add items by hand later.
  const blanksToAdd = Number(blankRowCount ?? 0);
  if (blanksToAdd > 0) {
    const blankRows: (string | number)[][] = [];
    for (let i = 0; i < blanksToAdd; i++) {
      blankRows.push([" ", " ", " ", " "]);
    }
    table.addRows(-1, blankRows);
  }

  // Apply simple layout cleanup after rows are written.
  table.getRange().getFormat().autofitColumns();
  table.getRange().getFormat().autofitRows();

  table.getHeaderRowRange().getFormat().setHorizontalAlignment(
    ExcelScript.HorizontalAlignment.center
  );

  table.getColumnByName("Transaction #").getRange().getFormat().setHorizontalAlignment(
    ExcelScript.HorizontalAlignment.center
  );
  table.getColumnByName("Amount").getRange().getFormat().setHorizontalAlignment(
    ExcelScript.HorizontalAlignment.right
  );
  table.getColumnByName("Date").getRange().getFormat().setHorizontalAlignment(
    ExcelScript.HorizontalAlignment.center
  );

  // Show a total row at the bottom of the table, but only keep a value in Amount.
  table.setShowTotals(true);
  table.getColumnByName("Transaction #").getTotalRowRange().clear(
    ExcelScript.ClearApplyTo.contents
  );
  table.getColumnByName("Payer").getTotalRowRange().clear(
    ExcelScript.ClearApplyTo.contents
  );
  table.getColumnByName("Amount").getTotalRowRange().setFormula(
    "=SUBTOTAL(109,[Amount])"
  );
  table.getColumnByName("Amount").getTotalRowRange().setNumberFormat(
    "$#,##0.00"
  );
  table.getColumnByName("Date").getTotalRowRange().clear(
    ExcelScript.ClearApplyTo.contents
  );
}
```

5. Rename the script to: `AppendMonthlyTransactions`
6. Save the script.

### What the script does

- reads the payment rows passed in from Power Automate
- finds the `Transactions` table in the workbook
- removes placeholder blank rows left in the template
- appends all payment rows in one operation
- adds blank manual-entry rows after the exported payments
- auto-fits the table columns
- applies basic alignment for headers, amounts, dates, and transaction numbers
- shows a total row at the bottom of the table with only the `Amount` total populated

> **Important:** Save the script in a workbook location that your Excel Online (Business) connection can access. The flow will call this script against the copied export workbook.

---

## Retry Policy

Use this retry policy on `Get TigerCASH Payments` and `Create Export File`:

- **Retry policy:** `Exponential interval`
- **Count:** `4`
- **Interval:** `PT1M`
- **Minimum interval:** `PT20S`
- **Maximum interval:** `PT1H`

---

## Create Flow

### Trigger

**UI steps:**
1. Go to **Power Automate** → **My flows**
2. Click **+ New flow** → **Instant cloud flow**
3. **Flow name:** `Flow-(G)-Export-MonthlyTransactions`
4. **Trigger:** `When Power Apps calls a flow (V2)`
5. Click **Create**

### Inputs

**UI steps:**
1. Open the trigger card
2. Click **+ Add an input** → select **Number**
3. Rename the first input to `Month`
4. Click **+ Add an input** again → select **Number**
5. Rename the second input to `Year`

> **Important:** Add the inputs in this order. Later expressions expect `Month = triggerBody()['number']` and `Year = triggerBody()['number_1']`.

---

## Step 1: Compose Dates

#### Action 1: StartDate

**UI steps:**
1. Click **+ Add an action** below the trigger
2. Search for and select **Compose**
3. Rename the action to: `StartDate`
4. Click inside **Inputs** → **Expression** tab (fx)
5. Paste:

```
concat(triggerBody()['number_1'], '-', formatNumber(triggerBody()['number'], '00'), '-01')
```

6. Click **Update**

#### Action 2: EndDate

**UI steps:**
1. Click **+ Add an action** below `StartDate`
2. Search for and select **Compose**
3. Rename the action to: `EndDate`
4. Click inside **Inputs** → **Expression** tab (fx)
5. Paste:

```
formatDateTime(addToTime(outputs('StartDate'), 1, 'Month'), 'yyyy-MM-dd')
```

6. Click **Update**

#### Action 3: MonthName

**UI steps:**
1. Click **+ Add an action** below `EndDate`
2. Search for and select **Compose**
3. Rename the action to: `MonthName`
4. Click inside **Inputs** → **Expression** tab (fx)
5. Paste:

```
formatDateTime(outputs('StartDate'), 'MMMM')
```

6. Click **Update**

---

## Step 2: Get Payments

#### Action 1: Get TigerCASH Payments

**UI steps:**
1. Click **+ Add an action** below `MonthName`
2. Search for and select **Get items** (SharePoint)
3. Rename the action to: `Get TigerCASH Payments`
4. Click **Show advanced options**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `Payments`
   - **Filter Query:** `PaymentDate ge '` + **StartDate Outputs** + `' and PaymentDate lt '` + **EndDate Outputs** + `' and PaymentType eq 'TigerCASH'`
   - **Order By:** `PaymentDate asc, TransactionNumber asc`
   - **Top Count:** `5000`

**Configure retry policy:**
1. Click **three dots (…)** → **Settings**
2. Under **Networking**, set:
   - **Retry policy:** `Exponential interval`
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
3. Click **Done**

---

## Step 3: Create Export File

#### Action 1: Get Template

**UI steps:**
1. Click **+ Add an action** below `Get TigerCASH Payments`
2. Search for and select **Get file content** (SharePoint)
3. Rename the action to: `Get Template`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **File Identifier:** `Shared Documents/TigerCASH Logs/_Template.xlsx`

#### Action 2: Create Export File

**UI steps:**
1. Click **+ Add an action** below `Get Template`
2. Search for and select **Create file** (SharePoint)
3. Rename the action to: `Create Export File`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **Folder Path:** `/Shared Documents/TigerCASH Logs`
   - **File Name:** `TigerCASH-Log-` + **MonthName Outputs** + `-` + **Year** + `.xlsx`
   - **File Content:** **Get Template File Content**

**Configure retry policy:**
1. Click **three dots (…)** → **Settings**
2. Under **Networking**, set:
   - **Retry policy:** `Exponential interval`
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
3. Click **Done**

#### Action 3: Delay for Excel Sync

**UI steps:**
1. Click **+ Add an action** below `Create Export File`
2. Search for and select **Delay**
3. Rename the action to: `Delay for Excel Sync`
4. Fill in:
   - **Count:** `20`
   - **Unit:** `Second`

> **Important:** Excel Online may not recognize a newly copied workbook immediately. If row inserts still fail, increase this delay to `30` seconds.

---

## Optional Diagnostic: Verify Workbook Tables

Use this temporary step while troubleshooting workbook-write failures. It confirms whether Excel Online can see the `Transactions` table in the newly created workbook before the script runs.

#### Action 1: Get Tables

**UI steps:**
1. Click **+ Add an action** below `Delay for Excel Sync`
2. Search for and select **Get tables** (Excel Online (Business))
3. Rename the action to: `Get Tables`
4. Fill in:
   - **Location:** `Group - Digital Fabrication Lab`
   - **Document Library:** `Documents`
   - **File:** **Create Export File Id**

**How to use this test:**
1. Save the flow and run it once
2. Open the run history
3. Click the `Get Tables` action
4. Open **Outputs** → **Show raw outputs**
5. Confirm the output includes a table named `Transactions`

**What the result means:**
- If `Get Tables` succeeds and returns `Transactions`, Excel can see the copied workbook and table
- If `Get Tables` fails, or succeeds without showing `Transactions`, the issue is likely workbook readiness, file binding, or missing table metadata in `_Template.xlsx`

> **Important:** This is a diagnostic step, not part of the final production flow. Remove it after troubleshooting is complete.

---

## Step 4: Build Rows JSON

Before calling the script, convert the SharePoint items into a JSON string that contains only the fields the script needs.

#### Action 1: Build Payment Rows JSON

**UI steps:**
1. Click **+ Add an action** below `Get Tables`, or below `Delay for Excel Sync` if you are not using the diagnostic step
2. Search for and select **Select** (Data Operation)
3. Rename the action to: `Build Payment Rows JSON`
4. In **From**, choose **value** from `Get TigerCASH Payments`
5. In the mapping editor, create these properties.
6. For each value field, click the field, open the **Expression** tab, paste the expression, and click **Update**. Do not type the expressions as plain text.
7. Use these exact mappings:
   - `transactionNumber` = `item()?['TransactionNumber']`
   - `payer` = `item()?['PayerName']`
   - `amount` = `item()?['Amount']`
   - `date` = `formatDateTime(item()?['PaymentDate'], 'M/d/yyyy')`

> **Important:** This action creates a clean array of plain values for the script. It replaces the old `Apply to each` + `Add a row into a table` pattern.

> **Important:** If you type `item()?['TransactionNumber']` directly into the field without using the **Expression** tab, Power Automate will treat it as literal text and the script will write that text into Excel.

---

## Step 5: Run Office Script

#### Action 1: Run Script

**UI steps:**
1. Click **+ Add an action** below `Build Payment Rows JSON`
2. Search for and select **Run script** (Excel Online (Business))
3. Rename the action to: `Write Transactions to Workbook`
4. Fill in:
   - **Location:** `Group - Digital Fabrication Lab`
   - **Document Library:** `Documents`
   - **File:** **Create Export File Id**
   - **Script:** `AppendMonthlyTransactions`
   - **rowsJson:** Use the **Expression** tab and paste:

```
string(body('Build_Payment_Rows_JSON'))
```

   - **blankRowCount:** `5`

> **Important:** `rowsJson` must be the JSON string version of the `Select` output, not the raw SharePoint items array.

> **Important:** This script replaces both the old `Add Payment Row` loop and the old `Add Blank Rows` loop. Set `blankRowCount` to the number of manual-entry rows you want after the exported payments. With `blankRowCount = 5`, the table will show payment rows first, then 5 blank rows, then the total row at the bottom.

---

## Step 6: Return Result

#### Action 1: Return Export Result

**UI steps:**
1. Click **+ Add an action** below `Write Transactions to Workbook`
2. Search for and select **Respond to a Power App or flow**
3. Rename the action to: `Return Export Result`
4. Click **+ Add an output** → **Text**
5. **Title:** `FileUrl`
6. In **Enter a value to respond**, click the **Expression** tab (fx) and paste:

```
concat(
  'https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab',
  replace(outputs('Create_Export_File')?['body/Path'], ' ', '%20')
)
```

7. Click **+ Add an output** → **Text**
8. **Title:** `Success`
9. **Enter a value to respond:** `true`

> **Important:** Use the file created by `Create Export File`, not `Link to item` from `Get TigerCASH Payments`. The SharePoint list link points to a payment record, not the exported Excel workbook.

> **Important:** In Power Apps, the returned property is `fileurl` in lowercase.

---

## Expected Result

The export file should:

- contain the `Transactions` table
- include only TigerCASH rows for the selected month
- be sorted by `PaymentDate asc, TransactionNumber asc`
- auto-fit the columns to the inserted values
- include 5 blank rows after the exported payments for manual additions
- include a total row at the bottom of the table with only the `Amount` cell populated

---

## Testing

### Test 1: Normal Month

1. Run the flow for a month with TigerCASH payments
2. Confirm the file is created in `TigerCASH Logs`
3. Open the file and confirm the four columns, sorted data, no starter blank row, 5 blank manual-entry rows after the exported payments, and a total row where only `Amount` is populated

### Test 2: Empty Month

1. Run the flow for a month with no TigerCASH payments
2. Confirm the file still opens and contains headers, 5 blank manual-entry rows, and the total row with only `Amount` populated

### Test 3: Excel Timing

1. Run the flow with `Get Tables` still enabled
2. Confirm `Get Tables` succeeds and can see `Transactions`
3. Open `Build Payment Rows JSON` in the run history and confirm it contains real values such as transaction numbers, names, amounts, and dates, not literal text like `item()?['TransactionNumber']`
4. Confirm `Write Transactions to Workbook` succeeds
5. If the script step fails immediately after file creation, increase `Delay for Excel Sync` from `20` to `30` seconds and test again
6. After the flow works reliably, remove the temporary `Get Tables` step if you do not want to keep it for diagnostics

---

## Related Documents

- `SharePoint/Payments-List-Setup.md`
- `PowerApps/StaffDashboard-App-Spec.md`
- `PowerAutomate/Flow-Testing-Guide.md`

---

*Updated: March 24, 2026*
