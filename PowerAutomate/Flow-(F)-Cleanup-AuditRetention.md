# Flow F (PR-Cleanup)

**Full Name:** PR-Cleanup: Audit retention  
**Type:** Scheduled cloud flow (Recurrence trigger)

**Purpose:** Automatically delete AuditLog entries for jobs that have been in terminal states (Rejected, Canceled, Archived) beyond their retention periods, keeping the AuditLog list performant while preserving audit trails for active and recent jobs.

---

## Retention Policy

| Status | Retention Period | Rationale |
|--------|------------------|-----------|
| Rejected | 1 month after rejection | Short disputes window; student can resubmit |
| Canceled | 1 month after cancellation | Student-initiated; minimal audit need |
| Archived | 12 months after archive | Longest retention for completed work |

**What is NOT deleted:**
- The PrintRequest records themselves (only AuditLog entries are removed)
- The `StaffNotes` field on PrintRequests (preserves human-readable action history)
- AuditLog entries for active jobs (any status not in the table above)

---

## Error Handling Configuration

**Configure retry policies on all SharePoint actions:**
- **Retry Policy Type:** Exponential interval
- **Apply to:** Get items, Delete item actions

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
| 30 seconds | `PT30S` |
| 1 minute | `PT1M` |
| 5 minutes | `PT5M` |
| 1 hour | `PT1H` |

---

## Step-by-Step Implementation

### Step 1: Flow Creation Setup

**What this does:** Creates a scheduled flow that runs weekly during low-activity hours.

**UI steps:**
1. Go to **Power Automate** → **My flows**
2. **Create** → **Scheduled cloud flow**
3. **Name:** Type `Flow F (PR-Cleanup)` or `PR-Cleanup: Audit retention`
4. **Configure schedule:**
   - **Start:** Select a date (e.g., next Sunday)
   - **Repeat every:** `1` `Week`
5. Click **Create**

**After creation, configure the trigger:**
1. Click on the **Recurrence** trigger card
2. Click **Edit** or expand the card
3. Set these values:
   - **Interval:** `1`
   - **Frequency:** `Week`
   - **Time zone:** `(UTC-06:00) Central Time (US & Canada)`
   - **On these days:** Check `Sunday`
   - **At these hours:** `3` (3 AM - low activity period)
   - **At these minutes:** `0`

**Test Step 1:** Save → Flow should appear in "My flows" with a clock icon and show "Runs weekly on Sunday at 3:00 AM"

---

### Step 2: Calculate Cutoff Dates

**What this does:** Calculates the date thresholds for each retention period. Items with `LastActionAt` before these dates are eligible for cleanup.

**UI steps:**

#### Action 1: Calculate 1-Month Cutoff
1. Click **+ New step**
2. **Search:** Type `Compose` → Select **Compose**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Calculate 1 Month Cutoff`
4. In **Inputs**, click **Expression** tab (fx) → Paste:
```
formatDateTime(addDays(utcNow(), -30), 'yyyy-MM-ddTHH:mm:ssZ')
```
5. Click **OK**

> **Why formatDateTime?** SharePoint OData filters reject timestamps with high-precision fractional seconds. This formats the date as `2026-01-10T20:25:50Z` instead of `2026-01-10T20:25:50.0337128Z`.

#### Action 2: Calculate 12-Month Cutoff
1. Click **+ New step**
2. **Search:** Type `Compose` → Select **Compose**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Calculate 12 Month Cutoff`
4. In **Inputs**, click **Expression** tab (fx) → Paste:
```
formatDateTime(addDays(utcNow(), -365), 'yyyy-MM-ddTHH:mm:ssZ')
```
5. Click **OK**

**Test Step 2:** Save → Run flow manually → Check run history → Both Compose actions should show ISO date strings

---

### Step 3: Initialize Counter Variables

**What this does:** Creates variables to track how many audit entries are deleted for the summary log.

**UI steps:**

#### Action 1: Initialize Rejected Counter
1. Click **+ New step**
2. **Search:** Type `Initialize variable` → Select **Initialize variable**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Initialize Rejected Counter`
4. Fill in:
   - **Name:** `RejectedCount`
   - **Type:** `Integer`
   - **Value:** `0`

#### Action 2: Initialize Canceled Counter
1. Click **+ New step**
2. **Search:** Type `Initialize variable` → Select **Initialize variable**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Initialize Canceled Counter`
4. Fill in:
   - **Name:** `CanceledCount`
   - **Type:** `Integer`
   - **Value:** `0`

#### Action 3: Initialize Archived Counter
1. Click **+ New step**
2. **Search:** Type `Initialize variable` → Select **Initialize variable**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Initialize Archived Counter`
4. Fill in:
   - **Name:** `ArchivedCount`
   - **Type:** `Integer`
   - **Value:** `0`

**Test Step 3:** Save → Variables should appear in Dynamic content for later steps

---

### Step 4: Get Eligible PrintRequests

**What this does:** Retrieves PrintRequests that have been in terminal states beyond their retention periods.

> **Note:** For Choice fields in SharePoint Online, use the field name directly (e.g., `Status eq 'Rejected'`). The `/Value` suffix is only needed for Lookup columns.

**UI steps:**

#### Action 1: Get Rejected Requests Past Retention
1. Click **+ New step**
2. **Search:** Type `Get items` → Select **Get items (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get Rejected Requests Past Retention`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Filter Query:** Build this in parts (do NOT paste as one string):
     1. Type: `Status eq 'Rejected' and LastActionAt lt '`
     2. Click **Dynamic content** → Select **Outputs** from `Calculate 1 Month Cutoff`
     3. Type: `'` (closing single quote)
   - **Top Count:** `100` (process in batches to avoid throttling)

> **⚠️ Important:** The date value must be wrapped in single quotes. The final filter should look like: `Status eq 'Rejected' and LastActionAt lt '[purple tag]'`

#### Action 2: Get Canceled Requests Past Retention
1. Click **+ New step**
2. **Search:** Type `Get items` → Select **Get items (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get Canceled Requests Past Retention`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Filter Query:** Build this in parts:
     1. Type: `Status eq 'Canceled' and LastActionAt lt '`
     2. Click **Dynamic content** → Select **Outputs** from `Calculate 1 Month Cutoff`
     3. Type: `'` (closing single quote)
   - **Top Count:** `100`

#### Action 3: Get Archived Requests Past Retention
1. Click **+ New step**
2. **Search:** Type `Get items` → Select **Get items (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get Archived Requests Past Retention`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Filter Query:** Build this in parts:
     1. Type: `Status eq 'Archived' and LastActionAt lt '`
     2. Click **Dynamic content** → Select **Outputs** from `Calculate 12 Month Cutoff`
     3. Type: `'` (closing single quote)
   - **Top Count:** `100`

**Test Step 4:** Save → Run flow manually → Check that Get items actions return expected results (may be empty if no items meet criteria)

---

### Step 5: Process Rejected Requests

**What this does:** For each rejected request past retention, deletes all associated AuditLog entries.

**UI steps:**

#### Action 1: Apply to Each Rejected Request
1. Click **+ New step**
2. **Search:** Type `Apply to each` → Select **Apply to each**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Process Each Rejected Request`
4. In **Select an output from previous steps:** Click **Dynamic content** → Select **value** from `Get Rejected Requests Past Retention`
5. **Configure concurrency:**
   - Click **three dots (…)** → **Settings**
   - **Concurrency Control:** Turn **On**
   - **Degree of Parallelism:** `1` (prevents SharePoint throttling)
   - Click **Done**

**Inside the Apply to each loop:**

#### Action 2: Get AuditLog Entries for This Request
1. Click **Add an action** (inside the loop)
2. **Search:** Type `Get items` → Select **Get items (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get AuditLog Entries for Rejected`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Filter Query:** Click **Expression** tab → Paste:
   ```
   concat('RequestID eq ', items('Process_Each_Rejected_Request')?['ID'])
   ```
   - Click **OK**
   - **Top Count:** `500` (a single request shouldn't have more than this)

#### Action 3: Delete Each AuditLog Entry
1. Click **Add an action** (inside the loop, after Get AuditLog)
2. **Search:** Type `Apply to each` → Select **Apply to each**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Delete Rejected Audit Entries`
4. In **Select an output:** Click **Dynamic content** → Select **value** from `Get AuditLog Entries for Rejected`
5. **Configure concurrency:**
   - Click **three dots (…)** → **Settings**
   - **Concurrency Control:** Turn **On**
   - **Degree of Parallelism:** `1`
   - Click **Done**

**Inside the nested Apply to each:**

6. Click **Add an action**
7. **Search:** Type `Delete item` → Select **Delete item (SharePoint)**
8. **Rename action:** Click **three dots (…)** → **Rename** → Type `Delete Rejected Audit Entry`
9. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
10. **Configure run after (continue on error):**
    - Click **three dots (…)** → **Configure run after**
    - Check all boxes: **is successful**, **has failed**, **is skipped**, **has timed out**
    - Click **Done**
11. Fill in:
    - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
    - **List Name:** `AuditLog`
    - **Id:** Click **Dynamic content** → Select **ID** from `Delete Rejected Audit Entries` (the current item in the inner loop)

#### Action 4: Increment Rejected Counter
1. Click **Add an action** (inside the nested loop, after Delete item)
2. **Search:** Type `Increment variable` → Select **Increment variable**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Increment Rejected Count`
4. Fill in:
   - **Name:** Select `RejectedCount`
   - **Value:** `1`

**Test Step 5:** Save → Run flow manually → Check that Rejected requests past retention have their AuditLog entries deleted and RejectedCount increments correctly

---

### Step 6: Process Canceled Requests

**What this does:** For each canceled request past retention, deletes all associated AuditLog entries.

**UI steps:**

#### Action 1: Apply to Each Canceled Request
1. Click **+ New step** (after the `Process Each Rejected Request` loop)
2. **Search:** Type `Apply to each` → Select **Apply to each**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Process Each Canceled Request`
4. In **Select an output from previous steps:** Click **Dynamic content** → Select **value** from `Get Canceled Requests Past Retention`
5. **Configure concurrency:**
   - Click **three dots (…)** → **Settings**
   - **Concurrency Control:** Turn **On**
   - **Degree of Parallelism:** `1` (prevents SharePoint throttling)
   - Click **Done**

**Inside the Apply to each loop:**

#### Action 2: Get AuditLog Entries for This Request
1. Click **Add an action** (inside the loop)
2. **Search:** Type `Get items` → Select **Get items (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get AuditLog Entries for Canceled`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Filter Query:** Click **Expression** tab → Paste:
   ```
   concat('RequestID eq ', items('Process_Each_Canceled_Request')?['ID'])
   ```
   - Click **OK**
   - **Top Count:** `500`

#### Action 3: Delete Each AuditLog Entry
1. Click **Add an action** (inside the loop, after Get AuditLog)
2. **Search:** Type `Apply to each` → Select **Apply to each**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Delete Canceled Audit Entries`
4. In **Select an output:** Click **Dynamic content** → Select **value** from `Get AuditLog Entries for Canceled`
5. **Configure concurrency:**
   - Click **three dots (…)** → **Settings**
   - **Concurrency Control:** Turn **On**
   - **Degree of Parallelism:** `1`
   - Click **Done**

**Inside the nested Apply to each:**

6. Click **Add an action**
7. **Search:** Type `Delete item` → Select **Delete item (SharePoint)**
8. **Rename action:** Click **three dots (…)** → **Rename** → Type `Delete Canceled Audit Entry`
9. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
10. **Configure run after (continue on error):**
    - Click **three dots (…)** → **Configure run after**
    - Check all boxes: **is successful**, **has failed**, **is skipped**, **has timed out**
    - Click **Done**
11. Fill in:
    - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
    - **List Name:** `AuditLog`
    - **Id:** Click **Dynamic content** → Select **ID** from `Delete Canceled Audit Entries` (the current item in the inner loop)

#### Action 4: Increment Canceled Counter
1. Click **Add an action** (inside the nested loop, after Delete item)
2. **Search:** Type `Increment variable` → Select **Increment variable**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Increment Canceled Count`
4. Fill in:
   - **Name:** Select `CanceledCount`
   - **Value:** `1`

**Test Step 6:** Save → Run flow manually → Check that Canceled requests past retention have their AuditLog entries deleted

---

### Step 7: Process Archived Requests

**What this does:** For each archived request past 12-month retention, deletes all associated AuditLog entries.

**UI steps:**

#### Action 1: Apply to Each Archived Request
1. Click **+ New step** (after the `Process Each Canceled Request` loop)
2. **Search:** Type `Apply to each` → Select **Apply to each**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Process Each Archived Request`
4. In **Select an output from previous steps:** Click **Dynamic content** → Select **value** from `Get Archived Requests Past Retention`
5. **Configure concurrency:**
   - Click **three dots (…)** → **Settings**
   - **Concurrency Control:** Turn **On**
   - **Degree of Parallelism:** `1` (prevents SharePoint throttling)
   - Click **Done**

**Inside the Apply to each loop:**

#### Action 2: Get AuditLog Entries for This Request
1. Click **Add an action** (inside the loop)
2. **Search:** Type `Get items` → Select **Get items (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get AuditLog Entries for Archived`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Filter Query:** Click **Expression** tab → Paste:
   ```
   concat('RequestID eq ', items('Process_Each_Archived_Request')?['ID'])
   ```
   - Click **OK**
   - **Top Count:** `500`

#### Action 3: Delete Each AuditLog Entry
1. Click **Add an action** (inside the loop, after Get AuditLog)
2. **Search:** Type `Apply to each` → Select **Apply to each**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Delete Archived Audit Entries`
4. In **Select an output:** Click **Dynamic content** → Select **value** from `Get AuditLog Entries for Archived`
5. **Configure concurrency:**
   - Click **three dots (…)** → **Settings**
   - **Concurrency Control:** Turn **On**
   - **Degree of Parallelism:** `1`
   - Click **Done**

**Inside the nested Apply to each:**

6. Click **Add an action**
7. **Search:** Type `Delete item` → Select **Delete item (SharePoint)**
8. **Rename action:** Click **three dots (…)** → **Rename** → Type `Delete Archived Audit Entry`
9. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
10. **Configure run after (continue on error):**
    - Click **three dots (…)** → **Configure run after**
    - Check all boxes: **is successful**, **has failed**, **is skipped**, **has timed out**
    - Click **Done**
11. Fill in:
    - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
    - **List Name:** `AuditLog`
    - **Id:** Click **Dynamic content** → Select **ID** from `Delete Archived Audit Entries` (the current item in the inner loop)

#### Action 4: Increment Archived Counter
1. Click **Add an action** (inside the nested loop, after Delete item)
2. **Search:** Type `Increment variable` → Select **Increment variable**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Increment Archived Count`
4. Fill in:
   - **Name:** Select `ArchivedCount`
   - **Value:** `1`

**Test Step 7:** Save → Run flow manually → Check that Archived requests past 12-month retention have their AuditLog entries deleted

---

### Step 8: Log Cleanup Summary

**What this does:** Creates a single AuditLog entry documenting what was cleaned up, for monitoring and troubleshooting.

**UI steps:**

#### Action 1: Calculate Total Deleted
1. Click **+ New step** (after all processing loops)
2. **Search:** Type `Compose` → Select **Compose**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Calculate Total Deleted`
4. In **Inputs**, click **Expression** tab (fx) → Paste:
```
add(add(variables('RejectedCount'), variables('CanceledCount')), variables('ArchivedCount'))
```
5. Click **OK**

#### Action 2: Create Cleanup Summary Log
1. Click **+ New step**
2. **Search:** Type `Create item` → Select **Create item (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Log Cleanup Summary`
4. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry policy:** Select **Exponential interval**
   - **Count:** `4`
   - **Interval:** `PT1M`
   - **Minimum interval:** `PT20S`
   - **Maximum interval:** `PT1H`
   - Click **Done**
5. Fill in ALL fields:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Audit Cleanup Run`
   - **RequestID:** Leave blank (not associated with a specific request)
   - **ReqKey:** Leave blank
   - **Action Value:** Type `System`
   - **FieldName:** Type `AuditLog`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Dynamic content** → Select **Outputs** from `Calculate Total Deleted`
   - **Actor Claims:** Leave blank
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate Scheduled`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Paste:
   ```
   concat('Weekly cleanup deleted ', outputs('Calculate_Total_Deleted'), ' audit entries (Rejected: ', variables('RejectedCount'), ', Canceled: ', variables('CanceledCount'), ', Archived: ', variables('ArchivedCount'), '). Retention: Rejected/Canceled=30 days, Archived=365 days.')
   ```

**Test Step 8:** Save → Run flow manually → Check AuditLog for "Audit Cleanup Run" entry with counts

---

## Complete Flow Structure

After completing all steps, your flow should look like this:

```
Recurrence (Weekly, Sunday 3 AM)
│
├── Calculate 1 Month Cutoff
├── Calculate 12 Month Cutoff
│
├── Initialize Rejected Counter
├── Initialize Canceled Counter
├── Initialize Archived Counter
│
├── Get Rejected Requests Past Retention
├── Get Canceled Requests Past Retention
├── Get Archived Requests Past Retention
│
├── Process Each Rejected Request
│   └── Get AuditLog Entries for Rejected
│       └── Delete Rejected Audit Entries
│           ├── Delete Rejected Audit Entry
│           └── Increment Rejected Count
│
├── Process Each Canceled Request
│   └── Get AuditLog Entries for Canceled
│       └── Delete Canceled Audit Entries
│           ├── Delete Canceled Audit Entry
│           └── Increment Canceled Count
│
├── Process Each Archived Request
│   └── Get AuditLog Entries for Archived
│       └── Delete Archived Audit Entries
│           ├── Delete Archived Audit Entry
│           └── Increment Archived Count
│
├── Calculate Total Deleted
└── Log Cleanup Summary
```

---

## Testing Checklist

### Initial Setup Testing
- [ ] Flow appears in "My flows" with clock icon
- [ ] Schedule shows "Runs weekly on Sunday at 3:00 AM"
- [ ] All variables initialize without errors

### Manual Test Run
- [ ] Run flow manually from "My flows" → **Run**
- [ ] Flow completes without errors (green checkmarks)
- [ ] Check AuditLog for "Audit Cleanup Run" entry
- [ ] Verify counts in Notes field are accurate

### Functional Testing
- [ ] Create a test PrintRequest with Status = "Rejected"
- [ ] Manually set `LastActionAt` to 35 days ago (via SharePoint list edit)
- [ ] Create associated AuditLog entries for that RequestID
- [ ] Run flow manually
- [ ] Verify AuditLog entries for that request are deleted
- [ ] Verify PrintRequest itself is NOT deleted
- [ ] Verify cleanup summary shows correct count

### Edge Cases
- [ ] No eligible items → Flow completes, summary shows 0 deleted
- [ ] Large batch (50+ requests) → Flow completes without throttling errors
- [ ] Mixed statuses → Only items past their specific retention are deleted

---

## Troubleshooting Guide

### Issue 1: Flow Fails with Throttling Errors

**Symptoms:**
- Flow fails with "429 Too Many Requests" error
- Partial deletions completed

**Fix:**
1. Reduce **Top Count** in Get items actions from 100 to 50
2. Verify **Degree of Parallelism** is set to `1` on all Apply to each loops
3. Add **Delay** action (5 seconds) between processing loops

---

### Issue 2: Filter Query Not Working

**Symptoms:**
- Get items returns all items instead of filtered results
- Error: "The query is not valid"

**Fix:**
1. For Choice fields, use direct syntax: `Status eq 'Rejected'` (NOT `Status/Value`)
2. Verify date is formatted without fractional seconds (use `formatDateTime` in Compose)
3. Ensure date value is wrapped in single quotes: `LastActionAt lt '2026-01-10T20:30:38Z'`
4. Test filter in SharePoint REST API directly:
   ```
   https://[site]/_api/web/lists/getbytitle('PrintRequests')/items?$filter=Status eq 'Rejected'
   ```

---

### Issue 3: AuditLog Entries Not Being Deleted

**Symptoms:**
- Flow completes successfully
- Counts show 0 deleted
- AuditLog entries still exist

**Fix:**
1. Verify `RequestID` in AuditLog matches `ID` in PrintRequests (both should be numbers)
2. Check filter expression: `concat('RequestID eq ', items('...')?['ID'])`
3. Manually verify in AuditLog that RequestID values exist for the target requests

---

### Issue 4: Summary Log Shows Wrong Counts

**Symptoms:**
- Counts don't match actual deletions
- Variables not incrementing

**Fix:**
1. Verify Increment variable actions are INSIDE the innermost Apply to each loop
2. Check that variable names match exactly: `RejectedCount`, `CanceledCount`, `ArchivedCount`
3. Verify run-after settings aren't skipping the increment on errors

---

## Maintenance Notes

### Adjusting Retention Periods

To change retention periods, update the Compose expressions:

| Period | Expression |
|--------|------------|
| 2 weeks | `formatDateTime(addDays(utcNow(), -14), 'yyyy-MM-ddTHH:mm:ssZ')` |
| 1 month | `formatDateTime(addDays(utcNow(), -30), 'yyyy-MM-ddTHH:mm:ssZ')` |
| 3 months | `formatDateTime(addDays(utcNow(), -90), 'yyyy-MM-ddTHH:mm:ssZ')` |
| 6 months | `formatDateTime(addDays(utcNow(), -180), 'yyyy-MM-ddTHH:mm:ssZ')` |
| 12 months | `formatDateTime(addDays(utcNow(), -365), 'yyyy-MM-ddTHH:mm:ssZ')` |

> **Note:** The `formatDateTime` wrapper is required because SharePoint OData filters reject timestamps with fractional seconds.

### Monitoring

Check the AuditLog periodically for "Audit Cleanup Run" entries to verify:
- Flow is running on schedule
- Expected number of entries being cleaned up
- No unexpected spikes (could indicate a problem)

### Manual Cleanup

If the flow hasn't run in a while and there's a large backlog:
1. Temporarily increase **Top Count** to 500
2. Run flow multiple times until counts stabilize at 0
3. Return **Top Count** to 100

---

## Key Features

- **Status-Specific Retention:** Different retention periods based on job outcome
- **Non-Destructive:** Only deletes AuditLog entries, not PrintRequest records
- **Self-Documenting:** Creates audit entry for each cleanup run
- **Throttle-Safe:** Concurrency controls prevent SharePoint throttling
- **Error-Resilient:** Continues processing even if individual deletions fail
- **Traceable:** FlowRunId in summary enables troubleshooting
