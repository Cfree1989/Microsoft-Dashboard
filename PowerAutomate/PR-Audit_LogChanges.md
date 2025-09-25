# Flow B — PR-Audit: Log changes + Email notifications

**Trigger:** SharePoint — When an item is **created or modified** (List: `PrintRequests`)

**Purpose:** Whenever a request is modified, record which fields changed in `AuditLog` and send automated emails for key status changes.

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
3. **Name:** Type `PR-Audit: Log changes + Email notifications`
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

#### 6b: Add Remaining Field Detectors (Template)

**Use this exact template for each remaining field. Add each as a parallel condition:**

**FOR CHOICE FIELDS (Method, Color, Priority):**
- **Has Column Changed:** [FieldName] (from Get Item Changes)
- **NewValue Expression:** `triggerOutputs()?['body/[FieldName]]?['Value']`
- **Notes Expression:** `concat('[FieldName] updated to ', triggerOutputs()?['body/[FieldName]]?['Value'])`

**FOR NUMBER FIELDS (EstHours, EstWeight, EstimatedCost):**
- **Has Column Changed:** [InternalFieldName] (from Get Item Changes)
- **NewValue Expression:** `triggerOutputs()?['body/[InternalFieldName]]`
- **Notes Expression:** `concat('[FieldName] updated to ', string(triggerOutputs()?['body/[InternalFieldName]]))`

**FOR TEXT FIELDS (Notes):**
- **Has Column Changed:** Notes (from Get Item Changes)
- **NewValue Expression:** `triggerOutputs()?['body/Notes']`
- **Notes Expression:** `'Notes field updated'`

**Field Mapping Reference:**
- Method: `Method` → `triggerOutputs()?['body/Method']?['Value']`
- Color: `Color` → `triggerOutputs()?['body/Color']?['Value']`
- Priority: `Priority` → `triggerOutputs()?['body/Priority']?['Value']`
- EstHours: `EstHours` → `triggerOutputs()?['body/EstHours']`
- EstWeight: `EstWeight` → `triggerOutputs()?['body/EstWeight']`
- EstimatedCost: `EstimatedCost` → `triggerOutputs()?['body/EstimatedCost']`
- Notes: `Notes` → `triggerOutputs()?['body/Notes']`

**Test Step 6:** Change each field individually → Verify audit entries created with correct FieldName and NewValue

### Step 7: Add Status-Based Email Notifications (OPTIONAL)

**What this does:** Sends automated emails when status changes to specific values (Rejected, Pending, Completed).

**⚠️ ONLY DO THIS STEP AFTER all field detectors are working perfectly.**

**UI steps (INSIDE the "Check Status Changed" YES branch):**

#### 7a: Add Rejection Email Logic

1. **In "Log Status Change" action (from Step 6a)** → Click **three dots (…)** → **Settings** → **Configure retry policy**
   - **Type:** Exponential
   - **Count:** 4  
   - **Minimum Interval:** PT1M

2. **After "Log Status Change"** → **+ Add an action** → **Condition**
3. **Rename:** Type `Check Status Rejected`
4. **Configure condition:**
   - **Left:** Click **Expression** → Type `triggerOutputs()?['body/Status']?['Value']`
   - **Middle:** **is equal to**
   - **Right:** Type `Rejected`

**In YES branch (Status = Rejected):**
5. **+ Add an action** → **Get item** (SharePoint) → **Rename:** `Get Current Rejected Data`
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** Click **Expression** → Type `triggerOutputs()?['body/ID']`

6. **+ Add an action** → **Send an email from a shared mailbox (V2)** → **Rename:** `Send Rejection Email`
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** Click **Expression** → Type `outputs('Get_Current_Rejected_Data')?['body/StudentEmail']`
   - **Subject:** Click **Expression** → Type `concat('Your 3D Print request has been rejected – ', outputs('Get_Current_Rejected_Data')?['body/ReqKey'])`
   - **Body:** Click **Code View (`</>`)** → Paste rejection email HTML template (from existing documentation)

7. **+ Add an action** → **Create item** (SharePoint) → **Rename:** `Log Rejection Email Sent`
   - Use same fields as other audit logs with Action Value = `Email Sent`

**Test Step 7a:** Change status to "Rejected" → Verify rejection email sent and logged

#### 7b: Add Pending and Completed Email Logic (Optional)

**Follow the same pattern as rejection emails for:**
- **Pending status** → Send estimate confirmation email
- **Completed status** → Send pickup notification email

**Use the existing email templates from the documentation sections below.**

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

## Reference Material (Keep for Implementation)

### Email Templates and Advanced Features

*The sections below contain detailed email templates, troubleshooting guides, and advanced implementation notes. Use these as reference when implementing Step 7 (emails) and beyond.*

**Action 2: Send rejection email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Rejection Email`
   - Click the **three dots (…)** → **Rename** → type `Send Rejection Email`
4. **Configure retry policy**
5. Fill in, using expressions from the **"Get Current Rejected Data"** action for all fields related to the request:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Expression** → `outputs('Get_Current_Rejected_Data')?['body/StudentEmail']`
   - **Subject:** **Expression** → `concat('Your 3D Print request has been rejected – ', outputs('Get_Current_Rejected_Data')?['body/ReqKey'])`
   - **Body:** Use expressions from **"Get Current Rejected Data"** (see HTML below) so no loop is added.

**Troubleshooting the "For each" Loop:**
If Power Automate automatically adds a "For each" loop when you select a Choice field (like RejectionReason), you must use an expression instead.
1. Delete the "For each" loop and the email action inside it.
2. Re-add the "Send email" action.
3. For the body, click the `</>` Code View button and paste the HTML below.
4. **Crucially**, ensure the action name in the expressions (e.g., `Get_Current_Rejected_Data`) exactly matches the name of your "Get item" action (with spaces replaced by underscores). Use the "Peek code" trick on a Compose action to find the exact name if you are unsure.

```html
<p>Unfortunately, your 3D Print request has been rejected by our staff.</p>
<p><strong>Request:</strong> @{outputs('Get_Current_Rejected_Data')?['body/Title']} (@{outputs('Get_Current_Rejected_Data')?['body/ReqKey']})</p>
<p><strong>Method:</strong> @{outputs('Get_Current_Rejected_Data')?['body/Method']?['Value']}</p>
<p><strong>Printer Requested:</strong> @{outputs('Get_Current_Rejected_Data')?['body/Printer']?['Value']}</p>
<br>
<p><strong>Reason for Rejection:</strong></p>
<p>@{outputs('Get_Current_Rejected_Data')?['body/RejectionReason']?['Value']}</p>
<p><strong>Additional Details:</strong> @{outputs('Get_Current_Rejected_Data')?['body/Notes']}</p>
<br>
<p><strong>Next Steps:</strong></p>
<ul>
  <li>Review the specific rejection reason above</li>
  <li>Make necessary adjustments to your design or request</li>
  <li>Submit a new corrected request through the Fabrication Lab website</li>
  <li>Contact our staff if you have questions about this feedback</li>
</ul>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**Action 3: Log rejection email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Rejection Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Rejection Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Rejection`
   - **RequestID:** **Dynamic content** → **ID** (from the trigger, "When an item is created or modified")
   - **ReqKey:** **Dynamic content** → **ReqKey** (from "Get Current Rejected Data")
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from "Get Current Rejected Data")
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Rejection notification sent to student`

#### Step 5b: Pending (Estimate) Email Logic

**UI steps (create parallel to the Rejection condition):**
1. Click **+ Add an action** at the same level as the Rejection condition
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Pending`
   - Click the **three dots (…)** → **Rename** → type `Check Status Pending`
4. Set up condition:
   - Left box: **Dynamic content** → **Status Value** (from trigger)
   - Middle: **is equal to**
   - Right box: Type `Pending`

##### Yes Branch - Send Estimate Email:

**Action 1: Get current item data**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get Current Pending Data`
   - Click the **three dots (…)** → **Rename** → type `Get Current Pending Data`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)

**Action 2: Send estimate email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Estimate Email`
   - Click the **three dots (…)** → **Rename** → type `Send Estimate Email`
4. **Configure retry policy**
5. Fill in, using expressions from the **"Get Current Pending Data"** action:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Expression** → `outputs('Get_Current_Pending_Data')?['body/StudentEmail']`
   - **Subject:** **Expression** → `concat('Estimate ready for your 3D print – ', outputs('Get_Current_Pending_Data')?['body/ReqKey'])`
   - **Body:** Use expressions from **"Get Current Pending Data"** (see HTML below).

**Troubleshooting the "For each" Loop:**
Follow the same troubleshooting steps as the Rejection Email. Use expressions in the Code View (`</>`) of the email body, making sure to replace `Get_Current_Pending_Data` with the exact name of your "Get item" action for this branch.

```html
<p>Good news! Your 3D print request has been reviewed and approved.</p>
<p><strong>Request:</strong> @{outputs('Get_Current_Pending_Data')?['body/Title']} (@{outputs('Get_Current_Pending_Data')?['body/ReqKey']})</p>
<p><strong>Method:</strong> @{outputs('Get_Current_Pending_Data')?['body/Method/Value']} (@{outputs('Get_Current_Pending_Data')?['body/Color/Value']})</p>
<p><strong>Printer:</strong> @{outputs('Get_Current_Pending_Data')?['body/Printer/Value']}</p>
<br>
<p><strong>COST ESTIMATE:</strong></p>
<ul>
  <li><strong>Estimated Weight:</strong> @{outputs('Get_Current_Pending_Data')?['body/EstWeight']}g</li>
  <li><strong>Estimated Print Time:</strong> @{outputs('Get_Current_Pending_Data')?['body/EstHours']} hours</li>
  <li><strong>Estimated Cost:</strong> $@{outputs('Get_Current_Pending_Data')?['body/EstimatedCost']}</li>
</ul>
<br>
<p><strong>Please confirm you want to proceed with this estimate:</strong></p>
<p><a href="https://prod-12.westus.logic.azure.com:443/workflows/12345678901234567890/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SIGNATURE&RequestID=@{triggerOutputs()?['body/ID']}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">✅ Yes, proceed with printing</a></p>
<p><em>By clicking this link, you authorize us to begin printing your request.</em></p>
<br>
<p><strong>Cost Details:</strong></p>
<ul>
  <li>Filament prints: $0.10 per gram (minimum $3.00)</li>
  <li>Resin prints: $0.20 per gram (minimum $3.00)</li>
  <li>Final cost may vary slightly based on actual material usage</li>
  <li>Payment due at pickup</li>
</ul>
<br>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}">View your request details</a></p>
<p><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx">View all your requests</a></p>
<br>
<p><em>This is an automated message from the LSU Digital Fabrication Lab.</em></p>
```

**Action 3: Log estimate email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Estimate Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Estimate Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Estimate`
   - **RequestID:** **Dynamic content** → **ID** (from the trigger, "When an item is created or modified")
   - **ReqKey:** **Dynamic content** → **ReqKey** (from "Get Current Pending Data")
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from "Get Current Pending Data")
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Estimate notification sent to student with confirmation link`

#### Step 5c: Completion Email Logic

**UI steps (create parallel to the Pending condition):**
1. Click **+ Add an action** at the same level as the Pending condition
2. Search for and select **Condition**
3. Rename the condition to: `Check Status Completed`
   - Click the **three dots (…)** → **Rename** → type `Check Status Completed`
4. Set up condition:
   - Left box: **Dynamic content** → **Status Value** (from trigger)
   - Middle: **is equal to**
   - Right box: Type `Completed`

##### Yes Branch - Send Completion Email:

**Action 1: Get current item data**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Get item** (SharePoint)
3. Rename the action to: `Get Current Completed Data`
   - Click the **three dots (…)** → **Rename** → type `Get Current Completed Data`
4. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `PrintRequests`
   - **Id:** **Dynamic content** → **ID** (from trigger)

**Action 2: Send completion email**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Send an email from a shared mailbox (V2)**
3. Rename the action to: `Send Completion Email`
   - Click the **three dots (…)** → **Rename** → type `Send Completion Email`
4. **Configure retry policy**
5. Fill in, using expressions from the **"Get Current Completed Data"** action:
   - **Shared Mailbox:** `coad-fablab@lsu.edu`
   - **To:** **Expression** → `outputs('Get_Current_Completed_Data')?['body/StudentEmail']`
   - **Subject:** **Expression** → `concat('Your 3D print is ready for pickup – ', outputs('Get_Current_Completed_Data')?['body/ReqKey'])`
   - **Body:** Use expressions from **"Get Current Completed Data"** (see HTML below):

```html
<p class="editor-paragraph">Your print is ready for pick up in the Fabrication Lab in room 145 Atkinson.

TigerCASH is the only form of payment in the lab.


Lab Hours:

M-F 8:30 – 4:30</p>

<p class="editor-paragraph"><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/DispForm.aspx?ID=@{triggerOutputs()?['body/ID']}" class="editor-link">View your request details</a></p>
<p class="editor-paragraph"><a href="https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab/Lists/PrintRequests/My%20Requests.aspx" class="editor-link">View all your requests</a>

</p>
<p class="editor-paragraph"><i><em class="editor-text-italic">This is an automated message from the LSU Digital Fabrication Lab.</em></i></p>
```

**Action 3: Log completion email sent**
1. Click **+ Add an action** in Yes branch
2. Search for and select **Create item** (SharePoint)
3. Rename the action to: `Log Completion Email Sent`
   - Click the **three dots (…)** → **Rename** → type `Log Completion Email Sent`
4. **Configure retry policy**
5. Fill in:
   - **Site Address:** `https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab`
   - **List Name:** `AuditLog`
   - **Title:** Type `Email Sent: Completion`
   - **RequestID:** **Dynamic content** → **ID** (from the trigger, "When an item is created or modified")
   - **ReqKey:** **Dynamic content** → **ReqKey** (from "Get Current Completed Data")
   - **Action Value:** Type `Email Sent`
   - **FieldName:** Type `StudentEmail`
   - **NewValue:** **Dynamic content** → **StudentEmail** (from "Get Current Completed Data")
   - **Actor Claims:** Leave blank for system
   - **ActorRole Value:** Type `System`
   - **ClientApp Value:** Type `Power Automate`
   - **ActionAt:** **Expression** → `utcNow()`
   - **FlowRunId:** **Expression** → `workflow()['run']['name']`
   - **Notes:** Type `Completion notification sent to student`

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
- **Shared mailbox**: `coad-Fabrication Lab@lsu.edu`
- Requires that the flow owner has "Send As" permissions on the shared mailbox

**Alternative (if shared mailbox unavailable):** "Send an email (V2)"
- Set Advanced option "From (Send as)" = `coad-Fabrication Lab@lsu.edu`
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

- [ ] Field changes create appropriate AuditLog entries
- [ ] Status change to "Rejected" sends rejection email + audit log
- [ ] Status change to "Completed" sends completion email + audit log  
- [ ] All changed fields logged with correct FieldName and NewValue
- [ ] Email audit entries include proper System actor and timestamps
- [ ] No duplicate emails sent during multi-field updates
- [ ] Retry policies trigger on simulated failures
- [ ] Cost estimates display correctly in completion emails
- [ ] **Email content freshness test:** Make simultaneous updates to printer/method/estimates while changing status - emails should show latest values, not original trigger values
- [ ] **RejectionReason field** appears correctly in rejection emails (both predefined choices and custom fill-in values)
- [ ] RejectionReason changes are logged to AuditLog when staff update rejection reasons
- [ ] Shared mailbox configuration working properly
- [ ] Email links resolve to correct SharePoint URLs
- [ ] Lab hours and location information accurate in emails

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
   - **Fix:** Re-bind Site Address/List Name, use expression `triggerBody()?['ID']` for ID

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

#### Issue 4: Attachment Count Not Updating

**Symptoms:**
- Attachments added/removed but AttachmentCount field doesn't change
- No "Attachment:" entries in AuditLog

**Root Causes:**
- AttachmentCount column missing from PrintRequests list
- Attachment detection logic not implemented (Step 6)
- Null handling issues with trigger attachment data

**Fix:**
1. **Add AttachmentCount column:** SharePoint → PrintRequests → Create Column → Number (default: 0)
2. **Implement Step 6** attachment detection logic (see documentation)
3. **Use null-safe expressions:** `if(equals(triggerOutputs()?['body/Attachments'], null), 0, length(triggerOutputs()?['body/Attachments']))`

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