# Flow G (Export-MonthlyTransactions)

**Full Name:** Export: Generate Monthly TigerCASH Report  
**Trigger:** When Power Apps calls a flow (V2) — manual trigger from the Export Modal (Step 12G)

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
- [ ] SharePoint document library folder for exports (`Shared Documents/TigerCASH Logs`)
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

## Flow Creation & Trigger Setup

**What this does:** Creates the instant cloud flow and configures the trigger so Power Apps can call it with a month and year.

### Create the Flow

1. Go to **Power Automate** → **My flows**
2. Click **+ New flow** → **Instant cloud flow**
3. In the **"Build an instant cloud flow"** dialog:
   - **Flow name:** Type `Flow-(G)-Export-MonthlyTransactions`
   - **Choose how to trigger this flow:** Select **When Power Apps calls a flow (V2)** (the one with the red Power Apps icon that says "Power Apps" underneath)
4. Click **Create**

> **Why (V2)?** The older "Power Apps" trigger (used in Flow C) only supports text inputs — you have to pass everything as strings. The **(V2)** trigger supports typed inputs (Number, Text, Yes/No, File, etc.), so Power Apps can send month and year as actual numbers instead of strings. This avoids `int()` conversion expressions later in the flow.

**Verify:** Flow should open in the editor with a single **"When Power Apps calls a flow (V2)"** trigger card at the top.

### Add Input Parameters

**What this does:** Defines the two number inputs that Power Apps will send when staff trigger the export. The (V2) trigger lets you pick input types directly — no conversion expressions needed.

**⚠️ Parameter Order Matters:** Power Automate assigns internal names (`number`, `number_1`) based on the order you add them. Add them in the exact order below to match the expressions in later steps.

1. Click on the **When Power Apps calls a flow (V2)** trigger card to expand it
2. Click **+ Add an input**
3. Select **Number** from the type options

#### Input 1: Month
- **Input type:** Number
- **Input name:** Click the label that says "Number" and type `Month`
- **Description (optional):** Click "Please enter a description" and type `Month number (1–12)`
- **Internal reference:** `triggerBody()['number']`

4. Click **+ Add an input** again
5. Select **Number**

#### Input 2: Year
- **Input type:** Number
- **Input name:** Click the label and type `Year`
- **Description (optional):** Click "Please enter a description" and type `Year (e.g. 2026)`
- **Internal reference:** `triggerBody()['number_1']`

**Verify:** The trigger card should show two inputs — **Month** (number) and **Year** (number). Save the flow and confirm no errors appear.

| Input | Type | Internal Reference | Description |
|-------|------|--------------------|-------------|
| Month | Number | `triggerBody()['number']` | Month number (1–12) |
| Year | Number | `triggerBody()['number_1']` | Year (e.g. 2026) |

> **How internal names work:** The first Number input gets the key `number`. The second Number input gets `number_1`. If you added a Text input, it would get `text`. These keys are what you reference in expressions throughout the flow (e.g., `triggerBody()['number']` to get the month value).

---

## Step 1: Compose Start and End Dates

**What this does:** Creates three formulas that calculate the date range for the selected month. These are used by later steps to filter payments and name the exported file. Each formula is its own **Compose** action — a simple action that evaluates an expression and stores the result so other steps can reference it.

> **What is a Compose action?** Think of it as a calculator step. You give it a formula (an *expression*), it computes the result, and you can use that result later by its name. For example, the `StartDate` Compose calculates `2026-03-01`, and then later steps reference `outputs('StartDate')` to use that value.

#### Action 1: StartDate

1. Click the **+** button below the trigger card → Select **Add an action**
2. In the search box, type `Compose`
3. Select **Compose** (under "Data Operations" — it has a blue icon)
4. **Rename the action:**
   - Click the **three dots (…)** on the Compose card → Click **Rename** → Type `StartDate` → Press **Enter**
5. Click inside the **Inputs** field (the empty text box that says "Inputs")
6. A panel appears with two tabs: **Dynamic content** and **Expression**. Click the **Expression** tab (it has an *fx* icon)
7. In the expression box, paste this formula exactly:

```
concat(triggerBody()['number_1'], '-', formatNumber(triggerBody()['number'], '00'), '-01')
```

8. Click **OK** (or **Add**) to insert the expression. The Inputs field should now show a green formula tag instead of plain text.

> **What this produces:** If staff selected Month = 3, Year = 2026, this builds the string `2026-03-01` (the first day of that month). It takes the Year (`number_1`), a dash, the Month (`number`) zero-padded to two digits, and `-01`.

#### Action 2: EndDate

1. Click the **+** button below the StartDate card → **Add an action**
2. Search for `Compose` → Select **Compose**
3. **Rename:** Click **three dots (…)** → **Rename** → Type `EndDate`
4. Click inside the **Inputs** field
5. Click the **Expression** tab (fx)
6. Paste this formula:

```
formatDateTime(addToTime(outputs('StartDate'), 1, 'Month'), 'yyyy-MM-dd')
```

7. Click **OK**

> **What this produces:** The first day of the *next* month, e.g. `2026-04-01`. It takes the StartDate (already the 1st of the month) and adds 1 month. This is used as the upper bound in the payment query — "give me payments *before* this date" — so we get the full month without including the next month.

#### Action 3: MonthName

1. Click the **+** button below the EndDate card → **Add an action**
2. Search for `Compose` → Select **Compose**
3. **Rename:** Click **three dots (…)** → **Rename** → Type `MonthName`
4. Click inside the **Inputs** field
5. Click the **Expression** tab (fx)
6. Paste this formula:

```
formatDateTime(outputs('StartDate'), 'MMMM')
```

7. Click **OK**

> **What this produces:** The full month name, e.g. `March`. This is used later in the Excel filename (`TigerCASH-Log-March-2026.xlsx`).

**Verify:** Save the flow. You should now have three Compose actions in a row below the trigger — `StartDate`, `EndDate`, `MonthName`. None should show errors. If you click any of them, the Inputs field should show a green expression tag (not plain text).

---

## Step 2: Get Payments from SharePoint

**What this does:** Queries the Payments SharePoint list for all TigerCASH transactions in the selected month. Check and Code payments are excluded — accounting only reconciles TigerCASH. The results feed into Steps 4 and 5.

1. Click the **+** button below the `MonthName` card → **Add an action**
2. In the search box, type `Get items`
3. Select **Get items** under **SharePoint** (green SharePoint icon)
4. **Rename:** Click **three dots (…)** → **Rename** → Type `Get TigerCASH Payments`
5. Fill in the basic fields:
   - **Site Address:** Select or type `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** Select `Payments` from the dropdown

6. Click **Show advanced options** (at the bottom of the card) to reveal the filter, sort, and limit fields.

7. **Filter Query** — build this in parts (do NOT paste as one string):
   1. Type: `PaymentDate ge '`
   2. Click the **Dynamic content** tab → Under **StartDate**, select **Outputs** (it inserts a purple tag)
   3. Type: `' and PaymentDate lt '`
   4. Click **Dynamic content** → Under **EndDate**, select **Outputs**
   5. Type: `' and PaymentType eq 'TigerCASH'`

   > The finished Filter Query field should look like: `PaymentDate ge '`**[StartDate]**`' and PaymentDate lt '`**[EndDate]**`' and PaymentType eq 'TigerCASH'` where the purple tags are dynamic content.

8. **Order By:** Type `PaymentDate asc, TransactionNumber asc`
9. **Top Count:** Type `5000`

> **What is "Top Count"?** It limits how many items SharePoint returns. `5000` is well above any realistic monthly volume — it just means "get everything." SharePoint's hard max is 5000 per request.

**Configure retry policy:**
1. Click **three dots (…)** on the `Get TigerCASH Payments` card → **Settings**
2. **Retry policy:** Select **Exponential interval**
3. **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
4. Click **Done**

**Verify:** Save the flow. The `Get TigerCASH Payments` card should show no errors.

---

## Step 3: Create Excel File in SharePoint

**What this does:** Creates a new Excel file in the SharePoint document library by copying a blank template, then adds an empty table with 4 columns (Transaction #, Payer, Amount, Date). This is three actions — get the template content, create the file, then create the table inside it.

> **Folder & template setup:** Before building this step, make sure:
> 1. The `TigerCASH Logs` folder exists in your SharePoint document library. Go to **Documents** → **+ New** → **Folder** → Name it `TigerCASH Logs`.
> 2. A blank Excel template file exists in that folder. On your computer, open **Excel** → save a completely blank workbook as `_Template.xlsx` → upload it to the `TigerCASH Logs` folder in SharePoint. The underscore keeps it sorted to the top so it's easy to find.

#### Action 1: Get the Template Content

**What this does:** Reads the blank `_Template.xlsx` file from SharePoint so we can use its content to create a new file. SharePoint's "Create file" action requires actual file content — you can't leave it blank because `.xlsx` is a binary format, not plain text.

1. Click the **+** button below `Get TigerCASH Payments` → **Add an action**
2. In the search box, type `Get file content`
3. Select **Get file content** under **SharePoint** (green icon)
4. **Rename:** Click **three dots (…)** → **Rename** → Type `Get Template`
5. Fill in:
   - **Site Address:** Select `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **File Identifier:** Click the folder icon → Navigate to **Shared Documents** → **TigerCASH Logs** → Select `_Template.xlsx`

#### Action 2: Create the Excel File

1. Click the **+** button below `Get Template` → **Add an action**
2. Search for `Create file` → Select **Create file** under **SharePoint**
3. **Rename:** Click **three dots (…)** → **Rename** → Type `Create Export File`
4. Fill in:
   - **Site Address:** Select `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **Folder Path:** Click the folder icon and navigate to `/Shared Documents/TigerCASH Logs`, or type `/Shared Documents/TigerCASH Logs`
   - **File Name** — build in parts:
     1. Type: `TigerCASH-Log-`
     2. Click **Dynamic content** → Under **MonthName**, select **Outputs**
     3. Type: `-`
     4. Click **Dynamic content** → Under **When Power Apps calls a flow (V2)**, select **Year**
     5. Type: `.xlsx`
     > The finished field should look like: `TigerCASH-Log-`**[MonthName]**`-`**[Year]**`.xlsx`
   - **File Content:** Click inside the field → Click **Dynamic content** → Under **Get Template**, select **File Content**

**Configure retry policy:**
1. Click **three dots (…)** on the `Create Export File` card → **Settings**
2. **Retry policy:** Select **Exponential interval**
3. **Count:** `4` | **Interval:** `PT1M` | **Minimum interval:** `PT20S` | **Maximum interval:** `PT1H`
4. Click **Done**

#### Action 3: Create the Table Inside the File

> **First-time setup:** The first time you add an Excel Online (Business) action, Power Automate will ask you to **sign in**. This is normal — Excel Online is a separate connector from SharePoint and needs its own connection. Sign in with your LSU account and authorize it. You only have to do this once.

1. Click the **+** button below `Create Export File` → **Add an action**
2. Search for `Create table` → Select **Create table** under **Excel Online (Business)**
3. If prompted to sign in, click **Sign in** → Use your LSU account → **Allow**
4. **Rename:** Click **three dots (…)** → **Rename** → Type `Create Transactions Table`
5. Fill in:
   - **Location:** The dropdown shows friendly names, not URLs. Select **Group - Digital Fabrication Lab**
   - **Document Library:** Select **Documents** (this is the "Shared Documents" library — same library, different display name in this connector)
   - **File:** Click inside the field → Click **Dynamic content** → Under **Create Export File**, select **Id**
     > **Why use Id instead of building the path again?** The `Create Export File` action returns an `Id` — a unique identifier for the file it just created. Passing this Id is more reliable than rebuilding the dynamic filename, and it guarantees we're pointing at the exact file we just created.
   - **Table range:** Type `A1:D1` (this means "4 columns, starting at cell A1" — one column for each: Transaction #, Payer, Amount, Date)
6. Click **Show all** under **Advanced parameters** to reveal the remaining fields:
   - **Table Name:** Type `Transactions`
   - **Column Names:** Type `Transaction #, Payer, Amount, Date`

> **Why three actions?** "Get file content" reads the blank template so we have valid `.xlsx` binary data. "Create file" uses that data to make a new file with a dynamic name. "Create table" adds the column headers inside that file. Later steps add rows to this table.

**Verify:** Save the flow. You should have three new cards in a row — `Get Template`, `Create Export File`, and `Create Transactions Table` — with no errors.

---

## Step 4: Add Data Rows

**What this does:** Loops through every TigerCASH payment returned in Step 2 and adds one row per payment to the Excel table. Each row gets four columns: Transaction #, Payer, Amount, and Date.

> **What is "Apply to each"?** It's a loop. You give it a list of items (the payments from Step 2), and it runs the actions inside once for each item. If Step 2 returned 85 payments, the loop runs 85 times, adding 85 rows to the Excel table.

#### Action 1: Create the Loop

1. Click the **+** button below `Create Transactions Table` → **Add an action**
2. Search for `Apply to each` → Select **Apply to each** (under "Control")
3. **Rename:** Click **three dots (…)** → **Rename** → Type `Add Payment Rows`
4. Click inside the **Select an output from previous steps** field
5. Click the **Dynamic content** tab → Under **Get TigerCASH Payments**, select **value**

> **What is "value"?** When a Get items action returns results, the actual list of items is inside a property called `value`. Selecting it tells the loop "iterate over each payment."

#### Action 2: Add a Row (Inside the Loop)

1. Click **Add an action** (inside the `Add Payment Rows` loop — there will be a **+** button inside the loop body)
2. Search for `Add a row into a table` → Select **Add a row into a table** under **Excel Online (Business)**
3. **Rename:** Click **three dots (…)** → **Rename** → Type `Add Payment Row`
4. Fill in:
   - **Location:** Select **Group - Digital Fabrication Lab**
   - **Document Library:** Select **Documents**
   - **File:** Click inside the field → Click **Dynamic content** → Under **Create Export File**, select **Id** (same as Step 3)
   - **Table:** Type `Transactions` in the dropdown. Because the File uses dynamic content, Power Automate can't preview the file, so it will show a message: *"Value contains function expressions which cannot be resolved."* Click **Use "Transactions" as a custom value** to confirm.
   - **Row:** Because the file and table are dynamic, Power Automate shows a single **Row** field instead of individual column fields. You'll build JSON in this field by typing text and inserting dynamic content piece by piece.

5. Click inside the **Row** field and build it in 5 parts. After each part, do NOT press Enter — just keep typing/inserting in the same field:

**Part 1:** Type this, then insert dynamic content:
```
{"Transaction #": "
```
→ Click **Dynamic content** → Under **Get TigerCASH Payments**, select **TransactionNumber**

**Part 2:** Type this, then insert dynamic content:
```
", "Payer": "
```
→ Click **Dynamic content** → select **PayerName**

**Part 3:** Type this, then insert dynamic content:
```
", "Amount": "
```
→ Click **Dynamic content** → select **Amount**

**Part 4:** Type this, then insert an expression:
```
", "Date": "
```
→ Click the **Expression** tab (fx) → Paste:
```
formatDateTime(items('Add_Payment_Rows')?['PaymentDate'], 'M/d/yyyy')
```
→ Click **OK**

**Part 5:** Type this to close the JSON:
```
"}
```

The finished Row field should look like:
`{"Transaction #": "`**[TransactionNumber]**`", "Payer": "`**[PayerName]**`", "Amount": "`**[Amount]**`", "Date": "`**[fx tag]**`"}`

The red "Enter a valid JSON" warning will appear while you're building it — it goes away once the JSON is complete.

> **Why JSON?** Normally Power Automate shows individual column fields you can fill in separately. But because the File uses a dynamic Id (from the previous step), Power Automate can't preview the table structure at design time. The Row field accepts a JSON object instead, where the keys must match your column names exactly.

> **⚠️ Action name in the expression:** The `'Add_Payment_Rows'` in the Date expression must match the renamed Apply to each loop, with spaces replaced by underscores. If you named the loop something different, adjust accordingly.

**Verify:** Save the flow. The `Add Payment Rows` loop should contain one action — `Add Payment Row` — with no errors. The Row field should show a mix of typed text, purple Dynamic content tags, and one green Expression tag.

---

## Step 5: Add Blank Rows

**What this does:** After all the payment data rows, adds 5 empty rows to the bottom of the Excel table. These are for staff to manually type in Art Building 123 (CNC, Plasma) transactions that aren't tracked in the dashboard. Without these blank rows, staff would have to manually expand the Excel table before typing.

#### Action 1: Create the Loop

1. Click the **+** button below the `Add Payment Rows` loop (make sure you're **outside** that loop, not inside it) → **Add an action**
2. Search for `Apply to each` → Select **Apply to each**
3. **Rename:** Click **three dots (…)** → **Rename** → Type `Add Blank Rows`
4. Click inside the **Select an output from previous steps** field
5. Click the **Expression** tab (fx) → Paste:

```
createArray(1, 2, 3, 4, 5)
```

6. Click **OK**

> **What does createArray do?** It creates a simple list `[1, 2, 3, 4, 5]`. The loop runs once per item — so 5 times. The actual numbers don't matter; we just need the loop to run 5 times to create 5 blank rows.

#### Action 2: Add a Blank Row (Inside the Loop)

1. Click **Add an action** (inside the `Add Blank Rows` loop)
2. Search for `Add a row into a table` → Select **Add a row into a table** under **Excel Online (Business)**
3. **Rename:** Click **three dots (…)** → **Rename** → Type `Add Blank Row`
4. Fill in:
   - **Location:** Select **Group - Digital Fabrication Lab**
   - **Document Library:** Select **Documents**
   - **File:** Click inside the field → Click **Dynamic content** → Under **Create Export File**, select **Id** (same as Steps 3 and 4)
   - **Table:** Type `Transactions` → Click **Use "Transactions" as a custom value** (same dynamic file warning as Step 4)
   - **Row:** Same situation as Step 4 — you get a single Row field instead of individual columns. Paste this JSON directly into the field (no dynamic content needed this time — it's all literal text):

```
{"Transaction #": " ", "Payer": " ", "Amount": " ", "Date": " "}
```

> **Why single spaces?** If you leave the values completely empty (`""`), Excel Online will reject the row. A single space is invisible in the spreadsheet but satisfies the requirement. Staff overwrites these spaces when typing Art Building data.

**Verify:** Save the flow. You should now have two Apply to each loops side by side (not nested): `Add Payment Rows` followed by `Add Blank Rows`. Each contains one "Add a row" action.

---

## Step 6: Return Download URL

**What this does:** Sends a response back to Power Apps with the download URL of the Excel file that was just created. This is what lets Power Apps open the file for the user. Without this step, Power Apps would have no way to know the flow finished or where to find the file.

1. Click the **+** button below the `Add Blank Rows` loop → **Add an action**
2. Search for `Respond to a PowerApp` → Select **Respond to a PowerApp or flow**
3. **Rename:** Click **three dots (…)** → **Rename** → Type `Return Export Result`

#### Output 1: FileUrl

4. Click **+ Add an output** → Select **Text**
5. **Title:** Click the label and type `FileUrl`
6. **Enter a value to respond:** Click inside the value field → Click the **Dynamic content** tab → In the search box, type `Create Export` to filter the list → Under **Create Export File**, select **Link to item**
   - If you can't find **Create Export File** in the list, an alternative that also works: search for `webUrl` and select **body/webUrl** under **Create Transactions Table** — it points to the same file.

> **What is "Link to item"?** When SharePoint creates a file, it returns metadata about that file — including a direct URL. "Link to item" is that URL. Power Apps uses it to open the file in the user's browser.

#### Output 2: Success

7. Click **+ Add an output** → Select **Text**
8. **Title:** Type `Success`
9. **Enter a value to respond:** Type `true` (just the word, no quotes, no expression tab needed)

**Verify:** Save the flow. The `Return Export Result` card should show two outputs — **FileUrl** (with a purple Dynamic content tag) and **Success** (with the plain text `true`).

> In Power Apps, the formula uses single quotes because the flow name has special characters: `'Flow-(G)-Export-MonthlyTransactions'.Run(month, year)`. Power Apps reads `varExportResult.fileurl` to open the download. **Note:** The property name is lowercase `fileurl` (not `FileUrl`) — Power Apps uses the schema property key, not the display title.

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
