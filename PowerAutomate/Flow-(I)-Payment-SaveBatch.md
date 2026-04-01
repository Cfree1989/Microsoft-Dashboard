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
| 14 | PaymentDate | Date | `triggerBody()['date']` | Business date of the payment |

> **Important:** Add inputs in this exact order. See Flow H for a detailed explanation of why order matters.

---

## Output Reference

| Name | Type | Description |
|------|------|-------------|
| Success | Text | `"true"` on success, `"false"` on failure |
| Message | Text | Human-readable result or error description |
| PaymentID | Text | The consolidated `Payments` row ID on success, or `"0"` on failure |

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
│       └── Validate count matches and all are Completed
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
│       ├── Calculate Last Item Allocation → Append
│       └── Build summary texts (Select + Join)
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

Same variable-gated pattern as Flow H. See `Flow-(H)-Payment-SaveSingle.md` for a full explanation.

---

## Retry Policy

Same retry policy as Flow H. Apply to all SharePoint actions: **Exponential interval**, Count `2`, Interval `PT10S`, Min `PT5S`, Max `PT30S`. See `Flow-(H)-Payment-SaveSingle.md` for full setup instructions and the rationale for these values (Power Apps ~2-minute timeout constraint).

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

Add inputs in the exact order from the Input Reference table above.

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

**Date input:**

| # | Click | Rename to |
|---|-------|-----------|
| 14 | + Add an input → Date | PaymentDate |

---

## Step 1: Initialize Variables

**What this does:** Creates the tracking variables for flow result, allocation calculations, and per-request detail collection.

Create each variable using **Initialize variable**. Add them in this order below the trigger:

| # | Rename to | Type | Initial Value |
|---|-----------|------|---------------|
| 1 | Initialize varSuccess | Boolean | `true` |
| 2 | Initialize varMessage | String | (blank) |
| 3 | Initialize varPaymentID | Integer | `0` |
| 4 | Initialize varTotalEstWeight | Float | `0` |
| 5 | Initialize varSumAllocatedWeights | Float | `0` |
| 6 | Initialize varTotalCost | Float | `0` |
| 7 | Initialize varBatchDetails | Array | `[]` |
| 8 | Initialize varPlateLabelsText | String | (blank) |
| 9 | Initialize varPlateKeysText | String | (blank) |

> **Important:** `varBatchDetails` will hold one JSON object per request with the calculated allocation. Initialize it with `[]` (empty array) using the Expression tab.

---

## Step 2: Validate Transaction Number

**What this does:** Same checks as Flow H — TigerCard number detection and duplicate transaction number check. Follow the exact same pattern as Flow H Step 2, but use these expression references for the batch inputs:

- Transaction number: `triggerBody()['text_2']` (not `triggerBody()['text']`)
- Payment type: `triggerBody()['text_3']` (not `triggerBody()['text_1']`)

Build the same three nested conditions (Is TigerCard Number → Gate → Has Transaction Number → Check Existing Transaction → Is Duplicate). Adjust every expression that references the transaction number or payment type to use the batch input positions above.

---

## Step 3: Load and Validate Batch Requests

**What this does:** Loads all selected requests from SharePoint in one query and verifies every one is still in `Completed` status. If any request is missing or in the wrong status, the entire batch fails.

#### Action 1: Gate Before Request Load

1. Add a **Condition** below Step 2, rename to: `Gate: Load Batch Requests`
2. Set: variable `varSuccess` **is equal to** `true`

**If yes:**

#### Action 2: Build Request Filter

3. Add a **Compose** action, rename to: `Request Filter`
4. **Inputs** — click **Expression** tab, paste:

```
concat('ID eq ', replace(triggerBody()['text'], ', ', ' or ID eq '))
```

> **What this builds:** An OData filter like `ID eq 164 or ID eq 165` from the comma-separated input `164, 165`.

#### Action 3: Get Batch Requests

5. Add **Get items** (SharePoint), rename to: `Get Batch Requests`
6. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Filter Query:** select the output of `Request Filter`
   - **Order By:** `ID asc`
   - **Top Count:** `500`
7. **Configure retry policy.**

#### Action 4: Count Expected Items

8. Add a **Compose** action, rename to: `Expected Item Count`
9. **Inputs** — click **Expression** tab, paste:

```
length(split(triggerBody()['text'], ', '))
```

#### Action 5: Validate Request Count

10. Add a **Condition**, rename to: `All Requests Found`
11. Set — **Expression** tab for left side:

```
length(body('Get_Batch_Requests')?['value'])
```

12. **Operator:** `is equal to` — **Right side:** select output of `Expected Item Count`

**If no (count mismatch):**
13. Set `varSuccess` = `false`, `varMessage` = `One or more batch items could not be found. They may have been deleted.`

**If yes:** Leave empty.

#### Action 6: Check All Completed

14. Add a **Filter array** action below the count check, rename to: `Non Completed Requests`
15. **From:** `body('Get_Batch_Requests')?['value']`
16. **Condition** — click **Expression** tab for left side: `item()?['Status']?['Value']` — **is not equal to** — `Completed`

17. Add a **Condition** below, rename to: `Any Not Completed`
18. Set — **Expression** tab: `length(body('Non_Completed_Requests'))` — **is greater than** — `0`

**If yes:**
19. Set `varSuccess` = `false`, `varMessage` = `One or more items are no longer in 'Completed' status. Remove them from the batch and try again.`

**If no:** Leave empty.

**If no (varSuccess was false) in `Gate: Load Batch Requests`:** Leave the **No** branch empty.

---

## Step 4: Load and Validate Batch Plates

**What this does:** Loads all build plates for every request in the batch and verifies none are still in `Queued` or `Printing` status. Batch payment is final-pickup-only, so every plate-backed request must have all plates ready.

#### Action 1: Gate Before Plate Load

1. Add a **Condition**, rename to: `Gate: Load Batch Plates`
2. Set: `varSuccess` **is equal to** `true`

**If yes:**

#### Action 2: Build Plate Filter

3. Add a **Compose**, rename to: `Plate Filter`
4. **Inputs** — click **Expression** tab, paste:

```
concat('RequestID eq ', replace(triggerBody()['text'], ', ', ' or RequestID eq '))
```

#### Action 3: Get All Batch Plates

5. Add **Get items** (SharePoint), rename to: `Get All Batch Plates`
6. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `BuildPlates`
   - **Filter Query:** select the output of `Plate Filter`
   - **Order By:** `ID asc`
   - **Top Count:** `5000`
7. **Configure retry policy.**

#### Action 4: Check for Ineligible Plates

8. Add a **Filter array**, rename to: `Ineligible Plates`
9. **From:** `body('Get_All_Batch_Plates')?['value']`
10. **Condition** (advanced mode): `@or(equals(item()?['Status']?['Value'], 'Queued'), equals(item()?['Status']?['Value'], 'Printing'))`

11. Add a **Condition**, rename to: `Has Ineligible Plates`
12. Set: `length(body('Ineligible_Plates'))` — **is greater than** — `0`

**If yes:**
13. Set `varSuccess` = `false`, `varMessage` = `One or more selected requests still have plates in Queued or Printing status. All plates must be Completed for batch pickup.`

**If no:** Leave empty.

**If no (varSuccess was false) in `Gate: Load Batch Plates`:** Leave the **No** branch empty.

---

## Step 5: Calculate Allocations

**What this does:** Splits the combined weight across requests proportionally based on each request's `EstimatedWeight`, calculates per-request costs, and builds the details needed for the consolidated payment record.

#### Action 1: Gate Before Calculations

1. Add a **Condition**, rename to: `Gate: Calculate Allocations`
2. Set: `varSuccess` **is equal to** `true`

**If yes:**

#### Action 2: Sum Estimated Weights

3. Add **Apply to each**, rename to: `Sum Estimated Weights`
4. **Select an output:** `body('Get_Batch_Requests')?['value']`

Inside the loop:

5. Add **Set variable**, rename to: `Add Est Weight`
6. **Name:** `varTotalEstWeight` — **Value** — **Expression** tab:

```
add(variables('varTotalEstWeight'), coalesce(items('Sum_Estimated_Weights')?['EstimatedWeight'], 0))
```

#### Action 3: LastItemID

7. Below the loop, add a **Compose**, rename to: `LastItemID`
8. **Inputs** — **Expression** tab:

```
last(body('Get_Batch_Requests')?['value'])?['ID']
```

> **Why `last()` instead of `max()`?** The results from `Get Batch Requests` are already ordered by `ID asc`, so the last item has the highest ID. Using `last()` is reliable and well-documented, whereas `max()` with a property path on an object array is undocumented behavior that may not work on all connector versions.

#### Action 4: BatchItemCount

9. Add a **Compose**, rename to: `BatchItemCount`
10. **Inputs** — **Expression** tab: `length(body('Get_Batch_Requests')?['value'])`

#### Action 5: Filter Non-Last Items

11. Add a **Filter array**, rename to: `Non Last Items`
12. **From:** `body('Get_Batch_Requests')?['value']`
13. **Condition** — **Expression** tab for left side: `item()?['ID']` — **is not equal to** — select output of `LastItemID`

#### Action 6: Calculate Non-Last Allocations

14. Add **Apply to each**, rename to: `Calculate Non Last Items`
15. **Select an output:** `body('Non_Last_Items')`

Inside the loop, add these actions in order:

16. **Compose**, rename to: `NonLastAllocWeight`:

```
if(greater(variables('varTotalEstWeight'), 0), round(div(mul(coalesce(items('Calculate_Non_Last_Items')?['EstimatedWeight'], 0), triggerBody()['number']), variables('varTotalEstWeight')), 2), round(div(triggerBody()['number'], outputs('BatchItemCount')), 2))
```

> **What this calculates:** `Round((EstimatedWeight / TotalEstWeight) × CombinedWeight, 2)`. If total estimated weight is zero, divides evenly.

17. **Compose**, rename to: `NonLastCost`:

```
if(triggerBody()['boolean'], mul(max(triggerBody()['number_3'], mul(outputs('NonLastAllocWeight'), if(equals(items('Calculate_Non_Last_Items')?['Method']?['Value'], 'Resin'), triggerBody()['number_2'], triggerBody()['number_1']))), triggerBody()['number_4']), max(triggerBody()['number_3'], mul(outputs('NonLastAllocWeight'), if(equals(items('Calculate_Non_Last_Items')?['Method']?['Value'], 'Resin'), triggerBody()['number_2'], triggerBody()['number_1']))))
```

> **What this calculates:** `Max(MinimumCost, AllocWeight × rate) × discount`. Same formula as Flow H but per-item.

18. **Set variable**: `varSumAllocatedWeights` — **Expression**: `add(variables('varSumAllocatedWeights'), outputs('NonLastAllocWeight'))`

19. **Set variable**: `varTotalCost` — **Expression**: `add(variables('varTotalCost'), outputs('NonLastCost'))`

20. **Compose**, rename to: `NonLastDetail` — **Expression** tab:

```
json(concat('{"ID":', string(items('Calculate_Non_Last_Items')?['ID']), ',"ReqKey":"', items('Calculate_Non_Last_Items')?['ReqKey'], '","AllocWeight":', string(outputs('NonLastAllocWeight')), ',"Cost":', string(outputs('NonLastCost')), ',"Method":"', items('Calculate_Non_Last_Items')?['Method']?['Value'], '"}'))
```

21. **Append to array variable**: `varBatchDetails` — **Value**: select output of `NonLastDetail`

(End of loop)

#### Action 7: Calculate Last Item

22. Below the loop, add a **Filter array**, rename to: `Last Item Only`
23. **From:** `body('Get_Batch_Requests')?['value']`
24. **Condition:** `item()?['ID']` **is equal to** select output of `LastItemID`

25. **Compose**, rename to: `LastAllocWeight` — **Expression**:

```
if(greater(outputs('BatchItemCount'), 1), sub(triggerBody()['number'], variables('varSumAllocatedWeights')), triggerBody()['number'])
```

> **What this calculates:** `CombinedWeight − sum of all other allocated weights`. This absorbs rounding drift so the total always matches exactly.

26. **Compose**, rename to: `LastCost` — **Expression**:

```
if(triggerBody()['boolean'], mul(max(triggerBody()['number_3'], mul(outputs('LastAllocWeight'), if(equals(first(body('Last_Item_Only'))?['Method']?['Value'], 'Resin'), triggerBody()['number_2'], triggerBody()['number_1']))), triggerBody()['number_4']), max(triggerBody()['number_3'], mul(outputs('LastAllocWeight'), if(equals(first(body('Last_Item_Only'))?['Method']?['Value'], 'Resin'), triggerBody()['number_2'], triggerBody()['number_1']))))
```

27. **Set variable**: `varTotalCost` — **Expression**: `add(variables('varTotalCost'), outputs('LastCost'))`

28. **Compose**, rename to: `LastDetail` — **Expression**:

```
json(concat('{"ID":', string(first(body('Last_Item_Only'))?['ID']), ',"ReqKey":"', first(body('Last_Item_Only'))?['ReqKey'], '","AllocWeight":', string(outputs('LastAllocWeight')), ',"Cost":', string(outputs('LastCost')), ',"Method":"', first(body('Last_Item_Only'))?['Method']?['Value'], '"}'))
```

29. **Append to array variable**: `varBatchDetails` — **Value**: select output of `LastDetail`

#### Action 8: Build Allocation Summary

30. Add a **Select** action (Data Operation), rename to: `Allocation Summary Lines`
31. **From:** `variables('varBatchDetails')`
32. Switch the Select action to **text mode**: click the toggle icon (the small `T` or text-mode switch) on the right side of the **Map** row so the mapping shows a single text field instead of key/value columns. Paste this expression:

```
concat(item()?['ReqKey'], ': $', formatNumber(float(item()?['Cost']), '0.00'), ' for ', string(item()?['AllocWeight']), 'g')
```

> **Why text mode?** In text mode, Select produces a flat array of strings (e.g., `["REQ-00164: $21.18 for 181.41g", "REQ-00165: $5.42 for 54.2g"]`) instead of an array of objects. This lets you `join()` directly without extraction hacks.

33. Add a **Compose**, rename to: `BatchAllocationSummary`
34. **Inputs** — **Expression**: `join(body('Allocation_Summary_Lines'), ' | ')`

> **What this produces:** `REQ-00164: $21.18 for 181.41g | REQ-00165: $5.42 for 54.2g`

#### Action 9: Build Plate Snapshot Texts

These loops build the `PlatesPickedUp` and `PlateIDsPickedUp` texts for the consolidated payment row by combining each request's completed plate labels.

35. Add **Apply to each**, rename to: `Build Plate Snapshots`
36. **Select an output:** `variables('varBatchDetails')`

Inside the loop:

37. **Filter array**, rename to: `Detail Completed Plates`
38. **From:** `body('Get_All_Batch_Plates')?['value']`
39. **Condition** (advanced mode): `@and(equals(item()?['RequestID'], items('Build_Plate_Snapshots')?['ID']), equals(item()?['Status']?['Value'], 'Completed'))`

40. **Condition**, rename to: `Has Completed Plates`
41. Set: `length(body('Detail_Completed_Plates'))` — **is greater than** — `0`

**If yes:**

42. **Select**, rename to: `Detail Plate Labels`
43. **From:** `body('Detail_Completed_Plates')` — switch to **text mode** (same toggle as Allocation Summary Lines above), then paste: `coalesce(item()?['DisplayLabel'], item()?['PlateKey'])`

44. **Select**, rename to: `Detail Plate Keys`
45. **From:** `body('Detail_Completed_Plates')` — switch to **text mode**, then paste: `item()?['PlateKey']`

46. **Set variable**: `varPlateLabelsText` — **Expression**:

```
concat(variables('varPlateLabelsText'), if(empty(variables('varPlateLabelsText')), '', ' | '), items('Build_Plate_Snapshots')?['ReqKey'], ': ', join(body('Detail_Plate_Labels'), ', '))
```

47. **Set variable**: `varPlateKeysText` — **Expression**:

```
concat(variables('varPlateKeysText'), if(empty(variables('varPlateKeysText')), '', ' | '), items('Build_Plate_Snapshots')?['ReqKey'], ': ', join(body('Detail_Plate_Keys'), ', '))
```

**If no (no completed plates):** Leave empty.

(End of loop)

**If no (varSuccess was false) in `Gate: Calculate Allocations`:** Leave the **No** branch empty.

---

## Step 6: Write Payment Data

**What this does:** Creates the consolidated payment record, updates all plate statuses, and patches each parent request. Everything is inside a Scope for error handling.

#### Action 1: Gate Before Writes

1. Add a **Condition**, rename to: `Gate: Write Data`
2. Set: `varSuccess` **is equal to** `true`

**If yes:**

#### Action 2: Scope — Write All Records

3. Add a **Scope**, rename to: `Write All Records`

Inside the scope:

#### Action 2a: StaffShortName

4. Add a **Compose**, rename to: `StaffShortName`
5. **Inputs** — **Expression**: `concat(first(split(triggerBody()['text_6'], ' ')), ' ', substring(last(split(triggerBody()['text_6'], ' ')), 0, 1), '.')`

#### Action 2b: Create Consolidated Payment

6. Add **Create item** (SharePoint), rename to: `Create Consolidated Payment`
7. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `Payments`
   - **RequestID:** (leave blank — batch rows do not use RequestID)
   - **ReqKey:** (leave blank)
   - **BatchRequestIDs:** select **Expression**: `replace(triggerBody()['text'], ' ', '')`

> **Note:** Store IDs without spaces for cleaner data: `164,165` instead of `164, 165`. The app's Split formula handles both formats.

   - **BatchReqKeys:** `triggerBody()['text_1']`
   - **BatchAllocationSummary:** select output of `BatchAllocationSummary`
   - **TransactionNumber:** select **Expression**: `if(empty(trim(coalesce(triggerBody()['text_2'], ''))), null, trim(triggerBody()['text_2']))`
   - **Weight:** select **Expression**: `triggerBody()['number']`
   - **Amount:** select **Expression**: `variables('varTotalCost')`
   - **PaymentType Value:** `triggerBody()['text_3']`
   - **PaymentDate:** `triggerBody()['date']`
   - **RecordedAt:** select **Expression**: `utcNow()`
   - **PayerName:** `triggerBody()['text_4']`
   - **PlatesPickedUp:** select variable `varPlateLabelsText`
   - **PlateIDsPickedUp:** select variable `varPlateKeysText`
   - **RecordedBy Claims:** select **Expression**: `concat('i:0#.f|membership|', triggerBody()['text_5'])`
   - **StudentOwnMaterial:** `triggerBody()['boolean']`

8. **Configure retry policy.**

#### Action 2c: Set varPaymentID

9. Add **Set variable**: `varPaymentID` — **Expression**: `body('Create_Consolidated_Payment')?['ID']`

#### Action 2d: Update Each Batch Request

10. Add **Apply to each**, rename to: `Update Each Batch Detail`
11. **Select an output:** `variables('varBatchDetails')`

Inside the loop:

12. **Filter array**, rename to: `This Request Completed Plates`
13. **From:** `body('Get_All_Batch_Plates')?['value']`
14. **Condition** (advanced mode): `@and(equals(item()?['RequestID'], items('Update_Each_Batch_Detail')?['ID']), equals(item()?['Status']?['Value'], 'Completed'))`

15. **Condition**, rename to: `Request Has Plates to Update`
16. Set: `length(body('This_Request_Completed_Plates'))` — **is greater than** — `0`

**If yes:**

17. **Apply to each**, rename to: `Update Batch Plate`
18. **Select an output:** `body('This_Request_Completed_Plates')`
19. Inside: **Update item** (SharePoint), rename to: `Set Plate Picked Up`
20. Fill in:
    - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
    - **List Name:** `BuildPlates`
    - **Id:** select **Expression**: `items('Update_Batch_Plate')?['ID']`
    - **RequestID:** select **Expression**: `items('Update_Batch_Plate')?['RequestID']`
    - **PlateKey:** select **Expression**: `items('Update_Batch_Plate')?['PlateKey']`
    - **Machine Value:** select **Expression**: `items('Update_Batch_Plate')?['Machine']?['Value']`
    - **Title:** select **Expression**: `items('Update_Batch_Plate')?['Title']`
    - **Status Value:** `Picked Up`
21. **Configure retry policy.**

> **Why echo back required fields?** The Power Automate designer requires values for all columns marked as required in the SharePoint list (RequestID, PlateKey, Machine, Title). The values come from the loop item — the plates were already loaded by `Get All Batch Plates` in Step 4, so no extra API calls are needed. SharePoint's PATCH semantics would preserve unspecified fields at the API level, but the designer validates required fields before saving.

**If no (no plates):** Leave empty.

22. **Filter array**, rename to: `Find This Request`
23. **From:** `body('Get_Batch_Requests')?['value']`
24. **Condition:** `item()?['ID']` **is equal to** **Expression** `items('Update_Each_Batch_Detail')?['ID']`

25. **Compose**, rename to: `BatchStaffNotes` — **Expression**:

```
concat(if(empty(coalesce(first(body('Find_This_Request'))?['StaffNotes'], '')), '', concat(first(body('Find_This_Request'))?['StaffNotes'], ' | ')), 'PAID (BATCH) by ', outputs('StaffShortName'), ': ', formatNumber(float(items('Update_Each_Batch_Detail')?['Cost']), '$#,##0.00'), ' for ', string(items('Update_Each_Batch_Detail')?['AllocWeight']), 'g on shared txn ', trim(triggerBody()['text_2']), ' covering ', triggerBody()['text_1'], ' - ', formatDateTime(utcNow(), 'M/d h:mmtt'))
```

26. **Update item** (SharePoint), rename to: `Update Batch Request`
27. Fill in:
    - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
    - **List Name:** `PrintRequests`
    - **Id:** select **Expression**: `items('Update_Each_Batch_Detail')?['ID']`
    - **Status Value:** `Paid & Picked Up`
    - **FinalWeight:** select **Expression**: `add(coalesce(first(body('Find_This_Request'))?['FinalWeight'], 0), float(items('Update_Each_Batch_Detail')?['AllocWeight']))`
    - **FinalCost:** select **Expression**: `add(coalesce(first(body('Find_This_Request'))?['FinalCost'], 0), float(items('Update_Each_Batch_Detail')?['Cost']))`
    - **PaymentDate:** select **Expression**: `if(and(not(empty(first(body('Find_This_Request'))?['PaymentDate'])), greater(ticks(first(body('Find_This_Request'))?['PaymentDate']), ticks(triggerBody()['date']))), first(body('Find_This_Request'))?['PaymentDate'], triggerBody()['date'])`
    - **StudentOwnMaterial:** select **Expression**: `or(equals(first(body('Find_This_Request'))?['StudentOwnMaterial'], true), triggerBody()['boolean'])`
    - **StaffNotes:** select output of `BatchStaffNotes`
    - **LastAction Value:** `Status Change`
    - **LastActionBy Claims:** select **Expression**: `concat('i:0#.f|membership|', triggerBody()['text_5'])`
    - **LastActionAt:** select **Expression**: `utcNow()`
28. **Configure retry policy.**

(End of inner loop)

---

This is the end of the scope. Now add the success and failure handlers below the scope (still inside the **Yes** branch of `Gate: Write Data`).

#### Action 3: Mark Write Success

29. Add **Set variable**: `varMessage` = `Batch payment saved.`

#### Action 4: Handle Write Failure

30. Add **Set variable**, rename to: `Handle Write Failure - Success`
31. **Name:** `varSuccess` — **Value:** `false`
32. **Configure run after:** uncheck **is successful** → check **has failed** and **has timed out**

33. Add **Set variable**, rename to: `Handle Write Failure - Message`
34. **Name:** `varMessage` — **Expression**:

```
if(greater(variables('varPaymentID'), 0), concat('Consolidated payment record #', string(variables('varPaymentID')), ' was created, but a later update failed. Check the payment, plates, and requests manually in SharePoint.'), 'Failed to save the consolidated payment record. Nothing was written. Try again.')
```

35. **Configure run after:** uncheck **is successful** → check **has failed** and **has timed out**

**If no (varSuccess was false) in `Gate: Write Data`:** Leave the **No** branch empty.

---

## Step 7: Return Result

#### Action 1: Return Result

1. Add **Respond to a PowerApp or flow** at the top level (after all gates rejoin)
2. Rename to: `Return Result`
3. Add outputs — same structure as Flow H:
   - **Success** (Text): `string(variables('varSuccess'))`
   - **Message** (Text): select variable `varMessage`
   - **PaymentID** (Text): `string(variables('varPaymentID'))`

---

## Expected Result

A successful flow run should:

- Create exactly one consolidated row in `Payments` with `BatchRequestIDs`, `BatchReqKeys`, `BatchAllocationSummary`, combined weight/amount, and transaction details
- Mark all `Completed` plates for every batch request as `Picked Up`
- Update every batch `PrintRequests` record with allocated `FinalWeight`, `FinalCost`, `Status = Paid & Picked Up`, batch `StaffNotes` entry, and audit fields
- Return `Success = "true"` with the consolidated payment ID

A failed flow run should:

- Return `Success = "false"` with a clear error message
- If validation failed: no data was changed anywhere
- If a write failed after the payment record: the message includes the payment ID

---

## Testing

### Test 1: Normal Batch of 2–3 Requests

1. Select 2–3 Completed requests with build plates
2. Run the flow with a valid transaction number and combined weight
3. Confirm one consolidated `Payments` row with correct `BatchAllocationSummary`
4. Confirm all plates for all batch requests are now `Picked Up`
5. Confirm all batch requests are `Paid & Picked Up` with correct allocated `FinalWeight` and `FinalCost`
6. Confirm the allocation summary adds up to the combined weight and total cost

### Test 2: One Request Changed Status After Selection

1. Select 2 requests, then change one to a different status in SharePoint before running the flow
2. Confirm the flow returns `Success = "false"` with the status error
3. Confirm no `Payments` row was created and no plates/requests were changed

### Test 3: Duplicate Transaction Number

1. Use a transaction number that already exists in `Payments`
2. Confirm the flow returns failure and nothing was written

### Test 4: Single-Item Batch

1. Select just one request
2. Confirm the flow processes it correctly — the allocation is 100% of the combined weight
3. Confirm the `Payments` row is a consolidated row (uses `BatchRequestIDs` instead of `RequestID`)

### Test 5: Allocation Rounding

1. Select 3 requests with estimated weights that produce repeating decimals when divided
2. Confirm allocated weights sum to exactly the combined weight (last item absorbs the rounding difference)
3. Confirm `BatchAllocationSummary` shows correct per-request values

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
