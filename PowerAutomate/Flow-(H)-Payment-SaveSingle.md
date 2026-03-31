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
├── Step 2: Validate Transaction Number              ── no loops, runs once
│   ├── Is TigerCard Number? (Condition)
│   │   └── True → Set varSuccess = false
│   └── Gate (Condition: varSuccess = true)
│       └── True → Has Transaction Number? (Condition)
│           └── True → Get Items: Check Existing Transaction
│               └── Is Duplicate? (Condition)
│                   └── True → Set varSuccess = false
│
├── Step 3: Load and Validate Request                 ── no loops, runs once
│   └── Gate (Condition: varSuccess = true)
│       └── True → Get Items: Get Current Request
│           └── Request Invalid? (Condition)
│               └── True → Set varSuccess = false
│
├── Step 4: Load Build Plates                         ── no loops, runs once
│   └── Gate (Condition: varSuccess = true)
│       └── True → Get Items: Get Request Plates
│           └── Filter Array: Count Already Picked Up
│
├── Step 5: Prepare Calculated Values                 ── no loops, runs once
│   └── Gate (Condition: varSuccess = true)
│       └── True → Compose: BaseCost, FinalCost, StaffShortName,
│                  ResultStatus, NewFinalWeight, NewFinalCost,
│                  NewPaymentDate, NewStaffNotes, NewPaymentNotes
│
├── Step 6: Write Payment Data                        ── HAS A LOOP (see below)
│   └── Gate (Condition: varSuccess = true)
│       └── True → Scope: Write All Records
│           ├── Create Item (Payments)                    ── not in loop, runs once
│           ├── Set varPaymentID                          ── not in loop, runs once
│           ├── Has Plates? (Condition)                   ── not in loop, runs once
│           │   └── True → Apply to Each (LOOP)           ── LOOP STARTS HERE
│           │       └── Update Item (BuildPlates)         ── IN LOOP, runs per plate
│           └── Update Item (PrintRequests)               ── not in loop, runs once
│       ├── [scope succeeded] → Set varMessage = success  ── outside scope
│       └── [scope failed] → Set varSuccess = false       ── outside scope
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

> **No loops in this step.** All actions are conditions that run once. The nesting here is conditions inside conditions (a gate wrapping a uniqueness check), but nothing repeats.

#### Action 1: Is TigerCard Number

**Where to add this:** Below `Initialize varPaymentID`, at the top level of the flow.

1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename to: `Is TigerCard Number`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
and(equals(triggerBody()['text_1'], 'TigerCASH'), equals(length(trim(coalesce(triggerBody()['text'], ''))), 16), isFloat(trim(coalesce(triggerBody()['text'], ''))))
```

5. Set the **Operator** to: `is equal to`
6. Set the **Right side** to: `true`

---

#### Action 2: Mark TigerCard Failure

**Where to add this:** Inside the **True** branch of `Is TigerCard Number`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Set variable**
3. Rename to: `Mark TigerCard Failure`
4. **Name:** `varSuccess`
5. **Value:** `false`

---

#### Action 3: Set TigerCard Error

**Where to add this:** Below `Mark TigerCard Failure`, still inside the **True** branch of `Is TigerCard Number`.

1. Click **+ Add an action** below `Mark TigerCard Failure`
2. Search for and select **Set variable**
3. Rename to: `Set TigerCard Error`
4. **Name:** `varMessage`
5. **Value:** `That looks like a TigerCard number. Please enter the receipt or approval number instead.`

Leave the **False** branch of `Is TigerCard Number` empty.

---

#### Action 4: Gate: Check Uniqueness

**Where to add this:** Below `Is TigerCard Number`, after both branches rejoin. This is back at the top level of the flow.

1. Click **+ Add an action** below `Is TigerCard Number`
2. Search for and select **Condition**
3. Rename to: `Gate: Check Uniqueness`
4. Set the condition: variable `varSuccess` **is equal to** `true`

---

#### Action 5: Has Transaction Number

**Where to add this:** Inside the **True** branch of `Gate: Check Uniqueness`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Condition**
3. Rename to: `Has Transaction Number`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(trim(coalesce(triggerBody()['text'], '')))
```

5. Set the **Operator** to: `is greater than`
6. Set the **Right side** to: `0`

---

#### Action 6: Check Existing Transaction

**Where to add this:** Inside the **True** branch of `Has Transaction Number`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Get items** (SharePoint)
3. Rename to: `Check Existing Transaction`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `Payments`
   - **Filter Query:** click **Expression** tab, paste:

```
concat('TransactionNumber eq ''', trim(triggerBody()['text']), '''')
```

   - **Top Count:** `1`

5. **Configure retry policy** on this action (see Retry Policy section above).

---

#### Action 7: Is Duplicate Transaction

**Where to add this:** Below `Check Existing Transaction`, still inside the **True** branch of `Has Transaction Number`.

1. Click **+ Add an action** below `Check Existing Transaction`
2. Search for and select **Condition**
3. Rename to: `Is Duplicate Transaction`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(body('Check_Existing_Transaction')?['value'])
```

5. Set the **Operator** to: `is greater than`
6. Set the **Right side** to: `0`

---

#### Action 8: Mark Duplicate Failure

**Where to add this:** Inside the **True** branch of `Is Duplicate Transaction`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Set variable**
3. Rename to: `Mark Duplicate Failure`
4. **Name:** `varSuccess`
5. **Value:** `false`

---

#### Action 9: Set Duplicate Error

**Where to add this:** Below `Mark Duplicate Failure`, still inside the **True** branch of `Is Duplicate Transaction`.

1. Click **+ Add an action** below `Mark Duplicate Failure`
2. Search for and select **Set variable**
3. Rename to: `Set Duplicate Error`
4. **Name:** `varMessage`
5. **Value:** click **Expression** tab, paste:

```
concat('Transaction number ''', trim(triggerBody()['text']), ''' already exists. Use a unique number.')
```

---

Leave the **False** branch of `Is Duplicate Transaction` empty.

Leave the **False** branch of `Has Transaction Number` empty. Blank transaction numbers are allowed.

Leave the **False** branch of `Gate: Check Uniqueness` empty.

> **Important:** This uniqueness check is fully delegable against the SharePoint list. It replaces the app's old `Filter(colAllPayments, ...)` check, which was limited by the non-delegable row cap and could miss older duplicates once the `Payments` list grew large.

---

## Step 3: Load and Validate Request

**What this does:** Loads the current request from SharePoint using fresh data and verifies it is still in a status that allows payment.

> **No loops in this step.** A gate condition wraps a Get Items call and a validation check. Everything runs once.

#### Action 1: Gate: Load Request

**Where to add this:** Below `Gate: Check Uniqueness` (after all branches rejoin), back at the top level of the flow.

1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename to: `Gate: Load Request`
4. Set the condition: variable `varSuccess` **is equal to** `true`

---

#### Action 2: Get Current Request

**Where to add this:** Inside the **True** branch of `Gate: Load Request`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Get items** (SharePoint)
3. Rename to: `Get Current Request`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Filter Query:** click **Expression** tab, paste:

```
concat('ID eq ', triggerBody()['number'])
```

   - **Top Count:** `1`

5. **Configure retry policy.**

---

#### Action 3: Is Request Valid

**Where to add this:** Below `Get Current Request`, still inside the **True** branch of `Gate: Load Request`.

1. Click **+ Add an action** below `Get Current Request`
2. Search for and select **Condition**
3. Rename to: `Is Request Valid`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
if(and(greater(length(body('Get_Current_Request')?['value']), 0), or(equals(first(body('Get_Current_Request')?['value'])?['Status']?['Value'], 'Completed'), equals(first(body('Get_Current_Request')?['value'])?['Status']?['Value'], 'Printing'))), true, false)
```

5. Set the **Operator** to: `is equal to`
6. Set the **Right side** to: `true`

Leave the **True** branch of `Is Request Valid` empty (the request is valid — the flow continues below).

---

#### Action 4: Mark Request Invalid

**Where to add this:** Inside the **False** branch of `Is Request Valid`.

1. Click **+ Add an action** inside the **False** branch
2. Search for and select **Set variable**
3. Rename to: `Mark Request Invalid`
4. **Name:** `varSuccess`
5. **Value:** `false`

---

#### Action 5: Set Request Error

**Where to add this:** Below `Mark Request Invalid`, still inside the **False** branch of `Is Request Valid`.

1. Click **+ Add an action** below `Mark Request Invalid`
2. Search for and select **Set variable**
3. Rename to: `Set Request Error`
4. **Name:** `varMessage`
5. **Value:** `This request is no longer eligible for payment. It may have been processed by another staff member.`

---

Leave the **False** branch of `Gate: Load Request` empty.

---

## Step 4: Load Build Plates

**What this does:** Loads the request's build plates so the flow can count plate states and determine whether the request should be closed after payment.

> **No loops in this step.** Get Items returns all plates at once, and Filter Array processes the list in a single operation — neither is a loop.

#### Action 1: Gate: Load Plates

**Where to add this:** Below `Gate: Load Request` (after all branches rejoin), back at the top level of the flow.

1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename to: `Gate: Load Plates`
4. Set the condition: variable `varSuccess` **is equal to** `true`

---

#### Action 2: Get Request Plates

**Where to add this:** Inside the **True** branch of `Gate: Load Plates`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Get items** (SharePoint)
3. Rename to: `Get Request Plates`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `BuildPlates`
   - **Filter Query:** click **Expression** tab, paste:

```
concat('RequestID eq ', triggerBody()['number'])
```

   - **Order By:** `ID asc`
   - **Top Count:** `500`

5. **Configure retry policy.**

---

#### Action 3: Already Picked Up Plates

**Where to add this:** Below `Get Request Plates`, still inside the **True** branch of `Gate: Load Plates`.

1. Click **+ Add an action** below `Get Request Plates`
2. Search for and select **Filter array**
3. Rename to: `Already Picked Up Plates`
4. **From:** select the `value` output from `Get Request Plates`
5. Click the left side of the filter condition, switch to the **Expression** tab, and paste:

```
item()?['Status']?['Value']
```

6. Set the **Operator** to: `is equal to`
7. Set the **Right side** to: `Picked Up`

---

Leave the **False** branch of `Gate: Load Plates` empty.

---

## Step 5: Prepare Calculated Values

**What this does:** Calculates the payment amount, the staff short name, the new running totals, and the result status — all stored in Compose actions so the write step can reference them.

> **No loops in this step.** All twelve Compose actions run once, sequentially, inside a single gate condition.
>
> Actions 2–12 below are all inside the **True** branch of `Gate: Calculate`. Each one goes directly below the previous one.

#### Action 1: Gate: Calculate

**Where to add this:** Below `Gate: Load Plates` (after all branches rejoin), back at the top level of the flow.

1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename to: `Gate: Calculate`
4. Set the condition: variable `varSuccess` **is equal to** `true`

---

#### Action 2: BaseCost

**Where to add this:** Inside the **True** branch of `Gate: Calculate`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Compose**
3. Rename to: `BaseCost`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
max(triggerBody()['number_4'], mul(triggerBody()['number_1'], if(equals(first(body('Get_Current_Request')?['value'])?['Method']?['Value'], 'Resin'), triggerBody()['number_3'], triggerBody()['number_2'])))
```

> **What this calculates:** `Max(MinimumCost, Weight × rate)`. The rate depends on the request's print method (resin or filament).

---

#### Action 3: FinalCost

**Where to add this:** Below `BaseCost`.

1. Click **+ Add an action** below `BaseCost`
2. Search for and select **Compose**
3. Rename to: `FinalCost`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(triggerBody()['boolean'], mul(outputs('BaseCost'), triggerBody()['number_5']), outputs('BaseCost'))
```

> **What this calculates:** If `StudentOwnMaterial` is true, multiplies by the discount factor. Otherwise uses the base cost unchanged.

---

#### Action 4: StaffShortName

**Where to add this:** Below `FinalCost`.

1. Click **+ Add an action** below `FinalCost`
2. Search for and select **Compose**
3. Rename to: `StaffShortName`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
concat(first(split(triggerBody()['text_5'], ' ')), ' ', substring(last(split(triggerBody()['text_5'], ' ')), 0, 1), '.')
```

> **What this produces:** `"John S."` from `"John Smith"`.

---

#### Action 5: BeingPickedUpCount

**Where to add this:** Below `StaffShortName`.

1. Click **+ Add an action** below `StaffShortName`
2. Search for and select **Compose**
3. Rename to: `BeingPickedUpCount`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(empty(trim(coalesce(triggerBody()['text_6'], ''))), 0, length(split(replace(triggerBody()['text_6'], ' ', ''), ',')))
```

> **What this counts:** The number of plate IDs the app sent for pickup. Returns `0` if PickedPlateIDs is blank.

---

#### Action 6: ResultStatus

**Where to add this:** Below `BeingPickedUpCount`.

1. Click **+ Add an action** below `BeingPickedUpCount`
2. Search for and select **Compose**
3. Rename to: `ResultStatus`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(or(triggerBody()['boolean_1'], equals(first(body('Get_Current_Request')?['value'])?['Status']?['Value'], 'Printing')), first(body('Get_Current_Request')?['value'])?['Status']?['Value'], if(or(equals(length(body('Get_Request_Plates')?['value']), 0), greaterOrEquals(add(length(body('Already_Picked_Up_Plates')), outputs('BeingPickedUpCount')), length(body('Get_Request_Plates')?['value']))), 'Paid & Picked Up', first(body('Get_Current_Request')?['value'])?['Status']?['Value']))
```

> **What this determines:**
> - If `IsPartialPickup` is true or request is still `Printing` → keep the current status.
> - If the request has no plates, or all plates will be `Picked Up` after this transaction → `Paid & Picked Up`.
> - Otherwise → keep the current status.

---

#### Action 7: NewFinalWeight

**Where to add this:** Below `ResultStatus`.

1. Click **+ Add an action** below `ResultStatus`
2. Search for and select **Compose**
3. Rename to: `NewFinalWeight`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
add(coalesce(first(body('Get_Current_Request')?['value'])?['FinalWeight'], 0), triggerBody()['number_1'])
```

> **What this calculates:** Adds the new weight to the request's current `FinalWeight`. This is a delta approach — it assumes the existing `FinalWeight` is correct from prior saves.

---

#### Action 8: NewFinalCost

**Where to add this:** Below `NewFinalWeight`.

1. Click **+ Add an action** below `NewFinalWeight`
2. Search for and select **Compose**
3. Rename to: `NewFinalCost`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
add(coalesce(first(body('Get_Current_Request')?['value'])?['FinalCost'], 0), outputs('FinalCost'))
```

---

#### Action 9: NewPaymentDate

**Where to add this:** Below `NewFinalCost`.

1. Click **+ Add an action** below `NewFinalCost`
2. Search for and select **Compose**
3. Rename to: `NewPaymentDate`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(and(not(empty(first(body('Get_Current_Request')?['value'])?['PaymentDate'])), greater(ticks(first(body('Get_Current_Request')?['value'])?['PaymentDate']), ticks(triggerBody()['date']))), first(body('Get_Current_Request')?['value'])?['PaymentDate'], triggerBody()['date'])
```

> **What this calculates:** The later of the current `PaymentDate` and the new payment date.

---

#### Action 10: SanitizedNotes

**Where to add this:** Below `NewPaymentDate`.

1. Click **+ Add an action** below `NewPaymentDate`
2. Search for and select **Compose**
3. Rename to: `SanitizedNotes`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
replace(replace(replace(replace(replace(replace(replace(coalesce(triggerBody()['text_9'], ''), ' | ', '; '), ' ~~ ', '; '), '[Summary]', '(Summary)'), '[Changes]', '(Changes)'), '[Reason]', '(Reason)'), '[Context]', '(Context)'), '[Comment]', '(Comment)')
```

> **What this does:** Replaces delimiter characters in the staff notes so they don't break the structured `StaffNotes` format.

---

#### Action 11: NewStaffNotes

**Where to add this:** Below `SanitizedNotes`.

1. Click **+ Add an action** below `SanitizedNotes`
2. Search for and select **Compose**
3. Rename to: `NewStaffNotes`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
concat(if(empty(coalesce(first(body('Get_Current_Request')?['value'])?['StaffNotes'], '')), '', concat(first(body('Get_Current_Request')?['value'])?['StaffNotes'], ' | ')), 'PAID by ', outputs('StaffShortName'), ': [Summary] $', formatNumber(outputs('FinalCost'), '0.00'), ' for ', string(triggerBody()['number_1']), 'g [Changes] [Reason] [Context] [Comment] ', outputs('SanitizedNotes'), ' - ', formatDateTime(utcNow(), 'M/d h:mmtt'))
```

> **What this builds:** Appends a `PAID by ...` entry to the existing `StaffNotes`, using the same `[Summary] [Changes] [Reason] [Context] [Comment]` format the app uses.

---

#### Action 12: NewPaymentNotes

**Where to add this:** Below `NewStaffNotes`.

1. Click **+ Add an action** below `NewStaffNotes`
2. Search for and select **Compose**
3. Rename to: `NewPaymentNotes`
4. Click the **Inputs** field, switch to the **Expression** tab, and paste:

```
if(empty(trim(coalesce(triggerBody()['text_9'], ''))), coalesce(first(body('Get_Current_Request')?['value'])?['PaymentNotes'], ''), concat(if(empty(coalesce(first(body('Get_Current_Request')?['value'])?['PaymentNotes'], '')), '', concat(first(body('Get_Current_Request')?['value'])?['PaymentNotes'], ' | ')), 'PAYMENT NOTE by ', triggerBody()['text_5'], ': ', triggerBody()['text_9']))
```

> **What this does:** If the staff entered payment notes, appends them to existing `PaymentNotes`. If not, keeps the current value unchanged.

---

Leave the **False** branch of `Gate: Calculate` empty.

---

## Step 6: Write Payment Data

**What this does:** Creates the payment record, updates plate statuses, and patches the parent request. All three writes live inside a Scope so the flow can catch any failure as a group.

> **This step has a scope and a loop.** Here is what runs where:
>
> | Actions | Container | Runs |
> |---------|-----------|------|
> | 2a (Create Payment Record), 2b (Set varPaymentID), 2c (Has Plates condition), 2e (Update Parent Request) | Inside the `Write All Records` scope | Once |
> | 2d (Update Each Plate) → 2d-inner (Update Plate Status) | Inside the scope **and** inside an `Apply to Each` loop | Once **per plate** |
> | 3 (Mark Write Success), 4a–4b (Handle Write Failure) | Outside the scope (but still inside the gate's True branch) | Once |

#### Action 1: Gate: Write Data

**Where to add this:** Below `Gate: Calculate` (after all branches rejoin), back at the top level of the flow.

1. Click **+ Add an action**
2. Search for and select **Condition**
3. Rename to: `Gate: Write Data`
4. Set the condition: variable `varSuccess` **is equal to** `true`

---

#### Action 2: Write All Records (Scope)

> *In scope, not in a loop — runs once.*

**Where to add this:** Inside the **True** branch of `Gate: Write Data`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Scope**
3. Rename to: `Write All Records`

---

#### Action 2a: Create Payment Record

> *Inside the scope. Not in a loop — runs once.*

**Where to add this:** Inside the `Write All Records` scope.

1. Click **+ Add an action** inside the scope
2. Search for and select **Create item** (SharePoint)
3. Rename to: `Create Payment Record`
4. Fill in — use this **same order** as the action’s Parameters list in the designer (primary fields first, then **Show advanced options** in the same sequence):

   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `Payments`
   - **Amount:** select **Expression** tab: `outputs('FinalCost')`
   - **PaymentDate:** select the `PaymentDate` input from trigger: `triggerBody()['date']`
   - **RecordedAt:** select **Expression** tab: `utcNow()`
   - **Weight:** select **Expression** tab: `triggerBody()['number_1']`
   - **RequestID:** select **Expression** tab: `triggerBody()['number']`
   - **TransactionNumber:** select **Expression** tab: `if(empty(trim(coalesce(triggerBody()['text'], ''))), null, trim(triggerBody()['text']))`
   - **PayerName:** select **Expression** tab: `triggerBody()['text_2']`
   - **PaymentType Value:** select the `PaymentType` input from trigger (or enter expression): `triggerBody()['text_1']`
   - **PayerTigerCard:** select **Expression** tab: `triggerBody()['text_3']`
   - **PlatesPickedUp:** select **Expression** tab: `coalesce(triggerBody()['text_7'], '')`
   - **PlateIDsPickedUp:** select **Expression** tab: `coalesce(triggerBody()['text_8'], '')`
   - **RecordedBy Claims:** select **Expression** tab: `concat('i:0#.f|membership|', triggerBody()['text_4'])`
   - **StudentOwnMaterial:** select the `StudentOwnMaterial` input from trigger: `triggerBody()['boolean']`
   - **BatchReqKeys:** leave blank (single-request payment; not a consolidated batch row)
   - **BatchRequestIDs:** leave blank (single-request payment)
   - **BatchAllocationSummary:** leave blank (single-request payment)
   - **ReqKey:** select **Expression** tab: `first(body('Get_Current_Request')?['value'])?['ReqKey']`

   > **Optional designer-only fields** (if shown): **Limit Columns by View** — use all columns; **Title** — leave blank; **Content type Id** — leave at default.

5. **Configure retry policy.**

> **Important:** This is the most critical write. It creates the canonical finance ledger row. If this action fails, the scope stops immediately and no plates or requests are touched.

---

#### Action 2b: Set varPaymentID

> *Inside the scope. Not in a loop — runs once.*

**Where to add this:** Below `Create Payment Record`, still inside the `Write All Records` scope.

1. Click **+ Add an action** below `Create Payment Record`
2. Search for and select **Set variable**
3. Rename to: `Set varPaymentID`
4. **Name:** `varPaymentID`
5. **Value:** select **Expression** tab: `body('Create_Payment_Record')?['ID']`

---

#### Action 2c: Has Plates to Update

> *Inside the scope. Not in a loop — this condition runs once.*

**Where to add this:** Below `Set varPaymentID`, still inside the `Write All Records` scope.

1. Click **+ Add an action** below `Set varPaymentID`
2. Search for and select **Condition**
3. Rename to: `Has Plates to Update`
4. Click the left side of the condition, switch to the **Expression** tab, and paste:

```
length(trim(coalesce(triggerBody()['text_6'], '')))
```

5. Set the **Operator** to: `is greater than`
6. Set the **Right side** to: `0`

---

#### Action 2d: Update Each Plate (Apply to Each)

> *Inside the scope. This is the LOOP — everything inside it repeats once per plate ID.*

**Where to add this:** Inside the **True** branch of `Has Plates to Update`.

1. Click **+ Add an action** inside the **True** branch
2. Search for and select **Apply to each**
3. Rename to: `Update Each Plate`
4. In **Select an output from previous steps**, click the **Expression** tab and paste:

```
split(replace(triggerBody()['text_6'], ' ', ''), ',')
```

---

#### Action 2d-inner: Update Plate Status

> *Inside the loop — this action repeats for each plate.*

**Where to add this:** Inside the `Update Each Plate` loop.

1. Click **+ Add an action** inside the `Update Each Plate` loop
2. Search for and select **Get item** (SharePoint)
3. Rename to: `Get Current Plate`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `BuildPlates`
   - **Id:** click **Expression** tab: `int(items('Update_Each_Plate'))`
5. **Configure retry policy** on `Get Current Plate`.


6. Click **+ Add an action** below `Get Current Plate`
7. Search for and select **Update item** (SharePoint)
8. Rename to: `Update Plate Status`
9. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `BuildPlates`
   - **Id:** click **Expression** tab: `int(items('Update_Each_Plate'))`
   - **RequestID:** click **Expression** tab: `body('Get_Current_Plate')?['RequestID']`
   - **PlateKey:** click **Expression** tab: `body('Get_Current_Plate')?['PlateKey']`
   - **Machine Value:** click **Expression** tab: `body('Get_Current_Plate')?['Machine']?['Value']`
   - **Title:** click **Expression** tab: `body('Get_Current_Plate')?['Title']`
   - **Status Value:** `Picked Up`

10. **Configure retry policy** on `Update Plate Status`.

Leave the **False** branch of `Has Plates to Update` empty (no plates to update).

---

#### Action 2e: Update Parent Request

> *Inside the scope, but NOT in the loop — runs once, after all plates have been updated.*

**Where to add this:** Below the `Has Plates to Update` condition (after both branches rejoin), still inside the `Write All Records` scope.

1. Click **+ Add an action** below `Has Plates to Update`
2. Search for and select **Update item** (SharePoint)
3. Rename to: `Update Parent Request`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** click **Expression** tab: `triggerBody()['number']`
   - **TigerCardNumber:** click **Expression** tab: `first(body('Get_Current_Request')?['value'])?['TigerCardNumber']`
   - **StudentConfirmed:** click **Expression** tab: `first(body('Get_Current_Request')?['value'])?['StudentConfirmed']`
   - **Status Value:** click **Expression** tab: `outputs('ResultStatus')`
   - **StudentOwnMaterial:** click **Expression** tab: `or(equals(first(body('Get_Current_Request')?['value'])?['StudentOwnMaterial'], true), triggerBody()['boolean'])`
   - **NeedsAttention:** click **Expression** tab: `first(body('Get_Current_Request')?['value'])?['NeedsAttention']`
   - **PaymentType Value:** click **Expression** tab: `triggerBody()['text_1']`
   - **BuildPlateLabelsLocked:** click **Expression** tab: `first(body('Get_Current_Request')?['value'])?['BuildPlateLabelsLocked']`
   - **BuildPlateOriginalTotal:** click **Expression** tab: `coalesce(first(body('Get_Current_Request')?['value'])?['BuildPlateOriginalTotal'], 0)`
   - **FinalWeight:** click **Expression** tab: `outputs('NewFinalWeight')`
   - **FinalCost:** click **Expression** tab: `outputs('NewFinalCost')`
   - **PaymentDate:** click **Expression** tab: `outputs('NewPaymentDate')`
   - **StaffNotes:** click **Expression** tab: `outputs('NewStaffNotes')`
   - **PaymentNotes:** click **Expression** tab: `outputs('NewPaymentNotes')`
   - **LastAction Value:** `Picked Up`
   - **LastActionBy Claims:** click **Expression** tab: `concat('i:0#.f|membership|', triggerBody()['text_4'])`
   - **LastActionAt:** click **Expression** tab: `utcNow()`

5. **Configure retry policy.**

> **Important:** This is the last action inside the scope. If everything above succeeded, this patches the parent request with updated totals, status, notes, and audit fields.

---

This is the end of the `Write All Records` scope. The next two actions go **below** the scope but are still inside the **True** branch of `Gate: Write Data`.

---

#### Action 3: Mark Write Success

> *Outside the scope, not in a loop — runs once.*

**Where to add this:** Below the `Write All Records` scope, still inside the **True** branch of `Gate: Write Data`.

1. Click **+ Add an action** below the `Write All Records` scope
2. Search for and select **Set variable**
3. Rename to: `Mark Write Success`
4. **Name:** `varMessage`
5. **Value:** `Payment saved.`

> **Important:** This action should only run when the scope succeeded. By default, actions below a scope run only on success, so no extra configuration is needed here.

---

#### Action 4a: Handle Write Failure — Success

> *Outside the scope, not in a loop — runs once. Only executes when the scope fails.*

**Where to add this:** Below `Mark Write Success`, still inside the **True** branch of `Gate: Write Data`.

1. Click **+ Add an action** below `Mark Write Success`
2. Search for and select **Set variable**
3. Rename to: `Handle Write Failure - Success`
4. **Name:** `varSuccess`
5. **Value:** `false`
6. **Configure run after:** Click the **three dots (…)** on the action card → **Configure run after** → uncheck **is successful** → check **has failed** and **has timed out** → click **Done**

---

#### Action 4b: Handle Write Failure — Message

> *Same location as Action 4a. Only executes when the scope fails.*

**Where to add this:** Below `Handle Write Failure - Success`, still inside the **True** branch of `Gate: Write Data`.

1. Click **+ Add an action** below `Handle Write Failure - Success`
2. Search for and select **Set variable**
3. Rename to: `Handle Write Failure - Message`
4. **Name:** `varMessage`
5. **Value:** click **Expression** tab, paste:

```
if(greater(variables('varPaymentID'), 0), concat('Payment record #', string(variables('varPaymentID')), ' was created, but a later update failed. Check the payment, plates, and request manually in SharePoint.'), 'Failed to save the payment record. Nothing was written. Try again.')
```

6. **Configure run after:** Click the **three dots (…)** on the action card → **Configure run after** → uncheck **is successful** → check **has failed** and **has timed out** → click **Done**

> **Important:** Actions 4a and 4b only execute when the scope fails. If `varPaymentID` is greater than 0, it means the payment record was created before the failure — staff needs to know this so they can check SharePoint rather than blindly retrying.

---

Leave the **False** branch of `Gate: Write Data` empty.

---

## Step 7: Return Result

**What this does:** Sends the final result back to the Power App. This is the only Respond action in the flow, and it always executes regardless of what happened above.

> **No loops, no scope.** This action sits at the top level of the flow, outside all conditions. It runs exactly once every time.

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
