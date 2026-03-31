# Flow H (Payment-SaveSingle)

**Full Name:** Payment: Save Single Payment  
**Trigger:** When Power Apps calls a flow (V2)  
**Purpose:** Handle the entire single-payment save sequence server-side. Validates inputs, checks for duplicate transactions, writes the canonical payment record, updates plate statuses, and patches the parent request — then returns a clear success or failure result to the app.

---

## Overview

This flow replaces the multi-step save logic that previously lived inside `btnPaymentConfirm.OnSelect` in the Power App. Instead of the app writing to `Payments`, `BuildPlates`, and `PrintRequests` separately (with no rollback if a middle step fails), the app now calls this flow and waits for a single result.

The flow writes in this order:

1. `Payments` row (canonical ledger — written first)
2. `BuildPlates` patches (mark picked plates as Picked Up)
3. `PrintRequests` patch (running totals, status, notes)

If the `Payments` write fails, nothing else is written and the flow returns failure. If a later write fails, the flow returns failure but notes that the payment record was already created so staff can check manually.

**Related Documents:**
- `SharePoint/Payments-List-Setup.md`
- `SharePoint/BuildPlates-List-Setup.md`
- `SharePoint/PrintRequests-List-Setup.md`
- `PowerApps/StaffDashboard-App-Spec.md` — `btnPaymentConfirm.OnSelect`
- `PowerAutomate/Flow-(C)-Action-LogAction.md` — audit logging (still called by the app after this flow succeeds)

---

## Input Reference

Add inputs in the exact order listed below. The expression column shows how to reference each input inside the flow.

| # | Name | Type | Expression | Description |
|---|------|------|------------|-------------|
| 1 | RequestID | Number | `triggerBody()['number']` | `PrintRequests.ID` for the request being paid |
| 2 | Weight | Number | `triggerBody()['number_1']` | Grams picked up in this transaction |
| 3 | FilamentRate | Number | `triggerBody()['number_2']` | Price per gram for filament |
| 4 | ResinGramRate | Number | `triggerBody()['number_3']` | Price per gram for resin |
| 5 | MinimumCost | Number | `triggerBody()['number_4']` | Minimum charge floor |
| 6 | OwnMaterialDiscount | Number | `triggerBody()['number_5']` | Discount multiplier when student provides own material (e.g., `0.3` for 70% off) |
| 7 | TransactionNumber | Text | `triggerBody()['text']` | Receipt / check number / grant code (may be blank for grants) |
| 8 | PaymentType | Text | `triggerBody()['text_1']` | `TigerCASH`, `Check`, or `Grant/Program Code` |
| 9 | PayerName | Text | `triggerBody()['text_2']` | Name of the person who paid |
| 10 | PayerTigerCard | Text | `triggerBody()['text_3']` | Payer's TigerCard number (may be blank) |
| 11 | StaffEmail | Text | `triggerBody()['text_4']` | Email of the staff member processing the payment |
| 12 | StaffName | Text | `triggerBody()['text_5']` | Full name of the staff member |
| 13 | PickedPlateIDs | Text | `triggerBody()['text_6']` | Comma-separated `BuildPlates.ID` values being picked up, or blank if request has no plates |
| 14 | PickedPlateLabels | Text | `triggerBody()['text_7']` | Pre-built display labels for picked plates (e.g., `1/3, 2/3`), or blank |
| 15 | PickedPlateKeys | Text | `triggerBody()['text_8']` | Pre-built `PlateKey` values for picked plates (e.g., `BP-42-A1, BP-42-A2`), or blank |
| 16 | PaymentNotes | Text | `triggerBody()['text_9']` | Optional staff payment notes |
| 17 | StudentOwnMaterial | Yes/No | `triggerBody()['boolean']` | Whether the student provided their own material |
| 18 | IsPartialPickup | Yes/No | `triggerBody()['boolean_1']` | Whether this is a partial pickup (do not close the request) |
| 19 | PaymentDate | Date | `triggerBody()['date']` | Business date of the payment |

> **Important:** Add inputs in this exact order. Expressions like `triggerBody()['number_1']` depend on the order you add inputs of each type. If you add Weight before RequestID, `number` and `number_1` will be swapped and every expression that references them will point to the wrong input.

---

## Output Reference

| Name | Type | Description |
|------|------|-------------|
| Success | Text | `"true"` on success, `"false"` on failure |
| Message | Text | Human-readable result or error description |
| PaymentID | Text | The new `Payments` row ID on success, or `"0"` on failure |

> **Important:** Power Apps reads these as lowercase properties: `success`, `message`, `paymentid`.

---

## Flow Structure Overview

```
Flow
├── Trigger (19 inputs)
│
├── Initialize varSuccess (Boolean, true)
├── Initialize varMessage (String, "")
├── Initialize varPaymentID (Integer, 0)
│
├── Step 2: Validate Transaction Number
│   ├── Is TigerCard Number? (Condition)
│   │   └── Yes → Set varSuccess = false
│   └── Gate (Condition: varSuccess = true)
│       └── Yes → Has Transaction Number? (Condition)
│           └── Yes → Get Items: Check Existing Transaction
│               └── Is Duplicate? (Condition)
│                   └── Yes → Set varSuccess = false
│
├── Step 3: Load and Validate Request
│   └── Gate (Condition: varSuccess = true)
│       └── Yes → Get Items: Get Current Request
│           └── Request Invalid? (Condition)
│               └── Yes → Set varSuccess = false
│
├── Step 4: Load Build Plates
│   └── Gate (Condition: varSuccess = true)
│       └── Yes → Get Items: Get Request Plates
│           └── Filter Array: Count Already Picked Up
│
├── Step 5: Prepare Calculated Values
│   └── Gate (Condition: varSuccess = true)
│       └── Yes → Compose: BaseCost, FinalCost, StaffShortName,
│                  ResultStatus, NewFinalWeight, NewFinalCost,
│                  NewPaymentDate, NewStaffNotes, NewPaymentNotes
│
├── Step 6: Write Payment Data
│   └── Gate (Condition: varSuccess = true)
│       └── Yes → Scope: Write All Records
│           ├── Create Item (Payments)
│           ├── Set varPaymentID
│           ├── Has Plates? (Condition)
│           │   └── Yes → Apply to Each → Update Item (BuildPlates)
│           └── Update Item (PrintRequests)
│       ├── [scope succeeded] → Set varMessage = success
│       └── [scope failed] → Set varSuccess = false, varMessage = error
│
└── Step 7: Return Result
    └── Respond to PowerApp (varSuccess, varMessage, varPaymentID)
```

---

## Error Handling Strategy

The flow uses a **variable-gated** pattern:

1. `varSuccess` starts as `true`. Each validation step can flip it to `false`.
2. Every subsequent step checks `varSuccess` first. If it is `false`, the step is skipped.
3. All write operations live inside a single **Scope**. If any write fails, the scope fails.
4. After the scope, a **run-after** handler checks whether the scope failed and sets `varSuccess = false` with a message that tells staff what happened and whether the payment record was already created.
5. One single **Respond to a PowerApp or flow** action at the very end returns the final result.

This guarantees exactly one response per flow run.

---

## Retry Policy

Use this retry policy on all SharePoint **Get items**, **Create item**, and **Update item** actions:

- **Retry policy:** `Exponential interval`
- **Count:** `4`
- **Interval:** `PT1M`
- **Minimum interval:** `PT20S`
- **Maximum interval:** `PT1H`

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

## Create Flow

### Trigger

**UI steps:**
1. Go to **Power Automate** → **My flows**
2. Click **+ New flow** → **Instant cloud flow**
3. **Flow name:** `Flow-(H)-Payment-SaveSingle`
4. **Trigger:** `When Power Apps calls a flow (V2)`
5. Click **Create**

### Inputs

**UI steps:**
1. Open the trigger card
2. Add each input in the exact order below. For each input, click **+ Add an input**, select the type, then rename it.

**Number inputs (add first, in this order):**

| # | Click | Rename to |
|---|-------|-----------|
| 1 | + Add an input → Number | RequestID |
| 2 | + Add an input → Number | Weight |
| 3 | + Add an input → Number | FilamentRate |
| 4 | + Add an input → Number | ResinGramRate |
| 5 | + Add an input → Number | MinimumCost |
| 6 | + Add an input → Number | OwnMaterialDiscount |

**Text inputs (add next, in this order):**

| # | Click | Rename to |
|---|-------|-----------|
| 7 | + Add an input → Text | TransactionNumber |
| 8 | + Add an input → Text | PaymentType |
| 9 | + Add an input → Text | PayerName |
| 10 | + Add an input → Text | PayerTigerCard |
| 11 | + Add an input → Text | StaffEmail |
| 12 | + Add an input → Text | StaffName |
| 13 | + Add an input → Text | PickedPlateIDs |
| 14 | + Add an input → Text | PickedPlateLabels |
| 15 | + Add an input → Text | PickedPlateKeys |
| 16 | + Add an input → Text | PaymentNotes |

**Yes/No inputs (add next):**

| # | Click | Rename to |
|---|-------|-----------|
| 17 | + Add an input → Yes/No | StudentOwnMaterial |
| 18 | + Add an input → Yes/No | IsPartialPickup |

**Date input (add last):**

| # | Click | Rename to |
|---|-------|-----------|
| 19 | + Add an input → Date | PaymentDate |

---

## Step 1: Initialize Variables

**What this does:** Creates three variables the flow uses to track whether things are going well, what message to return, and the ID of the payment record if one is created.

#### Action 1: Initialize varSuccess

1. Click **+ Add an action** below the trigger
2. Search for and select **Initialize variable**
3. Rename the action to: `Initialize varSuccess`
4. Fill in:
   - **Name:** `varSuccess`
   - **Type:** `Boolean`
   - **Value:** `true`

#### Action 2: Initialize varMessage

1. Click **+ Add an action** below `Initialize varSuccess`
2. Search for and select **Initialize variable**
3. Rename the action to: `Initialize varMessage`
4. Fill in:
   - **Name:** `varMessage`
   - **Type:** `String`
   - **Value:** (leave blank)

#### Action 3: Initialize varPaymentID

1. Click **+ Add an action** below `Initialize varMessage`
2. Search for and select **Initialize variable**
3. Rename the action to: `Initialize varPaymentID`
4. Fill in:
   - **Name:** `varPaymentID`
   - **Type:** `Integer`
   - **Value:** `0`

---

## Step 2: Validate Transaction Number

**What this does:** Catches two common input problems before any data is loaded: a TigerCard number entered as a receipt number, and a transaction number that has already been used.

#### Action 1: Is TigerCard Number

1. Click **+ Add an action** below `Initialize varPaymentID`
2. Search for and select **Condition**
3. Rename to: `Is TigerCard Number`
4. Set the condition — click **Expression** tab for the left side, paste:

```
and(equals(triggerBody()['text_1'], 'TigerCASH'), equals(length(trim(coalesce(triggerBody()['text'], ''))), 16), isFloat(trim(coalesce(triggerBody()['text'], ''))))
```

5. **Operator:** `is equal to`
6. **Right side:** `true`

**If yes (it is a TigerCard number):**

7. Inside the **Yes** branch, add **Set variable**
8. Rename to: `Mark TigerCard Failure`
9. **Name:** `varSuccess` — **Value:** `false`
10. Add another **Set variable** below it
11. Rename to: `Set TigerCard Error`
12. **Name:** `varMessage` — **Value:** `That looks like a TigerCard number. Please enter the receipt or approval number instead.`

**If no:** Leave the **No** branch empty.

#### Action 2: Gate After TigerCard Check

1. Click **+ Add an action** below the `Is TigerCard Number` condition (after both branches rejoin)
2. Add a **Condition**, rename to: `Gate: Check Uniqueness`
3. Set: variable `varSuccess` **is equal to** `true`

**If yes (still valid):**

4. Inside the **Yes** branch, add a **Condition**, rename to: `Has Transaction Number`
5. Set — **Expression** tab for left side:

```
length(trim(coalesce(triggerBody()['text'], '')))
```

6. **Operator:** `is greater than` — **Right side:** `0`

**If yes (has a transaction number):**

7. Inside the **Yes** branch of `Has Transaction Number`, add **Get items** (SharePoint)
8. Rename to: `Check Existing Transaction`
9. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `Payments`
   - **Filter Query:** click **Expression** tab, paste:

```
concat('TransactionNumber eq ''', trim(triggerBody()['text']), '''')
```

   - **Top Count:** `1`

10. **Configure retry policy** on this action (see Retry Policy section above).

11. Add a **Condition** below `Check Existing Transaction`, rename to: `Is Duplicate Transaction`
12. Set — **Expression** tab for left side:

```
length(body('Check_Existing_Transaction')?['value'])
```

13. **Operator:** `is greater than` — **Right side:** `0`

**If yes (duplicate found):**

14. Add **Set variable**: `varSuccess` = `false`
15. Add **Set variable**: `varMessage` — **Expression** tab:

```
concat('Transaction number ''', trim(triggerBody()['text']), ''' already exists. Use a unique number.')
```

**If no (not duplicate):** Leave the **No** branch empty.

**If no (blank transaction number) in `Has Transaction Number`:** Leave the **No** branch empty. Blank transaction numbers are allowed.

**If no (varSuccess already false) in `Gate: Check Uniqueness`:** Leave the **No** branch empty.

> **Important:** This uniqueness check is fully delegable against the SharePoint list. It replaces the app's old `Filter(colAllPayments, ...)` check, which was limited by the non-delegable row cap and could miss older duplicates once the `Payments` list grew large.

---

## Step 3: Load and Validate Request

**What this does:** Loads the current request from SharePoint using fresh data and verifies it is still in a status that allows payment.

#### Action 1: Gate Before Request Load

1. Click **+ Add an action** below `Gate: Check Uniqueness` (after all branches rejoin)
2. Add a **Condition**, rename to: `Gate: Load Request`
3. Set: variable `varSuccess` **is equal to** `true`

**If yes:**

#### Action 2: Get Current Request

4. Add **Get items** (SharePoint)
5. Rename to: `Get Current Request`
6. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Filter Query:** click **Expression** tab, paste:

```
concat('ID eq ', triggerBody()['number'])
```

   - **Top Count:** `1`

7. **Configure retry policy.**

#### Action 3: Check Request Valid

8. Add a **Condition** below `Get Current Request`, rename to: `Is Request Valid`
9. Set — **Expression** tab for left side:

```
if(and(greater(length(body('Get_Current_Request')?['value']), 0), or(equals(first(body('Get_Current_Request')?['value'])?['Status']?['Value'], 'Completed'), equals(first(body('Get_Current_Request')?['value'])?['Status']?['Value'], 'Printing'))), true, false)
```

10. **Operator:** `is equal to` — **Right side:** `true`

**If no (request invalid):**

11. Add **Set variable**: `varSuccess` = `false`
12. Add **Set variable**: `varMessage` = `This request is no longer eligible for payment. It may have been processed by another staff member.`

**If yes (request is valid):** Leave the **Yes** branch empty.

**If no (varSuccess was false) in `Gate: Load Request`:** Leave the **No** branch empty.

---

## Step 4: Load Build Plates

**What this does:** Loads the request's build plates so the flow can count plate states and determine whether the request should be closed after payment.

#### Action 1: Gate Before Plate Load

1. Click **+ Add an action** below `Gate: Load Request` (after all branches rejoin)
2. Add a **Condition**, rename to: `Gate: Load Plates`
3. Set: variable `varSuccess` **is equal to** `true`

**If yes:**

#### Action 2: Get Request Plates

4. Add **Get items** (SharePoint)
5. Rename to: `Get Request Plates`
6. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `BuildPlates`
   - **Filter Query:** click **Expression** tab, paste:

```
concat('RequestID eq ', triggerBody()['number'])
```

   - **Order By:** `ID asc`
   - **Top Count:** `500`

7. **Configure retry policy.**

#### Action 3: Count Already Picked Up

8. Add a **Filter array** action below `Get Request Plates`
9. Rename to: `Already Picked Up Plates`
10. **From:** select the `value` output from `Get Request Plates`
11. Set the filter condition — click **Expression** tab for left side:

```
item()?['Status']?['Value']
```

12. **Operator:** `is equal to` — **Right side:** `Picked Up`

**If no (varSuccess was false) in `Gate: Load Plates`:** Leave the **No** branch empty.

---

## Step 5: Prepare Calculated Values

**What this does:** Calculates the payment amount, the staff short name, the new running totals, and the result status — all stored in Compose actions so the write step can reference them.

#### Action 1: Gate Before Calculations

1. Click **+ Add an action** below `Gate: Load Plates` (after all branches rejoin)
2. Add a **Condition**, rename to: `Gate: Calculate`
3. Set: variable `varSuccess` **is equal to** `true`

**If yes:**

#### Action 2: BaseCost

4. Add a **Compose** action, rename to: `BaseCost`
5. **Inputs** — click **Expression** tab, paste:

```
max(triggerBody()['number_4'], mul(triggerBody()['number_1'], if(equals(first(body('Get_Current_Request')?['value'])?['Method']?['Value'], 'Resin'), triggerBody()['number_3'], triggerBody()['number_2'])))
```

> **What this calculates:** `Max(MinimumCost, Weight × rate)`. The rate depends on the request's print method (resin or filament).

#### Action 3: FinalCost

6. Add a **Compose** action, rename to: `FinalCost`
7. **Inputs** — click **Expression** tab, paste:

```
if(triggerBody()['boolean'], mul(outputs('BaseCost'), triggerBody()['number_5']), outputs('BaseCost'))
```

> **What this calculates:** If `StudentOwnMaterial` is true, multiplies by the discount factor. Otherwise uses the base cost unchanged.

#### Action 4: StaffShortName

8. Add a **Compose** action, rename to: `StaffShortName`
9. **Inputs** — click **Expression** tab, paste:

```
concat(first(split(triggerBody()['text_5'], ' ')), ' ', substring(last(split(triggerBody()['text_5'], ' ')), 0, 1), '.')
```

> **What this produces:** `"John S."` from `"John Smith"`.

#### Action 5: BeingPickedUpCount

10. Add a **Compose** action, rename to: `BeingPickedUpCount`
11. **Inputs** — click **Expression** tab, paste:

```
if(empty(trim(coalesce(triggerBody()['text_6'], ''))), 0, length(split(replace(triggerBody()['text_6'], ' ', ''), ',')))
```

> **What this counts:** The number of plate IDs the app sent for pickup. Returns `0` if PickedPlateIDs is blank.

#### Action 6: ResultStatus

12. Add a **Compose** action, rename to: `ResultStatus`
13. **Inputs** — click **Expression** tab, paste:

```
if(or(triggerBody()['boolean_1'], equals(first(body('Get_Current_Request')?['value'])?['Status']?['Value'], 'Printing')), first(body('Get_Current_Request')?['value'])?['Status']?['Value'], if(or(equals(length(body('Get_Request_Plates')?['value']), 0), greaterOrEquals(add(length(body('Already_Picked_Up_Plates')), outputs('BeingPickedUpCount')), length(body('Get_Request_Plates')?['value']))), 'Paid & Picked Up', first(body('Get_Current_Request')?['value'])?['Status']?['Value']))
```

> **What this determines:**
> - If `IsPartialPickup` is true or request is still `Printing` → keep the current status.
> - If the request has no plates, or all plates will be `Picked Up` after this transaction → `Paid & Picked Up`.
> - Otherwise → keep the current status.

#### Action 7: NewFinalWeight

14. Add a **Compose** action, rename to: `NewFinalWeight`
15. **Inputs** — click **Expression** tab, paste:

```
add(coalesce(first(body('Get_Current_Request')?['value'])?['FinalWeight'], 0), triggerBody()['number_1'])
```

> **What this calculates:** Adds the new weight to the request's current `FinalWeight`. This is a delta approach — it assumes the existing `FinalWeight` is correct from prior saves.

#### Action 8: NewFinalCost

16. Add a **Compose** action, rename to: `NewFinalCost`
17. **Inputs** — click **Expression** tab, paste:

```
add(coalesce(first(body('Get_Current_Request')?['value'])?['FinalCost'], 0), outputs('FinalCost'))
```

#### Action 9: NewPaymentDate

18. Add a **Compose** action, rename to: `NewPaymentDate`
19. **Inputs** — click **Expression** tab, paste:

```
if(and(not(empty(first(body('Get_Current_Request')?['value'])?['PaymentDate'])), greater(ticks(first(body('Get_Current_Request')?['value'])?['PaymentDate']), ticks(triggerBody()['date']))), first(body('Get_Current_Request')?['value'])?['PaymentDate'], triggerBody()['date'])
```

> **What this calculates:** The later of the current `PaymentDate` and the new payment date.

#### Action 10: SanitizedNotes

20. Add a **Compose** action, rename to: `SanitizedNotes`
21. **Inputs** — click **Expression** tab, paste:

```
replace(replace(replace(replace(replace(replace(replace(coalesce(triggerBody()['text_9'], ''), ' | ', '; '), ' ~~ ', '; '), '[Summary]', '(Summary)'), '[Changes]', '(Changes)'), '[Reason]', '(Reason)'), '[Context]', '(Context)'), '[Comment]', '(Comment)')
```

> **What this does:** Replaces delimiter characters in the staff notes so they don't break the structured `StaffNotes` format.

#### Action 11: NewStaffNotes

22. Add a **Compose** action, rename to: `NewStaffNotes`
23. **Inputs** — click **Expression** tab, paste:

```
concat(if(empty(coalesce(first(body('Get_Current_Request')?['value'])?['StaffNotes'], '')), '', concat(first(body('Get_Current_Request')?['value'])?['StaffNotes'], ' | ')), 'PAID by ', outputs('StaffShortName'), ': [Summary] $', formatNumber(outputs('FinalCost'), '0.00'), ' for ', string(triggerBody()['number_1']), 'g [Changes] [Reason] [Context] [Comment] ', outputs('SanitizedNotes'), ' - ', formatDateTime(utcNow(), 'M/d h:mmtt'))
```

> **What this builds:** Appends a `PAID by ...` entry to the existing `StaffNotes`, using the same `[Summary] [Changes] [Reason] [Context] [Comment]` format the app uses.

#### Action 12: NewPaymentNotes

24. Add a **Compose** action, rename to: `NewPaymentNotes`
25. **Inputs** — click **Expression** tab, paste:

```
if(empty(trim(coalesce(triggerBody()['text_9'], ''))), coalesce(first(body('Get_Current_Request')?['value'])?['PaymentNotes'], ''), concat(if(empty(coalesce(first(body('Get_Current_Request')?['value'])?['PaymentNotes'], '')), '', concat(first(body('Get_Current_Request')?['value'])?['PaymentNotes'], ' | ')), 'PAYMENT NOTE by ', triggerBody()['text_5'], ': ', triggerBody()['text_9']))
```

> **What this does:** If the staff entered payment notes, appends them to existing `PaymentNotes`. If not, keeps the current value unchanged.

**If no (varSuccess was false) in `Gate: Calculate`:** Leave the **No** branch empty.

---

## Step 6: Write Payment Data

**What this does:** Creates the payment record, updates plate statuses, and patches the parent request. All three writes live inside a Scope so the flow can catch any failure as a group.

#### Action 1: Gate Before Writes

1. Click **+ Add an action** below `Gate: Calculate` (after all branches rejoin)
2. Add a **Condition**, rename to: `Gate: Write Data`
3. Set: variable `varSuccess` **is equal to** `true`

**If yes:**

#### Action 2: Scope — Write All Records

4. Inside the **Yes** branch, add a **Scope** action
5. Rename to: `Write All Records`

Inside this scope, add the following actions in order:

#### Action 2a: Create Payment Record

6. Inside the scope, add **Create item** (SharePoint)
7. Rename to: `Create Payment Record`
8. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `Payments`
   - **RequestID:** select **Expression** tab: `triggerBody()['number']`
   - **ReqKey:** select **Expression** tab: `first(body('Get_Current_Request')?['value'])?['ReqKey']`
   - **TransactionNumber:** select **Expression** tab: `if(empty(trim(coalesce(triggerBody()['text'], ''))), null, trim(triggerBody()['text']))`
   - **Weight:** select **Expression** tab: `triggerBody()['number_1']`
   - **Amount:** select **Expression** tab: `outputs('FinalCost')`
   - **PaymentType Value:** select the `PaymentType` input from trigger (or enter expression): `triggerBody()['text_1']`
   - **PaymentDate:** select the `PaymentDate` input from trigger: `triggerBody()['date']`
   - **RecordedAt:** select **Expression** tab: `utcNow()`
   - **PayerName:** select **Expression** tab: `triggerBody()['text_2']`
   - **PayerTigerCard:** select **Expression** tab: `triggerBody()['text_3']`
   - **PlatesPickedUp:** select **Expression** tab: `coalesce(triggerBody()['text_7'], '')`
   - **PlateIDsPickedUp:** select **Expression** tab: `coalesce(triggerBody()['text_8'], '')`
   - **RecordedBy Claims:** select **Expression** tab: `concat('i:0#.f|membership|', triggerBody()['text_4'])`
   - **StudentOwnMaterial:** select the `StudentOwnMaterial` input from trigger: `triggerBody()['boolean']`

9. **Configure retry policy.**

> **Important:** This is the most critical write. It creates the canonical finance ledger row. If this action fails, the scope stops immediately and no plates or requests are touched.

#### Action 2b: Set varPaymentID

10. Add **Set variable** below `Create Payment Record` (still inside the scope)
11. Rename to: `Set varPaymentID`
12. **Name:** `varPaymentID`
13. **Value:** select **Expression** tab: `body('Create_Payment_Record')?['ID']`

#### Action 2c: Has Plates to Update

14. Add a **Condition** below `Set varPaymentID` (still inside the scope)
15. Rename to: `Has Plates to Update`
16. Set — **Expression** tab for left side:

```
length(trim(coalesce(triggerBody()['text_6'], '')))
```

17. **Operator:** `is greater than` — **Right side:** `0`

**If yes (has plates):**

#### Action 2d: Update Each Plate

18. Inside the **Yes** branch, add **Apply to each**
19. Rename to: `Update Each Plate`
20. **Select an output from previous steps:** click **Expression** tab, paste:

```
split(replace(triggerBody()['text_6'], ' ', ''), ',')
```

21. Inside the loop, add **Update item** (SharePoint)
22. Rename to: `Update Plate Status`
23. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `BuildPlates`
   - **Id:** click **Expression** tab: `int(items('Update_Each_Plate'))`
   - **Status Value:** `Picked Up`

24. **Configure retry policy** on `Update Plate Status`.

**If no (no plates):** Leave the **No** branch empty.

#### Action 2e: Update Parent Request

25. Add **Update item** (SharePoint) below the `Has Plates to Update` condition (still inside the scope, after both branches rejoin)
26. Rename to: `Update Parent Request`
27. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** click **Expression** tab: `triggerBody()['number']`
   - **FinalWeight:** click **Expression** tab: `outputs('NewFinalWeight')`
   - **FinalCost:** click **Expression** tab: `outputs('NewFinalCost')`
   - **PaymentDate:** click **Expression** tab: `outputs('NewPaymentDate')`
   - **StudentOwnMaterial:** click **Expression** tab: `or(equals(first(body('Get_Current_Request')?['value'])?['StudentOwnMaterial'], true), triggerBody()['boolean'])`
   - **Status Value:** click **Expression** tab: `outputs('ResultStatus')`
   - **StaffNotes:** click **Expression** tab: `outputs('NewStaffNotes')`
   - **PaymentNotes:** click **Expression** tab: `outputs('NewPaymentNotes')`
   - **LastAction Value:** `Picked Up`
   - **LastActionBy Claims:** click **Expression** tab: `concat('i:0#.f|membership|', triggerBody()['text_4'])`
   - **LastActionAt:** click **Expression** tab: `utcNow()`

28. **Configure retry policy.**

> **Important:** This is the last action inside the scope. If everything above succeeded, this patches the parent request with updated totals, status, notes, and audit fields.

---

This is the end of the scope. Now add the success and failure handlers.

#### Action 3: Mark Write Success

29. Click **+ Add an action** below the `Write All Records` scope (still inside the **Yes** branch of `Gate: Write Data`)
30. Add **Set variable**, rename to: `Mark Write Success`
31. **Name:** `varMessage` — **Value:** `Payment saved.`

> **Important:** This action should only run when the scope succeeded. By default, actions below a scope run only on success, so no extra configuration is needed here.

#### Action 4: Handle Write Failure

32. Click **+ Add an action** below `Mark Write Success`
33. Add **Set variable**, rename to: `Handle Write Failure - Success`
34. **Name:** `varSuccess` — **Value:** `false`

35. **Configure run after:** Click the **three dots (…)** → **Configure run after** → uncheck **is successful** → check **has failed** and **has timed out** → click **Done**

36. Add another **Set variable** below it, rename to: `Handle Write Failure - Message`
37. **Name:** `varMessage` — **Value:** click **Expression** tab, paste:

```
if(greater(variables('varPaymentID'), 0), concat('Payment record #', string(variables('varPaymentID')), ' was created, but a later update failed. Check the payment, plates, and request manually in SharePoint.'), 'Failed to save the payment record. Nothing was written. Try again.')
```

38. **Configure run after** on this action too: uncheck **is successful** → check **has failed** and **has timed out** → click **Done**

> **Important:** These two actions only execute when the scope fails. If `varPaymentID` is greater than 0, it means the payment record was created before the failure — staff needs to know this so they can check SharePoint rather than blindly retrying.

**If no (varSuccess was false) in `Gate: Write Data`:** Leave the **No** branch empty.

---

## Step 7: Return Result

**What this does:** Sends the final result back to the Power App. This is the only Respond action in the flow, and it always executes regardless of what happened above.

#### Action 1: Return Result

1. Click **+ Add an action** below `Gate: Write Data` (after all branches rejoin — this should be at the top level of the flow, not inside any condition)
2. Search for and select **Respond to a PowerApp or flow**
3. Rename to: `Return Result`
4. Click **+ Add an output** → **Text**
5. **Title:** `Success`
6. **Value:** click **Expression** tab: `string(variables('varSuccess'))`

7. Click **+ Add an output** → **Text**
8. **Title:** `Message`
9. **Value:** select variable `varMessage`

10. Click **+ Add an output** → **Text**
11. **Title:** `PaymentID`
12. **Value:** click **Expression** tab: `string(variables('varPaymentID'))`

> **Important:** All three outputs are returned as text strings. In Power Apps, the returned properties are lowercase: `success`, `message`, `paymentid`.

---

## Expected Result

A successful flow run should:

- Create exactly one row in the `Payments` list with the correct transaction details, amount, plate snapshot, and `RecordedAt` timestamp
- Mark each specified plate as `Picked Up` in `BuildPlates`
- Update the parent `PrintRequests` record with new `FinalWeight`, `FinalCost`, `Status`, `StaffNotes`, `PaymentNotes`, and audit fields
- Return `Success = "true"` and `PaymentID` = the new row's ID

A failed flow run should:

- Return `Success = "false"` with a clear error message
- If the failure was during validation (before any writes), no data was changed
- If the failure was after the payment record was created, the message includes the payment ID so staff can investigate

---

## Testing

### Test 1: Normal Single Payment With Plates

1. Run the flow with valid inputs for a Completed request that has build plates
2. Confirm a new `Payments` row exists with correct values
3. Confirm the specified plates are now `Picked Up`
4. Confirm the `PrintRequests` record shows updated `FinalWeight`, `FinalCost`, and `Status = Paid & Picked Up`
5. Confirm the flow returns `Success = "true"`

### Test 2: Single Payment Without Plates

1. Use a request that has no build plates
2. Confirm the payment record is created
3. Confirm `PrintRequests.Status` becomes `Paid & Picked Up` (since there are no plates to gate on)
4. Confirm the flow returns `Success = "true"`

### Test 3: Partial Pickup

1. Set `IsPartialPickup = true` and select only some plates
2. Confirm the payment record is created
3. Confirm only the specified plates change to `Picked Up`
4. Confirm `PrintRequests.Status` stays at its current value (not `Paid & Picked Up`)
5. Confirm the flow returns `Success = "true"`

### Test 4: Duplicate Transaction Number

1. Use a transaction number that already exists in `Payments`
2. Confirm the flow returns `Success = "false"` with a message about the duplicate
3. Confirm no new `Payments` row was created

### Test 5: Request No Longer Eligible

1. Change the request status to `Paid & Picked Up` directly in SharePoint before running the flow
2. Confirm the flow returns `Success = "false"` with a message about eligibility
3. Confirm no data was changed

### Test 6: TigerCard Number as Transaction

1. Set `PaymentType = "TigerCASH"` and `TransactionNumber` to a 16-digit number
2. Confirm the flow returns `Success = "false"` with the TigerCard warning
3. Confirm no data was changed

### Test 7: Blank Transaction Number

1. Leave `TransactionNumber` blank (simulating a grant payment without a code yet)
2. Confirm the flow creates the payment record with `TransactionNumber` blank
3. Confirm the flow returns `Success = "true"`

---

## Related Documents

- `SharePoint/Payments-List-Setup.md`
- `SharePoint/BuildPlates-List-Setup.md`
- `SharePoint/PrintRequests-List-Setup.md`
- `PowerApps/StaffDashboard-App-Spec.md`
- `PowerAutomate/Flow-(C)-Action-LogAction.md`
- `PowerAutomate/Flow-(I)-Payment-SaveBatch.md`
- `Debug/Payment-BatchPayment-Fragility-Review.md`

---

*Created: March 31, 2026*
