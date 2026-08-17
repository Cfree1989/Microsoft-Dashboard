# Flow J (PR-LabStatus)

**Full Name:** PR-LabStatus: Refresh queue snapshot  
**Type:** Scheduled cloud flow (Recurrence trigger)

**Purpose:** Every 15 minutes, count how many print jobs are waiting and printing (as staff, so every job is visible), then write those totals onto the single `LabStatus` row named `Current`. Students read that row in the Student Portal. They never see other people’s jobs.

---

## Quick Overview

This flow does **not** email anyone and does **not** change PrintRequests. It only updates one scoreboard row.

1. **Count** Ready to Print jobs (Filament and Resin separately)
2. **Count** Printing jobs (Filament and Resin separately)
3. **Add** those into `JobsWaiting` and `JobsPrinting`
4. **Pick a word:** Quiet / Typical / Busy / Packed from the waiting count
5. **Update** the `Current` row on `LabStatus`
6. **Leave alone:** hours, pickup location, typical-wait sentence, staff message, and (if override is on) the busy word

---

## Prerequisites

- [ ] `PrintRequests` SharePoint list exists with **Status** and **Method** choice columns (see `SharePoint/PrintRequests-List-Setup.md`)
- [ ] `LabStatus` SharePoint list exists with all columns (see `SharePoint/LabStatus-List-Setup.md`)
- [ ] The **one** LabStatus item is already created with **Title** = `Current`
- [ ] You are signed into Power Automate with an account that can **read all** PrintRequests (staff / owner — not a student account)
- [ ] Site: `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`

> ⚠️ **Wrong account = wrong counts.** If you build this flow while signed in as a student, Get items on PrintRequests will only see that student’s jobs. Always use a staff or owner connection.

---

## BusyLevel Rules

Flow J sets `BusyLevel` from **waiting** jobs only (`Status` = Ready to Print). Printing is a separate number on the card.

| JobsWaiting | BusyLevel |
|-------------|-----------|
| 0–5 | Quiet |
| 6–15 | Typical |
| 16–30 | Busy |
| 31 or more | Packed |

To change the bands later, edit the **Calculate BusyLevel** Compose expression in Step 5.

---

## Error Handling Configuration

**Configure retry policies on all SharePoint Get items / Update item actions:**
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

**ISO 8601 Duration Format Reference:**
| Duration | Format |
|----------|--------|
| 20 seconds | `PT20S` |
| 1 minute | `PT1M` |
| 1 hour | `PT1H` |

---

## Flow Structure Overview

> **IMPORTANT:** Read this section first. There are **no** Apply to each loops. If the designer adds a loop around Update item, you put the action in the wrong place.

```
Flow
├── Recurrence (every 15 minutes)
├── Get Waiting Filament
├── Get Waiting Resin
├── Get Printing Filament
├── Get Printing Resin
├── Count Waiting Filament
├── Count Waiting Resin
├── Count Printing Filament
├── Count Printing Resin
├── Count Waiting
├── Count Printing
├── Calculate BusyLevel
├── Get Current Row
├── Check Current Row Exists          ◄── Condition
│   ├── If YES (empty) → Terminate (fail)   “Create the Current row first”
│   └── If NO (row found)
│       ├── Compose BusyLevel To Save
│       └── Update Current Row
```

**Key rules:**
1. The four **Get items** actions query `PrintRequests`. They must use **Filter Query** so you do not pull the whole list.
2. Turn **Pagination** on (threshold 5000) on those four Get items actions. Default Get items only returns 100 rows.
3. **Get Current Row** is on `LabStatus`, not PrintRequests.
4. **Update Current Row** must copy StaffMessage / hours / pickup / wait text from the existing row so they are not wiped blank.

---

## Step-by-Step Implementation

### Step 1: Flow Creation Setup

**What this does:** Creates a scheduled flow that refreshes the snapshot during the day (and overnight, so Monday morning is not stale).

**UI steps:**
1. Go to **Power Automate** → **My flows**
2. **Create** → **Scheduled cloud flow**
3. **Flow name:** Type `PR-LabStatus: Refresh queue snapshot` (or `Flow-(J)-PR-LabStatus`
4. **Starting:** Pick today’s date
5. **Repeat every:** `15` `Minute`
6. Click **Create**

**After creation, configure the trigger:**
1. Click the **Recurrence** trigger card
2. Set:
   - **Interval:** `15`
   - **Frequency:** `Minute`
   - **Time zone:** `(UTC-06:00) Central Time (US & Canada)`

**Test Step 1:** Save → The flow appears in **My flows** with a clock icon. Do **not** turn it on until Step 8 passes a manual test.

---

### Step 2: Count the queue (four Get items)

**What this does:** Asks SharePoint for jobs in the two statuses students care about, split by method. Four small queries are easier to check than one giant list.

> 💡 **Choice fields in Filter Query:** Type `Status eq 'Ready to Print'` — **not** `Status/Value`. Flow F documents the same pattern.

**Configure retry + pagination on each of the four actions below** (do this as you create them):

**Retry:** three dots (**…**) → **Settings** → **Networking** → Exponential interval (`4` / `PT1M` / `PT20S` / `PT1H`) → **Done**

**Pagination:**
1. Three dots (**…**) → **Settings**
2. **Pagination:** On
3. **Threshold:** `5000`
4. Click **Done**

---

#### Action 1: Get Waiting Filament

1. Click **+ New step**
2. Search for **Get items** (SharePoint) → select it
3. Rename: three dots (**…**) → **Rename** → Type `Get Waiting Filament`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
5. Click **Show advanced options**
6. Fill in:
   - **Filter Query:**
```
Status eq 'Ready to Print' and Method eq 'Filament'
```
   - **Top Count:** `5000`

---

#### Action 2: Get Waiting Resin

1. Click **+ New step**
2. Search for **Get items** (SharePoint)
3. Rename to: `Get Waiting Resin`
4. Fill in the same **Site Address** and **List Name:** `PrintRequests`
5. **Show advanced options:**
   - **Filter Query:**
```
Status eq 'Ready to Print' and Method eq 'Resin'
```
   - **Top Count:** `5000`
6. Set retry + pagination (same as Action 1)

---

#### Action 3: Get Printing Filament

1. Click **+ New step**
2. Search for **Get items** (SharePoint)
3. Rename to: `Get Printing Filament`
4. Same site, list `PrintRequests`
5. **Filter Query:**
```
Status eq 'Printing' and Method eq 'Filament'
```
6. **Top Count:** `5000`
7. Set retry + pagination

---

#### Action 4: Get Printing Resin

1. Click **+ New step**
2. Search for **Get items** (SharePoint)
3. Rename to: `Get Printing Resin`
4. Same site, list `PrintRequests`
5. **Filter Query:**
```
Status eq 'Printing' and Method eq 'Resin'
```
6. **Top Count:** `5000`
7. Set retry + pagination

**Test Step 2:** **Save** → **Test** → **Manually** → **Run flow**. Open the run. Each Get items **OUTPUTS** → **body** → `value` is an array. The number of objects should match what you see in PrintRequests for that Status + Method.

> ⚠️ **If every Get items returns 0 but the staff dashboard is full:** the flow connection is a student account, or the Status/Method labels do not match (`Form 3` vs method `Resin` is fine — Status must be exactly `Ready to Print` and `Printing`).

---

### Step 3: Turn those lists into numbers

**What this does:** `length(...)` counts how many items SharePoint returned. Compose actions are easy to inspect in run history.

#### Action 1: Count Waiting Filament

1. Click **+ New step**
2. Search **Compose** → select it
3. Rename to: `Count Waiting Filament`
4. **Inputs** → **Expression** (fx) → paste → **OK**:
```
length(body('Get_Waiting_Filament')?['value'])
```

#### Action 2: Count Waiting Resin

1. Click **+ New step** → **Compose**
2. Rename to: `Count Waiting Resin`
3. Expression:
```
length(body('Get_Waiting_Resin')?['value'])
```

#### Action 3: Count Printing Filament

1. Click **+ New step** → **Compose**
2. Rename to: `Count Printing Filament`
3. Expression:
```
length(body('Get_Printing_Filament')?['value'])
```

#### Action 4: Count Printing Resin

1. Click **+ New step** → **Compose**
2. Rename to: `Count Printing Resin`
3. Expression:
```
length(body('Get_Printing_Resin')?['value'])
```

> 💡 **Underscores:** Power Automate turns action names into `Get_Waiting_Filament`. If you renamed the Get items action differently, pick it from **Dynamic content** instead of pasting.

**Test Step 3:** Run again. Each Compose output should be a whole number (`0`, `11`, `3`, …).

---

### Step 4: Add the totals

#### Action 1: Count Waiting

1. Click **+ New step** → **Compose**
2. Rename to: `Count Waiting`
3. Expression:
```
add(outputs('Count_Waiting_Filament'), outputs('Count_Waiting_Resin'))
```

#### Action 2: Count Printing

1. Click **+ New step** → **Compose**
2. Rename to: `Count Printing`
3. Expression:
```
add(outputs('Count_Printing_Filament'), outputs('Count_Printing_Resin'))
```

**Test Step 4:** `Count Waiting` should equal filament waiting + resin waiting. Same idea for printing.

---

### Step 5: Calculate BusyLevel

**What this does:** Turns the waiting total into one of the four words on the list.

1. Click **+ New step** → **Compose**
2. Rename to: `Calculate BusyLevel`
3. Expression:
```
if(lessOrEquals(int(outputs('Count_Waiting')), 5), 'Quiet', if(lessOrEquals(int(outputs('Count_Waiting')), 15), 'Typical', if(lessOrEquals(int(outputs('Count_Waiting')), 30), 'Busy', 'Packed')))
```

**Test Step 5:** If waiting is `14`, this Compose must output `Typical`. If `0`, `Quiet`. If `40`, `Packed`.

---

### Step 6: Get the Current LabStatus row

**What this does:** Finds the one scoreboard row so we can update it (and copy hours/message back so they are not erased).

1. Click **+ New step**
2. Search **Get items** (SharePoint)
3. Rename to: `Get Current Row`
4. Fill in:
   - **Site Address:** same site
   - **List Name:** `LabStatus`  ← not PrintRequests
5. **Show advanced options:**
   - **Filter Query:**
```
Title eq 'Current'
```
   - **Top Count:** `1`
6. Set retry policy (pagination optional; there should only be one row)

**Test Step 6:** Run. `value` should contain **one** item. If `value` is `[]`, you skipped creating the Current row in the list setup guide.

---

### Step 7: Fail clearly if the row is missing

**What this does:** Stops the flow with a readable error instead of updating nothing.

1. Click **+ New step**
2. Search **Condition** → select **Condition**
3. Rename to: `Check Current Row Exists`
4. Configure the condition:
   - Click the left box → **Expression**:
```
empty(body('Get_Current_Row')?['value'])
```
   - Middle dropdown: **is equal to**
   - Right box → **Expression**:
```
true
```

#### If YES (row missing) — left / green “If yes” side

1. Inside **If yes**, click **Add an action**
2. Search **Terminate**
3. Rename to: `Terminate Missing Current Row`
4. Fill in:
   - **Status:** `Failed`
   - **Code:** `LabStatusCurrentMissing`
   - **Message:** `LabStatus has no row with Title = Current. Create that row first (SharePoint/LabStatus-List-Setup.md Step 5).`

#### If NO (row found) — right / “If no” side

Leave this empty for a moment. **Steps 8 and 9 go inside If no.**

> ⚠️ **Common mistake:** Putting **Update item** after the Condition (as a sibling) instead of **inside If no**. Then the update runs even when the row is missing, or the designer wraps it in Apply to each.

**Test Step 7 (optional):** Temporarily rename the list item Title to `Temp`, run the flow, confirm it **Fails** with `LabStatusCurrentMissing`. Rename Title back to `Current`.

---

### Step 8: Decide which BusyLevel to save

**What this does:** If staff turned **ManualOverride** on, keep their word. Otherwise use the calculated word.

1. Click **inside If no** → **Add an action**
2. **Compose**
3. Rename to: `Compose BusyLevel To Save`
4. Expression:
```
if(equals(first(body('Get_Current_Row')?['value'])?['ManualOverride'], true), first(body('Get_Current_Row')?['value'])?['BusyLevel']?['Value'], outputs('Calculate_BusyLevel'))
```

> 💡 **Yes/No fields** come back as `true` / `false`. If override looks ignored, open the Get Current Row output and check that `ManualOverride` is actually `true` when the toggle is Yes.

---

### Step 9: Update the Current row

**What this does:** Writes the new counts and timestamp. **Copies** hours, pickup, wait text, staff message, and override from the existing row so Update item does not blank them.

1. Still **inside If no**, click **Add an action**
2. Search **Update item** (SharePoint)
3. Rename to: `Update Current Row`
4. Fill in:
   - **Site Address:** same site
   - **List Name:** `LabStatus`
   - **Id:** **Expression**:
```
first(body('Get_Current_Row')?['value'])?['ID']
```

5. Map the fields (use **Expression** where shown; do not leave required fields empty):

| Field on the form | What to enter |
|-------------------|---------------|
| Title | `Current` |
| BusyLevel | Dynamic content: **Compose BusyLevel To Save** (outputs) |
| JobsWaiting | Dynamic content: **Count Waiting** |
| JobsPrinting | Dynamic content: **Count Printing** |
| FilamentWaiting | Dynamic content: **Count Waiting Filament** |
| ResinWaiting | Dynamic content: **Count Waiting Resin** |
| FilamentPrinting | Dynamic content: **Count Printing Filament** |
| ResinPrinting | Dynamic content: **Count Printing Resin** |
| TypicalWaitText | Expression below |
| StaffMessage | Expression below |
| LabHours | Expression below |
| PickupLocation | Expression below |
| ManualOverride | Expression below |
| UpdatedAt | Expression below |

**TypicalWaitText** expression:
```
first(body('Get_Current_Row')?['value'])?['TypicalWaitText']
```

**StaffMessage** expression:
```
first(body('Get_Current_Row')?['value'])?['StaffMessage']
```

**LabHours** expression:
```
first(body('Get_Current_Row')?['value'])?['LabHours']
```

**PickupLocation** expression:
```
first(body('Get_Current_Row')?['value'])?['PickupLocation']
```

**ManualOverride** expression:
```
first(body('Get_Current_Row')?['value'])?['ManualOverride']
```

**UpdatedAt** expression:
```
utcNow()
```

6. Set retry policy on **Update Current Row** (same exponential values as Get items)

> ⚠️ **If you skip the copy-through expressions** and leave StaffMessage / LabHours empty on the Update item card, SharePoint may **wipe** the text staff typed. Always pass the existing values back.

> 💡 **BusyLevel** on Update item is a dropdown. If it will not accept Compose output, switch the field to **Enter custom value** and select **Compose BusyLevel To Save** from Dynamic content.

**Test Step 9:**
1. **Save**
2. **Test** → **Manually** → **Run flow**
3. Open **LabStatus** in SharePoint and refresh
4. Confirm:
   - [ ] `JobsWaiting` / `JobsPrinting` match a staff count in PrintRequests
   - [ ] `FilamentWaiting + ResinWaiting` = `JobsWaiting`
   - [ ] `BusyLevel` matches the table in this doc
   - [ ] `LabHours` and `PickupLocation` did **not** get cleared
   - [ ] `UpdatedAt` is within the last minute

---

### Step 10: Turn the schedule on

1. Open the flow
2. Click **Turn on** (if it is still off)
3. Wait 15 minutes **or** run **Test** again any time you want a fresh snapshot

> 💡 You do not need the Staff Dashboard open. Recurrence runs in the cloud.

---

## Manual Override (staff how-to)

When the word should **not** follow the count (closure, “we are slammed,” printers down):

1. Open **LabStatus** in SharePoint
2. Edit the **Current** row
3. Set **BusyLevel** to the word you want (for example `Packed`)
4. Optionally type **StaffMessage** (`Closed Friday — no new drop-offs`)
5. Set **ManualOverride** to **Yes**
6. Save

Next Flow J run: counts and `UpdatedAt` still refresh. **BusyLevel** and **StaffMessage** stay as you left them.

To return to automatic words: set **ManualOverride** back to **No**. The next run overwrites **BusyLevel** from the count. StaffMessage is still never auto-cleared — delete it yourself when it is stale.

---

## Verification Checklist

- [ ] Flow named `PR-LabStatus: Refresh queue snapshot` (or `Flow J (PR-LabStatus)`)
- [ ] Recurrence: every **15** minutes, Central Time
- [ ] Four PrintRequests Get items with Filter Query + pagination 5000 + retry
- [ ] LabStatus **Get Current Row** uses `Title eq 'Current'`
- [ ] Condition terminates if that row is missing
- [ ] Update item is **inside If no**, not inside an Apply to each
- [ ] Hours, pickup, wait text, staff message, and override are copied through
- [ ] Manual test run succeeded
- [ ] SharePoint Current row numbers match the live queue
- [ ] Flow is **On**

---

## Testing Guide (beginner)

Do these in order. Use a **staff** account.

### TEST J-001: Empty-ish queue

**Setup:** Note how many Ready to Print / Printing jobs exist (can be zero).

**Steps:**
1. Run the flow **Test → Manually**
2. Open LabStatus → Current

**Pass:**
- [ ] Run is **Succeeded**
- [ ] Counts match PrintRequests (staff view, all items)
- [ ] BusyLevel is Quiet if waiting ≤ 5

**Status:** [ ] PASS  [ ] FAIL

---

### TEST J-002: Math split

**Steps:**
1. In PrintRequests (staff), count Filament vs Resin for Ready to Print and for Printing
2. Compare to the four split columns

**Pass:**
- [ ] FilamentWaiting + ResinWaiting = JobsWaiting
- [ ] FilamentPrinting + ResinPrinting = JobsPrinting

**Status:** [ ] PASS  [ ] FAIL

---

### TEST J-003: Busy word bands

Pick any band and sanity-check (you do not need 31 fake jobs if production already has a real count):

| If JobsWaiting is | BusyLevel must be |
|-------------------|-------------------|
| 0–5 | Quiet |
| 6–15 | Typical |
| 16–30 | Busy |
| 31+ | Packed |

**Status:** [ ] PASS  [ ] FAIL

---

### TEST J-004: Do not wipe staff text

**Steps:**
1. Edit Current: StaffMessage = `TEST message — delete me`, LabHours unchanged
2. Run the flow
3. Refresh the row

**Pass:**
- [ ] StaffMessage still `TEST message — delete me`
- [ ] LabHours still `Mon–Fri 8:30 AM – 4:30 PM`
- [ ] Then delete the test message

**Status:** [ ] PASS  [ ] FAIL

---

### TEST J-005: Manual override

**Steps:**
1. Set BusyLevel to `Packed`, ManualOverride to **Yes** (even if the count is small)
2. Run the flow

**Pass:**
- [ ] Counts updated
- [ ] BusyLevel still `Packed`
3. Set ManualOverride back to **No**, run again
4. BusyLevel follows the count table again

**Status:** [ ] PASS  [ ] FAIL

---

### TEST J-006: Missing Current row (error path)

**Steps:**
1. Change Title from `Current` to `Temp`
2. Run the flow
3. Confirm **Failed** with `LabStatusCurrentMissing`
4. Change Title back to `Current`

**Status:** [ ] PASS  [ ] FAIL

---

### TEST J-007: Student cannot see other jobs

**Steps:**
1. Sign in as a student test account
2. Open LabStatus (or the Student Portal Home card, once built)

**Pass:**
- [ ] Student sees counts / busy word only
- [ ] Student cannot edit the row (or edit fails)
- [ ] Student still only sees their own PrintRequests

**Status:** [ ] PASS  [ ] FAIL

---

## Troubleshooting Guide

### Issue 1: All counts are 0 but the lab is busy

**Cause:** Flow connection is a student, or Filter Query does not match choice labels.

**Fix:**
1. Open the flow → **…** menu → **Connections** — use a staff owner
2. In PrintRequests, click a job and confirm Status is exactly `Ready to Print` or `Printing` (not `Ready To Print`)
3. Method must be exactly `Filament` or `Resin`

---

### Issue 2: Get items only counted 100 jobs

**Cause:** Pagination is off. SharePoint Get items defaults to 100.

**Fix:** Each of the four PrintRequests Get items → **…** → **Settings** → Pagination **On**, Threshold `5000`.

---

### Issue 3: Filter Query error “The query is not valid”

**Fix:**
1. Use `Status eq 'Ready to Print'` — **not** `Status/Value eq 'Ready to Print'`
2. Both Status and Method are Choice columns; keep the single quotes
3. Test in the browser (staff):
   ```
   https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/_api/web/lists/getbytitle('PrintRequests')/items?$filter=Status eq 'Ready to Print' and Method eq 'Filament'
   ```

---

### Issue 4: Hours or StaffMessage got wiped

**Cause:** Update item sent blank values for those columns.

**Fix:** Put the copy-through expressions from Step 9 back on TypicalWaitText, StaffMessage, LabHours, PickupLocation, and ManualOverride.

---

### Issue 5: Update item sits inside Apply to each

**Cause:** You picked **ID** from Get Current Row dynamic content (the list of items) instead of `first(... )?['ID']`.

**Fix:** Delete the loop. Use the **Expression** in Step 9 for **Id**. There is only one row; you do not need a loop.

---

### Issue 6: Students cannot see LabStatus

**Cause:** Item-level “only their own”, or students have no Read permission on the list.

**Fix:** Follow [LabStatus-List-Setup.md](../SharePoint/LabStatus-List-Setup.md) Step 2 and Step 4. The Current row is created by staff, so “only their own” hides it from students.

---

### Issue 7: BusyLevel does not change when override is off

**Cause:** `Compose BusyLevel To Save` still reads as override true, or Update item BusyLevel is still a fixed dropdown.

**Fix:**
1. Check Get Current Row output: `ManualOverride` should be `false`
2. On Update item, BusyLevel must use **Compose BusyLevel To Save**, not a hardcoded Quiet

---

## Maintenance Notes

### Change how often it runs

Recurrence **Interval** `15` → `30` (or `10`) if you want slower/faster updates. Home is not live-to-the-second either way.

### Change Quiet / Busy bands

Edit **Calculate BusyLevel** in Step 5. Keep the same four words that exist on the SharePoint choice column.

### This flow must not

- Patch PrintRequests
- Write student names onto LabStatus
- Email students
- Create extra LabStatus rows

---

## Next Steps

1. Confirm TEST J-001 through J-007
2. Add `LabStatus` as a data source in the Student Portal
3. Build the Home **Lab today** card using [StudentPortal-App-Spec.md](../PowerApps/StudentPortal-App-Spec.md)

---

## Related Documents

- [LabStatus list setup](../SharePoint/LabStatus-List-Setup.md)
- [PrintRequests list setup](../SharePoint/PrintRequests-List-Setup.md)
- [Flow F (PR-Cleanup)](./Flow-(F)-Cleanup-AuditRetention.md) — same recurrence + Filter Query style
- [Flow testing guide](./Flow-Testing-Guide.md)
