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

> **Important:** The flow writes JSON keys that match these column names. If a header is spelled differently, the `Add a row into a table` action may fail or place values in the wrong columns.

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

> **Important:** The table name must be exactly `Transactions` with a capital `T`. The flow uses `Transactions` as a custom table value when inserting rows.

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

> **Important:** If the flow creates the output file successfully but `Add Payment Row` fails, the most common cause is a missing table, a wrong table name, or mismatched column headers in `_Template.xlsx`.

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

Use this temporary step while troubleshooting `Add Payment Row` failures. It confirms whether Excel Online can see the `Transactions` table in the newly created workbook before the flow starts inserting rows.

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

## Step 4: Add Data Rows

#### Action 1: Add Payment Rows

**UI steps:**
1. Click **+ Add an action** below `Get Tables`, or below `Delay for Excel Sync` if you are not using the diagnostic step
2. Search for and select **Apply to each**
3. Rename the action to: `Add Payment Rows`
4. In **Select an output from previous steps**, choose **value** from `Get TigerCASH Payments`

#### Action 2: Add Payment Row

**UI steps:**
1. Inside `Add Payment Rows`, click **Add an action**
2. Search for and select **Add a row into a table** (Excel Online (Business))
3. Rename the action to: `Add Payment Row`
4. Fill in:
   - **Location:** `Group - Digital Fabrication Lab`
   - **Document Library:** `Documents`
   - **File:** **Create Export File Id**
   - **Table:** Type `Transactions` → click **Use "Transactions" as a custom value**

5. Build the **Row** field in this order, in the same field:
   - Type `{"Transaction #": "` then insert this expression:

```
item()?['TransactionNumber']
```

   - Type `", "Payer": "` then insert this expression:

```
item()?['PayerName']
```

   - Type `", "Amount": "` then insert this expression:

```
item()?['Amount']
```

   - Type `", "Date": "` then insert this expression:

```
formatDateTime(item()?['PaymentDate'], 'M/d/yyyy')
```

   - Type `"}`

The finished Row field should look like:

```
{"Transaction #": "[TransactionNumber]", "Payer": "[PayerName]", "Amount": "[Amount]", "Date": "[fx]"}
```

> **Important:** Use `item()` inside the `Add Payment Rows` loop. This avoids failures caused by loop-name mismatches such as `items('Add_Payment_Rows')`.

---

## Step 5: Add Blank Rows

#### Action 1: Add Blank Rows

**UI steps:**
1. Click **+ Add an action** below the `Add Payment Rows` loop
2. Search for and select **Apply to each**
3. Rename the action to: `Add Blank Rows`
4. In **Select an output from previous steps**, click **Expression** tab (fx)
5. Paste:

```
createArray(1, 2, 3, 4, 5)
```

6. Click **Update**

#### Action 2: Add Blank Row

**UI steps:**
1. Inside `Add Blank Rows`, click **Add an action**
2. Search for and select **Add a row into a table** (Excel Online (Business))
3. Rename the action to: `Add Blank Row`
4. Fill in:
   - **Location:** `Group - Digital Fabrication Lab`
   - **Document Library:** `Documents`
   - **File:** **Create Export File Id**
   - **Table:** Type `Transactions` → click **Use "Transactions" as a custom value**
   - **Row:**

```
{"Transaction #": " ", "Payer": " ", "Amount": " ", "Date": " "}
```

> **Important:** Use single spaces, not empty strings. Excel Online may reject blank values.

---

## Step 6: Return Result

#### Action 1: Return Export Result

**UI steps:**
1. Click **+ Add an action** below the `Add Blank Rows` loop
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
- include 5 blank rows at the bottom

---

## Testing

### Test 1: Normal Month

1. Run the flow for a month with TigerCASH payments
2. Confirm the file is created in `TigerCASH Logs`
3. Open the file and confirm the four columns, sorted data, and 5 blank rows

### Test 2: Empty Month

1. Run the flow for a month with no TigerCASH payments
2. Confirm the file still opens and contains headers plus 5 blank rows

### Test 3: Excel Timing

1. If `Add Payment Row` fails, increase `Delay for Excel Sync` from `20` to `30` seconds
2. Test again

---

## Related Documents

- `SharePoint/Payments-List-Setup.md`
- `PowerApps/StaffDashboard-App-Spec.md`
- `PowerAutomate/Flow-Testing-Guide.md`

---

*Updated: March 24, 2026*
