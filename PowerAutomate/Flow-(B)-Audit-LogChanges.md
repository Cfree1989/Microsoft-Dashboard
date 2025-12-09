# Flow B (PR-Audit)

**Full Name:** PR-Audit: Log changes + Email notifications  
**Trigger:** SharePoint — When an item is **created or modified** (List: `PrintRequests`)

**Purpose:** Whenever a request is modified, record which fields changed in `AuditLog`, send automated emails for key status changes, and detect student estimate confirmations.

---

## Prerequisites

### SharePoint Field: StudentConfirmed (Required for Estimate Approval Workflow)

**What this does:** Enables students to confirm cost estimates before printing begins, preventing surprise costs.

**Setup steps:**
1. Go to **SharePoint** → Your site → **PrintRequests** list
2. Click **Add column** → Select **Yes/No**
3. **Name:** `StudentConfirmed`
4. **Description:** `Student has confirmed the estimate and approved proceeding with print`
5. **Default value:** **No**
6. Click **Save**

**Verify:** Refresh list view → New "StudentConfirmed" column should appear with all items defaulted to "No"

### "My Requests" View Security

**What this does:** Ensures students can only see/edit their own requests for secure estimate confirmation.

**Setup steps:**
1. **PrintRequests list** → **⚙ Settings** → **List settings**
2. Under **General Settings** → **Advanced settings**
3. **Item-level Permissions:**
   - **Read access:** Select **Read items that were created by the user**
   - **Create and Edit access:** Select **Create items and edit items that were created by the user**
4. Click **OK**
5. Return to list → Create/verify **"My Requests" view** with filter: `Student = [Me]`

**Verify:** Test as student user → Should only see own requests in "My Requests" view

---

## Error Handling Configuration

**Configure retry policies on all critical actions:**
- **Retry Policy Type:** Exponential
- **Retry Count:** 4
- **Initial Interval:** 1 minute
- **Apply to:** Create item (AuditLog), Send email actions
- **Concurrency Control:** Set to 1 for strictly ordered audit logs

---

## Clean Rebuild Plan - Step-by-Step Implementation

**IMPORTANT:** Delete the existing broken Flow B completely before starting. This plan incorporates all lessons learned from debugging.

### Step 1: Flow Creation Setup

**What this does:** Creates the foundation flow with correct trigger configuration.

**UI steps:**
1. **Power Automate** → **My flows** → **Find existing "PR-Audit"** → **Delete** (if exists)
2. **Create** → **Automated cloud flow**
3. **Name:** Type `Flow B (PR-Audit)` or `PR-Audit: Log changes + Email notifications`
4. **Choose trigger:** **SharePoint – When an item is created or modified**
5. **Configure trigger:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
6. **Click Create**

**Test Step 1:** Save and verify trigger shows no errors → Should see flow in "My flows"

### Step 2: Add System Update Condition (CRITICAL - GET THIS RIGHT)

**What this does:** Prevents Flow B from running when system processes update items, avoiding infinite loops. This was the main issue causing audit logs to not appear.

**UI steps:**
1. **+ New step** → **Condition**
2. **Rename condition:** Click **three dots (…)** → **Rename** → Type `Skip if System Update`
3. **Configure condition:**
   - **Left box:** Click **Expression** → Type `triggerOutputs()?['body/LastActionBy']`
   - **Middle dropdown:** Select **is equal to**
   - **Right box:** Type `System` (just the word, no quotes)
   
**Yes Branch:** Leave completely empty (this skips processing when System updates)

**No Branch:** **All remaining steps will go here** - this processes user modifications only

**Test Step 2:** Save → Make any field change → Flow should run (we'll add debug logging next)

### Step 3: Add Foundation Debug Logging

**What this does:** Confirms the flow is running and processing correctly. This debug log will verify our System condition is working.

**UI steps (INSIDE THE "NO" BRANCH of Step 2):**
1. In the **No branch** of "Skip if System Update" → **+ Add an action**
2. **Search:** Type `Create item` → Select **Create item (SharePoint)**
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Debug Foundation Started`
4. **Fill in all fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `DEBUG: Flow B Processing Started`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Debug`
   - **FieldName:** Type `FlowStarted`
   - **NewValue:** Click **Expression** → Type `concat('Flow processing started at ', utcNow())`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate Debug`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('LastActionBy: ', triggerOutputs()?['body/LastActionBy'], ' | Processing user changes')`

**Test Step 3:** Save → Change any field → Check AuditLog for "DEBUG: Flow B Processing Started" entry

### Step 3a: CRITICAL - Verify SharePoint Internal Field Names (NEW)

**What this does:** Prevents the #1 most common Flow B bug - using wrong field names in expressions.

**⚠️ WHY THIS MATTERS:** SharePoint display names often differ from internal names (e.g., "EstimatedWeight" display = "EstWeight" internal). Using wrong names = null values = empty audit logs!

**Quick Verification Method:**
1. Go to SharePoint → PrintRequests → Settings → **List settings**
2. Under "Columns", click each field you're tracking (Status, Priority, Method, Color, Printer, EstimatedTime, EstimatedWeight, EstimatedCost, Notes)
3. Look at the URL: `Field=XXXXX`
4. **Document the internal names** - you'll need them for expressions

**PowerShell Method (Fastest):**
```powershell
pwsh ./SharePoint/Get-InternalFieldNames.ps1
```
This creates `PrintRequests_FieldNames.csv` with ALL field mappings.

**Use the checklist:** See `PowerAutomate/Field-Name-Verification-Checklist.md` for systematic verification.

**Test Step 3a:** Document all internal field names before proceeding to Step 4

### Step 4: Add Get Item Changes

**What this does:** Retrieves what fields changed since the flow started, essential for detecting which fields to log.

**UI steps (INSIDE THE "NO" BRANCH, after the debug action):**
1. In the **No branch** after "Debug Foundation Started" → **+ Add an action**
2. **Search:** Type `Get changes` → Select **Get changes for an item or a file (properties only)** (SharePoint)
3. **Rename action:** Click **three dots (…)** → **Rename** → Type `Get Item Changes`
4. **Fill in all fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **Since:** Click **Expression** → Type `triggerOutputs()?['body/{TriggerWindowStartToken}']`
   - **Include Minor Versions:** Set to **true** (catch all changes, major and minor versions)

*This action compares current item values to those at flow start time, enabling field change detection.*

**⚠️ Common Issues:** 
- If you see "id may not be null or empty" error, re-bind Site Address/List Name and use the exact expression above.
- If you see "sinceInput not specified" error, the Since field didn't bind correctly. Use the **Expression** format above, not Dynamic content.

**Test Step 4:** Save → Change any field → Should see no errors in flow run history

### Step 5: Add First Field Change Detector (Printer)

**What this does:** Tests field change detection with a single field (Printer) before adding all fields. This is the critical step that failed in the original flow.

**UI steps (INSIDE THE "NO" BRANCH, after "Get Item Changes"):**
1. After "Get Item Changes" → **+ Add an action**
2. **Search:** Type `Condition` → Select **Condition**
3. **Rename condition:** Click **three dots (…)** → **Rename** → Type `Check Printer Changed`
4. **Configure condition:**
   - **Left box:** Click **Dynamic content** → Under "Get Item Changes" section → Select **Has Column Changed: Printer**
   - **Middle dropdown:** Select **is equal to**
   - **Right box:** Type `true`

**In the YES branch (when Printer changed):**
5. **+ Add an action** → **Create item** (SharePoint)
6. **Rename action:** Click **three dots (…)** → **Rename** → Type `Log Printer Change`
7. **Fill in ALL fields (this is critical):**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Printer Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Field Change`
   - **FieldName:** Type `Printer`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `triggerOutputs()?['body/Printer']?['Value']`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('Printer updated to ', triggerOutputs()?['body/Printer']?['Value'])`

**In the NO branch:** Leave empty

**Test Step 5:** Save → Change ONLY the Printer field → Check AuditLog for "Printer Change" entry with correct NewValue

### Step 6: Add Remaining Field Change Detectors

**What this does:** Once Printer detection works, adds all other field change detectors. Each runs in parallel for efficient processing.

**⚠️ ONLY DO THIS STEP AFTER Step 5 is working perfectly.**

**UI steps (Add each as PARALLEL conditions at same level as "Check Printer Changed"):**

#### 6a: Add Status Change Detector (MOST IMPORTANT)

1. **+ Add an action** at same level as "Check Printer Changed" → **Condition**
2. **Rename:** Type `Check Status Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: Status** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`
4. **YES branch** → **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Type `Log Status Change`
6. **Fill in (use expressions to avoid "For Each" loops):**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Status Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Status Change`
   - **FieldName:** Type `Status`
   - **NewValue:** Click **Expression** → Type `triggerOutputs()?['body/Status']?['Value']`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('Status updated to ', triggerOutputs()?['body/Status']?['Value'])`

#### 6b: Add Remaining Field Detectors

**What this does:** Adds parallel field change detectors for Status, Method, Color, Priority, EstimatedTime, EstimatedWeight, EstimatedCost, and Notes. Each field gets its own condition and logging action.

**⚠️ CRITICAL: SharePoint Internal Field Names**
Some display names differ from internal field names. Always use internal names in expressions:
- **EstimatedWeight** display → `EstWeight` internal
- **EstimatedTime** display → `EstHours` internal  
- **EstimatedCost** → `EstimatedCost` (matches)

---

### Field Detector 1: Status (Most Important)

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check Status Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: Status** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**
4. **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Click **three dots (…)** → **Rename** → Type `Log Status Change`
6. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Status Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Status Change`
   - **FieldName:** Type `Status`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `triggerOutputs()?['body/Status']?['Value']`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('Status updated to ', triggerOutputs()?['body/Status']?['Value'])`

---

### Field Detector 2: Method

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check Method Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: Method** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**
4. **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Click **three dots (…)** → **Rename** → Type `Log Method Change`
6. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Method Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Field Change`
   - **FieldName:** Type `Method`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `triggerOutputs()?['body/Method']?['Value']`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('Method updated to ', triggerOutputs()?['body/Method']?['Value'])`

---

### Field Detector 3: Color

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check Color Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: Color** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**
4. **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Click **three dots (…)** → **Rename** → Type `Log Color Change`
6. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Color Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Field Change`
   - **FieldName:** Type `Color`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `triggerOutputs()?['body/Color']?['Value']`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('Color updated to ', triggerOutputs()?['body/Color']?['Value'])`

---

### Field Detector 4: Priority

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check Priority Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: Priority** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**
4. **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Click **three dots (…)** → **Rename** → Type `Log Priority Change`
6. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Priority Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Field Change`
   - **FieldName:** Type `Priority`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `triggerOutputs()?['body/Priority']?['Value']`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('Priority updated to ', triggerOutputs()?['body/Priority']?['Value'])`

---

### Field Detector 5: EstimatedTime (⚠️ Internal Name: `EstHours`)

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check EstimatedTime Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: EstimatedTime** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**
4. **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Click **three dots (…)** → **Rename** → Type `Log EstimatedTime Change`
6. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `EstimatedTime Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Field Change`
   - **FieldName:** Type `EstimatedTime`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `if(equals(triggerOutputs()?['body/EstHours'], null), '', string(triggerOutputs()?['body/EstHours']))`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('EstimatedTime updated to ', if(equals(triggerOutputs()?['body/EstHours'], null), 'empty', string(triggerOutputs()?['body/EstHours'])))`

**⚠️ Note:** Number fields require null-safe handling with `if(equals(..., null), '', string(...))` to prevent empty audit logs.

---

### Field Detector 6: EstimatedWeight (⚠️ Internal Name: `EstWeight`)

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check EstimatedWeight Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: EstimatedWeight** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**
4. **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Click **three dots (…)** → **Rename** → Type `Log EstimatedWeight Change`
6. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `EstimatedWeight Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Field Change`
   - **FieldName:** Type `EstimatedWeight`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `if(equals(triggerOutputs()?['body/EstWeight'], null), '', string(triggerOutputs()?['body/EstWeight']))`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('EstimatedWeight updated to ', if(equals(triggerOutputs()?['body/EstWeight'], null), 'empty', string(triggerOutputs()?['body/EstWeight'])))`

**⚠️ Note:** Number fields require null-safe handling with `if(equals(..., null), '', string(...))` to prevent empty audit logs.

---

### Field Detector 7: EstimatedCost

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check EstimatedCost Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: EstimatedCost** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**
4. **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Click **three dots (…)** → **Rename** → Type `Log EstimatedCost Change`
6. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `EstimatedCost Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Field Change`
   - **FieldName:** Type `EstimatedCost`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `if(equals(triggerOutputs()?['body/EstimatedCost'], null), '', string(triggerOutputs()?['body/EstimatedCost']))`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `concat('EstimatedCost updated to ', if(equals(triggerOutputs()?['body/EstimatedCost'], null), 'empty', string(triggerOutputs()?['body/EstimatedCost'])))`

**⚠️ Note:** Currency fields can be null and require null-safe handling with `if(equals(..., null), '', string(...))` to prevent empty audit logs.

---

### Field Detector 8: Notes

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check Notes Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: Notes** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**
4. **+ Add an action** → **Create item** (SharePoint)
5. **Rename:** Click **three dots (…)** → **Rename** → Type `Log Notes Change`
6. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Notes Change`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Field Change`
   - **FieldName:** Type `Notes`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `triggerOutputs()?['body/Notes']`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Modified By Claims']`
   - **ActorRole Value:** Type `Staff`
   - **ClientApp Value:** Type `SharePoint Form`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type `'Notes field updated'`

---

### Field Detector 9: StudentConfirmed (Estimate Approval)

**What this does:** Detects when students confirm their cost estimates and automatically updates status to "Ready to Print", preventing surprise costs.

**UI steps (at same level as "Check Printer Changed"):**
1. **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check StudentConfirmed Changed`
3. **Configure condition:**
   - **Left:** **Dynamic content** → **Has Column Changed: StudentConfirmed** (from Get Item Changes)
   - **Middle:** **is equal to**
   - **Right:** Type `true`

**In YES branch:**

**Action 1: Validate Confirmation Conditions**
1. **+ Add an action** → **Condition**
2. **Rename:** Type `Validate StudentConfirmed is Yes AND Status is Pending`
3. **Configure compound condition** (click "Add" → "Add row"):
   - **Row 1:**
     - **Left:** Click **Expression** → Type `triggerOutputs()?['body/StudentConfirmed']`
     - **Middle:** **is equal to**
     - **Right:** Type `true`
   - **AND** (not OR!)
   - **Row 2:**
     - **Left:** Click **Expression** → Type `triggerOutputs()?['body/Status']?['Value']`
     - **Middle:** **is equal to**
     - **Right:** Type `Pending`

**⚠️ CRITICAL:** The compound condition prevents infinite loops. The flow only updates when Status = "Pending", so subsequent triggers will fail the condition and skip processing.

**In YES branch (Confirmed = Yes AND Status = Pending):**

**Action 2: Update Status to Ready to Print**
1. **+ Add an action** → **Update item** (SharePoint)
2. **Rename:** Type `Update to Ready to Print`
3. **Configure retry policy:**
   - Click **three dots (…)** → **Settings**
   - **Retry Policy:** **On**
   - **Type:** **Exponential**
   - **Count:** **4**
   - **Minimum Interval:** **PT30S**
4. **Fill in fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **Status Value:** Type `Ready to Print`
   - **LastAction:** Type `Student Confirmed Estimate`
   - **LastActionBy Claims:** Click **Expression** → Type `triggerOutputs()?['body/Student']?['Claims']`
   - **LastActionAt:** Click **Expression** → Type `utcNow()`

**Action 3: Log Confirmation in AuditLog**
1. **+ Add an action** → **Create item** (SharePoint)
2. **Rename:** Type `Log Student Confirmation`
3. **Configure retry policy** (same as Action 2)
4. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Student Confirmed Estimate via SharePoint`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `triggerOutputs()?['body/ReqKey']`
   - **Action Value:** Type `Estimate Confirmed`
   - **FieldName:** Type `StudentConfirmed`
   - **OldValue:** Type `No`
   - **NewValue:** Type `Yes`
   - **Actor Claims:** Click **Expression** → Type `triggerOutputs()?['body/Student']?['Claims']`
   - **ActorRole Value:** Type `Student`
   - **ClientApp Value:** Type `SharePoint`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Click **Expression** → Type:
   ```
   concat('Student confirmed estimate via SharePoint for request ', triggerOutputs()?['body/ReqKey'], '. Status changed from Pending to Ready to Print.')
   ```

**Action 4: Send Confirmation Receipt to Student (Optional)**
1. **+ Add an action** → **Send an email from a shared mailbox (V2)**
2. **Rename:** Type `Send Confirmation Receipt to Student`
3. **Configure retry policy** (Exponential, Count 4, PT1M)
4. **Fill in:**
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** Click **Expression** → Type `triggerOutputs()?['body/StudentEmail']`
   - **Subject:** Click **Expression** → Type:
   ```
   concat('Estimate confirmed – ', triggerOutputs()?['body/ReqKey'], ' – Ready to print')
   ```
   - **Body:** Paste plain text below:
   ```
   Hi @{triggerOutputs()?['body/Student']?['DisplayName']},

   ✅ YOUR ESTIMATE HAS BEEN CONFIRMED SUCCESSFULLY!

   CONFIRMATION DETAILS:
   - Request: @{triggerOutputs()?['body/ReqKey']}
   - Status: Ready to Print
   - Confirmed: @{formatDateTime(utcNow(), 'MMM dd, yyyy h:mm tt')}

   WHAT HAPPENS NEXT:
   • Your request is now in our print queue
   • We'll begin preparing and printing your job
   • You'll receive another email when it's completed and ready for pickup
   • Payment will be due at pickup (TigerCASH only)

   IMPORTANT REMINDERS:
   • Print times are estimates and may vary
   • Final cost may differ slightly based on actual material used
   • Bring your student ID for pickup

   View My Requests:
   https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx

   If you have any questions, feel free to contact us!

   Thank you,
   LSU Digital Fabrication Lab

   Lab Hours: Monday-Friday 8:30 AM - 4:30 PM
   Email: coad-fablab@lsu.edu
   Location: Room 145 Atkinson Hall
   ```

**⚠️ Loop Warning:** Power Automate will show a circular loop warning because this action updates an item that triggers the flow. This is safe because:
- The compound condition only processes when Status = "Pending"
- After update, Status = "Ready to Print", so the condition fails on subsequent triggers
- Loop is prevented by the Status check

---

**Test Step 6:** Change each field individually → Verify audit entries created with correct FieldName and NewValue populated → Test StudentConfirmed: Change to "Yes" with Status = "Pending" → Verify Status updates to "Ready to Print" and audit log created

### Step 7: Add Status-Based Email Notifications (OPTIONAL)

**What this does:** Sends automated emails when status changes to specific values (Rejected, Pending, Completed).

**⚠️ ONLY DO THIS STEP AFTER all field detectors are working perfectly.**

**UI steps (INSIDE the "Check Status Changed" YES branch):**

---

#### 7a: Add Rejection Email Logic

**Action 1: Configure Retry Policy on Status Log**
1. **Find "Log Status Change" action** (from Step 6b, Field Detector 1) → Click **three dots (…)** → **Settings**
2. **Retry Policy:** Turn to **On**
   - **Type:** Select **Exponential**
   - **Count:** Type **4**
   - **Minimum Interval:** Type **PT1M**
3. **Click Done**

**Action 2: Add Rejection Condition**
1. **After "Log Status Change"** → **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check Status Rejected`
3. **Configure condition:**
   - **Left:** Click **Expression** → Type `triggerOutputs()?['body/Status']?['Value']`
   - **Middle:** **is equal to**
   - **Right:** Type `Rejected`

**In YES branch (Status = Rejected):**

**Action 3: Get Fresh Item Data**
1. **+ Add an action** → **Get item** (SharePoint)
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Get Current Rejected Data`
3. **Fill in:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** → Type `triggerOutputs()?['body/ID']`

**Action 4: Format Rejection Reasons**
1. **+ Add an action** → **Select** (Data Operations)
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Format Rejection Reasons`
3. **Fill in:**
   - **From:** Click **Expression** → Type `outputs('Get_Current_Rejected_Data')?['body/RejectionReason']`
   - **Map:** Click the **"Switch to text mode"** button (upper right of the Map field), then:
     - In the text box that appears, type: `@item()?['Value']`
4. **What this does:** Extracts just the readable text (`Value` property) from each selected rejection reason, removing the complex JSON object structure
5. **⚠️ Important:** Use text mode for the Map field. The default visual mode creates key-value pairs that produce unwanted JSON objects in your email. Text mode with `@item()?['Value']` creates a clean string array.

**Action 5: Compose Formatted Reasons Text**
1. **+ Add an action** → **Compose** (Data Operations)
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Compose Formatted Reasons Text`
3. **Inputs:** Click **Expression** → Type `join(body('Format_Rejection_Reasons'), '; ')`
4. **What this does:** Joins all rejection reasons with semicolons into readable text like "Reason 1; Reason 2; Reason 3"

**Action 6: Send Rejection Email**
1. **+ Add an action** → **Send an email from a shared mailbox (V2)**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Send Rejection Email`
3. **Configure retry policy** (same as Action 1: Exponential, Count 4, PT1M)
4. **Fill in:**
   - **Shared Mailbox:** Type `coad-fablab@lsu.edu`
   - **To:** Click **Expression** → Type `outputs('Get_Current_Rejected_Data')?['body/StudentEmail']`
   - **Subject:** Click **Expression** → Type `concat('Your 3D Print request has been rejected – ', outputs('Get_Current_Rejected_Data')?['body/ReqKey'])`
   - **Body:** Click **Code View button (`</>`)** at top right → Paste the HTML below:

```
Unfortunately, your 3D Print request has been rejected by our staff.

REQUEST DETAILS:
- Request: @{outputs('Get_Current_Rejected_Data')?['body/Title']} (@{outputs('Get_Current_Rejected_Data')?['body/ReqKey']})
- Method: @{outputs('Get_Current_Rejected_Data')?['body/Method']?['Value']}
- Printer Requested: @{outputs('Get_Current_Rejected_Data')?['body/Printer']?['Value']}

REASON FOR REJECTION:
@{outputs('Compose_Formatted_Reasons_Text')}

ADDITIONAL DETAILS:
@{outputs('Get_Current_Rejected_Data')?['body/Notes']}

NEXT STEPS:
• Review the specific rejection reason above
• Make necessary adjustments to your design or request
• Submit a new corrected request through the Fabrication Lab website
• Contact our staff if you have questions about this feedback

---
This is an automated message from the LSU Digital Fabrication Lab.
```

**⚠️ Troubleshooting:** If Power Automate adds a "For each" loop when you select fields, delete it and use the Code View method above with expressions.

**Action 7: Log Rejection Email Sent**
1. **+ Add an action** → **Create item** (SharePoint)
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Log Rejection Email Sent`
3. **Configure retry policy** (same as Action 1)
4. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Rejection`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `outputs('Get_Current_Rejected_Data')?['body/ReqKey']`
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `outputs('Get_Current_Rejected_Data')?['body/StudentEmail']`
   - **Actor Claims:** Leave blank (system action)
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Type `Rejection notification sent to student`

**Test Step 7a:** Change status to "Rejected" → Verify rejection email sent and logged in AuditLog

---

#### 7b: Add Pending (Estimate) Email Logic

**What this does:** When status changes to "Pending", sends cost estimate email to student with confirmation link.

**Action 1: Add Pending Condition**
1. **At the same level as "Check Status Rejected"** → **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check Status Pending`
3. **Configure condition:**
   - **Left:** Click **Expression** → Type `triggerOutputs()?['body/Status']?['Value']`
   - **Middle:** **is equal to**
   - **Right:** Type `Pending`

**In YES branch (Status = Pending):**

**Action 2: Get Fresh Item Data**
1. **+ Add an action** → **Get item** (SharePoint)
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Get Current Pending Data`
3. **Fill in:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** → Type `triggerOutputs()?['body/ID']`

**Action 3: Send Estimate Email**
1. **+ Add an action** → **Send an email from a shared mailbox (V2)**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Send Estimate Email`
3. **Configure retry policy** (Exponential, Count 4, PT1M)
4. **Fill in:**
   - **Shared Mailbox:** Type `coad-fablab@lsu.edu`
   - **To:** Click **Expression** → Type `outputs('Get_Current_Pending_Data')?['body/StudentEmail']`
   - **Subject:** Click **Expression** → Type `concat('Estimate ready for your 3D print – ', outputs('Get_Current_Pending_Data')?['body/ReqKey'])`
   - **Body:** Click **Code View button (`</>`)** → Paste the HTML below:

```
Hi @{outputs('Get_Current_Pending_Data')?['body/Student']?['DisplayName']},

Your 3D print estimate is ready! Before we start printing, please review and confirm the details below.

⚠️ WE WILL NOT RUN YOUR PRINT WITHOUT YOUR CONFIRMATION.

ESTIMATE DETAILS:
- Request: @{outputs('Get_Current_Pending_Data')?['body/ReqKey']}
- Estimated Cost: $@{if(equals(outputs('Get_Current_Pending_Data')?['body/EstimatedCost'], null), 'TBD', outputs('Get_Current_Pending_Data')?['body/EstimatedCost'])}
- Color: @{outputs('Get_Current_Pending_Data')?['body/Color']?['Value']}
- Print Time: @{if(equals(outputs('Get_Current_Pending_Data')?['body/EstHours'], null), 'TBD', concat(string(outputs('Get_Current_Pending_Data')?['body/EstHours']), ' hours'))}

TO CONFIRM THIS ESTIMATE:
1. Click the link below to view your request
2. Find the "StudentConfirmed" field
3. Change it from "No" to "Yes"
4. Click "Save" at the top

View and Confirm Your Request:
https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx

TIP: The link will open your requests in SharePoint. Your request should be at the top of the list.

If you have any questions or concerns about the estimate, please contact us before confirming.

Thank you,
LSU Digital Fabrication Lab

Lab Hours: Monday-Friday 8:30 AM - 4:30 PM
Email: coad-fablab@lsu.edu
Location: Room 145 Atkinson Hall

---
This is an automated message from the LSU Digital Fabrication Lab.
```

**✅ URL CONFIGURED:** The confirmation link now directs students to the "My Requests" SharePoint view where they can toggle the StudentConfirmed field to confirm their estimate. This approach:
- Uses SharePoint's built-in authentication (no HTTP trigger issues)
- Students only see their own requests (automatic security)
- No separate PR-Confirm flow needed (PR-Audit handles confirmation detection)
- More reliable and simpler than HTTP trigger approach

**📋 How it works:**
1. Student clicks link → Opens "My Requests" view in SharePoint
2. Student finds their request (should be at top with Status = "Pending")
3. Student changes StudentConfirmed from "No" to "Yes" → Clicks Save
4. PR-Audit flow detects the change → Updates Status to "Ready to Print" → Logs confirmation

**⚠️ Prerequisites:** Before using this email, ensure you've completed the setup in `PR-Confirm_EstimateApproval-SharePoint.md`:
- Added StudentConfirmed field to PrintRequests list
- Verified "My Requests" view security settings
- Added confirmation detection logic to PR-Audit flow (see Step 4 of SharePoint implementation guide)

**Action 4: Log Estimate Email Sent**
1. **+ Add an action** → **Create item** (SharePoint)
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Log Estimate Email Sent`
3. **Configure retry policy** (Exponential, Count 4, PT1M)
4. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Estimate`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `outputs('Get_Current_Pending_Data')?['body/ReqKey']`
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `outputs('Get_Current_Pending_Data')?['body/StudentEmail']`
   - **Actor Claims:** Leave blank (system action)
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Type `Estimate notification sent to student with confirmation link`

**Test Step 7b:** Change status to "Pending" → Verify estimate email sent with cost details and logged

---

#### 7c: Add Completed (Pickup) Email Logic

**What this does:** When status changes to "Completed", sends pickup notification email to student.

**Action 1: Add Completed Condition**
1. **At the same level as "Check Status Pending"** → **+ Add an action** → **Condition**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Check Status Completed`
3. **Configure condition:**
   - **Left:** Click **Expression** → Type `triggerOutputs()?['body/Status']?['Value']`
   - **Middle:** **is equal to**
   - **Right:** Type `Completed`

**In YES branch (Status = Completed):**

**Action 2: Get Fresh Item Data**
1. **+ Add an action** → **Get item** (SharePoint)
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Get Current Completed Data`
3. **Fill in:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** → Type `triggerOutputs()?['body/ID']`

**Action 3: Send Completion Email**
1. **+ Add an action** → **Send an email from a shared mailbox (V2)**
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Send Completion Email`
3. **Configure retry policy** (Exponential, Count 4, PT1M)
4. **Fill in:**
   - **Shared Mailbox:** Type `coad-fablab@lsu.edu`
   - **To:** Click **Expression** → Type `outputs('Get_Current_Completed_Data')?['body/StudentEmail']`
   - **Subject:** Click **Expression** → Type `concat('Your 3D print is ready for pickup – ', outputs('Get_Current_Completed_Data')?['body/ReqKey'])`
   - **Body:** Click **Code View button (`</>`)** → Paste the HTML below:

```
Your print is ready for pick up in the Fabrication Lab!

PICKUP INFORMATION:
📍 Location: Room 145 Atkinson Hall
💳 Payment: TigerCASH only
🕐 Lab Hours: Monday-Friday 8:30 AM - 4:30 PM

WHAT TO BRING:
• Your student ID
• TigerCASH for payment

Thank you,
LSU Digital Fabrication Lab

---
This is an automated message from the LSU Digital Fabrication Lab.
```

**Action 4: Log Completion Email Sent**
1. **+ Add an action** → **Create item** (SharePoint)
2. **Rename:** Click **three dots (…)** → **Rename** → Type `Log Completion Email Sent`
3. **Configure retry policy** (Exponential, Count 4, PT1M)
4. **Fill in ALL fields:**
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Completion`
   - **RequestID:** Click **Expression** → Type `triggerOutputs()?['body/ID']`
   - **ReqKey:** Click **Expression** → Type `outputs('Get_Current_Completed_Data')?['body/ReqKey']`
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **OldValue:** Leave blank
   - **NewValue:** Click **Expression** → Type `outputs('Get_Current_Completed_Data')?['body/StudentEmail']`
   - **Actor Claims:** Leave blank (system action)
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** Click **Expression** → Type `utcNow()`
   - **FlowRunId:** Click **Expression** → Type `workflow()['run']['name']`
   - **Notes:** Type `Completion notification sent to student`

**Test Step 7c:** Change status to "Completed" → Verify pickup email sent and logged

### Step 8: Clean Up and Final Testing

**What this does:** Removes debug logging and optimizes the flow for production use.

**UI steps:**
1. **Remove debug actions:**
   - Delete "Debug Foundation Started" action (from Step 3)
   - Keep all field change detectors and email logic

2. **Add retry policies to all Create item actions:**
   - Click **three dots (…)** → **Settings** → **Configure retry policy**
   - **Type:** Exponential, **Count:** 4, **Minimum Interval:** PT1M

3. **Configure trigger concurrency:**
   - Click on trigger → **three dots (…)** → **Settings**
   - **Concurrency control:** On, **Limit:** 1

**Final Testing Checklist:**
- [ ] Single field changes create correct audit entries
- [ ] Multiple field changes create multiple audit entries
- [ ] Status change to "Rejected" sends email (if implemented)
- [ ] No "For Each" loops appear in flow
- [ ] All expressions use correct syntax
- [ ] Flow runs without errors

**🎉 SUCCESS:** You now have a working Flow B with proper field change detection and audit logging!

---

## Key Improvements in This Clean Build

✅ **Correct System Condition** - Fixed double equals trap that blocked all processing  
✅ **Complete Audit Fields** - All Create item actions include RequestID, ReqKey, NewValue, Actor Claims  
✅ **Expression-Only Approach** - Avoids "For Each" loops that caused original flow issues  
✅ **Incremental Testing** - Test after each step to catch issues early  
✅ **Detailed Field Mapping** - Clear reference for Choice vs Number vs Text field expressions  
✅ **Systematic Troubleshooting** - Built-in debug steps and clear error patterns  

## Next Steps After Rebuild

1. **Start with Step 1** - Delete the broken flow and create fresh
2. **Follow each step exactly** - Don't skip testing between steps
3. **Stop at Step 6** for core functionality (field change detection)
4. **Add Step 7 only if emails needed** - Optional email notifications
5. **Complete Step 8** for production optimization

This systematic approach will give you a **reliable Flow B in 30-45 minutes** with proper testing at each stage.

---

## Advanced Implementation Notes

### Dynamic Content Sources

When building this flow, you'll see dynamic content available from multiple sources. It's critical to use the correct one for each situation:

1.  **"When an item is created or modified" (The Trigger)**
    - **Use for:** The initial **ID** of the item that was changed. Feed this ID into the "Get Item Changes" and "Get Current Item Data" actions.
    - **Avoid for:** Email content, as the data can be stale (see "Data Freshness" note).

2.  **"Get Item Changes"**
    - **Use for:** ONLY the **"Has Column Changed: [FieldName]"** boolean values. These are used inside `Condition` actions to check IF a field has been updated.
    - **Avoid for:** Any other purpose. Do not use its `Title`, `Status`, or other field values in emails or logging actions, as they may not be the most current.

3.  **"Get Current Item Data" (e.g., `Get Current Rejected Data`, `Get Current Pending Data`, etc.)**
    - **Use for:** This is the primary source for **all content that goes into emails** and most logging fields. Each email branch should have its own uniquely named "Get item" action to provide a fresh, up-to-the-moment snapshot of the item.
    - **Examples:** `Title`, `ReqKey`, `Method Value`, `RejectionReason Value`, `EstimatedCost`, `StudentEmail`.

### Email Content Data Freshness
Each email action includes a uniquely named **"Get item"** step (e.g., `Get Current Rejected Data`) immediately before sending to ensure the email contains the latest field values rather than potentially stale trigger data. This prevents race conditions where staff make final adjustments while the flow is running.

**Why this matters:** In the typical workflow, staff review the student's file and update technical parameters (printer, method, color, cost estimates) based on professional analysis. These updates may happen simultaneously with status changes, so using fresh data ensures the email reflects the staff's final decisions, not the student's original guesses.

### SharePoint Choice Field Values
**Important:** For SharePoint choice fields (like Status, Method, Priority, etc.), always use the **"[FieldName] Value"** option in conditions and expressions, not just "[FieldName]". 

- ✅ **Status Value** - gives you the text ("Rejected", "Pending", "Completed")  
- ❌ **Status** - gives you a complex object that won't work in text comparisons
- ✅ **Method Value** - gives you the text ("FDM", "SLA", "Multi Jet Fusion")
- ❌ **Method** - gives you a complex object

This applies to all choice fields throughout the flow.

### Person Field Resolution
If the **Actor** person field fails to resolve, use **Modified By Claims** from the trigger instead of trying to resolve email addresses manually.

### Infinite Loop Prevention
This flow uses the **Trigger Window Start Token** in the "Get changes" action, which compares current values to those at flow start time, preventing infinite loops when the flow updates SharePoint items.

### Email Customization
To customize the email templates:
1. Modify the HTML in the email body sections
2. Add conditional content using Power Automate expressions like:
   ```
   @{if(not(empty(triggerOutputs()?['body/EstimatedCost'])), concat('Cost: $', string(triggerOutputs()?['body/EstimatedCost'])), 'Cost: TBD')}
   ```
3. Update lab hours and contact information in the completion email

### Shared Mailbox Setup
**Preferred Email Action:** "Send an email from a shared mailbox (V2)"
- **Shared mailbox**: `coad-fablab@lsu.edu`
- Requires that the flow owner has "Send As" permissions on the shared mailbox

**Alternative (if shared mailbox unavailable):** "Send an email (V2)"
- Set Advanced option "From (Send as)" = `coad-fablab@lsu.edu`
- Requires "Send As" permission configured in Exchange Admin

**How to configure retry policy on any action:**
1. Click the **three dots (…)** on the action card
2. Choose **Settings**
3. Turn **Retry Policy** to **On**
4. Configure:
   - **Type:** Select **Exponential**
   - **Count:** Set to **4**
   - **Minimum Interval:** Type **PT1M** (ISO 8601 format for 1 minute)
5. Click **Done**

**ISO 8601 Duration Format Examples:**
- 30 seconds = **PT30S**
- 1 minute = **PT1M**
- 2 minutes = **PT2M**
- 90 seconds = **PT1M30S**

### Email Template Customization Points
Update these sections in the email templates for your lab:
- **Lab hours**: Currently set to "Monday-Friday 9AM-5PM, Saturday 10AM-2PM"
- **Lab location**: Currently "Design Building, Room 101"
- **Contact information**: Update any phone numbers or additional contact methods
- **Pickup procedures**: Modify payment and ID verification requirements

#### **Additional Status Email Conditions** (Optional Enhancement)

**Parallel Nested Condition: "Check Status = Ready to Print"**
- **Choose a value:** **Dynamic content** → **Status Value** (from trigger)
- **Condition:** is equal to
- **Choose a value:** `Ready to Print`
- **Yes Branch:** Send approval notification with cost estimates

**Parallel Nested Condition: "Check Status = Printing"**
- **Choose a value:** **Dynamic content** → **Status Value** (from trigger)
- **Condition:** is equal to
- **Choose a value:** `Printing`
- **Yes Branch:** Send "printing started" notification to keep students informed

// Attachments change detection removed for now (not required).

---

## Key Features Added

✅ **Complete Email Audit Logging** - All sent emails logged to AuditLog  
✅ **Enhanced Email Content** - Rich HTML with detailed information and cost estimates  
✅ **Comprehensive Field Tracking** - All important field changes logged  
✅ **Error Handling** - Exponential retry policies on all critical actions  
✅ **Concurrency Control** - Prevents race conditions in audit logging  
✅ **Dynamic Email Content** - Shows cost/time estimates when available  
✅ **Professional Communication** - Detailed pickup instructions and lab info  
✅ **Shared Mailbox Integration** - Consistent sender identity across all emails  
✅ **Customizable Templates** - Easy to update lab-specific information  

---

## Error Handling Notes

- **Concurrency Control:** Set to 1 to ensure audit logs are created in order
- **Retry Strategy:** Exponential backoff prevents overwhelming SharePoint
- **Email Delivery:** Uses shared mailbox for consistent sender identity
- **Field Resolution:** Handles empty/null values gracefully
- **Infinite Loop Prevention:** Uses Trigger Window Start Token

---

## Testing Checklist

### Field Change Detection
- [ ] Field changes create appropriate AuditLog entries
- [ ] All changed fields logged with correct FieldName and NewValue
- [ ] Method, Color, Priority, Printer, EstimatedTime, EstimatedWeight, EstimatedCost, Notes changes all detected

### Student Confirmation Testing
- [ ] StudentConfirmed field exists in SharePoint with default "No"
- [ ] "My Requests" view security configured (students see only own requests)
- [ ] Status change to "Pending" sends estimate email to student
- [ ] Estimate email contains SharePoint link to "My Requests" view
- [ ] Student can toggle StudentConfirmed from "No" to "Yes"
- [ ] StudentConfirmed = "Yes" + Status = "Pending" → Status updates to "Ready to Print"
- [ ] Confirmation creates audit log entry with Student actor
- [ ] Optional confirmation receipt email sent to student
- [ ] Loop prevention working: Second confirmation attempt (Status already "Ready to Print") does nothing
- [ ] Staff cannot see other students' requests in "My Requests" view

### Email Notifications
- [ ] Status change to "Rejected" sends rejection email + audit log
- [ ] Status change to "Pending" sends estimate email + audit log
- [ ] Status change to "Completed" sends pickup email + audit log
- [ ] Email audit entries include proper System actor and timestamps
- [ ] No duplicate emails sent during multi-field updates
- [ ] Cost estimates display correctly in emails
- [ ] **Email content freshness test:** Make simultaneous updates to printer/method/estimates while changing status - emails should show latest values, not original trigger values
- [ ] **RejectionReason field** appears correctly in rejection emails (both predefined choices and custom fill-in values)
- [ ] RejectionReason changes are logged to AuditLog when staff update rejection reasons
- [ ] Shared mailbox configuration working properly
- [ ] Email links resolve to correct SharePoint URLs
- [ ] Lab hours and location information accurate in emails

### Error Handling
- [ ] Retry policies trigger on simulated failures
- [ ] Flow handles null values gracefully (EstimatedWeight, EstimatedCost, etc.)
- [ ] System update condition prevents infinite loops
- [ ] StudentConfirmed compound condition prevents circular triggers

---

## Troubleshooting Guide

### Common Issues and Fixes

#### Issue 1: Flow B Triggering But No Audit Logs Created

**Symptoms:**
- Flow B appears in run history (green checkmarks)
- No field change entries in AuditLog (no "Priority Change", "Status Change" etc.)
- Debug logs show flow is triggering

**Root Causes:**
1. **System Update Condition Bug** (Most Common)
   - **Problem:** Condition has double equals: `equals(triggerOutputs()..., 'System') = 'True'`
   - **Fix:** Change to simple comparison: `triggerOutputs()?['body/LastActionBy']` equals `System`

2. **Get Item Changes Failing**
   - **Problem:** ID parameter not binding correctly after trigger changes
   - **Fix:** Re-bind Site Address/List Name, use expression `triggerOutputs()?['body/ID']` for ID

3. **Missing Critical Audit Fields**
   - **Problem:** Field change logs missing RequestID, ReqKey, NewValue, Actor Claims
   - **Fix:** Ensure all Create item actions include these expressions:
     ```
     RequestID: triggerOutputs()?['body/ID']
     ReqKey: triggerOutputs()?['body/ReqKey']
     NewValue: triggerOutputs()?['body/[FieldName]']
     Actor Claims: triggerOutputs()?['body/Modified By Claims']
     ```

#### Issue 2: "For Each" Loops Appearing Unexpectedly

**Symptoms:**
- Power Automate wraps actions in "Apply to each" loops automatically
- Debug actions or field references cause unwanted iterations

**Root Causes:**
- Using Dynamic Content with array data
- SharePoint Choice fields can trigger this behavior

**Fix:**
- Always use **Expressions** instead of Dynamic Content for single values
- For Choice fields, use `triggerOutputs()?['body/FieldName']?['Value']` format
- For debug logging, use simple expressions like `string(outputs('ActionName'))`

#### Issue 3: Field Change Detection Not Working

**Symptoms:**
- Conditions always evaluate to false
- "Has Column Changed" values are null or empty

**Root Causes:**
1. **Wrong field internal names** in conditions
2. **Get Item Changes action failing** silently
3. **Trigger Window Start Token missing** or corrupted

**Debugging Steps:**
1. Add debug logging (see Step 3a) to check `outputs('Get_Item_Changes')?['body/ColumnHasChanged/FieldName']`
2. Verify field internal names in SharePoint List Settings → Columns
3. Check that Trigger Window Start Token is bound correctly in Get Item Changes

#### Issue 4: Attachment Changes Not Logged

**Symptoms:**
- No "Attachment:" entries in AuditLog when files are added/removed

**Root Causes:**
- Attachment detection logic not implemented (Step 6)
- Null handling issues with trigger attachment data

**Fix:**
1. **Implement Step 6** attachment detection logic (see documentation)
2. **Use null-safe expressions:** `if(equals(triggerOutputs()?['body/Attachments'], null), 0, length(triggerOutputs()?['body/Attachments']))`

#### Issue 5: Email Template Errors

**Symptoms:**
- Emails not sending or contain blank fields
- Template validation errors in flow

**Root Causes:**
- Using Dynamic Content instead of Expressions in email body
- Action name mismatches in expressions (e.g., `Get_Current_Rejected_Data` vs actual name)

**Fix:**
1. **Use Code View (`</>`)** for email body, not rich text editor
2. **Verify action names** in expressions match exactly (spaces become underscores)
3. **Use expressions** like `outputs('Get_Current_Rejected_Data')?['body/FieldName']`

### Debug Mode Setup

**Step 1: Add Flow Trigger Debug**
```
Action: Create item (AuditLog)
Title: DEBUG: Flow B Triggered
NewValue: concat('Flow B started by ', triggerOutputs()?['body/Modified By Claims'])
Notes: concat('LastActionBy: ', triggerOutputs()?['body/LastActionBy'], ' | Status: ', triggerOutputs()?['body/Status'])
```

**Step 2: Add Field Change Debug**
```
Action: Create item (AuditLog)
Title: DEBUG: Field Change Check
NewValue: outputs('Get_Item_Changes')?['body/ColumnHasChanged/Printer']
Notes: concat('Printer HasChanged: ', string(outputs('Get_Item_Changes')?['body/ColumnHasChanged/Printer']))
```

**Step 3: Test Systematically**
1. Save flow with debug actions
2. Change one field at a time
3. Check AuditLog for debug entries
4. Remove debug actions once working

### Performance Optimization

**After troubleshooting is complete:**
- Remove all debug logging actions
- Ensure Concurrency Control = 1 on trigger
- Configure Retry Policies on all Create item actions
- Test with multiple simultaneous field changes