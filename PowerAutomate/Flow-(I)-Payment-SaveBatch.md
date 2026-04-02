# Flow I (Payment-SaveBatch)

**Full Name:** Payment: Save Batch Payment  
**Trigger:** When Power Apps calls a flow (V2)  
**Purpose:** Handle an all-or-nothing batch payment save server-side. Validates every selected request, calculates proportional weight/cost allocations, writes one consolidated payment record, updates all plate statuses and parent requests, then returns a single success or failure result to the app.

---

## Overview

This flow replaces the multi-step batch save logic that previously lived inside `btnBatchPaymentConfirm.OnSelect` in the Power App. The old app-side code wrote plate/request updates first (Step 3) and the consolidated payment record last (Step 4), which meant a late failure left requests showing "Paid & Picked Up" with no ledger row.

This flow reverses that order: the consolidated `Payments` row is written first, then plates and requests are updated. If validation fails for any item in the batch, the entire batch is rejected and nothing is written.

**Key architecture rules:**
- **All-or-nothing.** If any request fails validation, the whole batch fails. No partial saves.
- **Payments first.** The consolidated ledger row is written before any plates or requests are touched.
- **One checkout = one `Payments` row.** Finance sees one transaction row per real-world batch checkout.

**Related Documents:**
- `PowerAutomate/Flow-(H)-Payment-SaveSingle.md` — single payment flow (same overall pattern)
- `SharePoint/Payments-List-Setup.md`
- `SharePoint/BuildPlates-List-Setup.md`
- `SharePoint/PrintRequests-List-Setup.md`
- `PowerApps/StaffDashboard-App-Spec.md` — `btnBatchPaymentConfirm.OnSelect`

---

## Input Reference

Add inputs in the exact order listed below.

| # | Name | Type | Expression | Description |
|---|------|------|------------|-------------|
| 1 | CombinedWeight | Number | `triggerBody()['number']` | Total grams weighed by staff for the batch |
| 2 | FilamentRate | Number | `triggerBody()['number_1']` | Price per gram for filament |
| 3 | ResinGramRate | Number | `triggerBody()['number_2']` | Price per gram for resin |
| 4 | MinimumCost | Number | `triggerBody()['number_3']` | Minimum charge floor |
| 5 | OwnMaterialDiscount | Number | `triggerBody()['number_4']` | Discount multiplier (e.g., `0.3` for 70% off) |
| 6 | BatchItemIDs | Text | `triggerBody()['text']` | Comma-separated `PrintRequests.ID` values (e.g., `164, 165`) |
| 7 | BatchItemReqKeys | Text | `triggerBody()['text_1']` | Comma-separated `ReqKey` values (e.g., `REQ-00164, REQ-00165`) |
| 8 | TransactionNumber | Text | `triggerBody()['text_2']` | Receipt / check number / grant code |
| 9 | PaymentType | Text | `triggerBody()['text_3']` | `TigerCASH`, `Check`, or `Grant/Program Code` |
| 10 | PayerName | Text | `triggerBody()['text_4']` | Name of the person who paid |
| 11 | StaffEmail | Text | `triggerBody()['text_5']` | Email of the staff member processing the payment |
| 12 | StaffName | Text | `triggerBody()['text_6']` | Full name of the staff member |
| 13 | StudentOwnMaterial | Yes/No | `triggerBody()['boolean']` | Whether the student provided their own material |
| 14 | PaymentDate | Text | `triggerBody()['text_7']` | ISO-style **full date** from Power Apps: `Text(dpBatchPaymentDate.SelectedDate, "yyyy-mm-dd")` (**lowercase `mm`** — see **Power Apps vs workflow** below). Convert to a datetime for SharePoint with the **Parsed payment date** expression below (inline on **Create Consolidated Payment** and **Update Batch Request** — no separate Compose). |

> **Important:** Add inputs in this exact order. Expressions like `triggerBody()['number_1']` and `triggerBody()['text_3']` depend on the order you add inputs of each type. If you add them in a different order, those internal keys shift and every downstream expression can point to the wrong input.

> **Why input 14 is Text, not Date:** The Power Apps → Power Automate connector often sends a **locale** date string (e.g. `4/2/2026`). The trigger schema for type **Date** only accepts a proper calendar date (e.g. `2026-04-02`), which surfaces as **`TriggerInputSchemaMismatch`** when the app sends a non-ISO string. Sending an ISO-style **text** value and parsing with **`parseDateTime`** in the SharePoint actions avoids that. If your trigger inputs do not match this table, open a failed run’s trigger outputs and confirm the real key for the payment date (it may not be `text_7`).

### Parsed payment date (inline expression)

Use this **exact** expression anywhere you need the trigger’s payment date as a **datetime** for SharePoint (copy-paste; repeat in each action — no Compose, so the designer never has to reference another action’s output):

```
parseDateTime(trim(coalesce(triggerBody()?['text_7'], '')), 'en-US', 'yyyy-MM-dd')
```

> **Parameter order:** Workflow language defines **`parseDateTime('<timestamp>', '<locale>'?, '<format>'?)`** — **locale before format**. Passing **`'yyyy-MM-dd'`** as the second argument makes the engine treat it as a **locale** and fails with *unable to find the locale associated with 'yyyy-MM-dd'*.

> **Power Apps vs workflow (month token):** In canvas apps, **`Text( date, "yyyy-mm-dd")`** uses **lowercase `mm`** for the month. **`"yyyy-MM-dd"`** in **`Text`** outputs **literal** `MM`, producing invalid values like **`2026-MM-02`** and **`parseDateTime`** fails. In **`parseDateTime`**’s **third** argument, keep **`'yyyy-MM-dd'`** (uppercase **`MM`**) — workflow format follows **.NET-style** rules where **`mm`** means **minutes**, not month; it parses strings such as **`2026-04-02`** from the app. **Flow H** uses the same pattern with **`text_10`** instead of **`text_7`**.

> **Why no Compose?** A Compose directly under the trigger sometimes ends up with an empty **`runAfter`** in code view, and the new designer may not let you fix that. Inlining **`parseDateTime`** avoids **`outputs('...')`** references entirely.

---

## Output Reference

| Name | Type | Description |
|------|------|-------------|
| Success | Text | `"true"` on success, `"false"` on failure |
| Message | Text | Human-readable result or error description |
| PaymentID | Text | The consolidated `Payments` row ID on success, or `"0"` on failure |

> **Important:** Power Apps reads these as lowercase properties: `success`, `message`, `paymentid`.

---

## Flow Structure Overview

```
Flow
├── Trigger (14 inputs)
│
├── Initialize Variables (9 variables)
│
├── Step 2: Validate Transaction Number
│   ├── Is TigerCard Number? (Condition)
│   └── Gate → Check Uniqueness (same pattern as Flow H)
│
├── Step 3: Load and Validate Batch Requests
│   └── Gate → Get Items: Get Batch Requests
│       └── Validate count matches → single print method (no Filament + Resin mix) → all are Completed
│
├── Step 4: Load and Validate Batch Plates
│   └── Gate → Get Items: Get All Batch Plates
│       └── Validate no Queued/Printing plates
│
├── Step 5: Calculate Allocations
│   └── Gate
│       ├── Loop: Sum Estimated Weights
│       ├── Compose: LastItemID, BatchItemCount
│       ├── Filter: Non-Last Items
│       ├── Loop: Calculate Non-Last Allocations → Append
│       ├── Filter + Calculate Last Item Allocation → Append
│       └── Build summary texts (Select + Join + Plate Snapshots)
│
├── Step 6: Write Payment Data
│   └── Gate → Scope: Write All Records
│       ├── Create Consolidated Payment (Payments)
│       ├── Set varPaymentID
│       └── Loop: For Each Batch Detail
│           ├── Filter: Completed Plates for This Request
│           ├── Loop: Update Each Plate → Picked Up
│           └── Update Parent Request (PrintRequests)
│       ├── [scope succeeded] → Set varMessage
│       └── [scope failed] → Set varSuccess = false
│
└── Step 7: Return Result
```

---

## Error Handling Strategy

This flow uses the same **variable-gated** pattern as Flow H:

1. `varSuccess` starts as `true`. Each validation step can flip it to `false`.
2. Every later gate checks `varSuccess` first. If it is `false`, that entire section is skipped.
3. All writes live inside one **Scope** so a late write failure is caught as a group.
4. After the scope, run-after handlers set `varSuccess = false` and a clear error message if anything in the write scope failed.
5. One single **Respond to a PowerApp or flow** action at the end returns the final result.

This guarantees exactly one response per run and prevents partial batch processing when validation fails.

---

## Retry Policy

Use this retry policy on all SharePoint **Get item**, **Get items**, **Create item**, and **Update item** actions:

- **Retry policy:** `Exponential interval`
- **Count:** `2`
- **Interval:** `PT10S`
- **Minimum interval:** `PT5S`
- **Maximum interval:** `PT30S`

> **Why these values?** Power Apps has a roughly 2-minute timeout for synchronous flow calls. These settings keep retry windows short enough that the batch flow can still finish before the app times out.

**How to set retry policy on any action:**
1. Click the **three dots (...)** on the action card
2. Choose **Settings**
3. Scroll to the **Networking** section
4. In **Retry policy**, choose **Exponential interval**
5. Fill in all four fields:
   - **Count:** `2`
   - **Interval:** `PT10S`
   - **Minimum interval:** `PT5S`
   - **Maximum interval:** `PT30S`
6. Click **Done**

---

## Create Flow

### Trigger

**UI steps:**
1. Go to **Power Automate** → **My flows**
2. Click **+ New flow** → **Instant cloud flow**
3. **Flow name:** `Flow-(I)-Payment-SaveBatch`
4. **Trigger:** `When Power Apps calls a flow (V2)`
5. Click **Create**

### Inputs

**UI steps:**
1. Open the trigger card
2. Add each input in the exact order from the Input Reference table above. For each input, click **+ Add an input**, select the type, then rename it.

**Number inputs (add first):**

| # | Click | Rename to |
|---|-------|-----------|
| 1 | + Add an input → Number | CombinedWeight |
| 2 | + Add an input → Number | FilamentRate |
| 3 | + Add an input → Number | ResinGramRate |
| 4 | + Add an input → Number | MinimumCost |
| 5 | + Add an input → Number | OwnMaterialDiscount |

**Text inputs (add next):**

| # | Click | Rename to |
|---|-------|-----------|
| 6 | + Add an input → Text | BatchItemIDs |
| 7 | + Add an input → Text | BatchItemReqKeys |
| 8 | + Add an input → Text | TransactionNumber |
| 9 | + Add an input → Text | PaymentType |
| 10 | + Add an input → Text | PayerName |
| 11 | + Add an input → Text | StaffEmail |
| 12 | + Add an input → Text | StaffName |

**Yes/No input:**

| # | Click | Rename to |
|---|-------|-----------|
| 13 | + Add an input → Yes/No | StudentOwnMaterial |

**Text input (payment date — must be last):**

| # | Click | Rename to |
|---|-------|-----------|
| 14 | + Add an input → Text | PaymentDate |

Power Apps must pass **`Text(dpBatchPaymentDate.SelectedDate, "yyyy-mm-dd")`** as this argument (see `StaffDashboard-App-Spec.md`, **`btnBatchPaymentConfirm.OnSelect`**).

---

## Step 1: Initialize Variables

**What this does:** Creates the tracking variables for flow result, allocation calculations, and per-request detail collection.

**Payment date:** Do **not** add a Compose for the date. Use the **Parsed payment date** expression from the Input Reference section **inline** on **Create Consolidated Payment** and **Update Batch Request** → **PaymentDate**.

Add these actions immediately below the trigger. For each one:
1. Click **+ Add an action**
2. Search for **Initialize variable**
3. Rename the action as shown below
4. Fill in **Name**, **Type**, and **Value** — all three fields are typed directly

#### Action 1: Initialize varSuccess

- **Rename to:** `Initialize varSuccess`
- **Name:** type directly: `varSuccess`
- **Type:** select from dropdown: `Boolean`
- **Value:** select `true` from the Value dropdown (or type `true`)

> **What this is for:** Master pass/fail flag for the whole flow. Every later `Gate: ...` action checks this variable before doing more work.

#### Action 2: Initialize varMessage

- **Rename to:** `Initialize varMessage`
- **Name:** type directly: `varMessage`
- **Type:** select from dropdown: `String`
- **Value:** leave blank

> **What this is for:** Human-readable success or error message returned to Power Apps at the end.

#### Action 3: Initialize varPaymentID

- **Rename to:** `Initialize varPaymentID`
- **Name:** type directly: `varPaymentID`
- **Type:** select from dropdown: `Integer`
- **Value:** type directly: `0`

> **What this is for:** Stores the ID of the consolidated `Payments` row after it is created.

#### Action 4: Initialize varTotalEstWeight

- **Rename to:** `Initialize varTotalEstWeight`
- **Name:** type directly: `varTotalEstWeight`
- **Type:** select from dropdown: `Float`
- **Value:** type directly: `0`

> **What this is for:** Running total of all selected requests' `EstimatedWeight` values.

#### Action 5: Initialize varSumAllocatedWeights

- **Rename to:** `Initialize varSumAllocatedWeights`
- **Name:** type directly: `varSumAllocatedWeights`
- **Type:** select from dropdown: `Float`
- **Value:** type directly: `0`

> **What this is for:** Running total of the non-last allocation weights so the final request can absorb any rounding drift.

#### Action 6: Initialize varTotalCost

- **Rename to:** `Initialize varTotalCost`
- **Name:** type directly: `varTotalCost`
- **Type:** select from dropdown: `Float`
- **Value:** type directly: `0`

> **What this is for:** Running total of all per-request costs. This becomes the consolidated `Payments.Amount`.

#### Action 7: Initialize varBatchDetails

- **Rename to:** `Initialize varBatchDetails`
- **Name:** type directly: `varBatchDetails`
- **Type:** select from dropdown: `Array`
- **Value:** leave blank so the array starts empty. If your designer insists on a value, type `[]` directly into the value box, not the **Expression** tab.

> **What this is for:** Holds one JSON object per request with the calculated allocation details. Later loops read from this array to build summaries and update each request.

#### Action 8: Initialize varPlateLabelsText

- **Rename to:** `Initialize varPlateLabelsText`
- **Name:** type directly: `varPlateLabelsText`
- **Type:** select from dropdown: `String`
- **Value:** leave blank

> **What this is for:** Final combined text snapshot of the plate display labels written onto the consolidated payment row.

#### Action 9: Initialize varPlateKeysText

- **Rename to:** `Initialize varPlateKeysText`
- **Name:** type directly: `varPlateKeysText`
- **Type:** select from dropdown: `String`
- **Value:** leave blank

> **What this is for:** Final combined text snapshot of the plate keys written onto the consolidated payment row.

> **Critical build check:** Do not initialize `varBatchDetails` as the text string `"[]"`. It must be an actual empty array value. If this variable is created as text instead of array, all later append/select actions that depend on it will fail.

---

## Step 2: Validate Transaction Number

**What this does:** Catches two common input problems before any batch data is loaded: a TigerCard number entered as a transaction number, and a transaction number that has already been used.

#### Action 1: Is TigerCard Number

**Where to add this:** Below `Initialize varPlateKeysText`, at the top level of the flow.

1. Add a **Condition** below the initialized variables
2. Rename it to: `Is TigerCard Number`
3. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
and(equals(triggerBody()['text_3'], 'TigerCASH'), equals(length(trim(coalesce(triggerBody()['text_2'], ''))), 16), isFloat(trim(coalesce(triggerBody()['text_2'], ''))))
```

4. Set the **Operator** dropdown to: `is equal to`
5. Set the **Right side** — switch to the **Expression** tab and type: `true`

#### Action 2: Mark TigerCard Failure

**Where to add this:** Inside the **True** branch of `Is TigerCard Number`.

6. Inside the **True** branch, add **Set variable**
7. Rename it to: `Mark TigerCard Failure`
8. **Name:** select `varSuccess` from the dropdown
9. **Value:** select `false` from the Value dropdown (or type `false`)

#### Action 3: Set TigerCard Error

**Where to add this:** Below `Mark TigerCard Failure`, still inside the **True** branch of `Is TigerCard Number`.

10. Below `Mark TigerCard Failure`, still in the **True** branch, add **Set variable**
11. Rename it to: `Set TigerCard Error`
12. **Name:** select `varMessage` from the dropdown
13. **Value:** type directly: `That looks like a TigerCard number. Please enter the receipt or approval number instead.`

Leave the **False** branch of `Is TigerCard Number` empty.

#### Action 4: Gate: Check Uniqueness

**Where to add this:** Below `Is TigerCard Number`, after both branches rejoin. This is back at the top level of the flow.

14. Below `Is TigerCard Number`, after both branches rejoin, add a **Condition**
15. Rename it to: `Gate: Check Uniqueness`
16. Set the condition exactly like this:
    - Left side: click the field, switch to the **Expression** tab, paste `variables('varSuccess')`
    - **Operator:** `is equal to`
    - Right side: switch to the **Expression** tab, paste `true`
17. Delete any extra blank condition row. The gate should have exactly **one** row.

> **Critical build check:** Do not type plain `varSuccess` into the left box. In code view, this gate must compare `@variables('varSuccess')` to the boolean `true`. If the code shows `"varSuccess"` instead, the condition will always evaluate to false and all later work will be skipped.

#### Action 5: Has Transaction Number

**Where to add this:** Inside the **True** branch of `Gate: Check Uniqueness`.

18. Inside the **True** branch of `Gate: Check Uniqueness`, add a **Condition**
19. Rename it to: `Has Transaction Number`
20. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(trim(coalesce(triggerBody()['text_2'], '')))
```

21. Set the **Operator** dropdown to: `is greater than`
22. Set the **Right side** — type directly: `0`

#### Action 6: Check Existing Transaction

**Where to add this:** Inside the **True** branch of `Has Transaction Number`.

23. Inside the **True** branch of `Has Transaction Number`, add **Get items** (SharePoint)
24. Rename it to: `Check Existing Transaction`
25. Fill in:
    - **Site Address:** type directly: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
    - **List Name:** type directly: `Payments`
    - **Filter Query:** click the **Expression** tab and paste:

```
concat('TransactionNumber eq ''', trim(triggerBody()['text_2']), '''')
```

    - **Top Count:** type directly: `1`
26. **Configure retry policy** on this action.

#### Action 7: Is Duplicate Transaction

**Where to add this:** Below `Check Existing Transaction`, still inside the **True** branch of `Has Transaction Number`.

27. Below `Check Existing Transaction`, still inside the **True** branch of `Has Transaction Number`, add a **Condition**
28. Rename it to: `Is Duplicate Transaction`
29. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(body('Check_Existing_Transaction')?['value'])
```

30. Set the **Operator** dropdown to: `is greater than`
31. Set the **Right side** — type directly: `0`

#### Action 8: Mark Duplicate Failure

**Where to add this:** Inside the **True** branch of `Is Duplicate Transaction`.

32. Inside the **True** branch of `Is Duplicate Transaction`, add **Set variable**
33. Rename it to: `Mark Duplicate Failure`
34. **Name:** select `varSuccess` from the dropdown
35. **Value:** select `false` from the Value dropdown (or type `false`)

#### Action 9: Set Duplicate Error

**Where to add this:** Below `Mark Duplicate Failure`, still inside the **True** branch of `Is Duplicate Transaction`.

36. Below `Mark Duplicate Failure`, still inside the **True** branch of `Is Duplicate Transaction`, add **Set variable**
37. Rename it to: `Set Duplicate Error`
38. **Name:** select `varMessage` from the dropdown
39. **Value:** click the **Expression** tab and paste:

```
concat('Transaction number ''', trim(triggerBody()['text_2']), ''' already exists. Use a unique number.')
```

Leave the **False** branch of `Is Duplicate Transaction` empty.
Leave the **False** branch of `Has Transaction Number` empty. Blank transaction numbers are allowed.
Leave the **False** branch of `Gate: Check Uniqueness` empty.

---

## Step 3: Load and Validate Batch Requests

**What this does:** Loads all selected requests from SharePoint in one query and verifies every one is still in `Completed` status, that **all rows share the same `Method`** (no mixed Filament/Resin batch), and that counts match the app’s ID list. If any check fails, the entire batch fails.

#### Action 1: Gate Before Request Load

**Where to add this:** Below `Gate: Check Uniqueness`, after all branches rejoin, back at the top level of the flow.

1. Click **+ Add an action** below `Gate: Check Uniqueness`
2. Search for and select **Condition**
3. Rename to: `Gate: Load Batch Requests`
4. Set the condition exactly like this:
   - Left side: click the field, switch to the **Expression** tab, paste `variables('varSuccess')`
   - **Operator:** `is equal to`
   - Right side: switch to the **Expression** tab, paste `true`
5. Delete any extra blank condition row. The gate should have exactly **one** row.

> **Critical build check:** In code view, this gate should compare `@variables('varSuccess')` to `true`, not the literal string `"varSuccess"`.

**True branch of `Gate: Load Batch Requests`:**

#### Action 2: Build Request Filter

**Where to add this:** Inside the **True** branch of `Gate: Load Batch Requests`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Compose**
3. Rename to: `Request Filter`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
concat('ID eq ', replace(triggerBody()['text'], ', ', ' or ID eq '))
```

> **What this builds:** An OData filter like `ID eq 164 or ID eq 165` from the comma-separated input `164, 165`.

#### Action 3: Get Batch Requests

**Where to add this:** Below `Request Filter`, still inside the **True** branch of `Gate: Load Batch Requests`.

1. Click **+ Add an action** below `Request Filter`
2. Search for and select **Get items** (SharePoint)
3. Rename to: `Get Batch Requests`
4. Fill in:
   - **Site Address:** type directly: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** type directly: `PrintRequests`
   - **Filter Query:** click the field, then select from **Dynamic content**: the output of `Request Filter`
   - **Order By:** type directly: `ID asc`
   - **Top Count:** type directly: `500`
5. **Configure retry policy.**

#### Action 4: Count Expected Items

**Where to add this:** Below `Get Batch Requests`, still inside the **True** branch of `Gate: Load Batch Requests`.

1. Click **+ Add an action** below `Get Batch Requests`
2. Search for and select **Compose**
3. Rename to: `Expected Item Count`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
length(split(triggerBody()['text'], ', '))
```

#### Action 5: Validate Request Count

**Where to add this:** Below `Expected Item Count`, still inside the **True** branch of `Gate: Load Batch Requests`.

1. Click **+ Add an action** below `Expected Item Count`
2. Search for and select **Condition**
3. Rename to: `All Requests Found`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(body('Get_Batch_Requests')?['value'])
```

5. Set the **Operator** dropdown to: `is equal to`
6. Set the **Right side** — click the field, then select from **Dynamic content**: the output of `Expected Item Count`

> **What this condition checks:** `All Requests Found` compares the number of SharePoint rows returned by `Get Batch Requests` to the number of request IDs the app sent in. If those counts do not match, at least one requested item was missing, deleted, or not returned by the filter.

#### Action 5a: Mark Missing Request Failure

**Where to add this:** Inside the **False** branch of `All Requests Found`.

1. Click **+ Add an action** inside the **False** branch
2. Search for and select **Set variable**
3. Rename it to: `Mark Missing Request Failure`
4. **Name:** select `varSuccess` from the dropdown
5. **Value:** select `false` from the Value dropdown (or type `false`)

#### Action 5b: Set Missing Request Error

**Where to add this:** Below `Mark Missing Request Failure`, still inside the **False** branch of `All Requests Found`.

1. Click **+ Add an action** below `Mark Missing Request Failure`
2. Search for and select **Set variable**
3. Rename it to: `Set Missing Request Error`
4. **Name:** select `varMessage` from the dropdown
5. **Value:** type directly: `One or more batch items could not be found. They may have been deleted.`

#### Action 5c: Compose First Batch Method

**Where to add this:** Inside the **True** branch of `All Requests Found` (before the filter — avoids nested `first(...)` inside **Filter array**, which can fail validation).

1. Click **+ Add an action** inside the **True** branch of `All Requests Found`
2. Search for and select **Compose**
3. Rename to: `First Batch Method`
4. **Inputs** — click the **Expression** tab and paste:

```
first(body('Get_Batch_Requests')?['value'])?['Method']?['Value']
```

#### Action 5c2: Filter Method Mismatch Rows

**Where to add this:** Below `First Batch Method`, still inside the **True** branch of `All Requests Found`.

1. Click **+ Add an action** below `First Batch Method`
2. Search for and select **Filter array**
3. Rename to: `Method Mismatch Rows`
4. **From** — **Expression** tab:

```
body('Get_Batch_Requests')?['value']
```

5. Configure the row condition in **basic mode** (not advanced “Edit in JSON”), so the designer emits a valid template **`where`** expression:
   - **Left:** click **Expression** and paste: `item()?['Method']?['Value']`
   - **Operator:** **is not equal to**
   - **Right:** click **Dynamic content** → select the output of **`First Batch Method`** (the Compose). Do **not** type plain text.

> **Save error `WorkflowRunActionInputsInvalidProperty` / `where` must be a template language expression:** The new designer rejects a **Filter array** whose condition was pasted as raw text or uses an invalid advanced expression. Using **Compose** + **basic** compare (left expression, right dynamic) fixes this. If you must use advanced mode only, the whole condition must be a single workflow expression, e.g. `@not(equals(item()?['Method']?['Value'], outputs('First_Batch_Method')))` — internal action names use underscores (`First_Batch_Method`).

> **What this does:** After `Get Batch Requests` returns every row, this keeps only rows whose `Method.Value` differs from the **first** row’s method. If the filtered array is non-empty, the batch mixes **Filament** and **Resin** (or inconsistent choice values). The Power App should already block this; this is **server-side defense in depth**.

#### Action 5d: Any Mixed Methods

**Where to add this:** Below `Method Mismatch Rows`, still inside the **True** branch of `All Requests Found`.

1. Click **+ Add an action** below `Method Mismatch Rows`
2. Search for and select **Condition**
3. Rename to: `Any Mixed Methods`
4. Left side — **Expression** tab (use whichever matches a successful test run’s **outputs** shape):

```
length(outputs('Method_Mismatch_Rows')?['body'])
```

If that expression is invalid in your tenant, try `length(body('Method_Mismatch_Rows'))`.

5. **Operator:** `is greater than`
6. Right side: `0`

#### Action 5e: Mark Mixed Method Failure

**Where to add this:** Inside the **True** branch of `Any Mixed Methods`.

1. **Set variable** — rename to `Mark Mixed Method Failure`
2. **Name:** `varSuccess` → **Value:** `false`

#### Action 5f: Set Mixed Method Error

**Where to add this:** Below `Mark Mixed Method Failure`, still inside the **True** branch of `Any Mixed Methods`.

1. **Set variable** — rename to `Set Mixed Method Error`
2. **Name:** `varMessage` → **Value:** `Cannot combine Filament and Resin in one batch payment. Remove items until every selected job uses the same print method, or check out separately.`

Leave the **False** branch of `Any Mixed Methods` empty.

#### Action 6: Non Completed Requests

**Where to add this:** Below `Any Mixed Methods`, after both branches rejoin (same nesting level as `All Requests Found`), still inside the **True** branch of `Gate: Load Batch Requests`.

1. Click **+ Add an action** below `Any Mixed Methods` (or below `All Requests Found` if your designer flattens the tree — **must** run only after `Get Batch Requests` succeeded and counts matched)

**Designer note:** If actions after `All Requests Found` run for both outcomes, ensure `Non Completed Requests` and everything below still respects **`varSuccess`** (later gates already do). Prefer chaining **`Method Mismatch Rows` → `Any Mixed Methods` → `Non Completed Requests`** so mixed-method batches never hit allocation logic.

1. Search for and select **Filter array**
2. Rename to: `Non Completed Requests`
3. **From:** click the **Expression** tab and paste: `body('Get_Batch_Requests')?['value']`
4. Click the left side of the filter condition, switch to the **Expression** tab, and paste:

```
item()?['Status']?['Value']
```

5. Set the **Operator** dropdown to: `is not equal to`
6. Type directly on the right side: `Completed`

---

#### Action 7: Any Not Completed

**Where to add this:** Below `Non Completed Requests`, still inside the **True** branch of `Gate: Load Batch Requests`.

1. Click **+ Add an action** below `Non Completed Requests`
2. Search for and select **Condition**
3. Rename to: `Any Not Completed`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(body('Non_Completed_Requests'))
```

5. Set the **Operator** dropdown to: `is greater than`
6. Type directly on the right side: `0`

> **What this condition checks:** `Any Not Completed` looks at the filtered list from `Non Completed Requests`. If this condition is `true`, at least one returned request is no longer in `Completed` status and the whole batch must stop.

---

#### Action 7a: Mark Not Completed Failure

**Where to add this:** Inside the **True** branch of `Any Not Completed`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Set variable**
3. Rename it to: `Mark Not Completed Failure`
4. **Name:** select `varSuccess` from the dropdown
5. **Value:** select `false` from the Value dropdown (or type `false`)

---

#### Action 7b: Set Not Completed Error

**Where to add this:** Below `Mark Not Completed Failure`, still inside the **True** branch of `Any Not Completed`.

1. Click **+ Add an action** below `Mark Not Completed Failure`
2. Search for and select **Set variable**
3. Rename it to: `Set Not Completed Error`
4. **Name:** select `varMessage` from the dropdown
5. **Value:** type directly: `One or more items are no longer in 'Completed' status. Remove them from the batch and try again.`

Leave the **False** branch of `Any Not Completed` empty.

**False branch (`varSuccess` was false) in `Gate: Load Batch Requests`:** Leave the **False** branch empty.

---

## Step 4: Load and Validate Batch Plates

**What this does:** Loads all build plates for every request in the batch and verifies none are still in `Queued` or `Printing` status. Batch payment is final-pickup-only, so every plate-backed request must have all plates ready.

#### Action 1: Gate Before Plate Load

**Where to add this:** Below `Gate: Load Batch Requests`, after all branches rejoin, back at the top level of the flow.

1. Click **+ Add an action** below `Gate: Load Batch Requests`
2. Search for and select **Condition**
3. Rename to: `Gate: Load Batch Plates`
4. Set the condition exactly like this:
   - Left side: click the field, switch to the **Expression** tab, paste `variables('varSuccess')`
   - **Operator:** `is equal to`
   - Right side: switch to the **Expression** tab, paste `true`
5. Delete any extra blank condition row. The gate should have exactly **one** row.

> **Critical build check:** In code view, this gate should compare `@variables('varSuccess')` to `true`, not the literal string `"varSuccess"`.

**True branch of `Gate: Load Batch Plates`:**

#### Action 2: Build Plate Filter

**Where to add this:** Inside the **True** branch of `Gate: Load Batch Plates`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Compose**
3. Rename to: `Plate Filter`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
concat('RequestID eq ', replace(triggerBody()['text'], ', ', ' or RequestID eq '))
```

#### Action 3: Get All Batch Plates

**Where to add this:** Below `Plate Filter`, still inside the **True** branch of `Gate: Load Batch Plates`.

1. Click **+ Add an action** below `Plate Filter`
2. Search for and select **Get items** (SharePoint)
3. Rename to: `Get All Batch Plates`
4. Fill in:
   - **Site Address:** type directly: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** type directly: `BuildPlates`
   - **Filter Query:** click the field, then select from **Dynamic content**: the output of `Plate Filter`
   - **Order By:** type directly: `ID asc`
   - **Top Count:** type directly: `5000`
5. **Configure retry policy.**

#### Action 4: Ineligible Plates

**Where to add this:** Below `Get All Batch Plates`, still inside the **True** branch of `Gate: Load Batch Plates`.

8. Click **+ Add an action** below `Get All Batch Plates`
9. Search for and select **Filter array**
10. Rename to: `Ineligible Plates`
11. **From:** click the **Expression** tab and paste: `body('Get_All_Batch_Plates')?['value']`
12. Click **Edit in advanced mode** (below the filter condition row) and paste:

```
@or(equals(item()?['Status']?['Value'], 'Queued'), equals(item()?['Status']?['Value'], 'Printing'))
```

> **Why advanced mode?** This filter needs an `or()` across two status values. The basic mode only supports a single comparison per row, so advanced mode lets you write the full logical expression.

---

#### Action 5: Has Ineligible Plates

**Where to add this:** Below `Ineligible Plates`, still inside the **True** branch of `Gate: Load Batch Plates`.

1. Click **+ Add an action** below `Ineligible Plates`
2. Search for and select **Condition**
3. Rename to: `Has Ineligible Plates`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(body('Ineligible_Plates'))
```

5. Set the **Operator** dropdown to: `is greater than`
6. Type directly on the right side: `0`

---

#### Action 5a: Mark Ineligible Plate Failure

**Where to add this:** Inside the **True** branch of `Has Ineligible Plates`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Set variable**
3. Rename it to: `Mark Ineligible Plate Failure`
4. **Name:** select `varSuccess` from the dropdown
5. **Value:** select `false` from the Value dropdown (or type `false`)

---

#### Action 5b: Set Ineligible Plate Error

**Where to add this:** Below `Mark Ineligible Plate Failure`, still inside the **True** branch of `Has Ineligible Plates`.

1. Click **+ Add an action** below `Mark Ineligible Plate Failure`
2. Search for and select **Set variable**
3. Rename it to: `Set Ineligible Plate Error`
4. **Name:** select `varMessage` from the dropdown
5. **Value:** type directly: `One or more selected requests still have plates in Queued or Printing status. All plates must be Completed for batch pickup.`

Leave the **False** branch of `Has Ineligible Plates` empty.

**False branch (`varSuccess` was false) in `Gate: Load Batch Plates`:** Leave the **False** branch empty.

---

## Step 5: Calculate Allocations

**What this does:** Splits the combined weight across requests proportionally based on each request's `EstimatedWeight`, calculates per-request costs, and builds the details needed for the consolidated payment record.

#### Action 1: Gate Before Calculations

**Where to add this:** Below `Gate: Load Batch Plates`, after all branches rejoin, back at the top level of the flow.

1. Click **+ Add an action** below `Gate: Load Batch Plates`
2. Search for and select **Condition**
3. Rename to: `Gate: Calculate Allocations`
4. Set the condition exactly like this:
   - Left side: click the field, switch to the **Expression** tab, paste `variables('varSuccess')`
   - **Operator:** `is equal to`
   - Right side: switch to the **Expression** tab, paste `true`
5. Delete any extra blank condition row. The gate should have exactly **one** row.

> **Critical build check:** In code view, this gate should compare `@variables('varSuccess')` to `true`, not the literal string `"varSuccess"`.

**True branch of `Gate: Calculate Allocations`:**

#### Action 2: Sum Estimated Weights

**Where to add this:** Inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Apply to each**
3. Rename to: `Sum Estimated Weights`
4. **Select an output:** click the **Expression** tab and paste: `body('Get_Batch_Requests')?['value']`

Inside the loop:

5. Click **+ Add an action** inside the loop
6. Search for and select **Increment variable**
7. Rename to: `Add Est Weight`
8. **Name:** select `varTotalEstWeight` from the dropdown
9. **Value:** click the **Expression** tab and paste: `coalesce(items('Sum_Estimated_Weights')?['EstimatedWeight'], 0)`

> **Why Increment variable?** Power Automate does not allow a Set variable action to reference its own current value (self-reference error). Increment variable handles the addition internally — it adds the Value to the variable's current value without you needing to write the `add()` wrapper.

#### Action 3: LastItemID

**Where to add this:** Below the `Sum Estimated Weights` loop, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below the `Sum Estimated Weights` loop
2. Search for and select **Compose**
3. Rename to: `LastItemID`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
last(body('Get_Batch_Requests')?['value'])?['ID']
```

> **Why `last()` instead of `max()`?** The results from `Get Batch Requests` are already ordered by `ID asc`, so the last item has the highest ID. Using `last()` is reliable and well-documented, whereas `max()` with a property path on an object array is undocumented behavior that may not work on all connector versions.

#### Action 4: BatchItemCount

**Where to add this:** Below `LastItemID`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `LastItemID`
2. Search for and select **Compose**
3. Rename to: `BatchItemCount`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste: `length(body('Get_Batch_Requests')?['value'])`

#### Action 5: Filter Non-Last Items

**Where to add this:** Below `BatchItemCount`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `BatchItemCount`
2. Search for and select **Filter array**
3. Rename to: `Non Last Items`
4. **From:** click the **Expression** tab and paste: `body('Get_Batch_Requests')?['value']`
5. Click the left side of the filter condition, switch to the **Expression** tab, and paste:

```
item()?['ID']
```

6. Set the **Operator** dropdown to: `is not equal to`
7. Click the right side, then select from **Dynamic content**: the output of `LastItemID`

#### Action 6: Calculate Non-Last Allocations

**Where to add this:** Below `Non Last Items`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `Non Last Items`
2. Search for and select **Apply to each**
3. Rename to: `Calculate Non Last Items`
4. **Select an output:** click the **Expression** tab and paste: `body('Non_Last_Items')`

Inside the loop, add Actions 6a–6f in order:

---

#### Action 6a: NonLastAllocWeight

**Where to add this:** Inside the `Calculate Non Last Items` loop.

1. Click **+ Add an action** inside the loop
2. Search for and select **Compose**
3. Rename to: `NonLastAllocWeight`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(greater(variables('varTotalEstWeight'), 0), float(formatNumber(div(mul(coalesce(items('Calculate_Non_Last_Items')?['EstimatedWeight'], 0), triggerBody()['number']), variables('varTotalEstWeight')), '#0.00')), float(formatNumber(div(triggerBody()['number'], outputs('BatchItemCount')), '#0.00')))
```

> **What this calculates:** Rounds to 2 decimals: `(EstimatedWeight / TotalEstWeight) × CombinedWeight`. If total estimated weight is zero, divides evenly. **Note:** Power Automate expressions have no `round()` — use `float(formatNumber(..., '#0.00'))` instead.

---

#### Action 6b: NonLastCost

**Where to add this:** Below `NonLastAllocWeight`, still inside the `Calculate Non Last Items` loop.

1. Click **+ Add an action** below `NonLastAllocWeight`
2. Search for and select **Compose**
3. Rename to: `NonLastCost`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(triggerBody()['boolean'], mul(max(triggerBody()['number_3'], mul(outputs('NonLastAllocWeight'), if(equals(items('Calculate_Non_Last_Items')?['Method']?['Value'], 'Resin'), triggerBody()['number_2'], triggerBody()['number_1']))), triggerBody()['number_4']), max(triggerBody()['number_3'], mul(outputs('NonLastAllocWeight'), if(equals(items('Calculate_Non_Last_Items')?['Method']?['Value'], 'Resin'), triggerBody()['number_2'], triggerBody()['number_1']))))
```

> **What this calculates:** `Max(MinimumCost, AllocWeight × rate) × discount`. Same formula as Flow H but per-item.

---

#### Action 6c: Accumulate Alloc Weights

**Where to add this:** Below `NonLastCost`, still inside the `Calculate Non Last Items` loop.

1. Click **+ Add an action** below `NonLastCost`
2. Search for and select **Increment variable**
3. Rename to: `Accumulate Alloc Weights`
4. **Name:** select `varSumAllocatedWeights` from the dropdown
5. **Value:** click the field, then select from **Dynamic content**: the output of `NonLastAllocWeight`

---

#### Action 6d: Accumulate Total Cost

**Where to add this:** Below `Accumulate Alloc Weights`, still inside the `Calculate Non Last Items` loop.

1. Click **+ Add an action** below `Accumulate Alloc Weights`
2. Search for and select **Increment variable**
3. Rename to: `Accumulate Total Cost`
4. **Name:** select `varTotalCost` from the dropdown
5. **Value:** click the field, then select from **Dynamic content**: the output of `NonLastCost`

---

#### Action 6e: NonLastDetail

**Where to add this:** Below `Accumulate Total Cost`, still inside the `Calculate Non Last Items` loop.

1. Click **+ Add an action** below `Accumulate Total Cost`
2. Search for and select **Compose**
3. Rename to: `NonLastDetail`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
json(concat('{"ID":', string(items('Calculate_Non_Last_Items')?['ID']), ',"ReqKey":"', items('Calculate_Non_Last_Items')?['ReqKey'], '","AllocWeight":', string(outputs('NonLastAllocWeight')), ',"Cost":', string(outputs('NonLastCost')), ',"Method":"', items('Calculate_Non_Last_Items')?['Method']?['Value'], '"}'))
```

---

#### Action 6f: Append Non-Last Detail

**Where to add this:** Below `NonLastDetail`, still inside the `Calculate Non Last Items` loop. This is the last action in the loop.

1. Click **+ Add an action** below `NonLastDetail`
2. Search for and select **Append to array variable**
3. Rename to: `Append Non-Last Detail`
4. **Name:** select `varBatchDetails` from the dropdown
5. **Value:** click the field, then select from **Dynamic content**: the output of `NonLastDetail`

(End of `Calculate Non Last Items` loop)

#### Action 7: Last Item Only

**Where to add this:** Below the `Calculate Non Last Items` loop, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below the `Calculate Non Last Items` loop
2. Search for and select **Filter array**
3. Rename to: `Last Item Only`
4. **From:** click the **Expression** tab and paste: `body('Get_Batch_Requests')?['value']`
5. Click the left side of the filter condition, switch to the **Expression** tab, and paste:

```
item()?['ID']
```

6. Set the **Operator** dropdown to: `is equal to`
7. Click the right side, then select from **Dynamic content**: the output of `LastItemID`

---

#### Action 7a: LastAllocWeight

**Where to add this:** Below `Last Item Only`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `Last Item Only`
2. Search for and select **Compose**
3. Rename to: `LastAllocWeight`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(greater(outputs('BatchItemCount'), 1), sub(triggerBody()['number'], variables('varSumAllocatedWeights')), triggerBody()['number'])
```

> **What this calculates:** `CombinedWeight − sum of all other allocated weights`. This absorbs rounding drift so the total always matches exactly.

---

#### Action 7b: LastCost

**Where to add this:** Below `LastAllocWeight`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `LastAllocWeight`
2. Search for and select **Compose**
3. Rename to: `LastCost`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(triggerBody()['boolean'], mul(max(triggerBody()['number_3'], mul(outputs('LastAllocWeight'), if(equals(first(body('Last_Item_Only'))?['Method']?['Value'], 'Resin'), triggerBody()['number_2'], triggerBody()['number_1']))), triggerBody()['number_4']), max(triggerBody()['number_3'], mul(outputs('LastAllocWeight'), if(equals(first(body('Last_Item_Only'))?['Method']?['Value'], 'Resin'), triggerBody()['number_2'], triggerBody()['number_1']))))
```

---

#### Action 7c: Add Last Cost

**Where to add this:** Below `LastCost`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `LastCost`
2. Search for and select **Increment variable**
3. Rename to: `Add Last Cost`
4. **Name:** select `varTotalCost` from the dropdown
5. **Value:** click the field, then select from **Dynamic content**: the output of `LastCost`

---

#### Action 7d: LastDetail

**Where to add this:** Below `Add Last Cost`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `Add Last Cost`
2. Search for and select **Compose**
3. Rename to: `LastDetail`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
json(concat('{"ID":', string(first(body('Last_Item_Only'))?['ID']), ',"ReqKey":"', first(body('Last_Item_Only'))?['ReqKey'], '","AllocWeight":', string(outputs('LastAllocWeight')), ',"Cost":', string(outputs('LastCost')), ',"Method":"', first(body('Last_Item_Only'))?['Method']?['Value'], '"}'))
```

---

#### Action 7e: Append Last Detail

**Where to add this:** Below `LastDetail`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `LastDetail`
2. Search for and select **Append to array variable**
3. Rename to: `Append Last Detail`
4. **Name:** select `varBatchDetails` from the dropdown
5. **Value:** click the field, then select from **Dynamic content**: the output of `LastDetail`

#### Action 8a: Allocation Summary Lines

**Where to add this:** Below `Append Last Detail`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `Append Last Detail`
2. Search for and select **Select** (Data Operation)
3. Rename to: `Allocation Summary Lines`
4. **From:** click the **Expression** tab and paste: `variables('varBatchDetails')`
5. Switch the Select action to **text mode**: click the toggle icon (the small `T` or text-mode switch) on the right side of the **Map** row so the mapping shows a single text field instead of key/value columns
6. Click the text field, switch to the **Expression** tab, and paste:

```
concat(item()?['ReqKey'], ': $', formatNumber(float(item()?['Cost']), '0.00'), ' for ', string(item()?['AllocWeight']), 'g')
```

> **Why text mode?** In text mode, Select produces a flat array of strings (e.g., `["REQ-00164: $21.18 for 181.41g", "REQ-00165: $5.42 for 54.2g"]`) instead of an array of objects. This lets you `join()` directly without extraction hacks.

---

#### Action 8b: BatchAllocationSummary

**Where to add this:** Below `Allocation Summary Lines`, still inside the **True** branch of `Gate: Calculate Allocations`.

1. Click **+ Add an action** below `Allocation Summary Lines`
2. Search for and select **Compose**
3. Rename to: `BatchAllocationSummary`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste: `join(body('Allocation_Summary_Lines'), ' | ')`

> **What this produces:** `REQ-00164: $21.18 for 181.41g | REQ-00165: $5.42 for 54.2g`

---

#### Action 9: Build Plate Snapshot Texts

**Where to add this:** Below `BatchAllocationSummary`, still inside the **True** branch of `Gate: Calculate Allocations`.

These loops build the `PlatesPickedUp` and `PlateIDsPickedUp` texts for the consolidated payment row by combining each request's completed plate labels.

1. Click **+ Add an action** below `BatchAllocationSummary`
2. Search for and select **Apply to each**
3. Rename to: `Build Plate Snapshots`
4. **Select an output:** click the **Expression** tab and paste: `variables('varBatchDetails')`

Inside the loop, add Actions 9a–9h in order:

---

#### Action 9a: Detail Completed Plates

**Where to add this:** Inside the `Build Plate Snapshots` loop.

1. Click **+ Add an action** inside the loop
2. Search for and select **Filter array**
3. Rename to: `Detail Completed Plates`
4. **From:** click the **Expression** tab and paste: `body('Get_All_Batch_Plates')?['value']`
5. Click **Edit in advanced mode** (below the filter condition row) and paste:

```
@and(equals(item()?['RequestID'], items('Build_Plate_Snapshots')?['ID']), equals(item()?['Status']?['Value'], 'Completed'))
```

> **Why advanced mode?** This filter matches on two fields at once (RequestID and Status). Basic mode only supports one comparison per row.

---

#### Action 9b: Has Completed Plates

**Where to add this:** Below `Detail Completed Plates`, still inside the `Build Plate Snapshots` loop.

1. Click **+ Add an action** below `Detail Completed Plates`
2. Search for and select **Condition**
3. Rename to: `Has Completed Plates`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(body('Detail_Completed_Plates'))
```

5. Set the **Operator** dropdown to: `is greater than`
6. Type directly on the right side: `0`

Inside the **True** branch of `Has Completed Plates`, add Actions 9c–9h:

---

#### Action 9c: Detail Plate Labels

**Where to add this:** Inside the **True** branch of `Has Completed Plates`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Select** (Data Operation)
3. Rename to: `Detail Plate Labels`
4. **From:** click the **Expression** tab and paste: `body('Detail_Completed_Plates')`
5. Switch to **text mode**: click the toggle icon (the small `T` or text-mode switch) on the right side of the **Map** row so the mapping shows a single text field instead of key/value columns
6. Click the text field, switch to the **Expression** tab, and paste: `coalesce(item()?['DisplayLabel'], item()?['PlateKey'])`

---

#### Action 9d: Detail Plate Keys

**Where to add this:** Below `Detail Plate Labels`, still inside the **True** branch of `Has Completed Plates`.

1. Click **+ Add an action** below `Detail Plate Labels`
2. Search for and select **Select** (Data Operation)
3. Rename to: `Detail Plate Keys`
4. **From:** click the **Expression** tab and paste: `body('Detail_Completed_Plates')`
5. Switch to **text mode** (same toggle as above)
6. Click the text field, switch to the **Expression** tab, and paste: `item()?['PlateKey']`

---

#### Action 9e: PlateLabelsAppend

**Where to add this:** Below `Detail Plate Keys`, still inside the **True** branch of `Has Completed Plates`.

1. Click **+ Add an action** below `Detail Plate Keys`
2. Search for and select **Compose**
3. Rename to: `PlateLabelsAppend`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
concat(if(empty(variables('varPlateLabelsText')), '', ' | '), items('Build_Plate_Snapshots')?['ReqKey'], ': ', join(body('Detail_Plate_Labels'), ', '))
```

> **Why a Compose first?** Power Automate does not allow an Append action to reference its own variable in the Value expression. The Compose reads the current value of `varPlateLabelsText` to decide the separator, then the Append action uses the Compose output without self-referencing.

---

#### Action 9f: Append Plate Labels

**Where to add this:** Below `PlateLabelsAppend`, still inside the **True** branch of `Has Completed Plates`.

1. Click **+ Add an action** below `PlateLabelsAppend`
2. Search for and select **Append to string variable**
3. Rename to: `Append Plate Labels`
4. **Name:** select `varPlateLabelsText` from the dropdown
5. **Value:** click the field, then select from **Dynamic content**: the output of `PlateLabelsAppend`

---

#### Action 9g: PlateKeysAppend

**Where to add this:** Below `Append Plate Labels`, still inside the **True** branch of `Has Completed Plates`.

1. Click **+ Add an action** below `Append Plate Labels`
2. Search for and select **Compose**
3. Rename to: `PlateKeysAppend`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
concat(if(empty(variables('varPlateKeysText')), '', ' | '), items('Build_Plate_Snapshots')?['ReqKey'], ': ', join(body('Detail_Plate_Keys'), ', '))
```

---

#### Action 9h: Append Plate Keys

**Where to add this:** Below `PlateKeysAppend`, still inside the **True** branch of `Has Completed Plates`. This is the last action in the True branch.

1. Click **+ Add an action** below `PlateKeysAppend`
2. Search for and select **Append to string variable**
3. Rename to: `Append Plate Keys`
4. **Name:** select `varPlateKeysText` from the dropdown
5. **Value:** click the field, then select from **Dynamic content**: the output of `PlateKeysAppend`

**False branch of `Has Completed Plates`:** Leave empty.

(End of `Build Plate Snapshots` loop)

**False branch (`varSuccess` was false) in `Gate: Calculate Allocations`:** Leave the **False** branch empty.

---

## Step 6: Write Payment Data

**What this does:** Creates the consolidated payment record, updates all plate statuses, and patches each parent request. Everything is inside a Scope for error handling.

#### Action 1: Gate Before Writes

**Where to add this:** Below `Gate: Calculate Allocations`, after all branches rejoin, back at the top level of the flow.

1. Click **+ Add an action** below `Gate: Calculate Allocations`
2. Search for and select **Condition**
3. Rename to: `Gate: Write Data`
4. Set the condition exactly like this:
   - Left side: click the field, switch to the **Expression** tab, paste `variables('varSuccess')`
   - **Operator:** `is equal to`
   - Right side: switch to the **Expression** tab, paste `true`
5. Delete any extra blank condition row. The gate should have exactly **one** row.

> **Critical build check:** In code view, this gate should compare `@variables('varSuccess')` to `true`, not the literal string `"varSuccess"`. If this gate evaluates false unexpectedly, `Write All Records` and everything inside it will be skipped.

**True branch of `Gate: Write Data`:**

---

#### Action 2: Scope — Write All Records

**Where to add this:** Inside the **True** branch of `Gate: Write Data`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Scope**
3. Rename to: `Write All Records`

Inside the scope:

---

#### Action 2a: StaffShortName

**Where to add this:** Inside the `Write All Records` scope.

1. Click **+ Add an action** inside the scope
2. Search for and select **Compose**
3. Rename to: `StaffShortName`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
concat(first(split(triggerBody()['text_6'], ' ')), ' ', substring(last(split(triggerBody()['text_6'], ' ')), 0, 1), '.')
```

> **What this produces:** `"John S."` from `"John Smith"`.

---

#### Action 2b: Create Consolidated Payment

**Where to add this:** Below `StaffShortName`, still inside the `Write All Records` scope.

1. Click **+ Add an action** below `StaffShortName`
2. Search for and select **Create item** (SharePoint)
3. Rename to: `Create Consolidated Payment`
4. Fill in:
   - **Site Address:** type directly: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** type directly: `Payments`
   - **Amount:** click the **Expression** tab and paste: `variables('varTotalCost')`
   - **PaymentDate:** click the **Expression** tab and paste: `parseDateTime(trim(coalesce(triggerBody()?['text_7'], '')), 'en-US', 'yyyy-MM-dd')`
   - **RecordedAt:** click the **Expression** tab and paste: `utcNow()`
   - **Weight:** click the **Expression** tab and paste: `triggerBody()['number']`
   - **RequestID:** (leave blank — batch rows do not use RequestID)
   - **TransactionNumber:** click the **Expression** tab and paste: `if(empty(trim(coalesce(triggerBody()['text_2'], ''))), null, trim(triggerBody()['text_2']))`
   - **PayerName:** click the **Expression** tab and paste: `triggerBody()['text_4']`
   - **PaymentType Value:** click the **Expression** tab and paste: `triggerBody()['text_3']`
   - **PayerTigerCard:** (leave blank — batch flow has no TigerCard input)
   - **PlatesPickedUp:** click the field, then select from **Dynamic content**: the variable `varPlateLabelsText`
   - **PlateIDsPickedUp:** click the field, then select from **Dynamic content**: the variable `varPlateKeysText`
   - **RecordedBy Claims:** click the **Expression** tab and paste: `concat('i:0#.f|membership|', triggerBody()['text_5'])`
   - **StudentOwnMaterial:** click the **Expression** tab and paste: `triggerBody()['boolean']`
   - **BatchReqKeys:** click the **Expression** tab and paste: `triggerBody()['text_1']`
   - **BatchRequestIDs:** click the **Expression** tab and paste: `replace(triggerBody()['text'], ' ', '')` — this stores IDs without spaces (`164,165` instead of `164, 165`); the app's Split formula handles both formats
   - **BatchAllocationSummary:** click the field, then select from **Dynamic content**: the output of `BatchAllocationSummary`
   - **ReqKey:** (leave blank)

5. **Configure retry policy.**

---

#### Action 2c: Set varPaymentID

**Where to add this:** Below `Create Consolidated Payment`, still inside the `Write All Records` scope.

1. Click **+ Add an action** below `Create Consolidated Payment`
2. Search for and select **Set variable**
3. Rename to: `Set varPaymentID`
4. **Name:** select `varPaymentID` from the dropdown
5. **Value:** click the **Expression** tab and paste: `body('Create_Consolidated_Payment')?['ID']`

> **Critical build check:** The action must contain both **Name** and **Value**. If the card only shows `Name = varPaymentID` and the value box is blank, the flow can still run to completion but will return `PaymentID = "0"` even after a successful create.

---

#### Action 2d: Update Each Batch Request

**Where to add this:** Below `Set varPaymentID`, still inside the `Write All Records` scope.

1. Click **+ Add an action** below `Set varPaymentID`
2. Search for and select **Apply to each**
3. Rename to: `Update Each Batch Detail`
4. **Select an output:** click the **Expression** tab and paste: `variables('varBatchDetails')`

Inside the loop, add Actions 2d-1 through 2d-7 in order:

---

#### Action 2d-1: This Request Completed Plates

**Where to add this:** Inside the `Update Each Batch Detail` loop.

1. Click **+ Add an action** inside the loop
2. Search for and select **Filter array**
3. Rename to: `This Request Completed Plates`
4. **From:** click the **Expression** tab and paste: `body('Get_All_Batch_Plates')?['value']`
5. Click **Edit in advanced mode** (below the filter condition row) and paste:

```
@and(equals(item()?['RequestID'], items('Update_Each_Batch_Detail')?['ID']), equals(item()?['Status']?['Value'], 'Completed'))
```

---

#### Action 2d-2: Request Has Plates to Update

**Where to add this:** Below `This Request Completed Plates`, still inside the `Update Each Batch Detail` loop.

1. Click **+ Add an action** below `This Request Completed Plates`
2. Search for and select **Condition**
3. Rename to: `Request Has Plates to Update`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(body('This_Request_Completed_Plates'))
```

5. Set the **Operator** dropdown to: `is greater than`
6. Type directly on the right side: `0`

---

#### Action 2d-3: Update Batch Plate

**Where to add this:** Inside the **True** branch of `Request Has Plates to Update`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Apply to each**
3. Rename to: `Update Batch Plate`
4. **Select an output:** click the **Expression** tab and paste: `body('This_Request_Completed_Plates')`

---

#### Action 2d-4: Set Plate Picked Up

**Where to add this:** Inside the `Update Batch Plate` loop.

1. Click **+ Add an action** inside the `Update Batch Plate` loop
2. Search for and select **Update item** (SharePoint)
3. Rename to: `Set Plate Picked Up`
4. Fill in:
    - **Site Address:** type directly: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
    - **List Name:** type directly: `BuildPlates`
    - **Id:** click the **Expression** tab and paste: `items('Update_Batch_Plate')?['ID']`
    - **RequestID:** click the **Expression** tab and paste: `items('Update_Batch_Plate')?['RequestID']`
    - **PlateKey:** click the **Expression** tab and paste: `items('Update_Batch_Plate')?['PlateKey']`
    - **Machine Value:** click the **Expression** tab and paste: `items('Update_Batch_Plate')?['Machine']?['Value']`
    - **Title:** click the **Expression** tab and paste: `items('Update_Batch_Plate')?['Title']`
    - **Status Value:** type directly: `Picked Up`
5. **Configure retry policy.**

> **Why echo back required fields?** The Power Automate designer requires values for all columns marked as required in the SharePoint list (RequestID, PlateKey, Machine, Title). The values come from the loop item — the plates were already loaded by `Get All Batch Plates` in Step 4, so no extra API calls are needed.

**False branch of `Request Has Plates to Update`:** Leave empty.

---

#### Action 2d-5: Find This Request

**Where to add this:** Below `Request Has Plates to Update`, after both branches rejoin, still inside the `Update Each Batch Detail` loop.

1. Click **+ Add an action** below `Request Has Plates to Update` (after both branches rejoin)
2. Search for and select **Filter array**
3. Rename to: `Find This Request`
4. **From:** click the **Expression** tab and paste: `body('Get_Batch_Requests')?['value']`
5. Click the left side of the filter condition, switch to the **Expression** tab, and paste:

```
item()?['ID']
```

6. Set the **Operator** dropdown to: `is equal to`
7. Click the right side, switch to the **Expression** tab, and paste: `items('Update_Each_Batch_Detail')?['ID']`

---

#### Action 2d-6: BatchStaffNotes

**Where to add this:** Below `Find This Request`, still inside the `Update Each Batch Detail` loop.

1. Click **+ Add an action** below `Find This Request`
2. Search for and select **Compose**
3. Rename to: `BatchStaffNotes`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
concat(if(empty(coalesce(first(body('Find_This_Request'))?['StaffNotes'], '')), '', concat(first(body('Find_This_Request'))?['StaffNotes'], ' | ')), 'PAID (BATCH) by ', outputs('StaffShortName'), ': ', formatNumber(float(items('Update_Each_Batch_Detail')?['Cost']), '$#,##0.00'), ' for ', string(items('Update_Each_Batch_Detail')?['AllocWeight']), 'g on shared txn ', trim(triggerBody()['text_2']), ' covering ', triggerBody()['text_1'], ' - ', formatDateTime(utcNow(), 'M/d h:mmtt'))
```

---

#### Action 2d-7: Update Batch Request

**Where to add this:** Below `BatchStaffNotes`, still inside the `Update Each Batch Detail` loop. This is the last action in the loop.

1. Click **+ Add an action** below `BatchStaffNotes`
2. Search for and select **Update item** (SharePoint)
3. Rename to: `Update Batch Request`
4. Fill in:
    - **Site Address:** type directly: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
    - **List Name:** type directly: `PrintRequests`
    - **Id:** click the **Expression** tab and paste: `items('Update_Each_Batch_Detail')?['ID']`
    - **TigerCardNumber:** click the **Expression** tab and paste: `first(body('Find_This_Request'))?['TigerCardNumber']`
    - **Status Value:** type directly: `Paid & Picked Up`
    - **StudentOwnMaterial:** click the **Expression** tab and paste: `or(equals(first(body('Find_This_Request'))?['StudentOwnMaterial'], true), triggerBody()['boolean'])`
    - **StaffNotes:** click the field, then select from **Dynamic content**: the output of `BatchStaffNotes`
    - **LastAction Value:** type directly: `Status Change`
    - **LastActionBy Claims:** click the **Expression** tab and paste: `concat('i:0#.f|membership|', triggerBody()['text_5'])`
    - **LastActionAt:** click the **Expression** tab and paste: `utcNow()`
    - **FinalWeight:** click the **Expression** tab and paste: `add(coalesce(first(body('Find_This_Request'))?['FinalWeight'], 0), float(items('Update_Each_Batch_Detail')?['AllocWeight']))`
    - **FinalCost:** click the **Expression** tab and paste: `add(coalesce(first(body('Find_This_Request'))?['FinalCost'], 0), float(items('Update_Each_Batch_Detail')?['Cost']))`
    - **PaymentDate:** click the **Expression** tab and paste: `if(and(not(empty(first(body('Find_This_Request'))?['PaymentDate'])), greater(ticks(first(body('Find_This_Request'))?['PaymentDate']), ticks(parseDateTime(trim(coalesce(triggerBody()?['text_7'], '')), 'en-US', 'yyyy-MM-dd')))), first(body('Find_This_Request'))?['PaymentDate'], parseDateTime(trim(coalesce(triggerBody()?['text_7'], '')), 'en-US', 'yyyy-MM-dd'))`
5. **Configure retry policy.**

> **Critical build check:** Do not save this action with only the **Id** and a few batch-only fields filled in. Make sure the final weight, final cost, payment date, student-own-material flag, staff notes, and audit fields are all mapped, or the request update will be incomplete even if the run looks green.

(End of `Update Each Batch Detail` loop)

---

This is the end of the scope. Now add the success and failure handlers below the scope (still inside the **True** branch of `Gate: Write Data`).

---

#### Action 3: Mark Write Success

**Where to add this:** Below the `Write All Records` scope, still inside the **True** branch of `Gate: Write Data`.

1. Click **+ Add an action** below the `Write All Records` scope
2. Search for and select **Set variable**
3. Rename to: `Mark Write Success`
4. **Name:** select `varMessage` from the dropdown
5. **Value:** type directly: `Batch payment saved.`

> **Important:** This action should only run when the scope succeeded. By default, actions below a scope run only on success, so no extra configuration is needed here.
>
> **Critical build check:** This action must have a literal **Value** of `Batch payment saved.`. If the card only shows `Name = varMessage` with no value, the flow may return `Success = "true"` with an empty `Message`, which is a sign that the build is incomplete.

---

#### Action 4a: Handle Write Failure - Success

**Where to add this:** Below `Mark Write Success`, still inside the **True** branch of `Gate: Write Data`.

1. Click **+ Add an action** below `Mark Write Success`
2. Search for and select **Set variable**
3. Rename to: `Handle Write Failure - Success`
4. **Name:** select `varSuccess` from the dropdown
5. **Value:** select `false` from the Value dropdown (or type `false`)
6. **Configure run after:** click the **three dots (...)** on the action card → **Configure run after** → uncheck **is successful** → check **has failed** and **has timed out** → click **Done**

---

#### Action 4b: Handle Write Failure - Message

**Where to add this:** Below `Handle Write Failure - Success`, still inside the **True** branch of `Gate: Write Data`.

1. Click **+ Add an action** below `Handle Write Failure - Success`
2. Search for and select **Set variable**
3. Rename to: `Handle Write Failure - Message`
4. **Name:** select `varMessage` from the dropdown
5. **Value:** click the **Expression** tab and paste:

```
if(greater(variables('varPaymentID'), 0), concat('Consolidated payment record #', string(variables('varPaymentID')), ' was created, but a later update failed. Check the payment, plates, and requests manually in SharePoint.'), 'Failed to save the consolidated payment record. Nothing was written. Try again.')
```

6. **Configure run after:** click the **three dots (...)** on the action card → **Configure run after** → uncheck **is successful** → check **has failed** and **has timed out** → click **Done**

**False branch (`varSuccess` was false) in `Gate: Write Data`:** Leave the **False** branch empty.

---

## Step 7: Return Result

#### Action 1: Return Result

**Where to add this:** At the top level of the flow, below `Gate: Write Data` after all branches rejoin.

1. Click **+ Add an action** at the top level (after all gates rejoin — this must sit below `Gate: Write Data`, not inside a branch)
2. Search for and select **Respond to a PowerApp or flow**
3. Rename to: `Return Result`
4. Click **+ Add an output** → select **Text**
5. **Title:** type directly: `Success`
6. **Value:** click the **Expression** tab and paste: `toLower(string(variables('varSuccess')))`
7. Click **+ Add an output** → select **Text**
8. **Title:** type directly: `Message`
9. **Value:** click the field, then select from **Dynamic content**: the variable `varMessage`
10. Click **+ Add an output** → select **Text**
11. **Title:** type directly: `PaymentID`
12. **Value:** click the **Expression** tab and paste: `string(variables('varPaymentID'))`

> **Important:** All three outputs are returned as text strings. In Power Apps, the returned properties are lowercase: `success`, `message`, `paymentid`.
>
> **Success value must be lowercase:** Use **`toLower(string(variables('varSuccess')))`** for the **Success** output — not **`string(variables('varSuccess'))` alone**. Otherwise Power Automate often emits **`"True"`** (capital **T**), and **`varFlowResult.success = "true"`** in the app is **false**. The user then sees **`Notify(varFlowResult.message, NotificationType.Error)`** with **`Batch payment saved.`** (success text, error styling). The Staff app spec uses a defensive **`Or(...)`** check; normalizing the flow output avoids relying on that alone.
>
> **Validation check:** A good success response is `success = "true"`, `message = "Batch payment saved."`, and `paymentid` greater than `0`. If you get `success = "true"` with `message = ""` and `paymentid = "0"`, treat that as a build defect, not a successful save.

---

## Expected Result

A successful flow run should:

- Create exactly one consolidated row in `Payments` with `BatchRequestIDs`, `BatchReqKeys`, `BatchAllocationSummary`, combined weight/amount, and transaction details
- Mark all `Completed` plates for every batch request as `Picked Up`
- Update every batch `PrintRequests` record with allocated `FinalWeight`, `FinalCost`, `Status = Paid & Picked Up`, batch `StaffNotes` entry, and audit fields
- Return `Success = "true"`, `Message = "Batch payment saved."`, and `PaymentID` = the consolidated payment row ID

A failed flow run should:

- Return `Success = "false"` with a clear error message
- If validation failed: no data was changed anywhere
- If a write failed after the payment record: the message includes the payment ID

---

## Build Verification Checklist

After wiring the flow, inspect these cards once in the designer or code view before running any tests:

1. `Set varPaymentID` includes **Value** = `body('Create_Consolidated_Payment')?['ID']`
2. `Mark Write Success` includes **Value** = `Batch payment saved.`
3. `Handle Write Failure - Success` includes **Value** = `false`
4. `Handle Write Failure - Message` includes the full failure expression
5. Every `Gate: ...` condition uses left-side expression `variables('varSuccess')`, right-side expression `true`, and has no extra blank row
6. `Update Batch Request` includes the full field mapping, not just `Id`
7. `Return Result` is outside all conditions and returns all three outputs
8. All accumulator actions (`Add Est Weight`, `Accumulate Alloc Weights`, `Accumulate Total Cost`, `Add Last Cost`) use **Increment variable**, not Set variable — Set variable with a self-referencing `add()` expression will fail to save
9. `PlateLabelsAppend` and `PlateKeysAppend` are **Compose** actions, and `Append Plate Labels` and `Append Plate Keys` use **Append to string variable** — do not use Set variable with a self-referencing `concat()` expression

If any of those cards are missing their value mappings, the flow can appear to "run successfully" while writing nothing or while returning misleading defaults.

---

## Testing

### Test 1: Normal Batch of 2–3 Requests

1. Select 2–3 Completed requests with build plates
2. Run the flow with a valid transaction number and combined weight
3. Confirm one consolidated `Payments` row with correct `BatchAllocationSummary`
4. Confirm all plates for all batch requests are now `Picked Up`
5. Confirm all batch requests are `Paid & Picked Up` with correct allocated `FinalWeight` and `FinalCost`
6. Confirm the allocation summary adds up to the combined weight and total cost
7. Confirm the flow returns `Success = "true"`, `Message = "Batch payment saved."`, and `PaymentID` greater than `0`

### Test 2: One Request Changed Status After Selection

1. Select 2 requests, then change one to a different status in SharePoint before running the flow
2. Confirm the flow returns `Success = "false"` with the status error
3. Confirm no `Payments` row was created and no plates/requests were changed

### Test 3: Duplicate Transaction Number

1. Use a transaction number that already exists in `Payments`
2. Confirm the flow returns `Success = "false"` with the duplicate-transaction message
3. Confirm no `Payments` row was created and nothing else was written

### Test 4: Single-Item Batch

1. Select just one request
2. Confirm the flow processes it correctly — the allocation is 100% of the combined weight
3. Confirm the `Payments` row is a consolidated row (uses `BatchRequestIDs` instead of `RequestID`)
4. Confirm the flow returns `Success = "true"`, `Message = "Batch payment saved."`, and `PaymentID` greater than `0`

### Test 5: Allocation Rounding

1. Select 3 requests with estimated weights that produce repeating decimals when divided
2. Confirm allocated weights sum to exactly the combined weight (last item absorbs the rounding difference)
3. Confirm `BatchAllocationSummary` shows correct per-request values

### Test 6: TigerCard Number as Transaction

1. Set `PaymentType = "TigerCASH"` and `TransactionNumber` to a 16-digit number
2. Confirm the flow returns `Success = "false"` with the TigerCard warning
3. Confirm no data was changed anywhere

### Test 7: Blank Transaction Number

1. Leave `TransactionNumber` blank
2. Confirm the flow still processes the batch successfully when the rest of the inputs are valid
3. Confirm the consolidated `Payments` row is created with a blank transaction number
4. Confirm the flow returns `Success = "true"`, `Message = "Batch payment saved."`, and `PaymentID` greater than `0`

### Test 8: Ineligible Plate in Batch

1. Select a batch where at least one request still has a plate in `Queued` or `Printing`
2. Confirm the flow returns `Success = "false"` with the ineligible-plates message
3. Confirm no `Payments` row was created and no plates/requests were changed

---

## Related Documents

- `PowerAutomate/Flow-(H)-Payment-SaveSingle.md`
- `SharePoint/Payments-List-Setup.md`
- `SharePoint/BuildPlates-List-Setup.md`
- `SharePoint/PrintRequests-List-Setup.md`
- `PowerApps/StaffDashboard-App-Spec.md`
- `PowerAutomate/Flow-(C)-Action-LogAction.md`
- `Debug/Payment-BatchPayment-Fragility-Review.md`

---

*Created: March 31, 2026*
